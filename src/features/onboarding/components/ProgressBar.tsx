import { LinearGradient } from 'expo-linear-gradient';
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
        <View key={step} style={styles.segmentEmpty}>
          {step <= currentStep && (
            <LinearGradient
              colors={['#D4AF37', '#C5A059']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  row: { flexDirection: 'row', gap: 6, width: '100%' },
  segmentEmpty: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
}));
