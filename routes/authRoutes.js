// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { otpLimiter } = require("../middleware/rateLimiter");
const { verify } = require("jsonwebtoken");

//Lessor
router.post("/register-lessor", otpLimiter, authController.registerLessor);
router.post("/verify-register-lessor", authController.verifyRegisterLessor);
router.post("/login-lessor", authController.loginLessor);

// tenet
router.post("/register", otpLimiter, authController.registerUser);
router.post("/verify-register", authController.verifyRegister);
router.post("/login", authController.login);
module.exports = router;
