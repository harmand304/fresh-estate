import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, requireAgent } from '../middleware/auth.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';

const router = express.Router();

// ============================================
// DASHBOARD & REPORTS
// ============================================

// GET agent dashboard stats
router.get('/dashboard', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;

    let totalListings = 0;
    let activeDeals = 0;
    let completedDeals = 0;
    let totalRevenue = 0;
    let recentDeals = [];

    try {
      totalListings = await prisma.property.count({ where: { agentId } });
    } catch (e) { console.error('Error counting listings:', e.message); }

    try {
      activeDeals = await prisma.deal.count({
        where: { agentId, status: { in: ['PENDING'] } }
      });
    } catch (e) { console.error('Error counting active deals:', e.message); }

    try {
      completedDeals = await prisma.deal.count({
        where: { agentId, status: 'COMPLETED' }
      });
    } catch (e) { console.error('Error counting completed deals:', e.message); }

    try {
      const revenueResult = await prisma.deal.aggregate({
        where: { agentId, status: 'COMPLETED' },
        _sum: { price: true }
      });
      totalRevenue = Number(revenueResult._sum.price || 0);
    } catch (e) { console.error('Error calculating revenue:', e.message); }

    try {
      const deals = await prisma.deal.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      recentDeals = deals.map(d => ({
        id: d.id,
        propertyTitle: d.propertyTitle || 'Property',
        clientName: d.clientName,
        dealType: d.dealType,
        price: Number(d.price),
        status: d.status,
        createdAt: d.createdAt
      }));
    } catch (e) { console.error('Error fetching recent deals:', e.message); }

    res.json({ totalListings, activeDeals, completedDeals, totalRevenue, recentDeals });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// GET agent reports with period filtering
router.get('/reports', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;
    const period = req.query.period || 'all';

    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      dateFilter = { gte: startOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(now);
      startOfMonth.setMonth(now.getMonth() - 1);
      dateFilter = { gte: startOfMonth };
    }

    const whereClause = {
      agentId,
      status: 'COMPLETED',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    const sales = await prisma.deal.aggregate({
      where: { ...whereClause, dealType: 'SALE' },
      _count: { id: true },
      _sum: { price: true }
    });

    const rentals = await prisma.deal.aggregate({
      where: { ...whereClause, dealType: 'RENT' },
      _count: { id: true },
      _sum: { price: true }
    });

    res.json({
      period,
      sales: { count: sales._count.id || 0, revenue: Number(sales._sum.price || 0) },
      rentals: { count: rentals._count.id || 0, revenue: Number(rentals._sum.price || 0) },
      totalDeals: (sales._count.id || 0) + (rentals._count.id || 0),
      totalRevenue: Number(sales._sum.price || 0) + Number(rentals._sum.price || 0)
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ============================================
// PROPERTIES
// ============================================

// GET agent's properties
router.get('/properties', authenticateToken, requireAgent, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { agentId: req.agent.id },
      include: {
        location: { include: { city: true } },
        propertyType: true,
        deals: {
            where: { status: 'COMPLETED' },
            select: { dealType: true },
            take: 1
        },
        _count: { select: { deals: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = await Promise.all(properties.map(async (p) => {
      const completedDeal = p.deals[0];
      return {
        id: p.id,
        title: p.title,
        price: Number(p.price),
        purpose: p.purpose,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqm: p.areaSqm,
        image: await getSignedImageUrl(p.imageUrl),
        imageKey: p.imageUrl,
        locationId: p.locationId,
        propertyTypeId: p.propertyTypeId,
        area: p.location?.name || '',
        city: p.location?.city?.name || '',
        type: p.propertyType?.name || 'House',
        dealCount: p._count.deals,
        createdAt: p.createdAt,
        dealStatus: completedDeal ? 'COMPLETED' : null,
        completedDealType: completedDeal ? completedDeal.dealType : null
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Agent properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// POST - Agent creates a property
router.post('/properties', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { title, price, purpose, areaSqm, bedrooms, bathrooms, 
            hasGarage, hasBalcony, imageUrl, locationId, propertyTypeId, description } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        price: parseFloat(price),
        purpose: purpose.toUpperCase(),
        areaSqm: parseInt(areaSqm) || null,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        hasGarage: Boolean(hasGarage),
        hasBalcony: Boolean(hasBalcony),
        imageUrl,
        locationId: parseInt(locationId) || null,
        propertyTypeId: parseInt(propertyTypeId) || null,
        agentId: req.agent.id,
        description: description || null
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Agent create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT - Agent updates their property
router.put('/properties/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });

    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to edit this property' });
    }

    const { title, price, purpose, areaSqm, bedrooms, bathrooms, 
            hasGarage, hasBalcony, imageUrl, locationId, propertyTypeId, description, shortDescription } = req.body;

    const updateData = {
      title: title || existing.title,
      price: parseFloat(price) || existing.price,
      purpose: purpose ? purpose.toUpperCase() : existing.purpose,
      areaSqm: parseInt(areaSqm) || existing.areaSqm,
      bedrooms: parseInt(bedrooms) || existing.bedrooms,
      bathrooms: parseInt(bathrooms) || existing.bathrooms,
      hasGarage: Boolean(hasGarage),
      hasBalcony: Boolean(hasBalcony),
      locationId: locationId ? parseInt(locationId) : existing.locationId,
      propertyTypeId: propertyTypeId ? parseInt(propertyTypeId) : existing.propertyTypeId,
      description: description !== undefined ? description : existing.description,
      shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
      updatedAt: new Date()
    };

    if (imageUrl) updateData.imageUrl = imageUrl;

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(property);
  } catch (error) {
    console.error('Agent update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE - Agent deletes their property
router.delete('/properties/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });

    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Agent delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// POST - Agent adds images to property
router.post('/properties/:id/images', authenticateToken, requireAgent, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { images } = req.body;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (images && images.length > 0) {
      await prisma.propertyImage.createMany({
        data: images.map(img => ({
          propertyId,
          imageKey: img.key,
          sortOrder: img.sortOrder
        }))
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Agent add images error:', error);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// DELETE - Agent removes property image
router.delete('/property-images/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);

    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true }
    });

    if (!image || image.property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.propertyImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Agent delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// POST - Agent sets amenities
router.post('/properties/:id/amenities', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { amenityIds } = req.body;
    const propertyId = req.params.id;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
    
    if (amenityIds && amenityIds.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: amenityIds.map(amenityId => ({
          propertyId,
          amenityId: parseInt(amenityId)
        }))
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Agent set amenities error:', error);
    res.status(500).json({ error: 'Failed to set amenities' });
  }
});

// ============================================
// DEALS
// ============================================

// GET agent's deals
router.get('/deals', authenticateToken, requireAgent, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { agentId: req.agent.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(deals.map(d => ({
      id: d.id,
      propertyId: d.propertyId,
      propertyTitle: d.property.title,
      clientName: d.clientName,
      clientPhone: d.clientPhone,
      clientEmail: d.clientEmail,
      dealType: d.dealType,
      price: Number(d.price),
      status: d.status,
      notes: d.notes,
      createdAt: d.createdAt,
      completedAt: d.completedAt
    })));
  } catch (error) {
    console.error('Agent deals error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// POST - Create new deal
router.post('/deals', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { propertyId, clientName, clientPhone, clientEmail, dealType, price, notes } = req.body;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized for this property' });
    }

    const deal = await prisma.deal.create({
      data: {
        propertyId,
        agentId: req.agent.id,
        clientName,
        clientPhone,
        clientEmail,
        dealType: dealType.toUpperCase(),
        price: parseFloat(price),
        notes,
        status: 'PENDING'
      },
      include: { property: true }
    });

    res.status(201).json({
      id: deal.id,
      propertyTitle: deal.property.title,
      clientName: deal.clientName,
      dealType: deal.dealType,
      price: Number(deal.price),
      status: deal.status
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// PUT - Update deal status
router.put('/deals/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const existing = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to edit this deal' });
    }

    const updateData = { notes };
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') updateData.completedAt = new Date();
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: { property: true }
    });

    res.json({
      id: deal.id,
      propertyTitle: deal.property.title,
      status: deal.status,
      completedAt: deal.completedAt
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// DELETE - Cancel/delete deal
router.delete('/deals/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);

    const existing = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to delete this deal' });
    }

    await prisma.deal.delete({ where: { id: dealId } });
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// ============================================
// INQUIRIES
// ============================================

// GET inquiries for logged-in agent
router.get('/inquiries', authenticateToken, requireAgent, async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { agentId: req.agent.id },
      include: {
        property: {
          include: { location: { include: { city: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const inquiriesWithImages = await Promise.all(inquiries.map(async (inq) => {
      let propertyImage = null;
      if (inq.property?.imageUrl) {
        propertyImage = inq.property.imageUrl.startsWith('http')
          ? inq.property.imageUrl
          : await getSignedImageUrl(inq.property.imageUrl);
      }
      return {
        ...inq,
        property: {
          ...inq.property,
          image: propertyImage,
          price: Number(inq.property?.price || 0),
          area: inq.property?.location?.name || '',
          city: inq.property?.location?.city?.name || ''
        }
      };
    }));

    res.json(inquiriesWithImages);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// UPDATE inquiry status (agent only)
router.patch('/inquiries/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { status } = req.body;
    const inquiryId = parseInt(req.params.id);

    const existing = await prisma.inquiry.findFirst({
      where: { id: inquiryId, agentId: req.agent.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status }
    });

    res.json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// ============================================
// PROFILE & REVIEWS
// ============================================

// GET agent's own profile
router.get('/profile', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.agent.id },
      include: { city: true }
    });

    let imageUrl = agent.image;
    if (agent.image && !agent.image.startsWith('http')) {
      imageUrl = await getSignedImageUrl(agent.image);
    }

    res.json({
      ...agent,
      image: imageUrl,
      imageKey: agent.image,
      cityName: agent.city?.name || ''
    });
  } catch (error) {
    console.error('Agent profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT - Update agent's own profile
router.put('/profile', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { name, phone, email, bio, image, website, officeAddress, cityId, specialties } = req.body;

    const agent = await prisma.agent.update({
      where: { id: req.agent.id },
      data: {
        name,
        phone,
        email,
        bio,
        image,
        website,
        officeAddress,
        cityId: cityId ? parseInt(cityId) : null,
        specialties: Array.isArray(specialties) ? JSON.stringify(specialties) : specialties
      }
    });

    // --- NEW: Also update Relational Tables ---
    if (specialties && Array.isArray(specialties)) {
      // 1. Remove old links
      await prisma.agentSpecialization.deleteMany({
        where: { agentId: req.agent.id }
      });

      // 2. Add new links
      for (const specName of specialties) {
        // Find or create the specialization
        const specialization = await prisma.specialization.upsert({
          where: { name: specName },
          update: {},
          create: { name: specName }
        });

        // Link it to the agent
        await prisma.agentSpecialization.create({
          data: {
            agentId: req.agent.id,
            specializationId: specialization.id
          }
        });
      }
    }
    // ------------------------------------------

    res.json(agent);
  } catch (error) {
    console.error('Update agent profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET agent's own reviews
router.get('/reviews', authenticateToken, requireAgent, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { agentId: req.agent.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Agent reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
