
import { Router } from 'express';
import { FarmService } from '../services/farm.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const farmRouter = Router();

farmRouter.use(authMiddleware);

farmRouter.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const list = await FarmService.listFarms(userId);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

farmRouter.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const farm = await FarmService.createFarm(userId, req.body);
    res.status(201).json({ success: true, data: farm });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

farmRouter.put('/:id', async (req, res) => {
  try {
    const updated = await FarmService.updateFarm(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

farmRouter.post('/:id/set-default', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    await FarmService.setDefaultFarm(userId, req.params.id as string);
    res.json({ success: true, message: 'Đã đặt trang trại mặc định' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
