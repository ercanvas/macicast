import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'https://macicast-backend.onrender.com/api';

export const useChannelStore = defineStore('channel', {
  state: () => ({
    channels: [],
    currentChannel: null,
    loading: false,
    error: null,
    volumeInfo: {
      level: 50,
      show: false
    },
    userStreams: []
  }),
  
  actions: {
    async fetchChannels() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('API çağrısı yapılıyor:', `${API_URL}/channels`);
        const response = await axios.get(`${API_URL}/channels`);
        console.log('API yanıtı:', response.data);
        
        if (Array.isArray(response.data)) {
          this.channels = response.data;
          // İlk kanalı varsayılan olarak seç
          if (this.channels.length > 0 && !this.currentChannel) {
            this.currentChannel = this.channels[0];
          }
        } else {
          throw new Error('API geçersiz veri formatı döndürdü');
        }
      } catch (error) {
        console.error('Kanal listesi alınırken hata:', error);
        this.error = 'Kanallar yüklenirken bir hata oluştu';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchChannels(query) {
      try {
        const response = await axios.get(`${API_URL}/channels/search`, {
          params: { q: query }
        });
        return response.data;
      } catch (error) {
        console.error('Kanal arama hatası:', error);
        throw error;
      }
    },
    
    setCurrentChannel(channel) {
      this.currentChannel = channel;
    },

    setVolumeInfo(info) {
      this.volumeInfo = info;
    },

    addUserStream(stream) {
      this.userStreams.push(stream);
    },

    removeUserStreams() {
      this.userStreams = [];
    },

    getAllChannels() {
      return [...this.channels, ...this.userStreams];
    }
  }
});