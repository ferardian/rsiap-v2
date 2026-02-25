<template>
  <div class="ppra-report-container">
    <div class="header-section mb-4">
      <h2 class="page-title text-primary"><i class="fas fa-file-medical-alt me-2"></i> Laporan PPRA</h2>
      <p class="text-muted">Laporan Penggunaan Antibiotik (Antibiotic Use Report)</p>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border" style="width: fit-content;">
      <li class="nav-item">
        <a class="nav-link px-4 py-2" :class="{ active: reportTab === 'detail' }" href="#" @click.prevent="reportTab = 'detail'">
          <i class="fas fa-list-alt me-2"></i> Detail Laporan
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link px-4 py-2" :class="{ active: reportTab === 'rekap' }" href="#" @click.prevent="reportTab = 'rekap'">
          <i class="fas fa-chart-bar me-2"></i> Rekap Bulanan (DDD)
        </a>
      </li>
    </ul>

    <!-- Mobile Filter Toggle -->
    <div class="mobile-filter-toggle d-md-none mb-3">
      <button class="btn w-100 d-flex justify-content-between align-items-center py-2 px-3 border shadow-sm rounded-3" 
        :class="showFiltersMobile ? 'btn-primary text-white' : 'bg-white text-primary'"
        @click="showFiltersMobile = !showFiltersMobile"
      >
        <span class="fw-bold"><i class="fas fa-filter me-2"></i> {{ showFiltersMobile ? 'Sembunyikan Filter' : 'Tampilkan Filter' }}</span>
        <i class="fas" :class="showFiltersMobile ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>
    </div>

    <!-- Filter Card (Detail Mode) -->
    <div v-if="reportTab === 'detail'" class="filter-card glass-effect mb-4 animate-fade" :class="{ 'd-none d-md-block': !showFiltersMobile }">
      <div class="d-flex flex-wrap align-items-end gap-3">
        <div class="filter-item">
          <label class="form-label-custom">Tanggal Start</label>
          <input v-model="filters.tgl_start" type="date" class="form-control modern-input date-input">
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Tanggal End</label>
          <input v-model="filters.tgl_end" type="date" class="form-control modern-input date-input">
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Spesialis</label>
          <select v-model="filters.kd_sps" class="form-select modern-input" style="min-width: 150px">
            <option value="">Semua Spesialis</option>
            <option v-for="sps in spesialisOptions" :key="sps.kd_sps" :value="sps.kd_sps">
              {{ sps.nm_sps }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Dokter</label>
          <SearchableSelect
            v-model="filters.kd_dokter"
            :options="dokterOptions"
            labelKey="nm_dokter"
            valueKey="kd_dokter"
            placeholder="Semua Dokter"
            style="min-width: 250px"
          />
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Status Verifikasi</label>
          <select v-model="filters.status_telaah" class="form-select modern-input" style="min-width: 140px">
            <option value="">Semua</option>
            <option value="BELUM">Belum Ditelaah</option>
            <option value="SESUAI">Sesuai</option>
            <option value="TIDAK SESUAI">Tidak Sesuai</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="form-label-custom">Status Persetujuan</label>
          <select v-model="filters.status_persetujuan" class="form-select modern-input" style="min-width: 140px">
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="ACC">ACC</option>
            <option value="REJECT">Reject</option>
          </select>
        </div>
        <div class="filter-item flex-grow-1" style="min-width: 200px">
          <label class="form-label-custom">Cari Pasien (Nama, RM, Rawat)</label>
          <div class="position-relative">
            <input 
              v-model="filters.search" 
              type="text" 
              class="form-control modern-input ps-4" 
              placeholder="Ketik kriteria cari..."
              @keyup.enter="handleSearch"
            >
            <i class="fas fa-search position-absolute start-0 top-50 translate-middle-y ms-2 text-muted" style="font-size: 12px;"></i>
          </div>
        </div>
        <div class="filter-actions d-flex gap-2">
          <button class="btn btn-primary ripple" @click="handleSearch" :disabled="loading">
            <i class="fas fa-search me-1"></i> Tampilkan
          </button>
          <button class="btn btn-success ripple" @click="exportToExcel" :disabled="reportData.length === 0">
            <i class="fas fa-file-excel me-1"></i> Export Excel
          </button>
        </div>
      </div>
    </div>
    <!-- Filter Card (Rekap Mode) -->
    <div v-if="reportTab === 'rekap'" class="filter-card glass-effect mb-4 animate-fade" :class="{ 'd-none d-md-block': !showFiltersMobile }">
      <div class="d-flex align-items-end gap-3">
        <div class="filter-item">
          <label class="form-label-custom">Pilih Tahun</label>
          <select v-model="rekapYear" class="form-select modern-input" style="min-width: 120px">
            <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary ripple px-4" @click="fetchRekapBulanan" :disabled="loadingRekap">
            <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loadingRekap }"></i> Refresh Data
          </button>
        </div>
      </div>
    </div>
 
    <!-- Summary Cards (Only in Detail Mode) -->
    <div v-if="reportTab === 'detail' && reportData.length > 0" class="row mb-4 animate-fade px-1">
      <div class="col-md-4 mb-3 mb-md-0">
        <div class="summary-card glass-effect p-3 d-flex align-items-center gap-3 border-start-primary">
          <div class="summary-icon bg-soft-primary text-primary">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase">Total Pasien</div>
            <div class="h4 mb-0 fw-bold">{{ summaryStats.totalPatient }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3 mb-md-0">
        <div class="summary-card glass-effect p-3 d-flex align-items-center gap-3 border-start-success">
          <div class="summary-icon bg-soft-success text-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="flex-grow-1">
            <div class="text-muted small fw-bold text-uppercase mb-2">Status Verifikasi</div>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-success fw-bold" style="font-size: 14px;">✓ {{ summaryStats.verification.verified }}</div>
                <div class="text-muted" style="font-size: 11px;">Terverifikasi</div>
              </div>
              <div class="text-end">
                <div class="text-warning fw-bold" style="font-size: 14px;">⏳ {{ summaryStats.verification.pending }}</div>
                <div class="text-muted" style="font-size: 11px;">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="summary-card glass-effect p-3 d-flex align-items-center gap-3 border-start-info">
          <div class="summary-icon bg-soft-info text-info">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="flex-grow-1">
            <div class="text-muted small fw-bold text-uppercase mb-2">Status Approval</div>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-success fw-bold" style="font-size: 14px;">✓ {{ summaryStats.approval.approved }}</div>
                <div class="text-muted" style="font-size: 11px;">Disetujui</div>
              </div>
              <div class="text-end">
                <div class="text-warning fw-bold" style="font-size: 14px;">⏳ {{ summaryStats.approval.pending }}</div>
                <div class="text-muted" style="font-size: 11px;">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Missing Aturan Pakai Alert -->
    <div v-if="reportTab === 'detail' && missingDosageCount > 0" class="alert d-flex align-items-center justify-content-between gap-2 mb-3 mx-1 rounded-3 shadow-sm" :class="filterMissingDosage ? 'alert-primary' : 'alert-warning'" style="font-size: 13px;">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-exclamation-triangle" :class="filterMissingDosage ? 'text-primary' : 'text-warning'" style="font-size: 16px;"></i>
        <div>
          <strong>{{ missingDosageCount }} pemberian</strong> belum memiliki aturan pakai — DDD tidak dapat dihitung.
        </div>
      </div>
      <button class="btn btn-sm fw-semibold" :class="filterMissingDosage ? 'btn-primary' : 'btn-warning text-dark'" @click="toggleMissingDosageFilter" style="white-space: nowrap; font-size: 12px;">
        <i class="fas" :class="filterMissingDosage ? 'fa-list' : 'fa-filter'"></i>
        {{ filterMissingDosage ? 'Tampilkan Semua' : 'Tampilkan Yang Kosong' }}
      </button>
    </div>

    <!-- Report Table (Detail Mode) -->
    <div v-if="reportTab === 'detail'" class="report-table-section animate-fade border rounded-4 shadow-sm bg-white">
      <div v-if="loading" class="loading-overlay d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Menganalisis data antibiotik...</p>
      </div>

      <div v-if="!loading && reportData.length === 0" class="empty-state py-5 text-center">
        <i class="fas fa-folder-open text-muted mb-3" style="font-size: 48px;"></i>
        <h5>Belum Ada Data</h5>
        <p class="text-muted">Gunakan filter untuk menampilkan laporan.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-bordered ppra-table">
          <thead>
            <tr class="bg-light">
              <th width="50" class="text-center">No</th>
              <th style="min-width: 250px;">Informasi Pasien</th>
              <th>Diagnosa</th>
              <th width="80">Jenis Ab</th>
              <th width="100">Tgl Beri</th>
              <th width="60" class="text-center">Rute</th>
              <th width="70">LOS</th>
              <th style="min-width: 150px;">Aturan Pakai</th>
              <th width="80" class="text-center">Status</th>
              <th width="80">Total Pakai</th>
              <th width="70" class="text-center">WHO (DDD)</th>
              <th width="80" class="text-center">Total DDD</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, pIndex) in paginatedData" :key="pIndex" :class="{'new-patient-row': item.is_new_patient, 'sub-total-row bg-light-subtle': item.isSubTotal, 'missing-dosage-row': !item.isSubTotal && (!item.penggunaan_harian || item.penggunaan_harian === '-' || item.penggunaan_harian.trim() === '')}">
              <template v-if="!item.isSubTotal">
                <td class="text-center">{{ item.is_new_patient ? getPatientIndex(item.original_index) : '' }}</td>
                <td>
                  <div v-if="item.is_new_patient || (pIndex === 0 && !item.isSubTotal)" class="d-flex flex-column animate-fade">
                    <div class="d-flex align-items-center gap-2">
                      <span class="fw-bold text-dark h6 mb-0">{{ item.nm_pasien }}</span>
                      <span class="age-tag bg-soft-info text-info border border-info border-opacity-25 animate-fade">
                        <i class="fas fa-baby-carriage me-1" style="font-size: 10px;"></i>
                        {{ item.usia }}
                      </span>
                    </div>
                    <div class="d-flex flex-wrap gap-2 align-items-center mt-1">
                      <span class="badge bg-light text-primary border px-2">RM: {{ item.no_rkm_medis }}</span>
                      <span class="badge bg-light text-secondary border px-2">No: {{ item.no_rawat }}</span>
                      <span class="badge bg-light text-danger border px-2"><i class="fas fa-weight me-1"></i>{{ item.berat_badan }}</span>
                      <span class="text-muted" style="font-size: 11px;">
                        <i class="far fa-calendar-alt me-1"></i>{{ item.tgl_masuk }}
                      </span>
                    </div>
                    <div class="mt-1 d-flex align-items-center gap-1">
                      <i class="fas fa-user-md text-primary" style="font-size: 11px;"></i>
                      <span class="text-primary fw-medium" style="font-size: 11px;">DPJP: {{ item.nm_dokter }}</span>
                    </div>
                  </div>
                </td>
                <td class="small diagnosa-cell">
                  <div v-if="item.is_new_patient || (pIndex === 0 && !item.isSubTotal)" class="animate-fade">
                    {{ item.diagnosa }}
                  </div>
                </td>
                <td>{{ item.jenis_ab }}</td>
                <td class="text-muted small">{{ item.tgl_pemberian }}</td>
                <td class="text-center"><span class="badge badge-rute">{{ item.rute }}</span></td>
                <td>
                  <div v-if="item.is_new_patient || (pIndex === 0 && !item.isSubTotal)" class="animate-fade">
                    {{ item.los }}
                  </div>
                </td>
                <td class="small editable-cell aturan-pakai-cell" @click="openAdjustmentModal(item)">
                  {{ item.penggunaan_harian || '-' }}
                  <i class="fas fa-edit ms-1 opacity-25 edit-icon"></i>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <span :class="getStatusBadgeClass(item.status_telaah, 'telaah')" style="font-size: 10px; padding: 2px 5px;">
                      T: {{ item.status_telaah }}
                    </span>
                    <span :class="getStatusBadgeClass(item.status_persetujuan, 'approve')" style="font-size: 10px; padding: 2px 5px;">
                      P: {{ item.status_persetujuan }}
                    </span>
                  </div>
                </td>
                <td class="small">{{ item.total_pakai }}</td>
                <td class="text-center fw-bold text-muted" style="font-size: 11px;">{{ item.ddd_factor }}</td>
                <td class="text-center fw-bold text-primary">{{ item.total_ddd ?? '-' }}</td>
              </template>
              <template v-else>
                <td colspan="9" class="text-end fw-bold bg-soft-secondary py-2 border-end italic" style="font-size: 12px;">
                  <i class="fas fa-calculator me-2"></i> {{ item.jenis_ab }}
                </td>
                <td class="text-center fw-bold bg-soft-secondary text-dark py-2 border-end">
                  {{ item.total_pakai }}
                </td>
                <td class="bg-soft-secondary border-end"></td>
                <td class="text-center fw-bold bg-primary text-white py-2 shadow-sm">
                  {{ item.total_ddd }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="reportTab === 'detail' && reportData.length > itemsPerPage" class="d-flex justify-content-between align-items-center mt-4 p-3 glass-effect animate-fade">
      <div class="text-muted small">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, reportData.length) }} dari {{ reportData.length }} data
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-light border" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="d-flex gap-1">
          <button v-for="page in totalPages" :key="page" 
            v-show="page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1"
            class="btn btn-sm" 
            :class="page === currentPage ? 'btn-primary' : 'btn-light border'"
            @click="changePage(page)">
            {{ page }}
          </button>
        </div>
        <button class="btn btn-sm btn-light border" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Rekap Bulanan Table (Rekap Mode) -->
    <div v-if="reportTab === 'rekap'" class="rekap-section animate-fade">
      <div class="table-responsive border rounded-4 shadow-sm bg-white">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light sticky-top" style="z-index: 10;">
            <tr>
              <th rowspan="2" class="text-center align-middle bg-light" width="50" style="border-bottom: 1px solid #dee2e6;">No</th>
              <th rowspan="2" class="align-middle bg-light" style="border-bottom: 1px solid #dee2e6; min-width: 250px;">Nama Antibiotik</th>
              <th colspan="12" class="text-center bg-light" style="border-bottom: 1px solid #dee2e6;">Bulan (Total DDD)</th>
              <th rowspan="2" class="text-center align-middle bg-primary text-white" width="100" style="border-bottom: 1px solid #dee2e6;">Total</th>
            </tr>
            <tr class="bg-light-subtle">
              <th v-for="m in monthNames" :key="m" class="text-center small py-1" style="font-size: 10px; border-bottom: 1px solid #dee2e6; min-width: 45px;">{{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingRekap">
              <td colspan="15" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                <span class="text-muted">Sedang memproses data rekap bulanan...</span>
              </td>
            </tr>
            <tr v-else-if="rekapData.length === 0">
              <td colspan="15" class="text-center py-5">
                <div class="empty-state">
                  <i class="fas fa-chart-line text-muted mb-3" style="font-size: 40px; opacity: 0.3;"></i>
                  <p class="text-muted mb-0">Data rekap DDD tidak ditemukan untuk tahun {{ rekapYear }}</p>
                </div>
              </td>
            </tr>
            <tr v-for="(item, idx) in rekapData" :key="item.kode_brng" v-else>
              <td class="text-center text-muted small" style="background: #f8fafc;">{{ idx + 1 }}</td>
              <td class="fw-medium text-dark">{{ item.nama_brng }}</td>
              <td v-for="m in 12" :key="m" class="text-center small" 
                  :class="{ 'text-muted opacity-25': item.months[m] === 0, 'fw-bold text-success': item.months[m] > 0 }" 
                  style="font-size: 11px;">
                {{ item.months[m] > 0 ? item.months[m] : '0' }}
              </td>
              <td class="text-center fw-bold text-primary bg-soft-primary">
                {{ Object.values(item.months).reduce((a, b) => a + b, 0).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div v-if="showModal" class="modal-overlay animate-fade" @click.self="closeModal">
      <div class="modal-content glass-effect animate-slide-up">
        <div class="modal-header border-0 pb-0">
          <ul class="nav nav-tabs border-bottom-0 w-100">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'adjustment' }" href="#" @click.prevent="activeTab = 'adjustment'">
                <i class="fas fa-edit me-1"></i> Penyesuaian
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'telaah' }" href="#" @click.prevent="activeTab = 'telaah'">
                <i class="fas fa-microscope me-1"></i> Telaah
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'approval' }" href="#" @click.prevent="activeTab = 'approval'">
                <i class="fas fa-check-double me-1"></i> Persetujuan
              </a>
            </li>
          </ul>
          <button class="btn-close ms-2" @click="closeModal"></button>
        </div>
        <div class="modal-body p-4 pt-3">
          <!-- Info Ringkas -->
          <div class="patient-info-brief mb-4">
            <div class="row">
              <div class="col-6 border-end">
                <label class="small text-muted mb-1">Nama Pasien</label>
                <div class="fw-bold truncate-text">{{ editingItem.nm_pasien }}</div>
              </div>
              <div class="col-6">
                <label class="small text-muted mb-1">Jenis Antibiotik</label>
                <div class="fw-bold text-primary truncate-text">{{ editingItem.jenis_ab }}</div>
              </div>
            </div>
          </div>

          <!-- TAB: ADJUSTMENT -->
          <div v-if="activeTab === 'adjustment'" class="animate-fade">
            <div class="mb-3">
              <label class="form-label-custom">Aturan Pakai (Verifikasi)</label>
              <input v-model="adjustmentForm.aturan_pakai" type="text" class="form-control modern-input" placeholder="Contoh: 3 x 1 tablet">
              <div class="small text-muted mt-2">
                <i class="fas fa-info-circle me-1"></i> Digunakan jika aturan pakai asli dokter kosong.
              </div>
            </div>
            
            <div class="mb-0">
              <label class="form-label-custom">Keterangan Tambahan</label>
              <textarea v-model="adjustmentForm.keterangan" class="form-control modern-input" style="height: 100px" placeholder="Beri catatan jika diperlukan..."></textarea>
            </div>

            <!-- SMART LOOKUP: SOAP RTL -->
            <div class="mt-4 pt-3 border-top">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="small fw-bold text-muted uppercase-tracking">
                  <i class="fas fa-magic me-1"></i> Smart Lookup (SOAP RTL)
                </label>
                <div v-if="loadingSuggestions" class="spinner-border spinner-border-sm text-primary" role="status"></div>
              </div>
              
              <div v-if="soapSuggestions.length > 0" class="suggestion-container animate-fade">
                <div v-for="(sug, sIndex) in soapSuggestions" :key="sIndex" 
                  class="suggestion-item p-2 mb-2 rounded border bg-light-hover cursor-pointer"
                  @click="applySoapSuggestion(sug.suggestion)">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small fw-bold text-primary">{{ sug.suggestion }}</span>
                    <span class="text-muted" style="font-size: 10px;">{{ sug.tgl }}</span>
                  </div>
                  <div class="text-muted small italic truncate-text">"{{ sug.raw_text }}"</div>
                </div>
              </div>
              <div v-else-if="!loadingSuggestions" class="text-center py-3 bg-light rounded border-dashed">
                <span class="text-muted small">Tidak ditemukan isian dosis di SOAP RTL untuk obat ini.</span>
              </div>
            </div>
          </div>

          <!-- TAB: TELAAH -->
          <div v-if="activeTab === 'telaah'" class="animate-fade">
             <div class="mb-3">
                <label class="form-label-custom">Hasil Telaah Apoteker</label>
                <select v-model="telaahForm.status_telaah" class="form-select modern-input">
                  <option value="SESUAI">SESUAI (Klinis & Farmasi)</option>
                  <option value="TIDAK SESUAI">TIDAK SESUAI</option>
                </select>
             </div>
             <div class="mb-0">
                <label class="form-label-custom">Catatan Telaah</label>
                <textarea v-model="telaahForm.catatan_telaah" class="form-control modern-input" style="height: 120px" placeholder="Beri alasan telaah..."></textarea>
             </div>
          </div>

          <!-- TAB: APPROVAL -->
          <div v-if="activeTab === 'approval'" class="animate-fade">
             <div class="mb-3">
                <label class="form-label-custom">Keputusan Ketua PPRA</label>
                <select v-model="approveForm.status_persetujuan" class="form-select modern-input">
                  <option value="PENDING">PENDING</option>
                  <option value="ACC">SETUJU (ACC)</option>
                  <option value="REJECT">TOLAK (REJECT)</option>
                </select>
             </div>
             <div class="mb-0">
                <label class="form-label-custom">Catatan Persetujuan</label>
                <textarea v-model="approveForm.catatan_persetujuan" class="form-control modern-input" style="height: 120px" placeholder="Instruksi tambahan dari ketua..."></textarea>
             </div>
          </div>
        </div>

        <div class="modal-footer p-3 bg-light d-flex justify-content-end gap-2 border-0">
          <button class="btn btn-light" @click="closeModal" :disabled="saving">Batal</button>
          
          <button v-if="activeTab === 'adjustment'" class="btn btn-primary" @click="saveAdjustment" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Adjustment
          </button>
          
          <button v-if="activeTab === 'telaah'" class="btn btn-success" @click="saveTelaah" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Telaah
          </button>
          
          <button v-if="activeTab === 'approval'" class="btn btn-dark" @click="saveApproval" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span> Simpan Keputusan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import SearchableSelect from '@/components/ui/SearchableSelect.vue';
import ppraService from '@/services/ppraService';
import { utils, writeFile } from 'xlsx';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const reportData = ref([]);
const filters = reactive({
  tgl_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  tgl_end: dayjs().format('YYYY-MM-DD'),
  kd_sps: '',
  kd_dokter: '',
  search: '',
  status_telaah: '',
  status_persetujuan: ''
});

// Rekap Bulanan States
const reportTab = ref('detail');
const rekapYear = ref(dayjs().format('YYYY'));
const filterMissingDosage = ref(false);
const rekapData = ref([]);
const loadingRekap = ref(false);
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const spesialisOptions = ref([]);
const dokterOptions = ref([]);

const showFiltersMobile = ref(false);

const currentPage = ref(1);
const itemsPerPage = ref(25);

const reportMetrics = ref({
  verification: { verified: 0, pending: 0 },
  approval: { approved: 0, pending: 0 }
});

const summaryStats = computed(() => {
  if (!reportData.value.length) {
    return {
      totalPatient: 0,
      verification: { verified: 0, pending: 0 },
      approval: { approved: 0, pending: 0 }
    };
  }
  
  const totalPatient = reportData.value.filter(i => i.is_new_patient).length;
  
  return {
    totalPatient,
    verification: reportMetrics.value.verification,
    approval: reportMetrics.value.approval
  };
});

const missingDosageCount = computed(() => {
  return reportData.value.filter(r => !r.penggunaan_harian || r.penggunaan_harian === '-' || r.penggunaan_harian.trim() === '').length;
});

const reportTableRows = computed(() => {
  const rawRows = reportData.value;
  if (!rawRows.length) return [];

  const processedRows = [];
  let medicineGroup = [];

  const addSubTotalRow = (group) => {
    if (group.length === 0) return;
    
    // Check if ANY row in group has empty dosage rules OR if any row has 0 DDD
    const hasEmptyDosage = group.some(r => !r.penggunaan_harian || r.penggunaan_harian === '-' || r.penggunaan_harian.trim() === '');
    
    // Sum quantity and DDD
    const totalJml = group.reduce((sum, r) => sum + (r.jml_total || 0), 0);
    const totalDdd = group.reduce((sum, r) => sum + (parseFloat(r.total_ddd) || 0), 0);
    const lastRow = group[group.length - 1];

    // Hide DDD if any row lacks dosage OR if total is 0
    const shouldHideDdd = hasEmptyDosage || totalDdd === 0;

    processedRows.push({
      isSubTotal: true,
      jenis_ab: `TOTAL ${lastRow.jenis_ab}`,
      total_pakai: `${totalJml} ${lastRow.satuan}`,
      total_ddd: shouldHideDdd ? '-' : totalDdd.toFixed(2),
      // Empty fields for other columns to prevent template errors
      no_rawat: '', nm_pasien: '', no_rkm_medis: '', nm_dokter: '', tgl_pemberian: '', 
      rute: '', penggunaan_harian: '', status_telaah: '', status_persetujuan: '', 
      ddd_factor: '', original_index: -1, is_new_patient: false
    });
  };

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const nextRow = rawRows[i + 1];

    // Store original index for the 'No' column
    processedRows.push({ ...row, isSubTotal: false, original_index: i });
    medicineGroup.push(processedRows[processedRows.length - 1]);

    // Check if group ends (Change in patient or medicine)
    const isLastInGroup = !nextRow || 
                          nextRow.no_rkm_medis !== row.no_rkm_medis || 
                          nextRow.jenis_ab !== row.jenis_ab;

    if (isLastInGroup) {
      addSubTotalRow(medicineGroup);
      medicineGroup = [];
    }
  }

  return processedRows;
});

