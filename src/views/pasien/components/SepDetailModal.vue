<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg ripple-border">
        <div class="modal-header bg-light py-3 border-0">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i class="fas fa-file-medical text-primary"></i>
            Detail SEP: {{ sepData.no_sep }}
          </h5>
          <button type="button" class="btn-close shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-4 bg-white" v-if="sepData">
          <div class="row g-4">
            <!-- Left Column: Patient & Main SEP Info -->
            <div class="col-lg-4">
              <div class="patient-card p-4 rounded-4 mb-4 text-center anim-in">
                <div class="avatar-bg mx-auto mb-3">
                  <i class="fas fa-user-injured fa-3x"></i>
                </div>
                <h4 class="fw-bold mb-1">{{ sepData.nama_pasien }}</h4>
                <div class="text-muted small mb-3">RM: {{ sepData.nomr }}</div>
                <div class="d-flex justify-content-center gap-2">
                   <span :class="['badge-status', sepData.jkel === 'L' ? 'male' : 'female']">
                    {{ sepData.jkel === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </span>
                  <span class="badge-status-generic">{{ formatDate(sepData.tanggal_lahir) }}</span>
                </div>
              </div>

              <div class="info-group">
                <h6 class="group-title">Identitas BPJS</h6>
                <div class="info-row">
                  <span class="label">No. Kartu</span>
                  <span class="value">{{ sepData.no_kartu }}</span>
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

              <div class="info-group mt-4">
                <h6 class="group-title">Status Pelayanan</h6>
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
              <div class="nav-tabs-premium mb-4">
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
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Tanggal SEP</label>
                      <p>{{ formatLongDate(sepData.tglsep) }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>No. Rujukan</label>
                      <p>{{ sepData.no_rujukan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Tanggal Rujukan</label>
                      <p>{{ formatDate(sepData.tglrujukan) }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Asal Rujukan</label>
                      <p>{{ sepData.asal_rujukan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item">
                      <label>PPK Rujukan</label>
                      <p>{{ sepData.nmppkrujukan }} ({{ sepData.kdppkrujukan }})</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Content: Pelayanan -->
              <div v-show="activeTab === 'service'" class="fade-in">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Poli Tujuan</label>
                      <p>{{ sepData.nmpolitujuan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>DPJP Pelayanan</label>
                      <p>{{ sepData.nmdpjplayanan || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Poli Eksekutif</label>
                      <p>{{ sepData.eksekutif }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>DPJP (SKDP)</label>
                      <p>{{ sepData.nmdpdjp || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>No. SKDP</label>
                      <p>{{ sepData.noskdp || '-' }}</p>
                    </div>
                  </div>
                   <div class="col-md-6">
                    <div class="data-item">
                      <label>COB</label>
                      <p>{{ sepData.cob }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item bg-light p-3 rounded-3">
                      <label>Diagnosa Awal</label>
                      <p class="mb-0 fw-bold">{{ sepData.diagawal }} - {{ sepData.nmdiagnosaawal }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Content: Tambahan -->
              <div v-show="activeTab === 'more'" class="fade-in">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Laka Lantas</label>
                      <p>{{ sepData.lakalantas == '0' ? 'Bukan Kecelakaan' : 'Kecelakaan' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="data-item">
                      <label>Katarak</label>
                      <p>{{ sepData.katarak }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                     <div class="data-item">
                      <label>Alamat (Wilayah)</label>
                      <p>{{ sepData.nmkec }}, {{ sepData.nmkab }}, {{ sepData.nmprop }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="data-item">
                      <label>Catatan</label>
                      <p class="text-italic italic">{{ sepData.catatan || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-3">
          <button type="button" class="btn btn-secondary rounded-pill px-4" @click="close">Tutup</button>
          <button type="button" class="btn btn-primary rounded-pill px-4 shadow-sm" @click="handlePrint">
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
.modal-xl { max-width: 1000px; }

.modal-content { border-radius: 1.5rem; overflow: hidden; }

/* Patient Card */
.patient-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
}

.avatar-bg {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.badge-status {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-status.male { background: #dcfce7; color: #166534; }
.badge-status.female { background: #fce7f3; color: #9d174d; }
.badge-status-generic { 
  background: white; 
  color: #64748b; 
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.7rem;
}

/* Info Group */
.group-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.info-row .label { color: #64748b; }
.info-row .value { color: #1e293b; font-weight: 600; text-align: right; }

/* Tabs */
.nav-tabs-premium {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.4rem;
  border-radius: 1rem;
}

.tab-btn {
  flex: 1;
  padding: 0.6rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Data Item */
.data-item label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.data-item p {
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 0;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 992px) {
  .border-start-lg { border-left: 1px solid #f1f5f9 !important; }
}

@media (max-width: 991px) {
  .modal-dialog { margin: 10px; }
}
</style>
