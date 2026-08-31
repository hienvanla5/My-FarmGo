
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/storage.js';
import { BatchService } from '../src/services/batch.service.js';
import { VaccineService } from '../src/services/vaccine.service.js';
import { FeedService } from '../src/services/feed.service.js';
import { FinanceService } from '../src/services/finance.service.js';
import { HealthService } from '../src/services/health.service.js';
import { AiService } from '../src/services/ai.service.js';
import { SubscriptionService } from '../src/services/subscription.service.js';

describe('FarmGo Backend Services Unit & Integration Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  describe('Module 1: Batch Management & Metrics', () => {
    it('should list existing batches with computed metrics', async () => {
      const batches = await BatchService.listBatches();
      expect(batches.length).toBeGreaterThanOrEqual(3);

      const batch1 = batches.find(b => b.id === 'batch_ri_lai_01');
      expect(batch1).toBeDefined();
      expect(batch1?.survivalRate).toBeGreaterThan(90);
      expect(batch1?.ageInDays).toBeGreaterThan(0);
      expect(batch1?.currentFCR).toBeDefined();
    });

    it('should create a new batch and auto-generate standard vaccine schedule', async () => {
      const newBatch = await BatchService.createBatch('usr_farmer_01', {
        farmId: 'farm_01',
        name: 'Lứa Test Tự Động Vaccine',
        breedId: 'ga_ri_lai',
        initialQuantity: 500,
        startDate: new Date().toISOString().split('T')[0],
        supplierName: 'Trại giống Ba Vì',
        unitPricePerChic: 15000
      });

      expect(newBatch.id).toBeDefined();
      expect(newBatch.initialQuantity).toBe(500);

      // Check vaccine schedules generated
      const schedules = await VaccineService.getBatchSchedules(newBatch.id);
      expect(schedules.length).toBeGreaterThan(8);
      expect(schedules.some(s => s.vaccineName.includes('Newcastle'))).toBe(true);
      expect(schedules.some(s => s.vaccineName.includes('Gumboro'))).toBe(true);
      expect(schedules.some(s => s.vaccineName.includes('Đậu'))).toBe(true);

      // Check expense transaction auto-recorded
      const txs = await FinanceService.getTransactions({ batchId: newBatch.id });
      expect(txs.some(t => t.category === 'chicks' && t.amount === 500 * 15000)).toBe(true);
    });
  });

  describe('Module 2: Vaccine Reminders & Tracking', () => {
    it('should mark a vaccine as completed and record expense', async () => {
      const schedules = await VaccineService.getBatchSchedules('batch_ri_lai_01');
      const target = schedules.find(s => s.status !== 'completed');
      expect(target).toBeDefined();

      if (target) {
        const updated = await VaccineService.updateSchedule(target.id, {
          status: 'completed',
          actualDate: new Date().toISOString().split('T')[0],
          cost: 150000,
          notes: 'Đã tiêm đủ cho đàn'
        });

        expect(updated?.status).toBe('completed');
        expect(updated?.cost).toBe(150000);
      }
    });

    it('should return due and overdue alerts across batches', async () => {
      const alerts = await VaccineService.getDueAlerts('farm_01');
      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts.dueToday)).toBe(true);
      expect(Array.isArray(alerts.dueSoon)).toBe(true);
    });
  });

  describe('Module 3: Feed Management & FCR Analysis', () => {
    it('should record feed purchase and update inventory', async () => {
      const purchase = await FeedService.createPurchase({
        farmId: 'farm_01',
        batchId: 'batch_ri_lai_01',
        feedType: 'grower',
        brandName: 'Cám C.P 102',
        bagCount: 10,
        kgPerBag: 25,
        unitPricePerKg: 14000,
        supplier: 'Đại lý Hòa Phát',
        purchaseDate: new Date().toISOString().split('T')[0]
      });

      expect(purchase.totalKg).toBe(250);
      expect(purchase.totalPrice).toBe(3500000);

      const inventory = await FeedService.getInventory('farm_01');
      expect(inventory.feedTypes.grower.purchasedKg).toBeGreaterThan(0);
    });

    it('should calculate FCR and return intelligent recommendations', async () => {
      const fcr = await FeedService.getFcrAnalysis('batch_ri_lai_01');
      expect(fcr.currentFCR).toBeGreaterThan(0);
      expect(fcr.targetFCR).toBeGreaterThan(0);
      expect(['optimal', 'normal', 'warning_high']).toContain(fcr.status);
      expect(fcr.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Module 4: Finance Management & P&L', () => {
    it('should compute financial summary with categories and profit margins', async () => {
      const summary = await FinanceService.getFinancialSummary({ farmId: 'farm_01' });
      expect(summary.totalIncome).toBeGreaterThan(0);
      expect(summary.totalExpense).toBeGreaterThan(0);
      expect(summary.netProfit).toBeDefined();
      expect(summary.expenseByCategory.length).toBeGreaterThan(0);
      expect(summary.incomeByCategory.length).toBeGreaterThan(0);
    });
  });

  describe('Module 5: Health & Drug Withdrawal Tracking', () => {
    it('should record sickness/mortality and calculate safe drug withdrawal date', async () => {
      const record = await HealthService.createRecord('batch_ri_lai_01', {
        date: new Date().toISOString().split('T')[0],
        deathsCount: 2,
        symptoms: ['Khò khè ban đêm'],
        medicationsUsed: ['Doxycycline 50%'],
        withdrawalDays: 7,
        treatmentNotes: 'Pha nước uống 1g/2L'
      });

      expect(record.deathsCount).toBe(2);
      expect(record.withdrawalDays).toBe(7);
      expect(record.withdrawalEndDate).toBeDefined();

      const alerts = await HealthService.getWithdrawalAlerts('farm_01');
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.batchId === 'batch_ri_lai_01')).toBe(true);
    });
  });

  describe('Module 6: AI Poultry Advisor & Predictions', () => {
    it('should answer poultry questions with practical advice', async () => {
      const res = await AiService.chat('Gà bị đi ngoài phân sáp máu tươi xử lý thế nào?');
      expect(res.reply).toContain('Cầu Trùng');
      expect(res.reply).toContain('Toltrazuril');

      const harvest = await AiService.predictOptimalHarvest('batch_ri_lai_01');
      expect(harvest.daysToHarvest).toBeGreaterThan(0);
      expect(harvest.estimatedRevenue).toBeGreaterThan(0);
    });
  });

  describe('SaaS Subscription & VietQR Checkout', () => {
    it('should generate VietQR checkout details for plans', async () => {
      const checkout = await SubscriptionService.createCheckout('usr_farmer_01', 'pro', 'vietqr');
      expect(checkout.amount).toBe(99000);
      expect(checkout.vietQrUrl).toContain('vietqr.io');
      expect(checkout.transferContent).toContain('FARMGO_');

      const confirmed = await SubscriptionService.confirmPayment('usr_farmer_01', 'pro', 'vietqr');
      expect(confirmed.status).toBe('active');
      expect(confirmed.plan).toBe('pro');
    });
  });
});
