<template>
      <div id="app">
        <h1>Video Kuyruğu ve Canlı Yayın</h1>
    
        <div>
          <input v-model="videoPath" placeholder="Video Dosyasının Yolu" />
          <button @click="addVideoToQueue">Videoyu Kuyruğa Ekle</button>
        </div>
    
        <div>
          <button @click="startLiveStream">Canlı Yayına Başla</button>
          <button @click="stopLiveStream">Canlı Yayından Çık</button>
        </div>
    
        <div>
          <h2>Video Kuyruğu</h2>
          <ul>
            <li v-for="(video, index) in videoQueue" :key="index">
              {{ video }}
            </li>
          </ul>
        </div>
    
        <video v-if="videoUrl" controls autoplay>
          <source :src="videoUrl" type="application/vnd.apple.mpegurl" />
          Video oynatılamıyor.
        </video>
      </div>
    </template>
    
    <script>
    import axios from 'axios';
    
    export default {
      data() {
        return {
          videoPath: '',
          videoQueue: [],
          videoUrl: null,
        };
      },
      methods: {
        async addVideoToQueue() {
          try {
            const response = await axios.post('http://localhost:3000/add-video', {
              videoPath: this.videoPath,
            });
            this.videoQueue.push(response.data.playlist);
          } catch (error) {
            console.error('Error adding video to queue', error);
          }
        },
        async startLiveStream() {
          try {
            const response = await axios.post('http://localhost:3000/start-live-stream');
            this.videoUrl = response.data.streamUrl;
          } catch (error) {
            console.error('Error starting live stream', error);
          }
        },
        async stopLiveStream() {
          try {
            await axios.post('http://localhost:3000/stop-live-stream');
            this.videoUrl = null; // Stop live stream
          } catch (error) {
            console.error('Error stopping live stream', error);
          }
        },
        async fetchQueue() {
          try {
            const response = await axios.get('http://localhost:3000/video-queue');
            this.videoQueue = response.data;
          } catch (error) {
            console.error('Error fetching video queue', error);
          }
        },
      },
      mounted() {
        this.fetchQueue();
      },
    };
    </script>
    