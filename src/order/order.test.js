const mongoose = require("mongoose");
const OrderService = require("./orderService");
const orderService = new OrderService();
const order = require("./orderModel");
const address = require("../address/addressModel");
const item = require("../item/itemModel");
const branch = require("../branch/branchModel");
const config = require("../configurations/config");
const errorHandler = require("../errors");
const orderConfig = require("./orderConfig");
const orderAggregation = require("./orderAggregation");
jest.mock("./orderModel");
jest.mock("../address/addressModel");
jest.mock("../item/itemModel");
jest.mock("../branch/branchModel");
const mockUserId = new mongoose.Types.ObjectId();
const mockAddress = {
  _id: new mongoose.Types.ObjectId(),
  label: "mock label",
  completeAddress: "Mock Complete Address",
  location: {
    type: "Point",

    coordinates: [5, 6],
  },
  userId: mockUserId,
};
const mockItem = {
  _id: new mongoose.Types.ObjectId(),
  itemName: "Mock Item",
  itemDescription: "This is a mock item for testing purposes.",
  categoryId: new mongoose.Types.ObjectId(),
  ingredients: "Ingredient 1, Ingredient 2",
  price: 10,
  createdBy: mockUserId,
  updatedBy: mockUserId,
  imageUrl: "mock-image-url.png",
};
const mockBranch = {
  _id: new mongoose.Types.ObjectId(),
  branchName: "Mock Branch",
  location: {
    type: "Point",
    coordinates: [5, 6],
  },
  phoneNumber: "70036733",
  services: ["Food", "outdoor", "games"],
  isOpen: true,
  createdBy: mockUserId,
  updatedBy: mockUserId,
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
  addressId: mockAddress._id,
  branchId: mockBranch._id,
  status: config.pendingStatus,
  totalPrice: 10,
  dateOrdered: "2023-6-22T12:00:00.000Z",
  save: jest.fn(),
};

