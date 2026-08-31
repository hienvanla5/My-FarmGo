
import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  HeartPulse, 
  Wheat, 
  Syringe, 
  Scale, 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { EXPENSE_CATEGORIES_INFO, INCOME_CATEGORIES_INFO } from 'farmgo-shared';

export const QuickActionModal: React.FC = () => {
  const { 
    isQuickActionOpen, 
    setIsQuickActionOpen, 
    currentFarm, 
    activeBatches, 
    refreshData, 
    showToast,
    setIsNewBatchModalOpen
  } = useApp();

  const [activeForm, setActiveForm] = useState<'menu' | 'expense' | 'income' | 'mortality' | 'feed' | 'weight'>('menu');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeBatches[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('feed');
  const [incomeCategory, setIncomeCategory] = useState<string>('sell_chicken_meat');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  // Mortality states
  const [deathCount, setDeathCount] = useState<number>(1);
  const [symptom, setSymptom] = useState<string>('');

  // Feed states
  const [feedKg, setFeedKg] = useState<number>(50);
  const [feedType, setFeedType] = useState<'brooding' | 'grower' | 'finisher'>('grower');

  // Weight states
  const [sampleWeightGrams, setSampleWeightGrams] = useState<number>(1000);

  if (!isQuickActionOpen) return null;

  const handleClose = () => {
    setIsQuickActionOpen(false);
    setActiveForm('menu');
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarm) return;
    try {
      setSubmitting(true);
      await api.createTransaction({
        farmId: currentFarm.id,
        batchId: selectedBatchId || undefined,
        type: 'expense',
        category,
        amount: Number(amount),
        date,
        paymentMethod: 'cash',
        notes
      });
      await refreshData();
      showToast('Đã ghi chi phí thành công!', 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi ghi chi phí', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarm) return;
    try {
      setSubmitting(true);
      await api.createTransaction({
        farmId: currentFarm.id,
        batchId: selectedBatchId || undefined,
        type: 'income',
        category: incomeCategory,
        amount: Number(amount),
        date,
        paymentMethod: 'bank_transfer',
        notes
      });
      await refreshData();
      showToast('Đã ghi doanh thu thành công!', 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi ghi thu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    try {
      setSubmitting(true);
      await api.createHealthRecord(selectedBatchId, {
        date,
        deathsCount: deathCount,
        symptoms: symptom ? [symptom] : [],
        treatmentNotes: notes
      });
      await refreshData();
      showToast(`Đã ghi nhận ${deathCount} con hao hụt`, 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi ghi nhận', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFeedConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    try {
      setSubmitting(true);
      await api.logFeedConsumption(selectedBatchId, {
        date,
        feedType,
        quantityKg: Number(feedKg),
        notes
      });
      await refreshData();
      showToast(`Đã ghi nhận ${feedKg}kg cám tiêu thụ`, 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi ghi cám', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWeightSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    try {
      setSubmitting(true);
      await api.addBatchEvent(selectedBatchId, {
        eventType: 'weight_sample',
        date,
        avgWeightGrams: Number(sampleWeightGrams),
        title: `Cân mẫu: ${sampleWeightGrams}g/con`,
        description: notes || 'Cân mẫu ngẫu nhiên theo dõi tăng trưởng'
      });
      await refreshData();
      showToast(`Đã cập nhật trọng lượng bình quân: ${sampleWeightGrams}g`, 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cân mẫu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="font-bold text-base text-slate-800">
            {activeForm === 'menu' && '⚡ Thao tác nhanh 1 chạm'}
            {activeForm === 'expense' && '💸 Ghi chép Khoản Chi'}
            {activeForm === 'income' && '💰 Ghi chép Thu Tiền'}
            {activeForm === 'mortality' && '⚠️ Ghi số Gà chết / Hao hụt'}
            {activeForm === 'feed' && '🌾 Ghi nhận Cám ăn hôm nay'}
            {activeForm === 'weight' && '⚖️ Cân mẫu theo dõi Tăng trọng'}
          </div>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {activeForm === 'menu' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveForm('expense')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition text-center"
              >
                <ArrowDownCircle className="w-8 h-8 text-red-500 mb-1.5" />
                <span className="font-bold text-sm">Thêm Chi Phí</span>
                <span className="text-[11px] text-red-500 mt-0.5">Tiền cám, giống, thuốc...</span>
              </button>

              <button
                onClick={() => setActiveForm('income')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 transition text-center"
              >
                <ArrowUpCircle className="w-8 h-8 text-green-500 mb-1.5" />
                <span className="font-bold text-sm">Ghi Doanh Thu</span>
                <span className="text-[11px] text-green-500 mt-0.5">Bán gà, bán trứng, phân...</span>
              </button>

              <button
                onClick={() => setActiveForm('mortality')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition text-center"
              >
                <HeartPulse className="w-8 h-8 text-amber-600 mb-1.5" />
                <span className="font-bold text-sm">Gà Chết / Hao Hụt</span>
                <span className="text-[11px] text-amber-600 mt-0.5">Cập nhật số lượng đàn</span>
              </button>

              <button
                onClick={() => setActiveForm('feed')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition text-center"
              >
                <Wheat className="w-8 h-8 text-blue-500 mb-1.5" />
                <span className="font-bold text-sm">Ghi Cám Ăn</span>
                <span className="text-[11px] text-blue-500 mt-0.5">Định mức & tính FCR</span>
              </button>

              <button
                onClick={() => setActiveForm('weight')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 transition text-center"
              >
                <Scale className="w-8 h-8 text-purple-500 mb-1.5" />
                <span className="font-bold text-sm">Cân Mẫu Gà</span>
                <span className="text-[11px] text-purple-500 mt-0.5">Theo dõi trọng lượng</span>
              </button>

              <button
                onClick={() => {
                  handleClose();
                  setIsNewBatchModalOpen(true);
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition text-center"
              >
                <PlusCircle className="w-8 h-8 text-emerald-600 mb-1.5" />
                <span className="font-bold text-sm">Vào Lứa Nuôi Mới</span>
                <span className="text-[11px] text-emerald-600 mt-0.5">Tự động sinh vaccine</span>
              </button>
            </div>
          )}

          {/* Form: Expense */}
          {activeForm === 'expense' && (
            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lứa gà áp dụng</label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Toàn trang trại (Không chọn lứa) --</option>
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục chi phí</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {Object.entries(EXPENSE_CATEGORIES_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 500000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-red-600 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày chi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    placeholder="VD: Mua 1 bao cám úm"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveForm('menu')} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100">Quay lại</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">
                  {submitting ? 'Đang lưu...' : 'Lưu Khoản Chi'}
                </button>
              </div>
            </form>
          )}

          {/* Form: Income */}
          {activeForm === 'income' && (
            <form onSubmit={handleCreateIncome} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lứa gà áp dụng</label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Toàn trang trại (Không chọn lứa) --</option>
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nguồn thu nhập</label>
                <select
                  value={incomeCategory}
                  onChange={e => setIncomeCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {Object.entries(INCOME_CATEGORIES_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền thu về (VNĐ) *</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 15000000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-green-600 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày thu</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú</label>
                  <input
                    type="text"
                    placeholder="VD: Xuất bán 200 con gà thịt"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveForm('menu')} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100">Quay lại</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md">
                  {submitting ? 'Đang lưu...' : 'Lưu Doanh Thu'}
                </button>
              </div>
            </form>
          )}

          {/* Form: Mortality */}
          {activeForm === 'mortality' && (
            <form onSubmit={handleCreateMortality} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Lứa gà *</label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (Hiện có {b.currentQuantity} con)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số con chết / loại thải *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deathCount}
                  onChange={e => setDeathCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-amber-700 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Triệu chứng nghi vấn</label>
                <select
                  value={symptom}
                  onChange={e => setSymptom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                >
                  <option value="">-- Chọn triệu chứng hoặc không rõ --</option>
                  <option value="Phân sáp vàng, lẫn máu (Nghi Cầu trùng)">Phân sáp vàng, lẫn máu (Nghi Cầu trùng)</option>
                  <option value="Khò khè, vẩy mỏ ban đêm (Nghi Hen CRD)">Khò khè, vẩy mỏ ban đêm (Nghi Hen CRD)</option>
                  <option value="Phân trắng như vôi, cắn mổ hậu môn (Nghi Gumboro)">Phân trắng như vôi, cắn mổ hậu môn (Nghi Gumboro)</option>
                  <option value="Ngoẹo đầu, khó thở (Nghi Newcastle)">Ngoẹo đầu, khó thở (Nghi Newcastle)</option>
                  <option value="Hao hụt tự nhiên do yếu chân">Hao hụt tự nhiên do yếu chân</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveForm('menu')} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100">Quay lại</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md">
                  {submitting ? 'Đang lưu...' : 'Ghi Nhận Hao Hụt'}
                </button>
              </div>
            </form>
          )}

          {/* Form: Feed */}
          {activeForm === 'feed' && (
            <form onSubmit={handleCreateFeedConsumption} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Lứa gà *</label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại cám</label>
                <select
                  value={feedType}
                  onChange={e => setFeedType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium outline-none"
                >
                  <option value="brooding">Cám Úm (1 - 21 ngày tuổi)</option>
                  <option value="grower">Cám Tăng Trưởng (22 - 60 ngày tuổi)</option>
                  <option value="finisher">Cám Vỗ Béo (61 ngày - Xuất chuồng)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lượng cám đã cho ăn (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={feedKg}
                  onChange={e => setFeedKg(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-blue-600 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveForm('menu')} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100">Quay lại</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md">
                  {submitting ? 'Đang lưu...' : 'Ghi Nhận Lượng Cám'}
                </button>
              </div>
            </form>
          )}

          {/* Form: Weight */}
          {activeForm === 'weight' && (
            <form onSubmit={handleCreateWeightSample} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Lứa gà *</label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trọng lượng bình quân (Grams/con) *</label>
                <input
                  type="number"
                  required
                  value={sampleWeightGrams}
                  onChange={e => setSampleWeightGrams(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-lg font-bold text-purple-700 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Tương đương: <b>{(sampleWeightGrams / 1000).toFixed(2)} kg/con</b></p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setActiveForm('menu')} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100">Quay lại</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md">
                  {submitting ? 'Đang lưu...' : 'Lưu Cân Mẫu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
