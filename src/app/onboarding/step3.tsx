import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar } from '@/src/features/onboarding/components/ProgressBar';
import { Step3Reassurance } from '@/src/features/onboarding/components/Step3Reassurance';
import { useOnboardingContext } from '@/src/features/onboarding/OnboardingContext';

export default function OnboardingStep3() {
  const insets = useSafeAreaInsets();
  const { selectedIntents } = useOnboardingContext();
  const primaryIntent = selectedIntents[0] ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressWrap}>
        <ProgressBar currentStep={3} totalSteps={7} />
      </View>
      <View style={styles.content}>
        <Step3Reassurance
          primaryIntent={primaryIntent}
          onNext={() => router.push('/onboarding/step4')}
        />
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
