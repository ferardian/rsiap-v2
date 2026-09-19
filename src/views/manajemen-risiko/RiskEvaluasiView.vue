<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-tasks text-emerald-600"></i> Evaluasi & Rencana Mitigasi Risiko
        </h4>
        <p class="text-slate-500 mb-0 small">
          Tinjauan berkala efektivitas tindakan mitigasi, update status treatment, dan penyesuaian skor risiko residual.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <select v-model="filterStatus" @change="filterData" class="form-select form-select-sm shadow-sm" style="width: 200px;">
          <option value="">Semua Status</option>
          <option value="open">Open (Perlu Tindakan)</option>
          <option value="in_progress">In Progress (Mitigasi Berjalan)</option>
          <option value="monitored">Monitored (Dipantau Berkala)</option>
          <option value="closed">Closed (Terkendali Sepenuhnya)</option>
        </select>
      </div>
    </div>

    <!-- Cards Layout by Treatment Status -->
    <div class="row g-3">
      <div v-if="isLoading" class="col-12 text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fs-3 d-block mb-2 text-primary"></i>
        Memuat data evaluasi...
      </div>
      <div v-else-if="!filteredItems.length" class="col-12 text-center py-5 text-muted">
        <i class="fas fa-check-circle fs-2 text-emerald-400 d-block mb-2"></i>
        Tidak ada data risiko pada status ini.
      </div>

      <div v-for="item in filteredItems" :key="item.id_risiko" class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-3 h-100 treatment-card">
          <div class="card-header bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <span class="badge" :class="getLevelBadgeClass(item.level_awal)">
                Awal: {{ item.level_awal.toUpperCase() }} ({{ item.skor_awal }})
              </span>
              <i class="fas fa-arrow-right text-muted small"></i>
              <span class="badge" :class="getLevelBadgeClass(item.level_sisa)">
                Sisa: {{ item.level_sisa.toUpperCase() }} ({{ item.skor_sisa }})
              </span>
            </div>
            <span class="badge rounded-pill" :class="getStatusBadgeClass(item.status_treatment)">
              {{ formatStatus(item.status_treatment) }}
            </span>
          </div>

          <div class="card-body p-3">
            <div class="text-primary fw-semibold small mb-1">
              <i class="fas fa-hospital me-1"></i> {{ item.departemen?.nama || item.kd_departemen }}
              <span class="text-muted fw-normal"> | {{ item.klasifikasi?.nama_klasifikasi }}</span>
            </div>
            <h6 class="fw-bold text-slate-800 mb-2">{{ item.identifikasi_risiko }}</h6>

            <div class="bg-light p-2.5 rounded mb-3 small">
              <div class="fw-semibold text-slate-700 mb-1"><i class="fas fa-shield-alt me-1 text-primary"></i>Rencana Pengendalian Aktif:</div>
              <div v-if="item.rekom_mitigasi"><strong>Mitigasi:</strong> {{ item.rekom_mitigasi }}</div>
              <div v-if="item.rekom_avoid"><strong>Avoid:</strong> {{ item.rekom_avoid }}</div>
              <div v-if="item.rekom_segregasi"><strong>Segregasi:</strong> {{ item.rekom_segregasi }}</div>
              <div v-if="item.rekom_administrasi"><strong>Administrasi:</strong> {{ item.rekom_administrasi }}</div>
              <div v-if="item.rekom_retensi"><strong>Retensi:</strong> {{ item.rekom_retensi }}</div>
              <div v-if="item.rekom_transfer"><strong>Transfer:</strong> {{ item.rekom_transfer }}</div>
            </div>

            <div class="small mb-3">
              <span class="text-muted">Pemilik Risiko:</span> <strong>{{ item.risk_owner?.nama || '-' }}</strong>
              <span class="text-muted ms-3">Jadwal Tinjau:</span> <strong>{{ item.tgl_tinjauan ? item.tgl_tinjauan.substring(0, 10) : '-' }}</strong>
            </div>

            <div v-if="item.analisa_evaluasi" class="alert alert-info py-2 px-3 small mb-0">
              <strong>Catatan Evaluasi:</strong> {{ item.analisa_evaluasi }}
            </div>
          </div>

          <div class="card-footer bg-white py-2 px-3 border-top d-flex align-items-center justify-content-between">
            <span class="small text-muted" style="font-size: 0.75rem;">
              Update terakhir: {{ item.updated_at ? item.updated_at.substring(0, 10) : '-' }}
            </span>
            <button @click="openQuickUpdate(item)" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-edit me-1"></i> Update Evaluasi & Status
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Update Modal -->
    <div class="modal fade" id="modalQuickUpdate" tabindex="-1" aria-hidden="true" ref="modalQuickRef">
      <div class="modal-dialog">
        <div class="modal-content modal-content-clean">
          <div class="modal-header bg-white border-bottom border-slate-100 py-3 px-4 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="modal-icon-indicator bg-primary-subtle text-primary border border-primary-subtle">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div>
                <h5 class="modal-title fs-6 fw-bold text-slate-800 mb-0">Update Evaluasi & Status Mitigasi</h5>
                <small class="text-muted" style="font-size: 0.72rem;">Monitoring efektivitas penanganan risiko berkala</small>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveQuickUpdate">
            <div class="modal-body p-4 bg-slate-50">
              <div class="card p-3 border border-slate-200 rounded-3 mb-3 bg-white">
                <label class="form-label small fw-semibold text-slate-700 mb-1">Status Penanganan (Treatment)</label>
                <select v-model="quickForm.status_treatment" class="form-select form-select-sm" required>
                  <option value="open">Open (Baru Teridentifikasi)</option>
                  <option value="in_progress">In Progress (Mitigasi Sedang Berjalan)</option>
                  <option value="monitored">Monitored (Terkendali & Terus Dipantau)</option>
                  <option value="closed">Closed (Risiko Selesai / Tereliminasi)</option>
                </select>
              </div>

              <div class="card p-3 border border-slate-200 rounded-3 mb-3 bg-white">
                <div class="row g-3">
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-slate-700 mb-1">Dampak Sisa (D)</label>
                    <select v-model.number="quickForm.dampak_sisa" class="form-select form-select-sm">
                      <option :value="1">1 - Sangat Rendah</option>
                      <option :value="2">2 - Rendah</option>
                      <option :value="3">3 - Sedang</option>
                      <option :value="4">4 - Tinggi</option>
                      <option :value="5">5 - Sangat Tinggi</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-slate-700 mb-1">Probabilitas Sisa (F)</label>
                    <select v-model.number="quickForm.frekuensi_sisa" class="form-select form-select-sm">
                      <option :value="1">1 - Sangat Jarang</option>
                      <option :value="2">2 - Jarang</option>
                      <option :value="3">3 - Mungkin Terjadi</option>
                      <option :value="4">4 - Sering</option>
                      <option :value="5">5 - Sangat Sering</option>
                    </select>
                  </div>
                </div>
                <div class="mt-2 text-muted small" style="font-size: 0.72rem;">
                  Skor Residual Baru: <strong>{{ (quickForm.dampak_sisa || 0) * (quickForm.frekuensi_sisa || 0) }}</strong>
                </div>
              </div>

              <div class="card p-3 border border-slate-200 rounded-3 mb-0 bg-white">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-slate-700 mb-1">Tanggal Tinjauan Berikutnya</label>
                  <input type="date" v-model="quickForm.tgl_tinjauan" class="form-control form-control-sm" />
                </div>

                <div class="mb-0">
                  <label class="form-label small fw-semibold text-slate-700 mb-1">Catatan Analisa & Evaluasi</label>
                  <textarea v-model="quickForm.analisa_evaluasi" rows="3" class="form-control form-control-sm" placeholder="Tuliskan hasil evaluasi berkala, kendala, atau capaian mitigasi..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-white border-top border-slate-100 py-2.5 px-4 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-sm btn-light border border-slate-200 px-3" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-sm btn-primary px-3 shadow-sm" :disabled="isSavingQuick">
                <i class="fas" :class="isSavingQuick ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                <span class="ms-1.5">{{ isSavingQuick ? 'Menyimpan...' : 'Simpan Evaluasi' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import manajemenRisikoService from '../../services/manajemenRisikoService'

