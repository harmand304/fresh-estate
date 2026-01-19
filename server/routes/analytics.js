import express from 'express';
import { prisma } from '../config/db.js';

const router = express.Router();

// Record page view
router.post('/pageview', async (req, res) => {
  try {
    const { path, sessionId, userId } = req.body;

    await prisma.pageView.create({
      data: {
        path: path || '/',
        sessionId: sessionId || null,
        userId: userId || null
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.json({ success: false });
  }
});

// Get analytics stats (admin only)
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalViews, todayViews, weekViews, topPages, uniqueSessions] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10
      }),
      prisma.pageView.findMany({
        where: { sessionId: { not: null } },
        distinct: ['sessionId'],
        select: { sessionId: true }
      })
    ]);

    res.json({
      totalViews,
      todayViews,
      weekViews,
      uniqueVisitors: uniqueSessions.length,
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.path
      }))
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
