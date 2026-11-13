<template>
  <div class="tindak-lanjut-page">
    <!-- Hero Header with Metrics -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="title-text">
            <h1>Tindak Lanjut Rapat</h1>
            <p>Monitoring realisasi tugas, progres capaian, dan evaluasi hasil pertemuan RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="stats-section">
          <div class="stat-card" :class="{ 'active': activeTab === 'all' }" @click="setTab('all')">
            <div class="stat-icon bg-blue-500/20 text-blue-200"><i class="fas fa-tasks"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">Total Tugas</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'active': activeTab === 'active' }" @click="setTab('active')">
            <div class="stat-icon bg-amber-500/20 text-amber-200"><i class="fas fa-spinner fa-pulse"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.active }}</span>
              <span class="stat-label">Sedang Berjalan</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'active': activeTab === 'overdue' }" @click="setTab('overdue')">
            <div class="stat-icon bg-rose-500/20 text-rose-200"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.overdue }}</span>
              <span class="stat-label">Lewat Deadline</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'active': activeTab === 'completed' }" @click="setTab('completed')">
            <div class="stat-icon bg-emerald-500/20 text-emerald-200"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.completed }}</span>
              <span class="stat-label">Selesai</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar & Filters -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Left Controls: Scope & Status Tabs -->
        <div class="action-left-controls">
          <!-- Scope Toggle for Privileged (Admin/Direksi/Diklat) -->
          <div v-if="isPrivileged" class="scope-toggle-group">
            <button 
              class="scope-btn" 
              :class="{ active: viewScope === 'mine' }" 
              @click="setViewScope('mine')"
              title="Hanya menampilkan tugas yang ditugaskan kepada saya"
            >
              <i class="fas fa-user-check mr-1.5 text-blue-500"></i> Tugas Saya
            </button>
            <button 
              class="scope-btn" 
              :class="{ active: viewScope === 'all' }" 
              @click="setViewScope('all')"
              title="Tampilkan seluruh tindak lanjut rapat rumah sakit"
            >
              <i class="fas fa-layer-group mr-1.5"></i> Semua Tugas RS
            </button>
          </div>

          <!-- Scope Badge for Regular Employees -->
          <div v-else class="scope-badge-regular">
            <i class="fas fa-user-shield text-blue-600 mr-1.5"></i>
            <span class="font-bold text-slate-700">Tugas Saya</span>
            <span class="text-xs text-slate-500 hidden sm:inline">(Sebagai PIC)</span>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs-wrapper">
            <button class="tab-btn" :class="{ active: activeTab === 'all' }" @click="setTab('all')">
              Semua
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'active' }" @click="setTab('active')">
              <i class="fas fa-play-circle mr-1 text-blue-500"></i> Berjalan
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'overdue' }" @click="setTab('overdue')">
              <i class="fas fa-fire mr-1 text-rose-500"></i> Terlambat
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'completed' }" @click="setTab('completed')">
              <i class="fas fa-check-double mr-1 text-emerald-500"></i> Selesai
            </button>
          </div>
        </div>

        <!-- Search Box & Refresh on Right -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari tugas, PIC, atau agenda rapat..." 
              @input="handleSearch"
            >
            <button v-if="searchQuery" class="clear-search" @click="clearSearch" title="Hapus Pencarian">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <button class="btn-refresh" @click="fetchData(pagination.current_page)" title="Muat Ulang Data">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Table Card -->
    <div class="card-modern">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="spinner-modern mb-3 mx-auto"></div>
        <p class="text-sm text-slate-500 font-semibold">Memuat daftar tindak lanjut rapat...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="taskList.length === 0" class="empty-state py-16 text-center">
        <div class="empty-icon-wrap mb-3 mx-auto">
          <i class="fas fa-clipboard-check text-4xl text-slate-300"></i>
        </div>
        <h4 class="text-base font-bold text-slate-700 mb-1">Tidak Ada Tindak Lanjut</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          {{ searchQuery ? 'Tidak ditemukan tugas yang sesuai dengan kata kunci pencarian Anda.' : 'Saat ini belum ada tugas tindak lanjut rapat dalam kategori ini.' }}
        </p>
        <button v-if="searchQuery" class="btn-reset-filter" @click="clearSearch">
          Reset Pencarian
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="4%">No</th>
              <th width="28%">Uraian Tugas (Action Item)</th>
              <th width="24%">Asal Pertemuan / Rapat</th>
              <th width="16%">Penanggung Jawab (PIC)</th>
              <th width="14%">Batas Waktu</th>
              <th width="14%" class="text-center">Progres & Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(task, index) in taskList" 
              :key="task.id" 
              class="table-row-hover"
              @click="openDetail(task)"
            >
              <td class="text-muted font-bold text-xs">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              
              <!-- Uraian Tugas -->
              <td>
                <div class="task-title-cell">
                  <div class="task-desc-text" v-html="stripHtml(task.tugas)"></div>
                  <div class="task-sub-info">
                    <span class="status-pill" :class="getStatusBadgeClass(task)">
                      {{ getStatusLabel(task) }}
                    </span>
                    <span v-if="task.feedbacks && task.feedbacks.length > 0" class="badge-comment-count">
                      <i class="fas fa-comments mr-1"></i> {{ task.feedbacks.length }} respon
                    </span>
                  </div>
                </div>
              </td>

              <!-- Asal Pertemuan -->
              <td>
                <div class="meeting-origin-cell">
                  <div class="meeting-title" v-if="task.undangan">
                    {{ task.undangan.perihal || 'Agenda Rapat' }}
                  </div>
                  <div class="meeting-title text-slate-400 italic" v-else>
                    Rapat Terkait
                  </div>

                  <div class="meeting-meta-row">
                    <span class="no-surat-tag" v-if="task.undangan?.no_surat || task.undangan?.surat?.no_surat">
                      <i class="fas fa-file-alt mr-1"></i>
                      {{ task.undangan.no_surat || task.undangan.surat?.no_surat }}
                    </span>
                    <span class="meeting-date" v-if="task.undangan?.tanggal">
                      <i class="far fa-calendar-alt mr-1"></i>
                      {{ formatSimpleDate(task.undangan.tanggal) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- PIC -->
              <td>
                <div class="pic-cell">
                  <div class="pic-avatar" :class="isCurrentUserPic(task) ? 'pic-avatar-me' : ''">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="pic-details">
                    <span class="pic-name">
                      {{ task.pic?.nama || task.pic_nik }}
                      <span v-if="isCurrentUserPic(task)" class="badge-me">Anda</span>
                    </span>
                    <span class="pic-nik">NIK. {{ task.pic_nik }}</span>
                  </div>
                </div>
              </td>

              <!-- Deadline -->
              <td>
                <div class="deadline-cell">
                  <span class="deadline-date">
                    <i class="far fa-clock mr-1 text-slate-400"></i>
                    {{ formatSimpleDate(task.deadline) }}
                  </span>
                  <span class="deadline-badge" :class="getDeadlineBadgeClass(task)">
                    {{ getDeadlineCountdown(task) }}
                  </span>
                </div>
              </td>

              <!-- Progress & Action -->
              <td class="text-center" @click.stop>
                <div class="progress-action-cell">
                  <!-- Progress Bar -->
                  <div class="progress-wrap">
                    <div class="progress-bar-bg">
                      <div 
                        class="progress-bar-fill" 
                        :class="getProgressBarClass(task.progress_percent)"
                        :style="{ width: (task.progress_percent || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ task.progress_percent || 0 }}%</span>
                  </div>

                  <!-- Open Button -->
                  <button class="btn-open-task" @click="openDetail(task)" title="Buka Detail dan Laporan Progres">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="taskList.length > 0" class="pagination-container">
        <div class="pagination-info">
          Menampilkan {{ (pagination.current_page - 1) * pagination.per_page + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} tugas
        </div>
        <div class="pagination-controls">
          <button class="btn-page" :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="btn-page-number" 
              :class="{ active: page === pagination.current_page }" 
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button class="btn-page" :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL & DIALOG PROGRES TINDAK LANJUT -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content-lg" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-header-icon">
              <i class="fas fa-tasks text-emerald-600"></i>
            </div>
            <div>
              <h3 class="modal-title">Detail Tindak Lanjut Rapat</h3>
              <p class="modal-subtitle" v-if="activeTask?.undangan?.perihal">
                {{ activeTask.undangan.perihal }}
              </p>
            </div>
          </div>
          <button class="btn-close-modal" @click="closeDetailModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body: 2 Columns Layout -->
        <div class="modal-body-grid" v-if="activeTask">
          <!-- LEFT COLUMN: Task Details & Progress Slider -->
          <div class="modal-col-task">
            <!-- Task Uraian Card -->
            <div class="section-card">
              <div class="section-card-header">
                <i class="fas fa-align-left text-blue-500 mr-1.5"></i>
                <span>Uraian Tugas / Action Item</span>
              </div>
              <div class="task-description-box" v-html="activeTask.tugas"></div>
            </div>

            <!-- Meta Details Grid -->
            <div class="meta-cards-grid">
              <div class="meta-mini-card">
                <span class="meta-card-label">Penanggung Jawab (PIC)</span>
                <span class="meta-card-val font-bold text-slate-800">{{ activeTask.pic?.nama || activeTask.pic_nik }}</span>
                <span class="meta-card-sub text-xs text-slate-500">NIK. {{ activeTask.pic_nik }}</span>
              </div>

              <div class="meta-mini-card">
                <span class="meta-card-label">Batas Waktu (Deadline)</span>
                <span class="meta-card-val font-bold text-slate-800">{{ formatSimpleDate(activeTask.deadline) }}</span>
                <span class="deadline-badge mt-1" :class="getDeadlineBadgeClass(activeTask)">
                  {{ getDeadlineCountdown(activeTask) }}
                </span>
              </div>
            </div>

            <!-- Interactive Progress Controller -->
            <div class="section-card progress-controller-card">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm text-slate-800 flex items-center">
                  <i class="fas fa-chart-line text-emerald-600 mr-2"></i>
                  Capaian Progres Saat Ini
                </span>
                <span class="progress-big-number" :class="getProgressBarClass(activeTask.progress_percent)">
                  {{ activeTask.progress_percent || 0 }}%
                </span>
              </div>

              <!-- Visual Slider for PIC / Privileged -->
              <div class="slider-container" v-if="canEditProgress">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5" 
                  v-model.number="replyForm.progress_percent" 
                  class="progress-range-slider"
                >
                <div class="slider-ticks">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100% Selesai</span>
                </div>
              </div>
              <div v-else class="progress-bar-static mb-2">
                <div 
                  class="progress-bar-fill" 
                  :class="getProgressBarClass(activeTask.progress_percent)"
                  :style="{ width: (activeTask.progress_percent || 0) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Feedback / Reply Input Form -->
            <div class="section-card form-reply-card">
              <div class="section-card-header mb-3">
                <i class="fas fa-comment-dots text-blue-500 mr-1.5"></i>
                <span>Kirim Laporan Progres / Komentar</span>
              </div>

              <!-- Feedback Type Selector -->
              <div class="feedback-type-tabs mb-3">
                <button 
                  type="button" 
                  class="type-tab-btn" 
                  :class="{ active: replyForm.tipe === 'update_progress' }" 
                  @click="replyForm.tipe = 'update_progress'"
                >
                  <i class="fas fa-tasks mr-1"></i> Update Progres
                </button>
                <button 
                  type="button" 
                  class="type-tab-btn" 
                  :class="{ active: replyForm.tipe === 'komentar' }" 
                  @click="replyForm.tipe = 'komentar'"
                >
                  <i class="fas fa-comment mr-1"></i> Catatan / Diskusi
                </button>
                <button 
                  type="button" 
                  class="type-tab-btn" 
                  :class="{ active: replyForm.tipe === 'approval' }" 
                  @click="replyForm.tipe = 'approval'"
                  v-if="isPrivileged"
                >
                  <i class="fas fa-check-circle mr-1"></i> Verifikasi / Selesai
                </button>
              </div>

              <!-- Comment Textarea -->
              <div class="form-group mb-3">
                <textarea 
                  v-model="replyForm.komentar" 
                  rows="3" 
                  class="form-textarea-modern" 
                  placeholder="Tuliskan keterangan capaian kerja, tindak lanjut yang telah dilakukan, atau catatan evaluasi..."
                ></textarea>
              </div>

              <!-- File Attachment Upload -->
              <div class="form-group mb-4">
                <label class="form-label-sub">
                  <i class="fas fa-paperclip mr-1 text-slate-400"></i> Lampirkan Bukti Berkas / Foto (Opsional)
                </label>
                <div class="file-upload-box">
                  <input 
                    type="file" 
                    id="feedbackFile" 
                    @change="handleFileUpload" 
                    accept="image/*,.pdf,.doc,.docx" 
                    class="hidden-file-input"
                  >
                  <label for="feedbackFile" class="file-drop-area">
                    <i class="fas fa-cloud-upload-alt text-xl text-blue-500 mb-1"></i>
                    <span v-if="!selectedFile" class="text-xs text-slate-600 font-semibold">Klik untuk memilih file lampiran (PDF/Foto)</span>
                    <span v-else class="text-xs text-emerald-600 font-bold flex items-center">
                      <i class="fas fa-check mr-1"></i> {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                    </span>
                  </label>
                  <button v-if="selectedFile" @click="selectedFile = null" class="btn-remove-file" title="Hapus File">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                class="btn-submit-reply" 
                :disabled="submittingReply || (!replyForm.komentar && !selectedFile)" 
                @click="submitReply"
              >
                <i class="fas fa-paper-plane mr-1.5" v-if="!submittingReply"></i>
                <div class="mini-spinner mr-2" v-else></div>
                <span>{{ submittingReply ? 'Mengirimkan...' : 'Kirim Laporan Progres' }}</span>
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN: Activity Feed & Discussion Thread -->
          <div class="modal-col-thread">
            <div class="thread-header">
              <i class="fas fa-history text-slate-500 mr-2"></i>
              <span class="font-bold text-slate-800">Riwayat Progres & Diskusi</span>
              <span class="badge-count ml-auto">{{ activeTask.feedbacks?.length || 0 }}</span>
            </div>

            <!-- Feed Items List -->
            <div class="thread-body" v-if="activeTask.feedbacks && activeTask.feedbacks.length > 0">
              <div 
                v-for="feed in activeTask.feedbacks" 
                :key="feed.id" 
                class="thread-item"
              >
                <!-- Avatar -->
                <div class="thread-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>

                <!-- Feed Content Box -->
                <div class="thread-bubble">
                  <div class="thread-bubble-header">
                    <span class="user-name">{{ feed.user?.nama || feed.user_nik }}</span>
                    <span class="badge-type-pill" :class="getFeedbackPillClass(feed.tipe)">
                      {{ getFeedbackTypeLabel(feed.tipe) }}
                    </span>
                    <span class="time-text">{{ formatTimeAgo(feed.created_at) }}</span>
                  </div>

                  <!-- Text Comment -->
                  <div class="thread-text" v-if="feed.komentar">
                    {{ feed.komentar }}
                  </div>

                  <!-- File Download Badge if exists -->
                  <div class="thread-attachment" v-if="feed.file || feed.berkas">
                    <button class="btn-download-attachment" @click="downloadAttachment(feed.id)">
                      <i class="fas fa-file-download mr-1.5 text-blue-600"></i>
                      <span>Unduh Lampiran Bukti</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Thread State -->
            <div v-else class="empty-thread-state py-12 text-center">
              <div class="empty-thread-icon mb-2">
                <i class="far fa-comments text-3xl text-slate-300"></i>
              </div>
              <p class="text-xs text-slate-500">Belum ada riwayat update atau diskusi pada tugas ini.</p>
              <span class="text-xxs text-slate-400">Jadilah yang pertama menuliskan laporan progres.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import tindakLanjutService from '@/services/tindakLanjutService'
import debounce from 'lodash/debounce'

const toast = useToast()
const authStore = useAuthStore()

// State
const taskList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref('all') // 'all', 'active', 'overdue', 'completed'
const viewScope = ref('mine')

const stats = ref({
  total: 0,
  active: 0,
  completed: 0,
  overdue: 0
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

// Modal Detail State
const showDetailModal = ref(false)
const activeTask = ref(null)
const submittingReply = ref(false)
const selectedFile = ref(null)

const replyForm = ref({
  tipe: 'update_progress',
  komentar: '',
  progress_percent: 0
})

// User & Privileges
const isPrivileged = computed(() => {
  const role = (authStore.userRole || '').toLowerCase()
  const activeRole = (authStore.activeRole?.nama_role || '').toLowerCase()
  const jbtn = (authStore.user?.detail?.jbtn || '').toLowerCase()
  const jnj = (authStore.user?.detail?.jnj_jabatan || '').toUpperCase()
  const dept = (authStore.userDepartment || authStore.user?.detail?.departemen || '').toLowerCase()

  const privilegedKeywords = ['super admin', 'administrator', 'direktur', 'wakil direktur', 'diklat']
  const isRolePrivileged = privilegedKeywords.some(r => 
    role.includes(r) || activeRole.includes(r)
  )
  const isPositionPrivileged = jbtn.includes('direktur') || jbtn.includes('diklat') || dept.includes('diklat') || ['RS1', 'WD'].includes(jnj)
  return isRolePrivileged || isPositionPrivileged
})

const currentUserNik = computed(() => {
  return authStore.user?.detail?.nik || authStore.user?.data?.detail?.nik || authStore.user?.id_user || authStore.user?.nik || ''
})

const isCurrentUserPic = (task) => {
  return currentUserNik.value && task.pic_nik === currentUserNik.value
}

const canEditProgress = computed(() => {
  if (!activeTask.value) return false
  return isPrivileged.value || isCurrentUserPic(activeTask.value)
})

onMounted(() => {
  if (!authStore.user) {
    authStore.initAuth()
  }
  // Default to 'mine' for personal tasks, 'all' if user is management
  viewScope.value = isPrivileged.value ? 'all' : 'mine'
  fetchData()
})

const setScope = (scope) => {
  if (viewScope.value === scope) return
  viewScope.value = scope
  pagination.value.current_page = 1
  fetchData(1)
}

const setViewScope = (scope) => {
  setScope(scope)
}

const setTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  pagination.value.current_page = 1
  fetchData(1)
}

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page: page,
      per_page: pagination.value.per_page,
      scope: viewScope.value,
      status: activeTab.value,
      search: searchQuery.value || undefined
    }

    const response = await tindakLanjutService.getAll(params)
    if (response.data) {
      taskList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: taskList.value.length
      }
      if (response.data.stats) {
        stats.value = response.data.stats
      }
    }
  } catch (error) {
    console.error('Failed to load tindak lanjut:', error)
    toast.error('Gagal memuat daftar tindak lanjut')
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  pagination.value.current_page = 1
  fetchData(1)
}, 500)

const clearSearch = () => {
  searchQuery.value = ''
  fetchData(1)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchData(page)
  }
}

