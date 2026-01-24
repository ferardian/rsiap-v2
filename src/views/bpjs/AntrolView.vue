<template>
  <div class="antrol-container">
    <!-- Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title">📶 BPJS Antrol Monitoring</h1>
        <p class="page-subtitle">Pantau antrean online bridging BPJS Antrol secara real-time</p>
      </div>
      <div class="header-actions">
        <div class="date-filter-card glass-card shadow-sm">
          <label class="small-label mb-1 d-block text-muted">Filter Tanggal</label>
          <div class="d-flex align-items-center gap-2">
            <input 
              v-model="filters.tanggal" 
              type="date" 
              class="form-control premium-input-sm" 
              @change="fetchAntrolData"
            >
            <button class="btn btn-premium-refresh" @click="fetchAntrolData" :disabled="loading">
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100 cursor-pointer" 
             :class="{'border-start border-4 border-danger': missingQueues.length > 0}"
             @click="openComparison('no-antrol')">
          <div class="text-muted small fw-bold mb-1">TOTAL SEP (RJ)</div>
          <div class="h3 fw-bold mb-0 text-dark">
            {{ sepList.length }}
            <span v-if="missingQueues.length > 0" class="text-danger small ms-1" style="font-size: 0.8rem;">
              <i class="fas fa-exclamation-circle"></i> {{ missingQueues.length }} Miss
            </span>
          </div>
          <div class="stat-footer mt-2 small text-muted">vs {{ uniqueAntrolCount }} Antrean Unik</div>
        </div>
      </div>
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100 cursor-pointer" @click="openComparison('matching')">
          <div class="text-muted small fw-bold mb-1">TOTAL ANTREAN</div>
          <div class="h3 fw-bold mb-0 text-primary">{{ antrolList.length }}</div>
          <div class="stat-footer mt-2 small text-muted">{{ uniqueAntrolCount }} Pasien Unik</div>
        </div>
      </div>
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100">
          <div class="text-muted small fw-bold mb-1">BELUM LAYAN</div>
          <div class="h3 fw-bold mb-0 text-warning">{{ statusCounts.antrean }}</div>
          <div class="stat-footer mt-2 small text-muted">Akan dilayani</div>
        </div>
      </div>
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100">
          <div class="text-muted small fw-bold mb-1">SEDANG DILAYANI</div>
          <div class="h3 fw-bold mb-0 text-info">{{ statusCounts.checkin }}</div>
          <div class="stat-footer mt-2 small text-muted">Sedang dilayani</div>
        </div>
      </div>
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100">
          <div class="text-muted small fw-bold mb-1">SELESAI</div>
          <div class="h3 fw-bold mb-0 text-success">{{ statusCounts.selesai }}</div>
          <div class="stat-footer mt-2 small text-muted">Telah dilayani</div>
        </div>
      </div>
      <div class="col-6 col-md">
        <div class="stat-card glass-card p-3 shadow-sm border-0 h-100">
          <div class="text-muted small fw-bold mb-1">BATAL</div>
          <div class="h3 fw-bold mb-0 text-danger">{{ statusCounts.batal }}</div>
          <div class="stat-footer mt-2 small text-muted">Dibatalkan/Tidak hadir</div>
        </div>
      </div>
    </div>
    
    <!-- Alerts for Missing Queues -->
    <div v-if="missingQueues.length > 0" class="alert alert-warning border-0 shadow-sm rounded-4 p-4 mb-4 animate__animated animate__headShake">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="bg-warning bg-opacity-25 rounded-circle p-2 px-3">
           <i class="fas fa-exclamation-triangle text-warning fa-lg"></i>
        </div>
        <div>
          <h6 class="m-0 fw-bold text-dark">Peringatan Antrean Online</h6>
          <p class="mb-0 small text-muted">Ditemukan {{ missingQueues.length }} pasien yang sudah memiliki SEP tapi belum masuk ke data antrean online.</p>
        </div>
      </div>
      <div class="table-responsive bg-white rounded-3 shadow-sm">
        <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.8rem;">
          <thead class="table-light">
            <tr>
              <th class="ps-3 py-2">Nama Pasien</th>
              <th class="py-2">No. Kartu</th>
              <th class="py-1">No. Rawat</th>
              <th class="py-1">No. SEP</th>
              <th class="text-center py-2">Info</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sep in missingQueues" :key="sep.no_sep">
              <td class="ps-3 fw-bold">{{ sep.nama_pasien }}</td>
              <td class="text-muted">{{ sep.no_kartu }}</td>
              <td class="text-muted">{{ sep.no_rawat }}</td>
              <td class="small">{{ sep.no_sep }}</td>
              <td class="text-center"><span class="badge bg-danger-subtle text-danger rounded-pill px-3">Belum Antrean</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Main Content -->
    <div class="card border-0 shadow-sm glass-card mb-4 mt-3">
      <div class="card-body p-4">
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold"><i class="fas fa-list-ul text-primary me-2"></i>Daftar Antrean Online</h5>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <div class="status-filter">
              <select v-model="filters.status" class="form-select premium-input-sm" style="min-width: 154px;">
                <option value="">Semua Status</option>
                <option value="Belum dilayani">Belum Dilayani</option>
                <option value="Sedang dilayani">Sedang Dilayani</option>
                <option value="Selesai dilayani">Selesai Dilayani</option>
                <option value="Batal">Batal</option>
              </select>
            </div>
            <div class="search-box">
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control premium-input-sm" 
                placeholder="Cari No. Antrean / No. RM..."
                style="min-width: 250px;"
              >
            </div>
          </div>
        </div>

        <div class="table-responsive premium-table">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Antrean</th>
                <th>Kartu & Pasien</th>
                <th>Poli & Jam</th>
                <th>Status</th>
                <th>Sumber & Estimasi</th>
                <th class="text-center">Aksi</th>
              </tr>
</thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm"></div>
                  <p class="mt-2 text-muted">Memuat data dari BPJS Antrol...</p>
                </td>
              </tr>
              <tr v-else-if="filteredAntrol.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p>Tidak ada data antrean untuk tanggal terpilih.</p>
                </td>
              </tr>
              <tr v-for="item in filteredAntrol" :key="item.kodebooking" class="antrol-row">
                <td>
                  <div class="antrol-number-badge">{{ item.noantrean }}</div>
                  <small class="text-muted d-block mt-1">{{ item.kodebooking }}</small>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nokapst }}</div>
                  <div class="small text-muted">RM: {{ item.norekammedis || '-' }}</div>
                </td>
                <td>
                  <div class="fw-bold">{{ item.kodepoli }}</div>
                  <div class="small text-muted text-truncate" style="max-width: 200px;">Jam: {{ item.jampraktek }}</div>
                </td>
                <td>
                  <span class="badge-status" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <div class="small fw-bold">{{ item.sumberdata }}</div>
                  <small class="text-muted">{{ formatEpoch(item.estimasidilayani) }}</small>
                </td>
                <td class="text-center">
                  <div class="d-flex gap-2 justify-content-center">
                    <button 
                      class="btn btn-task-list" 
                      title="Lihat Task List"
                      @click="showTaskList(item)"
                      :disabled="taskLoading === item.kodebooking"
                    >
                      <i class="fas" :class="taskLoading === item.kodebooking ? 'fa-spinner fa-spin' : 'fa-list-check'"></i>
                    </button>
                    <button 
                      class="btn btn-sync-task" 
                      title="Adjustment Waktu Antrean"
                      @click="showAdjustmentModal(item)"
                      :disabled="syncLoading === item.kodebooking || bulkSyncLoading === item.kodebooking"
                    >
                      <i class="fas" :class="syncLoading === item.kodebooking ? 'fa-spinner fa-spin' : 'fa-clock-rotate-left'"></i>
                    </button>
                    <button 
                      class="btn btn-bulk-sync" 
                      title="Sync Semua Task Sekaligus"
                      @click="bulkSyncTask(item)"
                      :disabled="bulkSyncLoading === item.kodebooking || syncLoading === item.kodebooking"
                    >
                      <i class="fas" :class="bulkSyncLoading === item.kodebooking ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Comparison Visualization Modal -->
    <div v-if="activeComparisonModal" class="modal-overlay" @click.self="activeComparisonModal = false">
      <div class="modal-content glass-card p-0 overflow-hidden shadow-lg border-0" style="max-width: 850px;">
        <div class="modal-header-premium p-4 d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div>
            <h5 class="m-0 fw-bold text-white"><i class="fas fa-chart-pie me-2"></i>Visualisasi Perbandingan Data</h5>
            <small class="text-white-50">Monitoring Sinkronisasi SEP vs Antrean Online</small>
          </div>
          <button class="btn-close-premium" @click="activeComparisonModal = false">&times;</button>
        </div>
        <div class="modal-body p-0">
          <div class="row g-0 border-bottom">
            <div class="col-4 p-4 text-center border-end cursor-pointer transition-all" 
                 :class="{'bg-blue-50': comparisonTab === 'matching'}" @click="comparisonTab = 'matching'">
              <div class="h3 fw-bold mb-0 text-success">{{ matchingData.length }}</div>
              <div class="small fw-bold text-muted text-uppercase">Sudah Terbit SEP</div>
              <div class="progress mt-2" style="height: 4px;">
                <div class="progress-bar bg-success" :style="{width: (matchingData.length / uniqueAntrolCount * 100) + '%'}"></div>
              </div>
            </div>
            <div class="col-4 p-4 text-center border-end cursor-pointer transition-all"
                 :class="{'bg-blue-50': comparisonTab === 'no-sep'}" @click="comparisonTab = 'no-sep'">
              <div class="h3 fw-bold mb-0 text-warning">{{ antrolWithoutSep.length }}</div>
              <div class="small fw-bold text-muted text-uppercase">Antrol Belum SEP</div>
              <div class="progress mt-2" style="height: 4px;">
                <div class="progress-bar bg-warning" :style="{width: (antrolWithoutSep.length / uniqueAntrolCount * 100) + '%'}"></div>
              </div>
            </div>
            <div class="col-4 p-4 text-center cursor-pointer transition-all"
                 :class="{'bg-blue-50': comparisonTab === 'no-antrol'}" @click="comparisonTab = 'no-antrol'">
              <div class="h3 fw-bold mb-0 text-danger">{{ missingQueues.length }}</div>
              <div class="small fw-bold text-muted text-uppercase">SEP Tanpa Antrol</div>
              <div class="progress mt-2" style="height: 4px;">
                <div class="progress-bar bg-danger" :style="{width: (missingQueues.length / sepList.length * 100) + '%'}"></div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-light bg-opacity-50" style="max-height: 50vh; overflow-y: auto;">
             <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="m-0 fw-bold">Detail Data: 
                  <span class="text-primary" v-if="comparisonTab === 'matching'">Matching (SEP Aktif)</span>
                  <span class="text-warning" v-else-if="comparisonTab === 'no-sep'">Antrean Belum Terbit SEP</span>
                  <span class="text-danger" v-else>SEP Belum Ada di Antrol</span>
                </h6>
                <div class="search-box-sm">
                   <input type="text" v-model="filters.keyword" class="form-control form-control-sm border-0 shadow-sm" placeholder="Cari data...">
                </div>
             </div>

             <div v-if="filteredComparisonData.length === 0" class="text-center py-5 text-muted">
                <i class="fas fa-search fa-2x mb-2 opacity-25"></i>
                <p>Tidak ada data ditemukan</p>
             </div>
             
             <div v-else class="table-responsive bg-white rounded-3 shadow-sm border overflow-hidden">
                <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.8rem;">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-3 py-2">Pasien / Nama</th>
                      <th class="py-2">No. Kartu</th>
                      <th v-if="comparisonTab !== 'no-antrol'" class="py-2">No. RM</th>
                      <th v-if="comparisonTab === 'no-antrol'" class="py-2">No. Rawat</th>
                      <th v-if="comparisonTab !== 'no-sep'" class="py-2">No. SEP</th>
                      <th class="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredComparisonData" :key="item.kodebooking || item.no_sep">
                      <td class="ps-3 fw-bold">{{ item.nokapst ? (item.noantrean || '-') : item.nama_pasien }}</td>
                      <td class="text-muted">{{ item.nokapst || item.no_kartu }}</td>
                      <td v-if="comparisonTab !== 'no-antrol'">{{ item.norekammedis || '-' }}</td>
                      <td v-if="comparisonTab === 'no-antrol'">{{ item.no_rawat }}</td>
                      <td v-if="comparisonTab !== 'no-sep'" class="small text-blue-600 fw-bold">{{ item.no_sep || '-' }}</td>
                      <td class="text-center">
                         <span v-if="comparisonTab === 'matching'" class="badge bg-success-subtle text-success rounded-pill px-3">Sudah SEP</span>
                         <span v-else-if="comparisonTab === 'no-sep'" class="badge bg-warning-subtle text-warning rounded-pill px-3">Belum SEP</span>
                         <span v-else class="badge bg-danger-subtle text-danger rounded-pill px-3">Gagal Antrol</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        </div>
        <div class="modal-footer p-3 bg-light border-0">
          <button class="btn btn-secondary px-4 fw-bold" @click="activeComparisonModal = false">Tutup Dashboard</button>
        </div>
      </div>
    </div>

    <!-- Task List Modal -->
    <div v-if="activeTaskListModal" class="modal-overlay" @click.self="closeTaskListModal">
      <div class="modal-content glass-card p-0 overflow-hidden shadow-lg border-0">
        <div class="modal-header-premium p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="m-0 fw-bold text-white"><i class="fas fa-tasks me-2"></i>Task List Antrean</h5>
            <small class="text-white-50">{{ selectedBooking?.kodebooking }} - {{ selectedBooking?.noantrean }}</small>
          </div>
          <button class="btn-close-premium" @click="closeTaskListModal">&times;</button>
        </div>
        <div class="modal-body p-4" style="max-height: 65vh; overflow-y: auto;">
          <div v-if="taskLoading === true" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Mengambil data task...</p>
          </div>
          <div v-else-if="taskList.length === 0" class="text-center py-4 text-muted">
            <i class="fas fa-circle-info fa-2x mb-3 opacity-25"></i>
            <p>Tidak ada data task untuk booking ini.</p>
          </div>
          <div v-else class="task-timeline">
            <div v-for="(task, index) in taskList" :key="index" class="task-item">
              <div class="task-dot" :class="{'task-dot-active': index === taskList.length - 1}"></div>
              <div class="task-info glass-card p-3 mb-3 shadow-none border">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge bg-primary-subtle text-primary border-0 small fw-bold">TASK {{ task.taskid }}</span>
                  <span class="small text-muted fw-bold">{{ task.wakturs }}</span>
                </div>
                <div class="fw-bold text-dark mb-1">{{ task.taskname }}</div>
                <div class="small text-muted"><i class="far fa-clock me-1"></i>{{ task.waktu }}</div>
              </div>
            </div>
            <div class="py-4 invisible">.</div>
          </div>
        </div>
        <div class="modal-footer p-3 bg-light border-0 text-end">
          <button class="btn btn-secondary px-4 fw-bold" @click="closeTaskListModal">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div v-if="activeAdjustmentModal" class="modal-overlay" @click.self="closeAdjustmentModal">
      <div class="modal-content glass-card p-0 overflow-hidden shadow-lg border-0" style="max-width: 600px;">
        <div class="modal-header-premium p-4 d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-white bg-opacity-25 rounded-circle p-3 d-none d-md-block">
              <i class="fas fa-user-injured fa-lg text-white"></i>
            </div>
            <div>
              <h5 class="m-0 fw-bold text-white">{{ adjData.nm_pasien || 'Memuat...' }}</h5>
              <div class="d-flex gap-2">
                <small class="text-white-50 fw-bold"><i class="fas fa-id-card me-1"></i>{{ adjData.no_rawat }}</small>
                <span class="text-white-50 opacity-50">|</span>
                <small class="text-white-50 fw-bold"><i class="fas fa-ticket-alt me-1"></i>{{ selectedBooking?.kodebooking }}</small>
              </div>
            </div>
          </div>
          <button class="btn-close-premium" @click="closeAdjustmentModal">&times;</button>
        </div>
        <div class="modal-body p-4" style="max-height: 60vh; overflow-y: auto;">
          <div v-if="syncLoading === true" class="text-center py-4">
            <div class="spinner-border text-success"></div>
            <p class="mt-2 text-muted">Memuat data lokal...</p>
          </div>
          <div v-else class="adjustment-form">
             <div class="alert alert-info border-0 shadow-none small mb-4">
               <i class="fas fa-info-circle me-2"></i> Mengubah waktu di sini akan mengupdate data tabel SIMRS dan langsung mengirim update ke BPJS.
             </div>

             <!-- Task 3 -->
             <div class="adj-item mb-4" v-if="adjData.task3">
                <label class="small-label text-success mb-2 d-block">Task 3: Pemeriksaan Ralan</label>
                <div class="row g-2">
                  <div class="col-7"><input type="date" v-model="adjData.task3.tgl" class="form-control premium-input-sm"></div>
                  <div class="col-5"><input type="time" step="1" v-model="adjData.task3.jam" class="form-control premium-input-sm"></div>
                </div>
                <button class="btn btn-sm btn-outline-success mt-2 w-100 fw-bold" @click="updateLocalTask(3)">Simpan & Sync Task 3</button>
             </div>

             <!-- Task 4 -->
             <div class="adj-item mb-4" v-if="adjData.task4 !== null">
                <label class="small-label text-success mb-2 d-block">Task 4: Estimasi Poli</label>
                <div class="d-flex gap-2">
                  <input type="datetime-local" v-model="adjData.task4_raw" class="form-control premium-input-sm">
                  <button class="btn btn-sm btn-success fw-bold" @click="updateLocalTask(4)">Update</button>
                </div>
             </div>

             <!-- Task 5 -->
             <div class="adj-item mb-4" v-if="adjData.task5">
                <label class="small-label text-success mb-2 d-block">Task 5: {{ adjData.has_resep ? 'Peresepan Obat' : 'Selesai Poli' }}</label>
                <div v-if="adjData.has_resep" class="row g-2">
                  <div class="col-7"><input type="date" v-model="adjData.task5.tgl" class="form-control premium-input-sm"></div>
                  <div class="col-5"><input type="time" step="1" v-model="adjData.task5.jam" class="form-control premium-input-sm"></div>
                </div>
                <input v-else type="datetime-local" v-model="adjData.task5_raw" class="form-control premium-input-sm">
                <button class="btn btn-sm btn-outline-success mt-2 w-100 fw-bold" @click="updateLocalTask(5)">Simpan & Sync Task 5</button>
             </div>

             <!-- Task 6 & 7 (Only if Resep) -->
             <template v-if="adjData.has_resep">
                <div class="adj-item mb-4">
                  <label class="small-label text-success mb-2 d-block">Task 6: Mulai Racik/Farmasi</label>
                  <div class="row g-2">
                    <div class="col-7"><input type="date" v-model="adjData.task6.tgl" class="form-control premium-input-sm"></div>
                    <div class="col-5"><input type="time" step="1" v-model="adjData.task6.jam" class="form-control premium-input-sm"></div>
                  </div>
                  <button class="btn btn-sm btn-outline-success mt-2 w-100 fw-bold" @click="updateLocalTask(6)">Simpan & Sync Task 6</button>
                </div>

                <div class="adj-item mb-5 pb-5">
                  <label class="small-label text-success mb-2 d-block">Task 7: Penyerahan Obat</label>
                  <div class="row g-2">
                    <div class="col-7"><input type="date" v-model="adjData.task7.tgl" class="form-control premium-input-sm"></div>
                    <div class="col-5"><input type="time" step="1" v-model="adjData.task7.jam" class="form-control premium-input-sm"></div>
                  </div>
                  <button class="btn btn-sm btn-outline-success mt-2 w-100 fw-bold" @click="updateLocalTask(7)">Simpan & Sync Task 7</button>
                </div>
                <div class="py-5"></div>
             </template>
          </div>
        </div>
        <div class="modal-footer p-3 bg-light border-0">
          <button class="btn btn-secondary px-4 fw-bold" @click="closeAdjustmentModal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import bpjsAntrolService from '@/services/bpjsAntrolService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const sepList = ref([]) // Changed from sepCount
