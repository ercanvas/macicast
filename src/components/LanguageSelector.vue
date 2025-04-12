<template>
  <div class="bg-gray-800 rounded-lg p-5">
    <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
      <h2 class="text-xl font-bold">{{ $t('languages.title') }}</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    
    <div class="language-options grid grid-cols-1 gap-3">
      <button
        v-for="lang in languageStore.availableLanguages" 
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
        :class="{'bg-primary/20 border border-primary/40': lang.code === languageStore.currentLanguage}"
      >
        <span class="text-xl mr-3">{{ lang.icon }}</span>
        <span>{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { useLanguageStore } from '../stores/languageStore';

export default {
  name: 'LanguageSelector',
  emits: ['close'],
  
  setup(props, { emit }) {
    const languageStore = useLanguageStore();
    
    const selectLanguage = (langCode) => {
      languageStore.setLanguage(langCode);
      emit('close');
    };
    
    const $t = (key) => {
      return languageStore.t(key);
    };
    
    return {
      languageStore,
      selectLanguage,
      $t
    };
  }
}
</script>

<style scoped>
.language-options button {
  transition: all 0.2s ease;
}

.language-options button:hover {
  transform: translateX(5px);
}
</style> 