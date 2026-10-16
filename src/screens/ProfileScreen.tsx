import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { BADGE_IDS, levelFromXp } from '../features/progression';
import { appLanguage } from '../i18n';
import type { RootStackParamList } from '../navigation/types';
import { useProgressStore } from '../stores/progressStore';
import { theme } from '../theme';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const language = appLanguage(i18n.language);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const nickname = useProgressStore(state => state.nickname);
  const setNickname = useProgressStore(state => state.setNickname);
  const totalXp = useProgressStore(state => state.totalXp);
  const quizzesCompleted = useProgressStore(state => state.quizzesCompleted);
  const correctAnswers = useProgressStore(state => state.correctAnswers);
  const badges = useProgressStore(state => state.badges);
  const history = useProgressStore(state => state.history);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('profile.title') });
  }, [navigation, t]);

  const locale = language === 'fr' ? 'fr-FR' : 'en-GB';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>{t('profile.nickname')}</Text>
      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder={t('profile.defaultName')}
        placeholderTextColor={theme.colors.textMuted}
        maxLength={24}
        testID="profile-nickname"
        style={styles.input}
      />
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{levelFromXp(totalXp)}</Text>
          <Text style={styles.statLabel}>{t('profile.level')}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{quizzesCompleted}</Text>
          <Text style={styles.statLabel}>{t('profile.quizzes')}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{correctAnswers}</Text>
          <Text style={styles.statLabel}>{t('profile.correct')}</Text>
        </Card>
      </View>
      <Text style={styles.section}>{t('profile.badges')}</Text>
      {BADGE_IDS.map(badgeId => {
        const earned = badges.includes(badgeId);
        return (
          <Card key={badgeId} style={earned ? undefined : styles.locked}>
            <Text style={styles.badgeTitle}>{t(`badges.${badgeId}`)}</Text>
            <Text style={styles.badgeHint}>{t(`badges.${badgeId}Hint`)}</Text>
          </Card>
        );
      })}
      <Text style={styles.section}>{t('profile.history')}</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>{t('profile.emptyHistory')}</Text>
      ) : (
        history.slice(0, 20).map(entry => {
          const category =
            entry.categoryId === 'daily'
              ? t('quiz.daily')
              : t(`categories.${entry.categoryId}`);
          const date = new Date(entry.playedAt).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
          });
          return (
            <Text key={entry.id} style={styles.historyItem}>
              {t('profile.historyLine', {
                date,
                category,
                score: entry.score,
                total: entry.total,
                xp: entry.xpGained,
              })}
            </Text>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  stat: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginTop: theme.spacing.md,
  },
  badgeTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  badgeHint: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  locked: {
    opacity: 0.45,
  },
  empty: {
    color: theme.colors.textMuted,
  },
  historyItem: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    paddingVertical: theme.spacing.xs,
  },
});
