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
        <!-- Filter Section -->
        <div class="filter-section mb-12 flex flex-nowrap justify-end items-center gap-3">

          <!-- Tab-Style Filter (Reference Design) -->
          <div class="filter-tabs-container">
            <div
              @click="selectPeriod('today')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'today' }"
            >
              <i class="fas fa-calendar-day"></i>
              <span>Hari Ini</span>
            </div>
            
            <div
              @click="selectPeriod('month')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'month' }"
            >
              <i class="fas fa-calendar-alt"></i>
              <span>Bulan Ini</span>
            </div>
            
            <div
              @click="selectPeriod('year')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'year' }"
            >
              <i class="fas fa-calendar"></i>
              <span>Tahun Ini</span>
            </div>
            
            <div
              @click="selectPeriod('custom')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'custom' }"
            >
              <i class="fas fa-sliders-h"></i>
              <span>Custom</span>
            </div>
          </div>
          
          <!-- Custom Date Inputs (Inline) -->
          <template v-if="selectedPeriod === 'custom'">
               <input type="date" v-model="customStartDate" class="custom-date-input">
               <span class="date-separator">→</span>
               <input type="date" v-model="customEndDate" class="custom-date-input">
               <div @click="applyCustomFilter" role="button" tabindex="0" class="custom-date-apply">
                <i class="fas fa-check"></i>
               </div>
          </template>

          <!-- Auto Reload Toggle -->
          <button 
            @click="toggleAutoReload" 
            class="btn-auto-reload"
            :class="{ 'active': autoReloadEnabled, 'reloading': isReloading }"
            :title="autoReloadEnabled ? 'Auto-reload aktif (30s)' : 'Auto-reload nonaktif'"
          >
            <i class="fas" :class="autoReloadEnabled ? 'fa-sync fa-spin' : 'fa-sync'"></i>
            <span class="reload-status">{{ autoReloadEnabled ? 'Auto' : 'Manual' }}</span>
            <span v-if="isReloading" class="reload-pulse"></span>
          </button>

        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon patients">👥</div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.total || 0 }}</h3>
              <p>Total Pasien</p>
              <span class="stat-trend neutral">Ranap + Ralan + IGD</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon today-visits">🏥</div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.ranap || 0 }}</h3>
              <p>Kunjungan Rawat Inap</p>
              <span class="stat-trend positive">Pasien Masuk</span>
            </div>
          </div>

           <div class="stat-card">
            <div class="stat-icon surgeries">🚶</div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.ralan || 0 }}</h3>
              <p>Kunjungan Rawat Jalan</p>
              <span class="stat-trend positive">Non IGD</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon emergency">🚑</div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.igd || 0 }}</h3>
              <p>Kunjungan IGD</p>
              <span class="stat-trend negative">Gawat Darurat</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Menu & Recent Activities -->
      <section class="dashboard-sections">
        <!-- Quick Stats Cards -->
        <div class="quick-stats-section">
          <h3>📊 Statistik Rumah Sakit</h3>
          
          <div v-if="loadingStats" class="stats-loading">
            <i class="fas fa-spinner fa-spin"></i> Memuat statistik...
          </div>

          <div v-else class="quick-stats-grid">
            <!-- 1. Pasien Hari Ini -->
            <div class="quick-stat-card pasien-card">
              <div class="stat-icon-wrapper pasien-gradient">
                <i class="fas fa-user-injured"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.pasien?.total || 0 }}</h4>
                <p>Pasien Hari Ini</p>
                <div class="stat-breakdown-grid">
                  <div v-for="(count, poli) in dashboardStats.pasien?.per_poli || {}" :key="poli" class="breakdown-grid-item">
                    <span class="poli-name">{{ poli }}</span>
                    <span class="poli-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Pegawai Aktif -->
            <div class="quick-stat-card pegawai-card">
              <div class="stat-icon-wrapper pegawai-gradient">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.pegawai?.total || 0 }}</h4>
                <p>Pegawai Aktif</p>
                <div class="stat-breakdown-grid">
                  <div v-for="(count, category) in dashboardStats.pegawai?.breakdown" :key="category" class="breakdown-grid-item">
                    <span class="poli-name">{{ category }}</span>
                    <span class="poli-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Cuti Bulan Ini -->
            <div class="quick-stat-card cuti-card">
              <div class="stat-icon-wrapper cuti-gradient">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.cuti?.bulan_ini || 0 }}</h4>
                <p>Cuti Bulan Ini</p>
                <div class="stat-breakdown">
                  <span class="breakdown-item pending">Pending: {{ dashboardStats.cuti?.pending || 0 }}</span>
                  <span class="breakdown-item approved">Approved: {{ dashboardStats.cuti?.approved || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 4. Total Tempat Tidur -->
            <div class="quick-stat-card bed-card">
              <div class="stat-icon-wrapper bed-gradient">
                <i class="fas fa-bed"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.bed?.total || 0 }}</h4>
                <p>Total Tempat Tidur</p>
                <div class="stat-breakdown">
                  <span class="breakdown-item available">Tersedia: {{ dashboardStats.bed?.tersedia || 0 }}</span>
                  <span class="breakdown-item occupied">Terisi: {{ dashboardStats.bed?.terisi || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 5. Approval Pending (Hidden) -->
            <!--
            <div class="quick-stat-card approval-card">
              <div class="stat-icon-wrapper approval-gradient">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.approval?.total_pending || 0 }}</h4>
                <p>Approval Pending</p>
                <div class="stat-breakdown">
                  <span class="breakdown-item">Cuti: {{ dashboardStats.approval?.cuti_pending || 0 }}</span>
                  <span class="breakdown-item">Jadwal: {{ dashboardStats.approval?.jadwal_pending || 0 }}</span>
                </div>
              </div>
            </div>
            -->

            <!-- 6. Stok Farmasi (Hidden) -->
            <!--
            <div class="quick-stat-card farmasi-card">
              <div class="stat-icon-wrapper farmasi-gradient">
                <i class="fas fa-pills"></i>
              </div>
              <div class="stat-details">
                <h4>{{ dashboardStats.farmasi?.stok_kritis || 0 }}</h4>
                <p>Stok Kritis</p>
                <div class="stat-breakdown">
                  <span class="breakdown-item">Total Item: {{ dashboardStats.farmasi?.total_item || 0 }}</span>
                  <span class="breakdown-item aman">Aman: {{ dashboardStats.farmasi?.stok_aman || 0 }}</span>
                </div>
              </div>
            </div>
            -->
          </div>

        </div>

        <!-- Jadwal Petugas Code Blue -->
        <div class="codeblue-schedule-section">
          <div class="section-header-with-action">
            <h3><i class="fas fa-user-md"></i> Jadwal Petugas Code Blue Hari Ini</h3>
            <button @click="navigateToCodeBlueManagement" class="btn-manage-codeblue">
              <i class="fas fa-edit"></i>
              <span>Kelola Jadwal</span>
            </button>
          </div>
          
          <div class="codeblue-shifts-grid">
            <!-- Shift Pagi -->
            <div class="shift-card pagi-shift">
              <div class="shift-header">
                <i class="fas fa-sun"></i>
                <span>Shift Pagi</span>
              </div>
              <div class="shift-team">
                <div class="team-member leader" v-if="codeBlueSchedule.pagi?.LEADER">
                  <span class="member-role">Leader</span>
                  <span class="member-name">{{ codeBlueSchedule.pagi.LEADER.nama }}</span>
                </div>
                <template v-for="i in 5" :key="i">
                  <div class="team-member" v-if="codeBlueSchedule.pagi?.[`ANGGOTA ${i}`]">
                    <span class="member-role">Anggota {{ i }}</span>
                    <span class="member-name">{{ codeBlueSchedule.pagi[`ANGGOTA ${i}`].nama }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Shift Siang -->
            <div class="shift-card siang-shift">
              <div class="shift-header">
                <i class="fas fa-cloud-sun"></i>
                <span>Shift Siang</span>
              </div>
              <div class="shift-team">
                <div class="team-member leader" v-if="codeBlueSchedule.siang?.LEADER">
                  <span class="member-role">Leader</span>
                  <span class="member-name">{{ codeBlueSchedule.siang.LEADER.nama }}</span>
                </div>
                <template v-for="i in 5" :key="i">
                  <div class="team-member" v-if="codeBlueSchedule.siang?.[`ANGGOTA ${i}`]">
                    <span class="member-role">Anggota {{ i }}</span>
                    <span class="member-name">{{ codeBlueSchedule.siang[`ANGGOTA ${i}`].nama }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Shift Malam -->
            <div class="shift-card malam-shift">
              <div class="shift-header">
                <i class="fas fa-moon"></i>
                <span>Shift Malam</span>
              </div>
              <div class="shift-team">
                <div class="team-member leader" v-if="codeBlueSchedule.malam?.LEADER">
                  <span class="member-role">Leader</span>
                  <span class="member-name">{{ codeBlueSchedule.malam.LEADER.nama }}</span>
                </div>
                <template v-for="i in 5" :key="i">
                  <div class="team-member" v-if="codeBlueSchedule.malam?.[`ANGGOTA ${i}`]">
                    <span class="member-role">Anggota {{ i }}</span>
                    <span class="member-name">{{ codeBlueSchedule.malam[`ANGGOTA ${i}`].nama }}</span>
                  </div>
                </template>
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
import dashboardService from '../services/dashboardService'


const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const currentDateTime = ref('')
const timeInterval = ref(null)
const autoReloadInterval = ref(null)
const autoReloadEnabled = ref(true)
const reloadIntervalSeconds = ref(30) // Auto reload every 30 seconds
const isReloading = ref(false)
const showMenuManagementModal = ref(false)
const showRoleManagementModal = ref(false)
const showUserManagementModal = ref(false)
const loadingStats = ref(false)
const selectedPeriod = ref('today')
const customStartDate = ref('')
const customEndDate = ref('')
const isFilterOpen = ref(false)

const periodLabels = {
  today: 'Hari Ini',
  month: 'Bulan Ini',
  year: 'Tahun Ini',
  custom: 'Custom'
}

const selectPeriod = (value) => {
  selectedPeriod.value = value
  isFilterOpen.value = false
  handlePeriodChange()
}

const dashboardStats = ref({
  pasien: { total: 0, per_poli: {} },
  pegawai: { total: 0, medis: 0, non_medis: 0 },
  cuti: { bulan_ini: 0, pending: 0, approved: 0 },
  bed: { total: 0, terisi: 0, tersedia: 0, occupancy_rate: 0 },
  approval: { cuti_pending: 0, jadwal_pending: 0, total_pending: 0 },
  farmasi: { total_item: 0, stok_kritis: 0, stok_aman: 0 }
})

// Statistics data
const stats = ref({
  totalPatients: 2847,
  todayVisits: 156,
  emergencyCases: 23,
  surgeries: 8
})

// Code Blue Schedule
const codeBlueSchedule = ref({
  pagi: {},
  siang: {},
  malam: {}
})

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

const navigateToModule = (module) => {
  // Navigate to specific module (will implement later)
  console.log(`Navigating to ${module} module`)
  // Example: router.push(`/${module}`)
}

const navigateTo = (path) => {
  router.push(path)
}

const navigateToCodeBlueManagement = () => {
  router.push('/codeblue/schedule')
}

const navigateToRoleMenu = () => {
  router.push('/admin/role-menu')
}

const fetchDashboardStats = async (params = {}) => {
  loadingStats.value = true
  try {
    const response = await dashboardService.getStats(params)
    dashboardStats.value = response.data.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  } finally {
    loadingStats.value = false
  }
}

const fetchCodeBlueSchedule = async () => {
  try {
    const response = await dashboardService.getCodeBlueSchedule()
    codeBlueSchedule.value = response.data.data
  } catch (error) {
    console.error('Error fetching code blue schedule:', error)
  }
}

const handlePeriodChange = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  let params = {}

  if (selectedPeriod.value === 'today') {
    params = { tgl_awal: `${year}-${month}-${day}`, tgl_akhir: `${year}-${month}-${day}` }
    fetchDashboardStats(params)
  } else if (selectedPeriod.value === 'month') {
    // Start of month to today/end of month
    params = { tgl_awal: `${year}-${month}-01`, tgl_akhir: `${year}-${month}-${day}` } // To current date usually for 'Bulan Ini'
    // Or full month? Usually 'Current Month' implies 1st to End of Month.
    // Let's use 1st to current date for accurate "Bulan Ini" progress.
    // Actually, users might want to see full month data if available. Let's do 1st to last day.
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    params = { tgl_awal: `${year}-${month}-01`, tgl_akhir: `${year}-${month}-${lastDay}` }
    fetchDashboardStats(params)
  } else if (selectedPeriod.value === 'year') {
    params = { tgl_awal: `${year}-01-01`, tgl_akhir: `${year}-12-31` }
    fetchDashboardStats(params)
  }
  // 'custom' waits for explicit apply button
}

const applyCustomFilter = () => {
  if (customStartDate.value && customEndDate.value) {
    fetchDashboardStats({
      tgl_awal: customStartDate.value,
      tgl_akhir: customEndDate.value
    })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Auto reload function
const startAutoReload = () => {
  if (autoReloadInterval.value) {
    clearInterval(autoReloadInterval.value)
  }
  
  if (autoReloadEnabled.value) {
    autoReloadInterval.value = setInterval(async () => {
      isReloading.value = true
      try {
        // Reload stats based on current filter
        await handlePeriodChange()
        // Reload code blue schedule
        await fetchCodeBlueSchedule()
      } finally {
        // Show reload indicator for at least 500ms for better UX
        setTimeout(() => {
          isReloading.value = false
        }, 500)
      }
    }, reloadIntervalSeconds.value * 1000)
  }
}

const stopAutoReload = () => {
  if (autoReloadInterval.value) {
    clearInterval(autoReloadInterval.value)
    autoReloadInterval.value = null
  }
}

const toggleAutoReload = () => {
  autoReloadEnabled.value = !autoReloadEnabled.value
  if (autoReloadEnabled.value) {
    startAutoReload()
  } else {
    stopAutoReload()
  }
}

// Lifecycle hooks
onMounted(() => {
  updateDateTime()
  timeInterval.value = setInterval(updateDateTime, 1000)
  fetchDashboardStats() // Initial load (defaults to today in backend if no params, or we can explicit pass today)
  fetchCodeBlueSchedule() // Load code blue schedule
  startAutoReload() // Start auto reload
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
  stopAutoReload()
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
  padding-top: 2rem;
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

.quick-stats-section,
/* Code Blue Schedule Section */
.codeblue-schedule-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quick-stats-section h3,
.codeblue-schedule-section h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Section Header with Action Button */
.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header-with-action h3 {
  margin-bottom: 0;
}

.codeblue-schedule-section h3 i {
  color: #3b82f6;
}

/* Manage Code Blue Button */
.btn-manage-codeblue {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-manage-codeblue:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-manage-codeblue:active {
  transform: translateY(0);
}

.btn-manage-codeblue i {
  font-size: 0.875rem;
}

/* Code Blue Shifts Grid */
.codeblue-shifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Shift Card */
.shift-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.shift-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.shift-card.pagi-shift:hover { border-color: #f59e0b; }
.shift-card.siang-shift:hover { border-color: #3b82f6; }
.shift-card.malam-shift:hover { border-color: #6366f1; }

/* Shift Header */
.shift-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1rem;
}

.pagi-shift .shift-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.pagi-shift .shift-header i {
  color: #f59e0b;
}

.siang-shift .shift-header {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.siang-shift .shift-header i {
  color: #3b82f6;
}

.malam-shift .shift-header {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #3730a3;
}

.malam-shift .shift-header i {
  color: #6366f1;
}

/* Shift Team */
.shift-team {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Team Member */
.team-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.team-member:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.team-member.leader {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
  font-weight: 600;
}

.team-member.leader:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
}

.member-role {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.team-member.leader .member-role {
  color: #1e40af;
  font-weight: 700;
}

.member-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.team-member.leader .member-name {
  color: #1e3a8a;
  font-weight: 700;
}

/* Quick Stats Grid */
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.stats-loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
}

.stats-loading i {
  margin-right: 0.5rem;
  color: #3b82f6;
}

/* Quick Stat Card */
.quick-stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.quick-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.quick-stat-card.pasien-card:hover { border-color: #3b82f6; }
.quick-stat-card.pegawai-card:hover { border-color: #10b981; }
.quick-stat-card.cuti-card:hover { border-color: #f59e0b; }
.quick-stat-card.bed-card:hover { border-color: #8b5cf6; }
.quick-stat-card.approval-card:hover { border-color: #ef4444; }
.quick-stat-card.mutu-card:hover { border-color: #14b8a6; }
.quick-stat-card.farmasi-card:hover { border-color: #ec4899; }
.quick-stat-card.bed-total-card:hover { border-color: #3b82f6; }
.quick-stat-card.bed-available-card:hover { border-color: #10b981; }
.quick-stat-card.bed-occupied-card:hover { border-color: #ef4444; }

/* Stat Icon Wrapper */
.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pasien-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.pegawai-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.cuti-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.bed-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.total-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.available-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.occupied-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.approval-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.mutu-gradient {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
}

.farmasi-gradient {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

/* Stat Details */
.stat-details {
  flex: 1;
  min-width: 0;
}

.stat-details h4 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.stat-details p {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Stat Breakdown */
.stat-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.breakdown-item {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.breakdown-item.pending {
  background: #fef3c7;
  color: #92400e;
}

.breakdown-item.approved {
  background: #d1fae5;
  color: #065f46;
}

.breakdown-item.available {
  background: #d1fae5;
  color: #065f46;
}

.breakdown-item.occupied {
  background: #fee2e2;
  color: #991b1b;
}

.breakdown-item.aman {
  background: #d1fae5;
  color: #065f46;
}

/* Stat Breakdown Grid - for pasien poli */
.stat-breakdown-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.stat-breakdown-grid::-webkit-scrollbar {
  width: 4px;
}

.stat-breakdown-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.stat-breakdown-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.stat-breakdown-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.breakdown-grid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.7rem;
}

.poli-name {
  color: #64748b;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.poli-count {
  color: #1e293b;
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: right;
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

/* Patient Stats Gradients */
.total-pasien-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.ranap-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.ralan-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.igd-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.quick-stat-card.total-pasien-card:hover { border-color: #3b82f6; }
.quick-stat-card.ranap-card:hover { border-color: #8b5cf6; }
.quick-stat-card.ralan-card:hover { border-color: #10b981; }
.quick-stat-card.igd-card:hover { border-color: #ef4444; }

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out forwards;
}

/* Filter Section - Force Horizontal Layout */
.filter-section {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 0.75rem !important;
}

/* Filter Tabs - Ensure Horizontal Layout */
.filter-tabs-container {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 0 !important;
  background: white;
  border-radius: 0.75rem;
  padding: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.filter-tab-item {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0.625rem 1rem !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  transition: all 0.15s ease !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  user-select: none !important;
}

.filter-tab-item.active {
  background: #2563eb !important;
  color: white !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
}

.filter-tab-item:not(.active) {
  color: #4b5563 !important;
  background: transparent !important;
}

.filter-tab-item:not(.active):hover {
  color: #111827 !important;
  background: #f9fafb !important;
}

/* Custom Date Inputs Styling */
.custom-date-input {
  padding: 0.625rem 0.75rem !important;
  font-size: 0.875rem !important;
  color: #374151 !important;
  font-weight: 500 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  outline: none !important;
  background: white !important;
  width: 9rem !important;
  transition: all 0.15s ease !important;
}

.custom-date-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.date-separator {
  color: #9ca3af !important;
  font-weight: 500 !important;
  font-size: 1rem !important;
}

.custom-date-apply {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #2563eb !important;
  color: white !important;
  padding: 0.625rem 1rem !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
}

.custom-date-apply:hover {
  background: #1d4ed8 !important;
}

.custom-date-apply:active {
  transform: scale(0.95);
}

/* Auto Reload Button */
.btn-auto-reload {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0.625rem 1rem !important;
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
}

.btn-auto-reload:hover {
  background: #e5e7eb !important;
  border-color: #d1d5db !important;
}

.btn-auto-reload.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border-color: #10b981 !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
}

.btn-auto-reload.active:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
}

.btn-auto-reload i {
  font-size: 0.875rem !important;
}

.btn-auto-reload.active i.fa-spin {
  animation: spin 2s linear infinite !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.reload-status {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Reload Indicator */
.btn-auto-reload {
  position: relative !important;
}

.reload-pulse {
  position: absolute !important;
  top: -4px !important;
  right: -4px !important;
  width: 12px !important;
  height: 12px !important;
  background: #ef4444 !important;
  border-radius: 50% !important;
  animation: pulse 1.5s ease-in-out infinite !important;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7) !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.btn-auto-reload.reloading {
  animation: reload-flash 0.5s ease-in-out !important;
}

@keyframes reload-flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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

  .quick-stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-main {
    padding: 1rem;
  }
}

/* Mobile Optimization - Small Screens */
@media (max-width: 640px) {
  /* Ensure dashboard-main has padding */
  .dashboard-main {
    padding: 1rem !important;
    overflow-x: hidden !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Filter Section - Stack Vertically */
  .filter-section {
    flex-direction: column !important;
    flex-wrap: wrap !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }

  /* Filter Tabs - Full Width Stack */
  .filter-tabs-container {
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
    border-radius: 0.5rem !important;
    padding: 0 !important;
    background: transparent !important;
  }

  .filter-tab-item {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.75rem 1rem !important;
    border-radius: 0.5rem !important;
    font-size: 0.875rem !important;
  }

  .filter-tab-item i {
    font-size: 1rem !important;
  }

  /* Custom Date Inputs - Full Width */
  .custom-date-input {
    width: 100% !important;
    font-size: 1rem !important;
    padding: 0.75rem !important;
  }

  .date-separator {
    display: none !important;
  }

  .custom-date-apply {
    width: 100% !important;
    padding: 0.75rem !important;
    font-size: 1rem !important;
  }

  /* Auto Reload Button - Full Width */
  .btn-auto-reload {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.75rem 1rem !important;
    font-size: 1rem !important;
  }

  /* Welcome Section */
  .welcome-section {
    padding: 1.25rem !important;
  }

  .welcome-section h2 {
    font-size: 1.25rem !important;
    line-height: 1.4 !important;
  }

  .welcome-section p {
    font-size: 0.875rem !important;
  }

  .user-badges {
    flex-direction: column !important;
    gap: 0.5rem !important;
    width: 100% !important;
  }

  .user-badge,
  .department-badge {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
  }

  .date-time {
    font-size: 0.875rem !important;
  }

  .session-info {
    font-size: 0.75rem !important;
  }

  /* Stat Cards */
  .stat-card {
    padding: 1.25rem !important;
  }

  .stat-icon {
    width: 3rem !important;
    height: 3rem !important;
    font-size: 1.5rem !important;
  }

  .stat-content h3 {
    font-size: 1.75rem !important;
  }

  .stat-content p {
    font-size: 0.875rem !important;
  }

  /* Dashboard Sections - Reset to default */
  .dashboard-sections {
    margin-left: 0 !important;
    margin-right: 0 !important;
    gap: 1rem !important;
  }

  /* Quick Stats Section */
  .quick-stats-section h3 {
    font-size: 1.125rem !important;
  }

  .quick-stat-card {
    padding: 1rem !important; /* Reduced from 1.25rem to align with stat cards */
  }

  .stat-icon-wrapper {
    width: 3rem !important;
    height: 3rem !important;
  }

  .stat-icon-wrapper i {
    font-size: 1.5rem !important;
  }

  .stat-details h4 {
    font-size: 1.75rem !important;
  }

  .stat-details p {
    font-size: 0.875rem !important;
  }

  .breakdown-grid-item,
  .breakdown-item {
    font-size: 0.75rem !important;
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