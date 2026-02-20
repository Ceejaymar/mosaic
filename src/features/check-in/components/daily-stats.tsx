import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface DailyStatsRow {
  entriesCount: number;
  streakCount: number;
}

export function DailyStatsRow({ entriesCount, streakCount }: DailyStatsRow) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statGroup}>
        <Text style={styles.statNum}>{entriesCount}</Text>
        <Text style={styles.statLbl}>
          {entriesCount === 1 ? 'check-in today' : 'check-ins today'}
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statGroup}>
        <Text style={styles.statNum}>{streakCount}</Text>
        <Text style={styles.statLbl}>{`${streakCount}-day streak`}</Text>
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
  statLbl: { fontSize: 15, color: theme.colors.textMuted },
  statDivider: { width: 1, height: 16, borderRadius: 1, backgroundColor: theme.colors.divider },
}));
