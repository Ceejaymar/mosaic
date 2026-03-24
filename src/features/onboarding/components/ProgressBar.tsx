import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <View
          key={step}
          style={[styles.segment, step <= currentStep ? styles.segmentFilled : styles.segmentEmpty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  row: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: '#C5A059',
  },
  segmentEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
}));
