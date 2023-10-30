const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categoryName: String,
  categoryDescription: String,
  imageUrl: String,
  displayOrder: Number,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Category", categorySchema);
