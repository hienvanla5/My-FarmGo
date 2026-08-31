import { Router, Request, Response } from 'express';
import { FinanceService } from '../services/finance.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const financeRouter = Router();

financeRouter.use(authMiddleware);

financeRouter.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { farmId, batchId, type, category, startDate, endDate } = req.query;
    const transactions = await FinanceService.getTransactions({
      farmId: farmId as string,
      batchId: batchId as string,
      type: type as any,
      category: category as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    res.json({ success: true, data: transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

financeRouter.post('/transactions', async (req: Request, res: Response) => {
  try {
    const tx = await FinanceService.createTransaction(req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

financeRouter.put('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const updated = await FinanceService.updateTransaction(req.params.id as string, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

financeRouter.delete('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await FinanceService.deleteTransaction(req.params.id as string);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

financeRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const { farmId, batchId, startDate, endDate } = req.query;
    const summary = await FinanceService.getFinancialSummary({
      farmId: farmId as string,
      batchId: batchId as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
