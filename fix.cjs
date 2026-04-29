const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const cities = await prisma.city.findMany();
  const sulaimani = cities.find(c => c.name === 'Sulaimani');
  const sulaymaniyah = cities.find(c => c.name === 'Sulaymaniyah');

  if (sulaimani && sulaymaniyah) {
    console.log('Merging Sulaimani into Sulaymaniyah');
    
    // Move agents
    await prisma.agent.updateMany({
      where: { cityId: sulaimani.id },
      data: { cityId: sulaymaniyah.id }
    });
    
    // Move locations safely
    const oldLocs = await prisma.location.findMany({ where: { cityId: sulaimani.id } });
    for (const loc of oldLocs) {
      const existing = await prisma.location.findFirst({
        where: { cityId: sulaymaniyah.id, name: loc.name }
      });
      if (existing) {
        // Move properties to existing
        await prisma.property.updateMany({
          where: { locationId: loc.id },
          data: { locationId: existing.id }
        });
        await prisma.location.delete({ where: { id: loc.id } });
      } else {
        await prisma.location.update({
          where: { id: loc.id },
          data: { cityId: sulaymaniyah.id }
        });
      }
    }
    
    // Delete old city
    await prisma.city.delete({ where: { id: sulaimani.id } });
    console.log('Successfully removed Sulaimani');
  } else if (sulaimani) {
      // Just rename it
      await prisma.city.update({
          where: { id: sulaimani.id },
          data: { name: 'Sulaymaniyah' }
      });
      console.log('Renamed Sulaimani to Sulaymaniyah');
  } else {
      console.log('Sulaimani not found.');
  }

  // Randomize agents
  const agents = await prisma.agent.findMany();
  for (const agent of agents) {
    const exp = Math.floor(Math.random() * 12) + 3; // 3 to 14
    const revs = Math.floor(Math.random() * 50) + 10;
    const ratingDecimals = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
    const rating = ratingDecimals[Math.floor(Math.random() * ratingDecimals.length)];
    
    await prisma.agent.update({
      where: { id: agent.id },
      data: { experience: exp, reviewCount: revs, rating: rating }
    });
  }

  // To make "Properties Sold" (which is propertyCount) different, let's assign properties unevenly
  const props = await prisma.property.findMany();
  for (let i = 0; i < props.length; i++) {
    // 40% to agent 0, 30% to agent 1, 20% to agent 2, 10% to agent 3
    const rand = Math.random();
    let index = 0;
    if (rand < 0.1) index = 3;
    else if (rand < 0.3) index = 2;
    else if (rand < 0.6) index = 1;
    
    await prisma.property.update({
      where: { id: props[i].id },
      data: { agentId: agents[index].id }
    });
  }
  console.log('Successfully randomized agents and their properties!');
}

fix()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
