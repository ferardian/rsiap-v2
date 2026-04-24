<template>
  <div class="jadwal-page">
    <!-- Header -->
    <div class="page-header">
      <h2>📅 Pengajuan Jadwal</h2>
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
          <button @click="openPatternModal" class="btn btn-secondary">
            <i class="fas fa-magic"></i> Isi Pola
          </button>
          
          <!-- AI Schedule Button -->
          <button 
            @click="generateAiSchedule" 
            class="btn btn-ai"
            :disabled="analyzing || loading"
          >
            <i v-if="analyzing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-robot"></i>
            <span class="desktop-text">{{ analyzing ? 'Menganalisis...' : 'Rekomendasi AI' }}</span>
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
                :class="{ 
                  'sunday': isSunday(day),
                  'holiday': isHoliday(day)
                }"
                class="date-col"
                :title="getHolidayName(day)"
              >
                <div class="date-header-content">
                  {{ day }}
                  <div class="day-name">{{ getDayName(day) }}</div>
                  <div v-if="isHoliday(day)" class="holiday-indicator"></div>
                  <div v-if="isHoliday(day)" class="holiday-name-tooltip">{{ getHolidayName(day) }}</div>
                </div>
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
                  'holiday': isHoliday(day),
                  'has-shift': getShift(emp, day) && getShift(emp, day) !== '-',
                  'pend-change': isPendingChange(emp.id, day)
                }"
                @click="openShiftModal(emp, day)"
                :title="getHolidayName(day)"
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
                  :class="{ 
                    'sunday': isSunday(day),
                    'holiday': isHoliday(day)
                  }"
                  class="date-col"
                  :title="getHolidayName(day)"
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
                  :class="{ 
                    'sunday': isSunday(day),
                    'holiday': isHoliday(day)
                  }"
                >
                  {{ countRow[day] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating Save Button -->
    <div class="floating-actions" v-if="hasChanges">
      <div class="changes-info">
        {{ changesCount }} perubahan belum disimpan
      </div>
      <button @click="saveChanges" class="btn btn-save" :disabled="saving">
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <span v-else>💾 Simpan Perubahan</span>
      </button>
      <!-- Clear Changes Button -->
      <button @click="clearPendingChanges" class="btn btn-secondary ml-2" :disabled="saving">
          <i class="fas fa-undo"></i> Reset
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
            <button class="shift-btn shift-cuti" @click="selectShift('Cuti')">
              🏖️ Cuti
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

    <!-- Pattern Fill Modal -->
    <div v-if="showPatternModal" class="modal-overlay" @click.self="closePatternModal">
      <div class="modal-content pattern-modal">
        <div class="modal-header">
          <h3>Isi Pola Otomatis</h3>
          <button @click="closePatternModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-gray-600 mb-4">
            Atur pola shift berdasarkan hari. Pola akan diterapkan ke <strong>{{ filteredEmployees.length }} pegawai</strong> yang sedang tampil.
          </p>
          
          <div class="pattern-grid">
            <div v-for="(dayName, idx) in ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']" :key="idx" class="pattern-row">
              <label>{{ dayName }}</label>
              <select v-model="patternRules[idx]" class="form-select">
                <option :value="null">- Tidak Diubah -</option>
                <option value="EMPTY">❌ Libur / Kosong</option>
                <option value="Cuti">🏖️ Cuti</option>
                <option v-for="shift in shifts" :key="shift.shift" :value="shift.shift">
                  {{ shift.shift }} ({{ shift.jam_masuk }}-{{ shift.jam_pulang }})
                </option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closePatternModal">Batal</button>
            <button class="btn btn-primary" @click="applyPattern">
              <i class="fas fa-check"></i> Terapkan Pola
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { jadwalPegawaiService } from '../../services/jadwalPegawaiService'
import { useAuthStore } from '../../stores/auth'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import Swal from 'sweetalert2'

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

// Initialize filter
const initFilter = () => {
    // Default to 'all' to let backend decide based on mapping
    filter.value.department = 'all'
}

const loading = ref(false)
const analyzing = ref(false) // AI Generating state
const saving = ref(false)
const employees = ref([])
const shifts = ref([])
const departmentOptions = ref([])
const hasChanges = ref(false)
const pendingChanges = ref({}) // Map: "pegawaiId_day" -> "shiftCode"
const holidays = ref({}) // Key: YYYY-MM-DD, Value: Holiday Name

// Modal State
const showModal = ref(false)
const selectedEmployee = ref(null)
const selectedDay = ref(null)

// Pattern Modal State
const showPatternModal = ref(false)
const patternRules = ref(new Array(7).fill(null)) // 0=Sun, 6=Sat

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
  // Client-side search filtering (if not using server-side search exclusively)
  return employees.value
})

