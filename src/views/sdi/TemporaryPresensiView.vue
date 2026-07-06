<template>
  <div class="temporary-presensi-container">
    <!-- Header Section with Stats -->
    <div class="dashboard-header mb-4">
      <div class="header-content">
        <h2 class="page-title">
          <i class="fas fa-fingerprint mr-2"></i> Temporary Presensi
        </h2>
        <p class="text-muted">Daftar absensi sementara pegawai yang perlu diverifikasi.</p>
      </div>
      
      <div class="stats-row mt-3">
        <div class="stat-card glass-effect animate-up">
          <div class="stat-icon bg-soft-primary">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Absen</span>
            <span class="stat-value">{{ pagination.total || 0 }}</span>
          </div>
        </div>
        
        <div class="stat-card glass-effect animate-up" style="animation-delay: 0.1s">
          <div class="stat-icon bg-soft-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Tepat Waktu</span>
            <span class="stat-value text-success">{{ stats.tepat_waktu }}</span>
          </div>
        </div>

        <div class="stat-card glass-effect animate-up" style="animation-delay: 0.2s">
          <div class="stat-icon bg-soft-danger">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Terlambat</span>
            <span class="stat-value text-danger">{{ stats.terlambat }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-card glass-effect mb-4 animate-fade">
      <div class="row align-items-end">
        <div class="col-lg-4 col-md-6 mb-3 mb-md-0">
          <label class="form-label-custom">Pencarian Pegawai</label>
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="filters.search" 
              type="text" 
              class="form-control modern-input" 
              placeholder="Cari Nama, NIK, atau Unit..."
              @input="onSearch"
            >
          </div>
        </div>
        
        <div class="col-lg-3 col-md-4 mb-3 mb-md-0">
          <label class="form-label-custom">Status Absensi</label>
          <select v-model="filters.status" class="form-select modern-select" @change="fetchData">
            <option value="">Semua Status</option>
            <option value="Tepat Waktu">Tepat Waktu</option>
            <option value="Terlambat Toleransi">Terlambat Toleransi</option>
            <option value="Terlambat I">Terlambat I</option>
            <option value="Terlambat II">Terlambat II</option>
          </select>
        </div>

        <div class="col-lg-5 col-md-2 text-md-end">
           <button class="btn btn-refresh ripple" @click="fetchData" :disabled="loading">
             <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
             <span class="d-none d-md-inline ms-2">Muat Ulang</span>
           </button>
        </div>
      </div>
    </div>

    <!-- Data Table / Grid -->
    <div v-if="loading" class="loading-state glass-effect animate-fade">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Mengambil data presensi...</p>
    </div>

    <div v-else-if="presensiList.length === 0" class="empty-state glass-effect animate-fade">
      <div class="empty-icon text-muted">
        <i class="fas fa-user-slash"></i>
      </div>
      <p class="mt-3">Tidak ada data absensi temporer ditemukan.</p>
    </div>

    <div v-else class="data-content">
      <!-- Desktop Table -->
      <div class="table-responsive d-none d-lg-block glass-effect animate-fade">
        <table class="table modern-table">
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Jam Datang/Pulang</th>
              <th>Durasi/Telat</th>
              <th>Foto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in presensiList" :key="item.id">
              <td>
                <div class="pegawai-cell">
                  <span class="pegawai-name d-block">{{ item.nama }}</span>
                  <span class="pegawai-nik text-muted small">{{ item.nik }} • {{ item.nama_departemen }}</span>
                </div>
              </td>
              <td>
                <span class="badge-shift">{{ item.shift }}</span>
              </td>
              <td>
                <span :class="getStatusClass(item.status)">{{ item.status }}</span>
              </td>
              <td>
                <div class="time-cell">
                  <div class="time-item"><i class="fas fa-sign-in-alt text-success me-1"></i> {{ formatDateTime(item.jam_datang) }}</div>
                  <div class="time-item"><i class="fas fa-sign-out-alt text-danger me-1"></i> {{ formatDateTime(item.jam_pulang) }}</div>
                </div>
              </td>
              <td>
                <div class="durasi-cell">
                   <div v-if="item.keterlambatan && item.keterlambatan != '00:00:00'" class="text-danger small">
                     <i class="fas fa-exclamation-triangle"></i> Terlambat: {{ item.keterlambatan }}
                   </div>
                   <div class="text-muted small">Durasi: {{ item.durasi || '-' }}</div>
                </div>
              </td>
              <td>
                <div class="photo-thumbnail ripple" @click="showPhoto(item)">
                   <img :src="item.photo" @error="handleImgError" alt="Presensi">
                   <div class="photo-overlay"><i class="fas fa-eye"></i></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Compact Mobile List -->
      <div class="d-lg-none mobile-compact-list animate-fade">
        <div v-for="item in presensiList" :key="item.id" class="mobile-item glass-effect mb-2" @click="showPhoto(item)">
          <div class="item-main-info">
            <div class="d-flex justify-content-between">
              <span class="p-name">{{ item.nama }}</span>
              <span :class="getStatusClass(item.status, true)">{{ getShortStatus(item.status) }}</span>
            </div>
            <div class="p-sub mt-1">
              <span class="text-primary fw-bold">{{ formatDateOnly(item.jam_datang) }}</span>
              <span class="mx-1">•</span>
              <span class="text-dark fw-semibold">{{ formatTimeOnly(item.jam_datang) }}</span>
              <span class="mx-1">•</span>
              <span>{{ item.shift }}</span>
            </div>
            <div class="p-sub mt-0.5">
              <span class="text-truncate">{{ item.nama_departemen }}</span>
            </div>
          </div>
          <div class="item-meta">
            <i class="fas fa-camera text-muted"></i>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-footer mt-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap">
          <p class="text-muted small mb-0">Menampilkan {{ pagination.from }}-{{ pagination.to }} dari {{ pagination.total }} data</p>
          <nav>
            <ul class="pagination pagination-modern mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li class="page-item active"><a class="page-link" href="#">{{ pagination.current_page }}</a></li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <div v-if="photoModal.show" class="photo-modal-overlay" @click="closePhoto">
      <div class="photo-modal-content animate-zoom" @click.stop>
        <button class="btn-close-modal" @click="closePhoto"><i class="fas fa-times"></i></button>
        <div class="modal-header-simple">
          <h5>{{ photoModal.data.nama }}</h5>
          <p class="small text-white-50">{{ photoModal.data.shift }} • {{ photoModal.data.status }}</p>
        </div>
        <div class="modal-body-img">
          <img :src="photoModal.data.photo" @error="handleImgError" alt="Evidence">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import temporaryPresensiService from '@/services/temporaryPresensiService';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

const loading = ref(false);
const presensiList = ref([]);
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
});

