const IS_DEV = process.env.APP_ENV === 'development';

export default {
  expo: {
    name: IS_DEV ? 'Mosaic Dev' : 'Mosaic',
    slug: 'mosaic',
    description: 'A minimal emotion tracking app.',
    owner: 'marceedigital',
    version: '1.0.0',
    orientation: 'portrait',
    icon: IS_DEV ? './src/assets/images/dev-icon.png' : './src/assets/images/icon.png',
    scheme: IS_DEV ? 'mosaic-dev' : 'mosaic',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './src/assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: IS_DEV ? 'com.marceedigital.mosaic.dev' : 'com.marceedigital.mosaic',
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: IS_DEV
          ? './src/assets/images/dev-adaptive-icon.png'
          : './src/assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: IS_DEV ? 'com.marceedigital.mosaic.dev' : 'com.marceedigital.mosaic',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-font',
      'expo-web-browser',
      'expo-localization',
      'expo-sqlite',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'marcee',
        },
      ],
      'expo-mail-composer',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '6d4c33a3-bc65-4675-b4f7-e1835deaca5d',
      },
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/6d4c33a3-bc65-4675-b4f7-e1835deaca5d',
    },
  },
};
