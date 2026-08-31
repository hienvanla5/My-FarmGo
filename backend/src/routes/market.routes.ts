
import { Router } from 'express';
import { MarketService } from '../services/market.service.js';

export const marketRouter = Router();

marketRouter.get('/prices', (req, res) => {
  const prices = MarketService.getMarketPrices();
  res.json({ success: true, data: prices });
});

marketRouter.get('/breeds', (req, res) => {
  const breeds = MarketService.getChickenBreeds();
  res.json({ success: true, data: breeds });
});

marketRouter.get('/weather-alerts', (req, res) => {
  const province = (req.query.province as string) || 'Hà Nội';
  const alerts = MarketService.getWeatherAndFarmingAlerts(province);
  res.json({ success: true, data: alerts });
});
