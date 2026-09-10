<template>
  <div class="timeline-program-wrapper">
    <!-- 1. Header Kompak & Bersih -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
      <div class="d-flex align-items-center gap-3">
        <div class="header-icon-box bg-primary-subtle text-primary shadow-2xs">
          <i class="fas fa-stream fa-lg"></i>
        </div>
        <div>
          <h4 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            Timeline & Target Manajemen
            <span class="badge bg-light text-secondary border px-2 py-0.5 fs-xs fw-semibold">
              {{ summary.total || 0 }} Program
            </span>
          </h4>
          <p class="text-muted small m-0">Monitoring pencapaian program kerja strategis dan tahapan milestone rumah sakit</p>
        </div>
      </div>
      <div>
        <button class="btn btn-primary premium-add-btn shadow-sm" @click="openModalProgram('add')">
          <i class="fas fa-plus-circle me-1.5"></i> Buat Target Program
        </button>
      </div>
    </div>

    <!-- 2. Executive Mini-Stat Bar (Kompak, tinggi ~55px) -->
    <div class="row g-2 mb-3">
      <div class="col-6 col-md-3">
        <div class="mini-stat-card border rounded-3 p-2.5 d-flex align-items-center gap-3 bg-white">
          <div class="stat-icon bg-blue-subtle text-primary">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div>
            <span class="d-block text-muted fs-xxs fw-semibold text-uppercase">Total Program</span>
            <span class="fs-5 fw-bold text-dark lh-1">{{ summary.total }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mini-stat-card border rounded-3 p-2.5 d-flex align-items-center gap-3 bg-white">
          <div class="stat-icon bg-emerald-subtle text-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div>
            <span class="d-block text-muted fs-xxs fw-semibold text-uppercase">On Track</span>
            <span class="fs-5 fw-bold text-success lh-1">{{ summary.on_track }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mini-stat-card border rounded-3 p-2.5 d-flex align-items-center gap-3 bg-white">
          <div class="stat-icon bg-amber-subtle text-warning">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div>
            <span class="d-block text-muted fs-xxs fw-semibold text-uppercase">Mendekati Target</span>
            <span class="fs-5 fw-bold text-warning lh-1">{{ summary.at_risk }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mini-stat-card border rounded-3 p-2.5 d-flex align-items-center gap-3 bg-white">
          <div class="stat-icon bg-cyan-subtle text-cyan">
            <i class="fas fa-trophy"></i>
          </div>
          <div>
            <span class="d-block text-muted fs-xxs fw-semibold text-uppercase">Selesai</span>
            <span class="fs-5 fw-bold text-cyan lh-1">{{ summary.completed }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Dedicated Clean Filter Toolbar -->
    <div class="filter-toolbar mb-3 p-2.5 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
        <!-- Search Box -->
        <div class="filter-search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="filters.keyword" 
            type="text" 
            class="form-control filter-input" 
            placeholder="Cari program, tahapan, atau unit..."
            @keyup.enter="fetchData"
          >
          <button 
            v-if="filters.keyword" 
            class="btn-clear-search" 
            @click="filters.keyword = ''; fetchData()"
            title="Hapus pencarian"
          >
            <i class="fas fa-times-circle"></i>
          </button>
        </div>

        <!-- Filter Kategori -->
        <select v-model="filters.kategori" class="form-select filter-select" @change="fetchData">
          <option value="">Semua Kategori</option>
          <option value="Pemasaran & Promosi">Pemasaran & Promosi</option>
          <option value="Akreditasi & Mutu">Akreditasi & Mutu</option>
          <option value="Pelayanan Medis">Pelayanan Medis</option>
          <option value="Keperawatan">Keperawatan</option>
          <option value="Fasilitas & Sarpras">Fasilitas & Sarpras</option>
          <option value="SDI & Diklat">SDI & Diklat</option>
          <option value="IT & Digitalisasi">IT & Digitalisasi</option>
          <option value="Keuangan">Keuangan</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <!-- Filter Status -->
        <select v-model="filters.status" class="form-select filter-select" @change="fetchData">
          <option value="">Semua Status</option>
          <option value="in_progress">Sedang Berjalan</option>
          <option value="completed">Selesai</option>
          <option value="delayed">Tertunda / Delay</option>
          <option value="draft">Draft / Rencana</option>
        </select>

        <!-- Filter Tahun -->
        <select v-model="filters.tahun" class="form-select filter-select-sm" @change="fetchData">
          <option value="">Tahun</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>

        <!-- Reset Filter Button -->
        <button 
          v-if="filters.keyword || filters.kategori || filters.status || filters.tahun" 
          class="btn btn-light btn-sm filter-reset-btn" 
          @click="resetFilters"
          title="Reset Filter"
        >
          <i class="fas fa-undo me-1"></i> Reset
        </button>
      </div>

      <!-- Right Action: Refresh -->
      <div class="d-flex align-items-center gap-2">
        <button 
          class="btn btn-outline-secondary btn-sm px-3 filter-refresh-btn" 
          @click="fetchData" 
          :disabled="loading" 
          title="Segarkan Data"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          <span class="d-none d-sm-inline ms-1.5">Refresh</span>
        </button>
      </div>
    </div>

    <!-- 4. Program List & Timeline Accordion -->
    <div v-if="loading" class="text-center py-5 bg-white border rounded-3 shadow-2xs">
      <div class="spinner-border text-primary spinner-sm"></div>
      <p class="mt-2 text-muted small mb-0">Memuat data target manajemen...</p>
    </div>

    <div v-else-if="programs.length === 0" class="text-center py-5 bg-white border rounded-3 shadow-2xs px-4">
      <div class="empty-icon-circle mx-auto mb-3">
        <i class="fas fa-calendar-plus fa-2x text-primary opacity-75"></i>
      </div>
      <h6 class="fw-bold text-dark mb-1">Belum Ada Target Program</h6>
      <p class="small text-muted mb-3 mx-auto" style="max-width: 450px;">
        Mulai buat program kerja dan tentukan target tahapan manajemen rumah sakit.
      </p>
      <button 
        type="button" 
        class="btn btn-sm btn-outline-primary px-3 py-1.5 rounded-2 fw-semibold btn-compact-add" 
        @click="openModalProgram('add')"
      >
        <i class="fas fa-plus me-1.5"></i> Buat Target Program
      </button>
    </div>

    <div v-else class="program-list">
      <div 
        v-for="program in programs" 
        :key="program.id" 
        class="card program-card border shadow-2xs rounded-3 mb-3 bg-white"
        :class="{ 'is-expanded': isExpanded(program.id) }"
      >
        <!-- Card Header / Summary -->
        <div class="program-card-header">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <!-- Left: Program Info & Expand Toggle -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1 min-w-0">
              <!-- Expand / Collapse Button -->
              <button 
                type="button"
                class="btn-expand-program" 
                :class="{ 'expanded': isExpanded(program.id) }"
                @click="toggleExpand(program.id)"
                :title="isExpanded(program.id) ? 'Tutup Tahapan' : 'Buka Tahapan'"
              >
                <i class="fas fa-chevron-right chevron-icon" :class="{ 'rotate-90': isExpanded(program.id) }"></i>
              </button>

              <div class="flex-grow-1 min-w-0">
                <!-- Badges Row -->
                <div class="d-flex flex-wrap align-items-center gap-1.5 mb-1.5">
                  <span class="clean-badge badge-code">{{ program.kode_program }}</span>
                  <span class="clean-badge badge-category">{{ program.kategori }}</span>
                  <span v-if="program.unit_pj" class="clean-badge badge-unit">
                    <i class="fas fa-building me-1 opacity-60"></i>{{ program.unit_pj }}
                  </span>
                  <span class="clean-badge badge-status" :class="getStatusBadgeClass(program.status)">
                    <span class="status-dot"></span>
                    {{ getStatusLabel(program.status) }}
                  </span>
                </div>

                <!-- Program Title -->
                <h6 class="program-title" @click="toggleExpand(program.id)">
                  {{ program.nama_program }}
                </h6>

                <!-- Metadata Row -->
                <div class="program-meta-row">
                  <span class="program-meta-item">
                    <i class="far fa-calendar-alt text-slate-400 me-1.5"></i>
                    {{ formatDate(program.tanggal_mulai) }} – {{ formatDate(program.target_selesai) }}
                  </span>

                  <span v-if="program.pic" class="program-meta-item">
                    <i class="far fa-user text-slate-400 me-1.5"></i>
                    PIC: <strong class="text-slate-800 ms-1">{{ program.pic.nama }}</strong>
                  </span>

                  <span v-if="program.assignees && program.assignees.length > 0" class="program-meta-pill">
                    <i class="fas fa-users me-1 text-slate-400"></i>
                    {{ program.assignees.length }} Anggota Tim
                  </span>

                  <span class="program-meta-pill">
                    <i class="fas fa-layer-group me-1 text-slate-400"></i>
                    {{ program.milestones ? program.milestones.length : 0 }} Tahapan
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Progress & Action -->
            <div class="d-flex align-items-center gap-3 ms-auto ms-md-0 pt-1 pt-md-0 align-self-end align-self-md-center flex-shrink-0">
              <!-- Compact Progress Widget -->
              <div class="program-progress-box">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="progress-label">Capaian</span>
                  <span class="progress-val">{{ program.progress_percent }}%</span>
                </div>
                <div class="progress clean-progress-track">
                  <div 
                    class="progress-bar" 
                    :class="getProgressBarClass(program.progress_percent)" 
                    :style="{ width: program.progress_percent + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Action Dropdown (Ghost Kebab) -->
              <div class="dropdown">
                <button 
                  type="button"
                  class="btn-action-kebab" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title="Menu Program"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm fs-xs py-1 border-slate-200">
                  <li>
                    <a class="dropdown-item py-1.5" href="javascript:void(0)" @click="openModalAddMilestone(program)">
                      <i class="fas fa-plus text-primary me-2"></i> Tambah Tahapan
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item py-1.5" href="javascript:void(0)" @click="openModalProgram('edit', program)">
                      <i class="fas fa-edit text-warning me-2"></i> Edit Program
                    </a>
                  </li>
                  <li><hr class="dropdown-divider my-1"></li>
                  <li>
                    <a class="dropdown-item py-1.5 text-danger" href="javascript:void(0)" @click="handleDeleteProgram(program)">
                      <i class="fas fa-trash me-2"></i> Hapus Program
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Body: Expanded Milestone Timeline -->
        <div v-show="isExpanded(program.id)" class="card-body p-0 bg-slate-50 border-top">
          <!-- Empty State -->
          <div v-if="!program.milestones || program.milestones.length === 0" class="p-4 text-center text-muted fs-xs">
            <i class="fas fa-info-circle me-1"></i> Belum ada tahapan pada program ini. 
            <a href="javascript:void(0)" class="fw-semibold text-primary" @click="openModalAddMilestone(program)">+ Tambah Tahap 1</a>
          </div>

          <!-- Milestones Section (Gantt & Table) -->
          <div v-else>
            <!-- Subheader Bar with View Switcher & Actions -->
            <div class="milestone-toolbar px-3.5 py-2 bg-slate-100/70 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="fs-xs fw-bold text-slate-700">
                  <i class="fas fa-layer-group text-primary me-1.5"></i>
                  Tahapan Target ({{ program.milestones.length }})
                </span>
                <span v-if="getProgramViewMode(program.id) === 'gantt'" class="badge bg-white text-secondary border fs-xxs">
                  <i class="far fa-chart-bar text-primary me-1"></i> Visual Gantt Timeline
                </span>
                <span v-else class="badge bg-white text-secondary border fs-xxs">
                  <i class="fas fa-table-list text-primary me-1"></i> Tabel Detail
                </span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <!-- View Mode Switcher -->
                <div class="view-mode-toggle btn-group p-0.5 bg-slate-200/80 rounded-2" role="group">
                  <button 
                    type="button" 
                    class="btn btn-xs py-1 px-2.5 rounded-1 fw-semibold transition-all"
                    :class="getProgramViewMode(program.id) === 'gantt' ? 'btn-toggle-active' : 'btn-toggle-inactive'"
                    @click="setProgramViewMode(program.id, 'gantt')"
                    title="Tampilan Visual Gantt Chart"
                  >
                    <i class="fas fa-chart-gantt me-1 text-xs"></i> Gantt Chart
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-xs py-1 px-2.5 rounded-1 fw-semibold transition-all"
                    :class="getProgramViewMode(program.id) === 'table' ? 'btn-toggle-active' : 'btn-toggle-inactive'"
                    @click="setProgramViewMode(program.id, 'table')"
                    title="Tampilan Tabel Detail"
                  >
                    <i class="fas fa-table-list me-1 text-xs"></i> Tabel
                  </button>
                </div>

                <!-- Quick Add Milestone Button -->
                <button 
                  type="button" 
                  class="btn btn-xs btn-outline-primary rounded-2 py-1 px-2.5 fw-semibold"
                  @click="openModalAddMilestone(program)"
                >
                  <i class="fas fa-plus me-1"></i> Tambah Tahap
                </button>
              </div>
            </div>

            <!-- VIEW 1: GANTT CHART -->
            <div v-if="getProgramViewMode(program.id) === 'gantt'" class="gantt-chart-container">
              <!-- Legend & Help Note -->
              <div class="d-flex flex-wrap align-items-center justify-content-between px-3.5 py-2 border-bottom bg-slate-50 fs-xxs text-muted">
                <div class="d-flex flex-wrap align-items-center gap-3">
                  <span class="d-inline-flex align-items-center">
                    <span class="gantt-legend-box gantt-bar-primary me-1.5"></span> Berjalan
                  </span>
                  <span class="d-inline-flex align-items-center">
                    <span class="gantt-legend-box gantt-bar-success me-1.5"></span> Selesai
                  </span>
                  <span class="d-inline-flex align-items-center">
                    <span class="gantt-legend-box gantt-bar-danger me-1.5"></span> Lewat Deadline
                  </span>
                  <span v-if="getGanttTimelineData(program).todayLeftPercent >= 0" class="d-inline-flex align-items-center">
                    <span class="gantt-legend-line-today me-1.5"></span> Hari Ini
                  </span>
                </div>
                <div class="text-slate-400">
                  <i class="fas fa-mouse-pointer me-1"></i> Klik baris untuk update progres
                </div>
              </div>

              <!-- Gantt Scroll Area -->
              <div class="gantt-scroll-wrapper">
                <div 
                  class="gantt-layout" 
                  :style="{ minWidth: (280 + (getGanttTimelineData(program).months.length * 120)) + 'px' }"
                >
                  <!-- Gantt Header -->
                  <div class="gantt-header-row">
                    <div class="gantt-left-header">
                      <span>Uraian Tahapan</span>
                    </div>
                    <div class="gantt-timeline-header position-relative">
                      <!-- Today Header Marker -->
                      <div 
                        v-if="getGanttTimelineData(program).todayLeftPercent >= 0" 
                        class="gantt-today-header-marker"
                        :style="{ left: getGanttTimelineData(program).todayLeftPercent + '%' }"
                      >
                        <span class="gantt-today-badge">Hari Ini</span>
                      </div>

                      <div 
                        v-for="month in getGanttTimelineData(program).months" 
                        :key="month.key" 
                        class="gantt-month-col-header"
                      >
                        {{ month.label }}
                      </div>
                    </div>
                  </div>

                  <!-- Gantt Body -->
                  <div class="gantt-body">
                    <div 
                      v-for="m in program.milestones" 
                      :key="m.id" 
                      class="gantt-row"
                      @click="openModalUpdateProgress(m)"
                    >
                      <!-- Left Column: Info & Action Buttons -->
                      <div class="gantt-left-col">
                        <div class="d-flex align-items-center gap-2 w-100 min-w-0">
                          <span class="milestone-step-badge flex-shrink-0">#{{ m.urutan }}</span>
                          <div class="text-truncate min-w-0 flex-grow-1">
                            <div class="fw-semibold text-slate-800 fs-xs text-truncate" :title="m.judul_tahapan">
                              {{ m.judul_tahapan }}
                            </div>
                            <div class="d-flex align-items-center gap-1.5 text-slate-400 fs-xxs">
                              <span>{{ formatDate(m.target_selesai) }}</span>
                              <span v-if="m.assignees && m.assignees.length > 0" class="text-slate-500">
                                • <i class="fas fa-users me-0.5"></i>{{ m.assignees.length }}
                              </span>
                            </div>
                          </div>
                          
                          <!-- Progress Badge -->
                          <span 
                            class="badge fs-xxs flex-shrink-0 me-1" 
                            :class="m.progress_percent >= 100 ? 'bg-success-subtle text-success' : 'bg-slate-100 text-slate-600'"
                          >
                            {{ m.progress_percent }}%
                          </span>

                          <!-- Inline Actions in Gantt: Single Kebab Dropdown to save space -->
                          <div class="dropdown flex-shrink-0" @click.stop>
                            <button 
                              type="button" 
                              class="btn-gantt-action text-slate-500" 
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                              title="Menu Aksi Tahapan"
                            >
                              <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-lg fs-xs py-1 border-slate-200" style="min-width: 180px; z-index: 1060;">
                              <li>
                                <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="openModalUpdateProgress(m)">
                                  <i class="fas fa-tasks text-primary" style="width: 14px;"></i>
                                  <span>Update Progres</span>
                                </a>
                              </li>
                              <li>
                                <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="openModalEditMilestone(m, program)">
                                  <i class="fas fa-edit text-warning" style="width: 14px;"></i>
                                  <span>Edit Tahapan & Tanggal</span>
                                </a>
                              </li>
                              <li>
                                <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="handleSendWhatsApp(m)">
                                  <i class="fab fa-whatsapp text-success" style="width: 14px;"></i>
                                  <span>Kirim Pengingat WA</span>
                                </a>
                              </li>
                              <li><hr class="dropdown-divider my-1"></li>
                              <li>
                                <a class="dropdown-item py-1.5 d-flex align-items-center gap-2 text-danger" href="javascript:void(0)" @click="handleDeleteMilestone(m)">
                                  <i class="far fa-trash-alt" style="width: 14px;"></i>
                                  <span>Hapus Tahapan</span>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <!-- Right Column: Timeline Canvas Track -->
                      <div class="gantt-track-col position-relative">
                        <!-- Grid Lines -->
                        <div class="gantt-grid-background">
                          <div 
                            v-for="month in getGanttTimelineData(program).months" 
                            :key="'grid-' + month.key" 
                            class="gantt-grid-col"
                          ></div>
                        </div>

                        <!-- Today Vertical Line -->
                        <div 
                          v-if="getGanttTimelineData(program).todayLeftPercent >= 0" 
                          class="gantt-today-line" 
                          :style="{ left: getGanttTimelineData(program).todayLeftPercent + '%' }"
                        ></div>

                        <!-- Milestone Bar -->
                        <div 
                          class="gantt-bar"
                          :class="getGanttBarColorClass(m)"
                          :style="getMilestoneGanttStyle(m, program, getGanttTimelineData(program))"
                          :title="`${m.judul_tahapan}\nTenggat: ${formatDate(m.target_selesai)}\nProgres: ${m.progress_percent}%`"
                        >
                          <!-- Progress Fill Fill -->
                          <div 
                            class="gantt-bar-fill" 
                            :style="{ width: m.progress_percent + '%' }"
                          ></div>
                          
                          <!-- Text inside Bar -->
                          <div class="gantt-bar-label text-truncate">
                            <span class="fw-bold">{{ m.progress_percent }}%</span>
                            <span class="ms-1.5 opacity-90 text-truncate d-none d-sm-inline">{{ m.judul_tahapan }}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- VIEW 2: DETAIL TABLE -->
            <div v-else class="table-responsive">
              <table class="table table-sm align-middle mb-0 bg-white table-milestone">
                <thead class="bg-slate-100 text-muted fs-xxs text-uppercase">
                  <tr>
                    <th style="width: 70px;" class="ps-3">Tahap</th>
                    <th style="min-width: 200px;">Uraian Target / Tahapan</th>
                    <th style="min-width: 120px;">Periode Bulan</th>
                    <th style="min-width: 140px;">Tenggat Waktu</th>
                    <th style="min-width: 220px;">Tim / Personil Terkait</th>
                    <th style="min-width: 140px;">Progres Capaian</th>
                    <th style="width: 70px;" class="text-center pe-3">Aksi</th>
                  </tr>
                </thead>
                <tbody class="fs-xs">
                  <tr v-for="m in program.milestones" :key="m.id" class="milestone-row">
                    <!-- Urutan -->
                    <td class="ps-3 fw-bold text-secondary">
                      <span class="milestone-step-badge">#{{ m.urutan }}</span>
                    </td>

                    <!-- Judul Tahapan -->
                    <td>
                      <div class="fw-bold text-dark">{{ m.judul_tahapan }}</div>
                      <div v-if="m.indikator_keberhasilan" class="text-muted fs-xxs">
                        <i class="fas fa-bullseye me-1 opacity-50"></i>{{ m.indikator_keberhasilan }}
                      </div>
                    </td>

                    <!-- Periode Bulan -->
                    <td>
                      <span class="badge bg-light text-dark border fs-xxs">
                        <i class="far fa-calendar me-1 text-primary"></i>{{ formatMilestonePeriod(m) }}
                      </span>
                    </td>

                    <!-- Tenggat Waktu -->
                    <td>
                      <div class="fw-semibold" :class="isOverdue(m) ? 'text-danger' : 'text-dark'">
                        {{ formatDate(m.target_selesai) }}
                      </div>
                      <div class="fs-xxs">
                        <span v-if="m.status === 'completed'" class="text-success fw-bold">
                          <i class="fas fa-check-double me-1"></i>Selesai
                        </span>
                        <span v-else-if="isOverdue(m)" class="text-danger fw-bold">
                          <i class="fas fa-exclamation-circle me-1"></i>Lewat Deadline
                        </span>
                        <span v-else class="text-muted">
                          {{ getDaysRemaining(m.target_selesai) }}
                        </span>
                      </div>
                    </td>

                    <!-- Tim / Personil Terkait -->
                    <td>
                      <div v-if="m.assignees && m.assignees.length > 0" class="d-flex flex-wrap align-items-center gap-1">
                        <span 
                          v-for="a in m.assignees" 
                          :key="a.id"
                          class="badge fs-xxs fw-semibold border"
                          :class="a.peran === 'koordinator' ? 'bg-amber-subtle text-amber-dark border-warning' : 'bg-light text-secondary'"
                          :title="a.peran === 'koordinator' ? 'Koordinator Tim' : 'Anggota Tim'"
                        >
                          <i v-if="a.peran === 'koordinator'" class="fas fa-crown text-warning me-1"></i>
                          {{ a.pegawai ? a.pegawai.nama : (a.team ? a.team.nama_tim : a.nik) }}
                        </span>
                        <button 
                          type="button"
                          class="btn btn-link text-primary p-0 ms-1 fs-xxs text-decoration-none"
                          @click="openModalEditMilestone(m, program)"
                          title="Edit Penugasan Tim"
                        >
                          <i class="fas fa-pen fs-xxs"></i>
                        </button>
                      </div>
                      <a 
                        v-else 
                        href="javascript:void(0)" 
                        class="text-primary text-decoration-none fs-xxs fw-medium d-inline-flex align-items-center gap-1"
                        @click="openModalEditMilestone(m, program)"
                        title="Klik untuk menugaskan tim"
                      >
                        <i class="fas fa-user-plus"></i> + Tugaskan Tim
                      </a>
                    </td>

                    <!-- Progres Capaian -->
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1 progress-thin">
                          <div 
                            class="progress-bar" 
                            :class="getProgressBarClass(m.progress_percent)" 
                            :style="{ width: m.progress_percent + '%' }"
                          ></div>
                        </div>
                        <span class="fw-bold fs-xxs text-dark" style="min-width: 32px;">
                          {{ m.progress_percent }}%
                        </span>
                      </div>
                    </td>

                    <!-- Aksi Cepat: Single Kebab Dropdown -->
                    <td class="text-center pe-3">
                      <div class="dropdown" @click.stop>
                        <button 
                          type="button" 
                          class="btn-table-kebab text-slate-500" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                          title="Menu Aksi Tahapan"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-lg fs-xs py-1 border-slate-200" style="min-width: 180px; z-index: 1060;">
                          <li>
                            <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="openModalUpdateProgress(m)">
                              <i class="fas fa-tasks text-primary" style="width: 14px;"></i>
                              <span>Update Progres & Catatan</span>
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="openModalEditMilestone(m, program)">
                              <i class="fas fa-edit text-warning" style="width: 14px;"></i>
                              <span>Edit Tahapan & Tanggal</span>
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item py-1.5 d-flex align-items-center gap-2" href="javascript:void(0)" @click="handleSendWhatsApp(m)">
                              <i class="fab fa-whatsapp text-success" style="width: 14px;"></i>
                              <span>Kirim Pengingat WA</span>
                            </a>
                          </li>
                          <li><hr class="dropdown-divider my-1"></li>
                          <li>
                            <a class="dropdown-item py-1.5 d-flex align-items-center gap-2 text-danger" href="javascript:void(0)" @click="handleDeleteMilestone(m)">
                              <i class="far fa-trash-alt" style="width: 14px;"></i>
                              <span>Hapus Tahapan</span>
                            </a>
                          </li>
                        </ul>
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

    <!-- MODAL 1: Buat / Edit Program -->
    <div class="modal fade" id="modalProgram" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-visible">
          <!-- Clean Modal Header -->
          <div class="modal-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between rounded-top-4">
            <div class="d-flex align-items-center gap-2.5">
              <div class="modal-header-icon bg-primary-subtle text-primary">
                <i class="fas fa-bullseye"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark fs-6 mb-0">
                  {{ modalProgramMode === 'add' ? 'Buat Target Program Kerja Baru' : 'Edit Target Program Kerja' }}
                </h6>
                <p class="text-muted fs-xxs mb-0">
                  {{ modalProgramMode === 'add' ? 'Tentukan sasaran inisiatif, PIC, jadwal target, dan tahapan milestone' : 'Perbarui detail target program kerja' }}
                </p>
              </div>
            </div>
            <button type="button" class="btn-close modal-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <form @submit.prevent="saveProgram">
            <div class="modal-body p-4">
              <!-- Section A: Identitas Program -->
              <div class="form-section-label mb-2.5">
                <span class="badge bg-slate-100 text-secondary border fs-xxs fw-semibold me-1.5">1</span>
                <span>Informasi Dasar Program</span>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-8">
                  <label class="form-label-custom">Nama Program / Inisiatif <span class="text-danger">*</span></label>
                  <input 
                    v-model="formProgram.nama_program" 
                    type="text" 
                    class="form-control form-control-custom" 
                    placeholder="Contoh: Program Promosi & Branding Layanan 2026/2027"
                    required
                  >
                </div>

                <div class="col-md-4">
                  <label class="form-label-custom">Kategori <span class="text-danger">*</span></label>
                  <select v-model="formProgram.kategori" class="form-select form-select-custom" required>
                    <option value="" disabled>Pilih Kategori...</option>
                    <option value="Pemasaran & Promosi">Pemasaran & Promosi</option>
                    <option value="Akreditasi & Mutu">Akreditasi & Mutu</option>
                    <option value="Pelayanan Medis">Pelayanan Medis</option>
                    <option value="Keperawatan">Keperawatan</option>
                    <option value="Fasilitas & Sarpras">Fasilitas & Sarpras</option>
                    <option value="SDI & Diklat">SDI & Diklat</option>
                    <option value="IT & Digitalisasi">IT & Digitalisasi</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label-custom">Tahun Target <span class="text-danger">*</span></label>
                  <select v-model="formProgram.tahun" class="form-select form-select-custom" required>
                    <option :value="2026">2026</option>
                    <option :value="2027">2027</option>
                    <option :value="2028">2028</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label-custom">Unit / Bagian Penanggung Jawab</label>
                  <input 
                    v-model="formProgram.unit_pj" 
                    type="text" 
                    class="form-control form-control-custom" 
                    placeholder="Contoh: Humas & Pemasaran"
                  >
                </div>

                <div class="col-md-4">
                  <label class="form-label-custom">PIC Koordinator Utama</label>
                  <v-select
                    v-model="formProgram.pic_utama"
                    :options="listPegawai"
                    label="nama"
                    :reduce="p => p.nik"
                    :filter-by="filterPegawaiBy"
                    placeholder="Cari & pilih pegawai..."
                    class="v-select-custom"
                  >
                    <template #option="option">
                      <div class="d-flex flex-column py-0.5">
                        <span class="fw-semibold fs-xs text-dark">{{ option.nama }}</span>
                        <span class="fs-xxs text-muted font-monospace">{{ option.nik }} <span v-if="option.departemen">({{ option.departemen }})</span></span>
                      </div>
                    </template>
                    <template #selected-option="option">
                      <span class="fs-xs text-dark">{{ option.nama }}</span>
                    </template>
                    <template #no-options="{ search }">
                      <div class="text-muted p-2 fs-xxs text-center">
                        Tidak ditemukan pegawai dengan kata kunci "{{ search }}"
                      </div>
                    </template>
                  </v-select>
                </div>

                <!-- Anggota Tim Lainnya (Multi-Select) -->
                <div class="col-12">
                  <label class="form-label-custom">
                    <i class="fas fa-users text-primary me-1"></i> Anggota Tim Pelaksana / Kontributor (Bisa Pilih Banyak)
                  </label>
                  <v-select
                    v-model="formProgram.anggota_tim"
                    :options="listPegawai"
                    label="nama"
                    :reduce="p => p.nik"
                    :filter-by="filterPegawaiBy"
                    multiple
                    placeholder="Ketik nama/NIK untuk memilih anggota tim tambahan..."
                    class="v-select-custom"
                  >
                    <template #option="option">
                      <div class="d-flex flex-column py-0.5">
                        <span class="fw-semibold fs-xs text-dark">{{ option.nama }}</span>
                        <span class="fs-xxs text-muted font-monospace">{{ option.nik }} <span v-if="option.departemen">({{ option.departemen }})</span></span>
                      </div>
                    </template>
                    <template #selected-option="option">
                      <span class="fs-xxs text-dark fw-semibold">{{ option.nama }}</span>
                    </template>
                    <template #no-options="{ search }">
                      <div class="text-muted p-2 fs-xxs text-center">
                        Tidak ditemukan pegawai dengan kata kunci "{{ search }}"
                      </div>
                    </template>
                  </v-select>
                  <span class="fs-xxs text-muted mt-1 d-block">
                    Anggota tim yang ditugaskan akan terdaftar dalam program kerja dan dapat menerima pengingat target/WhatsApp.
                  </span>
                </div>
              </div>

              <!-- Section B: Rentang Waktu & Sasaran -->
              <div class="form-section-label mb-2.5">
                <span class="badge bg-slate-100 text-secondary border fs-xxs fw-semibold me-1.5">2</span>
                <span>Periode & Sasaran Strategis</span>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label-custom">Tanggal Mulai <span class="text-danger">*</span></label>
                  <input 
                    v-model="formProgram.tanggal_mulai" 
                    type="date" 
                    class="form-control form-control-custom" 
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label-custom">Target Tanggal Selesai <span class="text-danger">*</span></label>
                  <input 
                    v-model="formProgram.target_selesai" 
                    type="date" 
                    class="form-control form-control-custom" 
                    required
                  >
                </div>

                <div class="col-12">
                  <label class="form-label-custom">Deskripsi / Sasaran Strategis</label>
                  <textarea 
                    v-model="formProgram.deskripsi" 
                    class="form-control form-control-custom" 
                    rows="2" 
                    placeholder="Jelaskan sasaran utama, sasaran capaian, atau output program ini..."
                  ></textarea>
                </div>
              </div>

              <!-- Section C: Input Tahapan Awal (Hanya saat ADD) -->
              <div v-if="modalProgramMode === 'add'" class="pt-2">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="form-section-label mb-0">
                    <span class="badge bg-slate-100 text-secondary border fs-xxs fw-semibold me-1.5">3</span>
                    <span>Rencana Tahapan Milestone Awal (Opsional)</span>
                  </div>
                  <button 
                    type="button" 
                    class="btn btn-xs btn-outline-primary border-dashed rounded-2 px-2.5 py-1 fw-medium fs-xxs btn-add-milestone-compact" 
                    @click="addFormMilestoneRow"
                  >
                    <i class="fas fa-plus me-1"></i> Tambah Tahap
                  </button>
                </div>

                <div v-if="formProgram.milestones.length === 0" class="text-center py-3 bg-slate-50 border border-dashed rounded-3 fs-xxs text-muted">
                  <i class="fas fa-info-circle text-primary opacity-50 me-1"></i>
                  Belum ada tahapan ditambahkan. Anda juga dapat menambahkannya nanti setelah program disimpan.
                </div>

                <div 
                  v-for="(row, idx) in formProgram.milestones" 
                  :key="idx" 
                  class="milestone-form-card mb-2 p-2.5 rounded-3 border bg-slate-50"
                >
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center gap-1.5">
                      <span class="badge bg-white text-primary border border-primary-subtle fw-semibold fs-xxs px-2 py-0.5 rounded-pill">
                        Tahap {{ idx + 1 }}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-icon-delete text-danger p-0 fs-xxs text-decoration-none" 
                      @click="removeFormMilestoneRow(idx)"
                      title="Hapus Tahap"
                    >
                      <i class="far fa-trash-alt me-1"></i> Hapus
                    </button>
                  </div>
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="fs-xxs text-muted fw-semibold mb-0.5 d-block">Judul Tahapan</label>
                      <input 
                        v-model="row.judul_tahapan" 
                        type="text" 
                        class="form-control form-control-sm form-control-custom fs-xs" 
                        placeholder="Contoh: Tahap 1 - Riset Materi & Desain"
                        required
                      >
                    </div>
                    <div class="col-md-3">
                      <label class="fs-xxs text-muted fw-semibold mb-0.5 d-block">Bulan Mulai</label>
                      <input 
                        v-model="row.periode_bulan" 
                        type="month" 
                        class="form-control form-control-sm form-control-custom fs-xs" 
                        @change="syncRowMonthToDate(row)"
                        required
                      >
                    </div>
                    <div class="col-md-3">
                      <label class="fs-xxs text-muted fw-semibold mb-0.5 d-block">Tenggat Selesai</label>
                      <input 
                        v-model="row.target_selesai" 
                        type="date" 
                        class="form-control form-control-sm form-control-custom fs-xs" 
                        @change="syncRowDateToMonth(row)"
                        required
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Clean Compact Modal Footer -->
            <div class="modal-footer bg-slate-50 border-top px-4 py-2.5 d-flex justify-content-end gap-2 rounded-bottom-4">
              <button type="button" class="btn btn-sm btn-modal-cancel" data-bs-dismiss="modal">
                Batal
              </button>
              <button type="submit" class="btn btn-sm btn-modal-submit" :disabled="savingProgram">
                <i v-if="savingProgram" class="fas fa-spinner fa-spin me-1.5"></i>
                <i v-else class="fas fa-check me-1.5"></i>
                Simpan Program
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL 2: Tambah Tahapan Milestone Baru -->
    <div class="modal fade" id="modalMilestone" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-visible">
          <!-- Clean Modal Header -->
          <div class="modal-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between rounded-top-4">
            <div class="d-flex align-items-center gap-2.5">
              <div class="modal-header-icon bg-primary-subtle text-primary">
                <i class="fas fa-layer-group"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark fs-6 mb-0">{{ modalMilestoneMode === 'add' ? 'Tambah Tahapan Milestone' : 'Edit Tahapan & Penugasan Tim' }}</h6>
                <p class="text-muted fs-xxs mb-0">{{ modalMilestoneMode === 'add' ? 'Tambahkan target tahapan baru ke dalam program kerja' : 'Perbarui target bulan, tenggat selesai, indikator, dan personil terkait' }}</p>
              </div>
            </div>
            <button type="button" class="btn-close modal-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <form @submit.prevent="saveMilestone">
            <div class="modal-body p-4 overflow-visible">
              <div class="mb-3">
                <label class="form-label-custom">Program Terpilih</label>
                <input 
                  :value="activeProgram ? activeProgram.nama_program : ''" 
                  type="text" 
                  class="form-control form-control-custom bg-slate-50 text-muted" 
                  readonly
                >
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Judul Tahapan <span class="text-danger">*</span></label>
                <input 
                  v-model="formMilestone.judul_tahapan" 
                  type="text" 
                  class="form-control form-control-custom" 
                  placeholder="Contoh: Tahap 2 - Peluncuran Iklan & Event"
                  required
                >
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label-custom">Bulan Mulai <span class="text-danger">*</span></label>
                  <input 
                    v-model="formMilestone.periode_bulan" 
                    type="month" 
                    class="form-control form-control-custom" 
                    @change="syncFormMilestoneMonthToDate"
                    required
                  >
                </div>
                <div class="col-6">
                  <label class="form-label-custom">Tenggat Selesai <span class="text-danger">*</span></label>
                  <input 
                    v-model="formMilestone.target_selesai" 
                    type="date" 
                    class="form-control form-control-custom" 
                    @change="syncFormMilestoneDateToMonth"
                    required
                  >
                </div>
                <div class="col-12">
                  <span class="fs-xxs text-muted">
                    <i class="fas fa-info-circle text-primary me-1"></i>
                    Bila tahapan berlangsung beberapa bulan, atur <strong>Bulan Mulai</strong> dan tentukan <strong>Tenggat Selesai</strong> di bulan target akhir. Balok Gantt akan memanjang otomatis.
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Indikator Keberhasilan / Output</label>
                <textarea 
                  v-model="formMilestone.indikator_keberhasilan" 
                  class="form-control form-control-custom" 
                  rows="2" 
                  placeholder="Contoh: Konten terbit di 3 media, 100 brosur terdistribusi"
                ></textarea>
              </div>

              <!-- PIC Selection -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label-custom mb-0">Pilih Koordinator / PIC Tahap Ini</label>
                  <span v-if="programTeamMembers.length > 0 && !showAllPegawaiForMilestone" class="badge bg-primary-subtle text-primary border border-primary-subtle fs-xxs">
                    Tim Program ({{ programTeamMembers.length }} personil)
                  </span>
                </div>
                <v-select
                  v-model="formMilestone.pic_nik"
                  :options="milestoneMemberOptions"
                  label="nama"
                  :reduce="p => p.nik"
                  :filter-by="filterPegawaiBy"
                  placeholder="Cari & pilih koordinator dari tim program..."
                  class="v-select-custom"
                >
                  <template #option="option">
                    <div class="d-flex flex-column py-0.5">
                      <span class="fw-semibold fs-xs text-dark">{{ option.nama }}</span>
                      <span class="fs-xxs text-muted font-monospace">{{ option.nik }} <span v-if="option.departemen">({{ option.departemen }})</span></span>
                    </div>
                  </template>
                  <template #selected-option="option">
                    <span class="fs-xs text-dark">{{ option.nama }}</span>
                  </template>
                  <template #no-options="{ search }">
                    <div class="text-muted p-2 fs-xxs text-center">
                      Tidak ditemukan personil dengan kata kunci "{{ search }}"
                    </div>
                  </template>
                </v-select>
              </div>

              <!-- Anggota Tim Tahap (Multi-Select) -->
              <div class="mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label-custom mb-0">
                    <i class="fas fa-users text-primary me-1"></i> Anggota Tim Tambahan Tahap Ini (Opsional)
                  </label>
                  <a 
                    v-if="programTeamMembers.length > 0"
                    href="javascript:void(0)" 
                    class="fs-xxs text-primary text-decoration-none fw-medium"
                    @click="showAllPegawaiForMilestone = !showAllPegawaiForMilestone"
                    :title="showAllPegawaiForMilestone ? 'Batasi opsi hanya tim program' : 'Buka pencarian untuk seluruh pegawai rumah sakit'"
                  >
                    <i class="fas me-1" :class="showAllPegawaiForMilestone ? 'fa-filter' : 'fa-globe'"></i>
                    {{ showAllPegawaiForMilestone ? 'Hanya Tim Program' : 'Cari dari seluruh pegawai RS' }}
                  </a>
                </div>
                <v-select
                  v-model="formMilestone.anggota_tim"
                  :options="milestoneMemberOptions"
                  label="nama"
                  :reduce="p => p.nik"
                  :filter-by="filterPegawaiBy"
                  multiple
                  placeholder="Pilih anggota tim yang bertugas pada tahap ini..."
                  class="v-select-custom"
                >
                  <template #option="option">
                    <div class="d-flex flex-column py-0.5">
                      <span class="fw-semibold fs-xs text-dark">{{ option.nama }}</span>
                      <span class="fs-xxs text-muted font-monospace">{{ option.nik }} <span v-if="option.departemen">({{ option.departemen }})</span></span>
                    </div>
                  </template>
                  <template #selected-option="option">
                    <span class="fs-xxs text-dark fw-semibold">{{ option.nama }}</span>
                  </template>
                  <template #no-options="{ search }">
                    <div class="text-muted p-2 fs-xxs text-center">
                      Tidak ditemukan personil dengan kata kunci "{{ search }}"
                    </div>
                  </template>
                </v-select>
              </div>
            </div>

            <!-- Clean Compact Modal Footer -->
            <div class="modal-footer bg-slate-50 border-top px-4 py-2.5 d-flex justify-content-end gap-2 rounded-bottom-4">
              <button type="button" class="btn btn-sm btn-modal-cancel" data-bs-dismiss="modal">
                Batal
              </button>
              <button type="submit" class="btn btn-sm btn-modal-submit" :disabled="savingMilestone">
                <i v-if="savingMilestone" class="fas fa-spinner fa-spin me-1.5"></i>
                <i v-else class="fas fa-check me-1.5"></i>
                {{ modalMilestoneMode === 'add' ? 'Simpan Tahapan' : 'Perbarui Tahapan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL 3: Update Progres & Catatan -->
    <div class="modal fade" id="modalProgress" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Clean Modal Header -->
          <div class="modal-header bg-white border-bottom px-3.5 py-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-header-icon bg-emerald-subtle text-success" style="width: 32px; height: 32px; font-size: 0.85rem;">
                <i class="fas fa-tasks"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark fs-xs mb-0">Update Capaian Progres</h6>
                <p class="text-muted fs-xxs mb-0">Perbarui persentase dan catatan progres</p>
              </div>
            </div>
            <button type="button" class="btn-close modal-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <form @submit.prevent="saveProgress">
            <div class="modal-body p-3.5">
              <div class="mb-3">
                <div class="fw-bold text-dark fs-xs mb-0.5">
                  {{ activeMilestone ? activeMilestone.judul_tahapan : '' }}
                </div>
                <div class="text-muted fs-xxs">
                  <i class="far fa-calendar-alt me-1 text-primary"></i> Tenggat: {{ activeMilestone ? formatDate(activeMilestone.target_selesai) : '' }}
                </div>
              </div>

              <!-- Slider Progres -->
              <div class="mb-3 bg-slate-50 p-3 rounded-3 border text-center">
                <label class="form-label small fw-bold d-flex justify-content-between align-items-center mb-1.5">
                  <span class="fs-xs text-muted">Persentase Capaian:</span>
                  <span class="text-success fs-5 fw-bold">{{ formProgress.progress_percent }}%</span>
                </label>
                <input 
                  v-model.number="formProgress.progress_percent" 
                  type="range" 
                  class="form-range" 
                  min="0" 
                  max="100" 
                  step="5"
                >
                <div class="d-flex justify-content-between fs-xxs text-muted mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100% (Selesai)</span>
                </div>
              </div>

              <!-- Catatan Log -->
              <div class="mb-1">
                <label class="form-label-custom">Catatan Progres / Kendala</label>
                <textarea 
                  v-model="formProgress.catatan" 
                  class="form-control form-control-custom" 
                  rows="2" 
                  placeholder="Tulis ringkasan capaian atau kendala yang dihadapi..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer bg-slate-50 border-top px-3.5 py-2.5 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-sm btn-modal-cancel" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-sm btn-modal-submit bg-success border-success" :disabled="savingProgress">
                <i v-if="savingProgress" class="fas fa-spinner fa-spin me-1.5"></i>
                <i v-else class="fas fa-check me-1.5"></i>
                Simpan Progres
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import timelineService from '@/services/timelineService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()

// State
const loading = ref(false)
const programs = ref([])
const listPegawai = ref([])
const expandedProgramIds = ref([])

const summary = reactive({
  total: 0,
  on_track: 0,
  at_risk: 0,
  completed: 0
})

const filters = reactive({
  keyword: '',
  kategori: '',
  status: '',
  tahun: '2026'
})

// Modal Program
const modalProgramMode = ref('add')
let modalProgramInstance = null
const savingProgram = ref(false)
const formProgram = reactive({
  id: null,
  nama_program: '',
  kategori: '',
  tahun: 2026,
  deskripsi: '',
  unit_pj: '',
  pic_utama: '',
  anggota_tim: [],
  tanggal_mulai: '',
  target_selesai: '',
  milestones: []
})

// Modal Milestone
const activeProgram = ref(null)
let modalMilestoneInstance = null
const savingMilestone = ref(false)
const showAllPegawaiForMilestone = ref(false)
const formMilestone = reactive({
  judul_tahapan: '',
  periode_bulan: '',
  target_selesai: '',
  indikator_keberhasilan: '',
  pic_nik: '',
  anggota_tim: []
})

// Program Team Members pool (PIC + Anggota Tim yang didaftarkan saat buat program)
const programTeamMembers = computed(() => {
  if (!activeProgram.value) return []

  const members = []
  const seenNiks = new Set()

  // 1. PIC Utama Program
  if (activeProgram.value.pic && activeProgram.value.pic.nik) {
    members.push({
      nik: activeProgram.value.pic.nik,
      nama: activeProgram.value.pic.nama,
      departemen: 'PIC Utama Program'
    })
    seenNiks.add(activeProgram.value.pic.nik)
  } else if (activeProgram.value.pic_utama) {
    const found = listPegawai.value.find(p => p.nik === activeProgram.value.pic_utama)
    if (found) {
      members.push({
        nik: found.nik,
        nama: found.nama,
        departemen: found.departemen || 'PIC Utama Program'
      })
      seenNiks.add(found.nik)
    }
  }

  // 2. Program Assignees (Tim yang dimasukkan saat membuat target program)
  if (activeProgram.value.assignees && Array.isArray(activeProgram.value.assignees)) {
    activeProgram.value.assignees.forEach(a => {
      const nik = a.nik || (a.pegawai ? a.pegawai.nik : null)
      if (nik && !seenNiks.has(nik)) {
        seenNiks.add(nik)
        if (a.pegawai) {
          members.push({
            nik: a.pegawai.nik,
            nama: a.pegawai.nama,
            departemen: a.pegawai.departemen || 'Tim Program'
          })
        } else {
          const found = listPegawai.value.find(p => p.nik === nik)
          members.push({
            nik: nik,
            nama: found ? found.nama : (a.team ? a.team.nama_tim : nik),
            departemen: found ? found.departemen : 'Tim Program'
          })
        }
      }
    })
  }

  return members
})

// Options for Milestone Select: default to program team, fallback or toggle to all employees
const milestoneMemberOptions = computed(() => {
  if (showAllPegawaiForMilestone.value || programTeamMembers.value.length === 0) {
    return listPegawai.value
  }
  return programTeamMembers.value
})

// Modal Progress
const activeMilestone = ref(null)
let modalProgressInstance = null
const savingProgress = ref(false)
const formProgress = reactive({
  progress_percent: 0,
  catatan: ''
})

// Accordion Expand Helper
const isExpanded = (id) => expandedProgramIds.value.includes(id)
const toggleExpand = (id) => {
  const index = expandedProgramIds.value.indexOf(id)
  if (index > -1) {
    expandedProgramIds.value.splice(index, 1)
  } else {
    expandedProgramIds.value.push(id)
  }
}

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await timelineService.getPrograms(filters)
    if (res.data.success) {
      programs.value = res.data.data || []
      Object.assign(summary, res.data.summary || {})

      // Auto expand first 3 programs by default
      if (expandedProgramIds.value.length === 0 && programs.value.length > 0) {
        expandedProgramIds.value = programs.value.slice(0, 3).map(p => p.id)
      }
    }
  } catch (error) {
    console.error('Error fetching timeline programs', error)
    toast.error('Gagal mengambil data timeline program')
  } finally {
    loading.value = false
  }
}

const fetchPegawai = async () => {
  try {
    const res = await timelineService.searchPegawai('')
    if (res.data && res.data.success) {
      listPegawai.value = res.data.data || []
    }
  } catch (e) {
    console.error('Failed to load pegawai', e)
  }
}

const filterPegawaiBy = (option, label, search) => {
  const q = (search || '').toLowerCase().trim()
  if (!q) return true
  const nama = (option.nama || '').toLowerCase()
  const nik = (option.nik || '').toLowerCase()
  const dept = (option.departemen || '').toLowerCase()
  return nama.includes(q) || nik.includes(q) || dept.includes(q)
}

const resetFilters = () => {
  filters.keyword = ''
  filters.kategori = ''
  filters.status = ''
  filters.tahun = ''
  fetchData()
}

// Modal Program Methods
const openModalProgram = (mode, item = null) => {
  fetchPegawai()
  modalProgramMode.value = mode
  if (mode === 'add') {
    Object.assign(formProgram, {
      id: null,
      nama_program: '',
      kategori: '',
      tahun: 2026,
      deskripsi: '',
      unit_pj: '',
      pic_utama: '',
      anggota_tim: [],
      tanggal_mulai: new Date().toISOString().split('T')[0],
      target_selesai: '',
      milestones: [
        { judul_tahapan: 'Tahap 1 - Persiapan & Riset', periode_bulan: '2026-12', target_selesai: '2026-12-31' },
        { judul_tahapan: 'Tahap 2 - Eksekusi & Sosialisasi', periode_bulan: '2027-01', target_selesai: '2027-01-31' }
      ]
    })
  } else if (mode === 'edit' && item) {
    Object.assign(formProgram, {
      id: item.id,
      nama_program: item.nama_program,
      kategori: item.kategori,
      tahun: item.tahun,
      deskripsi: item.deskripsi,
      unit_pj: item.unit_pj,
      pic_utama: item.pic_utama,
      anggota_tim: item.assignees ? item.assignees.map(a => a.nik) : [],
      tanggal_mulai: item.tanggal_mulai,
      target_selesai: item.target_selesai,
      milestones: []
    })
  }

  if (!modalProgramInstance) {
    modalProgramInstance = new window.bootstrap.Modal(document.getElementById('modalProgram'))
  }
  modalProgramInstance.show()
}

const addFormMilestoneRow = () => {
  const nextNum = formProgram.milestones.length + 1
  formProgram.milestones.push({
    judul_tahapan: `Tahap ${nextNum}`,
    periode_bulan: '',
    target_selesai: ''
  })
}

const removeFormMilestoneRow = (index) => {
  formProgram.milestones.splice(index, 1)
}

const saveProgram = async () => {
  savingProgram.value = true
  try {
    let res
    if (modalProgramMode.value === 'add') {
      res = await timelineService.createProgram(formProgram)
    } else {
      res = await timelineService.updateProgram(formProgram.id, formProgram)
    }

    if (res.data.success) {
      toast.success(res.data.message || 'Program berhasil disimpan')
      modalProgramInstance.hide()
      fetchData()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan program')
  } finally {
    savingProgram.value = false
  }
}

const handleDeleteProgram = (program) => {
  Swal.fire({
    title: 'Hapus Program Ini?',
    text: `Anda akan menghapus "${program.nama_program}" beserta seluruh tahapannya.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await timelineService.deleteProgram(program.id)
        if (res.data.success) {
          toast.success(res.data.message)
          fetchData()
        }
      } catch (error) {
        toast.error('Gagal menghapus program')
      }
    }
  })
}

// Modal Milestone Methods
const modalMilestoneMode = ref('add')
const editingMilestoneId = ref(null)

const openModalAddMilestone = (program) => {
  fetchPegawai()
  showAllPegawaiForMilestone.value = false
  modalMilestoneMode.value = 'add'
  editingMilestoneId.value = null
  activeProgram.value = program
  Object.assign(formMilestone, {
    judul_tahapan: `Tahap ${(program.milestones ? program.milestones.length : 0) + 1}`,
    periode_bulan: '',
    target_selesai: '',
    indikator_keberhasilan: '',
    pic_nik: program.pic_utama || '',
    anggota_tim: program.assignees ? program.assignees.map(a => a.nik) : []
  })

  if (!modalMilestoneInstance) {
    modalMilestoneInstance = new window.bootstrap.Modal(document.getElementById('modalMilestone'))
  }
  modalMilestoneInstance.show()
}

const openModalEditMilestone = (milestone, program) => {
  fetchPegawai()
  showAllPegawaiForMilestone.value = false
  modalMilestoneMode.value = 'edit'
  editingMilestoneId.value = milestone.id
  activeProgram.value = program

  // Find coordinator and team members from milestone.assignees
  let picNik = ''
  const anggotaList = []

  if (milestone.assignees && Array.isArray(milestone.assignees)) {
    milestone.assignees.forEach(a => {
      if (a.peran === 'koordinator') {
        picNik = a.nik
      } else {
        if (a.nik) anggotaList.push(a.nik)
      }
    })
  }

  // Fallback to program PIC if milestone has no coordinator set
  if (!picNik && program && program.pic_utama) {
    picNik = program.pic_utama
  }

  Object.assign(formMilestone, {
    judul_tahapan: milestone.judul_tahapan || '',
    periode_bulan: milestone.periode_bulan || '',
    target_selesai: milestone.target_selesai || '',
    indikator_keberhasilan: milestone.indikator_keberhasilan || '',
    pic_nik: picNik,
    anggota_tim: anggotaList
  })

  if (!modalMilestoneInstance) {
    modalMilestoneInstance = new window.bootstrap.Modal(document.getElementById('modalMilestone'))
  }
  modalMilestoneInstance.show()
}

const saveMilestone = async () => {
  if (!activeProgram.value) return
  savingMilestone.value = true
  try {
    const assigneesList = []
    if (formMilestone.pic_nik) {
      assigneesList.push({ nik: formMilestone.pic_nik, peran: 'koordinator' })
    }
    if (formMilestone.anggota_tim && Array.isArray(formMilestone.anggota_tim)) {
      formMilestone.anggota_tim.forEach(nik => {
        if (nik && nik !== formMilestone.pic_nik) {
          assigneesList.push({ nik, peran: 'anggota' })
        }
      })
    }

    const payload = {
      judul_tahapan: formMilestone.judul_tahapan,
      periode_bulan: formMilestone.periode_bulan,
      target_selesai: formMilestone.target_selesai,
      indikator_keberhasilan: formMilestone.indikator_keberhasilan,
      pic_nik: formMilestone.pic_nik,
      anggota_tim: formMilestone.anggota_tim,
      assignees: assigneesList
    }

    let res
    if (modalMilestoneMode.value === 'edit' && editingMilestoneId.value) {
      res = await timelineService.updateMilestone(editingMilestoneId.value, payload)
    } else {
      res = await timelineService.addMilestone(activeProgram.value.id, payload)
    }

    if (res.data.success) {
      toast.success(res.data.message)
      modalMilestoneInstance.hide()
      fetchData()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan tahapan')
  } finally {
    savingMilestone.value = false
  }
}

const handleDeleteMilestone = (milestone) => {
  Swal.fire({
    title: 'Hapus Tahapan Ini?',
    text: `Tahapan "${milestone.judul_tahapan}" dan seluruh penugasan tim di dalamnya akan dihapus.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await timelineService.deleteMilestone(milestone.id)
        if (res.data.success) {
          toast.success(res.data.message)
          fetchData()
        }
      } catch (error) {
        toast.error('Gagal menghapus tahapan')
      }
    }
  })
}

// Modal Progress Methods
const openModalUpdateProgress = (milestone) => {
  activeMilestone.value = milestone
  formProgress.progress_percent = milestone.progress_percent || 0
  formProgress.catatan = ''

  if (!modalProgressInstance) {
    modalProgressInstance = new window.bootstrap.Modal(document.getElementById('modalProgress'))
  }
  modalProgressInstance.show()
}

const saveProgress = async () => {
  if (!activeMilestone.value) return
  savingProgress.value = true
  try {
    const res = await timelineService.updateMilestoneProgress(activeMilestone.value.id, formProgress)
    if (res.data.success) {
      toast.success(res.data.message)
      modalProgressInstance.hide()
      fetchData()
    }
  } catch (error) {
    toast.error('Gagal memperbarui progres')
  } finally {
    savingProgress.value = false
  }
}

// WhatsApp Manual Trigger
const handleSendWhatsApp = (milestone) => {
  Swal.fire({
    title: 'Kirim Pengingat WhatsApp?',
    text: `Pesan pengingat akan dikirimkan ke PIC Utama dan seluruh anggota tim program kerja untuk tahapan: "${milestone.judul_tahapan}".`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    confirmButtonText: 'Ya, Kirim Sekarang!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await timelineService.sendNotification(milestone.id)
        if (res.data.success) {
          toast.success(res.data.message)
        } else {
          toast.warning(res.data.message)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi WhatsApp')
      }
    }
  })
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonth = (periodStr) => {
  if (!periodStr) return '-'
  const parts = periodStr.split('-')
  if (parts.length < 2) return periodStr
  const year = parts[0]
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const monthIdx = parseInt(parts[1], 10) - 1
  return `${monthNames[monthIdx] || parts[1]} ${year}`
}

const formatMilestonePeriod = (m) => {
  if (!m.periode_bulan && !m.target_selesai) return '-'
  const startPeriod = m.periode_bulan || (m.tanggal_mulai ? m.tanggal_mulai.substring(0, 7) : null)
  const endPeriod = m.target_selesai ? m.target_selesai.substring(0, 7) : null

  if (startPeriod && endPeriod && startPeriod !== endPeriod) {
    const sParts = startPeriod.split('-')
    const eParts = endPeriod.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const sName = monthNames[parseInt(sParts[1], 10) - 1] || sParts[1]
    const eName = monthNames[parseInt(eParts[1], 10) - 1] || eParts[1]

    if (sParts[0] === eParts[0]) {
      return `${sName} - ${eName} ${sParts[0]}`
    }
    return `${sName} ${sParts[0]} - ${eName} ${eParts[0]}`
  }
  return formatMonth(startPeriod || endPeriod)
}

const isOverdue = (milestone) => {
  if (milestone.status === 'completed') return false
  const deadline = new Date(milestone.target_selesai)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return deadline < today
}

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return ''
  const deadline = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = deadline - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hari ini'
  if (diffDays > 0) return `Sisa ${diffDays} hari`
  return `Lewat ${Math.abs(diffDays)} hari`
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed': return 'badge-status-completed'
    case 'in_progress': return 'badge-status-inprogress'
    case 'delayed': return 'badge-status-delayed'
    case 'cancelled': return 'badge-status-cancelled'
    default: return 'badge-status-draft'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'in_progress': return 'Sedang Berjalan'
    case 'delayed': return 'Tertunda'
    case 'cancelled': return 'Dibatalkan'
    default: return 'Draft'
  }
}

const getProgressBarClass = (percent) => {
  if (percent >= 100) return 'bg-success'
  if (percent >= 50) return 'bg-primary'
  if (percent > 0) return 'bg-warning'
  return 'bg-secondary'
}

// Gantt Chart State & View Mode
const programViewModes = ref({})

const getProgramViewMode = (programId) => {
  return programViewModes.value[programId] || 'gantt' // Default to visual Gantt view
}

const setProgramViewMode = (programId, mode) => {
  programViewModes.value[programId] = mode
}

// Gantt Timeline calculation
// Safe date parser
const parseValidDate = (str) => {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

// Smart Normalizer for milestone start & end dates (Supports waterfall chaining from previous stage)
const getMilestoneNormalizedDates = (milestone, program) => {
  let endDate = parseValidDate(milestone.target_selesai)
  if (endDate) {
    endDate.setHours(23, 59, 59, 999)
  }

  // Cari target selesai tahapan sebelumnya dalam program yang sama
  let prevEndDate = null
  if (program && program.milestones && Array.isArray(program.milestones)) {
    const sorted = [...program.milestones].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
    const idx = sorted.findIndex(item => item.id === milestone.id)
    if (idx > 0 && sorted[idx - 1].target_selesai) {
      prevEndDate = parseValidDate(sorted[idx - 1].target_selesai)
      if (prevEndDate) {
        prevEndDate.setHours(0, 0, 0, 0)
      }
    }
  }

  let startDate = null

  // 1. Tentukan tanggal mulai berdasarkan periode_bulan & tahapan sebelumnya
  if (milestone.periode_bulan) {
    const parts = milestone.periode_bulan.split('-')
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10)
      const mo = parseInt(parts[1], 10) - 1
      if (!isNaN(y) && !isNaN(mo)) {
        const monthStart = new Date(y, mo, 1, 0, 0, 0)
        const monthEnd = new Date(y, mo + 1, 0, 23, 59, 59, 999)

        // Jika tahapan sebelumnya selesai di bulan yang sama dan sebelum endDate:
        // Sambungkan mulai tahapan ini tepat setelah tahapan sebelumnya selesai (tanpa overlap/gap)!
        if (prevEndDate && prevEndDate >= monthStart && prevEndDate <= monthEnd && (!endDate || prevEndDate < endDate)) {
          startDate = new Date(prevEndDate.getTime())
        } else if (prevEndDate && prevEndDate > monthEnd && (!endDate || prevEndDate < endDate)) {
          startDate = new Date(prevEndDate.getTime())
        } else {
          startDate = monthStart
        }
      }
    }
  }

  // 2. Fallback jika periode_bulan belum terisi: gunakan prevEndDate
  if (!startDate) {
    if (prevEndDate && (!endDate || prevEndDate < endDate)) {
      startDate = new Date(prevEndDate.getTime())
    } else if (endDate) {
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1, 0, 0, 0)
    } else if (program && program.tanggal_mulai) {
      startDate = parseValidDate(program.tanggal_mulai) || new Date()
    } else {
      startDate = new Date()
    }
  }

  // Jika start date setelah end date, sesuaikan
  if (startDate && endDate && startDate > endDate) {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1, 0, 0, 0)
  }

  if (!endDate) {
    endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  return { startDate, endDate }
}