const antrolList = ref([])
const taskLoading = ref(null)
const syncLoading = ref(null)
const bulkSyncLoading = ref(null)
const taskList = ref([])
const activeTaskListModal = ref(false)
const activeAdjustmentModal = ref(false)
const activeComparisonModal = ref(false) // Added this line
const comparisonTab = ref('matching') // Added this line
const selectedBooking = ref(null)
const adjData = reactive({
  no_rawat: '',
  nm_pasien: '',
  task3: { tgl: '', jam: '' },
  task4: null,
  task4_raw: '',
  task5: { tgl: '', jam: '' },
  task5_raw: '',
  task6: { tgl: '', jam: '' },
  task7: { tgl: '', jam: '' },
  has_resep: false
})

const filters = reactive({
  tanggal: new Date().toISOString().split('T')[0],
  keyword: '',
  status: ''
})

const statusCounts = computed(() => {
  const counts = { antrean: 0, selesai: 0, batal: 0, checkin: 0 }
  const list = Array.isArray(antrolList.value) ? antrolList.value : []
  list.forEach(item => {
    const s = String(item.status).toLowerCase()
    if (s.includes('belum') || s.includes('0')) counts.antrean++
    else if (s.includes('selesai') || s.includes('1')) counts.selesai++
    else if (s.includes('batal') || s.includes('2')) counts.batal++
    else if (s.includes('check') || s.includes('3') || s.includes('sedang')) counts.checkin++
  })
  return counts
})

