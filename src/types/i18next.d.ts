import 'i18next';
import type en from '../i18n/locales/en.json';
import type es from '../i18n/locales/es.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
      // translation: typeof es; do we need this?
    };
  }
}
