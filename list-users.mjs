import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('Users:');
  users.forEach(u => console.log(`  ${u.id}: ${u.name} (${u.email}) - ${u.role}`));
  await prisma.$disconnect();
}

main();
