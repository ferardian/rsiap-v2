<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg modal-glass">
        <!-- Modal Header -->
        <div class="modal-header bg-gradient-indigo text-white py-2.5 px-3 border-0">
          <h6 class="modal-title fw-bold d-flex align-items-center gap-2 text-white mb-0">
            <div class="icon-head-bg">
              <i class="fas fa-id-card"></i>
            </div>
            <span>Cek Kepesertaan BPJS Kesehatan</span>
          </h6>
          <span class="badge bg-white-20 text-white rounded-pill px-2 py-1 text-xs fw-normal ms-auto me-2">
            <i class="fas fa-circle text-emerald me-1 animate-pulse"></i> VClaim 2.0
          </span>
          <button type="button" class="btn-close btn-close-white shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-3">
          <!-- Search Form -->
          <div class="card shadow-sm border-0 mb-3 search-card">
            <div class="card-body p-2 px-3">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label text-xs fw-bold text-slate-600 mb-1">Cari Berdasarkan</label>
                  <select v-model="searchType" class="form-select form-select-sm custom-input">
                    <option value="nokartu">No. Kartu BPJS</option>
                    <option value="nik">NIK KTP</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-xs fw-bold text-slate-600 mb-1">Nomor {{ searchType === 'nokartu' ? 'Kartu' : 'NIK' }}</label>
                  <input
                    type="text"
                    v-model="searchQuery"
                    :placeholder="searchType === 'nokartu' ? '13 digit No. Kartu...' : '16 digit NIK...'"
                    class="form-control form-control-sm custom-input"
                    @keyup.enter="handleSearch"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label text-xs fw-bold text-slate-600 mb-1">Tgl. SEP / Pelayanan</label>
                  <input
                    type="date"
                    v-model="tglSep"
                    class="form-control form-control-sm custom-input"
                  />
                </div>
                <div class="col-md-2">
                  <button
                    class="btn btn-indigo btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                    :disabled="loading"
                    @click="handleSearch"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="fas fa-search"></i>
                    Cek
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="py-4 text-center">
            <div class="spinner-border text-indigo mb-2" role="status" style="width: 2.2rem; height: 2.2rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-slate-600 small fw-semibold">Menghubungkan ke Server BPJS VClaim...</p>
          </div>

          <!-- Error Alert State -->
          <div v-else-if="errorMessage" class="alert alert-danger shadow-sm border-0 rounded-3 d-flex align-items-center gap-3 p-3 mb-0">
            <i class="fas fa-exclamation-triangle fs-4 text-danger"></i>
            <div>
              <h6 class="fw-bold mb-0 small">Pemeriksaan Kepesertaan Gagal</h6>
              <p class="mb-0 text-xs text-secondary">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Result Content -->
          <div v-else-if="peserta" class="fade-in">
            <!-- Header Result Card -->
            <div class="card border-0 shadow-sm rounded-3 overflow-hidden mb-3" :class="isAktif ? 'bg-emerald-gradient' : 'bg-rose-gradient'">
              <div class="card-body p-3 text-white">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <span class="badge bg-glass-pill text-white fw-semibold mb-1 px-2.5 py-1 rounded-pill" style="font-size: 0.7rem;">
                      <i class="fas fa-user-tag me-1 text-amber"></i> {{ peserta.jenisPeserta?.keterangan || 'Peserta BPJS' }}
                    </span>
                    <h5 class="fw-extrabold mb-1 text-white letter-spacing-tight">{{ peserta.nama }}</h5>
                    <div class="d-flex gap-2.5 text-white-80 text-xs flex-wrap mt-2">
                      <span class="badge-glass-item"><i class="fas fa-credit-card me-1 opacity-75"></i> Kartu: <strong>{{ peserta.noKartu }}</strong></span>
                      <span class="badge-glass-item"><i class="fas fa-id-card me-1 opacity-75"></i> NIK: <strong>{{ peserta.nik }}</strong></span>
                      <span class="badge-glass-item"><i class="fas fa-hospital-user me-1 opacity-75"></i> RM: <strong>{{ peserta.mr?.noMR || '-' }}</strong></span>
                    </div>
                  </div>

                  <!-- Status Badge Pill -->
                  <div class="text-end">
                    <div :class="['badge-status-pill', isAktif ? 'pill-aktif' : 'pill-nonaktif']">
                      <i :class="isAktif ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1" style="font-size: 0.75rem;"></i>
                      {{ peserta.statusPeserta?.keterangan?.toUpperCase() || 'STATUS UNKNOWN' }}
                    </div>
                    <small class="d-block text-white-75 mt-1" style="font-size: 0.65rem;">
                      TMT: {{ formatDate(peserta.tglTMT) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kelas Rawat Compatibility Banner -->
            <div class="card border-0 shadow-sm rounded-3 mb-3 overflow-hidden banner-compat" :class="kelasCheck.bgClass">
              <div class="card-body p-2 px-3 d-flex align-items-center gap-3">
                <div class="icon-circle shadow-sm" :class="kelasCheck.iconBgClass">
                  <i :class="kelasCheck.icon" class="fs-5"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 class="fw-bold mb-0 text-sm" :class="kelasCheck.textClass">{{ kelasCheck.title }}</h6>
                    <span class="badge rounded-pill fw-bold" :class="kelasCheck.badgeClass" style="font-size: 0.7rem;">
                      {{ kelasCheck.badgeText }}
                    </span>
                  </div>
                  <p class="mb-0 text-xs text-secondary mt-1">{{ kelasCheck.description }}</p>
                </div>
              </div>
            </div>

            <!-- Grid Details -->
            <div class="row g-2">
              <!-- Hak Kelas BPJS -->
              <div class="col-md-6">
                <div class="detail-box box-indigo p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-layer-group text-indigo me-1"></i> Hak Kelas BPJS
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ peserta.hakKelas?.keterangan || '-' }}
                    <span class="badge bg-indigo-subtle text-indigo border border-indigo-subtle ms-2" style="font-size: 0.7rem;">
                      Kode: {{ peserta.hakKelas?.kode || '-' }}
                    </span>
                  </div>
                  <div class="text-xs text-muted mt-0.5">Sesuai data kepesertaan terdaftar BPJS</div>
                </div>
              </div>

              <!-- Kelas SEP / SIMRS (If Provided) -->
              <div class="col-md-6">
                <div class="detail-box box-cyan p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-procedures text-cyan me-1"></i> Kelas Rawat di SEP / SIMRS
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ sepKlsText }}
                  </div>
                  <div class="text-xs text-muted mt-0.5">Kelas yang diinputkan untuk pelayanan ini</div>
                </div>
              </div>

              <!-- Faskes 1 -->
              <div class="col-md-6">
                <div class="detail-box box-emerald p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-clinic-medical text-emerald me-1"></i> Faskes Tingkat 1 (FKTP)
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ peserta.provUmum?.nmProvider || '-' }}
                  </div>
                  <div class="text-xs text-muted mt-0.5">
                    Kode Faskes: {{ peserta.provUmum?.kdProvider || '-' }}
                  </div>
                </div>
              </div>

              <!-- Jenis & Pemberi Kerja -->
              <div class="col-md-6">
                <div class="detail-box box-amber p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-building text-amber me-1"></i> Instansi / Pemberi Kerja
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ peserta.pemberiKerja?.keterangan || 'Tidak Ada / Mandiri' }}
                  </div>
                  <div class="text-xs text-muted mt-0.5">
                    Jenis: {{ peserta.jenisPeserta?.keterangan || '-' }}
                  </div>
                </div>
              </div>

              <!-- Demografi & Umur -->
              <div class="col-md-6">
                <div class="detail-box box-sky p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-user-clock text-sky me-1"></i> Tgl Lahir & Umur
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ formatDate(peserta.tglLahir) }} ({{ peserta.sex === 'L' ? 'Laki-laki' : 'Perempuan' }})
                  </div>
                  <div class="text-xs text-muted mt-0.5">
                    {{ peserta.umur?.umurSaatPelayanan || peserta.umur?.umurSekarang || '-' }}
                  </div>
                </div>
              </div>

              <!-- Informasi Tambahan / COB -->
              <div class="col-md-6">
                <div class="detail-box box-rose p-2 px-3 rounded-3 bg-white shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-shield-alt text-rose me-1"></i> COB & Kontak
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    COB: {{ peserta.cob?.nmAsuransi ? peserta.cob.nmAsuransi : 'Tidak Ada' }}
                  </div>
                  <div class="text-xs text-muted mt-0.5">
                    No. Telp: {{ peserta.mr?.noTelepon || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-light-subtle border-0 py-2 px-3 justify-content-end">
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-semibold" @click="close">
            <i class="fas fa-times me-1"></i> Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bpjsVclaimService from '@/services/bpjsVclaimService'

const props = defineProps({
  noKartu: {
    type: String,
    default: ''
  },
  nik: {
    type: String,
    default: ''
  },
  tglSepDate: {
    type: String,
    default: ''
  },
  sepKlsRawat: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const searchType = ref(props.noKartu ? 'nokartu' : (props.nik ? 'nik' : 'nokartu'))
const searchQuery = ref(props.noKartu || props.nik || '')
const tglSep = ref(props.tglSepDate || new Date().toISOString().slice(0, 10))

const loading = ref(false)
const peserta = ref(null)
const errorMessage = ref('')

const isAktif = computed(() => {
  if (!peserta.value || !peserta.value.statusPeserta) return false
  const ket = (peserta.value.statusPeserta.keterangan || '').toUpperCase()
  return ket === 'AKTIF' || peserta.value.statusPeserta.kode === '0'
})

const sepKlsText = computed(() => {
  if (!props.sepKlsRawat) return 'Tidak Terikat Data SEP'
  if (props.sepKlsRawat === '1') return 'Kelas 1'
  if (props.sepKlsRawat === '2') return 'Kelas 2'
  if (props.sepKlsRawat === '3') return 'Kelas 3'
  return `Kelas ${props.sepKlsRawat}`
})

const kelasCheck = computed(() => {
  if (!peserta.value) {
    return {
      title: 'Pemeriksaan Kelas Rawat',
      badgeText: 'MEMUAT',
      badgeClass: 'bg-secondary',
      bgClass: 'bg-light border-secondary-subtle',
      textClass: 'text-dark',
      icon: 'fas fa-info-circle',
      iconBgClass: 'bg-white text-secondary',
      description: 'Sedang memeriksa data kepesertaan...'
    }
  }

  const hakKode = peserta.value.hakKelas?.kode || ''
  const hakKet = peserta.value.hakKelas?.keterangan || `Kelas ${hakKode}`
  const sepKode = props.sepKlsRawat || ''

  if (!sepKode) {
    return {
      title: `Hak Kelas Rawat BPJS: ${hakKet}`,
      badgeText: 'HAK KELAS',
      badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
      bgClass: 'bg-blue-subtle border-blue-subtle',
      textClass: 'text-primary',
      icon: 'fas fa-id-badge',
      iconBgClass: 'bg-white text-primary',
      description: `Pasien terdaftar secara resmi di BPJS dengan Hak Kelas Rawat: ${hakKet}.`
    }
  }

  if (hakKode === sepKode) {
    return {
      title: 'Kelas Rawat Sesuai (Match)',
      badgeText: 'SESUAI ✅',
      badgeClass: 'bg-success text-white shadow-sm',
      bgClass: 'bg-success-subtle border-success-subtle',
      textClass: 'text-success-emphasis',
      icon: 'fas fa-check-circle',
      iconBgClass: 'bg-success text-white',
      description: `Kelas rawat di SEP (Kelas ${sepKode}) SUDAH SESUAI dengan Hak Kelas Kepesertaan BPJS (${hakKet}).`
    }
  }

  const hakNum = parseInt(hakKode) || 0
  const sepNum = parseInt(sepKode) || 0

  if (sepNum < hakNum && sepNum > 0) {
    // Note: In BPJS, Class 1 is higher than Class 3. Lower number = higher class.
    return {
      title: 'Pasien Naik Kelas Rawat',
      badgeText: 'NAIK KELAS ⚠️',
      badgeClass: 'bg-warning text-dark shadow-sm',
      bgClass: 'bg-warning-subtle border-warning-subtle',
      textClass: 'text-warning-emphasis',
      icon: 'fas fa-arrow-alt-circle-up',
      iconBgClass: 'bg-warning text-dark',
      description: `Hak kelas BPJS pasien adalah ${hakKet}, namun SEP diinputkan ke Kelas ${sepKode} (Naik Kelas). Pastikan selisih biaya / pembiayaan sudah sesuai!`
    }
  }

  return {
    title: 'Perbedaan Kelas Rawat Detected',
    badgeText: 'BEDA KELAS ❌',
    badgeClass: 'bg-danger text-white shadow-sm',
    bgClass: 'bg-danger-subtle border-danger-subtle',
    textClass: 'text-danger-emphasis',
    icon: 'fas fa-exclamation-circle',
    iconBgClass: 'bg-danger text-white',
    description: `Hak kelas BPJS pasien adalah ${hakKet}, namun di SEP tertera Kelas ${sepKode}. Silakan periksa kembali kesesuaian data pasien.`
  }
})

const handleSearch = async () => {
  if (!searchQuery.value) {
    errorMessage.value = 'Silakan masukkan Nomor Kartu BPJS atau NIK terlebih dahulu.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  peserta.value = null

  try {
    let res
    if (searchType.value === 'nokartu') {
      res = await bpjsVclaimService.getPesertaByNoKartu(searchQuery.value, tglSep.value)
    } else {
      res = await bpjsVclaimService.getPesertaByNik(searchQuery.value, tglSep.value)
    }

    if (res.data?.metaData?.code === '200' && res.data?.response?.peserta) {
      peserta.value = res.data.response.peserta
    } else {
      errorMessage.value = res.data?.metaData?.message || 'Data kepesertaan BPJS tidak ditemukan.'
    }
  } catch (err) {
    console.error('Error fetching BPJS participant:', err)
    errorMessage.value = err.response?.data?.metaData?.message || err.message || 'Terjadi kesalahan saat koneksi ke VClaim BPJS.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (_) {
    return dateStr
  }
}

const close = () => emit('close')

onMounted(() => {
  if (searchQuery.value) {
    handleSearch()
  }
})
</script>

<style scoped>
.modal-glass {
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.bg-gradient-indigo {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
}

.icon-head-bg {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.bg-white-20 {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

.text-emerald { color: #34d399 !important; }
.text-indigo { color: #4f46e5 !important; }
.text-cyan { color: #0891b2 !important; }
.text-amber { color: #f59e0b !important; }
.text-sky { color: #0284c7 !important; }
.text-rose { color: #f43f5e !important; }

.search-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.75rem;
}

.custom-input {
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
}

.custom-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn-indigo {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-indigo:hover {
  background: linear-gradient(135deg, #4338ca 0%, #312e81 100%);
  color: white;
  transform: translateY(-1px);
}

.bg-emerald-gradient {
  background: linear-gradient(135deg, #059669 0%, #10b981 60%, #0d9488 100%);
}

.bg-rose-gradient {
  background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
}

.bg-glass-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.badge-glass-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  padding: 0.2rem 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.pill-aktif {
  background: #ffffff;
  color: #047857;
}

.pill-nonaktif {
  background: #ffffff;
  color: #b91c1c;
}

.banner-compat {
  transition: all 0.2s ease;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-box {
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.detail-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.08) !important;
}

.box-indigo { border-left: 4px solid #4f46e5 !important; }
.box-cyan { border-left: 4px solid #0891b2 !important; }
.box-emerald { border-left: 4px solid #10b981 !important; }
.box-amber { border-left: 4px solid #f59e0b !important; }
.box-sky { border-left: 4px solid #0284c7 !important; }
.box-rose { border-left: 4px solid #f43f5e !important; }

.bg-indigo-subtle { background-color: #e0e7ff; }
.border-indigo-subtle { border-color: #c7d2fe !important; }

.fade-in {
  animation: fadeIn 0.25s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
