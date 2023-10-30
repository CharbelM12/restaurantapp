const express = require("express");
const router = express.Router();
const CategoryController = require("./categoryController");
const categoryController = new CategoryController();
const categoryValidation = require("./categoryValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.post(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(categoryValidation.createCategory),
  categoryController.createCategory
);

router.get(
  "/list",
  middleware.isAuth,
  middleware.isAdmin,
  validate(categoryValidation.getCategories),
  categoryController.getCategories
);

router.put(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(categoryValidation.updateCategory),
  categoryController.updateCategory
);

router.delete(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(categoryValidation.deleteCategory),
  categoryController.deleteCategory
);

router.put(
  "/reorder",
  middleware.isAuth,
  middleware.isAdmin,
  validate(categoryValidation.sortCategories),
  categoryController.sortCategories
);

router.post(
  "/image",
  middleware.isAuth,
  middleware.isAdmin,
  categoryController.addImage
);

module.exports = router;
