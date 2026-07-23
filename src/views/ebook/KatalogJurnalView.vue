<template>
  <div class="katalog-jurnal-page p-3 p-md-4">
    <!-- Header Hero Banner (Purple Scientific Theme) -->
    <div class="hero-banner-jurnal rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-sm">
      <div class="position-relative z-1 max-w-700">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge bg-white text-purple px-3 py-1.5 rounded-pill fw-bold shadow-sm" style="font-size: 0.75rem;">
            <i class="fas fa-microscope me-1"></i> Scientific Publication
          </span>
          <span class="badge bg-white-20 text-white px-3 py-1.5 rounded-pill fw-medium" style="font-size: 0.75rem;">
            Jurnal Medis & Riset RSIA
          </span>
        </div>
        <h2 class="fw-bold text-white mb-2 display-6">Katalog Jurnal & Artikel Ilmiah</h2>
        <p class="text-white-80 m-0 fs-6">
          Kumpulan artikel ilmiah, riset kesehatan, studi kasus klinis, dan jurnal akreditasi medis RSIA.
        </p>

        <!-- Search Bar Inside Banner -->
        <div class="mt-4">
          <div class="input-group input-group-lg bg-white rounded-pill p-1 shadow-lg border-0">
            <span class="input-group-text bg-transparent border-0 text-muted ps-3.5">
              <i class="fas fa-search fs-5 text-purple"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control bg-transparent border-0 shadow-none text-dark fs-6 ps-1" 
              placeholder="Cari judul jurnal, abstrak, penulis, ISSN, atau nomor edisi..."
              @keyup.enter="loadJurnals(1)"
            />
            <button 
              v-if="searchQuery" 
              class="btn btn-link text-muted border-0 me-1" 
              @click="searchQuery = ''; loadJurnals(1)"
            >
              <i class="fas fa-times"></i>
            </button>
            <button 
              class="btn btn-purple rounded-pill px-4 fw-bold text-white d-flex align-items-center gap-2"
              @click="loadJurnals(1)"
            >
              <span>Cari Jurnal</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Banner Background Decorative Shapes -->
      <div class="banner-decor-circle-1"></div>
      <div class="banner-decor-circle-2"></div>
    </div>

    <!-- Filter & Control Toolbar -->
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <!-- Category Filter Pills -->
        <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 max-w-100 scrollbar-hidden">
          <button 
            type="button" 
            class="btn btn-sm rounded-pill fw-bold text-nowrap transition-all px-3 py-1.5"
            :class="selectedKategori === '' ? 'btn-purple text-white shadow-2sm' : 'btn-light text-secondary border'"
            @click="setKategori('')"
          >
            Semua Bidang Jurnal
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            type="button" 
            class="btn btn-sm rounded-pill fw-bold text-nowrap transition-all px-3 py-1.5"
            :class="selectedKategori === String(cat.id) ? 'btn-purple text-white shadow-2sm' : 'btn-light text-secondary border'"
            @click="setKategori(String(cat.id))"
          >
            <i :class="cat.icon || 'fas fa-file-alt'" class="me-1 opacity-75"></i>
            {{ cat.nama_kategori }} ({{ cat.ebooks_count || 0 }})
          </button>
        </div>

        <!-- Right Side View Switcher & Sorting -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Sort Dropdown -->
          <div class="dropdown">
            <select v-model="sortBy" class="form-select form-select-sm rounded-pill border shadow-none bg-light px-3 py-1.5" style="font-size: 0.82rem;" @change="loadJurnals(1)">
              <option value="terbaru">Terbaru</option>
              <option value="terpopuler">Terpopuler (Views)</option>
              <option value="judul_asc">Judul (A-Z)</option>
              <option value="tahun_desc">Tahun Terbit</option>
            </select>
          </div>

          <!-- Grid / List Switcher -->
          <div class="btn-group p-1 bg-light rounded-pill border">
            <button 
              class="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px;"
              :class="viewMode === 'grid' ? 'btn-purple text-white shadow-2sm' : 'text-secondary border-0 bg-transparent'"
              @click="viewMode = 'grid'"
              title="Tampilan Cards"
            >
              <i class="fas fa-th-large" style="font-size: 0.85rem;"></i>
            </button>
            <button 
              class="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px;"
              :class="viewMode === 'list' ? 'btn-purple text-white shadow-2sm' : 'text-secondary border-0 bg-transparent'"
              @click="viewMode = 'list'"
              title="Tampilan Tabel"
            >
              <i class="fas fa-list" style="font-size: 0.85rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Jurnal Grid / List Content -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-purple mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted small">Memuat katalog jurnal...</p>
    </div>

    <div v-else-if="jurnalList.length > 0">
      <!-- Mode Grid -->
      <div v-if="viewMode === 'grid'" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="item in jurnalList" :key="item.id" class="col">
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden jurnal-card position-relative transition-all bg-white">
            <!-- Top Accent Line -->
            <div class="jurnal-top-bar"></div>

            <div class="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <!-- Category & Views Header -->
                <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <span class="badge bg-purple-subtle text-purple border border-purple-subtle px-3 py-1 rounded-pill fw-bold" style="font-size: 0.72rem;">
                    <i class="fas fa-file-alt me-1"></i> {{ item.kategori?.nama_kategori || 'Jurnal' }}
                  </span>
                  <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.72rem;">
                    <i class="fas fa-eye text-purple me-1"></i> {{ item.views_count || 0 }} Dibaca
                  </span>
                </div>

                <!-- Title & Authors -->
                <h6 class="fw-bold text-dark mb-2 text-clamp-2 line-height-sm" :title="item.judul" style="font-size: 1rem;">
                  {{ item.judul }}
                </h6>

                <div class="text-muted small mb-3 text-truncate" style="font-size: 0.8rem;">
                  <i class="fas fa-user-friends me-1 text-purple opacity-75"></i>
                  <strong>Penulis:</strong> {{ item.penulis || 'Tim Peneliti RSIA' }}
                </div>

                <!-- Publication Metadata Pills -->
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span v-if="item.isbn_issn" class="badge bg-light text-secondary border font-monospace px-2.5 py-1 rounded-2" style="font-size: 0.7rem;">
                    ISSN: {{ item.isbn_issn }}
                  </span>
                  <span class="badge bg-light text-secondary border px-2.5 py-1 rounded-2" style="font-size: 0.7rem;">
                    <i class="fas fa-calendar-alt me-1 text-secondary"></i> {{ item.tahun_terbit || '-' }}
                  </span>
                  <span v-if="item.penerbit" class="badge bg-light text-secondary border px-2.5 py-1 rounded-2" style="font-size: 0.7rem;">
                    <i class="fas fa-building me-1 text-secondary"></i> {{ item.penerbit }}
                  </span>
                </div>
              </div>

              <!-- Action Footer Buttons -->
              <div class="pt-3 border-top d-flex align-items-center gap-2">
                <button 
                  class="btn btn-purple text-white btn-sm rounded-pill flex-fill fw-bold py-2 d-flex align-items-center justify-content-center gap-1.5 shadow-2sm"
                  @click="openPdfViewer(item)"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>Baca Jurnal</span>
                </button>

                <a 
                  v-if="item.file_pdf"
                  :href="getFileUrl(item.file_pdf)"
                  target="_blank"
                  download
                  class="btn btn-light-purple btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center text-purple shadow-2sm"
                  style="width: 36px; height: 36px;"
                  title="Unduh Berkas PDF"
                >
                  <i class="fas fa-download" style="font-size: 0.85rem;"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mode List -->
      <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div class="table-responsive">
          <table class="table align-middle table-hover m-0">
            <thead class="bg-light text-secondary border-bottom">
              <tr style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th class="ps-4 py-3" style="width: 50px;">No</th>
                <th class="py-3">Judul Artikel & Penulis</th>
                <th class="py-3">Bidang Jurnal</th>
                <th class="py-3">ISSN & Penerbit</th>
                <th class="py-3 text-center">Dibaca</th>
                <th class="py-3 text-center" style="width: 140px;">Aksi</th>
              </tr>
            </thead>
            <tbody style="font-size: 0.85rem;">
              <tr v-for="(item, index) in jurnalList" :key="item.id" class="transition-all">
                <td class="ps-4 text-muted fw-semibold">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.judul }}</div>
                  <small class="text-muted"><i class="fas fa-user-edit me-1"></i>{{ item.penulis || '-' }}</small>
                </td>
                <td>
                  <span class="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.72rem;">
                    {{ item.kategori?.nama_kategori || 'Jurnal' }}
                  </span>
                </td>
                <td>
                  <div class="fw-medium text-dark">{{ item.penerbit || '-' }}</div>
                  <small v-if="item.isbn_issn" class="text-muted font-monospace">ISSN: {{ item.isbn_issn }}</small>
                  <small v-else class="text-muted">{{ item.tahun_terbit || '-' }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                    <i class="fas fa-eye me-1 text-purple"></i> {{ item.views_count || 0 }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex align-items-center justify-content-center gap-1.5">
                    <button 
                      class="btn-action-btn btn-action-purple rounded-circle border-0 d-flex align-items-center justify-content-center transition-all"
                      @click="openPdfViewer(item)"
                      title="Baca / Pratinjau Jurnal"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <a 
                      v-if="item.file_pdf"
                      :href="getFileUrl(item.file_pdf)"
                      target="_blank"
                      download
                      class="btn-action-btn btn-action-edit rounded-circle border-0 d-flex align-items-center justify-content-center transition-all"
                      title="Unduh Berkas PDF"
                    >
                      <i class="fas fa-download"></i>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="card border-0 shadow-sm rounded-4 mt-4 p-3 bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div class="small text-muted">
          Menampilkan <span class="fw-bold text-dark">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span> - <span class="fw-bold text-dark">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> dari <span class="fw-bold text-dark">{{ pagination.total }}</span> artikel jurnal
        </div>

        <div class="d-flex align-items-center gap-1.5">
          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === 1" 
            title="Halaman Sebelumnya"
            @click="loadJurnals(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left" style="font-size: 0.75rem;"></i>
          </button>

          <div class="px-3 py-1 bg-light rounded-pill border small fw-bold text-dark text-nowrap d-inline-flex align-items-center gap-1" style="height: 32px;">
            <span class="text-purple">{{ pagination.current_page }}</span>
            <span class="text-muted opacity-50">/</span>
            <span>{{ pagination.last_page }}</span>
          </div>

          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === pagination.last_page" 
            title="Halaman Selanjutnya"
            @click="loadJurnals(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right" style="font-size: 0.75rem;"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
      <i class="fas fa-microscope fa-3x text-muted opacity-50 mb-3"></i>
      <h5 class="fw-bold text-dark mb-1">Artikel Jurnal Tidak Ditemukan</h5>
      <p class="text-muted small m-0">Tidak ada jurnal ilmiah yang cocok dengan filter atau kata kunci pencarian Anda.</p>
    </div>

    <!-- Modal Interactive PDF Reader -->
    <div v-if="showPdfModal" class="modal fade show d-block backdrop-blur-bg" tabindex="-1" style="background: rgba(0, 0, 0, 0.65); z-index: 1065;">
      <div class="modal-dialog modal-xl modal-dialog-centered h-90vh my-auto">
        <div class="modal-content border-0 shadow-2xl rounded-4 overflow-hidden h-100 d-flex flex-column">
          <!-- Modal Header -->
          <div class="modal-header bg-white border-bottom py-2.5 px-4 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2.5 overflow-hidden me-3">
              <span class="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill fw-bold text-nowrap" style="font-size: 0.72rem;">
                {{ activeItem?.kategori?.nama_kategori || 'Jurnal' }}
              </span>
              <h6 class="modal-title fw-bold text-dark text-truncate m-0" style="font-size: 1rem;" :title="activeItem?.judul">
                {{ activeItem?.judul }}
              </h6>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a 
                v-if="activeItem?.file_pdf" 
                :href="getFileUrl(activeItem.file_pdf)" 
                target="_blank" 
                download 
                class="btn btn-sm btn-purple text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-1.5"
              >
                <i class="fas fa-download"></i>
                <span>Unduh PDF</span>
              </a>
              <button type="button" class="btn-close ms-1" @click="showPdfModal = false"></button>
            </div>
          </div>

          <!-- Modal Body PDF Frame -->
          <div class="modal-body p-0 flex-grow-1 bg-dark position-relative">
            <iframe 
              v-if="activeItem?.file_pdf" 
              :src="getFileUrl(activeItem.file_pdf)" 
              class="w-100 h-100 border-0" 
              title="PDF Reader"
            ></iframe>
            <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 text-white p-4">
              <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
              <h6>File PDF tidak tersedia untuk artikel ini.</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ebookService } from '@/services/ebookService'
import config from '@/config'

// Reactive States
const loading = ref(false)
const jurnalList = ref([])
const categories = ref([])
const selectedKategori = ref('')
const searchQuery = ref('')
const sortBy = ref('terbaru')
const viewMode = ref('grid')

// Pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 9,
  total: 0
})

