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
  dateOfBirth: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[1])\/\d{4}$/)
    // .optional()
    .required()
    .messages({
      "string.pattern.base": "Date of birth must be in MM/DD/YYYY format",
    }),
});

const registerUser = async (req, res) => {
  try {
    const { email, phone, dateOfBirth, password } = req.body;

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

    let parsedDate = null;
    if (dateOfBirth) {
      const [month, day, year] = dateOfBirth.split("/");
      parsedDate = new Date(`${year}-${month}-${day}`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.upsert({
      where: { email },
      update: {
        phone,
        password: hashedPassword,
        dateOfBirth: parsedDate,
        otpCode,
        otpExpires,
      },
      create: {
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: parsedDate,
        otpCode,
        otpExpires,
      },
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
