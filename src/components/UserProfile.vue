<template>
  <div class="user-profile bg-black/80 backdrop-blur-md p-6 rounded-2xl w-[450px] max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">{{ $t('profile.title') || 'User Profile' }}</h2>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div v-if="userLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin text-primary text-4xl">
        <i class="bi bi-arrow-repeat"></i>
      </div>
    </div>

    <div v-else-if="userError" class="bg-red-900/50 p-4 rounded-lg mb-6">
      <p class="text-white">{{ userError }}</p>
      <button @click="fetchUserProfile" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {{ $t('profile.retry') || 'Retry' }}
      </button>
    </div>

    <div v-else class="space-y-6">
      <!-- Profile Avatar and Basic Info -->
      <div class="flex flex-col items-center">
        <div class="relative">
          <img 
            v-if="user?.profilePicture" 
            :src="user.profilePicture" 
            alt="Profile" 
            class="w-24 h-24 rounded-full object-cover border-2 border-primary"
          >
          <div v-else class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
            {{ user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?' }}
          </div>
        </div>
        <h3 class="text-xl font-bold mt-3">{{ user?.displayName || user?.username }}</h3>
        <p class="text-gray-400 text-sm">{{ user?.email }}</p>
      </div>

      <!-- Account Information -->
      <div class="bg-gray-800/50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-3">{{ $t('profile.accountInfo') || 'Account Information' }}</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-400">{{ $t('profile.username') || 'Username' }}</span>
            <span>{{ user?.username }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">{{ $t('profile.role') || 'Role' }}</span>
            <span>{{ user?.role }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">{{ $t('profile.status') || 'Status' }}</span>
            <span class="flex items-center">
              <span class="inline-block w-2 h-2 rounded-full mr-2" 
                    :class="user?.isOnline ? 'bg-green-500' : 'bg-gray-500'"></span>
              {{ user?.isOnline ? ($t('profile.online') || 'Online') : ($t('profile.offline') || 'Offline') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Channel Lists -->
      <div v-if="user?.channelLists?.length" class="bg-gray-800/50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-3">{{ $t('profile.channelLists') || 'My Channel Lists' }}</h4>
        <div class="space-y-2 max-h-[200px] overflow-y-auto">
          <div v-for="list in user.channelLists" :key="list._id" class="p-2 bg-gray-700/50 rounded">
            <div class="flex justify-between">
              <span>{{ list.name }}</span>
              <span class="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                {{ list.channels.length }} channels
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Watch Parties -->
      <div v-if="user?.watchParties?.length" class="bg-gray-800/50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-3">{{ $t('profile.watchParties') || 'My Watch Parties' }}</h4>
        <div class="space-y-2 max-h-[200px] overflow-y-auto">
          <div v-for="party in user.watchParties" :key="party.partyId" class="p-2 bg-gray-700/50 rounded">
            <div class="flex justify-between">
              <span>{{ party.name }}</span>
              <span class="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                {{ new Date(party.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-center">
        <button @click="logout" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          {{ $t('profile.logout') || 'Logout' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import { endpoints } from '../config/api';

export default {
  name: 'UserProfile',
  emits: ['close'],
  setup(props, { emit }) {
    const languageStore = useLanguageStore();
    const user = ref(null);
    const userLoading = ref(true);
    const userError = ref(null);

    const fetchUserProfile = async () => {
      userLoading.value = true;
      userError.value = null;
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          userError.value = languageStore.t('profile.notLoggedIn') || 'You are not logged in';
          userLoading.value = false;
          return;
        }

        const response = await fetch(endpoints.authMe || `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/me`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(languageStore.t('profile.fetchFailed') || 'Failed to fetch profile');
        }

        user.value = await response.json();
      } catch (error) {
        console.error('Error fetching profile:', error);
        userError.value = error.message || languageStore.t('profile.fetchError') || 'Error fetching profile';
      } finally {
        userLoading.value = false;
      }
    };

    const logout = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Call logout endpoint
          await fetch(endpoints.logout || `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/logout`, {
            method: 'POST',
            headers: {
              'x-auth-token': token,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      }

      // Remove token regardless of API response
      localStorage.removeItem('token');
      emit('close');
      // Reload the page to reset the application state
      window.location.reload();
    };

    onMounted(() => {
      fetchUserProfile();
    });

    const $t = (key) => {
      return languageStore.t(key);
    };

    return {
      user,
      userLoading,
      userError,
      fetchUserProfile,
      logout,
      $t
    };
  }
};
</script> 