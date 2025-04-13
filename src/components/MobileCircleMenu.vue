<template>
  <div class="circle-menu-container">
    <!-- Main toggle button -->
    <button 
      @click="toggleMenu" 
      class="main-button"
      :class="{'menu-open': isOpen, 'position-locked': isPositionLocked}"
    >
      <i class="bi" :class="isOpen ? 'bi-dash-lg' : 'bi-plus-lg'"></i>
    </button>

    <!-- Circle buttons that appear around the main button -->
    <Transition name="fade">
      <div v-if="isOpen" class="circle-menu-overlay" @click="closeMenu"></div>
    </Transition>

    <!-- Channel List Button -->
    <button 
      v-show="isOpen" 
      @click="openChannelList"
      class="circle-button channel-list-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-tv"></i>
    </button>

    <!-- Play/Pause Button -->
    <button 
      v-show="isOpen" 
      @click="togglePlayback"
      class="circle-button play-pause-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi" :class="isPlaying ? 'bi-pause-fill' : 'bi-play-fill'"></i>
    </button>

    <!-- Remote Control Button -->
    <button 
      v-show="isOpen" 
      @click="openRemoteControl"
      class="circle-button remote-control-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-controller"></i>
    </button>

    <!-- Add Channel Button -->
    <button 
      v-show="isOpen" 
      @click="openAddChannel"
      class="circle-button add-channel-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-plus-circle"></i>
    </button>

    <!-- YouTube Lives Button -->
    <button 
      v-show="isOpen" 
      @click="openYouTubeLives"
      class="circle-button youtube-lives-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-broadcast"></i>
    </button>

    <!-- YouTube to HLS Button -->
    <button 
      v-show="isOpen" 
      @click="openYouTubeToHLS"
      class="circle-button youtube-hls-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-youtube"></i>
    </button>

    <!-- Fullscreen Button -->
    <button 
      v-show="isOpen" 
      @click="toggleFullscreen"
      class="circle-button fullscreen-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi" :class="isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i>
    </button>

    <!-- User Profile Button -->
    <button 
      v-show="isOpen" 
      @click="openUserProfile"
      class="circle-button profile-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-person"></i>
    </button>

    <!-- Auth Button -->
    <button 
      v-show="isOpen" 
      @click="openAuth"
      class="circle-button auth-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-key"></i>
    </button>

    <!-- M3U Import Button -->
    <button 
      v-show="isOpen" 
      @click="openM3UImport"
      class="circle-button m3u-import-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-list-ul"></i>
    </button>

    <!-- Lock Position Button -->
    <button 
      v-show="isOpen" 
      @click="togglePositionLock"
      class="circle-button lock-btn"
      :class="{'visible': isOpen, 'active': isPositionLocked}"
    >
      <i class="bi" :class="isPositionLocked ? 'bi-lock-fill' : 'bi-unlock'"></i>
    </button>

    <!-- Close Button (X) -->
    <button 
      v-show="isOpen" 
      @click="closeAllComponents"
      class="circle-button close-btn"
      :class="{'visible': isOpen}"
    >
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'MobileCircleMenu',
  props: {
    tvScreenRef: {
      type: Object,
      default: null
    }
  },
  emits: [
    'open-channel-list', 
    'open-remote-control', 
    'open-add-channel', 
    'open-youtube-lives', 
    'open-youtube-hls',
    'open-user-profile',
    'open-auth',
    'toggle-fullscreen',
    'close-all',
    'open-m3u-import'
  ],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const isPlaying = ref(true);
    const isFullscreen = ref(false);
    const isPositionLocked = ref(false);

    // Check if the app is currently in fullscreen mode
    const checkFullscreen = () => {
      return document.fullscreenElement !== null;
    };

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    const closeMenu = () => {
      if (!isPositionLocked.value) {
        isOpen.value = false;
      }
    };

    const openChannelList = () => {
      emit('open-channel-list');
      if (!isPositionLocked.value) closeMenu();
    };

    const togglePlayback = () => {
      isPlaying.value = !isPlaying.value;
      
      if (props.tvScreenRef) {
        if (isPlaying.value) {
          props.tvScreenRef.play();
        } else {
          props.tvScreenRef.pause();
        }
      }
      
      if (!isPositionLocked.value) closeMenu();
    };

    const openRemoteControl = () => {
      emit('open-remote-control');
      if (!isPositionLocked.value) closeMenu();
    };

    const openAddChannel = () => {
      emit('open-add-channel');
      if (!isPositionLocked.value) closeMenu();
    };

    const openYouTubeLives = () => {
      emit('open-youtube-lives');
      if (!isPositionLocked.value) closeMenu();
    };

    const openYouTubeToHLS = () => {
      emit('open-youtube-hls');
      if (!isPositionLocked.value) closeMenu();
    };

    const openUserProfile = () => {
      emit('open-user-profile');
      if (!isPositionLocked.value) closeMenu();
    };

    const openAuth = () => {
      emit('open-auth');
      if (!isPositionLocked.value) closeMenu();
    };

    const openM3UImport = () => {
      emit('open-m3u-import');
      if (!isPositionLocked.value) closeMenu();
    };

    const toggleFullscreen = () => {
      if (checkFullscreen()) {
        document.exitFullscreen().then(() => {
          isFullscreen.value = false;
        }).catch(err => {
          console.error('Error exiting fullscreen', err);
        });
      } else {
        document.documentElement.requestFullscreen().then(() => {
          isFullscreen.value = true;
        }).catch(err => {
          console.error('Error entering fullscreen', err);
        });
      }
      emit('toggle-fullscreen');
      if (!isPositionLocked.value) closeMenu();
    };

    const togglePositionLock = () => {
      isPositionLocked.value = !isPositionLocked.value;
      // Store the preference in localStorage
      localStorage.setItem('mobileMenuPositionLocked', isPositionLocked.value ? 'true' : 'false');
    };

    const closeAllComponents = () => {
      emit('close-all');
      if (!isPositionLocked.value) closeMenu();
    };

    // Initialize fullscreen state
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = checkFullscreen();
    });

    // Check for stored position lock preference on component creation
    const storedLockPreference = localStorage.getItem('mobileMenuPositionLocked');
    if (storedLockPreference === 'true') {
      isPositionLocked.value = true;
    }

    return {
      isOpen,
      isPlaying,
      isFullscreen,
      isPositionLocked,
      toggleMenu,
      closeMenu,
      openChannelList,
      togglePlayback,
      openRemoteControl,
      openAddChannel,
      openYouTubeLives,
      openYouTubeToHLS,
      openUserProfile,
      openAuth,
      openM3UImport,
      toggleFullscreen,
      togglePositionLock,
      closeAllComponents
    };
  }
}
</script>

