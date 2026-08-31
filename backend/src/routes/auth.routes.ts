
import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({ error: 'Số điện thoại hoặc Email là bắt buộc' });
    }
    const result = await AuthService.login(phoneOrEmail, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const result = await AuthService.getCurrentUser(userId);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const updated = await AuthService.updateProfile(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
