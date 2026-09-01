<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg modal-white">
        <!-- Modal Header -->
        <div class="modal-header bg-white py-2.5 px-3 border-bottom">
          <h6 class="modal-title fw-bold d-flex align-items-center gap-2 text-slate-800 mb-0">
            <div class="icon-head-bg">
              <i class="fas fa-id-card text-primary"></i>
            </div>
            <span>Cek Kepesertaan BPJS Kesehatan</span>
          </h6>
          <span class="badge bg-slate-100 text-slate-600 rounded-pill px-2.5 py-1 text-xs fw-medium ms-auto me-2 border">
            <i class="fas fa-circle text-success me-1 animate-pulse" style="font-size: 0.55rem;"></i> VClaim 2.0
          </span>
          <button type="button" class="btn-close shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-3 bg-slate-50">
          <!-- Search Form -->
          <div class="card shadow-xs border mb-3 bg-white rounded-3">
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
                    class="btn btn-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1 shadow-xs"
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
            <div class="spinner-border text-primary mb-2" role="status" style="width: 2.2rem; height: 2.2rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-slate-600 small fw-semibold">Menghubungkan ke Server BPJS VClaim...</p>
          </div>

          <!-- Error Alert State -->
          <div v-else-if="errorMessage" class="alert alert-danger shadow-xs border border-danger-subtle rounded-3 d-flex align-items-center gap-3 p-3 mb-0">
            <i class="fas fa-exclamation-triangle fs-4 text-danger"></i>
            <div>
              <h6 class="fw-bold mb-0 small">Pemeriksaan Kepesertaan Gagal</h6>
              <p class="mb-0 text-xs text-secondary">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Result Content -->
          <div v-else-if="peserta" class="fade-in">
            <!-- Header Result Card (Clean White Tone) -->
            <div class="card border shadow-xs rounded-3 overflow-hidden mb-3 bg-white">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold mb-1 px-2.5 py-1 rounded-pill" style="font-size: 0.7rem;">
                      <i class="fas fa-user-tag me-1"></i> {{ peserta.jenisPeserta?.keterangan || 'Peserta BPJS' }}
                    </span>
                    <h5 class="fw-bold mb-1 text-slate-900 letter-spacing-tight">{{ peserta.nama }}</h5>
                    <div class="d-flex gap-2 text-slate-600 text-xs flex-wrap mt-2">
                      <span class="badge-white-item"><i class="fas fa-credit-card me-1 text-primary"></i> Kartu: <strong>{{ peserta.noKartu }}</strong></span>
                      <span class="badge-white-item"><i class="fas fa-id-card me-1 text-primary"></i> NIK: <strong>{{ peserta.nik }}</strong></span>
                      <span class="badge-white-item"><i class="fas fa-hospital-user me-1 text-primary"></i> RM: <strong>{{ peserta.mr?.noMR || '-' }}</strong></span>
                    </div>
                  </div>

                  <!-- Status Badge Pill -->
                  <div class="text-end">
                    <div :class="['badge-status-pill', isAktif ? 'pill-aktif-white' : 'pill-nonaktif-white']">
                      <i :class="isAktif ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1" style="font-size: 0.75rem;"></i>
                      {{ peserta.statusPeserta?.keterangan?.toUpperCase() || 'STATUS UNKNOWN' }}
                    </div>
                    <small class="d-block text-slate-500 mt-1" style="font-size: 0.65rem;">
                      TMT: {{ formatDate(peserta.tglTMT) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kelas Rawat Compatibility Banner -->
            <div class="card border shadow-xs rounded-3 mb-3 overflow-hidden banner-compat" :class="kelasCheck.bgClass">
              <div class="card-body p-2 px-3 d-flex align-items-center gap-3">
                <div class="icon-circle shadow-xs" :class="kelasCheck.iconBgClass">
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

            <!-- Grid Details (Clean White Tone) -->
            <div class="row g-2">
              <!-- Hak Kelas BPJS -->
              <div class="col-md-6">
                <div class="detail-box box-primary p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-layer-group text-primary me-1"></i> Hak Kelas BPJS
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    {{ peserta.hakKelas?.keterangan || '-' }}
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2" style="font-size: 0.7rem;">
                      Kode: {{ peserta.hakKelas?.kode || '-' }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">Sesuai data kepesertaan terdaftar BPJS</div>
                </div>
              </div>

              <!-- Kelas SEP / SIMRS (If Provided) -->
              <div class="col-md-6">
                <div class="detail-box box-cyan p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-procedures text-cyan me-1"></i> Kelas Rawat di SEP / SIMRS
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    {{ sepKlsText }}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">Kelas yang diinputkan untuk pelayanan ini</div>
                </div>
              </div>

              <!-- Faskes 1 -->
              <div class="col-md-6">
                <div class="detail-box box-success p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-clinic-medical text-success me-1"></i> Faskes Tingkat 1 (FKTP)
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    {{ peserta.provUmum?.nmProvider || '-' }}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    Kode Faskes: {{ peserta.provUmum?.kdProvider || '-' }}
                  </div>
                </div>
              </div>

              <!-- Jenis & Pemberi Kerja -->
              <div class="col-md-6">
                <div class="detail-box box-warning p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-building text-warning me-1"></i> Instansi / Pemberi Kerja
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    {{ peserta.pemberiKerja?.keterangan || 'Tidak Ada / Mandiri' }}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    Jenis: {{ peserta.jenisPeserta?.keterangan || '-' }}
                  </div>
                </div>
              </div>

              <!-- Demografi & Umur -->
              <div class="col-md-6">
                <div class="detail-box box-info p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-user-clock text-info me-1"></i> Tgl Lahir & Umur
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    {{ formatDate(peserta.tglLahir) }} ({{ peserta.sex === 'L' ? 'Laki-laki' : 'Perempuan' }})
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    {{ peserta.umur?.umurSaatPelayanan || peserta.umur?.umurSekarang || '-' }}
                  </div>
                </div>
              </div>

              <!-- Informasi Tambahan / COB -->
              <div class="col-md-6">
                <div class="detail-box box-danger p-2.5 px-3 rounded-3 bg-white border shadow-xs">
                  <div class="text-slate-500 text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-shield-alt text-danger me-1"></i> COB & Kontak
                  </div>
                  <div class="fw-bold text-slate-900 text-sm">
                    COB: {{ peserta.cob?.nmAsuransi ? peserta.cob.nmAsuransi : 'Tidak Ada' }}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    No. Telp: {{ peserta.mr?.noTelepon || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-white border-top py-2 px-3 justify-content-end">
          <button type="button" class="btn btn-sm btn-light border rounded-pill px-4 fw-semibold shadow-xs" @click="close">
            <i class="fas fa-times me-1 text-slate-500"></i> Tutup
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
      badgeClass: 'bg-success text-white shadow-xs',
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
      badgeClass: 'bg-warning text-dark shadow-xs',
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
    badgeClass: 'bg-danger text-white shadow-xs',
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
.modal-white {
  background: #ffffff;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.15) !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.icon-head-bg {
  width: 28px;
  height: 28px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.text-slate-900 { color: #0f172a !important; }
.text-slate-800 { color: #1e293b !important; }
.text-slate-600 { color: #475569 !important; }
.text-slate-500 { color: #64748b !important; }
.text-cyan { color: #0891b2 !important; }

.custom-input {
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
}

.custom-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.badge-white-item {
  background: #f8fafc;
  padding: 0.2rem 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  color: #334155;
}

.badge-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.85rem;
  border-radius: 2rem;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}

.pill-aktif-white {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.pill-nonaktif-white {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid #fecdd3;
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
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.detail-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.06) !important;
}

.box-primary { border-left: 3.5px solid #2563eb !important; }
.box-cyan { border-left: 3.5px solid #0891b2 !important; }
.box-success { border-left: 3.5px solid #16a34a !important; }
.box-warning { border-left: 3.5px solid #d97706 !important; }
.box-info { border-left: 3.5px solid #0284c7 !important; }
.box-danger { border-left: 3.5px solid #e11d48 !important; }

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
