
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const types = await prisma.propertyType.findMany();
  console.log('Property Types:', types);
  const cities = await prisma.city.findMany();
  console.log('Cities:', cities);
  await prisma.$disconnect();
}

main().catch(console.error);
