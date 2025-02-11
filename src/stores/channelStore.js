import { defineStore } from 'pinia';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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
    userStreams: [] // Initialize userStreams array
  }),
  
  actions: {
    async fetchChannels() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/channels`);
        this.channels = response.data;
        
        if (this.channels.length > 0 && !this.currentChannel) {
          this.currentChannel = this.channels[0];
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        this.error = 'Kanallar yüklenirken bir hata oluştu';
      } finally {
        this.loading = false;
      }
    },

    setCurrentChannel(channel) {
      this.currentChannel = channel;
    },

    setVolumeInfo(info) {
      this.volumeInfo = info;
    },

    // Add user stream management actions
    addUserStream(stream) {
      const streamData = {
        ...stream,
        stream_url: stream.url, // Add this for compatibility with TVScreen
        type: 'user-stream',
        category: 'User Streams',
        channel_number: `U${this.userStreams.length + 1}`
      };

      // Check if stream already exists
      const exists = this.userStreams.find(s => s.id === stream.id);
      if (!exists) {
        this.userStreams.push(streamData);
      }
    },

    removeUserStream(streamId) {
      this.userStreams = this.userStreams.filter(s => s.id !== streamId);
    },

    removeUserStreams() {
      this.userStreams = [];
    },

    // Get all channels including user streams
    getAllChannels() {
      return [...this.channels, ...this.userStreams];
    }
  },

  getters: {
    // Add getters for easier access
    hasUserStreams: (state) => state.userStreams.length > 0,
    activeUserStreams: (state) => state.userStreams.filter(s => s.status === 'active')
  }
});