// Gantt Timeline calculation
const getGanttTimelineData = (program) => {
  if (!program.milestones || program.milestones.length === 0) {
    return { months: [], startMs: 0, endMs: 0, totalMs: 1, todayLeftPercent: -1 }
  }

  let minDate = parseValidDate(program.tanggal_mulai)
  let maxDate = parseValidDate(program.target_selesai)

  program.milestones.forEach((m) => {
    const { startDate, endDate } = getMilestoneNormalizedDates(m, program)
    if (!minDate || startDate < minDate) minDate = startDate
    if (!maxDate || endDate > maxDate) maxDate = endDate
  })

  if (!minDate) minDate = new Date()
  if (!maxDate) maxDate = new Date(minDate.getTime() + 90 * 24 * 60 * 60 * 1000)

  // Align start to 1st of month and end to last of month
  const timelineStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1, 0, 0, 0)
  const timelineEndDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0, 23, 59, 59, 999)

  const startMs = timelineStartDate.getTime()
  const endMs = timelineEndDate.getTime()
  const totalMs = Math.max(endMs - startMs, 86400000)

  // Month header columns
  const months = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  let cur = new Date(timelineStartDate.getFullYear(), timelineStartDate.getMonth(), 1)
  let guardCount = 0
  while (cur <= timelineEndDate && guardCount < 60) {
    guardCount++
    const y = cur.getFullYear()
    const mo = cur.getMonth()
    months.push({
      key: `${y}-${String(mo + 1).padStart(2, '0')}`,
      label: `${monthNames[mo]} ${y}`,
      year: y,
      month: mo
    })
    cur = new Date(y, mo + 1, 1)
  }

  // Today marker
  const today = new Date()
  let todayLeftPercent = -1
  if (today >= timelineStartDate && today <= timelineEndDate) {
    todayLeftPercent = Math.max(0, Math.min(100, ((today.getTime() - startMs) / totalMs) * 100))
  }

  return {
    months,
    startMs,
    endMs,
    totalMs,
    todayLeftPercent
  }
}

