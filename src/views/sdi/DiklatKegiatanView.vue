<template>
  <div class="kegiatan-container py-4">
    <!-- Header Page -->
    <div class="page-header mb-4">
      <div class="header-info">
        <h2 class="section-title text-dark-blue fw-bold font-sans">
          <i class="fas fa-calendar-alt text-primary me-2"></i>Diklat per Kegiatan
        </h2>
        <p class="text-muted small m-0">Kelola kegiatan pelatihan dan lihat peserta/karyawan yang telah mengikuti kegiatan tersebut.</p>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="row g-3 align-items-start">
      <!-- Left Panel: Searchable Kegiatan List (Master) -->
      <div class="col-md-4 left-sticky-panel">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeInLeft">
          <div class="card-header-left py-3 px-4 d-flex align-items-center justify-content-between">
            <h6 class="fw-bold m-0 text-white font-sans">
              <i class="fas fa-list-ul me-2 opacity-75"></i>Daftar Kegiatan
            </h6>
            <button 
              class="btn-baru-custom font-sans"
              @click="openAddKegiatanModal"
            >
              <i class="fas fa-plus"></i> Baru
            </button>
          </div>
          
          <div class="p-3 border-bottom bg-light">
            <div class="search-box position-relative">
              <i class="fas fa-search search-icon-left"></i>
              <input 
                type="text" 
                v-model="kegSearchQuery" 
                @input="handleKegSearch"
                placeholder="Cari nama kegiatan..."
                class="form-control form-control-sm ps-5"
              />
              <button v-if="kegSearchQuery" @click="clearKegSearch" class="btn-clear-left">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body p-0 scrollable-keg-list">
            <!-- Loading Kegiatan -->
            <div v-if="loadingKegiatan" class="p-4 text-center text-muted">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <p class="small font-sans m-0">Memuat kegiatan...</p>
            </div>

            <!-- Empty Results -->
            <div v-else-if="kegiatanList.length === 0" class="p-4 text-center text-muted">
              <i class="fas fa-search-minus fa-2x mb-2 text-muted-light"></i>
              <p class="small font-sans m-0">Kegiatan tidak ditemukan</p>
            </div>

            <!-- Kegiatan List -->
            <div v-else class="list-group list-group-flush">
              <button 
                v-for="keg in kegiatanList" 
                :key="keg.id" 
                :class="['list-group-item list-group-item-action border-0 d-flex flex-column gap-1 p-3 transition-all', selectedKegiatan?.id === keg.id ? 'active-keg-item' : '']"
                @click="selectKegiatan(keg)"
              >
                <div class="d-flex align-items-center justify-content-between w-100">
                  <div class="d-flex align-items-center gap-2">
                    <span :class="['badge rounded-pill extra-small px-2 py-0.5', keg.kategori === 'Internal' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-dark']">
                      {{ keg.kategori || 'Eksternal' }}
                    </span>
                    <button 
                      class="btn-edit-kegiatan-icon border-0 bg-transparent text-secondary p-0" 
                      @click.stop="openEditKegiatanModal(keg)"
                      title="Edit Kegiatan"
                      style="font-size: 0.75rem; cursor: pointer; width: auto !important;"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                  <span class="text-muted extra-small font-mono">
                    {{ formatDate(keg.tgl_mulai) }}
                  </span>
                </div>
                <span class="d-block fw-bold text-dark text-truncate w-100 text-start mt-1" style="font-size: 0.88rem;" :title="keg.nama_kegiatan">
                  {{ keg.nama_kegiatan }}
                </span>
                <div class="d-flex align-items-center justify-content-between mt-1 w-100">
                  <span class="text-muted extra-small text-truncate text-start" style="max-width: 70%;">
                    <i class="fas fa-map-marker-alt me-1 text-muted-light"></i>{{ keg.tempat || '-' }}
                  </span>
                  <span class="text-secondary extra-small fw-bold" v-if="keg.jpl">
                    {{ keg.jpl }} JPL
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Kegiatan Details & Participants List (Detail) -->
      <div class="col-md-8">
        <div class="d-flex flex-column gap-4 h-100">
          
          <!-- Kegiatan Details Banner (Only when selected) -->
          <div v-if="selectedKegiatan" class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn position-relative">
            <div class="card-header-gradient p-4 text-white position-relative">
              <div class="deco-circle"></div>
              <div class="row align-items-center g-3">
                <div class="col text-start">
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="badge bg-white text-primary text-uppercase rounded-pill extra-small font-sans px-2 border-0 fw-bold">
                      {{ selectedKegiatan.kategori || 'Eksternal' }}
                    </span>
                    <span class="badge border border-white text-white rounded-pill extra-small font-sans px-2 fw-medium" v-if="selectedKegiatan.nomor">
                      SK: {{ selectedKegiatan.nomor }}
                    </span>
                  </div>
                  <h4 class="fw-bold m-0 text-white mt-2 leading-snug">{{ selectedKegiatan.nama_kegiatan }}</h4>
                  
                  <div class="row g-2 mt-3 pt-2 border-top border-white border-opacity-10">
                    <div class="col-sm-6">
                      <p class="banner-subtitle small m-0">
                        <i class="fas fa-map-marker-alt me-2 text-white-80"></i>Tempat: {{ selectedKegiatan.tempat || '-' }}
                      </p>
                      <p class="banner-subtitle small m-0 mt-1" v-if="selectedKegiatan.penyelenggara">
                        <i class="fas fa-university me-2 text-white-80"></i>Penyelenggara: {{ selectedKegiatan.penyelenggara }}
                      </p>
                    </div>
                    <div class="col-sm-6">
                      <p class="banner-subtitle small m-0">
                        <i class="fas fa-calendar-alt me-2 text-white-80"></i>Waktu: {{ formatDateRange(selectedKegiatan.tgl_mulai, selectedKegiatan.tgl_akhir) }}
                      </p>
                      <p class="banner-subtitle small m-0 mt-1">
                        <i class="fas fa-award me-2 text-white-80"></i>Bobot: 
                        <span v-if="selectedKegiatan.jpl" class="me-2">{{ selectedKegiatan.jpl }} JPL</span>
                        <span v-if="selectedKegiatan.skp">{{ selectedKegiatan.skp }} SKP</span>
                        <span v-if="!selectedKegiatan.jpl && !selectedKegiatan.skp">-</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Participants List Card -->
          <div class="card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn flex-grow-1">
            <div class="card-header-history py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 class="m-0 fw-bold text-white font-sans">
                <i class="fas fa-users me-2 opacity-75"></i>Daftar Karyawan Terdaftar
              </h5>
              
              <div class="d-flex align-items-center gap-2" v-if="selectedKegiatan">
                <button 
                  v-if="participants.length > 0"
                  class="btn btn-sm btn-light text-primary font-sans rounded-3 px-3 d-inline-flex align-items-center gap-2 fw-semibold"
                  style="border: 1.5px solid transparent; font-size: 0.85rem; padding-top: 0.35rem; padding-bottom: 0.35rem;"
                  @click="bulkDownloadCertificates"
                  :disabled="bulkDownloading"
                >
                  <span v-if="bulkDownloading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="fas fa-file-archive"></i>
                  <span>Unduh Semua (.ZIP)</span>
                </button>

                <button 
                  class="btn-add-outline font-sans px-3 rounded-3 d-inline-flex align-items-center gap-2"
                  @click="openAddParticipantModal"
                >
                  <i class="fas fa-plus"></i>
                  <span>Tambah Peserta</span>
                </button>
              </div>
            </div>

            <div class="card-body p-0 position-relative h-100">
              <!-- Loader State -->
              <div v-if="loadingParticipants" class="p-5 text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted font-sans small">Memuat daftar peserta...</p>
              </div>

              <!-- Empty State: No Kegiatan Selected -->
              <div v-else-if="!selectedKegiatan" class="p-5 text-center text-muted h-100 d-flex flex-column align-items-center justify-content-center">
                <div class="mb-3 text-muted-light"><i class="fal fa-calendar-alt fa-4x"></i></div>
                <h5 class="fw-bold">Pilih Kegiatan</h5>
                <p class="small text-muted-dark mb-4">Silakan pilih salah satu kegiatan di daftar sebelah kiri untuk melihat detail dan mengelola peserta.</p>
              </div>

              <!-- Empty State: No Participants -->
              <div v-else-if="participants.length === 0" class="p-5 text-center text-muted animate__animated animate__fadeIn">
                <div class="mb-3 text-muted-light"><i class="fal fa-users-slash fa-4x"></i></div>
                <h5 class="fw-bold">Belum Ada Peserta</h5>
                <p class="small text-muted-dark mb-4">Kegiatan ini belum memiliki peserta terdaftar.</p>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-4" @click="openAddParticipantModal">
                  <i class="fas fa-plus me-1"></i> Tambah Peserta
                </button>
              </div>

              <!-- Table of Participants -->
              <div v-else class="table-responsive">
                <table class="table data-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th class="ps-4" style="width: 5%">No</th>
                      <th style="width: 40%">Nama Karyawan</th>
                      <th style="width: 25%">Unit / Jabatan</th>
                      <th style="width: 15%">Peran</th>
                      <th class="text-center" style="width: 15%">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(item, idx) in participants" 
                      :key="item.id" 
                      class="diklat-row animate__animated animate__fadeIn"
                      style="--animate-duration: 0.3s;"
                    >
                      <td class="ps-4 text-muted small fw-bold font-mono">{{ idx + 1 }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-sm flex-shrink-0">
                            <span class="initials">{{ getInitials(item.pegawai?.nama) }}</span>
                          </div>
                          <div class="d-flex flex-column text-start">
                            <span class="fw-bold text-dark font-sans leading-snug" style="font-size: 0.88rem;">
                              {{ item.pegawai?.nama || 'Pegawai Tidak Diketahui' }}
                            </span>
                            <span class="text-muted font-mono extra-small mt-0.5">
                              NIK: {{ item.pegawai?.nik || '-' }}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column text-start">
                          <span class="text-dark small fw-medium">{{ item.pegawai?.jbtn || '-' }}</span>
                          <span class="text-muted extra-small mt-0.5">{{ item.pegawai?.departemen || '-' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex">
                          <span :class="['badge px-2 py-1 text-uppercase extra-small fw-bold', getRoleColorClass(item.peserta)]">
                            {{ item.peserta }}
                          </span>
                        </div>
                      </td>
                      <td class="text-center pe-4">
                        <div class="d-flex align-items-center justify-content-center gap-2">
                          <!-- Tombol Cetak Sertifikat — hanya untuk diklat Internal -->
                          <button
                            v-if="selectedKegiatan.kategori === 'Internal'"
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
                            title="Edit Record"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          
                          <button 
                            class="btn btn-sm btn-action text-danger bg-danger-subtle border-0"
                            @click="deleteParticipantRecord(item)"
                            title="Hapus Peserta"
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

    <!-- SIDEBAR FORM OVERLAY for TAMBAH PESERTA / TAMBAH KEGIATAN BARU / EDIT RECORD -->
    <div :class="['sidebar-overlay', { active: showFormSidebar }]" @click="closeSidebar"></div>
    <div :class="['sidebar-form', { active: showFormSidebar }]">
      <div class="sidebar-content">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <h5>
            <i class="fas" :class="isEditMode ? 'fa-edit' : 'fa-plus'"></i>
            <span>{{ sidebarTitle }}</span>
          </h5>
          <button class="sidebar-close" @click="closeSidebar">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Sidebar Body -->
        <div class="sidebar-body">
          <form @submit.prevent="submitForm">
            
            <!-- STATE: EDITING EXISTING RECORD OR CREATING A NEW KEGIATAN -->
            <!-- We display Kegiatan Details fields -->
            <div v-if="formMode === 'create_kegiatan' || formMode === 'edit_kegiatan' || isEditMode" class="form-section-card animate__animated animate__fadeIn">
              <h6 class="form-section-title"><i class="fas fa-info-circle"></i>Detail Kegiatan</h6>
              
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

              <div v-if="form.kategori === 'Internal'" class="form-group mb-2">
                <label class="form-label extra-small">Tanda Tangan 1 (Direktur)</label>
                <v-select
                  v-model="form.ttd1_id"
                  :options="pegawaiList"
                  :reduce="peg => peg.id"
                  label="nama"
                  placeholder="Pilih Direktur..."
                  class="v-select-custom bg-white"
                />
              </div>

              <div v-if="form.kategori === 'Internal'" class="form-group mb-2">
                <label class="form-label extra-small">Tanda Tangan 2 (Ketua Panitia)</label>
                <v-select
                  v-model="form.ttd2_id"
                  :options="pegawaiList"
                  :reduce="peg => peg.id"
                  label="nama"
                  placeholder="Pilih Ketua Panitia..."
                  class="v-select-custom bg-white"
                />
              </div>

              <div v-if="form.kategori === 'Internal'" class="form-group mb-0">
                <label class="form-label extra-small mb-1 d-block">
                  <i class="fas fa-align-left me-1 text-muted"></i>Materi Pelatihan (Ringkasan)
                  <span class="text-muted ms-1" style="font-weight:400;">(mendukung tabel, paste dari Word)</span>
                </label>
                <!-- TipTap Toolbar -->
                <div class="tiptap-toolbar d-flex flex-wrap align-items-center gap-1 p-2 border border-bottom-0 rounded-top-2 bg-light">
                  <!-- Text Formatting -->
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('bold') }" @click="tiptapEditor?.chain().focus().toggleBold().run()" title="Bold">
                    <i class="fas fa-bold"></i>
                  </button>
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('italic') }" @click="tiptapEditor?.chain().focus().toggleItalic().run()" title="Italic">
                    <i class="fas fa-italic"></i>
                  </button>
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('underline') }" @click="tiptapEditor?.chain().focus().toggleUnderline().run()" title="Underline">
                    <i class="fas fa-underline"></i>
                  </button>
                  <div class="tiptap-divider"></div>
                  <!-- Lists -->
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('bulletList') }" @click="tiptapEditor?.chain().focus().toggleBulletList().run()" title="Bullet List">
                    <i class="fas fa-list-ul"></i>
                  </button>
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('orderedList') }" @click="tiptapEditor?.chain().focus().toggleOrderedList().run()" title="Ordered List">
                    <i class="fas fa-list-ol"></i>
                  </button>
                  <div class="tiptap-divider"></div>
                  <!-- Heading -->
                  <button type="button" class="tiptap-btn" :class="{ active: tiptapEditor?.isActive('heading', { level: 2 }) }" @click="tiptapEditor?.chain().focus().toggleHeading({ level: 2 }).run()" title="Heading">
                    <i class="fas fa-heading"></i>
                  </button>
                  <div class="tiptap-divider"></div>
                  <!-- Table Controls -->
                  <button type="button" class="tiptap-btn tiptap-btn-table" @click="tiptapInsertTable" title="Sisipkan Tabel">
                    <i class="fas fa-table"></i><span class="ms-1">Tabel</span>
                  </button>
                  <button type="button" class="tiptap-btn" @click="tiptapEditor?.chain().focus().addColumnBefore().run()" title="Tambah Kolom Kiri">
                    <i class="fas fa-columns"></i>+
                  </button>
                  <button type="button" class="tiptap-btn" @click="tiptapEditor?.chain().focus().addRowAfter().run()" title="Tambah Baris Bawah">
                    <i class="fas fa-grip-lines"></i>+
                  </button>
                  <button type="button" class="tiptap-btn text-danger" @click="tiptapEditor?.chain().focus().deleteColumn().run()" title="Hapus Kolom">
                    <i class="fas fa-columns"></i>-
                  </button>
                  <button type="button" class="tiptap-btn text-danger" @click="tiptapEditor?.chain().focus().deleteRow().run()" title="Hapus Baris">
                    <i class="fas fa-grip-lines"></i>-
                  </button>
                  <button type="button" class="tiptap-btn text-danger" @click="tiptapEditor?.chain().focus().deleteTable().run()" title="Hapus Tabel">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <div class="tiptap-divider"></div>
                  <!-- Clear Formatting -->
                  <button type="button" class="tiptap-btn text-muted" @click="tiptapEditor?.chain().focus().clearNodes().unsetAllMarks().run()" title="Hapus Format">
                    <i class="fas fa-remove-format"></i>
                  </button>
                </div>
                <!-- TipTap Editor Content Area -->
                <div class="tiptap-editor-wrapper border rounded-bottom-2">
                  <editor-content :editor="tiptapEditor" class="tiptap-content" />
                </div>
                <p class="extra-small text-muted mt-1 mb-0">
                  <i class="fas fa-info-circle me-1"></i>Mendukung paste tabel langsung dari Word/Excel
                </p>
              </div>
            </div>

            <!-- STATE: ADDING PARTICIPANT TO EXISTING KEGIATAN -->
            <!-- We show selected kegiatan name read-only -->
            <div v-if="formMode === 'add_participant'" class="form-info-box animate__animated animate__fadeIn">
              <label class="form-label small text-muted"><i class="fas fa-calendar-alt me-1 text-primary"></i>Kegiatan Pelatihan</label>
              <div class="fw-bold text-dark-blue fs-6 mt-1">{{ selectedKegiatan?.nama_kegiatan }}</div>
              <div class="small text-muted mt-1">
                <span class="badge bg-primary-subtle text-primary me-2">{{ selectedKegiatan?.kategori }}</span>
                <i class="fas fa-calendar-alt me-1 opacity-75"></i>{{ formatDate(selectedKegiatan?.tgl_mulai) }}
                <span class="mx-2">•</span>
                <i class="fas fa-map-marker-alt me-1 opacity-75"></i>{{ selectedKegiatan?.tempat }}
              </div>
            </div>

            <!-- SELECT EMPLOYEE / KARYAWAN (Autocomplete search) -->
            <!-- Required only in Create Kegiatan mode or Add Participant mode -->
            <div v-if="!isEditMode && formMode !== 'edit_kegiatan'" class="form-group mb-3 position-relative">
              <label class="form-label"><i class="fas fa-user me-1"></i>Pilih Pegawai <span class="text-danger">*</span></label>
              <div class="search-box d-flex align-items-center border rounded-2 bg-white px-3 gap-2" style="height: 38px;">
                <i class="fas fa-search text-muted flex-shrink-0" style="font-size: 0.85rem;"></i>
                <input 
                  type="text" 
                  v-model="empQuery" 
                  @input="searchEmployees"
                  placeholder="Ketik NIK atau nama pegawai..."
                  class="border-0 flex-grow-1 bg-transparent"
                  style="outline: none; font-size: 0.9rem; min-width: 0;"
                  :disabled="form.nik !== null"
                  required
                />
                <button type="button" v-if="form.nik" @click="clearEmployeeSelection" class="border-0 bg-transparent p-0 flex-shrink-0">
                  <i class="fas fa-times text-danger" style="font-size: 0.85rem;"></i>
                </button>
              </div>

              <!-- Autocomplete Dropdown -->
              <div v-if="empResults.length > 0" class="search-results-dropdown shadow border rounded-3 w-100 bg-white" style="position: absolute; z-index: 1050; max-height: 200px; overflow-y: auto;">
                <div 
                  v-for="emp in empResults" 
                  :key="emp.nik" 
                  class="search-result-item p-2 border-bottom text-start"
                  @click="selectEmployee(emp)"
                  style="cursor: pointer;"
                >
                  <span class="fw-semibold d-block small">{{ emp.nama }}</span>
                  <span class="text-muted extra-small">
                    NIK: {{ emp.nik }} • {{ emp.jbtn || '-' }} • {{ emp.departemen || '-' }}
                  </span>
                </div>
              </div>

              <!-- Selected Indicator -->
              <div v-if="selectedEmpRecord" class="selected-emp-badge animate__animated animate__fadeIn">
                <div>
                  <i class="fas fa-check-circle me-2 text-primary"></i>
                  <strong>Terpilih:</strong> {{ selectedEmpRecord.nama }} <span class="font-mono text-muted-dark small ms-2">({{ selectedEmpRecord.nik }})</span>
                </div>
              </div>
            </div>

            <!-- In edit mode, we just show employee info read-only -->
            <div v-else-if="formMode !== 'edit_kegiatan'" class="form-info-box animate__animated animate__fadeIn">
              <label class="form-label small text-muted"><i class="fas fa-user me-1 text-primary"></i>Pegawai</label>
              <div class="fw-bold text-dark mt-1">{{ selectedParticipantItem?.pegawai?.nama }}</div>
              <div class="small text-muted font-mono mt-1">NIK: {{ selectedParticipantItem?.pegawai?.nik }}</div>
            </div>

            <!-- Peran / Peserta Role -->
            <div v-if="formMode !== 'edit_kegiatan'" class="form-group mb-3">
              <label class="form-label"><i class="fas fa-user-tag me-1"></i>Peran Pegawai <span class="text-danger">*</span></label>
              <select v-model="form.peserta" class="form-select" required>
                <option value="Peserta">Peserta</option>
                <option value="Pemateri">Pemateri / Narasumber</option>
                <option value="Panitia">Panitia</option>
              </select>
            </div>

            <hr class="my-4 text-muted-light" v-if="formMode !== 'edit_kegiatan'" />

            <!-- File Upload / Bukti sertifikat (HANYA untuk Eksternal) -->
            <div v-if="formMode !== 'edit_kegiatan' && formMode !== 'create_kegiatan' && selectedKegiatan?.kategori === 'Eksternal'" class="form-group mb-4">
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
            :disabled="submitting || !isFormValid"
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
        <!-- Preview Modal Header -->
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

          <!-- PDF Fallback for Mobile -->
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

    <!-- ════ MODAL DETAIL MATERI KEGIATAN ════ -->
    <div 
      v-if="showMateriModal && selectedKegiatan" 
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style="z-index: 2055; background-color: rgba(15, 23, 42, 0.45); backdrop-filter: blur(8px);"
      @click.self="closeMateriModal"
    >
      <div 
        class="bg-white rounded-4 shadow-2xl border w-100 mx-3 d-flex flex-column overflow-hidden animate__animated animate__zoomIn animate__faster" 
        style="max-width: 800px; max-height: 80vh; border-color: #e2e8f0 !important;"
      >
        <!-- Modal Header -->
        <div class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-light">
          <h5 class="fw-bold m-0 text-dark font-sans">
            <i class="fas fa-book-open text-primary me-2"></i>Materi Kegiatan
          </h5>
          <button 
            type="button" 
            class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            style="width: 32px; height: 32px; border-radius: 50%;"
            @click="closeMateriModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-grow-1 p-4 overflow-auto bg-white text-start rich-text-content">
          <h4 class="fw-bold text-primary mb-3">{{ selectedKegiatan.nama_kegiatan }}</h4>
          <div v-html="selectedKegiatan.materi" class="materi-html-container"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import debounce from 'lodash/debounce'
