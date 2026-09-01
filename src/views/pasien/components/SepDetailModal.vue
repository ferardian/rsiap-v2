<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg modal-glass">
        <div class="modal-header bg-light py-2 px-3 border-0">
          <h6 class="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
            <i class="fas fa-file-medical text-primary"></i>
            Detail SEP: {{ sepData.no_sep }}
          </h6>
          <button type="button" class="btn-close shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-3 bg-white" v-if="sepData">
          <div class="row g-3">
            <!-- Left Column: Patient & Main SEP Info -->
            <div class="col-lg-4">
              <div class="patient-card p-3 rounded-3 mb-3 text-center">
                <div class="avatar-bg mx-auto mb-2">
                  <i class="fas fa-user-injured fs-4"></i>
                </div>
                <h6 class="fw-bold mb-0 text-dark">{{ sepData.nama_pasien }}</h6>
                <div class="text-muted text-xs mb-2">RM: {{ sepData.nomr }}</div>
                <div class="d-flex justify-content-center gap-1">
                   <span :class="['badge-status', sepData.jkel === 'L' ? 'male' : 'female']">
                    {{ sepData.jkel === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </span>
                  <span class="badge-status-generic">{{ formatDate(sepData.tanggal_lahir) }}</span>
                </div>
              </div>

              <div class="info-group">
                <h6 class="group-title mb-2">Identitas BPJS</h6>
                <div class="info-row">
                  <span class="label">No. Kartu</span>
                  <span class="value">{{ sepData.no_kartu }}</span>
                </div>
                <div class="info-row">
                  <span class="label">No. KTP</span>
                  <span class="value">{{ sepData.pasien?.no_ktp || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Jenis Peserta</span>
                  <span class="value">{{ sepData.peserta || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">No. Telepon</span>
                  <span class="value">{{ sepData.notelep || '-' }}</span>
                </div>
              </div>

              <div class="info-group mt-3">
                <h6 class="group-title mb-2">Status Pelayanan</h6>
                <div class="info-row">
                  <span class="label">Jenis Pelayanan</span>
                  <span class="value">{{ sepData.jnspelayanan == '1' ? 'Rawat Inap' : 'Rawat Jalan' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Kelas Rawat</span>
                  <span class="value">Kelas {{ sepData.klsrawat }}</span>
                </div>
                <div class="info-row" v-if="sepData.klsnaik">
                  <span class="label">Naik Kelas</span>
                  <span class="value">Kelas {{ sepData.klsnaik }}</span>
                </div>
              </div>
            </div>

            <!-- Right Column: Tabs for Categories -->
            <div class="col-lg-8 border-start-lg">
              <div class="nav-tabs-premium mb-3">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="['tab-btn', { active: activeTab === tab.id }]"
                >
                  <i :class="tab.icon"></i> {{ tab.label }}
                </button>
              </div>

              <!-- Tab Content: Data SEP -->
              <div v-show="activeTab === 'sep'" class="fade-in">
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Tanggal SEP</label>
                      <p class="text-sm fw-semibold">{{ formatLongDate(sepData.tglsep) }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>No. Rujukan</label>
                      <p class="text-sm fw-semibold">{{ sepData.no_rujukan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Tanggal Rujukan</label>
                      <p class="text-sm fw-semibold">{{ formatDate(sepData.tglrujukan) }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Asal Rujukan</label>
                      <p class="text-sm fw-semibold">{{ sepData.asal_rujukan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>PPK Rujukan</label>
                      <p class="text-sm fw-semibold">{{ sepData.nmppkrujukan }} ({{ sepData.kdppkrujukan }})</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Content: Pelayanan -->
              <div v-show="activeTab === 'service'" class="fade-in">
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Poli Tujuan</label>
                      <p class="text-sm fw-semibold">{{ sepData.nmpolitujuan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>DPJP Pelayanan</label>
                      <p class="text-sm fw-semibold">{{ sepData.nmdpjplayanan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Poli Eksekutif</label>
                      <p class="text-sm fw-semibold">{{ sepData.eksekutif }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>DPJP (SKDP)</label>
                      <p class="text-sm fw-semibold">{{ sepData.nmdpdjp || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>No. SKDP</label>
                      <p class="text-sm fw-semibold">{{ sepData.noskdp || '-' }}</p>
                    </div>
                  </div>
                   <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>COB</label>
                      <p class="text-sm fw-semibold">{{ sepData.cob }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item bg-light p-2.5 rounded-3">
                      <label>Diagnosa Awal</label>
                      <p class="mb-0 fw-bold text-sm text-dark">{{ sepData.diagawal }} - {{ sepData.nmdiagnosaawal }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Content: Tambahan -->
              <div v-show="activeTab === 'more'" class="fade-in">
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Laka Lantas</label>
                      <p class="text-sm fw-semibold">{{ sepData.lakalantas == '0' ? 'Bukan Kecelakaan' : 'Kecelakaan' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Katarak</label>
                      <p class="text-sm fw-semibold">{{ sepData.katarak }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                     <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Alamat (Wilayah)</label>
                      <p class="text-sm fw-semibold">{{ sepData.nmkec }}, {{ sepData.nmkab }}, {{ sepData.nmprop }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item p-2 rounded-2 bg-light-subtle">
                      <label>Catatan</label>
                      <p class="text-italic italic text-sm">{{ sepData.catatan || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-2 px-3">
          <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" @click="close">Tutup</button>
          <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" @click="handlePrint">
            <i class="fas fa-print me-1"></i> Cetak SEP
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  sepData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const activeTab = ref('sep')
const tabs = [
  { id: 'sep', label: 'Data SEP', icon: 'fas fa-id-card' },
  { id: 'service', label: 'Pelayanan', icon: 'fas fa-stethoscope' },
  { id: 'more', label: 'Tambahan', icon: 'fas fa-info-circle' }
]

const close = () => emit('close')

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00') return '-'
  return new Date(dateString).toLocaleDateString('id-ID')
}

const formatLongDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handlePrint = () => {
  const url = `${import.meta.env.VITE_API_URL}/sep/${props.sepData.no_sep}/print`
  window.open(url, '_blank')
}
</script>

<style scoped>
.modal-lg { max-width: 850px; }

.modal-glass { border-radius: 1.25rem; overflow: hidden; }

/* Patient Card */
.patient-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
}

.avatar-bg {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.15);
}

.badge-status {
  padding: 0.15rem 0.5rem;
  border-radius: 2rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-status.male { background: #dcfce7; color: #166534; }
.badge-status.female { background: #fce7f3; color: #9d174d; }
.badge-status-generic { 
  background: white; 
  color: #64748b; 
  border: 1px solid #e2e8f0;
  padding: 0.15rem 0.5rem;
  border-radius: 2rem;
  font-size: 0.65rem;
}

/* Info Group */
.group-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
}

.info-row .label { color: #64748b; }
.info-row .value { color: #1e293b; font-weight: 600; text-align: right; }

/* Tabs */
.nav-tabs-premium {
  display: flex;
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 0.75rem;
}

.tab-btn {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.78rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Data Item */
.data-item label {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.15rem;
}

.data-item p {
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 0;
}

.fade-in {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 992px) {
  .border-start-lg { border-left: 1px solid #f1f5f9 !important; }
}

@media (max-width: 991px) {
  .modal-dialog { margin: 10px; }
}
</style>
