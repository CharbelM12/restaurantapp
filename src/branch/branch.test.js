const mongoose = require("mongoose");
const BranchService = require("./branchService");
const branchService = new BranchService();
const branch = require("./branchModel");
const order = require("../order/orderModel");
const errorHandler = require("../errors");
const config = require("../configurations/config");
jest.mock("./branchModel");
jest.mock("../order/orderModel");
const mockUserId = new mongoose.Types.ObjectId();
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
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
};
const mockOrder = {
  _id: new mongoose.Types.ObjectId(),
  orderItems: [
    {
      _id: new mongoose.Types.ObjectId(),
      quantity: 1,
      itemName: "itemName",
    },
  ],
  userId: mockUserId,
  addressId: new mongoose.Types.ObjectId(),
  branchId: new mongoose.Types.ObjectId(),
  status: config.pendingStatus,
  totalPrice: 10,
  dateOrdered: "2023-6-22T12:00:00.000Z",
};
describe("branchService", () => {
  describe("getBranches function", () => {
    it("should return all branches when no branchId is provided", async () => {
      branch.aggregate.mockResolvedValueOnce([mockBranch]);

      const result = await branchService.getBranches(
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toBeInstanceOf(Array);
      result.forEach((branch) => {
        expect(branch).toHaveProperty("_id");
        expect(branch).toHaveProperty("branchName");
        expect(branch).toHaveProperty("location");
        expect(branch).toHaveProperty("phoneNumber");
        expect(branch).toHaveProperty("services");
        expect(branch).toHaveProperty("isOpen");
        expect(branch).toHaveProperty("createdBy");
        expect(branch).toHaveProperty("updatedBy");
      });
    });
    it("should return the branch that matches the provided branchId", async () => {
      branch.aggregate.mockResolvedValueOnce([mockBranch]);
      const result = await branchService.getBranches(
        mockBranch._id,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(mockBranch._id);
      expect(result[0].branchName).toEqual(mockBranch.branchName);
      expect(result[0].location).toEqual(mockBranch.location);
      expect(result[0].phoneNumber).toEqual(mockBranch.phoneNumber);
      expect(result[0].services).toEqual(mockBranch.services);
      expect(result[0].isOpen).toEqual(mockBranch.isOpen);
      expect(result[0].createdBy).toEqual(mockBranch.createdBy);
      expect(result[0].updatedBy).toEqual(mockBranch.updatedBy);
    });
    it("should return an empty array if there are no branches created", async () => {
      branch.aggregate.mockResolvedValueOnce([]);

      const result = await branchService.getBranches(
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toEqual([]);
      expect(branch.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        {
          $project: {
            _id: 1,
            branchName: 1,
            location: 1,
            phoneNumber: 1,
            services: 1,
            isOpen: 1,
            createdBy: 1,
            updatedBy: 1,
          },
        },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });
  describe("createBranch function", () => {
    it("should create and save a branch with the provided data", async () => {
      branch.prototype.save.mockResolvedValueOnce({
        branchName: mockBranch.branchName,
        location: mockBranch.location,
        phoneNumber: mockBranch.phoneNumber,
        services: mockBranch.services,
        isOpen: mockBranch.isOpen,
        createdBy: mockUserId,
      });

      const result = await branchService.createBranch(mockBranch, mockUserId);
      expect(branch.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({
        branchName: mockBranch.branchName,
        location: mockBranch.location,
        phoneNumber: mockBranch.phoneNumber,
        services: mockBranch.services,
        isOpen: mockBranch.isOpen,
        createdBy: mockUserId,
      });
    });
  });
  describe("updateBranch function", () => {
    it("should throw a forbidden error when has pending orders", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await branchService.updateBranch(
          mockBranch._id,
          mockBranch,
          mockUserId
        );
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });

    it("should update branch when it does not have pending orders", async () => {
      order.findOne.mockResolvedValueOnce(null);
      branch.updateOne.mockReturnValueOnce({ nModified: 1, ok: 1 });
      const result = await branchService.updateBranch(
        mockBranch._id,
        mockBranch,
        mockUserId
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
      expect(branch.updateOne).toHaveBeenCalledWith(
        {
          _id: mockBranch._id,
        },
        {
          $set: mockBranch,
          location: mockBranch.location,
          updatedBy: mockUserId,
        }
      );
    });
  });
  describe("deleteBranch function", () => {
    it("should throw a forbidden error when the branch have a pending order", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await branchService.deleteBranch(mockBranch._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should delete branch when it does not have a pending order", async () => {
      order.findOne.mockResolvedValueOnce(null);
      branch.deleteOne.mockReturnValueOnce({ n: 1, ok: 1, deletedCount: 1 });
      const result = await branchService.deleteBranch(mockBranch._id);
      expect(result).toEqual({ n: 1, ok: 1, deletedCount: 1 });
    });
  });
});
