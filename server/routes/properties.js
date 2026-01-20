import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';

const router = express.Router();

// GET all properties with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      deals: {
        none: { status: 'COMPLETED' }
      }
    };

    if (req.query.city && req.query.city !== 'all') {
      where.location = {
        city: {
          name: { equals: req.query.city, mode: 'insensitive' }
        }
      };
    }

    if (req.query.purpose && req.query.purpose !== 'all') {
      where.purpose = req.query.purpose;
    }

    if (req.query.type && req.query.type !== 'all') {
      where.propertyType = {
        name: { equals: req.query.type, mode: 'insensitive' }
      };
    }

    if (req.query.bedrooms && req.query.bedrooms !== 'any') {
      if (req.query.bedrooms === '5+') {
        where.bedrooms = { gte: 5 };
      } else {
        where.bedrooms = parseInt(req.query.bedrooms);
      }
    }

    if (req.query.bathrooms && req.query.bathrooms !== 'any') {
      if (req.query.bathrooms === '4+') {
        where.bathrooms = { gte: 4 };
      } else {
        where.bathrooms = parseInt(req.query.bathrooms);
      }
    }

    if (req.query.minPrice) {
      where.price = { ...where.price, gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      where.price = { ...where.price, lte: parseFloat(req.query.maxPrice) };
    }

    if (req.query.minArea) {
      where.areaSqm = { ...where.areaSqm, gte: parseFloat(req.query.minArea) };
    }
    if (req.query.maxArea) {
      where.areaSqm = { ...where.areaSqm, lte: parseFloat(req.query.maxArea) };
    }

    if (req.query.location) {
      const searchTerm = req.query.location.toLowerCase();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { location: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { location: { city: { name: { contains: searchTerm, mode: 'insensitive' } } } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.property.count({ where });

    // Fetch properties with specific fields only
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        purpose: true,
        areaSqm: true,
        bedrooms: true,
        bathrooms: true,
        imageUrl: true,
        hasGarage: true,
        hasBalcony: true,
        location: {
          select: {
            name: true,
            city: { select: { name: true } }
          }
        },
        propertyType: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Generate signed URLs for images
    const result = await Promise.all(properties.map(async (p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      purpose: p.purpose,
      sqm: p.areaSqm,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      hasGarage: p.hasGarage,
      hasBalcony: p.hasBalcony,
      image: await getSignedImageUrl(p.imageUrl),
      area: p.location?.name || '',
      city: p.location?.city?.name || '',
      type: p.propertyType?.name || 'House'
    })));

    res.json({
      properties: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET personalized properties based on user preferences
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const preference = await prisma.userPreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      return res.json({ properties: [], message: 'No preferences set' });
    }

    const where = {};

    if (preference.purpose === 'BUY') {
      where.purpose = 'SALE';
    } else if (preference.purpose === 'RENT') {
      where.purpose = 'RENT';
    }

    where.price = {
      gte: preference.minPrice,
      lte: preference.maxPrice
    };

    if (preference.cityId) {
      where.location = { cityId: preference.cityId };
    }

    if (preference.propertyType && preference.propertyType !== 'BOTH') {
      const typeObj = await prisma.propertyType.findFirst({
        where: { name: { equals: preference.propertyType, mode: 'insensitive' } }
      });
      if (typeObj) {
        where.propertyTypeId = typeObj.id;
      }
    }

    if (preference.propertyStyle === 'NORMAL') {
      where.projectId = null;
    } else if (preference.propertyStyle === 'PROJECT') {
      where.projectId = { not: null };
    }

    let properties = await prisma.property.findMany({
      where,
      include: {
        location: { include: { city: true } },
        propertyType: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    let isNearMatch = false;

    if (properties.length === 0) {
      const relaxedWhere = { price: where.price };
      if (where.purpose) relaxedWhere.purpose = where.purpose;

      properties = await prisma.property.findMany({
        where: relaxedWhere,
        include: {
          location: { include: { city: true } },
          propertyType: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      if (properties.length > 0) isNearMatch = true;
    }

    const propertiesWithImages = await Promise.all(properties.map(async (p) => {
      let image = null;
      if (p.imageUrl) {
        image = p.imageUrl.startsWith('http') ? p.imageUrl : await getSignedImageUrl(p.imageUrl);
      }
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        shortDescription: p.shortDescription,
        price: Number(p.price),
        purpose: p.purpose,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqm: p.areaSqm,
        rooms: p.rooms,
        hasGarage: p.hasGarage,
        hasBalcony: p.hasBalcony,
        image,
        createdAt: p.createdAt,
        city: p.location?.city?.name || '',
        area: p.location?.name || '',
        type: p.propertyType?.name || 'House'
      };
    }));

    res.json({
      properties: propertiesWithImages,
      isNearMatch,
      message: isNearMatch ? 'No exact matches found, but here are some options within your price range.' : null
    });
  } catch (error) {
    console.error('Personalized properties error:', error);
    res.status(500).json({ error: 'Failed to fetch personalized properties' });
  }
});

// GET single property
router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        location: { include: { city: true } },
        agent: true,
        propertyType: true,
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        deals: {
          where: { status: 'COMPLETED' },
          select: { dealType: true },
          take: 1
        }
      }
    });

    if (!property) return res.status(404).json({ error: 'Property not found' });

    const galleryImageUrls = await Promise.all(
      property.images.map(async (img) => await getSignedImageUrl(img.imageKey))
    );
    const validGalleryImages = galleryImageUrls.filter(url => url);

    const mainImageUrl = await getSignedImageUrl(property.imageUrl);

    let allImages = [];
    if (mainImageUrl) allImages.push(mainImageUrl);
    for (const url of validGalleryImages) {
      if (url && !allImages.includes(url)) allImages.push(url);
    }

    let agentImageUrl = null;
    if (property.agent?.image) {
      agentImageUrl = property.agent.image.startsWith('http')
        ? property.agent.image
        : await getSignedImageUrl(property.agent.image);
    }

    const completedDeal = property.deals && property.deals.length > 0 ? property.deals[0] : null;

    res.json({
      id: property.id,
      projectName: property.projectName,
      title: property.title,
      description: property.description,
      price: Number(property.price),
      purpose: property.purpose,
      sqm: property.areaSqm,
      bedrooms: property.bedrooms,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      hasGarage: property.hasGarage,
      hasBalcony: property.hasBalcony,
      image: mainImageUrl,
      images: allImages,
      imageKeys: property.images.map(img => ({ id: img.id, key: img.imageKey, sortOrder: img.sortOrder })),
      amenities: property.amenities.map(pa => pa.amenity),
      locationId: property.locationId,
      agentId: property.agentId,
      propertyTypeId: property.propertyTypeId,
      area: property.location?.name || '',
      city: property.location?.city?.name || '',
      agent: property.agent?.name || '',
      agentPhone: property.agent?.phone || '',
      agentEmail: property.agent?.email || '',
      agentImage: agentImageUrl,
      agentRating: property.agent?.rating || 0,
      agentReviewCount: property.agent?.reviewCount || 0,
      type: property.propertyType?.name || 'House',
      dealStatus: completedDeal ? 'COMPLETED' : null,
      completedDealType: completedDeal ? completedDeal.dealType : null
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// GET amenities for a specific property
router.get('/:id/amenities', async (req, res) => {
  try {
    const propertyAmenities = await prisma.propertyAmenity.findMany({
      where: { propertyId: req.params.id },
      include: { amenity: true }
    });
    res.json(propertyAmenities.map(pa => pa.amenity));
  } catch (error) {
    console.error('Error fetching property amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// CREATE property
router.post('/', async (req, res) => {
  try {
    const { title, description, shortDescription, price, purpose, sqm, bedrooms, rooms, bathrooms, hasGarage, hasBalcony, image, locationId, agentId, propertyTypeId, projectName } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        description: description || null,
        shortDescription: shortDescription || null,
        price: price || 0,
        purpose: purpose || 'SALE',
        areaSqm: sqm || 0,
        bedrooms: bedrooms || 0,
        rooms: rooms || 0,
        bathrooms: bathrooms || 0,
        hasGarage: hasGarage || false,
        hasBalcony: hasBalcony || false,
        imageUrl: image || null,
        locationId: locationId || null,
        agentId: agentId || null,
        propertyTypeId: propertyTypeId || null,
        projectName: projectName || null
      }
    });
    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// UPDATE property
router.put('/:id', async (req, res) => {
  try {
    const { title, description, shortDescription, price, purpose, sqm, bedrooms, rooms, bathrooms, hasGarage, hasBalcony, image, locationId, agentId, propertyTypeId, projectName } = req.body;

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        shortDescription,
        price,
        purpose,
        areaSqm: sqm,
        bedrooms,
        rooms,
        bathrooms,
        hasGarage,
        hasBalcony,
        imageUrl: image,
        locationId,
        agentId,
        propertyTypeId,
        projectName,
        updatedAt: new Date()
      }
    });
    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE property
router.delete('/:id', async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;
