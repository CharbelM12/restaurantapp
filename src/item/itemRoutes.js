const express = require("express");
const router = express.Router();
const ItemController = require("./itemController");
const itemController = new ItemController();
const itemValidation = require("./itemValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.get("/list", validate(itemValidation.getItems), itemController.getItems);
router.post(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(itemValidation.createItem),
  itemController.createItem
);

router.get(
  "/details",
  validate(itemValidation.getOrDeleteItem),
  itemController.getItem
);

router.put(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(itemValidation.updateItem),
  itemController.updateItem
);

router.delete(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(itemValidation.getOrDeleteItem),
  itemController.deleteItem
);

router.post(
  "/image",
  middleware.isAuth,
  middleware.isAdmin,
  itemController.addImage
);

module.exports = router;
