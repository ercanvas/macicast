// filepath: c:\Users\yasin\macicast\macicast\src\components\CopyLinks.vue
<template>
  <div class="fixed bottom-4 left-4">
    <div class="flex items-center space-x-2">
      <!-- Add Link Button (changed from plus to link icon) -->
      <button 
        @click="showAddModal = true"
        class="bg-primary/20 hover:bg-primary/30 text-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors"
      >
        <i class="bi bi-link-45deg"></i>
      </button>

      <!-- Existing Links -->
      <div class="space-x-2 flex">
        <button v-for="(link, name) in links" 
                :key="name"
                class="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>{{ name }}</span>
          <div class="flex items-center space-x-1">
            <i class="bi bi-clipboard cursor-pointer" @click="copyLink(link)"></i>
            <i class="bi bi-trash text-red-500 cursor-pointer hover:text-red-400" @click="deleteLink(name)"></i>
          </div>
        </button>
      </div>
    </div>

    <!-- Add Link Modal -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal-content bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Add New IPTV Link</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-white">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="addNewLink" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input 
              v-model="newLink.name"
              type="text"
              required
              class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Philippines IPTV"
            >
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">URL</label>
            <input 
              v-model="newLink.url"
              type="url"
              required
              class="w-full bg-gray-800/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/playlist.m3u8"
            >
          </div>

          <button 
            type="submit"
            class="w-full bg-primary hover:bg-primary/80 text-white rounded-xl py-3 font-medium transition-colors"
          >
            Add Link
          </button>
        </form>
      </div>
    </div>

    <!-- Copied Info Bar -->
    <CopiedInfoBar :show="showCopiedInfo" />
  </div>
</template>

<script>
import CopiedInfoBar from './CopiedInfoBar.vue';

export default {
  components: {
    CopiedInfoBar
  },
  data() {
    return {
      links: {
        'Philippines': 'https://iptv-org.github.io/iptv/countries/ph.m3u',
        'Turkey': 'https://iptv-org.github.io/iptv/countries/tr.m3u'
      },
      showAddModal: false,
      showCopiedInfo: false,
      newLink: {
        name: '',
        url: ''
      }
    }
  },
  methods: {
    copyLink(link) {
      navigator.clipboard.writeText(link)
      this.showCopiedInfo = true
      setTimeout(() => {
        this.showCopiedInfo = false
      }, 1000)
    },
    addNewLink() {
      if (this.newLink.name && this.newLink.url) {
        this.links[this.newLink.name] = this.newLink.url
        this.newLink = { name: '', url: '' }
        this.showAddModal = false
      }
    },
    deleteLink(name) {
      if (confirm('Are you sure you want to delete this link?')) {
        delete this.links[name]
      }
    }
  }
}
</script>