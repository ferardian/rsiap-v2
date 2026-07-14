<template>
  <div>
    <!-- Filters & Header Actions -->
    <div class="filter-card shadow-sm mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Periode Bulan</label>
          <input type="month" class="form-control" v-model="filters.bulan" @change="fetchData">
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-hospital me-1"></i> Unit / Ruang</label>
          <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Semua Unit"
            class="style-chooser"
            @update:modelValue="fetchData"
          />
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-search me-1"></i> Cari Responden / Unit</label>
          <input type="text" class="form-control" v-model="filters.keyword" placeholder="Ketik nama staff..." @input="debounceFetch">
        </div>
        <div class="col-md-3">
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center fw-bold shadow-sm" style="height: 38px; border-radius: 8px; font-size: 0.85rem;" @click="openCreateModal">
              <i class="fas fa-plus me-1"></i> Tambah
            </button>
            <button class="btn btn-outline-primary d-flex align-items-center justify-content-center fw-bold shadow-sm" style="height: 38px; border-radius: 8px; font-size: 0.85rem;" @click="openTemplateModal">
              <i class="fas fa-sliders-h me-1"></i> Template
            </button>
            <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 38px; border-radius: 8px;" @click="fetchData" title="Refresh">
              <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table List -->
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
            <thead class="bg-primary text-white" style="font-size: 0.78rem;">
              <tr>
                <th width="5%" class="text-center py-2">#</th>
                <th width="15%" class="text-center py-2">Tanggal</th>
                <th width="20%" class="py-2">Unit / Ruang</th>
                <th width="20%" class="py-2">Responden</th>
                <th width="20%" class="text-center py-2">Kepatuhan Unsur</th>
                <th width="20%" class="text-center py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 text-muted">Memuat data supervisi...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
                  <p>Tidak ada data supervisi implikasi pada periode ini.</p>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="item.id">
                <td class="text-center" style="font-size: 0.75rem;">{{ (page - 1) * limit + index + 1 }}</td>
                <td class="text-center fw-bold text-secondary" style="font-size: 0.75rem;">{{ formatDate(item.tgl_supervisi) }}</td>
                <td>
                  <span class="badge bg-info-subtle text-info border-info-subtle fw-bold" style="font-size: 0.7rem; padding: 3px 8px;">
                    <i class="fas fa-hospital-user me-1"></i> {{ item.departemen?.nama || item.dep_id }}
                  </span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.78rem;">{{ item.nama_responden }}</td>
                <td class="text-center">
                  <div class="d-flex flex-column align-items-center">
                    <span class="badge rounded-pill" :class="getScoreClass(calculateCompliance(item))" style="font-size: 0.72rem; padding: 3px 8px;">
                      {{ calculateCompliance(item) }} % Ya
                    </span>
                    <small class="text-muted mt-1" style="font-size: 0.65rem;">
                      Mutu: {{ countCategoryYa(item, 'MUTU') }}/7 • 
                      Pasien: {{ countCategoryYa(item, 'KESELAMATAN PASIEN') }}/2 • 
                      Risiko: {{ countCategoryYa(item, 'MANAJEMEN RISIKO') }}/2
                    </small>
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-1">
                    <button class="btn btn-info text-white fw-bold d-inline-flex align-items-center justify-content-center" @click="exportToPDF(item)" title="Cetak PDF" style="font-size: 0.78rem; padding: 5px 12px; line-height: 1.4; border-radius: 6px;">
                      <i class="fas fa-file-pdf me-1"></i> PDF
                    </button>
                    <button class="btn btn-warning text-white fw-bold d-inline-flex align-items-center justify-content-center" @click="openEditModal(item)" title="Edit Supervisi" style="font-size: 0.78rem; padding: 5px 12px; line-height: 1.4; border-radius: 6px;">
                      <i class="fas fa-edit me-1"></i> Edit
                    </button>
                    <button class="btn btn-danger fw-bold d-inline-flex align-items-center justify-content-center" @click="confirmDelete(item)" title="Hapus" style="font-size: 0.78rem; padding: 5px 12px; line-height: 1.4; border-radius: 6px;">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="small text-muted">
            Menampilkan <strong>{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }}</strong> dari <strong>{{ total }}</strong> data
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0 custom-pagination">
              <li class="page-item" :class="{ disabled: page === 1 }">
                <button class="page-link" @click="changePage(page - 1)"><i class="fas fa-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="p in displayedPages" :key="p" :class="{ active: page === p, disabled: p === '...' }">
                <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: page === totalPages }">
                <button class="page-link" @click="changePage(page + 1)"><i class="fas fa-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <Teleport to="body">
      <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content-large glass-card shadow-lg">
          <div class="modal-header-premium p-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="m-0 fw-bold text-white">
                <i class="fas fa-clipboard-check me-2"></i>{{ isEditMode ? 'Edit Lembar Supervisi' : 'Buat Supervisi Baru' }}
              </h5>
              <small class="text-white-50">Cek List Monitoring Implikasi Indikator Mutu, Keselamatan Pasien & Manajemen Risiko</small>
            </div>
            <button class="btn-close-premium text-white" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body p-4">
            <!-- Header Inputs -->
            <div class="row g-2 mb-3 p-2 bg-light rounded-3 align-items-end" style="font-size: 0.85rem;">
              <div class="col-md-6 text-start">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Unit Kerja / Ruang</label>
                <v-select 
                  :options="units" 
                  label="nama_ruang" 
                  v-model="form.dep_id"
                  :reduce="unit => unit.dep_id"
                  placeholder="Pilih Unit Kerja"
                  class="style-chooser style-chooser-sm"
                />
              </div>
              <div class="col-md-6 text-start">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Nama Responden</label>
                <v-select 
                  :options="staffList" 
                  label="nama" 
                  v-model="form.nama_responden"
                  :reduce="s => s.nama"
                  placeholder="Cari nama karyawan..."
                  class="style-chooser style-chooser-sm"
                />
              </div>
              <!-- 3 Supervisor Selectors per Category -->
              <div class="col-12 mt-2">
                <div class="p-2 bg-light border border-light-subtle rounded-3">
                  <div class="fw-bold text-secondary mb-2" style="font-size: 0.8rem;"><i class="fas fa-users me-1"></i> Supervisor per Kategori (Komite Mutu)</div>
                  <div class="row g-2">
                    <div class="col-md-4">
                      <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.78rem;"><i class="fas fa-chart-line me-1 text-primary"></i> Indikator Mutu</label>
                      <v-select 
                        :options="committeeMembers" 
                        label="nama" 
                        v-model="form.nik_supervisor_mutu"
                        :reduce="m => m.nik"
                        placeholder="Pilih Supervisor Mutu..."
                        class="style-chooser style-chooser-sm"
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.78rem;"><i class="fas fa-user-shield me-1 text-success"></i> Keselamatan Pasien</label>
                      <v-select 
                        :options="committeeMembers" 
                        label="nama" 
                        v-model="form.nik_supervisor_kp"
                        :reduce="m => m.nik"
                        placeholder="Pilih Supervisor KP..."
                        class="style-chooser style-chooser-sm"
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.78rem;"><i class="fas fa-exclamation-triangle me-1 text-warning"></i> Manajemen Risiko</label>
                      <v-select 
                        :options="committeeMembers" 
                        label="nama" 
                        v-model="form.nik_supervisor_mr"
                        :reduce="m => m.nik"
                        placeholder="Pilih Supervisor MR..."
                        class="style-chooser style-chooser-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 text-start mt-2">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Periode Bulan</label>
                <input type="month" class="form-control form-control-sm" v-model="form.bulan">
              </div>
              <div class="col-md-3 text-start mt-2">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Tanggal Supervisi</label>
                <input type="date" class="form-control form-control-sm" v-model="form.tgl_supervisi">
              </div>
            </div>

            <!-- Question Checklist Table -->
            <div class="table-responsive">
              <table class="table table-bordered align-middle compact-table">
                <thead class="table-dark">
                  <tr>
                    <th width="5%" class="text-center">NO</th>
                    <th width="55%">UNSUR YANG DISUPERVISI</th>
                    <th width="15%" class="text-center">JAWABAN</th>
                    <th width="25%">TEMUAN MASALAH</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Category MUTU -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-chart-line me-2"></i>I. INDIKATOR MUTU</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'MUTU')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1 flex-wrap">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Belum Isi' ? 'btn-secondary text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Belum Isi'"
                        >
                          -
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>

                  <!-- Rekomendasi Indikator Mutu -->
                  <tr class="table-light">
                    <td colspan="4" class="p-2 text-start">
                      <div class="d-flex flex-column">
                        <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">
                          <i class="fas fa-comment-medical text-primary me-1"></i> Rekomendasi Indikator Mutu
                        </label>
                        <textarea 
                          class="form-control form-control-sm input-premium" 
                          v-model="form.rekomendasi_mutu" 
                          rows="2" 
                          placeholder="Ketik rekomendasi tindak lanjut indikator mutu di sini..."
                        ></textarea>
                      </div>
                    </td>
                  </tr>

                  <!-- Category KESELAMATAN PASIEN -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-user-shield me-2"></i>II. KESELAMATAN PASIEN</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'KESELAMATAN PASIEN')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1 flex-wrap">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Belum Isi' ? 'btn-secondary text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Belum Isi'"
                        >
                          -
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>

                  <!-- Rekomendasi Keselamatan Pasien -->
                  <tr class="table-light">
                    <td colspan="4" class="p-2 text-start">
                      <div class="d-flex flex-column">
                        <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">
                          <i class="fas fa-comment-medical text-success me-1"></i> Rekomendasi Keselamatan Pasien
                        </label>
                        <textarea 
                          class="form-control form-control-sm input-premium" 
                          v-model="form.rekomendasi_kp" 
                          rows="2" 
                          placeholder="Ketik rekomendasi tindak lanjut keselamatan pasien di sini..."
                        ></textarea>
                      </div>
                    </td>
                  </tr>

                  <!-- Category MANAJEMEN RISIKO -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-exclamation-triangle me-2"></i>III. MANAJEMEN RISIKO</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'MANAJEMEN RISIKO')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1 flex-wrap">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Belum Isi' ? 'btn-secondary text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Belum Isi'"
                        >
                          -
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>

                  <!-- Rekomendasi Manajemen Risiko -->
                  <tr class="table-light">
                    <td colspan="4" class="p-2 text-start">
                      <div class="d-flex flex-column">
                        <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">
                          <i class="fas fa-comment-medical text-warning me-1"></i> Rekomendasi Manajemen Risiko
                        </label>
                        <textarea 
                          class="form-control form-control-sm input-premium" 
                          v-model="form.rekomendasi_mr" 
                          rows="2" 
                          placeholder="Ketik rekomendasi tindak lanjut manajemen risiko di sini..."
                        ></textarea>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light p-3 border-0 d-flex justify-content-end gap-2">
            <button class="btn btn-secondary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="closeModal" :disabled="saving">
              Batal
            </button>
            <!-- Tombol Simpan Sebagai Baru: hanya muncul saat mode Edit -->
            <button
              v-if="isEditMode"
              class="btn btn-success px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              style="border-radius: 8px;"
              @click="saveAsNew"
              :disabled="saving"
              title="Simpan sebagai data baru (data lama tetap)"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="fas fa-copy"></i>
              Simpan Sebagai Baru
            </button>
            <button class="btn btn-primary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="saveSupervisi" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Data' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Kelola Template Master -->
    <Teleport to="body">
      <div v-if="activeTemplateModal" class="modal-overlay" @click.self="closeTemplateModal">
        <div class="modal-content-large glass-card shadow-lg">
          <div class="modal-header-premium modal-header-warning p-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="m-0 fw-bold text-white">
                <i class="fas fa-sliders-h me-2"></i>Kelola Template Master Unsur
              </h5>
              <small class="text-white-50">Sesuaikan kalimat default penilaian untuk semua audit baru mendatang</small>
            </div>
            <button class="btn-close-premium text-white" @click="closeTemplateModal">&times;</button>
          </div>

          <div class="modal-body p-4 text-start">
            <!-- Toolbar for Template Management -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold text-secondary text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px;">Daftar Unsur Terdaftar</span>
              <button 
                class="btn btn-sm btn-primary px-3 fw-bold d-flex align-items-center gap-1" 
                style="border-radius: 8px; width: auto !important; height: 32px;"
                @click="showAddForm = !showAddForm"
              >
                <i class="fas" :class="showAddForm ? 'fa-times' : 'fa-plus'"></i> 
                {{ showAddForm ? 'Tutup Form' : 'Tambah Unsur' }}
              </button>
            </div>

            <!-- Collapsible Form for Adding New Unsur -->
            <div v-if="showAddForm" class="card mb-3 p-3 border shadow-sm animate__animated animate__fadeIn" style="border-radius: 8px; background: #faf5ff;">
              <div class="fw-bold mb-2 text-dark" style="font-size: 0.85rem;">
                <i class="fas fa-plus-circle me-1 text-primary"></i> Tambah Unsur Template Baru
              </div>
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label mb-1 text-secondary fw-bold" style="font-size: 0.75rem;">Kategori</label>
                  <select class="form-select form-select-sm" v-model="newUnsur.kategori">
                    <option value="MUTU">I. INDIKATOR MUTU</option>
                    <option value="KESELAMATAN PASIEN">II. KESELAMATAN PASIEN</option>
                    <option value="MANAJEMEN RISIKO">III. MANAJEMEN RISIKO</option>
                  </select>
                </div>
                <div class="col-md-7">
                  <label class="form-label mb-1 text-secondary fw-bold" style="font-size: 0.75rem;">Kalimat Unsur</label>
                  <input type="text" class="form-control form-control-sm" v-model="newUnsur.unsur_disupervisi" placeholder="Ketik kalimat template default...">
                </div>
                <div class="col-md-2 d-flex gap-1 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="showAddForm = false" style="width: auto !important; height: 31px;">
                    Batal
                  </button>
                  <button type="button" class="btn btn-sm btn-primary" @click="addNewTemplateElement" :disabled="submittingNewUnsur" style="width: auto !important; height: 31px;">
                    <span v-if="submittingNewUnsur" class="spinner-border spinner-border-sm me-1"></span>
                    Simpan
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered align-middle compact-table">
                <thead class="bg-light text-secondary fw-bold" style="font-size: 0.85rem;">
                  <tr>
                    <th class="text-center" style="width: 60px;">No</th>
                    <th style="width: 180px;">Kategori</th>
                    <th>Kalimat Template Default (Database)</th>
                    <th class="text-center" style="width: 120px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(el, index) in templateElementsLocal" :key="el.no_unsur">
                    <td class="text-center fw-bold">{{ el.no_unsur }}</td>
                    <td>
                      <span class="badge" :class="getCategoryBadgeClass(el.kategori)">
                        {{ el.kategori }}
                      </span>
                    </td>
                    <td>
                      <!-- Display mode -->
                      <div v-if="!el.isEditing" class="p-2">
                        {{ el.unsur_disupervisi }}
                      </div>
                      <!-- Editing mode -->
                      <div v-else>
                        <textarea class="form-control form-control-sm" v-model="el.unsur_disupervisi_edit" rows="2"></textarea>
                      </div>
                    </td>
                    <td class="text-center">
                      <div v-if="!el.isEditing" class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-primary" @click="startEditTemplateRow(index)" title="Edit kalimat">
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteTemplateRow(el.no_unsur)" title="Hapus unsur">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      <div v-else class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-success" @click="saveTemplateRow(index)" title="Simpan perubahan">
                          <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click="cancelEditTemplateRow(index)" title="Batal">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light p-3 border-0 d-flex justify-content-end">
            <button class="btn btn-secondary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="closeTemplateModal">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSquare from '@/assets/logo.png'
