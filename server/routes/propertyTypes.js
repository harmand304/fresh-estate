import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// GET all property types
router.get('/', async (req, res) => {
  try {
    const types = await prisma.propertyType.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(types.map(t => ({
      ...t,
      propertyCount: t._count.properties
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property types' });
  }
});

export default router;
