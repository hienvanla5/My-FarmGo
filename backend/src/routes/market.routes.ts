import { Router, Request, Response } from 'express';
import { MarketService } from '../services/market.service.js';

export const marketRouter = Router();

marketRouter.get('/prices', (req: Request, res: Response) => {
  const prices = MarketService.getMarketPrices();
  res.json({ success: true, data: prices });
});

marketRouter.get('/breeds', (req: Request, res: Response) => {
  const breeds = MarketService.getChickenBreeds();
  res.json({ success: true, data: breeds });
});

marketRouter.get('/weather-alerts', (req: Request, res: Response) => {
  const province = (req.query.province as string) || 'Hà Nội';
  const alerts = MarketService.getWeatherAndFarmingAlerts(province);
  res.json({ success: true, data: alerts });
});
