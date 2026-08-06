<template>
  <div class="rs-online-wrapper">
    <div class="rs-online-container">
      <!-- Compact Hero Header -->
      <div class="compact-hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-bed"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-soft-emerald text-emerald font-mono text-xs px-2 py-0.5 rounded-full border border-emerald-300">
                <i class="fas fa-plug text-xs me-1"></i> SIRS Kemenkes
              </span>
              <span class="badge bg-white/20 text-white font-mono text-xs px-2 py-0.5 rounded-full border border-white/30">
                Faskes ID: 3326051
              </span>
            </div>
            <h1 class="hero-title">Master Referensi Tempat Tidur</h1>
            <p class="hero-subtitle">B. Entry Data Ruangan dan Tempat Tidur — RS Online Kementerian Kesehatan RI</p>
          </div>
        </div>

        <div class="hero-actions">
          <button class="btn btn-emerald-glass btn-sm" @click="fetchData" :disabled="loading">
            <i class="fas fa-sync-alt me-1.5" :class="{ 'fa-spin': loading }"></i> Segarkan Data
          </button>
        </div>
      </div>

      <!-- Compact 3-Column Stats Row -->
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div class="stat-icon bg-emerald-50 text-emerald-600">
              <i class="fas fa-list-ol"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Referensi TT</span>
              <h3 class="stat-value text-slate-800">{{ tempatTidurList.length }} <span class="text-xs font-normal text-slate-500">Jenis</span></h3>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div class="stat-icon bg-blue-50 text-blue-600">
              <i class="fas fa-filter"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Hasil Filter</span>
              <h3 class="stat-value text-slate-800">{{ filteredList.length }} <span class="text-xs font-normal text-slate-500">Ditemukan</span></h3>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="stat-card">
            <div class="stat-icon bg-purple-50 text-purple-600">
              <i class="fas fa-server"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Status Server SIRS</span>
              <h3 class="stat-value text-emerald-600 d-flex align-items-center gap-1.5 text-base">
                <span class="status-indicator animate-pulse"></span> Terkoneksi (200 OK)
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Container & Filter Bar -->
      <div class="content-area">
        <!-- Compact Filter Bar -->
        <div class="action-bar-compact d-flex justify-content-between align-items-center">
          <div class="search-box-compact">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari tempat tidur berdasarkan nama atau kode..."
            >
            <button v-if="searchQuery" @click="searchQuery = ''" class="btn-clear-compact text-slate-400 hover:text-slate-600">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="endpoint-badge d-none d-md-flex align-items-center gap-1.5 text-xs text-slate-500 fw-medium">
            <i class="fas fa-link text-slate-400"></i> Endpoint:
            <code class="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono fw-semibold">/Referensi/tempat_tidur</code>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state-unified py-8">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin text-emerald-600 text-2xl"></i>
          </div>
          <p class="mt-2 text-slate-600 fw-semibold text-sm">Memuat Data Referensi Tempat Tidur SIRS Kemenkes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredList.length === 0" class="empty-state-unified py-8">
          <div class="empty-icon-container mb-2">
            <i class="fas fa-inbox text-slate-300 text-4xl"></i>
          </div>
          <h4 class="fw-bold text-slate-700 fs-6 mb-1">Data Tidak Ditemukan</h4>
          <p class="text-slate-500 text-xs mb-3">Tidak ada tempat tidur yang cocok dengan pencarian "{{ searchQuery }}".</p>
          <button class="btn btn-sm btn-outline-secondary rounded-lg px-3" @click="searchQuery = ''">
            <i class="fas fa-undo me-1"></i> Reset Pencarian
          </button>
        </div>

        <!-- Desktop Table View -->
        <div v-else class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="60" class="text-center">No</th>
                <th width="140">Kode TT SIRS</th>
                <th>Nama Referensi Tempat Tidur</th>
                <th width="120" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredList" :key="item.kode_tt">
                <td class="text-center text-slate-400 font-mono fw-semibold text-xs">{{ index + 1 }}</td>
                <td>
                  <span class="code-badge font-mono">{{ item.kode_tt }}</span>
                </td>
                <td>
                  <div class="fw-bold text-slate-800 text-sm mb-0">{{ item.nama_tt }}</div>
                  <div class="text-xs text-slate-400">Master Referensi SIRS Kemenkes RI</div>
                </td>
                <td class="text-center">
                  <button 
                    class="btn btn-action-copy btn-xs" 
                    title="Salin Kode TT"
                    @click="copyToClipboard(item.kode_tt, item.nama_tt)"
                  >
                    <i class="fas fa-copy me-1"></i> Salin Kode
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import rsOnlineService from '@/services/rsOnlineService'
import Swal from 'sweetalert2'

const loading = ref(false)
const tempatTidurList = ref([])
const searchQuery = ref('')

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return tempatTidurList.value
  const q = searchQuery.value.toLowerCase().trim()
  return tempatTidurList.value.filter(item => 
    String(item.kode_tt).toLowerCase().includes(q) ||
    String(item.nama_tt).toLowerCase().includes(q)
  )
})

const fetchData = async () => {
  loading.value = true
  try {
    const response = await rsOnlineService.getRefTempatTidur()
    const resData = response.data
    tempatTidurList.value = resData.data || resData || []
  } catch (error) {
    console.error('Failed to fetch RS Online Ref Tempat Tidur:', error)
    const msg = error.response?.data?.message || 'Gagal terhubung ke API RS Online SIRS Kemenkes.'
    Swal.fire('Error', msg, 'error')
  } finally {
    loading.value = false
  }
}

const copyToClipboard = (code, name) => {
  navigator.clipboard.writeText(code).then(() => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Kode TT "${code}" (${name}) disalin!`,
      showConfirmButton: false,
      timer: 1800
    })
  }).catch(() => {
    Swal.fire('Salin Kode', `Kode TT: ${code}`, 'info')
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.rs-online-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 1rem 1.25rem;
  color: #1e293b;
}

.rs-online-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Compact Hero Header */
.compact-hero-header {
  background: linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 1.15rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.25);
}

.compact-hero-header::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -5%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  margin: 0.15rem 0 0 0;
  opacity: 0.95;
  font-size: 0.8rem;
  line-height: 1.3;
}

.btn-emerald-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 700;
  padding: 0.45rem 1rem;
  font-size: 0.825rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-emerald-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  transform: translateY(-1px);
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 0.85rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
}

/* Compact Action & Search Bar */
.content-area {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.action-bar-compact {
  padding: 0.85rem 1.15rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.search-box-compact {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.825rem;
}

.search-box-compact input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.45rem 2rem 0.45rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.825rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-box-compact input:focus {
  outline: none;
  background: white;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.btn-clear-compact {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Modern Table */
.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 0.75rem 1.15rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 0.75rem 1.15rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  vertical-align: middle;
}

.modern-table tr:hover {
  background-color: #f8fafc;
}

.code-badge {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.775rem;
  display: inline-block;
}

.btn-action-copy {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-action-copy:hover {
  background-color: #059669;
  color: white;
  border-color: #059669;
}

.btn-xs {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
}

.bg-soft-emerald {
  background-color: rgba(16, 185, 129, 0.15);
}

.text-emerald {
  color: #10b981;
}
</style>
