<template>
  <div>
    <!-- Filters Card -->
    <div class="filter-card shadow-sm mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-2">
          <label class="filter-label"><i class="fas fa-calendar-alt me-1 text-primary"></i> Periode Bulan</label>
          <input type="month" class="form-control form-control-sm" v-model="filters.bulan" @change="fetchData">
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-hospital me-1 text-primary"></i> Unit / Ruang</label>
          <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Semua Unit"
            class="style-chooser"
            @update:modelValue="fetchData"
          />
        </div>
        <div class="col-md-2">
          <label class="filter-label"><i class="fas fa-tasks me-1 text-primary"></i> Keputusan Act</label>
          <select class="form-select form-select-sm" v-model="filters.keputusan" @change="fetchData">
            <option value="">Semua Keputusan</option>
            <option value="Adopt">Adopt (Adopsi)</option>
            <option value="Adapt">Adapt (Adaptasi)</option>
            <option value="Abandon">Abandon (Hentikan)</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="filter-label"><i class="fas fa-check-circle me-1 text-primary"></i> Status Validasi</label>
          <select class="form-select form-select-sm" v-model="filters.status_pdsa" @change="fetchData">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Terikirim (Submitted)</option>
            <option value="validated">Divalidasi</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-search me-1 text-primary"></i> Cari PDSA</label>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" v-model="filters.keyword" placeholder="Topik, Tim, Indikator..." @input="debounceFetch">
            <div class="dropdown" v-click-outside="() => showExportMenu = false">
              <button 
                class="btn btn-sm btn-success dropdown-toggle d-flex align-items-center justify-content-center border-0 shadow-sm" 
                type="button" 
                @click="showExportMenu = !showExportMenu"
              >
                <i class="fas fa-download me-1"></i> Export
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 show" v-if="showExportMenu" style="display: block; top: 100%; margin-top: 5px; z-index: 1050;">
                <li>
                  <a class="dropdown-item py-2 small" href="#" @click.prevent="exportToExcel(); showExportMenu = false">
                    <i class="fas fa-file-excel text-success me-2"></i> Export Excel (.xlsx)
                  </a>
                </li>
                <li>
                  <a class="dropdown-item py-2 small" href="#" @click.prevent="exportToPDF(); showExportMenu = false">
                    <i class="fas fa-file-pdf text-danger me-2"></i> Export PDF (.pdf)
                  </a>
                </li>
              </ul>
            </div>
            <button class="btn btn-sm btn-primary border-0 shadow-sm px-3" @click="fetchData" title="Refresh">
              <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-white p-3 rounded-4 border shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-uppercase text-muted fw-bold extra-small">Total PDSA Unit</span>
            <h4 class="fw-extrabold mb-0 text-dark mt-1">{{ total }}</h4>
            <small class="text-muted">Periode {{ formatDateFull(filters.bulan) }}</small>
          </div>
          <div class="stat-icon-bg bg-primary-subtle text-primary rounded-3 p-3">
            <i class="fas fa-sync-alt fa-lg"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-white p-3 rounded-4 border border-success-subtle shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-uppercase text-success fw-bold extra-small">Keputusan ADOPT</span>
            <h4 class="fw-extrabold mb-0 text-success mt-1">{{ countAdopt }}</h4>
            <small class="text-muted">Diadopsi sebagai standar</small>
          </div>
          <div class="stat-icon-bg bg-success-subtle text-success rounded-3 p-3">
            <i class="fas fa-check-double fa-lg"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-white p-3 rounded-4 border border-warning-subtle shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-uppercase text-warning-emphasis fw-bold extra-small">Keputusan ADAPT</span>
            <h4 class="fw-extrabold mb-0 text-warning-emphasis mt-1">{{ countAdapt }}</h4>
            <small class="text-muted">Adaptasi & uji ulang</small>
          </div>
          <div class="stat-icon-bg bg-warning-subtle text-warning-emphasis rounded-3 p-3">
            <i class="fas fa-wrench fa-lg"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="stat-card bg-white p-3 rounded-4 border border-info-subtle shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-uppercase text-info fw-bold extra-small">Status Divalidasi</span>
            <h4 class="fw-extrabold mb-0 text-info mt-1">{{ countValidated }}</h4>
            <small class="text-muted">Oleh Komite Mutu</small>
          </div>
          <div class="stat-icon-bg bg-info-subtle text-info rounded-3 p-3">
            <i class="fas fa-user-check fa-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-primary text-white">
              <tr>
                <th width="4%" class="text-center py-3">#</th>
                <th width="22%">Unit & Indikator Mutu</th>
                <th width="28%">Topik & Rencana Intervensi (Plan-Do)</th>
                <th width="24%">Hasil & Keputusan (Study-Act)</th>
                <th width="12%" class="text-center">Status Validasi</th>
                <th width="10%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 text-muted small">Memuat data PDSA dari semua unit...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
                  <p class="mb-0">Tidak ada formulir PDSA ditemukan untuk filter ini.</p>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="item.id" class="pdsa-row">
                <td class="text-center fw-bold text-muted">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center gap-1 mb-1">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small fw-bold">
                      <i class="fas fa-hospital-user me-1"></i> {{ item.analisa?.nama_ruang || item.departemen?.nama || item.dep_id }}
                    </span>
                  </div>
                  <div class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">
                    {{ item.analisa?.nama_inmut || item.id_inmut }}
                  </div>
                  <div v-if="item.created_at" class="text-muted extra-small">
                    <i class="fas fa-clock me-1"></i> Dibuat: {{ formatDate(item.created_at) }}
                  </div>
                </td>
                <td>
                  <div class="topik-badge mb-1">
                    <span class="fw-bold text-dark"><i class="fas fa-bullseye me-1 text-primary"></i> Topik:</span> {{ item.topik || '-' }}
                  </div>
                  <div class="text-muted small mb-1" v-if="item.tim">
                    <i class="fas fa-users me-1 text-secondary"></i> Tim: <strong>{{ item.tim }}</strong>
                  </div>
                  <div class="intervensi-box p-2 bg-light rounded border text-secondary small" style="max-height: 80px; overflow-y: auto;">
                    <strong>Intervensi:</strong> {{ item.p_rencana_intervensi || '-' }}
                  </div>
                </td>
                <td>
                  <div class="mb-2">
                    <span class="badge me-1" :class="getKeputusanBadgeClass(item.a_keputusan)">
                      <i :class="getKeputusanIcon(item.a_keputusan)"></i> {{ item.a_keputusan || 'Belum Ditentukan' }}
                    </span>
                    <small class="text-muted d-block mt-1" v-if="item.tgl_mulai">
                      <i class="fas fa-calendar-day me-1"></i> {{ formatDate(item.tgl_mulai) }} <span v-if="item.tgl_selesai">s/d {{ formatDate(item.tgl_selesai) }}</span>
                    </small>
                  </div>
                  <div class="hasil-box p-2 bg-light-subtle rounded border text-muted extra-small" style="max-height: 70px; overflow-y: auto;">
                    <strong>Hasil:</strong> {{ item.s_hasil || '-' }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="mb-1">
                    <span class="badge px-2 py-1 rounded-pill" :class="getStatusBadgeClass(item.status_pdsa)">
                      {{ formatStatus(item.status_pdsa) }}
                    </span>
                  </div>
                  <div v-if="item.status_pdsa === 'validated' && item.validated_at" class="extra-small text-muted">
                    <i class="fas fa-check me-1 text-success"></i> {{ formatDate(item.validated_at) }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-flex flex-column gap-1 align-items-center">
                    <button class="btn btn-xs btn-outline-primary w-100 rounded-pill fw-bold py-1" @click="openDetailModal(item)">
                      <i class="fas fa-eye me-1"></i> Detail / Print
                    </button>
                    <button 
                      v-if="isKomiteMutu && item.status_pdsa !== 'validated'" 
                      class="btn btn-xs btn-success w-100 rounded-pill fw-bold py-1" 
                      @click="quickValidate(item)"
                      :disabled="validatingId === item.id_analisa"
                    >
                      <i :class="validatingId === item.id_analisa ? 'fas fa-spinner fa-spin' : 'fas fa-user-check me-1'"></i> Verifikasi
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="card-footer bg-white border-top-0 py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="small text-muted">
            Menampilkan <strong>{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }}</strong> dari <strong>{{ total }}</strong> data PDSA
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0 custom-pagination">
              <li class="page-item" :class="{ disabled: page === 1 }">
                <button class="page-link" @click="changePage(page - 1)"><i class="fas fa-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="p in displayedPages" :key="p" :class="{ active: page === p, disabled: p === '...' }">
                <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: page === totalPages }">
                <button class="page-link" @click="changePage(page + 1)"><i class="fas fa-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Detail / Print Modal -->
    <Teleport to="body">
      <div class="modal fade" id="modalPdsaDetail" tabindex="-1" ref="modalDetailRef">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-primary text-white p-3">
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
                <i class="fas fa-sync-alt"></i> Formulir Lembar Kerja PDSA (Plan-Do-Study-Act)
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeDetailModal"></button>
            </div>
            <div class="modal-body p-4" id="printablePdsa">
              <div v-if="selectedItem" class="pdsa-document">
                <!-- Header Info Document -->
                <div class="doc-header p-3 bg-light rounded-3 border mb-4">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <small class="text-uppercase text-muted fw-bold d-block">Unit / Ruang</small>
                      <div class="fw-bold text-dark fs-6">{{ selectedItem.analisa?.nama_ruang || selectedItem.departemen?.nama || selectedItem.dep_id }}</div>
                    </div>
                    <div class="col-md-6 text-md-end">
                      <small class="text-uppercase text-muted fw-bold d-block">Status Form PDSA</small>
                      <span class="badge px-3 py-1 rounded-pill" :class="getStatusBadgeClass(selectedItem.status_pdsa)">
                        {{ formatStatus(selectedItem.status_pdsa) }}
                      </span>
                    </div>
                    <div class="col-12"><hr class="my-2"></div>
                    <div class="col-md-8">
                      <small class="text-uppercase text-muted fw-bold d-block">Indikator Mutu</small>
                      <div class="fw-bold text-primary">{{ selectedItem.analisa?.nama_inmut || selectedItem.id_inmut }}</div>
                    </div>
                    <div class="col-md-4">
                      <small class="text-uppercase text-muted fw-bold d-block">Periode Uji Coba</small>
                      <div class="fw-bold text-dark">{{ formatDate(selectedItem.tgl_mulai) }} s/d {{ formatDate(selectedItem.tgl_selesai) }}</div>
                    </div>
                    <div class="col-md-8 mt-2">
                      <small class="text-uppercase text-muted fw-bold d-block">Topik Siklus PDSA</small>
                      <div class="fw-bold text-dark">{{ selectedItem.topik || '-' }}</div>
                    </div>
                    <div class="col-md-4 mt-2">
                      <small class="text-uppercase text-muted fw-bold d-block">Tim Penguji</small>
                      <div class="fw-bold text-dark">{{ selectedItem.tim || '-' }}</div>
                    </div>
                  </div>
                </div>

                <!-- 4 Cycles Grid -->
                <div class="row g-4">
                  <!-- PLAN SECTION -->
                  <div class="col-md-6">
                    <div class="cycle-card border border-primary-subtle rounded-3 p-3 h-100 bg-white shadow-xs">
                      <div class="cycle-header d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <h6 class="fw-bold text-primary mb-0"><i class="fas fa-lightbulb me-2"></i> 1. PLAN (Perencanaan)</h6>
                        <span class="badge bg-primary text-white">PLAN</span>
                      </div>
                      <div class="cycle-body small">
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Latar Belakang Masalah:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.p_latar_belakang || '-' }}</p>
                        </div>
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Tujuan Intervensi (SMART):</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.p_tujuan || '-' }}</p>
                        </div>
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Akar Penyebab Masalah:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.p_akar_masalah || '-' }}</p>
                        </div>
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Rencana Intervensi Perubahan:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.p_rencana_intervensi || '-' }}</p>
                        </div>
                        <div class="p-2 bg-primary-subtle rounded mt-3">
                          <div class="row g-1 text-dark extra-small">
                            <div class="col-6"><strong>Indikator:</strong> {{ selectedItem.p_indikator || '-' }}</div>
                            <div class="col-6"><strong>Cara Ukur:</strong> {{ selectedItem.p_cara_ukur || '-' }}</div>
                            <div class="col-6"><strong>Frekuensi:</strong> {{ selectedItem.p_frekuensi || '-' }}</div>
                            <div class="col-6"><strong>Target:</strong> {{ selectedItem.p_target || '-' }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- DO SECTION -->
                  <div class="col-md-6">
                    <div class="cycle-card border border-warning-subtle rounded-3 p-3 h-100 bg-white shadow-xs">
                      <div class="cycle-header d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <h6 class="fw-bold text-warning-emphasis mb-0"><i class="fas fa-play-circle me-2"></i> 2. DO (Pelaksanaan Uji Coba)</h6>
                        <span class="badge bg-warning text-dark">DO</span>
                      </div>
                      <div class="cycle-body small">
                        <div class="mb-3">
                          <strong class="text-secondary d-block">Uraian Pelaksanaan Lapangan:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.d_uraian || '-' }}</p>
                        </div>
                        <div class="mb-3">
                          <strong class="text-secondary d-block">Kendala / Masalah yang Ditemukan:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.d_kendala || '-' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- STUDY SECTION -->
                  <div class="col-md-6">
                    <div class="cycle-card border border-info-subtle rounded-3 p-3 h-100 bg-white shadow-xs">
                      <div class="cycle-header d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <h6 class="fw-bold text-info mb-0"><i class="fas fa-chart-bar me-2"></i> 3. STUDY (Evaluasi & Analisis)</h6>
                        <span class="badge bg-info text-white">STUDY</span>
                      </div>
                      <div class="cycle-body small">
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Ringkasan Hasil Data Sebelum & Sesudah:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.s_hasil || '-' }}</p>
                        </div>
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Analisis Capaian Terhadap Target:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.s_analisis || '-' }}</p>
                        </div>
                        <div class="mb-2">
                          <strong class="text-secondary d-block">Pembelajaran dari Uji Coba:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.s_pembelajaran || '-' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- ACT SECTION -->
                  <div class="col-md-6">
                    <div class="cycle-card border border-success-subtle rounded-3 p-3 h-100 bg-white shadow-xs">
                      <div class="cycle-header d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <h6 class="fw-bold text-success mb-0"><i class="fas fa-check-circle me-2"></i> 4. ACT (Tindak Lanjut & Keputusan)</h6>
                        <span class="badge bg-success text-white">ACT</span>
                      </div>
                      <div class="cycle-body small">
                        <div class="mb-3">
                          <strong class="text-secondary d-block mb-1">Keputusan Uji Coba:</strong>
                          <div class="p-2 rounded d-inline-block border fw-bold" :class="getKeputusanBadgeClass(selectedItem.a_keputusan)">
                            <i :class="getKeputusanIcon(selectedItem.a_keputusan)"></i> {{ selectedItem.a_keputusan || 'Belum Ditentukan' }}
                          </div>
                        </div>
                        <div class="mb-3">
                          <strong class="text-secondary d-block">Rencana Tindak Lanjut Selanjutnya:</strong>
                          <p class="mb-0 text-dark">{{ selectedItem.a_tindak_lanjut || '-' }}</p>
                        </div>
                        <div class="row g-2 mt-3 pt-2 border-top extra-small text-muted">
                          <div class="col-6">
                            <strong>Penanggung Jawab:</strong> {{ selectedItem.a_ttd_ketua || '-' }}
                          </div>
                          <div class="col-6 text-end">
                            <strong>Tanggal TTD:</strong> {{ formatDate(selectedItem.a_tgl_ttd) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light p-3 d-flex justify-content-between">
              <div class="small text-muted">
                <i class="fas fa-shield-alt text-primary me-1"></i> Dokumen Resmi Penjaminan Mutu RSIA Aisyiyah Pekajangan
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" @click="closeDetailModal">Tutup</button>
                <button class="btn btn-primary" @click="printPdsa">
                  <i class="fas fa-print me-1"></i> Cetak / Print PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const authStore = useAuthStore()
const toast = useToast()

const items = ref([])
const units = ref([])
const loading = ref(false)
const validatingId = ref(null)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const isKomiteMutu = ref(false)
const showExportMenu = ref(false)

const modalDetailRef = ref(null)
let modalDetailInstance = null
const selectedItem = ref(null)

const filters = reactive({
  bulan: new Date().toISOString().slice(0, 7),
  unit: null,
  keputusan: '',
  status_pdsa: '',
  keyword: ''
})

const countAdopt = computed(() => items.value.filter(i => i.a_keputusan === 'Adopt').length)
const countAdapt = computed(() => items.value.filter(i => i.a_keputusan === 'Adapt').length)
const countValidated = computed(() => items.value.filter(i => i.status_pdsa === 'validated').length)

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

const checkKomite = async () => {
  const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
  if (userNik) {
    try {
      const commRes = await committeeService.getByNik(userNik)
      const committees = commRes.data.data || []
      isKomiteMutu.value = committees.some(c => {
        const name = (c.komite?.nama || c.nama || '').toUpperCase()
        return name.includes('PMKP') || name.includes('MUTU')
      })
    } catch (error) {
      console.error('Error check committee:', error)
    }
  }
}

const fetchUnits = async () => {
  try {
    const res = await api.getUnits()
    units.value = res.data.data || []
  } catch (error) {
    console.error('Error fetch units:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: limit.value,
      bulan: filters.bulan,
      dep_id: filters.unit,
      status_pdsa: filters.status_pdsa,
      a_keputusan: filters.keputusan,
      keyword: filters.keyword
    }
    const res = await api.getAllPdsa(params)
    const resData = res.data.data
    items.value = resData.data || []
    total.value = resData.total || 0
    totalPages.value = resData.last_page || 1
  } catch (error) {
    console.error('Error fetch PDSA all:', error)
    toast.error('Gagal memuat data PDSA unit')
  } finally {
    loading.value = false
  }
}

let timeout = null
const debounceFetch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    page.value = 1
    fetchData()
  }, 500)
}

