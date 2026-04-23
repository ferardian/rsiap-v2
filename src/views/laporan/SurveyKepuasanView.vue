<template>
  <div class="survey-report-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title mb-0">
            <i class="fas fa-star me-2 text-warning"></i>
            Analisis Survey Kepuasan Pasien
          </h2>
          <p class="page-subtitle mb-0 text-white-50">Monitoring tingkat kepuasan layanan anjungan mandiri</p>
        </div>
        
        <div class="header-filters-wrapper">
          <div class="filter-item">
            <label class="filter-label">PERIODE</label>
            <div class="date-input-group">
              <input type="date" v-model="filters.tgl_awal" class="form-input" />
              <span class="text-white-50 px-2">s/d</span>
              <input type="date" v-model="filters.tgl_akhir" class="form-input" />
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">TIPE PASIEN</label>
            <select v-model="filters.tipe" class="form-select-premium">
              <option value="all">Semua Tipe</option>
              <option value="bpjs">BPJS</option>
              <option value="umum">Umum</option>
            </select>
          </div>

          <div class="filter-item action-buttons">
            <button @click="loadAllData" class="btn-refresh-premium" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Update
            </button>
            <div class="dropdown">
              <button class="btn-export-premium dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-download me-1"></i> Export
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4">
                <li><a @click.prevent="exportToExcel" class="dropdown-item py-2" href="#"><i class="fas fa-file-excel text-success me-2"></i> Excel (.xlsx)</a></li>
                <li><a @click.prevent="exportToPDF" class="dropdown-item py-2" href="#"><i class="fas fa-file-pdf text-danger me-2"></i> PDF (.pdf)</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card premium green h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ summary.bpjs.total + summary.umum.total }}</h3>
              <p class="mb-0 opacity-75">Total Responden</p>
            </div>
          </div>
          <div class="stat-footer mt-auto">
            <span class="badge bg-white-20">{{ summary.bpjs.total }} BPJS</span>
            <span class="badge bg-white-20 ms-1">{{ summary.umum.total }} UMUM</span>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card premium purple h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ overallRating.toFixed(2) }} <small class="fs-6 opacity-75">/ 5</small></h3>
              <p class="mb-0 opacity-75">Rata-rata Rating</p>
            </div>
          </div>
          <div class="stat-footer mt-auto">
            <div class="rating-stars">
              <i v-for="i in 5" :key="i" class="fas fa-star" :class="i <= Math.round(overallRating) ? 'text-warning' : 'text-white-30'"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card premium blue h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-heart"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ recommendationRate }}%</h3>
              <p class="mb-0 opacity-75">Rekomendasi Layanan</p>
            </div>
          </div>
          <div class="stat-footer mt-auto">
            <div class="progress bg-white-20" style="height: 6px;">
              <div class="progress-bar bg-white" :style="{ width: recommendationRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card premium orange h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-comments"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ ulasanCount }}</h3>
              <p class="mb-0 opacity-75">Komentar & Saran</p>
            </div>
          </div>
          <div class="stat-footer mt-auto text-white-50 small">
            Dari total partisipan
          </div>
        </div>
      </div>
    </div>

    <!-- Main Charts Section -->
    <div class="row g-4 mb-4">
      <!-- Radar Analysis -->
      <div class="col-lg-6">
        <div class="content-card h-100 shadow-sm border-0">
          <div class="card-header-modern bg-white border-0 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold"><i class="fas fa-chart-radar me-2 text-primary"></i>Analisis Kekuatan Layanan</h5>
            <div class="btn-group btn-group-sm shadow-sm">
              <button @click="activeChartTab = 'bpjs'" :class="['btn', activeChartTab === 'bpjs' ? 'btn-success' : 'btn-outline-success']">BPJS</button>
              <button @click="activeChartTab = 'umum'" :class="['btn', activeChartTab === 'umum' ? 'btn-primary' : 'btn-outline-primary']">UMUM</button>
            </div>
          </div>
          <div class="card-body-modern p-0">
            <div v-show="loading" class="chart-loader">
              <div class="spinner-grow text-primary" role="status"></div>
            </div>
            <div v-show="!loading" class="radar-container p-2">
              <apexchart v-if="summary.bpjs.total || summary.umum.total" type="radar" height="380" :options="radarOptions" :series="radarSeries"></apexchart>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div class="col-lg-6">
        <div class="content-card h-100 shadow-sm border-0">
          <div class="card-header-modern bg-white border-0">
            <h5 class="mb-0 fw-bold"><i class="fas fa-chart-line me-2 text-success"></i>Tren Partisipasi Harian</h5>
          </div>
          <div class="card-body-modern pt-0">
            <div v-show="loading" class="chart-loader">
              <div class="spinner-grow text-success" role="status"></div>
            </div>
            <div v-show="!loading">
              <apexchart v-if="trend.bpjs.length || trend.umum.length" type="area" height="350" :options="trendOptions" :series="trendSeries"></apexchart>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Ticker & Details -->
    <div class="row g-4">
      <!-- Recent Reviews -->
      <div class="col-lg-4">
        <div class="content-card h-100 shadow-sm border-0">
          <div class="card-header-modern bg-white border-0">
            <h5 class="mb-0 fw-bold"><i class="fas fa-comments me-2 text-info"></i>Ulasan Terbaru</h5>
          </div>
          <div class="card-body-modern p-0 scroll-container" style="max-height: 500px; overflow-y: auto;">
             <div v-if="details.length === 0" class="text-center py-5 text-muted">
                <i class="fas fa-inbox fa-3x mb-3 opacity-20"></i>
                <p>Belum ada ulasan</p>
             </div>
             <div v-else class="review-list">
                <div v-for="review in filteredReviews" :key="review.no_rawat" class="review-card p-3 mb-3 mx-3">
                   <div class="d-flex justify-content-between align-items-center mb-2">
                      <span :class="['badge-type', review.tipe_pasien === 'BPJS' ? 'bpjs' : 'umum']">
                         {{ review.tipe_pasien }}
                      </span>
                      <span class="review-date">{{ formatDate(review.tgl_survey) }}</span>
                   </div>
                   <div class="quote-wrapper">
                      <i class="fas fa-quote-left opacity-20 me-2"></i>
                      <span class="review-text">"{{ review.ulasan }}"</span>
                   </div>
                   <div class="reviewer-info mt-3 d-flex align-items-center">
                      <div class="avatar-circle">
                         {{ (review.nm_pasien || 'P').charAt(0) }}
                      </div>
                      <div class="ms-2">
                         <div class="reviewer-name">{{ review.nm_pasien || review.no_rawat }}</div>
                         <div class="reviewer-sub">{{ review.is_anonim === 'true' ? 'Identitas Dirahasiakan' : 'Pasien Terverifikasi' }}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Detail Table -->
      <div class="col-lg-8">
        <div class="content-card h-100 shadow-sm border-0">
          <div class="card-header-modern bg-white border-0 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold"><i class="fas fa-list me-2 text-secondary"></i>Data Detail Survey</h5>
            <div class="search-box">
               <input type="text" v-model="search" placeholder="Cari pasien/ulasan..." class="form-control form-control-sm rounded-pill" />
            </div>
          </div>
          <div class="card-body-modern p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="bg-light">
                  <tr>
                    <th>Tgl Survey</th>
                    <th>Nama Pasien</th>
                    <th>Tipe</th>
                    <th>Ulasan</th>
                    <th class="text-center">Anonim</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pagedData" :key="item.no_rawat">
                    <td class="text-nowrap">{{ formatDate(item.tgl_survey) }}</td>
                    <td>
                       <div class="font-600">{{ item.nm_pasien || '-' }}</div>
                       <div class="d-flex flex-column">
                          <small class="text-primary font-600">RM: {{ item.no_rkm_medis || '-' }} | Rawat: {{ item.no_rawat }}</small>
                          <small v-if="item.tipe_pasien === 'BPJS' && item.no_peserta" class="text-success font-600">
                             BPJS: {{ item.no_peserta }}
                          </small>
                       </div>
                    </td>
                    <td>
                      <span :class="['badge-type-sm', item.tipe_pasien === 'BPJS' ? 'bpjs' : 'umum']">
                        {{ item.tipe_pasien }}
                      </span>
                    </td>
                    <td>
                       <div class="text-truncate" style="max-width: 300px;" :title="item.ulasan">
                          {{ item.ulasan || '-' }}
                       </div>
                    </td>
                    <td class="text-center">
                       <i :class="item.is_anonim === 'true' ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'"></i>
                    </td>
                  </tr>
                  <tr v-if="filteredData.length === 0">
                    <td colspan="5" class="text-center py-5">Tidak ada data ditemukan</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { surveyReportService } from '@/services/laporan/surveyReportService'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const apexchart = VueApexCharts