import JSZip from 'jszip'
import api from '@/services/api'
import { pegawaiService } from '@/services/pegawaiService'
import { diklatService } from '@/services/diklatService'
import { generateSertifikatDiklat, downloadPdfFromBlob, printPdfFromBlob } from '@/utils/diklatSertifikatPdf'
import config from '@/config/api'
import logoRsiaAsset from '@/assets/logo-rsia.png'
import logoLarsiAsset from '@/assets/logo-larsi.png'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'

const toast = useToast()

// Detection of Mobile Devices
const isMobile = ref(false)
const detectMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
}

// Master Kegiatan List State
const kegiatanList = ref([])
const loadingKegiatan = ref(false)
const kegSearchQuery = ref('')
const pegawaiList = ref([])

// Detail State
const selectedKegiatan = ref(null)
const participants = ref([])
const loadingParticipants = ref(false)

// Materi Detail Modal State
const showMateriModal = ref(false)
const closeMateriModal = () => {
  showMateriModal.value = false
}

// Helpers to strip HTML tags for preview
const stripHtml = (html) => {
  if (!html) return ''
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  } catch (e) {
    return html.replace(/<[^>]*>?/gm, '')
  }
}

const cleanMateriPreview = computed(() => {
  const plainText = stripHtml(selectedKegiatan.value?.materi)
  if (plainText.length > 150) {
    return plainText.substring(0, 150) + '...'
  }
  return plainText
})

