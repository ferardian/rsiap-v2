<template>
  <div class="statistik-tab">
    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.total || 0 }}</h3>
            <p>Total Karyawan</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card medis">
          <div class="stat-icon">
            <i class="fas fa-male"></i>
          </div>
          <div class="stat-info">
            <h3>{{ getGenderCount('L') }}</h3>
            <p>Laki-laki</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card non-medis">
          <div class="stat-icon">
            <i class="fas fa-female"></i>
          </div>
          <div class="stat-info">
            <h3>{{ getGenderCount('P') }}</h3>
            <p>Perempuan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kelompok Profesi (Modern Grid Style) -->
    <h5 class="section-title mb-3"><i class="fas fa-user-md me-2"></i>Berdasarkan Kelompok Profesi</h5>
    <div class="profession-grid mb-5">
      <template v-if="stats.kelompok_profesi?.length">
        <div v-for="(item, index) in stats.kelompok_profesi" :key="index"
             class="prof-card clickable"
             :style="{ borderLeftColor: getProfessionDetail(item.name).color }"
             @click="showDetails('Profesi: ' + item.name, item.filter_key, item.filter_val)">
          
          <div class="d-flex align-items-center gap-3 w-100">
            <div class="prof-icon-wrapper" :style="{ background: getProfessionDetail(item.name).bg, color: getProfessionDetail(item.name).color }">
              <i :class="getProfessionDetail(item.name).icon"></i>
            </div>

            <div class="prof-info flex-grow-1">
              <span class="prof-label d-block text-uppercase">{{ item.name }}</span>
              <h4 class="prof-value mb-0">{{ item.count }} <small class="text-muted fs-6 fw-normal">Orang</small></h4>
            </div>
            
            <div class="prof-arrow">
               <i class="fas fa-chevron-right" style="color: #cbd5e1"></i>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center text-muted py-3 w-100">Belum ada data</div>
    </div>

    <!-- Gender & Status Kerja Row -->
    <div class="row g-4 mb-5">
      <!-- Gender -->
      <div class="col-md-6">
        <h5 class="section-title mb-3"><i class="fas fa-venus-mars me-2"></i>Berdasarkan Gender</h5>
        <div class="category-card h-100">
          <div class="category-body pt-4">
            <div class="d-flex justify-content-around align-items-center h-100">
              <div v-for="g in stats.gender" :key="g.code" 
                   class="text-center gender-item clickable"
                   @click="showDetails('Gender: ' + g.name, 'jk', g.code)">
                <div class="gender-icon mb-2" :class="g.code === 'L' ? 'male' : 'female'">
                  <i :class="g.code === 'L' ? 'fas fa-male' : 'fas fa-female'"></i>
                </div>
                <h3 class="mb-0 fw-bold">{{ g.count }}</h3>
                <span class="text-muted">{{ g.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Kerja -->
      <div class="col-md-6">
        <h5 class="section-title mb-3"><i class="fas fa-id-card-alt me-2"></i>Berdasarkan Status Kerja</h5>
        <div class="category-card h-100">
          <div class="category-body">
            <template v-if="stats.status_kerja?.length">
              <div v-for="(item, index) in stats.status_kerja" :key="index" 
                   class="profession-item clickable"
                   @click="showDetails('Status: ' + item.name, 'stts_kerja', item.name)">
                <span class="prof-name w-50">{{ item.name }}</span>
                <span class="prof-count me-3">{{ item.count }}</span>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill status" :style="{ width: calculatePercentage(item.count, stats.total) + '%' }"></div>
                </div>
              </div>
            </template>
            <div v-else class="text-center text-muted py-3">Belum ada data</div>
          </div>
        </div>
      </div>
    </div>


    <!-- Unit Kerja (Modern Grid Style) -->
    <h5 class="section-title mb-3"><i class="fas fa-hospital-user me-2"></i>Berdasarkan Unit Kerja</h5>
    <div class="unit-grid-modern mb-4">
      <template v-if="stats.unit_kerja?.length">
        <div v-for="(item, index) in stats.unit_kerja" :key="index" 
             class="unit-card clickable"
             @click="showDetails('Unit: ' + item.name, 'departemen', item.name)">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="unit-info flex-grow-1">
              <span class="unit-name-modern text-truncate d-block" :title="item.name">{{ item.name }}</span>
              <div class="unit-stats mt-1">
                <span class="count-badge">{{ item.count }} Orang</span>
                <span class="percentage-text">{{ calculatePercentage(item.count, stats.total) }}%</span>
              </div>
            </div>
            <div class="unit-icon-modern">
              <i class="fas fa-building"></i>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center text-muted py-3 w-100">Belum ada data</div>
    </div>

    <!-- Pendidikan (Modern Grid Style) -->
    <h5 class="section-title mb-3"><i class="fas fa-graduation-cap me-2"></i>Berdasarkan Pendidikan</h5>
    <div class="pendidikan-grid-modern mb-4">
      <template v-if="stats.pendidikan?.length">
        <div v-for="(item, index) in stats.pendidikan" :key="index" 
             class="pendidikan-card clickable"
             @click="showDetails('Pendidikan: ' + item.name, 'pendidikan', item.name)">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="pendidikan-info flex-grow-1">
              <span class="pendidikan-name text-truncate d-block" :title="item.name">{{ item.name }}</span>
              <div class="pendidikan-stats mt-1">
                <span class="count-badge">{{ item.count }} Orang</span>
                <span class="percentage-text">{{ calculatePercentage(item.count, stats.total) }}%</span>
              </div>
            </div>
            <div class="pendidikan-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="text-center text-muted py-3 w-100">Belum ada data</div>
    </div>


    <!-- Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="custom-modal">
        <div class="modal-header-modern">
          <div class="header-top">
            <div class="header-content">
              <h5 class="modal-title">{{ modalTitle }}</h5>
              <span class="employee-count">{{ filteredDetailList.length }} dari {{ detailList.length }} Karyawan</span>
            </div>
            <button class="btn-close-modern" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Search Bar -->
          <div class="search-bar-container">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery"
                class="search-input" 
                placeholder="Cari nama atau NIK karyawan..."
                @input="filterEmployees"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                <i class="fas fa-times-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-body-modern">
          <div v-if="modalLoading" class="loading-state">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Memuat data...</p>
          </div>
          
          <div v-else-if="filteredDetailList.length === 0" class="empty-state">
            <i class="fas fa-search empty-icon"></i>
            <p class="empty-text">Tidak ada karyawan ditemukan</p>
            <small class="text-muted">Coba ubah kata kunci pencarian</small>
          </div>

          <div v-else class="employee-grid">
            <div v-for="emp in filteredDetailList" :key="emp.nik" class="employee-card">
              <div class="employee-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="employee-details">
                <h6 class="employee-name">{{ emp.nama }}</h6>
                <div class="employee-meta">
                  <span class="meta-item">
                    <i class="fas fa-id-badge"></i>
                    {{ emp.nik }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-briefcase"></i>
                    {{ emp.jbtn }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-building"></i>
                    {{ emp.departemen }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pegawaiService } from '@/services/pegawaiService'

const loading = ref(true)
const stats = ref({})

// Modal State
const showModal = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('')
const detailList = ref([])
const searchQuery = ref('')
const filteredDetailList = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const response = await pegawaiService.getStatistik()
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  } finally {
    loading.value = false
  }
}

const showDetails = async (title, filterKey, filterValue, isMedis = null) => {
  modalTitle.value = title
  showModal.value = true
  modalLoading.value = true
  detailList.value = []

  try {
    const params = {
      [filterKey]: filterValue,
      limit: 500 // Get enough data
    }
    
    // Add is_medis filter if provided (strictly true/false)
    if (isMedis !== null) {
      params.is_medis = isMedis
    }

    const response = await pegawaiService.getKaryawanList(params)
    // Adjust based on updated list endpoint structure
    detailList.value = response.data.data || response.data
    filteredDetailList.value = detailList.value
    searchQuery.value = ''
  } catch (error) {
    console.error('Error details:', error)
    detailList.value = []
    filteredDetailList.value = []
  } finally {
    modalLoading.value = false
  }
}

const filterEmployees = () => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredDetailList.value = detailList.value
    return
  }
  
  filteredDetailList.value = detailList.value.filter(emp => {
    return emp.nama.toLowerCase().includes(query) || 
           emp.nik.toLowerCase().includes(query)
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredDetailList.value = detailList.value
}

const closeModal = () => {
  showModal.value = false
}

const getGenderCount = (code) => {
  if (!stats.value.gender) return 0;
  const gender = stats.value.gender.find(g => g.code === code);
  return gender ? gender.count : 0;
}

const calculatePercentage = (value, total) => {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

const getProfessionDetail = (name) => {
  const map = {
    'MEDIS': { color: '#10b981', bg: '#ecfdf5', icon: 'fas fa-user-md', label: 'Dokter' },
    'PERAWAT': { color: '#3b82f6', bg: '#eff6ff', icon: 'fas fa-user-nurse', label: 'Perawat' },
    'BIDAN': { color: '#ec4899', bg: '#fce7f3', icon: 'fas fa-baby', label: 'Bidan' },
    'FARMASI': { color: '#f59e0b', bg: '#fffbeb', icon: 'fas fa-pills', label: 'Farmasi' },
    'ANALIS': { color: '#8b5cf6', bg: '#f5f3ff', icon: 'fas fa-microscope', label: 'Analis' },
    'GIZI': { color: '#ef4444', bg: '#fef2f2', icon: 'fas fa-apple-alt', label: 'Gizi' },
    'RADIOGRAFER': { color: '#06b6d4', bg: '#ecfeff', icon: 'fas fa-x-ray', label: 'Radiografer' },
    'SANITARIAN': { color: '#14b8a6', bg: '#f0fdfa', icon: 'fas fa-leaf', label: 'Sanitarian' },
    'TEKNISI ELEKTROMEDIS': { color: '#6366f1', bg: '#eef2ff', icon: 'fas fa-tools', label: 'Elektromedis' },
    'RM': { color: '#d97706', bg: '#fffbeb', icon: 'fas fa-file-medical', label: 'Rekam Medis' },
    'NON MEDIS': { color: '#64748b', bg: '#f8fafc', icon: 'fas fa-user-tie', label: 'Non Medis' }
  }
  return map[name] || { color: '#64748b', bg: '#f8fafc', icon: 'fas fa-user', label: name }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.section-title {
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
  padding-left: 0.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
.stat-card.medis .stat-icon { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.stat-card.non-medis .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }

.stat-info h3 { margin: 0; font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1; }
.stat-info p { margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.875rem; font-weight: 500; }

.category-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

.category-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-header.medis-header { background: #eff6ff; color: #1e40af; }
.category-header.non-medis-header { background: #ecfdf5; color: #065f46; }
.category-body {
  padding: 1.25rem;
  max-height: 400px; /* Fixed height for scrollable area */
  overflow-y: auto; /* Enable vertical scroll */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Custom Scrollbar for Webkit */
.category-body::-webkit-scrollbar {
  width: 6px;
}
.category-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.category-body::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

/* Clickable Items */
.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0.5rem;
  border-radius: 8px;
}
.clickable:hover {
  background-color: #f8fafc;
}

.profession-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0; /* More compact padding */
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.profession-item:last-child {
  border-bottom: none;
}

.profession-item.clickable:hover {
  background-color: #f8fafc;
  padding-left: 0.5rem; /* Indent effect on hover */
  padding-right: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.prof-name {
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem; /* Slightly smaller text */
  flex: 1;
  padding-right: 1rem;
}

.prof-count-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 140px; /* Fixed width for alignment */
  justify-content: flex-end;
}

.prof-count {
  font-weight: 600;
  color: #1e293b;
  min-width: 30px;
  text-align: right;
  font-size: 0.9rem;
}

.progress-bar-bg {
  flex-grow: 1;
  height: 6px; /* Thinner bar */
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  max-width: 80px;
}
.progress-bar-bg.sm { height: 4px; }
.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-bar-fill.medis {
  background: linear-gradient(90deg, #4f46e5, #6366f1);
}

.progress-bar-fill.non-medis {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-bar-fill.status {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-bar-fill.unit {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

/* Gender */
.gender-item {
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #f8fafc;
  width: 45%;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.gender-item.clickable:hover {
  background-color: #fff;
  border-color: #cbd5e1;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.gender-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.gender-icon.male { background: #e0f2fe; color: #3b82f6; }
.gender-icon.female { background: #fce7f3; color: #ec4899; }


/* Profession Grid */
.profession-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.prof-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.prof-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
  cursor: pointer;
}

.prof-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.prof-info {
  min-width: 0;
}

.prof-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.prof-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.prof-arrow {
  opacity: 0.4;
  transition: all 0.3s ease;
}

.prof-card:hover .prof-arrow {
  opacity: 1;
  transform: translateX(4px);
}


/* Pendidikan Grid Modern */
.pendidikan-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.875rem;
  padding: 0.5rem;
}

.pendidikan-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.pendidikan-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
  cursor: pointer;
}

.pendidikan-info {
  min-width: 0;
  padding-right: 0.75rem;
}

.pendidikan-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.3;
}

.pendidikan-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pendidikan-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.pendidikan-card:hover .pendidikan-icon {
  background: #dbeafe;
  color: #2563eb;
  transform: scale(1.1);
}

/* Unit Kerja Grid Modern */
.unit-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.875rem;
  padding: 0.5rem;
}

.unit-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.unit-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
  cursor: pointer;
}

.unit-info {
  min-width: 0;
  padding-right: 0.75rem;
}

.unit-name-modern {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.3;
}

.unit-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-icon-modern {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.unit-card:hover .unit-icon-modern {
  background: #fef3c7;
  color: #f59e0b;
  transform: scale(1.1);
}

/* Unit Kerja Grid */
.unit-kerja-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}
.jabatan-grid {
  padding: 1.25rem 1rem; /* Increased padding top/bottom to match card body */
}
.jabatan-grid::after {
  content: "";
  height: 1px;
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}
.unit-item {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.unit-name { font-size: 0.85rem; font-weight: 600; color: #475569; }


/* Modal Detail - Modern Design */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-modal {
  background: white;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header-modern {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.employee-count {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-close-modern {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modern:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.search-bar-container {
  margin-top: 1rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: white;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-search:hover {
  color: #64748b;
}

.modal-body-modern {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8fafc;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.employee-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.employee-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #cbd5e1;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-meta {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.meta-item i {
  width: 14px;
  color: #94a3b8;
  font-size: 0.75rem;
}

/* Scrollbar Styling */
.modal-body-modern::-webkit-scrollbar {
  width: 8px;
}

.modal-body-modern::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-body-modern::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-body-modern::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
