<template>
  <div class="tab-tarif-operasi">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- 1. Clean Header Row: Title on Left, Action on Right -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="tab-header-icon bg-danger-subtle text-danger shadow-2xs">
              <i class="fas fa-procedures fa-lg"></i>
            </div>
            <div>
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                Tarif Paket Operasi
                <span class="badge bg-light text-secondary border px-2 py-0.5 fs-xs fw-semibold">
                  {{ pagination.total || 0 }} Paket
                </span>
              </h5>
              <p class="text-muted small m-0">Kelola komponen tarif tindakan bedah & kebidanan</p>
            </div>
          </div>
          <div>
            <button class="btn btn-primary premium-action-btn shadow-sm" @click="openModal('add')">
              <i class="fas fa-plus-circle me-1.5"></i> Tambah Tarif
            </button>
          </div>
        </div>

        <!-- 2. Clean Dedicated Filter & Search Toolbar -->
        <div class="filter-toolbar mb-4 p-2.5 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <!-- Search Box -->
            <div class="filter-search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control filter-input" 
                placeholder="Cari nama tindakan atau kode..."
                @keyup.enter="fetchData"
              >
              <button 
                v-if="filters.keyword" 
                class="btn-clear-search" 
                @click="filters.keyword = ''; fetchData()"
                title="Hapus pencarian"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Filter Kategori -->
            <select v-model="filters.kategori" class="form-select filter-select" @change="fetchData">
              <option value="">Semua Kategori</option>
              <option value="Kebidanan">Kebidanan</option>
              <option value="Operasi">Operasi</option>
            </select>

            <!-- Filter Kelas -->
            <select v-model="filters.kelas" class="form-select filter-select" @change="fetchData">
              <option value="">Semua Kelas</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas VIP">Kelas VIP</option>
              <option value="Kelas VVIP">Kelas VVIP</option>
            </select>

            <!-- Reset Filter Button -->
            <button 
              v-if="filters.keyword || filters.kategori || filters.kelas" 
              class="btn btn-light btn-sm filter-reset-btn" 
              @click="resetFilters"
              title="Reset Filter"
            >
              <i class="fas fa-undo me-1"></i> Reset
            </button>
          </div>

          <!-- Right Action: Refresh -->
          <div class="d-flex align-items-center gap-2">
            <button 
              class="btn btn-outline-secondary btn-sm px-3 filter-refresh-btn" 
              @click="fetchData" 
              :disabled="loading" 
              title="Segarkan Data"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span class="d-none d-sm-inline ms-1.5">Refresh</span>
            </button>
          </div>
        </div>

        <!-- Table View -->
        <div class="table-responsive premium-table shadow-sm">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th style="min-width: 110px;">Kode & Bayar</th>
                <th style="min-width: 260px;">Nama Perawatan / Tindakan</th>
                <th class="text-end" style="min-width: 120px;">Jasa Operator</th>
                <th class="text-end" style="min-width: 120px;">Anestesi</th>
                <th class="text-end" style="min-width: 120px;">Dr. Anak / Bidan</th>
                <th class="text-end" style="min-width: 130px;">Sarana & RS</th>
                <th class="text-end text-success fw-bold" style="min-width: 140px;">TOTAL PAKET</th>
                <th class="text-center" style="width: 110px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm"></div>
                  <p class="mt-2 text-muted small mb-0">Memuat data tarif operasi...</p>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="items.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <div class="empty-icon mb-3">
                    <i class="fas fa-procedures fa-3x text-secondary opacity-25"></i>
                  </div>
                  <h6 class="fw-bold mb-1">Tidak ditemukan data tarif operasi</h6>
                  <p class="small text-muted mb-0">Coba ubah kata kunci pencarian atau filter kategori/kelas.</p>
                </td>
              </tr>

              <!-- Data Rows with Expandable Accordion -->
              <template v-else v-for="item in items" :key="item.kode_paket">
                <tr 
                  class="hover-row align-middle" 
                  :class="{ 'table-active-row': expandedRow === item.kode_paket }"
                >
                  <!-- Expand Chevron Button -->
                  <td class="text-center px-2">
                    <button 
                      class="btn btn-sm btn-icon rounded-circle" 
                      :class="expandedRow === item.kode_paket ? 'btn-primary' : 'btn-light text-muted'"
                      @click="toggleExpand(item.kode_paket)"
                      :title="expandedRow === item.kode_paket ? 'Tutup Rincian' : 'Lihat Rincian Lengkap'"
                    >
                      <i class="fas fa-chevron-right transition-transform" :class="{ 'rotate-90': expandedRow === item.kode_paket }"></i>
                    </button>
                  </td>

                  <!-- Kode & Penjamin -->
                  <td>
                    <div class="d-flex flex-column gap-1">
                      <span class="badge bg-light text-dark border fw-bold font-monospace px-2 py-1 text-start">
                        {{ item.kode_paket }}
                      </span>
                      <span class="badge bg-secondary-subtle text-secondary border-0 px-2 py-0.5 fs-xxs text-truncate text-start" style="max-width: 110px;" :title="item.penjab?.png_jawab || item.kd_pj">
                        <i class="fas fa-credit-card me-1"></i>{{ item.penjab?.png_jawab || item.kd_pj || 'Semua' }}
                      </span>
                    </div>
                  </td>

                  <!-- Nama Perawatan & Kategori -->
                  <td>
                    <div class="fw-bold text-dark mb-1 line-clamp-2" style="font-size: 0.88rem; line-height: 1.35;">
                      {{ item.nm_perawatan }}
                    </div>
                    <div class="d-flex flex-wrap gap-1 align-items-center">
                      <span class="badge" :class="item.kategori === 'Kebidanan' ? 'bg-pink-subtle text-pink' : 'bg-primary-subtle text-primary'">
                        <i class="fas fa-tag me-1"></i>{{ item.kategori }}
                      </span>
                      <span class="badge" :class="getKelasBadgeClass(item.kelas)">
                        {{ item.kelas }}
                      </span>
                    </div>
                  </td>

                  <!-- Operator Subtotal -->
                  <td class="text-end">
                    <div class="numeric-text fw-semibold text-dark">
                      {{ formatRupiah(getTotalOperator(item)) }}
                    </div>
                    <div class="fs-xxs text-muted" v-if="item.operator1 > 0">
                      Op 1: {{ formatRupiah(item.operator1) }}
                    </div>
                  </td>

                  <!-- Anestesi Subtotal -->
                  <td class="text-end">
                    <div class="numeric-text fw-semibold text-dark">
                      {{ formatRupiah(getTotalAnestesi(item)) }}
                    </div>
                    <div class="fs-xxs text-muted" v-if="item.dokter_anestesi > 0">
                      Dr Anes: {{ formatRupiah(item.dokter_anestesi) }}
                    </div>
                  </td>

                  <!-- Anak & Bidan Subtotal -->
                  <td class="text-end">
                    <div class="numeric-text fw-semibold text-dark">
                      {{ formatRupiah(getTotalAnak(item) + (parseFloat(item.bidan) || 0) + (parseFloat(item.bidan2) || 0) + (parseFloat(item.bidan3) || 0)) }}
                    </div>
                    <div class="fs-xxs text-muted" v-if="item.dokter_anak > 0">
                      Anak: {{ formatRupiah(item.dokter_anak) }}
                    </div>
                  </td>

                  <!-- Sarana & RS Subtotal -->
                  <td class="text-end">
                    <div class="numeric-text fw-semibold text-dark">
                      {{ formatRupiah(getTotalSarana(item)) }}
                    </div>
                    <div class="fs-xxs text-muted" v-if="item.sewa_ok > 0">
                      Sewa OK: {{ formatRupiah(item.sewa_ok) }}
                    </div>
                  </td>

                  <!-- GRAND TOTAL PAKET -->
                  <td class="text-end">
                    <div class="badge-total-box d-inline-block">
                      <div class="numeric-text fw-bold text-emerald fs-6">
                        {{ formatRupiah(getTotalTarif(item)) }}
                      </div>
                      <span class="badge bg-success-subtle text-success fs-xxs px-1.5 py-0">Paket Lengkap</span>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="text-center">
                    <div class="btn-group shadow-2xs rounded-pill bg-light p-0.5 border">
                      <button 
                        class="btn btn-sm btn-icon btn-ghost text-primary" 
                        title="Edit Tarif" 
                        @click="openModal('edit', item)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-icon btn-ghost text-danger" 
                        title="Nonaktifkan" 
                        @click="confirmDelete(item)"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expandable Detail Row: Complete 25+ Components Breakdown -->
                <tr v-if="expandedRow === item.kode_paket" class="expanded-detail-row">
                  <td colspan="9" class="p-0 border-0">
                    <div class="p-4 bg-detail-card border-top border-bottom">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                          <i class="fas fa-file-invoice-dollar text-primary"></i>
                          Rincian Seluruh Komponen Tarif Operasi:
                          <span class="text-primary">{{ item.nm_perawatan }}</span>
                        </h6>
                        <button class="btn btn-sm btn-light rounded-pill px-3" @click="expandedRow = null">
                          <i class="fas fa-times me-1"></i> Tutup
                        </button>
                      </div>

                      <!-- 5 Columns Breakdown Grid -->
                      <div class="row g-3">
                        <!-- Group I: Operator & Asisten -->
                        <div class="col-md-6 col-xl-4">
                          <div class="card h-100 border-0 shadow-2xs rounded-3 bg-white">
                            <div class="card-header bg-primary-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                              <span class="fw-bold text-primary small"><i class="fas fa-user-md me-1"></i> I. Jasa Operator & Tim Bedah</span>
                              <span class="badge bg-primary text-white fs-xxs">{{ formatRupiah(getTotalOperator(item)) }}</span>
                            </div>
                            <div class="card-body p-3">
                              <ul class="list-unstyled mb-0 item-breakdown-list">
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Operator 1</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.operator1) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.operator2 > 0">
                                  <span class="text-muted small">Operator 2</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.operator2) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.operator3 > 0">
                                  <span class="text-muted small">Operator 3</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.operator3) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Asisten Operator 1</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.asisten_operator1) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.asisten_operator2 > 0">
                                  <span class="text-muted small">Asisten Operator 2</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.asisten_operator2) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.asisten_operator3 > 0">
                                  <span class="text-muted small">Asisten Operator 3</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.asisten_operator3) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Instrumen</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.instrumen) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1">
                                  <span class="text-muted small">Perawat Luar</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.perawat_luar) }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- Group II: Anestesi & Dokter Umum -->
                        <div class="col-md-6 col-xl-4">
                          <div class="card h-100 border-0 shadow-2xs rounded-3 bg-white">
                            <div class="card-header bg-indigo-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                              <span class="fw-bold text-indigo small"><i class="fas fa-syringe me-1"></i> II. Jasa Anestesi & Dokter Umum</span>
                              <span class="badge bg-indigo text-white fs-xxs">{{ formatRupiah(getTotalAnestesi(item)) }}</span>
                            </div>
                            <div class="card-body p-3">
                              <ul class="list-unstyled mb-0 item-breakdown-list">
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Dokter Anestesi</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.dokter_anestesi) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Asisten Anestesi 1</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.asisten_anestesi) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.asisten_anestesi2 > 0">
                                  <span class="text-muted small">Asisten Anestesi 2</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.asisten_anestesi2) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1">
                                  <span class="text-muted small">Dokter Umum</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.dokter_umum) }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- Group III: Dokter Anak & Resusitasi -->
                        <div class="col-md-6 col-xl-4">
                          <div class="card h-100 border-0 shadow-2xs rounded-3 bg-white">
                            <div class="card-header bg-teal-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                              <span class="fw-bold text-teal small"><i class="fas fa-baby me-1"></i> III. Dokter Anak & Resusitasi</span>
                              <span class="badge bg-teal text-white fs-xxs">{{ formatRupiah(getTotalAnak(item)) }}</span>
                            </div>
                            <div class="card-body p-3">
                              <ul class="list-unstyled mb-0 item-breakdown-list">
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Dokter Anak</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.dokter_anak) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                  <span class="text-muted small">Perawat Resusitas</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.perawaat_resusitas) }}</span>
                                </li>
                                <li class="d-flex justify-content-between py-1">
                                  <span class="text-muted small">Dr. PJ Anak</span>
                                  <span class="fw-semibold small">{{ formatRupiah(item.dokter_pjanak) }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- Group IV: Bidan & Omloop Paramedis -->
                        <div class="col-md-6 col-xl-6">
                          <div class="card h-100 border-0 shadow-2xs rounded-3 bg-white">
                            <div class="card-header bg-pink-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                              <span class="fw-bold text-pink small"><i class="fas fa-user-nurse me-1"></i> IV. Bidan & Tim Omloop Paramedis</span>
                              <span class="badge bg-pink text-white fs-xxs">{{ formatRupiah(getTotalBidanOmloop(item)) }}</span>
                            </div>
                            <div class="card-body p-3">
                              <div class="row">
                                <div class="col-sm-6">
                                  <ul class="list-unstyled mb-0 item-breakdown-list">
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Bidan 1</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.bidan) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.bidan2 > 0">
                                      <span class="text-muted small">Bidan 2</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.bidan2) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.bidan3 > 0">
                                      <span class="text-muted small">Bidan 3</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.bidan3) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Omloop 1</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.omloop) }}</span>
                                    </li>
                                  </ul>
                                </div>
                                <div class="col-sm-6">
                                  <ul class="list-unstyled mb-0 item-breakdown-list">
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.omloop2 > 0">
                                      <span class="text-muted small">Omloop 2</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.omloop2) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.omloop3 > 0">
                                      <span class="text-muted small">Omloop 3</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.omloop3) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.omloop4 > 0">
                                      <span class="text-muted small">Omloop 4</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.omloop4) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed" v-if="item.omloop5 > 0">
                                      <span class="text-muted small">Omloop 5</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.omloop5) }}</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Group V: Fasilitas RS & Sarana -->
                        <div class="col-md-6 col-xl-6">
                          <div class="card h-100 border-0 shadow-2xs rounded-3 bg-white">
                            <div class="card-header bg-amber-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                              <span class="fw-bold text-amber-dark small"><i class="fas fa-hospital me-1"></i> V. Fasilitas RS & Sarana Prasarana</span>
                              <span class="badge bg-amber text-dark fs-xxs">{{ formatRupiah(getTotalSarana(item)) }}</span>
                            </div>
                            <div class="card-body p-3">
                              <div class="row">
                                <div class="col-sm-6">
                                  <ul class="list-unstyled mb-0 item-breakdown-list">
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Sewa Kamar OK / VK</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.sewa_ok) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Alat Medis / Bedah</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.alat) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Sewa VK (Akomodasi)</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.akomodasi) }}</span>
                                    </li>
                                  </ul>
                                </div>
                                <div class="col-sm-6">
                                  <ul class="list-unstyled mb-0 item-breakdown-list">
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Bagian RS</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.bagian_rs) }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-1 border-bottom-dashed">
                                      <span class="text-muted small">Sarana & Prasarana</span>
                                      <span class="fw-semibold small">{{ formatRupiah(item.sarpras) }}</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Grand Total Bottom Bar -->
                      <div class="d-flex flex-wrap justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm mt-3 border">
                        <div class="d-flex gap-2 align-items-center">
                          <span class="badge bg-success rounded-circle p-2">
                            <i class="fas fa-check"></i>
                          </span>
                          <div>
                            <span class="text-muted small d-block">Grand Total Biaya Paket Operasi</span>
                            <span class="fw-bold text-dark fs-5">{{ item.nm_perawatan }}</span>
                          </div>
                        </div>
                        <div class="text-end">
                          <span class="text-muted fs-xs d-block">Total Seluruh Komponen</span>
                          <span class="text-emerald fw-bold fs-3">{{ formatRupiah(getTotalTarif(item)) }}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Page navigation" class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="small text-muted">
            Menampilkan data <b>{{ pagination.from || 0 }}</b> - <b>{{ pagination.to || 0 }}</b> dari <b>{{ pagination.total || 0 }}</b> paket
          </div>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item disabled">
              <span class="page-link text-dark fw-bold px-3">{{ pagination.current_page || 1 }} &nbsp;/&nbsp; {{ pagination.last_page || 1 }}</span>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal Form: Modern Layout with Sticky Live Total Calculator -->
    <div class="modal fade" id="modalTarifOperasi" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border shadow-sm rounded-3 overflow-hidden">
          <!-- Header: Clean White Tone -->
          <div class="modal-header bg-white border-bottom py-3 px-4">
            <div class="d-flex align-items-center gap-2.5">
              <div class="header-icon-clean rounded-2">
                <i class="fas fa-procedures text-secondary"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark m-0">
                  {{ modalMode === 'add' ? 'Tambah Paket Tarif Operasi' : 'Edit Paket Tarif Operasi' }}
                </h6>
                <p class="text-muted fs-xs m-0 mt-0.5">Lengkapi data master dan rincian nominal tiap komponen</p>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Sticky Live Total Summary Bar -->
          <div class="sticky-top bg-white border-bottom shadow-2xs py-2 px-4 z-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <span class="text-muted small fw-semibold">Live Subtotal:</span>
              <span class="badge bg-primary-subtle text-primary border-0 fs-xxs">
                Operator: {{ formatRupiah(computedOperatorTotal) }}
              </span>
              <span class="badge bg-indigo-subtle text-indigo border-0 fs-xxs">
                Anestesi: {{ formatRupiah(computedAnestesiTotal) }}
              </span>
              <span class="badge bg-teal-subtle text-teal border-0 fs-xxs">
                Anak: {{ formatRupiah(computedAnakTotal) }}
              </span>
              <span class="badge bg-pink-subtle text-pink border-0 fs-xxs">
                Bidan/Omloop: {{ formatRupiah(computedBidanTotal) }}
              </span>
              <span class="badge bg-amber-subtle text-amber-dark border-0 fs-xxs">
                Sarana/RS: {{ formatRupiah(computedSaranaTotal) }}
              </span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted fs-xs text-uppercase fw-bold">Grand Total:</span>
              <span class="badge bg-success fs-6 fw-bold px-3 py-1.5 shadow-sm font-monospace">
                {{ formatRupiah(computedLiveTotal) }}
              </span>
            </div>
          </div>

          <!-- Modal Body Form -->
          <div class="modal-body p-4 bg-slate-50">
            <form @submit.prevent="saveData">
              <!-- Bagian 1: Data Identitas Paket Tindakan -->
              <div class="card border-0 shadow-2xs rounded-3 p-3 mb-3 bg-white position-relative" style="z-index: 15; overflow: visible !important;">
                <h6 class="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
                  <i class="fas fa-info-circle text-primary"></i> Identitas Paket Operasi
                </h6>
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label small fw-bold">Kode Paket</label>
                    <input v-model="form.kode_paket" type="text" class="form-control font-monospace" :readonly="modalMode === 'edit'" required>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label small fw-bold">Nama Perawatan / Tindakan</label>
                    <input v-model="form.nm_perawatan" type="text" class="form-control" placeholder="Contoh: SC ELEKTIF KELAS 1 UMUM" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kategori</label>
                    <v-select
                      v-model="form.kategori"
                      :options="['Kebidanan', 'Operasi']"
                      :clearable="false"
                      placeholder="Pilih Kategori..."
                      class="v-select-custom"
                    />
                  </div>
                  <div class="col-md-2">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kelas</label>
                    <v-select
                      v-model="form.kelas"
                      :options="['Rawat Jalan', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas VIP', 'Kelas VVIP']"
                      :clearable="false"
                      placeholder="Pilih Kelas..."
                      class="v-select-custom"
                    />
                  </div>
                  <div class="col-md-5">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Penjamin / Cara Bayar</label>
                    <v-select
                      v-model="form.kd_pj"
                      :options="listPenjab"
                      label="png_jawab"
                      :reduce="pj => pj.kd_pj"
                      :filter-by="filterPenjab"
                      :clearable="false"
                      placeholder="Pilih Penjab..."
                      class="v-select-custom"
                    >
                      <template #option="{ png_jawab, kd_pj }">
                        <div class="d-flex justify-content-between align-items-center py-0.5">
                          <span class="fs-xs fw-medium text-dark">{{ png_jawab }}</span>
                          <span class="badge bg-light text-secondary border font-monospace fs-xxs ms-2">{{ kd_pj }}</span>
                        </div>
                      </template>
                      <template #selected-option="{ png_jawab, kd_pj }">
                        <span class="fs-xs fw-medium text-dark">{{ png_jawab }} <small class="text-muted">({{ kd_pj }})</small></span>
                      </template>
                    </v-select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Status Tarif</label>
                    <v-select
                      v-model="form.status"
                      :options="[
                        { label: 'Aktif', value: '1' },
                        { label: 'Nonaktif', value: '0' }
                      ]"
                      label="label"
                      :reduce="opt => opt.value"
                      :clearable="false"
                      class="v-select-custom"
                    />
                  </div>
                </div>
              </div>

              <!-- Bagian 2: 5 Kelompok Komponen Tarif -->
              <div class="row g-3">
                <!-- I. Jasa Operator & Asisten -->
                <div class="col-12">
                  <div class="card border-0 shadow-2xs rounded-3 bg-white">
                    <div class="card-header bg-primary-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-primary small"><i class="fas fa-user-md me-1"></i> I. Jasa Operator & Tim Bedah</span>
                      <span class="badge bg-primary text-white">{{ formatRupiah(computedOperatorTotal) }}</span>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-2">
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Operator 1</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.operator1" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Operator 2</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.operator2" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Operator 3</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.operator3" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Asisten Operator 1</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.asisten_operator1" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Asisten Operator 2</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.asisten_operator2" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Asisten Operator 3</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.asisten_operator3" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Instrumen</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.instrumen" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Perawat Luar</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.perawat_luar" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- II. Jasa Anestesi & Dokter Umum -->
                <div class="col-12">
                  <div class="card border-0 shadow-2xs rounded-3 bg-white">
                    <div class="card-header bg-indigo-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-indigo small"><i class="fas fa-syringe me-1"></i> II. Jasa Anestesi & Dokter Umum</span>
                      <span class="badge bg-indigo text-white">{{ formatRupiah(computedAnestesiTotal) }}</span>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-2">
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Dokter Anestesi</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.dokter_anestesi" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Asisten Anestesi 1</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.asisten_anestesi" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Asisten Anestesi 2</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.asisten_anestesi2" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Dokter Umum</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.dokter_umum" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- III. Dokter Anak & Resusitasi -->
                <div class="col-12">
                  <div class="card border-0 shadow-2xs rounded-3 bg-white">
                    <div class="card-header bg-teal-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-teal small"><i class="fas fa-baby me-1"></i> III. Dokter Anak & Resusitasi</span>
                      <span class="badge bg-teal text-white">{{ formatRupiah(computedAnakTotal) }}</span>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-2">
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Dokter Anak</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.dokter_anak" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Perawat Resusitas</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.perawaat_resusitas" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Dr. PJ Anak</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.dokter_pjanak" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- IV. Bidan & Tim Omloop -->
                <div class="col-12">
                  <div class="card border-0 shadow-2xs rounded-3 bg-white">
                    <div class="card-header bg-pink-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-pink small"><i class="fas fa-user-nurse me-1"></i> IV. Bidan & Tim Omloop Paramedis</span>
                      <span class="badge bg-pink text-white">{{ formatRupiah(computedBidanTotal) }}</span>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-2">
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Bidan 1</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.bidan" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Bidan 2</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.bidan2" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Bidan 3</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.bidan3" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Omloop 1</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.omloop" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Omloop 2</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.omloop2" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Omloop 3</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.omloop3" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Omloop 4</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.omloop4" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-3 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Omloop 5</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.omloop5" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- V. Fasilitas RS & Sarana Prasarana -->
                <div class="col-12">
                  <div class="card border-0 shadow-2xs rounded-3 bg-white">
                    <div class="card-header bg-amber-subtle border-0 py-2 px-3 d-flex justify-content-between align-items-center">
                      <span class="fw-bold text-amber-dark small"><i class="fas fa-hospital me-1"></i> V. Fasilitas RS & Sarana Prasarana</span>
                      <span class="badge bg-amber text-dark">{{ formatRupiah(computedSaranaTotal) }}</span>
                    </div>
                    <div class="card-body p-3">
                      <div class="row g-2">
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Sewa Kamar OK / VK</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.sewa_ok" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Alat Medis / Bedah</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.alat" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Sewa VK (Akomodasi)</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.akomodasi" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-6 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Bagian RS</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.bagian_rs" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                        <div class="col-md-6 col-sm-6">
                          <label class="form-label fs-xs text-muted mb-1">Sarana & Prasarana</label>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted fs-xs">Rp</span>
                            <input v-model.number="form.sarpras" type="number" min="0" class="form-control text-end fw-semibold">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Modal Action -->
              <div class="mt-4 text-end border-top pt-3 d-flex justify-content-between align-items-center">
                <div class="text-start">
                  <span class="text-muted fs-xs">Total yang akan disimpan:</span>
                  <span class="text-emerald fw-bold d-block fs-5 font-monospace">{{ formatRupiah(computedLiveTotal) }}</span>
                </div>
                <div>
                  <button type="button" class="btn btn-light rounded-pill px-4 me-2" data-bs-dismiss="modal">Batal</button>
                  <button type="submit" class="btn btn-primary rounded-pill px-5 shadow-sm" :disabled="saving">
                    <i class="fas fa-save me-1" v-if="!saving"></i>
                    <span class="spinner-border spinner-border-sm me-1" v-if="saving"></span>
                    {{ modalMode === 'add' ? 'Simpan Paket Baru' : 'Perbarui Tarif' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()
const loading = ref(false)
const items = ref([])
const listPenjab = ref([])
const saving = ref(false)
const modalMode = ref('add')
const expandedRow = ref(null)
let modalInstance = null

const filterPenjab = (option, label, search) => {
  const s = (search || '').toLowerCase()
  return (option.png_jawab || '').toLowerCase().includes(s) ||
         (option.kd_pj || '').toLowerCase().includes(s)
}

const form = reactive({
  kode_paket: '', nm_perawatan: '', kategori: '', kelas: '', kd_pj: '',
  operator1: 0, operator2: 0, operator3: 0,
  asisten_operator1: 0, asisten_operator2: 0, asisten_operator3: 0,
  instrumen: 0, dokter_anak: 0, perawaat_resusitas: 0,
  dokter_anestesi: 0, asisten_anestesi: 0, asisten_anestesi2: 0,
  bidan: 0, bidan2: 0, bidan3: 0,
  perawat_luar: 0, sewa_ok: 0, alat: 0, akomodasi: 0, bagian_rs: 0,
  omloop: 0, omloop2: 0, omloop3: 0, omloop4: 0, omloop5: 0,
  sarpras: 0, dokter_pjanak: 0, dokter_umum: 0,
  status: '1'
})

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'status') form[key] = '1'
    else if (['kode_paket', 'nm_perawatan', 'kategori', 'kelas', 'kd_pj'].includes(key)) form[key] = ''
    else form[key] = 0
  })
}

