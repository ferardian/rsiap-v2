<template>
  <div class="registration-container p-3 p-md-4">
    <div class="registration-card glass-effect animate__animated animate__fadeIn">
      <!-- Header Area -->
      <div class="card-header-premium">
        <div class="header-icon-bg">
          <i class="fas fa-id-card-alt"></i>
        </div>
        <div class="header-text">
          <h2 class="page-title mb-1">Registrasi Pasien</h2>
          <p class="page-subtitle mb-0">Kelola pendaftaran dan antrean pasien secara cepat dan terintegrasi</p>
        </div>
      </div>

      <div class="card-content mt-4">
        <!-- Main Form Grid -->
        <div class="row g-4">
          <!-- Left Column: Patient Selection -->
          <div class="col-lg-5">
            <div class="form-section-card h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="section-title mb-0">
                  <i class="fas fa-user-circle me-2"></i>
                  Data Pasien
                </h3>
                <button class="btn btn-sm btn-light text-primary rounded-pill shadow-sm border px-3 w-auto" style="font-size: 0.8rem; font-weight: 500;" @click="openTambahPasienModal">
                  <i class="fas fa-plus me-1"></i> Tambah
                </button>
              </div>
              
              <div class="search-patient-wrapper mt-1">
                <label class="form-label-custom mb-2 d-block">Cari Pasien</label>
                <div class="search-input-group position-relative">
                  <i class="fas fa-search search-icon"></i>
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    @input="handlePatientSearch"
                    placeholder="Minimal 3 karakter (Nama/RM/BPJS/NIK/Alamat/PJ)..."
                    class="form-control-custom ps-5"
                  />
                  <div v-if="searching" class="search-spinner">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                  </div>
                </div>

                <!-- Dropdown Search Results -->
                <div v-if="searchResults.length > 0 && searchQuery.length >= 3" class="search-results-dropdown shadow-lg">
                  <div 
                    v-for="pasien in searchResults" 
                    :key="pasien.no_rkm_medis" 
                    @click="selectPasien(pasien)"
                    class="result-item"
                  >
                    <div class="rm-badge-small">{{ pasien.no_rkm_medis }}</div>
                    <div class="pasien-info w-100">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="pasien-name">{{ pasien.nm_pasien }}</div>
                      </div>
                      <div class="pasien-meta mb-1">{{ pasien.jk === 'L' ? 'Laki-laki' : 'Perempuan' }} • {{ pasien.tmp_lahir }}, {{ formatDate(pasien.tgl_lahir) }}</div>
                      
                      <!-- Identitas -->
                      <div class="d-flex gap-3 mt-2 mb-1">
                        <div class="pasien-meta bg-light px-2 py-1 rounded-2 shadow-sm" v-if="pasien.no_ktp" title="NIK">
                          <i class="fas fa-id-card me-1 opacity-75 text-primary"></i> <span class="fw-bold">{{ pasien.no_ktp }}</span>
                        </div>
                        <div class="pasien-meta bg-light px-2 py-1 rounded-2 shadow-sm" v-if="pasien.no_peserta" title="No Peserta BPJS">
                          <i class="fas fa-hospital-user me-1 opacity-75 text-success"></i> <span class="fw-bold">{{ pasien.no_peserta }}</span>
                        </div>
                      </div>

                      <div class="pasien-meta text-truncate mt-1" style="max-width: 100%;"><i class="fas fa-map-marker-alt me-1 opacity-50"></i>{{ pasien.alamat }}</div>
                      <div class="pasien-meta mt-1" v-if="pasien.namakeluarga"><i class="fas fa-user-friends me-1 opacity-50"></i>PJ: {{ pasien.namakeluarga }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Patient Box -->
              <div v-if="selectedPasien" class="selected-pasien-box mt-3 animate__animated animate__zoomIn">
                <div class="box-inner">
                  <div class="pasien-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="selected-info w-100 pe-3">
                    <h4 class="mb-1">{{ selectedPasien.nm_pasien }}</h4>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">{{ selectedPasien.no_rkm_medis }}</span>
                        <span class="text-muted small">{{ selectedPasien.jk === 'L' ? 'Laki-laki' : 'Perempuan' }} • {{ formatDate(selectedPasien.tgl_lahir) }}</span>
                    </div>
                    
                    <div class="d-flex flex-wrap gap-2 mb-2" v-if="selectedPasien.no_ktp || selectedPasien.no_peserta">
                        <div class="bg-light px-2 py-1 rounded small border" v-if="selectedPasien.no_ktp">
                            <i class="fas fa-id-card text-primary opacity-75 me-1"></i> <span class="fw-bold">{{ selectedPasien.no_ktp }}</span>
                        </div>
                        <div class="bg-light px-2 py-1 rounded small border" v-if="selectedPasien.no_peserta">
                            <i class="fas fa-hospital-user text-success opacity-75 me-1"></i> <span class="fw-bold">{{ selectedPasien.no_peserta }}</span>
                        </div>
                    </div>

                    <div class="text-muted small mb-1"><i class="fas fa-map-marker-alt me-1 opacity-50"></i>{{ selectedPasien.alamat || 'Alamat tidak tersedia' }}</div>
                    <div class="text-muted small" v-if="selectedPasien.namakeluarga"><i class="fas fa-user-friends me-1 opacity-50"></i>PJ: {{ selectedPasien.namakeluarga }}</div>
                  </div>
                  <button @click="clearSelectedPasien" class="btn-clear">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Riwayat Registrasi Box -->
              <div v-if="selectedPasien" class="riwayat-box mt-3 pt-3 border-top animate__animated animate__fadeInUp">
                <h5 class="fw-bold fs-6 mb-3 text-secondary"><i class="fas fa-history me-2"></i>Riwayat Kunjungan Terakhir</h5>
                <div v-if="loadingRiwayat" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
                <div v-else-if="riwayatRegistrasi.length === 0" class="text-muted text-center py-3 small">
                  Belum ada riwayat kunjungan.
                </div>
                <div v-else class="riwayat-list d-flex flex-column gap-2">
                  <div v-for="riwayat in riwayatRegistrasi" :key="riwayat.no_rawat" class="riwayat-item p-3 border rounded-3 bg-white shadow-sm position-relative overflow-hidden">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <span class="text-primary fw-bold small">{{ formatDateShort(riwayat.tgl_registrasi) }}</span>
                      <span class="badge-custom pj px-2 py-1" :class="getPenjabClass(riwayat.caraBayar?.png_jawab)">{{ riwayat.caraBayar?.png_jawab }}</span>
                    </div>
                    <div class="fw-bold text-dark fs-6">{{ riwayat.poliklinik?.nm_poli }}</div>
                    <div class="text-muted small mt-1"><i class="fas fa-user-md me-1"></i>{{ riwayat.dokter?.nm_dokter }}</div>
                  </div>
                </div>
              </div>

              <div v-else class="placeholder-pasien-box mt-3">
                <i class="fas fa-user-plus mb-2"></i>
                <p>Silakan cari dan pilih pasien untuk melanjutkan</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Registration Details -->
          <div class="col-lg-7">
            <div class="form-section-card">
              <h3 class="section-title">
                <i class="fas fa-clinic-medical me-2"></i>
                Detail Registrasi
              </h3>

              <div class="row g-3 mt-2">
                <!-- Date Selection -->
                <div class="col-md-6">
                  <label class="form-label-custom">Tanggal Registrasi</label>
                  <input 
                    type="date" 
                    v-model="form.tanggal_periksa" 
                    class="form-control-custom"
                    @change="handleFormUpdate"
                  />
                </div>

                <!-- Poly Selection -->
                <div class="col-md-6">
                  <label class="form-label-custom">Pilih Poliklinik</label>
                  <v-select
                    v-model="form.kd_poli"
                    :options="polikliniks"
                    :reduce="poli => poli.kd_poli"
                    label="nm_poli"
                    placeholder="Cari Poliklinik..."
                    class="v-select-custom"
                    @update:modelValue="handleFormUpdate"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ada hasil untuk <em>{{ search }}</em>.
                      </template>
                      <em v-else style="opacity: 0.5;">Cari poliklinik...</em>
                    </template>
                  </v-select>
                </div>

                <!-- Doctor Selection -->
                <div class="col-12">
                  <label class="form-label-custom">Pilih Dokter</label>
                  <v-select
                    v-model="form.kd_dokter"
                    :options="dokters"
                    :reduce="dr => dr.kd_dokter"
                    label="nm_dokter"
                    placeholder="Cari Dokter..."
                    class="v-select-custom"
                    @update:modelValue="handleFormUpdate"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ada hasil untuk <em>{{ search }}</em>.
                      </template>
                      <em v-else style="opacity: 0.5;">Cari dokter...</em>
                    </template>
                  </v-select>
                </div>

                <!-- Payment Method -->
                <div class="col-md-6">
                  <label class="form-label-custom">Cara Bayar</label>
                  <v-select
                    v-model="form.kd_pj"
                    :options="penijabs"
                    :reduce="pj => pj.kd_pj"
                    label="png_jawab"
                    placeholder="Pilih Cara Bayar..."
                    class="v-select-custom"
                    :clearable="false"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ada hasil untuk <em>{{ search }}</em>.
                      </template>
                      <em v-else style="opacity: 0.5;">Cari cara bayar...</em>
                    </template>
                  </v-select>
                </div>

                <!-- Kuota Option -->
                <div class="col-md-6">
                  <label class="form-label-custom">Batas Kuota</label>
                  <div class="d-flex gap-3 mt-1">
                    <div class="form-check-custom">
                      <input type="radio" id="limit1" value="1" v-model="form.limit_reg" />
                      <label for="limit1">Ya (Sesuai Jadwal)</label>
                    </div>
                    <div class="form-check-custom">
                      <input type="radio" id="limit0" value="0" v-model="form.limit_reg" />
                      <label for="limit0">Tidak (Bypass)</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Automated Results Section -->
              <div class="auto-numbers-section mt-4 pt-3">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="number-display-box">
                      <span class="label">Nomor Registrasi</span>
                      <span class="value" :class="{ 'loading-text': numberLoading }">
                        {{ form.no_reg || '---' }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="number-display-box">
                      <span class="label">Nomor Rawat</span>
                      <span class="value" :class="{ 'loading-text': numberLoading }">
                        {{ form.no_rawat || '---/---/---' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Footer -->
              <div class="form-actions mt-4">
                <button 
                  @click="submitRegistration" 
                  class="btn-submit-premium w-100"
                  :disabled="submitting || !canSubmit"
                >
                  <span v-if="submitting">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Memproses...
                  </span>
                  <span v-else>
                    <i class="fas fa-check-circle me-2"></i>
                    Daftarkan Sekarang
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration List Section (NEW) -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="form-section-card glass-effect registration-list-card">
              <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h3 class="section-title mb-0">
                  <i class="fas fa-list-ul me-2"></i>
                  Daftar Registrasi
                </h3>
                <div class="d-flex gap-2 flex-grow-1 justify-content-md-end search-list-wrapper">
                    <div class="search-input-group list-search">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            v-model="listSearchQuery" 
                            @input="handleListSearch"
                            placeholder="Cari Nama/RM..."
                            class="form-control-custom ps-5 py-2"
                        />
                    </div>
                    <button @click="fetchRegistrations" class="btn-refresh" :disabled="listLoading" title="Refresh Data">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': listLoading }"></i>
                    </button>
                </div>
              </div>

              <!-- List Filters -->
              <div class="filter-card mb-4 p-3 rounded-4" style="background-color: #f8fafc; border: 1px solid #edf2f7;">
                <div class="row g-3">
                  <div class="col-12 col-xl-4 col-lg-5">
                    <label class="form-label-custom mb-2"><i class="fas fa-calendar-alt me-2 text-primary"></i>Periode Tanggal</label>
                    <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
                      <input 
                        type="date" 
                        v-model="listFilterStartDate" 
                        class="form-control-custom w-100 px-2"
                        @change="handleListFilterChange"
                      />
                      <span class="text-muted fw-bold d-none d-sm-block">-</span>
                      <input 
                        type="date" 
                        v-model="listFilterEndDate" 
                        class="form-control-custom w-100 px-2"
                        @change="handleListFilterChange"
                      />
                    </div>
                  </div>
                  <div class="col-12 col-xl-4 col-lg-3 col-md-6">
                    <label class="form-label-custom mb-2"><i class="fas fa-clinic-medical me-2 text-primary"></i>Poliklinik</label>
                    <v-select
                      v-model="listFilterPoli"
                      :options="polikliniks"
                      :reduce="poli => poli.kd_poli"
                      label="nm_poli"
                      placeholder="Semua Poliklinik"
                      class="v-select-custom bg-white"
                      @update:modelValue="handleListFilterChange"
                    ></v-select>
                  </div>
                  <div class="col-12 col-xl-4 col-lg-4 col-md-6">
                    <label class="form-label-custom mb-2"><i class="fas fa-user-md me-2 text-primary"></i>Dokter</label>
                    <v-select
                      v-model="listFilterDokter"
                      :options="dokters"
                      :reduce="dr => dr.kd_dokter"
                      label="nm_dokter"
                      placeholder="Semua Dokter"
                      class="v-select-custom bg-white"
                      @update:modelValue="handleListFilterChange"
                    ></v-select>
                  </div>
                </div>
              </div>

              <!-- List Table -->
              <div class="table-responsive custom-scroll">
                <table class="table premium-table">
                  <thead>
                    <tr>
                      <th width="80">No. Reg</th>
                      <th>Detail Pasien</th>
                      <th>Poliklinik & Dokter</th>
                      <th>Cara Bayar</th>
                      <th width="100">Status</th>
                      <th width="100">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="listLoading && registrationList.length === 0">
                      <td colspan="6" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Memuat daftar...</p>
                      </td>
                    </tr>
                    <tr v-else-if="registrationList.length === 0">
                      <td colspan="6" class="text-center py-5 text-muted">
                        <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
                        <p>Belum ada pendaftaran untuk tanggal ini</p>
                      </td>
                    </tr>
                    <tr v-else v-for="reg in registrationList" :key="reg.no_rawat" class="animate__animated animate__fadeInUp">
                      <td>
                        <div class="reg-number">{{ reg.no_reg }}</div>
                        <div class="text-muted small mt-1" style="font-size: 0.75rem;">
                          {{ formatDateShort(reg.tgl_registrasi) }}
                          <br>
                          {{ reg.jam_reg || '' }}
                        </div>
                      </td>
                      <td>
                        <div class="fw-bold">{{ reg.pasien?.nm_pasien }}</div>
                        <div class="text-muted small">
                            {{ reg.no_rkm_medis }} 
                            <span class="mx-1">•</span> 
                            <span class="text-primary fw-bold">{{ reg.no_rawat }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="info-tag poli">{{ reg.poliklinik?.nm_poli }}</div>
                        <div class="dr-name mt-1">{{ reg.dokter?.nm_dokter }}</div>
                      </td>
                      <td>
                        <span 
                          class="badge-custom pj" 
                          :class="getPenjabClass(reg.caraBayar?.png_jawab)">
                          {{ reg.caraBayar?.png_jawab }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex flex-column gap-1">
                          <span class="badge-custom status px-2 py-1" :class="getStatusClass(reg.stts)">{{ reg.stts }}</span>
                          <template v-if="getPenjabClass(reg.caraBayar?.png_jawab) === 'bpjs'">
                            <span v-if="reg.sepSimple" class="badge-custom status sudah px-2 py-1" style="font-size: 0.65rem;">
                              <i class="fas fa-check-circle me-1"></i>SEP Terbit
                            </span>
                            <span v-else class="badge-custom status sep-belum px-2 py-1" style="font-size: 0.65rem;">
                              <i class="fas fa-times-circle me-1"></i>SEP Belum
                            </span>
                          </template>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex gap-2">
                           <div class="dropdown">
                              <button class="btn btn-sm btn-outline-primary dropdown-toggle rounded-pill px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 0.8rem;">
                                Aksi
                              </button>
                              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 glass-effect p-2 rounded-4" style="min-width: 200px;">
                                <li>
                                  <a class="dropdown-item rounded-3 mb-1 py-2" href="#" @click.prevent="openGenerateSep(reg)">
                                    <i class="fas fa-file-medical me-2 text-primary opacity-75"></i> {{ reg.sepSimple ? 'Edit SEP' : 'Terbitkan SEP' }}
                                  </a>
                                </li>
                                <li>
                                  <a class="dropdown-item rounded-3 mb-1 py-2" href="#" @click.prevent="printKarcis(reg)">
                                    <i class="fas fa-print me-2 text-success opacity-75"></i> Print Karcis
                                  </a>
                                </li>
                                <li v-if="reg.stts === 'Belum'">
                                  <hr class="dropdown-divider">
                                </li>
                                <li v-if="reg.stts === 'Belum'">
                                  <a class="dropdown-item rounded-3 py-2 text-danger" href="#" @click.prevent="batalRegistrasi(reg)">
                                    <i class="fas fa-trash-alt me-2 opacity-75"></i> Batalkan
                                  </a>
                                </li>
                              </ul>
                            </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Table Pagination & Info -->
              <div v-if="listPagination.total > 0" class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                <div class="list-info text-muted small">
                  Menampilkan <span class="fw-bold">{{ ((listPagination.current_page - 1) * listPagination.per_page) + 1 }}</span> 
                  sampai <span class="fw-bold">{{ Math.min(listPagination.current_page * listPagination.per_page, listPagination.total) }}</span> 
                  dari <span class="fw-bold text-primary">{{ listPagination.total }}</span> data
                </div>
                
                <div v-if="listPagination.total > listPagination.per_page" class="list-pagination">
                  <button 
                      class="btn-page" 
                      :disabled="listPagination.current_page === 1"
                      @click="changeListPage(listPagination.current_page - 1)"
                  >
                      <i class="fas fa-chevron-left"></i>
                  </button>
                  <div class="page-indicators">
                    <span 
                      v-for="page in listPagination.last_page" 
                      :key="page"
                      class="page-dot"
                      :class="{ active: page === listPagination.current_page }"
                      @click="changeListPage(page)"
                    ></span>
                  </div>
                  <button 
                      class="btn-page" 
                      :disabled="listPagination.current_page === listPagination.last_page"
                      @click="changeListPage(listPagination.current_page + 1)"
                  >
                      <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tambah Pasien Modal -->
    <div class="modal fade" id="tambahPasienModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style="max-width: 95vw; width: 1400px;">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary text-white border-0 py-3">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Tambah Pasien Baru</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <form @submit.prevent="submitTambahPasien" class="row g-4" id="formTambahPasien">
              
              <!-- Kiri: Identitas Personal -->
              <div class="col-lg-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-white border-bottom-0 py-3 d-flex align-items-center justify-content-center">
                    <h6 class="fw-bold text-white mb-0"><i class="fas fa-id-card me-2"></i>A. IDENTITAS PERSONAL</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">No. KTP / NIK</label>
                      <input type="text" v-model="formPasienBaru.no_ktp" class="form-control form-control-sm" placeholder="16 Digit NIK" maxlength="16">
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Nama Lengkap Pasien <span class="text-danger">*</span></label>
                      <input type="text" v-model="formPasienBaru.nm_pasien" class="form-control form-control-sm" required placeholder="Sesuai KTP">
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Jenis Kelamin <span class="text-danger">*</span></label>
                        <select v-model="formPasienBaru.jk" class="form-select form-select-sm" required>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Gol. Darah</label>
                        <select v-model="formPasienBaru.gol_darah" class="form-select form-select-sm">
                          <option value="-">-</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="O">O</option>
                          <option value="AB">AB</option>
                        </select>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Tempat Lahir <span class="text-danger">*</span></label>
                        <input type="text" v-model="formPasienBaru.tmp_lahir" class="form-control form-control-sm" required>
                      </div>
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Tanggal Lahir <span class="text-danger">*</span></label>
                        <input type="date" v-model="formPasienBaru.tgl_lahir" class="form-control form-control-sm" required>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Nama Ibu Kandung</label>
                      <input type="text" v-model="formPasienBaru.nm_ibu" class="form-control form-control-sm" placeholder="Nama Ibu">
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Status Nikah</label>
                        <select v-model="formPasienBaru.stts_nikah" class="form-select form-select-sm">
                          <option value="BELUM MENIKAH">BELUM MENIKAH</option>
                          <option value="MENIKAH">MENIKAH</option>
                          <option value="JANDA">JANDA</option>
                          <option value="DUDHA">DUDHA</option>
                          <option value="JOMBLO">JOMBLO</option>
                        </select>
                      </div>
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Agama</label>
                        <select v-model="formPasienBaru.agama" class="form-select form-select-sm">
                          <option value="ISLAM">ISLAM</option>
                          <option value="KRISTEN">KRISTEN</option>
                          <option value="KATHOLIK">KATHOLIK</option>
                          <option value="HINDU">HINDU</option>
                          <option value="BUDHA">BUDHA</option>
                          <option value="KONGHUCU">KONGHUCU</option>
                          <option value="-">-</option>
                        </select>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Pendidikan</label>
                        <select v-model="formPasienBaru.pnd" class="form-select form-select-sm">
                          <option value="TS">TS</option>
                          <option value="TK">TK</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                          <option value="D1">D1</option>
                          <option value="D2">D2</option>
                          <option value="D3">D3</option>
                          <option value="D4">D4</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                          <option value="-">-</option>
                        </select>
                      </div>
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Pekerjaan</label>
                        <input type="text" v-model="formPasienBaru.pekerjaan" class="form-control form-control-sm" placeholder="Contoh: WIRASWASTA">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tengah: Kontak & Domisili -->
              <div class="col-lg-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-white border-bottom-0 py-3 d-flex align-items-center justify-content-center">
                    <h6 class="fw-bold text-white mb-0"><i class="fas fa-map-marker-alt me-2"></i>B. KONTAK & DOMISILI</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Alamat Lengkap <span class="text-danger">*</span></label>
                      <textarea v-model="formPasienBaru.alamat" class="form-control form-control-sm" rows="3" required placeholder="Jl. Contoh, RT/RW"></textarea>
                    </div>
                    
                    <!-- Wilayah Selection -->
                    <div class="row">
                      <div class="col-12 mb-2">
                        <label class="form-label small fw-bold">Wilayah (Pilih dari daftar)</label>
                      </div>
                      <div class="col-6 mb-3">
                        <v-select
                          v-model="formPasienBaru.kd_prop"
                          :options="propinsiOptions"
                          :reduce="prop => prop.kd_prop"
                          label="nm_prop"
                          @search="onSearchPropinsi"
                          :filterable="false"
                          placeholder="Cari Propinsi..."
                          class="v-select-custom"
                        >
                          <template #no-options="{ search, searching }">
                            <template v-if="searching">Mencari...</template>
                            <em v-else style="opacity: 0.5;">Ketik minimal 3 huruf...</em>
                          </template>
                        </v-select>
                      </div>
                      <div class="col-6 mb-3">
                        <v-select
                          v-model="formPasienBaru.kd_kab"
                          :options="kabupatenOptions"
                          :reduce="kab => kab.kd_kab"
                          label="nm_kab"
                          @search="onSearchKabupaten"
                          :filterable="false"
                          placeholder="Cari Kabupaten..."
                          class="v-select-custom"
                        >
                          <template #no-options="{ search, searching }">
                            <template v-if="searching">Mencari...</template>
                            <em v-else style="opacity: 0.5;">Ketik minimal 3 huruf...</em>
                          </template>
                        </v-select>
                      </div>
                      <div class="col-6 mb-3">
                        <v-select
                          v-model="formPasienBaru.kd_kec"
                          :options="kecamatanOptions"
                          :reduce="kec => kec.kd_kec"
                          label="nm_kec"
                          @search="onSearchKecamatan"
                          :filterable="false"
                          placeholder="Cari Kecamatan..."
                          class="v-select-custom"
                        >
                          <template #no-options="{ search, searching }">
                            <template v-if="searching">Mencari...</template>
                            <em v-else style="opacity: 0.5;">Ketik minimal 3 huruf...</em>
                          </template>
                        </v-select>
                      </div>
                      <div class="col-6 mb-3">
                        <v-select
                          v-model="formPasienBaru.kd_kel"
                          :options="kelurahanOptions"
                          :reduce="kel => kel.kd_kel"
                          label="nm_kel"
                          @search="onSearchKelurahan"
                          :filterable="false"
                          placeholder="Cari Kelurahan..."
                          class="v-select-custom"
                        >
                          <template #no-options="{ search, searching }">
                            <template v-if="searching">Mencari...</template>
                            <em v-else style="opacity: 0.5;">Ketik minimal 3 huruf...</em>
                          </template>
                        </v-select>
                      </div>
                    </div>

                    <div class="row mt-2">
                      <div class="col-12 mb-3">
                        <label class="form-label small fw-bold">No. HP / Telepon</label>
                        <input type="text" v-model="formPasienBaru.no_tlp" class="form-control form-control-sm" placeholder="08xxx">
                      </div>
                      <div class="col-12 mb-3">
                        <label class="form-label small fw-bold">Email</label>
                        <input type="email" v-model="formPasienBaru.email" class="form-control form-control-sm" placeholder="email@contoh.com">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Kanan: Asuransi & PJ -->
              <div class="col-lg-4">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-white border-bottom-0 py-3 d-flex align-items-center justify-content-center">
                    <h6 class="fw-bold text-white mb-0"><i class="fas fa-hand-holding-medical me-2"></i>C. ASURANSI & P. JAWAB</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label small fw-bold">No. Kartu Asuransi / BPJS</label>
                      <input type="text" v-model="formPasienBaru.no_peserta" class="form-control form-control-sm" placeholder="13 Digit No JKN">
                    </div>
                    
                    <hr class="text-muted opacity-25">
                    
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Nama Penanggung Jawab (PJ)</label>
                      <input type="text" v-model="formPasienBaru.namakeluarga" class="form-control form-control-sm" placeholder="Nama PJ">
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Hub. dgn Pasien</label>
                        <select v-model="formPasienBaru.keluarga" class="form-select form-select-sm">
                          <option value="SUAMI">SUAMI</option>
                          <option value="ISTRI">ISTRI</option>
                          <option value="AYAH">AYAH</option>
                          <option value="IBU">IBU</option>
                          <option value="ANAK">ANAK</option>
                          <option value="SAUDARA">SAUDARA</option>
                        </select>
                      </div>
                      <div class="col-6 mb-3">
                        <label class="form-label small fw-bold">Pekerjaan PJ</label>
                        <input type="text" v-model="formPasienBaru.pekerjaanpj" class="form-control form-control-sm" placeholder="Pekerjaan PJ">
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Alamat PJ</label>
                      <textarea v-model="formPasienBaru.alamatpj" class="form-control form-control-sm" rows="2" placeholder="Kosongkan jika sama dengan pasien"></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Instansi / Perusahaan</label>
                      <div class="input-group input-group-sm">
                        <input type="text" class="form-control" readonly value="- (Pilih Instansi)">
                        <button class="btn btn-outline-secondary" type="button" disabled><i class="fas fa-search"></i></button>
                      </div>
                      <small class="text-muted" style="font-size: 0.7rem;">Pemilihan instansi belum aktif.</small>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>
          <div class="modal-footer bg-light border-top-0 py-3 d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              <span class="text-danger">*</span> Wajib diisi
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-danger-premium" data-bs-dismiss="modal" :disabled="submittingPasien">
                <i class="fas fa-times me-1"></i> Batal
              </button>
              <button type="submit" form="formTambahPasien" class="btn btn-primary-premium" :disabled="submittingPasien">
                <span v-if="submittingPasien" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <i v-else class="fas fa-save me-2"></i> Simpan & Pilih Pasien
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate SEP Modal -->
    <GenerateSepModal 
      :show="showGenerateSepModal" 
      :registration="selectedRegForSep"
      @close="showGenerateSepModal = false"
      @success="fetchRegistrations"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import GenerateSepModal from './components/GenerateSepModal.vue';
import pasienService from '../../services/pasienService';
import poliklinikService from '../../services/poliklinikService';
import dokterService from '../../services/dokterService';
import registrasiService from '../../services/registrasiService';
import wilayahService from '../../services/wilayahService';

// State
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const selectedPasien = ref(null);

const polikliniks = ref([]);
const dokters = ref([]);
const penijabs = ref([]);

// Generate SEP States
const showGenerateSepModal = ref(false);
const selectedRegForSep = ref(null);
const loading = ref(false);
const numberLoading = ref(false);
const submitting = ref(false);

const riwayatRegistrasi = ref([]);
const loadingRiwayat = ref(false);

// Wilayah State
const propinsiOptions = ref([]);
const kabupatenOptions = ref([]);
const kecamatanOptions = ref([]);
const kelurahanOptions = ref([]);
const loadingPropinsi = ref(false);
const loadingKabupaten = ref(false);
const loadingKecamatan = ref(false);
const loadingKelurahan = ref(false);

// List State
const registrationList = ref([]);
const listLoading = ref(false);
const listSearchQuery = ref('');
const listPagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 10
});

const listFilterStartDate = ref(dayjs().format('YYYY-MM-DD'));
const listFilterEndDate = ref(dayjs().format('YYYY-MM-DD'));
const listFilterPoli = ref('');
const listFilterDokter = ref('');

const form = reactive({
  no_rkm_medis: '',
  tanggal_periksa: dayjs().format('YYYY-MM-DD'),
  kd_dokter: '',
  kd_poli: '',
  kd_pj: 'A01', // Default UMUM
  limit_reg: '1',
  no_reg: '',
  no_rawat: ''
});

// Modal State
let tambahPasienModal = null;
const submittingPasien = ref(false);
const formPasienBaru = reactive({
  nm_pasien: '',
  jk: 'L',
  no_ktp: '',
  tmp_lahir: '',
  tgl_lahir: '',
  nm_ibu: '',
  gol_darah: '-',
  stts_nikah: 'BELUM MENIKAH',
  agama: 'ISLAM',
  pnd: 'SMA',
  pekerjaan: '-',
  suku_bangsa: 5, // Default SUKU JAWA or similar
  bahasa_pasien: 5, // Default INDONESIA
  cacat_fisik: 5, // Default TIDAK ADA
  
  alamat: '',
  no_tlp: '',
  email: '',
  kd_prop: null,
  kd_kab: null,
  kd_kec: null,
  kd_kel: null,
  
  namakeluarga: '',
  keluarga: 'SAUDARA',
  kd_pj: 'A01', // UMUM
  pekerjaanpj: '-',
  alamatpj: '',
  propinsipj: '-',
  kabupatenpj: '-',
  kecamatanpj: '-',
  kelurahanpj: '-',
  no_peserta: '',
  perusahaan_pasien: '-',
  nip: ''
});

// Computed
const canSubmit = computed(() => {
  return selectedPasien.value && form.kd_dokter && form.kd_poli && form.kd_pj && !numberLoading.value;
});

// Handlers
const openTambahPasienModal = () => {
  // Reset form
  Object.assign(formPasienBaru, {
    nm_pasien: '',
    jk: 'L',
    no_ktp: '',
    tmp_lahir: '',
    tgl_lahir: '',
    nm_ibu: '',
    gol_darah: '-',
    stts_nikah: 'BELUM MENIKAH',
    agama: 'ISLAM',
    pnd: 'SMA',
    pekerjaan: '-',
    suku_bangsa: 5,
    bahasa_pasien: 5,
    cacat_fisik: 5,
    
    alamat: '',
    no_tlp: '',
    email: '',
    kd_prop: null,
    kd_kab: null,
    kd_kec: null,
    kd_kel: null,
    
    namakeluarga: '',
    keluarga: 'SAUDARA',
    kd_pj: 'A01', // UMUM
    pekerjaanpj: '-',
    alamatpj: '',
    propinsipj: '-',
    kabupatenpj: '-',
    kecamatanpj: '-',
    kelurahanpj: '-',
    no_peserta: '',
    perusahaan_pasien: '-',
    nip: ''
  });
  
  if (!tambahPasienModal) {
    tambahPasienModal = new window.bootstrap.Modal(document.getElementById('tambahPasienModal'));
  }
  tambahPasienModal.show();
};

const onSearchPropinsi = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const response = await wilayahService.searchPropinsi(search);
      propinsiOptions.value = response.message || response.data || [];
    } catch(e) {}
    loading(false);
  }
}, 500);

