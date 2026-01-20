<template>
  <div class="committee-tab-container">
    <!-- Header Actions -->
    <div class="header-actions">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearch"
          placeholder="Cari NIK atau nama anggota komite..."
        />
      </div>
      <button class="btn-add" @click="openAddModal">
        <i class="fas fa-plus"></i>
        <span>Tambah Anggota Komite</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="!loading && committeesData.length > 0" class="committee-groups">
      <div v-for="group in groupedMembers" :key="group.id" class="committee-card">
        <div class="card-header">
          <div class="committee-info">
            <i class="fas fa-users-cog"></i>
            <h3>{{ group.nama }}</h3>
          </div>
          <span class="member-count">{{ group.members.length }} Anggota</span>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>NIK / Nama</th>
                  <th>Jabatan</th>
                  <th>SK Nomor</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in group.members" :key="member.id">
                  <td>
                    <div class="member-profile">
                      <span class="member-name">{{ member.pegawai?.nama || 'Unknown' }}</span>
                      <span class="member-nik">{{ member.nik }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="position-badge" :class="getPositionClass(member.jabatan?.nama)">
                      {{ member.jabatan?.nama }}
                    </span>
                  </td>
                  <td>{{ member.sk_nomor || '-' }}</td>
                  <td>
                    <div class="period-info">
                      <span>{{ formatDate(member.tgl_mulai) }}</span>
                      <i class="fas fa-arrow-right"></i>
                      <span>{{ member.tgl_selesai ? formatDate(member.tgl_selesai) : 'Sekarang' }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', member.status == 1 ? 'active' : 'inactive']">
                      {{ member.status == 1 ? 'Aktif' : 'Non-Aktif' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" @click="openEditModal(member)" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-delete" @click="confirmDelete(member)" title="Hapus">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-users-slash"></i>
      <p>Belum ada data anggota komite</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Anggota Komite' : 'Tambah Anggota Komite' }}</h3>
          <button class="btn-close" @click="showModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveMember">
          <div class="modal-body">
            <div class="form-group">
              <label>Pegawai <span class="required">*</span></label>
              <v-select
                v-model="form.nik"
                :options="pegawaiOptions"
                :reduce="pegawai => pegawai.nik"
                label="label"
                placeholder="Ketik nama atau NIK pegawai..."
                :disabled="isEditMode"
                @search="onSearchPegawai"
                :filterable="false"
                required
              >
                <template #no-options="{ search, searching }">
                  <template v-if="searching">
                    Tidak ditemukan hasil untuk "<em>{{ search }}</em>".
                  </template>
                  <em v-else style="opacity: 0.5;">Ketik minimal 3 karakter untuk mencari...</em>
                </template>
              </v-select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Komite <span class="required">*</span></label>
                <select v-model="form.komite_id" required>
                  <option value="">Pilih Komite</option>
                  <option v-for="c in committeesList" :key="c.id" :value="c.id">
                    {{ c.nama }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Jabatan <span class="required">*</span></label>
                <select v-model="form.jabatan_id" required>
                  <option value="">Pilih Jabatan</option>
                  <option v-for="p in positionsList" :key="p.id" :value="p.id">
                    {{ p.nama }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Nomor SK</label>
              <input type="text" v-model="form.sk_nomor" placeholder="Contoh: SK/001/KOMITE-K3/2024">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tanggal Mulai <span class="required">*</span></label>
                <input type="date" v-model="form.tgl_mulai" required>
              </div>
              <div class="form-group">
                <label>Tanggal Selesai</label>
                <input type="date" v-model="form.tgl_selesai">
                <small class="help-text">Kosongkan jika masih menjabat</small>
              </div>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option :value="1">Aktif</option>
                <option :value="0">Non-Aktif</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content small-modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus</h3>
        </div>
        <div class="modal-body">
          <p>Yakin ingin menghapus <strong>{{ selectedMember?.pegawai?.nama }}</strong> dari komite?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-confirm-delete" @click="deleteMember">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import committeeService from '../../../services/committeeService';
import { pegawaiService } from '../../../services/pegawaiService';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const committeesData = ref([]);
const committeesList = ref([]);
const positionsList = ref([]);
const pegawaiOptions = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);
const selectedMember = ref(null);

const form = ref({
  nik: '',
  komite_id: '',
  jabatan_id: '',
  tgl_mulai: '',
  tgl_selesai: null,
  sk_nomor: '',
  status: 1
});

// Computed
const groupedMembers = computed(() => {
  if (!committeesList.value.length) return [];
  
  return committeesList.value.map(c => {
    const members = committeesData.value.filter(m => m.komite_id === c.id);
    // Apply search filter
    const filteredMembers = searchQuery.value 
      ? members.filter(m => 
          m.pegawai?.nama?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
          m.nik.includes(searchQuery.value)
        )
      : members;

    return {
      ...c,
      members: filteredMembers
    };
  }).filter(g => g.members.length > 0 || (searchQuery.value === '' && committeesData.value.some(m => m.komite_id === g.id)));
});

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const [commRes, allMembersRes] = await Promise.all([
      committeeService.index(),
      committeeService.getAllMembers()
    ]);

    if (commRes.data.success) {
      committeesList.value = commRes.data.data.committees;
      positionsList.value = commRes.data.data.positions;
    }
    
    if (allMembersRes.data.success) {
      committeesData.value = allMembersRes.data.data;
    }
  } catch (error) {
    console.error('Error loading committee data:', error);
    toast.error('Gagal memuat data komite');
  } finally {
    loading.value = false;
  }
};

const loadPegawai = async (search = '') => {
  try {
    const response = await pegawaiService.getKaryawanList({ search, limit: 20 });
    if (response.data.success) {
      pegawaiOptions.value = response.data.data.map(p => ({
        nik: p.nik,
        label: `${p.nik} - ${p.nama}`
      }));
    }
  } catch (error) {
    console.error('Error loading pegawai:', error);
  }
};

let searchTimeout = null;
const onSearchPegawai = (search, loading) => {
  if (search.length < 3) return;

  loading(true);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await loadPegawai(search);
    loading(false);
  }, 500);
};

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
  showModal.value = true;
};

