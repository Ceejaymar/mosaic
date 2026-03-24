import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

import { ProgressBar } from './components/ProgressBar';
import { Step1Intent } from './components/Step1Intent';
import { Step2Dynamic } from './components/Step2Dynamic';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingFlow() {
  const { theme } = useUnistyles();
  const posthog = usePostHog();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  const handleToggleIntent = (intent: string) => {
    setSelectedIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent],
    );
  };

  const handleStep1Next = () => {
    posthog.capture('onboarding_intent_selected', { intents: selectedIntents });
    setCurrentStep(2);
  };

  const primaryIntent = selectedIntents[0] ?? '';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Intent
            selectedIntents={selectedIntents}
            onToggle={handleToggleIntent}
            onNext={handleStep1Next}
          />
        );
      case 2:
        return <Step2Dynamic primaryIntent={primaryIntent} onNext={() => setCurrentStep(3)} />;
      case 3:
        return (
          <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
            Step 3 — Coming soon
          </AppText>
        );
      case 4:
        return (
          <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
            Step 4 — Coming soon
          </AppText>
        );
      case 5:
        return (
          <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
            Step 5 — Coming soon
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      {/* Step content */}
      <View style={styles.content}>{renderStep()}</View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  progressWrap: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[8],
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[5],
  },
}));
