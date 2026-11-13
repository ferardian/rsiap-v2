<template>
  <div class="sdi-view pks-view">
    <!-- Hero Header with Multi-Metrics -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="title-text">
            <h1>Undangan & Pertemuan</h1>
            <p>Agenda resmi, E-Notulensi rapat, dan monitoring tindak lanjut RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>

        <!-- Quick Stats Metric Cards -->
        <div class="stats-section">
          <div class="stat-card" :class="{ 'active': activeTab === 'all' }" @click="setTab('all')">
            <div class="stat-icon bg-blue-500/20 text-blue-200"><i class="fas fa-layer-group"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">Total Agenda</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'active': activeTab === 'upcoming' }" @click="setTab('upcoming')">
            <div class="stat-icon bg-emerald-500/20 text-emerald-200"><i class="fas fa-clock"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ upcomingCount }}</span>
              <span class="stat-label">Akan Datang</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'active': activeTab === 'today' }" @click="setTab('today')">
            <div class="stat-icon bg-amber-500/20 text-amber-200"><i class="fas fa-calendar-day"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ todayCount }}</span>
              <span class="stat-label">Hari Ini</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Action Bar Modern -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Left Filter Controls: Scope & Time Tabs -->
        <div class="action-left-controls">
          <!-- Scope Toggle (For Super Admin / Administrator / Direktur / Wadir) -->
          <div v-if="isPrivileged" class="scope-toggle-group">
            <button 
              class="scope-btn" 
              :class="{ active: viewScope === 'all' }" 
              @click="setViewScope('all')"
              title="Tampilkan seluruh agenda rapat rumah sakit"
            >
              <i class="fas fa-layer-group mr-1.5"></i> Semua Agenda
            </button>
            <button 
              class="scope-btn" 
              :class="{ active: viewScope === 'mine' }" 
              @click="setViewScope('mine')"
              title="Tampilkan hanya agenda yang melibatkan Anda (sebagai PJ atau Peserta)"
            >
              <i class="fas fa-user-check mr-1.5"></i> Agenda Saya
            </button>
          </div>

          <!-- Scope Badge (For Regular Employees) -->
          <div v-else class="scope-badge-regular" title="Menampilkan agenda di mana Anda terdaftar sebagai Penanggung Jawab atau Peserta Undangan">
            <i class="fas fa-user-shield text-blue-600 mr-1.5"></i>
            <span class="font-bold text-slate-700">Agenda Saya</span>
            <span class="scope-subtext hidden sm:inline">(PJ & Peserta)</span>
          </div>

          <!-- Time Filter Tabs -->
          <div class="filter-tabs-wrapper">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'all' }" 
              @click="setTab('all')"
            >
              <i class="fas fa-list mr-1.5"></i> Semua
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'upcoming' }" 
              @click="setTab('upcoming')"
            >
              <i class="fas fa-calendar-check mr-1.5 text-blue-500"></i> Akan Datang
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'today' }" 
              @click="setTab('today')"
            >
              <i class="fas fa-sun mr-1.5 text-emerald-500"></i> Hari Ini
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'past' }" 
              @click="setTab('past')"
            >
              <i class="fas fa-history mr-1.5 text-slate-400"></i> Selesai
            </button>
          </div>
        </div>

        <!-- Search & Date Controls on Right -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari perihal, lokasi, atau penanggung jawab..." 
              @input="handleSearch"
            >
            <button v-if="searchQuery" class="clear-search" @click="clearSearch" title="Hapus Pencarian">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="filter-box">
            <i class="fas fa-calendar-alt filter-icon"></i>
            <input 
              v-model="filterDate" 
              type="date" 
              class="date-input"
              @change="handleSearch"
            >
            <button v-if="filterDate" class="clear-filter" @click="clearDateFilter" title="Reset Tanggal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <button class="btn-refresh" @click="loadData(pagination.current_page)" title="Muat Ulang Data">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card-modern">
      <div class="table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="mt-3 font-semibold text-slate-600">Memuat data agenda & pertemuan...</p>
        </div>

        <table v-else-if="undanganList.length > 0" class="modern-table">
          <thead>
            <tr>
              <th width="4%">No</th>
              <th width="16%">Waktu & Jadwal</th>
              <th width="38%">Agenda & Pertemuan</th>
              <th width="17%">Lokasi / Ruang</th>
              <th width="13%">Peserta</th>
              <th width="12%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(undangan, index) in undanganList" 
              :key="undangan.id || index" 
              class="table-row-hover"
              @click="openDetailModal(undangan)"
            >
              <td class="text-muted font-bold text-xs">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              
              <!-- Kolom Waktu & Status -->
              <td>
                <div class="schedule-cell">
                  <div class="date-calendar-card" :class="getDateCardClass(undangan.tanggal)">
                    <div class="card-header">{{ formatMonth(undangan.tanggal) }}</div>
                    <div class="card-body">
                      <span class="day">{{ formatDayCell(undangan.tanggal) }}</span>
                      <span class="year">{{ formatYear(undangan.tanggal) }}</span>
                    </div>
                  </div>
                  <div class="time-status-info">
                    <span class="time-clock"><i class="far fa-clock mr-1"></i> {{ formatTimeCell(undangan.tanggal) }}</span>
                    <span class="status-pill" :class="getMeetingStatusClass(undangan.tanggal)">
                      {{ getMeetingStatusLabel(undangan.tanggal) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Kolom Agenda & Pertemuan -->
              <td>
                <div class="perihal-cell">
                  <div class="perihal-title-text">{{ undangan.perihal }}</div>
                  
                  <div class="perihal-meta-row">
                    <span class="badge-type" :class="getTypeClass(undangan.tipe)">
                      {{ undangan.tipe || 'Umum' }}
                    </span>

                    <span class="no-surat-pill" v-if="undangan.no_surat || undangan.surat?.no_surat">
                      <i class="fas fa-file-signature text-slate-400 mr-1"></i>
                      {{ undangan.no_surat || undangan.surat?.no_surat }}
                    </span>

                    <!-- Status Keterlibatan User -->
                    <span v-if="isUserPj(undangan)" class="my-role-pill pj-pill" title="Anda bertindak sebagai Penanggung Jawab agenda ini">
                      <i class="fas fa-crown text-amber-500 mr-1"></i> Penanggung Jawab
                    </span>
                    <span v-else-if="isUserAttendee(undangan)" class="my-role-pill attendee-pill" title="Anda diundang sebagai Peserta agenda ini">
                      <i class="fas fa-user-check text-blue-500 mr-1"></i> Peserta Undangan
                    </span>
                  </div>

                  <div class="pj-info-row" v-if="undangan.pj">
                    <i class="fas fa-user-circle text-blue-500 mr-1"></i>
                    <span class="pj-name-label">PJ: {{ getPjName(undangan) }}</span>
                  </div>
                </div>
              </td>

              <!-- Kolom Lokasi -->
              <td>
                <div class="location-cell">
                  <div class="location-pin-circle">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="location-details">
                    <span class="location-name">{{ undangan.lokasi || '-' }}</span>
                  </div>
                </div>
              </td>

              <!-- Kolom Peserta -->
              <td>
                <div class="participants-cell">
                  <div class="participants-pill">
                    <i class="fas fa-users text-slate-500 mr-1"></i>
                    <span>{{ getParticipantsCount(undangan) }} Peserta</span>
                  </div>
                </div>
              </td>

              <!-- Kolom Aksi -->
              <td class="text-center" @click.stop>
                <button 
                  class="btn-open-detail" 
                  @click="openDetailModal(undangan)" 
                  title="Lihat Detail, Presensi, Notulen, & Tindak Lanjut"
                >
                  <i class="fas fa-eye mr-1.5"></i>
                  <span>Detail</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <h3>Agenda Tidak Ditemukan</h3>
          <p>Belum ada data undangan atau pertemuan yang sesuai dengan kriteria filter saat ini.</p>
          <button class="btn-outline-primary mt-3" @click="resetFilters">
            <i class="fas fa-sync-alt mr-2"></i>Reset Filter & Tampilkan Semua
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <div class="pagination-info">
          Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} agenda
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button v-for="page in displayedPages" :key="page" class="btn-page-number" :class="{ active: page === pagination.current_page }" @click="changePage(page)">
              {{ page }}
            </button>
          </div>

          <button class="btn-page" :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <UndanganDetailModal 
      :show="showDetailModal"
      :data="selectedUndangan"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { undanganService } from '@/services/undanganService'
import debounce from 'lodash/debounce'

// Import Detail Modal
import UndanganDetailModal from './components/UndanganDetailModal.vue'

const toast = useToast()
const authStore = useAuthStore()

// State
const undanganList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')
const activeTab = ref('all') // 'all', 'upcoming', 'today', 'past'
const upcomingCount = ref(0)
const todayCount = ref(0)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

// Modal States
const showDetailModal = ref(false)
const selectedUndangan = ref(null)

// Privileges & Scopes
const isPrivileged = computed(() => {
  const role = authStore.userRole || ''
  const activeRole = authStore.activeRole?.nama_role || ''
  const jbtn = (authStore.user?.detail?.jbtn || '').toLowerCase()
  const jnj = (authStore.user?.detail?.jnj_jabatan || '').toUpperCase()

  const privilegedRoles = ['super admin', 'administrator', 'direktur', 'wakil direktur']
  const isRolePrivileged = privilegedRoles.some(r => 
    role.toLowerCase().includes(r) || activeRole.toLowerCase().includes(r)
  )
  const isPositionPrivileged = jbtn.includes('direktur') || ['RS1', 'WD'].includes(jnj)
  return isRolePrivileged || isPositionPrivileged
})

// 'all' for privileged users by default, 'mine' for non-privileged
const viewScope = ref('all')

const getCurrentUserNik = () => {
  return authStore.user?.detail?.nik || authStore.user?.data?.detail?.nik || authStore.user?.id_user || authStore.user?.nik || ''
}

const isUserPj = (undangan) => {
  const nik = getCurrentUserNik()
  return !!(nik && undangan.pj === nik)
}

const isUserAttendee = (undangan) => {
  const nik = getCurrentUserNik()
  if (!nik || !Array.isArray(undangan.peserta)) return false
  return undangan.peserta.some(p => p.penerima === nik || p.pegawai?.nik === nik)
}

const getRequestScopeParams = () => {
  const scopes = []
  const extraParams = {}
  
  if (viewScope.value === 'mine' || !isPrivileged.value) {
    extraParams.view_scope = 'mine'
    const userNik = getCurrentUserNik()
    if (userNik) {
      scopes.push({ name: 'filterByInvolved', parameters: [userNik] })
    }
  }

  return { scopes, extraParams }
}

const setViewScope = (scope) => {
  if (viewScope.value === scope) return
  viewScope.value = scope
  pagination.value.current_page = 1
  loadData(1)
  loadStats()
}

onMounted(() => {
  if (!authStore.user) {
    authStore.initAuth()
  }
  viewScope.value = isPrivileged.value ? 'all' : 'mine'
  loadData()
  loadStats()
})

const getTodayString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const loadStats = async () => {
  try {
    const todayStr = getTodayString()
    const { scopes, extraParams } = getRequestScopeParams()

    // Upcoming count
    const upcomingRes = await undanganService.search('', 1, 1, [
      { field: 'tanggal', operator: '>=', value: `${todayStr} 00:00:00` }
    ], scopes, extraParams)
    upcomingCount.value = upcomingRes.data?.meta?.total || 0

    // Today count
    const todayRes = await undanganService.search('', 1, 1, [
      { field: 'tanggal', operator: '>=', value: `${todayStr} 00:00:00` },
      { field: 'tanggal', operator: '<=', value: `${todayStr} 23:59:59` }
    ], scopes, extraParams)
    todayCount.value = todayRes.data?.meta?.total || 0
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

const setTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  pagination.value.current_page = 1
  loadData(1)
}

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const filters = []
    const todayStr = getTodayString()

    // Status tab filters
    if (activeTab.value === 'upcoming') {
      filters.push({ field: 'tanggal', operator: '>=', value: `${todayStr} 00:00:00` })
    } else if (activeTab.value === 'today') {
      filters.push({ field: 'tanggal', operator: '>=', value: `${todayStr} 00:00:00` })
      filters.push({ field: 'tanggal', operator: '<=', value: `${todayStr} 23:59:59` })
    } else if (activeTab.value === 'past') {
      filters.push({ field: 'tanggal', operator: '<', value: `${todayStr} 00:00:00` })
    }

    if (filterDate.value) {
      filters.push({ field: 'tanggal', operator: '>=', value: `${filterDate.value} 00:00:00` })
      filters.push({ field: 'tanggal', operator: '<=', value: `${filterDate.value} 23:59:59` })
    }
    
    const { scopes, extraParams } = getRequestScopeParams()
    const response = await undanganService.search(searchQuery.value, pagination.value.per_page, page, filters, scopes, extraParams)
    
    if (response.data) {
      undanganList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: response.data.meta?.total || undanganList.value.length
      }
    }
  } catch (error) {
    console.error('Error loading Undangan:', error)
    toast.error('Gagal memuat data agenda')
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  pagination.value.current_page = 1
  loadData(1)
}, 500)

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearDateFilter = () => {
  filterDate.value = ''
  handleSearch()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterDate.value = ''
  activeTab.value = 'all'
  handleSearch()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadData(page)
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDayCell = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonth = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYear = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getFullYear() : '----'
}

