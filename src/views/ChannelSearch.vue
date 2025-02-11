<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const query = ref('');
    const results = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const searchChannels = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.get('https://macicast-backend.onrender.com/api/channels/search', {
          params: { q: query.value }
        });
        results.value = response.data;
      } catch (err) {
        console.error('Error searching channels:', err);
        error.value = 'Kanal araması yapılırken bir hata oluştu.';
      } finally {
        loading.value = false;
      }
    };

    return {
      query,
      results,
      loading,
      error,
      searchChannels
    };
  }
};
</script>
