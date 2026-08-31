
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  BarChart3, 
  FileText, 
  Plus, 
  Filter, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Transaction, EXPENSE_CATEGORIES_INFO, INCOME_CATEGORIES_INFO } from 'farmgo-shared';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const FinanceView: React.FC = () => {
  const { currentFarm, activeBatches, setIsQuickActionOpen, setIsPdfModalOpen } = useApp();
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [loading, setLoading] = useState(false);

  const loadFinances = async () => {
    if (!currentFarm) return;
    try {
      setLoading(true);
      const [sum, txs] = await Promise.all([
        api.getFinancialSummary({ farmId: currentFarm.id }),
        api.getTransactions({ farmId: currentFarm.id })
      ]);
      setSummary(sum);
      setTransactions(txs);
    } catch (err: any) {
      console.error('Error loading finances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinances();
  }, [currentFarm]);

  const filteredTxs = transactions.filter(t => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    return true;
  });

  const pieData = summary?.expenseByCategory?.map((item: any) => ({
    name: item.label,
    value: item.amount,
    color: item.color
  })) || [];

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</div>
          <div className="text-xl font-black text-green-700 mt-1 truncate">
            {((summary?.totalIncome || 0) / 1000000).toFixed(1)} Tr
          </div>
          <div className="text-[10px] text-green-600 font-semibold mt-0.5">Tiền bán gà & phụ phẩm</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Chi Phí</div>
          <div className="text-xl font-black text-red-600 mt-1 truncate">
            {((summary?.totalExpense || 0) / 1000000).toFixed(1)} Tr
          </div>
          <div className="text-[10px] text-red-500 font-semibold mt-0.5">Giống, cám, vaccine, điện</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lợi Nhuận Ròng</div>
          <div className={`text-xl font-black mt-1 truncate ${(summary?.netProfit || 0) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {((summary?.netProfit || 0) / 1000000).toFixed(1)} Tr
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Thu nhập sau khấu trừ</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Suất ROI</div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {summary?.roiPercent || 32}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hiệu quả vốn đầu tư</div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tất cả ({transactions.length})
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedType === 'income' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Thu nhập
          </button>
          <button
            onClick={() => setSelectedType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedType === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Chi phí
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">Xuất Báo Cáo PDF</span>
          </button>
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-green-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ghi Thu Chi</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Pie chart expense */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-red-500" />
            <span>Cơ Cấu Chi Phí Chăn Nuôi (%)</span>
          </h4>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#16a34a'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} đ`, 'Chi phí']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {summary?.expenseByCategory?.map((item: any) => (
              <div key={item.label} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700 truncate">{item.label}</span>
                <span className="font-bold text-slate-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Cashflow Bar Chart */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Xu Hướng Dòng Tiền Thu - Chi</span>
          </h4>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString('vi-VN')} đ`, 'Số tiền']} />
                <Bar dataKey="income" name="Doanh Thu" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi Phí" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 text-xs text-blue-900 border border-blue-200">
            💡 <b>Nhận xét dòng tiền:</b> Chi phí tập trung 70% vào tháng đầu tiên (tiền giống + cám úm). Lợi nhuận tăng mạnh khi xuất chuồng.
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span>Sổ Nhật Ký Thu Chi ({filteredTxs.length} giao dịch)</span>
        </h4>

        <div className="space-y-2">
          {filteredTxs.map(t => (
            <div key={t.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                  t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {t.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{t.categoryName}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t.notes || 'Không có ghi chú'} • {t.payerReceiverName || 'Tiền mặt'}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.date}</div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-black text-sm">
                <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