// Modal Detail Handlers
const openDetail = async (task) => {
  try {
    activeTask.value = task
    showDetailModal.value = true
    replyForm.value.progress_percent = task.progress_percent || 0
    replyForm.value.komentar = ''
    replyForm.value.tipe = 'update_progress'
    selectedFile.value = null

    // Fetch fresh detail with all feedbacks
    const res = await tindakLanjutService.getDetail(task.id)
    if (res.data?.data) {
      activeTask.value = res.data.data
      replyForm.value.progress_percent = res.data.data.progress_percent || 0
    }
  } catch (e) {
    console.error('Failed to fetch detail:', e)
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  activeTask.value = null
  selectedFile.value = null
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const submitReply = async () => {
  if (!activeTask.value) return
  submittingReply.value = true

  try {
    const formData = new FormData()
    formData.append('tipe', replyForm.value.tipe)
    if (replyForm.value.komentar) {
      formData.append('komentar', replyForm.value.komentar)
    }
    if (replyForm.value.progress_percent !== undefined) {
      formData.append('progress_percent', replyForm.value.progress_percent)
    }
    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
      formData.append('berkas', selectedFile.value)
    }

    const res = await tindakLanjutService.reply(activeTask.value.id, formData)
    if (res.data?.success || res.status === 200 || res.status === 201) {
      toast.success('Laporan tindak lanjut berhasil dikirim!')
      
      // Refresh task detail
      const updated = await tindakLanjutService.getDetail(activeTask.value.id)
      if (updated.data?.data) {
        activeTask.value = updated.data.data
      }

      // Reset form
      replyForm.value.komentar = ''
      selectedFile.value = null

      // Refresh list in background
      fetchData(pagination.value.current_page)
    }
  } catch (error) {
    console.error('Failed to post reply:', error)
    toast.error('Gagal mengirimkan laporan: ' + (error.response?.data?.message || error.message))
  } finally {
    submittingReply.value = false
  }
}

const downloadAttachment = async (feedbackId) => {
  try {
    const res = await tindakLanjutService.downloadFile(feedbackId)
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `lampiran_tindak_lanjut_${feedbackId}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    toast.error('Gagal mengunduh berkas lampiran')
  }
}

// Formatters & Helpers
const stripHtml = (html) => {
  if (!html) return '-'
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const formatSimpleDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now - d) / 1000)

  if (diffSec < 60) return 'Baru saja'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getDeadlineCountdown = (task) => {
  if (!task.deadline) return 'Tanpa Batas'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadline = new Date(task.deadline)
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if ((task.progress_percent || 0) >= 100) return 'Tercapai'
  if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`
  if (diffDays === 0) return 'Hari Ini'
  if (diffDays === 1) return 'Besok'
  return `${diffDays} hari lagi`
}

const getDeadlineBadgeClass = (task) => {
  if ((task.progress_percent || 0) >= 100) return 'deadline-done'
  if (!task.deadline) return 'deadline-neutral'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadline = new Date(task.deadline)
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'deadline-overdue'
  if (diffDays <= 2) return 'deadline-urgent'
  return 'deadline-normal'
}

const getStatusLabel = (task) => {
  const p = task.progress_percent || 0
  if (p >= 100 || ['selesai', 'completed'].includes(task.status)) return 'Selesai'
  if (p > 0 || task.status === 'in_progress') return 'Dikerjakan'
  return 'Menunggu'
}

const getStatusBadgeClass = (task) => {
  const p = task.progress_percent || 0
  if (p >= 100 || ['selesai', 'completed'].includes(task.status)) return 'status-done'
  if (p > 0) return 'status-progress'
  return 'status-pending'
}

const getProgressBarClass = (percent) => {
  const p = percent || 0
  if (p >= 100) return 'bg-emerald-500'
  if (p >= 50) return 'bg-blue-500'
  if (p > 0) return 'bg-amber-500'
  return 'bg-slate-300'
}

const getFeedbackTypeLabel = (type) => {
  if (type === 'approval') return 'Verifikasi / Selesai'
  if (type === 'komentar') return 'Catatan'
  return 'Update Progres'
}

const getFeedbackPillClass = (type) => {
  if (type === 'approval') return 'pill-approval'
  if (type === 'komentar') return 'pill-comment'
  return 'pill-progress'
}

const displayedPages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  return pages
})
</script>

