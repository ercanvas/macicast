import { createI18n } from 'vue-i18n';
import { useLanguageStore } from './stores/languageStore';

// This file is just a placeholder to ensure proper imports.
// The actual translations are handled by the languageStore.

export default function setupI18n() {
  // This function is not used directly - the application uses languageStore instead.
  // It is here to ensure compatibility with any code expecting Vue I18n.
  console.log('Using languageStore for translations instead of Vue I18n');
}

// Helper function to get translation from the store
export function useTranslation() {
  const languageStore = useLanguageStore();
  
  return {
    t: (key) => {
      if (languageStore && typeof languageStore.t === 'function') {
        return languageStore.t(key);
      }
      return key;
    }
  };
} 