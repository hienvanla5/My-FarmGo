
import { 
  Batch, 
  BatchEvent, 
  BatchVaccineSchedule, 
  Transaction,
  STANDARD_VACCINE_LIBRARY, 
  VIETNAMESE_CHICKEN_BREEDS,
  SUBSCRIPTION_PLANS
} from 'farmgo-shared';
import { db } from '../db/storage.js';

export class BatchService {
  static computeBatchMetrics(batch: Batch): Batch {
    const data = db.getData();
    
    // Age in days
    const start = new Date(batch.startDate).getTime();
    const end = batch.actualHarvestDate ? new Date(batch.actualHarvestDate).getTime() : Date.now();
    const diffDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
    const ageInDays = diffDays;

    // Mortality & Survival
    const healthRecords = data.healthRecords.filter(h => h.batchId === batch.id);
    const recordedDeaths = healthRecords.reduce((sum, h) => sum + (h.deathsCount || 0) + (h.cullsCount || 0), 0);
    const totalDeaths = Math.max(recordedDeaths, batch.initialQuantity - batch.currentQuantity);
    const survivalRate = Number(((batch.currentQuantity / batch.initialQuantity) * 100).toFixed(1));

    // Feed consumed
    const feedRecords = data.feedConsumptions.filter(f => f.batchId === batch.id);
    const totalFeedConsumedKg = feedRecords.reduce((sum, f) => sum + f.quantityKg, 0);

    // Weight gain & FCR
    const initialWeightKg = ((batch.initialWeightGrams || 40) * batch.initialQuantity) / 1000;
    const currentWeightKg = ((batch.currentAvgWeightGrams || 500) * batch.currentQuantity) / 1000;
    const weightGainKg = Math.max(1, currentWeightKg - initialWeightKg);
    const currentFCR = totalFeedConsumedKg > 0 ? Number((totalFeedConsumedKg / weightGainKg).toFixed(2)) : undefined;

    // Financials
    const batchTransactions = data.transactions.filter(t => t.batchId === batch.id);
    const totalExpense = batchTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalRevenue = batchTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpense;

    return {
      ...batch,
      ageInDays,
      survivalRate,
      totalDeaths,
      totalFeedConsumedKg,
      currentFCR,
      totalExpense,
      totalRevenue,
      netProfit
    };
  }

  static async listBatches(farmId?: string, status?: string): Promise<Batch[]> {
    const data = db.getData();
    let list = data.batches;

    if (farmId) {
      list = list.filter(b => b.farmId === farmId);
    }

    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }

