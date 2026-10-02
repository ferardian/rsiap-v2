<template>
  <div class="costing-view-wrapper">
    <!-- 1. Header Section -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <div class="d-flex align-items-center gap-2">
          <span class="header-badge-icon">
            <i class="fas fa-chart-pie text-primary"></i>
          </span>
          <h1 class="page-title m-0">Analisis Real Cost Tindakan</h1>
        </div>
        <p class="page-subtitle mt-1">
          Kajian komparasi biaya riil billing pasien, tarif paket tindakan, dan klaim INA-CBGs BPJS
        </p>
      </div>

      <div class="header-actions d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary btn-clean"
          @click="openMasterPaketModal"
          title="Lihat Standar Master Tarif Paket di SIMRS"
        >
          <i class="fas fa-book-medical me-1.5"></i>
          <span>Standar Paket SIMRS</span>
        </button>
        <button
          class="btn btn-outline-success btn-clean"
          @click="exportExcel"
          :disabled="loading || !patients.length"
          title="Ekspor Rekap Data ke Excel (.xlsx)"
        >
          <i class="fas fa-file-excel me-1.5 text-success"></i>
          <span>Ekspor Excel</span>
        </button>
      </div>
    </div>

    <!-- 2. Filter Toolbar -->
    <div class="filter-card mb-4">
      <div class="row g-2.5 align-items-end">
        <div class="col-12 col-md-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label-clean m-0">Tindakan Operasi</label>
            <span
              v-if="selectedGroup === 'custom'"
              class="text-primary text-xs fw-semibold"
              style="cursor: pointer"
              @click="selectedGroup = 'SC'; onGroupChange()"
              title="Kembali ke pilihan dropdown"
            >
              <i class="fas fa-list me-1"></i>Pilih Dropdown
            </span>
          </div>

          <!-- Dropdown Mode -->
          <div v-if="selectedGroup !== 'custom'">
            <select v-model="selectedGroup" class="form-select form-control-clean" @change="onGroupChange">
              <option v-for="grp in operationGroups" :key="grp.value" :value="grp.value">
                {{ grp.label }}
              </option>
            </select>
          </div>

          <!-- Custom / Free Text Mode with Datalist Autocomplete -->
          <div v-else class="input-with-icon">
            <i class="fas fa-search icon-muted"></i>
            <input
              ref="customInputRef"
              v-model="filters.keyword"
              type="text"
              class="form-control form-control-clean"
              placeholder="Ketik kata kunci paket..."
              list="masterPaketDatalist"
              @keyup.enter="loadData"
            />
            <datalist id="masterPaketDatalist">
              <option v-for="opt in availablePackageNames" :key="opt" :value="opt" />
            </datalist>
          </div>
        </div>

        <div class="col-6 col-md-2">
          <label class="form-label-clean">Penjamin</label>
          <select v-model="filters.kd_pj" class="form-select form-control-clean" @change="loadData">
            <option value="BPJS">BPJS Kesehatan</option>
            <option value="UMUM">Umum</option>
            <option value="all">Semua Penjamin</option>
          </select>
        </div>

        <div class="col-6 col-md-2">
          <label class="form-label-clean">Kelas Rawat</label>
          <select v-model="filters.kelas" class="form-select form-control-clean" @change="loadData">
            <option value="all">Semua Kelas</option>
            <option value="Kelas 1">Kelas 1</option>
            <option value="Kelas 2">Kelas 2</option>
            <option value="Kelas 3">Kelas 3</option>
            <option value="Kelas Utama">Kelas Utama</option>
            <option value="Kelas VIP">Kelas VIP</option>
            <option value="Kelas VVIP">Kelas VVIP</option>
          </select>
        </div>

        <div class="col-6 col-md-2">
          <label class="form-label-clean">Tgl Operasi Awal</label>
          <input
            v-model="filters.tgl_awal"
            type="date"
            class="form-control form-control-clean"
            @change="loadData"
          />
        </div>

        <div class="col-6 col-md-2">
          <label class="form-label-clean">Tgl Operasi Akhir</label>
          <input
            v-model="filters.tgl_akhir"
            type="date"
            class="form-control form-control-clean"
            @change="loadData"
          />
        </div>

        <div class="col-12 col-md-1 d-flex gap-1">
          <button
            class="btn btn-primary btn-search w-100"
            @click="loadData"
            :disabled="loading"
            title="Cari Data"
          >
            <i class="fas fa-search" v-if="!loading"></i>
            <span class="spinner-border spinner-border-sm" v-else></span>
          </button>
        </div>
      </div>

      <!-- Quick Action Pills -->
      <div class="quick-pills mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
        <span class="text-muted small fw-medium">Pencarian Cepat:</span>
        <button
          type="button"
          class="badge-pill"
          :class="{ active: filters.keyword === 'SC' && filters.kelas === 'Kelas 3' }"
          @click="setQuickFilter('SC', 'BPJS', 'Kelas 3')"
        >
          SC Kelas 3 BPJS
        </button>
        <button
          type="button"
          class="badge-pill"
          :class="{ active: filters.keyword === 'SC' && filters.kelas === 'Kelas 2' }"
          @click="setQuickFilter('SC', 'BPJS', 'Kelas 2')"
        >
          SC Kelas 2 BPJS
        </button>
        <button
          type="button"
          class="badge-pill"
          :class="{ active: filters.keyword === 'SC' && filters.kelas === 'Kelas 1' }"
          @click="setQuickFilter('SC', 'BPJS', 'Kelas 1')"
        >
          SC Kelas 1 BPJS
        </button>
        <button
          type="button"
          class="badge-pill"
          :class="{ active: filters.keyword === 'Kuret' }"
          @click="setQuickFilter('Kuret', 'BPJS', 'all')"
        >
          Kuretase BPJS
        </button>
        <button
          type="button"
          class="badge-pill"
          :class="{ active: filters.keyword === 'SC' && filters.kd_pj === 'UMUM' }"
          @click="setQuickFilter('SC', 'UMUM', 'all')"
        >
          SC Pasien Umum
        </button>
      </div>
    </div>

    <!-- 3. Key Performance Indicators (Cards) -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <span class="metric-label">Rata-Rata Real Cost (Billing RS)</span>
              <h3 class="metric-value text-slate">
                {{ formatRupiah(summary.avg_billing) }}
              </h3>
            </div>
            <div class="metric-icon-box bg-blue-subtle text-blue">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div class="metric-footer text-muted small mt-2">
            Dari total {{ summary.total_pasien }} episode rawat
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <span class="metric-label">Rata-Rata Tarif INA-CBGs</span>
              <h3 class="metric-value text-teal">
                {{ summary.avg_inacbg > 0 ? formatRupiah(summary.avg_inacbg) : 'Belum Ada Klaim' }}
              </h3>
            </div>
            <div class="metric-icon-box bg-teal-subtle text-teal">
              <i class="fas fa-hand-holding-medical"></i>
            </div>
          </div>
          <div class="metric-footer text-muted small mt-2">
            Paket klaim BPJS yang disetujui
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <span class="metric-label">Margin / Selisih Klaim vs Biaya</span>
              <h3
                class="metric-value"
                :class="summary.avg_margin >= 0 ? 'text-success' : 'text-danger'"
              >
                {{ summary.avg_inacbg > 0 ? formatRupiah(summary.avg_margin) : '-' }}
              </h3>
            </div>
            <div
              class="metric-icon-box"
              :class="summary.avg_margin >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
            >
              <i :class="summary.avg_margin >= 0 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'"></i>
            </div>
          </div>
          <div class="metric-footer small mt-2">
            <span v-if="summary.avg_inacbg > 0" :class="summary.avg_margin >= 0 ? 'text-success' : 'text-danger'">
              {{ summary.avg_margin >= 0 ? 'Surplus terhadap klaim' : 'Defisit terhadap klaim' }}
            </span>
            <span v-else class="text-muted">Data klaim belum tersedia</span>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <span class="metric-label">Rata-Rata Lama Rawat (LOS)</span>
              <h3 class="metric-value text-purple">
                {{ summary.avg_los || 0 }} <span class="fs-5 fw-normal text-muted">Hari</span>
              </h3>
            </div>
            <div class="metric-icon-box bg-purple-subtle text-purple">
              <i class="fas fa-bed"></i>
            </div>
          </div>
          <div class="metric-footer text-muted small mt-2">
            Length of Stay rawat inap
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Component Cost Breakdown Card -->
    <div class="card clean-card mb-4" v-if="summary.avg_billing > 0">
      <div class="card-header-clean d-flex justify-content-between align-items-center">
        <div>
          <h6 class="m-0 fw-bold text-dark">Struktur Komponen Biaya Rata-Rata per Pasien</h6>
          <small class="text-muted">Proporsi pengeluaran dari tindakan bedah sampai pasien pulang</small>
        </div>
        <span class="badge bg-light text-secondary border px-2.5 py-1">
          Total: {{ formatRupiah(summary.avg_billing) }}
        </span>
      </div>

      <div class="card-body p-4">
        <!-- Visual Bar -->
        <div class="cost-progress-bar mb-4">
          <div
            v-for="cat in breakdownList"
            :key="cat.key"
            class="cost-progress-segment"
            :style="{ width: `${cat.percent}%`, backgroundColor: cat.color }"
            :title="`${cat.label}: ${formatRupiah(cat.amount)} (${cat.percent}%)`"
          ></div>
        </div>

        <!-- Breakdown Grid -->
        <div class="row g-3">
          <div
            v-for="cat in breakdownList"
            :key="cat.key"
            class="col-12 col-sm-6 col-lg-3"
          >
            <div class="breakdown-item p-3 rounded-3 border">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="d-flex align-items-center gap-2">
                  <span class="color-dot" :style="{ backgroundColor: cat.color }"></span>
                  <span class="fw-semibold text-slate small">{{ cat.label }}</span>
                </span>
                <span class="badge bg-light text-dark fw-bold border text-xs">
                  {{ cat.percent }}%
                </span>
              </div>
              <div class="fs-5 fw-bold text-dark">
                {{ formatRupiah(cat.amount) }}
              </div>
              <small class="text-muted d-block mt-0.5 text-xs">{{ cat.desc }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Patient Transactions Table -->
    <div class="card clean-card">
      <div class="card-header-clean d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h6 class="m-0 fw-bold text-dark">Daftar Pasien & Riwayat Billing Riil</h6>
          <small class="text-muted">Klik tombol rincian untuk melihat semua 100+ item obat, BHP, dan tindakan pasien</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light text-secondary border px-2.5 py-1 fw-semibold">
            Menampilkan {{ patients.length }} dari {{ pagination.total }} pasien
          </span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-clean m-0 align-middle">
          <thead>
            <tr>
              <th style="width: 40px">#</th>
              <th>Pasien & No. Rawat</th>
              <th>Tindakan Operasi</th>
              <th>Operator & Tgl</th>
              <th>Kelas / Penjamin</th>
              <th class="text-center">LOS</th>
              <th class="text-end">Billing RS (Riil)</th>
              <th class="text-end">Tarif INA-CBGs</th>
              <th class="text-end">Margin</th>
              <th class="text-center" style="width: 100px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Memuat data riwayat tindakan dan transaksi billing...
              </td>
            </tr>
            <tr v-else-if="!patients.length">
              <td colspan="10" class="text-center py-5 text-muted">
                <i class="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
                Tidak ditemukan data tindakan dengan filter yang dipilih.
              </td>
            </tr>
            <tr v-for="(p, idx) in patients" :key="p.no_rawat" class="table-row-hover">
              <td class="text-muted small">{{ (pagination.current_page - 1) * pagination.per_page + idx + 1 }}</td>
              <td>
                <div class="fw-bold text-dark">{{ p.nm_pasien }}</div>
                <div class="text-muted text-xs font-monospace">RM: {{ p.no_rkm_medis }} &bull; {{ p.no_rawat }}</div>
              </td>
              <td>
                <div class="fw-semibold text-slate">{{ p.paket_operasi }}</div>
                <span class="badge bg-light text-secondary border text-xs">{{ p.kode_paket }}</span>
              </td>
              <td>
                <div class="small fw-semibold text-dark">{{ p.operator }}</div>
                <div class="text-muted text-xs">{{ formatTgl(p.tgl_operasi) }}</div>
              </td>
              <td>
                <span class="badge bg-blue-subtle text-blue border border-blue-subtle me-1 text-xs">
                  {{ p.kelas }}
                </span>
                <span class="badge bg-light text-secondary border text-xs">
                  {{ p.penjamin }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge bg-light text-dark border">
                  {{ p.lama }} Hari
                </span>
              </td>
              <td class="text-end fw-bold text-dark font-monospace">
                {{ formatRupiah(p.total_billing) }}
              </td>
              <td class="text-end font-monospace">
                <span v-if="p.tarif_inacbg" class="fw-bold text-teal d-block" :title="p.nama_inacbg || p.kode_inacbg">
                  {{ formatRupiah(p.tarif_inacbg) }}
                  <small class="d-block text-xs text-muted" v-if="p.kode_inacbg">({{ p.kode_inacbg }})</small>
                </span>
                <span v-else-if="p.penjamin && p.penjamin.includes('BPJS') && !p.tgl_keluar" class="badge bg-warning-subtle text-warning border text-xs" title="Pasien masih dirawat di bangsal / belum diproses E-Klaim">
                  Masih Dirawat
                </span>
                <span v-else-if="p.penjamin && p.penjamin.includes('BPJS')" class="badge bg-light text-muted border text-xs" title="Klaim belum di-grouping di E-Klaim oleh tim Casemix">
                  Belum Grouping
                </span>
                <span v-else class="text-muted text-xs fst-italic">
                  Non-BPJS
                </span>
              </td>
              <td class="text-end font-monospace text-nowrap">
                <span
                  v-if="p.margin !== null"
                  :class="p.margin >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'"
                >
                  {{ formatRupiah(p.margin) }}
                </span>
                <span v-else class="text-muted text-xs">-</span>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-outline-primary btn-icon rounded-pill"
                  @click="openDetailBilling(p.no_rawat)"
                  title="Lihat Rincian Seluruh Transaksi Billing"
                >
                  <i class="fas fa-list-ul me-1"></i> Rincian
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="card-footer-clean d-flex flex-wrap justify-content-between align-items-center gap-2" v-if="pagination.total > pagination.per_page">
        <span class="small text-muted">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        </span>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pagination.current_page <= 1 || loading"
            @click="goToPage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left me-1"></i> Sebelumnya
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pagination.current_page >= pagination.last_page || loading"
            @click="goToPage(pagination.current_page + 1)"
          >
            Berikutnya <i class="fas fa-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 6. MODAL DETAIL TRANSAKSI LENGKAP BILLING -->
    <div
      class="modal fade show"
      tabindex="-1"
      v-if="modalDetail.show"
      style="display: block; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px)"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg clean-modal">
          <!-- Modal Header -->
          <div class="modal-header border-bottom p-3.5">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon-box bg-primary-subtle text-primary">
                <i class="fas fa-file-invoice"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold text-dark m-0">Rincian Lengkap Transaksi Billing Pasien</h5>
                <small class="text-muted">
                  {{ modalDetail.data?.patient?.nm_pasien }} &bull; No. Rawat: {{ modalDetail.data?.patient?.no_rawat }}
                </small>
              </div>
            </div>
            <button type="button" class="btn-close" @click="modalDetail.show = false"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4 custom-scrollbar">
            <!-- Patient Info Banner -->
            <div class="patient-summary-banner p-3 rounded-3 mb-4 border">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <span class="label-xs">Tindakan / Paket:</span>
                  <div class="fw-bold text-dark small">{{ modalDetail.data?.patient?.paket_operasi || '-' }}</div>
                  <small class="text-muted">{{ modalDetail.data?.patient?.kode_paket }}</small>
                </div>
                <div class="col-6 col-md-3">
                  <span class="label-xs">Operator & Tgl Operasi:</span>
                  <div class="fw-bold text-dark small">{{ modalDetail.data?.patient?.operator || '-' }}</div>
                  <small class="text-muted">{{ formatTgl(modalDetail.data?.patient?.tgl_operasi) }}</small>
                </div>
                <div class="col-6 col-md-3">
                  <span class="label-xs">Penjamin & Kelas:</span>
                  <div class="fw-bold text-dark small">{{ modalDetail.data?.patient?.penjamin || '-' }}</div>
                  <span class="badge bg-light text-secondary border text-xs">{{ modalDetail.data?.patient?.kelas || '-' }}</span>
                </div>
                <div class="col-6 col-md-3">
                  <span class="label-xs">Lama Rawat (LOS):</span>
                  <div class="fw-bold text-dark small">{{ modalDetail.data?.patient?.lama || 1 }} Hari</div>
                  <small class="text-muted">
                    Masuk: {{ modalDetail.data?.patient?.tgl_masuk }} &bull; Keluar: {{ modalDetail.data?.patient?.tgl_keluar || 'Rawat' }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Category Filter Tabs inside Modal -->
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div class="d-flex flex-wrap gap-1.5">
                <button
                  type="button"
                  class="btn btn-sm btn-filter-tab"
                  :class="{ active: modalDetail.activeCategory === 'all' }"
                  @click="modalDetail.activeCategory = 'all'"
                >
                  Semua Item ({{ modalDetail.data?.item_count || 0 }})
                </button>
                <button
                  v-for="(catData, catName) in modalDetail.data?.categories"
                  :key="catName"
                  type="button"
                  class="btn btn-sm btn-filter-tab"
                  :class="{ active: modalDetail.activeCategory === catName }"
                  @click="modalDetail.activeCategory = catName"
                >
                  {{ catName }} ({{ catData.count }})
                </button>
              </div>

              <!-- Search in modal -->
              <div class="search-modal-box">
                <i class="fas fa-search search-modal-icon"></i>
                <input
                  v-model="modalDetail.searchItem"
                  type="text"
                  class="form-control form-control-sm form-control-clean"
                  placeholder="Cari item obat / tindakan..."
                />
              </div>
            </div>

            <!-- Detail Line Items Table -->
            <div class="table-responsive border rounded-3">
              <table class="table table-sm table-clean m-0 align-middle">
                <thead class="bg-light">
                  <tr>
                    <th style="width: 45px">No</th>
                    <th style="width: 130px">Kategori</th>
                    <th>Nama Layanan / Obat / BHP / Kamar</th>
                    <th class="text-end" style="width: 120px">Biaya Satuan</th>
                    <th class="text-center" style="width: 80px">Jumlah</th>
                    <th class="text-end" style="width: 140px">Total Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredModalItems.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      Tidak ditemukan item yang sesuai pencarian.
                    </td>
                  </tr>
                  <template v-for="(it, i) in filteredModalItems" :key="i">
                    <!-- Category Transition Header Row -->
                    <tr
                      v-if="i === 0 || it.category !== filteredModalItems[i - 1].category"
                      class="category-section-row"
                      :class="{ 'first-category-row': i === 0 }"
                    >
                      <td colspan="6" class="p-0">
                        <div
                          class="category-section-banner d-flex align-items-center justify-content-between px-3 py-2"
                          :style="{ borderLeftColor: getCategoryTheme(it.category).borderColor }"
                        >
                          <div class="d-flex align-items-center gap-2">
                            <span class="category-banner-icon" :class="getCategoryTheme(it.category).iconBg">
                              <i :class="getCategoryTheme(it.category).icon"></i>
                            </span>
                            <span class="fw-bold text-dark font-monospace text-uppercase" style="font-size: 0.82rem; letter-spacing: 0.03em;">
                              {{ it.category }}
                            </span>
                            <span class="badge bg-white text-secondary border rounded-pill text-xs px-2 py-0.5 fw-semibold shadow-xs">
                              {{ categoryStatsMap[it.category]?.count || 0 }} item
                            </span>
                          </div>
                          <div class="d-flex align-items-center gap-2">
                            <span class="text-muted text-xs">Subtotal {{ it.category }}:</span>
                            <span class="font-monospace fw-bold text-dark small">
                              {{ formatRupiah(categoryStatsMap[it.category]?.total || 0) }}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Item Row -->
                    <tr class="table-row-hover">
                      <td class="text-muted small">{{ i + 1 }}</td>
                      <td>
                        <span class="badge text-xs" :class="getCategoryTheme(it.category).badgeClass">
                          {{ it.category }}
                        </span>
                      </td>
                      <td>
                        <div class="fw-semibold text-slate">{{ it.nm_perawatan }}</div>
                        <small class="text-muted text-xs" v-if="it.status_asal && it.status_asal !== it.category">
                          Tag: {{ it.status_asal }}
                        </small>
                      </td>
                      <td class="text-end font-monospace small">
                        {{ formatRupiah(it.biaya) }}
                      </td>
                      <td class="text-center font-monospace small fw-bold">
                        {{ it.jumlah }}
                      </td>
                      <td class="text-end font-monospace fw-bold" :class="it.totalbiaya < 0 ? 'text-danger' : 'text-dark'">
                        {{ formatRupiah(it.totalbiaya) }}
                      </td>
                    </tr>
                  </template>
                </tbody>
                <tfoot class="bg-light fw-bold border-top">
                  <tr>
                    <td colspan="5" class="text-end py-2.5">Total Kategori Terpilih:</td>
                    <td class="text-end py-2.5 font-monospace text-primary fs-6">
                      {{ formatRupiah(modalSelectedTotal) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Grand Total Summary Box -->
            <div class="grand-total-box mt-3 p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <span class="text-muted small d-block">Grand Total Real Cost Pasien Ini:</span>
                <span class="fs-4 fw-bold text-dark font-monospace">
                  {{ formatRupiah(modalDetail.data?.grand_total || 0) }}
                </span>
              </div>

              <div class="d-flex align-items-center gap-3" v-if="modalDetail.data?.patient?.tarif_inacbg">
                <div class="text-end">
                  <span class="text-muted small d-block">Tarif Klaim INA-CBGs:</span>
                  <span class="fs-5 fw-bold text-teal font-monospace">
                    {{ formatRupiah(modalDetail.data?.patient?.tarif_inacbg) }}
                  </span>
                </div>
                <div class="text-end">
                  <span class="text-muted small d-block">Margin:</span>
                  <span
                    class="fs-5 fw-bold font-monospace"
                    :class="(modalDetail.data?.patient?.tarif_inacbg - modalDetail.data?.grand_total) >= 0 ? 'text-success' : 'text-danger'"
                  >
                    {{ formatRupiah(modalDetail.data?.patient?.tarif_inacbg - modalDetail.data?.grand_total) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer border-top p-3 d-flex justify-content-between align-items-center">
            <span class="text-muted small">
              Data terverifikasi sinkron dengan tabel <code>billing</code> SIMRS Khanza
            </span>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-outline-success btn-clean"
                @click="exportDetailExcel"
                :disabled="!filteredModalItems.length"
                title="Ekspor Seluruh Rincian Transaksi Pasien ke Excel (.xlsx)"
              >
                <i class="fas fa-file-excel me-1.5 text-success"></i>
                <span>Ekspor Rincian Excel</span>
              </button>
              <button type="button" class="btn btn-secondary btn-clean" @click="modalDetail.show = false">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 7. MODAL MASTER PAKET PEMBANDING -->
    <div
      class="modal fade show"
      tabindex="-1"
      v-if="modalMaster.show"
      style="display: block; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px)"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg clean-modal">
          <div class="modal-header border-bottom p-3.5">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon-box bg-danger-subtle text-danger">
                <i class="fas fa-procedures"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold text-dark m-0">Master Tarif Paket Operasi SIMRS (SK Direktur)</h5>
                <small class="text-muted">Daftar tarif standar tindakan pembedahan di OK berdasarkan tabel master <code>paket_operasi</code></small>
              </div>
            </div>
            <button type="button" class="btn-close" @click="modalMaster.show = false"></button>
          </div>

          <div class="modal-body p-4 custom-scrollbar">
            <div class="table-responsive border rounded-3">
              <table class="table table-sm table-clean m-0 align-middle">
                <thead class="bg-light">
                  <tr>
                    <th>Kode</th>
                    <th>Nama Paket Tindakan</th>
                    <th>Kelas</th>
                    <th class="text-end">Operator</th>
                    <th class="text-end">Anestesi</th>
                    <th class="text-end">Dr. Anak</th>
                    <th class="text-end">Sewa OK</th>
                    <th class="text-end">Sarpras</th>
                    <th class="text-end fw-bold text-dark">Total Paket</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="modalMaster.loading">
                    <td colspan="9" class="text-center py-4 text-muted">
                      <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                      Memuat data master paket...
                    </td>
                  </tr>
                  <tr v-for="pkg in modalMaster.packages" :key="pkg.kode_paket" class="table-row-hover">
                    <td class="font-monospace text-xs text-muted">{{ pkg.kode_paket }}</td>
                    <td class="fw-semibold text-slate">{{ pkg.nm_perawatan }}</td>
                    <td>
                      <span class="badge bg-light text-secondary border text-xs">{{ pkg.kelas }}</span>
                    </td>
                    <td class="text-end font-monospace small">{{ formatRupiah(pkg.operator1) }}</td>
                    <td class="text-end font-monospace small">{{ formatRupiah(pkg.dokter_anestesi) }}</td>
                    <td class="text-end font-monospace small">{{ formatRupiah(pkg.dokter_anak) }}</td>
                    <td class="text-end font-monospace small">{{ formatRupiah(pkg.sewa_ok) }}</td>
                    <td class="text-end font-monospace small">{{ formatRupiah(pkg.sarpras) }}</td>
                    <td class="text-end font-monospace fw-bold text-primary">{{ formatRupiah(pkg.total_paket) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer border-top p-3">
            <button type="button" class="btn btn-secondary btn-clean" @click="modalMaster.show = false">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import costingTindakanService from '@/services/costingTindakanService'

// Filters State
const selectedGroup = ref('SC')
const customInputRef = ref(null)
const availablePackageNames = ref([])

const operationGroups = [
  { value: 'SC', label: 'SC / Sectio Caesaria (Semua SC/Re-SC/Gemelli)' },
  { value: 'Curetage', label: 'Kuretase / Curetage' },
  { value: 'MOW', label: 'MOW / Tubektomi' },
  { value: 'Histerektomi', label: 'Histerektomi' },
  { value: 'Kistektomi', label: 'Kistektomi' },
  { value: 'Laparatomi', label: 'Laparatomi / Laparoskopi' },
  { value: 'Enukleasi', label: 'Enukleasi' },
  { value: 'Hernia', label: 'Herniotomi / Hernia' },
  { value: 'Append', label: 'Apendektomi' },
  { value: 'all', label: 'Semua Tindakan Operasi' },
  { value: 'custom', label: '🔍 Ketik Bebas / Cari Spesifik...' },
]

const onGroupChange = () => {
  if (selectedGroup.value === 'custom') {
    filters.keyword = ''
    setTimeout(() => {
      customInputRef.value?.focus()
    }, 100)
  } else {
    filters.keyword = selectedGroup.value
    filters.page = 1
    loadData()
  }
}

const filters = reactive({
  keyword: 'SC',
  kd_pj: 'BPJS',
  kelas: 'Kelas 3',
  tgl_awal: '',
  tgl_akhir: '',
  limit: 25,
  page: 1,
})

// Initialize Dates to 30 days range
const initDates = () => {
  const now = new Date()
  const past = new Date()
  past.setDate(now.getDate() - 30)
  filters.tgl_akhir = now.toISOString().split('T')[0]
  filters.tgl_awal = past.toISOString().split('T')[0]
}
initDates()

// State
const loading = ref(false)
const summary = reactive({
  total_pasien: 0,
  sample_count: 0,
  avg_billing: 0,
  avg_inacbg: 0,
  avg_margin: 0,
  avg_los: 0,
  breakdown_avg: {
    operasi: 0,
    obat: 0,
    kamar: 0,
    paramedis: 0,
    dokter: 0,
    laborat: 0,
    radiologi: 0,
    resep_pulang: 0,
    lainnya: 0,
  }
})

const patients = ref([])
const pagination = reactive({
  total: 0,
  per_page: 25,
  current_page: 1,
  last_page: 1,
})

// Modal Detail State
const modalDetail = reactive({
  show: false,
  loading: false,
  data: null,
  activeCategory: 'all',
  searchItem: '',
})

// Modal Master State
const modalMaster = reactive({
  show: false,
  loading: false,
  packages: [],
})

// Colors & metadata for breakdown segments
const breakdownConfig = [
  { key: 'operasi', label: 'Tindakan OK', color: '#3b82f6', desc: 'Jasa Operator, Anestesi, Sp.A, Sewa OK, Sarpras' },
  { key: 'obat', label: 'Obat & BHP Rawat', color: '#10b981', desc: 'Farmasi bangsal & OK setelah retur' },
  { key: 'kamar', label: 'Kamar Rawat Inap', color: '#f59e0b', desc: 'Akomodasi kamar kelas perawatan' },
  { key: 'paramedis', label: 'Asuhan & Perina', color: '#8b5cf6', desc: 'Kamar bayi, resusitasi, infant warmer, admin' },
  { key: 'laborat', label: 'Laboratorium', color: '#06b6d4', desc: 'Darah lengkap, koagulasi, serologi' },
  { key: 'dokter', label: 'Visite Spesialis', color: '#ec4899', desc: 'Visite harian dokter DPJP & konsulan' },
  { key: 'resep_pulang', label: 'Resep Pulang', color: '#6366f1', desc: 'Obat oral untuk dibawa pulang pasien' },
  { key: 'radiologi', label: 'Radiologi / USG', color: '#64748b', desc: 'Pemeriksaan radiologi & USG' },
  { key: 'lainnya', label: 'Lain-lain', color: '#94a3b8', desc: 'Tambahan & penunjang lainnya' },
]

// Computed breakdown with percentages
const breakdownList = computed(() => {
  const total = summary.avg_billing || 1
  return breakdownConfig
    .map(cfg => {
      const amount = summary.breakdown_avg[cfg.key] || 0
      const percent = total > 0 ? ((amount / total) * 100).toFixed(1) : '0'
      return {
        ...cfg,
        amount,
        percent: parseFloat(percent),
      }
    })
    .filter(c => c.amount > 0)
})

// Load Data from API
const loadData = async () => {
  loading.value = true
  try {
    const res = await costingTindakanService.getCostingAnalysis(filters)
    if (res.data && res.data.success) {
      Object.assign(summary, res.data.summary)
      patients.value = res.data.data || []
      Object.assign(pagination, res.data.pagination)
    }
  } catch (error) {
    console.error('Error fetching costing data:', error)
  } finally {
    loading.value = false
  }
}

// Quick filter handler
const setQuickFilter = (keyword, kd_pj, kelas) => {
  filters.keyword = keyword
  filters.kd_pj = kd_pj
  filters.kelas = kelas
  filters.page = 1
  selectedGroup.value = ['SC', 'Curetage', 'MOW', 'Histerektomi', 'Kistektomi', 'Laparatomi', 'Enukleasi', 'Hernia', 'Append', 'all'].includes(keyword)
    ? keyword
    : (keyword === 'Kuret' ? 'Curetage' : 'custom')
  loadData()
}

// Pagination navigation
const goToPage = (page) => {
  filters.page = page
  loadData()
}

// Open Detail Billing Modal
const openDetailBilling = async (noRawat) => {
  modalDetail.show = true
  modalDetail.loading = true
  modalDetail.activeCategory = 'all'
  modalDetail.searchItem = ''
  modalDetail.data = null

  try {
    const res = await costingTindakanService.getDetailBilling({ no_rawat: noRawat })
    if (res.data && res.data.success) {
      modalDetail.data = res.data
    }
  } catch (error) {
    console.error('Error loading detail billing:', error)
  } finally {
    modalDetail.loading = false
  }
}

// Filtered items in detail modal
const filteredModalItems = computed(() => {
  if (!modalDetail.data || !modalDetail.data.categories) return []

  let allItems = []
  for (const [catName, catData] of Object.entries(modalDetail.data.categories)) {
    if (modalDetail.activeCategory === 'all' || modalDetail.activeCategory === catName) {
      for (const item of catData.items) {
        allItems.push({
          ...item,
          category: catName,
        })
      }
    }
  }

  // Filter search
  if (modalDetail.searchItem) {
    const q = modalDetail.searchItem.toLowerCase()
    allItems = allItems.filter(it => it.nm_perawatan.toLowerCase().includes(q))
  }

  return allItems
})

// Subtotal for selected category in modal
const modalSelectedTotal = computed(() => {
  return filteredModalItems.value.reduce((acc, it) => acc + (it.totalbiaya || 0), 0)
})

// Category themes & metadata for visual grouping
const categoryThemes = {
  'Operasi': {
    icon: 'fas fa-procedures text-primary',
    iconBg: 'bg-primary-subtle',
    borderColor: '#2563eb',
    badgeClass: 'badge-cat-blue',
  },
  'Obat & BHP': {
    icon: 'fas fa-pills text-teal',
    iconBg: 'bg-teal-subtle',
    borderColor: '#0d9488',
    badgeClass: 'badge-cat-teal',
  },
  'Kamar': {
    icon: 'fas fa-bed text-amber',
    iconBg: 'bg-amber-subtle',
    borderColor: '#d97706',
    badgeClass: 'badge-cat-amber',
  },
  'Paramedis': {
    icon: 'fas fa-user-nurse text-purple',
    iconBg: 'bg-purple-subtle',
    borderColor: '#7c3aed',
    badgeClass: 'badge-cat-purple',
  },
  'Dokter': {
    icon: 'fas fa-user-md text-indigo',
    iconBg: 'bg-indigo-subtle',
    borderColor: '#4f46e5',
    badgeClass: 'badge-cat-indigo',
  },
  'Laboratorium': {
    icon: 'fas fa-vial text-cyan',
    iconBg: 'bg-cyan-subtle',
    borderColor: '#0891b2',
    badgeClass: 'badge-cat-cyan',
  },
  'Radiologi': {
    icon: 'fas fa-x-ray text-orange',
    iconBg: 'bg-orange-subtle',
    borderColor: '#ea580c',
    badgeClass: 'badge-cat-orange',
  },
  'Resep Pulang': {
    icon: 'fas fa-prescription-bottle-alt text-success',
    iconBg: 'bg-success-subtle',
    borderColor: '#16a34a',
    badgeClass: 'badge-cat-green',
  },
  'Lain-lain': {
    icon: 'fas fa-layer-group text-secondary',
    iconBg: 'bg-light',
    borderColor: '#64748b',
    badgeClass: 'badge-cat-gray',
  },
}

const getCategoryTheme = (cat) => {
  return categoryThemes[cat] || {
    icon: 'fas fa-tag text-secondary',
    iconBg: 'bg-light',
    borderColor: '#94a3b8',
    badgeClass: 'badge-cat-gray',
  }
}

// Precomputed category stats for items visible in modal
const categoryStatsMap = computed(() => {
  const map = {}
  for (const it of filteredModalItems.value) {
    if (!map[it.category]) {
      map[it.category] = { count: 0, total: 0 }
    }
    map[it.category].count += 1
    map[it.category].total += (it.totalbiaya || 0)
  }
  return map
})

// Open Master Paket Modal
const openMasterPaketModal = async () => {
  modalMaster.show = true
  modalMaster.loading = true
  try {
    const res = await costingTindakanService.getMasterPaket({
      keyword: filters.keyword,
      kelas: filters.kelas
    })
    if (res.data && res.data.success) {
      modalMaster.packages = res.data.data || []
    }
  } catch (error) {
    console.error('Error loading master packages:', error)
  } finally {
    modalMaster.loading = false
  }
}

// Export Summary Table to Excel (.xlsx)
const exportExcel = () => {
  if (!patients.value.length) return

  const dataRows = patients.value.map((p, idx) => ({
    'No': idx + 1,
    'No. Rawat': p.no_rawat,
    'No. RM': p.no_rkm_medis,
    'Nama Pasien': p.nm_pasien,
    'Tindakan Operasi': p.paket_operasi,
    'Kode Paket': p.kode_paket,
    'Dokter Operator': p.operator,
    'Tgl Operasi': p.tgl_operasi,
    'Kelas': p.kelas,
    'Penjamin': p.penjamin,
    'Lama Rawat (Hari)': p.lama,
    'Billing RS Riil (Rp)': p.total_billing,
    'Kode INA-CBG': p.kode_inacbg || '-',
    'Nama INA-CBG': p.nama_inacbg || '-',
    'Tarif INA-CBGs (Rp)': p.tarif_inacbg || 0,
    'Margin (Rp)': p.margin !== null ? p.margin : '-',
    'Status Margin': p.margin !== null ? (p.margin >= 0 ? 'Surplus' : 'Defisit') : '-'
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataRows)
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 10 },
    { wch: 26 },
    { wch: 32 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 35 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Real Cost')

  const fileName = `rekap_real_cost_${filters.keyword}_${filters.kelas}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export Patient Detail Billing to Excel (.xlsx)
const exportDetailExcel = () => {
  if (!modalDetail.data || !filteredModalItems.value.length) return
  const p = modalDetail.data.patient || {}

  const headerData = [
    ['RINCIAN LENGKAP TRANSAKSI BILLING PASIEN'],
    ['RSIA AISYIYAH PEKAJANGAN'],
    [''],
    ['Nama Pasien', p.nm_pasien || '-', 'No. Rawat', p.no_rawat || '-'],
    ['No. Rekam Medis', p.no_rkm_medis || '-', 'No. SEP', p.no_sep || '-'],
    ['Tindakan Operasi', p.paket_operasi || '-', 'Operator', p.operator || '-'],
    ['Penjamin', p.penjamin || '-', 'Kelas Perawatan', p.kelas || '-'],
    ['Tgl Masuk', p.tgl_masuk || '-', 'Tgl Keluar', p.tgl_keluar || '-'],
    ['Lama Rawat (LOS)', `${p.lama || 1} Hari`, 'Kode INA-CBG', p.kode_inacbg || '-'],
    ['Tarif INA-CBGs (Rp)', p.tarif_inacbg || 0, 'Grand Total Billing (Rp)', modalDetail.data.grand_total || 0],
    ['Margin (Rp)', (p.tarif_inacbg ? (p.tarif_inacbg - modalDetail.data.grand_total) : '-'), 'Status', (p.tarif_inacbg ? ((p.tarif_inacbg - modalDetail.data.grand_total) >= 0 ? 'Surplus' : 'Defisit') : '-')],
    [''],
    ['No', 'Kategori', 'Nama Layanan / Obat / BHP / Kamar', 'Biaya Satuan (Rp)', 'Jumlah', 'Total Biaya (Rp)', 'Status / Tag Asal']
  ]

  const itemRows = filteredModalItems.value.map((it, idx) => [
    idx + 1,
    it.category,
    it.nm_perawatan,
    it.biaya,
    it.jumlah,
    it.totalbiaya,
    it.status_asal || it.category
  ])

  const summaryRow = [
    '', '', 'TOTAL', '', '', modalSelectedTotal.value, ''
  ]

  const fullData = [...headerData, ...itemRows, summaryRow]
  const worksheet = XLSX.utils.aoa_to_sheet(fullData)

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 45 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 20 }
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rincian Billing')

  const safeRawat = (p.no_rawat || 'detail').replace(/[\/\\]/g, '-')
  const fileName = `rincian_billing_${p.no_rkm_medis || ''}_${safeRawat}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Helpers
const formatRupiah = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0'
  const isNeg = val < 0
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.abs(val))
  return isNeg ? `-${formatted}` : formatted
}

const formatTgl = (tgl) => {
  if (!tgl) return '-'
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  loadData()
  try {
    const res = await costingTindakanService.getMasterPaket({ keyword: 'all' })
    if (res.data && res.data.success && res.data.data) {
      availablePackageNames.value = [...new Set(res.data.data.map(p => p.nm_perawatan))]
    }
  } catch (e) {
    // silent fallback
  }
})
</script>

<style scoped>
.costing-view-wrapper {
  padding: 1.5rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* Header */
.page-title {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
  font-size: 1.65rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

.header-badge-icon {
  width: 40px;
  height: 40px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.btn-clean {
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  transition: all 0.15s ease-in-out;
}

/* Filter Card */
.filter-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-label-clean {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.35rem;
  display: block;
}

.form-control-clean {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  padding: 0.5rem 0.75rem;
  background-color: #f8fafc;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-control-clean:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.input-with-icon {
  position: relative;
}

.input-with-icon .icon-muted {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
}

.input-with-icon input {
  padding-left: 32px;
}

.btn-search {
  border-radius: 8px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Quick Pills */
.badge-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.badge-pill:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.badge-pill.active {
  background: #1e293b;
  color: #ffffff;
  border-color: #1e293b;
}

/* Metric Cards */
.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  height: 100%;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: block;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  font-family: inherit;
}

.metric-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

/* Breakdown Visual */
.cost-progress-bar {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f1f5f9;
}

.cost-progress-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.breakdown-item {
  background: #f8fafc;
}

/* Clean Cards & Table */
.clean-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.card-header-clean {
  padding: 1.15rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-footer-clean {
  padding: 0.85rem 1.25rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.table-clean th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 0.9rem;
}

.table-clean td {
  padding: 0.8rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

/* Modal Styling */
.clean-modal {
  border-radius: 16px;
  overflow: hidden;
}

.modal-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.patient-summary-banner {
  background-color: #f8fafc;
}

.label-xs {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  display: block;
}

.btn-filter-tab {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
}

.btn-filter-tab:hover {
  background: #f1f5f9;
}

.btn-filter-tab.active {
  background: #1e293b;
  color: #ffffff;
  border-color: #1e293b;
}

.search-modal-box {
  position: relative;
  width: 220px;
}

.search-modal-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
}

.search-modal-box input {
  padding-left: 28px;
}

.grand-total-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

/* Utilities */
.text-slate { color: #1e293b; }
.text-teal { color: #0d9488; }
.text-purple { color: #7c3aed; }
.text-blue { color: #2563eb; }
.text-amber { color: #d97706; }
.text-indigo { color: #4f46e5; }
.text-cyan { color: #0891b2; }
.text-orange { color: #ea580c; }
.bg-blue-subtle { background-color: #eff6ff; }
.bg-teal-subtle { background-color: #f0fdfa; }
.bg-purple-subtle { background-color: #f5f3ff; }
.bg-amber-subtle { background-color: #fffbeb; }
.bg-indigo-subtle { background-color: #eef2ff; }
.bg-cyan-subtle { background-color: #ecfeff; }
.bg-orange-subtle { background-color: #fff7ed; }
.bg-primary-subtle { background-color: #eff6ff; }
.bg-danger-subtle { background-color: #fef2f2; }
.bg-success-subtle { background-color: #f0fdf4; }
.text-xs { font-size: 0.75rem; }

/* Category Section Divider in Detail Modal */
.category-section-row td {
  padding: 0 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.category-section-row:not(.first-category-row) td {
  border-top: 2.5px solid #cbd5e1 !important;
}

.category-section-row.first-category-row td {
  border-top: 1px solid #e2e8f0 !important;
}

.category-section-banner {
  background-color: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-bottom: 1px solid #f1f5f9;
}

.category-banner-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

/* Category Badges */
.badge-cat-blue {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.badge-cat-teal {
  background-color: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
}
.badge-cat-amber {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.badge-cat-purple {
  background-color: #faf5ff;
  color: #6b21a8;
  border: 1px solid #e9d5ff;
}
.badge-cat-indigo {
  background-color: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}
.badge-cat-cyan {
  background-color: #ecfeff;
  color: #0e7490;
  border: 1px solid #a5f3fc;
}
.badge-cat-orange {
  background-color: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
.badge-cat-green {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.badge-cat-gray {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
