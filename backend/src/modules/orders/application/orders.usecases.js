const crypto = require("crypto");
const ordersRepository = require("../infrastructure/orders.repository");
const cartsRepository = require("../../carts/infrastructure/carts.repository");
const addressesRepository = require("../../addresses/infrastructure/addresses.repository");
const { withTransaction } = require("../../../shared/database/transaction");
const { generateId, isObjectId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");
const { computeTotals, requestFingerprint } = require("./checkout-pricing");

const VALID_STATUSES = ["pending", "processing", "delivered", "canceled"];
// Orders in these states still hold reserved inventory. Cancelling one returns
// its units to stock; a delivered order has consumed them and is not eligible.
const STOCK_HOLDING_STATUSES = ["pending", "processing"];
// Reopening a canceled order into any of these states — including a direct move
// to delivered — must take its units back, or the order would be fulfilled with
// inventory that cancellation already returned.
const STOCK_CONSUMING_STATUSES = ["pending", "processing", "delivered"];
const PAYMENT_METHODS = ["cash_on_delivery"];
const MAX_CHECKOUT_ITEMS = 100;
const MAX_QUANTITY = 999;

const checkoutIdFor = (userId, idempotencyKey) =>
  crypto.createHash("sha256").update(`${userId}|${idempotencyKey}`).digest("hex").slice(0, 24);

/** Shares the carts module key so checkout and cart edits serialize. */
const lockUserCart = (client, userId) =>
  client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`cart:${userId}`]);

const resolveShippingAddress = async (body, userId, client) => {
  if (body.addressId) {
    const address = await addressesRepository.findForUserById(userId, body.addressId, client);
    if (!address) throw ApiError.badRequest("Shipping address is not on file");
    return address;
  }
  const sa = body.shippingAddress;
  if (!sa || !sa.fullAddress || !sa.phoneNumber || !sa.firstName || !sa.lastName) {
    throw ApiError.badRequest("Shipping address is required");
  }
  const owned = await addressesRepository.findByUser(userId, client);
  const match = owned.find(
    (a) =>
      a.fullAddress === sa.fullAddress &&
      a.phoneNumber === sa.phoneNumber &&
      a.firstName === sa.firstName &&
      a.lastName === sa.lastName &&
      (sa.label == null || a.label === (sa.label || null)),
  );
  if (!match) throw ApiError.badRequest("Shipping address is not on file");
  return match;
};

