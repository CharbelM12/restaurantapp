const mongoose = require("mongoose");
const AddressService = require("./addressService");
const addressService = new AddressService();
const address = require("./addressModel");
const order = require("../order/orderModel");
const errorHandler = require("../errors");
const config = require("../configurations/config");
jest.mock("./addressModel");
jest.mock("../order/orderModel");
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
describe("addressService", () => {
  describe("getAddresses function", () => {
    it("should return all addresses when no addressId is provided", async () => {
      address.aggregate.mockResolvedValueOnce([mockAddress]);

      const result = await addressService.getAddresses(
        mockUserId,
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toBeInstanceOf(Array);
      result.forEach((address) => {
        expect(address).toHaveProperty("_id");
        expect(address).toHaveProperty("label");
        expect(address).toHaveProperty("location");
        expect(address).toHaveProperty("completeAddress");
        expect(address).toHaveProperty("userId");
      });
    });
    it("should return the address that matches the provided addressId", async () => {
      address.aggregate.mockResolvedValueOnce([mockAddress]);
      const result = await addressService.getAddresses(
        mockUserId,
        mockAddress._id,
        config.defaultPageNumber,
        config.defaultPagelimit
      );
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(mockAddress._id);
      expect(result[0].label).toEqual(mockAddress.label);
      expect(result[0].location).toEqual(mockAddress.location);
      expect(result[0].completeAddress).toEqual(mockAddress.completeAddress);
      expect(result[0].userId).toEqual(mockAddress.userId);
    });
    it("should return an empty array if the user has not created any address", async () => {
      address.aggregate.mockResolvedValueOnce([]);

      const result = await addressService.getAddresses(
        mockUserId,
        undefined,
        config.defaultPageNumber,
        config.defaultPagelimit
      );

      expect(result).toEqual([]);
      expect(address.aggregate).toHaveBeenCalledWith([
        { $match: { userId: mockUserId } },
        {
          $project: {
            _id: 1,
            label: 1,
            completeAddress: 1,
            location: 1,
            userId: 1,
          },
        },
        { $skip: (config.defaultPageNumber - 1) * config.defaultPagelimit },
        { $limit: config.defaultPagelimit },
      ]);
    });
  });
  describe("createAddress function", () => {
    it("should create and save an address with the provided data", async () => {
      address.prototype.save.mockResolvedValueOnce({
        label: mockAddress.label,
        completeAddress: mockAddress.completeAddress,
        location: mockAddress.location,
        userId: mockUserId,
      });

      const result = await addressService.createAddress(
        mockAddress,
        mockUserId
      );
      expect(address.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({
        label: mockAddress.label,
        completeAddress: mockAddress.completeAddress,
        location: mockAddress.location,
        userId: mockUserId,
      });
    });
  });
  describe("updateAddress function", () => {
    it("should throw a forbidden error when address is in pending order", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await addressService.updateAddress(
          mockAddress._id,
          mockAddress,
          mockUserId
        );
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });

    it("should update address when it is not in a pending order", async () => {
      order.findOne.mockResolvedValueOnce(null);
      address.updateOne.mockReturnValueOnce({
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1
    });
      const result = await addressService.updateAddress(
        mockAddress._id,
        mockAddress,
        mockUserId
      );
      expect(result).toEqual({
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1
    });
      expect(address.updateOne).toHaveBeenCalledWith(
        {
          _id: mockAddress._id,
          userId: mockUserId,
        },
        {
          $set: mockAddress,
          location: mockAddress.location,
        }
      );
    });
  });
  describe("deleteAddress function", () => {
    it("should throw a forbidden error when the address is in a pending order", async () => {
      order.findOne.mockResolvedValueOnce(mockOrder);
      try {
        await addressService.deleteAddress(mockAddress._id);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should delete address when it is not in a pending order", async () => {
      order.findOne.mockResolvedValueOnce(null);
      address.deleteOne.mockReturnValueOnce({
        acknowledged: true,
        deletedCount: 1
    });
      const result = await addressService.deleteAddress(mockAddress._id);
      expect(result).toEqual({
        acknowledged: true,
        deletedCount: 1
    });
    });
  });
});
