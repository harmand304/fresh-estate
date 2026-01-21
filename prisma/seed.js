import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PROPERTY_IMAGES = [
  '/images/image_50.jpg',
  '/images/image_51.jpg',
  '/images/image_52.jpg',
  '/images/image_53.jpg',
  '/images/image_54.jpg',
  '/images/image_55.jpg',
  '/images/image_56.jpg',
  '/images/image_57.jpg',
  '/images/image_58.jpg',
  '/images/image_59.jpg',
  '/images/image_60.jpg',
  '/images/image_61.jpg',
  '/images/image_62.png',
  '/images/image_63.jpg',
  '/images/image_64.jpg',
  '/images/image_65.jpg',
  '/images/image_66.jpg',
  '/images/image_67.jpg',
  '/images/image_68.jpg',
  '/images/image_69.jpg'
];

const AGENT_IMAGES = [
  '/images/image_90.jpg',
  '/images/image_91.jpg',
  '/images/image_92.jpg',
  '/images/image_93.jpg',
  '/images/image_94.jpg'
];

const AMENITIES_DATA = [
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
  console.log('🌱 Starting database seed...');

  // CLEANUP: Remove existing data to avoid duplicates
  console.log('🧹 Cleaning up existing data...');
  await prisma.deal.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.propertyAmenity.deleteMany({});

  // Delete properties (will cascade delete related items if configured)
  await prisma.property.deleteMany({});

  // Delete projects (will cascade delete related items if configured)
  await prisma.project.deleteMany({});

  // Delete website reviews
  await prisma.websiteReview.deleteMany({});

  console.log('Cleaned up successfully.');

  // 1. Create Property Types
  console.log('🏗️ Creating Property Types...');
  const propertyTypes = ['Apartment', 'Villa', 'House', 'Land', 'Office', 'Commercial'];
  const typeMap = {};

  for (const type of propertyTypes) {
    const pt = await prisma.propertyType.upsert({
      where: { name: type },
      update: {},
      create: { name: type },
    });
    typeMap[type] = pt.id;
  }

  // 2. Create Amenities
  console.log('🛁 Creating Amenities...');

  const existingAmenitiesCount = await prisma.amenity.count();
  if (existingAmenitiesCount === 0) {
    await prisma.amenity.createMany({ data: AMENITIES_DATA });
    console.log(`Created ${AMENITIES_DATA.length} amenities.`);
  } else {
    console.log('Amenities already exist.');
  }
  const allAmenities = await prisma.amenity.findMany();


  // 3. Create Cities and Locations
  console.log('🏙️ Creating Cities and Locations...');
  const citiesData = [
    {
      name: 'Erbil',
      locations: ['Empire World', 'Dream City', 'Italian City 1', 'Italian City 2', 'Park View', 'English Village']
    },
    {
      name: 'Sulaimani',
      locations: ['Goizha City', 'Qaiwan City', 'Bakhtyari', 'Sarchnar', 'Raparin']
    },
    {
      name: 'Duhok',
      locations: ['Avro City', 'Masike', 'Kro', 'Malta']
    }
  ];

  const locationMap = []; // Array of location IDs

  for (const cityData of citiesData) {
    const city = await prisma.city.upsert({
      where: { name: cityData.name },
      update: {},
      create: { name: cityData.name },
    });

    for (const locName of cityData.locations) {
      const loc = await prisma.location.upsert({
        where: { name_cityId: { name: locName, cityId: city.id } },
        update: {},
        create: { name: locName, cityId: city.id },
      });
      locationMap.push(loc.id);
    }
  }

  // 4. Create Users (Admin, Agent, Regular)
  console.log('👤 Creating Users...');
  const password = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mood.com' },
    update: {},
    create: { email: 'admin@mood.com', password, name: 'Admin User', role: 'ADMIN' },
  });

  // Regular User
  const user = await prisma.user.upsert({
    where: { email: 'user@mood.com' },
    update: {},
    create: { email: 'user@mood.com', password, name: 'Regular User', role: 'USER' },
  });

  // Agents
  console.log('🕵️ Creating Agents...');
  const agentsList = [
    { name: 'Sarah Ahmed', email: 'sarah@mood.com', bio: 'Premium property specialist with 10 years experience.', image: AGENT_IMAGES[0] },
    { name: 'Mohamad Karim', email: 'mohamad@mood.com', bio: 'Expert in commercial real estate and investment opportunities.', image: AGENT_IMAGES[1] },
    { name: 'Zainab Ali', email: 'zainab@mood.com', bio: 'Dedicated to finding your dream home in Erbil.', image: AGENT_IMAGES[2] },
    { name: 'Yousif Hassan', email: 'yousif@mood.com', bio: 'Top rated agent for luxury villas and penthouses.', image: AGENT_IMAGES[3] },
    { name: 'Dina Omar', email: 'dina@mood.com', bio: 'Modern apartment specialist. I help you find the best views.', image: AGENT_IMAGES[4] },
  ];

  const agentIds = [];

  for (const agentData of agentsList) {
    // User account for agent
    const agentUser = await prisma.user.upsert({
      where: { email: agentData.email },
      update: {},
      create: {
        email: agentData.email,
        password,
        name: agentData.name,
        role: 'AGENT'
      },
    });

    // Agent profile
    const agentProfile = await prisma.agent.upsert({
      where: { userId: agentUser.id },
      update: {},
      create: {
        userId: agentUser.id,
        name: agentData.name,
        email: agentData.email,
        bio: agentData.bio,
        image: agentData.image,
        phone: '+964 750 ' + Math.floor(1000000 + Math.random() * 9000000),
        experience: Math.floor(Math.random() * 15) + 2,
        rating: 4.5 + (Math.random() * 0.5),
        reviewCount: Math.floor(Math.random() * 50) + 10,
        isTopAgent: Math.random() > 0.5,
        officeAddress: 'Main St, City Center'
      }
    });

    // Create some reviews for the agent
    await prisma.review.create({
      data: {
        agentId: agentProfile.id,
        name: 'Happy Client',
        rating: 5,
        text: 'Great service! Highly recommended.'
      }
    });

    agentIds.push(agentProfile.id);
  }

  // 5. Create Projects
  console.log('🏗️ Creating Projects...');
  const projectsData = [
    { name: 'Sky Towers', description: 'Luxury living in the clouds.', image: PROPERTY_IMAGES[0], status: 'PRE_SELLING' },
    { name: 'Green Valley', description: 'Eco-friendly community with parks.', image: PROPERTY_IMAGES[1], status: 'COMMERCIAL' },
    { name: 'Golden Gate', description: 'Premium gated community.', image: PROPERTY_IMAGES[2], status: 'COMPLETED' },
  ];

  const projectIds = [];
  for (const proj of projectsData) {
    const p = await prisma.project.create({
      data: {
        name: proj.name,
        description: proj.description,
        image: proj.image,
        status: proj.status
      }
    });
    projectIds.push(p.id);
  }

  // 6. Create Properties
  console.log('🏠 Creating Properties...');

  // Mix of data to generate properties
  const titles = ['Modern Apartment with View', 'Luxury Villa with Pool', 'Cozy Family Home', 'Spacious Office Space', 'Premium Penthouse', 'City Center Loft'];
  const purposes = ['SALE', 'RENT'];

  // Create 20 properties
  for (let i = 0; i < 20; i++) {
    const isProject = Math.random() > 0.7;
    const projectId = isProject ? projectIds[Math.floor(Math.random() * projectIds.length)] : null;
    const typeName = Object.keys(typeMap)[Math.floor(Math.random() * Object.keys(typeMap).length)];
    const locationId = locationMap[Math.floor(Math.random() * locationMap.length)];
    const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const image = PROPERTY_IMAGES[i % PROPERTY_IMAGES.length];

    const property = await prisma.property.create({
      data: {
        title: `${titles[Math.floor(Math.random() * titles.length)]} ${i + 1}`,
        description: 'This is a beautiful property featuring modern amenities, great location, and spacious interiors. Perfect for your needs.',
        shortDescription: 'Beautiful property in a great location.',
        price: Math.floor(Math.random() * 500000) + 50000,
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        areaSqm: Math.floor(Math.random() * 300) + 80,
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 4) + 1,
        rooms: Math.floor(Math.random() * 8) + 3,
        hasGarage: Math.random() > 0.3,
        hasBalcony: Math.random() > 0.3,
        imageUrl: image,
        locationId: locationId,
        agentId: agentId,
        propertyTypeId: typeMap[typeName],
        projectId: projectId,
        images: {
          create: [
            { imageKey: image, sortOrder: 0 },
            { imageKey: PROPERTY_IMAGES[(i + 1) % PROPERTY_IMAGES.length], sortOrder: 1 },
            { imageKey: PROPERTY_IMAGES[(i + 2) % PROPERTY_IMAGES.length], sortOrder: 2 },
          ]
        },
        amenities: {
          create: allAmenities
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 5) // Take 5 random
            .map(a => ({ amenityId: a.id }))
        }
      }
    });
  }

  // 7. Create Website Reviews (Testimonials)
  console.log('⭐ Creating Testimonials...');
  await prisma.websiteReview.createMany({
    data: [
      { name: 'John Doe', role: 'Homeowner', rating: 5, text: 'Found my dream house in weeks! Amazing service.', image: AGENT_IMAGES[0] },
      { name: 'Jane Smith', role: 'Tenant', rating: 4, text: 'Great experience renting an apartment. Very professional.', image: AGENT_IMAGES[1] },
      { name: 'Ali Hassan', role: 'Investor', rating: 5, text: 'Best platform for real estate investment in the region.', image: AGENT_IMAGES[2] },
    ]
  });

  console.log('✅ Seeding completed! Database is populated.');
  console.log('📝 Login: admin@mood.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