const filters = reactive({ keyword: '', kategori: '', kelas: '', page: 1 })

const pagination = reactive({
  current_page: 1, last_page: 1, from: 0, to: 0, total: 0,
  prev_page_url: null, next_page_url: null
})

// Toggle expand accordion
const toggleExpand = (kodePaket) => {
  if (expandedRow.value === kodePaket) {
    expandedRow.value = null
  } else {
    expandedRow.value = kodePaket
  }
}

// Subtotal Calculators for Items
const getTotalOperator = (item) => {
  return (parseFloat(item.operator1) || 0) +
    (parseFloat(item.operator2) || 0) +
    (parseFloat(item.operator3) || 0) +
    (parseFloat(item.asisten_operator1) || 0) +
    (parseFloat(item.asisten_operator2) || 0) +
    (parseFloat(item.asisten_operator3) || 0) +
    (parseFloat(item.instrumen) || 0) +
    (parseFloat(item.perawat_luar) || 0)
}

const getTotalAnestesi = (item) => {
  return (parseFloat(item.dokter_anestesi) || 0) +
    (parseFloat(item.asisten_anestesi) || 0) +
    (parseFloat(item.asisten_anestesi2) || 0) +
    (parseFloat(item.dokter_umum) || 0)
}

const getTotalAnak = (item) => {
  return (parseFloat(item.dokter_anak) || 0) +
    (parseFloat(item.perawaat_resusitas) || 0) +
    (parseFloat(item.dokter_pjanak) || 0)
}

