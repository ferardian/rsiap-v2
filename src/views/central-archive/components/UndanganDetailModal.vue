<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-calendar-check text-blue-600"></i>
          Detail Undangan & Pertemuan
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="data">
        <!-- Unified Hero Header -->
        <div class="detail-hero">
          <div class="hero-date-card">
            <div class="card-header">{{ formatMonth(data.tanggal) }}</div>
            <div class="card-body">
              <span class="day">{{ formatDay(data.tanggal) }}</span>
              <span class="year">{{ formatYear(data.tanggal) }}</span>
            </div>
          </div>
          <div class="hero-main">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="tipe-badge" :class="getTypeClass(data.tipe)">{{ data.tipe || 'Umum' }}</span>
              <span class="time-stamp"><i class="far fa-clock mr-1"></i> {{ formatTime(data.tanggal) }}</span>
              <span class="meeting-status-badge" :class="getMeetingStatusClass(data.tanggal)">
                {{ getMeetingStatusLabel(data.tanggal) }}
              </span>
            </div>
            <div class="perihal-title">{{ data.perihal }}</div>
            <div class="text-xs text-slate-500 font-mono mt-1" v-if="data.no_surat || data.surat?.no_surat">
              <i class="fas fa-file-alt mr-1 text-slate-400"></i> No. Surat: {{ data.no_surat || data.surat?.no_surat }}
            </div>
          </div>
        </div>

        <!-- 2-Column Responsive Dashboard Body -->
        <div class="detail-grid-layout">
          <!-- LEFT COLUMN: Lokasi, PJ, Deskripsi, Quick Actions -->
          <div class="detail-col-left">
            <div class="info-tiles-grid">
              <div class="info-tile" v-if="data.lokasi">
                <div class="tile-icon text-rose-500"><i class="fas fa-map-marker-alt"></i></div>
                <div class="tile-content">
                  <span class="tile-label">Lokasi Pertemuan</span>
                  <span class="tile-value">{{ data.lokasi }}</span>
                </div>
              </div>

              <div class="info-tile" v-if="data.pj">
                <div class="tile-icon text-blue-500"><i class="fas fa-user-circle"></i></div>
                <div class="tile-content">
                  <span class="tile-label">Penanggung Jawab</span>
                  <span class="tile-value">{{ (data.penanggungJawab || data.penanggung_jawab)?.nama || data.pj }}</span>
                  <span class="tile-sub" v-if="(data.penanggungJawab || data.penanggung_jawab)?.nik">NIK. {{ (data.penanggungJawab || data.penanggung_jawab).nik }}</span>
                </div>
              </div>
            </div>

            <!-- Deskripsi / Agenda Section -->
            <div class="agenda-box" v-if="data.deskripsi || data.catatan">
              <div class="agenda-label"><i class="fas fa-align-left text-slate-400 mr-1.5"></i> Deskripsi & Agenda</div>
              <div class="agenda-text">{{ data.deskripsi || data.catatan }}</div>
            </div>

            <!-- Quick Actions Section (4 card cantik 2x2) -->
            <div class="quick-actions-section">
              <div class="label mb-2.5"><i class="fas fa-folder-open text-slate-400 mr-1"></i> Dokumen & Tindak Lanjut</div>
              <div class="action-grid-2x2">
                <button @click="showNotulenDetail" class="action-card btn-link-action">
                  <i class="fas fa-clipboard-list text-primary"></i>
                  <div class="action-info">
                    <span class="action-name">E-Notulen Rapat</span>
                    <span class="action-desc">{{ notulenData ? 'Lihat / Edit Hasil' : 'Tulis Notulensi' }}</span>
                  </div>
                </button>

                <button @click="openTindakLanjutModal" class="action-card btn-link-action">
                  <i class="fas fa-tasks text-emerald-600"></i>
                  <div class="action-info">
                    <span class="action-name">Tindak Lanjut & Program</span>
                    <span class="action-desc">
                      {{ publishedPrograms.length > 0 ? `${publishedPrograms.length} Program • ` : '' }}
                      {{ tindakLanjutList.length > 0 ? `${tindakLanjutCompletedCount}/${tindakLanjutList.length} Selesai` : 'Action Items & Timeline' }}
                    </span>
                  </div>
                </button>

                <button @click="handleDownload('undangan')" class="action-card btn-link-action" :disabled="downloading === 'undangan'">
                  <i class="fas fa-file-pdf text-danger"></i>
                  <div class="action-info">
                    <span class="action-name">Download Undangan</span>
                    <span class="action-desc">{{ downloading === 'undangan' ? 'Mengunduh...' : 'Format PDF Resmi' }}</span>
                  </div>
                </button>

                <button @click="handleDownload('proof')" class="action-card btn-link-action" :disabled="downloading === 'proof'">
                  <i class="fas fa-id-badge text-success"></i>
                  <div class="action-info">
                    <span class="action-name">Bukti Kehadiran</span>
                    <span class="action-desc">{{ downloading === 'proof' ? 'Mengunduh...' : 'Presensi & Pengesahan' }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Akses QR & Daftar Peserta Kehadiran -->
          <div class="detail-col-right">
            <!-- QR Access Banner -->
            <div class="qr-compact-card" v-if="data.id">
              <div class="qr-thumb-wrap" @click="openQrDetail" title="Ketuk untuk memperbesar">
                <div v-if="qrLoading" class="qr-loading-compact">
                  <div class="mini-spinner-xs"></div>
                </div>
                <img v-else-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="qr-thumb">
                <div v-else class="qr-thumb-failed" @click.stop="fetchQrData">
                  <i class="fas fa-sync-alt"></i>
                </div>
              </div>
              <div class="qr-compact-info">
                <span class="qr-title"><i class="fas fa-qrcode mr-1 text-slate-500"></i> QR Akses Kehadiran</span>
                <span class="qr-desc">Peserta scan melalui aplikasi mobile</span>
                <button class="btn-qr-zoom" @click="openQrDetail">
                  <i class="fas fa-expand-arrows-alt mr-1"></i> Perbesar QR
                </button>
              </div>
            </div>

            <!-- Recipients & Attendance Card with Internal Scroll -->
            <div class="recipients-card">
              <div class="recipients-card-header">
                <div class="recipients-header-title">
                  <i class="fas fa-users text-blue-600 mr-1.5"></i>
                  <span>Peserta & Kehadiran</span>
                  <span class="attendance-summary-badge" v-if="recipients.length > 0">
                    {{ attendanceCount }}/{{ recipients.length }} Hadir
                  </span>
                </div>
                <button @click="toggleEditRecipients" class="btn-edit-recipients">
                  <i :class="isEditingRecipients ? 'fas fa-times' : 'fas fa-plus-circle'"></i>
                  {{ isEditingRecipients ? 'Batal' : 'Kelola' }}
                </button>
              </div>

              <!-- Content with Search & List -->
              <div class="recipients-card-body">
                <div v-if="isEditingRecipients" class="recipient-search-box mb-2">
                  <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input 
                      type="text" 
                      v-model="empSearch" 
                      placeholder="Cari nama karyawan / NIK..." 
                      @input="handleEmpSearch"
                    >
                  </div>
                  <div v-if="empResults.length > 0" class="search-results-dropdown">
                    <div 
                      v-for="emp in empResults" 
                      :key="emp.nik" 
                      class="search-result-item"
                      @click="addRecipient(emp)"
                    >
                      <div class="emp-info">
                        <span class="emp-name">{{ emp.nama }}</span>
                        <span class="emp-nik">NIK. {{ emp.nik }}</span>
                      </div>
                      <i class="fas fa-plus-circle"></i>
                    </div>
                  </div>
                </div>

                <div v-if="loadingRecipients" class="recipients-loading py-6">
                  <div class="mini-spinner"></div>
                  <span>Memuat daftar peserta & presensi...</span>
                </div>

                <div v-else-if="recipients.length > 0" class="recipients-scroll-list" :class="{ 'editing': isEditingRecipients }">
                  <div 
                    v-for="res in recipients" 
                    :key="res.nik" 
                    class="recipient-tag"
                    :class="{ 'is-attended': attendanceList[res.nik] }"
                  >
                    <div class="recipient-info">
                      <span class="name">{{ res.nama }}</span>
                      <span class="nik">{{ res.nik }}</span>
                    </div>

                    <!-- Attendance Action -->
                    <div v-if="!isEditingRecipients" class="attendance-action-box">
                      <span v-if="attendanceList[res.nik]" class="badge-hadir" title="Presensi terkonfirmasi">
                        <i class="fas fa-check-circle"></i> Hadir
                      </span>
                      <button 
                        v-else 
                        class="btn-hadirkan" 
                        @click="handleMarkAttendance(res)" 
                        :disabled="markingNik === res.nik" 
                        title="Tandai Hadir Manual jika peserta lupa scan"
                      >
                        <i class="fas fa-user-check" v-if="markingNik !== res.nik"></i>
                        <span class="mini-spinner-xs" v-else></span>
                        <span>Hadirkan</span>
                      </button>
                    </div>

                    <button v-if="isEditingRecipients" @click="removeRecipient(res.nik)" class="btn-remove">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div v-else class="recipients-empty py-6">
                  <i class="fas fa-user-slash"></i>
                  <span>Belum ada peserta terdaftar</span>
                </div>

                <div v-if="isEditingRecipients && hasRecipientsChanges" class="mt-2">
                  <button @click="saveRecipients" class="btn-save-recipients" :disabled="savingRecipients">
                    <i class="fas fa-save mr-2" v-if="!savingRecipients"></i>
                    <div class="mini-spinner mr-2" v-else></div>
                    {{ savingRecipients ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-text" @click="$emit('close')">Tutup</button>
      </div>

      <!-- Fullscreen QR Overlay -->
      <div v-if="showQrFull" class="qr-full-overlay" @click="showQrFull = false">
        <div class="qr-full-container" @click.stop>
          <div class="qr-full-header">
            <span>QR Kehadiran</span>
            <button @click="showQrFull = false"><i class="fas fa-times"></i></button>
          </div>
          <img :src="qrCodeUrl" alt="QR Full" class="qr-large-image">
          <p class="qr-full-hint">Arahkan kamera scanner ke kode di atas</p>
        </div>
      </div>

      <!-- Nested Notulen Modal & Editor -->
      <div v-if="showNotulen" class="notulen-overlay" @click="closeNotulenModal">
        <div class="notulen-content" @click.stop>
          <div class="notulen-header">
            <div class="notulen-title-wrap">
              <i class="fas fa-file-signature text-blue-600 mr-2"></i>
              <span class="notulen-title-text">{{ isEditingNotulen ? 'Editor Notulensi Rapat' : 'E-Notulen Pertemuan' }}</span>
            </div>
            <div class="notulen-header-actions">
              <button 
                v-if="!isEditingNotulen && notulenData" 
                class="btn-switch-edit" 
                @click="startEditNotulen"
              >
                <i class="fas fa-pencil-alt mr-1"></i> Edit
              </button>
              <button class="btn-close-notulen" @click="closeNotulenModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div class="notulen-body text-center py-10" v-if="loadingNotulen">
            <div class="mini-spinner mx-auto mb-3"></div>
            <p class="text-sm text-slate-500 font-medium">Memuat data notulen...</p>
          </div>

          <!-- EDIT / WRITE FORM MODE -->
          <div class="notulen-body edit-mode" v-else-if="isEditingNotulen">
            <!-- Notulis Selection -->
            <div class="notulen-form-group mb-3">
              <label class="form-sublabel">
                <i class="fas fa-user-edit mr-1"></i> Notulis / Pencatat Rapat <span class="text-rose-500">*</span>
              </label>
              
              <div v-if="notulenForm.notulis_nik" class="selected-notulis-card">
                <div class="notulis-avatar-circle">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="notulis-detail">
                  <span class="notulis-name">{{ notulenForm.notulis_nama }}</span>
                  <span class="notulis-nik">NIK. {{ notulenForm.notulis_nik }}</span>
                </div>
                <button type="button" class="btn-change-notulis" @click="clearNotulis" title="Ganti Notulis">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div v-else class="notulis-picker-wrap">
                <div class="search-input-wrapper">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    v-model="notulisSearch" 
                    placeholder="Cari nama karyawan untuk dijadikan notulis..." 
                    @input="handleNotulisSearch"
                  >
                </div>
                <div v-if="notulisResults.length > 0" class="search-results-dropdown">
                  <div 
                    v-for="emp in notulisResults" 
                    :key="emp.nik" 
                    class="search-result-item"
                    @click="selectNotulis(emp)"
                  >
                    <div class="emp-info">
                      <span class="emp-name">{{ emp.nama }}</span>
                      <span class="emp-nik">NIK. {{ emp.nik }} - {{ emp.jbtn || '' }}</span>
                    </div>
                    <i class="fas fa-plus-circle text-blue-600"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pembahasan & Kesimpulan -->
            <div class="notulen-form-group mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-sublabel">
                  <i class="fas fa-align-left mr-1"></i> Isi Pembahasan & Hasil Keputusan <span class="text-rose-500">*</span>
                </label>
                <button type="button" class="btn-template-helper" @click="applyStandardTemplate" title="Isi struktur template rapat standar">
                  <i class="fas fa-magic mr-1"></i> Template Standar
                </button>
              </div>
              <div class="quill-wrapper notulen-editor-wrapper">
                <QuillEditor 
                  theme="snow" 
                  content-type="html" 
                  v-model:content="notulenForm.pembahasan" 
                  :options="notulenEditorOptions"
                />
              </div>
            </div>

            <!-- Status Publikasi -->
            <div class="notulen-form-group mb-4">
              <label class="form-sublabel"><i class="fas fa-tag mr-1"></i> Status Dokumen</label>
              <div class="status-choice-group">
                <label class="status-choice-label" :class="{ 'active': notulenForm.status === 1 }">
                  <input type="radio" v-model="notulenForm.status" :value="1">
                  <span><i class="fas fa-check-circle text-success mr-1"></i> Terbit / Final</span>
                </label>
                <label class="status-choice-label" :class="{ 'active': notulenForm.status === 0 }">
                  <input type="radio" v-model="notulenForm.status" :value="0">
                  <span><i class="fas fa-pencil-ruler text-warning mr-1"></i> Draf Sementara</span>
                </label>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="notulen-edit-actions">
              <button type="button" class="btn-cancel-edit" @click="cancelEditNotulen" :disabled="savingNotulen">
                Batal
              </button>
              <button type="button" class="btn-save-notulen" @click="handleSaveNotulen" :disabled="savingNotulen">
                <span class="mini-spinner mr-2" v-if="savingNotulen"></span>
                <i class="fas fa-save mr-2" v-else></i>
                {{ savingNotulen ? 'Menyimpan...' : 'Simpan Notulensi' }}
              </button>
            </div>
          </div>

          <!-- PREVIEW / READ MODE -->
          <div class="notulen-body preview-mode" v-else-if="notulenData">
            <div class="notulen-meta-card mb-3">
              <div class="meta-item">
                <span class="meta-label">Notulis</span>
                <span class="meta-val">{{ notulenData.notulis?.nama || notulenData.notulis_nik || '-' }}</span>
                <span class="meta-sub" v-if="notulenData.notulis?.jbtn">{{ notulenData.notulis.jbtn }}</span>
              </div>
              <div class="meta-item text-right">
                <span class="meta-label">Status Dokumen</span>
                <span class="badge-notulen-status" :class="notulenData.status === 1 ? 'status-published' : 'status-draft'">
                  {{ notulenData.status === 1 ? '✓ Diterbitkan' : 'Draf' }}
                </span>
                <span class="meta-sub" v-if="notulenData.updated_at">
                  Update: {{ notulenData.updated_at }}
                </span>
              </div>
            </div>

            <div class="notulen-content-box mb-4">
              <div class="box-title"><i class="fas fa-book-open mr-2 text-blue-600"></i> Resume Pembahasan & Keputusan</div>
              <div class="rich-content ql-editor" v-html="renderRichContent(notulenData.pembahasan)"></div>
            </div>

            <div class="notulen-footer-actions">
              <button class="btn-edit-notulen-secondary" @click="startEditNotulen">
                <i class="fas fa-pencil-alt mr-2"></i> Perbarui Notulensi
              </button>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div class="notulen-body empty-state text-center py-10" v-else>
            <div class="empty-icon-circle mx-auto mb-3">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h5 class="font-bold text-slate-800 mb-1">Belum Ada Notulensi</h5>
            <p class="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              Notulensi rapat belum dicatat untuk pertemuan ini. Silakan mulai tulis ringkasan pembahasan sekarang.
            </p>
            <button class="btn-start-notulen" @click="startEditNotulen">
              <i class="fas fa-plus-circle mr-2"></i> Mulai Tulis Notulensi
            </button>
          </div>
        </div>
      </div>

      <!-- Nested Tindak Lanjut (Action Items) Modal & Manager -->
      <div v-if="showTindakLanjut" class="notulen-overlay" @click="closeTindakLanjutModal">
        <div class="notulen-content tindak-lanjut-dialog" @click.stop>
          <div class="notulen-header">
            <div class="notulen-title-wrap">
              <i class="fas fa-tasks text-emerald-600 mr-2 text-lg"></i>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="notulen-title-text">Tindak Lanjut & Action Items</span>
                  <a 
                    v-if="publishedPrograms.length > 0"
                    href="javascript:void(0)"
                    @click="goToTimelineProgram(publishedPrograms[0].id)"
                    class="timeline-link-pill"
                    title="Buka target program ini di Timeline"
                  >
                    <i class="fas fa-stream text-indigo-500 me-1"></i>
                    Timeline: {{ publishedPrograms[0].kode_program }} ↗
                  </a>
                </div>
                <div class="text-xs text-slate-500 font-medium" v-if="data.perihal">
                  {{ data.perihal }}
                </div>
              </div>
            </div>
            <div class="notulen-header-actions">
              <button 
                type="button"
                v-if="!showTaskForm" 
                class="btn-header-add-task" 
                @click="initNewTask"
              >
                <i class="fas fa-plus"></i> Tambah Tugas
              </button>
              <button type="button" class="btn-close-notulen" @click="closeTindakLanjutModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div class="notulen-body text-center py-10" v-if="loadingTindakLanjut">
            <div class="mini-spinner mx-auto mb-3"></div>
            <p class="text-sm text-slate-500 font-medium">Memuat data tindak lanjut...</p>
          </div>

          <div class="notulen-body" v-else>
            <!-- Progress Banner -->
            <div class="task-progress-card mb-4" v-if="tindakLanjutList.length > 0">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Realisasi Tugas Rapat</span>
                <span class="text-xs font-extrabold text-emerald-700">
                  {{ tindakLanjutCompletedCount }} dari {{ tindakLanjutList.length }} Selesai ({{ tindakLanjutProgressPercent }}%)
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  class="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out" 
                  :style="{ width: tindakLanjutProgressPercent + '%' }"
                ></div>
              </div>
            </div>

            <!-- Form Tambah / Edit Tugas -->
            <div v-if="showTaskForm" class="task-form-card mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold text-slate-800 fs-xs">
                  <i class="fas fa-clipboard-check text-emerald-600 me-1.5"></i>
                  {{ editingTaskId ? 'Edit Tindak Lanjut' : 'Tugaskan Action Item Baru' }}
                </span>
                <button type="button" @click="cancelTaskForm" class="btn-cancel-task py-1 px-2.5 text-xs">
                  <i class="fas fa-times me-1"></i> Batal
                </button>
              </div>

              <!-- Deskripsi Tugas -->
              <div class="mb-3">
                <label class="form-sublabel">Uraian Tugas / Action Item <span class="text-rose-500">*</span></label>
                <div class="quill-wrapper task-editor-wrapper">
                  <QuillEditor 
                    theme="snow" 
                    content-type="html" 
                    v-model:content="taskForm.tugas" 
                    :options="taskEditorOptions"
                  />
                </div>
              </div>

              <!-- PIC & Deadline Grid -->
              <div class="row g-3 mb-3">
                <!-- PIC Selector -->
                <div class="col-md-6">
                  <label class="form-sublabel">Penanggung Jawab (PIC) <span class="text-rose-500">*</span></label>
                  <div v-if="taskForm.pic_nik" class="selected-pic-pill d-flex align-items-center justify-content-between p-2 bg-white border border-emerald-300 rounded-3">
                    <div class="fs-xs">
                      <div class="fw-bold text-slate-800">{{ taskForm.pic_nama }}</div>
                      <div class="text-slate-500 fs-xxs">NIK. {{ taskForm.pic_nik }}</div>
                    </div>
                    <button type="button" @click="clearPic" class="btn-clear-pic" title="Ganti PIC">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-else class="pic-search-wrapper position-relative">
                    <input 
                      type="text" 
                      v-model="picSearch" 
                      @input="handlePicSearch"
                      placeholder="Ketik nama atau pilih dari peserta..." 
                      class="task-input"
                    >
                    <!-- Quick Dropdown from attendees -->
                    <div v-if="recipients.length > 0 && !picSearch" class="mt-1.5 d-flex flex-wrap gap-1">
                      <button 
                        type="button" 
                        v-for="r in recipients.slice(0, 5)" 
                        :key="r.nik"
                        @click="selectPic(r)"
                        class="btn-attendee-quick-pick"
                      >
                        + {{ r.nama.split(' ')[0] }}
                      </button>
                    </div>
                    <div v-if="picResults.length > 0" class="search-results-dropdown">
                      <div 
                        v-for="emp in picResults" 
                        :key="emp.nik" 
                        @click="selectPic(emp)" 
                        class="search-result-item"
                      >
                        <div class="emp-info">
                          <span class="emp-name">{{ emp.nama }}</span>
                          <span class="emp-nik">NIK. {{ emp.nik }}</span>
                        </div>
                        <i class="fas fa-plus-circle text-emerald-600"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Deadline -->
                <div class="col-md-6">
                  <label class="form-sublabel">Tenggat Waktu (Deadline) <span class="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    v-model="taskForm.deadline" 
                    class="task-input"
                  >
                </div>
              </div>

              <!-- Status & Catatan Penyelesaian (If editing or completing) -->
              <div class="row g-3 mb-3" v-if="editingTaskId">
                <div class="col-md-6">
                  <label class="form-sublabel">Status Pengerjaan</label>
                  <select v-model="taskForm.status" class="task-input">
                    <option value="pending">⏳ Menunggu (Pending)</option>
                    <option value="in_progress">🚀 Sedang Dikerjakan</option>
                    <option value="completed">✅ Selesai</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-sublabel">Catatan Penyelesaian</label>
                  <input 
                    type="text" 
                    v-model="taskForm.catatan_penyelesaian" 
                    placeholder="Contoh: Dokumen SOP sudah diunggah..." 
                    class="task-input"
                  >
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-emerald-200">
                <button type="button" @click="cancelTaskForm" class="btn-cancel-task">
                  Batal
                </button>
                <button 
                  type="button"
                  @click="handleSaveTask" 
                  class="btn-save-task"
                  :disabled="savingTask"
                >
                  <i class="fas fa-save me-1" v-if="!savingTask"></i>
                  <span class="mini-spinner-xs me-1" v-else></span>
                  {{ savingTask ? 'Menyimpan...' : 'Simpan Action Item' }}
                </button>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="d-flex align-items-center justify-content-between mb-3" v-if="tindakLanjutList.length > 0">
              <div class="task-filter-bar">
                <button 
                  type="button"
                  class="tab-filter-btn"
                  :class="{ 'active': taskFilter === 'all' }"
                  @click="taskFilter = 'all'"
                >
                  Semua ({{ tindakLanjutList.length }})
                </button>
                <button 
                  type="button"
                  class="tab-filter-btn"
                  :class="{ 'active': taskFilter === 'pending' }"
                  @click="taskFilter = 'pending'"
                >
                  Menunggu
                </button>
                <button 
                  type="button"
                  class="tab-filter-btn"
                  :class="{ 'active': taskFilter === 'in_progress' }"
                  @click="taskFilter = 'in_progress'"
                >
                  Dikerjakan
                </button>
                <button 
                  type="button"
                  class="tab-filter-btn"
                  :class="{ 'active': taskFilter === 'completed' }"
                  @click="taskFilter = 'completed'"
                >
                  Selesai
                </button>
              </div>

              <button 
                type="button"
                v-if="!showTaskForm" 
                class="btn-add-task-inline"
                @click="initNewTask"
              >
                <i class="fas fa-plus-circle"></i> Tambah Tugas
              </button>
            </div>

            <!-- List of Action Items -->
            <div v-if="filteredTasks.length > 0" class="task-list space-y-2.5">
              <div 
                v-for="task in filteredTasks" 
                :key="task.id" 
                class="task-card p-3 rounded-xl border transition-all"
                :class="task.status === 'completed' ? 'bg-slate-50 border-slate-200 opacity-90' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'"
              >
                <div class="d-flex items-start justify-content-between gap-3">
                  <div class="d-flex items-start gap-2.5 flex-grow-1">
                    <!-- Quick Toggle Checkbox -->
                    <button 
                      type="button"
                      class="btn-task-checkbox"
                      :class="{ 'checked': task.status === 'completed' }"
                      @click="toggleTaskComplete(task)"
                      title="Klik untuk tandai selesai / buka kembali"
                    >
                      <i class="fas fa-check"></i>
                    </button>

                    <div class="flex-grow-1">
                      <div 
                        class="text-sm font-medium text-slate-800 leading-snug task-rich-desc"
                        :class="{ 'line-through text-slate-400': task.status === 'completed' }"
                        v-html="renderRichContent(task.tugas)"
                      ></div>

                      <!-- Sub info: PIC & Deadline -->
                      <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
                        <div class="task-pic-pill text-[11px] text-slate-700 font-semibold d-flex align-items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                          <i class="fas fa-user-circle text-slate-500"></i>
                          <span>{{ task.pic?.nama || task.pic_nik }}</span>
                        </div>

                        <div 
                          class="task-deadline-pill text-[11px] font-semibold d-flex align-items-center gap-1 px-2 py-0.5 rounded-md"
                          :class="getDeadlineClass(task.deadline, task.status)"
                        >
                          <i class="far fa-clock"></i>
                          <span>{{ formatTaskDeadline(task.deadline) }}</span>
                        </div>

                        <span 
                          class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md"
                          :class="getStatusBadgeClass(task.status)"
                        >
                          {{ getStatusLabel(task.status) }}
                        </span>
                      </div>

                      <!-- Catatan Penyelesaian if any -->
                      <div v-if="task.catatan_penyelesaian" class="mt-2 text-xs bg-emerald-50/60 text-emerald-800 p-2 rounded-lg border border-emerald-100">
                        <i class="fas fa-info-circle mr-1 text-emerald-600"></i>
                        <span>{{ task.catatan_penyelesaian }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions (Edit & Delete) -->
                  <div class="d-flex align-items-center gap-1">
                    <button 
                      type="button"
                      class="btn-task-action edit"
                      @click="startEditTask(task)"
                      title="Edit Tugas"
                    >
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button 
                      type="button"
                      class="btn-task-action delete"
                      @click="handleDeleteTask(task)"
                      title="Hapus Tugas"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty filtered state -->
            <div v-else-if="tindakLanjutList.length > 0" class="text-center py-8">
              <i class="fas fa-filter text-slate-300 text-3xl mb-2"></i>
              <p class="text-xs text-slate-500">Tidak ada tugas dengan status ini.</p>
            </div>

            <!-- Empty State (No action items yet) -->
            <div v-else-if="!showTaskForm" class="text-center py-10">
              <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl d-flex align-items-center justify-content-center mx-auto mb-3 text-2xl shadow-sm">
                <i class="fas fa-tasks"></i>
              </div>
              <h5 class="fw-bold text-slate-800 fs-sm mb-1">Belum Ada Action Items</h5>
              <p class="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
                Buat daftar tugas dan tindak lanjut dari hasil pertemuan ini agar PIC terpantau dan keputusan rapat terealisasi.
              </p>
              <button 
                type="button"
                class="btn-create-first-task"
                @click="initNewTask"
              >
                <i class="fas fa-plus"></i> Buat Tindak Lanjut Pertama
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isPast as checkPast } from 'date-fns'
import { undanganService } from '@/services/undanganService'
import timelineService from '@/services/timelineService'
import { useToast } from 'vue-toastification'
import { QuillEditor } from '@vueup/vue-quill'

// Rich Text Editor Configurations & Helpers
const notulenEditorOptions = {
  theme: 'snow',
  placeholder: 'Tuliskan poin pembahasan, jalannya pertemuan, dan hasil keputusan rapat...',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote'],
      ['clean']
    ]
  }
}

const taskEditorOptions = {
  theme: 'snow',
  placeholder: 'Contoh: Menyiapkan draft SOP integrasi API sebelum sosialisasi unit...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  }
}

const isQuillEmpty = (html) => {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return stripped.length === 0
}

const renderRichContent = (content) => {
  if (!content) return ''
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content
  }
  return content.replace(/\n/g, '<br>')
}

