<template>
  <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">M3U Listesini İçe Aktar</h2>
        <button @click="$emit('close')" 
                class="w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- M3U URL -->
        <div>
          <label class="block text-sm font-medium mb-1">M3U Liste URL</label>
          <input 
            v-model="m3uUrl"
            type="url"
            required
            placeholder="https://example.com/playlist.m3u8"
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
        </div>

        <!-- Default Category -->
        <div>
          <label class="block text-sm font-medium mb-1">Varsayılan Kategori</label>
          <select 
            v-model="defaultCategory"
            required
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Ulusal">Ulusal</option>
            <option value="Haber">Haber</option>
            <option value="Spor">Spor</option>
            <option value="Çocuk">Çocuk</option>
            <option value="Belgesel">Belgesel</option>
            <option value="Müzik">Müzik</option>
            <option value="IPTV">IPTV</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" class="text-green-500 text-sm">
          {{ statusMessage }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary/80 text-white rounded-xl py-3 font-medium 
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">İşleniyor...</span>
          <span v-else>M3U Listesini İçe Aktar</span>
        </button>
      </form>

      <!-- Channel List Preview (if channels are found) -->
      <div v-if="foundChannels.length > 0" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold">Bulunan Kanallar ({{ foundChannels.length }})</h3>
          <div class="flex items-center gap-2">
            <button 
              @click="toggleAllChannels"
              :disabled="loading"
              class="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded-xl"
            >
              {{ allSelected ? 'Seçimleri Kaldır' : 'Tümünü Seç' }}
            </button>
            <button 
              @click="addSelectedChannels"
              :disabled="loading || selectedCount === 0"
              class="bg-primary/80 hover:bg-primary text-white text-sm py-1 px-3 rounded-xl"
            >
              {{ selectedCount }} Kanalı Ekle
            </button>
          </div>
        </div>
        
        <!-- Channel list with scrollable container -->
        <div class="max-h-60 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          <div 
            v-for="(channel, index) in foundChannels" 
            :key="index"
            class="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg mb-1"
          >
            <div class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="channel.selected" 
                class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary cursor-pointer"
              />
              <div class="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                <i class="bi bi-broadcast" v-if="!channel.logo_url"></i>
                <img v-else :src="channel.logo_url" class="w-6 h-6 object-contain" alt="Channel logo">
              </div>
              <div class="truncate">
                <div class="font-medium truncate">{{ channel.name }}</div>
                <div class="text-xs text-gray-400 truncate">{{ channel.category }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import axios from 'axios';

export default {
  emits: ['close', 'channels-added'],
  
  setup(props, { emit }) {
    const store = useChannelStore();
    const m3uUrl = ref('');
    const defaultCategory = ref('IPTV');
    const loading = ref(false);
    const error = ref(null);
    const statusMessage = ref('');
    const foundChannels = ref([]);
    
    // Computed property to get the count of selected channels
    const selectedCount = computed(() => {
      return foundChannels.value.filter(channel => channel.selected).length;
    });
    
    // Computed property to check if all channels are selected
    const allSelected = computed({
      get: () => {
        return foundChannels.value.length > 0 && 
               foundChannels.value.every(channel => channel.selected);
      },
      set: (value) => {
        foundChannels.value.forEach(channel => {
          channel.selected = value;
        });
      }
    });
    
    // Function to parse M3U content and extract channels
    const parseM3U = (content) => {
      const lines = content.split('\n');
      const channels = [];
      let currentChannel = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines or comments not related to channel info
        if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
          continue;
        }
        
        // Extract channel info from #EXTINF line
        if (line.startsWith('#EXTINF')) {
          currentChannel = {
            name: '',
            stream_url: '',
            logo_url: '',
            category: defaultCategory.value,
            is_active: true,
            is_hls: true,
            selected: true
          };
          
          // Extract channel name
          const nameMatch = line.match(/,(.+)$/);
          if (nameMatch && nameMatch[1]) {
            currentChannel.name = nameMatch[1].trim();
          }
          
          // Extract channel logo if available
          const logoMatch = line.match(/tvg-logo="([^"]+)"/);
          if (logoMatch && logoMatch[1]) {
            currentChannel.logo_url = logoMatch[1];
          }
          
          // Extract channel group/category if available
          const groupMatch = line.match(/group-title="([^"]+)"/);
          if (groupMatch && groupMatch[1]) {
            currentChannel.category = groupMatch[1];
          }
        } 
        // Non-comment line after #EXTINF is the stream URL
        else if (currentChannel && !line.startsWith('#')) {
          currentChannel.stream_url = line;
          
          // Assign a channel number based on position in list
          currentChannel.channel_number = channels.length + 1;
          
          // Add to channels array
          channels.push({...currentChannel});
          currentChannel = null;
        }
      }
      
      return channels;
    };
    
    const handleSubmit = async () => {
      loading.value = true;
      error.value = null;
      statusMessage.value = '';
      foundChannels.value = [];
      
      try {
        // Fetch the M3U content
        const response = await axios.get(m3uUrl.value);
        
        if (!response.data) {
          throw new Error('M3U içeriği alınamadı');
        }
        
        // Parse the M3U content
        const channels = parseM3U(response.data);
        
        if (channels.length === 0) {
          throw new Error('M3U listesinde kanal bulunamadı');
        }
        
        // Set found channels for preview
        foundChannels.value = channels;
        statusMessage.value = `${channels.length} kanal bulundu!`;
        
      } catch (err) {
        console.error('Error fetching M3U list:', err);
        error.value = 'M3U listesi alınırken bir hata oluştu. Lütfen geçerli bir URL girdiğinizden emin olun.';
      } finally {
        loading.value = false;
      }
    };
    
    const toggleAllChannels = () => {
      allSelected.value = !allSelected.value;
    };
    
    const addSelectedChannels = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Filter selected channels
        const selectedChannels = foundChannels.value.filter(channel => channel.selected);
        
        if (selectedChannels.length === 0) {
          throw new Error('Seçilen kanal bulunamadı');
        }
        
        // Add selected channels to the store
        const channelsToAdd = selectedChannels.map(channel => {
          const { selected, ...channelData } = channel; // Remove selected property
          return {
            ...channelData,
            id: 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
          };
        });
        
        // Use the store to add the channels
        const addedChannels = channelsToAdd.map(channel => store.addChannel(channel));
        
        statusMessage.value = `${addedChannels.length} kanal başarıyla eklendi!`;
        emit('channels-added', addedChannels);
        
        // Mark added channels as not selected
        foundChannels.value.forEach(channel => {
          if (channel.selected) {
            channel.selected = false;
          }
        });
        
        // Close the modal after a short delay
        setTimeout(() => {
          emit('close');
        }, 1500);
        
      } catch (err) {
        console.error('Error adding channels:', err);
        error.value = 'Kanallar eklenirken bir hata oluştu.';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      m3uUrl,
      defaultCategory,
      loading,
      error,
      statusMessage,
      foundChannels,
      allSelected,
      selectedCount,
      handleSubmit,
      toggleAllChannels,
      addSelectedChannels
    };
  }
};
</script> 