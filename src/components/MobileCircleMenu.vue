<template>
  <div class="circle-menu-container">
    <!-- Main toggle button -->
    <button 
      @click="toggleMenu" 
      class="main-button"
      :class="{'menu-open': isOpen}"
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
    'close-all'
  ],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const isPlaying = ref(true);

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    const closeMenu = () => {
      isOpen.value = false;
    };

    const openChannelList = () => {
      emit('open-channel-list');
      closeMenu();
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
      
      closeMenu();
    };

    const openRemoteControl = () => {
      emit('open-remote-control');
      closeMenu();
    };

    const openAddChannel = () => {
      emit('open-add-channel');
      closeMenu();
    };

    const openYouTubeLives = () => {
      emit('open-youtube-lives');
      closeMenu();
    };

    const openYouTubeToHLS = () => {
      emit('open-youtube-hls');
      closeMenu();
    };

    const closeAllComponents = () => {
      emit('close-all');
      closeMenu();
    };

    return {
      isOpen,
      isPlaying,
      toggleMenu,
      closeMenu,
      openChannelList,
      togglePlayback,
      openRemoteControl,
      openAddChannel,
      openYouTubeLives,
      openYouTubeToHLS,
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
  width: 4rem;
  height: 4rem;
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

.circle-button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
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

/* Position buttons in a perfect circle/donut around the center */
.channel-list-btn.visible {
  transform: translate(-50%, -50%) translate(0px, -120px);
}

.play-pause-btn.visible {
  transform: translate(-50%, -50%) translate(85px, -85px);
}

.remote-control-btn.visible {
  transform: translate(-50%, -50%) translate(120px, 0px);
}

.add-channel-btn.visible {
  transform: translate(-50%, -50%) translate(85px, 85px);
}

.youtube-lives-btn.visible {
  transform: translate(-50%, -50%) translate(0px, 120px);
}

.youtube-hls-btn.visible {
  transform: translate(-50%, -50%) translate(-85px, 85px);
}

/* Position close button as part of the circle */
.close-btn.visible {
  transform: translate(-50%, -50%) translate(-120px, 0px);
  background-color: rgba(220, 53, 69, 0.8); /* Red background for close button */
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