const loading = ref(false)
const activeChartTab = ref('bpjs')
const search = ref('')
const summary = ref({
  bpjs: { total: 0 },
  umum: { total: 0 }
})
const details = ref([])
const trend = ref({
  bpjs: [],
  umum: []
})

const filters = reactive({
  tgl_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA'),
  tgl_akhir: new Date().toLocaleDateString('en-CA'),
  tipe: 'all'
})

const loadAllData = async () => {
  loading.value = true
  try {
    const [resSummary, resDetails] = await Promise.all([
      surveyReportService.getSummary(filters),
      surveyReportService.getDetails(filters)
    ])
    
    summary.value = resSummary.data.data
    details.value = resDetails.data.data
    trend.value = resSummary.data.data.trend
  } catch (error) {
    console.error('Error loading survey data:', error)
  } finally {
    loading.value = false
  }
}

const overallRating = computed(() => {
  const b = summary.value.bpjs
  const u = summary.value.umum
  
  const bpjsFields = [b.avg_fasilitas, b.avg_petugas_ramah, b.avg_dokter_komunikasi, b.avg_petugas_sigap, b.avg_biaya_transparansi, b.avg_kesetaraan_layanan]
  const vBpjs = bpjsFields.filter(v => v !== null && v !== undefined)
  const b_avg = vBpjs.length ? vBpjs.reduce((acc, curr) => acc + parseFloat(curr), 0) / vBpjs.length : 0
  
  const umumFields = [u.avg_masuk_keluar, u.avg_administrasi, u.avg_kecepatan, u.avg_kompetensi, u.avg_keramahan, u.avg_sarana, u.avg_pengaduan, u.avg_tarif, u.avg_makan]
  const vUmum = umumFields.filter(v => v !== null && v !== undefined)
  const u_avg = vUmum.length ? vUmum.reduce((acc, curr) => acc + parseFloat(curr), 0) / vUmum.length : 0

  const total = b.total + u.total
  if (total === 0) return 0
  
  return ((b_avg * b.total) + (u_avg * u.total)) / total
})

