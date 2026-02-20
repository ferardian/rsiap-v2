<template>
  <div class="dokter-off-wrapper">
    <div class="dokter-off-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-user-minus"></i>
          </div>
          <div>
            <h1 class="hero-title">Dokter Off / Libur</h1>
            <p class="hero-subtitle">Notifikasi pasien saat dokter berhalangan praktik</p>
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
                <input 
                  type="date" 
                  v-model="filters.tgl_registrasi" 
                  class="filter-input"
                  @change="fetchData"
                >
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
                  <input 
                    type="text" 
                    v-model="searchKeyword" 
                    placeholder="Cari nama/no. RM..."
                    class="search-input"
                  >
                </div>
                <button 
                  v-if="selectedRows.length > 0"
                  class="btn-notify"
                  @click="confirmSendNotification"
                  :disabled="notifLoading"
                >
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
                    <th>Jadwal</th>
                    <th>No. Telp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="6" class="loading-cell">
                      <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Memuat data pasien...</p>
                      </div>
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
                  <tr 
                    v-for="item in filteredPasien" 
                    :key="item.no_rawat" 
                    class="data-row"
                    :class="{ 'row-selected': selectedRows.includes(item.no_rkm_medis), 'invalid-phone': !isValidPhone(item.pasien_some_data?.no_tlp) }"
                  >
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
                      <div v-if="item.jadwal_jam_mulai" class="jadwal-badge">
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
              <div v-if="loading" class="loading-spinner">
                <div class="spinner"></div>
                <p>Memuat data pasien...</p>
              </div>
              <div v-else-if="filteredPasien.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p v-if="!filters.kd_dokter">Pilih dokter untuk menampilkan data pasien</p>
                <p v-else>Tidak ada data pasien untuk filter ini</p>
              </div>
              <div 
                v-for="item in filteredPasien" 
                :key="'m-' + item.no_rawat" 
                class="patient-card"
                :class="{ 'card-selected': selectedRows.includes(item.no_rkm_medis), 'card-invalid-phone': !isValidPhone(item.pasien_some_data?.no_tlp) }"
                @click="toggleRowSelection(item.no_rkm_medis)"
              >
                <div class="patient-card-header">
                  <label class="custom-check" @click.stop>
                    <input type="checkbox" :value="item.no_rkm_medis" v-model="selectedRows">
                    <span class="checkmark"></span>
                  </label>
                  <div class="patient-name">{{ item.pasien_some_data?.nm_pasien || '-' }}</div>
                  <div v-if="item.jadwal_jam_mulai" class="jadwal-badge-sm">
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
                    <span class="card-label">No. RM</span>
                    <span class="card-value">{{ item.no_rkm_medis }}</span>
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
                      <i v-if="!isValidPhone(item.pasien_some_data?.no_tlp)" class="fas fa-exclamation-triangle phone-warn"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Jadwal Pengganti Panel -->
        <div class="schedule-panel" :class="{ 'panel-visible': filters.kd_dokter }">
          <div class="schedule-card">
            <div class="schedule-header">
              <i class="fas fa-calendar-alt"></i>
              <span>Jadwal Praktik Pengganti</span>
            </div>
            <div class="schedule-body">
              <div v-if="!filters.kd_dokter" class="schedule-notice">
                <i class="fas fa-info-circle"></i>
                <p>Pilih <strong>dokter</strong> pada filter di atas untuk menampilkan jadwal pengganti.</p>
              </div>
              <template v-else>
                <div class="schedule-form">
                  <div class="form-group">
                    <label class="form-label">Tanggal Pengganti</label>
                    <input 
                      type="date" 
                      v-model="jadwalPengganti.tanggal" 
                      class="filter-input"
                      @change="fetchJadwalPengganti"
                    >
                  </div>
                  <div class="form-group" v-if="jadwalPenggantiList.length > 0">
                    <label class="form-label">Pilih Poli Pengganti</label>
                    <div 
                      v-for="j in jadwalPenggantiList" 
                      :key="j.kd_poli + j.jam_mulai"
                      class="schedule-option"
                      :class="{ 'option-selected': jadwalPengganti.selected?.kd_poli === j.kd_poli && jadwalPengganti.selected?.jam_mulai === j.jam_mulai }"
                      @click="selectJadwalPengganti(j)"
                    >
                      <div class="option-radio">
                        <div class="radio-dot" v-if="jadwalPengganti.selected?.kd_poli === j.kd_poli && jadwalPengganti.selected?.jam_mulai === j.jam_mulai"></div>
                      </div>
                      <div class="option-details">
                        <div class="option-poli">{{ j.poliklinik?.nm_poli || j.kd_poli }}</div>
                        <div class="option-time">
                          <i class="far fa-clock"></i>
                          {{ j.jam_mulai?.substring(0,5) }} - {{ j.jam_selesai?.substring(0,5) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="jadwalPengganti.loading" class="schedule-loading">
                    <div class="spinner-sm"></div>
                    <span>Memuat jadwal...</span>
                  </div>
                  <div v-else-if="jadwalPengganti.tanggal" class="schedule-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>Tidak ada jadwal dokter ini pada tanggal tersebut</p>
                  </div>
                </div>

                <!-- Selected Info Summary -->
                <div v-if="jadwalPengganti.selected" class="selected-summary">
                  <div class="summary-header">
                    <i class="fas fa-check-circle"></i>
                    <span>Jadwal Pengganti Dipilih</span>
                  </div>
                  <div class="summary-body">
                    <div class="summary-item">
                      <span class="summary-label">Tanggal</span>
                      <span class="summary-value">{{ formatDate(jadwalPengganti.tanggal) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Poli</span>
                      <span class="summary-value">{{ jadwalPengganti.selected?.poliklinik?.nm_poli }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Jam</span>
                      <span class="summary-value">{{ jadwalPengganti.selected?.jam_mulai?.substring(0,5) }} - {{ jadwalPengganti.selected?.jam_selesai?.substring(0,5) }}</span>
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

const jadwalPengganti = reactive({
  tanggal: new Date().toISOString().split('T')[0],
  loading: false,
  selected: null
})

const jadwalPenggantiList = ref([])

// Computed
const selectedDokterName = computed(() => {
  if (!filters.kd_dokter) return '[ NAMA DOKTER ]'
  const d = dokterList.value.find(x => x.kd_dokter === filters.kd_dokter)
  return d?.nm_dokter || '[ NAMA DOKTER ]'
})

const messagePreviewHtml = computed(() => {
  const dokterName = selectedDokterName.value
  const hariReg = filters.tgl_registrasi
    ? formatDate(filters.tgl_registrasi)
    : 'ini'

  let jadwalText = ''
  if (jadwalPengganti.selected && jadwalPengganti.tanggal) {
    const hariGanti = formatDate(jadwalPengganti.tanggal)
    const mulai = jadwalPengganti.selected.jam_mulai?.substring(0,5) || ''
    const selesai = jadwalPengganti.selected.jam_selesai?.substring(0,5) || ''
    jadwalText = ` pada hari ${hariGanti} (${mulai} - ${selesai}).`
  } else {
    jadwalText = ' di hari lain.'
  }

  let msg = ''
  msg += 'Assalamualaikum wr. wb.<br>'
  msg += 'Selamat siang Bapak/Ibu 🙏😊<br><br>'
  msg += `Kepada pasien <b><i>${dokterName}</i></b> `
  msg += `hari ${hariReg}, poliklinik ${dokterName} ( JAM PRAKTIK ).<br>`
  msg += '<b>TUTUP PRAKTIK</b>.<br><br>'
  msg += `Pasien dapat mengatur ulang jadwal periksa${jadwalText}<br><br>`
  msg += 'Kami sangat menghargai jika Bapak/Ibu dapat memberikan konfirmasi penerimaan informasi ini.<br>'
  msg += 'Terima kasih atas perhatian dan pengertiannya 🙏<br><br>'
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
  if (!filters.kd_dokter) {
    pasienList.value = []
    return
  }
  loading.value = true
  selectedRows.value = []
  selectAll.value = false
  try {
    const res = await cnsDokterOffService.getRegistrasi({
      tgl_registrasi: filters.tgl_registrasi,
      kd_dokter: filters.kd_dokter,
      kd_poli: filters.kd_poli || undefined
    })
    pasienList.value = res.data?.response || []
  } catch (e) {
    console.error(e)
    toast.error('Gagal memuat data pasien')
  } finally {
    loading.value = false
  }
}

const onDokterChange = () => {
  fetchData()
  fetchJadwalPengganti()
}

const fetchJadwalPengganti = async () => {
  if (!filters.kd_dokter || !jadwalPengganti.tanggal) {
    jadwalPenggantiList.value = []
    return
  }
  jadwalPengganti.loading = true
  jadwalPengganti.selected = null
  try {
    const res = await cnsDokterOffService.getJadwalPengganti({
      kd_dokter: filters.kd_dokter,
      tanggal: jadwalPengganti.tanggal
    })
    jadwalPenggantiList.value = res.data?.response || []
  } catch (e) {
    console.error(e)
  } finally {
    jadwalPengganti.loading = false
  }
}

const selectJadwalPengganti = (jadwal) => {
  jadwalPengganti.selected = jadwal
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = filteredPasien.value.map(p => p.no_rkm_medis)
  } else {
    selectedRows.value = []
  }
}

const toggleRowSelection = (noRkm) => {
  const idx = selectedRows.value.indexOf(noRkm)
  if (idx > -1) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(noRkm)
}

const confirmSendNotification = async () => {
  const invalidCount = pasienList.value
    .filter(p => selectedRows.value.includes(p.no_rkm_medis) && !isValidPhone(p.pasien_some_data?.no_tlp))
    .length

  let warningText = `<strong>${selectedRows.value.length}</strong> pasien akan menerima notifikasi reschedule.`
  if (invalidCount > 0) {
    warningText += `<br><br><span style="color:#f59e0b"><i class="fas fa-exclamation-triangle"></i> ${invalidCount} pasien memiliki nomor telepon tidak valid dan tidak akan menerima notifikasi.</span>`
  }

  if (jadwalPengganti.selected) {
    warningText += `<br><br><strong>Jadwal pengganti:</strong><br>${jadwalPengganti.selected.poliklinik?.nm_poli} — ${jadwalPengganti.selected.jam_mulai?.substring(0,5)} s/d ${jadwalPengganti.selected.jam_selesai?.substring(0,5)}<br>${formatDate(jadwalPengganti.tanggal)}`
  }

  const result = await Swal.fire({
    title: 'Kirim Notifikasi?',
    html: warningText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-bell"></i> Ya, Kirim Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'swal-premium'
    }
  })

  if (result.isConfirmed) {
    await sendNotification()
  }
}

const sendNotification = async () => {
  notifLoading.value = true
  try {
    const payload = {
      kd_dokter: filters.kd_dokter,
      tgl_registrasi: filters.tgl_registrasi,
      no_rkm_medis: selectedRows.value,
    }

    if (jadwalPengganti.selected) {
      payload.tanggal_pengganti = jadwalPengganti.tanggal
      payload.jam_mulai = jadwalPengganti.selected.jam_mulai
      payload.jam_selesai = jadwalPengganti.selected.jam_selesai
    }

    const res = await cnsDokterOffService.kirimNotifikasi(payload)
    toast.success(res.data?.metadata?.message || 'Notifikasi berhasil dikirim')
    selectedRows.value = []
    selectAll.value = false
  } catch (e) {
    console.error(e)
    toast.error('Gagal mengirim notifikasi')
  } finally {
    notifLoading.value = false
  }
}

// Watch selectAll sync
watch(selectedRows, (val) => {
  selectAll.value = val.length > 0 && val.length === filteredPasien.value.length
})

onMounted(() => {
  fetchDropdowns()
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════ */
/*  VARIABLES                                         */
/* ══════════════════════════════════════════════════ */
.dokter-off-wrapper {
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
  --radius-xs: 6px;
  --shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 24px rgba(0,0,0,0.1);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  padding: 24px;
  background: var(--surface-2);
}

.dokter-off-container {
  max-width: 1440px;
  margin: 0 auto;
}

/* ══════════════════════════════════════════════════ */
/*  HERO HEADER                                       */
/* ══════════════════════════════════════════════════ */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
  border-radius: var(--radius);
  padding: 28px 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
}

.hero-header::after {
  content: '';
  position: absolute;
  bottom: -60%;
  left: 10%;
  width: 200px;
  height: 200px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.hero-icon {
  width: 56px;
  height: 56px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.hero-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin: 4px 0 0;
}

/* ══════════════════════════════════════════════════ */
/*  FILTER SECTION                                    */
/* ══════════════════════════════════════════════════ */
.filter-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 24px;
}

.filter-header {
  padding: 16px 24px;
  background: var(--surface-3);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}

.filter-header i {
  color: var(--primary);
}

.filter-body {
  padding: 20px 24px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: end;
}

.filter-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  color: var(--text);
  background: var(--surface);
  transition: var(--transition);
  outline: none;
  font-family: inherit;
}

.filter-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.custom-select-wrapper {
  position: relative;
}

.filter-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.75rem;
  pointer-events: none;
}

.btn-fetch {
  width: 100%;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-fetch:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}

.btn-fetch:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ══════════════════════════════════════════════════ */
/*  CONTENT AREA                                      */
/* ══════════════════════════════════════════════════ */
.content-area {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.table-section { min-width: 0; }

/* Table Card */
.table-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-header {
  padding: 18px 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.table-title-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-title i { color: var(--primary); }

.record-count {
  background: var(--primary);
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.8rem;
}

.search-input {
  padding: 8px 14px 8px 34px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  outline: none;
  transition: var(--transition);
  width: 200px;
  font-family: inherit;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}

.btn-notify {
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--accent) 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn-notify:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16,185,129,0.35);
}

.btn-notify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table */
.desktop-table { display: block; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 16px;
  background: var(--surface-3);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}

.th-check { width: 44px; }

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
  vertical-align: middle;
}

.data-row {
  transition: var(--transition);
}

.data-row:hover {
  background: rgba(99,102,241,0.03);
}

.row-selected {
  background: rgba(99,102,241,0.06) !important;
}

.invalid-phone {
  border-left: 3px solid var(--warning);
}

.cell-primary {
  font-weight: 600;
  color: var(--text);
}

.cell-secondary {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.text-accent { color: var(--primary) !important; }
.text-muted-light { color: var(--text-muted); }

.jadwal-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(99,102,241,0.08);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.phone-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.phone-valid { color: var(--accent); font-weight: 600; }
.phone-invalid { color: var(--warning); }
.phone-warn { color: var(--warning); font-size: 0.75rem; }

/* Custom Checkbox */
.custom-check {
  display: inline-flex;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.custom-check input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 5px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-check input:checked ~ .checkmark {
  background: var(--primary);
  border-color: var(--primary);
}

.custom-check input:checked ~ .checkmark::after {
  content: '';
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.custom-check:hover .checkmark {
  border-color: var(--primary-light);
}

/* Loading & Empty */
.loading-cell, .empty-cell { text-align: center; padding: 48px 16px !important; }

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0;
}

.loading-spinner p, .empty-state p {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin: 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 0;
}

.empty-state i {
  font-size: 2.5rem;
  color: var(--border);
}

/* Mobile Cards */
.mobile-cards { display: none; }

.patient-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  margin: 10px 16px;
  transition: var(--transition);
  cursor: pointer;
  overflow: hidden;
}

.patient-card:active {
  transform: scale(0.99);
}

.card-selected {
  border-color: var(--primary);
  background: rgba(99,102,241,0.03);
}

.card-invalid-phone {
  border-left: 3px solid var(--warning);
}

.patient-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-3);
}

.patient-name {
  font-weight: 700;
  color: var(--text);
  flex: 1;
  font-size: 0.9rem;
}

.jadwal-badge-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(99,102,241,0.1);
  color: var(--primary);
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.patient-card-body { padding: 12px 16px; }

.card-info-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.82rem;
}

