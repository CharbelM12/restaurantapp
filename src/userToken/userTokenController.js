const UserTokenService = require("./userTokenService");
const userTokenService = new UserTokenService();
const config = require("../configurations/config");

class UserTokenController {
  async refreshToken(req, res, next) {
    try {
      const accessToken = await userTokenService.refreshToken(req.cookies);
      res.cookie("accessToken", accessToken, {
        httpOnly: config.httpOnlyCookieValue,
        maxAge: config.AccessTokenCookieMaxAge,
      });
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async revokeToken(req, res, next) {
    try {
      await userTokenService.revokeToken(req.cookies);
      res.clearCookie("accessToken", { httpOnly: config.httpOnlyCookieValue });
      res.clearCookie("refreshToken", { httpOnly: config.httpOnlyCookieValue });
      return res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserTokenController;
