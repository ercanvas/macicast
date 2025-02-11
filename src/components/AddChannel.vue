<template>
  <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Yeni Kanal Ekle</h2>
        <button @click="$emit('close')" 
                class="w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Channel Name -->
        <div>
          <label class="block text-sm font-medium mb-1">Kanal Adı</label>
          <input 
            v-model="form.name"
            type="text"
            required
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
        </div>

        <!-- Channel Number -->
        <div>
          <label class="block text-sm font-medium mb-1">Kanal Numarası</label>
          <input 
            v-model="form.channel_number"
            type="number"
            required
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
        </div>

        <!-- Stream URL -->
        <div>
          <label class="block text-sm font-medium mb-1">Yayın URL (HLS)</label>
          <input 
            v-model="form.stream_url"
            type="url"
            required
            placeholder="https://example.com/stream.m3u8"
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
        </div>

        <!-- Logo URL -->
        <div>
          <label class="block text-sm font-medium mb-1">Logo URL</label>
          <input 
            v-model="form.logo_url"
            type="url"
            placeholder="https://example.com/logo.png"
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
          <!-- Logo Preview -->
          <div v-if="form.logo_url" class="mt-2 flex items-center space-x-2">
            <img :src="form.logo_url" alt="Logo Preview" class="w-8 h-8 object-contain bg-black/30 rounded">
            <span class="text-sm text-gray-400">Logo Önizleme</span>
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium mb-1">Kategori</label>
          <select 
            v-model="form.category"
            required
            class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Ulusal">Ulusal</option>
            <option value="Haber">Haber</option>
            <option value="Spor">Spor</option>
            <option value="Çocuk">Çocuk</option>
            <option value="Belgesel">Belgesel</option>
            <option value="Müzik">Müzik</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary/80 text-white rounded-xl py-3 font-medium 
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Ekleniyor...</span>
          <span v-else>Kanalı Ekle</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useChannelStore } from '../stores/channelStore';
import axios from 'axios';

export default {
  emits: ['close', 'channel-added'],
  
  setup(props, { emit }) {
    const store = useChannelStore();
    const loading = ref(false);
    const error = ref(null);
    
    const form = reactive({
      name: '',
      channel_number: '',
      stream_url: '',
      logo_url: '',
      category: 'Ulusal'
    });

    const handleSubmit = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.post('http://localhost:3000/api/channels', form);
        await store.fetchChannels(); // Refresh channel list
        emit('channel-added', response.data.channel);
        emit('close');
      } catch (err) {
        console.error('Error adding channel:', err);
        error.value = 'Kanal eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      error,
      handleSubmit
    };
  }
};
</script>
