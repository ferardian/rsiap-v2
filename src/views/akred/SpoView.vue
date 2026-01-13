<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4" v-if="mode === 'manage'">
      <div class="col-md-6">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-file-medical me-2"></i>Manajemen SPO
        </h3>
        <p class="text-muted mb-0">Standar Prosedur Operasional Rumah Sakit</p>
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center">
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="fas fa-plus me-2"></i>Tambah SPO
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small">Cari</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="filters.search"
              placeholder="Nomor, Judul..."
              @input="debouncedSearch"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small">Status</label>
            <select class="form-select" v-model="filters.status">
              <option value="">Semua</option>
              <option value="pengajuan">Pengajuan</option>
              <option value="disetujui">Disetujui</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Jenis</label>
            <select class="form-select" v-model="filters.jenis">
              <option value="">Semua</option>
              <option value="medis">Medis</option>
              <option value="penunjang">Penunjang</option>
              <option value="umum">Umum</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small">Unit</label>
            <v-select
              :options="departments"
              label="nama_ruang"
              v-model="filters.unit"
              :reduce="dept => dept.dep_id"
              placeholder="Pilih Unit..."
              appendToBody
              :calculatePosition="withPopper"
            />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="fas fa-redo me-2"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="spoList.length === 0" class="text-center py-5 text-muted">
          <i class="fas fa-folder-open fa-3x mb-3 opacity-50"></i>
          <p class="mb-0">Tidak ada data SPO</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th width="5%">#</th>
                <th width="15%">Nomor</th>
                <th width="30%">Judul</th>
                <th width="10%">Jenis</th>
                <th width="15%">Unit</th>
                <th width="10%">Status</th>
                <th width="10%">Tgl Terbit</th>
                <th width="5%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in spoList" :key="item.id">
                <td>{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
                <td>
                  <span class="badge bg-secondary">{{ item.nomor || '-' }}</span>
                </td>
                <td>{{ item.judul }}</td>
                <td>
                  <span class="badge" :class="getJenisBadge(item.jenis)">
                    {{ item.jenis }}
                  </span>
                </td>
                <td>
                  <small>{{ item.unit?.nama || '-' }}</small>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadge(item.status)">
                    {{ item.status }}
                  </span>
                </td>
                <td>{{ formatDate(item.tgl_terbit) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-info" 
                      @click="previewSpo(item)"
                      title="Preview"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <!-- Approve Button -->
                    <button 
                      v-if="mode === 'approval'"
                      class="btn btn-outline-success" 
                      @click="approveSpo(item)"
                      title="Setujui"
                    >
                      <i class="fas fa-check"></i>
                    </button>

                    <button 
                      v-if="mode === 'manage'"
                      class="btn btn-outline-primary" 
                      @click="editSpo(item)"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="mode === 'manage'"
                      class="btn btn-outline-danger" 
                      @click="confirmDelete(item)"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
          <div class="text-muted small">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" @click="changePage(pagination.current_page - 1)">Previous</a>
              </li>
              <li 
                v-for="page in paginationPages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === pagination.current_page }"
              >
                <a class="page-link" @click="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" @click="changePage(pagination.current_page + 1)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <SpoFormModal
      v-model="showFormModal"
      :spo-data="selectedSpo"
      :departments="departments"
      @saved="handleSave"
    />

    <!-- Modal Preview -->
    <SpoPreviewModal
      v-model="showPreviewModal"
      :spo-data="previewSpoData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { createPopper } from '@popperjs/core'
import spoService from '@/services/spoService'
import SpoFormModal from '@/components/spo/SpoFormModal.vue'
import SpoPreviewModal from '@/components/spo/SpoPreviewModal.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'manage' // 'manage' | 'approval'
  }
})

const withPopper = (dropdownList, component, { width }) => {
  dropdownList.style.width = width
  const popper = createPopper(component.$refs.toggle, dropdownList, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, -1] }
      },
      {
        name: 'toggleClass',
        enabled: true,
        phase: 'write',
        fn({ state }) {
          component.$el.classList.toggle('drop-up', state.placement === 'top')
        }
      }
    ]
  })
  return () => popper.destroy()
}

const toast = useToast()
const loading = ref(false)
const spoList = ref([])
const departments = ref([])
const showFormModal = ref(false)
const selectedSpo = ref(null)
const showPreviewModal = ref(false)
const previewSpoData = ref(null)

