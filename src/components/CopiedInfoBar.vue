<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <div v-if="show" class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-full flex items-center gap-2 z-50">
      <i class="bi bi-clipboard-check text-green-500"></i>
      <span class="text-white font-medium">Copied</span>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'CopiedInfoBar',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  }
}
</script>