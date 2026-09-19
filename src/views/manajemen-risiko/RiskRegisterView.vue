<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-clipboard-list text-primary"></i> Daftar Risiko (Risk Register)
        </h4>
        <p class="text-slate-500 mb-0 small">
          Identifikasi bahaya, penilaian risiko inheren & residual, pengendalian (avoid, mitigasi, segregasi, administrasi, retensi, transfer).
        </p>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <button @click="openModalCreate" class="btn btn-sm btn-primary shadow-sm d-flex align-items-center gap-1.5">
          <i class="fas fa-plus-circle"></i>
          <span>Tambah Identifikasi Risiko</span>
        </button>

        <button @click="exportToExcel" class="btn btn-sm btn-success shadow-sm d-flex align-items-center gap-1.5" :disabled="!items.length">
          <i class="fas fa-file-excel"></i>
          <span>Export Excel</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="card border-0 shadow-sm rounded-3 mb-3">
      <div class="card-body p-3">
        <div class="row g-2">
          <!-- Periode -->
          <div class="col-12 col-md-3">
            <label class="form-label small text-muted mb-1">Tahun Periode</label>
            <select v-model="filters.id_periode" @change="fetchData" class="form-select form-select-sm">
              <option v-for="p in periodes" :key="p.id_periode" :value="p.id_periode">
                {{ p.nama_periode }} ({{ p.tahun }})
              </option>
            </select>
          </div>

          <!-- Unit / Departemen -->
          <div class="col-12 col-md-3">
            <label class="form-label small text-muted mb-1">Unit Kerja / Ruang</label>
            <v-select
              v-model="filters.kd_departemen"
              :options="departemens"
              :reduce="u => u.dep_id"
              label="nama"
              placeholder="Semua Unit Kerja"
              class="v-select-custom v-select-filter"
              @update:modelValue="fetchData"
            >
              <template #no-options>
                <div class="text-muted small p-2 text-center">Unit tidak ditemukan</div>
              </template>
            </v-select>
          </div>

          <!-- Klasifikasi Risiko -->
          <div class="col-12 col-md-3">
            <label class="form-label small text-muted mb-1">Klasifikasi Risiko</label>
            <select v-model="filters.id_klasifikasi" @change="fetchData" class="form-select form-select-sm">
              <option value="">Semua Klasifikasi (11)</option>
              <option v-for="k in klasifikasis" :key="k.id_klasifikasi" :value="k.id_klasifikasi">
                {{ k.nama_klasifikasi }}
              </option>
            </select>
          </div>

          <!-- Level Risiko Awal -->
          <div class="col-12 col-md-3">
            <label class="form-label small text-muted mb-1">Tingkat Risiko Awal</label>
            <select v-model="filters.level_awal" @change="fetchData" class="form-select form-select-sm">
              <option value="">Semua Tingkat</option>
              <option value="ekstrem">Ekstrem (Merah)</option>
              <option value="tinggi">Tinggi (Kuning)</option>
              <option value="sedang">Sedang (Hijau)</option>
              <option value="rendah">Rendah (Biru)</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="col-12 mt-2">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
              <input 
                type="text" 
                v-model="filters.search" 
                @input="handleSearch"
                placeholder="Cari kata kunci identifikasi risiko, proses kerja, sasaran, atau sumber risiko..." 
                class="form-control border-start-0"
              />
              <button v-if="filters.search" @click="filters.search = ''; fetchData()" class="btn btn-outline-secondary">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="card border-0 shadow-sm rounded-3">
      <div class="card-header bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
        <div class="small fw-semibold text-slate-700">
          Menampilkan <span class="text-primary fw-bold">{{ items.length }}</span> butir risiko terdaftar
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-danger-subtle text-danger border border-danger-subtle">Ekstrem: {{ countByLevel('ekstrem') }}</span>
          <span class="badge bg-warning-subtle text-warning border border-warning-subtle">Tinggi: {{ countByLevel('tinggi') }}</span>
          <span class="badge bg-success-subtle text-success border border-success-subtle">Sedang: {{ countByLevel('sedang') }}</span>
          <span class="badge bg-info-subtle text-info border border-info-subtle">Rendah: {{ countByLevel('rendah') }}</span>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle mb-0 custom-risk-table" style="font-size: 0.82rem;">
            <thead class="table-light text-nowrap">
              <tr>
                <th class="text-center" style="width: 40px;">No</th>
                <th>Unit / Ruang</th>
                <th>Proses Kerja & Sasaran</th>
                <th>Klasifikasi & Lingkup</th>
                <th>Identifikasi Risiko</th>
                <th class="text-center bg-danger-subtle text-danger" style="width: 100px;">Risiko Awal (D×F=R)</th>
                <th>Rekomendasi Pengendalian</th>
                <th class="text-center bg-success-subtle text-success" style="width: 100px;">Risiko Sisa (D×F=R)</th>
                <th>Risk Owner</th>
                <th class="text-center" style="width: 80px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fas fa-spinner fa-spin fs-3 d-block mb-2 text-primary"></i>
                  Memuat daftar risiko...
                </td>
              </tr>
              <tr v-else-if="!items.length">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fas fa-clipboard-check fs-2 text-slate-300 d-block mb-2"></i>
                  Belum ada data risiko terdaftar pada filter ini. Klik <strong>"Tambah Identifikasi Risiko"</strong> untuk mulai mencatat.
                </td>
              </tr>
              <tr v-for="(item, idx) in items" :key="item.id_risiko">
                <td class="text-center fw-semibold text-muted">{{ idx + 1 }}</td>
                <td class="fw-semibold text-slate-800">
                  {{ item.departemen?.nama || item.kd_departemen }}
                </td>
                <td style="min-width: 200px;">
                  <div class="fw-semibold text-slate-800 mb-0.5">{{ item.proses_kerja }}</div>
                  <div class="text-muted small"><i class="fas fa-bullseye me-1 text-primary"></i>{{ item.sasaran }}</div>
                </td>
                <td style="min-width: 170px;">
                  <span class="badge bg-slate-100 text-slate-700 border mb-1 d-block text-truncate">
                    {{ item.klasifikasi?.nama_klasifikasi }}
                  </span>
                  <span class="small text-muted d-block">
                    <i class="fas fa-crosshairs me-1"></i>{{ item.ruang_lingkup?.nama_ruang_lingkup }}
                  </span>
                </td>
                <td style="min-width: 240px;">
                  <div class="fw-semibold text-slate-800 mb-1">{{ item.identifikasi_risiko }}</div>
                  <div class="small text-muted"><span class="fw-semibold">Sumber:</span> {{ item.sumber_risiko }}</div>
                  <div class="small text-muted"><span class="fw-semibold">Kontrol Ada:</span> {{ item.pengendalian_ada }}</div>
                </td>
                <!-- Skor Inheren -->
                <td class="text-center bg-danger-subtle">
                  <div class="fw-bold font-monospace fs-6">
                    {{ item.dampak_awal }} × {{ item.frekuensi_awal }} = {{ item.skor_awal }}
                  </div>
                  <span class="badge rounded-pill" :class="getLevelBadgeClass(item.level_awal)">
                    {{ item.level_awal.toUpperCase() }}
                  </span>
                </td>
                <!-- Rekomendasi Pengendalian -->
                <td style="min-width: 250px;">
                  <ul class="list-unstyled mb-0 small" style="font-size: 0.76rem;">
                    <li v-if="item.rekom_avoid"><strong class="text-danger">Avoid:</strong> {{ item.rekom_avoid }}</li>
                    <li v-if="item.rekom_mitigasi"><strong class="text-primary">Mitigasi:</strong> {{ item.rekom_mitigasi }}</li>
                    <li v-if="item.rekom_segregasi"><strong class="text-warning">Segregasi:</strong> {{ item.rekom_segregasi }}</li>
                    <li v-if="item.rekom_administrasi"><strong class="text-info">Administrasi:</strong> {{ item.rekom_administrasi }}</li>
                    <li v-if="item.rekom_retensi"><strong class="text-secondary">Retensi:</strong> {{ item.rekom_retensi }}</li>
                    <li v-if="item.rekom_transfer"><strong class="text-success">Transfer:</strong> {{ item.rekom_transfer }}</li>
                  </ul>
                </td>
                <!-- Skor Residual -->
                <td class="text-center bg-success-subtle">
                  <div class="fw-bold font-monospace fs-6">
                    {{ item.dampak_sisa }} × {{ item.frekuensi_sisa }} = {{ item.skor_sisa }}
                  </div>
                  <span class="badge rounded-pill" :class="getLevelBadgeClass(item.level_sisa)">
                    {{ item.level_sisa.toUpperCase() }}
                  </span>
                </td>
                <td class="small" style="min-width: 140px;">
                  <div class="fw-semibold text-slate-800">{{ item.risk_owner?.nama || '-' }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">
                    Tinjau: {{ item.tgl_tinjauan ? formatDate(item.tgl_tinjauan) : '-' }}
                  </div>
                </td>
                <!-- Aksi -->
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button @click="openModalEdit(item)" class="btn btn-outline-primary" title="Edit Data">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete(item)" class="btn btn-outline-danger" title="Hapus Data">
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

    <!-- Modal Form Tambah / Edit Risiko (Modern & Clean) -->
    <div class="modal fade" id="modalFormRisiko" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <form class="modal-content modal-content-clean" @submit.prevent="saveForm">
          <!-- Clean Modal Header -->
          <div class="modal-header bg-white border-bottom border-slate-100 py-3 px-4 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <div class="modal-icon-indicator" :class="isEditMode ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-primary-subtle text-primary border border-primary-subtle'">
                <i class="fas" :class="isEditMode ? 'fa-pen-to-square' : 'fa-clipboard-check'"></i>
              </div>
              <div>
                <h5 class="modal-title fs-6 fw-bold text-slate-800 mb-0">
                  {{ isEditMode ? 'Edit Identifikasi Risiko' : 'Tambah Identifikasi Risiko Baru' }}
                </h5>
                <p class="text-muted mb-0" style="font-size: 0.76rem;">
                  Formulir identifikasi bahaya, penilaian matriks risiko, dan rekomendasi perlakuan standar PMKP / STARKES
                </p>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-3 p-md-4 bg-slate-50">
              
              <!-- Section 1: Identitas Unit & Ruang Lingkup -->
              <div class="form-section-card">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">1</div>
                    <div>
                      <div class="section-title">Identitas Unit & Klasifikasi Risiko</div>
                      <div class="section-desc">Informasi unit kerja pelapor, sasaran kegiatan, dan kategori risiko</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Identitas Dasar</span>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Tahun Periode</span>
                      <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.id_periode" class="form-select form-select-clean" required>
                      <option v-for="p in periodes" :key="p.id_periode" :value="p.id_periode">
                        {{ p.nama_periode }} ({{ p.tahun }})
                      </option>
                    </select>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Nama Unit / Ruang</span>
                      <span class="text-danger">*</span>
                    </label>
                    <v-select
                      v-model="form.kd_departemen"
                      :options="departemens"
                      :reduce="u => u.dep_id"
                      label="nama"
                      placeholder="Cari & pilih Unit Kerja..."
                      class="v-select-custom v-select-clean"
                    >
                      <template #no-options>
                        <div class="text-muted small p-2 text-center">Unit tidak ditemukan</div>
                      </template>
                    </v-select>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Klasifikasi Risiko</span>
                      <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.id_klasifikasi" class="form-select form-select-clean" required>
                      <option value="">Pilih Klasifikasi</option>
                      <option v-for="k in klasifikasis" :key="k.id_klasifikasi" :value="k.id_klasifikasi">
                        {{ k.nama_klasifikasi }}
                      </option>
                    </select>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Ruang Lingkup Sasaran</span>
                      <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.id_ruang_lingkup" class="form-select form-select-clean" required>
                      <option value="">Pilih Ruang Lingkup</option>
                      <option v-for="rl in ruangLingkups" :key="rl.id_ruang_lingkup" :value="rl.id_ruang_lingkup">
                        {{ rl.nama_ruang_lingkup }}
                      </option>
                    </select>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Proses Kerja / Tahapan</span>
                      <span class="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      v-model="form.proses_kerja" 
                      class="form-control form-control-clean" 
                      placeholder="Contoh: Pemberian obat high alert / transfusi" 
                      required 
                    />
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <span>Sasaran Pengelolaan</span>
                      <span class="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      v-model="form.sasaran" 
                      class="form-control form-control-clean" 
                      placeholder="Contoh: Zero medication error, zero insiden" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <!-- Section 2: Identifikasi Bahaya & Kontrol Saat Ini -->
              <div class="form-section-card">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">2</div>
                    <div>
                      <div class="section-title">Identifikasi Bahaya & Kontrol Eksisting</div>
                      <div class="section-desc">Deskripsikan ancaman kejadian, penyebab pemicu, serta SOP kendali saat ini</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Analisa Bahaya</span>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-triangle-exclamation text-amber-500"></i>
                      <span>Identifikasi Kejadian Risiko</span>
                      <span class="text-danger">*</span>
                    </label>
                    <textarea 
                      v-model="form.identifikasi_risiko" 
                      rows="3" 
                      class="form-control form-control-clean" 
                      placeholder="Deskripsikan potensi insiden / kerugian yang mungkin terjadi..." 
                      required
                    ></textarea>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-sitemap text-indigo-500"></i>
                      <span>Sumber / Pemicu Bahaya</span>
                      <span class="text-danger">*</span>
                    </label>
                    <textarea 
                      v-model="form.sumber_risiko" 
                      rows="3" 
                      class="form-control form-control-clean" 
                      placeholder="Faktor penyebab utama (human error, sistem, fasilitas, vendor, beban kerja)..." 
                      required
                    ></textarea>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-shield-halved text-emerald-500"></i>
                      <span>Pengendalian yang Sudah Ada</span>
                      <span class="text-danger">*</span>
                    </label>
                    <textarea 
                      v-model="form.pengendalian_ada" 
                      rows="3" 
                      class="form-control form-control-clean" 
                      placeholder="SPO, panduan, checklist, atau proteksi yang saat ini telah dijalankan..." 
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Section 3: Penilaian Risiko Awal (Inheren) -->
              <div class="form-section-card">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">3</div>
                    <div>
                      <div class="section-title">Peringkat Risiko Awal (Inheren)</div>
                      <div class="section-desc">Tingkat keparahan dampak (D) dan kemungkinan probabilitas (F) sebelum mitigasi tambahan</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Inheren Scoring</span>
                </div>

                <div class="row g-3 align-items-stretch">
                  <div class="col-12 col-lg-8">
                    <div class="row g-3">
                      <div class="col-12 col-md-6">
                        <label class="form-label-clean">
                          <span>Dampak / Severity (D):</span>
                          <span class="fw-bold text-slate-800">Tingkat {{ form.dampak_awal }}</span>
                        </label>
                        <select v-model.number="form.dampak_awal" class="form-select form-select-clean" required>
                          <option :value="1">1 - Sangat Rendah (Tanpa cedera, kerugian kecil)</option>
                          <option :value="2">2 - Rendah (Cedera ringan, pertolongan pertama/P3K)</option>
                          <option :value="3">3 - Sedang (Cedera reversibel, hari rawat inap naik)</option>
                          <option :value="4">4 - Tinggi (Cedera luas/cacat permanen, kerugian besar)</option>
                          <option :value="5">5 - Sangat Tinggi (Kematian klinis, sanksi hukum berat)</option>
                        </select>
                      </div>

                      <div class="col-12 col-md-6">
                        <label class="form-label-clean">
                          <span>Probabilitas / Frekuensi (F):</span>
                          <span class="fw-bold text-slate-800">Tingkat {{ form.frekuensi_awal }}</span>
                        </label>
                        <select v-model.number="form.frekuensi_awal" class="form-select form-select-clean" required>
                          <option :value="1">1 - Sangat Jarang (&lt; 1 kali dalam 5 tahun)</option>
                          <option :value="2">2 - Jarang Terjadi (1 kali dalam 2 - 5 tahun)</option>
                          <option :value="3">3 - Mungkin Terjadi (1 kali dalam 1 - 2 tahun)</option>
                          <option :value="4">4 - Sering Terjadi (3 - 5 kali per tahun)</option>
                          <option :value="5">5 - Sangat Sering Terjadi (&gt; 5 kali per tahun / rutin)</option>
                        </select>
                      </div>
                    </div>

                    <div class="mt-3 p-2.5 rounded-3 bg-slate-100 border border-slate-200 d-flex align-items-center gap-2 small text-muted">
                      <i class="fas fa-info-circle text-primary"></i>
                      <span>Skor Inheren dihitung otomatis dengan matriks perkalian <strong>D ({{ form.dampak_awal }}) × F ({{ form.frekuensi_awal }})</strong> standar KARS / PMKP.</span>
                    </div>
                  </div>

                  <!-- Right Side Score Card -->
                  <div class="col-12 col-lg-4">
                    <div class="score-summary-card" :class="getScoreCardClass(calcLevelAwal)">
                      <div class="small fw-semibold text-uppercase tracking-wide" style="font-size: 0.7rem; opacity: 0.85;">
                        Skor Risiko Inheren
                      </div>
                      <div class="score-val-big">
                        {{ calcScoreAwal }}
                      </div>
                      <div class="small mb-2" style="font-size: 0.72rem; opacity: 0.85;">
                        Dampak ({{ form.dampak_awal }}) × Frekuensi ({{ form.frekuensi_awal }})
                      </div>
                      <div class="d-flex align-items-center gap-1.5 mb-2">
                        <span :class="getScoreBadgeClass(calcLevelAwal)">
                          {{ calcLevelAwal.toUpperCase() }}
                        </span>
                      </div>
                      <div class="small text-center" style="font-size: 0.68rem; line-height: 1.3; opacity: 0.9;">
                        {{ getActionAdvice(calcLevelAwal) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4: Rekomendasi Pengendalian Risiko -->
              <div class="form-section-card">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">4</div>
                    <div>
                      <div class="section-title">Rekomendasi Tindakan Pengendalian</div>
                      <div class="section-desc">Rencana penanganan bahaya (Risk Control) dan pembiayaan (Risk Financing)</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Treatment & Financing</span>
                </div>

                <div class="row g-3">
                  <!-- Risk Control -->
                  <div class="col-12 col-xl-7">
                    <div class="sub-panel h-100">
                      <div class="sub-panel-title text-primary">
                        <i class="fas fa-shield-heart"></i>
                        <span>A. Pengendalian Risiko (Risk Control)</span>
                      </div>
                      <div class="row g-2.5">
                        <div class="col-12 col-md-6">
                          <label class="form-label-clean">
                            <i class="fas fa-ban text-danger"></i>
                            <span>Avoid (Menghindari)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_avoid" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Menghentikan alat/prosedur berbahaya..." 
                          />
                        </div>

                        <div class="col-12 col-md-6">
                          <label class="form-label-clean">
                            <i class="fas fa-shield-halved text-primary"></i>
                            <span>Mitigasi (Mengurangi)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_mitigasi" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Double check verifikasi 2 petugas..." 
                          />
                        </div>

                        <div class="col-12 col-md-6">
                          <label class="form-label-clean">
                            <i class="fas fa-arrows-split-up-and-left text-warning"></i>
                            <span>Segregasi (Memisahkan)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_segregasi" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Pemisahan lemari obat LASA / High Alert..." 
                          />
                        </div>

                        <div class="col-12 col-md-6">
                          <label class="form-label-clean">
                            <i class="fas fa-clipboard-check text-info"></i>
                            <span>Administratif (SPO / Audit)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_administrasi" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Revisi SPO kerja dan audit berkala..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Risk Financing -->
                  <div class="col-12 col-xl-5">
                    <div class="sub-panel h-100">
                      <div class="sub-panel-title text-success">
                        <i class="fas fa-coins"></i>
                        <span>B. Pembiayaan Risiko (Risk Financing)</span>
                      </div>
                      <div class="row g-2.5">
                        <div class="col-12">
                          <label class="form-label-clean">
                            <i class="fas fa-wallet text-secondary"></i>
                            <span>Retensi (Ditanggung Sendiri)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_retensi" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Alokasi pos anggaran cadangan pemeliharaan..." 
                          />
                        </div>

                        <div class="col-12">
                          <label class="form-label-clean">
                            <i class="fas fa-handshake-angle text-success"></i>
                            <span>Transfer (Dialihkan / Asuransi)</span>
                          </label>
                          <input 
                            type="text" 
                            v-model="form.rekom_transfer" 
                            class="form-control form-control-clean" 
                            placeholder="Contoh: Klausul asuransi / garansi pemeliharaan vendor..." 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 5: Penilaian Risiko Sisa (Residual) -->
              <div class="form-section-card">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">5</div>
                    <div>
                      <div class="section-title">Peringkat Risiko Sisa (Residual)</div>
                      <div class="section-desc">Ekspektasi penurunan skor risiko setelah implementasi rencana pengendalian</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Residual Scoring</span>
                </div>

                <div class="row g-3 align-items-stretch">
                  <div class="col-12 col-lg-8">
                    <div class="row g-3">
                      <div class="col-12 col-md-6">
                        <label class="form-label-clean">
                          <span>Dampak Sisa (D):</span>
                          <span class="fw-bold text-slate-800">Tingkat {{ form.dampak_sisa }}</span>
                        </label>
                        <select v-model.number="form.dampak_sisa" class="form-select form-select-clean" required>
                          <option :value="1">1 - Sangat Rendah</option>
                          <option :value="2">2 - Rendah</option>
                          <option :value="3">3 - Sedang</option>
                          <option :value="4">4 - Tinggi</option>
                          <option :value="5">5 - Sangat Tinggi</option>
                        </select>
                      </div>

                      <div class="col-12 col-md-6">
                        <label class="form-label-clean">
                          <span>Probabilitas Sisa (F):</span>
                          <span class="fw-bold text-slate-800">Tingkat {{ form.frekuensi_sisa }}</span>
                        </label>
                        <select v-model.number="form.frekuensi_sisa" class="form-select form-select-clean" required>
                          <option :value="1">1 - Sangat Jarang</option>
                          <option :value="2">2 - Jarang Terjadi</option>
                          <option :value="3">3 - Mungkin Terjadi</option>
                          <option :value="4">4 - Sering Terjadi</option>
                          <option :value="5">5 - Sangat Sering Terjadi</option>
                        </select>
                      </div>
                    </div>

                    <!-- Progress Indicator -->
                    <div class="mt-3 p-2.5 rounded-3 bg-white border border-slate-200 d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div class="d-flex align-items-center gap-2 small">
                        <i class="fas fa-chart-line text-primary"></i>
                        <span class="text-slate-600">Efektivitas Mitigasi:</span>
                        <span v-if="scoreReduction > 0" class="badge bg-success-subtle text-success border border-success-subtle">
                          <i class="fas fa-arrow-trend-down me-1"></i> Skor Turun {{ scoreReduction }} Poin (-{{ scoreReductionPercent }}%)
                        </span>
                        <span v-else-if="scoreReduction === 0" class="badge bg-light text-muted border">
                          Skor Tidak Berubah
                        </span>
                        <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle">
                          Skor Meningkat (+{{ Math.abs(scoreReduction) }} Poin)
                        </span>
                      </div>

                      <span class="small text-muted" style="font-size: 0.72rem;">
                        Target: D ({{ form.dampak_sisa }}) × F ({{ form.frekuensi_sisa }}) = {{ calcScoreSisa }}
                      </span>
                    </div>
                  </div>

                  <!-- Right Side Score Card -->
                  <div class="col-12 col-lg-4">
                    <div class="score-summary-card" :class="getScoreCardClass(calcLevelSisa)">
                      <div class="small fw-semibold text-uppercase tracking-wide" style="font-size: 0.7rem; opacity: 0.85;">
                        Skor Risiko Sisa (Residual)
                      </div>
                      <div class="score-val-big">
                        {{ calcScoreSisa }}
                      </div>
                      <div class="small mb-2" style="font-size: 0.72rem; opacity: 0.85;">
                        Dampak ({{ form.dampak_sisa }}) × Frekuensi ({{ form.frekuensi_sisa }})
                      </div>
                      <div class="d-flex align-items-center gap-1.5 mb-2">
                        <span :class="getScoreBadgeClass(calcLevelSisa)">
                          {{ calcLevelSisa.toUpperCase() }}
                        </span>
                      </div>
                      <div class="small text-center" style="font-size: 0.68rem; line-height: 1.3; opacity: 0.9;">
                        Target Risiko Setelah Pengendalian
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 6: Akuntabilitas & Tinjauan -->
              <div class="form-section-card mb-0">
                <div class="section-header">
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="section-badge-num">6</div>
                    <div>
                      <div class="section-title">Akuntabilitas & Catatan Evaluasi</div>
                      <div class="section-desc">Penanggung jawab risiko (Risk Owner), jadwal evaluasi, dan catatan justifikasi</div>
                    </div>
                  </div>
                  <span class="badge bg-slate-100 text-slate-600 border border-slate-200 small">Tinjauan Berkala</span>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-user-tie text-primary"></i>
                      <span>Pemilik Risiko (Risk Owner)</span>
                    </label>
                    <v-select
                      v-model="form.risk_owner_nik"
                      :options="petugasOptions"
                      :reduce="p => p.nik"
                      label="label"
                      placeholder="Cari & pilih nama petugas..."
                      class="v-select-custom v-select-clean"
                    >
                      <template #option="{ nama, nik, jbtn }">
                        <div class="d-flex flex-column py-1">
                          <span class="fw-semibold text-slate-800" style="font-size: 0.83rem;">{{ nama }}</span>
                          <span class="text-muted small" style="font-size: 0.72rem;">
                            {{ jbtn ? jbtn + ' • ' : '' }}NIP: {{ nik }}
                          </span>
                        </div>
                      </template>
                      <template #selected-option="{ nama, nik }">
                        <div class="text-truncate" style="font-size: 0.83rem;">
                          <span class="fw-semibold">{{ nama }}</span>
                          <span class="text-muted ms-1 small">({{ nik }})</span>
                        </div>
                      </template>
                      <template #no-options>
                        <div class="text-muted small p-2 text-center">Petugas tidak ditemukan</div>
                      </template>
                    </v-select>
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-calendar-day text-info"></i>
                      <span>Tanggal Tinjauan Berkala</span>
                    </label>
                    <input type="date" v-model="form.tgl_tinjauan" class="form-control form-control-clean" />
                  </div>

                  <div class="col-12 col-md-4">
                    <label class="form-label-clean">
                      <i class="fas fa-bars-progress text-warning"></i>
                      <span>Status Penanganan</span>
                    </label>
                    <select v-model="form.status_treatment" class="form-select form-select-clean">
                      <option value="open">Open (Baru Teridentifikasi)</option>
                      <option value="in_progress">In Progress (Mitigasi Berjalan)</option>
                      <option value="monitored">Monitored (Dipantau Berkala)</option>
                      <option value="closed">Closed (Terkendali Sepenuhnya)</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label-clean">
                      <i class="fas fa-comment-dots text-slate-500"></i>
                      <span>Analisa & Catatan Evaluasi Komite</span>
                    </label>
                    <textarea 
                      v-model="form.analisa_evaluasi" 
                      rows="2" 
                      class="form-control form-control-clean" 
                      placeholder="Catatan evaluasi efektivitas mitigasi, hambatan operasional, rekomendasi audit lanjutan..."
                    ></textarea>
                  </div>
                </div>
              </div>

            </div>

            <!-- Clean Modal Footer -->
            <div class="modal-footer bg-white border-top border-slate-100 py-3 px-4 d-flex align-items-center justify-content-between">
              <div class="small text-muted d-none d-sm-flex align-items-center gap-1.5">
                <i class="fas fa-shield-halved text-primary"></i>
                <span>Tersinkronisasi otomatis dengan Dashboard & Heatmap Risiko 5×5</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-light border border-slate-200 px-3 py-1.5 text-slate-700" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" class="btn btn-sm btn-primary px-4 py-1.5 shadow-sm fw-semibold" :disabled="isSaving">
                  <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                  <span class="ms-1.5">{{ isSaving ? 'Menyimpan...' : (isEditMode ? 'Perbarui Data Risiko' : 'Simpan Data Risiko') }}</span>
                </button>
              </div>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import * as XLSX from 'xlsx'
import manajemenRisikoService from '../../services/manajemenRisikoService'

const isLoading = ref(false)
const isSaving = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const modalRef = ref(null)
let bsModal = null

const items = ref([])
const periodes = ref([])
const departemens = ref([])
const klasifikasis = ref([])
const ruangLingkups = ref([])
const pegawais = ref([])

const filters = reactive({
  id_periode: '',
  kd_departemen: '',
  id_klasifikasi: '',
  level_awal: '',
  search: ''
})

const form = reactive({
  id_periode: '',
  kd_departemen: '',
  proses_kerja: '',
  sasaran: '',
  id_klasifikasi: '',
  id_ruang_lingkup: '',
  identifikasi_risiko: '',
  sumber_risiko: '',
  pengendalian_ada: '',
  dampak_awal: 3,
  frekuensi_awal: 3,
  rekom_avoid: '',
  rekom_mitigasi: '',
  rekom_segregasi: '',
  rekom_administrasi: '',
  rekom_retensi: '',
  rekom_transfer: '',
  dampak_sisa: 2,
  frekuensi_sisa: 2,
  risk_owner_nik: '',
  tgl_tinjauan: '',
  analisa_evaluasi: '',
  status_treatment: 'open'
})

const calcLevel = (score) => {
  if (score >= 15) return 'ekstrem'
  if (score >= 8) return 'tinggi'
  if (score >= 4) return 'sedang'
  return 'rendah'
}

// Dynamic computed properties for Scoring Cards
const calcScoreAwal = computed(() => Number(form.dampak_awal || 0) * Number(form.frekuensi_awal || 0))
const calcLevelAwal = computed(() => calcLevel(calcScoreAwal.value))

const calcScoreSisa = computed(() => Number(form.dampak_sisa || 0) * Number(form.frekuensi_sisa || 0))
const calcLevelSisa = computed(() => calcLevel(calcScoreSisa.value))

const scoreReduction = computed(() => calcScoreAwal.value - calcScoreSisa.value)
const scoreReductionPercent = computed(() => {
  if (!calcScoreAwal.value) return 0
  return Math.round(((calcScoreAwal.value - calcScoreSisa.value) / calcScoreAwal.value) * 100)
})

const getScoreCardClass = (level) => {
  switch (level) {
    case 'ekstrem': return 'score-card-ekstrem'
    case 'tinggi': return 'score-card-tinggi'
    case 'sedang': return 'score-card-sedang'
    default: return 'score-card-rendah'
  }
}

const getScoreBadgeClass = (level) => {
  switch (level) {
    case 'ekstrem': return 'badge-pill-ekstrem'
    case 'tinggi': return 'badge-pill-tinggi'
    case 'sedang': return 'badge-pill-sedang'
    default: return 'badge-pill-rendah'
  }
}

const getActionAdvice = (level) => {
  switch (level) {
    case 'ekstrem': return 'Eskalasi prioritas tinggi ke Direksi & Komite PMKP'
    case 'tinggi': return 'Tindakan perbaikan terencana oleh unit kerja'
    case 'sedang': return 'Kendali & monitoring berkala oleh Kepala Unit'
    default: return 'Pengendalian rutin dengan SPO yang berlaku'
  }
}

const petugasOptions = computed(() => {
  return (pegawais.value || []).map(p => ({
    nik: p.nik,
    nama: p.nama,
    jbtn: p.jbtn || '',
    label: p.jbtn ? `${p.nama} (${p.nik}) - ${p.jbtn}` : `${p.nama} (${p.nik})`
  }))
})

const getLevelBadgeClass = (lvl) => {
  const map = {
    ekstrem: 'bg-danger text-white',
    tinggi: 'bg-warning text-dark',
    sedang: 'bg-success text-white',
    rendah: 'bg-info text-white'
  }
  return map[lvl] || 'bg-secondary text-white'
}

const countByLevel = (lvl) => {
  return items.value.filter(i => i.level_awal === lvl).length
}

const formatDate = (val) => {
  if (!val) return '-'
  return new Date(val).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fetchMetadata = async () => {
  try {
    const res = await manajemenRisikoService.getMeta()
    if (res.data?.success) {
      const d = res.data.data
      periodes.value = d.periodes || []
      departemens.value = d.departemens || []
      klasifikasis.value = d.klasifikasis || []
      ruangLingkups.value = d.ruang_lingkups || []
      pegawais.value = d.pegawais || []

      const activeP = periodes.value.find(p => p.status === 'aktif') || periodes.value[0]
      if (activeP && !filters.id_periode) {
        filters.id_periode = activeP.id_periode
        form.id_periode = activeP.id_periode
      }
    }
  } catch (err) {
    console.error('Failed to load metadata', err)
  }
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const params = {
      id_periode: filters.id_periode || undefined,
      kd_departemen: filters.kd_departemen || undefined,
      id_klasifikasi: filters.id_klasifikasi || undefined,
      level_awal: filters.level_awal || undefined,
      search: filters.search || undefined
    }
    const res = await manajemenRisikoService.getAll(params)
    if (res.data?.success) {
      items.value = res.data.data || []
    }
  } catch (err) {
    console.error('Failed to load risk register', err)
  } finally {
    isLoading.value = false
  }
}

let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchData()
  }, 350)
}

