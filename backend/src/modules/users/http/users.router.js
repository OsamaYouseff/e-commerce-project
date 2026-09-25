const { Router } = require("express");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("../../../shared/http/auth-middleware");
const usersUsecases = require("../application/users.usecases");
const usersRepository = require("../infrastructure/users.repository");
const { asyncHandler } = require("../../../shared/http/async-handler");
const { pickFields } = require("../../../shared/validation/pick-fields");

const router = Router();

const PROFILE_FIELDS = ["firstname", "lastname", "username", "email", "gender", "phone"];

router.put("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const updateData = pickFields(req.body, PROFILE_FIELDS);
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No updatable fields provided" });
  }
  const user = await usersUsecases.updateProfile(req.params.id, updateData);
  res.status(200).json(user);
}));

router.delete("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const result = await usersUsecases.deleteUser(req.params.id);
  res.status(200).json(result);
}));

router.get("/", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const users = await usersRepository.listAll();
  res.status(200).json(users.map(usersRepository.toSafeUser));
}));

router.get("/find/:id", verifyTokenAndAdmin, asyncHandler(async (req, res) => {
  const user = await usersRepository.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(usersRepository.toSafeUser(user));
}));

router.post("/change-password/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const result = await usersUsecases.changePassword({
    userId: req.user.id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    confirmNewPassword: req.body.confirmNewPassword,
  });
  res.status(200).json(result);
}));

router.get("/check-username/:username", asyncHandler(async (req, res) => {
  const result = await usersUsecases.checkUsername(req.params.username);
  res.status(200).json(result);
}));

module.exports = router;