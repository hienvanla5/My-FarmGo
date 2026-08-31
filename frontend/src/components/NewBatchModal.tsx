
import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Calendar, Feather, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { VIETNAMESE_CHICKEN_BREEDS, STANDARD_VACCINE_LIBRARY } from 'farmgo-shared';
import confetti from 'canvas-confetti';

export const NewBatchModal: React.FC = () => {
  const { 
    isNewBatchModalOpen, 
    setIsNewBatchModalOpen, 
    currentFarm, 
    user,
    activeBatches,
    refreshData, 
    showToast,
    setIsSubscriptionModalOpen
  } = useApp();

  const [breedId, setBreedId] = useState<string>('ga_ri_lai');
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [unitPrice, setUnitPrice] = useState<number>(14000);
  const [supplierName, setSupplierName] = useState<string>('Trại giống Dabaco Miền Bắc');
  const [supplierPhone, setSupplierPhone] = useState<string>('0912345678');
  const [notes, setNotes] = useState<string>('Gà giống khỏe, lông bông, màng chân khô bóng.');
  const [submitting, setSubmitting] = useState(false);

  if (!isNewBatchModalOpen || !currentFarm) return null;

  const selectedBreed = VIETNAMESE_CHICKEN_BREEDS.find(b => b.id === breedId) || VIETNAMESE_CHICKEN_BREEDS[0];

  // Compute expected harvest date
  const harvestDate = new Date(new Date(startDate).getTime() + (selectedBreed.standardGrowthDays || 105) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createBatch({
        farmId: currentFarm.id,
        name: name || `Lứa ${selectedBreed.name} #${activeBatches.length + 1}`,
        breedId: selectedBreed.id,
        initialQuantity: Number(quantity),
        startDate,
        expectedHarvestDate: harvestDate,
        initialWeightGrams: 40,
        supplierName,
        supplierPhone,
        unitPricePerChic: Number(unitPrice),
        notes
      });

      await refreshData();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast('Tạo lứa nuôi mới & tạo tự động lịch vaccine thành công!', 'success');
      setIsNewBatchModalOpen(false);
    } catch (err: any) {
      if (err.message?.includes('nâng cấp')) {
        setIsSubscriptionModalOpen(true);
      }
      showToast(err.message || 'Lỗi tạo lứa nuôi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-green-700 to-emerald-600 text-white">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>🐣</span>
              <span>Tạo Lứa Nuôi Mới & Lên Lịch Tự Động</span>
            </h3>
            <p className="text-xs text-green-100 mt-0.5">Trang trại: <b>{currentFarm.name}</b></p>
          </div>
          <button 
            onClick={() => setIsNewBatchModalOpen(false)}
            className="p-1.5 rounded-full text-green-100 hover:text-white hover:bg-green-800/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Step 1: Breed Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-green-600" />
              <span>1. Chọn Giống Gà Nuôi</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
              {VIETNAMESE_CHICKEN_BREEDS.map(breed => (
                <div
                  key={breed.id}
                  onClick={() => setBreedId(breed.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                    breed.id === breedId
                      ? 'border-green-600 bg-green-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <span className="text-2xl mt-0.5">🐔</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                      <span className="truncate">{breed.name}</span>
                      <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-semibold ml-1">{breed.standardGrowthDays} ngày</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{breed.description}</p>
                    <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-2">
                      <span>Mục tiêu: <b>{breed.standardMarketWeightKg} kg</b></span>
                      <span>FCR chuẩn: <b>{breed.targetFCR}</b></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Batch Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên lứa nuôi (Tùy chọn)</label>
              <input
                type="text"
                placeholder={`Lứa ${selectedBreed.name} #${activeBatches.length + 1}`}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng con giống *</label>
              <input
                type="number"
                min="10"
                max="50000"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu vào chuồng (Ngày tuổi 1)</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giá mua giống (đ/con)</label>
              <input
                type="number"
                step="500"
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-amber-700 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Tổng tiền con giống: <b>{((quantity || 0) * (unitPrice || 0)).toLocaleString('vi-VN')} đ</b></p>
            </div>
          </div>

          {/* Supplier info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nguồn gốc con giống (Trại / Lò ấp)</label>
              <input
                type="text"
                placeholder="VD: Trại Giống Dabaco, HTX Sơn Tây"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ lò giống</label>
              <input
                type="tel"
                placeholder="0912345678"
                value={supplierPhone}
                onChange={e => setSupplierPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
              />
            </div>
          </div>

          {/* Step 3: Automated Vaccine Schedule Live Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Lịch Tiêm Vaccine Chuẩn Tự Động ({STANDARD_VACCINE_LIBRARY.length} mũi phòng)</span>
              </div>
              <span className="text-[11px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">Tự động kích hoạt</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {STANDARD_VACCINE_LIBRARY.map((v, i) => {
                const scheduledDate = new Date(new Date(startDate).getTime() + v.recommendedAgeDaysStart * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN');
                return (
                  <div key={v.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <div>
                        <span className="font-semibold text-slate-800">{v.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({v.applicationMethodName})</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">{scheduledDate} (Ngày {v.recommendedAgeDaysStart})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsNewBatchModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-green-600/30 flex items-center gap-2"
            >
              <span>{submitting ? 'Đang khởi tạo...' : 'Xác Nhận Vào Đàn Ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
