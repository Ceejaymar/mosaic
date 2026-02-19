import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import {
  dateToKey,
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
} from '@/src/db/repos/moodRepo';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import { MoodSlot } from '@/src/features/check-in/components/mood-slot';
import {
  getCurrentTimeSlot,
  getTimeSlotForOccurredAt,
  SLOT_DEFAULT_HOURS,
  TIME_SLOTS,
  type TimeSlot,
} from '@/src/features/check-in/utils/time-of-day';
import { EMOTIONS_CONTENT } from '@/src/features/emotion-accordion/content';
import { EMOTION_PALETTES } from '@/src/features/emotion-accordion/palettes';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { uuid } from '@/src/lib/uuid';

const TAB_BAR_HEIGHT = 90;

function getMoodDisplayInfo(nodeId: string): { label: string; color: string } | null {
  const node = EMOTIONS_CONTENT.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const palette =
    EMOTION_PALETTES.default[node.groupId as keyof (typeof EMOTION_PALETTES)['default']];
  const color = palette?.[node.colorIndex];
  if (!color) return null;
  return { label: node.label, color };
}

export default function CheckInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<TimeSlot | null>(null);
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);

  const currentSlot = getCurrentTimeSlot();
  const isDark = theme.colors.background !== '#ffffff';

  const loadTodayEntries = useCallback(async () => {
    const entries = await fetchMoodEntriesForDate(dateToKey());
    setTodayEntries(entries);
  }, []);

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  // Most recent entry per time slot
  const slotEntries = useMemo(() => {
    const map: Partial<Record<TimeSlot, MoodEntry>> = {};
    for (const entry of todayEntries) {
      const slot = getTimeSlotForOccurredAt(entry.occurredAt);
      const existing = map[slot];
      if (!existing || entry.occurredAt > existing.occurredAt) {
        map[slot] = entry;
      }
    }
    return map;
  }, [todayEntries]);

  const handleSlotPress = (slot: TimeSlot) => {
    hapticLight();
    setActiveSlot(slot);
    setSheetVisible(true);
  };

  const handleSave = async (nodeId: string, note?: string) => {
    if (!activeSlot) return;

    const now = new Date();
    const isCurrentSlot = getCurrentTimeSlot() === activeSlot;

    let occurredAt: string;
    if (isCurrentSlot) {
      occurredAt = now.toISOString();
    } else {
      const d = new Date();
      d.setHours(SLOT_DEFAULT_HOURS[activeSlot], 0, 0, 0);
      occurredAt = d.toISOString();
    }

    await insertMoodEntry({
      id: uuid(),
      dateKey: dateToKey(now),
      primaryMood: nodeId,
      note: note ?? null,
      occurredAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await loadTodayEntries();
    setSheetVisible(false);
    setActiveSlot(null);
  };

  // Date label: "THURSDAY · FEBRUARY 19"
  const dateLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase()
    .replace(',', ' ·');

  const mosaicGold = '#E0C097';
  const mutedText = '#8E8E93';
  const surfaceColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const dividerColor = isDark ? '#3A3A3C' : '#D1D1D6';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={[styles.greeting, { color: theme.colors.typography }]}>
          How are you feeling{'\n'}
          {t(`dashboard.time_of_day.${currentSlot}`)}?
        </Text>

        {/* Date */}
        <Text style={[styles.dateLabel, { color: mutedText }]}>{dateLabel}</Text>

        {/* 2×2 Mood Grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {TIME_SLOTS.slice(0, 2).map((slot) => {
              const entry = slotEntries[slot];
              const display = entry ? getMoodDisplayInfo(entry.primaryMood) : null;
              return (
                <MoodSlot
                  key={slot}
                  slot={slot}
                  isCurrentSlot={slot === currentSlot}
                  moodColor={display?.color}
                  moodLabel={display?.label}
                  onPress={() => handleSlotPress(slot)}
                />
              );
            })}
          </View>
          <View style={styles.gridRow}>
            {TIME_SLOTS.slice(2).map((slot) => {
              const entry = slotEntries[slot];
              const display = entry ? getMoodDisplayInfo(entry.primaryMood) : null;
              return (
                <MoodSlot
                  key={slot}
                  slot={slot}
                  isCurrentSlot={slot === currentSlot}
                  moodColor={display?.color}
                  moodLabel={display?.label}
                  onPress={() => handleSlotPress(slot)}
                />
              );
            })}
          </View>
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={() => handleSlotPress(currentSlot)}
          style={({ pressed }) => [
            styles.checkInBtn,
            { backgroundColor: mosaicGold },
            pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Check in now"
        >
          <Text style={styles.checkInBtnLabel}>+ Check in now</Text>
        </Pressable>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: surfaceColor }]}>
          <View style={styles.statGroup}>
            <Text style={[styles.statNum, { color: theme.colors.typography }]}>
              {todayEntries.length}
            </Text>
            <Text style={[styles.statLbl, { color: mutedText }]}>logged today</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
          <View style={styles.statGroup}>
            <Text style={[styles.statNum, { color: theme.colors.typography }]}>1</Text>
            <Text style={[styles.statLbl, { color: mutedText }]}>day streak</Text>
          </View>
        </View>
      </ScrollView>

      <CheckInSheet
        visible={sheetVisible}
        slot={activeSlot ?? currentSlot}
        onClose={() => {
          setSheetVisible(false);
          setActiveSlot(null);
        }}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    fontSize: 34,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 28,
  },
  grid: {
    gap: 4,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  checkInBtn: {
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInBtnLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#050505',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 20,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statNum: {
    fontSize: 17,
    fontWeight: '700',
  },
  statLbl: {
    fontSize: 15,
  },
  statDivider: {
    width: 1,
    height: 16,
    borderRadius: 1,
  },
}));
