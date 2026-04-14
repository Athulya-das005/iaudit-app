
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const email = 'testuser_' + Date.now() + '@example.com';
  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      mobile: '1234567890',
      password: hashedPassword,
      role: 'Admin',
      subscriptionStatus: 'trial',
      onboardingCompleted: false
    }
  });
  
  console.log('User created:', user.email);
  console.log('Password: Password@123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
