<template>
  <div class="statistik-tab">
    <!-- Filter Section -->
    <div class="filter-bar mb-4">
      <div class="d-flex align-items-center gap-3">
        <label class="filter-label"><i class="fas fa-calendar-alt me-2"></i>Periode Tahun:</label>
        <select v-model="selectedYear" class="form-select filter-select" @change="fetchData">
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
        <div v-if="loading" class="spinner-border spinner-border-sm text-primary" role="status"></div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.total || 0 }}</h3>
            <p>Total Karyawan Aktif</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card masuk">
          <div class="stat-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.total_masuk_tahun || 0 }}</h3>
            <p>{{ isCurrentYear ? 'Masuk (Tahun Ini)' : 'Total Masuk (' + selectedYear + ')' }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card keluar">
          <div class="stat-icon">
            <i class="fas fa-user-minus"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.total_keluar_tahun || 0 }}</h3>
            <p>{{ isCurrentYear ? 'Keluar (Tahun Ini)' : 'Total Keluar (' + selectedYear + ')' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kelompok Profesi (Premium Design) -->
    <h5 class="section-title mb-3"><i class="fas fa-user-md me-2"></i>Distribusi Kelompok Profesi</h5>
    <div class="category-card mb-5 overflow-hidden">
      <div class="category-body p-0">
        <div class="row g-0 align-items-stretch">
          <!-- Chart Column -->
          <div class="col-lg-4 d-flex align-items-center justify-content-center p-4 bg-white position-relative">
            <div class="profession-chart-container w-100">
              <VueApexCharts 
                type="treemap" 
                height="320" 
                :options="professionChartOptions" 
                :series="professionChartSeries"
              />
            </div>
            <!-- Refined Separator -->
            <div class="v-separator d-none d-lg-block"></div>
          </div>
          <!-- Grid Column -->
          <div class="col-lg-8 p-4">
            <div class="profession-grid-premium">
              <template v-if="stats.kelompok_profesi?.length">
                <div v-for="(item, index) in stats.kelompok_profesi" :key="index"
                     class="prof-card-premium clickable"
                     :style="{ '--prof-color': getProfessionDetail(item.name).color, '--prof-bg': getProfessionDetail(item.name).bg }"
                     @click="showDetails('Profesi: ' + item.name, item.filter_key, item.filter_val)">
                  
                  <div class="prof-icon-box">
                    <i :class="getProfessionDetail(item.name).icon"></i>
                  </div>
                  
                  <div class="prof-content-box">
                    <span class="prof-tag">{{ item.name }}</span>
                    <h3 class="prof-number">
                      {{ item.count }} <small>Orang</small>
                      <span class="prof-percentage">({{ calculatePercentage(item.count, stats.total) }}%)</span>
                    </h3>
                  </div>
                  
                  <div class="prof-arrow-premium">
                    <i class="fas fa-arrow-right"></i>
                  </div>
                </div>
              </template>
              <div v-else class="text-center text-muted py-5 w-100">
                <i class="fas fa-box-open fa-3x mb-3 opacity-25"></i>
                <p>Belum ada data profesi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gender & Status Kerja Row -->
    <div class="row g-4 mb-5">
      <!-- Gender -->
      <div class="col-md-6">
        <h5 class="section-title mb-3"><i class="fas fa-venus-mars me-2"></i>Berdasarkan Gender</h5>
        <div class="category-card h-100 overflow-hidden">
          <div class="category-body p-4 d-flex flex-column justify-content-center h-100">
            <div class="row g-3 align-items-center">
               <!-- Chart Column -->
               <div class="col-sm-5 border-end pe-3">
                  <div v-if="stats.gender?.length" class="gender-chart-wrapper d-flex align-items-center justify-content-center h-100">
                    <VueApexCharts 
                      type="donut" 
                      height="260" 
                      :options="genderChartOptions" 
                      :series="genderChartSeries"
                    />
                  </div>
               </div>
               <!-- Cards Column -->
               <div class="col-sm-7 ps-3 d-flex flex-column justify-content-center h-100">
                  <div class="d-flex flex-column gap-3">
                    <div v-for="g in stats.gender" :key="g.code" 
                         class="gender-card-premium clickable"
                         :class="g.code === 'L' ? 'male' : 'female'"
                         @click="showDetails('Gender: ' + g.name, 'jk', g.code)">
                      <div class="gender-icon-mini">
                        <i :class="g.code === 'L' ? 'fas fa-male' : 'fas fa-female'"></i>
                      </div>
                      <div class="gender-info-mini">
                        <span class="gender-label-mini">{{ g.name }}</span>
                        <h4 class="gender-value-mini">{{ g.count }} <small>Orang</small></h4>
                      </div>
                      <div class="gender-percentage-mini">
                         {{ calculatePercentage(g.count, stats.total) }}%
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Kerja -->
      <div class="col-md-6">
        <h5 class="section-title mb-3"><i class="fas fa-id-card-alt me-2"></i>Berdasarkan Status Kerja</h5>
        <div class="category-card h-100 overflow-hidden">
          <div class="category-body p-4 d-flex flex-column justify-content-center h-100 no-scroll">
            <div class="row g-3 align-items-center">
              <!-- Chart Column -->
              <div class="col-sm-5 border-end pe-3">
                 <div v-if="stats.status_kerja?.length" class="status-chart-wrapper">
                    <VueApexCharts 
                      type="pie" 
                      height="200" 
                      :options="statusChartOptions" 
                      :series="statusChartSeries"
                    />
                 </div>
              </div>
              <!-- List Column -->
              <div class="col-sm-7 ps-3">
                <div class="status-list-compact">
                  <template v-if="stats.status_kerja?.length">
                      <div v-for="(item, index) in stats.status_kerja" :key="index" 
                         class="status-item-premium clickable"
                         :class="{ 'is-highlighted': hoveredStatusIndex === index }"
                         @click="showDetails('Status: ' + item.name, 'stts_kerja', item.name)"
                         @mouseenter="hoveredStatusIndex = index"
                         @mouseleave="hoveredStatusIndex = null">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="status-label-mini">{{ item.name }}</span>
                        <span class="status-value-mini">
                          {{ item.count }}
                          <small class="text-muted ms-1">({{ calculatePercentage(item.count, stats.total) }}%)</small>
                        </span>
                      </div>
                      <div class="progress-mini">
                        <div class="progress-bar-mini" :style="{ width: calculatePercentage(item.count, stats.total) + '%', background: getStatusColor(index) }"></div>
                      </div>
                    </div>
                  </template>
                  <div v-else class="text-center text-muted py-3">Belum ada data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Unit Kerja -->
      <div class="col-md-12 mt-4">
        <h5 class="section-title mb-3"><i class="fas fa-building me-2"></i>Berdasarkan Unit Kerja</h5>
        <div class="category-card h-100 overflow-hidden">
          <div class="category-body p-4 d-flex flex-column justify-content-center h-100 no-scroll">
             <div class="row g-4 align-items-stretch">
                <!-- Chart Column -->
                <div class="col-lg-4 border-end pe-4">
                   <div class="chart-header-mini mb-3">
                      <span class="badge bg-primary-subtle text-primary fw-bold">Semua Unit</span>
                   </div>
                   <div v-if="stats.unit_kerja?.length" class="unit-chart-wrapper scrollable-chart">
                      <VueApexCharts 
                        type="bar" 
                        :height="stats.unit_kerja.length * 30 + 100" 
                        :options="unitChartOptions" 
                        :series="unitChartSeries"
                      />
                   </div>
                </div>
                <!-- Grid Column -->
                <div class="col-lg-8 ps-4">
                  <div class="unit-kerja-grid-premium">
                    <template v-if="stats.unit_kerja?.length">
                      <div v-for="(item, index) in stats.unit_kerja" :key="index" 
                           class="unit-card-premium-modern clickable"
                           :class="{ 'is-highlighted': hoveredUnitIndex === index }"
                           @click="showDetails('Unit: ' + item.name, 'departemen', item.name)"
                           @mouseenter="hoveredUnitIndex = index"
                           @mouseleave="hoveredUnitIndex = null">
                        <div class="unit-card-content">
                          <div class="unit-main-info">
                            <span class="unit-label-premium">{{ item.name }}</span>
                            <h5 class="unit-count-premium">{{ item.count }} <small>Orang</small></h5>
                          </div>
                          <div class="unit-percent-badge">
                            {{ calculatePercentage(item.count, stats.total) }}%
                          </div>
                        </div>
                        <div class="unit-progress-bar">
                          <div class="unit-progress-fill" :style="{ width: calculatePercentage(item.count, stats.total) + '%' }"></div>
                        </div>
                      </div>
                    </template>
                    <div v-else class="text-center text-muted py-3 w-100">Belum ada data</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

    <!-- Pendidikan -->
    <div class="col-md-12 mt-4">
      <h5 class="section-title mb-3"><i class="fas fa-graduation-cap me-2"></i>Berdasarkan Pendidikan</h5>
      <div class="category-card h-100 overflow-hidden">
        <div class="category-body p-4 d-flex flex-column justify-content-center h-100 no-scroll">
           <div class="row g-4 align-items-stretch">
              <!-- Chart Column -->
              <div class="col-lg-4 border-end pe-4">
                 <div class="chart-header-mini mb-3">
                    <span class="badge bg-purple-subtle text-purple fw-bold">Semua Pendidikan</span>
                 </div>
                 <div v-if="stats.pendidikan?.length" class="edu-chart-wrapper">
                    <VueApexCharts 
                      type="bar" 
                      :height="stats.pendidikan.length * 30 + 100" 
                      :options="educationChartOptions" 
                      :series="educationChartSeries"
                    />
                 </div>
              </div>
              <!-- Grid Column -->
              <div class="col-lg-8 ps-4">
                <div class="edu-grid-premium">
                  <template v-if="stats.pendidikan?.length">
                    <div v-for="(item, index) in stats.pendidikan" :key="index" 
                         class="edu-card-premium-modern clickable"
                         :class="{ 'is-highlighted-edu': hoveredEduIndex === index }"
                         @click="showDetails('Pendidikan: ' + item.name, 'pendidikan', item.name)"
                         @mouseenter="hoveredEduIndex = index"
                         @mouseleave="hoveredEduIndex = null">
                      <div class="edu-card-content">
                        <div class="edu-main-info">
                          <span class="edu-label-premium">{{ item.name }}</span>
                          <h5 class="edu-count-premium">{{ item.count }} <small>Orang</small></h5>
                        </div>
                        <div class="edu-percent-badge">
                          {{ calculatePercentage(item.count, stats.total) }}%
                        </div>
                      </div>
                      <div class="edu-progress-bar">
                        <div class="edu-progress-fill" :style="{ width: calculatePercentage(item.count, stats.total) + '%' }"></div>
                      </div>
                    </div>
                  </template>
                  <div v-else class="text-center text-muted py-3 w-100">Belum ada data</div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Tren Pergerakan Karyawan (Compact Matrix) -->
    <h5 class="section-title mb-3 mt-5"><i class="fas fa-chart-line me-2"></i>Statistik Masuk & Keluar Karyawan {{ selectedYear }}</h5>
    
    <!-- Visual Chart -->
    <div class="category-card mb-3">
       <div class="category-body p-4 pb-1">
          <div v-if="!loading && stats.karyawan_masuk?.length" class="chart-container">
             <VueApexCharts 
                type="area" 
                height="220" 
                :options="chartOptions" 
                :series="chartSeries"
             />
          </div>
          <div v-else-if="loading" class="text-center py-5">
             <div class="spinner-border text-primary" role="status"></div>
          </div>
       </div>
    </div>

    <div class="category-card mb-5 overflow-hidden">
      <div class="category-body px-3 py-0">
        <div class="row g-0">
          <!-- Left Column (Jan - Jun) -->
          <div class="col-md-6 border-end pe-md-3">
              <table class="table table-hover mb-0 movement-table">
                <thead>
                   <tr>
                      <th>Bulan</th>
                      <th class="text-center">Masuk</th>
                      <th class="text-center">Keluar</th>
                      <th class="text-center">Net</th>
                   </tr>
                </thead>
                <tbody>
                   <template v-if="stats.karyawan_masuk?.length">
                      <tr v-for="(item, index) in stats.karyawan_masuk.slice(0, 6)" :key="index">
                         <td class="fw-bold text-secondary small-text">{{ item.label.split(' ')[0] }}</td>
                         <td class="text-center">
                            <span class="badge bg-primary-subtle text-primary rounded-pill px-2 clickable" @click="showMovementDetails(item.month, 'masuk')">
                               {{ item.count }}
                            </span>
                         </td>
                         <td class="text-center">
                            <span class="badge bg-danger-subtle text-danger rounded-pill px-2 clickable" @click="showMovementDetails(item.month, 'keluar')">
                               {{ stats.karyawan_keluar[index]?.count || 0 }}
                            </span>
                         </td>
                         <td class="text-center">
                            <div class="growth-indicator mini" :class="getGrowthClass(item.count, stats.karyawan_keluar[index]?.count || 0)">
                               {{ calculateGrowth(item.count, stats.karyawan_keluar[index]?.count || 0) }}
                            </div>
                         </td>
                      </tr>
                   </template>
                </tbody>
              </table>
          </div>

          <!-- Right Column (Jul - Dec) -->
          <div class="col-md-6 ps-md-3">
              <table class="table table-hover mb-0 movement-table border-start-0">
                <thead>
                   <tr class="d-md-none d-lg-table-row">
                      <th>Bulan</th>
                      <th class="text-center">Masuk</th>
                      <th class="text-center">Keluar</th>
                      <th class="text-center">Net</th>
                   </tr>
                </thead>
                <tbody>
                   <template v-if="stats.karyawan_masuk?.length > 6">
                      <tr v-for="(item, index) in stats.karyawan_masuk.slice(6)" :key="index + 6">
                         <td class="fw-bold text-secondary small-text">{{ item.label.split(' ')[0] }}</td>
                         <td class="text-center">
                            <span class="badge bg-primary-subtle text-primary rounded-pill px-2 clickable" @click="showMovementDetails(item.month, 'masuk')">
                               {{ item.count }}
                            </span>
                         </td>
                         <td class="text-center">
                            <span class="badge bg-danger-subtle text-danger rounded-pill px-2 clickable" @click="showMovementDetails(item.month, 'keluar')">
                               {{ stats.karyawan_keluar[index + 6]?.count || 0 }}
                            </span>
                         </td>
                         <td class="text-center">
                            <div class="growth-indicator mini" :class="getGrowthClass(item.count, stats.karyawan_keluar[index + 6]?.count || 0)">
                               {{ calculateGrowth(item.count, stats.karyawan_keluar[index + 6]?.count || 0) }}
                            </div>
                         </td>
                      </tr>
                   </template>
                   <tr v-else-if="stats.karyawan_masuk?.length <= 6 && stats.karyawan_masuk?.length > 0">
                      <td colspan="4" class="text-center py-4 text-muted small">Data belum tersedia</td>
                   </tr>
                </tbody>
              </table>
          </div>
        </div>
        
        <!-- Grand Total Footer -->
        <div class="movement-footer p-3 border-top">
           <div class="footer-item">
              <span class="label">Total Masuk {{ selectedYear }}:</span>
              <span class="value text-primary ms-2 clickable" @click="showMovementDetails(selectedYear, 'masuk_tahun')">{{ stats.total_masuk_tahun || 0 }}</span>
           </div>
           <div class="footer-divider"></div>
           <div class="footer-item">
              <span class="label">Total Keluar {{ selectedYear }}:</span>
              <span class="value text-danger ms-2 clickable" @click="showMovementDetails(selectedYear, 'keluar_tahun')">{{ stats.total_keluar_tahun || 0 }}</span>
           </div>
           <div class="footer-divider"></div>
           <div class="footer-item">
              <span class="label">Net Growth:</span>
              <div class="growth-indicator mini ms-2" :class="getGrowthClass(stats.total_masuk_tahun || 0, stats.total_keluar_tahun || 0)">
                 {{ calculateGrowth(stats.total_masuk_tahun || 0, stats.total_keluar_tahun || 0) }}
              </div>
           </div>
        </div>
      </div>
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
                placeholder="Cari nama, NIK, jabatan, atau departemen..."
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
              <div class="employee-avatar" :class="emp.jk === 'L' || emp.jk === 'Pria' ? 'male' : 'female'">
                <i :class="emp.jk === 'L' || emp.jk === 'Pria' ? 'fas fa-male' : 'fas fa-female'"></i>
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
                    <i :class="emp.jk === 'L' || emp.jk === 'Pria' ? 'fas fa-mars' : 'fas fa-venus'"></i>
                    {{ emp.jk === 'L' || emp.jk === 'Pria' ? 'Laki-laki' : 'Perempuan' }}
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
import { ref, onMounted, computed } from 'vue'
import { pegawaiService } from '@/services/pegawaiService'
import VueApexCharts from 'vue3-apexcharts'

const loading = ref(true)
const stats = ref({})
const selectedYear = ref(new Date().getFullYear())
const isCurrentYear = computed(() => selectedYear.value == new Date().getFullYear())

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i)
  }
  return years
})

