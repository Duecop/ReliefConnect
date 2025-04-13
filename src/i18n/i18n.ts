import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import hiTranslation from './locales/hi.json';
import frTranslation from './locales/fr.json';
import arTranslation from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  },
  hi: {
    translation: hiTranslation
  },
  fr: {
    translation: frTranslation
  },
  ar: {
    translation: arTranslation
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },
  });

// Add language change event listener for debugging
i18n.on('languageChanged', (lng) => {
  console.log(`Language changed to: ${lng}`);
  // Force re-render by triggering a small state change in document
  document.documentElement.lang = lng;
});

export default i18n; 