const getMilestoneGanttStyle = (milestone, program, timelineData) => {
  if (!timelineData || timelineData.totalMs <= 0) return { left: '0%', width: '0%' }

  const { startDate, endDate } = getMilestoneNormalizedDates(milestone, program)
  const mStartMs = startDate.getTime()
  const mEndMs = endDate.getTime()

  let leftPercent = ((mStartMs - timelineData.startMs) / timelineData.totalMs) * 100
  let widthPercent = ((mEndMs - mStartMs) / timelineData.totalMs) * 100

  leftPercent = Math.max(0, Math.min(96, leftPercent))
  widthPercent = Math.max(4, Math.min(100 - leftPercent, widthPercent))

  return {
    left: `${leftPercent.toFixed(2)}%`,
    width: `${widthPercent.toFixed(2)}%`
  }
}

// Auto-sync Helpers for Modal Inputs (Supports multi-month milestones)
const syncRowMonthToDate = (row) => {
  if (row.periode_bulan) {
    const parts = row.periode_bulan.split('-')
    if (parts.length === 2) {
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10)
      const lastDay = new Date(y, m, 0).getDate()
      const startMonthDate = `${parts[0]}-${parts[1]}-01`
      const endMonthDate = `${parts[0]}-${parts[1]}-${String(lastDay).padStart(2, '0')}`
      // Only set default if target_selesai is empty or earlier than the start month
      if (!row.target_selesai || row.target_selesai < startMonthDate) {
        row.target_selesai = endMonthDate
      }
    }
  }
}

