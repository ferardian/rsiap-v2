<template>
  <div class="ebook-container">
    <!-- Header Section -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-extrabold text-dark m-0 d-flex align-items-center gap-2.5">
          <div class="header-icon-box bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
            <i class="fas fa-book-reader fs-5"></i>
          </div>
          Kelola E-Book & Jurnal Ilmiah
        </h3>
        <p class="text-muted small m-0 mt-1">Manajemen perpustakaan digital, koleksi e-book medis, dan jurnal ilmiah RSIA</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold text-nowrap d-flex align-items-center gap-2 shadow-2sm" @click="openCategoryModal">
          <i class="fas fa-tags text-primary"></i> Kelola Kategori
        </button>
        <button class="btn btn-primary rounded-pill px-3.5 py-2 fw-bold text-nowrap d-flex align-items-center gap-2 shadow-sm" @click="openFormModal()">
          <i class="fas fa-plus-circle"></i> Tambah Dokumen
        </button>
      </div>
    </div>

    <!-- Stat Cards Header -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="stat-card p-3 rounded-4 bg-white border shadow-2sm d-flex align-items-center gap-3">
          <div class="stat-icon bg-primary-subtle text-primary rounded-3 p-3 d-flex align-items-center justify-content-center">
            <i class="fas fa-book fa-lg"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold text-uppercase">Total E-Book</div>
            <h4 class="fw-extrabold text-dark m-0 mt-0.5">{{ stats.total_ebook || 0 }}</h4>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="stat-card p-3 rounded-4 bg-white border shadow-2sm d-flex align-items-center gap-3">
          <div class="stat-icon bg-purple-subtle text-purple rounded-3 p-3 d-flex align-items-center justify-content-center" style="background-color: #f3e8ff; color: #7e22ce;">
            <i class="fas fa-journal-whills fa-lg"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold text-uppercase">Total Jurnal</div>
            <h4 class="fw-extrabold text-dark m-0 mt-0.5">{{ stats.total_jurnal || 0 }}</h4>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="stat-card p-3 rounded-4 bg-white border shadow-2sm d-flex align-items-center gap-3">
          <div class="stat-icon bg-emerald-subtle text-emerald rounded-3 p-3 d-flex align-items-center justify-content-center" style="background-color: #ecfdf5; color: #047857;">
            <i class="fas fa-tags fa-lg"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold text-uppercase">Total Kategori</div>
            <h4 class="fw-extrabold text-dark m-0 mt-0.5">{{ stats.total_kategori || 0 }}</h4>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="stat-card p-3 rounded-4 bg-white border shadow-2sm d-flex align-items-center gap-3">
          <div class="stat-icon bg-amber-subtle text-amber rounded-3 p-3 d-flex align-items-center justify-content-center" style="background-color: #fffbeb; color: #b45309;">
            <i class="fas fa-eye fa-lg"></i>
          </div>
          <div>
            <div class="text-muted small fw-semibold text-uppercase">Total Pembaca</div>
            <h4 class="fw-extrabold text-dark m-0 mt-0.5">{{ stats.total_views || 0 }}</h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Toolbar Bar -->
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
      <div class="row g-2.5 align-items-center">
        <!-- Jenis Filter Pills -->
        <!-- Jenis Filter Pills -->
        <div class="col-12 col-md-5 col-lg-4">
          <div class="p-1 rounded-pill border d-flex align-items-center gap-1 w-100" style="height: 42px; background-color: #e2e8f0; border-color: #cbd5e1 !important;">
            <button 
              type="button" 
              class="btn btn-sm rounded-pill flex-fill fw-bold h-100 transition-all d-flex align-items-center justify-content-center gap-1.5 border-0 text-nowrap px-2" 
              :class="selectedJenis === '' ? 'btn-primary text-white shadow-sm' : 'text-secondary bg-transparent'"
              @click="setJenis('')"
            >
              Semua
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-pill flex-fill fw-bold h-100 transition-all d-flex align-items-center justify-content-center gap-1.5 border-0 text-nowrap px-2" 
              :class="selectedJenis === 'ebook' ? 'btn-primary text-white shadow-sm' : 'text-secondary bg-transparent'"
              @click="setJenis('ebook')"
            >
              <i class="fas fa-book" :class="selectedJenis === 'ebook' ? 'text-white' : 'text-primary'"></i> E-Book
            </button>
            <button 
              type="button" 
              class="btn btn-sm rounded-pill flex-fill fw-bold h-100 transition-all d-flex align-items-center justify-content-center gap-1.5 border-0 text-nowrap px-2" 
              :class="selectedJenis === 'jurnal' ? 'btn-purple text-white shadow-sm' : 'text-secondary bg-transparent'"
              @click="setJenis('jurnal')"
            >
              <i class="fas fa-file-alt" :class="selectedJenis === 'jurnal' ? 'text-white' : 'text-purple'"></i> Jurnal
            </button>
          </div>
        </div>

        <!-- Category Dropdown -->
        <div class="col-12 col-md-3">
          <select 
            v-model="selectedKategori" 
            class="form-select rounded-pill border shadow-none bg-white px-3.5" 
            style="height: 42px; border-color: #cbd5e1; font-size: 0.85rem;" 
            @change="loadEbooks(1)"
          >
            <option value="">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.nama_kategori }} ({{ cat.ebooks_count || 0 }})
            </option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="col-12 col-md-4 col-lg-5">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted rounded-start-pill ps-3.5" style="border-color: #cbd5e1; height: 42px;">
              <i class="fas fa-search"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-start-0 ps-0 shadow-none rounded-end-pill" 
              style="height: 42px; border-color: #cbd5e1; font-size: 0.85rem;"
              placeholder="Cari judul, penulis, penerbit, ISBN/ISSN..."
              @keyup.enter="loadEbooks(1)"
            />
            <button v-if="searchQuery" class="btn btn-white border border-start-0 text-muted rounded-end-pill pe-3" style="border-color: #cbd5e1 !important; height: 42px;" @click="searchQuery = ''; loadEbooks(1)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-2 text-primary"></i>
        <p class="m-0 small">Memuat data e-book & jurnal...</p>
      </div>

      <div v-else-if="ebookList.length > 0" class="table-responsive">
        <table class="table align-middle table-hover m-0">
          <thead class="bg-light text-secondary border-bottom">
            <tr style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
              <th class="ps-4 py-3" style="width: 50px;">No</th>
              <th class="py-3" style="width: 60px;">Cover</th>
              <th class="py-3">Judul & Penulis</th>
              <th class="py-3">Jenis & Kategori</th>
              <th class="py-3">Tahun / Penerbit</th>
              <th class="py-3 text-center">Pembaca</th>
              <th class="py-3 text-center">Status</th>
              <th class="py-3 text-center" style="width: 140px;">Aksi</th>
            </tr>
          </thead>
          <tbody style="font-size: 0.85rem;">
            <tr v-for="(item, index) in ebookList" :key="item.id" class="transition-all">
              <!-- No -->
              <td class="ps-4 text-muted fw-semibold">
                {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
              </td>

              <!-- Cover Thumbnail -->
              <td>
                <div class="cover-thumb rounded-2 border overflow-hidden d-flex align-items-center justify-content-center bg-light" style="width: 42px; height: 56px;">
                  <img v-if="item.cover_image" :src="getFileUrl(item.cover_image)" :alt="item.judul" class="w-100 h-100 object-fit-cover" />
                  <i v-else :class="item.jenis === 'ebook' ? 'fas fa-book text-primary' : 'fas fa-file-alt text-purple'" style="font-size: 1.25rem;"></i>
                </div>
              </td>

              <!-- Title & Author -->
              <td>
                <div class="fw-bold text-dark text-truncate" style="max-width: 320px;" :title="item.judul">
                  {{ item.judul }}
                </div>
                <small class="text-muted d-block text-truncate" style="max-width: 320px;" :title="item.penulis">
                  <i class="fas fa-pen-nib me-1 opacity-75"></i> {{ item.penulis }}
                  <span v-if="item.isbn_issn" class="ms-1.5">• {{ item.isbn_issn }}</span>
                </small>
              </td>

              <!-- Jenis & Category Badge -->
              <td>
                <div class="d-flex flex-column gap-1 align-items-start">
                  <span class="badge rounded-pill px-2.5 py-1 fw-bold" :class="item.jenis === 'ebook' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-purple-subtle text-purple border border-purple-subtle'" style="font-size: 0.7rem;">
                    {{ item.jenis === 'ebook' ? '📘 E-BOOK' : '📜 JURNAL' }}
                  </span>
                  <small class="text-secondary fw-semibold" style="font-size: 0.73rem;">
                    <i :class="item.kategori?.icon || 'fas fa-tag'" class="me-1"></i>
                    {{ item.kategori?.nama_kategori || 'Tanpa Kategori' }}
                  </small>
                </div>
              </td>

              <!-- Year & Publisher -->
              <td>
                <div class="fw-semibold text-dark">{{ item.tahun_terbit || '-' }}</div>
                <small class="text-muted d-block text-truncate" style="max-width: 160px;" :title="item.penerbit">
                  {{ item.penerbit || '-' }}
                </small>
              </td>

              <!-- View Count -->
              <td class="text-center">
                <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-bold" style="font-size: 0.75rem;">
                  <i class="fas fa-eye me-1 text-primary"></i> {{ item.views_count || 0 }}
                </span>
              </td>

              <!-- Status -->
              <td class="text-center">
                <span class="badge rounded-pill px-2.5 py-1 fw-bold" :class="getStatusBadgeClass(item.status)" style="font-size: 0.72rem;">
                  {{ item.status ? item.status.toUpperCase() : 'PUBLISH' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1.5">
                  <button 
                    class="btn-action-btn btn-action-pdf rounded-circle border-0 d-flex align-items-center justify-content-center transition-all" 
                    @click="previewPdf(item)" 
                    title="Pratinjau PDF"
                  >
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button 
                    class="btn-action-btn btn-action-edit rounded-circle border-0 d-flex align-items-center justify-content-center transition-all" 
                    @click="openFormModal(item)" 
                    title="Edit Data"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-action-btn btn-action-delete rounded-circle border-0 d-flex align-items-center justify-content-center transition-all" 
                    @click="confirmDelete(item)" 
                    title="Hapus Dokumen"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 text-muted">
        <i class="fas fa-book-open fa-3x mb-3 text-secondary opacity-50"></i>
        <h6 class="fw-bold text-dark">Belum Ada Dokumen E-Book / Jurnal</h6>
        <p class="small m-0 text-muted">Klik tombol "+ Tambah Dokumen" di atas untuk menambahkan dokumen baru.</p>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pagination.total > 0" class="card-footer bg-white border-top py-2.5 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div class="small text-muted">
          Menampilkan <span class="fw-bold text-dark">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span> - <span class="fw-bold text-dark">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> dari <span class="fw-bold text-dark">{{ pagination.total }}</span> dokumen
        </div>

        <div class="d-flex align-items-center gap-1.5">
          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === 1" 
            title="Halaman Sebelumnya"
            @click="loadEbooks(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left" style="font-size: 0.75rem;"></i>
          </button>

          <div class="px-3 py-1 bg-light rounded-pill border small fw-bold text-dark text-nowrap d-inline-flex align-items-center gap-1" style="height: 32px;">
            <span class="text-primary">{{ pagination.current_page }}</span>
            <span class="text-muted opacity-50">/</span>
            <span>{{ pagination.last_page }}</span>
          </div>

          <button 
            class="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary shadow-2sm" 
            style="width: 32px; height: 32px;"
            :disabled="pagination.current_page === pagination.last_page" 
            title="Halaman Selanjutnya"
            @click="loadEbooks(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right" style="font-size: 0.75rem;"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL FORM TAMBAH / EDIT E-BOOK & JURNAL -->
    <!-- ========================================== -->
    <div v-if="showFormModal" class="modal-backdrop-custom" @click.self="showFormModal = false">
      <div class="modal-dialog-custom modal-lg">
        <div class="modal-shell">

          <!-- Header -->
          <div class="modal-header-custom">
            <div class="modal-header-left">
              <div class="modal-header-icon">
                <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-book-reader'"></i>
              </div>
              <div>
                <div class="modal-header-title">
                  {{ isEditMode ? 'Edit Dokumen E-Book / Jurnal' : 'Tambah Dokumen Baru' }}
                </div>
                <div class="modal-header-sub">Lengkapi metadata dan berkas PDF dokumen digital</div>
              </div>
            </div>
            <button type="button" class="modal-close-btn" @click="showFormModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body-custom">
            <form @submit.prevent="saveEbook">

              <!-- Section 1: Informasi Utama & Kategori -->
              <div class="form-section">
                <div class="section-header section-blue">
                  <i class="fas fa-info-circle"></i>
                  <span>Informasi Utama &amp; Kategori</span>
                </div>
                <div class="section-body">
                  <div class="row g-3">
                    <!-- Tipe Dokumen -->
                    <div class="col-md-6">
                      <label class="field-label">Tipe Dokumen <span class="required">*</span></label>
                      <div class="p-1 rounded-pill border d-flex align-items-center gap-1" style="height: 38px; background-color: #e2e8f0; border-color: #cbd5e1 !important;">
                        <button 
                          type="button" 
                          class="btn btn-sm rounded-pill flex-fill fw-bold h-100 transition-all d-flex align-items-center justify-content-center gap-1.5 border-0 text-nowrap" 
                          :class="form.jenis === 'ebook' ? 'btn-primary text-white shadow-sm' : 'text-secondary bg-transparent'" 
                          @click="form.jenis = 'ebook'"
                          style="font-size: 0.78rem; white-space: nowrap; padding: 0 10px;"
                        >
                          <i class="fas fa-book" :class="form.jenis === 'ebook' ? 'text-white' : 'text-primary'"></i> E-Book
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm rounded-pill flex-fill fw-bold h-100 transition-all d-flex align-items-center justify-content-center gap-1.5 border-0 text-nowrap" 
                          :class="form.jenis === 'jurnal' ? 'btn-purple text-white shadow-sm' : 'text-secondary bg-transparent'" 
                          @click="form.jenis = 'jurnal'"
                          style="font-size: 0.78rem; white-space: nowrap; padding: 0 10px;"
                        >
                          <i class="fas fa-file-alt" :class="form.jenis === 'jurnal' ? 'text-white' : 'text-purple'"></i> Jurnal Ilmiah
                        </button>
                      </div>
                    </div>

                    <!-- Kategori Dokumen -->
                    <div class="col-md-6">
                      <label class="field-label">Kategori Dokumen</label>
                      <select v-model="form.kategori_id" class="field-input">
                        <option :value="null">-- Pilih Kategori --</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nama_kategori }}</option>
                      </select>
                    </div>

                    <!-- Judul Dokumen -->
                    <div class="col-12">
                      <label class="field-label">Judul Dokumen <span class="required">*</span></label>
                      <input v-model="form.judul" type="text" class="field-input" placeholder="Masukkan judul lengkap e-book atau jurnal..." required />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Penulis, Penerbit & Publikasi -->
              <div class="form-section">
                <div class="section-header section-indigo">
                  <i class="fas fa-user-edit"></i>
                  <span>Penulis &amp; Detail Publikasi</span>
                </div>
                <div class="section-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="field-label">Penulis / Peneliti <span class="required">*</span></label>
                      <input v-model="form.penulis" type="text" class="field-input" placeholder="Nama pengarang / tim peneliti..." required />
                    </div>
                    <div class="col-md-6">
                      <label class="field-label">Penerbit / Vol. Jurnal</label>
                      <input v-model="form.penerbit" type="text" class="field-input" placeholder="Penerbit / Vol. 1 No. 2..." />
                    </div>
                    <div class="col-md-4">
                      <label class="field-label">Tahun Terbit</label>
                      <input v-model="form.tahun_terbit" type="number" class="field-input" placeholder="2026" min="1900" max="2099" />
                    </div>
                    <div class="col-md-4">
                      <label class="field-label">ISBN / ISSN / DOI</label>
                      <input v-model="form.isbn_issn" type="text" class="field-input" placeholder="ISBN/ISSN..." />
                    </div>
                    <div class="col-md-4">
                      <label class="field-label">Status Publikasi</label>
                      <select v-model="form.status" class="field-input">
                        <option value="publish">🟢 Publish</option>
                        <option value="draft">🟡 Draft</option>
                        <option value="archived">⚪ Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Berkas File & Sampul -->
              <div class="form-section">
                <div class="section-header section-teal">
                  <i class="fas fa-folder-open"></i>
                  <span>Berkas Dokumen &amp; Abstrak</span>
                </div>
                <div class="section-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="field-label">Berkas File PDF <span v-if="!isEditMode" class="required">*</span></label>
                      <input ref="pdfInput" type="file" accept="application/pdf" class="field-input" style="height: 38px; padding-top: 4px;" :required="!isEditMode" @change="handlePdfChange" />
                      <small class="text-muted d-block mt-1" style="font-size: 0.72rem;">Format PDF, maksimal 50 MB.</small>
                      <div v-if="isEditMode && selectedEbook?.file_pdf && !selectedPdfFile" class="mt-1 small text-primary">
                        <i class="fas fa-paperclip me-1"></i> Terpasang: {{ getFileName(selectedEbook.file_pdf) }}
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="field-label">Gambar Sampul / Cover (Opsional)</label>
                      <div class="d-flex gap-2 align-items-center">
                        <input ref="coverInput" type="file" accept="image/*" class="field-input flex-fill" style="height: 38px; padding-top: 4px;" @change="handleCoverChange" />
                        <div v-if="coverPreview" class="cover-mini-thumb rounded-2 border overflow-hidden flex-shrink-0" style="width: 36px; height: 46px;">
                          <img :src="coverPreview" class="w-100 h-100 object-fit-cover" />
                        </div>
                      </div>
                      <small class="text-muted d-block mt-1" style="font-size: 0.72rem;">Format JPG/PNG/WebP, maksimal 5 MB.</small>
                    </div>

                    <div class="col-12">
                      <label class="field-label">Ringkasan / Abstrak</label>
                      <textarea v-model="form.deskripsi" class="field-input field-textarea" rows="3" placeholder="Tuliskan ringkasan singkat atau abstrak dokumen..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer-compact">
            <button type="button" class="btn-modal-cancel" @click="showFormModal = false">
              <i class="fas fa-times me-1"></i>Batal
            </button>
            <button type="button" class="btn-modal-save" @click="saveEbook" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1" style="width:14px;height:14px;"></span>
              <i v-else :class="isEditMode ? 'fas fa-save me-1' : 'fas fa-cloud-upload-alt me-1'"></i>
              {{ isEditMode ? 'Simpan Perubahan' : 'Unggah Dokumen' }}
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL KELOLA KATEGORI -->
    <!-- ========================================== -->
    <div v-if="showCategoryModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-white border-bottom p-3.5 px-4">
            <h5 class="modal-title fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i class="fas fa-tags text-primary"></i> Kelola Kategori E-Book & Jurnal
            </h5>
            <button type="button" class="btn-close" @click="showCategoryModal = false"></button>
          </div>

          <div class="modal-body p-4 bg-white" style="max-height: 65vh; overflow-y: auto;">
            <!-- Form Tambah Kategori -->
            <form class="rounded-4 bg-light border mb-4" style="padding: 1.25rem !important;" @submit.prevent="saveCategory">
              <label class="fw-bold text-dark mb-2 small text-uppercase d-block" style="letter-spacing: 0.04em;">Tambah Kategori Baru</label>
              <div class="row g-2 align-items-center">
                <div class="col-8">
                  <input 
                    v-model="newCategoryName" 
                    type="text" 
                    class="form-control rounded-3 border shadow-none bg-white" 
                    placeholder="Nama Kategori (contoh: Farmasi)" 
                    style="height: 38px; font-size: 0.85rem;"
                    required 
                  />
                </div>
                <div class="col-4">
                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1.5" 
                    style="height: 38px; font-size: 0.85rem;"
                    :disabled="submittingCategory"
                  >
                    <i v-if="submittingCategory" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-plus"></i>
                    Tambah
                  </button>
                </div>
              </div>
            </form>

            <!-- Table Daftar Kategori -->
            <div class="table-responsive">
              <table class="table table-sm align-middle table-hover border rounded-3 overflow-hidden">
                <thead class="bg-light">
                  <tr class="small text-muted">
                    <th class="ps-3 py-2">Nama Kategori</th>
                    <th class="py-2 text-center">Jumlah Dokumen</th>
                    <th class="pe-3 py-2 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="cat in categories" :key="cat.id">
                    <td class="ps-3 fw-bold text-dark">{{ cat.nama_kategori }}</td>
                    <td class="text-center">
                      <span class="badge bg-light text-dark border rounded-pill">{{ cat.ebooks_count || 0 }}</span>
                    </td>
                    <td class="pe-3 text-end">
                      <button class="btn btn-sm btn-light text-danger border-0" title="Hapus Kategori" @click="deleteCategory(cat)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light border-top p-2.5 px-4 d-flex justify-content-end">
            <button class="btn btn-sm btn-secondary rounded-pill px-4 fw-bold" @click="showCategoryModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL PRATINJAU PDF / READER -->
    <!-- ========================================== -->
    <div v-if="showPdfModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(6px); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" style="height: 90vh;">
        <div class="modal-content border-0 shadow-2xl rounded-4 overflow-hidden h-100">
          <div class="modal-header bg-dark text-white p-3 px-4 border-0">
            <div class="d-flex align-items-center gap-2 overflow-hidden">
              <i class="fas fa-file-pdf text-danger fs-5"></i>
              <div class="overflow-hidden">
                <h6 class="modal-title fw-bold text-white m-0 text-truncate" style="max-width: 650px;">{{ activePdfTitle }}</h6>
                <small class="text-white-50">Pratinjau PDF Dokumen Digital</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="showPdfModal = false"></button>
          </div>

          <div class="modal-body p-0 bg-secondary-subtle h-100">
            <iframe v-if="activePdfUrl" :src="activePdfUrl" class="w-100 h-100 border-0"></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ebookService } from '../../services/ebookService'
