<template>
  <div class="kepatuhan-sku-bpjs-view animate__animated animate__fadeIn p-0 p-sm-2 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-medical text-primary"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Kepatuhan Penerbitan SKU BPJS</h3>
            <p class="page-subtitle mb-0 small">Laporan monitoring kepatuhan surat kontrol ulang pasien BPJS baik Rawat Jalan dan Rawat Inap</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Card (Top) -->
    <div class="card border-0 shadow-sm panel-card mb-4">
      <div class="card-body p-3">
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-light text-primary p-2 rounded-3">
              <i class="fas fa-filter"></i>
            </span>
            <h6 class="m-0 fw-bold text-dark">Filter Laporan</h6>
          </div>
          
          <div class="d-flex flex-wrap gap-2 align-items-center w-100-mobile">
            <!-- Start Date -->
            <input 
              v-model="filters.start_date" 
              type="date" 
              class="form-control form-control-sm premium-input-date" 
              @change="handleFilterChange"
            />
            
            <!-- End Date -->
            <input 
              v-model="filters.end_date" 
              type="date" 
              class="form-control form-control-sm premium-input-date" 
              @change="handleFilterChange"
            />

            <!-- Jenis Pelayanan -->
            <select v-model="filters.jnspelayanan" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="all">Semua Pelayanan</option>
              <option value="1">Rawat Inap</option>
              <option value="2">Rawat Jalan</option>
            </select>

            <!-- Poliklinik -->
            <select v-model="filters.kd_poli" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="">Semua Poliklinik</option>
              <option v-for="poli in poliklinikList" :key="poli.kd_poli" :value="poli.kd_poli">
                {{ poli.nm_poli }}
              </option>
            </select>

            <!-- Dokter -->
            <select v-model="filters.kd_dokter" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="">Semua Dokter</option>
              <option v-for="dr in dokterList" :key="dr.kd_dokter" :value="dr.kd_dokter">
                {{ dr.nm_dokter }}
              </option>
            </select>

            <!-- Status Kepatuhan -->
            <select v-model="filters.status" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="all">Semua Status</option>
              <option value="kritis_h1">🔴 Kritis: Batas Akhir Hari Ini (H+1)</option>
              <option value="warning_h0">🟡 Warning: Belum Terbit Hari Ini (H-0)</option>
              <option value="expired">⚫ Expired: Melewati H+1 (Hangus)</option>
              <option value="patuh">🟢 Terbit SKU (Patuh)</option>
              <option value="tidak_patuh">Belum Terbit SKU (Semua)</option>
              <option value="tidak_perlu_kontrol">🔵 Bebas Kontrol (Selesai / Sembuh DPJP)</option>
              <option value="rujukan">Rujukan / Rujuk Balik</option>
              <option value="belum_pulang">Belum Pulang (Ranap)</option>
            </select>

            <!-- Search -->
            <input 
              v-model="filters.search" 
              type="text" 
              class="form-control form-control-sm premium-input-search" 
              placeholder="Cari RM / Nama / SEP..." 
              @input="handleSearch"
            />

            <!-- Export Buttons -->
            <button class="btn-export-excel" @click="exportToExcel" :disabled="loading">
              <i class="fas fa-file-excel me-1"></i> Excel
            </button>
            <button class="btn-export-pdf" @click="exportToPDF" :disabled="loading">
              <i class="fas fa-file-pdf me-1"></i> PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Radar EWS Alert Card (Regulasi Maks H+1) -->
    <div class="card border-0 shadow-sm ews-radar-card mb-4">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 border-bottom pb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="ews-radar-dot"></span>
            <h5 class="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="fas fa-satellite-dish text-danger"></i>
              Radar Early Warning System (EWS) SKU BPJS
            </h5>
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 ms-1 d-none d-sm-inline" style="font-size: 0.72rem; font-weight: 700;">
              REGULASI MAKS. H+1
            </span>
          </div>
          <div class="small text-muted">
            <i class="fas fa-shield-alt text-primary me-1"></i>
            Batas terbit SKU maksimal <strong>H+1</strong> (Kunjungan Poli / Pasien Pulang Ranap) sebelum sistem VClaim mengunci.
          </div>
        </div>

        <div class="row g-3">
          <!-- Widget 1: KRITIS H+1 (Batas Hari Ini) -->
          <div class="col-lg-4 col-md-6">
            <div 
              class="ews-box ews-box-danger p-3 rounded-3"
              :class="{ 'active-filter': filters.status === 'kritis_h1' }"
              @click="setQuickEwsFilter('kritis_h1')"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge bg-danger text-white fw-bold px-2 py-1 mb-1">
                    <i class="fas fa-exclamation-triangle me-1 animate-pulse"></i>BATAS AKHIR HARI INI
                  </span>
                  <div class="fw-bold text-dark fs-5 mt-1">Fase Kritis (H+1)</div>
                </div>
                <div class="ews-count-badge text-danger">
                  {{ stats?.ews?.kritis_h1?.total || 0 }}
                </div>
              </div>
              <div class="small text-muted mb-2">
                Pasien kunjungan/pulang kemarin. <strong>Wajib terbit sebelum 23:59 WIB</strong> hari ini!
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                <span class="text-secondary small">
                  Ralan: <strong>{{ stats?.ews?.kritis_h1?.ralan || 0 }}</strong> | Ranap: <strong>{{ stats?.ews?.kritis_h1?.ranap || 0 }}</strong>
                </span>
                <button 
                  class="ews-btn-action ews-btn-kritis"
                  :class="{ 'is-active': filters.status === 'kritis_h1' }"
                  @click.stop="setQuickEwsFilter('kritis_h1')"
                >
                  <i :class="filters.status === 'kritis_h1' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
                  <span>{{ filters.status === 'kritis_h1' ? 'Sedang Dipantau' : 'Pantau Pasien' }}</span>
                  <i class="fas fa-arrow-down ms-1 transition-arrow"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Widget 2: WARNING H-0 (Hari Ini) -->
          <div class="col-lg-4 col-md-6">
            <div 
              class="ews-box ews-box-warning p-3 rounded-3"
              :class="{ 'active-filter': filters.status === 'warning_h0' }"
              @click="setQuickEwsFilter('warning_h0')"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge bg-warning text-dark fw-bold px-2 py-1 mb-1">
                    <i class="fas fa-clock me-1"></i>HARI INI (H-0)
                  </span>
                  <div class="fw-bold text-dark fs-5 mt-1">Perlu Dibuat Segera</div>
                </div>
                <div class="ews-count-badge text-warning-emphasis">
                  {{ stats?.ews?.warning_h0?.total || 0 }}
                </div>
              </div>
              <div class="small text-muted mb-2">
                Pasien kunjungan/pulang hari ini. Disarankan terbit sebelum pergantian hari.
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                <span class="text-secondary small">
                  Ralan: <strong>{{ stats?.ews?.warning_h0?.ralan || 0 }}</strong> | Ranap: <strong>{{ stats?.ews?.warning_h0?.ranap || 0 }}</strong>
                </span>
                <button 
                  class="ews-btn-action ews-btn-warning"
                  :class="{ 'is-active': filters.status === 'warning_h0' }"
                  @click.stop="setQuickEwsFilter('warning_h0')"
                >
                  <i :class="filters.status === 'warning_h0' ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                  <span>{{ filters.status === 'warning_h0' ? 'Sedang Dipantau' : 'Pantau Pasien' }}</span>
                  <i class="fas fa-arrow-down ms-1 transition-arrow"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Widget 3: EXPIRED (> H+1) -->
          <div class="col-lg-4 col-md-12">
            <div 
              class="ews-box ews-box-secondary p-3 rounded-3"
              :class="{ 'active-filter': filters.status === 'expired' }"
              @click="setQuickEwsFilter('expired')"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge bg-secondary text-white fw-bold px-2 py-1 mb-1">
                    <i class="fas fa-ban me-1"></i>TERKUNCI VCLAIM
                  </span>
                  <div class="fw-bold text-dark fs-5 mt-1">Hangus (> H+1)</div>
                </div>
                <div class="ews-count-badge text-secondary">
                  {{ stats?.ews?.expired?.total || 0 }}
                </div>
              </div>
              <div class="small text-muted mb-2">
                Sudah melewati batas waktu H+1. Tidak dapat diterbitkan lagi di BPJS.
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                <span class="text-secondary small">
                  Periode filter: <strong>{{ stats?.ews?.expired?.total || 0 }} Pasien</strong>
                </span>
                <button 
                  class="ews-btn-action ews-btn-secondary"
                  :class="{ 'is-active': filters.status === 'expired' }"
                  @click.stop="setQuickEwsFilter('expired')"
                >
                  <i :class="filters.status === 'expired' ? 'fas fa-check-circle' : 'fas fa-table'"></i>
                  <span>{{ filters.status === 'expired' ? 'Sedang Ditampilkan' : 'Lihat Data' }}</span>
                  <i class="fas fa-arrow-down ms-1 transition-arrow"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Stats Block -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
      <!-- Total SEP BPJS -->
      <div class="col">
        <div class="kpi-card kpi-primary shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-primary-light">
              <i class="fas fa-file-medical text-primary"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Total SEP BPJS</span>
              <h2 class="kpi-value fw-black text-dark m-0">{{ stats?.overall?.total_sep || 0 }}</h2>
              <small class="text-muted">Total seluruh kunjungan BPJS</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Wajib SKU (Total Eligible) -->
      <div class="col">
        <div class="kpi-card kpi-warning shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-warning-light">
              <i class="fas fa-clipboard-list text-warning"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Wajib SKU</span>
              <h2 class="kpi-value fw-black text-warning m-0">{{ stats?.overall?.total_eligible || 0 }}</h2>
              <div class="mt-1 d-flex flex-wrap gap-1">
                <span class="badge bg-warning-subtle text-warning border border-warning-subtle py-1 px-2" style="font-size: 0.7rem; font-weight: 600;">
                  <i class="fas fa-info-circle me-1"></i>Excl. {{ stats?.overall?.ranap_belum_pulang || 0 }} Ranap Aktif
                </span>
                <span v-if="(stats?.overall?.tidak_perlu_kontrol || 0) > 0" class="badge bg-info-subtle text-cyan border border-info-subtle py-1 px-2" style="font-size: 0.7rem; font-weight: 600;">
                  Excl. {{ stats?.overall?.tidak_perlu_kontrol || 0 }} Selesai/Sembuh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patuh / Terbit SKU -->
      <div class="col">
        <div class="kpi-card kpi-success shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-success-light">
              <i class="fas fa-check-circle text-success"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Terbit SKU (Patuh)</span>
              <h2 class="kpi-value fw-black text-success m-0">{{ stats?.overall?.patuh || 0 }}</h2>
              <small class="text-muted">SKU diterbitkan tepat waktu</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tidak Patuh / Belum Terbit SKU -->
      <div class="col">
        <div class="kpi-card kpi-danger shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-danger-light">
              <i class="fas fa-times-circle text-danger"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Belum Terbit SKU</span>
              <h2 class="kpi-value fw-black text-danger m-0">{{ stats?.overall?.tidak_patuh || 0 }}</h2>
              <small class="text-muted">Wajib kontrol belum ada SKU</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Selesai / Bebas Kontrol (DPJP) -->
      <div class="col">
        <div class="kpi-card kpi-cyan shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-cyan-light">
              <i class="fas fa-user-check text-cyan"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Bebas Kontrol (DPJP)</span>
              <h2 class="kpi-value fw-black text-cyan m-0">{{ stats?.overall?.tidak_perlu_kontrol || 0 }}</h2>
              <small class="text-muted">Disposisi dokter: Selesai/Sembuh</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Rujukan / Rujuk Balik -->
      <div class="col">
        <div class="kpi-card kpi-sky shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-info-light">
              <i class="fas fa-external-link-alt text-info"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Rujuk Keluar/Balik</span>
              <h2 class="kpi-value fw-black text-info m-0">{{ stats?.overall?.rujukan || 0 }}</h2>
              <small class="text-muted">Tidak membutuhkan SKU rumah sakit</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Persentase Kepatuhan -->
      <div class="col">
        <div class="kpi-card kpi-teal shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-teal-light">
              <i class="fas fa-percent text-teal"></i>
            </div>
            <div class="kpi-info w-100">
              <span class="kpi-title text-muted fw-bold">Tingkat Kepatuhan</span>
              <h2 class="kpi-value fw-black text-teal m-0">{{ compliancePercentage }}%</h2>
              <div class="progress mt-2" style="height: 8px; border-radius: 4px; background-color: #f1f5f9;">
                <div 
                  class="progress-bar bg-teal progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: compliancePercentage + '%', boxShadow: '0 0 8px rgba(13, 148, 136, 0.4)' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footnote Info -->
    <div class="mb-4 px-2">
      <small class="text-muted fst-italic">
        <i class="fas fa-info-circle me-1 text-primary"></i>
        *Catatan: Pasien Rawat Jalan yang diinstruksikan <strong>Selesai / Sembuh / Rujuk Balik FKTP</strong> oleh DPJP di Rekam Medis (EMR) otomatis <strong>dikecualikan dari kewajiban SKU</strong> dan tidak dibunyikan di Radar EWS.
      </small>
    </div>

    <!-- Charts Visualization row -->
    <div class="row g-4 mb-4">
      <!-- Daily Trend Chart -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm panel-card">
          <div class="panel-header pt-4 px-4">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-chart-line text-primary me-2"></i>Tren Kepatuhan Penerbitan SKU (%)</h5>
          </div>
          <div class="card-body px-4 pb-4">
            <div v-if="trendChartSeries[0]?.data.length > 0" class="chart-wrapper">
              <VueApexCharts 
                type="area" 
                height="280" 
                :options="trendChartOptions" 
                :series="trendChartSeries"
              />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="fas fa-chart-area fa-3x mb-3 text-light"></i>
              <p class="m-0">Belum ada data untuk grafik tren.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut Status Distribution -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm panel-card h-100">
          <div class="panel-header pt-4 px-4">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-info-circle text-info me-2"></i>Distribusi Status Pasien</h5>
          </div>
          <div class="card-body p-4 d-flex flex-column align-items-center justify-content-center">
            <div v-if="(stats?.overall?.total_sep || 0) > 0" class="w-100">
              <VueApexCharts 
                type="donut" 
                height="240" 
                :options="donutChartOptions" 
                :series="donutChartSeries"
              />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="fas fa-chart-pie fa-3x mb-3 text-light"></i>
              <p class="m-0">Belum ada data untuk diagram status.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rankings and Detailed Table Block -->
    <div class="card border-0 shadow-sm panel-card mb-4">
      <div class="card-body p-4">
        <!-- Clinic & Doctor Rankings Block -->
        <div class="row g-4 mb-4">
          <!-- Top Clinic Performance -->
          <div class="col-lg-6">
            <div class="card border border-light shadow-none bg-light-subtle h-100">
              <div class="card-header bg-transparent border-0 pt-3 px-3">
                <h6 class="m-0 fw-bold text-dark"><i class="fas fa-hospital text-primary me-2"></i>Kepatuhan per Poliklinik</h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.poliklinik && stats.poliklinik.length > 0">
                  <div v-for="poli in stats.poliklinik" :key="poli.kd_poli" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ poli.nm_poli }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getPoliRate(poli) }}% 
                        <small class="text-muted">({{ poli.patuh }}/{{ poli.total - poli.rujukan }} SKU)</small>
                      </span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div 
                        :class="['progress-bar', getRateColorClass(getPoliRate(poli))]" 
                        role="progressbar" 
                        :style="{ width: getPoliRate(poli) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-muted small">Belum ada data poliklinik.</div>
              </div>
            </div>
          </div>

          <!-- Top Doctor Performance -->
          <div class="col-lg-6">
            <div class="card border border-light shadow-none bg-light-subtle h-100">
              <div class="card-header bg-transparent border-0 pt-3 px-3">
                <h6 class="m-0 fw-bold text-dark"><i class="fas fa-user-md text-info me-2"></i>Kepatuhan per Dokter</h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.dokter && stats.dokter.length > 0">
                  <div v-for="dr in stats.dokter.slice(0, 10)" :key="dr.kd_dokter" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ dr.nm_dokter }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getDokterRate(dr) }}% 
                        <small class="text-muted">({{ dr.patuh }}/{{ dr.total - dr.rujukan }} SKU)</small>
                      </span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div 
                        :class="['progress-bar', getRateColorClass(getDokterRate(dr))]" 
                        role="progressbar" 
                        :style="{ width: getDokterRate(dr) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-muted small">Belum ada data dokter.</div>
              </div>
            </div>
          </div>
        </div>

        <div id="rincian-kepatuhan-table" class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 border-bottom pb-3 transition-table-header">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-list text-primary me-2"></i>Rincian Monitoring Kepatuhan SKU</h5>
            <span v-if="['kritis_h1', 'warning_h0', 'expired'].includes(filters.status)" class="badge px-2 py-1" :class="getActiveEwsChipClass()" style="font-size: 0.75rem;">
              <i class="fas fa-filter me-1"></i>{{ getActiveEwsChipLabel() }}
            </span>
          </div>
          <div v-if="['kritis_h1', 'warning_h0', 'expired'].includes(filters.status)">
            <button class="btn btn-sm btn-outline-secondary py-1 px-3 rounded-pill small fw-semibold" @click="setQuickEwsFilter(filters.status)">
              <i class="fas fa-times me-1"></i>Reset Filter Radar
            </button>
          </div>
        </div>

        <!-- Detail Table -->
        <div class="table-responsive premium-table">
          <table class="table table-hover align-middle">
            <thead>
              <tr class="table-light-header">
                <th width="40" class="text-center">No</th>
                <th style="min-width: 140px;">No. SEP</th>
                <th style="min-width: 170px;">Nama Pasien</th>
                <th>Jenis Pelayanan</th>
                <th>Poliklinik</th>
                <th>Dokter</th>
                <th style="min-width: 150px;">Rencana Kontrol / Rujukan</th>
                <th style="min-width: 130px;">Tgl Acuan / SEP</th>
                <th style="min-width: 145px;">Batas Akhir (H+1)</th>
                <th width="125" class="text-center">Status EWS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="10" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
                  <div class="text-muted small">Memuat rincian data kepatuhan SKU BPJS...</div>
                </td>
              </tr>
              <tr v-else-if="details.length === 0">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 text-light"></i>
                  <div>Tidak ada data kepatuhan SKU BPJS yang ditemukan.</div>
                </td>
              </tr>
              <tr v-for="(item, index) in details" :key="item.no_sep" class="table-row">
                <td class="text-center text-muted small">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <code class="text-dark fw-bold" style="font-size: 0.8rem;">{{ item.no_sep }}</code>
                  <div class="text-muted small">{{ item.no_rawat }}</div>
                </td>
                <td>
                  <div class="fw-bold text-indigo" style="font-size: 0.85rem;">{{ item.nama_pasien }}</div>
                  <div class="small text-muted">{{ item.nomr }}</div>
                  <div v-if="item.nmdiagnosaawal" class="mt-1 text-secondary" style="font-size: 0.72rem; line-height: 1.35;">
                    <i class="fas fa-stethoscope text-muted me-1"></i>{{ item.nmdiagnosaawal }}
                  </div>
                </td>
                <td>
                  <span :class="['badge-pelayanan', item.jnspelayanan === '1' ? 'ranap' : 'ralan']">
                    {{ item.jnspelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan' }}
                  </span>
                  <div v-if="item.jnspelayanan === '1'" class="mt-1">
                    <span :class="['badge', item.status_compliance === 'BELUM_PULANG' ? 'bg-warning text-dark' : 'bg-success']" style="font-size: 0.65rem; padding: 2px 6px;">
                      {{ item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Sudah Pulang' }}
                    </span>
                  </div>
                </td>
                <td class="small">{{ item.nm_poli }}</td>
                <td class="small fw-semibold text-secondary">{{ item.nm_dokter }}</td>
                <td class="small">
                  <div v-if="item.status_compliance === 'PATUH'">
                    <div class="fw-bold text-dark"><i class="fas fa-file-signature text-success me-1"></i>{{ item.no_surat }}</div>
                    <span class="text-muted small">Rencana: {{ formatDateOnly(item.tgl_rencana) }}</span>
                  </div>
                  <div v-else-if="item.status_compliance === 'RUJUKAN'">
                    <div class="fw-bold text-info"><i class="fas fa-external-link-alt text-info me-1"></i>{{ item.no_rujukan }}</div>
                    <span class="text-muted small">{{ item.nm_ppkDirujuk }}</span>
                  </div>
                  <div v-else-if="item.status_compliance === 'TIDAK_PERLU_KONTROL'">
                    <span class="badge bg-info-subtle text-cyan border border-info-subtle py-1 px-2 fw-semibold">
                      <i class="fas fa-check-double me-1"></i>{{ formatDisposisiLabel(item.status_tindak_lanjut) }}
                    </span>
                    <div v-if="item.catatan_dokter" class="text-secondary small mt-1" style="font-size: 0.72rem;">
                      <i class="fas fa-comment-medical me-1 text-muted"></i>{{ item.catatan_dokter }}
                    </div>
                  </div>
                  <div v-else-if="item.status_compliance === 'BELUM_PULANG'" class="text-warning small fw-semibold">
                    <i class="fas fa-bed me-1"></i>Masih Dirawat
                  </div>
                  <div v-else class="text-danger small fw-semibold">
                    <i class="fas fa-exclamation-circle me-1"></i>Belum Terbit SKU
                  </div>
                </td>
                <td class="small">
                  <div v-if="item.jnspelayanan === '1' && item.tglpulang && item.tglpulang !== '0000-00-00 00:00:00'">
                    <span class="badge bg-light text-secondary border py-0 px-1">Pulang:</span>
                    <span class="fw-bold ms-1 text-dark">{{ formatDateOnly(item.tgl_acuan) }}</span>
                    <div class="text-muted" style="font-size: 0.7rem;">SEP: {{ formatDateOnly(item.tglsep) }}</div>
                  </div>
                  <div v-else-if="item.jnspelayanan === '1'">
                    <span class="badge bg-warning-subtle text-dark border border-warning py-0 px-1">Masih Dirawat</span>
                    <div class="text-muted" style="font-size: 0.7rem;">SEP: {{ formatDateOnly(item.tglsep) }}</div>
                  </div>
                  <div v-else>
                    <span class="badge bg-light text-secondary border py-0 px-1">Periksa:</span>
                    <span class="fw-bold ms-1 text-dark">{{ formatDateOnly(item.tglsep) }}</span>
                  </div>
                </td>
                <td class="small">
                  <div v-if="item.status_compliance === 'PATUH'">
                    <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2">
                      <i class="fas fa-check-circle me-1"></i>Terbit Tepat Waktu
                    </span>
                  </div>
                  <div v-else-if="item.status_compliance === 'RUJUKAN'">
                    <span class="badge bg-info-subtle text-info border border-info-subtle py-1 px-2">
                      <i class="fas fa-external-link-alt me-1"></i>Rujukan Keluar
                    </span>
                  </div>
                  <div v-else-if="item.status_compliance === 'TIDAK_PERLU_KONTROL'">
                    <span class="badge bg-light text-cyan border border-info-subtle py-1 px-2">
                      <i class="fas fa-user-check me-1"></i>Tidak Wajib SKU
                    </span>
                    <div class="text-muted mt-1" style="font-size: 0.7rem;">Selesai Pengobatan</div>
                  </div>
                  <div v-else-if="item.status_compliance === 'BELUM_PULANG'">
                    <span class="text-muted small">
                      <i class="fas fa-bed me-1 text-secondary"></i>Belum Pulang
                    </span>
                  </div>
                  <div v-else-if="item.status_ews === 'KRITIS_H1'">
                    <span class="badge bg-danger text-white py-1 px-2 shadow-sm animate-pulse-badge">
                      <i class="fas fa-exclamation-triangle me-1"></i>HARI INI ({{ formatDateOnly(item.tgl_deadline) }})
                    </span>
                    <div class="text-danger fw-bold mt-1" style="font-size: 0.7rem;">
                      <i class="fas fa-hourglass-half me-1"></i>Maks 23:59 WIB
                    </div>
                  </div>
                  <div v-else-if="item.status_ews === 'WARNING_H0'">
                    <span class="badge bg-warning text-dark py-1 px-2">
                      <i class="fas fa-clock me-1"></i>Besok ({{ formatDateOnly(item.tgl_deadline) }})
                    </span>
                    <div class="text-secondary mt-1" style="font-size: 0.7rem;">
                      Sisa 1 Hari
                    </div>
                  </div>
                  <div v-else-if="item.status_ews === 'EXPIRED'">
                    <span class="badge bg-dark-subtle text-muted border border-secondary py-1 px-2">
                      <i class="fas fa-ban me-1"></i>Lewat Deadline
                    </span>
                    <div class="text-muted mt-1" style="font-size: 0.7rem;">
                      Deadline: {{ formatDateOnly(item.tgl_deadline) }}
                    </div>
                  </div>
                  <div v-else class="text-muted small">
                    -
                  </div>
                </td>
                <td class="text-center">
                  <span :class="['compliance-badge', getComplianceBadgeClass(item)]">
                    <i :class="getComplianceBadgeIcon(item)"></i>
                    {{ getComplianceBadgeLabel(item) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="pagination.total > 0" class="pagination-container mt-4">
          <div class="pagination-info">
            Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
            {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
            dari {{ pagination.total }} data
          </div>
          <div class="pagination-controls">
            <button 
              class="btn-page" 
              :disabled="pagination.current_page === 1"
              @click="changePage(pagination.current_page - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in displayedPages" 
                :key="page"
                class="btn-page-number"
                :class="{ active: page === pagination.current_page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button 
              class="btn-page" 
              :disabled="pagination.current_page === pagination.last_page"
              @click="changePage(pagination.current_page + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { kepatuhanSkuBpjsService } from '@/services/kepatuhanSkuBpjsService'
import poliklinikService from '@/services/poliklinikService'
import { dokterService } from '@/services/dokterService'
import VueApexCharts from 'vue3-apexcharts'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'

const toast = useToast()
const loading = ref(false)

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Dropdown lists
const poliklinikList = ref([])
const dokterList = ref([])

// Stats & Details State
const stats = ref({
  overall: { total_sep: 0, total_eligible: 0, patuh: 0, tidak_patuh: 0, rujukan: 0, ranap_belum_pulang: 0 },
  ews: {
    kritis_h1: { total: 0, ralan: 0, ranap: 0 },
    warning_h0: { total: 0, ralan: 0, ranap: 0 },
    expired: { total: 0, ralan: 0, ranap: 0 }
  },
  daily_trend: [],
  poliklinik: [],
  dokter: []
})
const details = ref([])

// Pagination
const pagination = ref({
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1
})

// Date defaults
const today = new Date()
const formatDateToYYYYMMDD = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const defaultStartDate = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1))
const defaultEndDate = formatDateToYYYYMMDD(today)

// Filters State
const filters = reactive({
  start_date: defaultStartDate,
  end_date: defaultEndDate,
  jnspelayanan: 'all',
  kd_poli: '',
  kd_dokter: '',
  status: 'all',
  search: '',
  limit: 20
})

const setQuickEwsFilter = (statusKey) => {
  if (filters.status === statusKey) {
    filters.status = 'all'
  } else {
    filters.status = statusKey
  }
  handleFilterChange()

  // Smooth scroll and focus directly to the detailed list data table
  if (filters.status !== 'all') {
    setTimeout(() => {
      const tableEl = document.getElementById('rincian-kepatuhan-table')
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        tableEl.classList.add('table-section-focused')
        setTimeout(() => {
          tableEl.classList.remove('table-section-focused')
        }, 1600)
      }
    }, 120)
  }
}

const getActiveEwsChipClass = () => {
  if (filters.status === 'kritis_h1') return 'bg-danger text-white'
  if (filters.status === 'warning_h0') return 'bg-warning text-dark'
  if (filters.status === 'expired') return 'bg-secondary text-white'
  return 'bg-primary text-white'
}

const getActiveEwsChipLabel = () => {
  if (filters.status === 'kritis_h1') return 'Fase Kritis H+1 (Batas Hari Ini)'
  if (filters.status === 'warning_h0') return 'Warning H-0 (Hari Ini)'
  if (filters.status === 'expired') return 'Terkunci BPJS (> H+1)'
  return ''
}

const compliancePercentage = computed(() => {
  if (!stats.value?.overall?.total_eligible) return 0
  return Math.round((stats.value.overall.patuh / stats.value.overall.total_eligible) * 100)
})

// Donut status config
const donutChartSeries = computed(() => [
  Number(stats.value?.overall?.patuh || 0),
  Number(stats.value?.overall?.tidak_patuh || 0),
  Number(stats.value?.overall?.tidak_perlu_kontrol || 0),
  Number(stats.value?.overall?.rujukan || 0),
  Number(stats.value?.overall?.ranap_belum_pulang || 0)
])

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Terbit SKU', 'Belum Terbit SKU', 'Bebas Kontrol (Selesai/Sembuh)', 'Rujukan / Rujuk Balik', 'Belum Pulang (Ranap)'],
  colors: ['#10b981', '#ef4444', '#06b6d4', '#3b82f6', '#f59e0b'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 600,
    labels: { colors: '#475569' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Rata-rata Kepatuhan',
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b',
            formatter: () => `${compliancePercentage.value}%`
          }
        }
      }
    }
  },
  dataLabels: { enabled: false }
}))

