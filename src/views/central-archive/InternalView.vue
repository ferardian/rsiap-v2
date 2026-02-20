<template>
  <div class="internal-view-wrapper">
    <div class="internal-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-file-signature"></i>
          </div>
          <div>
            <h1 class="hero-title">Surat Internal</h1>
            <p class="hero-subtitle">Manajemen arsip surat internal dan undangan rapat RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-label">Total Surat</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-card warning">
            <span class="stat-label">Pengajuan</span>
            <span class="stat-value">{{ stats.pengajuan }}</span>
          </div>
          <div class="stat-card success">
            <span class="stat-label">Disetujui</span>
            <span class="stat-value">{{ stats.disetujui }}</span>
          </div>
        </div>
      </div>

      <!-- Filter & Action Bar -->
      <div class="action-bar">
        <div class="filter-group">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari perihal atau nomor surat..."
              @keyup.enter="handleSearch"
            >
          </div>
          <div class="date-filter">
            <input type="date" v-model="filters.tgl_terbit_start" class="filter-input">
            <span>s/d</span>
            <input type="date" v-model="filters.tgl_terbit_end" class="filter-input">
          </div>
          <select v-model="filters.status" class="filter-input status-select">
            <option value="">Semua Status</option>
            <option value="pengajuan">Pengajuan</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <button class="btn-filter" @click="handleSearch" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Terapkan
          </button>
        </div>
        <button class="btn-add" @click="openAddModal">
          <i class="fas fa-plus"></i>
          Buat Surat Baru
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Unified Loading State -->
        <div v-if="loading" class="loading-state-unified">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Memuat Arsip Surat...</p>
        </div>

        <!-- Unified Empty State -->
        <div v-else-if="suratList.length === 0" class="empty-state-unified">
          <div class="empty-icon-container">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Arsip Kosong</h3>
          <p>Tidak ada data surat internal ditemukan untuk kriteria ini.</p>
          <button class="btn-refresh-empty" @click="handleSearch">
            <i class="fas fa-sync-alt"></i> Segarkan Halaman
          </button>
        </div>
        
        <!-- Desktop Table View -->
        <div v-else class="table-responsive desktop-view">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="150">No. Surat</th>
                <th>Perihal</th>
                <th width="180">Tgl Terbit</th>
                <th width="200">PJ</th>
                <th width="120">Status</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in suratList" :key="item.id" @click="viewDetail(item)">
                <td class="text-mono">{{ item.no_surat || '(Belum Terbit)' }}</td>
                <td class="fw-bold">{{ item.perihal }}</td>
                <td>{{ formatDate(item.tgl_terbit) }}</td>
                <td>
                  <div class="pj-info">
                    <span class="pj-name">{{ item.penanggung_jawab?.nama || '-' }}</span>
                    <small class="pj-nik text-muted">{{ item.pj }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', item.status]">
                    {{ capitalize(item.status) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button class="btn-icon edit" title="Edit" @click="openEditModal(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="Hapus" @click="confirmDelete(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div v-if="!loading && suratList.length > 0" class="mobile-view">
          <div v-for="item in suratList" :key="item.id" class="mobile-card" @click="viewDetail(item)">
            <div class="mobile-card-header">
              <span class="mobile-card-no text-mono">{{ item.no_surat || 'Draft' }}</span>
              <span :class="['status-badge-mini', item.status]">{{ capitalize(item.status) }}</span>
            </div>
            <div class="mobile-card-body">
              <h3 class="mobile-card-perihal">{{ item.perihal }}</h3>
              <div class="mobile-card-meta">
                <div class="meta-item">
                  <i class="far fa-calendar-alt"></i>
                  {{ formatDate(item.tgl_terbit) }}
                </div>
                <div class="meta-item">
                  <i class="far fa-user"></i>
                  {{ item.penanggung_jawab?.nama }}
                </div>
              </div>
            </div>
            <div class="mobile-card-footer" @click.stop>
              <button class="btn-mobile-edit" @click="openEditModal(item)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn-mobile-delete" @click="confirmDelete(item)">
                <i class="fas fa-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination-footer">
          <button 
            :disabled="pagination.current_page === 1" 
            @click="changePage(pagination.current_page - 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
          <button 
            :disabled="pagination.current_page === pagination.last_page" 
            @click="changePage(pagination.current_page + 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container main-modal">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Surat Internal' : 'Tambah Surat Internal' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSurat" id="suratForm">
            <div class="form-row">
              <div class="form-group col-full">
                <label>Perihal <span class="required">*</span></label>
                <input v-model="formData.perihal" type="text" placeholder="Contoh: Undangan Rapat Koordinasi" required>
              </div>
            </div>
            
            <div class="form-row flex-row">
              <div class="form-group flex-1">
                <label>Tanggal Terbit <span class="required">*</span></label>
                <input v-model="formData.tgl_terbit" type="date" required>
              </div>
              <div class="form-group flex-1">
                <label>Status <span class="required">*</span></label>
                <select v-model="formData.status" required>
                  <option value="pengajuan">Pengajuan</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Penanggung Jawab <span class="required">*</span></label>
                <SearchableSelect 
                  v-model="formData.pj"
                  :options="pegawaiList"
                  label-key="nama"
                  value-key="nik"
                  placeholder="Cari PJ..."
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Catatan</label>
                <textarea v-model="formData.catatan" rows="3" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
              </div>
            </div>

            <!-- Undangan Toggle -->
            <div class="undangan-toggle">
              <label class="toggle-container">
                <input type="checkbox" v-model="withUndangan">
                <span class="checkmark"></span>
                Sertakan Informasi Undangan / Pertemuan
              </label>
            </div>

            <div v-if="withUndangan" class="undangan-section animate-slide-down">
              <div class="form-row flex-row">
                <div class="form-group flex-1">
                  <label>Waktu Pertemuan <span class="required">*</span></label>
                  <input v-model="formData.undangan.tanggal" type="datetime-local" :required="withUndangan">
                </div>
                <div class="form-group flex-1">
                  <label>Lokasi <span class="required">*</span></label>
                  <input v-model="formData.undangan.lokasi" type="text" placeholder="Ruang Pertemuan" :required="withUndangan">
                </div>
              </div>
              <div class="form-group col-full">
                <label>Deskripsi Acara</label>
                <textarea v-model="formData.undangan.deskripsi" rows="2" placeholder="Agenda singkat pertemuan..."></textarea>
              </div>

              <!-- Recipient Selection in Form -->
              <div class="recipient-form-section mt-3">
                <div class="flex-between mb-2">
                  <label class="info-label-mini">Penerima Undangan ({{ formRecipients.length }})</label>
                  <button type="button" class="btn-manage-rec primary" @click="openFormRecipientModal">
                    <i class="fas fa-users-plus"></i> Tambah / Pilih Penerima
                  </button>
                </div>
                <div class="recipient-preview-container">
                  <div v-if="formRecipients.length > 0" class="recipient-tag-container mini">
                    <span v-for="nik in formRecipients" :key="nik" class="recipient-tag-modern mini">
                      {{ getPegawaiName(nik) }}
                    </span>
                  </div>
                  <div v-else class="empty-preview">
                    Daftar penerima belum dipilih
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Batal</button>
          <button type="submit" form="suratForm" class="btn-save-modal" :disabled="submitting">
            <i class="fas" :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            {{ submitting ? 'Menyimpan...' : 'Simpan Surat' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail & Recipient Drawer -->
    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <div class="drawer-container animate-slide-left">
        <div class="drawer-header">
          <div class="drawer-header-content">
            <span class="drawer-subtitle">Detail Surat Internal</span>
            <h2 class="drawer-title">{{ selectedItem?.perihal }}</h2>
          </div>
          <button class="btn-close-drawer" @click="closeDetail">&times;</button>
        </div>
        
        <div class="drawer-body">
          <!-- Detail Card (Simulated as section for Drawer) -->
          <div class="card-section">
            <div class="card-section-header">
              <i class="fas fa-info-circle"></i>
              <span>Detail Surat</span>
            </div>
            <div class="info-grid mt-2">
              <div class="info-item">
                <label>No. Surat</label>
                <div class="info-value text-mono">{{ selectedItem?.no_surat || '(Belum Terbit)' }}</div>
              </div>
              <div class="info-item">
                <label>Status</label>
                <div class="info-value">
                  <span :class="['status-badge', selectedItem?.status]">
                    {{ capitalize(selectedItem?.status) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <label>Tanggal Terbit</label>
                <div class="info-value">{{ formatDate(selectedItem?.tgl_terbit) }}</div>
              </div>
              <div class="info-item">
                <label>Penanggung Jawab</label>
                <div class="info-value">
                  <strong>{{ selectedItem?.penanggung_jawab?.nama }}</strong><br>
                  <small class="text-muted">{{ selectedItem?.pj }}</small>
                </div>
              </div>
            </div>
            <div v-if="selectedItem?.catatan" class="mt-3">
              <label class="info-label-mini">Catatan</label>
              <p class="section-text-small text-muted">{{ selectedItem.catatan }}</p>
            </div>
          </div>

          <!-- Recipient Card (Only if invitation) -->
          <div v-if="selectedItem?.undangan" class="card-section mt-4">
            <div class="card-section-header">
              <div class="flex-grow">
                <i class="fas fa-users"></i>
                <span>Penerima Surat</span>
              </div>
              <button 
                v-if="selectedItem?.undangan"
                class="btn-add-mini modern" 
                @click="openRecipientModal"
              >
                <i class="fas fa-user-plus"></i> Kelola
              </button>
            </div>

            <div v-if="recipientLoading" class="mini-loading py-3">
              <i class="fas fa-spinner fa-spin"></i> Memuat...
            </div>
            
            <div v-else class="recipient-tag-container mt-3">
              <div v-for="rec in recipients" :key="rec.penerima" class="recipient-tag-modern">
                {{ rec.pegawai?.nama || rec.detail?.nama || rec.penerima }}
              </div>
              <div v-if="recipients.length === 0" class="empty-mini">
                <i class="fas fa-user-slash"></i>
                <p>Penerima belum ditambahkan</p>
              </div>
            </div>
          </div>

          <!-- Meeting Info if Undangan -->
          <div v-if="selectedItem?.undangan" class="card-section mt-4 warning-light">
            <div class="card-section-header">
              <i class="fas fa-calendar-check"></i>
              <span>Informasi Pertemuan</span>
            </div>
            <div class="info-grid mt-2">
              <div class="info-item">
                <label>Waktu</label>
                <div class="info-value">{{ formatDateTime(selectedItem.undangan.tanggal) }}</div>
              </div>
              <div class="info-item">
                <label>Lokasi</label>
                <div class="info-value">{{ selectedItem.undangan.lokasi }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Recipient Modal -->
    <InternalRecipientModal
      :show="showRecipientModal"
      :initial-selected="recipients"
      :loading="recipientSaving"
      @close="showRecipientModal = false"
      @save="saveBulkRecipients"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { suratInternalService } from '@/services/suratInternalService'
import { pegawaiService } from '@/services/pegawaiService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import InternalRecipientModal from './components/InternalRecipientModal.vue'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const submitting = ref(false)
const suratList = ref([])
const searchQuery = ref('')
const filters = ref({
  tgl_terbit_start: '',
  tgl_terbit_end: '',
  status: ''
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})
const stats = ref({
  total: 0,
  pengajuan: 0,
  disetujui: 0,
  ditolak: 0
})

// Modal & Form State
const showModal = ref(false)
const isEdit = ref(false)
const withUndangan = ref(false)
const formData = ref({
  id: null,
  perihal: '',
  tgl_terbit: new Date().toISOString().split('T')[0],
  pj: '',
  status: 'pengajuan',
  catatan: '',
  undangan: {
    tanggal: '',
    lokasi: '',
    deskripsi: ''
  }
})

// Detail & Recipient State
const showDetail = ref(false)
const selectedItem = ref(null)
const recipients = ref([])
const recipientLoading = ref(false)
const recipientSaving = ref(false)
const showRecipientModal = ref(false)
const isFormRecipient = ref(false)
const formRecipients = ref([])
const pegawaiList = ref([])

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const payload = {
      page: page,
      limit: 10,
      sort: [{ field: 'created_at', direction: 'desc' }],
      filters: []
    }

    if (searchQuery.value) {
      payload.search = { value: searchQuery.value }
    }

    if (filters.value.status) {
      payload.filters.push({ field: 'status', operator: '=', value: filters.value.status })
    }

    if (filters.value.tgl_terbit_start) {
      payload.filters.push({ field: 'tgl_terbit', operator: '>=', value: filters.value.tgl_terbit_start })
    }
    if (filters.value.tgl_terbit_end) {
      payload.filters.push({ field: 'tgl_terbit', operator: '<=', value: filters.value.tgl_terbit_end })
    }

    const response = await suratInternalService.getSuratInternal(payload)
    suratList.value = response.data.data || []
    
    // Orion uses 'meta' for pagination, while some v2 endpoints might use 'pagination' or the root object
    const meta = response.data.meta || response.data.pagination || response.data
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || 1,
      total: meta.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    if (error.response?.status !== 401) {
      Swal.fire('Error', 'Gagal memuat data surat internal', 'error')
    }
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await suratInternalService.getStats()
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (err) {
    console.error('Error fetching global stats:', err)
  }
}

const loadPegawai = async () => {
  try {
    const response = await pegawaiService.getKaryawanList({ status: 'AKTIF' })
    pegawaiList.value = response.data.data
  } catch (error) {
    console.error('Error fetching pegawai:', error)
  }
}

const handleSearch = () => {
  pagination.value.current_page = 1
  fetchData(1)
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData(page)
}

const openAddModal = () => {
  isEdit.value = false
  withUndangan.value = false
  formRecipients.value = []
  formData.value = {
    id: null,
    perihal: '',
    tgl_terbit: new Date().toISOString().split('T')[0],
    pj: '',
    status: 'pengajuan',
    catatan: '',
    undangan: {
      tanggal: '',
      lokasi: '',
      deskripsi: ''
    }
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  withUndangan.value = !!item.undangan
  formRecipients.value = []
  
  // If invitation exists, load recipients for preview
  if (item.undangan) {
    loadFormRecipients(item.undangan.id)
  }

  formData.value = {
    id: item.id,
    perihal: item.perihal,
    tgl_terbit: item.tgl_terbit,
    pj: item.pj,
    status: item.status,
    catatan: item.catatan,
    undangan: item.undangan ? {
      tanggal: item.undangan.tanggal.replace(' ', 'T').substring(0, 16),
      lokasi: item.undangan.lokasi,
      deskripsi: item.undangan.deskripsi
    } : {
      tanggal: '',
      lokasi: '',
      deskripsi: ''
    }
  }
  showModal.value = true
}

const loadFormRecipients = async (undanganId) => {
  try {
    const response = await suratInternalService.getPenerima(undanganId)
    formRecipients.value = (response.data.data || []).map(r => r.penerima)
  } catch (err) {
    console.error('Error loading form recipients:', err)
  }
}

const closeModal = () => {
  showModal.value = false
}

const saveSurat = async () => {
  submitting.value = true
  try {
    const payload = { ...formData.value }
    if (!withUndangan.value) {
      delete payload.undangan
    }

    let response
    if (isEdit.value) {
      response = await suratInternalService.updateSuratInternal(payload.id, payload)
    } else {
      response = await suratInternalService.storeSuratInternal(payload)
    }

    // Handle Recipients after Surat/Undangan saved
    // We need to re-fetch the item to get the invitation ID if it's new
    if (withUndangan.value && formRecipients.value.length > 0) {
      // For Orion/v2 updateOrCreate logic, we might need a moment to let the hook finish
      // or directly use the response if it includes the created undagan
      const savedItem = response.data.data
      let invitationId = savedItem.undangan?.id
      
      // If invitation ID not present (hooks are async sometimes), we might need to search for it
      // But usually Orion returns the saved entity with relations if requested?
      // Let's try to get it from the item
      if (!invitationId) {
        // Fallback: search for the surat again to get invitation
        const detailRes = await suratInternalService.getSuratInternalById(savedItem.id)
        invitationId = detailRes.data.data.undangan?.id
      }

      if (invitationId) {
        await suratInternalService.storePenerima({
          undangan_id: invitationId,
          penerima: formRecipients.value
        })
      }
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Surat internal berhasil ${isEdit.value ? 'diperbarui' : 'disimpan'}`,
      background: '#f0fdf4',
      color: '#166534',
      iconColor: '#22c55e',
      customClass: {
        container: 'swal-highest'
      }
    })
    closeModal()
    fetchData(pagination.value.current_page)
    fetchStats()
  } catch (error) {
    console.error('Error saving surat:', error)
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error')
  } finally {
    submitting.value = false
  }
}

const openFormRecipientModal = () => {
  isFormRecipient.value = true
  // Mock recipients for modal preview
  recipients.value = formRecipients.value.map(nik => ({
    penerima: nik,
    pegawai: pegawaiList.value.find(p => p.nik === nik)
  }))
  showRecipientModal.value = true
}

const getPegawaiName = (nik) => {
  if (!nik) return '-'
  const p = pegawaiList.value.find(p => p.nik === nik)
  if (p) return p.nama
  
  // Fallback find in current recipients
  const rec = recipients.value.find(r => (r.penerima === nik || r.nik === nik))
  return rec?.detail?.nama || rec?.pegawai?.nama || rec?.nama || nik
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Hapus Surat?',
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await suratInternalService.deleteSuratInternal(item.id)
        Swal.fire('Terhapus!', 'Surat berhasil dihapus.', 'success')
        fetchData(pagination.value.current_page)
        fetchStats()
      } catch (error) {
        Swal.fire('Gagal', 'Gagal menghapus surat.', 'error')
      }
    }
  })
}

const viewDetail = async (item) => {
  selectedItem.value = item
  showDetail.value = true
  recipients.value = []
  
  if (item.undangan && item.undangan.id) {
    fetchRecipients(item.undangan.id)
  }
}

const closeDetail = () => {
  showDetail.value = false
  showRecipientModal.value = false
}

const fetchRecipients = async (undanganId) => {
  recipientLoading.value = true
  try {
    const response = await suratInternalService.getPenerima(undanganId)
    // Response data for CompleteCollection is in data.data
    recipients.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching recipients:', error)
    recipients.value = []
  } finally {
    recipientLoading.value = false
  }
}

const openRecipientModal = () => {
  isFormRecipient.value = false
  showRecipientModal.value = true
}

const saveBulkRecipients = async (nikList) => {
  if (isFormRecipient.value) {
    formRecipients.value = nikList
    showRecipientModal.value = false
    isFormRecipient.value = false
    return
  }

  if (!selectedItem.value?.undangan) return
  
  recipientSaving.value = true
  try {
    const payload = {
      undangan_id: selectedItem.value.undangan.id,
      penerima: nikList
    }
    await suratInternalService.storePenerima(payload)
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    Toast.fire({
      icon: 'success',
      title: 'Penerima diperbarui',
      background: '#f0fdf4',
      color: '#166534',
      iconColor: '#22c55e',
      customClass: {
        container: 'swal-highest'
      }
    })
    fetchRecipients(selectedItem.value.undangan.id)
    showRecipientModal.value = false
  } catch (error) {
    console.error('Error saving bulk recipients:', error)
    Swal.fire('Gagal', 'Gagal menyimpan daftar penerima', 'error')
  } finally {
    recipientSaving.value = false
  }
}

const removeRecipient = (rec) => {
  // Logic to remove recipient if endpoint exists
  // For now simple placeholder as per adopt requirement
  Swal.fire('Info', 'Fitur hapus penerima akan segera tersedia', 'info')
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB'
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

onMounted(() => {
  fetchData()
  fetchStats()
  loadPegawai()
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --bg-app: #f1f5f9;
  --surface: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

.internal-view-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 0.5rem 1rem;
  color: #1e293b;
}

.internal-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -1.5rem;
  z-index: 10;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2);
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
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
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
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
  max-width: 400px;
  line-height: 1.4;
}

.hero-stats {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.875rem 1.5rem;
  border-radius: 16px;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.8;
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
}

/* Action Bar */
.action-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 2.25rem 1.5rem 1.5rem 1.5rem;
  border-radius: 20px;
  border: 1px solid white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 1rem 1.5rem 1rem;
  position: relative;
  z-index: 5;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1 1 auto;
}

.search-box {
  position: relative;
  flex: 1 1 250px;
  min-width: 200px;
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
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-input {
  box-sizing: border-box;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  flex-shrink: 0;
}

.filter-input.status-select {
  min-width: 160px;
}

.btn-filter {
  padding: 0.625rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-filter:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-add {
  padding: 0.625rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-add:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Modern Table */
.content-area {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  cursor: pointer;
}

.modern-table tbody tr:hover {
  background: #fbfdff;
}

.text-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: #475569;
}

.pj-info {
  display: flex;
  flex-direction: column;
}

.pj-name {
  font-weight: 500;
  color: #1e293b;
}

.pj-nik {
  font-size: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.status-badge.pengajuan { background: #fee2e2; color: #991b1b; }
.status-badge.disetujui { background: #dcfce7; color: #166534; }
.status-badge.ditolak { background: #f1f5f9; color: #475569; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.edit:hover { border-color: #3b82f6; color: #3b82f6; }
.btn-icon.delete:hover { border-color: #ef4444; color: #ef4444; }

.status-badge-mini {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-badge-mini.pengajuan { background: #fee2e2; color: #b91c1c; }
.status-badge-mini.disetujui { background: #dcfce7; color: #15803d; }
.status-badge-mini.ditolak { background: #f1f5f9; color: #64748b; }

/* Unified Loading & Empty States */
.loading-state-unified {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  color: #3b82f6;
}

.spinner-container {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.empty-state-unified {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon-container {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-state-unified h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #334155;
  margin: 0 0 0.5rem 0;
}

.empty-state-unified p {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  max-width: 300px;
}

.btn-refresh-empty {
  padding: 0.75rem 1.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-refresh-empty:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* Pagination */
.pagination-footer {
  padding: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #475569;
}

.form-group input, 
.form-group select, 
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.flex-row {
  display: flex;
  gap: 1rem;
}

.flex-1 { flex: 1; }

.required { color: #ef4444; }

.undangan-toggle {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin: 1.5rem 0;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.undangan-section {
  border: 1px dashed #cbd5e1;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save-modal {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

.drawer-container {
  width: 100%;
  max-width: 500px;
  background: #f8fafc;
  height: 100%;
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.drawer-subtitle {
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.drawer-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.info-item label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #1e293b;
  word-break: break-all;
}

.info-label-mini {
  font-size: 0.625rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.section-text-small {
  font-size: 0.8rem;
  line-height: 1.5;
  margin-top: 0.25rem;
}

/* Card Sections in Drawer */
.card-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.card-section.warning-light {
  background: #fffbeb;
  border-color: #fde68a;
}

.card-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-section-header i {
  color: #3b82f6;
}

.card-section-header span {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}

/* Recipient Tags Modern */
.recipient-tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipient-tag-modern {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.btn-add-mini.modern {
  padding: 0.4rem 0.8rem;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-mini.modern:hover {
  background: #3b82f6;
  color: white;
}

.empty-mini {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
}

.empty-mini i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-mini p {
  font-size: 0.75rem;
  margin: 0;
}

.btn-close-drawer {
  background: #f1f5f9;
  border: none;
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-drawer:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.mini-loading {
  text-align: center;
  color: #3b82f6;
  font-size: 0.875rem;
}

/* Mobile View Adjustments */
.mobile-view { display: none; }

@media (max-width: 1024px) {
  .internal-view-wrapper {
    padding: 1rem 0.5rem;
  }
  
  .hero-header { 
    padding: 1.5rem 1.25rem; 
    border-radius: 16px; 
    margin-bottom: 1.25rem; 
    margin-top: 0; 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1rem; 
  }
  .hero-stats { display: none; }
  .hero-content { gap: 0.75rem; width: 100%; }
  .hero-icon { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 12px; flex-shrink: 0; }
  .hero-title { font-size: 1.5rem; }
  .hero-subtitle { font-size: 0.85rem; max-width: 100%; opacity: 0.9; }

  .action-bar { 
    margin: 0 0 1.25rem 0; 
    padding: 2.25rem 1rem 1.25rem 1rem; 
    flex-direction: column; 
    align-items: stretch;
    gap: 1rem;
    border-radius: 16px;
  }
  .filter-group { flex-direction: column; width: 100%; gap: 1rem; }
  .search-box { width: 100%; }
  .search-box input { width: 100%; }
  
  .date-filter { 
    width: 100%; 
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
    background: transparent; 
    padding: 0; 
    border: none;
  }
  .date-filter span { font-weight: 600; font-size: 0.75rem; color: #94a3b8; text-align: center; }
  .date-filter .filter-input { 
    width: 100%; 
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 0.6rem 0.5rem; 
    border-radius: 8px; 
    font-size: 0.8rem;
  }
  .filter-input.status-select { 
    width: 100%;
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 0.75rem; 
    border-radius: 8px; 
  }
  .btn-filter { width: 100%; justify-content: center; padding: 0.75rem; border-radius: 8px; }
  .btn-add { width: 100%; justify-content: center; padding: 0.75rem; order: -1; border-radius: 8px; margin-bottom: 0.5rem; }

  .desktop-view { display: none; }
  .mobile-view { display: block; padding: 0; }

  .mobile-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .mobile-card:active {
    transform: scale(0.98);
    background: #fbfdff;
  }

  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px dashed #e2e8f0;
    background: transparent;
  }

  .mobile-card-no {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
  }

  .mobile-card-perihal {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    color: #1e293b;
    line-height: 1.3;
  }

  .mobile-card-meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.85rem;
    color: #64748b;
  }

  .meta-item i {
    width: 16px;
    color: #3b82f6;
  }

  .mobile-card-footer {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #f8fafc;
    background: transparent;
  }

  .btn-mobile-edit, .btn-mobile-delete {
    flex: 1;
    padding: 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-mobile-edit {
    background: #f1f5f9;
    color: #475569;
    border: none;
  }

  .btn-mobile-edit:hover { background: #e2e8f0; }

  .btn-mobile-delete {
    background: #fffafa;
    color: #ef4444;
    border: 1px solid #fee2e2;
  }

  .btn-mobile-delete:hover { background: #fee2e2; }
}

/* Recipient Form Section */
.recipient-form-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
}

.btn-manage-rec {
  padding: 0.4rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-manage-rec:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.recipient-preview-container {
  min-height: 40px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  background: #fbfdff;
}

.recipient-tag-modern.mini {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.empty-preview {
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  padding-top: 0.25rem;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-grow {
  flex: 1;
}

.btn-manage-rec.primary {
  background: #3b82f6;
  color: white;
  border: none;
  font-weight: 700;
  padding: 0.5rem 1rem;
}

.btn-manage-rec.primary:hover {
  background: #2563eb;
}

.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.ml-2 { margin-left: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }
.p-3 { padding: 0.75rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.fw-bold { font-weight: 700; }
.flex-row { display: flex; gap: 1rem; }
.flex-1 { flex: 1; }

/* Animations */
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

.animate-slide-left {
  animation: slideLeft 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>

<style>
.swal2-container {
  z-index: 100000 !important;
}
</style>
