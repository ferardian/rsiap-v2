<template>
  <div class="jadwal-page">
    <!-- Header -->
    <div class="page-header">
      <h2>📅 Jadwal Pegawai</h2>
      <div class="controls">
        <div class="filter-group">
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
      <p>Memuat data jadwal...</p>
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
                class="shift-cell"
                :class="{ 
                  'sunday': isSunday(day),
                  'has-shift': getShift(emp, day) && getShift(emp, day) !== '-'
                }"
              >
                <span :class="['shift-badge', getShiftColorClass(getShift(emp, day))]">
                  {{ getShiftCode(emp, day) }}
                </span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { jadwalPegawaiService } from '../../services/jadwalPegawaiService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import Swal from 'sweetalert2'

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1]

// State
const filter = ref({
  month: new Date().getMonth() + 1,
  year: currentYear,
  search: '',
  department: 'all'
})

const loading = ref(false)
const employees = ref([])
const shifts = ref([])

// Computed
const daysInMonth = computed(() => {
  return new Date(filter.value.year, filter.value.month, 0).getDate()
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
  return employees.value
})

const summaryTypes = ['Pagi', 'Siang', 'Malam', 'Cuti', 'Libur']

const shiftSummary = computed(() => {
  const summary = {}
  summaryTypes.forEach(type => {
    summary[type] = {}
    for (let d = 1; d <= daysInMonth.value; d++) {
      summary[type][d] = 0
    }
  })

  filteredEmployees.value.forEach(emp => {
    for (let d = 1; d <= daysInMonth.value; d++) {
      const shiftCode = getShift(emp, d)
      if (shiftCode) {
        let type = null
        const lower = shiftCode.toLowerCase()
        if (lower.includes('pagi') || lower === 'p' || lower.startsWith('pagi')) type = 'Pagi'
        else if (lower.includes('siang') || lower === 's' || lower.startsWith('siang')) type = 'Siang'
        else if (lower.includes('malam') || lower === 'm' || lower.startsWith('malam')) type = 'Malam'
        else if (lower.includes('cuti') || lower === 'c') type = 'Cuti'
        else if (lower.includes('libur') || lower === 'l') type = 'Libur'
        if (type) {
          summary[type][d]++
        }
      }
    }
  })
  return summary
})

// Helper Methods
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
    if (shift && shift !== '-' && !shift.toLowerCase().includes('cuti') && !shift.toLowerCase().includes('libur')) {
      count++
    }
  }
  return count
}

const countLibur = (emp) => {
  let count = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    if (!shift || shift === '-' || shift.toLowerCase().includes('libur')) {
      count++
    }
  }
  return count
}

const SHIFT_HOURS = {
  'pagi': 7,
  'siang': 7,
  'malam': 10,
}

