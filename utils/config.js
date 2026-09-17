require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://superj.app";
const PHONE_NUMBER = process.env.PHONE_NUMBER || "9885060891";
const OTP_CODES = (process.env.OTP_CODES || "777777,711711")
  .split(",")
  .map((code) => code.trim())
  .filter(Boolean);

module.exports = { BASE_URL, PHONE_NUMBER, OTP_CODES };