import logoLarsi from '@/assets/logo-larsi.png'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'
import QRCode from 'qrcode'
import { useAuthStore } from '@/stores/auth'
import { pegawaiService } from '@/services/pegawaiService'
import committeeService from '@/services/committeeService'

const toast = useToast()
const authStore = useAuthStore()
const staffList = ref([])
const committeeMembers = ref([])
const ketuaPmkp = ref({ nik: '1.211.0918', nama: 'dr. Annisa Permatasuhdan Anggaresti' })

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, { width: 150, margin: 1 })
  } catch (err) {
    console.error('Error generating QR code:', err)
    return null
  }
}

const items = ref([])
const units = ref([])
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const activeModal = ref(false)
const isEditMode = ref(false)
const editId = ref(null)

const filters = reactive({
  bulan: new Date().toISOString().slice(0, 7),
  unit: null,
  keyword: ''
})

const defaultElements = [
  { no_unsur: 1, kategori: 'MUTU', unsur_disupervisi: 'Staff bisa melakukan entry data' },
  { no_unsur: 2, kategori: 'MUTU', unsur_disupervisi: 'Staff memahami profil indikator mutu di unit kerjanya' },
  { no_unsur: 3, kategori: 'MUTU', unsur_disupervisi: 'Staff memahami cara mengumpulkan data indikator mutu' },
  { no_unsur: 4, kategori: 'MUTU', unsur_disupervisi: 'Penanggung jawab data melakukan pengumpulan data indikator mutu ruang' },
  { no_unsur: 5, kategori: 'MUTU', unsur_disupervisi: 'Koordinator ruang melakukan supervise/verifikasi/validasi kebenaran data' },
  { no_unsur: 6, kategori: 'MUTU', unsur_disupervisi: 'Data indikator mutu diolah dan dianalisis di unit kerja' },
  { no_unsur: 7, kategori: 'MUTU', unsur_disupervisi: 'Hasil analisis dan rencana tindak lanjut dilaporkan kepada Komite Mutu melalui Bidang/Bagian terkait' },
  { no_unsur: 8, kategori: 'KESELAMATAN PASIEN', unsur_disupervisi: 'Staff melakukan pelaporan insiden' },
  { no_unsur: 9, kategori: 'KESELAMATAN PASIEN', unsur_disupervisi: 'Staff melakukan investigasi sederhana' },
  { no_unsur: 10, kategori: 'MANAJEMEN RISIKO', unsur_disupervisi: 'Staff mengetahui daftar risiko/unit risk register' },
  { no_unsur: 11, kategori: 'MANAJEMEN RISIKO', unsur_disupervisi: 'Staff mengetahui tindak lanjut mitigasi risiko dilakukan' }
]

