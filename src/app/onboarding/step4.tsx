import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar } from '@/src/features/onboarding/components/ProgressBar';
import { Step4Notifications } from '@/src/features/onboarding/components/Step4Notifications';

export default function OnboardingStep4() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressWrap}>
        <ProgressBar currentStep={4} totalSteps={7} />
      </View>
      <View style={styles.content}>
        <Step4Notifications onNext={() => router.push('/onboarding/step5')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  progressWrap: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[8],
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[5],
  },
}));
