<template>
  <div class="ppra-report-container">
    <div class="header-section mb-4">
      <h2 class="page-title text-primary"><i class="fas fa-file-medical-alt me-2"></i> Laporan PPRA</h2>
      <p class="text-muted">Laporan Penggunaan Antibiotik (Antibiotic Use Report)</p>
    </div>

    <!-- Filter Card -->
    <div class="filter-card glass-effect mb-4 animate-fade">
      <div class="d-flex flex-wrap align-items-end gap-3">
        <div class="filter-item">
          <label class="form-label-custom">Tanggal Start</label>
          <input v-model="filters.tgl_start" type="date" class="form-control modern-input date-input">
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Tanggal End</label>
          <input v-model="filters.tgl_end" type="date" class="form-control modern-input date-input">
        </div>
        <div class="filter-actions d-flex gap-2">
          <button class="btn btn-primary ripple" @click="fetchData" :disabled="loading">
            <i class="fas fa-search me-1"></i> Tampilkan
          </button>
          <button class="btn btn-success ripple" @click="exportToExcel" :disabled="reportData.length === 0">
            <i class="fas fa-file-excel me-1"></i> Export Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Report Table -->
    <div class="report-table-wrapper glass-effect animate-fade">
      <div v-if="loading" class="loading-state py-5 text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Menganalisis data antibiotik...</p>
      </div>

      <div v-else-if="reportData.length === 0" class="empty-state py-5 text-center">
        <i class="fas fa-notes-medical fa-3x text-muted opacity-50"></i>
        <p class="mt-3">Tidak ada data antibiotik terhubung PPRA untuk periode ini.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-bordered ppra-table">
          <thead>
            <tr class="bg-light">
              <th width="50" class="text-center">No</th>
              <th>Nama Pasien</th>
              <th width="100">No. RM</th>
              <th>Diagnosa</th>
              <th>Jenis Ab</th>
              <th width="80" class="text-center">Rute</th>
              <th width="100">LOS (Hari)</th>
              <th>Aturan Pakai</th>
              <th>Total Pakai</th>
              <th width="100" class="text-center">Total DDD</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in reportData" :key="index" :class="{'new-patient-row': item.is_new_patient}">
              <td class="text-center">{{ item.is_new_patient ? getPatientIndex(index) : '' }}</td>
              <td :class="{'fw-bold': item.is_new_patient}">{{ item.nm_pasien }}</td>
              <td class="text-muted">{{ item.no_rkm_medis }}</td>
              <td class="small diagnosa-cell">{{ item.diagnosa }}</td>
              <td>{{ item.jenis_ab }}</td>
              <td class="text-center"><span class="badge badge-rute">{{ item.rute }}</span></td>
              <td>{{ item.los }}</td>
              <td class="small editable-cell aturan-pakai-cell" @click="openAdjustmentModal(item)">
                {{ item.penggunaan_harian || '-' }}
                <i class="fas fa-edit ms-1 opacity-25 edit-icon"></i>
              </td>
              <td class="small">
                <div class="d-flex flex-column gap-1">
                  <span :class="getStatusBadgeClass(item.status_telaah, 'telaah')" style="font-size: 10px; padding: 2px 5px;">
                    T: {{ item.status_telaah }}
                  </span>
                  <span :class="getStatusBadgeClass(item.status_persetujuan, 'approve')" style="font-size: 10px; padding: 2px 5px;">
                    P: {{ item.status_persetujuan }}
                  </span>
                </div>
              </td>
              <td class="fw-bold">{{ item.total_pakai }}</td>
              <td class="text-center bg-soft-primary fw-bold text-primary">{{ item.total_ddd }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div v-if="showModal" class="modal-overlay animate-fade" @click.self="closeModal">
      <div class="modal-content glass-effect animate-slide-up">
        <div class="modal-header border-0 pb-0">
          <ul class="nav nav-tabs border-bottom-0 w-100">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'adjustment' }" href="#" @click.prevent="activeTab = 'adjustment'">
                <i class="fas fa-edit me-1"></i> Penyesuaian
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'telaah' }" href="#" @click.prevent="activeTab = 'telaah'">
                <i class="fas fa-microscope me-1"></i> Telaah
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'approval' }" href="#" @click.prevent="activeTab = 'approval'">
                <i class="fas fa-check-double me-1"></i> Persetujuan
              </a>
            </li>
          </ul>
          <button class="btn-close ms-2" @click="closeModal"></button>
        </div>
        <div class="modal-body p-4 pt-3">
          <!-- Info Ringkas -->
          <div class="patient-info-brief mb-4">
            <div class="row">
              <div class="col-6 border-end">
                <label class="small text-muted mb-1">Nama Pasien</label>
                <div class="fw-bold truncate-text">{{ editingItem.nm_pasien }}</div>
              </div>
              <div class="col-6">
                <label class="small text-muted mb-1">Jenis Antibiotik</label>
                <div class="fw-bold text-primary truncate-text">{{ editingItem.jenis_ab }}</div>
              </div>
            </div>
          </div>

          <!-- TAB: ADJUSTMENT -->
          <div v-if="activeTab === 'adjustment'" class="animate-fade">
            <div class="mb-3">
              <label class="form-label-custom">Aturan Pakai (Verifikasi)</label>
              <input v-model="adjustmentForm.aturan_pakai" type="text" class="form-control modern-input" placeholder="Contoh: 3 x 1 tablet">
              <div class="small text-muted mt-2">
                <i class="fas fa-info-circle me-1"></i> Digunakan jika aturan pakai asli dokter kosong.
              </div>
            </div>
            
            <div class="mb-0">
              <label class="form-label-custom">Keterangan Tambahan</label>
              <textarea v-model="adjustmentForm.keterangan" class="form-control modern-input" style="height: 100px" placeholder="Beri catatan jika diperlukan..."></textarea>
            </div>
          </div>

          <!-- TAB: TELAAH -->
          <div v-if="activeTab === 'telaah'" class="animate-fade">
             <div class="mb-3">
                <label class="form-label-custom">Hasil Telaah Apoteker</label>
                <select v-model="telaahForm.status_telaah" class="form-select modern-input">
                  <option value="SESUAI">SESUAI (Klinis & Farmasi)</option>
                  <option value="TIDAK SESUAI">TIDAK SESUAI</option>
                </select>
             </div>
             <div class="mb-0">
                <label class="form-label-custom">Catatan Telaah</label>
                <textarea v-model="telaahForm.catatan_telaah" class="form-control modern-input" style="height: 120px" placeholder="Beri alasan telaah..."></textarea>
             </div>
          </div>

          <!-- TAB: APPROVAL -->
          <div v-if="activeTab === 'approval'" class="animate-fade">
             <div class="mb-3">
                <label class="form-label-custom">Keputusan Ketua PPRA</label>
                <select v-model="approveForm.status_persetujuan" class="form-select modern-input">
                  <option value="PENDING">PENDING</option>
                  <option value="ACC">SETUJU (ACC)</option>
                  <option value="REJECT">TOLAK (REJECT)</option>
                </select>
             </div>
             <div class="mb-0">
                <label class="form-label-custom">Catatan Persetujuan</label>
                <textarea v-model="approveForm.catatan_persetujuan" class="form-control modern-input" style="height: 120px" placeholder="Instruksi tambahan dari ketua..."></textarea>
             </div>
          </div>
        </div>

        <div class="modal-footer p-3 bg-light d-flex justify-content-end gap-2 border-0">
          <button class="btn btn-light" @click="closeModal" :disabled="saving">Batal</button>
          
          <button v-if="activeTab === 'adjustment'" class="btn btn-primary" @click="saveAdjustment" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Adjustment
          </button>
          
          <button v-if="activeTab === 'telaah'" class="btn btn-success" @click="saveTelaah" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Telaah
          </button>
          
          <button v-if="activeTab === 'approval'" class="btn btn-dark" @click="saveApproval" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Keputusan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import ppraService from '@/services/ppraService';
