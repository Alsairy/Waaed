import { create } from 'zustand';
import { OfflineService } from '../services/OfflineService';

interface OfflineData {
  id: string;
  type: 'attendance' | 'leave_request' | 'profile_update';
  data: any;
  timestamp: string;
  retryCount: number;
}

interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingData: OfflineData[];
  syncInProgress: boolean;
  lastSyncTime: string | null;
  error: string | null;
  
  setOnlineStatus: (online: boolean) => void;
  addPendingData: (data: Omit<OfflineData, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingData: (id: string) => void;
  incrementRetryCount: (id: string) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setLastSyncTime: (time: string) => void;
  clearPendingData: () => void;
  setError: (error: string | null) => void;
  syncPendingData: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isOfflineMode: false,
  pendingData: [],
  syncInProgress: false,
  lastSyncTime: null,
  error: null,
  
  setOnlineStatus: (online: boolean) => {
    set({ isOnline: online, isOfflineMode: !online });
    if (online && get().pendingData.length > 0) {
    }
  },
  
  addPendingData: (data) => {
    const newData: OfflineData = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    
    set(state => ({
      pendingData: [...state.pendingData, newData]
    }));
  },
  
  removePendingData: (id: string) => {
    set(state => ({
      pendingData: state.pendingData.filter(item => item.id !== id)
    }));
  },
  
  incrementRetryCount: (id: string) => {
    set(state => ({
      pendingData: state.pendingData.map(item =>
        item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
      )
    }));
  },
  
  setSyncInProgress: (inProgress: boolean) => {
    set({ syncInProgress: inProgress });
  },
  
  setLastSyncTime: (time: string) => {
    set({ lastSyncTime: time });
  },
  
  clearPendingData: () => {
    set({ pendingData: [] });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  syncPendingData: async () => {
    const { pendingData, setSyncInProgress, removePendingData, incrementRetryCount, setError } = get();
    if (pendingData.length === 0) return;
    
    setSyncInProgress(true);
    setError(null);
    
    try {
      await OfflineService.syncPendingData();
      
      const remainingData = get().pendingData;
      if (remainingData.length === 0) {
        set({ lastSyncTime: new Date().toISOString() });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setError(errorMessage);
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  },
}));
