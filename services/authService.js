// services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user"); // Import our Model layer

const register = async (email, phone, password) => {
  // 1. Check if the email or phone is already taken
  const existingEmail = await userModel.findUserByEmail(email);
  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  const existingPhone = await userModel.findUserByPhone(phone);
  if (existingPhone) {
    throw new Error("Phone number is already registered");
  }

  // 2. Hash the password for security
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Save the user to PostgreSQL via the Model layer
  const newUser = await userModel.createUser({
    email,
    phone,
    password: hashedPassword,
  });

  // 4. Generate a JWT token so they are logged in immediately
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET || "fallback_secret_key", // remvoe this when deploy
  );

  // Return the user data (minus password) and the token
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