const summaryTypes = ['Pagi', 'Siang', 'Malam', 'Cuti', 'Libur'] // Main categories to summarize

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

// ... existing methods ...
const isSunday = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  return date.getDay() === 0 // 0 is Sunday
}

const isHoliday = (day) => {
  const dateStr = `${filter.value.year}-${filter.value.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return holidays.value[dateStr] !== undefined
}

const getHolidayName = (day) => {
  const dateStr = `${filter.value.year}-${filter.value.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return holidays.value[dateStr] || ''
}

const getDayName = (day) => {
  const date = new Date(filter.value.year, filter.value.month - 1, day)
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  return days[date.getDay()]
}

const fetchHolidays = async () => {
  try {
    const res = await fetch(`https://libur.deno.dev/api?year=${filter.value.year}`)
    if (res.ok) {
      const data = await res.json()
      const fetchedHolidays = {}
      data.forEach(item => {
        fetchedHolidays[item.date] = item.name
      })
      holidays.value = fetchedHolidays
    }
  } catch (err) {
    console.error('Error fetching holidays:', err)
  }
}

const fetchData = async () => {
  loading.value = true
  employees.value = []
  pendingChanges.value = {}
  hasChanges.value = false
  
  if (Object.keys(holidays.value).length === 0 || !Object.keys(holidays.value)[0].startsWith(filter.value.year.toString())) {
    await fetchHolidays()
  }
  
  try {
    const [schedRes, shiftRes] = await Promise.all([
      jadwalPegawaiService.getSchedule(filter.value.month, filter.value.year, filter.value.department, filter.value.search),
      jadwalPegawaiService.getShifts()
    ])
    
    if (schedRes.data && schedRes.data.data) {
      employees.value = schedRes.data.data
      
      if (schedRes.data.authorized_departments || (schedRes.data.meta && schedRes.data.meta.authorized_departments)) {
          const authorized = schedRes.data.authorized_departments || schedRes.data.meta.authorized_departments
          departmentOptions.value = [
              { id: 'all', name: 'Semua Unit' },
              ...authorized
          ]
      } else {
          departmentOptions.value = []
      }
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

// Data Access
const getShift = (pegawai, day) => {
  const key = `${pegawai.id}_${day}`
  if (pendingChanges.value[key] !== undefined) {
    return pendingChanges.value[key]
  }
  
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
    pendingChanges.value[key] = (shiftCode === 'EMPTY' ? '' : shiftCode)
    hasChanges.value = true
  }
  closeModal()
}

// Pattern Logic
const openPatternModal = () => {
  showPatternModal.value = true
}

const closePatternModal = () => {
  showPatternModal.value = false
}

const applyPattern = async () => {
  const result = await Swal.fire({
    title: 'Terapkan Pola?',
    text: `Pola ini akan diterapkan ke ${filteredEmployees.value.length} pegawai. Perubahan yang belum disimpan mungkin tertimpa.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Terapkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#64748b'
  })

  if (!result.isConfirmed) return

  const year = filter.value.year
  const monthIdx = filter.value.month - 1
  
  filteredEmployees.value.forEach(emp => {
    for (let d = 1; d <= daysInMonth.value; d++) {
      const date = new Date(year, monthIdx, d)
      const dayOfWeek = date.getDay()
      
      const rule = patternRules.value[dayOfWeek]
      
      if (rule !== null && rule !== undefined) {
        const shiftVal = rule === 'EMPTY' ? '' : rule
        const key = `${emp.id}_${d}`
        pendingChanges.value[key] = shiftVal
      }
    }
  })
  
  hasChanges.value = true
  closePatternModal()
  Swal.fire({
    icon: 'success',
    title: 'Pola Diterapkan',
    text: 'Pola berhasil diterapkan! Jangan lupa klik Simpan untuk mempermanenkan perubahan.',
    confirmButtonColor: '#3b82f6'
  })
}

const clearPendingChanges = async () => {
    const result = await Swal.fire({
        title: 'Reset Perubahan?',
        text: 'Apakah Anda yakin ingin mereset semua perubahan yang belum disimpan?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
    })

    if (result.isConfirmed) {
        pendingChanges.value = {}
        hasChanges.value = false
    }
}

// AI Schedule Generation
const generateAiSchedule = async () => {
  if (filteredEmployees.value.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Data Tidak Tersedia',
      text: 'Tidak ada data pegawai untuk dijadwalkan.',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  try {
    let deptName = 'Unknown Department'
    const selectedDept = departmentOptions.value.find(d => d.id === filter.value.department)
    if (selectedDept) deptName = selectedDept.name

    const result = await Swal.fire({
      title: 'AI Workload Optimizer',
      html: `
        <div class="ai-premium-container">
          <div class="ai-header-fancy animate-pulse-slow">
            <i class="fas fa-microchip ai-chip-icon"></i>
          </div>
          <div class="ai-stats-card-premium mb-4">
             <div class="flex justify-between items-center mb-2">
                <span class="text-slate-400 text-xs">Objek Analisis</span>
                <span class="text-white font-bold text-xs">${filteredEmployees.value.length} Pegawai</span>
             </div>
             <div class="flex justify-between items-center mb-2">
                <span class="text-slate-400 text-xs">Target Periode</span>
                <span class="text-white font-bold text-xs">${months[filter.value.month - 1]} ${filter.value.year}</span>
             </div>
             <div class="pt-2 border-t border-white/10 flex justify-between items-center">
                <span class="text-slate-400 text-xs text-left">Internal Unit</span>
                <span class="text-indigo-400 font-bold text-xs">${deptName}</span>
             </div>
          </div>
          <p class="text-slate-300 text-[13px] leading-relaxed mb-4">Optimization Engine siap menyusun strategi shift. Masukkan instruksi khusus di bawah.</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Contoh: Setiap shift min 4 orang, Ririn tidak boleh dinas malam...',
      inputAttributes: {
        'style': 'border-radius: 12px; border: 1px solid #334155; font-size: 13px; min-height: 90px; padding: 12px; background: #1e293b; color: #f1f5f9; font-family: inherit;'
      },
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Generate Strategy ⚡',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'ai-dark-premium-popup',
        title: 'ai-dark-premium-title',
        actions: 'ai-dark-premium-actions',
        confirmButton: 'ai-dark-premium-confirm',
        cancelButton: 'ai-dark-premium-cancel'
      }
    })

  if (!result.isConfirmed) return
  analyzing.value = true

    const userPrompt = result.value || ''
    const days = new Date(filter.value.year, filter.value.month, 0).getDate()
    const shiftListTxt = shifts.value.map(s => s.shift).join(', ')
    const mappingTxt = filteredEmployees.value.map(e => `- ${e.nama} (ID: ${e.id})`).join('\n')

    const calendarGuideTxt = Array.from({ length: days }, (_, i) => {
      const d = i + 1
      const dayName = new Date(filter.value.year, filter.value.month - 1, d).toLocaleDateString('id-ID', { weekday: 'long' })
      return `h${d}:${dayName}`
    }).join(', ')

    const totalEmployees = filteredEmployees.value.length

    const finalPrompt = `
Calendar Info (${months[filter.value.month - 1]} ${filter.value.year}):
${calendarGuideTxt}

Employee Mapping (Total Staff: ${totalEmployees}):
${mappingTxt}

Available Shift Codes for this Unit:
${shiftListTxt}

STRICT STAFFING QUOTA (NON-NEGOTIABLE):
Every single day (h1 to h${days}) must satisfy the staffing requirement appropriately.
- TOTAL LIBUR: MAX around 1/3 of total staff per day.

ASSIGNMENT LOGIC (STEP-BY-STEP):
1. REASONING FIRST: For each day, write down how many people you are assigning.
2. BALANCE: Distribute staff across shifts.
3. INDIVIDUAL MANDATES: ${userPrompt || 'No specific individual overrides.'} (Absolute priority).
4. NIGHT REST RULES: Avoid excessive nights.
5. CODE CONSISTENCY: Use full codes provided (e.g., "Pagi8", "Siang3"). DO NOT use abbreviations.

CRITICAL OUTPUT FORMAT:
You MUST finish with a RAW JSON array: [{"id": <ID>, "schedule": [...]}, ...]
DO NOT use single letter codes in the final JSON. Use full code names.
    `.trim()

    const payload = {
      month: filter.value.month,
      year: filter.value.year,
      daysInMonth: days,
      department: filter.value.department,
      department_name: deptName,
      employees: filteredEmployees.value.map(e => ({ id: e.id, nama: e.nama, jbtn: e.jbtn })),
      shifts: shifts.value,
      prompt: finalPrompt
    }

    const responseData = await jadwalPegawaiService.getAiRecommendation(payload)

    if (!responseData) throw new Error('Penghitungan AI gagal (Layanan tidak merespon).')

    const tryRecoverTruncatedJson = (str) => {
        try {
            const lastObjEnd = str.lastIndexOf('}')
            if (lastObjEnd === -1) return null
            let salvaged = str.substring(0, lastObjEnd + 1).trim()
            if (salvaged.endsWith(',')) salvaged = salvaged.substring(0, salvaged.length - 1).trim()
            const startsWithArray = salvaged.startsWith('[')
            if (startsWithArray && !salvaged.endsWith(']')) salvaged += ']'
            else if (!startsWithArray) salvaged = '[' + salvaged + ']'
            return JSON.parse(salvaged)
        } catch (e) { return null }
    }

    const extractResults = (input) => {
        if (!input) return null
        if (Array.isArray(input) && input.length > 0 && (input[0].id || input[0].id_pegawai || input[0].schedule)) return input
        if (typeof input === 'string') {
            let clean = input.trim()
            if (clean.includes('```')) clean = clean.replace(/```json\n?|```/g, '').trim()
            const firstBracket = clean.indexOf('[')
            const firstBrace = clean.indexOf('{')
            let start = -1
            if (firstBracket !== -1 && firstBrace !== -1) start = Math.min(firstBracket, firstBrace)
            else if (firstBracket !== -1) start = firstBracket
            else if (firstBrace !== -1) start = firstBrace
            if (start !== -1) {
                const lastBracket = clean.lastIndexOf(']')
                const lastBrace = clean.lastIndexOf('}')
                const end = Math.max(lastBracket, lastBrace)
                if (end > start) clean = clean.substring(start, end + 1).trim()
            }
            if (clean.startsWith('[') || clean.startsWith('{')) {
                try { return extractResults(JSON.parse(clean)) }
                catch (e) {
                    const recovered = tryRecoverTruncatedJson(clean)
                    if (recovered) return extractResults(recovered)
                    return null 
                }
            }
        }
        if (typeof input === 'object' && input !== null) {
            const fields = ['output', 'text', 'data', 'content', 'response', 'result', 'generations']
            for (const f of fields) { if (input[f]) { const found = extractResults(input[f]); if (found) return found; } }
            if (Array.isArray(input) && input.length > 0) return extractResults(input[0])
        }
        return null
    }

    const results = extractResults(responseData)

    if (!Array.isArray(results) || results.length === 0) {
        throw new Error('AI tidak memberikan hasil (Output Kosong).')
    }

    let appliedCount = 0
    let mismatchCount = 0
    
    results.forEach(row => {
        const empId = row.id || row.id_pegawai
        if (!empId) return
        const employeeExists = employees.value.some(e => String(e.id) === String(empId))
        if (!employeeExists) { mismatchCount++; return; }
        if (Array.isArray(row.schedule)) {
            row.schedule.forEach((shift, index) => {
                const d = index + 1
                if (d <= daysInMonth.value) {
                    pendingChanges.value[`${empId}_${d}`] = shift
                    appliedCount++
                }
            })
        }
    })

    if (appliedCount > 0) {
        hasChanges.value = true
        Swal.fire({
            icon: 'success',
            title: 'Jadwal AI Berhasil Disiapkan',
            html: `Berhasil menyusun jadwal untuk <b>${Math.ceil(appliedCount / daysInMonth.value)}</b> pegawai.<br><small>Silakan tinjau tabel dan klik <b>Simpan Changes</b>.</small>`,
            confirmButtonText: 'Tinjau Sekarang',
            customClass: {
                popup: 'ai-dark-premium-popup',
                title: 'ai-dark-premium-title',
                confirmButton: 'ai-dark-premium-confirm'
            }
        })
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'AI Error',
      text: err.message || 'Gagal generate jadwal AI.',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    analyzing.value = false
  }
}

// Save
const saveChanges = async () => {
  if (!hasChanges.value) return
  saving.value = true
  try {
    const updates = {}
    Object.keys(pendingChanges.value).forEach(key => {
      const [empId, day] = key.split('_')
      if (!updates[empId]) updates[empId] = {}
      updates[empId][`h${day}`] = pendingChanges.value[key]
    })
    const payloadData = Object.keys(updates).map(empId => ({ id: empId, ...updates[empId] }))
    const res = await jadwalPegawaiService.saveSchedule(filter.value.month, filter.value.year, payloadData)
    if (res.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Jadwal berhasil disimpan!',
        timer: 2000,
        showConfirmButton: false
      })
      await fetchData()
    } else { throw new Error(res.data.message || 'Gagal menyimpan') }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: 'Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message),
      confirmButtonColor: '#ef4444'
    })
  } finally { saving.value = false }
}

