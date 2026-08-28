<template>
  <div class="monitoring-kebugaran-page p-3 p-md-4">
    <!-- Header Banner -->
    <div class="header-banner card border-0 rounded-4 shadow-sm mb-4 text-white p-4 overflow-hidden position-relative" style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%);">
      <div class="position-relative z-1 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <span class="badge rounded-pill px-3 py-2 mb-2 text-uppercase fw-semibold tracking-wider" style="background-color: rgba(255, 255, 255, 0.2); color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.35); font-size: 0.72rem;">
            <i class="fas fa-laptop-medical me-1.5 text-warning"></i> SMARTWATCH ANALYTICS & HEALTH SYSTEM
          </span>
          <h2 class="fw-extrabold m-0 text-white d-flex align-items-center gap-2">
            <i class="fas fa-heartbeat"></i> Monitoring Kebugaran & Fatigue Pegawai
          </h2>
          <p class="text-white opacity-90 m-0 mt-1.5 small" style="max-width: 650px;">
            Pantau aktivitas fisik, kualitas tidur, dan deteksi dini risiko kelelahan (fatigue) staf medis & karyawan RS secara real-time.
          </p>
        </div>
        <div>
          <button class="btn btn-light text-teal rounded-3 px-4 py-2 shadow-sm fw-bold hover-lift" @click="fetchMonitoring" :disabled="loading">
            <i class="fas me-2" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
            REFRESH DATA
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="row g-3 mb-4">
      <!-- Steps KPI -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-shadow transition">
          <div class="card-body p-3.5 d-flex align-items-start justify-content-between">
            <div class="pe-2">
              <p class="text-muted text-uppercase fw-semibold mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px; line-height: 1.3; margin-top: 2px;">Rata-Rata Langkah</p>
              <h3 class="fw-extrabold text-dark m-0 mb-1" style="line-height: 1.1;">{{ formatNumber(kpi.avg_steps_today) }} <small class="text-muted fs-6 fw-normal">langkah</small></h3>
              <p class="text-emerald small fw-semibold m-0"><i class="fas fa-running me-1"></i> Hari ini</p>
            </div>
            <div class="kpi-icon-box bg-emerald-light text-emerald rounded-3 d-flex align-items-center justify-content-center">
              <i class="fas fa-shoe-prints fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Sleep KPI -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-shadow transition">
          <div class="card-body p-3.5 d-flex align-items-start justify-content-between">
            <div class="pe-2">
              <p class="text-muted text-uppercase fw-semibold mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px; line-height: 1.3; margin-top: 2px;">Rata-Rata Waktu Tidur</p>
              <h3 class="fw-extrabold text-dark m-0 mb-1" style="line-height: 1.1;">{{ kpi.avg_sleep_hours_today }} <small class="text-muted fs-6 fw-normal">Jam</small></h3>
              <p class="text-indigo small fw-semibold m-0"><i class="fas fa-moon me-1"></i> Tidur malam terakhir</p>
            </div>
            <div class="kpi-icon-box bg-indigo-light text-indigo rounded-3 d-flex align-items-center justify-content-center">
              <i class="fas fa-bed fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Resting HR KPI -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-shadow transition">
          <div class="card-body p-3.5 d-flex align-items-start justify-content-between">
            <div class="pe-2">
              <p class="text-muted text-uppercase fw-semibold mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px; line-height: 1.3; margin-top: 2px;">Resting Heart Rate</p>
              <h3 class="fw-extrabold text-dark m-0 mb-1" style="line-height: 1.1;">{{ kpi.avg_resting_hr_today || '-' }} <small class="text-muted fs-6 fw-normal">BPM</small></h3>
              <p class="text-cyan small fw-semibold m-0"><i class="fas fa-heartbeat me-1"></i> Normal (60-80 BPM)</p>
            </div>
            <div class="kpi-icon-box bg-cyan-light text-cyan rounded-3 d-flex align-items-center justify-content-center">
              <i class="fas fa-heartbeat fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Fatigue Alert KPI -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border border-danger border-opacity-25 shadow-sm rounded-4 h-100 bg-rose-light hover-shadow transition">
          <div class="card-body p-3.5 d-flex align-items-start justify-content-between">
            <div class="pe-2">
              <p class="text-danger text-uppercase fw-bold mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px; line-height: 1.3; margin-top: 2px;">Alert Kelelahan (Fatigue)</p>
              <h3 class="fw-extrabold text-danger m-0 mb-1" style="line-height: 1.1;">{{ kpi.fatigue_alerts_today }} <small class="text-danger opacity-75 fs-6 fw-normal">Pegawai</small></h3>
              <p class="text-danger small m-0"><i class="fas fa-exclamation-triangle me-1"></i> Tidur &lt; 5 jam / RHR tinggi</p>
            </div>
            <div class="kpi-icon-box bg-danger text-white rounded-3 d-flex align-items-center justify-content-center pulse-warning">
              <i class="fas fa-exclamation-triangle fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Pills -->
    <ul class="nav nav-pills custom-pills mb-4 gap-2 border-bottom pb-2">
      <li class="nav-item">
        <button 
          @click="activeTab = 'log'"
          :class="['nav-link rounded-3 px-4 py-2.5 font-bold transition-all', activeTab === 'log' ? 'active bg-teal shadow-sm' : 'bg-white border text-muted hover-bg-light']"
        >
          <i class="fas fa-clipboard-list me-2"></i> Log & Alert Kelelahan
        </button>
      </li>
      <li class="nav-item">
        <button 
          @click="activeTab = 'leaderboard'"
          :class="['nav-link rounded-3 px-4 py-2.5 font-bold transition-all', activeTab === 'leaderboard' ? 'active bg-teal shadow-sm' : 'bg-white border text-muted hover-bg-light']"
        >
          <i class="fas fa-trophy me-2"></i> Leaderboard Unit
        </button>
      </li>
    </ul>

    <!-- Tab 1: Log & Alert Kelelahan -->
    <div v-if="activeTab === 'log'" class="space-y-4">
      <!-- Filter Card -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-3.5">
          <div class="row g-3 align-items-end">
            <!-- Search -->
            <div class="col-12 col-md-3">
              <label class="form-label text-muted small font-bold mb-1.5">Cari Pegawai</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 rounded-start-3"><i class="fas fa-search text-muted"></i></span>
                <input 
                  v-model="filters.search"
                  @input="debouncedFetch"
                  type="text" 
                  class="form-control bg-light border-start-0 rounded-end-3 shadow-none" 
                  placeholder="NIK atau Nama..."
                />
              </div>
            </div>

            <!-- Departemen -->
            <div class="col-12 col-md-3">
              <label class="form-label text-muted small font-bold mb-1.5">Departemen / Unit</label>
              <input 
                v-model="filters.departemen"
                @change="fetchMonitoring"
                type="text" 
                class="form-control rounded-3 shadow-none" 
                placeholder="Nama unit..."
              />
            </div>

            <!-- Tanggal Awal & Akhir -->
            <div class="col-6 col-md-2">
              <label class="form-label text-muted small font-bold mb-1.5">Tgl Awal</label>
              <input 
                v-model="filters.tgl_awal"
                @change="fetchMonitoring"
                type="date" 
                class="form-control rounded-3 shadow-none"
              />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label text-muted small font-bold mb-1.5">Tgl Akhir</label>
              <input 
                v-model="filters.tgl_akhir"
                @change="fetchMonitoring"
                type="date" 
                class="form-control rounded-3 shadow-none"
              />
            </div>

            <!-- Toggle Fatigue Only -->
            <div class="col-12 col-md-2">
              <div class="form-check form-switch bg-danger bg-opacity-10 rounded-3 p-2.5 border border-danger border-opacity-25 d-flex align-items-center justify-content-between px-3">
                <label class="form-check-label text-danger font-bold small m-0 me-2 cursor-pointer" for="fatigueCheck">
                  ⚠️ Kelelahan
                </label>
                <input 
                  v-model="filters.fatigue_only"
                  @change="fetchMonitoring"
                  class="form-check-input m-0 cursor-pointer" 
                  type="checkbox" 
                  id="fatigueCheck"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0 text-sm">
            <thead class="bg-slate-100 text-muted uppercase font-bold text-xs">
              <tr>
                <th class="ps-4 py-3">Pegawai</th>
                <th class="py-3">Jabatan & Unit</th>
                <th class="py-3">Tanggal</th>
                <th class="py-3 text-end">Langkah</th>
                <th class="py-3 text-center">Heart Rate (RHR)</th>
                <th class="py-3 text-center">Jam Tidur</th>
                <th class="py-3 text-center">SpO2</th>
                <th class="pe-4 py-3 text-center">Status Fatigue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center">
                <td colspan="8" class="py-5 text-muted">
                  <div class="spinner-border text-teal spinner-border-sm me-2"></div>
                  Memuat data kesehatan pegawai...
                </td>
              </tr>
              <tr v-else-if="logs.length === 0" class="text-center">
                <td colspan="8" class="py-5 text-muted">Tidak ada data log kesehatan yang ditemukan.</td>
              </tr>
              <tr v-for="item in logs" :key="item.id">
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-box rounded-circle bg-light border text-secondary flex-shrink-0 d-flex align-items-center justify-content-center font-bold text-xs" style="width: 38px; height: 38px; overflow: hidden;">
                      <img v-if="item.photo" :src="photoUrl + item.photo" class="w-100 h-100 object-cover" />
                      <span v-else>{{ getInitials(item.nama) }}</span>
                    </div>
                    <div>
                      <p class="fw-bold text-dark m-0">{{ item.nama }}</p>
                      <p class="text-muted small m-0">NIK: {{ item.nik }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <p class="font-semibold text-dark m-0">{{ item.jbtn || '-' }}</p>
                  <p class="text-muted small m-0">{{ item.departemen || '-' }}</p>
                </td>
                <td class="py-3 text-muted font-mono small whitespace-nowrap">
                  {{ formatDate(item.tanggal) }}
                </td>
                <td class="py-3 text-end fw-extrabold text-dark">
                  {{ formatNumber(item.jumlah_langkah) }}
                </td>
                <td class="py-3 text-center font-semibold">
                  {{ item.detak_jantung_avg || '-' }} BPM
                  <span v-if="item.detak_jantung_resting" class="text-muted small font-normal">({{ item.detak_jantung_resting }})</span>
                </td>
                <td class="py-3 text-center font-semibold">
                  <span :class="item.is_sleep_deficit ? 'text-danger fw-bold' : 'text-dark'">
                    {{ item.durasi_tidur_jam !== null ? item.durasi_tidur_jam + ' Jam' : '-' }}
                  </span>
                </td>
                <td class="py-3 text-center font-bold text-info">
                  {{ item.spo2_avg ? item.spo2_avg + '%' : '-' }}
                </td>
                <td class="pe-4 py-3 text-center">
                  <span v-if="item.is_fatigue_alert" class="badge bg-danger-subtle text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                    <i class="fas fa-exclamation-triangle me-1"></i> Kelelahan
                  </span>
                  <span v-else class="badge bg-emerald-subtle text-emerald px-3 py-2 rounded-pill font-semibold">
                    <i class="fas fa-check-circle me-1"></i> Normal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="card-footer bg-light p-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-0">
          <span class="text-muted small">Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} record</span>
          <div class="d-flex align-items-center gap-2">
            <button 
              @click="changePage(pagination.current_page - 1)" 
              :disabled="pagination.current_page === 1"
              class="btn btn-sm btn-outline-secondary rounded-2 px-3"
            >
              Prev
            </button>
            <span class="fw-bold small text-dark">Hal {{ pagination.current_page }} / {{ pagination.last_page }}</span>
            <button 
              @click="changePage(pagination.current_page + 1)" 
              :disabled="pagination.current_page === pagination.last_page"
              class="btn btn-sm btn-outline-secondary rounded-2 px-3"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Leaderboard -->
    <div v-else-if="activeTab === 'leaderboard'" class="row g-4">
      <!-- Employee Leaderboard -->
      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <h5 class="fw-bold text-dark m-0"><i class="fas fa-medal me-2 text-warning"></i> Top Pegawai Teraktif (Langkah)</h5>
            <span class="badge bg-light text-muted">Bulan Ini</span>
          </div>

          <div class="d-flex flex-column gap-2">
            <div 
              v-for="(emp, idx) in leaderboard.employee_rankings" 
              :key="emp.nik"
              class="d-flex justify-content-between align-items-center p-3 rounded-3 border border-light hover-bg-teal"
            >
              <div class="d-flex align-items-center gap-3">
                <span :class="[
                  'rank-badge rounded-circle d-flex align-items-center justify-content-center font-extrabold text-xs',
                  idx === 0 ? 'bg-amber text-dark shadow-sm' :
                  idx === 1 ? 'bg-secondary text-white' :
                  idx === 2 ? 'bg-bronze text-white' : 'bg-light text-muted'
                ]" style="width: 32px; height: 32px;">
                  {{ idx + 1 }}
                </span>
                <div>
                  <p class="fw-bold text-dark m-0 small">{{ emp.nama }}</p>
                  <p class="text-muted text-xs m-0">{{ emp.jbtn }} • {{ emp.departemen }}</p>
                </div>
              </div>
              <div class="text-end">
                <p class="fw-extrabold text-teal m-0 small">{{ formatNumber(emp.total_steps) }}</p>
                <p class="text-muted text-xs m-0">Rata-rata: {{ formatNumber(emp.avg_steps) }}/hr</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Leaderboard -->
      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
          <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <h5 class="fw-bold text-dark m-0"><i class="fas fa-building me-2 text-cyan"></i> Top Unit / Departemen Teraktif</h5>
            <span class="badge bg-light text-muted">Rata-rata / Anggota</span>
          </div>

          <div class="d-flex flex-column gap-2">
            <div 
              v-for="(dept, idx) in leaderboard.department_rankings" 
              :key="dept.departemen"
              class="d-flex justify-content-between align-items-center p-3 rounded-3 border border-light hover-bg-cyan"
            >
              <div class="d-flex align-items-center gap-3">
                <span class="rank-badge rounded-circle bg-cyan-light text-cyan font-extrabold text-xs d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                  {{ idx + 1 }}
                </span>
                <div>
                  <p class="fw-bold text-dark m-0 small">{{ dept.departemen }}</p>
                  <p class="text-muted text-xs m-0">{{ dept.total_members }} Karyawan Aktif</p>
                </div>
              </div>
              <div class="text-end">
                <p class="fw-extrabold text-cyan m-0 small">{{ formatNumber(dept.avg_steps_per_member) }}</p>
                <p class="text-muted text-xs m-0">langkah / staf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import kesehatanPegawaiService from '@/services/kesehatanPegawaiService';

