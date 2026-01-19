import express from 'express';
import { prisma } from '../config/db.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';

const router = express.Router();

// GET all projects with property count and summary
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        properties: {
          select: {
            id: true,
            bedrooms: true,
            bathrooms: true,
            areaSqm: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = await Promise.all(projects.map(async (p) => {
      let coverImage = p.image;
      if (!coverImage && p.properties.length > 0 && p.properties[0].imageUrl) {
        coverImage = p.properties[0].imageUrl;
      }
      const signedCoverImage = coverImage ? await getSignedImageUrl(coverImage) : null;

      const beds = p.properties.map(prop => prop.bedrooms).filter(b => b > 0);
      const baths = p.properties.map(prop => prop.bathrooms).filter(b => b > 0);
      const sqfts = p.properties.map(prop => prop.areaSqm).filter(s => s > 0);

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image: signedCoverImage,
        status: p.status,
        location: p.location,
        priceRange: p.priceRange,
        bedRange: p.bedRange || (beds.length > 0 ? `${Math.min(...beds)}-${Math.max(...beds)} Beds` : null),
        bathRange: p.bathRange || (baths.length > 0 ? `${Math.min(...baths)} Baths` : null),
        sqftRange: p.sqftRange || (sqfts.length > 0 ? `${Math.min(...sqfts).toLocaleString()}+ sqft` : null),
        propertyCount: p.properties.length,
        createdAt: p.createdAt
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project with all its properties
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        properties: {
          include: {
            location: { include: { city: true } },
            agent: true,
            propertyType: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const signedProjectImage = project.image ? await getSignedImageUrl(project.image) : null;

    const propertiesWithImages = await Promise.all(project.properties.map(async (p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      purpose: p.purpose,
      sqm: p.areaSqm,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      image: await getSignedImageUrl(p.imageUrl),
      city: p.location?.city?.name || '',
      area: p.location?.name || '',
      type: p.propertyType?.name || 'House'
    })));

    res.json({
      ...project,
      image: signedProjectImage,
      properties: propertiesWithImages
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

export default router;
