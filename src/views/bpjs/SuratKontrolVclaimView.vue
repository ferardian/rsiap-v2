<template>
  <div class="surat-kontrol-vclaim-wrapper">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>📋</span> Tarik Data Surat Kontrol & SPRI BPJS
          </h1>
          <p class="page-subtitle mb-0">
            Pencarian, verifikasi status, dan sinkronisasi surat kontrol langsung dari BPJS VClaim ke database SIMRS
          </p>
        </div>
        <div v-if="searchMode !== 'nosurat' && listSuratKontrol.length > 0" class="d-flex align-items-center gap-2">
          <button 
            type="button" 
            class="btn btn-success fw-bold shadow-sm d-flex align-items-center gap-2 px-3 py-2"
            :disabled="loading || syncingBulk || unsyncedCount === 0"
            @click="handleBulkSync"
          >
            <i class="fas" :class="syncingBulk ? 'fa-spinner fa-spin' : 'fa-cloud-download-alt'"></i>
            <span>Sinkronkan Semua yang Belum ({{ unsyncedCount }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search / Filter Card -->
    <div class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <!-- Mode Switcher -->
        <div class="mode-switcher d-flex p-1 bg-light-soft rounded-pill mb-4" style="max-width: 580px;">
          <button 
            class="btn btn-sm flex-fill rounded-pill transition-all" 
            :class="searchMode === 'tanggal' ? 'bg-white shadow text-primary fw-bold' : 'text-muted'"
            @click="switchMode('tanggal')"
          >
            <i class="fas fa-calendar-range me-1"></i> Rentang Tanggal
          </button>
          <button 
            class="btn btn-sm flex-fill rounded-pill transition-all" 
            :class="searchMode === 'nosurat' ? 'bg-white shadow text-primary fw-bold' : 'text-muted'"
            @click="switchMode('nosurat')"
          >
            <i class="fas fa-file-invoice me-1"></i> Nomor Surat Kontrol
          </button>
          <button 
            class="btn btn-sm flex-fill rounded-pill transition-all" 
            :class="searchMode === 'nokartu' ? 'bg-white shadow text-primary fw-bold' : 'text-muted'"
            @click="switchMode('nokartu')"
          >
            <i class="fas fa-id-card me-1"></i> Nomor Kartu BPJS
          </button>
        </div>

        <!-- Form Rentang Tanggal -->
        <form v-if="searchMode === 'tanggal'" @submit.prevent="fetchByTanggal">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label small fw-bold text-muted">Tanggal Awal</label>
              <input v-model="formTanggal.tgl_awal" type="date" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-bold text-muted">Tanggal Akhir</label>
              <input v-model="formTanggal.tgl_akhir" type="date" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-bold text-muted">Filter Berdasarkan</label>
              <select v-model="formTanggal.filter" class="form-select">
                <option value="1">1 - Tanggal Terbit / Entri</option>
                <option value="2">2 - Tanggal Rencana Kontrol</option>
              </select>
            </div>
            <div class="col-md-3">
              <button type="submit" class="btn btn-primary w-100 fw-bold shadow-sm py-2" :disabled="loading">
                <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                {{ loading ? 'Mengambil Data...' : 'Tarik dari VClaim' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Form Nomor Surat -->
        <form v-else-if="searchMode === 'nosurat'" @submit.prevent="fetchByNoSurat">
          <div class="row g-3 align-items-end">
            <div class="col-md-8">
              <label class="form-label small fw-bold text-muted">Nomor Surat Kontrol / SPRI</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-primary">
                  <i class="fas fa-file-medical-alt"></i>
                </span>
                <input 
                  v-model.trim="formNoSurat.no_surat" 
                  type="text" 
                  class="form-control" 
                  placeholder="Contoh: 0166R0011126K000742" 
                  required
                >
              </div>
            </div>
            <div class="col-md-4">
              <button type="submit" class="btn btn-primary w-100 fw-bold shadow-sm py-2" :disabled="loading">
                <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                {{ loading ? 'Mencari...' : 'Cari Nomor Surat' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Form Nomor Kartu -->
        <form v-else-if="searchMode === 'nokartu'" @submit.prevent="fetchByNoKartu">
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label small fw-bold text-muted">Nomor Kartu BPJS (13 Digit)</label>
              <input 
                v-model.trim="formNoKartu.no_kartu" 
                type="text" 
                class="form-control" 
                placeholder="0001234567890" 
                required
              >
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-bold text-muted">Bulan</label>
              <select v-model="formNoKartu.bulan" class="form-select">
                <option v-for="(namaBulan, idx) in listBulan" :key="idx" :value="String(idx + 1).padStart(2, '0')">
                  {{ namaBulan }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-bold text-muted">Tahun</label>
              <input v-model="formNoKartu.tahun" type="number" class="form-control" placeholder="2026">
            </div>
            <div class="col-md-2">
              <label class="form-label small fw-bold text-muted">Filter</label>
              <select v-model="formNoKartu.filter" class="form-select">
                <option value="1">1 - Tgl Entri</option>
                <option value="2">2 - Tgl Kontrol</option>
              </select>
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary w-100 fw-bold shadow-sm py-2" :disabled="loading">
                <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                {{ loading ? 'Mencari...' : 'Cari Data' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Single Search Result View -->
    <div v-if="searchMode === 'nosurat' && detailSurat" class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <span class="badge px-3 py-2 rounded-pill fs-6" :class="detailSurat.jnsKontrol === '1' ? 'bg-info text-white' : 'bg-primary text-white'">
            {{ detailSurat.namaJnsKontrol || (detailSurat.jnsKontrol === '1' ? 'SPRI' : 'Surat Kontrol') }}
          </span>
          <h5 class="fw-bold mb-0 font-monospace text-primary">{{ detailSurat.noSuratKontrol }}</h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span 
            class="badge px-3 py-2 rounded-pill d-flex align-items-center gap-1"
            :class="detailSurat.is_synced ? 'bg-success text-white' : 'bg-warning text-dark'"
          >
            <i class="fas" :class="detailSurat.is_synced ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
            {{ detailSurat.is_synced ? 'Sudah Tersimpan di SIMRS' : 'Belum Tersimpan di SIMRS' }}
          </span>
          <button 
            type="button" 
            class="btn btn-sm btn-success fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-2"
            :disabled="syncingId === detailSurat.noSuratKontrol"
            @click="handleSyncSingle(detailSurat)"
          >
            <i class="fas" :class="syncingId === detailSurat.noSuratKontrol ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span>{{ detailSurat.is_synced ? 'Update Sinkronisasi' : 'Simpan ke Database SIMRS' }}</span>
          </button>
        </div>
      </div>

      <div class="card-body p-4">
        <div class="row g-4">
          <!-- Kolom Informasi Kontrol -->
          <div class="col-lg-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="fw-bold text-primary mb-3">
                <i class="fas fa-info-circle me-1"></i> Data Surat & Rencana Kontrol
              </h6>
              <table class="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted" style="width: 170px;">Tanggal Terbit</td>
                    <td class="fw-bold">{{ detailSurat.tglTerbit || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Tanggal Rencana Kontrol</td>
                    <td class="fw-bold text-danger">{{ detailSurat.tglRencanaKontrol || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Dokter Tujuan</td>
                    <td class="fw-bold">{{ detailSurat.namaDokter || '-' }} <span class="text-muted small">({{ detailSurat.kodeDokter }})</span></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Poli Tujuan</td>
                    <td class="fw-bold">{{ detailSurat.namaPoliTujuan || '-' }} <span class="text-muted small">({{ detailSurat.poliTujuan }})</span></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Dokter Pembuat</td>
                    <td>{{ detailSurat.namaDokterPembuat || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Jenis Pelayanan</td>
                    <td>
                      <span class="badge bg-secondary">
                        {{ detailSurat.jnsKontrol === '1' ? 'Rawat Inap (SPRI)' : 'Rawat Jalan (Surat Kontrol)' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Kolom Informasi Pasien / SEP Asal -->
          <div class="col-lg-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="fw-bold text-success mb-3">
                <i class="fas fa-user-check me-1"></i> Data Pasien & Referensi SEP
              </h6>
              <div v-if="detailSurat.sep">
                <table class="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td class="text-muted" style="width: 150px;">Nomor SEP Asal</td>
                      <td class="fw-bold font-monospace">{{ detailSurat.sep.noSep || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Tanggal SEP</td>
                      <td>{{ detailSurat.sep.tglSep || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Nama Pasien</td>
                      <td class="fw-bold text-primary">{{ detailSurat.sep.peserta?.nama || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Nomor Kartu BPJS</td>
                      <td class="font-monospace">{{ detailSurat.sep.peserta?.noKartu || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Diagnosa Asal</td>
                      <td>{{ detailSurat.sep.diagnosa || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Jenis Pelayanan</td>
                      <td>{{ detailSurat.sep.jnsPelayanan || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-muted small py-3 text-center">
                <i class="fas fa-info-circle me-1"></i> Data referensi SEP kosong (khususnya untuk SPRI Rawat Inap).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch List Result View -->
    <div v-if="searchMode !== 'nosurat' && listSuratKontrol.length > 0" class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-header bg-white border-0 py-3 px-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <!-- Status Counts -->
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
              Total: <strong>{{ listSuratKontrol.length }}</strong>
            </span>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
              <i class="fas fa-check-circle me-1"></i> Tersimpan di SIMRS: <strong>{{ syncedCount }}</strong>
            </span>
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">
              <i class="fas fa-exclamation-triangle me-1"></i> Belum Tersimpan: <strong>{{ unsyncedCount }}</strong>
            </span>
          </div>

          <!-- Quick Search Filter within Table -->
          <div class="d-flex align-items-center gap-2" style="min-width: 320px;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-filter text-muted"></i>
              </span>
              <input 
                v-model="tableFilter" 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Cari pasien / dokter / no surat..."
              >
            </div>
            <select v-model="statusFilter" class="form-select form-select-sm" style="width: 140px;">
              <option value="all">Semua Status</option>
              <option value="unsynced">Belum Sinkron</option>
              <option value="synced">Sudah Sinkron</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th class="ps-4" style="width: 50px;">No</th>
                <th>Surat Kontrol / SPRI</th>
                <th>SEP Asal</th>
                <th>Tgl Terbit / Rencana</th>
                <th>Pasien</th>
                <th>Dokter & Poli Tujuan</th>
                <th class="text-center" style="width: 140px;">Status SIMRS</th>
                <th class="text-center pe-4" style="width: 130px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredList" :key="item.noSuratKontrol || idx">
                <td class="ps-4 text-muted small">{{ idx + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center gap-1">
                    <span class="badge font-monospace text-dark bg-light border px-2 py-1">
                      {{ item.noSuratKontrol }}
                    </span>
                  </div>
                  <div class="mt-1">
                    <span 
                      class="badge rounded-pill px-2 py-0 small"
                      :class="item.jnsKontrol === '1' ? 'bg-info-subtle text-info border' : 'bg-primary-subtle text-primary border'"
                    >
                      {{ item.namaJnsKontrol || (item.jnsKontrol === '1' ? 'SPRI' : 'Surat Kontrol') }}
                    </span>
                    <span class="badge bg-secondary-subtle text-secondary ms-1 small">
                      {{ item.jnsPelayanan }}
                    </span>
                  </div>
                </td>
                <td>
                  <span v-if="item.noSepAsalKontrol" class="font-monospace small text-primary">
                    {{ item.noSepAsalKontrol }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                  <div v-if="item.tglSEP" class="small text-muted">
                    SEP: {{ item.tglSEP }}
                  </div>
                </td>
                <td>
                  <div class="small text-muted">
                    Terbit: <strong>{{ item.tglTerbitKontrol || '-' }}</strong>
                  </div>
                  <div class="small text-danger fw-bold">
                    Kontrol: {{ item.tglRencanaKontrol || '-' }}
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nama || '-' }}</div>
                  <div class="small font-monospace text-muted">{{ item.noKartu || '-' }}</div>
                </td>
                <td>
                  <div class="small fw-semibold">{{ item.namaDokter || '-' }}</div>
                  <div class="small text-muted">
                    {{ item.namaPoliTujuan || '-' }} <span v-if="item.poliTujuan">({{ item.poliTujuan }})</span>
                  </div>
                </td>
                <td class="text-center">
                  <span 
                    class="badge rounded-pill px-2 py-1 small d-inline-flex align-items-center gap-1"
                    :class="item.is_synced ? 'bg-success text-white' : 'bg-warning text-dark'"
                  >
                    <i class="fas" :class="item.is_synced ? 'fa-check' : 'fa-clock'"></i>
                    {{ item.is_synced ? 'Tersimpan' : 'Belum Sinkron' }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <button 
                    type="button" 
                    class="btn btn-sm fw-bold px-3 py-1 shadow-sm d-inline-flex align-items-center gap-1"
                    :class="item.is_synced ? 'btn-outline-success' : 'btn-primary'"
                    :disabled="syncingId === item.noSuratKontrol"
                    @click="handleSyncSingle(item)"
                    :title="item.is_synced ? 'Update data di database' : 'Simpan ke database SIMRS'"
                  >
                    <i class="fas" :class="syncingId === item.noSuratKontrol ? 'fa-spinner fa-spin' : (item.is_synced ? 'fa-sync-alt' : 'fa-cloud-download-alt')"></i>
                    <span>{{ item.is_synced ? 'Update' : 'Simpan' }}</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-search-minus fa-2x mb-2 d-block text-secondary opacity-50"></i>
                  Tidak ada data yang cocok dengan kriteria filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && !detailSurat && listSuratKontrol.length === 0" class="card glass-card border-0 shadow-sm p-5 text-center">
      <div class="py-4">
        <i class="fas fa-file-medical fa-4x text-muted opacity-25 mb-3"></i>
        <h5 class="fw-bold text-muted">Belum Ada Data yang Ditampilkan</h5>
        <p class="text-muted small mb-0">
          Silakan pilih metode pencarian di atas lalu klik tombol pencarian untuk menarik data Surat Kontrol / SPRI dari VClaim.
        </p>
      </div>
    </div>

    <!-- Loading State Indicator -->
    <div v-if="loading" class="card glass-card border-0 shadow-sm p-5 text-center">
      <div class="py-4">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h6 class="fw-bold text-primary">Menghubungkan ke BPJS VClaim...</h6>
        <p class="text-muted small mb-0">Sedang menarik dan memverifikasi data terhadap database SIMRS.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import Swal from 'sweetalert2'
import bpjsVclaimService from '../../services/bpjsVclaimService'
import { showToast } from '../../utils/notification'

// State
const searchMode = ref('tanggal') // 'tanggal' | 'nosurat' | 'nokartu'
const loading = ref(false)
const syncingId = ref(null)
const syncingBulk = ref(false)

const detailSurat = ref(null)
const listSuratKontrol = ref([])
const tableFilter = ref('')
const statusFilter = ref('all') // 'all' | 'unsynced' | 'synced'

// Form states
const today = new Date().toISOString().split('T')[0]
const formTanggal = reactive({
  tgl_awal: today,
  tgl_akhir: today,
  filter: '1' // 1: tgl terbit, 2: tgl rencana kontrol
})

const formNoSurat = reactive({
  no_surat: ''
})

const formNoKartu = reactive({
  no_kartu: '',
  bulan: String(new Date().getMonth() + 1).padStart(2, '0'),
  tahun: new Date().getFullYear(),
  filter: '1'
})

const listBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Computed
const syncedCount = computed(() => {
  return listSuratKontrol.value.filter(item => item.is_synced).length
})

const unsyncedCount = computed(() => {
  return listSuratKontrol.value.filter(item => !item.is_synced).length
})

const filteredList = computed(() => {
  let list = [...listSuratKontrol.value]

  // Status Filter
  if (statusFilter.value === 'unsynced') {
    list = list.filter(item => !item.is_synced)
  } else if (statusFilter.value === 'synced') {
    list = list.filter(item => item.is_synced)
  }

  // Keyword Filter
  if (tableFilter.value.trim()) {
    const q = tableFilter.value.toLowerCase().trim()
    list = list.filter(item => {
      const noSurat = (item.noSuratKontrol || '').toLowerCase()
      const nama = (item.nama || '').toLowerCase()
      const dokter = (item.namaDokter || '').toLowerCase()
      const poli = (item.namaPoliTujuan || '').toLowerCase()
      const noSep = (item.noSepAsalKontrol || '').toLowerCase()
      const noKartu = (item.noKartu || '').toLowerCase()
      return noSurat.includes(q) || nama.includes(q) || dokter.includes(q) || poli.includes(q) || noSep.includes(q) || noKartu.includes(q)
    })
  }

  return list
})

// Methods
const switchMode = (mode) => {
  searchMode.value = mode
  detailSurat.value = null
  listSuratKontrol.value = []
  tableFilter.value = ''
  statusFilter.value = 'all'
}

// Fetch by Tanggal
const fetchByTanggal = async () => {
  loading.value = true
  listSuratKontrol.value = []
  try {
    const res = await bpjsVclaimService.getSuratKontrolByTanggal({
      tgl_awal: formTanggal.tgl_awal,
      tgl_akhir: formTanggal.tgl_akhir,
      filter: formTanggal.filter
    })

    const code = res.data?.metaData?.code
    const message = res.data?.metaData?.message || 'Gagal mengambil data'

    if (code === '200' && res.data?.response?.list) {
      listSuratKontrol.value = res.data.response.list
      showToast(`Ditemukan ${listSuratKontrol.value.length} data surat kontrol`, 'success')
    } else {
      listSuratKontrol.value = []
      showToast(message, 'warning')
    }
  } catch (err) {
    console.error(err)
    showToast(err.response?.data?.message || 'Terjadi kesalahan saat memanggil API BPJS', 'error')
  } finally {
    loading.value = false
  }
}

// Fetch by Nomor Surat
const fetchByNoSurat = async () => {
  if (!formNoSurat.no_surat) return
  loading.value = true
  detailSurat.value = null

  try {
    const res = await bpjsVclaimService.getSuratKontrolByNoSurat(formNoSurat.no_surat)
    const code = res.data?.metaData?.code
    const message = res.data?.metaData?.message || 'Nomor surat kontrol tidak ditemukan'

    if (code === '200' && res.data?.response) {
      detailSurat.value = res.data.response
      showToast('Data Surat Kontrol ditemukan', 'success')
    } else {
      showToast(message, 'warning')
    }
  } catch (err) {
    console.error(err)
    showToast(err.response?.data?.message || 'Terjadi kesalahan saat mencari nomor surat', 'error')
  } finally {
    loading.value = false
  }
}

// Fetch by Nomor Kartu
const fetchByNoKartu = async () => {
  if (!formNoKartu.no_kartu) return
  loading.value = true
  listSuratKontrol.value = []

  try {
    const res = await bpjsVclaimService.getSuratKontrolByNoKartu(formNoKartu.no_kartu, {
      bulan: formNoKartu.bulan,
      tahun: formNoKartu.tahun,
      filter: formNoKartu.filter
    })

    const code = res.data?.metaData?.code
    const message = res.data?.metaData?.message || 'Data tidak ditemukan'

    if (code === '200' && res.data?.response?.list) {
      listSuratKontrol.value = res.data.response.list
      showToast(`Ditemukan ${listSuratKontrol.value.length} riwayat surat kontrol`, 'success')
    } else {
      listSuratKontrol.value = []
      showToast(message, 'warning')
    }
  } catch (err) {
    console.error(err)
    showToast(err.response?.data?.message || 'Terjadi kesalahan saat mengambil riwayat peserta', 'error')
  } finally {
    loading.value = false
  }
}

// Single Sync
const handleSyncSingle = async (item) => {
  const noSurat = item.noSuratKontrol
  syncingId.value = noSurat

  try {
    const res = await bpjsVclaimService.syncSuratKontrol({
      items: [item]
    })

    if (res.data?.metaData?.code === '200') {
      showToast(`Berhasil menyimpan Surat Kontrol ${noSurat} ke database SIMRS`, 'success')
      // Update item is_synced status locally
      item.is_synced = true
      if (detailSurat.value && detailSurat.value.noSuratKontrol === noSurat) {
        detailSurat.value.is_synced = true
      }
    } else {
      showToast(res.data?.metaData?.message || 'Gagal menyimpan ke database', 'error')
    }
  } catch (err) {
    console.error(err)
    showToast(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error')
  } finally {
    syncingId.value = null
  }
}

// Bulk Sync
const handleBulkSync = async () => {
  const unsyncedItems = listSuratKontrol.value.filter(item => !item.is_synced)
  if (unsyncedItems.length === 0) {
    showToast('Semua data sudah tersinkronkan ke SIMRS', 'info')
    return
  }

  const result = await Swal.fire({
    title: 'Sinkronisasi Surat Kontrol',
    text: `Apakah Anda yakin ingin menyinkronkan ${unsyncedItems.length} data Surat Kontrol ke database SIMRS?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Sinkronkan Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981'
  })

  if (!result.isConfirmed) return

  syncingBulk.value = true
  try {
    const res = await bpjsVclaimService.syncSuratKontrol({
      items: unsyncedItems
    })

    if (res.data?.metaData?.code === '200') {
      const count = res.data?.response?.synced_count || unsyncedItems.length
      // Update status on all unsynced items
      unsyncedItems.forEach(item => {
        item.is_synced = true
      })
      Swal.fire({
        title: 'Berhasil!',
        text: `${count} data surat kontrol berhasil disimpan ke database SIMRS.`,
        icon: 'success'
      })
    } else {
      showToast(res.data?.metaData?.message || 'Gagal melakukan sinkronisasi bulk', 'error')
    }
  } catch (err) {
    console.error(err)
    showToast('Terjadi kesalahan saat sinkronisasi massal', 'error')
  } finally {
    syncingBulk.value = false
  }
}
</script>

<style scoped>
.surat-kontrol-vclaim-wrapper {
  padding: 1.5rem 0;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.92rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
}

.bg-light-soft {
  background-color: #f1f5f9;
}

.mode-switcher button {
  font-size: 0.88rem;
  padding: 0.45rem 1rem;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}
</style>
