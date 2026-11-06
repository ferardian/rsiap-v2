<template>
  <div class="proker-anggaran-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3 shadow-sm rounded-4 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style="width: 52px; height: 52px;">
            <i class="fas fa-file-invoice-dollar fa-2x text-primary"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="page-title mb-0 fw-bold text-dark">Program Kerja & Rencana Anggaran (RAPB)</h3>
              <span class="badge bg-primary px-3 py-1 rounded-pill fs-7 shadow-sm">Tahun {{ selectedTahun }}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill fs-8">
                <i class="fas fa-network-wired me-1"></i> Multi-Unit Terintegrasi
              </span>
            </div>
            <p class="text-muted small mb-0 mt-1">
              Sistem perencanaan terpadu 40 Unit Kerja dengan integrasi otomatis ke Tim Pengadaan, Sarpras, Logistik, & Diklat SDI
            </p>
          </div>
        </div>

        <!-- Action Header Buttons -->
        <div class="d-flex align-items-center gap-2">
          <!-- Tahun Selector -->
          <div class="input-group input-group-sm" style="width: 140px;">
            <span class="input-group-text bg-light text-muted border-end-0"><i class="fas fa-calendar-alt"></i></span>
            <select class="form-select border-start-0 fw-bold" v-model="selectedTahun" @change="loadAllData">
              <option :value="2027">Tahun 2027</option>
              <option :value="2026">Tahun 2026</option>
            </select>
          </div>

          <button 
            class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center"
            @click="exportCurrentViewToExcel"
            :disabled="loading"
          >
            <i class="fas fa-file-excel me-2"></i> Export Excel
          </button>

          <button 
            class="btn btn-sm btn-outline-primary rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center"
            @click="loadAllData"
            :disabled="loading"
          >
            <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="row g-3 mb-4">
      <!-- Total Usulan Belanja -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-semibold text-uppercase tracking-wider">Total Usulan Belanja</span>
            <div class="stat-icon-wrapper rounded-3 bg-danger bg-opacity-10 text-danger p-2">
              <i class="fas fa-wallet fa-lg"></i>
            </div>
          </div>
          <h4 class="fw-bold mb-1 text-dark font-monospace">
            Rp {{ formatRupiah(summary.unit_summary?.total_belanja || 0) }}
          </h4>
          <div class="d-flex align-items-center text-muted small mt-1">
            <i class="fas fa-layer-group text-primary me-1"></i>
            <span>{{ summary.disposisi_summary?.reduce((a, b) => a + Number(b.total_item), 0) || 0 }} usulan belanja & program</span>
          </div>
        </div>
      </div>

      <!-- Proyeksi Pendapatan -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-semibold text-uppercase tracking-wider">Proyeksi Pendapatan</span>
            <div class="stat-icon-wrapper rounded-3 bg-success bg-opacity-10 text-success p-2">
              <i class="fas fa-chart-line fa-lg"></i>
            </div>
          </div>
          <h4 class="fw-bold mb-1 text-success font-monospace">
            Rp {{ formatRupiah(summary.unit_summary?.total_pendapatan || 0) }}
          </h4>
          <div class="d-flex align-items-center text-muted small mt-1">
            <i class="fas fa-hospital text-success me-1"></i>
            <span>Dari Poli, UGD, Ranap, & Penunjang</span>
          </div>
        </div>
      </div>

      <!-- Total Unit Pengusul -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-semibold text-uppercase tracking-wider">Unit / Komite Terdata</span>
            <div class="stat-icon-wrapper rounded-3 bg-primary bg-opacity-10 text-primary p-2">
              <i class="fas fa-sitemap fa-lg"></i>
            </div>
          </div>
          <h4 class="fw-bold mb-1 text-primary">
            {{ summary.unit_summary?.total_unit || 40 }} <span class="fs-6 fw-normal text-muted">Unit Kerja</span>
          </h4>
          <div class="d-flex align-items-center small mt-1">
            <span class="badge bg-success-subtle text-success me-1">{{ summary.unit_summary?.unit_disetujui || 0 }} Disetujui</span>
            <span class="badge bg-warning-subtle text-warning me-1">{{ summary.unit_summary?.unit_review || 0 }} Review</span>
            <span class="badge bg-secondary-subtle text-secondary">{{ summary.unit_summary?.unit_draft || 40 }} Draft</span>
          </div>
        </div>
      </div>

      <!-- Disposisi Pengadaan & Logistik -->
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-semibold text-uppercase tracking-wider">Integrasi Lintas Tim</span>
            <div class="stat-icon-wrapper rounded-3 bg-info bg-opacity-10 text-info p-2">
              <i class="fas fa-boxes fa-lg"></i>
            </div>
          </div>
          <h4 class="fw-bold mb-1 text-info">
            {{ totalPengadaanItems }} <span class="fs-6 fw-normal text-muted">Item Terdisposisi</span>
          </h4>
          <div class="d-flex align-items-center text-muted small mt-1">
            <span class="text-truncate">Alat Medis, Non-Medis, ATK, BMHP, Diklat</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom pt-3 pb-0 px-4">
        <ul class="nav nav-tabs card-header-tabs gap-2" role="tablist">
          <!-- Tab 1: Ringkasan Eksekutif -->
          <li class="nav-item">
            <button 
              class="nav-link py-2 px-3 fw-bold rounded-top-3 d-flex align-items-center"
              :class="{ 'active text-primary border-bottom-0': activeTab === 'dashboard' }"
              @click="activeTab = 'dashboard'"
            >
              <i class="fas fa-chart-pie me-2"></i>
              Ringkasan Eksekutif
            </button>
          </li>
          <!-- Tab 2: Workspace Disposisi Tim -->
          <li class="nav-item">
            <button 
              class="nav-link py-2 px-3 fw-bold rounded-top-3 d-flex align-items-center position-relative"
              :class="{ 'active text-primary border-bottom-0': activeTab === 'disposisi' }"
              @click="activeTab = 'disposisi'"
            >
              <i class="fas fa-inbox me-2"></i>
              Workspace Disposisi Tim
              <span class="badge bg-danger rounded-pill ms-2 font-monospace">{{ totalPengadaanItems }}</span>
            </button>
          </li>
          <!-- Tab 3: Daftar 40 Unit Kerja -->
          <li class="nav-item">
            <button 
              class="nav-link py-2 px-3 fw-bold rounded-top-3 d-flex align-items-center"
              :class="{ 'active text-primary border-bottom-0': activeTab === 'units' }"
              @click="activeTab = 'units'"
            >
              <i class="fas fa-building me-2"></i>
              Daftar 40 Unit Kerja & Pengesahan
            </button>
          </li>
          <!-- Tab 4: Portal Pengisian Unit (BARU & LENGKAP!) -->
          <li class="nav-item">
            <button 
              class="nav-link py-2 px-3 fw-bold rounded-top-3 d-flex align-items-center bg-primary-subtle text-primary border-primary-subtle"
              :class="{ 'active bg-primary text-white border-primary shadow-sm': activeTab === 'portal_unit' }"
              @click="activeTab = 'portal_unit'"
            >
              <i class="fas fa-edit me-2"></i>
              Portal Pengisian Unit
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-4">
        <!-- ============================================================== -->
        <!-- TAB 1: RINGKASAN EKSEKUTIF -->
        <!-- ============================================================== -->
        <div v-if="activeTab === 'dashboard'">
          <div class="row g-4">
            <!-- Breakdown Alokasi per Disposisi -->
            <div class="col-12 col-lg-7">
              <div class="border rounded-4 p-3 bg-light bg-opacity-50 h-100">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="fw-bold mb-0 text-dark">
                    <i class="fas fa-project-diagram text-primary me-2"></i>
                    Alokasi Usulan Belanja Berdasarkan Tim Pengelola
                  </h6>
                  <span class="small text-muted">Data Konsolidasi RAPB</span>
                </div>

                <div class="table-responsive">
                  <table class="table table-sm table-hover align-middle mb-0 bg-white rounded-3 overflow-hidden shadow-sm">
                    <thead class="table-light text-muted small text-uppercase">
                      <tr>
                        <th class="ps-3 py-2">Tim Penerima Disposisi</th>
                        <th class="text-center py-2">Kategori Usulan</th>
                        <th class="text-center py-2">Jumlah Item</th>
                        <th class="text-end pe-3 py-2">Total Estimasi Biaya</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="d in disposisiMatrix" 
                        :key="d.target"
                        class="cursor-pointer"
                        @click="switchDisposisiFilter(d.target)"
                        title="Klik untuk melihat rincian item tim ini"
                      >
                        <td class="ps-3 py-2">
                          <div class="d-flex align-items-center">
                            <span class="badge rounded-circle p-2 me-2" :class="d.badgeClass">
                              <i :class="d.icon"></i>
                            </span>
                            <div>
                              <span class="fw-bold text-dark d-block">{{ d.label }}</span>
                              <span class="text-muted small fs-8">{{ d.desc }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="text-center small py-2">
                          <span class="badge bg-light text-dark border">{{ d.kategoriText }}</span>
                        </td>
                        <td class="text-center fw-bold py-2 font-monospace">
                          {{ d.count }}
                        </td>
                        <td class="text-end pe-3 py-2 fw-bold font-monospace" :class="d.textClass">
                          Rp {{ formatRupiah(d.total) }}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light fw-bold">
                      <tr>
                        <td colspan="2" class="ps-3 py-2 text-uppercase text-end">Total Konsolidasi:</td>
                        <td class="text-center py-2 font-monospace">{{ totalDisposisiItems }}</td>
                        <td class="text-end pe-3 py-2 text-danger font-monospace">
                          Rp {{ formatRupiah(totalDisposisiNominal) }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div class="alert alert-info border-0 rounded-3 mt-3 mb-0 small d-flex align-items-center py-2 px-3">
                  <i class="fas fa-info-circle me-2 fs-5"></i>
                  <div>
                    <strong>Tips Integrasi:</strong> Klik salah satu baris tim di atas untuk langsung membuka daftar item belanja yang menjadi tanggung jawab tim tersebut.
                  </div>
                </div>
              </div>
            </div>

            <!-- Top 10 Usulan Belanja Terbesar -->
            <div class="col-12 col-lg-5">
              <div class="border rounded-4 p-3 bg-light bg-opacity-50 h-100">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="fw-bold mb-0 text-dark">
                    <i class="fas fa-star text-warning me-2"></i>
                    Top 10 Usulan Belanja Prioritas
                  </h6>
                  <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2">Nilai Terbesar</span>
                </div>

                <div class="top-items-list" style="max-height: 400px; overflow-y: auto;">
                  <div 
                    v-for="(item, idx) in summary.top_items" 
                    :key="item.id"
                    class="card border-0 shadow-sm rounded-3 mb-2 p-2 bg-white"
                  >
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="me-2">
                        <span class="badge bg-secondary-subtle text-secondary me-1 font-monospace">#{{ idx + 1 }}</span>
                        <strong class="text-dark small">{{ item.nama_item }}</strong>
                        <div class="text-muted fs-8 mt-1">
                          <i class="fas fa-tag me-1"></i> {{ item.nama_unit }} • 
                          <span class="badge bg-light text-dark border">{{ item.kategori.replace('_', ' ') }}</span>
                        </div>
                      </div>
                      <div class="text-end">
                        <span class="fw-bold text-danger font-monospace small d-block">
                          Rp {{ formatRupiah(item.total_biaya) }}
                        </span>
                        <span class="text-muted fs-8">{{ item.total_qty }} {{ item.satuan || 'Unit' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 2: WORKSPACE DISPOSISI TIM TERINTEGRASI -->
        <!-- ============================================================== -->
        <div v-if="activeTab === 'disposisi'">
          <!-- Filter Bar Disposisi -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold text-muted mb-1">Pilih Tim Penerima Disposisi:</label>
              <select class="form-select form-select-sm fw-bold rounded-3" v-model="disposisiFilter.target" @change="fetchDisposisiData">
                <option value="all">Semua Tim Terkait (Konsolidasi)</option>
                <option value="pengadaan">🩺 Tim Pengadaan (Alat Medis)</option>
                <option value="sarpras">🏢 Tim Sarpras & IT (Alat Non-Medis & Maintenance)</option>
                <option value="logistik_umum">📦 Tim Logistik Umum (ATK, Cetakan, BHP RT)</option>
                <option value="logistik_farmasi">💊 Tim Logistik Farmasi (BMHP & Obat)</option>
                <option value="diklat">🎓 Tim Diklat SDI (Pelatihan Internal/Eksternal)</option>
                <option value="sdi">👥 Tim SDI (Pengajuan Tenaga Baru)</option>
              </select>
            </div>

            <div class="col-12 col-md-3">
              <label class="form-label small fw-bold text-muted mb-1">Status Verifikasi Tim:</label>
              <select class="form-select form-select-sm rounded-3" v-model="disposisiFilter.status" @change="fetchDisposisiData">
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu Verifikasi</option>
                <option value="disetujui">Disetujui Tim</option>
                <option value="penyesuaian">Perlu Penyesuaian Harga/Spek</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            <div class="col-12 col-md-5">
              <label class="form-label small fw-bold text-muted mb-1">Cari Item / Unit Pengusul:</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control rounded-end-3" 
                  placeholder="Ketik nama alat, barang, atau unit..." 
                  v-model="disposisiFilter.search"
                  @keyup.enter="fetchDisposisiData"
                />
                <button class="btn btn-primary btn-sm px-3 ms-1 rounded-3" @click="fetchDisposisiData">
                  Cari
                </button>
              </div>
            </div>
          </div>

          <!-- Total Summary Bar Disposisi -->
          <div class="alert bg-primary bg-opacity-10 border-0 rounded-4 p-3 mb-3 d-flex flex-wrap justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
              <div class="badge bg-primary rounded-pill px-3 py-2 fs-7 font-monospace">
                {{ disposisiData.length }} Item Terpilih
              </div>
              <span class="text-dark fw-bold">
                Total Anggaran Terfilter: 
                <span class="text-danger font-monospace fs-6">Rp {{ formatRupiah(disposisiSummary.total_biaya || 0) }}</span>
              </span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-success rounded-3 fw-bold" @click="exportDisposisiToExcel">
                <i class="fas fa-file-excel me-1"></i> Download Rekap Tim (.xlsx)
              </button>
            </div>
          </div>

          <!-- Table Disposisi Items -->
          <div class="table-responsive border rounded-4 bg-white shadow-sm overflow-hidden">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-3 py-3" style="width: 50px;">No</th>
                  <th class="py-3">Unit Pengusul</th>
                  <th class="py-3">Nama Usulan Barang / Program</th>
                  <th class="py-3">Spesifikasi / Alasan</th>
                  <th class="text-center py-3">Total Qty</th>
                  <th class="text-end py-3">Estimasi Biaya</th>
                  <th class="text-center py-3">Status Verifikasi</th>
                  <th class="pe-3 text-center py-3" style="width: 120px;">Aksi</th>
                </tr>
              </thead>
              <tbody v-if="loadingDisposisi">
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fas fa-spinner fa-spin fa-2x mb-2 d-block text-primary"></i>
                    Memuat data usulan disposisi...
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="disposisiData.length === 0">
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block opacity-25"></i>
                    Tidak ada usulan yang sesuai dengan filter disposisi.
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="(item, idx) in disposisiData" :key="item.id">
                  <td class="ps-3 py-3 text-muted fw-bold font-monospace">{{ idx + 1 }}</td>
                  <td class="py-3">
                    <span class="badge bg-primary-subtle text-primary fw-bold mb-1 d-inline-block">
                      {{ item.nama_unit }}
                    </span>
                    <span v-if="item.bagian" class="text-muted d-block fs-8">{{ item.bagian }}</span>
                  </td>
                  <td class="py-3">
                    <strong class="text-dark">{{ item.nama_item || item.nama_pelatihan || item.jabatan }}</strong>
                    <div class="d-flex align-items-center gap-1 mt-1">
                      <span class="badge bg-light text-secondary border font-monospace fs-8">
                        {{ item.kategori || item.jenis || 'Item' }}
                      </span>
                      <span class="badge bg-info-subtle text-info border border-info-subtle fs-8">
                        PIC: {{ item.target_disposisi }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 small text-muted" style="max-width: 280px;">
                    {{ item.spesifikasi_alasan || item.deskripsi_sasaran || item.justifikasi || '-' }}
                  </td>
                  <td class="text-center py-3 font-monospace">
                    <span v-if="item.total_qty" class="badge bg-light text-dark border px-2 py-1">
                      {{ item.total_qty }} {{ item.satuan || '' }}
                    </span>
                    <span v-else-if="item.jumlah_orang" class="badge bg-light text-dark border px-2 py-1">
                      {{ item.jumlah_orang }} Orang
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-end py-3 fw-bold font-monospace text-danger">
                    Rp {{ formatRupiah(item.total_biaya || item.estimasi_biaya || 0) }}
                  </td>
                  <td class="text-center py-3">
                    <span class="badge rounded-pill px-3 py-1" :class="getVerifikasiBadge(item.status_verifikasi)">
                      {{ item.status_verifikasi || 'menunggu' }}
                    </span>
                    <div v-if="item.catatan_verifikator" class="text-muted fs-8 mt-1 italic">
                      "{{ item.catatan_verifikator }}"
                    </div>
                  </td>
                  <td class="pe-3 text-center py-3">
                    <button 
                      class="btn btn-sm btn-outline-primary rounded-3 px-2 py-1 d-flex align-items-center justify-content-center mx-auto"
                      @click="openVerifikasiModal(item)"
                      title="Verifikasi Teknis & Harga"
                    >
                      <i class="fas fa-check-circle me-1"></i> Verifikasi
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 3: DAFTAR 40 UNIT KERJA & PENGESAHAN -->
        <!-- ============================================================== -->
        <div v-if="activeTab === 'units'">
          <!-- Filter Search Unit -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-12 col-md-6">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control rounded-end-3" 
                  placeholder="Cari nama instalasi, ruang, atau komite..." 
                  v-model="searchUnitText"
                />
              </div>
            </div>
            <div class="col-12 col-md-3">
              <select class="form-select form-select-sm rounded-3" v-model="filterUnitStatus">
                <option value="">Semua Status Approval</option>
                <option value="draft">Draft (Belum Diajukan)</option>
                <option value="diajukan">Diajukan Unit</option>
                <option value="review_keuangan">Review Tim Anggaran</option>
                <option value="disetujui">Disahkan / Disetujui</option>
              </select>
            </div>
            <div class="col-12 col-md-3 text-end text-muted small">
              Menampilkan <strong>{{ filteredUnits.length }}</strong> dari {{ units.length }} Unit
            </div>
          </div>

          <!-- Unit Table -->
          <div class="table-responsive border rounded-4 bg-white shadow-sm overflow-hidden">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-muted small text-uppercase">
                <tr>
                  <th class="ps-3 py-3" style="width: 50px;">No</th>
                  <th class="py-3">Nama Unit Kerja / Ruang / Instalasi</th>
                  <th class="py-3">Bagian</th>
                  <th class="text-center py-3">Usulan Program</th>
                  <th class="text-center py-3">Item Pengadaan</th>
                  <th class="text-end py-3">Total Belanja</th>
                  <th class="text-center py-3">Status Pengesahan</th>
                  <th class="pe-3 text-center py-3" style="width: 140px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, idx) in filteredUnits" :key="u.id">
                  <td class="ps-3 py-3 text-muted fw-bold font-monospace">{{ idx + 1 }}</td>
                  <td class="py-3">
                    <strong class="text-dark fs-7">{{ u.nama_unit }}</strong>
                    <div class="text-muted fs-8 mt-1">
                      <i class="fas fa-user-tie me-1"></i> Koord: {{ u.koordinator_nama || 'Koordinator Unit' }}
                    </div>
                  </td>
                  <td class="py-3">
                    <span class="badge bg-light text-secondary border">{{ u.bagian || 'Umum / Direksi' }}</span>
                  </td>
                  <td class="text-center py-3">
                    <div class="d-flex justify-content-center gap-1">
                      <span class="badge bg-primary-subtle text-primary" title="Program Kerja Mutu & Efisiensi">
                        {{ u.program_kerja_count || 0 }} Proker
                      </span>
                      <span class="badge bg-info-subtle text-info" title="Pelatihan & Diklat">
                        {{ u.pelatihan_count || 0 }} Diklat
                      </span>
                    </div>
                  </td>
                  <td class="text-center py-3 font-monospace">
                    <span class="badge bg-warning-subtle text-warning-emphasis px-2 py-1">
                      {{ u.pengadaan_count || 0 }} Usulan
                    </span>
                  </td>
                  <td class="text-end py-3 fw-bold font-monospace text-danger">
                    Rp {{ formatRupiah(u.total_anggaran_belanja || 0) }}
                  </td>
                  <td class="text-center py-3">
                    <span class="badge rounded-pill px-3 py-1" :class="getApprovalBadge(u.status_approval)">
                      {{ formatApprovalStatus(u.status_approval) }}
                    </span>
                  </td>
                  <td class="pe-3 text-center py-3">
                    <button 
                      class="btn btn-sm btn-primary rounded-3 px-3 py-1 fw-bold d-flex align-items-center justify-content-center mx-auto"
                      @click="openUnitDetailModal(u.id)"
                    >
                      <i class="fas fa-folder-open me-1"></i> Buka Unit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 4: PORTAL PENGISIAN UNIT (WORKSPACE KEPALA UNIT) -->
        <!-- ============================================================== -->
        <div v-if="activeTab === 'portal_unit'">
          <!-- Unit Selector & Header Panel -->
          <div class="card border rounded-4 p-3 mb-4 bg-light bg-opacity-75 shadow-sm">
            <div class="row g-3 align-items-center">
              <div class="col-12 col-md-5">
                <label class="form-label small fw-bold text-muted mb-1">
                  <i class="fas fa-hospital-user text-primary me-1"></i> Pilih Unit Kerja Anda:
                </label>
                <select class="form-select fw-bold rounded-3" v-model="portalSelectedUnitId" @change="onPortalUnitChange">
                  <option v-for="u in units" :key="u.id" :value="u.id">
                    {{ u.nama_unit }} {{ u.bagian ? `(${u.bagian})` : '' }}
                  </option>
                </select>
              </div>

              <!-- Status & Lock Warning -->
              <div class="col-12 col-md-4">
                <label class="form-label small fw-bold text-muted mb-1 d-block">Status Pengesahan Usulan:</label>
                <span class="badge rounded-pill px-3 py-2 fs-7" :class="getApprovalBadge(currentPortalUnit?.status_approval)">
                  {{ formatApprovalStatus(currentPortalUnit?.status_approval) }}
                </span>
                <span v-if="isUnitLocked(currentPortalUnit)" class="text-danger small ms-2 fw-semibold">
                  <i class="fas fa-lock me-1"></i> Terkunci (Read-Only)
                </span>
                <span v-else class="text-success small ms-2 fw-semibold">
                  <i class="fas fa-edit me-1"></i> Terbuka untuk Pengisian
                </span>
              </div>

              <!-- Submit Button -->
              <div class="col-12 col-md-3 text-md-end">
                <button 
                  v-if="!isUnitLocked(currentPortalUnit)"
                  class="btn btn-success fw-bold rounded-3 px-3 py-2 shadow-sm d-flex align-items-center ms-auto"
                  @click="confirmSubmitUnit"
                >
                  <i class="fas fa-paper-plane me-2"></i> Kirim Usulan
                </button>
                <button 
                  v-else
                  class="btn btn-outline-secondary rounded-3 px-3 py-2 text-muted ms-auto" 
                  disabled
                >
                  <i class="fas fa-lock me-1"></i> Usulan Sudah Diajukan
                </button>
              </div>
            </div>

            <!-- Banner info for Unit -->
            <div v-if="isUnitLocked(currentPortalUnit)" class="alert alert-warning border-0 rounded-3 mt-3 mb-0 small d-flex align-items-center py-2 px-3">
              <i class="fas fa-info-circle me-2 fs-5 text-warning-emphasis"></i>
              <div>
                <strong>Dokumen Terkunci:</strong> Usulan RKA unit ini sedang dalam tahap review oleh Tim Anggaran / Manajemen. Jika perlu menambah/mengubah data, mintalah manajemen untuk mengubah status menjadi <em>Revisi</em>.
              </div>
            </div>
          </div>

          <!-- Unit Tabs inside Portal -->
          <div v-if="currentPortalUnit" class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-white border-bottom p-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <ul class="nav nav-pills gap-2" role="tablist">
                <li class="nav-item">
                  <button 
                    class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                    :class="{ 'active bg-primary text-white': portalSubTab === 'pengadaan' }"
                    @click="portalSubTab = 'pengadaan'"
                  >
                    <i class="fas fa-shopping-cart me-1"></i> Pengadaan & BHP ({{ currentPortalUnit.pengadaan?.length || 0 }})
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                    :class="{ 'active bg-primary text-white': portalSubTab === 'proker' }"
                    @click="portalSubTab = 'proker'"
                  >
                    <i class="fas fa-tasks me-1"></i> Proker Efisiensi & Mutu ({{ currentPortalUnit.program_kerja?.length || 0 }})
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                    :class="{ 'active bg-primary text-white': portalSubTab === 'diklat' }"
                    @click="portalSubTab = 'diklat'"
                  >
                    <i class="fas fa-graduation-cap me-1"></i> Diklat ({{ currentPortalUnit.pelatihan?.length || 0 }})
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                    :class="{ 'active bg-primary text-white': portalSubTab === 'sdm' }"
                    @click="portalSubTab = 'sdm'"
                  >
                    <i class="fas fa-users me-1"></i> Kebutuhan SDM ({{ currentPortalUnit.sdm?.length || 0 }})
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                    :class="{ 'active bg-primary text-white': portalSubTab === 'rapat' }"
                    @click="portalSubTab = 'rapat'"
                  >
                    <i class="fas fa-calendar-check me-1"></i> Rapat ({{ currentPortalUnit.rapat?.length || 0 }})
                  </button>
                </li>
              </ul>

              <!-- Add Button corresponding to current subtab -->
              <div v-if="!isUnitLocked(currentPortalUnit)">
                <button 
                  v-if="portalSubTab === 'pengadaan'"
                  class="btn btn-sm btn-primary rounded-3 fw-bold shadow-sm"
                  @click="openAddPengadaanModal(currentPortalUnit.id)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Barang / Sarana
                </button>
                <button 
                  v-if="portalSubTab === 'proker'"
                  class="btn btn-sm btn-primary rounded-3 fw-bold shadow-sm"
                  @click="openAddProkerModal(currentPortalUnit.id)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Program Kerja
                </button>
                <button 
                  v-if="portalSubTab === 'diklat'"
                  class="btn btn-sm btn-primary rounded-3 fw-bold shadow-sm"
                  @click="openAddPelatihanModal(currentPortalUnit.id)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Usulan Diklat
                </button>
                <button 
                  v-if="portalSubTab === 'sdm'"
                  class="btn btn-sm btn-primary rounded-3 fw-bold shadow-sm"
                  @click="openAddSdmModal(currentPortalUnit.id)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Formasi SDM
                </button>
                <button 
                  v-if="portalSubTab === 'rapat'"
                  class="btn btn-sm btn-primary rounded-3 fw-bold shadow-sm"
                  @click="openAddRapatModal(currentPortalUnit.id)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Agenda Rapat
                </button>
              </div>
            </div>

            <div class="card-body p-4">
              <!-- SubTab: PENGADAAN -->
              <div v-if="portalSubTab === 'pengadaan'">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                      <tr>
                        <th class="ps-2">No</th>
                        <th>Kategori</th>
                        <th>Nama Item Barang / Usulan</th>
                        <th>Spesifikasi & Justifikasi</th>
                        <th class="text-center">Qty</th>
                        <th class="text-end">Harga Satuan</th>
                        <th class="text-end">Total Biaya</th>
                        <th class="text-center">Disposisi</th>
                        <th class="text-center pe-2" style="width: 100px;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!currentPortalUnit.pengadaan || currentPortalUnit.pengadaan.length === 0">
                        <td colspan="9" class="text-center py-5 text-muted">
                          Belum ada usulan pengadaan barang. Klik tombol <strong>+ Tambah Barang / Sarana</strong> di atas untuk menambahkan.
                        </td>
                      </tr>
                      <tr v-for="(p, pIdx) in currentPortalUnit.pengadaan" :key="p.id">
                        <td class="ps-2 text-muted fw-bold">{{ pIdx + 1 }}</td>
                        <td>
                          <span class="badge bg-light text-dark border">{{ p.kategori.replace('_', ' ') }}</span>
                        </td>
                        <td class="fw-bold text-dark">{{ p.nama_item }}</td>
                        <td class="small text-muted" style="max-width: 250px;">{{ p.spesifikasi_alasan || '-' }}</td>
                        <td class="text-center font-monospace">{{ p.total_qty }} {{ p.satuan || '' }}</td>
                        <td class="text-end font-monospace">Rp {{ formatRupiah(p.harga_satuan) }}</td>
                        <td class="text-end font-monospace fw-bold text-danger">Rp {{ formatRupiah(p.total_biaya) }}</td>
                        <td class="text-center">
                          <span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-8">
                            {{ p.target_disposisi }}
                          </span>
                        </td>
                        <td class="text-center pe-2">
                          <div class="d-flex justify-content-center gap-1">
                            <button 
                              class="btn btn-sm btn-outline-secondary rounded-2 p-1 px-2"
                              @click="openEditPengadaanModal(p)"
                              :disabled="isUnitLocked(currentPortalUnit)"
                              title="Edit Item"
                            >
                              <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-danger rounded-2 p-1 px-2"
                              @click="deletePengadaanItem(p.id)"
                              :disabled="isUnitLocked(currentPortalUnit)"
                              title="Hapus Item"
                            >
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light fw-bold">
                      <tr>
                        <td colspan="6" class="text-end text-uppercase">Total Pengadaan Unit:</td>
                        <td class="text-end font-monospace text-danger">
                          Rp {{ formatRupiah(currentPortalUnit.pengadaan?.reduce((s, i) => s + Number(i.total_biaya), 0) || 0) }}
                        </td>
                        <td colspan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- SubTab: PROKER -->
              <div v-if="portalSubTab === 'proker'">
                <div v-if="!currentPortalUnit.program_kerja || currentPortalUnit.program_kerja.length === 0" class="text-center py-5 text-muted">
                  Belum ada usulan program kerja. Klik tombol <strong>+ Tambah Program Kerja</strong> di atas.
                </div>
                <div v-else class="row g-3">
                  <div v-for="pk in currentPortalUnit.program_kerja" :key="pk.id" class="col-12 col-md-6">
                    <div class="card border rounded-4 p-3 h-100 shadow-sm bg-white position-relative">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge rounded-pill" :class="pk.jenis === 'efisiensi' ? 'bg-success' : 'bg-primary'">
                          Program {{ pk.jenis }}
                        </span>
                        <button 
                          v-if="!isUnitLocked(currentPortalUnit)"
                          class="btn btn-sm btn-link text-danger p-0"
                          @click="deleteProkerItem(pk.id)"
                          title="Hapus Proker"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      <h6 class="fw-bold text-dark mb-1">{{ pk.judul_program }}</h6>
                      <p class="text-muted small mb-3">{{ pk.deskripsi || '-' }}</p>
                      <div class="mt-auto pt-2 border-top">
                        <span class="text-muted fs-8 d-block mb-1">Rencana Pelaksanaan (Bulan):</span>
                        <div class="d-flex flex-wrap gap-1">
                          <span 
                            v-for="m in 12" 
                            :key="m" 
                            class="badge rounded-circle p-1 text-center font-monospace"
                            :class="isMonthActive(pk.bulan_pelaksanaan, m) ? 'bg-primary text-white' : 'bg-light text-muted border'"
                            style="width: 22px; height: 22px;"
                          >
                            {{ m }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SubTab: DIKLAT -->
              <div v-if="portalSubTab === 'diklat'">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>No</th>
                        <th>Jenis</th>
                        <th>Nama Pelatihan</th>
                        <th>Target Sasaran</th>
                        <th class="text-center">Bulan Ke</th>
                        <th class="text-end">Estimasi Biaya</th>
                        <th class="text-center" style="width: 80px;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!currentPortalUnit.pelatihan || currentPortalUnit.pelatihan.length === 0">
                        <td colspan="7" class="text-center py-4 text-muted">Belum ada usulan pelatihan.</td>
                      </tr>
                      <tr v-for="(pl, plIdx) in currentPortalUnit.pelatihan" :key="pl.id">
                        <td>{{ plIdx + 1 }}</td>
                        <td><span class="badge bg-info-subtle text-info">{{ pl.jenis }}</span></td>
                        <td class="fw-bold">{{ pl.nama_pelatihan }}</td>
                        <td class="small text-muted">{{ pl.deskripsi_sasaran || '-' }}</td>
                        <td class="text-center font-monospace">{{ pl.bulan_pelaksanaan || '-' }}</td>
                        <td class="text-end font-monospace">Rp {{ formatRupiah(pl.estimasi_biaya) }}</td>
                        <td class="text-center">
                          <button 
                            class="btn btn-sm btn-outline-danger rounded-2 p-1 px-2"
                            @click="deletePelatihanItem(pl.id)"
                            :disabled="isUnitLocked(currentPortalUnit)"
                          >
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- SubTab: SDM -->
              <div v-if="portalSubTab === 'sdm'">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>No</th>
                        <th>Formasi / Jabatan</th>
                        <th class="text-center">Jumlah Orang</th>
                        <th>Alasan / Justifikasi Beban Kerja</th>
                        <th class="text-center" style="width: 80px;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!currentPortalUnit.sdm || currentPortalUnit.sdm.length === 0">
                        <td colspan="5" class="text-center py-4 text-muted">Belum ada usulan tambahan tenaga baru.</td>
                      </tr>
                      <tr v-for="(sdm, sIdx) in currentPortalUnit.sdm" :key="sdm.id">
                        <td>{{ sIdx + 1 }}</td>
                        <td class="fw-bold text-dark">{{ sdm.jabatan }}</td>
                        <td class="text-center font-monospace">{{ sdm.jumlah_orang }} Orang</td>
                        <td class="small text-muted">{{ sdm.justifikasi || '-' }}</td>
                        <td class="text-center">
                          <button 
                            class="btn btn-sm btn-outline-danger rounded-2 p-1 px-2"
                            @click="deleteSdmItem(sdm.id)"
                            :disabled="isUnitLocked(currentPortalUnit)"
                          >
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- SubTab: RAPAT -->
              <div v-if="portalSubTab === 'rapat'">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                      <tr>
                        <th>No</th>
                        <th>Jenis Rapat</th>
                        <th>Nama Pertemuan / Evaluasi</th>
                        <th>Keterangan</th>
                        <th class="text-end">Total Biaya Konsumsi</th>
                        <th class="text-center" style="width: 80px;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!currentPortalUnit.rapat || currentPortalUnit.rapat.length === 0">
                        <td colspan="6" class="text-center py-4 text-muted">Belum ada agenda rapat berbayar.</td>
                      </tr>
                      <tr v-for="(rp, rIdx) in currentPortalUnit.rapat" :key="rp.id">
                        <td>{{ rIdx + 1 }}</td>
                        <td><span class="badge bg-light text-dark border">{{ rp.jenis }}</span></td>
                        <td class="fw-bold">{{ rp.nama_rapat }}</td>
                        <td class="small text-muted">{{ rp.deskripsi || '-' }}</td>
                        <td class="text-end font-monospace">Rp {{ formatRupiah(rp.total_biaya) }}</td>
                        <td class="text-center">
                          <button 
                            class="btn btn-sm btn-outline-danger rounded-2 p-1 px-2"
                            @click="deleteRapatItem(rp.id)"
                            :disabled="isUnitLocked(currentPortalUnit)"
                          >
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL RINCIAN UNIT (FULL DETAIL POPUP DARI TAB 3) -->
    <!-- ============================================================== -->
    <div v-if="selectedUnitDetail" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="selectedUnitDetail = null">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Modal Header -->
          <div class="modal-header bg-primary text-white p-3 px-4">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="fas fa-file-alt me-2"></i>
                Rincian Usulan Proker & RAPB: {{ selectedUnitDetail.nama_unit }}
              </h5>
              <span class="small opacity-75">Tahun Anggaran {{ selectedTahun }} • Bagian: {{ selectedUnitDetail.bagian || '-' }}</span>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="selectedUnitDetail = null"></button>
          </div>

          <!-- Modal Sub-Nav Tabs -->
          <div class="bg-light border-bottom px-4 pt-2">
            <ul class="nav nav-pills gap-2" role="tablist">
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                  :class="{ 'active bg-primary text-white': unitTab === 'pengadaan' }"
                  @click="unitTab = 'pengadaan'"
                >
                  <i class="fas fa-shopping-cart me-1"></i> Pengadaan & Sarana ({{ selectedUnitDetail.pengadaan?.length || 0 }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                  :class="{ 'active bg-primary text-white': unitTab === 'proker' }"
                  @click="unitTab = 'proker'"
                >
                  <i class="fas fa-tasks me-1"></i> Proker Efisiensi & Mutu ({{ selectedUnitDetail.program_kerja?.length || 0 }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                  :class="{ 'active bg-primary text-white': unitTab === 'diklat' }"
                  @click="unitTab = 'diklat'"
                >
                  <i class="fas fa-graduation-cap me-1"></i> Pelatihan & SDM ({{ selectedUnitDetail.pelatihan?.length || 0 }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                  :class="{ 'active bg-primary text-white': unitTab === 'rapat' }"
                  @click="unitTab = 'rapat'"
                >
                  <i class="fas fa-users me-1"></i> Rapat ({{ selectedUnitDetail.rapat?.length || 0 }})
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm py-1 px-3 fw-bold rounded-pill"
                  :class="{ 'active bg-primary text-white': unitTab === 'proyeksi' }"
                  @click="unitTab = 'proyeksi'"
                >
                  <i class="fas fa-calculator me-1"></i> Proyeksi Finansial
                </button>
              </li>
            </ul>
          </div>

          <!-- Modal Body Content -->
          <div class="modal-body p-4">
            <!-- 1. TAB PENGADAAN -->
            <div v-if="unitTab === 'pengadaan'">
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light small text-uppercase">
                    <tr>
                      <th class="ps-2">No</th>
                      <th>Kategori</th>
                      <th>Nama Item Barang / Pemeliharaan</th>
                      <th>Spesifikasi</th>
                      <th class="text-center">Qty</th>
                      <th class="text-end">Harga Satuan</th>
                      <th class="text-end">Total Biaya</th>
                      <th class="text-center">Disposisi Tim</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedUnitDetail.pengadaan || selectedUnitDetail.pengadaan.length === 0">
                      <td colspan="8" class="text-center py-4 text-muted">Tidak ada usulan pengadaan barang untuk unit ini.</td>
                    </tr>
                    <tr v-for="(p, pIdx) in selectedUnitDetail.pengadaan" :key="p.id">
                      <td class="ps-2 text-muted fw-bold">{{ pIdx + 1 }}</td>
                      <td>
                        <span class="badge bg-light text-dark border">{{ p.kategori.replace('_', ' ') }}</span>
                      </td>
                      <td class="fw-bold text-dark">{{ p.nama_item }}</td>
                      <td class="small text-muted">{{ p.spesifikasi_alasan || '-' }}</td>
                      <td class="text-center font-monospace">{{ p.total_qty }} {{ p.satuan || '' }}</td>
                      <td class="text-end font-monospace">Rp {{ formatRupiah(p.harga_satuan) }}</td>
                      <td class="text-end font-monospace fw-bold text-danger">Rp {{ formatRupiah(p.total_biaya) }}</td>
                      <td class="text-center">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {{ p.target_disposisi }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td colspan="6" class="text-end text-uppercase">Total Pengadaan Unit:</td>
                      <td class="text-end font-monospace text-danger">
                        Rp {{ formatRupiah(selectedUnitDetail.pengadaan?.reduce((s, i) => s + Number(i.total_biaya), 0) || 0) }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- 2. TAB PROKER -->
            <div v-if="unitTab === 'proker'">
              <div v-if="!selectedUnitDetail.program_kerja || selectedUnitDetail.program_kerja.length === 0" class="text-center py-4 text-muted">
                Tidak ada program kerja khusus yang diusulkan.
              </div>
              <div v-else class="row g-3">
                <div v-for="pk in selectedUnitDetail.program_kerja" :key="pk.id" class="col-12 col-md-6">
                  <div class="card border rounded-3 p-3 h-100 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge rounded-pill" :class="pk.jenis === 'efisiensi' ? 'bg-success' : 'bg-primary'">
                        Program {{ pk.jenis }}
                      </span>
                      <span v-if="pk.nomor" class="badge bg-light text-muted border">No: {{ pk.nomor }}</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">{{ pk.judul_program }}</h6>
                    <p class="text-muted small mb-2">{{ pk.deskripsi || '-' }}</p>
                    <div class="mt-auto pt-2 border-top">
                      <span class="text-muted fs-8 d-block mb-1">Rencana Waktu (Bulan):</span>
                      <div class="d-flex flex-wrap gap-1">
                        <span 
                          v-for="m in 12" 
                          :key="m" 
                          class="badge rounded-circle p-1 text-center font-monospace"
                          :class="isMonthActive(pk.bulan_pelaksanaan, m) ? 'bg-primary text-white' : 'bg-light text-muted border'"
                          style="width: 22px; height: 22px;"
                        >
                          {{ m }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. TAB DIKLAT & SDM -->
            <div v-if="unitTab === 'diklat'">
              <h6 class="fw-bold mb-3"><i class="fas fa-graduation-cap me-2 text-info"></i> Usulan Pelatihan / Diklat</h6>
              <div class="table-responsive mb-4">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Jenis</th>
                      <th>Nama Pelatihan</th>
                      <th>Target Sasaran</th>
                      <th class="text-center">Bulan Ke</th>
                      <th class="text-end">Estimasi Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedUnitDetail.pelatihan || selectedUnitDetail.pelatihan.length === 0">
                      <td colspan="5" class="text-center py-3 text-muted">Tidak ada usulan pelatihan.</td>
                    </tr>
                    <tr v-for="pl in selectedUnitDetail.pelatihan" :key="pl.id">
                      <td><span class="badge bg-info-subtle text-info">{{ pl.jenis }}</span></td>
                      <td class="fw-bold">{{ pl.nama_pelatihan }}</td>
                      <td class="small text-muted">{{ pl.deskripsi_sasaran || '-' }}</td>
                      <td class="text-center font-monospace">{{ pl.bulan_pelaksanaan || '-' }}</td>
                      <td class="text-end font-monospace">Rp {{ formatRupiah(pl.estimasi_biaya) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h6 class="fw-bold mb-3"><i class="fas fa-users me-2 text-success"></i> Kebutuhan Tambahan Tenaga (SDM)</h6>
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Formasi / Jabatan</th>
                      <th class="text-center">Jumlah Orang</th>
                      <th>Alasan / Justifikasi Beban Kerja</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedUnitDetail.sdm || selectedUnitDetail.sdm.length === 0">
                      <td colspan="3" class="text-center py-3 text-muted">Tidak ada pengajuan tambahan tenaga kerja baru.</td>
                    </tr>
                    <tr v-for="sdm in selectedUnitDetail.sdm" :key="sdm.id">
                      <td class="fw-bold text-dark">{{ sdm.jabatan }}</td>
                      <td class="text-center font-monospace">{{ sdm.jumlah_orang }} Orang</td>
                      <td class="small text-muted">{{ sdm.justifikasi || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 4. TAB RAPAT -->
            <div v-if="unitTab === 'rapat'">
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Jenis Rapat</th>
                      <th>Nama Pertemuan / Evaluasi</th>
                      <th>Keterangan</th>
                      <th class="text-end">Total Biaya Konsumsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedUnitDetail.rapat || selectedUnitDetail.rapat.length === 0">
                      <td colspan="4" class="text-center py-3 text-muted">Tidak ada agenda rapat berbayar.</td>
                    </tr>
                    <tr v-for="rp in selectedUnitDetail.rapat" :key="rp.id">
                      <td><span class="badge bg-light text-dark border">{{ rp.jenis }}</span></td>
                      <td class="fw-bold">{{ rp.nama_rapat }}</td>
                      <td class="small text-muted">{{ rp.deskripsi || '-' }}</td>
                      <td class="text-end font-monospace">Rp {{ formatRupiah(rp.total_biaya) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 5. TAB PROYEKSI FINANSIAL -->
            <div v-if="unitTab === 'proyeksi'">
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light small">
                    <tr>
                      <th>Tipe</th>
                      <th>Komponen Proyeksi</th>
                      <th>Catatan Dasar Perhitungan</th>
                      <th class="text-end">Total Tahunan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedUnitDetail.proyeksi_keuangan || selectedUnitDetail.proyeksi_keuangan.length === 0">
                      <td colspan="4" class="text-center py-3 text-muted">Tidak ada proyeksi finansial khusus untuk unit ini.</td>
                    </tr>
                    <tr v-for="pr in selectedUnitDetail.proyeksi_keuangan" :key="pr.id">
                      <td>
                        <span class="badge" :class="pr.jenis === 'pendapatan' ? 'bg-success' : 'bg-secondary'">
                          {{ pr.jenis }}
                        </span>
                      </td>
                      <td class="fw-bold">{{ pr.kategori }}</td>
                      <td class="small text-muted">{{ pr.deskripsi || '-' }}</td>
                      <td class="text-end font-monospace">Rp {{ formatRupiah(pr.total_tahunan) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Modal Footer with Approval Controls -->
          <div class="modal-footer bg-light p-3 px-4 d-flex justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <span class="small fw-bold text-muted">Ubah Status Pengesahan:</span>
              <button 
                class="btn btn-sm btn-outline-warning rounded-3" 
                @click="updateUnitStatus(selectedUnitDetail.id, 'review_keuangan')"
              >
                Kirim ke Tim Anggaran
              </button>
              <button 
                class="btn btn-sm btn-success rounded-3 fw-bold" 
                @click="updateUnitStatus(selectedUnitDetail.id, 'disetujui')"
              >
                <i class="fas fa-check-circle me-1"></i> Sahkan & Setujui
              </button>
            </div>
            <button type="button" class="btn btn-sm btn-secondary rounded-3 px-3" @click="selectedUnitDetail = null">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL FORM: TAMBAH / EDIT PENGADAAN & SARANA (MODAL INPUT UTAMA) -->
    <!-- ============================================================== -->
    <div v-if="showModalPengadaan" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="showModalPengadaan = false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white p-3 px-4">
            <h6 class="modal-title fw-bold mb-0">
              <i class="fas fa-box-open me-2"></i>
              {{ formPengadaan.id ? 'Edit Usulan Pengadaan / BHP' : 'Tambah Usulan Pengadaan / BHP Baru' }}
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="showModalPengadaan = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-3">
              <!-- Kategori -->
              <div class="col-12 col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Kategori Usulan:</label>
                <select class="form-select form-select-sm" v-model="formPengadaan.kategori">
                  <option value="alat_medis">Alat Medis (Disposisi: Tim Pengadaan)</option>
                  <option value="alat_non_medis">Alat Non-Medis (Disposisi: Sarpras/IT)</option>
                  <option value="atk">ATK / Alat Tulis (Disposisi: Logistik Umum)</option>
                  <option value="percetakan">Percetakan / Formulir (Disposisi: Logistik Umum)</option>
                  <option value="fotocopy">Fotocopy / Blangko (Disposisi: Logistik Umum)</option>
                  <option value="bhp_non_medis">BHP Rumah Tangga (Disposisi: Logistik Umum)</option>
                  <option value="bmhp">BMHP / Bahan Medis Habis Pakai (Disposisi: Logistik Farmasi)</option>
                  <option value="maintenance">Pemeliharaan / Maintenance (Disposisi: Sarpras)</option>
                </select>
              </div>

              <!-- Satuan -->
              <div class="col-12 col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Satuan Barang:</label>
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Contoh: PCS, BOX, UNIT, BOTOL, LITER"
                  v-model="formPengadaan.satuan"
                />
              </div>

              <!-- Nama Item -->
              <div class="col-12">
                <label class="form-label small fw-bold text-muted mb-1">Nama Barang / Usulan Alat: <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control form-control-sm fw-bold" 
                  placeholder="Ketik nama alat medis, barang ATK, atau pemeliharaan..."
                  v-model="formPengadaan.nama_item"
                />
              </div>

              <!-- Spesifikasi / Alasan -->
              <div class="col-12">
                <label class="form-label small fw-bold text-muted mb-1">Spesifikasi / Alasan Kebutuhan:</label>
                <textarea 
                  class="form-control form-control-sm" 
                  rows="2" 
                  placeholder="Jelaskan merek, spek teknis, atau justifikasi kenapa ruangan butuh alat ini..."
                  v-model="formPengadaan.spesifikasi_alasan"
                ></textarea>
              </div>

              <!-- Estimasi Harga Satuan -->
              <div class="col-12 col-md-6">
                <label class="form-label small fw-bold text-muted mb-1">Estimasi Harga Satuan (HPS): <span class="text-danger">*</span></label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Rp</span>
                  <input 
                    type="number" 
                    class="form-control font-monospace fw-bold" 
                    placeholder="0"
                    v-model.number="formPengadaan.harga_satuan"
                  />
                </div>
              </div>

              <!-- Sebaran Bulan 1 s/d 12 -->
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label small fw-bold text-muted mb-0">
                    <i class="fas fa-calendar-check me-1 text-primary"></i> Rencana Jumlah Kebutuhan per Bulan (Bulan 1 s/d 12):
                  </label>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                    @click="fillEvenMonthlyQty"
                  >
                    <i class="fas fa-magic me-1"></i> Isi Rata Semua Bulan
                  </button>
                </div>

                <!-- 12 Bulan Grid Input -->
                <div class="row g-2 p-2 bg-light rounded-3 border">
                  <div v-for="m in 12" :key="m" class="col-2 col-md-2">
                    <div class="text-center">
                      <span class="fs-8 fw-bold text-muted d-block mb-1">Bulan {{ m }}</span>
                      <input 
                        type="number" 
                        min="0"
                        class="form-control form-control-sm text-center font-monospace px-1 py-1"
                        v-model.number="formPengadaan.sebaran_bulan[String(m)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Total Summary -->
              <div class="col-12">
                <div class="alert bg-primary bg-opacity-10 border-0 rounded-3 p-3 d-flex justify-content-between align-items-center mb-0">
                  <div>
                    <span class="text-muted small d-block">Total Kuantitas:</span>
                    <strong class="text-dark font-monospace fs-6">{{ calculatedFormQty }} {{ formPengadaan.satuan || 'Unit' }}</strong>
                  </div>
                  <div class="text-end">
                    <span class="text-muted small d-block">Total Estimasi Anggaran:</span>
                    <strong class="text-danger font-monospace fs-5">Rp {{ formatRupiah(calculatedFormTotalBiaya) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="showModalPengadaan = false">Batal</button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary rounded-3 fw-bold px-4" 
              @click="submitFormPengadaan"
              :disabled="!formPengadaan.nama_item"
            >
              <i class="fas fa-save me-1"></i> Simpan Usulan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL FORM: TAMBAH PROGRAM KERJA (EFISIENSI / MUTU) -->
    <!-- ============================================================== -->
    <div v-if="showModalProker" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="showModalProker = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white p-3 px-4">
            <h6 class="modal-title fw-bold mb-0">
              <i class="fas fa-tasks me-2"></i> Tambah Program Kerja Unit
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="showModalProker = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Jenis Program:</label>
              <select class="form-select form-select-sm" v-model="formProker.jenis">
                <option value="efisiensi">Program Efisiensi (Biaya / Waktu / Energi)</option>
                <option value="mutu">Indikator Mutu Unit</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Judul Program Kerja: <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm fw-bold" placeholder="Contoh: Penghematan Listrik AC di Ruangan" v-model="formProker.judul_program" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Deskripsi & Langkah Pelaksanaan:</label>
              <textarea class="form-control form-control-sm" rows="3" placeholder="Jelaskan langkah konkret pelaksanaan program..." v-model="formProker.deskripsi"></textarea>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold text-muted mb-1">Rencana Waktu Pelaksanaan (Bulan):</label>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="m in 12" :key="m" class="form-check form-check-inline me-1">
                  <input class="form-check-input" type="checkbox" :id="'proker_m_'+m" :value="m" v-model="formProker.bulan_pelaksanaan" />
                  <label class="form-check-label fs-8" :for="'proker_m_'+m">B{{ m }}</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="showModalProker = false">Batal</button>
            <button type="button" class="btn btn-sm btn-primary rounded-3 fw-bold px-3" @click="submitFormProker" :disabled="!formProker.judul_program">
              Simpan Program
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL FORM: TAMBAH PELATIHAN / DIKLAT -->
    <!-- ============================================================== -->
    <div v-if="showModalPelatihan" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="showModalPelatihan = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-info text-white p-3 px-4">
            <h6 class="modal-title fw-bold mb-0"><i class="fas fa-graduation-cap me-2"></i> Tambah Usulan Pelatihan / Diklat</h6>
            <button type="button" class="btn-close btn-close-white" @click="showModalPelatihan = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Jenis Pelatihan:</label>
              <select class="form-select form-select-sm" v-model="formPelatihan.jenis">
                <option value="internal">Internal (In-House Training RS)</option>
                <option value="external">Eksternal (Workshop / Sertifikasi Luar)</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Nama Pelatihan: <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm fw-bold" placeholder="Contoh: Pelatihan ACLS, Triase, atau PPI" v-model="formPelatihan.nama_pelatihan" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Target Sasaran Peserta:</label>
              <input type="text" class="form-control form-control-sm" placeholder="Contoh: Seluruh Perawat UGD (15 orang)" v-model="formPelatihan.deskripsi_sasaran" />
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <label class="form-label small fw-bold text-muted mb-1">Rencana Bulan Ke:</label>
                <select class="form-select form-select-sm" v-model.number="formPelatihan.bulan_pelaksanaan">
                  <option v-for="m in 12" :key="m" :value="m">Bulan {{ m }}</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small fw-bold text-muted mb-1">Estimasi Biaya (Rp):</label>
                <input type="number" class="form-control form-control-sm font-monospace" placeholder="0" v-model.number="formPelatihan.estimasi_biaya" />
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="showModalPelatihan = false">Batal</button>
            <button type="button" class="btn btn-sm btn-info text-white rounded-3 fw-bold px-3" @click="submitFormPelatihan" :disabled="!formPelatihan.nama_pelatihan">
              Simpan Pelatihan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL FORM: TAMBAH FORMASI SDM -->
    <!-- ============================================================== -->
    <div v-if="showModalSdm" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="showModalSdm = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-success text-white p-3 px-4">
            <h6 class="modal-title fw-bold mb-0"><i class="fas fa-user-plus me-2"></i> Pengajuan Tambahan Tenaga (SDM)</h6>
            <button type="button" class="btn-close btn-close-white" @click="showModalSdm = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Jabatan / Profesi yang Dibutuhkan: <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm fw-bold" placeholder="Contoh: Perawat Pelaksana, Radiografer, dll." v-model="formSdm.jabatan" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Jumlah Orang:</label>
              <input type="number" min="1" class="form-control form-control-sm font-monospace" v-model.number="formSdm.jumlah_orang" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold text-muted mb-1">Justifikasi Beban Kerja (ABK):</label>
              <textarea class="form-control form-control-sm" rows="3" placeholder="Jelaskan alasan penambahan (misal peningkatan rasio bed/pasien)..." v-model="formSdm.justifikasi"></textarea>
            </div>
          </div>
          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="showModalSdm = false">Batal</button>
            <button type="button" class="btn btn-sm btn-success rounded-3 fw-bold px-3" @click="submitFormSdm" :disabled="!formSdm.jabatan">
              Simpan Pengajuan SDM
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL FORM: TAMBAH AGENDA RAPAT -->
    <!-- ============================================================== -->
    <div v-if="showModalRapat" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="showModalRapat = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white p-3 px-4">
            <h6 class="modal-title fw-bold mb-0"><i class="fas fa-calendar-alt me-2"></i> Tambah Agenda Rapat Unit</h6>
            <button type="button" class="btn-close btn-close-white" @click="showModalRapat = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Jenis Rapat:</label>
              <select class="form-select form-select-sm" v-model="formRapat.jenis">
                <option value="rutin">Rapat Rutin Bulanan</option>
                <option value="program">Rapat Koordinasi Program Khusus</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Nama Pertemuan: <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm fw-bold" placeholder="Contoh: Rapat Bulanan Unit UGD" v-model="formRapat.nama_rapat" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted mb-1">Keterangan / Frekuensi:</label>
              <input type="text" class="form-control form-control-sm" placeholder="Contoh: Rutin 1x sebulan" v-model="formRapat.deskripsi" />
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold text-muted mb-1">Estimasi Total Biaya Konsumsi Tahunan (Rp):</label>
              <input type="number" class="form-control form-control-sm font-monospace" placeholder="0" v-model.number="formRapat.total_biaya" />
            </div>
          </div>
          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="showModalRapat = false">Batal</button>
            <button type="button" class="btn btn-sm btn-primary rounded-3 fw-bold px-3" @click="submitFormRapat" :disabled="!formRapat.nama_rapat">
              Simpan Rapat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL VERIFIKASI ITEM OLEH TIM TERKAIT (PENGADAAN/LOGISTIK/SARPRAS) -->
    <!-- ============================================================== -->
    <div v-if="verifikasiModalItem" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.55);" @click.self="verifikasiModalItem = null">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header bg-light border-bottom p-3 px-4">
            <h6 class="modal-title fw-bold text-dark mb-0">
              <i class="fas fa-clipboard-check text-primary me-2"></i>
              Verifikasi Teknis & Harga Item
            </h6>
            <button type="button" class="btn-close" @click="verifikasiModalItem = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label text-muted small fw-bold mb-1">Item yang Diverifikasi:</label>
              <div class="p-2 bg-light rounded-3 fw-bold text-dark">
                {{ verifikasiModalItem.nama_item }}
              </div>
              <span class="fs-8 text-muted">Diajukan oleh: {{ verifikasiModalItem.nama_unit }}</span>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted small fw-bold mb-1">Status Verifikasi:</label>
              <select class="form-select form-select-sm" v-model="verifikasiForm.status">
                <option value="disetujui">Disetujui (Spek & Harga Sesuai)</option>
                <option value="penyesuaian">Penyesuaian (Spek/Harga Dikoreksi)</option>
                <option value="ditolak">Ditolak (Tidak Urgen / Stok Masih Ada)</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted small fw-bold mb-1">Harga Satuan Wajar (HPS):</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text">Rp</span>
                <input type="number" class="form-control font-monospace" v-model.number="verifikasiForm.harga_satuan" />
              </div>
              <span class="fs-8 text-muted">Total biaya otomatis dihitung: Harga Satuan x {{ verifikasiModalItem.total_qty || 1 }}</span>
            </div>

            <div class="mb-3">
              <label class="form-label text-muted small fw-bold mb-1">Catatan Tim Verifikator:</label>
              <textarea 
                class="form-control form-control-sm" 
                rows="3" 
                placeholder="Contoh: Spek disesuaikan e-katalog, atau barang dialihkan menggunakan inventaris Sarpras..."
                v-model="verifikasiForm.catatan"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer bg-light p-3 px-4">
            <button type="button" class="btn btn-sm btn-secondary rounded-3" @click="verifikasiModalItem = null">Batal</button>
            <button type="button" class="btn btn-sm btn-primary rounded-3 fw-bold px-3" @click="submitVerifikasi">
              Simpan Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import rkaService from '@/services/rkaService'

const toast = useToast()

const selectedTahun = ref(2027)
const activeTab = ref('dashboard')
const loading = ref(false)
const loadingDisposisi = ref(false)

// Data state
const summary = ref({})
const units = ref([])
const disposisiData = ref([])
const disposisiSummary = ref({ total_item: 0, total_biaya: 0 })

// Filter states
const searchUnitText = ref('')
const filterUnitStatus = ref('')
const disposisiFilter = ref({
  target: 'all',
  status: '',
  search: ''
})

// Portal Unit States
const portalSelectedUnitId = ref(null)
const portalSubTab = ref('pengadaan')
const currentPortalUnit = ref(null)

// Modals
const selectedUnitDetail = ref(null)
const unitTab = ref('pengadaan')
const verifikasiModalItem = ref(null)
const verifikasiForm = ref({
  status: 'disetujui',
  harga_satuan: 0,
  catatan: ''
})

// Form State: Pengadaan
const showModalPengadaan = ref(false)
const formPengadaan = ref({
  id: null,
  unit_id: null,
  kategori: 'alat_medis',
  nama_item: '',
  spesifikasi_alasan: '',
  satuan: 'PCS',
  harga_satuan: 0,
  sebaran_bulan: {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
    '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
  }
})

// Form State: Proker
const showModalProker = ref(false)
const formProker = ref({
  unit_id: null,
  jenis: 'efisiensi',
  judul_program: '',
  deskripsi: '',
  bulan_pelaksanaan: []
})

// Form State: Pelatihan
const showModalPelatihan = ref(false)
const formPelatihan = ref({
  unit_id: null,
  jenis: 'internal',
  nama_pelatihan: '',
  deskripsi_sasaran: '',
  estimasi_biaya: 0,
  bulan_pelaksanaan: 1
})

// Form State: SDM
const showModalSdm = ref(false)
const formSdm = ref({
  unit_id: null,
  jabatan: '',
  jumlah_orang: 1,
  justifikasi: ''
})

// Form State: Rapat
const showModalRapat = ref(false)
const formRapat = ref({
  unit_id: null,
  jenis: 'rutin',
  nama_rapat: '',
  deskripsi: '',
  total_biaya: 0
})

// Computed for Pengadaan Form live calculation
const calculatedFormQty = computed(() => {
  let q = 0
  for (let m = 1; m <= 12; m++) {
    q += Number(formPengadaan.value.sebaran_bulan[String(m)] || 0)
  }
  return q
})

const calculatedFormTotalBiaya = computed(() => {
  return calculatedFormQty.value * Number(formPengadaan.value.harga_satuan || 0)
})

const fillEvenMonthlyQty = () => {
  const input = prompt('Masukkan jumlah kuantiti per bulan:', '1')
  if (input !== null) {
    const val = Number(input) || 0
    for (let m = 1; m <= 12; m++) {
      formPengadaan.value.sebaran_bulan[String(m)] = val
    }
  }
}

// Disposisi Matrix for Dashboard
const disposisiMatrix = computed(() => {
  const list = summary.value.disposisi_summary || []
  const getCat = (target) => {
    const found = list.find(l => l.target_disposisi === target)
    return {
      count: found ? Number(found.total_item) : 0,
      total: found ? Number(found.total_biaya) : 0
    }
  }

  const p = getCat('pengadaan')
  const s = getCat('sarpras')
  const lu = getCat('logistik_umum')
  const lf = getCat('logistik_farmasi')
  const diklatTotal = Number(summary.value.total_diklat_biaya || 0)

  return [
    {
      target: 'pengadaan',
      label: 'Tim Pengadaan',
      desc: 'Pengadaan Alat Medis & Alkes Investasi',
      kategoriText: 'Alat Medis',
      icon: 'fas fa-stethoscope',
      badgeClass: 'bg-primary text-white',
      textClass: 'text-primary',
      count: p.count,
      total: p.total
    },
    {
      target: 'sarpras',
      label: 'Tim Sarpras & IT',
      desc: 'Alat Non-Medis, AC, Komputer, & Pemeliharaan',
      kategoriText: 'Alat Non-Medis / Maint.',
      icon: 'fas fa-tools',
      badgeClass: 'bg-warning text-dark',
      textClass: 'text-warning-emphasis',
      count: s.count,
      total: s.total
    },
    {
      target: 'logistik_umum',
      label: 'Tim Logistik Umum',
      desc: 'ATK, Percetakan, Blangko, & BHP Rumah Tangga',
      kategoriText: 'ATK & Cetakan',
      icon: 'fas fa-boxes',
      badgeClass: 'bg-info text-dark',
      textClass: 'text-info-emphasis',
      count: lu.count,
      total: lu.total
    },
    {
      target: 'logistik_farmasi',
      label: 'Tim Logistik Farmasi',
      desc: 'Bahan Medis Habis Pakai (BMHP) & Cairan',
      kategoriText: 'BMHP / Reagen',
      icon: 'fas fa-pills',
      badgeClass: 'bg-success text-white',
      textClass: 'text-success',
      count: lf.count,
      total: lf.total
    },
    {
      target: 'diklat',
      label: 'Tim Diklat & SDI',
      desc: 'Pelatihan Internal, Workshop Eksternal, & Formasi SDM',
      kategoriText: 'Pelatihan / SDM',
      icon: 'fas fa-graduation-cap',
      badgeClass: 'bg-secondary text-white',
      textClass: 'text-secondary',
      count: 37,
      total: diklatTotal
    }
  ]
})

const totalDisposisiItems = computed(() => {
  return disposisiMatrix.value.reduce((s, d) => s + d.count, 0)
})

const totalDisposisiNominal = computed(() => {
  return disposisiMatrix.value.reduce((s, d) => s + d.total, 0)
})

const totalPengadaanItems = computed(() => {
  if (!summary.value.disposisi_summary) return 431
  return summary.value.disposisi_summary.reduce((s, d) => s + Number(d.total_item), 0)
})

// Filtered Units
const filteredUnits = computed(() => {
  return units.value.filter(u => {
    const matchSearch = !searchUnitText.value || 
      u.nama_unit.toLowerCase().includes(searchUnitText.value.toLowerCase()) ||
      (u.bagian && u.bagian.toLowerCase().includes(searchUnitText.value.toLowerCase()))
    const matchStatus = !filterUnitStatus.value || u.status_approval === filterUnitStatus.value
    return matchSearch && matchStatus
  })
})

// Utility functions
const formatRupiah = (val) => {
  if (!val) return '0'
  return Number(val).toLocaleString('id-ID')
}

const getApprovalBadge = (status) => {
  switch (status) {
    case 'disetujui': return 'bg-success text-white'
    case 'review_keuangan': return 'bg-primary text-white'
    case 'diajukan': return 'bg-warning text-dark'
    default: return 'bg-secondary-subtle text-secondary'
  }
}

const formatApprovalStatus = (status) => {
  switch (status) {
    case 'disetujui': return 'Disahkan'
    case 'review_keuangan': return 'Review Keuangan'
    case 'diajukan': return 'Diajukan (Terkunci)'
    default: return 'Draft'
  }
}

const isUnitLocked = (u) => {
  if (!u) return false
  return ['diajukan', 'review_asmen', 'review_manajer', 'review_keuangan', 'disetujui'].includes(u.status_approval)
}

const getVerifikasiBadge = (status) => {
  switch (status) {
    case 'disetujui': return 'bg-success text-white'
    case 'penyesuaian': return 'bg-warning text-dark'
    case 'ditolak': return 'bg-danger text-white'
    default: return 'bg-secondary-subtle text-secondary'
  }
}

const isMonthActive = (months, m) => {
  if (!months || !Array.isArray(months)) return false
  return months.includes(m)
}

// Data loaders
const loadAllData = async () => {
  loading.value = true
  try {
    const [dashRes, unitRes] = await Promise.all([
      rkaService.getDashboard({ tahun: selectedTahun.value }),
      rkaService.getUnits({ tahun: selectedTahun.value })
    ])

    if (dashRes.data && dashRes.data.success) {
      summary.value = dashRes.data.data
    }
    if (unitRes.data && unitRes.data.success) {
      units.value = unitRes.data.data
      if (units.value.length > 0 && !portalSelectedUnitId.value) {
        portalSelectedUnitId.value = units.value[0].id
        await loadPortalUnitDetail(portalSelectedUnitId.value)
      }
    }

    await fetchDisposisiData()
  } catch (err) {
    console.error('Error loading RKA:', err)
    toast.error('Gagal memuat data RKA')
  } finally {
    loading.value = false
  }
}

const onPortalUnitChange = async () => {
  if (portalSelectedUnitId.value) {
    await loadPortalUnitDetail(portalSelectedUnitId.value)
  }
}

const loadPortalUnitDetail = async (unitId) => {
  try {
    const res = await rkaService.getUnitDetail(unitId)
    if (res.data && res.data.success) {
      currentPortalUnit.value = res.data.data
    }
  } catch (err) {
    console.error('Error load portal unit:', err)
  }
}

const fetchDisposisiData = async () => {
  loadingDisposisi.value = true
  try {
    const params = {
      tahun: selectedTahun.value,
      target: disposisiFilter.value.target,
      status: disposisiFilter.value.status,
      search: disposisiFilter.value.search
    }
    const res = await rkaService.getDisposisi(params)
    if (res.data && res.data.success) {
      disposisiData.value = res.data.data || []
      disposisiSummary.value = res.data.summary || {
        total_item: disposisiData.value.length,
        total_biaya: disposisiData.value.reduce((s, i) => s + (Number(i.total_biaya || i.estimasi_biaya) || 0), 0)
      }
    }
  } catch (err) {
    console.error('Error fetching disposisi:', err)
  } finally {
    loadingDisposisi.value = false
  }
}

const switchDisposisiFilter = (target) => {
  disposisiFilter.value.target = target
  activeTab.value = 'disposisi'
  fetchDisposisiData()
}

// Open Unit Detail from Tab 3
const openUnitDetailModal = async (unitId) => {
  try {
    const res = await rkaService.getUnitDetail(unitId)
    if (res.data && res.data.success) {
      selectedUnitDetail.value = res.data.data
      unitTab.value = 'pengadaan'
    }
  } catch (err) {
    toast.error('Gagal mengambil rincian unit')
  }
}

const updateUnitStatus = async (unitId, status) => {
  try {
    const res = await rkaService.updateUnitApproval(unitId, {
      status_approval: status,
      petugas_nik: 'USER',
      petugas_nama: 'User Approval'
    })
    if (res.data && res.data.success) {
      toast.success('Status pengesahan unit berhasil diubah')
      if (selectedUnitDetail.value) {
        selectedUnitDetail.value.status_approval = status
      }
      if (currentPortalUnit.value && currentPortalUnit.value.id === unitId) {
        currentPortalUnit.value.status_approval = status
      }
      loadAllData()
    }
  } catch (err) {
    toast.error('Gagal memperbarui status')
  }
}

// Unit Head submits proposal
const confirmSubmitUnit = async () => {
  if (!currentPortalUnit.value) return
  if (!confirm(`Apakah Anda yakin ingin mengajukan Usulan RKA Unit ${currentPortalUnit.value.nama_unit}? Dokumen akan terkunci untuk ditinjau oleh tim terkait dan manajemen.`)) {
    return
  }
  try {
    const res = await rkaService.submitUnitProposal(currentPortalUnit.value.id, {
      petugas_nik: 'USER',
      petugas_nama: 'Kepala Unit'
    })
    if (res.data && res.data.success) {
      toast.success(res.data.message || 'Usulan berhasil diajukan!')
      await loadPortalUnitDetail(currentPortalUnit.value.id)
      loadAllData()
    }
  } catch (err) {
    toast.error('Gagal mengajukan usulan unit')
  }
}

// Modal Form Openers
const openAddPengadaanModal = (unitId) => {
  formPengadaan.value = {
    id: null,
    unit_id: unitId,
    kategori: 'alat_medis',
    nama_item: '',
    spesifikasi_alasan: '',
    satuan: 'PCS',
    harga_satuan: 0,
    sebaran_bulan: {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0
    }
  }
  showModalPengadaan.value = true
}

const openEditPengadaanModal = (item) => {
  const sb = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 }
  if (item.sebaran_bulan && typeof item.sebaran_bulan === 'object') {
    Object.keys(item.sebaran_bulan).forEach(k => {
      sb[k] = item.sebaran_bulan[k]
    })
  }

  formPengadaan.value = {
    id: item.id,
    unit_id: item.rka_unit_id,
    kategori: item.kategori,
    nama_item: item.nama_item,
    spesifikasi_alasan: item.spesifikasi_alasan,
    satuan: item.satuan || 'PCS',
    harga_satuan: item.harga_satuan || 0,
    sebaran_bulan: sb
  }
  showModalPengadaan.value = true
}

const submitFormPengadaan = async () => {
  try {
    const payload = {
      kategori: formPengadaan.value.kategori,
      nama_item: formPengadaan.value.nama_item,
      spesifikasi_alasan: formPengadaan.value.spesifikasi_alasan,
      satuan: formPengadaan.value.satuan,
      harga_satuan: formPengadaan.value.harga_satuan,
      sebaran_bulan: formPengadaan.value.sebaran_bulan
    }

    if (formPengadaan.value.id) {
      await rkaService.updatePengadaan(formPengadaan.value.id, payload)
      toast.success('Usulan barang berhasil diperbarui')
    } else {
      await rkaService.addPengadaan(formPengadaan.value.unit_id, payload)
      toast.success('Usulan barang baru berhasil ditambahkan')
    }

    showModalPengadaan.value = false
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menyimpan usulan barang')
  }
}

const deletePengadaanItem = async (itemId) => {
  if (!confirm('Hapus item usulan pengadaan ini?')) return
  try {
    await rkaService.deletePengadaan(itemId)
    toast.success('Item berhasil dihapus')
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menghapus item')
  }
}

// Proker Handlers
const openAddProkerModal = (unitId) => {
  formProker.value = {
    unit_id: unitId,
    jenis: 'efisiensi',
    judul_program: '',
    deskripsi: '',
    bulan_pelaksanaan: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
  showModalProker.value = true
}

const submitFormProker = async () => {
  try {
    await rkaService.addProgramKerja(formProker.value.unit_id, formProker.value)
    toast.success('Program kerja berhasil ditambahkan')
    showModalProker.value = false
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
  } catch (err) {
    toast.error('Gagal menambah program kerja')
  }
}

const deleteProkerItem = async (id) => {
  if (!confirm('Hapus program kerja ini?')) return
  try {
    await rkaService.deleteProgramKerja(id)
    toast.success('Program kerja dihapus')
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
  } catch (err) {
    toast.error('Gagal menghapus proker')
  }
}

// Pelatihan Handlers
const openAddPelatihanModal = (unitId) => {
  formPelatihan.value = {
    unit_id: unitId,
    jenis: 'internal',
    nama_pelatihan: '',
    deskripsi_sasaran: '',
    estimasi_biaya: 0,
    bulan_pelaksanaan: 1
  }
  showModalPelatihan.value = true
}

const submitFormPelatihan = async () => {
  try {
    await rkaService.addPelatihan(formPelatihan.value.unit_id, formPelatihan.value)
    toast.success('Usulan pelatihan berhasil ditambahkan')
    showModalPelatihan.value = false
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menambah pelatihan')
  }
}

const deletePelatihanItem = async (id) => {
  if (!confirm('Hapus usulan pelatihan ini?')) return
  try {
    await rkaService.deletePelatihan(id)
    toast.success('Usulan pelatihan dihapus')
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menghapus pelatihan')
  }
}

// SDM Handlers
const openAddSdmModal = (unitId) => {
  formSdm.value = {
    unit_id: unitId,
    jabatan: '',
    jumlah_orang: 1,
    justifikasi: ''
  }
  showModalSdm.value = true
}

const submitFormSdm = async () => {
  try {
    await rkaService.addSdm(formSdm.value.unit_id, formSdm.value)
    toast.success('Pengajuan formasi SDM berhasil ditambahkan')
    showModalSdm.value = false
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
  } catch (err) {
    toast.error('Gagal menambah formasi SDM')
  }
}

const deleteSdmItem = async (id) => {
  if (!confirm('Hapus pengajuan formasi SDM ini?')) return
  try {
    await rkaService.deleteSdm(id)
    toast.success('Pengajuan formasi SDM dihapus')
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
  } catch (err) {
    toast.error('Gagal menghapus SDM')
  }
}

// Rapat Handlers
const openAddRapatModal = (unitId) => {
  formRapat.value = {
    unit_id: unitId,
    jenis: 'rutin',
    nama_rapat: '',
    deskripsi: '',
    total_biaya: 0
  }
  showModalRapat.value = true
}

const submitFormRapat = async () => {
  try {
    await rkaService.addRapat(formRapat.value.unit_id, formRapat.value)
    toast.success('Agenda rapat berhasil ditambahkan')
    showModalRapat.value = false
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menambah rapat')
  }
}

const deleteRapatItem = async (id) => {
  if (!confirm('Hapus agenda rapat ini?')) return
  try {
    await rkaService.deleteRapat(id)
    toast.success('Agenda rapat dihapus')
    if (currentPortalUnit.value) {
      await loadPortalUnitDetail(currentPortalUnit.value.id)
    }
    loadAllData()
  } catch (err) {
    toast.error('Gagal menghapus rapat')
  }
}

// Open Verifikasi Modal
const openVerifikasiModal = (item) => {
  verifikasiModalItem.value = item
  verifikasiForm.value = {
    status: item.status_verifikasi || 'disetujui',
    harga_satuan: item.harga_satuan || 0,
    catatan: item.catatan_verifikator || ''
  }
}

const submitVerifikasi = async () => {
  if (!verifikasiModalItem.value) return
  try {
    const res = await rkaService.updateVerifikasi(verifikasiModalItem.value.id, {
      status_verifikasi: verifikasiForm.value.status,
      harga_satuan: verifikasiForm.value.harga_satuan,
      catatan_verifikator: verifikasiForm.value.catatan
    })
    if (res.data && res.data.success) {
      toast.success('Verifikasi item berhasil disimpan')
      verifikasiModalItem.value = null
      fetchDisposisiData()
      loadAllData()
    }
  } catch (err) {
    toast.error('Gagal menyimpan verifikasi')
  }
}

// Export Excel functionality
const exportDisposisiToExcel = () => {
  if (disposisiData.value.length === 0) {
    return toast.warning('Tidak ada data disposisi untuk diekspor')
  }

  const exportData = disposisiData.value.map((item, idx) => ({
    'No': idx + 1,
    'Unit Pengusul': item.nama_unit,
    'Bagian': item.bagian || '-',
    'Kategori': item.kategori || item.jenis || '-',
    'Nama Barang / Usulan': item.nama_item || item.nama_pelatihan || item.jabatan,
    'Spesifikasi / Alasan': item.spesifikasi_alasan || item.deskripsi_sasaran || item.justifikasi || '-',
    'Qty': item.total_qty || item.jumlah_orang || 1,
    'Satuan': item.satuan || '-',
    'Harga Satuan (Rp)': item.harga_satuan || 0,
    'Total Biaya (Rp)': item.total_biaya || item.estimasi_biaya || 0,
    'Target Disposisi': item.target_disposisi,
    'Status Verifikasi': item.status_verifikasi || 'menunggu',
    'Catatan Verifikator': item.catatan_verifikator || ''
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Disposisi')
  XLSX.writeFile(wb, `Rekap_Disposisi_RKA_${disposisiFilter.value.target}_${selectedTahun.value}.xlsx`)
  toast.success('File Excel disposisi berhasil diunduh')
}

const exportCurrentViewToExcel = () => {
  if (units.value.length === 0) return toast.warning('Data belum dimuat')

  const exportData = units.value.map((u, idx) => ({
    'No': idx + 1,
    'Nama Unit Kerja': u.nama_unit,
    'Bagian': u.bagian || '-',
    'Jumlah Proker': u.program_kerja_count || 0,
    'Jumlah Pelatihan': u.pelatihan_count || 0,
    'Jumlah Rapat': u.rapat_count || 0,
    'Jumlah SDM': u.sdm_count || 0,
    'Jumlah Pengadaan': u.pengadaan_count || 0,
    'Total Anggaran Belanja (Rp)': u.total_anggaran_belanja || 0,
    'Proyeksi Pendapatan (Rp)': u.total_proyeksi_pendapatan || 0,
    'Status Approval': u.status_approval
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_40_Unit')
  XLSX.writeFile(wb, `Konsolidasi_RKA_40_Unit_${selectedTahun.value}.xlsx`)
  toast.success('Konsolidasi Excel 40 Unit berhasil diunduh')
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.proker-anggaran-container {
  background-color: #f8fafc;
  min-height: 100vh;
}
.page-title {
  font-size: 1.35rem;
  letter-spacing: -0.02em;
}
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}
.fs-7 { font-size: 0.85rem; }
.fs-8 { font-size: 0.75rem; }
.cursor-pointer { cursor: pointer; }
.tracking-wider { letter-spacing: 0.05em; }
</style>
