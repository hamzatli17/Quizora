import {
  currentStreak,
  localDateKey,
  pickDailyQuestions,
} from '../src/features/challenges/daily';
import { QUESTIONS } from '../src/features/quiz/questions';
import i18n from '../src/i18n';
import en from '../src/i18n/locales/en.json';
import fr from '../src/i18n/locales/fr.json';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return leafKeys(nested, path);
    });
  }
  return [prefix];
}

describe('daily challenge', () => {
  it('uses the device calendar date', () => {
    expect(localDateKey(new Date(2026, 9, 16, 0, 30, 0))).toBe('2026-10-16');
  });

  it('returns the same ten questions for the same date', () => {
    const first = pickDailyQuestions('2026-10-16');
    const second = pickDailyQuestions('2026-10-16');
    expect(first.map(question => question.id)).toEqual(
      second.map(question => question.id),
    );
    expect(
      first.map(question => question.answers.map(answer => answer.id)),
    ).toEqual(
      second.map(question => question.answers.map(answer => answer.id)),
    );
    expect(first).toHaveLength(10);
    expect(new Set(first.map(question => question.id)).size).toBe(10);
    first.forEach(question => {
      expect(QUESTIONS.some(entry => entry.id === question.id)).toBe(true);
    });
  });

  it('changes the draw when the date changes', () => {
    const first = pickDailyQuestions('2026-10-16')
      .map(question => question.id)
      .join();
    const second = pickDailyQuestions('2026-10-17')
      .map(question => question.id)
      .join();
    expect(first).not.toEqual(second);
  });

  it('counts consecutive days and keeps yesterday alive until today ends', () => {
    const days = ['2026-10-14', '2026-10-15', '2026-10-16'];
    expect(currentStreak(days, '2026-10-16')).toBe(3);
    expect(currentStreak(days, '2026-10-17')).toBe(3);
    expect(currentStreak(days, '2026-10-18')).toBe(0);
    expect(currentStreak(['2026-10-14', '2026-10-16'], '2026-10-16')).toBe(1);
  });
});

describe('translations', () => {
  it('keeps French and English keys aligned', () => {
    expect(leafKeys(fr).sort()).toEqual(leafKeys(en).sort());
  });

  it('pluralizes the streak in both languages', () => {
    expect(i18n.t('home.streak', { count: 1, lng: 'fr' })).toBe(
      "1 jour d'affilée",
    );
    expect(i18n.t('home.streak', { count: 3, lng: 'fr' })).toBe(
      "3 jours d'affilée",
    );
    expect(i18n.t('home.streak', { count: 1, lng: 'en' })).toBe(
      '1 day in a row',
    );
    expect(i18n.t('home.streak', { count: 3, lng: 'en' })).toBe(
      '3 days in a row',
    );
  });
});
