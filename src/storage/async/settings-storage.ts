import { saveData, getData, keyExists } from './async-storage';

const prefix = 'settings:';

export function saveSetting<T>(name: string, value: T) {
  return saveData(`${prefix}${name}`, value);
}

export function getSetting(name: string) {
  return getData(`${prefix}${name}`);
}

export function settingExists(name: string) {
  return keyExists(`${prefix}${name}`);
}
