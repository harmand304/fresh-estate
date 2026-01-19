import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma, JWT_SECRET } from '../config/db.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET all agents
router.get('/', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { 
        city: true, 
        _count: { select: { properties: true } },
        languages: { include: { language: true } }
      },
      orderBy: { name: 'asc' }
    });

    const agentsWithImages = await Promise.all(agents.map(async (a) => {
      let imageUrl = a.image;
      if (a.image && !a.image.startsWith('http')) {
        imageUrl = await getSignedImageUrl(a.image);
      }

      let parsedSpecialties = [];
      try {
        parsedSpecialties = a.specialties ? JSON.parse(a.specialties) : [];
      } catch (e) {
        parsedSpecialties = a.specialties ? [a.specialties] : [];
      }
      
      const languagesList = a.languages.map(l => l.language.name);

      return {
        ...a,
        image: imageUrl,
        cityName: a.city?.name || '',
        propertyCount: a._count.properties,
        specialties: parsedSpecialties, // Send as Array
        languages: languagesList
      };
    }));

    res.json(agentsWithImages);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET single agent with reviews and properties
router.get('/:id', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        city: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        properties: {
          include: {
            location: { include: { city: true } },
            propertyType: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    let specialties = [];
    try {
      if (agent.specialties) {
        specialties = JSON.parse(agent.specialties);
      }
    } catch (e) {
      specialties = agent.specialties ? [agent.specialties] : [];
    }

    let agentImage = agent.image;
    if (agent.image && !agent.image.startsWith('http')) {
      agentImage = await getSignedImageUrl(agent.image);
    }

    const propertiesWithImages = await Promise.all(agent.properties.map(async (p) => {
      let imageUrl = p.imageUrl;
      if (p.imageUrl && !p.imageUrl.startsWith('http')) {
        imageUrl = await getSignedImageUrl(p.imageUrl);
      }
      return {
        id: p.id,
        title: p.title,
        price: Number(p.price),
        purpose: p.purpose,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqm: p.areaSqm,
        image: imageUrl,
        city: p.location?.city?.name || '',
        area: p.location?.name || '',
        type: p.propertyType?.name || 'House'
      };
    }));

    res.json({
      ...agent,
      image: agentImage,
      specialties,
      cityName: agent.city?.name || '',
      propertyCount: agent.properties.length,
      properties: propertiesWithImages
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});



// ... (existing imports)

// CHECK if user can review agent
router.get('/:id/can-review', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const token = req.cookies.token;
    
    if (!token) {
      return res.json({ canReview: false });
    }

    let userEmail = null;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userEmail = decoded.email;
    } catch (e) {
      return res.json({ canReview: false });
    }

    // Check if user has a deal with this agent
    const deal = await prisma.deal.findFirst({
      where: {
        agentId: agentId,
        clientEmail: userEmail
      }
    });

    res.json({ canReview: !!deal });
  } catch (error) {
    console.error('Error checking review permission:', error);
    // Default to false on error to be safe
    res.json({ canReview: false });
  }
});

// POST review for agent
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { name, rating, text } = req.body;
    const userEmail = req.user.email;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and review text are required' });
    }
    
    // Verify deal exists
    const deal = await prisma.deal.findFirst({
      where: {
        agentId: agentId,
        clientEmail: userEmail
      }
    });

    if (!deal) {
      return res.status(403).json({ error: 'Only clients who have closed a deal with this agent can leave a review.' });
    }

    const validRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const review = await prisma.review.create({
      data: {
        agentId,
        name,
        rating: validRating,
        text
      }
    });

    const allReviews = await prisma.review.findMany({
      where: { agentId },
      select: { rating: true }
    });
    
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length
      }
    });

    res.json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// SEND MESSAGE to agent from profile page (no property required)
router.post('/:id/messages', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const firstProperty = await prisma.property.findFirst({
      where: { agentId },
      select: { id: true }
    });

    if (!firstProperty) {
      return res.status(201).json({ success: true, message: 'Your message has been sent to the agent!' });
    }

    await prisma.inquiry.create({
      data: {
        propertyId: firstProperty.id,
        agentId,
        name,
        email,
        phone: phone || null,
        message,
        type: 'MESSAGE',
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, message: 'Your message has been sent to the agent!' });
  } catch (error) {
    console.error('Error sending message to agent:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// CREATE agent with user account
router.post('/', async (req, res) => {
  try {
    const { 
      name, phone, email, bio, image, website, 
      experience, specialties, officeAddress, 
      officeLat, officeLng, isTopAgent, cityId,
      password, loginEmail
    } = req.body;

    if (!loginEmail || !password) {
      return res.status(400).json({ error: 'Login email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Login email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // POST logic
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: loginEmail,
          password: hashedPassword,
          name,
          role: 'AGENT'
        }
      });

      const agent = await tx.agent.create({
        data: {
          name,
          phone,
          email: email || loginEmail,
          bio,
          image,
          website,
          experience: experience || 0,
          specialties: Array.isArray(specialties) ? JSON.stringify(specialties) : specialties,
          officeAddress,
          officeLat,
          officeLng,
          isTopAgent: isTopAgent || false,
          cityId: cityId ? parseInt(cityId) : null,
          userId: user.id,
          languages: {
             create: Array.isArray(req.body.languages) ? req.body.languages.map(langId => ({
                language: { connect: { id: parseInt(langId) } }
             })) : []
          }
        }
      });

      return agent;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// UPDATE agent
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, phone, email, bio, image, website, contactPassword,
      experience, rating, reviewCount, specialties, 
      officeAddress, officeLat, officeLng, isTopAgent, cityId,
      languages 
    } = req.body;
    
    // Use transaction to update languages
    const result = await prisma.$transaction(async (tx) => {
        const agent = await tx.agent.update({
          where: { id: parseInt(req.params.id) },
          data: {
            name,
            phone,
            email,
            bio,
            image,
            website,
            contactPassword,
            experience,
            rating,
            reviewCount,
            specialties: Array.isArray(specialties) ? JSON.stringify(specialties) : specialties,
            officeAddress,
            officeLat,
            officeLng,
            isTopAgent,
            cityId: cityId ? parseInt(cityId) : null
          }
        });

        if (Array.isArray(languages)) {
            // Remove all existing languages
            await tx.agentLanguage.deleteMany({
                where: { agentId: agent.id }
            });

            // Add new languages
            if (languages.length > 0) {
                await tx.agentLanguage.createMany({
                    data: languages.map(langId => ({
                        agentId: agent.id,
                        languageId: parseInt(langId)
                    }))
                });
            }
        }
        
        return agent;
    });

    // --- NEW: Also update Relational Tables for Specializations ---
    if (specialties && Array.isArray(specialties)) {
      // 1. Remove old links
      await prisma.agentSpecialization.deleteMany({
        where: { agentId: parseInt(req.params.id) }
      });

      // 2. Add new links
      for (const specName of specialties) {
        const specialization = await prisma.specialization.upsert({
          where: { name: specName },
          update: {},
          create: { name: specName }
        });

        await prisma.agentSpecialization.create({
          data: {
            agentId: parseInt(req.params.id),
            specializationId: specialization.id
          }
        });
      }
    }
    // ------------------------------------------

    res.json(result);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE agent
router.delete('/:id', async (req, res) => {
  try {
    await prisma.agent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
