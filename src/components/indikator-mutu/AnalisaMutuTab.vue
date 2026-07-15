<template>
  <div>
    <!-- Monitoring Stats Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 12px; border: 1px solid rgba(0,0,0,0.05) !important;">
          <div class="card-body p-0">
            <div class="d-flex align-items-center justify-content-between p-3" :class="pendingAnalyses.length > 0 ? 'bg-warning-subtle' : 'bg-success-subtle'">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon d-flex align-items-center justify-content-center rounded-circle shadow-sm" 
                     :class="pendingAnalyses.length > 0 ? 'bg-warning text-white' : 'bg-success text-white'"
                     style="width: 40px; height: 40px;">
                  <i class="fas" :class="pendingAnalyses.length > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" :class="pendingAnalyses.length > 0 ? 'text-warning-emphasis' : 'text-success-emphasis'">
                    {{ pendingAnalyses.length > 0 ? `${pendingStats.total} Indikator Belum Dianalisa` : 'Semua Analisa Bulan Ini Telah Terisi' }}
                  </h6>
                  <small class="text-muted">
                    <template v-if="pendingAnalyses.length > 0">
                        {{ pendingStats.uniqueRooms }} Ruang & {{ pendingStats.uniqueInmuts }} Indikator • Periode {{ formatDateFull(filters.bulan) }}
                    </template>
                    <template v-else>
                        Status pengumpulan analisa periode {{ formatDateFull(filters.bulan) }}
                    </template>
                  </small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button v-if="loadingStats" class="btn btn-sm btn-light disabled">
                    <span class="spinner-border spinner-border-sm me-1"></span> Mengolah...
                </button>
                <button v-if="pendingAnalyses.length > 0 && !loadingStats" 
                        class="btn btn-sm shadow-sm rounded-pill px-3 fw-bold" 
                        :class="showPendingList ? 'btn-light border text-dark' : 'btn-warning text-dark'"
                        @click="showPendingList = !showPendingList">
                  <i class="fas" :class="showPendingList ? 'fa-times me-1' : 'fa-list-ul me-1'"></i>
                  {{ showPendingList ? 'Tutup List' : 'Lihat Daftar Pending' }}
                </button>
              </div>
            </div>
            
            <Transition name="slide-fade">
              <div v-if="showPendingList && pendingAnalyses.length > 0" class="p-0 border-top bg-white">
                <div class="table-responsive" style="max-height: 350px;">
                  <table class="table table-sm table-hover align-middle mb-0">
                    <thead class="bg-light sticky-top">
                      <tr>
                        <th class="ps-3 py-2 text-muted small fw-bold text-uppercase" width="30%">Unit / Ruang</th>
                        <th class="py-2 text-muted small fw-bold text-uppercase" width="70%">Indikator Mutu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in sortedPendingAnalyses" :key="item.dep_id + '_' + item.id_inmut">
                        <td class="ps-3"><span class="fw-bold text-dark small" style="font-size: 0.82rem;">{{ item.nama_ruang }}</span></td>
                        <td><span class="text-secondary small" style="font-size: 0.8rem;">{{ item.nama_inmut }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="p-2 bg-light border-top text-center">
                    <small class="text-muted italic">Menampilkan daftar unit yang belum menginput analisa capaian bulan ini.</small>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->

    <div class="row mb-4 g-2">
      <div class="col-md-4">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-search text-muted"></i>
          </span>
          <input type="text" class="form-control border-start-0 ps-0" v-model="filters.keyword" placeholder="Cari Nama Indikator..." @input="debounceFetch">
        </div>
      </div>
      <div class="col-md-8 d-flex justify-content-end align-items-center gap-2 filter-container">
        <div class="input-group date-filter" style="max-width: 250px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="month" class="form-control border-start-0 ps-0" v-model="filters.bulan" @change="fetchData">
        </div>
        
        <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang"
            class="style-chooser unit-select"
            style="min-width: 200px;"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>

        <button class="btn btn-primary refresh-btn" @click="fetchData" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th width="5%" class="text-center">#</th>
                <th width="25%">Indikator</th>
                <th width="30%">Capaian & Periode</th>
                <th width="30%">Analisa & Tindak Lanjut</th>
                <th width="10%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="fas fa-clipboard-check fa-3x mb-3 opacity-50"></i>
                  <p>Tidak ada data analisa untuk periode ini.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.id_analisa">
               <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                  <div class="fw-bold text-primary mb-1">{{ item.nama_inmut }}</div>
                  <small class="text-muted d-block mb-1">{{ item.nama_ruang }}</small>
                  <span v-if="item.feedback" class="badge bg-success shadow-sm rounded-pill px-2 py-1 mb-1" style="font-size: 0.6rem; font-weight: 700; letter-spacing: 0.3px;">
                      <i class="fas fa-check-circle me-1"></i> TER-SUPERVISI ({{ formatDate(item.feedback.tgl_feedback) }})
                  </span>
                  <div v-if="item.created_at" class="text-muted extra-small mt-1" style="font-size: 0.68rem; font-weight: 500;">
                      <i class="fas fa-clock me-1"></i>{{ formatDateTime(item.created_at) }}
                  </div>
                  <div class="text-secondary extra-small" style="font-size: 0.68rem; font-weight: 500;">
                      <i class="fas fa-user-edit me-1"></i>Analis: {{ item.analis ? item.analis.nama : (item.nik_analis || '-') }}
                  </div>
                </td>
                <td>
                    <div class="mb-2">
                        <small class="text-secondary d-block">PERIODE</small>
                        <span class="fw-bold">{{ formatDate(item.tanggal_awal) }} - {{ formatDate(item.tanggal_akhir) }}</span>
                    </div>
                    
                    <div class="row g-2" style="font-size: 0.85rem;">
                        <div class="col-12">
                            <div class="d-flex align-items-center justify-content-between border-bottom pb-1 mb-1">
                                <span class="text-secondary">Target</span>
                                <span class="fw-bold text-dark">{{ getStandar(item) }}</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="p-1 bg-light rounded text-center border">
                                <small class="d-block text-secondary" style="font-size: 0.7rem;">NUMERATOR</small>
                                <span class="fw-bold">{{ item.jml_num }}</span>
                            </div>
                        </div>
                         <div class="col-6">
                            <div class="p-1 bg-light rounded text-center border">
                                <small class="d-block text-secondary" style="font-size: 0.7rem;">DENOMINATOR</small>
                                <span class="fw-bold">{{ item.jml_denum }}</span>
                            </div>
                        </div>
                        <div class="col-12 mt-2">
                             <div class="d-flex align-items-center justify-content-between p-2 rounded" :class="isTercapai(item) ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                                <span class="fw-bold">Score: {{ parseFloat(item.jumlah).toFixed(2) }}%</span>
                                <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ getKesimpulanText(item) }}</span>
                            </div>
                        </div>
                        <div v-if="hasDiscrepancy(item)" class="col-12 mt-1">
                            <div class="alert alert-warning p-1 mb-0 border-0 rounded d-flex align-items-center gap-1" style="font-size: 0.7rem;">
                                <i class="fas fa-exclamation-triangle text-warning"></i>
                                <span class="text-dark">Rekap: <strong>{{ item.current_rekap.num }}/{{ item.current_rekap.denum }}</strong></span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="mb-2">
                        <strong class="d-block text-secondary" style="font-size: 0.8rem;">ANALISA:</strong>
                        <span v-html="stripHtml(item.analisa).substring(0, 100) + (item.analisa.length > 100 ? '...' : '')"></span>
                    </div>
                    <div>
                        <strong class="d-block text-secondary" style="font-size: 0.8rem;">TINDAK LANJUT:</strong>
                        <span v-html="stripHtml(item.tindak_lanjut).substring(0, 100) + (item.tindak_lanjut.length > 100 ? '...' : '')"></span>
                    </div>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-info" @click="openModal(item, true)">
                    <i class="fas fa-eye"></i> Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-white border-top py-3">
         <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              Menampilkan <span class="fw-bold text-dark">{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }}</span> dari <span class="fw-bold text-dark">{{ total }}</span> data
            </small>
            <nav aria-label="Page navigation" v-if="totalPages > 1">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: page === 1 }">
                  <button class="page-link shadow-none" @click="changePage(page - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <li class="page-item" 
                    v-for="p in displayedPages" 
                    :key="p === '...' ? 'dots-' + Math.random() : p"
                    :class="{ active: page === p, disabled: p === '...' }">
                  <button class="page-link shadow-none" @click="p !== '...' && changePage(p)">
                    {{ p }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: page === totalPages }">
                  <button class="page-link shadow-none" @click="changePage(page + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
      <div class="modal fade" id="modalAnalisa" tabindex="-1" ref="modalRef">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ isDetail ? 'Detail Analisa Data' : (isEdit ? 'Edit Analisa' : 'Buat Analisa Baru') }}
                    </h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="submitForm">
                         <div class="mb-3" v-if="!isEdit && !isDetail">
                            <label class="form-label fw-bold">Pilih Indikator</label>
                            <v-select 
                                :options="indicators" 
                                label="nama_inmut" 
                                v-model="form.id_inmut"
                                :reduce="ind => ind.id_inmut"
                                placeholder="Cari Indikator..."
                            >
                                <template #option="{ nama_inmut, nama_ruang }">
                                    <div class="d-flex flex-column">
                                        <span>{{ nama_inmut }}</span>
                                        <small class="text-muted">{{ nama_ruang }}</small>
                                    </div>
                                </template>
                            </v-select>
                        </div>
                        <div class="mb-3" v-else>
                             <div class="row">
                                <div class="col-md-7">
                                     <label class="form-label fw-bold">Indikator</label>
                                     <input type="text" class="form-control" :value="form.nama_inmut" readonly>
                                </div>
                                <div class="col-md-5">
                                     <label class="form-label fw-bold">Unit / Ruang</label>
                                     <input type="text" class="form-control" :value="form.nama_ruang" readonly>
                                </div>
                             </div>
                        </div>

                         <div class="mb-3">
                            <label class="form-label fw-bold">Periode Bulan</label>
                             <input type="month" class="form-control" v-model="form.bulan" ref="formBulanInput" :readonly="isEdit || isDetail">
                        </div>

                        <div class="row g-3 mb-3">
                             <div class="col-md-6">
                                <label class="form-label fw-bold">Total Numerator</label>
                                <input type="number" class="form-control" v-model="form.jml_num" :readonly="isDetail">
                             </div>
                              <div class="col-md-6">
                                <label class="form-label fw-bold">Total Denominator</label>
                                <input type="number" class="form-control" v-model="form.jml_denum" :readonly="isDetail">
                             </div>
                             <div v-if="!isDetail && form.current_rekap && (form.jml_num != form.current_rekap.num || form.jml_denum != form.current_rekap.denum)" class="col-12">
                                <div class="alert alert-warning d-flex align-items-center justify-content-between py-2 px-3 border-0 shadow-sm mb-0">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fas fa-sync-alt fa-spin text-warning"></i>
                                        <small class="fw-bold">Data rekap saat ini: {{ form.current_rekap.num }} / {{ form.current_rekap.denum }}</small>
                                    </div>
                                    <button type="button" class="btn btn-xs btn-warning py-0 px-2 fw-bold shadow-none" style="font-size: 0.7rem;" @click="syncData">
                                        SYNC DATA
                                    </button>
                                </div>
                             </div>
                        </div>

                        <div v-if="isDetail">
                            <div class="mb-3">
                                <label class="form-label fw-bold text-primary">HASIL ANALISA</label>
                                <div class="p-3 bg-light border rounded" v-html="form.analisa"></div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold text-primary">TINDAK LANJUT</label>
                                <div class="p-3 bg-light border rounded" v-html="form.tindak_lanjut"></div>
                            </div>

                            <hr class="my-4">

                            <!-- FEEDBACK SECTION -->
                            <div class="mb-4" :key="'feedback-' + form.id_analisa">
                                <div class="d-flex align-items-center justify-content-between mb-3 p-2 bg-primary-light rounded border">
                                    <h6 class="fw-bold mb-0 text-primary">
                                        <i class="fas fa-comment-medical me-2"></i> SUPERVISI & REKOMENDASI KOMITE
                                    </h6>
                                    <span v-if="feedbackLoading" class="spinner-border spinner-border-sm text-primary"></span>
                                </div>

                                <div v-if="isCommitteeMember" class="feedback-edit-section">
                                    <div class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold small">Tanggal Feedback</label>
                                            <input type="date" class="form-control form-control-sm" v-model="feedbackForm.tgl_feedback">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold small">Supervisi</label>
                                        <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="feedbackForm.supervisi" style="height: 120px; padding-bottom: 40px;" />
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold small">Rekomendasi / Saran</label>
                                        <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="feedbackForm.rekomendasi" style="height: 120px; padding-bottom: 40px;" />
                                    </div>
                                    <div class="text-end">
                                        <button class="btn btn-primary btn-sm px-4" @click="saveFeedback" :disabled="feedbackSaving">
                                            <i v-if="feedbackSaving" class="fas fa-spinner fa-spin me-2"></i>
                                            <i v-else class="fas fa-save me-2"></i>
                                            {{ isFeedbackExists ? 'Update Feedback' : 'Simpan Feedback' }}
                                        </button>
                                    </div>
                                </div>
                                <div v-else class="feedback-view-section">
                                    <div v-if="!feedbackForm.supervisi && !feedbackForm.rekomendasi" class="text-center py-3 text-muted border rounded bg-white">
                                        <i class="fas fa-info-circle me-1"></i> Belum ada supervisi/rekomendasi dari Komite Mutu.
                                    </div>
                                    <div v-else>
                                        <div class="mb-2 text-end">
                                            <span class="badge bg-light text-muted border py-2 px-3">
                                                <i class="fas fa-calendar-alt me-1 text-primary"></i> 
                                                Tanggal Feedback: <span class="text-dark fw-bold">{{ formatDate(feedbackForm.tgl_feedback) }}</span>
                                            </span>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold small text-secondary">Supervisi:</label>
                                            <div class="p-3 bg-white border rounded" v-html="feedbackForm.supervisi || '-'"></div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold small text-secondary">Rekomendasi:</label>
                                            <div class="p-3 bg-white border rounded" v-html="feedbackForm.rekomendasi || '-'"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-else>
                             <div class="mb-3">
                                <label class="form-label fw-bold">Analisa</label>
                                <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.analisa" style="height: 150px; padding-bottom: 40px;" />
                            </div>

                             <div class="mb-3">
                                <label class="form-label fw-bold">Tindak Lanjut</label>
                                <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.tindak_lanjut" style="height: 150px; padding-bottom: 40px;" />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <div class="footer-info">
                        <span v-if="isCommitteeMember" class="badge bg-info-subtle text-info border px-3">
                            <i class="fas fa-user-shield me-1"></i> Akses Komite Aktif
                        </span>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Tutup</button>
                        <button v-if="!isDetail" type="button" class="btn btn-primary" @click="submitForm" :disabled="submitting">
                            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                            Simpan
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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { Modal } from 'bootstrap'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const authStore = useAuthStore()

