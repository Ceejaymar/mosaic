import { Pressable, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';

export function DemoBadge() {
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const toggleDemoMode = useAppStore((s) => s.toggleDemoMode);
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

  return (
    <Pressable
      onPress={toggleDemoMode}
      style={({ pressed }) => [
        styles.badge,
        isDemoMode
          ? { backgroundColor: theme.colors.mosaicGold, borderColor: theme.colors.mosaicGold }
          : { borderColor: colors.divider },
        pressed && { opacity: 0.5 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={isDemoMode ? 'Disable demo mode' : 'Enable demo mode'}
    >
      <Text
        style={[styles.label, { color: isDemoMode ? theme.colors.onAccent : colors.textMuted }]}
      >
        Demo
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: theme.spacing[2],
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
}));