import { useToast } from 'vue-toastification'
import config from '../../config/api'

const toast = useToast()

// State Data
const ebookList = ref([])
const categories = ref([])
const stats = ref({
  total_ebook: 0,
  total_jurnal: 0,
  total_kategori: 0,
  total_views: 0
})
const loading = ref(false)
const submitting = ref(false)
const submittingCategory = ref(false)

// Filter & Pagination State
const selectedJenis = ref('')
const selectedKategori = ref('')
const searchQuery = ref('')
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

// Modal State
const showFormModal = ref(false)
const isEditMode = ref(false)
const selectedEbook = ref(null)

const showCategoryModal = ref(false)
const newCategoryName = ref('')

const showPdfModal = ref(false)
const activePdfUrl = ref('')
const activePdfTitle = ref('')

// Form Inputs
const form = reactive({
  judul: '',
  jenis: 'ebook',
  kategori_id: null,
  penulis: '',
  penerbit: '',
  tahun_terbit: new Date().getFullYear(),
  isbn_issn: '',
  deskripsi: '',
  jumlah_halaman: null,
  bahasa: 'Indonesia',
  status: 'publish',
})

const pdfInput = ref(null)
const coverInput = ref(null)
const selectedPdfFile = ref(null)
const selectedCoverFile = ref(null)
const coverPreview = ref(null)

