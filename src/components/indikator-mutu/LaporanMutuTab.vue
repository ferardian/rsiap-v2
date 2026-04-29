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

                            <input type="radio" name="tipe" id="tahunan" value="tahunan" v-model="filters.tipe" hidden>
                            <label for="tahunan">Tahunan</label>
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
                        <div class="custom-segmented-control period-selector" v-else-if="filters.tipe === 'semester'">
                            <input type="radio" name="periode-s" id="s1" :value="1" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s1">Semester 1</label>
                            <input type="radio" name="periode-s" id="s2" :value="2" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s2">Semester 2</label>
                            <div class="selection-slider"></div>
                        </div>
                        <div class="custom-segmented-control bg-light-subtle" v-else>
                            <label class="w-100 text-center small fw-bold text-primary">SETAHUN PENUH</label>
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
            <div class="col-lg-3" v-if="filters.jenis !== 'group'">
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
            <div class="col-lg-2">
                <label class="filter-label" style="visibility: hidden;">Action</label>
                <div class="d-flex gap-2">
                    <button class="btn btn-refresh rounded-3 btn-sm px-2" @click="fetchData" title="Refresh Data" style="height: 38px; width: 38px;">
                        <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
                    </button>
                    <div class="dropdown flex-grow-1" ref="exportDropdownRef">
                        <button class="btn btn-outline-danger rounded-3 w-100 dropdown-toggle btn-sm fw-bold" type="button" @click.stop="toggleExportDropdown" :disabled="loading || printingProgress > 0" style="height: 38px;">
                            <i class="fas fa-file-pdf me-1"></i> 
                            <span v-if="printingProgress > 0" style="font-size: 10px;">{{ printingProgress }}%</span>
                            <span v-else>PDF</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 show" v-if="showExportDropdown" style="display: block; position: absolute; right: 0; top: 100%; z-index: 1050; min-width: 200px;">
                            <li><a class="dropdown-item py-2" @click.prevent="handleExportRekap" href="#"><i class="fas fa-list-alt me-2 text-primary"></i> Rekapitulasi (Tabel)</a></li>
                            <li><a class="dropdown-item py-2" @click.prevent="handleExportFull" href="#"><i class="fas fa-file-medical me-2 text-danger"></i> Laporan Lengkap (Semua)</a></li>
                        </ul>
                    </div>
                </div>
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
            <template v-for="(item, index) in items" :key="item.id_inmut">
              <tr :class="{ 'table-active fw-medium': expandedRowId === item.id_inmut }">
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
                <td class="text-center fw-bold text-lg" :class="isTercapai(item) ? 'text-success' : 'text-danger'">
                    {{ item.score }}%
                </td>
                <td class="text-center">
                    <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai' }}</span>
                </td>
                <td class="text-center">
                    <button 
                        class="btn btn-detail-toggle" 
                        :class="{ 'active': expandedRowId === item.id_inmut }"
                        @click="fetchDetail(item)"
                    >
                        <span>Detail</span>
                        <i class="fas fa-chevron-down ms-1 transition-transform" :class="{ 'fa-rotate-180': expandedRowId === item.id_inmut }"></i>
                    </button>
                </td>
              </tr>

              <!-- Expandable Detail Row -->
              <tr v-if="expandedRowId === item.id_inmut">
                <td colspan="8" class="p-0 border-0 bg-light">
                  <div class="expandable-content-wrapper overflow-hidden">
                    <div class="detail-container p-4">
                      <div v-if="detailLoading" class="text-center py-4">
                        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                        <span class="ms-2 text-muted small">Memuat rincian...</span>
                      </div>
                      
                      <div v-else-if="detailData" class="detail-content animate-fade-in">
                        <!-- Header Detail Card -->
                        <div class="detail-header-card shadow-sm mb-4">
                          <div class="row g-4">
                            <div class="col-md-7">
                              <div class="d-flex align-items-start gap-3 mb-3">
                                <div class="detail-icon-box">
                                  <i class="fas fa-info-circle"></i>
                                </div>
                                <div>
                                  <h6 class="fw-800 text-dark mb-1">{{ detailData.indicator.nama_inmut_utama || detailData.indicator.nama_inmut }}</h6>
                                  <p class="text-muted small mb-0">{{ detailData.indicator.nama_ruang || '-' }}</p>
                                </div>
                              </div>
                              <div class="row g-3">
                                <div class="col-sm-6">
                                  <div class="meta-item">
                                    <span class="meta-label">Numerator</span>
                                    <span class="meta-value">{{ detailData.indicator.ket_num_utama || '-' }}</span>
                                  </div>
                                </div>
                                <div class="col-sm-6">
                                  <div class="meta-item">
                                    <span class="meta-label">Denominator</span>
                                    <span class="meta-value">{{ detailData.indicator.ket_denum_utama || '-' }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                                <div class="col-md-5">
                                  <div class="d-flex justify-content-between align-items-start mb-3">
                                      <div class="target-card-mini flex-grow-1 me-2">
                                        <div class="d-flex justify-content-between align-items-center">
                                          <span class="text-muted small fw-bold">TARGET / STANDAR</span>
                                          <span class="target-value">{{ getStandar(detailData.indicator) }}</span>
                                        </div>
                                      </div>
                                      <button class="btn btn-outline-danger btn-sm rounded-3 shadow-sm px-3" @click="exportDetailToPDF(detailData)" title="Download PDF Laporan">
                                          <i class="fas fa-file-pdf me-1"></i> PDF
                                      </button>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small fw-bold">PERIODE</span>
                                    <span class="text-dark fw-bold">{{ filters.tipe.toUpperCase() }} {{ filters.periode }} - {{ filters.tahun }}</span>
                                  </div>
                                </div>
                          </div>
                        </div>

                        <!-- Data & Trend Split -->
                        <div class="row g-4">
                          <div class="col-xl-7">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                              <div class="card-header bg-primary py-3 border-0 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold text-white"><i class="fas fa-table me-2"></i>Rincian Capaian Per Bulan</h6>
                              </div>
                              <div class="table-responsive">
                                <table class="table table-sm mb-0 align-middle">
                                  <thead class="bg-gray-50 text-center text-xs fw-800 text-uppercase text-muted">
                                    <tr>
                                      <th class="py-3">Bulan</th>
                                      <th>Target</th>
                                      <th>Num</th>
                                      <th>Denum</th>
                                      <th>Capaian</th>
                                      <th>Hasil</th>
                                    </tr>
                                  </thead>
                                  <tbody class="text-center font-sm">
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
                                          <i :class="isTercapai(m, detailData.indicator) ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                                          {{ isTercapai(m, detailData.indicator) ? 'Tercapai' : 'Gagal' }}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                          <div class="col-xl-5">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                              <div class="card-header bg-primary py-3 border-0">
                                <h6 class="mb-0 fw-bold text-white"><i class="fas fa-chart-line me-2"></i>Tren Capaian</h6>
                              </div>
                              <div class="card-body p-2">
                                <apexchart 
                                  v-if="chartSeries.length > 0"
                                  ref="chartRef"
                                  width="100%" 
                                  height="280" 
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
                  </div>
                </td>
              </tr>
            </template>
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

    <!-- Hidden Chart for Batch Export -->
    <div style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;">
        <apexchart 
            v-if="printChartData"
            ref="printChartRef"
            :options="printChartOptions"
            :series="printChartData.series"
            width="600"
            height="300"
        />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import VueApexCharts from 'vue3-apexcharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const apexchart = VueApexCharts

const items = ref([])
const units = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const periodeInfo = ref(null)

// Detail View State (Refactored for Expandable Rows)
const expandedRowId = ref(null)
const detailLoading = ref(false)
const detailData = ref(null)
const chartRef = ref(null)

// Batch Printing State
const printChartRef = ref(null)
const printChartData = ref(null)
const printingProgress = ref(0)
const showExportDropdown = ref(false)
const exportDropdownRef = ref(null)

const toggleExportDropdown = () => {
    showExportDropdown.value = !showExportDropdown.value
}

const handleExportRekap = () => {
    showExportDropdown.value = false
    exportRekapToPDF()
}

const handleExportFull = () => {
    showExportDropdown.value = false
    exportFullReportToPDF()
}

const handleClickOutside = (event) => {
    if (exportDropdownRef.value && !exportDropdownRef.value.contains(event.target)) {
        showExportDropdown.value = false
    }
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const printChartOptions = {
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5 },
    xaxis: { categories: monthNames },
    yaxis: { min: 0, max: 100 },
    colors: ['#435ebe']
}
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

// Watch filters to refresh data
watch(() => filters.tipe, (newVal) => {
    filters.periode = 1
    fetchData()
})

// Watch filters complex to refresh detail if open
watch(() => [filters.tahun, filters.tipe, filters.periode, filters.unit, filters.jenis], () => {
    if (expandedRowId.value) {
        // Find the item in the current items list
        const item = items.value.find(i => i.id_inmut === expandedRowId.value);
        if (item) {
            fetchDetail(item, true); // force reload
        } else {
            // If item is no longer in the list after filter change, close it
            closeDetail();
        }
    }
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

const fetchDetail = async (item, force = false) => {
    // Toggle off if clicking the same item (unless forced)
    if (!force && expandedRowId.value === item.id_inmut) {
        expandedRowId.value = null
        detailData.value = null
        return
    }

    detailLoading.value = true
    expandedRowId.value = item.id_inmut
    // Only clear if not forced (to keep previous data visible while loading new data if desirable)
    // but clearing is cleaner for "reload" feel
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
        if (!force) expandedRowId.value = null
    } finally {
        detailLoading.value = false
    }
}

const closeDetail = () => {
    expandedRowId.value = null
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
    window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
})

const exportDetailToPDF = async (data) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const indicator = data.indicator;
    const monthly = data.monthly;
    
    // Header
    doc.setFillColor(67, 94, 190); // Primary color #435ebe
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN CAPAIAN INDIKATOR MUTU', 105, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RSIA AISYIYAH PEKAJANGAN', 105, 25, { align: 'center' });
    doc.text('Sistem Monitoring Indikator Mutu Digital', 105, 30, { align: 'center' });
    
    // Content Info
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(indicator.nama_inmut_utama || indicator.nama_inmut, 15, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Unit / Ruang: ${indicator.nama_ruang || '-'}`, 15, 62);
    doc.text(`Periode: ${filters.tipe.toUpperCase()} ${filters.periode} - ${filters.tahun}`, 15, 67);
    
    // Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 75, 180, 25, 2, 2, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Target / Standar:', 25, 85);
    doc.text(getStandar(indicator), 65, 85);
    
    const overallScore = indicator.score || 0;
    doc.text('Total Capaian:', 25, 92);
    doc.setTextColor(isTercapai(indicator) ? 21 : 220, isTercapai(indicator) ? 128 : 53, isTercapai(indicator) ? 61 : 69);
    doc.text(`${overallScore}%`, 65, 92);
    doc.text(`(${isTercapai(indicator) ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 85, 92);
    
    doc.setTextColor(33, 37, 41);
    
    // Chart
    // In Vue 3, ref inside v-for results in an array
    const chartInstance = Array.isArray(chartRef.value) ? chartRef.value[0] : chartRef.value;
    
    if (chartInstance) {
        try {
            const chartDataURI = await chartInstance.dataURI();
            if (chartDataURI && chartDataURI.imgURI) {
                doc.setFont('helvetica', 'bold');
                doc.text('Grafik Tren Capaian Bulanan:', 15, 115);
                doc.addImage(chartDataURI.imgURI, 'PNG', 15, 120, 180, 80);
            }
        } catch (e) {
            console.error('Chart export failed', e);
        }
    }
    
    // Table
    const tableHead = [['Bulan', 'Numerator', 'Denominator', 'Capaian (%)', 'Status']];
    const tableBody = monthly.map(m => [
        `${getMonthName(m.bulan)} ${m.tahun}`,
        m.total_num,
        m.total_denum,
        `${m.score}%`,
        isTercapai(m, indicator) ? 'Tercapai' : 'Gagal'
    ]);
    
    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: chartInstance ? 210 : 120,
        theme: 'grid',
        headStyles: { fillColor: [67, 94, 190], halign: 'center' },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center', fontStyle: 'bold' },
            4: { halign: 'center' }
        },
        didParseCell: function(data) {
            if (data.column.index === 4 && data.cell.section === 'body') {
                if (data.cell.text[0] === 'Tercapai') {
                    data.cell.styles.textColor = [21, 128, 61];
                } else {
                    data.cell.styles.textColor = [220, 53, 69];
                }
            }
        }
    });
    
    // Footer - Page Number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 200, 285, { align: 'right' });
    }
    
    doc.save(`Laporan_Indikator_${indicator.nama_inmut.replace(/\s+/g, '_')}_${filters.tahun}.pdf`);
}

