const express = require("express");
const router = express.Router();
const UserTokenController = require("./userTokenController");
const userTokenController = new UserTokenController();
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.post("/", userTokenController.refreshToken);

router.delete("/", middleware.isAuth, userTokenController.revokeToken);

module.exports = router;