const getTotalBidanOmloop = (item) => {
  return (parseFloat(item.bidan) || 0) +
    (parseFloat(item.bidan2) || 0) +
    (parseFloat(item.bidan3) || 0) +
    (parseFloat(item.omloop) || 0) +
    (parseFloat(item.omloop2) || 0) +
    (parseFloat(item.omloop3) || 0) +
    (parseFloat(item.omloop4) || 0) +
    (parseFloat(item.omloop5) || 0)
}

const getTotalSarana = (item) => {
  return (parseFloat(item.sewa_ok) || 0) +
    (parseFloat(item.alat) || 0) +
    (parseFloat(item.akomodasi) || 0) +
    (parseFloat(item.bagian_rs) || 0) +
    (parseFloat(item.sarpras) || 0)
}

const getTotalTarif = (item) => {
  return getTotalOperator(item) +
    getTotalAnestesi(item) +
    getTotalAnak(item) +
    getTotalBidanOmloop(item) +
    getTotalSarana(item)
}

// Live Computed Subtotals for Modal Form
const computedOperatorTotal = computed(() => {
  return (form.operator1 || 0) + (form.operator2 || 0) + (form.operator3 || 0) +
    (form.asisten_operator1 || 0) + (form.asisten_operator2 || 0) + (form.asisten_operator3 || 0) +
    (form.instrumen || 0) + (form.perawat_luar || 0)
})