const form = reactive({
  dep_id: null,
  nama_responden: '',
  bulan: new Date().toISOString().slice(0, 7),
  tgl_supervisi: new Date().toISOString().split('T')[0],
  status: 'final',
  rekomendasi: '',
  nik_supervisor: null,
  nik_supervisor_mutu: null,
  nik_supervisor_kp: null,
  nik_supervisor_mr: null,
  rekomendasi_mutu: '',
  rekomendasi_kp: '',
  rekomendasi_mr: '',
  details: []
})

const templateElements = ref([])

const fetchTemplateElements = async () => {
  try {
    const response = await api.getSupervisiImplikasiTemplate()
    if (response.data.success) {
      templateElements.value = response.data.data
    }
  } catch (error) {
    console.error('Gagal mengambil template unsur:', error)
  }
}

const activeTemplateModal = ref(false)
const templateElementsLocal = ref([])

const showAddForm = ref(false)
const submittingNewUnsur = ref(false)
const newUnsur = reactive({
  kategori: 'MUTU',
  unsur_disupervisi: ''
})

const addNewTemplateElement = async () => {
  if (!newUnsur.unsur_disupervisi.trim()) {
    toast.error('Kalimat template tidak boleh kosong!')
    return
  }

  submittingNewUnsur.value = true
  try {
    const response = await api.storeSupervisiImplikasiTemplate({
      kategori: newUnsur.kategori,
      unsur_disupervisi: newUnsur.unsur_disupervisi
    })

    if (response.data.success) {
      toast.success('Template unsur baru berhasil ditambahkan')
      newUnsur.unsur_disupervisi = ''
      showAddForm.value = false
      await fetchTemplateElements()
      const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
      templateElementsLocal.value = sourceElements.map(el => ({
        ...el,
        unsur_disupervisi_edit: el.unsur_disupervisi,
        isEditing: false
      }))
    } else {
      toast.error(response.data.message || 'Gagal menambahkan template baru')
    }
  } catch (error) {
    console.error('Error adding template element:', error)
    toast.error('Gagal menyimpan unsur baru')
  } finally {
    submittingNewUnsur.value = false
  }
}

