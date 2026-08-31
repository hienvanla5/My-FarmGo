
import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Pill,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { HealthRecord, COMMON_POULTRY_DISEASES, PoultryDisease } from 'farmgo-shared';

export const HealthView: React.FC = () => {
  const { currentFarm, activeBatches, withdrawalAlerts, refreshData, showToast, setIsQuickActionOpen } = useApp();
  const [selectedDisease, setSelectedDisease] = useState<PoultryDisease | null>(null);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [allRecords, setAllRecords] = useState<(HealthRecord & { batchName: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'guide'>('alerts');

  const loadHealthData = async () => {
    try {
      const recordsPromises = activeBatches.map(async (b) => {
        const r = await api.getHealthRecords(b.id);
        return r.map((item: HealthRecord) => ({ ...item, batchName: b.name }));
      });
      const results = await Promise.all(recordsPromises);
      setAllRecords(results.flat().sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error('Error loading health data:', err);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, [activeBatches]);

  const filteredDiseases = COMMON_POULTRY_DISEASES.filter((d: PoultryDisease) => {
    if (!symptomSearch) return true;
    const q = symptomSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.symptoms.some((s: string) => s.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Warning Banner if active withdrawal */}
      {withdrawalAlerts.length > 0 && (
        <div className="p-4 rounded-3xl bg-red-600 text-white shadow-lg space-y-2 animate-pulse">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>CẢNH BÁO THỜI GIAN NGƯNG THUỐC (AN TOÀN VỆ SINH THỰC PHẨM)</span>
          </div>
          <p className="text-xs text-red-100 leading-snug">
            Đang có <b>{withdrawalAlerts.length} lứa gà</b> đang trong thời gian cách ly kháng sinh. Tuyệt đối không xuất bán gà thịt trước hạn để tránh tồn dư kháng sinh vi phạm quy định!
          </p>
          <div className="space-y-1.5 pt-1">
            {withdrawalAlerts.map(w => (
              <div key={w.batchId} className="p-2.5 rounded-xl bg-white/10 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold">{w.batchName}</div>
                  <div className="text-[11px] text-red-200">Thuốc: {w.medications.join(', ')}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-yellow-300">Còn {w.remainingDays} ngày</div>
                  <div className="text-[10px] text-red-200">An toàn sau: {w.withdrawalEndDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'alerts' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Nhật ký bệnh & Hao hụt ({allRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'guide' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Cẩm nang chẩn đoán bệnh ({COMMON_POULTRY_DISEASES.length})
          </button>
        </div>

        <button
          onClick={() => setIsQuickActionOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Báo Gà Chết / Bệnh</span>
        </button>
      </div>

      {activeTab === 'alerts' ? (
        <div className="space-y-2.5">
          {allRecords.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              Đàn gà hoàn toàn khỏe mạnh, chưa ghi nhận ca bệnh hoặc hao hụt nào.
            </div>
          ) : (
            allRecords.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {r.batchName}
                    </span>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                      ⚠️ Hao hụt: <span className="text-red-600 font-black">{r.deathsCount} con chết</span>
                      {r.cullsCount ? <span>, {r.cullsCount} con loại thải</span> : null}
                    </div>
                  </div>
                  <span className="text-slate-400 text-[11px]">{r.date}</span>
                </div>

                {r.symptoms && r.symptoms.length > 0 && (
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                    <b>Triệu chứng:</b> {r.symptoms.join(', ')}
                  </div>
                )}

                {r.medicationsUsed && r.medicationsUsed.length > 0 && (
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-between">
                    <div>
                      <b>Thuốc điều trị:</b> {r.medicationsUsed.join(', ')}
                      {r.medicationDosage && <div className="text-[10px] text-blue-700">{r.medicationDosage}</div>}
                    </div>
                    {r.withdrawalEndDate && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Hạn ngưng: {r.withdrawalEndDate}
                      </span>
                    )}
                  </div>
                )}

                {r.treatmentNotes && (
                  <div className="text-slate-500 text-[11px]">
                    <b>Ghi chú chăm sóc:</b> {r.treatmentNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search symptom */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập triệu chứng (VD: phân sáp, khò khè, mắt bọt, ngoẹo đầu)..."
              value={symptomSearch}
              onChange={e => setSymptomSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredDiseases.map((d: PoultryDisease) => (
              <div key={d.name} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>{d.name}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                    Ngưng thuốc {d.withdrawalDays} ngày
                  </span>
                </div>

                <div className="text-xs">
                  <span className="font-bold text-amber-800">Dấu hiệu nhận biết:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {d.symptoms.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1 border border-slate-100">
                  <div className="text-blue-900 leading-snug">
                    <b>Phác đồ đặc trị:</b> {d.treatmentSuggestion}
                  </div>
                  <div className="text-green-900 leading-snug pt-1">
                    <b>Phòng bệnh an toàn sinh học:</b> {d.preventiveGuide}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