const exportRekapToPDF = async () => {
    loading.value = true;
    let allItems = [];
    try {
        const params = {
            page: 1,
            limit: 1000,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        allItems = response.data.data.data
    } catch (error) {
        console.error('Failed to fetch all data for PDF', error);
        allItems = items.value; // fallback to current page
    } finally {
        loading.value = false;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header
    doc.setFillColor(67, 94, 190);
    doc.rect(0, 0, 297, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAPITULASI CAPAIAN INDIKATOR MUTU', 148, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const unitText = filters.unit ? units.value.find(u => u.dep_id === filters.unit)?.nama_ruang : 'Seluruh Unit';
    doc.text(`Unit: ${unitText} | Periode: ${filters.tipe.toUpperCase()} ${filters.periode} Tahun ${filters.tahun}`, 148, 22, { align: 'center' });
    doc.text('RSIA AISYIYAH PEKAJANGAN', 148, 27, { align: 'center' });
    
    const tableHead = [['#', 'Indikator', 'Unit/Ruang', 'Target', 'Num', 'Denum', 'Capaian (%)', 'Status']];
    const tableBody = allItems.map((item, index) => [
        index + 1,
        item.nama_inmut,
        item.nama_ruang,
        getStandar(item),
        item.total_num,
        item.total_denum,
        `${item.score}%`,
        isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai'
    ]);
    
    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [67, 94, 190], halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 80 },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center', fontStyle: 'bold' },
            7: { halign: 'center' }
        },
        didParseCell: function(data) {
             if (data.column.index === 7 && data.cell.section === 'body') {
                if (data.cell.text[0] === 'Tercapai') {
                    data.cell.styles.textColor = [21, 128, 61];
                } else {
                    data.cell.styles.textColor = [220, 53, 69];
                }
            }
        }
    });
    
    doc.save(`Rekap_Mutu_${filters.tahun}_${filters.tipe}_${filters.periode}.pdf`);
}

