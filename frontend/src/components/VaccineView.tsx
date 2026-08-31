
import React, { useState, useEffect } from 'react';
import { 
  Syringe, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  Plus, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { BatchVaccineSchedule, VaccineDefinition, STANDARD_VACCINE_LIBRARY } from 'farmgo-shared';

export const VaccineView: React.FC = () => {
  const { activeBatches, currentFarm, refreshData, showToast, setSelectedBatchId } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'due' | 'completed' | 'library'>('all');
  const [allSchedules, setAllSchedules] = useState<(BatchVaccineSchedule & { batchName: string })[]>([]);
  const [expandedVacId, setExpandedVacId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadVaccines = async () => {
    try {
      setLoading(true);
      const schedulePromises = activeBatches.map(async b => {
        const schs = await api.getBatchVaccines(b.id);
        return schs.map(s => ({ ...s, batchName: b.name }));
      });
      const results = await Promise.all(schedulePromises);
      setAllSchedules(results.flat().sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    } catch (err: any) {
      console.error('Error loading vaccines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccines();
  }, [activeBatches]);

  const handleMarkDone = async (s: BatchVaccineSchedule) => {
    const costPrompt = window.prompt(`Chi phí mua vaccine ${s.vaccineName} (VNĐ)?`, '150000');
    if (costPrompt === null) return;
    const cost = Number(costPrompt) || 0;

    try {
      await api.updateVaccineSchedule(s.id, {
        status: 'completed',
        actualDate: new Date().toISOString().split('T')[0],
        cost,
        administeredBy: 'Chủ trại'
      });
      await loadVaccines();
      await refreshData();
      showToast(`Đã tiêm xong ${s.vaccineName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật', 'error');
    }
  };

  const filteredList = allSchedules.filter(s => {
    if (selectedFilter === 'due') return s.status === 'due' || s.status === 'overdue';
    if (selectedFilter === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* Top Filter Buttons */}
      <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tất cả lịch tiêm ({allSchedules.length})
          </button>
          <button
            onClick={() => setSelectedFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedFilter === 'due' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Đến hạn & Quá hạn ({allSchedules.filter(s => s.status === 'due' || s.status === 'overdue').length})
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedFilter === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Đã hoàn thành
          </button>
        </div>

        <button
          onClick={() => setSelectedFilter('library')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            selectedFilter === 'library' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Thư viện vaccine chuẩn VN</span>
        </button>
      </div>

      {/* Main Content */}
      {selectedFilter === 'library' ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <h3 className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Quy Trình Tiêm Phòng Vaccine Chuẩn Cho Gà Thả Vườn / Bán Công Nghiệp Việt Nam</span>
            </h3>
            <p className="text-xs text-purple-800 mt-1">
              Phác đồ được xây dựng theo khuyến cáo của Cục Thú Y & Viện Chăn Nuôi Quốc Gia, tối ưu cho điều kiện khí hậu nhiệt đới gió mùa tại Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STANDARD_VACCINE_LIBRARY.map((v, idx) => {
              const isExpanded = expandedVacId === v.id;
              return (
                <div key={v.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{v.name}</h4>
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                          {v.recommendedAgeDaysStart === v.recommendedAgeDaysEnd
                            ? `Ngày tuổi ${v.recommendedAgeDaysStart}`
                            : `Ngày tuổi ${v.recommendedAgeDaysStart} - ${v.recommendedAgeDaysEnd}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedVacId(isExpanded ? null : v.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-500">Phòng bệnh:</span> <b>{v.diseaseName}</b>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-500">Phương pháp:</span> <b>{v.applicationMethodName}</b>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                      <div><b>Liều lượng:</b> {v.defaultDose}</div>
                      <div><b>Kỹ thuật thao tác:</b> {v.notes}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
              <Syringe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Không có mũi tiêm nào trong danh mục này.
            </div>
          ) : (
            filteredList.map(s => {
              const isDone = s.status === 'completed';
              const isDue = s.status === 'due';
              const isOverdue = s.status === 'overdue';

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    isDone ? 'bg-white border-slate-200 text-slate-500' :
                    isDue ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' :
                    isOverdue ? 'bg-red-50 border-red-300 text-red-900' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      isDone ? 'bg-green-100 text-green-700' : isDue ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : `${s.scheduledAgeDays}d`}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full truncate">
                          {s.batchName}
                        </span>
                        <span className="text-[10px] text-slate-400">Ngày tuổi {s.scheduledAgeDays}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">{s.vaccineName}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Phòng: {s.diseaseName} • Cách tiêm: {s.applicationMethod}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ngày dự kiến: <b>{s.scheduledDate}</b>
                        {s.actualDate && <span> • Tiêm ngày: <b>{s.actualDate}</b></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isDone ? (
                      <span className="text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl whitespace-nowrap">
                        Đã Tiêm
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkDone(s)}
                        className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md whitespace-nowrap"
                      >
                        Đã Tiêm Xong
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
