<template>
  <div class="bed-availability-page" :class="{ 'display-mode': isDisplayMode }">
    <div v-if="isBackgroundUpdating" class="auto-refresh-indicator">
      <div class="refresh-spinner"></div>
      <span>Memperbarui data...</span>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">🛏️ Ketersediaan Tempat Tidur</h1>
          <p class="page-subtitle">Monitor ketersediaan tempat tidur secara real-time</p>
        </div>
        <div class="header-actions">
          <button v-if="!isDisplayMode" class="btn btn-primary" @click="openDisplayMode">
            <i class="fas fa-desktop"></i> Full Screen
          </button>
          <button class="btn btn-secondary" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="card-icon">🏥</div>
          <div class="card-content">
            <h3>{{ totalBeds }}</h3>
            <p>Total Tempat Tidur</p>
          </div>
        </div>
        <div class="summary-card available">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <h3>{{ availableBeds }}</h3>
            <p>Tersedia</p>
          </div>
        </div>
        <div class="summary-card occupied">
          <div class="card-icon">🔴</div>
          <div class="card-content">
            <h3>{{ occupiedBeds }}</h3>
            <p>Terisi</p>
          </div>
        </div>
        <div class="summary-card cleaning">
          <div class="card-icon">🧹</div>
          <div class="card-content">
            <h3>{{ cleaningBeds }}</h3>
            <p>Dibersihkan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-section">
      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-hospital"></i> Pilih Bangsal
        </label>
        <SearchableSelect 
          v-model="selectedCategory" 
          :options="categoryOptions" 
          placeholder="Semua Kategori"
          labelKey="name"
          valueKey="id"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-star"></i> Pilih Kelas
        </label>
        <SearchableSelect 
          v-model="selectedClass" 
          :options="classOptions" 
          placeholder="Semua Kelas"
          labelKey="name"
          valueKey="id"
          @change="loadBeds"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-filter"></i> Status
        </label>
        <SearchableSelect 
          v-model="selectedStatus" 
          :options="statusOptions" 
          placeholder="Semua Status"
          labelKey="name"
          valueKey="id"
          @change="loadBeds"
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="legend-section">
      <div class="legend-item">
        <span class="legend-box available"></span>
        <span>Tersedia</span>
      </div>
      <div class="legend-item">
        <span class="legend-box occupied"></span>
        <span>Terisi</span>
      </div>
      <div class="legend-item">
        <span class="legend-box cleaning"></span>
        <span>Dibersihkan</span>
      </div>
      <div class="legend-item">
        <span class="legend-box booked"></span>
        <span>Dibooking</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- Bed Grid Display -->
    <div v-else-if="beds.length > 0" ref="bedGridSection" class="bed-grid-section">
      <div v-for="(bedGroup, wardName) in groupedBeds" :key="wardName" class="ward-section">
        <h3 class="ward-title">
          {{ wardName }} 
          <span class="category-total-badge">{{ getCategoryTotal(bedGroup) }} Bed</span>
        </h3>
        
        <div v-for="group in bedGroup" :key="group.kelas" class="class-section">
          <h4 class="class-title">
            {{ group.kelas }}
            <span class="class-total-badge">{{ getClassTotal(group) }} Bed</span>
          </h4>
          
          <div class="availability-cards">
            <div
              v-for="bed in group.beds"
              :key="bed.kd_bangsal + bed.kd_kamar"
              class="availability-card"
              @click="showBedDetail(bed)"
            >
              <div class="card-header-info">
                <div class="bangsal-name">{{ bed.nm_bangsal }}</div>
                <div class="class-badge">{{ bed.kelas }}</div>
              </div>
              
              
              <!-- Removed Capacity Info -->
              
              <div class="availability-stats">
                <!-- Single Dynamic Status Box -->
                <div 
                  class="stat-item" 
                  :class="getBedStatusClass(bed)"
                >
                  <div class="stat-icon">
                    {{ getBedStatusIcon(bed) }}
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">
                      {{ getBedStatusText(bed) }}
                    </div>
                    <div class="stat-label">
                      Status Kamar
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Removed Progress Bar and Gender Info -->
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-bed fa-3x"></i>
      <p>Tidak ada data tempat tidur</p>
    </div>

    <!-- Bed Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detail Tempat Tidur</h3>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedBed">
          <div class="detail-row">
            <span class="detail-label">Bangsal:</span>
            <span class="detail-value">{{ selectedBed.nm_bangsal }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Kelas:</span>
            <span class="detail-value">{{ selectedBed.kelas }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Kapasitas:</span>
            <span class="detail-value">{{ selectedBed.kapasitas }} tempat tidur</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tersedia:</span>
            <span class="detail-value">
              <span class="status-badge available">{{ selectedBed.tersedia }} tempat tidur</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Terisi:</span>
            <span class="detail-value">
              <span class="status-badge occupied">{{ selectedBed.terisi }} tempat tidur</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Persentase Terisi:</span>
            <span class="detail-value">{{ selectedBed.persentase_terisi }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import bedAvailabilityService from '../../services/bedAvailabilityService'
import { showToast } from '../../utils/notification'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'

// State
const loading = ref(false)
const isBackgroundUpdating = ref(false)
const beds = ref([])
const wards = ref([])
const classes = ref([])
const selectedCategory = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')
const showDetailModal = ref(false)
const selectedBed = ref(null)
const refreshInterval = ref(null)

const route = useRoute()
const router = useRouter()
const isDisplayMode = computed(() => route.meta.layout === 'empty')

const openDisplayMode = () => {
  const displayUrl = router.resolve({ name: 'BedAvailabilityDisplay' }).href
  window.open(displayUrl, '_blank')
}

// Options for SearchableSelect
const categoryOptions = [
  { id: '', name: 'Semua Kategori' },
  { id: 'ANAK', name: 'Anak' },
  { id: 'KANDUNGAN', name: 'Kandungan' },
  { id: 'KAMAR BERSALIN', name: 'Kamar Bersalin' },
  { id: 'ICU', name: 'ICU' },
  { id: 'ISOLASI', name: 'Isolasi' }
]

const statusOptions = [
  { id: '', name: 'Semua Status' },
  { id: 'KOSONG', name: 'Tersedia' },
  { id: 'ISI', name: 'Terisi' },
  { id: 'DIBERSIHKAN', name: 'Dibersihkan' },
  { id: 'DIBOOKING', name: 'Dibooking' }
]

const classOptions = computed(() => {
  const options = [{ id: '', name: 'Semua Kelas' }]
  if (classes.value && classes.value.length) {
    classes.value.forEach(c => options.push({ id: c, name: c }))
  }
  return options
})

// Helper for Categorization (Single Source of Truth)
const getBedCategory = (bed) => {
  const searchString = (bed.kd_kamar || '').toUpperCase()
  const defaultCategory = (bed.nm_bangsal || bed.kd_bangsal).replace(/\s*\d+\s*$/, '').trim()
  
  // Check Critical Units First
  // Check ISOLASI first (catches VKISO)
  if (searchString.includes('ISOLASI') || searchString.includes('ISO')) {
    return 'ISOLASI'
  }
  else if (searchString.includes('ICU') || searchString.includes('ICCU') || searchString.includes('PICU') || searchString.includes('NICU')) {
    return 'ICU'
  }
  else if (searchString.includes('VK') || searchString.includes('BERSALIN')) {
    return 'KAMAR BERSALIN'
  }
  // Check General Wards
  else if (searchString.includes('ANAK') || searchString.includes('BAYI') || searchString.includes('PERINA')) {
    return 'ANAK'
  } 
  else if (searchString.includes('KANDUNGAN') || searchString.includes('KEBIDANAN')) {
    return 'KANDUNGAN'
  }
  
  return defaultCategory
}

// Computed
const summaryByCategory = computed(() => {
  const categories = ['ANAK', 'KANDUNGAN', 'KAMAR BERSALIN', 'ICU', 'ISOLASI']
  const results = {}
  
  // Initialize result categories
  categories.forEach(cat => {
    results[cat] = {
      name: cat,
      capacity: 0,
      occupied: 0,
      available: 0
    }
  })
  
  beds.value.forEach(bed => {
    const category = getBedCategory(bed)
    // Only count if it matches one of our main categories
    if (results[category]) {
      results[category].capacity += bed.kapasitas
      results[category].occupied += bed.terisi
      results[category].available += bed.tersedia
    }
  })
  
  return Object.values(results)
})

// Filtered Beds Computed
const filteredBedsList = computed(() => {
  let result = beds.value
  
  if (selectedCategory.value) {
    result = result.filter(bed => {
      const category = getBedCategory(bed)
      return category === selectedCategory.value
    })
  }
  
  return result
})

const groupedBeds = computed(() => {
  const grouped = {}
  
  filteredBedsList.value.forEach(bed => {
    const category = getBedCategory(bed)
    const kelas = bed.kelas || 'Tidak ada kelas'
    
    if (!grouped[category]) {
      grouped[category] = {}
    }
    
    if (!grouped[category][kelas]) {
      grouped[category][kelas] = []
    }
    
    grouped[category][kelas].push(bed)
  })
  
  // Custom Sort Order
  const sortWeights = {
    'VIP': 10,
    'VVIP': 5,
    'Kelas 1': 20,
    'Kelas 2': 30,
    'Kelas 3': 40,
    'Utama': 50,
  }
  
  const getWeight = (className) => {
    if (sortWeights[className]) return sortWeights[className]
    if (className.includes('VIP')) return 10
    if (className.includes('Kelas 1')) return 20
    if (className.includes('Kelas 2')) return 30
    if (className.includes('Kelas 3')) return 40
    if (className.includes('Utama')) return 50
    return 100 
  }
  
  const finalGrouped = {}
  Object.keys(grouped).forEach(cat => {
    const classesObj = grouped[cat]
    const classesArray = Object.keys(classesObj).map(cls => ({
      kelas: cls,
      beds: classesObj[cls],
      weight: getWeight(cls)
    }))
    
    classesArray.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight
      return a.kelas.localeCompare(b.kelas)
    })
    
    finalGrouped[cat] = classesArray
  })
  
  return finalGrouped
})

const totalBeds = computed(() => beds.value.reduce((sum, bed) => sum + bed.kapasitas, 0))
const availableBeds = computed(() => beds.value.reduce((sum, bed) => sum + bed.tersedia, 0))
const occupiedBeds = computed(() => beds.value.reduce((sum, bed) => sum + bed.terisi, 0))
const cleaningBeds = computed(() => 0) // Not available in summary data

// Helper methods for bed status
const getBedStatusClass = (bed) => {
  const status = bed.status_kamar || 'KOSONG'
  switch (status) {
    case 'ISI': return 'occupied'
    case 'KOSONG': return 'available'
    case 'DIBERSIHKAN': return 'cleaning'
    case 'DIBOOKING': return 'booked'
    default: return 'occupied'
  }
}

const getBedStatusIcon = (bed) => {
  const status = bed.status_kamar || 'KOSONG'
  switch (status) {
    case 'ISI': return '✕'
    case 'KOSONG': return '✓'
    case 'DIBERSIHKAN': return '🧹'
    case 'DIBOOKING': return '📅'
    default: return '?'
  }
}

const getBedStatusText = (bed) => {
  const status = bed.status_kamar || 'KOSONG'
  switch (status) {
    case 'ISI': return 'TERISI'
    case 'KOSONG': return 'TERSEDIA'
    case 'DIBERSIHKAN': return 'DIBERSIHKAN'
    case 'DIBOOKING': return 'DIBOOKING'
    default: return status
  }
}



// Methods
const loadBeds = async (preserveScroll = false) => {
  try {
    // Save current scroll position if preserving
    const scrollPosition = preserveScroll ? window.scrollY : 0
    
    // Only show loading spinner on manual refresh, not auto-refresh
    if (!preserveScroll) {
      loading.value = true
    } else {
      isBackgroundUpdating.value = true
    }
    
    const params = {}
    // kd_bangsal filter removed as we use category filter on frontend
    if (selectedClass.value) params.kelas = selectedClass.value
    if (selectedStatus.value) params.status = selectedStatus.value
    
    const response = await bedAvailabilityService.getAllBeds(params)
    
    if (response.success) {
      beds.value = response.data
      
      // Restore scroll position after data is loaded
      if (preserveScroll && scrollPosition > 0) {
        // Use requestAnimationFrame for smoother scroll restoration
        await nextTick()
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'instant'
          })
        })
      }
    } else {
      showToast('Gagal memuat data tempat tidur', 'error')
    }
  } catch (error) {
    console.error('Error loading beds:', error)
    showToast('Terjadi kesalahan saat memuat data', 'error')
  } finally {
    if (!preserveScroll) {
      loading.value = false
    } else {
      // Add a small delay so the user can see the update indicator
      setTimeout(() => {
        isBackgroundUpdating.value = false
      }, 1000)
    }
  }
}

