const { Router } = require("express");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const cartsUsecases = require("../application/carts.usecases");
const { pickFields } = require("../../../shared/validation/pick-fields");
const { asyncHandler } = require("../../../shared/http/async-handler");

const router = Router();

router.post("/", verifyToken, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.createCart({ userId: req.user.id, products: req.body.products });
  res.status(200).json(cart);
}));

router.put("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const updateData = pickFields(req.body, ["products", "totalPrice"]);
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No updatable fields provided" });
  }
  const cart = await cartsUsecases.updateCart({ userId: req.user.id, body: updateData });
  res.status(200).json(cart);
}));

router.post("/add_update-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.addOrUpdateProduct({
    userId: req.user.id,
    productId: req.body.productId,
    quantity: req.body.quantity,
    price: req.body.price,
  });
  res.status(200).json(cart);
}));

router.post("/remove-product/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.removeProduct({
    userId: req.user.id,
    productId: req.body.productId,
  });
  res.status(200).json(cart);
}));

router.put("/clear/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.clearCart({ userId: req.user.id });
  res.status(200).json(cart);
}));

router.delete("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const message = await cartsUsecases.deleteCart({
    id: req.params.id,
    userId: req.user.id,
    isAdmin: req.user.isAdmin,
  });
  res.status(200).json(message);
}));

router.get("/find/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.findCartByUserId(req.params.id);
  res.status(200).json(cart);
}));

router.get("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const carts = await cartsUsecases.listAllCarts();
  res.status(200).json(carts);
}));

router.get("/cart_detailed_products/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const cart = await cartsUsecases.findDetailedCart(req.params.id);
  res.status(200).json(cart);
}));

module.exports = router;