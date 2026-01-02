<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else class="permission-denied">
    <div class="permission-denied-content">
      <span class="denied-icon">🚫</span>
      <h3>Akses Ditolak</h3>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <button @click="goBack" class="btn-back">
        Kembali
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '../stores/menu'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  // Menu ID to check permission for
  menuId: {
    type: [String, Number],
    required: true
  },
  // Type of permission to check
  permission: {
    type: String,
    default: 'can_view',
    validator: (value) => ['can_view', 'can_create', 'can_update', 'can_delete'].includes(value)
  },
  // Whether to show custom message or redirect
  showMessage: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const menuStore = useMenuStore()
const authStore = useAuthStore()

const hasPermission = computed(() => {
  // Super admin check
  if (authStore.user?.data?.detail?.jbtn?.toLowerCase().includes('admin')) {
    return true
  }

  // Check specific permission
  return menuStore.hasMenuPermission(props.menuId, props.permission)
})

const goBack = () => {
  router.go(-1)
}

// Ensure user menus are loaded
onMounted(async () => {
  if (menuStore.userMenus.length === 0) {
    await menuStore.fetchUserMenus()
  }
})
</script>

<style scoped>
.permission-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: #f8fafc;
  border-radius: 12px;
}

.permission-denied-content {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  width: 100%;
}

.denied-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.permission-denied-content h3 {
  color: #ef4444;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.permission-denied-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn-back {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>