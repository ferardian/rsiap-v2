<template>
  <div class="lab-indicator-container p-3 p-md-4">
    <!-- Header Page -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-logo me-3">
            <img src="@/assets/lab-logo.png" alt="Logo" class="img-fluid p-1">
          </div>
          <div>
            <h3 class="page-title mb-0">Indikator Mutu Laboratorium</h3>
            <p class="page-subtitle mb-0 small">Monitoring & Surveilans Kualitas Pelayanan Laboratorium</p>
          </div>
        </div>
        
        <!-- Date Filter -->
        <div class="d-flex align-items-center gap-2 filter-section">
          <span class="text-muted small fw-bold"><i class="fas fa-calendar-alt me-1 text-primary"></i> Periode</span>
          <input type="date" v-model="filterDate" class="form-control form-control-sm filter-date" @change="fetchData">
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Sidebar: List Permintaan Lab -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden animate__animated animate__fadeInLeft">
          <div class="card-header bg-white py-3 border-bottom-0 flex-shrink-0">
            <h6 class="mb-3 fw-bold text-blue-900 text-uppercase tracking-wider" style="font-size: 0.75rem;">
              <i class="fas fa-list-ul me-2"></i>Antrian Permintaan
            </h6>
            <div class="input-group input-group-sm search-box">
              <span class="input-group-text border-end-0 bg-light"><i class="fas fa-search opacity-50"></i></span>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control border-start-0 bg-light shadow-none" 
                placeholder="Cari nama atau no rawat..."
              >
            </div>
          </div>
          <div class="card-body p-0 overflow-auto list-scroll-container">
            <div v-if="loading" class="text-center py-5 text-blue-600">
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              <span class="small fw-bold">Memuat data...</span>
            </div>
            <div v-else-if="filteredOrders.length === 0" class="text-center py-5 text-muted fst-italic">
              <i class="fas fa-search d-block fa-2x mb-2 opacity-25"></i>
              <span v-if="searchQuery">Tidak ada hasil pencarian</span>
              <span v-else>Belum ada permintaan lab hari ini</span>
            </div>
            <div v-else class="list-group list-group-flush">
              <button 
                v-for="order in filteredOrders" 
                :key="order.noorder"
                @click="selectOrder(order)"
                class="list-group-item list-group-item-action border-start-4 transition-all py-3 px-4 d-flex align-items-center justify-content-between"
                :class="[selectedOrder?.noorder === order.noorder ? 'bg-blue-50 border-blue-600' : 'border-transparent']"
              >
                <div>
                  <div class="fw-bold text-dark small">{{ order.pasien?.nm_pasien }}</div>
                  <div class="text-xs text-muted mt-1">
                    <span class="badge bg-light text-dark me-1 border">{{ order.no_rawat }}</span>
                    <span>{{ order.jam_permintaan }}</span>
                  </div>
                </div>
                <div v-if="order.inmut" class="text-success pulse-animation">
                   <i class="fas fa-check-circle"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content: Form Entri -->
      <div class="col-lg-8">
        <div v-if="!selectedOrder" class="card border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center text-muted p-5 animate__animated animate__fadeIn">
           <i class="fas fa-hand-pointer fa-3x mb-3 opacity-25"></i>
           <p>Pilih salah satu pasien di sebelah kiri untuk mengisi indikator mutu.</p>
        </div>

        <div v-else class="card border-0 shadow-sm rounded-4 animate__animated animate__fadeInRight">
          <div class="card-body p-4 p-md-5 pb-5">
            <form @submit.prevent="handleSubmit">
              <!-- Patient Info Summary (SIHA trigger) -->
              <div class="form-section-title">
                 <i class="fas fa-id-card me-2"></i>Informasi Pasien & Pemeriksaan
              </div>
              <div class="row g-3 mb-4 bg-light p-3 rounded-3 border">
                <div class="col-md-6 text-truncate">
                  <label class="text-xs text-muted text-uppercase fw-bold d-block mb-1">Nama Pasien</label>
                  <span class="fw-bold text-dark">{{ selectedOrder.pasien?.nm_pasien }}</span>
                </div>
                <div class="col-md-6">
                  <label class="text-xs text-muted text-uppercase fw-bold d-block mb-1">No. Rawat</label>
                  <span class="fw-bold text-dark">{{ selectedOrder.no_rawat }}</span>
                </div>
                <div class="col-12 mt-2 pt-2 border-top">
                   <label class="text-xs text-muted text-uppercase fw-bold d-block mb-1">Pemeriksaan Laboratorium</label>
                   <p class="mb-0 small text-blue-800 fst-italic">{{ selectedOrder.pemeriksaan }}</p>
                </div>
              </div>

              <!-- SIHA SECTION (Conditional) -->
              <div v-if="selectedOrder.hasHiv" class="siha-section mb-4 p-4 rounded-4 border-dashed border-2 border-primary bg-primary-subtle animate__animated animate__pulse">
                <div class="d-flex align-items-center mb-3">
                  <div class="siha-badge me-2">HIV EXAM</div>
                  <h6 class="mb-0 fw-bold text-primary">Form SIHA (HIV)</h6>
                </div>
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label small fw-bold">Status Kehamilan</label>
                    <div class="d-flex flex-wrap gap-2">
                       <input type="radio" class="btn-check" name="stts_hml" id="tm1" value="TM1" v-model="form.status_kehamilan">
                       <label class="btn btn-outline-primary btn-sm rounded-pill px-3" for="tm1">TM 1</label>
                       <input type="radio" class="btn-check" name="stts_hml" id="tm2" value="TM2" v-model="form.status_kehamilan">
                       <label class="btn btn-outline-primary btn-sm rounded-pill px-3" for="tm2">TM 2</label>
                       <input type="radio" class="btn-check" name="stts_hml" id="tm3" value="TM3" v-model="form.status_kehamilan">
                       <label class="btn btn-outline-primary btn-sm rounded-pill px-3" for="tm3">TM 3</label>
                       <input type="radio" class="btn-check" name="stts_hml" id="no_hml" value="Tidak Hamil" v-model="form.status_kehamilan">
                       <label class="btn btn-outline-secondary btn-sm rounded-pill px-3" for="no_hml">Tidak Hamil</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Penyakit Penyerta</label>
                    <input type="text" class="form-control shadow-none bg-white" v-model="form.penyakit_penyerta" placeholder="Contoh: TB, Hepatitis...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Keterangan</label>
                    <textarea class="form-control shadow-none bg-white" v-model="form.keterangan_siha" rows="1" placeholder="Informasi tambahan..."></textarea>
                  </div>
                </div>
              </div>

              <!-- INMUT DATA SECTION -->
              <div class="form-section-title">
                 <i class="fas fa-vial me-2"></i>Entri Data Indikator Mutu
              </div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Jam Ambil Sampel</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-clock text-muted opacity-50"></i></span>
                    <input type="time" class="form-control shadow-none border-start-0" v-model="form.jam_ambil_sampel" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Kategori Pasien</label>
                  <v-select 
                    v-model="form.kategori_pasien" 
                    :options="['OBSGYN', 'ANAK', 'UMUM']" 
                    placeholder="Pilih Kategori..."
                    class="style-chooser"
                  ></v-select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Petugas Sampling</label>
                  <v-select 
                    v-model="form.petugas_sampling" 
                    :options="staffList" 
                    label="nama" 
                    :reduce="s => s.nik"
                    placeholder="Cari petugas..."
                    class="style-chooser"
                    :append-to-body="true"
                  ></v-select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">Supervisor (Verifikasi)</label>
                   <v-select 
                    v-model="form.supervisi" 
                    :options="staffList" 
                    label="nama" 
                    :reduce="s => s.nik"
                    placeholder="Cari supervisor..."
                    class="style-chooser"
                    :append-to-body="true"
                  ></v-select>
                </div>

                <div class="col-12 mt-3 p-3 bg-soft-green rounded-3">
                  <div class="row align-items-center">
                    <div class="col-md-7">
                      <h6 class="small fw-bold mb-0">Identifikasi Pasien Sebelum Pengambilan Spesimen?</h6>
                    </div>
                    <div class="col-md-5 d-flex justify-content-md-end mt-2 mt-md-0">
                       <div class="btn-group btn-group-sm">
                          <input type="radio" class="btn-check" id="id-ya" value="YA" v-model="form.identifikasi_sebelum_pengambilan_darah">
                          <label class="btn btn-outline-success px-4" for="id-ya">YA</label>
                          <input type="radio" class="btn-check" id="id-tidak" value="TIDAK" v-model="form.identifikasi_sebelum_pengambilan_darah">
                          <label class="btn btn-outline-danger px-4" for="id-tidak">TIDAK</label>
                       </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-2 p-3 bg-soft-blue rounded-3">
                  <div class="row align-items-center">
                    <div class="col-md-7">
                      <h6 class="small fw-bold mb-0">Apakah Sampel Darah Terjadi Lisis / Beku?</h6>
                    </div>
                    <div class="col-md-5 d-flex justify-content-md-end mt-2 mt-md-0">
                       <div class="btn-group btn-group-sm">
                          <input type="radio" class="btn-check" id="lisis-ya" value="YA" v-model="form.lisis">
                          <label class="btn btn-outline-warning px-3" for="lisis-ya">YA</label>
                          <input type="radio" class="btn-check" id="lisis-tidak" value="TIDAK" v-model="form.lisis">
                          <label class="btn btn-outline-success px-3" for="lisis-tidak">TIDAK</label>
                          <input type="radio" class="btn-check" id="lisis-bukan" value="BUKAN DARAH" v-model="form.lisis">
                          <label class="btn btn-outline-secondary px-3" for="lisis-bukan">BUKAN DARAH</label>
                       </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mt-3">
                  <label class="form-label small fw-bold text-muted">Jam Selesai Pemeriksaan (Hasil Keluar)</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-file-medical-alt text-muted opacity-50"></i></span>
                    <input type="time" class="form-control shadow-none border-start-0" v-model="form.jam_selesai" required>
                  </div>
                </div>

                <div class="col-md-6 mt-3">
                   <label class="form-label small fw-bold text-muted text-uppercase">Hasil Lab Kritis?</label>
                   <div class="switch-item border p-2 rounded-3 bg-white w-100 px-3">
                      <span class="small fw-bold">{{ form.lab_kritis === 'YA' ? 'YA, ADA KRITIS' : 'TIDAK ADA' }}</span>
                      <div class="form-check form-switch p-0 m-0">
                        <input class="form-check-input" type="checkbox" v-model="form.lab_kritis" true-value="YA" false-value="TIDAK">
                      </div>
                   </div>
                </div>

                <div v-if="form.lab_kritis === 'YA'" class="col-12 mt-2 bg-danger-subtle p-3 rounded-4 border border-danger border-opacity-25 animate__animated animate__fadeIn">
                   <div class="row g-3">
                      <div class="col-md-12">
                        <label class="form-label small fw-bold">Keterangan Hasil Kritis</label>
                        <textarea class="form-control shadow-none border-0" v-model="form.keterangan_hasil_lab_kritis" rows="2" placeholder="Nilai kritis yang ditemukan..."></textarea>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Jam Lapor Kritis</label>
                        <input type="time" class="form-control shadow-none border-0" v-model="form.jam_lapor_lab_kritis">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small fw-bold text-center d-block">Waktu Lapor Sesuai Standar (< 5 menit)?</label>
                        <div class="btn-group btn-group-sm w-100 mt-2">
                           <input type="radio" class="btn-check" id="std-ya" value="YA" v-model="form.waktu_lapor_lab_kritis">
                           <label class="btn btn-outline-danger" for="std-ya">YA</label>
                           <input type="radio" class="btn-check" id="std-tidak" value="TIDAK" v-model="form.waktu_lapor_lab_kritis">
                           <label class="btn btn-outline-secondary" for="std-tidak">TIDAK</label>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <!-- FINAL SECTION: RESPONSIBILITY -->
              <div class="footer-confirmation bg-light rounded-4 p-4 border mt-5">
                 <div class="row g-3 align-items-end">
                    <div class="col-md-8">
                       <div class="form-check custom-checkbox mb-3">
                          <input class="form-check-input" type="checkbox" id="confirmData" v-model="acceptLiability" required>
                          <label class="form-check-label small text-muted lh-sm" for="confirmData">
                            Bismillahirrohmanirrohim, saya dengan sadar dan penuh tanggung jawab mengisikan data ini dengan data yang benar sesuai keadaan sesungguhnya.
                          </label>
                       </div>
                       <v-select 
                        v-model="form.petugas_entri" 
                        :options="staffList" 
                        label="nama" 
                        :reduce="s => s.nik"
                        placeholder="Pilih petugas entri..."
                        class="style-chooser flex-grow-1"
                        required
                        :append-to-body="true"
                      ></v-select>
                    </div>
                    <div class="col-md-4">
                       <button type="submit" class="btn btn-success w-100 py-3 rounded-pill fw-bold text-uppercase shadow-sm border-0" :disabled="!acceptLiability || submitting">
                          <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                          {{ selectedOrder.inmut ? 'UPDATE DATA' : 'SIMPAN DATA' }}
                       </button>
                    </div>
                 </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import laboratoryService from '@/services/laboratoryService'
