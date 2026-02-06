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
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Anggota' : 'Tambah Anggota' }}</h2>
          <button @click="closeModal" class="btn-close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
            
          <div class="form-group mb-3" v-if="!isEditMode">
            <label>Pegawai <span class="text-danger">*</span></label>
            <VueSelect
                v-model="selectedPegawai"
                :options="pegawaiList"
                :reduce="pegawai => pegawai.nik"
                label="nama"
                placeholder="Cari Pegawai..."
                @search="onSearchPegawai"
                :disabled="isEditMode"
            >
                <template #option="{ nama, nik }">
                    <div class="d-flex flex-column">
                        <span class="font-weight-bold">{{ nama }}</span>
                        <small class="text-muted">{{ nik }}</small>
                    </div>
                </template>
            </VueSelect>
          </div>

          <div class="form-group mb-3">
            <label>Jabatan di Tim <span class="text-danger">*</span></label>
            <select v-model="formData.jabatan" class="form-control simple-select">
              <option value="">Pilih Jabatan</option>
              <option value="Ketua">Ketua</option>
              <option value="Wakil Ketua">Wakil Ketua</option>
              <option value="Sekretaris">Sekretaris</option>
              <option value="Anggota">Anggota</option>
            </select>
          </div>

          <div class="form-group mb-3">
            <label>Role / Keterangan</label>
            <input type="text" v-model="formData.role" class="form-control" placeholder="Contoh: Dokter Spesialis Anak">
          </div>

        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Batal</button>
          <button @click="saveMember" class="btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
    if(search.length < 3) return;
    loading(true);
    try {
        const response = await pegawaiService.get(search); // Adjust based on actual service
        pegawaiList.value = response.data.data || [];
    } catch (e) {
        console.error(e);
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
  formData.id = null;
  formData.nik = '';
  formData.jabatan = '';
  formData.role = '';
  showModal.value = true;
};

const openEditModal = (member) => {
  isEditMode.value = true;
  formData.id = member.id;
  formData.nik = member.nik;
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
        nik: selectedPegawai.value,
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
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-content p {
  color: #7f8c8d;
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.btn-primary {
  background: #3498db;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.filters-section {
  margin-bottom: 2rem;
}

.search-box {
  background: white;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  max-width: 400px;
}

.search-box i {
  color: #95a5a6;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: #2c3e50;
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
}

.team-card:hover {
  transform: translateY(-5px);
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f2f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
  color: #2c3e50;
}

.btn-close-modal {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #95a5a6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f2f6;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #3498db;
  outline: none;
}

.btn-secondary {
  background: #ecf0f1;
  color: #7f8c8d;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #bdc3c7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .search-box {
    max-width: 100%;
  }
}
</style>
