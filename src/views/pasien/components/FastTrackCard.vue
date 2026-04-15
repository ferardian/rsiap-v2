<template>
  <div v-if="data" class="fast-track-wrapper mt-3 animate__animated animate__fadeInUp">
    <div class="card fast-track-card border-0 shadow-lg overflow-hidden" :class="{ 'mjkn-mode': data.existing_reg, 'batal-mode': data.existing_reg?.stts === 'Batal' }">
      <div class="card-body p-0">
        <!-- Warning Banner for 'Batal' -->
        <div v-if="data.existing_reg?.stts === 'Batal'" class="warning-banner bg-warning px-4 py-2 d-flex align-items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i>
          <span class="fw-bold small">PERHATIAN: Registrasi MJKN ini berstatus BATAL. Klik tombol di bawah untuk mengaktifkan kembali.</span>
        </div>

        <div class="row g-0">
          <!-- Side Indicator -->
          <div class="col-auto fast-track-accent"></div>
          
          <div class="col p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <div class="icon-circle text-primary me-3 shadow-sm" :class="getIconCircleClass">
                  <i class="fas" :class="getIconClass"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold">{{ getTitleText }}</h5>
                  <p class="text-muted small mb-0">
                    {{ getSubtitleText }}
                  </p>
                </div>
              </div>
              <div class="badge-status" :class="getBadgeClass">
                {{ getBadgeText }}
              </div>
            </div>

            <div class="info-grid mb-4">
              <div class="info-item">
                <label>Poliklinik Tujuan</label>
                <div class="value fw-semibold text-dark">{{ data.poli?.nm_poli || '-' }}</div>
              </div>
              <div class="info-item">
                <label>Dokter Tujuan</label>
                <!-- Doctor Selection Dropdown -->
                <div v-if="data.available_doctors?.length > 1" class="dropdown mt-1">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle py-1 px-2 border-0 bg-light" type="button" data-bs-toggle="dropdown">
                    {{ selectedDoctor?.nm_dokter || 'Pilih Dokter' }}
                  </button>
                  <ul class="dropdown-menu shadow border-0">
                    <li v-for="doc in data.available_doctors" :key="doc.kd_dokter">
                      <a class="dropdown-item small py-2" href="#" @click.prevent="selectedDoctor = doc">
                        {{ doc.nm_dokter }}
                      </a>
                    </li>
                  </ul>
                </div>
                <div v-else class="value fw-semibold text-dark">{{ data.dokter?.nm_dokter || '-' }}</div>
              </div>
              <div class="info-item">
                <label>{{ data.existing_reg ? 'Nomor Rawat' : 'Nomor Rujukan/Surat' }}</label>
                <div class="value font-monospace">{{ data.existing_reg ? data.existing_reg.no_rawat : (data.rujukan?.noKunjungan || data.surat_kontrol?.no_surat || '-') }}</div>
              </div>
              <div class="info-item">
                <label>{{ data.existing_reg ? 'Nomor Antrean' : 'Tanggal Rujukan/Kontrol' }}</label>
                <div class="value text-dark fw-bold">
                  {{ data.existing_reg ? data.existing_reg.no_reg : formatDate(data.rujukan?.tglKunjungan || data.surat_kontrol?.tgl_surat) }}
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between border-top pt-3">
              <div class="d-flex flex-wrap gap-3 align-items-center">
                <!-- Hardware Triggers -->
                <div v-if="needsVerification" class="btn-group hardware-group shadow-sm">
                  <button 
                    @click="triggerHardware('fingerprint')"
                    class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3"
                    title="Focus Sidik Jari"
                  >
                    <i class="fas fa-fingerprint"></i>
                    <span class="d-none d-sm-inline">Sidik Jari</span>
                  </button>
                  <button 
                    @click="triggerHardware('frista')"
                    class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3"
                    title="Focus Frista"
                  >
                    <i class="fas fa-desktop"></i>
                    <span class="d-none d-sm-inline">Frista</span>
                  </button>
                </div>

                <div class="form-check form-switch custom-switch" :class="{ 'ms-2': needsVerification }">
                  <input class="form-check-input" type="checkbox" id="bypassBpjs" v-model="internalIgnoreError">
                  <label class="form-check-label small text-muted ms-2" for="bypassBpjs">
                    Bypass error BPJS
                  </label>
                </div>
                
                <button 
                  @click="handleProcess" 
                  class="btn d-flex align-items-center px-4 py-2 border-0 shadow-sm fast-track-btn"
                  :class="getButtonClass"
                  :disabled="loading || !data.poli || !selectedDoctor"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-check-double me-2"></i>
                  {{ getButtonText }}
                </button>
              </div>

              <div class="text-end" v-if="!data.poli || !selectedDoctor">
                <small class="text-danger d-block">Mapping Poli/Dokter RS tidak ditemukan.</small>
                <small class="text-muted small">Gunakan form manual di bawah.</small>
              </div>
              <div class="text-end" v-else>
                <small class="text-muted d-block">{{ getFootnoteText }}</small>
                <small class="text-muted small">Ingin ubah? Isi form manual di bawah.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  ignoreError: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['process', 'update:ignoreError']);

const internalIgnoreError = ref(props.ignoreError);
const selectedDoctor = ref(null);

