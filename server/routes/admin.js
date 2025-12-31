import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [propertyCount, agentCount, cityCount, locationCount] = await Promise.all([
      prisma.property.count(),
      prisma.agent.count(),
      prisma.city.count(),
      prisma.location.count()
    ]);

    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { location: { include: { city: true } } }
    });

    res.json({
      stats: { propertyCount, agentCount, cityCount, locationCount },
      recentProperties: recentProperties.map(p => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        city: p.location?.city?.name || ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// CREATE project (admin)
router.post('/projects', async (req, res) => {
  try {
    const { name, description, image, status, location, priceRange, bedRange, bathRange, sqftRange } = req.body;
    
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        status: status || 'PRE_SELLING',
        location: location || null,
        priceRange: priceRange || null,
        bedRange: bedRange || null,
        bathRange: bathRange || null,
        sqftRange: sqftRange || null
      }
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// UPDATE project (admin)
router.put('/projects/:id', async (req, res) => {
  try {
    const { name, description, image, status, location, priceRange, bedRange, bathRange, sqftRange } = req.body;
    
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        image,
        status,
        location,
        priceRange,
        bedRange,
        bathRange,
        sqftRange,
        updatedAt: new Date()
      }
    });
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project (admin)
router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.property.updateMany({
      where: { projectId: parseInt(req.params.id) },
      data: { projectId: null }
    });
    
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Link property to project (admin)
router.put('/properties/:id/project', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { projectId: projectId ? parseInt(projectId) : null }
    });
    
    res.json(property);
  } catch (error) {
    console.error('Error linking property to project:', error);
    res.status(500).json({ error: 'Failed to link property to project' });
  }
});

// Add images to a property
router.post('/properties/:id/images', async (req, res) => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    const createdImages = await Promise.all(
      images.map(async (img, index) => {
        return prisma.propertyImage.create({
          data: {
            propertyId: req.params.id,
            imageKey: img.key,
            sortOrder: img.sortOrder ?? index
          }
        });
      })
    );

    res.json({ success: true, images: createdImages });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// Delete a property image
router.delete('/property-images/:id', async (req, res) => {
  try {
    await prisma.propertyImage.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// SET amenities for a property (admin)
router.post('/properties/:id/amenities', async (req, res) => {
  try {
    const { amenityIds } = req.body;
    const propertyId = req.params.id;
    
    await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
    
    if (amenityIds && amenityIds.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: amenityIds.map(amenityId => ({
          propertyId,
          amenityId: parseInt(amenityId)
        }))
      });
    }
    
    res.json({ success: true, count: amenityIds?.length || 0 });
  } catch (error) {
    console.error('Error setting amenities:', error);
    res.status(500).json({ error: 'Failed to set amenities' });
  }
});

export default router;
