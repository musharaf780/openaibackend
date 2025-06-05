const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      require: true,
      default: [],
    },
    context: {
      type: [],
      require: true,
    },

    conversation: {
      type: [],
      require: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