const filteredTableRows = computed(() => {
  if (!filterMissingDosage.value) return reportTableRows.value;
  return reportTableRows.value.filter(row => {
    if (row.isSubTotal) return false;
    return !row.penggunaan_harian || row.penggunaan_harian === '-' || row.penggunaan_harian.trim() === '';
  });
});

const totalPages = computed(() => Math.ceil(filteredTableRows.value.length / itemsPerPage.value));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTableRows.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const editingItem = ref(null);
const activeTab = ref('adjustment');

const adjustmentForm = reactive({
  no_resep: '',
  kode_brng: '',
  aturan_pakai: '',
  keterangan: ''
});

const soapSuggestions = ref([]);
const loadingSuggestions = ref(false);

const telaahForm = reactive({
  status_telaah: 'SESUAI',
  catatan_telaah: ''
});

const approveForm = reactive({
  status_persetujuan: 'PENDING',
  catatan_persetujuan: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await ppraService.getLaporan({
      tgl_awal: filters.tgl_start,
      tgl_akhir: filters.tgl_end,
      kd_sps: filters.kd_sps,
      kd_dokter: filters.kd_dokter,
      search: filters.search,
      status_telaah: filters.status_telaah,
      status_persetujuan: filters.status_persetujuan
    });
    
    // Handle new response structure with data and metrics
    if (response.data.data && Array.isArray(response.data.data.data)) {
      reportData.value = response.data.data.data || [];
      reportMetrics.value = response.data.data.metrics || {
        verification: { verified: 0, pending: 0 },
        approval: { approved: 0, pending: 0 }
      };
    } else {
      // Fallback for old response structure
      reportData.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch report:', error);
    Swal.fire('Gagal', 'Tidak dapat mengambil data laporan', 'error');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
  filterMissingDosage.value = false; // Reset filter on new search
  showFiltersMobile.value = false; // Hide mobile filters after search
  fetchData();
};

const toggleMissingDosageFilter = () => {
  filterMissingDosage.value = !filterMissingDosage.value;
  currentPage.value = 1;
};

const fetchRekapBulanan = async () => {
  loadingRekap.value = true;
  try {
    const response = await ppraService.getRekapBulanan({
      tahun: rekapYear.value
    });
    rekapData.value = response.data.data || [];
    showFiltersMobile.value = false; // Hide mobile filters after refresh
  } catch (error) {
    console.error('Failed to fetch rekap bulanan:', error);
    Swal.fire('Gagal', 'Tidak dapat mengambil data rekap bulanan', 'error');
  } finally {
    loadingRekap.value = false;
  }
};

const getStatusBadgeClass = (status, type) => {
  if (type === 'telaah') {
    if (status === 'SESUAI') return 'badge bg-success';
    if (status === 'TIDAK SESUAI') return 'badge bg-danger';
    return 'badge bg-secondary';
  } else {
    if (status === 'ACC') return 'badge bg-success';
    if (status === 'REJECT') return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  }
};

const openAdjustmentModal = (item) => {
  editingItem.value = item;
  adjustmentForm.no_resep = item.no_resep;
  adjustmentForm.kode_brng = item.kode_brng;
  adjustmentForm.aturan_pakai = item.penggunaan_harian === '-' ? '' : item.penggunaan_harian;
  adjustmentForm.keterangan = '';

  fetchSoapSuggestions(item);

  telaahForm.status_telaah = item.status_telaah !== 'BELUM' ? item.status_telaah : 'SESUAI';
  telaahForm.catatan_telaah = item.catatan_telaah || '';

  approveForm.status_persetujuan = item.status_persetujuan !== 'PENDING' ? item.status_persetujuan : 'PENDING';
  approveForm.catatan_persetujuan = item.catatan_persetujuan || '';

  activeTab.value = 'adjustment';
  showModal.value = true;
};

const fetchSoapSuggestions = async (item) => {
  loadingSuggestions.value = true;
  soapSuggestions.value = [];
  try {
    const response = await ppraService.getSoapSuggestions({
      no_rawat: item.no_rawat,
      kode_brng: item.kode_brng
    });
    soapSuggestions.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch SOAP suggestions:', error);
  } finally {
    loadingSuggestions.value = false;
  }
};

const fetchSpesialis = async () => {
  try {
    const response = await ppraService.getSpesialisasi();
    spesialisOptions.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch spesialis:', error);
  }
};

const fetchDokter = async () => {
  try {
    const response = await ppraService.getDokter({ limit: 500 }); // Increase limit to fetch more doctors
    dokterOptions.value = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
  }
};

const applySoapSuggestion = (val) => {
  adjustmentForm.aturan_pakai = val;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveAdjustment = async () => {
  saving.value = true;
  try {
    await ppraService.storeVerifikasi(adjustmentForm);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Adjustment berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data', 'error');
  } finally {
    saving.value = false;
  }
};

const saveTelaah = async () => {
  saving.value = true;
  try {
    await ppraService.storeTelaah({
      no_resep: editingItem.value.no_resep,
      kode_brng: editingItem.value.kode_brng,
      ...telaahForm
    });
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Telaah berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menyimpan telaah', 'error');
  } finally {
    saving.value = false;
  }
};

const saveApproval = async () => {
  saving.value = true;
  try {
    await ppraService.storeApprove({
      no_resep: editingItem.value.no_resep,
      kode_brng: editingItem.value.kode_brng,
      ...approveForm
    });
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Persetujuan berhasil disimpan', timer: 1500, showConfirmButton: false });
    closeModal();
    fetchData();
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menyimpan persetujuan', 'error');
  } finally {
    saving.value = false;
  }
};

const getPatientIndex = (index) => {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (reportData.value[i].is_new_patient) count++;
  }
  return count;
};

const exportToExcel = () => {
  const data = reportData.value.map((item, index) => ({
    'No': item.is_new_patient ? getPatientIndex(index) : '',
    'Nama Pasien': item.nm_pasien,
    'No. RM': item.no_rkm_medis,
    'Usia': item.usia,
    'BB': item.berat_badan,
    'DPJP': item.nm_dokter,
    'No. Rawat': item.no_rawat,
    'Tgl Masuk': item.tgl_masuk,
    'Diagnosa': item.diagnosa,
    'Jenis Ab': item.jenis_ab,
    'Tgl Beri': item.tgl_pemberian,
    'Rute': item.rute,
    'LOS (Hari)': item.los,
    'Aturan Pakai': item.penggunaan_harian,
    'Status Telaah': item.status_telaah,
    'Status Persetujuan': item.status_persetujuan,
    'Total Pakai': item.total_pakai,
    'WHO DDD': item.ddd_factor,
    'Total DDD': item.total_ddd
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Laporan PPRA');
  
  const filename = `Laporan_PPRA_${filters.tgl_start}_${filters.tgl_end}.xlsx`;
  writeFile(workbook, filename);
};

onMounted(() => {
  fetchData();
  fetchSpesialis();
  fetchDokter();
  fetchRekapBulanan();
});
</script>

<style scoped>
.ppra-report-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.glass-effect {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.filter-card {
  padding: 20px;
  position: relative;
  z-index: 50;
}

.form-label-custom {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.modern-input {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  height: 38px;
  font-size: 13px;
}

.date-input {
  width: 160px;
}

.filter-item {
  flex-shrink: 0;
}

.ppra-table {
  font-size: 13px;
  border-collapse: collapse;
}

.ppra-table th {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 15px;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  background: #f1f5f9;
  text-transform: uppercase;
  font-size: 11px;
}

.ppra-table td {
  padding: 12px 15px;
  vertical-align: middle;
  border-color: #f1f5f9;
}

.aturan-pakai-cell {
  white-space: pre-line !important;
  line-height: 1.5;
  color: #1e293b;
  font-weight: 500;
}

.new-patient-row {
  border-top: 2px solid #cbd5e1;
}

.missing-dosage-row {
  background-color: #fff8e1 !important;
}

.missing-dosage-row:hover {
  background-color: #fff3cd !important;
}

.sub-total-row td {
  border-top: 1px solid #e2e8f0;
  border-bottom: 2px solid #cbd5e1;
}

.bg-soft-primary {
  background-color: #e0f2fe;
}

.bg-soft-secondary {
  background-color: #f1f5f9;
}

.bg-light-subtle {
  background-color: #f8fafc !important;
}

.italic {
  font-style: italic;
}

.badge-rute {
  background: #e0f2fe;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 700;
}

.summary-card {
  height: 100%;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-3px);
}

.summary-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.border-start-primary { border-left: 4px solid #3b82f6; }
.border-start-success { border-left: 4px solid #10b981; }
.border-start-warning { border-left: 4px solid #f59e0b; }
.border-start-info { border-left: 4px solid #3b82f6; }

.bg-soft-success { background: #ecfdf5; }
.bg-soft-warning { background: #fffbeb; }
.bg-soft-info { background: #eff6ff; }

.bg-soft-primary { background: #eff6ff; }

.diagnosa-cell {
  max-width: 200px;
  line-height: 1.4;
  color: #64748b;
}

.editable-cell {
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.editable-cell:hover {
  background: #f1f5f9 !important;
}

.editable-cell:hover .edit-icon {
  opacity: 1 !important;
  color: #3b82f6;
}

.btn {
  height: 38px;
  padding: 0 18px;
  font-weight: 600;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  margin: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.modal-footer {
  flex-shrink: 0;
}

.patient-info-brief {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

  @media (max-width: 768px) {
  .ppra-report-container { padding: 10px; }
  .filter-card { padding: 15px; }
}

.nav-tabs .nav-link {
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 20px;
  transition: all 0.2s;
}

.nav-tabs .nav-link:hover {
  color: #3b82f6;
  border: none;
}

.nav-tabs .nav-link.active {
  color: #3b82f6;
  background: transparent;
  border-bottom: 2px solid #3b82f6;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Suggestion Styling */
.suggestion-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

.suggestion-item {
  transition: all 0.2s;
  border-color: #e2e8f0 !important;
}

.suggestion-item:hover {
  background-color: #f1f5f9 !important;
  border-color: #3b82f6 !important;
  transform: translateX(4px);
}

.bg-light-hover:hover {
  background-color: #f1f5f9;
}

.cursor-pointer {
  cursor: pointer;
}

.border-dashed {
  border-style: dashed !important;
}

.uppercase-tracking {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bg-soft-info {
  background-color: rgba(186, 230, 253, 0.4);
}

.age-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 0px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
