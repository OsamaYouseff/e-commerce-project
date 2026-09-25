const { Router } = require("express");
const authUsecases = require("../application/auth.usecases");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { ApiError } = require("../../../shared/http/api-error");

const router = Router();

const sendValidationErrors = (err, res) => {
  if (err instanceof ApiError && err.statusCode === 400 && err.details) {
    return res.status(400).json(err.details);
  }
  throw err;
};

router.post("/register", asyncHandler(async (req, res) => {
  try {
    const result = await authUsecases.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendValidationErrors(err, res);
  }
}));

router.post("/login", asyncHandler(async (req, res) => {
  const result = await authUsecases.login({ username: req.body.username, password: req.body.password });
  res.status(200).json(result);
}));

router.post("/admin-login", asyncHandler(async (req, res) => {
  const result = await authUsecases.adminLogin({ username: req.body.username, password: req.body.password });
  res.status(200).json(result);
}));

module.exports = router;