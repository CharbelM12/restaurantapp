const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const itemSchema = new Schema({
  itemName: String,
  itemDescription: String,
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  ingredients: String,
  price: Number,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  imageUrl: String,
});
itemSchema.index({ categoryId: 1 });
itemSchema.index({
  itemName: "text",
  ingredients: "text",
});
module.exports = mongoose.model("Item", itemSchema);
