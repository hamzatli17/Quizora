import { QUESTIONS, type QuizQuestion } from '../quiz/questions';
import {
  QUIZ_LENGTH,
  hashString,
  seededRandom,
  prepareQuiz,
} from '../quiz/engine';

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function currentStreak(
  completions: readonly string[],
  today: string,
): number {
  const done = new Set(completions);
  let cursor = done.has(today) ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function pickDailyQuestions(
  dateKey: string,
  pool: readonly QuizQuestion[] = QUESTIONS,
): QuizQuestion[] {
  return prepareQuiz(
    pool,
    QUIZ_LENGTH,
    seededRandom(hashString(`quizora:${dateKey}`)),
  );
}
