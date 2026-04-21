<template>
  <div>
    <div class="filter-card shadow-sm mb-4">
        <div class="row g-3 align-items-center">
            <!-- Tahun & Jenis Laporan Group -->
            <div class="col-lg-3">
                <div class="d-flex gap-2">
                    <div class="flex-shrink-0" style="width: 100px;">
                        <label class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Tahun</label>
                        <select class="form-select border-0 bg-light-subtle shadow-none" v-model="filters.tahun" @change="fetchData">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-file-invoice me-1"></i> Jenis Laporan</label>
                        <div class="custom-segmented-control">
                            <input type="radio" name="tipe" id="triwulan" value="triwulan" v-model="filters.tipe" hidden>
                            <label for="triwulan">Triwulan</label>
                            
                            <input type="radio" name="tipe" id="semester" value="semester" v-model="filters.tipe" hidden>
                            <label for="semester">Semester</label>
                            <div class="selection-slider"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Periode & Tampilan Group -->
            <div class="col-lg-4">
                <div class="d-flex gap-2">
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-clock me-1"></i> Periode Ke-</label>
                        <div class="custom-segmented-control period-selector" v-if="filters.tipe === 'triwulan'">
                            <input type="radio" name="periode" id="p1" :value="1" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p1">I</label>
                            <input type="radio" name="periode" id="p2" :value="2" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p2">II</label>
                            <input type="radio" name="periode" id="p3" :value="3" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p3">III</label>
                            <input type="radio" name="periode" id="p4" :value="4" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p4">IV</label>
                            <div class="selection-slider"></div>
                        </div>
                        <div class="custom-segmented-control" v-else>
                            <input type="radio" name="periode-s" id="s1" :value="1" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s1">Semester 1</label>
                            <input type="radio" name="periode-s" id="s2" :value="2" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s2">Semester 2</label>
                            <div class="selection-slider"></div>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-layer-group me-1"></i> Tampilan</label>
                        <div class="custom-segmented-control">
                            <input type="radio" name="jenis" id="semua" value="semua" v-model="filters.jenis" @change="fetchData" hidden>
                            <label for="semua">Semua</label>
            
                            <input type="radio" name="jenis" id="group" value="group" v-model="filters.jenis" @change="fetchData" hidden>
                            <label for="group">Indikator</label>
                            <div class="selection-slider"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Unit / Dep Filter -->
            <div class="col-lg-4" v-if="filters.jenis !== 'group'">
                <label class="filter-label"><i class="fas fa-hospital-user me-1"></i> Unit / Ruang</label>
                <v-select 
                    :options="units" 
                    label="nama_ruang" 
                    v-model="filters.unit"
                    :reduce="unit => unit.dep_id"
                    placeholder="Semua Unit"
                    class="modern-select"
                    @update:modelValue="fetchData"
                />
            </div>

            <!-- Action Area -->
            <div class="col-lg-1">
                <label class="filter-label d-none d-lg-block" style="visibility: hidden;">Action</label>
                <button class="btn btn-refresh rounded-3 w-100" @click="fetchData" title="Refresh Data">
                    <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
                </button>
            </div>
        </div>
    </div>

    <div class="alert alert-info d-flex align-items-center mb-4" v-if="periodeInfo">
        <i class="fas fa-info-circle me-2 fs-4"></i>
        <div>
            <div class="fw-bold text-uppercase">Laporan {{ filters.tipe }} {{ filters.periode }} Tahun {{ filters.tahun }}</div>
            <small>Periode Data: {{ formatDate(periodeInfo.start) }} s/d {{ formatDate(periodeInfo.end) }}</small>
        </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="bg-light text-center">
              <tr>
                <th width="5%">#</th>
                <th width="30%">Indikator & Unit</th>
                <th width="15%">Target</th>
                <th width="10%">Num</th>
                <th width="10%">Denum</th>
                <th width="15%">Capaian (%)</th>
                <th width="15%">Kesimpulan</th>
                <th width="10%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                   <p class="mb-0">Tidak ada data laporan untuk periode ini.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.id_inmut">
                <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                   <div class="fw-bold">{{ item.nama_inmut }}</div>
                   <small class="text-muted">{{ item.nama_ruang }}</small>
                </td>
                <td class="text-center">
                    {{ getStandar(item) }}
                </td>
                <td class="text-center">{{ item.total_num }}</td>
                <td class="text-center">{{ item.total_denum }}</td>
                <td class="text-center fw-bold" :class="isTercapai(item) ? 'text-success' : 'text-danger'">
                    {{ item.score }}%
                </td>
                <td class="text-center">
                    <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai' }}</span>
                </td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="fetchDetail(item)">
                        Detail
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
       <div class="card-footer bg-white border-top-0 py-4 px-4">
         <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="pagination-info">
                <span class="text-muted fw-medium">Menampilkan </span>
                <span class="badge bg-light text-primary rounded-pill px-3">{{ items.length }}</span>
                <span class="text-muted fw-medium"> dari </span>
                <span class="badge bg-light text-dark rounded-pill px-3">{{ total }}</span>
                <span class="text-muted fw-medium"> data indikator</span>
            </div>
            <nav aria-label="Page navigation" v-if="totalPages > 1">
                <ul class="pagination custom-pagination mb-0">
                    <!-- First Page -->
                    <li class="page-item" :class="{ disabled: page === 1 }">
                        <button class="page-link" @click="changePage(1)" aria-label="First">
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                    </li>
                    
                    <!-- Previous -->
                    <li class="page-item" :class="{ disabled: page === 1 }">
                        <button class="page-link" @click="changePage(page - 1)" aria-label="Previous">
                            <i class="fas fa-angle-left"></i>
                        </button>
                    </li>

                    <!-- Page Numbers -->
                    <li class="page-item" :class="{ active: page === p, disabled: p === '...' }" v-for="(p, idx) in displayedPages" :key="idx">
                        <button v-if="p !== '...'" class="page-link" @click="changePage(p)">{{ p }}</button>
                        <span v-else class="page-link">{{ p }}</span>
                    </li>

                    <!-- Next -->
                    <li class="page-item" :class="{ disabled: page === totalPages }">
                        <button class="page-link" @click="changePage(page + 1)" aria-label="Next">
                            <i class="fas fa-angle-right"></i>
                        </button>
                    </li>

                    <!-- Last Page -->
                    <li class="page-item" :class="{ disabled: page === totalPages }">
                        <button class="page-link" @click="changePage(totalPages)" aria-label="Last">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-white border-0 py-3 px-4">
                    <h5 class="modal-title fw-bold text-primary">Detail Laporan Indikator Mutu</h5>
                    <button type="button" class="btn-close" @click="closeDetail"></button>
                </div>
                <div class="modal-body p-4 bg-light">
                    <div v-if="detailLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Memuat data rincian...</p>
                    </div>
                    <div v-else-if="detailData">
                        <!-- Header Detail -->
                        <div class="card border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
                            <div class="card-body p-0">
                                <div class="bg-white p-3 border-bottom">
                                    <h5 class="fw-bold mb-0">{{ detailData.indicator.nama_inmut_utama || detailData.indicator.nama_inmut }}</h5>
                                </div>
                                <div class="p-4">
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="text-muted small fw-bold text-uppercase d-block mb-1">Unit / Ruang</label>
                                                <div class="fw-bold">{{ detailData.indicator.nama_ruang || '-' }}</div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="text-muted small fw-bold text-uppercase d-block mb-1">Numerator</label>
                                                <div class="text-sm">{{ detailData.indicator.ket_num_utama || '-' }}</div>
                                            </div>
                                            <div class="mb-0">
                                                <label class="text-muted small fw-bold text-uppercase d-block mb-1">Denominator</label>
                                                <div class="text-sm">{{ detailData.indicator.ket_denum_utama || '-' }}</div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="text-muted small fw-bold text-uppercase d-block mb-1">Target / Standar</label>
                                                <div class="fw-bold text-primary fs-5">{{ getStandar(detailData.indicator) }}</div>
                                            </div>
                                            <div class="mb-0">
                                                <label class="text-muted small fw-bold text-uppercase d-block mb-1">Periode Laporan</label>
                                                <div class="fw-bold">{{ filters.tipe.toUpperCase() }} {{ filters.periode }} - {{ filters.tahun }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Data Table Breakdown -->
                        <div class="row g-4 mb-4">
                            <div class="col-lg-8">
                                <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                                    <div class="card-header bg-white py-3 border-0">
                                        <h6 class="mb-0 fw-bold"><i class="fas fa-table me-2 text-primary"></i>Rincian Capaian Per Bulan</h6>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table mb-0 align-middle">
                                            <thead class="table-light text-center border-top">
                                                <tr>
                                                    <th>Bulan</th>
                                                    <th>Target</th>
                                                    <th>Numerator</th>
                                                    <th>Denumerator</th>
                                                    <th>Capaian (%)</th>
                                                    <th>Hasil</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                <tr v-if="detailData.monthly.length === 0">
                                                    <td colspan="6" class="py-4 text-muted">Belum ada data bulanan</td>
                                                </tr>
                                                <tr v-for="m in detailData.monthly" :key="m.bulan">
                                                    <td class="fw-bold">{{ getMonthName(m.bulan) }} {{ m.tahun }}</td>
                                                    <td>{{ getStandar(detailData.indicator) }}</td>
                                                    <td>{{ m.total_num }}</td>
                                                    <td>{{ m.total_denum }}</td>
                                                    <td class="fw-bold" :class="isTercapai(m, detailData.indicator) ? 'text-success' : 'text-danger'">
                                                        {{ m.score }}%
                                                    </td>
                                                    <td>
                                                        <span class="badge" :class="isTercapai(m, detailData.indicator) ? 'bg-success' : 'bg-danger'">
                                                            {{ isTercapai(m, detailData.indicator) ? 'Tercapai' : 'Tidak Tercapai' }}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <!-- Trend Chart -->
                            <div class="col-lg-4">
                                <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                                    <div class="card-header bg-white py-3 border-0">
                                        <h6 class="mb-0 fw-bold"><i class="fas fa-chart-line me-2 text-primary"></i>Tren Capaian</h6>
                                    </div>
                                    <div class="card-body">
                                        <apexchart 
                                            v-if="chartSeries.length > 0"
                                            width="100%" 
                                            height="320" 
                                            :options="chartOptions" 
                                            :series="chartSeries"
                                        ></apexchart>
                                        <div v-else class="text-center text-muted py-5">Data grafik tidak tersedia</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button class="btn btn-secondary px-4" @click="closeDetail">Tutup</button>
                    <button v-if="detailData" class="btn btn-primary px-4" @click="window.print()"><i class="fas fa-print me-1"></i> Cetak Laporan</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const items = ref([])
const units = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const periodeInfo = ref(null)

// Detail View State
const showDetail = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

const currentYear = new Date().getFullYear()
const years = Array.from({length: 5}, (_, i) => currentYear - i)

const filters = reactive({
    tahun: currentYear,
    tipe: 'triwulan',
    periode: 1, // Default Triwulan 1
    unit: null,
    jenis: 'semua'
})

// Watch filters.tipe to reset periode logic if needed
watch(() => filters.tipe, (newVal) => {
    // Reset to 1 when switching types to avoid invalid period 3/4 for semester
    filters.periode = 1
    fetchData()
})

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
        periodeInfo.value = response.data.periode_info
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const formatDate = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const displayedPages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1)
            } else if (i - l !== 1) {
                rangeWithDots.push('...')
            }
        }
        rangeWithDots.push(i)
        l = i
    }

    return rangeWithDots
})