const computedAnestesiTotal = computed(() => {
  return (form.dokter_anestesi || 0) + (form.asisten_anestesi || 0) + (form.asisten_anestesi2 || 0) + (form.dokter_umum || 0)
})

const computedAnakTotal = computed(() => {
  return (form.dokter_anak || 0) + (form.perawaat_resusitas || 0) + (form.dokter_pjanak || 0)
})

const computedBidanTotal = computed(() => {
  return (form.bidan || 0) + (form.bidan2 || 0) + (form.bidan3 || 0) +
    (form.omloop || 0) + (form.omloop2 || 0) + (form.omloop3 || 0) + (form.omloop4 || 0) + (form.omloop5 || 0)
})

const computedSaranaTotal = computed(() => {
  return (form.sewa_ok || 0) + (form.alat || 0) + (form.akomodasi || 0) + (form.bagian_rs || 0) + (form.sarpras || 0)
})

const computedLiveTotal = computed(() => {
  return computedOperatorTotal.value + computedAnestesiTotal.value + computedAnakTotal.value + computedBidanTotal.value + computedSaranaTotal.value
})

// Badge style for classes
const getKelasBadgeClass = (kelas) => {
  switch (kelas) {
    case 'Kelas VVIP': return 'bg-purple-subtle text-purple'
    case 'Kelas VIP': return 'bg-amber-subtle text-amber-dark'
    case 'Kelas 1': return 'bg-blue-subtle text-blue'
    case 'Kelas 2': return 'bg-cyan-subtle text-cyan'
    case 'Kelas 3': return 'bg-secondary-subtle text-secondary'
    case 'Rawat Jalan': return 'bg-emerald-subtle text-emerald'
    default: return 'bg-light text-dark'
  }
}

