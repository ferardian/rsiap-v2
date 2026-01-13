<template>
  <div class="container-fluid p-0">
    <div class="row mb-4">
      <div class="col-md-6">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-edit me-2"></i>Input Data Indikator Mutu
        </h3>
        <p class="text-muted mb-0">Input data realisasi indikator mutu harian</p>
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
        <div class="input-group" style="max-width: 250px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="date" class="form-control border-start-0 ps-0" v-model="filters.tgl_transaksi" @change="fetchIndicators">
        </div>
        
        <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang"
            class="style-chooser"
            style="min-width: 250px;"
            :disabled="isUnitLocked"
            @update:modelValue="fetchIndicators"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>
      </div>
    </div>

    <!-- Content -->
    <!-- Content -->
    <div class="card shadow-sm border-0">
      <div class="card-header py-3 d-flex justify-content-between align-items-center border-bottom" style="background-color: #fff !important; color: #212529 !important;">
        <div class="btn-group" role="group">
            <button 
                type="button" 
                class="btn btn-sm" 
                :class="viewMode === 'daily' ? 'btn-primary' : 'btn-light border'"
                @click="viewMode = 'daily'"
            >
                <i class="fas fa-list me-1"></i> Harian
            </button>
            <button 
                type="button" 
                class="btn btn-sm" 
                :class="viewMode === 'monthly' ? 'btn-primary' : 'btn-light border'"
                @click="viewMode = 'monthly'"
            >
                <i class="fas fa-calendar-alt me-1"></i> Bulanan (Bulk)
            </button>
            <button 
                type="button" 
                class="btn btn-sm" 
                :class="viewMode === 'analisa' ? 'btn-primary' : 'btn-light border'"
                @click="viewMode = 'analisa'"
            >
                <i class="fas fa-chart-line me-1"></i> Analisa
            </button>
        </div>
        
        <!-- Indicator Selector for Monthly Mode -->
        <div v-if="viewMode === 'monthly'" class="flex-grow-1 ms-3" style="max-width: 600px;">
            <v-select 
                :options="indicators" 
                label="nama_inmut" 
                v-model="selectedIndicator"
                placeholder="Pilih Indikator untuk Entri..."
                class="style-chooser"
            />
        </div>

        <!-- Indicator & Month Selector for Analisa Mode -->
        <div v-if="viewMode === 'analisa'" class="d-flex gap-2 ms-3 flex-grow-1" style="max-width: 800px;">
            <v-select 
                :options="indicators" 
                label="nama_inmut" 
                v-model="selectedIndicatorAnalisa"
                placeholder="Pilih Indikator..."
                class="style-chooser flex-grow-1"
                @update:modelValue="fetchAnalisaData"
            />
            <input 
                type="month" 
                class="form-control" 
                v-model="analisaFilters.bulan"
                @change="fetchAnalisaData"
                style="max-width: 200px;"
            >
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="!filters.unit" class="text-center py-5 text-muted">
            <i class="fas fa-hospital-user fa-3x mb-3 opacity-50"></i>
            <p class="mb-0">Silahkan pilih unit / ruangan terlebih dahulu</p>
        </div>
        
        <div v-else-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="indicators.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-list-ul fa-3x mb-3 opacity-50"></i>
            <p class="mb-0">Tidak ada indikator mutu yang terdaftar untuk unit ini</p>
        </div>

        <div v-else-if="viewMode === 'daily'" class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                    <tr>
                        <th width="5%" class="text-center">#</th>
                        <th width="35%">Indikator</th>
                        <th width="15%">Standar</th>
                        <th width="30%">Input Data</th>
                        <th width="15%">Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in indicators" :key="item.id_inmut">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                            <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                            <small class="text-muted d-block small-text">{{ stripHtml(item.definisi_operasional) }}</small>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">
                                {{ getRumusSymbol(item.rumus) }} {{ item.standar }} {{ item.satuan }}
                            </span>
                        </td>
                        <td>
                            <div v-if="item.latest_input_date" class="mb-2">
                                <span class="badge bg-info text-white" style="font-size: 0.65rem;">
                                    <i class="fas fa-history me-1"></i> Input Terakhir: {{ formatDate(item.latest_input_date) }}
                                </span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <div class="w-50">
                                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Numerator</small>
                                    <input 
                                        type="number" 
                                        class="form-control form-control-sm" 
                                        v-model.number="item.numerator" 
                                        placeholder="0"
                                        min="0"
                                    >
                                </div>
                                <div class="w-50" v-if="needsDenominator(item)">
                                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Denominator</small>
                                    <input 
                                        type="number" 
                                        class="form-control form-control-sm" 
                                        v-model.number="item.denominator" 
                                        placeholder="0"
                                        min="0"
                                    >
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-column align-items-start gap-2">
                                <div class="fw-bold" :class="getScoreColor(calculateScore(item), item)">
                                    {{ calculateScore(item) }} %
                                </div>
                                <button 
                                    class="btn btn-sm btn-outline-success" 
                                    @click="saveItem(item)"
                                    :disabled="item.isSaving"
                                >
                                    <i class="fas fa-save me-1"></i> 
                                    {{ item.isSaving ? 'Menyimpan...' : 'Simpan' }}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MONTHLY / BULK VIEW -->
        <div v-else-if="viewMode === 'monthly'" class="p-3">
            <div v-if="!selectedIndicator" class="text-center py-5 text-muted">
                <i class="fas fa-mouse-pointer fa-3x mb-3 opacity-50"></i>
                <p>Pilih Indikator di atas untuk mulai mengisi data bulanan</p>
            </div>
            
            <div v-else>
                 <div class="d-flex justify-content-between align-items-center mb-3">
                    <diV>
                        <h5 class="mb-0 text-primary">
                            <i class="fas fa-chart-line me-2"></i> {{ selectedIndicator.nama_inmut }}
                        </h5>
                        <small class="text-muted">
                            Periode: {{ new Date(filters.tgl_transaksi).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                        </small>
                    </diV>
                    <button class="btn btn-primary" @click="saveBulk" :disabled="bulkSaving">
                        <i class="fas fa-save me-2"></i>
                        {{ bulkSaving ? 'Menyimpan...' : 'Simpan Semua Data' }}
                    </button>
                 </div>

                 <div class="calendar-grid">
                    <div v-for="day in calendarDays" :key="day.date" class="calendar-day card" :class="{'has-data': day.hasData}">
                        <div class="card-header py-1 px-2 d-flex justify-content-between align-items-center" :class="day.hasData ? 'bg-success text-white' : 'bg-light'">
                            <small class="fw-bold">{{ day.date.slice(-2) }} {{ day.dayName }}</small>
                            <i v-if="day.hasData" class="fas fa-check-circle small"></i>
                        </div>
                        <div class="card-body p-2">
                            <div class="mb-2">
                                <label class="small text-muted d-block mb-0">Num</label>
                                <input type="number" class="form-control form-control-sm" v-model.number="day.numerator" min="0" @input="day.isTouched = true">
                            </div>
                            <div>
                                <label class="small text-muted d-block mb-0">Denum</label>
                                <input type="number" class="form-control form-control-sm" v-model.number="day.denominator" min="0" :disabled="!needsDenominator(selectedIndicator)" @input="day.isTouched = true">
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        <!-- ANALISA VIEW -->
        <div v-else-if="viewMode === 'analisa'" class="p-3">
            <div v-if="!selectedIndicatorAnalisa" class="text-center py-5 text-muted">
                <i class="fas fa-chart-bar fa-3x mb-3 opacity-50"></i>
                <p>Pilih Indikator dan Bulan untuk mulai mengisi analisa</p>
            </div>
            
            <div v-else>
                <!-- Header Info -->
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="text-primary mb-3">
                            <i class="fas fa-chart-line me-2"></i> {{ selectedIndicatorAnalisa.nama_inmut }}
                        </h5>
                        <div class="row">
                            <div class="col-md-3">
                                <small class="text-muted d-block">Periode</small>
                                <strong>{{ formatMonthYear(analisaFilters.bulan) }}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Total Numerator</small>
                                <strong class="text-success">{{ monthlyStats.totalNum }}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Total Denominator</small>
                                <strong class="text-info">{{ monthlyStats.totalDenum }}</strong>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Capaian</small>
                                <strong class="text-primary">{{ monthlyStats.score }}%</strong>
                            </div>
                        </div>
                        
                        <!-- Data Completeness Warning -->
                        <div v-if="!monthlyStats.isComplete" class="alert alert-warning mt-3 mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Data belum lengkap!</strong> 
                            Terdapat {{ monthlyStats.missingDays.length }} tanggal yang belum diisi: 
                            <span class="badge bg-warning text-dark ms-2">{{ monthlyStats.missingDays.join(', ') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Form Analisa -->
                <div class="card">
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Analisa <span class="text-danger">*</span></label>
                            <textarea 
                                class="form-control" 
                                rows="4" 
                                v-model="analisaForm.analisa"
                                placeholder="Tuliskan analisa capaian indikator mutu untuk bulan ini..."
                                :disabled="!monthlyStats.isComplete"
                            ></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Tindak Lanjut <span class="text-danger">*</span></label>
                            <textarea 
                                class="form-control" 
                                rows="4" 
                                v-model="analisaForm.tindak_lanjut"
                                placeholder="Tuliskan rencana tindak lanjut..."
                                :disabled="!monthlyStats.isComplete"
                            ></textarea>
                        </div>

                        <div class="d-flex justify-content-end gap-2">
                            <button 
                                class="btn btn-secondary" 
                                @click="resetAnalisaForm"
                            >
                                <i class="fas fa-times me-2"></i> Batal
                            </button>
                            <button 
                                class="btn btn-primary" 
                                @click="saveAnalisa"
                                :disabled="!monthlyStats.isComplete || analisaSaving"
                            >
                                <i class="fas fa-save me-2"></i>
                                {{ analisaSaving ? 'Menyimpan...' : (analisaForm.id_analisa ? 'Update' : 'Simpan') }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Existing Analisa List -->
                <div v-if="existingAnalisa.length > 0" class="card mt-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-history me-2"></i> Riwayat Analisa</h6>
                    </div>
                    <div class="card-body">
                        <div v-for="item in existingAnalisa" :key="item.id_analisa" class="border-bottom pb-3 mb-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <small class="text-muted">{{ formatDate(item.tanggal_awal) }} - {{ formatDate(item.tanggal_akhir) }}</small>
                                    <p class="mb-1"><strong>Analisa:</strong> {{ item.analisa }}</p>
                                    <p class="mb-0"><strong>Tindak Lanjut:</strong> {{ item.tindak_lanjut }}</p>
                                </div>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" @click="editAnalisa(item)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteAnalisaItem(item.id_analisa)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const units = ref([])
const indicators = ref([])
const isUnitLocked = ref(false)

const filters = reactive({
    tgl_transaksi: new Date().toISOString().slice(0, 10),
    unit: null
})

// === ANALISA MODE STATE ===
const selectedIndicatorAnalisa = ref(null)
const analisaSaving = ref(false)
const existingAnalisa = ref([])
const analisaFilters = reactive({
    bulan: new Date().toISOString().slice(0, 7) // YYYY-MM format
})

const analisaForm = reactive({
    id_analisa: null,
    analisa: '',
    tindak_lanjut: ''
})

// Monthly Statistics for Analisa (using ref for dynamic updates)
const monthlyStats = ref({
    totalNum: 0,
    totalDenum: 0,
    score: 0,
    isComplete: false,
    missingDays: []
})

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
        
        // Check if user has specific department
        // Path based on user provided JSON: user.data.detail.departemen
        const userDepNameOrId = authStore.user?.data?.detail?.departemen || 
                                authStore.user?.detail?.departemen || 
                                authStore.user?.dep_id
        
        if (userDepNameOrId) {
            // Find if user's department exists in the unit list (Match ID or Name)
            const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
            
            if (myUnit) {
                filters.unit = myUnit.dep_id
                isUnitLocked.value = true
                console.log('Unit locked to user department:', myUnit.nama_ruang)
            }
        }

        // Fallback or Initial Load if not locked
        if (units.value.length > 0 && !filters.unit) {
            filters.unit = units.value[0].dep_id
        }
        
        if (filters.unit) {
            fetchIndicators()
        }
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchIndicators = async () => {
    if (!filters.unit) return

    loading.value = true
    try {
        const params = {
            limit: 100,
            dep_id: filters.unit,
            status: '1'
        }
        
        // Parallel fetch: Master Indicators AND Existing Realisasi
        const [masterRes, realisasiRes] = await Promise.all([
            api.getRuang(params),
            api.getRealisasi({
                dep_id: filters.unit,
                tgl_transaksi: filters.tgl_transaksi
            })
        ])

        const rawItems = masterRes.data.data.data || []
        const realisasiData = realisasiRes.data.data || []
        
        // Map realisasi by id_inmut for easy lookup
        const realisasiMap = new Map()
        realisasiData.forEach(item => {
            realisasiMap.set(item.id_inmut, item)
        })

        // Filter client-side if needed (sanity check)
        const filteredItems = rawItems.filter(item => item.dep_id === filters.unit)
        
        indicators.value = filteredItems.map(item => {
            const saved = realisasiMap.get(item.id_inmut)
            return {
                ...item,
                numerator: saved ? saved.num : 0,
                denominator: saved ? saved.denum : 0,
                isSaving: false
            }
        })
        
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat indikator')
    } finally {
        loading.value = false
    }
}

const stripHtml = (html) => {
   if (!html) return ''
   const tmp = document.createElement("DIV")
   tmp.innerHTML = html
   return tmp.textContent || tmp.innerText || ""
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const getRumusSymbol = (val) => {
    const map = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }
    return map[val] || val || ''
}

const needsDenominator = (item) => {
    // Logic to determine if denominator is needed. 
    // Usually all "persentase" or ratio indicators need it.
    // If satuan is '%', likely yes.
    return item.satuan === '%' || item.satuan === 'Persen' || item.rumus
}

const calculateScore = (item) => {
    if (!needsDenominator(item)) {
        return item.numerator
    }
    if (!item.denominator || item.denominator == 0) return 0
    return ((item.numerator / item.denominator) * 100).toFixed(2)
}

const getScoreColor = (score, item) => {
    // Simple logic: Green if meets standard, Red if not.
    // Standard parsing might be complex (e.g. "Top 10", "> 80").
    // We'll rely on simple comparison if standard is a number.
    const std = parseFloat(item.standar)
    if (isNaN(std)) return 'text-dark'
    
    // Check rumus
    const s = parseFloat(score)
    // 1: =, 2: <=, 3: <, 4: >=, 5: >
    let passed = false
    switch(item.rumus) {
        case '1': passed = s == std; break;
        case '2': passed = s <= std; break;
        case '3': passed = s < std; break;
        case '4': passed = s >= std; break;
        case '5': passed = s > std; break;
        default: passed = true;
    }
    return passed ? 'text-success' : 'text-danger'
}

const saveItem = async (item) => {
    item.isSaving = true
    try {
        const payload = {
            id_inmut: item.id_inmut,
            tgl_transaksi: filters.tgl_transaksi,
            dep_id: filters.unit,
            numerator: item.numerator,
            denominator: item.denominator,
            nilai: calculateScore(item)
        }
        await api.saveRealisasi(payload)
        toast.success(`Data ${item.nama_inmut} berhasil disimpan`)
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data')
    } finally {
        item.isSaving = false
    }
}

// === BULK MODE LOGIC ===
const viewMode = ref('daily') // 'daily' | 'monthly'
const selectedIndicator = ref(null)
const bulkSaving = ref(false)
const calendarData = ref([])

// Generate days for the selected month
const calendarDays = computed(() => {
    if (!filters.tgl_transaksi) return []
    const date = new Date(filters.tgl_transaksi)
    const year = date.getFullYear()
    const month = date.getMonth() // 0-indexed
    
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(year, month, d)
        
        // Manual formatting to avoid timezone shifts affecting date string
        // Format: YYYY-MM-DD
        const mm = String(month + 1).padStart(2, '0')
        const dd = String(d).padStart(2, '0')
        const dateStr = `${year}-${mm}-${dd}`
        
        // Find existing data for this date
        // CRITICAL FIX: Parse ISO string to Local Date Object to handle Timezone shift (UTC 17:00 -> Local 00:00)
        const existing = calendarData.value.find(c => {
            if (!c.tanggal_inmut) return false
            const d = new Date(c.tanggal_inmut)
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            return dStr === dateStr
        })

        // Debug specific date
        if (dateStr === '2026-01-14') {
             console.log(`[Mapping 14th] Target: ${dateStr}, Found:`, existing)
        }
        
        days.push({
            date: dateStr,
            day: d,
            dayName: currentDate.toLocaleDateString('id-ID', { weekday: 'short' }),
            numerator: existing ? existing.num : 0,
            denominator: existing ? existing.denum : 0,
            hasData: !!existing,
            isTouched: !!existing // Mark as touched if data exists from DB
        })
    }
    return days
})

const fetchMonthlyData = async () => {
    if (!filters.unit || !selectedIndicator.value || viewMode.value !== 'monthly') return
    
    loading.value = true
    try {
        const date = new Date(filters.tgl_transaksi)
        const params = {
            dep_id: filters.unit,
            bulan: date.getMonth() + 1,
            tahun: date.getFullYear(),
            id_inmut: selectedIndicator.value.id_inmut
        }
        
        const response = await api.getRealisasi(params)
        calendarData.value = response.data.data || []
        
        // Check specifically for date 14 if sticking point
        const date14 = calendarData.value.find(c => c.tanggal_inmut && c.tanggal_inmut.includes('2026-01-14'));
        console.log('Debug 14th Record:', date14);

    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data bulanan')
    } finally {
        loading.value = false
    }
}


const saveBulk = async () => {
    if (!selectedIndicator.value) return
    
    bulkSaving.value = true
    try {
        // Only send days that have been touched/modified by user
        const allDays = calendarDays.value.map(day => ({
            id_inmut: selectedIndicator.value.id_inmut,
            tgl_transaksi: day.date,
            dep_id: filters.unit,
            numerator: day.numerator,
            denominator: day.denominator,
            isTouched: day.isTouched
        }))

        // Filter: only include entries that user has touched (modified or from DB)
        const payload = allDays.filter(item => item.isTouched).map(({ isTouched, ...rest }) => rest)

        if (payload.length === 0) {
            toast.warning('Tidak ada data yang diisi. Silakan isi minimal satu tanggal.')
            return
        }

        // Debug: Log payload to see if all inputs are captured
        console.log('Sending Bulk Payload:', payload)


        await api.saveRealisasiBulk({ data: payload })
        toast.success('Data bulanan berhasil disimpan')
        await fetchMonthlyData() // Refresh
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data bulk')
    } finally {
        bulkSaving.value = false
    }
}

// === ANALISA MODE FUNCTIONS ===
const fetchAnalisaData = async () => {
    if (!selectedIndicatorAnalisa.value || !analisaFilters.bulan || !filters.unit) return
    
    loading.value = true
    try {
        // Fetch monthly data to calculate stats
        const [year, month] = analisaFilters.bulan.split('-')
        const realisasiRes = await api.getRealisasi({
            dep_id: filters.unit,
            bulan: parseInt(month),
            tahun: parseInt(year),
            id_inmut: selectedIndicatorAnalisa.value.id_inmut
        })
        
        const monthlyData = realisasiRes.data.data || []
        
        // Calculate stats
        const totalNum = monthlyData.reduce((sum, item) => sum + (item.num || 0), 0)
        const totalDenum = monthlyData.reduce((sum, item) => sum + (item.denum || 0), 0)
        const score = totalDenum > 0 ? ((totalNum / totalDenum) * 100).toFixed(2) : 0
        
        // Check completeness
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
        const filledDays = new Set(monthlyData.map(item => new Date(item.tanggal_inmut).getDate()))
        const missingDays = []
        for (let d = 1; d <= daysInMonth; d++) {
            if (!filledDays.has(d)) missingDays.push(d)
        }
        
        // Update monthlyStats (need to make it ref instead of computed)
        monthlyStats.value = {
            totalNum,
            totalDenum,
            score,
            isComplete: missingDays.length === 0,
            missingDays
        }
        
        // Fetch existing analisa
        const analisaRes = await api.getAnalisa({
            dep_id: filters.unit,
            bulan: analisaFilters.bulan,
            id_inmut: selectedIndicatorAnalisa.value.id_inmut
        })
        
        existingAnalisa.value = analisaRes.data.data.data || []
        
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data analisa')
    } finally {
        loading.value = false
    }
}

const saveAnalisa = async () => {
    if (!analisaForm.analisa || !analisaForm.tindak_lanjut) {
        toast.warning('Analisa dan Tindak Lanjut harus diisi')
        return
    }
    
    analisaSaving.value = true
    try {
        const payload = {
            id_inmut: selectedIndicatorAnalisa.value.id_inmut,
            analisa: analisaForm.analisa,
            tindak_lanjut: analisaForm.tindak_lanjut,
            jml_num: monthlyStats.value.totalNum,
            jml_denum: monthlyStats.value.totalDenum,
            bulan: analisaFilters.bulan
        }
        
        if (analisaForm.id_analisa) {
            // Update
            await api.updateAnalisa(analisaForm.id_analisa, payload)
            toast.success('Analisa berhasil diperbarui')
        } else {
            // Create
            await api.storeAnalisa(payload)
            toast.success('Analisa berhasil disimpan')
        }
        
        resetAnalisaForm()
        fetchAnalisaData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan analisa')
    } finally {
        analisaSaving.value = false
    }
}

const editAnalisa = (item) => {
    analisaForm.id_analisa = item.id_analisa
    analisaForm.analisa = item.analisa
    analisaForm.tindak_lanjut = item.tindak_lanjut
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteAnalisaItem = async (id) => {
    if (!confirm('Yakin ingin menghapus analisa ini?')) return
    
    try {
        await api.deleteAnalisa(id)
        toast.success('Analisa berhasil dihapus')
        fetchAnalisaData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus analisa')
    }
}

const resetAnalisaForm = () => {
    analisaForm.id_analisa = null
    analisaForm.analisa = ''
    analisaForm.tindak_lanjut = ''
}

const formatMonthYear = (monthStr) => {
    if (!monthStr) return '-'
    const [year, month] = monthStr.split('-')
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${monthNames[parseInt(month) - 1]} ${year}`
}

// Watchers for Bulk Mode
import { watch } from 'vue'
watch(() => selectedIndicator.value, fetchMonthlyData)
// Re-fetch monthly data if month changes while in monthly mode
watch(() => filters.tgl_transaksi, () => {
    if (viewMode.value === 'monthly') fetchMonthlyData()
})

onMounted(() => {
    fetchUnits()
})
</script>

<style scoped>
.small-text {
    font-size: 0.8rem;
    line-height: 1.2;
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.small-text:hover {
    white-space: normal;
    overflow: visible;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}

.calendar-day.has-data {
    border-color: #198754;
}

</style>

<style>
/* Global overrides for this component's v-select to ensure it works */
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 6px;
  color: #212529 !important;
  text-transform: none !important;
}

.style-chooser .vs__dropdown-option {
    white-space: normal !important;
    padding: 8px 10px !important;
    line-height: 1.4 !important;
}

.style-chooser .vs__selected,
.style-chooser .vs__search {
    color: #212529 !important;
    margin: 0 !important;
    padding: 0 !important;
}

.style-chooser .vs__open-indicator {
    fill: #212529 !important;
}

.style-chooser .vs__actions {
    padding-top: 0 !important;
}
</style>
