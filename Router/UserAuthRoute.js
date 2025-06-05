const express = require("express");
const router = express.Router();

const { userRegistration,userSignIn } = require("../Controllers/UserAuthController");

router.post("/userRegistration", userRegistration);
router.post("/userSignIn", userSignIn);

module.exports = router;