const recommendationRate = computed(() => {
  const u = summary.value.umum
  if (!u.total || u.total === 0) return 0
  return Math.round((parseInt(u.total_ya || 0) / u.total) * 100)
})

const ulasanCount = computed(() => details.value.filter(d => d.ulasan).length)

const filteredReviews = computed(() => details.value.filter(d => d.ulasan).slice(0, 10))

const filteredData = computed(() => {
  if (!search.value) return details.value
  const s = search.value.toLowerCase()
  return details.value.filter(d => 
    (d.nm_pasien && d.nm_pasien.toLowerCase().includes(s)) || 
    (d.ulasan && d.ulasan.toLowerCase().includes(s)) ||
    (d.no_rawat && d.no_rawat.toLowerCase().includes(s))
  )
})

const pagedData = computed(() => filteredData.value.slice(0, 50))

const radarOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: activeChartTab.value === 'bpjs' 
      ? ['Fasilitas', 'Petugas Ramah', 'Komunikasi Dokter', 'Petugas Sigap', 'Biaya Transparansi', 'Kesetaraan Layanan']
      : ['Masuk/Keluar', 'Administrasi', 'Kecepatan', 'Kompetensi', 'Kesopanan', 'Sarana Prasarana', 'Pengaduan', 'Tarif', 'Makan']
  },
  colors: [activeChartTab.value === 'bpjs' ? '#10b981' : '#3b82f6'],
  fill: { opacity: 0.4 },
  markers: { size: 4 },
  yaxis: { min: 0, max: 5, tickAmount: 5 }
}))

