
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import pkgPrisma from '../generated/prisma/index.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const { PrismaClient } = pkgPrisma;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'test_onboarding_' + Date.now() + '@iaudit.com';
  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'Onboarding',
      email: email,
      mobile: '1234567890',
      password: hashedPassword,
      role: 'Admin',
      subscriptionStatus: 'trial',
      onboardingCompleted: false
    }
  });
  
  console.log('--- TEST USER CREATED ---');
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
