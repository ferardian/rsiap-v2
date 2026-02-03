<template>
  <div class="mapping-dokter-wrapper">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title">🩺 Mapping Dokter BPJS VClaim</h1>
        <p class="page-subtitle">Hubungkan Kode Dokter SIMRS dengan Kode DPJP BPJS VClaim</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-premium-add shadow-sm" @click="openAddModal">
          <i class="fas fa-plus me-2"></i>Tambah Mapping
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-4">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100">
          <div class="text-muted small fw-bold mb-1">TOTAL TERMAPPING</div>
          <div class="h3 fw-bold mb-0 text-primary">{{ mappingList.length }}</div>
          <div class="stat-footer mt-2 small text-muted">
            <i class="fas fa-link me-1"></i>Dokter Terhubung
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="card glass-card border-0 shadow-sm overflow-hidden">
      <div class="card-header bg-transparent border-0 p-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="mb-0 fw-bold">Daftar Mapping Dokter</h5>
          <div class="search-box position-relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control form-control-sm ps-5 rounded-pill border-light background-soft" 
              placeholder="Cari Nama / Kode Dokter..."
            >
            <i class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light-soft text-muted small text-uppercase">
            <tr>
              <th class="ps-3" style="width: 50px;">NO</th>
              <th>DOKTER SIMRS</th>
              <th>KODE DOKTER BPJS</th>
              <th>NAMA DOKTER BPJS</th>
              <th class="text-center" style="width: 100px;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredMapping" :key="item.kd_dokter">
              <td class="ps-3 text-muted">{{ index + 1 }}</td>
              <td>
                <div class="fw-bold text-dark">{{ item.dokter?.nm_dokter || 'N/A' }}</div>
                <div class="small text-muted font-monospace">{{ item.kd_dokter }}</div>
              </td>
              <td>
                <span class="badge bg-soft-primary text-primary px-3 py-2 rounded-pill font-monospace">
                  {{ item.kd_dokter_bpjs }}
                </span>
              </td>
              <td>
                <div class="text-dark">{{ item.nm_dokter_bpjs }}</div>
              </td>
              <td class="text-center pe-3">
                <div class="d-flex justify-content-center gap-2">
                   <button class="btn btn-sm btn-light-danger rounded-circle action-btn" @click="confirmDelete(item)" title="Hapus Mapping">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredMapping.length === 0">
              <td colspan="5" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-user-md-slash fa-3x text-light-soft mb-3"></i>
                  <h6 class="text-muted">Tidak ada data mapping ditemukan</h6>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Mapping -->
    <div class="modal fade" id="mappingModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
          <div class="modal-header bg-primary text-white p-4 border-0">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-link me-2"></i> Mapping Dokter Baru
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-light-soft">
            <div class="row g-4">
              <!-- Bagian SIMRS -->
              <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm" style="border-radius: 15px;">
                  <div class="card-body p-4">
                    <h6 class="fw-bold mb-3 text-primary">
                      <i class="fas fa-hospital me-2"></i>Data Dokter SIMRS
                    </h6>
                    <div class="mb-3">
                      <label class="small-label mb-2 d-block text-muted">Pilih Dokter Lokal</label>
                      <div class="position-relative">
                        <input 
                          v-model="localSearch" 
                          type="text" 
                          class="form-control rounded-pill ps-4" 
                          placeholder="Cari nama dokter..."
                          @input="debounceLocalSearch"
                        >
                        <i class="fas fa-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>

                        <!-- Local Results Dropdown -->
                        <div v-if="localResults.length > 0" class="search-results shadow-sm mt-1 rounded-3">
                          <div 
                            v-for="doc in localResults" 
                            :key="doc.kd_dokter" 
                            class="search-item p-2 border-bottom cursor-pointer"
                            @click="selectLocalDokter(doc)"
                          >
                            <div class="fw-bold small">{{ doc.nm_dokter }}</div>
                            <div class="text-muted" style="font-size: 10px;">{{ doc.kd_dokter }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="selectedLocal" class="selected-box p-3 rounded-3 mt-3 bg-soft-primary border border-primary-soft">
                      <div class="d-flex align-items-center">
                        <div class="avatar-circle bg-primary text-white me-3">
                          <i class="fas fa-user-md"></i>
                        </div>
                        <div>
                          <div class="fw-bold small">{{ selectedLocal.nm_dokter }}</div>
                          <div class="text-muted small">{{ selectedLocal.kd_dokter }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bagian BPJS -->
              <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm" style="border-radius: 15px;">
                  <div class="card-body p-4">
                    <h6 class="fw-bold mb-3 text-success">
                      <i class="fas fa-network-wired me-2"></i>Data DPJP VClaim
                    </h6>
                    
                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <label class="small-label mb-1 text-muted">Pelayanan</label>
                        <select v-model="bpjsParams.pelayanan" class="form-select form-select-sm rounded-pill">
                          <option value="1">Rawat Inap</option>
                          <option value="2">Rawat Jalan</option>
                        </select>
                      </div>
                      <div class="col-6">
                        <label class="small-label mb-1 text-muted">Tgl Pelayanan</label>
                        <input v-model="bpjsParams.tgl" type="date" class="form-control form-control-sm rounded-pill">
                      </div>
                      <div class="col-12 mt-2">
                        <label class="small-label mb-1 text-muted">Spesialis (Kode)</label>
                        <div class="input-group input-group-sm">
                          <input v-model="bpjsParams.spesialis" type="text" class="form-control rounded-s-pill" placeholder="Contoh: ANA">
                          <button class="btn btn-success rounded-e-pill px-3" @click="fetchRefDokter" :disabled="fetchingBPJS">
                            <i class="fas" :class="fetchingBPJS ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="ref-results mt-3 overflow-auto" style="max-height: 200px;">
                      <div v-if="refBpjsList.length > 0">
                        <label class="small-label mb-2 d-block text-muted">Pilih Dokter BPJS</label>
                        <div 
                          v-for="ref in refBpjsList" 
                          :key="ref.kode" 
                          class="ref-item p-2 mb-2 rounded-3 border-start border-4 border-success bg-light hover-shadow cursor-pointer"
                          :class="{'selected-ref': selectedBpjs?.kode === ref.kode}"
                          @click="selectedBpjs = ref"
                        >
                          <div class="fw-bold small">{{ ref.nama }}</div>
                          <div class="text-muted" style="font-size: 10px;">KODE: {{ ref.kode }}</div>
                        </div>
                      </div>
                      <div v-else-if="!fetchingBPJS" class="text-center py-4 text-muted small">
                         Cari referensi dokter berdasarkan spesialis
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light p-4 border-0">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button 
              type="button" 
              class="btn btn-primary rounded-pill px-4 shadow" 
              @click="saveMapping" 
              :disabled="!selectedLocal || !selectedBpjs || saving"
            >
              <i class="fas fa-save me-2"></i> {{ saving ? 'Menyimpan...' : 'Simpan Mapping' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { Modal } from 'bootstrap'
import bpjsVclaimService from '../../services/bpjsVclaimService'
import dokterService from '../../services/dokterService'
import { showToast } from '../../utils/notification'
import Swal from 'sweetalert2'

const modalRef = ref(null)
let mappingModal = null

const mappingList = ref([])
const searchQuery = ref('')
const loading = ref(false)

// Mapping Modal States
const localSearch = ref('')
const localResults = ref([])
const selectedLocal = ref(null)

const bpjsParams = reactive({
  pelayanan: '2',
  tgl: new Date().toISOString().split('T')[0],
  spesialis: ''
})
const refBpjsList = ref([])
const selectedBpjs = ref(null)
const fetchingBPJS = ref(false)
const saving = ref(false)

// Lifecycle
onMounted(() => {
  fetchMappings()
  mappingModal = new Modal(modalRef.value)
})

// Methods
const fetchMappings = async () => {
  loading.value = true
  try {
    const res = await bpjsVclaimService.getMappingDokter()
    if (res.data.metadata.code === 200) {
      mappingList.value = res.data.response
    }
  } catch (error) {
    console.error(error)
    showToast('Gagal memuat data mapping', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  // Reset states
  localSearch.value = ''
  localResults.value = []
  selectedLocal.value = null
  selectedBpjs.value = null
  refBpjsList.value = []
  mappingModal.show()
}

const debounceLocalSearch = () => {
  clearTimeout(debounceLocalSearch.timer)
  debounceLocalSearch.timer = setTimeout(() => {
    searchLocalDokter()
  }, 400)
}

const searchLocalDokter = async () => {
  if (localSearch.value.length < 2) {
    localResults.value = []
    return
  }
  try {
    const res = await dokterService.searchDokter(localSearch.value)
    localResults.value = res.data.data || []
  } catch (error) {
    console.error(error)
  }
}

const selectLocalDokter = (doc) => {
  selectedLocal.value = doc
  localSearch.value = ''
  localResults.value = []
}

const fetchRefDokter = async () => {
  if (!bpjsParams.spesialis) {
    showToast('Masukkan kode spesialis', 'warning')
    return
  }
  
  fetchingBPJS.value = true
  try {
    const res = await bpjsVclaimService.getRefDokter(bpjsParams)
    if (res.data.metaData.code === '200') {
      refBpjsList.value = res.data.response.list || []
    } else {
      showToast(res.data.metaData.message, 'info')
      refBpjsList.value = []
    }
  } catch (error) {
    console.error(error)
    showToast('Gagal mengambil referensi dari BPJS', 'error')
  } finally {
    fetchingBPJS.value = false
  }
}

const saveMapping = async () => {
  saving.value = true
  try {
    const data = {
      kd_dokter: selectedLocal.value.kd_dokter,
      kd_dokter_bpjs: selectedBpjs.value.kode,
      nm_dokter_bpjs: selectedBpjs.value.nama
    }
    const res = await bpjsVclaimService.storeMapping(data)
    if (res.data.metadata.code === 200) {
      showToast('Mapping berhasil disimpan', 'success')
      mappingModal.hide()
      fetchMappings()
    }
  } catch (error) {
    console.error(error)
    showToast('Gagal menyimpan mapping', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Hapus Mapping?',
    text: `Hapus mapping untuk ${item.dokter?.nm_dokter}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    background: '#fff',
    borderRadius: '15px'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await bpjsVclaimService.deleteMapping(item.kd_dokter)
        if (res.data.metadata.code === 200) {
          showToast('Mapping terhapus', 'success')
          fetchMappings()
        }
      } catch (error) {
        showToast('Gagal menghapus mapping', 'error')
      }
    }
  })
}

// Computed
const filteredMapping = computed(() => {
  if (!searchQuery.value) return mappingList.value
  const q = searchQuery.value.toLowerCase()
  return mappingList.value.filter(item => 
    item.dokter?.nm_dokter.toLowerCase().includes(q) ||
    item.kd_dokter.toLowerCase().includes(q) ||
    item.nm_dokter_bpjs.toLowerCase().includes(q) ||
    item.kd_dokter_bpjs.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
.mapping-dokter-wrapper {
  padding: 1rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 1.25rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.btn-premium-add {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-premium-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
  color: white;
}

.background-soft {
  background-color: #f8fafc;
}

.bg-light-soft {
  background-color: #f1f5f9;
}

.bg-soft-primary {
  background-color: rgba(37, 99, 235, 0.08);
}

.primary-soft {
  border-color: rgba(37, 99, 235, 0.2);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-light-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
}

.btn-light-danger:hover {
  background-color: #ef4444;
  color: white;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 2000;
  background: white;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.search-item:hover {
  background-color: #f8fafc;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-shadow:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-color: #10b981 !important;
}

.selected-ref {
  background-color: #d1fae5 !important;
  border-color: #10b981 !important;
}

.rounded-s-pill {
  border-top-left-radius: 50rem !important;
  border-bottom-left-radius: 50rem !important;
}

.rounded-e-pill {
  border-top-right-radius: 50rem !important;
  border-bottom-right-radius: 50rem !important;
}

.font-monospace {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.ref-item {
  transition: all 0.2s ease;
}
</style>