const changePage = (p) => {
  page.value = p
  fetchData()
}

const quickValidate = async (item) => {
  const result = await Swal.fire({
    title: 'Verifikasi PDSA?',
    text: `Anda akan memverifikasi & mengunci formulir PDSA unit "${item.analisa?.nama_ruang || item.dep_id}".`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Verifikasi',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#198754'
  })

  if (!result.isConfirmed) return

  validatingId.value = item.id_analisa
  try {
    const res = await api.verifyPdsa({
      id_analisa: item.id_analisa,
      status: 'validated'
    })
    if (res.data.success) {
      toast.success('PDSA berhasil divalidasi oleh Komite Mutu')
      fetchData()
    }
  } catch (error) {
    console.error('Error quickValidate:', error)
    toast.error(error.response?.data?.message || 'Gagal memvalidasi PDSA')
  } finally {
    validatingId.value = null
  }
}

const openDetailModal = (item) => {
  selectedItem.value = item
  if (!modalDetailInstance) {
    const modalEl = document.getElementById('modalPdsaDetail')
    if (modalEl) {
      const bootstrap = window.bootstrap
      if (bootstrap && bootstrap.Modal) {
        modalDetailInstance = new bootstrap.Modal(modalEl)
      }
    }
  }
  if (modalDetailInstance) {
    modalDetailInstance.show()
  }
}

