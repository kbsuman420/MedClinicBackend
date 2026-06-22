import { PrismaClient } from "@prisma/client";

let prisma;

// For Prisma 7 and Prisma Postgres (prisma+postgres://), we pass the DATABASE_URL via accelerateUrl
const prismaOptions = {
  accelerateUrl: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    ...prismaOptions,
    log: ["error", "warn"],
  });
} else {
  // In development, cache the connection across hot reloads to prevent database connection limits from being reached
  if (!global.globalPrisma) {
    global.globalPrisma = new PrismaClient({
      ...prismaOptions,
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.globalPrisma;
}

async function dbConnect() {
  try {
    await prisma.$connect();
    console.log("🟢 Prisma database client connected successfully");
  } catch (error) {
    console.error("🔴 Prisma database connection failed", error);
    process.exit(1);
  }
}

export { prisma, dbConnect };