// Trend Area Config
const trendChartSeries = computed(() => {
  if (!stats.value?.daily_trend || !stats.value.daily_trend.length) return []
  return [
    {
      name: 'Kepatuhan (%)',
      data: stats.value.daily_trend.map(item => {
        const eligible = (item.total_sep || 0) - (item.rujukan || 0) - (item.tidak_perlu_kontrol || 0) - (item.belum_pulang || 0)
        if (!eligible) return 0
        return Math.round((item.patuh / eligible) * 100)
      })
    }
  ]
})

const trendChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Outfit, sans-serif'
  },
  colors: ['#14b8a6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: (stats.value?.daily_trend || []).map(item => formatDateShort(item.tanggal)),
    labels: {
      style: { colors: '#64748b', fontSize: '10px' }
    }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: (val) => `${val}%`,
      style: { colors: '#64748b' }
    }
  },
  tooltip: {
    x: { show: true },
    y: { formatter: (val) => `${val}%` }
  }
}))

const displayedPages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  return pages
})

const loadFilterOptions = async () => {
  try {
    const [poliklinikRes, dokterRes] = await Promise.all([
      poliklinikService.getAllPoliklinik(),
      dokterService.getDokter(1, 100)
    ])
    poliklinikList.value = poliklinikRes.data.data || poliklinikRes.data || []
    dokterList.value = dokterRes.data.data || dokterRes.data || []
  } catch (error) {
    console.error('Failed to load filter options', error)
  }
}

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      jnspelayanan: filters.jnspelayanan,
      status: filters.status
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }

    // Call stats
    const statsRes = await kepatuhanSkuBpjsService.getStats(params)
    stats.value = statsRes.data.response || statsRes.data.data

    // Call details list
    params.page = page
    params.limit = filters.limit
    const detailRes = await kepatuhanSkuBpjsService.getDetails(params)
    const resData = detailRes.data.response || detailRes.data.data
    details.value = resData.data || []
    pagination.value = {
      current_page: resData.current_page || 1,
      per_page: resData.per_page || 20,
      total: resData.total || 0,
      last_page: resData.last_page || 1
    }
  } catch (error) {
    toast.error('Gagal mengambil laporan kepatuhan SKU BPJS')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  fetchData(1)
}