const calculateTotalHours = (emp) => {
  let hours = 0
  for (let d = 1; d <= daysInMonth.value; d++) {
    const shift = getShift(emp, d)
    if (shift) {
      const lower = shift.toLowerCase()
      let passed = false
      for (const [key, h] of Object.entries(SHIFT_HOURS)) {
        if (lower.includes(key)) {
          hours += h
          passed = true
          break
        }
      }
      if (!passed && !lower.includes('cuti') && !lower.includes('libur') && shift !== '-') {
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

const isSunday = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  return date.getDay() === 0
}

const getDayName = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  return days[date.getDay()]
}

const fetchData = async () => {
  loading.value = true
  try {
    const [schedRes, shiftRes] = await Promise.all([
      jadwalPegawaiService.getSchedule(filter.value.month, filter.value.year, filter.value.department, filter.value.search),
      jadwalPegawaiService.getShifts()
    ])
    if (schedRes.data && schedRes.data.data) {
      employees.value = schedRes.data.data
    }
    if (shiftRes.data && shiftRes.data.data) {
      shifts.value = shiftRes.data.data
    }
  } catch (err) {
    console.error('Failed to load schedule', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Data',
      text: 'Terjadi kesalahan saat memuat data jadwal.',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  setTimeout(() => {
    fetchData()
  }, 500)
}

const getShift = (pegawai, day) => {
  if (pegawai.jadwal) {
    const field = `h${day}`
    return pegawai.jadwal[field]
  }
  return null
}

const getShiftColorClass = (shiftCode) => {
  if (!shiftCode) return 'shift-default'
  const code = shiftCode.toLowerCase()
  if (code.includes('pagi')) return 'shift-pagi'
  if (code.includes('siang')) return 'shift-siang'
  if (code.includes('malam')) return 'shift-malam'
  if (code.includes('cuti')) return 'shift-cuti'
  if (code.includes('libur')) return 'shift-libur'
  if (code.includes('midle')) return 'shift-midle'
  return 'shift-default'
}

onMounted(() => {
  fetchData()
})

watch([() => filter.value.month, () => filter.value.year, () => filter.value.department], () => {
  fetchData()
})
</script>

<style scoped>
.jadwal-page {
  padding: 0.75rem; /* Reduced from 1.5rem */
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.75rem; /* Reduced from 1.5rem */
  gap: 0.5rem; /* Reduced from 1rem */
}

.page-header h2 {
  color: #1e40af;
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem; /* Slightly smaller */
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.form-input {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white; 
}

.month-select {
  min-width: 150px;
}

.search-input {
  min-width: 250px;
}

.table-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  width: 100%;
}

.table-wrapper {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.schedule-table {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.schedule-table th, 
.schedule-table td {
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.4rem; /* Reduced vertical padding from 0.5rem */
  text-align: center;
  font-size: 0.8rem; /* Slightly smaller text */
  min-width: 60px;
}

thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 30;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.sticky-col {
  position: sticky;
  left: 0;
  background: white;
  z-index: 10;
  width: 250px;
  min-width: 250px;
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

thead .sticky-col {
  z-index: 50;
  background: #f8fafc;
}

.name-col {
  text-align: left !important;
  padding-left: 1rem !important;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem; /* Smaller name */
  line-height: 1.2;
}

.emp-dept {
  font-size: 0.7rem; /* Smaller dept */
  color: #64748b;
}

.sunday {
  background-color: #fef2f2 !important;
  color: #ef4444;
}

.shift-badge {
  display: inline-block;
  padding: 2px 4px; /* More compact badge */
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 40px;
}

.shift-default { background: #f1f5f9; color: #64748b; }
.shift-pagi { background: #dbeafe; color: #1e40af; }
.shift-siang { background: #fef9c3; color: #854d0e; }
.shift-malam { background: #1e3a8a; color: white; } 
.shift-midle { background: #ffedd5; color: #9a3412; }
.shift-cuti { background: #fce7f3; color: #be185d; }
.shift-libur { background: #fee2e2; color: #991b1b; }

.summary-section {
  margin-top: 2rem;
  padding-bottom: 2rem;
}

.summary-section h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.summary-table td {
  font-weight: 600;
}

.stats-header {
  background: #f1f5f9 !important;
  min-width: 90px;
}

.stats-cell {
  background: #f8fafc;
  font-weight: 600;
}

.btn {
  height: 38px;
  padding: 0 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.text-green-600 { color: #16a34a; }
.text-red-600 { color: #dc2626; }

@media (max-width: 768px) {
  .desktop-text {
    display: none;
  }
  .mobile-text {
    display: inline;
  }
  
  .jadwal-page {
    height: auto;
    overflow: visible;
    padding: 0 !important; /* Remove view padding to allow edge-to-edge */
  }
  
  .controls {
    flex-direction: column; /* Stack vertically */
    align-items: stretch;
    gap: 0.75rem; /* Add spacing between items */
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    width: 100%;
  }

  .month-select,
  .search-input,
  .btn {
    width: 100% !important; /* Full width for easy tapping */
    min-width: 0 !important;
    margin: 0 !important;
  }

  .table-container {
    margin-left: 0; /* Keep left spacing */
    margin-right: -1rem; /* Flush to right edge */
    width: calc(100% + 1rem); /* Extend only to right */
    border-radius: 0;
    border-left: 1px solid #e2e8f0; /* Restore left border */
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  th, td {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .sticky-col {
    position: sticky !important; /* Re-stick on mobile */
    left: 0;
    width: 100px !important; /* Keep compact width */
    min-width: 100px !important;
    max-width: 100px !important;
    background: white; /* Opaque bg needed for sticky */
    border-right: 1px solid #e2e8f0;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05) !important; /* Shadow separator */
    z-index: 20 !important;
    word-break: break-word; 
  }

  /* Ensure the header of the restricted column stays on top */
  thead .sticky-col {
    z-index: 50 !important;
    background: #f8fafc; /* Match header bg */
  }

  .employee-info, .emp-name, .emp-dept {
    font-size: 0.75rem !important; /* Slightly smaller */
    white-space: normal !important; 
    line-height: 1.2;
    word-break: break-word;
  }
  
  .shift-cell {
    min-width: 35px; /* Reduce cell width */
  }

  /* Summary Table Mobile */
  .summary-table th, .summary-table td {
     font-size: 0.7rem;
     padding: 0.25rem;
  }
}
</style>
