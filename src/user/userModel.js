const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    phoneNumber: String,
    favoriteItems: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.index({ email: 1 });

module.exports = mongoose.model("Users", userSchema);