const resetForm = () => {
  form.kd_departemen = ''
  form.proses_kerja = ''
  form.sasaran = ''
  form.id_klasifikasi = ''
  form.id_ruang_lingkup = ''
  form.identifikasi_risiko = ''
  form.sumber_risiko = ''
  form.pengendalian_ada = ''
  form.dampak_awal = 3
  form.frekuensi_awal = 3
  form.rekom_avoid = ''
  form.rekom_mitigasi = ''
  form.rekom_segregasi = ''
  form.rekom_administrasi = ''
  form.rekom_retensi = ''
  form.rekom_transfer = ''
  form.dampak_sisa = 2
  form.frekuensi_sisa = 2
  form.risk_owner_nik = ''
  form.tgl_tinjauan = ''
  form.analisa_evaluasi = ''
  form.status_treatment = 'open'
}

const openModalCreate = () => {
  isEditMode.value = false
  editId.value = null
  resetForm()
  if (bsModal) bsModal.show()
}

const openModalEdit = (item) => {
  isEditMode.value = true
  editId.value = item.id_risiko
  
  form.id_periode = item.id_periode
  form.kd_departemen = item.kd_departemen
  form.proses_kerja = item.proses_kerja
  form.sasaran = item.sasaran
  form.id_klasifikasi = item.id_klasifikasi
  form.id_ruang_lingkup = item.id_ruang_lingkup
  form.identifikasi_risiko = item.identifikasi_risiko
  form.sumber_risiko = item.sumber_risiko
  form.pengendalian_ada = item.pengendalian_ada
  form.dampak_awal = item.dampak_awal
  form.frekuensi_awal = item.frekuensi_awal
  form.rekom_avoid = item.rekom_avoid || ''
  form.rekom_mitigasi = item.rekom_mitigasi || ''
  form.rekom_segregasi = item.rekom_segregasi || ''
  form.rekom_administrasi = item.rekom_administrasi || ''
  form.rekom_retensi = item.rekom_retensi || ''
  form.rekom_transfer = item.rekom_transfer || ''
  form.dampak_sisa = item.dampak_sisa
  form.frekuensi_sisa = item.frekuensi_sisa
  form.risk_owner_nik = item.risk_owner_nik || ''
  form.tgl_tinjauan = item.tgl_tinjauan ? item.tgl_tinjauan.substring(0, 10) : ''
  form.analisa_evaluasi = item.analisa_evaluasi || ''
  form.status_treatment = item.status_treatment || 'open'

  if (bsModal) bsModal.show()
}

