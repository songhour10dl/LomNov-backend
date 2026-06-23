// models/user.js
const prisma = require("./prisma"); // Import the client we just created

// Function to find a user by email (useful for login)
const findUserByEmail = (email) => {
  return prisma.user.findFirst({
    where: {
      email: email,
    },
  });
};

// Function to find a user by phone
const findUserByPhone = async (phone) => {
  return await prisma.user.findUnique({
    where: { phone },
  });
};

// Function to register a new user
const createUser = async (userData) => {
  return await prisma.user.create({
    data: {
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Note: We will hash this in the Service layer later!
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  createUser,
};