const toast = useToast()
const items = ref([])
const units = ref([])
const indicators = ref([]) // For select dropdown
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const modalRef = ref(null)
let modalInstance = null

const displayedPages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const delta = 1 // Number of pages around current
    const range = []
    
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        } else if (range[range.length - 1] !== '...') {
            range.push('...')
        }
    }
    return range
})


const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    unit: null,
    keyword: ''
})

let timeout = null
const debounceFetch = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        page.value = 1
        fetchData()
    }, 500)
}

// === MONITORING STATS STATE ===
const allAssignments = ref([])
const pendingAnalyses = ref([])
const showPendingList = ref(false)
const loadingStats = ref(false)

const pendingStats = computed(() => {
    const total = pendingAnalyses.value.length
    const uniqueRooms = new Set(pendingAnalyses.value.map(p => p.dep_id)).size
    const uniqueInmuts = new Set(pendingAnalyses.value.map(p => p.id_inmut)).size
    return { total, uniqueRooms, uniqueInmuts }
})

const sortedPendingAnalyses = computed(() => {
    return [...pendingAnalyses.value].sort((a, b) => {
        // Sort by room name first
        const roomA = a.nama_ruang || ''
        const roomB = b.nama_ruang || ''
        if (roomA !== roomB) return roomA.localeCompare(roomB)
        
        // Then by indicator name
        const inmutA = a.nama_inmut || ''
        const inmutB = b.nama_inmut || ''
        return inmutA.localeCompare(inmutB)
    })
})