const getMonthName = (m) => monthNames[parseInt(m) - 1]

const fetchDetail = async (item) => {
    detailLoading.value = true
    showDetail.value = true
    detailData.value = null
    
    try {
        const params = {
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            id_inmut: item.id_inmut,
            id_master: item.id_master
        }
        const response = await api.getLaporanDetail(params)
        detailData.value = response.data.data
    } catch (error) {
        console.error(error)
    } finally {
        detailLoading.value = false
    }
}

const closeDetail = () => {
    showDetail.value = false
    detailData.value = null
}

const chartSeries = computed(() => {
    if (!detailData.value || !detailData.value.monthly) return []
    return [
        {
            name: 'Capaian (%)',
            data: detailData.value.monthly.map(m => m.score)
        },
        {
            name: 'Target',
            type: 'line',
            data: detailData.value.monthly.map(m => {
                const std = parseFloat(detailData.value.indicator.standar_utama || detailData.value.indicator.standar)
                return isNaN(std) ? 0 : std
            })
        }
    ]
})

const chartOptions = computed(() => {
    if (!detailData.value || !detailData.value.monthly) return {}
    
    const months = detailData.value.monthly.map(m => shortMonthNames[parseInt(m.bulan) - 1])
    const std = parseFloat(detailData.value.indicator.standar_utama || detailData.value.indicator.standar)
    
    return {
        chart: {
            height: 350,
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        stroke: {
            width: [4, 2],
            curve: 'smooth',
            dashArray: [0, 8]
        },
        colors: ['#435ebe', '#ff4560'],
        xaxis: {
            categories: months
        },
        yaxis: {
            min: 0,
            max: 100,
            title: { text: 'Persentase (%)' }
        },
        markers: {
            size: 5,
            hover: { size: 7 }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        grid: {
            borderColor: '#f1f1f1'
        },
        tooltip: {
            y: { formatter: (val) => val + '%' }
        }
    }
})

// Logic reused from AnalisaTab roughly
const getRumusSymbol = (val) => {
    const map = {
        '1': '=',
        '2': '≤',
        '3': '<',
        '4': '≥',
        '5': '>'
    }
    return map[val] || val || ''
}

const getStandar = (item) => {
    // item here might be from rekap query merged into indicator master
    const ind = item; 
    
    // In Laporan controller we use leftJoin, so fields like 'standar_utama' are available directly on item if joined
    // But our controller logic populates: nama_inmut_utama, standar_utama, etc.
    // However, if we look at `MonitoringIndikatorMutuController` update:
    /*
        $indicators = RsiaMasterInmut::select(...) ... leftJoin(...)
    */
    // So `item` has `standar_utama` etc directly.
    
    const std = (item.standar_utama) ? item.standar_utama : item.standar;
    const rumus = (item.rumus_utama) ? item.rumus_utama : item.rumus;
    const satuan = (item.satuan_utama) ? item.satuan_utama : item.satuan;
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`;
}

const isTercapai = (data, meta = null) => {
    const target = meta || data;
    const std = parseFloat((target.standar_utama) ? target.standar_utama : target.standar);
    const rumus = String((target.rumus_utama) ? target.rumus_utama : target.rumus);
    
    const score = parseFloat(data.score);
    
    if (isNaN(std)) return false;

    switch (rumus) {
        case '1': return score == std; // =
        case '2': return score <= std; // <=
        case '3': return score < std; // <
        case '4': return score >= std; // >=
        case '5': return score > std; // >
        default: return false;
    }
}

onMounted(() => {
    fetchUnits()
    fetchData()
})
</script>

<style scoped>
.filter-card {
    background: #fff;
    padding: 1.25rem;
    border-radius: 12px;
}

.filter-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #8c98a5;
    margin-bottom: 0.5rem;
    display: block;
    letter-spacing: 0.5px;
}

/* Custom Segmented Control */
.custom-segmented-control {
    display: flex;
    position: relative;
    background: #f4f6f9;
    padding: 3px;
    border-radius: 8px;
    height: 38px;
    z-index: 1;
}

.custom-segmented-control label {
    flex: 1;
    z-index: 2;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6e7985;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.3s ease;
    margin-bottom: 0;
}

.custom-segmented-control input:checked + label {
    color: #fff;
}

/* Logic for slider background movement would require JS or fixed widths, 
   for now we use a simpler checked approach with pure CSS */
.custom-segmented-control input:checked + label {
    background: #435ebe;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(67, 94, 190, 0.2);
}

.period-selector label {
    font-weight: 800;
}

/* Modern V-Select Styling */
.modern-select :deep(.vs__dropdown-toggle) {
    background: #f4f6f9;
    border: none;
    border-radius: 8px;
    height: 38px;
    padding: 0 4px;
}

.modern-select :deep(.vs__selected) {
    font-weight: 600;
    font-size: 0.85rem;
    color: #435ebe;
}

.modern-select :deep(.vs__search::placeholder) {
    color: #6e7985;
    font-size: 0.85rem;
}

.btn-refresh {
    background: #eef2f7;
    color: #435ebe;
    border: none;
    height: 38px;
    transition: all 0.2s;
}

.btn-refresh:hover {
    background: #435ebe;
    color: #fff;
}

/* Custom Pagination Styling */
.custom-pagination {
    gap: 6px;
}

.custom-pagination .page-item .page-link {
    border: none;
    background: #f4f6f9;
    color: #6e7985;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px !important;
    font-weight: 700;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.custom-pagination .page-item.active .page-link {
    background: #435ebe;
    color: #fff;
    box-shadow: 0 4px 10px rgba(67, 94, 190, 0.35);
}

.custom-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
    background: #eef2f7;
    color: #435ebe;
    transform: translateY(-2px);
}

.custom-pagination .page-item.disabled .page-link {
    background: #f8f9fa;
    color: #dee2e6;
    cursor: not-allowed;
}

.pagination-info {
    font-size: 0.85rem;
}

.pagination-info .badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
}

/* Pagination Adjustments */
@media (max-width: 991px) {
    .filter-card .row > div {
        margin-bottom: 1rem;
    }
}

@media (max-width: 768px) {
  .pagination-info {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .custom-pagination {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
  }
}
</style>
