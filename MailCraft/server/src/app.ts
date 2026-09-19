import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import orgRoutes from './modules/organizations/org.routes';
import subscriberRoutes from './modules/subscribers/subscriber.routes';
import campaignRoutes from './modules/campaigns/campaign.routes';
import templateRoutes from './modules/templates/template.routes';
import aiRoutes from './modules/ai/ai.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import brandKitRoutes from './modules/brandkit/brandkit.routes';
import settingsRoutes from './modules/settings/settings.routes';
import uploadRoutes from './modules/upload/upload.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
}));

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────
app.use(generalLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/brand-kit', brandKitRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

export default app;