const saveForm = async () => {
  if (!form.kd_departemen) {
    alert('Silakan pilih Nama Unit / Ruang terlebih dahulu.')
    return
  }
  isSaving.value = true
  try {
    if (isEditMode.value) {
      await manajemenRisikoService.update(editId.value, form)
    } else {
      await manajemenRisikoService.create(form)
    }
    if (bsModal) bsModal.hide()
    await fetchData()
  } catch (err) {
    alert('Gagal menyimpan data risiko: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Hapus identifikasi risiko "${item.identifikasi_risiko}"?`)) return
  try {
    await manajemenRisikoService.delete(item.id_risiko)
    await fetchData()
  } catch (err) {
    alert('Gagal menghapus data: ' + (err.response?.data?.message || err.message))
  }
}

const exportToExcel = () => {
  if (!items.value.length) return

  const rows = items.value.map((r, i) => ({
    'No': i + 1,
    'Nama Unit/Ruang': r.departemen?.nama || r.kd_departemen,
    'Proses Kerja': r.proses_kerja,
    'Sasaran': r.sasaran,
    'Klasifikasi Risiko': r.klasifikasi?.nama_klasifikasi,
    'Ruang Lingkup': r.ruang_lingkup?.nama_ruang_lingkup,
    'Identifikasi Risiko': r.identifikasi_risiko,
    'Sumber Risiko': r.sumber_risiko,
    'Pengendalian yang Sudah Ada': r.pengendalian_ada,
    'D Awal': r.dampak_awal,
    'F Awal': r.frekuensi_awal,
    'R Awal (Skor)': r.skor_awal,
    'Level Awal': r.level_awal.toUpperCase(),
    'Avoid': r.rekom_avoid || '',
    'Mitigasi': r.rekom_mitigasi || '',
    'Segregasi': r.rekom_segregasi || '',
    'Administratif': r.rekom_administrasi || '',
    'Retensi': r.rekom_retensi || '',
    'Transfer': r.rekom_transfer || '',
    'D Sisa': r.dampak_sisa,
    'F Sisa': r.frekuensi_sisa,
    'R Sisa (Skor)': r.skor_sisa,
    'Level Sisa': r.level_sisa.toUpperCase(),
    'Pemilik Risiko': r.risk_owner?.nama || '',
    'Tanggal Tinjauan': r.tgl_tinjauan ? r.tgl_tinjauan.substring(0, 10) : '',
    'Analisa dan Evaluasi': r.analisa_evaluasi || '',
    'Status Treatment': r.status_treatment || ''
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Risiko')
  XLSX.writeFile(wb, `DAFTAR_RISIKO_${new Date().toISOString().substring(0, 10)}.xlsx`)
}

onMounted(async () => {
  if (modalRef.value) {
    bsModal = new Modal(modalRef.value)
  }
  await fetchMetadata()
  await fetchData()
})
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.page-title {
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.custom-risk-table th, .custom-risk-table td {
  vertical-align: middle;
  padding: 8px 10px;
}

.card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  color: #1e293b !important;
  padding: 0.85rem 1.15rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  text-align: left !important;
}

/* Modern Clean Modal Design */
.modal-content-clean {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 3.5rem);
}

.modal-dialog-scrollable .modal-content-clean .modal-body {
  overflow-y: auto !important;
  max-height: calc(90vh - 140px);
}

.modal-dialog-scrollable .modal-content-clean .modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-dialog-scrollable .modal-content-clean .modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-dialog-scrollable .modal-content-clean .modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.modal-dialog-scrollable .modal-content-clean .modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.modal-icon-indicator {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.form-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem 1.35rem;
  margin-bottom: 1.15rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-section-card:focus-within {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #f1f5f9;
}

.section-badge-num {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.section-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1px;
}

.section-desc {
  font-size: 0.72rem;
  color: #64748b;
}

.form-label-clean {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.form-control-clean,
.form-select-clean {
  font-size: 0.83rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.48rem 0.75rem;
  background-color: #ffffff;
  color: #1e293b;
  transition: all 0.15s ease;
}

.form-control-clean:focus,
.form-select-clean:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

/* Searchable v-select clean styling */
.v-select-clean :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border-color: #cbd5e1;
  padding: 0.2rem 0.5rem;
  background-color: #ffffff;
  min-height: 38px;
}

.v-select-clean :deep(.vs__dropdown-toggle):focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.v-select-clean :deep(.vs__dropdown-menu) {
  z-index: 1065 !important;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.v-select-clean :deep(.vs__search) {
  font-size: 0.83rem;
}

/* Filter bar v-select styling to match form-select-sm */
.v-select-filter :deep(.vs__dropdown-toggle) {
  border-radius: 0.375rem;
  border-color: #cbd5e1;
  padding: 0 0.35rem;
  min-height: 31px;
  background-color: #ffffff;
}

.v-select-filter :deep(.vs__selected) {
  font-size: 0.8125rem;
  margin: 2px 2px 0 0;
  padding: 0;
  color: #1e293b;
}

.v-select-filter :deep(.vs__search) {
  font-size: 0.8125rem;
  margin: 2px 0 0 0;
  padding: 0;
}

.v-select-filter :deep(.vs__dropdown-menu) {
  z-index: 1050 !important;
  font-size: 0.82rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

/* Grouped Sub-panels */
.sub-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.sub-panel-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modern Score Summary Card */
.score-summary-card {
  height: 100%;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid;
  transition: all 0.2s ease;
}

.score-card-ekstrem {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.score-card-tinggi {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.score-card-sedang {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.score-card-rendah {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.score-val-big {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  margin: 0.25rem 0;
}

.badge-pill-ekstrem {
  background: #dc2626;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.badge-pill-tinggi {
  background: #d97706;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.badge-pill-sedang {
  background: #059669;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.badge-pill-rendah {
  background: #0284c7;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}
</style>
