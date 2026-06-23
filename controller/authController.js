// controllers/authController.js
const prisma = require("../models/prisma");
const { sendVerificationEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const User = require("../models/user");

const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string().min(5).max(255).required().email(),
  phone: Joi.string().min(9).required(),
  password: Joi.string().min(5).max(50).required(),
});

const registerUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existingEmail = await User.findUserByEmail(email);
    if (existingEmail)
      return res.status(400).send("Email is already registered.");

    const existingPhone = await User.findUserByPhone(phone);
    if (existingPhone)
      return res.status(400).send("Phone number is already registered.");

    const result = await authService.register(email, phone, password);

    return res.status(201).json({
      message: "User registered successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const requestOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required.");

  try {
    // Check if user exists in your database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send("User account not found.");

    // Generate a secure 6-digit number string
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes from right now

    // Save the OTP data to the user row in PostgreSQL
    await prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpires: expiresAt,
      },
    });

    // Send the email using your Gmail account completely for free
    const isSent = await sendVerificationEmail(email, otpCode);
    if (!isSent)
      return res.status(500).send("Failed to send code via email server.");

    return res
      .status(200)
      .json({ message: "Verification code sent to your Gmail inbox!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 2. CONFIRM SUBMITTED CODE
 */
const verifyOTP = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).send("Email and code are required.");

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send("User not found.");

    // Check if the submitted code matches and has not expired
    if (user.otpCode !== code) {
      return res.status(400).send("Invalid verification code.");
    }
    if (new Date() > user.otpExpires) {
      return res.status(400).send("Verification code has expired.");
    }

    // Clear out the OTP code fields since it was successfully consumed
    await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpires: null },
    });

    // Code is perfect! Generate their login session JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Verification successful!",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { requestOTP, verifyOTP };

ports = {
  registerUser,
};
