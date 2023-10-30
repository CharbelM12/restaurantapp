const Joi = require("joi");
const userConfig = require("./userConfig");
Joi.objectId = require("joi-objectid")(Joi);

const userValidation = {
  signupValidation: {
    body: Joi.object({
      email: Joi.string().trim().email().normalize().required(),
      password: Joi.string().trim().required(),
      firstName: Joi.string()
        .min(userConfig.firstAndlastNamesMinLength)
        .trim()
        .required(),
      lastName: Joi.string()
        .min(userConfig.firstAndlastNamesMinLength)
        .trim()
        .required(),
    }),
  },
  loginValidation: {
    body: Joi.object({
      email: Joi.string().trim().email().normalize().required(),
      password: Joi.string().trim().required(),
    }),
  },
  addAdmin: {
    query: Joi.object({
      userId: Joi.objectId(),
      email: Joi.string().trim().email().normalize(),
      firstName: Joi.string().min(userConfig.firstAndlastNamesMinLength),
      lastName: Joi.string().min(userConfig.firstAndlastNamesMinLength),
    }),
  },
  disableOrEnableUser: {
    query: Joi.object({
      userId: Joi.objectId().required(),
    }),
  },
  updateProfile: {
    body: Joi.object({
      firstName: Joi.string().min(2),
      lastName: Joi.string().min(2),
      dateOfBirth: Joi.date().iso(),
      phoneNumber: Joi.string(),
      favoriteItems: Joi.array()
        .min(userConfig.favoriteItemsMinLength)
        .items(
          Joi.object({
            _id: Joi.objectId().required(),
          })
        ),
    }),
  },
  forgotPasswordValidation: {
    body: Joi.object({
      email: Joi.string().trim().email().normalize().required(),
    }),
  },
  resetPasswordValidation: {
    body: Joi.object({
      token: Joi.string().hex().required(),
      password: Joi.string().trim().required(),
    }),
  },
};
module.exports = userValidation;
