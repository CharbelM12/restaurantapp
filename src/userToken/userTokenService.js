const userToken = require("./userTokenModel");
const jwt = require("jsonwebtoken");
const errorHandler = require("../errors");
const config = require("../configurations/config");
const generateTokens = require("../utils/jwt");

class UserTokenService {
  async refreshToken(cookies) {
    if (!cookies?.refreshToken) {
      throw {
        status: errorHandler["notAuthorized"].status,
        message: errorHandler["notAuthorized"].message,
      };
    } else {
      const foundToken = await userToken.findOne({
        refreshToken: cookies.refreshToken,
      });
      if (!foundToken) {
        throw {
          status: errorHandler["forbidden"].status,
          message: errorHandler["forbidden"].message,
        };
      } else {
        const decodedToken = jwt.verify(
          cookies.refreshToken,
          config.refreshTokenSecret
        );
        if (!decodedToken) {
          throw {
            status: errorHandler["forbidden"].status,
            message: errorHandler["forbidden"].message,
          };
        } else {
          const accessToken = await generateTokens.generateAccessTokens({
            email: decodedToken.email,
            userId: decodedToken.userId.toString(),
          });
          return accessToken;
        }
      }
    }
  }
  async revokeToken(cookies) {
    return await userToken.deleteOne({ refreshToken: cookies.refreshToken });
  }
}

module.exports = UserTokenService;
