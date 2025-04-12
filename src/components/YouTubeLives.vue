<template>
  <div class="youtube-lives">
    <div class="card bg-gray-900 border-gray-800 shadow-lg">
      <div class="card-header bg-gray-800 p-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white">YouTube Live Channels</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-white">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="card-body p-4">
        <div class="mb-4">
          <div class="relative">
            <input 
              v-model="searchQuery" 
              @keyup.enter="searchLiveChannels"
              class="w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Search for live channels..."
            />
            <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <button 
              @click="searchLiveChannels" 
              class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              :disabled="isLoading"
            >
              <i v-if="isLoading" class="bi bi-arrow-repeat animate-spin"></i>
              <i v-else class="bi bi-search"></i>
            </button>
          </div>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-900 text-white rounded">
          {{ error }}
        </div>
        
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin text-primary text-4xl mb-4">
            <i class="bi bi-arrow-repeat"></i>
          </div>
          <p class="text-gray-400">Searching for live channels...</p>
        </div>
        
        <div v-else-if="liveChannels.length === 0 && searched" class="text-center py-8">
          <i class="bi bi-tv-off text-4xl text-gray-600 mb-4"></i>
          <p class="text-gray-400">No live channels found</p>
        </div>
        
        <div v-else-if="liveChannels.length > 0" class="divide-y divide-gray-700">
          <div v-for="channel in liveChannels" :key="channel.id" class="py-3 flex items-center">
            <div class="relative w-32 h-20 mr-3 overflow-hidden rounded">
              <img :src="channel.thumbnail" class="w-full h-full object-cover" alt="thumbnail" />
              <div class="absolute bottom-1 right-1 bg-red-600 text-xs text-white px-1 rounded">LIVE</div>
            </div>
            <div class="flex-grow">
              <h3 class="font-medium text-white mb-1 line-clamp-2">{{ channel.title }}</h3>
              <p class="text-sm text-gray-400 mb-1">{{ channel.channelTitle }}</p>
              <div class="flex items-center text-xs text-gray-500">
                <span v-if="channel.viewCount">
                  <i class="bi bi-eye mr-1"></i>{{ formatNumber(channel.viewCount) }} viewers
                </span>
              </div>
            </div>
            <button 
              @click="addToChannels(channel)" 
              class="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none flex-shrink-0"
              :title="'Add ' + channel.title + ' to channels'"
            >
              <i class="bi bi-plus"></i>
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