watch(() => props.data, (newData) => {
  if (newData) {
    selectedDoctor.value = newData.dokter;
  }
}, { immediate: true });

watch(internalIgnoreError, (val) => {
  emit('update:ignoreError', val);
});

const triggerHardware = async (type) => {
  try {
    const noPeserta = props.data.pasien?.no_peserta || props.data.pasien?.no_bpjs || '';
    await axios.post('http://localhost:3000/hardware/focus', {
      appType: type,
      noPeserta: noPeserta
    });
  } catch (err) {
    console.error('RSIA Bridge Error:', err);
    alert('Gagal terhubung ke RSIA Bridge. Pastikan aplikasi bridge sudah jalan di port 3000.');
  }
};

const handleProcess = () => {
  emit('process', {
    ...props.data,
    dokter: selectedDoctor.value
  });
};

const getTitleText = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'Pemulihan Registrasi MJKN';
  if (props.data.existing_reg) return 'Check-in Mobile JKN BPJS';
  return 'Fast Track BPJS Tersedia';
});

const getSubtitleText = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'Pendaftaran yang dibatalkan terdeteksi';
  if (props.data.existing_reg) return 'Data reservasi poli telah tersedia di sistem';
  return 'Rujukan/Kontrol valid ditemukan untuk hari ini';
});

const getBadgeText = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'BATAL (RECOVERY)';
  if (props.data.existing_reg) return 'REGISTRASI AKTIF (MJKN)';
  return props.data.rujukan ? 'RUJUKAN AKTIF' : 'SURAT KONTROL';
});

const getBadgeClass = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'bg-warning-subtle text-warning border-warning';
  if (props.data.existing_reg) return 'bg-purple-subtle text-purple border-purple';
  return props.data.rujukan ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success';
});

const getButtonText = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'Aktifkan & Terbitkan SEP';
  if (props.data.existing_reg) return 'Konfirmasi & Terbitkan SEP';
  return 'Daftarkan & Sync BPJS';
});

const getButtonClass = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'btn-warning text-dark';
  if (props.data.existing_reg) return 'btn-purple';
  return 'btn-primary';
});

const getIconCircleClass = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'bg-warning-subtle text-warning';
  if (props.data.existing_reg) return 'bg-purple-subtle text-purple';
  return 'bg-primary-subtle';
});

const getIconClass = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'fa-undo-alt';
  if (props.data.existing_reg) return 'fa-mobile-alt';
  return 'fa-bolt';
});

const getFootnoteText = computed(() => {
  if (props.data.existing_reg?.stts === 'Batal') return 'Aktifkan kembali untuk memakai no.rawat MJKN.';
  if (props.data.existing_reg) return 'Pendaftaran sudah ada dari MJKN.';
  return 'Poli & Dokter dipilih otomatis.';
});

const needsVerification = computed(() => {
  const poliName = props.data.poli?.nm_poli?.toUpperCase() || '';
  return !poliName.includes('ANAK');
});

const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMMM YYYY');
};
</script>

<style scoped>
.fast-track-wrapper {
  max-width: 100%;
}

.fast-track-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mjkn-mode {
  border: 1px solid rgba(155, 89, 182, 0.3);
}

.batal-mode {
  border: 1px solid rgba(243, 156, 18, 0.4);
}

.fast-track-accent {
  width: 8px;
  background: linear-gradient(180deg, #3498db, #2ecc71);
}

.mjkn-mode .fast-track-accent {
  background: linear-gradient(180deg, #9b59b2, #8e44ad);
}

.batal-mode .fast-track-accent {
  background: linear-gradient(180deg, #f1c40f, #e67e22);
}

.warning-banner {
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  color: #856404;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-purple-subtle { background-color: rgba(155, 89, 182, 0.1); }
.text-purple { color: #8e44ad; }
.border-purple { border: 1px solid rgba(155, 89, 182, 0.2); }

.bg-warning-subtle { background-color: rgba(243, 156, 18, 0.1); }
.text-warning { color: #e67e22; }
.border-warning { border: 1px solid rgba(243, 156, 18, 0.2); }
.btn-warning { background: linear-gradient(135deg, #f1c40f, #f39c12); border: none; }

.badge-status {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: rgba(0, 0, 0, 0.02);
  padding: 15px;
  border-radius: 15px;
}

.info-item label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #7f8c8d;
  margin-bottom: 4px;
  font-weight: 600;
}

.info-item .value {
  font-size: 0.95rem;
}

.fast-track-btn {
  border-radius: 12px;
  transition: all 0.3s ease;
  color: white;
  font-weight: 600;
}

.btn-primary { background: linear-gradient(135deg, #3498db, #2980b9); }
.btn-purple { background: linear-gradient(135deg, #9b59b2, #8e44ad); }

.fast-track-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.custom-switch .form-check-input {
  cursor: pointer;
  width: 3rem;
  height: 1.5rem;
}

.hardware-group {
  border-radius: 10px;
  overflow: hidden;
}

.hardware-group .btn {
  border: 1px solid #dee2e6;
  background: white;
  color: #6c757d;
  transition: all 0.2s;
}

.hardware-group .btn:hover {
  background: #f8fafc;
  color: #3498db;
  border-color: #3498db;
  z-index: 2;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