.card-label {
  color: var(--text-muted);
  font-weight: 500;
}

.card-value {
  color: var(--text);
  font-weight: 600;
  text-align: right;
}

/* ══════════════════════════════════════════════════ */
/*  SCHEDULE PANEL                                    */
/* ══════════════════════════════════════════════════ */
.schedule-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  position: sticky;
  top: 24px;
}

.schedule-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--accent) 0%, #059669 100%);
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-body { padding: 20px; }

.schedule-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(99,102,241,0.06);
  border-radius: var(--radius-sm);
  align-items: flex-start;
}

.schedule-notice i {
  color: var(--primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.schedule-notice p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.schedule-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.schedule-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 8px;
}

.schedule-option:hover {
  border-color: var(--accent-light);
  background: rgba(16,185,129,0.03);
}

.option-selected {
  border-color: var(--accent) !important;
  background: rgba(16,185,129,0.06) !important;
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.option-selected .option-radio {
  border-color: var(--accent);
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
}

.option-details { flex: 1; }

.option-poli {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text);
}

.option-time {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.schedule-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.schedule-empty {
  text-align: center;
  padding: 20px;
}

.schedule-empty i {
  font-size: 2rem;
  color: var(--border);
  margin-bottom: 8px;
}

.schedule-empty p {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin: 0;
}

/* Summary */
.selected-summary {
  margin-top: 16px;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.summary-header {
  padding: 10px 14px;
  background: rgba(16,185,129,0.08);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-body { padding: 12px 14px; }

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.8rem;
}

.summary-label { color: var(--text-muted); }

.summary-value {
  color: var(--text);
  font-weight: 600;
  text-align: right;
}

/* ══════════════════════════════════════════════════ */
/*  WA MESSAGE PREVIEW                                */
/* ══════════════════════════════════════════════════ */
.preview-card {
  margin-top: 20px;
  border: 1.5px solid #d1fae5;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.preview-header {
  padding: 10px 14px;
  background: #25d366;
  color: white;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-header i { font-size: 1.1rem; }

.preview-bubble {
  padding: 14px;
  background: #f0fdf4;
}

.preview-text {
  background: white;
  padding: 14px 16px;
  border-radius: 0 12px 12px 12px;
  border-left: 3px solid #25d366;
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  word-break: break-word;
}

/* ══════════════════════════════════════════════════ */
/*  RESPONSIVE                                        */
/* ══════════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .content-area {
    grid-template-columns: 1fr;
  }

  .schedule-panel {
    order: -1;
  }

  .schedule-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .dokter-off-wrapper {
    padding: 12px;
  }

  .hero-header {
    padding: 20px;
    border-radius: var(--radius-sm);
  }

  .hero-title { font-size: 1.2rem; }
  .hero-icon { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 10px; }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-body { padding: 16px; }

  .table-header {
    padding: 14px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    flex-direction: column;
  }

  .search-input { width: 100%; }

  .btn-notify { width: 100%; justify-content: center; }

  .desktop-table { display: none; }
  .mobile-cards { display: block; padding-bottom: 8px; }

  .schedule-body { padding: 16px; }
}

@media (max-width: 480px) {
  .hero-content { gap: 14px; }
  .hero-title { font-size: 1.05rem; }
  .hero-subtitle { font-size: 0.8rem; }

  .filter-card { border-radius: var(--radius-sm); }
  .table-card { border-radius: var(--radius-sm); }
  .schedule-card { border-radius: var(--radius-sm); }
}

/* ══════════════════════════════════════════════════ */
/*  SWAL OVERRIDE                                     */
/* ══════════════════════════════════════════════════ */
:global(.swal-premium) {
  border-radius: 16px !important;
  font-family: inherit !important;
}
</style>
