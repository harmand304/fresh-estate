import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all website reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.websiteReview.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching website reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST new website review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, role, rating, text } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const review = await prisma.websiteReview.create({
      data: {
        name,
        role: role || 'User',
        rating: parseInt(rating) || 5,
        text
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error creating website review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;
