const express = require("express");
const router = express.Router();
const OrderController = require("./orderController");
const orderController = new OrderController();
const orderValidation = require("./orderValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.get(
  "/list",
  middleware.isAuth,
  validate(orderValidation.getOrders),
  orderController.getOrders
);

router.get(
  "/admin/list",
  middleware.isAuth,
  middleware.isAdmin,
  validate(orderValidation.getOrders),
  orderController.adminOrders
);

router.get(
  "/details",
  middleware.isAuth,
  validate(orderValidation.getOrDeleteOrder),
  orderController.getOrder
);

router.post(
  "/",
  middleware.isAuth,
  validate(orderValidation.createOrder),
  orderController.createOrder
);

router.put(
  "/",
  middleware.isAuth,
  validate(orderValidation.updateOrder),
  orderController.updateOrder
);

router.put(
  "/cancel",
  middleware.isAuth,
  validate(orderValidation.getOrDeleteOrder),
  orderController.cancelOrder
);

router.put(
  "/accept",
  middleware.isAuth,
  middleware.isAdmin,
  validate(orderValidation.getOrDeleteOrder),
  orderController.acceptOrder
);

router.put(
  "/reject",
  middleware.isAuth,
  middleware.isAdmin,
  validate(orderValidation.getOrDeleteOrder),
  orderController.rejectOrder
);

router.get(
  "/history",
  middleware.isAuth,
  middleware.isAdmin,
  validate(orderValidation.getHistory),
  orderController.getHistory
);

module.exports = router;
