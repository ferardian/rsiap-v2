<template>
  <div class="preskripsi-dpjp-page p-3 p-md-4">
    <!-- Page Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title m-0">💊 Laporan Preskripsi DPJP</h1>
        <p class="page-subtitle text-muted m-0 mt-1">
          Monitoring tren & rekapitulasi penggunaan obat oleh Dokter DPJP (Spesialis & Umum)
        </p>
      </div>
      <div class="header-actions d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary rounded-3 px-3 shadow-sm text-nowrap" @click="resetFilters" :disabled="loading">
          <i class="fas fa-undo me-1"></i> Reset
        </button>
        <button class="btn btn-sm btn-primary rounded-3 px-3 shadow-sm text-nowrap" @click="fetchAllData" :disabled="loading">
          <i class="fas me-1" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i> Refresh Data
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="filter-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3 align-items-end">
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Mulai</label>
            <input type="date" class="form-control rounded-3 shadow-none" v-model="filters.tgl_awal" @change="fetchAllData">
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Akhir</label>
            <input type="date" class="form-control rounded-3 shadow-none" v-model="filters.tgl_akhir" @change="fetchAllData">
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Spesialisasi</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.kd_sps" @change="onSpesialisChange">
              <option value="all">Semua Spesialisasi</option>
              <option v-for="sps in attributes.spesialis" :key="sps.kd_sps" :value="sps.kd_sps">
                {{ sps.nm_sps }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-2-5">
            <label class="form-label text-muted small fw-bold mb-1">Dokter DPJP</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.kd_dokter" @change="fetchAllData">
              <option value="all">Semua Dokter DPJP</option>
              <option v-for="dok in filteredDokterList" :key="dok.kd_dokter" :value="dok.kd_dokter">
                {{ dok.nm_dokter }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-1-5">
            <label class="form-label text-muted small fw-bold mb-1">Layanan</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.status_lanjut" @change="fetchAllData">
              <option value="all">Semua</option>
              <option value="Ralan">Rawat Jalan</option>
              <option value="Ranap">Rawat Inap</option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Cara Bayar</label>
            <select class="form-select rounded-3 shadow-none" v-model="filters.kd_pj" @change="fetchAllData">
              <option value="all">Semua Penjab</option>
              <option v-for="pj in attributes.penjab" :key="pj.kd_pj" :value="pj.kd_pj">
                {{ pj.png_jawab }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading && !dataLoaded" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-bold">Memuat data preskripsi obat DPJP...</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Summary KPI Cards -->
      <div class="row g-3 mb-3">
        <!-- 1. Total Preskripsi -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Resep</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(analytics.kpi.total_resep) }}</h3>
              <span class="text-muted small">resep</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-file-prescription me-1 text-primary"></i>Lembar Resep Dilayani
            </small>
          </div>
        </div>

        <!-- 2. Total Item Obat -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Qty Item</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(analytics.kpi.total_qty) }}</h3>
              <span class="text-muted small">item</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-pills me-1 text-success"></i>Obat Diserahkan
            </small>
          </div>
        </div>

        <!-- 3. Total Pasien -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-info">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Pasien</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(analytics.kpi.total_pasien) }}</h3>
              <span class="text-muted small">pasien</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-user-injured me-1 text-info"></i>Pasien Menerima Resep
            </small>
          </div>
        </div>

        <!-- 4. Avg Jenis Obat / Pasien -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Avg Jenis Obat / Pasien</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ analytics.kpi.avg_item_per_pasien || '0' }}</h3>
              <span class="text-muted small">jenis/pasien</span>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-pills me-1 text-warning"></i>Avg Qty Fisik: {{ analytics.kpi.avg_qty_per_pasien || '0' }} pcs/pasien
            </small>
          </div>
        </div>
      </div>

      <!-- Financial & Claim Comparison KPI Cards -->
      <div class="row g-3 mb-4">
        <!-- 5. Total Nominal Biaya Obat -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Nominal Obat</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark fs-5">{{ formatRupiah(analytics.kpi.total_nominal) }}</h3>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-money-bill-wave me-1 text-danger"></i>Nilai Penggunaan Obat
            </small>
          </div>
        </div>

        <!-- 6. Avg Biaya Obat / Pasien -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-purple">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Avg Biaya / Pasien</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark fs-5">{{ formatRupiah(analytics.kpi.avg_nominal_per_pasien) }}</h3>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-calculator me-1 text-purple"></i>Rata-rata Harga Obat/Pasien
            </small>
          </div>
        </div>

        <!-- 7. Avg Nilai Klaim / Pasien -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Avg Klaim / Pasien</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark fs-5">{{ formatRupiah(analytics.kpi.avg_klaim_per_pasien) }}</h3>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-file-invoice-dollar me-1 text-primary"></i>Rata-rata Klaim INA-CBG
            </small>
          </div>
        </div>

        <!-- 8. Rasio Biaya Obat vs Klaim -->
        <div class="col-6 col-md-3 col-xl-3">
          <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-teal">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Rasio Obat vs Klaim</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark fs-5">{{ analytics.kpi.rasio_obat_vs_klaim }}%</h3>
            </div>
            <small class="text-muted text-xs mt-2 d-block">
              <i class="fas fa-percentage me-1 text-teal"></i>% Biaya Obat dari Klaim
            </small>
          </div>
        </div>
      </div>

      <!-- Detailed Claim Comparison Banner -->
      <div v-if="analytics.kpi.avg_klaim_per_pasien > 0" class="card border-0 shadow-sm rounded-4 mb-4 claim-banner border-start border-4 border-info">
        <div class="card-body p-3 p-md-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="claim-icon-wrapper rounded-3 p-3 text-white bg-primary shadow-sm">
                <i class="fas fa-balance-scale-right fa-2x"></i>
              </div>
              <div>
                <h6 class="fw-bold m-0 text-dark">📊 Analisis Perbandingan Biaya Obat vs Nilai Klaim (BPJS / INA-CBG)</h6>
                <p class="text-muted small m-0 mt-1">
                  Rata-rata Biaya Obat: <strong class="text-dark">{{ formatRupiah(analytics.kpi.avg_nominal_per_pasien) }}</strong> / pasien
                  <span class="mx-2">•</span>
                  Rata-rata Nilai Klaim: <strong class="text-dark">{{ formatRupiah(analytics.kpi.avg_klaim_per_pasien) }}</strong> / pasien
                  <span class="mx-2">•</span>
                  Total Klaim: <strong class="text-dark">{{ formatRupiah(analytics.kpi.total_klaim) }}</strong> ({{ formatNumber(analytics.kpi.total_pasien_klaim) }} Pasien SEP)
                </p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div class="text-end">
                <span class="badge rounded-pill px-3 py-2 fs-6 fw-bold shadow-sm" :class="claimRatioBadgeClass">
                  Rasio: {{ analytics.kpi.rasio_obat_vs_klaim }}%
                </span>
                <small class="d-block text-muted text-xs mt-1">Proporsi Obat dari Nilai Klaim</small>
              </div>
            </div>
          </div>
          <!-- Progress bar comparison -->
          <div class="progress mt-3 rounded-pill" style="height: 8px; background-color: #e9ecef;">
            <div 
              class="progress-bar rounded-pill transition-all" 
              :class="claimRatioProgressBarClass"
              role="progressbar" 
              :style="{ width: Math.min(analytics.kpi.rasio_obat_vs_klaim, 100) + '%' }" 
              :aria-valuenow="analytics.kpi.rasio_obat_vs_klaim" 
              aria-valuemin="0" 
              aria-valuemax="100">
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Visual Analytics Section -->
      <div class="row g-3 mb-4">
        <!-- 1. Top 10 Preskripsi DPJP -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
              <h6 class="fw-bold text-dark m-0">👨‍⚕️ Top 10 DPJP Preskripsi</h6>
              <span class="badge bg-soft-primary text-primary px-2 py-1">Volume & Rp</span>
            </div>
            <div class="card-body p-4 pt-2">
              <div v-if="analytics.top_dpjp.length === 0" class="text-center py-4 text-muted small">
                Tidak ada data DPJP
              </div>
              <div v-else class="list-group list-group-flush gap-2">
                <div 
                  v-for="(dok, idx) in analytics.top_dpjp" 
                  :key="dok.kd_dokter"
                  class="p-2.5 rounded-3 bg-light d-flex align-items-center justify-content-between"
                >
                  <div class="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                    <span class="badge rounded-circle bg-primary text-white flex-shrink-0" style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">
                      {{ idx + 1 }}
                    </span>
                    <div class="text-truncate">
                      <h6 class="m-0 text-dark fw-bold text-truncate small">{{ dok.nm_dokter }}</h6>
                      <span class="text-muted text-xs d-block">{{ dok.nm_sps }}</span>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <span class="fw-bold text-primary d-block small">{{ formatNumber(dok.total_qty) }} <small class="text-muted">item</small></span>
                    <span class="text-muted text-xs">{{ formatRupiah(dok.total_nominal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Top 10 Obat Terbanyak (Volume) -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
              <h6 class="fw-bold text-dark m-0">💊 Top 10 Obat Terbanyak (Qty)</h6>
              <span class="badge bg-soft-success text-success px-2 py-1">Paling Laris</span>
            </div>
            <div class="card-body p-4 pt-2">
              <div v-if="analytics.top_obat.length === 0" class="text-center py-4 text-muted small">
                Tidak ada data obat
              </div>
              <div v-else class="list-group list-group-flush gap-2">
                <div 
                  v-for="(obat, idx) in analytics.top_obat" 
                  :key="obat.kode_brng"
                  class="p-2.5 rounded-3 bg-light d-flex align-items-center justify-content-between"
                >
                  <div class="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                    <span class="badge rounded-circle bg-success text-white flex-shrink-0" style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">
                      {{ idx + 1 }}
                    </span>
                    <div class="text-truncate">
                      <h6 class="m-0 text-dark fw-bold text-truncate small">{{ obat.nama_brng }}</h6>
                      <span class="badge bg-secondary-subtle text-secondary text-xs mt-0.5">{{ obat.nama_kategori }}</span>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <span class="fw-bold text-success d-block small">{{ formatNumber(obat.total_qty) }} <small class="text-muted">qty</small></span>
                    <span class="text-muted text-xs">{{ formatRupiah(obat.total_nominal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Top 10 Obat Termahal (Harga Satuan Unit) -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 border-top border-4 border-warning">
            <div class="card-header bg-transparent border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
              <h6 class="fw-bold text-dark m-0">💎 Top 10 Obat Termahal (Harga/Satuan)</h6>
              <span class="badge bg-soft-warning text-warning px-2 py-1">High Unit Price</span>
            </div>
            <div class="card-body p-4 pt-2">
              <div v-if="!analytics.top_obat_termahal || analytics.top_obat_termahal.length === 0" class="text-center py-4 text-muted small">
                Tidak ada data obat termahal
              </div>
              <div v-else class="list-group list-group-flush gap-2">
                <div 
                  v-for="(obat, idx) in analytics.top_obat_termahal" 
                  :key="obat.kode_brng + '-termahal'"
                  class="p-2.5 rounded-3 bg-light d-flex align-items-center justify-content-between"
                >
                  <div class="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                    <span class="badge rounded-circle bg-warning text-dark flex-shrink-0 fw-bold" style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">
                      {{ idx + 1 }}
                    </span>
                    <div class="text-truncate">
                      <h6 class="m-0 text-dark fw-bold text-truncate small">{{ obat.nama_brng }}</h6>
                      <span class="badge bg-warning-subtle text-warning-emphasis text-xs mt-0.5">{{ obat.nama_kategori }}</span>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <span class="fw-bold text-danger d-block small">{{ formatRupiah(obat.harga_satuan) }}<small class="text-muted">/satuan</small></span>
                    <span class="text-muted text-xs">Total: {{ formatNumber(obat.total_qty) }} Qty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-transparent border-0 pt-4 px-4 pb-2">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h5 class="fw-bold text-dark m-0">📋 Rincian Preskripsi Obat per DPJP</h5>
              <p class="text-muted small m-0 mt-0.5">Menampilkan agregat jumlah, harga satuan, dan nominal obat yang diresepkan oleh DPJP</p>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <!-- Sort By Control -->
              <div class="d-flex align-items-center gap-1.5 bg-light px-2.5 py-1 rounded-3 border">
                <span class="text-muted text-xs font-semibold me-1"><i class="fas fa-sort me-1"></i>Urutkan:</span>
                <select 
                  class="form-select form-select-sm border-0 bg-transparent shadow-none p-0 fw-bold text-dark text-xs" 
                  v-model="filters.order_by"
                  @change="fetchTableData(1)"
                  style="width: auto; cursor: pointer;"
                >
                  <option value="total_qty">Jumlah Item (Qty)</option>
                  <option value="harga_satuan">Harga Satuan (Termahal)</option>
                  <option value="total_nominal">Total Nominal (Biaya Terbesar)</option>
                  <option value="frekuensi_resep">Frekuensi Resep</option>
                </select>
              </div>

              <!-- Search Input -->
              <div class="search-box position-relative" style="width: 240px;">
                <i class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input 
                  type="text" 
                  class="form-control ps-5 rounded-3 shadow-none border-1" 
                  placeholder="Cari DPJP / Obat..."
                  v-model="filters.search"
                  @input="debounceSearch"
                >
              </div>
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive compact-scroll" style="max-height: 540px;">
            <table class="table table-hover align-middle m-0 table-compact">
              <thead class="table-light sticky-top shadow-sm">
                <tr>
                  <th class="ps-4 text-center" style="width: 50px;">#</th>
                  <th>DOKTER DPJP</th>
                  <th>SPESIALISASI</th>
                  <th>NAMA OBAT</th>
                  <th>KATEGORI</th>
                  <th class="text-end">HARGA SATUAN</th>
                  <th class="text-center">TOTAL QTY</th>
                  <th class="text-center">FREKUENSI RESEP</th>
                  <th class="text-end pe-4">TOTAL NOMINAL (RP)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="tableLoading">
                  <td colspan="9" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span class="text-muted fw-bold">Memuat rincian tabel...</span>
                  </td>
                </tr>
                <tr v-else-if="items.length === 0">
                  <td colspan="9" class="text-center py-5 text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                    Tidak ada data preskripsi obat yang cocok dengan filter.
                  </td>
                </tr>
                <tr v-else v-for="(row, idx) in items" :key="row.kd_dokter + '-' + row.kode_brng">
                  <td class="ps-4 text-center text-muted small fw-bold">
                    {{ (pagination.current_page - 1) * pagination.per_page + idx + 1 }}
                  </td>
                  <td>
                    <span class="fw-bold text-dark d-block">{{ row.nm_dokter }}</span>
                    <small class="text-muted text-xs">ID: {{ row.kd_dokter }}</small>
                  </td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary fw-semibold">
                      {{ row.nm_sps }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-bold text-dark d-block">{{ row.nama_brng }}</span>
                    <small class="text-muted text-xs">Kode: {{ row.kode_brng }}</small>
                  </td>
                  <td>
                    <div class="d-flex flex-column gap-1">
                      <span class="badge bg-secondary-subtle text-secondary w-fit text-xs">{{ row.nama_kategori }}</span>
                      <span class="text-muted text-xs" v-if="row.nama_golongan !== 'Lainnya'">Gol: {{ row.nama_golongan }}</span>
                    </div>
                  </td>
                  <td class="text-end fw-semibold text-muted">
                    {{ formatRupiah(row.harga_satuan) }}
                  </td>
                  <td class="text-center fw-bold text-dark">
                    {{ formatNumber(row.total_qty) }}
                  </td>
                  <td class="text-center">
                    <span class="badge bg-info-subtle text-info fw-bold">
                      {{ row.frekuensi_resep }} Resep
                    </span>
                  </td>
                  <td class="text-end pe-4 fw-bold text-dark">
                    {{ formatRupiah(row.total_nominal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-3" v-if="pagination.total > 0">
            <div class="text-muted small">
              Menampilkan <span class="fw-bold text-dark">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
              s/d <span class="fw-bold text-dark">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
              dari <span class="fw-bold text-dark">{{ pagination.total }}</span> baris
            </div>
            <div class="d-flex align-items-center gap-2">
              <select class="form-select form-select-sm rounded-3 shadow-none border-1" v-model="pagination.per_page" @change="changePerPage" style="width: 80px;">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm m-0">
                  <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                    <button class="page-link rounded-start-3" @click="changePage(pagination.current_page - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  <li 
                    v-for="p in visiblePages" 
                    :key="p" 
                    class="page-item" 
                    :class="{ active: p === pagination.current_page, disabled: p === '...' }"
                  >
                    <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                    <button class="page-link rounded-end-3" @click="changePage(pagination.current_page + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PreskripsiDpjpView',
  data() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')

    return {
      loading: true,
      tableLoading: false,
      dataLoaded: false,
      searchTimeout: null,
      filters: {
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        kd_sps: 'all',
        kd_dokter: 'all',
        status_lanjut: 'all',
        kd_pj: 'all',
        search: '',
        order_by: 'total_qty',
        order_dir: 'desc'
      },
      attributes: {
        spesialis: [],
        dokter: [],
        penjab: []
      },
      analytics: {
        kpi: {
          total_resep: 0,
          total_pasien: 0,
          total_dpjp: 0,
          total_item_resep: 0,
          total_qty: 0,
          total_nominal: 0,
          avg_item_per_pasien: 0,
          avg_qty_per_pasien: 0,
          avg_item_per_resep: 0,
          avg_obat_per_pasien: 0,
          avg_nominal_per_pasien: 0,
          avg_nominal_per_resep: 0,
          total_klaim: 0,
          total_pasien_klaim: 0,
          total_sep_klaim: 0,
          avg_klaim_per_pasien: 0,
          rasio_obat_vs_klaim: 0
        },
        top_obat: [],
        top_obat_termahal: [],
        top_dpjp: [],
        by_spesialis: [],
        by_kategori: []
      },
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      }
    }
  },
  computed: {
    filteredDokterList() {
      if (this.filters.kd_sps === 'all' || !this.filters.kd_sps) {
        return this.attributes.dokter
      }
      return this.attributes.dokter.filter(d => d.kd_sps === this.filters.kd_sps)
    },
    visiblePages() {
      const pages = []
      const current = this.pagination.current_page
      const last = this.pagination.last_page

      if (last <= 7) {
        for (let i = 1; i <= last; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        
        const start = Math.max(2, current - 1)
        const end = Math.min(last - 1, current + 1)
        
        for (let i = start; i <= end; i++) pages.push(i)
        
        if (current < last - 2) pages.push('...')
        pages.push(last)
      }
      return pages
    },
    claimRatioBadgeClass() {
      const r = this.analytics.kpi.rasio_obat_vs_klaim || 0
      if (r <= 25) return 'bg-success-subtle text-success border border-success'
      if (r <= 40) return 'bg-warning-subtle text-warning border border-warning'
      return 'bg-danger-subtle text-danger border border-danger'
    },
    claimRatioProgressBarClass() {
      const r = this.analytics.kpi.rasio_obat_vs_klaim || 0
      if (r <= 25) return 'bg-success'
      if (r <= 40) return 'bg-warning'
      return 'bg-danger'
    }
  },
  mounted() {
    this.fetchAttributes()
    this.fetchAllData()
  },
  methods: {
    async fetchAttributes() {
      try {
        const res = await api.get('/laporan/preskripsi-dpjp/attributes')
        if (res.data.success) {
          this.attributes = res.data.data
        }
      } catch (err) {
        console.error('Error fetching attributes:', err)
      }
    },
    async fetchAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchAnalytics(),
          this.fetchTableData(1)
        ])
        this.dataLoaded = true
      } catch (err) {
        console.error('Error fetching preskripsi data:', err)
      } finally {
        this.loading = false
      }
    },
    async fetchAnalytics() {
      try {
        const params = {
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir,
          kd_sps: this.filters.kd_sps,
          kd_dokter: this.filters.kd_dokter,
          status_lanjut: this.filters.status_lanjut,
          kd_pj: this.filters.kd_pj
        }
        const res = await api.get('/laporan/preskripsi-dpjp/analytics', { params })
        if (res.data.success) {
          this.analytics = res.data.data
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      }
    },
    async fetchTableData(page = 1) {
      this.tableLoading = true
      try {
        const params = {
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir,
          kd_sps: this.filters.kd_sps,
          kd_dokter: this.filters.kd_dokter,
          status_lanjut: this.filters.status_lanjut,
          kd_pj: this.filters.kd_pj,
          search: this.filters.search,
          order_by: this.filters.order_by,
          order_dir: this.filters.order_dir,
          page: page,
          per_page: this.pagination.per_page
        }
        const res = await api.get('/laporan/preskripsi-dpjp', { params })
        if (res.data.success) {
          this.items = res.data.data
          if (res.data.meta) {
            this.pagination.current_page = res.data.meta.current_page || 1
            this.pagination.last_page = res.data.meta.last_page || 1
            this.pagination.per_page = res.data.meta.per_page || 20
            this.pagination.total = res.data.meta.total || 0
          }
        }
      } catch (err) {
        console.error('Error fetching table data:', err)
      } finally {
        this.tableLoading = false
      }
    },
    onSpesialisChange() {
      this.filters.kd_dokter = 'all'
      this.fetchAllData()
    },
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.fetchTableData(1)
      }, 400)
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchTableData(page)
      }
    },
    changePerPage() {
      this.fetchTableData(1)
    },
    resetFilters() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      this.filters = {
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        kd_sps: 'all',
        kd_dokter: 'all',
        status_lanjut: 'all',
        kd_pj: 'all',
        search: '',
        order_by: 'total_qty',
        order_dir: 'desc'
      }
      this.fetchAllData()
    },
    formatNumber(val) {
      if (val === null || val === undefined) return '0'
      return new Intl.NumberFormat('id-ID').format(val)
    },
    formatRupiah(val) {
      if (val === null || val === undefined) return 'Rp 0'
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(val)
    }
  }
}
</script>

<style scoped>
.preskripsi-dpjp-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.col-lg-1-5 {
  flex: 0 0 auto;
  width: 12.5%;
}

.col-lg-2-5 {
  flex: 0 0 auto;
  width: 20.833333%;
}

@media (max-width: 992px) {
  .col-lg-1-5, .col-lg-2-5 {
    width: 50%;
  }
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.compact-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.compact-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.compact-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.compact-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.table-compact th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  padding: 0.75rem 0.75rem;
  white-space: nowrap;
}

.table-compact td {
  padding: 0.6rem 0.75rem;
  font-size: 0.825rem;
}

.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-soft-success {
  background-color: rgba(25, 135, 84, 0.1);
}

.bg-soft-warning {
  background-color: rgba(255, 193, 7, 0.15);
}

.border-purple {
  border-color: #8b5cf6 !important;
}

.text-purple {
  color: #8b5cf6 !important;
}

.border-teal {
  border-color: #0d9488 !important;
}

.text-teal {
  color: #0d9488 !important;
}

.claim-banner {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.transition-all {
  transition: all 0.3s ease;
}

.text-xs {
  font-size: 0.725rem;
}

.w-fit {
  width: fit-content;
}
</style>