// Modal State
const showModal = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('')
const detailList = ref([])
const searchQuery = ref('')
const filteredDetailList = ref([])

// Status Highlight State
const hoveredStatusIndex = ref(null)
const hoveredUnitIndex = ref(null)
const hoveredEduIndex = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const response = await pegawaiService.getStatistik({ tahun: selectedYear.value })
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
    const nameMatch = emp.nama?.toLowerCase().includes(query)
    const nikMatch = emp.nik?.toLowerCase().includes(query)
    const jbtnMatch = emp.jbtn?.toLowerCase().includes(query)
    const deptMatch = emp.departemen?.toLowerCase().includes(query)
    
    // Gender search improvement
    const jkRaw = emp.jk?.toLowerCase() || ''
    const isMaleKeyword = 'laki-laki'.includes(query) || 'pria'.includes(query) || query === 'l'
    const isFemaleKeyword = 'perempuan'.includes(query) || 'wanita'.includes(query) || query === 'p'
    
    let jkMatch = false
    if (isMaleKeyword) {
      jkMatch = jkRaw === 'l' || jkRaw === 'laki-laki' || jkRaw === 'pria'
    } else if (isFemaleKeyword) {
      jkMatch = jkRaw === 'p' || jkRaw === 'perempuan' || jkRaw === 'wanita'
    } else {
      jkMatch = jkRaw.includes(query)
    }

    return nameMatch || nikMatch || jbtnMatch || deptMatch || jkMatch
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

