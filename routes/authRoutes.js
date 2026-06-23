// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { otpLimiter } = require("../middleware/rateLimiter");
const { verify } = require("jsonwebtoken");

// Map a POST request on "/register" to our controller function
router.post("/register", otpLimiter, authController.registerUser);
router.post("/verify-register", authController.verifyRegister);
module.exports = router;
