const express = require("express");
const router = express.Router();
const userRoutes = require("./user/userRoutes");
const userTokenRoutes = require("./userToken/userTokenRoutes");
const itemRoutes = require("./item/itemRoutes");
const categoryRoutes = require("./category/categoryRoutes");
const orderRoutes = require("./order/orderRoutes");
const branchRoutes = require("./branch/branchRoutes");
const addressRoutes = require("./address/addressRoutes");

router.use("/user", userRoutes);
router.use("/userToken", userTokenRoutes);
router.use("/category", categoryRoutes);
router.use("/item", itemRoutes);
router.use("/order", orderRoutes);
router.use("/branch", branchRoutes);
router.use("/address", addressRoutes);

module.exports = router;
