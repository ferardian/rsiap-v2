<template>
  <div class="tim-ppra-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-users-medical"></i> Tim PPRA</h1>
          <p>Program Pengendalian Resistensi Antimikroba</p>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <i class="fas fa-plus"></i> <span class="d-none d-md-inline">Tambah Anggota</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Cari nama, jabatan, atau role..."
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data tim...</p>
    </div>

    <!-- Data Grid/List -->
    <div v-else class="team-grid">
      <div v-for="member in teamList" :key="member.id" class="team-card">
        <div class="member-photo">
            <img 
            v-if="hasPhoto(member) && !member.imageError"
            :src="getPhotoUrl(member.pegawai?.photo)" 
            @error="handleImageError(member)"
            alt="Foto Pegawai"
            >
            <div v-else class="initials-placeholder">
              {{ getInitials(member.pegawai?.nama) }}
            </div>
        </div>
        <div class="member-info">
          <h3 class="member-name">{{ member.pegawai?.nama || 'Nama Tidak Ditemukan' }}</h3>
          <p class="member-role badge-role">{{ member.role || '-' }}</p>
          <div class="member-meta">
            <span><i class="fas fa-id-badge"></i> {{ member.nik }}</span>
            <span><i class="fas fa-briefcase"></i> {{ member.jabatan }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button @click="openEditModal(member)" class="btn-icon btn-edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="confirmDelete(member)" class="btn-icon btn-delete" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="teamList.length === 0" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <p>Belum ada data anggota tim PPRA</p>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-effect">
        <div class="modal-header">
          <div class="header-icon">
            <i class="fas" :class="isEditMode ? 'fa-user-edit' : 'fa-user-plus'"></i>
          </div>
          <div>
            <h2>{{ isEditMode ? 'Edit Anggota' : 'Tambah Anggota' }}</h2>
            <p class="subtitle">{{ isEditMode ? 'Perbarui data anggota tim.' : 'Tambahkan anggota baru ke tim PPRA.' }}</p>
          </div>
          <button @click="closeModal" class="btn-close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
            
          <div class="form-group mb-4" v-if="!isEditMode">
            <label class="form-label">Pegawai <span class="text-danger">*</span></label>
            <div class="select-wrapper">
                <VueSelect
                    v-model="selectedPegawai"
                    :options="pegawaiList"
                    label="nama"
                    placeholder="Ketik nama atau NIK pegawai..."
                    @search="onSearchPegawai"
                    class="modern-select"
                >
                    <template #option="{ nama, nik }">
                        <div class="option-item">
                            <span class="option-name">{{ nama }}</span>
                            <div class="option-meta">
                                <span class="option-code">{{ nik }}</span>
                            </div>
                        </div>
                    </template>
                    <template #no-options="{ search, searching }">
                        <div class="no-options">
                            <template v-if="searching">
                                <i class="fas fa-search"></i> Tidak ditemukan hasil untuk "<em>{{ search }}</em>".
                            </template>
                            <template v-else>
                                <i class="fas fa-keyboard"></i> Ketik nama pegawai untuk mencari...
                            </template>
                        </div>
                    </template>
                </VueSelect>
            </div>
          </div>

          <div class="form-group mb-4" v-if="isEditMode">
            <label class="form-label">Nama Pegawai</label>
            <div class="readonly-input">
                <i class="fas fa-user-circle"></i>
                <input type="text" :value="formData.nama" disabled>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
                <div class="form-group mb-4">
                    <label class="form-label">Jabatan di Tim <span class="text-danger">*</span></label>
                    <VueSelect
                        v-model="formData.jabatan"
                        :options="['Ketua', 'Wakil Ketua', 'Sekretaris', 'Anggota']"
                        placeholder="Pilih Jabatan..."
                        class="modern-select"
                    ></VueSelect>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group mb-4">
                    <label class="form-label">Role / Keterangan</label>
                    <div class="input-with-icon">
                        <i class="fas fa-briefcase"></i>
                        <input type="text" v-model="formData.role" class="form-control" placeholder="Contoh: Dokter Anak">
                    </div>
                </div>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Batal</button>
          <button @click="saveMember" class="btn-save" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Swal from 'sweetalert2';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import ppraService from '@/services/ppraService';
import { pegawaiService } from '@/services/pegawaiService';

// State
const teamList = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showModal = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const pegawaiList = ref([]);
const selectedPegawai = ref(null);

const formData = reactive({
  id: null,
  nik: '',
  nama: '',
  jabatan: '',
  role: ''
});

const defaultPhoto = 'https://sim.rsiaaisyiyah.com/rsiap/assets/images/users/default.png';

// Methods
const loadTeam = async () => {
  loading.value = true;
  try {
    const response = await ppraService.getTim({ keyword: searchQuery.value });
    teamList.value = response.data.data;
  } catch (error) {
    console.error("Error loading team:", error);
    Swal.fire('Error', 'Gagal memuat data tim', 'error');
  } finally {
    loading.value = false;
  }
};

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadTeam();
  }, 500);
};