onMounted(() => {
  initFilter()
  fetchData()
})

watch([() => filter.value.month, () => filter.value.year, () => filter.value.department], () => {
  fetchData()
})
</script>

<style scoped>
.jadwal-page {
  padding: 0.75rem; /* Reduced from 1.5rem */
  height: calc(100vh - 64px); /* Adjust based on header height */
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  flex-direction: column; /* Stack title and controls vertically */
  align-items: flex-start; /* Align to left */
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
  flex-wrap: nowrap;
  overflow-x: visible; /* Fix dropdown clipping */
}

.form-select, .form-input {
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white; 
}

.month-select {
  min-width: 150px;
}

.year-select {
  min-width: 100px;
  max-width: 120px;
  max-width: 120px;
}

.dept-select {
  min-width: 180px;
}

.search-input {
  min-width: 200px;
}


/* ... Table Layout ... */

@media (max-width: 768px) {
  .jadwal-page {
    height: auto !important; 
    overflow: visible !important;
  }
  
  .page-header {
    z-index: 60;
    position: relative;
  }

  .controls, .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem; /* Closer spacing */
    width: 100%;
  }

  /* Wrappers: Just full width, no padding/border logic here */
  .filter-group .month-select,
  .filter-group .year-select {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin: 0 !important;
  }

  /* Inner Triggers: Apply the padding/sizing here to match inputs */
  .filter-group .month-select :deep(.select-trigger),
  .filter-group .year-select :deep(.select-trigger) {
    padding: 0.75rem !important;
    font-size: 1rem !important;
    height: auto !important;
    box-sizing: border-box !important;
  }

  /* Standard Inputs/Buttons */
  .filter-group .search-input,
  .filter-group .btn {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 1rem !important;
    box-sizing: border-box !important;
    height: 45px !important;
  }
  
  /* Hide search input min-width on mobile */
  .search-input {
    min-width: 0;
  }
}

