import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

interface DailyStatsRow {
  entriesCount: number;
  streakCount: number;
}

export function DailyStatsRow({ entriesCount, streakCount }: DailyStatsRow) {
  const colors = useAccessibleColors();

  return (
    <View style={styles.statsRow}>
      <View style={styles.statGroup}>
        <Text style={styles.statNum}>{entriesCount}</Text>
        <AppText colorVariant="muted" style={styles.statLbl}>
          {entriesCount === 1 ? 'check-in today' : 'check-ins today'}
        </AppText>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
      <View style={styles.statGroup}>
        <Text style={styles.statNum}>{streakCount}</Text>
        <AppText colorVariant="muted" style={styles.statLbl}>
          day streak
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 20,
    backgroundColor: theme.colors.surface,
  },
  statGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statNum: { fontSize: 17, fontWeight: '700', color: theme.colors.typography },
  statLbl: { fontSize: 15 },
  statDivider: { width: 1, height: 16, borderRadius: 1 },
}));
