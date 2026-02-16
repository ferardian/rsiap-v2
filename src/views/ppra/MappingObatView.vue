<template>
  <div class="ppra-mapping-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-capsules"></i> Mapping Obat PPRA</h1>
          <p>Daftar obat yang dipantau dalam Program Pengendalian Resistensi Antimikroba</p>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <i class="fas fa-plus"></i> <span class="d-none d-md-inline">Tambah Obat</span>
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
          placeholder="Cari nama obat..."
        >
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Memuat data...</p>
      </div>
      
      <table v-else class="modern-table">
        <thead>
          <tr>
            <th width="5%">No</th>
            <th width="15%">Kode Barang</th>
            <th width="35%">Nama Obat</th>
            <th width="20%">Rute Pemberian</th>
            <th width="10%">DDD WHO</th>
            <th width="10%">Notif</th>
            <th width="10%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="item.id">
            <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
            <td><span class="badge-code">{{ item.kode_brng }}</span></td>
            <td>
              <div class="drug-name">{{ item.barang?.nama_brng || 'Nama obat tidak ditemukan' }}</div>
              <small class="text-muted">{{ item.barang?.kode_sat }}</small>
            </td>
            <td><span class="badge-route">{{ item.rute_pemberian || '-' }}</span></td>
            <td>{{ item.nilai_ddd_who || '-' }}</td>
            <td>
              <div class="status-notif">
                <span :class="['badge-status', item.status_notif == 1 ? 'status-active' : 'status-inactive']">
                  {{ item.status_notif == 1 ? 'ON' : 'OFF' }}
                </span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="openEditModal(item)" class="btn-icon btn-edit" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(item)" class="btn-icon btn-delete" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tableData.length === 0">
            <td colspan="7" class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-prescription-bottle-alt"></i>
                <p>Belum ada data mapping obat</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="pagination-container" v-if="totalPages > 1">
      <button 
        :disabled="currentPage === 1" 
        @click="changePage(currentPage - 1)"
        class="btn-page"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="changePage(currentPage + 1)"
        class="btn-page"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-effect">
        <div class="modal-header">
          <div class="header-icon">
            <i class="fas" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
          </div>
          <div>
            <h2>{{ isEditMode ? 'Edit Mapping Obat' : 'Tambah Mapping' }}</h2>
            <p class="subtitle">{{ isEditMode ? 'Perbarui data mapping obat.' : 'Tambahkan obat baru ke daftar pantauan.' }}</p>
          </div>
          <button @click="closeModal" class="btn-close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
            
          <div class="form-group mb-4" v-if="!isEditMode">
            <label class="form-label">Pilih Obat <span class="text-danger">*</span></label>
            <div class="select-wrapper">
                <VueSelect
                    v-model="selectedObat"
                    :options="obatList"
                    :reduce="obat => obat.kode_brng"
                    label="nama_brng"
                    placeholder="Ketik untuk mencari obat..."
                    @search="onSearchObat"
                    class="modern-select"
                >
                    <template #option="{ nama_brng, kode_brng, kode_sat }">
                        <div class="option-item">
                            <span class="option-name">{{ nama_brng }}</span>
                            <div class="option-meta">
                                <span class="option-code">{{ kode_brng }}</span>
                                <span class="option-badge">{{ kode_sat }}</span>
                            </div>
                        </div>
                    </template>
                    <template #no-options="{ search, searching }">
                    <div class="no-options">
                        <template v-if="searching">
                            <i class="fas fa-search"></i> Tidak ditemukan hasil untuk "<em>{{ search }}</em>".
                        </template>
                        <template v-else>
                            <i class="fas fa-keyboard"></i> Ketik nama obat untuk mencari...
                        </template>
                    </div>
                    </template>
                </VueSelect>
            </div>
            <div class="helper-text" v-if="!selectedObat">
                <i class="fas fa-info-circle"></i> Hanya menampilkan obat yang <strong>belum dimapping</strong>.
            </div>
          </div>
          
          <div class="form-group mb-4" v-if="isEditMode">
            <label class="form-label">Nama Obat</label>
            <div class="readonly-input">
                <i class="fas fa-capsules"></i>
                <input type="text" :value="editObatName" disabled>
            </div>
          </div>

          <div class="row">
              <div class="col-md-5">
                <div class="form-group mb-4">
                    <label class="form-label">Rute Pemberian</label>
                    <VueSelect
                        v-model="formData.rute_pemberian"
                        :options="['Oral', 'Parenteral', 'Topikal', 'Inhalasi', 'Rectal', 'Lainnya']"
                        placeholder="Pilih Rute..."
                        taggable
                        class="modern-select"
                    ></VueSelect>
               </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-4">
                    <label class="form-label">Nilai DDD WHO</label>
                    <div class="input-with-icon">
                        <i class="fas fa-weight-hanging"></i>
                        <input type="text" v-model="formData.nilai_ddd_who" class="form-control" placeholder="Angka">
                    </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group mb-4">
                    <label class="form-label">Status Notif</label>
                    <div class="toggle-container mt-2">
                        <label class="switch">
                            <input type="checkbox" v-model="formData.status_notif" :true-value="1" :false-value="0">
                            <span class="slider round"></span>
                        </label>
                        <span class="ms-2 fw-bold" :class="formData.status_notif == 1 ? 'text-primary' : 'text-muted'">
                            {{ formData.status_notif == 1 ? 'AKTIF' : 'NONAKTIF' }}
                        </span>
                    </div>
                </div>
              </div>
          </div>

        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Batal</button>
          <button @click="saveMapping" class="btn-save" :disabled="saving">
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