.btn {
  height: 38px; /* Fixed height for consistency */
  padding: 0 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #64748b;
  color: white;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-ai {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4), 0 2px 4px -1px rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-ai:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.5), 0 4px 6px -2px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.btn-ai:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:hover {
  background: #2563eb;
}

/* AI Premium Styles */
.ai-premium-container {
  padding: 1rem 0;
}

.ai-header-fancy {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}

.ai-chip-icon {
  font-size: 1.5rem;
  color: white;
}

.ai-stats-card-premium {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
}

:deep(.ai-dark-premium-popup) {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #f1f5f9 !important;
  border-radius: 20px !important;
}

:deep(.ai-dark-premium-title) {
  color: #f1f5f9 !important;
  font-size: 1.5rem !important;
}

:deep(.ai-dark-premium-actions) {
  margin-top: 1.5rem !important;
}

:deep(.ai-dark-premium-confirm) {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border-radius: 10px !important;
  padding: 0.75rem 2rem !important;
  font-weight: 600 !important;
  width: 100% !important;
}

:deep(.ai-dark-premium-cancel) {
  background: transparent !important;
  color: #94a3b8 !important;
  font-weight: 500 !important;
}

/* Pattern Modal Styles */
.pattern-modal {
  max-width: 800px;
  width: 95%;
}
.pattern-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.pattern-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}
.pattern-row label {
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  width: 80px;
  flex-shrink: 0;
}
.pattern-row .form-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.row-blue { background-color: #f0f9ff; }
.row-yellow { background-color: #fffbeb; }

/* Table Layout */
.table-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0; /* Crucial for flex child to not overflow parent */
}

.table-wrapper {
  height: 100%;
  width: 100%;
  overflow: auto; /* Handles both x and y scroll */
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
  padding: 0.25rem 0.4rem; /* Reduced from 0.5rem */
  text-align: center;
  font-size: 0.8rem; /* Reduced from 0.85rem */
  min-width: 60px;
}

/* Sticky Headers and Columns */
thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 30; /* High z-index for header */
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Stats Columns */
}

