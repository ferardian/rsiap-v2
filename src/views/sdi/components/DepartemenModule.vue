<template>
  <div class="departemen-module">
    <!-- Header Actions -->
    <div class="header-actions-bar d-flex align-items-center mb-4">
      <div class="search-wrapper flex-grow-1 me-2" style="max-width: 400px;">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari ID atau Nama Departemen..."
          @input="handleSearch"
        />
      </div>
      <button class="btn-add-blue" @click="openAddModal" style="padding: 0.75rem 1.5rem;">
        <i class="fas fa-plus"></i>
        <span class="ms-2">Tambah Departemen</span>
      </button>
    </div>

    <!-- Table Container -->
    <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 16px;">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4">ID</th>
              <th>Nama Departemen</th>
              <th>Kelompok</th>
              <th>Status</th>
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
            <tr v-else-if="departemenList.length === 0" class="text-center">
              <td colspan="5" class="py-5">
                <i class="fas fa-folder-open fa-2x text-muted mb-2"></i>
                <p class="text-muted mb-0">Belum ada data departemen</p>
              </td>
            </tr>
            <tr v-for="item in departemenList" :key="item.dep_id">
              <td class="ps-4 fw-bold text-muted">{{ item.dep_id }}</td>
              <td>{{ item.nama }}</td>
              <td>
                <span class="badge bg-info-subtle text-info border border-info-subtle px-3 py-2">
                  Kelompok {{ item.kelompok || '-' }}
                </span>
              </td>
              <td>
                <span :class="['badge px-3 py-2', item.aktif == '1' ? 'bg-success text-white' : 'bg-secondary text-white']">
                  {{ item.aktif == '1' ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
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
          <h4 class="fw-bold m-0">{{ isEditMode ? 'Edit Departemen' : 'Tambah Departemen' }}</h4>
          <button type="button" class="btn-close shadow-none" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="saveDepartemen">
          <div class="modal-body px-4 py-4">
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark">ID Departemen (Max 4 Karakter) <span class="text-danger">*</span></label>
              <input 
                v-model="form.dep_id" 
                type="text" 
                class="form-control custom-input" 
                maxlength="4" 
                :disabled="isEditMode"
                required
                placeholder="PROG"
              >
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark">Nama Departemen <span class="text-danger">*</span></label>
              <input 
                v-model="form.nama" 
                type="text" 
                class="form-control custom-input" 
                required
                placeholder="Programmer"
              >
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold small text-dark">Kelompok</label>
                <select v-model="form.kelompok" class="form-select custom-input">
                  <option value="">- Pilih -</option>
                  <option v-for="k in kelompokOptions" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold small text-dark">Status</label>
                <select v-model="form.aktif" class="form-select custom-input">
                  <option value="1">Aktif</option>
                  <option value="0">Non-Aktif</option>
                </select>
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
        <h5 class="fw-bold">Hapus Departemen?</h5>
        <p class="text-muted pb-3">Apakah Anda yakin ingin menghapus <strong>{{ selectedItem?.nama }}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
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
import departemenService from '../../../services/departemenService';

const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
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
  dep_id: '',
  nama: '',
  kelompok: '',
  aktif: '1'
});

const kelompokOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '11', '12'];

// Computed
const totalPages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.current_page - 2);
  const end = Math.min(pagination.last_page, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// Methods
const fetchDepartemen = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.per_page,
      page: pagination.current_page
    };

    let response;
    if (searchQuery.value) {
      params.search = { value: searchQuery.value };
      response = await departemenService.search(params);
    } else {
      response = await departemenService.index(params);
    }

    if (response.data) {
      const { data, meta } = response.data;
      departemenList.value = data;
      Object.assign(pagination, {
        total: meta.total,
        current_page: meta.current_page,
        last_page: meta.last_page,
        from: meta.from,
        to: meta.to
      });
    }
  } catch (error) {
    console.error('Error fetching departemen:', error);
    toast.error('Gagal mengambil data departemen');
  } finally {
    loading.value = false;
  }
};

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.current_page = 1;
    fetchDepartemen();
  }, 500);
};

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return;
  pagination.current_page = page;
  fetchDepartemen();
};

const openAddModal = async () => {
  isEditMode.value = false;
  Object.assign(form, {
    dep_id: '',
    nama: '',
    kelompok: '',
    aktif: '1'
  });
  
  try {
    const response = await departemenService.getNextId();
    if (response.data && response.data.status === 'success') {
      form.dep_id = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching next ID:', error);
  }

  showModal.value = true;
};

const openEditModal = (item) => {
  isEditMode.value = true;
  selectedItem.value = item;
  Object.assign(form, {
    dep_id: item.dep_id,
    nama: item.nama,
    kelompok: item.kelompok || '',
    aktif: item.aktif
  });
  showModal.value = true;
};

const saveDepartemen = async () => {
  saving.value = true;
  try {
    const payload = { ...form };
    let response;
    
    if (isEditMode.value) {
      response = await departemenService.update(selectedItem.value.dep_id, payload);
    } else {
      response = await departemenService.store(payload);
    }

    if (response.status >= 200 && response.status < 300) {
      toast.success(isEditMode.value ? 'Departemen diperbarui' : 'Departemen ditambahkan');
      showModal.value = false;
      fetchDepartemen();
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
    const response = await departemenService.destroy(selectedItem.value.dep_id);
    if (response.status >= 200 && response.status < 300) {
      toast.success('Departemen berhasil dihapus');
      showDeleteModal.value = false;
      fetchDepartemen();
    }
  } catch (error) {
    toast.error('Gagal menghapus departemen');
  }
};

onMounted(() => {
  fetchDepartemen();
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
  max-width: 480px !important;
  overflow: hidden;
}

.custom-input {
  border: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  border-radius: 16px !important;
  padding: 1rem 1.25rem !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  transition: all 0.2s !important;
}

.custom-input:focus {
  border-color: #3160D8 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(49, 96, 216, 0.1) !important;
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

.badge {
  font-weight: 600;
  font-size: 0.75rem;
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

.form-control:focus, .form-select:focus {
  background-color: #fff !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
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