const router = useRouter()
const props = defineProps({
  show: { type: Boolean, default: false },
  data: { type: Object, default: () => null }
})

const emit = defineEmits(['close'])
const toast = useToast()

// States
const qrCodeUrl = ref('')
const qrLoading = ref(false)
const downloading = ref(null)
// Notulen States
const showNotulen = ref(false)
const notulenData = ref(null)
const loadingNotulen = ref(false)
const isEditingNotulen = ref(false)
const savingNotulen = ref(false)
const notulisSearch = ref('')
const notulisResults = ref([])
const notulenForm = ref({
  notulis_nik: '',
  notulis_nama: '',
  pembahasan: '',
  status: 1
})
const showQrFull = ref(false)

// Recipients States
const recipients = ref([])
const originalRecipients = ref([])
const loadingRecipients = ref(false)
const isEditingRecipients = ref(false)
const savingRecipients = ref(false)
const empSearch = ref('')
const empResults = ref([])
const hasRecipientsChanges = ref(false)

// Attendance States
const attendanceList = ref({})
const markingNik = ref(null)
const attendanceCount = computed(() => Object.keys(attendanceList.value).length)

// Tindak Lanjut (Action Items) States
const showTindakLanjut = ref(false)
const tindakLanjutList = ref([])
const loadingTindakLanjut = ref(false)
const showTaskForm = ref(false)
const editingTaskId = ref(null)
const savingTask = ref(false)
const taskFilter = ref('all')
const picSearch = ref('')
const picResults = ref([])
const taskForm = ref({
  tugas: '',
  pic_nik: '',
  pic_nama: '',
  deadline: '',
  status: 'pending',
  catatan_penyelesaian: ''
})