const uniqueAntrolCount = computed(() => {
  const list = Array.isArray(antrolList.value) ? antrolList.value : []
  const uniqueCards = new Set(list.filter(i => i.nokapst).map(item => item.nokapst))
  return uniqueCards.size
})

const missingQueues = computed(() => {
  const seps = Array.isArray(sepList.value) ? sepList.value : []
  const list = Array.isArray(antrolList.value) ? antrolList.value : []
  
  if (!seps.length) return []
  
  const antrolCards = new Set(list.filter(i => i.nokapst).map(item => item.nokapst))
  return seps.filter(sep => sep.no_kartu && !antrolCards.has(sep.no_kartu))
})

const antrolWithoutSep = computed(() => {
  const seps = Array.isArray(sepList.value) ? sepList.value : []
  const list = Array.isArray(antrolList.value) ? antrolList.value : []
  
  const sepCards = new Set(seps.map(s => s.no_kartu))
  return list.filter(item => item.nokapst && !sepCards.has(item.nokapst))
})

const matchingData = computed(() => {
  const seps = Array.isArray(sepList.value) ? sepList.value : []
  const list = Array.isArray(antrolList.value) ? antrolList.value : []
  
  const sepCards = new Set(seps.map(s => s.no_kartu))
  return list.filter(item => item.nokapst && sepCards.has(item.nokapst))
})