const calculateMovementPercentage = (value) => {
  const masukMax = stats.value.karyawan_masuk ? Math.max(...stats.value.karyawan_masuk.map(i => i.count), 0) : 0
  const keluarMax = stats.value.karyawan_keluar ? Math.max(...stats.value.karyawan_keluar.map(i => i.count), 0) : 0
  const globalMax = Math.max(masukMax, keluarMax, 1)
  return (value / globalMax) * 100
}

const calculateGrowth = (masuk, keluar) => {
  const diff = masuk - keluar
  return diff > 0 ? `+${diff}` : diff
}

const chartSeries = computed(() => {
  if (!stats.value.karyawan_masuk) return []
  return [
    {
      name: 'Masuk',
      data: stats.value.karyawan_masuk.map(i => i.count)
    },
    {
      name: 'Keluar',
      data: stats.value.karyawan_masuk.map((_, idx) => stats.value.karyawan_keluar[idx]?.count || 0)
    }
  ]
})

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'area',
      height: 250,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Outfit, sans-serif'
    },
    colors: ['#3b82f6', '#f43f5e'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    markers: { size: 5, strokeWidth: 3, hover: { size: 7 } },
    xaxis: {
      categories: stats.value.karyawan_masuk?.map(i => i.label.split(' ')[0]) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontWeight: 600 } }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 700 },
    tooltip: { theme: 'light', x: { show: true } }
  }
})

