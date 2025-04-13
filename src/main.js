import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// Create Pinia instance first
const pinia = createPinia()

// Create the app instance and attach plugins
const app = createApp(App)

// Mount Pinia first to ensure store availability
app.use(pinia)

// Add error handling to help diagnose issues
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
}

// Mount the application
app.mount('#app')