.stats-header {
  background: white !important; /* Stand out from dates */
  font-weight: 700 !important;
  color: #1e293b !important;
  min-width: 80px;
  border-bottom: 2px solid #e2e8f0;
}

.stats-cell {
  background: white;
  text-align: center;
  font-size: 0.85rem;
  color: #334155;
}

.font-bold {
  font-weight: 700;
}

.text-green-600 {
  color: #16a34a;
}
.text-red-600 {
  color: #dc2626;
}

/* Adjust sticky column shadow */
.sticky-col {
  position: sticky;
  left: 0;
  background: white; /* Ensure opaque background */
  z-index: 10;
  width: 250px; /* Fixed width for name column */
  min-width: 250px;
  max-width: 250px;
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); /* Proper shadow separator */
}

thead .sticky-col {
  z-index: 50; /* Highest z-index for top-left intersection */
  background: #f8fafc; /* Match header background */
}

.name-col {
  min-width: 250px;
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

.date-col {
  font-size: 0.9rem;
}

.day-name {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: normal;
}

.sunday {
  background-color: #fef2f2 !important; /* Light red */
  color: #ef4444;
}

.holiday {
  background-color: #fff1f2 !important;
  color: #e11d48;
}

/* Ensure sticky behavior is maintained for holiday headers */
thead th.holiday {
  position: sticky;
  top: 0;
  z-index: 31; /* Slightly higher than normal sticky th */
}

.date-header-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.holiday-indicator {
  width: 6px;
  height: 6px;
  background-color: #e11d48;
  border-radius: 50%;
  margin-top: 2px;
  box-shadow: 0 0 4px rgba(225, 29, 72, 0.4);
  transition: transform 0.2s;
}

.date-col:hover .holiday-indicator {
  transform: scale(1.3);
}

.date-col:hover {
  z-index: 1100 !important; /* Boost z-index of the entire cell on hover */
}

.holiday-name-tooltip {
  position: absolute;
  top: 100%; /* Move back to bottom */
  left: 50%;
  transform: translateX(-50%);
  background: #e11d48;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 2000; /* Extremely high z-index */
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  margin-top: 8px;
}

.date-col:hover .holiday-name-tooltip {
  opacity: 1;
  visibility: visible;
  top: 100%;
}

.holiday-name-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%; /* Back to top of tooltip */
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: #e11d48; /* Arrow pointing up */
}

