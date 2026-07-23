<template>
  <div class="katalog-ebook-page p-3 p-md-4">
    <!-- Page Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.72rem;">
            <i class="fas fa-book-reader me-1"></i> E-Library RSIA
          </span>
        </div>
        <h4 class="page-title m-0 fw-bold text-dark">Katalog E-Book & Buku Digital</h4>
        <p class="page-subtitle text-muted m-0 mt-1" style="font-size: 0.85rem;">
          Jelajahi panduan klinis, modul pelatihan, dan buku referensi kesehatan digital RSIA.
        </p>
      </div>

      <!-- Quick Summary Badges -->
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <div class="px-3 py-2 bg-white rounded-3 border shadow-2sm d-flex align-items-center gap-2">
          <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
            <i class="fas fa-book fs-6"></i>
          </div>
          <div>
            <div class="fw-bold text-dark leading-tight">{{ pagination.total || 0 }}</div>
            <small class="text-muted" style="font-size: 0.7rem;">Total E-Book</small>
          </div>
        </div>

        <div class="px-3 py-2 bg-white rounded-3 border shadow-2sm d-flex align-items-center gap-2">
          <div class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
            <i class="fas fa-layer-group fs-6"></i>
          </div>
          <div>
            <div class="fw-bold text-dark leading-tight">{{ categories.length || 0 }}</div>
            <small class="text-muted" style="font-size: 0.7rem;">Kategori</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Control Card -->
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2.5">
        <!-- Left Side: Search & Category -->
        <div class="d-flex flex-wrap align-items-center gap-2.5 flex-grow-1" style="max-width: 680px;">
          <!-- Search Input -->
          <div class="input-group flex-grow-1" style="min-width: 220px; max-width: 360px;">
            <span class="input-group-text bg-white border-end-0 text-muted rounded-start-pill ps-3.5" style="border-color: #cbd5e1; height: 42px;">
              <i class="fas fa-search text-primary"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-start-0 ps-0 shadow-none rounded-end-pill" 
              style="height: 42px; border-color: #cbd5e1; font-size: 0.85rem;"
              placeholder="Cari judul e-book, penulis, penerbit..."
              @keyup.enter="loadEbooks(1)"
            />
            <button v-if="searchQuery" class="btn btn-white border border-start-0 text-muted rounded-end-pill pe-3" style="border-color: #cbd5e1 !important; height: 42px;" @click="searchQuery = ''; loadEbooks(1)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Category Dropdown -->
          <div class="flex-grow-1" style="min-width: 180px; max-width: 260px;">
            <select 
              v-model="selectedKategori" 
              class="form-select rounded-pill border shadow-none bg-white px-3.5" 
              style="height: 42px; border-color: #cbd5e1; font-size: 0.85rem;" 
              @change="loadEbooks(1)"
            >
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                {{ cat.nama_kategori }} ({{ cat.ebooks_count || 0 }})
              </option>
            </select>
          </div>
        </div>

        <!-- Right Side: Sort & View Mode Switcher -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Sort Select -->
          <div style="min-width: 130px;">
            <select 
              v-model="sortBy" 
              class="form-select rounded-pill border shadow-none bg-white px-3" 
              style="height: 42px; border-color: #cbd5e1; font-size: 0.85rem;" 
              @change="loadEbooks(1)"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terpopuler">Terpopuler</option>
              <option value="judul_asc">Judul (A-Z)</option>
              <option value="tahun_desc">Tahun Terbit</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="btn-group p-1 bg-light rounded-pill border" style="height: 42px;">
            <button 
              class="btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 transition-all border-0 text-nowrap"
              :class="viewMode === 'grid' ? 'btn-primary text-white shadow-2sm' : 'text-secondary bg-transparent'"
              @click="viewMode = 'grid'"
              title="Tampilan Grid"
            >
              <i class="fas fa-th-large"></i>
              <span class="d-none d-sm-inline">Grid</span>
            </button>
            <button 
              class="btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 transition-all border-0 text-nowrap"
              :class="viewMode === 'list' ? 'btn-primary text-white shadow-2sm' : 'text-secondary bg-transparent'"
              @click="viewMode = 'list'"
              title="Tampilan Tabel"
            >
              <i class="fas fa-list"></i>
              <span class="d-none d-sm-inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- E-Book Content -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary mb-2" role="status" style="width: 2rem; height: 2rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted small m-0">Memuat katalog e-book...</p>
    </div>

    <div v-else-if="ebookList && ebookList.length > 0">
      <!-- Mode Grid -->
      <div v-if="viewMode === 'grid'" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3.5">
        <div v-for="item in ebookList" :key="item.id" class="col">
          <div class="card h-100 border rounded-4 overflow-hidden ebook-card bg-white transition-all shadow-2sm">
            <!-- Cover Container -->
            <div class="ebook-cover-box bg-light border-bottom position-relative overflow-hidden d-flex align-items-center justify-content-center">
              <img 
                v-if="item.cover" 
                :src="getFileUrl(item.cover)" 
                :alt="item.judul"
                class="ebook-cover-img"
                @error="onImageError"
              />
              <div v-else class="text-center p-3 text-primary opacity-60">
                <i class="fas fa-book fa-3x mb-1"></i>
                <div class="small fw-bold text-uppercase" style="font-size: 0.68rem;">{{ item.kategori?.nama_kategori || 'E-Book' }}</div>
              </div>

              <!-- Badges -->
              <span class="position-absolute top-0 start-0 m-2 badge bg-primary text-white px-2.5 py-1 rounded-pill fw-bold shadow-2sm" style="font-size: 0.68rem;">
                {{ item.kategori?.nama_kategori || 'Umum' }}
              </span>

              <span class="position-absolute top-0 end-0 m-2 badge bg-white text-dark border px-2 py-1 rounded-pill fw-bold shadow-2sm" style="font-size: 0.68rem;">
                <i class="fas fa-eye text-primary me-1"></i> {{ item.views_count || 0 }}
              </span>
            </div>

            <!-- Card Body Info -->
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <h6 class="fw-bold text-dark mb-1 text-clamp-2" :title="item.judul" style="font-size: 0.88rem; line-height: 1.35;">
                  {{ item.judul }}
                </h6>
                <p class="text-muted small mb-2 text-truncate" style="font-size: 0.76rem;">
                  <i class="fas fa-user-edit me-1 text-secondary opacity-50"></i>
                  {{ item.penulis || 'Penulis Tidak Disebutkan' }}
                </p>
              </div>

              <div class="pt-2.5 border-top d-flex align-items-center justify-content-between">
                <small class="text-muted text-truncate me-1" style="font-size: 0.72rem;">
                  <i class="fas fa-building me-1 opacity-50"></i>{{ item.penerbit || '-' }}
                </small>
                
                <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
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
                <th class="py-3" style="width: 50px;">Cover</th>
                <th class="py-3">Judul & Penulis</th>
                <th class="py-3">Kategori</th>
                <th class="py-3">Penerbit & Tahun</th>
                <th class="py-3 text-center">Dibaca</th>
                <th class="py-3 text-center" style="width: 110px;">Aksi</th>
              </tr>
            </thead>
            <tbody style="font-size: 0.85rem;">
              <tr v-for="(item, index) in ebookList" :key="item.id" class="transition-all">
                <td class="ps-4 text-muted fw-semibold">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <div class="rounded-2 bg-light overflow-hidden d-flex align-items-center justify-content-center border" style="width: 36px; height: 46px;">
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
      <h6 class="fw-bold text-dark mb-1">E-Book Tidak Ditemukan</h6>
      <p class="text-muted small m-0">Tidak ada e-book yang cocok dengan filter atau pencarian Anda.</p>
    </div>

    <!-- Modal Interactive PDF Reader -->
    <div v-if="showPdfModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.65); z-index: 1065;">
      <div class="modal-dialog modal-xl modal-dialog-centered" style="height: 88vh;">
        <div class="modal-content border-0 shadow-2xl rounded-4 overflow-hidden h-100 d-flex flex-column">
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

