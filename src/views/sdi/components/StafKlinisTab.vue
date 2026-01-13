<template>
  <div class="staf-klinis-container">
    <!-- Header Actions -->
    <div class="header-actions">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearch"
          placeholder="Cari NIK, nama, jabatan, atau nomor STR/SIP..."
        />
      </div>
      <div class="info-card" @click="toggleEmployeeList" :class="{ active: showEmployeeList }">
        <div class="info-icon">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="info-content">
          <div class="info-label">Belum Ada Kualifikasi</div>
          <div class="info-value">{{ employeesWithoutKualifikasi }} Karyawan</div>
        </div>
        <i class="fas fa-chevron-down dropdown-icon" :class="{ rotated: showEmployeeList }"></i>
      </div>
    </div>

    <!-- Employee List Modal -->
    <div v-if="showEmployeeList" class="modal-overlay-list" @click="showEmployeeList = false">
      <div class="employee-modal" @click.stop>
        <div class="dropdown-header">
          <span>Daftar Karyawan Belum Ada Kualifikasi</span>
          <button class="btn-close-dropdown" @click="showEmployeeList = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dropdown-body">
          <div v-if="employeesWithoutKualifikasiList.length === 0" class="empty-message">
            Semua karyawan sudah memiliki kualifikasi
          </div>
          <div v-else class="employee-item" v-for="emp in employeesWithoutKualifikasiList" :key="emp.nik">
            <div class="emp-info">
              <div class="emp-name">{{ emp.nama }}</div>
              <div class="emp-nik">{{ emp.nik }}</div>
            </div>
            <button class="btn-add-quick" @click="openAddModalForStaf(emp)" title="Tambah Kualifikasi">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="!loading && stafList.length > 0" class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sticky-col col-employee">NIK / Nama</th>
              <th>Jabatan</th>
              <th>Pendidikan</th>
              <th>No. Telp</th>
              <th>Kategori Profesi</th>
              <th>Nomor STR</th>
              <th>Tanggal STR</th>
              <th>Tanggal Akhir STR</th>
              <th>Nomor SIP</th>
              <th>Tanggal Izin Praktek</th>
              <th>Perguruan Tinggi</th>
              <th>Program Studi</th>
              <th>Tanggal Lulus</th>
              <th>Tanggal Update</th>
              <th class="sticky-col-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staf in stafList" :key="staf.nik">
              <td class="sticky-col col-employee">
                <div class="employee-info-cell">
                  <div class="employee-name">{{ staf.nama }}</div>
                  <span class="nik-text">{{ staf.nik }}</span>
                </div>
              </td>
              <td>{{ staf.jbtn || '-' }}</td>
              <td>{{ staf.pendidikan || '-' }}</td>
              <td>{{ staf.no_telp || '-' }}</td>
              <td>
                <span v-if="staf.has_kualifikasi" class="badge bg-info bg-opacity-10 text-info px-2 py-1">
                  {{ staf.kategori_profesi || '-' }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ staf.nomor_str || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_str) || '-' }}</td>
              <td>
                <div v-if="staf.has_kualifikasi" class="expiry-cell">
                  {{ formatDate(staf.tanggal_akhir_str) }}
                  <span v-if="isExpiringSoon(staf.tanggal_akhir_str)" class="badge badge-warning">
                    <i class="fas fa-exclamation-triangle"></i> Segera Habis
                  </span>
                  <span v-else-if="isExpired(staf.tanggal_akhir_str)" class="badge badge-danger">
                    <i class="fas fa-times-circle"></i> Kadaluarsa
                  </span>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ staf.nomor_sip || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_izin_praktek) || '-' }}</td>
              <td>{{ staf.perguruan_tinggi || '-' }}</td>
              <td>{{ staf.prodi || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_lulus) || '-' }}</td>
              <td>{{ formatDate(staf.tgl_update) || '-' }}</td>
              <td class="sticky-col-right">
                <div class="action-buttons">
                  <!-- Show Add button if no kualifikasi -->
                  <button v-if="!staf.has_kualifikasi" class="btn-add-small" @click="openAddModalForStaf(staf)" title="Tambah Kualifikasi">
                    <i class="fas fa-plus"></i> Tambah
                  </button>
                  <!-- Show Edit and Detail if has kualifikasi -->
                  <template v-else>
                    <button class="btn-edit" @click="openEditModal(staf)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-detail" @click="showDetail(staf)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-delete" @click="confirmDelete(staf)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-user-md"></i>
      <p>Belum ada data kualifikasi staf klinis</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content modern-modal" @click.stop>
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            </div>
            <div>
              <h3>{{ isEditMode ? 'Edit Kualifikasi Staf' : 'Tambah Kualifikasi Staf' }}</h3>
              <p class="header-subtitle">{{ isEditMode ? 'Perbarui data kualifikasi staf klinis' : 'Lengkapi data kualifikasi staf klinis' }}</p>
            </div>
          </div>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body modern-body">
          <!-- Employee Selection -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-user"></i>
              <span>Informasi Karyawan</span>
            </div>
            <div class="form-group full-width">
              <label>NIK / Nama Karyawan <span class="required">*</span></label>
              <select v-model="form.nik" :disabled="isEditMode" required>
                <option value="">Pilih Karyawan</option>
                <option v-for="karyawan in karyawanList" :key="karyawan.nik" :value="karyawan.nik">
                  {{ karyawan.nik }} - {{ karyawan.nama }}
                </option>
              </select>
            </div>
          </div>

          <!-- Professional Info -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-briefcase"></i>
              <span>Informasi Profesi</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Kategori Profesi <span class="required">*</span></label>
                <select v-model="form.kategori_profesi" required>
                  <option value="">Pilih Kategori</option>
                  <option value="Staf Medis">Staf Medis</option>
                  <option value="Staf Kebidanan">Staf Kebidanan</option>
                  <option value="Staf Keperawatan">Staf Keperawatan</option>
                  <option value="Staf Klinis Lainnya">Staf Klinis Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          <!-- STR Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-certificate"></i>
              <span>Surat Tanda Registrasi (STR)</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Nomor STR <span class="required">*</span></label>
                <input type="text" v-model="form.nomor_str" placeholder="Contoh: 123456789" required>
              </div>
              <div class="form-group">
                <label>Tanggal STR <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_str" required>
              </div>
              <div class="form-group full-width">
                <label>Tanggal Akhir STR <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_akhir_str" required>
                <small class="help-text">Tanggal berakhirnya masa berlaku STR</small>
              </div>
            </div>
          </div>

          <!-- SIP Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-id-card"></i>
              <span>Surat Izin Praktik (SIP)</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Nomor SIP <span class="required">*</span></label>
                <input type="text" v-model="form.nomor_sip" placeholder="Contoh: SIP/123/2024" required>
              </div>
              <div class="form-group">
                <label>Tanggal Izin Praktek <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_izin_praktek" required>
              </div>
            </div>
          </div>

          <!-- Education Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-graduation-cap"></i>
              <span>Informasi Pendidikan</span>
            </div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Perguruan Tinggi <span class="required">*</span></label>
                <input type="text" v-model="form.perguruan_tinggi" placeholder="Contoh: Universitas Indonesia" required>
              </div>
              <div class="form-group">
                <label>Program Studi <span class="required">*</span></label>
                <input type="text" v-model="form.prodi" placeholder="Contoh: Kedokteran" required>
              </div>
              <div class="form-group">
                <label>Tanggal Lulus <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_lulus" required>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modern-footer">
          <button class="btn-cancel" @click="closeModal">
            <i class="fas fa-times"></i>
            Batal
          </button>
          <button class="btn-save" @click="saveKualifikasi" :disabled="saving">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
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
          <p>Apakah Anda yakin ingin menghapus kualifikasi staf <strong>{{ selectedStaf?.nama }}</strong>?</p>
          <p class="warning-text">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-confirm-delete" @click="deleteKualifikasi">
            <i class="fas fa-trash"></i>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-id-card"></i>
            </div>
            <div>
              <h3>Detail Kualifikasi Staf</h3>
              <p class="header-subtitle">Informasi lengkap kualifikasi staf klinis</p>
            </div>
          </div>
          <button class="btn-close" @click="showDetailModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body detail-body" v-if="selectedStaf">
          <!-- Employee Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-user"></i>
              <span>Informasi Karyawan</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>NIK</label>
                <div class="detail-value">{{ selectedStaf.nik }}</div>
              </div>
              <div class="detail-item">
                <label>Nama</label>
                <div class="detail-value">{{ selectedStaf.nama }}</div>
              </div>
              <div class="detail-item">
                <label>Jabatan</label>
                <div class="detail-value">{{ selectedStaf.jbtn || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Pendidikan</label>
                <div class="detail-value">{{ selectedStaf.pendidikan || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Professional Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-briefcase"></i>
              <span>Informasi Profesi</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Kategori Profesi</label>
                <div class="detail-value badge-value">
                  <span class="badge bg-info bg-opacity-10 text-info px-3 py-2">
                    {{ selectedStaf.kategori_profesi }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- STR Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-certificate"></i>
              <span>Surat Tanda Registrasi (STR)</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nomor STR</label>
                <div class="detail-value mono">{{ selectedStaf.nomor_str }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal STR</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_str) }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Akhir STR</label>
                <div class="detail-value">
                  {{ formatDate(selectedStaf.tanggal_akhir_str) }}
                  <span v-if="isExpiringSoon(selectedStaf.tanggal_akhir_str)" class="badge badge-warning ms-2">
                    <i class="fas fa-exclamation-triangle"></i> Segera Habis
                  </span>
                  <span v-else-if="isExpired(selectedStaf.tanggal_akhir_str)" class="badge badge-danger ms-2">
                    <i class="fas fa-times-circle"></i> Kadaluarsa
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- SIP Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-id-card"></i>
              <span>Surat Izin Praktik (SIP)</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nomor SIP</label>
                <div class="detail-value mono">{{ selectedStaf.nomor_sip || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Izin Praktek</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_izin_praktek) }}</div>
              </div>
            </div>
          </div>

          <!-- Education Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-graduation-cap"></i>
              <span>Informasi Pendidikan</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Perguruan Tinggi</label>
                <div class="detail-value">{{ selectedStaf.perguruan_tinggi || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Program Studi</label>
                <div class="detail-value">{{ selectedStaf.prodi || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Lulus</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_lulus) }}</div>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-info-circle"></i>
              <span>Informasi Sistem</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Terakhir Diupdate</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tgl_update) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modern-footer">
          <button class="btn-cancel" @click="showDetailModal = false">
            <i class="fas fa-times"></i>
            Tutup
          </button>
          <button class="btn-save" @click="openEditModal(selectedStaf); showDetailModal = false">
            <i class="fas fa-edit"></i>
            Edit Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { pegawaiService } from '../../../services/pegawaiService'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const loading = ref(false)
const stafList = ref([])
const karyawanList = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const selectedStaf = ref(null)
const searchQuery = ref('')
const showEmployeeList = ref(false)
const showDetailModal = ref(false)
let searchTimeout = null

const form = ref({
  nik: '',
  kategori_profesi: '',
  nomor_str: '',
  tanggal_str: '',
  tanggal_akhir_str: '',
  nomor_sip: '',
  tanggal_izin_praktek: '',
  perguruan_tinggi: '',
  prodi: '',
  tanggal_lulus: '',
  status: '1'
})

// Computed
const employeesWithoutKualifikasi = computed(() => {
  return stafList.value.filter(staf => !staf.has_kualifikasi).length
})

const employeesWithoutKualifikasiList = computed(() => {
  return stafList.value.filter(staf => !staf.has_kualifikasi)
})

const toggleEmployeeList = () => {
  showEmployeeList.value = !showEmployeeList.value
}

// Methods
const loadStafKlinis = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const response = await pegawaiService.getKualifikasiStaf(params)
    if (response.data.success) {
      stafList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading staf klinis:', error)
    toast.error('Gagal memuat data kualifikasi staf')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Debounce search
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadStafKlinis()
  }, 500)
}

const loadKaryawanList = async () => {
  try {
    const response = await pegawaiService.getKaryawanList()
    if (response.data.success) {
      karyawanList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading karyawan list:', error)
  }
}

const openAddModal = () => {
  isEditMode.value = false
  resetForm()
  showModal.value = true
}

const openAddModalForStaf = (staf) => {
  isEditMode.value = false
  resetForm()
  // Pre-fill NIK from selected pegawai
  form.value.nik = staf.nik
  showModal.value = true
}

const openEditModal = (staf) => {
  isEditMode.value = true
  form.value = { ...staf }
  // Ensure status is integer
  form.value.status = staf.status || 1
  showModal.value = true
}

const showDetail = (staf) => {
  selectedStaf.value = staf
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    nik: '',
    kategori_profesi: '',
    nomor_str: '',
    tanggal_str: '',
    tanggal_akhir_str: '',
    nomor_sip: '',
    tanggal_izin_praktek: '',
    perguruan_tinggi: '',
    prodi: '',
    tanggal_lulus: '',
    status: '1'
  }
}

const saveKualifikasi = async () => {
  if (!form.value.nik || !form.value.kategori_profesi || !form.value.nomor_str || !form.value.tanggal_akhir_str) {
    toast.warning('Mohon lengkapi data wajib (*)')
    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await pegawaiService.updateKualifikasi(form.value.nik, form.value)
      toast.success('Kualifikasi staf berhasil diperbarui')
    } else {
      await pegawaiService.createKualifikasi(form.value)
      toast.success('Kualifikasi staf berhasil ditambahkan')
    }
    closeModal()
    loadStafKlinis()
  } catch (error) {
    console.error('Error saving kualifikasi:', error)
    toast.error('Gagal menyimpan kualifikasi staf: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const confirmDelete = (staf) => {
  selectedStaf.value = staf
  showDeleteModal.value = true
}

const deleteKualifikasi = async () => {
  try {
    await pegawaiService.deleteKualifikasi(selectedStaf.value.nik)
    toast.success('Kualifikasi staf berhasil dihapus')
    showDeleteModal.value = false
    loadStafKlinis()
  } catch (error) {
    console.error('Error deleting kualifikasi:', error)
    toast.error('Gagal menghapus kualifikasi staf')
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch (e) {
    return '-'
  }
}

const isExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

const isExpiringSoon = (date) => {
  if (!date) return false
  const expiryDate = new Date(date)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry > 0 && daysUntilExpiry <= 90 // 90 days warning
}

// Lifecycle
onMounted(() => {
  loadStafKlinis()
  loadKaryawanList()
})
</script>

<style scoped>
.staf-klinis-container {
  padding: 1rem 0;
}

/* Header Actions */
.header-actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px solid #fbbf24;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.info-card:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
}

.info-card.active {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
}

.dropdown-icon {
  font-size: 0.875rem;
  color: #92400e;
  transition: transform 0.3s;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.modal-overlay-list {
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

.employee-modal {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.btn-close-dropdown {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-close-dropdown:hover {
  color: #1f2937;
}

.dropdown-body {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
  gap: 1rem;
}

.employee-item:hover {
  background: #f9fafb;
}

.emp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.emp-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.emp-nik {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.75rem;
  display: inline-block;
  width: fit-content;
}

.btn-add-quick {
  padding: 0.5rem;
  background: #d1fae5;
  color: #065f46;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.btn-add-quick:hover {
  background: #a7f3d0;
  transform: scale(1.05);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  font-size: 1.25rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.info-label {
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  color: #78350f;
  font-weight: 700;
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
  max-height: calc(100vh - 350px);
}

/* Sticky columns for horizontal scroll */
.sticky-col {
  position: sticky;
  background: white;
  z-index: 10;
}

.sticky-col.col-employee {
  left: 0;
  min-width: 250px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.sticky-col-right {
  position: sticky;
  right: 0;
  background: white;
  z-index: 10;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  min-width: 150px;
}

/* Sticky header cells */
thead .sticky-col,
thead .sticky-col-right {
  background: #f8fafc;
  z-index: 15;
}

tbody tr:hover .sticky-col,
tbody tr:hover .sticky-col-right {
  background: #f8fafc;
}

.employee-info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1200px;
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
  font-size: 0.75rem;
  text-transform: uppercase;
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

.nik-text {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.8rem;
}

.employee-name {
  font-weight: 600;
  color: #1e293b;
}

.expiry-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.education-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.education-cell small {
  color: #64748b;
  font-size: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete,
.btn-detail,
.btn-add-small {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.btn-add-small {
  background: #d1fae5;
  color: #065f46;
  padding: 0.5rem 0.75rem;
  min-width: auto;
}

.btn-add-small:hover {
  background: #a7f3d0;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-detail {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-detail:hover {
  background: #c7d2fe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
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
  border-radius: 16px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modern-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.modern-header {
  padding: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modern-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.modern-header h3 {
  color: white;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modern-body {
  background: #f9fafb;
  padding: 0;
}

.form-section {
  background: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
}

.form-section:first-child {
  margin-top: 1rem;
}

.form-section:last-child {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.section-header i {
  color: #3b82f6;
  font-size: 1.125rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modern-footer {
  padding: 2rem;
  background: white;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-cancel {
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Detail Modal Styles */
.detail-modal {
  max-width: 800px;
}

.detail-body {
  padding: 0;
  background: #f9fafb;
}

.detail-section {
  background: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
}

.detail-section:first-child {
  margin-top: 1rem;
}

.detail-section:last-child {
  margin-bottom: 1rem;
}

.detail-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.detail-section-header i {
  color: #3b82f6;
  font-size: 1.125rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 500;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.detail-value.mono {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  color: #475569;
}

.detail-value.badge-value {
  background: transparent;
  border: none;
  padding: 0.5rem 0;
}

.ms-2 {
  margin-left: 0.5rem;
}
</style>
