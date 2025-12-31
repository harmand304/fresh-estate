
import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// GET all specializations
router.get('/', async (req, res) => {
  try {
    const specializations = await prisma.specialization.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(specializations);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

export default router;
