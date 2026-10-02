const { Router } = require("express");
const { verifyTokenAndAuthorization } = require("../../../shared/http/auth-middleware");
const addressesUsecases = require("../application/addresses.usecases");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { requireObjectId, validateAddressInput } = require("../../../shared/http/validation");

const router = Router();

router.post("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  validateAddressInput(req.body);
  const address = await addressesUsecases.createAddress({ userId: req.user.id, body: req.body });
  res.status(201).json(address);
}));

router.get("/find/:id/:addressId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.addressId);
  const address = await addressesUsecases.findOneForUser({
    userId: req.user.id,
    addressId: req.params.addressId,
    isAdmin: req.user.isAdmin,
    targetUserId: req.params.id,
  });
  res.json(address);
}));

router.get("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const addresses = await addressesUsecases.findAllForUser(req.user.id);
  res.json(addresses);
}));

router.get("/find-default/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.id);
  const address = await addressesUsecases.findDefaultAddress({
    userId: req.user.id,
    isAdmin: req.user.isAdmin,
    targetUserId: req.params.id,
  });
  res.json(address);
}));

router.put("/:id/:addressId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.addressId);
  validateAddressInput(req.body, { partial: true });
  const address = await addressesUsecases.updateAddress({
    userId: req.user.id,
    addressId: req.params.addressId,
    body: req.body,
  });
  res.json(address);
}));

router.delete("/:id/:addressId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.addressId);
  const result = await addressesUsecases.deleteAddress({
    userId: req.user.id,
    addressId: req.params.addressId,
  });
  res.json(result);
}));

router.put("/set-default/:id/:addressId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  requireObjectId(req.params.addressId);
  const result = await addressesUsecases.setDefaultAddress({
    userId: req.user.id,
    addressId: req.params.addressId,
  });
  res.json(result);
}));

module.exports = router;