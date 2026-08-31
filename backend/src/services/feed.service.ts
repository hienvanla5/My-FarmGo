
import { 
  FeedPurchase, 
  FeedConsumption, 
  FeedStage, 
  Transaction, 
  VIETNAMESE_CHICKEN_BREEDS 
} from 'farmgo-shared';
import { db } from '../db/storage.js';

export class FeedService {
  static async getPurchases(farmId?: string, batchId?: string): Promise<FeedPurchase[]> {
    const data = db.getData();
    return data.feedPurchases
      .filter(p => (!farmId || p.farmId === farmId) && (!batchId || p.batchId === batchId))
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  static async createPurchase(input: {
    farmId: string;
    batchId?: string;
    feedType: FeedStage;
    brandName: string;
    productCode?: string;
    bagCount: number;
    kgPerBag: number;
    unitPricePerKg: number;
    supplier: string;
    purchaseDate: string;
    notes?: string;
  }): Promise<FeedPurchase> {
    const data = db.getData();
    const totalKg = input.bagCount * input.kgPerBag;
    const totalPrice = totalKg * input.unitPricePerKg;

    const newPurchase: FeedPurchase = {
      id: `fp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      farmId: input.farmId,
      batchId: input.batchId,
      feedType: input.feedType,
      brandName: input.brandName,
      productCode: input.productCode,
      bagCount: input.bagCount,
      kgPerBag: input.kgPerBag,
      totalKg,
      unitPricePerKg: input.unitPricePerKg,
      totalPrice,
      supplier: input.supplier,
      purchaseDate: input.purchaseDate,
      notes: input.notes,
      createdAt: new Date().toISOString()
    };

    data.feedPurchases.push(newPurchase);

    // Auto add transaction
    const tx: Transaction = {
      id: `tx_feed_${Date.now()}`,
      batchId: input.batchId,
      farmId: input.farmId,
      type: 'expense',
      category: 'feed',
      categoryName: 'Thức ăn cám',
      amount: totalPrice,
      date: input.purchaseDate,
      paymentMethod: 'cash',
      payerReceiverName: input.supplier,
      notes: `Mua ${input.bagCount} bao (${totalKg}kg) ${input.brandName}`,
      createdAt: new Date().toISOString()
    };
    data.transactions.push(tx);

    db.save();
    return newPurchase;
  }

  static async getConsumptions(batchId: string): Promise<FeedConsumption[]> {
    const data = db.getData();
    return data.feedConsumptions
      .filter(f => f.batchId === batchId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async logConsumption(batchId: string, input: {
    date: string;
    feedType: FeedStage;
    quantityKg: number;
    isEstimated?: boolean;
    notes?: string;
  }): Promise<FeedConsumption> {
    const data = db.getData();
    const newLog: FeedConsumption = {
      id: `fc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      batchId,
      date: input.date,
      feedType: input.feedType,
      quantityKg: input.quantityKg,
      isEstimated: input.isEstimated || false,
      notes: input.notes,
      createdAt: new Date().toISOString()
    };

    data.feedConsumptions.push(newLog);
    db.save();
    return newLog;
  }

  static async getInventory(farmId: string): Promise<{
    feedTypes: Record<FeedStage, { purchasedKg: number; consumedKg: number; remainingKg: number; remainingBags: number; estRemainingDays: number }>;
    totalRemainingKg: number;
    totalStockValue: number;
    reorderAlerts: string[];
  }> {
    const data = db.getData();
    const purchases = data.feedPurchases.filter(p => p.farmId === farmId);
    
    // Find all batches in this farm to get consumptions
    const farmBatchIds = new Set(data.batches.filter(b => b.farmId === farmId).map(b => b.id));
    const consumptions = data.feedConsumptions.filter(c => farmBatchIds.has(c.batchId));

    const feedTypes: Record<FeedStage, { purchasedKg: number; consumedKg: number; remainingKg: number; remainingBags: number; estRemainingDays: number }> = {
      brooding: { purchasedKg: 0, consumedKg: 0, remainingKg: 0, remainingBags: 0, estRemainingDays: 999 },
      grower: { purchasedKg: 0, consumedKg: 0, remainingKg: 0, remainingBags: 0, estRemainingDays: 999 },
      finisher: { purchasedKg: 0, consumedKg: 0, remainingKg: 0, remainingBags: 0, estRemainingDays: 999 },
      layer: { purchasedKg: 0, consumedKg: 0, remainingKg: 0, remainingBags: 0, estRemainingDays: 999 },
      supplement: { purchasedKg: 0, consumedKg: 0, remainingKg: 0, remainingBags: 0, estRemainingDays: 999 }
    };

    purchases.forEach(p => {
      if (feedTypes[p.feedType]) {
        feedTypes[p.feedType].purchasedKg += p.totalKg;
      }
    });

    consumptions.forEach(c => {
      if (feedTypes[c.feedType]) {
        feedTypes[c.feedType].consumedKg += c.quantityKg;
      }
    });

    let totalRemainingKg = 0;
    let totalStockValue = 0;
    const reorderAlerts: string[] = [];

    // Calculate active bird count in farm
    const activeBatches = data.batches.filter(b => b.farmId === farmId && b.status === 'active');
    const totalActiveBirds = activeBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    const avgDailyKgPerBird = 0.08; // ~80g/con/ngày

    (Object.keys(feedTypes) as FeedStage[]).forEach(type => {
      const item = feedTypes[type];
      item.remainingKg = Math.max(0, item.purchasedKg - item.consumedKg);
      item.remainingBags = Number((item.remainingKg / 25).toFixed(1));

      // Calculate avg daily consumption
      const dailyFarmBurnRate = totalActiveBirds * avgDailyKgPerBird || 25;
      item.estRemainingDays = item.remainingKg > 0 ? Math.floor(item.remainingKg / dailyFarmBurnRate) : 0;

      totalRemainingKg += item.remainingKg;
      totalStockValue += item.remainingKg * 14500; // avg 14.500đ/kg

      if (item.remainingKg <= 100 && item.purchasedKg > 0) {
        reorderAlerts.push(`Cảnh báo: Tồn kho ${type === 'brooding' ? 'Cám Úm' : type === 'grower' ? 'Cám Tăng Trưởng' : 'Cám Vỗ Béo'} chỉ còn ${item.remainingKg} kg (khoảng ${item.remainingBags} bao). Hãy đặt mua thêm!`);
      }
    });

    return {
      feedTypes,
      totalRemainingKg,
      totalStockValue,
      reorderAlerts
    };
  }

  static async getFcrAnalysis(batchId: string): Promise<{
    currentFCR: number;
    targetFCR: number;
    status: 'optimal' | 'normal' | 'warning_high';
    statusText: string;
    totalFeedKg: number;
    totalWeightGainKg: number;
    avgDailyFeedPerBirdGrams: number;
    standardDailyFeedGrams: number;
    estimatedFeedCostToHarvest: number;
    suggestions: string[];
  }> {
    const data = db.getData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const breed = VIETNAMESE_CHICKEN_BREEDS.find(b => b.id === batch.breedId) || VIETNAMESE_CHICKEN_BREEDS[0];
    const targetFCR = breed.targetFCR || 2.7;

    // Calculate feed consumed
    const consumptions = data.feedConsumptions.filter(c => c.batchId === batchId);
    const totalFeedKg = consumptions.reduce((sum, c) => sum + c.quantityKg, 0);

    // Calculate weight gain
    const initialWeightKg = ((batch.initialWeightGrams || 40) * batch.initialQuantity) / 1000;
    const currentWeightKg = ((batch.currentAvgWeightGrams || 500) * batch.currentQuantity) / 1000;
    const totalWeightGainKg = Math.max(1, currentWeightKg - initialWeightKg);

    const currentFCR = totalFeedKg > 0 ? Number((totalFeedKg / totalWeightGainKg).toFixed(2)) : targetFCR;

    // Age
    const start = new Date(batch.startDate).getTime();
    const ageDays = Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));

