<template>
  <Transition name="slide-down">
    <div v-if="isVisible" class="keyboard-info-container">
      <div class="keyboard-info-bar">
        <div class="shortcut-items">
          <div class="shortcut-item">
            <span class="key">C</span>
            <span class="desc">Channel List</span>
          </div>
          <div class="shortcut-item">
            <span class="key">R</span>
            <span class="desc">Remote Control</span>
          </div>
          <div class="shortcut-item">
            <span class="key">E</span>
            <span class="desc">Language Settings</span>
          </div>
          <div class="shortcut-item">
            <span class="key">S</span>
            <span class="desc">Stream Manager</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Y</span>
            <span class="desc">YouTube to HLS</span>
          </div>
          <div class="shortcut-item">
            <span class="key">L</span>
            <span class="desc">YouTube Lives</span>
          </div>
          <div class="shortcut-item">
            <span class="key">P</span>
            <span class="desc">User Profile</span>
          </div>
          <div class="shortcut-item">
            <span class="key">A</span>
            <span class="desc">Auth</span>
          </div>
          <div class="shortcut-item">
            <span class="key">M</span>
            <span class="desc">M3U Import</span>
          </div>
          <div class="shortcut-item">
            <span class="key">↑↓</span>
            <span class="desc">Change Channel</span>
          </div>
          <div class="shortcut-item">
            <span class="key">←→</span>
            <span class="desc">Volume Control</span>
          </div>
        </div>
        <button class="close-button" @click="hideInfoBar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'KeyboardInfoBar',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const isVisible = ref(props.visible);
    
    const hideInfoBar = () => {
      emit('update:visible', false);
    };

    watch(() => props.visible, (newValue) => {
      isVisible.value = newValue;
    });

    return {
      isVisible,
      hideInfoBar
    };
  }
}
</script>

<style scoped>
.keyboard-info-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 900;
  display: flex;
  justify-content: center;
}

.keyboard-info-bar {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 0 0 12px 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  display: flex;
  align-items: center;
  max-width: 90%;
  position: relative;
}

.shortcut-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 4px;
  min-width: 28px;
  font-size: 0.85rem;
  font-family: monospace;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.desc {
  color: #f0f0f0;
  font-size: 0.85rem;
}

.close-button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Only show on desktop/laptop */
@media (max-width: 1023px) {
  .keyboard-info-container {
    display: none;
  }
}
</style> 