const isEdit = ref(false)
const form = reactive({
    id_analisa: null,
    id_inmut: null,
    nama_inmut: '',
    bulan: new Date().toISOString().slice(0, 7),
    jml_num: 0,
    jml_denum: 0,
    analisa: '',
    tindak_lanjut: '',
    current_rekap: null
})

// === FEEDBACK STATE ===
const isCommitteeMember = ref(false)
const feedbackSaving = ref(false)
const feedbackLoading = ref(false)
const isFeedbackExists = ref(false)
const feedbackForm = reactive({
    supervisi: '',
    rekomendasi: '',
    tgl_feedback: new Date().toISOString().split('T')[0]
})

const checkCommittee = async () => {
    const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
    if (userNik) {
        try {
            const commRes = await committeeService.getByNik(userNik)
            const committees = commRes.data.data || []
            
            // Check if user is in "PMKP" committee specifically
            if (committees.length > 0) {
                const isPmkp = committees.some(c => {
                    const name = (c.komite?.nama || c.nama || '').toUpperCase()
                    return name.includes('PMKP') || name.includes('MUTU')
                })
                isCommitteeMember.value = isPmkp
            }
        } catch (error) {
            console.error('Error checking committee:', error)
        }
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetching units:', error)
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
            keyword: filters.keyword
        }
        const response = await api.getAnalisa(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data analisa')
    } finally {
        loading.value = false
    }
}

