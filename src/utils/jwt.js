const config = require("../configurations/config");
const jwt = require("jsonwebtoken");
const userToken = require("../userToken/userTokenModel");

async function generateAccessTokens(payload) {
  const accessToken = jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiry,
  });
  return accessToken;
}
async function generateRefreshTokens(payload) {
  const refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
  await userToken.deleteOne({ userId: payload.userId });
  await new userToken({
    userId: payload.userId,
    refreshToken: refreshToken,
  }).save();
  return refreshToken;
}

module.exports = {
  generateAccessTokens,
  generateRefreshTokens,
};
