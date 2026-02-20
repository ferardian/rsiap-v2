<template>
  <div class="kontrol-wrapper">
    <div class="kontrol-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div>
            <h1 class="hero-title">Registrasi Kontrol</h1>
            <p class="hero-subtitle">Daftar pasien BPJS yang memiliki surat kontrol namun belum mendaftar ulang</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-card">
          <div class="filter-header">
            <i class="fas fa-filter"></i>
            <span>Filter Tanggal Rencana Kontrol</span>
          </div>
          <div class="filter-body">
            <div class="filter-grid">
              <div class="filter-item">
                <label class="filter-label">Dari Tanggal</label>
                <input type="date" v-model="filters.tgl_dari" class="filter-input" @change="fetchData">
              </div>
              <div class="filter-item">
                <label class="filter-label">Sampai Tanggal</label>
                <input type="date" v-model="filters.tgl_sampai" class="filter-input" @change="fetchData">
              </div>
              <div class="filter-item">
                <label class="filter-label">Cari Pasien / No. SEP</label>
                <input type="text" v-model="searchKeyword" class="filter-input" placeholder="Cari nama/no. SEP..." >
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
        <!-- Table -->
        <div class="table-section">
          <div class="table-card">
            <div class="table-header">
              <div class="table-title-area">
                <h3 class="table-title">
                  <i class="fas fa-clipboard-list"></i>
                  Daftar Surat Kontrol
                </h3>
                <span class="record-count" v-if="dataList.length > 0">
                  {{ selectedRows.length }}/{{ dataList.length }} dipilih
                </span>
              </div>
              <div class="table-actions">
                <button
                  v-if="selectedRows.length > 0"
                  class="btn-notify"
                  @click="confirmSendNotification"
                  :disabled="notifLoading"
                >
                  <i class="fas" :class="notifLoading ? 'fa-spinner fa-spin' : 'fa-bell'"></i>
                  <span>Kirim Pengingat ({{ selectedRows.length }})</span>
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
                    <th>Pasien</th>
                    <th>No. SEP / Surat</th>
                    <th>Dokter</th>
                    <th>Tgl. Surat</th>
                    <th>Tgl. Kontrol</th>
                    <th>Pelayanan</th>
                    <th>No. Telp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="8" class="loading-cell">
                      <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Memuat data surat kontrol...</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="filteredList.length === 0">
                    <td colspan="8" class="empty-cell">
                      <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Tidak ada data surat kontrol untuk periode ini</p>
                      </div>
                    </td>
                  </tr>
                  <tr
                    v-for="item in filteredList"
                    :key="item.no_surat"
                    class="data-row"
                    :class="{ 'row-selected': selectedRows.includes(item.no_surat), 'invalid-phone': !isValidPhone(item.sep?.pasien?.no_tlp) }"
                  >
                    <td class="td-check">
                      <label class="custom-check">
                        <input type="checkbox" :value="item.no_surat" v-model="selectedRows">
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.sep?.nama_pasien || '-' }}</div>
                      <div class="cell-secondary">{{ item.sep?.nomr || '-' }}</div>
                    </td>
                    <td>
                      <div class="cell-badge blue">{{ item.no_sep }}</div>
                      <div class="cell-badge amber mt-1">{{ item.no_surat }}</div>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.sep?.nmdpdjp || '-' }}</div>
                    </td>
                    <td>
                      <div class="cell-primary">{{ formatDate(item.tgl_surat) }}</div>
                    </td>
                    <td>
                      <div class="tgl-kontrol-badge">{{ formatDate(item.tgl_rencana) }}</div>
                    </td>
                    <td>
                      <span class="pelayanan-badge" :class="item.sep?.jnspelayanan == '1' ? 'ranap' : 'ralan'">
                        {{ item.sep?.jnspelayanan == '1' ? 'Rawat Inap' : 'Rawat Jalan' }}
                      </span>
                    </td>
                    <td>
                      <div class="phone-cell">
                        <span :class="{ 'phone-valid': isValidPhone(item.sep?.pasien?.no_tlp), 'phone-invalid': !isValidPhone(item.sep?.pasien?.no_tlp) }">
                          {{ item.sep?.pasien?.no_tlp || '-' }}
                        </span>
                        <i v-if="!isValidPhone(item.sep?.pasien?.no_tlp)" class="fas fa-exclamation-triangle phone-warn"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="mobile-cards">
              <div v-if="loading" class="loading-spinner" style="padding:40px;text-align:center">
                <div class="spinner"></div>
                <p>Memuat data...</p>
              </div>
              <div v-else-if="filteredList.length === 0" class="empty-state" style="padding:40px;text-align:center">
                <i class="fas fa-inbox"></i>
                <p>Tidak ada data surat kontrol</p>
              </div>
              <div
                v-for="item in filteredList"
                :key="'m-'+item.no_surat"
                class="patient-card"
                :class="{ 'card-selected': selectedRows.includes(item.no_surat) }"
                @click="toggleRowSelection(item.no_surat)"
              >
                <div class="patient-card-header">
                  <label class="custom-check" @click.stop>
                    <input type="checkbox" :value="item.no_surat" v-model="selectedRows">
                    <span class="checkmark"></span>
                  </label>
                  <div class="patient-name">{{ item.sep?.nama_pasien || '-' }}</div>
                  <span class="pelayanan-badge" :class="item.sep?.jnspelayanan == '1' ? 'ranap' : 'ralan'">
                    {{ item.sep?.jnspelayanan == '1' ? 'RI' : 'RJ' }}
                  </span>
                </div>
                <div class="patient-card-body">
                  <div class="card-info-row">
                    <span class="card-label">No. SEP</span>
                    <span class="card-value">{{ item.no_sep }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">Dokter</span>
                    <span class="card-value">{{ item.sep?.nmdpdjp || '-' }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">Tgl. Kontrol</span>
                    <span class="card-value" style="color:#d97706;font-weight:700">{{ formatDate(item.tgl_rencana) }}</span>
                  </div>
                  <div class="card-info-row">
                    <span class="card-label">No. Telp</span>
                    <span class="card-value" :class="{ 'phone-valid': isValidPhone(item.sep?.pasien?.no_tlp), 'phone-invalid': !isValidPhone(item.sep?.pasien?.no_tlp) }">
                      {{ item.sep?.pasien?.no_tlp || '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Panel -->
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
              Data akan disesuaikan per pasien
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
const dataList = ref([])
const selectedRows = ref([])
const selectAll = ref(false)
const searchKeyword = ref('')

const today = new Date().toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

const filters = reactive({
  tgl_dari: today,
  tgl_sampai: nextWeek,
})

// Computed
const currentSapaan = computed(() => {
  const h = new Date().getHours()
  if (h >= 0 && h < 11) return 'pagi'
  if (h >= 11 && h < 15) return 'siang'
  if (h >= 15 && h < 19) return 'sore'
  return 'malam'
})

const messagePreviewHtml = computed(() => {
  const sapaan = currentSapaan.value
  let msg = 'Assalamualaikum wr. wb.<br>'
  msg += 'RSIA AISYIYAH PEKAJANGAN<br><br>'
  msg += `Selamat ${sapaan} Bapak/Ibu <b>[ NAMA PASIEN ]</b> 🙏😊<br>`
  msg += 'Mengingatkan untuk jadwal kontrol Anda:<br><br>'
  msg += '🗓 <b>Tanggal</b> : [ Tanggal Rencana ]<br>'
  msg += '🩺 <b>Dokter</b>  : [ Nama Dokter ]<br><br>'
  msg += 'Apakah sudah melakukan pendaftaran untuk kontrol melalui <b>aplikasi Mobile JKN</b>?<br>'
  msg += 'Mohon konfirmasi Bapak/Ibu.<br><br>'
  msg += 'Apabila ada kendala saat mendaftar, Bapak/Ibu bisa hubungi kami kembali.<br><br>'
  msg += 'Terima kasih<br>'
  msg += 'Sehat dan Bahagia bersama kami 😊'
  return msg
})

const filteredList = computed(() => {
  if (!searchKeyword.value) return dataList.value
  const kw = searchKeyword.value.toLowerCase()
  return dataList.value.filter(item => {
    const nama = (item.sep?.nama_pasien || '').toLowerCase()
    const noSep = (item.no_sep || '').toLowerCase()
    const noSurat = (item.no_surat || '').toLowerCase()
    return nama.includes(kw) || noSep.includes(kw) || noSurat.includes(kw)
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
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

const fetchData = async () => {
  loading.value = true
  selectedRows.value = []
  selectAll.value = false
  try {
    const res = await cnsDokterOffService.getKontrolList({
      tgl_dari: filters.tgl_dari,
      tgl_sampai: filters.tgl_sampai,
    })
    dataList.value = res.data?.response || []
  } catch (e) {
    console.error(e)
    toast.error('Gagal memuat data surat kontrol')
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = filteredList.value.map(p => p.no_surat)
  } else {
    selectedRows.value = []
  }
}

const toggleRowSelection = (noSurat) => {
  const idx = selectedRows.value.indexOf(noSurat)
  if (idx > -1) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(noSurat)
}

const confirmSendNotification = async () => {
  const invalidCount = dataList.value
    .filter(p => selectedRows.value.includes(p.no_surat) && !isValidPhone(p.sep?.pasien?.no_tlp))
    .length

  let warningText = `<strong>${selectedRows.value.length}</strong> pasien akan menerima pengingat kontrol via WhatsApp.`
  if (invalidCount > 0) {
    warningText += `<br><br><span style="color:#f59e0b"><i class="fas fa-exclamation-triangle"></i> ${invalidCount} pasien memiliki nomor telepon tidak valid dan tidak akan menerima notifikasi.</span>`
  }

  const result = await Swal.fire({
    title: 'Kirim Pengingat Kontrol?',
    html: warningText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-bell"></i> Ya, Kirim Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6b7280',
  })

  if (result.isConfirmed) {
    await sendNotification()
  }
}

const sendNotification = async () => {
  notifLoading.value = true
  try {
    const res = await cnsDokterOffService.kirimNotifikasiKontrol({
      no_surat: selectedRows.value,
    })
    toast.success(res.data?.metadata?.message || 'Pengingat berhasil dikirim')
    selectedRows.value = []
    selectAll.value = false
  } catch (e) {
    console.error(e)
    toast.error('Gagal mengirim pengingat')
  } finally {
    notifLoading.value = false
  }
}

watch(selectedRows, (val) => {
  selectAll.value = val.length > 0 && val.length === filteredList.value.length
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.kontrol-wrapper {
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
.kontrol-container { max-width: 1440px; margin: 0 auto; }

/* Hero */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
  border-radius: var(--radius); padding: 28px 32px; margin-bottom: 24px;
  position: relative; overflow: hidden;
}
.hero-header::before {
  content: ''; position: absolute; top: -50%; right: -20%;
  width: 300px; height: 300px; background: rgba(255,255,255,0.08); border-radius: 50%;
}
.hero-content { display: flex; align-items: center; gap: 20px; position: relative; z-index: 1; }
.hero-icon {
  width: 56px; height: 56px; background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px); border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; color: white; flex-shrink: 0;
}
.hero-title { color: white; font-size: 1.5rem; font-weight: 800; margin: 0; }
.hero-subtitle { color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 4px 0 0; }

/* Filter */
.filter-card {
  background: var(--surface); border-radius: var(--radius);
  box-shadow: var(--shadow); overflow: hidden; margin-bottom: 24px;
}
.filter-header {
  padding: 16px 24px; background: var(--surface-3);
  font-weight: 700; font-size: 0.85rem; color: var(--text);
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border);
}
.filter-header i { color: var(--primary); }
.filter-body { padding: 20px 24px; }
.filter-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; align-items: end;
}
.filter-label {
  display: block; font-size: 0.78rem; font-weight: 600;
  color: var(--text-secondary); margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 0.03em;
}
.filter-input {
  width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text);
  background: var(--surface); transition: var(--transition); outline: none; font-family: inherit;
}
.filter-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.btn-fetch {
  width: 100%; padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white; border: none; border-radius: var(--radius-sm);
  font-size: 0.88rem; font-weight: 700; cursor: pointer;
  transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-fetch:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.35); }
.btn-fetch:disabled { opacity: 0.6; cursor: not-allowed; }

/* Content Area */
.content-area { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }

/* Table Card */
.table-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; gap: 12px;
}
.table-title-area { display: flex; align-items: center; gap: 12px; }
.table-title { font-size: 1rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 10px; margin: 0; }
.table-title i { color: var(--primary); }
.record-count {
  background: var(--primary); color: white;
  font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 999px;
}
.btn-notify {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white; border: none; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: var(--transition);
}
.btn-notify:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.35); }
.btn-notify:disabled { opacity: 0.6; cursor: not-allowed; }

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 16px; font-size: 0.75rem; font-weight: 700;
  color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.04em; background: #f8fafc;
  border-bottom: 1px solid #f1f5f9; text-align: left;
}
.th-check { width: 48px; }
.data-row { transition: var(--transition); border-bottom: 1px solid #f8fafc; }
.data-row:hover { background: rgba(59,130,246,0.03); }
.row-selected { background: rgba(59,130,246,0.06) !important; }
.invalid-phone { border-left: 3px solid #ef4444; }
.data-table td { padding: 12px 16px; }
.td-check { width: 48px; }
.cell-primary { font-size: 0.88rem; font-weight: 600; color: var(--text); }
.cell-secondary { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.cell-badge {
  display: inline-block; font-size: 0.72rem; font-weight: 600;
  padding: 2px 8px; border-radius: 6px;
}
.cell-badge.blue { background: #eff6ff; color: #1d4ed8; }
.cell-badge.amber { background: #fef3c7; color: #92400e; }
.mt-1 { margin-top: 4px; }
.tgl-kontrol-badge { font-size: 0.85rem; font-weight: 700; color: var(--primary-dark); }
.pelayanan-badge {
  display: inline-block; font-size: 0.72rem; font-weight: 700;
  padding: 3px 8px; border-radius: 999px;
}
.pelayanan-badge.ranap { background: #fee2e2; color: #991b1b; }
.pelayanan-badge.ralan { background: #dbeafe; color: #1e40af; }
.phone-cell { display: flex; align-items: center; gap: 6px; }
.phone-valid { color: #059669; font-size: 0.85rem; font-weight: 500; }
.phone-invalid { color: var(--text-muted); font-size: 0.85rem; }
.phone-warn { color: #ef4444; font-size: 0.78rem; }

/* Custom Checkbox */
.custom-check { display: flex; cursor: pointer; }
.custom-check input { display: none; }
.checkmark {
  width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 5px;
  display: flex; align-items: center; justify-content: center; transition: var(--transition); flex-shrink: 0;
}
.custom-check input:checked ~ .checkmark { background: var(--primary); border-color: var(--primary); }
.custom-check input:checked ~ .checkmark::after { content: '✓'; color: white; font-size: 11px; font-weight: 700; }

/* Loading / Empty */
.loading-cell, .empty-cell { padding: 60px 20px !important; }
.loading-spinner, .empty-state { text-align: center; color: var(--text-muted); }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e2e8f0;
  border-top-color: var(--primary); border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state i { font-size: 2rem; margin-bottom: 12px; display: block; }

/* Mobile Cards */
.mobile-cards { display: none; }
.patient-card { padding: 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: var(--transition); }
.patient-card:hover { background: rgba(59,130,246,0.03); }
.card-selected { background: rgba(59,130,246,0.06) !important; }
.patient-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.patient-name { font-weight: 700; font-size: 0.9rem; flex: 1; }
.patient-card-body {}
.card-info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 0; font-size: 0.82rem;
}
.card-label { color: var(--text-muted); }
.card-value { font-weight: 500; color: var(--text); text-align: right; }

/* Preview Panel */
.preview-section { position: sticky; top: 24px; }
.preview-card-wrap { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.preview-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white; font-weight: 700; font-size: 0.88rem;
  display: flex; align-items: center; gap: 10px;
}
.preview-header i { font-size: 1.1rem; }
.preview-bubble { padding: 20px; background: #e5ddd5; }
.preview-text {
  background: white; border-radius: 12px 12px 12px 0;
  padding: 14px 16px; font-size: 0.82rem; line-height: 1.65;
  color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.preview-note {
  padding: 12px 20px; font-size: 0.75rem; color: var(--text-muted);
  display: flex; align-items: center; gap: 6px; border-top: 1px solid #f1f5f9;
}

/* Responsive */
@media (max-width: 1100px) {
  .content-area { grid-template-columns: 1fr; }
  .preview-section { position: static; }
}
@media (max-width: 768px) {
  .kontrol-wrapper { padding: 16px; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .desktop-table { display: none; }
  .mobile-cards { display: block; }
  .table-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .filter-grid { grid-template-columns: 1fr; }
}
</style>