const radarSeries = computed(() => {
  const data = activeChartTab.value === 'bpjs' ? summary.value.bpjs : summary.value.umum
  const values = activeChartTab.value === 'bpjs'
    ? [data.avg_fasilitas, data.avg_petugas_ramah, data.avg_dokter_komunikasi, data.avg_petugas_sigap, data.avg_biaya_transparansi, data.avg_kesetaraan_layanan]
    : [data.avg_masuk_keluar, data.avg_administrasi, data.avg_kecepatan, data.avg_kompetensi, data.avg_keramahan, data.avg_sarana, data.avg_pengaduan, data.avg_tarif, data.avg_makan]
  
  return [{
    name: 'Skor Rata-rata',
    data: values.map(v => parseFloat(v || 0).toFixed(2))
  }]
})

const trendOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  colors: ['#10b981', '#3b82f6'],
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
  xaxis: { 
    type: 'datetime',
    labels: { format: 'dd MMM' }
  },
  yaxis: { title: { text: 'Jumlah Partisipan' } },
  dataLabels: { enabled: false },
  tooltip: { x: { format: 'dd MMM yyyy' } }
}))

const trendSeries = computed(() => [
  {
    name: 'Pasien BPJS',
    data: trend.value.bpjs.map(t => [new Date(t.date).getTime(), t.count])
  },
  {
    name: 'Pasien UMUM',
    data: trend.value.umum.map(t => [new Date(t.date).getTime(), t.count])
  }
])

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const exportToExcel = () => {
  const data = details.value.map(item => {
    let score = 0
    if (item.tipe_pasien === 'BPJS') {
      const fields = [item.poin_fasilitas, item.poin_petugas_ramah, item.poin_dokter_komunikasi, item.poin_petugas_sigap, item.poin_biaya_transparansi, item.poin_kesetaraan_layanan]
      score = fields.reduce((a, b) => a + parseInt(b || 0), 0) / 6
    } else {
      const fields = [item.poin_proses_masuk_keluar, item.poin_kemudahan_administrasi, item.poin_kecepatan_pelayanan, item.poin_kompetensi_petugas, item.poin_kesopanan_keramahan, item.poin_sarana_prasarana, item.poin_penanganan_pengaduan, item.poin_biaya_tarif, item.poin_layanan_makan]
      const valid = fields.filter(v => v !== null && v !== undefined)
      score = valid.length ? valid.reduce((a, b) => a + parseInt(b || 0), 0) / valid.length : 0
    }

    return {
      'Tgl Survey': item.tgl_survey,
      'Nama Pasien': item.nm_pasien || '-',
      'No. RM': item.no_rkm_medis || '-',
      'No. Rawat': item.no_rawat,
      'Tipe': item.tipe_pasien,
      'Rata-rata Skor': score.toFixed(2),
      'No. Peserta': item.no_peserta || '-',
      'Ulasan': item.ulasan || '-'
    }
  })
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Survey Details")
  XLSX.writeFile(wb, `Survey_Kepuasan_${filters.tgl_awal}_to_${filters.tgl_akhir}.xlsx`)
}

