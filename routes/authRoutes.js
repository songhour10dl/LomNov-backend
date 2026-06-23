// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Map a POST request on "/register" to our controller function
router.post("/register", authController.registerUser);

module.exports = router;
