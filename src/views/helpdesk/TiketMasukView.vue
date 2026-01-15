<template>
  <div class="helpdesk-tickets">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div class="header-text">
        <h1 class="page-title">🎧 Tiket Masuk Helpdesk</h1>
        <p class="page-subtitle">Daftar laporan masuk melalui WhatsApp Helpdesk</p>
      </div>
      <button class="btn btn-filter-toggle d-md-none" :class="{ 'active': showFilters }" @click="showFilters = !showFilters">
        <i class="fas" :class="showFilters ? 'fa-times' : 'fa-filter'"></i>
        <span>{{ showFilters ? 'Tutup Filter' : 'Filter Tiket' }}</span>
      </button>
    </div>

    <!-- Filter dan Search -->
    <div class="card mb-4 filter-card animate__animated animate__fadeInDown" v-if="showFilters || !isMobile">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small text-muted text-uppercase fw-bold">Cari Tiket</label>
            <div class="input-group modern-input">
              <span class="input-group-text border-end-0 bg-white">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input
                v-model="filters.keyword"
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="No. WA, NIK, atau Isi Laporan..."
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label small text-muted text-uppercase fw-bold">Status</label>
            <select v-model="filters.status" class="form-select modern-select" @change="fetchTickets">
              <option value="">Semua Status</option>
              <option value="WAITING">Waiting</option>
              <option value="PROCESSED">Processed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          <div class="col-6 col-md-2">
             <button class="btn btn-primary w-100" @click="fetchTickets" :disabled="loading" style="height: 42px;">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Refresh
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th width="5%" class="text-center">#</th>
              <th width="15%" class="text-nowrap">Waktu Masuk</th>
              <th width="20%" class="text-nowrap">Pelapor</th>
              <th width="30%">Isi Laporan</th>
              <th width="15%" class="text-center text-nowrap">Status</th>
              <th width="15%" class="text-center text-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="tickets.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fas fa-ticket-alt fa-3x mb-3 opacity-25"></i>
                <p>Tidak ada tiket bantuan ditemukan.</p>
              </td>
            </tr>
            <tr v-for="(ticket, index) in tickets" :key="ticket.id">
              <td class="text-center text-muted small">{{ (meta.current_page - 1) * meta.per_page + index + 1 }}</td>
              <td>
                <div class="fw-bold">{{ formatDate(ticket.created_at) }}</div>
                <small class="text-muted">{{ formatTime(ticket.created_at) }}</small>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar-wa me-2">
                    <i class="fab fa-whatsapp"></i>
                  </div>
                  <div>
                    <div class="fw-bold text-primary">{{ ticket.pegawai?.nama || 'Non-Pegawai' }}</div>
                    <div class="small text-muted d-flex gap-1" v-if="ticket.nomor_wa">
                       <span>WA: {{ maskData(ticket.nomor_wa) }}</span>
                    </div>
                    <div class="small text-muted" v-if="ticket.nik_pelapor">NIK: {{ maskData(ticket.nik_pelapor) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-wrap" style="max-width: 400px; font-size: 0.9rem;">
                  {{ ticket.isi_laporan || '-' }}
                </div>
              </td>
              <td class="text-center">
                <span class="badge" :class="getStatusBadgeClass(ticket.status)">
                  {{ ticket.status }}
                </span>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm" v-if="ticket.status === 'WAITING'">
                  <button class="btn btn-success" @click="updateStatus(ticket.id, 'PROCESSED')" title="Tandai Diproses">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="btn btn-danger" @click="updateStatus(ticket.id, 'EXPIRED')" title="Tandai Expired">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <span v-else class="text-muted small italic">Selesai</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white border-top py-3" v-if="meta.last_page > 1">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small class="text-muted">
            Menampilkan {{ tickets.length }} dari {{ meta.total }} data
          </small>
          <nav aria-label="Page navigation" class="pagination-container">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
                <button class="page-link" @click="changePage(meta.current_page - 1)">Previous</button>
              </li>
              <li class="page-item" :class="{ active: meta.current_page === p }" v-for="p in visiblePages" :key="p">
                <button class="page-link" @click="changePage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
                <button class="page-link" @click="changePage(meta.current_page + 1)">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import helpdeskService from '@/services/helpdeskService'

const toast = useToast()
const tickets = ref([])
const loading = ref(false)
const meta = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 10
})

