import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up fake data...');

  // Delete reviews and interactions first (foreign key constraints)
  await prisma.websiteReview.deleteMany({});
  console.log('Deleted Website Reviews');

  await prisma.review.deleteMany({});
  console.log('Deleted Agent Reviews');

  await prisma.inquiry.deleteMany({});
  console.log('Deleted Inquiries');

  await prisma.deal.deleteMany({});
  console.log('Deleted Deals');

  await prisma.userEvent.deleteMany({});
  console.log('Deleted User Events');

  await prisma.favorite.deleteMany({});
  console.log('Deleted Favorites');

  // Delete Properties (Cascade should handle images/amenities if set, but safest to be explicit or rely on schema)
  // Schema has onDelete: Cascade for PropertyImage, PropertyAmenity.
  await prisma.property.deleteMany({});
  console.log('Deleted Properties');

  await prisma.project.deleteMany({});
  console.log('Deleted Projects');

  // Delete Agents
  await prisma.agent.deleteMany({});
  console.log('Deleted Agents');

  // Delete Users (except Admin)
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@mood.com'
      }
    }
  });
  console.log('Deleted Fake Users (Kept Admin)');

  console.log('✅ Cleanup completed! Kept structural data (Cities, Amenities, Types) and Admin.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
