<template>
  <div class="karyawan-container">
    <!-- Header -->
    <div class="page-header">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Search and Add (only for Data Karyawan tab) -->
      <div v-if="activeTab === 'data-karyawan'" class="header-actions">
        <div class="search-filter-wrapper">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch"
              placeholder="Cari nama, NIP, atau jabatan..."
            />
          </div>
          <div class="filter-group">
            <select 
            v-model="statusFilter" 
            @change="loadPegawai(1)"
            :class="['filter-select', statusFilter.toLowerCase()]"
          >
              <option value="AKTIF">Status: Aktif</option>
              <option value="NON-AKTIF">Status: Tidak Aktif</option>
              <option value="ALL">Status: Semua</option>
            </select>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn-export" @click="exportToExcel" :disabled="loadingExport">
            <i v-if="loadingExport" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-file-excel"></i>
            <span>Export Excel</span>
          </button>
          <button v-if="canCreate" class="btn-add" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'data-karyawan'">
      <!-- Alert Section: Pegawai Tanpa Email -->
      <section v-if="pegawaiTanpaEmail.length > 0 && activeTab === 'data-karyawan'" class="alert-section mb-4">
        <div class="alert-card warning">
          <div class="alert-header">
            <div class="alert-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-title">
              <h3>Data Email Pegawai Bermasalah</h3>
              <p>Terdapat {{ pegawaiTanpaEmail.length }} pegawai dengan email belum terdaftar atau format tidak valid.</p>
            </div>
            <button @click="showAllTanpaEmail = !showAllTanpaEmail" class="btn-toggle-alert">
              <i :class="showAllTanpaEmail ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              <span>{{ showAllTanpaEmail ? 'Sembunyikan' : 'Lihat Detail' }}</span>
            </button>
          </div>
          
          <div v-show="showAllTanpaEmail" class="alert-body mt-4">
            <div class="table-container-minimal">
              <table class="alert-table">
                <thead>
                  <tr>
                    <th class="ps-4">NIK</th>
                    <th>Nama Pegawai</th>
                    <th>Departemen/Unit</th>
                    <th class="pe-4">Status Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="emp in pegawaiTanpaEmail" :key="emp.nik">
                    <td class="ps-4"><code>{{ emp.nik }}</code></td>
                    <td class="fw-medium">{{ emp.nama }}</td>
                    <td class="text-muted">{{ emp.departemen }}</td>
                    <td class="pe-4">
                      <span 
                        :class="['email-badge', emp.email === '(Belum Terdaftar)' ? 'missing' : 'invalid']"
                        @click="openUpdateEmailModal(emp)"
                        style="cursor: pointer;"
                        title="Klik untuk update email"
                      >
                        {{ emp.email }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data...</p>
      </div>

      <!-- Data Table (Desktop) -->
      <div v-else-if="!loading && pegawaiList.length > 0" class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIP</th>
                <th>Jenis Kelamin</th>
                <th>TTL</th>
                <th>Jml. Keluarga</th>
                <th>Alamat</th>
                <th>Pendidikan</th>
                <th>No. KTP</th>
                <th>No. Telp</th>
                <!-- Jabatan merged with Name -->
                <th>Departemen</th>
                <th>Mulai Kerja</th>
                <th>Tgl. Keluar</th>
                <th>Masa Kerja</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pegawai in pegawaiList" :key="pegawai.nip" @contextmenu.prevent="showContextMenu($event, pegawai)">
                <td>
                  <div class="employee-profile">
                    <div class="avatar">
                      <!-- Photo disabled to prevent 404 errors -->
                      <span class="initials">{{ getInitials(pegawai.nama) }}</span>
                    </div>
                    <div class="employee-info">
                      <span class="emp-name">{{ pegawai.nama }}</span>
                      <span class="emp-role">{{ pegawai.jbtn || '-' }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="nip-text">{{ pegawai.nip }}</span></td>
                <td>{{ pegawai.jk || '-' }}</td>
                <td>
                  <div class="ttl">
                    {{ pegawai.tmp_lahir || '-' }},<br>
                    {{ formatDate(pegawai.tgl_lahir) }}
                  </div>
                </td>
                <td class="text-center">{{ pegawai.jml_keluarga || 0 }}</td>
                <td>
                  <div class="alamat-cell">{{ pegawai.alamat || '-' }}</div>
                </td>
                <td>{{ pegawai.pendidikan || '-' }}</td>
                <td>{{ pegawai.no_ktp || '-' }}</td>
                <td>{{ pegawai.no_telp || '-' }}</td>
                <!-- Jabatan moved to name column subtitle -->
                <td>{{ pegawai.departemen || '-' }}</td>
                <td>{{ formatDate(pegawai.mulai_kerja) }}</td>
                <td>
                  <span v-if="pegawai.tgl_keluar" class="departure-date">
                    {{ formatDate(pegawai.tgl_keluar) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <div class="tenure-badge">
                    <i class="fas fa-history"></i>
                    {{ calculateTenure(pegawai.mulai_kerja) }}
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(pegawai.stts_aktif)]">
                    <i :class="getStatusIcon(pegawai.stts_aktif)"></i>
                    {{ pegawai.stts_aktif }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-detail" @click="openDetailModal(pegawai)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="canUpdate" class="btn-edit" @click="openEditModal(pegawai)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button v-if="canDelete" class="btn-delete" @click="confirmDelete(pegawai)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-qrcode" @click="openQrModal(pegawai)" title="Generate QR Code">
                      <i class="fas fa-qrcode"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-users"></i>
        <p>Tidak ada data karyawan</p>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination">
        <button 
          class="btn-page" 
          :disabled="pagination.current_page === 1"
          @click="changePage(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
          Sebelumnya
        </button>
        <span class="page-info">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
          ({{ pagination.total }} total)
        </span>
        <button 
          class="btn-page" 
          :disabled="pagination.current_page === pagination.last_page"
          @click="changePage(pagination.current_page + 1)"
        >
          Selanjutnya
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Loading Detail Overlay -->
      <div v-if="loadingDetail" class="detail-loading-overlay">
        <div class="spinner"></div>
      </div>

      <!-- Pegawai Form Modal -->
      <PegawaiFormModal 
        :show="showFormModal"
        :is-edit="isEditMode"
        :pegawai-data="selectedPegawai"
        @close="showFormModal = false"
        @saved="loadPegawai"
      />

      <!-- Pegawai Detail Modal -->
      <PegawaiDetailModal 
        :show="showDetailModal"
        :pegawai="selectedPegawai"
        :auto-open-upload="autoOpenUpload"
        @close="handleCloseDetail"
      />

      <!-- Update Email Modal -->
      <div v-if="showUpdateEmailModal" class="modal-overlay" @click="showUpdateEmailModal = false">
        <div class="modal-content small" @click.stop>
          <div class="modal-header">
            <h3>Update Email Pegawai</h3>
            <button class="btn-close" @click="showUpdateEmailModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="employee-info-mini mb-4">
              <span class="label">Nama Karyawan:</span>
              <span class="value">{{ selectedNamaForEmail }}</span>
            </div>
            <div class="form-group mb-4">
              <label for="update-email">Alamat Email Baru</label>
              <input 
                id="update-email"
                v-model="emailToUpdate" 
                type="email" 
                class="form-control" 
                placeholder="contoh@rsiaaisyiyah.com"
                @keyup.enter="handleUpdateEmail"
              >
              <small class="text-muted">Pastikan format email sudah benar.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showUpdateEmailModal = false">Batal</button>
            <button class="btn-confirm" @click="handleUpdateEmail" :disabled="submittingEmail">
              <i v-if="submittingEmail" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              Simpan Email
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Konfirmasi Hapus</h3>
            <button class="btn-close" @click="showDeleteModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus karyawan <strong>{{ selectedPegawai?.nama }}</strong>?</p>
            <p class="warning-text">Data yang dihapus tidak dapat dikembalikan.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
            <button class="btn-confirm-delete" @click="deletePegawai">
              <i class="fas fa-trash"></i>
              Hapus
            </button>
          </div>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div v-if="showQrModal" class="modal-overlay" @click="showQrModal = false">
        <div class="modal-content qr-modal" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-qrcode me-2"></i>QR Code Tanda Tangan</h3>
            <button class="btn-close" @click="showQrModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body text-center">
            <div class="qr-employee-info">
              <div class="qr-avatar">{{ getInitials(qrPegawai?.nama) }}</div>
              <div>
                <div class="qr-name">{{ qrPegawai?.nama }}</div>
                <div class="qr-nik">NIK: {{ qrPegawai?.nik || qrPegawai?.nip }}</div>
                <div class="qr-jabatan">{{ qrPegawai?.jbtn || '-' }}</div>
              </div>
            </div>

            <div class="qr-wrapper">
              <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            </div>

            <div class="qr-text-content">
              <i class="fas fa-info-circle me-1"></i>
              <em>{{ qrTextContent }}</em>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showQrModal = false">Tutup</button>
            <button class="btn-download-qr" @click="downloadQr">
              <i class="fas fa-download"></i>
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Staf Klinis Tab -->
    <StafKlinisTab v-else-if="activeTab === 'staf-klinis'" />

    <!-- Statistik Tab -->
    <StatistikTab v-else-if="activeTab === 'statistik'" />

    <!-- Komite Tab -->
    <CommitteeTab v-else-if="activeTab === 'komite'" />
    <!-- Context Menu -->
    <Transition name="fade">
      <div 
        v-if="contextMenu.visible"
        ref="contextMenuRef"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <div class="context-menu-item" @click="handleContextAction('detail')">
          <i class="fas fa-eye text-primary"></i>
          <span>Lihat Detail</span>
        </div>
        <div v-if="canUpdate" class="context-menu-item" @click="handleContextAction('edit')">
          <i class="fas fa-edit text-info"></i>
          <span>Edit Data</span>
        </div>
        <div class="context-menu-item" @click="handleContextAction('upload')">
          <i class="fas fa-file-upload text-warning"></i>
          <span>Unggah Berkas</span>
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" @click="handleContextAction('copy_nik')">
          <i class="fas fa-copy text-secondary"></i>
          <span>Salin NIK</span>
        </div>
        <div class="context-menu-item" @click="handleContextAction('copy_nip')">
          <i class="fas fa-id-badge text-secondary"></i>
          <span>Salin NIP</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive, nextTick, onBeforeUnmount } from 'vue'
import QRCode from 'qrcode'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '../../stores/menu'
import { pegawaiService } from '../../services/pegawaiService'
import StafKlinisTab from './components/StafKlinisTab.vue'
import StatistikTab from './components/StatistikTab.vue'
import PegawaiFormModal from './components/PegawaiFormModal.vue'
import PegawaiDetailModal from './components/PegawaiDetailModal.vue' // Added
import CommitteeTab from './components/CommitteeTab.vue'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'

const toast = useToast()

const router = useRouter()
const route = useRoute()

// Stores
const menuStore = useMenuStore()

// State
const tabs = [
  { id: 'data-karyawan', label: 'Data Karyawan', icon: 'fas fa-users' },
  { id: 'staf-klinis', label: 'Staf Klinis', icon: 'fas fa-user-md' },
  { id: 'komite', label: 'Komite', icon: 'fas fa-users-cog' },
  { id: 'statistik', label: 'Statistik', icon: 'fas fa-chart-pie' }
]
const activeTab = ref(route.query.tab || 'data-karyawan')
const loading = ref(false)
const loadingDetail = ref(false)
const loadingExport = ref(false)
const searchQuery = ref('')
const pegawaiList = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0
})
const statusFilter = ref('AKTIF')
const showDeleteModal = ref(false)
const showFormModal = ref(false)
const showDetailModal = ref(false) // Added
const isEditMode = ref(false)
const selectedPegawai = ref(null)
const pegawaiTanpaEmail = ref([])
const showAllTanpaEmail = ref(false)
const loadingTanpaEmail = ref(false)
const showUpdateEmailModal = ref(false)
const emailToUpdate = ref('')
const selectedNikForEmail = ref('')
const selectedNamaForEmail = ref('')
const submittingEmail = ref(false)
const autoOpenUpload = ref(false)

// QR Code State
const showQrModal = ref(false)
const qrPegawai = ref(null)
const qrCanvas = ref(null)
const qrTextContent = ref('')

// Context Menu State
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null
})
const contextMenuRef = ref(null)

