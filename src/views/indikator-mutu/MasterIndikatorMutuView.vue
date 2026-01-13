<template>
  <div class="container-fluid p-0">
    <div class="row mb-4">
      <div class="col-md-6">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-database me-2"></i>Master Indikator Mutu
        </h3>
        <p class="text-muted mb-0">Kelola master data indikator mutu utama dan ruangan</p>
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
         <div class="input-group" style="max-width: 300px;">
          <span class="input-group-text bg-white border-end-0">
            <i class="fas fa-search text-muted"></i>
          </span>
          <input 
            type="text" 
            class="form-control border-start-0 ps-0" 
            :placeholder="activeTab === 'utama' ? 'Cari Inmut Utama...' : 'Cari Inmut Ruang...'"
            v-model="filters.keyword"
            @keyup.enter="refreshData"
          >
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="fas fa-plus me-1"></i> Tambah
        </button>
      </div>
    </div>

    <!-- Tabs Header -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'utama' }" href="#" @click.prevent="switchTab('utama')">
            <i class="fas fa-star me-1"></i> Master Utama
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'ruang' }" href="#" @click.prevent="switchTab('ruang')">
            <i class="fas fa-hospital-alt me-1"></i> Master Indikator Ruang
        </a>
      </li>
    </ul>

    <!-- Tab Content -->
    <div v-show="activeTab === 'utama'">
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
        />
    </div>

    <div v-show="activeTab === 'ruang'">
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
        />
    </div>

    <!-- Modals -->
    <MasterUtamaForm 
        :visible="showUtamaModal" 
        :initial-data="selectedItem"
        :is-saving="isSaving"
        @close="closeModals"
        @save="handleSaveUtama"
    />

    <MasterRuangForm 
        :visible="showRuangModal" 
        :initial-data="selectedItem"
        :is-saving="isSaving"
        @close="closeModals"
        @save="handleSaveRuang"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import api from '@/services/indikatorMutuService'

import MasterUtamaTable from '@/components/indikator-mutu/MasterUtamaTable.vue'
import MasterUtamaForm from '@/components/indikator-mutu/MasterUtamaForm.vue'
import MasterRuangTable from '@/components/indikator-mutu/MasterRuangTable.vue'
import MasterRuangForm from '@/components/indikator-mutu/MasterRuangForm.vue'

const toast = useToast()
const activeTab = ref('utama')
const filters = reactive({ keyword: '' })
const isSaving = ref(false)

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
    filters.keyword = '' // Reset filter on tab switch or keep it? user preference. Let's reset to avoid confusion.
    refreshData()
}

const refreshData = () => {
    if (activeTab.value === 'utama') {
        fetchUtama()
    } else {
        fetchRuang()
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

const deleteItem = async (item) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
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
    refreshData()
})

// Watch filters.keyword with debounce if needed, currently on Enter key
</script>
