<template>
  <div class="relative h-full w-full bg-black">
    <!-- Video Player -->
    <video
      ref="videoPlayer"
      class="h-full w-full object-contain"
      autoplay
      :key="videoKey"
      @error="handleVideoError"
      @loadstart="handleLoadStart"
      @canplay="handleCanPlay"
      @playing="handlePlaying"
      @waiting="handleWaiting"
      @ended="handleEnded"
    >
      <source :src="currentChannel?.stream_url" type="application/x-mpegURL">
      Tarayıcınız video oynatmayı desteklemiyor.
    </video>

    <!-- Mobil Kontroller -->
    <div class="fixed top-8 left-1/2 -translate-x-1/2 flex flex-row items-center gap-4 z-50 visible-mobile">
      <!-- Remote Control Butonu -->
      <button 
        @click="$emit('toggle-remote')"
        class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center 
               text-white hover:text-white transition-all border-2 border-white/20 
               active:scale-95 hover:scale-105 shadow-lg"
      >
        <i class="bi bi-controller text-2xl"></i>
      </button>

      <!-- Play/Pause Butonu -->
      <button 
        @click="togglePlay"
        class="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center 
               text-white hover:text-white transition-all border-2 border-white/20 
               active:scale-95 hover:scale-105 shadow-lg"
      >
        <i :class="['bi text-4xl', isPlaying ? 'bi-pause-fill' : 'bi-play-fill']"></i>
      </button>

      <!-- Kanal Listesi Butonu -->
      <button 
        @click="$emit('toggle-channels')"
        class="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center 
               text-white hover:text-white transition-all border-2 border-white/20 
               active:scale-95 hover:scale-105 shadow-lg"
      >
        <i class="bi bi-tv text-2xl"></i>
      </button>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading && !error" 
         class="absolute inset-0 bg-black/80 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-primary text-4xl mb-4">
          <i class="bi bi-arrow-repeat"></i>
        </div>
        <p class="text-gray-400">{{ loadingMessage }}</p>
        <button v-if="showRetryButton"
                @click="retryLoading"
                class="mt-4 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-all">
          <i class="bi bi-arrow-clockwise mr-2"></i>
          Yeniden Dene
        </button>
      </div>
    </div>

    <!-- Hata Mesajı -->
    <div v-if="error" 
         class="absolute inset-0 flex items-center justify-center bg-black/90">
      <div class="text-center p-6">
        <i class="bi bi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <p class="text-lg mb-4">{{ error }}</p>
        <button 
          @click="retryLoading"
          class="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-all"
        >
          <i class="bi bi-arrow-clockwise mr-2"></i>
          Tekrar Dene
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import { storeToRefs } from 'pinia';
import Hls from 'hls.js';

