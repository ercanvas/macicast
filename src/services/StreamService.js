class StreamService {
  constructor() {
    this.streams = [];
  }

  addStream(stream) {
    this.streams.push(stream);
  }

  removeStream(streamId) {
    this.streams = this.streams.filter(stream => stream.id !== streamId);
  }

  getActiveStreams() {
    return this.streams.filter(stream => stream.isActive);
  }

  startLiveStream(streamId) {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.isActive = true;
    }
  }

  endLiveStream(streamId) {
    const stream = this.streams.find(s => s.id === streamId);
    if (stream) {
      stream.isActive = false;
    }
  }
}

export default new StreamService();
