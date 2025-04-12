import { defineStore } from 'pinia';
import enTranslations from '../config/languages/en.json';
import trTranslations from '../config/languages/tr.json';
import ruTranslations from '../config/languages/ru.json';
import arTranslations from '../config/languages/ar.json';

export const useLanguageStore = defineStore('language', {
  state: () => {
    // Try to get language from localStorage first
    const savedLanguage = localStorage.getItem('appLanguage') || 'en';
    
    return {
      currentLanguage: savedLanguage,
      availableLanguages: [
        { code: 'en', name: 'English', translations: enTranslations, icon: '🇬🇧', direction: 'ltr' },
        { code: 'tr', name: 'Türkçe', translations: trTranslations, icon: '🇹🇷', direction: 'ltr' },
        { code: 'ru', name: 'Русский', translations: ruTranslations, icon: '🇷🇺', direction: 'ltr' },
        { code: 'ar', name: 'العربية', translations: arTranslations, icon: '🇸🇦', direction: 'rtl' }
      ]
    };
  },
  
  getters: {
    translations: (state) => {
      const language = state.availableLanguages.find(lang => lang.code === state.currentLanguage);
      return language ? language.translations : enTranslations;
    },
    
    direction: (state) => {
      const language = state.availableLanguages.find(lang => lang.code === state.currentLanguage);
      return language ? language.direction : 'ltr';
    },
    
    currentLanguageInfo: (state) => {
      return state.availableLanguages.find(lang => lang.code === state.currentLanguage);
    }
  },
  
  actions: {
    setLanguage(languageCode) {
      if (this.availableLanguages.some(lang => lang.code === languageCode)) {
        this.currentLanguage = languageCode;
        localStorage.setItem('appLanguage', languageCode);
        
        // Update document direction for RTL languages
        document.documentElement.dir = this.direction;
        
        // Add language class to body for CSS targeting
        document.body.className = document.body.className
          .replace(/lang-\w+/g, '')
          .concat(` lang-${languageCode}`);
      }
    },
    
    t(key) {
      // Simple translation function
      // Supports dot notation: 'app.title'
      try {
        const parts = key.split('.');
        let translation = this.translations;
        
        for (const part of parts) {
          translation = translation[part];
          if (translation === undefined) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
          }
        }
        
        return translation;
      } catch (error) {
        console.warn(`Error getting translation for key: ${key}`, error);
        return key;
      }
    }
  }
}); 