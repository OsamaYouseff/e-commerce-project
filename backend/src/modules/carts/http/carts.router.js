const { Router } = require("express");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const cartsUsecases = require("../application/carts.usecases");
const { pickFields } = require("../../../shared/validation/pick-fields");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { requireObjectId, validateCartEntry } = require("../../../shared/http/validation");

const router = Router();

router.post("/", verifyToken, asyncHandler(async (req, res) => {
  const products = Array.isArray(req.body.products) ? req.body.products : [];
  products.forEach(validateCartEntry);
  const cart = await cartsUsecases.createCart({ userId: req.user.id, products });
  res.status(200).json(cart);
}));

router.put("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const updateData = pickFields(req.body, ["products", "totalPrice"]);
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No updatable fields provided" });
  }
  if (Array.isArray(updateData.products)) updateData.products.forEach(validateCartEntry);
  const cart = await cartsUsecases.updateCart({ userId: req.user.id, body: updateData });
  res.status(200).json(cart);
}));

router.post("/add_update-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  requireObjectId(req.body.productId, "productId");
  const cart = await cartsUsecases.addOrUpdateProduct({
    userId: req.user.id,
    productId: req.body.productId,
    quantity: req.body.quantity,
  });
  res.status(200).json(cart);
}));

router.post("/remove-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  requireObjectId(req.body.productId, "productId");
  const cart = await cartsUsecases.removeProduct({
    userId: req.user.id,
    productId: req.body.productId,
  });
  res.status(200).json(cart);
}));

router.put("/clear/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const cart = await cartsUsecases.clearCart({ userId: req.user.id });
  res.status(200).json(cart);
}));

// The path id is the customer's id, like every other cart route here. It used to
// be forwarded to the use case as a *cart* id, which made this endpoint
// unreachable for a non-admin: the authorization check only lets a caller pass
// their own id, and no cart row is ever keyed by it, so the delete always found
// nothing and answered 404. An admin could reach it by cart id.
router.delete("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const message = await cartsUsecases.deleteCart({
    userId: req.params.id,
    isAdmin: req.user.isAdmin,
  });
  res.status(200).json(message);
}));

router.get("/find/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const cart = await cartsUsecases.findCartByUserId(req.params.id);
  res.status(200).json(cart);
}));

router.get("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const carts = await cartsUsecases.listAllCarts();
  res.status(200).json(carts);
}));

router.get("/cart_detailed_products/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const cart = await cartsUsecases.findDetailedCart(req.params.id);
  res.status(200).json(cart);
}));

module.exports = router;