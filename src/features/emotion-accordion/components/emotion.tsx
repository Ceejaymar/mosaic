import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label: string;
  baseColor: string;
  isSelected: boolean;
  onPress: () => void;
};

export function Emotion({ label, baseColor, isSelected, onPress }: Props) {
  const lightBg = `${baseColor}20`;

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
          backgroundColor: lightBg,
          borderColor: isSelected ? baseColor : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isSelected ? baseColor : '#333',
            fontWeight: isSelected ? '700' : '400',
          },
        ]}
      >
        {label}
      </Text>

      {/* {isSelected && <View style={[styles.dot, { backgroundColor: baseColor }]} />} */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
