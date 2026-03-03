import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import type { Theme } from '@/src/types/types';
import { ThemedText } from './themed-text';

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  const { theme: unistylesTheme } = useUnistyles();
  const colors = useAccessibleColors();

  const options: { label: string; value: Theme; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Sleek Pill Container */}
      <View
        style={[
          styles.pillContainer,
          { backgroundColor: unistylesTheme.colors.surface, borderColor: colors.divider },
        ]}
      >
        {options.map((option) => {
          const isActive = theme === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setTheme(option.value)}
              style={[
                styles.segment,
                isActive && [
                  styles.activeSegment,
                  { backgroundColor: unistylesTheme.colors.background },
                ],
              ]}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={isActive ? unistylesTheme.colors.typography : colors.textMuted}
                style={{ marginBottom: 4 }}
              />
              <ThemedText
                style={[
                  styles.segmentText,
                  { color: isActive ? unistylesTheme.colors.typography : colors.textMuted },
                  isActive && styles.activeSegmentText,
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeSegment: {
    // Elevates the active segment so it looks like a physical button
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    fontWeight: '500',
  },
  activeSegmentText: {
    fontWeight: '700',
  },
}));
