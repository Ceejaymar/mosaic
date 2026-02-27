import 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';
import migrations from '@/drizzle/migrations';

import { db } from '@/src/db/client';
import '@/src/i18n/index';

Sentry.init({
  dsn: 'https://06641ea19a9965be5f3dcbdb6b3d04e5@o4510953598222336.ingest.us.sentry.io/4510953601236992',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Fraunces: require('../assets/fonts/Fraunces-VariableFont.ttf'),
    ...FontAwesome.font,
  });

  const { success: migrationSuccess, error: migrationError } = useMigrations(db, migrations);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
    if (migrationError) throw migrationError;
  }, [fontError, migrationError]);

  const isAppReady = fontsLoaded && migrationSuccess;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { rt } = useUnistyles();

  const currentTheme = rt.themeName;

  return (
    <>
      <SystemBars style={currentTheme === 'dark' ? 'light' : 'dark'} />
      <ThemeProvider value={currentTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="check-in/[id]"
              options={{ headerShown: false, gestureEnabled: true, animation: 'slide_from_right' }}
            />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </>
  );
}

export default Sentry.wrap(RootLayout);
