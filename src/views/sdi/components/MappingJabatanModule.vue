<template>
  <div class="mapping-jabatan-module">
    <!-- Header Actions -->
    <div class="header-actions-bar d-flex align-items-center mb-4">
      <div class="search-wrapper flex-grow-1 me-2" style="max-width: 400px;">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari Jabatan atau Departemen..."
          @input="handleSearch"
        />
      </div>
      <button class="btn-add-blue" @click="openAddModal" style="padding: 0.75rem 1.5rem;">
        <i class="fas fa-plus"></i>
        <span class="ms-2">Tambah Mapping</span>
      </button>
    </div>

    <!-- Table Container -->
    <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 16px;">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4">Jabatan Atas (Up)</th>
              <th>Departemen Atas</th>
              <th>Jabatan Bawah (Down)</th>
              <th>Departemen Bawah</th>
              <th class="text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="5" class="py-5">
                <i class="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
                <p class="text-muted mb-0">Memuat data...</p>
              </td>
            </tr>
            <tr v-else-if="mappingList.length === 0" class="text-center">
              <td colspan="5" class="py-5">
                <i class="fas fa-sitemap fa-2x text-muted mb-2"></i>
                <p class="text-muted mb-0">Belum ada data mapping jabatan</p>
              </td>
            </tr>
            <tr v-for="item in mappingList" :key="item.id">
              <td class="ps-4 fw-medium text-dark">{{ item.nama_jabatan_up || item.kd_jabatan_up }}</td>
              <td>{{ item.nama_departemen_up || item.dep_id_up }}</td>
              <td class="fw-medium text-dark">{{ item.nama_jabatan_down || item.kd_jabatan_down }}</td>
              <td>{{ item.nama_departemen_down || item.dep_id_down }}</td>
              <td class="text-end pe-4">
                <div class="btn-group">
                  <button class="btn btn-sm btn-light-primary border text-primary me-2" @click="openEditModal(item)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-light-danger border text-danger" @click="confirmDelete(item)" title="Hapus">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center" v-if="pagination.total > 0">
        <small class="text-muted">
          Menampilkan {{ pagination.from }} sampai {{ pagination.to }} dari {{ pagination.total }} data
        </small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: pagination.current_page === page }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-dialog modal-content border-0 shadow custom-modal-box" @click.stop>
        <div class="modal-header border-bottom-0 px-4 pt-4 pb-0">
          <h4 class="fw-bold m-0">{{ isEditMode ? 'Edit Mapping' : 'Tambah Mapping' }}</h4>
          <button type="button" class="btn-close shadow-none" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="saveMapping">
          <div class="modal-body px-4 py-4">
            
            <div class="mb-3">
              <h6 class="fw-bold text-primary mb-3"><i class="fas fa-arrow-up me-2"></i>Atasan (UP)</h6>
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Jabatan Atas <span class="text-danger">*</span></label>
                <v-select
                  v-model="form.kd_jabatan_up"
                  :options="jabatanList"
                  label="nama"
                  :reduce="j => j.kode"
                  placeholder="Pilih Jabatan"
                  class="modern-v-select"
                  @search="onSearchJabatan"
                  teleport="body"
                  required
                />
              </div>
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Departemen Atas <span class="text-danger">*</span></label>
                <v-select
                  v-model="form.dep_id_up"
                  :options="departemenList"
                  label="nama"
                  :reduce="d => d.dep_id"
                  placeholder="Pilih Departemen"
                  class="modern-v-select"
                  @search="onSearchDepartemen"
                  teleport="body"
                  required
                />
              </div>
            </div>

            <hr class="my-4">

            <div class="mb-3">
              <h6 class="fw-bold text-success mb-3"><i class="fas fa-arrow-down me-2"></i>Bawah (DOWN)</h6>
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Jabatan Bawah <span class="text-danger">*</span></label>
                <v-select
                  v-model="form.kd_jabatan_down"
                  :options="jabatanList"
                  label="nama"
                  :reduce="j => j.kode"
                  placeholder="Pilih Jabatan"
                  class="modern-v-select"
                  @search="onSearchJabatan"
                  teleport="body"
                  required
                />
              </div>
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Departemen Bawah <span class="text-danger">*</span></label>
                <v-select
                  v-model="form.dep_id_down"
                  :options="departemenList"
                  label="nama"
                  :reduce="d => d.dep_id"
                  placeholder="Pilih Departemen"
                  class="modern-v-select"
                  @search="onSearchDepartemen"
                  teleport="body"
                  required
                />
              </div>
            </div>

          </div>
          <div class="modal-footer border-top-0 flex-column gap-3 px-4 pb-4">
            <button type="button" class="btn btn-white w-100 py-3 fw-bold custom-cancel-btn" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary w-100 py-3 fw-bold custom-submit-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin me-2"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-dialog modal-content border-0 shadow text-center p-4" @click.stop style="border-radius: 20px; max-width: 400px;">
        <div class="mb-3 mt-2 text-danger">
          <i class="fas fa-exclamation-circle fa-4x"></i>
        </div>
        <h5 class="fw-bold">Hapus Mapping?</h5>
        <p class="text-muted pb-3">Apakah Anda yakin ingin menghapus mapping ini?</p>
        <div class="d-flex gap-2 justify-content-center">
          <button class="btn btn-light px-4" @click="showDeleteModal = false" style="border-radius: 10px;">Batal</button>
          <button class="btn btn-danger px-4" @click="handleDelete" style="border-radius: 10px;">Ya, Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import mappingJabatanService from '../../../services/mappingJabatanService';