const openEditModal = (member) => {
  isEditMode.value = true;
  selectedMember.value = member;
  
  // Prepopulate options for edit mode so v-select can display the label
  if (member.pegawai) {
    pegawaiOptions.value = [{
      nik: member.nik,
      label: `${member.nik} - ${member.pegawai.nama}`
    }];
  }

  form.value = {
    id: member.id,
    nik: member.nik,
    komite_id: member.komite_id,
    jabatan_id: member.jabatan_id,
    tgl_mulai: member.tgl_mulai,
    tgl_selesai: member.tgl_selesai,
    sk_nomor: member.sk_nomor,
    status: member.status
  };
  showModal.value = true;
};

const resetForm = () => {
  pegawaiOptions.value = []; // Reset options
  form.value = {
    nik: '',
    komite_id: '',
    jabatan_id: '',
    tgl_mulai: new Date().toISOString().split('T')[0],
    tgl_selesai: null,
    sk_nomor: '',
    status: 1
  };
};

const saveMember = async () => {
  saving.value = true;
  try {
    let response;
    if (isEditMode.value) {
      response = await committeeService.update(form.value.id, form.value);
    } else {
      response = await committeeService.store(form.value);
    }

    if (response.data.success) {
      toast.success(isEditMode.value ? 'Berhasil diperbarui' : 'Berhasil ditambahkan');
      showModal.value = false;
      loadData();
    }
  } catch (error) {
    toast.error('Gagal menyimpan data');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (member) => {
  selectedMember.value = member;
  showDeleteModal.value = true;
};

const deleteMember = async () => {
  try {
    const response = await committeeService.destroy(selectedMember.value.id);
    if (response.data.success) {
      toast.success('Berhasil dihapus');
      showDeleteModal.value = false;
      loadData();
    }
  } catch (error) {
    toast.error('Gagal menghapus');
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getPositionClass = (pos) => {
  if (!pos) return '';
  const p = pos.toLowerCase();
  if (p.includes('ketua')) return 'pos-ketua';
  if (p.includes('sekretaris')) return 'pos-sekretaris';
  return 'pos-anggota';
};

const handleSearch = () => {
  // Handled by computed groupedMembers
};

onMounted(() => {
  loadData();
  loadPegawai();
});
</script>

<style scoped>
.committee-tab-container {
  padding: 1rem 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #2563eb;
}

.committee-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.committee-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.committee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.committee-info i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.committee-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 700;
}

.member-count {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.card-body {
  padding: 0;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.member-profile {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 600;
  color: #1e293b;
}

.member-nik {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.position-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pos-ketua { background: #fee2e2; color: #991b1b; }
.pos-sekretaris { background: #fef3c7; color: #92400e; }
.pos-anggota { background: #dcfce7; color: #166534; }

.period-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #475569;
}

.period-info i {
  font-size: 0.7rem;
  color: #94a3b8;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-badge.active { background: #34d399; color: white; }
.status-badge.inactive { background: #94a3b8; color: white; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  background: #f8fafc;
}

.btn-edit:hover { background: #dbeafe; color: #2563eb; }
.btn-delete:hover { background: #fee2e2; color: #dc2626; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.small-modal { max-width: 400px; }

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.25rem; }

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.required { color: #dc2626; }

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* Loading/Empty State */
.loading-state, .empty-state {
  padding: 4rem;
  text-align: center;
  color: #94a3b8;
}

.loading-state i, .empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .header-actions { flex-direction: column; align-items: stretch; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
