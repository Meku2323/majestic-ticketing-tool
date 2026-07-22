import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connection to MySQL via Prisma Client established successfully.');
  } catch (error) {
    console.error('❌ Failed to establish database connection:', error.message);
    process.exit(1);
  }
}

export default prisma;
