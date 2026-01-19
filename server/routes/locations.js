import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// LOCATION REVIEWS
// ============================================

// GET reviews for a location
router.get('/:id/reviews', async (req, res) => {
  console.log(`GET /api/locations/${req.params.id}/reviews hit`);
  try {
    const reviews = await prisma.locationReview.findMany({
      where: { locationId: parseInt(req.params.id) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching location reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST a review for a location
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  console.log(`POST /api/locations/${req.params.id}/reviews hit`);
  try {
    const { rating, comment } = req.body;
    const locationId = parseInt(req.params.id);
    const userId = req.user.id;

    const review = await prisma.locationReview.create({
      data: {
        locationId,
        userId,
        rating,
        comment
      },
      include: { user: { select: { name: true } } }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating location review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================
// LOCATION CRUD
// ============================================

// GET all locations
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { city: true, _count: { select: { properties: true } } },
      orderBy: [{ city: { name: 'asc' } }, { name: 'asc' }]
    });
    res.json(locations.map(l => ({
      ...l,
      cityName: l.city.name,
      propertyCount: l._count.properties
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// CREATE location
router.post('/', async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const location = await prisma.location.create({
      data: { name, cityId }
    });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// UPDATE location
router.put('/:id', async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const location = await prisma.location.update({
      where: { id: parseInt(req.params.id) },
      data: { name, cityId }
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE location
router.delete('/:id', async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
