require("dotenv").config();

module.exports = {
  maxPasswordAttempts: 10,
  lockedCmsForMinutes: 10,
  passwordLength: 12,
  from: "mounayercharbel07@gmail.com",
  userRole: "user",
  disable: true,
  enable: false,
  resetPasswordTokenExpiry: 3600,
  tokenFormat: "hex",
  refreshTokenCookieMaxAge:8.64e7,
};
