import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }

  function setUser(userData) {
    user.value = userData;
  }

  function login(tokenValue, userData) {
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
    // Clear any other stored data
    localStorage.clear();
  }

  function updateUser(userData) {
    user.value = { ...user.value, ...userData };
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    // Actions
    setToken,
    setUser,
    login,
    logout,
    updateUser
  };
});