const deleteTemplateRow = async (no_unsur) => {
  Swal.fire({
    title: 'Hapus Unsur?',
    text: 'Unsur ini tidak akan muncul lagi pada lembar supervisi baru.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.deleteSupervisiImplikasiTemplate(no_unsur)
        if (response.data.success) {
          toast.success('Template unsur berhasil dihapus')
          await fetchTemplateElements()
          const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
          templateElementsLocal.value = sourceElements.map(el => ({
            ...el,
            unsur_disupervisi_edit: el.unsur_disupervisi,
            isEditing: false
          }))
        } else {
          toast.error(response.data.message || 'Gagal menghapus template')
        }
      } catch (error) {
        console.error('Error deleting template element:', error)
        toast.error('Gagal menghapus unsur template')
      }
    }
  })
}

const openTemplateModal = async () => {
  await fetchTemplateElements()
  const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
  templateElementsLocal.value = sourceElements.map(el => ({
    ...el,
    unsur_disupervisi_edit: el.unsur_disupervisi,
    isEditing: false
  }))
  activeTemplateModal.value = true
}

const closeTemplateModal = () => {
  activeTemplateModal.value = false
  showAddForm.value = false
  newUnsur.unsur_disupervisi = ''
}

const startEditTemplateRow = (index) => {
  templateElementsLocal.value[index].unsur_disupervisi_edit = templateElementsLocal.value[index].unsur_disupervisi
  templateElementsLocal.value[index].isEditing = true
}

const cancelEditTemplateRow = (index) => {
  templateElementsLocal.value[index].isEditing = false
}

const saveTemplateRow = async (index) => {
  const row = templateElementsLocal.value[index]
  if (!row.unsur_disupervisi_edit.trim()) {
    toast.error('Kalimat template tidak boleh kosong!')
    return
  }
  
  try {
    const response = await api.updateSupervisiImplikasiTemplate(row.no_unsur, {
      unsur_disupervisi: row.unsur_disupervisi_edit
    })
    
    if (response.data.success) {
      row.unsur_disupervisi = row.unsur_disupervisi_edit
      row.isEditing = false
      toast.success('Template unsur berhasil diperbarui')
      await fetchTemplateElements()
    } else {
      toast.error(response.data.message || 'Gagal memperbarui template')
    }
  } catch (error) {
    console.error('Error updating template row:', error)
    toast.error('Gagal memperbarui template unsur')
  }
}

const getCategoryBadgeClass = (kategori) => {
  if (kategori === 'MUTU') return 'bg-info text-dark'
  if (kategori === 'KESELAMATAN PASIEN') return 'bg-danger text-white'
  return 'bg-warning text-dark'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: limit.value,
      bulan: filters.bulan,
      dep_id: filters.unit,
      keyword: filters.keyword
    }
    const response = await api.getSupervisiImplikasi(params)
    if (response.data.success) {
      items.value = response.data.data.data
      total.value = response.data.data.total
      totalPages.value = response.data.data.last_page
    }
  } catch (error) {
    console.error('Error supervisi:', error)
    toast.error('Gagal mengambil data supervisi')
  } finally {
    loading.value = false
  }
}

const fetchUnits = async () => {
  try {
    const response = await api.getUnits()
    // Khusus tab ini: gabungkan FARMASI RAWAT INAP & RAWAT JALAN menjadi "FARMASI"
    // Rename FARMASI RAWAT INAP → FARMASI (pakai dep_id-nya), exclude FARMASI RAWAT JALAN
    units.value = response.data.data
      .filter(u => u.nama_ruang?.toUpperCase() !== 'FARMASI RAWAT JALAN')
      .map(u => {
        if (u.nama_ruang?.toUpperCase() === 'FARMASI RAWAT INAP') {
          return { ...u, nama_ruang: 'FARMASI' }
        }
        return u
      })
  } catch (error) {
    console.error('Error fetch units:', error)
  }
}