const fetchIndicators = async () => {
     try {
         // Reusing getRuang from service (Master Ruang) for indicators, checking status active
         // Ideally should have a dedicated endpoint for searching ALL active indicators
         // Using getRuang for now as it lists indicators + master utama details
         const params = { limit: 1000, status: 1 } 
         const response = await api.getRuang(params)
         indicators.value = response.data.data.data // Accessing paginated data
         
         // Also update allAssignments for monitoring stats
         allAssignments.value = response.data.data.data || []
    } catch (error) {
        console.error('Error indicators', error)
    }
}

const calculatePendingAnalyses = async () => {
    if (allAssignments.value.length === 0) await fetchIndicators()
    
    loadingStats.value = true
    try {
        // Fetch ALL analyses for the selected month to check completeness
        const params = {
            bulan: filters.bulan,
            limit: 1000 // Get all for comparison
        }
        const response = await api.getAnalisa(params)
        const submitted = response.data.data.data || []
        
        // Create a unique key for comparison: dep_id + id_inmut
        const submittedKeys = new Set(submitted.map(s => `${s.dep_id}_${s.id_inmut}`))
        
        // Filter assignments that are NOT in the submitted list
        pendingAnalyses.value = allAssignments.value.filter(ass => {
            const key = `${ass.dep_id}_${ass.id_inmut}`
            return !submittedKeys.has(key)
        })
    } catch (error) {
        console.error('Error calculating pending analyses:', error)
    } finally {
        loadingStats.value = false
    }
}


