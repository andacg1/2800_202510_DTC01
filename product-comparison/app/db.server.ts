import { PrismaClient } from "@prisma/client";

/**
 * Global declaration for the Prisma client instance.
 * This ensures proper type checking for the global prisma instance.
 */
declare global {
  var prismaGlobal: PrismaClient;
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

/**
 * Singleton instance of PrismaClient.
 * Uses global instance in development to prevent multiple instances during hot reloading.
 * Creates new instance in production.
 */
const prisma = global.prismaGlobal ?? new PrismaClient();

export default prisma;
