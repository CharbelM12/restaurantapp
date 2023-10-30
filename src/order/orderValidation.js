const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const orerConfig = require("./orderConfig");
const orderConfig = require("./orderConfig");
const config = require("../configurations/config");

const createOrder = {
  orderItems: Joi.array()
    .min(orderConfig.orderItemsMinLengthAndMinQuantityValue)
    .items(
      Joi.object({
        _id: Joi.objectId().required(),
        quantity: Joi.number()
          .integer()
          .min(orderConfig.orderItemsMinLengthAndMinQuantityValue)
          .required(),
      })
    )
    .required(),
  addressId: Joi.objectId().required(),
};
const updateOrder = {
  orderItems: Joi.array()
    .min(orderConfig.orderItemsMinLengthAndMinQuantityValue)
    .items(
      Joi.object({
        _id: Joi.objectId().required(),
        quantity: Joi.number()
          .integer()
          .min(orderConfig.orderItemsMinLengthAndMinQuantityValue)
          .required(),
      })
    ),
  addressId: Joi.objectId(),
};
const orderQuery = {
  orderId: Joi.objectId().required(),
};
const orderValidation = {
  createOrder: {
    body: Joi.object(createOrder),
  },
  updateOrder: {
    body: Joi.object(updateOrder),
    query: Joi.object(orderQuery),
  },
  getOrDeleteOrder: {
    query: Joi.object(orderQuery),
  },
  getOrders: {
    query: Joi.object({
      orderId: Joi.objectId(),
      page: Joi.number().positive().min(config.minPageAndLimitValue),
      limit: Joi.number().positive().min(config.minPageAndLimitValue),
    }),
  },
  getHistory: {
    query: Joi.object({
      page: Joi.number().positive().min(config.minPageAndLimitValue),
      limit: Joi.number().positive().min(config.minPageAndLimitValue),
    }),
  },
};
module.exports = orderValidation;
