import express from 'express';
import { prisma } from '../config/db.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';
import { authenticateToken, requireAgent } from '../middleware/auth.js';

const router = express.Router();

// CREATE inquiry (public - for tour requests and messages)
router.post('/', async (req, res) => {
  try {
    const { propertyId, agentId, name, email, phone, message, type } = req.body;

    if (!propertyId || !agentId || !name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        agentId: parseInt(agentId),
        name,
        email,
        phone: phone || null,
        message,
        type: type || 'TOUR',
        status: 'PENDING'
      },
      include: {
        property: { select: { title: true } }
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Your inquiry has been sent successfully!',
      inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

export default router;
