const express = require("express");
const router = express.Router();
const AddressController = require("./addressController");
const addressController = new AddressController();
const addressValidation = require("./addressValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.get(
  "/list",
  middleware.isAuth,
  validate(addressValidation.getAddresses),
  addressController.getAddresses
);

router.post(
  "/",
  middleware.isAuth,
  validate(addressValidation.createAddress),
  addressController.createAddress
);

router.put(
  "/",
  middleware.isAuth,
  validate(addressValidation.updateAddress),
  addressController.updateAddress
);

router.delete(
  "/",
  middleware.isAuth,
  validate(addressValidation.deleteAddress),
  addressController.deleteAddress
);

module.exports = router;
