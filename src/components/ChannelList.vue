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
            <button @click="purgeAllChannels" 
                   class="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-sm text-red-500 transition-all"
                   title="Delete all channels">
              <i class="bi bi-trash"></i>
              <span class="hidden sm:inline">Tüm Kanalları Sil</span>
            </button>
            <button @click="showYoutubeLives = true" 
                    class="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-sm text-red-500 transition-all"
                    title="Find live broadcasts">
              <i class="bi bi-broadcast"></i>
              <span class="hidden sm:inline">{{ translate('channelList.liveStreams') }}</span>
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
                 class="text-sm text-gray-400 mb-2 pl-2 sticky top-0 bg-black/95 py-2 z-10 backdrop-blur flex items-center"
                 :class="{'text-red-500': category === 'Lives'}">
              <i v-if="category === 'Lives'" class="bi bi-broadcast mr-2 text-red-500"></i>
              {{ category === 'Lives' ? translate('channelList.lives') : category }}
              <span v-if="category === 'Lives'" class="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{{ translate('channelList.live') }}</span>
            </div>
            
            <div class="space-y-2">
              <button
                v-for="channel in filteredChannels[category]"
                :key="channel.id"
                @click="selectChannel(channel)"
                class="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-primary/10 flex items-center gap-3 group transition-all"
                :class="{'bg-primary/20': currentChannel?.id === channel.id, 'border border-red-500/30': channel.type?.includes('youtube-live')}"
              >
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 relative">
                  <img 
                    :src="channel.logo_url" 
                    :alt="channel.name"
                    class="w-full h-full object-contain p-1"
                    loading="lazy"
                  >
                  <div v-if="channel.type?.includes('youtube-live')" class="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <i class="bi bi-broadcast text-white text-xs"></i>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ channel.name }}</div>
                  <div class="text-xs text-gray-400">{{ translate('channelList.channel') }} {{ channel.channel_number }}</div>
                </div>

                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <i class="bi bi-play-fill text-primary"></i>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- User Streams Section -->
        <div v-if="store.hasUserStreams" class="mt-4">
          <h3 class="text-lg font-bold mb-2">{{ translate('channelList.userStreams') }}</h3>
          <div class="space-y-2">
            <button
              v-for="stream in store.userStreams" 
              :key="stream.id"
              @click="selectChannel(stream)"
              class="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-primary/10 flex items-center gap-3 group transition-all"
              :class="{'bg-primary/20': currentChannel?.id === stream.id}"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0 flex items-center justify-center">
                <i class="bi bi-broadcast text-2xl"></i>
              </div>

              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ stream.name }}</div>
                <div class="text-xs text-primary">{{ translate('channelList.liveStream') }}</div>
              </div>

              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="bi bi-play-fill text-primary"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Channel Modal -->
  <AddChannel v-if="showAddChannel" 
             @close="showAddChannel = false"
             @channel-added="handleChannelAdded" />

  <!-- YouTube Lives Modal -->
  <YouTubeLives v-if="showYoutubeLives" 
                @close="handleYoutubeLivesClose" />
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import { useLanguageStore } from '../stores/languageStore';
import { storeToRefs } from 'pinia';
import AddChannel from './AddChannel.vue';
import YouTubeLives from './YouTubeLives.vue';
import axios from 'axios';

export default {
  components: {
    AddChannel,
    YouTubeLives
  },
  
  emits: ['close'],
  
  setup() {
    const store = useChannelStore();
    const languageStore = useLanguageStore();
    const { currentChannel } = storeToRefs(store);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const showAddChannel = ref(false);
    const showYoutubeLives = ref(false);
    const channels = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const isResetting = ref(false);

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
      
      // Prioritize 'Lives' category if it exists
      if (allCategories.includes('Lives')) {
        // Remove 'Lives' from its current position
        const withoutLives = allCategories.filter(cat => cat !== 'Lives');
        // Add 'Lives' to the beginning
        return ['Lives', ...withoutLives];
      }
      
      return allCategories;
    });

    const selectChannel = (channel) => {
      store.setCurrentChannel(channel);
    };

    const handleChannelAdded = () => {
      // Refresh the channel list when a new channel is added
      fetchChannels();
    };

    const handleYoutubeLivesClose = () => {
      showYoutubeLives.value = false;
      // Refresh the channel list to include any newly added YouTube Live channels
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
      return languageStore.t(key);
    };

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
      showYoutubeLives,
      handleChannelAdded,
      channels,
      loading,
      error,
      store,
      handleYoutubeLivesClose,
      resetChannels,
      isResetting,
      selectCategory,
      translate,
      purgeAllChannels
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