// State
const tableData = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(20);

const showModal = ref(false);
const isEditMode = ref(false);
const saving = ref(false);

const obatList = ref([]);
const selectedObat = ref(null);
const editObatName = ref('');

const formData = reactive({
  id: null,
  kode_brng: '',
  rute_pemberian: '',
  nilai_ddd_who: '',
  status_notif: 1
});

// Methods
const loadData = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    const response = await ppraService.getMapping({ 
        keyword: searchQuery.value,
        page: page,
        limit: perPage.value
    });
    tableData.value = response.data.data.data;
    totalPages.value = response.data.data.last_page;
  } catch (error) {
    console.error("Error loading data:", error);
    Swal.fire('Error', 'Gagal memuat data mapping obat', 'error');
  } finally {
    loading.value = false;
  }
};

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadData(1);
  }, 500);
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        loadData(page);
    }
};

const onSearchObat = async (search, loading) => {
    if(search.length < 3) return;
    loading(true);
    try {
        const response = await ppraService.searchObat(search);
        obatList.value = response.data.data || [];
    } catch (e) {
        console.error(e);
    }
    loading(false);
};

const openAddModal = () => {
  isEditMode.value = false;
  selectedObat.value = null;
  obatList.value = []; // Reset history options
  formData.id = null;
  formData.kode_brng = '';
  formData.rute_pemberian = '';
  formData.nilai_ddd_who = '';
  formData.status_notif = 1;
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditMode.value = true;
  formData.id = item.id;
  formData.kode_brng = item.kode_brng;
  formData.rute_pemberian = item.rute_pemberian;
  formData.nilai_ddd_who = item.nilai_ddd_who;
  formData.status_notif = item.status_notif;
  editObatName.value = item.barang?.nama_brng;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveMapping = async () => {
  if (!isEditMode.value && !selectedObat.value) {
    Swal.fire('Warning', 'Silakan pilih obat terlebih dahulu', 'warning');
    return;
  }

  saving.value = true;
  try {
    // Sanitize DDD Value: Convert comma to dot, remove 'g' or other text, keep distinct numbers
    let safeDDD = formData.nilai_ddd_who;
    if (safeDDD) {
        // Replace comma with dot
        safeDDD = safeDDD.replace(/,/g, '.');
        // Remove everything except numbers and dots
        safeDDD = safeDDD.replace(/[^0-9.]/g, '');
    }

    if (isEditMode.value) {
      await ppraService.updateMapping(formData.id, {
        rute_pemberian: formData.rute_pemberian,
        nilai_ddd_who: safeDDD,
        status_notif: formData.status_notif
      });
    } else {
      await ppraService.storeMapping({
        kode_brng: selectedObat.value,
        rute_pemberian: formData.rute_pemberian,
        nilai_ddd_who: safeDDD,
        status_notif: formData.status_notif
      });
    }
    Swal.fire('Sukses', 'Data berhasil disimpan', 'success');
    closeModal();
    loadData(currentPage.value);
  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (item) => {
  const result = await Swal.fire({
    title: 'Hapus Mapping?',
    text: `Anda yakin ingin menghapus mapping untuk ${item.barang?.nama_brng}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!'
  });

  if (result.isConfirmed) {
    try {
      await ppraService.deleteMapping(item.id);
      Swal.fire('Terhapus', 'Data telah dihapus', 'success');
      loadData(currentPage.value);
    } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Added Toggle Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #3498db;
}

input:focus + .slider {
  box-shadow: 0 0 1px #3498db;
}

input:checked + .slider:before {
  -webkit-transform: translateX(24px);
  -ms-transform: translateX(24px);
  transform: translateX(24px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.toggle-container {
    display: flex;
    align-items: center;
}

.badge-status {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 800;
}

.status-active {
    background: #e8f4fd;
    color: #3498db;
}

.status-inactive {
    background: #fdf2f2;
    color: #e74c3c;
}

.ppra-mapping-page {
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
  margin-bottom: 1.5rem;
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
}

/* Modern Table */
.table-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.04);
    overflow: hidden;
    overflow-x: auto;
    border: 1px solid rgba(0,0,0,0.02);
}

.modern-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.modern-table th {
    background: #f8f9fa;
    padding: 1.2rem;
    font-weight: 700;
    color: #34495e;
    text-align: left;
    border-bottom: 2px solid #ecf0f1;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
}

.modern-table td {
    padding: 1.2rem;
    border-bottom: 1px solid #f5f6fa;
    vertical-align: middle;
    transition: background 0.2s;
}

.modern-table tr:last-child td {
    border-bottom: none;
}

.modern-table tr:hover td {
    background-color: #fbfbfd;
}

.badge-code {
    background: #2c3e50;
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: -0.5px;
}

.drug-name {
    font-weight: 700;
    color: #2c3e50;
    font-size: 1.05rem;
    margin-bottom: 4px;
}

.badge-route {
    background: #e8f8f5;
    color: #1abc9c;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    display: inline-block;
}

.badge-satuan {
    background: #dfe6e9;
    color: #636e72;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    gap: 0.6rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #ebf5fb;
  color: #3498db;
}

.btn-delete {
  background: #fdedec;
  color: #e74c3c;
}

.btn-edit:hover { background: #3498db; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2); }
.btn-delete:hover { background: #c0392b; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(192, 57, 43, 0.2); }

/* Pagination */
.pagination-container {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    background: white;
    border-top: 1px solid #f1f2f6;
}

.btn-page {
    background: white;
    border: 1px solid #dfe6e9;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-page:hover:not(:disabled) {
    background: #3498db;
    border-color: #3498db;
    color: white;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f1f2f6;
}

.page-info {
    font-size: 0.95rem;
    color: #7f8c8d;
    font-weight: 600;
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

.helper-text {
    font-size: 0.85rem;
    color: #7f8c8d;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
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

/* Responsive */
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

  .modern-table th:nth-child(4),
  .modern-table td:nth-child(4) {
      display: none; 
  }
  
  .col-md-6 {
      flex: 100%;
  }

  /* Modal Mobile Tweaks */
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

