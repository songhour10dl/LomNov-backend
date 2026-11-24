// services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user"); // Import our Model layer

const register = async (
  email,
  phone,
  password,
  dateOfBirth,
  role = "RENTER",
) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingEmail = await userModel.findUserByEmail(normalizedEmail);

  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  const existingPhone = await userModel.findUserByPhone(phone);
  if (existingPhone) {
    throw new Error("Phone number is already registered");
  }

  if (phone) {
    const existingPhone = await userModel.findUserByPhone(phone.trim());

    if (existingPhone) {
      throw new Error("Phone number is already registered");
    }
  }

  const validRoles = ["RENTER", "LANDLORD"];

  if (!validRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date of birth");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.createUser({
    email: normalizedEmail,
    phone: phone?.trim() || null,
    password: hashedPassword,
    dateOfBirth: parsedDate,
    role,
  });

  const token = jwt.sign(
    {
      userId: newUser.id,
      email: newUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      dateOfBirth: newUser.dateOfBirth,
      role: newUser.role,
    },
    token,
  };
};

module.exports = { register };
