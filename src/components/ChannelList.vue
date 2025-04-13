<template>
  <div class="bg-black/95 backdrop-blur rounded-2xl border border-gray-800 p-4 h-[calc(100vh-6rem)]">
    <div class="flex flex-col h-full">
      <!-- Sabit Başlık Bölümü -->
      <div class="flex-shrink-0 space-y-4 pb-4 border-b border-gray-800">
        <!-- Başlık ve Kapat Butonu -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="bi bi-tv text-primary text-xl"></i>
            <h2 class="text-lg font-bold">{{ translate('channelList.title') }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <!-- Delete button that toggles delete mode -->
            <button @click="toggleDeleteMode" 
                   class="flex items-center gap-1 px-2 py-1 rounded-lg"
                   :class="deleteMode ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'"
                   title="Delete channels">
              <i class="bi bi-trash"></i>
            </button>
            
            <!-- Delete selected channels button - only shown in delete mode -->
            <button v-if="deleteMode && selectedChannels.length > 0" 
                   @click="deleteSelectedChannels"
                   class="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-sm text-red-500 transition-all"
                   title="Delete selected channels">
              <i class="bi bi-trash"></i>
              <span class="hidden sm:inline">{{ selectedChannels.length }} Kanalı Sil</span>
            </button>
            
            <button @click="showAddChannel = true" 
                    class="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center">
              <i class="bi bi-plus-lg"></i>
            </button>
            <button @click="$emit('close')" 
                    class="w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Arama ve Kategori Filtresi -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="translate('channelList.searchPlaceholder')"
              class="w-full bg-gray-800/50 rounded-xl px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
            <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <select 
            v-model="selectedCategory"
            class="bg-gray-800/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{{ translate('channelList.allChannels') }}</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <!-- Scrollable Kanal Listesi -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <div class="space-y-4 py-4">
          <div v-for="category in filteredCategories" :key="category">
            <div v-if="!selectedCategory" 
                 class="text-sm text-gray-400 mb-2 pl-2 sticky top-0 bg-black/95 py-2 z-10 backdrop-blur flex items-center">
              {{ category }}
            </div>
            
            <div class="space-y-2">
              <div
                v-for="channel in filteredChannels[category]"
                :key="channel.id"
                class="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-primary/10 flex items-center gap-3 group transition-all"
                :class="{'bg-primary/20': currentChannel?.id === channel.id && !deleteMode}"
              >
                <!-- Checkbox for selection in delete mode -->
                <div v-if="deleteMode" class="flex-shrink-0 mr-1">
                  <input 
                    type="checkbox" 
                    :checked="isChannelSelected(channel)"
                    @click.stop="toggleChannelSelection(channel)"
                    class="w-4 h-4 accent-primary cursor-pointer"
                  />
                </div>
                
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 relative">
                  <img 
                    :src="channel.logo_url" 
                    :alt="channel.name"
                    class="w-full h-full object-contain p-1"
                    loading="lazy"
                  >
                </div>

                <div 
                  class="flex-1 min-w-0"
                  @click="deleteMode ? toggleChannelSelection(channel) : selectChannel(channel)"
                >
                  <div class="font-medium truncate">{{ channel.name }}</div>
                  <div class="text-xs text-gray-400">{{ translate('channelList.channel') }} {{ channel.channel_number }}</div>
                </div>

                <div v-if="!deleteMode" class="opacity-0 group-hover:opacity-100 transition-opacity" @click="selectChannel(channel)">
                  <i class="bi bi-play-fill text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Streams Section -->
        <div v-if="store.hasUserStreams" class="mt-4">
          <h3 class="text-lg font-bold mb-2">{{ translate('channelList.userStreams') }}</h3>
          <div class="space-y-2">
            <div
              v-for="stream in store.userStreams" 
              :key="stream.id"
              class="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-primary/10 flex items-center gap-3 group transition-all"
              :class="{'bg-primary/20': currentChannel?.id === stream.id && !deleteMode}"
            >
              <!-- Checkbox for selection in delete mode -->
              <div v-if="deleteMode" class="flex-shrink-0 mr-1">
                <input 
                  type="checkbox" 
                  :checked="isChannelSelected(stream)"
                  @click.stop="toggleChannelSelection(stream)"
                  class="w-4 h-4 accent-primary cursor-pointer"
                />
              </div>
              
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 flex items-center justify-center">
                <i class="bi bi-broadcast text-2xl"></i>
              </div>

              <div 
                class="flex-1 min-w-0"
                @click="deleteMode ? toggleChannelSelection(stream) : selectChannel(stream)"
              >
                <div class="font-medium truncate">{{ stream.name }}</div>
                <div class="text-xs text-primary">{{ translate('channelList.liveStream') }}</div>
              </div>

              <div v-if="!deleteMode" class="opacity-0 group-hover:opacity-100 transition-opacity" @click="selectChannel(stream)">
                <i class="bi bi-play-fill text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Channel Modal -->
  <AddChannel v-if="showAddChannel" 
             @close="showAddChannel = false"
             @channel-added="handleChannelAdded" />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import { useLanguageStore } from '../stores/languageStore';
import { storeToRefs } from 'pinia';
import AddChannel from './AddChannel.vue';
import axios from 'axios';

export default {
  components: {
    AddChannel
  },
  
  emits: ['close'],
  
  setup() {
    const store = useChannelStore();
    const languageStore = useLanguageStore();
    const { currentChannel } = storeToRefs(store);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const showAddChannel = ref(false);
    const channels = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const isResetting = ref(false);
    
    // New variables for deletion functionality
    const deleteMode = ref(false);
    const selectedChannels = ref([]);

    const fetchChannels = async () => {
      try {
        loading.value = true;
        const response = await axios.get('https://macicast-backend.onrender.com/api/channels');
        channels.value = response.data;
        
        // Also merge any channels that might only exist in the store
        const storeChannels = store.channels;
        if (storeChannels.length > 0) {
          // Use Map to deduplicate by ID
          const channelMap = new Map();
          
          // Add existing channels to map
          channels.value.forEach(channel => {
            channelMap.set(channel.id, channel);
          });
          
          // Add store-only channels to map
          storeChannels.forEach(channel => {
            if (!channelMap.has(channel.id)) {
              channelMap.set(channel.id, channel);
            }
          });
          
          // Convert map back to array
          channels.value = Array.from(channelMap.values());
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        error.value = 'Kanal listesi yüklenirken bir hata oluştu.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchChannels);

    const categories = computed(() => 
      [...new Set(channels.value.map(channel => channel.category))].sort()
    );

    const filteredChannels = computed(() => {
      let filtered = channels.value;

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(channel => 
          channel.name.toLowerCase().includes(query) ||
          channel.channel_number.toString().includes(query)
        );
      }

      // Apply category filter
      if (selectedCategory.value) {
        filtered = filtered.filter(channel => 
          channel.category === selectedCategory.value
        );
      }

      // Group by category
      return filtered.reduce((acc, channel) => {
        const category = channel.category || 'Diğer';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(channel);
        return acc;
      }, {});
    });

    const filteredCategories = computed(() => {
      if (selectedCategory.value) {
        return [selectedCategory.value];
      }
      
      // Get all category names
      const allCategories = Object.keys(filteredChannels.value).sort();
      
      return allCategories;
    });

    const selectChannel = (channel) => {
      if (!deleteMode.value) {
        store.setCurrentChannel(channel);
      }
    };

    const handleChannelAdded = () => {
      // Refresh the channel list when a new channel is added
      fetchChannels();
    };

    const resetChannels = async () => {
      try {
        isResetting.value = true;
        error.value = null;
        
        // Call the reset endpoint on the server
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://macicast-backend.onrender.com/api';
        const response = await axios.get(`${apiBaseUrl}/channels/reset`);
        
        // Update local channels list with the reset data
        if (response.data.success) {
          channels.value = response.data.channels;
          
          // Also update the store with the reset channels
          store.setChannels(response.data.channels);
          
          // If user has a channel selected that's no longer in the list, reset to first channel
          if (currentChannel.value) {
            const stillExists = channels.value.some(ch => ch._id === currentChannel.value._id);
            if (!stillExists && channels.value.length > 0) {
              store.setCurrentChannel(channels.value[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error resetting channels:', err);
        error.value = 'Kanal listesi sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.';
      } finally {
        isResetting.value = false;
      }
    };

    const selectCategory = (category) => {
      selectedCategory.value = category;
    };

    const translate = (key) => {
      try {
        // Check if languageStore exists and has the t function
        if (languageStore && typeof languageStore.t === 'function') {
          return languageStore.t(key);
        } else {
          // Fallback for when languageStore.t is not available
          console.warn(`Translation function not available for key: ${key}`);
          
          // Return a simple fallback based on the key
          if (key === 'channelList.title') return 'Channels';
          if (key === 'channelList.searchPlaceholder') return 'Search channels...';
          if (key === 'channelList.allChannels') return 'All Channels';
          if (key === 'channelList.channel') return 'Channel';
          if (key === 'channelList.userStreams') return 'User Streams';
          if (key === 'channelList.liveStream') return 'Live Stream';
          
          // Extract the last part of the key as a fallback
          const parts = key.split('.');
          return parts[parts.length - 1].replace(/([A-Z])/g, ' $1').trim();
        }
      } catch (error) {
        console.error(`Error in translate function for key: ${key}`, error);
        return key;
      }
    };

    // Toggle delete mode on/off
    const toggleDeleteMode = () => {
      deleteMode.value = !deleteMode.value;
      if (!deleteMode.value) {
        // Clear selections when exiting delete mode
        selectedChannels.value = [];
      }
    };
    
    // Check if a channel is selected
    const isChannelSelected = (channel) => {
      return selectedChannels.value.some(ch => ch.id === channel.id);
    };
    
    // Toggle selection of a channel
    const toggleChannelSelection = (channel) => {
      if (isChannelSelected(channel)) {
        selectedChannels.value = selectedChannels.value.filter(ch => ch.id !== channel.id);
      } else {
        selectedChannels.value.push(channel);
      }
    };
    
    // Delete selected channels
    const deleteSelectedChannels = async () => {
      try {
        if (selectedChannels.value.length === 0) return;
        
        isResetting.value = true;
        error.value = null;
        
        if (!confirm(`Bu işlem seçili ${selectedChannels.value.length} kanalı kalıcı olarak silecektir. Devam etmek istiyor musunuz?`)) {
          isResetting.value = false;
          return;
        }
        
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://macicast-backend.onrender.com/api';
        
        // Track successful and failed deletions
        const deleteResults = {
          success: [],
          failed: []
        };
        
        // Separate channels into database channels and custom channels
        const dbChannels = [];
        const customChannels = [];
        
        // Identify database vs custom channels based on ID format
        selectedChannels.value.forEach(channel => {
          const channelId = channel.id || channel._id;
          // If ID starts with "custom-" or doesn't match MongoDB ObjectId format (24 hex chars)
          if (channelId && (
              channelId.toString().startsWith('custom-') || 
              !/^[0-9a-fA-F]{24}$/.test(channelId.toString())
            )) {
            customChannels.push(channel);
          } else {
            dbChannels.push(channel);
          }
        });
        
        console.log(`Processing ${dbChannels.length} database channels and ${customChannels.length} custom channels`);
        
        // Handle custom channels (remove from local state only)
        for (const channel of customChannels) {
          try {
            const channelId = channel.id || channel._id;
            
            // Remove from local list only (no API call)
            channels.value = channels.value.filter(ch => (ch.id !== channelId && ch._id !== channelId));
            
            // If this channel was currently selected, reset current channel
            if (currentChannel.value && (currentChannel.value.id === channelId || currentChannel.value._id === channelId)) {
              store.setCurrentChannel(null);
            }
            
            deleteResults.success.push(channel.name || channelId);
          } catch (err) {
            console.error(`Error removing custom channel ${channel.id || channel._id || 'unknown'}:`, err);
            deleteResults.failed.push(channel.name || 'Unknown channel');
          }
        }
        
        // Handle database channels (call API)
        for (const channel of dbChannels) {
          try {
            const channelId = channel.id || channel._id;
            
            if (!channelId) {
              console.error(`Cannot delete channel: Missing ID`, channel);
              deleteResults.failed.push(channel.name || 'Unknown channel');
              continue;
            }
            
            // Only try to delete from DB if it's not a custom channel
            await axios.delete(`${apiBaseUrl}/channels/${channelId}`);
            
            // Remove from local list
            channels.value = channels.value.filter(ch => (ch.id !== channelId && ch._id !== channelId));
            
            // If this channel was currently selected, reset current channel
            if (currentChannel.value && (currentChannel.value.id === channelId || currentChannel.value._id === channelId)) {
              store.setCurrentChannel(null);
            }
            
            deleteResults.success.push(channel.name || channelId);
          } catch (err) {
            console.error(`Error deleting channel ${channel.id || channel._id || 'unknown'}:`, err);
            deleteResults.failed.push(channel.name || 'Unknown channel');
          }
        }
        
        // Update store with remaining channels
        store.setChannels(channels.value);
        
        // Reset selection list
        selectedChannels.value = [];
        
        // Exit delete mode
        deleteMode.value = false;
        
        // Show results to user
        if (deleteResults.failed.length === 0) {
          alert('Seçili kanallar başarıyla silindi!');
        } else {
          const message = `${deleteResults.success.length} kanal başarıyla silindi.\n${deleteResults.failed.length} kanal silinirken hata oluştu.`;
          alert(message);
        }
      } catch (err) {
        console.error('Error deleting channels:', err);
        error.value = `Kanallar silinirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`;
        alert(`Kanallar silinirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      } finally {
        isResetting.value = false;
      }
    };
    
    // Legacy function for purging all channels - kept for backward compatibility
    const purgeAllChannels = async () => {
      try {
        isResetting.value = true;
        error.value = null;
        
        if (!confirm('Bu işlem tüm kanalları kalıcı olarak silecektir. Devam etmek istiyor musunuz?')) {
          isResetting.value = false;
          return;
        }
        
        // Call the purge endpoint on the server
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://macicast-backend.onrender.com/api';
        const response = await axios.delete(`${apiBaseUrl}/channels/purge`);
        
        // Update local channels list to empty list
        if (response.data && response.data.success) {
          channels.value = [];
          
          // Also update the store with empty channels
          store.setChannels([]);
          
          // Reset current channel
          store.setCurrentChannel(null);
          
          alert('Tüm kanallar başarıyla silindi!');
          
          // Refresh channels to ensure all UI elements update
          fetchChannels();
        } else {
          throw new Error(response.data.message || 'Channels could not be deleted');
        }
      } catch (err) {
        console.error('Error purging channels:', err);
        error.value = `Kanal listesi temizlenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`;
        alert(`Kanallar silinirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
      } finally {
        isResetting.value = false;
      }
    };

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredChannels,
      filteredCategories,
      currentChannel,
      selectChannel,
      showAddChannel,
      channels,
      loading,
      error,
      store,
      handleChannelAdded,
      resetChannels,
      isResetting,
      selectCategory,
      translate,
      purgeAllChannels,
      // New properties for delete functionality
      deleteMode,
      selectedChannels,
      toggleDeleteMode,
      isChannelSelected,
      toggleChannelSelection,
      deleteSelectedChannels
    };
  }
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.primary' / 30%) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: theme('colors.primary' / 30%);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: theme('colors.primary' / 50%);
}

/* Kategori başlıklarının arka planı için blur efekti */
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>