const onSearchPegawai = async (search, loading) => {
    if(search.length < 3) {
        pegawaiList.value = []; // Clear options if search query is too short
        loading(false);
        return;
    }
    loading(true);
    try {
        const response = await pegawaiService.searchPegawai(search);
        pegawaiList.value = response.data.data || [];
    } catch (e) {
        console.error(e);
        pegawaiList.value = []; // Clear options on error
    }
    loading(false);
};

const hasPhoto = (member) => {
    return member.pegawai?.photo && member.pegawai.photo !== '-' && member.pegawai.photo !== '';
};

const getInitials = (name) => {
    if (!name) return '-';
    // Clean titles (after comma) and remove dots
    const cleanName = name.split(',')[0].replace(/\./g, '');
    const parts = cleanName.split(' ').filter(p => p.trim().length > 0);
    
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return '?';
};

const getPhotoUrl = (photo) => {
    if (!photo || photo === '-') return '';
    return `https://sim.rsiaaisyiyah.com/rsiap/file/pegawai/${photo}`;
};

const handleImageError = (member) => {
    member.imageError = true;
};

const openAddModal = () => {
  isEditMode.value = false;
  selectedPegawai.value = null;
  pegawaiList.value = []; // Reset history
  formData.id = null;
  formData.nik = '';
  formData.nama = '';
  formData.jabatan = '';
  formData.role = '';
  showModal.value = true;
};

