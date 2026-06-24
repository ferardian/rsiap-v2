<template>
  <div class="karyawan-container py-4">
    <!-- Header Page -->
    <div class="page-header mb-4">
      <div class="header-info">
        <h2 class="section-title text-dark-blue fw-bold font-sans">
          <i class="fas fa-graduation-cap text-primary me-2"></i>Diklat Karyawan
        </h2>
        <p class="text-muted small m-0">Kelola data pelatihan, workshop, seminar, dan sertifikasi karyawan rumah sakit.</p>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="row g-3 align-items-start">
      <!-- Left Panel: Searchable Employee List (Master) -->
      <div class="col-md-4 left-sticky-panel">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeInLeft">
          <div class="card-header-left py-3 px-4">
            <h6 class="fw-bold m-0 text-white font-sans">
              <i class="fas fa-users me-2 opacity-75"></i>Daftar Karyawan
            </h6>
          </div>
          
          <div class="p-3 border-bottom bg-light">
            <div class="search-box position-relative">
              <i class="fas fa-search search-icon-left"></i>
              <input 
                type="text" 
                v-model="empSearchQuery" 
                @input="handleEmpSearch"
                placeholder="Cari nama atau NIK..."
                class="form-control form-control-sm ps-5"
              />
              <button v-if="empSearchQuery" @click="clearEmpSearch" class="btn-clear-left">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body p-0 scrollable-emp-list">
            <!-- Loading Karyawan -->
            <div v-if="loadingEmployees" class="p-4 text-center text-muted">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p class="small font-sans m-0">Memuat karyawan...</p>
            </div>

            <!-- Empty Results -->
            <div v-else-if="employees.length === 0" class="p-4 text-center text-muted">
              <i class="fas fa-search-minus fa-2x mb-2 text-muted-light"></i>
              <p class="small font-sans m-0">Karyawan tidak ditemukan</p>
            </div>

            <!-- Employees List -->
            <div v-else class="list-group list-group-flush">
              <button 
                v-for="emp in employees" 
                :key="emp.nik" 
                :class="['list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 p-3 transition-all', selectedEmployee?.nik === emp.nik ? 'active-emp-item' : '']"
                @click="selectEmployee(emp)"
              >
                <div class="avatar-sm flex-shrink-0">
                  <span class="initials">{{ getInitials(emp.nama) }}</span>
                </div>
                <div class="emp-summary text-start text-truncate">
                  <span class="d-block fw-bold text-dark text-truncate" style="font-size: 0.88rem;">{{ emp.nama }}</span>
                  <span class="text-muted extra-small d-block text-truncate mt-0.5">
                    NIK: {{ emp.nik }} • {{ emp.jbtn || '-' }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Employee Details & Diklat History (Detail) -->
      <div class="col-md-8">
        <div class="d-flex flex-column gap-4 h-100">
          
          <!-- Employee Details Banner (Only when selected) -->
          <div v-if="selectedEmployee" class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn position-relative">
            <div class="card-header-gradient p-4 text-white position-relative">
              <div class="deco-circle"></div>
              <div class="row align-items-center g-3">
                <div class="col-auto">
                  <div class="avatar-md shadow-md">
                    <span class="initials-md">{{ getInitials(selectedEmployee.nama) }}</span>
                  </div>
                </div>
                <div class="col text-start">
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <h4 class="fw-bold m-0 text-white">{{ selectedEmployee.nama }}</h4>
                    <span class="badge bg-white text-success text-uppercase rounded-pill extra-small font-sans px-2 border-0 fw-bold">
                      {{ selectedEmployee.stts_aktif || 'AKTIF' }}
                    </span>
                  </div>
                  <p class="banner-subtitle small m-0 mt-1">
                    {{ selectedEmployee.jbtn || '-' }} • {{ selectedEmployee.departemen || '-' }}
                  </p>
                  <p class="banner-caption font-mono extra-small m-0 mt-1">
                    NIK: {{ selectedEmployee.nik }} &nbsp;|&nbsp; Mulai Kerja: {{ formatDate(selectedEmployee.mulai_kerja) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Diklat History Card -->
          <div class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn flex-grow-1">
            <div class="card-header-history py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 class="m-0 fw-bold text-white font-sans">
                <i class="fas fa-history me-2 opacity-75"></i>Riwayat Diklat & Pelatihan
              </h5>
              
              <button 
                v-if="selectedEmployee" 
                class="btn-add-outline font-sans px-3 rounded-3 d-inline-flex align-items-center gap-2"
                @click="openAddModal"
              >
                <i class="fas fa-plus"></i>
                <span>Tambah Diklat</span>
              </button>
            </div>

            <div class="card-body p-0 position-relative h-100">
              <!-- Loader State -->
              <div v-if="loadingDiklat" class="p-5 text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted font-sans small">Memuat riwayat diklat...</p>
              </div>

              <!-- Empty State: No Employee Selected -->
              <div v-else-if="!selectedEmployee" class="p-5 text-center text-muted h-100 d-flex flex-column align-items-center justify-content-center">
                <div class="mb-3 text-muted-light"><i class="fal fa-users fa-4x"></i></div>
                <h5 class="fw-bold">Pilih Karyawan</h5>
                <p class="small text-muted-dark">Silakan pilih salah satu karyawan di daftar sebelah kiri untuk mengelola data diklat.</p>
              </div>

              <!-- Empty State: No Diklat History -->
              <div v-else-if="diklatList.length === 0" class="p-5 text-center text-muted animate__animated animate__fadeIn">
                <div class="mb-3 text-muted-light"><i class="fal fa-award fa-4x"></i></div>
                <h5 class="fw-bold">Belum Ada Riwayat Diklat</h5>
                <p class="small text-muted-dark mb-4">Karyawan ini belum terdaftar mengikuti kegiatan diklat apa pun.</p>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-4" @click="openAddModal">
                  <i class="fas fa-plus me-1"></i> Tambah Sekarang
                </button>
              </div>

              <!-- Table of Diklat records -->
              <div v-else class="table-responsive">
                <table class="table data-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th class="ps-4" style="width: 5%">No</th>
                      <th style="width: 35%">Kegiatan / Pelatihan</th>
                      <th style="width: 15%">Kategori & Tempat</th>
                      <th style="width: 15%">Waktu & Durasi</th>
                      <th style="width: 15%">Peran & Poin</th>
                      <th class="text-center" style="width: 15%">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(item, idx) in diklatList" 
                      :key="item.id" 
                      class="diklat-row animate__animated animate__fadeIn"
                      style="--animate-duration: 0.3s;"
                    >
                      <td class="ps-4 text-muted small fw-bold font-mono">{{ idx + 1 }}</td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-bold text-dark font-sans leading-snug" style="font-size: 0.88rem;">
                            {{ item.kegiatan?.nama_kegiatan || 'Kegiatan Tidak Diketahui' }}
                          </span>
                          <span class="text-muted extra-small mt-0.5" v-if="item.kegiatan?.penyelenggara">
                            Penyelenggara: {{ item.kegiatan.penyelenggara }}
                          </span>
                          <span class="text-muted font-mono extra-small" v-if="item.kegiatan?.nomor">
                            No: {{ item.kegiatan.nomor }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column align-items-start">
                          <span :class="['badge rounded-pill extra-small px-2 py-0.5 mb-1', item.kegiatan?.kategori === 'Internal' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-dark']">
                            {{ item.kegiatan?.kategori || '-' }}
                          </span>
                          <span class="text-muted small text-truncate" style="max-width: 140px;" :title="item.kegiatan?.tempat">
                            <i class="fas fa-map-marker-alt text-muted-light me-1"></i>{{ item.kegiatan?.tempat || '-' }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column small">
                          <span class="fw-medium">{{ formatDateRange(item.kegiatan?.tgl_mulai, item.kegiatan?.tgl_akhir) }}</span>
                          <span class="text-muted extra-small mt-0.5" v-if="item.kegiatan?.jpl">
                            <i class="fas fa-clock text-muted-light me-1"></i>{{ item.kegiatan.jpl }} JPL
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column align-items-start gap-1">
                          <span :class="['badge px-2 py-1 text-uppercase extra-small fw-bold', getRoleColorClass(item.peserta)]">
                            {{ item.peserta }}
                          </span>
                          <span class="badge bg-light text-secondary border extra-small" v-if="item.kegiatan?.skp">
                            {{ item.kegiatan.skp }} SKP
                          </span>
                        </div>
                      </td>
                      <td class="text-center pe-4">
                        <div class="d-flex align-items-center justify-content-center gap-2">
                          <!-- Tombol Cetak Sertifikat — hanya untuk diklat Internal -->
                          <button
                            v-if="item.kegiatan?.kategori === 'Internal'"
                            class="btn btn-sm btn-action text-success bg-success-subtle border-0"
                            @click="printSertifikat(item)"
                            title="Cetak Sertifikat Internal"
                          >
                            <i class="fas fa-print"></i>
                          </button>

                          <button 
                            v-if="item.berkas" 
                            class="btn btn-sm btn-action text-info bg-info-subtle border-0"
                            @click="previewCertificate(item)"
                            title="Pratinjau Sertifikat"
                          >
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          
                          <button 
                            class="btn btn-sm btn-action text-warning bg-warning-subtle border-0"
                            @click="openEditModal(item)"
                            title="Edit Diklat"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          
                          <button 
                            class="btn btn-sm btn-action text-danger bg-danger-subtle border-0"
                            @click="deleteDiklatRecord(item)"
                            title="Hapus Diklat"
                          >
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
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

    <!-- SIDEBAR FORM OVERLAY for TAMBAH / EDIT DIKLAT -->
    <div :class="['sidebar-overlay', { active: showFormSidebar }]" @click="closeSidebar"></div>
    <div :class="['sidebar-form', { active: showFormSidebar }]">
      <div class="sidebar-content">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <h5>
            <i class="fas" :class="isEditMode ? 'fa-edit' : 'fa-plus'"></i>
            <span>{{ isEditMode ? 'Edit Record Diklat' : 'Tambah Record Diklat' }}</span>
          </h5>
          <button class="sidebar-close" @click="closeSidebar">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Sidebar Body -->
        <div class="sidebar-body">
          <form @submit.prevent="submitForm">
            <!-- Karyawan Info Info-only -->
            <div class="form-group mb-3 bg-light p-3 rounded-3 border">
              <label class="form-label small text-muted"><i class="fas fa-user me-1"></i>Pegawai</label>
              <div class="fw-bold text-dark">{{ selectedEmployee?.nama }}</div>
              <div class="small text-muted font-mono">NIK: {{ selectedEmployee?.nik }}</div>
            </div>

            <!-- Peran / Peserta Role -->
            <div class="form-group">
              <label class="form-label"><i class="fas fa-user-tag me-1"></i>Peran Pegawai <span class="text-danger">*</span></label>
              <select v-model="form.peserta" class="form-select" required>
                <option value="Peserta">Peserta</option>
                <option value="Pemateri">Pemateri / Narasumber</option>
                <option value="Panitia">Panitia</option>
              </select>
            </div>

            <hr class="my-4 text-muted-light" />

            <!-- Kegiatan Type Toggle -->
            <div class="form-group mb-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <label class="form-label mb-0"><i class="fas fa-calendar-alt me-1"></i>Kegiatan Pelatihan</label>
                <div class="toggle-switch" v-if="!isEditMode">
                  <input 
                    type="checkbox" 
                    id="new-kegiatan-toggle" 
                    v-model="form.isNewKegiatan"
                  />
                  <label for="new-kegiatan-toggle" class="toggle-slider"></label>
                  <span class="toggle-label extra-small">{{ form.isNewKegiatan ? 'Buat Baru' : 'Cari Terdaftar' }}</span>
                </div>
              </div>

              <!-- Kegiatan Autocomplete Search (for existing) -->
              <div v-if="!form.isNewKegiatan && !isEditMode" class="position-relative">
                <div class="search-box">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    v-model="kegQuery" 
                    @input="searchActivities"
                    placeholder="Ketik kata kunci nama kegiatan..."
                    class="form-control"
                    :disabled="form.id_kegiatan !== null"
                  />
                  <button v-if="form.id_kegiatan" @click="clearKegiatanSelection" class="btn-clear">
                    <i class="fas fa-times text-danger"></i>
                  </button>
                </div>

                <!-- Autocomplete Dropdown -->
                <div v-if="kegResults.length > 0" class="search-results-dropdown shadow border rounded-3 w-100">
                  <div 
                    v-for="keg in kegResults" 
                    :key="keg.id" 
                    class="search-result-item p-2 border-bottom text-start"
                    @click="selectActivity(keg)"
                  >
                    <span class="fw-semibold d-block small">{{ keg.nama_kegiatan }}</span>
                    <span class="text-muted extra-small">
                      {{ keg.kategori }} • {{ formatDate(keg.tgl_mulai) }} • {{ keg.tempat }}
                    </span>
                  </div>
                </div>

                <!-- Selected Indicator -->
                <div v-if="selectedKegiatanRecord" class="mt-2 p-2 bg-primary-subtle rounded text-primary small d-flex align-items-center justify-content-between">
                  <div>
                    <i class="fas fa-check-circle me-1"></i>
                    <strong>Terpilih:</strong> {{ selectedKegiatanRecord.nama_kegiatan }}
                  </div>
                </div>
              </div>

              <!-- Form Kegiatan Detail (Buat Baru atau saat Edit Mode) -->
              <div v-if="form.isNewKegiatan || isEditMode" class="bg-light p-3 rounded-3 border border-slate-100 animate__animated animate__fadeIn">
                <h6 class="fw-bold mb-3 small text-muted"><i class="fas fa-info-circle me-1"></i>Detail Kegiatan</h6>
                
                <div class="form-group mb-2">
                  <label class="form-label extra-small">Nama Kegiatan <span class="text-danger">*</span></label>
                  <input type="text" v-model="form.nama_kegiatan" class="form-control form-control-sm" required placeholder="Contoh: Pelatihan Basic Life Support" />
                </div>
                
                <div class="row g-2">
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Kategori <span class="text-danger">*</span></label>
                      <select v-model="form.kategori" class="form-select form-select-sm" required>
                        <option value="Internal">Internal</option>
                        <option value="Eksternal">Eksternal</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Tempat <span class="text-danger">*</span></label>
                      <input type="text" v-model="form.tempat" class="form-control form-control-sm" required placeholder="Contoh: Aula RSIAP" />
                    </div>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Tanggal Mulai <span class="text-danger">*</span></label>
                      <input type="date" v-model="form.tgl_mulai" class="form-control form-control-sm" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Tanggal Selesai</label>
                      <input type="date" v-model="form.tgl_akhir" class="form-control form-control-sm" />
                    </div>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Jumlah JPL (Jam)</label>
                      <input type="number" v-model="form.jpl" class="form-control form-control-sm" placeholder="JPL" />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group mb-2">
                      <label class="form-label extra-small">Jumlah Poin SKP</label>
                      <input type="number" v-model="form.skp" class="form-control form-control-sm" placeholder="SKP" />
                    </div>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label class="form-label extra-small">Penyelenggara</label>
                  <input type="text" v-model="form.penyelenggara" class="form-control form-control-sm" placeholder="Contoh: PPNI Kab. Pekalongan" />
                </div>

                <div class="form-group mb-2">
                  <label class="form-label extra-small">Nomor SK / Sertifikat</label>
                  <input type="text" v-model="form.nomor" class="form-control form-control-sm" placeholder="Contoh: 123/SK-DIR/VI/2026" />
                </div>

                <div class="form-group mb-2">
                  <label class="form-label extra-small">Tanda Tangan 1 (Direktur)</label>
                  <v-select
                    v-model="form.ttd1_id"
                    :options="employees"
                    :reduce="peg => peg.id"
                    label="nama"
                    placeholder="Pilih Direktur..."
                    class="v-select-custom bg-white"
                  />
                </div>

                <div class="form-group mb-2">
                  <label class="form-label extra-small">Tanda Tangan 2 (Ketua Panitia)</label>
                  <v-select
                    v-model="form.ttd2_id"
                    :options="employees"
                    :reduce="peg => peg.id"
                    label="nama"
                    placeholder="Pilih Ketua Panitia..."
                    class="v-select-custom bg-white"
                  />
                </div>

                <div class="form-group mb-0">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label extra-small mb-0">Materi Pelatihan (Ringkasan)</label>
                    <div class="d-flex gap-1">
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1 extra-small" @click="insertRow" title="Tambah Baris Bawah">
                        + Baris
                      </button>
                      <button type="button" class="btn btn-xs btn-outline-danger py-0 px-1 extra-small" @click="deleteRow" title="Hapus Baris">
                        - Baris
                      </button>
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1 extra-small" @click="insertColumn" title="Tambah Kolom Kanan">
                        + Kolom
                      </button>
                      <button type="button" class="btn btn-xs btn-outline-danger py-0 px-1 extra-small" @click="deleteColumn" title="Hapus Kolom">
                        - Kolom
                      </button>
                      <button type="button" class="btn btn-xs btn-outline-danger py-0 px-1 extra-small text-danger" @click="deleteTable" title="Hapus Tabel">
                        Hapus Tabel
                      </button>
                    </div>
                  </div>
                  <QuillEditor
                    :key="editorKey"
                    theme="snow"
                    content-type="html"
                    v-model:content="form.materi"
                    :options="editorOptions"
                    @ready="onEditorReady"
                    style="height: 150px; background-color: white;"
                    placeholder="Contoh: Jadwal, waktu, materi, dan pemateri..."
                  />
                </div>
              </div>
            </div>

            <hr class="my-4 text-muted-light" />

            <!-- File Upload / Bukti sertifikat -->
            <div class="form-group mb-4">
              <label class="form-label"><i class="fas fa-file-upload me-1"></i>Berkas Sertifikat / Bukti</label>
              
              <!-- Drag and drop zone -->
              <div 
                class="file-dropzone rounded-3 p-4 text-center d-flex flex-column align-items-center justify-content-center"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="handleFileDrop"
                :class="{ 'drag-over': dragOver, 'file-selected': form.file }"
                @click="triggerFileInput"
              >
                <input 
                  type="file" 
                  ref="fileInputRef" 
                  class="d-none" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="handleFileChange"
                />
                
                <div v-if="!form.file" class="dropzone-prompt text-muted">
                  <i class="fas fa-cloud-upload-alt fa-2x mb-2 text-primary"></i>
                  <span class="d-block fw-bold small">Klik / Seret berkas ke sini</span>
                  <span class="extra-small text-muted d-block mt-1">Format: PDF, JPG, PNG (Maks. 5MB)</span>
                </div>
                
                <div v-else class="dropzone-fileinfo text-success">
                  <i class="fas" :class="form.file.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-image'"></i>
                  <span class="d-block fw-bold small text-truncate mt-2" style="max-width: 250px;">{{ form.file.name }}</span>
                  <span class="extra-small text-muted d-block">{{ formatBytes(form.file.size) }}</span>
                  <button type="button" class="btn btn-link btn-sm text-danger mt-2" @click.stop="removeSelectedFile">
                    Hapus File
                  </button>
                </div>
              </div>
              <div v-if="isEditMode && currentBerkasName && !form.file" class="mt-2 text-muted small">
                <i class="fas fa-info-circle me-1"></i>Berkas aktif saat ini: 
                <a @click.prevent="previewCurrentBerkas" href="#" class="text-decoration-none fw-semibold">{{ currentBerkasName }}</a>
              </div>
            </div>
          </form>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <button 
            type="button" 
            class="btn btn-secondary shadow-none" 
            @click="closeSidebar"
            :disabled="submitting"
          >
            Batal
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="submitForm"
            :disabled="submitting || (!form.id_kegiatan && !form.isNewKegiatan && !isEditMode)"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="fas fa-save me-1"></i>
            <span>{{ isEditMode ? 'Simpan Perubahan' : 'Simpan Data' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- PREMIUM DOCUMENT PREVIEW MODAL -->
    <div 
      v-if="showPreviewModal && activePreviewDoc" 
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style="z-index: 2050; background-color: rgba(15, 23, 42, 0.45); backdrop-filter: blur(8px);"
      @click.self="closePreviewModal"
    >
      <div 
        class="bg-white rounded-4 shadow-2xl border w-100 mx-3 d-flex flex-column overflow-hidden animate__animated animate__zoomIn animate__faster" 
        style="max-width: 1100px; height: 85vh; border-color: #e2e8f0 !important;"
      >
        <!-- Preview Modal Header -->
        <div class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom preview-modal-header bg-light">
          <div class="d-flex align-items-center gap-3 flex-grow-1 me-3" style="min-width: 0;">
            <div 
              :class="['d-flex align-items-center justify-content-center flex-shrink-0 text-white rounded-3', activePreviewDoc.file.toLowerCase().endsWith('.pdf') ? 'bg-danger' : 'bg-success']"
              style="width: 38px; height: 38px;"
            >
              <i class="fas" :class="activePreviewDoc.file.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-image'" style="font-size: 1.2rem;"></i>
            </div>
            <div class="d-flex flex-column text-start flex-grow-1" style="min-width: 0;">
              <span class="fw-bold text-dark font-sans text-truncate d-block text-start m-0" style="font-size: 0.95rem;">
                {{ activePreviewDoc.nama }}
              </span>
              <span class="text-muted text-truncate font-mono d-block mt-0.5 text-start" style="font-size: 0.72rem;">
                {{ activePreviewDoc.file }}
              </span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <a 
              :href="getDocUrl(activePreviewDoc.file)" 
              target="_blank" 
              class="btn btn-sm btn-outline-secondary font-sans d-flex align-items-center gap-2 px-3 border-slate shadow-none"
            >
              <i class="fas fa-external-link-alt" style="font-size: 0.75rem;"></i>
              <span>Tab Baru</span>
            </a>
            <button 
              type="button" 
              class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px; border-radius: 50%;"
              @click="closePreviewModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Preview Modal Body -->
        <div class="flex-grow-1 p-3 bg-light d-flex align-items-center justify-content-center overflow-auto position-relative" style="background-color: #f1f5f9;">
          <!-- PDF Frame (Desktop Only) -->
          <iframe 
            v-if="activePreviewDoc.file.toLowerCase().endsWith('.pdf') && !isMobile" 
            :src="getDocUrl(activePreviewDoc.file)" 
            width="100%" 
            height="100%" 
            style="border: none; border-radius: 8px; background-color: #fff;"
          ></iframe>

          <!-- PDF Fallback for Mobile -->
          <div 
            v-else-if="activePreviewDoc.file.toLowerCase().endsWith('.pdf') && isMobile"
            class="w-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-white rounded-3 shadow-sm border"
            style="max-width: 400px;"
          >
            <div 
              class="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-4"
              style="width: 80px; height: 80px; background-color: #fef2f2;"
            >
              <i class="fas fa-file-pdf" style="font-size: 3rem; color: #ef4444;"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Pratinjau PDF di Mobile Terbatas</h5>
            <p class="text-muted small px-2 mb-4" style="line-height: 1.45;">
              Browser ponsel membatasi render dokumen PDF secara langsung. Ketuk tombol di bawah untuk membukanya di pembaca PDF bawaan handphone Anda.
            </p>
            <a 
              :href="getDocUrl(activePreviewDoc.file)" 
              target="_blank" 
              class="btn btn-danger w-100 py-2.5 rounded-3 fw-bold border-0 text-white shadow-sm"
              style="background-color: #ef4444;"
            >
              <i class="fas fa-external-link-alt me-1"></i> Buka PDF
            </a>
          </div>
          
          <!-- Image Element -->
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center p-2">
            <img 
              :src="getDocUrl(activePreviewDoc.file)" 
              class="img-fluid rounded-3 shadow max-w-100 max-h-100" 
              style="object-fit: contain; max-height: calc(80vh - 80px);"
              alt="Preview Sertifikat"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- ════ MODAL PREVIEW SERTIFIKAT PDF INTERNAL ════ -->
    <div
      v-if="showSertifikatModal"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style="z-index: 2060; background-color: rgba(15, 23, 42, 0.45); backdrop-filter: blur(8px);"
      @click.self="closeSertifikatModal"
    >
      <div
        class="bg-white rounded-4 shadow-2xl border w-100 mx-3 d-flex flex-column overflow-hidden animate__animated animate__zoomIn animate__faster"
        style="max-width: 1100px; height: 85vh; border-color: #e2e8f0 !important;"
      >
        <!-- Preview Modal Header — sama persis dengan modal eksternal -->
        <div class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom preview-modal-header bg-light">
          <div class="d-flex align-items-center gap-3 flex-grow-1 me-3" style="min-width: 0;">
            <!-- Icon PDF merah di kotak rounded -->
            <div
              class="d-flex align-items-center justify-content-center flex-shrink-0 text-white rounded-3 bg-danger"
              style="width: 38px; height: 38px;"
            >
              <i class="fas fa-file-pdf" style="font-size: 1.2rem;"></i>
            </div>
            <!-- Judul & filename -->
            <div class="d-flex flex-column text-start flex-grow-1" style="min-width: 0;">
              <span class="fw-bold text-dark font-sans text-truncate d-block text-start m-0" style="font-size: 0.95rem;">
                {{ sertifikatNamaKegiatan }}
              </span>
              <span class="text-muted text-truncate font-mono d-block mt-0.5 text-start" style="font-size: 0.72rem;">
                {{ sertifikatFileName }}
              </span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <!-- Tombol Unduh -->
            <button
              class="btn btn-sm btn-outline-secondary font-sans d-flex align-items-center gap-2 px-3 border-slate shadow-none"
              @click="downloadSertifikat"
              title="Unduh PDF ke komputer"
            >
              <i class="fas fa-download" style="font-size: 0.75rem;"></i>
              <span>Unduh</span>
            </button>
            <!-- Tombol Cetak Printer -->
            <button
              class="btn btn-sm btn-outline-secondary font-sans d-flex align-items-center gap-2 px-3 border-slate shadow-none"
              @click="printSertifikatDirect"
              title="Cetak ke Printer"
            >
              <i class="fas fa-print" style="font-size: 0.75rem;"></i>
              <span>Cetak</span>
            </button>
            <!-- Tutup -->
            <button
              type="button"
              class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
              style="width: 32px; height: 32px; border-radius: 50%;"
              @click="closeSertifikatModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Preview Modal Body -->
        <div class="flex-grow-1 p-3 bg-light d-flex align-items-center justify-content-center overflow-auto position-relative" style="background-color: #f1f5f9;">
          <!-- Loading spinner -->
          <div v-if="sertifikatLoading" class="position-absolute d-flex flex-column align-items-center gap-2">
            <div class="spinner-border text-primary" role="status"></div>
            <span class="small text-muted font-sans">Memuat pratinjau...</span>
          </div>

          <!-- iframe PDF viewer (Desktop) -->
          <iframe
            v-if="sertifikatBlobUrl && !isMobile"
            :src="sertifikatBlobUrl"
            width="100%"
            height="100%"
            style="border: none; border-radius: 8px; background-color: #fff;"
            @load="sertifikatLoading = false"
          ></iframe>

          <!-- PDF Fallback for Mobile — sama dengan modal eksternal -->
          <div
            v-else-if="isMobile"
            class="w-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-white rounded-3 shadow-sm border"
            style="max-width: 400px;"
          >
            <div
              class="d-flex align-items-center justify-content-center rounded-circle mb-4"
              style="width: 80px; height: 80px; background-color: #fef2f2;"
            >
              <i class="fas fa-file-pdf" style="font-size: 3rem; color: #ef4444;"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Pratinjau PDF di Mobile Terbatas</h5>
            <p class="text-muted small px-2 mb-4" style="line-height: 1.45;">
              Browser ponsel membatasi render dokumen PDF secara langsung. Ketuk tombol di bawah untuk mengunduh atau mencetak.
            </p>
            <div class="d-flex gap-2 w-100">
              <button
                class="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold border-0 text-white shadow-sm"
                @click="downloadSertifikat"
              >
                <i class="fas fa-download me-1"></i> Unduh PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import debounce from 'lodash/debounce'
import { pegawaiService } from '@/services/pegawaiService'
import { diklatService } from '@/services/diklatService'
import { generateSertifikatDiklat, downloadPdfFromBlob, printPdfFromBlob } from '@/utils/diklatSertifikatPdf'
import config from '@/config/api'
import logoRsiaAsset from '@/assets/logo-rsia.png'
import logoLarsiAsset from '@/assets/logo-larsi.png'
import { QuillEditor } from '@vueup/vue-quill'
import 'quill/dist/quill.snow.css'

const toast = useToast()

// Detection of Mobile Devices
const isMobile = ref(false)
const detectMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
}

// Master Employee List State
const employees = ref([])
const loadingEmployees = ref(false)
const empSearchQuery = ref('')

// Detail State
const selectedEmployee = ref(null)
const diklatList = ref([])
const loadingDiklat = ref(false)

// Kegiatan (Activity) Search Autocomplete
const kegQuery = ref('')
const kegResults = ref([])
const selectedKegiatanRecord = ref(null)

// Sidebar Form State
const showFormSidebar = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const selectedDiklatItem = ref(null)

const editorKey = ref(0)
watch(showFormSidebar, (newVal) => {
  if (newVal) {
    editorKey.value++
  }
})

let activeQuill = null
const onEditorReady = (quillInstance) => {
  activeQuill = quillInstance
}

const insertRow = () => {
  if (activeQuill) {
    const tableModule = activeQuill.getModule('table')
    if (tableModule) {
      tableModule.insertRowBelow()
    }
  }
}
const deleteRow = () => {
  if (activeQuill) {
    const tableModule = activeQuill.getModule('table')
    if (tableModule) {
      tableModule.deleteRow()
    }
  }
}
const insertColumn = () => {
  if (activeQuill) {
    const tableModule = activeQuill.getModule('table')
    if (tableModule) {
      tableModule.insertColumnRight()
    }
  }
}
const deleteColumn = () => {
  if (activeQuill) {
    const tableModule = activeQuill.getModule('table')
    if (tableModule) {
      tableModule.deleteColumn()
    }
  }
}
const deleteTable = () => {
  if (activeQuill) {
    const tableModule = activeQuill.getModule('table')
    if (tableModule) {
      tableModule.deleteTable()
    }
  }
}

const cleanHtmlTable = (htmlStr) => {
  if (!htmlStr || htmlStr.trim() === '') return ''

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlStr, 'text/html')
    const tables = doc.querySelectorAll('table')
    if (tables.length === 0) return htmlStr

    tables.forEach(table => {
      // 1. Ensure <tbody> exists
      let tbody = table.querySelector('tbody')
      if (!tbody) {
        tbody = doc.createElement('tbody')
        const children = Array.from(table.childNodes)
        children.forEach(child => {
          if (child.nodeName === 'TR') {
            tbody.appendChild(child)
          }
        })
        table.appendChild(tbody)
      }

      // 2. Add data-row to td/th cells and clean cell attributes
      const rows = table.querySelectorAll('tr')
      rows.forEach((row) => {
        const rowId = 'row-' + Math.random().toString(36).slice(2, 6)
        const cells = row.querySelectorAll('td, th')
        cells.forEach(cell => {
          cell.setAttribute('data-row', rowId)
          cell.classList.add('ql-table-cell')
          
          const allowedAttributes = ['colspan', 'rowspan', 'data-row', 'class']
          const attribs = Array.from(cell.attributes)
          attribs.forEach(attr => {
            if (!allowedAttributes.includes(attr.name.toLowerCase())) {
              cell.removeAttribute(attr.name)
            }
          })
        })
      })

      // 3. Strip attributes from table, tbody, and tr to avoid MS Word conflicts
      const cleanElementAttribs = (el, allowed) => {
        const attribs = Array.from(el.attributes)
        attribs.forEach(attr => {
          if (!allowed.includes(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name)
          }
        })
      }
      cleanElementAttribs(table, [])
      cleanElementAttribs(tbody, [])
      rows.forEach(r => cleanElementAttribs(r, []))
    })

    return doc.body.innerHTML
  } catch (e) {
    console.warn('Error cleaning HTML table:', e)
    return htmlStr
  }
}

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['table'],
      ['clean']
    ],
    table: true
  }
}

// File Upload Drag & Drop State
const dragOver = ref(false)
const fileInputRef = ref(null)
const currentBerkasName = ref('')

// Form Reactive State
const form = reactive({
  peserta: 'Peserta',
  id_kegiatan: null,
  isNewKegiatan: false,
  nama_kegiatan: '',
  tempat: '',
  kategori: 'Internal',
  tgl_mulai: '',
  tgl_akhir: '',
  jpl: '',
  skp: '',
  penyelenggara: '',
  nomor: '',
  materi: '',
  file: null,
  ttd1_id: null,
  ttd2_id: null
})

// Initialize Page
onMounted(() => {
  detectMobile()
  loadInitialEmployees()
})

// === LOAD INITIAL EMPLOYEES ===
const loadInitialEmployees = async () => {
  loadingEmployees.value = true
  try {
    // Ambil semua karyawan aktif (limit 500, API default sudah filter stts_aktif=AKTIF)
    const response = await pegawaiService.getKaryawanList({ limit: 500 })
    employees.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load initial employees:', error)
    toast.error('Gagal memuat daftar karyawan')
  } finally {
    loadingEmployees.value = false
  }
}

// === EMPLOYEE SEARCH (LEFT PANEL) ===
const handleEmpSearch = debounce(async () => {
  if (empSearchQuery.value.trim().length === 0) {
    loadInitialEmployees()
    return
  }
  
  if (empSearchQuery.value.trim().length < 3) {
    return
  }

  loadingEmployees.value = true
  try {
    const response = await pegawaiService.searchPegawai(empSearchQuery.value)
    employees.value = response.data?.data || []
  } catch (error) {
    console.error('Failed employee search:', error)
    toast.error('Gagal mencari pegawai')
  } finally {
    loadingEmployees.value = false
  }
}, 400)

const clearEmpSearch = () => {
  empSearchQuery.value = ''
  loadInitialEmployees()
}

const selectEmployee = (emp) => {
  selectedEmployee.value = emp
  loadEmployeeDiklat(emp.nik)
}

// === LOAD DIKLAT LIST ===
const loadEmployeeDiklat = async (nik) => {
  loadingDiklat.value = true
  diklatList.value = []
  try {
    const response = await diklatService.getDiklatByNik(nik)
    diklatList.value = response.data?.data || []
  } catch (error) {
    if (error.response?.status === 404) {
      diklatList.value = []
    } else {
      console.error('Failed to load diklat history:', error)
      toast.error('Gagal mengambil riwayat diklat')
    }
  } finally {
    loadingDiklat.value = false
  }
}

// === KEGIATAN AUTOCOMPLETE ===
const searchActivities = debounce(async () => {
  if (kegQuery.value.length < 2) {
    kegResults.value = []
    return
  }
  try {
    const response = await diklatService.getKegiatan(kegQuery.value)
    kegResults.value = response.data?.data || []
  } catch (error) {
    console.error('Failed activities search:', error)
  }
}, 300)

const selectActivity = (keg) => {
  selectedKegiatanRecord.value = keg
  form.id_kegiatan = keg.id
  kegQuery.value = keg.nama_kegiatan
  kegResults.value = []
}

const clearKegiatanSelection = () => {
  selectedKegiatanRecord.value = null
  form.id_kegiatan = null
  kegQuery.value = ''
  kegResults.value = []
}

// === FILE DRAG AND DROP HANDLERS ===
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleFileDrop = (e) => {
  dragOver.value = false
  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file) => {
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
  const fileExt = file.name.split('.').pop().toLowerCase()
  
  if (!allowedExtensions.includes(fileExt)) {
    toast.warning('Hanya menerima format berkas PDF, JPG, atau PNG')
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    toast.warning('Ukuran file maksimal adalah 5MB')
    return
  }

  form.file = file
}

const removeSelectedFile = () => {
  form.file = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// === SIDEBAR FORM CONTROLLER ===
const resetForm = () => {
  form.peserta = 'Peserta'
  form.id_kegiatan = null
  form.isNewKegiatan = false
  form.nama_kegiatan = ''
  form.tempat = ''
  form.kategori = 'Internal'
  form.tgl_mulai = ''
  form.tgl_akhir = ''
  form.jpl = ''
  form.skp = ''
  form.penyelenggara = ''
  form.nomor = ''
  form.materi = ''
  form.file = null
  form.ttd1_id = null
  form.ttd2_id = null
  
  kegQuery.value = ''
  kegResults.value = []
  selectedKegiatanRecord.value = null
  currentBerkasName.value = ''
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const openAddModal = () => {
  if (!selectedEmployee.value) {
    toast.warning('Silakan pilih karyawan terlebih dahulu')
    return
  }
  resetForm()
  isEditMode.value = false
  showFormSidebar.value = true
}

const openEditModal = (item) => {
  resetForm()
  isEditMode.value = true
  selectedDiklatItem.value = item
  
  // Fill pivot data
  form.peserta = item.peserta
  form.id_kegiatan = item.id_kegiatan
  form.isNewKegiatan = false
  currentBerkasName.value = item.berkas || ''
  
  // Fill linked kegiatan data
  if (item.kegiatan) {
    form.nama_kegiatan = item.kegiatan.nama_kegiatan || ''
    form.tempat = item.kegiatan.tempat || ''
    form.kategori = item.kegiatan.kategori || 'Internal'
    form.tgl_mulai = item.kegiatan.tgl_mulai || ''
    form.tgl_akhir = item.kegiatan.tgl_akhir || ''
    form.jpl = item.kegiatan.jpl || ''
    form.skp = item.kegiatan.skp || ''
    form.penyelenggara = item.kegiatan.penyelenggara || ''
    form.nomor = item.kegiatan.nomor || ''
    form.materi = cleanHtmlTable(item.kegiatan.materi || '')
    form.ttd1_id = item.kegiatan.ttd1_id || null
    form.ttd2_id = item.kegiatan.ttd2_id || null
  }
  
  showFormSidebar.value = true
}

const closeSidebar = () => {
  if (submitting.value) return
  showFormSidebar.value = false
}

// === SUBMIT DIKLAT ===
const submitForm = async () => {
  submitting.value = true
  
  const formData = new FormData()
  formData.append('nik', selectedEmployee.value.nik)
  formData.append('peserta', form.peserta)
  
  if (form.file) {
    formData.append('file', form.file)
  }

  if (!form.isNewKegiatan && form.id_kegiatan && !isEditMode.value) {
    formData.append('id_kegiatan', form.id_kegiatan)
  } else {
    if (isEditMode.value) {
      formData.append('id_kegiatan', form.id_kegiatan)
    }
    formData.append('nama_kegiatan', form.nama_kegiatan)
    formData.append('tempat', form.tempat)
    formData.append('kategori', form.kategori)
    formData.append('tgl_mulai', form.tgl_mulai)
    if (form.tgl_akhir) formData.append('tgl_akhir', form.tgl_akhir)
    if (form.jpl) formData.append('jpl', form.jpl)
    if (form.skp) formData.append('skp', form.skp)
    if (form.penyelenggara) formData.append('penyelenggara', form.penyelenggara)
    if (form.nomor) formData.append('nomor', form.nomor)
    if (form.materi) formData.append('materi', form.materi)
    if (form.ttd1_id !== null) formData.append('ttd1_id', form.ttd1_id)
    if (form.ttd2_id !== null) formData.append('ttd2_id', form.ttd2_id)
  }

  try {
    if (isEditMode.value) {
      await diklatService.updateDiklat(selectedDiklatItem.value.id, formData)
      toast.success('Record diklat berhasil diperbarui')
    } else {
      await diklatService.storeDiklat(formData)
      toast.success('Record diklat baru berhasil ditambahkan')
    }
    
    showFormSidebar.value = false
    loadEmployeeDiklat(selectedEmployee.value.nik)
  } catch (error) {
    console.error('Failed to submit form:', error)
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan data diklat'
    toast.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

// === DELETE DIKLAT RECORD ===
const deleteDiklatRecord = async (item) => {
  const result = await Swal.fire({
    title: 'Hapus Record Diklat?',
    html: `Apakah Anda yakin ingin menghapus data diklat <strong>${item.kegiatan?.nama_kegiatan}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    backdrop: `rgba(15, 23, 42, 0.35)`
  })

  if (result.isConfirmed) {
    try {
      await diklatService.deleteDiklat(item.id)
      toast.success('Record diklat berhasil dihapus')
      loadEmployeeDiklat(selectedEmployee.value.nik)
    } catch (error) {
      console.error('Failed to delete diklat:', error)
      toast.error('Gagal menghapus record diklat')
    }
  }
}

// === PREVIEW CERTIFICATE MODAL ===
const showPreviewModal = ref(false)
const activePreviewDoc = ref(null)

const previewCertificate = (item) => {
  if (!item.berkas) return
  activePreviewDoc.value = {
    nama: item.kegiatan?.nama_kegiatan || 'Sertifikat Diklat',
    file: item.berkas
  }
  showPreviewModal.value = true
}

const previewCurrentBerkas = () => {
  if (!currentBerkasName.value) return
  activePreviewDoc.value = {
    nama: form.nama_kegiatan || 'Sertifikat Diklat',
    file: currentBerkasName.value
  }
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  activePreviewDoc.value = null
}

const getDocUrl = (fileName) => {
  return `${config.public.API_V2_URL}/diklat/download/${fileName}`
}

// === CETAK SERTIFIKAT INTERNAL (PDF Generator + Preview Modal) ===
const showSertifikatModal = ref(false)
const sertifikatBlobUrl = ref(null)
const sertifikatFileName = ref('')
const sertifikatNamaKegiatan = ref('')
const sertifikatLoading = ref(false)

const printSertifikat = async (item) => {
  if (!selectedEmployee.value) {
    toast.warning('Data karyawan tidak ditemukan')
    return
  }

  sertifikatLoading.value = true
  showSertifikatModal.value = true
  sertifikatBlobUrl.value = null
  sertifikatFileName.value = ''
  sertifikatNamaKegiatan.value = item.kegiatan?.nama_kegiatan || 'Sertifikat Diklat Internal'

  try {
    const result = await generateSertifikatDiklat(
      item,
      selectedEmployee.value,
      {
        direkturNama: item.kegiatan?.ttd1_pegawai?.nama || item.kegiatan?.ttd1 || undefined,
        ketuaPanitia: item.kegiatan?.ttd2_pegawai?.nama || item.kegiatan?.ttd2 || undefined,
        logoRsiaUrl: logoRsiaAsset,
        logoLarsiUrl: logoLarsiAsset,
      }
    )
    sertifikatBlobUrl.value = result.blobUrl
    sertifikatFileName.value = result.fileName
    // loading akan false saat iframe onload
  } catch (err) {
    console.error('Gagal generate sertifikat:', err)
    toast.error('Gagal membuat PDF: ' + (err.message || 'unknown error'))
    showSertifikatModal.value = false
    sertifikatLoading.value = false
  }
}

const closeSertifikatModal = () => {
  showSertifikatModal.value = false
  sertifikatLoading.value = false
  // Bebaskan memori Blob URL
  if (sertifikatBlobUrl.value) {
    URL.revokeObjectURL(sertifikatBlobUrl.value)
    sertifikatBlobUrl.value = null
  }
}

const downloadSertifikat = () => {
  if (sertifikatBlobUrl.value) {
    downloadPdfFromBlob(sertifikatBlobUrl.value, sertifikatFileName.value)
    toast.success('PDF diunduh ke folder Downloads')
  }
}

const printSertifikatDirect = () => {
  if (sertifikatBlobUrl.value) {
    printPdfFromBlob(sertifikatBlobUrl.value)
  }
}

// === HELPERS & FORMATTING ===
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateRange = (start, end) => {
  if (!start) return '-'
  if (!end || start === end) return formatDate(start)
  
  const dStart = new Date(start)
  const dEnd = new Date(end)
  
  if (dStart.getFullYear() === dEnd.getFullYear()) {
    if (dStart.getMonth() === dEnd.getMonth()) {
      return `${dStart.getDate()} - ${dEnd.getDate()} ${dStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`
    }
    return `${dStart.getDate()} ${dStart.toLocaleDateString('id-ID', { month: 'short' })} - ${dEnd.getDate()} ${dEnd.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

const getRoleColorClass = (role) => {
  const classes = {
    'Peserta': 'bg-success-subtle text-success border-success-subtle',
    'Pemateri': 'bg-primary-subtle text-primary border-primary-subtle',
    'Panitia': 'bg-warning-subtle text-warning-dark border-warning-subtle'
  }
  return classes[role] || 'bg-light text-dark'
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Page styling following modern dashboard guidelines */
.karyawan-container {
  min-height: 85vh;
  color: #1e293b;
}

.text-dark-blue {
  color: #1e3a8a;
}

.text-warning-dark {
  color: #b45309;
}

.bg-warning-subtle {
  background-color: #fef3c7;
}

/* Sticky left panel - stays in view while right panel scrolls */
.left-sticky-panel {
  position: sticky;
  top: 1rem;
  align-self: flex-start;
}

/* Master list left panel custom styling */
.scrollable-emp-list {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.scrollable-emp-list::-webkit-scrollbar {
  width: 5px;
}

.scrollable-emp-list::-webkit-scrollbar-track {
  background: #f8fafc;
}

.scrollable-emp-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.scrollable-emp-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.list-group-item {
  border-radius: 10px !important;
  margin: 0.25rem 0.75rem;
  width: calc(100% - 1.5rem);
  border: 1px solid transparent !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f1f5f9;
}

.list-group-item.active-emp-item {
  background-color: #eff6ff !important;
  border-color: #bfdbfe !important;
}

.list-group-item.active-emp-item .text-dark {
  color: #2563eb !important;
}

.search-icon-left {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.88rem;
}

.btn-clear-left {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.btn-clear-left:hover {
  color: #ef4444;
}

.btn-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.btn-clear:hover {
  color: #ef4444;
}

.avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.avatar-md {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.4rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.initials-md {
  color: #3b82f6;
}

/* Gradient card header for employee profile summary */
.card-header-gradient {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  position: relative;
  overflow: hidden;
}

/* Left panel header - Indigo dark */
.card-header-left {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-bottom: none;
}

/* History card header - Teal/Cyan accent to differentiate */
.card-header-history {
  background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%);
  border-bottom: none;
}

/* Profile banner subtitle - jabatan/departemen, high contrast white */
.banner-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* Profile banner caption - NIK/date, still readable */
.banner-caption {
  color: rgba(255, 255, 255, 0.82) !important;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.deco-circle {
  position: absolute;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  top: -40px;
  right: -40px;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.85);
}

.text-white-60 {
  color: rgba(255, 255, 255, 0.65);
}

/* Empty icon card styling */
.empty-icon-wrapper {
  color: #cbd5e1;
}

/* Table styling and custom action buttons */
.diklat-row {
  transition: background-color 0.2s;
}

.diklat-row:hover {
  background-color: #f8fafc;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Drag and Drop Zone styling */
.file-dropzone {
  border: 2px dashed #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f8fafc;
}

.file-dropzone:hover, .file-dropzone.drag-over {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.03);
}

.file-dropzone.file-selected {
  border-style: solid;
  border-color: #22c55e;
  background-color: rgba(34, 197, 94, 0.02);
}

/* Modal pratinjau headers */
.preview-modal-header {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Custom autocomplete dropdown */
.search-results-dropdown {
  position: absolute;
  top: 105%;
  left: 0;
  width: 100%;
  background: white;
  z-index: 1001;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0 !important;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f1f5f9;
}

/* ===== SIDEBAR FORM ===== */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(3px);
  z-index: 1040;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

.sidebar-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  width: 820px;
  max-width: 95vw;
  height: 85vh;
  max-height: 95vh;
  background: #fff;
  z-index: 1045;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-form.active {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%) scale(1);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  flex-shrink: 0;
}

.sidebar-header h5 {
  color: white;
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sidebar-close {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar-close:hover {
  background: rgba(255,255,255,0.25);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.sidebar-body::-webkit-scrollbar {
  width: 4px;
}

.sidebar-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ===== TOGGLE SWITCH ===== */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 40px;
  height: 22px;
  background-color: #cbd5e1;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  top: 3px;
  left: 3px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-switch input:checked + .toggle-slider::after {
  left: 21px;
}

.toggle-label {
  color: #64748b;
  user-select: none;
  font-size: 0.75rem;
}

/* ===== MISC UTILITIES ===== */
.extra-small {
  font-size: 0.75rem !important;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}

.font-sans {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

.text-muted-light {
  color: #cbd5e1 !important;
}

.btn-add {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Outlined white button for use on dark/blue header backgrounds */
.btn-add-outline {
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-add-outline:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: #ffffff;
  transform: translateY(-1px);
}

/* Gradient header for card */
.data-table thead th {
  background-color: #f1f5f9;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  padding: 0.75rem 1rem;
  white-space: nowrap;
}

.data-table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar-form {
    width: 95vw;
    max-height: 95vh;
  }
}
</style>
