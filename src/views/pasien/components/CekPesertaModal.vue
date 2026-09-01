<template>
  <div class="modal fade show d-block" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg modal-glass">
        <!-- Modal Header -->
        <div class="modal-header bg-gradient-primary text-white py-3 border-0">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2 text-white">
            <i class="fas fa-id-card fs-4"></i>
            Cek Kepesertaan BPJS Kesehatan
          </h5>
          <button type="button" class="btn-close btn-close-white shadow-none" @click="close"></button>
        </div>

        <div class="modal-body p-3">
          <!-- Search Form -->
          <div class="card shadow-sm border-0 mb-3 bg-light-subtle">
            <div class="card-body p-2 px-3">
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label text-xs fw-bold text-muted mb-1">Cari Berdasarkan</label>
                  <select v-model="searchType" class="form-select form-select-sm">
                    <option value="nokartu">No. Kartu BPJS</option>
                    <option value="nik">NIK KTP</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label text-xs fw-bold text-muted mb-1">Nomor {{ searchType === 'nokartu' ? 'Kartu' : 'NIK' }}</label>
                  <input
                    type="text"
                    v-model="searchQuery"
                    :placeholder="searchType === 'nokartu' ? '13 digit No. Kartu...' : '16 digit NIK...'"
                    class="form-control form-control-sm"
                    @keyup.enter="handleSearch"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label text-xs fw-bold text-muted mb-1">Tgl. SEP / Pelayanan</label>
                  <input
                    type="date"
                    v-model="tglSep"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-md-2">
                  <button
                    class="btn btn-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
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
            <p class="text-muted small fw-semibold">Menghubungkan ke Server BPJS VClaim...</p>
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
            <div class="card border-0 shadow-sm rounded-3 overflow-hidden mb-3" :class="isAktif ? 'bg-success-gradient' : 'bg-danger-gradient'">
              <div class="card-body p-3 text-white">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <span class="badge bg-white text-dark fw-bold mb-1 shadow-sm px-2 py-1 rounded-pill" style="font-size: 0.7rem;">
                      <i class="fas fa-user me-1 text-primary"></i> {{ peserta.jenisPeserta?.keterangan || 'Peserta BPJS' }}
                    </span>
                    <h5 class="fw-bold mb-1 text-white">{{ peserta.nama }}</h5>
                    <div class="d-flex gap-3 text-white-50 text-xs flex-wrap">
                      <span><i class="fas fa-credit-card me-1"></i> Kartu: <strong>{{ peserta.noKartu }}</strong></span>
                      <span><i class="fas fa-id-card me-1"></i> NIK: <strong>{{ peserta.nik }}</strong></span>
                      <span><i class="fas fa-hospital-user me-1"></i> RM: <strong>{{ peserta.mr?.noMR || '-' }}</strong></span>
                    </div>
                  </div>

                  <!-- Status Badge Pill -->
                  <div class="text-end">
                    <div :class="['badge-status-pill', isAktif ? 'pill-aktif' : 'pill-nonaktif']">
                      <i :class="isAktif ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1" style="font-size: 0.75rem;"></i>
                      {{ peserta.statusPeserta?.keterangan?.toUpperCase() || 'STATUS UNKNOWN' }}
                    </div>
                    <small class="d-block text-white-50 mt-1" style="font-size: 0.65rem;">
                      TMT: {{ formatDate(peserta.tglTMT) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kelas Rawat Compatibility Banner -->
            <div class="card border-0 shadow-sm rounded-3 mb-3 overflow-hidden" :class="kelasCheck.bgClass">
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
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-layer-group text-primary me-1"></i> Hak Kelas BPJS
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ peserta.hakKelas?.keterangan || '-' }}
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2" style="font-size: 0.7rem;">
                      Kode: {{ peserta.hakKelas?.kode || '-' }}
                    </span>
                  </div>
                  <div class="text-xs text-muted mt-0.5">Sesuai data kepesertaan terdaftar BPJS</div>
                </div>
              </div>

              <!-- Kelas SEP / SIMRS (If Provided) -->
              <div class="col-md-6">
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-procedures text-primary me-1"></i> Kelas Rawat di SEP / SIMRS
                  </div>
                  <div class="fw-bold text-dark text-sm">
                    {{ sepKlsText }}
                  </div>
                  <div class="text-xs text-muted mt-0.5">Kelas yang diinputkan untuk pelayanan ini</div>
                </div>
              </div>

              <!-- Faskes 1 -->
              <div class="col-md-6">
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-clinic-medical text-success me-1"></i> Faskes Tingkat 1 (FKTP)
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
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-building text-warning me-1"></i> Instansi / Pemberi Kerja
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
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-user-clock text-info me-1"></i> Tgl Lahir & Umur
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
                <div class="detail-box p-2 px-3 rounded-3 bg-white border shadow-sm">
                  <div class="text-muted text-xs fw-bold text-uppercase mb-1">
                    <i class="fas fa-shield-alt text-danger me-1"></i> COB & Kontak
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
        <div class="modal-footer bg-light border-0 py-2 px-3">
          <button type="button" class="btn btn-sm btn-secondary rounded-pill px-4" @click="close">Tutup</button>
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
  border-radius: 1.5rem;
  overflow: hidden;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.bg-success-gradient {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.bg-danger-gradient {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.badge-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pill-aktif {
  background: #ffffff;
  color: #047857;
}

.pill-nonaktif {
  background: #ffffff;
  color: #b91c1c;
}

.icon-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-box {
  transition: all 0.2s ease;
}

.detail-box:hover {
  transform: translateY(-2px);
}

.bg-blue-subtle {
  background-color: #eff6ff;
}

.border-blue-subtle {
  border: 1px solid #bfdbfe;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
