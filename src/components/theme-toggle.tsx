import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useAppStore } from '@/src/store/useApp';
import type { Theme } from '@/src/types/types';
import { ThemedText } from './themed-text';

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  const options = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Appearance</ThemedText>

      <View style={styles.toggleContainer}>
        {options.map((option) => {
          const isActive = theme === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setTheme(option.value as Theme)}
              style={[styles.button, isActive && styles.activeButton]}
            >
              <ThemedText style={[styles.buttonText, isActive && styles.activeButtonText]}>
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {theme === 'system' && (
        <ThemedText style={styles.helperText}>
          We'll adjust your look based on your device settings.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.typography,
  },
  toggleContainer: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginLeft: 4,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.lightGrey,
  },
  buttonText: {
    fontSize: 12,
    color: theme.colors.typography,
  },
  activeButton: {
    backgroundColor: theme.colors.typography,
  },
  activeButtonText: {
    color: theme.colors.lightGrey,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.typography,
  },
}));
