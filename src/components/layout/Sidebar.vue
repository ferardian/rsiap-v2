<template>
  <aside class="sidebar" :class="{ 'collapsed': effectiveIsCollapsed }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="img-fluid logo-img">
      </div>
      <div class="brand-text" v-if="!effectiveIsCollapsed">
        <h1 class="brand-title">RSIA</h1>
        <p>Aisyiyah Pekajangan</p>
      </div>
      <!-- Collapse Toggle Top -->
      <button class="collapse-btn-top" @click="toggleCollapse">
        <i class="fas" :class="effectiveIsCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>

    <!-- User Profile Summary (Optional in Sidebar) -->
    <div class="sidebar-profile" v-if="!effectiveIsCollapsed">
      <div class="profile-info">
        <span class="profile-name">{{ userName }}</span>
        <span class="profile-role">{{ userRole }}</span>
      </div>
    </div>

    <!-- Quick Access Shiny Buttons -->
    <div class="sidebar-quick-links" v-if="!effectiveIsCollapsed">
      <a 
        href="http://192.168.100.31/erm" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="quick-btn quick-btn-erm"
        title="Buka ERM (192.168.100.31/erm)"
      >
        <span class="btn-shine"></span>
        <i class="fas fa-notes-medical me-1"></i>
        <span>ERM</span>
      </a>
      <a 
        href="http://192.168.100.33/dms" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="quick-btn quick-btn-dms"
        title="Buka DMS (192.168.100.33/dms)"
      >
        <span class="btn-shine"></span>
        <i class="fas fa-folder-open me-1"></i>
        <span>DMS</span>
      </a>
      <a 
        href="http://192.168.100.31:8123" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="quick-btn quick-btn-iot"
        title="Buka Port 8123 (192.168.100.31:8123)"
      >
        <span class="btn-shine"></span>
        <i class="fas fa-bolt me-1"></i>
        <span>8123</span>
      </a>
    </div>

    <!-- Search Menu -->
    <div class="sidebar-search" v-if="!effectiveIsCollapsed" @click.stop>
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari menu..." 
          class="search-input"
        >
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="menu in filteredMenuTree" :key="menu.id_menu" class="nav-item">
          <!-- Parent Menu -->
          <div 
            class="nav-link" 
            :class="{ 'active': isRouteActive(menu.route), 'has-children': menu.children && menu.children.length > 0 }"
            @click="handleMenuClick(menu)"
          >
            <span :class="getIconClass(menu.icon)">{{ getIconContent(menu.icon) }}</span>
            <span class="nav-text" v-if="!effectiveIsCollapsed">{{ menu.nama_menu }}</span>
            <i 
              v-if="menu.children && menu.children.length > 0 && !effectiveIsCollapsed" 
              class="fas fa-chevron-right arrow-icon"
              :class="{ 'rotated': expandedMenus.includes(menu.id_menu) || searchQuery }"
            ></i>
          </div>

          <!-- Children Submenu -->
          <transition name="submenu">
            <ul v-show="menu.children && menu.children.length > 0 && (expandedMenus.includes(menu.id_menu) || searchQuery) && !effectiveIsCollapsed" class="nav-sublist">
              <li v-for="child in menu.children" :key="child.id_menu" class="nav-item">
                <router-link :to="child.route" class="nav-link sub-link" active-class="active" @click="handleSubmenuClick">
                  <span :class="`${getIconClass(child.icon)} sub-icon`">{{ getIconContent(child.icon) }}</span>
                  <span class="nav-text">{{ child.nama_menu }}</span>
                </router-link>
              </li>
            </ul>
          </transition>
        </li>
        <li v-if="filteredMenuTree.length === 0 && searchQuery" class="no-results text-center py-4 small opacity-75">
          <i class="fas fa-search-minus d-block mb-2 fs-4"></i>
          Menu tidak ditemukan
        </li>
      </ul>
    </nav>
    
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '../../stores/menu'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-collapse'])

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const authStore = useAuthStore()

// State
const isHovered = ref(false)
const expandedMenus = ref([])
const searchQuery = ref('')

// Computed
const effectiveIsCollapsed = computed(() => {
  return props.isCollapsed && !isHovered.value
})

const menuTree = computed(() => menuStore.menuTree || [])

