<template>
  <div class="youtube-to-hls">
    <div class="card bg-gray-900 border-gray-800 shadow-lg">
      <div class="card-header bg-gray-800 p-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white">{{ $t('youtubeToHLS.title') }}</h2>
        <button 
          @click="closeModal" 
          class="rounded-full h-8 w-8 bg-gray-700 hover:bg-gray-600 flex items-center justify-center focus:outline-none transition-colors"
          :title="$t('common.close')"
        >
          <i class="bi bi-x-lg text-gray-300"></i>
        </button>
      </div>
      <div class="card-body p-4">
        <div v-if="step === 'search'">
          <div class="mb-4">
            <label class="block text-gray-300 mb-2">{{ $t('youtubeToHLS.channelName') }}</label>
            <div class="flex">
              <input 
                v-model="channelName" 
                @keyup.enter="searchChannel"
                class="flex-grow px-3 py-2 rounded-l bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                :placeholder="$t('youtubeToHLS.enterChannelName')"
              />
              <button 
                @click="searchChannel" 
                class="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none"
                :disabled="loading"
              >
                <span v-if="loading">{{ $t('common.searching') }}</span>
                <span v-else>{{ $t('common.search') }}</span>
              </button>
            </div>
          </div>
          
          <div v-if="error" class="mb-4 p-3 bg-red-900 text-white rounded">
            {{ error }}
          </div>
          
          <div v-if="channelData" class="mb-4">
            <div class="flex items-center mb-4">
              <img :src="channelData.channelThumbnail" class="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 class="text-xl font-bold text-white">{{ channelData.channelTitle }}</h3>
                <p class="text-gray-400">{{ channelData.videos.length }} {{ $t('youtubeToHLS.videosFound') }}</p>
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-300 mb-2">{{ $t('youtubeToHLS.videoCount') }}</label>
              <input 
                v-model.number="videoCount" 
                type="number" 
                min="1" 
                :max="channelData.videos.length"
                class="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div class="flex justify-between">
              <button @click="step = 'search'; channelData = null" class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none">
                {{ $t('common.cancel') }}
              </button>
              <button 
                @click="createChannel" 
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
                :disabled="creating"
              >
                <span v-if="creating">{{ $t('youtubeToHLS.creating') }}</span>
                <span v-else>{{ $t('youtubeToHLS.createChannel') }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="step === 'preview' && channelInfo">
          <div class="flex items-center mb-4">
            <div class="bg-green-700 text-white rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ $t('youtubeToHLS.channelCreated') }}</h3>
              <p class="text-gray-400">{{ $t('youtubeToHLS.channelAdded') }}</p>
            </div>
          </div>
          
          <div class="p-4 bg-gray-800 rounded mb-4">
            <h4 class="font-semibold text-white mb-2">{{ $t('youtubeToHLS.channelDetails') }}</h4>
            <div class="flex justify-between text-gray-300 mb-1">
              <span>{{ $t('youtubeToHLS.name') }}:</span>
              <span>{{ channelInfo.channel.name }}</span>
            </div>
            <div class="flex justify-between text-gray-300 mb-1">
              <span>{{ $t('youtubeToHLS.channelNumber') }}:</span>
              <span>{{ channelInfo.channel.number }}</span>
            </div>
            <div class="flex justify-between text-gray-300 mb-1">
              <span>{{ $t('youtubeToHLS.videosToProcess') }}:</span>
              <span>{{ channelInfo.stream.videoCount }}</span>
            </div>
            <div class="flex justify-between text-gray-300">
              <span>{{ $t('youtubeToHLS.status') }}:</span>
              <span class="text-yellow-400">{{ $t('youtubeToHLS.processing') }}</span>
            </div>
          </div>
          
          <div class="mb-4 p-3 bg-blue-900 text-white rounded">
            <p>{{ $t('youtubeToHLS.processingMessage') }}</p>
            <p class="mt-2">{{ $t('youtubeToHLS.switchChannel', { number: channelInfo.channel.number }) }}</p>
          </div>
          
          <div class="flex justify-end">
            <button @click="closeModal" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useChannelStore } from '../stores/channelStore';
import { useLanguageStore } from '../stores/languageStore';

export default {
  name: 'YouTubeToHLS',
  setup() {
    const languageStore = useLanguageStore();
    
    const $t = (key, params = {}) => {
      // Basic interpolation for params
      let translation = languageStore.t(key);
      
      // Replace parameters in translation
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
      
      return translation;
    };
    
    return {
      $t
    };
  },
  data() {
    return {
      step: 'search',
      channelName: '',
      videoCount: 10,
      channelData: null,
      channelInfo: null,
      loading: false,
      creating: false,
      error: null
    };
  },
  methods: {
    async searchChannel() {
      if (!this.channelName) {
        this.error = this.$t('youtubeToHLS.enterChannelNameError');
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/youtube/search`, {
          params: {
            query: this.channelName,
            videoCount: 25 // Get more videos than needed to give options
          }
        });
        
        this.channelData = response.data;
        this.videoCount = Math.min(10, this.channelData.videos.length);
      } catch (error) {
        console.error('Error searching channel:', error);
        this.error = error.response?.data?.error || 'Failed to search YouTube channel';
      } finally {
        this.loading = false;
      }
    },
    
    async createChannel() {
      if (!this.channelData) return;
      
      this.creating = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/youtube/channel`, {
          channelName: this.channelData.channelTitle,
          videoCount: this.videoCount
        });
        
        this.channelInfo = response.data;
        this.step = 'preview';
        
        // Refresh channel list
        const channelStore = useChannelStore();
        channelStore.fetchChannels();
      } catch (error) {
        console.error('Error creating channel:', error);
        this.error = error.response?.data?.error || 'Failed to create YouTube channel';
      } finally {
        this.creating = false;
      }
    },
    
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.youtube-to-hls {
  max-width: 600px;
  margin: 0 auto;
}
</style> 