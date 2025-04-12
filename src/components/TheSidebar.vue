<template>
  <div class="sidebar">
    // ...existing code...
    <el-menu-item index="/stream-management">
      <el-icon><VideoCamera /></el-icon>
      <span>Manage Streams</span>
    </el-menu-item>
    // ...existing code...
  </div>
</template>

<script>
import { VideoCamera } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

export default {
  components: {
    VideoCamera
  },
  setup() {
    const authStore = useAuthStore();
    const user = computed(() => authStore.currentUser);
    const isAdmin = computed(() => authStore.isAdmin);
    
    const logout = () => {
      authStore.logout();
    };
    
    return {
      user,
      isAdmin,
      logout
    };
  }
}
</script>
