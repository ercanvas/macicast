<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
      
      <!-- Dialog -->
      <div class="bg-gray-900 p-6 rounded-2xl border border-gray-800 w-full max-w-sm relative z-10">
        <h3 class="text-xl font-bold mb-4">{{ title }}</h3>
        <p class="text-gray-400 mb-6">{{ message }}</p>
        
        <div class="flex justify-end gap-3">
          <button 
            @click="$emit('cancel')"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="$emit('confirm')"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'AreYouSure',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Are you sure?'
    },
    message: {
      type: String,
      default: 'This action cannot be undone.'
    },
    confirmText: {
      type: String,
      default: 'Yes, delete'
    },
    cancelText: {
      type: String,
      default: 'No, cancel'
    }
  },
  emits: ['confirm', 'cancel']
}
</script>