<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <span>🏥</span>
      </div>
      <div class="brand-text" v-if="!isCollapsed">
        <h1>RSIA</h1>
        <p>Sistem Informasi</p>
      </div>
    </div>

    <!-- User Profile Summary (Optional in Sidebar) -->
    <div class="sidebar-profile" v-if="!isCollapsed">
      <div class="profile-info">
        <span class="profile-name">{{ userName }}</span>
        <span class="profile-role">{{ userRole }}</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="menu in menuTree" :key="menu.id_menu" class="nav-item">
          <!-- Parent Menu -->
          <div 
            class="nav-link" 
            :class="{ 'active': isRouteActive(menu.route), 'has-children': menu.children && menu.children.length > 0 }"
            @click="handleMenuClick(menu)"
          >
            <span :class="getIconClass(menu.icon)">{{ getIconContent(menu.icon) }}</span>
            <span class="nav-text" v-if="!isCollapsed">{{ menu.nama_menu }}</span>
            <i 
              v-if="menu.children && menu.children.length > 0 && !isCollapsed" 
              class="fas fa-chevron-right arrow-icon"
              :class="{ 'rotated': expandedMenus.includes(menu.id_menu) }"
            ></i>
          </div>

          <!-- Children Submenu -->
          <ul v-if="menu.children && menu.children.length > 0 && expandedMenus.includes(menu.id_menu) && !isCollapsed" class="nav-sublist">
            <li v-for="child in menu.children" :key="child.id_menu" class="nav-item">
              <router-link :to="child.route" class="nav-link sub-link" active-class="active">
                <span :class="`${getIconClass(child.icon)} sub-icon`">{{ getIconContent(child.icon) }}</span>
                <span class="nav-text">{{ child.nama_menu }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- Footer / Collapse Toggle -->
    <div class="sidebar-footer">
      <button class="collapse-btn" @click="toggleCollapse">
        {{ isCollapsed ? '▶' : '◀' }}
      </button>
    </div>
    
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
const expandedMenus = ref([])

// Computed
const menuTree = computed(() => menuStore.menuTree || [])
const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)

// Methods
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
}

.sidebar.collapsed .sidebar-footer {
  justify-content: center;
}

/* Brand */
.sidebar-brand {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.brand-logo {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
}

.sidebar-brand:hover .brand-logo {
  transform: rotate(10deg) scale(1.05);
}

.brand-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: white;
  letter-spacing: -0.02em;
}

.brand-text p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: background 0.2s ease;
}

.profile-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.profile-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
  letter-spacing: 0.01em;
}

.profile-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0 1rem;
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
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 12px;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  background: white;
  border-radius: 0 4px 4px 0;
  opacity: 1; 
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.nav-icon {
  width: 24px;
  min-width: 24px; /* Force width */
  height: 24px;    /* Force height */
  margin-right: 0.85rem;
  text-align: center;
  font-size: 1.1rem;
  transition: transform 0.2s ease;
  opacity: 0.9;
  display: inline-flex !important; /* Force display */
  align-items: center;
  justify-content: center;
  color: white; 
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
  opacity: 1;
}

.nav-link.active .nav-icon {
  color: white;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
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
  background: rgba(255, 255, 255, 0.05);
}

.sub-link {
  padding: 0.65rem 1rem 0.65rem 3.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  transition: all 0.2s ease;
}

.sub-link:hover {
  color: white;
  background: transparent;
  transform: translateX(4px);
}

.sub-link.active {
  color: white;
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
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.sub-icon {
  font-size: 0.875rem;
  width: 20px;
  margin-right: 0.75rem;
  opacity: 0.8;
  text-align: center;
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

/* Footer */
.sidebar-footer {
  padding: 1rem;
  margin-top: auto;
  display: flex;
  justify-content: flex-end; /* Align to right */
  background: transparent;
  border: none;
}

.collapse-btn {
  background: #3b82f6; /* Brand Blue */
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.collapse-btn:hover {
  background: #2563eb; /* Darker Blue */
  transform: scale(1.1);
  border-color: white;
}

/* Scrollbar */
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
