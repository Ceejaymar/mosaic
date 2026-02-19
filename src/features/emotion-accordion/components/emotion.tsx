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
          backgroundColor: color,
          borderColor: isSelected ? color : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isSelected ? color : '#fff',
            fontWeight: isSelected ? '700' : '400',
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    textTransform: 'capitalize',
    fontFamily: 'Fraunces',
    fontWeight: 'bold',
    // color: '#fff',
  },
});
