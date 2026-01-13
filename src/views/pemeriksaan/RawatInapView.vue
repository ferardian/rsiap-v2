<template>
  <div class="rawat-inap-view">
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">Rawat Inap</h2>
          <p class="text-secondary mb-0">Daftar pasien yang sedang dirawat inap</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary" @click="copyToClipboard" :disabled="items.length === 0">
            <i class="fas fa-copy me-2"></i> Copy
          </button>
          <button class="btn btn-success" @click="exportToExcel" :disabled="items.length === 0">
            <i class="fas fa-file-excel me-2"></i> Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4" style="z-index: 10; position: relative; overflow: visible;">
      <div class="card-body">
        <!-- Row 1: Status & Tanggal -->
        <div class="row g-3 mb-4">
          <div class="col-md-auto" style="min-width: 320px;">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Status Pasien</label>
            <div class="status-switch-wrapper">
              <div class="btn-group w-100 shadow-sm rounded-pill" role="group" style="background: #f1f5f9;">
                <input type="radio" class="btn-check" name="status" id="st_belum" value="belum_pulang" v-model="filters.status" @change="fetchData(true)">
                <label class="btn btn-sm btn-outline-custom" for="st_belum">
                  <i class="fas fa-bed me-1"></i> Belum
                </label>

                <input type="radio" class="btn-check" name="status" id="st_pulang" value="pulang" v-model="filters.status" @change="fetchData(true)">
                <label class="btn btn-sm btn-outline-custom" for="st_pulang">
                  <i class="fas fa-home me-1"></i> Pulang
                </label>
                
                <input type="radio" class="btn-check" name="status" id="st_masuk" value="masuk" v-model="filters.status" @change="fetchData(true)">
                <label class="btn btn-sm btn-outline-custom" for="st_masuk">
                  <i class="fas fa-sign-in-alt me-1"></i> Masuk
                </label>
              </div>
            </div>
          </div>
          
          <template v-if="filters.status !== 'belum_pulang'">
            <div class="col-md-auto">
              <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Awal</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                v-model="filters.tgl_awal"
                @change="fetchData(true)"
              >
            </div>
            <div class="col-md-auto">
              <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Akhir</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                v-model="filters.tgl_akhir"
                @change="fetchData(true)"
              >
            </div>
          </template>
        </div>

        <!-- Row 2: Filters & Search -->
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Spesialis</label>
            <v-select
              v-model="filters.kd_sps"
              :options="spesialisList"
              :reduce="sps => sps.kd_sps"
              label="nm_sps"
              placeholder="Pilih Spesialis"
              class="style-chooser-custom"
              @update:modelValue="fetchData(true)"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Dokter Penanggung Jawab</label>
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
          <div class="col-md-4">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Cari Pasien</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 border-custom rounded-start-lg ps-3">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0 border-custom rounded-end-lg ps-2 form-control-custom-search" 
                v-model="filters.keyword"
                placeholder="No RM / Nama Pasien"
                @keyup.enter="fetchData(true)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm" style="z-index: 1; position: relative;">
      <div class="card-body p-0">
        <div class="table-responsive" style="height: 70vh; overflow-y: auto;" @scroll="handleScroll">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light sticky-top" style="z-index: 10;">
              <tr class="text-sm">
                <th class="px-3 py-2" style="width: 120px">Kamar</th>
                <th class="px-3 py-2">Pasien</th>
                <th class="px-3 py-2 text-center" style="width: 80px">Lama</th>
                <th class="px-3 py-2">Diagnosa Awal</th>
                <th class="px-3 py-2">Jenis Bayar</th>
                <th class="px-3 py-2">DPJP (Dokter)</th>
                <th class="px-3 py-2">Bangsal</th>
                <th class="px-3 py-2">Penanggung Jawab</th>
                <th class="px-3 py-2 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && items.length === 0">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-bed fa-2x mb-2 d-block opacity-50"></i>
                  Tidak ada pasien rawat inap yang sesuai
                </td>
              </tr>
              <tr 
                v-else 
                v-for="item in items" 
                :key="item.no_rawat" 
                class="text-sm cursor-pointer"
                @contextmenu.prevent="showContextMenu($event, item)"
              >
                <td class="px-3 py-2">
                  <div class="fw-bold text-primary" style="font-size: 0.85rem;">{{ item.kamar?.kd_kamar }}</div>
                  <div class="small text-muted" style="font-size: 0.75rem;">{{ item.no_rawat }}</div>
                </td>
                <td class="px-3 py-2">
                  <div class="fw-semibold">{{ item.reg_periksa?.pasien?.nm_pasien }}</div>
                  <div class="small text-muted" style="font-size: 0.75rem;">
                    {{ item.reg_periksa?.no_rkm_medis }} 
                    <span class="mx-1">•</span> 
                    {{ item.reg_periksa?.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </div>
                  
                  <!-- Bayi Gabung Info -->
                  <div v-if="item.ranap_gabung && item.ranap_gabung.length > 0" class="mt-1 pt-1 border-top border-light">
                    <div v-for="bayi in item.ranap_gabung" :key="bayi.no_rawat2" class="d-flex align-items-center mb-1">
                       <i class="fas fa-baby text-pink-500 me-2" title="Bayi Gabung" style="font-size: 0.8rem;"></i>
                       <div>
                         <div class="small fw-medium text-dark" style="font-size: 0.8rem;">{{ bayi.reg_periksa2?.pasien?.nm_pasien || bayi.reg_periksa2?.nm_pasien }}</div>
                         <div class="small text-muted" style="font-size: 0.7rem;">
                            {{ bayi.reg_periksa2?.no_rkm_medis }} • {{ bayi.reg_periksa2?.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                         </div>
                       </div>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-2 text-center">
                    <span class="badge bg-light text-dark border">{{ calculateLamaInap(item.reg_periksa?.tgl_registrasi) }} Hari</span>
                </td>
                <td class="px-3 py-2">
                  <div class="small text-dark">{{ item.diagnosa_awal || '-' }}</div>
                </td>
                <td class="px-3 py-2">
                  <div class="d-flex align-items-center">
                    <span 
                      class="badge border me-1"
                      style="font-size: 0.7rem;"
                      :class="[
                        item.sep_simple ? 'bg-success-subtle text-success border-success-subtle' : '',
                        !item.sep_simple && !item.png_jawab?.toLowerCase().includes('umum') ? 'bg-danger-subtle text-danger border-danger-subtle' : '',
                        !item.sep_simple && item.png_jawab?.toLowerCase().includes('umum') ? 'bg-light text-dark border-light-subtle' : ''
                      ]"
                    >
                      {{ item.png_jawab }}
                    </span>
                    <i v-if="item.sep_simple" class="fas fa-check-circle text-success" title="SEP Terbit"></i>
                    <i v-else-if="!item.png_jawab?.toLowerCase().includes('umum')" class="fas fa-times-circle text-danger" title="SEP Belum Terbit"></i>
                  </div>
                </td>
                <td class="px-3 py-2">
                  {{ item.reg_periksa?.dokter?.nm_dokter }}
                </td>
                <td class="px-3 py-2">
                  {{ item.kamar?.bangsal?.nm_bangsal }}
                </td>
                <td class="px-3 py-2">
                   <div class="text-truncate" style="max-width: 150px;">{{ item.reg_periksa?.p_jawab }}</div>
                   <div class="small text-muted text-truncate" style="max-width: 150px;">{{ item.reg_periksa?.hubunganpj }}</div>
                </td>
                <td class="px-3 py-2 text-end">
                  <button class="btn btn-sm btn-light border" title="Lihat Detail" @click="openModal(item)">
                    <i class="fas fa-eye text-secondary"></i>
                  </button>
                </td>
              </tr>
              <!-- Loading Indicator for Infinite Scroll -->
              <tr v-if="loading && items.length > 0">
                <td colspan="8" class="text-center py-2">
                  <div class="spinner-border spinner-border-sm text-secondary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Info Footer -->
      <div class="card-footer bg-white py-2 border-top-0">
        <small class="text-muted" v-if="pagination.total">
           Total Data: <span class="fw-bold">{{ pagination.total }}</span> Pasien
        </small>
        <small class="text-muted" v-else>
           Belum ada data
        </small>
      </div>
    </div>

    <!-- Detail Modal (Reuse Structure from RawatJalan but adapted) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5 class="mb-0 text-white">
            <i class="fas fa-procedures me-2"></i>
            Detail Pasien Inap
          </h5>
          <button type="button" class="btn-close-custom" @click="closeModal">×</button>
        </div>
        <div class="modal-body-custom" v-if="selectedItem">
          <!-- Sticky Header Wrapper -->
          <div class="sticky-header-wrapper">
            <!-- Patient Header (Always Visible) -->
             <div class="d-flex align-items-center mb-3 pb-2 border-bottom bg-white pt-2">
              <div class="avatar-circle me-3" style="width: 40px; height: 40px; min-width: 40px;">
                <span class="text-white fw-bold fs-5">{{ selectedItem.reg_periksa?.pasien?.nm_pasien?.charAt(0) }}</span>
              </div>
              <div>
                <h6 class="mb-0 fw-bold">{{ selectedItem.reg_periksa?.pasien?.nm_pasien }}</h6>
                <p class="mb-0 text-muted small" style="font-size: 0.8rem;">
                  {{ selectedItem.reg_periksa?.no_rkm_medis }} • {{ selectedItem.no_rawat }}
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
                      <div class="detail-value fw-bold text-primary">{{ selectedItem.reg_periksa?.no_rkm_medis }}</div>
                    </div>
                     <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">Nama Lengkap</label>
                      <div class="detail-value text-dark fw-medium">{{ selectedItem.reg_periksa?.pasien?.nm_pasien }}</div>
                    </div>
                     <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">Tanggal Lahir</label>
                      <div class="detail-value text-dark">{{ selectedItem.reg_periksa?.pasien?.tgl_lahir }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="detail-label text-muted mb-1">Alamat</label>
                      <div class="detail-value text-dark">{{ selectedItem.reg_periksa?.pasien?.alamat }}</div>
                    </div>
                   </div>
                </div>
              </div>
            </div>

             <!-- Section: Informasi Rawat Inap -->
            <div class="col-12">
               <div class="d-flex align-items-center mb-3">
                <div class="icon-square bg-purple-100 text-purple-600 me-2">
                  <i class="fas fa-hospital-user"></i>
                </div>
                <h6 class="fw-bold mb-0 text-dark">Informasi Rawat Inap</h6>
              </div>
              <div class="card border-0 shadow-sm bg-light">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Kamar / Bed</label>
                        <div class="detail-value fw-bold text-dark">{{ selectedItem.kamar?.kd_kamar }}</div>
                    </div>
                    <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Bangsal</label>
                        <div class="detail-value text-dark">{{ selectedItem.kamar?.bangsal?.nm_bangsal }}</div>
                    </div>
                     <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Tarif Kamar</label>
                        <div class="detail-value text-dark">{{ formatCurrency(selectedItem.kamar?.trf_kamar) }}</div>
                    </div>
                     <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Tanggal Masuk</label>
                        <div class="detail-value text-dark">{{ selectedItem.tgl_masuk }} {{ selectedItem.jam_masuk }}</div>
                    </div>
                     <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Dokter Penanggung Jawab</label>
                        <div class="detail-value text-primary fw-medium">{{ selectedItem.reg_periksa?.dokter?.nm_dokter }}</div>
                    </div>
                     <div class="col-md-6">
                        <label class="detail-label text-muted mb-1">Diagnosa Awal</label>
                        <div class="detail-value text-dark">{{ selectedItem.diagnosa_awal || '-' }}</div>
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
               <template v-for="(rme, index) in rmeData" :key="index">
                 <!-- Header with Date & Staff -->
                  <div class="col-12">
                     <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded border">
                        <div>
                           <span class="badge bg-primary me-2">{{ rme.tgl_perawatan }} {{ rme.jam_rawat }}</span>
                           <span class="text-muted small"><i class="fas fa-user-md me-1"></i> {{ rme.petugas?.nama || '-' }}</span>
                        </div>
                     </div>
                  </div>

                 <!-- Vital Signs Card -->
                 <div class="col-12 mt-2">
                   <div class="card bg-blue-50 border-0 shadow-sm">
                     <div class="card-body">
                       <h6 class="fw-bold text-blue-700 mb-3"><i class="fas fa-heartbeat me-2"></i>Tanda Vital</h6>
                       <div class="row g-3 text-center">
                         <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Tensi</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.tensi || '-' }}</span> <small>mmHg</small>
                         </div>
                         <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Nadi</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.nadi || '-' }}</span> <small>x/mnt</small>
                         </div>
                         <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Suhu</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.suhu_tubuh || '-' }}</span> <small>°C</small>
                         </div>
                         <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Respirasi</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.respirasi || '-' }}</span> <small>x/mnt</small>
                         </div>
                          <div class="col-6 col-md-2 border-end border-primary border-opacity-10">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Tinggi</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.tinggi || '-' }}</span> <small>cm</small>
                         </div>
                         <div class="col-6 col-md-2">
                           <small class="text-muted d-block uppercase tracking-wider" style="font-size:0.7rem">Berat</small>
                           <span class="fw-bold fs-5 text-dark">{{ rme.berat || '-' }}</span> <small>kg</small>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
 
                 <!-- SOAP Content -->
                 <div class="col-12 mt-2 border-bottom pb-4">
                   <div class="card border-0 shadow-sm">
                     <div class="card-body p-0">
                       <!-- Subjective -->
                       <div class="p-4 border-bottom">
                         <div class="d-flex mb-2">
                            <div class="icon-square bg-yellow-100 text-yellow-600 me-3">S</div>
                            <h6 class="fw-bold mb-0 align-self-center">Subjektif (Keluhan)</h6>
                         </div>
                         <p class="mb-0 text-dark ms-5 ps-2">{{ rme.keluhan || '-' }}</p>
                       </div>
 
                        <!-- Objective -->
                       <div class="p-4 border-bottom">
                         <div class="d-flex mb-2">
                            <div class="icon-square bg-green-100 text-green-600 me-3">O</div>
                            <h6 class="fw-bold mb-0 align-self-center">Objektif (Pemeriksaan)</h6>
                         </div>
                         <p class="mb-0 text-dark ms-5 ps-2">{{ rme.pemeriksaan || '-' }}</p>
                       </div>
 
                        <!-- Assessment -->
                       <div class="p-4 border-bottom">
                          <div class="d-flex mb-2">
                            <div class="icon-square bg-blue-100 text-blue-600 me-3">A</div>
                            <h6 class="fw-bold mb-0 align-self-center">Asesmen (Penilaian)</h6>
                         </div>
                         <p class="mb-0 text-dark ms-5 ps-2">{{ rme.penilaian || '-' }}</p>
                       </div>
 
                        <!-- Plan -->
                       <div class="p-4">
                          <div class="d-flex mb-2">
                            <div class="icon-square bg-purple-100 text-purple-600 me-3">P</div>
                            <h6 class="fw-bold mb-0 align-self-center">Plan (Instruksi/RTL)</h6>
                         </div>
                         <div class="ms-5 ps-2">
                            <p class="mb-2 text-dark"><strong>Instruksi:</strong> {{ rme.instruksi || '-' }}</p>
                            <p class="mb-0 text-dark"><strong>RTL:</strong> {{ rme.rtl || '-' }}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </template>
             </div>    
 
              <!-- Penunjang Section -->

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
               <!-- Grand Total Card -->
               <div class="card bg-primary text-white border-0 shadow-sm mb-4">
                  <div class="card-body d-flex justify-content-between align-items-center p-3">
                     <div>
                        <h6 class="mb-0 opacity-75">Estimasi Total Biaya</h6>
                        <small class="opacity-50 text-xs">Belum termasuk retur/potongan lain</small>
                     </div>
                     <h3 class="fw-bold mb-0">{{ formatCurrency(grandTotal) }}</h3>
                  </div>
               </div>


               <!-- Mother Total Card -->
               <div v-if="billingGabung && billingGabung.length > 0" class="card bg-success text-white border-0 shadow-sm mb-4">
                  <div class="card-body d-flex justify-content-between align-items-center p-3">
                     <div>
                        <h6 class="mb-0 opacity-90"><i class="fas fa-user-injured me-2"></i>Tagihan Pasien: {{ selectedItem?.reg_periksa?.pasien?.nm_pasien }}</h6>
                        <small class="opacity-75 text-xs">{{ selectedItem?.reg_periksa?.no_rawat }}</small>
                     </div>
                     <h3 class="fw-bold mb-0">{{ formatCurrency(Object.values(billingData).reduce((acc, items) => acc + calculateCategoryTotal(items), 0)) }}</h3>
                  </div>
               </div>

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
                            <th class="text-end pe-4" width="150">Biaya</th>
                         </tr>
                       </thead>
                       <tbody>
                          <template v-for="(subItems, key) in items" :key="key">
                             <!-- Simple Item -->
                             <tr v-if="subItems.biaya_rawat || subItems.total || subItems[0]?.biaya_rawat || subItems[0]?.total">
                                <td class="ps-4">
                                  {{ key }} 
                                  <span v-if="Array.isArray(subItems) && subItems.length > 1" class="badge bg-secondary rounded-pill ms-2">{{ subItems.length }}x</span>
                                </td>
                                <td class="text-end pe-4 fw-medium">
                                  {{ formatCurrency(Array.isArray(subItems) ? subItems.reduce((sum, i) => sum + parseFloat(i.biaya_rawat || i.total || 0), 0) : (subItems.biaya_rawat || subItems.total)) }}
                                </td>
                             </tr>
                             
                             <!-- Nested Group -->
                             <tr v-else-if="Array.isArray(subItems)">
                                <td colspan="2" class="p-0">
                                   <div class="d-flex justify-content-between px-4 py-2 border-bottom border-light">
                                      <span>{{ key }} <small class="text-muted ms-1" v-if="subItems.length > 1">({{ subItems.length }}x)</small></span>
                                      <span class="fw-medium">{{ formatCurrency(subItems.reduce((sum, i) => sum + parseFloat(i.biaya_rawat || i.totalbiaya || i.total || 0), 0)) }}</span>
                                   </div>
                                </td>
                             </tr>
                          </template>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
             </div>
          </div>
         <template v-if="billingGabung && billingGabung.length > 0">
           <div v-for="(bayi, idx) in billingGabung" :key="idx" class="mt-4 pt-4 border-top border-4">
              <!-- Bayi Header & Total -->
              <div class="card bg-info text-white border-0 shadow-sm mb-4">
                 <div class="card-body d-flex justify-content-between align-items-center p-3">
                    <div>
                       <h6 class="mb-0 opacity-90"><i class="fas fa-baby me-2"></i>Tagihan Bayi: {{ bayi.nama }}</h6>
                       <small class="opacity-75 text-xs">{{ bayi.no_rawat }}</small>
                    </div>
                    <h3 class="fw-bold mb-0">{{ formatCurrency(Object.values(bayi.billing).reduce((acc, cat) => acc + calculateCategoryTotal(cat), 0)) }}</h3>
                 </div>
              </div>

              <!-- Bayi Billing Details -->
              <div v-for="(items, category) in bayi.billing" :key="category" class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-info text-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <h6 class="fw-bold mb-0 text-white">{{ category }}</h6>
                  <span class="badge bg-white text-info rounded-pill">{{ formatCurrency(calculateCategoryTotal(items)) }}</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead class="bg-light">
                        <tr>
                           <th class="ps-4">Item Transaksi</th>
                           <th class="text-end pe-4" width="150">Biaya</th>
                        </tr>
                      </thead>
                      <tbody>
                         <template v-for="(subItems, key) in items" :key="key">
                            <!-- Simple Item -->
                            <tr v-if="subItems.biaya_rawat || subItems.total || subItems[0]?.biaya_rawat || subItems[0]?.total">
                               <td class="ps-4">
                                 {{ key }} 
                                 <span v-if="Array.isArray(subItems) && subItems.length > 1" class="badge bg-secondary rounded-pill ms-2">{{ subItems.length }}x</span>
                               </td>
                               <td class="text-end pe-4 fw-medium">
                                 {{ formatCurrency(Array.isArray(subItems) ? subItems.reduce((sum, i) => sum + parseFloat(i.biaya_rawat || i.total || 0), 0) : (subItems.biaya_rawat || subItems.total)) }}
                               </td>
                            </tr>
                            
                            <!-- Nested Group -->
                            <tr v-else-if="Array.isArray(subItems)">
                               <td colspan="2" class="p-0">
                                  <div class="d-flex justify-content-between px-4 py-2 border-bottom border-light">
                                     <span>{{ key }} <small class="text-muted ms-1" v-if="subItems.length > 1">({{ subItems.length }}x)</small></span>
                                     <span class="fw-medium">{{ formatCurrency(subItems.reduce((sum, i) => sum + parseFloat(i.biaya_rawat || i.totalbiaya || i.total || 0), 0)) }}</span>
                                  </div>
                               </td>
                            </tr>
                         </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
           </div>
         </template>
       </div>
         <div class="modal-footer-custom">
        </div>
      </div>
    </div>
    
    <!-- Modal Booking Operasi -->
    <div v-if="showBookingOperasiModal" class="modal-overlay" @click.self="closeBookingOperasiModal">
      <div class="modal-content-custom" style="max-width: 600px; height: 100vh; border-radius: 0;">
         <div class="modal-header-custom bg-danger">
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

    <!-- Diet Pasien Modal -->
    <div v-if="showDietModal" class="modal-overlay" @click.self="closeDietModal">
      <div class="modal-content-custom" style="max-width: 600px;">
        <div class="modal-header-custom bg-success text-white">
          <h5 class="mb-0">
            <i class="fas fa-utensils me-2"></i> Permintaan Diet Pasien
            <span v-if="isEditingDiet" class="badge bg-warning text-dark ms-2">
              <i class="fas fa-edit me-1"></i> Edit
            </span>
            <span v-else class="badge bg-light text-success ms-2">
              <i class="fas fa-plus me-1"></i> Baru
            </span>
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeDietModal"></button>
        </div>

        <form @submit.prevent="submitDiet">
          <div class="modal-body-custom">
            <!-- No Rawat (Read-only) -->
            <div class="mb-3">
              <label class="form-label fw-bold">No. Rawat</label>
              <input type="text" class="form-control" v-model="dietForm.no_rawat" readonly>
            </div>

            <!-- Tanggal -->
            <div class="mb-3">
              <label class="form-label fw-bold">Tanggal <span class="text-danger">*</span></label>
              <input type="date" class="form-control" v-model="dietForm.tanggal" required>
            </div>

            <!-- Meal Times -->
            <div class="card mb-3">
              <div class="card-body">
                <h6 class="card-title mb-3">Waktu Makan</h6>
                
                <!-- Pagi -->
                <div class="mb-3">
                  <label class="form-label">Pagi</label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="pagi" id="pagi-ya" value="Ya" v-model="dietForm.pagi">
                    <label class="btn btn-outline-success" for="pagi-ya">Ya</label>
                    
                    <input type="radio" class="btn-check" name="pagi" id="pagi-puasa" value="Puasa" v-model="dietForm.pagi">
                    <label class="btn btn-outline-warning" for="pagi-puasa">Puasa</label>
                    
                    <input type="radio" class="btn-check" name="pagi" id="pagi-pulang" value="Pulang" v-model="dietForm.pagi">
                    <label class="btn btn-outline-info" for="pagi-pulang">Pulang</label>
                    
                    <input type="radio" class="btn-check" name="pagi" id="pagi-none" value="-" v-model="dietForm.pagi">
                    <label class="btn btn-outline-secondary" for="pagi-none">-</label>
                  </div>
                </div>

                <!-- Siang -->
                <div class="mb-3">
                  <label class="form-label">Siang</label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="siang" id="siang-ya" value="Ya" v-model="dietForm.siang">
                    <label class="btn btn-outline-success" for="siang-ya">Ya</label>
                    
                    <input type="radio" class="btn-check" name="siang" id="siang-puasa" value="Puasa" v-model="dietForm.siang">
                    <label class="btn btn-outline-warning" for="siang-puasa">Puasa</label>
                    
                    <input type="radio" class="btn-check" name="siang" id="siang-pulang" value="Pulang" v-model="dietForm.siang">
                    <label class="btn btn-outline-info" for="siang-pulang">Pulang</label>
                    
                    <input type="radio" class="btn-check" name="siang" id="siang-none" value="-" v-model="dietForm.siang">
                    <label class="btn btn-outline-secondary" for="siang-none">-</label>
                  </div>
                </div>

                <!-- Sore -->
                <div class="mb-0">
                  <label class="form-label">Sore</label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="sore" id="sore-ya" value="Ya" v-model="dietForm.sore">
                    <label class="btn btn-outline-success" for="sore-ya">Ya</label>
                    
                    <input type="radio" class="btn-check" name="sore" id="sore-puasa" value="Puasa" v-model="dietForm.sore">
                    <label class="btn btn-outline-warning" for="sore-puasa">Puasa</label>
                    
                    <input type="radio" class="btn-check" name="sore" id="sore-pulang" value="Pulang" v-model="dietForm.sore">
                    <label class="btn btn-outline-info" for="sore-pulang">Pulang</label>
                    
                    <input type="radio" class="btn-check" name="sore" id="sore-none" value="-" v-model="dietForm.sore">
                    <label class="btn btn-outline-secondary" for="sore-none">-</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Permintaan Khusus -->
            <div class="mb-3">
              <label class="form-label fw-bold">Permintaan Khusus</label>
              <textarea 
                class="form-control" 
                v-model="dietForm.permintaan_khusus" 
                rows="3"
                placeholder="Contoh: Diet rendah garam, alergi seafood, dll..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer-custom bg-white border-top">
            <div class="d-flex gap-2 w-100">
              <button type="button" class="btn btn-light w-50" @click="closeDietModal">Batal</button>
              <button type="submit" class="btn btn-success w-50" :disabled="isSavingDiet">
                <span v-if="isSavingDiet" class="spinner-border spinner-border-sm me-1"></span>
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Bulk Diet Entry Modal -->
    <div v-if="showBulkDietModal" class="modal-overlay" @click.self="closeBulkDietModal">
      <div class="modal-content-custom" style="max-width: 1200px; height: 95vh; display: flex; flex-direction: column;">
        <div class="modal-header-custom bg-success text-white">
          <h5 class="mb-0">
            <i class="fas fa-table me-2"></i> Permintaan Diet Pasien (Bulk Entry)
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeBulkDietModal"></button>
        </div>

        <div class="modal-body-custom" style="flex: 1 !important; overflow: hidden !important; padding: 0.75rem !important; display: flex !important; flex-direction: column !important; gap: 0.75rem;">
          <!-- Date Selection -->
          <div class="row mb-0" style="flex-shrink: 0;">
            <div class="col-md-3">
              <label class="form-label fw-bold">Tanggal <span class="text-danger">*</span></label>
              <input 
                type="date" 
                class="form-control" 
                v-model="bulkDietDate"
                @change="loadBulkPatients"
              >
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Spesialis</label>
              <select class="form-select" v-model="bulkDietSpesialis" @change="loadBulkPatients">
                <option :value="null">Semua Spesialis</option>
                <option v-for="sps in spesialisList" :key="sps.kd_sps" :value="sps.kd_sps">
                  {{ sps.nm_sps }}
                </option>
              </select>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button 
                class="btn btn-primary" 
                @click="loadBulkPatients"
                :disabled="isLoadingBulkPatients"
              >
                <span v-if="isLoadingBulkPatients" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-sync me-1"></i>
                Load Data
              </button>
              <span class="ms-3 text-muted" v-if="bulkDietRows.length > 0">
                {{ bulkDietRows.length }} pasien
              </span>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingBulkPatients" class="text-center py-5" style="flex: 1;">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Memuat data pasien...</p>
          </div>

          <!-- Patient Table -->
          <div v-else-if="bulkDietRows.length > 0" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
            <div class="table-responsive" style="flex: 1; overflow-y: auto;">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-light" style="position: sticky; top: 0; z-index: 10;">
                  <tr>
                    <th style="width: 150px;">No. Rawat</th>
                    <th style="width: 200px;">Nama Pasien</th>
                    <th style="width: 100px;">Kamar</th>
                    <th style="width: 120px;">Pagi</th>
                    <th style="width: 120px;">Siang</th>
                    <th style="width: 120px;">Sore</th>
                    <th>Permintaan Khusus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(row, index) in bulkDietRows" 
                    :key="row.no_rawat"
                    :class="{ 
                      'table-success': row.hasExisting && !row.isDisabled,
                      'table-secondary': row.isDisabled
                    }"
                  >
                    <td class="small">{{ row.no_rawat }}</td>
                    <td class="small">
                      {{ row.nm_pasien }}
                      <span 
                        v-if="row.isDisabled" 
                        class="badge bg-warning text-dark ms-1 cursor-pointer" 
                        title="Klik untuk isi skrining gizi"
                        @click="openSkriningGiziModal(row)"
                        style="cursor: pointer;"
                      >
                        <i class="fas fa-exclamation-triangle"></i> Skrining Gizi
                      </span>
                    </td>
                    <td class="small">{{ row.kamar }}</td>
                    <td>
                      <select 
                        class="form-select form-select-sm" 
                        v-model="row.pagi"
                        :disabled="row.isDisabled"
                      >
                        <option v-for="opt in mealOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        class="form-select form-select-sm" 
                        v-model="row.siang"
                        :disabled="row.isDisabled"
                      >
                        <option v-for="opt in mealOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        class="form-select form-select-sm" 
                        v-model="row.sore"
                        :disabled="row.isDisabled"
                      >
                        <option v-for="opt in mealOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        v-model="row.permintaan_khusus"
                        placeholder="Catatan khusus..."
                        :disabled="row.isDisabled"
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Legend inside table container -->
            <div class="px-2 py-1" style="flex-shrink: 0; background: #f8f9fa;">
              <small class="text-muted">
                <span class="badge bg-success me-2">Hijau</span> = Data sudah ada
                <span class="ms-2"></span>
                <span class="badge bg-secondary me-2">Abu-abu</span> = Belum skrining gizi
              </small>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5" style="flex: 1;">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p class="text-muted">Pilih tanggal dan klik "Load Data" untuk memuat pasien</p>
          </div>
        </div>

        <div class="modal-footer-custom bg-white border-top" style="flex-shrink: 0;">
          <div class="d-flex gap-2 w-100">
            <button type="button" class="btn btn-light" @click="closeBulkDietModal">Batal</button>
            <button 
              type="button" 
              class="btn btn-success flex-grow-1" 
              @click="saveBulkDiet"
              :disabled="isSavingBulkDiet || bulkDietRows.length === 0"
            >
              <span v-if="isSavingBulkDiet" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-save me-1"></i>
              Simpan Semua
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Skrining Gizi Modal -->
    <!-- Skrining Gizi Modal (Refactored) -->
    <FormSkriningGizi 
      v-if="showSkriningGiziModal"
      :visible="showSkriningGiziModal"
      :initial-data="skriningGiziData"
      :is-saving="isSavingSkriningGizi"
      @close="closeSkriningGiziModal"
      @save="handleSaveSkriningGizi"
    />

    <!-- Context Menu -->
    <!-- Context Menu -->
    <div 
      v-if="contextMenu.visible" 
      class="context-menu shadow-sm"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
    >
      <div class="context-menu-item result-header text-muted border-bottom">
        {{ contextMenu.item?.reg_periksa?.pasien?.nm_pasien }}
      </div>
      
      <div class="context-menu-item" @click="handleContextAction('detail')">
        <i class="fas fa-eye me-2 text-primary"></i> Lihat Detail
      </div>
      
      <div class="context-menu-item" @click="handleContextAction('billing')">
        <i class="fas fa-file-invoice-dollar me-2 text-success"></i> Billing
      </div>

      <!-- ERM Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <i class="fas fa-file-medical me-2 text-info"></i> ERM
        <i class="fas fa-chevron-right ms-auto small text-muted" style="font-size: 0.7rem;"></i>
        
        <div class="submenu shadow-sm">
           <div class="context-menu-item" @click.stop="handleContextAction('soap')">
             <i class="fas fa-notes-medical me-2 text-primary"></i> SOAP
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('asesmen')">
             <i class="fas fa-user-md me-2 text-purple-600"></i> Asesmen Medis
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('resume')">
             <i class="fas fa-file-alt me-2 text-gray-600"></i> Resume
           </div>
        </div>
      </div>

      <!-- Permintaan Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <i class="fas fa-hand-holding-medical me-2 text-warning"></i> Permintaan
        <i class="fas fa-chevron-right ms-auto small text-muted" style="font-size: 0.7rem;"></i>
        
        <div class="submenu shadow-sm">
           <div class="context-menu-item" @click.stop="handleContextAction('req-operasi')">
             <i class="fas fa-procedures me-2 text-danger"></i> Jadwal Operasi
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('req-lab')">
             <i class="fas fa-flask me-2 text-info"></i> Pemeriksaan Lab
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('req-rad')">
             <i class="fas fa-x-ray me-2 text-dark"></i> Pemeriksaan Radiologi
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('diet-pasien')">
             <i class="fas fa-utensils me-2 text-success"></i> Diet Pasien
           </div>
           <div class="context-menu-item" @click.stop="handleContextAction('diet-pasien-bulk')">
             <i class="fas fa-table me-2 text-success"></i> Diet Pasien Bulk
           </div>
        </div>
      </div>

      <div class="border-top my-1"></div>

      <div class="context-menu-item" @click="handleContextAction('copy_rawat')">
        <i class="fas fa-copy me-2 text-secondary"></i> Salin No. Rawat
      </div>
      <div class="context-menu-item" @click="handleContextAction('copy_rm')">
        <i class="fas fa-id-card me-2 text-secondary"></i> Salin No. RM
      </div>
      
      <div class="border-top my-1"></div>
      
       <div class="context-menu-item text-danger" @click="closeContextMenu">
        <i class="fas fa-times me-2"></i> Tutup
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
import { ref, onMounted, onUnmounted, reactive, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'
import rawatInapService from '@/services/rawatInapService'
import operasiService from '@/services/operasiService'
import dietService from '@/services/dietService'
import skriningGiziService from '@/services/skriningGiziService'
import FormSkriningGizi from '@/components/pemeriksaan/FormSkriningGizi.vue'

// Skrining Gizi Integration
const showSkriningGiziModal = ref(false)
const isSavingSkriningGizi = ref(false)
const skriningGiziData = ref({})

const openSkriningGiziModal = async (row) => {
  // Logic: try to check if data exists? 
  // For now simple pass row data, component will act as Create mode (empty fields)
  // unless we fetch data. 
  // Let's keep it simple as per legacy behavior: Open empty form.
  
  skriningGiziData.value = {
      no_rawat: row.no_rawat,
      nm_pasien: row.nm_pasien
  }
  
  // Optionally fetch existing data to allow Edit
  try {
     const res = await skriningGiziService.getByNoRawat(row.no_rawat)
     if (res.data && res.data.data) {
         skriningGiziData.value = { ...res.data.data, nm_pasien: row.nm_pasien }
     }
  } catch(e) {
      // Ignore if not found, it means new data
  }

  showSkriningGiziModal.value = true
}

const closeSkriningGiziModal = () => {
  showSkriningGiziModal.value = false
  skriningGiziData.value = {}
}

const handleSaveSkriningGizi = async (formData) => {
  isSavingSkriningGizi.value = true
  try {
    const payload = { ...formData }
    
    // Serialize Checkboxes
    if (Array.isArray(payload.obgyn_q2)) {
         let obgyn_list = [...payload.obgyn_q2]
         if (payload.obgyn_q2_lainnya && obgyn_list.includes('Lainnya')) {
             if (payload.obgyn_q2_lainnya) obgyn_list.push(payload.obgyn_q2_lainnya)
         }
         payload.cb_obgyn = obgyn_list.join(',')
    }
    
    payload.cb_anak1 = (payload.anak_q3 || []).join(',')
    payload.cb_anak2 = (payload.anak_q4 || []).join(',')
    
    // Serialize Questions JSON
    // Note: ensure mapping matches FormSkriningGizi parsing logic
    payload.q_obgyn = JSON.stringify([payload.obgyn_q1, payload.obgyn_q3, payload.obgyn_q4]) 
    payload.q_anak = JSON.stringify([payload.anak_q1, payload.anak_q2])

    const response = await skriningGiziService.save(payload)
    
    if (response.data.success || response.status === 200) {
        toast.success('Berhasil menyimpan data skrining gizi')
        closeSkriningGiziModal()
        // Refresh bulk patients to update status
        if (typeof loadBulkPatients === 'function') {
            loadBulkPatients()
        }
    }
  } catch (error) {
    console.error('Save error:', error)
    toast.error('Gagal menyimpan: ' + (error.response?.data?.message || error.message))
  } finally {
    isSavingSkriningGizi.value = false
  }
}
import * as XLSX from 'xlsx'

const toast = useToast()

// Context Menu State
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null
})

