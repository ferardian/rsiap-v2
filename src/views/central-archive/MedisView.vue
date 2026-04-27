<template>
  <div class="sdi-view medis-view">
    <!-- Hero Header -->
    <div class="hero-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas" :class="activeTab === 'staf' ? 'fa-user-md' : (activeTab === 'kredensial' ? 'fa-id-card-alt' : 'fa-file-medical')"></i>
          </div>
          <div class="title-text">
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageDescription }}</p>
          </div>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas" :class="activeTab === 'staf' ? 'fa-users' : 'fa-folder-open'"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">{{ activeTab === 'staf' ? 'Total Dokter' : 'Total Berkas' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container mb-4">
      <div class="capsule-tabs">
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'standar' }"
          @click="switchTab('standar')"
        >
          <i class="fas fa-file-medical"></i>
          <span>Komite Medis</span>
          <span v-if="pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
        </button>
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'kredensial' }"
          @click="switchTab('kredensial')"
        >
          <i class="fas fa-id-card-alt"></i>
          <span>Kredensial (SPK RKK)</span>
          <span v-if="pendingCountKredensial > 0" class="tab-badge">{{ pendingCountKredensial }}</span>
        </button>
        <button 
          class="tab-item" 
          :class="{ active: activeTab === 'staf' }"
          @click="switchTab('staf')"
        >
          <i class="fas fa-user-md"></i>
          <span>Data Dokter & Medis</span>
        </button>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Search & Filter Left -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="activeTab === 'staf' ? 'Cari nama atau NIK dokter...' : 'Cari berdasarkan Perihal atau PJ...'" 
              @input="handleSearch"
            >
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div v-if="activeTab !== 'staf'" class="filter-box">
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
        </div>

        <!-- Add Button Right -->
        <div class="action-buttons" v-if="activeTab !== 'staf'">
          <button class="btn-primary" :class="{ 'btn-purple': activeTab === 'kredensial' }" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>{{ activeTab === 'kredensial' ? 'Buat Pengajuan' : 'Tambah Berkas' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-modern">
      <div class="table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data...</p>
        </div>

        <table v-else-if="berkasList.length > 0" class="modern-table">
          <thead v-if="activeTab === 'standar'">
            <tr>
              <th width="5%">No</th>
              <th width="20%">Nomor Surat</th>
              <th width="30%">Perihal</th>
              <th width="15%">Tanggal Terbit</th>
              <th width="20%">Penanggung Jawab</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <thead v-else-if="activeTab === 'kredensial'">
            <tr>
              <th width="5%">No</th>
              <th width="15%">Nomor Surat</th>
              <th width="25%">Judul Pengajuan</th>
              <th width="20%">Target Pegawai</th>
              <th width="15%">Bukti Kredensial</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <thead v-else>
            <!-- Data Staf -->
            <tr>
              <th width="5%">No</th>
              <th width="25%">Nama Pegawai</th>
              <th width="20%">Jabatan / Profesi</th>
              <th width="25%">STR / SIP</th>
              <th width="15%">Pendidikan</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in berkasList" :key="index" class="table-row-hover">
              <td class="text-muted">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              
              <!-- Standar Tab Columns -->
              <template v-if="activeTab === 'standar'">
                <td>
                  <div class="badge-nomor">
                    <template v-if="item.status_approval === 'pengajuan' || !item.status_approval">
                      <span class="text-warning"><i class="fas fa-clock me-1"></i> Menunggu Approval</span>
                    </template>
                    <template v-else>
                      {{ formatNomorSurat(item) }}
                    </template>
                  </div>
                </td>
                <td>
                  <div class="fw-medium text-dark">{{ item.perihal }}</div>
                </td>
                <td>
                  <div class="date-calendar-card">
                    <div class="card-header">{{ formatMonthBadge(item.tgl_terbit) }}</div>
                    <div class="card-body">
                      <span class="day">{{ formatDayBadge(item.tgl_terbit) }}</span>
                      <span class="year">{{ formatYearBadge(item.tgl_terbit) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="pj-cell" :title="item.penanggung_jawab?.nama || item.pj">
                    <div class="pj-avatar">{{ getInitials(item.penanggung_jawab?.nama || item.pj) }}</div>
                    <span class="pj-name text-truncate">{{ item.penanggung_jawab?.nama || item.pj }}</span>
                  </div>
                </td>
              </template>

              <!-- Kredensial Tab Columns -->
              <template v-else-if="activeTab === 'kredensial'">
                <td>
                  <div class="badge-nomor">
                    <template v-if="(activeTab === 'standar' || activeTab === 'kredensial') && (item.status_approval === 'pengajuan' || !item.status_approval)">
                      <span class="text-warning"><i class="fas fa-clock me-1"></i> Menunggu Approval</span>
                    </template>
                    <template v-else>
                      {{ formatNomorSurat(item, activeTab === 'kredensial') }}
                    </template>
                  </div>
                </td>
                <td>
                  <div class="fw-medium text-dark">{{ item.judul }}</div>
                  <small class="text-muted d-block mt-1">{{ item.pj_nama }}</small>
                </td>
                <td>
                  <div v-if="item.target_pegawai" class="pj-cell" :title="item.target_pegawai.nama">
                    <div class="pj-avatar bg-purple-light text-purple">{{ getInitials(item.target_pegawai.nama) }}</div>
                    <div class="d-flex flex-column">
                      <span class="pj-name text-truncate">{{ item.target_pegawai.nama }}</span>
                      <small class="text-muted">{{ item.nik }}</small>
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <button class="btn-quick-link" @click="openEditModal(item)" title="Set Pegawai">
                      <i class="fas fa-user-plus mr-1"></i> Set Pegawai
                    </button>
                  </div>
                </td>
                <td>
                   <div class="text-muted">{{ formatDate(item.tgl_terbit) }}</div>
                </td>
                <td>
                  <div v-if="item.bukti_kredensial" class="status-container clickable" @click="openFile(item.bukti_kredensial, 'sk')">
                     <span class="badge bg-success-light text-success">
                        <i class="fas fa-check-circle me-1"></i> Tersedia
                     </span>
                  </div>
                  <div v-else class="text-center">
                    <button class="btn-quick-upload" @click="openUploadKredensialModal(item)" title="Upload Bukti Kredensial">
                      <i class="fas fa-upload me-1"></i> Upload
                    </button>
                  </div>
                </td>
              </template>

              <!-- Staf Tab Columns -->
              <template v-else>
                <td>
                  <div class="pj-cell">
                    <div class="pj-avatar bg-green-light text-green">{{ getInitials(item.nama) }}</div>
                    <div class="d-flex flex-column">
                      <span class="pj-name font-weight-bold">{{ item.nama }}</span>
                      <small class="text-muted">{{ item.nik }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="text-dark small font-weight-medium">{{ item.jbtn || '-' }}</div>
                  <div class="text-muted smaller">{{ item.kategori_profesi || '-' }}</div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <div v-if="item.nomor_str" class="mini-badge bg-blue-light text-blue" title="Nomor STR">
                      <i class="fas fa-id-card mr-1"></i> {{ item.nomor_str }}
                    </div>
                    <div v-if="item.nomor_sip" class="mini-badge bg-orange-light text-orange" title="Nomor SIP">
                      <i class="fas fa-file-medical mr-1"></i> {{ item.nomor_sip }}
                    </div>
                    <div v-if="!item.nomor_str && !item.nomor_sip" class="text-muted italic smaller">Belum ada data STR/SIP</div>
                  </div>
                </td>
                <td>
                  <div class="text-dark small">{{ item.pendidikan || '-' }}</div>
                  <div class="text-muted smaller">{{ item.prodi || '-' }}</div>
                </td>
              </template>

              <!-- Actions -->
              <td>
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openDetailModal(item)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                  <div class="dropdown-more" v-if="activeTab !== 'staf'">
                    <button class="btn-action btn-more" @click="toggleMenu(index)" title="Lainnya">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <!-- Dropdown Menu -->
                    <div v-if="activeMenu === index" class="dropdown-menu-custom">
                      <button class="dropdown-item" @click="openEditModal(item); activeMenu = null">
                        <i class="fas fa-edit text-primary"></i> Edit Berkas
                      </button>
                      <button v-if="activeTab === 'kredensial'" class="dropdown-item" @click="openUploadModal(item); activeMenu = null">
                        <i class="fas fa-upload text-success"></i> Upload File SK
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item text-danger" @click="confirmDelete(item); activeMenu = null">
                        <i class="fas fa-trash"></i> Hapus Berkas
                      </button>
                    </div>
                  </div>
                  <div v-else class="dropdown-more">
                    <!-- Specific Actions for Staf if needed -->
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas" :class="activeTab === 'staf' ? 'fa-user-slash' : 'fa-file-contract'"></i>
          </div>
          <h3>{{ activeTab === 'staf' ? 'Data Dokter Tidak Ditemukan' : 'Pencarian Tidak Ditemukan' }}</h3>
          <p>Belum ada data {{ activeTab === 'staf' ? 'dokter' : 'berkas' }} yang terdaftar atau sesuai kriteria pencarian.</p>
          <button v-if="searchQuery || filterDate" class="btn-outline-primary mt-3" @click="resetFilters">
            <i class="fas fa-sync-alt mr-2"></i>Reset Pencarian
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <div class="pagination-info">
          Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              class="btn-page-number"
              :class="{ active: page === pagination.current_page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="btn-page" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <MedisFormModal 
      :show="showFormModal"
      :is-edit="isEditMode"
      :data="selectedBerkas"
      :is-kredensial="activeTab === 'kredensial'"
      @close="showFormModal = false"
      @saved="handleSaved"
    />

    <MedisDetailModal 
      :show="showDetailModal"
      :data="selectedBerkas"
      :is-kredensial="activeTab === 'kredensial'"
      :is-staf="activeTab === 'staf'"
      @close="showDetailModal = false"
    />

    <SkUploadModal 
       :show="showUploadModal"
       :sk="selectedBerkas"
       @close="showUploadModal = false"
       @uploaded="handleSaved"
    />

    <SkBuktiKredensialUploadModal
      :show="showUploadKredensialModal"
      :sk="selectedBerkas"
      @close="showUploadKredensialModal = false"
      @uploaded="handleSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-icon-header text-danger">
          <div class="icon-circle bg-danger-light">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="modal-body text-center mt-3">
          <h3 class="mb-2">Hapus {{ activeTab === 'kredensial' ? 'Pengajuan' : 'Berkas' }}?</h3>
          <p class="text-muted">
            Anda yakin ingin menghapus {{ activeTab === 'kredensial' ? 'pengajuan' : 'berkas' }} nomor <br>
            <strong>{{ activeTab === 'kredensial' ? selectedBerkas?.no_surat : formatNomorSurat(selectedBerkas) }}</strong>?<br>
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="modal-footer-flex">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-danger" @click="executeDelete" :disabled="deleting">
            <i class="fas fa-trash" v-if="!deleting"></i>
            <span class="spinner-border spinner-border-sm" v-else></span>
            {{ deleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { komiteMedisService } from '@/services/komiteMedisService'
import { skService } from '@/services/skService'
import { pegawaiService } from '@/services/pegawaiService'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

// Import Modals
import MedisFormModal from './components/MedisFormModal.vue'
import MedisDetailModal from './components/MedisDetailModal.vue'
import SkUploadModal from './components/SkUploadModal.vue'
import SkBuktiKredensialUploadModal from './components/SkBuktiKredensialUploadModal.vue'

const toast = useToast()

// State
const berkasList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')
const activeMenu = ref(null)
const activeTab = ref('standar') // 'standar' | 'kredensial' | 'staf'
const pendingCount = ref(0)
const pendingCountKredensial = ref(0)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

// Modal States
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const showUploadModal = ref(false)
const showUploadKredensialModal = ref(false)
const isEditMode = ref(false)
const selectedBerkas = ref(null)
const deleting = ref(false)

// Page dynamic content
const pageTitle = computed(() => {
  if (activeTab.value === 'staf') return 'Data Dokter & Medis'
  if (activeTab.value === 'kredensial') return 'Kredensial Komite Medis'
  return 'Berkas Komite Medis'
})

const pageDescription = computed(() => {
  if (activeTab.value === 'staf') return 'Daftar Kualifikasi Staf Klinis (Dokter) RSIA Aisyiyah Pekajangan'
  if (activeTab.value === 'kredensial') return 'Pengajuan SPK & RKK Komite Medis'
  return 'Data Berkas Komite Medis Terdaftar RSIA Aisyiyah Pekajangan'
})

// Close dropdowns when clicking outside
const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-more')) {
    activeMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
  loadData()
  fetchPendingCounts()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const toggleMenu = (index) => {
  if (activeMenu.value === index) {
    activeMenu.value = null
  } else {
    activeMenu.value = index
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  filterDate.value = ''
  pagination.value.current_page = 1
  loadData(1)
}

const buildFilters = () => {
  const filters = []
  
  if (activeTab.value === 'standar') {
    filters.push({ field: 'status', operator: '=', value: '1' })
  }
  
  if (filterDate.value) {
    const formattedDate = filterDate.value
    filters.push({ field: 'tgl_terbit', operator: '=', value: formattedDate })
  }
  
  return filters
}

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const filters = buildFilters()
    let response
    
    if (activeTab.value === 'standar') {
      response = await komiteMedisService.search(searchQuery.value, pagination.value.per_page, page, filters)
    } else if (activeTab.value === 'kredensial') {
      const combinedSearch = searchQuery.value 
        ? `SPK RKK ${searchQuery.value}` 
        : 'SPK RKK'
      response = await skService.searchSk(combinedSearch, pagination.value.per_page, page, filters)
    } else {
      // Data Staf
      response = await pegawaiService.getKualifikasiStaf({
        search: searchQuery.value,
        per_page: pagination.value.per_page,
        page: page,
        group: 'medis'
      })
    }
    
    if (response.data) {
      berkasList.value = response.data.data || []
      
      // Handle different pagination structures
      if (response.data.meta) {
        pagination.value = response.data.meta
      } else {
        pagination.value = {
          current_page: response.data.current_page || page,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 10,
          total: response.data.total || berkasList.value.length
        }
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

const fetchPendingCounts = async () => {
  try {
    const filters = [{ field: 'status_approval', operator: '=', value: 'pengajuan' }]
    
    // Fetch Medis Pending Count
    const resMedis = await komiteMedisService.search('', 1, 1, filters)
    pendingCount.value = resMedis.data?.total || 0
    
    // Fetch Kredensial Pending Count
    const resKred = await skService.searchSk('SPK RKK', 1, 1, filters)
    pendingCountKredensial.value = resKred.data?.meta?.total || 0
  } catch (error) {
    console.error('Error fetching pending counts:', error)
  }
}

const handleSaved = () => {
  loadData(pagination.value.current_page)
  fetchPendingCounts()
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
  handleSearch()
}

const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr.replace(' ', 'T').split('.')[0])
}

const formatDayBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonthBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYearBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getFullYear() : '----'
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadData(page)
  }
}

// Formatters
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSurat = (berkas, forceKredensial = false) => {
  if (!berkas) return '-'
  try {
    const tglPattern = berkas.tgl_terbit ? format(new Date(berkas.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(berkas.nomor).padStart(3, '0')
    const prefix = berkas.prefix || (forceKredensial ? 'KPRT-RSIA' : 'KOMED-RSIA')
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${berkas.nomor}/${berkas.prefix || (forceKredensial ? 'KPRT-RSIA' : 'KOMED-RSIA')}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  const cleaned = name.replace(/^(dr\.|drg\.|dr\.\s|drg\.\s)/i, '')
  return cleaned.includes(' ') 
    ? cleaned.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : cleaned.substring(0, 2).toUpperCase()
}

const openFile = (filename, type = 'arsip') => {
  if (!filename) return
  
  if (activeTab.value === 'kredensial' || type === 'sk') {
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
    const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
    const url = `${baseUrl}/webapps/rsia_sk/${filename}`
    window.open(url, '_blank')
  } else {
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/arsip/berkas/${filename}`
    window.open(fileUrl, '_blank')
  }
}

// Actions
const openCreateModal = () => {
  selectedBerkas.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openDetailModal = (item) => {
  selectedBerkas.value = item
  showDetailModal.value = true
}

const openEditModal = (item) => {
  selectedBerkas.value = item
  isEditMode.value = true
  showFormModal.value = true
}

const openUploadModal = (item) => {
  selectedBerkas.value = item
  showUploadModal.value = true
}

const openUploadKredensialModal = (item) => {
  selectedBerkas.value = item
  showUploadKredensialModal.value = true
}

const confirmDelete = (item) => {
  selectedBerkas.value = item
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!selectedBerkas.value) return
  
  deleting.value = true
  try {
    if (activeTab.value === 'kredensial') {
        const identifier = btoa(`${selectedBerkas.value.nomor}.${selectedBerkas.value.jenis}.${selectedBerkas.value.tgl_terbit}`)
        await skService.deleteSk(identifier)
    } else {
        const identifier = btoa(`${selectedBerkas.value.nomor}.${selectedBerkas.value.tgl_terbit}`)
        await komiteMedisService.delete(identifier)
    }
    
    toast.success('Data berhasil dihapus')
    showDeleteModal.value = false
    loadData(pagination.value.current_page)
  } catch (error) {
    console.error('Error deleting:', error)
    toast.error('Gagal menghapus data')
  } finally {
    deleting.value = false
  }
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
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: background 0.5s ease;
}

.hero-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgoJPC9zdmc+') repeat;
  opacity: 0.5;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.title-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.95rem;
}

.stats-section {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1.25rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* Tabs */
.tabs-container {
  display: flex;
  justify-content: flex-start;
}

.capsule-tabs {
  background: #f1f5f9;
  padding: 0.4rem;
  border-radius: 100px;
  display: flex;
  gap: 0.25rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.tab-item {
  border: none;
  background: transparent;
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #1e293b;
}

.tab-item.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tab-item i {
  font-size: 1rem;
}

/* Action Bar */
.action-bar-modern {
  margin-bottom: 1.5rem;
}

.action-bar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-filter-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search, .clear-filter {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover, .clear-filter:hover {
  color: #ef4444;
  background: #fee2e2;
}

.filter-box {
  position: relative;
  min-width: 180px;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 1;
}

.filter-box input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #334155;
  cursor: pointer;
  appearance: none;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-purple {
  background: #7c3aed;
}

.btn-purple:hover {
  background: #6d28d9;
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);
}

/* Card & Table modern */
.card-modern {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
  position: relative;
  min-height: 300px;
}

/* Table styles */
.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.modern-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

/* Badge Nomor */
.badge-nomor {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid #e2e8f0;
}

/* Calendar Card */
.date-calendar-card {
  width: 50px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  text-align: center;
}

.date-calendar-card .card-header {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem;
}

.date-calendar-card .card-body {
  background: white;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.date-calendar-card .day {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  color: #1e293b;
}

.date-calendar-card .year {
  font-size: 0.6rem;
  color: #94a3b8;
}

/* PJ Cell */
.pj-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pj-avatar {
  width: 32px;
  height: 32px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.bg-purple-light { background-color: #f5f3ff; }
.text-purple { color: #7c3aed; }
.bg-green-light { background-color: #ecfdf5; }
.text-green { color: #059669; }
.bg-blue-light { background-color: #eff6ff; }
.text-blue { color: #3b82f6; }
.bg-orange-light { background-color: #fff7ed; }
.text-orange { color: #f97316; }

.pj-name {
  font-weight: 600;
  color: #334155;
  max-width: 150px;
}

/* Mini Badge */
.mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Status Badge */
.badge-status {
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-success { background: #dcfce7; color: #15803d; }
.status-danger { background: #fee2e2; color: #b91c1c; }
.status-pending { background: #fef9c3; color: #a16207; }

/* Actions */
.action-buttons-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}

.btn-more:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Dropdown Custom */
.dropdown-more {
  position: relative;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 160px;
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  background: transparent;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item i {
  font-size: 0.9rem;
  width: 16px;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.4rem 0;
}

.btn-quick-link {
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-quick-link:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #334155;
  transform: translateY(-1px);
}

.btn-quick-link i {
  color: #3b82f6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  color: #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  max-width: 300px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page, .btn-page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled), .btn-page-number:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #1e293b;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1.5rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-sm { max-width: 400px; }

.modal-icon-header {
  padding: 2rem 2rem 1rem;
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.bg-danger-light { background-color: #fee2e2; color: #ef4444; }

.modal-body { padding: 0 2rem 2rem; }

.modal-footer-flex {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { background: #f8fafc; color: #1e293b; }

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-danger:hover { background: #dc2626; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); }

/* Responsive */
@media (max-width: 1024px) {
  .hero-content { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .stats-section { width: 100%; }
  .stat-card { flex: 1; }
}

@media (max-width: 768px) {
  .action-bar-row { flex-direction: column; align-items: stretch; }
  .search-filter-group { flex-direction: column; }
  .search-box { max-width: none; }
  .btn-primary { justify-content: center; }
  .capsule-tabs { width: 100%; overflow-x: auto; white-space: nowrap; }
}

/* Tab Badge */
.tab-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 100px;
  margin-left: 0.5rem;
  min-width: 18px;
  text-align: center;
}

.tab-item.active .tab-badge {
  background: white;
  color: #3b82f6;
}

.btn-quick-upload {
  padding: 0.35rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-quick-upload:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.bg-success-light {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
}
</style>
