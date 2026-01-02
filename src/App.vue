<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

// Default layout is div (empty), unless requiresAuth is true then use MainLayout
const layout = computed(() => {
  // Override layout if specified in route meta
  if (route.meta.layout === 'empty') {
    return 'div'
  }

  // If route requires auth, use MainLayout
  // Check both meta and auth state to be safe
  if (route.meta.requiresAuth || (route.name !== 'Login' && authStore.isAuthenticated)) {
    return MainLayout
  }
  return 'div'
})

onMounted(() => {
  // Initialize auth state when app starts
  authStore.initAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8fafc;
}

* {
  box-sizing: border-box;
}
</style>