// Methods
const loadStats = async () => {
  try {
    const res = await ebookService.getStats()
    if (res.data.success) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('Error loading ebook stats:', err)
  }
}

const loadCategories = async () => {
  try {
    const res = await ebookService.getCategories()
    if (res.data.success) {
      categories.value = res.data.data
    }
  } catch (err) {
    console.error('Error loading ebook categories:', err)
  }
}

const loadEbooks = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
      jenis: selectedJenis.value,
      kategori_id: selectedKategori.value,
      q: searchQuery.value
    }
    const res = await ebookService.getEbooks(params)
    if (res.data.success) {
      ebookList.value = res.data.data
      pagination.value = res.data.pagination
    }
  } catch (err) {
    console.error('Error loading ebooks:', err)
    toast.error('Gagal memuat daftar e-book & jurnal')
  } finally {
    loading.value = false
  }
}

const setJenis = (jenis) => {
  selectedJenis.value = jenis
  loadEbooks(1)
}

const resetForm = () => {
  form.judul = ''
  form.jenis = 'ebook'
  form.kategori_id = null
  form.penulis = ''
  form.penerbit = ''
  form.tahun_terbit = new Date().getFullYear()
  form.isbn_issn = ''
  form.deskripsi = ''
  form.jumlah_halaman = null
  form.bahasa = 'Indonesia'
  form.status = 'publish'

  selectedPdfFile.value = null
  selectedCoverFile.value = null
  coverPreview.value = null
  selectedEbook.value = null
}

