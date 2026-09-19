<template>
  <div class="pelayanan-dokter-page p-3 p-md-4">
    <!-- Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title m-0 d-flex align-items-center gap-2">
          <span>🩺</span>
          <span>Pelayanan & Logbook Dokter</span>
        </h1>
        <p class="page-subtitle text-muted m-0 mt-1">
          Monitoring aktivitas pelayanan klinis dan bukti kinerja dokter untuk perpanjangan SIP
        </p>
      </div>
      <div class="header-actions d-flex flex-wrap gap-2">
        <button 
          class="btn btn-sm btn-outline-success rounded-3 px-3 shadow-sm"
          @click="exportToExcel"
          :disabled="loading || !selectedDokter"
          title="Export Data ke Excel (.xlsx)"
        >
          <i class="fas fa-file-excel me-1"></i> Export Excel
        </button>
        <button 
          class="btn btn-sm btn-primary rounded-3 px-3 shadow-sm"
          @click="showPrintModal = true"
          :disabled="loading || !selectedDokter"
          title="Cetak Surat Keterangan Kinerja Pelayanan Dokter"
        >
          <i class="fas fa-print me-1"></i> Cetak Surat Keterangan SIP
        </button>
        <button 
          class="btn btn-sm btn-outline-secondary rounded-3 px-3 shadow-sm"
          @click="fetchData"
          :disabled="loading || !selectedDokter"
        >
          <i class="fas me-1" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 filter-card">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3 align-items-end">
          <!-- Pilih Dokter -->
          <div class="col-12 col-md-5 col-lg-4">
            <label class="form-label text-muted small fw-bold mb-1">
              <i class="fas fa-user-md text-primary me-1"></i> Dokter
            </label>
            <v-select
              v-model="selectedDokter"
              :options="dokterList"
              :reduce="dok => dok.kd_dokter"
              label="nm_dokter"
              :filter-by="filterDokter"
              placeholder="Cari nama atau spesialis dokter..."
              class="v-select-custom shadow-none"
              @update:modelValue="onDokterChange"
            >
              <template #option="option">
                <div class="d-flex flex-column py-1">
                  <span class="fw-semibold text-dark">{{ option.nm_dokter }}</span>
                  <span class="text-muted text-xs">{{ option.nm_sps }}</span>
                </div>
              </template>
              <template #selected-option="option">
                <div class="d-flex align-items-center gap-1 text-truncate">
                  <span class="fw-semibold">{{ option.nm_dokter || (selectedDokterObj && selectedDokterObj.nm_dokter) || option }}</span>
                  <span v-if="option.nm_sps || (selectedDokterObj && selectedDokterObj.nm_sps)" class="text-muted small">
                    ({{ option.nm_sps || selectedDokterObj.nm_sps }})
                  </span>
                </div>
              </template>
              <template #no-options="{ search }">
                <div class="p-2 text-muted text-xs text-center">
                  Tidak ada dokter yang cocok dengan "{{ search }}"
                </div>
              </template>
            </v-select>
          </div>

          <!-- Periode Cepat -->
          <div class="col-12 col-md-7 col-lg-4">
            <label class="form-label text-muted small fw-bold mb-1">
              <i class="fas fa-clock text-info me-1"></i> Preset Rentang Waktu
            </label>
            <div class="btn-group w-100 shadow-none" role="group">
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                :class="{ active: activePreset === 'this_month' }"
                @click="applyPreset('this_month')"
              >
                Bulan Ini
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                :class="{ active: activePreset === '3_months' }"
                @click="applyPreset('3_months')"
              >
                3 Bln
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                :class="{ active: activePreset === '1_year' }"
                @click="applyPreset('1_year')"
              >
                1 Thn
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                :class="{ active: activePreset === '5_years' }"
                @click="applyPreset('5_years')"
                title="Masa Berlaku 5 Tahun SIP Dokter"
              >
                5 Thn (SIP)
              </button>
            </div>
          </div>

          <!-- Tanggal Awal & Akhir -->
          <div class="col-6 col-md-6 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Dari Tanggal</label>
            <input type="date" class="form-control form-control-sm rounded-3 shadow-none" v-model="filters.tgl_awal" @change="fetchData">
          </div>
          <div class="col-6 col-md-6 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Sampai Tanggal</label>
            <input type="date" class="form-control form-control-sm rounded-3 shadow-none" v-model="filters.tgl_akhir" @change="fetchData">
          </div>
        </div>
      </div>
    </div>

    <!-- Doctor Info & SIP Status Banner -->
    <div v-if="dokterData" class="card border-0 shadow-sm rounded-4 mb-4 doctor-banner bg-white overflow-hidden">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="doctor-avatar shadow-sm rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4" style="width: 60px; height: 60px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
              {{ dokterData.nm_dokter?.charAt(0) || 'D' }}
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h5 class="fw-bold m-0 text-dark">{{ dokterData.nm_dokter }}</h5>
                <span class="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 rounded-pill">
                  {{ dokterData.nm_sps }}
                </span>
              </div>
              <div class="text-muted small mt-1 d-flex flex-wrap gap-3">
                <span><i class="fas fa-id-badge text-secondary me-1"></i><strong>Kode Dokter:</strong> {{ dokterData.kd_dokter }}</span>
                <span><i class="fas fa-certificate text-warning me-1"></i><strong>No. STR:</strong> {{ dokterData.nomor_str || '-' }}</span>
                <span><i class="fas fa-stamp text-info me-1"></i><strong>No. SIP:</strong> {{ dokterData.nomor_sip || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- SIP Validity Badge -->
          <div class="sip-status-card text-md-end p-2 px-3 rounded-3" :class="sipCardClass">
            <div class="d-flex align-items-center gap-2 justify-content-md-end">
              <i :class="sipIconClass"></i>
              <span class="fw-bold text-xs text-uppercase">{{ sipStatusLabel }}</span>
            </div>
            <div class="small fw-semibold mt-1">
              Masa Berlaku SIP: {{ formatDateIndo(dokterData.tanggal_akhir_sip) }}
            </div>
            <small v-if="sipDaysLeft !== null" class="d-block text-xs mt-0.5 opacity-80">
              {{ sipDaysText }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !dataLoaded" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-bold">Menghitung dan merekapitulasi data pelayanan dokter...</p>
    </div>

    <!-- Empty / Prompt State when no doctor selected -->
    <div v-else-if="!selectedDokter" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
      <div class="empty-icon-wrapper mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary" style="width: 76px; height: 76px;">
        <i class="fas fa-user-md fa-2x"></i>
      </div>
      <h5 class="fw-bold text-dark mb-2">Pilih Dokter untuk Memulai</h5>
      <p class="text-muted small mx-auto mb-3" style="max-width: 520px; line-height: 1.6;">
        Silakan cari dan pilih dokter pada filter di atas untuk melihat rekapitulasi data pelayanan medis, rincian tindakan klinis, dan logbook untuk kebutuhan perpanjangan SIP.
      </p>
      <div class="d-inline-flex flex-wrap align-items-center justify-content-center gap-2 text-xs text-muted">
        <span class="badge bg-light text-secondary border px-3 py-2"><i class="fas fa-search me-1 text-primary"></i>Ketik nama atau spesialisasi dokter</span>
        <span class="badge bg-light text-secondary border px-3 py-2"><i class="fas fa-calendar-alt me-1 text-info"></i>Sesuaikan periode tanggal pelayanan</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="dokterData" class="content-wrapper">
      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <!-- 1. Rawat Jalan -->
        <div class="col-6 col-md-4 col-xl">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Pemeriksaan Ralan</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(summary.total_kunjungan_ralan) }}</h3>
              <span class="text-muted small">pasien</span>
            </div>
            <div class="d-flex align-items-center gap-1 mt-2">
              <span class="badge bg-light text-secondary border text-xs px-1.5 py-0.5">Umum: {{ formatNumber(summary.ralan_umum) }}</span>
              <span class="badge bg-success-subtle text-success text-xs px-1.5 py-0.5">BPJS: {{ formatNumber(summary.ralan_bpjs) }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Visite Ranap -->
        <div class="col-6 col-md-4 col-xl">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Visite & Konsul Ranap</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(summary.total_visite_ranap) }}</h3>
              <span class="text-muted small">kali</span>
            </div>
            <div class="d-flex align-items-center gap-1 mt-2">
              <span class="badge bg-light text-secondary border text-xs px-1.5 py-0.5">Umum: {{ formatNumber(summary.visite_umum) }}</span>
              <span class="badge bg-success-subtle text-success text-xs px-1.5 py-0.5">BPJS: {{ formatNumber(summary.visite_bpjs) }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Tindakan Non-Operasi -->
        <div class="col-6 col-md-4 col-xl">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Tindakan Non-Operasi</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber((summary.total_tindakan_ralan || 0) + (summary.total_tindakan_ranap || 0)) }}</h3>
              <span class="text-muted small">tindakan</span>
            </div>
            <div class="d-flex align-items-center gap-1 mt-2">
              <span class="badge bg-light text-secondary border text-xs px-1.5 py-0.5">Umum: {{ formatNumber((summary.tindakan_ralan_umum || 0) + (summary.tindakan_ranap_umum || 0)) }}</span>
              <span class="badge bg-success-subtle text-success text-xs px-1.5 py-0.5">BPJS: {{ formatNumber((summary.tindakan_ralan_bpjs || 0) + (summary.tindakan_ranap_bpjs || 0)) }}</span>
            </div>
          </div>
        </div>

        <!-- 4. Operasi -->
        <div class="col-6 col-md-6 col-xl">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Tindakan Operasi</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-dark">{{ formatNumber(summary.total_operasi) }}</h3>
              <span class="text-muted small">prosedur</span>
            </div>
            <div class="d-flex align-items-center gap-1 mt-2">
              <span class="badge bg-light text-secondary border text-xs px-1.5 py-0.5">Umum: {{ formatNumber(summary.operasi_umum) }}</span>
              <span class="badge bg-success-subtle text-success text-xs px-1.5 py-0.5">BPJS: {{ formatNumber(summary.operasi_bpjs) }}</span>
            </div>
          </div>
        </div>

        <!-- 5. Total Pelayanan -->
        <div class="col-12 col-md-6 col-xl">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-info bg-soft-info">
            <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Pelayanan</span>
            <div class="d-flex align-items-baseline gap-1">
              <h3 class="fw-bold m-0 text-primary">{{ formatNumber(summary.total_pelayanan) }}</h3>
              <span class="text-muted small">kasus</span>
            </div>
            <div class="d-flex align-items-center gap-1 mt-2">
              <span class="badge bg-light text-secondary border text-xs px-1.5 py-0.5">Umum: {{ formatNumber(summary.total_umum) }}</span>
              <span class="badge bg-success-subtle text-success text-xs px-1.5 py-0.5">BPJS: {{ formatNumber(summary.total_bpjs) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-3 gap-2 bg-white p-2 rounded-4 shadow-sm" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link rounded-3 px-3 py-2 fw-semibold" 
            :class="{ active: activeTab === 'rekap' }"
            @click="activeTab = 'rekap'"
          >
            <i class="fas fa-list-ol me-1"></i> Rekapitulasi per Tindakan ({{ tindakanList.length }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link rounded-3 px-3 py-2 fw-semibold" 
            :class="{ active: activeTab === 'trend' }"
            @click="activeTab = 'trend'"
          >
            <i class="fas fa-calendar-alt me-1"></i> Rekapitulasi Bulanan (SIP)
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link rounded-3 px-3 py-2 fw-semibold" 
            :class="{ active: activeTab === 'logbook' }"
            @click="onSelectLogbookTab"
          >
            <i class="fas fa-book-medical me-1"></i> Logbook Pasien Terperinci
          </button>
        </li>
      </ul>

      <!-- Tab 1: Rekapitulasi per Tindakan -->
      <div v-show="activeTab === 'rekap'" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 class="fw-bold m-0 text-dark">📋 Rangkuman Frekuensi Tindakan & Prosedur Medis</h6>
            <small class="text-muted text-xs">Daftar tindakan yang dilakukan dokter beserta jumlah frekuensi pada periode ini</small>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <!-- Category Filter -->
            <select class="form-select form-select-sm rounded-3 shadow-none" v-model="rekapCategoryFilter" style="width: 160px;">
              <option value="all">Semua Kategori</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
              <option value="Visite Ranap">Visite Ranap</option>
              <option value="Tindakan Ranap">Tindakan Ranap</option>
              <option value="Operasi">Operasi</option>
            </select>
            <!-- Search -->
            <div class="position-relative" style="width: 220px;">
              <i class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                class="form-control form-control-sm ps-5 rounded-3 shadow-none" 
                placeholder="Cari nama tindakan..." 
                v-model="rekapSearch"
              />
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive" style="max-height: 540px; overflow-y: auto;">
            <table class="table table-hover align-middle m-0">
              <thead class="table-light sticky-top shadow-sm">
                <tr>
                  <th rowspan="2" class="ps-3 text-center align-middle" style="width: 45px;">#</th>
                  <th rowspan="2" class="align-middle" style="width: 100px;">KODE</th>
                  <th rowspan="2" class="align-middle">NAMA TINDAKAN / PROSEDUR</th>
                  <th rowspan="2" class="align-middle" style="width: 130px;">KATEGORI</th>
                  <th colspan="2" class="text-center py-1 bg-primary-subtle text-primary border-bottom-0">
                    <i class="fas fa-users me-1"></i>JENIS PASIEN
                  </th>
                  <th rowspan="2" class="text-end align-middle" style="width: 100px;">TOTAL</th>
                  <th rowspan="2" class="text-end pe-3 align-middle" style="width: 80px;">PROPORSI</th>
                </tr>
                <tr>
                  <th class="text-center py-1 bg-light text-muted small" style="width: 85px;">UMUM</th>
                  <th class="text-center py-1 bg-light text-muted small" style="width: 85px;">BPJS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTindakanList.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                    Tidak ada data tindakan yang sesuai dengan filter.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in filteredTindakanList" :key="item.kode + '-' + idx">
                  <td class="ps-3 text-center text-muted small fw-bold">{{ idx + 1 }}</td>
                  <td>
                    <code class="text-muted fw-bold">{{ item.kode }}</code>
                  </td>
                  <td>
                    <span class="fw-bold text-dark d-block">{{ item.nama_tindakan }}</span>
                  </td>
                  <td>
                    <span class="badge px-2 py-1 rounded-pill" :class="getCategoryBadgeClass(item.kategori)">
                      {{ item.kategori }}
                    </span>
                  </td>
                  <td class="text-center text-secondary fw-semibold">
                    {{ formatNumber(item.umum) }}
                  </td>
                  <td class="text-center text-success fw-semibold">
                    {{ formatNumber(item.bpjs) }}
                  </td>
                  <td class="text-end fw-bold text-dark fs-6">
                    {{ formatNumber(item.total) }}
                  </td>
                  <td class="text-end pe-3 text-muted small">
                    {{ calculatePercentage(item.total) }}%
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredTindakanList.length > 0" class="table-light fw-bold sticky-bottom">
                <tr>
                  <td colspan="4" class="text-end pe-3 py-2 text-dark">TOTAL TINDAKAN TERFILTER:</td>
                  <td class="text-center py-2 text-secondary">{{ formatNumber(filteredUmumTotal) }}</td>
                  <td class="text-center py-2 text-success">{{ formatNumber(filteredBpjsTotal) }}</td>
                  <td class="text-end py-2 text-dark fs-6">{{ formatNumber(filteredGrandTotal) }}</td>
                  <td class="text-end pe-3 py-2 text-muted small">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Logbook Pasien Terperinci -->
      <div v-show="activeTab === 'logbook'" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 class="fw-bold m-0 text-dark">📖 Logbook Pasien & Tindakan Terperinci</h6>
            <small class="text-muted text-xs">Riwayat kronologis pelayanan pasien per transaksi</small>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <!-- Filter Kategori Logbook -->
            <select class="form-select form-select-sm rounded-3 shadow-none" v-model="logbookFilter.kategori" @change="fetchLogbook" style="width: 170px;">
              <option value="all">Semua Jenis Layanan</option>
              <option value="ralan">Pemeriksaan Poli</option>
              <option value="visite">Visite Ranap</option>
              <option value="tindakan_ranap">Tindakan Ranap</option>
              <option value="tindakan_ralan">Tindakan Ralan</option>
              <option value="operasi">Operasi</option>
            </select>
            <!-- Search Pasien / Tindakan -->
            <div class="position-relative" style="width: 250px;">
              <i class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                class="form-control form-control-sm ps-5 rounded-3 shadow-none" 
                placeholder="Cari Pasien / No. RM / No. Rawat..." 
                v-model="logbookFilter.search"
                @input="debounceLogbookSearch"
              />
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
            <table class="table table-hover align-middle m-0">
              <thead class="table-light sticky-top shadow-sm">
                <tr>
                  <th class="ps-4" style="width: 120px;">TANGGAL</th>
                  <th style="width: 160px;">NO. RAWAT & RM</th>
                  <th>NAMA PASIEN</th>
                  <th style="width: 140px;">KATEGORI</th>
                  <th>LAYANAN / TINDAKAN</th>
                  <th>RUANGAN / POLI</th>
                  <th>DIAGNOSA (ICD-10)</th>
                  <th class="pe-4" style="width: 140px;">PERAN DOKTER</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="logbookLoading">
                  <td colspan="8" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span class="text-muted fw-bold">Memuat rincian logbook...</span>
                  </td>
                </tr>
                <tr v-else-if="logbookItems.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                    Tidak ada logbook pelayanan yang ditemukan.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in logbookItems" :key="idx">
                  <td class="ps-4">
                    <span class="fw-bold text-dark d-block">{{ formatDateShort(item.tgl_pelayanan) }}</span>
                    <small class="text-muted text-xs">{{ item.jam_pelayanan }}</small>
                  </td>
                  <td>
                    <span class="fw-semibold text-dark d-block text-xs font-monospace">{{ item.no_rawat }}</span>
                    <small class="badge bg-light text-secondary border">RM: {{ item.no_rkm_medis }}</small>
                  </td>
                  <td>
                    <span class="fw-bold text-dark d-block">{{ item.nm_pasien }}</span>
                    <small class="text-muted text-xs">{{ item.jk === 'L' ? 'Laki-Laki' : 'Perempuan' }} • {{ item.umur || '-' }}</small>
                  </td>
                  <td>
                    <span class="badge px-2 py-1 rounded-pill" :class="getCategoryBadgeClass(item.kategori)">
                      {{ item.kategori }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-bold text-dark d-block text-sm">{{ item.nm_perawatan }}</span>
                  </td>
                  <td>
                    <span class="text-muted small">{{ item.ruangan_poli || '-' }}</span>
                  </td>
                  <td>
                    <span class="text-dark small">{{ item.diagnosa || '-' }}</span>
                  </td>
                  <td class="pe-4">
                    <span class="badge bg-secondary-subtle text-secondary fw-semibold">
                      {{ item.peran }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-3" v-if="logbookPagination.total > 0">
            <div class="text-muted small">
              Menampilkan <span class="fw-bold text-dark">{{ (logbookPagination.current_page - 1) * logbookPagination.per_page + 1 }}</span>
              s/d <span class="fw-bold text-dark">{{ Math.min(logbookPagination.current_page * logbookPagination.per_page, logbookPagination.total) }}</span>
              dari <span class="fw-bold text-dark">{{ formatNumber(logbookPagination.total) }}</span> baris
            </div>
            <div class="d-flex align-items-center gap-2">
              <select class="form-select form-select-sm rounded-3 shadow-none" v-model="logbookPagination.per_page" @change="changeLogbookPerPage" style="width: 80px;">
                <option :value="15">15</option>
                <option :value="30">30</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <nav>
                <ul class="pagination pagination-sm m-0">
                  <li class="page-item" :class="{ disabled: logbookPagination.current_page === 1 }">
                    <button class="page-link rounded-start-3" @click="changeLogbookPage(logbookPagination.current_page - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  <li class="page-item active">
                    <span class="page-link">{{ logbookPagination.current_page }} / {{ logbookPagination.last_page }}</span>
                  </li>
                  <li class="page-item" :class="{ disabled: logbookPagination.current_page === logbookPagination.last_page }">
                    <button class="page-link rounded-end-3" @click="changeLogbookPage(logbookPagination.current_page + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Rekapitulasi Pelayanan per Bulan (Format Standar SIP) -->
      <div v-show="activeTab === 'trend'" class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 class="fw-bold m-0 text-dark">📅 Rekapitulasi Pelayanan per Bulan (Format Standar SIP)</h6>
            <small class="text-muted text-xs">Distribusi bulanan rincian jumlah pasien Umum dan BPJS untuk bukti kinerja rekomendasi SIP dokter</small>
          </div>
          <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1.5 rounded-pill">
            <i class="fas fa-calendar-check me-1"></i> {{ monthlyTrend.length }} Bulan
          </span>
        </div>
        <div class="card-body p-0">
          <div v-if="monthlyTrend.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-calendar-times fa-2x mb-2 d-block opacity-50"></i>
            Tidak ada data rekapitulasi pada rentang tanggal ini.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover table-bordered align-middle text-center m-0">
              <thead class="table-light">
                <tr>
                  <th rowspan="2" class="align-middle text-center" style="width: 50px;">NO</th>
                  <th rowspan="2" class="align-middle text-start ps-4" style="min-width: 180px;">PERIODE BULAN</th>
                  <th colspan="2" class="text-center py-2 bg-primary-subtle text-primary border-bottom-0">
                    <i class="fas fa-user-friends me-1"></i> JENIS PASIEN
                  </th>
                  <th rowspan="2" class="align-middle text-end pe-4" style="min-width: 150px;">TOTAL PELAYANAN</th>
                </tr>
                <tr>
                  <th class="text-center bg-light py-2" style="width: 140px;">UMUM</th>
                  <th class="text-center bg-light py-2" style="width: 140px;">BPJS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in monthlyTrend" :key="item.bulan">
                  <td class="text-muted small fw-bold">{{ idx + 1 }}</td>
                  <td class="text-start ps-4 fw-bold text-dark">{{ item.label }}</td>
                  <td class="fw-semibold text-secondary fs-6">{{ formatNumber(item.umum) }}</td>
                  <td class="fw-semibold text-success fs-6">{{ formatNumber(item.bpjs) }}</td>
                  <td class="text-end pe-4 fw-bold text-primary fs-6">{{ formatNumber(item.total) }}</td>
                </tr>
              </tbody>
              <tfoot class="table-light fw-bold">
                <tr>
                  <td colspan="2" class="text-end pe-4 py-3 text-dark">TOTAL KESELURUHAN:</td>
                  <td class="text-center py-3 text-secondary fs-6">{{ formatNumber(summary.total_umum) }}</td>
                  <td class="text-center py-3 text-success fs-6">{{ formatNumber(summary.total_bpjs) }}</td>
                  <td class="text-end pe-4 py-3 text-primary fs-5">{{ formatNumber(summary.total_pelayanan) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Modal -->
    <PrintSuratPelayananDokterModal
      :visible="showPrintModal"
      :dokter="dokterData"
      :period="filters"
      :summary="summary"
      :operasiBreakdown="operasiBreakdown"
      :tindakanSummary="tindakanList"
      :monthlyTrend="monthlyTrend"
      @close="showPrintModal = false"
    />
  </div>
</template>

<script>
import api from '@/services/api'
import * as XLSX from 'xlsx'
import PrintSuratPelayananDokterModal from './components/PrintSuratPelayananDokterModal.vue'

export default {
  name: 'PelayananDokterView',
  components: {
    PrintSuratPelayananDokterModal
  },
  data() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')

    return {
      loading: false,
      dataLoaded: false,
      logbookLoading: false,
      dokterList: [],
      selectedDokter: '',
      activePreset: 'this_month',
      activeTab: 'rekap',
      showPrintModal: false,
      searchTimeout: null,

      filters: {
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`
      },

      dokterData: null,
      summary: {},
      operasiBreakdown: {},
      tindakanList: [],
      monthlyTrend: [],

      // Rekap Filter
      rekapSearch: '',
      rekapCategoryFilter: 'all',

      // Logbook State
      logbookFilter: {
        kategori: 'all',
        search: ''
      },
      logbookItems: [],
      logbookPagination: {
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1
      }
    }
  },
  computed: {
    sipCardClass() {
      const st = this.dokterData?.sip_status
      if (st === 'VALID') return 'bg-success-subtle text-success border border-success-subtle'
      if (st === 'WARNING') return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
      if (st === 'EXPIRED') return 'bg-danger-subtle text-danger border border-danger-subtle'
      return 'bg-light text-secondary border'
    },
    sipIconClass() {
      const st = this.dokterData?.sip_status
      if (st === 'VALID') return 'fas fa-check-circle text-success'
      if (st === 'WARNING') return 'fas fa-exclamation-triangle text-warning'
      if (st === 'EXPIRED') return 'fas fa-times-circle text-danger'
      return 'fas fa-info-circle text-secondary'
    },
    sipStatusLabel() {
      const st = this.dokterData?.sip_status
      if (st === 'VALID') return 'SIP Aktif'
      if (st === 'WARNING') return 'SIP Segera Berakhir'
      if (st === 'EXPIRED') return 'SIP Kadaluarsa'
      return 'Status SIP: Tidak Terdata'
    },
    sipDaysLeft() {
      return this.dokterData?.days_left ?? null
    },
    sipDaysText() {
      const d = this.sipDaysLeft
      if (d === null) return ''
      if (d < 0) return `Telah berakhir ${Math.abs(d)} hari yang lalu`
      if (d === 0) return 'Berakhir hari ini'
      return `Sisa masa berlaku: ${d} hari lagi`
    },
    filteredTindakanList() {
      return this.tindakanList.filter(item => {
        const matchCategory = this.rekapCategoryFilter === 'all' || item.kategori === this.rekapCategoryFilter
        const matchSearch = !this.rekapSearch || item.nama_tindakan.toLowerCase().includes(this.rekapSearch.toLowerCase()) || item.kode.toLowerCase().includes(this.rekapSearch.toLowerCase())
        return matchCategory && matchSearch
      })
    },
    filteredUmumTotal() {
      return this.filteredTindakanList.reduce((sum, item) => sum + (Number(item.umum) || 0), 0)
    },
    filteredBpjsTotal() {
      return this.filteredTindakanList.reduce((sum, item) => sum + (Number(item.bpjs) || 0), 0)
    },
    filteredGrandTotal() {
      return this.filteredTindakanList.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
    },
    selectedDokterObj() {
      return this.dokterList.find(d => d.kd_dokter === this.selectedDokter) || null
    }
  },
  async mounted() {
    await this.fetchDokters()

    // Check query params if kd_dokter passed via URL
    const queryDokter = this.$route.query.kd_dokter
    if (queryDokter) {
      this.selectedDokter = queryDokter
      this.fetchData()
    }
    // Note: dokter tidak terpilih secara otomatis saat pertama kali dibuka
  },
  methods: {
    filterDokter(option, label, search) {
      if (!search) return true
      const q = search.toLowerCase()
      const nm = (option.nm_dokter || '').toLowerCase()
      const sps = (option.nm_sps || '').toLowerCase()
      const kd = (option.kd_dokter || '').toLowerCase()
      return nm.includes(q) || sps.includes(q) || kd.includes(q)
    },
    async fetchDokters() {
      try {
        const res = await api.get('/laporan/pelayanan-dokter/dokters')
        if (res.data && res.data.success) {
          this.dokterList = res.data.data
        }
      } catch (err) {
        console.error('Error fetching dokters:', err)
      }
    },
    onDokterChange(val) {
      if (val) {
        this.fetchData()
      } else {
        this.dokterData = null
        this.dataLoaded = false
        this.summary = {}
        this.operasiBreakdown = {}
        this.tindakanList = []
        this.monthlyTrend = []
        this.logbookItems = []
      }
    },
    applyPreset(preset) {
      this.activePreset = preset
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')

      if (preset === 'this_month') {
        this.filters.tgl_awal = `${yyyy}-${mm}-01`
        this.filters.tgl_akhir = `${yyyy}-${mm}-${dd}`
      } else if (preset === '3_months') {
        const d3 = new Date()
        d3.setMonth(d3.getMonth() - 3)
        const y3 = d3.getFullYear()
        const m3 = String(d3.getMonth() + 1).padStart(2, '0')
        const day3 = String(d3.getDate()).padStart(2, '0')
        this.filters.tgl_awal = `${y3}-${m3}-${day3}`
        this.filters.tgl_akhir = `${yyyy}-${mm}-${dd}`
      } else if (preset === '1_year') {
        const d1 = new Date()
        d1.setFullYear(d1.getFullYear() - 1)
        const y1 = d1.getFullYear()
        const m1 = String(d1.getMonth() + 1).padStart(2, '0')
        const day1 = String(d1.getDate()).padStart(2, '0')
        this.filters.tgl_awal = `${y1}-${m1}-${day1}`
        this.filters.tgl_akhir = `${yyyy}-${mm}-${dd}`
      } else if (preset === '5_years') {
        const d5 = new Date()
        d5.setFullYear(d5.getFullYear() - 5)
        const y5 = d5.getFullYear()
        const m5 = String(d5.getMonth() + 1).padStart(2, '0')
        const day5 = String(d5.getDate()).padStart(2, '0')
        this.filters.tgl_awal = `${y5}-${m5}-${day5}`
        this.filters.tgl_akhir = `${yyyy}-${mm}-${dd}`
      }
      this.fetchData()
    },
    async fetchData() {
      if (!this.selectedDokter) return
      this.loading = true

      try {
        const res = await api.get('/laporan/pelayanan-dokter', {
          params: {
            kd_dokter: this.selectedDokter,
            tgl_awal: this.filters.tgl_awal,
            tgl_akhir: this.filters.tgl_akhir
          }
        })

        if (res.data && res.data.success) {
          const d = res.data.data
          this.dokterData = d.dokter
          this.summary = d.summary
          this.operasiBreakdown = d.operasi_breakdown || {}
          this.tindakanList = d.tindakan_summary || []
          this.monthlyTrend = d.monthly_trend || []
          this.dataLoaded = true

          // Also refresh logbook if active tab is logbook
          if (this.activeTab === 'logbook') {
            this.fetchLogbook()
          }
        }
      } catch (err) {
        console.error('Error fetching pelayanan dokter:', err)
      } finally {
        this.loading = false
      }
    },
    onSelectLogbookTab() {
      this.activeTab = 'logbook'
      if (this.logbookItems.length === 0) {
        this.fetchLogbook()
      }
    },
    async fetchLogbook() {
      if (!this.selectedDokter) return
      this.logbookLoading = true

      try {
        const res = await api.get('/laporan/pelayanan-dokter/logbook', {
          params: {
            kd_dokter: this.selectedDokter,
            tgl_awal: this.filters.tgl_awal,
            tgl_akhir: this.filters.tgl_akhir,
            kategori: this.logbookFilter.kategori,
            search: this.logbookFilter.search,
            page: this.logbookPagination.current_page,
            limit: this.logbookPagination.per_page
          }
        })

        if (res.data && res.data.success) {
          this.logbookItems = res.data.data || []
          this.logbookPagination = res.data.pagination || this.logbookPagination
        }
      } catch (err) {
        console.error('Error fetching logbook:', err)
      } finally {
        this.logbookLoading = false
      }
    },
    debounceLogbookSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.logbookPagination.current_page = 1
        this.fetchLogbook()
      }, 400)
    },
    changeLogbookPage(page) {
      if (page < 1 || page > this.logbookPagination.last_page) return
      this.logbookPagination.current_page = page
      this.fetchLogbook()
    },
    changeLogbookPerPage() {
      this.logbookPagination.current_page = 1
      this.fetchLogbook()
    },
    getCategoryBadgeClass(kat) {
      if (kat === 'Rawat Jalan' || kat === 'Tindakan Ralan') return 'bg-primary-subtle text-primary'
      if (kat === 'Visite Ranap') return 'bg-success-subtle text-success'
      if (kat === 'Tindakan Ranap') return 'bg-warning-subtle text-warning-emphasis'
      if (kat === 'Operasi') return 'bg-danger-subtle text-danger'
      return 'bg-secondary-subtle text-secondary'
    },
    calculatePercentage(val) {
      const total = this.summary.total_pelayanan || 1
      return ((val / total) * 100).toFixed(1)
    },
    formatNumber(num) {
      return (Number(num) || 0).toLocaleString('id-ID')
    },
    formatDateIndo(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    formatDateShort(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    exportToExcel() {
      if (!this.dokterData) return

      // Sheet 1: Ringkasan Pelayanan
      const summaryData = [
        ['SURAT KETERANGAN / REKAPITULASI PELAYANAN DOKTER'],
        ['RSIA AISYIYAH PEKAJANGAN'],
        [],
        ['Nama Dokter', this.dokterData.nm_dokter],
        ['Spesialisasi', this.dokterData.nm_sps],
        ['No. STR', this.dokterData.nomor_str || '-'],
        ['No. SIP', this.dokterData.nomor_sip || '-'],
        ['Masa Berlaku SIP', this.formatDateIndo(this.dokterData.tanggal_akhir_sip)],
        ['Periode Rekap', `${this.formatDateIndo(this.filters.tgl_awal)} s/d ${this.formatDateIndo(this.filters.tgl_akhir)}`],
        [],
        ['KATEGORI PELAYANAN', 'PASIEN UMUM', 'PASIEN BPJS', 'TOTAL FREKUENSI'],
        ['1. Kunjungan Rawat Jalan (Poli/IGD)', this.summary.ralan_umum || 0, this.summary.ralan_bpjs || 0, this.summary.total_kunjungan_ralan || 0],
        ['2. Visite & Konsultasi Rawat Inap', this.summary.visite_umum || 0, this.summary.visite_bpjs || 0, this.summary.total_visite_ranap || 0],
        ['3. Tindakan Ralan Non-Operasi', this.summary.tindakan_ralan_umum || 0, this.summary.tindakan_ralan_bpjs || 0, this.summary.total_tindakan_ralan || 0],
        ['4. Tindakan Ranap Non-Operasi', this.summary.tindakan_ranap_umum || 0, this.summary.tindakan_ranap_bpjs || 0, this.summary.total_tindakan_ranap || 0],
        ['5. Tindakan Operasi / Pembedahan', this.summary.operasi_umum || 0, this.summary.operasi_bpjs || 0, this.summary.total_operasi || 0],
        ['   - Operator Utama', '-', '-', this.operasiBreakdown.operator_utama || 0],
        ['   - Operator Pendamping', '-', '-', this.operasiBreakdown.operator_pendamping || 0],
        ['   - Dokter Anestesi / Resusitasi', '-', '-', (this.operasiBreakdown.dokter_anestesi || 0) + (this.operasiBreakdown.dokter_anak || 0)],
        ['TOTAL PELAYANAN KLINIS', this.summary.total_umum || 0, this.summary.total_bpjs || 0, this.summary.total_pelayanan || 0]
      ]

      // Sheet 2: Rekapitulasi per Tindakan
      const tindakanData = this.tindakanList.map((item, idx) => ({
        'No': idx + 1,
        'Kode': item.kode,
        'Nama Tindakan / Prosedur': item.nama_tindakan,
        'Kategori': item.kategori,
        'Pasien Umum': item.umum || 0,
        'Pasien BPJS': item.bpjs || 0,
        'Total Frekuensi': item.total || 0,
        'Proporsi (%)': `${this.calculatePercentage(item.total)}%`
      }))

      // Sheet 3: Rekapitulasi Bulanan (Jenis Pasien)
      const bulananData = this.monthlyTrend.map((item, idx) => ({
        'No': idx + 1,
        'Periode Bulan': item.label,
        'Pasien Umum': item.umum || 0,
        'Pasien BPJS': item.bpjs || 0,
        'Total Pelayanan': item.total || 0
      }))

      const wb = XLSX.utils.book_new()
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      const wsBulanan = XLSX.utils.json_to_sheet(bulananData)
      const wsTindakan = XLSX.utils.json_to_sheet(tindakanData)

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Kinerja')
      XLSX.utils.book_append_sheet(wb, wsBulanan, 'Rekap Bulanan (SIP)')
      XLSX.utils.book_append_sheet(wb, wsTindakan, 'Rincian Tindakan')

      const sanitizedName = (this.dokterData.nm_dokter || 'Dokter').replace(/[^a-zA-Z0-9]/g, '_')
      XLSX.writeFile(wb, `Rekap_Pelayanan_${sanitizedName}_${this.filters.tgl_awal}_sd_${this.filters.tgl_akhir}.xlsx`)
    }
  }
}
</script>

<style scoped>
.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.bg-soft-info {
  background-color: #f0f9ff;
}

.bg-primary-subtle {
  background-color: #e0f2fe;
  color: #0369a1;
}

.bg-success-subtle {
  background-color: #dcfce7;
  color: #15803d;
}

.bg-warning-subtle {
  background-color: #fef9c3;
  color: #854d0e;
}

.bg-danger-subtle {
  background-color: #fee2e2;
  color: #b91c1c;
}

.bg-secondary-subtle {
  background-color: #f1f5f9;
  color: #475569;
}

.doctor-banner {
  border-left: 5px solid #0284c7 !important;
}

.nav-pills .nav-link {
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-pills .nav-link.active {
  background-color: #0284c7;
  color: #ffffff;
}

/* Custom v-select styling */
:deep(.v-select-custom .vs__dropdown-toggle) {
  min-height: 38px;
  border-color: #dee2e6;
  border-radius: 0.5rem;
  background-color: #fff;
  padding: 2px 4px;
}

:deep(.v-select-custom.vs--open .vs__dropdown-toggle) {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

:deep(.v-select-custom .vs__selected) {
  font-size: 0.875rem;
  color: #212529;
  margin: 2px 2px 0;
}

:deep(.v-select-custom .vs__search) {
  font-size: 0.875rem;
  margin: 2px 0 0;
  padding: 0 4px;
}

:deep(.v-select-custom .vs__search::placeholder) {
  color: #6c757d;
  font-size: 0.85rem;
}

:deep(.v-select-custom .vs__dropdown-menu) {
  max-height: 280px;
  z-index: 1050;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 4px 0;
}

:deep(.v-select-custom .vs__dropdown-option) {
  padding: 6px 12px;
  border-bottom: 1px solid #f8fafc;
}

:deep(.v-select-custom .vs__dropdown-option:last-child) {
  border-bottom: none;
}

:deep(.v-select-custom .vs__dropdown-option--highlight) {
  background-color: #0284c7;
  color: white;
}

:deep(.v-select-custom .vs__dropdown-option--highlight .text-muted),
:deep(.v-select-custom .vs__dropdown-option--highlight .text-dark) {
  color: white !important;
}

:deep(.v-select-custom .vs__clear),
:deep(.v-select-custom .vs__open-indicator) {
  fill: #94a3b8;
}
</style>
