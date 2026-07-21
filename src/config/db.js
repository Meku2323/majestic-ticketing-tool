import { PrismaClient } from '@prisma/client';

// Explicitly construct the target database URL inside application runtime memory space
// This completely protects the password string parameters from terminal or config parser strip bugs
const dbUser = process.env.DB_USER || 'avnadmin';
const dbPassword = process.env.DB_PASSWORD || 'AVNS_r5Mb3wnmk7upj2NjLaJ';
const dbHost = process.env.DB_HOST || '://aivencloud.com';
const dbPort = process.env.DB_PORT || '28015';
const dbName = process.env.DB_NAME || 'defaultdb';

const dynamicUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dynamicUrl,
    },
  },
  log: ['error', 'warn'],
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
