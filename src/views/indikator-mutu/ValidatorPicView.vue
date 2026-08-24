<template>
  <div class="validator-pic-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-users-cog"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Manajemen PIC & Validator</h3>
            <p class="page-subtitle mb-0 small">Petakan penanggung jawab (PIC) dan validator data indikator mutu per unit</p>
          </div>
        </div>
        <div>
          <button class="btn btn-primary-custom rounded-pill shadow-sm px-4" @click="openCreateModal">
            <i class="fas fa-plus me-2"></i> Tambah Mapping
          </button>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <!-- Search & Filters -->
      <div class="card-header bg-white border-0 p-3 p-md-4">
        <div class="row align-items-center">
          <div class="col-md-6 col-lg-4">
            <div class="search-wrapper input-group modern-input-group shadow-sm overflow-hidden rounded-pill">
              <span class="input-group-text bg-white border-0 ps-3">
                <i class="fas fa-search text-muted opacity-50"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-0 py-2 ps-2 text-input" 
                placeholder="Cari unit, nama NIK PIC/Validator..."
                v-model="searchQuery"
              >
              <button v-if="searchQuery" class="btn bg-transparent border-0 text-muted" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th class="ps-4" style="width: 80px;">No</th>
                <th style="min-width: 200px;">Unit / Departemen</th>
                <th style="min-width: 250px;">PIC Penginput</th>
                <th style="min-width: 250px;">Validator/Penanggung Jawab</th>
                <th class="text-center" style="width: 150px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5 text-muted">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  Memuat data mapping...
                </td>
              </tr>
              <!-- Empty State -->
              <tr v-else-if="filteredMappings.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 opacity-30 d-block"></i>
                  Tidak ada data mapping PIC & Validator ditemukan.
                </td>
              </tr>
              <!-- Row Item -->
              <tr v-else v-for="(item, idx) in filteredMappings" :key="item.dep_id">
                <td class="ps-4 fw-bold text-muted">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nama_ruang }}</div>
                </td>
                <td>
                  <div v-if="item.nik_pic" class="d-flex align-items-center">
                    <div class="avatar-initial me-3 bg-primary-light text-primary">
                      {{ item.nama_pic?.charAt(0) || 'P' }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ item.nama_pic }}</div>
                      <div class="d-flex align-items-center flex-wrap gap-1 mt-0.5">
                        <span class="text-muted small font-monospace me-1">{{ item.nik_pic }}</span>
                        <span v-if="item.jbtn_pic" class="badge bg-light text-primary border border-primary-subtle fw-normal px-2 py-0.5 small rounded-pill">
                          <i class="fas fa-briefcase me-1 opacity-75"></i>{{ item.jbtn_pic }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted small italic-placeholder">
                    <i class="fas fa-minus-circle me-1 opacity-50"></i> Belum ada PIC
                  </div>
                </td>
                <td>
                  <div v-if="item.nik_validator" class="d-flex align-items-center">
                    <div class="avatar-initial me-3 bg-success-light text-success">
                      {{ item.nama_validator?.charAt(0) || 'V' }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ item.nama_validator }}</div>
                      <div class="d-flex align-items-center flex-wrap gap-1 mt-0.5">
                        <span class="text-muted small font-monospace me-1">{{ item.nik_validator }}</span>
                        <span v-if="item.jbtn_validator" class="badge bg-light text-success border border-success-subtle fw-normal px-2 py-0.5 small rounded-pill">
                          <i class="fas fa-user-tie me-1 opacity-75"></i>{{ item.jbtn_validator }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted small italic-placeholder">
                    <i class="fas fa-minus-circle me-1 opacity-50"></i> Belum ada Validator
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-action btn-edit" @click="openEditModal(item)" title="Edit Mapping">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-delete" @click="deleteMapping(item)" title="Hapus Mapping">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div class="modal fade show" v-if="showModal" style="display: block; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 bg-light p-4">
            <h5 class="modal-title fw-bold text-dark">
              <i class="fas" :class="isEditMode ? 'fa-edit text-warning' : 'fa-plus text-primary'"></i> 
              {{ isEditMode ? 'Edit Mapping PIC & Validator' : 'Tambah Mapping Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false" :disabled="saving"></button>
          </div>
          
          <div class="modal-body p-4">
            <form @submit.prevent="saveMapping">
              <!-- Departemen -->
              <div class="mb-4">
                <label class="form-label fw-semibold text-secondary small">Unit / Departemen</label>
                <div class="select-wrapper position-relative">
                  <select 
                    class="form-select modern-select" 
                    v-model="formData.dep_id" 
                    :disabled="isEditMode || saving"
                    required
                  >
                    <option value="" disabled selected>Pilih Unit/Departemen...</option>
                    <option v-for="unit in availableUnits" :key="unit.dep_id" :value="unit.dep_id">
                      {{ unit.nama_ruang }}
                    </option>
                  </select>
                </div>
                <div class="form-text text-muted small mt-1" v-if="isEditMode">
                  Kode unit tidak dapat diubah setelah terdaftar.
                </div>
              </div>

              <!-- PIC Autocomplete -->
              <div class="mb-4 position-relative">
                <label class="form-label fw-semibold text-secondary small">PIC Penginput</label>
                <div class="input-group modern-input-group shadow-sm rounded-3 overflow-hidden">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-user text-muted opacity-50"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control border-start-0 py-2.5 text-input" 
                    placeholder="Ketik nama atau NIK PIC..." 
                    v-model="picSearchQuery"
                    @input="onPicInput"
                    :disabled="saving"
                  >
                  <button 
                    v-if="formData.nik_pic" 
                    type="button" 
                    class="btn bg-white border-start-0 text-danger px-3" 
                    @click="clearPic"
                    :disabled="saving"
                  >
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>

                <!-- Suggestions List -->
                <ul class="suggestions-list shadow-lg rounded-3 border bg-white p-0 m-0 position-absolute w-100" v-if="picSuggestions.length > 0">
                  <li 
                    v-for="p in picSuggestions" 
                    :key="p.nik" 
                    @click="selectPic(p)"
                    class="suggestion-item p-3 border-bottom d-flex align-items-center"
                  >
                    <div class="avatar-initial-sm bg-primary-light text-primary me-3">
                      {{ p.nama.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ p.nama }}</div>
                      <span class="text-muted small font-monospace">{{ p.nik }} — {{ p.jbtn }}</span>
                    </div>
                  </li>
                </ul>
                <div v-if="picLoading" class="position-absolute end-0 bottom-0 mb-3 me-3 spinner-border spinner-border-sm text-primary"></div>
                <div class="form-text text-muted small mt-1">
                  Ketik minimal 2 karakter untuk memunculkan daftar pegawai. Kosongkan jika tidak ada PIC.
                </div>
              </div>

              <!-- Validator Autocomplete -->
              <div class="mb-4 position-relative">
                <label class="form-label fw-semibold text-secondary small">Validator/Penanggung Jawab</label>
                <div class="input-group modern-input-group shadow-sm rounded-3 overflow-hidden">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="fas fa-user-shield text-muted opacity-50"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control border-start-0 py-2.5 text-input" 
                    placeholder="Ketik nama atau NIK Validator..." 
                    v-model="valSearchQuery"
                    @input="onValInput"
                    :disabled="saving"
                  >
                  <button 
                    v-if="formData.nik_validator" 
                    type="button" 
                    class="btn bg-white border-start-0 text-danger px-3" 
                    @click="clearVal"
                    :disabled="saving"
                  >
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>

                <!-- Suggestions List -->
                <ul class="suggestions-list shadow-lg rounded-3 border bg-white p-0 m-0 position-absolute w-100" v-if="valSuggestions.length > 0">
                  <li 
                    v-for="p in valSuggestions" 
                    :key="p.nik" 
                    @click="selectVal(p)"
                    class="suggestion-item p-3 border-bottom d-flex align-items-center"
                  >
                    <div class="avatar-initial-sm bg-success-light text-success me-3">
                      {{ p.nama.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ p.nama }}</div>
                      <span class="text-muted small font-monospace">{{ p.nik }} — {{ p.jbtn }}</span>
                    </div>
                  </li>
                </ul>
                <div v-if="valLoading" class="position-absolute end-0 bottom-0 mb-3 me-3 spinner-border spinner-border-sm text-primary"></div>
                <div class="form-text text-muted small mt-1">
                  Ketik minimal 2 karakter untuk mencari validator. Kosongkan jika tidak ada Validator.
                </div>
              </div>

              <!-- Footer Buttons -->
              <div class="modal-footer border-0 p-0 pt-3 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-white border px-4 py-2 rounded-pill shadow-sm" @click="showModal = false" :disabled="saving">
                  Batal
                </button>
                <button type="submit" class="btn btn-primary-custom px-4 py-2 rounded-pill shadow-sm" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                  {{ saving ? 'Menyimpan...' : 'Simpan Mapping' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import service from '@/services/indikatorMutuService'
import { pegawaiService } from '@/services/pegawaiService'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const mappings = ref([])
const units = ref([])
const searchQuery = ref('')

// Form Modal State
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formData = ref({
  dep_id: '',
  nik_pic: '',
  nik_validator: ''
})

// Autocomplete State
const picSearchQuery = ref('')
const picSuggestions = ref([])
const picLoading = ref(false)
const selectedPicName = ref('')

const valSearchQuery = ref('')
const valSuggestions = ref([])
const valLoading = ref(false)
const selectedValName = ref('')

// Fetch mappings from database
const fetchMappings = async () => {
  loading.value = true
  try {
    const res = await service.getPicValidators()
    if (res.data && res.data.success) {
      mappings.value = res.data.data
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      title: 'Error',
      text: 'Gagal memuat data mapping PIC & Validator',
      icon: 'error',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    loading.value = false
  }
}

// Fetch all available units/committees
const fetchUnits = async () => {
  try {
    const res = await service.getUnits()
    if (res.data && res.data.success) {
      units.value = res.data.data
    }
  } catch (error) {
    console.error('Gagal mengambil list unit:', error)
  }
}

// Autocomplete PIC Pegawai
const searchPicPegawai = async () => {
  if (picSearchQuery.value.length < 2) {
    picSuggestions.value = []
    return
  }
  picLoading.value = true
  try {
    const res = await pegawaiService.searchPegawai(picSearchQuery.value)
    if (res.data && res.data.success) {
      picSuggestions.value = res.data.data
    }
  } catch (error) {
    console.error('Error mencari pegawai PIC:', error)
  } finally {
    picLoading.value = false
  }
}

const selectPic = (pegawai) => {
  formData.value.nik_pic = pegawai.nik
  selectedPicName.value = pegawai.nama
  picSearchQuery.value = `${pegawai.nama} (${pegawai.nik})`
  picSuggestions.value = []
}

const clearPic = () => {
  formData.value.nik_pic = ''
  selectedPicName.value = ''
  picSearchQuery.value = ''
  picSuggestions.value = []
}

let picTimeout = null
const onPicInput = () => {
  clearTimeout(picTimeout)
  if (!picSearchQuery.value) {
    clearPic()
    return
  }
  picTimeout = setTimeout(() => {
    searchPicPegawai()
  }, 300)
}

// Autocomplete Validator Pegawai
const searchValPegawai = async () => {
  if (valSearchQuery.value.length < 2) {
    valSuggestions.value = []
    return
  }
  valLoading.value = true
  try {
    const res = await pegawaiService.searchPegawai(valSearchQuery.value)
    if (res.data && res.data.success) {
      valSuggestions.value = res.data.data
    }
  } catch (error) {
    console.error('Error mencari pegawai Validator:', error)
  } finally {
    valLoading.value = false
  }
}

const selectVal = (pegawai) => {
  formData.value.nik_validator = pegawai.nik
  selectedValName.value = pegawai.nama
  valSearchQuery.value = `${pegawai.nama} (${pegawai.nik})`
  valSuggestions.value = []
}

const clearVal = () => {
  formData.value.nik_validator = ''
  selectedValName.value = ''
  valSearchQuery.value = ''
  valSuggestions.value = []
}

let valTimeout = null
const onValInput = () => {
  clearTimeout(valTimeout)
  if (!valSearchQuery.value) {
    clearVal()
    return
  }
  valTimeout = setTimeout(() => {
    searchValPegawai()
  }, 300)
}

// Open modals
const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    dep_id: '',
    nik_pic: '',
    nik_validator: ''
  }
  clearPic()
  clearVal()
  showModal.value = true
}

const openEditModal = (mapping) => {
  isEditMode.value = true
  formData.value = {
    dep_id: mapping.dep_id,
    nik_pic: mapping.nik_pic || '',
    nik_validator: mapping.nik_validator || ''
  }
  if (mapping.nik_pic) {
    selectedPicName.value = mapping.nama_pic
    picSearchQuery.value = `${mapping.nama_pic} (${mapping.nik_pic})`
  } else {
    clearPic()
  }
  if (mapping.nik_validator) {
    selectedValName.value = mapping.nama_validator
    valSearchQuery.value = `${mapping.nama_validator} (${mapping.nik_validator})`
  } else {
    clearVal()
  }
  showModal.value = true
}

// Save or Update Mapping
const saveMapping = async () => {
  if (!formData.value.dep_id) {
    Swal.fire({
      title: 'Peringatan',
      text: 'Unit / Departemen harus dipilih',
      icon: 'warning',
      confirmButtonColor: '#f59e0b'
    })
    return
  }
  saving.value = true
  try {
    let res
    if (isEditMode.value) {
      res = await service.updatePicValidator(formData.value.dep_id, {
        nik_pic: formData.value.nik_pic || null,
        nik_validator: formData.value.nik_validator || null
      })
    } else {
      res = await service.createPicValidator({
        dep_id: formData.value.dep_id,
        nik_pic: formData.value.nik_pic || null,
        nik_validator: formData.value.nik_validator || null
      })
    }
    
    if (res.data && res.data.success) {
      Swal.fire({
        title: 'Sukses',
        text: res.data.message || 'Data berhasil disimpan',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      showModal.value = false
      fetchMappings()
    } else {
      Swal.fire({
        title: 'Gagal',
        text: res.data.message || 'Gagal menyimpan data',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  } catch (error) {
    console.error(error)
    const errorMsg = error.response?.data?.message || 'Gagal memproses data'
    const errors = error.response?.data?.errors
    let details = ''
    if (errors) {
      details = '\n' + Object.values(errors).flat().join('\n')
    }
    Swal.fire({
      title: 'Error',
      text: errorMsg + details,
      icon: 'error',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    saving.value = false
  }
}

// Delete Mapping
const deleteMapping = async (mapping) => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Hapus mapping PIC & Validator untuk unit ${mapping.nama_ruang}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    loading.value = true
    try {
      const res = await service.deletePicValidator(mapping.dep_id)
      if (res.data && res.data.success) {
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data mapping berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        })
        fetchMappings()
      } else {
        Swal.fire({
          title: 'Gagal',
          text: res.data.message || 'Gagal menghapus data',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        })
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Gagal menghapus data',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      loading.value = false
    }
  }
}

// Computed mappings search filter
const filteredMappings = computed(() => {
  if (!searchQuery.value) return mappings.value
  const query = searchQuery.value.toLowerCase()
  return mappings.value.filter(map => 
    map.dep_id.toLowerCase().includes(query) ||
    map.nama_ruang.toLowerCase().includes(query) ||
    (map.nama_pic && map.nama_pic.toLowerCase().includes(query)) ||
    (map.nik_pic && map.nik_pic.toLowerCase().includes(query)) ||
    (map.jbtn_pic && map.jbtn_pic.toLowerCase().includes(query)) ||
    (map.nama_validator && map.nama_validator.toLowerCase().includes(query)) ||
    (map.nik_validator && map.nik_validator.toLowerCase().includes(query)) ||
    (map.jbtn_validator && map.jbtn_validator.toLowerCase().includes(query))
  )
})

// Filter out units that are already mapped when in create mode to avoid duplicate key validation error
const availableUnits = computed(() => {
  if (isEditMode.value) return units.value
  const mappedIds = mappings.value.map(m => m.dep_id)
  return units.value.filter(u => !mappedIds.includes(u.dep_id))
})

onMounted(() => {
  fetchMappings()
  fetchUnits()
})
</script>

<style scoped>
.validator-pic-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  border-left: 5px solid #3b82f6;
  padding-left: 1rem;
}

.header-icon-bg {
  width: 46px;
  height: 46px;
  background-color: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 1.25rem;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.85rem;
}

/* Custom Buttons */
.btn-primary-custom {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.65rem 1.25rem;
  transition: all 0.25s ease;
}

.btn-primary-custom:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  color: white;
  opacity: 0.95;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  padding: 0;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-edit {
  background-color: #fef3c7;
  color: #d97706;
}

.btn-edit:hover {
  background-color: #fde68a;
  transform: scale(1.05);
}

.btn-delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background-color: #fecaca;
  transform: scale(1.05);
}

/* Search Box */
.modern-input-group {
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.modern-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.text-input:focus {
  box-shadow: none !important;
}

/* Custom Table */
.custom-table th {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.775rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  border-bottom: 2px solid #e2e8f0;
  padding: 1rem;
}

.custom-table td {
  padding: 1.15rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

/* Avatar Initials */
.avatar-initial {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.avatar-initial-sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.bg-primary-light {
  background-color: #eff6ff !important;
}

.bg-success-light {
  background-color: #f0fdf4 !important;
}

.italic-placeholder {
  font-style: italic;
  opacity: 0.8;
}

/* Suggestions Autocomplete */
.suggestions-list {
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
  border-color: #cbd5e1;
}

.suggestion-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover {
  background-color: #f8fafc;
}

.suggestion-item:last-child {
  border-bottom: none !important;
}

/* Modern Select input */
.modern-select {
  border: 1px solid #e2e8f0;
  padding: 0.65rem 1rem;
  border-radius: 8px;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
