import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import type { InsightEntry } from '@/src/features/insights/types';
import { useAppStore } from '@/src/store/useApp';

type Props = { entries: InsightEntry[] };

type Segment = { color: string; percentage: number };

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDays(
  firstDayOfWeek: 'sunday' | 'monday',
): Array<{ label: string; dateKey: string }> {
  const today = new Date();
  const jsDow = today.getDay();
  const diff = firstDayOfWeek === 'monday' ? (jsDow + 6) % 7 : jsDow;
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { label: DAY_LABELS[d.getDay()], dateKey: `${yyyy}-${mm}-${dd}` };
  });
}

export function MicroGrid({ entries }: Props) {
  const { theme } = useUnistyles();
  const firstDayOfWeek = useAppStore((s) => s.preferences.firstDayOfWeek);

  const days = useMemo(() => getWeekDays(firstDayOfWeek), [firstDayOfWeek]);

  const dayData = useMemo(() => {
    const byDate: Record<string, InsightEntry[]> = {};
    for (const entry of entries) {
      if (!byDate[entry.date]) byDate[entry.date] = [];
      byDate[entry.date].push(entry);
    }

    const raw = days.map(({ label, dateKey }) => {
      const dayEntries = byDate[dateKey] ?? [];
      const totalCount = dayEntries.length;

      // Tally frequency of each core emotion color
      const colorCounts: Record<string, number> = {};
      for (const e of dayEntries) {
        const c = e.coreEmotions[0];
        if (c) colorCounts[c] = (colorCounts[c] || 0) + 1;
      }

      // Convert to percentage segments, sorted largest-first
      const segments: Segment[] = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color, count]) => ({ color, percentage: count / totalCount }));

      return { label, dateKey, totalCount, segments };
    });

    const max = Math.max(...raw.map((d) => d.totalCount), 1);
    return raw.map((d) => ({ ...d, pctOfMax: d.totalCount / max }));
  }, [entries, days]);

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        This week
      </AppText>

      <View style={styles.stack}>
        {dayData.map((day) => (
          <View key={day.dateKey} style={styles.row}>
            <AppText font="mono" colorVariant="muted" style={styles.dayLabel}>
              {day.label}
            </AppText>
            <View style={[styles.track, { backgroundColor: theme.colors.surface }]}>
              {day.totalCount > 0 && (
                <View style={[styles.pillWrapper, { width: `${day.pctOfMax * 100}%` }]}>
                  {day.segments.map((seg, i) => (
                    <View
                      key={`${day.dateKey}-${seg.color}-${i}`}
                      style={{
                        width: `${seg.percentage * 100}%`,
                        height: 24,
                        backgroundColor: seg.color,
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
  dayLabel: {
    width: 40,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  track: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pillWrapper: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
}));
