import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  applyQuizResult,
  emptyProgress,
  type BadgeId,
  type HistoryEntry,
  type QuizResultInput,
} from '../features/progression';

type ProgressState = {
  nickname: string;
  totalXp: number;
  quizzesCompleted: number;
  correctAnswers: number;
  badges: BadgeId[];
  history: HistoryEntry[];
  dailyCompletions: string[];
  hydrated: boolean;
  setNickname: (nickname: string) => void;
  recordQuiz: (input: Omit<QuizResultInput, 'id'>) => number;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    set => ({
      nickname: '',
      ...emptyProgress(),
      hydrated: false,
      setNickname: nickname => set({ nickname: nickname.slice(0, 24) }),
      recordQuiz: input => {
        let xpGained = 0;
        set(state => {
          const result = applyQuizResult(
            {
              totalXp: state.totalXp,
              quizzesCompleted: state.quizzesCompleted,
              correctAnswers: state.correctAnswers,
              badges: state.badges,
              history: state.history,
              dailyCompletions: state.dailyCompletions,
            },
            {
              ...input,
              id: `${Date.now().toString(36)}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
            },
          );
          xpGained = result.xpGained;
          return result.data;
        });
        return xpGained;
      },
    }),
    {
      name: 'quizora-progress',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        nickname: state.nickname,
        totalXp: state.totalXp,
        quizzesCompleted: state.quizzesCompleted,
        correctAnswers: state.correctAnswers,
        badges: state.badges,
        history: state.history,
        dailyCompletions: state.dailyCompletions,
      }),
      onRehydrateStorage: () => () => {
        useProgressStore.setState({ hydrated: true });
      },
    },
  ),
);
