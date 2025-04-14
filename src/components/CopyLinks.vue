// filepath: c:\Users\yasin\macicast\macicast\src\components\CopyLinks.vue
<template>
  <div class="fixed bottom-4 left-4">
    <div class="flex items-center space-x-2">
      <!-- Toggle Button for Copy Links -->
      <button 
        @click="toggleLinks"
        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border"
        :class="isActive ? 'bg-primary/20 text-primary border-primary/20' : 'bg-black/20 text-white/50 hover:bg-black/30 border-white/10'"
      >
        <i class="bi bi-link-45deg"></i>
      </button>

      <!-- M3U List Button (Always Active) -->
      <button 
        @click="toggleM3UImport"
        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-primary/20 text-primary border border-primary/20"
      >
        <i class="bi bi-list-ul"></i>
      </button>

      <!-- Links List with Transition -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform -translate-x-4 opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform -translate-x-4 opacity-0"
      >
        <div v-if="isActive" class="flex items-center space-x-2">
          <!-- Quick Add Form -->
          <div v-if="showQuickAdd" class="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2">
            <input 
              v-model="quickAdd.name"
              type="text"
              placeholder="Playlist name"
              class="bg-gray-700/50 text-white px-3 py-1 rounded-lg text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            >
            <input 
              v-model="quickAdd.url"
              type="url"
              placeholder="M3U URL"
              class="bg-gray-700/50 text-white px-3 py-1 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary"
            >
            <button 
              @click="addQuickLink"
              class="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded-lg text-sm transition-colors"
            >
              Add
            </button>
            <button 
              @click="toggleQuickAdd"
              class="text-gray-400 hover:text-white"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- Existing Links and Add Button (only shown when quick add is not active) -->
          <template v-if="!showQuickAdd">
            <div class="flex space-x-2">
              <button v-for="(link, name) in links" 
                      :key="name"
                      class="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>{{ name }}</span>
                <div class="flex items-center space-x-1">
                  <i class="bi bi-clipboard cursor-pointer" @click="copyLink(link)"></i>
                  <i class="bi bi-trash text-red-500 cursor-pointer hover:text-red-400" @click="confirmDelete(name)"></i>
                </div>
              </button>
            </div>

            <!-- Add Button -->
            <div class="flex items-center space-x-2">
              <button 
                @click="toggleQuickAdd"
                class="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AreYouSure
      :show="showDeleteConfirm"
      :title="'Delete Link'"
      :message="'Are you sure you want to delete this link?'"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />

    <!-- Copied Info Bar -->
    <CopiedInfoBar :show="showCopiedInfo" />

    <!-- M3U Import Component -->
    <M3UToChannelList 
      v-if="showM3UImport" 
      @close="showM3UImport = false"
      :copiedLinks="links"
    />
  </div>
</template>

<script>
import CopiedInfoBar from './CopiedInfoBar.vue';
import AreYouSure from './AreYouSure.vue';
import M3UToChannelList from './M3UToChannelList.vue';

export default {
  components: {
    CopiedInfoBar,
    AreYouSure,
    M3UToChannelList
  },
  data() {
    return {
      links: {
        'Philippines': 'https://iptv-org.github.io/iptv/countries/ph.m3u',
        'Turkey': 'https://iptv-org.github.io/iptv/countries/tr.m3u'
      },
      isActive: false,
      showQuickAdd: false,
      showCopiedInfo: false,
      showM3UImport: false,
      showDeleteConfirm: false,
      linkToDelete: null,
      quickAdd: {
        name: '',
        url: ''
      }
    }
  },
  methods: {
    toggleLinks() {
      this.isActive = !this.isActive
    },
    toggleM3UImport() {
      this.showM3UImport = !this.showM3UImport
    },
    toggleQuickAdd() {
      this.showQuickAdd = !this.showQuickAdd
      if (!this.showQuickAdd) {
        this.quickAdd = { name: '', url: '' }
      }
    },
    addQuickLink() {
      if (this.quickAdd.name && this.quickAdd.url) {
        this.links[this.quickAdd.name] = this.quickAdd.url
        this.quickAdd = { name: '', url: '' }
        this.showQuickAdd = false
      }
    },
    copyLink(link) {
      navigator.clipboard.writeText(link)
      this.showCopiedInfo = true
      setTimeout(() => {
        this.showCopiedInfo = false
      }, 1000)
    },
    confirmDelete(name) {
      this.linkToDelete = name
      this.showDeleteConfirm = true
    },
    handleDelete() {
      if (this.linkToDelete) {
        delete this.links[this.linkToDelete]
      }
      this.showDeleteConfirm = false
      this.linkToDelete = null
    },
    cancelDelete() {
      this.showDeleteConfirm = false
      this.linkToDelete = null
    }
  }
}
</script>