const openEditModal = (member) => {
  isEditMode.value = true;
  formData.id = member.id;
  formData.nik = member.nik;
  formData.nama = member.pegawai?.nama;
  formData.jabatan = member.jabatan;
  formData.role = member.role;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveMember = async () => {
  if (!isEditMode.value && !selectedPegawai.value) {
    Swal.fire('Warning', 'Silakan pilih pegawai', 'warning');
    return;
  }
  if (!formData.jabatan) {
      Swal.fire('Warning', 'Jabatan harus diisi', 'warning');
      return;
  }

  saving.value = true;
  try {
    if (isEditMode.value) {
      await ppraService.updateTim(formData.id, {
        jabatan: formData.jabatan,
        role: formData.role
      });
    } else {
      await ppraService.storeTim({
        nik: selectedPegawai.value?.nik,
        jabatan: formData.jabatan,
        role: formData.role
      });
    }
    Swal.fire('Sukses', 'Data berhasil disimpan', 'success');
    closeModal();
    loadTeam();
  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (member) => {
  const result = await Swal.fire({
    title: 'Hapus Anggota?',
    text: `Anda yakin ingin menghapus ${member.pegawai?.nama} dari tim?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!'
  });

  if (result.isConfirmed) {
    try {
      await ppraService.deleteTim(member.id);
      Swal.fire('Terhapus', 'Anggota telah dihapus', 'success');
      loadTeam();
    } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
    }
  }
};

onMounted(() => {
  loadTeam();
});
</script>

<style scoped>
.tim-ppra-page {
  padding: 1.5rem;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.page-header {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.02);
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
    color: #3498db;
    background: #e8f4fd;
    padding: 10px;
    border-radius: 10px;
}

.header-content p {
  color: #7f8c8d;
  margin: 8px 0 0 54px;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  padding: 0.85rem 1.8rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.filters-section {
  margin-bottom: 2rem;
}

.search-box {
  background: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  max-width: 450px;
  border: 1px solid #f0f2f5;
  transition: all 0.3s;
}

.search-box:focus-within {
    border-color: #3498db;
    box-shadow: 0 4px 20px rgba(52, 152, 219, 0.1);
}

.search-box i {
  color: #bdc3c7;
  font-size: 1.1rem;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: #2c3e50;
  background: transparent;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #7f8c8d;
}

.loading-state .spinner-border {
  width: 3rem;
  height: 3rem;
  color: #3498db !important;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-state p {
  font-size: 1.1rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.team-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f2f5;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.member-photo {
  height: 120px;
  background: linear-gradient(135deg, #a8d1f0 0%, #3498db 100%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.member-photo img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  transform: translateY(40px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.initials-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  background: white;
  color: #3498db;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(40px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.member-info {
  padding: 3rem 1.5rem 1.5rem;
  text-align: center;
  flex: 1;
}

.member-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.badge-role {
  display: inline-block;
  background: #e1f0fa;
  color: #3498db;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.member-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.member-meta span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.card-actions {
  padding: 1rem;
  border-top: 1px solid #f1f2f6;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  background: #f8f9fa;
  color: #7f8c8d;
}

.btn-icon:hover {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-delete:hover {
  background: #fadbd8;
  color: #c0392b;
}

.btn-edit:hover {
  background: #d6eaf8;
  color: #2980b9;
}

/* Modal Styling Premium */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255,255,255,0.8);
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid #f1f2f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-icon {
    width: 50px;
    height: 50px;
    background: #e8f4fd;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3498db;
    font-size: 1.5rem;
    margin-right: 1.2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0 0 5px;
  font-weight: 800;
  color: #2c3e50;
}

.subtitle {
    margin: 0;
    color: #95a5a6;
    font-size: 0.9rem;
}

.btn-close-modal {
  background: #f8f9fa;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  color: #95a5a6;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
    background: #e74c3c;
    color: white;
}

.modal-body {
  padding: 2rem 2.5rem;
}

.row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.col-md-6 {
    flex: 1;
    min-width: 200px;
}

.form-label {
    display: block;
    margin-bottom: 0.6rem;
    font-weight: 600;
    color: #34495e;
    font-size: 0.95rem;
}

.input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
}

.input-with-icon i {
    position: absolute;
    left: 15px;
    color: #95a5a6;
}

.input-with-icon input {
    padding-left: 40px;
}

.readonly-input {
    background: #f8f9fa;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #7f8c8d;
    font-weight: 500;
}

.readonly-input input {
    border: none;
    background: transparent;
    width: 100%;
    color: #34495e;
    font-weight: 700;
}

.form-control {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fafbfc;
}

.form-control:focus {
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  outline: none;
}

/* Custom Vue Select Styling */
:deep(.v-select) {
    background: #fafbfc;
    border-radius: 12px;
}

:deep(.vs__dropdown-toggle) {
    border: 1px solid #e0e6ed;
    border-radius: 12px;
    padding: 6px 4px;
    transition: all 0.2s;
}

:deep(.vs--open .vs__dropdown-toggle) {
    border-color: #3498db;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
}

:deep(.vs__dropdown-menu) {
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    padding: 10px;
    margin-top: 5px;
}

:deep(.vs__dropdown-option) {
    border-radius: 8px;
    padding: 8px 12px;
    color: #2c3e50;
    margin-bottom: 2px;
}

:deep(.vs__dropdown-option--highlight) {
    background: #e8f4fd;
    color: #3498db;
}

.option-item {
    padding: 4px 0;
}

.option-name {
    display: block;
    font-weight: 600;
    margin-bottom: 2px;
}

.option-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #95a5a6;
}

.no-options {
    padding: 10px;
    text-align: center;
    color: #95a5a6;
}

.modal-footer {
  padding: 1.5rem 2.5rem 2rem;
  border-top: none;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #fbfdff;
  border-radius: 0 0 20px 20px;
}

.btn-cancel {
  background: white;
  color: #7f8c8d;
  border: 1px solid #e0e6ed;
  padding: 0.8rem 1.8rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
    background: #f1f2f6;
    color: #2c3e50;
}

.btn-save {
    background: linear-gradient(135deg, #3498db, #2980b9);
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
    transition: all 0.2s;
}

.btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .header-content p {
      margin-left: 0;
      margin-top: 10px;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .search-box {
    max-width: 100%;
  }

  .col-md-6 {
      flex: 100%;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.25rem 1.5rem 1rem;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-right: 0.8rem;
    border-radius: 12px;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem 1.5rem;
    border-radius: 0 0 16px 16px;
  }
}

@media (max-width: 480px) {
  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.8rem;
  }
  
  .btn-save, .btn-cancel {
    width: 100%;
    padding: 0.8rem;
  }
}

</style>