let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchData(1)
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchData(page)
  }
}

// Helpers
const formatDisposisiLabel = (disposisi) => {
  if (!disposisi) return 'Selesai Pengobatan'
  const map = {
    'SEMBUH': 'Selesai / Sembuh',
    'RUJUK_BALIK': 'Rujuk Balik FKTP',
    'RUJUK_LANJUT': 'Rujuk Faskes Lain',
    'RAWAT_INAP': 'Alih Rawat Inap',
    'KONSUL_SELESAI': 'Konsul Selesai',
    'KONTROL': 'Perlu Kontrol'
  }
  return map[disposisi] || disposisi
}

const getPoliRate = (poli) => {
  const eligible = (poli.total || 0) - (poli.rujukan || 0) - (poli.tidak_perlu_kontrol || 0) - (poli.belum_pulang || 0)
  if (!eligible) return 0
  return Math.round((poli.patuh / eligible) * 100)
}

const getDokterRate = (dr) => {
  const eligible = (dr.total || 0) - (dr.rujukan || 0) - (dr.tidak_perlu_kontrol || 0) - (dr.belum_pulang || 0)
  if (!eligible) return 0
  return Math.round((dr.patuh / eligible) * 100)
}

const getRateColorClass = (rate) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 50) return 'bg-warning'
  return 'bg-danger'
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  return `${dateObj.getDate()} ${dateObj.toLocaleDateString('id-ID', { month: 'short' })}`
}

