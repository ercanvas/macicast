<template>
  <div class="stream-manager bg-black/80 backdrop-blur p-6 rounded-2xl w-[450px]">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Stream Yönetimi</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Video Upload Section -->
    <div class="mb-6 p-4 border-2 border-dashed border-gray-700 rounded-lg">
      <input 
        type="file" 
        ref="fileInput"
        @change="handleFileUpload" 
        accept="video/*"
        class="hidden" 
      />
      <div class="text-center" @click="$refs.fileInput.click()">
        <i class="bi bi-cloud-upload text-4xl mb-2"></i>
        <p>Video Yükle veya Buraya Sürükle</p>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadProgress > 0" class="mb-4">
      <div class="flex justify-between mb-1">
        <span>Yükleniyor...</span>
        <span>{{uploadProgress}}%</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div class="bg-primary h-2 rounded-full" :style="{width: `${uploadProgress}%`}"></div>
      </div>
    </div>

    <!-- Video Queue -->
    <div v-if="videoQueue.length > 0" class="mb-6">
      <h3 class="text-xl mb-3">Video Kuyruğu</h3>
      <div class="space-y-2 max-h-[200px] overflow-y-auto">
        <div v-for="(video, index) in videoQueue" 
             :key="index"
             class="flex items-center justify-between bg-gray-800/50 p-2 rounded">
          <span class="truncate">{{video.name}}</span>
          <div class="flex gap-2">
            <button @click="removeFromQueue(index)" class="text-red-500 hover:text-red-400">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stream Controls -->
    <div class="space-y-4">
      <div class="form-group">
        <label class="block mb-2">Stream Adı</label>
        <input v-model="streamName" 
               class="w-full bg-gray-800 p-2 rounded" 
               placeholder="Stream adını girin" />
      </div>

      <div class="flex gap-4">
        <button @click="startStream" 
                class="flex-1 bg-primary px-4 py-2 rounded hover:bg-primary/80 disabled:opacity-50"
                :disabled="!streamName || videoQueue.length === 0">
          <i class="bi bi-play-fill mr-2"></i>
          Stream Başlat
        </button>
        <button @click="stopStream" 
                class="flex-1 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                :disabled="!isStreaming">
          <i class="bi bi-stop-fill mr-2"></i>
          Stream Durdur
        </button>
      </div>
    </div>

    <!-- Active Streams -->
    <div v-if="activeStreams.length > 0" class="mt-6">
      <h3 class="text-xl mb-3">Aktif Streamler</h3>
      <div class="space-y-2">
        <div v-for="stream in activeStreams" 
             :key="stream.id"
             class="flex justify-between items-center bg-gray-800/50 p-3 rounded">
          <div>
            <span class="font-medium">{{stream.name}}</span>
            <p class="text-sm text-gray-400">{{stream.viewers}} izleyici</p>
          </div>
          <div class="flex gap-2">
            <button @click="copyStreamUrl(stream.playbackUrl)" 
                    class="text-gray-400 hover:text-white">
              <i class="bi bi-clipboard"></i>
            </button>
            <button @click="stopSpecificStream(stream.id)" 
                    class="text-red-500 hover:text-red-400">
              <i class="bi bi-stop-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add processing indicator -->
  <div v-if="isProcessing" class="fixed inset-0 bg-black/80 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin text-primary text-4xl mb-4">
        <i class="bi bi-arrow-repeat"></i>
      </div>
      <p>Stream hazırlanıyor...</p>
    </div>
  </div>

  <!-- Processing Overlay -->
  <div v-if="isProcessing" 
       class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center p-6 rounded-xl bg-black/50">
      <div class="animate-spin text-primary text-4xl mb-4">
        <i class="bi bi-arrow-repeat"></i>
      </div>
      <p class="text-xl font-medium mb-2">Stream Hazırlanıyor</p>
      <p class="text-gray-400">Videolarınız işleniyor, lütfen bekleyin...</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useChannelStore } from '../stores/channelStore'
import { endpoints } from '../config/api'

export default {
  name: 'ManageStream',
  setup() {
    const store = useChannelStore()
    const streamName = ref('')
    const videoQueue = ref([])
    const activeStreams = ref([])
    const uploadProgress = ref(0)
    const isStreaming = ref(false)
    const isProcessing = ref(false)

    const handleFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('video', file)

      try {
        uploadProgress.value = 0
        const response = await fetch(endpoints.upload, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Add this for CORS
        })

        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('Video dosyası çok büyük. Maksimum 100MB yükleyebilirsiniz.')
          }
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()
        videoQueue.value.push({
          name: file.name,
          path: result.path
        })
      } catch (error) {
        console.error('Upload error:', error)
        alert(error.message || 'Video yükleme başarısız oldu. Lütfen tekrar deneyin.')
      } finally {
        uploadProgress.value = 0
      }
    }

    const startStream = async () => {
      try {
        isProcessing.value = true;
        const streamData = {
          name: streamName.value,
          videos: videoQueue.value
        };

        const response = await fetch(endpoints.startStream, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(streamData)
        });

        if (!response.ok) {
          throw new Error('Failed to start stream');
        }

        const result = await response.json();
        
        // Start polling for stream status
        const pollStatus = async () => {
          const statusRes = await fetch(endpoints.getStreamStatus(result.id));
          const statusData = await statusRes.json();

          console.log('Stream status:', statusData.status);

          if (statusData.status === 'active') {
            // Stream is ready
            activeStreams.value.push({
              id: result.id,
              name: result.name,
              playbackUrl: statusData.playbackUrl
            });
            isStreaming.value = true;
            isProcessing.value = false;

            // Add to channel list
            store.addUserStream({
              id: result.id,
              name: result.name,
              url: statusData.playbackUrl,
              type: 'user-stream',
              status: 'active'
            });

            // Clear form
            streamName.value = '';
            videoQueue.value = [];
            
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Stream processing failed');
          } else {
            // Keep polling
            setTimeout(pollStatus, 3000);
          }
        };

        pollStatus();

      } catch (error) {
        console.error('Stream start error:', error);
        alert(error.message || 'Failed to start stream');
        isProcessing.value = false;
      }
    };

    const stopStream = async () => {
      try {
        const response = await fetch(endpoints.stopStream, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Stream stop failed: ${response.statusText}`)
        }

        activeStreams.value = []
        isStreaming.value = false
        store.removeUserStreams()
      } catch (error) {
        console.error('Stream stop error:', error)
        alert('Yayın durdurulamadı. Lütfen tekrar deneyin.')
      }
    }

    const stopSpecificStream = async (streamId) => {
      try {
        await fetch(`http://localhost:3000/stop-stream/${streamId}`, {
          method: 'POST'
        })
        activeStreams.value = activeStreams.value.filter(s => s.id !== streamId)
      } catch (error) {
        console.error('Stream durdurma hatası:', error)
      }
    }

    const copyStreamUrl = (url) => {
      navigator.clipboard.writeText(url)
    }

    return {
      streamName,
      videoQueue,
      activeStreams,
      uploadProgress,
      isStreaming,
      isProcessing,
      handleFileUpload,
      startStream,
      stopStream,
      stopSpecificStream,
      copyStreamUrl
    }
  }
}
</script>