// Computed - Permissions
// MENU_ID 23 is for 'Data Karyawan'
const MENU_ID = 23

const canCreate = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_create')
})

const canUpdate = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_update')
})

const canDelete = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_delete')
})

// Methods
const loadPegawai = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      stts_aktif: statusFilter.value
    }
    const response = await pegawaiService.getPegawai(page, 50, params)
    if (response.data.success) {
      pegawaiList.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading pegawai:', error)
    toast.error('Gagal memuat data karyawan')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (searchQuery.value.trim().length < 2) {
    loadPegawai()
    return
  }
  
  loading.value = true
  try {
    const params = {
      stts_aktif: statusFilter.value
    }
    const response = await pegawaiService.searchPegawai(searchQuery.value, 50, params)
    if (response.data.success) {
      pegawaiList.value = response.data.data
      // Reset pagination for search results
      pagination.value = {
        current_page: 1,
        last_page: 1,
        per_page: response.data.data.length,
        total: response.data.data.length
      }
    }
  } catch (error) {
    console.error('Error searching pegawai:', error)
  } finally {
    loading.value = false
  }
}

const exportToExcel = async () => {
  if (loadingExport.value) return
  
  loadingExport.value = true
  try {
    const params = {
      stts_aktif: statusFilter.value
    }
    
    let response
    if (searchQuery.value.trim().length >= 2) {
      response = await pegawaiService.searchPegawai(searchQuery.value, 10000, params)
    } else {
      response = await pegawaiService.getPegawai(1, 10000, params)
    }
    
    if (response.data && response.data.success) {
      const dataToExport = response.data.data
      
      if (dataToExport.length === 0) {
        toast.warning('Tidak ada data karyawan untuk diexport.')
        return
      }

      const wsData = []
      wsData.push([
        'No', 'NIP', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 
        'No KTP / NIK', 'No Telp', 'Jml. Keluarga', 'Departemen', 'Jabatan', 'Alamat', 
        'Pendidikan', 'Tanggal Masuk', 'Tanggal Keluar', 'Masa Kerja', 'Status'
      ])

      dataToExport.forEach((emp, index) => {
        wsData.push([
          index + 1,
          emp.nip || '-',
          emp.nama || '-',
          emp.jk === 'L' ? 'Laki-Laki' : emp.jk === 'P' ? 'Perempuan' : (emp.jk || '-'),
          emp.tmp_lahir || '-',
          emp.tgl_lahir ? formatDate(emp.tgl_lahir) : '-',
          emp.no_ktp || '-',
          emp.no_telp || '-',
          emp.jml_keluarga || 0,
          emp.departemen || '-',
          emp.jbtn || '-',
          emp.alamat || '-',
          emp.pendidikan || '-',
          emp.mulai_kerja ? formatDate(emp.mulai_kerja) : '-',
          emp.tgl_keluar ? formatDate(emp.tgl_keluar) : '-',
          emp.mulai_kerja ? calculateTenure(emp.mulai_kerja) : '-',
          emp.stts_aktif || '-'
        ])
      })

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Auto-size columns slightly
      const wscols = [
        {wch: 5}, {wch: 15}, {wch: 30}, {wch: 15}, {wch: 20}, {wch: 15},
        {wch: 20}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 20}, {wch: 40}, 
        {wch: 15}, {wch: 15}, {wch: 20}
      ]
      ws['!cols'] = wscols
      
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Data Karyawan")
      
      const filename = `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, filename)
      
      toast.success('Data berhasil diexport')
    } else {
      toast.error('Gagal mengambil data untuk diexport')
    }
  } catch (error) {
    console.error('Error exporting to excel:', error)
    toast.error('Terjadi kesalahan saat mengekspor data')
  } finally {
    loadingExport.value = false
  }
}

const changePage = (page) => {
  loadPegawai(page)
}

const fetchPegawaiTanpaEmail = async () => {
  loadingTanpaEmail.value = true
  try {
    const response = await pegawaiService.getPegawaiTanpaEmail()
    if (response.data && response.data.success) {
      pegawaiTanpaEmail.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching pegawai tanpa email:', error)
  } finally {
    loadingTanpaEmail.value = false
  }
}

const openUpdateEmailModal = (emp) => {
  selectedNikForEmail.value = emp.nik
  selectedNamaForEmail.value = emp.nama
  emailToUpdate.value = emp.email === '(Belum Terdaftar)' ? '' : emp.email
  showUpdateEmailModal.value = true
}

const handleUpdateEmail = async () => {
  if (!emailToUpdate.value) {
    toast.error('Email tidak boleh kosong')
    return
  }
  
  // Basic validation
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!regex.test(emailToUpdate.value)) {
    toast.error('Format email tidak valid')
    return
  }

  submittingEmail.value = true
  try {
    const response = await pegawaiService.updateEmail(selectedNikForEmail.value, emailToUpdate.value)
    if (response.data.success) {
      toast.success('Email berhasil diperbarui')
      showUpdateEmailModal.value = false
      fetchPegawaiTanpaEmail() // Refresh the problematic list

      // Refresh logged-in user data if the NIK matches
      const currentUserNip = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik
      if (selectedNikForEmail.value === currentUserNip) {
        authStore.refreshUserData()
      }
    }
  } catch (error) {
    console.error('Error updating email:', error)
    toast.error(error.response?.data?.message || 'Gagal memperbarui email')
  } finally {
    submittingEmail.value = false
  }
}

const openAddModal = () => {
  selectedPegawai.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = async (pegawai) => {
  loadingDetail.value = true
  try {
    // Get full employee data for editing
    const response = await pegawaiService.getPegawaiById(pegawai.nip)
    if (response.data.success) {
      selectedPegawai.value = response.data.data
      isEditMode.value = true
      showFormModal.value = true
    }
  } catch (error) {
    console.error('Error fetching employee detail:', error)
    toast.error('Gagal mengambil detail data karyawan')
  } finally {
    loadingDetail.value = false
  }
}

const openDetailModal = async (pegawai) => {
  loadingDetail.value = true
  try {
    const response = await pegawaiService.getPegawaiById(pegawai.nip)
    if (response.data.success) {
      selectedPegawai.value = response.data.data
      showDetailModal.value = true
    }
  } catch (error) {
    console.error('Error fetching employee detail:', error)
    toast.error('Gagal mengambil detail data karyawan')
  } finally {
    loadingDetail.value = false
  }
}

const confirmDelete = (pegawai) => {
  selectedPegawai.value = pegawai
  showDeleteModal.value = true
}

const deletePegawai = async () => {
  try {
    const response = await pegawaiService.deletePegawai(selectedPegawai.value.nip)
    if (response.data.success) {
      alert('Karyawan berhasil dihapus')
      showDeleteModal.value = false
      loadPegawai(pagination.value.current_page)
    }
  } catch (error) {
    console.error('Error deleting pegawai:', error)
    alert('Gagal menghapus karyawan')
  }
}

// QR Code Methods
const openQrModal = async (pegawai) => {
  qrPegawai.value = pegawai
  const nik = pegawai.nik || pegawai.nip || '-'
  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const text = `Ditanda tangani oleh ${pegawai.nama}, NIK: ${nik}, pada tanggal ${tanggal}`
  qrTextContent.value = text
  showQrModal.value = true

  await nextTick()
  try {
    await QRCode.toCanvas(qrCanvas.value, text, {
      width: 240,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' }
    })
  } catch (e) {
    console.error('QR generate error:', e)
  }
}

const downloadQr = () => {
  if (!qrCanvas.value) return
  const link = document.createElement('a')
  const nama = (qrPegawai.value?.nama || 'karyawan').replace(/\s+/g, '_')
  link.download = `QR_${nama}.png`
  link.href = qrCanvas.value.toDataURL('image/png')
  link.click()
}

// Context Menu Methods
const showContextMenu = async (e, pegawai) => {
  contextMenu.item = pegawai
  contextMenu.visible = true
  
  // Set initial position
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY

  await nextTick()

  if (contextMenuRef.value) {
    const menuWidth = contextMenuRef.value.offsetWidth
    const menuHeight = contextMenuRef.value.offsetHeight
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Adjust horizontal position
    if (e.clientX + menuWidth > screenWidth) {
      contextMenu.x = e.clientX - menuWidth
    }

    // Adjust vertical position
    if (e.clientY + menuHeight > screenHeight) {
      contextMenu.y = e.clientY - menuHeight
    }

    // Boundary check
    contextMenu.x = Math.max(10, contextMenu.x)
    contextMenu.y = Math.max(10, contextMenu.y)
  }
}

const closeContextMenu = () => {
  contextMenu.visible = false
}

const handleContextAction = async (action) => {
  if (!contextMenu.item) return
  
  const item = contextMenu.item
  
  switch (action) {
    case 'detail':
      openDetailModal(item)
      break
    case 'edit':
      if (canUpdate.value) {
        openEditModal(item)
      } else {
        toast.warning('Anda tidak memiliki akses untuk mengubah data')
      }
      break
    case 'upload':
      autoOpenUpload.value = true
      openDetailModal(item)
      break
    case 'copy_nik':
      try {
        await navigator.clipboard.writeText(item.nik || item.nip)
        toast.success('NIK berhasil disalin')
      } catch (e) {
        toast.error('Gagal menyalin NIK')
      }
      break
    case 'copy_nip':
      try {
        await navigator.clipboard.writeText(item.nip)
        toast.success('NIP berhasil disalin')
      } catch (e) {
        toast.error('Gagal menyalin NIP')
      }
      break
  }
  closeContextMenu()
}

const handleCloseDetail = () => {
  showDetailModal.value = false
  autoOpenUpload.value = false
}

const onWindowClick = () => {
  if (contextMenu.visible) {
    closeContextMenu()
  }
}

const getPhotoUrl = (photo) => {
  // Adjust this based on your photo storage location
  return `/storage/pegawai/${photo}`
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const calculateTenure = (startDate) => {
  if (!startDate) return '-'
  
  const start = new Date(startDate)
  const now = new Date()
  
  if (isNaN(start.getTime())) return '-'

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()

  // Adjust for negative days (borrow from previous month)
  if (days < 0) {
    months--
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }

  // Adjust for negative months (borrow from year)
  if (months < 0) {
    years--
    months += 12
  }

  // Formatting result
  const parts = []
  if (years > 0) parts.push(`${years} Tahun`)
  if (months > 0) parts.push(`${months} Bulan`)
  if (days > 0) parts.push(`${days} Hari`)
  
  // If exact match (today is start date) or very short
  if (parts.length === 0) return '0 Hari'
  
  return parts.join(' ')
}

const getStatusClass = (status) => {
  if (!status) return ''
  switch (status.toUpperCase()) {
    case 'AKTIF': return 'active'
    case 'KELUAR': return 'inactive'
    case 'CUTI': return 'warning'
    case 'TENAGA LUAR': return 'info'
    default: return ''
  }
}

const getStatusIcon = (status) => {
  if (!status) return 'fas fa-question-circle'
  switch (status.toUpperCase()) {
    case 'AKTIF': return 'fas fa-check-circle'
    case 'KELUAR': return 'fas fa-times-circle'
    case 'CUTI': return 'fas fa-clock'
    case 'TENAGA LUAR': return 'fas fa-user-tag'
    default: return 'fas fa-info-circle'
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .match(/(^\S\S?|\s\S)?/g)
    .map(v => v.trim())
    .join('')
    .match(/(^\S|\S$)?/g)
    .join('')
    .toLocaleUpperCase()
    .substring(0, 2)
}

// Lifecycle
onMounted(() => {
  loadPegawai()
  fetchPegawaiTanpaEmail()
  window.addEventListener('click', onWindowClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick)
})
</script>

<style scoped>
.karyawan-container {
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.tab-btn:hover {
  color: #3b82f6;
  background: #f8fafc;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-btn i {
  font-size: 1rem;
}

.d-flex {
  display: flex !important;
}
.gap-2 {
  gap: 0.5rem !important;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-filter-wrapper {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.search-box {
  position: relative;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-group {
  min-width: 150px;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  background-color: white;
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-select:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.filter-select.aktif {
  border-color: #10b981;
  background-color: #f0fdf4;
  color: #065f46;
}

.filter-select.non-aktif {
  border-color: #ef4444;
  background-color: #fef2f2;
  color: #991b1b;
}

.filter-select.all {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #1e40af;
}

.filter-select:hover {
  transform: translateY(-1px);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981; /* Green color for Excel */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #059669;
}

.btn-export:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}


/* Table */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 300px); /* Adjust based on header + pagination height */
}

.data-table {
  width: 100%;
  border-collapse: separate; /* Use separate for spacing/radius if needed, or collapse for standard grid */
  border-spacing: 0;
  min-width: 1400px; /* Ensure table doesn't squish on smaller screens */
}

.data-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 20;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem; /* Smaller font */
  text-transform: uppercase; /* Modern look */
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  vertical-align: middle;
  color: #334155;
}

/* Sticky first column (Nama) */
.data-table th:first-child,
.data-table td:first-child {
  position: sticky;
  left: 0;
  background: white;
  z-index: 10;
  box-shadow: 4px 0 4px -2px rgba(0, 0, 0, 0.05); /* Softer shadow */
}

.data-table thead th:first-child {
  background: #f8fafc;
  z-index: 30; /* Higher than tbody sticky */
}

.data-table tbody tr:hover td:first-child {
  background: #f8fafc; /* Match hover */
}

/* Employee Profile */
.employee-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar .initials {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.emp-role {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.nip-text {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.8rem;
}

.tenure-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 10px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #e0f2fe;
  white-space: nowrap;
}

.tenure-badge i {
  font-size: 0.7rem;
  opacity: 0.8;
}

.ttl {
  min-width: 150px;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #475569;
}

.alamat-cell {
  max-width: 250px;
  white-space: normal;
  line-height: 1.4;
  color: #475569;
}



.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-badge i {
  font-size: 0.875rem;
}

.status-badge.active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border: 1px solid #86efac;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.status-badge.warning {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  color: #9a3412;
  border: 1px solid #fdba74;
}

.status-badge.info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete,
.btn-qrcode {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.btn-qrcode {
  background: #f3e8ff;
  color: #7c3aed;
}

.btn-qrcode:hover {
  background: #7c3aed;
  color: white;
}

/* QR Modal Styles */
.modal-content.qr-modal {
  max-width: 440px;
}

.qr-employee-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.qr-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.qr-nik {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.qr-jabatan {
  font-size: 0.8rem;
  color: #7c3aed;
  font-weight: 600;
  margin-top: 0.15rem;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  margin-bottom: 1rem;
}

.qr-canvas {
  border-radius: 8px;
}

.qr-text-content {
  font-size: 0.78rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  line-height: 1.5;
}

.btn-download-qr {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-download-qr:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}


/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.btn-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .karyawan-container {
    padding: 1rem;
  }

  /* Tab Navigation - enable horizontal scroll */
  .tab-navigation {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 0.75rem !important;
    gap: 0.25rem !important;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  /* Header actions - stack vertically */
  .header-actions {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  .search-box,
  .btn-add {
    width: 100% !important;
  }

  /* Table */
  .table-container {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* Disable sticky columns on mobile */
  .data-table th:first-child,
  .data-table td:first-child,
  .data-table th:last-child,
  .data-table td:last-child {
    position: static !important;
    left: auto !important;
    right: auto !important;
  }

  .karyawan-table {
    min-width: 800px !important;
    font-size: 0.875rem;
  }

  .karyawan-table th,
  .karyawan-table td {
    padding: 0.75rem 0.5rem;
    white-space: nowrap;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .page-info {
    order: -1;
  }
  
  /* Make table scrollable on mobile */
  .table-wrapper {
    max-height: calc(100vh - 350px);
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
  
  .employee-name {
    max-width: 150px;
  }
}

/* Modal Enhancements */
.modal-content.small {
  max-width: 450px;
}

.employee-info-mini {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-info-mini .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.employee-info-mini .value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-confirm {
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-confirm:hover {
  background: #2563eb;
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Detail Loading Overlay */
.detail-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Email Alert Styles */
.alert-card.warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.alert-icon {
  width: 48px;
  height: 48px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.alert-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.alert-title p {
  font-size: 0.875rem;
  color: #b45309;
  margin: 0.25rem 0 0 0;
}

.btn-toggle-alert {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #fcd34d;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #b45309;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-alert:hover {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-color: #f59e0b;
}

.table-container-minimal {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #fde68a;
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
}

.alert-table th {
  background: #fff9db;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #b45309;
  font-weight: 700;
  border-bottom: 1px solid #fde68a;
}

.alert-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #fef3c7;
  color: #451a03;
  font-size: 0.875rem;
}

.btn-detail {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #e0f2fe;
  color: #0ea5e9;
}

.btn-detail:hover {
  background: #0ea5e9;
  color: white;
}

.alert-table tr:last-child td {
  border-bottom: none;
}

.email-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.email-badge.missing {
  background: #fee2e2;
  color: #991b1b;
}

.email-badge.invalid {
  background: #fef3c7;
  color: #92400e;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  z-index: 10000;
  min-width: 200px;
  border: 1px solid #e2e8f0;
  animation: contextFadeIn 0.2s ease-out;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #334155;
  transition: all 0.2s;
}

.context-menu-item:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.context-menu-item i {
  width: 16px;
  text-align: center;
  font-size: 0.9rem;
}

.context-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.4rem 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes contextFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
