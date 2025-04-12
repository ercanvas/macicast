<template>
  <div class="relative h-full w-full bg-black">
    <!-- YouTube Player Container -->
    <div class="relative h-full w-full" v-if="currentChannel?.type === 'youtube-live' || showIframe">
      <!-- YouTube iframe -->
      <iframe
        class="h-full w-full"
        :src="iframeUrl || currentChannel?.stream_url"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowfullscreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        referrerpolicy="origin"
        loading="eager"
      ></iframe>
      
      <!-- Transparent overlay to capture keyboard events and prevent interaction with YouTube controls -->
      <div 
        class="absolute inset-0 z-10" 
        @keydown="handleKeyDown"
        tabindex="0"
        ref="youtubeOverlay"
        autofocus
        @mousedown.prevent
        @touchstart.prevent
        @click.prevent
        @focus="console.log('YouTube overlay focused')"
        @blur="console.log('YouTube overlay blur')"
      >
        <!-- Optional: Small indicator that the overlay is active -->
        <div class="absolute top-4 right-4 bg-black/30 text-white text-xs px-2 py-1 rounded">
          Kontrol Aktif
        </div>
      </div>
    </div>

    <!-- Iframe container for fallback embeds -->
    <!-- <div ref="iframeContainer" class="h-full w-full" v-if="showIframe"></div> -->

    <!-- Standard Video Player (remains unchanged) -->
    <video
      v-else
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import { storeToRefs } from 'pinia';
import Hls from 'hls.js';

