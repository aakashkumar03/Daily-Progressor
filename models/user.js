const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      // email will be unique
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      required: true,
    },
    viewType: {
      // to be able to toggle the view type, default is daily
      type: String,
      default: "daily",
      enum: ["daily", "weekly"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