const formatTimeCell = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '--:--'
}

const getMeetingStatusLabel = (dateStr) => {
  if (!dateStr) return '-'
  const d = parseDate(dateStr)
  if (!d) return '-'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const meetingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  if (meetingDate.getTime() === today.getTime()) return 'Hari Ini'
  if (meetingDate.getTime() > today.getTime()) return 'Akan Datang'
  return 'Selesai'
}

const getMeetingStatusClass = (dateStr) => {
  const label = getMeetingStatusLabel(dateStr)
  if (label === 'Hari Ini') return 'status-pill-today'
  if (label === 'Akan Datang') return 'status-pill-upcoming'
  return 'status-pill-past'
}

const getDateCardClass = (dateStr) => {
  const label = getMeetingStatusLabel(dateStr)
  if (label === 'Hari Ini') return 'card-theme-today'
  if (label === 'Akan Datang') return 'card-theme-upcoming'
  return 'card-theme-past'
}

const getParticipantsCount = (undangan) => {
  if (Array.isArray(undangan.peserta)) return undangan.peserta.length
  return 0
}

const getPjName = (undangan) => {
  const pj = undangan.penanggungJawab || undangan.penanggung_jawab
  return pj?.nama || undangan.pj || '-'
}

const getTypeClass = (type) => {
  if (!type) return 'badge-umum'
  const t = type.toLowerCase()
  if (t.includes('rapat')) return 'badge-rapat'
  if (t.includes('sosialisasi')) return 'badge-sosial'
  if (t.includes('bimtek')) return 'badge-bimtek'
  return 'badge-umum'
}

