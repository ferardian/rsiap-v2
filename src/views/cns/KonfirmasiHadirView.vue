<template>
  <div class="kh-wrapper">
    <div class="kh-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div>
            <h1 class="hero-title">Konfirmasi Hadir</h1>
            <p class="hero-subtitle">Notifikasi pasien bahwa poli sudah dibuka dan meminta konfirmasi kehadiran</p>
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
                  <select v-model="filters.kd_dokter" class="filter-input filter-select" @change="fetchData">
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
                  <span class="btn-notify-text">Kirim Konfirmasi ({{ selectedRows.length }})</span>
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

        <!-- Right: Preview Pesan -->
        <div class="preview-section">
          <div class="preview-card-wrap">
            <div class="preview-header">
              <i class="fab fa-whatsapp"></i>
              <span>Preview Pesan WA</span>
            </div>
            <div class="preview-bubble">
              <div class="preview-text" v-html="messagePreviewHtml"></div>
            </div>
            <div class="preview-note">
              <i class="fas fa-info-circle"></i>
              Nama pasien akan disesuaikan per penerima
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

// Computed
const selectedDokterName = computed(() => {
  if (!filters.kd_dokter) return '[ NAMA DOKTER ]'
  const d = dokterList.value.find(x => x.kd_dokter === filters.kd_dokter)
  return d?.nm_dokter || '[ NAMA DOKTER ]'
})

const selectedPoliName = computed(() => {
  if (!filters.kd_poli) return '[ NAMA POLI ]'
  const p = poliList.value.find(x => x.kd_poli === filters.kd_poli)
  return p?.nm_poli || '[ NAMA POLI ]'
})

const currentSapaan = computed(() => {
  const h = new Date().getHours()
  if (h >= 0 && h < 11) return 'pagi'
  if (h >= 11 && h < 15) return 'siang'
  if (h >= 15 && h < 19) return 'sore'
  return 'malam'
})