const tindakLanjutCompletedCount = computed(() => {
  if (!Array.isArray(tindakLanjutList.value)) return 0
  return tindakLanjutList.value.filter(t => t && t.status === 'completed').length
})

const tindakLanjutProgressPercent = computed(() => {
  if (!Array.isArray(tindakLanjutList.value) || !tindakLanjutList.value.length) return 0
  return Math.round((tindakLanjutCompletedCount.value / tindakLanjutList.value.length) * 100)
})

const filteredTasks = computed(() => {
  if (!Array.isArray(tindakLanjutList.value)) return []
  if (taskFilter.value === 'all') return tindakLanjutList.value
  return tindakLanjutList.value.filter(t => t && t.status === taskFilter.value)
})

// Timeline Program Bridge States
const publishedPrograms = ref([])
const loadingPrograms = ref(false)
const showPublishProgram = ref(false)
const savingPublishedProgram = ref(false)
const selectedActionItemIds = ref([])
const programPicSearch = ref('')
const programPicResults = ref([])
const publishForm = ref({
  nama_program: '',
  kategori: 'IT & Digitalisasi',
  tahun: 2026,
  unit_pj: '',
  pic_utama: '',
  pic_nama: '',
  tanggal_mulai: '',
  target_selesai: '',
  deskripsi: ''
})