const fetchStaff = async () => {
  try {
    const response = await pegawaiService.getKaryawanList()
    if (response.data.success) {
      staffList.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetch staff:', error)
  }
}

const fetchCommitteeMembers = async () => {
  try {
    const response = await committeeService.getAllMembers()
    if (response.data.success) {
      // Find MUTU Ketua
      const pmkpKetua = response.data.data.find(member => {
        const komiteNama = member.komite?.nama?.toUpperCase() || ''
        const jabatanNama = member.jabatan?.nama?.toUpperCase() || ''
        return komiteNama.includes('MUTU') && jabatanNama === 'KETUA'
      })
      if (pmkpKetua) {
        ketuaPmkp.value = {
          nik: pmkpKetua.nik,
          nama: pmkpKetua.pegawai?.nama || pmkpKetua.nik
        }
      }

      committeeMembers.value = response.data.data
        .filter(member => {
          const komiteNama = member.komite?.nama?.toUpperCase() || ''
          return komiteNama.includes('MUTU') || komiteNama.includes('PMKP')
        })
        .map(member => ({
          nik: member.nik,
          nama: member.pegawai?.nama || member.nik
        }))
    }
  } catch (error) {
    console.error('Error fetch committee members:', error)
  }
}

let timeout = null
const debounceFetch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    page.value = 1
    fetchData()
  }, 500)
}

const changePage = (p) => {
  page.value = p
  fetchData()
}

const calculateCompliance = (item) => {
  if (!item.detail || item.detail.length === 0) return 0
  const yaCount = item.detail.filter(d => d.jawaban === 'Ya').length
  return Math.round((yaCount / item.detail.length) * 100)
}

const countCategoryYa = (item, cat) => {
  if (!item.detail) return 0
  return item.detail.filter(d => d.kategori === cat && d.jawaban === 'Ya').length
}

const getScoreClass = (score) => {
  if (score >= 90) return 'bg-success text-white'
  if (score >= 70) return 'bg-warning text-dark'
  return 'bg-danger text-white'
}

const openCreateModal = () => {
  isEditMode.value = false
  editId.value = null
  form.dep_id = null
  form.nama_responden = ''
  form.bulan = new Date().toISOString().slice(0, 7)
  form.tgl_supervisi = new Date().toISOString().split('T')[0]
  form.status = 'final'
  form.rekomendasi = ''
  form.nik_supervisor = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik || null
  form.nik_supervisor_mutu = null
  form.nik_supervisor_kp = null
  form.nik_supervisor_mr = null
  form.rekomendasi_mutu = ''
  form.rekomendasi_kp = ''
  form.rekomendasi_mr = ''
  
  const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
  
  form.details = sourceElements.map(el => ({
    no_unsur: el.no_unsur,
    kategori: el.kategori,
    unsur_disupervisi: el.unsur_disupervisi,
    jawaban: 'Belum Isi',
    temuan_masalah: '',
    isEditingText: false
  }))
  activeModal.value = true
}

