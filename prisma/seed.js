import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AGENT_IMAGES = [
  '/images/image_90.jpg',
  '/images/image_91.jpg',
  '/images/image_92.jpg',
  '/images/image_93.jpg',
  '/images/image_94.jpg',
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

// Mood-House property data mapped to Fresh-Estates schema
// title, price, type (house/apartment/land/commercial), purpose (SALE/RENT),
// bedrooms, bathrooms, areaSqm, location, city, image, featured
const MOOD_HOUSE_PROPERTIES = [
  // --- Erbil ---
  { title: 'Modern House in 5 Hasarok', price: 74000, type: 'House', purpose: 'SALE', bedrooms: 3, bathrooms: 1, areaSqm: 116, location: '5 Hasarok', city: 'Erbil', featured: true, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
  { title: 'Spacious Villa in Andazyaran', price: 230000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 2, areaSqm: 297, location: 'Andazyaran', city: 'Erbil', featured: true, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Family Home in Andazyaran', price: 150000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 3, areaSqm: 174, location: 'Andazyaran', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
  { title: 'Elegant Villa in Aram Village 2', price: 250000, type: 'Villa', purpose: 'SALE', bedrooms: 4, bathrooms: 1, areaSqm: 225, location: 'Aram Village', city: 'Erbil', featured: true, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { title: 'Beautiful Home in Ashti City', price: 135000, type: 'House', purpose: 'SALE', bedrooms: 3, bathrooms: 1, areaSqm: 205, location: 'Ashti City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' },
  { title: 'Cozy House in Azadi', price: 165000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 1, areaSqm: 139, location: 'Azadi', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80' },
  { title: 'Family Home in Badawa', price: 120000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 186, location: 'Badawa', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80' },
  { title: 'Luxury Villa for Rent in Bafrin City', price: 900, type: 'Villa', purpose: 'RENT', bedrooms: 4, bathrooms: 3, areaSqm: 465, location: 'Bafrin City', city: 'Erbil', featured: true, image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80' },
  { title: 'Modern House in Bakhtyari', price: 122500, type: 'House', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 93, location: 'Bakhtyari', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  { title: 'Elegant Home in Brayati', price: 250000, type: 'House', purpose: 'SALE', bedrooms: 6, bathrooms: 1, areaSqm: 197, location: 'Brayati', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80' },
  { title: 'Modern Apartment in Cihan City', price: 700, type: 'Apartment', purpose: 'RENT', bedrooms: 3, bathrooms: 2, areaSqm: 190, location: 'Cihan City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { title: 'Spacious Home in Darwazay Hawler', price: 172500, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 4, areaSqm: 223, location: 'Darwazay Hawler', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
  { title: 'Premium Villa in Dolarawa', price: 265000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 4, areaSqm: 186, location: 'Dolarawa', city: 'Erbil', featured: true, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Dream City Luxury Home', price: 440000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 1, areaSqm: 232, location: 'Dream City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80' },
  { title: 'Empire World Apartment', price: 156000, type: 'Apartment', purpose: 'SALE', bedrooms: 2, bathrooms: 1, areaSqm: 133, location: 'Empire World', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { title: 'Eskan Tower Apartment', price: 55000, type: 'Apartment', purpose: 'SALE', bedrooms: 2, bathrooms: 1, areaSqm: 98, location: 'Eskan Tower', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
  { title: 'Family Land Villa for Rent', price: 850, type: 'Villa', purpose: 'RENT', bedrooms: 4, bathrooms: 2, areaSqm: 432, location: 'Family Land', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80' },
  { title: 'Farmanbaran Family Home', price: 103000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 5, areaSqm: 139, location: 'Farmanbaran', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Firdaws City Villa', price: 250000, type: 'Villa', purpose: 'SALE', bedrooms: 4, bathrooms: 3, areaSqm: 279, location: 'Firdaws City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80' },
  { title: 'FM Plaza Apartment', price: 60000, type: 'Apartment', purpose: 'SALE', bedrooms: 1, bathrooms: 1, areaSqm: 85, location: 'FM Plaza', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
  { title: 'Ganjan City Luxury Villa', price: 290000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 4, areaSqm: 418, location: 'Ganjan City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
  { title: 'Ganjan Life Modern Apartment', price: 125000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 147, location: 'Ganjan Life', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80' },
  { title: 'Hawleri Nwe Family Home', price: 120000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 139, location: 'Hawleri Nwe', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=800&q=80' },
  { title: 'Hiwa City Modern Home', price: 195000, type: 'House', purpose: 'SALE', bedrooms: 5, bathrooms: 4, areaSqm: 181, location: 'Hiwa City', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
  { title: 'Iskan Family Home', price: 130000, type: 'House', purpose: 'SALE', bedrooms: 5, bathrooms: 2, areaSqm: 160, location: 'Iskan', city: 'Erbil', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  // --- Sulaymaniyah ---
  { title: 'Altun Premium Home', price: 190000, type: 'House', purpose: 'RENT', bedrooms: 3, bathrooms: 3, areaSqm: 186, location: 'Altun', city: 'Sulaymaniyah', featured: true, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
  { title: 'Bahary Shar Family Home', price: 250000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 186, location: 'Bahary Shar', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Bakrajo Spacious Villa', price: 340000, type: 'Villa', purpose: 'SALE', bedrooms: 6, bathrooms: 4, areaSqm: 279, location: 'Bakrajo', city: 'Sulaymaniyah', featured: true, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
  { title: 'Bakrajo Rental Home', price: 190000, type: 'House', purpose: 'RENT', bedrooms: 5, bathrooms: 2, areaSqm: 186, location: 'Bakrajo', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { title: 'Baxtyari Large Villa', price: 300000, type: 'Villa', purpose: 'RENT', bedrooms: 10, bathrooms: 3, areaSqm: 330, location: 'Baxtyari', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' },
  { title: 'Chwarchra Modern Home', price: 230000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 149, location: 'Chwarchra', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80' },
  { title: 'City Towers Apartment', price: 105000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 147, location: 'City Towers', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80' },
  { title: 'Dania City Premium Apartment', price: 190000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 214, location: 'Dania City', city: 'Sulaymaniyah', featured: true, image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80' },
  { title: 'Darwaza City Apartment', price: 140000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 186, location: 'Darwaza City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  { title: 'Garden City Luxury Apartment', price: 220000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 1, areaSqm: 216, location: 'Garden City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80' },
  { title: 'Goizha City Modern Apartment', price: 115000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 186, location: 'Goizha City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { title: 'Gundy Almany Apartment', price: 80000, type: 'Apartment', purpose: 'SALE', bedrooms: 2, bathrooms: 1, areaSqm: 98, location: 'Gundy Almany', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
  { title: 'Gundy Almany Villa', price: 300000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 2, areaSqm: 223, location: 'Gundy Almany', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Hawara Barza Family Home', price: 180000, type: 'House', purpose: 'SALE', bedrooms: 5, bathrooms: 3, areaSqm: 139, location: 'Hawara Barza', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80' },
  { title: 'Hiron City Premium Villa', price: 350000, type: 'Villa', purpose: 'SALE', bedrooms: 6, bathrooms: 2, areaSqm: 372, location: 'Hiron City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { title: 'Kany Kurda Family Home', price: 140000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 186, location: 'Kany Kurda', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
  { title: 'Kaziwa Luxury Home', price: 340000, type: 'House', purpose: 'SALE', bedrooms: 6, bathrooms: 3, areaSqm: 186, location: 'Kaziwa', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80' },
  { title: 'Kurdsat Premium Villa', price: 650000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 3, areaSqm: 388, location: 'Kurdsat', city: 'Sulaymaniyah', featured: true, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Mamostayan Modern Home', price: 260000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 232, location: 'Mamostayan', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80' },
  { title: 'Miran City Affordable Apartment', price: 66000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 134, location: 'Miran City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
  { title: 'Pak City Modern Apartment', price: 105000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 1, areaSqm: 178, location: 'Pak City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
  { title: 'Pasha City Rental Apartment', price: 300, type: 'Apartment', purpose: 'RENT', bedrooms: 3, bathrooms: 2, areaSqm: 186, location: 'Pasha City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80' },
  { title: 'Qaiwan City Premium Apartment', price: 115000, type: 'Apartment', purpose: 'RENT', bedrooms: 3, bathrooms: 2, areaSqm: 167, location: 'Qaiwan City', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=800&q=80' },
  { title: 'Raparin Spacious Home', price: 150000, type: 'House', purpose: 'SALE', bedrooms: 2, bathrooms: 2, areaSqm: 186, location: 'Raparin', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
  { title: 'Rzgary Premium Home', price: 220000, type: 'House', purpose: 'SALE', bedrooms: 1, bathrooms: 1, areaSqm: 186, location: 'Rzgary', city: 'Sulaymaniyah', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  // --- Duhok ---
  { title: 'Avro City Modern Villa', price: 280000, type: 'Villa', purpose: 'SALE', bedrooms: 5, bathrooms: 3, areaSqm: 320, location: 'Avro City', city: 'Duhok', featured: true, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80' },
  { title: 'Masike Cozy Home', price: 98000, type: 'House', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 140, location: 'Masike', city: 'Duhok', featured: false, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
  { title: 'Kro Family Home', price: 115000, type: 'House', purpose: 'SALE', bedrooms: 4, bathrooms: 2, areaSqm: 160, location: 'Kro', city: 'Duhok', featured: false, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Malta Apartment for Rent', price: 450, type: 'Apartment', purpose: 'RENT', bedrooms: 2, bathrooms: 1, areaSqm: 95, location: 'Malta', city: 'Duhok', featured: false, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { title: 'Avro City Luxury Apartment', price: 145000, type: 'Apartment', purpose: 'SALE', bedrooms: 3, bathrooms: 2, areaSqm: 175, location: 'Avro City', city: 'Duhok', featured: false, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { title: 'Masike Premium Villa', price: 320000, type: 'Villa', purpose: 'SALE', bedrooms: 6, bathrooms: 3, areaSqm: 380, location: 'Masike', city: 'Duhok', featured: true, image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80' },
];

async function main() {
  console.log('🌱 Starting database seed with Mood-House data...');

  // CLEANUP
  console.log('🧹 Cleaning up existing data...');
  await prisma.deal.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.propertyAmenity.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.websiteReview.deleteMany({});
  console.log('Cleaned up successfully.');

  // 1. Property Types
  console.log('🏗️ Creating Property Types...');
  const propertyTypeNames = ['Apartment', 'Villa', 'House', 'Land', 'Office', 'Commercial'];
  const typeMap = {};
  for (const type of propertyTypeNames) {
    const pt = await prisma.propertyType.upsert({
      where: { name: type },
      update: {},
      create: { name: type },
    });
    typeMap[type] = pt.id;
  }

  // 2. Amenities
  console.log('🛁 Creating Amenities...');
  const existingAmenitiesCount = await prisma.amenity.count();
  if (existingAmenitiesCount === 0) {
    await prisma.amenity.createMany({ data: AMENITIES_DATA });
  }
  const allAmenities = await prisma.amenity.findMany();

  // 3. Cities and Locations from Mood-House data
  console.log('🏙️ Creating Cities and Locations...');
  const citiesData = [
    {
      name: 'Erbil',
      locations: [
        '5 Hasarok', 'Andazyaran', 'Aram Village', 'Ashti City', 'Azadi', 'Badawa',
        'Bafrin City', 'Bakhtyari', 'Brayati', 'Cihan City', 'Darwazay Hawler',
        'Dolarawa', 'Dream City', 'Empire World', 'Eskan Tower', 'Family Land',
        'Farmanbaran', 'Firdaws City', 'FM Plaza', 'Ganjan City', 'Ganjan Life',
        'Hawleri Nwe', 'Hiwa City', 'Iskan', 'Italian City 1', 'Italian City 2',
        'Park View', 'English Village',
      ],
    },
    {
      name: 'Sulaymaniyah',
      locations: [
        'Altun', 'Bahary Shar', 'Bakrajo', 'Baxtyari', 'Chwarchra', 'City Towers',
        'Dania City', 'Darwaza City', 'Garden City', 'Goizha City', 'Gundy Almany',
        'Hawara Barza', 'Hiron City', 'Kany Kurda', 'Kaziwa', 'Kurdsat',
        'Mamostayan', 'Miran City', 'Pak City', 'Pasha City', 'Qaiwan City',
        'Raparin', 'Rzgary', 'Sarchnar', 'Bakhtyari',
      ],
    },
    {
      name: 'Duhok',
      locations: ['Avro City', 'Masike', 'Kro', 'Malta'],
    },
  ];

  const locationMap = {}; // { "CityName|LocationName": id }

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
      locationMap[`${cityData.name}|${locName}`] = loc.id;
    }
  }

  // 4. Users
  console.log('👤 Creating Users...');
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@freshestates.com' },
    update: {},
    create: { email: 'admin@freshestates.com', password, name: 'Admin User', role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'user@freshestates.com' },
    update: {},
    create: { email: 'user@freshestates.com', password, name: 'Regular User', role: 'USER' },
  });

  // 5. Agents
  console.log('🕵️ Creating Agents...');
  const agentsList = [
    { name: 'Sarah Ahmed', email: 'sarah@freshestates.com', bio: 'Premium property specialist with 10 years experience in the Kurdistan Region.', image: AGENT_IMAGES[0] },
    { name: 'Mohamad Karim', email: 'mohamad@freshestates.com', bio: 'Expert in commercial real estate and investment opportunities across Erbil.', image: AGENT_IMAGES[1] },
    { name: 'Zainab Ali', email: 'zainab@freshestates.com', bio: 'Dedicated to finding your dream home in Sulaymaniyah and surrounding areas.', image: AGENT_IMAGES[2] },
    { name: 'Yousif Hassan', email: 'yousif@freshestates.com', bio: 'Top rated agent for luxury villas and penthouses in Duhok.', image: AGENT_IMAGES[3] },
    { name: 'Dina Omar', email: 'dina@freshestates.com', bio: 'Modern apartment specialist. I help you find the best views in Kurdistan.', image: AGENT_IMAGES[4] },
  ];

  const agentIds = [];
  for (const agentData of agentsList) {
    const agentUser = await prisma.user.upsert({
      where: { email: agentData.email },
      update: {},
      create: { email: agentData.email, password, name: agentData.name, role: 'AGENT' },
    });

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
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        isTopAgent: Math.random() > 0.5,
        officeAddress: 'Main St, City Center',
      },
    });

    await prisma.review.create({
      data: {
        agentId: agentProfile.id,
        name: 'Happy Client',
        rating: 5,
        text: 'Great service! Highly recommended.',
      },
    });

    agentIds.push(agentProfile.id);
  }

  // 6. Projects
  console.log('🏗️ Creating Projects...');
  const projectsData = [
    { name: 'Sky Towers', description: 'Luxury living in Erbil city center.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', status: 'PRE_SELLING' },
    { name: 'Green Valley', description: 'Eco-friendly community with parks in Sulaymaniyah.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', status: 'COMMERCIAL' },
    { name: 'Golden Gate', description: 'Premium gated community in Duhok.', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', status: 'COMPLETED' },
  ];

  const projectIds = [];
  for (const proj of projectsData) {
    const p = await prisma.project.create({ data: proj });
    projectIds.push(p.id);
  }

  // 7. Properties from Mood-House data
  console.log('🏠 Creating Properties from Mood-House data...');

  for (let i = 0; i < MOOD_HOUSE_PROPERTIES.length; i++) {
    const prop = MOOD_HOUSE_PROPERTIES[i];
    const locationKey = `${prop.city}|${prop.location}`;
    const locationId = locationMap[locationKey] || null;
    const agentId = agentIds[i % agentIds.length];
    const typeId = typeMap[prop.type] || typeMap['House'];

    await prisma.property.create({
      data: {
        title: prop.title,
        description: `${prop.title} is a beautiful property located in ${prop.location}, ${prop.city}. Featuring modern amenities and spacious interiors in Kurdistan Region's most sought-after neighborhoods.`,
        shortDescription: `${prop.type} for ${prop.purpose === 'SALE' ? 'sale' : 'rent'} in ${prop.location}, ${prop.city}.`,
        price: prop.price,
        purpose: prop.purpose,
        areaSqm: prop.areaSqm,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        rooms: prop.bedrooms + 2,
        hasGarage: Math.random() > 0.4,
        hasBalcony: Math.random() > 0.4,
        imageUrl: prop.image,
        locationId,
        agentId,
        propertyTypeId: typeId,
        projectId: Math.random() > 0.75 ? projectIds[Math.floor(Math.random() * projectIds.length)] : null,
        images: {
          create: [
            { imageKey: prop.image, sortOrder: 0 },
          ],
        },
        amenities: {
          create: allAmenities
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)
            .map(a => ({ amenityId: a.id })),
        },
      },
    });
  }

  // 8. Website Reviews / Testimonials
  console.log('⭐ Creating Testimonials...');
  await prisma.websiteReview.createMany({
    data: [
      { name: 'Ahmed Hassan', role: 'Homeowner in Erbil', rating: 5, text: 'The team helped us find our dream home in record time. Their knowledge of the local market and dedication to customer service is unmatched.', image: AGENT_IMAGES[0] },
      { name: 'Sara Mahmoud', role: 'First-time Buyer', rating: 5, text: 'As a first-time buyer, I was nervous about the process. They guided me through every step and made it stress-free. Highly recommend!', image: AGENT_IMAGES[1] },
      { name: 'Karwan Ali', role: 'Property Investor', rating: 5, text: 'I have worked with many real estate agencies, but none compare to the professionalism and expertise offered here. Exceptional service.', image: AGENT_IMAGES[2] },
      { name: 'John Doe', role: 'Tenant', rating: 4, text: 'Great experience renting an apartment. Very professional and efficient process.', image: AGENT_IMAGES[3] },
    ],
  });

  console.log(`✅ Seeding completed! Inserted ${MOOD_HOUSE_PROPERTIES.length} properties from Mood-House data.`);
  console.log('📝 Admin login: admin@freshestates.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
