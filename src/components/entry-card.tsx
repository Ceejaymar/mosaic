import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { Surface } from '@/src/components/surface';
import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { formatEntryTime } from '@/src/utils/format-date';

export function hexAlpha(hex: string, a: number): string {
  return `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

type EntryCardProps = {
  entry: MoodEntry;
  onPress: (id: string) => void;
};

export const EntryCard = memo(function EntryCard({ entry, onPress }: EntryCardProps) {
  const { theme } = useUnistyles();
  const info = getMoodDisplayInfo(entry.primaryMood);
  const accentColor = info?.color ?? theme.colors.mosaicGold;
  const label = info?.label ?? entry.primaryMood;
  const tags = parseStoredTags(entry.tags);

  const handlePress = useCallback(() => {
    hapticLight();
    onPress(entry.id);
  }, [entry.id, onPress]);

  const gradientColors = [hexAlpha(accentColor, 0), hexAlpha(accentColor, 0.2)] as const;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [cardStyles.pressable, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Surface
        variant="sheet"
        surfaceGradientColors={gradientColors}
        style={{ backgroundColor: theme.colors.tileBackground }}
      >
        <View style={cardStyles.body}>
          <AppText font="heading" style={[cardStyles.emotion, { color: accentColor }]}>
            {label}
          </AppText>

          {entry.note ? (
            <AppText
              font="heading"
              colorVariant="primary"
              style={cardStyles.note}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {entry.note}
            </AppText>
          ) : null}

          {tags.length > 0 && (
            <View style={cardStyles.tagRow}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[cardStyles.tag, { backgroundColor: hexAlpha(accentColor, 0.15) }]}
                >
                  <AppText style={[cardStyles.tagText, { color: accentColor }]}>{tag}</AppText>
                </View>
              ))}
            </View>
          )}

          <AppText colorVariant="muted" style={cardStyles.time}>
            {formatEntryTime(entry.occurredAt)}
          </AppText>
        </View>
      </Surface>
    </Pressable>
  );
});

const cardStyles = StyleSheet.create((theme) => ({
  pressable: {
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[2],
    borderRadius: theme.radius.sheet,
  },
  body: {
    padding: theme.spacing[5],
    gap: theme.spacing[2],
  },
  emotion: {
    fontSize: theme.fontSize.md,
    fontWeight: '700' as const,
  },
  note: {
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  tagRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing[2],
  },
  tag: {
    borderRadius: theme.radius.sheet,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  time: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    marginTop: theme.spacing[1],
  },
}));
