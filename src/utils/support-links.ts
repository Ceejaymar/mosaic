import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as MailComposer from 'expo-mail-composer';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Share } from 'react-native';

export async function openSupportEmail() {
  const os = Device.osName ?? Platform.OS;
  const osVersion = Device.osVersion ?? 'Unknown';
  const model = Device.modelName ?? 'Unknown';
  const appVersion =
    Application.nativeApplicationVersion ?? Application.applicationVersion ?? '1.0.0';

  const email = 'support@marceedigital.com';
  const subject = 'Mosaic Support Request';
  const body = `Please describe your issue or question below:\n\n\nDiagnostic Info (Please leave this for the developer):\nApp Version: ${appVersion}\nDevice: ${model}\nOS: ${os} ${osVersion}`;

  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({ recipients: [email], subject, body });
    } else {
      const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(mailto);
    }
  } catch (err) {
    console.error('Failed to open email client:', err);
  }
}

export async function openSurvey() {
  const SURVEY_URL = 'https://tally.so/r/XxeY6z';

  try {
    await Linking.openURL(SURVEY_URL);
  } catch (err) {
    console.error('Failed to open URL:', err);
  }
}

export const openPrivacyPolicy = async () => {
  // TODO: Replace with your actual Privacy Policy URL before launch
  await WebBrowser.openBrowserAsync('https://yourwebsite.com/privacy');
};

export const openTermsOfService = async () => {
  // TODO: Replace with your actual Terms of Service URL before launch
  await WebBrowser.openBrowserAsync('https://yourwebsite.com/terms');
};

export async function rateApp() {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    } else {
      alert(
        'Thank you for wanting to rate Mosaic! You can leave a review directly in the App Store.',
      );
    }
  } catch (error) {
    console.error('Error requesting review:', error);
  }
}

export async function shareApp() {
  try {
    await Share.share({
      message:
        "I've been using Mosaic for my daily check-ins. It's a beautiful, private journaling app. You should check it out!",
      // url: 'https://apps.apple.com/app/idYOUR_APP_ID', // Uncomment and add your App Store ID once published
    });
  } catch (error) {
    console.error('Error sharing app:', error);
  }
}