import { pegawaiService } from '@/services/pegawaiService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const filterDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const loading = ref(false)
const submitting = ref(false)
const labOrders = ref([])
const selectedOrder = ref(null)
const staffList = ref([])
const acceptLiability = ref(false)

const filteredOrders = computed(() => {
  if (!searchQuery.value) return labOrders.value
  const q = searchQuery.value.toLowerCase()
  return labOrders.value.filter(o => 
    o.pasien?.nm_pasien?.toLowerCase().includes(q) || 
    o.no_rawat?.toLowerCase().includes(q)
  )
})

const initialForm = {
  no_rawat: '',
  tgl_periksa: '',
  kategori_pasien: 'UMUM',
  jam_ambil_sampel: '',
  petugas_sampling: '',
  supervisi: '',
  identifikasi_sebelum_pengambilan_darah: 'YA',
  lisis: 'TIDAK',
  jam_selesai: '',
  lab_kritis: 'TIDAK',
  keterangan_hasil_lab_kritis: '',
  jam_lapor_lab_kritis: '',
  waktu_lapor_lab_kritis: 'TIDAK',
  petugas_entri: '',
  
  // SIHA
  status_kehamilan: 'Tidak Hamil',
  penyakit_penyerta: '',
  keterangan_siha: '',
  status_siha: 0
}