const loading = ref(false)
const ebookList = ref([])
const categories = ref([])
const selectedKategori = ref('')
const searchQuery = ref('')
const sortBy = ref('terbaru')
const viewMode = ref('grid')

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
})

const showPdfModal = ref(false)
const activeItem = ref(null)

const loadCategories = async () => {
  try {
    const res = await ebookService.getCategories({ jenis: 'ebook' })
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
      jenis: 'ebook',
      kategori_id: selectedKategori.value || undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value
    }
    const res = await ebookService.getEbooks(params)
    if (res.data.success) {
      ebookList.value = res.data.data || []
      if (res.data.pagination) {
        pagination.value = res.data.pagination
      }
    }
  } catch (err) {
    console.error('Error loading ebooks:', err)
  } finally {
    loading.value = false
  }
}

const openPdfViewer = async (item) => {
  activeItem.value = item
  showPdfModal.value = true
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
.page-header {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 1rem 0 0 1rem;
}

.ebook-card {
  border-color: #edf2f7 !important;
}

.ebook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08) !important;
  border-color: #bfdbfe !important;
}

.ebook-cover-box {
  height: 180px;
  width: 100%;
}

.ebook-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.ebook-card:hover .ebook-cover-img {
  transform: scale(1.04);
}

.text-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-action-btn {
  width: 32px;
  height: 32px;
  font-size: 0.82rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
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