const getRumusSymbol = (val) => {
    const map = {
        '1': '=',
        '2': '≤',
        '3': '<',
        '4': '≥',
        '5': '>'
    }
    return map[val] || val || ''
}

const getStandar = (item) => {
    const ind = item.indikator;
    if (!ind) return '-';
    
    // Attempt to access relation. In JSON it usually becomes snake_case 'master_utama'
    const utama = ind.master_utama || ind.masterUtama; 
    
    const std = (utama && utama.standar) ? utama.standar : ind.standar;
    const rumus = (utama && utama.rumus) ? utama.rumus : ind.rumus;
    const satuan = (utama && utama.satuan) ? utama.satuan : ind.satuan;
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`;
}



const getKesimpulanText = (item) => {
    return isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai';
}

const getKesimpulanClass = (item) => {
    return isTercapai(item) ? 'bg-success' : 'bg-danger';
}

const isTercapai = (item) => {
    const ind = item.indikator;
    if (!ind) return false;
    
    // Logic similar to getStandar
    const utama = ind.master_utama || ind.masterUtama;
    const std = parseFloat((utama && utama.standar) ? utama.standar : ind.standar);
    const rumus = String((utama && utama.rumus) ? utama.rumus : ind.rumus);
    
    const score = parseFloat(item.jumlah);
    
    if (isNaN(std)) return false;

    switch (rumus) {
        case '1': return score == std; // =
        case '2': return score <= std; // <=
        case '3': return score < std; // <
        case '4': return score >= std; // >=
        case '5': return score > std; // >
        default: return false;
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const stripHtml = (html) => {
   if (!html) return ''
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

const hasDiscrepancy = (item) => {
    if (!item.current_rekap) return false
    return item.jml_num != item.current_rekap.num || item.jml_denum != item.current_rekap.denum
}

const syncData = () => {
    if (form.current_rekap) {
        form.jml_num = form.current_rekap.num
        form.jml_denum = form.current_rekap.denum
        toast.info('Data telah disinkronkan dengan rekap terbaru')
    }
}

const formatDate = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateTime = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateFull = (monthStr) => {
    if (!monthStr) return '-'
    const [year, month] = monthStr.split('-')
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${monthNames[parseInt(month) - 1]} ${year}`
}


