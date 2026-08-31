
import React from 'react';
import { 
  Home, 
  Layers, 
  Syringe, 
  Wheat, 
  DollarSign, 
  HeartPulse, 
  Bot, 
  Plus
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsQuickActionOpen,
    vaccineAlerts,
    withdrawalAlerts
  } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'batches', label: 'Lứa gà', icon: Layers },
    { id: 'vaccines', label: 'Vaccine', icon: Syringe, badge: vaccineAlerts.dueToday.length + vaccineAlerts.overdue.length },
    { id: 'feed', label: 'Cám & FCR', icon: Wheat },
    { id: 'finances', label: 'Thu chi', icon: DollarSign },
    { id: 'health', label: 'Sức khỏe', icon: HeartPulse, badge: withdrawalAlerts.length },
    { id: 'ai', label: 'Trợ lý AI', icon: Bot }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 3).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition touch-target relative ${
                isActive ? 'text-green-700 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Center 1-Tap Quick Action Button */}
        <button
          onClick={() => setIsQuickActionOpen(true)}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-green-600 to-emerald-500 text-white w-12 h-12 rounded-full shadow-lg shadow-green-600/30 hover:scale-110 active:scale-95 transition-transform"
          title="Thao tác nhanh 1 chạm"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {navItems.slice(3, 6).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition touch-target relative ${
                isActive ? 'text-green-700 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* AI item */}
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition touch-target relative ${
            activeTab === 'ai' ? 'text-amber-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className={`w-5 h-5 ${activeTab === 'ai' ? 'stroke-[2.5px] text-amber-600' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">AI</span>
        </button>
      </div>
    </div>
  );
};
