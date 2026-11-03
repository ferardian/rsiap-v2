<template>
  <div class="rekap-radiologi-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3 shadow-sm rounded-4 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style="width: 50px; height: 50px;">
            <i class="fas fa-x-ray fa-2x text-primary"></i>
          </div>
          <div>
            <h3 class="page-title mb-0 fw-bold text-dark">Rekap Radiologi</h3>
            <p class="text-muted small mb-0">Rekapitulasi data pemeriksaan radiologi dan jasa medis dokter spesialis radiologi</p>
          </div>
        </div>

        <!-- Action Header Buttons -->
        <div class="d-flex align-items-center gap-2">
          <!-- Tombol Khusus Tab Tindakan -->
          <template v-if="activeTab === 'tindakan'">
            <button 
              class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
              @click="exportRekapTindakanToExcel"
              :disabled="loading || filteredRekapTindakan.length === 0"
            >
              <i class="fas fa-file-excel me-2"></i> Export Excel Rekap
            </button>

            <button 
              class="btn btn-sm btn-primary rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
              @click="printRekapTindakanPdf"
              :disabled="loading || filteredRekapTindakan.length === 0"
            >
              <i class="fas fa-file-pdf me-2"></i> Preview / Cetak PDF
            </button>
          </template>

          <button 
            v-if="activeTab === 'internal'"
            class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="exportToExcel('internal')"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-file-excel me-2"></i> Export Excel
          </button>

          <button 
            v-if="activeTab === 'eksternal'"
            class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="exportToExcel('eksternal')"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-file-excel me-2"></i> Export Excel
          </button>

          <button 
            v-if="activeTab === 'eksternal'"
            class="btn btn-sm btn-primary rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="printEksternalReport"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-file-pdf me-2"></i> Preview / Cetak PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4 glass-card">
      <div class="card-body p-3 p-md-4">
        <!-- Filters Row 1 & 2 -->
        <div class="row g-3 align-items-end">
          
          <!-- Periode Tanggal (Row 1, 50% width) -->
          <div class="col-12 col-lg-6">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-calendar-alt text-primary me-2"></i> Periode Pemeriksaan
            </label>
            <div class="date-range-group">
              <input 
                type="date" 
                v-model="filters.tgl_awal" 
                class="form-control form-control-filter" 
                @change="fetchData"
              />
              <span class="text-muted small fw-bold text-nowrap px-1">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_akhir" 
                class="form-control form-control-filter" 
                @change="fetchData"
              />
            </div>
          </div>

          <!-- Dokter Spesialis Radiologi (Row 1, 50% width) -->
          <div class="col-12 col-lg-6">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-user-md text-primary me-2"></i> Dokter Spesialis Radiologi
            </label>
            <select 
              v-model="filters.kd_dokter" 
              class="form-select form-control-filter"
              @change="fetchData"
            >
              <option value="">Semua Dokter Radiologi</option>
              <option v-for="doc in dokterList" :key="doc.kd_dokter" :value="doc.kd_dokter">
                {{ doc.nm_dokter }}
              </option>
            </select>
          </div>

          <!-- Cara Bayar / Pembiayaan (Row 2, 25% width) -->
          <div class="col-12 col-sm-6 col-lg-3">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-credit-card text-primary me-2"></i> Cara Bayar / Pembiayaan
            </label>
            <select 
              v-model="filters.kd_pj" 
              class="form-select form-control-filter"
              @change="fetchData"
            >
              <option value="">Semua Cara Bayar</option>
              <option v-for="pj in penjabList" :key="pj.kd_pj" :value="pj.kd_pj">
                {{ pj.png_jawab }}
              </option>
            </select>
          </div>

          <!-- Status Pasien (Row 2, 25% width) -->
          <div class="col-12 col-sm-6 col-lg-3">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-hospital-user text-primary me-2"></i> Status Pasien
            </label>
            <select 
              v-model="filters.status" 
              class="form-select form-control-filter"
              @change="fetchData"
            >
              <option value="">Semua (Ralan & Ranap)</option>
              <option value="Ralan">Rawat Jalan (Ralan)</option>
              <option value="Ranap">Rawat Inap (Ranap)</option>
            </select>
          </div>

          <!-- Filter Waktu (Shift) (Row 2, 50% width) -->
          <div class="col-12 col-lg-6">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-clock text-primary me-2"></i> Filter Waktu (Shift)
            </label>
            <div class="shift-btn-group w-100" role="group">
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'all' }"
                @click="setShift('all')"
              >
                Semua Jam
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'pagi' }"
                @click="setShift('pagi')"
                title="Pemeriksaan jam 08:00 - 14:00"
              >
                08:00 - 14:00
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'luar_pagi' }"
                @click="setShift('luar_pagi')"
                title="Pemeriksaan di luar jam 08:00 - 14:00"
              >
                Di Luar 08:00 - 14:00
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'custom' }"
                @click="setShift('custom')"
              >
                Custom
              </button>
            </div>
          </div>

          <!-- Custom Jam Controls (Muncul Jika Mode Custom Dipilih) -->
          <div v-if="shiftMode === 'custom'" class="col-12 pt-2 border-top">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <label class="form-label small fw-bold text-muted mb-0 d-flex align-items-center me-2">
                <i class="fas fa-business-time text-primary me-2"></i> Jam Pelayanan Kustom:
              </label>
              <input 
                type="time" 
                v-model="filters.jam_mulai" 
                class="form-control form-control-filter" 
                style="width: 130px;"
              />
              <span class="text-muted small fw-bold">s/d</span>
              <input 
                type="time" 
                v-model="filters.jam_selesai" 
                class="form-control form-control-filter" 
                style="width: 130px;"
              />
              <button class="btn btn-sm btn-primary rounded-3 px-3 fw-bold d-flex align-items-center" style="height: 38px;" @click="fetchData">
                <i class="fas fa-check me-1"></i> Terapkan
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- Summary Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Total Pemeriksaan</span>
            <div class="icon-circle bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
              <i class="fas fa-procedures"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-dark">{{ summary.total_pemeriksaan.toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">
            <span class="badge bg-success-subtle text-success me-1">{{ summary.ralan_count }} Ralan</span>
            <span class="badge bg-info-subtle text-info">{{ summary.ranap_count }} Ranap</span>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Total Jasa Medis</span>
            <div class="icon-circle bg-success bg-opacity-10 text-success p-2 rounded-circle">
              <i class="fas fa-coins"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-success">
            Rp {{ Number(summary.total_jasa || 0).toLocaleString('id-ID') }}
          </div>
          <div class="stat-footer mt-2 small text-muted">Total jasa dokter radiologi</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Shift Pagi (08 - 14)</span>
            <div class="icon-circle bg-warning bg-opacity-10 text-warning p-2 rounded-circle">
              <i class="fas fa-sun"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-warning">{{ summary.shift_pagi.toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">Tindakan jam 08:00 - 14:00</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Di Luar 08:00 - 14:00</span>
            <div class="icon-circle bg-indigo bg-opacity-10 text-primary p-2 rounded-circle">
              <i class="fas fa-moon"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-primary">{{ (summary.shift_luar_pagi ?? summary.shift_sore ?? 0).toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">Tindakan di luar jam 08:00 - 14:00</div>
        </div>
      </div>
    </div>

    <!-- Main Content Card with Dual Tabs -->
    <div class="card border-0 shadow-sm glass-card rounded-4 mb-4">
      <!-- Clean Segmented Tab Switcher -->
      <div class="card-header bg-white border-bottom pt-3 px-4 pb-3">
        <div class="tab-switcher">
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ active: activeTab === 'internal' }"
            @click="activeTab = 'internal'"
          >
            <i class="fas fa-hospital me-2"></i> Data Internal
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ active: activeTab === 'eksternal' }"
            @click="activeTab = 'eksternal'"
          >
            <i class="fas fa-file-invoice me-2"></i> Data Eksternal
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ active: activeTab === 'tindakan' }"
            @click="activeTab = 'tindakan'"
          >
            <i class="fas fa-chart-pie me-2"></i> Rekap per Tindakan
            <span v-if="rekapPerTindakan.length > 0" class="badge bg-primary-subtle text-primary ms-2 rounded-pill">
              {{ rekapPerTindakan.length }}
            </span>
          </button>
        </div>
      </div>

      <div class="card-body p-4 pt-3">
        
        <!-- ========================================== -->
        <!-- TAB 1: KONSUMSI INTERNAL                  -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'internal'">
          <!-- Search & Controls Internal -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div class="d-flex align-items-center gap-2">
              <div class="input-group" style="width: 320px; height: 38px;">
                <span class="input-group-text bg-light border-secondary-subtle">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  class="form-control form-control-filter" 
                  placeholder="Cari pasien / no rawat / tindakan..."
                />
              </div>
              <span class="text-muted small">Menampilkan <b>{{ filteredList.length }}</b> data</span>
            </div>
          </div>

          <!-- Internal Table -->
          <div class="table-responsive bg-white rounded-3 shadow-sm border">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-light text-nowrap">
                <tr>
                  <th class="ps-3 py-2 text-center" style="width: 50px;">No.</th>
                  <th class="py-2">Waktu Periksa</th>
                  <th class="py-2">No. Rawat</th>
                  <th class="py-2">No. RM</th>
                  <th class="py-2">Nama Pasien</th>
                  <th class="py-2">Cara Bayar / Status</th>
                  <th class="py-2">Tindakan Radiologi</th>
                  <th class="py-2">Dokter Radiologi</th>
                  <th class="py-2">Dokter Perujuk</th>
                  <th class="pe-3 py-2 text-end">Jasa Medis</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="10" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat data pemeriksaan radiologi...
                  </td>
                </tr>
                <tr v-else-if="filteredList.length === 0">
                  <td colspan="10" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block text-secondary opacity-50"></i>
                    Tidak ada data pemeriksaan radiologi pada periode & filter yang dipilih.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in filteredList" :key="idx">
                  <td class="ps-3 text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="text-nowrap">
                    <span class="fw-semibold text-dark">{{ formatDateIndo(item.tgl_periksa) }}</span>
                    <span class="badge bg-light text-secondary border ms-1 font-monospace">{{ item.jam }}</span>
                  </td>
                  <td class="font-monospace small text-primary">{{ item.no_rawat }}</td>
                  <td class="font-monospace small">{{ item.no_rkm_medis }}</td>
                  <td class="fw-bold text-dark text-nowrap">{{ item.nm_pasien }}</td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small me-1">
                      {{ item.png_jawab }}
                    </span>
                    <span class="badge rounded-pill px-2 py-1 small" :class="item.status_rawat === 'Ranap' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'">
                      {{ item.status_rawat }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ item.nm_perawatan }}</div>
                    <small class="text-muted font-monospace">({{ item.kd_jenis_prw }})</small>
                  </td>
                  <td class="text-nowrap small text-muted">
                    <i class="fas fa-user-md text-primary me-1"></i> {{ item.dokter_radiologi }}
                  </td>
                  <td class="text-nowrap small text-muted">
                    {{ item.dokter_perujuk || '-' }}
                  </td>
                  <td class="pe-3 text-end fw-bold text-success text-nowrap font-monospace">
                    Rp {{ Number(item.jasa_dokter || 0).toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredList.length > 0" class="table-light fw-bold">
                <tr>
                  <td colspan="9" class="ps-3 py-2 text-end text-uppercase">Total Jasa Medis:</td>
                  <td class="pe-3 py-2 text-end text-success font-monospace fs-6">
                    Rp {{ totalFilteredJasa.toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 2: LAPORAN EKSTERNAL                   -->
        <!-- ========================================== -->
        <div v-else-if="activeTab === 'eksternal'">

          <!-- Document Header Preview Card -->
          <div class="card border rounded-4 shadow-sm mb-4 bg-light bg-opacity-50">
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <span class="badge bg-primary rounded-pill px-3 py-1 mb-2">Lampiran Berita Acara Pelayanan</span>
                  <h5 class="fw-bold text-dark mb-1">
                    {{ selectedDoctorName || 'Semua Dokter Spesialis Radiologi' }}
                  </h5>
                  <p class="text-muted small mb-0">
                    Periode: <b>{{ formatDateIndo(filters.tgl_awal) }}</b> s.d. <b>{{ formatDateIndo(filters.tgl_akhir) }}</b> | 
                    Shift: <b>{{ shiftLabel }}</b>
                    <span v-if="selectedPenjabName"> | Cara Bayar: <b>{{ selectedPenjabName }}</b></span>
                  </p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                  <div class="display-6 fw-bold text-success">{{ filteredList.length }}</div>
                  <small class="text-muted fw-semibold">Total Tindakan Radiologi</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Eksternal Table -->
          <div class="table-responsive bg-white rounded-3 shadow-sm border">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
              <thead class="table-light">
                <tr>
                  <th class="ps-4 py-3 text-center" style="width: 70px;">No.</th>
                  <th class="py-3" style="width: 200px;">Tanggal Pemeriksaan</th>
                  <th class="py-3" style="width: 150px;">Jam Pemeriksaan</th>
                  <th class="pe-4 py-3">Nama Tindakan / Pemeriksaan Radiologi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat data pemeriksaan radiologi...
                  </td>
                </tr>
                <tr v-else-if="filteredList.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block text-secondary opacity-50"></i>
                    Tidak ada tindakan radiologi pada filter jam & tanggal yang dipilih.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in filteredList" :key="idx">
                  <td class="ps-4 text-center text-muted fw-bold">{{ idx + 1 }}</td>
                  <td class="fw-semibold text-dark text-nowrap">{{ formatDateIndo(item.tgl_periksa) }}</td>
                  <td class="font-monospace text-muted">{{ item.jam }}</td>
                  <td class="pe-4 fw-semibold text-dark">{{ item.nm_perawatan }}</td>
                </tr>
              </tbody>
              <tfoot v-if="filteredList.length > 0" class="table-light">
                <tr>
                  <td colspan="3" class="ps-4 py-3 text-end fw-bold text-uppercase">Total Tindakan Pelayanan:</td>
                  <td class="pe-4 py-3 fw-bold text-success fs-6">{{ filteredList.length }} Tindakan</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

        <!-- ========================================== -->
        <!-- TAB 3: REKAPITULASI PER TINDAKAN          -->
        <!-- ========================================== -->
        <div v-else-if="activeTab === 'tindakan'">
          <!-- Top Toolbar & Highlights -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-5">
              <div class="input-group" style="height: 38px;">
                <span class="input-group-text bg-light border-secondary-subtle">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  v-model="searchTindakan" 
                  class="form-control"
                  placeholder="Cari kode atau nama pemeriksaan..." 
                />
                <button v-if="searchTindakan" class="btn btn-outline-secondary" @click="searchTindakan = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="col-md-7 text-md-end">
              <span class="badge bg-light text-dark border px-3 py-2 rounded-pill me-2">
                <i class="fas fa-layer-group text-primary me-1"></i>
                <b>{{ rekapPerTindakan.length }}</b> Jenis Tindakan
              </span>
              <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
                <i class="fas fa-procedures text-success me-1"></i>
                <b>{{ filteredList.length }}</b> Total Pelayanan
              </span>
            </div>
          </div>

          <!-- Table Rekap per Tindakan -->
          <div class="table-responsive bg-white rounded-3 shadow-sm border">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
              <thead class="table-light">
                <tr>
                  <th class="ps-4 py-3 text-center" style="width: 60px;">No.</th>
                  <th class="py-3" style="width: 130px;">Kode Tindakan</th>
                  <th class="py-3">Nama Pemeriksaan / Tindakan Radiologi</th>
                  <th class="py-3 text-center" style="width: 140px;">Jumlah Dilakukan</th>
                  <th class="py-3 text-center" style="width: 150px;">Proporsi (%)</th>
                  <th class="py-3 text-center" style="width: 160px;">Ralan / Ranap</th>
                  <th class="py-3 text-end" style="width: 170px;">Total Jasa Medis</th>
                  <th class="pe-4 py-3 text-end" style="width: 150px;">Rata-rata Jasa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat rekapan per tindakan radiologi...
                  </td>
                </tr>
                <tr v-else-if="filteredRekapTindakan.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block text-secondary opacity-50"></i>
                    Tidak ada tindakan yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
                <tr v-else v-for="(t, idx) in filteredRekapTindakan" :key="t.kd_jenis_prw">
                  <td class="ps-4 text-center text-muted fw-bold">{{ idx + 1 }}</td>
                  <td>
                    <span class="badge bg-secondary-subtle text-dark font-monospace px-2 py-1">
                      {{ t.kd_jenis_prw }}
                    </span>
                  </td>
                  <td class="fw-bold text-dark">
                    {{ t.nm_perawatan }}
                  </td>
                  <td class="text-center">
                    <span class="badge bg-primary rounded-pill px-3 py-1 fw-bold fs-7">
                      {{ t.jumlah }}x
                    </span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 6px;">
                        <div 
                          class="progress-bar bg-info" 
                          role="progressbar" 
                          :style="{ width: `${t.persentase}%` }"
                        ></div>
                      </div>
                      <span class="small fw-bold text-muted font-monospace" style="min-width: 45px;">
                        {{ t.persentase }}%
                      </span>
                    </div>
                  </td>
                  <td class="text-center small">
                    <span class="badge bg-success-subtle text-success me-1">{{ t.ralan }} Ralan</span>
                    <span class="badge bg-info-subtle text-info">{{ t.ranap }} Ranap</span>
                  </td>
                  <td class="text-end fw-bold text-success font-monospace">
                    Rp {{ Number(t.total_jasa || 0).toLocaleString('id-ID') }}
                  </td>
                  <td class="pe-4 text-end text-muted font-monospace">
                    Rp {{ Number(t.rata_jasa || 0).toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredRekapTindakan.length > 0" class="table-light">
                <tr class="fw-bold">
                  <td colspan="3" class="ps-4 py-3 text-end text-uppercase">
                    Total ({{ filteredRekapTindakan.length }} Tindakan):
                  </td>
                  <td class="py-3 text-center text-primary fs-6">
                    {{ filteredRekapTindakan.reduce((sum, item) => sum + item.jumlah, 0) }}x
                  </td>
                  <td class="py-3 text-center text-muted font-monospace">
                    {{ Math.min(100, filteredRekapTindakan.reduce((sum, item) => sum + item.persentase, 0).toFixed(1)) }}%
                  </td>
                  <td class="py-3 text-center small text-muted">
                    {{ filteredRekapTindakan.reduce((sum, item) => sum + item.ralan, 0) }} Ralan / 
                    {{ filteredRekapTindakan.reduce((sum, item) => sum + item.ranap, 0) }} Ranap
                  </td>
                  <td class="py-3 text-end text-success fs-6 font-monospace">
                    Rp {{ filteredRekapTindakan.reduce((sum, item) => sum + item.total_jasa, 0).toLocaleString('id-ID') }}
                  </td>
                  <td class="pe-4 py-3 text-end text-muted font-monospace">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import rekapRadiologiService from '@/services/rekapRadiologiService'
import logoRsia from '@/assets/logo.png'

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const toast = useToast()
const loading = ref(false)
const activeTab = ref('internal') // 'internal' | 'eksternal' | 'tindakan'
const shiftMode = ref('all') // 'all' | 'pagi' | 'luar_pagi' | 'custom'
const searchKeyword = ref('')
const searchTindakan = ref('')
const dokterList = ref([])
const penjabList = ref([])
const rawData = ref([])

const summary = reactive({
  total_pemeriksaan: 0,
  total_jasa: 0,
  ralan_count: 0,
  ranap_count: 0,
  shift_pagi: 0,
  shift_luar_pagi: 0,
  shift_sore: 0,
  shift_lain: 0
})

// Default Filter: Bulan Ini (dari tgl 1 s.d. hari ini)
const now = new Date()
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
const todayStr = now.toISOString().split('T')[0]

const filters = reactive({
  tgl_awal: firstDayOfMonth,
  tgl_akhir: todayStr,
  shift: 'all',
  jam_mulai: '',
  jam_selesai: '',
  kd_dokter: '',
  kd_pj: '',
  status: '',
  keyword: ''
})

// Nama dokter yang dipilih untuk header laporan eksternal
const selectedDoctorName = computed(() => {
  if (!filters.kd_dokter) return ''
  const doc = dokterList.value.find(d => d.kd_dokter === filters.kd_dokter)
  return doc ? doc.nm_dokter : ''
})

// Nama cara bayar yang dipilih untuk header laporan eksternal
const selectedPenjabName = computed(() => {
  if (!filters.kd_pj) return ''
  const pj = penjabList.value.find(p => p.kd_pj === filters.kd_pj)
  return pj ? pj.png_jawab : ''
})

// Label deskripsi shift
const shiftLabel = computed(() => {
  if (shiftMode.value === 'pagi') return '08:00 - 14:00'
  if (shiftMode.value === 'luar_pagi') return 'Di Luar 08:00 - 14:00'
  if (shiftMode.value === 'custom') {
    return `${filters.jam_mulai || '00:00'} - ${filters.jam_selesai || '23:59'}`
  }
  return 'Semua Jam (24 Jam)'
})

// Filter list berdasarkan pencarian kata kunci pada tabel
const filteredList = computed(() => {
  if (!searchKeyword.value) return rawData.value
  const kw = searchKeyword.value.toLowerCase()
  return rawData.value.filter(item => {
    return (
      (item.nm_pasien && item.nm_pasien.toLowerCase().includes(kw)) ||
      (item.no_rawat && item.no_rawat.toLowerCase().includes(kw)) ||
      (item.no_rkm_medis && item.no_rkm_medis.toLowerCase().includes(kw)) ||
      (item.nm_perawatan && item.nm_perawatan.toLowerCase().includes(kw)) ||
      (item.kd_jenis_prw && item.kd_jenis_prw.toLowerCase().includes(kw)) ||
      (item.dokter_perujuk && item.dokter_perujuk.toLowerCase().includes(kw))
    )
  })
})

// Total jasa medis yang difilter
const totalFilteredJasa = computed(() => {
  return filteredList.value.reduce((acc, curr) => acc + Number(curr.jasa_dokter || 0), 0)
})

// ==========================================
// REKAPITULASI PER TINDAKAN
// ==========================================
const rekapPerTindakan = computed(() => {
  const map = new Map()
  
  filteredList.value.forEach((item) => {
    const key = (item.kd_jenis_prw || item.nm_perawatan || 'LAINNYA').trim()
    if (!map.has(key)) {
      map.set(key, {
        kd_jenis_prw: item.kd_jenis_prw || '-',
        nm_perawatan: item.nm_perawatan || '-',
        jumlah: 0,
        total_jasa: 0,
        ralan: 0,
        ranap: 0
      })
    }
    const row = map.get(key)
    row.jumlah += 1
    row.total_jasa += Number(item.jasa_dokter || 0)
    if (item.status_rawat === 'Ralan') {
      row.ralan += 1
    } else if (item.status_rawat === 'Ranap') {
      row.ranap += 1
    }
  })

  const totalAll = filteredList.value.length || 1

  const list = Array.from(map.values()).map((row) => ({
    ...row,
    persentase: Math.round((row.jumlah / totalAll) * 1000) / 10,
    rata_jasa: row.jumlah > 0 ? Math.round(row.total_jasa / row.jumlah) : 0
  }))

  // Urutkan dari jumlah terbanyak
  return list.sort((a, b) => b.jumlah - a.jumlah)
})

// Filter data rekap tindakan berdasarkan pencarian
const filteredRekapTindakan = computed(() => {
  if (!searchTindakan.value) return rekapPerTindakan.value
  const kw = searchTindakan.value.toLowerCase()
  return rekapPerTindakan.value.filter((t) => 
    (t.nm_perawatan && t.nm_perawatan.toLowerCase().includes(kw)) || 
    (t.kd_jenis_prw && t.kd_jenis_prw.toLowerCase().includes(kw))
  )
})

// Format Tanggal Indonesia
const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  } catch (e) {
    return dateStr
  }
}

// Handler Ganti Shift
const setShift = (mode) => {
  shiftMode.value = mode
  filters.shift = mode
  if (mode === 'all') {
    filters.jam_mulai = ''
    filters.jam_selesai = ''
  } else if (mode === 'pagi') {
    filters.jam_mulai = '08:00:00'
    filters.jam_selesai = '14:00:00'
  } else if (mode === 'luar_pagi') {
    filters.jam_mulai = ''
    filters.jam_selesai = ''
  }
  fetchData()
}

// Ambil Daftar Dokter Spesialis Radiologi
const fetchDokterRadiologi = async () => {
  try {
    const res = await rekapRadiologiService.getDokterRadiologi()
    if (res.data?.metadata?.code === 200) {
      dokterList.value = res.data.response || []
    }
  } catch (err) {
    console.error('Error fetching dokter radiologi:', err)
  }
}

// Ambil Daftar Cara Bayar (Penjab)
const fetchPenjab = async () => {
  try {
    const res = await rekapRadiologiService.getPenjab()
    if (res.data?.metadata?.code === 200) {
      penjabList.value = res.data.response || []
    }
  } catch (err) {
    console.error('Error fetching penjab:', err)
  }
}

// Ambil Data Rekap Radiologi
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      kd_dokter: filters.kd_dokter,
      kd_pj: filters.kd_pj,
      status: filters.status,
      shift: filters.shift,
      jam_mulai: filters.jam_mulai,
      jam_selesai: filters.jam_selesai
    }

    const res = await rekapRadiologiService.getRekapRadiologi(params)
    if (res.data?.metadata?.code === 200) {
      const resp = res.data.response
      rawData.value = resp.data || []
      
      // Update Summary
      if (resp.summary) {
        summary.total_pemeriksaan = resp.summary.total_pemeriksaan || 0
        summary.total_jasa = resp.summary.total_jasa || 0
        summary.ralan_count = resp.summary.ralan_count || 0
        summary.ranap_count = resp.summary.ranap_count || 0
        summary.shift_pagi = resp.summary.shift_pagi || 0
        summary.shift_luar_pagi = resp.summary.shift_luar_pagi || resp.summary.shift_sore || 0
        summary.shift_sore = resp.summary.shift_luar_pagi || resp.summary.shift_sore || 0
        summary.shift_lain = resp.summary.shift_lain || 0
      }
    } else {
      toast.error(res.data?.metadata?.message || 'Gagal mengambil data radiologi')
    }
  } catch (err) {
    console.error('Error fetch rekap radiologi:', err)
    toast.error('Terjadi kesalahan saat memuat data rekap radiologi')
  } finally {
    loading.value = false
  }
}

// ==========================================
// EXPORT DIRECT TO EXCEL (.XLSX)
// ==========================================
const exportToExcel = (mode) => {
  if (filteredList.value.length === 0) {
    return toast.warning('Tidak ada data untuk diexport')
  }

  const docName = selectedDoctorName.value ? selectedDoctorName.value.replace(/[^a-zA-Z0-9]/g, '_') : 'SemuaDokter'
  const filename = mode === 'internal'
    ? `Rekap_Radiologi_Internal_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`
    : `Rekap_Radiologi_Eksternal_${docName}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`

  const wsData = []

  if (mode === 'internal') {
    // Header Kolom Internal
    wsData.push([
      'No',
      'Tanggal Periksa',
      'Jam',
      'No. Rawat',
      'No. RM',
      'Nama Pasien',
      'Penanggung Jawab',
      'Status Rawat',
      'Kode Tindakan',
      'Nama Pemeriksaan',
      'Dokter Radiologi',
      'Dokter Perujuk',
      'Jasa Medis'
    ])
    
    filteredList.value.forEach((item, idx) => {
      wsData.push([
        idx + 1,
        item.tgl_periksa || '',
        item.jam || '',
        item.no_rawat || '',
        item.no_rkm_medis || '',
        item.nm_pasien || '',
        item.png_jawab || '',
        item.status_rawat || '',
        item.kd_jenis_prw || '',
        item.nm_perawatan || '',
        item.dokter_radiologi || '',
        item.dokter_perujuk || '',
        Number(item.jasa_dokter || 0)
      ])
    })

    // Footer Total Jasa Medis
    wsData.push([])
    wsData.push([
      '', '', '', '', '', '', '', '', '', '', '',
      'Total Jasa Medis',
      totalFilteredJasa.value
    ])
  } else {
    // Header Info Eksternal
    wsData.push(['LAPORAN REKAPITULASI PEMERIKSAAN RADIOLOGI (EKSTERNAL)'])
    wsData.push(['Dokter Spesialis Radiologi', selectedDoctorName.value || 'Semua Dokter'])
    wsData.push(['Periode Pemeriksaan', `${formatDateIndo(filters.tgl_awal)} s.d. ${formatDateIndo(filters.tgl_akhir)}`])
    if (selectedPenjabName.value) {
      wsData.push(['Cara Bayar', selectedPenjabName.value])
    }
    wsData.push(['Total Tindakan', `${filteredList.value.length} Tindakan`])
    wsData.push([]) // baris kosong pemisah

    // Header Kolom Tabel Eksternal
    wsData.push(['No', 'Tanggal Pemeriksaan', 'Jam Pemeriksaan', 'Nama Pemeriksaan / Tindakan'])

    filteredList.value.forEach((item, idx) => {
      wsData.push([
        idx + 1,
        item.tgl_periksa || '',
        item.jam || '',
        item.nm_perawatan || ''
      ])
    })

    // Footer Total
    wsData.push([])
    wsData.push(['', '', 'Total Tindakan', filteredList.value.length])
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-size lebar kolom agar rapi saat dibuka di Excel
  if (mode === 'internal') {
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 15 }, // Tanggal
      { wch: 10 }, // Jam
      { wch: 20 }, // No Rawat
      { wch: 12 }, // No RM
      { wch: 28 }, // Nama Pasien
      { wch: 22 }, // Penanggung Jawab
      { wch: 14 }, // Status Rawat
      { wch: 14 }, // Kode Tindakan
      { wch: 32 }, // Nama Pemeriksaan
      { wch: 28 }, // Dokter Radiologi
      { wch: 28 }, // Dokter Perujuk
      { wch: 16 }  // Jasa Medis
    ]
  } else {
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 20 }, // Tanggal
      { wch: 16 }, // Jam
      { wch: 45 }  // Tindakan
    ]
  }

  const wb = XLSX.utils.book_new()
  const sheetName = mode === 'internal' ? 'Rekap Internal' : 'Rekap Eksternal'
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  XLSX.writeFile(wb, filename)
  toast.success('File Excel (.xlsx) berhasil diexport')
}

