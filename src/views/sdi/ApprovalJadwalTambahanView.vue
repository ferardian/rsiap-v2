<template>
  <div class="jadwal-page">
    <!-- Header -->
    <div class="page-header">
      <h2>✅ Approval Jadwal Tambahan</h2>
      <div class="controls">
        <div class="filter-group">
          <!-- Authorized Dept Filter -->
          <SearchableSelect 
            v-model="filter.department" 
            :options="departmentOptions"
            placeholder="Semua Departemen"
            class="dept-select"
            :disabled="loading"
          />

          <SearchableSelect 
            v-model="filter.month" 
            :options="monthOptions"
            placeholder="Pilih Bulan"
            class="month-select"
            :disabled="loading"
          />
          <SearchableSelect 
            v-model="filter.year" 
            :options="yearOptions"
            placeholder="Pilih Tahun"
            class="year-select"
            :disabled="loading"
          />
          <input 
            v-model="filter.search" 
            type="text" 
            placeholder="Cari Pegawai..." 
            class="form-input search-input"
            @input="handleSearch"
          >
          <button @click="fetchData" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data jadwal tambahan...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <div class="table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="sticky-col name-col">
                <span class="desktop-text">Nama Pegawai / Departemen</span>
                <span class="mobile-text">Pegawai</span>
              </th>
              <th 
                v-for="day in daysInMonth" 
                :key="day" 
                :class="{ 'sunday': isSunday(day) }"
                class="date-col"
              >
                {{ day }}
                <div class="day-name">{{ getDayName(day) }}</div>
              </th>
              <!-- Summary Columns -->
              <th class="stats-header">Pagi</th>
              <th class="stats-header">Siang</th>
              <th class="stats-header">Malam</th>
              <th class="stats-header">Total</th>
              <th class="stats-header">Libur</th>
              <th class="stats-header">Cuti</th>
              <th class="stats-header">Jumlah Jam</th>
              <th class="stats-header">Kewajiban Jam</th>
              <th class="stats-header">Lebih Jam</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td class="sticky-col name-col">
                <div class="employee-info">
                  <span class="emp-name">{{ emp.nama }}</span>
                  <span class="emp-dept">{{ emp.departemen }}</span>
                </div>
              </td>
              <td 
                v-for="day in daysInMonth" 
                :key="day"
                class="shift-cell shift-cell-readonly"
                :class="{ 
                  'sunday': isSunday(day),
                  'has-shift': getShift(emp, day) && getShift(emp, day) !== '-'
                }"
              >
                {{ getShiftCode(emp, day) }}
              </td>
              <!-- Summary Cells -->
              <td class="stats-cell">{{ countShiftByType(emp, 'Pagi') }}</td>
              <td class="stats-cell">{{ countShiftByType(emp, 'Siang') }}</td>
              <td class="stats-cell">{{ countShiftByType(emp, 'Malam') }}</td>
              <td class="stats-cell font-bold">{{ countTotalShifts(emp) }}</td>
              <td class="stats-cell">{{ countLibur(emp) }}</td>
              <td class="stats-cell">{{ countShiftByType(emp, 'Cuti') }}</td>
              <td class="stats-cell">{{ calculateTotalHours(emp) }} Jam</td>
              <td class="stats-cell font-bold">173 Jam</td>
              <td class="stats-cell font-bold" :class="getOvertimeClass(emp)">{{ calculateOvertime(emp) }} Jam</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Summary Table -->
    <div class="summary-section" v-if="!loading && employees.length > 0">
      <h3>Jumlah Shift Per Tanggal</h3>
      <div class="table-container summary-table-container">
        <div class="table-wrapper">
          <table class="schedule-table summary-table">
            <thead>
              <tr>
                <th class="sticky-col name-col">Shift</th>
                <th 
                  v-for="day in daysInMonth" 
                  :key="day" 
                  :class="{ 'sunday': isSunday(day) }"
                  class="date-col"
                >
                  {{ day }} <br> {{ getDayName(day) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(countRow, type) in shiftSummary" :key="type" :class="getSummaryRowClass(type)">
                <td class="sticky-col name-col shift-label">{{ type }}</td>
                <td 
                  v-for="day in daysInMonth" 
                  :key="day"
                  class="summary-cell"
                  :class="{ 'sunday': isSunday(day) }"
                >
                  {{ countRow[day] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating Actions -->
    <div class="floating-actions">
      <!-- Approve Button -->
      <button @click="approveSchedule" class="btn btn-approve" :disabled="saving">
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-check-circle"></i> 
        <span v-if="!saving">Setujui & Publikasikan</span>
      </button>
    </div>

    <!-- Shift Selection Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Pilih Shift</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-context">
            <strong>{{ selectedEmployee?.nama }}</strong> <br>
            Tanggal: {{ selectedDay }} {{ months[filter.month - 1] }} {{ filter.year }}
          </p>
          
          <div class="shift-grid">
            <button class="shift-btn clear-btn" @click="selectShift(null)">
              ❌ Hapus / Kosong
            </button>
            <button 
              v-for="shift in shifts" 
              :key="shift.shift"
              class="shift-btn"
              :class="getShiftColorClass(shift.shift)"
              @click="selectShift(shift.shift)"
            >
              <div class="shift-code">{{ shift.shift }}</div>
              <div class="shift-time">{{ shift.jam_masuk }} - {{ shift.jam_pulang }}</div>
              <div class="shift-name">{{ shift.nama_shift || 'Shift' }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { jadwalTambahanService } from '../../services/jadwalTambahanService'
import { useAuthStore } from '../../stores/auth'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const authStore = useAuthStore()

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Determine years (current +/- 1)
const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]

// State
const filter = ref({
  month: new Date().getMonth() + 1,
  year: currentYear,
  search: '',
  department: 'all'
})

const authorizedDepartments = ref([])

// Initialize filter from auth store 
// NOTE: We default to 'all' to prevent filtering by user's own dept (e.g. DIR) which might yield empty results
// The API will return authorized_departments which we will populate.
const initFilter = () => {
  // const userDept = authStore.user?.data?.detail?.departemen
  // if (userDept) {
  //   filter.value.department = userDept
  // }
}

const loading = ref(false)
const saving = ref(false)
const employees = ref([])
const shifts = ref([])
const hasChanges = ref(false)
const pendingChanges = ref({}) // Map: "pegawaiId_day" -> "shiftCode"

// Modal State
const showModal = ref(false)
const selectedEmployee = ref(null)
const selectedDay = ref(null)

// Computed
const daysInMonth = computed(() => {
  return new Date(filter.value.year, filter.value.month, 0).getDate()
})

const departmentOptions = computed(() => {
  const options = authorizedDepartments.value.map(d => ({
    id: d.id,
    name: d.name
  }))
  return [
    { id: 'all', name: 'Semua Departemen' },
    ...options
  ]
})

const monthOptions = computed(() => {
  return months.map((m, i) => ({
    id: i + 1,
    name: m
  }))
})

const yearOptions = computed(() => {
  return years.map(y => ({
    id: y,
    name: y.toString()
  }))
})

const filteredEmployees = computed(() => {
  // Client-side search filtering (if not using server-side search exclusively)
  return employees.value
})

const summaryTypes = ['Pagi', 'Siang', 'Malam', 'Cuti'] // Main categories to summarize

const shiftSummary = computed(() => {
  const summary = {}
  
  // Initialize
  summaryTypes.forEach(type => {
    summary[type] = {}
    for (let d = 1; d <= daysInMonth.value; d++) {
      summary[type][d] = 0
    }
  })

  // Calculate
  filteredEmployees.value.forEach(emp => {
    for (let d = 1; d <= daysInMonth.value; d++) {
      const shiftCode = getShift(emp, d)
      if (shiftCode) {
        // Simple matching logic
        let type = null
        const lower = shiftCode.toLowerCase()
        if (lower.includes('pagi')) type = 'Pagi'
        else if (lower.includes('siang')) type = 'Siang'
        else if (lower.includes('malam')) type = 'Malam'
        else if (lower.includes('cuti')) type = 'Cuti'
        
        if (type) {
          summary[type][d]++
        }
      }
    }
  })
  
  return summary
})

const changesCount = computed(() => Object.keys(pendingChanges.value).length)

// Helper Methods for Template
const isPendingChange = (empId, day) => {
  const key = `${empId}_${day}`
  return pendingChanges.value[key] !== undefined
}

const getShiftCode = (emp, day) => {
  return getShift(emp, day) || '-'
}

const countShiftByType = (emp, typeIdentifier) => {
  let count = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    if (shift && shift.toLowerCase().includes(typeIdentifier.toLowerCase())) {
      count++
    }
  }
  return count
}

const countTotalShifts = (emp) => {
  let count = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    // Count if shift exists and is not 'Cuti' and not 'Libur' (implies P/S/M/etc)
    // Assuming 'Cuti' is excluded from "Total" work shifts based on image? 
    // Image has P=0, S=0, M=0, Total=0.
    if (shift && shift !== '-' && !shift.toLowerCase().includes('cuti')) {
      count++
    }
  }
  return count
}

const countLibur = (emp) => {
  let count = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    if (!shift || shift === '-') {
      count++
    }
  }
  return count
}

const SHIFT_HOURS = {
  'pagi': 7,
  'siang': 7,
  'malam': 10,
  // Add other codes if known, else default
}

const calculateTotalHours = (emp) => {
  let hours = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    if (shift) {
      const lower = shift.toLowerCase()
      // Check specific map key first
      let passed = false
      for (const [key, h] of Object.entries(SHIFT_HOURS)) {
        if (lower.includes(key)) {
          hours += h
          passed = true
          break
        }
      }
      
      if (!passed && !lower.includes('cuti') && shift !== '-') {
        hours += 7 
      }
    }
  }
  return hours
}

