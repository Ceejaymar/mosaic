import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

interface TagChipProps {
  label: string;
  isSelected: boolean;
  color: string | null;
  onPress: () => void;
}

export function TagChip({ label, isSelected, color, onPress }: TagChipProps) {
  const colors = useAccessibleColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: isSelected ? (color ?? colors.textMuted) : colors.divider,
          backgroundColor: isSelected ? colors.divider : 'transparent',
        },
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <AppText
        style={[
          styles.chipText,
          {
            color: isSelected ? (color ?? colors.typography) : colors.textMuted,
            fontWeight: isSelected ? '600' : '400',
          },
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

interface TagSectionProps {
  title: string;
  tags: readonly string[];
  selected: Set<string>;
  color: string | null;
  onToggle: (tag: string) => void;
}

export function TagSection({ title, tags, selected, color, onToggle }: TagSectionProps) {
  return (
    <View style={styles.container}>
      <AppText colorVariant="muted" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.tagGrid}>
        {tags.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            isSelected={selected.has(tag)}
            color={color}
            onPress={() => onToggle(tag)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { marginBottom: theme.spacing[6] },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
  chip: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
  },
}));
