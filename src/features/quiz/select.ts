import { QUIZ_LENGTH, prepareQuiz } from './engine';
import { QUESTIONS, type QuizQuestion } from './questions';

export function pickCategoryQuestions(
  categoryId: string,
  random: () => number = Math.random,
  pool: readonly QuizQuestion[] = QUESTIONS,
): QuizQuestion[] {
  return prepareQuiz(
    pool.filter(question => question.categoryId === categoryId),
    QUIZ_LENGTH,
    random,
  );
}
