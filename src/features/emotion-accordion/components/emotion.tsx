import { Pressable, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
};

export function Emotion({ label, color, isSelected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? 'transparent' : color,
          borderColor: isSelected ? color : 'transparent',
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: isSelected ? color : '#fff',
            fontWeight: isSelected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    textTransform: 'capitalize',
    includeFontPadding: false,
    fontFamily: 'Fraunces',
  },
});
