
import React, { useState } from 'react';
import { X, Building2, Plus, CheckCircle, MapPin, Users, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Farm } from 'farmgo-shared';

export const FarmManagementModal: React.FC = () => {
  const { 
    isFarmModalOpen, 
    setIsFarmModalOpen, 
    farms, 
    currentFarm, 
    switchFarm, 
    user, 
    refreshData, 
    showToast,
    setIsSubscriptionModalOpen
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('Sơn Tây');
  const [capacity, setCapacity] = useState(2000);
  const [submitting, setSubmitting] = useState(false);

  if (!isFarmModalOpen) return null;

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createFarm({
        name,
        address,
        province,
        district,
        capacityChickens: Number(capacity)
      });
      await refreshData();
      showToast('Đã thêm cơ sở trang trại mới thành công!', 'success');
      setIsAdding(false);
      setName('');
      setAddress('');
    } catch (err: any) {
      if (err.message?.includes('nâng cấp')) {
        setIsSubscriptionModalOpen(true);
      }
      showToast(err.message || 'Lỗi thêm trang trại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <span>Quản Lý Các Khu Chuồng & Trang Trại</span>
          </div>
          <button onClick={() => setIsFarmModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isAdding ? (
            <>
              <div className="space-y-2.5">
                {farms.map((f: Farm) => (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                      f.id === currentFarm?.id
                        ? 'border-green-600 bg-green-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        🏡
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                          <span className="truncate">{f.name}</span>
                          {f.id === currentFarm?.id && (
                            <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">Đang chọn</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{f.address}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Quy mô: <b>{f.capacityChickens.toLocaleString('vi-VN')} con</b>
                        </div>
                      </div>
                    </div>

                    {f.id !== currentFarm?.id && (
                      <button
                        onClick={() => switchFarm(f.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-green-600 hover:text-white text-slate-700 text-xs font-bold transition flex-shrink-0"
                      >
                        Chọn trại này
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-green-600 text-green-700 hover:bg-green-50 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Khu Chuồng / Trang Trại Mới</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreateFarm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Trang Trại / Khu Chuồng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khu Chuồng 3 - Trại Đồi Mía"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ chi tiết (Thôn, Xã, Huyện) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thôn 2, Xã Đường Lâm, Thị xã Sơn Tây"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tỉnh / Thành Phố</label>
                  <input
                    type="text"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sức chứa tối đa (con)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-green-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md"
                >
                  {submitting ? 'Đang lưu...' : 'Tạo Trang Trại'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
