// Prisma client singleton (avoids exhausting connections during dev hot-reload).
import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { __PRISMA__?: PrismaClient };

export const prisma = g.__PRISMA__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") g.__PRISMA__ = prisma;
