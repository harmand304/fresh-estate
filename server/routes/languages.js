import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// GET all languages
router.get('/', async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

export default router;