<style scoped>
.tindak-lanjut-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

/* Hero Header */
.hero-header {
  border-radius: 20px;
  padding: 2rem 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -30%; right: -10%;
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.title-section { display: flex; align-items: center; gap: 1.5rem; }

.icon-box {
  width: 60px; height: 60px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.title-text h1 { font-size: 1.65rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.02em; }
.title-text p { color: #d1fae5; margin: 0; font-size: 0.9rem; opacity: 0.95; }

.stats-section { display: flex; gap: 1rem; flex-wrap: wrap; }

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.85rem 1.25rem;
  display: flex; align-items: center; gap: 1rem;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.stat-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}
.stat-card.active {
  background: white;
  border-color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}
.stat-card.active .stat-value { color: #065f46; }
.stat-card.active .stat-label { color: #64748b; }

.stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 800; line-height: 1; margin-bottom: 0.2rem; }
.stat-label { font-size: 0.65rem; color: #d1fae5; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }

/* Action Bar */
.action-bar-modern { margin-bottom: 1.25rem; }
.action-bar-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }

.action-left-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.scope-toggle-group {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
  border: 1px solid #cbd5e1;
}

.scope-btn {
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.scope-btn:hover { color: #0f172a; }
.scope-btn.active {
  background: #047857;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(4, 120, 87, 0.25);
}
.scope-btn.active i { color: #a7f3d0 !important; }

.scope-badge-regular {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #047857;
}

.filter-tabs-wrapper {
  display: flex;
  background: #e2e8f0;
  padding: 4px;
  border-radius: 14px;
  gap: 4px;
}

.tab-btn {
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: #0f172a; }
.tab-btn.active {
  background: white;
  color: #047857;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.search-filter-group { display: flex; gap: 0.75rem; align-items: center; flex: 1; justify-content: flex-end; }
.search-box { position: relative; flex: 1; max-width: 360px; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.85rem; }
.search-box input {
  width: 100%; padding: 0.65rem 2.5rem 0.65rem 2.4rem;
  border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 0.85rem; transition: all 0.2s;
  background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.search-box input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); }

.clear-search {
  position: absolute; right: 0.65rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: #94a3b8; cursor: pointer;
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
}

.btn-refresh {
  width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; color: #475569; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-refresh:hover { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }

/* Table Container & Modern Table */
.card-modern {
  background: white; border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  overflow: hidden; border: 1px solid #e2e8f0;
}
.table-container { overflow-x: auto; min-height: 400px; }
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.modern-table th {
  background: #f8fafc; color: #475569; font-weight: 800; font-size: 0.72rem;
  text-transform: uppercase; letter-spacing: 0.08em; padding: 1.1rem 1.25rem;
  text-align: left; border-bottom: 2px solid #e2e8f0;
}
.modern-table td { padding: 1.15rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row-hover:hover { background-color: #f8fafc; cursor: pointer; }

/* Cells */
.task-title-cell { display: flex; flex-direction: column; gap: 0.35rem; }
.task-desc-text { font-size: 0.92rem; font-weight: 700; color: #0f172a; line-height: 1.4; }
.task-sub-info { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.badge-comment-count {
  font-size: 0.65rem; font-weight: 700; color: #64748b; background: #f1f5f9;
  padding: 0.15rem 0.5rem; border-radius: 99px; border: 1px solid #e2e8f0;
}

.meeting-origin-cell { display: flex; flex-direction: column; gap: 0.3rem; }
.meeting-title { font-size: 0.88rem; font-weight: 700; color: #1e293b; }
.meeting-meta-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.no-surat-tag { font-family: monospace; font-size: 0.68rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.1rem 0.4rem; border-radius: 6px; color: #475569; }
.meeting-date { font-size: 0.72rem; color: #64748b; }

.pic-cell { display: flex; align-items: center; gap: 0.65rem; }
.pic-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #e2e8f0; color: #64748b;
  display: flex; align-items: center; justify-content: center; font-size: 0.75rem;
}
.pic-avatar-me { background: #dcfce7; color: #15803d; }
.pic-details { display: flex; flex-direction: column; }
.pic-name { font-size: 0.82rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 0.35rem; }
.pic-nik { font-size: 0.68rem; color: #64748b; }
.badge-me { font-size: 0.6rem; font-weight: 800; background: #10b981; color: white; padding: 0.05rem 0.35rem; border-radius: 4px; }

.deadline-cell { display: flex; flex-direction: column; gap: 0.25rem; }
.deadline-date { font-size: 0.82rem; font-weight: 600; color: #334155; }
.deadline-badge { font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 99px; width: fit-content; text-transform: uppercase; letter-spacing: 0.02em; }
.deadline-normal { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.deadline-urgent { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.deadline-overdue { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; font-weight: 900; animation: pulse 2s infinite; }
.deadline-done { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.deadline-neutral { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.status-pill { font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.04em; }
.status-done { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.status-progress { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
.status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }

.progress-action-cell { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
.progress-wrap { display: flex; align-items: center; gap: 0.5rem; width: 100px; }
.progress-bar-bg { flex: 1; height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.3s ease; }
.progress-text { font-size: 0.75rem; font-weight: 800; color: #334155; min-width: 32px; }

.btn-open-task {
  width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #475569;
  border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-open-task:hover { background: #059669; color: white; border-color: #059669; transform: translateX(2px); }

/* Pagination */
.pagination-container {
  padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-top: 1px solid #f1f5f9;
}
.pagination-info { font-size: 0.85rem; color: #64748b; font-weight: 500; }
.pagination-controls { display: flex; gap: 0.35rem; align-items: center; }
.btn-page {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: white; color: #64748b; display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.btn-page:hover:not(:disabled) { background: #f8fafc; color: #059669; border-color: #cbd5e1; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.35rem; }
.btn-page-number {
  min-width: 36px; height: 36px; padding: 0 0.5rem; border-radius: 10px;
  border: 1px solid transparent; background: transparent; color: #64748b;
  font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.btn-page-number.active { background: #059669; color: white; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25); }

/* Modal Styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px); z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.modal-content-lg {
  background: white; border-radius: 20px; width: 100%; max-width: 1050px;
  max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;
}
.modal-header {
  padding: 1.25rem 1.75rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center; background: #f8fafc;
}
.modal-title-wrap { display: flex; align-items: center; gap: 1rem; }
.modal-header-icon {
  width: 44px; height: 44px; border-radius: 12px; background: #ecfdf5;
  display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
  border: 1px solid #a7f3d0;
}
.modal-title { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
.modal-subtitle { font-size: 0.78rem; color: #64748b; margin: 0.15rem 0 0 0; }
.btn-close-modal {
  background: transparent; border: none; font-size: 1.2rem; color: #94a3b8;
  cursor: pointer; width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.btn-close-modal:hover { background: #fee2e2; color: #ef4444; }

.modal-body-grid {
  display: grid; grid-template-columns: 1.15fr 0.85fr;
  flex: 1; overflow-y: auto;
}
.modal-col-task { padding: 1.5rem; border-right: 1px solid #f1f5f9; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; }
.modal-col-thread { padding: 1.5rem; background: #f8fafc; overflow-y: auto; display: flex; flex-direction: column; }

/* Section Cards Inside Modal */
.section-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 1.15rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.section-card-header {
  font-size: 0.78rem; font-weight: 800; text-transform: uppercase;
  color: #475569; letter-spacing: 0.05em; margin-bottom: 0.75rem;
  display: flex; align-items: center;
}
.task-description-box { font-size: 0.95rem; color: #1e293b; line-height: 1.5; font-weight: 500; }

.meta-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
.meta-mini-card {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 0.85rem; display: flex; flex-direction: column;
}
.meta-card-label { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
.meta-card-val { font-size: 0.88rem; }

.progress-big-number { font-size: 1.35rem; font-weight: 900; }
.progress-range-slider {
  width: 100%; height: 8px; border-radius: 5px; background: #e2e8f0;
  outline: none; -webkit-appearance: none; cursor: pointer;
}
.progress-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
  background: #059669; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer; transition: transform 0.1s;
}
.progress-range-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.slider-ticks { display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; font-weight: 700; margin-top: 0.35rem; }

/* Feedback Form Inside Modal */
.feedback-type-tabs { display: flex; gap: 0.4rem; background: #f1f5f9; padding: 4px; border-radius: 10px; }
.type-tab-btn {
  flex: 1; padding: 0.4rem 0.5rem; font-size: 0.72rem; font-weight: 700;
  border-radius: 8px; border: none; background: transparent; color: #475569;
  cursor: pointer; transition: all 0.2s;
}
.type-tab-btn.active { background: white; color: #047857; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }

.form-textarea-modern {
  width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 12px;
  font-size: 0.85rem; resize: vertical; transition: all 0.2s;
}
.form-textarea-modern:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12); }

.form-label-sub { font-size: 0.72rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem; display: block; }
.file-upload-box { position: relative; }
.hidden-file-input { display: none; }
.file-drop-area {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 0.85rem; border: 2px dashed #cbd5e1; border-radius: 12px;
  background: #f8fafc; cursor: pointer; transition: all 0.2s;
}
.file-drop-area:hover { border-color: #059669; background: #ecfdf5; }
.btn-remove-file {
  position: absolute; right: 8px; top: 8px; background: #fee2e2; color: #b91c1c;
  border: none; width: 22px; height: 22px; border-radius: 50%; font-size: 0.65rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.btn-submit-reply {
  width: 100%; padding: 0.75rem; background: #059669; color: white;
  border: none; border-radius: 12px; font-size: 0.85rem; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
}
.btn-submit-reply:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
.btn-submit-reply:disabled { opacity: 0.5; cursor: not-allowed; }

/* Thread Activity Feed */
.thread-header {
  display: flex; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0; font-size: 0.88rem;
}
.badge-count {
  font-size: 0.72rem; font-weight: 800; background: #e2e8f0; color: #475569;
  padding: 0.1rem 0.5rem; border-radius: 99px;
}
.thread-body { display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; max-height: 520px; padding-right: 0.5rem; }
.thread-item { display: flex; gap: 0.75rem; align-items: flex-start; }
.thread-avatar {
  font-size: 1.5rem; color: #94a3b8; flex-shrink: 0; margin-top: 2px;
}
.thread-bubble {
  background: white; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 0.85rem 1rem; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.thread-bubble-header {
  display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;
}
.thread-bubble-header .user-name { font-size: 0.78rem; font-weight: 800; color: #0f172a; }
.badge-type-pill {
  font-size: 0.62rem; font-weight: 800; padding: 0.08rem 0.45rem; border-radius: 99px;
  text-transform: uppercase; letter-spacing: 0.03em;
}
.pill-progress { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.pill-comment { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
.pill-approval { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }

.thread-bubble-header .time-text { font-size: 0.68rem; color: #94a3b8; margin-left: auto; }
.thread-text { font-size: 0.85rem; color: #334155; line-height: 1.45; word-break: break-word; }

.thread-attachment { margin-top: 0.6rem; padding-top: 0.5rem; border-top: 1px dashed #e2e8f0; }
.btn-download-attachment {
  display: inline-flex; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0;
  color: #15803d; font-size: 0.72rem; font-weight: 700; padding: 0.3rem 0.65rem; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.btn-download-attachment:hover { background: #15803d; color: white; border-color: #15803d; }

/* Spinners */
.spinner-modern {
  width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #059669;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.mini-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

@media (max-width: 900px) {
  .modal-body-grid { grid-template-columns: 1fr; }
  .modal-col-task { border-right: none; border-bottom: 1px solid #f1f5f9; }
}
</style>
