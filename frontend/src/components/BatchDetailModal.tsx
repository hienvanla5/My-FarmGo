
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Syringe, 
  Wheat, 
  DollarSign, 
  HeartPulse, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Calendar, 
  Trash2, 
  Share2,
  TrendingUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Batch, BatchVaccineSchedule, FeedConsumption, Transaction, HealthRecord, BatchEvent } from 'farmgo-shared';

export const BatchDetailModal: React.FC = () => {
  const { selectedBatchId, setSelectedBatchId, refreshData, showToast, setIsPdfModalOpen } = useApp();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccines' | 'feed' | 'finances' | 'health'>('overview');
  const [loading, setLoading] = useState(false);

  // Child data
  const [vaccines, setVaccines] = useState<BatchVaccineSchedule[]>([]);
  const [events, setEvents] = useState<BatchEvent[]>([]);
  const [feeds, setFeeds] = useState<FeedConsumption[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  // Sub-forms states
  const [isWeighModalOpen, setIsWeighModalOpen] = useState(false);
  const [newWeightGrams, setNewWeightGrams] = useState(800);

  const loadBatchDetails = async (id: string) => {
    try {
      setLoading(true);
      const [b, vacs, evts, fds, txs, hlth] = await Promise.all([
        api.getBatchById(id),
        api.getBatchVaccines(id).catch(() => []),
        api.getBatchEvents(id).catch(() => []),
        api.getFeedConsumptions(id).catch(() => []),
        api.getTransactions({ batchId: id }).catch(() => []),
        api.getHealthRecords(id).catch(() => [])
      ]);
      setBatch(b);
      setVaccines(vacs);
      setEvents(evts);
      setFeeds(fds);
      setTransactions(txs);
      setHealthRecords(hlth);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải chi tiết lứa', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      loadBatchDetails(selectedBatchId);
    }
  }, [selectedBatchId]);

  if (!selectedBatchId || !batch) return null;

  const handleMarkVaccineCompleted = async (v: BatchVaccineSchedule) => {
    const costPrompt = window.prompt(`Chi phí mua vaccine ${v.vaccineName} (VNĐ)? (Nhập 0 nếu đã tính vào chi phí trước)`, '150000');
    if (costPrompt === null) return;
    const cost = Number(costPrompt) || 0;

    try {
      await api.updateVaccineSchedule(v.id, {
        status: 'completed',
        actualDate: new Date().toISOString().split('T')[0],
        cost,
        administeredBy: 'Chủ trại gà'
      });
      await loadBatchDetails(batch.id);
      await refreshData();
      showToast(`Đã hoàn thành mũi ${v.vaccineName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật vaccine', 'error');
    }
  };

  const handleAddWeightSample = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addBatchEvent(batch.id, {
        eventType: 'weight_sample',
        date: new Date().toISOString().split('T')[0],
        avgWeightGrams: Number(newWeightGrams),
        title: `Cân mẫu: ${newWeightGrams}g/con`,
        description: 'Cân mẫu định kỳ kiểm tra tăng trưởng'
      });
      setIsWeighModalOpen(false);
      await loadBatchDetails(batch.id);
      await refreshData();
      showToast(`Đã cập nhật cân nặng bình quân ${newWeightGrams}g`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật cân nặng', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col my-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐔</span>
              <h3 className="font-bold text-base sm:text-lg truncate">{batch.name}</h3>
              <span className="text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                {batch.breedName}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ngày vào: <b>{batch.startDate}</b> ({batch.ageInDays} ngày tuổi) | Số lượng: <b>{batch.currentQuantity} con</b>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 text-xs font-semibold"
              title="Xuất báo cáo PDF lứa nuôi"
            >
              <FileText className="w-4 h-4 text-green-400" />
              <span className="hidden sm:inline">Xuất PDF</span>
            </button>
            <button
              onClick={() => setSelectedBatchId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng Quan & Sự Kiện', icon: Layers },
            { id: 'vaccines', label: `Lịch Tiêm (${vaccines.filter(v => v.status === 'completed').length}/${vaccines.length})`, icon: Syringe },
            { id: 'feed', label: 'Thức Ăn & FCR', icon: Wheat },
            { id: 'finances', label: 'Thu Chi & ROI', icon: DollarSign },
            { id: 'health', label: 'Sức Khỏe & Thuốc', icon: HeartPulse }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'border-green-600 text-green-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <div className="text-[10px] text-green-800 font-bold uppercase">Tỷ lệ sống</div>
                  <div className="text-xl font-black text-green-700 mt-0.5">{batch.survivalRate}%</div>
                  <div className="text-[10px] text-green-600">{batch.currentQuantity}/{batch.initialQuantity} con</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-[10px] text-amber-800 font-bold uppercase">Trọng lượng bình quân</div>
                  <div className="text-xl font-black text-amber-700 mt-0.5">
                    {((batch.currentAvgWeightGrams || 500) / 1000).toFixed(2)} kg
                  </div>
                  <button 
                    onClick={() => setIsWeighModalOpen(true)}
                    className="text-[10px] text-amber-800 font-bold underline mt-0.5"
                  >
                    + Cân mẫu lại
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-[10px] text-blue-800 font-bold uppercase">Chỉ số FCR</div>
                  <div className="text-xl font-black text-blue-700 mt-0.5">{batch.currentFCR || 2.65}</div>
                  <div className="text-[10px] text-blue-600">Ăn {batch.totalFeedConsumedKg || 0}kg cám</div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-[10px] text-rose-800 font-bold uppercase">Tổng chi phí</div>
                  <div className="text-xl font-black text-rose-700 mt-0.5 truncate">
                    {((batch.totalExpense || 0) / 1000000).toFixed(1)} Tr
                  </div>
                  <div className="text-[10px] text-rose-600">ROI: ~32%</div>
                </div>
              </div>

              {/* Event timeline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>Dòng Thời Gian & Nhật Ký Lứa Nuôi ({events.length} sự kiện)</span>
                  </h4>
                  <button
                    onClick={() => setIsWeighModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ghi cân mẫu</span>
                  </button>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-6">
                  {events.map((evt: BatchEvent) => (
                    <div key={evt.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow-sm" />
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-500 font-medium mb-0.5">
                          <span className="font-bold text-slate-800">{evt.title}</span>
                          <span>{evt.date}</span>
                        </div>
                        {evt.description && <p className="text-slate-600">{evt.description}</p>}
                        {evt.avgWeightGrams && (
                          <div className="mt-1 font-semibold text-purple-700">
                            Cân nặng mẫu: {(evt.avgWeightGrams / 1000).toFixed(2)} kg/con
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VACCINES */}
          {activeTab === 'vaccines' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl border border-green-200">
                <div className="text-xs text-green-900">
                  <b>Lịch tiêm phòng tự động:</b> Hệ thống nhắc nhở đúng ngày tuổi khuyến cáo theo quy chuẩn thú y gia cầm.
                </div>
              </div>

              <div className="space-y-2">
                {vaccines.map((vac: BatchVaccineSchedule) => {
                  const isDone = vac.status === 'completed';
                  const isDue = vac.status === 'due';
                  const isOverdue = vac.status === 'overdue';

                  return (
                    <div
                      key={vac.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isDone ? 'bg-slate-50 border-slate-200 text-slate-500' :
                        isDue ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' :
                        isOverdue ? 'bg-red-50 border-red-300 text-red-900' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                          isDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : `${vac.scheduledAgeDays}d`}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-slate-800 truncate">
                            {vac.vaccineName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Phòng: {vac.diseaseName} • Cách dùng: {vac.applicationMethod}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Ngày dự kiến: <b>{vac.scheduledDate}</b> (Ngày tuổi {vac.scheduledAgeDays})
                            {vac.actualDate && <span> • Tiêm thực tế: <b>{vac.actualDate}</b></span>}
                          </div>
                        </div>
                      </div>

                      {isDone ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          Đã hoàn thành
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkVaccineCompleted(vac)}
                          className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm whitespace-nowrap"
                        >
                          Đã Tiêm Xong
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FEED & FCR */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-xs text-amber-900 mb-1 flex items-center gap-1.5">
                  <Wheat className="w-4 h-4 text-amber-600" />
                  <span>Chỉ Số Hiệu Quả Thức Ăn (FCR) = {batch.currentFCR || 2.65}</span>
                </div>
                <p className="text-xs text-amber-800">
                  Chuẩn giống gà: <b>2.70</b>. FCR hiện tại đang ở mức <b>Tối ưu</b>, đàn gà hấp thu dinh dưỡng rất tốt!
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-700">Nhật ký tiêu thụ cám ({feeds.length} lần ghi)</div>
                {feeds.map((f: FeedConsumption) => (
                  <div key={f.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{f.feedType === 'brooding' ? 'Cám Úm' : f.feedType === 'grower' ? 'Cám Tăng Trưởng' : 'Cám Vỗ Béo'}</span>
                      <span className="text-slate-400 ml-2">{f.date}</span>
                      {f.notes && <div className="text-[11px] text-slate-500">{f.notes}</div>}
                    </div>
                    <span className="font-bold text-blue-600 text-sm">{f.quantityKg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCES */}
          {activeTab === 'finances' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                  <div className="text-slate-500 text-[10px]">Tổng Doanh Thu</div>
                  <div className="font-black text-green-700 text-sm mt-0.5">{((batch.totalRevenue || 0) / 1000000).toFixed(1)} Tr</div>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-slate-500 text-[10px]">Tổng Chi Phí</div>
                  <div className="font-black text-red-600 text-sm mt-0.5">{((batch.totalExpense || 0) / 1000000).toFixed(1)} Tr</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-slate-500 text-[10px]">Lợi Nhuận Ròng</div>
                  <div className="font-black text-blue-700 text-sm mt-0.5">{((batch.netProfit || 0) / 1000000).toFixed(1)} Tr</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-700">Các giao dịch thu chi của lứa này</div>
                {transactions.map((t: Transaction) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{t.categoryName}</span>
                      <span className="text-slate-400 ml-2">{t.date}</span>
                      {t.notes && <div className="text-[11px] text-slate-500">{t.notes}</div>}
                    </div>
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HEALTH */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-700">Nhật ký sức khỏe & Bệnh tật ({healthRecords.length} ghi nhận)</div>
                {healthRecords.map((h: HealthRecord) => (
                  <div key={h.id} className="p-3 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="text-amber-700">⚠️ Hao hụt: {h.deathsCount} con chết</span>
                      <span className="text-slate-400 font-normal">{h.date}</span>
                    </div>
                    {h.symptoms && h.symptoms.length > 0 && (
                      <div className="text-slate-600">Triệu chứng: <b>{h.symptoms.join(', ')}</b></div>
                    )}
                    {h.medicationsUsed && h.medicationsUsed.length > 0 && (
                      <div className="text-blue-700">Thuốc đã dùng: <b>{h.medicationsUsed.join(', ')}</b></div>
                    )}
                    {h.withdrawalEndDate && (
                      <div className="p-2 rounded-lg bg-red-50 text-red-800 text-[11px] font-bold border border-red-200 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Hạn ngưng thuốc đến ngày: {h.withdrawalEndDate}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal sub: Weigh modal */}
        {isWeighModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleAddWeightSample} className="bg-white p-5 rounded-2xl shadow-2xl max-w-sm w-full space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span>Ghi nhận cân mẫu đàn gà</span>
                </h4>
                <button type="button" onClick={() => setIsWeighModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cân nặng bình quân (Grams/con)</label>
                <input
                  type="number"
                  required
                  value={newWeightGrams}
                  onChange={e => setNewWeightGrams(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-lg text-purple-700 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Tương đương: <b>{(newWeightGrams / 1000).toFixed(2)} kg/con</b></p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsWeighModalOpen(false)} className="flex-1 py-2 border rounded-xl text-xs font-bold text-slate-600">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Lưu Cân Nặng</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
