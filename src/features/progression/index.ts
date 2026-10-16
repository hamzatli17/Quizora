import { currentStreak } from '../challenges/daily';

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 25;
export const XP_DAILY_BONUS = 15;
export const XP_PER_LEVEL = 100;
export const MAX_HISTORY = 50;

export const BADGE_IDS = [
  'first_quiz',
  'perfect_score',
  'quizzes_10',
  'daily_first',
  'streak_3',
] as const;

export type BadgeId = (typeof BADGE_IDS)[number];
export type QuizMode = 'category' | 'daily';

export type HistoryEntry = {
  id: string;
  mode: QuizMode;
  categoryId: string;
  score: number;
  total: number;
  xpGained: number;
  playedAt: string;
  localDate: string;
};

export type ProgressData = {
  totalXp: number;
  quizzesCompleted: number;
  correctAnswers: number;
  badges: BadgeId[];
  history: HistoryEntry[];
  dailyCompletions: string[];
};

export type QuizResultInput = {
  id: string;
  mode: QuizMode;
  categoryId: string;
  score: number;
  total: number;
  localDate: string;
  playedAt: string;
};

export function emptyProgress(): ProgressData {
  return {
    totalXp: 0,
    quizzesCompleted: 0,
    correctAnswers: 0,
    badges: [],
    history: [],
    dailyCompletions: [],
  };
}

export function levelFromXp(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(totalXp: number): number {
  return Math.max(0, totalXp) % XP_PER_LEVEL;
}

export function xpForQuiz(input: {
  score: number;
  total: number;
  isDaily: boolean;
  alreadyCompleted: boolean;
}): number {
  if (input.isDaily && input.alreadyCompleted) {
    return 0;
  }
  let xp = input.score * XP_PER_CORRECT;
  if (input.total > 0 && input.score === input.total) {
    xp += XP_PERFECT_BONUS;
  }
  if (input.isDaily) {
    xp += XP_DAILY_BONUS;
  }
  return xp;
}

export function collectBadges(data: ProgressData, today: string): BadgeId[] {
  const earned = new Set<BadgeId>(data.badges);
  if (data.quizzesCompleted >= 1) {
    earned.add('first_quiz');
  }
  if (
    data.history.some(entry => entry.total > 0 && entry.score === entry.total)
  ) {
    earned.add('perfect_score');
  }
  if (data.quizzesCompleted >= 10) {
    earned.add('quizzes_10');
  }
  if (data.dailyCompletions.length >= 1) {
    earned.add('daily_first');
  }
  if (currentStreak(data.dailyCompletions, today) >= 3) {
    earned.add('streak_3');
  }
  return BADGE_IDS.filter(id => earned.has(id));
}

export function applyQuizResult(
  data: ProgressData,
  input: QuizResultInput,
): { data: ProgressData; xpGained: number } {
  const alreadyCompleted =
    input.mode === 'daily' && data.dailyCompletions.includes(input.localDate);
  const xpGained = xpForQuiz({
    score: input.score,
    total: input.total,
    isDaily: input.mode === 'daily',
    alreadyCompleted,
  });
  const dailyCompletions =
    input.mode === 'daily' && !alreadyCompleted
      ? [...data.dailyCompletions, input.localDate]
      : data.dailyCompletions;
  const history: HistoryEntry[] = [
    {
      id: input.id,
      mode: input.mode,
      categoryId: input.categoryId,
      score: input.score,
      total: input.total,
      xpGained,
      playedAt: input.playedAt,
      localDate: input.localDate,
    },
    ...data.history,
  ].slice(0, MAX_HISTORY);
  const next: ProgressData = {
    totalXp: data.totalXp + xpGained,
    quizzesCompleted: data.quizzesCompleted + 1,
    correctAnswers: data.correctAnswers + input.score,
    badges: data.badges,
    history,
    dailyCompletions,
  };
  return {
    xpGained,
    data: { ...next, badges: collectBadges(next, input.localDate) },
  };
}
