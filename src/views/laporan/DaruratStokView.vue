<template>
  <div class="darurat-stok-page">
    <!-- Page Header (Screen only) -->
    <div class="page-header d-print-none">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fs-7 fw-semibold">
              <i class="fas fa-exclamation-triangle me-1"></i> Inventory Alert
            </span>
            <span class="text-muted small">Instalasi Farmasi RSIA Aisyiyah Pekajangan</span>
          </div>
          <h1 class="page-title mb-1">🚨 Monitoring Kekosongan & Darurat Stok Obat</h1>
          <p class="page-subtitle text-muted mb-0">
            Deteksi dini kekosongan stok (Stok = 0) dan stok menipis (Stok &le; Stok Minimal) di seluruh depo/bangsal
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary" @click="fetchData(pagination.current_page)" :disabled="loading" title="Muat Ulang Data">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span class="d-none d-sm-inline ms-1">Refresh</span>
          </button>
          <button class="btn btn-outline-primary" @click="printReport" :disabled="loading" title="Cetak Laporan">
            <i class="fas fa-print me-1"></i>
            <span class="d-none d-sm-inline">Cetak</span>
          </button>
          <button class="btn btn-success" @click="exportExcel" :disabled="loadingExport" title="Export Excel">
            <span v-if="loadingExport" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="fas fa-file-excel me-1"></i>
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Print Header (Visible only on print) -->
    <div class="d-none d-print-block print-header mb-4">
      <div class="text-center border-bottom pb-3">
        <h3 class="fw-bold mb-1">RSIA AISYIYAH PEKAJANGAN</h3>
        <p class="mb-1 small">Jl. Raya Pekajangan No. 610, Pekalongan, Jawa Tengah</p>
        <h4 class="fw-bold mt-3 mb-1 text-uppercase">LAPORAN MONITORING KEKOSONGAN & DARURAT STOK OBAT / BHP</h4>
        <div class="small text-muted">
          <span>Filter Status: <strong>{{ getStatusLabel(filters.status) }}</strong></span> | 
          <span>Lokasi: <strong>{{ getBangsalLabel(filters.kd_bangsal) }}</strong></span> | 
          <span>Dicetak pada: <strong>{{ currentDateTime }}</strong></span>
        </div>
      </div>
    </div>

    <!-- KPI Summary Cards (Screen only) -->
    <div class="row g-3 mb-4 d-print-none">
      <!-- Card: Total Kosong -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div 
          class="card kpi-card border-0 shadow-sm h-100 cursor-pointer" 
          :class="{ 'active-card-danger': filters.status === 'kosong' }"
          @click="selectStatusFilter('kosong')"
        >
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted small fw-medium text-uppercase">Stok Habis / Kosong</span>
                <h3 class="fw-bold text-danger mt-1 mb-0">{{ formatNumber(summary.total_kosong) }}</h3>
                <small class="text-muted">Total item dengan stok = 0</small>
              </div>
              <div class="kpi-icon-badge bg-danger-subtle text-danger">
                <i class="fas fa-boxes-packing fs-4"></i>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
              <span class="badge bg-danger">Prioritas Kritis</span>
              <span class="small text-muted">
                {{ calculatePercentage(summary.total_kosong, summary.total_item) }}% dr total
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Stok Kritis -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div 
          class="card kpi-card border-0 shadow-sm h-100 cursor-pointer"
          :class="{ 'active-card-warning': filters.status === 'kritis' }"
          @click="selectStatusFilter('kritis')"
        >
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted small fw-medium text-uppercase">Stok Kritis (&le; Min)</span>
                <h3 class="fw-bold text-warning-emphasis mt-1 mb-0">{{ formatNumber(summary.total_kritis) }}</h3>
                <small class="text-muted">Stok &gt; 0 tapi &le; Minimal</small>
              </div>
              <div class="kpi-icon-badge bg-warning-subtle text-warning">
                <i class="fas fa-triangle-exclamation fs-4"></i>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
              <span class="badge bg-warning text-dark">Perlu Restock</span>
              <span class="small text-muted">
                {{ calculatePercentage(summary.total_kritis, summary.total_item) }}% dr total
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Total Item Darurat -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div 
          class="card kpi-card border-0 shadow-sm h-100 cursor-pointer"
          :class="{ 'active-card-primary': filters.status === 'all_darurat' }"
          @click="selectStatusFilter('all_darurat')"
        >
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted small fw-medium text-uppercase">Total Item Darurat</span>
                <h3 class="fw-bold text-primary mt-1 mb-0">{{ formatNumber(summary.total_darurat) }}</h3>
                <small class="text-muted">Kosong (0) + Kritis (&le; Min)</small>
              </div>
              <div class="kpi-icon-badge bg-primary-subtle text-primary">
                <i class="fas fa-bell fs-4"></i>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
              <span class="badge bg-primary">Monitoring Aktif</span>
              <span class="small text-muted">
                {{ calculatePercentage(summary.total_darurat, summary.total_item) }}% dari master
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Estimasi Kebutuhan Biaya -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card kpi-card border-0 shadow-sm h-100">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="text-muted small fw-medium text-uppercase">Estimasi Kebutuhan Dana</span>
                <h4 class="fw-bold text-success mt-1 mb-0">{{ formatCurrency(summary.estimasi_nilai_kebutuhan) }}</h4>
                <small class="text-muted">Estimasi biaya restock ke batas min</small>
              </div>
              <div class="kpi-icon-badge bg-success-subtle text-success">
                <i class="fas fa-coins fs-4"></i>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
              <span class="badge bg-success-subtle text-success border border-success-subtle">HPP / H.Beli</span>
              <span class="small text-muted">{{ formatNumber(summary.total_aman) }} item aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Control Card (Screen only) -->
    <div class="card border-0 shadow-sm mb-4 d-print-none filter-card">
      <div class="card-body p-3">
        <!-- Status Tabs Bar -->
        <div class="d-flex flex-wrap gap-2 mb-3 pb-3 border-bottom">
          <button 
            type="button" 
            class="btn btn-sm" 
            :class="filters.status === 'all_darurat' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="selectStatusFilter('all_darurat')"
          >
            <i class="fas fa-fire me-1"></i> Semua Darurat ({{ formatNumber(summary.total_darurat) }})
          </button>
          <button 
            type="button" 
            class="btn btn-sm" 
            :class="filters.status === 'kosong' ? 'btn-danger' : 'btn-outline-danger'"
            @click="selectStatusFilter('kosong')"
          >
            <i class="fas fa-times-circle me-1"></i> Habis / Kosong ({{ formatNumber(summary.total_kosong) }})
          </button>
          <button 
            type="button" 
            class="btn btn-sm" 
            :class="filters.status === 'kritis' ? 'btn-warning' : 'btn-outline-warning'"
            @click="selectStatusFilter('kritis')"
          >
            <i class="fas fa-exclamation-circle me-1"></i> Kritis &le; Minimal ({{ formatNumber(summary.total_kritis) }})
          </button>
          <button 
            type="button" 
            class="btn btn-sm" 
            :class="filters.status === 'aman' ? 'btn-success' : 'btn-outline-success'"
            @click="selectStatusFilter('aman')"
          >
            <i class="fas fa-check-circle me-1"></i> Stok Aman ({{ formatNumber(summary.total_aman) }})
          </button>
          <button 
            type="button" 
            class="btn btn-sm" 
            :class="filters.status === 'all' ? 'btn-dark' : 'btn-outline-dark'"
            @click="selectStatusFilter('all')"
          >
            <i class="fas fa-list me-1"></i> Semua Item ({{ formatNumber(summary.total_item) }})
          </button>
        </div>

        <!-- Filter Dropdowns Row -->
        <div class="row g-2 align-items-end">
          <!-- Lokasi / Depo -->
          <div class="col-12 col-md-3">
            <label class="form-label small fw-semibold text-muted mb-1">
              <i class="fas fa-warehouse me-1 text-primary"></i>Lokasi / Depo Farmasi
            </label>
            <v-select
              v-model="filters.kd_bangsal"
              :options="attributes.bangsal_prioritas"
              label="nm_bangsal"
              :reduce="option => option.kd_bangsal"
              placeholder="Semua Depo (Total RS)"
              class="style-chooser-sm"
              @option:selected="onFilterChange"
              @option:deselected="onFilterChange"
            />
          </div>

          <!-- Kategori -->
          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label small fw-semibold text-muted mb-1">Kategori</label>
            <v-select
              v-model="filters.kode_kategori"
              :options="attributes.kategori"
              label="nama"
              :reduce="option => option.kode"
              placeholder="Semua Kategori"
              class="style-chooser-sm"
              @option:selected="onFilterChange"
              @option:deselected="onFilterChange"
            />
          </div>

          <!-- Jenis -->
          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label small fw-semibold text-muted mb-1">Jenis</label>
            <v-select
              v-model="filters.kdjns"
              :options="attributes.jenis"
              label="nama"
              :reduce="option => option.kdjns"
              placeholder="Semua Jenis"
              class="style-chooser-sm"
              @option:selected="onFilterChange"
              @option:deselected="onFilterChange"
            />
          </div>

          <!-- Golongan -->
          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label small fw-semibold text-muted mb-1">Golongan</label>
            <v-select
              v-model="filters.kode_golongan"
              :options="attributes.golongan"
              label="nama"
              :reduce="option => option.kode"
              placeholder="Semua Golongan"
              class="style-chooser-sm"
              @option:selected="onFilterChange"
              @option:deselected="onFilterChange"
            />
          </div>

          <!-- Search Input -->
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label small fw-semibold text-muted mb-1">Pencarian Cepat</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input
                v-model="filters.q"
                type="text"
                class="form-control border-start-0"
                placeholder="Kode, nama obat, produsen..."
                @input="debounceSearch"
              />
              <button 
                v-if="filters.q" 
                class="btn btn-outline-secondary border-start-0" 
                type="button" 
                @click="clearSearch"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter info bar & reset button -->
        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small text-muted">
          <div>
            <span>Menampilkan data dengan status: <strong>{{ getStatusLabel(filters.status) }}</strong></span>
            <span v-if="filters.kd_bangsal"> di lokasi <strong>{{ getBangsalLabel(filters.kd_bangsal) }}</strong></span>
            <span v-if="filters.q"> | Kata kunci: "<strong>{{ filters.q }}</strong>"</span>
          </div>
          <div>
            <button class="btn btn-link btn-sm text-decoration-none p-0 text-secondary" @click="resetFilters">
              <i class="fas fa-undo-alt me-1"></i> Reset Semua Filter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="card border-0 shadow-sm main-table-card">
      <div class="card-body p-0">
        <!-- Table Toolbar -->
        <div class="p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 d-print-none">
          <div class="d-flex align-items-center gap-2">
            <h5 class="mb-0 fw-bold fs-6">
              <i class="fas fa-table-list text-primary me-2"></i>Daftar Obat / BHP Darurat
            </h5>
            <span class="badge bg-secondary-subtle text-secondary border">
              {{ formatNumber(pagination.total) }} item ditemukan
            </span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <label class="small text-muted mb-0">Baris per halaman:</label>
            <select v-model="pagination.per_page" class="form-select form-select-sm w-auto" @change="onPerPageChange">
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat data...</span>
          </div>
          <p class="mt-2 text-muted small">Sedang menganalisis kekosongan & darurat stok...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-danger" @click="fetchData(1)">Coba Lagi</button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="text-center py-5">
          <div class="empty-icon-wrap mb-3">
            <i class="fas fa-circle-check text-success fa-3x"></i>
          </div>
          <h6 class="fw-bold text-dark">Tidak ada data darurat stok yang cocok</h6>
          <p class="text-muted small mb-3">
            Semua stok obat dalam kondisi aman atau kriteria pencarian tidak menemukan hasil.
          </p>
          <button class="btn btn-sm btn-outline-secondary" @click="resetFilters">
            <i class="fas fa-undo me-1"></i> Reset Filter
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-nowrap">
              <tr>
                <th style="width: 50px;" class="text-center">No</th>
                <th style="width: 100px;">Status</th>
                <th>Kode & Nama Obat / Alkes</th>
                <th class="text-center">Satuan</th>
                <th class="text-end cursor-pointer" @click="toggleSort('stokminimal')">
                  Stok Min
                  <i class="fas fa-sort text-muted ms-1" :class="getSortIcon('stokminimal')"></i>
                </th>
                <th class="text-end cursor-pointer" @click="toggleSort('total_stok')">
                  Total Stok RS
                  <i class="fas fa-sort text-muted ms-1" :class="getSortIcon('total_stok')"></i>
                </th>
                <th class="text-center" style="min-width: 240px;">Sebaran Stok per Depo</th>
                <th class="text-end cursor-pointer" @click="toggleSort('selisih')">
                  Kurang
                  <i class="fas fa-sort text-muted ms-1" :class="getSortIcon('selisih')"></i>
                </th>
                <th class="text-end cursor-pointer" @click="toggleSort('estimasi')">
                  Est. Kebutuhan (Rp)
                  <i class="fas fa-sort text-muted ms-1" :class="getSortIcon('estimasi')"></i>
                </th>
                <th class="text-center d-print-none" style="width: 70px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in items" 
                :key="item.kode_brng"
                :class="{
                  'row-kosong': item.status_stok === 'KOSONG',
                  'row-kritis': item.status_stok === 'KRITIS'
                }"
              >
                <!-- Nomor -->
                <td class="text-center small text-muted">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>

                <!-- Status Badge -->
                <td>
                  <span 
                    v-if="item.status_stok === 'KOSONG'" 
                    class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fw-bold"
                  >
                    🔴 KOSONG
                  </span>
                  <span 
                    v-else-if="item.status_stok === 'KRITIS'" 
                    class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fw-bold"
                  >
                    🟠 KRITIS
                  </span>
                  <span 
                    v-else 
                    class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-bold"
                  >
                    🟢 AMAN
                  </span>
                </td>

                <!-- Kode & Nama Obat -->
                <td>
                  <div class="fw-bold text-dark d-flex align-items-center gap-1">
                    {{ item.nama_brng }}
                  </div>
                  <div class="small text-muted d-flex flex-wrap gap-2 mt-1">
                    <span class="code-badge font-monospace">{{ item.kode_brng }}</span>
                    <span v-if="item.nama_kategori" class="badge bg-light text-secondary border">
                      {{ item.nama_kategori }}
                    </span>
                    <span v-if="item.nama_jenis" class="badge bg-light text-secondary border">
                      {{ item.nama_jenis }}
                    </span>
                    <span v-if="item.nama_industri" class="text-muted small">
                      <i class="fas fa-industry me-1"></i>{{ item.nama_industri }}
                    </span>
                  </div>
                  <div v-if="item.letak_barang" class="small text-muted mt-1">
                    <i class="fas fa-map-pin text-primary me-1"></i>Rak: <strong>{{ item.letak_barang }}</strong>
                  </div>
                </td>

                <!-- Satuan -->
                <td class="text-center small">
                  <span class="badge bg-light text-dark border">{{ item.satuan }}</span>
                </td>

                <!-- Stok Minimal -->
                <td class="text-end fw-semibold">
                  {{ formatNumber(item.stokminimal) }}
                </td>

                <!-- Total Stok RS -->
                <td class="text-end">
                  <span 
                    class="fw-bold fs-6" 
                    :class="{
                      'text-danger': item.total_stok <= 0,
                      'text-warning-emphasis': item.total_stok > 0 && item.total_stok <= item.stokminimal,
                      'text-success': item.total_stok > item.stokminimal
                    }"
                  >
                    {{ formatNumber(item.total_stok) }}
                  </span>
                </td>

                <!-- Sebaran Stok Depo -->
                <td>
                  <div class="d-flex flex-wrap gap-1 align-items-center">
                    <!-- Gudang Farmasi -->
                    <span 
                      class="badge depo-pill"
                      :class="item.stok_gudang > 0 ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-muted border'"
                      title="Stok Gudang Farmasi (RM5)"
                    >
                      <small class="depo-tag">Gudang:</small> {{ formatNumber(item.stok_gudang) }}
                    </span>

                    <!-- Apotek Rajal -->
                    <span 
                      class="badge depo-pill"
                      :class="item.stok_rajal > 0 ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-light text-muted border'"
                      title="Stok Apotek Rawat Jalan (RM7)"
                    >
                      <small class="depo-tag">Rajal:</small> {{ formatNumber(item.stok_rajal) }}
                    </span>

                    <!-- Apotek Rinap -->
                    <span 
                      class="badge depo-pill"
                      :class="item.stok_rinap > 0 ? 'bg-secondary-subtle text-secondary border border-secondary-subtle' : 'bg-light text-muted border'"
                      title="Stok Apotek Rawat Inap (RM)"
                    >
                      <small class="depo-tag">Rinap:</small> {{ formatNumber(item.stok_rinap) }}
                    </span>

                    <!-- Rekomendasi Farmasi Cerdas -->
                    <div class="w-100 mt-1">
                      <span 
                        v-if="item.stok_rajal <= 0 && item.stok_gudang > 0" 
                        class="badge bg-info-subtle text-info border border-info-subtle small fw-normal"
                        title="Stok habis di Rajal tetapi tersedia di Gudang"
                      >
                        <i class="fas fa-truck-ramp-box me-1"></i>Tersedia di Gudang (Bisa Mutasi)
                      </span>
                      <span 
                        v-else-if="item.total_stok <= 0" 
                        class="badge bg-danger-subtle text-danger border border-danger-subtle small fw-normal"
                      >
                        <i class="fas fa-cart-shopping me-1"></i>Habis Total (Perlu Order/SP)
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Selisih Kurang -->
                <td class="text-end">
                  <span v-if="item.selisih_kurang > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">
                    -{{ formatNumber(item.selisih_kurang) }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>

                <!-- Estimasi Kebutuhan Biaya -->
                <td class="text-end font-monospace">
                  <div v-if="item.estimasi_subtotal > 0" class="fw-bold text-dark">
                    {{ formatCurrency(item.estimasi_subtotal) }}
                  </div>
                  <div v-else class="text-muted small">-</div>
                  <div class="small text-muted" style="font-size: 0.72rem;">
                    HPP: {{ formatCurrency(item.h_beli) }}
                  </div>
                </td>

                <!-- Aksi -->
                <td class="text-center d-print-none">
                  <button 
                    class="btn btn-sm btn-outline-primary p-1 px-2" 
                    title="Lihat Detail Item"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer / Pagination (Screen only) -->
        <div class="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2 d-print-none">
          <div class="small text-muted">
            Menampilkan 
            <strong>{{ items.length > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0 }}</strong> 
            sampai 
            <strong>{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</strong> 
            dari 
            <strong>{{ formatNumber(pagination.total) }}</strong> data
          </div>
          <nav v-if="pagination.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="fetchData(1)" title="Halaman Pertama">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="fetchData(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>

              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: pagination.current_page === page, disabled: page === '...' }"
              >
                <button class="page-link" @click="page !== '...' && fetchData(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="fetchData(pagination.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="fetchData(pagination.last_page)" title="Halaman Terakhir">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Print Footer (Visible only on print) -->
    <div class="d-none d-print-block mt-5 pt-3">
      <div class="row">
        <div class="col-6 text-center">
          <p class="mb-5">Petugas Farmasi / Logistik,</p>
          <p class="fw-bold text-decoration-underline mb-0">( ........................................ )</p>
          <small class="text-muted">NIP: ..............................</small>
        </div>
        <div class="col-6 text-center">
          <p class="mb-5">Kepala Instalasi Farmasi,</p>
          <p class="fw-bold text-decoration-underline mb-0">( ........................................ )</p>
          <small class="text-muted">NIP: ..............................</small>
        </div>
      </div>
    </div>

    <!-- Detail Item Modal -->
    <div 
      v-if="selectedItem" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(0,0,0,0.5); z-index: 1055;"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-pills text-primary me-2"></i>Detail Obat / BHP
            </h5>
            <button type="button" class="btn-close" @click="selectedItem = null"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Header Item info -->
            <div class="d-flex justify-content-between align-items-start pb-3 border-bottom mb-3">
              <div>
                <h4 class="fw-bold text-dark mb-1">{{ selectedItem.nama_brng }}</h4>
                <div class="d-flex flex-wrap gap-2">
                  <span class="badge bg-secondary font-monospace">{{ selectedItem.kode_brng }}</span>
                  <span class="badge bg-info-subtle text-info">{{ selectedItem.nama_kategori || 'Tanpa Kategori' }}</span>
                  <span class="badge bg-primary-subtle text-primary">{{ selectedItem.nama_jenis || 'Tanpa Jenis' }}</span>
                  <span class="badge bg-light text-dark border">{{ selectedItem.nama_golongan || 'Tanpa Golongan' }}</span>
                </div>
              </div>
              <div>
                <span 
                  v-if="selectedItem.status_stok === 'KOSONG'" 
                  class="badge bg-danger fs-6 px-3 py-2"
                >
                  🔴 KOSONG
                </span>
                <span 
                  v-else-if="selectedItem.status_stok === 'KRITIS'" 
                  class="badge bg-warning text-dark fs-6 px-3 py-2"
                >
                  🟠 KRITIS
                </span>
                <span 
                  v-else 
                  class="badge bg-success fs-6 px-3 py-2"
                >
                  🟢 AMAN
                </span>
              </div>
            </div>

            <!-- Specs Grid -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Satuan</small>
                  <span class="fw-bold">{{ selectedItem.satuan }} (Besar: {{ selectedItem.satuan_besar || '-' }})</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Stok Minimal</small>
                  <span class="fw-bold text-primary">{{ formatNumber(selectedItem.stokminimal) }} {{ selectedItem.satuan }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Total Stok RS</small>
                  <span class="fw-bold fs-5" :class="selectedItem.total_stok <= 0 ? 'text-danger' : 'text-dark'">
                    {{ formatNumber(selectedItem.total_stok) }} {{ selectedItem.satuan }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Harga Beli (HPP)</small>
                  <span class="fw-bold text-success">{{ formatCurrency(selectedItem.h_beli) }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Kekurangan Stok</small>
                  <span class="fw-bold text-danger">{{ formatNumber(selectedItem.selisih_kurang) }} {{ selectedItem.satuan }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1">Estimasi Biaya Restock</small>
                  <span class="fw-bold text-danger">{{ formatCurrency(selectedItem.estimasi_subtotal) }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1"><i class="fas fa-industry me-1"></i>Produsen / Industri Farmasi</small>
                  <span class="fw-semibold">{{ selectedItem.nama_industri || '-' }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block mb-1"><i class="fas fa-map-pin me-1"></i>Letak Rak / Lemari</small>
                  <span class="fw-semibold">{{ selectedItem.letak_barang || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Stok per Depo Section -->
            <h6 class="fw-bold mb-3"><i class="fas fa-boxes-stacked me-2 text-primary"></i>Sebaran Stok per Lokasi</h6>
            <div class="table-responsive">
              <table class="table table-bordered table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Depo / Bangsal</th>
                    <th class="text-center">Kode</th>
                    <th class="text-end">Jumlah Stok</th>
                    <th>Status Depo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Gudang Farmasi</strong></td>
                    <td class="text-center font-monospace">RM5</td>
                    <td class="text-end fw-bold">{{ formatNumber(selectedItem.stok_gudang) }}</td>
                    <td>
                      <span v-if="selectedItem.stok_gudang > 0" class="badge bg-success-subtle text-success">Tersedia</span>
                      <span v-else class="badge bg-danger-subtle text-danger">Kosong</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Apotek Rawat Jalan</strong></td>
                    <td class="text-center font-monospace">RM7</td>
                    <td class="text-end fw-bold">{{ formatNumber(selectedItem.stok_rajal) }}</td>
                    <td>
                      <span v-if="selectedItem.stok_rajal > 0" class="badge bg-success-subtle text-success">Tersedia</span>
                      <span v-else class="badge bg-danger-subtle text-danger">Kosong</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Apotek Rawat Inap</strong></td>
                    <td class="text-center font-monospace">RM</td>
                    <td class="text-end fw-bold">{{ formatNumber(selectedItem.stok_rinap) }}</td>
                    <td>
                      <span v-if="selectedItem.stok_rinap > 0" class="badge bg-success-subtle text-success">Tersedia</span>
                      <span v-else class="badge bg-danger-subtle text-danger">Kosong</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Apotek Sentral</strong></td>
                    <td class="text-center font-monospace">AP</td>
                    <td class="text-end fw-bold">{{ formatNumber(selectedItem.stok_apotek) }}</td>
                    <td>
                      <span v-if="selectedItem.stok_apotek > 0" class="badge bg-success-subtle text-success">Tersedia</span>
                      <span v-else class="badge bg-danger-subtle text-danger">Kosong</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <router-link 
              :to="{ path: '/farmasi/riwayat-obat', query: { q: selectedItem.nama_brng } }" 
              class="btn btn-outline-primary"
            >
              <i class="fas fa-history me-1"></i>Lihat Kartu Riwayat Stok
            </router-link>
            <button type="button" class="btn btn-secondary" @click="selectedItem = null">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import daruratStokService from '@/services/daruratStokService'

// State
const items = ref([])
const loading = ref(false)
const loadingExport = ref(false)
const error = ref(null)
const selectedItem = ref(null)

const summary = ref({
  total_item: 0,
  total_kosong: 0,
  total_kritis: 0,
  total_darurat: 0,
  total_aman: 0,
  estimasi_nilai_kebutuhan: 0
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 25
})

const filters = reactive({
  status: 'all_darurat', // all_darurat, kosong, kritis, aman, all
  kd_bangsal: '',
  kdjns: '',
  kode_kategori: '',
  kode_golongan: '',
  q: '',
  sort_by: 'total_stok',
  sort_dir: 'asc'
})

const attributes = reactive({
  bangsal_prioritas: [],
  bangsal_all: [],
  jenis: [],
  kategori: [],
  golongan: []
})

let searchTimeout = null

// Computed
const currentDateTime = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const visiblePages = computed(() => {
  const current = pagination.current_page
  const last = pagination.last_page
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
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

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const params = {
      page,
      limit: pagination.per_page,
      status: filters.status,
      kd_bangsal: filters.kd_bangsal || undefined,
      kdjns: filters.kdjns || undefined,
      kode_kategori: filters.kode_kategori || undefined,
      kode_golongan: filters.kode_golongan || undefined,
      q: filters.q || undefined,
      sort_by: filters.sort_by,
      sort_dir: filters.sort_dir
    }

    const response = await daruratStokService.getDaruratStok(params)
    if (response.success) {
      items.value = response.data.data || []
      pagination.current_page = response.data.current_page
      pagination.last_page = response.data.last_page
      pagination.total = response.data.total
      if (response.summary) {
        summary.value = response.summary
      }
    }
  } catch (err) {
    console.error('Error fetching darurat stok:', err)
    error.value = err.response?.data?.message || 'Gagal memuat data monitoring darurat stok.'
  } finally {
    loading.value = false
  }
}

const fetchAttributes = async () => {
  try {
    const response = await daruratStokService.getAttributes()
    if (response.success && response.data) {
      attributes.bangsal_prioritas = response.data.bangsal_prioritas || []
      attributes.bangsal_all = response.data.bangsal_all || []
      attributes.jenis = response.data.jenis || []
      attributes.kategori = response.data.kategori || []
      attributes.golongan = response.data.golongan || []
    }
  } catch (err) {
    console.error('Error fetching attributes:', err)
  }
}

const selectStatusFilter = (status) => {
  filters.status = status
  fetchData(1)
}

const onFilterChange = () => {
  fetchData(1)
}

const onPerPageChange = () => {
  fetchData(1)
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData(1)
  }, 400)
}

const clearSearch = () => {
  filters.q = ''
  fetchData(1)
}

const resetFilters = () => {
  filters.status = 'all_darurat'
  filters.kd_bangsal = ''
  filters.kdjns = ''
  filters.kode_kategori = ''
  filters.kode_golongan = ''
  filters.q = ''
  filters.sort_by = 'total_stok'
  filters.sort_dir = 'asc'
  fetchData(1)
}

const toggleSort = (col) => {
  if (filters.sort_by === col) {
    filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc'
  } else {
    filters.sort_by = col
    filters.sort_dir = 'asc'
  }
  fetchData(1)
}

const getSortIcon = (col) => {
  if (filters.sort_by !== col) return ''
  return filters.sort_dir === 'asc' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary'
}

const openDetail = (item) => {
  selectedItem.value = item
}

const printReport = () => {
  window.print()
}

const exportExcel = async () => {
  loadingExport.value = true
  try {
    const params = {
      status: filters.status,
      kd_bangsal: filters.kd_bangsal || undefined,
      kdjns: filters.kdjns || undefined,
      kode_kategori: filters.kode_kategori || undefined,
      kode_golongan: filters.kode_golongan || undefined,
      q: filters.q || undefined
    }

    const response = await daruratStokService.getExportData(params)
    if (!response.success || !response.data || response.data.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Data',
        text: 'Tidak ada data untuk diekspor dengan filter saat ini.'
      })
      return
    }

    const exportRows = response.data.map((row, idx) => ({
      No: idx + 1,
      Status: row.status_stok,
      'Kode Barang': row.kode_brng,
      'Nama Obat / Alkes': row.nama_brng,
      Satuan: row.satuan,
      Kategori: row.nama_kategori || '-',
      Jenis: row.nama_jenis || '-',
      Golongan: row.nama_golongan || '-',
      Produsen: row.nama_industri || '-',
      'Stok Minimal': Number(row.stokminimal) || 0,
      'Total Stok RS': Number(row.total_stok) || 0,
      'Stok Gudang (RM5)': Number(row.stok_gudang) || 0,
      'Stok Rajal (RM7)': Number(row.stok_rajal) || 0,
      'Stok Rinap (RM)': Number(row.stok_rinap) || 0,
      'Selisih Kurang': Number(row.selisih_kurang) || 0,
      'Harga Beli (HPP)': Number(row.h_beli) || 0,
      'Estimasi Kebutuhan Biaya (Rp)': Number(row.estimasi_subtotal) || 0,
      'Letak Rak': row.letak_barang || '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportRows)

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 12 }, // Status
      { wch: 15 }, // Kode
      { wch: 35 }, // Nama
      { wch: 10 }, // Satuan
      { wch: 20 }, // Kategori
      { wch: 15 }, // Jenis
      { wch: 15 }, // Golongan
      { wch: 25 }, // Produsen
      { wch: 12 }, // Stok Min
      { wch: 14 }, // Total Stok
      { wch: 14 }, // Stok Gudang
      { wch: 14 }, // Stok Rajal
      { wch: 14 }, // Stok Rinap
      { wch: 14 }, // Selisih
      { wch: 16 }, // HPP
      { wch: 24 }, // Est Biaya
      { wch: 15 }  // Rak
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Darurat Stok')
    
    const fileName = `Monitoring-Darurat-Stok-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)

    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: `${exportRows.length} data berhasil diekspor ke file Excel.`,
      timer: 2000,
      showConfirmButton: false
    })
  } catch (err) {
    console.error('Export error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Export Gagal',
      text: 'Terjadi kesalahan saat mengekspor data ke Excel.'
    })
  } finally {
    loadingExport.value = false
  }
}

// Helpers
const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return new Intl.NumberFormat('id-ID').format(val)
}

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0
  return Math.round(((part || 0) / total) * 100)
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'kosong': return 'Stok Habis / Kosong (0)'
    case 'kritis': return 'Stok Kritis (≤ Min)'
    case 'aman': return 'Stok Aman (> Min)'
    case 'all': return 'Semua Status Stok'
    case 'all_darurat':
    default:
      return 'Semua Darurat (Kosong + Kritis)'
  }
}

const getBangsalLabel = (kd) => {
  if (!kd) return 'Semua Lokasi Depo'
  const found = attributes.bangsal_all.find(b => b.kd_bangsal === kd)
  return found ? found.nm_bangsal : kd
}

onMounted(() => {
  fetchAttributes()
  fetchData(1)
})
</script>

<style scoped>
.darurat-stok-page {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
}

/* KPI Cards */
.kpi-card {
  transition: all 0.2s ease;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0 !important;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.active-card-danger {
  border: 2px solid #ef4444 !important;
  background: #fef2f2 !important;
}

.active-card-warning {
  border: 2px solid #f59e0b !important;
  background: #fffbeb !important;
}

.active-card-primary {
  border: 2px solid #3b82f6 !important;
  background: #eff6ff !important;
}

.kpi-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Filter Card */
.filter-card {
  border-radius: 12px;
  background: #ffffff;
}

.main-table-card {
  border-radius: 12px;
  background: #ffffff;
}

/* Custom Table Styles */
.custom-table thead th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  color: #64748b;
  padding: 0.85rem 1rem;
  background-color: #f8fafc;
}

.custom-table tbody td {
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
}

.row-kosong {
  background-color: rgba(239, 68, 68, 0.03);
}

.row-kosong:hover {
  background-color: rgba(239, 68, 68, 0.08) !important;
}

.row-kritis {
  background-color: rgba(245, 158, 11, 0.03);
}

.row-kritis:hover {
  background-color: rgba(245, 158, 11, 0.08) !important;
}

.code-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.depo-pill {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
}

.depo-tag {
  opacity: 0.8;
  font-size: 0.7rem;
  margin-right: 2px;
}

/* Vue Select Customization */
:deep(.style-chooser-sm .vs__search) {
  font-size: 0.825rem;
  padding: 2px 4px;
}

:deep(.style-chooser-sm .vs__dropdown-toggle) {
  border-color: #cbd5e1;
  border-radius: 6px;
  font-size: 0.825rem;
  min-height: 31px;
}

:deep(.style-chooser-sm .vs__selected) {
  font-size: 0.825rem;
  margin: 2px 2px;
}

/* Print Styles */
@media print {
  body {
    background-color: #ffffff !important;
  }
  
  .darurat-stok-page {
    padding: 0;
    background-color: transparent !important;
  }

  .main-table-card {
    box-shadow: none !important;
    border: none !important;
  }

  .custom-table {
    font-size: 9pt;
  }

  .custom-table thead th {
    background-color: #e2e8f0 !important;
    color: #000000 !important;
    border: 1px solid #94a3b8 !important;
    padding: 4px 6px !important;
  }

  .custom-table tbody td {
    border: 1px solid #cbd5e1 !important;
    padding: 4px 6px !important;
  }

  .depo-pill {
    border: 1px solid #94a3b8 !important;
    background-color: transparent !important;
    color: #000000 !important;
  }

  .code-badge {
    background: none;
    border: none;
  }
}
</style>
