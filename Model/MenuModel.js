const mongoose = require("mongoose");

const menuItems = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
  },
});

const menu = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  menuItems: [menuItems],
});

const UserSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
      trim: true,
    },
    menu: [menu],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("menu", UserSchema);
