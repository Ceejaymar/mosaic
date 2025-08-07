import * as SecureStore from 'expo-secure-store';

export async function saveSecureItem<T>(key: string, value: T) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (e) {
    console.error(`SecureStore: error saving ${key}`, e);
    throw new Error('Secure save failed');
  }
}

export async function getSecureItem<T>(key: string): Promise<T | null> {
  try {
    const item = await SecureStore.getItemAsync(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`SecureStore: error reading ${key}`, e);
    return null;
  }
}

export async function deleteSecureItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.error(`SecureStore: error deleting ${key}`, e);
  }
}
