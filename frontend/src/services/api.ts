
import { 
  User, 
  Farm, 
  Batch, 
  BatchEvent, 
  BatchVaccineSchedule, 
  VaccineDefinition, 
  FeedPurchase, 
  FeedConsumption, 
  Transaction, 
  HealthRecord, 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionPlanType,
  MarketPriceItem,
  ChickenBreed 
} from 'farmgo-shared';

const API_BASE = '/api/v1';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('farmgo_token') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'Yêu cầu thất bại');
    }
    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (phoneOrEmail: string) => 
    fetchApi<{ token: string; user: User; farm: Farm | null }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneOrEmail })
    }),
  getMe: () => 
    fetchApi<{ user: User; farms: Farm[]; currentFarm: Farm | null }>('/auth/me'),
  updateProfile: (data: Partial<User>) => 
    fetchApi<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Farms
  getFarms: () => 
    fetchApi<Farm[]>('/farms'),
  createFarm: (data: Partial<Farm>) => 
    fetchApi<Farm>('/farms', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateFarm: (id: string, data: Partial<Farm>) => 
    fetchApi<Farm>(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  setDefaultFarm: (id: string) => 
    fetchApi<{ success: boolean }>(`/farms/${id}/set-default`, {
      method: 'POST'
    }),

  // Batches
  getBatches: (farmId?: string, status?: string) => {
    const query = new URLSearchParams();
    if (farmId) query.append('farmId', farmId);
    if (status) query.append('status', status);
    return fetchApi<Batch[]>(`/batches?${query.toString()}`);
  },
  getBatchById: (id: string) => 
    fetchApi<Batch>(`/batches/${id}`),
  createBatch: (data: any) => 
    fetchApi<Batch>('/batches', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateBatch: (id: string, data: Partial<Batch>) => 
    fetchApi<Batch>(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteBatch: (id: string) => 
    fetchApi<{ deleted: boolean }>(`/batches/${id}`, {
      method: 'DELETE'
    }),
  getBatchEvents: (batchId: string) => 
    fetchApi<BatchEvent[]>(`/batches/${batchId}/events`),
  addBatchEvent: (batchId: string, data: any) => 
    fetchApi<BatchEvent>(`/batches/${batchId}/events`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Vaccines
  getVaccineLibrary: () => 
    fetchApi<VaccineDefinition[]>('/vaccines/library'),
  getVaccineAlerts: (farmId?: string) => 
    fetchApi<{ dueToday: any[]; dueSoon: any[]; overdue: any[] }>(`/vaccines/due-alerts${farmId ? `?farmId=${farmId}` : ''}`),
  getBatchVaccines: (batchId: string) => 
    fetchApi<BatchVaccineSchedule[]>(`/vaccines/batch/${batchId}`),
  updateVaccineSchedule: (id: string, data: any) => 
    fetchApi<BatchVaccineSchedule>(`/vaccines/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  addCustomVaccine: (batchId: string, data: any) => 
    fetchApi<BatchVaccineSchedule>(`/vaccines/batch/${batchId}/custom`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteVaccineSchedule: (id: string) => 
    fetchApi<{ deleted: boolean }>(`/vaccines/schedule/${id}`, {
      method: 'DELETE'
    }),

  // Feeds
  getFeedPurchases: (farmId?: string, batchId?: string) => {
    const query = new URLSearchParams();
    if (farmId) query.append('farmId', farmId);
    if (batchId) query.append('batchId', batchId);
    return fetchApi<FeedPurchase[]>(`/feeds/purchases?${query.toString()}`);
  },
  createFeedPurchase: (data: any) => 
    fetchApi<FeedPurchase>('/feeds/purchases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getFeedConsumptions: (batchId: string) => 
    fetchApi<FeedConsumption[]>(`/feeds/consumption/${batchId}`),
  logFeedConsumption: (batchId: string, data: any) => 
    fetchApi<FeedConsumption>(`/feeds/consumption/${batchId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getFeedInventory: (farmId: string) => 
    fetchApi<any>(`/feeds/inventory/${farmId}`),
  getFcrAnalysis: (batchId: string) => 
    fetchApi<any>(`/feeds/fcr-analysis/${batchId}`),

  // Finances
  getTransactions: (filters: any = {}) => {
    const query = new URLSearchParams(filters);
    return fetchApi<Transaction[]>(`/finances/transactions?${query.toString()}`);
  },
  createTransaction: (data: any) => 
    fetchApi<Transaction>('/finances/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteTransaction: (id: string) => 
    fetchApi<{ deleted: boolean }>(`/finances/transactions/${id}`, {
      method: 'DELETE'
    }),
  getFinancialSummary: (filters: any = {}) => {
    const query = new URLSearchParams(filters);
    return fetchApi<any>(`/finances/summary?${query.toString()}`);
  },

  // Health
  getHealthRecords: (batchId: string) => 
    fetchApi<HealthRecord[]>(`/health/records/${batchId}`),
  createHealthRecord: (batchId: string, data: any) => 
    fetchApi<HealthRecord>(`/health/records/${batchId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getWithdrawalAlerts: (farmId?: string) => 
    fetchApi<any[]>(`/health/withdrawal-alerts${farmId ? `?farmId=${farmId}` : ''}`),
  getDiseaseGuide: () => 
    fetchApi<any[]>('/health/disease-guide'),

  // AI & Analytics
  askAi: (message: string, context?: { batchId?: string; farmId?: string }) => 
    fetchApi<{ reply: string; suggestedActions?: any[]; relatedTopics?: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, ...context })
    }),
  getOptimalHarvest: (batchId: string) => 
    fetchApi<any>(`/ai/optimal-harvest/${batchId}`),
  diagnoseDisease: (symptoms: string[]) => 
    fetchApi<any>('/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify({ symptoms })
    }),

  // SaaS Subscriptions
  getPlans: () => 
    fetchApi<SubscriptionPlan[]>('/subscriptions/plans'),
  getCurrentSubscription: () => 
    fetchApi<any>('/subscriptions/current'),
  createCheckout: (planId: SubscriptionPlanType, paymentMethod: string = 'vietqr') => 
    fetchApi<any>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod })
    }),
  confirmPayment: (planId: SubscriptionPlanType, paymentMethod: string, transactionId?: string) => 
    fetchApi<any>('/subscriptions/confirm', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod, transactionId })
    }),

  // Market & Info
  getMarketPrices: () => 
    fetchApi<MarketPriceItem[]>('/market/prices'),
  getBreeds: () => 
    fetchApi<ChickenBreed[]>('/market/breeds'),
  getWeatherAlerts: (province?: string) => 
    fetchApi<any>(`/market/weather-alerts${province ? `?province=${province}` : ''}`),

  // System Demo Reset
  resetDemoData: () => 
    fetchApi<{ success: boolean; message: string }>('/system/reset-demo', {
      method: 'POST'
    })
};
