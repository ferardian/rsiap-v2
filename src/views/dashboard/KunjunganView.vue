<template>
  <div class="visit-dashboard">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <h1 class="page-title mb-0">
                 <i class="fas fa-chart-line mr-2"></i>
                 Dashboard Kunjungan
            </h1>
            <div class="header-buttons">
              <button @click="fetchData" class="btn-refresh" :disabled="loading" title="Refresh Data">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              </button>
              <button @click="isFilterVisible = !isFilterVisible" class="btn-toggle-filter d-md-none">
                <i class="fas" :class="isFilterVisible ? 'fa-chevron-up' : 'fa-filter'"></i>
              </button>
            </div>
          </div>
          <p class="page-subtitle mb-0">Analisis data kunjungan pasien Rawat Jalan & Rawat Inap</p>
        </div>
        <transition name="collapse">
          <div v-show="isFilterVisible || !isMobile" class="header-actions">
          <div class="filter-group">
            <!-- Mode Selector -->
            <div class="filter-item">
              <label>Mode Periode</label>
              <div class="mode-selector">
                <button 
                  @click="filters.mode = 'harian'; fetchData()" 
                  :class="['mode-btn', { active: filters.mode === 'harian' }]"
                >
                  <i class="fas fa-calendar-day"></i> Harian
                </button>
                <button 
                  @click="filters.mode = 'tahunan'; fetchData()" 
                  :class="['mode-btn', { active: filters.mode === 'tahunan' }]"
                >
                  <i class="fas fa-calendar-alt"></i> Tahunan
                </button>
              </div>
            </div>

            <!-- Date Range (Harian Mode) -->
            <div v-if="filters.mode === 'harian'" class="filter-item">
              <label>Periode</label>
              <div class="date-inputs">
                <input type="date" v-model="filters.tgl_awal" @change="fetchData" class="form-input">
                <span class="separator">sampai</span>
                <input type="date" v-model="filters.tgl_akhir" @change="fetchData" class="form-input">
              </div>
            </div>

            <!-- Year Selector (Tahunan Mode) -->
            <div v-if="filters.mode === 'tahunan'" class="filter-item">
              <label>Tahun</label>
              <select v-model="filters.tahun" @change="fetchData" class="form-select">
                <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>

            <div class="filter-item">
              <label>Jenis Layanan</label>
              <select v-model="filters.status_lanjut" @change="fetchData" class="form-select">
                <option value="all">Semua Layanan</option>
                <option value="Ralan">Rawat Jalan</option>
                <option value="Ranap">Rawat Inap</option>
              </select>
            </div>

            <!-- Poliklinik Filter -->
            <div class="filter-item poli-filter">
              <label>Poliklinik / Unit</label>
              <SearchableSelect
                v-model="filters.kd_poli"
                :options="poliklinikOptions"
                labelKey="nm_poli"
                valueKey="kd_poli"
                placeholder="Semua Poliklinik"
                @change="fetchData"
              />
            </div>
          </div>
        </div>
      </transition>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
      <p>Memuat data statistik...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
               <i class="fas fa-hospital-user"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Kunjungan</span>
            <h3 class="stat-value">{{ summary.total }}</h3>
          </div>
        </div>
        <div class="stat-card new">
          <div class="stat-icon">
               <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Pasien Baru</span>
            <h3 class="stat-value">{{ summary.baru }} <small>({{ getPercentage(summary.baru, summary.total) }}%)</small></h3>
          </div>
        </div>
        <div class="stat-card old">
          <div class="stat-icon">
               <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Pasien Lama</span>
            <h3 class="stat-value">{{ summary.lama }} <small>({{ getPercentage(summary.lama, summary.total) }}%)</small></h3>
          </div>
        </div>
        <div class="stat-card gender">
          <div class="stat-icon">
               <i class="fas fa-users-viewfinder"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Gender (L : P)</span>
            <h3 class="stat-value">{{ summary.pria }} : {{ summary.wanita }}</h3>
          </div>
        </div>
        <div class="stat-card keluar">
          <div class="stat-icon">
               <i class="fas fa-door-open"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Keluar (Hidup + Mati)</span>
            <h3 class="stat-value">{{ summary.keluar_l + summary.keluar_p }} <small>(L:{{ summary.keluar_l }} P:{{ summary.keluar_p }})</small></h3>
          </div>
        </div>
        <div class="stat-card mati">
          <div class="stat-icon">
               <i class="fas fa-skull"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Keluar Meninggal</span>
            <h3 class="stat-value">{{ summary.mati_l + summary.mati_p }} <small>(L:{{ summary.mati_l }} P:{{ summary.mati_p }})</small></h3>
          </div>
        </div>
        <div class="stat-card mati-long">
          <div class="stat-icon">
               <i class="fas fa-hourglass-end"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Meninggal >= 48 Jam</span>
            <h3 class="stat-value">{{ summary.mati_48_l + summary.mati_48_p }} <small>(L:{{ summary.mati_48_l }} P:{{ summary.mati_48_p }})</small></h3>
          </div>
        </div>
        <!-- Inpatient Care Duration Stats (Only for Ranap) -->
        <div v-if="filters.status_lanjut === 'Ranap' && inpatientCare" class="stat-card care-days">
          <div class="stat-icon">
               <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Jumlah Hari Perawatan</span>
            <h3 class="stat-value">{{ inpatientCare.hari_perawatan }} <small>hari</small></h3>
          </div>
        </div>
        <div v-if="filters.status_lanjut === 'Ranap' && inpatientCare" class="stat-card lama-inap">
          <div class="stat-icon">
               <i class="fas fa-bed"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Jumlah Lama Dirawat</span>
            <h3 class="stat-value">{{ inpatientCare.lama_dirawat }} <small>hari</small></h3>
          </div>
        </div>
        <div v-if="filters.status_lanjut === 'Ranap' && inpatientCare" class="stat-card avg-stay">
          <div class="stat-icon">
               <i class="fas fa-history"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Rata-rata Lama Inap (ALOS)</span>
            <h3 class="stat-value">{{ inpatientCare.avg_lama_dirawat }} <small>hari/pasien</small></h3>
          </div>
        </div>
      </div>

        <!-- Trends & Charts Section -->
        <div class="visuals-grid mb-4">
          <!-- Daily/Monthly Trend Chart -->
          <div class="visual-card full-width">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="card-title mb-0">Tren Kunjungan {{ filters.mode === 'tahunan' ? 'Bulanan' : 'Harian' }}</h4>
              <div v-if="visitData.trend" class="trend-badge" :class="visitData.trend.percent >= 0 ? 'up' : 'down'">
                 <i class="fas" :class="visitData.trend.percent >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'"></i>
                 {{ Math.abs(visitData.trend.percent) }}% dibanding {{ visitData.trend.label }}
              </div>
            </div>
            <div class="chart-container" style="position: relative; height:300px;">
              <Line v-if="chartDataReady" :data="lineChartData" :options="lineChartOptions" />
              <div v-else class="chart-placeholder">Menyiapkan grafik...</div>
            </div>
          </div>
          
          <!-- Kategori & Kelas Pasien (Below Trend) -->
          <div v-if="filters.status_lanjut === 'Ranap'" class="visual-card">
            <h4 class="card-title">Kategori Pasien</h4>
            <div class="list-visual">
              <div v-for="item in visitData.kategori" :key="item.label" class="list-item clickable" @click="openDetails(item.label)">
                <div class="item-header">
                  <span class="item-label">{{ item.label }}</span>
                  <div class="d-flex align-items-center">
                    <span class="item-value mr-2">{{ item.total }}</span>
                    <i class="fas fa-chevron-right text-muted small"></i>
                  </div>
                </div>
                <div class="bar-container-mini">
                  <div class="bar-mini bg-warning" :style="{ width: getPercentage(item.total, summary.total) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
  
          <div v-if="filters.status_lanjut === 'Ranap'" class="visual-card">
            <h4 class="card-title">Kelas Perawatan</h4>
            <div class="list-visual">
              <div v-for="item in visitData.kelas" :key="item.label" class="list-item">
                <div class="item-header">
                  <span class="item-label">{{ item.label }}</span>
                  <span class="item-value">{{ item.total }}</span>
                </div>
                <div class="bar-container-mini">
                  <div class="bar-mini bg-success" :style="{ width: getPercentage(item.total, summary.total) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Poli / Unit / Bangsal (Moved here, below Category/Class) -->
          <div class="visual-card full-width mt-2">
            <h4 class="card-title">
              {{ filters.status_lanjut === 'Ranap' ? 'Berdasarkan Bangsal / Kamar' : 'Berdasarkan Unit / Poliklinik' }}
            </h4>
            <div class="poli-grid">
              <template v-if="filters.status_lanjut === 'Ranap'">
                <div v-for="item in visitData.bangsal" :key="item.label" class="poli-item">
                  <span class="poli-name">{{ item.label }}</span>
                  <div class="poli-bar-wrapper">
                      <div class="poli-bar" :style="{ height: getPercentage(item.total, summary.total) + '%' }">
                           <span class="poli-val">{{ item.total }}</span>
                      </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="item in visitData.poli" :key="item.label" class="poli-item">
                  <span class="poli-name">{{ item.label }}</span>
                  <div class="poli-bar-wrapper">
                      <div class="poli-bar" :style="{ height: getPercentage(item.total, summary.total) + '%' }">
                           <span class="poli-val">{{ item.total }}</span>
                      </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="visuals-grid">
          <!-- Left Column -->
          <div class="d-flex flex-column gap-4">
            <!-- Gender & Status Breakdown -->
            <div class="visual-card">
              <h4 class="card-title">Baru vs Lama (Per Gender)</h4>
              <div class="gender-breakdown-container">
                   <div class="breakdown-item">
                        <span class="label">Baru (L)</span>
                        <div class="bar-container">
                             <div class="bar blue" :style="{ width: getPercentage(getData('Baru', 'L'), summary.total) + '%' }"></div>
                             <span class="value">{{ getData('Baru', 'L') }}</span>
                        </div>
                   </div>
                   <div class="breakdown-item">
                        <span class="label">Baru (P)</span>
                        <div class="bar-container">
                             <div class="bar pink" :style="{ width: getPercentage(getData('Baru', 'P'), summary.total) + '%' }"></div>
                             <span class="value">{{ getData('Baru', 'P') }}</span>
                        </div>
                   </div>
                   <div class="breakdown-item mt-4">
                        <span class="label">Lama (L)</span>
                        <div class="bar-container">
                             <div class="bar cyan" :style="{ width: getPercentage(getData('Lama', 'L'), summary.total) + '%' }"></div>
                             <span class="value">{{ getData('Lama', 'L') }}</span>
                        </div>
                   </div>
                   <div class="breakdown-item">
                        <span class="label">Lama (P)</span>
                        <div class="bar-container">
                             <div class="bar purple" :style="{ width: getPercentage(getData('Lama', 'P'), summary.total) + '%' }"></div>
                             <span class="value">{{ getData('Lama', 'P') }}</span>
                        </div>
                   </div>
              </div>
            </div>

            <!-- Age Distribution -->
            <div class="visual-card">
              <h4 class="card-title">Distribusi Usia</h4>
              <div class="chart-container-mini">
                <Bar v-if="chartDataReady" :data="ageChartData" :options="barOptions" />
              </div>
            </div>

            <!-- Cara Bayar -->
            <div class="visual-card">
              <h4 class="card-title">Berdasarkan Cara Bayar</h4>
              <div class="list-visual">
                <div v-for="item in visitData.cara_bayar" :key="item.label" class="list-item">
                  <div class="item-header">
                    <span class="item-label">{{ item.label }}</span>
                    <span class="item-value">{{ item.total }} ({{ getPercentage(item.total, summary.total) }}%)</span>
                  </div>
                  <div class="bar-container-mini">
                    <div class="bar-mini primary" :style="{ width: getPercentage(item.total, summary.total) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="d-flex flex-column gap-4">
            <!-- Domicile / Origin -->
            <div class="visual-card">
              <h4 class="card-title">Top 10 Domisili (Kecamatan)</h4>
              <div class="domisili-list">
                <div v-for="(item, index) in visitData.domisili" :key="item.label" class="list-item mb-3">
                  <div class="item-header">
                    <span class="item-label"><small class="text-muted mr-2">{{ index + 1 }}.</small> {{ item.label }}</span>
                    <span class="item-value fw-bold">{{ item.total }}</span>
                  </div>
                  <div class="bar-container-mini">
                    <div class="bar-mini bg-info" :style="{ width: (item.total / (visitData.domisili[0]?.total || 1) * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cancellation Analysis -->
            <div v-if="visitData.batal && visitData.batal.total > 0" class="visual-card">
              <h4 class="card-title text-danger">Analisis Pembatalan (Total: {{ visitData.batal.total }})</h4>
              <div class="batal-analysis">
                <div v-for="item in visitData.batal.by_poli" :key="item.label" class="list-item">
                  <div class="item-header">
                    <span class="item-label">{{ item.label }}</span>
                    <span class="item-value text-danger">{{ item.total }}</span>
                  </div>
                  <div class="bar-container-mini">
                    <div class="bar-mini bg-danger" :style="{ width: (item.total / visitData.batal.total * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Dokter -->
            <div class="visual-card">
              <h4 class="card-title">10 Dokter Teratas</h4>
              <div class="doctor-list">
                   <div v-for="(item, index) in visitData.dokter" :key="item.label" class="doctor-row">
                        <span class="doc-rank">{{ index + 1 }}</span>
                        <div class="doc-info">
                             <span class="doc-name">{{ item.label }}</span>
                             <div class="doc-bar-container">
                                  <div class="doc-bar" :style="{ width: (item.total / (visitData.dokter[0]?.total || 1) * 100) + '%' }"></div>
                             </div>
                        </div>
                        <span class="doc-count">{{ item.total }}</span>
                   </div>
              </div>
            </div>
          </div>

      </div>

      <!-- Patient Details Modal -->
      <transition name="fade">
        <div v-if="detailModal.show" class="modal-overlay" @click.self="closeDetails">
          <div class="modal-container large">
            <div class="modal-header">
              <div class="header-left">
                <h3 class="modal-title">
                  <i class="fas fa-users-viewfinder mr-2"></i>
                  Detail Pasien: {{ detailModal.category }}
                </h3>
                <p class="modal-subtitle">Periode: {{ filters.mode === 'tahunan' ? filters.tahun : (filters.tgl_awal + ' s/d ' + filters.tgl_akhir) }}</p>
              </div>
              <button @click="closeDetails" class="btn-close-modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body custom-scrollbar">
            <!-- Modal Filters -->
            <div class="modal-filters-container">
              <div class="search-box-modal">
                <i class="fas fa-search"></i>
                <input v-model="detailModal.searchQuery" type="text" placeholder="Cari Nama / No. RM / No. Rawat..." class="modal-search-input">
              </div>
              <div class="filter-controls-modal">
                <select v-if="detailModal.category === 'Perina'" v-model="detailModal.filterType" class="modal-select-mini">
                  <option value="all">Semua Jenis</option>
                  <option value="BBL">BBL</option>
                  <option value="Perawatan">Perawatan</option>
                </select>
                <select v-model="detailModal.filterDoctor" class="modal-select-mini">
                  <option value="all">Semua Dokter</option>
                  <option v-for="doc in uniqueDoctors" :key="doc" :value="doc">{{ doc }}</option>
                </select>
                <select v-if="detailModal.category === 'VK'" v-model="detailModal.filterTindakan" class="modal-select-mini">
                  <option value="all">Semua Tindakan</option>
                  <option value="SC">SC</option>
                  <option value="Kuret">Kuret</option>
                  <option value="Ponek">Ponek</option>
                  <option value="Partus">Partus</option>
                  <option value="-">Tanpa Tindakan</option>
                </select>
              </div>
            </div>

            <div v-if="detailModal.loading" class="modal-loader">
              <div class="loader"></div>
              <p>Mengambil data detail...</p>
            </div>
            <div v-else-if="filteredDetails.length === 0" class="empty-state">
              <i class="fas fa-folder-open mb-3"></i>
              <p>Tidak ada data pasien yang cocok.</p>
            </div>
            <div v-else class="table-responsive">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Pasien</th>
                    <th>No. RM / Rawat</th>
                    <th>Pembiayaan</th>
                    <th>Dokter / Unit</th>
                    <th>Kamar / Bangsal</th>
                    <th v-if="detailModal.category === 'Perina'">Asal Pasien</th>
                    <th v-if="detailModal.category === 'VK'">Tindakan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, index) in filteredDetails" :key="p.no_rawat">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="patient-name">{{ p.nm_pasien }}</div>
                      <div class="small-text-group">
                        <span class="text-muted"><i class="fas fa-calendar-alt me-1"></i>Reg: {{ p.tgl_registrasi }}</span>
                        <span class="text-info ms-2"><i class="fas fa-baby me-1"></i>Lahir: {{ p.tgl_lahir }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="text-primary fw-bold" style="font-size: 0.8rem;">{{ p.no_rkm_medis }}</div>
                      <small class="text-muted" style="font-size: 0.7rem;">{{ p.no_rawat }}</small>
                    </td>
                    <td>
                      <span :style="{
                        backgroundColor: p.pembayaran_kategori === 'BPJS' ? '#4169E1' : '#6c757d',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        width: 'max-content'
                      }">
                        {{ p.png_jawab }}
                      </span>
                    </td>
                    <td>
                      <div class="text-dark" style="font-size: 0.8rem;">{{ p.nm_dokter }}</div>
                      <small class="text-info" style="font-size: 0.7rem;">{{ p.nm_poli }}</small>
                    </td>
                    <td>
                      <div v-if="p.kd_kamar">
                        <div class="text-dark fw-bold" style="font-size: 0.75rem;">{{ p.kd_kamar }}</div>
                        <div class="text-muted" style="font-size: 0.65rem; line-height: 1;">{{ p.nm_bangsal }}</div>
                      </div>
                      <span v-else class="badge-rawat-bersama">Rawat Bersama</span>
                    </td>
                    <td v-if="detailModal.category === 'Perina'">
                      <span :class="['badge', p.asal_pasien === 'BBL' ? 'badge-bbl' : 'badge-perawatan']">
                        {{ p.asal_pasien }}
                      </span>
                    </td>
                    <td v-if="detailModal.category === 'VK'" class="text-center">
                      <div v-if="p.metode_persalinan && p.metode_persalinan !== '-'" :style="{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        backgroundColor: p.metode_persalinan === 'SC' ? '#FFF1F2' : (p.metode_persalinan === 'Kuret' ? '#FFFBEB' : (p.metode_persalinan === 'Ponek' ? '#F5F3FF' : '#F0FDF4')),
                        color: p.metode_persalinan === 'SC' ? '#E11D48' : (p.metode_persalinan === 'Kuret' ? '#B45309' : (p.metode_persalinan === 'Ponek' ? '#7C3AED' : '#16A34A')),
                        border: `1px solid ${p.metode_persalinan === 'SC' ? '#FDA4AF' : (p.metode_persalinan === 'Kuret' ? '#FDE68A' : (p.metode_persalinan === 'Ponek' ? '#DDD6FE' : '#86EFAC'))}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }">
                        {{ p.metode_persalinan }}
                      </div>
                      <span v-else style="color: #cbd5e1; font-weight: bold;">-</span>
                    </td>
                    <td>
                      <span class="badge badge-status">{{ p.status_lanjut }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <div class="text-muted small">Menampilkan {{ filteredDetails.length }} dari {{ detailModal.data.length }} pasien</div>
            <button @click="closeDetails" class="btn-primary-outline">Tutup</button>
          </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dashboardVisitService from '../../services/dashboardVisitService'
import poliklinikService from '../../services/poliklinikService'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const loading = ref(true)
const isFilterVisible = ref(false)
const isMobile = ref(false)
const poliklinikOptions = ref([])
const summary = ref({ 
  total: 0, baru: 0, lama: 0, pria: 0, wanita: 0, 
  keluar_l: 0, keluar_p: 0, mati_l: 0, mati_p: 0,
  mati_48_l: 0, mati_48_p: 0 
})
const visitData = ref({ registrasi: [], cara_bayar: [], poli: [], dokter: [], bangsal: [], kategori: [], kelas: [] })
const inpatientCare = ref(null)

const detailModal = ref({
  show: false,
  loading: false,
  category: '',
  data: [],
  searchQuery: '',
  filterType: 'all',
  filterDoctor: 'all',
  filterTindakan: 'all'
})

const filteredDetails = computed(() => {
  let result = detailModal.value.data

  // Search filter
  if (detailModal.value.searchQuery) {
    const q = detailModal.value.searchQuery.toLowerCase()
    result = result.filter(p => 
      p.nm_pasien.toLowerCase().includes(q) || 
      p.no_rkm_medis.toLowerCase().includes(q) || 
      p.no_rawat.toLowerCase().includes(q)
    )
  }

  // Type filter
  if (detailModal.value.filterType !== 'all') {
    result = result.filter(p => p.asal_pasien === detailModal.value.filterType)
  }

  // Doctor filter
  if (detailModal.value.filterDoctor !== 'all') {
    result = result.filter(p => p.nm_dokter === detailModal.value.filterDoctor)
  }

  // Tindakan filter (Action filter)
  if (detailModal.value.filterTindakan !== 'all') {
    result = result.filter(p => p.metode_persalinan === detailModal.value.filterTindakan)
  }

  return result
})

const uniqueDoctors = computed(() => {
  const doctors = [...new Set(detailModal.value.data.map(p => p.nm_dokter))]
  return doctors.sort()
})

// Generate year options (current year ± 5 years)
const currentYear = new Date().getFullYear()
const yearOptions = ref(
  Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
)

const filters = ref({
  mode: 'harian', // 'harian' or 'tahunan'
  tgl_awal: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
  tgl_akhir: new Date().toISOString().substr(0, 10),
  tahun: currentYear,
  status_lanjut: 'all',
  kd_poli: 'all'
})

const fetchPoliklinik = async () => {
  try {
    const response = await poliklinikService.getAllPoliklinik()
    poliklinikOptions.value = [
      { kd_poli: 'all', nm_poli: 'Semua Poliklinik' },
      ...response.data.data
    ]
  } catch (error) {
    console.error('Failed to fetch poliklinik:', error)
  }
}

const chartDataReady = ref(false)

const lineChartData = computed(() => {
    const data = filters.value.mode === 'tahunan' 
        ? (visitData.value.monthly_breakdown || []) 
        : (visitData.value.charts || [])
    
    return {
        labels: data.map(item => filters.value.mode === 'tahunan' ? item.nama_bulan : item.date.split('-').slice(1).reverse().join('/')),
        datasets: [
            {
                label: 'Kunjungan',
                data: data.map(item => item.total || (item.ralan + item.ranap)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }
        ]
    }
})

const ageChartData = computed(() => {
    const data = visitData.value.usia || []
    return {
        labels: data.map(i => i.label),
        datasets: [{
            label: 'Total Pasien',
            data: data.map(i => i.total),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderRadius: 6
        }]
    }
})

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            usePointStyle: true
        }
    },
    scales: {
        y: { 
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
        }
    }
}

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
    }
}

const fetchData = async () => {
  loading.value = true
  chartDataReady.value = false
  try {
    const response = await dashboardVisitService.getVisitStats(filters.value)
    const data = response.data.data
    visitData.value = data
    summary.value = data.summary
    inpatientCare.value = data.inpatient_care || null
    
    setTimeout(() => { chartDataReady.value = true }, 300)
  } catch (error) {
    console.error('Failed to fetch visit stats:', error)
  } finally {
    loading.value = false
  }
}

const getPercentage = (value, total) => {
  if (!total) return 0
  return ((value / total) * 100).toFixed(1)
}

const getData = (stts, jk) => {
  if (!visitData.value.registrasi) return 0
  const item = visitData.value.registrasi.find(r => 
    r.stts_daftar?.toLowerCase() === stts.toLowerCase() && 
    r.jk?.toLowerCase() === jk.toLowerCase()
  )
  return item ? item.total : 0
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 992
  if (!isMobile.value) {
    isFilterVisible.value = true
  }
}

const openDetails = async (category) => {
  detailModal.value.category = category
  detailModal.value.show = true
  detailModal.value.loading = true
  detailModal.value.data = []
  detailModal.value.searchQuery = ''
  detailModal.value.filterType = 'all'
  detailModal.value.filterDoctor = 'all'

  try {
    const params = {
      ...filters.value,
      kategori: category
    }
    const response = await dashboardVisitService.getVisitDetails(params)
    detailModal.value.data = response.data.data
  } catch (error) {
    console.error('Failed to fetch details:', error)
  } finally {
    detailModal.value.loading = false
  }
}

const closeDetails = () => {
  detailModal.value.show = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchPoliklinik()
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.visit-dashboard {
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.poli-filter {
  flex: 1;
  min-width: 200px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
  padding: 3rem 2rem;
  border-radius: 0 0 30px 30px;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  /* Remove overflow: hidden to allow dropdowns to show */
  overflow: visible; 
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
  z-index: 10;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: -20px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  transform: rotate(15deg);
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0 1rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  opacity: 0.9;
  font-size: 1rem;
  margin-top: 0.5rem;
  padding-left: 2.2rem; /* Align with title text (skipping icon space) */
}

.header-actions {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(15px) saturate(160%);
  padding: 1.5rem 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  z-index: 20;
}

.btn-toggle-filter {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh i {
  font-size: 1rem;
}

.btn-toggle-filter:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease-out;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-item label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

/* Mode Selector */
.mode-selector {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.25rem;
  border-radius: 12px;
}

.mode-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mode-btn i {
  font-size: 0.9rem;
}

.date-inputs .separator {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: lowercase;
  opacity: 0.6;
  color: white;
  padding: 0 0.25rem;
}

.form-input, .form-select {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 700;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card.keluar { border-bottom: 4px solid #10b981; }
.stat-card.mati { border-bottom: 4px solid #64748b; }
.stat-card.mati-long { border-bottom: 4px solid #475569; }
.stat-card.care-days { border-bottom: 4px solid #8b5cf6; }
.stat-card.lama-inap { border-bottom: 4px solid #f59e0b; }
.stat-card.avg-stay { border-bottom: 4px solid #06b6d4; }

/* Trend Badge */
.trend-badge {
    padding: 0.4rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.trend-badge.up { background: #dcfce7; color: #15803d; }
.trend-badge.down { background: #fee2e2; color: #b91c1c; }

/* Chart Container */
.chart-container-mini {
    height: 200px;
    margin-top: 1rem;
}

.chart-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 12px;
    color: #94a3b8;
    font-size: 0.85rem;
}


.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.stat-card:hover { rotate: 1deg; transform: scale(1.02); }

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f1f5f9;
  border-radius: 12px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.stat-value small {
     font-size: 0.85rem;
     color: #94a3b8;
}

/* Visuals Grid */
.visuals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.visual-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.full-width {
  grid-column: span 2;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3b82f6;
  padding-left: 0.75rem;
}

/* Bar Components */
.bar-container {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.bar {
  height: 100%;
  border-radius: 12px;
  transition: width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bar.blue { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.bar.pink { background: linear-gradient(90deg, #ec4899, #be185d); }
.bar.cyan { background: linear-gradient(90deg, #06b6d4, #0891b2); }
.bar.purple { background: linear-gradient(90deg, #a855f7, #7e22ce); }

.bar-container .value {
  position: absolute;
  right: 10px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 0 4px white;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  width: 100%;
}

.gender-breakdown-container {
     width: 100%;
}

.breakdown-item .label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

/* List Visuals */
.list-item {
  margin-bottom: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  gap: 0.5rem;
}

.item-label {
  flex: 1;
  word-break: break-word;
}

.bar-container-mini {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
}

.bar-mini {
  height: 100%;
  border-radius: 5px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-mini.primary { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

/* Poli Bar View */
.poli-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  height: 250px;
  align-items: flex-end;
}

.poli-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.poli-bar-wrapper {
  width: 100%;
  height: 180px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.poli-bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 6px;
  transition: height 1s ease;
  position: relative;
  display: flex;
  justify-content: center;
}

.poli-val {
  position: absolute;
  top: -20px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e293b;
}

.poli-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 0.75rem;
  text-align: center;
  word-break: break-all;
  height: 30px;
}

/* Doctor Rows */
.doctor-row {
     display: flex;
     align-items: center;
     gap: 1rem;
     padding: 0.75rem 0;
     border-bottom: 1px solid #f1f5f9;
}

.doc-rank {
     width: 24px;
     height: 24px;
     background: #eff6ff;
     color: #3b82f6;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 0.75rem;
     font-weight: 800;
}

.doc-info {
     flex: 1;
}

.doc-name {
     font-size: 0.9rem;
     font-weight: 700;
     color: #1e293b;
     display: block;
     margin-bottom: 0.25rem;
}

.doc-bar-container {
     height: 10px;
     background: #f1f5f9;
     border-radius: 5px;
     overflow: hidden;
}

.doc-bar {
     height: 100%;
     background: #10b981;
     border-radius: 5px;
     transition: width 1s ease;
}

.doc-count {
     font-size: 0.85rem;
     font-weight: 700;
     color: #059669;
}

/* Loader */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: #64748b;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header {
    padding: 3rem 1.25rem;
    border-radius: 0 0 32px 32px;
    margin-bottom: 1.5rem;
    margin: -1.5rem -1.25rem 1.5rem -1.25rem; /* Full width correction */
  }

  .page-subtitle {
    font-size: 0.8rem;
    padding-left: 0; /* Center alignment on mobile doesn't need icon offset */
  }

  .header-actions {
    padding: 1rem;
    width: 100%;
    backdrop-filter: blur(15px);
  }

  .header-text {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .header-actions {
    padding: 1rem;
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    gap: 1rem;
  }

  .mode-selector {
    flex-direction: row;
  }

  .mode-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
  }

  .date-inputs span {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .dashboard-content {
    padding: 0 1.25rem;
    font-size: 0.9rem; /* Global scale reduction */
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    border-radius: 12px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .visuals-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .full-width {
    grid-column: auto;
  }

  .visual-card {
    padding: 0.85rem;
    overflow: hidden;
    border-radius: 12px;
  }

  .summary-item {
    padding-right: 1.25rem !important; /* Force right gutter */
  }

  .breakdown-item {
    gap: 0.2rem;
    margin-bottom: 0.5rem;
  }

  .list-item {
    margin-bottom: 0.75rem;
  }

  .item-label, .stat-label {
    font-size: 0.75rem;
  }

  .breakdown-item,
  .list-item,
  .doctor-row {
    padding-right: 1.25rem; /* Larger gutter for bars */
  }

  .bar-container, 
  .bar-container-mini,
  .doc-bar-container {
    width: 94% !important; /* Force a gap on the right */
    height: 16px;
  }

  .bar-container .value {
    font-size: 0.6rem;
    right: 5px;
  }

  .card-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .poli-grid {
    display: flex;
    overflow-x: auto;
    justify-content: flex-start;
    padding: 0.5rem 0 1.5rem 0;
    gap: 1.25rem;
    height: auto;
    min-height: 320px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .poli-grid::-webkit-scrollbar {
    height: 4px;
  }

  .poli-grid::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .poli-item {
    min-width: 85px;
    flex: 0 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .poli-bar-wrapper {
    height: 160px;
    margin-top: auto;
  }

  .poli-name {
    font-size: 0.7rem;
    height: auto;
    min-height: 45px;
    margin-top: 0;
    margin-bottom: 0.75rem;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: normal;
    overflow-wrap: break-word;
  }

  .poli-val {
    top: -22px;
    font-size: 0.75rem;
  }

  .doctor-row {
    gap: 0.75rem;
    padding: 0.5rem 0.75rem 0.5rem 0;
  }

  .doc-rank {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }

  .doc-name {
    font-size: 0.8rem;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    max-width: none;
    line-height: 1.2;
  }

  .doc-count {
    font-size: 0.75rem;
    min-width: 65px;
    text-align: right;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
/* Clickable items */
.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  background: rgba(0, 0, 0, 0.03);
  transform: translateX(4px);
}

.clickable .item-value {
  transition: all 0.2s;
}

.clickable:hover .item-value {
  color: #3b82f6;
  font-weight: 700;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-container.large {
  max-width: 1100px;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.modal-subtitle {
  color: #64748b;
  margin: 0.15rem 0 0 0;
  font-size: 0.8rem;
}

.btn-close-modal {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.btn-close-modal:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.modal-loader {
  padding: 4rem;
  text-align: center;
  color: #64748b;
}

.empty-state {
  padding: 5rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
}

/* Table Design */
.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

.detail-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.85rem;
}

.detail-table tr:hover {
  background: #f8fafc;
}

.patient-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
  line-height: 1.2;
}

.small-text-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  font-size: 0.7rem;
  margin-top: 0.15rem;
}

.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
}

.badge-bbl {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}

.badge-perawatan {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.badge-rawat-bersama {
  font-size: 0.65rem;
  color: #94a3b8;
  font-style: italic;
  padding: 0.1rem 0.4rem;
  border: 1px dashed #e2e8f0;
  border-radius: 4px;
  display: inline-block;
  white-space: nowrap;
}

.badge-payment {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  font-size: 0.6rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.badge-status {
  background: #f1f5f9;
  color: #475569;
}

/* Modal Filters Styling */
.modal-filters-container {
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.search-box-modal {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box-modal i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
}

.modal-search-input {
  width: 100%;
  padding: 0.4rem 1rem 0.4rem 2.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}

.modal-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls-modal {
  display: flex;
  gap: 0.5rem;
}

.modal-select-mini {
  padding: 0.4rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8rem;
  outline: none;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

.modal-select-mini:focus {
  border-color: #3b82f6;
}

.modal-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-primary-outline {
  background: white;
  border: 1.5px solid #3b82f6;
  color: #3b82f6;
  padding: 0.4rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary-outline:hover {
  background: #3b82f6;
  color: white;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>