export default {
  name: 'MonitoringKebugaranView',
  data() {
    return {
      activeTab: 'log',
      loading: false,
      photoUrl: 'https://sim.rsiaaisyiyah.com/rsiap/file/pegawai/',
      kpi: {
        total_active_users: 0,
        avg_steps_today: 0,
        avg_sleep_hours_today: 0,
        avg_resting_hr_today: 0,
        fatigue_alerts_today: 0
      },
      filters: {
        search: '',
        departemen: '',
        fatigue_only: false,
        tgl_awal: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tgl_akhir: new Date().toISOString().split('T')[0],
        page: 1,
        per_page: 15
      },
      logs: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      },
      leaderboard: {
        employee_rankings: [],
        department_rankings: []
      },
      debounceTimer: null
    };
  },
  mounted() {
    this.fetchMonitoring();
    this.fetchLeaderboard();
  },
  methods: {
    async fetchMonitoring() {
      this.loading = true;
      try {
        const response = await kesehatanPegawaiService.getMonitoring(this.filters);
        if (response.data && response.data.success) {
          const res = response.data.message;
          this.kpi = res.kpi || this.kpi;
          this.logs = res.logs.data || [];
          this.pagination = {
            current_page: res.logs.current_page,
            last_page: res.logs.last_page,
            total: res.logs.total,
            from: res.logs.from,
            to: res.logs.to
          };
        }
      } catch (err) {
        console.error('Error fetching health monitoring:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchLeaderboard() {
      try {
        const response = await kesehatanPegawaiService.getLeaderboard({});
        if (response.data && response.data.success) {
          this.leaderboard = response.data.message;
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    },
    debouncedFetch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.filters.page = 1;
        this.fetchMonitoring();
      }, 400);
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.filters.page = page;
        this.fetchMonitoring();
      }
    },
    formatNumber(num) {
      return num ? new Intl.NumberFormat('id-ID').format(num) : '0';
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    getInitials(name) {
      if (!name) return 'P';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
  }
};
</script>

<style scoped>
.text-teal { color: #0f766e !important; }
.bg-teal { background-color: #0f766e !important; color: white !important; }
.bg-emerald-light { background-color: #d1fae5; }
.text-emerald { color: #059669; }
.bg-indigo-light { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }
.bg-cyan-light { background-color: #cff4fc; }
.text-cyan { color: #0891b2; }
.bg-rose-light { background-color: #fff1f2; }
.bg-amber { background-color: #fbbf24; }
.bg-bronze { background-color: #b45309; }

.kpi-icon-box {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.custom-pills .nav-link.active {
  background-color: #0f766e !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
}

.pulse-warning {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

.hover-bg-teal:hover {
  background-color: #f0fdf4;
  border-color: #bbf7d0 !important;
}

.hover-bg-cyan:hover {
  background-color: #ecfeff;
  border-color: #a5f3fc !important;
}

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.12) !important;
}

.object-cover {
  object-fit: cover;
}
</style>