const syncRowDateToMonth = (row) => {
  if (row.target_selesai && !row.periode_bulan) {
    row.periode_bulan = row.target_selesai.substring(0, 7)
  } else if (row.target_selesai && row.periode_bulan) {
    // If target_selesai is earlier than start month, adjust start month to match
    if (row.target_selesai.substring(0, 7) < row.periode_bulan) {
      row.periode_bulan = row.target_selesai.substring(0, 7)
    }
  }
}

const syncFormMilestoneMonthToDate = () => {
  if (formMilestone.periode_bulan) {
    const parts = formMilestone.periode_bulan.split('-')
    if (parts.length === 2) {
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10)
      const lastDay = new Date(y, m, 0).getDate()
      const startMonthDate = `${parts[0]}-${parts[1]}-01`
      const endMonthDate = `${parts[0]}-${parts[1]}-${String(lastDay).padStart(2, '0')}`
      // Only set default if target_selesai is empty or earlier than the start month
      if (!formMilestone.target_selesai || formMilestone.target_selesai < startMonthDate) {
        formMilestone.target_selesai = endMonthDate
      }
    }
  }
}

const syncFormMilestoneDateToMonth = () => {
  if (formMilestone.target_selesai && !formMilestone.periode_bulan) {
    formMilestone.periode_bulan = formMilestone.target_selesai.substring(0, 7)
  } else if (formMilestone.target_selesai && formMilestone.periode_bulan) {
    // If target_selesai is earlier than start month, adjust start month to match
    if (formMilestone.target_selesai.substring(0, 7) < formMilestone.periode_bulan) {
      formMilestone.periode_bulan = formMilestone.target_selesai.substring(0, 7)
    }
  }
}

