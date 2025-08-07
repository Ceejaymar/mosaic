import AsyncStorage from '@react-native-async-storage/async-storage';

export async function keyExists(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (e) {
    throw new Error('Failed to check key existence');
  }
}

export async function saveData<T>(key: string, value: T) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('Error saving data');
    }
  }
}

export async function getData(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('Error retrieving data');
    }
  }
}

export async function removeItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error('Error deleting data');
    }
  }
}
