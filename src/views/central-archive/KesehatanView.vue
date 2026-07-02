<template>
  <div class="sdi-view pks-view">
    <!-- Hero Header -->
    <div class="hero-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-stethoscope"></i>
          </div>
          <div class="title-text">
            <h1>Berkas Komite Kesehatan</h1>
            <p>Data Berkas Komite Tenaga Kesehatan Lain RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">{{ activeTab === 'staf' ? 'Total Staf' : 'Total Berkas' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container mb-4">
      <div class="capsule-tabs">
        <div class="capsule-tabs-wrapper">
          <button 
            type="button" 
            class="capsule-tab" 
            :class="{ 'active': activeTab === 'standar' }"
            @click="changeTab('standar')"
          >
            <i class="fas fa-file-alt me-2"></i> <span>Komite Kesehatan</span>
          </button>
          <button 
            type="button" 
            class="capsule-tab" 
            :class="{ 'active': activeTab === 'kredensial' }"
            @click="changeTab('kredensial')"
          >
            <i class="fas fa-id-badge me-2"></i> 
            <span>Kredensial</span>
            <span v-if="pendingCount > 0" class="tab-badge pulse-badge">{{ pendingCount }}</span>
          </button>
          <button 
            type="button" 
            class="capsule-tab" 
            :class="{ 'active': activeTab === 'staf' }"
            @click="changeTab('staf')"
          >
            <i class="fas fa-user-md me-2"></i> <span>Data Tenaga Kesehatan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Info Workflow Banner -->
    <div v-if="activeTab !== 'staf'" class="workflow-info-banner mb-4" :class="activeTab === 'standar' ? 'banner-standar' : 'banner-kredensial'">
      <div class="banner-icon-wrapper">
        <i :class="activeTab === 'standar' ? 'fas fa-lightbulb' : 'fas fa-route'"></i>
      </div>
      <div class="banner-text">
        <template v-if="activeTab === 'standar'">
          <div class="banner-title">💡 Petunjuk Pengarsipan Komite Kesehatan</div>
          <ol class="banner-list">
            <li>Gunakan menu ini untuk mencatat surat undangan rapat atau kegiatan reguler komite.</li>
            <li>Khusus untuk surat <strong>Undangan Kredensial (SPK RKK)</strong>, perihal wajib mengandung kata <strong>"Kredensial"</strong> dan harus memilih <strong>Target Pegawai</strong> agar pengajuan otomatis terhubung ke Tab Kredensial.</li>
          </ol>
        </template>
        <template v-else-if="activeTab === 'kredensial'">
          <div class="banner-title">📢 Alur Penerbitan SPK RKK (Kredensial)</div>
          <ol class="banner-list">
            <li><strong>Inisiasi:</strong> Buat Surat Undangan baru bertema "Kredensial" di Tab 1 (wajib pilih Target Pegawai).</li>
            <li><strong>Persetujuan:</strong> Tunggu persetujuan nomor surat oleh sekretariat di menu <strong>Persetujuan Nomor Surat</strong>.</li>
            <li><strong>Penerbitan SK:</strong> Setelah status disetujui, klik menu aksi <i class="fas fa-ellipsis-v mx-1"></i> &rarr; pilih <strong>"Terbitkan / Update SK"</strong> pada baris surat di tab ini:
              <ul class="banner-sub-list mt-1">
                <li><strong>Opsi A (Generate Baru):</strong> Jika SK belum dibuat, pilih tab <em>Terbitkan Baru</em> untuk men-generate nomor SK baru (upload file opsional di awal). File PDF SK/Bukti Kredensial bisa dilengkapi belakangan setelah ditandatangani Direktur.</li>
                <li><strong>Opsi B (Tautkan SK):</strong> Jika nomor SK sudah dibuat di menu Arsip SK, pilih tab <em>Tautkan SK Tersedia</em> lalu pilih nomor SK-nya. Anda juga bisa mengunggah berkas PDF SPK RKK di sini secara opsional.</li>
              </ul>
            </li>
          </ol>
        </template>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Search & Filter Left -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="activeTab === 'staf' ? 'Cari berdasarkan Nama atau NIK...' : 'Cari berdasarkan Perihal atau PJ...'" 
              @input="handleSearch"
            >
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div v-if="activeTab !== 'staf'" class="filter-box">
            <i class="fas fa-calendar-alt filter-icon"></i>
            <input 
              v-model="filterDate" 
              type="date" 
              class="date-input"
              @change="handleSearch"
            >
            <button v-if="filterDate" class="clear-filter" @click="clearDateFilter" title="Reset Tanggal">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Add Button Right -->
        <div class="action-buttons">
          <button v-if="activeTab === 'standar'" class="btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>Buat Surat Undangan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-modern">
      <div class="table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data {{ activeTab === 'staf' ? 'staf' : 'berkas' }}...</p>
        </div>

        <!-- Table for Standar / Kredensial -->
        <table v-else-if="berkasList.length > 0 && activeTab !== 'staf'" class="modern-table">
          <thead v-if="activeTab === 'standar'">
            <tr>
              <th width="5%" class="text-center">No</th>
              <th style="min-width: 180px;">Nomor Surat</th>
              <th style="min-width: 250px;">Perihal</th>
              <th style="min-width: 130px;">Tgl Terbit</th>
              <th style="min-width: 220px;">Penanggung Jawab</th>
              <th width="100" class="text-center">Aksi</th>
            </tr>
          </thead>
          <thead v-else-if="activeTab === 'kredensial'">
            <tr>
              <th width="5%" class="text-center">No</th>
              <th width="25%">Info Pengajuan</th>
              <th width="25%">SK Kredensial</th>
              <th width="20%">Pegawai</th>
              <th width="15%">Bukti</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <thead v-else>
            <!-- Data Staf -->
            <tr>
              <th width="50" class="text-center">No</th>
              <th style="min-width: 200px;">NIK / Nama</th>
              <th style="min-width: 150px;">Profesi</th>
              <th style="min-width: 150px;">Unit</th>
              <th style="min-width: 200px;">Pendidikan / Prodi</th>
              <th style="min-width: 130px;">Tanggal Lulus</th>
              <th style="min-width: 100px;">Bukti</th>
              <th width="100" class="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(berkas, index) in berkasList" :key="index" class="table-row-hover">
              <td class="text-muted text-center">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              
              <!-- Standar Tab Columns -->
              <template v-if="activeTab === 'standar'">
                <td>
                  <div class="badge-nomor">
                    {{ formatNomorSurat(berkas) }}
                  </div>
                </td>
                <td>
                  <div class="fw-medium text-dark">{{ berkas.perihal }}</div>
                </td>
                <td>
                  <div class="date-cell">
                    <i class="fas fa-calendar-alt text-muted fs-xs me-1"></i>
                    <span class="fs-xs">{{ formatDate(berkas.tgl_terbit) }}</span>
                  </div>
                </td>
                <td>
                  <div class="pj-cell" :title="berkas.penanggung_jawab?.nama || berkas.pj">
                    <div class="pj-avatar">{{ getInitials(berkas.penanggung_jawab?.nama || berkas.pj) }}</div>
                    <span class="pj-name text-truncate fs-xs">{{ berkas.penanggung_jawab?.nama || berkas.pj }}</span>
                  </div>
                </td>
              </template>

              <!-- Kredensial Tab Columns -->
              <template v-else-if="activeTab === 'kredensial'">
                <td>
                  <div class="fw-bold text-dark fs-6">{{ berkas.perihal || berkas.judul }}</div>
                  <div class="mt-1 d-flex gap-2 align-items-center">
                    <span class="badge" style="background:#f1f5f9; color:#64748b; font-weight:500; font-size:10px; border:1px solid #e2e8f0;">
                      <i class="fas fa-hashtag me-1"></i> {{ formatNomorSurat(berkas) }}
                    </span>
                    <small class="text-muted" style="font-size: 10px;"><i class="far fa-calendar-alt me-1"></i> {{ formatDate(berkas.tgl_terbit) }}</small>
                  </div>
                </td>
                <td>
                  <template v-if="berkas.sk">
                    <div class="fw-medium text-purple-dark mb-1" style="line-height: 1.2;">{{ berkas.sk.judul }}</div>
                    <div class="d-flex flex-wrap gap-1">
                      <span class="badge" style="background:#f5f3ff; color:#7c3aed; font-weight:500; font-size:10px; border:1px solid #ddd6fe;">
                        <i class="fas fa-file-signature me-1"></i> {{ formatNomorSk(berkas.sk) }}
                      </span>
                      <span v-if="berkas.sk.kredensial" class="badge" style="background:#fff7ed; color:#c2410c; font-weight:600; font-size:10px; border:1px solid #ffedd5;">
                        <i class="fas fa-medal me-1"></i> {{ berkas.sk.kredensial.label }}
                      </span>
                      <span class="badge" style="background:#f0fdf4; color:#15803d; font-weight:500; font-size:10px; border:1px solid #dcfce7;">
                        <i class="fas fa-calendar-check me-1"></i> {{ formatDate(berkas.sk.tgl_terbit) }}
                      </span>
                    </div>
                  </template>
                  <template v-else-if="berkas.status_approval === 'disetujui'">
                    <span class="badge" style="background:#fef2f2; color:#ef4444; font-weight:500; font-size:10px; border:1px solid #fecaca;">
                      <i class="fas fa-exclamation-circle me-1"></i> SK Belum Ditautkan
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-muted italic small">Menunggu Persetujuan</span>
                  </template>
                </td>
                <td>
                  <div v-if="berkas.target_pegawai" class="pj-cell" :title="berkas.target_pegawai.nama">
                    <div class="pj-avatar bg-purple-light text-purple">{{ getInitials(berkas.target_pegawai.nama) }}</div>
                    <div class="d-flex flex-column">
                      <span class="pj-name text-truncate fw-bold">{{ berkas.target_pegawai.nama }}</span>
                      <small class="text-muted" style="font-size: 10px;">{{ berkas.nik }}</small>
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <button class="btn-quick-link" @click="openEditModal(berkas)" title="Set Pegawai">
                      <i class="fas fa-user-plus me-1"></i> Set Pegawai
                    </button>
                  </div>
                </td>
                <td>
                  <div v-if="berkas.sk?.bukti_kredensial" class="status-container clickable" @click="openFile(berkas.sk.bukti_kredensial, 'sk')">
                     <span class="badge" style="background:#ecfdf5; color:#059669; border: 1px solid #d1fae5;">
                        <i class="fas fa-check-circle me-1"></i> Tersedia
                     </span>
                  </div>
                  <div v-else class="text-center">
                    <button class="btn-quick-upload" @click="openUploadKredensialModal(berkas)" title="Upload Bukti Kredensial">
                      <i class="fas fa-upload me-1"></i> Upload
                    </button>
                  </div>
                </td>
              </template>

              <td>
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openDetailModal(berkas)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>

                  <template v-if="activeTab === 'kredensial' && berkas.status_approval === 'disetujui'">
                    <button v-if="berkas.sk?.berkas" class="btn-action btn-file" @click="openFile(berkas.sk.berkas)" title="Lihat Berkas">
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <button v-else disabled class="btn-action btn-file-disabled" title="Berkas Belum Diupload">
                      <i class="fas fa-file-excel"></i>
                    </button>
                  </template>

                  <div class="dropdown-more">
                    <button class="btn-action btn-more" @click="toggleMenu(index)" title="Lainnya">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div v-if="activeMenu === index" class="dropdown-menu-custom">
                      <button class="dropdown-item" @click="openEditModal(berkas); activeMenu = null">
                        <i class="fas fa-edit text-primary"></i> Edit {{ activeTab === 'kredensial' ? 'Pengajuan' : 'Berkas' }}
                      </button>
                      <button v-if="activeTab === 'kredensial' && berkas.status_approval === 'disetujui'" class="dropdown-item" @click="openSkKredensialModal(berkas); activeMenu = null">
                        <i class="fas fa-file-signature text-purple"></i> Terbitkan / Update SK
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item text-danger" @click="confirmDelete(berkas); activeMenu = null">
                        <i class="fas fa-trash"></i> Hapus {{ activeTab === 'kredensial' ? 'Pengajuan' : 'Berkas' }}
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Table for Staf -->
        <table v-else-if="berkasList.length > 0 && activeTab === 'staf'" class="modern-table">
          <thead>
            <tr>
              <th width="50" class="text-center">No</th>
              <th style="min-width: 200px;">NIK / Nama</th>
              <th style="min-width: 150px;">Profesi</th>
              <th style="min-width: 150px;">Unit</th>
              <th style="min-width: 200px;">STR / SIP</th>
              <th style="min-width: 200px;">Pendidikan / Prodi</th>
              <th style="min-width: 100px;">Bukti</th>
              <th width="100" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(staf, index) in berkasList" :key="index" class="table-row-hover">
              <td class="text-muted text-center">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="fw-bold text-dark">{{ staf.nama }}</div>
                <div class="text-muted fs-xs">{{ staf.nik }}</div>
              </td>
              <td>
                <div class="text-dark">{{ staf.kategori_profesi || '-' }}</div>
                <div class="text-muted fs-xs">{{ staf.jbtn || '-' }}</div>
              </td>
              <td>
                <div class="badge-unit">
                  <i class="fas fa-building me-1"></i>
                  {{ (staf.departemen && staf.departemen !== '-') ? staf.departemen : 'Belum Set' }}
                </div>
              </td>
              <td>
                <div class="d-flex flex-column gap-1">
                  <div v-if="staf.nomor_str" class="mini-badge bg-blue-light text-blue" title="Nomor STR">
                    <i class="fas fa-id-card me-2"></i> {{ staf.nomor_str }}
                  </div>
                  <div v-if="staf.nomor_sip" class="mini-badge bg-orange-light text-orange" title="Nomor SIP">
                    <i class="fas fa-file-medical me-2"></i> {{ staf.nomor_sip }}
                  </div>
                  <div v-if="!staf.nomor_str && !staf.nomor_sip" class="text-muted italic smaller">Belum ada data STR/SIP</div>
                </div>
              </td>
              <td>
                <div class="text-dark">{{ staf.pendidikan }}</div>
                <div class="text-muted fs-xs">{{ staf.prodi || '-' }}</div>
              </td>
              <td>
                <a v-if="staf.bukti_kelulusan" :href="getBuktiKelulusanUrl(staf.bukti_kelulusan)" target="_blank" class="badge bg-success text-white text-decoration-none">
                  <i class="fas fa-check-circle me-1"></i> Lihat
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openStafDetail(staf)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-action btn-upload" @click="openUploadBuktiModal(staf)" title="Upload Bukti Kelulusan">
                    <i class="fas fa-upload"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-file-contract"></i>
          </div>
          <h3>Data Tidak Ditemukan</h3>
          <p>Belum ada data {{ activeTab === 'staf' ? 'staf' : 'berkas' }} yang terdaftar atau sesuai kriteria pencarian.</p>
          <button v-if="searchQuery || filterDate" class="btn-outline-primary mt-3" @click="resetFilters">
            <i class="fas fa-sync-alt mr-2"></i>Reset Pencarian
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <div class="pagination-info">
          Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              class="btn-page-number"
              :class="{ active: page === pagination.current_page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="btn-page" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <KesehatanFormModal 
      :show="showFormModal"
      :is-edit="isEditMode"
      :data="selectedBerkas"
      :is-kredensial="activeTab === 'kredensial'"
      @close="showFormModal = false"
      @saved="loadData"
    />

    <KesehatanDetailModal 
      :show="showDetailModal"
      :data="selectedBerkas"
      @close="showDetailModal = false"
    />

    <SkKredensialFormModal 
       :show="showSkKredensialModal"
       :data="selectedBerkas"
       sumberKomite="kesehatan"
       @close="showSkKredensialModal = false"
       @saved="loadData"
    />

    <SkBuktiKredensialUploadModal
      :show="showUploadKredensialModal"
      :sk="selectedBerkas"
      @close="showUploadKredensialModal = false"
      @uploaded="loadData"
    />

    <!-- Modal Detail Staf -->
    <div v-if="showStafDetailModal" class="modal-overlay" @click="showStafDetailModal = false">
      <div class="modal-content modal-lg" @click.stop style="max-width: 800px">
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon bg-primary-light">
              <i class="fas fa-user-md"></i>
            </div>
            <div>
              <h3>Detail Kualifikasi Staf</h3>
              <p class="header-subtitle">{{ selectedStaf?.nama }} ({{ selectedStaf?.nik }})</p>
            </div>
          </div>
          <button class="btn-close-icon" @click="showStafDetailModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body p-4">
          <div class="detail-grid">
            <div class="detail-group">
              <label>Informasi Profesi</label>
              <div class="detail-row">
                <span class="label">Pendidikan</span>
                <span class="value">{{ selectedStaf?.pendidikan || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Program Studi</span>
                <span class="value">{{ selectedStaf?.prodi || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Kategori Profesi</span>
                <span class="value">{{ selectedStaf?.kategori_profesi || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Unit/Departemen</span>
                <span class="value">{{ selectedStaf?.departemen || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Jabatan</span>
                <span class="value">{{ selectedStaf?.jbtn || '-' }}</span>
              </div>
            </div>
            
            <div class="detail-group">
              <label>Informasi Kelulusan & Legalitas</label>
              <div class="detail-row">
                <span class="label">Tanggal Lulus</span>
                <span class="value">{{ formatDate(selectedStaf?.tanggal_lulus) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Nomor STR</span>
                <span class="value">{{ selectedStaf?.nomor_str || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Masa Berlaku STR</span>
                <span class="value">{{ formatDate(selectedStaf?.tgl_akhir_str) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Nomor SIP</span>
                <span class="value">{{ selectedStaf?.nomor_sip || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Masa Berlaku SIP</span>
                <span class="value">{{ formatDate(selectedStaf?.tgl_akhir_sip) }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4" v-if="selectedStaf?.bukti_kelulusan">
            <label class="d-block mb-2 fw-bold text-muted">Verifikasi Ijazah</label>
            <a :href="getBuktiKelulusanUrl(selectedStaf.bukti_kelulusan)" target="_blank" class="btn-preview-file">
              <i class="fas fa-file-pdf me-2"></i> Verifikasi Ijazah
            </a>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showStafDetailModal = false">Tutup</button>
          <button class="btn-save" @click="openUploadBuktiModal(selectedStaf); showStafDetailModal = false">
            <i class="fas fa-upload me-2"></i> Update Bukti
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Upload Verifikasi Ijazah -->
    <div v-if="showUploadBuktiModal" class="modal-overlay" @click="closeUploadBuktiModal">
       <div class="modal-content modal-sm" @click.stop>
          <div class="modal-header modern-header">
             <div class="header-content">
                <div class="header-icon bg-primary-light">
                   <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div>
                   <h3 class="mb-0">Update Ijazah</h3>
                   <p class="header-subtitle fs-xs mb-0">{{ selectedStaf?.nama }}</p>
                </div>
             </div>
             <button class="btn-close-icon" @click="closeUploadBuktiModal">
                <i class="fas fa-times"></i>
             </button>
          </div>
          <div class="modal-body p-4">
             <div 
               class="upload-dropzone" 
               @dragover.prevent 
               @drop.prevent="handleDrop"
               @click="$refs.fileInput.click()"
             >
                <input type="file" ref="fileInput" hidden @change="handleFileChange" accept=".pdf,.jpg,.jpeg,.png">
                <div class="upload-icon-circle mb-3">
                   <i class="fas fa-file-upload"></i>
                </div>
                <p v-if="!buktiFile" class="fw-bold text-dark mb-1">Klik atau seret file ke sini</p>
                <p v-else class="text-success fw-bold mb-1">{{ buktiFile.name }}</p>
                <p class="text-muted fs-xs">Format: PDF, JPG, PNG (Maks 10MB)</p>
             </div>
          </div>
          <div class="modal-footer">
             <button class="btn-cancel" @click="closeUploadBuktiModal" :disabled="uploadingBukti">Batal</button>
             <button class="btn-save" @click="submitUploadBukti" :disabled="!buktiFile || uploadingBukti">
                <span v-if="uploadingBukti" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-check me-2" v-else></i>
                {{ uploadingBukti ? 'Mengunggah...' : 'Simpan Perubahan' }}
             </button>
          </div>
       </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-sm modal-alert" @click.stop>
        <div class="modal-alert-header text-danger">
          <div class="icon-circle-large bg-danger-soft">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="modal-body text-center p-4">
          <h3 class="fw-bold text-dark mb-3">Hapus {{ activeTab === 'kredensial' ? 'Pengajuan' : 'Berkas' }}?</h3>
          <div v-if="selectedBerkas?.sk" class="alert alert-warning border-0 rounded-3 py-2 px-3 mb-3 text-start" style="background: #fffbeb; border: 1px solid #fef3c7 !important;">
            <p class="fs-xs mb-0 text-warning-dark fw-600" style="color: #92400e;">
              <i class="fas fa-exclamation-triangle me-1"></i> <strong>Perhatian:</strong> Berkas ini sudah memiliki SK yang terbit. Menghapus berkas ini <strong>TIDAK</strong> akan menghapus SK-nya, namun tautan akan terputus.
            </p>
          </div>
          <p class="text-muted fs-sm mb-4">
            Anda yakin ingin menghapus data nomor:<br>
            <span class="d-block mt-2 p-2 bg-light rounded-3 fw-bold text-dark border">{{ formatNomorSurat(selectedBerkas) }}</span>
          </p>
          <div class="alert alert-danger-soft border-0 rounded-3 py-2 px-3 mb-0">
            <p class="fs-xs mb-0 text-danger fw-600">
              <i class="fas fa-info-circle me-1"></i> Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div class="modal-footer border-0 bg-white pt-0 pb-4 px-4 justify-content-center">
          <button class="btn btn-light px-4 py-2 rounded-3 fw-bold me-2" @click="showDeleteModal = false">Batal</button>
          <button class="btn btn-danger px-4 py-2 rounded-3 fw-bold shadow-sm" @click="executeDelete" :disabled="deleting">
            <i class="fas fa-trash me-1" v-if="!deleting"></i>
            <span class="spinner-border spinner-border-sm me-1" v-else></span>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { komiteKesehatanService } from '@/services/komiteKesehatanService'
import { skService } from '@/services/skService'
import { pegawaiService } from '@/services/pegawaiService'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

// Import Modals
import KesehatanFormModal from './components/KesehatanFormModal.vue'
import KesehatanDetailModal from './components/KesehatanDetailModal.vue'
import SkKredensialFormModal from './components/SkKredensialFormModal.vue'
import SkBuktiKredensialUploadModal from './components/SkBuktiKredensialUploadModal.vue'

const toast = useToast()

// State
const berkasList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')
const activeMenu = ref(null)
const activeTab = ref('standar') // 'standar' | 'kredensial' | 'staf'
const pendingCount = ref(0)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

// Modal States
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const showSkKredensialModal = ref(false)
const showUploadKredensialModal = ref(false)
const showUploadBuktiModal = ref(false)
const showStafDetailModal = ref(false)
const isEditMode = ref(false)
const selectedBerkas = ref(null)
const selectedStaf = ref(null)
const buktiFile = ref(null)
const uploadingBukti = ref(false)
const deleting = ref(false)

// Close dropdowns when clicking outside
const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-more')) {
    activeMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
  loadData()
  fetchPendingCount()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const toggleMenu = (index) => {
  if (activeMenu.value === index) {
    activeMenu.value = null
  } else {
    activeMenu.value = index
  }
}

const buildFilters = () => {
  const filters = []
  
  if (activeTab.value === 'standar') {
    filters.push({ field: 'status', operator: '=', value: '1' })
  } else if (activeTab.value === 'kredensial') {
    filters.push({ field: 'perihal', operator: 'like', value: '%Kredensial%' })
  }
  
  if (filterDate.value) {
    const dateObj = new Date(filterDate.value)
    dateObj.setDate(dateObj.getDate() + 1)
    const formattedDate = dateObj.toISOString().split('T')[0]
    filters.push({ field: 'tgl_terbit', operator: '=', value: formattedDate })
  }
  
  return filters
}

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const filters = buildFilters()
    let response;
    
    if (activeTab.value === 'standar') {
      response = await komiteKesehatanService.search(searchQuery.value, pagination.value.per_page, page, filters)
    } else if (activeTab.value === 'kredensial') {
      response = await komiteKesehatanService.search(searchQuery.value, pagination.value.per_page, page, filters)
    } else {
      // Data Staf Nakes Lain (Filtered to exclude Perawat, Ners, and Dokter)
      const filters = [
        { field: 'kategori_profesi', operator: 'not_in', value: ['Perawat', 'Ners', 'Dokter'] }
      ]
      response = await pegawaiService.getKualifikasiStaf({
        search: searchQuery.value,
        per_page: pagination.value.per_page,
        page: page,
        group: 'nakes_lain',
        filters: filters
      })
    }
    
    if (response.data) {
      berkasList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: berkasList.value.length
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

const fetchPendingCount = async () => {
  try {
    const filters = [{ field: 'status_approval', operator: '=', value: 'pengajuan' }]
    const kredFilters = [...filters, { field: 'perihal', operator: 'like', value: '%Kredensial%' }]
    const response = await komiteKesehatanService.search('', 1, 1, kredFilters)
    pendingCount.value = response.data?.meta?.total || response.data?.total || 0
  } catch (error) {
    console.error('Error fetching pending count:', error)
  }
}

const handleSearch = debounce(() => {
  pagination.value.current_page = 1
  loadData(1)
}, 500)

const changeTab = (tab) => {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    searchQuery.value = ''
    filterDate.value = ''
    loadData(1)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearDateFilter = () => {
  filterDate.value = ''
  handleSearch()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterDate.value = ''
  handleSearch()
}

const openFile = (filename, type = 'arsip') => {
  if (!filename) return
  
  if (activeTab.value === 'kredensial' || type === 'sk') {
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
    const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
    const url = `${baseUrl}/webapps/rsia_sk/${filename}`
    window.open(url, '_blank')
  } else {
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/arsip/berkas/${filename}`
    window.open(fileUrl, '_blank')
  }
}

const getBuktiKelulusanUrl = (filename) => {
  const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
  const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
  return `${baseUrl}/webapps/rsia_kualifikasi/${filename}`
}

const openStafDetail = (staf) => {
  selectedStaf.value = staf
  showStafDetailModal.value = true
}

const openUploadBuktiModal = (staf) => {
  selectedStaf.value = staf
  buktiFile.value = null
  showUploadBuktiModal.value = true
}

const closeUploadBuktiModal = () => {
  if (uploadingBukti.value) return
  showUploadBuktiModal.value = false
  selectedStaf.value = null
  buktiFile.value = null
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) validateAndSetFile(file)
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) validateAndSetFile(file)
}

const validateAndSetFile = (file) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    toast.error('Format berkas tidak didukung. Gunakan PDF/JPG/PNG')
    return
  }

  if (file.size > maxSize) {
    toast.error('Ukuran berkas terlalu besar. Maksimal 10MB')
    return
  }

  buktiFile.value = file
}

const submitUploadBukti = async () => {
  if (!buktiFile.value || !selectedStaf.value) return

  uploadingBukti.value = true
  const formData = new FormData()
  formData.append('file', buktiFile.value)

  try {
    await pegawaiService.uploadBuktiKelulusan(selectedStaf.value.nik, formData)
    toast.success('Bukti Kelulusan berhasil diupload')
    closeUploadBuktiModal()
    loadData()
  } catch (error) {
    console.error('Error uploading file:', error)
    toast.error('Gagal mengupload file')
  } finally {
    uploadingBukti.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadData(page)
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00') return '-'
  try {
    const d = parseDate(dateString)
    return d ? d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : '-'
  } catch (e) {
    return dateString || '-'
  }
}

const formatNomorSurat = (berkas) => {
  if (!berkas) return '-'
  try {
    const tglPattern = berkas.tgl_terbit ? format(new Date(berkas.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(berkas.nomor).padStart(3, '0')
    const prefix = berkas.prefix || (activeTab.value === 'kredensial' ? 'SK-RSIA' : 'KTKL-RSIA')
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${berkas.nomor}/${berkas.prefix || 'KTKL-RSIA'}`
  }
}

const formatNomorSk = (sk) => {
  if (!sk) return '-'
  try {
    const tglPattern = sk.tgl_terbit ? format(new Date(sk.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(sk.nomor).padStart(3, '0')
    return `${no}/${sk.jenis || 'B'}/${sk.prefix || 'SK-RSIA'}/${tglPattern}`
  } catch (e) {
    return `${sk.nomor}/${sk.jenis || 'B'}/${sk.prefix || 'SK-RSIA'}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'pengajuan': 'badge-status-warning',
    'disetujui': 'badge-status-success',
    'ditolak': 'badge-status-danger'
  }
  return `badge-status ${classes[status] || 'badge-status-secondary'}`
}

const isExpired = (dateString) => {
  if (!dateString) return true
  return new Date(dateString) < new Date()
}

// Actions
const openCreateModal = () => {
  selectedBerkas.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openDetailModal = (berkas) => {
  selectedBerkas.value = berkas
  showDetailModal.value = true
}

const openEditModal = (berkas) => {
  selectedBerkas.value = berkas
  isEditMode.value = true
  showFormModal.value = true
}

const openSkKredensialModal = (berkas) => {
  selectedBerkas.value = berkas
  showSkKredensialModal.value = true
}

const openUploadKredensialModal = (berkas) => {
  selectedBerkas.value = berkas
  showUploadKredensialModal.value = true
}

const confirmDelete = (berkas) => {
  selectedBerkas.value = berkas
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!selectedBerkas.value) return
  
  deleting.value = true
  try {
    const identifier = btoa(`${selectedBerkas.value.nomor}.${selectedBerkas.value.tgl_terbit.split(' ')[0]}`)
    await komiteKesehatanService.delete(identifier)
    
    toast.success('Data berhasil dihapus')
    showDeleteModal.value = false
    loadData(pagination.value.current_page)
    fetchPendingCount()
  } catch (error) {
    console.error('Error deleting:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus data')
  } finally {
    deleting.value = false
  }
}

const displayedPages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  
  return pages
})
</script>

<style scoped>
.sdi-view {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.workflow-info-banner {
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.banner-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.05);
}

.banner-text {
  font-size: 0.85rem;
  line-height: 1.6;
  flex: 1;
}

.banner-title {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
}

.banner-list {
  margin: 0;
  padding-left: 1.2rem;
}

.banner-list li {
  margin-bottom: 0.25rem;
}

.banner-list li:last-child {
  margin-bottom: 0;
}

.banner-sub-list {
  margin: 0;
  padding-left: 1rem;
  list-style-type: disc;
}

.banner-sub-list li {
  margin-bottom: 0.15rem;
  font-size: 0.8rem;
  line-height: 1.5;
}

/* Standar/General Theme (Green/Teal) */
.banner-standar {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #a7f3d0;
}
.banner-standar .banner-icon-wrapper {
  background: #d1fae5;
  color: #059669;
}
.banner-standar .banner-text {
  color: #065f46;
}

/* Kredensial Theme (Indigo/Purple) */
.banner-kredensial {
  background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
  border: 1px solid #c7d2fe;
}
.banner-kredensial .banner-icon-wrapper {
  background: #e0e7ff;
  color: #4f46e5;
}
.banner-kredensial .banner-text {
  color: #3730a3;
}

/* Hero Header */
.hero-header {
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.hero-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgoJPC9zdmc+') repeat;
  opacity: 0.5;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.title-text p {
  color: #e2e8f0;
  margin: 0;
  font-size: 0.95rem;
}

.stats-section {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1.25rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* Action Bar */
.action-bar-modern {
  margin-bottom: 1.5rem;
}

.action-bar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-filter-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search, .clear-filter {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover, .clear-filter:hover {
  color: #ef4444;
  background: #fee2e2;
}

.filter-box {
  position: relative;
  min-width: 180px;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 1;
}

.filter-box input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #334155;
  cursor: pointer;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f59e0b;
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #d97706;
  transform: translateY(-1px);
}

/* Card & Table modern */
.card-modern {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
  position: relative;
  min-height: 300px;
}

/* Loading & Empty state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #3b82f6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
}

.empty-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.75rem;
  color: #3b82f6;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  position: relative;
  animation: floatEmptyIcon 4s ease-in-out infinite;
}

.empty-icon::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  filter: blur(2px);
  animation: shadowScale 4s ease-in-out infinite;
}

@keyframes floatEmptyIcon {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

@keyframes shadowScale {
  0% { transform: translateX(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateX(-50%) scale(0.8); opacity: 0.3; }
  100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
}

.empty-state h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0.5rem 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.empty-state p {
  color: #64748b;
  font-size: 0.925rem;
  margin-bottom: 2rem;
  max-width: 320px;
  line-height: 1.5;
}

.btn-outline-primary {
  padding: 0.75rem 1.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
}

.btn-outline-primary:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.btn-outline-primary:active {
  transform: translateY(0);
}

.btn-outline-primary i {
  font-size: 0.85rem;
  transition: transform 0.4s ease;
}

.btn-outline-primary:hover i {
  transform: rotate(180deg);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

.badge-nomor {
  display: inline-flex;
  font-family: monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
}

.pj-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pj-avatar {
  width: 32px;
  height: 32px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.pj-name {
  font-size: 0.875rem;
  color: #1e293b;
  max-width: 180px;
}

.action-buttons-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}

.btn-more:hover {
  background: #f8fafc;
  color: #1e293b;
}

.dropdown-more {
  position: relative;
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  z-index: 50;
  min-width: 200px;
  overflow: hidden;
  padding: 0.5rem;
}

.dropdown-item {
  width: 100%;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #475569;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.5rem 0;
}

.pagination-container {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-number {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
}

.btn-page-number:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

/* Custom styles for Staf info */
.staf-info-cell {
  display: flex;
  flex-direction: column;
}

.staf-name {
  font-size: 0.9rem;
  color: #1e293b;
}

.staf-nik {
  font-size: 0.75rem;
}

.badge-legal {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.badge-legal.active {
  background: #dcfce7;
  color: #15803d;
}

.badge-legal.expired {
  background: #fee2e2;
  color: #b91c1c;
}

.upload-dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.upload-icon-circle {
  width: 56px;
  height: 56px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto;
  border: 1px solid #dbeafe;
}

.badge-unit {
  background: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  border: 1px solid #e2e8f0;
}

.badge-unit i {
  color: #3b82f6;
  opacity: 0.7;
}

.btn-action.btn-upload {
  background: #f0fdf4;
  color: #15803d;
}

.btn-action.btn-upload:hover {
  background: #dcfce7;
}

.btn-preview-file {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.25rem;
  background: #eff6ff;
  border-radius: 12px;
  color: #3b82f6;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid #dbeafe;
}

.btn-preview-file i {
  font-size: 1.1rem;
}

.btn-preview-file:hover {
  background: #dbeafe;
  border-color: #bfdbfe;
  transform: translateY(-1px);
}

.btn-preview-file:hover {
  background: #e2e8f0;
}

.btn-file {
  background: #f0f9ff;
  color: #0369a1;
}

.btn-file:hover {
  background: #e0f2fe;
}

.btn-file-disabled {
  background: #f8fafc;
  color: #cbd5e1;
  cursor: not-allowed;
}

.btn-quick-link {
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-quick-link:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #334155;
  transform: translateY(-1px);
}

.btn-quick-link i {
  color: #3b82f6;
}

/* Tab Styles from Keperawatan */
.tabs-container {
  display: flex;
}

.capsule-tabs {
  display: flex;
  background: white;
  padding: 0.4rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f6;
  width: fit-content;
}

.capsule-tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.capsule-tab {
  padding: 0.75rem 1.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.capsule-tab i {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.capsule-tab:hover:not(.active) {
  color: #3b82f6;
  background: #f8fafc;
}

.capsule-tab:hover i {
  transform: translateY(-1px);
}

.capsule-tab.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.capsule-tab.active i {
  color: white !important;
}

/* Badge Styles */
.badge-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-status-warning { background: #fef3c7; color: #92400e; }
.badge-status-success { background: #dcfce7; color: #15803d; }
.badge-status-danger { background: #fee2e2; color: #b91c1c; }
.badge-status-secondary { background: #f1f5f9; color: #475569; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 2rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideIn 0.3s ease-out forwards;
}

.modal-content.modal-lg {
  max-width: 800px;
}

.modal-content.modal-sm {
  max-width: 450px;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header.modern-header {
  background: linear-gradient(to right, #ffffff, #f8fafc);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  border-radius: 16px 16px 0 0;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 0 0 16px 16px;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  border: none;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35);
}

.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-close-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 8px;
}

.btn-close-icon:hover {
  background: #fee2e2;
  color: #ef4444;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-primary-light { background: #eff6ff; color: #3b82f6; }
.bg-danger-soft { background: #fee2e2; color: #ef4444; }

.modal-alert {
  overflow: visible;
  padding-top: 2rem;
}

.modal-alert-header {
  display: flex;
  justify-content: center;
}

.icon-circle-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: -1rem;
  z-index: 1;
}

.alert-danger-soft {
  background: #fff1f2;
  color: #e11d48;
}

.fw-600 { font-weight: 600; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-group label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row .label {
  color: #64748b;
  font-size: 0.875rem;
}

.detail-row .value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.875rem;
}

.tab-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 20px;
  margin-left: 8px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
}

.pulse-badge {
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.btn-quick-upload {
  padding: 0.35rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-quick-upload:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.bg-success-light {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
}

.bg-blue-light { background-color: #eff6ff; }
.text-blue { color: #3b82f6; }
.bg-orange-light { background-color: #fff7ed; }
.text-orange { color: #f97316; }

/* Mini Badge */
.mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  gap: 6px;
}
</style>
