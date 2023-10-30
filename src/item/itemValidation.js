const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const createBody = {
  itemName: Joi.string().required(),
  itemDescription: Joi.string().required(),
  categoryId: Joi.objectId().required(),
  ingredients: Joi.string().required(),
  price: Joi.number().required(),
};
const updateBody = {
  itemName: Joi.string(),
  itemDescription: Joi.string(),
  categoryId: Joi.objectId(),
  ingredients: Joi.string(),
  price: Joi.number(),
};
const itemQuery = {
  itemId: Joi.objectId().required(),
};
const itemValidation = {
  createItem: {
    body: Joi.object(createBody),
  },
  updateItem: {
    body: Joi.object(updateBody),
    query: Joi.object(itemQuery),
  },
  getOrDeleteItem: {
    query: Joi.object(itemQuery),
  },
  getItems:{
    query:Joi.object({
      itemName: Joi.string(),
      ingredients: Joi.string(),
      categoryId: Joi.objectId(),
      price: Joi.number().positive(),
      page: Joi.number().positive().min(1),
      limit: Joi.number().positive().min(1),
    })
  }
};

module.exports = itemValidation;
