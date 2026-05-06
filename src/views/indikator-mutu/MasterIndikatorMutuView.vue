<template>
  <div class="container-fluid py-4 px-4">
    <div class="row mb-4 align-items-center">
      <div class="col-12">
        <h3 class="fw-bold text-dark mb-1">
          <i class="fas fa-database text-primary me-2"></i> Master Indikator Mutu
        </h3>
        <p class="text-muted">Kelola master data indikator mutu utama dan ruangan secara terpusat</p>
      </div>
    </div>

    <!-- Tabs Header -->
    <ul class="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border d-inline-flex">
      <li class="nav-item">
        <button 
          class="nav-link px-4 py-2 fw-semibold" 
          :class="{ active: activeTab === 'utama' }"
          @click="switchTab('utama')"
        >
          <i class="fas fa-star me-2"></i> Master Utama
        </button>
      </li>
      <li class="nav-item">
        <button 
          class="nav-link px-4 py-2 fw-semibold" 
          :class="{ active: activeTab === 'ruang' }"
          @click="switchTab('ruang')"
        >
          <i class="fas fa-hospital me-2"></i> Master Indikator Ruang
        </button>
      </li>
    </ul>

    <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
      <div class="card-header bg-primary border-0 py-3 px-4">
        <div class="d-flex flex-wrap flex-lg-nowrap gap-3 align-items-center justify-content-between">
          <!-- Search & Filters Group -->
          <div class="d-flex flex-wrap flex-lg-nowrap flex-grow-1 gap-2 align-items-center">
            <!-- Search -->
            <div class="input-group shadow-sm rounded-3 overflow-hidden border action-item bg-white search-group">
              <span class="input-group-text bg-white border-0 pe-1 ps-3">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-0 ps-2 py-0" 
                placeholder="Cari indikator, PJ, atau kategori..."
                v-model="filters.keyword"
                @keyup.enter="refreshData"
              >
            </div>

            <!-- Filter Kategori (Only for Utama) -->
            <select 
              v-if="activeTab === 'utama'"
              class="form-select border shadow-sm rounded-3 action-item bg-white custom-select filter-select" 
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
              class="form-select border shadow-sm rounded-3 action-item bg-white custom-select filter-select-unit" 
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
              class="form-select border shadow-sm rounded-3 action-item bg-white custom-select filter-select-status" 
              v-model="filters.status"
              @change="refreshData"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="2">Non-Aktif</option>
            </select>
          </div>

          <!-- Action Button Group -->
          <div class="mt-2 mt-lg-0">
            <button 
              class="btn btn-add-gradient w-100 w-lg-auto px-4 rounded-3 shadow-sm fw-bold action-item"
              @click="openCreateModal"
            >
              <i class="fas fa-plus me-2"></i> Tambah Indikator
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
import { ref, reactive, onMounted } from 'vue'
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
    refreshData()
})

// Watch filters.keyword with debounce if needed, currently on Enter key
</script>

<style scoped>
.container-fluid {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.nav-pills {
    padding: 0.5rem;
}

.nav-pills .nav-link {
    color: #6c757d;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.nav-pills .nav-link.active {
    background-color: var(--bs-primary);
    color: white;
    box-shadow: 0 4px 15px rgba(var(--bs-primary-rgb), 0.25);
}

.nav-pills .nav-link:hover:not(.active) {
    background-color: #f1f3f5;
    color: #495057;
}

.action-item {
    height: 42px !important;
    margin: 0 !important;
    display: flex;
    align-items: center;
}

.action-item .form-control {
    height: 100% !important;
    border: none !important;
    box-shadow: none !important;
    padding-top: 0;
    padding-bottom: 0;
}

.custom-select {
    cursor: pointer;
    background-position: right 0.75rem center;
    background-size: 12px 10px;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    height: 42px !important;
}

.custom-select:focus {
    border-color: #fff !important;
    box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.2) !important;
}

.search-group {
    width: 100%;
    max-width: 400px;
}

.filter-select {
    width: 280px;
}

.filter-select-unit {
    width: 350px;
}

.filter-select-status {
    width: 160px;
}

.btn-add-gradient {
    height: 42px !important;
    background: linear-gradient(45deg, #28a745, #20c997);
    border: none;
    color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    margin: 0;
}

.btn-add-gradient:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4) !important;
    color: white;
    filter: brightness(1.1);
}

.btn-add-gradient:active {
    transform: translateY(0) scale(0.98);
}

.rounded-4 {
    border-radius: 1rem !important;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .container-fluid {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    
    .nav-pills {
        width: 100%;
        display: flex !important;
    }
    
    .nav-pills .nav-item {
        flex: 1;
    }
    
    .nav-pills .nav-link {
        width: 100%;
        text-align: center;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
    }

    .search-group, .filter-select, .filter-select-unit, .filter-select-status {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 0.5rem !important;
    }

    .card-header {
        padding: 1rem !important;
    }
}
</style>
