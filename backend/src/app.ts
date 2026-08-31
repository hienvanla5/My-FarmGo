
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

export const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'FarmGo SaaS API' });
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