const onSearchKabupaten = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const response = await wilayahService.searchKabupaten(search);
      kabupatenOptions.value = response.message || response.data || [];
    } catch(e) {}
    loading(false);
  }
}, 500);

const onSearchKecamatan = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const response = await wilayahService.searchKecamatan(search);
      kecamatanOptions.value = response.message || response.data || [];
    } catch(e) {}
    loading(false);
  }
}, 500);

const onSearchKelurahan = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const response = await wilayahService.searchKelurahan(search);
      kelurahanOptions.value = response.message || response.data || [];
    } catch(e) {}
    loading(false);
  }
}, 500);

const submitTambahPasien = async () => {
  submittingPasien.value = true;
  try {
    const response = await pasienService.createPasien(formPasienBaru);
    
    // Automatically select the newly created patient
    const newPasien = response.data?.data;
    if (newPasien) {
      selectPasien(newPasien);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pasien baru berhasil didaftarkan.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
    
    tambahPasienModal.hide();
  } catch (error) {
    console.error('Failed to create patient:', error);
    Swal.fire({
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pasien.',
      icon: 'error'
    });
  } finally {
    submittingPasien.value = false;
  }
};

const handlePatientSearch = debounce(async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }
  
  searching.value = true;
  try {
    const payload = {
      search: { value: searchQuery.value },
      limit: 10,
      sort: [{ field: 'nm_pasien', direction: 'asc' }]
    };
    const response = await pasienService.searchPasien(payload);
    searchResults.value = response.data.data;
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    searching.value = false;
  }
}, 500);

