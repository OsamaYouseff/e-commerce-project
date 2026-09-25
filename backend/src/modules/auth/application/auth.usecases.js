const usersRepository = require("../../users/infrastructure/users.repository");
const { hashPassword, verifyPassword } = require("../../../shared/security/password");
const { signAccessToken } = require("../../../shared/security/jwt");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");
const {
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isPhoneValid,
} = require("../../../../middleware/UserValidation");

const collectFieldErrors = async ({ username, email, password, phone }) => {
  const errors = {};
  if (!username || !email || !password || !phone) errors.message = "Please fill all fields";
  if (!isUsernameValid(username)) errors.username = "Invalid username";
  if (!isEmailValid(email)) errors.email = "Invalid email";
  if (!isPasswordValid(password)) errors.password = "Invalid password";
  if (!isPhoneValid(phone)) errors.phone = "Invalid phone number";

  const [usernameExists, emailExists, phoneExists] = await Promise.all([
    usersRepository.countByValue("username", username),
    usersRepository.countByValue("email", email),
    usersRepository.countByValue("phone", phone),
  ]);
  if (usernameExists) errors.username = "Username already in use";
  if (emailExists) errors.email = "Email already in use";
  if (phoneExists) errors.phone = "Phone number already in use";

  return errors;
};

const register = async ({ firstname, lastname, username, email, gender, phone, password }) => {
  const errors = await collectFieldErrors({ username, email, password, phone });
  if (Object.keys(errors).length > 0) {
    const err = ApiError.badRequest("Validation failed");
    err.details = errors;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const user = await usersRepository.create({
    id: generateId(),
    firstname: firstname ?? null,
    lastname: lastname ?? null,
    username,
    email,
    gender: gender ?? null,
    phone,
    passwordHash: hashedPassword,
  });

  return {
    accessToken: signAccessToken({ id: user._id, isAdmin: user.isAdmin }, "7d"),
    userInfo: usersRepository.toSafeUser(user),
  };
};

const login = async ({ username, password }) => {
  const user = await usersRepository.findByUsername(username);
  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthorized("Invalid username or password");
  }
  return {
    accessToken: signAccessToken({ id: user._id, isAdmin: user.isAdmin }, "7d"),
    userInfo: usersRepository.toSafeUser(user),
  };
};

const adminLogin = async ({ username, password }) => {
  const user = await usersRepository.findByUsername(username);
  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthorized("Invalid username or password");
  }
  if (!user.isAdmin) throw ApiError.unauthorized("Only admins can login");
  return {
    accessToken: signAccessToken({ id: user._id, isAdmin: user.isAdmin }, "3d"),
    userInfo: usersRepository.toSafeUser(user),
  };
};

module.exports = { register, login, adminLogin, collectFieldErrors };