const filteredComparisonData = computed(() => {
  let source = []
  if (comparisonTab.value === 'matching') source = matchingData.value
  else if (comparisonTab.value === 'no-sep') source = antrolWithoutSep.value
  else if (comparisonTab.value === 'no-antrol') source = missingQueues.value
  
  let result = source
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    result = source.filter(item => {
      const name = (item.pasien?.nm_pasien || item.nama_pasien || '').toLowerCase()
      const card = (item.nokapst || item.no_kartu || '').toLowerCase()
      const rm = String(item.norekammedis || '').toLowerCase()
      const rawat = String(item.no_rawat || item.no_rawat || '').toLowerCase()
      const antrean = String(item.noantrean || '').toLowerCase()
      
      return name.includes(kw) || 
             card.includes(kw) || 
             rm.includes(kw) || 
             rawat.includes(kw) || 
             antrean.includes(kw)
    })
  }

  // Sort by card number
  return [...result].sort((a, b) => {
    const cardA = String(a.nokapst || a.no_kartu || '')
    const cardB = String(b.nokapst || b.no_kartu || '')
    return cardA.localeCompare(cardB)
  })
})

const openComparison = (tab = 'matching') => {
  comparisonTab.value = tab
  activeComparisonModal.value = true
}

const filteredAntrol = computed(() => {
  let list = Array.isArray(antrolList.value) ? antrolList.value : []
  
  // Filter by Status
  if (filters.status) {
    list = list.filter(item => String(item.status).toLowerCase() === filters.status.toLowerCase())
  }

  // Filter by Keyword
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(item => 
      String(item.noantrean).toLowerCase().includes(kw) || 
      String(item.kodebooking).toLowerCase().includes(kw) ||
      String(item.nokapst).toLowerCase().includes(kw) ||
      (item.norekammedis && String(item.norekammedis).toLowerCase().includes(kw))
    )
  }

  return list
})

