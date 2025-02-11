import { defineStore } from 'pinia'

export const useStreamStore = defineStore('stream', {
  state: () => ({
    streams: [],
    isLiveStreamActive: false
  }),
  
  actions: {
    addStream(stream) {
      this.streams.push(stream)
    },
    removeStream(streamId) {
      this.streams = this.streams.filter(stream => stream.id !== streamId)
    },
    setLiveStreamActive(status) {
      this.isLiveStreamActive = status
    },
    getActiveStreams() {
      return this.streams.filter(stream => stream.isActive)
    }
  }
})