const filteredMenuTree = computed(() => {
  if (!searchQuery.value) return menuTree.value

  const query = searchQuery.value.toLowerCase()
  
  return menuTree.value.map(menu => {
    // 1. Check if parent matches
    const parentMatches = menu.nama_menu.toLowerCase().includes(query)
    
    // 2. Check if children match
    let filteredChildren = []
    if (menu.children && menu.children.length > 0) {
      filteredChildren = menu.children.filter(child => 
        child.nama_menu.toLowerCase().includes(query)
      )
    }

    // 3. Return menu if parent matches (with all children) or if some children match
    if (parentMatches || filteredChildren.length > 0) {
      return {
        ...menu,
        children: parentMatches ? menu.children : filteredChildren
      }
    }
    
    return null
  }).filter(Boolean)
})

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)

// Methods
const handleMouseEnter = () => {
  if (props.isCollapsed) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  if (props.isCollapsed) {
    isHovered.value = false
  }
}

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const isRouteActive = (menuRoute) => {
  if (!menuRoute) return false
  return route.path.startsWith(menuRoute)
}

const isEmoji = (str) => {
  if (!str) return false
  // Basic check for non-ASCII characters which usually likely means emoji in this context
  // or checks against common emoji ranges
  return /[^\u0000-\u007F]/.test(str)
}

const getIconClass = (icon) => {
  if (!icon) return 'fas fa-circle nav-icon'
  if (isEmoji(icon)) return 'nav-icon emoji-icon'
  
  // Standard FontAwesome logic
  let faClass = icon
  if (!icon.includes('fa-')) faClass = `fas fa-${icon}`
  else if (icon.startsWith('fa ')) faClass = icon.replace('fa ', 'fas ')
  
  return `${faClass} nav-icon`
}

const getIconContent = (icon) => {
  if (!icon) return ''
  if (isEmoji(icon)) return icon
  return ''
}

const handleMenuClick = (menu) => {
  if (menu.children && menu.children.length > 0) {
    // Accordion behavior: close other menus when opening a new one
    const index = expandedMenus.value.indexOf(menu.id_menu)
    if (index === -1) {
      // Close all other menus and open this one
      expandedMenus.value = [menu.id_menu]
    } else {
      // Close this menu
      expandedMenus.value.splice(index, 1)
    }
  } else if (menu.route) {
    router.push(menu.route)
    
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      emit('toggle-collapse')
    }
  }
}

const handleSubmenuClick = () => {
  // Auto-close sidebar on mobile when submenu is clicked
  if (window.innerWidth < 768) {
    emit('toggle-collapse')
  }
}

const expandActiveMenu = () => {
  if (!menuTree.value || menuTree.value.length === 0) return
  
  const currentPath = route.path
  
  for (const menu of menuTree.value) {
    if (menu.children && menu.children.length > 0) {
      // Check if any child route matches current path
      const hasActiveChild = menu.children.some(child => 
        child.route && currentPath.startsWith(child.route)
      )
      
      if (hasActiveChild) {
        if (!expandedMenus.value.includes(menu.id_menu)) {
          expandedMenus.value.push(menu.id_menu)
        }
      }
    }
  }
}

// Watch for route changes to update expansion
watch(() => route.path, () => {
  expandActiveMenu()
})

// Initialize
onMounted(async () => {
  if (menuStore.userMenus.length === 0) {
    await menuStore.fetchUserMenus()
  }
  // Expand active menu after loading
  expandActiveMenu()
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #ffffff;
  color: #334155;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  border-right: 1px solid #e2e8f0;
}

.sidebar.collapsed {
  width: 80px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5); /* Stronger shadow for overlay */
  }

.sidebar.collapsed {
    transform: translateX(-100%); /* Hide completely off-screen */
    width: 280px; /* Keep full width when sliding out/in (hidden state doesn't matter much but cleaner) */
  }

  .collapse-btn-top {
    display: none !important;
  }
}

/* Brand */
.sidebar-brand {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 100%);
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2; /* Ensure brand is above scrolling content */
}

/* Collapse Button Top */
.collapse-btn-top {
  position: absolute;
  right: -16px;
  bottom: -16px; /* Positioned exactly at the bottom-right corner of the brand area, aligning with the gap */
  width: 32px;
  height: 32px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  padding: 0;
}

.collapse-btn-top:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: scale(1.05);
}

