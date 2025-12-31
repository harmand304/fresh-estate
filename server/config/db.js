import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';

// Prisma client singleton
export const prisma = new PrismaClient();

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET || 'mood-real-estate-secret-key-2024';

// Server port
export const PORT = 3001;

// Multer setup for memory storage
export const upload = multer({ storage: multer.memoryStorage() });

// Backblaze B2 S3 Client
export const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

// B2 Bucket name
export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
