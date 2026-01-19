import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // First, make sure we have property types
  const houseType = await prisma.propertyType.upsert({
    where: { name: 'House' },
    create: { name: 'House' },
    update: {}
  });
  
  const apartmentType = await prisma.propertyType.upsert({
    where: { name: 'Apartment' },
    create: { name: 'Apartment' },
    update: {}
  });
  
  console.log('Property types:', { house: houseType.id, apartment: apartmentType.id });
  
  // Assign House type to all properties that don't have a type
  const updated = await prisma.property.updateMany({
    where: { propertyTypeId: null },
    data: { propertyTypeId: houseType.id }
  });
  
  console.log(`Updated ${updated.count} properties with House type`);
  
  // Verify
  const withType = await prisma.property.count({ where: { propertyTypeId: { not: null } } });
  const total = await prisma.property.count();
  console.log(`Properties with type: ${withType}/${total}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
