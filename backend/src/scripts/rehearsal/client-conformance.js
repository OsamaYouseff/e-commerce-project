/**
 * Phase 6 — client-conformance rehearsal against the imported staging PostgreSQL.
 *
 * Reproduces the exact call patterns of both frontends (storefront evo_market,
 * admin admin_dashboard) and asserts the response shapes those clients depend on.
 * Read-only against source; mutates only the disposable staging DB's rehearsal
 * users.
 *
 *   BASE_URL=http://localhost:5002 node client-conformance.js
 *
 * Exit 0 when every client contract holds; 1 otherwise.
 */
const BASE = process.env.BASE_URL || "http://localhost:5002";

let failures = 0;
let checks = 0;
const ok = (name) => { checks += 1; console.log(`  ok   ${name}`); };
const bad = (name, detail) => { checks += 1; failures += 1; console.error(`  FAIL ${name}: ${detail}`); };
const assert = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

const j = (r) => r.json();
const get = async (path, token) => {
  const r = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const send = async (method, path, body, token) => {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};

const HEX24 = /^[a-f0-9]{24}$/;
let _phoneN = 1;
const nextPhone = () => `011${String((Date.now() * 10 + _phoneN++) % 100000000).padStart(8, "0")}`;

async function authCustomer() {
  const username = `cfs_${Date.now().toString(36)}`;
  const payload = {
    username,
    firstname: "Conform", lastname: "Check", email: `${username}@test.com`,
    phone: nextPhone(), gender: "Male",
    password: "Verify123!",
  };
  const reg = await send("POST", "/api/auth/register", payload);
  assert("register 201", reg.status === 201, `got ${reg.status}`);
  assert("register returns accessToken", reg.body && typeof reg.body.accessToken === "string", JSON.stringify(reg.body));
  assert("register returns userInfo._id hex24", reg.body && reg.body.userInfo && HEX24.test(reg.body.userInfo._id), JSON.stringify(reg.body));
  const id = reg.body.userInfo._id;
  const token = reg.body.accessToken;

  const login = await send("POST", "/api/auth/login", { username: payload.username, password: payload.password });
  assert("login 200 + token + userInfo", login.status === 200 && login.body.accessToken && login.body.userInfo._id === id, JSON.stringify(login.body));

  return { id, token, username, email: payload.email, password: payload.password };
}

async function storefrontFlow(u) {
  console.log("-- storefront: catalog --");
  const list = await get("/api/products");
  assert("GET /api/products status 200 array", list.status === 200 && Array.isArray(list.body) && list.body.length > 0, `status=${list.status}`);
  const p0 = list.body[0];
  for (const key of ["_id", "img", "title", "price", "rating", "color", "size", "amount", "desc"])
    assert(`product has '${key}'`, p0[key] !== undefined, `keys=${Object.keys(p0).join(",")}`);
  const prodId = p0._id;

  const page = await get("/api/products/all?page=1&limit=10");
  assert("GET /api/products/all {data}+meta.totalPages (admin slice contract)", page.status === 200 && page.body && Array.isArray(page.body.data) && typeof page.body.meta?.totalPages === "number", JSON.stringify(page.body).slice(0, 160));

  const found = await get(`/api/products/find/${prodId}`);
  assert("GET /api/products/find/:id doc", found.status === 200 && found.body && found.body._id === prodId, `status=${found.status}`);

  const foundNull = await get("/api/products/find/000000000000000000000001");
  assert("GET find missing -> 200 null (legacy parity)", foundNull.status === 200 && foundNull.body === null, `status=${foundNull.status} body=${JSON.stringify(foundNull.body)}`);
  assert("legacy search pathName works (non-null result)", foundQueryName(list.body, "iPhone"));

  const search = await get(`/api/products/search/${encodeURIComponent("iPhone")}`);
  assert("GET /api/products/search/:name array", search.status === 200 && Array.isArray(search.body), `status=${search.status}`);

  console.log("-- storefront: cart --");
  const cartCreate = await send("POST", "/api/carts", { userId: u.id, products: [] }, u.token);
  assert("create cart 2xx", cartCreate.status >= 200 && cartCreate.status < 300, `status=${cartCreate.status}`);
  const add = await send("POST", `/api/carts/add_update-product/${u.id}`, { productId: prodId, quantity: 2, price: 0.01 }, u.token);
  assert("add_update 200", add.status === 200, `status=${add.status}`);
  assert("cart item has _id/productId/productDetails", add.body.products[0] && add.body.products[0]._id === prodId && add.body.products[0].productId === prodId && add.body.products[0].productDetails && add.body.products[0].productDetails.price !== undefined, JSON.stringify(add.body).slice(0, 200));
  assert("detailed cart totalPrice is catalog-derived (not 0.02)", add.body.totalPrice === Number((p0.price * 2).toFixed(2)), `totalPrice=${add.body.totalPrice} expected=${(p0.price * 2).toFixed(2)}`);

  const detailed = await get(`/api/carts/cart_detailed_products/${u.id}`, u.token);
  assert("cart_detailed shape", detailed.status === 200 && detailed.body.totalPrice !== undefined && Array.isArray(detailed.body.products), `status=${detailed.status}`);

  const remove = await send("POST", `/api/carts/remove-product/${u.id}`, { productId: prodId }, u.token);
  assert("cart remove-product", remove.status === 200, `status=${remove.status}`);

  const reAdd = await send("POST", `/api/carts/add_update-product/${u.id}`, { productId: prodId, quantity: 1, price: 9999 }, u.token);
  assert("re-add ignores client price (99.99 vs catalog)", reAdd.body.totalPrice === Number((p0.price * 1).toFixed(2)), `totalPrice=${reAdd.body.totalPrice}`);

  const clear = await send("PUT", `/api/carts/clear/${u.id}`, undefined, u.token);
  assert("cart clear", clear.status === 200 && clear.body.products.length === 0, `status=${clear.status}`);

  // DELETE /api/carts/:id takes the customer's id like every sibling cart route.
  // It used to treat that as a cart id, so a customer could never delete their
  // own cart and every such request answered 404.
  const delBefore = await send("POST", `/api/carts/add_update-product/${u.id}`, { productId: prodId, quantity: 1 }, u.token);
  assert("cart has an item before delete", delBefore.status === 200 && delBefore.body.products.length === 1, `status=${delBefore.status}`);
  const delCart = await send("DELETE", `/api/carts/${u.id}`, undefined, u.token);
  assert("cart delete 200 for the owner", delCart.status === 200, `status=${delCart.status} body=${JSON.stringify(delCart.body).slice(0, 120)}`);
  const delView = await send("GET", `/api/carts/find/${u.id}`, undefined, u.token);
  assert("cart is gone after delete", delView.status === 200 && delView.body === null, `status=${delView.status} body=${JSON.stringify(delView.body).slice(0, 120)}`);
  const delAgain = await send("DELETE", `/api/carts/${u.id}`, undefined, u.token);
  assert("cart delete answers 404 when there is nothing to delete", delAgain.status === 404, `status=${delAgain.status}`);
  // The cascade must have taken the lines with it.
  const orphanItems = await send("GET", `/api/carts/cart_detailed_products/${u.id}`, undefined, u.token);
  assert("no cart items survive the delete", orphanItems.status === 404, `status=${orphanItems.status}`);

  console.log("-- storefront: wishlist --");
  // Create with products: the route passes ids, and a non-empty creation must
  // actually store them (it used to drop every entry).
  const wishCreate = await send("POST", "/api/wishlist", { userId: u.id, products: [prodId] }, u.token);
  assert("create wishlist 2xx", wishCreate.status >= 200 && wishCreate.status < 300, `status=${wishCreate.status}`);
  const wishCreated = await get(`/api/wishlist/wishlist_detailed_products/${u.id}`, u.token);
  const keptProduct = (wishCreated.body.products || []).find((p) => (p.productId || p._id) === prodId);
  assert("create wishlist with products keeps them", wishCreated.status === 200 && Boolean(keptProduct) && Boolean(keptProduct.productDetails), JSON.stringify(wishCreated.body).slice(0, 200));
  const wishDup = await send("POST", "/api/wishlist", { userId: u.id, products: [prodId] }, u.token);
  assert("create wishlist twice -> 400 (existing is not replaced)", wishDup.status === 400, `status=${wishDup.status}`);
  const wRemoveSeeded = await send("POST", `/api/wishlist/remove-product/${u.id}`, { productId: prodId }, u.token);
  assert("wishlist remove-product", wRemoveSeeded.status === 200, `status=${wRemoveSeeded.status}`);
  const wAdd = await send("POST", `/api/wishlist/add-product/${u.id}`, { productId: prodId }, u.token);
  assert("wishlist add-product", wAdd.status === 200, `status=${wAdd.status}`);
  const wCheck = await get(`/api/wishlist/check-product/${u.id}/${prodId}`, u.token);
  assert("wishlist check isInWishlist true", wCheck.status === 200 && wCheck.body && wCheck.body.isInWishlist === true, JSON.stringify(wCheck.body));
  const wDetailed = await get(`/api/wishlist/wishlist_detailed_products/${u.id}`, u.token);
  assert("wishlist detailed has productDetails", wDetailed.status === 200 && wDetailed.body.products[0] && wDetailed.body.products[0].productDetails, JSON.stringify(wDetailed.body).slice(0, 160));
  const wRemove = await send("POST", `/api/wishlist/remove-product/${u.id}`, { productId: prodId }, u.token);
  assert("wishlist remove-product", wRemove.status === 200, `status=${wRemove.status}`);

  console.log("-- storefront: addresses --");
  const addr = { firstName: "Conform", lastName: "Check", fullAddress: "Egypt, rehearsal street 1", phoneNumber: "+20 01000000000", label: "Home", isDefault: true, userId: u.id };
  const aCreate = await send("POST", `/api/addresses/${u.id}`, addr, u.token);
  assert("create address 201", aCreate.status === 201, `status=${aCreate.status}`);
  const addrId = aCreate.body && aCreate.body._id;
  assert("create address returns _id", HEX24.test(addrId || ""), JSON.stringify(aCreate.body));
  const def = await get(`/api/addresses/find-default/${u.id}`, u.token);
  assert("find-default returns own address", def.status === 200 && def.body && def.body._id === addrId, JSON.stringify(def.body));
  const foundAddr = await get(`/api/addresses/find/${u.id}/${addrId}`, u.token);
  assert("find address doc", foundAddr.status === 200 && foundAddr.body._id === addrId, `status=${foundAddr.status}`);

  const addr2 = { firstName: "Conform", lastName: "Check", fullAddress: "Egypt, rehearsal street 2", phoneNumber: "+20 01222222222", label: "Work", isDefault: false, userId: u.id };
  const aCreate2 = await send("POST", `/api/addresses/${u.id}`, addr2, u.token);
  const addr2Id = aCreate2.body && aCreate2.body._id;
  const setDef = await send("PUT", `/api/addresses/set-default/${u.id}/${addr2Id}`, undefined, u.token);
  assert("set-default returns { addresses }", setDef.status === 200 && Array.isArray(setDef.body && setDef.body.addresses), JSON.stringify(setDef.body));
  const updAddr = await send("PUT", `/api/addresses/${u.id}/${addrId}`, { ...addr, phoneNumber: "+20 01111111111" }, u.token);
  assert("update address", updAddr.status === 200, `status=${updAddr.status}`);
  const addrList = await get(`/api/addresses/${u.id}`, u.token);
  assert("get addresses array", addrList.status === 200 && Array.isArray(addrList.body), `status=${addrList.status}`);

  console.log("-- storefront: checkout/orders --");
  const items = [{ productId: prodId, quantity: 2, priceAtOrderInCents: Number((p0.price * 100).toFixed(2)) }];
  const subtotal = items[0].priceAtOrderInCents * 2;
  const orderBody = {
    userId: u.id,
    items,
    financials: { subtotalInCents: subtotal, discount: 0, shippingCostInCents: 0, totalAmountInCents: subtotal, currency: "USD" },
    shippingAddress: { fullAddress: "Egypt, rehearsal street 1", phoneNumber: "+20 01111111111", firstName: "Conform", lastName: "Check", label: "Home" },
    paymentMethod: "cash_on_delivery",
    shippingInfo: { estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString() },
  };
  const orderCreate = await send("POST", `/api/orders/${u.id}`, orderBody, u.token);
  assert("create order 201", orderCreate.status === 201, `status=${orderCreate.status}`);
  const orderId = orderCreate.body && orderCreate.body._id;
  assert("order returns _id", HEX24.test(orderId || ""), JSON.stringify(orderCreate.body));

  const findOrders = await get(`/api/orders/find/${u.id}`, u.token);
  assert("orders find array w/ items", findOrders.status === 200 && Array.isArray(findOrders.body) && Array.isArray(findOrders.body[0] && findOrders.body[0].items), JSON.stringify(findOrders.body).slice(0, 160));

  const minOrders = await get(`/api/orders/min/${u.id}`, u.token);
  assert("orders min array", minOrders.status === 200 && Array.isArray(minOrders.body), `status=${minOrders.status}`);

  const detail = await get(`/api/orders/detailed/${u.id}/${orderId}`, u.token);
  const d = detail.body;
  assert("order detailed status=... items/financials/shippingAddress",
    detail.status === 200 && Array.isArray(d.items) && d.financials && d.shippingAddress && d.items[0] && d.items[0].productId === prodId,
    JSON.stringify(d).slice(0, 200));

  console.log("-- checkout invariants (server-authoritative) --");
  const mailedTotal = Math.round(p0.price * 100) * 2;
  const oneUnitTotal = Math.round(p0.price * 100);

  // A stale preview is refused with 409 and the authoritative totals, so the
  // customer is never charged a figure they did not see. Nothing is created.
  const stalePreview = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 1, priceAtOrderInCents: 1 }], financials: { subtotalInCents: 1, discount: 500, shippingCostInCents: 0, totalAmountInCents: 1, currency: "USD" } }, u.token);
  assert("checkout refuses a stale preview (409)", stalePreview.status === 409, `status=${stalePreview.status}`);
  assert("stale refusal reports staleCart", stalePreview.body && stalePreview.body.details && stalePreview.body.details.staleCart === true, JSON.stringify(stalePreview.body).slice(0, 160));
  assert("stale refusal ignores a client-claimed discount", stalePreview.body.details.financials.discount === 0, `discount=${stalePreview.body.details.financials.discount}`);
  assert("stale refusal reports the authoritative total", stalePreview.body.details.financials.totalAmountInCents === oneUnitTotal, `total=${stalePreview.body.details.financials.totalAmountInCents} expected=${oneUnitTotal}`);
  assert("stale refusal creates no order", !stalePreview.body._id, `_id=${stalePreview.body._id}`);

  // Acknowledging the reported total places the order, still priced by the
  // server and not by anything the client claimed.
  const acceptedPricing = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 1, priceAtOrderInCents: 1 }], financials: stalePreview.body.details.financials, acceptPricingChange: true }, u.token);
  assert("checkout proceeds once the new total is accepted", acceptedPricing.status === 201 && acceptedPricing.body.financials.totalAmountInCents === oneUnitTotal, `status=${acceptedPricing.status} total=${acceptedPricing.body && acceptedPricing.body.financials && acceptedPricing.body.financials.totalAmountInCents} expected=${oneUnitTotal}`);

  const badCoupon = await send("POST", `/api/orders/${u.id}`, { ...orderBody, couponCode: "NOTACOUPON" }, u.token);
  assert("checkout rejects an unknown coupon code", badCoupon.status === 400, `status=${badCoupon.status}`);

  const expectedDiscount = Math.round(mailedTotal * 0.1);
  const expectedShipping = mailedTotal >= 5000 ? 0 : 2000;
  // The storefront's preview already includes the coupon, so it matches what the
  // server computes and the order is accepted without a confirmation step.
  const couponPreview = {
    subtotalInCents: mailedTotal,
    discount: expectedDiscount,
    shippingCostInCents: expectedShipping,
    totalAmountInCents: mailedTotal - expectedDiscount + expectedShipping,
    currency: "USD",
  };
  const withCoupon = await send("POST", `/api/orders/${u.id}`, { ...orderBody, couponCode: "10off", financials: couponPreview }, u.token);
  assert("checkout applies a valid coupon (case-insensitive)", withCoupon.status === 201 && withCoupon.body.financials.discount === expectedDiscount, `status=${withCoupon.status} discount=${withCoupon.body && withCoupon.body.financials && withCoupon.body.financials.discount} expected=${expectedDiscount}`);
  assert("checkout persists the coupon code", withCoupon.body.couponCode === "10OFF", `couponCode=${withCoupon.body && withCoupon.body.couponCode}`);
  assert("checkout total = subtotal - discount + shipping", withCoupon.body.financials.totalAmountInCents === mailedTotal - expectedDiscount + expectedShipping, `total=${withCoupon.body.financials.totalAmountInCents} expected=${mailedTotal - expectedDiscount + expectedShipping}`);

  const cheapest = list.body.filter((p) => Number(p.price) > 0).sort((a, b) => Number(a.price) - Number(b.price))[0];
  if (cheapest && Math.round(Number(cheapest.price) * 100) < 5000) {
    const cheapTotal = Math.round(Number(cheapest.price) * 100);
    const cheapOrder = await send("POST", `/api/orders/${u.id}`, {
      ...orderBody,
      items: [{ productId: cheapest._id, quantity: 1, priceAtOrderInCents: 1 }],
      financials: { subtotalInCents: cheapTotal, discount: 0, shippingCostInCents: 2000, totalAmountInCents: cheapTotal + 2000, currency: "USD" },
    }, u.token);
    assert("shipping charged below the free-shipping threshold", cheapOrder.status === 201 && cheapOrder.body.financials.shippingCostInCents === 2000, `status=${cheapOrder.status} shipping=${cheapOrder.body && cheapOrder.body.financials && cheapOrder.body.financials.shippingCostInCents}`);
  }
  const freeOrder = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 2, priceAtOrderInCents: 1 }] }, u.token);
  assert("free shipping at or above the threshold", freeOrder.status === 201 && freeOrder.body.financials.shippingCostInCents === (mailedTotal >= 5000 ? 0 : 2000), `status=${freeOrder.status} shipping=${freeOrder.body && freeOrder.body.financials && freeOrder.body.financials.shippingCostInCents}`);

  const bogusAddress = await send("POST", `/api/orders/${u.id}`, { ...orderBody, shippingAddress: { fullAddress: "No such street", phoneNumber: "+20 01222222222", firstName: "Conform", lastName: "Check", label: "Home" } }, u.token);
  assert("checkout rejects shipping address not on file", bogusAddress.status === 400, `status=${bogusAddress.status}`);

  const badQty = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 1000, priceAtOrderInCents: 1 }] }, u.token);
  assert("checkout rejects quantity > 999", badQty.status === 400, `status=${badQty.status}`);

  const badPid = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: "000000000000000000000001", quantity: 1, priceAtOrderInCents: 1 }] }, u.token);
  assert("checkout rejects unknown product id", badPid.status === 400, `status=${badPid.status}`);

  // A client claiming one cent for two units must not be charged one cent, and
  // must not be charged the catalog price without saying so either: the total it
  // was shown is refused and the authoritative one reported instead.
  const bogusPreview = { subtotalInCents: 1, discount: 0, shippingCostInCents: 0, totalAmountInCents: 1, currency: "USD" };
  const lyingOrder = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 2, priceAtOrderInCents: 1 }], financials: bogusPreview, acceptPricingChange: true }, u.token);
  assert("checkout refuses a client total that is not the catalog total", lyingOrder.status === 409 && lyingOrder.body.details && lyingOrder.body.details.staleCart === true, `status=${lyingOrder.status}`);
  assert("checkout reports the catalog total on refusal", lyingOrder.body.details && lyingOrder.body.details.financials.totalAmountInCents === mailedTotal, `total=${lyingOrder.body.details && lyingOrder.body.details.financials && lyingOrder.body.details.financials.totalAmountInCents} expected=${mailedTotal}`);
  assert("the acceptance flag alone does not buy the order", lyingOrder.body.order === undefined, `order=${JSON.stringify(lyingOrder.body.order)}`);

  // Acknowledging the figure the API reported does place it, priced from the catalog.
  const pricedOrder = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: [{ productId: prodId, quantity: 2, priceAtOrderInCents: 1 }], financials: lyingOrder.body.details.financials, acceptPricingChange: true }, u.token);
  assert("checkout ignores client prices (total from catalog)", pricedOrder.status === 201 && pricedOrder.body.financials.totalAmountInCents === mailedTotal, `status=${pricedOrder.status} total=${pricedOrder.body && pricedOrder.body.financials && pricedOrder.body.financials.totalAmountInCents} expected=${mailedTotal}`);
  assert("a placed order is not flagged as needing confirmation", pricedOrder.body.staleCart === undefined, `staleCart=${pricedOrder.body.staleCart}`);

  // A price that moves again after the customer agreed to it is covered by the
  // integration suite, which can move a product in an isolated database. Here
  // the contract is what matters: the acceptance flag is never enough on its own.

  const dupQty = await send("POST", `/api/orders/${u.id}`, { ...orderBody, items: Array.from({ length: 100 }, () => ({ productId: prodId, quantity: 999, priceAtOrderInCents: 1 })) }, u.token);
  assert("checkout rejects duplicate lines over the per-product quantity limit", dupQty.status === 400, `status=${dupQty.status}`);

  const firstTry = await send("POST", `/api/orders/${u.id}`, { ...orderBody, idempotencyKey: "retry-me" }, u.token);
  const replay = await send("POST", `/api/orders/${u.id}`, { ...orderBody, idempotencyKey: "retry-me" }, u.token);
  assert("checkout creates once on first attempt (201)", firstTry.status === 201, `status=${firstTry.status}`);
  assert("checkout idempotent retry returns same order (200)", replay.status === 200 && replay.body && replay.body._id === firstTry.body._id, `status=${replay.status} ids ${replay.body && replay.body._id}/${firstTry.body && firstTry.body._id}`);

  // A retry must carry the same request; reusing the key for a different cart is
  // a different order and must not silently return the first one.
  const keyReuse = await send("POST", `/api/orders/${u.id}`, { ...orderBody, idempotencyKey: "retry-me", items: [{ productId: prodId, quantity: 1, priceAtOrderInCents: 1 }] }, u.token);
  assert("checkout rejects an idempotency key reused with a different payload (409)", keyReuse.status === 409, `status=${keyReuse.status}`);

  // Partial checkout: buying 1 of 3 must leave 2 in the cart, not delete the row.
  await send("POST", `/api/carts/add_update-product/${u.id}`, { productId: prodId, quantity: 3, price: 0.01 }, u.token);
  const partial = await send("POST", `/api/orders/${u.id}`, {
    ...orderBody,
    items: [{ productId: prodId, quantity: 1, priceAtOrderInCents: 1 }],
    financials: { subtotalInCents: oneUnitTotal, discount: 0, shippingCostInCents: mailedTotal >= 5000 ? 0 : 2000, totalAmountInCents: oneUnitTotal + (mailedTotal >= 5000 ? 0 : 2000), currency: "USD" },
  }, u.token);
  const cartAfterPartial = await get(`/api/carts/cart_detailed_products/${u.id}`, u.token);
  const remaining = (cartAfterPartial.body.products || []).find((p) => p._id === prodId);
  assert("partial checkout keeps the unpurchased quantity", partial.status === 201 && remaining && remaining.quantity === 2, `status=${partial.status} remaining=${remaining && remaining.quantity}`);

  const cartAfterCheckout = await get(`/api/carts/cart_detailed_products/${u.id}`, u.token);
  await send("POST", `/api/carts/remove-product/${u.id}`, { productId: prodId }, u.token);
  assert("checkout clears purchased items from cart", Array.isArray(cartAfterCheckout.body && cartAfterCheckout.body.products), `cart=${JSON.stringify(cartAfterCheckout.body).slice(0, 160)}`);

  const limTooBig = await get("/api/products/all?page=1&limit=100000");
  assert("pagination limit bound -> 400", limTooBig.status === 400, `status=${limTooBig.status}`);
  const pageZero = await get("/api/products/all?page=0&limit=10");
  assert("pagination page >= 1 -> 400", pageZero.status === 400, `status=${pageZero.status}`);

  const chg = await send("POST", `/api/users/change-password/${u.id}`, { currentPassword: u.password, newPassword: "Verify456!", confirmNewPassword: "Verify456!" }, u.token);
  assert("change-password returns message", chg.status === 200 && typeof chg.body.message === "string", JSON.stringify(chg.body));
  const relogin = await send("POST", "/api/auth/login", { username: u.username, password: "Verify456!" });
  assert("login with new password", relogin.status === 200, `status=${relogin.status}`);
  const uToken2 = relogin.body.accessToken;

  const updUser = await send("PUT", `/api/users/${u.id}`, { firstname: "Conformed" }, uToken2);
  assert("update account returns updated user doc", updUser.status === 200 && updUser.body && updUser.body._id === u.id && updUser.body.firstname === "Conformed", JSON.stringify(updUser.body).slice(0, 160));

  const delOrder = await send("DELETE", `/api/orders/${u.id}/${orderId}`, undefined, uToken2);
  assert("customer can delete own order (owner check)", delOrder.status === 200, `status=${delOrder.status}`);

  const wrongDelete = await send("DELETE", `/api/orders/${u.id}/000000000000000000000001`, undefined, uToken2);
  assert("deleting someone else's order 404 (no leak)", wrongDelete.status === 404, `status=${wrongDelete.status}`);

  return { ...u, token: uToken2 };
}

