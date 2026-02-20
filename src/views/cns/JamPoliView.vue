<template>
  <div class="jam-poli-wrapper">
    <div class="jam-poli-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="far fa-clock"></i>
          </div>
          <div>
            <h1 class="hero-title">Perubahan Jam Poliklinik</h1>
            <p class="hero-subtitle">Notifikasi pasien saat terjadi perubahan jam praktik dokter</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-card">
          <div class="filter-header">
            <i class="fas fa-filter"></i>
            <span>Filter Data Pasien</span>
          </div>
          <div class="filter-body">
            <div class="filter-grid">
              <div class="filter-item">
                <label class="filter-label">Tanggal Registrasi</label>
                <input type="date" v-model="filters.tgl_registrasi" class="filter-input" @change="fetchData">
              </div>
              <div class="filter-item">
                <label class="filter-label">Dokter</label>
                <div class="custom-select-wrapper">
                  <select v-model="filters.kd_dokter" class="filter-input filter-select" @change="onDokterChange">
                    <option value="">— Pilih Dokter —</option>
                    <option v-for="d in dokterList" :key="d.kd_dokter" :value="d.kd_dokter">
                      {{ d.nm_dokter }}
                      <template v-if="d.spesialis"> ({{ d.spesialis.nm_sps }})</template>
                    </option>
                  </select>
                  <i class="fas fa-chevron-down select-icon"></i>
                </div>
              </div>
              <div class="filter-item">
                <label class="filter-label">Poliklinik</label>
                <div class="custom-select-wrapper">
                  <select v-model="filters.kd_poli" class="filter-input filter-select" @change="fetchData">
                    <option value="">— Semua Poli —</option>
                    <option v-for="p in poliList" :key="p.kd_poli" :value="p.kd_poli">
                      {{ p.nm_poli }}
                    </option>
                  </select>
                  <i class="fas fa-chevron-down select-icon"></i>
                </div>
              </div>
              <div class="filter-item filter-actions">
                <label class="filter-label">&nbsp;</label>
                <button class="btn-fetch" @click="fetchData" :disabled="loading">
                  <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                  <span>{{ loading ? 'Memuat...' : 'Cari Data' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Left: Data Table -->
        <div class="table-section">
          <div class="table-card">
            <div class="table-header">
              <div class="table-title-area">
                <h3 class="table-title">
                  <i class="fas fa-clipboard-list"></i>
                  Daftar Pasien Terdaftar
                </h3>
                <span class="record-count" v-if="pasienList.length > 0">
                  {{ selectedRows.length }}/{{ pasienList.length }} dipilih
                </span>
              </div>
              <div class="table-actions">
                <div class="search-input-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input type="text" v-model="searchKeyword" placeholder="Cari nama/no. RM..." class="search-input">
                </div>
                <button v-if="selectedRows.length > 0 && jamBaru.jam_mulai" class="btn-notify" @click="confirmSendNotification" :disabled="notifLoading">
                  <i class="fas" :class="notifLoading ? 'fa-spinner fa-spin' : 'fa-bell'"></i>
                  <span class="btn-notify-text">Kirim Notifikasi ({{ selectedRows.length }})</span>
                </button>
              </div>
            </div>

            <!-- Desktop Table -->
            <div class="table-responsive desktop-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="th-check">
                      <label class="custom-check">
                        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                        <span class="checkmark"></span>
                      </label>
                    </th>
                    <th>No. Rawat</th>
                    <th>Pasien</th>
                    <th>Poli & Dokter</th>
                    <th>Jadwal Saat Ini</th>
                    <th>No. Telp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="6" class="loading-cell">
                      <div class="loading-spinner"><div class="spinner"></div><p>Memuat data pasien...</p></div>
                    </td>
                  </tr>
                  <tr v-else-if="filteredPasien.length === 0">
                    <td colspan="6" class="empty-cell">
                      <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p v-if="!filters.kd_dokter">Pilih dokter untuk menampilkan data pasien</p>
                        <p v-else>Tidak ada data pasien untuk filter ini</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="item in filteredPasien" :key="item.no_rawat" class="data-row"
                    :class="{ 'row-selected': selectedRows.includes(item.no_rkm_medis), 'invalid-phone': !isValidPhone(item.pasien_some_data?.no_tlp) }">
                    <td class="td-check">
                      <label class="custom-check">
                        <input type="checkbox" :value="item.no_rkm_medis" v-model="selectedRows">
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.no_rawat }}</div>
                      <div class="cell-secondary">{{ item.no_rkm_medis }}</div>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.pasien_some_data?.nm_pasien || '-' }}</div>
                      <div class="cell-secondary">{{ item.pasien_some_data?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}</div>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.poliklinik?.nm_poli || '-' }}</div>
                      <div class="cell-secondary text-accent">{{ item.dokter?.nm_dokter || '-' }}</div>
                    </td>
                    <td>
                      <div v-if="item.jadwal_jam_mulai" class="jadwal-badge jadwal-old">
                        <i class="far fa-clock"></i>
                        {{ item.jadwal_jam_mulai?.substring(0,5) }} - {{ item.jadwal_jam_selesai?.substring(0,5) }}
                      </div>
                      <span v-else class="text-muted-light">—</span>
                    </td>
                    <td>
                      <div class="phone-cell">
                        <span :class="{ 'phone-valid': isValidPhone(item.pasien_some_data?.no_tlp), 'phone-invalid': !isValidPhone(item.pasien_some_data?.no_tlp) }">
                          {{ item.pasien_some_data?.no_tlp || '-' }}
                        </span>
                        <i v-if="!isValidPhone(item.pasien_some_data?.no_tlp)" class="fas fa-exclamation-triangle phone-warn" title="Nomor telepon tidak valid"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="mobile-cards">
              <div v-if="loading" class="loading-spinner"><div class="spinner"></div><p>Memuat data pasien...</p></div>
              <div v-else-if="filteredPasien.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p v-if="!filters.kd_dokter">Pilih dokter untuk menampilkan data pasien</p>
                <p v-else>Tidak ada data pasien untuk filter ini</p>
              </div>
              <div v-for="item in filteredPasien" :key="'m-' + item.no_rawat" class="patient-card"
                :class="{ 'card-selected': selectedRows.includes(item.no_rkm_medis) }"
                @click="toggleRowSelection(item.no_rkm_medis)">
                <div class="patient-card-header">
                  <label class="custom-check" @click.stop>
                    <input type="checkbox" :value="item.no_rkm_medis" v-model="selectedRows">
                    <span class="checkmark"></span>
                  </label>
                  <div class="patient-name">{{ item.pasien_some_data?.nm_pasien || '-' }}</div>
                  <div v-if="item.jadwal_jam_mulai" class="jadwal-badge-sm jadwal-old">
                    <i class="far fa-clock"></i>
                    {{ item.jadwal_jam_mulai?.substring(0,5) }}-{{ item.jadwal_jam_selesai?.substring(0,5) }}
                  </div>
                </div>
                <div class="patient-card-body">
                  <div class="card-info-row">
                    <span class="card-label">No. Rawat</span>
                    <span class="card-value">{{ item.no_rawat }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">Poli</span>
                    <span class="card-value">{{ item.poliklinik?.nm_poli || '-' }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">Dokter</span>
                    <span class="card-value text-accent">{{ item.dokter?.nm_dokter || '-' }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">No. Telp</span>
                    <span class="card-value" :class="{ 'phone-valid': isValidPhone(item.pasien_some_data?.no_tlp), 'phone-invalid': !isValidPhone(item.pasien_some_data?.no_tlp) }">
                      {{ item.pasien_some_data?.no_tlp || '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Jam Praktik Baru Panel -->
        <div class="schedule-panel" :class="{ 'panel-visible': filters.kd_dokter }">
          <div class="schedule-card">
            <div class="schedule-header">
              <i class="fas fa-clock"></i>
              <span>Jam Praktik Baru</span>
            </div>
            <div class="schedule-body">
              <div v-if="!filters.kd_dokter" class="schedule-notice">
                <i class="fas fa-info-circle"></i>
                <p>Pilih <strong>dokter</strong> terlebih dahulu untuk mengatur jam praktik baru.</p>
              </div>
              <template v-else>
                <div class="schedule-form">
                  <div class="time-inputs">
                    <div class="form-group">
                      <label class="form-label">Jam Mulai</label>
                      <input type="time" v-model="jamBaru.jam_mulai" class="filter-input time-input">
                    </div>
                    <div class="time-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Jam Selesai</label>
                      <input type="time" v-model="jamBaru.jam_selesai" class="filter-input time-input" :disabled="jamBaru.tidakDitentukan">
                    </div>
                  </div>
                  <label class="toggle-row" @click="jamBaru.tidakDitentukan = !jamBaru.tidakDitentukan">
                    <div class="toggle-switch" :class="{ 'toggle-on': jamBaru.tidakDitentukan }">
                      <div class="toggle-knob"></div>
                    </div>
                    <span>Jam selesai tidak ditentukan</span>
                  </label>

                  <!-- Change Summary -->
                  <div v-if="jamBaru.jam_mulai" class="change-summary">
                    <div class="change-arrow-row">
                      <div class="change-box change-old">
                        <div class="change-label">Jadwal Lama</div>
                        <div class="change-value">{{ firstPatientJadwal }}</div>
                      </div>
                      <div class="change-icon">
                        <i class="fas fa-arrow-right"></i>
                      </div>
                      <div class="change-box change-new">
                        <div class="change-label">Jadwal Baru</div>
                        <div class="change-value">{{ jamBaru.jam_mulai }} - {{ jamBaru.tidakDitentukan ? 'Selesai' : (jamBaru.jam_selesai || '??:??') }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- WA Message Preview -->
                <div class="preview-card">
                  <div class="preview-header">
                    <i class="fab fa-whatsapp"></i>
                    <span>Preview Pesan WhatsApp</span>
                  </div>
                  <div class="preview-bubble">
                    <div class="preview-text" v-html="messagePreviewHtml"></div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import cnsDokterOffService from '@/services/cnsDokterOffService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()
const loading = ref(false)
const notifLoading = ref(false)
const pasienList = ref([])
const dokterList = ref([])
const poliList = ref([])
const selectedRows = ref([])
const selectAll = ref(false)
const searchKeyword = ref('')

const filters = reactive({
  tgl_registrasi: new Date().toISOString().split('T')[0],
  kd_dokter: '',
  kd_poli: ''
})

const jamBaru = reactive({
  jam_mulai: '16:00',
  jam_selesai: '16:00',
  tidakDitentukan: true
})

// Computed
const selectedDokterName = computed(() => {
  if (!filters.kd_dokter) return '[ NAMA DOKTER ]'
  const d = dokterList.value.find(x => x.kd_dokter === filters.kd_dokter)
  return d?.nm_dokter || '[ NAMA DOKTER ]'
})

const firstPatientJadwal = computed(() => {
  const first = pasienList.value[0]
  if (!first?.jadwal_jam_mulai) return '—'
  return first.jadwal_jam_mulai.substring(0,5) + ' - ' + (first.jadwal_jam_selesai?.substring(0,5) || '??:??')
})

const messagePreviewHtml = computed(() => {
  const dokterName = selectedDokterName.value
  const hariReg = filters.tgl_registrasi
    ? formatDate(filters.tgl_registrasi)
    : 'ini'

  const jamMulai = jamBaru.jam_mulai || '??:??'
  const jamSelesai = jamBaru.tidakDitentukan ? 'Selesai' : (jamBaru.jam_selesai || '??:??')

  let msg = ''
  msg += 'Yth. Bpk/Ibu :<br>'
  msg += '<b>[ NAMA PASIEN ]</b><br><br>'
  msg += `Kami informasikan adanya perubahan jam praktik untuk dokter <b>${dokterName}</b> pada <b>${hariReg}</b> menjadi jam <b>${jamMulai} s/d ${jamSelesai}</b>.<br><br>`
  msg += 'Mohon maaf atas ketidaknyamanan 🙏🙏.<br>'
  msg += 'Terima kasih atas perhatian dan kerjasamanya.<br><br>'
  msg += '<b>RSIA AISYIYAH PEKAJANGAN</b><br>-----<br>'
  msg += 'pertanyaan dan informasi dapat disampaikan ke nomor 085640009934'
  return msg
})

const filteredPasien = computed(() => {
  if (!searchKeyword.value) return pasienList.value
  const kw = searchKeyword.value.toLowerCase()
  return pasienList.value.filter(item => {
    const nama = (item.pasien_some_data?.nm_pasien || '').toLowerCase()
    const rm = (item.no_rkm_medis || '').toLowerCase()
    const rawat = (item.no_rawat || '').toLowerCase()
    return nama.includes(kw) || rm.includes(kw) || rawat.includes(kw)
  })
})

// Methods
const isValidPhone = (phone) => {
  if (!phone) return false
  return /^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

const fetchDropdowns = async () => {
  try {
    const [dokterRes, poliRes] = await Promise.all([
      cnsDokterOffService.getDokterList(),
      cnsDokterOffService.getPoliklinikList()
    ])
    dokterList.value = dokterRes.data?.response || []
    poliList.value = poliRes.data?.response || []
  } catch (e) {
    console.error(e)
    toast.error('Gagal memuat data dropdown')
  }
}

const fetchData = async () => {
  if (!filters.kd_dokter) { pasienList.value = []; return }
  loading.value = true
  selectedRows.value = []; selectAll.value = false
  try {
    const res = await cnsDokterOffService.getRegistrasiJamPoli({
      tgl_registrasi: filters.tgl_registrasi,
      kd_dokter: filters.kd_dokter,
      kd_poli: filters.kd_poli || undefined
    })
    pasienList.value = res.data?.response || []
  } catch (e) { console.error(e); toast.error('Gagal memuat data pasien') }
  finally { loading.value = false }
}

const onDokterChange = () => fetchData()

const toggleSelectAll = () => {
  selectedRows.value = selectAll.value ? filteredPasien.value.map(p => p.no_rkm_medis) : []
}

const toggleRowSelection = (noRkm) => {
  const idx = selectedRows.value.indexOf(noRkm)
  if (idx > -1) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(noRkm)
}

const confirmSendNotification = async () => {
  if (!jamBaru.jam_mulai) {
    toast.warning('Silakan isi jam mulai baru terlebih dahulu')
    return
  }

  const invalidCount = pasienList.value
    .filter(p => selectedRows.value.includes(p.no_rkm_medis) && !isValidPhone(p.pasien_some_data?.no_tlp)).length

  const jamSelesai = jamBaru.tidakDitentukan ? 'Selesai' : (jamBaru.jam_selesai || '??:??')

  let warningText = `<strong>${selectedRows.value.length}</strong> pasien akan diberitahu perubahan jam praktik.`
  warningText += `<br><br><strong>Jam baru:</strong> ${jamBaru.jam_mulai} s/d ${jamSelesai}`
  if (invalidCount > 0) {
    warningText += `<br><br><span style="color:#f59e0b"><i class="fas fa-exclamation-triangle"></i> ${invalidCount} pasien memiliki nomor tidak valid.</span>`
  }

  const result = await Swal.fire({
    title: 'Kirim Notifikasi Perubahan Jam?',
    html: warningText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-bell"></i> Ya, Kirim Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6b7280',
  })

  if (result.isConfirmed) await sendNotification()
}

const sendNotification = async () => {
  notifLoading.value = true
  try {
    const payload = {
      kd_dokter: filters.kd_dokter,
      tgl_registrasi: filters.tgl_registrasi,
      no_rkm_medis: selectedRows.value,
      jam_mulai_baru: jamBaru.jam_mulai,
      jam_selesai_baru: jamBaru.tidakDitentukan ? null : jamBaru.jam_selesai,
    }
    const res = await cnsDokterOffService.kirimNotifikasiJamPoli(payload)
    toast.success(res.data?.metadata?.message || 'Notifikasi berhasil dikirim')
    selectedRows.value = []; selectAll.value = false
  } catch (e) { console.error(e); toast.error('Gagal mengirim notifikasi') }
  finally { notifLoading.value = false }
}

watch(selectedRows, (val) => {
  selectAll.value = val.length > 0 && val.length === filteredPasien.value.length
})

onMounted(() => fetchDropdowns())
</script>

<style scoped>
.jam-poli-wrapper {
  --primary: #3b82f6;
  --primary-light: #60a5fa;
  --primary-dark: #1e40af;
  --accent: #10b981;
  --accent-light: #34d399;
  --danger: #ef4444;
  --warning: #f59e0b;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --surface-3: #f1f5f9;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --radius: 16px;
  --radius-sm: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  padding: 24px;
  background: var(--surface-2);
}

.jam-poli-container { max-width: 1440px; margin: 0 auto; }

/* Hero */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
  border-radius: var(--radius);
  padding: 28px 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
.hero-header::before { content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: rgba(255,255,255,0.08); border-radius: 50%; }
.hero-content { display: flex; align-items: center; gap: 20px; position: relative; z-index: 1; }
.hero-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; flex-shrink: 0; }
.hero-title { color: white; font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
.hero-subtitle { color: rgba(255,255,255,0.85); font-size: 0.9rem; margin: 4px 0 0; }

/* Filter */
.filter-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; margin-bottom: 24px; }
.filter-header { padding: 16px 24px; background: var(--surface-3); font-weight: 700; font-size: 0.85rem; color: var(--text); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
.filter-header i { color: var(--primary); }
.filter-body { padding: 20px 24px; }
.filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: end; }
.filter-label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.03em; }
.filter-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text); background: var(--surface); transition: var(--transition); outline: none; font-family: inherit; }
.filter-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.filter-input:disabled { background: var(--surface-3); opacity: 0.6; }
.custom-select-wrapper { position: relative; }
.filter-select { appearance: none; -webkit-appearance: none; padding-right: 36px; cursor: pointer; }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.75rem; pointer-events: none; }
.btn-fetch { width: 100%; padding: 10px 20px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border: none; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-fetch:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.35); }
.btn-fetch:disabled { opacity: 0.6; cursor: not-allowed; }

/* Content */
.content-area { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
.table-section { min-width: 0; }
.table-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-header { padding: 18px 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
.table-title-area { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.table-title { font-size: 1rem; font-weight: 800; color: var(--text); margin: 0; display: flex; align-items: center; gap: 10px; }
.table-title i { color: var(--primary); }
.record-count { background: var(--primary); color: white; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
.table-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-input-wrapper { position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.8rem; }
.search-input { padding: 8px 14px 8px 34px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; transition: var(--transition); width: 200px; font-family: inherit; }
.search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.btn-notify { padding: 8px 18px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border: none; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.btn-notify:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.35); }
.btn-notify:disabled { opacity: 0.6; cursor: not-allowed; }

/* Table */
.desktop-table { display: block; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; background: var(--surface-3); font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; text-align: left; white-space: nowrap; border-bottom: 1px solid var(--border); }
.th-check { width: 44px; }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 0.85rem; vertical-align: middle; }
.data-row { transition: var(--transition); }
.data-row:hover { background: rgba(59,130,246,0.03); }
.row-selected { background: rgba(59,130,246,0.06) !important; }
.invalid-phone { border-left: 3px solid var(--warning); }
.cell-primary { font-weight: 600; color: var(--text); }
.cell-secondary { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
.text-accent { color: var(--accent) !important; }
.text-muted-light { color: var(--text-muted); }

.jadwal-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; }
.jadwal-old { background: rgba(59,130,246,0.1); color: var(--primary-dark); }
.jadwal-badge-sm { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 5px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }

.phone-cell { display: flex; align-items: center; gap: 6px; }
.phone-valid { color: #10b981; font-weight: 600; }
.phone-invalid { color: var(--warning); }
.phone-warn { color: var(--warning); font-size: 0.75rem; }

/* Checkbox */
.custom-check { display: inline-flex; position: relative; cursor: pointer; user-select: none; }
.custom-check input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark { height: 20px; width: 20px; background: var(--surface); border: 2px solid var(--border); border-radius: 5px; transition: var(--transition); display: flex; align-items: center; justify-content: center; }
.custom-check input:checked ~ .checkmark { background: var(--primary); border-color: var(--primary); }
.custom-check input:checked ~ .checkmark::after { content: ''; width: 5px; height: 10px; border: solid white; border-width: 0 2.5px 2.5px 0; transform: rotate(45deg); margin-top: -2px; }
.custom-check:hover .checkmark { border-color: var(--primary-light); }

/* Loading & Empty */
.loading-cell, .empty-cell { text-align: center; padding: 48px 16px !important; }
.loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0; }
.loading-spinner p, .empty-state p { color: var(--text-muted); font-size: 0.88rem; margin: 0; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 0; }
.empty-state i { font-size: 2.5rem; color: var(--border); }

/* Mobile Cards */
.mobile-cards { display: none; }
.patient-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius-sm); margin: 10px 16px; transition: var(--transition); cursor: pointer; overflow: hidden; }
.card-selected { border-color: var(--primary); background: rgba(59,130,246,0.03); }
.patient-card-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--surface-3); }
.patient-name { font-weight: 700; color: var(--text); flex: 1; font-size: 0.9rem; }
.patient-card-body { padding: 12px 16px; }
.card-info-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.82rem; }
.card-label { color: var(--text-muted); font-weight: 500; }
.card-value { color: var(--text); font-weight: 600; text-align: right; }

