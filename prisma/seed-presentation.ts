import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CITIES = [
  'Erbil',
  'Sulaymaniyah',
  'Duhok',
  'Kirkuk'
];

const AGENTS = [
  {
    name: "Mohammed Hussein",
    email: "mohammed@fresh-estates.com",
    role: "Co-Founder",
    image: "/src/assets/mohammed.jpeg",
    city: "Erbil",
    phone: "+964 750 111 2233",
    specialties: "Luxury Villas, Commercial Spaces"
  },
  {
    name: "Harmand Zahir",
    email: "harmand@fresh-estates.com",
    role: "Co-Founder",
    image: "/src/assets/harmand.jpg",
    city: "Sulaymaniyah",
    phone: "+964 750 222 3344",
    specialties: "Apartments, Investments"
  },
  {
    name: "Bako Abdullah",
    email: "bako@fresh-estates.com",
    role: "Co-Founder",
    image: "/src/assets/bako.jpg",
    city: "Duhok",
    phone: "+964 750 333 4455",
    specialties: "Residential, Land"
  },
  {
    name: "Alan Omed",
    email: "alan@fresh-estates.com",
    role: "Co-Founder",
    image: "/src/assets/alan.jpg",
    city: "Kirkuk",
    phone: "+964 750 444 5566",
    specialties: "Commercial, Resale"
  }
];

async function main() {
  console.log('Starting presentation data clean up and reorganization...');

  // 1. Clean up existing data
  console.log('Wiping out existing test Agents and Users...');
  
  // Keep admin users if any, otherwise wipe all agents and simple users
  await prisma.agent.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN' // Always keep the admin to avoid locking the user out
      }
    }
  });

  // 2. Ensure main cities exist
  console.log('Ensuring primary cities exist...');
  const cityMap = new Map();
  for (const cityName of CITIES) {
    let city = await prisma.city.findUnique({
      where: { name: cityName }
    });
    if (!city) {
      city = await prisma.city.create({
        data: { name: cityName }
      });
    }
    cityMap.set(cityName, city.id);

    // Also ensure at least one general location exists for each city so properties have somewhere to attach
    const locName = `Central ${cityName}`;
    const location = await prisma.location.findFirst({
        where: { name: locName, cityId: city.id }
    });
    if(!location) {
        await prisma.location.create({
            data: { name: locName, cityId: city.id }
        });
    }
  }

  // 3. Create the 4 Official Agents (and their User accounts)
  console.log('Creating official agents from About page...');
  const password = await bcrypt.hash('password123', 10);
  const agentMap = new Map();

  for (const agentData of AGENTS) {
    const cityId = cityMap.get(agentData.city);
    
    // Create User account for Agent
    const user = await prisma.user.create({
      data: {
        email: agentData.email,
        password,
        name: agentData.name,
        role: 'AGENT'
      }
    });

    // Create Agent profile
    const agent = await prisma.agent.create({
      data: {
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        bio: `${agentData.role} specialized in ${agentData.specialties} across ${agentData.city}.`,
        image: agentData.image,
        experience: 10,
        rating: 5,
        reviewCount: 25,
        specialties: agentData.specialties,
        cityId: cityId,
        userId: user.id,
        isTopAgent: true
      }
    });
    
    agentMap.set(agentData.city, agent.id);
    console.log(`Created Agent: ${agentData.name} for city ${agentData.city}`);
  }

  // 4. Redistribute existing properties
  console.log('Redistributing existing properties evenly across cities and new agents...');
  const properties = await prisma.property.findMany();
  
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    
    // Cycle through the 4 cities/agents sequentially to distribute perfectly evenly
    const cityIndex = i % CITIES.length;
    const targetCityName = CITIES[cityIndex];
    const targetCityId = cityMap.get(targetCityName);
    const targetAgentId = agentMap.get(targetCityName);

    // Find a location for this city
    let location = await prisma.location.findFirst({
      where: { cityId: targetCityId }
    });

    if (!location) {
        // Fallback create
        location = await prisma.location.create({
            data: { name: `${targetCityName} District`, cityId: targetCityId }
        });
    }

    await prisma.property.update({
      where: { id: property.id },
      data: {
        agentId: targetAgentId,
        locationId: location.id
      }
    });
  }
  
  console.log(`Successfully distributed ${properties.length} properties among 4 agents and 4 cities.`);

  // Do the same for Projects if there are any
  const projects = await prisma.project.findMany();
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const targetCityName = CITIES[i % CITIES.length];
    
    await prisma.project.update({
      where: { id: project.id },
      data: {
        location: targetCityName
      }
    });
  }
  
  console.log(`Successfully updated ${projects.length} projects.`);
  console.log('Presentation database migration completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