const filters = reactive({
  search: '',
  status: ''
});

const stats = reactive({
  tepat_waktu: 0,
  terlambat: 0
});

const photoModal = reactive({
  show: false,
  data: {}
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      search: filters.search,
      status: filters.status,
      limit: 15
    };
    const response = await temporaryPresensiService.get(params);
    presensiList.value = response.data.data.data;
    
    // Update Pagination
    const pagin = response.data.data;
    pagination.current_page = pagin.current_page;
    pagination.last_page = pagin.last_page;
    pagination.total = pagin.total;
    pagination.from = pagin.from;
    pagination.to = pagin.to;

    // Calc simple stats for this page/list
    stats.tepat_waktu = presensiList.value.filter(i => i.status.includes('Tepat')).length;
    stats.terlambat = presensiList.value.filter(i => i.status.includes('Terlambat')).length;

  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    loading.value = false;
  }
};

const onSearch = debounce(() => {
  pagination.current_page = 1;
  fetchData();
}, 500);

const goToPage = (page) => {
  if (page < 1 || page > pagination.last_page) return;
  pagination.current_page = page;
  fetchData();
};

const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

const formatTimeOnly = (date) => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};

const formatDateOnly = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY');
};

const getShortStatus = (status) => {
  if (status.includes('Tepat')) return 'TEPAT';
  if (status.includes('Terlambat Toleransi')) return 'TOLERANSI';
  if (status.includes('Terlambat I')) return 'TLT I';
  if (status.includes('Terlambat II')) return 'TLT II';
  return status;
};

