<template>
  <nav class="dynamic-menu">
    <ul class="menu-list" v-if="menuTree.length > 0">
      <li v-for="menu in menuTree" :key="menu.id_menu" class="menu-item">
        <!-- Parent Menu with Children -->
        <template v-if="menu.children && menu.children.length > 0">
          <div class="menu-item-with-children">
            <button
              @click="toggleSubmenu(menu.id_menu)"
              class="menu-button parent-menu"
              :class="{ 'is-active': isSubmenuOpen(menu.id_menu) }"
            >
              <span class="menu-icon">{{ menu.icon || '📁' }}</span>
              <span class="menu-label">{{ menu.nama_menu }}</span>
              <span class="submenu-arrow" :class="{ 'is-open': isSubmenuOpen(menu.id_menu) }">
                ▼
              </span>
            </button>

            <transition name="submenu">
              <ul
                v-show="isSubmenuOpen(menu.id_menu)"
                class="submenu"
              >
                <li
                  v-for="child in menu.children"
                  :key="child.id_menu"
                  class="submenu-item"
                >
                  <router-link
                    :to="child.route || '#'"
                    class="submenu-link"
                    :class="{ 'is-active': isActiveRoute(child.route) }"
                    @click="handleMenuClick(child)"
                  >
                    <span class="menu-icon">{{ child.icon || '•' }}</span>
                    <span class="menu-label">{{ child.nama_menu }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </div>
        </template>

        <!-- Single Menu without Children -->
        <template v-else>
          <router-link
            :to="menu.route || '#'"
            class="menu-link"
            :class="{ 'is-active': isActiveRoute(menu.route) }"
            @click="handleMenuClick(menu)"
          >
            <span class="menu-icon">{{ menu.icon || '📄' }}</span>
            <span class="menu-label">{{ menu.nama_menu }}</span>
          </router-link>
        </template>
      </li>
    </ul>

    <!-- Loading state -->
    <div v-else-if="loading" class="menu-loading">
      <div class="loading-spinner"></div>
      <p>Memuat menu...</p>
    </div>

    <!-- Empty state -->
    <div v-else class="menu-empty">
      <span class="empty-icon">📋</span>
      <p>Tidak ada menu yang tersedia</p>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '../stores/menu'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

// Reactive data
const openSubmenus = ref([])

// Computed properties
const menuTree = computed(() => menuStore.menuTree)
const loading = computed(() => menuStore.loading)

// Methods
const toggleSubmenu = (menuId) => {
  const index = openSubmenus.value.indexOf(menuId)
  if (index > -1) {
    openSubmenus.value.splice(index, 1)
  } else {
    openSubmenus.value.push(menuId)
  }
}

const isSubmenuOpen = (menuId) => {
  return openSubmenus.value.includes(menuId)
}

const isActiveRoute = (menuRoute) => {
  if (!menuRoute) return false
  return route.path.startsWith(menuRoute)
}

const handleMenuClick = (menu) => {
  // Optional: Track menu usage or emit event
  console.log('Menu clicked:', menu.nama_menu)

  // Close mobile menu if needed
  // emit('menu-clicked', menu)
}

// Initialize - fetch user menus
onMounted(async () => {
  await menuStore.fetchUserMenus()

  // Auto-open submenu if current route matches any child
  menuTree.value.forEach(menu => {
    if (menu.children && menu.children.length > 0) {
      const hasActiveChild = menu.children.some(child =>
        child.route && route.path.startsWith(child.route)
      )
      if (hasActiveChild) {
        openSubmenus.value.push(menu.id_menu)
      }
    }
  })
})
</script>

<style scoped>
.dynamic-menu {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  border-bottom: 1px solid #e5e7eb;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-link,
.menu-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #374151;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.menu-link:hover,
.menu-button:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.menu-link.is-active,
.menu-button.is-active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
  border-left: 3px solid #3b82f6;
}

.menu-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parent-menu {
  font-weight: 500;
}

.submenu-arrow {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  color: #9ca3af;
}

.submenu-arrow.is-open {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #f9fafb;
}

.submenu-item {
  border-bottom: 1px solid #f3f4f6;
}

.submenu-item:last-child {
  border-bottom: none;
}

.submenu-link {
  padding: 0.6rem 1rem 0.6rem 3.5rem;
  font-size: 0.85rem;
  color: #6b7280;
  background: #f9fafb;
}

.submenu-link:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.submenu-link.is-active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
  border-left: 3px solid #3b82f6;
}

/* Transitions */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Loading state */
.menu-loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.menu-empty {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-link,
  .menu-button {
    padding: 1rem;
    font-size: 0.95rem;
  }

  .submenu-link {
    padding: 0.8rem 1rem 0.8rem 3rem;
  }
}
</style>