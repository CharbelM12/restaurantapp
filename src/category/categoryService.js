const mongoose = require("mongoose");
const category = require("./categoryModel");
const errorHandler = require("../errors");
const item = require("../item/itemModel");
class CategoryService {
  async createCategory(reqBody, userId) {
    return new category({
      categoryName: reqBody.categoryName,
      categoryDescription: reqBody.categoryDescription,
      displayOrder: reqBody.displayOrder,
      createdBy: userId,
    }).save();
  }
  async getCategories(categoryId, page, limit) {
    const matchStage = {};
    categoryId
      ? (matchStage._id = new mongoose.Types.ObjectId(categoryId))
      : undefined;
    return await category.aggregate([
      { $match: matchStage },
      { $sort: { displayOrder: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }

  async updateCategory(categoryId, reqBody, userId) {
    return await category.updateOne(
      { _id: new mongoose.Types.ObjectId(categoryId) },
      { $set: reqBody, updatedBy: userId }
    );
  }
  async deleteCategory(categoryId) {
    const existingItem = await item.findOne({
      categoryId: new mongoose.Types.ObjectId(categoryId),
    });
    if (!existingItem) {
      return await category.deleteOne({
        _id: new mongoose.Types.ObjectId(categoryId),
      });
    } else {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    }
  }
  async sortCategories(categories) {
    const bulk = category.collection.initializeUnorderedBulkOp();
    for (let category of categories) {
      bulk.find({ _id: new mongoose.Types.ObjectId(category._id) }).update({
        $set: {
          displayOrder: Number(category.displayOrder),
        },
      });
    }
    await bulk.execute();
  }
  async addImage(reqFilePath, categoryId, userId) {
    return await category.updateOne(
      { _id: new mongoose.Types.ObjectId(categoryId) },
      { $set: { imageUrl: reqFilePath, updatedBy: userId } }
    );
  }
}
module.exports = CategoryService;
