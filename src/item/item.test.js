const mongoose = require("mongoose");
const ItemService = require("./itemService");
const itemService = new ItemService();
const item = require("./itemModel");
const order = require("../order/orderModel");
const errorHandler = require("../errors");
const config = require("../configurations/config");
jest.mock("./itemModel");
jest.mock("../order/orderModel");
const mockUserId = new mongoose.Types.ObjectId();
const mockItem = {
  _id: new mongoose.Types.ObjectId(),
  itemName: "Mock Item",
  itemDescription: "This is a mock item for testing purposes.",
  categoryId: new mongoose.Types.ObjectId(),
  ingredients: "Ingredient 1, Ingredient 2",
  price: 10,
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
  imageUrl: "mock-image-url.png",
};
const mockOrder = {
  _id: new mongoose.Types.ObjectId(),
  orderItems: [
    {
      _id: mockItem._id,
      quantity: 1,
      itemName: mockItem.itemName,
    },
  ],
  userId: mockUserId,
  addressId: new mongoose.Types.ObjectId(),
  branchId: new mongoose.Types.ObjectId(),
  status: config.pendingStatus,
  totalPrice: 10,
  dateOrdered: "2023-6-22T12:00:00.000Z",
};

describe("itemService", () => {
  describe("Get items", () => {
    it("should return items matching the provided parameters", async () => {
      item.aggregate.mockResolvedValueOnce(mockItem);

      const result = await itemService.getItems(
        mockItem.itemName,
        mockItem.ingredients,
        mockItem.categoryId,
        mockItem.price,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(item.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            $text: { $search: "Mock Item Ingredient 1, Ingredient 2" },
            categoryId: mockItem.categoryId,
            price: { $lte: mockItem.price },
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
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });

    it("should return all items  when no parameters are passed", async () => {
      item.aggregate.mockResolvedValueOnce(mockItem);

      const result = await itemService.getItems(
        undefined,
        undefined,
        undefined,
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(item.aggregate).toHaveBeenCalledWith([
        { $match: {} },
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
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
      expect(result).toEqual(mockItem);
    });

    it("should return items filtered by categoryId or price", async () => {
      item.aggregate.mockResolvedValueOnce(mockItem);

      const result = await itemService.getItems(
        undefined,
        undefined,
        mockItem.categoryId,
        mockItem.price,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(item.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            categoryId: mockItem.categoryId,
            price: { $lte: mockItem.price },
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
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
      expect(result).toEqual(mockItem);
    });

    it("should return empty array when the parameters passed do not match any item", async () => {
      item.aggregate.mockResolvedValueOnce([]);

      const result = await itemService.getItems(
        mockItem.itemName,
        mockItem.ingredients,
        mockItem.categoryId,
        mockItem.price,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(result).toEqual([]);
      expect(item.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            $text: { $search: "Mock Item Ingredient 1, Ingredient 2" },
            categoryId: mockItem.categoryId,
            price: { $lte: mockItem.price },
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
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
    it("should return the item if any of the words passed by parameters is in the name or ingredients", async () => {
      item.aggregate.mockResolvedValueOnce(mockItem);

      const result = await itemService.getItems(
        mockItem.itemName,
        mockItem.ingredients,
        undefined,
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(item.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            $text: { $search: "Mock Item Ingredient 1, Ingredient 2" },
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
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });
  describe("createItem function", () => {
    it("should create and save an item with the provided data", async () => {
      item.prototype.save.mockResolvedValueOnce({
        itemName: mockItem.itemName,
        itemDescription: mockItem.itemDescription,
        categoryId: mockItem.categoryId,
        ingredients: mockItem.ingredients,
        price: mockItem.price,
        createdBy: mockUserId,
      });

      const result = await itemService.createItem(mockItem, mockUserId);
      expect(item.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({
        itemName: mockItem.itemName,
        itemDescription: mockItem.itemDescription,
        categoryId: mockItem.categoryId,
        ingredients: mockItem.ingredients,
        price: mockItem.price,
        createdBy: mockUserId,
      });
    });
  });
  describe("getItem function", () => {
    it("should return an item with the provided itemId", async () => {
      const expectedResult = {
        _id: mockItem._id,
        itemName: mockItem.itemName,
        itemDescription: mockItem.itemDescription,
        ingredients: mockItem.ingredients,
        price: mockItem.price,
        categoryId: mockItem.categoryId,
        categoryName: "category name",
        categoryDescription: "category description",
      };
      item.aggregate.mockResolvedValueOnce([expectedResult]);
      const result = await itemService.getItem(mockItem._id);
      expect(result).toEqual(expectedResult);
    });
    it("should throw an error if the item is not found", async () => {
      item.aggregate.mockResolvedValueOnce([]);
      try {
        await itemService.getItem(mockItem._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["itemMissing"].status);
        expect(error.message).toEqual(errorHandler["itemMissing"].message);
      }
    });
  });
  describe("updateItem function", () => {
    it("should throw a forbidden error when item is in orders", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await itemService.updateItem(mockItem._id, mockItem, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });

    it("should update item when not in orders", async () => {
      order.findOne.mockResolvedValueOnce(null);
      item.updateOne.mockReturnValueOnce({ nModified: 1, ok: 1 });
      const result = await itemService.updateItem(
        mockItem._id,
        mockItem,
        mockUserId
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
      expect(item.updateOne).toHaveBeenCalledWith(
        { _id: mockItem._id },
        { $set: mockItem, updatedBy: mockUserId }
      );
    });
  });
  describe("deleteItem function", () => {
    it("should throw a forbidden error when item is in orders", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await itemService.deleteItem(mockItem._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should delete item when not in a pending order", async () => {
      order.findOne.mockResolvedValueOnce(null);
      item.deleteOne.mockReturnValueOnce({
        acknowledged: true,
        deletedCount: 1
    });
      const result = await itemService.deleteItem(mockItem._id);
      expect(result).toEqual({
        acknowledged: true,
        deletedCount: 1
    });
    });
  });
  describe("addImage", () => {
    it("should update the item with the given image URL", async () => {
      item.updateOne.mockResolvedValueOnce({ nModified: 1, ok: 1 });
      const imageUrl = "new image Url";

      const result = await itemService.addImage(
        imageUrl,
        mockItem._id,
        mockUserId
      );

      expect(item.updateOne).toHaveBeenCalledWith(
        { _id: mockItem._id },
        { $set: { imageUrl: imageUrl, updatedBy: mockUserId } }
      );
    });
  });
});
