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
        <TVScreen ref="tvScreen" />
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

      <!-- Mobile Controls - Only visible on mobile -->
      <div v-if="isMobile" class="fixed bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
        <button @click="toggleChannelList" 
                class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-white transition-all border-2 border-white/20 active:scale-95 hover:scale-105 shadow-lg">
          <i class="bi bi-tv text-2xl"></i>
        </button>
        <button @click="toggleRemote" 
                class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-white transition-all border-2 border-white/20 active:scale-95 hover:scale-105 shadow-lg">
          <i class="bi bi-controller text-2xl"></i>
        </button>
        <button @click="showYoutubeLives = true" 
                class="w-14 h-14 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:text-white transition-all border-2 border-white/20 active:scale-95 hover:scale-105 shadow-lg"
                title="Find live broadcasts">
          <i class="bi bi-broadcast text-2xl"></i>
        </button>
        <button @click="toggleStreamManager" 
                class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:text-white transition-all border-2 border-white/20 active:scale-95 hover:scale-105 shadow-lg">
          <i class="bi bi-camera-video text-2xl"></i>
        </button>
      </div>

      <!-- Stream Manager -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-x-full"
        enter-to-class="transform translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform translate-x-0"
        leave-to-class="transform translate-x-full"
      >
        <div v-if="showStreamManager" 
             class="fixed top-4 right-4 z-50">
          <ManageStream @close="showStreamManager = false" />
        </div>
      </Transition>

      <div class="sidebar-container" :class="{ 'sidebar-open': sidebarOpen }">
        <TheSidebar @close="toggleSidebar" />
      </div>

      <!-- Add Channel Modal -->
      <div v-if="showAddChannel" class="modal-backdrop">
        <div class="modal-content">
          <AddChannel @close="showAddChannel = false" />
        </div>
      </div>

      <!-- YouTube to HLS Modal -->
      <div v-if="showYouTubeConverter" class="modal-backdrop">
        <div class="modal-content">
          <YouTubeToHLS @close="showYouTubeConverter = false" />
        </div>
      </div>

      <!-- YouTube Lives Modal -->
      <div v-if="showYoutubeLives" class="modal-backdrop">
        <div class="modal-content">
          <YouTubeLives @close="showYoutubeLives = false" />
        </div>
      </div>

      <!-- Language Selector Modal -->
      <div v-if="showLanguageSelector" class="modal-backdrop">
        <div class="modal-content">
          <LanguageSelector @close="showLanguageSelector = false" />
        </div>
      </div>

      <!-- User Profile Modal -->
      <div v-if="showUserProfile" class="modal-backdrop">
        <div class="modal-content">
          <UserProfile @close="showUserProfile = false" />
        </div>
      </div>

      <!-- Auth Modal -->
      <div v-if="showAuth" class="modal-backdrop">
        <div class="modal-content">
          <Auth @close="showAuth = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useChannelStore } from './stores/channelStore'
import { useLanguageStore } from './stores/languageStore'
import TVScreen from './components/TVScreen.vue'
import ChannelList from './components/ChannelList.vue'
import RemoteControl from './components/RemoteControl.vue'
import ManageStream from './components/ManageStream.vue'
import TheSidebar from './components/TheSidebar.vue'
import AddChannel from './components/AddChannel.vue'
import YouTubeToHLS from './components/YouTubeToHLS.vue'
import YouTubeLives from './components/YouTubeLives.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import UserProfile from './components/UserProfile.vue'
import Auth from './components/Auth.vue'

