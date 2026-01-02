<template>
  <div class="dashboard-page">

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>Selamat datang, {{ getDisplayName }}! 👋</h2>
            <p>{{ getWelcomeMessage }}</p>
            <div class="user-badges">
              <div class="user-badge">
                <span class="badge-text">{{ getUserPosition }}</span>
              </div>
              <div class="department-badge">
                <span class="dept-text">{{ getUserDepartment }}</span>
              </div>
            </div>
          </div>
          <div class="date-time-info">
            <div class="date-time">{{ currentDateTime }}</div>
            <div class="session-info">Sesi aktif</div>
          </div>
        </div>
      </section>

      <!-- Statistics Cards -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon patients">👥</div>
            <div class="stat-content">
              <h3>{{ stats.totalPatients }}</h3>
              <p>Total Pasien</p>
              <span class="stat-trend positive">+12% dari bulan lalu</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon today-visits">🏥</div>
            <div class="stat-content">
              <h3>{{ stats.todayVisits }}</h3>
              <p>Kunjungan Hari Ini</p>
              <span class="stat-trend positive">+8% dari kemarin</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon emergency">🚑</div>
            <div class="stat-content">
              <h3>{{ stats.emergencyCases }}</h3>
              <p>Kasus IGD</p>
              <span class="stat-trend negative">-3% dari rata-rata</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon surgeries">⚕️</div>
            <div class="stat-content">
              <h3>{{ stats.surgeries }}</h3>
              <p>Jadwal Operasi</p>
              <span class="stat-trend neutral">Sama dengan kemarin</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Menu & Recent Activities -->
      <section class="dashboard-sections">
        <!-- Dynamic Menu (Quick Actions) -->
        <div class="quick-actions-section">
          <h3>Akses Cepat</h3>

          <!-- Static fallback actions -->
          <div class="actions-grid">
            <!-- Menu Management Actions -->
            <button @click="showMenuManagementModal = true" class="action-btn">
              <span class="action-icon">📋</span>
              <span class="action-label">Kelola Menu</span>
            </button>

            <button @click="showRoleManagementModal = true" class="action-btn">
              <span class="action-icon">👥</span>
              <span class="action-label">Kelola Role</span>
            </button>

            <button @click="showUserManagementModal = true" class="action-btn">
              <span class="action-icon">👤</span>
              <span class="action-label">Kelola User</span>
            </button>

            <!-- Hospital Module Actions -->
            <button @click="navigateToModule('pasien')" class="action-btn">
              <span class="action-icon">🏥</span>
              <span class="action-label">Data Pasien</span>
            </button>

            <button @click="navigateToModule('pemeriksaan')" class="action-btn">
              <span class="action-icon">🔬</span>
              <span class="action-label">Pemeriksaan</span>
            </button>

            <button @click="navigateToModule('farmasi')" class="action-btn">
              <span class="action-icon">💊</span>
              <span class="action-label">Farmasi</span>
            </button>

            <button @click="navigateToModule('laboratorium')" class="action-btn">
              <span class="action-icon">🧪</span>
              <span class="action-label">Laboratorium</span>
            </button>

            <button @click="navigateToModule('radiologi')" class="action-btn">
              <span class="action-icon">📷</span>
              <span class="action-label">Radiologi</span>
            </button>

            <button @click="navigateToModule('keuangan')" class="action-btn">
              <span class="action-icon">💰</span>
              <span class="action-label">Keuangan</span>
            </button>

            <button @click="navigateToModule('bpjs')" class="action-btn">
              <span class="action-icon">🏛️</span>
              <span class="action-label">BPJS</span>
            </button>

            <!-- Admin Menu Management -->
            <button
              v-if="showAdminMenu"
              @click="showMenuManagementModal = true"
              class="action-btn admin-menu-btn"
            >
              <span class="action-icon">⚙️</span>
              <span class="action-label">Kelola Menu</span>
            </button>

            <!-- Admin Role Management -->
            <button
              v-if="showAdminMenu"
              @click="showRoleManagementModal = true"
              class="action-btn admin-menu-btn"
            >
              <span class="action-icon">👥</span>
              <span class="action-label">Kelola Role</span>
            </button>

            <!-- Admin Role-Menu Management -->
            <button
              v-if="showAdminMenu"
              @click="navigateToRoleMenu()"
              class="action-btn admin-menu-btn"
            >
              <span class="action-icon">🔐</span>
              <span class="action-label">Kelola Role-Menu</span>
            </button>

            <button @click="navigateToModule('laporan')" class="action-btn">
              <span class="action-icon">📊</span>
              <span class="action-label">Laporan</span>
            </button>
          </div>

        </div>

        <!-- Recent Activities -->
        <div class="recent-activities-section">
          <h3>Aktivitas Terkini</h3>
          <div class="activities-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                {{ getActivityIcon(activity.type) }}
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.description }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- System Status -->
      <section class="system-status">
        <h3>Status Sistem</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Database</span>
            <span class="status-indicator online">Online</span>
          </div>
          <div class="status-item">
            <span class="status-label">API Server</span>
            <span class="status-indicator online">Online</span>
          </div>
          <div class="status-item">
            <span class="status-label">BPJS Integration</span>
            <span class="status-indicator online">Online</span>
          </div>
          <div class="status-item">
            <span class="status-label">Backup System</span>
            <span class="status-indicator warning">Warning</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Menu Management Modal -->
    <MenuManagementModal
      v-if="showMenuManagementModal"
      @close="showMenuManagementModal = false"
    />

    <!-- Role Management Modal -->
    <RoleManagementModal
      v-if="showRoleManagementModal"
      @close="showRoleManagementModal = false"
    />

    <!-- User Management Modal -->
    <UserManagementModal
      v-if="showUserManagementModal"
      @close="showUserManagementModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MenuManagementModal from '../components/MenuManagementModal.vue'