import departemenService from '../../../services/departemenService';

const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const mappingList = ref([]);
const jabatanList = ref([]);
const departemenList = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);
const selectedItem = ref(null);

const pagination = reactive({
  total: 0,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  per_page: 10
});

const form = reactive({
  kd_jabatan_up: '',
  dep_id_up: '',
  kd_jabatan_down: '',
  dep_id_down: ''
});

// Computed
const totalPages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.current_page - 2);
  const end = Math.min(pagination.last_page, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// Methods
const fetchMappings = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.per_page,
      page: pagination.current_page,
      keyword: searchQuery.value
    };

    const response = await mappingJabatanService.getMappings(params);

    if (response.data && response.data.success) {
      const { data, meta, links } = response.data.data; // Structure might vary depending on standard response, assuming paginated
      // If using simple pagination directly from controller:
      // response.data.data contains data inside data key, and other keys are pagination info
      
      // Let's assume standard Laravel pagination JSON structure
      mappingList.value = response.data.data.data; 
      Object.assign(pagination, {
        total: response.data.data.total,
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        from: response.data.data.from,
        to: response.data.data.to
      });
    }
  } catch (error) {
    console.error('Error fetching mappings:', error);
    toast.error('Gagal mengambil data mapping');
  } finally {
    loading.value = false;
  }
};

const fetchJabatan = async (keyword = '') => {
  try {
    const response = await mappingJabatanService.getJabatanList(keyword);
    if (response.data && response.data.success) {
      jabatanList.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching jabatan:', error);
  }
};

const fetchDepartemen = async (keyword = '') => {
  try {
    const params = { limit: 50 };
    if (keyword) params.search = { value: keyword };
    
    const response = await departemenService.index(params);
    if (response.data && response.data.data) {
      departemenList.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching departemen:', error);
  }
};

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.current_page = 1;
    fetchMappings();
  }, 500);
};

const onSearchJabatan = (keyword, loading) => {
  if (keyword.length) {
    loading(true);
    fetchJabatan(keyword).then(() => loading(false));
  }
};

const onSearchDepartemen = (keyword, loading) => {
  if (keyword.length) {
    loading(true);
    fetchDepartemen(keyword).then(() => loading(false));
  }
};

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return;
  pagination.current_page = page;
  fetchMappings();
};

