<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <button @click="$emit('close')" class="close-button">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    
    <div class="sidebar-menu">
      <div class="menu-item">
        <i class="bi bi-camera-video"></i>
        <span>Manage Streams</span>
      </div>
      <!-- Add other menu items -->
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close']
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.sidebar-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
