import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? (color ?? colors.typography) : colors.textMuted,
            fontWeight: isSelected ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
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
  const colors = useAccessibleColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
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

const styles = StyleSheet.create(() => ({
  container: { marginBottom: 24 },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
  },
}));
