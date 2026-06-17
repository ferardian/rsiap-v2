<template>
  <router-view v-slot="{ Component, route }">
    <component :is="getLayout(route)">
      <component :is="Component" />
    </component>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import MainLayout from './layouts/MainLayout.vue'

const authStore = useAuthStore()

// Resolve layout using slot-scoped route to ensure synchronicity with the component lifecycle
const getLayout = (route) => {
  // Override layout if specified in route meta
  if (route.meta.layout === 'empty') {
    return 'div'
  }

  // If route requires auth, use MainLayout
  if (route.meta.requiresAuth || (route.name !== 'Login' && authStore.isAuthenticated)) {
    return MainLayout
  }
  return 'div'
}

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

/* Custom NProgress loading bar style to match the brand color */
#nprogress .bar {
  background: #dc2626 !important;
  height: 3px !important;
  z-index: 9999 !important;
}

#nprogress .peg {
  box-shadow: 0 0 10px #dc2626, 0 0 5px #dc2626 !important;
}
</style>