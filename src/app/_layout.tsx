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
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';

import migrations from '@/drizzle/migrations';

import { AppLockOverlay } from '@/src/components/app-lock-overlay';
import { db } from '@/src/db/client';
import { storage } from '@/src/services/storage/mmkv';
import { useAppStore } from '@/src/store/useApp';
import { authenticateUser } from '@/src/utils/auth-helper';

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

  const isAppLockEnabled = useAppStore((s) => s.isAppLockEnabled);
  const [isAuthComplete, setIsAuthComplete] = useState(false);
  const [coldStartLocked, setColdStartLocked] = useState(false);

  // Cold launch: keep splash visible until biometric resolves
  useEffect(() => {
    if (!fontsLoaded || !migrationSuccess) return;
    if (!isAppLockEnabled) {
      setIsAuthComplete(true);
      return;
    }
    authenticateUser().then((success) => {
      if (!success) setColdStartLocked(true);
      setIsAuthComplete(true);
    });
  }, [fontsLoaded, migrationSuccess, isAppLockEnabled]);

  const isAppReady = fontsLoaded && migrationSuccess && isAuthComplete;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) return null;

  return <RootLayoutNav startLocked={coldStartLocked} />;
}

function RootLayoutNav({ startLocked = false }: { startLocked?: boolean }) {
  const { rt, theme } = useUnistyles();
  const isDarkTheme = rt.themeName === 'dark';

  const isAppLockEnabled = useAppStore((s) => s.isAppLockEnabled);
  const [isLocked, setIsLocked] = useState(startLocked);
  const [isBlurred, setIsBlurred] = useState(false);
  const didMountRef = useRef(false);
  const justUnlockedRef = useRef(true);

  const performUnlock = useCallback(async () => {
    const success = await authenticateUser();
    if (success) {
      justUnlockedRef.current = true;
      setIsBlurred(false);
      setIsLocked(false);
    }
  }, []);

  // Respond to user toggling app lock in settings (skip initial mount)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!isAppLockEnabled) {
      setIsLocked(false);
      setIsBlurred(false);
    } else {
      setIsLocked(true);
    }
  }, [isAppLockEnabled]);

  // Resume lock: blur immediately on background, auth on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        justUnlockedRef.current = false;
        if (isAppLockEnabled) setIsBlurred(true);
      }

      if (nextState === 'active' && isAppLockEnabled) {
        if (justUnlockedRef.current) {
          justUnlockedRef.current = false;
          return;
        }

        setIsBlurred(true);
        const success = await authenticateUser();
        if (success) {
          justUnlockedRef.current = true;
          setIsBlurred(false);
          setIsLocked(false);
        } else {
          setIsBlurred(false);
          setIsLocked(true);
        }
      }
    });
    return () => sub.remove();
  }, [isAppLockEnabled]);

  return (
    <>
      <SystemBars style={isDarkTheme ? 'light' : 'dark'} />
      <ThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="check-in/[id]"
              options={() => ({
                headerShown: false,
                gestureEnabled: true,
                animation: useAppStore.getState().accessibility.reduceMotion
                  ? 'none'
                  : 'slide_from_right',
              })}
            />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
      {isBlurred && !isLocked && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.background,
            opacity: 0.97,
          }}
        />
      )}
      {isLocked && <AppLockOverlay onUnlock={performUnlock} />}
    </>
  );
}

export default Sentry.wrap(RootLayout);
