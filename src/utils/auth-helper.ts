import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateUser(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Mosaic',
      fallbackLabel: 'Use Passcode',
    });
    return result.success;
  }

  // No biometrics enrolled — allow access
  return true;
}