.shift-cell {
  cursor: pointer;
  transition: background-color 0.1s;
}

.shift-cell:hover {
  background-color: #f1f5f9;
}

/* Shift Badges */
.shift-badge {
  display: inline-block;
  padding: 2px 4px; /* More compact */
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 40px;
}

.shift-default { background: #f1f5f9; color: #64748b; }
.shift-pagi { background: #dbeafe; color: #1e40af; }
.shift-siang { background: #fef9c3; color: #854d0e; }
.shift-malam { background: #dbeafe; color: #1e3a8a; /* Darker blue */ } 
.shift-midle { background: #ffedd5; color: #9a3412; }
.shift-cuti { background: #fce7f3; color: #be185d; }
.shift-libur { background: #fee2e2; color: #991b1b; }

/* Floating Actions */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  animation: slideUp 0.3s ease;
  z-index: 50;
}

.changes-info {
  font-size: 0.9rem;
  color: #64748b;
}

.btn-save {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem 1.5rem;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh; /* Limit height */
  display: flex;
  flex-direction: column;
  padding: 0; /* Remove padding from container, move to children */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* Scrollable content */
  flex: 1;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
}

.modal-context {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
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
  padding: 0.75rem;
  border: 2px solid transparent;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.shift-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.shift-code {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.shift-time {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.shift-name {
  font-size: 0.8rem;
  color: #334155;
  text-align: center;
}

.clear-btn {
  border-color: #ef4444;
  color: #ef4444;
}
.clear-btn:hover {
  background: #fef2f2;
}

/* Summary Section */
.summary-section {
  margin-top: 2rem;
  margin-bottom: 5rem; /* Space for floating button */
}

.summary-section h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.summary-table-container {
  height: auto;
  max-width: 100%;
}

/* Ensure summary headers match main table */
.summary-table th {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Match main header shadow */
}

/* Ensure sticky column in summary matches main table sticky */
.summary-table .sticky-col {
  z-index: 40;
  display: table-cell; /* Restore table behavior */
  vertical-align: middle;
  padding-left: 1rem !important;
  border-right: 1px solid #e2e8f0; /* Ensure border exists */
}

.summary-table thead .sticky-col {
  background: #f8fafc;
  color: #475569;
  z-index: 50;
  border-bottom: 1px solid #e2e8f0;
}

.shift-label {
  font-weight: 600; /* Keep label bold for readability */
  font-size: 0.9rem;
}

/* Row Colors - Keep colors but strictly match cell sizing */
.row-blue .summary-cell:not(.holiday):not(.sunday) {
  background-color: #3b82f6; 
  color: white;
}
.row-blue .summary-cell.holiday, .row-blue .summary-cell.sunday {
  background-color: #fff1f2 !important;
  color: #e11d48 !important;
}
.row-blue .sticky-col {
  background-color: white;
}

.row-yellow .summary-cell:not(.holiday):not(.sunday) {
  background-color: #fef08a;
  color: black;
}
.row-yellow .summary-cell.holiday, .row-yellow .summary-cell.sunday {
  background-color: #fff1f2 !important;
  color: #e11d48 !important;
}
.row-yellow .sticky-col {
  background-color: white;
}

/* Fix Sunday headers in summary */
.summary-table .sunday {
  /* background-color: #ef4444 !important; Red 500 */
  /* User wants style match: Main table has light red background for sunday (`.sunday`) */
  /* Let's double check main table sunday style */
  background-color: #fef2f2 !important; /* Matches main table redness usually, or just use class */
  color: #ef4444 !important;
}

/* Adjust cell padding/size to match main table */
.summary-table td {
  padding: 0.5rem; /* Match main table */
  font-size: 0.85rem; /* Match main table */
  height: 100%; /* Vertical alignment */
}

.mobile-text {
  display: none;
}

/* Special High Contrast for Summary Number Cells */
.summary-cell {
  font-weight: 600;
}

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
  
  .filters-bar, .filter-group {
    flex-direction: column; /* Stack vertically */
    align-items: stretch;
    gap: 0.75rem; /* Add spacing between items */
    width: 100%;
  }

  .filter-group .form-select,
  .filter-group .search-input,
  .filter-group .btn {
    width: 100%; /* Full width for easy tapping */
    min-width: 0;
    margin: 0;
  }
  
  .controls {
    width: 100%;
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
