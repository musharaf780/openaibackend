const express = require("express");
const router = express.Router();

const { translateToAribic } = require("../Controllers/TranslationController");

router.post("/translateToAribic", translateToAribic);

module.exports = router;