const selectPasien = (pasien) => {
  selectedPasien.value = pasien;
  form.no_rkm_medis = pasien.no_rkm_medis;
  searchQuery.value = '';
  searchResults.value = [];
  fetchRiwayat(pasien.no_rkm_medis);
};

const clearSelectedPasien = () => {
  selectedPasien.value = null;
  form.no_rkm_medis = '';
  riwayatRegistrasi.value = [];
};

const fetchRiwayat = async (noRmk) => {
    loadingRiwayat.value = true;
    try {
        const payload = {
            filters: [{ field: 'no_rkm_medis', operator: '=', value: noRmk }],
            limit: 3,
            page: 1,
            sort: [{ field: 'no_reg', direction: 'desc' }],
            includes: ['poliklinik', 'dokter', 'caraBayar']
        };
        const response = await registrasiService.searchRegistrations(payload);
        if (response.data && response.data.data) {
            riwayatRegistrasi.value = response.data.data;
        }
    } catch (error) {
        console.error('Fetch riwayat error:', error);
    } finally {
        loadingRiwayat.value = false;
    }
};

const handleFormUpdate = async () => {
  if (form.tanggal_periksa && form.kd_poli && form.kd_dokter) {
    await fetchNextNumbers();
  } else {
    form.no_reg = '';
    form.no_rawat = '';
  }
};