const form = reactive({ ...initialForm })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await laboratoryService.getIndicators({ tgl: filterDate.value })
    if (res.data.success) {
      labOrders.value = res.data.data
    }
  } catch (error) {
    toast.error('Gagal memuat antrian lab')
  } finally {
    loading.value = false
  }
}

const fetchStaff = async () => {
  try {
    const res = await pegawaiService.getKaryawanList()
    if (res.data.success) {
      staffList.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching staff:', error)
  }
}

const selectOrder = (order) => {
  selectedOrder.value = order
  Object.assign(form, initialForm)
  
  form.no_rawat = order.no_rawat
  form.tgl_periksa = order.tgl_permintaan
  
  // Pre-fill from existing data if available
  if (order.inmut) {
     Object.keys(order.inmut).forEach(key => {
        if (form.hasOwnProperty(key)) form[key] = order.inmut[key]
     })
  } else {
     // Pre-fill from lab request times
     form.jam_ambil_sampel = order.jam_sampel !== '00:00:00' ? order.jam_sampel : order.jam_permintaan
     form.jam_selesai = order.jam_hasil !== '00:00:00' ? order.jam_hasil : ''
  }

  if (order.siha) {
     form.status_kehamilan = order.siha.status_kehamilan
     form.penyakit_penyerta = order.siha.penyakit_penyerta
     form.keterangan_siha = order.siha.keterangan
     form.status_siha = order.siha.status
  }
  
  acceptLiability.value = false
}

const handleSubmit = async () => {
  if (!acceptLiability.value) {
    toast.warning('Mohon centang pernyataan kebenaran data')
    return
  }

  submitting.value = true
  try {
    const res = await laboratoryService.storeIndicator(form)
    if (res.data.success) {
      toast.success(res.data.message)
      await fetchData()
      // Refresh current selected order state
      const current = labOrders.value.find(o => o.noorder === selectedOrder.value.noorder)
      if (current) selectedOrder.value = current
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchStaff()
})
</script>

<style scoped>
.lab-indicator-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.card {
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02) !important;
}

.card-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 1rem 1.5rem !important;
  text-align: left !important;
}