export default {
  emits: ['toggle-remote', 'toggle-channels'],
  setup() {
    const store = useChannelStore();
    const { currentChannel, volumeInfo } = storeToRefs(store);
    const videoPlayer = ref(null);
    const error = ref(null);
    const isLoading = ref(true);
    const videoKey = ref(0);
    const loadingMessage = ref('Kanal yükleniyor...');
    const showRetryButton = ref(false);
    const isPlaying = ref(true);
    let hls = null;
    let playPromise = null;
    let loadingTimeout = null;
    let retryCount = ref(0);
    const MAX_RETRIES = 3;
    const isDestroyed = ref(false);
    let playAttemptTimeout = null;
    const errorCount = ref(0);
    const MAX_ERROR_COUNT = 3;
    const currentStreamIndex = ref(0);
    const MAX_MANIFEST_LOAD_RETRIES = 3;
    const manifestLoadRetryCount = ref(0);

    const clearTimeouts = () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
    };

    const startLoadingTimeout = () => {
      clearTimeouts();
      loadingTimeout = setTimeout(() => {
        if (isLoading.value) {
          showRetryButton.value = true;
          loadingMessage.value = 'Yükleme zaman aşımına uğradı';
        }
      }, 30000);
    };

    const togglePlay = async () => {
      if (!videoPlayer.value) return;

      try {
        if (videoPlayer.value.paused) {
          await safePlay();
        } else {
          if (playPromise) {
            await playPromise;
          }
          videoPlayer.value.pause();
          isPlaying.value = false;
        }
      } catch (err) {
        console.error('Video oynatma/durdurma hatası:', err);
      }
    };

    const volumeIcon = computed(() => {
      const level = volumeInfo.value.level;
      if (level === 0) return 'bi-volume-mute';
      if (level < 30) return 'bi-volume-down';
      return 'bi-volume-up';
    });

    const initializeHls = (videoElement, url) => {
      if (hls) {
        hls.destroy();
        hls = null;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          
          // Buffer yapılandırması
          maxBufferSize: 30 * 1000 * 1000, // 30MB
          maxBufferLength: 30, // 30 saniye
          maxMaxBufferLength: 60, // Maksimum 60 saniye
          backBufferLength: 30, // 30 saniye geriye buffer
          
          // Segment yükleme ayarları
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 64000,
          
          // Manifest yükleme ayarları
          manifestLoadingTimeOut: 20000,
          manifestLoadingMaxRetry: 6,
          manifestLoadingRetryDelay: 1000,
          
          // Level yükleme ayarları
          levelLoadingTimeOut: 20000,
          levelLoadingMaxRetry: 4,
          
          // Stall önleme
          stallDelayDuration: 1,
          highBufferWatchdogPeriod: 2,
          
          // ABR ayarları
          abrEwmaDefaultEstimate: 500000,
          abrEwmaFastLive: 3,
          abrEwmaSlowLive: 9,
          
          // Hata kurtarma
          maxStarvationDelay: 4,
          maxLoadingDelay: 4
        });

        hls.attachMedia(videoElement);
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('Video ve HLS bağlandı');
          loadSource(url);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            handleFatalError(data);
          } else if (data.details === 'manifestLoadError') {
            handleManifestLoadError(url);
          }
        });

        hls.on(Hls.Events.BUFFER_STALLING, () => {
          console.log('Buffer duraklaması tespit edildi');
          handleBufferStall();
        });
      }
    };

    const loadSource = (url) => {
      manifestLoadRetryCount.value = 0; // Sıfırla
      hls.loadSource(url);
    };

    const handleManifestLoadError = (url) => {
      console.error('Manifest yükleme hatası:', url);
      manifestLoadRetryCount.value++;

      if (manifestLoadRetryCount.value <= MAX_MANIFEST_LOAD_RETRIES) {
        console.log(`Yeniden deneme ${manifestLoadRetryCount.value}...`);
        setTimeout(() => {
          loadSource(url);
        }, 2000); // 2 saniye bekle
      } else {
        error.value = 'Yayın yüklenemiyor. Lütfen daha sonra tekrar deneyin.';
        isLoading.value = false;
        showRetryButton.value = true;
      }
    };

    const handleBufferStall = () => {
      if (videoPlayer.value && hls) {
        // Buffer seviyesini kontrol et
        const currentLevel = hls.currentLevel;
        if (currentLevel > 0) {
          // Daha düşük kaliteye geç
          console.log('Daha düşük kaliteye geçiliyor...');
          hls.currentLevel = currentLevel - 1;
        }
        
        // Buffer'ı temizle ve yeniden yükle
        hls.trigger(Hls.Events.BUFFER_RESET);
        videoPlayer.value.currentTime = videoPlayer.value.currentTime + 0.1;
      }
    };

    const handleMediaError = (data) => {
      console.log('Medya hatası:', data);
      if (data.details === 'bufferStalledError' || data.details === 'bufferNudgeOnStall') {
        handleBufferStall();
      }
    };

    const safePlay = async () => {
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
      }

      try {
        if (videoPlayer.value && !isDestroyed.value) {
          playPromise = videoPlayer.value.play();
          await playPromise;
          isPlaying.value = true;
          error.value = null;
          isLoading.value = false;
        }
      } catch (err) {
        console.error('Oynatma hatası:', err);
        if (err.name === 'AbortError') {
          // Yeni bir oynatma denemesi planla
          playAttemptTimeout = setTimeout(() => {
            if (!isDestroyed.value) {
              safePlay();
            }
          }, 1000);
        } else {
          error.value = 'Video oynatılamıyor';
          isLoading.value = false;
        }
      }
    };

    const handleNetworkError = (data) => {
      console.log('Ağ hatası yönetiliyor:', data);
      error.value = 'Ağ bağlantısı hatası. Yeniden bağlanılıyor...';
      
      setTimeout(() => {
        if (currentChannel.value?.stream_url && videoPlayer.value) {
          retryLoading();
        }
      }, 2000);
    };

    const handleFatalError = (data) => {
      console.error('Fatal hata:', data);
      error.value = 'Yayın yüklenemedi. Lütfen tekrar deneyin.';
      showRetryButton.value = true;
    };

    const handlePlaying = () => {
      console.log('Video oynatılıyor');
      isLoading.value = false;
      clearTimeouts();
      retryCount.value = 0;
    };

    const getStreamUrls = (channelName) => {
      const streamUrls = {
        'TRT 1': [
          'https://tv-trt1.medya.trt.com.tr/master.m3u8',
          'https://d1u68oyra9spme.cloudfront.net/master.m3u8',
          'https://trt1.blutv.com/blutv_trt1_live/live.m3u8'
        ],
        'ATV': [
          'https://stream.atv.com.tr/atv/smil:atv.smil/playlist.m3u8',
          'https://hw1.jemtv.com/app/ATVHD/playlist.m3u8'
        ],
        // ... diğer kanallar için alternatif stream'ler
      };
      
      return streamUrls[channelName] || [];
    };

    const handleVideoError = async (e) => {
      console.error('Video yükleme hatası:', e);
      errorCount.value++;

      if (errorCount.value >= MAX_ERROR_COUNT) {
        // Alternatif stream'i dene
        const streams = getStreamUrls(currentChannel.value?.name);
        currentStreamIndex.value++;
        
        if (currentStreamIndex.value < streams.length) {
          console.log('Alternatif yayın deneniyor:', currentStreamIndex.value);
          error.value = 'Alternatif yayın kaynağına bağlanılıyor...';
          isLoading.value = true;
          
          if (videoPlayer.value) {
            await cleanupVideo();
            setTimeout(() => {
              initializeHls(videoPlayer.value, streams[currentStreamIndex.value]);
            }, 1000);
          }
        } else {
          error.value = 'Yayın şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.';
          isLoading.value = false;
          showRetryButton.value = true;
        }
        
        errorCount.value = 0; // Hata sayacını sıfırla
      } else {
        error.value = 'Yayın yükleniyor... Deneme ' + errorCount.value;
        retryLoading();
      }
    };

    const cleanupVideo = async () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      
      if (videoPlayer.value) {
        try {
          await videoPlayer.value.pause();
          videoPlayer.value.removeAttribute('src');
          videoPlayer.value.load();
        } catch (err) {
          console.error('Video temizleme hatası:', err);
        }
      }
    };

    const handleLoadStart = () => {
      isLoading.value = true;
      error.value = null;
    };

    const handleCanPlay = () => {
      isLoading.value = false;
      if (videoPlayer.value) {
        videoPlayer.value.play().catch(err => {
          console.error('Otomatik oynatma hatası:', err);
        });
      }
    };

    const retryLoading = () => {
      if (retryCount.value >= MAX_RETRIES) {
        error.value = 'Yayın bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.';
        showRetryButton.value = true;
        isLoading.value = false;
        return;
      }

      console.log('Yeniden bağlanılıyor...', retryCount.value + 1);
      error.value = null;
      isLoading.value = true;
      showRetryButton.value = false;
      videoKey.value++; // Video elementini yenile
      retryCount.value++;

      if (currentChannel.value?.stream_url && videoPlayer.value) {
        setTimeout(() => {
          initializeHls(videoPlayer.value, currentChannel.value.stream_url);
        }, 2000); // 2 saniye bekle
      }
    };

    const handleWaiting = () => {
      isPlaying.value = false;
    };

    const handleEnded = () => {
      isPlaying.value = false;
    };

    watch(currentChannel, async (newChannel) => {
      if (newChannel?.stream_url) {
        error.value = null;
        isLoading.value = true;
        errorCount.value = 0;
        currentStreamIndex.value = 0;
        showRetryButton.value = false;
        
        if (videoPlayer.value) {
          await cleanupVideo();
          
          setTimeout(() => {
            if (!isDestroyed.value) {
              initializeHls(videoPlayer.value, newChannel.stream_url);
            }
          }, 1000);
        }
      }
    });

    watch(() => volumeInfo.value.level, (newLevel) => {
      if (videoPlayer.value) {
        videoPlayer.value.volume = newLevel / 100;
      }
    });

    onUnmounted(async () => {
      isDestroyed.value = true;
      await cleanupVideo();
    });

    return {
      videoPlayer,
      currentChannel,
      error,
      isLoading,
      videoKey,
      loadingMessage,
      showRetryButton,
      isPlaying,
      handleVideoError,
      handleLoadStart,
      handleCanPlay,
      handlePlaying,
      handleWaiting,
      handleEnded,
      retryLoading,
      togglePlay
    };
  }
};
</script>

<style scoped>
/* Mobil kontroller için gölge ve blur efekti */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Butonlar için gelişmiş gölge efekti */
.shadow-lg {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

/* Buton hover ve active durumları için smooth transition */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobil kontroller için active efekti */
button:active {
  transform: scale(0.95);
}

/* Butonlar için hover efekti */
@media (hover: hover) {
  button:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

@media (max-width: 1023px) {
/* Flexbox ayarları */
  .fixed {
    display: flex;
    flex-direction: row; /* Yan yana hizalama */
    align-items: center; /* Dikey ortalama */
  }

  .visible-mobile {
    display: flex; /* 1024 pikselden daha küçük ekranlarda göster */
  }
}

@media (min-width: 1024px) {
  .visible-mobile {
    display: none; /* 1024 pikselden daha büyük ekranlarda gizle */
  }
}
</style> 