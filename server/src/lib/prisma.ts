import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

let prismaClient: PrismaClient;

if (connectionString && connectionString !== 'postgresql://user:password@localhost:5432/academora') {
  // Use Neon adapter for real database URLs
  const adapter = new PrismaNeon({ connectionString });
  prismaClient = new PrismaClient({ adapter });
} else {
  // Fall back to standard PrismaClient (uses sqlite for dev)
  // This requires a valid .env or DATABASE_URL environment variable
  try {
    prismaClient = new PrismaClient();
  } catch (err) {
    console.error('Failed to initialize PrismaClient. Please set a valid DATABASE_URL in your .env file.');
    console.error('Error:', err);
    throw err;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
