
import { Router } from 'express';
import { HealthService } from '../services/health.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const healthRouter = Router();

healthRouter.use(authMiddleware);

healthRouter.get('/disease-guide', (req, res) => {
  const guide = HealthService.getDiseaseGuide();
  res.json({ success: true, data: guide });
});

healthRouter.get('/records/:batchId', async (req, res) => {
  try {
    const records = await HealthService.getRecords(req.params.batchId);
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

healthRouter.post('/records/:batchId', async (req, res) => {
  try {
    const record = await HealthService.createRecord(req.params.batchId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

healthRouter.post('/records/:id/resolve', async (req, res) => {
  try {
    const record = await HealthService.resolveRecord(req.params.id);
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

healthRouter.get('/withdrawal-alerts', async (req, res) => {
  try {
    const farmId = req.query.farmId as string;
    const alerts = await HealthService.getWithdrawalAlerts(farmId);
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
