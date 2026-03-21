import 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { BlurView } from 'expo-blur';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';

import migrations from '@/drizzle/migrations';

import { db } from '@/src/db/client';
import { rescheduleAllNotifications } from '@/src/features/notifications/notificationService';
import { storage } from '@/src/services/storage/mmkv';
import { useAppStore } from '@/src/store/useApp';
import { authenticateUser } from '@/src/utils/auth-helper';

import '@/src/i18n/index';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

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
  const coldStartFired = useRef(false);

  // Cold launch: keep splash visible until biometric resolves
  useEffect(() => {
    if (!fontsLoaded || !migrationSuccess) return;
    if (coldStartFired.current) return; // Prevent re-running on settings toggle

    coldStartFired.current = true;

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
  const { rt } = useUnistyles();
  const isDarkTheme = rt.themeName === 'dark';

  const isAppLockEnabled = useAppStore((s) => s.isAppLockEnabled);
  const [isLocked, setIsLocked] = useState(startLocked);
  const [isBlurred, setIsBlurred] = useState(false);
  const didMountRef = useRef(false);
  const justUnlockedRef = useRef(true);
  const pendingAuthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performUnlock = useCallback(async () => {
    if (pendingAuthTimerRef.current) {
      clearTimeout(pendingAuthTimerRef.current);
      pendingAuthTimerRef.current = null;
    }
    const success = await authenticateUser();
    if (success) {
      justUnlockedRef.current = true;
      setIsBlurred(false);
      setIsLocked(false);
    } else {
      setIsLocked(true);
      Alert.alert('Mosaic Locked', 'Please authenticate to access your journal.', [
        { text: 'Try Again', onPress: performUnlock },
      ]);
    }
  }, []);

  // Trigger auth prompt on cold start failure
  useEffect(() => {
    if (startLocked) {
      performUnlock();
    }
  }, [startLocked, performUnlock]);

  // Respond to user toggling app lock in settings (skip initial mount)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (isAppLockEnabled) {
      // They just turned it ON. Verify they are actually the owner.
      const verifyEnable = async () => {
        setIsBlurred(true);
        const success = await authenticateUser();
        if (success) {
          justUnlockedRef.current = true;
          setIsBlurred(false);
          setIsLocked(false);
        } else {
          // They failed to verify. Revert the setting to false and remove blur.
          useAppStore.getState().toggleAppLock(false);
          setIsBlurred(false);
          setIsLocked(false);
          Alert.alert('Verification Failed', 'You must authenticate to enable App Lock.');
        }
      };
      verifyEnable();
    } else {
      // They just turned it OFF. Simply turn state off.
      setIsLocked(false);
      setIsBlurred(false);
    }
  }, [isAppLockEnabled]);

  // Replenish Surprise Me notifications on cold start and each foreground return
  useEffect(() => {
    const replenish = () => {
      const { isNotificationsEnabled, isSurpriseMeEnabled, reminderTimes } = useAppStore.getState();
      if (isNotificationsEnabled && isSurpriseMeEnabled) {
        rescheduleAllNotifications(reminderTimes, true, true).catch(() => {});
      }
    };

    replenish(); // cold start

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') replenish();
    });
    return () => sub.remove();
  }, []);

  // Resume lock: blur immediately on background, auth on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (pendingAuthTimerRef.current) {
          clearTimeout(pendingAuthTimerRef.current);
          pendingAuthTimerRef.current = null;
        }
        justUnlockedRef.current = false;
        if (isAppLockEnabled) setIsBlurred(true);
      }

      if (nextState === 'active' && isAppLockEnabled) {
        if (justUnlockedRef.current) {
          justUnlockedRef.current = false;
          return;
        }

        setIsBlurred(true);
        // Give iOS 250ms to fully wake the app from deep sleep before asking for Face ID
        pendingAuthTimerRef.current = setTimeout(async () => {
          pendingAuthTimerRef.current = null;
          const success = await authenticateUser();
          if (success) {
            justUnlockedRef.current = true;
            setIsBlurred(false);
            setIsLocked(false);
          } else {
            setIsBlurred(false);
            setIsLocked(true);
            Alert.alert('Mosaic Locked', 'Please authenticate to access your journal.', [
              { text: 'Try Again', onPress: performUnlock },
            ]);
          }
        }, 250);
      }
    });
    return () => {
      sub.remove();
      if (pendingAuthTimerRef.current) {
        clearTimeout(pendingAuthTimerRef.current);
        pendingAuthTimerRef.current = null;
      }
    };
  }, [isAppLockEnabled, performUnlock]);

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
      {(isBlurred || isLocked) && (
        <BlurView
          intensity={100}
          tint={isDarkTheme ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
        />
      )}
    </>
  );
}

export default Sentry.wrap(RootLayout);
