import { PrismaClient } from '@prisma/client';

// Hardcoded explicit configuration to bypass Render's dashboard completely
const dbUser = 'avnadmin';
const dbPassword = 'AVNS_r5Mb3wnmk7upj2NjLaJ'; // Your exact working password
const dbHost = '://aivencloud.com';
const dbPort = '28015';
const dbName = 'defaultdb';

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
