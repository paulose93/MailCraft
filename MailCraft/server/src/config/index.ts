import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  email: {
    user: process.env.GMAIL_USER || '',
    password: process.env.GMAIL_APP_PASSWORD || '',
  },

  clientUrl: process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173',

  // All allowed CORS origins. CLIENT_URL may be a comma-separated list.
  // Defaults cover local dev plus this host's public IP over http/https.
  clientUrls: (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat([
      'http://localhost:5173',
      'http://localhost:3000',
      'http://13.203.173.124',
      'https://13.203.173.124',
      'http://mailcraft.qd.je',
      'https://mailcraft.qd.je',
    ])
    .filter((v, i, a) => a.indexOf(v) === i),

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@newsletterai.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
};