watch(() => props.show, (newVal) => {
  if (newVal && props.data) {
    tindakLanjutList.value = []
    publishedPrograms.value = []
    showPublishProgram.value = false
    fetchQrData()
    fetchRecipients()
    fetchAttendance()
    fetchTindakLanjut()
    fetchTimelinePrograms()
    notulenData.value = null
    showNotulen.value = false
    isEditingNotulen.value = false
    showQrFull.value = false
    isEditingRecipients.value = false
    empSearch.value = ''
    empResults.value = []
    notulisSearch.value = ''
    notulisResults.value = []
    showTindakLanjut.value = false
    showTaskForm.value = false
    editingTaskId.value = null
  }
})

const fetchAttendance = async () => {
  if (!props.data?.id) return
  try {
    const response = await undanganService.getAttendance(props.data.id)
    const map = {}
    if (Array.isArray(response.data?.data)) {
      response.data.data.forEach(item => {
        map[item.nik] = item
      })
    }
    attendanceList.value = map
  } catch (e) {
    console.error('Failed to fetch attendance:', e)
  }
}

const handleMarkAttendance = async (res) => {
  if (!props.data?.id || markingNik.value) return
  markingNik.value = res.nik
  try {
    await undanganService.markAttendance(props.data.id, [res.nik])
    attendanceList.value = {
      ...attendanceList.value,
      [res.nik]: { nik: res.nik, created_at: new Date() }
    }
    toast.success(`${res.nama} berhasil ditandai hadir!`)
  } catch (e) {
    console.error('Failed to mark attendance:', e)
    toast.error(e.response?.data?.message || 'Gagal menandai kehadiran')
  } finally {
    markingNik.value = null
  }
}

const fetchRecipients = async () => {
  if (!props.data?.id) return
  loadingRecipients.value = true
  try {
    const response = await undanganService.getRecipients(props.data.id)
    if (response.data?.data) {
      // Flatten or map the response data to get raw name and nik
      const rawData = response.data.data.map(item => ({
        nik: item.detail?.nik || item.penerima,
        nama: item.detail?.nama || 'Unknown'
      }))
      recipients.value = rawData
      originalRecipients.value = JSON.parse(JSON.stringify(rawData))
    }
  } catch (e) {
    console.error('Failed to fetch recipients:', e)
  } finally {
    loadingRecipients.value = false
    hasRecipientsChanges.value = false
  }
}

