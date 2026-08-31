
import React, { useState } from 'react';
import { Plus, Search, Filter, Layers, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Batch } from 'farmgo-shared';

export const BatchListView: React.FC = () => {
  const { batches, setSelectedBatchId, setIsNewBatchModalOpen } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = batches.filter((b: Batch) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()) && !b.breedName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm lứa gà, giống gà..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Filters and Add button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Tất cả ({batches.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterStatus === 'active' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Đang nuôi
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterStatus === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Đã bán
            </button>
          </div>

          <button
            onClick={() => setIsNewBatchModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-green-600/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Vào Lứa Mới</span>
          </button>
        </div>
      </div>

      {/* Batch Cards Grid */}
      {filteredBatches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center">
          <div className="text-4xl mb-2">🐔</div>
          <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy lứa nuôi nào</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Hãy thay đổi bộ lọc hoặc tạo lứa nuôi gà mới.</p>
          <button
            onClick={() => setIsNewBatchModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-md"
          >
            + Tạo Lứa Nuôi Mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBatches.map((batch: Batch) => {
            const isCompleted = batch.status === 'completed';
            const totalDays = 105;
            const agePercent = Math.min(100, Math.round(((batch.ageInDays || 1) / totalDays) * 100));

            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`p-4 rounded-2xl bg-white border shadow-sm transition cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isCompleted ? 'border-slate-200 bg-slate-50/60 opacity-90' : 'border-slate-200 hover:border-green-500'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                          {batch.breedName}
                        </span>
                        {isCompleted ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã xuất bán</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Đang nuôi</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5 line-clamp-1">{batch.name}</h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-black text-slate-800">
                        {batch.currentQuantity.toLocaleString('vi-VN')}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">con</span>
                      </div>
                      <div className="text-[10px] text-green-700 font-bold">
                        Tỷ lệ sống: {batch.survivalRate}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (Age) */}
                  {!isCompleted && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Ngày tuổi: <b>{batch.ageInDays} ngày</b></span>
                        <span className="text-slate-400">Dự kiến: {batch.expectedHarvestDate}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          style={{ width: `${agePercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3 Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-medium">Bình quân</div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">
                        {((batch.currentAvgWeightGrams || 500) / 1000).toFixed(2)} kg
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-medium">FCR</div>
                      <div className="font-bold text-amber-700 text-xs mt-0.5">
                        {batch.currentFCR || 2.6}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 font-medium">{isCompleted ? 'Lợi nhuận' : 'Chi phí'}</div>
                      <div className={`font-bold text-xs mt-0.5 truncate ${isCompleted ? 'text-green-700' : 'text-red-600'}`}>
                        {isCompleted
                          ? `+${((batch.netProfit || 0) / 1000000).toFixed(1)} Tr`
                          : `${((batch.totalExpense || 0) / 1000000).toFixed(1)} Tr`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-green-700 font-bold border-t border-slate-50">
                  <span>Quản lý chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