const filters = reactive({
  search: '',
  status: '',
  jenis: '',
  unit: null,
  page: 1
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0
})

// Computed pagination pages
const paginationPages = computed(() => {
  const pages = []
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  
  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Fetch SPO list
const fetchSpo = async () => {
  loading.value = true
  try {
    const params = {
      page: filters.page,
      limit: pagination.value.per_page,
      include: 'unit,direktur'
    }
    
    // Correct search param for Orion (global search)
    if (filters.search) params.search = filters.search
    
    if (filters.status) params.filter = { ...params.filter, status: filters.status }
    if (filters.jenis) params.filter = { ...params.filter, jenis: filters.jenis }
    if (filters.unit) params.filter = { ...params.filter, unit_id: filters.unit }
    
    // Log for debugging
    console.log('Fetching SPO with params:', params)
    
    const response = await spoService.getSpo(params)
    spoList.value = response.data.data
    
    // ... rest of function ...
    
    // Update pagination
    pagination.value = {
      current_page: response.data.meta.current_page,
      last_page: response.data.meta.last_page,
      per_page: response.data.meta.per_page,
      total: response.data.meta.total,
      from: response.data.meta.from,
      to: response.data.meta.to
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat data SPO')
  } finally {
    loading.value = false
  }
}

// Fetch departments
const fetchDepartments = async () => {
  try {
    const response = await spoService.getUnits()
    departments.value = response.data.data
  } catch (error) {
    console.error(error)
  }
}

const approveSpo = async (item) => {
  if (!confirm(`Apakah Anda yakin ingin menyetujui SPO: ${item.judul}?`)) return
  
  loading.value = true
  try {
    await spoService.updateSpo(item.id, { 
      id: item.id,
      judul: item.judul, 
      unit_id: item.unit_id,
      jenis: item.jenis,
      status: 'disetujui' 
    })
    
    toast.success('SPO berhasil disetujui')
    fetchSpo()
  } catch (error) {
    console.error(error)
    toast.error('Gagal menyetujui SPO')
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    fetchSpo()
  }, 500)
}

// Change page
const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return
  filters.page = page
  fetchSpo()
}

// Reset filters
const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.jenis = ''
  filters.unit = null
  filters.page = 1
  fetchSpo()
}

// Helper functions
const getStatusBadge = (status) => {
  return status === 'disetujui' ? 'bg-success' : 'bg-warning'
}

const getJenisBadge = (jenis) => {
  const badges = {
    medis: 'bg-primary',
    penunjang: 'bg-info',
    umum: 'bg-secondary'
  }
  return badges[jenis] || 'bg-secondary'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Modal actions
const openCreateModal = () => {
  selectedSpo.value = null
  showFormModal.value = true
}

const editSpo = async (item) => {
  try {
    // Fetch full SPO data with units
    const response = await spoService.getSpoById(item.id, { include: 'units,units.unit,unit,direktur' })
    selectedSpo.value = response.data.data
    showFormModal.value = true
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat data SPO')
  }
}

const handleSave = async (formData) => {
  try {
    if (formData.id) {
      // Update
      await spoService.updateSpo(formData.id, formData)
      toast.success('SPO berhasil diperbarui')
    } else {
      // Create
      await spoService.createSpo(formData)
      toast.success('SPO berhasil ditambahkan')
    }
    
    showFormModal.value = false
    selectedSpo.value = null
    fetchSpo()
  } catch (error) {
    console.error(error)
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan SPO'
    toast.error(errorMsg)
  }
}

const previewSpo = async (item) => {
  try {
    // Fetch full SPO data with all relations
    const response = await spoService.getSpoById(item.id, { include: 'units,units.unit,unit,direktur' })
    previewSpoData.value = response.data.data
    showPreviewModal.value = true
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat data SPO')
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Yakin ingin menghapus SPO "${item.judul}"?`)) return
  
  try {
    await spoService.deleteSpo(item.id)
    toast.success('SPO berhasil dihapus')
    fetchSpo()
  } catch (error) {
    console.error(error)
    toast.error('Gagal menghapus SPO')
  }
}

// Watch specific filters
watch(
  () => [filters.status, filters.jenis, filters.unit],
  () => {
    filters.page = 1
    fetchSpo()
  }
)

onMounted(() => {
  fetchSpo()
  fetchDepartments()
})
</script>

<style scoped>
.table th {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.page-link {
  cursor: pointer;
}
</style>
