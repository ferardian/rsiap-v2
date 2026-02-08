<template>
  <div class="patient-data-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="fas fa-procedures"></i>
          Data Pasien
        </h2>
        <p class="page-subtitle">Kelola dan cari data pasien RSIA Aisyiyah</p>
      </div>

      <div class="header-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            placeholder="Cari Nama, No. RM, atau Alamat..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Memuat data pasien...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && patients.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-user-slash"></i>
      </div>
      <h3>Tidak ada data pasien</h3>
      <p>Coba ubah kata kunci pencarian Anda</p>
    </div>

    <!-- Data Content -->
    <div v-else>
      <!-- Desktop View (Table) -->
      <div class="desktop-view hidden-mobile">
        <div class="table-responsive">
          <table class="table custom-table">
            <thead>
              <tr>
                <th width="15%">No. RM</th>
                <th width="25%">Nama Pasien</th>
                <th width="10%">JK</th>
                <th width="20%">TTL</th>
                <th width="30%">Alamat</th>
                <th width="10%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in patients" :key="patient.no_rkm_medis">
                <td>
                  <span class="badge-rm">{{ patient.no_rkm_medis }}</span>
                </td>
                <td>
                  <div class="patient-name">{{ patient.nm_pasien }}</div>
                  <small class="text-muted" v-if="patient.no_ktp">{{ patient.no_ktp }}</small>
                </td>
                <td>
                  <span :class="['badge-gender', patient.jk === 'L' ? 'male' : 'female']">
                    {{ patient.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </span>
                </td>
                <td>
                  <div class="dob-info">
                    <div>{{ patient.tmp_lahir }}</div>
                    <div class="text-muted">{{ formatDate(patient.tgl_lahir) }}</div>
                  </div>
                </td>
                <td>
                  <div class="address-info">{{ patient.alamat || '-' }}</div>
                </td>
                <td>
                    <button class="btn-action" @click="viewDetail(patient)" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="mobile-view hidden-desktop">
        <div class="patient-card" v-for="patient in patients" :key="patient.no_rkm_medis">
          <div class="card-header">
            <span class="rm-tag">#{{ patient.no_rkm_medis }}</span>
            <span :class="['gender-dot', patient.jk === 'L' ? 'male' : 'female']"></span>
          </div>
          <div class="card-body">
            <h3 class="card-name">{{ patient.nm_pasien }}</h3>
            <div class="card-meta">
              <div class="meta-item">
                <i class="fas fa-birthday-cake"></i>
                <span>{{ formatDate(patient.tgl_lahir) }} ({{ patient.tmp_lahir }})</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ patient.alamat || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
             <button class="btn-detail-mobile" @click="viewDetail(patient)">
                Lihat Detail <i class="fas fa-chevron-right"></i>
             </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <div class="pagination-info">
          Menampilkan {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="current-page">{{ pagination.current_page }}</span>
          <button 
            class="btn-page" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import pasienService from '../../services/pasienService';
import { debounce } from 'lodash';

// State
const patients = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
  per_page: 15
});

// Search handler with debounce
const handleSearch = debounce(async (e) => {
  pagination.value.current_page = 1;
  await fetchPatients();
}, 500);

// Fetch data
const fetchPatients = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.current_page,
      limit: pagination.value.per_page,
    };

    // If search query is present, use the search endpoint logic (Orion)
    // Adjust logic based on your backend. Usually Orion expects a JSON payload for search
    // Or simpler query params if standard controller.
    // Based on pasienService from exploration: searchPasien(searchParams) -> api.post('/pasien/search', searchParams)
    
    let response;
    
    if (searchQuery.value) {
        // Construct Orion search payload
        const searchPayload = {
            search: {
                value: searchQuery.value
            },
            limit: pagination.value.per_page,
            page: pagination.value.current_page
        };
        response = await pasienService.searchPasien(searchPayload);
    } else {
        // Use the same search endpoint but with empty search to get paginated list
        // Or specific logic if backend differs. 
        // Assuming searchPasien handles empty search gracefully or we pass empty string.
         const searchPayload = {
            search: {
                value: ''
            },
            limit: pagination.value.per_page,
            page: pagination.value.current_page
        };
        response = await pasienService.searchPasien(searchPayload);
    }

    if (response.data && response.data.data) {
      patients.value = response.data.data;
      // Map pagination data from Orion response structure (usually meta or direct properties)
      // Assuming typical Laravel/Orion pagination structure
      pagination.value = {
        current_page: response.data.current_page || response.data.meta?.current_page || 1,
        last_page: response.data.last_page || response.data.meta?.last_page || 1,
        total: response.data.total || response.data.meta?.total || 0,
        from: response.data.from || response.data.meta?.from || 0,
        to: response.data.to || response.data.meta?.to || 0,
        per_page: response.data.per_page || response.data.meta?.per_page || 15
      };
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Optional: Toast error
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return;
  pagination.value.current_page = page;
  fetchPatients();
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const viewDetail = (patient) => {
  // Placeholder for future detail view or modal
  console.log('View detail:', patient);
  // You might want to router push to detail page if it exists
  // router.push({ name: 'PasienDetail', params: { id: patient.no_rkm_medis } });
};

onMounted(() => {
  fetchPatients();
});
</script>

<style scoped>
.patient-data-container {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header Styles */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: #3498db;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

/* Search Box */
.header-actions {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 350px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  outline: none;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.empty-icon {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

/* Desktop Table */
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.custom-table thead th {
  background-color: #f8f9fa;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #636e72;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #eef2f7;
}

.custom-table tbody tr {
  transition: background-color 0.2s;
}

.custom-table tbody tr:hover {
  background-color: #f1f8ff;
}

.custom-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f2f6;
  color: #2d3436;
}

.badge-rm {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: 'Roboto Mono', monospace;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.badge-gender {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-gender.male {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-gender.female {
  background-color: #fce4ec;
  color: #c2185b;
}

.address-info {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-action {
    background: none;
    border: none;
    color: #95a5a6;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0.5rem;
    font-size: 1.1rem;
}

.btn-action:hover {
    color: #3498db;
}

/* Mobile Card View */
.mobile-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.patient-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rm-tag {
  background-color: #f5f6fa;
  color: #7f8c8d;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.gender-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.gender-dot.male { background-color: #2ecc71; }
.gender-dot.female { background-color: #e91e63; }

.card-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #636e72;
}

.meta-item i {
  margin-top: 0.2rem;
  color: #b2bec3;
  width: 16px;
}

.card-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f5f5f5;
}

.btn-detail-mobile {
    width: 100%;
    background: #f8f9fa;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    color: #2c3e50;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0 0.5rem;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page:hover:not(:disabled) {
  border-color: #3498db;
  color: #3498db;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.current-page {
  font-weight: 600;
  color: #2c3e50;
}

/* Responsive Utilities */
@media (max-width: 768px) {
  .hidden-mobile { display: none; }
  .hidden-desktop { display: flex; }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .page-header {
      flex-direction: column;
      align-items: flex-start;
  }
  
  .header-content {
      width: 100%;
  }

  .header-actions {
      width: 100%;
  }

  .search-box {
      max-width: 100%;
  }

  .patient-data-container {
      padding: 1rem;
  }
}

@media (min-width: 769px) {
  .hidden-mobile { display: block; }
  .hidden-desktop { display: none; }
}
</style>
