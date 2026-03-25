import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';

import { OnboardingFlow } from '@/src/features/onboarding/OnboardingFlow';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: theme.colors.background,
      }}
    >
      <OnboardingFlow />
    </View>
  );
}
