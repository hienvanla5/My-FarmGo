
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { BatchListView } from './components/BatchListView';
import { VaccineView } from './components/VaccineView';
import { FeedView } from './components/FeedView';
import { FinanceView } from './components/FinanceView';
import { HealthView } from './components/HealthView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { QuickActionModal } from './components/QuickActionModal';
import { NewBatchModal } from './components/NewBatchModal';
import { BatchDetailModal } from './components/BatchDetailModal';
import { FarmManagementModal } from './components/FarmManagementModal';
import { SubscriptionView } from './components/SubscriptionView';
import { PdfExportModal } from './components/PdfExportModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isMobileFrame, toastMessage, loading } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'batches': return <BatchListView />;
      case 'vaccines': return <VaccineView />;
      case 'feed': return <FeedView />;
      case 'finances': return <FinanceView />;
      case 'health': return <HealthView />;
      case 'ai': return <AiAdvisorView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-200/80 flex flex-col items-center justify-start ${isMobileFrame ? 'py-0 sm:py-6' : 'p-0'}`}>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
            toastMessage.type === 'error' ? 'bg-red-600 text-white border-red-700' :
            toastMessage.type === 'info' ? 'bg-blue-600 text-white border-blue-700' :
            'bg-slate-900 text-white border-slate-800'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-200" /> :
             toastMessage.type === 'info' ? <Info className="w-4 h-4 text-blue-200" /> :
             <CheckCircle2 className="w-4 h-4 text-green-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container: Mobile Frame vs Full Desktop */}
      <div className={`w-full bg-slate-100 min-h-screen flex flex-col relative transition-all duration-300 ${
        isMobileFrame 
          ? 'max-w-md sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 sm:min-h-[840px] sm:max-h-[92vh] sm:overflow-hidden' 
          : 'max-w-7xl shadow-md'
      }`}>
        {/* Mobile speaker notch on larger screens */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white">
            <div className="w-20 h-4 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-6" />
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <Navbar />

        {/* Scrollable View Area */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang đồng bộ dữ liệu trại gà...</span>
            </div>
          ) : (
            renderActiveView()
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Global Action Modals */}
        <QuickActionModal />
        <NewBatchModal />
        <BatchDetailModal />
        <FarmManagementModal />
        <SubscriptionView />
        <PdfExportModal />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
