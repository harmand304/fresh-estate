import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  let output = '';
  
  // Get all properties with key fields
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      purpose: true,
      price: true,
      projectId: true,
      propertyTypeId: true,
      propertyType: { select: { name: true } }
    }
  });
  
  output += '=== ALL PROPERTIES ===\n';
  output += `Total: ${properties.length}\n`;
  properties.forEach((p, i) => {
    output += `${i+1}. purpose="${p.purpose}", price=${p.price}, projectId=${p.projectId}, type="${p.propertyType?.name}"\n`;
  });

  // Get user preferences
  const prefs = await prisma.userPreference.findMany({
    include: { user: { select: { name: true } } }
  });
  output += '\n=== USER PREFERENCES ===\n';
  prefs.forEach(p => {
    output += `User ${p.user?.name || p.userId}: purpose=${p.purpose}, type=${p.propertyType}, style=${p.propertyStyle}, price=${p.minPrice}-${p.maxPrice}\n`;
  });

  // Simulate the filter for user "hawkar husen"
  output += '\n=== SIMULATING FILTER ===\n';
  const userPref = prefs.find(p => p.user?.name?.includes('hawkar'));
  if (userPref) {
    output += `Filtering for: ${userPref.user?.name}\n`;
    output += `Preferences: purpose=${userPref.purpose}, type=${userPref.propertyType}, style=${userPref.propertyStyle}\n`;
    output += `Price range: ${userPref.minPrice} - ${userPref.maxPrice}\n\n`;
    
    const minPrice = Number(userPref.minPrice) || 0;
    const maxPrice = Number(userPref.maxPrice) || 10000000;
    
    let matchCount = 0;
    properties.forEach(p => {
      const price = Number(p.price) || 0;
      let reasons = [];
      let match = true;
      
      // Price filter
      if (price < minPrice || price > maxPrice) {
        reasons.push(`price ${price} not in ${minPrice}-${maxPrice}`);
        match = false;
      }
      
      // Purpose filter
      if (userPref.purpose !== 'BOTH') {
        const expectedPurpose = userPref.purpose === 'BUY' ? 'SALE' : 'RENT';
        if (p.purpose !== expectedPurpose) {
          reasons.push(`purpose ${p.purpose} != ${expectedPurpose}`);
          match = false;
        }
      }
      
      // Property type filter
      if (userPref.propertyType !== 'BOTH') {
        const expectedType = userPref.propertyType === 'HOUSE' ? 'House' : 'Apartment';
        if (p.propertyType?.name !== expectedType) {
          reasons.push(`type ${p.propertyType?.name} != ${expectedType}`);
          match = false;
        }
      }
      
      // Property style filter
      if (userPref.propertyStyle === 'PROJECT' && !p.projectId) {
        reasons.push('not a project');
        match = false;
      }
      if (userPref.propertyStyle === 'NORMAL' && p.projectId) {
        reasons.push('is a project');
        match = false;
      }
      
      if (match) {
        matchCount++;
        output += `MATCH: price=${price}, purpose=${p.purpose}, type=${p.propertyType?.name}, projectId=${p.projectId}\n`;
      } else {
        output += `SKIP: price=${price}, purpose=${p.purpose} - ${reasons.join(', ')}\n`;
      }
    });
    
    output += `\n=== TOTAL MATCHES: ${matchCount} ===\n`;
  } else {
    output += 'User not found!\n';
  }

  fs.writeFileSync('debug-output.txt', output);
  console.log('Output written to debug-output.txt');
  console.log(output);

  await prisma.$disconnect();
}

main().catch(console.error);