const professionChartSeries = computed(() => {
  if (!stats.value.kelompok_profesi) return []
  return [
    {
      data: stats.value.kelompok_profesi.map(i => ({
        x: i.name,
        y: i.count
      }))
    }
  ]
})

const professionChartOptions = computed(() => {
  const colors = stats.value.kelompok_profesi?.map(i => getProfessionDetail(i.name).color) || []
  return {
    chart: {
      type: 'treemap',
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false }
    },
    colors: colors,
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '12px', fontWeight: 700 },
      offsetY: -4,
      formatter: function(text, op) {
        return [text, op.value]
      }
    },
    legend: { show: false },
    tooltip: { 
      theme: 'light',
      y: {
        formatter: function (val) {
          return val + " Orang"
        }
      }
    }
  }
})

const genderChartSeries = computed(() => {
  if (!stats.value.gender) return []
  // Ensure consistent order: L (Male) first, then P (Female)
  const male = stats.value.gender.find(g => g.code === 'L')?.count || 0
  const female = stats.value.gender.find(g => g.code === 'P')?.count || 0
  return [male, female]
})

const genderChartOptions = computed(() => {
  return {
    chart: { type: 'donut', fontFamily: 'Outfit, sans-serif' },
    labels: ['Laki-laki', 'Perempuan'],
    colors: ['#3b82f6', '#f472b6'],
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontWeight: 600, color: '#64748b', offsetY: -5 },
            value: { 
              show: true, 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#1e293b', 
              offsetY: 5,
              formatter: (val) => val
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    stroke: { show: false },
    tooltip: { theme: 'light' }
  }
})

