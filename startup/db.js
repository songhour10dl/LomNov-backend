// startup/db.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Test the connection on startup
prisma
  .$connect()
  .then(() => {
    console.log("✅ PostgreSQL Connection established via Prisma");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection failed:", err);
  });

module.exports = prisma;
