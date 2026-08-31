
import { Farm, SUBSCRIPTION_PLANS } from 'farmgo-shared';
import { db } from '../db/storage.js';

export class FarmService {
  static async listFarms(userId: string): Promise<Farm[]> {
    const data = db.getData();
    return data.farms.filter(f => f.userId === userId);
  }

  static async getFarmById(id: string): Promise<Farm | null> {
    const data = db.getData();
    return data.farms.find(f => f.id === id) || null;
  }

  static async createFarm(userId: string, input: {
    name: string;
    address: string;
    province: string;
    district: string;
    ward?: string;
    totalAreaM2?: number;
    capacityChickens: number;
  }): Promise<Farm> {
    const data = db.getData();
    const user = data.users.find(u => u.id === userId);
    const planType = user?.currentPlan || 'free';
    const planConfig = SUBSCRIPTION_PLANS.find(p => p.id === planType) || SUBSCRIPTION_PLANS[0];

    const currentFarms = data.farms.filter(f => f.userId === userId);
    if (currentFarms.length >= planConfig.maxFarms) {
      throw new Error(`Gói hiện tại (${planConfig.name}) chỉ cho phép tối đa ${planConfig.maxFarms} trang trại. Vui lòng nâng cấp gói để thêm trại mới!`);
    }

    const newFarm: Farm = {
      id: `farm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId,
      name: input.name,
      address: input.address,
      province: input.province,
      district: input.district,
      ward: input.ward,
      totalAreaM2: input.totalAreaM2,
      capacityChickens: input.capacityChickens,
      isDefault: currentFarms.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.farms.push(newFarm);
    db.save();
    return newFarm;
  }

  static async updateFarm(id: string, update: Partial<Farm>): Promise<Farm | null> {
    const data = db.getData();
    const index = data.farms.findIndex(f => f.id === id);
    if (index === -1) return null;

    data.farms[index] = {
      ...data.farms[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    db.save();
    return data.farms[index];
  }

  static async setDefaultFarm(userId: string, farmId: string): Promise<boolean> {
    const data = db.getData();
    data.farms.forEach(f => {
      if (f.userId === userId) {
        f.isDefault = f.id === farmId;
        f.updatedAt = new Date().toISOString();
      }
    });
    db.save();
    return true;
  }

  static async deleteFarm(id: string): Promise<boolean> {
    const data = db.getData();
    const initialLen = data.farms.length;
    data.farms = data.farms.filter(f => f.id !== id);
    db.save();
    return data.farms.length < initialLen;
  }
}