const getGanttBarColorClass = (milestone) => {
  if (milestone.status === 'completed' || milestone.progress_percent >= 100) return 'gantt-bar-success'
  if (isOverdue(milestone)) return 'gantt-bar-danger'
  if (milestone.progress_percent > 0) return 'gantt-bar-info'
  return 'gantt-bar-primary'
}

onMounted(() => {
  fetchData()
  fetchPegawai()
})
</script>

<style scoped>
.timeline-program-wrapper {
  padding: 1.5rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* Prevent global main.css .btn { width: 100% } from expanding buttons */
.timeline-program-wrapper .btn,
.modal .btn {
  width: auto !important;
  max-width: fit-content;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
}

.btn-compact-add {
  height: 34px;
  font-size: 0.8rem;
  border-radius: 8px !important;
  padding: 0 1rem !important;
  width: auto !important;
}

.empty-icon-circle {
  width: 52px;
  height: 52px;
  background-color: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-add-btn {
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0 1.25rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}
.premium-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

/* Mini Stat Cards */
.mini-stat-card {
  transition: all 0.2s ease;
}
.mini-stat-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

/* Filter Toolbar */
.filter-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
}
.filter-search-box {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  flex-grow: 1;
}
.filter-search-box .search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}
.filter-input {
  height: 38px;
  border-radius: 10px;
  padding-left: 2.35rem;
  padding-right: 2.2rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}
