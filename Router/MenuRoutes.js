const express = require("express");
const router = express.Router();

const { menuCreation } = require("../Controllers/MenuController");

router.post("/menuCreation", menuCreation);

module.exports = router;
