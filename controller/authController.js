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

  dateOfBirth: Joi.date().iso().required(),

  role: Joi.string().valid("RENTER", "LANDLORD").optional(),
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

    // let parsedDate = null;
    // if (dateOfBirth) {
    //   const [month, day, year] = dateOfBirth.split("/");
    //   parsedDate = new Date(`${year}-${month}-${day}`);
    // }

    const parsedDate = new Date(dateOfBirth);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.upsert({
      where: { email },
      update: {
        phone,
        password: hashedPassword,
        dateOfBirth: parsedDate,
        // dateOfBirth: new Date(),
        otpCode,
        otpExpires,
      },
      create: {
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: parsedDate,
        // dateOfBirth: new Date(),
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
    return res.status(400).json("Email and verification code are required.");

  try {
    // Find the pending user profile
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpCode)
      return res.status(404).json("Registration session not found.");

    // Validate the code and check expiration
    if (user.otpCode !== code)
      return res.status(400).json("Invalid verification code.");
    if (new Date() > user.otpExpires)
      return res.status(400).json("Verification code has expired.");

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

const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const normalizedPhone = phone ? phone.trim() : undefined;

    // 1. Ensure password and at least one identifier (email or phone) is provided
    if (!password || (!email && !phone)) {
      return res.status(400).json({
        message:
          "Please provide your password and either an email or phone number.",
      });
    }

    let user = null;

    // 2. Find the user based on whether email or phone was submitted
    if (normalizedEmail) {
      user = await User.findUserByEmail(normalizedEmail);
    } else if (normalizedPhone) {
      user = await User.findUserByPhone(normalizedPhone);
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 3. Optional: Check if the user completed registration verification
    if (user.otpCode !== null) {
      return res.status(403).json({
        message: "Please verify your account before logging in.",
      });
    }

    // 4. Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 6. Return success response
    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyRegister, login };
