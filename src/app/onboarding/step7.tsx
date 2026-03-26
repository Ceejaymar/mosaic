import { router } from 'expo-router';

import { Step7Paywall } from '@/src/features/onboarding/components/Step7Paywall';
import { useAppStore } from '@/src/store/useApp';

export default function OnboardingStep7() {
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  const handleComplete = () => {
    setHasOnboarded(true);
    router.replace('/(drawer)');
  };

  return (
    <Step7Paywall
      onClose={() => router.back()}
      onSubscribe={handleComplete}
      onRestore={handleComplete}
    />
  );
}