import RoleManagementModal from '../components/RoleManagementModal.vue'
import UserManagementModal from '../components/UserManagementModal.vue'


const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const currentDateTime = ref('')
const timeInterval = ref(null)
const showMenuManagementModal = ref(false)
const showRoleManagementModal = ref(false)
const showUserManagementModal = ref(false)

// Statistics data
const stats = ref({
  totalPatients: 2847,
  todayVisits: 156,
  emergencyCases: 23,
  surgeries: 8
})

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    type: 'patient',
    description: 'Pasien baru terdaftar: John Doe (RM: 2024001)',
    time: '5 menit yang lalu'
  },
  {
    id: 2,
    type: 'emergency',
    description: 'Kasus IGD baru: Trauma kepala',
    time: '12 menit yang lalu'
  },
  {
    id: 3,
    type: 'surgery',
    description: 'Operasi selesai: Apendisitis',
    time: '1 jam yang lalu'
  },
  {
    id: 4,
    type: 'lab',
    description: 'Hasil lab siap: Darah lengkap',
    time: '2 jam yang lalu'
  },
  {
    id: 5,
    type: 'pharmacy',
    description: 'Resep disiapkan: Antibiotik',
    time: '3 jam yang lalu'
  }
])

// Computed properties
const getUserInitials = computed(() => {
  // Prioritaskan nama dari detail pegawai, fallback ke username
  const name = authStore.user?.data?.detail?.nama || authStore.userName || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const getUserRole = computed(() => {
  if (!authStore.user?.data?.detail) {
    // Fallback ke username jika tidak ada detail
    const username = authStore.userName?.toLowerCase() || ''
    if (username.includes('admin')) return 'Administrator'
    return 'Staff'
  }

  const detail = authStore.user.data.detail

  // Prioritaskan jabatan dari response API
  if (detail.jbtn) {
    return detail.jbtn
  }

  // Fallback ke department
  if (detail.departemen) {
    return detail.departemen
  }

  // Fallback ke parsing nama
  const nama = detail.nama?.toLowerCase() || ''
  if (nama.includes('admin')) return 'Administrator'
  if (nama.includes('dokter')) return 'Dokter'
  if (nama.includes('perawat')) return 'Perawat'
  if (nama.includes('farmasi')) return 'Farmasi'

  return 'Staff'
})

const getDisplayName = computed(() => {
  // Prioritaskan nama dari data.detail.nama sesuai response API
  return authStore.user?.data?.detail?.nama || authStore.userName || 'User'
})

const getUserDepartment = computed(() => {
  return authStore.user?.data?.detail?.departemen || 'Unknown'
})

const getUserPosition = computed(() => {
  return authStore.user?.data?.detail?.jbtn || getUserRole.value
})

const showAdminMenu = computed(() => {
  const position = getUserPosition.value.toLowerCase()
  const name = getDisplayName.value.toLowerCase()

  return position.includes('admin') ||
         position.includes('koordinator') ||
         name.includes('admin') ||
         position.includes('ti') // IT staff can manage menu
})

const getWelcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi! Semoga hari Anda menyenangkan.'
  if (hour < 17) return 'Selamat siang! Jaga kesehatan Anda.'
  return 'Selamat malam! Jangan lupa istirahat.'
})