.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}
.btn-clear-search:hover { color: #64748b; }

.filter-select {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  width: auto;
  min-width: 150px;
}
.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.filter-select-sm {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  width: auto;
  min-width: 90px;
}

.filter-reset-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0 0.85rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
}
.filter-reset-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.filter-refresh-btn {
  height: 38px;
  border-radius: 10px;
  border-color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  display: inline-flex;
  align-items: center;
}
.filter-refresh-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

/* ============================================
   PROGRAM CARDS & CLEAN HEADER TONE
   ============================================ */
.timeline-program-wrapper .program-card {
  background-color: #ffffff !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
  overflow: visible !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.timeline-program-wrapper .program-card:hover {
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05) !important;
}

/* Card Header Overrides */
.timeline-program-wrapper .program-card-header {
  background-color: #ffffff !important;
  background: #ffffff !important;
  border-bottom: 1px solid #f1f5f9 !important;
  padding: 1rem 1.25rem !important;
  text-align: left !important;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.timeline-program-wrapper .program-card:not(.is-expanded) .program-card-header {
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  border-bottom: none !important;
}

.timeline-program-wrapper .dropdown-menu {
  z-index: 1050 !important;
  min-width: 175px !important;
  border-radius: 10px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08) !important;
}

/* Expand / Collapse Button */
.btn-expand-program {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  background: #f8fafc !important;
  color: #64748b !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.btn-expand-program:hover {
  background-color: #f1f5f9 !important;
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}

