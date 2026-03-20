import * as Device from 'expo-device';
import * as MailComposer from 'expo-mail-composer';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

export async function openSupportEmail() {
  const os = Device.osName ?? Platform.OS;
  const osVersion = Device.osVersion ?? 'Unknown';
  const model = Device.modelName ?? 'Unknown';
  const appVersion = '1.0.0';

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
