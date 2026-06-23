// services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user"); // Import our Model layer

const register = async (email, phone, password) => {
  const existingEmail = await userModel.findUserByEmail(email);
  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  const existingPhone = await userModel.findUserByPhone(phone);
  if (existingPhone) {
    throw new Error("Phone number is already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await userModel.createUser({
    email,
    phone,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET || "fallback_secret_key",
  );

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
    },
    token,
  };
};

module.exports = {
  register,
};