const isLoading = ref(false)
const isSavingQuick = ref(false)
const items = ref([])
const filterStatus = ref('')
const modalQuickRef = ref(null)
let bsModalQuick = null
let currentItem = null

const quickForm = ref({
  status_treatment: 'open',
  dampak_sisa: 2,
  frekuensi_sisa: 2,
  tgl_tinjauan: '',
  analisa_evaluasi: ''
})

const filteredItems = computed(() => {
  if (!filterStatus.value) return items.value
  return items.value.filter(i => i.status_treatment === filterStatus.value)
})

const getLevelBadgeClass = (lvl) => {
  const map = {
    ekstrem: 'bg-danger text-white',
    tinggi: 'bg-warning text-dark',
    sedang: 'bg-success text-white',
    rendah: 'bg-info text-white'
  }
  return map[lvl] || 'bg-secondary text-white'
}

const getStatusBadgeClass = (st) => {
  const map = {
    open: 'bg-secondary text-white',
    in_progress: 'bg-primary text-white',
    monitored: 'bg-info text-white',
    closed: 'bg-success text-white'
  }
  return map[st] || 'bg-secondary text-white'
}

const formatStatus = (st) => {
  const map = {
    open: 'Open',
    in_progress: 'In Progress',
    monitored: 'Monitored',
    closed: 'Closed'
  }
  return map[st] || st
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await manajemenRisikoService.getAll()
    if (res.data?.success) {
      items.value = res.data.data || []
    }
  } catch (err) {
    console.error('Failed to load risk evaluations', err)
  } finally {
    isLoading.value = false
  }
}

const filterData = () => {
  // handled by computed filteredItems
}

const openQuickUpdate = (item) => {
  currentItem = item
  quickForm.value = {
    status_treatment: item.status_treatment || 'open',
    dampak_sisa: item.dampak_sisa || 2,
    frekuensi_sisa: item.frekuensi_sisa || 2,
    tgl_tinjauan: item.tgl_tinjauan ? item.tgl_tinjauan.substring(0, 10) : '',
    analisa_evaluasi: item.analisa_evaluasi || ''
  }
  if (bsModalQuick) bsModalQuick.show()
}

const saveQuickUpdate = async () => {
  if (!currentItem) return
  isSavingQuick.value = true
  try {
    await manajemenRisikoService.updateTreatment(currentItem.id_risiko, quickForm.value)
    if (bsModalQuick) bsModalQuick.hide()
    await fetchData()
  } catch (err) {
    alert('Gagal menyimpan evaluasi: ' + (err.response?.data?.message || err.message))
  } finally {
    isSavingQuick.value = false
  }
}

onMounted(async () => {
  if (modalQuickRef.value) {
    bsModalQuick = new Modal(modalQuickRef.value)
  }
  await fetchData()
})
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.treatment-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.treatment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08) !important;
}

.card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  color: #1e293b !important;
  padding: 0.85rem 1.15rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  text-align: left !important;
}

.modal-content-clean {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
}

.modal-icon-indicator {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}
</style>