    const avgDailyFeedPerBirdGrams = ageDays > 0 && batch.currentQuantity > 0 
      ? Number(((totalFeedKg * 1000) / (batch.currentQuantity * ageDays)).toFixed(1))
      : 50;

    let standardDailyFeedGrams = 60;
    if (ageDays <= 21) standardDailyFeedGrams = 25;
    else if (ageDays <= 50) standardDailyFeedGrams = 55;
    else standardDailyFeedGrams = 90;

    let status: 'optimal' | 'normal' | 'warning_high' = 'normal';
    let statusText = 'FCR đạt mức bình thường theo tiêu chuẩn giống';
    const suggestions: string[] = [];

    if (currentFCR <= targetFCR) {
      status = 'optimal';
      statusText = 'FCR rất tốt! Đàn gà hấp thu dinh dưỡng tối ưu và tăng trọng nhanh.';
      suggestions.push('Tiếp tục duy trì công thức khẩu phần và điều kiện thông thoáng chuồng trại hiện tại.');
      suggestions.push('Định kỳ cân mẫu hàng tuần để ghi nhận chính xác biểu đồ tăng trọng.');
    } else if (currentFCR <= targetFCR * 1.15) {
      status = 'normal';
      statusText = 'FCR nằm trong ngưỡng chấp nhận được của chăn nuôi thả vườn.';
      suggestions.push('Bổ sung thêm Men vi sinh tiêu hóa Probiotic và Enzyme vào nước uống để gà tiêu hóa triệt để hạt cám.');
      suggestions.push('Kiểm tra máng ăn có bị gà bới vãi rơi xuống đệm lót gây hao phí không.');
    } else {
      status = 'warning_high';
      statusText = 'CẢNH BÁO FCR CAO BẤT THƯỜNG! Đang tiêu tốn nhiều cám hơn mức tăng trọng thực tế.';
      suggestions.push('⚠️ Kiểm tra phân gà: có hiện tượng sống phân, tiêu chảy phân nhớt, cầu trùng hoặc viêm ruột hoại tử không.');
      suggestions.push('⚠️ Điều chỉnh độ cao của máng ăn ngang tầm lưng gà để chống bới vãi rơi cám.');
      suggestions.push('⚠️ Kiểm tra chất lượng cám: tránh cám bị ẩm mốc, giảm mùi thơm kích thích ăn.');
      suggestions.push('⚠️ Tẩy giun sán cho đàn gà nếu đã nuôi trên 40 ngày mà chưa tẩy giun.');
    }

    // Remaining feed estimation
    const remainingDays = Math.max(0, breed.standardGrowthDays - ageDays);
    const estRemainingFeedKg = remainingDays * batch.currentQuantity * 0.09;
    const estimatedFeedCostToHarvest = estRemainingFeedKg * 14200;

    return {
      currentFCR,
      targetFCR,
      status,
      statusText,
      totalFeedKg,
      totalWeightGainKg,
      avgDailyFeedPerBirdGrams,
      standardDailyFeedGrams,
      estimatedFeedCostToHarvest,
      suggestions
    };
  }
}
