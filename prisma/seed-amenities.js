const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const amenities = [
  { name: 'Swimming Pool', icon: 'waves', category: 'Outdoor' },
  { name: 'Home Gym', icon: 'dumbbell', category: 'Indoor' },
  { name: 'Central A/C', icon: 'snowflake', category: 'Indoor' },
  { name: 'High-speed WiFi', icon: 'wifi', category: 'Technology' },
  { name: 'Solar Panels', icon: 'sun', category: 'Eco' },
  { name: 'EV Charging', icon: 'plug', category: 'Eco' },
  { name: 'Smart Security', icon: 'shield', category: 'Security' },
  { name: 'Outdoor Deck', icon: 'home', category: 'Outdoor' },
  { name: 'Fireplace', icon: 'flame', category: 'Indoor' },
  { name: 'Walk-in Closet', icon: 'shirt', category: 'Indoor' },
  { name: 'Chef Kitchen', icon: 'chef-hat', category: 'Indoor' },
  { name: 'Laundry Room', icon: 'shirt', category: 'Indoor' },
  { name: 'Garden', icon: 'flower', category: 'Outdoor' },
  { name: 'Parking Garage', icon: 'car', category: 'Outdoor' },
  { name: 'Balcony', icon: 'door-open', category: 'Outdoor' },
  { name: 'Pet Friendly', icon: 'paw-print', category: 'Other' },
  { name: 'Elevator', icon: 'arrow-up-down', category: 'Building' },
  { name: 'Concierge', icon: 'bell', category: 'Building' },
  { name: 'Rooftop Access', icon: 'building', category: 'Building' },
  { name: 'Storage Unit', icon: 'archive', category: 'Building' },
];

async function main() {
  console.log('Seeding amenities...');
  
  // Check if amenities already exist
  const count = await prisma.amenity.count();
  if (count > 0) {
    console.log('Amenities already exist, skipping seed');
    return;
  }
  
  // Create all amenities
  const result = await prisma.amenity.createMany({
    data: amenities,
    skipDuplicates: true,
  });
  
  console.log('Seeded', result.count, 'amenities');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
