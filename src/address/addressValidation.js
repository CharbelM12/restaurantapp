const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const addressConfig = require("./addressConfig");
const config = require("../configurations/config");
const createBody = {
  label: Joi.string()
    .min(config.completeAddressAndLabelAndServicesMinLength)
    .max(config.labelAndBranchNameMaxLength)
    .required(),
  completeAddress: Joi.string()
    .min(config.completeAddressAndLabelAndServicesMinLength)
    .max(addressConfig.completeAddressMaxLength)
    .required(),
  location: Joi.object({
    coordinates: Joi.array()
      .length(config.coordinatesLength)
      .items(
        Joi.number()
          .min(config.longitudeMinValue)
          .max(config.longitudeMaxValue)
          .required(),
        Joi.number()
          .min(config.latitudeMinValue)
          .max(config.latitudeMaxValue)
          .required()
      )
      .required(),
  }).required(),
};
const updateBody = {
  label: Joi.string()
    .min(config.completeAddressAndLabelAndServicesMinLength)
    .max(config.labelAndBranchNameMaxLength),
  completeAddress: Joi.string()
    .min(config.completeAddressAndLabelAndServicesMinLength)
    .max(addressConfig.completeAddressMaxLength),
  location: Joi.object({
    coordinates: Joi.array()
      .length(config.coordinatesLength)
      .items(
        Joi.number()
          .min(config.longitudeMinValue)
          .max(config.longitudeMaxValue)
          .required(),
        Joi.number()
          .min(config.latitudeMinValue)
          .max(config.latitudeMaxValue)
          .required()
      )
      .required(),
  }),
};
const addressQuery = {
  addressId: Joi.objectId().required(),
};
const addressValidation = {
  getAddresses: {
    query: Joi.object({
      addressId: Joi.objectId(),
      page: Joi.number().positive().min(config.minPageAndLimitValue),
      limit: Joi.number().positive().min(config.minPageAndLimitValue),
    }),
  },
  createAddress: {
    body: Joi.object(createBody),
  },
  updateAddress: {
    body: Joi.object(updateBody),
    query: Joi.object(addressQuery),
  },
  deleteAddress: {
    query: Joi.object(addressQuery),
  },
};
module.exports = addressValidation;
