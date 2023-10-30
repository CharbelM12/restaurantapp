const item = require("./itemModel");
const mongoose = require("mongoose");
const errorHandler = require("../errors");
const order = require("../order/orderModel");
const config = require("../configurations/config");

class ItemService {
  async getItems(itemName, ingredients, categoryId, price, page, limit) {
    const matchStage = {};
    const searchQuery = {};
    const searchText = [];
    categoryId
      ? (matchStage.categoryId = new mongoose.Types.ObjectId(categoryId))
      : undefined;
    price ? (matchStage.price = { $lte: Number(price) }) : undefined;
    itemName ? searchText.push(itemName) : undefined;
    ingredients ? searchText.push(ingredients) : undefined;
    searchText.length > 0
      ? (searchQuery.$text = { $search: searchText.join(" ") })
      : undefined;
    return await item.aggregate([
      {
        $match: {
          ...matchStage,
          ...searchQuery,
        },
      },
      {
        $group: { _id: "$categoryId", items: { $push: "$$ROOT" } },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          catgeory: "$categoryId",
          items: {
            $map: {
              input: "$items",
              as: "items",
              in: {
                _id: "$$items._id",
                name: "$$items.itemName",
                description: "$$items.itemDescription",
                ingredients: "$$items.ingredients",
                price: "$$items.price",
                createdBy: "$$items.createdBy",
                updatedBy: "$$items.updatedBy",
              },
            },
          },
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
  async createItem(reqBody, userId) {
    return new item({
      itemName: reqBody.itemName,
      itemDescription: reqBody.itemDescription,
      categoryId: reqBody.categoryId,
      ingredients: reqBody.ingredients,
      price: reqBody.price,
      createdBy: userId,
    }).save();
  }
  async getItem(itemId) {
    const chosenItem = await item.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(itemId) },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          itemName: 1,
          itemDescription: 1,
          ingredients: 1,
          price: 1,
          categoryId: "$category._id",
          categoryName: "$category.categoryName",
          categoryDescription: "$category.categoryDescription",
        },
      },
    ]);
    if (chosenItem && chosenItem.length > 0) {
      return chosenItem[0];
    } else {
      throw {
        status: errorHandler["itemMissing"].status,
        message: errorHandler["itemMissing"].message,
      };
    }
  }
  async updateItem(itemId, reqBody, userId) {
    const itemsInOrders = await order.findOne({
      "orderItems._id": new mongoose.Types.ObjectId(itemId),
      status: config.pendingStatus,
    });
    if (itemsInOrders) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      return await item.updateOne(
        { _id: new mongoose.Types.ObjectId(itemId) },
        { $set: reqBody, updatedBy: userId }
      );
    }
  }
  async deleteItem(itemId) {
    const itemsInOrders = await order.findOne({
      "orderItems._id": new mongoose.Types.ObjectId(itemId),
      status: config.pendingStatus,
    });
    if (itemsInOrders) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      return await item.deleteOne({ _id: new mongoose.Types.ObjectId(itemId) });
    }
  }
  async addImage(reqFilePath, itemId, userId) {
    return await item.updateOne(
      { _id: new mongoose.Types.ObjectId(itemId) },
      { $set: { imageUrl: reqFilePath, updatedBy: userId } }
    );
  }
}
module.exports = ItemService;
