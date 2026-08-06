<template>
  <div class="rs-online-wrapper">
    <div class="rs-online-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-bed"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-soft-emerald text-emerald font-mono text-xs px-2.5 py-1 rounded-full border border-emerald-300">
                <i class="fas fa-plug text-xs me-1"></i> SIRS Kemenkes
              </span>
              <span class="badge bg-white/20 text-white font-mono text-xs px-2.5 py-1 rounded-full border border-white/30">
                Faskes ID: 3326051
              </span>
            </div>
            <h1 class="hero-title">Master Referensi Tempat Tidur</h1>
            <p class="hero-subtitle">B. Entry Data Ruangan dan Tempat Tidur — RS Online Kementerian Kesehatan RI</p>
          </div>
        </div>

        <div class="hero-actions">
          <button class="btn btn-emerald-glass" @click="fetchData" :disabled="loading">
            <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i> Segarkan Data
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon bg-emerald-50 text-emerald-600">
            <i class="fas fa-list-ol"></i>
          </div>
          <div>
            <span class="stat-label">Total Referensi TT</span>
            <h3 class="stat-value text-slate-800">{{ tempatTidurList.length }} <span class="text-sm font-normal text-slate-500">Jenis</span></h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-blue-50 text-blue-600">
            <i class="fas fa-search"></i>
          </div>
          <div>
            <span class="stat-label">Hasil Filter</span>
            <h3 class="stat-value text-slate-800">{{ filteredList.length }} <span class="text-sm font-normal text-slate-500">Ditemukan</span></h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-50 text-purple-600">
            <i class="fas fa-server"></i>
          </div>
          <div>
            <span class="stat-label">Status Server SIRS</span>
            <h3 class="stat-value text-emerald-600 d-flex align-items-center gap-2">
              <span class="status-indicator animate-pulse"></span> Terkoneksi (200 OK)
            </h3>
          </div>
        </div>
      </div>

      <!-- Action & Search Bar -->
      <div class="action-bar d-flex justify-content-between align-items-center mb-4">
        <div class="search-box flex-grow-1 max-w-md">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari nama atau kode tempat tidur..."
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="btn-clear text-slate-400 hover:text-slate-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="text-xs text-slate-500 fw-medium d-none d-md-block">
          Endpoint: <code class="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">/Referensi/tempat_tidur</code>
        </div>
      </div>

      <!-- Content Table Area -->
      <div class="content-area">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state-unified py-12">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin text-emerald-600 text-3xl"></i>
          </div>
          <p class="mt-3 text-slate-600 fw-semibold">Memuat Data Referensi Tempat Tidur SIRS Kemenkes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredList.length === 0" class="empty-state-unified py-12">
          <div class="empty-icon-container">
            <i class="fas fa-inbox text-slate-300 text-5xl mb-3"></i>
          </div>
          <h3 class="fw-bold text-slate-700">Data Tidak Ditemukan</h3>
          <p class="text-slate-500 text-sm">Tidak ada tempat tidur yang cocok dengan pencarian "{{ searchQuery }}".</p>
          <button class="btn btn-soft-secondary mt-3" @click="searchQuery = ''">
            <i class="fas fa-undo me-1"></i> Reset Pencarian
          </button>
        </div>

        <!-- Desktop Table View -->
        <div v-else class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="70" class="text-center">No</th>
                <th width="160">Kode TT SIRS</th>
                <th>Nama Referensi Tempat Tidur</th>
                <th width="140" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredList" :key="item.kode_tt">
                <td class="text-center text-slate-400 font-mono fw-semibold">{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="code-badge font-mono">{{ item.kode_tt }}</span>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-slate-800 fs-6 mb-0.5">{{ item.nama_tt }}</div>
                  <div class="text-xs text-slate-400">Master Referensi SIRS Kemenkes RI</div>
                </td>
                <td class="text-center">
                  <button 
                    class="btn btn-action-copy btn-sm" 
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
      title: `Kode TT "${code}" (${name}) berhasil disalin!`,
      showConfirmButton: false,
      timer: 2000
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
  padding: 1rem 1.5rem;
  color: #1e293b;
}

.rs-online-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(5, 150, 105, 0.3);
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.85rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.95;
  font-size: 0.9rem;
  max-width: 500px;
  line-height: 1.4;
}

.btn-emerald-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 700;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
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
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0.15rem 0 0 0;
}

.status-indicator {
  width: 10px;
  height: 10px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
}

/* Action Bar */
.action-bar {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Modern Table */
.content-area {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #f1f5f9;
}

.modern-table td {
  padding: 1.15rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  vertical-align: middle;
}

.modern-table tr:hover {
  background-color: #f8fafc;
}

.code-badge {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-block;
}

.btn-action-copy {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.35rem 0.85rem;
  transition: all 0.2s;
}

.btn-action-copy:hover {
  background-color: #059669;
  color: white;
  border-color: #059669;
}

.bg-soft-emerald {
  background-color: rgba(16, 185, 129, 0.15);
}

.text-emerald {
  color: #10b981;
}
</style>