describe("orderService", () => {
  describe("getOrders function", () => {
    it("should return all the orders with the userId equal to the _id of the user that made the orders", async () => {
      order.aggregate.mockResolvedValueOnce([mockOrder]);
      const result = await orderService.getOrders(
        mockUserId,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(result).toEqual([mockOrder]);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: { userId: mockUserId, status: config.pendingStatus } },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });

    it("should return an empty array if the user has not made any order", async () => {
      order.aggregate.mockResolvedValueOnce([]);

      const result = await orderService.getOrders(
        mockUserId,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toEqual([]);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: { userId: mockUserId, status: config.pendingStatus } },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });

  describe("getOrder function", () => {
    it("should return the order when it exists and has the correct user ID", async () => {
      order.aggregate.mockResolvedValueOnce([mockOrder]);
      const result = await orderService.getOrder(mockUserId, mockOrder._id);

      expect(result).toEqual(mockOrder);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: { _id: mockOrder._id } },
        orderAggregation.userLookup,
        orderAggregation.userUnwind,
        orderAggregation.branchLookup,
        orderAggregation.branchUnwind,
        orderAggregation.addressLookup,
        orderAggregation.addressUnwind,
        orderAggregation.orderProject,
      ]);
    });

    it("should throw an error when the order is not found", async () => {
      order.aggregate.mockResolvedValueOnce([]);
      try {
        await orderService.getOrder(mockUserId, mockOrder._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["orderMissing"].status);
        expect(error.message).toEqual(errorHandler["orderMissing"].message);
      }
    });

    it("should throw a forbidden error when the order is found but has a different user ID", async () => {
      mockOrder.userId = new mongoose.Types.ObjectId();
      order.aggregate.mockResolvedValueOnce([mockOrder]);
      try {
        await orderService.getOrder(mockUserId, mockOrder._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
  });
  describe("adminOrders", () => {
    mockOrder.userId = mockUserId;
    it("should return the order that corresponds to the orderId provided", async () => {
      order.aggregate.mockResolvedValueOnce([mockOrder]);

      const result = await orderService.adminOrders(mockOrder._id,config.defaultPageNumber,config.defaultPagelimit);

      expect(result).toEqual([mockOrder]);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: { _id: mockOrder._id } },
        orderAggregation.userLookup,
        orderAggregation.userUnwind,
        orderAggregation.branchLookup,
        orderAggregation.branchUnwind,
        orderAggregation.addressLookup,
        orderAggregation.addressUnwind,
        orderAggregation.orderProject,
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });

    it("should return all orders when orderId is not provided", async () => {
      order.aggregate.mockResolvedValueOnce([mockOrder]);

      const result = await orderService.adminOrders(undefined,config.defaultPageNumber,config.defaultPagelimit);

      expect(result).toEqual([mockOrder]);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        orderAggregation.userLookup,
        orderAggregation.userUnwind,
        orderAggregation.branchLookup,
        orderAggregation.branchUnwind,
        orderAggregation.addressLookup,
        orderAggregation.addressUnwind,
        orderAggregation.orderProject,
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
    it("should return an empty array if no order was made", async () => {
      order.aggregate.mockResolvedValueOnce([]);

      const result = await orderService.adminOrders(undefined,config.defaultPageNumber,config.defaultPagelimit);

      expect(result).toEqual([]);
      expect(order.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        orderAggregation.userLookup,
        orderAggregation.userUnwind,
        orderAggregation.branchLookup,
        orderAggregation.branchUnwind,
        orderAggregation.addressLookup,
        orderAggregation.addressUnwind,
        orderAggregation.orderProject,
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });
  describe("createOrder function", () => {
    it("should create an order when items, the user address, and a restaurant branch are found", async () => {
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(mockAddress);
      branch.findOne.mockResolvedValueOnce(mockBranch);
      order.prototype.save.mockResolvedValueOnce(mockOrder);
      const result = await orderService.createOrder(mockOrder, mockUserId);
      expect(result).toEqual(mockOrder);
    });
    it("should throw an error when an item is not found", async () => {
      item.findById.mockResolvedValueOnce(null);
      try {
        await orderService.createOrder(mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["itemMissing"].status);
        expect(error.message).toEqual(errorHandler["itemMissing"].message);
      }
    });
    it("should throw an error when the user address is not found", async () => {
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(null);
      try {
        await orderService.createOrder(mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["addressMissing"].status);
        expect(error.message).toEqual(errorHandler["addressMissing"].message);
      }
    });
    it("should throw an error when a restaurant branch within 5m radius is not found", async () => {
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(mockAddress);
      branch.findOne.mockResolvedValueOnce(null);
      try {
        await orderService.createOrder(mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["orderBranchMissing"].status);
        expect(error.message).toEqual(
          errorHandler["orderBranchMissing"].message
        );
      }
    });
  });
  describe("acceptOrRejectOrder", () => {
    it("should call updateOne with the correct parameters to accept or reject order ", async () => {
      const status = orderConfig.acceptedStatus;
      order.updateOne.mockResolvedValueOnce({ nModified: 1, ok: 1 });
      const result = await orderService.acceptOrRejectOrder(
        mockOrder._id,
        status
      );
      expect(order.updateOne).toHaveBeenCalledWith(
        { _id: mockOrder._id, status: config.pendingStatus },
        { $set: { status: status } }
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
    });
    it("should return 0 modified orders when no matching order is found", async () => {
      const status = orderConfig.acceptedStatus;
      order.updateOne.mockResolvedValueOnce({ nModified: 0 });

      const result = await orderService.acceptOrRejectOrder(
        mockOrder._id,
        status
      );

      expect(result).toEqual({ nModified: 0 });
      expect(order.updateOne).toHaveBeenCalledWith(
        { _id: mockOrder._id, status: config.pendingStatus },
        { $set: { status } }
      );
    });
  });
  describe("cancelOrder", () => {
    it("should update the order status when a matching order is found", async () => {
      mockOrder.status = config.pendingStatus;
      order.updateOne.mockResolvedValueOnce({ nModified: 1 });

      const result = await orderService.cancelOrder(mockOrder._id, mockUserId);

      expect(result).toEqual({ nModified: 1 });
      expect(order.updateOne).toHaveBeenCalledWith(
        {
          _id: mockOrder._id,
          status: config.pendingStatus,
          userId: mockUserId,
        },
        { status: orderConfig.canceledStatus }
      );
    });
    it("should return 0 modified orders when no matching order is found", async () => {
      mockOrder.status = config.pendingStatus;
      order.updateOne.mockResolvedValueOnce({ nModified: 0 });

      const result = await orderService.cancelOrder(mockOrder._id, mockUserId);

      expect(result).toEqual({ nModified: 0 });
      expect(order.updateOne).toHaveBeenCalledWith(
        {
          _id: mockOrder._id,
          status: config.pendingStatus,
          userId: mockUserId,
        },
        { status: orderConfig.canceledStatus }
      );
    });
  });
  describe("updateOrder function", () => {
    it("should update the order successfully", async () => {
      mockOrder.userId = mockUserId;
      const reqBody = {
        orderItems: mockOrder.orderItems,
        userId: mockOrder.userId,
        addressId: mockOrder.addressId,
        branchId: mockOrder.branchId,
        status: mockOrder.status,
        totalPrice: mockOrder.totalPrice,
        dateOrdered: "2023-10-26T12:00:00.000Z",
      };
      order.findById.mockResolvedValueOnce(mockOrder);
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(mockAddress);
      branch.findOne.mockResolvedValueOnce(mockBranch);
      mockOrder.save.mockResolvedValueOnce({
        _id: mockOrder._id,
        orderItems: reqBody.orderItems,
        userId: reqBody.userId,
        addressId: reqBody.addressId,
        branchId: reqBody.branchId,
        status: reqBody.status,
        totalPrice: reqBody.totalPrice,
        dateOrdered: "2023-10-26T12:00:00.000Z",
      });

      const result = await orderService.updateorder(
        mockOrder._id,
        reqBody,
        mockUserId
      );

      expect(result).toEqual({
        _id: mockOrder._id,
        orderItems: reqBody.orderItems,
        userId: reqBody.userId,
        addressId: reqBody.addressId,
        branchId: reqBody.branchId,
        status: reqBody.status,
        totalPrice: reqBody.totalPrice,
        dateOrdered: reqBody.dateOrdered,
      });
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it("should throw an error when the order is missing", async () => {
      order.findById.mockResolvedValueOnce(null);
      try {
        await orderService.updateorder(mockOrder._id, mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["orderMissing"].status);
        expect(error.message).toEqual(errorHandler["orderMissing"].message);
      }
    });
    it("should throw an error when the userId is not equal to the userId in the order", async () => {
      order.findById.mockResolvedValueOnce(mockOrder);
      try {
        await orderService.updateorder(
          mockOrder._id,
          mockOrder,
          new mongoose.Types.ObjectId()
        );
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should throw an error when the status is not pending", async () => {
      order.findById.mockResolvedValueOnce(mockOrder);
      mockOrder.status = orderConfig.acceptedStatus;
      try {
        await orderService.updateorder(mockOrder._id, mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should throw an error when an item is missing", async () => {
      mockOrder.status = config.pendingStatus;
      order.findById.mockResolvedValueOnce(mockOrder);
      item.findById.mockResolvedValueOnce(null);
      try {
        await orderService.updateorder(mockOrder._id, mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["itemMissing"].status);
        expect(error.message).toEqual(errorHandler["itemMissing"].message);
      }
    });
    it("should throw an error when the address is missing", async () => {
      order.findById.mockResolvedValueOnce(mockOrder);
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(null);
      try {
        await orderService.updateorder(mockOrder._id, mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["addressMissing"].status);
        expect(error.message).toEqual(errorHandler["addressMissing"].message);
      }
    });

    it("should throw an error when the branch is missing", async () => {
      order.findById.mockResolvedValueOnce(mockOrder);
      item.findById.mockResolvedValueOnce(mockItem);
      address.findById.mockResolvedValueOnce(mockAddress);
      branch.findOne.mockResolvedValueOnce(null);
      try {
        await orderService.updateorder(mockOrder._id, mockOrder, mockUserId);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["orderBranchMissing"].status);
        expect(error.message).toEqual(
          errorHandler["orderBranchMissing"].message
        );
      }
    });
  });
  describe("getHistory function", () => {
    it("should return orders with a status other than 'Pending'", async () => {
      mockOrder.status = orderConfig.acceptedStatus;
      order.aggregate.mockResolvedValue(mockOrder);
      const result = await orderService.getHistory(
        mockUserId,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(order.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: mockUserId,
            status: { $ne: config.pendingStatus },
          },
        },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
      expect(result).toEqual(mockOrder);
    });

    it("should return an empty array when the user hasn't made any order", async () => {
      order.aggregate.mockResolvedValue([]);
      const result = await orderService.getHistory(
        mockUserId,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(order.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: mockUserId,
            status: { $ne: config.pendingStatus },
          },
        },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
      expect(result).toEqual([]);
    });
  });
});