const openEditModal = async (item) => {
  isEditMode.value = true
  editId.value = item.id
  loading.value = true
  try {
    const response = await api.getSupervisiImplikasiDetail(item.id)
    if (response.data.success) {
      const data = response.data.data
      form.dep_id = data.dep_id
      form.nama_responden = data.nama_responden
      form.bulan = data.bulan
      form.tgl_supervisi = data.tgl_supervisi
      form.status = data.status
      form.rekomendasi = data.rekomendasi || ''
      form.nik_supervisor = data.nik_supervisor || null
      form.nik_supervisor_mutu = data.nik_supervisor_mutu || null
      form.nik_supervisor_kp = data.nik_supervisor_kp || null
      form.nik_supervisor_mr = data.nik_supervisor_mr || null
      form.rekomendasi_mutu = data.rekomendasi_mutu || ''
      form.rekomendasi_kp = data.rekomendasi_kp || ''
      form.rekomendasi_mr = data.rekomendasi_mr || ''
      form.details = data.detail.map(d => ({
        no_unsur: d.no_unsur,
        kategori: d.kategori,
        unsur_disupervisi: d.unsur_disupervisi,
        jawaban: d.jawaban,
        temuan_masalah: d.temuan_masalah || '',
        isEditingText: false
      }))
      activeModal.value = true
    }
  } catch (error) {
    console.error('Error load detail:', error)
    toast.error('Gagal memuat detail supervisi')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  activeModal.value = false
  isEditMode.value = false
  editId.value = null
}

const saveSupervisi = async () => {
  if (!form.dep_id) {
    toast.warning('Silakan pilih unit kerja')
    return
  }
  if (!form.nama_responden || !form.nama_responden.trim()) {
    toast.warning('Nama responden tidak boleh kosong')
    return
  }

  saving.value = true
  try {
    const payload = {
      dep_id: form.dep_id,
      nama_responden: form.nama_responden,
      bulan: form.bulan,
      tgl_supervisi: form.tgl_supervisi,
      status: form.status,
      rekomendasi: form.rekomendasi,
      nik_supervisor: form.nik_supervisor,
      nik_supervisor_mutu: form.nik_supervisor_mutu,
      nik_supervisor_kp: form.nik_supervisor_kp,
      nik_supervisor_mr: form.nik_supervisor_mr,
      rekomendasi_mutu: form.rekomendasi_mutu,
      rekomendasi_kp: form.rekomendasi_kp,
      rekomendasi_mr: form.rekomendasi_mr,
      details: form.details
    }

    let response
    if (isEditMode.value) {
      response = await api.updateSupervisiImplikasi(editId.value, payload)
    } else {
      response = await api.createSupervisiImplikasi(payload)
    }

    if (response.data.success) {
      toast.success(isEditMode.value ? 'Supervisi berhasil diperbarui' : 'Supervisi berhasil disimpan')
      closeModal()
      fetchData()
    }
  } catch (error) {
    console.error('Error save supervisi:', error)
    toast.error('Gagal menyimpan data supervisi')
  } finally {
    saving.value = false
  }
}

// Simpan sebagai data BARU dari form edit (data lama tetap aman)
const saveAsNew = async () => {
  if (!form.dep_id) {
    toast.warning('Silakan pilih unit kerja')
    return
  }
  if (!form.nama_responden || !form.nama_responden.trim()) {
    toast.warning('Nama responden tidak boleh kosong')
    return
  }

  const confirm = await Swal.fire({
    title: 'Simpan Sebagai Data Baru?',
    html: `Data lama akan <b>tetap tersimpan</b>.<br>Data baru akan dibuat dengan isian form saat ini.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '<i class="fas fa-copy me-1"></i> Ya, Simpan Baru',
    cancelButtonText: 'Batal'
  })

  if (!confirm.isConfirmed) return

  saving.value = true
  try {
    const payload = {
      dep_id: form.dep_id,
      nama_responden: form.nama_responden,
      bulan: form.bulan,
      tgl_supervisi: form.tgl_supervisi,
      status: form.status,
      rekomendasi: form.rekomendasi,
      nik_supervisor: form.nik_supervisor,
      nik_supervisor_mutu: form.nik_supervisor_mutu,
      nik_supervisor_kp: form.nik_supervisor_kp,
      nik_supervisor_mr: form.nik_supervisor_mr,
      rekomendasi_mutu: form.rekomendasi_mutu,
      rekomendasi_kp: form.rekomendasi_kp,
      rekomendasi_mr: form.rekomendasi_mr,
      details: form.details
    }
    // Selalu POST (create), bukan PUT
    const response = await api.createSupervisiImplikasi(payload)
    if (response.data.success) {
      toast.success('Data baru berhasil disimpan! Data lama tetap ada.')
      closeModal()
      fetchData()
    } else {
      toast.error(response.data.message || 'Gagal menyimpan data baru')
    }
  } catch (error) {
    console.error('Error saveAsNew:', error)
    toast.error('Gagal menyimpan data baru')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Hapus Data Supervisi?',
    text: `Supervisi untuk ${item.nama_responden} di unit ${item.departemen?.nama || item.dep_id} akan dihapus secara permanen.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.deleteSupervisiImplikasi(item.id)
        if (response.data.success) {
          toast.success('Supervisi berhasil dihapus')
          fetchData()
        }
      } catch (error) {
        console.error('Error delete:', error)
        toast.error('Gagal menghapus supervisi')
      }
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateFull = (monthStr) => {
  if (!monthStr) return '-'
  const [year, month] = monthStr.split('-')
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

const formatDateIndo = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = page.value
  const delta = 1
  const range = []
  
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

const exportToPDF = async (item) => {
  loading.value = true
  try {
    let detailItem = item
    if (!item.detail || item.detail.length === 0) {
      const response = await api.getSupervisiImplikasiDetail(item.id)
      if (response.data.success) {
        detailItem = response.data.data
      }
    }

    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Load Header and Footer templates
    const headerImg = await loadImage(pdfHeader)
    const footerImg = await loadImage(pdfFooter)

    // Title Section below KOP
    doc.setTextColor(0, 0, 0)
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('CEK LIST MONITORING IMPLIKASI INDIKATOR MUTU, KESELAMATAN', 105, 34, { align: 'center' })
    doc.text('PASIEN, DAN MANAJEMEN RISIKO OLEH KOMITE MUTU', 105, 39, { align: 'center' })

    // Info Section
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('Unit Kerja', 15, 47)
    doc.text(`: ${detailItem.departemen?.nama || detailItem.dep_id}`, 45, 47)
    
    doc.text('Nama Responden', 15, 52)
    doc.text(`: ${detailItem.nama_responden}`, 45, 52)
    
    doc.text('Periode Evaluasi', 15, 57)
    doc.text(`: ${formatDateFull(detailItem.bulan)}`, 45, 57)

    doc.text('Tanggal Penilaian', 120, 47)
    doc.text(`: ${formatDate(detailItem.tgl_supervisi)}`, 150, 47)

    // Generate QR codes
    const supervisorMutuName = detailItem.supervisor_mutu?.nama || detailItem.supervisorMutu?.nama || '-'
    const supervisorKpName = detailItem.supervisor_kp?.nama || detailItem.supervisorKp?.nama || '-'
    const supervisorMrName = detailItem.supervisor_mr?.nama || detailItem.supervisorMr?.nama || '-'
    const koordinatorName = detailItem.koordinator?.nama || detailItem.nama_responden || '-'

    const supervisorMutuQRText = `Ditandatangani secara elektronik oleh:\nNama: ${supervisorMutuName}\nJabatan: Supervisor Indikator Mutu\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`
    const supervisorKpQRText = `Ditandatangani secara elektronik oleh:\nNama: ${supervisorKpName}\nJabatan: Supervisor Keselamatan Pasien\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`
    const supervisorMrQRText = `Ditandatangani secara elektronik oleh:\nNama: ${supervisorMrName}\nJabatan: Supervisor Manajemen Risiko\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`
    const respondentQRText = `Ditandatangani secara elektronik oleh:\nNama: ${koordinatorName}\nJabatan: Kepala Unit\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`

    const supervisorMutuQR = await generateQRCode(supervisorMutuQRText)
    const supervisorKpQR = await generateQRCode(supervisorKpQRText)
    const supervisorMrQR = await generateQRCode(supervisorMrQRText)
    const respondentQR = await generateQRCode(respondentQRText)

    const ketuaPmkpName = ketuaPmkp.value.nama || 'dr. Annisa Permatasuhdan Anggaresti'
    const ketuaPmkpQRText = `Ditandatangani secara elektronik oleh:\nNama: ${ketuaPmkpName}\nJabatan: Ketua Komite Mutu\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`
    const ketuaPmkpQR = await generateQRCode(ketuaPmkpQRText)

    // --- 1. INDIKATOR MUTU ---
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('I. INDIKATOR MUTU', 15, 64)
    
    const tableDataMutu = []
    detailItem.detail.filter(x => x.kategori === 'MUTU').forEach((d, idx) => {
      const row = [
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ]
      if (idx === 0) {
        row.push({ content: '', rowSpan: 7 })
      }
      tableDataMutu.push(row)
    })

    autoTable(doc, {
      startY: 68,
      margin: { left: 15, right: 15 },
      tableWidth: 180,
      head: [['NO', 'UNSUR YANG DISUPERVISI', 'YA', 'TIDAK', 'TEMUAN MASALAH', 'SUPERVISOR']],
      body: tableDataMutu,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 1, right: 1 }, font: 'Helvetica' },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 85 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 36 },
        5: { cellWidth: 27 }
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.cell.section === 'body' && data.row.index === 0) {
          if (supervisorMutuQR) {
            const cell = data.cell
            const qrSize = 11 // Smaller QR code
            const contentHeight = qrSize + 11
            const startY = cell.y + (cell.height - contentHeight) / 2
            
            // 1. Draw Label at the top
            doc.setFont('Helvetica', 'normal')
            doc.setFontSize(5.5)
            doc.text('Supervisor Mutu,', cell.x + cell.width / 2, startY + 2.5, { align: 'center' })

            // 2. Draw QR Code in the middle
            doc.addImage(supervisorMutuQR, 'PNG', cell.x + (cell.width - qrSize) / 2, startY + 4.5, qrSize, qrSize)

            // 3. Draw Name at the bottom
            doc.setFont('Helvetica', 'bold')
            doc.setFontSize(5.5)
            const splitName = doc.splitTextToSize(supervisorMutuName, cell.width - 2)
            doc.text(splitName, cell.x + cell.width / 2, startY + 4.5 + qrSize + 3.5, { align: 'center' })
          }
        }
      }
    })

    let currentY = doc.lastAutoTable.finalY + 4

    // Draw recommendation for MUTU below the table
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('Rekomendasi Indikator Mutu:', 15, currentY)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    const rekomendasiMutuText = detailItem.rekomendasi_mutu || '-'
    const splitMutu = doc.splitTextToSize(rekomendasiMutuText, 180)
    doc.text(splitMutu, 15, currentY + 4)

    currentY += 4 + (splitMutu.length * 4) + 6

    // --- 2. KESELAMATAN PASIEN ---
    if (currentY + 50 > 280) {
      doc.addPage()
      currentY = 32
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('II. KESELAMATAN PASIEN', 15, currentY)
    
    const tableDataKp = []
    detailItem.detail.filter(x => x.kategori === 'KESELAMATAN PASIEN').forEach((d, idx) => {
      const row = [
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ]
      if (idx === 0) {
        row.push({ content: '', rowSpan: 2 })
      }
      tableDataKp.push(row)
    })

    const tableKpY = currentY + 3
    autoTable(doc, {
      startY: tableKpY,
      margin: { left: 15, right: 15 },
      tableWidth: 180,
      head: [['NO', 'UNSUR YANG DISUPERVISI', 'YA', 'TIDAK', 'TEMUAN MASALAH', 'SUPERVISOR']],
      body: tableDataKp,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 1, right: 1 }, font: 'Helvetica' },
      bodyStyles: { cellPadding: { top: 6, bottom: 6, left: 1, right: 1 } }, // taller rows for body only
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 85 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 36 },
        5: { cellWidth: 27 }
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.cell.section === 'body' && data.row.index === 0) {
          if (supervisorKpQR) {
            const cell = data.cell
            const qrSize = 11
            const contentHeight = qrSize + 11
            const startY = cell.y + (cell.height - contentHeight) / 2
            
            // 1. Draw Label at the top
            doc.setFont('Helvetica', 'normal')
            doc.setFontSize(5.5)
            doc.text('Supervisor KP,', cell.x + cell.width / 2, startY + 2.5, { align: 'center' })

            // 2. Draw QR Code in the middle
            doc.addImage(supervisorKpQR, 'PNG', cell.x + (cell.width - qrSize) / 2, startY + 4.5, qrSize, qrSize)

            // 3. Draw Name at the bottom
            doc.setFont('Helvetica', 'bold')
            doc.setFontSize(5.5)
            const splitName = doc.splitTextToSize(supervisorKpName, cell.width - 2)
            doc.text(splitName, cell.x + cell.width / 2, startY + 4.5 + qrSize + 3.5, { align: 'center' })
          }
        }
      }
    })

    currentY = doc.lastAutoTable.finalY + 4

    // Draw recommendation for KP below the table
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('Rekomendasi Keselamatan Pasien:', 15, currentY)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    const rekomendasiKpText = detailItem.rekomendasi_kp || '-'
    const splitKp = doc.splitTextToSize(rekomendasiKpText, 180)
    doc.text(splitKp, 15, currentY + 4)

    currentY += 4 + (splitKp.length * 4) + 6

    // --- 3. MANAJEMEN RISIKO ---
    if (currentY + 85 > 280) {
      doc.addPage()
      currentY = 32
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('III. MANAJEMEN RISIKO', 15, currentY)
    
    const tableDataMr = []
    detailItem.detail.filter(x => x.kategori === 'MANAJEMEN RISIKO').forEach((d, idx) => {
      const row = [
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ]
      if (idx === 0) {
        row.push({ content: '', rowSpan: 2 })
      }
      tableDataMr.push(row)
    })

    const tableMrY = currentY + 3
    autoTable(doc, {
      startY: tableMrY,
      margin: { left: 15, right: 15 },
      tableWidth: 180,
      head: [['NO', 'UNSUR YANG DISUPERVISI', 'YA', 'TIDAK', 'TEMUAN MASALAH', 'SUPERVISOR']],
      body: tableDataMr,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 1, right: 1 }, font: 'Helvetica' },
      bodyStyles: { cellPadding: { top: 6, bottom: 6, left: 1, right: 1 } }, // taller rows for body only
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 85 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 36 },
        5: { cellWidth: 27 }
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.cell.section === 'body' && data.row.index === 0) {
          if (supervisorMrQR) {
            const cell = data.cell
            const qrSize = 11
            const contentHeight = qrSize + 11
            const startY = cell.y + (cell.height - contentHeight) / 2
            
            // 1. Draw Label at the top
            doc.setFont('Helvetica', 'normal')
            doc.setFontSize(5.5)
            doc.text('Supervisor MR,', cell.x + cell.width / 2, startY + 2.5, { align: 'center' })

            // 2. Draw QR Code in the middle
            doc.addImage(supervisorMrQR, 'PNG', cell.x + (cell.width - qrSize) / 2, startY + 4.5, qrSize, qrSize)

            // 3. Draw Name at the bottom
            doc.setFont('Helvetica', 'bold')
            doc.setFontSize(5.5)
            const splitName = doc.splitTextToSize(supervisorMrName, cell.width - 2)
            doc.text(splitName, cell.x + cell.width / 2, startY + 4.5 + qrSize + 3.5, { align: 'center' })
          }
        }
      }
    })

    currentY = doc.lastAutoTable.finalY + 4

    // Draw recommendation for MR below the table
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text('Rekomendasi Manajemen Risiko:', 15, currentY)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    const rekomendasiMrText = detailItem.rekomendasi_mr || '-'
    const splitMr = doc.splitTextToSize(rekomendasiMrText, 180)
    doc.text(splitMr, 15, currentY + 4)

    currentY += 4 + (splitMr.length * 4) + 6

    // Draw Kepala Unit signature on the left
    if (currentY + 42 > 280) {
      doc.addPage()
      currentY = 32
    }

    const dateText = `Pekalongan, ${formatDateIndo(detailItem.tgl_supervisi)}`
    const centerKoorX = 15 + 30
    const centerKetuaX = 195 - 30
    
    // Right: Date, Mengetahui, Ketua Komite Mutu
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(dateText, centerKetuaX, currentY + 4, { align: 'center' })
    doc.text('Mengetahui,', centerKetuaX, currentY + 9, { align: 'center' })
    doc.text('Ketua Komite Mutu,', centerKetuaX, currentY + 14, { align: 'center' })
    if (ketuaPmkpQR) {
      doc.addImage(ketuaPmkpQR, 'PNG', centerKetuaX - 9, currentY + 17, 18, 18)
    }
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(`( ${ketuaPmkpName} )`, centerKetuaX, currentY + 39, { align: 'center' })

    // Left: Kepala Unit
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Kepala Unit,', centerKoorX, currentY + 14, { align: 'center' })
    if (respondentQR) {
      doc.addImage(respondentQR, 'PNG', centerKoorX - 9, currentY + 17, 18, 18)
    }
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(`( ${koordinatorName} )`, centerKoorX, currentY + 39, { align: 'center' })

    // Draw header and footer on all pages
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      if (headerImg) {
        doc.addImage(headerImg, 'PNG', 0, 0, 210, 27.01)
      }
      if (footerImg) {
        doc.addImage(footerImg, 'PNG', 0, 285.82, 210, 11.18)
      }
    }

    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url, '_blank')
    toast.success('PDF berhasil dibuka di tab baru')
  } catch (error) {
    console.error('Error PDF:', error)
    toast.error('Gagal mengekspor PDF')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUnits()
  fetchData()
  fetchTemplateElements()
  fetchStaff()
  fetchCommitteeMembers()
})
</script>

