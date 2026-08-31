
import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  X, 
  QrCode, 
  Copy, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  HelpCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { SUBSCRIPTION_PLANS, SubscriptionPlanType, SubscriptionPlan } from 'farmgo-shared';
import confetti from 'canvas-confetti';

export const SubscriptionView: React.FC = () => {
  const { 
    user, 
    isSubscriptionModalOpen, 
    setIsSubscriptionModalOpen, 
    refreshData, 
    showToast 
  } = useApp();

  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanType>('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSubscriptionModalOpen) return null;

  const handleStartCheckout = async (planId: SubscriptionPlanType) => {
    try {
      setIsProcessing(true);
      const checkout = await api.createCheckout(planId, 'vietqr');
      setCheckoutData(checkout);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi tạo thanh toán', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!checkoutData) return;
    try {
      setIsProcessing(true);
      await api.confirmPayment(checkoutData.planId, checkoutData.paymentMethod, checkoutData.orderId);
      await refreshData();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      showToast(`Nâng cấp thành công lên ${checkoutData.planName}!`, 'success');
      setCheckoutData(null);
      setIsSubscriptionModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi xác nhận', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-green-800 to-emerald-700 text-white">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Gói Dịch Vụ SaaS Quản Lý Trại Gà FarmGo</span>
            </h3>
            <p className="text-xs text-green-100 mt-0.5">Số hóa quy trình chăn nuôi - Nâng cao hiệu quả & Lợi nhuận</p>
          </div>
          <button 
            onClick={() => setIsSubscriptionModalOpen(false)}
            className="p-1.5 rounded-full text-green-100 hover:text-white hover:bg-green-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!checkoutData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUBSCRIPTION_PLANS.map((plan: SubscriptionPlan) => {
                const isCurrent = user?.currentPlan === plan.id;
                const isPopular = plan.id === 'premium';

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-5 border-2 flex flex-col justify-between transition relative ${
                      isPopular
                        ? 'border-green-600 bg-green-50/40 shadow-lg scale-105 z-10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Phổ biến nhất
                      </span>
                    )}

                    <div>
                      <div className="font-bold text-sm text-slate-800">{plan.name}</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {plan.pricePerMonth.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">đ / tháng</span>
                      </div>

                      <div className="my-4 border-t border-slate-100 pt-3 space-y-2">
                        {plan.features.map((feat: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      {isCurrent ? (
                        <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs text-center">
                          Đang sử dụng
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartCheckout(plan.id)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                            isPopular
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {plan.pricePerMonth === 0 ? 'Dùng Miễn Phí' : 'Nâng Cấp Ngay'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Checkout with VietQR Screen */
            <div className="max-w-md mx-auto space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900">
                <div className="font-bold text-sm text-slate-900 mb-1">Thanh toán Gói: {checkoutData.planName}</div>
                <div>Số tiền: <b className="text-green-700 text-base">{checkoutData.amount.toLocaleString('vi-VN')} VNĐ</b></div>
                <div className="text-[11px] text-slate-600 mt-1">Mã đơn hàng: <b>{checkoutData.orderId}</b></div>
              </div>

              {/* VietQR Code Card */}
              <div className="p-4 rounded-3xl bg-white border-2 border-green-600 shadow-xl inline-block">
                <img
                  src={checkoutData.vietQrUrl}
                  alt="VietQR Payment"
                  className="w-56 h-56 mx-auto rounded-xl object-contain"
                />
                <div className="text-[11px] text-slate-500 font-semibold mt-2">
                  Quét bằng App Ngân Hàng hoặc MoMo / ZaloPay
                </div>
              </div>

              {/* Bank Details */}
              <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-800">{checkoutData.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-black text-slate-900">{checkoutData.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800">{checkoutData.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung chuyển:</span>
                  <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded">{checkoutData.transferContent}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutData(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600"
                >
                  Chọn gói khác
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePaymentSuccess}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs shadow-lg shadow-green-600/30"
                >
                  {isProcessing ? 'Đang kích hoạt...' : 'Tôi Đã Chuyển Khoản'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
