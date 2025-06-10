const express = require("express");
const router = express.Router();

const {
  basicChat,
  getLatestChatByUserId,
} = require("../Controllers/AiChatController");

router.post("/basicChat", basicChat);
router.post("/getLatestChatByUserId", getLatestChatByUserId);

module.exports = router;
