<template>
  <div class="rekap-obat-pasien-page p-3 p-md-4">
    <!-- Page Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title m-0">💊 Rekap Penggunaan Obat Pasien</h1>
        <p class="page-subtitle text-muted m-0 mt-1">
          Rekapitulasi biaya obat, embalase, tuslah, dan total biaya obat per pasien (Berdasar Tanggal Masuk & Berdasar Tanggal Pulang)
        </p>
      </div>
      <div class="header-actions d-flex flex-wrap gap-2">
        <button 
          class="btn btn-sm btn-outline-secondary rounded-3 px-3 shadow-sm text-nowrap" 
          @click="resetFilters" 
          :disabled="loading"
        >
          <i class="fas fa-undo me-1"></i> Reset
        </button>
        <button 
          class="btn btn-sm btn-success rounded-3 px-3 shadow-sm text-nowrap text-white" 
          @click="exportData" 
          :disabled="loading || exportLoading"
        >
          <i class="fas me-1" :class="exportLoading ? 'fa-spinner fa-spin' : 'fa-file-excel'"></i>
          {{ exportLoading ? 'Mengekspor...' : 'Export Excel / CSV' }}
        </button>
        <button 
          class="btn btn-sm btn-primary rounded-3 px-3 shadow-sm text-nowrap" 
          @click="fetchData" 
          :disabled="loading"
        >
          <i class="fas me-1" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i> Refresh Data
        </button>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <!-- Tabs (Card Header) -->
      <div class="card-header bg-transparent border-bottom p-2 p-md-3">
        <ul class="nav nav-pills gap-2">
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold px-3 py-2" 
              :class="{ active: filters.tab === 'masuk' }" 
              @click="switchTab('masuk')"
            >
              <i class="fas fa-calendar-check me-1"></i> Berdasarkan Tanggal Masuk (Registrasi)
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold px-3 py-2" 
              :class="{ active: filters.tab === 'pulang' }" 
              @click="switchTab('pulang')"
            >
              <i class="fas fa-sign-out-alt me-1"></i> Berdasarkan Tanggal Pulang
            </button>
          </li>
        </ul>
      </div>

      <!-- Filters Section -->
      <div class="card-body p-3 p-md-4 border-bottom bg-light bg-opacity-25">
        <!-- Row 1: Tanggal & Primary Filters -->
        <div class="row g-3">
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Mulai</label>
            <input 
              type="date" 
              class="form-control rounded-3 shadow-none form-control-sm" 
              v-model="filters.tgl_awal" 
              @change="fetchData"
            >
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Tanggal Akhir</label>
            <input 
              type="date" 
              class="form-control rounded-3 shadow-none form-control-sm" 
              v-model="filters.tgl_akhir" 
              @change="fetchData"
            >
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <label class="form-label text-muted small fw-bold mb-1">Status Pelayanan</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.status" 
              @change="fetchData"
            >
              <option value="all">Semua Status</option>
              <option value="Ralan">Rawat Jalan (Ralan)</option>
              <option value="Ranap">Rawat Inap (Ranap)</option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Cara Bayar (Penjab)</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kd_pj" 
              @change="fetchData"
            >
              <option value="all">Semua Cara Bayar</option>
              <option v-for="pj in attributes.penjab" :key="pj.kd_pj" :value="pj.kd_pj">
                {{ pj.png_jawab }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Dokter Peresep / DPJP</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kd_dokter" 
              @change="fetchData"
            >
              <option value="all">Semua Dokter</option>
              <option v-for="dok in attributes.dokter" :key="dok.kd_dokter" :value="dok.kd_dokter">
                {{ dok.nm_dokter }}
              </option>
            </select>
          </div>
        </div>

        <!-- Row 2: Secondary Drug Filters -->
        <div class="row g-3 mt-1">
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Depo / Asal Bangsal</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kd_bangsal" 
              @change="fetchData"
            >
              <option value="all">Semua Depo / Bangsal</option>
              <option v-for="b in attributes.bangsal" :key="b.kd_bangsal" :value="b.kd_bangsal">
                {{ b.nm_bangsal }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Jenis Barang</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kdjns" 
              @change="fetchData"
            >
              <option value="all">Semua Jenis</option>
              <option v-for="j in attributes.jenis" :key="j.kdjns" :value="j.kdjns">
                {{ j.nama }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Kategori Barang</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kode_kategori" 
              @change="fetchData"
            >
              <option value="all">Semua Kategori</option>
              <option v-for="k in attributes.kategori" :key="k.kode" :value="k.kode">
                {{ k.nama }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label text-muted small fw-bold mb-1">Golongan Barang</label>
            <select 
              class="form-select rounded-3 shadow-none form-select-sm" 
              v-model="filters.kode_golongan" 
              @change="fetchData"
            >
              <option value="all">Semua Golongan</option>
              <option v-for="g in attributes.golongan" :key="g.kode" :value="g.kode">
                {{ g.nama }}
              </option>
            </select>
          </div>
        </div>

        <!-- Row 3: Keyword Search -->
        <div class="row g-3 mt-1 align-items-end">
          <div class="col-12 col-md-8 col-lg-9">
            <label class="form-label text-muted small fw-bold mb-1">Pencarian Cepat</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0 shadow-none" 
                placeholder="Cari No. Rawat, No. RM, Nama Pasien, Nama Obat, atau Kode Obat..." 
                v-model="filters.search" 
                @keyup.enter="fetchData"
              >
              <button 
                v-if="filters.search" 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="filters.search = ''; fetchData()"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="col-12 col-md-4 col-lg-3 d-flex gap-2">
            <button 
              class="btn btn-sm btn-primary w-100 rounded-3 shadow-sm fw-bold" 
              @click="fetchData" 
              :disabled="loading"
            >
              <i class="fas fa-filter me-1"></i> Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="card-body p-3 p-md-4 border-bottom bg-light bg-opacity-10">
        <div class="row g-3">
          <!-- Total Pasien -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Pasien</span>
              <div class="d-flex align-items-baseline gap-1">
                <h4 class="fw-bold m-0 text-dark">{{ formatNumber(summary.total_pasien) }}</h4>
                <span class="text-muted small">org</span>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-user-injured me-1 text-primary"></i>Pasien Dilayani
              </small>
            </div>
          </div>

          <!-- Total Item Obat -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-info bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Qty Obat</span>
              <div class="d-flex align-items-baseline gap-1">
                <h4 class="fw-bold m-0 text-dark">{{ formatNumber(summary.total_qty) }}</h4>
                <span class="text-muted small">pcs</span>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-pills me-1 text-info"></i>Fisik Obat Diserahkan
              </small>
            </div>
          </div>

          <!-- Total Harga Beli -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Harga Beli (Modal)</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-danger">{{ formatRupiah(summary.total_beli) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-shopping-cart me-1 text-danger"></i>Nilai Pengadaan Obat
              </small>
            </div>
          </div>

          <!-- Total Biaya Jual Obat -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-secondary bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Biaya Obat (Jual)</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-dark">{{ formatRupiah(summary.total_biaya) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-prescription-bottle-alt me-1 text-secondary"></i>Harga Jual Sebelum Embalase/Tuslah
              </small>
            </div>
          </div>

          <!-- Margin Keuntungan Obat -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-teal bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Margin Obat (Jual - Beli)</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-teal">{{ formatRupiah(summary.margin) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-chart-line me-1 text-teal"></i>Selisih Keuntungan Obat
              </small>
            </div>
          </div>

          <!-- Total Embalase -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Embalase</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-dark">{{ formatRupiah(summary.total_embalase) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-box me-1 text-warning"></i>Kemasan & Plastik
              </small>
            </div>
          </div>

          <!-- Total Tuslah -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-indigo bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Tuslah</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-dark">{{ formatRupiah(summary.total_tuslah) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-hand-holding-medical me-1 text-primary"></i>Jasa Resep
              </small>
            </div>
          </div>

          <!-- Grand Total Biaya -->
          <div class="col-6 col-md-3 col-xl-3">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success bg-white">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Grand Total Tagihan</span>
              <div class="d-flex align-items-baseline gap-1">
                <h5 class="fw-bold m-0 text-success">{{ formatRupiah(summary.grand_total) }}</h5>
              </div>
              <small class="text-muted text-xs mt-2 d-block">
                <i class="fas fa-money-check-alt me-1 text-success"></i>Akumulasi Keseluruhan
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Header Bar -->
      <div class="p-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 fs-7">
            {{ pagination.total }} Pasien Ditemukan
          </span>
          <button 
            class="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0 fs-7"
            @click="toggleExpandAll"
            v-if="items.length > 0"
          >
            <i class="fas me-1" :class="allExpanded ? 'fa-compress-alt' : 'fa-expand-alt'"></i>
            {{ allExpanded ? 'Tutup Semua Rincian' : 'Buka Semua Rincian' }}
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="small text-muted">Baris per halaman:</span>
          <select 
            class="form-select form-select-sm rounded-3 shadow-none w-auto" 
            v-model="pagination.per_page" 
            @change="changePerPage"
          >
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Table Content Area -->
      <div class="table-responsive">
        <!-- Loading Spinner -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 2.5rem; height: 2.5rem;"></div>
          <p class="mt-2 text-muted fw-bold small">Memuat rekap obat pasien...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="text-center py-5">
          <div class="mb-3 text-muted">
            <i class="fas fa-folder-open fa-3x text-secondary opacity-50"></i>
          </div>
          <h6 class="fw-bold text-dark">Tidak ada data ditemukan</h6>
          <p class="text-muted small mb-0">Coba ubah filter tanggal atau kata kunci pencarian Anda.</p>
        </div>

        <!-- Hierarchical Data Table -->
        <table v-else class="table table-hover table-bordered align-middle m-0 text-nowrap">
          <thead class="table-light text-muted small text-uppercase fw-bold">
            <tr>
              <th style="width: 40px;" class="text-center">#</th>
              <th style="width: 110px;">{{ filters.tab === 'masuk' ? 'Tgl Masuk' : 'Tgl Pulang' }}</th>
              <th style="width: 140px;">No. Rawat</th>
              <th style="width: 100px;">No. RM</th>
              <th>Nama Pasien</th>
              <th style="width: 90px;" class="text-center">Pelayanan</th>
              <th>Cara Bayar</th>
              <th>Dokter</th>
              <th style="width: 70px;" class="text-end">Item</th>
              <th style="width: 130px;" class="text-end">Total Biaya (Rp)</th>
              <th style="width: 50px;" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(patient, pIndex) in items" :key="patient.no_rawat">
              <!-- Patient Parent Header Row -->
              <tr 
                class="patient-header-row" 
                :class="{ 'expanded-row': isExpanded(patient.no_rawat) }"
                @click="togglePatient(patient.no_rawat)"
                style="cursor: pointer;"
              >
                <td class="text-center text-muted fw-bold">
                  {{ (pagination.current_page - 1) * pagination.per_page + pIndex + 1 }}
                </td>
                <td class="fw-semibold text-dark">
                  <i class="far fa-calendar-alt me-1 text-muted"></i>
                  {{ patient.tanggal }}
                </td>
                <td class="font-monospace text-primary fw-bold">
                  {{ patient.no_rawat }}
                </td>
                <td class="font-monospace fw-bold">
                  {{ patient.no_rkm_medis }}
                </td>
                <td class="fw-bold text-dark">
                  {{ patient.nm_pasien }}
                </td>
                <td class="text-center">
                  <span 
                    class="badge rounded-pill px-2 py-1" 
                    :class="patient.status_lanjut === 'Ranap' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' : 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'"
                  >
                    {{ patient.status_lanjut }}
                  </span>
                </td>
                <td class="small text-muted">{{ patient.png_jawab }}</td>
                <td class="small text-muted">{{ patient.nm_dokter }}</td>
                <td class="text-end font-monospace fw-semibold">
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                    {{ patient.obat.length }} item
                  </span>
                </td>
                <td class="text-end fw-bold text-success font-monospace">
                  {{ formatRupiah(patient.subtotal.total) }}
                </td>
                <td class="text-center">
                  <button 
                    class="btn btn-sm btn-light border-0 rounded-circle text-muted p-1" 
                    title="Lihat Detail Obat"
                    @click.stop="togglePatient(patient.no_rawat)"
                  >
                    <i class="fas fa-sm" :class="isExpanded(patient.no_rawat) ? 'fa-chevron-up text-primary' : 'fa-chevron-down'"></i>
                  </button>
                </td>
              </tr>

              <!-- Medicine Details Accordion / Sub-Table -->
              <tr v-if="isExpanded(patient.no_rawat)" class="patient-detail-container bg-white">
                <td colspan="11" class="p-0 border-0">
                  <div class="detail-inner-wrapper p-3 bg-light bg-opacity-50 border-start border-4 border-primary">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="small fw-bold text-primary">
                        <i class="fas fa-pills me-1"></i> Rincian Obat: {{ patient.nm_pasien }} ({{ patient.no_rawat }})
                      </span>
                      <span class="badge bg-white text-muted border small">
                        {{ patient.obat.length }} Macam Obat
                      </span>
                    </div>

                    <div class="table-responsive bg-white rounded-3 border shadow-sm">
                      <table class="table table-sm table-striped m-0 small align-middle">
                        <thead class="table-light text-muted">
                          <tr>
                            <th style="width: 40px;" class="text-center">#</th>
                            <th style="width: 110px;">Kode Barang</th>
                            <th>Nama Obat / Barang Medis</th>
                            <th style="width: 140px;">Depo Farmasi</th>
                            <th style="width: 60px;" class="text-end">Jumlah</th>
                            <th style="width: 110px;" class="text-end text-danger">Harga Beli (Rp)</th>
                            <th style="width: 110px;" class="text-end text-danger">Total Beli (Rp)</th>
                            <th style="width: 110px;" class="text-end">Biaya Obat (Rp)</th>
                            <th style="width: 90px;" class="text-end">Embalase (Rp)</th>
                            <th style="width: 90px;" class="text-end">Tuslah (Rp)</th>
                            <th style="width: 110px;" class="text-end">Total (Rp)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(med, mIdx) in patient.obat" :key="med.kode_brng + mIdx">
                            <td class="text-center text-muted">{{ mIdx + 1 }}</td>
                            <td class="font-monospace text-muted">{{ med.kode_brng }}</td>
                            <td class="fw-semibold text-dark">{{ med.nama_brng }}</td>
                            <td class="text-muted">{{ med.nm_bangsal || '-' }}</td>
                            <td class="text-end font-monospace fw-bold">{{ formatNumber(med.jml) }}</td>
                            <td class="text-end font-monospace text-danger">{{ formatRupiah(med.h_beli) }}</td>
                            <td class="text-end font-monospace text-danger">{{ formatRupiah(med.total_beli) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(med.biaya) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(med.embalase) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(med.tuslah) }}</td>
                            <td class="text-end font-monospace fw-bold text-success">{{ formatRupiah(med.total) }}</td>
                          </tr>
                        </tbody>
                        <tfoot class="table-secondary fw-bold text-dark">
                          <tr>
                            <td colspan="4" class="text-end text-uppercase">Subtotal Pasien:</td>
                            <td class="text-end font-monospace">{{ formatNumber(patient.subtotal.qty) }}</td>
                            <td class="text-end font-monospace text-muted">-</td>
                            <td class="text-end font-monospace text-danger">{{ formatRupiah(patient.subtotal.total_beli) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(patient.subtotal.biaya) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(patient.subtotal.embalase) }}</td>
                            <td class="text-end font-monospace">{{ formatRupiah(patient.subtotal.tuslah) }}</td>
                            <td class="text-end font-monospace text-success">{{ formatRupiah(patient.subtotal.total) }}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>

          <!-- Table Sticky Grand Total Footer -->
          <tfoot class="table-dark text-white fw-bold">
            <tr>
              <td colspan="4" class="text-end text-uppercase">Grand Total Halaman Ini:</td>
              <td colspan="4" class="text-muted small">
                {{ items.length }} Pasien pada halaman saat ini
              </td>
              <td class="text-end font-monospace text-info">
                {{ formatNumber(pageSubtotal.qty) }}
              </td>
              <td class="text-end font-monospace text-success">
                {{ formatRupiah(pageSubtotal.total) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="card-footer bg-transparent border-top p-3 d-flex flex-wrap justify-content-between align-items-center gap-2" v-if="pagination.total > 0">
        <div class="text-muted small">
          Menampilkan <span class="fw-bold text-dark">{{ pagination.from || 0 }}</span> sampai 
          <span class="fw-bold text-dark">{{ pagination.to || 0 }}</span> dari 
          <span class="fw-bold text-dark">{{ pagination.total }}</span> pasien
        </div>

        <nav v-if="pagination.last_page > 1">
          <ul class="pagination pagination-sm m-0 gap-1">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link rounded-3" @click="changePage(pagination.current_page - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="p in visiblePages" 
              :key="p" 
              class="page-item" 
              :class="{ active: p === pagination.current_page, disabled: p === '...' }"
            >
              <button class="page-link rounded-3" @click="p !== '...' && changePage(p)">
                {{ p }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <button class="page-link rounded-3" @click="changePage(pagination.current_page + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import Swal from 'sweetalert2'

export default {
  name: 'RekapObatPasienView',
  data() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')

    return {
      loading: false,
      exportLoading: false,
      allExpanded: false,
      expandedPatients: {},
      filters: {
        tab: 'masuk', // 'masuk' | 'pulang'
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        status: 'all', // 'all', 'Ralan', 'Ranap'
        kd_pj: 'all',
        kd_dokter: 'all',
        kd_bangsal: 'all',
        kdjns: 'all',
        kode_kategori: 'all',
        kode_golongan: 'all',
        search: ''
      },
      attributes: {
        bangsal: [],
        dokter: [],
        penjab: [],
        jenis: [],
        kategori: [],
        golongan: []
      },
      items: [],
      summary: {
        total_pasien: 0,
        total_qty: 0,
        total_beli: 0,
        total_biaya: 0,
        margin: 0,
        total_embalase: 0,
        total_tuslah: 0,
        grand_total: 0
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0
      }
    }
  },
  computed: {
    visiblePages() {
      const current = this.pagination.current_page
      const last = this.pagination.last_page
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
    },
    pageSubtotal() {
      let qty = 0
      let total_beli = 0
      let total = 0
      for (const item of this.items) {
        qty += (item.subtotal?.qty || 0)
        total_beli += (item.subtotal?.total_beli || 0)
        total += (item.subtotal?.total || 0)
      }
      return { qty, total_beli, total }
    }
  },
  mounted() {
    this.fetchAttributes()
    this.fetchData()
  },
  methods: {
    async fetchAttributes() {
      try {
        const res = await api.get('/laporan/rekap-obat-pasien/attributes')
        if (res.data?.success) {
          this.attributes = res.data.data
        }
      } catch (err) {
        console.error('Gagal mengambil attributes filter:', err)
      }
    },
    async fetchData() {
      this.loading = true
      try {
        const params = {
          tab: this.filters.tab,
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir,
          status: this.filters.status,
          kd_pj: this.filters.kd_pj,
          kd_dokter: this.filters.kd_dokter,
          kd_bangsal: this.filters.kd_bangsal,
          kdjns: this.filters.kdjns,
          kode_kategori: this.filters.kode_kategori,
          kode_golongan: this.filters.kode_golongan,
          search: this.filters.search,
          page: this.pagination.current_page,
          per_page: this.pagination.per_page
        }

        const res = await api.get('/laporan/rekap-obat-pasien', { params })
        if (res.data?.success) {
          this.items = res.data.data || []
          this.summary = res.data.summary || {
            total_pasien: 0,
            total_qty: 0,
            total_beli: 0,
            total_biaya: 0,
            margin: 0,
            total_embalase: 0,
            total_tuslah: 0,
            grand_total: 0
          }
          this.pagination = res.data.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
            from: 0,
            to: 0
          }

          // Reset expanded state on page reload
          this.expandedPatients = {}
          this.allExpanded = false
        }
      } catch (err) {
        console.error('Gagal memuat rekap obat pasien:', err)
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan sistem'
        })
      } finally {
        this.loading = false
      }
    },
    switchTab(tabName) {
      if (this.filters.tab === tabName) return
      this.filters.tab = tabName
      this.pagination.current_page = 1
      this.fetchData()
    },
    resetFilters() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')

      this.filters = {
        tab: 'masuk',
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        status: 'all',
        kd_pj: 'all',
        kd_dokter: 'all',
        kd_bangsal: 'all',
        kdjns: 'all',
        kode_kategori: 'all',
        kode_golongan: 'all',
        search: ''
      }
      this.pagination.current_page = 1
      this.fetchData()
    },
    changePage(p) {
      if (p < 1 || p > this.pagination.last_page) return
      this.pagination.current_page = p
      this.fetchData()
    },
    changePerPage() {
      this.pagination.current_page = 1
      this.fetchData()
    },
    togglePatient(noRawat) {
      this.expandedPatients[noRawat] = !this.expandedPatients[noRawat]
    },
    isExpanded(noRawat) {
      return !!this.expandedPatients[noRawat]
    },
    toggleExpandAll() {
      this.allExpanded = !this.allExpanded
      const newMap = {}
      if (this.allExpanded) {
        for (const item of this.items) {
          newMap[item.no_rawat] = true
        }
      }
      this.expandedPatients = newMap
    },
    async exportData() {
      this.exportLoading = true
      try {
        const params = {
          tab: this.filters.tab,
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir,
          status: this.filters.status,
          kd_pj: this.filters.kd_pj,
          kd_dokter: this.filters.kd_dokter,
          kd_bangsal: this.filters.kd_bangsal,
          kdjns: this.filters.kdjns,
          kode_kategori: this.filters.kode_kategori,
          kode_golongan: this.filters.kode_golongan,
          search: this.filters.search
        }

        const res = await api.get('/laporan/rekap-obat-pasien/export', {
          params,
          responseType: 'blob'
        })

        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        const filename = `rekap_obat_pasien_${this.filters.tab}_${this.filters.tgl_awal}_sd_${this.filters.tgl_akhir}.csv`
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        Swal.fire({
          icon: 'success',
          title: 'Export Berhasil',
          text: `File ${filename} berhasil diunduh.`,
          timer: 2000,
          showConfirmButton: false
        })
      } catch (err) {
        console.error('Gagal export:', err)
        Swal.fire({
          icon: 'error',
          title: 'Export Gagal',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunduh data'
        })
      } finally {
        this.exportLoading = false
      }
    },
    formatNumber(val) {
      if (val === null || val === undefined || isNaN(val)) return '0'
      return Number(val).toLocaleString('id-ID')
    },
    formatRupiah(val) {
      if (val === null || val === undefined || isNaN(val)) return 'Rp 0'
      return 'Rp ' + Number(val).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    }
  }
}
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.patient-header-row {
  transition: background-color 0.15s ease;
}

.patient-header-row:hover {
  background-color: #f1f5f9 !important;
}

.expanded-row {
  background-color: #e2e8f0 !important;
}

.detail-inner-wrapper {
  background-color: #f8fafc;
}

.nav-pills .nav-link {
  color: #64748b;
  background-color: #f1f5f9;
  transition: all 0.2s ease;
}

.nav-pills .nav-link.active {
  color: #ffffff;
  background-color: #2563eb;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.text-xs {
  font-size: 0.72rem;
}

.fs-7 {
  font-size: 0.8rem;
}

.border-indigo {
  border-color: #6366f1 !important;
}

.border-teal {
  border-color: #0d9488 !important;
}

.text-teal {
  color: #0d9488 !important;
}
</style>
