import { Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
};

export function Emotion({ label, color, isSelected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? 'transparent' : color,
          borderColor: isSelected ? color : 'transparent',
        },
      ]}
    >
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.7}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '32%',
    aspectRatio: 2.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    textTransform: 'capitalize',
    includeFontPadding: false,
    fontFamily: 'Fraunces',
    // lineHeight: 18,
  },
});
