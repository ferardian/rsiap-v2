<template>
  <div class="pasien-vclaim-wrapper">
    <div class="page-header mb-4">
      <h1 class="page-title">💳 Cek Peserta BPJS VClaim</h1>
      <p class="page-subtitle">Verifikasi data kepesertaan pasien langsung ke sistem BPJS</p>
    </div>

    <div class="row g-4">
      <!-- Search Column -->
      <div class="col-lg-4">
        <div class="card glass-card border-0 shadow-sm p-4 h-100">
          <h5 class="fw-bold mb-4">Pencarian Data</h5>
          
          <!-- Mode Switcher -->
          <div class="mode-switcher d-flex p-1 bg-light-soft rounded-pill mb-4">
            <button 
              class="btn btn-sm flex-fill rounded-pill transition-all" 
              :class="searchMode === 'nokartu' ? 'bg-white shadow text-primary fw-bold' : 'text-muted'"
              @click="searchMode = 'nokartu'"
            >
              No. Kartu
            </button>
            <button 
              class="btn btn-sm flex-fill rounded-pill transition-all" 
              :class="searchMode === 'nik' ? 'bg-white shadow text-primary fw-bold' : 'text-muted'"
              @click="searchMode = 'nik'"
            >
              NIK (KTP)
            </button>
          </div>

          <form @submit.prevent="searchPasien">
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-end mb-2">
                <label class="small-label text-muted mb-0">
                  {{ searchMode === 'nokartu' ? 'Nomor Kartu BPJS' : 'Nomor NIK Kependudukan' }}
                </label>
                <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none fw-bold" @click="openLookupModal">
                  <i class="fas fa-search-plus me-1"></i>Lookup Pasien SIMRS
                </button>
              </div>
              <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                <span class="input-group-text bg-white border-0 ps-3">
                  <i class="fas text-primary" :class="searchMode === 'nokartu' ? 'fa-id-card' : 'fa-fingerprint'"></i>
                </span>
                <input 
                  v-model="params.value" 
                  type="text" 
                  class="form-control border-0 px-2" 
                  :placeholder="searchMode === 'nokartu' ? '0001234567890' : '3372012345678901'"
                  required
                >
              </div>
            </div>

            <div class="mb-4">
              <label class="small-label text-muted mb-2">Tanggal Rencana SEP</label>
              <div class="input-group shadow-sm rounded-pill overflow-hidden border">
                <span class="input-group-text bg-white border-0 ps-3">
                  <i class="fas fa-calendar-alt text-primary"></i>
                </span>
                <input 
                  v-model="params.tgl_sep" 
                  type="date" 
                  class="form-control border-0 px-2" 
                  required
                >
              </div>
              <div class="form-text small mt-1">Data kepesertaan bersifat dinamis sesuai tanggal SEP</div>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg mt-2" 
              :disabled="loading"
            >
              <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
              {{ loading ? 'Mencari...' : 'Cari Data Peserta' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Result Column -->
      <div class="col-lg-8">
        <transition name="fade" mode="out-in">
          <!-- Empty State -->
          <div v-if="!peserta && !loading" class="card glass-card border-0 shadow-sm p-5 text-center h-100 d-flex flex-column justify-content-center">
            <div class="empty-state">
              <i class="fas fa-search-dollar fa-4x text-light-soft mb-3"></i>
              <h5 class="text-muted fw-bold">Belum Ada Data</h5>
              <p class="text-muted px-lg-5">Gunakan form di sebelah kiri untuk memverifikasi data kepesertaan pasien.</p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loading" class="card glass-card border-0 shadow-sm p-5 text-center h-100 d-flex flex-column justify-content-center">
             <div class="spinner-border text-primary mx-auto mb-3" style="width: 3rem; height: 3rem;" role="status text-primar">
                <span class="visually-hidden">Loading...</span>
              </div>
              <h6 class="text-primary fw-bold">Menghubungkan ke BPJS VClaim...</h6>
          </div>

          <!-- Result State -->
          <div v-else class="card glass-card border-0 shadow-sm p-0 h-100 overflow-hidden">
            <div class="bg-gradient-header p-4 text-white d-flex justify-content-between align-items-start">
              <div>
                <div class="badge rounded-pill px-3 mb-2 small fw-bold text-uppercase shadow-sm" :class="peserta.peserta.statusPeserta.kode === '0' ? 'bg-success text-white' : 'bg-danger text-white'">
                  <i class="fas fa-check-circle me-1" v-if="peserta.peserta.statusPeserta.kode === '0'"></i>
                  <i class="fas fa-times-circle me-1" v-else></i>
                  {{ peserta.peserta.statusPeserta.keterangan }}
                </div>
                <h2 class="fw-bold mb-0">{{ peserta.peserta.nama }}</h2>
                <div class="small opacity-75 mt-1">
                  <i class="fas fa-venus-mars me-1"></i> {{ peserta.peserta.sex === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }} 
                  <span class="mx-2">•</span>
                  <i class="fas fa-birthday-cake me-1"></i> {{ peserta.peserta.tglLahir }} ({{ peserta.peserta.umur.umurSekarang }})
                </div>
              </div>
              <div class="avatar-box bg-white text-primary rounded-3 shadow p-3">
                <i class="fas fa-user-check fa-2x"></i>
              </div>
            </div>

            <div class="p-4 bg-light-soft border-bottom">
              <div class="row g-3">
                <div class="col-md-6 col-lg-3">
                  <div class="p-3 bg-white rounded-3 shadow-xs text-center border">
                    <div class="text-muted small-label mb-1">NO. KARTU</div>
                    <div class="fw-bold text-dark font-monospace">{{ peserta.peserta.noKartu }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="p-3 bg-white rounded-3 shadow-xs text-center border">
                    <div class="text-muted small-label mb-1">NIK</div>
                    <div class="fw-bold text-dark font-monospace">{{ peserta.peserta.nik }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="p-3 bg-white rounded-3 shadow-xs text-center border">
                    <div class="text-muted small-label mb-1">KELAS RAWAT</div>
                    <div class="fw-bold text-dark">{{ peserta.peserta.hakKelas.keterangan }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="p-3 bg-white rounded-3 shadow-xs text-center border">
                    <div class="text-muted small-label mb-1">KODE JENIS</div>
                    <div class="fw-bold text-dark">{{ peserta.peserta.jenisPeserta.kode }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4">
              <h6 class="fw-bold mb-3"><i class="fas fa-info-circle me-2 text-primary"></i>Informasi Detail</h6>
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="detail-section mb-4">
                    <div class="section-title small-label text-primary mb-2">Kepesertaan & Faskes</div>
                    <ul class="list-group list-group-flush border-0 rounded-3 overflow-hidden shadow-xs">
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Faskes Pertama (PPK 1)</span>
                        <span class="fw-bold small text-end">{{ peserta.peserta.provUmum.nmProvider }} ({{ peserta.peserta.provUmum.kdProvider }})</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Jenis Peserta</span>
                        <span class="fw-bold small">{{ peserta.peserta.jenisPeserta.keterangan }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">PISA (Hubungan Keluarga)</span>
                        <span class="fw-bold small">{{ peserta.peserta.pisa }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Tgl. Terdaftar (TMT)</span>
                        <span class="fw-bold small">{{ peserta.peserta.tglTMT }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Tgl. Berakhir (TAT)</span>
                        <span class="fw-bold small text-danger">{{ peserta.peserta.tglTAT }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Tgl. Cetak Kartu</span>
                        <span class="fw-bold small">{{ peserta.peserta.tglCetakKartu }}</span>
                      </li>
                    </ul>
                  </div>

                  <div class="detail-section">
                    <div class="section-title small-label text-primary mb-2">Rekam Medis & Kontak</div>
                    <ul class="list-group list-group-flush border-0 rounded-3 overflow-hidden shadow-xs">
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">No. Rekam Medis (MR)</span>
                        <span class="fw-bold small text-primary">{{ peserta.peserta.mr.noMR || '-' }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">No. Telepon</span>
                        <span class="fw-bold small">{{ peserta.peserta.mr.noTelepon || '-' }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-section mb-4">
                    <div class="section-title small-label text-success mb-2">Status & Jaminan</div>
                    <ul class="list-group list-group-flush border-0 rounded-3 overflow-hidden shadow-xs">
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Status Kepesertaan</span>
                        <span class="fw-bold small" :class="peserta.peserta.statusPeserta.kode === '0' ? 'text-success' : 'text-danger'">
                           {{ peserta.peserta.statusPeserta.keterangan }}
                        </span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Umur saat Pelayanan</span>
                        <span class="fw-bold small">{{ peserta.peserta.umur.umurSaatPelayanan }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Status Fingerprint</span>
                        <span class="badge rounded-pill" :class="peserta.peserta.informasi.noFingerPrint ? 'bg-success' : 'bg-warning'">
                           {{ peserta.peserta.informasi.noFingerPrint ? 'AKTIF' : 'BELUM AKTIF' }}
                        </span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">COB (Asuransi Lain)</span>
                        <span class="fw-bold small">{{ peserta.peserta.cob.nmAsuransi || '-' }}</span>
                      </li>
                    </ul>
                  </div>

                  <div class="detail-section">
                    <div class="section-title small-label text-warning mb-2">Informasi Khusus</div>
                    <ul class="list-group list-group-flush border-0 rounded-3 overflow-hidden shadow-xs">
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Prolanis PRB</span>
                        <span class="fw-bold small text-info">{{ peserta.peserta.informasi.prolanisPRB || '-' }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">Dinas Sosial</span>
                        <span class="fw-bold small">{{ peserta.peserta.informasi.dinsos || '-' }}</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-white">
                        <span class="text-muted small">No. SKTM</span>
                        <span class="fw-bold small">{{ peserta.peserta.informasi.noSKTM || '-' }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

               <div v-if="peserta.peserta.informasi.dinkes" class="alert alert-info mt-4 mb-0 border-0 rounded-3">
                  <div class="d-flex">
                    <i class="fas fa-clinic-medical mt-1 me-3"></i>
                    <div>
                      <h6 class="fw-bold mb-1">Informasi Dinas Kesehatan</h6>
                      <p class="mb-0 small">{{ peserta.peserta.informasi.dinkes }}</p>
                    </div>
                  </div>
              </div>
            </div>
            
            <div class="p-3 bg-light text-center">
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-4" @click="peserta = null">
                <i class="fas fa-times me-2"></i>Tutup Detail
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Lookup Pasien Modal -->
    <div class="modal fade" id="lookupModal" tabindex="-1" aria-hidden="true" ref="lookupModalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-0 p-4">
            <h5 class="modal-title fw-bold text-primary">
              <i class="fas fa-search me-2"></i>Lookup Pasien SIMRS
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 pt-0">
            <div class="search-box mb-4">
              <input 
                v-model="lookupQuery" 
                type="text" 
                class="form-control form-control-lg rounded-pill px-4 shadow-sm border-light" 
                placeholder="Cari Nama / No RM / NIK / No. Kartu BPJS..."
                @input="debounceLookup"
              >
            </div>

            <div class="table-responsive rounded-3 border overflow-hidden">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light-soft small-label">
                  <tr>
                    <th class="ps-3">PASIEN / NO RM</th>
                    <th>NIK</th>
                    <th>NO. BPJS</th>
                    <th class="text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in lookupResults" :key="p.no_rkm_medis">
                    <td class="ps-3">
                      <div class="fw-bold text-dark">{{ p.nm_pasien }}</div>
                      <div class="small text-muted font-monospace">{{ p.no_rkm_medis }}</div>
                    </td>
                    <td><span class="small font-monospace text-muted">{{ p.no_ktp || '-' }}</span></td>
                    <td><span class="small font-monospace text-primary fw-bold">{{ p.no_peserta || '-' }}</span></td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-primary rounded-pill px-3" @click="selectPasien(p)">
                        Pilih
                      </button>
                    </td>
                  </tr>
                  <tr v-if="lookupResults.length === 0 && !searching">
                    <td colspan="4" class="text-center py-4 text-muted small">
                      {{ lookupQuery.length < 3 ? 'Ketik minimal 3 karakter' : 'Tidak ada data ditemukan' }}
                    </td>
                  </tr>
                  <tr v-if="searching">
                    <td colspan="4" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm text-primary"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import bpjsVclaimService from '../../services/bpjsVclaimService'
import pasienService from '../../services/pasienService'
import { showToast } from '../../utils/notification'

const searchMode = ref('nokartu') // nokartu | nik
const loading = ref(false)
const peserta = ref(null)

const lookupModalRef = ref(null)
let lookupModal = null

const lookupQuery = ref('')
const lookupResults = ref([])
const searching = ref(false)

const params = reactive({
  value: '',
  tgl_sep: new Date().toISOString().split('T')[0]
})

onMounted(() => {
  lookupModal = new Modal(lookupModalRef.value)
})

const openLookupModal = () => {
  lookupQuery.value = ''
  lookupResults.value = []
  lookupModal.show()
}

const debounceLookup = () => {
  clearTimeout(debounceLookup.timer)
  debounceLookup.timer = setTimeout(() => {
    handleLookup()
  }, 500)
}

const handleLookup = async () => {
  if (lookupQuery.value.length < 3) {
    lookupResults.value = []
    return
  }
  
  searching.value = true
  try {
    const res = await pasienService.searchPasien({
      search: { value: lookupQuery.value },
      limit: 10
    })
    lookupResults.value = res.data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    searching.value = false
  }
}

const selectPasien = (p) => {
  if (searchMode.value === 'nokartu') {
    params.value = p.no_peserta || ''
    if (!p.no_peserta) showToast('No. BPJS pasien ini kosong', 'warning')
  } else {
    params.value = p.no_ktp || ''
    if (!p.no_ktp) showToast('NIK pasien ini kosong', 'warning')
  }
  lookupModal.hide()
}

const searchPasien = async () => {
  if (!params.value) return
  
  loading.value = true
  peserta.value = null
  
  try {
    let res
    if (searchMode.value === 'nokartu') {
      res = await bpjsVclaimService.getPesertaByNoKartu(params.value, params.tgl_sep)
    } else {
      res = await bpjsVclaimService.getPesertaByNik(params.value, params.tgl_sep)
    }
    
    if (res.data.metaData.code === '200') {
      peserta.value = res.data.response
      showToast('Data peserta ditemukan', 'success')
    } else {
      showToast(`${res.data.metaData.message} (Code: ${res.data.metaData.code})`, 'warning')
    }
  } catch (error) {
    console.error(error)
    showToast('Terjadi kesalahan saat menghubungi API VClaim', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pasien-vclaim-wrapper {
  padding: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
}

.bg-light-soft {
  background-color: #f1f5f9;
}

.transition-all {
  transition: all 0.2s ease;
}

.small-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.bg-gradient-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.avatar-box {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-monospace {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.shadow-xs {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
