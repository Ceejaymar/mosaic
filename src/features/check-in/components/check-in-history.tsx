import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

import { CheckInHistoryRow } from './check-in-history-row';

type Props = {
  entries: MoodEntry[];
  onEntryPress: (id: string) => void;
};

export function CheckInHistory({ entries, onEntryPress }: Props) {
  const colors = useAccessibleColors();

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText font="mono" colorVariant="muted" style={styles.heading}>
        Check-ins
      </AppText>

      {entries
        .flatMap((entry) => {
          const display = getMoodDisplayInfo(entry.primaryMood);
          return display ? [{ entry, display }] : [];
        })
        .map(({ entry, display }, index, visible) => (
          <View key={entry.id}>
            <CheckInHistoryRow
              occurredAt={entry.occurredAt}
              label={display.label}
              color={display.color}
              tags={parseStoredTags(entry.tags)}
              onPress={() => onEntryPress(entry.id)}
            />
            {index < visible.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: 32,
  },
  heading: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[2],
  },
  divider: {
    height: 0.5,
    marginLeft: 64,
  },
}));
