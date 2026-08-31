
export type UserRole = 'farmer' | 'manager' | 'admin';

export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  farmName?: string;
  province?: string;
  district?: string;
  role: UserRole;
  currentPlan: SubscriptionPlanType;
  planExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  address: string;
  province: string;
  district: string;
  ward?: string;
  totalAreaM2?: number;
  capacityChickens: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = 'active' | 'completed' | 'cancelled';

export interface Batch {
  id: string;
  farmId: string;
  name: string; // VD: "Lứa Ri Lai #01-2025"
  breedId: string;
  breedName: string;
  initialQuantity: number;
  currentQuantity: number;
  startDate: string; // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  actualHarvestDate?: string;
  initialWeightGrams?: number;
  currentAvgWeightGrams?: number;
  supplierName?: string;
  supplierPhone?: string;
  unitPricePerChic: number; // Giá con giống / con
  status: BatchStatus;
  notes?: string;
  
  // Computed & Aggregated Fields
  ageInDays?: number;
  survivalRate?: number; // %
  totalDeaths?: number;
  totalFeedConsumedKg?: number;
  currentFCR?: number; // Feed Conversion Ratio
  totalExpense?: number;
  totalRevenue?: number;
  netProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export type BatchEventType = 
  | 'import' 
  | 'mortality' 
  | 'sick' 
  | 'split' 
  | 'weight_sample' 
  | 'harvest_partial' 
  | 'harvest_full' 
  | 'note';

export interface BatchEvent {
  id: string;
  batchId: string;
  eventType: BatchEventType;
  date: string;
  quantity?: number;
  avgWeightGrams?: number;
  title: string;
  description?: string;
  photos?: string[];
  createdAt: string;
}

export interface VaccineDefinition {
  id: string;
  name: string;
  diseaseName: string; // Bệnh phòng
  recommendedAgeDaysStart: number;
  recommendedAgeDaysEnd: number;
  applicationMethod: 'eye_nose_drop' | 'oral_water' | 'wing_web' | 'subcutaneous_neck' | 'intramuscular_breast';
  applicationMethodName: string;
  isMandatory: boolean;
  notes: string;
  defaultDose: string;
}

export type VaccineScheduleStatus = 'pending' | 'due' | 'completed' | 'skipped' | 'overdue';

export interface BatchVaccineSchedule {
  id: string;
  batchId: string;
  vaccineId: string;
  vaccineName: string;
  diseaseName: string;
  scheduledAgeDays: number;
  scheduledDate: string; // YYYY-MM-DD
  actualDate?: string;
  status: VaccineScheduleStatus;
  applicationMethod: string;
  dose?: string;
  supplier?: string;
  lotNumber?: string;
  administeredBy?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedStage = 'brooding' | 'grower' | 'finisher' | 'layer' | 'supplement';

export interface FeedPurchase {
  id: string;
  batchId?: string;
  farmId: string;
  feedType: FeedStage;
  brandName: string; // VD: CP, De Heus, GreenFeed, Dabaco, Cargill
  productCode?: string;
  bagCount: number;
  kgPerBag: number;
  totalKg: number;
  unitPricePerKg: number;
  totalPrice: number;
  supplier: string;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
}

export interface FeedConsumption {
  id: string;
  batchId: string;
  date: string;
  feedType: FeedStage;
  quantityKg: number;
  isEstimated: boolean;
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'chicks' // Con giống
  | 'feed' // Thức ăn cám
  | 'vaccine' // Vaccine
  | 'medicine' // Thuốc thú y & sát trùng
  | 'bedding_litter' // Trấu, mùn cưa, đệm lót sinh học
  | 'electricity_water' // Điện thắp sáng, sưởi ấm, nước uống
  | 'labor' // Nhân công
  | 'equipment' // Dụng cụ máng ăn, máng uống, đèn úm
  | 'cage_depreciation' // Khấu hao chuồng trại
  | 'other_expense'; // Chi phí khác

export type IncomeCategory = 
  | 'sell_chicken_meat' // Bán gà thịt
  | 'sell_chicken_breed' // Bán gà giống / gà hậu bị
  | 'sell_eggs' // Bán trứng
  | 'sell_manure' // Bán phân gà, trấu thải
  | 'other_income'; // Thu nhập khác

export interface Transaction {
  id: string;
  batchId?: string;
  farmId: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  categoryName: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'e_wallet' | 'debt';
  payerReceiverName?: string;
  referenceCode?: string;
  notes?: string;
  receiptPhotoUrl?: string;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  batchId: string;
  date: string;
  deathsCount: number;
  cullsCount?: number; // Số con loại thải/ốm nặng
  suspectedDiseases?: string[];
  symptoms: string[];
  medicationsUsed?: string[];
  medicationDosage?: string;
  withdrawalDays?: number; // Số ngày cách ly ngưng thuốc
  withdrawalEndDate?: string;
  treatmentNotes?: string;
  isResolved: boolean;
  createdAt: string;
}

export type SubscriptionPlanType = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  pricePerMonth: number;
  maxActiveBatches: number;
  maxFarms: number;
  hasPdfExport: boolean;
  hasAiAssistant: boolean;
  hasSmsNotification: boolean;
  hasMultiUserFarm: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlanType;
  planName: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'vaccine' | 'feed' | 'health' | 'finance' | 'system' | 'market';
  relatedBatchId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChickenBreed {
  id: string;
  name: string;
  category: 'ta_tha_vuon' | 'dac_san' | 'cong_nghiep' | 'sieu_trung';
  categoryName: string;
  origin: string;
  description: string;
  characteristics: string[];
  standardGrowthDays: number;
  standardMarketWeightKg: number;
  targetFCR: number;
  expectedMortalityRate: number; // %
  recommendedFeedingPhases: {
    phase: FeedStage;
    phaseName: string;
    daysRange: string;
    proteinPercent: string;
    dailyFeedPerBirdGrams: string;
  }[];
}

export interface MarketPriceItem {
  id: string;
  region: 'Mien Bac' | 'Mien Trung' | 'Mien Nam';
  productName: string;
  unit: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  updatedAt: string;
}
