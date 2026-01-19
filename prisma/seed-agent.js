// Seed an agent user for testing
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create agent user
  const hashedPassword = await bcrypt.hash('agent123', 10);
  
  // First, find or create an agent
  let agent = await prisma.agent.findFirst();
  
  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        name: 'Test Agent',
        phone: '+964 750 111 2222',
        email: 'testagent@mood.iq',
        bio: 'Experienced real estate agent specializing in residential properties.',
        experience: 5,
        rating: 4.8,
        isTopAgent: true,
        specialties: JSON.stringify(['Residential', 'Luxury Properties']),
      }
    });
    console.log('Created agent:', agent.name);
  }

  // Create or update user with AGENT role
  const user = await prisma.user.upsert({
    where: { email: 'testagent@mood.iq' },
    update: { 
      role: 'AGENT',
      password: hashedPassword
    },
    create: {
      email: 'testagent@mood.iq',
      password: hashedPassword,
      name: agent.name,
      role: 'AGENT'
    }
  });

  console.log('Created/updated agent user:', user.email);

  // Link user to agent
  await prisma.agent.update({
    where: { id: agent.id },
    data: { userId: user.id }
  });

  console.log('Linked user to agent profile');
  console.log('\n✅ Agent account ready!');
  console.log('Email: testagent@mood.iq');
  console.log('Password: agent123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
