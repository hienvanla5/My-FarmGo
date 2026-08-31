import { Router, Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const subscriptionRouter = Router();

subscriptionRouter.use(authMiddleware);

subscriptionRouter.get('/plans', (req: Request, res: Response) => {
  const plans = SubscriptionService.getPlans();
  res.json({ success: true, data: plans });
});

subscriptionRouter.get('/current', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const sub = await SubscriptionService.getCurrentSubscription(userId);
    res.json({ success: true, data: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

subscriptionRouter.post('/checkout', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const { planId, paymentMethod } = req.body;
    const checkout = await SubscriptionService.createCheckout(userId, planId, paymentMethod || 'vietqr');
    res.json({ success: true, data: checkout });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

subscriptionRouter.post('/confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_farmer_01';
    const { planId, paymentMethod, transactionId } = req.body;
    const sub = await SubscriptionService.confirmPayment(userId, planId, paymentMethod, transactionId);
    res.json({ success: true, data: sub, message: 'Nâng cấp gói SaaS thành công!' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
