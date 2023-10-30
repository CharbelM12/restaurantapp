const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("../configurations/config");

const createCategory = {
  categoryName: Joi.string().required(),
  categoryDescription: Joi.string().required(),
  displayOrder: Joi.number().required(),
};
const updateCategory = {
  categoryName: Joi.string(),
  categoryDescription: Joi.string(),
  displayOrder: Joi.number(),
};
const categoryValidation = {
  getCategories: {
    query: Joi.object({
      categoryId: Joi.objectId(),
      page: Joi.number().positive().min(config.minPageAndLimitValue),
      limit: Joi.number().positive().min(config.minPageAndLimitValue),
    }),
  },
  createCategory: {
    body: Joi.object(createCategory),
  },
  updateCategory: {
    body: Joi.object(updateCategory),
    query: Joi.object({
      categoryId: Joi.objectId().required(),
    }),
  },
  deleteCategory: {
    query: Joi.object({
      categoryId: Joi.objectId().required(),
    }),
  },
  sortCategories: {
    body: Joi.array().items(
      Joi.object({
        _id: Joi.objectId().required(),
        displayOrder: Joi.number().required(),
      })
    ),
  },
};
module.exports = categoryValidation;
