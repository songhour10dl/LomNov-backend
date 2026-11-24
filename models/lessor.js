const prisma = require("./prisma"); // Import the client we just created

// Function to find a user by email (useful for login)
const findUserByEmail = (email) => {
  return prisma.lessor.findFirst({
    where: {
      email: email,
    },
  });
};

// Function to find a user by phone
const findUserByPhone = async (phone) => {
  return await prisma.lessor.findUnique({
    where: { phone },
  });
};

// Function to register a new user
const createUser = async (userData) => {
  return await prisma.lessor.create({
    data: {
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Note: We will hash this in the Service layer later!
      dateOfBirth: userData.dateOfBirth,
      role: userData.role,
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  createUser,
};
