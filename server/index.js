import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import route modules
import authRoutes from './routes/auth.js';
import favoritesRoutes from './routes/favorites.js';
import uploadRoutes from './routes/upload.js';
import locationsRoutes from './routes/locations.js';
import propertiesRoutes from './routes/properties.js';
import projectsRoutes from './routes/projects.js';
import agentsRoutes from './routes/agents.js';
import amenitiesRoutes from './routes/amenities.js';
import citiesRoutes from './routes/cities.js';
import propertyTypesRoutes from './routes/propertyTypes.js';
import analyticsRoutes from './routes/analytics.js';
import inquiriesRoutes from './routes/inquiries.js';
import adminRoutes from './routes/admin.js';
import userPreferencesRoutes from './routes/userPreferences.js';
import websiteReviewsRoutes from './routes/websiteReviews.js';
import languagesRoutes from './routes/languages.js';
import specializationsRoutes from './routes/specializations.js';
import agentDashboardRoutes from './routes/agentDashboard.js';

// Import config
import { prisma, PORT } from './config/db.js';

const app = express();

app.use(cors({
  origin: 'https://fresh-estate.netlify.app', // Your actual Netlify URL
  credentials: true
}));

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081'
];

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ============================================
// MOUNT ROUTES
// ============================================

// Authentication
app.use('/api/auth', authRoutes);

// User Features
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user/preferences', userPreferencesRoutes);

// File Upload (mount both paths for multiple image upload)
app.use('/api/upload', uploadRoutes);


// Properties
app.use('/api/properties', propertiesRoutes);

// Projects
app.use('/api/projects', projectsRoutes);

// Agents
app.use('/api/agents', agentsRoutes);

// Locations
app.use('/api/locations', locationsRoutes);

// Cities
app.use('/api/cities', citiesRoutes);

// Property Types
app.use('/api/property-types', propertyTypesRoutes);

// Amenities
app.use('/api/amenities', amenitiesRoutes);

// Inquiries
app.use('/api/inquiries', inquiriesRoutes);

// Analytics
app.use('/api/analytics', analyticsRoutes);

// Website Reviews
app.use('/api/website-reviews', websiteReviewsRoutes);

// Languages
app.use('/api/languages', languagesRoutes);
app.use('/api/specializations', specializationsRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Agent Dashboard (all /api/agent/* routes)
app.use('/api/agent', agentDashboardRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});