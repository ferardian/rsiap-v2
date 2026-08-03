<template>
  <div class="rawat-jalan-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Rawat Jalan</h2>
        <p class="page-subtitle text-secondary mb-0">Daftar pasien registrasi rawat jalan</p>
      </div>
      <div class="action-buttons d-flex gap-2">
        <button class="btn btn-action-outline d-md-none" @click="showFilters = !showFilters">
          <i class="fas" :class="showFilters ? 'fa-times' : 'fa-filter'"></i>
          {{ showFilters ? 'Tutup Filter' : 'Filter' }}
        </button>
        <button class="btn btn-action-outline d-none d-md-flex" @click="copyToClipboard" :disabled="items.length === 0">
          <i class="fas fa-copy me-2"></i> Copy
        </button>
        <button class="btn btn-action-success d-none d-md-flex" @click="exportToExcel" :disabled="items.length === 0">
          <i class="fas fa-file-excel me-2"></i> Excel
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown" v-if="showFilters || !isMobile" style="z-index: 100; position: relative; overflow: visible;">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Awal</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-control form-control-custom date-input" 
                v-model="filters.tgl_awal"
                @change="fetchData(true)"
              >
              <i class="fas fa-calendar-alt date-icon text-muted"></i>
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Akhir</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-control form-control-custom date-input" 
                v-model="filters.tgl_akhir"
                :min="filters.tgl_awal"
                @change="fetchData(true)"
              >
              <i class="fas fa-calendar-alt date-icon text-muted"></i>
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Status</label>
            <v-select 
              :options="['Ralan', 'Ranap', 'Semua']" 
              v-model="filters.status_lanjut" 
              placeholder="Pilih Status"
              class="style-chooser-custom"
              :clearable="false"
              @update:modelValue="fetchData(true)"
            ></v-select>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Poliklinik</label>
            <v-select
              v-model="filters.kd_poli"
              :options="poliklinikList"
              :reduce="poli => poli.kd_poli"
              label="nm_poli"
              placeholder="Pilih Poliklinik"
              class="style-chooser-custom"
              @update:modelValue="fetchData(true)"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Dokter</label>
            <v-select
              v-model="filters.kd_dokter"
              :options="dokterList"
              :reduce="dokter => dokter.kd_dokter"
              label="nm_dokter"
              placeholder="Pilih Dokter"
              class="style-chooser-custom"
              @update:modelValue="fetchData(true)"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Cari Pasien</label>
            <div class="search-input-wrapper">
              <input 
                type="text" 
                class="form-control form-control-custom search-input" 
                v-model="filters.keyword"
                placeholder="Nama / No RM / No Rawat"
                @keyup.enter="fetchData(true)"
              >
              <i class="fas fa-search search-icon text-muted"></i>
            </div>
          </div>
        </div>

        <!-- Mobile Actions -->
        <div class="d-flex d-md-none gap-2 mt-3 pt-3 border-top">
          <button class="btn btn-action-outline flex-grow-1" @click="copyToClipboard" :disabled="items.length === 0">
            <i class="fas fa-copy me-2"></i> Copy
          </button>
          <button class="btn btn-action-success flex-grow-1" @click="exportToExcel" :disabled="items.length === 0">
            <i class="fas fa-file-excel me-2"></i> Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm" style="z-index: 1; position: relative;">
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 60vh; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0 table-compact">
            <thead class="bg-light sticky-top" style="z-index: 10;">
              <tr>
                <th class="px-3 py-2" style="width: 80px">No. Reg</th>
                <th class="px-3 py-2" style="width: 120px">Tgl Registrasi</th>
                <th class="px-3 py-2">Pasien</th>
                <th class="px-3 py-2">Dokter & Poliklinik</th>
                <th class="px-3 py-2">Alamat</th>
                <th class="px-3 py-2 text-center">Bayar</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
                  Data tidak ditemukan
                </td>
              </tr>
              <tr v-else v-for="item in items" :key="item.no_rawat" @contextmenu.prevent="handleRightClick($event, item)" class="cursor-pointer">
                <td class="px-3 py-2">
                  <div class="fw-bold text-primary">{{ item.no_reg }}</div>
                  <div class="small text-muted">{{ item.no_rawat }}</div>
                </td>
                <td class="px-3 py-2">
                  <div class="fw-semibold text-dark">{{ formatDateIndo(item.tgl_registrasi) }}</div>
                  <div class="small text-muted" style="font-size: 0.75rem;">{{ item.jam_reg }}</div>
                </td>
                <td class="px-3 py-2">
                  <div class="fw-semibold text-dark">{{ item.pasien?.nm_pasien }}</div>
                  <div class="small text-muted d-flex align-items-center flex-wrap gap-1 mt-1">
                    <span>{{ item.no_rkm_medis }}</span>
                    <span>•</span>
                    <span>{{ item.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                    <span 
                      v-if="item.stts_daftar" 
                      class="badge rounded-pill ms-1"
                      :class="item.stts_daftar === 'Baru' ? 'bg-success text-white' : 'bg-secondary text-white'"
                      style="font-size: 0.65rem; padding: 2px 6px;"
                    >
                      {{ item.stts_daftar === 'Baru' ? 'Pasien Baru' : 'Pasien Lama' }}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-2">
                  <div class="fw-semibold text-dark">{{ item.dokter?.nm_dokter }}</div>
                  <div class="small text-muted" style="font-size: 0.75rem;">{{ item.poliklinik?.nm_poli }}</div>
                </td>
                <td class="px-3 py-2 text-truncate" style="max-width: 150px;">
                  {{ item.pasien?.alamat }}
                </td>
                <td class="px-3 py-2 text-center">
                   <span class="badge rounded-pill mb-1 d-inline-block" :class="getBayarClass(item.cara_bayar?.png_jawab)">
                     {{ item.cara_bayar?.png_jawab }}
                   </span>
                   <div v-if="item.sep" class="text-success fw-bold animate__animated animate__pulse animate__infinite" style="font-size: 10px; margin-top: -2px;">
                     <i class="fas fa-check-circle" style="font-size: 9px;"></i> SEP TERBIT
                   </div>
                </td>
                <td class="px-3 py-2">
                  <span 
                    class="badge rounded-pill"
                    :class="getStatusClass(item.stts)"
                  >
                    {{ item.stts }}
                  </span>
                </td>
                <td class="px-3 py-2 text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-action-table" title="Lihat Detail" @click="openModal(item)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-action-table" title="Menu Aksi" @click="openActionSheet(item)">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="card-footer bg-white py-3 border-top-0 d-flex justify-content-between align-items-center" v-if="pagination.total > 0">
        <small class="text-muted">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </small>
        <div class="btn-group btn-group-sm">
          <button 
            class="btn btn-outline-secondary" 
            :disabled="!pagination.prev_page_url"
            @click="changePage(pagination.prev_page_url)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            class="btn btn-outline-secondary" 
            :disabled="!pagination.next_page_url"
            @click="changePage(pagination.next_page_url)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5 class="mb-0 text-white">
            <i class="fas fa-user-injured me-2"></i>
            Detail Pasien
          </h5>
          <button type="button" class="btn-close-custom" @click="closeModal">×</button>
        </div>
        <div class="modal-body-custom" v-if="selectedItem">
          <!-- Sticky Header Wrapper -->
          <div class="sticky-header-wrapper">
            <!-- Patient Header (Always Visible) -->
             <div class="d-flex align-items-center mb-3 pb-2 border-bottom bg-white pt-2">
              <div class="avatar-circle me-3" style="width: 40px; height: 40px; min-width: 40px;">
                <span class="text-white fw-bold fs-5">{{ selectedItem.pasien?.nm_pasien?.charAt(0) }}</span>
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ selectedItem.pasien?.nm_pasien }}</h6>
                <p class="mb-0 text-muted small" style="font-size: 0.8rem;">
                  {{ selectedItem.no_rkm_medis }} • {{ selectedItem.no_rawat }}
                </p>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <ul class="nav nav-pills mb-4 nav-justified bg-light p-1 rounded">
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm" 
                  :class="{ active: activeTab === 'data-pasien' }"
                  @click="activeTab = 'data-pasien'"
                >
                  Data Pasien
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm" 
                  :class="{ active: activeTab === 'rme' }"
                  @click="activeTab = 'rme'"
                >
                  RME
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link btn-sm" 
                  :class="{ active: activeTab === 'billing' }"
                  @click="activeTab = 'billing'"
                >
                  Billing Pasien
                </button>
              </li>
            </ul>
          </div>

          <!-- Tab Content: Data Pasien -->
          <div v-if="activeTab === 'data-pasien'" class="row g-4 animation-fade">
            <!-- Section: Identitas -->
            <div class="col-12">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-square bg-blue-100 text-blue-600 me-2">
                  <i class="fas fa-id-card"></i>
                </div>
                <h6 class="fw-bold mb-0 text-dark">Identitas Pasien</h6>
              </div>
              <div class="card border-0 shadow-sm bg-light">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">No. Rekam Medis</label>
                      <div class="detail-value fw-bold text-primary">{{ selectedItem.pasien?.no_rkm_medis }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">No. Peserta (BPJS/Asuransi)</label>
                      <div class="detail-value text-success fw-medium">
                        {{ selectedItem.pasien?.no_peserta || '-' }}
                        <span v-if="selectedItem.sep" class="badge bg-success-soft text-success border border-success-soft ms-2" style="font-size: 0.7rem;">
                          <i class="fas fa-check-circle me-1"></i>SEP: {{ selectedItem.sep.no_sep }}
                        </span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">Nama Lengkap</label>
                      <div class="detail-value text-dark fw-medium">{{ selectedItem.pasien?.nm_pasien }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">No. KTP / NIK</label>
                      <div class="detail-value text-dark">{{ selectedItem.pasien?.no_ktp || '-' }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">TTL / Umur</label>
                      <div class="detail-value text-dark">
                        {{ selectedItem.pasien?.tmp_lahir }}, {{ selectedItem.pasien?.tgl_lahir }} 
                        <span class="text-muted">({{ selectedItem.pasien?.umur || selectedItem.umurdaftar }})</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">Jenis Kelamin</label>
                      <div class="detail-value text-dark">
                        <i :class="['fas me-1', selectedItem.pasien?.jk === 'L' ? 'fa-mars text-blue-500' : 'fa-venus text-pink-500']"></i>
                        {{ selectedItem.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Biodata Tambahan -->
            <div class="col-12">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-square bg-purple-100 text-purple-600 me-2">
                  <i class="fas fa-user-tag"></i>
                </div>
                <h6 class="fw-bold mb-0 text-dark">Biodata Tambahan</h6>
              </div>
              <div class="card border-0 shadow-sm bg-light">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">Nama Ibu Kandung</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.nm_ibu || '-' }}</div>
                    </div>
                    <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">Golongan Darah</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.gol_darah || '-' }}</div>
                    </div>
                    <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">Agama</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.agama || '-' }}</div>
                    </div>
                    <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">Status Nikah</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.stts_nikah || '-' }}</div>
                    </div>
                    <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">Pekerjaan</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.pekerjaan || '-' }}</div>
                    </div>
                     <div class="col-md-4">
                       <label class="detail-label text-muted mb-1">No. Telepon / HP</label>
                       <div class="detail-value text-dark">{{ selectedItem.pasien?.no_tlp || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Section: Alamat -->
            <div class="col-12">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-square bg-green-100 text-green-600 me-2">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <h6 class="fw-bold mb-0 text-dark">Alamat Domisili</h6>
              </div>
               <div class="card border-0 shadow-sm bg-light">
                <div class="card-body">
                   <p class="mb-0 text-dark fw-medium lh-base">
                     {{ selectedItem.pasien?.alamat }}
                   </p>
                </div>
               </div>
            </div>

            <!-- Divider with Label -->
             <div class="col-12 text-center my-2 position-relative">
               <hr class="position-absolute w-100 top-50 my-0" style="z-index:1">
               <span class="bg-white px-3 position-relative text-muted small fw-medium text-uppercase" style="z-index:2">Data Pendaftaran</span>
             </div>

            <!-- Section: Data Pendaftaran -->
            <div class="col-12">
               <div class="card border border-primary border-opacity-25 shadow-sm">
                <div class="card-body bg-blue-50">
                  <div class="row g-3">
                     <div class="col-md-6">
                      <label class="detail-label text-blue-700 mb-1">Poliklinik Tujuan</label>
                      <div class="detail-value text-dark fw-bold">{{ selectedItem.poliklinik?.nm_poli }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-blue-700 mb-1">Dokter Pemeriksa</label>
                      <div class="detail-value text-dark fw-bold">{{ selectedItem.dokter?.nm_dokter }}</div>
                    </div>
                     <div class="col-md-4">
                      <label class="detail-label text-blue-700 mb-1">Cara Bayar</label>
                      <div class="detail-value text-dark">{{ selectedItem.caraBayar?.png_jawab || selectedItem.cara_bayar?.png_jawab }}</div>
                    </div>
                    <div class="col-md-4">
                      <label class="detail-label text-blue-700 mb-1">Jenis Pasien</label>
                      <div>
                        <span 
                          v-if="selectedItem.stts_daftar"
                          class="badge rounded-pill"
                          :class="selectedItem.stts_daftar === 'Baru' ? 'bg-success text-white' : 'bg-secondary text-white'"
                        >
                          Pasien {{ selectedItem.stts_daftar }}
                        </span>
                        <span v-else class="text-dark">-</span>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="detail-label text-blue-700 mb-1">Status Periksa</label>
                      <div>
                        <span :class="['badge rounded-pill', getStatusClass(selectedItem.stts)]">
                          {{ selectedItem.stts }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
               </div>
            </div>
          </div>

          <!-- Tab Content: RME -->
          <div v-if="activeTab === 'rme'" class="animation-fade">
             <div v-if="isLoadingRme" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat Data Pemeriksaan...</p>
             </div>

             <div v-else-if="rmeError" class="alert alert-danger">
               {{ rmeError }}
             </div>

             <div v-else-if="!rmeData" class="text-center py-5 text-muted">
              <i class="fas fa-file-medical-alt fa-3x mb-3 opacity-50"></i>
              <p>Belum ada data pemeriksaan (SOAP) untuk kunjungan ini.</p>
             </div>

             <div v-else class="row g-4">
               <!-- Vital Signs Card -->
               <div class="col-12">
                 <div class="card bg-blue-50 border-0 shadow-sm">
                   <div class="card-body">
                     <h6 class="fw-bold text-blue-700 mb-3"><i class="fas fa-heartbeat me-2"></i>Tanda Vital</h6>
                     <div class="row g-3 text-center">
                       <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Tensi</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.tensi || '-' }}</span> <small>mmHg</small>
                       </div>
                       <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Nadi</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.nadi || '-' }}</span> <small>x/mnt</small>
                       </div>
                        <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Suhu</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.suhu_tubuh || '-' }}</span> <small>°C</small>
                       </div>
                       <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Respirasi</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.respirasi || '-' }}</span> <small>x/mnt</small>
                       </div>
                        <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Tinggi</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.tinggi || '-' }}</span> <small>cm</small>
                       </div>
                       <div class="col-6 col-md-2">
                         <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Berat</small>
                         <span class="fw-bold fs-5 text-dark">{{ rmeData.berat || '-' }}</span> <small>kg</small>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

                <!-- SOAP Content -->
                <div class="col-12">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                      <!-- Subjective -->
                      <div class="p-4 border-bottom">
                        <div class="d-flex mb-2">
                           <div class="icon-square bg-yellow-100 text-yellow-600 me-3">S</div>
                           <h6 class="fw-bold mb-0 align-self-center">Subjektif (Keluhan)</h6>
                        </div>
                        <p class="mb-0 text-dark ms-5 ps-2">{{ rmeData.keluhan || '-' }}</p>
                      </div>

                       <!-- Objective -->
                      <div class="p-4 border-bottom">
                        <div class="d-flex mb-2">
                           <div class="icon-square bg-green-100 text-green-600 me-3">O</div>
                           <h6 class="fw-bold mb-0 align-self-center">Objektif (Pemeriksaan)</h6>
                        </div>
                        <p class="mb-0 text-dark ms-5 ps-2">{{ rmeData.pemeriksaan || '-' }}</p>
                      </div>

                       <!-- Assessment -->
                      <div class="p-4 border-bottom">
                         <div class="d-flex mb-2">
                           <div class="icon-square bg-blue-100 text-blue-600 me-3">A</div>
                           <h6 class="fw-bold mb-0 align-self-center">Asesmen (Penilaian)</h6>
                        </div>
                        <p class="mb-0 text-dark ms-5 ps-2">{{ rmeData.penilaian || '-' }}</p>
                      </div>

                       <!-- Plan -->
                      <div class="p-4">
                         <div class="d-flex mb-2">
                           <div class="icon-square bg-purple-100 text-purple-600 me-3">P</div>
                           <h6 class="fw-bold mb-0 align-self-center">Plan (Instruksi/RTL)</h6>
                        </div>
                        <div class="ms-5 ps-2">
                           <p class="mb-2 text-dark"><strong>Instruksi:</strong> {{ rmeData.instruksi || '-' }}</p>
                           <p class="mb-0 text-dark"><strong>RTL:</strong> {{ rmeData.rtl || '-' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Penunjang Section -->
                <div v-if="penunjangData" class="col-12 mt-4">
                    <h6 class="fw-bold text-primary mb-3 border-bottom pb-2"><i class="fas fa-microscope me-2"></i>Pemeriksaan Penunjang</h6>
                    
                    <!-- Empty State -->
                    <div v-if="(!penunjangData.lab || penunjangData.lab.length === 0) && (!penunjangData.radiologi || penunjangData.radiologi.length === 0)" class="text-center py-3 text-muted border rounded bg-light mb-3">
                        <small>Belum ada data pemeriksaan penunjang (Lab/Radiologi).</small>
                    </div>

                    <!-- Lab -->
                    <div v-if="penunjangData.lab && penunjangData.lab.length > 0" class="mb-4">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-primary text-white py-2">
                                <span class="fw-bold small text-uppercase">Laboratorium</span>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0" style="font-size: 0.9rem;">
                                        <thead class="bg-light">
                                            <tr>
                                                <th class="ps-4">Pemeriksaan</th>
                                                <th>Hasil</th>
                                                <th>Ref</th>
                                                <th>Sat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                             <template v-for="lab in penunjangData.lab" :key="lab.no_rawat + lab.jam">
                                                 <tr class="table-secondary"><td colspan="4" class="fw-bold ps-4 py-1 small text-dark">{{ lab.jenis_perawatan?.nm_perawatan }} <span class="fw-normal text-muted">({{ lab.jam }})</span></td></tr>
                                                 <tr v-for="detail in lab.detail_periksa_lab" :key="detail.id_template">
                                                     <td class="ps-4">{{ detail.template?.Pemeriksaan }}</td>
                                                     <td class="fw-bold" :class="getLabResultClass(detail.keterangan)">
                                                       {{ detail.nilai }}
                                                       <span v-if="detail.keterangan" class="badge ms-1" :class="getLabResultBadgeClass(detail.keterangan)">
                                                         {{ detail.keterangan }}
                                                       </span>
                                                     </td>
                                                     <td class="text-muted small">{{ detail.nilai_rujukan }}</td>
                                                     <td>{{ detail.template?.satuan }}</td>
                                                 </tr>
                                             </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Radiologi -->
                    <div v-if="penunjangData.radiologi && penunjangData.radiologi.length > 0">
                         <div class="card border-0 shadow-sm">
                            <div class="card-header bg-primary text-white py-2">
                                <span class="fw-bold small text-uppercase">Radiologi</span>
                            </div>
                            <div class="card-body">
                                <div v-for="(rad, idx) in penunjangData.radiologi" :key="rad.no_rawat + rad.jam" :class="{'mb-4 border-bottom pb-3': idx < penunjangData.radiologi.length - 1}">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                       <h6 class="fw-bold mb-0 text-dark">{{ rad.jenis_perawatan?.nm_perawatan }}</h6>
                                       <span class="badge bg-light text-dark border">{{ rad.jam }}</span>
                                    </div>
                                    <div class="bg-light p-3 rounded" style="font-family: monospace; font-size: 0.85rem; white-space: pre-wrap;">{{ rad.hasil_radiologi?.hasil || 'Belum ada hasil expertise.' }}</div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                <!-- Footer Info -->
                <div class="col-12 text-end text-muted small mt-3 pt-3 border-top">
                  <i class="fas fa-user-md me-1"></i> Pemeriksa: {{ rmeData.petugas?.nama || rmeData.nip }} 
                  <span class="mx-2">•</span>
                  <i class="far fa-clock me-1"></i> {{ rmeData.tgl_perawatan }} {{ rmeData.jam_rawat }}
                </div>
             </div>
          </div>

          <!-- Tab Content: Billing -->
          <div v-if="activeTab === 'billing'" class="animation-fade">
             <div v-if="isLoadingBilling" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat Rincian Biaya...</p>
             </div>

             <div v-else-if="billingError" class="alert alert-danger">
               {{ billingError }}
             </div>

             <div v-else-if="!billingData || Object.keys(billingData).length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-file-invoice-dollar fa-3x mb-3 opacity-50"></i>
              <p>Belum ada data tagihan masuk.</p>
             </div>

             <div v-else>
               <div v-for="(items, category) in billingData" :key="category" class="card border-0 shadow-sm mb-4">
                 <div class="card-header bg-primary text-white border-bottom py-3 d-flex justify-content-between align-items-center">
                   <h6 class="fw-bold mb-0 text-white">{{ category }}</h6>
                   <span class="badge bg-white text-primary rounded-pill">{{ formatCurrency(calculateCategoryTotal(items)) }}</span>
                 </div>
                 <div class="card-body p-0">
                   <div class="table-responsive">
                     <table class="table table-hover mb-0">
                       <thead class="bg-light">
                         <tr>
                             <th class="ps-4">Item Transaksi</th>
                             <th class="text-center" width="80">Jml</th>
                             <th class="text-end" width="110">Harga</th>
                             <th class="text-end" width="110">Tambahan</th>
                             <th class="text-end pe-4" width="130">Total</th>
                         </tr>
                       </thead>
                        <tbody>
                           <template v-for="(subItems, key) in items" :key="key">
                              <!-- Transaction Item (Single or Grouped) -->
                              <tr v-if="subItems.biaya_rawat || subItems.biaya || subItems.totalbiaya || subItems.total || subItems[0]?.biaya_rawat || subItems[0]?.biaya || subItems[0]?.totalbiaya || subItems[0]?.total">
                                 <td class="ps-4">
                                   {{ key }} 
                                   <span v-if="Array.isArray(subItems) && subItems.length > 1" class="badge bg-secondary rounded-pill ms-2">{{ subItems.length }}x</span>
                                 </td>
                                 <td class="text-center">
                                   {{ Array.isArray(subItems) ? subItems.reduce((s, i) => s + parseFloat(i.jml || 1), 0) : (subItems.jml || 1) }}
                                 </td>
                                 <td class="text-end text-muted small">
                                   {{ formatCurrency(Array.isArray(subItems) ? (subItems[0].biaya_obat || subItems[0].biaya || subItems[0].biaya_rawat || 0) : (subItems.biaya_obat || subItems.biaya || subItems.biaya_rawat || 0)) }}
                                 </td>
                                 <td class="text-end text-muted small">
                                   {{ formatCurrency(Array.isArray(subItems) ? subItems.reduce((sum, i) => sum + getTambahan(i), 0) : getTambahan(subItems)) }}
                                 </td>
                                 <td class="text-end pe-4 fw-medium">
                                   {{ formatCurrency(Array.isArray(subItems) ? subItems.reduce((sum, i) => sum + getLineTotal(i), 0) : getLineTotal(subItems)) }}
                                 </td>
                              </tr>
                           </template>
                        </tbody>
                     </table>
                   </div>
                 </div>
               </div>

                <!-- Grand Total -->
                <div class="card bg-primary text-white border-0 shadow-lg">
                  <div class="card-body d-flex justify-content-between align-items-center p-4">
                    <h5 class="mb-0 fw-bold">Total Estimasi Biaya</h5>
                    <h3 class="mb-0 fw-bold">{{ formatCurrency(calculateGrandTotal(billingData)) }}</h3>
                  </div>
                </div>
             </div>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-secondary w-100" @click="closeModal">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Surat Keterangan Layak Terbang Modal (Premium Design - Compact) -->
    <div v-if="showSuratTerbangModal" class="modal-overlay" @click.self="closeSuratTerbangModal">
      <div class="modal-content-custom border-0 shadow-2xl animate__animated animate__zoomIn animate__faster" 
           style="max-width: 620px; height: auto; max-height: 85vh; border-radius: 20px; overflow: hidden; background: #fafafa; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;">
        
        <!-- Header: Vibrant Blue/Indigo Gradient with plane icon (Compact - Fixed) -->
        <div class="d-flex align-items-center justify-content-between py-3 px-4 text-white position-relative" 
             style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); flex-shrink: 0; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2); z-index: 10;">
          <div class="d-flex align-items-center">
            <div class="rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background-color: rgba(255, 255, 255, 0.2);">
              <i class="fas fa-plane-departure text-white fs-5"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold text-white" style="letter-spacing: 0.5px; font-size: 0.95rem;">Surat Layak Terbang</h6>
              <small class="text-white text-opacity-80" style="font-size: 0.75rem;">Penerbitan surat keterangan layak terbang</small>
            </div>
          </div>
          <button type="button" class="btn-close-custom bg-white bg-opacity-10 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                  style="width: 26px; height: 26px; border: none; font-size: 1.25rem; line-height: 1; transition: all 0.2s;" @click="closeSuratTerbangModal">×</button>
        </div>

        <!-- Body: Scrollable Input Fields Only -->
        <div class="modal-body-custom p-3" style="overflow-y: auto; flex-grow: 1; max-height: calc(85vh - 120px);">
          <div v-if="isLoadingSuratTerbang" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted fw-medium small">Menyelaraskan data...</p>
          </div>

          <div v-else>
            <!-- Premium Patient Summary Card: Soft Blue Gradient (Compact) -->
            <div v-if="currentSuratTerbangRegData" 
                 class="d-flex align-items-center p-2 mb-2.5 border border-light shadow-sm bg-white" 
                 style="border-radius: 12px; background: linear-gradient(to right, #ffffff, #f0f5ff);">
              <div class="avatar-circle me-2.5 d-flex align-items-center justify-content-center shadow-sm" 
                   style="width: 36px; height: 36px; min-width: 36px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%;">
                <span class="text-white fw-bold fs-5">{{ currentSuratTerbangRegData.pasien?.nm_pasien?.charAt(0) }}</span>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-center justify-content-between">
                  <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">{{ currentSuratTerbangRegData.pasien?.nm_pasien }}</h6>
                  <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-2 py-0.5 fw-semibold" style="font-size: 0.7rem; background-color: rgba(59, 130, 246, 0.1);">
                    {{ currentSuratTerbangRegData.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan' }}
                  </span>
                </div>
                <p class="mb-0 text-muted small mt-0.5 d-flex gap-2" style="font-size: 0.75rem;">
                  <span><strong>RM:</strong> {{ currentSuratTerbangRegData.no_rkm_medis }}</span>
                  <span class="text-secondary">•</span>
                  <span><strong>Rawat:</strong> {{ currentSuratTerbangRegData.no_rawat }}</span>
                </p>
              </div>
            </div>

            <!-- Form Fields (Linked to external submit button in footer via ID) -->
            <form id="suratTerbangForm" @submit.prevent="saveSuratTerbang" class="row g-2">
              
              <!-- Section Header: Administrasi -->
              <div class="col-12 mt-3">
                <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                  <i class="fas fa-file-alt text-primary" style="font-size: 0.85rem;"></i>
                  <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Detail Administrasi</span>
                </div>
              </div>

              <div class="col-md-7">
                <label class="form-label-custom mb-1"><i class="fas fa-barcode me-1 text-primary"></i> No. Surat</label>
                <div class="d-flex align-items-stretch gap-2">
                  <div class="input-group flex-grow-1">
                    <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-hashtag text-muted"></i></span>
                    <input 
                      type="text" 
                      class="form-control form-control-custom border-start-0" 
                      style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                      v-model="suratTerbangForm.no_surat" 
                      placeholder="Masukkan atau generate nomor"
                      required
                    >
                  </div>
                  <button 
                    class="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                    type="button" 
                    style="border-radius: 8px; border: 1.5px solid #3b82f6; transition: all 0.2s; width: 34px; min-width: 34px; max-width: 34px; padding: 0;"
                    title="Generate Nomor Baru"
                    @click="fetchNextSuratNumber"
                  >
                    <i class="fas fa-sync-alt" style="font-size: 0.8rem;"></i>
                  </button>
                </div>
              </div>

              <div class="col-md-5">
                <label class="form-label-custom mb-1"><i class="fas fa-calendar-alt me-1 text-primary"></i> Tanggal Surat</label>
                <input 
                  type="date" 
                  class="form-control form-control-custom" 
                  style="border: 1.5px solid #edf2f7; border-radius: 8px;"
                  v-model="suratTerbangForm.tanggalsurat"
                  required
                >
              </div>

              <!-- Section Header: Pemeriksaan Fisik (TTV) -->
              <div class="col-12 mt-3">
                <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                  <i class="fas fa-heartbeat text-primary" style="font-size: 0.85rem;"></i>
                  <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Pemeriksaan Fisik & TTV</span>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label-custom mb-1"><i class="fas fa-tachometer-alt me-1 text-primary"></i> Tekanan Darah</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-tint text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                    v-model="suratTerbangForm.tensi"
                    placeholder="Contoh: 120/80 atau -"
                    required
                  >
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label-custom mb-1"><i class="fas fa-weight me-1 text-primary"></i> Berat Badan (kg)</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-balance-scale text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                    v-model="suratTerbangForm.berat"
                    placeholder="Contoh: 5.6 atau -"
                    required
                  >
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label-custom mb-1"><i class="fas fa-ruler-vertical me-1 text-primary"></i> Tinggi Badan (cm)</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-child text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                    v-model="suratTerbangForm.tinggi"
                    placeholder="Contoh: 110 atau -"
                    required
                  >
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label-custom mb-1"><i class="fas fa-eye me-1 text-primary"></i> Buta Warna</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-eye-slash text-muted"></i></span>
                  <select 
                    class="form-select form-select-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                    v-model="suratTerbangForm.butawarna" 
                    required
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                    <option value="Parsial">Parsial</option>
                  </select>
                </div>
              </div>

              <!-- Section Header: Kesimpulan -->
              <div class="col-12 mt-3">
                <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                  <i class="fas fa-diagnoses text-primary" style="font-size: 0.85rem;"></i>
                  <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Kesimpulan Medis</span>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label-custom mb-1"><i class="fas fa-check-double me-1 text-primary"></i> Status Kelayakan Terbang</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-certificate text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                    v-model="suratTerbangForm.kesimpulan"
                    placeholder="Contoh: SEHAT DAN LAYAK TERBANG"
                    required
                  >
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Footer: Sticky / Fixed Action Buttons (Always Visible at Bottom) -->
        <div v-if="!isLoadingSuratTerbang" class="modal-footer-custom py-2 px-4 d-flex justify-content-between align-items-center border-top" 
             style="background: #f8fafc; flex-shrink: 0; z-index: 10;">
          <div>
            <button 
              v-if="suratTerbangForm.no_surat && currentSuratTerbangRegData?.surat" 
              type="button" 
              class="btn btn-premium-danger" 
              @click="deleteSuratTerbang"
              :disabled="isDeletingSuratTerbang"
            >
              <i v-if="isDeletingSuratTerbang" class="spinner-border spinner-border-sm me-1"></i>
              <i v-else class="fas fa-trash me-1"></i> Hapus
            </button>
          </div>
          
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-premium-secondary" @click="closeSuratTerbangModal">
              Batal
            </button>
            
            <button 
              v-if="currentSuratTerbangRegData?.surat || suratTerbangForm.no_surat" 
              type="button" 
              class="btn btn-premium-print" 
              @click="printSuratTerbang"
            >
              <i class="fas fa-print me-1"></i> Cetak
            </button>
            
            <button 
              type="submit" 
              form="suratTerbangForm"
              class="btn btn-premium-save" 
              :disabled="isSavingSuratTerbang"
            >
              <i v-if="isSavingSuratTerbang" class="spinner-border spinner-border-sm me-1"></i>
              <i v-else class="fas fa-save me-1"></i> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Surat Keterangan Layak Terbang -->
    <div id="print-surat-terbang" class="d-none d-print-block">
      <div class="print-container">
        <!-- Hospital Header Kop -->
        <div class="d-flex align-items-center justify-content-center mb-2 border-bottom pb-2 border-3 border-dark position-relative">
          <img :src="logoRsiaUrl" alt="Logo RSIA" class="position-absolute" style="left: 10px; width: 65px; height: 65px;">
          <div class="text-center" style="margin-left: 70px;">
            <h4 class="mb-0 fw-bold" style="font-size: 1.15rem; letter-spacing: 0.5px;">RSIA AISYIYAH PEKAJANGAN</h4>
            <p class="mb-0 small" style="font-size: 0.75rem;">JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN, PEKALONGAN, JAWA</p>
            <p class="mb-0 small" style="font-size: 0.75rem;">(0285) 785909</p>
          </div>
        </div>

        <!-- Document Title -->
        <div class="text-center my-4">
          <h5 class="fw-bold mb-1 text-decoration-underline" style="font-size: 1.1rem; letter-spacing: 1px;">SURAT KETERANGAN LAYAK TERBANG</h5>
          <p class="small text-muted mb-0">Nomor: {{ suratTerbangForm.no_surat || '-' }}</p>
        </div>

        <!-- Body Intro -->
        <div class="mb-3 leading-loose" style="font-size: 0.9rem; line-height: 1.6;">
          Yang bertandatangan di bawah ini, <strong>{{ currentSuratTerbangRegData?.dokter?.nm_dokter }}</strong> dengan mengingat sumpah waktu menerima jabatan bahwa:
        </div>

        <!-- Patient Details Table/Grid -->
        <div class="mb-4 ps-3" style="font-size: 0.9rem; line-height: 1.8;">
          <div class="row mb-1">
            <div class="col-4 text-muted">Nama</div>
            <div class="col-8">: <strong>{{ currentSuratTerbangRegData?.pasien?.nm_pasien }}</strong></div>
          </div>
          <div class="row mb-1">
            <div class="col-4 text-muted">Umur</div>
            <div class="col-8">: {{ currentSuratTerbangRegData?.pasien?.age_formatted || '-' }}</div>
          </div>
          <div class="row mb-1">
            <div class="col-4 text-muted">Jenis Kelamin</div>
            <div class="col-8">: {{ currentSuratTerbangRegData?.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan' }}</div>
          </div>
          <div class="row mb-3">
            <div class="col-4 text-muted">Alamat</div>
            <div class="col-8">: {{ currentSuratTerbangRegData?.pasien?.alamat }}</div>
          </div>
          <div class="row pt-2 border-top border-light-subtle">
            <div class="col-6">
              <div class="row">
                <div class="col-6 text-muted">Berat badan</div>
                <div class="col-6">: {{ suratTerbangForm.berat }} kg</div>
              </div>
              <div class="row">
                <div class="col-6 text-muted">Tekanan darah</div>
                <div class="col-6">: {{ suratTerbangForm.tensi }} mmHg</div>
              </div>
            </div>
            <div class="col-6">
              <div class="row">
                <div class="col-6 text-muted">Tinggi badan</div>
                <div class="col-6">: {{ suratTerbangForm.tinggi }} cm</div>
              </div>
              <div class="row">
                <div class="col-6 text-muted">Buta warna</div>
                <div class="col-6">: {{ suratTerbangForm.butawarna }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statement -->
        <div class="mb-4" style="font-size: 0.9rem; line-height: 1.6;">
          Pada hari ini telah kami periksa dengan teliti kesehatannya dan berpendapat bahwa kesehatan saudara tersebut pada waktu diperiksa:
        </div>

        <!-- Kesimpulan (Centered & Bold) -->
        <div class="text-center my-4 py-2 border border-2 border-dark bg-light rounded">
          <h5 class="fw-bold mb-0 text-uppercase" style="letter-spacing: 1px; font-size: 1.15rem;">{{ suratTerbangForm.kesimpulan }}</h5>
        </div>

        <!-- Closing -->
        <div class="mb-5" style="font-size: 0.9rem; line-height: 1.6;">
          Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat digunakan sesuai keperluan.
        </div>

        <!-- Signature Block -->
        <div class="d-flex justify-content-end text-end mt-5" style="font-size: 0.9rem;">
          <div style="width: 250px;">
            <div>PEKALONGAN, {{ formatDateIndo(suratTerbangForm.tanggalsurat) }}</div>
            <div style="height: 90px;"></div>
            <div class="fw-bold text-decoration-underline">{{ currentSuratTerbangRegData?.dokter?.nm_dokter }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenu.visible" 
      ref="contextMenuRef"
      class="context-menu shadow-lg animate__animated animate__fadeIn animate__faster"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
    >
      <div class="context-menu-item result-header text-muted border-bottom">
        {{ contextMenu.item?.pasien?.nm_pasien }}
      </div>
      
      <div class="context-menu-item" @click="handleContextAction('detail')">
        <i class="fas fa-eye me-2 text-primary"></i> Lihat Detail
      </div>
      
      <div class="context-menu-item" @click="handleContextAction('billing')">
        <i class="fas fa-file-invoice-dollar me-2 text-success"></i> Billing
      </div>

      <!-- Surat-Surat Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <i class="fas fa-envelope-open-text me-2 text-warning"></i> Surat - Surat
        <i class="fas fa-chevron-right ms-auto small text-muted" :class="{ 'fa-rotate-180': contextMenu.submenuDirection === 'left' }" style="font-size: 0.7rem;"></i>
        
        <div class="submenu shadow-sm" :class="{ 'submenu-left': contextMenu.submenuDirection === 'left' }">
             <div class="context-menu-item" @click.stop="handleContextAction('surat-terbang')">
                <i class="fas fa-plane-departure me-2 text-warning"></i> Surat Layak Terbang
             </div>
             <!-- Opsi surat lain dapat ditambahkan di sini di masa mendatang -->
        </div>
      </div>

       <!-- ERM Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <i class="fas fa-file-medical me-2 text-info"></i> ERM
        <i class="fas fa-chevron-right ms-auto small text-muted" :class="{ 'fa-rotate-180': contextMenu.submenuDirection === 'left' }" style="font-size: 0.7rem;"></i>
        
        <div class="submenu shadow-sm" :class="{ 'submenu-left': contextMenu.submenuDirection === 'left' }">
             <div class="context-menu-item" @click.stop="handleContextAction('erm-soap')">
               <i class="fas fa-notes-medical me-2 text-primary"></i> SOAP
             </div>
             <div class="context-menu-item" @click.stop="handleContextAction('erm-asesmen')">
               <i class="fas fa-user-md me-2 text-purple-600"></i> Asesmen Medis
             </div>
             <div class="context-menu-item" @click.stop="handleContextAction('erm-resume')">
               <i class="fas fa-file-alt me-2 text-gray-600"></i> Resume
             </div>
        </div>
      </div>

       <!-- Permintaan Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <i class="fas fa-hand-holding-medical me-2 text-warning"></i> Permintaan
        <i class="fas fa-chevron-right ms-auto small text-muted" :class="{ 'fa-rotate-180': contextMenu.submenuDirection === 'left' }" style="font-size: 0.7rem;"></i>
        
        <div class="submenu shadow-sm" :class="{ 'submenu-left': contextMenu.submenuDirection === 'left' }">
             <div class="context-menu-item" @click.stop="handleContextAction('req-operasi')">
               <i class="fas fa-procedures me-2 text-danger"></i> Jadwal Operasi
             </div>
             <div class="context-menu-item" @click.stop="handleContextAction('req-lab')">
               <i class="fas fa-flask me-2 text-info"></i> Pemeriksaan Lab
             </div>
             <div class="context-menu-item" @click.stop="handleContextAction('req-rad')">
               <i class="fas fa-x-ray me-2 text-dark"></i> Pemeriksaan Radiologi
             </div>
        </div>
      </div>

      <div class="border-top my-1"></div>
      
      <div class="context-menu-item" @click="handleContextAction('copyRawat')">
          <i class="fas fa-copy me-2 text-secondary"></i> Salin No. Rawat
      </div>
      <div class="context-menu-item" @click="handleContextAction('copyRM')">
          <i class="fas fa-id-card me-2 text-secondary"></i> Salin No. RM
      </div>

      <div class="border-top my-1"></div>
      
       <div class="context-menu-item text-danger" @click="closeContextMenu">
        <i class="fas fa-times me-2"></i> Tutup
      </div>
    </div>

    <!-- Mobile Action Sheet / Action Menu -->
    <div v-if="showActionSheet" class="action-sheet-overlay" @click="closeActionSheet">
      <div class="action-sheet-container animate__animated animate__slideInUp animate__faster" @click.stop>
        <div class="action-sheet-header">
          <div class="header-line"></div>
          <div class="d-flex align-items-center justify-content-between px-2 pb-2">
            <div class="text-start">
              <h6 class="mb-0 fw-bold text-dark">{{ selectedActionItem?.pasien?.nm_pasien }}</h6>
              <p class="mb-0 text-muted smallest-custom tracking-wider">{{ selectedActionItem?.no_rawat }}</p>
            </div>
            <button class="btn-close-sheet" @click="closeActionSheet">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="action-sheet-body pt-3">
          <!-- Main Actions: Grid -->
          <div class="row g-3 mb-4">
            <div class="col-6">
              <div class="action-card" @click="executeAction('detail')">
                <div class="action-card-icon bg-blue-soft text-primary">
                  <i class="fas fa-eye"></i>
                </div>
                <div class="action-card-label">Detail Pasien</div>
              </div>
            </div>
            <div class="col-6">
              <div class="action-card" @click="executeAction('billing')">
                <div class="action-card-icon bg-emerald-soft text-emerald-600">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="action-card-label">Billing Pasien</div>
              </div>
            </div>
          </div>

          <!-- Section: ERM -->
          <div class="action-group mb-4">
            <div class="action-group-header">Pemeriksaan & Medis</div>
            <div class="action-list">
              <div class="action-list-item" @click="executeAction('erm-soap')">
                <div class="item-icon bg-cyan-soft text-cyan-600"><i class="fas fa-notes-medical"></i></div>
                <div class="item-text">
                  <div class="item-title">SOAP (CPPT)</div>
                  <div class="item-desc">Catatan perkembangan pasien terintegrasi</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
              <div class="action-list-item" @click="executeAction('erm-asesmen')">
                <div class="item-icon bg-purple-soft text-purple-600"><i class="fas fa-user-md"></i></div>
                <div class="item-text">
                  <div class="item-title">Asesmen Medis</div>
                  <div class="item-desc">Hasil pemeriksaan dan penilaian dokter</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
              <div class="action-list-item" @click="executeAction('erm-resume')">
                <div class="item-icon bg-slate-soft text-slate-600"><i class="fas fa-file-alt"></i></div>
                <div class="item-text">
                  <div class="item-title">Resume Medis</div>
                  <div class="item-desc">Ringkasan riwayat pelayanan pasien</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
            </div>
          </div>

          <!-- Section: Surat-Surat -->
          <div class="action-group mb-4">
            <div class="action-group-header">Surat - Surat</div>
            <div class="action-list">
              <div class="action-list-item" @click="executeAction('surat-terbang')">
                <div class="item-icon bg-warning-soft text-warning"><i class="fas fa-plane-departure"></i></div>
                <div class="item-text">
                  <div class="item-title">Surat Layak Terbang</div>
                  <div class="item-desc">Buat/Cetak surat keterangan layak terbang</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
              <!-- Opsi surat lain dapat ditambahkan di sini di masa mendatang -->
            </div>
          </div>

          <!-- Section: Requests -->
          <div class="action-group mb-4">
            <div class="action-group-header">Permintaan Penunjang</div>
            <div class="action-list">
              <div class="action-list-item" @click="executeAction('req-lab')">
                <div class="item-icon bg-sky-soft text-sky-600"><i class="fas fa-flask"></i></div>
                <div class="item-text">
                  <div class="item-title">Laboratorium</div>
                  <div class="item-desc">Permintaan pemeriksaan darah/cairan</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
              <div class="action-list-item" @click="executeAction('req-rad')">
                <div class="item-icon bg-indigo-soft text-indigo-600"><i class="fas fa-x-ray"></i></div>
                <div class="item-text">
                  <div class="item-title">Radiologi</div>
                  <div class="item-desc">Permintaan foto rontgen/USG/CT-Scan</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
              <div class="action-list-item" @click="executeAction('req-operasi')">
                <div class="item-icon bg-rose-soft text-rose-600"><i class="fas fa-procedures"></i></div>
                <div class="item-text">
                  <div class="item-title">Jadwal Operasi</div>
                  <div class="item-desc">Pendaftaran jadwal tindakan operasi</div>
                </div>
                <i class="fas fa-chevron-right ms-auto smallest text-muted opacity-50"></i>
              </div>
            </div>
          </div>

          <!-- Section: Data -->
          <div class="action-group mb-4">
            <div class="action-group-header">Data Administrasi</div>
            <div class="row g-2">
              <div class="col-6">
                <div class="action-btn-outline" @click="executeAction('copyRawat')">
                  <i class="fas fa-copy me-2"></i> Salin Rawat
                </div>
              </div>
              <div class="col-6">
                <div class="action-btn-outline" @click="executeAction('copyRM')">
                  <i class="fas fa-id-card me-2"></i> Salin No. RM
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-sheet-footer p-3 border-top bg-light-subtle">
          <button class="btn btn-white w-100 rounded-pill fw-bold text-secondary shadow-sm py-2 border" @click="closeActionSheet">
            BATAL
          </button>
        </div>
      </div>
    </div>
    <!-- Booking Operasi Modal -->
    <div v-if="showBookingOperasiModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
         <div class="modal-content border-0 shadow-lg">
          <div class="modal-header-custom">
            <h5 class="mb-0 text-white">
               <i class="fas fa-procedures me-2"></i>
               Jadwal Operasi
            </h5>
            <button type="button" class="btn-close-custom" @click="closeBookingOperasiModal">×</button>
         </div>
         <div class="modal-body-custom">
            
            <div class="mb-3">
               <label class="form-label text-muted small fw-bold">Pasien</label>
               <div class="p-2 bg-light rounded border">
                  <div class="fw-bold">{{ bookingForm.nm_pasien }}</div>
                  <div class="small text-muted">{{ bookingForm.no_rawat }} • {{ bookingForm.no_rkm_medis }}</div>
               </div>
            </div>

            <form id="bookingForm" @submit.prevent="submitBookingOperasi">
               <div class="row g-3">
                  <div class="col-md-12">
                     <label class="form-label small fw-bold">Tanggal Operasi</label>
                     <input type="date" class="form-control" v-model="bookingForm.tanggal" required>
                  </div>
                  <div class="col-md-6">
                     <label class="form-label small fw-bold">Jam Mulai</label>
                     <input type="time" class="form-control" v-model="bookingForm.jam_mulai" required>
                  </div>
                   <div class="col-md-6">
                     <label class="form-label small fw-bold">Jam Selesai</label>
                     <input type="time" class="form-control" v-model="bookingForm.jam_selesai" required>
                  </div>
                  
                  <div class="col-md-12">
                     <label class="form-label small fw-bold">Paket Operasi</label>
                     <v-select
                        v-model="bookingForm.kode_paket"
                        :options="paketOperasiList"
                        :reduce="paket => paket.kode_paket"
                        label="nm_perawatan"
                        placeholder="Cari Paket Operasi..."
                        @search="onSearchPaket"
                        :filterable="false"
                        :loading="isLoadingPaket"
                     >
                       <template #option="{ nm_perawatan, kategori }">
                          <div><strong class="text-primary">{{ nm_perawatan }}</strong></div>
                          <small class="text-muted">{{ kategori }}</small>
                       </template>
                     </v-select>
                  </div>
                  
                   <div class="col-md-12">
                     <label class="form-label small fw-bold">Operator (Dokter)</label>
                     <v-select
                        v-model="bookingForm.kd_dokter"
                        :options="dokterList"
                        :reduce="dokter => dokter.kd_dokter"
                        label="nm_dokter"
                        placeholder="Pilih Dokter Operator"
                     ></v-select>
                  </div>

                  <div class="col-md-12">
                     <label class="form-label small fw-bold">Diagnosa</label>
                     <textarea 
                        class="form-control" 
                        v-model="bookingForm.diagnosa" 
                        rows="3"
                        maxlength="100"
                        placeholder="Masukkan diagnosa operasi (maksimal 100 karakter)"
                     ></textarea>
                     <small class="text-muted">{{ bookingForm.diagnosa?.length || 0 }}/100 karakter</small>
                  </div>

                  <div class="col-md-12">
                      <label class="form-label small fw-bold">Status</label>
                      <select class="form-select" v-model="bookingForm.status">
                         <option value="Menunggu">Menunggu</option>
                         <option value="Proses Operasi">Proses Operasi</option>
                         <option value="Selesai">Selesai</option>
                      </select>
                  </div>
               </div>
            </form>
         </div>
         <div class="modal-footer-custom bg-white border-top">
            <div class="d-flex gap-2 w-100">
                <button type="button" class="btn btn-light w-50" @click="closeBookingOperasiModal">Batal</button>
                <button type="submit" form="bookingForm" class="btn btn-danger w-50" :disabled="isSubmittingBooking">
                    <span v-if="isSubmittingBooking" class="spinner-border spinner-border-sm me-1"></span>
                    Simpan Jadwal
                </button>
            </div>
         </div>
      </div>
    </div>
    </div>

    <!-- Booking Success Modal -->
    <div v-if="showBookingSuccessModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 9999;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <div class="success-checkmark">
                <div class="check-icon">
                  <span class="icon-line line-tip"></span>
                  <span class="icon-line line-long"></span>
                  <div class="icon-circle"></div>
                  <div class="icon-fix"></div>
                </div>
              </div>
            </div>
            <h5 class="fw-bold text-success mb-2">Berhasil!</h5>
            <p class="text-muted mb-0">{{ bookingMessage }}</p>
          </div>
          <div class="modal-footer border-0 justify-content-center pb-4">
            <button type="button" class="btn btn-success px-4" @click="closeBookingSuccessModal">
              <i class="fas fa-check me-1"></i>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Error Modal -->
    <div v-if="showBookingErrorModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 9999;">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <i class="fas fa-exclamation-circle fa-4x text-danger"></i>
            </div>
            <h5 class="fw-bold text-danger mb-2">Gagal!</h5>
            <p class="text-muted mb-0">{{ bookingMessage }}</p>
          </div>
          <div class="modal-footer border-0 justify-content-center pb-4">
            <button type="button" class="btn btn-danger px-4" @click="closeBookingErrorModal">
              <i class="fas fa-times me-1"></i>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue'
import rawatJalanService from '@/services/rawatJalanService'
import operasiService from '@/services/operasiService'
import * as XLSX from 'xlsx'
import { useToast } from 'vue-toastification'
import logoRsiaAsset from '@/assets/logo.png'

const toast = useToast()
const logoRsiaUrl = logoRsiaAsset

// Utility: Simple Debounce
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// State
const loading = ref(false)
const items = ref([])
const poliklinikList = ref([])
const dokterList = ref([])
const pagination = ref({})
const showFilters = ref(false)
const isMobile = ref(false)

const filters = reactive({
  tgl_awal: new Date().toISOString().split('T')[0],
  tgl_akhir: new Date().toISOString().split('T')[0],
  status_lanjut: 'Ralan',
  kd_poli: null,
  kd_dokter: null,
  keyword: ''
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Booking Operasi State
const showBookingOperasiModal = ref(false)
const isLoadingPaket = ref(false)
const isSubmittingBooking = ref(false)
const paketOperasiList = ref([])
const bookingForm = reactive({
  no_rawat: '',
  no_rkm_medis: '',
  nm_pasien: '',
  tanggal: new Date().toISOString().split('T')[0],
  jam_mulai: '08:00',
  jam_selesai: '09:00',
  kode_paket: null,
  status: 'Menunggu',
  kd_dokter: null,
  diagnosa: ''
})

// Booking Success/Error Modal State
const showBookingSuccessModal = ref(false)
const showBookingErrorModal = ref(false)
const bookingMessage = ref('')

// Surat Keterangan Layak Terbang State
const showSuratTerbangModal = ref(false)
const isLoadingSuratTerbang = ref(false)
const isSavingSuratTerbang = ref(false)
const isDeletingSuratTerbang = ref(false)

const suratTerbangForm = ref({
  no_surat: '',
  no_rawat: '',
  tanggalsurat: '',
  berat: '',
  tinggi: '',
  tensi: '',
  butawarna: 'Tidak',
  kesimpulan: 'SEHAT DAN LAYAK TERBANG'
})

const currentSuratTerbangRegData = ref(null)
const currentPemeriksaanRalan = ref(null)

const openSuratTerbangModal = async (item) => {
  showSuratTerbangModal.value = true
  isLoadingSuratTerbang.value = true
  document.body.style.overflow = 'hidden'
  
  // Reset form
  suratTerbangForm.value = {
    no_surat: '',
    no_rawat: item.no_rawat,
    tanggalsurat: new Date().toISOString().split('T')[0],
    berat: '',
    tinggi: '',
    tensi: '',
    butawarna: 'Tidak',
    kesimpulan: 'SEHAT DAN LAYAK TERBANG'
  }
  currentSuratTerbangRegData.value = null
  currentPemeriksaanRalan.value = null

  try {
    const response = await rawatJalanService.getSuratTerbang(item.no_rawat)
    if (response.data && response.data.success) {
      const data = response.data.data
      currentSuratTerbangRegData.value = data.reg_periksa
      currentPemeriksaanRalan.value = data.pemeriksaan_ralan
      
      if (data.surat) {
        suratTerbangForm.value = {
          no_surat: data.surat.no_surat,
          no_rawat: data.surat.no_rawat,
          tanggalsurat: data.surat.tanggalsurat,
          berat: data.surat.berat,
          tinggi: data.surat.tinggi,
          tensi: data.surat.tensi,
          butawarna: data.surat.butawarna,
          kesimpulan: data.surat.kesimpulan
        }
      } else {
        await fetchNextSuratNumber()
        // Auto-fill from pemeriksaan_ralan if available
        if (data.pemeriksaan_ralan) {
          if (data.pemeriksaan_ralan.berat && data.pemeriksaan_ralan.berat !== '-') {
            suratTerbangForm.value.berat = data.pemeriksaan_ralan.berat
          }
          if (data.pemeriksaan_ralan.tinggi && data.pemeriksaan_ralan.tinggi !== '-') {
            suratTerbangForm.value.tinggi = data.pemeriksaan_ralan.tinggi
          }
          if (data.pemeriksaan_ralan.tensi && data.pemeriksaan_ralan.tensi !== '-') {
            suratTerbangForm.value.tensi = data.pemeriksaan_ralan.tensi
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading surat terbang:', error)
    toast.error('Gagal memuat data surat layak terbang')
  } finally {
    isLoadingSuratTerbang.value = false
  }
}


const fetchNextSuratNumber = async () => {
  try {
    const res = await rawatJalanService.getNextSuratTerbangNumber()
    if (res.data && res.data.success) {
      suratTerbangForm.value.no_surat = res.data.no_surat
    }
  } catch (e) {
    console.error('Error fetching next surat number:', e)
  }
}

const closeSuratTerbangModal = () => {
  showSuratTerbangModal.value = false
  document.body.style.overflow = ''
}

const saveSuratTerbang = async () => {
  isSavingSuratTerbang.value = true
  try {
    const response = await rawatJalanService.saveSuratTerbang(suratTerbangForm.value)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat Layak Terbang berhasil disimpan')
      openSuratTerbangModal({ no_rawat: suratTerbangForm.value.no_rawat })
    } else {
      toast.error(response.data.message || 'Gagal menyimpan surat')
    }
  } catch (error) {
    console.error('Error saving surat terbang:', error)
    toast.error('Gagal menyimpan surat layak terbang')
  } finally {
    isSavingSuratTerbang.value = false
  }
}

const deleteSuratTerbang = async () => {
  if (!suratTerbangForm.value.no_surat) return
  if (!confirm(`Apakah Anda yakin ingin menghapus surat nomor: ${suratTerbangForm.value.no_surat}?`)) {
    return
  }

  isDeletingSuratTerbang.value = true
  try {
    const response = await rawatJalanService.deleteSuratTerbang(suratTerbangForm.value.no_surat)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat berhasil dihapus')
      closeSuratTerbangModal()
    } else {
      toast.error(response.data.message || 'Gagal menghapus surat')
    }
  } catch (error) {
    console.error('Error deleting surat terbang:', error)
    toast.error('Gagal menghapus surat layak terbang')
  } finally {
    isDeletingSuratTerbang.value = false
  }
}

const printSuratTerbang = () => {
  nextTick(() => {
    window.print()
  })
}

// Methods
const startDebounceInfo = debounce(() => {
  fetchData()
}, 500)

watch(() => filters.keyword, () => {
    startDebounceInfo()
})

const fetchData = async (reset = false) => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: reset === true ? 1 : (typeof reset === 'number' ? reset : (pagination.value.current_page || 1))
    }
    
    // Clean null values
    Object.keys(params).forEach(key => params[key] === null && delete params[key])

    const response = await rawatJalanService.getRawatJalan(params)
    if (response && response.data && response.data.success) {
       const paginationData = response.data.data
       
       items.value = paginationData.data
       
       pagination.value = {
         current_page: paginationData.current_page,
         last_page: paginationData.last_page,
         total: paginationData.total,
         from: paginationData.from,
         to: paginationData.to,
         prev_page_url: paginationData.prev_page_url,
         next_page_url: paginationData.next_page_url
       }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const loadMasterData = async () => {
  try {
    const [poliRes, dokterRes] = await Promise.all([
      rawatJalanService.getPoliklinik(),
      rawatJalanService.getDokter()
    ])
    
    // Check axios response data
    if (poliRes.data && poliRes.data.success) {
      poliklinikList.value = poliRes.data.data
    }
    
    if (dokterRes.data && dokterRes.data.success) {
      dokterList.value = dokterRes.data.data
    }
  } catch (error) {
    console.error('Error loading master data:', error)
  }
}

const changePage = (url) => {
  if (!url) return
  // Extract page number from the pagination URL
  const urlObj = new URL(url)
  const page = parseInt(urlObj.searchParams.get('page') || '1')
  fetchData(page)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Belum': return 'bg-warning text-dark'
    case 'Sudah': return 'bg-success text-white'
    case 'Batal': return 'bg-danger text-white'
    case 'Dirujuk': return 'bg-info text-white'
    default: return 'bg-secondary text-white'
  }
}

const getBayarClass = (bayar) => {
  if (!bayar) return 'bg-light text-dark border'
  
  const b = bayar.toLowerCase()
  if (b.includes('bpjs')) return 'bg-success text-white'
  if (b.includes('umum')) return 'bg-danger text-white' // or warning/info
  if (b.includes('asuransi')) return 'bg-primary text-white'
  if (b.includes('perusahaan')) return 'bg-info text-white'
  if (b.includes('karyawan')) return 'bg-secondary text-white'

  return 'bg-light text-dark border'
}

// Modal Logic
const showModal = ref(false)
const selectedItem = ref(null)
const activeTab = ref('data-pasien')

// RME State
const rmeData = ref(null)
const isLoadingRme = ref(false)
const rmeError = ref(null)

// Booking Operasi Methods
const fetchPaketOperasi = async (keyword = '') => {
  isLoadingPaket.value = true
  try {
     const res = await operasiService.getPaket({ keyword })
     if (res.data && res.data.success) {
        paketOperasiList.value = res.data.data
     }
  } catch(e) { 
    console.error('Error fetching paket operasi:', e) 
  } finally {
    isLoadingPaket.value = false
  }
}

const openBookingOperasiModal = (item) => {
  bookingForm.no_rawat = item.no_rawat
  bookingForm.no_rkm_medis = item.no_rkm_medis
  bookingForm.nm_pasien = item.pasien?.nm_pasien
  bookingForm.kd_dokter = item.kd_dokter
  
  showBookingOperasiModal.value = true
  fetchPaketOperasi()
}

const closeBookingOperasiModal = () => {
    showBookingOperasiModal.value = false
    // Reset form partial but keep common fields
    bookingForm.kode_paket = null
    bookingForm.status = 'Menunggu'
    bookingForm.diagnosa = ''
}

const closeBookingSuccessModal = () => {
    showBookingSuccessModal.value = false
    bookingMessage.value = ''
}

const closeBookingErrorModal = () => {
    showBookingErrorModal.value = false
    bookingMessage.value = ''
}

const searchDebounce = debounce((loading, search) => {
  fetchPaketOperasi(search).then(() => {
     loading(false)
  })
}, 500)

const onSearchPaket = (search, loading) => {
  if(search.length) {
    loading(true);
    searchDebounce(loading, search);
  }
}

const submitBookingOperasi = async () => {
    isSubmittingBooking.value = true
    try {
        if (!bookingForm.kode_paket || !bookingForm.kd_dokter) {
           bookingMessage.value = 'Paket Operasi dan Dokter Operator wajib diisi!'
           showBookingErrorModal.value = true
           isSubmittingBooking.value = false
           return
        }

        const payload = {
            no_rawat: bookingForm.no_rawat,
            kode_paket: bookingForm.kode_paket,
            tanggal: bookingForm.tanggal,
            jam_mulai: bookingForm.jam_mulai,
            jam_selesai: bookingForm.jam_selesai,
            status: bookingForm.status,
            kd_dokter: bookingForm.kd_dokter,
            diagnosa: bookingForm.diagnosa
        }
        
        await operasiService.storeBooking(payload)
        bookingMessage.value = 'Jadwal Operasi berhasil disimpan!'
        showBookingSuccessModal.value = true
        closeBookingOperasiModal()
    } catch (error) {
        console.error('Submit Booking Error:', error)
        bookingMessage.value = error.response?.data?.message || 'Gagal menyimpan jadwal operasi. Periksa kembali inputan.'
        showBookingErrorModal.value = true
    } finally {
        isSubmittingBooking.value = false
    }
}

const fetchRme = async () => {
  if (!selectedItem.value) return
  
  isLoadingRme.value = true
  rmeError.value = null
  
  try {
    const response = await rawatJalanService.getPemeriksaanRalan(
      selectedItem.value.no_rkm_medis,
      selectedItem.value.no_rawat
    )
    
    // API returns a collection, we take the first item
    if (response.data && response.data.data && response.data.data.length > 0) {
      rmeData.value = response.data.data[0]
    } else {
      rmeData.value = null
    }
  } catch (error) {
    console.error('Error fetching RME:', error)
    rmeError.value = 'Gagal memuat data RME'
  } finally {
    isLoadingRme.value = false
  }
}


// Billing State
const billingData = ref(null)
const isLoadingBilling = ref(false)
const billingError = ref(null)

// Penunjang State (Lab & Rad)
const penunjangData = ref(null)
const isLoadingPenunjang = ref(false)
const penunjangError = ref(null)

const fetchPenunjang = async () => {
   if (!selectedItem.value) return

   isLoadingPenunjang.value = true
   penunjangError.value = null

   try {
     const response = await rawatJalanService.getPenunjang(selectedItem.value.no_rawat)
     if (response.data && response.data.success) {
       penunjangData.value = response.data.data
     } else {
       penunjangData.value = null
     }
   } catch (error) {
     console.error('Error fetching Penunjang:', error)
     penunjangError.value = 'Gagal memuat data penunjang'
   } finally {
     isLoadingPenunjang.value = false
   }
}

const fetchBilling = async () => {
   if (!selectedItem.value) return

   isLoadingBilling.value = true
   billingError.value = null

   try {
     const response = await rawatJalanService.getBilling(selectedItem.value.no_rawat)
     if (response.data && response.data.success) {
       billingData.value = response.data.data
     } else {
       billingData.value = null
     }
   } catch (error) {
     console.error('Error fetching billing:', error)
     billingError.value = 'Gagal memuat data billing'
   } finally {
     isLoadingBilling.value = false
   }
}

watch(activeTab, (newTab) => {
  if (newTab === 'rme') {
    if (!rmeData.value) fetchRme()
    if (!penunjangData.value) fetchPenunjang()
  }
  if (newTab === 'billing' && !billingData.value) {
    fetchBilling()
  }
})

const openModal = (item) => {
  selectedItem.value = item
  activeTab.value = 'data-pasien'
  rmeData.value = null 
  billingData.value = null // Reset Billing
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

const getLabResultClass = (keterangan) => {
  if (!keterangan) return 'text-dark'
  
  const ket = keterangan.toString().toLowerCase().trim()
  
  // Check for single letter codes first
  if (ket === 'h' || ket.includes('high') || ket.includes('tinggi') || ket.includes('positif') || ket.includes('positive')) {
    return 'text-danger'
  }
  if (ket === 'l' || ket.includes('low') || ket.includes('rendah')) {
    return 'text-primary'
  }
  if (ket === 'n' || ket.includes('normal') || ket.includes('negatif') || ket.includes('negative')) {
    return 'text-success'
  }
  
  return 'text-dark'
}

const getLabResultBadgeClass = (keterangan) => {
  if (!keterangan) return ''
  
  const ket = keterangan.toString().toLowerCase().trim()
  
  // Check for single letter codes first
  if (ket === 'h' || ket.includes('high') || ket.includes('tinggi') || ket.includes('positif') || ket.includes('positive')) {
    return 'bg-danger text-white'
  }
  if (ket === 'l' || ket.includes('low') || ket.includes('rendah')) {
    return 'bg-primary text-white'
  }
  if (ket === 'n' || ket.includes('normal') || ket.includes('negatif') || ket.includes('negative')) {
    return 'bg-success text-white'
  }
  
  return 'bg-secondary text-white'
}

const getLineTotal = (i) => {
  const total = parseFloat(i.total || i.total_obat || i.totalbiaya || 0)
  if (total > 0) return total
  
  // Fallback: price * quantity
  const price = parseFloat(i.biaya_obat || i.biaya || i.biaya_rawat || i.harga || 0)
  const quantity = parseFloat(i.jml || 1)
  return price * quantity
}

const getTambahan = (i) => {
  const total = parseFloat(i.total || i.total_obat || i.totalbiaya || 0)
  if (total === 0) return 0 // Assuming no "tambahan" if total is not explicitly provided
  
  const price = parseFloat(i.biaya_obat || i.biaya || i.biaya_rawat || i.harga || 0)
  const quantity = parseFloat(i.jml || 1)
  const base = price * quantity
  
  return total - base
}

const calculateCategoryTotal = (items) => {
  if (Array.isArray(items)) {
     return items.reduce((sum, item) => sum + getLineTotal(item), 0)
  }
  
  if (typeof items === 'object' && items !== null) {
      return Object.values(items).reduce((sum, sub) => {
          if (Array.isArray(sub)) {
              return sum + sub.reduce((s, i) => s + getLineTotal(i), 0)
          }
          return sum + getLineTotal(sub)
      }, 0)
  }
  return 0
}

const calculateGrandTotal = (data) => {
  if (!data) return 0
  let total = 0
  Object.values(data).forEach(items => {
     total += calculateCategoryTotal(items)
  })
  return total
}

// Context Menu Logic
const contextMenuRef = ref(null)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null,
  submenuDirection: 'right'
})

const handleRightClick = async (e, item) => {
  contextMenu.item = item
  contextMenu.visible = true
  
  // Set initial position
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY

  await nextTick()

  if (contextMenuRef.value) {
    const menuWidth = contextMenuRef.value.offsetWidth
    const menuHeight = contextMenuRef.value.offsetHeight
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Adjust horizontal position
    if (e.clientX + menuWidth > screenWidth) {
      contextMenu.x = e.clientX - menuWidth
    }

    // Adjust vertical position
    if (e.clientY + menuHeight > screenHeight) {
      contextMenu.y = e.clientY - menuHeight
    }

    // Determine sub-menu direction
    const submenuWidth = 200 // Approx sub-menu width
    if (contextMenu.x + menuWidth + submenuWidth > screenWidth) {
      contextMenu.submenuDirection = 'left'
    } else {
      contextMenu.submenuDirection = 'right'
    }

    // Boundary check for left/top (ensure not negative)
    contextMenu.x = Math.max(10, contextMenu.x)
    contextMenu.y = Math.max(10, contextMenu.y)
  }
}


// Mobile Action Sheet State
const showActionSheet = ref(false)
const selectedActionItem = ref(null)

const openActionSheet = (item) => {
  selectedActionItem.value = item
  showActionSheet.value = true
}

const closeActionSheet = () => {
  showActionSheet.value = false
}

const executeAction = async (action) => {
  if (!selectedActionItem.value) return
  
  contextMenu.item = selectedActionItem.value
  await handleContextAction(action)
  showActionSheet.value = false
}

const closeContextMenu = () => {
  contextMenu.visible = false
  contextMenu.item = null
}

const handleContextAction = async (action) => {
  if (!contextMenu.item) return
  
  const item = contextMenu.item
  closeContextMenu()

  switch (action) {
    case 'detail':
      openModal(item)
      break
    case 'billing':
      openModal(item)
      activeTab.value = 'billing'
      // Trigger fetch immediately
      selectedItem.value = item
      await fetchBilling()
      break
    case 'surat-terbang':
       openSuratTerbangModal(item)
       break
    case 'erm-soap':
       openModal(item)
       activeTab.value = 'rme'
       selectedItem.value = item
       await fetchRme()
       break
    case 'req-operasi':
       openBookingOperasiModal(item)
       break
    case 'req-lab':
    case 'req-rad':
       alert('Fitur Permintaan ini belum terhubung ke API.')
       break
    case 'erm-asesmen':
    case 'erm-resume':
       alert('Fitur ' + action + ' belum tersedia.')
       break
    case 'copyRawat':
      navigator.clipboard.writeText(item.no_rawat)
      alert('No. Rawat berhasil disalin!')
      break
    case 'copyRM':
      navigator.clipboard.writeText(item.no_rkm_medis)
      alert('No. RM berhasil disalin!')
      break
  }
}

// Data Export Functions
const fetchAllData = async () => {
    try {
        const params = {
          ...filters,
          per_page: 999999 // Fetch all
        }
        
        // Clean null values
        Object.keys(params).forEach(key => params[key] === null && delete params[key])
        
        const response = await rawatJalanService.getRawatJalan(params)
        if (response.data && response.data.success) {
            return response.data.data.data
        }
    } catch (error) {
        console.error('Error fetching all data:', error)
        alert('Gagal mengambil data lengkap untuk export.')
    }
    return []
}

const formatDataForExport = (data) => {
  return data.map(item => ({
    'No. Reg': item.no_reg,
    'No. Rawat': item.no_rawat,
    'No. RM': item.no_rkm_medis,
    'Nama Pasien': item.pasien?.nm_pasien,
    'Jenis Pasien': item.stts_daftar ? (`Pasien ${item.stts_daftar}`) : '-',
    'JK': item.pasien?.jk,
    'Poliklinik': item.poliklinik?.nm_poli,
    'Dokter': item.dokter?.nm_dokter,
    'Cara Bayar': item.cara_bayar?.png_jawab,
    'Status': item.stts,
    'Alamat': item.pasien?.alamat
  }))
}

const copyToClipboard = async () => {
  const originalLabel = document.activeElement.innerHTML
  const btn = document.activeElement
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading...'
  btn.disabled = true

  try {
      const allData = await fetchAllData()
      const data = formatDataForExport(allData)
      
      if (data.length === 0) {
          alert('Tidak ada data untuk disalin.')
          return
      }

      const headers = Object.keys(data[0])
      const rows = data.map(row => headers.map(header => row[header] || '').join('\t'))
      const tsv = [headers.join('\t'), ...rows].join('\n')

      await navigator.clipboard.writeText(tsv)
      alert(`Berhasil menyalin ${data.length} data ke clipboard! 📋`) 
  } catch (err) {
      console.error('Failed to copy keys: ', err)
      alert('Gagal menyalin data.')
  } finally {
      btn.innerHTML = originalLabel
      btn.disabled = false
  }
}

const exportToExcel = async () => {
  const originalLabel = document.activeElement.innerHTML
  const btn = document.activeElement
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Exporting...'
  btn.disabled = true

  try {
      const allData = await fetchAllData()
      const data = formatDataForExport(allData)

      if (data.length === 0) {
          alert('Tidak ada data untuk diexport.')
          return
      }

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Rawat Jalan")
      
      XLSX.writeFile(wb, `RawatJalan_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`)
  } catch (error) {
      console.error('Export Error:', error)
      alert('Gagal mengexport data Excel.')
  } finally {
      btn.innerHTML = originalLabel
      btn.disabled = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  document.body.style.overflow = 'auto'
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadMasterData()
  fetchData(true)
  
  window.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.page-header h2 {
  font-weight: 700;
  color: #1e293b;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-select {
  background: white;
}

:deep(.vs__dropdown-menu) {
  z-index: 9999 !important;
  max-height: 200px;
}

:deep(.vs__search) {
  font-size: 0.875rem;
  margin: 0;
  padding: 0;
}

:deep(.vs__dropdown-toggle) {
  height: 42px !important;
  min-height: 42px !important;
  border-color: #e2e8f0;
  border-radius: 8px;
  background: white;
  display: flex !important;
  align-items: center !important;
}

:deep(.vs__selected-options) {
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

:deep(.vs__actions) {
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal-content-custom {
  background: white;
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.modal-header-custom {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close-custom {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.btn-close-custom:hover {
  opacity: 1;
}

.modal-body-custom {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.modal-footer-custom {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.table-compact {
  font-size: 0.85rem;
}

.table-compact th {
  padding: 0.65rem 1rem !important;
  font-size: 0.8rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  background-color: #f8fafc !important;
  color: #64748b;
  font-weight: 700;
}

.table-compact td {
  padding: 0.5rem 1rem !important;
}

.table-compact .badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.btn-action-table {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #64748b;
  transition: all 0.2s;
  padding: 0;
}

.btn-action-table:hover {
  background-color: #f1f5f9;
  color: #4f46e5;
  border-color: #c7d2fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-action-table i {
  font-size: 0.85rem;
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: block;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-pills .nav-link {
  color: #64748b;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-pills .nav-link.active {
  background-color: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.animation-fade {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sticky-header-wrapper {
  position: sticky;
  top: -1.5rem;
  background: white;
  z-index: 10;
  padding-bottom: 0.5rem;
  margin-top: -0.5rem;
  padding-top: 1rem;
}

/* Page Header Styles */
.page-title {
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  font-size: 0.875rem;
}

.btn-action-outline {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-action-outline:hover {
  background-color: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-action-success {
  display: flex;
  align-items: center;
  background-color: #10b981;
  border: 1px solid #10b981;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-action-success:hover {
  background-color: #059669;
  border-color: #059669;
}

/* Filter Styles */
.form-control-custom {
  height: 42px !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 0 0.75rem !important;
  font-size: 0.875rem !important;
  transition: all 0.2s !important;
  display: flex !important;
  align-items: center !important;
  background-color: #fff !important;
}

.form-control-custom:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  outline: none !important;
}

.style-chooser-custom :deep(.vs__search) {
  font-size: 0.875rem !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  padding-right: 2.5rem !important;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  pointer-events: none;
}

/* Date input with icon on the right */
.date-input-wrapper {
  position: relative;
}

.date-input {
  padding-right: 2.5rem !important;
  cursor: pointer;
}

/* Hide the native browser calendar icon to use our custom one */
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  pointer-events: none;
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.text-xs {
  font-size: 0.75rem;
}

/* Context Menu */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border-radius: 12px;
  min-width: 220px;
  padding: 6px;
  animation: fadeIn 0.1s ease-out;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
}

.context-menu-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #334155;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 2px;
  position: relative;
}

.context-menu-item:last-child {
  margin-bottom: 0;
}

.context-menu-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.context-menu-item.result-header {
  background-color: transparent;
  padding: 8px 12px 12px 12px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: default;
  color: #1e293b;
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Submenu Styles */
.has-submenu {
  position: relative;
}

.submenu {
  display: none;
  position: absolute;
  top: -6px;
  left: 100%;
  margin-left: -5px;
  background: white;
  min-width: 200px;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  z-index: 10000;
}

.submenu-left {
  left: auto !important;
  right: 100% !important;
  margin-left: 0 !important;
  margin-right: -5px !important;
}

.has-submenu:hover .submenu {
  display: block;
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

/* Success Checkmark Animation */
.success-checkmark {
  width: 80px;
  height: 115px;
  margin: 0 auto;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4CAF50;
}

.success-checkmark .check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.success-checkmark .check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #FFFFFF;
  transform: rotate(-45deg);
}

.success-checkmark .icon-line {
  height: 5px;
  background-color: #4CAF50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, .5);
}

.success-checkmark .icon-fix {
  top: 8px;
  width: 5px;
  height: 85px;
  position: absolute;
  left: 28px;
  transform: rotate(-45deg);
  z-index: 1;
  background-color: #FFFFFF;
}

@keyframes rotate-circle {
  0% {
    transform: rotate(-45deg);
  }
  5% {
    transform: rotate(-45deg);
  }
  12% {
    transform: rotate(-405deg);
  }
  100% {
    transform: rotate(-405deg);
  }
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 46px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

/* Mobile Action Sheet (Bottom Sheet) */
.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.action-sheet-container {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04);
}

.action-sheet-header {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.header-line {
  width: 36px;
  height: 5px;
  background: #cbd5e1;
  border-radius: 10px;
  margin: 0 auto 1rem;
}

.smallest-custom {
  font-size: 0.65rem;
}

.btn-close-sheet {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
}

.btn-close-sheet:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.action-sheet-body {
  overflow-y: auto;
  padding: 1.5rem;
}

/* Action Cards (Grid) */
.action-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-card:hover {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.action-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.action-card-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

/* Action Groups (Lists) */
.action-group-header {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.action-list {
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.action-list-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.action-list-item:last-child {
  border-bottom: none;
}

.action-list-item:hover {
  background: #ffffff;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
}

.item-text {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.item-desc {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
}

.action-btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-outline:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #1e293b;
}

/* Soft Colors */
.bg-primary-soft { background-color: #eff6ff; }
.bg-success-soft { background-color: #f0fdf4; }
.bg-emerald-soft { background-color: #ecfdf5; }
.bg-blue-soft { background-color: #eff6ff; }
.bg-cyan-soft { background-color: #ecfeff; }
.bg-purple-soft { background-color: #faf5ff; }
.bg-slate-soft { background-color: #f8fafc; }
.bg-sky-soft { background-color: #f0f9ff; }
.bg-indigo-soft { background-color: #eef2ff; }
.bg-rose-soft { background-color: #fff1f2; }

.text-emerald-600 { color: #059669; }
.text-cyan-600 { color: #0891b2; }
.text-purple-600 { color: #9333ea; }
.text-slate-600 { color: #475569; }
.text-sky-600 { color: #0284c7; }
.text-indigo-600 { color: #4f46e5; }
.text-rose-600 { color: #e11d48; }

@media (max-width: 768px) {
  .action-sheet-container {
    max-width: 100%;
  }
}

/* Premium Buttons and Inputs for Surat Terbang */
.btn-premium-save {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-premium-save:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(29, 78, 216, 0.3);
  filter: brightness(1.05);
}

.btn-premium-print {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-premium-print:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
  filter: brightness(1.05);
}

.btn-premium-danger {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-premium-danger:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
  filter: brightness(1.05);
}

.btn-premium-secondary {
  padding: 0.6rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.btn-premium-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.form-control-custom:focus, .form-select-custom:focus {
  border-color: #3b82f6 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
  outline: none;
}

.input-group:focus-within .input-group-text {
  border-color: #3b82f6 !important;
  background-color: #eff6ff !important;
  color: #1d4ed8 !important;
}

.input-group:focus-within .form-control-custom {
  border-color: #3b82f6 !important;
}

/* Compact overrides for Surat Terbang modal */
.modal-body-custom .form-control-custom,
.modal-body-custom .form-select-custom,
.modal-body-custom .input-group-text {
  height: 38px !important;
  padding: 0 0.6rem !important;
  border-radius: 8px !important;
  font-size: 0.875rem !important;
  line-height: 1.4 !important;
}

.modal-body-custom .form-label-custom {
  font-size: 0.8rem !important;
  margin-bottom: 4px !important;
  font-weight: 600;
  color: #475569;
  display: block;
}

.modal-footer-custom .btn-premium-save,
.modal-footer-custom .btn-premium-print,
.modal-footer-custom .btn-premium-danger,
.modal-footer-custom .btn-premium-secondary {
  padding: 0.4rem 1rem !important;
  font-size: 0.85rem !important;
  border-radius: 8px !important;
}

/* Print Styles for Surat Terbang */
@media print {
  body * {
    visibility: hidden;
  }
  #print-surat-terbang, #print-surat-terbang * {
    visibility: visible;
  }
  #print-surat-terbang {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white !important;
    color: black !important;
    font-family: 'Times New Roman', Times, serif;
    padding: 20px;
    box-sizing: border-box;
  }
  .modal-overlay, .rawat-jalan-view, .context-menu, .action-sheet-overlay {
    display: none !important;
  }
  
  .print-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background: white;
    color: black;
  }
  
  .text-decoration-underline {
    text-decoration: underline !important;
  }
  
  .border-bottom {
    border-bottom: 2px solid #000 !important;
  }
  
  .border-top {
    border-top: 1px solid #ccc !important;
  }
}
</style>