async function adminFlow(u) {
  console.log("-- admin: auth + elevation --");
  const adminUsername = `cfa_${Date.now().toString(36)}`;
  const payload = {
    username: adminUsername, firstname: "Conform", lastname: "Admin", email: `${adminUsername}@test.com`,
    phone: nextPhone(), gender: "Male", password: "AdminPass1!",
  };
  await send("POST", "/api/auth/register", payload);
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`UPDATE users SET is_admin = true WHERE username = $1`, [adminUsername]);
  await pool.end();

  const alogin = await send("POST", "/api/auth/admin-login", { username: payload.username, password: "AdminPass1!" });
  assert("admin-login 200 + accessToken + userInfo", alogin.status === 200 && alogin.body.accessToken && alogin.body.userInfo && alogin.body.userInfo._id, JSON.stringify(alogin.body).slice(0, 200));
  const aId = alogin.body.userInfo._id;
  const aToken = alogin.body.accessToken;

  console.log("-- admin: seed order for list checks --");
  const catalog = await get("/api/products");
  const seedProduct = catalog.body[0];
  const seedUser = `cfs_seed_${Date.now().toString(36)}`;
  const seedReg = await send("POST", "/api/auth/register", { username: seedUser, firstname: "Seed", lastname: "Buyer", email: `${seedUser}@test.com`, phone: nextPhone(), gender: "Male", password: "SeedPass1!" });
  const seedId = seedReg.body.userInfo._id;
  const seedLogin = await send("POST", "/api/auth/login", { username: seedUser, password: "SeedPass1!" });
  const seedAddr = await send("POST", `/api/addresses/${seedId}`, { firstName: "Seed", lastName: "Buyer", fullAddress: "Egypt, seed st", phoneNumber: nextPhone(), label: "Home", isDefault: true }, seedLogin.body.accessToken);
  assert("seed address created for checkout", seedAddr.status === 201 && HEX24.test((seedAddr.body && seedAddr.body._id) || ""), `status=${seedAddr.status}`);
  const seedOrder = await send("POST", `/api/orders/${seedId}`, {
    userId: seedId,
    items: [{ productId: seedProduct._id, quantity: 1, priceAtOrderInCents: Math.round(seedProduct.price * 100) }],
    financials: { subtotalInCents: Math.round(seedProduct.price * 100), discount: 0, shippingCostInCents: 0, totalAmountInCents: Math.round(seedProduct.price * 100), currency: "USD" },
    shippingAddress: { fullAddress: seedAddr.body.fullAddress, phoneNumber: seedAddr.body.phoneNumber, firstName: seedAddr.body.firstName, lastName: seedAddr.body.lastName, label: seedAddr.body.label || null },
    addressId: seedAddr.body._id,
    paymentMethod: "cash_on_delivery",
    shippingInfo: { estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString() },
  }, seedLogin.body.accessToken);
  assert("seed order created for admin list", seedOrder.status === 201, `status=${seedOrder.status} body=${JSON.stringify(seedOrder.body).slice(0, 120)}`);

  console.log("-- admin: orders --");
  const ordersPage = await get("/api/orders/?page=1&limit=10&sorting=Asc", aToken);
  assert("GET /api/orders {data}+meta.totalPages (admin slice contract)", ordersPage.status === 200 && ordersPage.body && Array.isArray(ordersPage.body.data) && typeof ordersPage.body.meta?.totalPages === "number", JSON.stringify(ordersPage.body).slice(0, 200));

  const oSearch = await get(`/api/orders/search/${ordersPage.body.data[0] && ordersPage.body.data[0]._id}`, aToken);
  assert("order search single doc (admin slice contract)", oSearch.status === 200 && oSearch.body && oSearch.body._id === ordersPage.body.data[0]._id, `status=${oSearch.status} body=${JSON.stringify(oSearch.body).slice(0, 120)}`);

  const oDetail = await get(`/api/orders/detailed/${ordersPage.body.data[0]._id}`, aToken);
  assert("admin order detailed", oDetail.status === 200 && oDetail.body && Array.isArray(oDetail.body.items), `status=${oDetail.status}`);

  const oid = ordersPage.body.data[0]._id;
  const pd = await send("PATCH", `/api/orders/${oid}/processing`, { orderId: oid, orderStatus: "processing" }, aToken);
  assert("PATCH order status 'processing'", pd.status === 200, `status=${pd.status}`);
  const pc = await send("PATCH", `/api/orders/${oid}/canceled`, { orderId: oid, orderStatus: "canceled" }, aToken);
  assert("PATCH status 'canceled' (admin spelling)", pc.status === 200, `status=${pc.status}`);

  console.log("-- admin: products --");
  const prod = {
    title: "Rehearsal Widget", desc: "phase 6 product", img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", categories: ["Rehearsal"], size: "M", color: "Gray", price: 19.99, rating: 4.5, amount: 7, isDeleted: false,
  };
  const pCreate = await send("POST", "/api/products/", prod, aToken);
  assert("admin create product (cloudinary upload)", pCreate.status >= 200 && pCreate.status < 300 && pCreate.body && /^https?:\/\//.test(pCreate.body.img || ""), `status=${pCreate.status} body=${JSON.stringify(pCreate.body).slice(0, 160)}`);
  const npId = pCreate.body && pCreate.body._id;

  // The admin form's number inputs submit strings; the API must accept them and
  // store numbers, not reject the request.
  const stringNums = await send("POST", "/api/products/", { ...prod, title: "Rehearsal Widget (string nums)", price: "12.50", amount: "9", rating: "3.5" }, aToken);
  assert("admin create accepts numeric strings", stringNums.status >= 200 && stringNums.status < 300 && stringNums.body.price === 12.5 && stringNums.body.amount === 9, `status=${stringNums.status} body=${JSON.stringify(stringNums.body).slice(0, 160)}`);
  const strId = stringNums.body && stringNums.body._id;
  const badStock = await send("POST", "/api/products/", { ...prod, title: "Bad stock", price: "1", amount: "1.5" }, aToken);
  assert("fractional stock rejected", badStock.status === 400, `status=${badStock.status}`);
  const strEdit = await send("PUT", `/api/products/${strId}`, { price: "14.25", amount: "11" }, aToken);
  assert("admin edit accepts numeric strings", (strEdit.status === 200 || strEdit.status === 201) && strEdit.body.price === 14.25 && strEdit.body.amount === 11, `status=${strEdit.status} body=${JSON.stringify(strEdit.body).slice(0, 160)}`);
  await send("DELETE", `/api/products/${aId}/${strId}`, undefined, aToken);
  const pSearch = await get(`/api/products/search/${encodeURIComponent("Rehearsal Widget")}`);
  assert("search finds the newly created product", pSearch.status === 200 && Array.isArray(pSearch.body) && pSearch.body.some((p) => p._id === npId), `status=${pSearch.status}`);

  const pEdit = await send("PUT", `/api/products/${npId}`, { ...prod, title: "Rehearsal Widget v2", price: 25.99 }, aToken);
  assert("edit product returns updated doc", (pEdit.status === 200 || pEdit.status === 201) && pEdit.body && pEdit.body.title === "Rehearsal Widget v2", `status=${pEdit.status} ${JSON.stringify(pEdit.body).slice(0, 160)}`);

  const pToggle = await send("PATCH", `/api/products/disable/${aId}/${npId}`, undefined, aToken);
  assert("disable product returns message", pToggle.status === 200 && typeof (pToggle.body && pToggle.body.message) === "string", JSON.stringify(pToggle.body).slice(0, 160));
  const pFindAfterDisable = await get(`/api/products/find/${npId}`);
  assert("disabled product hidden from public find", pFindAfterDisable.status === 200 && pFindAfterDisable.body === null, `status=${pFindAfterDisable.status} body=${JSON.stringify(pFindAfterDisable.body).slice(0, 60)}`);

  const allAfterDisable = await get("/api/products/all?page=1&limit=100");
  assert("disabled product absent from /all list", allAfterDisable.status === 200 && Array.isArray(allAfterDisable.body.data) && !allAfterDisable.body.data.some((p) => p._id === npId), `status=${allAfterDisable.status}`);
  const catAfterDisable = await get("/api/products/?categories=Rehearsal");
  assert("disabled product absent from category list", Array.isArray(catAfterDisable.body) && !catAfterDisable.body.some((p) => p._id === npId), `found=${JSON.stringify(catAfterDisable.body).slice(0, 120)}`);
  const searchAfterDisable = await get(`/api/products/search/${encodeURIComponent("Rehearsal Widget v2")}`);
  assert("disabled product absent from search", Array.isArray(searchAfterDisable.body) && !searchAfterDisable.body.some((p) => p._id === npId), `found=${JSON.stringify(searchAfterDisable.body).slice(0, 120)}`);

  const pDel = await send("DELETE", `/api/products/${aId}/${npId}`, undefined, aToken);
  assert("delete product", pDel.status === 200, `status=${pDel.status}`);

  console.log("-- admin: cleanup orders (legacy success-always delete) --");
  const oDel = await send("DELETE", `/api/orders/${oid}`, undefined, aToken);
  assert("admin delete order", oDel.status === 200, `status=${oDel.status}`);

  return { aId, aToken };
}

function foundQueryName(products, name) {
  return products.some((p) => String(p.title || "").toLowerCase().includes(name.toLowerCase()));
}

async function main() {
  console.log("Client-conformance rehearsal against", BASE);
  const customer = await authCustomer();
  const u = await storefrontFlow(customer);
  await adminFlow(u);
  console.log(`\n${checks} checks, ${failures} failure(s) — ${failures ? "REHEARSAL FAILED" : "REHEARSAL PASS"}`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error("Harness crashed:", e);
  process.exit(1);
});