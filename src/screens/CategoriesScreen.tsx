import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlaskConical, Globe, Puzzle, Sparkles } from 'lucide-react-native';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { CATEGORY_IDS } from '../features/quiz/questions';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

const ICONS = {
  general: Sparkles,
  geography: Globe,
  science: FlaskConical,
  logic: Puzzle,
} as const;

export function CategoriesScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('categories.title') });
  }, [navigation, t]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {CATEGORY_IDS.map(categoryId => {
        const Icon = ICONS[categoryId];
        return (
          <Pressable
            key={categoryId}
            accessibilityRole="button"
            testID={`category-${categoryId}`}
            onPress={() =>
              navigation.navigate('Quiz', { mode: 'category', categoryId })
            }
          >
            <Card>
              <View style={styles.row}>
                <Icon color={theme.colors.primary} size={28} />
                <View style={styles.copy}>
                  <Text style={styles.title}>
                    {t(`categories.${categoryId}`)}
                  </Text>
                  <Text style={styles.hint}>
                    {t(`categories.${categoryId}Hint`)}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.md,
  },
});
