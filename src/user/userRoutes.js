const express = require("express");
const router = express.Router();
const UserController = require("./userController");
const userController = new UserController();
const userValidation = require("./userValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.put(
  "/",
  validate(userValidation.signupValidation),
  userController.signup
);

router.post(
  "/",
  validate(userValidation.loginValidation),
  userController.userLogin
);

router.post(
  "/admin",
  validate(userValidation.loginValidation),
  userController.adminLogin
);

router.post(
  "/admin/add",
  middleware.isAuth,
  middleware.isAdmin,
  validate(userValidation.addAdmin),
  userController.addAdmin
);

router.put(
  "/admin/disable",
  middleware.isAuth,
  middleware.isAdmin,
  validate(userValidation.disableOrEnableUser),
  userController.disableUser
);

router.put(
  "/admin/enable",
  middleware.isAuth,
  middleware.isAdmin,
  validate(userValidation.disableOrEnableUser),
  userController.enableUser
);

router.put(
  "/profile",
  middleware.isAuth,
  validate(userValidation.updateProfile),
  userController.updateProfile
);

router.get("/profile", middleware.isAuth, userController.getProfile);

router.post(
  "/forgotPassword",
  validate(userValidation.forgotPasswordValidation),
  userController.forgotPassword
);

router.post(
  "/resetPassword",
  validate(userValidation.resetPasswordValidation),
  userController.resetPassword
);

module.exports = router;