const openAddModal = async () => {
  isEditMode.value = false;
  Object.assign(form, {
    kd_jabatan_up: '',
    dep_id_up: '',
    kd_jabatan_down: '',
    dep_id_down: ''
  });
  
  if (jabatanList.value.length === 0) fetchJabatan();
  if (departemenList.value.length === 0) fetchDepartemen();

  showModal.value = true;
};

const openEditModal = async (item) => {
  isEditMode.value = true;
  selectedItem.value = item;
  Object.assign(form, {
    kd_jabatan_up: item.kd_jabatan_up,
    dep_id_up: item.dep_id_up,
    kd_jabatan_down: item.kd_jabatan_down,
    dep_id_down: item.dep_id_down
  });

  if (jabatanList.value.length === 0) fetchJabatan();
  if (departemenList.value.length === 0) fetchDepartemen();

  showModal.value = true;
};

const saveMapping = async () => {
  if (!form.kd_jabatan_up || !form.dep_id_up || !form.kd_jabatan_down || !form.dep_id_down) {
    toast.error('Semua field harus diisi!');
    return;
  }

  saving.value = true;
  try {
    const payload = { ...form };
    let response;
    
    if (isEditMode.value) {
      response = await mappingJabatanService.updateMapping(selectedItem.value.id, payload);
    } else {
      response = await mappingJabatanService.createMapping(payload);
    }

    if (response.data && response.data.success) {
      toast.success(isEditMode.value ? 'Mapping diperbarui' : 'Mapping ditambahkan');
      showModal.value = false;
      fetchMappings();
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menyimpan data';
    toast.error(msg);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    const response = await mappingJabatanService.deleteMapping(selectedItem.value.id);
    if (response.data && response.data.success) {
      toast.success('Mapping berhasil dihapus');
      showDeleteModal.value = false;
      fetchMappings();
    }
  } catch (error) {
    toast.error('Gagal menghapus mapping');
  }
};

onMounted(() => {
  fetchMappings();
});
</script>

<style scoped>
.search-wrapper {
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  transition: all 0.3s;
}

.search-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-wrapper i {
  color: #94a3b8;
  margin-right: 0.75rem;
}

.search-wrapper input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  padding: 0.75rem 0;
}

.btn-add-blue {
  background-color: #3160D8;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-blue:hover {
  background-color: #254db5;
  transform: translateY(-1px);
}

.custom-modal-box {
  background-color: white !important;
  border-radius: 24px !important;
  max-width: 500px !important;
  overflow: visible; /* Allow v-select dropdown to overflow if needed, though using teleport */
}

/* Modern V-Select Styling */
.modern-v-select {
  --vs-border-color: #e2e8f0;
  --vs-border-width: 1px;
  --vs-border-radius: 12px;
  --vs-font-size: 0.95rem;
  --vs-line-height: 1.5;
  background: #f8fafc;
  border-radius: 12px;
}

.modern-v-select :deep(.vs__dropdown-toggle) {
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.custom-cancel-btn {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: none !important;
  border-radius: 16px !important;
  font-size: 1.1rem !important;
}

.custom-cancel-btn:hover {
  background-color: #e2e8f0 !important;
}

.custom-submit-btn {
  background-color: #3160D8 !important;
  color: white !important;
  border: none !important;
  border-radius: 16px !important;
  font-size: 1.1rem !important;
  box-shadow: 0 4px 6px -1px rgba(49, 96, 216, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  margin: 0;
}

.table th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.table td {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  font-size: 0.875rem;
}

.btn-light-primary {
  background-color: #eff6ff;
  color: #1d4ed8;
}
.btn-light-primary:hover {
  background-color: #1d4ed8;
  color: white;
}

.btn-light-danger {
  background-color: #fef2f2;
  color: #b91c1c;
}
.btn-light-danger:hover {
  background-color: #b91c1c;
  color: white;
}

.pagination .page-link {
  border: none;
  border-radius: 8px;
  margin: 0 2px;
  color: #64748b;
  font-weight: 600;
}

.pagination .page-item.active .page-link {
  background-color: #3b82f6;
  color: white;
}
</style>
