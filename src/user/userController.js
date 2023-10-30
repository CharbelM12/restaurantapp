const UserService = require("./userService");
const userConfig = require("./userConfig");
const config = require("../configurations/config");
const userService = new UserService();

class UserController {
  async signup(req, res, next) {
    try {
      await userService.signup(req.body);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async adminLogin(req, res, next) {
    try {
      const { accessToken, refreshToken } = await userService.login(
        req.body,
        config.adminRole
      );
      res.cookie("accessToken", accessToken, { httpOnly: config.httpOnlyCookieValue, maxAge: config.AccessTokenCookieMaxAge });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: config.httpOnlyCookieValue,
        maxAge: userConfig.refreshTokenCookieMaxAge,
      });
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async userLogin(req, res, next) {
    try {
      const { accessToken, refreshToken } = await userService.login(
        req.body,
        userConfig.userRole
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: config.httpOnlyCookieValue,
        maxAge: config.AccessTokenCookieMaxAge,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: config.httpOnlyCookieValue,
        maxAge: userConfig.refreshTokenCookieMaxAge,
      });
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async addAdmin(req, res, next) {
    try {
      const addedAdmin = await userService.addAdmin(
        req.query.userId,
        req.query.email,
        req.query.firstName,
        req.query.lastName
      );
      return res.status(200).send(addedAdmin);
    } catch (error) {
      next(error);
    }
  }
  async disableUser(req, res, next) {
    try {
      const disabledUser = await userService.disableOrEnableAdmin(
        req.query.userId,
        userConfig.disable
      );
      return res.status(200).send(disabledUser);
    } catch (error) {
      next(error);
    }
  }
  async enableUser(req, res, next) {
    try {
      const enabledUser = await userService.disableOrEnableAdmin(
        req.query.userId,
        userConfig.enable
      );
      return res.status(200).send(enabledUser);
    } catch (error) {
      next(error);
    }
  }
  async getProfile(req, res, next) {
    try {
      const profile = await userService.getProfile(req.userId);
      return res.status(200).send(profile);
    } catch (error) {
      next(error);
    }
  }
  async updateProfile(req, res, next) {
    try {
      const updatedProfile = await userService.updateProfile(
        req.userId,
        req.body
      );
      return res.status(200).send(updatedProfile);
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req, res, next) {
    try {
      const token = await userService.forgotPassword(req.body);
      return res.status(200).send(token);
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req, res, next) {
    try {
      await userService.resetPassword(req.body);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