// ==========================================
// CETAK LAPORAN EKSTERNAL (PDF)
// ==========================================
const printEksternalReport = async () => {
  if (filteredList.value.length === 0) {
    return toast.warning('Tidak ada data untuk dicetak')
  }

  try {
    toast.info('Menyiapkan berkas preview PDF...')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = 210
    const pageHeight = 297
    const marginX = 14

    // 1. Logo RSIA
    const logoImg = await loadImage(logoRsia)
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', marginX, 10, 16, 16)
    }

    // 2. Teks Kop Surat
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('RSIA AISYIYAH PEKAJANGAN', pageWidth / 2, 14, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(51, 65, 85)
    doc.text('Jl. Raya Pekajangan No. 610, Pekalongan, Jawa Tengah 51172', pageWidth / 2, 19, { align: 'center' })
    doc.text('Telp. (0285) 785909 | Email: rsiap_pkj@yahoo.co.id', pageWidth / 2, 23.5, { align: 'center' })

    // Garis Kop Ganda
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.6)
    doc.line(marginX, 28, pageWidth - marginX, 28)
    doc.setLineWidth(0.2)
    doc.line(marginX, 29, pageWidth - marginX, 29)

    // 3. Judul Laporan
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text('LAPORAN REKAPITULASI PELAYANAN DOKTER SPESIALIS RADIOLOGI', pageWidth / 2, 36, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('Lampiran Rekapitulasi Pelayanan Tenaga Medis Spesialis', pageWidth / 2, 40.5, { align: 'center' })

    // 4. Metadata Info
    const docName = selectedDoctorName.value || 'Semua Dokter Spesialis Radiologi'
    const periodeText = `${formatDateIndo(filters.tgl_awal)} s/d ${formatDateIndo(filters.tgl_akhir)}`
    
    let currentY = 46
    const lineSpacing = 4.2
    const labelX = marginX
    const colonX = marginX + 38
    const valX = colonX + 3

    const metaItems = [
      { label: 'Nama Dokter Spesialis', value: docName, bold: true },
      { label: 'Periode Pelayanan', value: periodeText }
    ]

    if (selectedPenjabName.value) {
      metaItems.push({ label: 'Cara Bayar', value: selectedPenjabName.value, bold: true })
    }

    metaItems.push({ label: 'Total Tindakan', value: `${filteredList.value.length} Tindakan`, bold: true })

    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    metaItems.forEach(item => {
      doc.setFont('Helvetica', 'normal')
      doc.text(item.label, labelX, currentY)
      doc.text(':', colonX, currentY)
      doc.setFont('Helvetica', item.bold ? 'bold' : 'normal')
      doc.text(item.value, valX, currentY)
      currentY += lineSpacing
    })

    // 5. Tabel Data dengan AutoTable
    const tableHead = [['No.', 'Tanggal', 'Jam', 'Nama Pemeriksaan Radiologi']]
    const tableBody = filteredList.value.map((item, idx) => [
      idx + 1,
      formatDateIndo(item.tgl_periksa),
      item.jam || '-',
      item.nm_perawatan || '-'
    ])

    autoTable(doc, {
      startY: currentY + 3,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        lineColor: [71, 85, 105],
        lineWidth: 0.2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.15
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { fontStyle: 'bold' }
      },
      margin: {
        left: marginX,
        right: marginX,
        top: 15,
        bottom: 16
      },
      didDrawPage: (data) => {
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`,
          pageWidth - marginX,
          pageHeight - 8,
          { align: 'right' }
        )
      }
    })

    // 6. Buat Blob & Buka Tab Preview PDF
    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)
    window.open(blobUrl, '_blank')
    toast.success('Preview PDF berhasil dibuka!')
  } catch (err) {
    console.error('Error generate PDF:', err)
    toast.error('Gagal menyiapkan berkas preview PDF')
  }
}

// ==========================================
// EXPORT EXCEL REKAP PER TINDAKAN (.XLSX)
// ==========================================
const exportRekapTindakanToExcel = () => {
  if (rekapPerTindakan.value.length === 0) {
    return toast.warning('Tidak ada data tindakan untuk diexport')
  }

  const docName = selectedDoctorName.value ? selectedDoctorName.value.replace(/[^a-zA-Z0-9]/g, '_') : 'SemuaDokter'
  const filename = `Rekap_Tindakan_Radiologi_${docName}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`

  const wsData = [
    ['LAPORAN REKAPITULASI PEMERIKSAAN RADIOLOGI PER TINDAKAN'],
    ['RSIA AISYIYAH PEKAJANGAN'],
    ['Dokter Spesialis Radiologi', selectedDoctorName.value || 'Semua Dokter Spesialis Radiologi'],
    ['Periode Pelayanan', `${formatDateIndo(filters.tgl_awal)} s/d ${formatDateIndo(filters.tgl_akhir)}`],
    ['Total Tindakan Dilakukan', `${filteredList.value.length} Tindakan`],
    ['Total Variasi Tindakan', `${rekapPerTindakan.value.length} Jenis Tindakan`],
    ['Total Jasa Medis', totalFilteredJasa.value],
    [],
    [
      'No',
      'Kode Tindakan',
      'Nama Pemeriksaan Radiologi',
      'Jumlah Tindakan',
      'Proporsi (%)',
      'Rawat Jalan (Ralan)',
      'Rawat Inap (Ranap)',
      'Total Jasa Medis (Rp)',
      'Rata-rata Jasa (Rp)'
    ]
  ]

  rekapPerTindakan.value.forEach((item, idx) => {
    wsData.push([
      idx + 1,
      item.kd_jenis_prw,
      item.nm_perawatan,
      item.jumlah,
      `${item.persentase}%`,
      item.ralan,
      item.ranap,
      item.total_jasa,
      item.rata_jasa
    ])
  })

  // Footer Total
  wsData.push([])
  wsData.push([
    '', '', 'TOTAL KESELURUHAN',
    filteredList.value.length,
    '100%',
    rekapPerTindakan.value.reduce((s, i) => s + i.ralan, 0),
    rekapPerTindakan.value.reduce((s, i) => s + i.ranap, 0),
    totalFilteredJasa.value,
    ''
  ])

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Kode Tindakan
    { wch: 38 }, // Nama Pemeriksaan
    { wch: 18 }, // Jumlah Tindakan
    { wch: 14 }, // Proporsi
    { wch: 18 }, // Ralan
    { wch: 18 }, // Ranap
    { wch: 22 }, // Total Jasa
    { wch: 18 }  // Rata-rata Jasa
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap per Tindakan')
  XLSX.writeFile(wb, filename)
  toast.success('File Excel (.xlsx) Rekap per Tindakan berhasil diexport')
}

// ==========================================
// CETAK PDF REKAP PER TINDAKAN
// ==========================================
const printRekapTindakanPdf = async () => {
  if (rekapPerTindakan.value.length === 0) {
    return toast.warning('Tidak ada data tindakan untuk dicetak')
  }

  try {
    toast.info('Menyiapkan berkas PDF rekap per tindakan...')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = 210
    const pageHeight = 297
    const marginX = 14

    // Kop Surat RSIA
    const logoImg = await loadImage(logoRsia)
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', marginX, 10, 16, 16)
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('RSIA AISYIYAH PEKAJANGAN', pageWidth / 2, 14, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(51, 65, 85)
    doc.text('Jl. Raya Pekajangan No. 610, Pekalongan, Jawa Tengah 51172', pageWidth / 2, 19, { align: 'center' })
    doc.text('Telp. (0285) 785909 | Email: rsiap_pkj@yahoo.co.id', pageWidth / 2, 23.5, { align: 'center' })

    // Garis Kop Ganda
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.6)
    doc.line(marginX, 28, pageWidth - marginX, 28)
    doc.setLineWidth(0.2)
    doc.line(marginX, 29, pageWidth - marginX, 29)

    // Judul Laporan
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text('REKAPITULASI PELAYANAN RADIOLOGI PER TINDAKAN', pageWidth / 2, 36, { align: 'center' })

    const docName = selectedDoctorName.value || 'Semua Dokter Spesialis Radiologi'
    const periodeText = `${formatDateIndo(filters.tgl_awal)} s/d ${formatDateIndo(filters.tgl_akhir)}`

    let currentY = 44
    const lineSpacing = 4.2
    const labelX = marginX
    const colonX = marginX + 38
    const valX = colonX + 3

    const meta = [
      { label: 'Dokter Spesialis', value: docName, bold: true },
      { label: 'Periode Pelayanan', value: periodeText },
      { label: 'Total Pelayanan', value: `${filteredList.value.length} Tindakan (${rekapPerTindakan.value.length} Jenis Tindakan)`, bold: true }
    ]

    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)
    meta.forEach((item) => {
      doc.setFont('Helvetica', 'normal')
      doc.text(item.label, labelX, currentY)
      doc.text(':', colonX, currentY)
      doc.setFont('Helvetica', item.bold ? 'bold' : 'normal')
      doc.text(item.value, valX, currentY)
      currentY += lineSpacing
    })

    const tableHead = [['No.', 'Kode', 'Nama Tindakan / Pemeriksaan', 'Jumlah', 'Proporsi', 'Total Jasa (Rp)']]
    const tableBody = rekapPerTindakan.value.map((t, idx) => [
      idx + 1,
      t.kd_jenis_prw,
      t.nm_perawatan,
      `${t.jumlah}x`,
      `${t.persentase}%`,
      `Rp ${Number(t.total_jasa || 0).toLocaleString('id-ID')}`
    ])

    // Footer Total
    tableBody.push([
      '',
      '',
      'TOTAL KESELURUHAN',
      `${filteredList.value.length}x`,
      '100%',
      `Rp ${Number(totalFilteredJasa.value || 0).toLocaleString('id-ID')}`
    ])

    autoTable(doc, {
      startY: currentY + 3,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        lineColor: [71, 85, 105],
        lineWidth: 0.2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.15
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { fontStyle: 'bold' },
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
      },
      margin: {
        left: marginX,
        right: marginX,
        top: 15,
        bottom: 16
      },
      didDrawPage: (data) => {
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`,
          pageWidth - marginX,
          pageHeight - 8,
          { align: 'right' }
        )
      }
    })

    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)
    window.open(blobUrl, '_blank')
    toast.success('Preview PDF Rekap per Tindakan dibuka!')
  } catch (err) {
    console.error('Error print rekap tindakan PDF:', err)
    toast.error('Gagal mencetak PDF rekap tindakan')
  }
}

onMounted(async () => {
  await Promise.all([
    fetchDokterRadiologi(),
    fetchPenjab()
  ])
  fetchData()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
}

/* Sizing Harmonization for Filters */
.form-control-filter {
  height: 38px !important;
  min-height: 38px !important;
  font-size: 0.85rem !important;
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: none !important;
}

.date-range-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.date-range-group .form-control-filter {
  flex: 1 1 0;
  min-width: 0 !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  font-size: 0.85rem !important;
}

.form-control-filter:focus {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15) !important;
}

.shift-btn-group {
  display: flex;
  height: 38px;
  min-height: 38px;
  padding: 3px;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  gap: 2px;
}

.shift-btn {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 0 8px;
}

.shift-btn:hover {
  color: #0f172a;
}

.shift-btn.active {
  background-color: #0d6efd;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(13, 110, 253, 0.3);
}

.btn-action-header {
  height: 38px !important;
  font-size: 0.85rem !important;
}

/* Segmented Tab Switcher */
.tab-switcher {
  display: inline-flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 4px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 22px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #0d6efd;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
