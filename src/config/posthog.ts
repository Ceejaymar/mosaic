import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const rawApiKey = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const rawHost = Constants.expoConfig?.extra?.posthogHost as string | undefined;

// Normalize: trim whitespace so accidental padding doesn't pass the truthy check
const apiKey = rawApiKey?.trim();
const host = rawHost?.trim();

const isPostHogConfigured = !!apiKey && apiKey !== 'phc_your_project_token_here';

// Set allowPosthogInDev to true in expoConfig.extra to test analytics locally
const allowPosthogInDev = !!Constants.expoConfig?.extra?.allowPosthogInDev;

if (__DEV__) {
  console.log('PostHog config:', {
    apiKey: apiKey ? 'SET' : 'NOT SET',
    host: host ? 'SET' : 'NOT SET',
    isConfigured: isPostHogConfigured,
    allowPosthogInDev,
  });
}

if (!isPostHogConfigured) {
  console.warn(
    'PostHog project token not configured. Analytics will be disabled. ' +
      'Set posthogProjectToken under expoConfig.extra (or POSTHOG_PROJECT_TOKEN in your .env) to enable analytics.',
  );
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host,
  // Disabled when unconfigured, or in dev unless allowPosthogInDev is set
  disabled: !isPostHogConfigured || (__DEV__ && !allowPosthogInDev),
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});
