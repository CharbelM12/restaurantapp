const mongoose = require("mongoose");
const errorHandler = require("../errors");
const address = require("./addressModel");
const config = require("../configurations/config");
const order = require("../order/orderModel");
const addressConfig = require("./addressConfig");
class AddressService {
  async getAddresses(userId, addressId,page,limit) {
    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    addressId
      ? (matchStage._id = new mongoose.Types.ObjectId(addressId))
      : undefined;
    return await address.aggregate([
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          label: 1,
          completeAddress: 1,
          location: 1,
          userId: 1,
        },
      },   
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
  async createAddress(reqBody, userId) {
    return new address({
      label: reqBody.label,
      completeAddress: reqBody.completeAddress,
      location: {
        coordinates: reqBody.location.coordinates,
      },
      userId: userId,
    }).save();
  }
  async updateAddress(addressId, reqBody, userId) {
    const updateData = {};
    const pendingOrder = await order.findOne({
      addressId: new mongoose.Types.ObjectId(addressId),
      status: config.pendingStatus,
    });
    if (pendingOrder) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      if (reqBody.location && reqBody.location.coordinates) {
        updateData.location = {
          type: config.pointLocationType,
          coordinates: reqBody.location.coordinates,
        };
      } else {
        updateData.location = undefined;
      }
      return await address.updateOne(
        {
          _id: addressId,
          userId: userId,
        },
        {
          $set: reqBody,
          location: updateData.location,
        }
      );
    }
  }
  async deleteAddress(addressId,userId) {
    const pendingOrder = await order.findOne({
      addressId: new mongoose.Types.ObjectId(addressId),
      status: config.pendingStatus,
    });
    if (pendingOrder) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      return await address.deleteOne({
        _id: new mongoose.Types.ObjectId(addressId),
        userId:userId
      });
    }
  }
}
module.exports = AddressService;
