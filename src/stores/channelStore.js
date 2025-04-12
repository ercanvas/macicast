import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'https://macicast-backend.onrender.com/api';

// Define fallback channels in case the API doesn't work
const fallbackChannels = [
  {
    id: 'fallback-1',
    name: 'TRT 1',
    channel_number: 1,
    stream_url: 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/TRT_1_logo_%282021-%29.svg/512px-TRT_1_logo_%282021-%29.svg.png',
    category: 'Ulusal',
    is_active: true,
    is_hls: true
  },
  {
    id: 'fallback-2',
    name: 'Show TV',
    channel_number: 2,
    stream_url: 'https://ciner-live.daioncdn.net/showtv/showtv.m3u8',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Show_TV_logo.svg/512px-Show_TV_logo.svg.png',
    category: 'Ulusal',
    is_active: true,
    is_hls: true
  }
];

export const useChannelStore = defineStore('channel', {
  state: () => ({
    channels: [],
    currentChannel: null,
    loading: false,
    error: null,
    volumeInfo: {
      level: 50,
      show: false
    }
  }),
  
  actions: {
    async fetchChannels() {
      this.loading = true;
      this.error = null;
      
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${apiBaseUrl}/channels`);
        
        // Use the API response if it contains channels
        if (response.data && response.data.length > 0) {
          this.channels = response.data;
          
          // Set the first channel as current if needed
          if (!this.currentChannel && this.channels.length > 0) {
            this.currentChannel = this.channels[0];
          }
        } 
        // Fallback to default channels if API returns empty array
        else {
          console.warn('API returned no channels, using fallback channels');
          this.channels = fallbackChannels;
          
          // Set the first channel as current
          if (!this.currentChannel && this.channels.length > 0) {
            this.currentChannel = this.channels[0];
          }
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        
        // Use fallback channels on error
        this.channels = fallbackChannels;
        
        // Set the first channel as current
        if (!this.currentChannel && this.channels.length > 0) {
          this.currentChannel = this.channels[0];
        }
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

    // Add new channel directly to the store
    addChannel(channel) {
      // Set a default ID if not provided
      if (!channel.id) {
        channel.id = 'custom-' + Date.now();
      }
      
      this.channels.push(channel);
      
      // If there's no current channel, set this as current
      if (!this.currentChannel) {
        this.setCurrentChannel(channel);
      }
      
      // Return the channel for convenience
      return channel;
    }
  }
});