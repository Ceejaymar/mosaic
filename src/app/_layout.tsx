import 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';

import migrations from '@/drizzle/migrations';

import { db } from '@/src/db/client';
import { storage } from '@/src/services/storage/mmkv';
import { useAppStore } from '@/src/store/useApp';
import '@/src/i18n/index';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true, // drop-off tracking
});

Sentry.init({
  dsn: 'https://06641ea19a9965be5f3dcbdb6b3d04e5@o4510953598222336.ingest.us.sentry.io/4510953601236992',
  sendDefaultPii: false,

  tracesSampleRate: 1.0, // 1.0 captures 100% of transactions for testing, Adjust this down later to save quota
  enableAutoPerformanceTracing: true, // This enables the automatic tracing

  integrations: [navigationIntegration],

  // The "Scrubber" - ensures journal text never leaves the phone
  beforeSend(event) {
    if (event.user) delete event.user.ip_address;

    // Scrub potential journal text from logs/breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(
        (b) => b.category !== 'console' && b.category !== 'input',
      );
    }

    return event;
  },

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
    'OpenDyslexic-Regular': require('../assets/fonts/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('../assets/fonts/OpenDyslexic-Bold.otf'),
    ...FontAwesome.font,
  });

  const { success: migrationSuccess, error: migrationError } = useMigrations(db, migrations);

  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef) {
      // This tells Sentry: "Watch these specific route changes"
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    const ANON_ID_KEY = 'mosaic-anon-id';
    let persistentId = storage.getString(ANON_ID_KEY);

    if (!persistentId) {
      persistentId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      storage.set(ANON_ID_KEY, persistentId);
    }

    const deviceModel = Device.modelName || 'unknown_device';

    Sentry.setUser({
      id: `anon_${deviceModel}_${persistentId}`,
      username: 'Anon',
    });
  }, []);

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
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);

  const currentTheme = rt.themeName;
  const isDarkTheme = currentTheme === 'dark' || currentTheme === 'darkHighContrast';

  return (
    <>
      <SystemBars style={isDarkTheme ? 'light' : 'dark'} />
      <ThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="check-in/[id]"
              options={{
                headerShown: false,
                gestureEnabled: true,
                animation: reduceMotion ? 'none' : 'slide_from_right',
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </>
  );
}

export default Sentry.wrap(RootLayout);
