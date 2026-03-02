// On Vercel: frontend and API share the same domain, so /api/* is same-origin (no absolute URL needed).
// Locally: falls back to localhost:5001.
export const API_URL = import.meta.env.VITE_API_URL ?? "";