export default {
  emits: ['toggle-remote', 'toggle-channels'],
  setup(props, { emit }) {
    const store = useChannelStore();
    const { currentChannel, volumeInfo } = storeToRefs(store);
    const videoPlayer = ref(null);
    const error = ref(null);
    const isLoading = ref(true);
    const videoKey = ref(0);
    const loadingMessage = ref('Kanal yükleniyor...');
    const showRetryButton = ref(false);
    const isPlaying = ref(true);
    const iframeUrl = ref(null);
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
    const showIframe = ref(false);
    const youtubeOverlay = ref(null);

    // Handle keyboard events on the overlay
    const handleKeyDown = (event) => {
      console.log('Key pressed on overlay:', event.key);
      
      // Stop propagation to prevent the global handler from also handling this event
      event.stopPropagation();
      
      // Prevent default behavior for certain keys
      if (['c', 'r', 'l', 's', 'y'].includes(event.key.toLowerCase())) {
        event.preventDefault();
        
        // Handle specific keys
        switch(event.key.toLowerCase()) {
          case 'c':
            // Channel list toggle
            console.log('Toggle channel list');
            event.target.blur();
            // Use emit instead of directly calling store method
            emit('toggle-channels');
            break;
          case 'r':
            // Remote toggle
            console.log('Toggle remote');
            event.target.blur();
            emit('toggle-remote');
            break;
          case 'l':
            // Toggle logs or another function
            console.log('L key pressed');
            break;
          case 's':
            // Settings or search
            console.log('S key pressed');
            break;
          case 'y':
            // Custom YouTube action
            console.log('Y key pressed');
            break;
        }
      }
    };

    // Function to safely focus the overlay with null checking
    const focusYoutubeOverlay = () => {
      if (youtubeOverlay.value) {
        try {
          youtubeOverlay.value.focus();
        } catch (err) {
          console.error('Error focusing YouTube overlay:', err);
        }
      }
    };
    
    // Focus the overlay when a YouTube video is loaded - with additional null checking
    watch([
      () => currentChannel.value?.type, 
      showIframe
    ], async ([newType, showingIframe]) => {
      if ((newType === 'youtube-live' || showingIframe)) {
        // Wait for next tick to ensure the DOM is updated
        await nextTick();
        focusYoutubeOverlay();
      }
    });
    
    // Focus the overlay when iframe URL changes - with additional null checking
    watch(iframeUrl, async (newUrl) => {
      if (newUrl) {
        // Wait a moment for the iframe to load
        setTimeout(() => {
          focusYoutubeOverlay();
        }, 1000);
      }
    });

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
      if (!volumeInfo.value) return 'bi-volume-up';
      const level = volumeInfo.value.level;
      if (level === 0) return 'bi-volume-mute';
      if (level < 30) return 'bi-volume-down';
      return 'bi-volume-up';
    });

    const getStreamUrls = (channelName) => {
      const streamUrls = {
        'TRT 1': [
          'https://tv-trt1.medya.trt.com.tr/master.m3u8',
          'http://stream.tvcdn.net/ulusal/trt-1.m3u8',
          'https://trt1.blutv.com/blutv_trt1_live/live.m3u8',
          'https://d1u68oyra9spme.cloudfront.net/master.m3u8'
        ],
        'ATV': [
          'https://stream.atv.com.tr/atv/smil:atv.smil/playlist.m3u8',
          'http://hw1.jemtv.com/app/ATVHD/playlist.m3u8',
          'https://atv.blutv.com/blutv_atv_live/live.m3u8'
        ],
        // Add more channels with all available streams
      };
      
      return streamUrls[channelName] || [];
    };

    const tryUpgradeToHttps = (url) => {
      return url.replace(/^http:/, 'https:');
    };

    const initializeHls = (videoElement, url) => {
      if (hls) {
        hls.destroy();
        hls = null;
      }

      // Check if this is a YouTube embed URL - we need to handle this differently
      if (url.includes('youtube.com/embed/')) {
        console.log('Detected YouTube embed URL, using iframe instead of HLS');
        showIframePlayer(url);
        return;
      }

      // Check if the URL is a YouTube Live HLS stream
      if (currentChannel.value?.type === 'youtube-live-hls') {
        console.log('Processing YouTube Live as HLS:', url);
        
        // Get the video ID - either directly from the URL or from the channel object
        let videoId;
        if (url.includes('watch?v=')) {
          videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtube.com/')) {
          videoId = url.split('/').pop();
        } else {
          // In our updated implementation, we're storing just the video ID
          videoId = url;
        }
        
        console.log('Fetching HLS stream data for YouTube video ID:', videoId);
        
        // Use our backend proxy endpoint instead of direct Invidious access
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://macicast-backend.onrender.com/api';
        const proxyUrl = `${apiBaseUrl}/youtube/hls/${videoId}`;
        
        // Fetch the stream data through our proxy
        fetch(proxyUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Backend proxy returned status ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (!data.success) {
              throw new Error(data.message || 'Failed to fetch YouTube stream data');
            }
            
            // Check if we have a dashUrl for direct embedding
            if (data.dashUrl) {
              console.log('Using embedded YouTube player:', data.dashUrl);
              showIframePlayer(data.dashUrl);
              return;
            }
            
            // Otherwise try normal HLS streaming with hlsUrl or fallbackUrl
            const streamUrl = data.hlsUrl || data.fallbackUrl;
            if (streamUrl) {
              console.log('Found stream URL from backend proxy:', streamUrl);
              
              // Initialize HLS.js with the URL from our proxy
              const hlsInstance = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferSize: 30 * 1000 * 1000,
                maxBufferLength: 30
              });
              
              hlsInstance.attachMedia(videoElement);
              hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
                console.log('HLS attached to video element for YouTube Live');
                hlsInstance.loadSource(streamUrl);
              });
              
              hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                console.error('YouTube Live HLS error:', data);
                if (data.fatal) {
                  // If HLS streaming fails, try to use the iframe embed
                  if (videoPlayer.value && data.dashUrl) {
                    console.log('Falling back to iframe embed');
                    showIframePlayer(data.dashUrl);
                  } else {
                    error.value = 'YouTube HLS yayın yüklenemedi. Tekrar deneyin.';
                  }
                }
              });
              
              hls = hlsInstance;
            } 
            // If no direct stream URL but we have a dash URL for embedding
            else if (data.dashUrl) {
              console.log('No direct stream URL found, using embedded player:', data.dashUrl);
              showIframePlayer(data.dashUrl);
            } 
            // No usable URLs at all
            else {
              console.error('No stream URLs found for YouTube Live');
              error.value = 'YouTube yayını bulunamadı. Lütfen tekrar deneyin.';
            }
          })
          .catch(err => {
            console.error('Error fetching YouTube HLS stream:', err);
            error.value = 'YouTube yayın verileri alınamadı. Lütfen tekrar deneyin.';
          });
          
        return;
      }

      // Check if the URL is a user stream
      if (currentChannel.value?.type === 'user-stream') {
        console.log('Loading user stream:', url);
        
        // Create new HLS instance for user streams
        const userHls = new Hls({
          debug: true,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingTimeOut: 30000, // Increase timeout
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 1000
        });

        userHls.attachMedia(videoElement);
        userHls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS attached to video element');
          userHls.loadSource(url);
        });

        userHls.on(Hls.Events.ERROR, (event, data) => {
          console.error('User stream HLS error:', data);
          if (data.fatal) {
            if (data.details === 'manifestLoadError') {
              error.value = 'Yayın hazırlanıyor, lütfen bekleyin...';
              // Retry loading after delay
              setTimeout(() => {
                if (!isDestroyed.value) {
                  userHls.loadSource(url);
                }
              }, 5000);
            } else {
              error.value = 'Yayın yüklenemedi. Lütfen tekrar deneyin.';
            }
          }
        });

        hls = userHls; // Store reference to cleanup later
        return;
      }

      // Regular channel handling
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
          maxLoadingDelay: 4,
          xhrSetup: function(xhr, url) {
            // Try both HTTP and HTTPS
            xhr.addEventListener('error', function() {
              if (url.startsWith('https:')) {
                // If HTTPS fails, try HTTP
                const httpUrl = url.replace('https:', 'http:');
                xhr.open('GET', httpUrl, true);
              } else if (url.startsWith('http:')) {
                // If HTTP fails, try HTTPS
                const httpsUrl = url.replace('http:', 'https:');
                xhr.open('GET', httpsUrl, true);
              }
            });
          },
          enableWorker: true,
          maxLoadingRetry: 10, // Increase retry attempts
          manifestLoadingMaxRetry: 10,
          manifestLoadingRetryDelay: 500 // Retry every 500ms
        });

        hls.attachMedia(videoElement);
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('Video ve HLS bağlandı');
          loadSource(url);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS error:', data.type, data);
          
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // If the error contains fallback URL information, use it
                if (data.response && data.response.text) {
                  try {
                    const errorInfo = JSON.parse(data.response.text);
                    if (errorInfo.fallbackUrl) {
                      console.log('Using fallback URL:', errorInfo.fallbackUrl);
                      hls.destroy();
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
                        maxLoadingDelay: 4,
                        xhrSetup: function(xhr, url) {
                          // Try both HTTP and HTTPS
                          xhr.addEventListener('error', function() {
                            if (url.startsWith('https:')) {
                              // If HTTPS fails, try HTTP
                              const httpUrl = url.replace('https:', 'http:');
                              xhr.open('GET', httpUrl, true);
                            } else if (url.startsWith('http:')) {
                              // If HTTP fails, try HTTPS
                              const httpsUrl = url.replace('http:', 'https:');
                              xhr.open('GET', httpsUrl, true);
                            }
                          });
                        },
                        enableWorker: true,
                        maxLoadingRetry: 10, // Increase retry attempts
                        manifestLoadingMaxRetry: 10,
                        manifestLoadingRetryDelay: 500 // Retry every 500ms
                      });
                      hls.on(Hls.Events.ERROR, onHlsError);
                      hls.loadSource(errorInfo.fallbackUrl);
                      hls.attachMedia(videoPlayer.value);
                      return; // Don't retry with original URL
                    }
                  } catch (e) {
                    console.log('Error parsing response:', e);
                  }
                }
                
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                // Try to use a default channel if everything fails
                console.log('Fatal error, switching to default channel...');
                hls.destroy();
                // Use TRT 1 as fallback
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
                  maxLoadingDelay: 4,
                  xhrSetup: function(xhr, url) {
                    // Try both HTTP and HTTPS
                    xhr.addEventListener('error', function() {
                      if (url.startsWith('https:')) {
                        // If HTTPS fails, try HTTP
                        const httpUrl = url.replace('https:', 'http:');
                        xhr.open('GET', httpUrl, true);
                      } else if (url.startsWith('http:')) {
                        // If HTTP fails, try HTTPS
                        const httpsUrl = url.replace('http:', 'https:');
                        xhr.open('GET', httpsUrl, true);
                      }
                    });
                  },
                  enableWorker: true,
                  maxLoadingRetry: 10, // Increase retry attempts
                  manifestLoadingMaxRetry: 10,
                  manifestLoadingRetryDelay: 500 // Retry every 500ms
                });
                hls.on(Hls.Events.ERROR, onHlsError);
                hls.loadSource('https://tv-trt1.medya.trt.com.tr/master.m3u8');
                hls.attachMedia(videoPlayer.value);
                break;
            }
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

    const handleNetworkError = async (data) => {
      console.log('Network error:', data);
      
      const streams = getStreamUrls(currentChannel.value?.name);
      const currentUrl = currentChannel.value?.stream_url;
      
      // Try HTTPS version first
      if (currentUrl.startsWith('http:')) {
        const httpsUrl = tryUpgradeToHttps(currentUrl);
        try {
          await fetch(httpsUrl, { method: 'HEAD' });
          initializeHls(videoPlayer.value, httpsUrl);
          return;
        } catch (e) {
          console.log('HTTPS upgrade failed, trying alternative streams');
        }
      }
      
      // Try alternative streams
      if (currentStreamIndex.value < streams.length - 1) {
        currentStreamIndex.value++;
        const nextStream = streams[currentStreamIndex.value];
        console.log(`Trying alternative stream ${currentStreamIndex.value + 1}/${streams.length}`);
        error.value = 'Alternatif yayın kaynağına bağlanılıyor...';
        initializeHls(videoPlayer.value, nextStream);
      } else {
        error.value = 'Yayın bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.';
        showRetryButton.value = true;
      }
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

    const handleVideoError = async (e) => {
      console.error('Video loading error:', e);
      
      const streams = getStreamUrls(currentChannel.value?.name);
      if (streams.length > 0) {
        if (currentStreamIndex.value < streams.length - 1) {
          currentStreamIndex.value++;
          const nextStream = streams[currentStreamIndex.value];
          error.value = `Alternatif kaynak deneniyor (${currentStreamIndex.value + 1}/${streams.length})`;
          isLoading.value = true;
          
          if (videoPlayer.value) {
            await cleanupVideo();
            setTimeout(() => {
              initializeHls(videoPlayer.value, nextStream);
            }, 1000);
          }
        } else {
          error.value = 'Tüm yayın kaynakları denendi. Erişilebilir kaynak bulunamadı.';
          isLoading.value = false;
          showRetryButton.value = true;
        }
      } else {
        // Fallback to original error handling
        error.value = 'Yayın kaynağı bulunamadı.';
        isLoading.value = false;
        showRetryButton.value = true;
      }
    };

    const cleanupVideo = async () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      
      // Clean up iframe state
      showIframe.value = false;
      iframeUrl.value = null;
      
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

    const onHlsError = (event, data) => {
      console.log('HLS error:', event, data);
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Network error in fallback stream, trying to recover...');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Media error in fallback stream, trying to recover...');
            hls.recoverMediaError();
            break;
          default:
            console.log('Fatal error in fallback stream, cannot recover');
            hls.destroy();
            break;
        }
      }
    };

    // Function to show iframe player for YouTube embeds
    const showIframePlayer = (embedUrl) => {
      console.log('Showing iframe player with URL:', embedUrl);
      
      // Set the iframe URL directly
      iframeUrl.value = embedUrl;
      
      // Show iframe and hide loader/errors
      showIframe.value = true;
      isLoading.value = false;
      error.value = null;
      
      // Focus the overlay after showing the iframe
      setTimeout(() => {
        focusYoutubeOverlay();
      }, 1000);
    };

    // Function to update favicon based on stream status
    const updateFavicon = (isStreamWorking) => {
      const favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        // Create favicon link if it doesn't exist
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/svg+xml';
        newFavicon.href = isStreamWorking ? '/onair.svg' : '/offair.svg';
        document.head.appendChild(newFavicon);
      } else {
        // Update existing favicon
        favicon.href = isStreamWorking ? '/onair.svg' : '/offair.svg';
      }
    };

    // Update favicon based on error state
    watch(error, (newError) => {
      updateFavicon(!newError);
    });

    // Update favicon based on loading state (completed loading = working stream)
    watch(isLoading, (stillLoading) => {
      if (!error.value) {
        updateFavicon(!stillLoading);
      }
    });

    // Update favicon when playing status changes
    watch(isPlaying, (playing) => {
      if (!error.value) {
        updateFavicon(playing);
      }
    });

    watch(currentChannel, async (newChannel, oldChannel) => {
      if (!newChannel) return;
      
      if (newChannel?.url || newChannel?.stream_url) {
        error.value = null;
        isLoading.value = true;
        errorCount.value = 0;
        currentStreamIndex.value = 0;
        showRetryButton.value = false;
        
        // Reset iframe state
        iframeUrl.value = null;
        showIframe.value = false;
        
        const streamUrl = newChannel.url || newChannel.stream_url;
        console.log('Loading channel:', newChannel.name, 'Type:', newChannel.type, 'URL:', streamUrl);
        
        // Handle YouTube content or embed URLs directly with iframe
        if (newChannel.type === 'youtube-live' || (streamUrl && streamUrl.includes('youtube.com/embed/'))) {
          console.log('Using iframe for YouTube content');
          showIframePlayer(streamUrl);
          return;
        }
        
        // For other streams, use HLS.js with standard video player
        if (videoPlayer.value) {
          await cleanupVideo();
          
          setTimeout(() => {
            if (!isDestroyed.value) {
              initializeHls(videoPlayer.value, streamUrl);
            }
          }, 1000);
        }
      }
    });

    watch(() => volumeInfo.value?.level, (newLevel) => {
      if (videoPlayer.value && newLevel !== undefined) {
        videoPlayer.value.volume = newLevel / 100;
      }
    });

    onMounted(() => {
      // Focus the overlay if YouTube is already playing
      if ((currentChannel.value?.type === 'youtube-live' || showIframe.value)) {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          focusYoutubeOverlay();
        }, 100);
      }
    });

    onUnmounted(() => {
      isDestroyed.value = true;
      
      // Destroy HLS instance if it exists
      if (hls) {
        hls.destroy();
        hls = null;
      }
      
      // Clean up iframe state
      showIframe.value = false;
      iframeUrl.value = null;
      
      // Clear any pending timeouts
      clearTimeouts();
      
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
      }
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
      togglePlay,
      iframeUrl,
      showIframe,
      volumeIcon,
      youtubeOverlay,
      handleKeyDown,
      focusYoutubeOverlay,
      updateFavicon,
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

/* Make the overlay non-interactive visually but still capture events */
[tabindex="0"]:focus {
  outline: none;
}

/* Ensure the overlay doesn't interfere with video viewing */
.absolute.inset-0.z-10 {
  pointer-events: all; /* Capture all pointer events */
  cursor: default;
}
</style>