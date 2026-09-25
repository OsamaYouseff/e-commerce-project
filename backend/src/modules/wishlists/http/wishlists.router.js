const { Router } = require("express");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const wishlistsUsecases = require("../application/wishlists.usecases");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { ApiError } = require("../../../shared/http/api-error");

const router = Router();

router.post("/", verifyToken, asyncHandler(async (req, res) => {
  const wishlist = await wishlistsUsecases.createWishlist({
    userId: req.user.id,
    products: req.body.products,
  });
  res.status(200).json(wishlist);
}));

router.post("/add-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const wishlist = await wishlistsUsecases.addProduct({
    userId: req.user.id,
    productId: req.body.productId,
  });
  res.status(200).json(wishlist);
}));

router.post("/remove-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const wishlist = await wishlistsUsecases.removeProduct({
    userId: req.user.id,
    productId: req.body.productId,
  });
  res.status(200).json(wishlist);
}));

router.put("/clear/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const result = await wishlistsUsecases.clearWishlist({ userId: req.user.id });
  res.status(200).json(result);
}));

router.delete("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const result = await wishlistsUsecases.deleteWishlist({ userId: req.user.id });
  res.status(200).json(result);
}));

router.get("/find/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const wishlist = await wishlistsUsecases.findWishlistByUserId(req.params.id);
  res.status(200).json(wishlist);
}));

router.get("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const wishlists = await wishlistsUsecases.listAllWishlists();
  res.status(200).json(wishlists);
}));

router.get("/wishlist_detailed_products/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const wishlist = await wishlistsUsecases.findDetailedWishlist(req.params.id);
  res.status(200).json(wishlist);
}));

router.get("/check-product/:id/:productId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  try {
    const result = await wishlistsUsecases.checkProductInWishlist({
      userId: req.user.id,
      productId: req.params.productId,
    });
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      return res.status(404).json({ message: "Wishlist not found", isInWishlist: false });
    }
    throw err;
  }
}));

module.exports = router;