.btn-expand-program.expanded {
  background-color: #eff6ff !important;
  background: #eff6ff !important;
  border-color: #bfdbfe !important;
  color: #2563eb !important;
}

.btn-expand-program .chevron-icon {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

/* Clean Badges */
.clean-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  line-height: 1;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
}

.clean-badge.badge-code {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.clean-badge.badge-category {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #dbeafe;
  font-weight: 600;
}

.clean-badge.badge-unit {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Clean Status Badges */
.clean-badge.badge-status {
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
}

.badge-status-inprogress {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.badge-status-inprogress .status-dot {
  background-color: #3b82f6;
}

.badge-status-completed {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.badge-status-completed .status-dot {
  background-color: #10b981;
}

.badge-status-delayed {
  background-color: #fff1f2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
}
.badge-status-delayed .status-dot {
  background-color: #ef4444;
}

.badge-status-cancelled {
  background-color: #f8fafc;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}
.badge-status-cancelled .status-dot {
  background-color: #cbd5e1;
}

.badge-status-draft {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.badge-status-draft .status-dot {
  background-color: #94a3b8;
}

/* Program Title */
.program-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  margin-bottom: 0.35rem;
  line-height: 1.35;
  cursor: pointer;
  transition: color 0.15s ease;
}

.program-title:hover {
  color: #2563eb;
}

/* Metadata Row */
.program-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 1rem;
  font-size: 0.78rem;
  color: #64748b;
}

.program-meta-item {
  display: inline-flex;
  align-items: center;
}

.program-meta-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  color: #475569;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 7px;
  border-radius: 5px;
  font-weight: 500;
}

/* Right Section: Progress & Action */
.program-progress-box {
  width: 140px;
  min-width: 120px;
}

.progress-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.progress-val {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
}

.clean-progress-track {
  height: 6px !important;
  background-color: #f1f5f9 !important;
  border-radius: 9999px !important;
  overflow: hidden !important;
  margin: 0 !important;
  box-shadow: none !important;
}

.btn-action-kebab {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff !important;
  background: #ffffff !important;
  color: #64748b !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-kebab:hover {
  background-color: #f8fafc !important;
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.milestone-step-badge {
  display: inline-block;
  padding: 2px 6px;
  background-color: #f1f5f9;
  border-radius: 4px;
  font-size: 0.75rem;
}

.table-milestone thead th {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.table-milestone tbody td {
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}
.milestone-row:hover {
  background-color: #fafbfc;
}
.milestone-row:has(.show),
.milestone-row:focus-within {
  position: relative;
  z-index: 20;
}

.btn-table-kebab {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-table-kebab:hover,
.btn-table-kebab:focus,
.btn-table-kebab.show {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

/* Icon Buttons */
.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
.btn-icon-sm {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* Modern Segmented Table Action Pill */
.table-action-pill {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2px 3px;
  gap: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.btn-table-action {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.15s ease;
  cursor: pointer;
  padding: 0;
}

.action-pill-divider {
  width: 1px;
  height: 14px;
  background: #e2e8f0;
  margin: 0 1px;
}

.btn-action-edit {
  color: #d97706;
}
.btn-action-edit:hover {
  background: #fef3c7;
  border-color: #fde68a;
  color: #b45309;
}

.btn-action-wa {
  color: #059669;
}
.btn-action-wa:hover {
  background: #d1fae5;
  border-color: #a7f3d0;
  color: #047857;
}

.btn-action-progress {
  color: #2563eb;
}
.btn-action-progress:hover {
  background: #dbeafe;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.btn-action-delete {
  color: #ef4444;
}
.btn-action-delete:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.transition-transform { transition: transform 0.2s ease-in-out; }
.rotate-90 { transform: rotate(90deg); }
.cursor-pointer { cursor: pointer; }

/* Modal Aesthetics & Compact Elements */
.modal-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.modal-close-btn {
  font-size: 0.75rem;
  padding: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.modal-close-btn:hover {
  opacity: 1;
}

.form-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-label-custom {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
  display: block;
}

.form-control-custom,
.form-select-custom {
  font-size: 0.825rem;
  border-radius: 8px;
  border-color: #cbd5e1;
  padding: 0.45rem 0.75rem;
  transition: all 0.15s ease;
}
.form-control-custom:focus,
.form-select-custom:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* v-select custom styling */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 1px 4px;
  background: white;
  min-height: 35px;
  font-size: 0.825rem;
  transition: all 0.15s ease;
}
.v-select-custom:focus-within :deep(.vs__dropdown-toggle) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.v-select-custom :deep(.vs__selected) {
  font-size: 0.825rem;
  color: #1e293b;
  margin: 3px 2px 0;
  padding: 0 4px;
}
.v-select-custom :deep(.vs__search) {
  font-size: 0.825rem;
  margin: 3px 0 0 4px;
  padding: 0;
}
.v-select-custom :deep(.vs__search::placeholder) {
  color: #94a3b8;
  font-size: 0.825rem;
}
.v-select-custom :deep(.vs__dropdown-menu) {
  font-size: 0.825rem;
  z-index: 1070;
  max-height: 250px;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
.v-select-custom :deep(.vs__dropdown-option--highlight) {
  background: #2563eb;
  color: white;
}
.v-select-custom :deep(.vs__dropdown-option) {
  padding: 6px 12px;
}
.v-select-custom :deep(.vs__clear) {
  fill: #94a3b8;
}

.milestone-form-card {
  transition: border-color 0.2s ease;
}
.milestone-form-card:hover {
  border-color: #cbd5e1 !important;
}

.btn-add-milestone-compact {
  height: 28px;
  display: inline-flex;
  align-items: center;
  width: auto !important;
}

.btn-icon-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  width: auto !important;
  opacity: 0.75;
  transition: opacity 0.15s;
}
.btn-icon-delete:hover {
  opacity: 1;
}

/* Modal Footer Buttons - Compact & Refined */
.modal-footer {
  border-top: 1px solid #f1f5f9;
}
.modal-footer .btn {
  height: 34px !important;
  font-size: 0.8125rem !important;
  padding: 0 1rem !important;
  width: auto !important;
  max-width: fit-content !important;
  border-radius: 8px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 500;
}

.btn-modal-cancel {
  background-color: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #64748b !important;
}
.btn-modal-cancel:hover {
  background-color: #f8fafc !important;
  color: #334155 !important;
  border-color: #94a3b8 !important;
}

.btn-modal-submit {
  background-color: #2563eb !important;
  border: 1px solid #2563eb !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2) !important;
}
.btn-modal-submit:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

/* ============================================
   GANTT CHART & TIMELINE STYLES
   ============================================ */
.view-mode-toggle {
  display: inline-flex;
}

.btn-toggle-active {
  background-color: #ffffff !important;
  color: #2563eb !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

.btn-toggle-inactive {
  background-color: transparent !important;
  color: #64748b !important;
  border: none !important;
}
.btn-toggle-inactive:hover {
  color: #1e293b !important;
}

.gantt-chart-container {
  width: 100%;
  background: #ffffff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  overflow: hidden;
}

.gantt-legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.gantt-legend-line-today {
  width: 14px;
  height: 2px;
  border-top: 2px dashed #ef4444;
  display: inline-block;
}

.gantt-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  position: relative;
}

.gantt-layout {
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 700px;
}

/* Header Row */
.gantt-header-row {
  display: flex;
  height: 38px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gantt-left-header {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  border-right: 1px solid #e2e8f0;
  background-color: #f8fafc;
  position: sticky;
  left: 0;
  z-index: 5;
}

.gantt-timeline-header {
  display: flex;
  flex-grow: 1;
}

.gantt-month-col-header {
  flex: 1 1 0;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e2e8f0;
  text-align: center;
  font-size: 0.72rem;
}

.gantt-today-header-marker {
  position: absolute;
  top: 6px;
  transform: translateX(-50%);
  z-index: 6;
  pointer-events: none;
}

.gantt-today-badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

/* Body Rows */
.gantt-body {
  position: relative;
}

.gantt-row {
  display: flex;
  height: 52px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.gantt-row:hover {
  background-color: #f8fafc;
}

.gantt-left-col {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  padding: 0 0.85rem;
  display: flex;
  align-items: center;
  border-right: 1px solid #e2e8f0;
  background-color: #ffffff;
  position: sticky;
  left: 0;
  z-index: 4;
}

.gantt-row:hover .gantt-left-col {
  background-color: #f8fafc;
}

/* Elevate active row stacking context so dropdown menu floats above sticky siblings */
.gantt-row:has(.show),
.gantt-row:focus-within {
  z-index: 20;
}
.gantt-row:has(.show) .gantt-left-col,
.gantt-row:focus-within .gantt-left-col {
  z-index: 20;
}

.btn-gantt-action {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-gantt-action:hover,
.btn-gantt-action:focus,
.btn-gantt-action.show {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.gantt-track-col {
  display: flex;
  flex-grow: 1;
  position: relative;
  align-items: center;
}

/* Grid lines background */
.gantt-grid-background {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  pointer-events: none;
}

.gantt-grid-col {
  flex: 1 1 0;
  min-width: 120px;
  border-right: 1px solid #f1f5f9;
  height: 100%;
}

/* Today vertical line */
.gantt-today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  border-left: 2px dashed #ef4444;
  z-index: 3;
  pointer-events: none;
}

/* Gantt Bar */
.gantt-bar {
  position: absolute;
  height: 30px;
  border-radius: 6px;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.gantt-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  opacity: 0.3;
}

.gantt-bar-label {
  position: relative;
  z-index: 3;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* Bar Colors */
.gantt-bar-primary {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}
.gantt-bar-primary .gantt-bar-fill {
  background-color: #3b82f6;
}

.gantt-bar-info {
  background-color: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0f766e;
}
.gantt-bar-info .gantt-bar-fill {
  background-color: #14b8a6;
}

.gantt-bar-success {
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}
.gantt-bar-success .gantt-bar-fill {
  background-color: #10b981;
}

.gantt-bar-danger {
  background-color: #fff1f2;
  border: 1px solid #fecdd3;
  color: #b91c1c;
}
.gantt-bar-danger .gantt-bar-fill {
  background-color: #ef4444;
}

/* Colors */
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-primary-subtle { background-color: #eff6ff !important; }
.bg-emerald-subtle { background-color: #ecfdf5 !important; }
.bg-amber-subtle { background-color: #fffbeb !important; }
.bg-cyan-subtle { background-color: #ecfeff !important; }
.bg-blue-subtle { background-color: #eff6ff !important; }
.text-cyan { color: #0891b2 !important; }
.text-amber-dark { color: #b45309 !important; }
.shadow-2xs { box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.fs-xs { font-size: 0.825rem !important; }
.fs-xxs { font-size: 0.7rem !important; }
</style>
