<template>
  <div class="space-y-8">
    <!-- TV ve Kontroller Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
      <!-- TV Ekranı -->
      <div class="md:col-span-8 order-2 md:order-1">
        <TVScreen />
      </div>
      
      <!-- Sağ Panel -->
      <div class="md:col-span-4 order-1 md:order-2 space-y-6">
        <ChannelList />
        <RemoteControl />
      </div>
    </div>
  </div>
</template>

<script>
import TVScreen from '../components/TVScreen.vue'
import ChannelList from '../components/ChannelList.vue'
import RemoteControl from '../components/RemoteControl.vue'

export default {
  components: {
    TVScreen,
    ChannelList,
    RemoteControl
  }
}
</script> 