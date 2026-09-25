const bcrypt = require("bcrypt");
const usersRepository = require("../infrastructure/users.repository");
const { ApiError } = require("../../../shared/http/api-error");
const { isPasswordStrong, isPasswordReused } = require("../../../../middleware/UserValidation");

const updateProfile = async (id, fields) => {
  const user = await usersRepository.updateFields(id, fields);
  if (!user) throw ApiError.notFound("User not found");
  return usersRepository.toSafeUser(user);
};

const changePassword = async ({ userId, currentPassword, newPassword, confirmNewPassword }) => {
  if (newPassword !== confirmNewPassword) {
    throw ApiError.badRequest("Passwords do not match");
  }
  if (!isPasswordStrong(newPassword)) {
    throw ApiError.badRequest("Password does not meet strength requirements");
  }
  if (newPassword === currentPassword) {
    throw ApiError.badRequest("New password cannot be the same as the current password");
  }

  const user = await usersRepository.findById(userId);
  if (!user) throw ApiError.notFound("Invalid request");

  const isCurrentPasswordValid = await bcrypt.compare(String(currentPassword || ""), user.password);
  if (!isCurrentPasswordValid) throw ApiError.unauthorized("Wrong password");

  if (await isPasswordReused(user, newPassword)) {
    throw ApiError.badRequest("Password has been used recently");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await usersRepository.updatePassword(user._id, hashedNewPassword);
  return { message: "Password changed successfully" };
};

const checkUsername = async (username) => {
  const exists = await usersRepository.checkUsernameExists(username);
  return { message: exists ? "Username already exists" : "Username is available", result: exists };
};

const deleteUser = async (id) => {
  const removed = await usersRepository.deleteById(id);
  if (!removed) throw ApiError.notFound("User not found");
  return "User has been deleted successfully.";
};

module.exports = { updateProfile, changePassword, checkUsername, deleteUser };