import dotenv from 'dotenv';

dotenv.config();

export function authenticateApiKey(req, res, next) {
  const apiKey = req.header('X-API-Key');

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }

  next();
}
