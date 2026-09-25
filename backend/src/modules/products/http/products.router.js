const { Router } = require("express");
const { verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const productsUsecases = require("../application/products.usecases");
const { asyncHandler } = require("../../../shared/http/async-handler");

const router = Router();

router.post("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const product = await productsUsecases.createProduct(req.body);
  res.status(200).json(product);
}));

router.put("/:id", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const product = await productsUsecases.updateProduct(req.params.id, req.body);
  res.status(201).json(product);
}));

router.delete("/:id/:productId", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const message = await productsUsecases.deleteProduct(req.params.productId);
  res.status(200).json(message);
}));

router.patch("/disable/:id/:productId", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const result = await productsUsecases.toggleProduct(req.params.productId);
  res.status(200).json(result);
}));

router.get("/find/:id", asyncHandler(async (req, res) => {
  const product = await productsUsecases.findProduct(req.params.id);
  res.status(200).json(product);
}));

router.get("/", asyncHandler(async (req, res) => {
  const products = await productsUsecases.listProducts({
    categories: req.query.categories,
    size: req.query.size,
    color: req.query.color,
  });
  res.status(200).json(products);
}));

router.get("/all", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await productsUsecases.listPaginated({
    page,
    limit,
    sorting: req.query.sorting,
  });
  res.json({
    data: result.items,
    meta: { total: result.total, page, totalPages: Math.ceil(result.total / limit), limit },
  });
}));

router.get("/search/:productName", asyncHandler(async (req, res) => {
  const products = await productsUsecases.searchProducts(req.params.productName);
  res.status(200).json(products);
}));

module.exports = router;