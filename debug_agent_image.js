
import { PrismaClient } from '@prisma/client';
import { getSignedImageUrl } from './server/utils/imageUtils.js';

const prisma = new PrismaClient();

async function main() {
  const agent = await prisma.agent.findFirst({
    where: { name: { contains: 'mohamad' } }
  });

  if (!agent) {
    console.log('Agent not found');
    return;
  }

  console.log('Agent found:', agent.name);
  console.log('Image value in DB:', agent.image);

  if (agent.image) {
    if (agent.image.startsWith('http')) {
      console.log('Image is a direct URL');
    } else {
      console.log('Image is a key, generating signed URL...');
      try {
        // We need to mock the S3 client setup since we are running this standalone script
        // and standard imports might depend on .env which might not be loaded if not using 'dotenv/config'
        // But let's try importing the utility which relies on db.js which loads dotenv.
        const url = await getSignedImageUrl(agent.image);
        console.log('Generated Signed URL:', url);
      } catch (error) {
        console.error('Error generating signed URL:', error);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
