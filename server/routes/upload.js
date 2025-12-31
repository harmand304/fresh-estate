import express from 'express';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, B2_BUCKET_NAME, upload } from '../config/db.js';
import { getSignedImageUrl } from '../utils/imageUtils.js';

const router = express.Router();

// Upload single image to Backblaze B2
router.post('/', upload.single('image'), async (req, res) => {
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
      Bucket: B2_BUCKET_NAME,
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
router.post('/multiple', upload.array('images', 10), async (req, res) => {
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
        Bucket: B2_BUCKET_NAME,
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

export default router;
