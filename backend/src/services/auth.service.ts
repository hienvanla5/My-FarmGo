
import jwt from 'jsonwebtoken';
import { User, Farm, SubscriptionPlanType } from 'farmgo-shared';
import { db } from '../db/storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'farmgo-saas-secret-key-2025';

export interface AuthTokenPayload {
  userId: string;
  phone: string;
  role: string;
  currentPlan: SubscriptionPlanType;
}

export class AuthService {
  static generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      currentPlan: user.currentPlan
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  }

  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      return null;
    }
  }

  static async login(phoneOrEmail: string, _password?: string): Promise<{ token: string; user: User; farm: Farm | null }> {
    const data = db.getData();
    let user = data.users.find(u => u.phone === phoneOrEmail || u.email === phoneOrEmail);

    if (!user) {
      // Auto-register demo user or first-time user
      const isNew = true;
      user = {
        id: `usr_${Date.now()}`,
        phone: phoneOrEmail.includes('@') ? '090' + Math.floor(1000000 + Math.random() * 9000000) : phoneOrEmail,
        email: phoneOrEmail.includes('@') ? phoneOrEmail : undefined,
        fullName: 'Chủ Trại Gà ' + (phoneOrEmail.slice(-4) || 'Mới'),
        farmName: 'Trang Trại Gà Sạch',
        province: 'Hà Nội',
        district: 'Sơn Tây',
        role: 'farmer',
        currentPlan: 'premium',
        planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.users.push(user);

      // Create default farm for user
      const newFarm: Farm = {
        id: `farm_${Date.now()}`,
        userId: user.id,
        name: 'Trang Trại Gà Số 1',
        address: 'Thôn 1, Xã Phú Thịnh, Hà Nội',
        province: 'Hà Nội',
        district: 'Sơn Tây',
        capacityChickens: 2000,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.farms.push(newFarm);
      db.save();
    }

    const farm = data.farms.find(f => f.userId === user.id && f.isDefault) || data.farms.find(f => f.userId === user.id) || null;
    const token = this.generateToken(user);
    return { token, user, farm };
  }

  static async getCurrentUser(userId: string): Promise<{ user: User; farms: Farm[]; currentFarm: Farm | null } | null> {
    const data = db.getData();
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;

    const farms = data.farms.filter(f => f.userId === userId);
    const currentFarm = farms.find(f => f.isDefault) || farms[0] || null;

    return { user, farms, currentFarm };
  }

  static async updateProfile(userId: string, updateData: Partial<User>): Promise<User | null> {
    const data = db.getData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    db.save();
    return data.users[userIndex];
  }
}