const getComplianceBadgeClass = (item) => {
  if (item.status_compliance === 'PATUH') return 'success'
  if (item.status_compliance === 'RUJUKAN') return 'info'
  if (item.status_compliance === 'TIDAK_PERLU_KONTROL') return 'cyan'
  if (item.status_compliance === 'BELUM_PULANG') return 'warning'
  if (item.status_ews === 'KRITIS_H1') return 'kritis'
  if (item.status_ews === 'WARNING_H0') return 'warning-h0'
  return 'danger'
}

const getComplianceBadgeIcon = (item) => {
  if (item.status_compliance === 'PATUH') return 'fas fa-check-circle me-1'
  if (item.status_compliance === 'RUJUKAN') return 'fas fa-external-link-alt me-1'
  if (item.status_compliance === 'TIDAK_PERLU_KONTROL') return 'fas fa-user-check me-1'
  if (item.status_compliance === 'BELUM_PULANG') return 'fas fa-bed me-1'
  if (item.status_ews === 'KRITIS_H1') return 'fas fa-exclamation-triangle me-1 animate-pulse'
  if (item.status_ews === 'WARNING_H0') return 'fas fa-clock me-1'
  if (item.status_ews === 'EXPIRED') return 'fas fa-ban me-1'
  return 'fas fa-times-circle me-1'
}