.sidebar.collapsed .collapse-btn-top {
  right: -16px; /* Keep same right position relative to collapsed width */
}

.brand-logo {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sidebar-brand:hover .brand-logo {
  transform: rotate(10deg) scale(1.05);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.brand-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.brand-text p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Profile */
.sidebar-profile {
  padding: 0 1rem 1.5rem;
}

.profile-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: background 0.2s ease;
}

.profile-info:hover {
  background: #f0f7ff;
  border-color: #bfdbfe;
}

.profile-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #0f172a;
  letter-spacing: 0.01em;
}

.profile-role {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Quick Links Shiny Buttons */
.sidebar-quick-links {
  padding: 0 1rem 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.quick-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.35rem;
  border-radius: 10px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #ffffff !important;
  text-decoration: none !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-btn-erm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.quick-btn-dms {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.quick-btn-iot {
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
}

.quick-btn:hover {
  transform: translateY(-2px) scale(1.04);
  color: #ffffff !important;
}

.quick-btn-erm:hover {
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.55);
}

.quick-btn-dms:hover {
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.55);
}

.quick-btn-iot:hover {
  box-shadow: 0 6px 18px rgba(217, 70, 239, 0.55);
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    60deg,
    transparent 30%,
    rgba(255, 255, 255, 0.65) 50%,
    transparent 70%
  );
  transform: rotate(25deg);
  animation: shineAnimation 3s infinite;
  pointer-events: none;
}

@keyframes shineAnimation {
  0% {
    left: -120%;
    top: -120%;
  }
  30% {
    left: 120%;
    top: 120%;
  }
  100% {
    left: 120%;
    top: 120%;
  }
}

/* Search */
.sidebar-search {
  padding: 0 1rem 1rem;
}

.search-box {
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-right: 0.75rem;
}

.search-input {
  background: transparent;
  border: none;
  color: #0f172a;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-search {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: #3b82f6;
}

.no-results {
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0 1rem 4rem 1rem; /* Added bottom padding to prevent last item from being cut off on mobile */
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  color: #475569;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 12px;
  font-weight: 500;
}

.nav-link:hover {
  background: #f0f7ff;
  color: #1e40af;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.06);
}

.nav-link.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  font-weight: 600;
}

/* Vertical line indicator for active item */
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 4px;
  background: #3b82f6;
  border-radius: 0 4px 4px 0;
  opacity: 1;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.nav-icon {
  width: 24px;
  min-width: 24px; /* Force width */
  height: 24px;    /* Force height */
  margin-right: 0.85rem;
  text-align: center;
  font-size: 1.1rem;
  transition: transform 0.2s ease;
  opacity: 0.8;
  display: inline-flex !important; /* Force display */
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
  opacity: 1;
  color: #3b82f6;
}

.nav-link.active .nav-icon {
  color: #3b82f6;
  filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.3));
  opacity: 1;
}

.nav-text {
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

/* Submenu */
.nav-sublist {
  list-style: none;
  padding: 0.25rem 0 0.5rem 0;
  margin: 0;
  position: relative;
}

/* Line connecting submenu items */
.nav-sublist::before {
  content: '';
  position: absolute;
  left: 2rem;
  top: 0;
  bottom: 1rem;
  width: 1px;
  background: #e2e8f0;
}

.sub-link {
  padding: 0.65rem 1rem 0.65rem 3.5rem;
  font-size: 0.85rem;
  color: #64748b;
  position: relative;
  transition: all 0.2s ease;
}

.sub-link:hover {
  color: #1e40af;
  background: #f0f7ff;
  transform: translateX(4px);
}

.sub-link.active {
  color: #1d4ed8;
  font-weight: 500;
  background: transparent;
  box-shadow: none;
}

.sub-link.active::after {
  content: '';
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.sub-icon {
  font-size: 0.875rem;
  width: 20px;
  margin-right: 0.75rem;
  opacity: 0.7;
  text-align: center;
  color: #94a3b8;
}

.arrow-icon {
  margin-left: auto;
  font-size: 0.7rem;
  opacity: 0.5;
  transition: transform 0.2s ease;
}

.arrow-icon.rotated {
    transform: rotate(90deg);
}

/* Submenu Transition */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Footer is removed but keeping comments consistent */

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px; /* Thin modern scrollbar */
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
