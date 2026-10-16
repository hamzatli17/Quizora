import {
  isCorrect,
  seededRandom,
  prepareQuiz,
  QUIZ_LENGTH,
} from '../src/features/quiz/engine';
import { pickCategoryQuestions } from '../src/features/quiz/select';
import {
  CATEGORY_IDS,
  QUESTIONS,
  type QuizQuestion,
} from '../src/features/quiz/questions';

const sample = (id: string): QuizQuestion => ({
  id,
  categoryId: 'logic',
  question: { fr: id, en: id },
  answers: ['a', 'b', 'c', 'd'].map(answerId => ({
    id: answerId,
    text: { fr: answerId, en: answerId },
  })),
  correctAnswerId: 'a',
});

describe('prepareQuiz', () => {
  it('returns at most the requested number without mutating the pool', () => {
    const pool = ['q1', 'q2', 'q3'].map(sample);
    const original = pool.map(question => question.id);
    const quiz = prepareQuiz(pool, 2, seededRandom(4));
    expect(quiz).toHaveLength(2);
    expect(pool.map(question => question.id)).toEqual(original);
  });

  it('keeps every answer and varies their order', () => {
    const pool = [sample('only')];
    const orders = new Set<string>();
    for (let seed = 1; seed <= 20; seed += 1) {
      const [question] = prepareQuiz(pool, 1, seededRandom(seed));
      orders.add(question.answers.map(answer => answer.id).join(','));
      expect(question.answers.map(answer => answer.id).sort()).toEqual([
        'a',
        'b',
        'c',
        'd',
      ]);
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('marks the stored answer as correct', () => {
    const question = sample('only');
    expect(isCorrect(question, 'a')).toBe(true);
    expect(isCorrect(question, 'b')).toBe(false);
    expect(isCorrect(question, null)).toBe(false);
  });
});

describe('question bank', () => {
  it('has twelve questions with four answers in each category', () => {
    CATEGORY_IDS.forEach(categoryId => {
      const questions = QUESTIONS.filter(
        question => question.categoryId === categoryId,
      );
      expect(questions).toHaveLength(12);
      questions.forEach(question => {
        expect(question.answers).toHaveLength(4);
        expect(
          question.answers.some(
            answer => answer.id === question.correctAnswerId,
          ),
        ).toBe(true);
      });
    });
    expect(new Set(QUESTIONS.map(question => question.id)).size).toBe(
      QUESTIONS.length,
    );
  });

  it('draws ten questions from one category', () => {
    const quiz = pickCategoryQuestions('science', seededRandom(9));
    expect(quiz).toHaveLength(QUIZ_LENGTH);
    expect(quiz.every(question => question.categoryId === 'science')).toBe(
      true,
    );
  });
});