const openModal = async (mode, item = null) => {
  modalMode.value = mode
  resetForm()
  if (mode === 'edit' && item) {
    Object.keys(form).forEach(key => {
      if (item[key] !== undefined) {
        form[key] = (typeof form[key] === 'number') ? parseFloat(item[key]) || 0 : item[key]
      }
    })
    if (item.akomodasi !== undefined) form.akomodasi = parseFloat(item.akomodasi) || 0
  } else if (mode === 'add') {
    try {
      const res = await keuanganTarifService.getTarifOperasiNextKode({ prefix: 'PK0901' })
      if (res.data.success) {
        form.kode_paket = res.data.data
      }
    } catch (error) {
      console.error('Error fetching next code', error)
    }
  }
  if (!modalInstance) {
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifOperasi'))
  }
  modalInstance.show()
}

const saveData = async () => {
  saving.value = true
  try {
    let res = (modalMode.value === 'add') 
      ? await keuanganTarifService.postTarifOperasi(form)
      : await keuanganTarifService.putTarifOperasi(form.kode_paket, form)
    
    if (res.data.success) {
      toast.success(res.data.message || 'Berhasil disimpan')
      modalInstance?.hide()
      fetchData()
    } else {
      toast.error(res.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
     toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Nonaktifkan Tarif Operasi?',
    text: `Yakin ingin menonaktifkan paket ${item.nm_perawatan} (${item.kode_paket})?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Nonaktifkan!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTarifOperasi(item.kode_paket)
        if (res.data.success) {
          toast.success(res.data.message || 'Data dinonaktifkan')
          fetchData()
        }
      } catch (error) { toast.error('Gagal menonaktifkan data') }
    }
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifOperasi(filters)
    if (res.data.success) {
      const respData = res.data.data
      items.value = respData.data || []
      Object.assign(pagination, {
        current_page: respData.current_page, last_page: respData.last_page,
        from: respData.from, to: respData.to, total: respData.total,
        prev_page_url: respData.prev_page_url, next_page_url: respData.next_page_url
      })
    }
  } catch (error) { console.error('Error fetching tarif operasi', error) }
  finally { loading.value = false }
}

const fetchPenjab = async () => {
  try {
    const res = await keuanganTarifService.getPenjab()
    if (res.data.success) listPenjab.value = res.data.data
  } catch (error) { console.error('Error fetching penjab', error) }
}

const resetFilters = () => {
  filters.keyword = ''
  filters.kategori = ''
  filters.kelas = ''
  filters.page = 1
  fetchData()
}

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

onMounted(() => {
  fetchData()
  fetchPenjab()
})
</script>

<style scoped>
.glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-radius: 20px; }

/* Clean Header & Action Button */
.tab-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bg-danger-subtle { background-color: #fee2e2; }

.premium-action-btn {
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0 1.25rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}
.premium-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

/* Dedicated Filter Toolbar */
.filter-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
}
.filter-search-box {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  flex-grow: 1;
}
.filter-search-box .search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}
.filter-input {
  height: 38px;
  border-radius: 10px;
  padding-left: 2.35rem;
  padding-right: 2.2rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}
.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}
.btn-clear-search:hover { color: #64748b; }

.filter-select {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  width: auto;
  min-width: 140px;
}
.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.filter-reset-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0 0.85rem;
  display: inline-flex;
  align-items: center;
  color: #64748b;
  background-color: white;
}
.filter-reset-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.filter-refresh-btn {
  height: 38px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.tab-tarif-operasi {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* Table Styling */
.table-responsive.premium-table {
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  overflow-x: auto !important;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.table-responsive.premium-table::-webkit-scrollbar {
  height: 8px;
}
.table-responsive.premium-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.premium-table table {
  min-width: 1100px;
  width: 100%;
  margin-bottom: 0;
}

.premium-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 700;
  white-space: nowrap;
}
.premium-table tbody td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  vertical-align: middle;
}
.hover-row:hover { background-color: #f8fafc; cursor: pointer; }
.table-active-row { background-color: #f0fdf4 !important; }

/* Numeric and Badges */
.numeric-text { font-family: inherit; }
.text-emerald { color: #059669; }
.badge-total-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 10px; text-align: right; }

.fs-xs { font-size: 0.75rem !important; }
.fs-xxs { font-size: 0.685rem !important; }
.shadow-2xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

/* Color Subtles */
.bg-primary-subtle { background-color: #eff6ff !important; }
.text-primary { color: #2563eb !important; }
.bg-indigo-subtle { background-color: #eef2ff !important; }
.text-indigo { color: #4f46e5 !important; }
.bg-teal-subtle { background-color: #f0fdfa !important; }
.text-teal { color: #0d9488 !important; }
.bg-pink-subtle { background-color: #fdf2f8 !important; }
.text-pink { color: #db2777 !important; }
.bg-amber-subtle { background-color: #fffbeb !important; }
.text-amber-dark { color: #b45309 !important; }
.bg-amber { background-color: #f59e0b !important; }
.bg-purple-subtle { background-color: #faf5ff !important; }
.text-purple { color: #7e22ce !important; }
.bg-blue-subtle { background-color: #eff6ff !important; }
.text-blue { color: #1d4ed8 !important; }
.bg-cyan-subtle { background-color: #ecfeff !important; }
.text-cyan { color: #0891b2 !important; }
.bg-emerald-subtle { background-color: #ecfdf5 !important; }
.text-emerald { color: #059669 !important; }

/* Buttons */
.btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
.btn-ghost:hover { background-color: rgba(0,0,0,0.06); }
.transition-transform { transition: transform 0.2s ease-in-out; }
.rotate-90 { transform: rotate(90deg); }

/* Expandable Detail Section */
.bg-detail-card { background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); }
.item-breakdown-list li { font-size: 0.8rem; }
.border-bottom-dashed { border-bottom: 1px dashed #e2e8f0; }

/* Modal Header & Styling */
.bg-gradient-header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
.modal-icon-badge { width: 42px; height: 42px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-slate-50 { background-color: #f8fafc; }

@media (max-width: 991px) {
  .w-100-mobile { width: 100% !important; }
  .premium-search-wrapper { max-width: 100%; }
}
</style>
