const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      trim: true,
      min: 10,
      max: 20,
    },
    lastName: {
      type: String,
      require: true,
      trim: true,
      min: 10,
      max: 20,
    },
    restaurantName: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    cellNo: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
