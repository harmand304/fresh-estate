// Vercel Serverless Function entry point
// This imports the Express app and exports it as the default handler.
// Vercel will invoke this for all /api/* requests.
import app from '../server/index.js';

export default app;