    return list.map(b => this.computeBatchMetrics(b));
  }

  static async getBatchById(id: string): Promise<Batch | null> {
    const data = db.getData();
    const batch = data.batches.find(b => b.id === id);
    if (!batch) return null;
    return this.computeBatchMetrics(batch);
  }

  static async createBatch(userId: string, input: {
    farmId: string;
    name: string;
    breedId: string;
    initialQuantity: number;
    startDate: string;
    expectedHarvestDate?: string;
    initialWeightGrams?: number;
    supplierName?: string;
    supplierPhone?: string;
    unitPricePerChic?: number;
    notes?: string;
  }): Promise<Batch> {
    const data = db.getData();

    // Check user subscription limit
    const user = data.users.find(u => u.id === userId);
    const planType = user?.currentPlan || 'free';
    const planConfig = SUBSCRIPTION_PLANS.find(p => p.id === planType) || SUBSCRIPTION_PLANS[0];

    const activeBatchesCount = data.batches.filter(b => b.farmId === input.farmId && b.status === 'active').length;
    if (activeBatchesCount >= planConfig.maxActiveBatches) {
      throw new Error(`Gói hiện tại (${planConfig.name}) chỉ cho phép tối đa ${planConfig.maxActiveBatches} lứa nuôi đang chạy. Vui lòng nâng cấp gói để thêm lứa mới!`);
    }

    // Find breed info
    const breed = VIETNAMESE_CHICKEN_BREEDS.find(b => b.id === input.breedId) || VIETNAMESE_CHICKEN_BREEDS[0];
    const growthDays = breed.standardGrowthDays || 105;

    const startDate = input.startDate || new Date().toISOString().split('T')[0];
    const expectedHarvestDate = input.expectedHarvestDate || new Date(new Date(startDate).getTime() + growthDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBatch: Batch = {
      id: newBatchId,
      farmId: input.farmId,
      name: input.name || `Lứa ${breed.name} #${activeBatchesCount + 1}`,
      breedId: breed.id,
      breedName: breed.name,
      initialQuantity: input.initialQuantity,
      currentQuantity: input.initialQuantity,
      startDate,
      expectedHarvestDate,
      initialWeightGrams: input.initialWeightGrams || 40,
      currentAvgWeightGrams: input.initialWeightGrams || 40,
      supplierName: input.supplierName,
      supplierPhone: input.supplierPhone,
      unitPricePerChic: input.unitPricePerChic || 0,
      status: 'active',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.batches.push(newBatch);

    // 1. Auto-generate standard vaccine schedule for this batch
    const startDateObj = new Date(startDate);
    const schedules: BatchVaccineSchedule[] = STANDARD_VACCINE_LIBRARY.map(vac => {
      const scheduledDate = new Date(startDateObj.getTime() + vac.recommendedAgeDaysStart * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        id: `sch_${newBatchId}_${vac.id}`,
        batchId: newBatchId,
        vaccineId: vac.id,
        vaccineName: vac.name,
        diseaseName: vac.diseaseName,
        scheduledAgeDays: vac.recommendedAgeDaysStart,
        scheduledDate,
        status: 'pending',
        applicationMethod: vac.applicationMethodName,
        dose: vac.defaultDose,
        notes: vac.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    data.vaccineSchedules.push(...schedules);

    // 2. Add import event
    const importEvent: BatchEvent = {
      id: `evt_${Date.now()}_import`,
      batchId: newBatchId,
      eventType: 'import',
      date: startDate,
      quantity: input.initialQuantity,
      avgWeightGrams: input.initialWeightGrams || 40,
      title: `Nhập ${input.initialQuantity.toLocaleString('vi-VN')} con giống ${breed.name}`,
      description: `Nguồn giống: ${input.supplierName || 'Chưa ghi'}. Giá giống: ${(input.unitPricePerChic || 0).toLocaleString('vi-VN')} đ/con.`,
      createdAt: new Date().toISOString()
    };
    data.batchEvents.push(importEvent);

    // 3. If unit price is given, auto add expense transaction for chicks
    if (input.unitPricePerChic && input.unitPricePerChic > 0) {
      const chickExpense: Transaction = {
        id: `tx_${Date.now()}_chicks`,
        batchId: newBatchId,
        farmId: input.farmId,
        type: 'expense',
        category: 'chicks',
        categoryName: 'Con giống',
        amount: input.unitPricePerChic * input.initialQuantity,
        date: startDate,
        paymentMethod: 'bank_transfer',
        payerReceiverName: input.supplierName || 'Trại giống',
        notes: `Chi phí nhập ${input.initialQuantity} con giống ${breed.name}`,
        createdAt: new Date().toISOString()
      };
      data.transactions.push(chickExpense);
    }

    db.save();
    return this.computeBatchMetrics(newBatch);
  }

  static async updateBatch(id: string, update: Partial<Batch>): Promise<Batch | null> {
    const data = db.getData();
    const index = data.batches.findIndex(b => b.id === id);
    if (index === -1) return null;

    data.batches[index] = {
      ...data.batches[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    db.save();
    return this.computeBatchMetrics(data.batches[index]);
  }

  static async deleteBatch(id: string): Promise<boolean> {
    const data = db.getData();
    const initialLen = data.batches.length;
    data.batches = data.batches.filter(b => b.id !== id);
    data.vaccineSchedules = data.vaccineSchedules.filter(v => v.batchId !== id);
    data.batchEvents = data.batchEvents.filter(e => e.batchId !== id);
    data.feedConsumptions = data.feedConsumptions.filter(f => f.batchId !== id);
    data.healthRecords = data.healthRecords.filter(h => h.batchId !== id);
    data.transactions = data.transactions.filter(t => t.batchId !== id);
    
    db.save();
    return data.batches.length < initialLen;
  }

  static async getEvents(batchId: string): Promise<BatchEvent[]> {
    const data = db.getData();
    return data.batchEvents
      .filter(e => e.batchId === batchId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async addEvent(batchId: string, eventData: Omit<BatchEvent, 'id' | 'createdAt'>): Promise<BatchEvent> {
    const data = db.getData();
    const newEvent: BatchEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      batchId,
      createdAt: new Date().toISOString()
    };
    data.batchEvents.push(newEvent);

    // Update batch avg weight if it is weight sample
    if (eventData.eventType === 'weight_sample' && eventData.avgWeightGrams) {
      const batch = data.batches.find(b => b.id === batchId);
      if (batch) {
        batch.currentAvgWeightGrams = eventData.avgWeightGrams;
        batch.updatedAt = new Date().toISOString();
      }
    }

    db.save();
    return newEvent;
  }
}
