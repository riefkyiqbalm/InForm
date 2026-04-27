// src/lib/prisma.ts
import { PrismaClient } from "../../generated/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Import the adapter
import pg from "pg"; // Or 'neon-serverless' if using Vercel/Neon

const connectionString = `${process.env.DATABASE_URL}`;

// Create the pool/connection
const pool = new pg.Pool({ connectionString });

// Create the adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // <--- PASS THE ADAPTER HERE
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;