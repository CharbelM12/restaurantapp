const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const branchConfig=require("./branchConfig")
const config=require("../configurations/config");
const createBody = {
  branchName: Joi.string().min(branchConfig.branchNameMinLength).max(config.labelAndBranchNameMaxLength).required(),
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
      ),
  }).required(),
  phoneNumber: Joi.string().required(),
  services: Joi.array().items(Joi.string()).min(config.completeAddressAndLabelAndServicesMinLength).required(),
};
const updateBody = {
  branchName: Joi.string().min(branchConfig.branchNameMinLength).max(config.labelAndBranchNameMaxLength),
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
        ),
    }),
  phoneNumber: Joi.string(),
  services: Joi.array().items(Joi.string()).min(config.completeAddressAndLabelAndServicesMinLength),
};
const branchValidation = {
  createBranch: {
    body: Joi.object(createBody),
  },
  updateBranch: {
    body: Joi.object(updateBody),
    query: Joi.object({
      branchId: Joi.objectId().required(),
    }),
  },
  getOrDeleteBranch: {
    query: Joi.object({
      branchId: Joi.objectId().required(),
    }),
  },
  getBranches:{
    query: Joi.object({
    branchId: Joi.objectId(), 
    page: Joi.number().positive().min(config.defaultPageNumber),
    limit: Joi.number().positive().min(config.defaultPageNumber),
    }),
  }
};
module.exports = branchValidation;
