
import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Bell, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Farm } from 'farmgo-shared';

export const Navbar: React.FC = () => {
  const { 
    user, 
    farms, 
    currentFarm, 
    switchFarm, 
    setIsFarmModalOpen, 
    setIsSubscriptionModalOpen,
    isMobileFrame, 
    setIsMobileFrame,
    vaccineAlerts,
    withdrawalAlerts,
    refreshData,
    showToast
  } = useApp();

  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const totalAlerts = vaccineAlerts.dueToday.length + vaccineAlerts.overdue.length + withdrawalAlerts.length;

  const handleResetDemo = async () => {
    if (window.confirm('Khôi phục lại toàn bộ dữ liệu mẫu chuẩn của trại gà?')) {
      try {
        setIsResetting(true);
        await api.resetDemoData();
        await refreshData();
        showToast('Đã khôi phục dữ liệu mẫu thành công!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Lỗi khôi phục dữ liệu', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const getPlanBadge = () => {
    const plan = user?.currentPlan || 'free';
    if (plan === 'pro') {
      return (
        <button 
          onClick={() => setIsSubscriptionModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-sm hover:opacity-90"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trang Trại VIP</span>
        </button>
      );
    }
    if (plan === 'premium') {
      return (
        <button 
          onClick={() => setIsSubscriptionModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-600 text-white text-xs font-bold shadow-sm hover:bg-green-700"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gói Nông Hộ</span>
        </button>
      );
    }
    return (
      <button 
        onClick={() => setIsSubscriptionModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
      >
        <span>Gói Miễn Phí</span>
        <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-bold">Nâng cấp</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Farm Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🐔</span>
            <div className="hidden xs:block">
              <span className="text-lg font-black tracking-tight text-green-700">Farm</span>
              <span className="text-lg font-black tracking-tight text-amber-600">Go</span>
            </div>
          </div>

          {/* Farm Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition max-w-[160px] sm:max-w-[220px] truncate"
            >
              <Building2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="truncate">{currentFarm?.name || 'Chọn Trang Trại'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            </button>

            {isFarmDropdownOpen && (
              <div 
                className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsFarmDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Trang trại của bạn ({farms.length})
                </div>
                {farms.map((f: Farm) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      switchFarm(f.id);
                      setIsFarmDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      f.id === currentFarm?.id ? 'text-green-700 font-bold bg-green-50/60' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{f.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{f.address}</div>
                    </div>
                    {f.id === currentFarm?.id && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      setIsFarmDropdownOpen(false);
                      setIsFarmModalOpen(true);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quản lý & Thêm trang trại</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Plan badge */}
          {getPlanBadge()}

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Thông báo"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Thông báo & Cảnh báo ({totalAlerts})</span>
                  </h4>
                  <button onClick={() => setIsNotifOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Đóng</button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {vaccineAlerts.dueToday.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Lịch tiêm hôm nay:</span>
                      </div>
                      {vaccineAlerts.dueToday.map((v: any) => (
                        <div key={v.id} className="text-xs text-amber-800 mt-1 pl-4">
                          • <b>{v.batchName}</b>: {v.vaccineName} ({v.diseaseName})
                        </div>
                      ))}
                    </div>
                  )}

                  {withdrawalAlerts.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                      <div className="text-xs font-bold text-red-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cảnh báo thời gian ngưng thuốc:</span>
                      </div>
                      {withdrawalAlerts.map((w: any) => (
                        <div key={w.batchId} className="text-xs text-red-800 mt-1 pl-4">
                          • <b>{w.batchName}</b>: Còn {w.remainingDays} ngày ngưng thuốc ({w.medications.join(', ')})
                        </div>
                      ))}
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1 opacity-80" />
                      Trại gà đang hoạt động ổn định, không có cảnh báo khẩn!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition hidden sm:flex items-center gap-1 text-xs"
            title="Khôi phục dữ liệu mẫu trại gà"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-green-600' : ''}`} />
            <span className="hidden md:inline">Dữ liệu mẫu</span>
          </button>

          {/* Mobile frame toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 text-xs font-medium"
            title={isMobileFrame ? "Chuyển sang giao diện Rộng (Màn hình lớn)" : "Chuyển sang khung mô phỏng Điện thoại"}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">Bản Rộng</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="hidden lg:inline">Bản Mobile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
