import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => {
    return import(`../locales/${language}/common.json`);
  }
  ))
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;