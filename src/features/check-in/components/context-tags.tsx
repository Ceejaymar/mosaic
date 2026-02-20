import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface TagChipProps {
  label: string;
  isSelected: boolean;
  color: string | null;
  onPress: () => void;
}

export function TagChip({ label, isSelected, color, onPress }: TagChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip(isSelected, color), pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <Text style={styles.chipText(isSelected, color)}>{label}</Text>
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
      <Text style={styles.title}>{title}</Text>
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
  container: { marginBottom: 24 },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: (isSelected: boolean, color: string | null) => ({
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: isSelected ? (color ?? theme.colors.textMuted) : theme.colors.divider,
    backgroundColor: isSelected ? theme.colors.divider : 'transparent',
  }),
  chipText: (isSelected: boolean, color: string | null) => ({
    fontSize: 14,
    color: isSelected ? (color ?? theme.colors.typography) : theme.colors.textMuted,
    fontWeight: isSelected ? '600' : '400',
  }),
}));
