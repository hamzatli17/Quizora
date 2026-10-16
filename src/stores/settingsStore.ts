import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n, { type AppLanguage } from '../i18n';

type SettingsState = {
  language: AppLanguage;
  soundEnabled: boolean;
  timerEnabled: boolean;
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTimerEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      language: 'fr',
      soundEnabled: true,
      timerEnabled: false,
      hydrated: false,
      setLanguage: language => {
        i18n.changeLanguage(language);
        set({ language });
      },
      setSoundEnabled: soundEnabled => set({ soundEnabled }),
      setTimerEnabled: timerEnabled => set({ timerEnabled }),
    }),
    {
      name: 'quizora-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        language: state.language,
        soundEnabled: state.soundEnabled,
        timerEnabled: state.timerEnabled,
      }),
      onRehydrateStorage: () => state => {
        i18n.changeLanguage(state?.language ?? 'fr');
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);