const hasRichTextMateri = computed(() => {
  const html = selectedKegiatan.value?.materi || ''
  return html.includes('<') && html.includes('>')
})

// Employee Autocomplete State (for sidebar form)
const empQuery = ref('')
const empResults = ref([])
const selectedEmpRecord = ref(null)

// Sidebar Form State
const showFormSidebar = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const selectedParticipantItem = ref(null)
const selectedKegiatanToEdit = ref(null)
// Mode: 'create_kegiatan' | 'add_participant' | 'edit' | 'edit_kegiatan'
const formMode = ref('add_participant')

// === TIPTAP EDITOR SETUP ===
const tiptapEditor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Underline,
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'tiptap-table' }
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate({ editor }) {
    form.materi = editor.getHTML()
  },
  editorProps: {
    attributes: {
      class: 'tiptap-input',
      placeholder: 'Ketik materi, atau paste tabel dari Word/Excel...'
    }
  }
})

// Sync form.materi into editor when sidebar opens or form is reset
watch(showFormSidebar, (isOpen) => {
  if (isOpen) {
    // Brief delay to ensure editor is mounted
    setTimeout(() => {
      if (tiptapEditor.value) {
        tiptapEditor.value.commands.setContent(form.materi || '')
      }
    }, 80)
  }
})

