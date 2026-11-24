// services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const lessorModel = require("../models/lessor"); // Import our Model layer

const register = async (
  email,
  phone,
  password,
  dateOfBirth,
  role = "LANDLORD",
) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingEmail = await lessorModel.findUserByEmail(normalizedEmail);

  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  const existingPhone = await lessorModel.findUserByPhone(phone);
  if (existingPhone) {
    throw new Error("Phone number is already registered");
  }

  if (phone) {
    const existingPhone = await lessorModel.findUserByPhone(phone.trim());

    if (existingPhone) {
      throw new Error("Phone number is already registered");
    }
  }

  const validRoles = ["LANDLORD"];

  if (!validRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date of birth");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await lessorModel.createUser({
    email: normalizedEmail,
    phone: phone?.trim() || null,
    password: hashedPassword,
    dateOfBirth: parsedDate,
    role: "LANDLORD",
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
