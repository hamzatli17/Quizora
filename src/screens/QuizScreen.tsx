import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { localDateKey, pickDailyQuestions } from '../features/challenges/daily';
import { QUESTION_TIME_SECONDS, isCorrect } from '../features/quiz/engine';
import { pickCategoryQuestions } from '../features/quiz/select';
import type { QuizQuestion } from '../features/quiz/questions';
import { appLanguage } from '../i18n';
import type { AnswerReview, RootStackParamList } from '../navigation/types';
import { useProgressStore } from '../stores/progressStore';
import { useSettingsStore } from '../stores/settingsStore';
import { theme } from '../theme';

export function QuizScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Quiz'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Quiz'>>();
  const { t, i18n } = useTranslation();
  const language = appLanguage(i18n.language);
  const timerEnabled = useSettingsStore(state => state.timerEnabled);
  const recordQuiz = useProgressStore(state => state.recordQuiz);
  const sessionDate = useRef(localDateKey(new Date())).current;
  const params = route.params;
  const quizKey = params.mode === 'daily' ? 'daily' : params.categoryId;

  const questions = useMemo(() => {
    if (quizKey === 'daily') {
      return pickDailyQuestions(sessionDate);
    }
    return pickCategoryQuestions(quizKey);
  }, [quizKey, sessionDate]);

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_SECONDS);
  const reviewRef = useRef<AnswerReview[]>([]);
  const lockedRef = useRef(false);
  const finishedRef = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedback = useRef(new Animated.Value(0)).current;
  const question = questions[index];

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        params.mode === 'daily'
          ? t('quiz.daily')
          : t(`categories.${params.categoryId}`),
    });
  }, [navigation, params, t]);

  const finish = (finalReview: AnswerReview[], deck: QuizQuestion[]) => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    const score = finalReview.reduce((total, item) => {
      const current = deck.find(entry => entry.id === item.questionId);
      return total + (current && isCorrect(current, item.selectedId) ? 1 : 0);
    }, 0);
    const xpGained = recordQuiz({
      mode: params.mode,
      categoryId: params.mode === 'daily' ? 'daily' : params.categoryId,
      score,
      total: deck.length,
      localDate: sessionDate,
      playedAt: new Date().toISOString(),
    });
    navigation.replace('Result', {
      mode: params.mode,
      categoryId: params.mode === 'daily' ? 'daily' : params.categoryId,
      score,
      total: deck.length,
      xpGained,
      review: finalReview,
    });
  };

  const submitRef = useRef<(answerId: string | null) => void>(() => {});
  submitRef.current = (answerId: string | null) => {
    if (!question || lockedRef.current || finishedRef.current) {
      return;
    }
    lockedRef.current = true;
    setLocked(true);
    setSelectedId(answerId);
    feedback.setValue(0);
    Animated.timing(feedback, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    const nextReview = [
      ...reviewRef.current,
      { questionId: question.id, selectedId: answerId },
    ];
    reviewRef.current = nextReview;
    advanceTimer.current = setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= questions.length) {
        finish(nextReview, questions);
        return;
      }
      lockedRef.current = false;
      setIndex(nextIndex);
      setSelectedId(null);
      setLocked(false);
      setSecondsLeft(QUESTION_TIME_SECONDS);
      feedback.setValue(0);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timerEnabled || locked || !question) {
      return;
    }
    setSecondsLeft(QUESTION_TIME_SECONDS);
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = QUESTION_TIME_SECONDS - elapsed;
      if (left <= 0) {
        setSecondsLeft(0);
        submitRef.current(null);
        clearInterval(timer);
        return;
      }
      setSecondsLeft(left);
    }, 250);
    return () => clearInterval(timer);
  }, [index, locked, question, timerEnabled]);

  if (!question) {
    return (
      <View style={styles.empty}>
        <Text style={styles.prompt}>{t('quiz.empty')}</Text>
      </View>
    );
  }

  const correct = isCorrect(question, selectedId);

  return (
    <View style={styles.screen}>
      <Text style={styles.progress}>
        {t('quiz.progress', { current: index + 1, total: questions.length })}
      </Text>
      <ProgressBar value={(index + (locked ? 1 : 0)) / questions.length} />
      {timerEnabled ? (
        <Text style={styles.timer}>
          {t('quiz.timer', { seconds: secondsLeft })}
        </Text>
      ) : null}
      <Text style={styles.prompt}>{question.question[language]}</Text>
      <View style={styles.answers}>
        {question.answers.map(answer => {
          const isSelected = selectedId === answer.id;
          const isAnswerCorrect = answer.id === question.correctAnswerId;
          return (
            <Pressable
              key={answer.id}
              accessibilityRole="button"
              disabled={locked}
              testID={`answer-${answer.id}`}
              onPress={() => submitRef.current(answer.id)}
              style={[
                styles.answer,
                locked && isAnswerCorrect && styles.answerCorrect,
                locked && isSelected && !isAnswerCorrect && styles.answerWrong,
              ]}
            >
              <Text style={styles.answerText}>{answer.text[language]}</Text>
            </Pressable>
          );
        })}
      </View>
      {locked ? (
        <Animated.Text style={[styles.feedback, { opacity: feedback }]}>
          {correct ? t('quiz.correct') : t('quiz.incorrect')}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  progress: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  timer: {
    color: theme.colors.infoText,
    backgroundColor: theme.colors.info,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontWeight: '700',
  },
  prompt: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    lineHeight: 32,
  },
  answers: {
    gap: theme.spacing.sm,
  },
  answer: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  answerCorrect: {
    backgroundColor: theme.colors.successSoft,
    borderColor: theme.colors.success,
  },
  answerWrong: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.danger,
  },
  answerText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  feedback: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});
