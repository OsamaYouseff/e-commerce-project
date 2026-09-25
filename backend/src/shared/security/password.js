const bcrypt = require("bcrypt");

const ROUNDS = 10;

const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);

const verifyPassword = (plain, hash) => bcrypt.compare(String(plain || ""), String(hash || ""));

module.exports = { hashPassword, verifyPassword };