<template>
  <div class="auth-component bg-black/80 backdrop-blur-md p-6 rounded-2xl w-[450px] max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">{{ isLogin ? ($t('auth.loginTitle') || 'Login') : ($t('auth.signupTitle') || 'Sign Up') }}</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin text-primary text-4xl">
        <i class="bi bi-arrow-repeat"></i>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-900/50 p-4 rounded-lg mb-6">
      <p class="text-white">{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.emailOrUsername') || 'Email or Username' }}</label>
          <input 
            v-model="loginForm.emailOrUsername" 
            type="text" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.password') || 'Password' }}</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {{ $t('auth.login') || 'Login' }}
        </button>
      </form>

      <!-- Signup Form -->
      <form v-else @submit.prevent="signup" class="space-y-4">
        <!-- Profile Picture Upload -->
        <div class="flex flex-col items-center mb-4">
          <div 
            class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center relative overflow-hidden cursor-pointer"
            @click="$refs.fileInput.click()"
          >
            <template v-if="previewImage">
              <img :src="previewImage" alt="Profile" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              <i class="bi bi-person text-4xl text-gray-400"></i>
            </template>
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <i class="bi bi-camera text-white text-xl"></i>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden form-control"
            @change="handleImageUpload"
          />
          <p class="text-xs text-gray-400 mt-2">{{ $t('auth.clickToUpload') || 'Click to upload a profile picture' }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.username') || 'Username' }}</label>
          <input 
            v-model="signupForm.username" 
            type="text" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
          <p class="text-xs text-gray-400 mt-1">{{ $t('auth.usernameRequirements') || 'Letters, numbers, and underscores only' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.displayName') || 'Display Name' }}</label>
          <input 
            v-model="signupForm.displayName" 
            type="text" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.email') || 'Email' }}</label>
          <input 
            v-model="signupForm.email" 
            type="email" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.password') || 'Password' }}</label>
          <input 
            v-model="signupForm.password" 
            type="password" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">{{ $t('auth.confirmPassword') || 'Confirm Password' }}</label>
          <input 
            v-model="signupForm.confirmPassword" 
            type="password" 
            class="form-control w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {{ $t('auth.signup') || 'Sign Up' }}
        </button>
      </form>

      <!-- Form Toggle -->
      <div class="text-center">
        <p v-if="isLogin">
          {{ $t('auth.noAccount') || "Don't have an account?" }}
          <button @click="isLogin = false" class="text-primary hover:underline ml-1">
            {{ $t('auth.signupPrompt') || 'Sign up now' }}
          </button>
        </p>
        <p v-else>
          {{ $t('auth.haveAccount') || "Already have an account?" }}
          <button @click="isLogin = true" class="text-primary hover:underline ml-1">
            {{ $t('auth.loginPrompt') || 'Login instead' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import { endpoints } from '../config/api';

export default {
  name: 'Auth',
  props: {
    initialMode: {
      type: String,
      default: 'login',
      validator: (value) => ['login', 'signup'].includes(value)
    }
  },
  emits: ['close', 'auth-success'],
  setup(props, { emit }) {
    const languageStore = useLanguageStore();
    const isLogin = ref(props.initialMode === 'login');
    const loading = ref(false);
    const error = ref(null);
    const fileInput = ref(null);
    const previewImage = ref(null);
    
    const loginForm = ref({
      emailOrUsername: '',
      password: ''
    });

    const signupForm = ref({
      username: '',
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profileImage: null
    });

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match('image.*')) {
        error.value = 'Please select an image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'Image size should be less than 5MB';
        return;
      }

      // Store file for form submission
      signupForm.value.profileImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const login = async () => {
      error.value = null;
      loading.value = true;

      try {
        const response = await fetch(endpoints.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emailOrUsername: loginForm.value.emailOrUsername,
            password: loginForm.value.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store token
        localStorage.setItem('token', data.token);
        
        // Notify parent component
        emit('auth-success', data.user);
        emit('close');
      } catch (err) {
        console.error('Login error:', err);
        error.value = err.message || 'Login failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const signup = async () => {
      error.value = null;
      
      // Validate password match
      if (signupForm.value.password !== signupForm.value.confirmPassword) {
        error.value = 'Passwords do not match';
        return;
      }

      loading.value = true;

      try {
        // Create form data if we have a profile image
        const formData = new FormData();
        formData.append('username', signupForm.value.username);
        formData.append('displayName', signupForm.value.displayName);
        formData.append('email', signupForm.value.email);
        formData.append('password', signupForm.value.password);
        
        if (signupForm.value.profileImage) {
          formData.append('profileImage', signupForm.value.profileImage);
        }

        const response = await fetch(endpoints.register, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Store token
        localStorage.setItem('token', data.token);
        
        // Notify parent component
        emit('auth-success', data.user);
        emit('close');
      } catch (err) {
        console.error('Signup error:', err);
        error.value = err.message || 'Registration failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const $t = (key) => {
      return languageStore.t(key);
    };

    return {
      isLogin,
      loading,
      error,
      loginForm,
      signupForm,
      fileInput,
      previewImage,
      handleImageUpload,
      login,
      signup,
      $t
    };
  }
};
</script> 