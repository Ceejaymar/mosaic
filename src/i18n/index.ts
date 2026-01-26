import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/src/i18n/locales/en.json';
import es from '@/src/i18n/locales/es.json';
import { mmkvAdapter } from '@/src/services/storage/mmkv';

const normalizeLang = (lng?: string | null) => {
  if (!lng) return undefined;
  return lng.split('-')[0]; // "en-US" -> "en"
};

const deviceLanguage = normalizeLang(getLocales()[0]?.languageCode) ?? 'en';
const savedLanguage = normalizeLang(mmkvAdapter.getItem('language'));
const initialLanguage = savedLanguage ?? deviceLanguage;

// if (!i18n.isInitialized) {
i18n.use(initReactI18next).init({
  initImmediate: false,
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
// }

export default i18n;
