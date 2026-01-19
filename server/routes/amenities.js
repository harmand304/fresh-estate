import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// Default amenities to seed
const defaultAmenities = [
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

// GET all amenities (seeds if empty)
router.get('/', async (req, res) => {
  try {
    let amenities = await prisma.amenity.findMany({ orderBy: { category: 'asc' } });
    
    // Seed if empty
    if (amenities.length === 0) {
      await prisma.amenity.createMany({ data: defaultAmenities });
      amenities = await prisma.amenity.findMany({ orderBy: { category: 'asc' } });
    }
    
    res.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

export default router;
