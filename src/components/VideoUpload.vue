<template>
      <div class="p-4">
        <input type="file" @change="uploadVideo" accept="video/*" />
        <div v-if="uploading" class="mt-2">
          Uploading: {{ progress }}%
        </div>
      </div>  
    </template>
    
    <script>
    import axios from 'axios';
    
    export default {
      data() {
        return {
          uploading: false,
          progress: 0
        }
      },
      methods: {
        async uploadVideo(event) {
          const file = event.target.files[0];
          const formData = new FormData();
          formData.append('video', file);
          
          this.uploading = true;
          try {
            await axios.post('/api/upload', formData, {
              onUploadProgress: (e) => {
                this.progress = Math.round((e.loaded * 100) / e.total);
              }
            });
            this.$emit('upload-complete');
          } catch (error) {
            console.error('Upload failed:', error);
          }
          this.uploading = false;
        }
      }
    }
    </script>