const calculateOvertime = (emp) => {
  const total = calculateTotalHours(emp)
  const obligation = 173
  return total - obligation
}

const getOvertimeClass = (emp) => {
  const val = calculateOvertime(emp)
  return val >= 0 ? 'text-green-600' : 'text-red-600'
}

const getSummaryRowClass = (type) => {
  switch(type) {
    case 'Pagi': return 'row-blue'
    case 'Siang': return 'row-yellow'
    case 'Malam': return 'row-blue'
    case 'Cuti': return 'row-yellow'
    default: return ''
  }
}

// ... existing methods ...
const isSunday = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  return date.getDay() === 0 // 0 is Sunday
}

const getDayName = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  return days[date.getDay()]
}

const fetchData = async () => {
  loading.value = true
  employees.value = []
  pendingChanges.value = {}
  hasChanges.value = false
  
  try {
    const [schedRes, shiftRes] = await Promise.all([
      jadwalTambahanService.getSchedule(filter.value.month, filter.value.year, filter.value.department, filter.value.search),
      // Only fetch shifts once ideally, but ok for now
      jadwalTambahanService.getShifts()
    ])
    
    // ApiResponse::success returns { message: ..., data: ... } WITHOUT 'success' boolean
    // Now it may also contain 'authorized_departments' at root level of response data
    if (schedRes.data) {
        // Main data
        if (schedRes.data.data) {
            employees.value = schedRes.data.data
        }
        
        // Metadata: authorized_departments
        if (schedRes.data.authorized_departments) {
            authorizedDepartments.value = schedRes.data.authorized_departments
        }
    }
    
    if (shiftRes.data && shiftRes.data.data) {
      shifts.value = shiftRes.data.data
    }
  } catch (err) {
    console.error('Failed to load schedule', err)
    alert('Gagal memuat data jadwal tambahan.')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Add debounce logic here ideally
  setTimeout(() => {
    fetchData()
  }, 500)
}

// Data Access
const getShift = (pegawai, day) => {
  // Check pending changes first
  const key = `${pegawai.id}_${day}`
  if (pendingChanges.value[key] !== undefined) {
    return pendingChanges.value[key]
  }
  
  // Then check saved data
  if (pegawai.jadwal) {
    const field = `h${day}`
    return pegawai.jadwal[field]
  }
  return null
}

const getShiftColorClass = (shiftCode) => {
  if (!shiftCode) return 'bg-gray-100'
  const code = shiftCode.toLowerCase()
  if (code.includes('pagi')) return 'shift-pagi'
  if (code.includes('siang')) return 'shift-siang'
  if (code.includes('malam')) return 'shift-malam'
  if (code.includes('cuti')) return 'shift-cuti'
  if (code.includes('libur')) return 'shift-libur'
  if (code.includes('midle')) return 'shift-midle'
  return 'shift-default'
}

// Modal Interaction
const openShiftModal = (pegawai, day) => {
  selectedEmployee.value = pegawai
  selectedDay.value = day
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEmployee.value = null
  selectedDay.value = null
}

const selectShift = (shiftCode) => {
  if (selectedEmployee.value && selectedDay.value) {
    const key = `${selectedEmployee.value.id}_${selectedDay.value}`
    pendingChanges.value[key] = shiftCode
    hasChanges.value = true
  }
  closeModal()
}

// Save
const saveChanges = async () => {
  if (!hasChanges.value) return
  
  saving.value = true
  try {
    const updates = {} // { empId: { day: shift } }
    
    Object.keys(pendingChanges.value).forEach(key => {
      const [empId, day] = key.split('_')
      if (!updates[empId]) updates[empId] = {}
      updates[empId][`h${day}`] = pendingChanges.value[key]
    })
    
    // Transform to array
    const payloadData = Object.keys(updates).map(empId => {
      const schedule = updates[empId]
      return {
        id: empId,
        ...schedule // Spreads h1: 'Pagi', h2: 'Siang'...
      }
    })
    
    const res = await jadwalTambahanService.saveSchedule(filter.value.month, filter.value.year, payloadData)
    
    if (res.status === 200) {
      await fetchData()
    } else {
      throw new Error(res.data.message || 'Gagal menyimpan')
    }
    
  } catch (err) {
    console.error('Save failed', err)
    alert('Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const approveSchedule = async () => {
  if (!confirm('Apakah Anda yakin ingin menyetujui dan mempublikasikan jadwal tambahan ini? Action ini akan memperbarui Jadwal Final.')) return
  
  saving.value = true
  try {
    const res = await jadwalTambahanService.approveSchedule(filter.value.month, filter.value.year, filter.value.department)
    
    if (res.status === 200) {
      alert('Jadwal tambahan berhasil disetujui & dipublikasikan!')
    } else {
      throw new Error(res.data.message || 'Gagal approve')
    }
  } catch (err) {
    console.error('Approve failed', err)
    alert('Gagal menyetujui jadwal: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

// Init
onMounted(() => {
  initFilter()
  fetchData()
})

// Watch filters
watch([() => filter.value.month, () => filter.value.year, () => filter.value.department], () => {
  fetchData()
})
</script>

<style scoped>
.jadwal-page {
  padding: 0.5rem; 
  height: calc(100vh - 100px); 
  min-height: 850px; /* Increased to 1000px as requested */
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  flex-direction: column; /* Title Top, Filters Bottom */
  align-items: flex-start; 
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-shrink: 0;
}

.page-header h2 {
  color: #1e40af;
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
}

.filter-group {
  display: flex;
  flex-direction: row; 
  gap: 0.5rem;
  align-items: center;
  flex-wrap: nowrap; /* FORCE single line */
  width: auto; 
  max-width: 100%;
  overflow-x: visible; /* Prevent clipping of dropdowns */
}

/* ... existing styles ... */

.form-select, .form-input {
  padding: 0.5rem 0.75rem; 
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white; 
  height: auto; 
  width: auto; 
  max-width: 100%;
}

.form-select {
  min-width: 150px; /* Widen for Month */
  cursor: pointer;
}

.dept-select {
  min-width: 200px; /* Reduced from 250px */
  max-width: 300px; /* Reduced from 400px */
}

.month-select {
  min-width: 150px;
}

.year-select {
  min-width: 100px;
  max-width: 120px;
}

.search-input {
  width: auto;
  min-width: 120px; /* Reduced from 200px to fit */
}

.btn {
  padding: 0.5rem 1rem;
  height: auto;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap; /* Prevent text wrap */
  width: auto !important; /* Force auto width */
  flex-shrink: 0; /* Prevent button from squishing */
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Table Layout */
.table-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Restore internal scroll */
  position: relative;
  width: 100%;
  max-width: 100%;
}

.table-wrapper {
  height: 100%; /* Fill container */
  width: 100%;
  overflow: auto; /* Scroll x and y */
  position: relative;
}

/* Custom Scrollbar for better visibility */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.schedule-table {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.schedule-table th, 
.schedule-table td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  min-width: 60px;
}

/* Sticky Headers and Columns */
thead th {
  position: sticky;
  top: 0; /* Align to top of wrapper */
  background: #f8fafc;
  z-index: 40; 
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* ... */

/* Adjust sticky column shadow */
.sticky-col {
  position: sticky;
  left: 0;
  background: white !important; /* Force opaque */
  z-index: 20; /* Increased from 10 to ensure above other cells */
  width: 250px; 
  min-width: 250px;
  max-width: 250px;
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

thead .sticky-col {
  z-index: 60; /* Increased from 50 (must be > th z-index 40) */
  background: #f8fafc !important; 
}

.name-col {
  min-width: 250px;
  text-align: left !important;
  padding-left: 1rem !important;
}

.employee-info {
  display: flex;
  flex-direction: column;
  position: relative;
}

.emp-name {
  font-weight: 600;
  color: #1e293b;
}

.emp-dept {
  font-size: 0.75rem;
  color: #64748b;
}

.date-col.sunday {
  background-color: #fef2f2; 
  color: #dc2626;
}

.shift-cell {
  cursor: pointer;
  transition: all 0.1s;
}

.shift-cell.shift-cell-readonly {
  cursor: default !important; /* Read only for approval view */
}

.shift-cell:hover {
  background-color: #f1f5f9;
}

.shift-cell.has-shift {
  font-weight: 600;
}

.shift-cell.sunday {
  background-color: #fef2f2; 
}


/* Shift Colors (Badges alike or text colors) */
/* We can use background colors or text colors. Let's use light backgrounds. */
/* You can refine these colors based on preference. */

/* Default / Unknown */
.shift-default {
  color: #475569;
}

.shift-pagi {
  background-color: #dbeafe; /* Blue 100 */
  color: #1e40af;
}

.shift-siang {
  background-color: #fef9c3; /* Yellow 100 */
  color: #854d0e;
}

.shift-malam {
  background-color: #e0e7ff; /* Indigo 100 */
  color: #3730a3;
}

.shift-cuti {
  background-color: #fee2e2; /* Red 100 */
  color: #991b1b;
}

.shift-libur {
  background-color: #f3f4f6; /* Gray 100 */
  color: #374151; 
}

.shift-midle {
  background-color: #ecfdf5; /* Green 100 */
  color: #065f46;
}


/* Summary Table Styles */
.summary-section {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.summary-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #334155;
}

.summary-table-container {
  max-height: 300px; /* Limit height */
  box-shadow: none;
  border: 1px solid #e2e8f0;
}

.summary-cell {
  font-weight: 500;
}

.shift-label {
  text-align: left !important;
  font-weight: 600;
  color: #475569;
}

.row-blue {
  background-color: #eff6ff;
}
.row-yellow {
  background-color: #fefce8;
}

/* Floating Actions */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 50;
  animation: slideUp 0.3s ease-out;
}

.btn-approve {
  background: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-approve:hover {
  background: #15803d;
}

.btn-approve:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}


@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  items-align: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-context {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  color: #475569;
  line-height: 1.5;
}

.shift-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.shift-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.shift-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.shift-code {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.shift-time {
  font-size: 0.8rem;
  color: #64748b;
}

.shift-name {
  font-size: 0.85rem;
  margin-top: 0.25rem;
  text-align: center;
}

.clear-btn {
  border-color: #fee2e2;
  background: #fef2f2;
  color: #ef4444;
}
.clear-btn:hover {
  background: #fee2e2;
}

/* Mobile Responsive Text */
.mobile-text { display: none; }

@media (max-width: 640px) {
  .desktop-text { display: none; }
  .mobile-text { display: inline; }
  
  .sticky-col {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
  }
}

/* Mobile Responsive Controls */
@media (max-width: 768px) {
  .controls, 
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.5rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
  }

  .dept-select,
  .month-select,
  .year-select,
  .search-input,
  .btn {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
  }
  
  /* Apply to SearchableSelect inner trigger if needed */
  /* This depends on SearchableSelect implementation passing class/styles */
  .dept-select :deep(.select-trigger),
  .month-select :deep(.select-trigger),
  .year-select :deep(.select-trigger) {
    width: 100% !important; 
  }
}
</style>
