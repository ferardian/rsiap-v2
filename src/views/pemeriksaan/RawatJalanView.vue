<template>
  <div class="rawat-jalan-view">
    <div class="page-header mb-4">
      <h2 class="mb-1">Rawat Jalan</h2>
      <p class="text-secondary mb-0">Daftar pasien registrasi rawat jalan</p>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4" style="z-index: 100; position: relative; overflow: visible;">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label text-sm fw-medium">Tanggal Periksa</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="filters.tgl_periksa"
              @change="fetchData"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label text-sm fw-medium">Status</label>
            <v-select 
              :options="['Ralan', 'Ranap', 'Semua']" 
              v-model="filters.status_lanjut" 
              placeholder="Pilih Status"
              class="style-chooser"
              :clearable="false"
              @update:modelValue="fetchData"
            ></v-select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-sm fw-medium">Poliklinik</label>
            <v-select
              v-model="filters.kd_poli"
              :options="poliklinikList"
              :reduce="poli => poli.kd_poli"
              label="nm_poli"
              placeholder="Pilih Poliklinik"
              @update:modelValue="fetchData"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label text-sm fw-medium">Dokter</label>
            <v-select
              v-model="filters.kd_dokter"
              :options="dokterList"
              :reduce="dokter => dokter.kd_dokter"
              label="nm_dokter"
              placeholder="Pilih Dokter"
              @update:modelValue="fetchData"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label text-sm fw-medium">Cari Pasien</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0 ps-0" 
                v-model="filters.keyword"
                placeholder="No RM / Nama"
                @keyup.enter="fetchData"
              >
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm" style="z-index: 1; position: relative;">
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: 60vh; overflow-y: auto;">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light sticky-top" style="z-index: 10;">
              <tr>
                <th class="px-3 py-3" style="width: 80px">No. Reg</th>
                <th class="px-3 py-3">Pasien</th>
                <th class="px-3 py-3">Poliklinik</th>
                <th class="px-3 py-3">Dokter</th>
                <th class="px-3 py-3">Alamat</th>

                <th class="px-3 py-3">Status</th>
                <th class="px-3 py-3 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
                  Data tidak ditemukan
                </td>
              </tr>
              <tr v-else v-for="item in items" :key="item.no_rawat" @contextmenu.prevent="handleRightClick($event, item)" class="cursor-pointer">
                <td class="px-3 py-3">
                  <div class="fw-bold text-primary">{{ item.no_reg }}</div>
                  <div class="small text-muted">{{ item.no_rawat }}</div>
                </td>
                <td class="px-3 py-3">
                  <div class="fw-semibold">{{ item.pasien?.nm_pasien }}</div>
                  <div class="small text-muted">
                    {{ item.no_rkm_medis }} 
                    <span class="mx-1">•</span> 
                    {{ item.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </div>
                </td>
                <td class="px-3 py-3">
                  {{ item.poliklinik?.nm_poli }}
                </td>
                <td class="px-3 py-3">
                  {{ item.dokter?.nm_dokter }}
                </td>
                <td class="px-3 py-3 text-truncate" style="max-width: 150px;">
                  {{ item.pasien?.alamat }}
                </td>

                <td class="px-3 py-3">
                  <span 
                    class="badge rounded-pill"
                    :class="getStatusClass(item.stts)"
                  >
                    {{ item.stts }}
                  </span>
                </td>
                <td class="px-3 py-3 text-end">
                  <button class="btn btn-sm btn-light border" title="Lihat Detail" @click="openModal(item)">
                    <i class="fas fa-eye text-secondary"></i>
                  </button>
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
                      <div class="detail-value text-success fw-medium">{{ selectedItem.pasien?.no_peserta || '-' }}</div>
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
                     <div class="col-md-6">
                      <label class="detail-label text-blue-700 mb-1">Cara Bayar</label>
                      <div class="detail-value text-dark">{{ selectedItem.caraBayar?.png_jawab }}</div>
                    </div>
                    <div class="col-md-6">
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
    <!-- Context Menu -->
    <div 
        v-if="showContextMenu" 
        class="context-menu"
        :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
    >
      <div class="context-menu-item" @click="handleContextAction('detail')">
          <i class="fas fa-eye me-2 text-primary"></i> Lihat Detail
      </div>
      <div class="context-menu-item" @click="handleContextAction('billing')">
          <i class="fas fa-file-invoice-dollar me-2 text-success"></i> Billing
      </div>
      
       <!-- ERM Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <div class="d-flex justify-content-between align-items-center w-100">
           <span><i class="fas fa-notes-medical me-2 text-info"></i> ERM</span>
           <i class="fas fa-chevron-right small text-muted"></i>
        </div>
        <div class="submenu">
             <div class="context-menu-item" @click="handleContextAction('erm-soap')">
               <i class="fas fa-file-medical me-2 text-secondary"></i> SOAP
             </div>
             <div class="context-menu-item" @click="handleContextAction('erm-asesmen')">
               <i class="fas fa-stethoscope me-2 text-secondary"></i> Asesmen Medis
             </div>
             <div class="context-menu-item" @click="handleContextAction('erm-resume')">
               <i class="fas fa-file-signature me-2 text-secondary"></i> Resume
             </div>
        </div>
      </div>

       <!-- Permintaan Submenu -->
      <div class="context-menu-item has-submenu" @click.stop>
        <div class="d-flex justify-content-between align-items-center w-100">
           <span><i class="fas fa-hand-holding-medical me-2 text-warning"></i> Permintaan</span>
           <i class="fas fa-chevron-right small text-muted"></i>
        </div>
        <div class="submenu">
             <div class="context-menu-item" @click="handleContextAction('req-operasi')">
               <i class="fas fa-procedures me-2 text-danger"></i> Jadwal Operasi
             </div>
             <div class="context-menu-item" @click="handleContextAction('req-lab')">
               <i class="fas fa-flask me-2 text-info"></i> Pemeriksaan Lab
             </div>
             <div class="context-menu-item" @click="handleContextAction('req-rad')">
               <i class="fas fa-x-ray me-2 text-dark"></i> Pemeriksaan Radiologi
             </div>
        </div>
      </div>

      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleContextAction('copyRawat')">
          <i class="far fa-copy me-2 text-muted"></i> Salin No. Rawat
      </div>
      <div class="context-menu-item" @click="handleContextAction('copyRM')">
          <i class="far fa-clipboard me-2 text-muted"></i> Salin No. RM
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
import { ref, onMounted, reactive, watch } from 'vue'
import rawatJalanService from '@/services/rawatJalanService'
import operasiService from '@/services/operasiService'

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

const filters = reactive({
  tgl_periksa: new Date().toISOString().split('T')[0],
  status_lanjut: 'Ralan',
  kd_poli: null,
  kd_dokter: null,
  keyword: ''
})

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

// Methods
const startDebounceInfo = debounce(() => {
  fetchData()
}, 500)

watch(() => filters.keyword, () => {
    startDebounceInfo()
})

const fetchData = async (url = null) => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: url ? new URL(url, 'http://dummy.com').searchParams.get('page') : 1
    }
    
    // Clean null values
    Object.keys(params).forEach(key => params[key] === null && delete params[key])

    const response = await rawatJalanService.getRawatJalan(params)
    if (response) { // Accessing .data property handled by interceptor ideally, but checking direct response structure
       // Assuming standard Laravel pagination response
       const result = response.data
       const paginationData = result.data // The pagination object from Laravel
       
       items.value = paginationData.data // The actual array of items
       
       pagination.value = {
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
  if (url) fetchData(url)
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

const calculateCategoryTotal = (items) => {
  if (Array.isArray(items)) {
     return items.reduce((sum, item) => sum + parseFloat(item.biaya_rawat || item.total || 0), 0)
  }
  // Handle object grouping if necessary, but usually items is array of items
  // If items is object (Key -> Item/Array), we sum values
  if (typeof items === 'object' && items !== null) {
      return Object.values(items).reduce((sum, sub) => {
          if (Array.isArray(sub)) {
              return sum + sub.reduce((s, i) => s + parseFloat(i.biaya_rawat || i.total || 0), 0)
          }
          return sum + parseFloat(sub.biaya_rawat || sub.total || 0)
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
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuItem = ref(null)

const handleRightClick = (event, item) => {
  contextMenuItem.value = item
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
}

const handleContextAction = async (action) => {
  if (!contextMenuItem.value) return
  
  const item = contextMenuItem.value
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
      break
    case 'copyRM':
      navigator.clipboard.writeText(item.no_rkm_medis)
      break
  }
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  document.body.style.overflow = 'auto'
}

// Lifecycle
onMounted(() => {
  loadMasterData()
  fetchData()
  
  window.addEventListener('click', closeContextMenu)
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
  height: 38px;
  border-color: #dee2e6;
}

:deep(.vs__selected-options) {
  padding: 0 4px;
}

:deep(.vs__actions) {
  padding-top: 0;
  padding-bottom: 0;
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

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  min-width: 180px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  z-index: 9999;
  padding: 6px 0;
  animation: fadeIn 0.1s ease-out;
  overflow: visible; /* Penting untuk submenu */
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #334155;
  font-size: 0.9rem;
  transition: all 0.2s;
  position: relative;
}

.context-menu-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.context-menu-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 6px 0;
}

/* Submenu Styles */
.has-submenu {
  justify-content: space-between;
}

.submenu {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  background: white;
  min-width: 180px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 6px 0;
  margin-left: 2px;
}

.has-submenu:hover .submenu {
  display: block;
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
</style>
