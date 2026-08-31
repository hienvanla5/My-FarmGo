
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionPlanType, 
  SUBSCRIPTION_PLANS 
} from 'farmgo-shared';
import { db } from '../db/storage.js';

export class SubscriptionService {
  static getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  static async getCurrentSubscription(userId: string): Promise<{
    currentPlan: SubscriptionPlanType;
    planDetails: SubscriptionPlan;
    expiryDate?: string;
    history: Subscription[];
  }> {
    const data = db.getData();
    const user = data.users.find(u => u.id === userId);
    const planType = user?.currentPlan || 'free';
    const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === planType) || SUBSCRIPTION_PLANS[0];
    const history = data.subscriptions.filter(s => s.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      currentPlan: planType,
      planDetails,
      expiryDate: user?.planExpiryDate,
      history
    };
  }

  static async createCheckout(userId: string, planId: SubscriptionPlanType, paymentMethod: string): Promise<{
    orderId: string;
    planId: SubscriptionPlanType;
    planName: string;
    amount: number;
    paymentMethod: string;
    vietQrUrl: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    transferContent: string;
    instructions: string;
  }> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Gói dịch vụ không tồn tại');

    const orderId = `FARMGO_${Date.now().toString().slice(-6)}`;
    const bankName = 'MB Bank (Ngân hàng Quân Đội)';
    const accountNumber = '0988123456';
    const accountName = 'CONG TY SAAS FARMGO VIET NAM';
    const transferContent = `${orderId} ${userId.slice(-6)}`;
    const vietQrUrl = `https://img.vietqr.io/image/MB-${accountNumber}-compact.png?amount=${plan.pricePerMonth}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

    return {
      orderId,
      planId,
      planName: plan.name,
      amount: plan.pricePerMonth,
      paymentMethod,
      vietQrUrl,
      accountNumber,
      accountName,
      bankName,
      transferContent,
      instructions: `Quét mã VietQR hoặc chuyển khoản đúng số tiền ${plan.pricePerMonth.toLocaleString('vi-VN')} đ với nội dung '${transferContent}'. Hệ thống sẽ tự động kích hoạt gói trong 10 giây!`
    };
  }

  static async confirmPayment(userId: string, planId: SubscriptionPlanType, paymentMethod: string, transactionId?: string): Promise<Subscription> {
    const data = db.getData();
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Gói dịch vụ không tồn tại');

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newSub: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId,
      plan: planId,
      planName: plan.name,
      amountPaid: plan.pricePerMonth,
      paymentMethod: paymentMethod || 'VietQR Chuyển khoản',
      transactionId: transactionId || `TXN_${Date.now()}`,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    data.subscriptions.push(newSub);

    // Update user
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.currentPlan = planId;
      user.planExpiryDate = endDate;
      user.updatedAt = new Date().toISOString();
    }

    db.save();
    return newSub;
  }
}
