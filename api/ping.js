// Minimal diagnostic function - no imports, no Express, no Prisma
export default function handler(req, res) {
    res.status(200).json({
        status: 'ok',
        node: process.version,
        env: {
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
            NODE_ENV: process.env.NODE_ENV || 'not set',
        }
    });
}
