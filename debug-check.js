const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check properties
  const properties = await prisma.property.findMany({
    take: 5,
    select: {
      id: true,
      purpose: true,
      price: true,
      propertyTypeId: true,
      propertyType: { select: { name: true } }
    }
  });
  
  console.log('Sample Properties:');
  console.log(JSON.stringify(properties, null, 2));
  
  // Check user preferences
  const prefs = await prisma.userPreference.findMany();
  console.log('\nUser Preferences:');
  console.log(JSON.stringify(prefs, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