const messagePreviewHtml = computed(() => {
  const dokter = selectedDokterName.value
  const poli = selectedPoliName.value
  const sapaan = currentSapaan.value

  let msg = 'Assalamualaikum wr. wb.<br>'
  msg += 'RSIA AISYIYAH PEKAJANGAN<br><br>'
  msg += `Selamat ${sapaan} <b>[ NAMA PASIEN ]</b> 🙏😊<br><br>`
  msg += `Menginformasikan untuk poli <b>${poli}</b> <b>${dokter}</b> untuk hari ini sudah dimulai.<br>`
  msg += 'Dimohon segera datang.<br><br>'
  msg += 'Apakah pasien hadir periksa untuk hari ini?<br>'
  msg += 'Kami tunggu balasan dari pasien.<br>'
  msg += 'Apabila pasien berhalangan hadir dimohon untuk mengkonfirmasi kami.<br><br>'
  msg += 'Terima kasih<br><br>'
  msg += 'Sehat dan Bahagia bersama kami! 😊'
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
    const res = await cnsDokterOffService.getRegistrasiKonfirmasiHadir({
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

  let warningText = `<strong>${selectedRows.value.length}</strong> pasien akan menerima notifikasi konfirmasi hadir.`
  if (invalidCount > 0) {
    warningText += `<br><br><span style="color:#f59e0b"><i class="fas fa-exclamation-triangle"></i> ${invalidCount} pasien memiliki nomor telepon tidak valid dan tidak akan menerima notifikasi.</span>`
  }

  const result = await Swal.fire({
    title: 'Kirim Konfirmasi Hadir?',
    html: warningText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-bell"></i> Ya, Kirim Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
  })

  if (result.isConfirmed) {
    await sendNotification()
  }
}

const sendNotification = async () => {
  notifLoading.value = true
  try {
    const res = await cnsDokterOffService.kirimNotifikasiKonfirmasiHadir({
      kd_dokter: filters.kd_dokter,
      tgl_registrasi: filters.tgl_registrasi,
      no_rkm_medis: selectedRows.value,
      kd_poli: filters.kd_poli || undefined
    })
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

watch(selectedRows, (val) => {
  selectAll.value = val.length > 0 && val.length === filteredPasien.value.length
})

onMounted(() => {
  fetchDropdowns()
})
</script>

<style scoped>
.kh-wrapper {
  --primary: #3b82f6;
  --primary-light: #60a5fa;
  --primary-dark: #1e40af;
  --accent: #10b981;
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

.kh-container {
  max-width: 1440px;
  margin: 0 auto;
}

/* Hero */
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
  top: -50%; right: -20%;
  width: 300px; height: 300px;
  background: rgba(255,255,255,0.08);
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
  width: 56px; height: 56px;
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
.hero-title { color: white; font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
.hero-subtitle { color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 4px 0 0; }

/* Filter */
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
.filter-header i { color: var(--primary); }
.filter-body { padding: 20px 24px; }
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
  border: 1.5px solid #e2e8f0;
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
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.custom-select-wrapper { position: relative; }
.filter-select { appearance: none; padding-right: 36px; cursor: pointer; }
.select-icon {
  position: absolute;
  right: 12px; top: 50%;
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
.btn-fetch:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.35); }
.btn-fetch:disabled { opacity: 0.6; cursor: not-allowed; }

/* Content Area */
.content-area {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

/* Table Card */
.table-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}
.table-title-area { display: flex; align-items: center; gap: 12px; }
.table-title {
  font-size: 1rem; font-weight: 700; color: var(--text);
  display: flex; align-items: center; gap: 10px; margin: 0;
}
.table-title i { color: var(--primary); }
.record-count {
  background: var(--primary); color: white;
  font-size: 0.75rem; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
}
.table-actions { display: flex; align-items: center; gap: 10px; }
.search-input-wrapper { position: relative; }
.search-icon {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%); color: var(--text-muted); font-size: 0.8rem;
}
.search-input {
  padding: 8px 12px 8px 32px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  outline: none;
  transition: var(--transition);
  width: 200px;
}
.search-input:focus { border-color: var(--primary); }
.btn-notify {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white; border: none; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.btn-notify:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.35); }
.btn-notify:disabled { opacity: 0.6; cursor: not-allowed; }

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px;
  font-size: 0.75rem; font-weight: 700;
  color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.04em; background: #f8fafc;
  border-bottom: 1px solid #f1f5f9; text-align: left;
}
.th-check { width: 48px; }
.data-row { transition: var(--transition); border-bottom: 1px solid #f8fafc; }
.data-row:hover { background: rgba(59,130,246,0.03); }
.row-selected { background: rgba(59,130,246,0.06) !important; }
.invalid-phone { border-left: 3px solid var(--warning); }
.data-table td { padding: 14px 16px; }
.td-check { width: 48px; }
.cell-primary { font-size: 0.88rem; font-weight: 600; color: var(--text); }
.cell-secondary { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.text-accent { color: var(--accent); }
.jadwal-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #eff6ff; color: #1d4ed8;
  font-size: 0.78rem; font-weight: 600;
  padding: 4px 10px; border-radius: 999px;
}
.text-muted-light { color: var(--text-muted); font-size: 0.85rem; }
.phone-cell { display: flex; align-items: center; gap: 6px; }
.phone-valid { color: #059669; font-size: 0.85rem; font-weight: 500; }
.phone-invalid { color: var(--text-muted); font-size: 0.85rem; }
.phone-warn { color: var(--warning); font-size: 0.78rem; }

/* Custom Checkbox */
.custom-check { display: flex; cursor: pointer; }
.custom-check input { display: none; }
.checkmark {
  width: 18px; height: 18px;
  border: 2px solid #cbd5e1; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
  flex-shrink: 0;
}
.custom-check input:checked ~ .checkmark {
  background: var(--primary); border-color: var(--primary);
}
.custom-check input:checked ~ .checkmark::after {
  content: '✓'; color: white; font-size: 11px; font-weight: 700;
}

/* Loading / Empty */
.loading-cell, .empty-cell { padding: 60px 20px !important; }
.loading-spinner, .empty-state { text-align: center; color: var(--text-muted); }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state i { font-size: 2rem; margin-bottom: 12px; display: block; }

/* Mobile Cards */
.mobile-cards { display: none; }
.patient-card {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: var(--transition);
}
.patient-card:hover { background: rgba(59,130,246,0.03); }
.card-selected { background: rgba(59,130,246,0.06) !important; }
.card-invalid-phone { border-left: 3px solid var(--warning); }
.patient-card-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
}
.patient-name { font-weight: 700; font-size: 0.9rem; flex: 1; }
.jadwal-badge-sm {
  font-size: 0.72rem; color: #1d4ed8;
  background: #eff6ff;
  padding: 2px 8px; border-radius: 999px;
}
.card-info-row {
  display: flex; justify-content: space-between;
  align-items: center; padding: 4px 0;
  font-size: 0.82rem;
}
.card-label { color: var(--text-muted); }
.card-value { font-weight: 500; color: var(--text); text-align: right; }

/* Preview Panel */
.preview-section { position: sticky; top: 24px; }
.preview-card-wrap {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.preview-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.preview-header i { font-size: 1.1rem; }
.preview-bubble {
  padding: 20px;
  background: #e5ddd5;
}
.preview-text {
  background: white;
  border-radius: 12px 12px 12px 0;
  padding: 14px 16px;
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.preview-note {
  padding: 12px 20px;
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  border-top: 1px solid #f1f5f9;
}

/* Responsive */
@media (max-width: 1100px) {
  .content-area { grid-template-columns: 1fr; }
  .preview-section { position: static; }
}
@media (max-width: 768px) {
  .kh-wrapper { padding: 16px; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .desktop-table { display: none; }
  .mobile-cards { display: block; }
  .table-header { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; }
}
@media (max-width: 480px) {
  .filter-grid { grid-template-columns: 1fr; }
}
</style>
