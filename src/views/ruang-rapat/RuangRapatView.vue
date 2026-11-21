<template>
  <div class="ruang-rapat-container">
    <!-- TOP HEADER BAR -->
    <header class="app-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="header-icon-box bg-primary text-white rounded-3 shadow-sm d-flex align-items-center justify-content-center">
              <i class="fas fa-building fa-lg"></i>
            </div>
            <div>
              <h4 class="fw-bold mb-0 text-dark">Manajemen & Reservasi Ruang Rapat</h4>
              <div class="text-muted small">
                Kalender terintegrasi surat undangan, kontrol okupansi live, dan display pintu RSIA.
              </div>
            </div>
          </div>
        </div>

        <!-- Right Quick Controls -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Live Room Pulse Badge -->
          <div class="live-pill px-3 py-2 rounded-pill bg-white border shadow-sm d-flex align-items-center gap-2 small">
            <span class="live-dot" :class="inUseRoomsCount > 0 ? 'bg-danger' : 'bg-success'"></span>
            <span class="fw-semibold text-dark">
              {{ availableRoomsCount }}/{{ rooms.length }} Ruangan Tersedia
            </span>
            <span class="text-muted opacity-50">|</span>
            <span class="text-muted font-monospace">{{ currentTime }}</span>
          </div>

          <button 
            type="button" 
            class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold shadow-sm"
            @click="refreshData"
            :disabled="loading"
            title="Muat Ulang Data"
          >
            <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
            <span>Refresh</span>
          </button>

          <button 
            v-if="activeTab === 'master'"
            type="button" 
            class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-2"
            @click="openRoomModal()"
          >
            <i class="fas fa-plus"></i>
            <span>Tambah Ruangan</span>
          </button>
        </div>
      </div>

      <!-- MAIN NAVIGATION PILLS -->
      <div class="mt-3">
        <div class="segmented-control p-1 bg-white border rounded-pill shadow-sm d-inline-flex">
          <button 
            type="button" 
            class="segment-btn rounded-pill px-4 py-2 small fw-bold"
            :class="{ active: activeTab === 'jadwal' }"
            @click="activeTab = 'jadwal'"
          >
            <i class="fas fa-calendar-alt me-2"></i> Okupansi & Timeline
          </button>
          <button 
            type="button" 
            class="segment-btn rounded-pill px-4 py-2 small fw-bold"
            :class="{ active: activeTab === 'master' }"
            @click="activeTab = 'master'"
          >
            <i class="fas fa-door-open me-2"></i> Master Ruang Rapat
            <span class="badge rounded-pill bg-light text-dark ms-1">{{ rooms.length }}</span>
          </button>
          <button 
            type="button" 
            class="segment-btn rounded-pill px-4 py-2 small fw-bold"
            :class="{ active: activeTab === 'signage' }"
            @click="activeTab = 'signage'"
          >
            <i class="fas fa-tv me-2"></i> Display Pintu (Signage)
          </button>
        </div>
      </div>
    </header>

    <!-- ======================================================== -->
    <!-- TAB 1: SPLIT-SCREEN WORKSPACE (CALENDAR & TIMELINE)     -->
    <!-- ======================================================== -->
    <main v-if="activeTab === 'jadwal'">
      <div class="row g-4 align-items-start">
        
        <!-- ======================================== -->
        <!-- LEFT PANEL: MINI CALENDAR & FILTERS      -->
        <!-- ======================================== -->
        <aside class="col-xl-3 col-lg-4">
          <div class="d-flex flex-column gap-3">
            
            <!-- 1. INTERACTIVE MINI MONTH CALENDAR -->
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div class="card-body p-3">
                <!-- Month Header Nav -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="fw-bold text-dark fs-6">
                    {{ currentCalMonthName }}
                  </span>
                  <div class="d-flex align-items-center gap-1">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-light rounded-circle icon-nav-btn"
                      @click="calPrevMonth"
                      title="Bulan Sebelumnya"
                    >
                      <i class="fas fa-chevron-left fa-xs"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-light rounded-pill px-2 py-0 small fw-semibold text-primary"
                      @click="calGoToToday"
                      title="Kembali ke Hari Ini"
                    >
                      Hari Ini
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-light rounded-circle icon-nav-btn"
                      @click="calNextMonth"
                      title="Bulan Berikutnya"
                    >
                      <i class="fas fa-chevron-right fa-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Days of Week Headers -->
                <div class="calendar-grid text-center small text-muted fw-semibold mb-1">
                  <div class="cal-header text-danger">Min</div>
                  <div class="cal-header">Sen</div>
                  <div class="cal-header">Sel</div>
                  <div class="cal-header">Rab</div>
                  <div class="cal-header">Kam</div>
                  <div class="cal-header">Jum</div>
                  <div class="cal-header">Sab</div>
                </div>

                <!-- Calendar Days Matrix -->
                <div class="calendar-grid text-center">
                  <div 
                    v-for="d in miniCalendarDays" 
                    :key="d.dateStr"
                    class="cal-day-cell position-relative"
                    :class="{
                      'diff-month': !d.isCurrentMonth,
                      'is-selected': d.isSelected,
                      'is-today': d.isToday,
                      'has-meetings': d.count > 0
                    }"
                    @click="onSelectDate(d.dateStr)"
                    :title="`${d.dateStr}: ${d.count} Rapat`"
                  >
                    <span class="day-number">{{ d.dayNum }}</span>
                    <!-- Meeting Dot Indicator -->
                    <span 
                      v-if="d.count > 0" 
                      class="meeting-dot" 
                      :class="d.isSelected ? 'bg-white' : 'bg-primary'"
                    ></span>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                  <span><i class="fas fa-circle text-primary fa-2xs me-1"></i> Ada Agenda Rapat</span>
                  <span class="badge bg-light text-dark font-monospace">{{ selectedMonthTotalMeetings }} Rapat Bulan Ini</span>
                </div>
              </div>
            </div>

            <!-- 2. QUICK DAY STATS SUMMARY -->
            <div class="card border-0 shadow-sm rounded-4 bg-gradient-blue text-white p-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div class="small text-white-50 text-uppercase fw-semibold">Agenda Terpilih</div>
                  <div class="fs-4 fw-bold font-monospace">{{ daySchedules.length }} <span class="fs-6 fw-normal text-white-70">Rapat</span></div>
                </div>
                <div class="p-2 bg-white bg-opacity-20 rounded-3">
                  <i class="fas fa-calendar-check fa-lg text-white"></i>
                </div>
              </div>
              <div class="small text-white-80 border-top border-white-20 pt-2 d-flex justify-content-between">
                <span>{{ formatSelectedDateHumanShort }}</span>
                <span class="fw-bold">{{ isViewingToday ? 'Hari Ini' : '' }}</span>
              </div>
            </div>

            <!-- 3. ROOM FILTER ACCORDION / PILLS -->
            <div class="card border-0 shadow-sm rounded-4 bg-white p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small fw-bold text-dark text-uppercase">
                  <i class="fas fa-filter text-primary me-1"></i> Ruang Rapat
                </span>
                <button 
                  type="button" 
                  class="btn btn-link p-0 small text-decoration-none fw-semibold"
                  @click="filterRuangId = 'all'"
                >
                  Semua ({{ rooms.length }})
                </button>
              </div>

              <div class="d-flex flex-column gap-1">
                <!-- All Rooms Option -->
                <div 
                  class="room-filter-item p-2 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                  :class="{ active: filterRuangId === 'all' }"
                  @click="filterRuangId = 'all'"
                >
                  <div class="d-flex align-items-center gap-2">
                    <span class="room-color-dot bg-primary"></span>
                    <span class="small fw-semibold text-dark">Tampilkan Semua Ruang</span>
                  </div>
                  <span class="badge bg-light text-dark small">{{ rooms.length }}</span>
                </div>

                <!-- Individual Room Items -->
                <div 
                  v-for="r in rooms" 
                  :key="r.id"
                  class="room-filter-item p-2 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all"
                  :class="{ active: filterRuangId === r.id }"
                  @click="filterRuangId = r.id"
                >
                  <div class="d-flex align-items-center gap-2 text-truncate me-2">
                    <span class="room-color-dot" :style="{ backgroundColor: r.warna_label }"></span>
                    <div class="text-truncate">
                      <div class="small fw-semibold text-dark text-truncate">{{ r.nama_ruang }}</div>
                      <div class="text-muted" style="font-size: 0.72rem;">{{ r.kapasitas }} Kursi • {{ r.lokasi_lantai || 'RSIA' }}</div>
                    </div>
                  </div>
                  <span 
                    class="live-status-badge badge rounded-pill"
                    :class="r.live_status === 'in_use' ? 'bg-danger text-white' : 'bg-success-subtle text-success'"
                  >
                    {{ r.live_status === 'in_use' ? 'Dipakai' : 'Kosong' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 4. QUICK HELP / INTEGRATION NOTE -->
            <div class="p-3 rounded-4 bg-light text-muted small border">
              <div class="fw-semibold text-dark mb-1">
                <i class="fas fa-info-circle text-primary me-1"></i> Terintegrasi Undangan
              </div>
              Jadwal otomatis tersinkronisasi saat membuat Surat Undangan Internal dan menentukan ruang rapat.
            </div>

          </div>
        </aside>

        <!-- ======================================== -->
        <!-- RIGHT PANEL: TIMELINE & AGENDA STAGE     -->
        <!-- ======================================== -->
        <main class="col-xl-9 col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            
            <!-- CONTROL TOOLBAR: Date Navigator + View Mode Switcher -->
            <div class="card-header bg-white border-bottom p-3 p-md-4">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <!-- Date Stepper -->
                <div class="d-flex align-items-center gap-2">
                  <div class="btn-group shadow-sm rounded-pill overflow-hidden border">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-white px-3"
                      @click="shiftDate(-1)"
                      title="Hari Sebelumnya"
                    >
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-white px-3 fw-semibold text-primary"
                      @click="goToToday"
                    >
                      Hari Ini
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-white px-3"
                      @click="shiftDate(1)"
                      title="Hari Berikutnya"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>

                  <div>
                    <h5 class="fw-bold mb-0 text-dark">
                      {{ formatSelectedDateHuman }}
                    </h5>
                    <div class="text-muted small">
                      <span v-if="isViewingToday" class="badge bg-success-subtle text-success me-1">Sedang Melihat Hari Ini</span>
                      <span>{{ daySchedules.length }} Agenda Rapat Terjadwal</span>
                    </div>
                  </div>
                </div>

                <!-- Right Mode Switcher (Timeline Gantt vs List Feed) -->
                <div class="d-flex align-items-center gap-2">
                  <div class="btn-group bg-light p-1 rounded-pill border shadow-sm">
                    <button 
                      type="button" 
                      class="btn btn-sm rounded-pill px-3 fw-semibold transition-all"
                      :class="stageViewMode === 'timeline' ? 'btn-primary text-white shadow-sm' : 'text-muted'"
                      @click="stageViewMode = 'timeline'"
                    >
                      <i class="fas fa-stream me-1"></i> Timeline Jam
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm rounded-pill px-3 fw-semibold transition-all"
                      :class="stageViewMode === 'agenda' ? 'btn-primary text-white shadow-sm' : 'text-muted'"
                      @click="stageViewMode = 'agenda'"
                    >
                      <i class="fas fa-list-ul me-1"></i> Daftar Agenda ({{ displayedSchedules.length }})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- VIEW 1: TIMELINE GANTT OKUPANSI PER JAM -->
            <div v-if="stageViewMode === 'timeline'" class="card-body p-0">
              <!-- Timeline Legend & Notice Bar -->
              <div class="p-3 bg-light-subtle border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2 small">
                <div class="text-muted">
                  <i class="fas fa-clock text-primary me-1"></i> Rentang waktu operasional: <strong>07:00 — 21:00 WIB</strong>. Klik kartu rapat untuk melihat detail.
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="d-flex align-items-center gap-1 text-muted">
                    <span class="legend-box bg-primary"></span> Terjadwal
                  </span>
                  <span class="d-flex align-items-center gap-1 text-muted">
                    <span class="legend-box bg-danger"></span> Berlangsung Sekarang
                  </span>
                  <span v-if="isViewingToday" class="d-flex align-items-center gap-1 text-danger fw-semibold">
                    <span class="current-time-marker-dot"></span> Waktu Sekarang
                  </span>
                </div>
              </div>

              <!-- Visual Gantt Table -->
              <div class="table-responsive gantt-wrapper">
                <table class="table table-bordered mb-0 gantt-table align-middle">
                  <thead>
                    <tr class="bg-light text-center small text-muted">
                      <th class="gantt-room-th bg-white">Ruang Rapat</th>
                      <th v-for="h in timeHours" :key="h" class="gantt-hour-th">
                        {{ String(h).padStart(2, '0') }}:00
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="room in filteredRooms" :key="room.id">
                      <!-- Room Header Cell (Sticky Left) -->
                      <td class="gantt-room-td bg-white p-3">
                        <div class="d-flex align-items-start gap-2">
                          <span class="room-color-dot mt-1" :style="{ backgroundColor: room.warna_label }"></span>
                          <div class="text-truncate">
                            <div class="fw-bold text-dark text-truncate fs-6" :title="room.nama_ruang">
                              {{ room.nama_ruang }}
                            </div>
                            <div class="text-muted small d-flex align-items-center gap-2 mt-1">
                              <span><i class="fas fa-chair me-1"></i>{{ room.kapasitas }} Kursi</span>
                              <span class="badge bg-light text-dark font-monospace">{{ room.kode_ruang }}</span>
                            </div>
                            <!-- Amenities -->
                            <div class="amenities-row d-flex gap-1 text-muted mt-1 opacity-75">
                              <i v-if="hasFacility(room, 'proyektor')" class="fas fa-video fa-xs" title="Proyektor"></i>
                              <i v-if="hasFacility(room, 'sound')" class="fas fa-volume-up fa-xs" title="Sound System"></i>
                              <i v-if="hasFacility(room, 'ac')" class="fas fa-snowflake fa-xs" title="AC"></i>
                              <i v-if="hasFacility(room, 'wifi')" class="fas fa-wifi fa-xs" title="WiFi"></i>
                              <i v-if="hasFacility(room, 'tv')" class="fas fa-tv fa-xs" title="Smart TV"></i>
                            </div>
                          </div>
                        </div>
                      </td>

                      <!-- Gantt Timeline Track Cell -->
                      <td :colspan="timeHours.length" class="gantt-track-cell p-0 position-relative">
                        <!-- Hour Column Grid Lines -->
                        <div class="gantt-grid-lines">
                          <div v-for="h in timeHours" :key="h" class="gantt-line"></div>
                        </div>

                        <!-- Current Time Needle (if viewing today) -->
                        <div 
                          v-if="isViewingToday && currentTimeNeedlePercent >= 0 && currentTimeNeedlePercent <= 100"
                          class="current-time-needle"
                          :style="{ left: currentTimeNeedlePercent + '%' }"
                          :title="`Sekarang: ${currentTime}`"
                        >
                          <div class="needle-badge">{{ currentTime.slice(0, 5) }}</div>
                        </div>

                        <!-- Scheduled Meeting Chips for this Room on Selected Date -->
                        <div 
                          v-for="item in getMeetingsForRoom(room.id)"
                          :key="item.id"
                          class="meeting-chip shadow-sm"
                          :style="getMeetingChipStyle(item, room)"
                          @click="showMeetingDetail(item)"
                          :title="`${item.perihal} (${item.jam_mulai} - ${item.jam_selesai})`"
                        >
                          <div class="chip-content">
                            <div class="chip-title fw-bold text-truncate">
                              {{ item.perihal }}
                            </div>
                            <div class="chip-meta small opacity-90 d-flex align-items-center gap-1 font-monospace">
                              <i class="fas fa-clock fa-xs"></i> {{ item.jam_mulai }} - {{ item.jam_selesai }}
                              <span class="opacity-75">• {{ item.pj_nama }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Empty Placeholder Notice -->
                        <div 
                          v-if="getMeetingsForRoom(room.id).length === 0" 
                          class="gantt-empty-state text-muted small"
                        >
                          <i class="fas fa-check-circle text-success opacity-75 me-1"></i> Tersedia & kosong sepanjang hari
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- VIEW 2: AGENDA FEED / TABLE LIST -->
            <div v-else class="card-body p-0">
              <!-- Scope switcher inside agenda tab -->
              <div class="p-3 bg-light-subtle border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="btn-group btn-group-sm rounded-pill p-1 bg-white border shadow-sm">
                  <button 
                    type="button" 
                    class="btn rounded-pill px-3 fw-semibold"
                    :class="agendaScope === 'day' ? 'btn-primary text-white' : 'btn-light text-muted'"
                    @click="agendaScope = 'day'"
                  >
                    Hari Terpilih ({{ daySchedules.length }})
                  </button>
                  <button 
                    type="button" 
                    class="btn rounded-pill px-3 fw-semibold"
                    :class="agendaScope === 'week' ? 'btn-primary text-white' : 'btn-light text-muted'"
                    @click="agendaScope = 'week'"
                  >
                    Minggu Ini ({{ weekSchedules.length }})
                  </button>
                  <button 
                    type="button" 
                    class="btn rounded-pill px-3 fw-semibold"
                    :class="agendaScope === 'month' ? 'btn-primary text-white' : 'btn-light text-muted'"
                    @click="agendaScope = 'month'"
                  >
                    Bulan Ini ({{ allSchedules.length }})
                  </button>
                </div>

                <div class="text-muted small">
                  Menampilkan <strong>{{ displayedSchedules.length }}</strong> agenda pertemuan
                </div>
              </div>

              <!-- Table of Schedules -->
              <div v-if="displayedSchedules.length > 0" class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light small text-muted">
                    <tr>
                      <th v-if="agendaScope !== 'day'" width="150px">Tanggal</th>
                      <th width="140px">Jam Pelaksanaan</th>
                      <th width="240px">Ruang Rapat</th>
                      <th>Perihal Agenda</th>
                      <th width="200px">Penanggung Jawab</th>
                      <th width="140px">No. Surat</th>
                      <th width="90px" class="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in displayedSchedules" :key="item.id">
                      <td v-if="agendaScope !== 'day'">
                        <div class="fw-bold text-dark small">{{ formatDateShort(item.tanggal) }}</div>
                        <span 
                          v-if="item.tgl_only === selectedDate" 
                          class="badge bg-primary-subtle text-primary"
                        >
                          Hari Terpilih
                        </span>
                      </td>
                      <td>
                        <div class="fw-bold font-monospace text-primary fs-6">{{ item.jam_mulai }} - {{ item.jam_selesai }}</div>
                        <div class="text-muted small">{{ item.durasi_menit }} menit</div>
                      </td>
                      <td>
                        <span class="badge mb-1 text-white shadow-xs" :style="{ backgroundColor: item.warna_label }">
                          {{ item.nama_ruang }}
                        </span>
                        <div class="text-muted small text-truncate">{{ item.lokasi }}</div>
                      </td>
                      <td>
                        <div class="fw-bold text-dark">{{ item.perihal }}</div>
                        <div v-if="item.fasilitas_tambahan && item.fasilitas_tambahan.length > 0" class="mt-1 d-flex flex-wrap gap-1">
                          <span v-for="f in item.fasilitas_tambahan" :key="f" class="badge bg-light text-dark border extra-facility-badge">
                            <i class="fas fa-check text-success me-1"></i>{{ f }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="fw-semibold text-dark">{{ item.pj_nama }}</div>
                        <div class="text-muted small">{{ item.pj_jabatan || item.pj_nik }}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark font-monospace border">
                          {{ item.no_surat || '-' }}
                        </span>
                      </td>
                      <td class="text-center">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-outline-primary rounded-pill px-3"
                          @click="showMeetingDetail(item)"
                          title="Lihat Detail Rapat"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty state for Agenda List -->
              <div v-else class="text-center py-5 text-muted">
                <div class="mb-3">
                  <i class="fas fa-calendar-check fa-3x text-success opacity-50"></i>
                </div>
                <h6 class="fw-bold text-dark">Tidak Ada Agenda Terjadwal</h6>
                <p class="small mb-0">Semua ruangan rapat berstatus kosong dan tersedia pada periode ini.</p>
              </div>
            </div>

          </div>
        </main>

      </div>
    </main>

    <!-- ======================================================== -->
    <!-- TAB 2: MASTER DATA RUANGAN                               -->
    <!-- ======================================================== -->
    <section v-else-if="activeTab === 'master'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="fw-bold text-dark mb-1">Master Data Ruang Rapat RSIA</h5>
          <p class="text-muted small mb-0">Kelola spesifikasi, kapasitas peserta, dan fasilitas tiap ruangan</p>
        </div>
        <button 
          type="button" 
          class="btn btn-primary fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
          @click="openRoomModal()"
        >
          <i class="fas fa-plus"></i>
          <span>Tambah Ruangan Baru</span>
        </button>
      </div>

      <div class="row g-4">
        <div v-for="r in rooms" :key="r.id" class="col-lg-4 col-md-6">
          <div class="card master-room-card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
            <div class="room-color-strip" :style="{ backgroundColor: r.warna_label }"></div>
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge bg-light text-dark border font-monospace mb-1">{{ r.kode_ruang }}</span>
                  <h5 class="fw-bold text-dark mb-1">{{ r.nama_ruang }}</h5>
                  <div class="text-muted small">
                    <i class="fas fa-map-marker-alt text-danger me-1"></i> {{ r.lokasi_lantai || 'Gedung RSIA' }}
                  </div>
                </div>
                <span class="badge rounded-pill" :class="r.status === 'aktif' ? 'bg-success' : (r.status === 'maintenance' ? 'bg-warning text-dark' : 'bg-secondary')">
                  {{ r.status }}
                </span>
              </div>

              <div class="capacity-box p-3 bg-light rounded-3 my-3 d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small text-uppercase fw-semibold">Kapasitas Maksimal</div>
                  <div class="fs-4 fw-bold text-primary">{{ r.kapasitas }} <span class="fs-6 fw-normal text-muted">Orang / Kursi</span></div>
                </div>
                <div class="bg-primary-subtle text-primary p-3 rounded-circle">
                  <i class="fas fa-users fa-lg"></i>
                </div>
              </div>

              <!-- Daftar Fasilitas -->
              <div class="mb-3">
                <div class="small fw-bold text-muted mb-2">Fasilitas Ruangan:</div>
                <div v-if="r.fasilitas && r.fasilitas.length > 0" class="d-flex flex-wrap gap-1">
                  <span v-for="f in r.fasilitas" :key="f" class="badge bg-light text-dark border small">
                    <i class="fas fa-check text-success me-1"></i>{{ f }}
                  </span>
                </div>
                <div v-else class="text-muted small fst-italic">Belum ada data fasilitas</div>
              </div>

              <!-- Keterangan -->
              <p class="text-muted small mb-4 flex-grow-1">
                {{ r.keterangan || 'Tidak ada catatan tambahan untuk ruangan ini.' }}
              </p>

              <!-- Card Actions -->
              <div class="border-top pt-3 d-flex justify-content-end gap-2 mt-auto">
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  @click="openRoomModal(r)"
                >
                  <i class="fas fa-edit me-1"></i> Edit
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger rounded-pill px-3"
                  @click="confirmDeleteRoom(r)"
                >
                  <i class="fas fa-trash-alt me-1"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- TAB 3: DISPLAY PINTU SIGNAGE KIOSK                       -->
    <!-- ======================================================== -->
    <section v-else-if="activeTab === 'signage'">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="fas fa-tv text-primary me-2"></i> Mode Display Smart TV / Tablet Depan Pintu
            </h5>
            <p class="text-muted small mb-0">
              Buka tampilan fullscreen di tablet atau Smart TV di luar pintu ruang rapat. Menampilkan status rapat berjalan secara otomatis.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <select v-model="selectedSignageRoomId" class="form-select form-select-sm rounded-pill" style="min-width: 220px;">
              <option v-for="r in rooms" :key="r.id" :value="r.id">
                {{ r.nama_ruang }}
              </option>
            </select>
            <button 
              type="button" 
              class="btn btn-success fw-bold rounded-pill text-nowrap d-flex align-items-center gap-2 px-4 shadow-sm"
              @click="openSignageWindow"
            >
              <i class="fas fa-external-link-alt"></i>
              <span>Buka Layar Penuh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Signage Live Preview Screen -->
      <div v-if="selectedSignageRoom" class="signage-preview-frame rounded-4 shadow-lg p-5 text-white position-relative overflow-hidden" :class="signageRoomLiveStatus === 'in_use' ? 'bg-gradient-danger' : 'bg-gradient-success'">
        <div class="d-flex justify-content-between align-items-center border-bottom border-white-50 pb-3 mb-4">
          <div>
            <span class="badge bg-white text-dark font-monospace fs-6 px-3 py-1 mb-2">
              {{ selectedSignageRoom.kode_ruang }}
            </span>
            <h1 class="display-5 fw-bold mb-0 text-white">{{ selectedSignageRoom.nama_ruang }}</h1>
            <div class="text-white-50 fs-6 mt-1">
              <i class="fas fa-map-marker-alt me-1"></i> {{ selectedSignageRoom.lokasi_lantai }} • Kapasitas: {{ selectedSignageRoom.kapasitas }} Orang
            </div>
          </div>
          <div class="text-end">
            <div class="display-6 fw-bold font-monospace text-white">{{ currentTime }}</div>
            <div class="text-white-50">{{ currentFormattedDate }}</div>
          </div>
        </div>

        <!-- Big Status Indicator -->
        <div class="py-4 text-center">
          <div v-if="signageRoomLiveStatus === 'in_use' && selectedSignageRoom.active_meeting">
            <div class="badge bg-white text-danger fs-5 px-4 py-2 mb-3 text-uppercase shadow">
              <i class="fas fa-circle text-danger me-2 blink-slow"></i> SEDANG BERLANGSUNG
            </div>
            <h2 class="display-6 fw-bold mb-3 text-white">
              {{ selectedSignageRoom.active_meeting.perihal }}
            </h2>
            <div class="fs-4 text-white-50 mb-4">
              Penanggung Jawab: <strong class="text-white">{{ selectedSignageRoom.active_meeting.penanggung_jawab?.nama || selectedSignageRoom.active_meeting.pj }}</strong>
            </div>
            <div class="d-inline-block bg-dark bg-opacity-50 px-4 py-2 rounded-pill font-monospace fs-5">
              Pukul: {{ formatTime(selectedSignageRoom.active_meeting.tanggal) }} s/d {{ formatTime(selectedSignageRoom.active_meeting.jam_selesai || selectedSignageRoom.active_meeting.tanggal) }} WIB
            </div>
          </div>

          <div v-else>
            <div class="badge bg-white text-success fs-5 px-4 py-2 mb-3 text-uppercase shadow">
              <i class="fas fa-check-circle text-success me-2"></i> RUANGAN TERSEDIA
            </div>
            <h2 class="display-6 fw-bold mb-2 text-white">Ruangan Siap Digunakan</h2>
            <p class="fs-5 text-white-50 mb-0">Tidak ada agenda rapat yang sedang berlangsung saat ini.</p>
          </div>
        </div>

        <!-- Next Meeting Banner -->
        <div v-if="selectedSignageRoom.upcoming_meeting" class="mt-4 p-3 rounded-3 bg-dark bg-opacity-25 border border-white-50 d-flex justify-content-between align-items-center">
          <div>
            <span class="badge bg-warning text-dark text-uppercase me-2">Agenda Selanjutnya:</span>
            <strong class="text-white">{{ selectedSignageRoom.upcoming_meeting.perihal }}</strong>
          </div>
          <div class="font-monospace fw-bold text-white">
            Mulai {{ formatTime(selectedSignageRoom.upcoming_meeting.tanggal) }} WIB
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- MODAL FORM TAMBAH / EDIT RUANGAN                         -->
    <!-- ======================================================== -->
    <div v-if="showRoomModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-bottom py-3 px-4 bg-light">
            <h5 class="modal-title fw-bold text-dark">
              <i class="fas fa-door-open text-primary me-2"></i>
              {{ editingRoomId ? 'Edit Data Ruang Rapat' : 'Tambah Ruang Rapat Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showRoomModal = false"></button>
          </div>
          <form @submit.prevent="saveRoom">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label small fw-bold text-dark">Nama Ruang Rapat <span class="text-danger">*</span></label>
                  <input 
                    v-model="roomForm.nama_ruang" 
                    type="text" 
                    class="form-control" 
                    placeholder="Contoh: Aula Lantai 3 RSIA"
                    required
                  >
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-dark">Kode Ruang <span class="text-danger">*</span></label>
                  <input 
                    v-model="roomForm.kode_ruang" 
                    type="text" 
                    class="form-control font-monospace text-uppercase" 
                    placeholder="Contoh: AULA-LT3"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-dark">Lokasi / Lantai</label>
                  <input 
                    v-model="roomForm.lokasi_lantai" 
                    type="text" 
                    class="form-control" 
                    placeholder="Contoh: Gedung Utama Lantai 3"
                  >
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold text-dark">Kapasitas (Kursi) <span class="text-danger">*</span></label>
                  <input 
                    v-model.number="roomForm.kapasitas" 
                    type="number" 
                    min="1" 
                    class="form-control" 
                    placeholder="Jumlah kursi"
                    required
                  >
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold text-dark">Status Ruangan</label>
                  <select v-model="roomForm.status" class="form-select">
                    <option value="aktif">Aktif</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <!-- Warna Label Kalender -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-dark">Warna Label Kalender</label>
                  <div class="d-flex align-items-center gap-2">
                    <input 
                      v-model="roomForm.warna_label" 
                      type="color" 
                      class="form-control form-control-color" 
                      style="width: 50px;"
                    >
                    <input 
                      v-model="roomForm.warna_label" 
                      type="text" 
                      class="form-control font-monospace text-uppercase" 
                      placeholder="#2563EB"
                    >
                  </div>
                </div>

                <!-- Checklist Fasilitas Bawaan -->
                <div class="col-12">
                  <label class="form-label small fw-bold text-dark mb-2">Fasilitas Yang Tersedia di Ruangan</label>
                  <div class="d-flex flex-wrap gap-2">
                    <div 
                      v-for="fac in availableFacilitiesPreset" 
                      :key="fac"
                      class="form-check form-check-inline facility-checkbox-pill p-2 border rounded-3 bg-light"
                    >
                      <input 
                        :id="'fac_' + fac" 
                        v-model="roomForm.fasilitas" 
                        type="checkbox" 
                        :value="fac"
                        class="form-check-input ms-0 me-2"
                      >
                      <label :for="'fac_' + fac" class="form-check-label small fw-semibold cursor-pointer">
                        {{ fac }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Keterangan Tambahan -->
                <div class="col-12">
                  <label class="form-label small fw-bold text-dark">Catatan / Keterangan Ruangan</label>
                  <textarea 
                    v-model="roomForm.keterangan" 
                    rows="3" 
                    class="form-control" 
                    placeholder="Contoh: Digunakan untuk rapat akbar dan seminar. Kunci ruangan di bagian Umum."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top py-3 px-4 bg-light">
              <button type="button" class="btn btn-secondary rounded-pill px-4" @click="showRoomModal = false">Batal</button>
              <button type="submit" class="btn btn-primary fw-bold rounded-pill px-4" :disabled="savingRoom">
                <i v-if="savingRoom" class="fas fa-spinner fa-spin me-1"></i>
                <span>{{ editingRoomId ? 'Simpan Perubahan' : 'Tambah Ruangan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL DETAIL RAPAT TERPILIH                              -->
    <!-- ======================================================== -->
    <div v-if="selectedMeetingDetail" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-bottom py-3 px-4" :style="{ backgroundColor: selectedMeetingDetail.warna_label + '15' }">
            <div>
              <span class="badge text-white mb-1" :style="{ backgroundColor: selectedMeetingDetail.warna_label }">
                {{ selectedMeetingDetail.nama_ruang }}
              </span>
              <h5 class="modal-title fw-bold text-dark mb-0">
                Detail Reservasi Rapat
              </h5>
            </div>
            <button type="button" class="btn-close" @click="selectedMeetingDetail = null"></button>
          </div>
          <div class="modal-body p-4">
            <h5 class="fw-bold text-dark mb-3">
              {{ selectedMeetingDetail.perihal }}
            </h5>

            <div class="info-list d-flex flex-column gap-2 mb-4">
              <div class="d-flex justify-content-between p-2 bg-light rounded-2 small">
                <span class="text-muted"><i class="fas fa-calendar-alt text-primary me-2"></i> Tanggal Rapat:</span>
                <strong class="text-dark">{{ formatDate(selectedMeetingDetail.tanggal) }}</strong>
              </div>
              <div class="d-flex justify-content-between p-2 bg-light rounded-2 small">
                <span class="text-muted"><i class="fas fa-clock text-warning me-2"></i> Jam Pelaksanaan:</span>
                <strong class="text-primary font-monospace">{{ selectedMeetingDetail.jam_mulai }} - {{ selectedMeetingDetail.jam_selesai }} WIB ({{ selectedMeetingDetail.durasi_menit }} Menit)</strong>
              </div>
              <div class="d-flex justify-content-between p-2 bg-light rounded-2 small">
                <span class="text-muted"><i class="fas fa-user-tie text-success me-2"></i> Penanggung Jawab:</span>
                <strong class="text-dark">{{ selectedMeetingDetail.pj_nama }}</strong>
              </div>
              <div class="d-flex justify-content-between p-2 bg-light rounded-2 small">
                <span class="text-muted"><i class="fas fa-mail-bulk text-info me-2"></i> Nomor Surat:</span>
                <strong class="text-dark font-monospace">{{ selectedMeetingDetail.no_surat || '-' }}</strong>
              </div>
            </div>

            <!-- Fasilitas Tambahan yang Diminta -->
            <div v-if="selectedMeetingDetail.fasilitas_tambahan && selectedMeetingDetail.fasilitas_tambahan.length > 0" class="mb-3">
              <div class="small fw-bold text-muted mb-1">Permintaan Fasilitas Tambahan:</div>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="f in selectedMeetingDetail.fasilitas_tambahan" :key="f" class="badge bg-primary-subtle text-primary border">
                  <i class="fas fa-check me-1"></i> {{ f }}
                </span>
              </div>
            </div>

            <!-- Catatan/Deskripsi -->
            <div v-if="selectedMeetingDetail.deskripsi" class="p-3 bg-light rounded-3 small text-muted">
              <strong>Catatan Rapat:</strong> {{ selectedMeetingDetail.deskripsi }}
            </div>
          </div>
          <div class="modal-footer border-top py-2 px-4 bg-light d-flex justify-content-between">
            <button 
              v-if="selectedMeetingDetail.surat_id" 
              type="button" 
              class="btn btn-sm btn-outline-primary rounded-pill px-3"
              @click="openSuratDetail(selectedMeetingDetail.surat_id)"
            >
              <i class="fas fa-envelope-open-text me-1"></i> Buka Surat Internal
            </button>
            <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3 ms-auto" @click="selectedMeetingDetail = null">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import ruangRapatService from '../../services/ruangRapatService'

export default {
  name: 'RuangRapatView',
  setup() {
    const router = useRouter()

    // Tab state: 'jadwal' | 'master' | 'signage'
    const activeTab = ref('jadwal')
    // Stage view mode: 'timeline' (Gantt) | 'agenda' (Feed)
    const stageViewMode = ref('timeline')
    // Agenda scope: 'day' | 'week' | 'month'
    const agendaScope = ref('day')

    // Helper to format Date into YYYY-MM-DD using local time (avoids UTC timezone shift)
    const toLocalDateStr = (d) => {
      if (!d || isNaN(d.getTime())) return ''
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const date = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${date}`
    }

    // Helper to safely parse YYYY-MM-DD into local Date at 12:00:00 noon
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return new Date()
      const parts = dateStr.split('-').map(Number)
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
      }
      return new Date()
    }

    const loading = ref(false)
    const savingRoom = ref(false)
    const rooms = ref([])
    const allSchedules = ref([])
    const dateCounts = ref({})

    // Selected Date & Filter
    const selectedDate = ref(toLocalDateStr(new Date()))
    const filterRuangId = ref('all')
    const selectedMeetingDetail = ref(null)

    // Mini Calendar Navigation State
    const calYear = ref(new Date().getFullYear())
    const calMonth = ref(new Date().getMonth()) // 0-indexed

    // Signage
    const selectedSignageRoomId = ref(null)
    const currentTime = ref('')
    const currentFormattedDate = ref('')
    let clockInterval = null

    // Master Room Modal Form
    const showRoomModal = ref(false)
    const editingRoomId = ref(null)
    const roomForm = ref({
      nama_ruang: '',
      kode_ruang: '',
      lokasi_lantai: '',
      kapasitas: 20,
      fasilitas: [],
      warna_label: '#2563eb',
      status: 'aktif',
      keterangan: ''
    })

    const availableFacilitiesPreset = [
      'Sound System & Mic Wireless',
      'Proyektor & Layar Lebar',
      'Smart TV / Display',
      'AC',
      'Whiteboard & Spidol',
      'Koneksi Internet / WiFi',
      'Podium',
      'Video Conference / Zoom Kit',
      'Meja Rapat Oval'
    ]

    // Hours range for timeline Gantt: 07:00 to 21:00 (14 hours = 840 minutes)
    const timeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

    // ----------------------------------------------------
    // COMPUTED PROPERTIES
    // ----------------------------------------------------
    const todayStr = computed(() => toLocalDateStr(new Date()))
    const isViewingToday = computed(() => selectedDate.value === todayStr.value)

    const filteredRooms = computed(() => {
      if (filterRuangId.value === 'all') return rooms.value
      return rooms.value.filter(r => r.id === parseInt(filterRuangId.value))
    })

    const availableRoomsCount = computed(() => {
      return rooms.value.filter(r => r.live_status === 'available').length
    })

    const inUseRoomsCount = computed(() => {
      return rooms.value.filter(r => r.live_status === 'in_use').length
    })

    const selectedSignageRoom = computed(() => {
      if (!selectedSignageRoomId.value) return rooms.value[0] || null
      return rooms.value.find(r => r.id === parseInt(selectedSignageRoomId.value)) || rooms.value[0] || null
    })

    const signageRoomLiveStatus = computed(() => {
      return selectedSignageRoom.value ? selectedSignageRoom.value.live_status : 'available'
    })

    const formatSelectedDateHuman = computed(() => {
      if (!selectedDate.value) return ''
      const d = parseLocalDate(selectedDate.value)
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const formatSelectedDateHumanShort = computed(() => {
      if (!selectedDate.value) return ''
      const d = parseLocalDate(selectedDate.value)
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    })

    // Mini Calendar Computed
    const currentCalMonthName = computed(() => {
      const d = new Date(calYear.value, calMonth.value, 1)
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    })

    const miniCalendarDays = computed(() => {
      const year = calYear.value
      const month = calMonth.value

      const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday
      const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
      const daysInPrevMonth = new Date(year, month, 0).getDate()

      const days = []

      // 1. Padding days from previous month
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const pDay = daysInPrevMonth - i
        const prevDate = new Date(year, month - 1, pDay, 12, 0, 0)
        const dateStr = toLocalDateStr(prevDate)
        days.push({
          dateStr,
          dayNum: pDay,
          isCurrentMonth: false,
          isSelected: dateStr === selectedDate.value,
          isToday: dateStr === todayStr.value,
          count: dateCounts.value[dateStr] || 0
        })
      }

      // 2. Days of current month
      for (let day = 1; day <= daysInCurrentMonth; day++) {
        const m = String(month + 1).padStart(2, '0')
        const d = String(day).padStart(2, '0')
        const dateStr = `${year}-${m}-${d}`
        days.push({
          dateStr,
          dayNum: day,
          isCurrentMonth: true,
          isSelected: dateStr === selectedDate.value,
          isToday: dateStr === todayStr.value,
          count: dateCounts.value[dateStr] || 0
        })
      }

      // 3. Padding days for next month to complete 35 or 42 grid cells
      const totalCells = days.length <= 35 ? 35 : 42
      const remaining = totalCells - days.length
      for (let day = 1; day <= remaining; day++) {
        const nextDate = new Date(year, month + 1, day, 12, 0, 0)
        const dateStr = toLocalDateStr(nextDate)
        days.push({
          dateStr,
          dayNum: day,
          isCurrentMonth: false,
          isSelected: dateStr === selectedDate.value,
          isToday: dateStr === todayStr.value,
          count: dateCounts.value[dateStr] || 0
        })
      }

      return days
    })

    const selectedMonthTotalMeetings = computed(() => {
      let total = 0
      const prefix = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}`
      for (const [key, val] of Object.entries(dateCounts.value)) {
        if (key.startsWith(prefix)) {
          total += Number(val)
        }
      }
      return total
    })

    // Current Time Needle position on 07:00-21:00 timeline (840 minutes)
    const currentTimeNeedlePercent = computed(() => {
      const now = new Date()
      const currentH = now.getHours()
      const currentM = now.getMinutes()
      const minutesFrom7 = (currentH * 60 + currentM) - (7 * 60)
      const totalMinutes = 14 * 60 // 840
      return Math.max(0, Math.min(100, (minutesFrom7 / totalMinutes) * 100))
    })

    // Schedules filtered specifically for selected date
    const daySchedules = computed(() => {
      return allSchedules.value.filter(s => {
        const tgl = s.tgl_only || (s.tanggal ? s.tanggal.split(' ')[0] : '')
        return tgl === selectedDate.value
      })
    })

    // Schedules filtered for the current 7-day week of selectedDate
    const weekSchedules = computed(() => {
      const curr = parseLocalDate(selectedDate.value)
      const dayOfWeek = curr.getDay()
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(curr)
      monday.setDate(curr.getDate() + diffToMonday)

      const weekDates = new Set()
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        weekDates.add(toLocalDateStr(d))
      }

      return allSchedules.value.filter(s => {
        const tgl = s.tgl_only || (s.tanggal ? s.tanggal.split(' ')[0] : '')
        return weekDates.has(tgl)
      })
    })

    const displayedSchedules = computed(() => {
      if (agendaScope.value === 'month') return allSchedules.value
      if (agendaScope.value === 'week') return weekSchedules.value
      return daySchedules.value
    })

    // ----------------------------------------------------
    // METHODS
    // ----------------------------------------------------
    const updateClock = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      currentFormattedDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    const loadRooms = async () => {
      try {
        const res = await ruangRapatService.getRooms()
        if (res.data && res.data.data) {
          rooms.value = res.data.data
          if (rooms.value.length > 0 && !selectedSignageRoomId.value) {
            selectedSignageRoomId.value = rooms.value[0].id
          }
        }
      } catch (err) {
        console.error('Error loading rooms:', err)
      }
    }

    const loadJadwal = async () => {
      loading.value = true
      try {
        // Query full month range based on calYear & calMonth
        const y = calYear.value
        const m = calMonth.value
        const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`
        const lastDay = new Date(y, m + 1, 0).getDate()
        const monthEnd = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

        const res = await ruangRapatService.getJadwal({
          start: monthStart,
          end: monthEnd,
          ruang_id: filterRuangId.value
        })
        if (res.data) {
          allSchedules.value = res.data.schedules || []
          dateCounts.value = res.data.date_counts || {}
        }
      } catch (err) {
        console.error('Error loading schedule:', err)
      } finally {
        loading.value = false
      }
    }

    const refreshData = async () => {
      await Promise.all([loadRooms(), loadJadwal()])
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Data diperbarui',
        timer: 1500,
        showConfirmButton: false
      })
    }

    // Mini Calendar Navigation
    const calPrevMonth = () => {
      if (calMonth.value === 0) {
        calMonth.value = 11
        calYear.value -= 1
      } else {
        calMonth.value -= 1
      }
      loadJadwal()
    }

    const calNextMonth = () => {
      if (calMonth.value === 11) {
        calMonth.value = 0
        calYear.value += 1
      } else {
        calMonth.value += 1
      }
      loadJadwal()
    }

    const calGoToToday = () => {
      const now = new Date()
      calYear.value = now.getFullYear()
      calMonth.value = now.getMonth()
      selectedDate.value = toLocalDateStr(now)
      loadJadwal()
    }

    const onSelectDate = (dateStr) => {
      selectedDate.value = dateStr
      const targetDate = parseLocalDate(dateStr)
      if (targetDate.getMonth() !== calMonth.value || targetDate.getFullYear() !== calYear.value) {
        calMonth.value = targetDate.getMonth()
        calYear.value = targetDate.getFullYear()
        loadJadwal()
      }
    }

    const shiftDate = (days) => {
      const d = parseLocalDate(selectedDate.value)
      d.setDate(d.getDate() + days)
      const newStr = toLocalDateStr(d)
      onSelectDate(newStr)
    }

    const goToToday = () => {
      calGoToToday()
    }

    // Timeline Meetings for a specific room on the selected single day
    const getMeetingsForRoom = (roomId) => {
      return daySchedules.value.filter(s => s.ruang_id === roomId)
    }

    // Gantt Chip Calculation: 07:00 (420 min) to 21:00 (1260 min) = 840 minutes total
    const getMeetingChipStyle = (item, room) => {
      const [startH, startM] = (item.jam_mulai || '08:00').split(':').map(Number)
      const [endH, endM] = (item.jam_selesai || '10:00').split(':').map(Number)

      const startMinute = (startH * 60 + startM) - (7 * 60)
      const endMinute = (endH * 60 + endM) - (7 * 60)
      const totalMinutes = 14 * 60 // 840 minutes

      const leftPercent = Math.max(0, Math.min(100, (startMinute / totalMinutes) * 100))
      const widthPercent = Math.max(5, Math.min(100 - leftPercent, ((endMinute - startMinute) / totalMinutes) * 100))

      return {
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: room.warna_label || '#2563eb'
      }
    }

    const hasFacility = (room, keyword) => {
      if (!room.fasilitas || !Array.isArray(room.fasilitas)) return false
      return room.fasilitas.some(f => f.toLowerCase().includes(keyword.toLowerCase()))
    }

    const formatTime = (dateStr) => {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    const formatDateShort = (dateStr) => {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    const showMeetingDetail = (item) => {
      selectedMeetingDetail.value = item
    }

    const openSuratDetail = (suratId) => {
      router.push({ path: '/central-archive/internal', query: { surat_id: suratId } })
    }

    // Room Master CRUD
    const openRoomModal = (room = null) => {
      if (room) {
        editingRoomId.value = room.id
        roomForm.value = {
          nama_ruang: room.nama_ruang,
          kode_ruang: room.kode_ruang,
          lokasi_lantai: room.lokasi_lantai || '',
          kapasitas: room.kapasitas || 20,
          fasilitas: room.fasilitas ? [...room.fasilitas] : [],
          warna_label: room.warna_label || '#2563eb',
          status: room.status || 'aktif',
          keterangan: room.keterangan || ''
        }
      } else {
        editingRoomId.value = null
        roomForm.value = {
          nama_ruang: '',
          kode_ruang: '',
          lokasi_lantai: '',
          kapasitas: 20,
          fasilitas: ['AC', 'WiFi'],
          warna_label: '#2563eb',
          status: 'aktif',
          keterangan: ''
        }
      }
      showRoomModal.value = true
    }

    const saveRoom = async () => {
      savingRoom.value = true
      try {
        if (editingRoomId.value) {
          await ruangRapatService.updateRoom(editingRoomId.value, roomForm.value)
          Swal.fire('Berhasil', 'Data ruang rapat berhasil diperbarui', 'success')
        } else {
          await ruangRapatService.createRoom(roomForm.value)
          Swal.fire('Berhasil', 'Ruang rapat baru berhasil ditambahkan', 'success')
        }
        showRoomModal.value = false
        await loadRooms()
      } catch (err) {
        console.error('Error saving room:', err)
        const msg = err.response?.data?.message || 'Gagal menyimpan ruang rapat'
        Swal.fire('Error', msg, 'error')
      } finally {
        savingRoom.value = false
      }
    }

    const confirmDeleteRoom = (room) => {
      Swal.fire({
        title: `Hapus ${room.nama_ruang}?`,
        text: 'Ruangan ini akan dihapus dari daftar ruang rapat aktif.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ruangRapatService.deleteRoom(room.id)
            Swal.fire('Dihapus', 'Ruangan berhasil dihapus', 'success')
            await loadRooms()
          } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menghapus ruangan'
            Swal.fire('Peringatan', msg, 'warning')
          }
        }
      })
    }

    const openSignageWindow = () => {
      const roomId = selectedSignageRoomId.value || (rooms.value[0]?.id || '')
      const url = router.resolve({ path: `/ruang-rapat/display/${roomId}` }).href
      window.open(url, '_blank')
    }

    // Lifecycle
    onMounted(() => {
      updateClock()
      clockInterval = setInterval(updateClock, 1000)
      
      // Initialize calYear and calMonth from selectedDate
      const d = parseLocalDate(selectedDate.value)
      calYear.value = d.getFullYear()
      calMonth.value = d.getMonth()

      loadRooms()
      loadJadwal()
    })

    onUnmounted(() => {
      if (clockInterval) clearInterval(clockInterval)
    })

    return {
      activeTab,
      stageViewMode,
      agendaScope,
      loading,
      savingRoom,
      rooms,
      allSchedules,
      dateCounts,
      selectedDate,
      filterRuangId,
      selectedMeetingDetail,
      calYear,
      calMonth,
      currentCalMonthName,
      miniCalendarDays,
      selectedMonthTotalMeetings,
      todayStr,
      isViewingToday,
      filteredRooms,
      availableRoomsCount,
      inUseRoomsCount,
      currentTimeNeedlePercent,
      daySchedules,
      weekSchedules,
      displayedSchedules,
      selectedSignageRoomId,
      selectedSignageRoom,
      signageRoomLiveStatus,
      currentTime,
      currentFormattedDate,
      formatSelectedDateHuman,
      formatSelectedDateHumanShort,
      timeHours,
      showRoomModal,
      editingRoomId,
      roomForm,
      availableFacilitiesPreset,
      refreshData,
      calPrevMonth,
      calNextMonth,
      calGoToToday,
      onSelectDate,
      shiftDate,
      goToToday,
      getMeetingsForRoom,
      getMeetingChipStyle,
      hasFacility,
      formatTime,
      formatDate,
      formatDateShort,
      showMeetingDetail,
      openSuratDetail,
      openRoomModal,
      saveRoom,
      confirmDeleteRoom,
      openSignageWindow
    }
  }
}
</script>

<style scoped>
.ruang-rapat-container {
  padding-bottom: 3rem;
}

/* Header & Segmented Controls */
.header-icon-box {
  width: 44px;
  height: 44px;
}

.live-pill {
  font-size: 0.85rem;
}

.live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.segmented-control {
  background: #f8fafc;
}

.segment-btn {
  border: none;
  background: transparent;
  color: #64748b;
  transition: all 0.2s ease;
}

.segment-btn:hover {
  color: #0f172a;
}

.segment-btn.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

/* Mini Month Calendar Widget */
.icon-nav-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.cal-header {
  font-size: 0.72rem;
  padding: 4px 0;
}

.cal-day-cell {
  height: 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.15s ease;
}

.cal-day-cell:hover:not(.is-selected) {
  background-color: #f1f5f9;
  transform: scale(1.05);
}

.cal-day-cell.diff-month {
  color: #94a3b8;
  opacity: 0.5;
}

.cal-day-cell.is-selected {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.cal-day-cell.is-today:not(.is-selected) {
  border: 1.5px solid #2563eb;
  color: #2563eb;
  font-weight: bold;
}

.meeting-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  position: absolute;
  bottom: 2px;
}

/* Background Gradients */
.bg-gradient-blue {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
}

.text-white-70 { color: rgba(255, 255, 255, 0.7); }
.text-white-80 { color: rgba(255, 255, 255, 0.8); }
.border-white-20 { border-color: rgba(255, 255, 255, 0.2) !important; }

/* Room Filter Items */
.room-filter-item {
  border: 1px solid transparent;
}

.room-filter-item:hover:not(.active) {
  background-color: #f8fafc;
}

.room-filter-item.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.room-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.live-status-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
}

/* Gantt Chart Table */
.gantt-wrapper {
  overflow-x: auto;
  min-height: 380px;
}

.gantt-table {
  min-width: 1150px;
}

.gantt-room-th,
.gantt-room-td {
  width: 250px;
  min-width: 250px;
  position: sticky;
  left: 0;
  z-index: 5;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.04);
}

.gantt-hour-th {
  width: 70px;
  min-width: 70px;
  font-family: monospace;
  font-size: 0.78rem;
}

.gantt-track-cell {
  height: 72px;
  background-color: #ffffff;
}

.gantt-grid-lines {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.gantt-line {
  flex: 1;
  border-right: 1px dashed #e2e8f0;
}

/* Current Time Needle */
.current-time-needle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ef4444;
  z-index: 8;
  pointer-events: none;
}

.needle-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: bold;
  font-family: monospace;
  padding: 1px 4px;
  border-radius: 4px;
  white-space: nowrap;
}

.current-time-marker-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  display: inline-block;
}

/* Meeting Chips in Gantt */
.meeting-chip {
  position: absolute;
  top: 8px;
  bottom: 8px;
  border-radius: 8px;
  color: #ffffff;
  padding: 6px 10px;
  cursor: pointer;
  z-index: 6;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.meeting-chip:hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
  z-index: 9;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.chip-content {
  overflow: hidden;
  width: 100%;
}

.chip-title {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-meta {
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-empty-state {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-style: italic;
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.extra-facility-badge {
  font-size: 0.72rem;
}

/* Master Room Styling */
.master-room-card {
  transition: all 0.25s ease;
}

.master-room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.room-color-strip {
  height: 6px;
  width: 100%;
}

/* Signage Preview */
.signage-preview-frame {
  min-height: 480px;
}

.bg-gradient-danger {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #7f1d1d 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #047857 0%, #059669 50%, #064e3b 100%);
}

.blink-slow {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% { opacity: 0.3; }
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
