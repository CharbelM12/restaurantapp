const mongoose = require("mongoose");
const errorHandler = require("../errors");
const branch = require("./branchModel");
const order = require("../order/orderModel");
const orderConfig = require("../order/orderConfig");
const config = require("../configurations/config");
class BranchService {
  async getBranches(branchId, page, limit) {
    const matchStage = {};
    branchId
      ? (matchStage._id = new mongoose.Types.ObjectId(branchId))
      : undefined;
    return await branch.aggregate([
      { $match: { ...matchStage } },
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
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
  async createBranch(reqBody, userId) {
    return new branch({
      branchName: reqBody.branchName,
      location: {
        coordinates: reqBody.location.coordinates,
      },
      phoneNumber: reqBody.phoneNumber,
      services: reqBody.services,
      createdBy: userId,
    }).save();
  }
  async updateBranch(branchId, reqBody, userId) {
    const updateData = {};
    const pendingOrder = await order.findOne({
      branchId: new mongoose.Types.ObjectId(branchId),
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
      return await branch.updateOne(
        {
          _id: new mongoose.Types.ObjectId(branchId),
        },
        {
          $set: reqBody,
          location: updateData.location,
          updatedBy: userId,
        }
      );
    }
  }
  async deleteBranch(branchId) {
    const pendingOrder = await order.findOne({
      branchId: new mongoose.Types.ObjectId(branchId),
      status: config.pendingStatus,
    });
    if (pendingOrder) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      return await branch.deleteOne({
        _id: new mongoose.Types.ObjectId(branchId),
      });
    }
  }
}
module.exports = BranchService;