const openFormModal = (item = null) => {
  resetForm()
  if (item) {
    isEditMode.value = true
    selectedEbook.value = item
    form.judul = item.judul
    form.jenis = item.jenis
    form.kategori_id = item.kategori_id
    form.penulis = item.penulis
    form.penerbit = item.penerbit
    form.tahun_terbit = item.tahun_terbit
    form.isbn_issn = item.isbn_issn
    form.deskripsi = item.deskripsi
    form.jumlah_halaman = item.jumlah_halaman
    form.bahasa = item.bahasa || 'Indonesia'
    form.status = item.status || 'publish'
    if (item.cover_image) {
      coverPreview.value = getFileUrl(item.cover_image)
    }
  } else {
    isEditMode.value = false
  }
  showFormModal.value = true
}

const handlePdfChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.type !== 'application/pdf') {
      toast.error('File harus berformat PDF')
      e.target.value = ''
      return
    }
    selectedPdfFile.value = file
  }
}

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedCoverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const saveEbook = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('judul', form.judul)
    formData.append('jenis', form.jenis)
    if (form.kategori_id) formData.append('kategori_id', form.kategori_id)
    formData.append('penulis', form.penulis)
    if (form.penerbit) formData.append('penerbit', form.penerbit)
    if (form.tahun_terbit) formData.append('tahun_terbit', form.tahun_terbit)
    if (form.isbn_issn) formData.append('isbn_issn', form.isbn_issn)
    if (form.deskripsi) formData.append('deskripsi', form.deskripsi)
    if (form.jumlah_halaman) formData.append('jumlah_halaman', form.jumlah_halaman)
    if (form.bahasa) formData.append('bahasa', form.bahasa)
    if (form.status) formData.append('status', form.status)

    if (selectedPdfFile.value) {
      formData.append('file_pdf', selectedPdfFile.value)
    }
    if (selectedCoverFile.value) {
      formData.append('cover_image', selectedCoverFile.value)
    }

    let res
    if (isEditMode.value && selectedEbook.value) {
      res = await ebookService.updateEbook(selectedEbook.value.id, formData)
    } else {
      res = await ebookService.createEbook(formData)
    }

    if (res.data.success) {
      toast.success(isEditMode.value ? 'Dokumen berhasil diperbarui' : 'Dokumen berhasil diunggah')
      showFormModal.value = false
      loadEbooks(pagination.value.current_page)
      loadStats()
      loadCategories()
    }
  } catch (err) {
    console.error('Error saving ebook:', err)
    let msg = 'Gagal menyimpan e-book / jurnal'
    if (err.response?.data) {
      if (err.response.data.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0]
        if (firstKey && err.response.data.errors[firstKey][0]) {
          msg = err.response.data.errors[firstKey][0]
        }
      } else if (err.response.data.message) {
        msg = err.response.data.message
      }
    }
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  if (confirm(`Apakah Anda yakin ingin menghapus "${item.judul}"?`)) {
    try {
      const res = await ebookService.deleteEbook(item.id)
      if (res.data.success) {
        toast.success('Dokumen berhasil dihapus')
        loadEbooks(pagination.value.current_page)
        loadStats()
        loadCategories()
      }
    } catch (err) {
      console.error('Error deleting ebook:', err)
      toast.error('Gagal menghapus dokumen')
    }
  }
}