const getStatusClass = (status, isMobile = false) => {
  let base = isMobile ? 'p-badge-mobile ' : 'badge-status ';
  if (status.includes('Tepat')) return base + 'status-success';
  if (status.includes('Terlambat Toleransi')) return base + 'status-warning';
  return base + 'status-danger';
};

const showPhoto = (item) => {
  photoModal.data = item;
  photoModal.show = true;
};

const closePhoto = () => {
  photoModal.show = false;
};

const handleImgError = (e) => {
  e.target.src = 'https://placehold.co/600x400/e9ecef/adb5bd?text=No+Photo';
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.temporary-presensi-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Glass Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Header & Stats */
.page-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  transition: all 0.3s ease;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 15px;
}

.bg-soft-primary { background: #e0f2fe; color: #0284c7; }
.bg-soft-success { background: #dcfce7; color: #16a34a; }
.bg-soft-danger { background: #fee2e2; color: #dc2626; }

.stat-info .stat-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-info .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
}

/* Filter Card */
.filter-card {
  padding: 20px;
}

.form-label-custom {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.modern-input, .modern-select {
  padding-left: 45px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  height: 45px;
  font-size: 14px;
}

.modern-select {
  padding-left: 15px;
}

.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0 25px;
  height: 45px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Table Design */
.modern-table {
  margin-bottom: 0;
}

.modern-table thead th {
  background: #f1f5f9;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  padding: 15px 20px;
}

.modern-table tbody tr {
  transition: all 0.2s;
}

.modern-table tbody tr:hover {
  background: rgba(241, 245, 249, 0.5);
}

.modern-table td {
  padding: 15px 20px;
  vertical-align: middle;
  border-color: #f1f5f9;
}

.pegawai-name { font-weight: 700; color: #1e293b; }
.badge-shift {
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.badge-status {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-success { background: #dcfce7; color: #166534; }
.status-warning { background: #fef9c3; color: #854d0e; }
.status-danger { background: #fee2e2; color: #991b1b; }

.time-item { font-size: 13px; margin-bottom: 4px; }

/* Photo Thumbnail */
.photo-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: 0.3s;
}

.photo-thumbnail:hover .photo-overlay {
  opacity: 1;
}

/* Compact Mobile List */
.mobile-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-item:active {
  background: rgba(241, 245, 249, 0.8);
  transform: scale(0.98);
}

.item-main-info {
  flex: 1;
  min-width: 0;
}

.p-name { 
  font-weight: 700; 
  color: #1e293b; 
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-sub { 
  display: flex;
  align-items: center;
  font-size: 11px; 
  color: #64748b; 
}

.p-badge-mobile {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
  margin-left: 10px;
}

.item-meta {
  margin-left: 15px;
  font-size: 16px;
}

/* Photo Modal */
.photo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.photo-modal-content {
  max-width: 600px;
  width: 100%;
  background: #1e293b;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.btn-close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  z-index: 10;
}

.modal-header-simple {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-header-simple h5 { margin: 0; color: white; font-weight: 700; }

.modal-body-img {
  padding: 10px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body-img img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  object-fit: contain;
}

/* Utilities */
.ripple {
  position: relative;
  overflow: hidden;
}

.animate-up {
  animation: slideUp 0.4s ease-out backwards;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

.animate-zoom {
  animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Loading State */
.loading-state, .empty-state {
  padding: 100px 20px;
  text-align: center;
}

.empty-icon { font-size: 60px; opacity: 0.3; }

.pagination-modern .page-link {
  border: none;
  background: transparent;
  color: #475569;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px !important;
  margin: 0 4px;
  font-weight: 700;
}

.pagination-modern .active .page-link {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

/* Responsive Overrides */
@media (max-width: 768px) {
  .temporary-presensi-container { padding: 10px; }
  .stats-row { grid-template-columns: 1fr; }
  .stat-card { padding: 15px; }
  .modal-body-img { height: 300px; }
}
</style>
