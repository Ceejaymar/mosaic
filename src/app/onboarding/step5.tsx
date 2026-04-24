import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar } from '@/src/features/onboarding/components/ProgressBar';
import { Step5Biometrics } from '@/src/features/onboarding/components/Step5Biometrics';
import { useAppStore } from '@/src/store/useApp';

export default function OnboardingStep5() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressWrap}>
        <ProgressBar currentStep={5} totalSteps={7} />
      </View>
      <View style={styles.content}>
        <Step5Biometrics
          onNext={(enabled) => {
            useAppStore.setState({ isAppLockEnabled: enabled });
            router.replace('/onboarding/step6');
          }}
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
