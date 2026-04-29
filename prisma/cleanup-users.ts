import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting cleanup script...');

  try {
    // 1. Get IDs of all official agents so we DO NOT delete their linked User accounts
    const agents = await prisma.agent.findMany({
      where: { userId: { not: null } },
      select: { userId: true, name: true }
    });

    const agentUserIds = agents.map(a => a.userId).filter((id): id is number => id !== null);
    
    console.log(`🛡️  Protecting ${agentUserIds.length} Official Agent accounts:`, agents.map(a => a.name));

    // 2. We also want to protect any explicit ADMIN accounts just in case
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true }
    });

    const adminIds = admins.map(a => a.id);
    console.log(`🛡️  Protecting ${adminIds.length} Admin accounts:`, admins.map(a => a.email));

    // Combine protected IDs
    const protectedIds = [...new Set([...agentUserIds, ...adminIds])];

    // 3. Delete all other users
    const deletionResult = await prisma.user.deleteMany({
      where: {
        id: { notIn: protectedIds }
      }
    });

    console.log(`✅ Successfully wiped ${deletionResult.count} test users.`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🏁 Cleanup script finished.');
  }
}

cleanup();
