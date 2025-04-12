<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="text-2xl font-bold mb-6">{{ isRegister ? 'Create Account' : 'Login' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Username/Email -->
        <div class="form-group">
          <label for="username" class="block text-sm font-medium mb-1">Username or Email</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            class="w-full px-3 py-2 border rounded-md" 
            required
          />
        </div>
        
        <!-- Email (Register only) -->
        <div v-if="isRegister" class="form-group">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            class="w-full px-3 py-2 border rounded-md" 
            required
          />
        </div>
        
        <!-- Password -->
        <div class="form-group">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            class="w-full px-3 py-2 border rounded-md" 
            required
          />
        </div>
        
        <!-- Confirm Password (Register only) -->
        <div v-if="isRegister" class="form-group">
          <label for="confirmPassword" class="block text-sm font-medium mb-1">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="form.confirmPassword" 
            class="w-full px-3 py-2 border rounded-md" 
            required
          />
        </div>
        
        <!-- Display Name (Register only) -->
        <div v-if="isRegister" class="form-group">
          <label for="displayName" class="block text-sm font-medium mb-1">Display Name (Optional)</label>
          <input 
            type="text" 
            id="displayName" 
            v-model="form.displayName" 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
        
        <!-- Submit button -->
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ isRegister ? 'Create Account' : 'Login' }}
          <span v-if="loading"> ...</span>
        </button>
      </form>
      
      <!-- Toggle between login and register -->
      <div class="mt-4 text-center">
        <button 
          @click="isRegister = !isRegister" 
          class="text-blue-600 underline"
        >
          {{ isRegister ? 'Already have an account? Login' : 'Need an account? Register' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import axios from 'axios';

export default {
  name: 'LoginComponent',
  emits: ['login-success'],
  
  setup(props, { emit }) {
    const isRegister = ref(false);
    const loading = ref(false);
    const error = ref('');
    
    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    
    const handleSubmit = async () => {
      error.value = '';
      
      // Validation
      if (isRegister.value) {
        if (form.password !== form.confirmPassword) {
          error.value = 'Passwords do not match';
          return;
        }
        
        if (form.password.length < 6) {
          error.value = 'Password must be at least 6 characters';
          return;
        }
      }
      
      loading.value = true;
      
      try {
        let response;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        if (isRegister.value) {
          // Register
          response = await axios.post(`${apiUrl}/api/users/register`, {
            username: form.username,
            email: form.email,
            password: form.password,
            displayName: form.displayName || form.username
          });
        } else {
          // Login
          response = await axios.post(`${apiUrl}/api/users/login`, {
            username: form.username,
            password: form.password
          });
        }
        
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Save user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Emit success event
        emit('login-success', response.data.user);
        
        // Reset form
        form.username = '';
        form.email = '';
        form.password = '';
        form.confirmPassword = '';
        form.displayName = '';
        
      } catch (err) {
        console.error('Auth error:', err);
        error.value = err.response?.data?.error || 'Authentication failed';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      isRegister,
      form,
      loading,
      error,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.login-form-wrapper {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
</style> 