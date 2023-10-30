const mongoose = require("mongoose");
const CategoryService = require("./categoryService");
const categoryService = new CategoryService();
const category = require("./categoryModel");
const item = require("../item/itemModel");
const errorHandler = require("../errors");
const config = require("../configurations/config");
jest.mock("./categoryModel");
jest.mock("../item/itemModel");
const mockUserId = new mongoose.Types.ObjectId();
const mockCategory = {
  _id: new mongoose.Types.ObjectId(),
  categoryName: "Mock Category",
  categoryDescription: "This is a mock item for testing purposes.",
  imageUrl: "mock-image-url.png",
  displayOrder: 1,
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
};
const mockItem = {
  _id: new mongoose.Types.ObjectId(),
  itemName: "Mock Item",
  itemDescription: "This is a mock item for testing purposes.",
  categoryId: new mongoose.Types.ObjectId(),
  ingredients: ["Ingredient 1, Ingredient 2"],
  price: 10,
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
  imageUrl: "mock-image-url.png",
};
describe("categoryService", () => {
  describe("createCategory function", () => {
    it("should create and save a category with the provided data", async () => {
      category.prototype.save.mockResolvedValueOnce({
        categoryName: mockCategory.categoryName,
        categoryDescription: mockCategory.categoryDescription,
        displayOrder: mockCategory.displayOrder,
        createdBy: mockUserId,
      });

      const result = await categoryService.createCategory(
        mockCategory,
        mockUserId
      );
      expect(category.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({
        categoryName: mockCategory.categoryName,
        categoryDescription: mockCategory.categoryDescription,
        displayOrder: mockCategory.displayOrder,
        createdBy: mockUserId,
      });
    });
  });
  describe("getCategories function", () => {
    it("should return all categories when no categoryId is provided", async () => {
      category.aggregate.mockResolvedValueOnce([mockCategory]);

      const result = await categoryService.getCategories(
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toBeInstanceOf(Array);
      result.forEach((category) => {
        expect(category).toHaveProperty("_id");
        expect(category).toHaveProperty("categoryName");
        expect(category).toHaveProperty("categoryDescription");
        expect(category).toHaveProperty("imageUrl");
        expect(category).toHaveProperty("displayOrder");
        expect(category).toHaveProperty("createdBy");
        expect(category).toHaveProperty("updatedBy");
      });
    });
    it("should return the category that matches the provided categoryId", async () => {
      category.aggregate.mockResolvedValueOnce([mockCategory]);
      const result = await categoryService.getCategories(
        mockCategory._id,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(mockCategory._id);
      expect(result[0].categoryName).toEqual(mockCategory.categoryName);
      expect(result[0].categoryDescription).toEqual(
        mockCategory.categoryDescription
      );
      expect(result[0].imageUrl).toEqual(mockCategory.imageUrl);
      expect(result[0].displayOrder).toEqual(mockCategory.displayOrder);
      expect(result[0].createdBy).toEqual(mockCategory.createdBy);
      expect(result[0].updatedBy).toEqual(mockCategory.updatedBy);
    });
    it("should return an empty array if there are no branches created", async () => {
      category.aggregate.mockResolvedValueOnce([]);

      const result = await categoryService.getCategories(
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toEqual([]);
      expect(category.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        { $sort: { displayOrder: 1 } },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });
  describe("updateCategory function", () => {
    it("should update the category that corresponds to the categoryId provided", async () => {
      category.updateOne.mockReturnValueOnce({ nModified: 1, ok: 1 });
      const result = await categoryService.updateCategory(
        mockCategory._id,
        mockCategory,
        mockUserId
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
      expect(category.updateOne).toHaveBeenCalledWith(
        { _id: mockCategory._id },
        { $set: mockCategory, updatedBy: mockUserId }
      );
    });
  });
  describe("deleteCategory function", () => {
    it("should throw a forbidden error when the category has items", async () => {
      item.findOne.mockResolvedValueOnce(mockItem);
      try {
        await categoryService.deleteCategory(mockCategory._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should delete category when it does not have items", async () => {
      item.findOne.mockResolvedValueOnce(null);
      category.deleteOne.mockReturnValueOnce({ n: 1, ok: 1, deletedCount: 1 });
      const result = await categoryService.deleteCategory(mockCategory._id);
      expect(result).toEqual({ n: 1, ok: 1, deletedCount: 1 });
    });
  });
  describe("addImage function", () => {
    it("Add image or update the image of the category that corresponds to the provided categoryId ", async () => {
      category.updateOne.mockResolvedValueOnce({ nModified: 1, ok: 1 });
      const imageUrl = "new image Url";

      const result = await categoryService.addImage(
        imageUrl,
        mockCategory._id,
        mockUserId
      );

      expect(category.updateOne).toHaveBeenCalledWith(
        { _id: mockCategory._id },
        { $set: { imageUrl: imageUrl, updatedBy: mockUserId } }
      );
    });
  });

  describe("sortCategories", () => {
    it("should update the displayOrder for each category", async () => {
      const categories = [
        { _id: new mongoose.Types.ObjectId(), displayOrder: 2 },
        { _id: new mongoose.Types.ObjectId(), displayOrder: 1 },
      ];
      const bulkOpMock = {
        find: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      };
      category.collection.initializeUnorderedBulkOp.mockReturnValue(bulkOpMock);
      await categoryService.sortCategories(categories);
      expect(bulkOpMock.find).toHaveBeenCalledTimes(2);
      expect(bulkOpMock.update).toHaveBeenCalledTimes(2);
      expect(bulkOpMock.execute).toHaveBeenCalledTimes(1);
      categories.forEach((category) => {
        expect(bulkOpMock.find).toHaveBeenCalledWith({
          _id: category._id,
        });
        expect(bulkOpMock.update).toHaveBeenCalledWith({
          $set: {
            displayOrder: category.displayOrder,
          },
        });
      });
    });
  });
});
