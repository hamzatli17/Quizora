import {
  applyQuizResult,
  emptyProgress,
  levelFromXp,
  xpForQuiz,
  XP_DAILY_BONUS,
  XP_PERFECT_BONUS,
  XP_PER_CORRECT,
} from '../src/features/progression';

const base = {
  id: 'game-1',
  categoryId: 'general',
  localDate: '2026-10-16',
  playedAt: '2026-10-16T12:00:00.000Z',
  total: 10,
};

describe('xpForQuiz', () => {
  it('awards 10 XP per correct answer', () => {
    expect(
      xpForQuiz({
        score: 3,
        total: 10,
        isDaily: false,
        alreadyCompleted: false,
      }),
    ).toBe(3 * XP_PER_CORRECT);
  });

  it('adds a perfect bonus and a daily bonus once', () => {
    expect(
      xpForQuiz({
        score: 10,
        total: 10,
        isDaily: true,
        alreadyCompleted: false,
      }),
    ).toBe(10 * XP_PER_CORRECT + XP_PERFECT_BONUS + XP_DAILY_BONUS);
  });

  it('awards nothing when the daily challenge was already completed', () => {
    expect(
      xpForQuiz({
        score: 10,
        total: 10,
        isDaily: true,
        alreadyCompleted: true,
      }),
    ).toBe(0);
  });
});

describe('levelFromXp', () => {
  it('starts at level 1 and increases every 100 XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
  });
});

describe('applyQuizResult', () => {
  it('unlocks the first quiz and a perfect score', () => {
    const result = applyQuizResult(emptyProgress(), {
      ...base,
      mode: 'category',
      score: 10,
    });
    expect(result.xpGained).toBe(125);
    expect(result.data.totalXp).toBe(125);
    expect(result.data.badges).toEqual(['first_quiz', 'perfect_score']);
    expect(result.data.quizzesCompleted).toBe(1);
    expect(result.data.correctAnswers).toBe(10);
  });

  it('does not grant daily XP twice on the same date', () => {
    const first = applyQuizResult(emptyProgress(), {
      ...base,
      id: 'daily-1',
      mode: 'daily',
      categoryId: 'daily',
      score: 4,
    });
    const second = applyQuizResult(first.data, {
      ...base,
      id: 'daily-2',
      mode: 'daily',
      categoryId: 'daily',
      score: 10,
    });
    expect(first.xpGained).toBe(4 * XP_PER_CORRECT + XP_DAILY_BONUS);
    expect(first.data.badges).toContain('daily_first');
    expect(second.xpGained).toBe(0);
    expect(second.data.totalXp).toBe(first.data.totalXp);
    expect(second.data.dailyCompletions).toEqual(['2026-10-16']);
    expect(second.data.history).toHaveLength(2);
    expect(second.data.badges).toContain('perfect_score');
  });

  it('unlocks a three-day streak and the tenth quiz', () => {
    let data = emptyProgress();
    const dates = ['2026-10-14', '2026-10-15', '2026-10-16'];
    dates.forEach((localDate, index) => {
      data = applyQuizResult(data, {
        ...base,
        id: `daily-${index}`,
        mode: 'daily',
        categoryId: 'daily',
        score: 1,
        localDate,
      }).data;
    });
    expect(data.badges).toContain('streak_3');

    for (let index = data.quizzesCompleted; index < 10; index += 1) {
      data = applyQuizResult(data, {
        ...base,
        id: `extra-${index}`,
        mode: 'category',
        score: 1,
        localDate: '2026-10-16',
      }).data;
    }
    expect(data.quizzesCompleted).toBe(10);
    expect(data.badges).toContain('quizzes_10');
  });
});
