const { Router } = require("express");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const ordersUsecases = require("../application/orders.usecases");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { parsePagination } = require("../../../shared/http/validation");

const router = Router();

router.post("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const { created, order } = await ordersUsecases.createOrder({ userId: req.user.id, body: req.body });
  res.status(created ? 201 : 200).json(order);
}));

router.put("/:id", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const order = await ordersUsecases.updateOrder({ orderId: req.params.id, body: req.body });
  res.status(200).json(order);
}));

router.patch("/:orderId/:status", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const order = await ordersUsecases.setOrderStatus({
    orderId: req.params.orderId,
    status: req.params.status,
  });
  res.status(200).json(order);
}));

router.delete("/:id/:orderId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const message = await ordersUsecases.deleteOrder({
    orderId: req.params.orderId,
    userId: req.user.id,
    isAdmin: req.user.isAdmin,
  });
  res.status(200).json(message);
}));

router.delete("/:orderId", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const message = await ordersUsecases.deleteOrder({
    orderId: req.params.orderId,
    userId: req.user.id,
    isAdmin: true,
    strict: false,
  });
  res.status(200).json(message);
}));

router.get("/find/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const orders = await ordersUsecases.findUserOrders(req.params.id);
  res.status(200).json(orders);
}));

router.get("/detailed/:orderId", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const order = await ordersUsecases.detailedOrder({ orderId: req.params.orderId, isAdmin: true });
  res.json(order);
}));

router.get("/detailed/:id/:orderId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const order = await ordersUsecases.detailedOrder({
    orderId: req.params.orderId,
    targetUserId: req.params.id,
    isAdmin: req.user.isAdmin,
  });
  res.json(order);
}));

router.get("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await ordersUsecases.minimizedAdmin({ page, limit, sorting: req.query.sorting });
  res.json({
    data: result.items,
    meta: { total: result.total, page, totalPages: Math.ceil(result.total / limit), limit },
  });
}));

router.get("/min/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const orders = await ordersUsecases.minimizedUser(req.params.id);
  res.json(orders);
}));

router.get("/search/:orderId", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const order = await ordersUsecases.searchOrder(req.params.orderId);
  res.json(order);
}));

module.exports = router;