// Actions
const openDetailModal = (undangan) => {
  selectedUndangan.value = undangan
  showDetailModal.value = true
}

const displayedPages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  
  return pages
})
</script>

<style scoped>
.sdi-view {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

/* Hero Header */
.hero-header {
  border-radius: 20px;
  padding: 2rem 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -30%; right: -10%;
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.title-section { display: flex; align-items: center; gap: 1.5rem; }

.icon-box {
  width: 60px; height: 60px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.title-text h1 { font-size: 1.65rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.02em; }
.title-text p { color: #dbeafe; margin: 0; font-size: 0.9rem; opacity: 0.95; }

.stats-section { display: flex; gap: 1rem; flex-wrap: wrap; }

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.85rem 1.25rem;
  display: flex; align-items: center; gap: 1rem;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.stat-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}
.stat-card.active {
  background: white;
  border-color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}
.stat-card.active .stat-value { color: #1e3a8a; }
.stat-card.active .stat-label { color: #64748b; }

.stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; margin-bottom: 0.2rem; }
.stat-label { font-size: 0.65rem; color: #dbeafe; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }

/* Filter & Action Bar */
.action-bar-modern { margin-bottom: 1.25rem; }
.action-bar-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }

.action-left-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.scope-toggle-group {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
  border: 1px solid #cbd5e1;
}

.scope-btn {
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.scope-btn:hover {
  color: #0f172a;
}

.scope-btn.active {
  background: #1e40af;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(30, 64, 175, 0.25);
}

.scope-btn.active i {
  color: #93c5fd !important;
}

.scope-badge-regular {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #1e40af;
}

.scope-subtext {
  font-size: 0.72rem;
  color: #64748b;
  margin-left: 2px;
}

.filter-tabs-wrapper {
  display: flex;
  background: #e2e8f0;
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
}

.tab-btn {
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: #0f172a; }
.tab-btn.active {
  background: white;
  color: #1e3a8a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* User Role Badges in Table Row */
.my-role-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
  letter-spacing: 0.02em;
}

.pj-pill {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.attendee-pill {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.search-filter-group { display: flex; gap: 0.75rem; align-items: center; flex: 1; justify-content: flex-end; }

.search-box { position: relative; flex: 1; max-width: 360px; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.85rem; }
.search-box input {
  width: 100%; padding: 0.65rem 2.5rem 0.65rem 2.4rem;
  border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 0.85rem; transition: all 0.2s;
  background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.search-box input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12); }

.clear-search, .clear-filter {
  position: absolute; right: 0.65rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: #94a3b8; cursor: pointer;
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
}
.clear-search:hover, .clear-filter:hover { background: #fee2e2; color: #ef4444; }

.filter-box { position: relative; width: 170px; }
.filter-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 1; font-size: 0.85rem; }
.filter-box input {
  width: 100%; padding: 0.65rem 2.2rem 0.65rem 2.2rem;
  border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 0.82rem; background: white; color: #1e293b; cursor: pointer;
}

.btn-refresh {
  width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; color: #475569; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-refresh:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

/* Table Container & Modern Table */
.card-modern {
  background: white; border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  overflow: hidden; border: 1px solid #e2e8f0;
}

.table-container { overflow-x: auto; position: relative; min-height: 400px; }

.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.modern-table th {
  background: #f8fafc; color: #475569; font-weight: 800; font-size: 0.72rem;
  text-transform: uppercase; letter-spacing: 0.08em; padding: 1.1rem 1.25rem;
  text-align: left; border-bottom: 2px solid #e2e8f0;
}

.modern-table td { padding: 1.15rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row-hover:hover { background-color: #f8fafc; cursor: pointer; }

/* Schedule Cell */
.schedule-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.date-calendar-card {
  width: 64px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.table-row-hover:hover .date-calendar-card {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.date-calendar-card .card-header {
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.2rem;
  text-align: center;
  letter-spacing: 0.05em;
}

.card-theme-today .card-header { background: #10b981; }
.card-theme-upcoming .card-header { background: #3b82f6; }
.card-theme-past .card-header { background: #64748b; }

.date-calendar-card .card-body {
  padding: 0.35rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-calendar-card .day {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.date-calendar-card .year {
  font-size: 0.62rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 1px;
}

.time-status-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.time-clock {
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
}

.status-pill {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  width: fit-content;
  letter-spacing: 0.04em;
}

.status-pill-today {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.status-pill-upcoming {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.status-pill-past {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* Perihal Cell */
.perihal-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.perihal-title-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.35;
}

.perihal-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.no-surat-pill {
  font-size: 0.7rem;
  font-family: monospace;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  color: #475569;
  font-weight: 600;
}

.pj-info-row {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
}
.pj-name-label { font-weight: 600; color: #334155; }

/* Location Cell */
.location-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.location-pin-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.location-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
  line-height: 1.3;
}

/* Participants Cell */
.participants-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

/* Action Button */
.btn-open-detail {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-open-detail:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

/* Badges */
.badge-type {
  display: inline-block; padding: 0.2rem 0.6rem; border-radius: 99px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
}
.badge-umum { background: #f1f5f9; color: #64748b; }
.badge-rapat { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.badge-sosial { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.badge-bimtek { background: #fefce8; color: #ca8a04; border: 1px solid #fef9c3; }

/* Pagination */
.pagination-container {
  padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-top: 1px solid #f1f5f9;
}
.pagination-info { font-size: 0.85rem; color: #64748b; font-weight: 600; }
.pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
.btn-page {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-page:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

.page-numbers { display: flex; gap: 0.35rem; }
.btn-page-number {
  min-width: 36px; height: 36px; border-radius: 10px; border: 1px solid transparent;
  background: transparent; color: #64748b; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.btn-page-number:hover { background: #f1f5f9; }
.btn-page-number.active { background: #3b82f6; color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }

/* Loading & Empty state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state h3 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin-bottom: 0.35rem; }
.empty-state p { font-size: 0.85rem; color: #64748b; max-width: 380px; margin: 0 auto; }

@media (max-width: 900px) {
  .hero-content { flex-direction: column; align-items: flex-start; }
  .action-bar-row { flex-direction: column; align-items: stretch; }
  .search-filter-group { flex-wrap: wrap; }
}
</style>
