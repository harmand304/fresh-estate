import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET user preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.user.id },
      include: { city: true }
    });
    res.json(preference);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// POST/Update user preferences
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { purpose, cityId, propertyType, propertyStyle, minPrice, maxPrice } = req.body;

    const preference = await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      update: {
        purpose,
        cityId: cityId ? parseInt(cityId) : null,
        propertyType,
        propertyStyle,
        minPrice: parseFloat(minPrice) || 0,
        maxPrice: parseFloat(maxPrice) || 10000000
      },
      create: {
        userId: req.user.id,
        purpose,
        cityId: cityId ? parseInt(cityId) : null,
        propertyType,
        propertyStyle,
        minPrice: parseFloat(minPrice) || 0,
        maxPrice: parseFloat(maxPrice) || 10000000
      }
    });

    res.json(preference);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

export default router;