// Modal PDF Reader
const showPdfModal = ref(false)
const activeItem = ref(null)

// Methods
const loadCategories = async () => {
  try {
    const res = await ebookService.getCategories()
    if (res.data.success) {
      categories.value = res.data.data
    }
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

const loadJurnals = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
      jenis: 'jurnal', // Strictly filter for Jurnal
      kategori_id: selectedKategori.value || undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value
    }
    const res = await ebookService.getEbooks(params)
    if (res.data.success) {
      jurnalList.value = res.data.data.data
      pagination.value = {
        current_page: res.data.data.current_page,
        last_page: res.data.data.last_page,
        per_page: res.data.data.per_page,
        total: res.data.data.total
      }
    }
  } catch (err) {
    console.error('Error loading jurnals:', err)
  } finally {
    loading.value = false
  }
}

const setKategori = (catId) => {
  selectedKategori.value = catId
  loadJurnals(1)
}

const openPdfViewer = async (item) => {
  activeItem.value = item
  showPdfModal.value = true
  // Increment view counter on server
  try {
    await ebookService.incrementView(item.id)
    item.views_count = (item.views_count || 0) + 1
  } catch (err) {
    console.error('Error incrementing view:', err)
  }
}

const getFileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const apiV2Url = config?.public?.API_V2_URL || config?.public?.API_BASE_URL || ''

  if (path.startsWith('ebook/pdf/')) {
    const filename = path.replace('ebook/pdf/', '')
    return `${apiV2Url}/sdi/ebook/file/${filename}`
  }

  if (path.startsWith('ebook/cover/')) {
    const filename = path.replace('ebook/cover/', '')
    return `${apiV2Url}/sdi/ebook/cover/${filename}`
  }

  const baseUrl = apiV2Url.replace(/\/api\/v2\/?$/, '')
  return `${baseUrl}/storage/${path}`
}