const exportFullReportToPDF = async () => {
    loading.value = true;
    printingProgress.value = 1;
    
    try {
        // 1. Fetch ALL Indicators
        const params = {
            page: 1,
            limit: 1000,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        const allItems = response.data.data.data
        
        if (allItems.length === 0) {
            toast.warning('Tidak ada data untuk diekspor');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const totalItems = allItems.length;

        for (let i = 0; i < totalItems; i++) {
            const item = allItems[i];
            printingProgress.value = Math.round(((i) / totalItems) * 100);
            
            // 2. Fetch Detail for this indicator
            const detailRes = await api.getLaporanDetail({
                id_inmut: item.id_inmut,
                tahun: filters.tahun,
                tipe: filters.tipe,
                periode: filters.periode
            });
            const monthly = detailRes.data.data.monthly;

            // 3. Render Chart to Hidden Component
            printChartData.value = {
                series: [{
                    name: 'Capaian',
                    data: monthly.map(m => m.score)
                }]
            };
            
            // Wait for Vue to render and ApexCharts to be ready
            await new Promise(resolve => setTimeout(resolve, 600));
            
            let chartImg = null;
            if (printChartRef.value) {
                const uri = await printChartRef.value.dataURI();
                chartImg = uri.imgURI;
            }

            // 4. Build PDF Page
            if (i > 0) doc.addPage();
            
            // Page Header (Simple version for all-in-one)
            doc.setFillColor(67, 94, 190);
            doc.rect(0, 0, 210, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14); doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN INDIKATOR MUTU', 105, 12, { align: 'center' });
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(`Periode: ${filters.tipe.toUpperCase()} ${filters.periode} - ${filters.tahun} | RSIA AISYIYAH PEKAJANGAN`, 105, 18, { align: 'center' });

            // Content
            doc.setTextColor(33, 37, 41);
            doc.setFontSize(11); doc.setFont('helvetica', 'bold');
            doc.text(`${i+1}. ${item.nama_inmut}`, 15, 40, { maxWidth: 180 });
            
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text(`Unit: ${item.nama_ruang || '-'}`, 15, 50);
            
            // Summary Box
            doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
            doc.roundedRect(15, 55, 180, 20, 2, 2, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.text('Target:', 20, 65); doc.text(getStandar(item), 45, 65);
            doc.text('Capaian:', 100, 65); 
            doc.setTextColor(isTercapai(item) ? 21 : 220, isTercapai(item) ? 128 : 53, isTercapai(item) ? 61 : 69);
            doc.text(`${item.score}% (${isTercapai(item) ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 118, 65);
            doc.setTextColor(33, 37, 41);

            // Chart Image
            if (chartImg) {
                doc.addImage(chartImg, 'PNG', 15, 80, 180, 75);
            }

            // Table
            const tableHead = [['Bulan', 'Num', 'Denum', 'Score', 'Status']];
            const tableBody = monthly.map(m => [
                getMonthName(m.bulan), m.total_num, m.total_denum, `${m.score}%`,
                isTercapai(m, item) ? 'Tercapai' : 'Gagal'
            ]);

            autoTable(doc, {
                head: tableHead,
                body: tableBody,
                startY: 160,
                theme: 'grid',
                headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
                styles: { fontSize: 8 },
                didParseCell: function(data) {
                    if (data.column.index === 4 && data.cell.section === 'body') {
                        data.cell.styles.textColor = data.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                    }
                }
            });
        }

        printingProgress.value = 100;
        doc.save(`Laporan_Lengkap_Mutu_${filters.tahun}_${filters.tipe}.pdf`);
        toast.success('Laporan lengkap berhasil dibuat');
    } catch (error) {
        console.error('Full report export failed', error);
        toast.error('Gagal membuat laporan lengkap');
    } finally {
        loading.value = false;
        setTimeout(() => { printingProgress.value = 0; }, 2000);
    }
}
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
/* Expansion Transition */
.expandable-content-wrapper {
  max-height: 0;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

tr.table-active + tr .expandable-content-wrapper {
  max-height: 1200px; /* Large enough to fit content */
}

.detail-container {
  background-color: #f8fafc;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 3px solid #435ebe;
}

/* Detail UI Components */
.btn-detail-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
  padding: 6px 16px;
  border-radius: 50rem;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-detail-toggle:hover {
  border-color: #435ebe;
  color: #435ebe;
  transform: translateY(-1px);
}

.btn-detail-toggle.active {
  background: #435ebe;
  border-color: #435ebe;
  color: white;
  box-shadow: 0 4px 10px rgba(67, 94, 190, 0.25);
}

.transition-transform {
  transition: transform 0.3s ease;
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.detail-header-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.detail-icon-box {
  width: 40px;
  height: 40px;
  background: rgba(67, 94, 190, 0.1);
  color: #435ebe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.82rem;
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
}

.target-card-mini {
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 10px;
}

.target-value {
  font-weight: 800;
  color: #435ebe;
}

.bg-gray-50 {
  background-color: #f8fafc;
}

.text-xs { font-size: 0.7rem; }
.font-sm { font-size: 0.85rem; }
.fw-800 { font-weight: 800; }

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media print {
  .expandable-content-wrapper { max-height: none !important; }
  .btn-detail-toggle, .filter-card, .card-footer { display: none !important; }
}

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