const getComplianceBadgeLabel = (item) => {
  if (item.status_compliance === 'PATUH') return 'Terbit SKU'
  if (item.status_compliance === 'RUJUKAN') return 'Rujukan'
  if (item.status_compliance === 'TIDAK_PERLU_KONTROL') return 'Bebas SKU'
  if (item.status_compliance === 'BELUM_PULANG') return 'Belum Pulang'
  if (item.status_ews === 'KRITIS_H1') return 'Kritis (H+1)'
  if (item.status_ews === 'WARNING_H0') return 'Warning (H-0)'
  if (item.status_ews === 'EXPIRED') return 'Hangus'
  return 'Belum Terbit'
}

// Export Excel
const exportToExcel = async () => {
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      jnspelayanan: filters.jnspelayanan,
      status: filters.status,
      limit: 2000
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas Excel...')
    const res = await kepatuhanSkuBpjsService.getDetails(params)
    const exportData = (res.data.response || res.data.data).data || []
    
    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const wsData = exportData.map((item, index) => ({
      'No': index + 1,
      'No. SEP': item.no_sep,
      'No. Rawat': item.no_rawat,
      'No. RM': item.nomr,
      'Nama Pasien': item.nama_pasien,
      'Diagnosa SEP': item.nmdiagnosaawal || '-',
      'Jenis Pelayanan': item.jnspelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan',
      'Poliklinik': item.nm_poli,
      'Dokter': item.nm_dokter,
      'Tanggal SEP': item.tglsep,
      'Tanggal Acuan': item.tgl_acuan || item.tglsep,
      'Batas Akhir (Deadline H+1)': item.tgl_deadline || '-',
      'Status EWS': item.status_ews === 'KRITIS_H1' ? 'KRITIS H+1 (Deadline Hari Ini)' : (item.status_ews === 'WARNING_H0' ? 'WARNING H-0' : (item.status_ews === 'EXPIRED' ? 'EXPIRED (Hangus)' : (item.status_ews || '-'))),
      'No. SKU / Rujukan': item.no_surat || item.no_rujukan || '-',
      'Disposisi Dokter (EMR)': formatDisposisiLabel(item.status_tindak_lanjut),
      'Catatan Dokter': item.catatan_dokter || '-',
      'Detail SKU / Rencana Kontrol / Rujukan': item.status_compliance === 'PATUH' 
        ? `Rencana: ${item.tgl_rencana}` 
        : (item.status_compliance === 'RUJUKAN' ? item.nm_ppkDirujuk : (item.status_compliance === 'TIDAK_PERLU_KONTROL' ? formatDisposisiLabel(item.status_tindak_lanjut) : (item.status_compliance === 'BELUM_PULANG' ? 'Masih Dirawat' : 'Belum Terbit SKU'))),
      'Status Kepatuhan': item.status_compliance === 'PATUH' 
        ? 'Terbit SKU (Patuh)' 
        : (item.status_compliance === 'RUJUKAN' ? 'Rujukan' : (item.status_compliance === 'TIDAK_PERLU_KONTROL' ? 'Bebas SKU (Selesai Pengobatan)' : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit (Tidak Patuh)')))
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Kepatuhan SKU BPJS")
    XLSX.writeFile(wb, `Laporan_Kepatuhan_SKU_BPJS_${filters.start_date}_sd_${filters.end_date}.xlsx`)
    toast.success('Excel berhasil di-download')
  } catch (error) {
    toast.error('Gagal mengekspor berkas Excel')
  }
}

// Export PDF
const exportToPDF = async () => {
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      jnspelayanan: filters.jnspelayanan,
      status: filters.status,
      limit: 500
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas PDF...')
    const res = await kepatuhanSkuBpjsService.getDetails(params)
    const exportData = (res.data.response || res.data.data).data || []

    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width || 210
    const pageHeight = doc.internal.pageSize.height || 297

    const kopHeaderImg = await loadImage(pdfHeader)
    const kopFooterImg = await loadImage(pdfFooter)

    const kopH = 28
    if (kopHeaderImg) {
      doc.addImage(kopHeaderImg, 'PNG', 0, 0, pageWidth, kopH)
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(33, 37, 41)
    doc.text('LAPORAN KEPATUHAN PENERBITAN SKU BPJS', pageWidth / 2, kopH + 10, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`Periode Laporan: ${formatDateOnly(filters.start_date)} s.d. ${formatDateOnly(filters.end_date)}`, pageWidth / 2, kopH + 15, { align: 'center' })

    const tableData = exportData.map((item, index) => [
      index + 1,
      item.no_sep,
      item.nama_pasien + (item.nmdiagnosaawal ? `\n(Diag: ${item.nmdiagnosaawal})` : ''),
      item.jnspelayanan === '1' ? 'Inap' : 'Jalan',
      item.nm_poli,
      item.nm_dokter,
      item.status_compliance === 'PATUH' 
        ? `${item.no_surat} (${formatDateOnly(item.tgl_rencana)})` 
        : (item.status_compliance === 'RUJUKAN' ? `Rujukan: ${item.nm_ppkDirujuk}` : (item.status_compliance === 'TIDAK_PERLU_KONTROL' ? formatDisposisiLabel(item.status_tindak_lanjut) : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit SKU'))),
      item.tgl_deadline ? formatDateOnly(item.tgl_deadline) : '-',
      item.status_ews === 'KRITIS_H1' ? 'KRITIS H+1' : (item.status_ews === 'WARNING_H0' ? 'H-0' : (item.status_compliance === 'PATUH' ? 'Terbit' : (item.status_compliance === 'RUJUKAN' ? 'Rujukan' : (item.status_compliance === 'TIDAK_PERLU_KONTROL' ? 'Bebas SKU' : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit')))))
    ])

    autoTable(doc, {
      startY: kopH + 22,
      head: [['No', 'No. SEP', 'Nama Pasien', 'Layanan', 'Poli/Unit', 'Dokter', 'Keterangan SKU / Rujukan', 'Batas H+1', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 7 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 14 },
        4: { cellWidth: 18 },
        5: { cellWidth: 25 },
        6: { cellWidth: 35 },
        7: { cellWidth: 20 },
        8: { cellWidth: 17 }
      },
      margin: { top: kopH + 22, bottom: 20 },
      didDrawPage: (data) => {
        if (kopFooterImg) {
          doc.addImage(kopFooterImg, 'PNG', 0, pageHeight - 16, pageWidth, 16)
        }
        
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`, 
          pageWidth - 20, 
          pageHeight - 8, 
          { align: 'right' }
        )
      }
    })

    doc.save(`Kepatuhan_SKU_BPJS_${filters.start_date}_sd_${filters.end_date}.pdf`)
    toast.success('PDF berhasil di-download')
  } catch (error) {
    console.error(error)
    toast.error('Gagal mengekspor berkas PDF')
  }
}

onMounted(() => {
  loadFilterOptions()
  fetchData(1)
})
</script>

<style scoped>
.kepatuhan-sku-bpjs-view {
  font-family: 'Outfit', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-size: 1.4rem;
}

.page-title {
  font-weight: 800;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
}

.panel-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.premium-input-date, .premium-select-filter, .premium-input-search {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
  outline: none;
  transition: all 0.2s ease;
  height: 34px;
}

.premium-input-date {
  width: 130px !important;
}

.premium-select-filter {
  width: 155px !important;
}

.premium-input-search {
  width: 185px !important;
}

.premium-input-date:focus, .premium-select-filter:focus, .premium-input-search:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn-export-excel, .btn-export-pdf {
  height: 34px;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-export-excel {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.btn-export-excel:hover {
  background-color: #059669;
  color: #ffffff;
}

.btn-export-pdf {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.btn-export-pdf:hover {
  background-color: #dc2626;
  color: #ffffff;
}

/* KPI Card */
.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
}

.kpi-body {
  min-height: 112px;
}

.kpi-card:hover {
  transform: translateY(-3px);
}

.kpi-primary { border-left: 5px solid #3b82f6 !important; }
.kpi-warning { border-left: 5px solid #f59e0b !important; }
.kpi-success { border-left: 5px solid #10b981 !important; }
.kpi-danger { border-left: 5px solid #ef4444 !important; }
.kpi-cyan { border-left: 5px solid #06b6d4 !important; }
.kpi-sky { border-left: 5px solid #0ea5e9 !important; }
.kpi-teal { border-left: 5px solid #0d9488 !important; }

.kpi-primary:hover { box-shadow: 0 12px 24px rgba(59, 130, 246, 0.1) !important; }
.kpi-warning:hover { box-shadow: 0 12px 24px rgba(245, 158, 11, 0.1) !important; }
.kpi-success:hover { box-shadow: 0 12px 24px rgba(16, 185, 129, 0.1) !important; }
.kpi-danger:hover { box-shadow: 0 12px 24px rgba(239, 68, 68, 0.1) !important; }
.kpi-cyan:hover { box-shadow: 0 12px 24px rgba(6, 182, 212, 0.1) !important; }
.kpi-sky:hover { box-shadow: 0 12px 24px rgba(14, 165, 233, 0.1) !important; }
.kpi-teal:hover { box-shadow: 0 12px 24px rgba(13, 148, 136, 0.1) !important; }

.kpi-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.bg-primary-light { background-color: #eff6ff; }
.bg-warning-light { background-color: #fffbeb; }
.bg-success-light { background-color: #ecfdf5; }
.bg-danger-light { background-color: #fef2f2; }
.bg-cyan-light { background-color: #ecfeff; }
.bg-info-light { background-color: #f0f9ff; }
.bg-teal-light { background-color: #f0fdfa; }
.text-cyan { color: #0891b2 !important; }
.text-teal { color: #0d9488; }
.bg-teal { background-color: #0d9488; }

.kpi-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b !important;
  display: block;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Rankings list */
.scrollable-ranking {
  max-height: 240px;
  overflow-y: auto;
}

/* Table Style */
.table-light-header th {
  background-color: #f8fafc !important;
  color: #475569 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid #e2e8f0 !important;
  padding: 12px 14px !important;
}

.table-row {
  transition: all 0.2s ease;
}
.table-row:hover {
  background-color: #f8fafc !important;
}

.badge-pelayanan {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}
.badge-pelayanan.ranap {
  background-color: #f5f3ff;
  color: #6d28d9;
}
.badge-pelayanan.ralan {
  background-color: #f0fdf4;
  color: #15803d;
}

.compliance-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}
.compliance-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}
.compliance-badge.info {
  background-color: #dbeafe;
  color: #1e40af;
}
.compliance-badge.cyan {
  background-color: #cffafe;
  color: #0e7490;
}
.compliance-badge.danger {
  background-color: #fee2e2;
  color: #991b1b;
}
.compliance-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 0.8rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-page {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page:not(:disabled):hover {
  background-color: #f1f5f9;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.btn-page-number {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: transparent;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page-number.active {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-page-number:not(.active):hover {
  background-color: #f1f5f9;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .kepatuhan-sku-bpjs-view {
    padding: 0 !important;
    width: 100% !important;
  }
  .page-header {
    padding: 1rem 0.85rem !important;
    border-radius: 12px !important;
    margin-bottom: 0.75rem !important;
  }
  .page-title {
    font-size: 1.15rem !important;
  }
  .panel-card, .ews-radar-card, .table-card {
    border-radius: 12px !important;
    margin-bottom: 0.75rem !important;
    width: 100% !important;
  }
  .panel-card .card-body,
  .ews-radar-card .card-body,
  .table-card .card-body {
    padding: 12px 10px !important;
  }
  .ews-radar-card h5 {
    font-size: 0.95rem !important;
  }
  .w-100-mobile {
    width: 100% !important;
    flex-direction: column;
    align-items: stretch !important;
  }
  .premium-input-date, .premium-select-filter, .premium-input-search, .btn-export-excel, .btn-export-pdf {
    width: 100% !important;
  }
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
}

/* EWS Radar Card Styles */
.ews-radar-card {
  background: linear-gradient(135deg, #ffffff 0%, #fff7f7 100%);
  border: 1px solid #fee2e2 !important;
  border-radius: 14px;
}

.ews-radar-dot {
  width: 10px;
  height: 10px;
  background-color: #ef4444;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.ews-box {
  background-color: #ffffff;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ews-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.ews-box-danger {
  border-color: #fecaca;
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
}

.ews-box-danger.active-filter {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.ews-box-warning {
  border-color: #fef08a;
  background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
}

.ews-box-warning.active-filter {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.ews-box-secondary {
  border-color: #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.ews-box-secondary.active-filter {
  border-color: #64748b;
  box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.2);
}

.ews-count-badge {
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1;
}

.animate-pulse {
  animation: pulse-icon 1.2s infinite ease-in-out;
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}

.animate-pulse-badge {
  animation: badge-glow 1.5s infinite alternate;
}

@keyframes badge-glow {
  0% { box-shadow: 0 0 3px rgba(239, 68, 68, 0.5); }
  100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.85); }
}

.compliance-badge.kritis {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  font-weight: 700;
}

.compliance-badge.warning-h0 {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
  font-weight: 600;
}

/* EWS Card Action Buttons */
.ews-btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.ews-btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

.ews-btn-action:active {
  transform: translateY(0);
}

.ews-btn-action .transition-arrow {
  transition: transform 0.2s ease;
}

.ews-btn-action:hover .transition-arrow {
  transform: translateY(2px);
}

/* Kritis button styling */
.ews-btn-kritis {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

.ews-btn-kritis:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #ef4444;
}

.ews-btn-kritis.is-active {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-color: #dc2626;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
}

/* Warning button styling */
.ews-btn-warning {
  background: #fffbeb;
  color: #b45309;
  border-color: #fcd34d;
}

.ews-btn-warning:hover {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.ews-btn-warning.is-active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border-color: #d97706;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
}

/* Secondary button styling */
.ews-btn-secondary {
  background: #f8fafc;
  color: #475569;
  border-color: #cbd5e1;
}

.ews-btn-secondary:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #94a3b8;
}

.ews-btn-secondary.is-active {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #ffffff;
  border-color: #475569;
  box-shadow: 0 4px 14px rgba(71, 85, 105, 0.4);
}

/* Highlight animation when table is focused */
.transition-table-header {
  transition: all 0.3s ease;
  scroll-margin-top: 24px;
}

.table-section-focused {
  animation: tableGlow 1.4s ease-in-out;
}

@keyframes tableGlow {
  0% {
    background-color: transparent;
  }
  30% {
    background-color: rgba(37, 99, 235, 0.08);
    border-radius: 8px;
    padding-left: 12px;
    padding-right: 12px;
  }
  100% {
    background-color: transparent;
  }
}
</style>
