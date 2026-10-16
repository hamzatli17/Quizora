import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LANGUAGES, type AppLanguage } from '../i18n';
import type { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../stores/settingsStore';
import { theme } from '../theme';

const LANGUAGE_LABEL: Record<
  AppLanguage,
  'settings.french' | 'settings.english'
> = {
  fr: 'settings.french',
  en: 'settings.english',
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useSettingsStore(state => state.language);
  const soundEnabled = useSettingsStore(state => state.soundEnabled);
  const timerEnabled = useSettingsStore(state => state.timerEnabled);
  const setLanguage = useSettingsStore(state => state.setLanguage);
  const setSoundEnabled = useSettingsStore(state => state.setSoundEnabled);
  const setTimerEnabled = useSettingsStore(state => state.setTimerEnabled);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('settings.title') });
  }, [navigation, t]);

  return (
    <View style={styles.screen}>
      <Card style={styles.block}>
        <Text style={styles.label}>{t('settings.language')}</Text>
        <View style={styles.row}>
          {LANGUAGES.map(code => (
            <Button
              key={code}
              label={t(LANGUAGE_LABEL[code])}
              variant={language === code ? 'primary' : 'secondary'}
              onPress={() => setLanguage(code)}
              style={styles.language}
              testID={`settings-language-${code}`}
            />
          ))}
        </View>
      </Card>
      <Card style={styles.block}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('settings.sound')}</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            testID="settings-sound"
            trackColor={{
              true: theme.colors.primary,
              false: theme.colors.border,
            }}
            thumbColor={theme.colors.white}
          />
        </View>
        <Text style={styles.hint}>{t('settings.soundHint')}</Text>
      </Card>
      <Card style={styles.block}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('settings.timer')}</Text>
          <Switch
            value={timerEnabled}
            onValueChange={setTimerEnabled}
            testID="settings-timer"
            trackColor={{
              true: theme.colors.primary,
              false: theme.colors.border,
            }}
            thumbColor={theme.colors.white}
          />
        </View>
        <Text style={styles.hint}>{t('settings.timerHint')}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  block: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  language: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
});