onMounted(() => {
  loadCategories()
  loadJurnals(1)
})
</script>

<style scoped>
.hero-banner-jurnal {
  background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #9333ea 100%);
}

.max-w-700 { max-width: 700px; }
.max-w-100 { max-width: 100%; }

.text-purple { color: #7c3aed !important; }
.bg-purple { background-color: #7c3aed !important; }
.btn-purple { background-color: #7c3aed !important; border-color: #7c3aed !important; }
.btn-purple:hover { background-color: #6d28d9 !important; border-color: #6d28d9 !important; }
.btn-light-purple { background-color: #f5f3ff !important; }
.btn-light-purple:hover { background-color: #7c3aed !important; color: #ffffff !important; }

.bg-purple-subtle { background-color: #f5f3ff !important; }
.border-purple-subtle { border-color: #ddd6fe !important; }

.banner-decor-circle-1 {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.banner-decor-circle-2 {
  position: absolute;
  bottom: -60px;
  right: 120px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.bg-white-20 { background: rgba(255, 255, 255, 0.2); }

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.jurnal-card {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #edf2f7 !important;
}

.jurnal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px -8px rgba(124, 58, 237, 0.15) !important;
  border-color: #ddd6fe !important;
}

.jurnal-top-bar {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #7c3aed, #c084fc);
}

.text-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-height-sm {
  line-height: 1.35;
}

.h-90vh {
  height: 88vh;
}

.btn-action-btn {
  width: 32px;
  height: 32px;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.btn-action-btn:hover {
  transform: translateY(-2px) scale(1.08);
}

.btn-action-purple {
  background-color: #f5f3ff !important;
  color: #7c3aed !important;
}

.btn-action-purple:hover {
  background-color: #7c3aed !important;
  color: #ffffff !important;
}

.btn-action-edit {
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
}

.btn-action-edit:hover {
  background-color: #0284c7 !important;
  color: #ffffff !important;
}

.shadow-2sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}
</style>
