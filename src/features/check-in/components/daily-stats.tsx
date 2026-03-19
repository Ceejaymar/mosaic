import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { Surface } from '@/src/components/surface';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

interface DailyStatsRow {
  entriesCount: number;
  streakCount: number;
}

export function DailyStatsRow({ entriesCount, streakCount }: DailyStatsRow) {
  const colors = useAccessibleColors();

  return (
    <Surface style={styles.statsRow}>
      <View style={styles.statGroup}>
        <AppText font="heading" colorVariant="primary" style={styles.statNum}>
          {entriesCount}
        </AppText>
        <AppText colorVariant="muted" variant="md">
          {entriesCount === 1 ? 'check-in today' : 'check-ins today'}
        </AppText>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
      <View style={styles.statGroup}>
        <AppText font="heading" colorVariant="primary" style={styles.statNum}>
          {streakCount}
        </AppText>
        <AppText colorVariant="muted" variant="md">
          day streak
        </AppText>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create((theme) => ({
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[7],
    gap: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  statGroup: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing[2],
  },
  statNum: {
    fontSize: theme.fontSize.base,
    fontWeight: '700' as const,
  },
  statDivider: { width: 1, height: 16, borderRadius: 1 },
}));
