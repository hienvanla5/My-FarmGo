import { Router, Request, Response } from 'express';
import { AiService } from '../services/ai.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, batchId, farmId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const response = await AiService.chat(message, { batchId, farmId });
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

aiRouter.get('/optimal-harvest/:batchId', async (req: Request, res: Response) => {
  try {
    const result = await AiService.predictOptimalHarvest(req.params.batchId as string);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

aiRouter.post('/diagnose', async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array is required' });
    }
    const result = await AiService.diagnoseDisease(symptoms);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
