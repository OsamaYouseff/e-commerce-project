const cartsRepository = require("../infrastructure/carts.repository");
const { withTransaction } = require("../../../shared/database/transaction");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");

const PRODUCT_DETAIL_KEYS = ["_id", "title", "desc", "img", "categories", "size", "color", "price", "rating", "amount"];

const lockUserCart = (client, userId) =>
  client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`cart:${userId}`]);

const isValidQuantity = (qty) => Number.isInteger(qty) && qty >= 1 && qty <= 999;

const sanitizeEntries = (products = []) =>
  products
    .filter((p) => p && p.productId && isValidQuantity(p.quantity ?? 1))
    .map((p, position) => ({ productId: p.productId, quantity: p.quantity ?? 1, position }));

const shapeDetailed = (cart, productDetails) => {
  const byId = new Map(productDetails.map((p) => [p._id, p]));
  const totalPrice = cart.products.reduce((sum, item) => {
    const price = byId.get(item.productId)?.price ?? 0;
    return sum + (item.quantity ?? 0) * price;
  }, 0);
  return {
    ...cart,
    products: cart.products.map((item) => {
      const details = byId.get(item.productId);
      return {
        _id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        productDetails: details
          ? pickProductDetails(details)
          : null,
      };
    }),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

const pickProductDetails = (details) => {
  const out = {};
  for (const key of PRODUCT_DETAIL_KEYS) out[key] = details[key];
  return out;
};

const createCart = async ({ userId, products = [] }) => {
  return withTransaction(async (client) => {
    await lockUserCart(client, userId);
    // Re-check *after* the lock. Checking only before it left a window where two
    // concurrent creates both saw "no cart": the second one's ON CONFLICT DO
    // UPDATE then returned the first request's row and replaced its items.
    const existing = await cartsRepository.getCartByUserId(userId, client);
    if (existing) throw ApiError.badRequest("Cart already exists");

    const cart = await cartsRepository.create({ id: generateId(), userId }, client);
    const entries = sanitizeEntries(products);
    if (entries.length > 0) await cartsRepository.replaceItems(cart._id, entries, client);

    const withItems = await cartsRepository.getCartByIdWithItems(cart._id, client);
    const ids = withItems.products.map((i) => i.productId);
    const details = await cartsRepository.getProductDetails(ids, client);
    return shapeDetailed(withItems, details);
  });
};

const updateCart = async ({ userId, body }) => {
  return withTransaction(async (client) => {
    await lockUserCart(client, userId);
    const cart = await cartsRepository.getCartByUserId(userId, client);
    if (!cart) throw ApiError.notFound("Cart not found");

    if (Array.isArray(body.products)) {
      const entries = sanitizeEntries(body.products);
      await cartsRepository.replaceItems(cart._id, entries, client);
    }

    const withItems = await cartsRepository.getCartByIdWithItems(cart._id, client);
    const details = await cartsRepository.getProductDetails(withItems.products.map((i) => i.productId), client);
    return shapeDetailed(withItems, details);
  });
};

const addOrUpdateProduct = async ({ userId, productId, quantity }) => {
  const qty = quantity ?? 1;
  if (!isValidQuantity(qty)) throw ApiError.badRequest("Invalid quantity");
  return withTransaction(async (client) => {
    await lockUserCart(client, userId);
    let cart = await cartsRepository.getCartByUserId(userId, client);

    if (!cart) {
      cart = await cartsRepository.create({ id: generateId(), userId }, client);
      await cartsRepository.replaceItems(cart._id, [{ productId, quantity: qty, position: 0 }], client);
    } else {
      const items = await cartsRepository.getItems(cart._id, client);
      const idx = items.findIndex((item) => item.productId === productId);
      if (idx > -1) {
        items[idx] = { ...items[idx], quantity: qty };
      } else {
        items.push({ productId, quantity: qty, position: items.length });
      }
      await cartsRepository.replaceItems(cart._id, items, client);
    }

    const withItems = await cartsRepository.getCartByIdWithItems(cart._id, client);
    const ids = withItems.products.map((i) => i.productId);
    const details = await cartsRepository.getProductDetails(ids, client);
    return shapeDetailed(withItems, details);
  });
};

const removeProduct = async ({ userId, productId }) => {
  return withTransaction(async (client) => {
    await lockUserCart(client, userId);
    const cart = await cartsRepository.getCartByUserId(userId, client);
    if (!cart) throw ApiError.notFound("Cart not found");

    const items = await cartsRepository.getItems(cart._id, client);
    const idx = items.findIndex((item) => item.productId === productId);
    if (idx === -1) throw ApiError.notFound("Product not found in cart");

    items.splice(idx, 1);
    await cartsRepository.replaceItems(cart._id, items, client);

    const withItems = await cartsRepository.getCartByIdWithItems(cart._id, client);
    const details = await cartsRepository.getProductDetails(withItems.products.map((i) => i.productId), client);
    return shapeDetailed(withItems, details);
  });
};

const clearCart = async ({ userId }) => {
  return withTransaction(async (client) => {
    await lockUserCart(client, userId);
    let cart = await cartsRepository.getCartByUserId(userId, client);
    if (!cart) {
      cart = await cartsRepository.create({ id: generateId(), userId }, client);
    }
    await cartsRepository.clearItems(cart._id, client);
    const withItems = await cartsRepository.getCartByIdWithItems(cart._id, client);
    return shapeDetailed(withItems, []);
  });
};

/**
 * Deletes a customer's cart. `userId` identifies whose cart to remove, which is
 * the customer's own id unless an admin is deleting someone else's.
 *
 * Deletion cascades to `cart_items`, so it runs inside a transaction that takes
 * the same per-user advisory lock as every other cart mutation. Without that lock
 * a concurrent add/update could insert cart items after this statement removed
 * the parent row and fail on the `cart_items` foreign key.
 */
const deleteCart = async ({ userId, isAdmin }) => {
  const removed = await withTransaction(async (client) => {
    const cart = await cartsRepository.getCartByUserId(userId, client);
    if (!cart) return false;
    await lockUserCart(client, cart.userId);
    return isAdmin
      ? await cartsRepository.deleteById(cart._id, client)
      : await cartsRepository.deleteScoped(cart._id, userId, client);
  });
  if (!removed) throw ApiError.notFound("Cart not found for the given user ID");
  return "Cart has been deleted...";
};

const findCartByUserId = async (userId) => {
  const cart = await cartsRepository.getCartByUserIdWithItems(userId);
  if (!cart) return null;
  const details = await cartsRepository.getProductDetails(cart.products.map((i) => i.productId));
  const byId = new Map(details.map((p) => [p._id, p]));
  const totalPrice = cart.products.reduce((sum, item) => sum + (item.quantity ?? 0) * (byId.get(item.productId)?.price ?? 0), 0);
  const products = cart.products.map((item) => ({ _id: item.productId, productId: item.productId, quantity: item.quantity }));
  return { ...cart, products, totalPrice: Number(totalPrice.toFixed(2)) };
};

const findDetailedCart = async (userId) => {
  const cart = await cartsRepository.getCartByUserIdWithItems(userId);
  if (!cart) throw ApiError.notFound("Cart not found for the given user ID");
  const details = await cartsRepository.getProductDetails(cart.products.map((i) => i.productId));
  return shapeDetailed(cart, details);
};

const listAllCarts = async () => cartsRepository.listAll();

module.exports = {
  createCart,
  updateCart,
  addOrUpdateProduct,
  removeProduct,
  clearCart,
  deleteCart,
  findCartByUserId,
  findDetailedCart,
  listAllCarts,
};