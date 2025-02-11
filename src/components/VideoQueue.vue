<template>
  <div class="video-queue">
    <el-button @click="startLiveStream" :disabled="isLiveStreamActive">
      Start Live Stream
    </el-button>
    <el-button @click="endLiveStream" :disabled="!isLiveStreamActive">
      End Live Stream
    </el-button>

    <el-table :data="queue">
      <el-table-column prop="title" label="Title" />
      <el-table-column prop="status" label="Status" />
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queue: [],
      isLiveStreamActive: false
    }
  },
  methods: {
    startLiveStream() {
      this.isLiveStreamActive = true
    },
    endLiveStream() {
      this.isLiveStreamActive = false
    }
  }
}
</script>