import { utils, writeFile } from 'xlsx';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const reportData = ref([]);
const filters = reactive({
  tgl_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  tgl_end: dayjs().format('YYYY-MM-DD')
});

const editingItem = ref(null);
const adjustmentForm = reactive({
  no_resep: '',
  kode_brng: '',
  aturan_pakai: '',
  keterangan: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await ppraService.getLaporan(filters);
    reportData.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch report:', error);
    Swal.fire('Gagal', 'Tidak dapat mengambil data laporan', 'error');
  } finally {
    loading.value = false;
  }
};

const getStatusBadgeClass = (status, type) => {
  if (type === 'telaah') {
    if (status === 'SESUAI') return 'badge bg-success';
    if (status === 'TIDAK SESUAI') return 'badge bg-danger';
    return 'badge bg-secondary';
  } else {
    if (status === 'ACC') return 'badge bg-success';
    if (status === 'REJECT') return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  }
};

const openAdjustmentModal = (item) => {
  editingItem.value = item;
  adjustmentForm.no_resep = item.no_resep;
  adjustmentForm.kode_brng = item.kode_brng;
  adjustmentForm.aturan_pakai = item.penggunaan_harian === '-' ? '' : item.penggunaan_harian;
  adjustmentForm.frekuensi = '';
  adjustmentForm.dosis = '';
  adjustmentForm.satuan = 'mg';
  adjustmentForm.keterangan = '';

  telaahForm.status_telaah = item.status_telaah !== 'BELUM' ? item.status_telaah : 'SESUAI';
  telaahForm.catatan_telaah = item.catatan_telaah || '';

  approveForm.status_persetujuan = item.status_persetujuan !== 'PENDING' ? item.status_persetujuan : 'PENDING';
  approveForm.catatan_persetujuan = item.catatan_persetujuan || '';

  activeTab.value = 'adjustment';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveAdjustment = async () => {
    // ... same as before but keeping it clean ...
  saving.value = true;
  try {
    await ppraService.storeVerifikasi(adjustmentForm);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Adjustment berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data', 'error');
  } finally {
    saving.value = false;
  }
};

const saveTelaah = async () => {
  saving.value = true;
  try {
    await ppraService.storeTelaah({
      no_resep: editingItem.value.no_resep,
      kode_brng: editingItem.value.kode_brng,
      ...telaahForm
    });
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Telaah berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menyimpan telaah', 'error');
  } finally {
    saving.value = false;
  }
};

const saveApproval = async () => {
  saving.value = true;
  try {
    await ppraService.storeApprove({
      no_resep: editingItem.value.no_resep,
      kode_brng: editingItem.value.kode_brng,
      ...approveForm
    });
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Persetujuan berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menyimpan persetujuan', 'error');
  } finally {
    saving.value = false;
  }
};

const getPatientIndex = (index) => {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (reportData.value[i].is_new_patient) count++;
  }
  return count;
};

