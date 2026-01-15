<template>
  <div class="main-layout">
    <!-- Sidebar -->
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle-collapse="toggleSidebar" />

    <!-- Main Content Wrapper -->
    <div class="content-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button class="hamburger-btn" @click="toggleSidebar">
            ☰
          </button>
          <div class="breadcrumb-container">
            <div class="breadcrumb">
              <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
                <span class="crumb-text" :class="{ 'active': index === breadcrumbs.length - 1 }">
                  {{ crumb }}
                </span>
                <i v-if="index < breadcrumbs.length - 1" class="fas fa-chevron-right separator"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <!-- User Info -->
          <div class="user-info">
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span class="user-dept">{{ userDepartment }}</span>
            </div>
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>

          <!-- Logout Button -->
          <div class="user-actions">
            <button @click="handleLogout" class="btn-logout" title="Keluar">
              <i class="fas fa-sign-out-alt"></i>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <!-- Mobile Backdrop -->
      <div 
        class="sidebar-backdrop" 
        :class="{ 'show': !isSidebarCollapsed }"
        @click="toggleSidebar"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/layout/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const isSidebarCollapsed = ref(false)

// Computed
const userRole = computed(() => authStore.userRole)
const currentPageTitle = computed(() => {
  // Generate breadcrumb from route path
  const path = route.path
  
  // Map of route patterns to breadcrumb titles
  const breadcrumbMap = {
    '/dashboard': 'Dashboard',
    '/dashboard/overview': 'Dashboard',
    '/sdi/jadwal': 'SDI > Pengajuan Jadwal',
    '/sdi/input-jadwal-admin': 'SDI > Input Jadwal Admin',
    '/sdi/aproval-jadwal-kerja': 'SDI > Approval Jadwal Kerja',
    '/sdi/karyawan': 'SDI > Data Karyawan',
    '/admin/menu': 'Admin > Manajemen Menu',
    '/admin/role': 'Admin > Manajemen Role',
    '/admin/user': 'Admin > Manajemen User',
    '/admin/role-menu': 'Admin > Manajemen Role-Menu'
  }
  
  // Check if exact match exists
  if (breadcrumbMap[path]) {
    return breadcrumbMap[path]
  }
  
  // Fallback: generate from path segments
  const segments = path.split('/').filter(s => s)
  if (segments.length === 0) return 'Dashboard'
  
  // Capitalize and join with >
  const formatted = segments.map(seg => {
    return seg.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }).join(' > ')
  
  return formatted || route.meta.title || 'Dashboard'
})

const breadcrumbs = computed(() => {
  return currentPageTitle.value.split(' > ').map(s => s.trim())
})

const userName = computed(() => {
  return authStore.userName
})
const userDepartment = computed(() => {
  return authStore.userDepartment
})

// Methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const checkScreenSize = () => {
  if (window.innerWidth < 768) {
    isSidebarCollapsed.value = true
  }
}

// Watcher for Mobile Sidebar to prevent body scroll
watch(isSidebarCollapsed, (val) => {
  if (window.innerWidth < 768) {
    if (!val) {
      // Sidebar is OPEN (not collapsed) on mobile
      document.body.style.overflow = 'hidden'
    } else {
      // Sidebar is CLOSED (collapsed) on mobile
      document.body.style.overflow = ''
    }
  }
})

// Initialize
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  // Ensure scroll is restored when component unmounts
  document.body.style.overflow = ''
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
}

.content-wrapper {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
  width: 100%;
}

.content-wrapper.sidebar-collapsed {
  margin-left: 80px;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0 !important;
    width: 100%;
  }
  
  .content-wrapper.sidebar-collapsed {
    margin-left: 0;
    padding-left: 0; /* Remove 80px padding */
  }
}

/* Top Header */
.top-header {
  background: white;
  height: 70px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

@media (max-width: 768px) {
  .top-header {
    padding: 0 1rem;
  }
}

.breadcrumb-container {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0 1rem;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  height: 44px;
  margin: auto 0; /* Vertical centering */
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-item::before {
  display: none !important;
}

.crumb-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.crumb-text.active {
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.separator {
  font-size: 0.625rem;
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .top-header {
    padding: 0.75rem 1rem;
    height: 60px;
    flex-wrap: nowrap;
  }
  
  .header-left {
    gap: 0.75rem;
    flex: 1;
  }
  
  .header-right {
    gap: 0.75rem;
  }
  
  .breadcrumb {
    padding: 0 0.75rem;
    height: 36px;
  }
  
  .crumb-text {
    font-size: 0.7rem;
  }
  
  .separator {
    font-size: 0.5rem;
  }
  
  /* Hide user-info on mobile */
  .user-info {
    display: none !important;
  }
  
  /* Ensure logout button is visible */
  .btn-logout {
    display: flex !important;
    padding: 0;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
  
  .btn-logout span {
    display: none;
  }
  
  .hamburger-btn {
    display: flex;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* User Info Section */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  height: 44px; /* Fixed height */
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.user-dept {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.2;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.user-avatar i {
  font-size: 1.25rem;
  color: white;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 50px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px; /* Same height as user-info */
}

.btn-logout:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

.btn-logout i {
  font-size: 1rem;
}

.hamburger-btn {
  display: none;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
  justify-content: center;
}

.hamburger-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }
  
  .sidebar-backdrop.show {
    display: block;
    opacity: 1;
  }
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
