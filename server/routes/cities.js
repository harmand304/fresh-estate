import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// GET all cities
router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: { _count: { select: { locations: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(cities.map(c => ({
      ...c,
      locationCount: c._count.locations
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// CREATE city
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const city = await prisma.city.create({ data: { name } });
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create city' });
  }
});

// UPDATE city
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const city = await prisma.city.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update city' });
  }
});

// DELETE city
router.delete('/:id', async (req, res) => {
  try {
    await prisma.city.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'City deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

export default router;