const createOrder = async ({ userId, body }) => {
  const paymentMethod = body.paymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw ApiError.badRequest("Unsupported payment method");
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) throw ApiError.badRequest("Order must contain at least one item");
  if (rawItems.length > MAX_CHECKOUT_ITEMS) throw ApiError.badRequest("Too many order items");

  const quantities = new Map();
  for (const item of rawItems) {
    const pid = item && item.productId;
    if (!isObjectId(pid)) throw ApiError.badRequest("Invalid product id");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      throw ApiError.badRequest("Invalid quantity");
    }
    quantities.set(pid, (quantities.get(pid) || 0) + item.quantity);
  }
  // The per-line check above runs before aggregation, so repeated lines for one
  // product summed to a quantity no single line could carry: 100 lines of 999
  // became one persisted line of 99,900. The limit is per product, so it has to
  // be enforced on the aggregated figure.
  for (const [pid, quantity] of quantities) {
    if (quantity > MAX_QUANTITY) throw ApiError.badRequest("Invalid quantity");
  }
  const productIds = [...quantities.keys()];

  const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : null;
  const id = idempotencyKey ? checkoutIdFor(userId, idempotencyKey) : generateId();
  const fingerprint = requestFingerprint({ userId, body, quantities });

  return withTransaction(async (client) => {
    // Retry of an already-accepted checkout: return the stored order before
    // re-validating mutable catalog/address state, otherwise a retry could fail
    // after a product was disabled or the address was removed.
    if (idempotencyKey) {
      const prior = await ordersRepository.findById(id, client);
      if (prior) {
        if (prior.userId !== userId) throw ApiError.conflict("Order already exists");
        if (prior.requestFingerprint && prior.requestFingerprint !== fingerprint) {
          throw ApiError.conflict("Idempotency key was already used with a different order payload");
        }
        return { created: false, order: prior };
      }
    }

    const products = await ordersRepository.getProductsForCheckout(productIds, client);
    const unavailable = productIds.filter((id) => !products.has(id) || products.get(id).isDeleted);
    if (unavailable.length > 0) throw ApiError.badRequest("Some products are unavailable");

    const shippingAddress = await resolveShippingAddress(body, userId, client);

    const itemRows = [];
    let subtotal = 0;
    for (const [productId, quantity] of quantities) {
      const product = products.get(productId);
      const priceAtOrderInCents = Math.round(Number(product.price) * 100);
      itemRows.push({
        productId,
        title: product.title,
        img: product.img,
        quantity,
        priceAtOrderInCents,
      });
      subtotal += quantity * priceAtOrderInCents;
    }

    const totals = computeTotals({ subtotalInCents: subtotal, couponCode: body.couponCode });

    // The cart may have changed since the storefront calculated these values.
    // Totals are always recomputed server-side; the client's figure is only
    // compared. A mismatch means the customer is about to be shown one total and
    // charged another, so nothing is written until they have acknowledged *this*
    // figure. Nothing above this point has written, so throwing here rolls back
    // without side effects.
    //
    // The check is unconditional, including on an `acceptPricingChange` retry:
    // that flag carries no authority of its own, it only accompanies a total the
    // customer has already agreed to. Skipping the comparison whenever the flag
    // was set would let a price that moved again after the confirmation be
    // charged without asking, which is the bug this replaced. The retry sends the
    // confirmed totals, so they match and the order is created; if the price moved
    // again they no longer match and the customer is asked once more, with the
    // same idempotency key so no second order can result.
    const claimedTotal = body.financials && body.financials.totalAmountInCents;
    const staleCart = claimedTotal !== undefined && Number(claimedTotal) !== totals.totalAmountInCents;
    if (staleCart) {
      throw ApiError.conflict("Order pricing changed", {
        details: {
          staleCart: true,
          financials: {
            subtotalInCents: totals.subtotalInCents,
            discount: totals.discount,
            shippingCostInCents: totals.shippingCostInCents,
            totalAmountInCents: totals.totalAmountInCents,
            currency: totals.currency,
          },
        },
      });
    }

    const estimatedDeliveryDate =
      body.shippingInfo && body.shippingInfo.estimatedDeliveryDate ? body.shippingInfo.estimatedDeliveryDate : null;

    const created = await ordersRepository.create(
      {
        id,
        userId,
        requestFingerprint: fingerprint,
        body: {
          financials: {
            subtotalInCents: totals.subtotalInCents,
            discount: totals.discount,
            shippingCostInCents: totals.shippingCostInCents,
            totalAmountInCents: totals.totalAmountInCents,
            currency: totals.currency,
          },
          couponCode: totals.couponCode,
          shippingAddress: {
            fullAddress: shippingAddress.fullAddress,
            phoneNumber: shippingAddress.phoneNumber,
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            label: shippingAddress.label,
          },
          shippingInfo: { trackingNumber: null, estimatedDeliveryDate },
          status: "pending",
          paymentMethod,
        },
        itemRows,
      },
      client,
    );

    if (!created) {
      const existing = await ordersRepository.findById(id, client);
      if (!existing || existing.userId !== userId) throw ApiError.conflict("Order already exists");
      // Two requests sharing a key can both pass the lookup above before either
      // inserts, so the loser lands here with an order it never created. It has
      // to be compared exactly like the lookup does: returning it unconditionally
      // would hand a 200 for a different cart, address, coupon or payment method.
      if (existing.requestFingerprint && existing.requestFingerprint !== fingerprint) {
        throw ApiError.conflict("Idempotency key was already used with a different order payload");
      }
      return { created: false, order: existing };
    }

    // Reserve inventory now that this request is known to be the creator. A
    // request sharing the idempotency key took the `!created` path above and
    // must not decrement a second time, so the reservation is placed after the
    // insert rather than before the lookup.
    //
    // The decrement is conditional inside a single UPDATE, so concurrent
    // checkouts for the last unit serialize on the product row rather than both
    // reading the same remaining count. A failure rolls the order back with it,
    // because throwing here aborts the transaction.
    const outOfStock = await ordersRepository.decrementStock(
      itemRows.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      client,
    );
    if (outOfStock.length > 0) {
      throw ApiError.badRequest("Some items do not have enough stock", {
        details: { outOfStock },
      });
    }

    // Removing purchased items touches the same cart as the add/update requests,
    // so take the per-user cart lock first to keep the two from interleaving.
    await lockUserCart(client, userId);
    await cartsRepository.removePurchasedItems(userId, quantities, client);

    return {
      created: true,
      // A successful response is always an order the customer confirmed: a
      // stale total is refused above rather than reported after the fact, so
      // there is no `staleCart` flag to set here any more.
      order: created,
    };
  });
};