<style scoped>
.circle-menu-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.main-button {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  z-index: 1002;
  position: relative;
}

.main-button:hover, .circle-button:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.main-button.menu-open {
  transform: translate(-50%, -50%);
  position: fixed;
  top: 50%;
  left: 50%;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.main-button.position-locked {
  border-color: #28a745;
}

.circle-button {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: fixed;
  bottom: 0.25rem;
  right: 0.25rem;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  z-index: 1001;
}

.circle-button.visible {
  opacity: 1;
  top: 50%;
  left: 50%;
  bottom: auto;
  right: auto;
}

.circle-button.active {
  background-color: rgba(40, 167, 69, 0.9); /* Green for active lock button */
  border-color: rgba(255, 255, 255, 0.6);
}

/* Position buttons in a perfect circle (O shape) around the center with equal spacing */
/* Using 11 buttons at 32.7 degrees spacing each to form a perfect circle */

.channel-list-btn.visible {
  transform: translate(-50%, -50%) translate(0px, -160px); /* 12 o'clock (90°) */
}

.play-pause-btn.visible {
  transform: translate(-50%, -50%) translate(97px, -126px); /* 1:30 position (123°) */
}

.remote-control-btn.visible {
  transform: translate(-50%, -50%) translate(151px, -49px); /* 3 o'clock (157°) */
}

.add-channel-btn.visible {
  transform: translate(-50%, -50%) translate(151px, 49px); /* 4:30 position (192°) */
}

.youtube-lives-btn.visible {
  transform: translate(-50%, -50%) translate(97px, 126px); /* 5:30 position (225°) */
}

.youtube-hls-btn.visible {
  transform: translate(-50%, -50%) translate(0px, 160px); /* 6 o'clock (270°) */
}

.close-btn.visible {
  transform: translate(-50%, -50%) translate(-97px, 126px); /* 7:30 position (315°) */
  background-color: rgba(220, 53, 69, 0.8); /* Red for close button */
}

.fullscreen-btn.visible {
  transform: translate(-50%, -50%) translate(-151px, 49px); /* 8:30 position (348°) */
}

.profile-btn.visible {
  transform: translate(-50%, -50%) translate(-151px, -49px); /* 10 o'clock (22°) */
}

.auth-btn.visible {
  transform: translate(-50%, -50%) translate(-97px, -126px); /* 10:30 position (56°) */
}

.m3u-import-btn.visible {
  transform: translate(-50%, -50%) translate(-49px, -151px); /* 11 o'clock position (77°) */
}

.lock-btn.visible {
  transform: translate(-50%, -50%) translate(-50px, -20px); /* Position near center */
  background-color: rgba(40, 167, 69, 0.7); /* Green for lock button */
}

.circle-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 