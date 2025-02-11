<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black">
    <!-- Mobil Dikey Uyarısı -->
    <div v-if="isMobilePortrait" 
         class="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center">
      <i class="bi bi-phone-flip text-6xl text-primary mb-4 animate-bounce"></i>
      <h2 class="text-2xl font-bold mb-2">Telefonunuzu Yatay Çevirin</h2>
      <p class="text-gray-400">Daha iyi bir deneyim için telefonunuzu yatay konuma getirin</p>
      
      <!-- Dikey Mod Kontrolleri -->
      <div class="fixed bottom-8 left-0 right-0 flex justify-center gap-4">
        <button @click="toggleChannelList" 
                class="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <i class="bi bi-tv text-2xl"></i>
        </button>
        <button @click="toggleRemote" 
                class="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <i class="bi bi-controller text-2xl"></i>
        </button>
      </div>
    </div>

    <!-- Ana İçerik -->
    <div v-else class="relative h-screen">
      <!-- Video Player -->
      <div class="h-screen w-full">
        <TVScreen />
      </div>

      <!-- Kanal Bilgi Popup -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-full opacity-0"
      >
        <div v-if="showChannelInfo" 
             class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-full flex items-center gap-4 z-50">
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span class="font-bold">{{ currentChannel?.channel_number }}</span>
          </div>
          <span class="text-lg font-medium">{{ currentChannel?.name }}</span>
        </div>
      </Transition>

      <!-- Volume Indicator -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-full opacity-0"
      >
        <div v-if="volumeInfo.show" 
             class="fixed top-8 right-8 bg-black/80 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-3 z-50">
          <i class="bi" :class="volumeIcon"></i>
          <div class="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-300" 
                 :style="{ width: `${volumeInfo.level}%` }">
            </div>
          </div>
          <span class="text-sm font-medium">{{ volumeInfo.level }}%</span>
        </div>
      </Transition>

      <!-- Kanal Listesi Sidebar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-x-full"
        enter-to-class="transform translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform translate-x-0"
        leave-to-class="transform translate-x-full"
      >
        <div v-if="showChannelList" 
             class="fixed top-4 right-4 w-[400px] max-h-[80vh] z-40">
          <ChannelList @close="showChannelList = false" />
        </div>
      </Transition>

      <!-- Remote Control Sidebar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-x-full"
        enter-to-class="transform translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform translate-x-0"
        leave-to-class="transform translate-x-full"
      >
        <div v-if="showRemote" 
             class="fixed top-4 right-4 z-50">
          <RemoteControl @close="showRemote = false" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useChannelStore } from './stores/channelStore'
import TVScreen from './components/TVScreen.vue'
import ChannelList from './components/ChannelList.vue'
import RemoteControl from './components/RemoteControl.vue'

export default {
  name: 'App',
  components: {
    TVScreen,
    ChannelList,
    RemoteControl
  },
  setup() {
    const store = useChannelStore()
    const showChannelList = ref(false)
    const showRemote = ref(false)
    const showChannelInfo = ref(false)
    const isMobilePortrait = ref(false)
    let channelInfoTimeout = null

    const volumeIcon = computed(() => {
      const level = store.volumeInfo.level;
      if (level === 0) return 'bi-volume-mute';
      if (level < 30) return 'bi-volume-down';
      return 'bi-volume-up';
    });

    // Ekran yönü kontrolü
    const checkOrientation = () => {
      if (window.innerWidth < 720) {
        isMobilePortrait.value = window.innerHeight > window.innerWidth
      } else {
        isMobilePortrait.value = false
      }
    }

    // Kanal değiştirme fonksiyonu
    const changeChannel = (direction) => {
      const channels = store.channels;
      const currentIndex = channels.findIndex(c => c.id === store.currentChannel?.id);
      if (currentIndex === -1) return;

      let nextIndex;
      if (direction === 'up') {
        nextIndex = currentIndex === 0 ? channels.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === channels.length - 1 ? 0 : currentIndex + 1;
      }
      
      store.setCurrentChannel(channels[nextIndex]);
      showChannelInfo.value = true;

      // 2 saniye sonra kanal bilgisini gizle
      clearTimeout(channelInfoTimeout);
      channelInfoTimeout = setTimeout(() => {
        showChannelInfo.value = false;
      }, 2000);
    };

    // Ses değiştirme fonksiyonu
    const changeVolume = (direction) => {
      const currentVolume = store.volumeInfo.level;
      let newVolume = direction === 'up' ? 
        Math.min(currentVolume + 5, 100) : 
        Math.max(currentVolume - 5, 0);

      store.setVolumeInfo({
        level: newVolume,
        show: true
      });

      // 2 saniye sonra ses göstergesini gizle
      setTimeout(() => {
        store.setVolumeInfo({
          level: newVolume,
          show: false
        });
      }, 2000);
    };

    // Klavye kontrollerini dinle
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeChannel('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeChannel('down');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeVolume('up');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeVolume('down');
      } else if (e.key.toLowerCase() === 'c') {
        showChannelList.value = !showChannelList.value;
        showRemote.value = false;
      } else if (e.key.toLowerCase() === 'r') {
        showRemote.value = !showRemote.value;
        showChannelList.value = false;
      }
    };

    onMounted(async () => {
      await store.fetchChannels()
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('resize', checkOrientation)
      checkOrientation()
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('resize', checkOrientation)
      clearTimeout(channelInfoTimeout)
    })

    const toggleChannelList = () => {
      showChannelList.value = !showChannelList.value
      showRemote.value = false
    }

    const toggleRemote = () => {
      showRemote.value = !showRemote.value
      showChannelList.value = false
    }

    const toggleChannels = () => {
      showChannelList.value = !showChannelList.value
      showRemote.value = false
    }

    return {
      showChannelList,
      showRemote,
      showChannelInfo,
      isMobilePortrait,
      currentChannel: computed(() => store.currentChannel),
      toggleChannelList,
      toggleRemote,
      toggleChannels,
      volumeIcon,
      volumeInfo: computed(() => store.volumeInfo)
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Text&display=swap');
@import 'bootstrap-icons/font/bootstrap-icons.css';

body {
  @apply bg-dark text-white font-manrope antialiased overflow-hidden;
}

.font-serif {
  font-family: 'DM Serif Text', serif;
}
</style>
