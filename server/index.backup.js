import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mood-real-estate-secret-key-2024';

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Backblaze B2 S3 Client
const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// DEBUG ROUTE
app.get('/api/test-ping', (req, res) => res.json({ message: 'pong' }));


// ============================================
// HELPER: Generate signed URL for private images
// ============================================
async function getSignedImageUrl(key) {
  if (!key) return null;
  
  // If it's already a full URL (for existing images), return as-is
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
    return key;
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
  });
  
  // Generate signed URL valid for 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// ============================================
// AUTH MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireAgent = async (req, res, next) => {
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

// ============================================
// LOCATION REVIEWS API
// ============================================

// GET reviews for a location
app.get('/api/locations/:id/reviews', async (req, res) => {
  console.log(`GET /api/locations/${req.params.id}/reviews hit`);
  try {
    const reviews = await prisma.locationReview.findMany({
      where: { locationId: parseInt(req.params.id) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching location reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST a review for a location
app.post('/api/locations/:id/reviews', authenticateToken, async (req, res) => {
  console.log(`POST /api/locations/${req.params.id}/reviews hit`);
  try {
    const { rating, comment } = req.body;
    const locationId = parseInt(req.params.id);
    const userId = req.user.id;

    const review = await prisma.locationReview.create({
      data: {
        locationId,
        userId,
        rating,
        comment
      },
      include: { user: { select: { name: true } } }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating location review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================
// AUTHENTICATION API
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'USER'
      }
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.json({ user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.json({ user: null });
    }

    res.json({ user });
  } catch (error) {
    res.json({ user: null });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ============================================
// FAVORITES API
// ============================================

// GET user's favorites (property IDs)
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true }
    });
    res.json(favorites.map(f => f.propertyId));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// ADD to favorites
app.post('/api/favorites/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId
        }
      }
    });

    if (existing) {
      return res.json({ message: 'Already in favorites', favorited: true });
    }

    await prisma.favorite.create({
      data: {
        userId: req.user.id,
        propertyId
      }
    });

    res.json({ message: 'Added to favorites', favorited: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// REMOVE from favorites
app.delete('/api/favorites/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        propertyId
      }
    });

    res.json({ message: 'Removed from favorites', favorited: false });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// ============================================
// IMAGE UPLOAD API
// ============================================

// Upload image to Backblaze B2
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename - use different folders for agents vs properties
    const folder = req.query.type === 'agent' ? 'agents' : 'properties';
    const ext = req.file.originalname.split('.').pop();
    const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

    // Upload to B2
    const command = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    // Get signed URL for preview
    const signedUrl = await getSignedImageUrl(filename);

    // Return the key and signed URL for preview
    res.json({ 
      success: true,
      key: filename,
      signedUrl: signedUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload multiple images for a property
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadedImages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const ext = file.originalname.split('.').pop();
      const filename = `properties/${crypto.randomUUID()}.${ext}`;

      // Upload to B2
      const command = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      
      const signedUrl = await getSignedImageUrl(filename);
      uploadedImages.push({
        key: filename,
        signedUrl: signedUrl,
        sortOrder: i
      });
    }

    res.json({ 
      success: true,
      images: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Multi-upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Add images to a property
app.post('/api/admin/properties/:id/images', async (req, res) => {
  try {
    const { images } = req.body; // Array of { key, sortOrder }
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    // Create property images
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
app.delete('/api/admin/property-images/:id', async (req, res) => {
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

// ============================================
// PROPERTIES API
// ============================================

// GET all properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        deals: {
          none: { status: 'COMPLETED' }
        }
      },
      include: {
        location: { include: { city: true } },
        agent: true,
        propertyType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate signed URLs for all images
    const result = await Promise.all(properties.map(async (p) => ({
      id: p.id,
      projectName: p.projectName,
      title: p.title,
      price: Number(p.price),
      purpose: p.purpose,
      sqm: p.areaSqm,
      shortDescription: p.shortDescription || '',
      bedrooms: p.bedrooms,
      rooms: p.rooms,
      bathrooms: p.bathrooms,
      hasGarage: p.hasGarage,
      hasBalcony: p.hasBalcony,
      image: await getSignedImageUrl(p.imageUrl),
      imageKey: p.imageUrl, // Keep original key for admin
      locationId: p.locationId,
      agentId: p.agentId,
      propertyTypeId: p.propertyTypeId,
      area: p.location?.name || '',
      city: p.location?.city?.name || '',
      agent: p.agent?.name || '',
      agentPhone: p.agent?.phone || '',
      type: p.propertyType?.name || 'House'
    })));

    res.json(result);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET personalized properties based on user preferences
app.get('/api/properties/personalized', authenticateToken, async (req, res) => {
  const fs = await import('fs');
  // Log request
  fs.appendFileSync('api-debug.log', `\n[${new Date().toISOString()}] PERSONALIZED API CALLED - User: ${req.user?.id}\n`);
  
  try {
    const userId = req.user.id;
    
    // 1. Fetch User Preferences
    const preference = await prisma.userPreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      console.log('No preferences found for user', userId);
      return res.json({ properties: [], message: 'No preferences set' });
    }

    console.log('User Query Prefs:', {
      purpose: preference.purpose,
      type: preference.propertyType,
      style: preference.propertyStyle, 
      cityId: preference.cityId,
      price: `${preference.minPrice}-${preference.maxPrice}`
    });

    // 2. Build Prisma WHERE Clause
    const where = {};

    // -- Purpose --
    if (preference.purpose === 'BUY') {
      where.purpose = 'SALE';
    } else if (preference.purpose === 'RENT') {
      where.purpose = 'RENT';
    }
    // If 'BOTH', don't add purpose filter

    // -- Price Range --
    where.price = {
      gte: preference.minPrice,
      lte: preference.maxPrice
    };

    // -- City --
    if (preference.cityId) {
      where.location = { cityId: preference.cityId };
    }

    // -- Property Type --
    if (preference.propertyType && preference.propertyType !== 'BOTH') {
      // Find the type ID by name (case-insensitive)
      const typeObj = await prisma.propertyType.findFirst({
        where: { 
          name: { equals: preference.propertyType, mode: 'insensitive' } 
        }
      });
      
      if (typeObj) {
        where.propertyTypeId = typeObj.id;
      } else {
        console.warn(`Could not find PropertyType for preference: ${preference.propertyType}`);
      }
    }

    // -- Property Style --
    if (preference.propertyStyle === 'NORMAL') {
      where.projectId = null;
    } else if (preference.propertyStyle === 'PROJECT') {
      where.projectId = { not: null };
    }
    // If 'BOTH', ignore

    // 3. Execute Query - include location and propertyType for display
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

    // 4. Fallback if no strict matches
    if (properties.length === 0) {
      console.log('No strict matches found. Attempting fallback...');
      
      const relaxedWhere = {
        price: where.price
      };
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
      
      if (properties.length > 0) {
        isNearMatch = true;
      }
    }

    // 5. Format Images & Response - match PropertyCard interface
    const propertiesWithImages = await Promise.all(properties.map(async (p) => {
      let image = null;
      try {
        if (p.imageUrl) {
          image = p.imageUrl.startsWith('http') ? p.imageUrl : await getSignedImageUrl(p.imageUrl);
        }
      } catch (imgError) {
        console.error('Error getting image URL:', imgError.message);
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
        image,  // PropertyCard expects 'image', not 'imageUrl'
        createdAt: p.createdAt,
        city: p.location?.city?.name || '', 
        area: p.location?.name || '',
        type: p.propertyType?.name || 'House'
      };
    }));

    res.json({ 
      properties: propertiesWithImages, 
      isNearMatch,
      message: isNearMatch 
        ? 'No exact matches found, but here are some options within your price range.' 
        : null
    });

  } catch (error) {
    console.error('Personalized properties error:', error);
    res.status(500).json({ error: 'Failed to fetch personalized properties' });
  }
});

// GET single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        location: { include: { city: true } },
        agent: true,
        propertyType: true,
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } }
      }
    });

    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Generate signed URLs for all images from PropertyImage table
    const galleryImageUrls = await Promise.all(
      property.images.map(async (img) => await getSignedImageUrl(img.imageKey))
    );
    // Filter out any null/undefined URLs
    const validGalleryImages = galleryImageUrls.filter(url => url);

    // Get main imageUrl
    const mainImageUrl = await getSignedImageUrl(property.imageUrl);
    
    // Build images array: main image first, then gallery images
    // If no main image and no gallery, return empty array
    let allImages = [];
    if (mainImageUrl) {
      allImages.push(mainImageUrl);
    }
    // Add gallery images that aren't the same as mainImageUrl
    for (const url of validGalleryImages) {
      if (url && !allImages.includes(url)) {
        allImages.push(url);
      }
    }
    // If still no images, create empty array
    if (allImages.length === 0 && (mainImageUrl || validGalleryImages.length > 0)) {
      allImages = validGalleryImages.length > 0 ? validGalleryImages : (mainImageUrl ? [mainImageUrl] : []);
    }

    // Get agent image URL if exists
    let agentImageUrl = null;
    if (property.agent?.image) {
      agentImageUrl = property.agent.image.startsWith('http') 
        ? property.agent.image 
        : await getSignedImageUrl(property.agent.image);
    }

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
      // Full agent details for contact card
      agent: property.agent?.name || '',
      agentPhone: property.agent?.phone || '',
      agentEmail: property.agent?.email || '',
      agentImage: agentImageUrl,
      agentRating: property.agent?.rating || 0,
      agentReviewCount: property.agent?.reviewCount || 0,
      type: property.propertyType?.name || 'House'
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});


// CREATE property
app.post('/api/properties', async (req, res) => {
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
app.put('/api/properties/:id', async (req, res) => {
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
app.delete('/api/properties/:id', async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// ============================================
// PROJECTS API
// ============================================

// GET all projects with property count and summary
app.get('/api/projects', async (req, res) => {
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

    // Process projects with aggregated data and signed image URLs
    const result = await Promise.all(projects.map(async (p) => {
      // Get first property image for cover if project has no image
      let coverImage = p.image;
      if (!coverImage && p.properties.length > 0 && p.properties[0].imageUrl) {
        coverImage = p.properties[0].imageUrl;
      }
      const signedCoverImage = coverImage ? await getSignedImageUrl(coverImage) : null;

      // Aggregate property data for ranges
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
app.get('/api/projects/:id', async (req, res) => {
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

    // Get signed URL for project image
    const signedProjectImage = project.image ? await getSignedImageUrl(project.image) : null;

    // Get signed URLs for all property images
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

// CREATE project (admin)
app.post('/api/admin/projects', async (req, res) => {
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
app.put('/api/admin/projects/:id', async (req, res) => {
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
app.delete('/api/admin/projects/:id', async (req, res) => {
  try {
    // First unlink all properties from this project
    await prisma.property.updateMany({
      where: { projectId: parseInt(req.params.id) },
      data: { projectId: null }
    });
    
    // Then delete the project
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
app.put('/api/admin/properties/:id/project', async (req, res) => {
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

// ============================================
// AGENTS API
// ============================================

// GET all agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { city: true, _count: { select: { properties: true } } },
      orderBy: { name: 'asc' }
    });

    // Add signed URLs for images
    const agentsWithImages = await Promise.all(agents.map(async (a) => {
      let imageUrl = a.image;
      
      // If image is a Backblaze key, get signed URL
      if (a.image && !a.image.startsWith('http')) {
        imageUrl = await getSignedImageUrl(a.image);
      }

      return {
        ...a,
        image: imageUrl,
        cityName: a.city?.name || '',
        propertyCount: a._count.properties
      };
    }));

    res.json(agentsWithImages);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET single agent with reviews and properties
app.get('/api/agents/:id', async (req, res) => {
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

    // Parse specialties JSON
    let specialties = [];
    try {
      if (agent.specialties) {
        specialties = JSON.parse(agent.specialties);
      }
    } catch (e) {
      specialties = agent.specialties ? [agent.specialties] : [];
    }

    // Get signed URL for agent image
    let agentImage = agent.image;
    if (agent.image && !agent.image.startsWith('http')) {
      agentImage = await getSignedImageUrl(agent.image);
    }

    // Get signed URLs for property images
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

// POST review for agent
app.post('/api/agents/:id/reviews', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { name, rating, text } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and review text are required' });
    }

    // Validate rating (1-5)
    const validRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    // Check if agent exists
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        agentId,
        name,
        rating: validRating,
        text
      }
    });

    // Update agent's average rating
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

    res.json({ 
      message: 'Review submitted successfully',
      review 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// CREATE agent
// CREATE agent with user account
app.post('/api/agents', async (req, res) => {
  try {
    const { 
      name, phone, email, bio, image, website, 
      experience, specialties, officeAddress, 
      officeLat, officeLng, isTopAgent, cityId,
      password, loginEmail // separate login email
    } = req.body;

    if (!loginEmail || !password) {
      return res.status(400).json({ error: 'Login email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Login email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Create User -> Create Agent linked to User
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: loginEmail,
          password: hashedPassword,
          name,
          role: 'AGENT'
        }
      });

      // 2. Create Agent linked to User
      const agent = await tx.agent.create({
        data: {
          name,
          phone,
          email: email || loginEmail, // Use contact email, default to login email
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
          userId: user.id
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
app.put('/api/agents/:id', async (req, res) => {
  try {
    const { 
      name, phone, email, bio, image, website, contactPassword,
      experience, rating, reviewCount, specialties, 
      officeAddress, officeLat, officeLng, isTopAgent, cityId 
    } = req.body;
    
    const agent = await prisma.agent.update({
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
        cityId
      }
    });
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE agent
app.delete('/api/agents/:id', async (req, res) => {
  try {
    await prisma.agent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// ============================================
// AMENITIES API
// ============================================

// Seed default amenities on first request
const defaultAmenities = [
  { name: 'Swimming Pool', icon: 'waves', category: 'Outdoor' },
  { name: 'Home Gym', icon: 'dumbbell', category: 'Indoor' },
  { name: 'Central A/C', icon: 'snowflake', category: 'Indoor' },
  { name: 'High-speed WiFi', icon: 'wifi', category: 'Technology' },
  { name: 'Solar Panels', icon: 'sun', category: 'Eco' },
  { name: 'EV Charging', icon: 'plug', category: 'Eco' },
  { name: 'Smart Security', icon: 'shield', category: 'Security' },
  { name: 'Outdoor Deck', icon: 'home', category: 'Outdoor' },
  { name: 'Fireplace', icon: 'flame', category: 'Indoor' },
  { name: 'Walk-in Closet', icon: 'shirt', category: 'Indoor' },
  { name: 'Chef Kitchen', icon: 'chef-hat', category: 'Indoor' },
  { name: 'Laundry Room', icon: 'shirt', category: 'Indoor' },
  { name: 'Garden', icon: 'flower', category: 'Outdoor' },
  { name: 'Parking Garage', icon: 'car', category: 'Outdoor' },
  { name: 'Balcony', icon: 'door-open', category: 'Outdoor' },
  { name: 'Pet Friendly', icon: 'paw-print', category: 'Other' },
  { name: 'Elevator', icon: 'arrow-up-down', category: 'Building' },
  { name: 'Concierge', icon: 'bell', category: 'Building' },
  { name: 'Rooftop Access', icon: 'building', category: 'Building' },
  { name: 'Storage Unit', icon: 'archive', category: 'Building' },
];

// GET all amenities (seeds if empty)
app.get('/api/amenities', async (req, res) => {
  try {
    let amenities = await prisma.amenity.findMany({ orderBy: { category: 'asc' } });
    
    // Seed if empty
    if (amenities.length === 0) {
      await prisma.amenity.createMany({ data: defaultAmenities });
      amenities = await prisma.amenity.findMany({ orderBy: { category: 'asc' } });
    }
    
    res.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// GET amenities for a specific property
app.get('/api/properties/:id/amenities', async (req, res) => {
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

// SET amenities for a property (admin)
app.post('/api/admin/properties/:id/amenities', async (req, res) => {
  try {
    const { amenityIds } = req.body; // Array of amenity IDs
    const propertyId = req.params.id;
    
    // Delete existing amenities for this property
    await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
    
    // Add new amenities
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

// ============================================
// AGENT DASHBOARD API
// ============================================

// GET agent dashboard stats
app.get('/api/agent/dashboard', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;
    console.log('Dashboard API - Agent ID:', agentId);

    // Get total listings
    let totalListings = 0;
    try {
      totalListings = await prisma.property.count({
        where: { agentId: agentId }
      });
      console.log('Dashboard API - Total Listings:', totalListings);
    } catch (e) {
      console.error('Error counting listings:', e.message);
    }

    // Get active deals
    let activeDeals = 0;
    try {
      activeDeals = await prisma.deal.count({
        where: { agentId: agentId, status: { in: ['PENDING', 'IN_PROGRESS'] } }
      });
    } catch (e) {
      console.error('Error counting active deals:', e.message);
    }

    // Get completed deals
    let completedDeals = 0;
    try {
      completedDeals = await prisma.deal.count({
        where: { agentId: agentId, status: 'COMPLETED' }
      });
    } catch (e) {
      console.error('Error counting completed deals:', e.message);
    }

    // Get total revenue
    let totalRevenue = 0;
    try {
      const revenueResult = await prisma.deal.aggregate({
        where: { agentId: agentId, status: 'COMPLETED' },
        _sum: { price: true }
      });
      totalRevenue = Number(revenueResult._sum.price || 0);
    } catch (e) {
      console.error('Error calculating revenue:', e.message);
    }

    // Get recent deals (simplified - no include)
    let recentDeals = [];
    try {
      const deals = await prisma.deal.findMany({
        where: { agentId: agentId },
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
    } catch (e) {
      console.error('Error fetching recent deals:', e.message);
    }

    res.json({
      totalListings,
      activeDeals,
      completedDeals,
      totalRevenue,
      recentDeals
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// GET agent reports with period filtering
app.get('/api/agent/reports', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;
    const period = req.query.period || 'all';

    // Calculate date range based on period
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
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

    // Get sales stats
    const sales = await prisma.deal.aggregate({
      where: { ...whereClause, dealType: 'SALE' },
      _count: { id: true },
      _sum: { price: true }
    });

    // Get rental stats
    const rentals = await prisma.deal.aggregate({
      where: { ...whereClause, dealType: 'RENT' },
      _count: { id: true },
      _sum: { price: true }
    });

    const salesCount = sales._count.id || 0;
    const salesRevenue = Number(sales._sum.price || 0);
    const rentalsCount = rentals._count.id || 0;
    const rentalsRevenue = Number(rentals._sum.price || 0);

    res.json({
      period,
      sales: {
        count: salesCount,
        revenue: salesRevenue
      },
      rentals: {
        count: rentalsCount,
        revenue: rentalsRevenue
      },
      totalDeals: salesCount + rentalsCount,
      totalRevenue: salesRevenue + rentalsRevenue
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ============================================
// INQUIRIES API
// ============================================

// CREATE inquiry (public - for tour requests and messages)
app.post('/api/inquiries', async (req, res) => {
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

// GET inquiries for logged-in agent
app.get('/api/agent/inquiries', authenticateToken, requireAgent, async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { agentId: req.agent.id },
      include: {
        property: {
          include: {
            location: {
              include: { city: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate signed URLs for property images
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
app.patch('/api/agent/inquiries/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { status } = req.body;
    const inquiryId = parseInt(req.params.id);

    // Verify the inquiry belongs to this agent
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

// SEND MESSAGE to agent from profile page (no property required)
app.post('/api/agents/:id/messages', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get first property of the agent (or null if none)
    const firstProperty = await prisma.property.findFirst({
      where: { agentId },
      select: { id: true }
    });

    // If agent has no properties, we can't create an inquiry (it requires propertyId)
    // So for now, we'll just return success (in production, you'd want a separate messages table)
    if (!firstProperty) {
      // Just simulate success - in real app you'd have a ContactMessage table
      return res.status(201).json({ 
        success: true, 
        message: 'Your message has been sent to the agent!' 
      });
    }

    // Create inquiry with type MESSAGE
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

    res.status(201).json({ 
      success: true, 
      message: 'Your message has been sent to the agent!' 
    });
  } catch (error) {
    console.error('Error sending message to agent:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============================================
// REVIEWS API
// ============================================

// Add review to agent
app.post('/api/agents/:id/reviews', async (req, res) => {
  try {
    const { name, rating, text } = req.body;
    const agentId = parseInt(req.params.id);

    const review = await prisma.review.create({
      data: {
        agentId,
        name,
        rating: Math.min(5, Math.max(1, rating)),
        text
      }
    });

    // Update agent's review count and average rating
    const reviews = await prisma.review.findMany({
      where: { agentId },
      select: { rating: true }
    });

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        reviewCount: reviews.length,
        rating: Math.round(avgRating * 10) / 10
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================
// CITIES API
// ============================================

// GET all cities
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: { _count: { select: { locations: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(cities.map(c => ({
      ...c,
      locationCount: c._count.locations
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// CREATE city
app.post('/api/cities', async (req, res) => {
  try {
    const { name } = req.body;
    const city = await prisma.city.create({ data: { name } });
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create city' });
  }
});

// UPDATE city
app.put('/api/cities/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const city = await prisma.city.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update city' });
  }
});

// DELETE city
app.delete('/api/cities/:id', async (req, res) => {
  try {
    await prisma.city.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'City deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// ============================================
// LOCATIONS API
// ============================================

// GET all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { city: true, _count: { select: { properties: true } } },
      orderBy: [{ city: { name: 'asc' } }, { name: 'asc' }]
    });
    res.json(locations.map(l => ({
      ...l,
      cityName: l.city.name,
      propertyCount: l._count.properties
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// CREATE location
app.post('/api/locations', async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const location = await prisma.location.create({
      data: { name, cityId }
    });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// UPDATE location
app.put('/api/locations/:id', async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const location = await prisma.location.update({
      where: { id: parseInt(req.params.id) },
      data: { name, cityId }
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE location
app.delete('/api/locations/:id', async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// ============================================
// PROPERTY TYPES API
// ============================================

// GET all property types
app.get('/api/property-types', async (req, res) => {
  try {
    const types = await prisma.propertyType.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(types.map(t => ({
      ...t,
      propertyCount: t._count.properties
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property types' });
  }
});

// ============================================
// DASHBOARD STATS
// ============================================

app.get('/api/admin/stats', async (req, res) => {
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

// ============================================
// ANALYTICS API
// ============================================

// Record page view
app.post('/api/analytics/pageview', async (req, res) => {
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
app.get('/api/analytics/stats', async (req, res) => {
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

// ============================================
// AGENT DASHBOARD API
// ============================================

// GET agent dashboard stats
app.get('/api/agent/dashboard', authenticateToken, requireAgent, async (req, res) => {
  try {
    const agentId = req.agent.id;

    // Get counts
    const [totalListings, activeDeals, completedDeals, totalRevenue] = await Promise.all([
      prisma.property.count({ where: { agentId } }),
      prisma.deal.count({ where: { agentId, status: 'PENDING' } }),
      prisma.deal.count({ where: { agentId, status: 'COMPLETED' } }),
      prisma.deal.aggregate({
        where: { agentId, status: 'COMPLETED' },
        _sum: { price: true }
      })
    ]);

    // Recent deals
    const recentDeals = await prisma.deal.findMany({
      where: { agentId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      totalListings,
      activeDeals,
      completedDeals,
      totalRevenue: totalRevenue._sum.price || 0,
      recentDeals: recentDeals.map(d => ({
        id: d.id,
        propertyTitle: d.property.title,
        clientName: d.clientName,
        dealType: d.dealType,
        price: Number(d.price),
        status: d.status,
        createdAt: d.createdAt
      }))
    });
  } catch (error) {
    console.error('Agent dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET agent's properties
app.get('/api/agent/properties', authenticateToken, requireAgent, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { agentId: req.agent.id },
      include: {
        location: { include: { city: true } },
        propertyType: true,
        _count: { select: { deals: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = await Promise.all(properties.map(async (p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      purpose: p.purpose,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.areaSqm,
      image: await getSignedImageUrl(p.imageUrl),
      imageKey: p.imageUrl,  // Added: key for edit form
      locationId: p.locationId,  // Added: for edit form
      propertyTypeId: p.propertyTypeId,  // Added: for edit form
      area: p.location?.name || '',
      city: p.location?.city?.name || '',
      type: p.propertyType?.name || 'House',
      dealCount: p._count.deals,
      createdAt: p.createdAt
    })));

    res.json(result);
  } catch (error) {
    console.error('Agent properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// POST - Agent creates a property
app.post('/api/agent/properties', authenticateToken, requireAgent, async (req, res) => {
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
    // Log error to file for debugging
    const fs = require('fs');
    fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Agent Create Error: ${JSON.stringify(error.message)}\n${JSON.stringify(error)}\n`);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT - Agent updates their property
app.put('/api/agent/properties/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    console.log('------ AGENT UPDATE PROPERTY ------');
    console.log('Property ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Verify ownership
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to edit this property' });
    }

    const { title, price, purpose, areaSqm, bedrooms, bathrooms, 
            hasGarage, hasBalcony, imageUrl, locationId, propertyTypeId, description, shortDescription } = req.body;

    console.log('Parsed title:', title);
    console.log('Parsed imageUrl:', imageUrl);

    // Build update data - only include imageUrl if explicitly provided
    const updateData = {
      title: title || existing.title,  // Preserve existing title if not provided
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

    // Only update imageUrl if it's truthy (not null/undefined/empty string)
    // This preserves existing image when user doesn't upload new ones
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: updateData
    });

    console.log('Updated property:', property.title);
    console.log('------ END UPDATE ------');

    res.json(property);
  } catch (error) {
    console.error('Agent update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE - Agent deletes their property
app.delete('/api/agent/properties/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    // Verify ownership
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

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
app.post('/api/agent/properties/:id/images', authenticateToken, requireAgent, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { images } = req.body; // Array of { key, sortOrder }

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (images && images.length > 0) {
      await prisma.propertyImage.createMany({
        data: images.map(img => ({
          propertyId,
          imageKey: img.key,  // Fixed: field is 'imageKey' in Prisma schema
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
app.delete('/api/agent/property-images/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);

    // Get image to check property ownership
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true }
    });

    if (!image || image.property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete from DB
    await prisma.propertyImage.delete({ where: { id: imageId } });

    // Note: We don't delete from Backblaze here to be safe/simple, or we could.
    // Admin version didn't seem to delete from Backblaze either in the code I saw.

    res.json({ success: true });
  } catch (error) {
    console.error('Agent delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// POST - Agent sets amenities
app.post('/api/agent/properties/:id/amenities', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { amenityIds } = req.body;
    const propertyId = req.params.id;

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Delete existing amenities for this property
    await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
    
    // Add new amenities
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
// AGENT DEALS API
// ============================================

// GET agent's deals
app.get('/api/agent/deals', authenticateToken, requireAgent, async (req, res) => {
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
app.post('/api/agent/deals', authenticateToken, requireAgent, async (req, res) => {
  try {
    const { propertyId, clientName, clientPhone, clientEmail, dealType, price, notes } = req.body;

    // Verify agent owns this property
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
app.put('/api/agent/deals/:id', authenticateToken, requireAgent, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    const { status, notes } = req.body;

    // Verify ownership
    const existing = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!existing || existing.agentId !== req.agent.id) {
      return res.status(403).json({ error: 'Not authorized to edit this deal' });
    }

    const updateData = { notes };
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
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
app.delete('/api/agent/deals/:id', authenticateToken, requireAgent, async (req, res) => {
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

// GET agent's own profile
app.get('/api/agent/profile', authenticateToken, requireAgent, async (req, res) => {
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
      cityName: agent.city?.name || ''
    });
  } catch (error) {
    console.error('Agent profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT - Update agent's own profile
app.put('/api/agent/profile', authenticateToken, requireAgent, async (req, res) => {
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

    res.json(agent);
  } catch (error) {
    console.error('Update agent profile error:', error);
    // Log error to file
    const fs = require('fs');
    fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Agent Profile Update Error: ${JSON.stringify(error.message)}\n${JSON.stringify(error)}\n`);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// GET agent's own reviews
app.get('/api/agent/reviews', authenticateToken, requireAgent, async (req, res) => {
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

// ============================================
// LANGUAGES API
// ============================================

// GET all languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});
// ============================================
// USER PREFERENCES API
// ============================================

// GET user preferences
app.get('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.user.id },
      include: { city: true }
    });
    res.json(preference);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// POST/Update user preferences
app.post('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const { purpose, cityId, propertyType, propertyStyle, minPrice, maxPrice } = req.body;

    const preference = await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      update: {
        purpose,
        cityId: cityId ? parseInt(cityId) : null,
        propertyType,
        propertyStyle,
        minPrice: parseFloat(minPrice) || 0,
        maxPrice: parseFloat(maxPrice) || 10000000
      },
      create: {
        userId: req.user.id,
        purpose,
        cityId: cityId ? parseInt(cityId) : null,
        propertyType,
        propertyStyle,
        minPrice: parseFloat(minPrice) || 0,
        maxPrice: parseFloat(maxPrice) || 10000000
      }
    });

    res.json(preference);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});



// ============================================
// WEBSITE REVIEWS API
// ============================================

// GET all website reviews
app.get('/api/website-reviews', async (req, res) => {
  try {
    const reviews = await prisma.websiteReview.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching website reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST new website review
app.post('/api/website-reviews', authenticateToken, async (req, res) => {
  try {
    const { name, role, rating, text } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const review = await prisma.websiteReview.create({
      data: {
        name,
        role: role || 'User',
        rating: parseInt(rating) || 5,
        text
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error creating website review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});



// Start server

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
  console.log(`📍 Properties API: http://localhost:${PORT}/api/properties`);
  console.log(`🔧 Admin Stats: http://localhost:${PORT}/api/admin/stats`);
});
