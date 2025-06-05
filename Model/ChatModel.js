const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    context: {
      type: [],
      require: true,
    },

    chat: {
      type: [],
      require: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatSessions", UserSchema);