/* Schedule Panel */
.schedule-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; position: sticky; top: 24px; }
.schedule-header { padding: 16px 20px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; }
.schedule-body { padding: 20px; }
.schedule-notice { display: flex; gap: 12px; padding: 16px; background: rgba(59,130,246,0.06); border-radius: var(--radius-sm); align-items: flex-start; }
.schedule-notice i { color: var(--primary); margin-top: 2px; flex-shrink: 0; }
.schedule-notice p { font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
.schedule-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.form-label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }

/* Time Inputs */
.time-inputs { display: flex; align-items: end; gap: 8px; }
.time-input { text-align: center; font-weight: 700; font-size: 1rem !important; padding: 12px 10px !important; }
.time-arrow { color: var(--text-muted); padding-bottom: 12px; font-size: 0.85rem; }

/* Toggle */
.toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.82rem; color: var(--text-secondary); user-select: none; }
.toggle-switch { width: 40px; height: 22px; background: var(--border); border-radius: 11px; position: relative; transition: var(--transition); flex-shrink: 0; }
.toggle-on { background: var(--primary); }
.toggle-knob { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: var(--transition); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.toggle-on .toggle-knob { left: 20px; }

/* Change Summary */
.change-summary { margin-top: 4px; }
.change-arrow-row { display: flex; align-items: center; gap: 8px; }
.change-box { flex: 1; padding: 10px 12px; border-radius: 8px; text-align: center; }
.change-old { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); }
.change-new { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); }
.change-label { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.03em; }
.change-old .change-value { color: #ef4444; font-weight: 800; font-size: 0.88rem; margin-top: 2px; }
.change-new .change-value { color: #10b981; font-weight: 800; font-size: 0.88rem; margin-top: 2px; }
.change-icon { color: var(--text-muted); font-size: 0.75rem; }

/* WA Preview */
.preview-card { margin-top: 20px; border: 1.5px solid #d1fae5; border-radius: var(--radius-sm); overflow: hidden; }
.preview-header { padding: 10px 14px; background: #25d366; color: white; font-weight: 700; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; }
.preview-header i { font-size: 1.1rem; }
.preview-bubble { padding: 14px; background: #f0fdf4; }
.preview-text { background: white; padding: 14px 16px; border-radius: 0 12px 12px 12px; border-left: 3px solid #25d366; font-size: 0.82rem; line-height: 1.65; color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.06); word-break: break-word; }

/* Responsive */
@media (max-width: 1200px) {
  .content-area { grid-template-columns: 1fr; }
  .schedule-panel { order: -1; }
  .schedule-card { position: static; }
}
@media (max-width: 768px) {
  .jam-poli-wrapper { padding: 12px; }
  .hero-header { padding: 20px; border-radius: var(--radius-sm); }
  .hero-title { font-size: 1.2rem; }
  .hero-icon { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 10px; }
  .filter-grid { grid-template-columns: 1fr; gap: 12px; }
  .filter-body { padding: 16px; }
  .table-header { padding: 14px 16px; flex-direction: column; align-items: stretch; }
  .table-actions { flex-direction: column; }
  .search-input { width: 100%; }
  .btn-notify { width: 100%; justify-content: center; }
  .desktop-table { display: none; }
  .mobile-cards { display: block; padding-bottom: 8px; }
  .schedule-body { padding: 16px; }
}
@media (max-width: 480px) {
  .hero-title { font-size: 1.05rem; }
  .hero-subtitle { font-size: 0.8rem; }
  .time-inputs { flex-direction: column; }
  .time-arrow { transform: rotate(90deg); text-align: center; padding: 0; }
}
</style>
