<template>
  <div class="select-role-container">
    <div class="role-selection-card">
      <div class="header">
        <h1>Pilih Role</h1>
        <p>Anda memiliki akses ke beberapa role. Silakan pilih role yang ingin digunakan.</p>
      </div>

      <div class="role-list">
        <div 
          v-for="role in authStore.userRoles" 
          :key="role.id_role" 
          class="role-item"
          @click="selectRole(role)"
        >
          <div class="role-icon">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="role-info">
            <h3>{{ role.nama_role }}</h3>
            <p>{{ role.deskripsi || 'Akses sebagai ' + role.nama_role }}</p>
          </div>
          <div class="role-action">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <div class="footer">
        <button class="btn-cancel" @click="handleLogout">
          <i class="fas fa-sign-out-alt me-2"></i>Batalkan & Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { showToast } from '../utils/notification'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // If no user roles or not logged in, redirect to login
  if (!authStore.isAuthenticated || authStore.userRoles.length === 0) {
    router.push('/login')
  } 
  // If only one role, select it automatically (fallback)
  else if (authStore.userRoles.length === 1) {
    selectRole(authStore.userRoles[0])
  }
})

const selectRole = async (role) => {
  try {
    await authStore.selectRole(role)
    router.push('/dashboard')
    showToast(`Masuk sebagai ${role.nama_role}`, 'success')
  } catch (error) {
    console.error('Error selecting role:', error)
    showToast('Gagal memilih role', 'error')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.select-role-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1rem;
}

.role-selection-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
}

.header {
  padding: 2.5rem 2.5rem 1.5rem;
  text-align: center;
}

.header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.header p {
  color: #64748b;
  font-size: 1rem;
}

.role-list {
  padding: 0 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  background: #fff;
}

.role-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: 1.25rem;
}

.role-info {
  flex: 1;
}

.role-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.role-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.role-action {
  color: #c1cace;
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.role-item:hover .role-action {
  color: #3b82f6;
  transform: translateX(4px);
}

.footer {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  color: #ef4444;
  background: #fef2f2;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
