<template>
  <div class="ruang-rapat-wrapper">
    <!-- Header Page -->
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2 mb-1">
            <span>🏢</span> Manajemen & Jadwal Ruang Rapat
          </h1>
          <p class="page-subtitle mb-0 text-muted">
            Pantau ketersediaan, reservasi jadwal pertemuan terintegrasi surat undangan, dan kelola fasilitas ruang rapat RSIA.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button 
            type="button" 
            class="btn btn-outline-primary fw-semibold shadow-sm d-flex align-items-center gap-2"
            @click="refreshData"
            :disabled="loading"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>Refresh</span>
          </button>
          <button 
            type="button" 
            class="btn btn-primary fw-bold shadow-sm d-flex align-items-center gap-2"
            @click="openRoomModal()"
          >
            <i class="fas fa-plus"></i>
            <span>Tambah Ruangan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-body p-2">
        <ul class="nav nav-pills gap-2" role="tablist">
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link fw-bold px-4 py-2 d-flex align-items-center gap-2"
              :class="{ 'active shadow': activeTab === 'jadwal' }"
              @click="activeTab = 'jadwal'"
            >
              <i class="fas fa-calendar-alt"></i>
              <span>Jadwal & Okupansi Ruang</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link fw-bold px-4 py-2 d-flex align-items-center gap-2"
              :class="{ 'active shadow': activeTab === 'master' }"
              @click="activeTab = 'master'"
            >
              <i class="fas fa-door-open"></i>
              <span>Master Ruangan</span>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{{ rooms.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link fw-bold px-4 py-2 d-flex align-items-center gap-2"
              :class="{ 'active shadow': activeTab === 'signage' }"
              @click="activeTab = 'signage'"
            >
              <i class="fas fa-tv"></i>
              <span>Display Pintu (Signage)</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: JADWAL & OKUPANSI RUANG             -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'jadwal'">
      <!-- Date Filter Bar -->
      <div class="card glass-card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-3 align-items-center">
            <div class="col-lg-5 col-md-6">
              <label class="form-label small fw-bold text-muted mb-1">Pilih Tanggal Jadwal</label>
              <div class="d-flex align-items-center gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm px-3"
                  @click="shiftDate(-1)"
                  title="Hari Sebelumnya"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <input 
                  v-model="selectedDate" 
                  type="date" 
                  class="form-control form-control-sm fw-bold text-primary"
                  @change="loadJadwal"
                >
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm px-3"
                  @click="shiftDate(1)"
                  title="Hari Berikutnya"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary text-nowrap fw-semibold"
                  @click="goToToday"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div class="col-lg-4 col-md-6">
              <label class="form-label small fw-bold text-muted mb-1">Filter Ruangan</label>
              <select v-model="filterRuangId" class="form-select form-select-sm" @change="loadJadwal">
                <option value="all">Semua Ruangan ({{ rooms.length }})</option>
                <option v-for="r in rooms" :key="r.id" :value="r.id">
                  {{ r.nama_ruang }} (Kapasitas: {{ r.kapasitas }} org)
                </option>
              </select>
            </div>

            <div class="col-lg-3 col-md-12 text-lg-end">
              <div class="text-muted small">
                Tanggal Terpilih:
              </div>
              <div class="fw-bold text-dark fs-6">
                {{ formatSelectedDateHuman }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Room Status Cards -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <span class="pulse-indicator"></span> Status Ruangan Saat Ini (Live)
          </h5>
          <span class="text-muted small">Diperbarui realtime otomatis</span>
        </div>

        <div class="row g-3">
          <div 
            v-for="room in filteredRooms" 
            :key="room.id" 
            class="col-xl-4 col-md-6"
          >
            <div class="card room-card border-0 shadow-sm h-100 transition-hover">
              <div class="card-header bg-white border-0 pb-0 pt-3 px-3 d-flex justify-content-between align-items-start">
                <div>
                  <span class="badge mb-1 text-uppercase font-monospace" :style="{ backgroundColor: room.warna_label + '20', color: room.warna_label }">
                    {{ room.kode_ruang }}
                  </span>
                  <h6 class="fw-bold text-dark mb-1 fs-6">{{ room.nama_ruang }}</h6>
                  <div class="text-muted small">
                    <i class="fas fa-map-marker-alt text-danger me-1"></i> {{ room.lokasi_lantai || 'Gedung RSIA' }}
                  </div>
                </div>
                <!-- Status Badge -->
                <div>
                  <span v-if="room.live_status === 'in_use'" class="badge bg-danger shadow-sm py-2 px-3">
                    <i class="fas fa-users me-1"></i> Sedang Digunakan
                  </span>
                  <span v-else-if="room.live_status === 'upcoming'" class="badge bg-warning text-dark shadow-sm py-2 px-3">
                    <i class="fas fa-clock me-1"></i> Segera Dimulai
                  </span>
                  <span v-else-if="room.status === 'maintenance'" class="badge bg-secondary shadow-sm py-2 px-3">
                    <i class="fas fa-tools me-1"></i> Perbaikan
                  </span>
                  <span v-else class="badge bg-success shadow-sm py-2 px-3">
                    <i class="fas fa-check-circle me-1"></i> Tersedia (Kosong)
                  </span>
                </div>
              </div>

              <div class="card-body px-3 py-3">
                <!-- In Use Info -->
                <div v-if="room.live_status === 'in_use' && room.active_meeting" class="active-meeting-box p-3 rounded-3 mb-3 bg-danger-subtle border border-danger-subtle">
                  <div class="small fw-bold text-danger text-uppercase mb-1">
                    <i class="fas fa-play-circle me-1"></i> Rapat Berlangsung:
                  </div>
                  <div class="fw-bold text-dark text-truncate mb-1" :title="room.active_meeting.perihal">
                    {{ room.active_meeting.perihal || 'Rapat Koordinasi' }}
                  </div>
                  <div class="d-flex justify-content-between small text-muted">
                    <span><i class="fas fa-user-tie me-1"></i> {{ room.active_meeting.penanggung_jawab?.nama || room.active_meeting.pj }}</span>
                    <span class="fw-bold text-danger font-monospace">
                      Sampai {{ formatTime(room.active_meeting.jam_selesai || room.active_meeting.tanggal) }}
                    </span>
                  </div>
                </div>

                <!-- Upcoming Info -->
                <div v-else-if="room.live_status === 'upcoming' && room.upcoming_meeting" class="upcoming-meeting-box p-3 rounded-3 mb-3 bg-warning-subtle border border-warning-subtle">
                  <div class="small fw-bold text-warning-emphasis text-uppercase mb-1">
                    <i class="fas fa-hourglass-start me-1"></i> Rapat Selanjutnya (< 1 Jam):
                  </div>
                  <div class="fw-bold text-dark text-truncate mb-1" :title="room.upcoming_meeting.perihal">
                    {{ room.upcoming_meeting.perihal || 'Rapat' }}
                  </div>
                  <div class="d-flex justify-content-between small text-muted">
                    <span><i class="fas fa-user-tie me-1"></i> {{ room.upcoming_meeting.penanggung_jawab?.nama || room.upcoming_meeting.pj }}</span>
                    <span class="fw-bold text-warning-emphasis font-monospace">
                      Mulai {{ formatTime(room.upcoming_meeting.tanggal) }}
                    </span>
                  </div>
                </div>

                <!-- Available Empty State -->
                <div v-else class="p-3 rounded-3 mb-3 bg-success-subtle border border-success-subtle text-success small d-flex align-items-center gap-2">
                  <i class="fas fa-door-open fa-lg"></i>
                  <span>Ruangan siap dipakai untuk rapat atau koordinasi.</span>
                </div>

                <!-- Room Meta info: Kapasitas & Fasilitas -->
                <div class="d-flex align-items-center justify-content-between border-top pt-2 mt-auto small">
                  <div class="d-flex align-items-center gap-1 text-muted">
                    <i class="fas fa-chair text-primary"></i>
                    <span>Kapasitas: <strong class="text-dark">{{ room.kapasitas }}</strong> kursi</span>
                  </div>
                  <div class="facility-icons d-flex align-items-center gap-1 text-muted" title="Fasilitas Ruangan">
                    <i v-if="hasFacility(room, 'proyektor')" class="fas fa-video" title="Proyektor"></i>
                    <i v-if="hasFacility(room, 'sound')" class="fas fa-volume-up" title="Sound System & Mic"></i>
                    <i v-if="hasFacility(room, 'ac')" class="fas fa-snowflake" title="AC"></i>
                    <i v-if="hasFacility(room, 'tv')" class="fas fa-tv" title="Smart TV / Display"></i>
                    <i v-if="hasFacility(room, 'wifi')" class="fas fa-wifi" title="WiFi"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VISUAL TIMELINE SCHEDULE (Gantt Chart Per Jam) -->
      <div class="card glass-card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="fw-bold mb-0 text-dark">
              <i class="fas fa-stream text-primary me-2"></i> Timeline Okupansi Ruang Rapat ({{ formatSelectedDateHuman }})
            </h5>
            <div class="text-muted small mt-1">
              Petunjuk visual durasi pemakaian ruangan dari jam 07:00 hingga 21:00. Klik agenda rapat untuk melihat detail.
            </div>
          </div>
          <div class="d-flex align-items-center gap-3 small">
            <span class="d-flex align-items-center gap-1">
              <span class="legend-color-box bg-primary"></span> Terjadwal
            </span>
            <span class="d-flex align-items-center gap-1">
              <span class="legend-color-box bg-danger"></span> Sedang Berlangsung
            </span>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive timeline-table-wrapper">
            <table class="table table-bordered align-middle mb-0 timeline-table">
              <thead>
                <tr class="bg-light text-center small text-muted">
                  <th class="timeline-room-col bg-white">Ruang Rapat</th>
                  <th v-for="hour in timeHours" :key="hour" class="timeline-hour-col">
                    {{ String(hour).padStart(2, '0') }}:00
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in filteredRooms" :key="room.id">
                  <!-- Kolom Nama Ruangan -->
                  <td class="timeline-room-col bg-white p-3">
                    <div class="d-flex align-items-center gap-2">
                      <span class="room-color-dot" :style="{ backgroundColor: room.warna_label }"></span>
                      <div>
                        <div class="fw-bold text-dark fs-6">{{ room.nama_ruang }}</div>
                        <div class="text-muted small"><i class="fas fa-chair me-1"></i>{{ room.kapasitas }} org</div>
                      </div>
                    </div>
                  </td>

                  <!-- Kolom Timeline Bar Grid -->
                  <td :colspan="timeHours.length" class="p-0 position-relative timeline-grid-cell">
                    <!-- Background Grid Lines -->
                    <div class="timeline-grid-lines">
                      <div v-for="h in timeHours" :key="h" class="grid-line"></div>
                    </div>

                    <!-- Agenda Bars for this Room -->
                    <div 
                      v-for="item in getMeetingsForRoom(room.id)" 
                      :key="item.id"
                      class="timeline-agenda-bar shadow-sm"
                      :style="getAgendaBarStyle(item, room)"
                      @click="showMeetingDetail(item)"
                      :title="`${item.perihal} (${item.jam_mulai} - ${item.jam_selesai})`"
                    >
                      <div class="agenda-bar-content">
                        <strong class="agenda-title text-truncate">{{ item.perihal }}</strong>
                        <span class="agenda-time font-monospace small">({{ item.jam_mulai }} - {{ item.jam_selesai }})</span>
                      </div>
                    </div>

                    <!-- Empty state text if no meetings -->
                    <div v-if="getMeetingsForRoom(room.id).length === 0" class="timeline-empty-notice text-muted small">
                      <i class="fas fa-check-circle text-success me-1"></i> Kosong sepanjang hari
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- DAFTAR RAPAT HARI INI (Agenda List) -->
      <div class="card glass-card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0 text-dark">
            <i class="fas fa-list-ul text-primary me-2"></i> Daftar Rapat & Pertemuan ({{ schedules.length }} Agenda)
          </h5>
        </div>
        <div class="card-body p-0">
          <div v-if="schedules.length > 0" class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light small">
                <tr>
                  <th width="120px">Waktu</th>
                  <th width="220px">Ruang Rapat</th>
                  <th>Perihal Rapat</th>
                  <th width="200px">Penanggung Jawab</th>
                  <th width="150px">No. Surat</th>
                  <th width="100px" class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in schedules" :key="item.id">
                  <td>
                    <div class="fw-bold font-monospace text-primary fs-6">{{ item.jam_mulai }} - {{ item.jam_selesai }}</div>
                    <div class="text-muted small">{{ item.durasi_menit }} menit</div>
                  </td>
                  <td>
                    <span class="badge mb-1 text-white" :style="{ backgroundColor: item.warna_label }">
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
                      class="btn btn-sm btn-outline-primary"
                      @click="showMeetingDetail(item)"
                      title="Lihat Detail Rapat"
                    >
                      <i class="fas fa-eye"></i> Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-5 text-muted">
            <div class="mb-3">
              <i class="fas fa-calendar-check fa-3x text-success opacity-50"></i>
            </div>
            <h6 class="fw-bold text-dark">Tidak Ada Agenda Rapat Terjadwal</h6>
            <p class="small mb-0">Pada tanggal {{ formatSelectedDateHuman }}, semua ruang rapat berstatus kosong dan tersedia.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: MASTER DATA RUANGAN                 -->
    <!-- ========================================== -->
    <div v-else-if="activeTab === 'master'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="fw-bold text-dark mb-0">Master Data Ruang Rapat RSIA</h5>
          <p class="text-muted small mb-0">Kelola spesifikasi, kapasitas peserta, dan fasilitas tiap ruangan</p>
        </div>
        <button 
          type="button" 
          class="btn btn-primary fw-bold shadow-sm d-flex align-items-center gap-2"
          @click="openRoomModal()"
        >
          <i class="fas fa-plus"></i>
          <span>Tambah Ruang Rapat Baru</span>
        </button>
      </div>

      <div class="row g-4">
        <div v-for="r in rooms" :key="r.id" class="col-lg-4 col-md-6">
          <div class="card master-room-card border-0 shadow-sm h-100">
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
                  class="btn btn-sm btn-outline-secondary"
                  @click="openRoomModal(r)"
                >
                  <i class="fas fa-edit me-1"></i> Edit
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDeleteRoom(r)"
                >
                  <i class="fas fa-trash-alt me-1"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: DISPLAY PINTU SIGNAGE KIOSK         -->
    <!-- ========================================== -->
    <div v-else-if="activeTab === 'signage'">
      <div class="card glass-card border-0 shadow-sm p-4 mb-4">
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
            <select v-model="selectedSignageRoomId" class="form-select form-select-sm" style="min-width: 220px;">
              <option v-for="r in rooms" :key="r.id" :value="r.id">
                {{ r.nama_ruang }}
              </option>
            </select>
            <button 
              type="button" 
              class="btn btn-success fw-bold text-nowrap d-flex align-items-center gap-2"
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
    </div>

    <!-- ========================================== -->
    <!-- MODAL FORM TAMBAH / EDIT RUANGAN           -->
    <!-- ========================================== -->
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
              <button type="button" class="btn btn-secondary" @click="showRoomModal = false">Batal</button>
              <button type="submit" class="btn btn-primary fw-bold px-4" :disabled="savingRoom">
                <i v-if="savingRoom" class="fas fa-spinner fa-spin me-1"></i>
                <span>{{ editingRoomId ? 'Simpan Perubahan' : 'Tambah Ruangan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL DETAIL RAPAT TERPILIH                -->
    <!-- ========================================== -->
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
              class="btn btn-sm btn-outline-primary"
              @click="openSuratDetail(selectedMeetingDetail.surat_id)"
            >
              <i class="fas fa-envelope-open-text me-1"></i> Buka Surat Internal
            </button>
            <button type="button" class="btn btn-sm btn-secondary ms-auto" @click="selectedMeetingDetail = null">
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

    // State
    const activeTab = ref('jadwal')
    const loading = ref(false)
    const savingRoom = ref(false)
    const rooms = ref([])
    const schedules = ref([])
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const filterRuangId = ref('all')
    const selectedMeetingDetail = ref(null)

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

    // Hours range for timeline Gantt: 07:00 to 21:00
    const timeHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

    // Computed
    const filteredRooms = computed(() => {
      if (filterRuangId.value === 'all') return rooms.value
      return rooms.value.filter(r => r.id === parseInt(filterRuangId.value))
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
      const d = new Date(selectedDate.value + 'T00:00:00')
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    // Methods
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
        const res = await ruangRapatService.getJadwal({
          start: selectedDate.value,
          end: selectedDate.value,
          ruang_id: filterRuangId.value
        })
        if (res.data && res.data.schedules) {
          schedules.value = res.data.schedules
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

    const shiftDate = (days) => {
      const d = new Date(selectedDate.value + 'T00:00:00')
      d.setDate(d.getDate() + days)
      selectedDate.value = d.toISOString().split('T')[0]
      loadJadwal()
    }

    const goToToday = () => {
      selectedDate.value = new Date().toISOString().split('T')[0]
      loadJadwal()
    }

    const getMeetingsForRoom = (roomId) => {
      return schedules.value.filter(s => s.ruang_id === roomId)
    }

    // Calculate position and width of agenda bar in the timeline
    // Timeline spans from 07:00 (minute 420) to 21:00 (minute 1260), total 14 hours = 840 minutes
    const getAgendaBarStyle = (item, room) => {
      const [startH, startM] = (item.jam_mulai || '08:00').split(':').map(Number)
      const [endH, endM] = (item.jam_selesai || '10:00').split(':').map(Number)

      const startMinute = (startH * 60 + startM) - (7 * 60)
      const endMinute = (endH * 60 + endM) - (7 * 60)
      const totalMinutes = 14 * 60 // 840 minutes

      const leftPercent = Math.max(0, Math.min(100, (startMinute / totalMinutes) * 100))
      const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((endMinute - startMinute) / totalMinutes) * 100))

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

    onMounted(() => {
      updateClock()
      clockInterval = setInterval(updateClock, 1000)
      loadRooms()
      loadJadwal()
    })

    onUnmounted(() => {
      if (clockInterval) clearInterval(clockInterval)
    })

    return {
      activeTab,
      loading,
      savingRoom,
      rooms,
      schedules,
      filteredRooms,
      selectedDate,
      filterRuangId,
      selectedMeetingDetail,
      selectedSignageRoomId,
      selectedSignageRoom,
      signageRoomLiveStatus,
      currentTime,
      currentFormattedDate,
      formatSelectedDateHuman,
      timeHours,
      showRoomModal,
      editingRoomId,
      roomForm,
      availableFacilitiesPreset,
      refreshData,
      shiftDate,
      goToToday,
      getMeetingsForRoom,
      getAgendaBarStyle,
      hasFacility,
      formatTime,
      formatDate,
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
.ruang-rapat-wrapper {
  padding-bottom: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
}

.room-card {
  border-radius: 1rem;
  background: #ffffff;
  transition: all 0.25s ease;
}

.room-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}

.master-room-card {
  border-radius: 1rem;
  background: #ffffff;
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
}

.master-room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.09) !important;
}

.room-color-strip {
  height: 6px;
  width: 100%;
}

.room-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.pulse-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Timeline Gantt Styling */
.timeline-table-wrapper {
  min-height: 250px;
  overflow-x: auto;
}

.timeline-table {
  min-width: 1100px;
}

.timeline-room-col {
  width: 240px;
  min-width: 240px;
  position: sticky;
  left: 0;
  z-index: 2;
  box-shadow: 2px 0 5px rgba(0,0,0,0.04);
}

.timeline-hour-col {
  width: 70px;
  min-width: 70px;
  font-family: monospace;
  font-size: 0.8rem;
}

.timeline-grid-cell {
  height: 65px;
  position: relative;
  background: #fafafa;
}

.timeline-grid-lines {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  flex: 1;
  border-right: 1px dashed #e5e7eb;
}

.timeline-agenda-bar {
  position: absolute;
  top: 8px;
  bottom: 8px;
  border-radius: 8px;
  color: #ffffff;
  padding: 4px 10px;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.timeline-agenda-bar:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  z-index: 5;
  box-shadow: 0 6px 14px rgba(0,0,0,0.2) !important;
}

.agenda-bar-content {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}

.agenda-title {
  font-size: 0.85rem;
  margin-right: 4px;
}

.agenda-time {
  opacity: 0.9;
}

.timeline-empty-notice {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.legend-color-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.extra-facility-badge {
  font-size: 0.75rem;
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
</style>
