import type { CategoryId } from '../features/quiz/questions';
import type { QuizMode } from '../features/progression';

export type AnswerReview = {
  questionId: string;
  selectedId: string | null;
};

export type RootStackParamList = {
  Home: undefined;
  Categories: undefined;
  Quiz: { mode: 'daily' } | { mode: 'category'; categoryId: CategoryId };
  Result: {
    mode: QuizMode;
    categoryId: string;
    score: number;
    total: number;
    xpGained: number;
    review: AnswerReview[];
  };
  Profile: undefined;
  Settings: undefined;
};
