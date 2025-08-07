import * as SecureStore from 'expo-secure-store';

export async function saveSecureItem<T>(key: string, value: T) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (e) {
    console.error(`SecureStore: error saving ${key}`, e);
    throw new Error('Secure save failed ');
  }
}

export async function getSecureItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
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
