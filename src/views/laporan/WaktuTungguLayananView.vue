<template>
  <div class="waktu-tunggu-page p-3 p-md-4">
    <!-- Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title m-0">⏱️ Laporan Waktu Tunggu & Waktu Layanan</h1>
        <p class="page-subtitle text-muted m-0 mt-1">
          Monitoring durasi alur pelayanan pasien per pos Task ID (Task 1 s/d Task 7) sesuai standar BPJS & SIMRS
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary rounded-3 px-4 shadow-sm fw-bold" @click="fetchData" :disabled="loading">
          <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
          REFRESH DATA
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="filter-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-3 col-6">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Mulai</label>
            <input type="date" class="form-control rounded-3 shadow-none" v-model="filters.tgl_awal" @change="fetchData">
          </div>
          <div class="col-md-3 col-6">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Akhir</label>
            <input type="date" class="form-control rounded-3 shadow-none" v-model="filters.tgl_akhir" @change="fetchData">
          </div>
          <div class="col-md-3 col-6">
            <label class="form-label text-muted small fw-bold mb-1">Poliklinik</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.kd_poli" @change="fetchData">
              <option value="">Semua Poliklinik</option>
              <option v-for="poli in poliOptions" :key="poli.kd_poli" :value="poli.kd_poli">
                {{ poli.nm_poli }}
              </option>
            </select>
          </div>
          <div class="col-md-3 col-6">
            <label class="form-label text-muted small fw-bold mb-1">Dokter</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.kd_dokter" @change="fetchData">
              <option value="">Semua Dokter</option>
              <option v-for="dok in dokterOptions" :key="dok.kd_dokter" :value="dok.kd_dokter">
                {{ dok.nm_dokter }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !dataLoaded" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-bold">Memuat data durasi waktu tunggu & layanan...</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Summary KPI Cards (Pos-pos Waktu Utama) -->
      <div class="row g-3 mb-4">
        <!-- 1. Tunggu Admisi -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-info">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">1. Tunggu Admisi</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.overall?.avg_tunggu_admisi || 0 }}</h3>
              <span class="text-muted small">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-ticket-alt me-1 text-info"></i>Task 1 ➔ Task 2
            </small>
            <span class="badge mt-2" :class="getSpmBadgeClass(analytics.overall?.avg_tunggu_admisi, 15)">
              Std SPM: ≤ 15 mnt
            </span>
          </div>
        </div>

        <!-- 2. Tunggu Poli -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">2. Tunggu Poli</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.overall?.avg_tunggu_poli || 0 }}</h3>
              <span class="text-muted small">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-user-clock me-1 text-warning"></i>Task 2 ➔ Task 3
            </small>
            <span class="badge mt-2" :class="getSpmBadgeClass(analytics.overall?.avg_tunggu_poli, 60)">
              Std SPM: ≤ 60 mnt
            </span>
          </div>
        </div>

        <!-- 3. Layanan Dokter -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">3. Layanan Dokter</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.overall?.avg_layanan_dokter || 0 }}</h3>
              <span class="text-muted small">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-user-md me-1 text-primary"></i>Task 3 ➔ Task 5
            </small>
            <span class="badge mt-2 bg-primary-subtle text-primary border-primary-subtle">
              Pemeriksaan Dokter
            </span>
          </div>
        </div>

        <!-- 4. Tunggu Farmasi -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-purple">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">4. Tunggu Farmasi</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.overall?.avg_tunggu_farmasi || 0 }}</h3>
              <span class="text-muted small">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-pills me-1 text-purple"></i>Task 5 ➔ Task 6
            </small>
            <span class="badge mt-2" :class="getSpmBadgeClass(analytics.overall?.avg_tunggu_farmasi, 30)">
              Std SPM: ≤ 30 mnt
            </span>
          </div>
        </div>

        <!-- 5. Layanan Farmasi -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-teal">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">5. Layanan Farmasi</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.overall?.avg_layanan_farmasi || 0 }}</h3>
              <span class="text-muted small">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-prescription-bottle-alt me-1 text-teal"></i>Task 6 ➔ Task 7
            </small>
            <span class="badge mt-2" :class="getSpmBadgeClass(analytics.overall?.avg_layanan_farmasi, 30)">
              Std SPM: ≤ 30 mnt
            </span>
          </div>
        </div>

        <!-- 6. Total Layanan -->
        <div class="col-6 col-lg-2">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success bg-success-subtle bg-opacity-10">
            <span class="text-success text-xs fw-bold text-uppercase d-block mb-1">Total Waktu Layanan</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-success">{{ analytics.overall?.avg_total_layanan || 0 }}</h3>
              <span class="text-success small fw-bold">mnt</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-flag-checkered me-1 text-success"></i>Task 1 ➔ Task 7
            </small>
            <span class="badge mt-2 bg-success text-white">
              Total Pasien: {{ analytics.overall?.total_pasien || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Task ID Pipeline Visualization -->
      <div class="pipeline-section card border-0 shadow-sm rounded-4 mb-4 p-4">
        <h5 class="card-title fw-bold text-dark mb-3">
          <i class="fas fa-project-diagram me-2 text-primary"></i>Alur Pipeline Task ID BPJS Antrol & SIMRS
        </h5>
        
        <div class="pipeline-flow-wrapper custom-scrollbar py-2">
          <div class="pipeline-steps d-flex align-items-center justify-content-between">
            <!-- Task 1 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-info text-white rounded-circle shadow-sm mb-2">
                <i class="fas fa-ticket-alt"></i>
              </div>
              <span class="step-badge badge bg-info-subtle text-info fw-bold">Task 1</span>
              <div class="step-name fw-bold text-dark small mt-1">Ambil Antrean</div>
              <small class="text-muted text-xs">Anjungan / JKN</small>
            </div>

            <div class="pipeline-line flex-fill text-center mx-2 position-relative">
              <div class="line-bar bg-info opacity-50"></div>
              <span class="line-dur-badge badge bg-white border text-dark shadow-xs small">
                {{ analytics.overall?.avg_tunggu_admisi || 0 }} mnt
              </span>
            </div>

            <!-- Task 2 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-secondary text-white rounded-circle shadow-sm mb-2">
                <i class="fas fa-id-card"></i>
              </div>
              <span class="step-badge badge bg-secondary-subtle text-secondary fw-bold">Task 2</span>
              <div class="step-name fw-bold text-dark small mt-1">Admisi / Loket</div>
              <small class="text-muted text-xs">Registrasi SEP</small>
            </div>

            <div class="pipeline-line flex-fill text-center mx-2 position-relative">
              <div class="line-bar bg-warning opacity-50"></div>
              <span class="line-dur-badge badge bg-white border text-dark shadow-xs small">
                {{ analytics.overall?.avg_tunggu_poli || 0 }} mnt
              </span>
            </div>

            <!-- Task 3 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-warning text-dark rounded-circle shadow-sm mb-2">
                <i class="fas fa-user-clock"></i>
              </div>
              <span class="step-badge badge bg-warning-subtle text-warning fw-bold">Task 3</span>
              <div class="step-name fw-bold text-dark small mt-1">Masuk Poli</div>
              <small class="text-muted text-xs">Pemeriksaan Ralan</small>
            </div>

            <div class="pipeline-line flex-fill text-center mx-2 position-relative">
              <div class="line-bar bg-primary opacity-50"></div>
              <span class="line-dur-badge badge bg-white border text-dark shadow-xs small">
                {{ analytics.overall?.avg_layanan_dokter || 0 }} mnt
              </span>
            </div>

            <!-- Task 5 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-primary text-white rounded-circle shadow-sm mb-2">
                <i class="fas fa-file-prescription"></i>
              </div>
              <span class="step-badge badge bg-primary-subtle text-primary fw-bold">Task 5</span>
              <div class="step-name fw-bold text-dark small mt-1">Selesai Poli</div>
              <small class="text-muted text-xs">Peresepan Obat</small>
            </div>

            <div class="pipeline-line flex-fill text-center mx-2 position-relative">
              <div class="line-bar bg-purple opacity-50"></div>
              <span class="line-dur-badge badge bg-white border text-dark shadow-xs small">
                {{ analytics.overall?.avg_tunggu_farmasi || 0 }} mnt
              </span>
            </div>

            <!-- Task 6 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-purple text-white rounded-circle shadow-sm mb-2">
                <i class="fas fa-mortar-pestle"></i>
              </div>
              <span class="step-badge badge bg-purple-subtle text-purple fw-bold">Task 6</span>
              <div class="step-name fw-bold text-dark small mt-1">Racik Farmasi</div>
              <small class="text-muted text-xs">Penyiapan Obat</small>
            </div>

            <div class="pipeline-line flex-fill text-center mx-2 position-relative">
              <div class="line-bar bg-teal opacity-50"></div>
              <span class="line-dur-badge badge bg-white border text-dark shadow-xs small">
                {{ analytics.overall?.avg_layanan_farmasi || 0 }} mnt
              </span>
            </div>

            <!-- Task 7 -->
            <div class="pipeline-step text-center">
              <div class="step-icon bg-success text-white rounded-circle shadow-sm mb-2">
                <i class="fas fa-check-circle"></i>
              </div>
              <span class="step-badge badge bg-success-subtle text-success fw-bold">Task 7</span>
              <div class="step-name fw-bold text-dark small mt-1">Serah Obat</div>
              <small class="text-muted text-xs">Pasien Pulang</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs & Data Tables -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-white border-bottom p-3 p-md-4">
          <ul class="nav nav-pills card-header-pills gap-2">
            <li class="nav-item">
              <button 
                class="nav-link rounded-3 fw-bold px-3 py-2" 
                :class="{ active: activeTab === 'poli' }"
                @click="activeTab = 'poli'"
              >
                <i class="fas fa-clinic-medical me-2"></i>Rincian Per Poliklinik
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link rounded-3 fw-bold px-3 py-2" 
                :class="{ active: activeTab === 'dokter' }"
                @click="activeTab = 'dokter'"
              >
                <i class="fas fa-user-md me-2"></i>Rincian Per Dokter
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link rounded-3 fw-bold px-3 py-2" 
                :class="{ active: activeTab === 'pasien' }"
                @click="activeTab = 'pasien'"
              >
                <i class="fas fa-users me-2"></i>Detail Antrean Pasien
              </button>
            </li>
          </ul>
        </div>

        <div class="card-body p-3 p-md-4">
          <!-- TAB 1: PER POLIKLINIK -->
          <div v-if="activeTab === 'poli'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold m-0 text-dark">Rata-Rata Waktu Tunggu & Layanan Per Poliklinik</h6>
              <div class="search-box">
                <input type="text" class="form-control form-control-sm rounded-3 shadow-none" placeholder="Cari poli..." v-model="searchPoli">
              </div>
            </div>

            <div class="table-responsive rounded-3 border">
              <table class="table table-hover align-middle m-0" style="font-size: 0.85rem;">
                <thead class="table-light text-uppercase text-muted text-xs">
                  <tr>
                    <th class="ps-3 py-3">Poliklinik</th>
                    <th class="text-center py-3">Total Pasien</th>
                    <th class="text-center py-3">Tunggu Admisi (T1-T2)</th>
                    <th class="text-center py-3">Tunggu Poli (T2-T3)</th>
                    <th class="text-center py-3">Layanan Dokter (T3-T5)</th>
                    <th class="text-center py-3">Tunggu Farmasi (T5-T6)</th>
                    <th class="text-center py-3">Layanan Farmasi (T6-T7)</th>
                    <th class="text-center py-3">Total Layanan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredPoliList.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">Tidak ada data poliklinik ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredPoliList" :key="item.kd_poli">
                    <td class="ps-3 fw-bold text-dark">{{ item.nm_poli }}</td>
                    <td class="text-center fw-bold">{{ item.total_pasien }} Pasien</td>
                    <td class="text-center">{{ item.avg_tunggu_admisi }} mnt</td>
                    <td class="text-center">
                      <span class="badge px-2 py-1" :class="getSpmBadgeClass(item.avg_tunggu_poli, 60)">
                        {{ item.avg_tunggu_poli }} mnt
                      </span>
                    </td>
                    <td class="text-center fw-bold text-primary">{{ item.avg_layanan_dokter }} mnt</td>
                    <td class="text-center">{{ item.avg_tunggu_farmasi }} mnt</td>
                    <td class="text-center">{{ item.avg_layanan_farmasi }} mnt</td>
                    <td class="text-center fw-bold text-success">{{ item.avg_total }} mnt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 2: PER DOKTER -->
          <div v-else-if="activeTab === 'dokter'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold m-0 text-dark">Rata-Rata Waktu Tunggu & Layanan Per Dokter</h6>
              <div class="search-box">
                <input type="text" class="form-control form-control-sm rounded-3 shadow-none" placeholder="Cari dokter..." v-model="searchDokter">
              </div>
            </div>

            <div class="table-responsive rounded-3 border">
              <table class="table table-hover align-middle m-0" style="font-size: 0.85rem;">
                <thead class="table-light text-uppercase text-muted text-xs">
                  <tr>
                    <th class="ps-3 py-3">Nama Dokter</th>
                    <th class="py-3">Poliklinik</th>
                    <th class="text-center py-3">Total Pasien</th>
                    <th class="text-center py-3">Tunggu Poli (T2-T3)</th>
                    <th class="text-center py-3">Layanan Dokter (T3-T5)</th>
                    <th class="text-center py-3">Rata-Rata Total Layanan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredDokterList.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">Tidak ada data dokter ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredDokterList" :key="item.kd_dokter">
                    <td class="ps-3 fw-bold text-dark">{{ item.nm_dokter }}</td>
                    <td class="text-muted">{{ item.nm_poli }}</td>
                    <td class="text-center fw-bold">{{ item.total_pasien }} Pasien</td>
                    <td class="text-center">
                      <span class="badge px-2 py-1" :class="getSpmBadgeClass(item.avg_tunggu_poli, 60)">
                        {{ item.avg_tunggu_poli }} mnt
                      </span>
                    </td>
                    <td class="text-center fw-bold text-primary">{{ item.avg_layanan_dokter }} mnt</td>
                    <td class="text-center fw-bold text-success">{{ item.avg_total }} mnt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: DETAIL PASIEN -->
          <div v-else-if="activeTab === 'pasien'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold m-0 text-dark">Detail Waktu Tunggu & Layanan Pasien</h6>
              <div class="search-box">
                <input type="text" class="form-control form-control-sm rounded-3 shadow-none" placeholder="Cari nama pasien / RM..." v-model="searchPasien">
              </div>
            </div>

            <div class="table-responsive rounded-3 border">
              <table class="table table-hover align-middle m-0" style="font-size: 0.8rem;">
                <thead class="table-light text-uppercase text-muted text-xs">
                  <tr>
                    <th class="ps-3 py-3">Pasien & No. Rawat</th>
                    <th class="py-3">Poli & Dokter</th>
                    <th class="text-center py-3">Task 1 (Ambil)</th>
                    <th class="text-center py-3">Task 2 (Admisi)</th>
                    <th class="text-center py-3">Task 3 (Periksa)</th>
                    <th class="text-center py-3">Task 5 (Resep)</th>
                    <th class="text-center py-3">Task 7 (Obat)</th>
                    <th class="text-center py-3">Total Layanan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredPatientList.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">Tidak ada rincian pasien ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredPatientList" :key="item.no_rawat">
                    <td class="ps-3">
                      <div class="fw-bold text-dark">{{ item.nm_pasien }}</div>
                      <small class="text-muted d-block">RM: {{ item.no_rkm_medis }} | {{ item.no_rawat }}</small>
                    </td>
                    <td>
                      <div class="fw-bold text-primary">{{ item.nm_poli }}</div>
                      <small class="text-muted">{{ item.nm_dokter }}</small>
                    </td>
                    <td class="text-center text-muted">{{ item.task1_ambil || '-' }}</td>
                    <td class="text-center text-muted">{{ item.task2_reg || '-' }}</td>
                    <td class="text-center text-muted">{{ item.task3_periksa || '-' }}</td>
                    <td class="text-center text-muted">{{ item.task5_resep || '-' }}</td>
                    <td class="text-center text-muted">{{ item.task7_penyerahan || '-' }}</td>
                    <td class="text-center fw-bold text-success">
                      {{ item.durasi?.total_layanan ? item.durasi.total_layanan + ' mnt' : '-' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import waktuTungguLayananService from '@/services/waktuTungguLayananService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const dataLoaded = ref(false)
const activeTab = ref('poli')

const filters = reactive({
  tgl_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substr(0, 10),
  tgl_akhir: new Date().toISOString().substr(0, 10),
  kd_poli: '',
  kd_dokter: ''
})

const searchPoli = ref('')
const searchDokter = ref('')
const searchPasien = ref('')

const analytics = ref({
  overall: {},
  spm_standards: {},
  by_poli: [],
  by_dokter: [],
  patient_details: []
})

const poliOptions = computed(() => {
  const map = new Map()
  analytics.value.by_poli.forEach(p => map.set(p.kd_poli, { kd_poli: p.kd_poli, nm_poli: p.nm_poli }))
  return Array.from(map.values())
})

const dokterOptions = computed(() => {
  const map = new Map()
  analytics.value.by_dokter.forEach(d => map.set(d.kd_dokter, { kd_dokter: d.kd_dokter, nm_dokter: d.nm_dokter }))
  return Array.from(map.values())
})

const filteredPoliList = computed(() => {
  if (!searchPoli.value) return analytics.value.by_poli
  const k = searchPoli.value.toLowerCase()
  return analytics.value.by_poli.filter(p => p.nm_poli.toLowerCase().includes(k))
})

const filteredDokterList = computed(() => {
  if (!searchDokter.value) return analytics.value.by_dokter
  const k = searchDokter.value.toLowerCase()
  return analytics.value.by_dokter.filter(d => d.nm_dokter.toLowerCase().includes(k) || d.nm_poli.toLowerCase().includes(k))
})

const filteredPatientList = computed(() => {
  if (!searchPasien.value) return analytics.value.patient_details
  const k = searchPasien.value.toLowerCase()
  return analytics.value.patient_details.filter(p => 
    p.nm_pasien.toLowerCase().includes(k) || 
    p.no_rkm_medis.toLowerCase().includes(k) ||
    p.no_rawat.toLowerCase().includes(k)
  )
})

const getSpmBadgeClass = (val, std) => {
  if (!val || val === 0) return 'bg-secondary-subtle text-secondary'
  if (val <= std) return 'bg-success-subtle text-success border-success-subtle'
  if (val <= std * 1.5) return 'bg-warning-subtle text-warning border-warning-subtle'
  return 'bg-danger-subtle text-danger border-danger-subtle'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await waktuTungguLayananService.getAnalytics({
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      limit: 150
    })

    if (res.data && res.data.status === 'success') {
      analytics.value = res.data.data
      dataLoaded.value = true
    } else {
      toast.error('Gagal mengambil data laporan waktu tunggu')
    }
  } catch (error) {
    console.error('Error fetching waktu tunggu analytics:', error)
    toast.error('Terjadi kesalahan saat memuat data laporan')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.waktu-tunggu-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.border-purple {
  border-color: #8b5cf6 !important;
}

.border-teal {
  border-color: #14b8a6 !important;
}

.text-purple {
  color: #8b5cf6 !important;
}

.text-teal {
  color: #14b8a6 !important;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}

.bg-teal {
  background-color: #14b8a6 !important;
}

.bg-purple-subtle {
  background-color: #f3e8ff !important;
}

.text-purple {
  color: #7e22ce !important;
}

.bg-teal-subtle {
  background-color: #ccfbf1 !important;
}

.pipeline-flow-wrapper {
  overflow-x: auto;
}

.pipeline-steps {
  min-width: 800px;
}

.step-icon {
  width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 1.1rem;
  margin: 0 auto;
}

.line-bar {
  height: 4px;
  border-radius: 2px;
}

.line-dur-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.nav-pills .nav-link {
  color: #64748b;
  background-color: transparent;
  transition: all 0.2s ease;
}

.nav-pills .nav-link.active {
  color: #2563eb;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
}
</style>
