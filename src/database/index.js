import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;
let pool = null;

if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.startsWith("prisma://") || process.env.DATABASE_URL.startsWith("prisma+postgres://")) {
    const prismaOptions = {
      accelerateUrl: process.env.DATABASE_URL,
    };
    if (process.env.NODE_ENV === "production") {
      prisma = new PrismaClient({
        ...prismaOptions,
        log: ["error", "warn"],
      });
    } else {
      if (!global.globalPrisma) {
        global.globalPrisma = new PrismaClient({
          ...prismaOptions,
          log: ["query", "info", "warn", "error"],
        });
      }
      prisma = global.globalPrisma;
    }
  } else {
    // For standard postgresql:// connection strings, use pg pool and PrismaPg adapter for Prisma 7
    if (process.env.NODE_ENV === "production") {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      prisma = new PrismaClient({
        adapter,
        log: ["error", "warn"],
      });
    } else {
      if (!global.globalPrisma) {
        global.globalPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(global.globalPool);
        global.globalPrisma = new PrismaClient({
          adapter,
          log: ["query", "info", "warn", "error"],
        });
      }
      pool = global.globalPool;
      prisma = global.globalPrisma;
    }
  }
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

export { prisma, dbConnect, pool };