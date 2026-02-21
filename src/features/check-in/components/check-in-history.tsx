import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';

import { CheckInHistoryRow } from './check-in-history-row';

type Props = {
  /** All of today's entries — rendered newest-first. */
  entries: MoodEntry[];
  onEntryPress: (id: string) => void;
};

export function CheckInHistory({ entries, onEntryPress }: Props) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today</Text>

      {entries.map((entry, index) => {
        const display = getMoodDisplayInfo(entry.primaryMood);
        if (!display) return null;

        return (
          <View key={entry.id}>
            <CheckInHistoryRow
              occurredAt={entry.occurredAt}
              label={display.label}
              color={display.color}
              tags={parseStoredTags(entry.tags)}
              onPress={() => onEntryPress(entry.id)}
            />
            {index < entries.length - 1 && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  // Divider is inset to align with the label column (past time + squircle + gaps)
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginLeft: 88,
  },
}));
