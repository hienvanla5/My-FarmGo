
import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Scale, 
  Calendar, 
  HelpCircle, 
  Feather, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MarketPriceItem, ChickenBreed } from 'farmgo-shared';

export const AiAdvisorView: React.FC = () => {
  const { currentFarm, activeBatches, setSelectedBatchId } = useApp();
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Chào Bác! Tôi là **Trợ lý Chuyên gia Chăn nuôi FarmGo**. Bác đang cần hỗ trợ về lịch tiêm phòng, định mức cám FCR, chẩn đoán bệnh gà hay dự báo ngày xuất bán tối ưu nhất ạ?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Market prices & Breeds
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [breeds, setBreeds] = useState<ChickenBreed[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<ChickenBreed | null>(null);

  // Harvest prediction
  const [harvestPrediction, setHarvestPrediction] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchState] = useState<string>(activeBatches[0]?.id || '');

  const loadData = async () => {
    try {
      const [p, b] = await Promise.all([
        api.getMarketPrices(),
        api.getBreeds()
      ]);
      setPrices(p);
      setBreeds(b);
      setSelectedBreed(b[0] || null);

      if (selectedBatchId) {
        const h = await api.getOptimalHarvest(selectedBatchId);
        setHarvestPrediction(h);
      }
    } catch (err) {
      console.error('Error loading AI data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatchId]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: textToSend, time: userTime }]);
    if (!customText) setInputMsg('');

    try {
      setIsSending(true);
      const res = await api.askAi(textToSend, {
        batchId: selectedBatchId,
        farmId: currentFarm?.id
      });

      const aiTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { sender: 'ai', text: res.reply, time: aiTime }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Xin lỗi Bác, hiện tại kết nối AI đang bận. Bác thử lại sau giây lát nhé!', time: 'Vừa xong' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {/* 1. Golden Harvest Prediction Card */}
      {harvestPrediction && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <h3 className="font-bold text-sm sm:text-base">Dự Báo "Thời Điểm Vàng" Xuất Bán (AI Optimization)</h3>
            </div>
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchState(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-bold border border-white/30 outline-none"
            >
              {activeBatches.map(b => (
                <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] text-amber-200">Trọng lượng mục tiêu</div>
              <div className="font-black text-lg text-yellow-300 mt-0.5">{harvestPrediction.targetWeightKg} kg/con</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] text-amber-200">Ngày xuất tối ưu</div>
              <div className="font-black text-sm sm:text-base mt-0.5">{harvestPrediction.recommendedHarvestDate}</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] text-amber-200">Doanh thu dự tính</div>
              <div className="font-black text-sm sm:text-base mt-0.5">{((harvestPrediction.estimatedRevenue || 0) / 1000000).toFixed(1)} Tr</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] text-amber-200">Lợi nhuận ròng</div>
              <div className="font-black text-lg text-emerald-300 mt-0.5">+{((harvestPrediction.estimatedNetProfit || 0) / 1000000).toFixed(1)} Tr</div>
            </div>
          </div>

          <p className="text-xs text-amber-100 bg-black/20 p-2.5 rounded-xl leading-relaxed">
            💡 <b>Khuyến nghị AI:</b> {harvestPrediction.analysis}
          </p>
        </div>
      )}

      {/* 2. Interactive AI Chatbot */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Trợ Lý AI Chuyên Gia Chăn Nuôi</h4>
              <p className="text-[10px] text-green-700 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>Trực tuyến 24/7 • Chuyên sâu gà Việt Nam</span>
              </p>
            </div>
          </div>
        </div>

        {/* Chat message box */}
        <div className="space-y-3 max-h-80 overflow-y-auto p-2 bg-slate-50 rounded-2xl">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-none shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm whitespace-pre-line'
              }`}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-green-600" />
              <span>Chuyên gia AI đang phân tích dữ liệu đàn gà...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Phân tích FCR lứa gà đang nuôi',
            'Gà bị đi ngoài phân sáp máu tươi',
            'Kỹ thuật úm gà con mùa lạnh',
            'Cập nhật giá gà thị trường hôm nay'
          ].map(chip => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] bg-slate-100 hover:bg-green-50 hover:text-green-700 text-slate-700 font-semibold px-2.5 py-1 rounded-full border border-slate-200 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Hỏi chuyên gia thú y về triệu chứng bệnh, cám, vaccine..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isSending || !inputMsg.trim()}
            className="p-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Live Market Prices Table */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>Bảng Giá Thị Trường Gia Cầm 3 Miền (Cập nhật hôm nay)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prices.map(item => (
            <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{item.region}</span>
                <div className="font-bold text-slate-800 mt-0.5">{item.productName}</div>
                <div className="text-[11px] text-slate-500">
                  {item.minPrice.toLocaleString('vi-VN')} - {item.maxPrice.toLocaleString('vi-VN')} đ/{item.unit}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black text-sm text-green-700">
                  {item.avgPrice.toLocaleString('vi-VN')} đ
                </div>
                <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                  +{item.changePercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
