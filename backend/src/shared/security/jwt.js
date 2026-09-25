const jwt = require("jsonwebtoken");
const { env } = require("../../config/env");

const signAccessToken = ({ id, isAdmin }, expiresIn) =>
  jwt.sign({ id, isAdmin }, env.JWT_SEC, { expiresIn });

module.exports = { signAccessToken };