const exportToExcel = () => {
  const data = reportData.value.map((item, index) => ({
    'No': item.is_new_patient ? getPatientIndex(index) : '',
    'Nama Pasien': item.nm_pasien,
    'No. RM': item.no_rkm_medis,
    'Diagnosa': item.diagnosa,
    'Jenis Ab': item.jenis_ab,
    'Rute': item.rute,
    'LOS (Hari)': item.los,
    'Penggunaan Per Hari': item.penggunaan_harian,
    'Total Pakai': item.total_pakai,
    'Total DDD': item.total_ddd
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Laporan PPRA');
  
  const filename = `Laporan_PPRA_${filters.tgl_start}_${filters.tgl_end}.xlsx`;
  writeFile(workbook, filename);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.ppra-report-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.glass-effect {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.filter-card {
  padding: 20px;
}

.form-label-custom {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.modern-input {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  height: 38px;
  font-size: 13px;
}

.date-input {
  width: 160px;
}

.filter-item {
  flex-shrink: 0;
}

.ppra-table {
  font-size: 13px;
  border-collapse: collapse;
}

.ppra-table th {
  padding: 15px;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  background: #f1f5f9;
  text-transform: uppercase;
  font-size: 11px;
}

.ppra-table td {
  padding: 12px 15px;
  vertical-align: middle;
  border-color: #f1f5f9;
}

.aturan-pakai-cell {
  white-space: pre-line !important;
  line-height: 1.5;
  color: #1e293b;
  font-weight: 500;
}

.new-patient-row {
  border-top: 2px solid #cbd5e1;
}

.badge-rute {
  background: #e0f2fe;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 700;
}

.bg-soft-primary { background: #eff6ff; }

.diagnosa-cell {
  max-width: 200px;
  line-height: 1.4;
  color: #64748b;
}

.editable-cell {
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.editable-cell:hover {
  background: #f1f5f9 !important;
}

.editable-cell:hover .edit-icon {
  opacity: 1 !important;
  color: #3b82f6;
}

.btn {
  height: 38px;
  padding: 0 18px;
  font-weight: 600;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  margin: 20px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info-brief {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

  @media (max-width: 768px) {
  .ppra-report-container { padding: 10px; }
  .filter-card { padding: 15px; }
}

.nav-tabs .nav-link {
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 20px;
  transition: all 0.2s;
}

.nav-tabs .nav-link:hover {
  color: #3b82f6;
  border: none;
}

.nav-tabs .nav-link.active {
  color: #3b82f6;
  background: transparent;
  border-bottom: 2px solid #3b82f6;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
