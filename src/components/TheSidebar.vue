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

export default {
  components: {
    VideoCamera
  }
}
</script>