const showContextMenu = (e, item) => {
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  
  // Adjust if menu goes off screen (bottom/right)
  const menuHeight = 250 // Approx
  const menuWidth = 200
  if (window.innerHeight - e.clientY < menuHeight) {
    contextMenu.y = e.clientY - menuHeight
  }
  if (window.innerWidth - e.clientX < menuWidth) {
    contextMenu.x = e.clientX - menuWidth
  }
  
  contextMenu.item = item
}

const closeContextMenu = () => {
  contextMenu.visible = false
  contextMenu.item = null
}

const handleContextAction = async (action) => {
  if (!contextMenu.item) return
  
  const item = contextMenu.item
  
  switch (action) {
    case 'detail':
      openModal(item)
      break
    case 'billing':
      openModal(item)
      activeTab.value = 'billing'
      fetchBilling()
      break
    case 'soap':
    case 'asesmen':
    case 'resume':
      openModal(item)
      activeTab.value = 'rme'
      fetchRme()
      fetchPenunjang()
      // Future: Implement scrolling to specific section
      break
    case 'req-operasi':
       openBookingOperasiModal(item)
       break
    case 'diet-pasien':
       openDietModal(item)
       break
    case 'diet-pasien-bulk':
       openBulkDietModal()
       break
    case 'req-lab':
    case 'req-rad':
       alert('Fitur Permintaan ini belum terhubung ke API.')
       break
    case 'copy_rawat':
      try {
        await navigator.clipboard.writeText(item.no_rawat)
        alert('No. Rawat berhasil disalin!')
      } catch (e) { 
        console.error('Failed to copy No. Rawat:', e)
        alert('Gagal menyalin No. Rawat.')
      }
      break
    case 'copy_rm':
       try {
        await navigator.clipboard.writeText(item.reg_periksa?.no_rkm_medis)
        alert('No. RM berhasil disalin!')
      } catch (e) { 
        console.error('Failed to copy No. RM:', e)
        alert('Gagal menyalin No. RM.')
      }
      break
  }
  closeContextMenu()
}

