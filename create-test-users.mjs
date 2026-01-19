import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.com';
  const password = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'ADMIN'
    },
    create: {
      email,
      name: 'Test Admin',
      password,
      role: 'ADMIN'
    }
  });
  
  console.log('Created/Updated admin user:', user.email);
  
  // Also create a normal user for testing preferences if needed
  const userEmail = 'user@test.com';
  const userPass = await bcrypt.hash('password123', 10);
  
  const normalUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: userPass,
    },
    create: {
      email: userEmail,
      name: 'Test User',
      password: userPass,
      role: 'USER'
    }
  });
   console.log('Created/Updated normal user:', normalUser.email);

  await prisma.$disconnect();
}

main();