const filters = reactive({
  keyword: '',
  status: 'WAITING'
})

const showFilters = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const fetchTickets = async () => {
  loading.value = true
  try {
    const params = {
      page: meta.value.current_page,
      limit: meta.value.per_page,
      status: filters.status,
      keyword: filters.keyword
    }
    const response = await helpdeskService.getTickets(params)
    const { data } = response.data
    tickets.value = data.data
    meta.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
      per_page: data.per_page
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal mengambil data tiket')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  try {
    const response = await helpdeskService.updateStatus(id, status)
    if (response.data.success) {
      toast.success(`Status tiket diperbarui menjadi ${status}`)
      fetchTickets()
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal memperbarui status')
  }
}

const handleSearch = () => {
  clearTimeout(handleSearch.timer)
  handleSearch.timer = setTimeout(() => {
    meta.value.current_page = 1
    fetchTickets()
  }, 500)
}

const changePage = (page) => {
  meta.value.current_page = page
  fetchTickets()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const maskData = (value) => {
  if (!value) return '-'
  if (value.length <= 8) return value
  const start = value.slice(0, 4)
  const end = value.slice(-4)
  const masked = '*'.repeat(value.length - 8)
  return `${start}${masked}${end}`
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'WAITING': return 'bg-warning text-dark'
    case 'PROCESSED': return 'bg-success'
    case 'EXPIRED': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

const visiblePages = computed(() => {
  const pages = []
  const max = 5
  let start = Math.max(1, meta.value.current_page - 2)
  let end = Math.min(meta.value.last_page, start + max - 1)
  
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

onMounted(() => {
  fetchTickets()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style scoped>
.helpdesk-tickets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #718096;
  margin-bottom: 0;
}

.filter-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modern-input .form-control:focus {
  box-shadow: none;
  border-color: #3182ce;
}

.modern-select {
  height: 42px;
  border-radius: 8px;
  border-color: #e2e8f0;
}

.avatar-wa {
  width: 32px;
  height: 32px;
  background-color: #25d366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #3182ce;
  background-color: white;
  color: #3182ce;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-filter-toggle.active {
  background-color: #3182ce;
  color: white;
}

.table thead th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4a5568;
  padding: 1rem;
  border: none;
  white-space: nowrap !important;
}

.table tbody td {
  padding: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.text-nowrap {
  white-space: nowrap !important;
}

.badge {
  padding: 0.5em 0.75em;
  font-weight: 600;
  letter-spacing: 0.025em;
}

@media (max-width: 768px) {
  .helpdesk-tickets {
    padding: 0.75rem; /* Slightly tighter on mobile but still has space */
  }

  .page-header {
    margin-bottom: 1.25rem;
    padding: 0;
  }
  
  .header-text {
    flex: 1;
    min-width: 200px;
    margin-bottom: 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .card {
    border-radius: 12px; /* Keep rounded corners */
    margin-left: 0;
    margin-right: 0;
  }

  .filter-card {
    padding: 1rem;
  }

  .table-responsive {
    margin: 0;
    padding: 0;
  }

  .table thead th {
    padding: 1.25rem 0.75rem !important;
  }

  .table tbody td {
    padding: 1.5rem 0.75rem !important; /* Increased vertical padding */
    font-size: 0.875rem;
  }

  .avatar-wa {
    margin-right: 0.75rem !important;
  }

  .pagination-container {
    width: 100%;
    margin-top: 0.5rem;
  }
  .pagination {
    justify-content: center;
    overflow-x: auto;
    flex-wrap: nowrap;
    white-space: nowrap;
    padding-bottom: 0.25rem;
  }
  .page-item {
    flex-shrink: 0;
  }
}
</style>
