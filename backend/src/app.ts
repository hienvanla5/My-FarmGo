import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { farmRouter } from './routes/farm.routes.js';
import { batchRouter } from './routes/batch.routes.js';
import { vaccineRouter } from './routes/vaccine.routes.js';
import { feedRouter } from './routes/feed.routes.js';
import { financeRouter } from './routes/finance.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';
import { marketRouter } from './routes/market.routes.js';
import { db } from './db/storage.js';
import { isPostgresConfigured, pingPostgres } from './db/postgres.js';

export const app = express();

// CORS Configuration
const corsOriginEnv = process.env.CORS_ORIGIN || '*';
const allowedOrigins = corsOriginEnv.includes(',') 
  ? corsOriginEnv.split(',').map(o => o.trim()) 
  : corsOriginEnv;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (typeof allowedOrigins === 'string' && (allowedOrigins === origin || allowedOrigins === '*')) {
      return callback(null, true);
    }
    // Allow local development and Vercel/Netlify preview deployments
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for SaaS API
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Root welcome & status
app.get('/', (req, res) => {
  res.json({
    name: 'FarmGo SaaS Production API',
    version: '1.0.0',
    description: 'Nền tảng Quản lý trại gà hộ nông sản Việt Nam',
    status: 'online',
    docs: '/api/v1',
    health: '/api/health'
  });
});

// Comprehensive Healthcheck for Render/Fly/Railway & UptimeRobot
app.get('/api/health', async (req, res) => {
  const dbConfigured = isPostgresConfigured();
  let dbStatus = 'file-json';
  let dbLatencyMs: number | undefined = undefined;

  if (dbConfigured) {
    const pgPing = await pingPostgres();
    dbStatus = pgPing.connected ? 'postgresql-connected' : 'postgresql-error';
    dbLatencyMs = pgPing.latencyMs;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      driver: dbStatus,
      isPostgres: dbConfigured,
      latencyMs: dbLatencyMs
    },
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database reset endpoint for testing/demo
app.post('/api/v1/system/reset-demo', (req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu mẫu chuẩn của trại gà' });
});

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/farms', farmRouter);
app.use('/api/v1/batches', batchRouter);
app.use('/api/v1/vaccines', vaccineRouter);
app.use('/api/v1/feeds', feedRouter);
app.use('/api/v1/finances', financeRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/market', marketRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
