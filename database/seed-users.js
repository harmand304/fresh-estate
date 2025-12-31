import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  const hash = bcrypt.hashSync('password123', 10);
  
  console.log('Deleting existing test users...');
  
  // Delete existing test users
  await prisma.user.deleteMany({
    where: { email: { in: ['user@mood.com', 'admin@mood.com', 'agent@mood.com', 'Adein@gmail.com'] }}
  });
  
  console.log('Creating new users...');
  
  // Create users one by one
  await prisma.user.create({
    data: { email: 'user@mood.com', password: hash, name: 'Normal User', role: 'USER' }
  });
  
  await prisma.user.create({
    data: { email: 'admin@mood.com', password: hash, name: 'Admin User', role: 'ADMIN' }
  });
  
  await prisma.user.create({
    data: { email: 'agent@mood.com', password: hash, name: 'Agent User', role: 'AGENT' }
  });
  
  console.log('✅ Users created successfully!');
  console.log('Login credentials:');
  console.log('  user@mood.com / password123');
  console.log('  admin@mood.com / password123');
  console.log('  agent@mood.com / password123');
  
  await prisma.$disconnect();
}

seedUsers().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