const fetchNextNumbers = async () => {
  numberLoading.value = true;
  try {
    const response = await registrasiService.getNextNumbers({
      tanggal: form.tanggal_periksa,
      kd_poli: form.kd_poli,
      kd_dokter: form.kd_dokter
    });
    
    if (response.data.success) {
      form.no_reg = response.data.data.no_reg;
      form.no_rawat = response.data.data.no_rawat;
    }
  } catch (error) {
    console.error('Error fetching numbers:', error);
  } finally {
    numberLoading.value = false;
  }
};

const openGenerateSep = (reg) => {
    selectedRegForSep.value = reg;
    showGenerateSepModal.value = true;
};

const printKarcis = (reg) => {
    Swal.fire({
        title: 'Cetak Karcis?',
        text: `Mencetak karcis untuk ${reg.pasien.nm_pasien}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Cetak',
        cancelButtonText: 'Batal',
        customClass: {
            popup: 'swal2-glass'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Logic to print karcis (usually opens a new tab with PDF)
            window.open(`/api/v1/registrasi/karcis/${reg.no_rawat}`, '_blank');
        }
    });
};

const batalRegistrasi = (reg) => {
    Swal.fire({
        title: 'Batalkan Registrasi?',
        text: `Registrasi ${reg.pasien.nm_pasien} akan dibatalkan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Kembali',
        customClass: {
            popup: 'swal2-glass'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Logic to delete/cancel registration
            // Implement API call here
            Swal.fire({
                title: 'Berhasil!',
                text: 'Registrasi telah dibatalkan.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'swal2-glass' }
            });
            fetchRegistrations();
        }
    });
};