// Window listener to close menu
const onWindowClick = (e) => {
  if (contextMenu.visible) {
    closeContextMenu()
  }
}

// Utility: Simple Debounce
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Utility: Format Currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

// State
const loading = ref(false)
const items = ref([])
const spesialisList = ref([])
const dokterList = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})
const hasMore = ref(true)

// RME & Billing State
const rmeData = ref(null)
const billingData = ref(null)
const billingGabung = ref([])
const penunjangData = ref(null)
const isLoadingRme = ref(false)
const isLoadingBilling = ref(false)
const rmeError = ref(null)
const billingError = ref(null)

// Booking Operasi State
const showBookingOperasiModal = ref(false)
const isLoadingPaket = ref(false)
const isSubmittingBooking = ref(false)
const paketOperasiList = ref([])
const showBookingSuccessModal = ref(false)
const showBookingErrorModal = ref(false)
const bookingMessage = ref('')

const bookingForm = reactive({
  no_rawat: '',
  no_rkm_medis: '',
  nm_pasien: '',
  kode_paket: null,
  tanggal: new Date().toISOString().split('T')[0],
  jam_mulai: '08:00',
  jam_selesai: '09:00',
  status: 'Menunggu',
  kd_dokter: null,
  diagnosa: ''
})

// Diet Pasien State
const showDietModal = ref(false)
const isSavingDiet = ref(false)
const isEditingDiet = ref(false)