const fetchQrData = async () => {
  if (!props.data?.id) return
  qrLoading.value = true
  qrCodeUrl.value = ''
  try {
    const response = await undanganService.getQr(props.data.id)
    if (response.data?.data?.qr?.content) {
      const content = response.data.data.qr.content
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`
    }
  } catch (e) {
    console.error('Failed to fetch QR:', e)
  } finally {
    qrLoading.value = false
  }
}

const handleDownload = async (type) => {
  if (!props.data?.id) return
  downloading.value = type
  try {
    let response
    let filename = ''
    
    if (type === 'undangan') {
      response = await undanganService.download(props.data.id)
      filename = `Undangan - ${props.data.perihal || props.data.id}.pdf`
    } else {
      response = await undanganService.getProof(props.data.id)
      filename = `Bukti Kehadiran - ${props.data.perihal || props.data.id}.pdf`
    }

    // Sanitize filename (remove characters that might cause issues)
    filename = filename.replace(/[/\\?%*:|"<>]/g, '-')

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Download berhasil dimulai')
  } catch (e) {
    console.error('Download failed:', e)
    toast.error('Gagal mengunduh dokumen. Pastikan data tersedia.')
  } finally {
    downloading.value = null
  }
}

const showNotulenDetail = async () => {
  showNotulen.value = true
  if (notulenData.value) return
  
  loadingNotulen.value = true
  try {
    const base64Id = btoa(props.data.id.toString())
    const response = await undanganService.getNotulen(base64Id)
    if (response.data?.data?.notulen) {
      notulenData.value = response.data.data.notulen
    }
  } catch (e) {
    console.error('Failed to fetch notulen:', e)
  } finally {
    loadingNotulen.value = false
  }
}

const closeNotulenModal = () => {
  showNotulen.value = false
  isEditingNotulen.value = false
}

const startEditNotulen = () => {
  if (notulenData.value) {
    notulenForm.value = {
      notulis_nik: notulenData.value.notulis_nik || '',
      notulis_nama: notulenData.value.notulis?.nama || notulenData.value.notulis_nik || '',
      pembahasan: notulenData.value.pembahasan || '',
      status: notulenData.value.status ?? 1
    }
  } else {
    // Default notulis from PJ or first attendee if available
    notulenForm.value = {
      notulis_nik: '',
      notulis_nama: '',
      pembahasan: '',
      status: 1
    }
  }
  notulisSearch.value = ''
  notulisResults.value = []
  isEditingNotulen.value = true
}

const cancelEditNotulen = () => {
  isEditingNotulen.value = false
}

const applyStandardTemplate = () => {
  const template = `<h3>1. Pembukaan &amp; Pengantar</h3><p>Pertemuan dibuka oleh pimpinan rapat...</p><h3>2. Pembahasan Agenda &amp; Evaluasi</h3><ul><li>Poin pembahasan 1...</li><li>Poin pembahasan 2...</li></ul><h3>3. Kesimpulan &amp; Keputusan yang Disepakati</h3><ul><li>Keputusan 1...</li><li>Keputusan 2...</li></ul>`
  if (isQuillEmpty(notulenForm.value.pembahasan)) {
    notulenForm.value.pembahasan = template
  } else {
    notulenForm.value.pembahasan += `<br>${template}`
  }
}

const handleNotulisSearch = debounce(async () => {
  if (notulisSearch.value.length < 3) {
    notulisResults.value = []
    return
  }
  try {
    const response = await pegawaiService.searchPegawai(notulisSearch.value)
    if (response.data?.data) {
      notulisResults.value = response.data.data
    }
  } catch (e) {
    console.error('Failed to search notulis:', e)
  }
}, 300)

const selectNotulis = (emp) => {
  notulenForm.value.notulis_nik = emp.nik
  notulenForm.value.notulis_nama = emp.nama
  notulisSearch.value = ''
  notulisResults.value = []
}

const clearNotulis = () => {
  notulenForm.value.notulis_nik = ''
  notulenForm.value.notulis_nama = ''
}

const handleSaveNotulen = async () => {
  if (!notulenForm.value.notulis_nik) {
    toast.warning('Silakan pilih notulis rapat terlebih dahulu')
    return
  }
  if (isQuillEmpty(notulenForm.value.pembahasan)) {
    toast.warning('Isi pembahasan notulen tidak boleh kosong')
    return
  }

  savingNotulen.value = true
  try {
    const response = await undanganService.saveNotulen(props.data.id, {
      notulis_nik: notulenForm.value.notulis_nik,
      pembahasan: notulenForm.value.pembahasan,
      status: notulenForm.value.status
    })
    
    if (response.data?.data) {
      notulenData.value = response.data.data
    } else {
      notulenData.value = {
        no_surat: props.data.no_surat || props.data.surat_id,
        notulis_nik: notulenForm.value.notulis_nik,
        notulis: { nama: notulenForm.value.notulis_nama },
        pembahasan: notulenForm.value.pembahasan,
        status: notulenForm.value.status,
        updated_at: new Date().toISOString()
      }
    }

    isEditingNotulen.value = false
    toast.success('Notulensi rapat berhasil disimpan!')
  } catch (e) {
    console.error('Failed to save notulen:', e)
    toast.error(e.response?.data?.message || 'Gagal menyimpan notulensi')
  } finally {
    savingNotulen.value = false
  }
}

const openQrDetail = () => {
  if (qrCodeUrl.value) showQrFull.value = true
}

// Recipient Management Logic
const toggleEditRecipients = () => {
  isEditingRecipients.value = !isEditingRecipients.value
  if (!isEditingRecipients.value) {
    // Reset to original if cancelled
    recipients.value = JSON.parse(JSON.stringify(originalRecipients.value))
    empSearch.value = ''
    empResults.value = []
    hasRecipientsChanges.value = false
  }
}

import { pegawaiService } from '@/services/pegawaiService'
import debounce from 'lodash/debounce'

const handleEmpSearch = debounce(async () => {
  if (empSearch.value.length < 3) {
    empResults.value = []
    return
  }
  try {
    const response = await pegawaiService.searchPegawai(empSearch.value)
    if (response.data?.data) {
      // Filter out those already in recipients
      empResults.value = response.data.data.filter(emp => 
        !recipients.value.some(r => r.nik === emp.nik)
      )
    }
  } catch (e) {
    console.error('Emp search failed:', e)
  }
}, 300)

const addRecipient = (emp) => {
  recipients.value.push({
    nik: emp.nik,
    nama: emp.nama
  })
  empSearch.value = ''
  empResults.value = []
  checkRecipientsChanges()
}

const removeRecipient = (nik) => {
  recipients.value = recipients.value.filter(r => r.nik !== nik)
  checkRecipientsChanges()
}

const checkRecipientsChanges = () => {
  const currentNiks = recipients.value.map(r => r.nik).sort().join(',')
  const originalNiks = originalRecipients.value.map(r => r.nik).sort().join(',')
  hasRecipientsChanges.value = currentNiks !== originalNiks
}

const saveRecipients = async () => {
  if (!props.data?.id) return
  savingRecipients.value = true
  try {
    const niks = recipients.value.map(r => r.nik)
    await undanganService.updateRecipients(props.data.id, niks)
    toast.success('Daftar penerima berhasil diperbarui')
    originalRecipients.value = JSON.parse(JSON.stringify(recipients.value))
    hasRecipientsChanges.value = false
    isEditingRecipients.value = false
  } catch (e) {
    toast.error('Gagal memperbarui daftar penerima')
    console.error('Save recipients failed:', e)
  } finally {
    savingRecipients.value = false
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  // Replace space with T for ISO compatibility, but don't strip the suffix
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDay = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonth = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYear = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.getFullYear() : '----'
}

const formatTime = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '--:--'
}

const getTypeClass = (type) => {
  if (!type) return 'type-general'
  const t = type.toLowerCase()
  if (t.includes('rapat')) return 'type-rapat'
  if (t.includes('sosialisasi')) return 'type-sosial'
  return 'type-general'
}

const isPast = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? checkPast(d) : false
}

// Tindak Lanjut (Action Items) Methods
const fetchTindakLanjut = async () => {
  if (!props.data?.id) return
  loadingTindakLanjut.value = true
  try {
    const response = await undanganService.getTindakLanjut(props.data.id)
    const list = response.data?.data || (Array.isArray(response.data?.message) ? response.data.message : [])
    tindakLanjutList.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('Failed to fetch tindak lanjut:', e)
    tindakLanjutList.value = []
  } finally {
    loadingTindakLanjut.value = false
  }
}

const openTindakLanjutModal = () => {
  showTindakLanjut.value = true
  fetchTindakLanjut()
  fetchTimelinePrograms()
}

const closeTindakLanjutModal = () => {
  showTindakLanjut.value = false
  showTaskForm.value = false
  editingTaskId.value = null
}

const initNewTask = () => {
  editingTaskId.value = null
  taskForm.value = {
    tugas: '',
    pic_nik: '',
    pic_nama: '',
    deadline: '',
    status: 'pending',
    catatan_penyelesaian: ''
  }
  picSearch.value = ''
  picResults.value = []
  showTaskForm.value = true
}

const startEditTask = (task) => {
  editingTaskId.value = task.id
  taskForm.value = {
    tugas: task.tugas,
    pic_nik: task.pic_nik,
    pic_nama: task.pic?.nama || task.pic_nik,
    deadline: task.deadline ? task.deadline.substring(0, 10) : '',
    status: task.status || 'pending',
    catatan_penyelesaian: task.catatan_penyelesaian || ''
  }
  picSearch.value = ''
  picResults.value = []
  showTaskForm.value = true
}

const cancelTaskForm = () => {
  showTaskForm.value = false
  editingTaskId.value = null
}

const handlePicSearch = debounce(async () => {
  if (picSearch.value.length < 3) {
    picResults.value = []
    return
  }
  try {
    const response = await pegawaiService.searchPegawai(picSearch.value)
    if (response.data?.data) {
      picResults.value = response.data.data
    }
  } catch (e) {
    console.error('Failed to search PIC:', e)
  }
}, 300)

const selectPic = (emp) => {
  taskForm.value.pic_nik = emp.nik
  taskForm.value.pic_nama = emp.nama
  picSearch.value = ''
  picResults.value = []
}

const clearPic = () => {
  taskForm.value.pic_nik = ''
  taskForm.value.pic_nama = ''
}

const handleSaveTask = async () => {
  if (isQuillEmpty(taskForm.value.tugas)) {
    toast.warning('Uraian tugas tidak boleh kosong')
    return
  }
  if (!taskForm.value.pic_nik) {
    toast.warning('Silakan pilih penanggung jawab (PIC)')
    return
  }
  if (!taskForm.value.deadline) {
    toast.warning('Tentukan tenggat waktu (deadline)')
    return
  }

  savingTask.value = true
  try {
    if (editingTaskId.value) {
      await undanganService.updateTindakLanjut(editingTaskId.value, {
        tugas: taskForm.value.tugas,
        pic_nik: taskForm.value.pic_nik,
        deadline: taskForm.value.deadline,
        status: taskForm.value.status,
        catatan_penyelesaian: taskForm.value.catatan_penyelesaian
      })
      toast.success('Action item berhasil diperbarui!')
    } else {
      await undanganService.addTindakLanjut(props.data.id, {
        tugas: taskForm.value.tugas,
        pic_nik: taskForm.value.pic_nik,
        deadline: taskForm.value.deadline
      })
      toast.success('Action item baru berhasil ditambahkan!')
    }
    await fetchTindakLanjut()
    await fetchTimelinePrograms()
    showTaskForm.value = false
    editingTaskId.value = null
  } catch (e) {
    console.error('Failed to save task:', e)
    toast.error(e.response?.data?.message || 'Gagal menyimpan tugas')
  } finally {
    savingTask.value = false
  }
}

const toggleTaskComplete = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  try {
    await undanganService.updateTindakLanjut(task.id, {
      status: newStatus
    })
    task.status = newStatus
    toast.success(newStatus === 'completed' ? 'Tugas ditandai selesai! 🎉' : 'Tugas dibuka kembali')
    fetchTimelinePrograms()
  } catch (e) {
    console.error('Failed to toggle task:', e)
    toast.error('Gagal memperbarui status tugas')
  }
}

const handleDeleteTask = async (task) => {
  const cleanTitle = (task.tugas || '').replace(/<[^>]*>/g, '').trim() || 'item ini'
  if (!confirm(`Hapus tugas "${cleanTitle}"?`)) return
  try {
    await undanganService.deleteTindakLanjut(task.id)
    tindakLanjutList.value = tindakLanjutList.value.filter(t => t.id !== task.id)
    toast.success('Action item berhasil dihapus')
    fetchTimelinePrograms()
  } catch (e) {
    console.error('Failed to delete task:', e)
    toast.error('Gagal menghapus tugas')
  }
}

const formatTaskDeadline = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr.replace(' ', 'T'))
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const getDeadlineClass = (dateStr, status) => {
  if (status === 'completed') return 'bg-slate-100 text-slate-500'
  if (!dateStr) return 'bg-slate-100 text-slate-500'
  try {
    const d = new Date(dateStr.replace(' ', 'T'))
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    if (d < now) {
      return 'bg-rose-100 text-rose-700 font-bold'
    } else if (d.getTime() === now.getTime()) {
      return 'bg-amber-100 text-amber-800 font-bold'
    } else {
      return 'bg-blue-50 text-blue-700'
    }
  } catch (e) {
    return 'bg-slate-100 text-slate-500'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'in_progress': return 'Dikerjakan'
    case 'pending': default: return 'Menunggu'
  }
}

const getMeetingStatusLabel = (dateStr) => {
  if (!dateStr) return '-'
  const d = parseDate(dateStr)
  if (!d) return '-'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const meetingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  if (meetingDate.getTime() === today.getTime()) return 'Hari Ini'
  if (meetingDate.getTime() > today.getTime()) return 'Akan Datang'
  return 'Selesai'
}

const getMeetingStatusClass = (dateStr) => {
  const label = getMeetingStatusLabel(dateStr)
  if (label === 'Hari Ini') return 'status-today'
  if (label === 'Akan Datang') return 'status-upcoming'
  return 'status-past'
}

// Timeline Program Bridge Methods
const fetchTimelinePrograms = async () => {
  if (!props.data?.id) return
  loadingPrograms.value = true
  try {
    const res = await timelineService.getProgramsByUndangan(props.data.id)
    if (res.data?.success && Array.isArray(res.data?.data)) {
      publishedPrograms.value = res.data.data
    } else {
      publishedPrograms.value = []
    }
  } catch (err) {
    console.error('Failed to fetch timeline programs for meeting', err)
    publishedPrograms.value = []
  } finally {
    loadingPrograms.value = false
  }
}

const goToTimelineProgram = (progId) => {
  emit('close')
  router.push({ path: '/timeline', query: { programId: progId } })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999; padding: 1rem;
}

.modal-content {
  background: white; width: 96%; max-width: 1040px;
  border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  display: flex; flex-direction: column; max-height: 92vh;
  overflow: hidden; animation: modalReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

@keyframes modalReveal {
  from { opacity: 0; transform: scale(0.94) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 1.25rem 2rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center; background: #ffffff;
}

.modal-title {
  font-size: 1.2rem; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; gap: 0.75rem; margin: 0;
}

.btn-close-icon {
  background: #f1f5f9; border: none; width: 34px; height: 34px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.btn-close-icon:hover { background: #fee2e2; color: #ef4444; }

.modal-body { padding: 0; overflow-y: auto; }

/* Unified Hero Section */
.detail-hero {
  padding: 1.25rem 2rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px solid #bfdbfe;
}

/* Hero Date Card */
.hero-date-card {
  width: 82px;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.hero-date-card .card-header {
  background: #3b82f6;
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.3rem;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-date-card .card-body {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-date-card .day {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.hero-date-card .year {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 0.15rem;
}

.hero-main { flex: 1; }
.perihal-title { font-size: 1.2rem; font-weight: 800; color: #1e3a8a; line-height: 1.35; }

.tipe-badge {
  padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.65rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.type-rapat { background: #3b82f6; color: white; }
.type-sosial { background: #10b981; color: white; }
.type-general { background: #64748b; color: white; }

.time-stamp { font-size: 0.8rem; font-weight: 700; color: #475569; }

.meeting-status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}
.status-today {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}
.status-upcoming {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}
.status-past {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* 2-Column Responsive Dashboard Layout */
.detail-grid-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  align-items: start;
}

.detail-col-left {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.detail-col-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Info Tiles Grid */
.info-tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.info-tile {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.tile-icon {
  font-size: 1.25rem;
  padding-top: 1px;
}

.tile-content {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.tile-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.tile-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: #1e293b;
}

.tile-sub {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 2px;
}

/* Agenda / Deskripsi Box */
.agenda-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem 1.15rem;
}

.agenda-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}

.agenda-text {
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.55;
  white-space: pre-line;
}

/* Quick Actions 2x2 Grid */
.quick-actions-section .label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.action-card:not(:disabled):hover {
  transform: translateY(-2px);
  background: #fbfcfe;
  border-color: #3b82f6;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.08);
}
.action-card:disabled { opacity: 0.6; cursor: wait; }
.action-card i { font-size: 1.25rem; width: 24px; text-align: center; }

.action-info { display: flex; flex-direction: column; }
.action-name { font-weight: 800; color: #1e293b; font-size: 0.88rem; }
.action-desc { font-size: 0.68rem; color: #94a3b8; margin-top: 1px; }

/* Right Column Compact QR Card */
.qr-compact-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qr-thumb-wrap {
  width: 68px;
  height: 68px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  overflow: hidden;
  transition: all 0.2s;
}
.qr-thumb-wrap:hover { transform: scale(1.05); border-color: #3b82f6; }

.qr-thumb { width: 100%; height: 100%; object-fit: cover; }
.qr-loading-compact { display: flex; align-items: center; justify-content: center; }
.qr-thumb-failed { color: #ef4444; font-size: 1rem; cursor: pointer; }

.qr-compact-info { display: flex; flex-direction: column; flex: 1; }
.qr-title { font-size: 0.85rem; font-weight: 800; color: #1e3a8a; }
.qr-desc { font-size: 0.7rem; color: #64748b; margin: 0.15rem 0 0.35rem 0; line-height: 1.2; }
.btn-qr-zoom {
  font-size: 0.7rem; font-weight: 700; color: #2563eb; background: #eff6ff;
  border: 1px solid #bfdbfe; border-radius: 6px; padding: 0.25rem 0.6rem;
  cursor: pointer; align-self: flex-start; transition: all 0.15s;
}
.btn-qr-zoom:hover { background: #dbeafe; color: #1d4ed8; }

/* Right Column Recipients Card */
.recipients-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  overflow: hidden;
}

.recipients-card-header {
  padding: 0.85rem 1.15rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipients-header-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.recipients-card-body {
  padding: 0.85rem 1.15rem;
}

.recipients-scroll-list {
  max-height: 290px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-right: 0.25rem;
}

.recipient-tag {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 0.45rem 0.85rem; display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; transition: all 0.15s;
}
.recipient-tag:hover { background: #ffffff; border-color: #cbd5e1; }
.recipient-tag.is-attended { background: #f0fdf4; border-color: #bbf7d0; }

.modal-footer {
  padding: 0.85rem 2rem; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; background: #f8fafc;
}

.btn-close-text {
  padding: 0.6rem 2rem; background: #0f172a; color: white;
  border: none; border-radius: 10px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.btn-close-text:hover { background: #1e293b; }

/* Sub Modal Notulen & Editor */
.notulen-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); z-index: 50;
  display: flex; flex-direction: column; padding: 1.25rem;
  animation: fadeIn 0.3s ease;
}

.notulen-content {
  background: white; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; height: 100%;
  overflow: hidden;
}

.notulen-header {
  padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center; background: #f8fafc;
}
.notulen-title-wrap { display: flex; align-items: center; }
.notulen-title-text { font-weight: 800; color: #1e3a8a; font-size: 1.05rem; }

.notulen-header-actions { display: flex; align-items: center; gap: 0.5rem; }
.btn-switch-edit {
  background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;
  padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
}
.btn-switch-edit:hover { background: #dbeafe; color: #1e40af; }

.btn-close-notulen {
  background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px;
  color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.btn-close-notulen:hover { background: #fee2e2; color: #ef4444; }

.notulen-body { padding: 1.5rem; overflow-y: auto; flex: 1; }

/* Notulen Edit Form Styles */
.notulen-form-group { position: relative; }
.form-sublabel {
  font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase;
  letter-spacing: 0.05em; display: flex; align-items: center; margin-bottom: 0.4rem;
}

.selected-notulis-card {
  display: flex; align-items: center; gap: 0.75rem;
  background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.65rem 1rem;
  border-radius: 12px;
}
.notulis-avatar-circle {
  width: 34px; height: 34px; border-radius: 50%; background: #22c55e;
  color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
}
.notulis-detail { display: flex; flex-direction: column; flex: 1; line-height: 1.2; }
.notulis-name { font-size: 0.9rem; font-weight: 700; color: #15803d; }
.notulis-nik { font-size: 0.7rem; color: #64748b; }
.btn-change-notulis {
  background: #fee2e2; border: none; color: #ef4444; width: 26px; height: 26px;
  border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.btn-template-helper {
  background: #fdf4ff; border: 1px solid #f0abfc; color: #a21caf;
  font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px;
  cursor: pointer; transition: all 0.2s;
}
.btn-template-helper:hover { background: #fae8ff; }

/* Quill Rich Text Editor Wrapper & Theme Overrides */
.quill-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  transition: all 0.2s ease;
}

.quill-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.task-editor-wrapper:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
}

:deep(.ql-toolbar.ql-snow) {
  border: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background-color: #f8fafc;
  padding: 6px 10px !important;
  border-top-left-radius: 11px;
  border-top-right-radius: 11px;
}

:deep(.ql-container.ql-snow) {
  border: none !important;
  font-family: inherit;
  font-size: 0.88rem;
  border-bottom-left-radius: 11px;
  border-bottom-right-radius: 11px;
}

:deep(.ql-editor) {
  min-height: 180px;
  max-height: 380px;
  overflow-y: auto;
  line-height: 1.6;
  color: #1e293b;
  padding: 12px 14px;
}

.task-editor-wrapper :deep(.ql-editor) {
  min-height: 95px;
  max-height: 200px;
  font-size: 0.85rem;
  padding: 10px 12px;
}

:deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
  font-style: normal;
  left: 14px;
}
.task-editor-wrapper :deep(.ql-editor.ql-blank::before) {
  left: 12px;
}

.notulen-textarea {
  width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid #cbd5e1;
  font-size: 0.88rem; line-height: 1.6; font-family: inherit; color: #1e293b;
  resize: vertical; transition: all 0.2s;
}
.notulen-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.status-choice-group { display: flex; gap: 1rem; }
.status-choice-label {
  flex: 1; display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1rem;
  border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc;
  cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #475569; transition: all 0.2s;
}
.status-choice-label input { accent-color: #3b82f6; }
.status-choice-label.active { background: white; border-color: #3b82f6; color: #1e3a8a; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.08); }

.notulen-edit-actions {
  display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}
.btn-cancel-edit {
  padding: 0.65rem 1.25rem; background: #f1f5f9; color: #475569; border: none;
  border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
}
.btn-cancel-edit:hover { background: #e2e8f0; }

.btn-save-notulen {
  padding: 0.65rem 1.75rem; background: #2563eb; color: white; border: none;
  border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center; transition: all 0.2s;
}
.btn-save-notulen:hover:not(:disabled) { background: #1d4ed8; }
.btn-save-notulen:disabled { opacity: 0.6; cursor: wait; }

/* Notulen Preview Styles */
.notulen-meta-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; padding: 0.85rem 1.25rem; border-radius: 14px; border: 1px solid #e2e8f0;
}
.notulen-meta-card .meta-item { display: flex; flex-direction: column; }
.meta-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
.meta-val { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 2px; }
.meta-sub { font-size: 0.7rem; color: #64748b; margin-top: 2px; }

.badge-notulen-status {
  padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800;
  display: inline-block; width: fit-content; margin-left: auto;
}
.badge-notulen-status.status-published { background: #dcfce7; color: #166534; }
.badge-notulen-status.status-draft { background: #fef3c7; color: #92400e; }

.notulen-content-box {
  background: white; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 1.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.notulen-content-box .box-title {
  font-size: 0.8rem; font-weight: 800; color: #1e3a8a; text-transform: uppercase;
  letter-spacing: 0.05em; margin-bottom: 0.85rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9;
}
.notulen-content-box .rich-content {
  color: #334155; line-height: 1.7; font-size: 0.92rem;
}

.notulen-content-box .rich-content.ql-editor {
  padding: 0 !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  user-select: text;
}
.notulen-content-box .rich-content.ql-editor h1,
.notulen-content-box .rich-content.ql-editor h2,
.notulen-content-box .rich-content.ql-editor h3 {
  color: #0f172a;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.notulen-content-box .rich-content.ql-editor h3 {
  font-size: 1.02rem;
}
.notulen-content-box .rich-content.ql-editor ul,
.notulen-content-box .rich-content.ql-editor ol {
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.notulen-content-box .rich-content.ql-editor p {
  margin-bottom: 0.5rem;
}

.task-rich-desc :deep(p) {
  margin-bottom: 0.25rem;
}
.task-rich-desc :deep(p:last-child) {
  margin-bottom: 0;
}
.task-rich-desc :deep(ul),
.task-rich-desc :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.25rem;
}

.btn-edit-notulen-secondary {
  width: 100%; padding: 0.75rem; background: #eff6ff; color: #2563eb;
  border: 1px solid #bfdbfe; border-radius: 12px; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-edit-notulen-secondary:hover { background: #dbeafe; color: #1e40af; }

/* Empty State */
.empty-icon-circle {
  width: 56px; height: 56px; border-radius: 50%; background: #eff6ff;
  color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
}
.btn-start-notulen {
  padding: 0.75rem 1.75rem; background: #2563eb; color: white; border: none;
  border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  display: inline-flex; align-items: center; transition: all 0.2s;
}
.btn-start-notulen:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* QR Full Overlay */
.qr-full-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.9); z-index: 100;
  display: flex; justify-content: center; align-items: center;
  padding: 1rem; animation: modalReveal 0.3s ease;
}

.qr-full-container {
  background: white; padding: 1.5rem; border-radius: 20px;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  max-width: 90%;
}

.qr-full-header {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  font-weight: 800; color: #1e3a8a; font-size: 1.1rem; margin-bottom: 0.5rem;
}

.qr-full-header button { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; color: #64748b; cursor: pointer; }

.qr-large-image { width: 380px; height: 380px; border-radius: 20px; }
.qr-full-hint { font-size: 0.9rem; color: #94a3b8; font-weight: 600; margin: 0; }

/* Recipients Styles */
.btn-edit-recipients {
  margin-left: auto; background: #eff6ff; border: 1px solid #bfdbfe;
  color: #2563eb; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.75rem;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
  transition: all 0.2s;
}
.btn-edit-recipients:hover { background: #dbeafe; color: #1e40af; }

.recipients-container {
  background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;
  padding: 1rem; margin-top: 0.5rem;
}

.recipients-loading { display: flex; align-items: center; gap: 0.75rem; color: #64748b; font-size: 0.85rem; padding: 1rem; }

.recipients-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.recipient-tag {
  background: white; border: 1px solid #e2e8f0; border-radius: 99px;
  padding: 0.35rem 0.85rem; display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.recipient-info { display: flex; flex-direction: column; line-height: 1.2; }
.recipient-info .name { font-size: 0.8rem; font-weight: 700; color: #334155; }
.recipient-info .nik { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }

.attendance-summary-badge {
  background: #dcfce7; color: #166534; font-size: 0.68rem; font-weight: 800;
  padding: 0.15rem 0.55rem; border-radius: 99px; margin-left: 0.5rem;
}

.recipient-tag.is-attended {
  background: #f0fdf4; border-color: #bbf7d0;
}

.attendance-action-box {
  display: flex; align-items: center; margin-left: 0.25rem;
}

.badge-hadir {
  background: #dcfce7; color: #15803d; font-size: 0.65rem; font-weight: 700;
  padding: 0.2rem 0.5rem; border-radius: 99px; display: flex; align-items: center; gap: 0.25rem;
}

.btn-hadirkan {
  background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;
  font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 99px;
  cursor: pointer; display: flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
}
.btn-hadirkan:hover:not(:disabled) {
  background: #2563eb; color: white; border-color: #2563eb; transform: scale(1.04);
}
.btn-hadirkan:disabled {
  opacity: 0.6; cursor: wait;
}

.mini-spinner-xs {
  width: 10px; height: 10px; border: 2px solid #93c5fd;
  border-top-color: #1d4ed8; border-radius: 50%; animation: spin 0.8s linear infinite;
}

.btn-remove { 
  background: #fee2e2; border: none; color: #ef4444; 
  width: 18px; height: 18px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; cursor: pointer; margin-right: -4px;
}
.btn-remove:hover { background: #fecaca; }

.recipient-search-box { margin-bottom: 1rem; position: relative; }
.search-input-wrapper {
  position: relative; display: flex; align-items: center;
}
.search-input-wrapper i { position: absolute; left: 1rem; color: #94a3b8; font-size: 0.8rem; }
.search-input-wrapper input {
  width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; border-radius: 12px;
  border: 1px solid #e2e8f0; font-size: 0.85rem; transition: all 0.2s;
}
.search-input-wrapper input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); background: white; }

.search-results-dropdown {
  position: absolute; top: calc(100% + 5px); left: 0; right: 0;
  background: white; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 20;
  max-height: 200px; overflow-y: auto; padding: 0.5rem;
}

.search-result-item {
  padding: 0.6rem 0.75rem; border-radius: 8px; display: flex;
  justify-content: space-between; align-items: center; cursor: pointer;
  transition: all 0.1s;
}
.search-result-item:hover { background: #f1f5f9; }
.search-result-item .emp-info { display: flex; flex-direction: column; }
.search-result-item .emp-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.search-result-item .emp-nik { font-size: 0.7rem; color: #64748b; }
.search-result-item i { color: #3b82f6; font-size: 1rem; }

.recipients-empty {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600;
}
.recipients-empty i { font-size: 1.5rem; color: #e2e8f0; }

.btn-save-recipients {
  width: 100%; padding: 0.75rem; background: #10b981; color: white;
  border: none; border-radius: 12px; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-save-recipients:hover { background: #059669; }
.btn-save-recipients:disabled { opacity: 0.6; cursor: wait; }

/* Tindak Lanjut Modal Dialog & Button Reset */
.tindak-lanjut-dialog {
  max-width: 820px;
  width: 95%;
  height: auto;
  max-height: 90vh;
  margin: auto;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  animation: modalReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.tindak-lanjut-dialog button,
.publish-program-content button {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.timeline-link-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.15s ease;
}
.timeline-link-pill:hover {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}
.timeline-link-pill:hover i {
  color: #ffffff !important;
}

.btn-header-add-task {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff !important;
  background: #059669 !important;
  border: none !important;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(5, 150, 105, 0.25);
  cursor: pointer;
}
.btn-header-add-task:hover {
  background: #047857 !important;
  transform: translateY(-1px);
}

/* Task / Action Items Styles */
.task-progress-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
}

.task-form-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 1rem 1.15rem;
  animation: fadeIn 0.25s ease-out;
}

.task-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  transition: all 0.2s ease;
}
.task-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
  background: #ffffff;
}

.selected-pic-pill {
  transition: all 0.2s ease;
}

.btn-clear-pic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #ef4444;
  background: #fee2e2;
  border: none !important;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-clear-pic:hover {
  background: #fecaca;
}

.btn-attendee-quick-pick {
  display: inline-flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0 !important;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-attendee-quick-pick:hover {
  background: #059669;
  color: #ffffff;
  border-color: #059669 !important;
}

.btn-save-task {
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff !important;
  background: #059669 !important;
  border: none !important;
  padding: 0.45rem 1rem;
  border-radius: 9px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
  transition: all 0.2s ease;
}
.btn-save-task:hover:not(:disabled) {
  background: #047857 !important;
  transform: translateY(-1px);
}
.btn-save-task:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-cancel-task {
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0 !important;
  padding: 0.45rem 0.85rem;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel-task:hover {
  background: #e2e8f0;
  color: #334155;
}

/* Filter Bar & Tabs */
.task-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
}

.tab-filter-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.65rem;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  border: none !important;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tab-filter-btn:hover {
  color: #1e293b;
}
.tab-filter-btn.active {
  background: #ffffff;
  color: #0f172a;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.btn-add-task-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 11.5px;
  font-weight: 700;
  color: #059669;
  border: none !important;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-add-task-inline:hover {
  color: #047857;
  text-decoration: underline;
}

/* Task Cards & Controls */
.task-card {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.task-card:hover {
  transform: translateY(-1px);
}

.btn-task-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #cbd5e1 !important;
  background: #ffffff;
  color: transparent;
  font-size: 10px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
}
.btn-task-checkbox:hover {
  border-color: #10b981 !important;
}
.btn-task-checkbox.checked {
  background: #10b981;
  border-color: #10b981 !important;
  color: #ffffff;
}

.btn-task-action {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #94a3b8;
  border: none !important;
  background: transparent;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-task-action.edit:hover {
  color: #2563eb;
  background: #eff6ff;
}
.btn-task-action.delete:hover {
  color: #e11d48;
  background: #ffe4e6;
}

.btn-create-first-task {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff !important;
  background: #059669 !important;
  border: none !important;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
  transition: all 0.2s ease;
}
.btn-create-first-task:hover {
  background: #047857 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.35);
}

.task-pic-pill {
  border: 1px solid #e2e8f0;
}

.task-deadline-pill {
  border: 1px solid transparent;
}

/* Timeline Bridge Styles */
.timeline-bridge-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.85rem 1rem;
}

.badge-timeline-count {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  font-size: 11px;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.published-programs-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.published-prog-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}
.published-prog-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
}

.prog-code-pill {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.prog-cat-pill {
  font-size: 10px;
  font-weight: 600;
  background: #eef2ff;
  color: #4f46e5;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.prog-name-text {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0.2rem;
  line-height: 1.35;
}

.prog-progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.prog-bar-track {
  flex-grow: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.prog-bar-val {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.prog-pct-label {
  font-size: 11px;
  font-weight: 800;
  color: #4f46e5;
  min-width: 28px;
  text-align: right;
}

.btn-open-timeline {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-open-timeline:hover {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.btn-add-more-program {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #4f46e5;
  background: #f5f3ff;
  border: 1px dashed #c7d2fe;
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-add-more-program:hover {
  background: #ede9fe;
  border-color: #818cf8;
}

/* Empty Prompt Banner */
.bridge-empty-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: linear-gradient(135deg, #fdf4ff 0%, #ede9fe 100%);
  border: 1px solid #e9d5ff;
  border-radius: 14px;
  padding: 0.75rem 0.95rem;
}

.bridge-empty-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bridge-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 5px rgba(109, 40, 217, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.bridge-empty-texts {
  min-width: 0;
}

.bridge-empty-title {
  font-size: 12px;
  font-weight: 700;
  color: #4c1d95;
  line-height: 1.25;
}

.bridge-empty-desc {
  font-size: 10.5px;
  color: #6b21a8;
  opacity: 0.85;
  margin-top: 1px;
  line-height: 1.25;
}

.btn-publish-now {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  padding: 0.45rem 0.8rem;
  border-radius: 9px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
  transition: all 0.2s ease;
}
.btn-publish-now:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.35);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 900px) {
  .detail-grid-layout { grid-template-columns: 1fr; gap: 1rem; padding: 1rem; }
  .info-tiles-grid { grid-template-columns: 1fr; }
  .action-grid-2x2 { grid-template-columns: 1fr; }
  .detail-hero { flex-direction: column; text-align: center; gap: 1rem; padding: 1rem; }
  .bridge-empty-banner { flex-direction: column; align-items: flex-start; }
  .btn-publish-now { width: 100%; justify-content: center; }
}
</style>