const loadWards = async () => {
  try {
    const response = await bedAvailabilityService.getWards()
    if (response.success) {
      wards.value = response.data
    }
  } catch (error) {
    console.error('Error loading wards:', error)
  }
}

const loadClasses = async () => {
  try {
    const response = await bedAvailabilityService.getClasses()
    if (response.success) {
      classes.value = response.data
    }
  } catch (error) {
    console.error('Error loading classes:', error)
  }
}

const refreshData = async () => {
  await Promise.all([loadBeds(), loadWards(), loadClasses()])
  showToast('Data berhasil diperbarui', 'success')
}

const getWardName = (kd_bangsal) => {
  const ward = wards.value.find(w => w.kd_bangsal === kd_bangsal)
  return ward ? ward.nm_bangsal : kd_bangsal
}

const showBedDetail = (bed) => {
  selectedBed.value = bed
  showDetailModal.value = true
}

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

const getCategoryTotal = (groups) => {
  if (!groups || !Array.isArray(groups)) return 0
  return groups.reduce((total, group) => {
    return total + group.beds.reduce((sum, bed) => sum + bed.kapasitas, 0)
  }, 0)
}

const getClassTotal = (group) => {
  if (!group || !group.beds) return 0
  return group.beds.reduce((sum, bed) => sum + bed.kapasitas, 0)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadBeds(), loadWards(), loadClasses()])
  
  // Auto refresh every 30 seconds (preserve scroll position)
  refreshInterval.value = setInterval(() => {
    loadBeds(true)
  }, 30000)

  if (isDisplayMode.value) {
    // Wait for data to load then start auto scroll flow
    const checkDataLoaded = setInterval(() => {
      if (!loading.value && beds.value.length > 0) {
        clearInterval(checkDataLoaded)
        startAutoScrollFlow()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  stopAutoScroll()
})

// Auto Scroll Logic
const bedGridSection = ref(null)
const autoScrollTimer = ref(null)
const scrollSpeed = 1 // pixels per tick
const scrollIntervalRate = 50 // ms per tick

const startAutoScrollFlow = async () => {
  await nextTick()
  
  // 1. Initial Focus: Scroll to bed grid
  if (bedGridSection.value) {
    bedGridSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 2. Start scrolling loop after delay
  setTimeout(() => {
    startScrolling()
  }, 5000) 
}

const startScrolling = () => {
  stopAutoScroll()
  
  autoScrollTimer.value = setInterval(() => {
    // Check if we reached bottom
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      // Reached bottom
      stopAutoScroll()
      // Wait at bottom then reset
      setTimeout(() => {
         window.scrollTo({ top: 0, behavior: 'smooth' })
         // Wait at top then restart flow (re-focus on grid)
         setTimeout(() => {
            startAutoScrollFlow()
         }, 5000)
      }, 5000)
    } else {
      // Scroll down
      window.scrollBy(0, scrollSpeed)
    }
  }, scrollIntervalRate)
}

const stopAutoScroll = () => {
  if (autoScrollTimer.value) {
    clearInterval(autoScrollTimer.value)
    autoScrollTimer.value = null
  }
}
</script>

<style scoped>
.auto-refresh-indicator {
  position: fixed;
  top: 1.5rem;
  right: 50%;
  transform: translateX(50%);
  background: rgba(30, 41, 59, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 0.875rem;
  z-index: 100;
  backdrop-filter: blur(4px);
  animation: slideDown 0.3s ease-out;
  pointer-events: none;
}

@keyframes slideDown {
  from { transform: translate(50%, -100%); opacity: 0; }
  to { transform: translate(50%, 0); opacity: 1; }
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.bed-availability-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.bed-availability-page.display-mode {
  height: auto;
  overflow-y: visible;
}

/* Header */
.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Summary Cards */
.summary-section {
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.summary-card.total .card-icon {
  background: #dbeafe;
}

.summary-card.available .card-icon {
  background: #d1fae5;
}

.summary-card.occupied .card-icon {
  background: #fee2e2;
}

.summary-card.cleaning .card-icon {
  background: #fef3c7;
}

.card-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

/* Filters */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: white;
  color: #1e293b;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Legend */
.legend-section {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
}

.legend-box {
  width: 24px;
  height: 24px;
  border-radius: 0.375rem;
  border: 2px solid #e2e8f0;
}

.legend-box.available {
  background: #10b981;
}

.legend-box.occupied {
  background: #ef4444;
}

.legend-box.cleaning {
  background: #f59e0b;
}

.legend-box.booked {
  background: #3b82f6;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 0.75rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Bed Grid */
.bed-grid-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ward-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ward-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white; /* White text for contrast */
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem; /* Internal padding */
  
  /* Sticky Header Styles */
  position: sticky;
  top: 0;
  z-index: 20;

  /* New Visual Style */
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); /* Blue Sidebar Gradient */
  
  /* Dimensions relative to parent (undoing parent padding) */
  margin-top: -1.5rem; 
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  
  /* Visual separation */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #1e40af;
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-total-badge {
  background: rgba(255, 255, 255, 0.1); /* Semi-transparent white */
  color: #f8fafc; /* Very light gray/white */
  font-size: 0.875rem;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;

  margin-bottom: 0; /* Removing margin-bottom from original */
}

.class-section {
  margin-bottom: 2rem;
}

.class-section:last-child {
  margin-bottom: 0;
}

.class-title {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.class-total-badge {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px; /* Pill shape */
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.class-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #3b82f6;
  border-radius: 2px;
}

.availability-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.availability-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.availability-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

.card-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.bangsal-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
}

.class-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.capacity-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.capacity-number {
  font-size: 3rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.capacity-label {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.availability-stats {
  display: block; /* Full width */
  margin-bottom: 0; /* Remove bottom margin as it's the last item */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
}

.stat-item.available {
  background: #d1fae5;
}

.stat-item.occupied {
  background: #fee2e2;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  background: white;
}

.stat-item.available .stat-icon {
  color: #10b981;
}

.stat-item.occupied .stat-icon {
  color: #ef4444;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-fill.low {
  background: #10b981;
}

.progress-fill.moderate {
  background: #f59e0b;
}

.progress-fill.warning {
  background: #f97316;
}

.progress-fill.critical {
  background: #ef4444;
}

.occupancy-text {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 1rem;
}

.gender-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.gender-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

.gender-icon {
  font-size: 1rem;
}


/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 0.75rem;
  color: #94a3b8;
}

.empty-state i {
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #475569;
}

.detail-value {
  color: #1e293b;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.status-badge.available {
  background: #10b981;
}

.status-badge.occupied {
  background: #ef4444;
}

.status-badge.cleaning {
  background: #f59e0b;
}

.status-badge.booked {
  background: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 1rem !important;
  }

  .header-content {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }

  .header-actions {
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  .header-actions .btn {
    width: 100% !important;
    justify-content: center !important;
  }

  /* Room Cards - 3 per row on mobile */
  .availability-cards {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 0.5rem !important;
  }

  .availability-card {
    padding: 0.75rem !important;
  }

  .bangsal-name,
  .room-name {
    font-size: 0.7rem !important;
    line-height: 1.2 !important;
    font-weight: 600 !important;
  }

  .class-badge {
    font-size: 0.6rem !important;
    padding: 0.2rem 0.4rem !important;
  }

  .stat-number {
    font-size: 0.75rem !important;
    font-weight: 700 !important;
  }

  .stat-label {
    font-size: 0.6rem !important;
  }

  .status-info {
    font-size: 0.65rem !important;
  }

  .card-header-info {
    margin-bottom: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }

  .availability-stats {
    gap: 0.4rem !important;
  }

  .stat-item {
    padding: 0.5rem !important;
  }

  .bed-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
  }
  
  .filter-section {
    grid-template-columns: 1fr;
  }
  
  .legend-section {
    gap: 1rem;
  }
}
</style>