const isDetail = ref(false)

const openModal = async (item, detail = false) => {
    if (!indicators.value.length) await fetchIndicators()
    
    isDetail.value = detail
    
    if (item) {
        isEdit.value = true
        form.id_analisa = item.id_analisa
        form.id_inmut = item.id_inmut
        form.nama_inmut = item.nama_inmut // For display
        form.nama_ruang = item.nama_ruang // For display
        
        // Fix: Use Date object to handle timezone shift instead of raw string slice
        const d = new Date(item.tanggal_awal);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        form.bulan = `${year}-${month}`;

        form.jml_num = item.jml_num
        form.jml_denum = item.jml_denum
        form.analisa = item.analisa
        form.tindak_lanjut = item.tindak_lanjut
        form.current_rekap = item.current_rekap || null
        
        // Fetch Feedback
        await fetchFeedback(item.id_analisa)
    } else {
        isEdit.value = false
        // ... (reset form items)
        form.id_analisa = null
        form.id_inmut = null
        form.nama_inmut = ''
        form.bulan = filters.bulan
        form.jml_num = 0
        form.jml_denum = 0
        form.analisa = ''
        form.tindak_lanjut = ''
        
        resetFeedbackForm()
    }

    if (!modalInstance) {
        modalInstance = new Modal(modalRef.value)
    }
    modalInstance.show()
}

const closeModal = () => {
    if (modalInstance) modalInstance.hide()
}