const setOrderStatus = async ({ orderId, status }) => {
  if (!VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest("Invalid order status");
  }
  return withTransaction(async (client) => {
    // Lock the row so two concurrent status changes for this order serialize;
    // that locked read is what lets the second cancel see the status the first
    // already wrote and avoid returning the same units twice.
    const order = await ordersRepository.findByIdForUpdate(orderId, client);
    if (!order) throw ApiError.notFound("Order not found");

    const heldStock = STOCK_HOLDING_STATUSES.includes(order.status);
    const willConsumeStock = STOCK_CONSUMING_STATUSES.includes(status);
    if (heldStock && status === "canceled") {
      // Leaving a stock-holding state for canceled returns its reservation.
      await ordersRepository.restoreStock(order.items, client);
    } else if (order.status === "canceled" && willConsumeStock) {
      // Reopening a canceled order — to pending, processing or straight to
      // delivered — must take its units back, or the order would be fulfilled
      // with inventory cancellation already returned. Refuse if they are gone.
      const outOfStock = await ordersRepository.decrementStock(order.items, client);
      if (outOfStock.length > 0) {
        throw ApiError.badRequest("Some items do not have enough stock", { details: { outOfStock } });
      }
    }

    const updated = await ordersRepository.setStatus(orderId, status, client);
    if (!updated) throw ApiError.notFound("Order not found");
    return updated;
  });
};

const deleteOrder = async ({ orderId, userId, isAdmin, strict = true }) => {
  return withTransaction(async (client) => {
    // Lock before reading the status so a delete cannot race a cancel — or
    // another delete — and return the same units twice.
    const order = isAdmin
      ? await ordersRepository.findByIdForUpdate(orderId, client)
      : await ordersRepository.findScopedForUpdate(orderId, userId, client);
    if (!order) {
      if (strict) throw ApiError.notFound("Order not found");
      return "Order has been deleted successfully.";
    }
    // Deleting an order that still holds stock is a cancellation by another
    // name. A canceled order has already been returned, and a delivered one was
    // fulfilled, so neither is restocked here.
    if (STOCK_HOLDING_STATUSES.includes(order.status)) {
      await ordersRepository.restoreStock(order.items, client);
    }
    if (isAdmin) await ordersRepository.deleteById(orderId, client);
    else await ordersRepository.deleteScoped(orderId, userId, client);
    return "Order has been deleted successfully.";
  });
};

const findUserOrders = async (userId) => ordersRepository.findByUser(userId);

const detailedOrder = async ({ orderId, targetUserId, isAdmin }) => {
  const order = await ordersRepository.detailedById(orderId, isAdmin ? null : targetUserId);
  if (!order) throw ApiError.notFound("Order not found for this user");
  return order;
};

const minimizedAdmin = async ({ page, limit, sorting }) => {
  const ascending = String(sorting).toLowerCase() === "asc";
  return ordersRepository.listPaginatedAdmin({ page, limit, ascending });
};

const minimizedUser = async (userId) => ordersRepository.minimizedForUser(userId);

const searchOrder = async (orderId) => {
  const order = await ordersRepository.searchById(orderId);
  if (!order) {
    throw ApiError.notFound(`Cannot find order with id: ${orderId}`);
  }
  return order;
};

module.exports = {
  createOrder,
  setOrderStatus,
  deleteOrder,
  findUserOrders,
  detailedOrder,
  minimizedAdmin,
  minimizedUser,
  searchOrder,
};