<style scoped>
.filter-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  display: block;
  letter-spacing: 0.5px;
}

.custom-pagination .page-link {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  margin: 0 2px;
  border-radius: 6px !important;
  font-weight: 600;
}

.custom-pagination .page-item.active .page-link {
  background: #435ebe;
  color: #fff;
}

.style-chooser :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  min-height: 38px;
}

/* Premium Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-content-large {
  background: #ffffff;
  width: 100%;
  max-width: 1250px;
  height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  border: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem;
}

.input-premium {
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem !important;
  transition: all 0.2s ease-in-out;
}

.input-premium:focus {
  border-color: #435ebe !important;
  box-shadow: 0 0 0 3px rgba(67, 94, 190, 0.15) !important;
}

.modal-header-premium {
  background: linear-gradient(135deg, #435ebe 0%, #2b3d8f 100%);
  color: #fff;
  flex-shrink: 0;
}

.modal-header-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
}

.modal-footer {
  flex-shrink: 0;
}

.modal-footer .btn {
  width: auto !important;
}

.btn-close-premium {
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

/* Compact Table */
.compact-table th,
.compact-table td {
  padding: 0.4rem 0.6rem !important;
  font-size: 0.85rem !important;
}

/* Small select chooser matching form-control-sm */
.style-chooser-sm :deep(.vs__dropdown-toggle) {
  min-height: 31px !important;
  border-radius: 6px !important;
  font-size: 0.85rem !important;
}
.style-chooser-sm :deep(.vs__selected) {
  margin: 0 !important;
  padding: 0 !important;
}
.style-chooser-sm :deep(.vs__search) {
  margin: 0 !important;
  padding: 0 4px !important;
}

.table-secondary {
  background-color: #f1f5f9 !important;
  color: #1e293b !important;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.btn-toggle {
  min-width: 48px !important;
  height: 25px !important;
  font-size: 0.75rem !important;
  padding: 0 4px !important;
  line-height: 23px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 4px !important;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.btn-outline-secondary {
  border: 1px solid #cbd5e1 !important;
  color: #64748b !important;
  background-color: #f8fafc !important;
}

.btn-outline-secondary:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
  border-color: #94a3b8 !important;
}

.edit-trigger {
  padding: 6px 10px;
  margin: -6px -10px;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.edit-trigger:hover {
  background-color: #f1f5f9;
}

.edit-icon-hover {
  opacity: 0;
  font-size: 0.85rem;
  transition: opacity 0.2s ease-in-out;
}

.edit-trigger:hover .edit-icon-hover {
  opacity: 0.65;
}

.edit-trigger:hover .edit-icon-hover:hover {
  opacity: 1;
}
</style>
