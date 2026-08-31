
import React, { useState, useEffect } from 'react';
import { 
  Wheat, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ShoppingBag, 
  Layers, 
  Info,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { FeedPurchase, FeedConsumption, FeedStage, Batch } from 'farmgo-shared';

export const FeedView: React.FC = () => {
  const { currentFarm, activeBatches, refreshData, showToast } = useApp();
  const [inventory, setInventory] = useState<any>(null);
  const [purchases, setPurchases] = useState<FeedPurchase[]>([]);
  const [fcrAnalysis, setFcrAnalysis] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeBatches[0]?.id || '');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Form states
  const [feedType, setFeedType] = useState<FeedStage>('grower');
  const [brandName, setBrandName] = useState('Cám C.P 102 Tăng Trưởng');
  const [bagCount, setBagCount] = useState(20);
  const [kgPerBag, setKgPerBag] = useState(25);
  const [unitPricePerKg, setUnitPricePerKg] = useState(14500);
  const [supplier, setSupplier] = useState('Đại lý Thức ăn Gia súc Hòa Phát');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const loadFeedData = async () => {
    if (!currentFarm) return;
    try {
      const [inv, pcs] = await Promise.all([
        api.getFeedInventory(currentFarm.id),
        api.getFeedPurchases(currentFarm.id)
      ]);
      setInventory(inv);
      setPurchases(pcs);

      if (selectedBatchId) {
        const fcr = await api.getFcrAnalysis(selectedBatchId);
        setFcrAnalysis(fcr);
      }
    } catch (err: any) {
      console.error('Error loading feed data:', err);
    }
  };

  useEffect(() => {
    loadFeedData();
  }, [currentFarm, selectedBatchId]);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFarm) return;
    try {
      setSubmitting(true);
      await api.createFeedPurchase({
        farmId: currentFarm.id,
        batchId: selectedBatchId || undefined,
        feedType,
        brandName,
        bagCount: Number(bagCount),
        kgPerBag: Number(kgPerBag),
        unitPricePerKg: Number(unitPricePerKg),
        supplier,
        purchaseDate
      });
      setIsPurchaseModalOpen(false);
      await loadFeedData();
      await refreshData();
      showToast('Đã ghi nhận mua cám & tự động thêm vào chi phí!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi mua cám', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Inventory Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Tồn Kho Cám</div>
          <div className="text-xl font-black text-slate-800 mt-1">
            {inventory?.totalRemainingKg ? (inventory.totalRemainingKg / 25).toFixed(0) : 0} <span className="text-xs font-normal text-slate-400">bao</span>
          </div>
          <div className="text-[10px] text-green-700 font-semibold mt-0.5">
            ~{inventory?.totalRemainingKg || 0} kg cám
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cám Úm (1-21d)</div>
          <div className="text-xl font-black text-amber-700 mt-1">
            {inventory?.feedTypes?.brooding?.remainingBags || 0} <span className="text-xs font-normal text-slate-400">bao</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Còn ~{inventory?.feedTypes?.brooding?.estRemainingDays || 0} ngày ăn
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cám Tăng Trưởng</div>
          <div className="text-xl font-black text-green-700 mt-1">
            {inventory?.feedTypes?.grower?.remainingBags || 0} <span className="text-xs font-normal text-slate-400">bao</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Còn ~{inventory?.feedTypes?.grower?.estRemainingDays || 0} ngày ăn
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cám Vỗ Béo</div>
          <div className="text-xl font-black text-blue-700 mt-1">
            {inventory?.feedTypes?.finisher?.remainingBags || 0} <span className="text-xs font-normal text-slate-400">bao</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Còn ~{inventory?.feedTypes?.finisher?.estRemainingDays || 0} ngày ăn
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-700 font-medium">
          Ghi nhận các đợt nhập cám từ đại lý để quản lý tồn kho và chi phí chính xác.
        </div>
        <button
          onClick={() => setIsPurchaseModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-green-600/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Mua Thêm Cám</span>
        </button>
      </div>

      {/* FCR Analysis Section */}
      {fcrAnalysis && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Phân tích FCR & Tối ưu chi phí
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1 flex items-center gap-2">
                <span>Chỉ Số Chuyển Đổi Thức Ăn (FCR):</span>
                <span className="text-amber-700 font-black text-lg">{fcrAnalysis.currentFCR}</span>
                <span className="text-xs font-normal text-slate-500">(Chuẩn giống: {fcrAnalysis.targetFCR})</span>
              </h3>
            </div>

            {/* Select batch to analyze */}
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 outline-none"
            >
              {activeBatches.map((b: Batch) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-amber-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{fcrAnalysis.statusText}</span>
            </div>
            <div className="space-y-1 pl-5 text-slate-700">
              {fcrAnalysis.suggestions.map((s: string, idx: number) => (
                <div key={idx} className="leading-snug">• {s}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed Purchase History */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-green-600" />
          <span>Lịch Sử Mua Cám ({purchases.length} lần nhập)</span>
        </h4>

        <div className="space-y-2">
          {purchases.map((p: FeedPurchase) => (
            <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">{p.brandName}</div>
                <div className="text-[11px] text-slate-500">
                  {p.bagCount} bao ({p.totalKg} kg) • Đơn giá: {p.unitPricePerKg.toLocaleString('vi-VN')} đ/kg • Đại lý: {p.supplier}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ngày mua: {p.purchaseDate}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black text-sm text-red-600">
                  -{p.totalPrice.toLocaleString('vi-VN')} đ
                </div>
                <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
                  Đã nhập kho
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleCreatePurchase} className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-5 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-green-600" />
                <span>Ghi Nhận Mua Thức Ăn Cám</span>
              </h4>
              <button type="button" onClick={() => setIsPurchaseModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại cám *</label>
              <select
                value={feedType}
                onChange={e => setFeedType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none"
              >
                <option value="brooding">Cám Úm (1 - 21 ngày tuổi)</option>
                <option value="grower">Cám Tăng Trưởng (22 - 60 ngày tuổi)</option>
                <option value="finisher">Cám Vỗ Béo (61 ngày - Xuất chuồng)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên nhãn hiệu cám / Mã sản phẩm</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng bao *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bagCount}
                  onChange={e => setBagCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-green-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kg / Bao</label>
                <input
                  type="number"
                  value={kgPerBag}
                  onChange={e => setKgPerBag(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá (đ/kg)</label>
                <input
                  type="number"
                  step="100"
                  value={unitPricePerKg}
                  onChange={e => setUnitPricePerKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày mua</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp / Đại lý</label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 flex justify-between">
              <span>Tổng tiền thanh toán:</span>
              <span className="text-red-600 font-black text-sm">
                {(bagCount * kgPerBag * unitPricePerKg).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-slate-600">Hủy</button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold shadow-md">
                {submitting ? 'Đang lưu...' : 'Lưu & Nhập Kho'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
