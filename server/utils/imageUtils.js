import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, B2_BUCKET_NAME } from '../config/db.js';

/**
 * Generate a signed URL for private images stored in Backblaze B2
 * @param {string} key - The image key/path in B2
 * @returns {Promise<string|null>} Signed URL or null if no key
 */
export async function getSignedImageUrl(key) {
  if (!key) return null;
  
  // If it's already a full URL (for existing images), return as-is
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
    return key;
  }
  
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });
  
  // Generate signed URL valid for 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
