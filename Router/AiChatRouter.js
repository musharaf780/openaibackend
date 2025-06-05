const express = require("express");
const router = express.Router();

const { basicChat } = require("../Controllers/AiChatController");

router.post("/basicChat", basicChat);

module.exports = router;
