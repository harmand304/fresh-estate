import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Seed Data...');

  const counts = {
    users: await prisma.user.count(),
    agents: await prisma.agent.count(),
    properties: await prisma.property.count(),
    projects: await prisma.project.count(),
    amenities: await prisma.amenity.count(),
    cities: await prisma.city.count(),
    locations: await prisma.location.count(),
    reviews: await prisma.review.count(),
    websiteReviews: await prisma.websiteReview.count(),
  };

  console.table(counts);

  if (counts.properties > 0 && counts.agents > 0 && counts.projects > 0) {
    console.log('✅ Verification PASSED: Database has data.');
  } else {
    console.error('❌ Verification FAILED: Database missing critical data.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
