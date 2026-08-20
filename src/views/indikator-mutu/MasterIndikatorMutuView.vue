<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-database text-blue-600"></i> Master Indikator Mutu
        </h4>
        <p class="text-slate-500 mb-0 small">Kelola master data indikator mutu utama dan ruangan secara terpusat</p>
      </div>
    </div>

    <!-- Segmented Tabs Header -->
    <div class="tab-segment-wrapper mb-3">
      <div class="tab-segment">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'utama' }"
          @click="switchTab('utama')"
        >
          <i class="fas fa-star me-2"></i> Master Utama
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'ruang' }"
          @click="switchTab('ruang')"
        >
          <i class="fas fa-hospital me-2"></i> Master Indikator Ruang
        </button>
      </div>
    </div>

    <!-- Summary KPI Stat Cards -->
    <div class="row g-2.5 mb-3">
      <!-- Stat 1: Total Indikator -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-light text-blue-600">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Indikator</span>
            <div class="stat-value">{{ currentStats.total }}</div>
          </div>
        </div>
      </div>

      <!-- Stat 2: Aktif -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-emerald-light text-emerald-600">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Status Aktif</span>
            <div class="stat-value text-emerald-600">{{ currentStats.aktif }}</div>
          </div>
        </div>
      </div>

      <!-- Stat 3: Non-Aktif -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-slate-100 text-slate-500">
            <i class="fas fa-pause-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Non-Aktif</span>
            <div class="stat-value text-slate-500">{{ currentStats.nonAktif }}</div>
          </div>
        </div>
      </div>

      <!-- Stat 4: Per Kategori Breakdown -->
      <div class="col-6 col-md-3">
        <div class="stat-card flex-column justify-content-between py-2 px-3">
          <div class="w-100 d-flex align-items-center justify-content-between mb-1">
            <span class="stat-label d-flex align-items-center gap-1">
              Per Kategori
              <span class="badge bg-emerald-light text-emerald-600 border border-emerald-light rounded-pill px-2 py-0.5" style="font-size: 0.6rem;">AKTIF</span>
            </span>
            <span class="cat-total-hint">3 Kategori</span>
          </div>
          <div class="category-grid w-100">
            <div class="cat-item cat-inm" title="Indikator Mutu Nasional (Aktif)">
              <span class="cat-tag">INM</span>
              <span class="cat-count">{{ currentStats.imn }}</span>
            </div>
            <div class="cat-item cat-imprs" title="Indikator Mutu Prioritas Rumah Sakit (Aktif)">
              <span class="cat-tag">IMPRS</span>
              <span class="cat-count">{{ currentStats.imprs }}</span>
            </div>
            <div class="cat-item cat-impu" title="Indikator Mutu Prioritas Unit (Aktif)">
              <span class="cat-tag">IMPU</span>
              <span class="cat-count">{{ currentStats.impu }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card & Toolbar -->
    <div class="card main-card shadow-sm border-0 rounded-3">
      <div class="card-header bg-white border-bottom py-2.5 px-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <!-- Search & Filters Group -->
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <!-- Search Input -->
            <div class="search-input-group">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-control compact-input" 
                placeholder="Cari indikator, PJ, atau kategori..."
                v-model="filters.keyword"
                @keyup.enter="refreshData"
              >
            </div>

            <!-- Filter Kategori (Only for Utama) -->
            <select 
              v-if="activeTab === 'utama'"
              class="form-select compact-select filter-kategori" 
              v-model="filters.kategori"
              @change="refreshData"
            >
              <option value="">Semua Kategori</option>
              <option value="Indikator Mutu Nasional">Indikator Mutu Nasional</option>
              <option value="Indikator Mutu Prioritas Rumah Sakit">Indikator Mutu Prioritas Rumah Sakit</option>
              <option value="Indikator Mutu Prioritas Unit">Indikator Mutu Prioritas Unit</option>
            </select>

            <!-- Filter Unit (Only for Ruang) -->
            <select 
              v-if="activeTab === 'ruang'"
              class="form-select compact-select filter-unit" 
              v-model="filters.dep_id"
              @change="refreshData"
            >
              <option value="">Semua Unit/Dep</option>
              <option value="all">Semua Ruangan</option>
              <option v-for="unit in units" :key="unit.dep_id" :value="unit.dep_id">
                {{ unit.nama_ruang }}
              </option>
            </select>

            <!-- Filter Status -->
            <select 
              class="form-select compact-select filter-status" 
              v-model="filters.status"
              @change="refreshData"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="2">Non-Aktif</option>
            </select>
          </div>

          <!-- Action Button Group -->
          <div class="flex-shrink-0">
            <button 
              class="btn btn-primary-clean"
              @click="openCreateModal"
            >
              <i class="fas fa-plus me-1"></i> Tambah Indikator
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'utama'" key="utama">
            <MasterUtamaTable 
              :items="utama.items" 
              :loading="utama.loading"
              :total="utama.total"
              :page="utama.page"
              :limit="utama.limit"
              :totalPages="utama.totalPages"
              @change-page="p => changePage('utama', p)"
              @edit="openEditModal"
              @delete="deleteItem"
              @activate="handleActivate"
            />
          </div>
          <div v-else key="ruang">
            <MasterRuangTable 
              :items="ruang.items" 
              :loading="ruang.loading"
              :total="ruang.total"
              :page="ruang.page"
              :limit="ruang.limit"
              :totalPages="ruang.totalPages"
              @change-page="p => changePage('ruang', p)"
              @edit="openEditModal"
              @delete="deleteItem"
              @activate="handleActivate"
            />
          </div>
        </transition>
      </div>
    </div>

    <!-- Modals -->
    <MasterUtamaForm 
      v-if="showUtamaModal" 
      :visible="showUtamaModal"
      :initial-data="selectedItem"
      :is-saving="isSaving"
      @close="closeModals"
      @save="handleSaveUtama"
    />

    <MasterRuangForm 
      v-if="showRuangModal" 
      :visible="showRuangModal"
      :initial-data="selectedItem"
      :is-saving="isSaving"
      @close="closeModals"
      @save="handleSaveRuang"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import api from '@/services/indikatorMutuService'

import MasterUtamaTable from '@/components/indikator-mutu/MasterUtamaTable.vue'
import MasterUtamaForm from '@/components/indikator-mutu/MasterUtamaForm.vue'
import MasterRuangTable from '@/components/indikator-mutu/MasterRuangTable.vue'
import MasterRuangForm from '@/components/indikator-mutu/MasterRuangForm.vue'

const toast = useToast()
const activeTab = ref('utama')
const filters = reactive({ 
    keyword: '',
    kategori: '',
    status: '1', // Default Aktif
    dep_id: ''
})
const isSaving = ref(false)
const units = ref([])

// Summary Stats State
const statsUtama = reactive({
    total: 0,
    aktif: 0,
    nonAktif: 0,
    imn: 0,
    imprs: 0,
    impu: 0
})

const statsRuang = reactive({
    total: 0,
    aktif: 0,
    nonAktif: 0,
    imn: 0,
    imprs: 0,
    impu: 0
})

const fetchSummaryStats = async () => {
    try {
        const [resUtama, resRuang] = await Promise.all([
            api.getUtama({ limit: 1000 }),
            api.getRuang({ limit: 1000 })
        ])

        const listUtama = resUtama.data.data.data || resUtama.data.data || []
        const listUtamaAktif = listUtama.filter(i => String(i.status) === '1')
        statsUtama.total = listUtama.length
        statsUtama.aktif = listUtamaAktif.length
        statsUtama.nonAktif = listUtama.filter(i => String(i.status) !== '1').length
        statsUtama.imn = listUtamaAktif.filter(i => i.kategori === 'Indikator Mutu Nasional').length
        statsUtama.imprs = listUtamaAktif.filter(i => i.kategori === 'Indikator Mutu Prioritas Rumah Sakit').length
        statsUtama.impu = listUtamaAktif.filter(i => i.kategori === 'Indikator Mutu Prioritas Unit').length

        const listRuang = resRuang.data.data.data || resRuang.data.data || []
        const listRuangAktif = listRuang.filter(i => String(i.status) === '1')
        statsRuang.total = listRuang.length
        statsRuang.aktif = listRuangAktif.length
        statsRuang.nonAktif = listRuang.filter(i => String(i.status) !== '1').length
        statsRuang.imn = listRuangAktif.filter(i => i.nama_jenis && (i.nama_jenis.includes('Nasional') || i.nama_jenis.includes('INM'))).length
        statsRuang.imprs = listRuangAktif.filter(i => i.nama_jenis && (i.nama_jenis.includes('Rumah Sakit') || i.nama_jenis.includes('IMPRS'))).length
        statsRuang.impu = listRuangAktif.filter(i => i.nama_jenis && (i.nama_jenis.includes('Prioritas Unit') || i.nama_jenis.includes('Mutu Unit') || i.nama_jenis.includes('IMPU'))).length
    } catch (error) {
        console.error('Gagal memuat statistik summary:', error)
    }
}

const currentStats = computed(() => {
    return activeTab.value === 'utama' ? statsUtama : statsRuang
})

// State for Master Utama
const utama = reactive({
    items: [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
})

// State for Master Ruang
const ruang = reactive({
    items: [],
    loading: false,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
})

const showUtamaModal = ref(false)
const showRuangModal = ref(false)
const selectedItem = ref({})

// Methods
const switchTab = (tab) => {
    activeTab.value = tab
    filters.keyword = '' 
    filters.kategori = ''
    filters.status = '1' // Default Aktif
    filters.dep_id = ''
    refreshData()
}

const refreshData = () => {
    if (activeTab.value === 'utama') {
        fetchUtama()
    } else {
        fetchRuang()
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Gagal memuat daftar unit:', error)
    }
}

const fetchUtama = async () => {
    utama.loading = true
    try {
        const params = {
            page: utama.page,
            limit: utama.limit,
            keyword: filters.keyword
        }
        if (filters.kategori) params.kategori = filters.kategori
        if (filters.status) params.status = filters.status
        
        const response = await api.getUtama(params)
        const data = response.data.data
        utama.items = data.data
        utama.total = data.total
        utama.totalPages = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data Master Utama')
    } finally {
        utama.loading = false
    }
}

const fetchRuang = async () => {
    ruang.loading = true
    try {
        const params = {
            page: ruang.page,
            limit: ruang.limit,
            keyword: filters.keyword
        }
        if (filters.status !== '') params.status = filters.status
        if (filters.dep_id) params.dep_id = filters.dep_id

        const response = await api.getRuang(params)
        const data = response.data.data
        ruang.items = data.data
        ruang.total = data.total
        ruang.totalPages = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data Master Ruang')
    } finally {
        ruang.loading = false
    }
}

const changePage = (type, page) => {
    if (type === 'utama') {
        utama.page = page
        fetchUtama()
    } else {
        ruang.page = page
        fetchRuang()
    }
}

// Modal Handling
const openCreateModal = () => {
    selectedItem.value = {}
    if (activeTab.value === 'utama') {
        showUtamaModal.value = true
    } else {
        showRuangModal.value = true
    }
}

const openEditModal = (item) => {
    selectedItem.value = { ...item } // Clone object
     if (activeTab.value === 'utama') {
        showUtamaModal.value = true
    } else {
        showRuangModal.value = true
    }
}

const closeModals = () => {
    showUtamaModal.value = false
    showRuangModal.value = false
    selectedItem.value = {}
}

const handleSaveUtama = async (formData) => {
    isSaving.value = true
    try {
        if (formData.id_master) {
            await api.updateUtama(formData.id_master, formData)
            toast.success('Data berhasil diperbarui')
        } else {
            await api.createUtama(formData)
            toast.success('Data berhasil disimpan')
        }
        closeModals()
        fetchUtama()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data')
    } finally {
        isSaving.value = false
    }
}

const handleSaveRuang = async (formData) => {
    isSaving.value = true
    try {
        if (formData.id_inmut) {
            await api.updateRuang(formData.id_inmut, formData)
            toast.success('Data berhasil diperbarui')
        } else {
            await api.createRuang(formData)
            toast.success('Data berhasil disimpan')
        }
        closeModals()
        fetchRuang()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data')
    } finally {
        isSaving.value = false
    }
}

const handleActivate = async (item) => {
    const result = await Swal.fire({
        title: 'Aktifkan Kembali?',
        text: "Indikator ini akan muncul kembali untuk pengisian data dan monitoring.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Aktifkan!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            if (activeTab.value === 'utama') {
                await api.updateUtama(item.id_master, { ...item, status: '1' })
            } else {
                await api.updateRuang(item.id_inmut, { ...item, status: '1' })
            }
            toast.success('Data berhasil diaktifkan kembali')
            refreshData()
        } catch (error) {
            console.error(error)
            toast.error('Gagal mengaktifkan data')
        }
    }
}

const deleteItem = async (item) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data akan dinon-aktifkan dari sistem!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            if (activeTab.value === 'utama') {
                await api.deleteUtama(item.id_master)
                fetchUtama()
            } else {
                await api.deleteRuang(item.id_inmut)
                fetchRuang()
            }
            toast.success('Data berhasil dihapus')
        } catch (error) {
            console.error(error)
            toast.error('Gagal menghapus data')
        }
    }
}

