import { Router, Request, Response } from 'express';
import { FeedService } from '../services/feed.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const feedRouter = Router();

feedRouter.use(authMiddleware);

feedRouter.get('/purchases', async (req: Request, res: Response) => {
  try {
    const farmId = req.query.farmId as string;
    const batchId = req.query.batchId as string;
    const purchases = await FeedService.getPurchases(farmId, batchId);
    res.json({ success: true, data: purchases });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

feedRouter.post('/purchases', async (req: Request, res: Response) => {
  try {
    const purchase = await FeedService.createPurchase(req.body);
    res.status(201).json({ success: true, data: purchase });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

feedRouter.get('/consumption/:batchId', async (req: Request, res: Response) => {
  try {
    const consumptions = await FeedService.getConsumptions(req.params.batchId as string);
    res.json({ success: true, data: consumptions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

feedRouter.post('/consumption/:batchId', async (req: Request, res: Response) => {
  try {
    const log = await FeedService.logConsumption(req.params.batchId as string, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

feedRouter.get('/inventory/:farmId', async (req: Request, res: Response) => {
  try {
    const inventory = await FeedService.getInventory(req.params.farmId as string);
    res.json({ success: true, data: inventory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

feedRouter.get('/fcr-analysis/:batchId', async (req: Request, res: Response) => {
  try {
    const analysis = await FeedService.getFcrAnalysis(req.params.batchId as string);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