const tiptapInsertTable = () => {
  tiptapEditor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// File Upload Drag & Drop State
const dragOver = ref(false)
const fileInputRef = ref(null)
const currentBerkasName = ref('')

// Form Reactive State
const form = reactive({
  peserta: 'Peserta',
  id_kegiatan: null,
  nik: null,
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
  loadKegiatanList()
  loadPegawaiList()
})

// === LOAD KEGIATAN LIST ===
const loadKegiatanList = async () => {
  loadingKegiatan.value = true
  try {
    const response = await diklatService.getKegiatan(kegSearchQuery.value)
    kegiatanList.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load kegiatan list:', error)
    toast.error('Gagal memuat daftar kegiatan')
  } finally {
    loadingKegiatan.value = false
  }
}

const loadPegawaiList = async () => {
  try {
    const response = await pegawaiService.getKaryawanList({ limit: 1000 })
    pegawaiList.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load employee list for select:', error)
  }
}

// === KEGIATAN SEARCH (LEFT PANEL) ===
const handleKegSearch = debounce(() => {
  loadKegiatanList()
}, 400)

const clearKegSearch = () => {
  kegSearchQuery.value = ''
  loadKegiatanList()
}

// === SELECT KEGIATAN ===
const selectKegiatan = (keg) => {
  selectedKegiatan.value = keg
  loadParticipants(keg.id)
}

// === LOAD PARTICIPANTS ===
const loadParticipants = async (kegId) => {
  loadingParticipants.value = true
  participants.value = []
  try {
    const response = await diklatService.getKegiatanDetail(kegId)
    const kegData = response.data?.data
    if (kegData) {
      participants.value = kegData.diklat || []
      // Update selected kegiatan metadata to have the latest
      selectedKegiatan.value = kegData
    }
  } catch (error) {
    console.error('Failed to load participants:', error)
    toast.error('Gagal mengambil daftar peserta')
  } finally {
    loadingParticipants.value = false
  }
}

// === EMPLOYEE AUTOCOMPLETE (SIDEBAR FORM) ===
const searchEmployees = debounce(async () => {
  if (empQuery.value.trim().length < 3) {
    empResults.value = []
    return
  }
  try {
    const response = await pegawaiService.searchPegawai(empQuery.value)
    empResults.value = response.data?.data || []
  } catch (error) {
    console.error('Failed employee search:', error)
  }
}, 300)

const selectEmployee = (emp) => {
  selectedEmpRecord.value = emp
  form.nik = emp.nik
  empQuery.value = emp.nama
  empResults.value = []
}

const clearEmployeeSelection = () => {
  selectedEmpRecord.value = null
  form.nik = null
  empQuery.value = ''
  empResults.value = []
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
  form.nik = null
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
  
  empQuery.value = ''
  empResults.value = []
  selectedEmpRecord.value = null
  currentBerkasName.value = ''
  selectedParticipantItem.value = null
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  // Clear TipTap editor
  setTimeout(() => {
    tiptapEditor.value?.commands.setContent('')
  }, 50)
}

const openAddKegiatanModal = () => {
  resetForm()
  isEditMode.value = false
  formMode.value = 'create_kegiatan'
  showFormSidebar.value = true
}

const openAddParticipantModal = () => {
  if (!selectedKegiatan.value) {
    toast.warning('Silakan pilih kegiatan terlebih dahulu')
    return
  }
  resetForm()
  isEditMode.value = false
  formMode.value = 'add_participant'
  form.id_kegiatan = selectedKegiatan.value.id
  showFormSidebar.value = true
}

const openEditModal = (item) => {
  resetForm()
  isEditMode.value = true
  formMode.value = 'edit'
  selectedParticipantItem.value = item
  
  // Fill pivot data
  form.peserta = item.peserta
  form.id_kegiatan = item.id_kegiatan
  currentBerkasName.value = item.berkas || ''
  
  // Fill kegiatan data
  if (selectedKegiatan.value) {
    form.nama_kegiatan = selectedKegiatan.value.nama_kegiatan || ''
    form.tempat = selectedKegiatan.value.tempat || ''
    form.kategori = selectedKegiatan.value.kategori || 'Internal'
    form.tgl_mulai = selectedKegiatan.value.tgl_mulai || ''
    form.tgl_akhir = selectedKegiatan.value.tgl_akhir || ''
    form.jpl = selectedKegiatan.value.jpl || ''
    form.skp = selectedKegiatan.value.skp || ''
    form.penyelenggara = selectedKegiatan.value.penyelenggara || ''
    form.nomor = selectedKegiatan.value.nomor || ''
    form.materi = selectedKegiatan.value.materi || ''
    form.ttd1_id = selectedKegiatan.value.ttd1_id || null
    form.ttd2_id = selectedKegiatan.value.ttd2_id || null
  }
  
  showFormSidebar.value = true
  // Sync TipTap editor
  setTimeout(() => {
    tiptapEditor.value?.commands.setContent(form.materi || '')
  }, 100)
}


const openEditKegiatanModal = (keg) => {
  resetForm()
  isEditMode.value = false
  formMode.value = 'edit_kegiatan'
  selectedKegiatanToEdit.value = keg
  
  // Fill kegiatan data
  form.id_kegiatan = keg.id
  form.nama_kegiatan = keg.nama_kegiatan || ''
  form.tempat = keg.tempat || ''
  form.kategori = keg.kategori || 'Internal'
  form.tgl_mulai = keg.tgl_mulai || ''
  form.tgl_akhir = keg.tgl_akhir || ''
  form.jpl = keg.jpl || ''
  form.skp = keg.skp || ''
  form.penyelenggara = keg.penyelenggara || ''
  form.nomor = keg.nomor || ''
  form.materi = keg.materi || ''
  form.ttd1_id = keg.ttd1_id || null
  form.ttd2_id = keg.ttd2_id || null
  
  showFormSidebar.value = true
  // Sync editor
  setTimeout(() => {
    tiptapEditor.value?.commands.setContent(form.materi || '')
  }, 100)
}

const closeSidebar = () => {
  if (submitting.value) return
  showFormSidebar.value = false
}

// Validation Computed
const isFormValid = computed(() => {
  if (formMode.value === 'edit_kegiatan') {
    return form.nama_kegiatan && form.tempat && form.kategori && form.tgl_mulai
  }
  if (isEditMode.value) {
    return form.nama_kegiatan && form.tempat && form.kategori && form.tgl_mulai && form.peserta
  }
  if (formMode.value === 'add_participant') {
    return form.nik && form.peserta
  }
  if (formMode.value === 'create_kegiatan') {
    return form.nama_kegiatan && form.tempat && form.kategori && form.tgl_mulai && form.nik && form.peserta
  }
  return false
})

const sidebarTitle = computed(() => {
  if (formMode.value === 'edit_kegiatan') return 'Edit Detail Kegiatan'
  if (isEditMode.value) return 'Edit Record Peserta & Kegiatan'
  if (formMode.value === 'add_participant') return 'Tambah Peserta Kegiatan'
  if (formMode.value === 'create_kegiatan') return 'Tambah Kegiatan Baru'
  return 'Form Data Diklat'
})

// === SUBMIT FORM ===
const submitForm = async () => {
  if (!isFormValid.value) return
  submitting.value = true
  
  // Appending conditional logic based on form mode
  if (formMode.value === 'edit_kegiatan') {
    const payload = {
      nama_kegiatan: form.nama_kegiatan,
      tempat: form.tempat,
      kategori: form.kategori,
      tgl_mulai: form.tgl_mulai,
      tgl_akhir: form.tgl_akhir || null,
      jpl: form.jpl || null,
      skp: form.skp || null,
      penyelenggara: form.penyelenggara || null,
      nomor: form.nomor || null,
      materi: form.materi || null,
      ttd1_id: form.ttd1_id || null,
      ttd2_id: form.ttd2_id || null,
    }

    try {
      await diklatService.updateKegiatan(selectedKegiatanToEdit.value.id, payload)
      toast.success('Detail kegiatan berhasil diperbarui')
      showFormSidebar.value = false
      await loadKegiatanList()
      if (selectedKegiatan.value && selectedKegiatan.value.id === selectedKegiatanToEdit.value.id) {
        const updatedKeg = kegiatanList.value.find(k => k.id === selectedKegiatanToEdit.value.id)
        if (updatedKeg) {
          selectedKegiatan.value = updatedKeg
          loadParticipants(updatedKeg.id)
        }
      }
    } catch (error) {
      console.error('Failed to update kegiatan:', error)
      const errorMsg = error.response?.data?.message || 'Gagal memperbarui kegiatan'
      toast.error(errorMsg)
    } finally {
      submitting.value = false
    }
    return
  }

  const formData = new FormData()
  formData.append('peserta', form.peserta)
  
  if (form.file) {
    formData.append('file', form.file)
  }

  // Appending conditional logic based on form mode
  if (isEditMode.value) {
    formData.append('id_kegiatan', form.id_kegiatan)
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

    try {
      await diklatService.updateDiklat(selectedParticipantItem.value.id, formData)
      toast.success('Data diklat berhasil diperbarui')
      showFormSidebar.value = false
      loadParticipants(selectedKegiatan.value.id)
      loadKegiatanList()
    } catch (error) {
      console.error('Failed to update participant details:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan perubahan'
      toast.error(errorMsg)
    } finally {
      submitting.value = false
    }
  } else if (formMode.value === 'add_participant') {
    formData.append('nik', form.nik)
    formData.append('id_kegiatan', form.id_kegiatan)

    try {
      await diklatService.storeDiklat(formData)
      toast.success('Peserta baru berhasil ditambahkan')
      showFormSidebar.value = false
      loadParticipants(selectedKegiatan.value.id)
      loadKegiatanList()
    } catch (error) {
      console.error('Failed to add participant:', error)
      const errorMsg = error.response?.data?.message || 'Gagal menambahkan peserta'
      toast.error(errorMsg)
    } finally {
      submitting.value = false
    }
  } else if (formMode.value === 'create_kegiatan') {
    formData.append('nik', form.nik)
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

    try {
      const response = await diklatService.storeDiklat(formData)
      toast.success('Kegiatan baru berhasil dibuat')
      showFormSidebar.value = false
      
      const newPivot = response.data?.data
      if (newPivot && newPivot.id_kegiatan) {
        await loadKegiatanList()
        const newKeg = kegiatanList.value.find(k => k.id === newPivot.id_kegiatan)
        if (newKeg) {
          selectKegiatan(newKeg)
        } else if (newPivot.kegiatan) {
          selectKegiatan(newPivot.kegiatan)
        }
      } else {
        loadKegiatanList()
      }
    } catch (error) {
      console.error('Failed to create kegiatan:', error)
      const errorMsg = error.response?.data?.message || 'Gagal membuat kegiatan baru'
      toast.error(errorMsg)
    } finally {
      submitting.value = false
    }
  }
}

// === DELETE PARTICIPANT ===
const deleteParticipantRecord = async (item) => {
  const result = await Swal.fire({
    title: 'Hapus Peserta?',
    html: `Apakah Anda yakin ingin mengeluarkan <strong>${item.pegawai?.nama}</strong> dari kegiatan <strong>${selectedKegiatan.value?.nama_kegiatan}</strong>?`,
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
      toast.success('Peserta berhasil dikeluarkan dari kegiatan')
      loadParticipants(selectedKegiatan.value.id)
      loadKegiatanList()
    } catch (error) {
      console.error('Failed to delete participant:', error)
      toast.error('Gagal mengeluarkan peserta dari kegiatan')
    }
  }
}

// === PREVIEW CERTIFICATE MODAL ===
const showPreviewModal = ref(false)
const activePreviewDoc = ref(null)

const previewCertificate = (item) => {
  if (!item.berkas) return
  activePreviewDoc.value = {
    nama: selectedKegiatan.value?.nama_kegiatan || 'Sertifikat Diklat',
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

// === BULK DOWNLOAD CERTIFICATES AS ZIP ===
const bulkDownloading = ref(false)

const bulkDownloadCertificates = async () => {
  if (!selectedKegiatan.value || participants.value.length === 0) {
    toast.warning('Tidak ada data peserta untuk diunduh')
    return
  }

  const result = await Swal.fire({
    title: 'Unduh Semua Sertifikat?',
    text: `Anda akan mengunduh ${participants.value.length} berkas sertifikat dalam format ZIP.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Mulai Unduh',
    cancelButtonText: 'Batal',
    backdrop: `rgba(15, 23, 42, 0.35)`
  })

  if (!result.isConfirmed) return

  bulkDownloading.value = true

  // Show SweetAlert progress dialog
  Swal.fire({
    title: 'Mengunduh Sertifikat...',
    html: 'Sedang memproses dokumen: <b>0</b> dari <b>' + participants.value.length + '</b>...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  const zip = new JSZip()
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < participants.value.length; i++) {
    const item = participants.value[i]
    
    // Update progress in dialog
    Swal.getHtmlContainer().innerHTML = `Sedang memproses dokumen: <b>${i + 1}</b> dari <b>${participants.value.length}</b>...`
    
    try {
      const cleanNama = item.pegawai?.nama ? item.pegawai.nama.replace(/[^a-zA-Z0-9]/g, '_') : 'karyawan'
      const nik = item.pegawai?.nik || 'unknown'

      if (selectedKegiatan.value.kategori === 'Internal') {
        // Generate internal PDF blob
        item.kegiatan = selectedKegiatan.value
        const genResult = await generateSertifikatDiklat(
          item,
          item.pegawai,
          {
            direkturNama: item.kegiatan?.ttd1_pegawai?.nama || item.kegiatan?.ttd1 || undefined,
            ketuaPanitia: item.kegiatan?.ttd2_pegawai?.nama || item.kegiatan?.ttd2 || undefined,
            logoRsiaUrl: logoRsiaAsset,
            logoLarsiUrl: logoLarsiAsset,
          }
        )
        const pdfBlob = genResult.doc.output('blob')
        const zipFileName = `${nik}_${cleanNama}_Sertifikat.pdf`
        zip.file(zipFileName, pdfBlob)
        successCount++
      } else {
        // External activity - download berkas
        if (item.berkas) {
          const response = await api.get(`/diklat/download/${item.berkas}`, { responseType: 'blob' })
          const ext = item.berkas.split('.').pop()
          const zipFileName = `${nik}_${cleanNama}_Sertifikat.${ext}`
          zip.file(zipFileName, response.data)
          successCount++
        } else {
          // Participant does not have a berkas uploaded
          failCount++
        }
      }
    } catch (err) {
      console.error(`Failed to process certificate for NIK: ${item.pegawai?.nik}`, err)
      failCount++
    }
  }

  // Generate ZIP file and trigger download
  if (successCount > 0) {
    Swal.getHtmlContainer().innerHTML = 'Sedang membuat berkas arsip ZIP...'
    try {
      const zipContent = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      })
      const safeKegName = selectedKegiatan.value.nama_kegiatan.substring(0, 40).replace(/[^a-zA-Z0-9]/g, '_')
      const zipFileName = `Sertifikat_${safeKegName}.zip`
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipContent)
      link.download = zipFileName
      link.click()
      
      URL.revokeObjectURL(link.href)
      
      Swal.fire({
        title: 'Unduh Selesai!',
        html: `Berhasil mengemas <b>${successCount}</b> sertifikat.<br>${failCount > 0 ? `Gagal memproses <b>${failCount}</b> peserta.` : ''}`,
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        backdrop: `rgba(15, 23, 42, 0.35)`
      })
    } catch (err) {
      console.error('Failed to generate ZIP archive:', err)
      Swal.fire({
        title: 'Gagal membuat ZIP',
        text: 'Terjadi kesalahan saat mengemas berkas sertifikat.',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        backdrop: `rgba(15, 23, 42, 0.35)`
      })
    }
  } else {
    Swal.fire({
      title: 'Unduh Gagal',
      text: 'Tidak ada dokumen sertifikat yang berhasil diproses.',
      icon: 'error',
      confirmButtonColor: '#3b82f6',
      backdrop: `rgba(15, 23, 42, 0.35)`
    })
  }

  bulkDownloading.value = false
}

// === CETAK SERTIFIKAT INTERNAL (PDF Generator + Preview Modal) ===
const showSertifikatModal = ref(false)
const sertifikatBlobUrl = ref(null)
const sertifikatFileName = ref('')
const sertifikatNamaKegiatan = ref('')
const sertifikatLoading = ref(false)

const printSertifikat = async (item) => {
  sertifikatLoading.value = true
  showSertifikatModal.value = true
  sertifikatBlobUrl.value = null
  sertifikatFileName.value = ''
  sertifikatNamaKegiatan.value = selectedKegiatan.value?.nama_kegiatan || 'Sertifikat Diklat Internal'

  // Ensure kegiatan is present on the item
  item.kegiatan = selectedKegiatan.value

  try {
    const result = await generateSertifikatDiklat(
      item,
      item.pegawai,
      {
        direkturNama: item.kegiatan?.ttd1_pegawai?.nama || item.kegiatan?.ttd1 || undefined,
        ketuaPanitia: item.kegiatan?.ttd2_pegawai?.nama || item.kegiatan?.ttd2 || undefined,
        logoRsiaUrl: logoRsiaAsset,
        logoLarsiUrl: logoLarsiAsset,
      }
    )
    sertifikatBlobUrl.value = result.blobUrl
    sertifikatFileName.value = result.fileName
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
.kegiatan-container {
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

.left-sticky-panel {
  position: sticky;
  top: 1rem;
  align-self: flex-start;
}

.scrollable-keg-list {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.scrollable-keg-list::-webkit-scrollbar {
  width: 5px;
}

.scrollable-keg-list::-webkit-scrollbar-track {
  background: #f8fafc;
}

.scrollable-keg-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.scrollable-keg-list::-webkit-scrollbar-thumb:hover {
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

.list-group-item.active-keg-item {
  background-color: #eff6ff !important;
  border-color: #bfdbfe !important;
}

.list-group-item.active-keg-item .text-dark {
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

.card-header-gradient {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  position: relative;
  overflow: hidden;
}

.card-header-left {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-bottom: none;
}

.card-header-history {
  background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%);
  border-bottom: none;
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

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

.preview-modal-header {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.search-results-dropdown {
  background: white;
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
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
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
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 1.25rem 1.5rem !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.sidebar-header h5 {
  color: #0f172a !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sidebar-header h5 i {
  color: #2563eb !important;
}

.sidebar-close {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.sidebar-close:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
  transform: rotate(90deg);
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
  padding: 1rem 1.5rem !important;
  border-top: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  display: flex !important;
  gap: 0.75rem !important;
  justify-content: flex-end !important;
  flex-shrink: 0 !important;
}

/* Custom Styles for Buttons in Footer */
.sidebar-footer .btn {
  width: auto !important;
  min-width: 100px !important;
  padding: 0.55rem 1.25rem !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.sidebar-footer .btn-secondary {
  background: #ffffff !important;
  color: #64748b !important;
  border: 1.5px solid #e2e8f0 !important;
}

.sidebar-footer .btn-secondary:hover {
  background: #f1f5f9 !important;
  color: #334155 !important;
  border-color: #cbd5e1 !important;
}

.sidebar-footer .btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15) !important;
}

.sidebar-footer .btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25) !important;
  transform: translateY(-1px);
}

.sidebar-footer .btn-primary:active {
  transform: translateY(0);
}

/* Custom Form Styling Overrides */
.form-section-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-left: 4px solid #3b82f6 !important;
  border-radius: 12px !important;
  padding: 1.5rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  margin-bottom: 1.5rem !important;
}

.form-info-box {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 1rem 1.25rem !important;
  margin-bottom: 1.5rem !important;
}

.form-section-title {
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: #1e3a8a !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 1.5px solid #f1f5f9 !important;
  padding-bottom: 0.5rem !important;
  margin-bottom: 1rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.form-section-title i {
  color: #2563eb !important;
}

.sidebar-body .form-label {
  font-weight: 600 !important;
  color: #475569 !important;
  margin-bottom: 0.4rem !important;
  font-size: 0.8rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.35rem !important;
}

.sidebar-body .form-control,
.sidebar-body .form-select {
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.85rem !important;
  color: #1e293b !important;
  background-color: #f8fafc !important;
  transition: all 0.2s ease !important;
}

.sidebar-body .form-control:focus,
.sidebar-body .form-select:focus {
  border-color: #3b82f6 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
  outline: none !important;
}

.sidebar-body .form-control::placeholder {
  color: #94a3b8 !important;
}

.sidebar-body .form-group {
  margin-bottom: 1.25rem !important;
}

.sidebar-body .btn-xs {
  width: auto !important;
  font-size: 0.72rem !important;
  padding: 0.15rem 0.4rem !important;
  border-radius: 4px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.2rem !important;
}

/* Custom styles for vue-select */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 2px 0 !important;
  background-color: #f8fafc !important;
  font-size: 0.85rem !important;
  transition: all 0.2s ease !important;
}
.v-select-custom.vs--open :deep(.vs__dropdown-toggle) {
  border-color: #3b82f6 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}
.v-select-custom :deep(.vs__selected) {
  color: #1e293b !important;
  font-weight: 500 !important;
}
.v-select-custom :deep(.vs__actions svg) {
  fill: #64748b !important;
}
.v-select-custom :deep(.vs__dropdown-menu) {
  border-color: #e2e8f0 !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  font-size: 0.85rem !important;
}
.v-select-custom :deep(.vs__dropdown-option--highlight) {
  background: #2563eb !important;
  color: #ffffff !important;
}

/* Quill Editor Premium Layout styling */
.sidebar-body :deep(.ql-toolbar.ql-snow) {
  border: 1.5px solid #e2e8f0 !important;
  border-bottom: none !important;
  border-top-left-radius: 8px !important;
  border-top-right-radius: 8px !important;
  background-color: #f8fafc !important;
  padding: 8px !important;
}
.sidebar-body :deep(.ql-container.ql-snow) {
  border: 1.5px solid #e2e8f0 !important;
  border-bottom-left-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
  font-size: 0.85rem !important;
  font-family: inherit !important;
}
.sidebar-body :deep(.ql-editor) {
  min-height: 120px !important;
}

/* Selected Employee Badge */
.selected-emp-badge {
  background-color: #eff6ff !important;
  border: 1px solid #bfdbfe !important;
  color: #1e40af !important;
  border-radius: 8px !important;
  padding: 0.6rem 1rem !important;
  font-size: 0.8rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-top: 0.5rem !important;
}

/* Custom button style for "+ Baru" */
.btn-baru-custom {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  font-weight: 700;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.4rem 0.9rem !important;
  font-size: 0.8rem !important;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer;
  width: auto !important;
  flex-shrink: 0;
}

.btn-baru-custom:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 6px 12px rgba(5, 150, 105, 0.3) !important;
  transform: translateY(-1.5px);
}

.btn-baru-custom:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2) !important;
}

.btn-baru-custom i {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.btn-baru-custom:hover i {
  transform: rotate(90deg);
}

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

@media (max-width: 768px) {
  .sidebar-form {
    width: 95vw;
    max-height: 95vh;
  }
}

.btn-edit-kegiatan-icon {
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.82rem;
}

.btn-edit-kegiatan-icon:hover {
  color: #f59e0b !important;
  transform: scale(1.15);
}

.materi-html-container {
  font-size: 0.92rem;
  line-height: 1.6;
  color: #334155;
}

.materi-html-container table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.materi-html-container table td, 
.materi-html-container table th {
  border: 1px solid #cbd5e1 !important;
  padding: 0.6rem 0.8rem !important;
  font-size: 0.88rem;
}

.materi-html-container table th {
  background-color: #f8fafc;
  font-weight: 700;
}

/* Styling tables inside the Quill editor */
.sidebar-body :deep(.ql-editor table) {
  border-collapse: collapse !important;
  width: 100% !important;
  margin: 8px 0 !important;
}

.sidebar-body :deep(.ql-editor table td),
.sidebar-body :deep(.ql-editor table th) {
  border: 1px solid #cbd5e1 !important;
  padding: 6px 10px !important;
  min-width: 50px !important;
  text-align: left;
}

/* ==============================
   TIPTAP EDITOR STYLES
   ============================== */

/* Toolbar */
.tiptap-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
  user-select: none;
}

.tiptap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: white;
  color: #475569;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}
.tiptap-btn:hover {
  background: #e2e8f0;
  color: #1e3a5f;
}
.tiptap-btn.active {
  background: #1e3a5f;
  color: white;
  border-color: #1e3a5f;
}
.tiptap-btn.text-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
.tiptap-btn-table {
  padding: 0 8px;
  font-size: 0.78rem;
  font-weight: 600;
}

.tiptap-divider {
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
  margin: 0 2px;
}

/* Editor Content Area */
.tiptap-editor-wrapper {
  border-color: #e2e8f0 !important;
  background-color: white;
  min-height: 180px;
}

.tiptap-content {
  min-height: 180px;
}

.tiptap-content :deep(.ProseMirror) {
  padding: 12px 14px;
  min-height: 180px;
  outline: none;
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.6;
}

.tiptap-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}

/* TipTap Table Styles */
.tiptap-content :deep(.ProseMirror table),
.materi-html-container :deep(table),
.rich-text-content table {
  border-collapse: collapse !important;
  width: 100% !important;
  margin: 8px 0 !important;
  font-size: 0.82rem;
  table-layout: fixed;
}

.tiptap-content :deep(.ProseMirror table td),
.tiptap-content :deep(.ProseMirror table th),
.materi-html-container :deep(table td),
.materi-html-container :deep(table th),
.rich-text-content table td,
.rich-text-content table th {
  border: 1px solid #cbd5e1 !important;
  padding: 6px 10px !important;
  vertical-align: top;
  position: relative;
  word-wrap: break-word;
}

.tiptap-content :deep(.ProseMirror table th),
.materi-html-container :deep(table th),
.rich-text-content table th {
  background-color: #f0f4ff !important;
  font-weight: 600 !important;
  color: #1e3a5f;
  text-align: left;
}

.tiptap-content :deep(.ProseMirror table tr:nth-child(even) td) {
  background-color: #f8fafc;
}

/* Selected cell highlight */
.tiptap-content :deep(.ProseMirror .selectedCell::after) {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(30, 58, 95, 0.08);
  pointer-events: none;
}

/* Column resize handle */
.tiptap-content :deep(.ProseMirror .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #6366f1;
  cursor: col-resize;
}

/* Text formatting inside TipTap */
.tiptap-content :deep(.ProseMirror h2) {
  font-size: 1rem;
  font-weight: 700;
  margin: 8px 0 4px;
  color: #1e293b;
}
.tiptap-content :deep(.ProseMirror ul),
.tiptap-content :deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 4px 0;
}
.tiptap-content :deep(.ProseMirror p) {
  margin: 4px 0;
}
</style>
