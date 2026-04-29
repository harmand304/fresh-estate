// Standalone diagnostic endpoint to debug registration
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(200).json({ 
      info: 'POST a JSON body with { email, password, name } to test registration',
      node: process.version,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'MISSING',
        DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      }
    });
  }

  const steps = [];
  
  try {
    steps.push('1. Parsing request body');
    const { email, password, name } = req.body || {};
    steps.push(`2. Got email=${email}, password=${password ? '***' : 'missing'}, name=${name}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required', steps });
    }

    steps.push('3. Testing Prisma connection...');
    await prisma.$connect();
    steps.push('4. Prisma connected successfully');

    steps.push('5. Checking if user exists...');
    const existing = await prisma.user.findUnique({ where: { email } });
    steps.push(`6. User exists check: ${existing ? 'YES' : 'NO'}`);

    if (existing) {
      return res.status(400).json({ error: 'Email already registered', steps });
    }

    steps.push('7. Hashing password with bcrypt...');
    const hashed = await bcrypt.hash(password, 10);
    steps.push(`8. Password hashed successfully (length: ${hashed.length})`);

    steps.push('9. Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
        role: 'USER'
      }
    });
    steps.push(`10. User created! ID: ${user.id}`);

    // Clean up test user
    steps.push('11. Cleaning up test user...');
    await prisma.user.delete({ where: { id: user.id } });
    steps.push('12. Test user deleted');

    return res.status(200).json({ 
      success: true, 
      message: 'Registration flow works correctly!',
      steps 
    });

  } catch (error) {
    steps.push(`ERROR: ${error.message}`);
    steps.push(`ERROR CODE: ${error.code || 'N/A'}`);
    steps.push(`ERROR NAME: ${error.name || 'N/A'}`);
    return res.status(500).json({ 
      error: error.message,
      code: error.code,
      name: error.name,
      meta: error.meta || null,
      steps 
    });
  } finally {
    await prisma.$disconnect();
  }
}
