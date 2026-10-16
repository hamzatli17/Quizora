import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Flame } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { currentStreak, localDateKey } from '../features/challenges/daily';
import {
  levelFromXp,
  xpIntoLevel,
  XP_PER_LEVEL,
} from '../features/progression';
import type { RootStackParamList } from '../navigation/types';
import { useProgressStore } from '../stores/progressStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const nickname = useProgressStore(state => state.nickname);
  const totalXp = useProgressStore(state => state.totalXp);
  const dailyCompletions = useProgressStore(state => state.dailyCompletions);
  const [today, setToday] = useState(() => localDateKey(new Date()));

  useFocusEffect(
    useCallback(() => {
      setToday(localDateKey(new Date()));
    }, []),
  );

  const name = nickname.trim() || t('profile.defaultName');
  const completed = dailyCompletions.includes(today);
  const streak = currentStreak(dailyCompletions, today);
  const level = levelFromXp(totalXp);
  const intoLevel = xpIntoLevel(totalXp);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + theme.spacing.lg },
      ]}
    >
      <Text style={styles.brand}>Quizora</Text>
      <Text style={styles.greeting}>{t('home.greeting', { name })}</Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      <Card>
        <Text style={styles.level}>{t('home.level', { level })}</Text>
        <Text style={styles.xp}>{t('home.xp', { xp: totalXp })}</Text>
        <ProgressBar value={intoLevel / XP_PER_LEVEL} />
        <Text style={styles.progressLabel}>
          {t('home.xpProgress', { current: intoLevel, total: XP_PER_LEVEL })}
        </Text>
      </Card>

      <Card style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <Flame color={theme.colors.primary} size={22} />
          <Text style={styles.dailyTitle}>{t('home.dailyTitle')}</Text>
        </View>
        <Text style={styles.body}>
          {completed ? t('home.dailyDone') : t('home.dailyTodo')}
        </Text>
        {streak > 0 ? (
          <Text style={styles.streak}>
            {t('home.streak', { count: streak })}
          </Text>
        ) : null}
        <Button
          label={completed ? t('home.replayDaily') : t('home.playDaily')}
          onPress={() => navigation.navigate('Quiz', { mode: 'daily' })}
          testID="home-daily"
        />
        {completed ? (
          <Text style={styles.hint}>{t('home.replayHint')}</Text>
        ) : null}
      </Card>

      <Button
        label={t('home.categories')}
        onPress={() => navigation.navigate('Categories')}
        testID="home-categories"
      />
      <View style={styles.row}>
        <Button
          label={t('home.profile')}
          variant="secondary"
          onPress={() => navigation.navigate('Profile')}
          style={styles.rowButton}
          testID="home-profile"
        />
        <Button
          label={t('home.settings')}
          variant="secondary"
          onPress={() => navigation.navigate('Settings')}
          style={styles.rowButton}
          testID="home-settings"
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
  brand: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.display,
    fontWeight: '800',
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  level: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  xp: {
    color: theme.colors.infoText,
    backgroundColor: theme.colors.info,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
    fontWeight: '700',
  },
  progressLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  dailyCard: {
    gap: theme.spacing.sm,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dailyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  streak: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rowButton: {
    flex: 1,
  },
});
