const express = require("express");
const router = express.Router();

const {
  menuCreation,
  foodRecomandation,
} = require("../Controllers/MenuController");

router.post("/menuCreation", menuCreation);
router.post("/foodRecomandation", foodRecomandation);

module.exports = router;
