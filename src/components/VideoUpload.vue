<template>
  <div class="video-upload">
    <input type="file" accept="video/*" @change="handleUpload" />
    <el-progress v-if="uploading" :percentage="progress" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      uploading: false,
      progress: 0
    }
  },
  methods: {
    async handleUpload(event) {
      const file = event.target.files?.[0]
      if (!file) return

      this.uploading = true
      const formData = new FormData()
      formData.append('video', file)

      try {
        await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        this.$message.success('Video uploaded successfully')
      } catch (error) {
        this.$message.error('Upload failed')
      }
      this.uploading = false
    }
  }
}
</script>