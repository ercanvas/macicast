<template>
  <div class="stream-management">
    <el-card class="upload-card">
      <template #header>Upload Video</template>
      <VideoUpload />
    </el-card>

    <el-card class="queue-card">
      <template #header>Video Queue</template>
      <VideoQueue />
    </el-card>
  </div>
</template>

<script>
import VideoUpload from '../components/VideoUpload.vue'
import VideoQueue from '../components/VideoQueue.vue'

export default {
  components: {
    VideoUpload,
    VideoQueue
  }
}
</script>
