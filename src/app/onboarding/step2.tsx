import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressBar } from '@/src/features/onboarding/components/ProgressBar';
import { Step2Intent } from '@/src/features/onboarding/components/Step2Intent';
import { useOnboardingContext } from '@/src/features/onboarding/OnboardingContext';

export default function OnboardingStep2() {
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { selectedIntents, setSelectedIntents } = useOnboardingContext();

  const handleToggle = (intent: string) => {
    setSelectedIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent],
    );
  };

  const handleNext = () => {
    posthog.capture('onboarding_intent_selected', { intents: selectedIntents });
    router.push('/onboarding/step3');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressWrap}>
        <ProgressBar currentStep={2} totalSteps={7} />
      </View>
      <View style={styles.content}>
        <Step2Intent
          selectedIntents={selectedIntents}
          onToggle={handleToggle}
          onNext={handleNext}
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
