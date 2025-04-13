<template>
  <button 
    @click="toggleInfoBar" 
    class="info-toggle-button"
    :class="{'active': isActive}"
  >
    <i class="bi bi-info"></i>
  </button>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'InfoToggleButton',
  emits: ['toggle'],
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const isActive = ref(props.active);

    const toggleInfoBar = () => {
      isActive.value = !isActive.value;
      emit('toggle', isActive.value);
    };

    return {
      isActive,
      toggleInfoBar
    };
  }
}
</script>

<style scoped>
.info-toggle-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 950;
  font-size: 1.1rem;
}

.info-toggle-button:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.info-toggle-button.active {
  background-color: rgba(40, 167, 69, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}
</style> 