const previewPdf = (item) => {
  if (!item.file_pdf) {
    toast.warning('Berkas PDF tidak ditemukan')
    return
  }
  ebookService.incrementView(item.id)
  activePdfTitle.value = item.judul
  activePdfUrl.value = getFileUrl(item.file_pdf)
  showPdfModal.value = true
}

// Category Methods
const openCategoryModal = () => {
  newCategoryName.value = ''
  showCategoryModal.value = true
}

const saveCategory = async () => {
  if (!newCategoryName.value.trim()) return
  submittingCategory.value = true
  try {
    const res = await ebookService.createCategory({ nama_kategori: newCategoryName.value.trim() })
    if (res.data.success) {
      toast.success('Kategori berhasil ditambahkan')
      newCategoryName.value = ''
      loadCategories()
      loadStats()
    }
  } catch (err) {
    console.error('Error saving category:', err)
    toast.error('Gagal menambahkan kategori')
  } finally {
    submittingCategory.value = false
  }
}

const deleteCategory = async (cat) => {
  if (confirm(`Hapus kategori "${cat.nama_kategori}"? Dokumen di kategori ini tidak akan terhapus.`)) {
    try {
      const res = await ebookService.deleteCategory(cat.id)
      if (res.data.success) {
        toast.success('Kategori berhasil dihapus')
        loadCategories()
        loadStats()
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      toast.error('Gagal menghapus kategori')
    }
  }
}

// Helper Utilities
const getFileUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const apiV2Url = config?.public?.API_V2_URL || config?.public?.API_BASE_URL || ''

  if (path.startsWith('ebook/pdf/')) {
    const filename = path.replace('ebook/pdf/', '')
    return `${apiV2Url}/sdi/ebook/file/${filename}`
  }

  if (path.startsWith('ebook/cover/')) {
    const filename = path.replace('ebook/cover/', '')
    return `${apiV2Url}/sdi/ebook/cover/${filename}`
  }

  const baseUrl = apiV2Url.replace(/\/api\/v2\/?$/, '')
  return `${baseUrl}/storage/${path}`
}