const submitForm = async () => {
    if (!form.analisa || !form.tindak_lanjut) {
        toast.warning('Analisa dan Tindak Lanjut wajib diisi')
        return
    }

    submitting.value = true
    try {
        if (isEdit.value) {
            await api.updateAnalisa(form.id_analisa, form)
            toast.success('Analisa berhasil diperbarui')
        } else {
            await api.createAnalisa(form)
            toast.success('Analisa berhasil dibuat')
        }
        closeModal()
        fetchData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan analisa')
    } finally {
        submitting.value = false
    }
}

const deleteItem = async (id) => {
    if(confirm('Apakah Anda yakin ingin menghapus analisa ini?')) {
        try {
            await api.deleteAnalisa(id)
            toast.success('Analisa berhasil dihapus')
            fetchData()
        } catch (error) {
            toast.error('Gagal menghapus data')
        }
    }
}

const fetchFeedback = async (id_analisa) => {
    resetFeedbackForm()
    feedbackLoading.value = true
    try {
        const response = await api.getFeedback(id_analisa)
        if (response.data.success && response.data.data) {
            feedbackForm.supervisi = response.data.data.supervisi || ''
            feedbackForm.rekomendasi = response.data.data.rekomendasi || ''
            feedbackForm.tgl_feedback = response.data.data.tgl_feedback ? response.data.data.tgl_feedback.slice(0, 10) : new Date().toISOString().split('T')[0]
            isFeedbackExists.value = true
        }
    } catch (error) {
        console.error('Error fetching feedback:', error)
    } finally {
        feedbackLoading.value = false
    }
}

const saveFeedback = async () => {
    if (!form.id_analisa) return
    
    feedbackSaving.value = true
    try {
        const payload = {
            id_analisa: form.id_analisa,
            supervisi: feedbackForm.supervisi,
            rekomendasi: feedbackForm.rekomendasi,
            tgl_feedback: feedbackForm.tgl_feedback
        }
        await api.storeFeedback(payload)
        toast.success('Supervisi & Rekomendasi berhasil disimpan')
        fetchData() // Refresh list data to show updated feedback date/status
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan feedback')
    } finally {
        feedbackSaving.value = false
    }
}

const resetFeedbackForm = () => {
    feedbackForm.supervisi = ''
    feedbackForm.rekomendasi = ''
    feedbackForm.tgl_feedback = new Date().toISOString().split('T')[0]
    isFeedbackExists.value = false
}

watch(() => filters.bulan, () => {
    calculatePendingAnalyses()
})


onMounted(async () => {
    fetchUnits()
    fetchData()
    checkCommittee()
    
    // Initial fetch for monitoring stats
    await fetchIndicators()
    calculatePendingAnalyses()
})
</script>

<style scoped>
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  padding: 2px 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    margin-top: 1rem !important;
  }

  .date-filter {
    max-width: 100% !important;
    width: 100% !important;
  }

  .unit-select {
    min-width: 100% !important;
    width: 100% !important;
  }

  .refresh-btn {
    width: 100% !important;
  }

  /* Pagination */
  .card-footer .d-flex {
    flex-direction: column !important;
    gap: 0.75rem !important;
    align-items: flex-start !important;
  }

  .pagination {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
  }

  .pagination .page-item {
    flex-shrink: 0 !important;
  }

  .pagination .page-link {
    font-size: 0.75rem !important;
    padding: 0.375rem 0.5rem !important;
  }
}

/* Stats Styles */
.bg-warning-subtle { background-color: #fff9db !important; }
.bg-success-subtle { background-color: #ebfbee !important; }
.text-warning-emphasis { color: #856404 !important; }
.text-success-emphasis { color: #155724 !important; }

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.hover-elevate:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>


<style>
/* Fallback for Bootstrap versions < 5.3 */
.bg-success-subtle { background-color: #d1e7dd !important; }
.text-success-emphasis { color: #0a3622 !important; }
.bg-danger-subtle { background-color: #f8d7da !important; }
.text-danger-emphasis { color: #58151c !important; }
</style>