// Methods
const updateDateTime = () => {
  const now = new Date()
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  currentDateTime.value = now.toLocaleDateString('id-ID', options)
}

const getActivityIcon = (type) => {
  const icons = {
    patient: '👤',
    emergency: '🚑',
    surgery: '⚕️',
    lab: '🧪',
    pharmacy: '💊'
  }
  return icons[type] || '📝'
}

const navigateToModule = (module) => {
  // Navigate to specific module (will implement later)
  console.log(`Navigating to ${module} module`)
  // Example: router.push(`/${module}`)
}

const navigateToRoleMenu = () => {
  router.push('/admin/role-menu')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Lifecycle hooks
onMounted(() => {
  updateDateTime()
  timeInterval.value = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>


<style scoped>
/* Dashboard layout */
.dashboard-page {
  width: 100%;
}

/* Welcome Section */
.welcome-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-text h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.welcome-text p {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-badge {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.department-badge {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-time-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-time {
  color: #3b82f6;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.session-info {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

/* Statistics Cards */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.patients { background: #e0f2fe; }
.stat-icon.today-visits { background: #dcfce7; }
.stat-icon.emergency { background: #fee2e2; }
.stat-icon.surgeries { background: #fef3c7; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-trend.positive { color: #10b981; }
.stat-trend.negative { color: #ef4444; }
.stat-trend.neutral { color: #6b7280; }

/* Dashboard Sections */
.dashboard-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.quick-actions-section,
.recent-activities-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quick-actions-section h3,
.recent-activities-section h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.action-btn {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
}

.action-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.admin-menu-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  border-color: #f59e0b !important;
  color: white !important;
}

.admin-menu-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
  border-color: #d97706 !important;
  color: white !important;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.patient { background: #e0f2fe; }
.activity-icon.emergency { background: #fee2e2; }
.activity-icon.surgery { background: #fef3c7; }
.activity-icon.lab { background: #e9d5ff; }
.activity-icon.pharmacy { background: #d1fae5; }

.activity-content {
  flex: 1;
}

.activity-text {
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.8rem;
}

/* System Status */
.system-status {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.system-status h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.status-label {
  font-weight: 500;
  color: #374151;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-indicator.online {
  background: #dcfce7;
  color: #16a34a;
}

.status-indicator.warning {
  background: #fef3c7;
  color: #d97706;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .user-menu {
    flex-direction: column;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .date-time-info {
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-main {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 1rem;
  }

  .header-left h1 {
    font-size: 1.5rem;
  }

  .welcome-section {
    padding: 1.5rem;
  }

  .welcome-section h2 {
    font-size: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>