// Initial Load
onMounted(() => {
    fetchUnits()
    fetchSummaryStats()
    refreshData()
})

// Watch filters.keyword with debounce if needed, currently on Enter key
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: 100vh;
}

.text-slate-800 { color: #1e293b; }
.text-slate-500 { color: #64748b; }
.text-blue-600 { color: #2563eb; }
.text-emerald-600 { color: #059669; }

.page-title {
  font-size: 1.15rem;
}

/* Stat Cards */
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
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

.bg-blue-light { background-color: #eff6ff; }
.bg-emerald-light { background-color: #ecfdf5; }
.bg-slate-100 { background-color: #f1f5f9; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.cat-total-hint {
  font-size: 0.65rem;
  font-weight: 600;
  color: #94a3b8;
}

.category-grid {
  display: flex;
  gap: 6px;
  width: 100%;
}

.cat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3px 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.cat-item.cat-inm {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #1d4ed8;
}

.cat-item.cat-imprs {
  background: #f3e8ff;
  border-color: #e9d5ff;
  color: #6b21a8;
}

.cat-item.cat-impu {
  background: #fef3c7;
  border-color: #fde68a;
  color: #b45309;
}

.cat-tag {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  opacity: 0.85;
  line-height: 1;
  margin-bottom: 2px;
}

.cat-count {
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
}

/* Segmented Tabs Control */
.tab-segment-wrapper {
  display: inline-block;
}

.tab-segment {
  display: inline-flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.45rem 1.1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover:not(.active) {
  color: #334155;
}

.tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Main Card */
.main-card {
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
}

/* Compact Controls */
.search-input-group {
  position: relative;
  min-width: 220px;
  flex: 1 1 240px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.8rem;
  pointer-events: none;
}

.compact-input {
  height: 36px;
  padding-left: 2.2rem;
  padding-right: 0.75rem;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}

.compact-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.compact-select {
  height: 36px;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  cursor: pointer;
  color: #334155;
}

.compact-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.filter-kategori { width: 220px; }
.filter-unit { width: 220px; }
.filter-status { width: 130px; }

.btn-primary-clean {
  height: 36px;
  padding: 0 1.25rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
  width: auto !important;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-primary-clean:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .search-input-group,
  .filter-kategori,
  .filter-unit,
  .filter-status {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