export default {
  name: 'App',
  components: {
    TVScreen,
    ChannelList,
    RemoteControl,
    ManageStream,
    TheSidebar,
    AddChannel,
    YouTubeToHLS,
    YouTubeLives,
    LanguageSelector,
    UserProfile,
    Auth
  },
  setup() {
    // Reference to TVScreen component
    const tvScreen = ref(null)
    
    const store = useChannelStore()
    const languageStore = useLanguageStore()
    const showChannelList = ref(false)
    const showRemote = ref(false)
    const showChannelInfo = ref(false)
    const isMobilePortrait = ref(false)
    const isMobile = ref(false)
    const showStreamManager = ref(false)
    const sidebarOpen = ref(false)
    const showAddChannel = ref(false)
    const showYouTubeConverter = ref(false)
    const showYoutubeLives = ref(false)
    const showLanguageSelector = ref(false)
    const showUserProfile = ref(false)
    const showAuth = ref(false)
    let channelInfoTimeout = null

    // Check if device is mobile
    const checkDevice = () => {
      isMobile.value = window.innerWidth < 768 // or any breakpoint you prefer
    }

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
      if (isMobile.value) return; // Disable keyboard shortcuts on mobile
      
      // Skip if event target is the YouTube overlay
      if (e.target.classList && 
          e.target.classList.contains('absolute') && 
          e.target.classList.contains('inset-0') && 
          e.target.classList.contains('z-10')) {
        console.log('Key event handled by YouTube overlay, skipping global handler');
        return;
      }

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
      } else if (e.key.toLowerCase() === 's') {
        toggleStreamManager();
      } else if (e.key.toLowerCase() === 'y') {
        showYouTubeConverter.value = true;
      } else if (e.key.toLowerCase() === 'l') {
        showYoutubeLives.value = true;
      } else if (e.key.toLowerCase() === 'e') {
        showLanguageSelector.value = !showLanguageSelector.value;
      } else if (e.key.toLowerCase() === 'p') {
        // Toggle user profile
        showUserProfile.value = !showUserProfile.value;
        // Hide other panels when profile is shown
        showChannelList.value = false;
        showRemote.value = false;
      } else if (e.key.toLowerCase() === 'a') {
        // Toggle auth panel
        showAuth.value = !showAuth.value;
        // Hide other panels when auth is shown
        showChannelList.value = false;
        showRemote.value = false;
        showUserProfile.value = false;
      }
    };

    onMounted(async () => {
      await store.fetchChannels()
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('resize', checkOrientation)
      checkOrientation()
      checkDevice()
      window.addEventListener('resize', checkDevice)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('resize', checkDevice)
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

    const toggleStreamManager = () => {
      showStreamManager.value = !showStreamManager.value
      showChannelList.value = false
      showRemote.value = false
    }

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }

    const selectLanguage = (langCode) => {
      languageStore.setLanguage(langCode);
      
      // Find TVScreen component reference and call its changeLanguage method
      if (tvScreen.value && tvScreen.value.changeLanguage) {
        tvScreen.value.changeLanguage(langCode);
      }
      
      showLanguageSelector.value = false;
    };

    const $t = (key) => {
      return languageStore.t(key);
    };

    return {
      showChannelList,
      showRemote,
      showChannelInfo,
      isMobilePortrait,
      currentChannel: computed(() => store.currentChannel),
      toggleChannelList,
      toggleRemote,
      toggleChannels,
      volumeIcon: computed(() => {
        const level = store.volumeInfo.level;
        if (level === 0) return 'bi-volume-mute';
        if (level < 30) return 'bi-volume-down';
        return 'bi-volume-up';
      }),
      volumeInfo: computed(() => store.volumeInfo),
      isMobile,
      showStreamManager,
      toggleStreamManager,
      sidebarOpen,
      toggleSidebar,
      showAddChannel,
      showYouTubeConverter,
      showYoutubeLives,
      showLanguageSelector,
      showUserProfile,
      showAuth,
      languageStore,
      selectLanguage,
      $t,
      tvScreen
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

.modal-backdrop {
  @apply fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  @apply w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl;
  animation: scaleIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.sidebar-container {
  @apply fixed top-0 left-0 h-full w-0 bg-gray-900/90 backdrop-blur-md transition-all duration-300 overflow-hidden z-50;
}

.sidebar-open {
  @apply w-[300px] shadow-2xl;
}
</style>
