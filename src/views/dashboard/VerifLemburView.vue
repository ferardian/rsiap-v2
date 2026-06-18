
<template>
  <div class="approval-lembur-page animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">💼 Verifikasi Lembur (SDI)</h1>
          <p class="page-subtitle">Verifikasi pengajuan lembur yang telah disetujui koordinator untuk disahkan oleh SDI.</p>
        </div>
        <div class="header-actions">
          <button @click="openSplModal" class="btn-header">
            <i class="fas fa-file-signature mr-2"></i> Kelola SPL
          </button>
        </div>
      </div>
    </div>

    <!-- Filters & Content Card -->
    <div class="content-card">
      <div class="filter-section border-b border-gray-100">
        <h3>Daftar Pengajuan Lembur</h3>
        
        <div class="filters-grid">
          <!-- Month Select -->
          <div class="filter-item">
            <label>Bulan</label>
            <select v-model="filter.month" class="filter-input" :disabled="loading">
              <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
            </select>
          </div>

          <!-- Year Select -->
          <div class="filter-item">
            <label>Tahun</label>
            <select v-model="filter.year" class="filter-input" :disabled="loading">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <!-- Department Select -->
          <div class="filter-item">
            <label>Unit Kerja</label>
            <select v-model="filter.department" class="filter-input" :disabled="loading || isDeptLocked">
              <option value="all">Semua Unit</option>
              <option v-for="dept in departments" :key="dept.dep_id" :value="dept.dep_id">
                {{ dept.nama }}
              </option>
            </select>
          </div>

          <!-- Search Box -->
          <div class="filter-item search-box-wrapper">
            <label>Cari Pegawai</label>
            <div class="search-input-group">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="filter.search" 
                placeholder="Nama atau NIK..." 
                class="filter-input search-input"
                :disabled="loading"
                @input="handleSearch"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="['tab-button', { 'active': activeTab === tab.value }]"
        >
          <i :class="['fas', tab.icon]"></i>
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Main Body -->
      <div class="card-body p-0">
        <div class="table-container">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data pengajuan lembur...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredLemburList.length === 0" class="empty-state">
            <i class="fas fa-inbox empty-icon"></i>
            <p>Tidak ada pengajuan lembur untuk kriteria ini.</p>
          </div>

          <!-- Data Table -->
          <table v-else class="premium-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Unit Kerja</th>
                <th>Waktu Lembur</th>
                <th class="text-center">Durasi</th>
                <th>Kegiatan & SPL</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredLemburList" :key="`${item.id}_${item.jam_datang}`">
                <!-- Pegawai Name & NIK with Initials Avatar -->
                <td>
                  <div class="pegawai-cell">
                    <div class="avatar-initials">
                      {{ getInitials(item.pegawai?.nama) }}
                    </div>
                    <div class="pegawai-info">
                      <span class="pegawai-name">{{ item.pegawai?.nama || 'Unknown' }}</span>
                      <span class="pegawai-nik">{{ item.pegawai?.nik || '-' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Department -->
                <td>
                  <span class="dept-label">{{ item.pegawai?.dep?.nama || '-' }}</span>
                </td>

                <!-- Timings -->
                <td>
                  <div class="timing-stack">
                    <div class="timing-row">
                      <span class="badge-time in">Masuk</span>
                      <span>{{ formatDateTime(item.jam_datang) }}</span>
                    </div>
                    <div class="timing-row mt-1">
                      <span class="badge-time out">Pulang</span>
                      <span>{{ formatDateTime(item.jam_pulang) }}</span>
                    </div>
                  </div>
                </td>

                <!-- Durations -->
                <td class="text-center">
                  <div class="duration-stack">
                    <div class="duration-item text-muted" title="Durasi Pengajuan">
                      <i class="far fa-hourglass mr-1"></i>
                      <span>{{ item.durasi_pengajuan }}</span>
                    </div>
                    <div v-if="item.status !== 'PENGAJUAN' && item.status !== 'DITOLAK'" class="duration-item text-success mt-1" title="Durasi disetujui">
                      <i class="fas fa-check-circle mr-1"></i>
                      <span>{{ item.durasi_acc }}</span>
                    </div>
                  </div>
                </td>

                <!-- Kegiatan & SPL -->
                <td>
                  <div class="kegiatan-wrapper">
                    <p class="kegiatan-text">{{ item.kegiatan }}</p>
                    <div class="spl-badge-row mt-2">
                      <span v-if="item.no_spl" class="badge-spl exists" :title="item.kegiatan_spl">
                        <i class="fas fa-file-signature mr-1"></i>
                        SPL: {{ item.no_spl }}
                      </span>
                      <span v-else class="badge-spl missing clickable" @click="createNewSplFromOvertime(item)" title="Klik untuk membuat SPL baru untuk pengajuan ini">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        Tanpa SPL
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <div v-if="canApprove(item)" class="action-buttons justify-center">
                    <button 
                      @click="handleApprove(item)" 
                      class="btn-action approve"
                      title="Setujui Lembur"
                    >
                      <i class="fas fa-check mr-1"></i> Setujui
                    </button>
                    <button 
                      @click="handleReject(item)" 
                      class="btn-action reject"
                      title="Tolak Lembur"
                    >
                      <i class="fas fa-times mr-1"></i> Tolak
                    </button>
                  </div>
                  <div v-else class="status-display">
                    <span :class="['status-tag', item.status?.toLowerCase()]">
                      {{ item.status }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SPL Management Modal -->
    <teleport to="body">
      <div v-if="splModal.show" class="modal-overlay" @click.self="closeSplModal">
      <div class="modal-container spl-modal animate-scale-up">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fas fa-file-signature mr-2 text-emerald-500"></i> Kelola Surat Perintah Lembur (SPL)
          </h2>
          <button @click="closeSplModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Tabs -->
        <div class="modal-tabs">
          <button 
            @click="splModal.activeTab = 'list'" 
            :class="['modal-tab-btn', { active: splModal.activeTab === 'list' }]"
          >
            <i class="fas fa-list mr-2"></i> Daftar SPL
          </button>
          <button 
            @click="splModal.activeTab = 'create'" 
            :class="['modal-tab-btn', { active: splModal.activeTab === 'create' }]"
          >
            <i class="fas fa-plus mr-2"></i> Tambah SPL
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-0">
          
          <!-- View 1: List SPL -->
          <div v-if="splModal.activeTab === 'list'" class="spl-list-view">
            <!-- Filters -->
            <div class="spl-filters p-4 bg-gray-50 border-b border-gray-100">
              <div class="filters-grid">
                <!-- Date Filter -->
                <div class="filter-item">
                  <label>Tanggal</label>
                  <input type="date" v-model="splModal.filter.date" class="filter-input" @change="fetchSplList(1)" />
                </div>
                
                <!-- Dept Filter (only editable if not locked) -->
                <div class="filter-item">
                  <label>Unit Kerja</label>
                  <select v-model="splModal.filter.department" class="filter-input" :disabled="isDeptLocked" @change="fetchSplList(1)">
                    <option value="all">Semua Unit</option>
                    <option v-for="dept in departments" :key="dept.dep_id" :value="dept.dep_id">
                      {{ dept.nama }}
                    </option>
                  </select>
                </div>

                <!-- Search box -->
                <div class="filter-item search-box-wrapper">
                  <label>Cari</label>
                  <input type="text" v-model="splModal.filter.search" placeholder="No. SPL, Nama, NIK..." class="filter-input" @input="handleSplSearch" />
                </div>
              </div>
            </div>

            <!-- List Table -->
            <div class="table-container spl-table-container">
              <div v-if="splModal.loading" class="loading-state">
                <div class="spinner"></div>
                <p>Memuat data SPL...</p>
              </div>
              <div v-else-if="splModal.list.length === 0" class="empty-state">
                <i class="fas fa-file-excel empty-icon"></i>
                <p>Tidak ada Surat Perintah Lembur yang terdaftar.</p>
              </div>
              <table v-else class="premium-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>No. SPL</th>
                    <th>Pegawai</th>
                    <th>Unit Kerja</th>
                    <th>Kegiatan</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="spl in splModal.list" :key="`${spl.id_peg}_${spl.tanggal}`">
                    <td>{{ formatDateOnly(spl.tanggal) }}</td>
                    <td><strong class="text-emerald-600">{{ spl.no_spl }}</strong></td>
                    <td>
                      <div class="pegawai-info">
                        <span class="pegawai-name">{{ spl.nama_pegawai }}</span>
                        <span class="pegawai-nik">{{ spl.nik_pegawai }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="dept-label">{{ spl.nama_departemen || '-' }}</span>
                    </td>
                    <td>
                      <p class="kegiatan-text">{{ spl.kegiatan }}</p>
                    </td>
                    <td class="text-center">
                      <button @click="handleDeleteSpl(spl)" class="btn-action-icon reject" title="Hapus SPL">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination/Footer -->
            <div v-if="splModal.pagination && splModal.pagination.last_page > 1" class="modal-footer justify-between border-t border-gray-100 p-4">
              <span class="text-xs text-gray-500 font-medium">Halaman {{ splModal.pagination.current_page }} dari {{ splModal.pagination.last_page }}</span>
              <div class="pagination-buttons">
                <button 
                  :disabled="splModal.pagination.current_page === 1" 
                  @click="changeSplPage(splModal.pagination.current_page - 1)" 
                  class="btn-pagination"
                >
                  Sebelumnya
                </button>
                <button 
                  :disabled="splModal.pagination.current_page === splModal.pagination.last_page" 
                  @click="changeSplPage(splModal.pagination.current_page + 1)" 
                  class="btn-pagination"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>

          <!-- View 2: Form Tambah SPL -->
          <div v-if="splModal.activeTab === 'create'" class="spl-form-view p-6">
            <form @submit.prevent="handleStoreSpl" class="modern-form">
              <div class="form-grid">
                <!-- Date -->
                <div class="form-group">
                  <label class="form-label">Tanggal Lembur <span class="required">*</span></label>
                  <input type="date" v-model="splForm.tanggal" class="form-input" required />
                </div>

                <!-- No. SPL -->
                <div class="form-group">
                  <label class="form-label">Nomor SPL <span class="required">*</span></label>
                  <div class="input-with-button">
                    <input type="text" v-model="splForm.no_spl" placeholder="Contoh: 001/SPL/SDI/VI/2026" class="form-input" required />
                    <button type="button" @click="generateSplNumber" class="btn-secondary-action" title="Generate nomor otomatis">
                      <i class="fas fa-magic mr-1"></i> Auto
                    </button>
                  </div>
                </div>

                <!-- Pegawai Dropdown -->
                <div class="form-group col-span-2">
                  <label class="form-label">Pegawai <span class="required">*</span></label>
                  <div class="searchable-select">
                    <input 
                      type="text" 
                      v-model="splForm.pegawaiSearch" 
                      placeholder="Cari pegawai berdasarkan nama atau NIK..." 
                      class="form-input select-search-input"
                      @input="handleEmployeeSearchInput"
                      @focus="splForm.showDropdown = true"
                      @blur="handleEmployeeBlur"
                    />
                    <div v-if="splForm.showDropdown" class="select-dropdown-list">
                      <div 
                        v-for="peg in employeesForSpl" 
                        :key="peg.nik" 
                        class="select-dropdown-item"
                        @mousedown="selectFormEmployee(peg)"
                      >
                        <div class="dropdown-peg-info">
                          <span class="dropdown-peg-name">{{ peg.nama }}</span>
                          <span class="dropdown-peg-nik">{{ peg.nik }} - {{ peg.jbtn || '-' }} ({{ peg.departemen || '-' }})</span>
                        </div>
                      </div>
                      <div v-if="employeesForSpl.length === 0" class="select-dropdown-empty">
                        <span v-if="searchingEmployees">Mencari...</span>
                        <span v-else>Ketik minimal 2 karakter untuk mencari pegawai</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="splForm.selectedPegawai" class="selected-pegawai-badge mt-2 animate-fade-in">
                    <div class="selected-pegawai-details">
                      <i class="fas fa-user-check text-emerald-500 mr-2"></i>
                      <span><strong>{{ splForm.selectedPegawai.nama }}</strong> ({{ splForm.selectedPegawai.nik }}) - {{ splForm.selectedPegawai.departemen || 'Unknown Unit' }}</span>
                    </div>
                    <button type="button" @click="clearFormEmployee" class="clear-selected-btn">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- Kegiatan -->
                <div class="form-group col-span-2">
                  <label class="form-label">Kegiatan Lembur <span class="required">*</span></label>
                  <textarea 
                    v-model="splForm.kegiatan" 
                    rows="3" 
                    placeholder="Tuliskan detail kegiatan atau tugas lembur yang dilaksanakan..." 
                    class="form-input form-textarea" 
                    required
                  ></textarea>
                </div>
              </div>

              <!-- Form Submit -->
              <div class="form-actions mt-6">
                <button type="button" @click="splModal.activeTab = 'list'" class="btn-cancel">
                  Batal
                </button>
                <button type="submit" class="btn-submit" :disabled="splForm.submitting || !splForm.selectedPegawai">
                  <span v-if="splForm.submitting"><div class="spinner-small"></div> Menyimpan...</span>
                  <span v-else><i class="fas fa-save mr-2"></i> Simpan SPL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { lemburService } from '../../services/sdi/lemburService'
import { pegawaiService } from '../../services/pegawaiService'
import { showToast } from '../../utils/notification'
import config from '../../config/api'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]

// State
const loading = ref(false)
const lemburList = ref([])
const departments = ref([])
const activeTab = ref('pending_sdi') // pending_mgr, pending_sdi, approved, rejected

const filter = ref({
  month: new Date().getMonth() + 1,
  year: currentYear,
  department: 'all',
  search: ''
})

// Check if user department is locked
const isDeptLocked = computed(() => {
  return false
})

// SPL State variables
const splModal = ref({
  show: false,
  activeTab: 'list',
  loading: false,
  list: [],
  pagination: null,
  filter: {
    date: new Date().toISOString().substring(0, 10),
    department: 'all',
    search: '',
    page: 1
  }
})

const splForm = ref({
  tanggal: new Date().toISOString().substring(0, 10),
  no_spl: '',
  pegawaiSearch: '',
  selectedPegawai: null,
  kegiatan: '',
  submitting: false,
  showDropdown: false
})

const employeesForSpl = ref([])
const searchingEmployees = ref(false)

// Apply default department filter if locked
watch(() => authStore.userDepartment, (newDept) => {
  if (isDeptLocked.value && newDept && newDept !== '-') {
    filter.value.department = newDept
    splModal.value.filter.department = newDept
  }
}, { immediate: true })

// Tabs list
const tabs = computed(() => [
  {
    value: 'pending_mgr',
    label: 'Menunggu Koordinator',
    icon: 'fa-user-tie',
    count: lemburList.value.filter(item => item.status === 'PENGAJUAN').length
  },
  {
    value: 'pending_sdi',
    label: 'Menunggu SDI',
    icon: 'fa-users-cog',
    count: lemburList.value.filter(item => item.status === 'ACC1').length
  },
  {
    value: 'approved',
    label: 'Disetujui',
    icon: 'fa-check-circle',
    count: lemburList.value.filter(item => item.status === 'ACC2').length
  },
  {
    value: 'rejected',
    label: 'Ditolak',
    icon: 'fa-times-circle',
    count: lemburList.value.filter(item => item.status === 'DITOLAK').length
  }
])

// Filtered list based on active tab
const filteredLemburList = computed(() => {
  const statusMap = {
    'pending_mgr': 'PENGAJUAN',
    'pending_sdi': 'ACC1',
    'approved': 'ACC2',
    'rejected': 'DITOLAK'
  }
  const targetStatus = statusMap[activeTab.value]
  return lemburList.value.filter(item => item.status === targetStatus)
})

// Methods
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return ''
  const baseUrl = config.public.API_V2_URL.replace('/api/v2', '')
  return `${baseUrl}/storage/${photoPath}`
}

const showFullPhoto = (photoPath, name) => {
  if (!photoPath) return
  Swal.fire({
    title: `Foto Lembur - ${name || 'Pegawai'}`,
    imageUrl: getPhotoUrl(photoPath),
    imageAlt: 'Foto check-in lembur',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Tutup'
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// Check if user is allowed to approve this item
const canApprove = (item) => {
  // SDI verif-lembur page is specifically for verifying ACC1 (pending_sdi) to ACC2.
  return item.status === 'ACC1'
}

const handleApprove = async (item) => {
  const targetStatus = 'ACC2'
  
  const result = await Swal.fire({
    title: 'Setujui Lembur Pegawai?',
    html: `
      <div style="text-align: left; font-size: 0.9rem; color: #475569;">
        <p><strong>Nama:</strong> ${item.pegawai?.nama}</p>
        <p><strong>Kegiatan:</strong> ${item.kegiatan}</p>
        <p><strong>Durasi Pengajuan:</strong> ${item.durasi_pengajuan}</p>
      </div>
      <div style="margin-top: 1.5rem; text-align: left;">
        <label style="font-weight: 600; font-size: 0.85rem; color: #1e293b; display: block; margin-bottom: 0.5rem;">
          Durasi Disetujui (HH:MM:SS)
        </label>
        <input 
          id="swal-input-durasi" 
          class="swal2-input" 
          value="${item.durasi_pengajuan}" 
          placeholder="00:00:00" 
          style="width: 100%; margin: 0; box-sizing: border-box;"
        />
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '<i class="fas fa-check"></i> Ya, Setujui',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    preConfirm: () => {
      const durasi = document.getElementById('swal-input-durasi').value
      const regex = /^\d{2}:\d{2}:\d{2}$/
      if (!regex.test(durasi)) {
        Swal.showValidationMessage('Format durasi tidak valid! Harus HH:MM:SS (contoh: 02:30:00)')
        return false
      }
      return durasi
    }
  })

  if (!result.isConfirmed) return

  try {
    const payload = {
      id: item.id,
      jam_datang: item.jam_datang.replace('T', ' ').substring(0, 19),
      status: targetStatus,
      durasi_acc: result.value
    }
    
    const res = await lemburService.approveLembur(payload)
    if (res.data && res.data.success) {
      showToast('Berhasil menyetujui pengajuan lembur', 'success')
      fetchData()
    }
  } catch (error) {
    console.error(error)
    showToast(error.response?.data?.message || 'Gagal menyetujui lembur', 'error')
  }
}

const handleReject = async (item) => {
  const result = await Swal.fire({
    title: 'Tolak Lembur Pegawai?',
    text: `Apakah Anda yakin ingin menolak pengajuan lembur ${item.pegawai?.nama}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '<i class="fas fa-times"></i> Ya, Tolak',
    cancelButtonText: 'Batal',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    const payload = {
      id: item.id,
      jam_datang: item.jam_datang.replace('T', ' ').substring(0, 19)
    }
    
    const res = await lemburService.rejectLembur(payload)
    if (res.data && res.data.success) {
      showToast('Berhasil menolak pengajuan lembur', 'success')
      fetchData()
    }
  } catch (error) {
    console.error(error)
    showToast(error.response?.data?.message || 'Gagal menolak lembur', 'error')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      month: filter.value.month,
      year: filter.value.year,
      departemen: filter.value.department,
      search: filter.value.search,
      limit: 100
    }
    
    const res = await lemburService.getApprovalList(params)
    if (res.data && res.data.success) {
      lemburList.value = res.data.data.data || []
    }
  } catch (error) {
    console.error(error)
    showToast('Gagal memuat data pengajuan lembur', 'error')
  } finally {
    loading.value = false
  }
}

let searchTimeout = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 500)
}

const loadDepartments = async () => {
  try {
    const res = await pegawaiService.getMaster('departemen', { limit: 1000 })
    departments.value = res.data.data || []
  } catch (error) {
    console.error(error)
  }
}

watch([() => filter.value.month, () => filter.value.year, () => filter.value.department], () => {
  fetchData()
})

// SPL Methods
const searchFormEmployees = async (query) => {
  if (!query || query.length < 2) {
    employeesForSpl.value = []
    return
  }
  searchingEmployees.value = true
  try {
    const params = {
      search: query,
      limit: 50
    }
    if (isDeptLocked.value) {
      params.departemen = authStore.userDepartment
    } else if (splModal.value.filter.department && splModal.value.filter.department !== 'all') {
      params.departemen = splModal.value.filter.department
    }
    const res = await pegawaiService.getKaryawanList(params)
    if (res.data && res.data.success) {
      employeesForSpl.value = res.data.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    searchingEmployees.value = false
  }
}

let employeeSearchTimeout = null
const handleEmployeeSearchInput = () => {
  if (employeeSearchTimeout) clearTimeout(employeeSearchTimeout)
  employeeSearchTimeout = setTimeout(() => {
    searchFormEmployees(splForm.value.pegawaiSearch)
  }, 300)
}

const selectFormEmployee = (peg) => {
  splForm.value.selectedPegawai = peg
  splForm.value.pegawaiSearch = peg.nama
  splForm.value.showDropdown = false
}

const clearFormEmployee = () => {
  splForm.value.selectedPegawai = null
  splForm.value.pegawaiSearch = ''
  employeesForSpl.value = []
}

const handleEmployeeBlur = () => {
  setTimeout(() => {
    splForm.value.showDropdown = false
  }, 250)
}

const generateSplNumber = () => {
  const dateObj = new Date(splForm.value.tanggal || new Date())
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const roman = romanMonths[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  
  let deptCode = 'SDI'
  if (isDeptLocked.value && authStore.userDepartment) {
    deptCode = authStore.userDepartment
  } else if (splForm.value.selectedPegawai && splForm.value.selectedPegawai.departemen && splForm.value.selectedPegawai.departemen !== '-') {
    deptCode = splForm.value.selectedPegawai.departemen
  } else if (splModal.value.filter.department && splModal.value.filter.department !== 'all') {
    deptCode = splModal.value.filter.department
  }
  
  splForm.value.no_spl = `${randomSuffix}/SPL/${deptCode}/${roman}/${year}`
}

const fetchSplList = async (page = 1) => {
  splModal.value.loading = true
  splModal.value.filter.page = page
  try {
    const params = {
      date: splModal.value.filter.date,
      departemen: splModal.value.filter.department,
      search: splModal.value.filter.search,
      page: page,
      limit: 10
    }
    const res = await lemburService.getSplList(params)
    if (res.data && res.data.success) {
      splModal.value.list = res.data.data.data || []
      splModal.value.pagination = {
        current_page: res.data.data.current_page,
        last_page: res.data.data.last_page,
        total: res.data.data.total
      }
    }
  } catch (error) {
    console.error(error)
    showToast('Gagal memuat daftar SPL', 'error')
  } finally {
    splModal.value.loading = false
  }
}

let splSearchTimeout = null
const handleSplSearch = () => {
  if (splSearchTimeout) clearTimeout(splSearchTimeout)
  splSearchTimeout = setTimeout(() => {
    fetchSplList(1)
  }, 500)
}

const changeSplPage = (page) => {
  fetchSplList(page)
}

const handleStoreSpl = async () => {
  if (!splForm.value.selectedPegawai) {
    showToast('Pilih pegawai terlebih dahulu', 'warning')
    return
  }
  splForm.value.submitting = true
  try {
    const payload = {
      no_spl: splForm.value.no_spl,
      tanggal: splForm.value.tanggal,
      nik: splForm.value.selectedPegawai.nik,
      kegiatan: splForm.value.kegiatan
    }
    const res = await lemburService.storeSpl(payload)
    if (res.data && res.data.success) {
      showToast('Surat Perintah Lembur berhasil disimpan', 'success')
      splForm.value.no_spl = ''
      splForm.value.kegiatan = ''
      clearFormEmployee()
      splModal.value.activeTab = 'list'
      fetchSplList(1)
    }
  } catch (error) {
    console.error(error)
    showToast(error.response?.data?.message || 'Gagal menyimpan SPL', 'error')
  } finally {
    splForm.value.submitting = false
  }
}

const handleDeleteSpl = async (spl) => {
  const result = await Swal.fire({
    title: 'Hapus Surat Perintah Lembur?',
    text: `Apakah Anda yakin ingin menghapus SPL ${spl.no_spl} untuk ${spl.nama_pegawai}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    const payload = {
      id_peg: spl.id_peg,
      tanggal: spl.tanggal
    }
    const res = await lemburService.destroySpl(payload)
    if (res.data && res.data.success) {
      showToast('SPL berhasil dihapus', 'success')
      fetchSplList(splModal.value.pagination.current_page)
    }
  } catch (error) {
    console.error(error)
    showToast(error.response?.data?.message || 'Gagal menghapus SPL', 'error')
  }
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const openSplModal = () => {
  splModal.value.show = true
  splModal.value.activeTab = 'list'
  fetchSplList(1)
}

const createNewSplFromOvertime = (item) => {
  if (!item.pegawai) return
  
  const dateStr = item.jam_datang ? item.jam_datang.substring(0, 10) : new Date().toISOString().substring(0, 10)
  
  splForm.value.tanggal = dateStr
  splForm.value.kegiatan = item.kegiatan || ''
  
  // Set selected employee
  splForm.value.selectedPegawai = {
    nik: item.pegawai.nik,
    nama: item.pegawai.nama,
    departemen: item.pegawai.departemen || '-'
  }
  splForm.value.pegawaiSearch = item.pegawai.nama
  employeesForSpl.value = [splForm.value.selectedPegawai]
  
  // Generate the SPL number
  generateSplNumber()
  
  // Open modal in create tab
  splModal.value.show = true
  splModal.value.activeTab = 'create'
}

const closeSplModal = () => {
  splModal.value.show = false
  fetchData()
}

onMounted(() => {
  loadDepartments()
  fetchData()
})
</script>

<style scoped>
.approval-lembur-page {
  padding: 0;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 2.5rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.filter-section {
  padding: 2rem;
}

.filter-section h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
  margin: 0 0 1.5rem 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
}

@media (min-width: 992px) {
  .search-box-wrapper {
    grid-column: span 2;
  }
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-item label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.15rem;
}

.filter-input {
  padding: 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fafc;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
}

select.filter-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 2.5rem;
  cursor: pointer;
}

.filter-input:focus {
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.search-input {
  padding-left: 2.5rem;
}

/* Tabs Container */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 2px solid #f1f5f9;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: #f8fafc;
  color: #334155;
}

.tab-button.active {
  background: #f8fafc;
  color: #10b981;
  border-bottom: 3px solid #10b981;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
}

.tab-button.active .tab-count {
  background: #d1fae5;
  color: #065f46;
}

/* Table Container */
.table-container {
  width: 100%;
  overflow-x: auto;
  min-height: 250px;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.premium-table th {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
}

.premium-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.premium-table tr:hover td {
  background-color: #fcfdfe;
}

/* Thumbnail */
.thumbnail-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.thumbnail-wrapper:hover {
  transform: scale(1.1);
  border-color: #10b981;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  font-size: 1.2rem;
  color: #cbd5e1;
}

/* Pegawai info */
.pegawai-info {
  display: flex;
  flex-direction: column;
}

.pegawai-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
}

.pegawai-nik {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.dept-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

/* Timing stack */
.timing-stack {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

.timing-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-time {
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-time.in {
  background: #eff6ff;
  color: #1d4ed8;
}

.badge-time.out {
  background: #fff7ed;
  color: #c2410c;
}

/* Durations */
.duration-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.duration-item {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
}

/* Kegiatan */
.kegiatan-text {
  font-size: 0.875rem;
  color: #334155;
  margin: 0;
  white-space: normal;
  word-break: break-word;
  max-width: 280px;
  line-height: 1.4;
}

.badge-spl {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
}

.badge-spl.exists {
  background: #d1fae5;
  color: #065f46;
}

.badge-spl.missing {
  background: #fee2e2;
  color: #991b1b;
}

.badge-spl.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-spl.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-action.approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-action.approve:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-action.reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-action.reject:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

/* Status Displays */
.status-display {
  display: flex;
  justify-content: center;
}

.status-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-tag.pengajuan {
  background: #fef3c7;
  color: #d97706;
}

.status-tag.acc1 {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-tag.acc2 {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.ditolak {
  background: #fee2e2;
  color: #991b1b;
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Pegawai Cell with Initials */
.pegawai-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-initials {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

/* Modal and SPL Styles */
.header-actions {
  display: flex;
  align-items: center;
}

.btn-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.2s ease;
}

.btn-header:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-header i {
  margin-right: 0.6rem !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-tabs {
  display: flex;
  border-bottom: 2px solid #f1f5f9;
  background: #f8fafc;
  padding: 0 1.5rem;
}

.modal-tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.modal-tab-btn:hover {
  color: #334155;
}

.modal-tab-btn.active {
  color: #10b981;
}

.modal-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #10b981;
  border-radius: 3px 3px 0 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.spl-filters {
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.spl-table-container {
  overflow-y: auto;
  max-height: 400px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-pagination {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.searchable-select {
  position: relative;
  width: 100%;
}

.select-dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1010;
  margin-top: 0.25rem;
}

.select-dropdown-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.select-dropdown-item:last-child {
  border-bottom: none;
}

.select-dropdown-item:hover {
  background: #f0fdf4;
}

.dropdown-peg-info {
  display: flex;
  flex-direction: column;
}

.dropdown-peg-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.dropdown-peg-nik {
  font-size: 0.75rem;
  color: #64748b;
}

.select-dropdown-empty {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.selected-pegawai-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
}

.selected-pegawai-details {
  display: flex;
  align-items: center;
  color: #14532d;
}

.clear-selected-btn {
  background: transparent;
  border: none;
  color: #166534;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
}

.clear-selected-btn:hover {
  color: #14532d;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary-action {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary-action:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.spl-form-view {
  padding: 1.5rem !important;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.col-span-2 {
  grid-column: span 2;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.1rem;
  display: block;
}

.form-label .required {
  color: #ef4444;
}

.form-input {
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  margin-top: 1rem;
}

.btn-submit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-action-icon.reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-action-icon.reject:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scale-up {
  animation: scaleUp 0.3s ease-out forwards;
}

/* Icon Spacing Fixes */
.btn-action i,
.duration-item i,
.badge-spl i,
.tab-button i,
.modal-tab-btn i,
.btn-pagination i,
.btn-submit i,
.selected-pegawai-details i,
.btn-secondary-action i {
  margin-right: 0.5rem !important;
}
</style>
