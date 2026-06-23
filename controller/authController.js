// controllers/authController.js
const prisma = require("../models/prisma");
const { sendVerificationEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 1 minutes from now

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.upsert({
      where: { email },
      update: { phone, password: hashedPassword, otpCode, otpExpires },
      create: { email, phone, password: hashedPassword, otpCode, otpExpires },
    });

    const emailSent = await sendVerificationEmail(email, otpCode);
    if (!emailSent)
      return res.status(500).send("Failed to send verification email.");

    return res.status(200).json({
      message:
        "Verification code sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const verifyRegister = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).send("Email and verification code are required.");

  try {
    // Find the pending user profile
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpCode)
      return res.status(404).send("Registration session not found.");

    // Validate the code and check expiration
    if (user.otpCode !== code)
      return res.status(400).send("Invalid verification code.");
    if (new Date() > user.otpExpires)
      return res.status(400).send("Verification code has expired.");

    // Success! Clear out the OTP fields so they can't be reused
    const activeUser = await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpires: null },
    });

    // Generate the official JWT authentication session token
    const token = jwt.sign(
      { userId: activeUser.id, email: activeUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      message: "Registration completed successfully!",
      token,
      user: {
        id: activeUser.id,
        email: activeUser.email,
        phone: activeUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, verifyRegister };
