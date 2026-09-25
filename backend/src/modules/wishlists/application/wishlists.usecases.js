const wishlistsRepository = require("../infrastructure/wishlists.repository");
const { withTransaction } = require("../../../shared/database/transaction");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");

const PRODUCT_DETAIL_KEYS = ["_id", "title", "desc", "img", "categories", "size", "color", "price", "rating"];

const pickProductDetails = (details) => {
  const out = {};
  for (const key of PRODUCT_DETAIL_KEYS) out[key] = details[key];
  return out;
};

const shapeDetailed = (wishlist, productDetails) => {
  const byId = new Map(productDetails.map((p) => [p._id, p]));
  return {
    ...wishlist,
    products: wishlist.products.map((item) => ({
      productId: item.productId,
      productDetails: byId.get(item.productId) ? pickProductDetails(byId.get(item.productId)) : null,
    })),
  };
};

const createWishlist = async ({ userId, products = [] }) => {
  const existing = await wishlistsRepository.getByUserId(userId);
  if (existing) throw ApiError.badRequest("Wishlist already exists");

  return withTransaction(async (client) => {
    const wishlist = await wishlistsRepository.create({ id: generateId(), userId }, client);
    const ids = (products || []).map((p) => p.productId).filter(Boolean);
    if (ids.length > 0) await wishlistsRepository.replaceItems(wishlist._id, ids, client);

    const withItems = await wishlistsRepository.getByUserIdWithItems(userId, client);
    const details = await wishlistsRepository.getProductDetails(withItems.products.map((i) => i.productId), client);
    return shapeDetailed(withItems, details);
  });
};

const addProduct = async ({ userId, productId }) => {
  return withTransaction(async (client) => {
    let wishlist = await wishlistsRepository.getByUserId(userId, client);

    if (!wishlist) {
      wishlist = await wishlistsRepository.create({ id: generateId(), userId }, client);
      await wishlistsRepository.replaceItems(wishlist._id, [productId], client);
    } else {
      const items = await wishlistsRepository.getItems(wishlist._id, client);
      if (items.some((item) => item.productId === productId)) {
        throw ApiError.badRequest("Product already exists in the Wishlist");
      }
      await wishlistsRepository.replaceItems(wishlist._id, [...items.map((i) => i.productId), productId], client);
    }

    const withItems = await wishlistsRepository.getByUserIdWithItems(userId, client);
    const details = await wishlistsRepository.getProductDetails(withItems.products.map((i) => i.productId), client);
    return shapeDetailed(withItems, details);
  });
};

const removeProduct = async ({ userId, productId }) => {
  return withTransaction(async (client) => {
    const wishlist = await wishlistsRepository.getByUserId(userId, client);
    if (!wishlist) throw ApiError.notFound("Wishlist not found");

    const items = await wishlistsRepository.getItems(wishlist._id, client);
    const next = items.filter((item) => item.productId !== productId);
    if (next.length === items.length) throw ApiError.notFound("Product not found in Wishlist");

    await wishlistsRepository.replaceItems(wishlist._id, next.map((i) => i.productId), client);

    const withItems = await wishlistsRepository.getByUserIdWithItems(userId, client);
    const details = await wishlistsRepository.getProductDetails(withItems.products.map((i) => i.productId), client);
    return shapeDetailed(withItems, details);
  });
};

const clearWishlist = async ({ userId }) => {
  return withTransaction(async (client) => {
    const wishlist = await wishlistsRepository.getByUserId(userId, client);
    if (!wishlist) throw ApiError.notFound("Wishlist not found");
    await wishlistsRepository.clearItems(wishlist._id, client);
    const withItems = await wishlistsRepository.getByUserIdWithItems(userId, client);
    return { message: "Wishlist cleared successfully", wishlist: withItems };
  });
};

const deleteWishlist = async ({ userId }) => {
  return withTransaction(async (client) => {
    const deleted = await wishlistsRepository.deleteByUserId(userId, client);
    if (!deleted) throw ApiError.notFound("Wishlist not found");
    return { message: "Wishlist has been deleted successfully" };
  });
};

const findWishlistByUserId = async (userId) => {
  const wishlist = await wishlistsRepository.getByUserIdWithItems(userId);
  if (!wishlist) return null;
  return { ...wishlist, products: wishlist.products.map((item) => ({ productId: item.productId })) };
};

const findDetailedWishlist = async (userId) => {
  const wishlist = await wishlistsRepository.getByUserIdWithItems(userId);
  if (!wishlist) throw ApiError.notFound("Wishlist not found for the given user ID");
  const details = await wishlistsRepository.getProductDetails(wishlist.products.map((i) => i.productId));
  return shapeDetailed(wishlist, details);
};

const listAllWishlists = async () => wishlistsRepository.listAll();

const checkProductInWishlist = async ({ userId, productId }) => {
  const wishlist = await wishlistsRepository.getByUserIdWithItems(userId);
  if (!wishlist) {
    const err = ApiError.notFound("Wishlist not found");
    err.isInWishlist = false;
    throw err;
  }
  return { isInWishlist: wishlist.products.some((item) => item.productId === productId) };
};

module.exports = {
  createWishlist,
  addProduct,
  removeProduct,
  clearWishlist,
  deleteWishlist,
  findWishlistByUserId,
  findDetailedWishlist,
  listAllWishlists,
  checkProductInWishlist,
};