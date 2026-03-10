import { create } from 'zustand';
import api from '../services/api';

interface Settings {
  audio_enabled: boolean;
  audio_volume: number;
  bank_info: {
    name: string;
    agency: string;
    account: string;
    pix: string;
  };
  card_rates: {
    debit: number;
    credit: number;
    brands: string[];
  };
}

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/settings');
      set({ settings: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch settings', error);
      set({ loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const response = await api.patch('/settings', newSettings);
      set({ settings: response.data });
    } catch (error) {
      console.error('Failed to update settings', error);
      throw error;
    }
  },
}));
