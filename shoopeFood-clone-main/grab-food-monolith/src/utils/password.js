const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const PREFIX = "scrypt";

const isPasswordHash = (value) => String(value || "").startsWith(`${PREFIX}$`);

const hashPassword = async (password) => {
  const normalized = String(password || "");
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(normalized, salt, KEY_LENGTH);
  return `${PREFIX}$${salt}$${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password, storedValue) => {
  const normalizedPassword = String(password || "");
  const normalizedStoredValue = String(storedValue || "");

  if (!isPasswordHash(normalizedStoredValue)) {
    const left = Buffer.from(normalizedPassword);
    const right = Buffer.from(normalizedStoredValue);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  }

  const [, salt, expectedHex] = normalizedStoredValue.split("$");
  if (!salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await scrypt(normalizedPassword, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

module.exports = {
  hashPassword,
  isPasswordHash,
  verifyPassword,
};
