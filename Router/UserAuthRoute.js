const express = require("express");
const router = express.Router();

const { userRegistration } = require("../Controllers/UserAuthController");

router.post("/userRegistration", userRegistration);

module.exports = router;
