const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const branchSchema = new Schema({
  branchName: String,
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
  },
  phoneNumber: String,
  services: [String],
  isOpen: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
branchSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Branch", branchSchema);
