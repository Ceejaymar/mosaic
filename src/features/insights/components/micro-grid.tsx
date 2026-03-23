import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import type { InsightEntry } from '@/src/features/insights/types';
import { useAppStore } from '@/src/store/useApp';

type Props = { entries: InsightEntry[] };

export function MicroGrid({ entries }: Props) {
  const firstDayOfWeek = useAppStore((s) => s.preferences.firstDayOfWeek);

  const dayData = useMemo(() => {
    const now = new Date();
    const jsDow = now.getDay();
    const diffToStart = firstDayOfWeek === 'monday' ? (jsDow + 6) % 7 : jsDow;

    // Build the 7 days of the current week
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToStart + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { dateKey, label };
    });

    const stats = days.map(({ dateKey, label }) => {
      const dayEntries = entries.filter((e) => e.date === dateKey);

      const colorTally: Record<string, number> = {};
      for (const e of dayEntries) {
        const color = e.coreEmotions[0] || e.emotions[0];
        if (!color) continue;
        colorTally[color] = (colorTally[color] || 0) + 1;
      }

      const tallyTotal = Object.values(colorTally).reduce((a, b) => a + b, 0);
      const segments = Object.entries(colorTally)
        .map(([color, count]) => ({
          color,
          pctOfSlot: tallyTotal > 0 ? count / tallyTotal : 0,
        }))
        .sort((a, b) => b.pctOfSlot - a.pctOfSlot);

      return { dateKey, label, totalCount: tallyTotal, segments };
    });

    const maxCount = Math.max(...stats.map((s) => s.totalCount), 1);
    return stats.map((s) => ({ ...s, pctOfMax: s.totalCount / maxCount }));
  }, [entries, firstDayOfWeek]);

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        This week
      </AppText>

      <View style={styles.stack}>
        {dayData.map((day) => (
          <View key={day.dateKey} style={styles.row}>
            <AppText font="mono" colorVariant="muted" style={styles.slotLabel}>
              {day.label}
            </AppText>
            <View style={styles.track}>
              {day.totalCount > 0 && (
                <View style={[styles.pillWrapper, { width: '100%' }]}>
                  {day.segments.map((seg) => (
                    <View
                      key={seg.color}
                      style={{
                        backgroundColor: seg.color,
                        width: `${seg.pctOfSlot * 100}%`,
                        height: '100%',
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { paddingHorizontal: theme.spacing[6], marginBottom: theme.spacing[8] },
  title: {
    fontWeight: '700',
    marginBottom: theme.spacing[4],
  },
  stack: {
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  slotLabel: {
    width: 50,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  track: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pillWrapper: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
}));
