
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Farm, Batch, SubscriptionPlanType } from 'farmgo-shared';
import { api } from '../services/api';

export type NavTab = 'dashboard' | 'batches' | 'vaccines' | 'feed' | 'finances' | 'health' | 'ai' | 'subscription';

interface AppContextType {
  user: User | null;
  farms: Farm[];
  currentFarm: Farm | null;
  batches: Batch[];
  activeBatches: Batch[];
  completedBatches: Batch[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (val: boolean) => void;
  isNewBatchModalOpen: boolean;
  setIsNewBatchModalOpen: (val: boolean) => void;
  isFarmModalOpen: boolean;
  setIsFarmModalOpen: (val: boolean) => void;
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (val: boolean) => void;
  isPdfModalOpen: boolean;
  setIsPdfModalOpen: (val: boolean) => void;
  vaccineAlerts: { dueToday: any[]; dueSoon: any[]; overdue: any[] };
  withdrawalAlerts: any[];
  weatherAlert: any | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  switchFarm: (farmId: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true); // Mobile first by default
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [vaccineAlerts, setVaccineAlerts] = useState<{ dueToday: any[]; dueSoon: any[]; overdue: any[] }>({ dueToday: [], dueSoon: [], overdue: [] });
  const [withdrawalAlerts, setWithdrawalAlerts] = useState<any[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const meData = await api.getMe();
      setUser(meData.user);
      setFarms(meData.farms);
      
      const activeF = meData.currentFarm || meData.farms[0] || null;
      setCurrentFarm(activeF);

      if (activeF) {
        const batchList = await api.getBatches(activeF.id);
        setBatches(batchList);

        const [vacAlerts, withAlerts, wAlert] = await Promise.all([
          api.getVaccineAlerts(activeF.id).catch(() => ({ dueToday: [], dueSoon: [], overdue: [] })),
          api.getWithdrawalAlerts(activeF.id).catch(() => []),
          api.getWeatherAlerts(activeF.province).catch(() => null)
        ]);

        setVaccineAlerts(vacAlerts);
        setWithdrawalAlerts(withAlerts);
        setWeatherAlert(wAlert);
      }
    } catch (err: any) {
      console.error('Failed to load farm data:', err);
      showToast('Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchFarm = async (farmId: string) => {
    try {
      await api.setDefaultFarm(farmId);
      await refreshData();
      showToast('Đã chuyển trang trại thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Chuyển trại thất bại', 'error');
    }
  };

  const activeBatches = batches.filter(b => b.status === 'active');
  const completedBatches = batches.filter(b => b.status === 'completed');

  return (
    <AppContext.Provider
      value={{
        user,
        farms,
        currentFarm,
        batches,
        activeBatches,
        completedBatches,
        activeTab,
        setActiveTab,
        selectedBatchId,
        setSelectedBatchId,
        isMobileFrame,
        setIsMobileFrame,
        isQuickActionOpen,
        setIsQuickActionOpen,
        isNewBatchModalOpen,
        setIsNewBatchModalOpen,
        isFarmModalOpen,
        setIsFarmModalOpen,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        isPdfModalOpen,
        setIsPdfModalOpen,
        vaccineAlerts,
        withdrawalAlerts,
        weatherAlert,
        loading,
        refreshData,
        switchFarm,
        showToast,
        toastMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
