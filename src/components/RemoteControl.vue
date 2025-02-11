<template>
  <div class="bg-black/95 backdrop-blur rounded-3xl border border-gray-800 p-6 shadow-2xl">
    <!-- Başlık ve Kapat Butonu -->
    <div class="flex justify-between items-center mb-6">
      <button class="remote-btn bg-red-900/50 hover:bg-red-800/50 text-red-500">
        <i class="bi bi-power"></i>
      </button>
      <button @click="$emit('close')" 
              class="remote-btn bg-gray-800/50 hover:bg-gray-700/50">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Navigasyon Kontrolleri -->
    <div class="mb-4">
      <div class="relative">
        <!-- Dış Halka -->
        <div class="w-48 h-48 md:w-56 md:h-56 mx-auto rounded-full bg-gray-800/30 p-2">
          <!-- İç Halka -->
          <div class="w-full h-full rounded-full bg-gray-800/50 relative">
            <!-- Yön Tuşları -->
            <button @click="changeChannel('up')"
                    class="remote-nav-btn absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 text-2xl">
              <i class="bi bi-chevron-up"></i>
            </button>
            <button @click="changeChannel('down')"
                    class="remote-nav-btn absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 text-2xl">
              <i class="bi bi-chevron-down"></i>
            </button>
            <button @click="changeVolume('down')"
                    class="remote-nav-btn absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 text-2xl">
              <i class="bi bi-volume-down"></i>
            </button>
            <button @click="changeVolume('up')"
                    class="remote-nav-btn absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 text-2xl">
              <i class="bi bi-volume-up"></i>
            </button>
            
            <!-- Orta OK Tuşu -->
            <button class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 
                         rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all
                         flex items-center justify-center text-2xl">
              <i class="bi bi-play-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobilde Gizlenecek Numara Tuşları -->
    <div class="hidden md:grid grid-cols-3 gap-4">
      <button v-for="n in 9" :key="n" 
              @click="addNumber(n)"
              class="remote-btn bg-gray-800/50 hover:bg-gray-700/50 w-14 h-14 text-xl">
        {{ n }}
      </button>
      <button @click="clearNumber"
              class="remote-btn bg-gray-800/50 hover:bg-gray-700/50 w-14 h-14 text-xl">
        <i class="bi bi-backspace"></i>
      </button>
      <button @click="addNumber(0)"
              class="remote-btn bg-gray-800/50 hover:bg-gray-700/50 w-14 h-14 text-xl">
        0
      </button>
      <button @click="confirmChannelNumber"
              class="remote-btn bg-primary/20 hover:bg-primary/30 text-primary w-14 h-14 text-xl">
        <i class="bi bi-check-lg"></i>
      </button>
    </div>

    <!-- Geçici Kanal Numarası Göstergesi -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="tempChannelNumber" 
           class="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/20 px-4 py-2 rounded-xl">
        <span class="text-2xl font-bold text-primary">{{ tempChannelNumber }}</span>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useChannelStore } from '../stores/channelStore';

export default {
  emits: ['close'],
  setup() {
    const store = useChannelStore();
    const tempChannelNumber = ref('');
    let numberTimeout = null;

    const addNumber = (num) => {
      tempChannelNumber.value += num.toString();
      clearTimeout(numberTimeout);
      numberTimeout = setTimeout(() => {
        confirmChannelNumber();
      }, 2000);
    };

    const clearNumber = () => {
      tempChannelNumber.value = tempChannelNumber.value.slice(0, -1);
    };

    const confirmChannelNumber = () => {
      if (tempChannelNumber.value) {
        const channelNumber = parseInt(tempChannelNumber.value);
        const channel = store.channels.find(c => c.channel_number === channelNumber);
        if (channel) {
          store.setCurrentChannel(channel);
        }
        tempChannelNumber.value = '';
      }
      clearTimeout(numberTimeout);
    };

    const changeChannel = (direction) => {
      const currentIndex = store.channels.findIndex(c => c.id === store.currentChannel?.id);
      if (currentIndex === -1) return;

      let nextIndex;
      if (direction === 'up') {
        nextIndex = currentIndex === 0 ? store.channels.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === store.channels.length - 1 ? 0 : currentIndex + 1;
      }
      
      store.setCurrentChannel(store.channels[nextIndex]);
    };

    const changeVolume = (direction) => {
      const currentVolume = store.volumeInfo.level;
      let newVolume = direction === 'up' ? 
        Math.min(currentVolume + 5, 100) : 
        Math.max(currentVolume - 5, 0);

      store.setVolumeInfo({
        level: newVolume,
        show: true
      });

      setTimeout(() => {
        store.setVolumeInfo({
          level: newVolume,
          show: false
        });
      }, 2000);
    };

    return {
      tempChannelNumber,
      addNumber,
      clearNumber,
      confirmChannelNumber,
      changeChannel,
      changeVolume
    };
  }
};
</script>

<style scoped>
.remote-btn {
  @apply rounded-full flex items-center justify-center text-white/90 transition-all hover:text-white;
}

.remote-nav-btn {
  @apply rounded-full flex items-center justify-center text-white/90 transition-all 
         bg-gray-800/50 hover:bg-primary/20 hover:text-primary;
}
</style> 