const statusChartSeries = computed(() => {
  if (!stats.value.status_kerja) return []
  return stats.value.status_kerja.map(i => i.count)
})

const statusChartOptions = computed(() => {
  const labels = stats.value.status_kerja?.map(i => i.name) || []
  return {
    chart: { 
      type: 'pie', 
      fontFamily: 'Outfit, sans-serif',
      events: {
        dataPointMouseEnter: function(event, chartContext, config) {
          hoveredStatusIndex.value = config.dataPointIndex
        },
        dataPointMouseLeave: function(event, chartContext, config) {
          hoveredStatusIndex.value = null
        }
      }
    },
    labels: labels,
    colors: labels.map((_, i) => getStatusColor(i)),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { theme: 'light' },
    states: {
      hover: { filter: { type: 'darken', value: 0.9 } },
      active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } }
    }
  }
})

const unitChartSeries = computed(() => {
  if (!stats.value.unit_kerja) return []
  return [
    {
      name: 'Jumlah Orang',
      data: stats.value.unit_kerja.map(i => i.count)
    }
  ]
})

const unitChartOptions = computed(() => {
  const categories = stats.value.unit_kerja?.map(i => i.name) || []
  return {
    chart: { 
      type: 'bar', 
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      events: {
        dataPointMouseEnter: function(event, chartContext, config) {
          hoveredUnitIndex.value = config.dataPointIndex
        },
        dataPointMouseLeave: function(event, chartContext, config) {
          hoveredUnitIndex.value = null
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: '75%',
        dataLabels: { position: 'top' }
      }
    },
    colors: categories.map((_, i) => {
        const palettes = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']
        return palettes[i % palettes.length]
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#1e293b'], fontWeight: 800, fontSize: '10px' },
      formatter: function (val) { return val },
      offsetX: 8
    },
    xaxis: {
      categories: categories,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' },
        maxWidth: 160
      }
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'light' }
  }
})

const educationChartSeries = computed(() => {
  if (!stats.value.pendidikan) return []
  return [
    {
      name: 'Jumlah Orang',
      data: stats.value.pendidikan.map(i => i.count)
    }
  ]
})

const educationChartOptions = computed(() => {
  const categories = stats.value.pendidikan?.map(i => i.name) || []
  return {
    chart: { 
      type: 'bar', 
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      events: {
        dataPointMouseEnter: function(event, chartContext, config) {
          hoveredEduIndex.value = config.dataPointIndex
        },
        dataPointMouseLeave: function(event, chartContext, config) {
          hoveredEduIndex.value = null
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: '75%',
        dataLabels: { position: 'top' }
      }
    },
    colors: categories.map((_, i) => {
        const palettes = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
        return palettes[i % palettes.length]
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#1e293b'], fontWeight: 800, fontSize: '10px' },
      formatter: function (val) { return val },
      offsetX: 8
    },
    xaxis: {
      categories: categories,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' },
        maxWidth: 160
      }
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'light' }
  }
})

const getStatusColor = (index) => {
  const palette = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ]
  return palette[index % palette.length]
}

const getGrowthClass = (masuk, keluar) => {
  const diff = masuk - keluar
  if (diff > 0) return 'growth-positive'
  if (diff < 0) return 'growth-negative'
  return 'growth-neutral'
}

const getGrowthIcon = (masuk, keluar) => {
  const diff = masuk - keluar
  if (diff > 0) return 'fas fa-arrow-up'
  if (diff < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const showMovementDetails = (value, type) => {
  let title = ''
  let filterKey = ''
  let filterValue = value
  
  if (type === 'masuk') {
    const monthLabel = stats.value.karyawan_masuk.find(i => i.month === value)?.label || value
    title = `Daftar Karyawan Masuk - ${monthLabel}`
    filterKey = 'bulan_masuk'
  } else if (type === 'keluar') {
    const monthLabel = stats.value.karyawan_masuk.find(i => i.month === value)?.label || value
    title = `Daftar Karyawan Keluar - ${monthLabel}`
    filterKey = 'bulan_keluar'
  } else if (type === 'masuk_tahun') {
    title = `Daftar Karyawan Masuk Tahun ${value}`
    filterKey = 'bulan_masuk'
    filterValue = value // This will match YYYY% in backend
  } else if (type === 'keluar_tahun') {
    title = `Daftar Karyawan Keluar Tahun ${value}`
    filterKey = 'bulan_keluar'
    filterValue = value // This will match YYYY% in backend
  }
  
  showDetails(title, filterKey, filterValue)
}

const getKeluarThisMonth = () => {
  if (!stats.value.karyawan_keluar) return 0
  return stats.value.karyawan_keluar[stats.value.karyawan_keluar.length - 1]?.count || 0
}

const getCurrentDate = () => {
  if (isCurrentYear.value) {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  return `31 Desember ${selectedYear.value}`
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
.filter-bar {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0;
  white-space: nowrap;
}

.filter-select {
  width: auto;
  min-width: 120px;
  border-radius: 8px;
  font-weight: 600;
  color: #1e293b;
  border-color: #e2e8f0;
}

.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.cutoff-badge {
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.cutoff-badge strong {
  color: #1e293b;
  margin-left: 0.25rem;
}

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
.stat-card.total { border-left: 4px solid #4f46e5; }
.stat-card.medis .stat-icon { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.stat-card.non-medis .stat-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
.stat-card.masuk .stat-icon { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; }
.stat-card.masuk { border-left: 4px solid #1d4ed8; }
.stat-card.keluar .stat-icon { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: white; }
.stat-card.keluar { border-left: 4px solid #e11d48; }

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

.category-body.no-scroll {
  max-height: none !important;
  overflow: hidden !important;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.employee-avatar.male {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.employee-avatar.female {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
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

.movement-table thead th {
  background: #f8fafc;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-top: none;
  padding: 0.5rem 0.75rem;
}

.movement-table tbody td {
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.small-text { font-size: 0.8rem; }

.bg-primary-subtle { background: #e0e7ff !important; }
.bg-danger-subtle { background: #fee2e2 !important; }

.badge.clickable {
  cursor: pointer;
  transition: all 0.2s;
  min-width: 35px;
}

.badge.clickable:hover {
  transform: scale(1.1);
}

.growth-indicator.mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 800;
  font-size: 0.75rem;
  min-width: 40px;
}

.movement-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
}

.footer-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.footer-item .label {
  color: #64748b;
  margin-right: 0.5rem;
}

.footer-item .value {
  font-size: 1rem;
  font-weight: 800;
}

.footer-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
}

.growth-positive { background: #dcfce7; color: #15803d; }
.growth-negative { background: #fee2e2; color: #b91c1c; }
.growth-neutral { background: #f1f5f9; color: #64748b; }

.bg-light-subtle {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.v-separator {
  position: absolute;
  right: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
}

.profession-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.prof-card-premium {
  position: relative;
  background: white;
  border: 1px solid #f1f5f9;
  padding: 1.25rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.prof-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--prof-color);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.prof-card-premium:hover {
  transform: translateY(-5px);
  border-color: transparent;
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
}

.prof-card-premium:hover::before {
  opacity: 0.05;
}

.prof-icon-box {
  position: relative;
  width: 48px;
  height: 48px;
  background: var(--prof-bg);
  color: var(--prof-color);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.prof-card-premium:hover .prof-icon-box {
  transform: scale(1.1) rotate(-5deg);
  box-shadow: 0 4px 12px var(--prof-bg);
}

.prof-content-box {
  position: relative;
  z-index: 1;
  flex: 1;
}

.prof-tag {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  margin-bottom: 2px;
}

.prof-number {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.prof-number small {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}

.prof-percentage {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
}

.prof-value-mini small {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.gender-card-premium {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s;
}

.gender-card-premium:hover {
  transform: translateX(5px);
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.gender-card-premium.male { border-left: 4px solid #3b82f6; }
.gender-card-premium.female { border-left: 4px solid #f472b6; }

.gender-icon-mini {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1rem;
}

.male .gender-icon-mini { background: #eff6ff; color: #3b82f6; }
.female .gender-icon-mini { background: #fdf2f8; color: #f472b6; }

.gender-info-mini { flex-grow: 1; }

.gender-label-mini {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.gender-value-mini {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
}

.gender-value-mini small {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
}

.gender-percentage-mini {
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.status-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.status-item-premium {
  padding: 2px 8px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.status-item-premium:hover,
.status-item-premium.is-highlighted {
  transform: translateX(8px);
  background: white;
  border-color: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.status-item-premium.is-highlighted {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.status-label-mini {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.status-value-mini {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e293b;
}

.progress-mini {
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-mini {
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease-in-out;
}

.edu-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding-right: 0.5rem;
}

.edu-card-premium-modern {
  background: #fdf4ff;
  border: 1px solid #f5d0fe;
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.edu-card-premium-modern:hover,
.edu-card-premium-modern.is-highlighted-edu {
  transform: translateY(-4px);
  background: white;
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.1);
  border-color: #8b5cf666;
}

.edu-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.edu-label-premium {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  color: #7c3aed;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.edu-count-premium {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: #1e293b;
}

.edu-count-premium small {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.edu-percent-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #8b5cf6;
  background: #f5f3ff;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.edu-progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.edu-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  border-radius: 10px;
  transition: width 1s ease-in-out;
}

.text-purple { color: #8b5cf6 !important; }
.bg-purple-subtle { background: #f5f3ff !important; }

.unit-chart-wrapper.scrollable-chart {
  /* Removed max-height to allow full expansion */
  overflow: visible;
}

.unit-chart-wrapper.scrollable-chart::-webkit-scrollbar {
  display: none;
}

.unit-kerja-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  /* Removed max-height to allow full expansion */
  padding-right: 0.5rem;
}

.unit-card-premium-modern {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.unit-card-premium-modern:hover,
.unit-card-premium-modern.is-highlighted {
  transform: translateY(-4px);
  background: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  border-color: #3b82f633;
}

.unit-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.unit-label-premium {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.unit-count-premium {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: #1e293b;
}

.unit-count-premium small {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.unit-percent-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.unit-progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.unit-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 10px;
  transition: width 1s ease-in-out;
}

.unit-kerja-grid-premium::-webkit-scrollbar {
  width: 6px;
}

.unit-kerja-grid-premium::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.unit-kerja-grid-premium::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.prof-arrow-premium {
  position: relative;
  z-index: 1;
  color: #cbd5e1;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.prof-card-premium:hover .prof-arrow-premium {
  opacity: 1;
  transform: translateX(0);
  color: var(--prof-color);
}

.movement-legend {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.masuk { background: #3b82f6; }
.dot.keluar { background: #f43f5e; }
</style>
