import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { OnboardingFlow } from '@/src/features/onboarding/OnboardingFlow';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <OnboardingFlow />
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
}));
