<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const favorites = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchFavorites = async () => {
      try {
        const response = await axios.get('https://macicast-backend.onrender.com/api/favorites');
        favorites.value = response.data;
      } catch (err) {
        console.error('Error fetching favorite channels:', err);
        error.value = 'Favori kanallar yüklenirken bir hata oluştu.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchFavorites);

    return {
      favorites,
      loading,
      error
    };
  }
};
</script>
