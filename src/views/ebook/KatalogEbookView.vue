<template>
  <div class="katalog-ebook-page p-3 p-md-4">
    <!-- Header Hero Banner -->
    <div class="hero-banner rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-sm">
      <div class="position-relative z-1 max-w-700">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge bg-white text-primary px-3 py-1.5 rounded-pill fw-bold shadow-sm" style="font-size: 0.75rem;">
            <i class="fas fa-book-reader me-1"></i> E-Library RSIA
          </span>
          <span class="badge bg-white-20 text-white px-3 py-1.5 rounded-pill fw-medium" style="font-size: 0.75rem;">
            SDI & Educations
          </span>
        </div>
        <h2 class="fw-bold text-white mb-2 display-6">Katalog E-Book & Buku Digital</h2>
        <p class="text-white-80 m-0 fs-6">
          Akses panduan klinis, modul pelatihan, buku referensi medis, dan dokumen resmi RSIA secara digital.
        </p>

        <!-- Search Bar Inside Banner -->
        <div class="mt-4">
          <div class="input-group input-group-lg bg-white rounded-pill p-1 shadow-lg border-0">
            <span class="input-group-text bg-transparent border-0 text-muted ps-3.5">
              <i class="fas fa-search fs-5 text-primary"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control bg-transparent border-0 shadow-none text-dark fs-6 ps-1" 
              placeholder="Cari judul e-book, penulis, penerbit, atau kata kunci..."
              @keyup.enter="loadEbooks(1)"
            />
            <button 
              v-if="searchQuery" 
              class="btn btn-link text-muted border-0 me-1" 
              @click="searchQuery = ''; loadEbooks(1)"
            >
              <i class="fas fa-times"></i>
            </button>
            <button 
              class="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
              @click="loadEbooks(1)"
            >
              <span>Cari</span>
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
        <!-- Category Filter Pills (Horizontal Scrollable) -->
        <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 max-w-100 scrollbar-hidden">
          <button 
            type="button" 
            class="btn btn-sm rounded-pill fw-bold text-nowrap transition-all px-3 py-1.5"
            :class="selectedKategori === '' ? 'btn-primary text-white shadow-2sm' : 'btn-light text-secondary border'"
            @click="setKategori('')"
          >
            Semua Kategori
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            type="button" 
            class="btn btn-sm rounded-pill fw-bold text-nowrap transition-all px-3 py-1.5"
            :class="selectedKategori === String(cat.id) ? 'btn-primary text-white shadow-2sm' : 'btn-light text-secondary border'"
            @click="setKategori(String(cat.id))"
          >
            <i :class="cat.icon || 'fas fa-bookmark'" class="me-1 opacity-75"></i>
            {{ cat.nama_kategori }} ({{ cat.ebooks_count || 0 }})
          </button>
        </div>

        <!-- Right Side View Switcher & Sorting -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Sort Dropdown -->
          <div class="dropdown">
            <select v-model="sortBy" class="form-select form-select-sm rounded-pill border shadow-none bg-light px-3 py-1.5" style="font-size: 0.82rem;" @change="loadEbooks(1)">
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
              :class="viewMode === 'grid' ? 'btn-primary text-white shadow-2sm' : 'text-secondary border-0 bg-transparent'"
              @click="viewMode = 'grid'"
              title="Tampilan Grid"
            >
              <i class="fas fa-th-large" style="font-size: 0.85rem;"></i>
            </button>
            <button 
              class="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px;"
              :class="viewMode === 'list' ? 'btn-primary text-white shadow-2sm' : 'text-secondary border-0 bg-transparent'"
              @click="viewMode = 'list'"
              title="Tampilan Daftar"
            >
              <i class="fas fa-list" style="font-size: 0.85rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- E-Book Grid / List Content -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted small">Memuat katalog e-book...</p>
    </div>

    <div v-else-if="ebookList.length > 0">
      <!-- Mode Grid -->
      <div v-if="viewMode === 'grid'" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <div v-for="item in ebookList" :key="item.id" class="col">
          <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden ebook-card position-relative transition-all">
            <!-- Cover Container -->
            <div class="ebook-cover-wrapper position-relative bg-light overflow-hidden d-flex align-items-center justify-content-center">
              <img 
                v-if="item.cover" 
                :src="getFileUrl(item.cover)" 
                :alt="item.judul"
                class="ebook-cover-img"
                @error="onImageError"
              />
              <div v-else class="text-center p-4 text-primary opacity-75">
                <i class="fas fa-book fa-4x mb-2"></i>
                <div class="small fw-bold text-uppercase opacity-50">{{ item.kategori?.nama_kategori || 'E-Book' }}</div>
              </div>

              <!-- Top Left Category Badge -->
              <span class="position-absolute top-0 start-0 m-2.5 badge bg-dark-50 backdrop-blur text-white px-2.5 py-1 rounded-pill fw-semibold" style="font-size: 0.7rem;">
                {{ item.kategori?.nama_kategori || 'Umum' }}
              </span>

              <!-- Top Right Views Counter -->
              <span class="position-absolute top-0 end-0 m-2.5 badge bg-white-80 backdrop-blur text-dark border px-2 py-1 rounded-pill fw-bold shadow-2sm" style="font-size: 0.7rem;">
                <i class="fas fa-eye text-primary me-1"></i> {{ item.views_count || 0 }}
              </span>

              <!-- Hover Overlay Button -->
              <div class="ebook-cover-overlay d-flex align-items-center justify-content-center gap-2 p-3">
                <button 
                  class="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                  style="width: 44px; height: 44px;"
                  @click="openPdfViewer(item)"
                  title="Baca / Pratinjau PDF"
                >
                  <i class="fas fa-eye text-primary fs-5"></i>
                </button>
                <a 
                  v-if="item.file_pdf" 
                  :href="getFileUrl(item.file_pdf)" 
                  target="_blank" 
                  download 
                  class="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center text-success"
                  style="width: 44px; height: 44px;"
                  title="Unduh PDF"
                >
                  <i class="fas fa-download fs-5"></i>
                </a>
              </div>
            </div>

            <!-- Card Body Info -->
            <div class="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <h6 class="fw-bold text-dark mb-1 text-clamp-2 line-height-sm" :title="item.judul" style="font-size: 0.95rem;">
                  {{ item.judul }}
                </h6>
                <p class="text-muted small mb-2 text-truncate" style="font-size: 0.78rem;">
                  <i class="fas fa-user-edit me-1 text-secondary opacity-50"></i>
                  {{ item.penulis || 'Penulis Tidak Disebutkan' }}
                </p>
              </div>

              <!-- Meta Footer Info -->
              <div class="pt-2 border-top d-flex align-items-center justify-content-between text-muted" style="font-size: 0.73rem;">
                <span>
                  <i class="fas fa-building me-1"></i> {{ item.penerbit || '-' }}
                </span>
                <span class="fw-bold text-dark">
                  <i class="fas fa-calendar-alt me-1 text-primary"></i> {{ item.tahun_terbit || '-' }}
                </span>
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
                <th class="py-3" style="width: 60px;">Cover</th>
                <th class="py-3">Judul & Penulis</th>
                <th class="py-3">Kategori</th>
                <th class="py-3">Penerbit & Tahun</th>
                <th class="py-3 text-center">Dibaca</th>
                <th class="py-3 text-center" style="width: 120px;">Aksi</th>
              </tr>
            </thead>
            <tbody style="font-size: 0.85rem;">
              <tr v-for="(item, index) in ebookList" :key="item.id" class="transition-all">
                <td class="ps-4 text-muted fw-semibold">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <div class="rounded-2 bg-light overflow-hidden d-flex align-items-center justify-content-center border" style="width: 40px; height: 52px;">
                    <img v-if="item.cover" :src="getFileUrl(item.cover)" class="w-100 h-100 object-fit-cover" />
                    <i v-else class="fas fa-book text-primary opacity-75"></i>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.judul }}</div>
                  <small class="text-muted"><i class="fas fa-pen-nib me-1"></i>{{ item.penulis || '-' }}</small>
                </td>
                <td>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.72rem;">
                    {{ item.kategori?.nama_kategori || 'Umum' }}
                  </span>
                </td>
                <td>
                  <div class="fw-medium text-dark">{{ item.penerbit || '-' }}</div>
                  <small class="text-muted">{{ item.tahun_terbit || '-' }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                    <i class="fas fa-eye me-1 text-primary"></i> {{ item.views_count || 0 }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex align-items-center justify-content-center gap-1.5">
                    <button 
                      class="btn-action-btn btn-action-pdf rounded-circle border-0 d-flex align-items-center justify-content-center transition-all"
                      @click="openPdfViewer(item)"
                      title="Baca / Pratinjau PDF"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <a 
                      v-if="item.file_pdf"
                      :href="getFileUrl(item.file_pdf)"
                      target="_blank"
                      download
                      class="btn-action-btn btn-action-edit rounded-circle border-0 d-flex align-items-center justify-content-center transition-all"
                      title="Unduh PDF"
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
          Menampilkan <span class="fw-bold text-dark">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span> - <span class="fw-bold text-dark">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> dari <span class="fw-bold text-dark">{{ pagination.total }}</span> e-book
        </div>

        <div class="d-flex align-items-center gap-1.5">
          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === 1" 
            title="Halaman Sebelumnya"
            @click="loadEbooks(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left" style="font-size: 0.75rem;"></i>
          </button>

          <div class="px-3 py-1 bg-light rounded-pill border small fw-bold text-dark text-nowrap d-inline-flex align-items-center gap-1" style="height: 32px;">
            <span class="text-primary">{{ pagination.current_page }}</span>
            <span class="text-muted opacity-50">/</span>
            <span>{{ pagination.last_page }}</span>
          </div>

          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === pagination.last_page" 
            title="Halaman Selanjutnya"
            @click="loadEbooks(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right" style="font-size: 0.75rem;"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
      <i class="fas fa-book-open fa-3x text-muted opacity-50 mb-3"></i>
      <h5 class="fw-bold text-dark mb-1">E-Book Tidak Ditemukan</h5>
      <p class="text-muted small m-0">Tidak ada dokumen e-book yang cocok dengan filter atau kata kunci pencarian Anda.</p>
    </div>

    <!-- Modal Interactive PDF Reader -->
    <div v-if="showPdfModal" class="modal fade show d-block backdrop-blur-bg" tabindex="-1" style="background: rgba(0, 0, 0, 0.65); z-index: 1065;">
      <div class="modal-dialog modal-xl modal-dialog-centered h-90vh my-auto">
        <div class="modal-content border-0 shadow-2xl rounded-4 overflow-hidden h-100 d-flex flex-column">
          <!-- Modal Header -->
          <div class="modal-header bg-white border-bottom py-2.5 px-4 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2.5 overflow-hidden me-3">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold text-nowrap" style="font-size: 0.72rem;">
                {{ activeItem?.kategori?.nama_kategori || 'E-Book' }}
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
                class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1.5"
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
              <h6>File PDF tidak tersedia untuk dokumen ini.</h6>
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
import config from '@/config/api'

// Reactive States
const loading = ref(false)
const ebookList = ref([])
const categories = ref([])
const selectedKategori = ref('')
const searchQuery = ref('')
const sortBy = ref('terbaru')
const viewMode = ref('grid')

// Pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
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

const loadEbooks = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
      jenis: 'ebook', // Strictly filter for E-Book
      kategori_id: selectedKategori.value || undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value
    }
    const res = await ebookService.getEbooks(params)
    if (res.data.success) {
      ebookList.value = res.data.data.data
      pagination.value = {
        current_page: res.data.data.current_page,
        last_page: res.data.data.last_page,
        per_page: res.data.data.per_page,
        total: res.data.data.total
      }
    }
  } catch (err) {
    console.error('Error loading ebooks:', err)
  } finally {
    loading.value = false
  }
}

const setKategori = (catId) => {
  selectedKategori.value = catId
  loadEbooks(1)
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

const onImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  loadCategories()
  loadEbooks(1)
})
</script>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0284c7 100%);
}

.max-w-700 { max-width: 700px; }
.max-w-100 { max-width: 100%; }

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
.bg-white-80 { background: rgba(255, 255, 255, 0.85); }
.bg-dark-50 { background: rgba(15, 23, 42, 0.65); }

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.ebook-card {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.ebook-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.12) !important;
}

.ebook-cover-wrapper {
  height: 220px;
  width: 100%;
}

.ebook-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ebook-card:hover .ebook-cover-img {
  transform: scale(1.05);
}

.ebook-cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.ebook-card:hover .ebook-cover-overlay {
  opacity: 1;
}

.text-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-height-sm {
  line-height: 1.3;
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

.btn-action-pdf {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

.btn-action-pdf:hover {
  background-color: #dc2626 !important;
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
