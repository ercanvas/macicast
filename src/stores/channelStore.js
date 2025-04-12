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
    },
    liveMonitorActive: false
  }),
  
  getters: {
    hasUserStreams: (state) => state.channels.some(channel => channel.type === 'user-stream'),
    userStreams: (state) => state.channels.filter(channel => channel.type === 'user-stream'),
    liveChannels: (state) => state.channels.filter(channel => 
      channel.type === 'youtube-live-hls' || 
      (channel.category === 'Lives' && channel.is_hls === true)
    )
  },
  
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

      // Start monitoring live channels after fetching
      this.startLiveMonitoring();
    },

    // Start monitoring YouTube live channels
    startLiveMonitoring() {
      // Only start if not already active
      if (this.liveMonitorActive) return;
      
      // Check every 2 minutes
      const checkInterval = 2 * 60 * 1000;
      
      // Set up interval
      this.liveMonitorInterval = setInterval(() => {
        this.checkLiveChannelsStatus();
      }, checkInterval);
      
      this.liveMonitorActive = true;
      console.log('Live channel monitoring started');
    },
    
    // Stop monitoring when no longer needed
    stopLiveMonitoring() {
      if (this.liveMonitorInterval) {
        clearInterval(this.liveMonitorInterval);
        this.liveMonitorInterval = null;
        this.liveMonitorActive = false;
        console.log('Live channel monitoring stopped');
      }
    },
    
    // Check if YouTube live channels are still live
    async checkLiveChannelsStatus() {
      const youtubeChannels = this.channels.filter(channel => 
        channel.type === 'youtube-live-hls' || 
        channel.youtube_live_id
      );
      
      if (youtubeChannels.length === 0) {
        this.stopLiveMonitoring();
        return;
      }
      
      console.log(`Checking status of ${youtubeChannels.length} live channels...`);
      
      try {
        // Get all YouTube live IDs
        const videoIds = youtubeChannels
          .map(channel => channel.youtube_live_id || channel.stream_url)
          .filter(Boolean)
          .join(',');
        
        if (!videoIds) return;
        
        // Use the YouTube API to check if videos are still live
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) {
          console.warn('No YouTube API key found, skipping live check');
          return;
        }
        
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,liveStreamingDetails',
            id: videoIds,
            key: apiKey
          }
        });
        
        // Get list of videos that are not live anymore
        const returnedVideoIds = new Set(response.data.items.map(item => item.id));
        const offlineChannels = youtubeChannels.filter(channel => {
          const videoId = channel.youtube_live_id || channel.stream_url;
          return !returnedVideoIds.has(videoId) || 
            !response.data.items.find(item => 
              item.id === videoId && 
              item.snippet?.liveBroadcastContent === 'live'
            );
        });
        
        if (offlineChannels.length > 0) {
          console.log(`Removing ${offlineChannels.length} channels that are no longer live`);
          
          // Remove offline channels
          offlineChannels.forEach(channel => {
            const index = this.channels.findIndex(c => c.id === channel.id);
            if (index !== -1) {
              console.log(`Removing channel that is no longer live: ${channel.name}`);
              this.channels.splice(index, 1);
              
              // If current channel is removed, switch to another channel
              if (this.currentChannel?.id === channel.id) {
                this.currentChannel = this.channels.length > 0 ? this.channels[0] : null;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error checking live channels status:', error);
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