import type { QuizQuestion } from './questions';

export const QUIZ_LENGTH = 10;
export const QUESTION_TIME_SECONDS = 20;

export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }
  return hash;
}

export function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }
  return copy;
}

export function prepareQuiz(
  pool: readonly QuizQuestion[],
  count: number,
  random: () => number,
): QuizQuestion[] {
  return shuffle(pool, random)
    .slice(0, Math.min(count, pool.length))
    .map(question => ({
      ...question,
      answers: shuffle(question.answers, random),
    }));
}

export function isCorrect(
  question: QuizQuestion,
  answerId: string | null,
): boolean {
  return answerId !== null && answerId === question.correctAnswerId;
}
