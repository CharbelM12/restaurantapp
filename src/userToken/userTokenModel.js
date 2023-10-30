const mongoose = require("mongoose");
const moment = require("moment");
const config = require("../configurations/config");

const Schema = mongoose.Schema;
const tokenSchema = new Schema({
  refreshToken: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: {
    type: Date,
    default: moment().add(config.userTokenExpiry, "s").toString(),
  },
});
tokenSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1 });
module.exports = mongoose.model("UserToken", tokenSchema);
