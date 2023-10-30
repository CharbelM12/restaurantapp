const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const addressSchema = new Schema({
  label: String,
  completeAddress: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: [Number],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
addressSchema.index({userId:1})
addressSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Address", addressSchema);