const getFileName = (path) => {
  if (!path) return ''
  return path.split('/').pop()
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'publish': return 'bg-success-subtle text-success border border-success-subtle'
    case 'draft': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
    case 'archived': return 'bg-secondary-subtle text-secondary border border-secondary-subtle'
    default: return 'bg-success-subtle text-success border border-success-subtle'
  }
}

onMounted(() => {
  loadStats()
  loadCategories()
  loadEbooks(1)
})
</script>

<style scoped>
.ebook-container {
  padding: 1.75rem;
  max-width: 100%;
}

.ebook-modal-footer {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 0.75rem !important;
  padding: 1rem 1.5rem !important;
  background-color: #f8fafc !important;
  border-top: 1px solid #e2e8f0 !important;
  flex-shrink: 0 !important;
}

.ebook-modal-footer .btn {
  width: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
}

.bg-purple-subtle {
  background-color: #f3e8ff !important;
}

.text-purple {
  color: #7e22ce !important;
}

.border-purple-subtle {
  border-color: #e9d5ff !important;
}

.border-purple {
  border-color: #9333ea !important;
}

.cursor-pointer {
  cursor: pointer;
}

.object-fit-cover {
  object-fit: cover;
}

.btn-purple {
  background-color: #9333ea !important;
  border-color: #9333ea !important;
  color: #ffffff !important;
}

