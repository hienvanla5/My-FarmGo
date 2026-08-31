import { Router, Request, Response } from 'express';
import { BatchService } from '../services/batch.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const batchRouter = Router();

batchRouter.use(authMiddleware);

batchRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmId = req.query.farmId as string;
    const status = req.query.status as string;
    const batches = await BatchService.listBatches(farmId, status);
    res.json({ success: true, data: batches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

batchRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const batch = await BatchService.getBatchById(req.params.id as string);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

batchRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const newBatch = await BatchService.createBatch(userId, req.body);
    res.status(201).json({ success: true, data: newBatch });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

batchRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await BatchService.updateBatch(req.params.id as string, req.body);
    if (!updated) return res.status(404).json({ error: 'Batch not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

batchRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await BatchService.deleteBatch(req.params.id as string);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

batchRouter.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const events = await BatchService.getEvents(req.params.id as string);
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

batchRouter.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const event = await BatchService.addEvent(req.params.id as string, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
