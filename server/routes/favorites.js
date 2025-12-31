import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET user's favorites (property IDs)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true }
    });
    res.json(favorites.map(f => f.propertyId));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// ADD to favorites
router.post('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    if (existing) {
      return res.json({ message: 'Already in favorites', favorited: true });
    }

    await prisma.favorite.create({
      data: {
        userId: req.user.id,
        propertyId
      }
    });

    res.json({ message: 'Added to favorites', favorited: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// REMOVE from favorites
router.delete('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        propertyId
      }
    });

    res.json({ message: 'Removed from favorites', favorited: false });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

export default router;
