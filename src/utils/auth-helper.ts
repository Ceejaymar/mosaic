import * as LocalAuthentication from 'expo-local-authentication';

let isAuthenticating = false;

export const checkIsAuthenticating = () => isAuthenticating;

export async function authenticateUser(): Promise<boolean> {
  if (isAuthenticating) return false;
  isAuthenticating = true;
  try {
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
  } catch {
    return false;
  } finally {
    isAuthenticating = false;
  }
}
