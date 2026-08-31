
import React from 'react';
import { 
  CloudSun, 
  Flame, 
  Wind, 
  Droplets, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  HeartPulse, 
  Wheat, 
  DollarSign, 
  ArrowRight, 
  Plus, 
  Syringe, 
  ShieldAlert, 
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    currentFarm, 
    activeBatches, 
    completedBatches, 
    vaccineAlerts, 
    withdrawalAlerts, 
    weatherAlert,
    setActiveTab, 
    setSelectedBatchId,
    setIsNewBatchModalOpen,
    setIsQuickActionOpen
  } = useApp();

  const totalActiveBirds = activeBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
  const avgSurvivalRate = activeBatches.length > 0
    ? (activeBatches.reduce((sum, b) => sum + (b.survivalRate || 95), 0) / activeBatches.length).toFixed(1)
    : '100';

  const totalExpenses = activeBatches.reduce((sum, b) => sum + (b.totalExpense || 0), 0);

  // Quick summary chart data
  const chartData = [
    { name: 'Chi phí giống', amount: activeBatches.reduce((sum, b) => sum + ((b.initialQuantity || 0) * (b.unitPricePerChic || 14000)), 0) / 1000000 },
    { name: 'Chi phí cám', amount: (totalExpenses * 0.65) / 1000000 },
    { name: 'Thuốc & Vac', amount: (totalExpenses * 0.1) / 1000000 },
    { name: 'Doanh thu dự kiến', amount: (activeBatches.reduce((sum, b) => sum + (b.currentQuantity * 1.8 * 82000), 0)) / 1000000 }
  ];

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* 1. Agricultural Climate & Weather Advisory Banner */}
      {weatherAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CloudSun className="w-6 h-6 text-yellow-300 flex-shrink-0 animate-bounce" />
              <div>
                <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span>Thời tiết nông nghiệp: {weatherAlert.location}</span>
                  <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-medium">{weatherAlert.temperature}°C | Độ ẩm {weatherAlert.humidity}%</span>
                </div>
                <p className="text-[11px] text-blue-50 mt-1 leading-snug">
                  {weatherAlert.advisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Urgent Alerts Section (if any) */}
      {(vaccineAlerts.dueToday.length > 0 || withdrawalAlerts.length > 0) && (
        <div className="space-y-2">
          {vaccineAlerts.dueToday.map(v => (
            <div 
              key={v.id}
              onClick={() => setActiveTab('vaccines')}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition"
            >
              <div className="flex items-center gap-2 text-xs">
                <Syringe className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><b>Lịch tiêm hôm nay:</b> {v.batchName} ({v.vaccineName})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 flex-shrink-0" />
            </div>
          ))}

          {withdrawalAlerts.map(w => (
            <div 
              key={w.batchId}
              onClick={() => setActiveTab('health')}
              className="p-3 rounded-xl bg-red-500/10 border border-red-300 text-red-900 flex items-center justify-between cursor-pointer hover:bg-red-500/20 transition"
            >
              <div className="flex items-center gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span><b>Cảnh báo ngưng thuốc:</b> {w.batchName} còn {w.remainingDays} ngày (Không xuất bán trước hạn!)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-700 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* 3. Top Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tổng đàn gà</span>
            <span className="text-base">🐔</span>
          </div>
          <div className="text-xl font-black text-slate-800 mt-1">
            {totalActiveBirds.toLocaleString('vi-VN')}
            <span className="text-xs font-normal text-slate-400 ml-1">con</span>
          </div>
          <div className="text-[10px] text-green-700 font-semibold mt-1">
            {activeBatches.length} lứa đang nuôi
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tỷ lệ sống</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-green-700 mt-1">
            {avgSurvivalRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Đạt chuẩn thả vườn
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>FCR Trung bình</span>
            <Wheat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">
            2.65
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Tiêu tốn cám tối ưu
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Lợi nhuận ước tính</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl font-black text-green-700 mt-1 truncate">
            +48.5Tr
          </div>
          <div className="text-[10px] text-green-700 font-semibold mt-1">
            ROI dự kiến: ~32%
          </div>
        </div>
      </div>

      {/* 4. Quick Actions 1-Tap Bar */}
      <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-md flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold whitespace-nowrap pl-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline">Thao tác:</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi Thu Chi</span>
          </button>
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            <span>Ghi Số Chết</span>
          </button>
          <button
            onClick={() => setIsNewBatchModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Vào Lứa Mới</span>
          </button>
        </div>
      </div>

      {/* 5. Active Batches List (Card View) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span>🐔</span>
            <span>Các Lứa Nuôi Đang Chạy ({activeBatches.length})</span>
          </h3>
          <button
            onClick={() => setActiveTab('batches')}
            className="text-xs text-green-700 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeBatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="text-3xl mb-2">🐣</div>
            <h4 className="font-bold text-slate-700 text-sm">Chưa có lứa gà nào đang nuôi</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Hãy tạo lứa nuôi mới để hệ thống tự động sinh lịch tiêm và quản lý chi phí!</p>
            <button
              onClick={() => setIsNewBatchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700"
            >
              + Tạo Lứa Nuôi Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeBatches.map(batch => {
              const totalDays = 105;
              const agePercent = Math.min(100, Math.round(((batch.ageInDays || 1) / totalDays) * 100));

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-green-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                          {batch.breedName}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{batch.name}</h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-slate-800">{batch.currentQuantity.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-slate-400">con</span></div>
                        <div className="text-[10px] text-green-700 font-bold">Sống {batch.survivalRate}%</div>
                      </div>
                    </div>

                    {/* Progress Bar (Age in Days) */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Ngày tuổi: <b>{batch.ageInDays} ngày</b></span>
                        <span className="text-slate-400">Xuất chuồng: ~{totalDays} ngày</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${agePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Details pill */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-slate-50">
                        <div className="text-[10px] text-slate-400 font-medium">Trọng lượng</div>
                        <div className="font-bold text-slate-800 text-xs mt-0.5">{((batch.currentAvgWeightGrams || 500) / 1000).toFixed(2)} kg</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50">
                        <div className="text-[10px] text-slate-400 font-medium">Đã ăn (Cám)</div>
                        <div className="font-bold text-slate-800 text-xs mt-0.5">{batch.totalFeedConsumedKg || 0} kg</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50">
                        <div className="text-[10px] text-slate-400 font-medium">Tổng chi phí</div>
                        <div className="font-bold text-red-600 text-xs mt-0.5 truncate">{((batch.totalExpense || 0) / 1000000).toFixed(1)} Tr</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between text-xs text-green-700 font-bold border-t border-slate-50">
                    <span>Xem chi tiết lứa gà</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Financial Quick Chart */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Phân Bổ Chi Phí & Doanh Thu Dự Tính (Triệu VNĐ)</span>
          </div>
          <button onClick={() => setActiveTab('finances')} className="text-xs text-green-700 font-bold hover:underline">
            Sổ thu chi
          </button>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: any) => [`${value} Triệu VNĐ`, 'Giá trị']} />
              <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
