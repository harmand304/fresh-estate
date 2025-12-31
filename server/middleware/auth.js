import jwt from 'jsonwebtoken';
import { prisma, JWT_SECRET } from '../config/db.js';

/**
 * Middleware to verify JWT token from cookies
 */
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Middleware to require agent role and attach agent profile
 */
export const requireAgent = async (req, res, next) => {
  if (req.user.role !== 'AGENT') {
    return res.status(403).json({ error: 'Agent access required' });
  }
  
  // Get agent profile linked to this user
  const agent = await prisma.agent.findUnique({
    where: { userId: req.user.id }
  });
  
  if (!agent) {
    return res.status(403).json({ error: 'No agent profile linked to this account' });
  }
  
  req.agent = agent;
  next();
};