.header-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-date {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  color: #334155;
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 150px !important;
}

.filter-date:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.text-xs { font-size: 0.65rem; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wider { letter-spacing: 0.05em; }

.form-section-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
}

.bg-soft-green { background-color: #f0fdf4; border: 1px solid #dcfce7; }
.bg-soft-blue { background-color: #eff6ff; border: 1px solid #dbeafe; }

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0 !important;
}

.form-check-input:checked {
  background-color: #10b981;
  border-color: #10b981;
}

.siha-badge {
  background: #2563eb;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.border-dashed { border-style: dashed !important; }

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.transition-all { transition: all 0.3s ease; }

/* vue-select Dropdown styling */
.style-chooser :deep(.vs__dropdown-toggle) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  height: 38px;
  padding: 0 4px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.style-chooser:focus-within :deep(.vs__dropdown-toggle) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

/* Form input groups */
.input-group:not(.search-box) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.input-group:not(.search-box):focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.input-group:not(.search-box) .input-group-text {
  background: transparent !important;
  border: none !important;
}

.input-group:not(.search-box) .form-control {
  background: transparent !important;
  border: none !important;
}

/* Sidebar Search Box styling */
.search-box {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.search-box .input-group-text {
  background: transparent !important;
  border: none !important;
}

.search-box .form-control {
  background: transparent !important;
  border: none !important;
  font-size: 0.8rem;
}

.list-scroll-container {
  height: calc(100vh - 280px);
  min-height: 550px;
}

@media (max-width: 991px) {
  .list-scroll-container {
    height: auto;
    max-height: 50vh;
    min-height: 200px;
  }
}

@media (max-width: 991px) {
  .lab-indicator-container { padding: 1rem !important; }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.25rem 1rem !important;
    border-radius: 16px !important;
  }

  .page-title {
    font-size: 1.25rem !important;
  }

  .page-subtitle {
    font-size: 0.8rem !important;
  }

  .filter-section {
    width: 100% !important;
    justify-content: space-between !important;
  }

  .filter-date {
    width: 100% !important;
    flex: 1 !important;
  }
}
</style>
