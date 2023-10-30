const mongoose = require("mongoose");
const moment = require("moment");
const config = require("../configurations/config");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderItems: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
      quantity: Number,
      itemName: String,
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: "Branch",
  },
  status: {
    type: String,
    default: config.pendingStatus,
  },
  totalPrice: Number,
  dateOrdered: {
    type: Date,
    default: moment(),
  },
});
orderSchema.index({userId:1})
orderSchema.index({addressId:1})
orderSchema.index({ranchId:1})
orderSchema.index({status:1})
module.exports = mongoose.model("Order", orderSchema);
