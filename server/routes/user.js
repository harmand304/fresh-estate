import express from 'express';
import { prisma, JWT_SECRET } from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone, image } = req.body;
    
    // Make sure we only update fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        role: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
