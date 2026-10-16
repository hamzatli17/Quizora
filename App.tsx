import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useProgressStore } from './src/stores/progressStore';
import { useSettingsStore } from './src/stores/settingsStore';
import { theme } from './src/theme';

function App() {
  const settingsReady = useSettingsStore(state => state.hydrated);
  const progressReady = useProgressStore(state => state.hydrated);
  const ready = settingsReady && progressReady;

  return (
    <SafeAreaProvider
      initialMetrics={
        initialWindowMetrics ?? {
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }
      }>
      <StatusBar barStyle="dark-content" />
      {ready ? (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default App;
