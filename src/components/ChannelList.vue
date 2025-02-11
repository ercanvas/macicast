<template>
  <div class="bg-black/95 backdrop-blur rounded-2xl border border-gray-800 p-4 h-[calc(100vh-6rem)]">
    <div class="flex flex-col h-full">
      <!-- Sabit Başlık Bölümü -->
      <div class="flex-shrink-0 space-y-4 pb-4 border-b border-gray-800">
        <!-- Başlık ve Kapat Butonu -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="bi bi-tv text-primary text-xl"></i>
            <h2 class="text-lg font-bold">Kanal Listesi</h2>
          </div>
          <div class="flex items-center gap-2">
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
              placeholder="Kanal ara..."
              class="w-full bg-gray-800/50 rounded-xl px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
            <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <select 
            v-model="selectedCategory"
            class="bg-gray-800/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Tüm Kanallar</option>
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
                 class="text-sm text-gray-400 mb-2 pl-2 sticky top-0 bg-black/95 py-2 z-10 backdrop-blur">
              {{ category }}
            </div>
            
            <div class="space-y-2">
              <button
                v-for="channel in filteredChannels[category]"
                :key="channel.id"
                @click="selectChannel(channel)"
                class="w-full text-left p-3 rounded-xl bg-gray-800/50 hover:bg-primary/10 flex items-center gap-3 group transition-all"
                :class="{'bg-primary/20': currentChannel?.id === channel.id}"
              >
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
                  <img 
                    :src="channel.logo_url" 
                    :alt="channel.name"
                    class="w-full h-full object-contain p-1"
                    loading="lazy"
                  >
                </div>

                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ channel.name }}</div>
                  <div class="text-xs text-gray-400">Kanal {{ channel.channel_number }}</div>
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
  </div>

  <!-- Add Channel Modal -->
  <AddChannel v-if="showAddChannel" 
             @close="showAddChannel = false"
             @channel-added="handleChannelAdded" />
</template>

<script>
import { ref, computed } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import { storeToRefs } from 'pinia';
import AddChannel from './AddChannel.vue';

export default {
  components: {
    AddChannel
  },
  
  emits: ['close'],
  
  setup() {
    const store = useChannelStore();
    const { channels, currentChannel } = storeToRefs(store);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const showAddChannel = ref(false);

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
      return Object.keys(filteredChannels.value).sort();
    });

    const selectChannel = (channel) => {
      store.setCurrentChannel(channel);
    };

    const handleChannelAdded = () => {
      // Channel list will be automatically updated through Pinia store
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
      handleChannelAdded
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