const exportToPDF = () => {
  const doc = new jsPDF('l', 'mm', 'a4')
  doc.setFontSize(16)
  doc.text('Laporan Survey Kepuasan Pasien', 14, 15)
  doc.setFontSize(10)
  doc.text(`Periode: ${formatDate(filters.tgl_awal)} s/d ${formatDate(filters.tgl_akhir)}`, 14, 22)
  doc.text(`Tipe Pasien: ${filters.tipe.toUpperCase()}`, 14, 27)

  const head = [['Tgl Survey', 'Nama Pasien', 'No. RM / No. Rawat', 'Tipe', 'Skor', 'Ulasan']]
  const body = details.value.map(item => {
    let score = 0
    if (item.tipe_pasien === 'BPJS') {
      const fields = [item.poin_fasilitas, item.poin_petugas_ramah, item.poin_dokter_komunikasi, item.poin_petugas_sigap, item.poin_biaya_transparansi, item.poin_kesetaraan_layanan]
      score = fields.reduce((a, b) => a + parseInt(b || 0), 0) / 6
    } else {
      const fields = [item.poin_proses_masuk_keluar, item.poin_kemudahan_administrasi, item.poin_kecepatan_pelayanan, item.poin_kompetensi_petugas, item.poin_kesopanan_keramahan, item.poin_sarana_prasarana, item.poin_penanganan_pengaduan, item.poin_biaya_tarif, item.poin_layanan_makan]
      const valid = fields.filter(v => v !== null && v !== undefined)
      score = valid.length ? valid.reduce((a, b) => a + parseInt(b || 0), 0) / valid.length : 0
    }

    return [
      formatDate(item.tgl_survey),
      item.nm_pasien || '-',
      `${item.no_rkm_medis || '-'} / ${item.no_rawat}`,
      item.tipe_pasien,
      `${score.toFixed(1)}/5`,
      item.ulasan || '-'
    ]
  })

  autoTable(doc, {
    head: head,
    body: body,
    startY: 32,
    theme: 'grid',
    headStyles: { fillColor: [0, 114, 255] },
    columnStyles: {
      4: { halign: 'center', fontStyle: 'bold' }
    }
  })

  doc.save(`Survey_Kepuasan_${filters.tgl_awal}_to_${filters.tgl_akhir}.pdf`)
}

onMounted(() => loadAllData())
</script>

<style scoped>
.survey-report-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #0072ff 0%, #00c6ff 100%);
  padding: 2.5rem;
  border-radius: 24px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 114, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-filters-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-buttons {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-card {
  border-radius: 20px;
  padding: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-footer {
  width: 100%;
}

.date-input-group {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.date-input-group input {
  background: transparent;
  border: none;
  color: white;
  font-weight: 600;
  outline: none;
}

.form-select-premium {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
}

.form-select-premium option {
  color: #334155;
}

.btn-export-premium {
  background: #ffffff;
  color: #334155;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.3s;
}

.btn-export-premium:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.btn-refresh-premium {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.3s;
}

.btn-refresh-premium:hover {
  background: #6d28d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

/* Premium Stat Cards */
.stat-card.premium {
  padding: 1.5rem;
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.stat-card.premium:hover { transform: translateY(-5px); }
.stat-card.purple { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); }
.stat-card.blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.stat-card.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.stat-card.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.stat-icon-wrapper {
  position: absolute;
  right: -15px;
  top: -15px;
  font-size: 4.5rem;
  opacity: 0.2;
  transform: rotate(15deg);
}

.stat-footer {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.bg-white-20 { background: rgba(255, 255, 255, 0.2); }
.text-white-30 { color: rgba(255, 255, 255, 0.3); }

.content-card {
  background: white;
  border-radius: 20px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
  overflow: hidden;
  transition: transform 0.3s;
}

.card-header-modern {
  padding: 1.5rem;
  background: #fff;
}

/* Review Cards */
.review-card {
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.badge-type {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
}

.badge-type.bpjs { background: #dcfce7; color: #15803d; }
.badge-type.umum { background: #e0f2fe; color: #0369a1; }

.review-date { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

.review-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  font-style: italic;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  background: #7c3aed;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.reviewer-name { font-size: 0.9rem; font-weight: 700; color: #334155; }
.reviewer-sub { font-size: 0.75rem; color: #64748b; }

.badge-type-sm {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
}

.badge-type-sm.bpjs { background: #dcfce7; color: #15803d; }
.badge-type-sm.umum { background: #e0f2fe; color: #0369a1; }

.chart-loader {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-600 { font-weight: 600; }
.font-500 { font-weight: 500; }
.text-sm { font-size: 0.875rem; }
.fs-7 { font-size: 0.75rem; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
