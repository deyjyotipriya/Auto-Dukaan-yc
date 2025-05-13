import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import hinglishTranslation from './locales/hinglish.json';
import bnTranslation from './locales/bn.json';
import banglishTranslation from './locales/banglish.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
      hinglish: {
        translation: hinglishTranslation,
      },
      bn: {
        translation: bnTranslation,
      },
      banglish: {
        translation: banglishTranslation,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;