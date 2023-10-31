const order = require("./orderModel");
const item = require("../item/itemModel");
const address = require("../address/addressModel");
const branch = require("../branch/branchModel");
const mongoose = require("mongoose");
const errorHandler = require("../errors");
const orderConfig = require("./orderConfig");
const orderAggregation = require("./orderAggregation");
const moment = require("moment");
const config = require("../configurations/config");

class OrderService {
  async getOrders(userId, page, limit) {
    return await order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: config.pendingStatus,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
  async getOrder(userId, orderId) {
    const displayedOrder = await order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
      orderAggregation.userLookup,
      orderAggregation.userUnwind,
      orderAggregation.branchLookup,
      orderAggregation.branchUnwind,
      orderAggregation.addressLookup,
      orderAggregation.addressUnwind,
      orderAggregation.orderProject,
    ]);
    if (displayedOrder && displayedOrder.length > 0) {
      if (displayedOrder[0].userId.toString() !== userId.toString()) {
        throw {
          status: errorHandler["forbidden"].status,
          message: errorHandler["forbidden"].message,
        };
      } else {
        return displayedOrder[0];
      }
    } else {
      throw {
        status: errorHandler["orderMissing"].status,
        message: errorHandler["orderMissing"].message,
      };
    }
  }
  async adminOrders(orderId, page, limit) {
    const matchStage = {};
    orderId
      ? (matchStage._id = new mongoose.Types.ObjectId(orderId))
      : undefined;
    return await order.aggregate([
      { $match: { ...matchStage } },
      orderAggregation.userLookup,
      orderAggregation.userUnwind,
      orderAggregation.branchLookup,
      orderAggregation.branchUnwind,
      orderAggregation.addressLookup,
      orderAggregation.addressUnwind,
      orderAggregation.orderProject,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
  async createOrder(reqBody, userId) {
    let totalPrice = 0;
    for (const orderItem of reqBody.orderItems) {
      const foundItem = await item.findById(orderItem._id);
      if (!foundItem) {
        throw {
          status: errorHandler["itemMissing"].status,
          message: errorHandler["itemMissing"].message,
        };
      } else {
        const itemTotalPrice = foundItem.price * orderItem.quantity;
        totalPrice += itemTotalPrice;
        orderItem.itemName = foundItem.itemName;
      }
    }
    const foundAddress = await address.findById(reqBody.addressId);
    if (!foundAddress) {
      throw {
        status: errorHandler["addressMissing"].status,
        message: errorHandler["addressMissing"].message,
      };
    } else if(foundAddress.userId.toString() !== userId.toString()){
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    }else {
      const selectedBranch = await branch.findOne({
        isOpen: orderConfig.branchIsOpen,
        location: {
          $nearSphere: {
            $geometry: foundAddress.location,
            $maxDistance: orderConfig.branchMaxDistance,
          },
        },
      });
      if (selectedBranch === orderConfig.branchMissingValue) {
        throw {
          status: errorHandler["orderBranchMissing"].status,
          message: errorHandler["orderBranchMissing"].message,
        };
      } else {
        const newOrder = new order({
          orderItems: reqBody.orderItems,
          userId: userId,
          addressId: reqBody.addressId,
          branchId: selectedBranch._id,
          totalPrice: totalPrice,
        });
        return await newOrder.save();
      }
    }
  }

  async acceptOrRejectOrder(orderId, status) {
    return await order.updateOne(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        status: config.pendingStatus,
      },
      { $set: { status: status } }
    );
  }
  async cancelOrder(orderId, userId) {
    return await order.updateOne(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        status: config.pendingStatus,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { status: orderConfig.canceledStatus }
    );
  }
  async updateorder(orderId, reqBody, userId) {
    const foundOrder = await order.findById(orderId);
    if (!foundOrder) {
      throw {
        status: errorHandler["orderMissing"].status,
        message: errorHandler["orderMissing"].message,
      };
    } else if (foundOrder.userId.toString() !== userId.toString()) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else if (foundOrder.status !== config.pendingStatus) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else {
      if (reqBody.orderItems) {
        let totalPrice = 0;
        for (const orderItem of reqBody.orderItems) {
          const foundItem = await item.findById(orderItem._id);
          if (!foundItem) {
            throw {
              status: errorHandler["itemMissing"].status,
              message: errorHandler["itemMissing"].message,
            };
          } else {
            const itemTotalPrice = foundItem.price * orderItem.quantity;
            totalPrice += itemTotalPrice;
            orderItem.itemName = foundItem.itemName;
          }
        }
        foundOrder.orderItems = reqBody.orderItems;
        foundOrder.totalPrice = totalPrice;
      } else {
      }
      if (reqBody.addressId) {
        const foundAddress = await address.findById(reqBody.addressId);
        if (!foundAddress) {
          throw {
            status: errorHandler["addressMissing"].status,
            message: errorHandler["addressMissing"].message,
          };
        } else if(foundAddress.userId.toString() !== userId.toString()){
          throw {
            status: errorHandler["forbidden"].status,
            message: errorHandler["forbidden"].message,
          };
        } else {
          const selectedBranch = await branch.findOne({
            isOpen: orderConfig.branchIsOpen,
            location: {
              $nearSphere: {
                $geometry: foundAddress.location,
                $maxDistance: orderConfig.branchMaxDistance,
              },
            },
          });
          if (selectedBranch === orderConfig.branchMissingValue) {
            throw {
              status: errorHandler["orderBranchMissing"].status,
              message: errorHandler["orderBranchMissing"].message,
            };
          } else {
            foundOrder.addressId = reqBody.addressId;
            foundOrder.branchId = selectedBranch;
          }
        }
      } else {
      }
      foundOrder.dateOrdered = moment();
      return await foundOrder.save();
    }
  }
  async getHistory(userId, page, limit) {
    return await order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $ne: config.pendingStatus },
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
  }
}
module.exports = OrderService;
