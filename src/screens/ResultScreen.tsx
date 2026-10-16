import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { findQuestion } from '../features/quiz/questions';
import type { CategoryId } from '../features/quiz/questions';
import { appLanguage } from '../i18n';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

export function ResultScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Result'>>();
  const { t, i18n } = useTranslation();
  const language = appLanguage(i18n.language);
  const { mode, categoryId, score, total, xpGained, review } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('result.title') });
  }, [navigation, t]);

  const replay = () => {
    if (mode === 'daily') {
      navigation.replace('Quiz', { mode: 'daily' });
      return;
    }
    navigation.replace('Quiz', {
      mode: 'category',
      categoryId: categoryId as CategoryId,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.score}>{t('result.score', { score, total })}</Text>
      <Text style={styles.xp}>
        {mode === 'daily' && xpGained === 0
          ? t('result.noXp')
          : t('result.xp', { xp: xpGained })}
      </Text>
      {review.map(item => {
        const question = findQuestion(item.questionId);
        if (!question) {
          return null;
        }
        const correct = question.answers.find(
          answer => answer.id === question.correctAnswerId,
        );
        const selected = question.answers.find(
          answer => answer.id === item.selectedId,
        );
        const right = item.selectedId === question.correctAnswerId;
        return (
          <Card key={item.questionId}>
            <Text style={styles.question}>{question.question[language]}</Text>
            <Text style={right ? styles.good : styles.bad}>
              {t('result.yourAnswer', {
                answer: selected?.text[language] ?? t('result.unanswered'),
              })}
            </Text>
            <Text style={styles.good}>
              {t('result.correctAnswer', {
                answer: correct?.text[language] ?? '',
              })}
            </Text>
            {question.explanation ? (
              <Text style={styles.explanation}>
                {question.explanation[language]}
              </Text>
            ) : null}
          </Card>
        );
      })}
      <View style={styles.actions}>
        <Button
          label={t('result.replay')}
          onPress={replay}
          testID="result-replay"
        />
        <Button
          label={t('result.home')}
          variant="secondary"
          onPress={() => navigation.popToTop()}
          testID="result-home"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  score: {
    color: theme.colors.text,
    fontSize: theme.fontSize.display,
    fontWeight: '800',
  },
  xp: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  question: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  good: {
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  bad: {
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
  explanation: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
