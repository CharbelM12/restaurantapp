const jwt = require("jsonwebtoken");
const errorHandler = require("../errors");
const user = require("../user/userModel");
const config = require("../configurations/config");

const isAuth = (req, res, next) => {
  if (!req.cookies?.accessToken) {
    throw {
      status: errorHandler["notAuthorized"].status,
      message: errorHandler["notAuthorized"].message,
    };
  }
  let decodedToken;
  decodedToken = jwt.verify(req.cookies.accessToken, config.accessTokenSecret);
  if (!decodedToken) {
    throw {
      status: errorHandler["notAuthorized"].status,
      message: errorHandler["notAuthorized"].message,
    };
  }
  req.userId = decodedToken.userId;
  next();
};
const isAdmin = async (req, res, next) => {
  const foundUser = await user.findById(req.userId);
  if (foundUser.role !== config.adminRole) {
    next({
      status: errorHandler["forbidden"].status,
      message: errorHandler["forbidden"].message,
    });
  } else {
    next();
  }
};
module.exports = {
  isAuth,
  isAdmin,
};
