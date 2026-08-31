
import { Router } from 'express';
import { VaccineService } from '../services/vaccine.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const vaccineRouter = Router();

vaccineRouter.use(authMiddleware);

vaccineRouter.get('/library', (req, res) => {
  const library = VaccineService.getStandardLibrary();
  res.json({ success: true, data: library });
});

vaccineRouter.get('/due-alerts', async (req: AuthenticatedRequest, res) => {
  try {
    const farmId = req.query.farmId as string;
    const alerts = await VaccineService.getDueAlerts(farmId);
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

vaccineRouter.get('/batch/:batchId', async (req, res) => {
  try {
    const schedules = await VaccineService.getBatchSchedules(req.params.batchId);
    res.json({ success: true, data: schedules });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

vaccineRouter.put('/schedule/:id', async (req, res) => {
  try {
    const updated = await VaccineService.updateSchedule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

vaccineRouter.post('/batch/:batchId/custom', async (req, res) => {
  try {
    const created = await VaccineService.addCustomSchedule(req.params.batchId, req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

vaccineRouter.delete('/schedule/:id', async (req, res) => {
  try {
    const deleted = await VaccineService.deleteSchedule(req.params.id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
