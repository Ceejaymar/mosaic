import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { Button, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

import { ProgressBar } from './components/ProgressBar';
import { Step1Welcome } from './components/Step1Welcome';
import { Step2Intent } from './components/Step2Intent';
import { Step3Reassurance } from './components/Step3Reassurance';
import { Step4Notifications } from './components/Step4Notifications';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

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

  const handleStep2Next = () => {
    posthog.capture('onboarding_intent_selected', { intents: selectedIntents });
    setCurrentStep(3);
  };

  const primaryIntent = selectedIntents[0] ?? '';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={() => setCurrentStep(2)} />;
      case 2:
        return (
          <Step2Intent
            selectedIntents={selectedIntents}
            onToggle={handleToggleIntent}
            onNext={handleStep2Next}
          />
        );
      case 3:
        return <Step3Reassurance primaryIntent={primaryIntent} onNext={() => setCurrentStep(4)} />;
      case 4:
        return <Step4Notifications onNext={() => setCurrentStep(5)} />;
      case 5:
        return (
          <View style={{ gap: 20, marginTop: 40 }}>
            <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
              Step 5 — Face ID (Coming soon)
            </AppText>
            <Button title="Continue to Step 6" onPress={() => setCurrentStep(6)} />
          </View>
        );
      case 6:
        return (
          <View style={{ gap: 20, marginTop: 40 }}>
            <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
              Step 6 — Analyzing / Loader (Coming soon)
            </AppText>
            <Button title="Continue to Step 7" onPress={() => setCurrentStep(7)} />
          </View>
        );
      case 7:
        return (
          <View style={{ gap: 20, marginTop: 40 }}>
            <AppText style={{ color: theme.colors.typography, textAlign: 'center' }}>
              Step 7 — The Value Reveal &amp; Paywall (Coming soon)
            </AppText>
            <Button title="Finish Onboarding" onPress={() => setCurrentStep(1)} />
          </View>
        );
      default:
        return null;
    }
  };

  const showProgress = currentStep > 1 && currentStep < 7;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress bar — hidden on welcome (step 1) and paywall (step 7) */}
      {showProgress && (
        <View style={styles.progressWrap}>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </View>
      )}

      {/* Step content */}
      <View style={[styles.content, !showProgress && styles.contentNoProgress]}>
        {renderStep()}
      </View>
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
  contentNoProgress: {
    paddingTop: theme.spacing[6],
  },
}));