const fetchAntrolData = async () => {
  loading.value = true
  try {
    // Parallel fetch
    const [antrolRes, sepRes] = await Promise.all([
      bpjsAntrolService.getPendaftaranByTanggal(filters.tanggal),
      bpjsAntrolService.getSepCount(filters.tanggal)
    ])

    if (antrolRes.data.metadata.code === 200) {
      const resData = antrolRes.data.response
      antrolList.value = Array.isArray(resData) ? resData : (resData ? [resData] : [])
    } else {
      antrolList.value = []
      if (antrolRes.data.metadata.code !== 201) { 
          toast.info(antrolRes.data.metadata.message)
      }
    }

    if (sepRes.data.metadata.code === 200) {
      sepList.value = sepRes.data.response
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal terhubung ke API bridging')
  } finally {
    loading.value = false
  }
}

const formatEpoch = (epoch) => {
  if (!epoch) return '-'
  try {
    const date = new Date(parseInt(epoch))
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return epoch
  }
}

const getStatusClass = (status) => {
  const s = String(status).toLowerCase()
  if (s.includes('belum') || s.includes('0')) return 'status-antrean'
  if (s.includes('selesai') || s.includes('1')) return 'status-selesai'
  if (s.includes('batal') || s.includes('2')) return 'status-batal'
  if (s.includes('check') || s.includes('3')) return 'status-checkin'
  return 'status-unknown'
}

const showTaskList = async (item) => {
  selectedBooking.value = item
  activeTaskListModal.value = true
  taskLoading.value = true
  taskList.value = []
  
  try {
    const response = await bpjsAntrolService.getTaskQueue(item.kodebooking)
    if (response.data.metadata.code === 200) {
      taskList.value = response.data.response || []
    } else {
      toast.info(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal mengambil data task list')
  } finally {
    taskLoading.value = false
  }
}

const closeTaskListModal = () => {
  activeTaskListModal.value = false
  selectedBooking.value = null
  taskList.value = []
}

const showAdjustmentModal = async (item) => {
  selectedBooking.value = item
  activeAdjustmentModal.value = true
  syncLoading.value = true
  
  try {
    const response = await bpjsAntrolService.getLocalAdjustmentData(item.kodebooking)
    if (response.data.metadata.code === 200) {
      const res = response.data.response
      adjData.no_rawat = res.no_rawat
      adjData.nm_pasien = res.nm_pasien
      adjData.task3 = res.task3 || { tgl: '', jam: '' }
      adjData.task4 = res.task4
      adjData.task4_raw = res.task4 ? res.task4.replace(' ', 'T') : ''
      adjData.task5 = res.task5 || { tgl: '', jam: '' }
      if (typeof res.task5 === 'string' && res.task5) {
        adjData.task5_raw = res.task5.replace(' ', 'T')
      } else {
        adjData.task5_raw = ''
      }
      adjData.task6 = res.task6 || { tgl: '', jam: '' }
      adjData.task7 = res.task7 || { tgl: '', jam: '' }
      adjData.has_resep = res.has_resep
    } else {
      toast.warning(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal mengambil data adjustment')
  } finally {
    syncLoading.value = false
  }
}

const closeAdjustmentModal = () => {
  activeAdjustmentModal.value = false
  selectedBooking.value = null
}

const bulkSyncTask = async (item) => {
  if (!confirm('Sinkronisasi semua task (3-7 atau 3-5) untuk pasien ini ke BPJS Antrol?')) return
  
  bulkSyncLoading.value = item.kodebooking
  try {
    const response = await bpjsAntrolService.syncTaskQueue(item.kodebooking)
    if (response.data.metadata.code === 200) {
      toast.success('Berhasil sinkronisasi semua task!')
      await fetchAntrolData()
    } else {
      toast.warning(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal melakukan bulk sync')
  } finally {
    bulkSyncLoading.value = null
  }
}

const updateLocalTask = async (taskId) => {
  let waktuValue = null
  if (taskId === 3) waktuValue = adjData.task3
  else if (taskId === 4) waktuValue = adjData.task4_raw.replace('T', ' ')
  else if (taskId === 5) {
    waktuValue = adjData.has_resep ? adjData.task5 : (adjData.task5_raw ? adjData.task5_raw.replace('T', ' ') : null)
  }
  else if (taskId === 6) waktuValue = adjData.task6
  else if (taskId === 7) waktuValue = adjData.task7

  if (!waktuValue) return toast.info('Data waktu belum diisi')

  try {
    const response = await bpjsAntrolService.updateLocalTaskQueue({
      kodebooking: selectedBooking.value.kodebooking,
      no_rawat: adjData.no_rawat,
      taskid: taskId,
      waktu: waktuValue
    })

    if (response.data.metadata.code === 200) {
      toast.success('Adjustment Task ' + taskId + ' Berhasil!')
    } else {
      toast.error(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal melakukan update adjustment')
  }
}

onMounted(() => {
  fetchAntrolData()
})
</script>

<style scoped>
.antrol-container {
  padding: 1.5rem;
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.premium-input, .premium-input-sm {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.premium-input-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.premium-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-premium-refresh {
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 0.4rem 0.8rem;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-premium-refresh:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.antrol-number-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-weight: 800;
  display: inline-block;
  min-width: 60px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.badge-status {
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-antrean { background: #dbeafe; color: #1e40af; }
.status-selesai { background: #dcfce7; color: #166534; }
.status-batal { background: #fee2e2; color: #991b1b; }
.status-checkin { background: #fef9c3; color: #854d0e; }

/* Table Style */
.premium-table thead th {
  background: #f8fafc;
  border: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  padding: 1.25rem 1rem;
}

.premium-table tbody td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.antrol-row:hover {
  background: #f8fafc;
}

.small-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

.search-box {
  min-width: 300px;
}

.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease-in-out; }
.bg-blue-50 { background-color: #f0f7ff !important; }

.search-box-sm .form-control {
  border-radius: 20px;
  padding-left: 15px;
  width: 200px;
}

.date-filter-card {
  padding: 0.5rem 1rem;
}

/* Modal and Task styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-header-premium {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}
.btn-close-premium {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-close-premium:hover { background: rgba(255, 255, 255, 0.3); }

.task-timeline {
  position: relative;
  padding-left: 20px;
}
.task-item {
  position: relative;
  border-left: 2px solid #e2e8f0;
  padding-left: 20px;
}
.task-dot {
  position: absolute;
  left: -7px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid white;
}
.task-dot-active {
  background: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.btn-task-list {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-task-list:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: scale(1.1);
}

.btn-sync-task {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-sync-task:hover {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
  transform: scale(1.1);
}

.btn-bulk-sync {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-bulk-sync:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  transform: scale(1.1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