const dietForm = reactive({
  no_rawat: '',
  tanggal: new Date().toISOString().split('T')[0],
  pagi: '-',
  siang: '-',
  sore: '-',
  permintaan_khusus: ''
})

const mealOptions = ['Ya', 'Puasa', 'Pulang', '-']

// Bulk Diet Entry State
const showBulkDietModal = ref(false)
const isSavingBulkDiet = ref(false)
const isLoadingBulkPatients = ref(false)
const bulkDietDate = ref(new Date().toISOString().split('T')[0])
const bulkDietSpesialis = ref(null)
const bulkDietRows = ref([])


const filters = reactive({
  status: 'belum_pulang',
  tgl_awal: new Date().toISOString().split('T')[0],
  tgl_akhir: new Date().toISOString().split('T')[0],
  kd_sps: null,
  kd_dokter: null,
  keyword: ''
})

// Methods
const startDebounceInfo = debounce(() => {
  fetchData(true)
}, 500)

watch(() => filters.keyword, () => {
    startDebounceInfo()
})

const fetchData = async (reset = false) => {
  if (loading.value) return
  
  if (reset) {
    items.value = []
    pagination.value.current_page = 1
    hasMore.value = true
  }

  // Prevent fetching if no more pages
  if (!hasMore.value && !reset) return

  loading.value = true
  try {
    const params = {
      ...filters,
      page: pagination.value.current_page
    }
    
    // Clean null values
    Object.keys(params).forEach(key => params[key] === null && delete params[key])

    // Remove dates if status is 'belum_pulang'
    if (params.status === 'belum_pulang') {
        delete params.tgl_awal
        delete params.tgl_akhir
    }

    const response = await rawatInapService.getRawatInap(params)
    if (response.data && response.data.success) {
       const paginationData = response.data.data
       
       if (reset) {
         items.value = paginationData.data
       } else {
         items.value = [...items.value, ...paginationData.data]
       }
       
       pagination.value = {
         current_page: paginationData.current_page,
         last_page: paginationData.last_page,
         total: paginationData.total
       }

       // Update hasMore
       hasMore.value = paginationData.current_page < paginationData.last_page
       
       // Prepare next page
       if (hasMore.value) {
         pagination.value.current_page++
       }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 50) {
     fetchData(false)
  }
}

// Export & Copy Utils

const fetchAllData = async () => {
    try {
        const params = {
          ...filters,
          per_page: 999999 // Fetch all
        }
        
        // Clean null values
        Object.keys(params).forEach(key => params[key] === null && delete params[key])

        // Remove dates if status is 'belum_pulang'
        if (params.status === 'belum_pulang') {
            delete params.tgl_awal
            delete params.tgl_akhir
        }
        
        const response = await rawatInapService.getRawatInap(params)
        if (response.data && response.data.success) {
            return response.data.data.data // Access the array inside pagination object
        }
    } catch (error) {
        console.error('Error fetching all data:', error)
        alert('Gagal mengambil data lengkap untuk export.')
    }
    return []
}

const formatDataForExport = (data) => {
  return data.map(item => ({
    'Kamar': item.kamar?.kd_kamar,
    'No Rawat': item.no_rawat,
    'No RM': item.reg_periksa?.no_rkm_medis,
    'Nama Pasien': item.reg_periksa?.pasien?.nm_pasien,
    'JK': item.reg_periksa?.pasien?.jk,
    'Tgl Masuk': `${item.tgl_masuk} ${item.jam_masuk}`,
    'Diagnosa Awal': item.diagnosa_awal || '-',
    'Jenis Bayar': item.png_jawab,
    'Status SEP': item.sep_simple ? 'Terbit' : 'Belum',
    'Dokter': item.reg_periksa?.dokter?.nm_dokter,
    'Bangsal': item.kamar?.bangsal?.nm_bangsal,
    'Penanggung Jawab': item.reg_periksa?.p_jawab,
    'Hubungan PJ': item.reg_periksa?.hubunganpj,
    'Alamat Penanggung Jawab': item.reg_periksa?.almt_pj
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
      XLSX.utils.book_append_sheet(wb, ws, "Rawat Inap")
      
      XLSX.writeFile(wb, `RawatInap_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`)
  } catch (error) {
      console.error('Export Error:', error)
      alert('Gagal mengexport data Excel.')
  } finally {
      btn.innerHTML = originalLabel
      btn.disabled = false
  }
}

const loadMasterData = async () => {
  try {
    const [spesialisRes, dokterRes] = await Promise.all([
      rawatInapService.getSpesialis(),
      rawatInapService.getDokter()
    ])
    
    if (spesialisRes.data && spesialisRes.data.success) {
      spesialisList.value = spesialisRes.data.data
    }
    
    if (dokterRes.data && dokterRes.data.success) {
      dokterList.value = dokterRes.data.data
    }
  } catch (error) {
    console.error('Error loading master data:', error)
  }
}

const changePage = (url) => {
  if (url) fetchData(url)
}

// Modal Logic
const showModal = ref(false)
const selectedItem = ref(null)
const activeTab = ref('data-pasien')

const openModal = (item) => {
  // Clear previous data immediately
  rmeData.value = null
  billingData.value = null
  penunjangData.value = null
  
  selectedItem.value = item
  activeTab.value = 'data-pasien'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    selectedItem.value = null
    rmeData.value = null
    billingData.value = null
    billingGabung.value = []
    penunjangData.value = null
  }, 300)
}

// Booking Operasi Logic
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
  bookingForm.no_rkm_medis = item.reg_periksa?.no_rkm_medis
  bookingForm.nm_pasien = item.reg_periksa?.pasien?.nm_pasien
  bookingForm.kd_dokter = item.reg_periksa?.kd_dokter // Default to DPJP
  
  showBookingOperasiModal.value = true
  // Pre-fetch packages
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

// Diet Modal Functions
const openDietModal = async (item) => {
  // Set default values
  dietForm.no_rawat = item.no_rawat
  dietForm.tanggal = new Date().toISOString().split('T')[0]
  dietForm.pagi = '-'
  dietForm.siang = '-'
  dietForm.sore = '-'
  dietForm.permintaan_khusus = ''
  isEditingDiet.value = false
  
  showDietModal.value = true
  closeContextMenu()
  
  // Try to load existing data for today
  try {
    const response = await dietService.getByNoRawat(item.no_rawat, dietForm.tanggal)
    if (response.data.success && response.data.data) {
      const existing = response.data.data
      dietForm.pagi = existing.pagi || '-'
      dietForm.siang = existing.siang || '-'
      dietForm.sore = existing.sore || '-'
      dietForm.permintaan_khusus = existing.permintaan_khusus || ''
      isEditingDiet.value = true
    }
  } catch (e) {
    // No existing data, use defaults
    console.log('No existing diet data for today')
    isEditingDiet.value = false
  }
}

const closeDietModal = () => {
  showDietModal.value = false
}

const submitDiet = async () => {
  isSavingDiet.value = true
  try {
    const response = await dietService.create(dietForm)
    if (response.data.success) {
      toast.success('Permintaan diet berhasil disimpan')
      closeDietModal()
    } else {
      toast.error(response.data.message || 'Gagal menyimpan permintaan diet')
    }
  } catch (e) {
    console.error('Error saving diet:', e)
    const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan permintaan diet'
    toast.error(errorMsg)
  } finally {
    isSavingDiet.value = false
  }
}

// Bulk Diet Entry Functions
const openBulkDietModal = async () => {
  showBulkDietModal.value = true
  closeContextMenu()
  await loadBulkPatients()
}

const closeBulkDietModal = () => {
  showBulkDietModal.value = false
  bulkDietRows.value = []
}

const loadBulkPatients = async () => {
  isLoadingBulkPatients.value = true
  try {
    // Fetch active inpatients
    const params = {
      status: 'belum_pulang',
      per_page: 200  // Changed from limit to per_page, increased for bulk
    }
    
    // Add spesialis filter if selected
    if (bulkDietSpesialis.value) {
      params.kd_sps = bulkDietSpesialis.value
    }
    
    const response = await rawatInapService.getAll(params)
    
    if (response.data.success) {
      const patients = response.data.data.data || []
      
      // Fetch existing diet data for selected date
      const dietResponse = await dietService.getAll({
        tanggal_start: bulkDietDate.value,
        tanggal_end: bulkDietDate.value,
        limit: 200
      })
      
      const existingDiets = dietResponse.data.success ? dietResponse.data.data.data : []
      const dietMap = {}
      existingDiets.forEach(diet => {
        dietMap[diet.no_rawat] = diet
      })
      
      // Create rows
      bulkDietRows.value = patients.map(patient => {
        const existing = dietMap[patient.no_rawat]
        const hasSkriningGizi = !!patient.reg_periksa?.skrining_gizi
        
        return {
          no_rawat: patient.no_rawat,
          nm_pasien: patient.reg_periksa?.pasien?.nm_pasien || '-',
          kamar: patient.kamar?.bangsal?.nm_bangsal || '-',
          pagi: existing?.pagi || '-',
          siang: existing?.siang || '-',
          sore: existing?.sore || '-',
          permintaan_khusus: existing?.permintaan_khusus || '',
          hasExisting: !!existing,
          hasSkriningGizi: hasSkriningGizi,
          isDisabled: !hasSkriningGizi
        }
      })
      
      toast.success(`${patients.length} pasien dimuat`)
    }
  } catch (e) {
    console.error('Error loading bulk patients:', e)
    toast.error('Gagal memuat data pasien')
  } finally {
    isLoadingBulkPatients.value = false
  }
}

const saveBulkDiet = async () => {
  // Filter rows to save:
  // 1. Rows with any non-default value (new entries)
  // 2. Rows with existing data (updates, even if changing to defaults)
  // 3. Exclude disabled rows (no skrining gizi)
  const itemsToSave = bulkDietRows.value.filter(row => 
    !row.isDisabled && ( // Must have skrining gizi
      row.hasExisting || // Include existing records for updates
      row.pagi !== '-' || row.siang !== '-' || row.sore !== '-' || row.permintaan_khusus
    )
  )
  
  if (itemsToSave.length === 0) {
    toast.warning('Tidak ada data yang perlu disimpan')
    return
  }
  
  isSavingBulkDiet.value = true
  try {
    const response = await dietService.bulkStore({
      tanggal: bulkDietDate.value,
      items: itemsToSave.map(row => ({
        no_rawat: row.no_rawat,
        pagi: row.pagi,
        siang: row.siang,
        sore: row.sore,
        permintaan_khusus: row.permintaan_khusus
      }))
    })
    
    if (response.data.success) {
      const { success_count, fail_count, errors } = response.data.data
      
      if (fail_count === 0) {
        toast.success(`${success_count} permintaan diet berhasil disimpan`)
        // Don't close modal - allow continued editing
      } else {
        toast.warning(`${success_count} berhasil, ${fail_count} gagal`)
        // Show errors in console for debugging
        console.error('Failed items:', errors)
      }
    } else {
      toast.error(response.data.message || 'Gagal menyimpan permintaan diet')
    }
  } catch (e) {
    console.error('Error saving bulk diet:', e)
    const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan permintaan diet'
    toast.error(errorMsg)
  } finally {
    isSavingBulkDiet.value = false
  }
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

// RME Logic
const fetchRme = async () => {
   if (!selectedItem.value) return

   isLoadingRme.value = true
   rmeError.value = null
   
   try {
     const response = await rawatInapService.getPemeriksaanRanap(
       selectedItem.value.reg_periksa?.no_rkm_medis, 
       selectedItem.value.no_rawat
     )
      if (response.data && response.data.data) {
        rmeData.value = response.data.data.length > 0 ? response.data.data : null
      } else {
        rmeData.value = null
      }
   } catch (error) {
     console.error('Error fetching RME:', error)
     rmeError.value = 'Gagal memuat data pemeriksaan'
   } finally {
     isLoadingRme.value = false
   }
}

const fetchPenunjang = async () => {
   if (!selectedItem.value) return
   try {
     const response = await rawatInapService.getPenunjang(selectedItem.value.no_rawat)
     if (response.data && response.data.success) {
       penunjangData.value = response.data.data
     }
   } catch (error) {
     console.error('Error fetching penunjang:', error)
   }
}

const fetchBilling = async () => {
   if (!selectedItem.value) return

   isLoadingBilling.value = true
   billingError.value = null

   try {
     const response = await rawatInapService.getBilling(selectedItem.value.no_rawat)
     if (response.data && response.data.success) {
       billingData.value = response.data.data
       billingGabung.value = response.data.gabung || []
     } else {
       billingData.value = null
       billingGabung.value = []
     }
   } catch (error) {
     console.error('Error fetching billing:', error)
     billingError.value = 'Gagal memuat data billing'
   } finally {
     isLoadingBilling.value = false
   }
}

// Watchers
watch(activeTab, (newTab) => {
  if (newTab === 'rme') {
    if (!rmeData.value) fetchRme()
    if (!penunjangData.value) fetchPenunjang()
  }
  if (newTab === 'billing' && !billingData.value) {
    fetchBilling()
  }
})

// Watch diet date changes to load existing data
watch(() => dietForm.tanggal, async (newDate) => {
  if (showDietModal.value && dietForm.no_rawat) {
    try {
      const response = await dietService.getByNoRawat(dietForm.no_rawat, newDate)
      if (response.data.success && response.data.data) {
        const existing = response.data.data
        dietForm.pagi = existing.pagi || '-'
        dietForm.siang = existing.siang || '-'
        dietForm.sore = existing.sore || '-'
        dietForm.permintaan_khusus = existing.permintaan_khusus || ''
        isEditingDiet.value = true
      } else {
        // No data for this date, reset to defaults
        dietForm.pagi = '-'
        dietForm.siang = '-'
        dietForm.sore = '-'
        dietForm.permintaan_khusus = ''
        isEditingDiet.value = false
      }
    } catch (e) {
      // No existing data, reset to defaults
      dietForm.pagi = '-'
      dietForm.siang = '-'
      dietForm.sore = '-'
      dietForm.permintaan_khusus = ''
      isEditingDiet.value = false
    }
  }
})



// Lab Helpers
const getLabResultClass = (keterangan) => {
  if (!keterangan) return 'text-dark'
  const ket = keterangan.toString().toLowerCase().trim()
  if (ket === 'h' || ket.includes('high') || ket.includes('tinggi') || ket.includes('positif')) return 'text-danger'
  if (ket === 'l' || ket.includes('low') || ket.includes('rendah')) return 'text-primary'
  return 'text-dark'
}

const getLabResultBadgeClass = (keterangan) => {
  if (!keterangan) return ''
  const ket = keterangan.toString().toLowerCase().trim()
  if (ket === 'h' || ket.includes('high') || ket.includes('tinggi')) return 'bg-danger text-white'
  if (ket === 'l' || ket.includes('low') || ket.includes('rendah')) return 'bg-primary text-white'
  return 'bg-secondary text-white'
}

const calculateLamaInap = (dateStr) => {
  if (!dateStr) return '-'
  try {
      const start = new Date(dateStr)
      const now = new Date()
      const diffTime = now - start
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 1
  } catch (e) {
      return '-'
  }
}

const calculateCategoryTotal = (items) => {
  let total = 0
  Object.values(items).forEach(item => {
    if (Array.isArray(item)) {
       item.forEach(sub => total += parseFloat(sub.biaya_rawat || sub.totalbiaya || sub.total || 0))
    } else {
       total += parseFloat(item.biaya_rawat || item.totalbiaya || item.total || 0)
    }
  })
  return total
}

const grandTotal = computed(() => {
  let total = 0
  
  // Hitung total Ibu
  if (billingData.value) {
    Object.values(billingData.value).forEach(items => {
        total += calculateCategoryTotal(items)
    })
  }

  // Hitung total Bayi (Gabung)
  if (billingGabung.value && billingGabung.value.length > 0) {
    billingGabung.value.forEach(bayi => {
       if (bayi.billing) {
         Object.values(bayi.billing).forEach(items => {
           total += calculateCategoryTotal(items)
         })
       }
    })
  }

  return total
})

onMounted(() => {
  loadMasterData()
  fetchData(true)
  window.addEventListener('click', onWindowClick)
  window.addEventListener('scroll', closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
  window.removeEventListener('scroll', closeContextMenu)
})
</script>

<style scoped>
/* Reuse styles from RawatJalan or shared styles */
.rawat-inap-view {
  animation: fadeIn 0.3s ease-in-out;
  min-height: 80vh;
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border-radius: 8px;
  min-width: 200px;
  /* overflow: hidden; Removed to allow submenu visibility */
  animation: fadeIn 0.1s ease-out;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.context-menu-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #334155;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.context-menu-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.context-menu-item.result-header {
  background-color: #f8fafc;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: default;
  color: #64748b;
  pointer-events: none;
}

/* Submenu Styles */
.has-submenu {
  position: relative;
}

.submenu {
  display: none;
  position: absolute;
  top: -5px; /* Slightly higher alignment */
  left: 100%; /* Show to the right */
  margin-left: -5px; /* Overlap slightly to prevent gap closing menu */
  background: white;
  min-width: 180px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10000;
}

.has-submenu:hover .submenu {
  display: block;
  animation: fadeIn 0.1s ease-out;
}

/* Adjust submenu if near right edge (simple fix: media query or dynamic class. For now default right) */
/* If using right alignment: 
   .submenu { right: 100%; left: auto; }
*/

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal-content-custom {
  width: 85%; /* Wide modal */
  max-width: 900px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);
  transform: translateX(100%);
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  to { transform: translateX(0); }
}

.modal-header-custom {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.modal-body-custom {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  position: relative;
}

.modal-footer-custom {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn-close-custom {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-custom:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.nav-pills .nav-link {
  color: #64748b;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.nav-pills .nav-link.active {
  background-color: white;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-weight: 600;
}

/* Sticky Header */
.sticky-header-wrapper {
  position: sticky;
  top: -1.5rem;
  background: white;
  z-index: 100;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Helpers */
.avatar-circle {
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-value {
  font-size: 0.95rem;
}

.icon-square {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Colors */
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-600 { color: #9333ea; }
.bg-green-100 { background-color: #d1fae5; }
.text-green-600 { color: #059669; }

/* Success Checkmark Animation */
.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4caf50;
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

.success-checkmark .check-icon::before,
.success-checkmark .check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #fff;
  transform: rotate(-45deg);
}

.success-checkmark .check-icon .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .check-icon .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .check-icon .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, 0.5);
}

.success-checkmark .check-icon .icon-fix {
  top: 8px;
  width: 5px;
  left: 26px;
  z-index: 1;
  height: 85px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: #fff;
}

@keyframes rotate-circle {
  0% { transform: rotate(-45deg); }
  5% { transform: rotate(-45deg); }
  12% { transform: rotate(-405deg); }
  100% { transform: rotate(-405deg); }
}

@keyframes icon-line-tip {
  0% { width: 0; left: 1px; top: 19px; }
  54% { width: 0; left: 1px; top: 19px; }
  70% { width: 50px; left: -8px; top: 37px; }
  84% { width: 17px; left: 21px; top: 48px; }
  100% { width: 25px; left: 14px; top: 45px; }
}

@keyframes icon-line-long {
  0% { width: 0; right: 46px; top: 54px; }
  65% { width: 0; right: 46px; top: 54px; }
  84% { width: 55px; right: 0px; top: 35px; }
  100% { width: 47px; right: 8px; top: 38px; }
}
/* Custom Switch Styling (Segmented Control look) */
.btn-outline-custom {
  color: #64748b;
  background-color: transparent;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  border-radius: 50rem !important; /* Force pill shape per button */
  padding: 0.35rem 1rem;
  margin: 2px !important; /* Puddle effect spacing */
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1; /* Equal width */
}

.btn-check:checked + .btn-outline-custom {
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.25);
  z-index: 2;
}

.status-switch-wrapper .btn-group {
  padding: 2px;
  background-color: #f1f5f9 !important; 
  border: 1px solid #e2e8f0;
  min-height: 42px; /* Consistent height with inputs */
  align-items: stretch;
}

.btn-outline-custom:hover:not(.active) {
  background-color: #e2e8f0;
  color: #334155;
}

/* Enhanced Form Controls (Row 2) */
.form-control-custom,
.btn-outline-custom {
  font-size: 0.875rem;
}

/* Strict Standardized Height & Style */
.style-chooser-custom .vs__dropdown-toggle,
.input-group,
input[type="date"].form-control-custom {
  background-color: #fff !important;
  border: 1px solid #e2e8f0; /* Matches typical border color */
  height: 42px !important; /* Standard height */
  min-height: 42px !important;
  max-height: 42px !important;
  border-radius: 8px; /* Consistent radius */
  box-sizing: border-box;
  transition: border-color 0.2s;
}

/* V-Select Internals - Reset & Center */
.style-chooser-custom .vs__dropdown-toggle {
  display: flex !important;
  align-items: center !important;
  padding: 0 8px !important; /* Horizontal padding */
}
.style-chooser-custom .vs__selected-options {
  display: flex !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 100% !important;
  width: 100%;
}
.style-chooser-custom .vs__selected,
.style-chooser-custom .vs__search {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  height: auto !important;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #334155;
  position: static !important;
}
.style-chooser-custom .vs__search::placeholder {
  color: #94a3b8;
}
.style-chooser-custom .vs__actions {
  padding: 0 !important;
  margin-left: 4px;
}

/* Search Group Internals - Reset & Center */
.input-group {
  display: flex !important;
  align-items: center !important;
  padding: 0 12px; /* Internal padding for the group wrapper */
  flex-wrap: nowrap !important; /* PREVENT WRAPPING */
}
.input-group-text,
.form-control-custom-search {
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 100% !important;
  display: flex;
  align-items: center;
  box-shadow: none !important;
}
.input-group-text {
  margin-right: 8px !important;
  color: #94a3b8;
  white-space: nowrap;
  width: auto;
  flex-shrink: 0; /* Keep icon sizing */
}
.form-control-custom-search {
  flex: 1 !important; /* Take remaining space */
  width: auto !important; /* Stop forcing 100% */
  font-size: 0.875rem;
  color: #334155;
  min-width: 0; /* Allow shrinking if needed */
}

/* Focus States */
.style-chooser-custom.vs--open .vs__dropdown-toggle,
.input-group:focus-within,
input[type="date"].form-control-custom:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #fff !important;
  z-index: 5;
}

/* Labels */
.form-label {
  color: #475569;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  font-weight: 700 !important;
  margin-bottom: 6px;
  display: block;
}

/* Date Input consistency */
input[type="date"].form-control-custom {
  padding: 0 12px;
  color: #334155;
}

/* Hover effects */
.input-group:hover,
.style-chooser-custom:hover .vs__dropdown-toggle,
input[type="date"].form-control-custom:hover {
  border-color: #cbd5e1;
}

/* Helpers */
.text-xs { font-size: 0.75rem; }
.tracking-wide { letter-spacing: 0.025em; }

/* Mobile Responsive */
@media (max-width: 768px) {
  /* Status filter column - remove min-width */
  .col-md-auto[style*="min-width: 320px"] {
    min-width: auto !important;
  }

  /* Status buttons - reduce padding and font size */
  .btn-outline-custom {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
  }

  .btn-outline-custom i {
    font-size: 0.7rem !important;
  }

  /* Reduce gap between buttons */
  .status-switch-wrapper .btn-group {
    gap: 1px !important;
  }

  /* Card body padding */
  .card-body {
    padding: 1rem !important;
  }

  /* Form labels */
  .form-label {
    font-size: 0.7rem !important;
  }
}
</style>