const submitRegistration = async () => {
  if (!canSubmit.value) return;

  const result = await Swal.fire({
    title: 'Konfirmasi Registrasi',
    text: `Daftarkan ${selectedPasien.value.nm_pasien} ke ${getNmPoli(form.kd_poli)}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Daftar',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#27ae60',
    background: '#ffffff',
    customClass: {
      popup: 'swal2-glass'
    }
  });

  if (result.isConfirmed) {
    submitting.value = true;
    try {
      const response = await registrasiService.register({
        ...form,
        limit_reg: parseInt(form.limit_reg)
      });

      if (response.data.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Pasien telah berhasil terdaftar.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        resetForm();
        fetchRiwayat(form.no_rkm_medis);
      }
    } catch (error) {
      Swal.fire({
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan sistem',
        icon: 'error'
      });
    } finally {
      submitting.value = false;
    }
  }
};

const resetForm = () => {
  clearSelectedPasien();
  form.kd_dokter = '';
  form.kd_poli = '';
  form.no_reg = '';
  form.no_rawat = '';
  fetchRegistrations(); // Refresh list after reset/success
};

// Registration List logic
const fetchRegistrations = async () => {
  listLoading.value = true;
  try {
    const filters = [];
    if (listFilterStartDate.value) filters.push({ field: 'tgl_registrasi', operator: '>=', value: listFilterStartDate.value });
    if (listFilterEndDate.value) filters.push({ field: 'tgl_registrasi', operator: '<=', value: listFilterEndDate.value });
    if (listFilterPoli.value) filters.push({ field: 'kd_poli', operator: '=', value: listFilterPoli.value });
    if (listFilterDokter.value) filters.push({ field: 'kd_dokter', operator: '=', value: listFilterDokter.value });

    const payload = {
      search: {
          value: listSearchQuery.value
      },
      filters: filters,
      limit: listPagination.per_page,
      page: listPagination.current_page,
      sort: [
          { field: 'no_reg', direction: 'desc' }
      ],
      includes: ['pasien', 'poliklinik', 'poliklinik.mappingBpjs', 'dokter', 'dokter.mappingBpjs', 'caraBayar', 'sepSimple']
    };
    
    const response = await registrasiService.searchRegistrations(payload);
    if (response.data && response.data.data) {
        registrationList.value = response.data.data;
        listPagination.current_page = response.data.meta?.current_page || response.data.current_page || 1;
        listPagination.last_page = response.data.meta?.last_page || response.data.last_page || 1;
        listPagination.total = response.data.meta?.total || response.data.total || 0;
    }
  } catch (error) {
    console.error('List fetch error:', error);
  } finally {
    listLoading.value = false;
  }
};

const handleListFilterChange = () => {
    listPagination.current_page = 1;
    fetchRegistrations();
};

const handleListSearch = debounce(() => {
    listPagination.current_page = 1;
    fetchRegistrations();
}, 500);

const changeListPage = (page) => {
    listPagination.current_page = page;
    fetchRegistrations();
};

// Utilities
const formatDate = (date) => dayjs(date).format('DD MMMM YYYY');
const formatDateShort = (date) => dayjs(date).format('DD/MM/YYYY');
const getNmPoli = (kd) => polikliniks.value.find(p => p.kd_poli === kd)?.nm_poli || '';

const getPenjabClass = (pngJawab) => {
  if (!pngJawab) return 'umum';
  const name = pngJawab.toLowerCase();
  if (name.includes('bpjs')) return 'bpjs';
  if (name.includes('asuransi') || name.includes('inhealth')) return 'asuransi';
  return 'umum';
};

const getStatusClass = (status) => {
  if (!status) return 'belum';
  const name = status.toLowerCase();
  
  if (name === 'sudah' || name === 'ralan') return 'sudah';
  if (name === 'batal') return 'batal';
  if (name === 'berkas diterima') return 'berkas-diterima';
  if (name === 'dirawat') return 'dirawat';
  if (name === 'dirujuk') return 'dirujuk';
  return 'belum';
};

// Lifecycle
onMounted(async () => {
  try {
    const [poliRes, drRes, pjRes] = await Promise.all([
      poliklinikService.getAllPoliklinik(),
      dokterService.getAllDokter(),
      registrasiService.getPenjab()
    ]);
    polikliniks.value = poliRes.data.data;
    dokters.value = drRes.data.data;
    penijabs.value = pjRes.data.data;
    
    // Fetch initial list
    fetchRegistrations();
  } catch (error) {
    console.error('Initial fetch failed:', error);
  }
});
</script>

<style scoped>
/* New List Styles */
.registration-list-card {
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.search-list-wrapper {
    max-width: 500px;
}

.list-search {
    flex-grow: 1;
}

.btn-refresh {
    width: 42px;
    height: 42px;
    background: #f8fafc;
    border: 1.5px solid #edf2f7;
    border-radius: 12px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
    background: white;
    border-color: #3498db;
    color: #3498db;
    transform: rotate(30deg);
}

.premium-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
    margin-top: -8px;
}

.premium-table thead th {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 1rem;
}

.premium-table tbody tr {
    background: #fcfcfc;
    transition: all 0.3s;
}

.premium-table tbody tr td {
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    padding: 1.25rem 1rem;
    vertical-align: middle;
}

.premium-table tbody tr td:first-child {
    border-left: 1px solid #f1f5f9;
    border-top-left-radius: 14px;
    border-bottom-left-radius: 14px;
}

.premium-table tbody tr td:last-child {
    border-right: 1px solid #f1f5f9;
    border-top-right-radius: 14px;
    border-bottom-right-radius: 14px;
}

.premium-table tbody tr:hover {
    transform: translateY(-2px);
    background: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.reg-number {
    font-family: 'Roboto Mono', monospace;
    font-weight: 800;
    color: #3498db;
    font-size: 1.1rem;
    background: #e3f2fd;
    padding: 0.4rem 0.8rem;
    border-radius: 10px;
    display: inline-block;
}

.info-tag {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    display: inline-block;
}

.info-tag.poli {
    background: #f0f7ff;
    color: #3b82f6;
}

.dr-name {
    font-size: 0.85rem;
    color: #475569;
}

.badge-custom {
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
}

.badge-custom.pj {
    background: #fef3c7;
    color: #92400e;
}

.badge-custom.pj.bpjs {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.badge-custom.pj.asuransi {
    background: #fef08a;
    color: #854d0e;
    border: 1px solid #fde047;
}

.badge-custom.pj.umum {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
}

.badge-custom.status {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.badge-custom.status.belum {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.badge-custom.status.sudah {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.badge-custom.status.batal {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.badge-custom.status.berkas-diterima {
    background: #e0e7ff;
    color: #3730a3;
    border: 1px solid #c7d2fe;
}

.badge-custom.status.dirawat {
    background: #ffedd5;
    color: #9a3412;
    border: 1px solid #fed7aa;
}

.badge-custom.status.dirujuk {
    background: #f3e8ff;
    color: #6b21a8;
    border: 1px solid #e9d5ff;
}

.badge-custom.status.sep-belum {
    background: #fff5f5;
    color: #e53e3e;
    border: 1px solid #feb2b2;
}

.list-pagination {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8fafc;
    padding: 0.5rem 1rem;
    border-radius: 14px;
    border: 1px solid #edf2f7;
}

.btn-page {
    width: 32px;
    height: 32px;
    border: none;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-radius: 8px;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
    background: #3498db;
    color: white;
    transform: translateY(-1px);
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: transparent;
    box-shadow: none;
}

.page-indicators {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    align-items: center;
}

.page-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e0;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-dot.active {
    width: 24px;
    border-radius: 4px;
    background: #3498db;
}

.page-dot:hover:not(.active) {
    background: #94a3b8;
}

.list-info {
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #e2e8f0;
}

.custom-scroll::-webkit-scrollbar {
    height: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
.registration-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

/* Fix Aksi Dropdown Flickering */
.dropdown-menu {
    margin-top: 0 !important;
    z-index: 1060;
}

.dropdown-menu::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
    background: transparent;
}

.dropdown-item {
    transition: all 0.2s;
    font-size: 0.85rem;
    font-weight: 500;
}

.dropdown-item:hover {
    background-color: rgba(52, 152, 219, 0.1);
    transform: translateX(4px);
}


.registration-card {
  width: 100%;
  margin: 0 auto;
  border-radius: 24px;
  padding: 2rem;
}

/* Header Sections */
.card-header-premium {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-icon-bg {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00b4db, #0083b0);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  box-shadow: 0 8px 16px rgba(0, 180, 219, 0.2);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .card-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 1.5rem;
  }
}

/* Form Section Cards */
.form-section-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #f0f0f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  display: inline-block;
  margin-bottom: 1.5rem;
}

/* Custom Controls */
.form-label-custom {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control-custom, .form-select-custom {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #edf2f7;
  font-size: 0.95rem;
  transition: all 0.3s;
  background-color: #f8fafc;
}

.form-control-custom:focus, .form-select-custom:focus {
  border-color: #3498db;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  outline: none;
}

/* v-select custom styling */
.v-select-custom :deep(.vs__dropdown-toggle) {
  padding: 0.4rem 0.5rem;
  border-radius: 12px;
  border: 1.5px solid #edf2f7;
  background-color: #f8fafc;
  transition: all 0.3s;
}

.v-select-custom :deep(.vs__dropdown-toggle):focus-within {
  border-color: #3498db;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
}

.v-select-custom :deep(.vs__selected-options) {
  padding: 0 0.5rem;
}

.v-select-custom :deep(.vs__selected) {
  font-size: 0.8rem;
  color: #2d3748;
  margin: 4px 2px 0px;
}

.v-select-custom :deep(.vs__search) {
  margin: 0;
  padding: 0.35rem 0;
  color: #2c3e50;
}

.v-select-custom :deep(.vs__search::placeholder) {
  color: #a0aec0;
}

.v-select-custom :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  margin-top: 5px;
  z-index: 1100;
}

.v-select-custom :deep(.vs__dropdown-option) {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 2px;
  color: #4a5568;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.8rem;
}

.v-select-custom :deep(.vs__dropdown-menu) {
  min-width: 100%;
  width: max-content;
  max-width: 350px;
}

.v-select-custom :deep(.vs__dropdown-option--highlight) {
  background: #3498db;
  color: white;
}

.v-select-custom :deep(.vs__clear), 
.v-select-custom :deep(.vs__open-indicator) {
  fill: #a0aec0;
  transform: scale(0.8);
}

/* Patient Search Wrapper */
.search-patient-wrapper {
  position: relative;
}

.search-input-group {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-spinner {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  border-radius: 16px;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.result-item {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background-color: #f7fafc;
}

.rm-badge-small {
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  font-family: 'Roboto Mono', monospace;
}

.pasien-name {
  font-weight: 600;
  color: #2d3748;
}

.pasien-meta {
  font-size: 0.75rem;
  color: #718096;
}

/* Selected Pasien Box */
.selected-pasien-box {
  background: linear-gradient(to right, #ffffff, #f7fafc);
  border: 2px solid #3498db;
  border-radius: 16px;
  padding: 1.25rem;
}

.box-inner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
}

.pasien-icon {
  width: 48px;
  height: 48px;
  background: #e1f5fe;
  color: #039be5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.25rem;
}

.selected-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1a202c;
}

.btn-clear {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 28px;
  height: 28px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(229, 62, 62, 0.2);
  transition: transform 0.2s;
}

.btn-clear:hover {
  transform: scale(1.1);
  background: #c53030;
}

.placeholder-pasien-box {
  border: 2px dashed #cbd5e0;
  border-radius: 16px;
  padding: 2.5rem 1rem;
  text-align: center;
  color: #a0aec0;
}

.placeholder-pasien-box i {
  font-size: 2.5rem;
}

/* Number Display Boxes */
.number-display-box {
  background: #2d3436;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.number-display-box .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #b2bec3;
  margin-bottom: 0.5rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.number-display-box .value {
  color: #00cec9;
  font-size: 1.5rem;
  font-weight: 800;
  font-family: 'Roboto Mono', monospace;
}

.loading-text {
  opacity: 0.5;
  filter: blur(2px);
}

/* Action Buttons */
.btn-submit-premium {
  padding: 1rem;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(46, 204, 113, 0.2);
  transition: all 0.3s;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(46, 204, 113, 0.3);
}

.btn-submit-premium:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary-premium {
  padding: 0.4rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.3s;
}

.btn-danger-premium {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #e53e3e, #f56565);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
  transition: all 0.3s;
}

.btn-danger-premium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(229, 62, 62, 0.3);
  filter: brightness(1.1);
}

.btn-primary-premium {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #3182ce, #2c5282);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
  transition: all 0.3s;
}

.btn-primary-premium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(49, 130, 206, 0.3);
  filter: brightness(1.1);
}

/* Form Check Custom */
.form-check-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check-custom input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-check-custom label {
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
}

/* Responsive Fixes */
@media (max-width: 768px) {
  .registration-card {
    padding: 1.5rem;
  }

  .header-icon-bg {
    width: 54px;
    height: 54px;
    font-size: 1.5rem;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .number-display-box .value {
    font-size: 1.25rem;
  }
}
</style>

<style>
/* Global styles for SweetAlert2 glass effect */
.swal2-glass {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}
</style>
