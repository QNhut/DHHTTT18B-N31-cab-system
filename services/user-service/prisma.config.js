// prisma.config.js
const { PrismaClient } = require("@prisma/client");
require("dotenv").config(); // <--- BẮT BUỘC phải có dòng này để load .env

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // <--- chắc chắn phải đúng
    },
  },
});

module.exports = prisma;
