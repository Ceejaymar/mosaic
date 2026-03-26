import { withLayoutContext } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { interpolate } from 'react-native-reanimated';
import {
  type BlankStackNavigationOptions,
  createBlankStackNavigator,
} from 'react-native-screen-transitions/blank-stack';
import { useUnistyles } from 'react-native-unistyles';

import { OnboardingContext } from '@/src/features/onboarding/OnboardingContext';

// ─── Navigator ────────────────────────────────────────────────────────────────

const { Navigator } = createBlankStackNavigator();
const OnboardingStack = withLayoutContext<BlankStackNavigationOptions, typeof Navigator>(Navigator);

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function OnboardingLayout() {
  const { theme } = useUnistyles();
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  return (
    <OnboardingContext.Provider value={{ selectedIntents, setSelectedIntents }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <OnboardingStack
          screenOptions={{
            headerShown: false,
            screenStyleInterpolator: ({ progress, layouts: { screen } }) => {
              'worklet';
              return {
                contentStyle: {
                  opacity: interpolate(progress, [0, 1, 2], [0, 1, 0]),
                  transform: [
                    {
                      translateX: interpolate(progress, [0, 1, 2], [screen.width * 0.15, 0, 0]),
                    },
                    {
                      scale: interpolate(progress, [0, 1, 2], [0.98, 1, 0.98]),
                    },
                  ],
                },
              };
            },
            transitionSpec: {
              open: { stiffness: 200, damping: 25, mass: 1 },
              close: { stiffness: 200, damping: 25, mass: 1 },
            },
          }}
        >
          {/* Disable swipe-back on paywall so users can't bypass it */}
          <OnboardingStack.Screen name="step7" options={{ gestureEnabled: false }} />
        </OnboardingStack>
      </View>
    </OnboardingContext.Provider>
  );
}