const closeDetailModal = () => {
  if (modalDetailInstance) {
    modalDetailInstance.hide()
  }
}

const printPdsa = () => {
  window.print()
}

const getKeputusanBadgeClass = (keputusan) => {
  if (keputusan === 'Adopt') return 'bg-success-subtle text-success border-success-subtle'
  if (keputusan === 'Adapt') return 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
  if (keputusan === 'Abandon') return 'bg-danger-subtle text-danger border-danger-subtle'
  return 'bg-light text-muted border'
}

const getKeputusanIcon = (keputusan) => {
  if (keputusan === 'Adopt') return 'fas fa-check-circle me-1'
  if (keputusan === 'Adapt') return 'fas fa-sync-alt me-1'
  if (keputusan === 'Abandon') return 'fas fa-times-circle me-1'
  return 'fas fa-question-circle me-1'
}

const getStatusBadgeClass = (status) => {
  if (status === 'validated') return 'bg-success text-white'
  if (status === 'submitted') return 'bg-primary text-white'
  if (status === 'rejected') return 'bg-danger text-white'
  return 'bg-secondary text-white'
}

const formatStatus = (status) => {
  if (status === 'validated') return 'Divalidasi'
  if (status === 'submitted') return 'Terkirim'
  if (status === 'rejected') return 'Ditolak'
  return 'Draft'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateFull = (monthStr) => {
  if (!monthStr) return '-'
  const [year, month] = monthStr.split('-')
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

const displayedPages = computed(() => {
  const totalP = totalPages.value
  const current = page.value
  const delta = 1
  const range = []
  
  for (let i = 1; i <= totalP; i++) {
    if (i === 1 || i === totalP || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

const exportToExcel = () => {
  if (items.value.length === 0) {
    toast.warning('Tidak ada data untuk di-export')
    return
  }

  const exportData = items.value.map((item, index) => ({
    'No': index + 1,
    'Unit / Ruang': item.analisa?.nama_ruang || item.dep_id,
    'Indikator Mutu': item.analisa?.nama_inmut || item.id_inmut,
    'Topik PDSA': item.topik || '-',
    'Tim Penguji': item.tim || '-',
    'Tgl Mulai': item.tgl_mulai || '-',
    'Tgl Selesai': item.tgl_selesai || '-',
    'Plan Intervensi': item.p_rencana_intervensi || '-',
    'Do Uraian': item.d_uraian || '-',
    'Study Hasil': item.s_hasil || '-',
    'Act Keputusan': item.a_keputusan || '-',
    'Act Tindak Lanjut': item.a_tindak_lanjut || '-',
    'Status Validasi': formatStatus(item.status_pdsa)
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "PDSA All Unit")
  XLSX.writeFile(wb, `Analisa_PDSA_Unit_${filters.bulan}.xlsx`)
  toast.success('Excel PDSA berhasil di-download')
}

const exportToPDF = () => {
  if (items.value.length === 0) {
    toast.warning('Tidak ada data untuk di-export')
    return
  }

  const doc = new jsPDF('l', 'mm', 'a4')
  doc.setFontSize(14)
  doc.setTextColor(37, 99, 235)
  doc.text('REKAPITULASI ANALISA PDSA ALL UNIT', 14, 15)
  
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Periode: ${formatDateFull(filters.bulan)} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 22)

  const tableBody = items.value.map((item, index) => [
    index + 1,
    `${item.analisa?.nama_ruang || item.dep_id}\n(${item.analisa?.nama_inmut || ''})`,
    item.topik || '-',
    item.p_rencana_intervensi || '-',
    item.s_hasil || '-',
    item.a_keputusan || '-',
    formatStatus(item.status_pdsa)
  ])

  autoTable(doc, {
    startY: 27,
    head: [['#', 'Unit & Indikator', 'Topik PDSA', 'Plan Intervensi', 'Study Hasil', 'Act', 'Status']],
    body: tableBody,
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 45 },
      3: { cellWidth: 60 },
      4: { cellWidth: 55 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' }
    },
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }
  })

  doc.save(`Analisa_PDSA_Unit_${filters.bulan}.pdf`)
  toast.success('PDF PDSA berhasil di-download')
}

onMounted(() => {
  checkKomite()
  fetchUnits()
  fetchData()
})
</script>

<style scoped>
.filter-card {
  background: #fff;
  padding: 1.25rem;
  border-radius: 14px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.4rem;
  display: block;
}

.extra-small {
  font-size: 0.725rem;
}

.fw-extrabold {
  font-weight: 800;
}

.stat-icon-bg {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-xs {
  font-size: 0.75rem;
  padding: 3px 8px;
}

.custom-pagination .page-link {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  margin: 0 2px;
  border-radius: 6px !important;
  font-weight: 600;
}

.custom-pagination .page-item.active .page-link {
  background: #2563eb;
  color: #fff;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printablePdsa, #printablePdsa * {
    visibility: visible;
  }
  #printablePdsa {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