.bento-box {
  transition: all 0.2s ease;
  border-color: #e2e8f0 !important;
}

.bento-box:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.custom-file-box {
  border-color: #cbd5e1 !important;
  transition: all 0.2s ease;
}

.custom-file-box:hover {
  border-color: #3b82f6 !important;
  background-color: #f8fafc !important;
}

.border-dashed {
  border-style: dashed !important;
}

.shadow-2sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

/* Action Buttons Styling */
.btn-action-btn {
  width: 32px;
  height: 32px;
  font-size: 0.82rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-action-btn:hover {
  transform: translateY(-2px) scale(1.08);
}

.btn-action-pdf {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

.btn-action-pdf:hover {
  background-color: #dc2626 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.28) !important;
}

.btn-action-edit {
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
}

.btn-action-edit:hover {
  background-color: #0284c7 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.28) !important;
}

.btn-action-delete {
  background-color: #fff1f2 !important;
  color: #e11d48 !important;
}

.btn-action-delete:hover {
  background-color: #e11d48 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.28) !important;
}

/* ===== Modal Backdrop + Shell (Laporan Operasi Design System) ===== */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 820px;
}

.modal-shell {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* ===== Header ===== */
.modal-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  flex-shrink: 0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.modal-header-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.modal-header-sub {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-top: 1px;
}

.modal-close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.18s;
}
.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== Body ===== */
.modal-body-custom {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

/* ===== Form Sections ===== */
.form-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 0.85rem;
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-top-left-radius: 11px;
  border-top-right-radius: 11px;
}

.section-header i {
  font-size: 0.8rem;
  opacity: 0.85;
}

.section-blue {
  background: linear-gradient(90deg, #eff6ff, #dbeafe);
  color: #1e40af;
  border-bottom: 1px solid #bfdbfe;
}

.section-indigo {
  background: linear-gradient(90deg, #eef2ff, #e0e7ff);
  color: #3730a3;
  border-bottom: 1px solid #c7d2fe;
}

.section-teal {
  background: linear-gradient(90deg, #f0fdfa, #ccfbf1);
  color: #0f766e;
  border-bottom: 1px solid #99f6e4;
}

.section-body {
  padding: 0.9rem 1rem;
}

/* ===== Field Inputs ===== */
.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.required {
  color: #ef4444;
}

.field-input {
  display: block;
  width: 100%;
  font-size: 0.82rem;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.38rem 0.7rem;
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  height: 36px;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.field-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-textarea {
  height: auto !important;
  resize: vertical;
  line-height: 1.5;
}

/* ===== Modal Footer ===== */
.modal-footer-compact {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.btn-modal-cancel {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.38rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;
}
.btn-modal-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #334155;
}

.btn-modal-save {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.4rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
.btn-modal-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}
.btn-modal-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
</style>