export default {
  name: 'YouTubeLives',
  data() {
    return {
      searchQuery: '',
      liveChannels: [],
      isLoading: false,
      error: null,
      searched: false,
      channelCheckInterval: null
    };
  },
  methods: {
    async searchLiveChannels() {
      if (!this.searchQuery.trim()) {
        this.error = 'Please enter a search query';
        return;
      }
      
      this.isLoading = true;
      this.error = null;
      this.searched = true;
      
      try {
        // Using the YouTube Data API to search for live streams
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: this.searchQuery,
            type: 'video',
            eventType: 'live',
            key: process.env.YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY,
            maxResults: 10
          }
        });
        
        if (!response.data.items || response.data.items.length === 0) {
          this.liveChannels = [];
          return;
        }
        
        // Get additional details for each live video
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,statistics,liveStreamingDetails',
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY
          }
        });
        
        this.liveChannels = detailsResponse.data.items.map(item => ({
          id: item.id,
          title: item.snippet.title,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          viewCount: item.liveStreamingDetails?.concurrentViewers,
          description: item.snippet.description
        }));
      } catch (error) {
        console.error('Error searching live channels:', error);
        this.error = error.response?.data?.error?.message || 'Failed to search YouTube live channels';
      } finally {
        this.isLoading = false;
      }
    },
    
    async addToChannels(channel) {
      const channelStore = useChannelStore();
      
      try {
        // Find the highest channel number currently in use
        const lastChannelNumber = channelStore.channels.length > 0 
          ? Math.max(...channelStore.channels.map(ch => ch.channel_number || 0))
          : 0;
        
        // Get the API base URL
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://macicast-backend.onrender.com/api';
        
        // Create a new channel as YouTube Live embed
        const newChannel = {
          id: 'youtube-live-' + channel.id, // Ensure unique ID
          name: `${channel.channelTitle} - Live`,
          channel_number: lastChannelNumber + 1,
          // Direct YouTube embed URL - this is the most reliable option
          stream_url: `https://www.youtube.com/embed/${channel.id}?autoplay=1&controls=1&rel=0`,
          logo_url: channel.thumbnail,
          category: 'Lives', 
          is_active: true,
          is_hls: false, // Changed back to false since we're using embeds
          youtube_live_id: channel.id,
          type: 'youtube-live' // Use the standard embed type
        };
        
        console.log('Adding YouTube Live channel as direct embed:', newChannel);
        
        // Add to local store
        channelStore.addChannel(newChannel);
        
        // Set as current channel immediately
        channelStore.setCurrentChannel(newChannel);
        
        // Start monitoring the live status of all YouTube Live channels
        this.startChannelMonitoring();
        
        // Close the modal
        this.closeModal();
      } catch (error) {
        console.error('Error adding live channel:', error);
        this.error = 'Failed to add channel to your list';
      }
    },
    
    // Start monitoring YouTube live channels to detect when they go offline
    startChannelMonitoring() {
      // Clear any existing interval
      if (this.channelCheckInterval) {
        clearInterval(this.channelCheckInterval);
      }
      
      // Set up a new check every 5 minutes
      this.channelCheckInterval = setInterval(() => {
        this.checkLiveChannelsStatus();
      }, 5 * 60 * 1000); // 5 minutes
    },
    
    // Check the status of all YouTube live channels
    async checkLiveChannelsStatus() {
      const channelStore = useChannelStore();
      const youtubeChannels = channelStore.channels.filter(channel => 
        channel.type === 'youtube-live' || channel.type === 'youtube-live-hls'
      );
      
      if (youtubeChannels.length === 0) {
        // If no YouTube live channels, clear the interval
        if (this.channelCheckInterval) {
          clearInterval(this.channelCheckInterval);
          this.channelCheckInterval = null;
        }
        return;
      }
      
      // Get all YouTube live IDs
      const videoIds = youtubeChannels
        .map(channel => channel.youtube_live_id)
        .filter(Boolean)
        .join(',');
      
      if (!videoIds) return;
      
      try {
        // Check if videos are still live
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,liveStreamingDetails',
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY
          }
        });
        
        // Get list of videos that are not live anymore
        const returnedVideoIds = new Set(response.data.items.map(item => item.id));
        const offlineChannels = youtubeChannels.filter(channel => 
          !returnedVideoIds.has(channel.youtube_live_id) || 
          !response.data.items.find(item => 
            item.id === channel.youtube_live_id && 
            item.snippet?.liveBroadcastContent === 'live'
          )
        );
        
        // Remove offline channels
        offlineChannels.forEach(channel => {
          const index = channelStore.channels.findIndex(c => c.id === channel.id);
          if (index !== -1) {
            console.log(`Removing channel that is no longer live: ${channel.name}`);
            channelStore.channels.splice(index, 1);
          }
        });
      } catch (error) {
        console.error('Error checking live channels status:', error);
      }
    },
    
    formatNumber(num) {
      if (!num) return '0';
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    },
    
    closeModal() {
      this.$emit('close');
    }
  },
  
  mounted() {
    // Optional: Add suggested live channels on initial load
    this.searchQuery = 'news live';
    this.searchLiveChannels();
    
    // Start monitoring if there are already YouTube live channels
    this.startChannelMonitoring();
  },
  
  beforeUnmount() {
    // Clear the interval when component is unmounted
    if (this.channelCheckInterval) {
      clearInterval(this.channelCheckInterval);
      this.channelCheckInterval = null;
    }
  }
};
</script>

<style scoped>
.youtube-lives {
  max-width: 600px;
  margin: 0 auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 