// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import pa from './pa.json';

const LANGUAGE_KEY = 'user-language';
const resources = { en: { translation: en }, pa: { translation: pa } };

async function getInitialLang() {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) return saved;
  } catch (e) { /* ignore */ }

  const locales = Localization.getLocales && Localization.getLocales();
  const device = locales && locales.length > 0 ? locales[0].languageCode : 'en';
  return device === 'pa' ? 'pa' : 'en';
}

(async () => {
  const lng = await getInitialLang();
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4'
    });
})();

export { i18n, LANGUAGE_KEY };
export default i18n;
