<template>
  <div class="broadcast-wrapper">
    <div class="broadcast-container">
      <!-- Standard Page Header -->
      <div class="page-header mb-4">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-bullhorn"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Broadcast Pengumuman Karyawan</h3>
            <p class="page-subtitle mb-0 small text-muted">
              Kirim notifikasi atau pengumuman WhatsApp massal dinamis ke pegawai RSIA Aisyiyah Pekajangan
            </p>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="main-grid">
        <!-- Form & Target Selection Area -->
        <div class="left-section">
          <!-- Card 1: Target Penerima -->
          <div class="card-custom mb-4">
            <div class="card-header-custom">
              <div class="d-flex align-items-center gap-2">
                <i class="fas fa-users-cog text-primary"></i>
                <span class="fw-bold">1. Pilih Target Penerima</span>
              </div>
              <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold small">
                {{ targetCount }} Pegawai Terpilih
              </span>
            </div>
            <div class="card-body-custom">
              <!-- Target Type Selector Cards -->
              <div class="target-type-grid mb-3">
                <div 
                  class="target-type-card" 
                  :class="{ active: form.target_type === 'semua' }"
                  @click="setTargetType('semua')"
                >
                  <div class="target-icon bg-blue-subtle text-primary">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="target-info">
                    <div class="target-name">Semua Pegawai</div>
                    <div class="target-desc">Seluruh pegawai aktif RSIA</div>
                  </div>
                </div>

                <div 
                  class="target-type-card" 
                  :class="{ active: form.target_type === 'departemen' }"
                  @click="setTargetType('departemen')"
                >
                  <div class="target-icon bg-emerald-subtle text-emerald">
                    <i class="fas fa-building"></i>
                  </div>
                  <div class="target-info">
                    <div class="target-name">Per Departemen</div>
                    <div class="target-desc">Filter per unit/departemen</div>
                  </div>
                </div>

                <div 
                  class="target-type-card" 
                  :class="{ active: form.target_type === 'terpilih' }"
                  @click="setTargetType('terpilih')"
                >
                  <div class="target-icon bg-purple-subtle text-purple">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="target-info">
                    <div class="target-name">Pilih Manual</div>
                    <div class="target-desc">Pilih pegawai tertentu</div>
                  </div>
                </div>
              </div>

              <!-- Department Filter Dropdown (If target_type == departemen) -->
              <div v-if="form.target_type === 'departemen'" class="departemen-select-wrapper mb-3">
                <label class="form-label-custom">Pilih Departemen / Unit Work</label>
                <select v-model="form.departemen" class="form-select-custom" @change="fetchPegawai">
                  <option value="">-- Semua Departemen --</option>
                  <option v-for="dept in departemenList" :key="dept.dep_id" :value="dept.dep_id">
                    {{ dept.nama }}
                  </option>
                </select>
              </div>

              <!-- Table / List of Selected Pegawai (If target_type == terpilih) -->
              <div v-if="form.target_type === 'terpilih'" class="pegawai-selection-card rounded-xl p-3 border mb-3">
                <div class="selection-control-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
                  <div class="search-box-custom flex-grow-1" style="max-width: 340px;">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                      type="text" 
                      v-model="searchKeyword" 
                      placeholder="Cari NIK / Nama / Jabatan..." 
                      class="search-input-pill"
                    >
                    <button v-if="searchKeyword" class="btn-clear-search" @click="searchKeyword = ''">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn-action-select btn-select-all" @click="selectAllPegawai">
                      <i class="fas fa-check-circle me-1.5" style="margin-right: 6px;"></i>
                      <span>Pilih Semua</span>
                      <span class="count-badge ms-1.5" style="margin-left: 6px;">({{ filteredPegawaiList.length }})</span>
                    </button>
                    <button class="btn-action-select btn-deselect-all" @click="deselectAllPegawai">
                      <i class="fas fa-minus-circle me-1.5" style="margin-right: 6px;"></i>
                      <span>Batal Semua</span>
                    </button>
                  </div>
                </div>

                <!-- Scrollable Table -->
                <div class="pegawai-table-scroll-container rounded-lg border bg-white">
                  <table class="table table-hover align-middle mb-0 text-sm">
                    <thead class="table-header-slate sticky-top">
                      <tr>
                        <th style="width: 44px;" class="text-center">#</th>
                        <th>Pegawai</th>
                        <th>Departemen</th>
                        <th>Jabatan</th>
                        <th class="text-end">No. WA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loadingPegawai">
                        <td colspan="5" class="text-center py-5 text-muted">
                          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                          Memuat daftar pegawai...
                        </td>
                      </tr>
                      <tr v-else-if="!filteredPegawaiList.length">
                        <td colspan="5" class="text-center py-5 text-muted">
                          <i class="fas fa-user-slash fa-2x mb-2 d-block text-slate-300"></i>
                          Pegawai tidak ditemukan.
                        </td>
                      </tr>
                      <tr 
                        v-for="p in filteredPegawaiList" 
                        :key="p.nik"
                        class="pegawai-row cursor-pointer"
                        :class="{ 'row-selected': form.selectedNiks.includes(p.nik) }"
                        @click="togglePegawaiSelection(p.nik)"
                      >
                        <td class="text-center" @click.stop>
                          <label class="custom-checkbox">
                            <input 
                              type="checkbox" 
                              :value="p.nik" 
                              v-model="form.selectedNiks" 
                            >
                            <span class="checkmark-box"></span>
                          </label>
                        </td>
                        <td>
                          <div class="d-flex align-items-center gap-3">
                            <div class="avatar-circle">
                              {{ p.nama ? p.nama.charAt(0).toUpperCase() : 'P' }}
                            </div>
                            <div class="d-flex flex-column" style="gap: 3px;">
                              <div class="fw-bold text-slate-800 line-clamp-1">{{ p.nama }}</div>
                              <div><span class="nik-badge">NIK: {{ p.nik }}</span></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="text-slate-700 fw-medium">{{ p.nama_departemen || '-' }}</span>
                        </td>
                        <td>
                          <span class="text-slate-600">{{ p.jbtn || '-' }}</span>
                        </td>
                        <td class="text-end">
                          <span 
                            v-if="isValidPhone(p.no_telp)" 
                            class="phone-badge phone-badge-valid"
                          >
                            <i class="fab fa-whatsapp me-1"></i>
                            {{ p.no_telp }}
                          </span>
                          <span 
                            v-else 
                            class="phone-badge phone-badge-invalid"
                          >
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            {{ p.no_telp || '0' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Pesan Dinamis & Template -->
          <div class="card-custom">
            <div class="card-header-custom">
              <div class="d-flex align-items-center gap-2">
                <i class="fas fa-edit text-primary"></i>
                <span class="fw-bold">2. Tulis Pesan Broadcast</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <select v-model="selectedTemplate" class="form-select-sm-custom" @change="applyTemplate">
                  <option value="">-- Pilih Template Pesan --</option>
                  <option value="pengumuman">📢 Pengumuman Resmi</option>
                  <option value="rapat">👥 Undangan Rapat / Pertemuan</option>
                  <option value="inmut">📊 Pengingat Laporan Inmut</option>
                  <option value="custom">✏️ Pesan Kosong / Custom</option>
                </select>
              </div>
            </div>
            <div class="card-body-custom">
              <!-- Judul / Subjek Pesan -->
              <div class="mb-3">
                <label class="form-label-custom">Judul Pengumuman (Opsional)</label>
                <input 
                  type="text" 
                  v-model="form.judul" 
                  placeholder="Contoh: PENGUMUMAN Wajib Apel Hari Senin" 
                  class="form-control-custom"
                >
              </div>

              <!-- Variable Insert Buttons -->
              <div class="mb-2">
                <label class="form-label-custom d-flex justify-content-between align-items-center mb-1">
                  <span>Isi Pesan WhatsApp</span>
                  <small class="text-muted">Klik tag untuk menyisipkan variabel dinamis:</small>
                </label>
                <div class="d-flex flex-wrap gap-1.5 mb-2">
                  <button type="button" class="btn-tag" @click="insertTag('{nama}')">+ {nama}</button>
                  <button type="button" class="btn-tag" @click="insertTag('{nik}')">+ {nik}</button>
                  <button type="button" class="btn-tag" @click="insertTag('{jbtn}')">+ {jbtn}</button>
                  <button type="button" class="btn-tag" @click="insertTag('{departemen}')">+ {departemen}</button>
                </div>
              </div>

              <!-- Message Textarea -->
              <div class="mb-3">
                <textarea 
                  ref="messageTextarea" 
                  v-model="form.pesan" 
                  rows="9" 
                  placeholder="Tulis pesan pengumuman di sini..." 
                  class="form-textarea-custom"
                ></textarea>
                <div class="d-flex justify-content-between align-items-center mt-1 text-muted small">
                  <span>Gunakan <b>*teks tebal*</b>, <i>_teks miring_</i>, atau ~teks dicoret~</span>
                  <span>{{ form.pesan.length }} Karakter</span>
                </div>
              </div>

              <!-- Channel Selector (Opsi Pengiriman) -->
              <div class="mb-3 p-3 rounded-xl border bg-slate-50">
                <label class="form-label-custom mb-2 d-flex align-items-center gap-2">
                  <i class="fas fa-paper-plane text-primary"></i>
                  <span>Saluran / Channel Broadcast:</span>
                </label>
                <div class="channel-selector-grid">
                  <div 
                    class="channel-option-card" 
                    :class="{ active: isChannelSelected('both') }"
                    @click="setChannel('both')"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <div class="channel-icon bg-amber-subtle text-amber-600">
                        <i class="fas fa-bolt"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-sm text-slate-800">Dual Blast (WA + FCM)</div>
                        <div class="text-xs text-slate-500">Kirim ke WhatsApp & Push Notif HP</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    class="channel-option-card" 
                    :class="{ active: isChannelSelected('wa') }"
                    @click="setChannel('wa')"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <div class="channel-icon bg-emerald-subtle text-emerald">
                        <i class="fab fa-whatsapp"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-sm text-slate-800">WhatsApp Saja</div>
                        <div class="text-xs text-slate-500">Kirim via WAHA Gateway</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    class="channel-option-card" 
                    :class="{ active: isChannelSelected('fcm') }"
                    @click="setChannel('fcm')"
                  >
                    <div class="d-flex align-items-center gap-2">
                      <div class="channel-icon bg-blue-subtle text-primary">
                        <i class="fas fa-bell"></i>
                      </div>
                      <div>
                        <div class="fw-bold text-sm text-slate-800">Push Notif (FCM) Saja</div>
                        <div class="text-xs text-slate-500">Kirim ke App Mobile Pegawai</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="d-flex justify-content-end">
                <button 
                  class="btn-send-broadcast"
                  :disabled="sendingNotif || !form.pesan.trim() || targetCount === 0"
                  @click="confirmSendBroadcast"
                >
                  <i class="fas" :class="sendingNotif ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                  <span>{{ sendingNotif ? 'Mengirim Broadcast...' : `Kirim Broadcast (${targetCount} Pegawai)` }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section: Live Preview (WA & FCM) -->
        <div class="right-section">
          <div class="preview-card-wrap">
            <!-- Preview Tab Switcher -->
            <div class="preview-tabs-bar">
              <button 
                class="tab-btn" 
                :class="{ active: activePreviewTab === 'wa' }"
                @click="activePreviewTab = 'wa'"
              >
                <i class="fab fa-whatsapp me-1 text-emerald"></i> WhatsApp
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activePreviewTab === 'fcm' }"
                @click="activePreviewTab = 'fcm'"
              >
                <i class="fas fa-bell me-1 text-primary"></i> Push Notif (FCM)
              </button>
            </div>

            <!-- WhatsApp Preview Bubble -->
            <template v-if="activePreviewTab === 'wa'">
              <div class="preview-header">
                <i class="fab fa-whatsapp me-2"></i>
                <span>Simulasi Preview Pesan WA</span>
              </div>
              <div class="preview-bubble-bg">
                <div class="preview-bubble">
                  <div class="preview-header-bar">
                    <i class="fas fa-bullhorn text-danger me-1"></i> RSIA AISYIYAH PEKAJANGAN
                  </div>
                  <div class="preview-text" v-html="messagePreviewHtml"></div>
                  <div class="preview-timestamp">
                    {{ currentTimeFormatted }} <i class="fas fa-check-double text-primary ms-1"></i>
                  </div>
                </div>
              </div>
              <div class="preview-info-box">
                <i class="fas fa-info-circle text-primary me-2"></i>
                <span>Variabel <b>{nama}</b>, <b>{nik}</b>, dll. akan otomatis digantikan sesuai data tiap pegawai saat terkirim.</span>
              </div>
            </template>

            <!-- FCM Push Notification Preview -->
            <template v-else>
              <div class="preview-header">
                <i class="fas fa-mobile-alt me-2 text-white"></i>
                <span>Simulasi Push Notif HP (FCM)</span>
              </div>
              <div class="fcm-preview-bg">
                <div class="fcm-notification-card">
                  <div class="fcm-card-header">
                    <div class="fcm-app-badge">
                      <div class="fcm-app-icon">
                        <i class="fas fa-hospital"></i>
                      </div>
                      <span class="fcm-app-name">MESSA</span>
                    </div>
                    <span class="fcm-time">Sekarang</span>
                  </div>
                  <div class="fcm-card-body">
                    <div class="fcm-title">{{ form.judul || '📢 Pengumuman Pegawai' }}</div>
                    <div class="fcm-text">{{ fcmPreviewText }}</div>
                  </div>
                </div>
              </div>
              <div class="preview-info-box">
                <i class="fas fa-info-circle text-primary me-2"></i>
                <span>Teks di tray notifikasi HP dibatasi ~140 karakter. Pesan pengumuman lengkap akan terbuka di aplikasi saat notifikasi di-tap.</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import cnsDokterOffService from '@/services/cnsDokterOffService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()

// State
const loadingPegawai = ref(false)
const sendingNotif = ref(false)
const activePreviewTab = ref('wa') // 'wa' | 'fcm'
const pegawaiList = ref([])
const departemenList = ref([])
const searchKeyword = ref('')
const selectedTemplate = ref('')
const messageTextarea = ref(null)

const form = reactive({
  judul: 'PENGUMUMAN PEGAWAI',
  pesan: `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu *{nama}* ({jbtn} - {departemen})

Menginformasikan pengumuman penting bagi seluruh karyawan RSIA Aisyiyah Pekajangan.

Mohon untuk dapat mencermati informasi tersebut. Terima kasih atas perhatian dan kerjasamanya. 🙏😊

*RSIA AISYIYAH PEKAJANGAN*`,
  target_type: 'semua', // semua | departemen | terpilih
  departemen: '',
  selectedNiks: [],
  channels: ['wa', 'fcm'] // wa, fcm
})

// Channel Helper Methods
const isChannelSelected = (type) => {
  if (type === 'both') return form.channels.includes('wa') && form.channels.includes('fcm')
  if (type === 'wa') return form.channels.includes('wa') && !form.channels.includes('fcm')
  if (type === 'fcm') return form.channels.includes('fcm') && !form.channels.includes('wa')
  return false
}

const setChannel = (type) => {
  if (type === 'both') {
    form.channels = ['wa', 'fcm']
    activePreviewTab.value = 'wa'
  } else if (type === 'wa') {
    form.channels = ['wa']
    activePreviewTab.value = 'wa'
  } else if (type === 'fcm') {
    form.channels = ['fcm']
    activePreviewTab.value = 'fcm'
  }
}

// Greeting/opening line patterns to strip from FCM notification body
const FCM_SKIP_PATTERNS = [
  /^assalamualaikum/i,
  /^wa\.?alaikumsalam/i,
  /^yth\./i,
  /^kepada yth/i,
  /^dear\b/i,
  /^dengan hormat/i,
  /^salam/i,
  /^bapak\/ibu/i,
  /^bapak\b/i,
  /^ibu\b/i,
  /^\s*$/,
]

// Computeds
const fcmPreviewText = computed(() => {
  if (!form.pesan) return ''

  let text = form.pesan
    .replace(/\{nama\}/g, 'Ahmad Fulan, S.Kep')
    .replace(/\{nik\}/g, '1.233.0726')
    .replace(/\{jbtn\}/g, 'Staf Pelaksana')
    .replace(/\{departemen\}/g, 'SDI & Hukormas')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~([^~]+)~/g, '$1')

  // Skip greeting/salutation lines and find the first substantive line
  const lines = text.split('\n')
  const substantiveLines = []
  let foundContent = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (!foundContent && FCM_SKIP_PATTERNS.some(p => p.test(trimmed))) continue
    if (trimmed === '') {
      if (foundContent) substantiveLines.push('')
      continue
    }
    foundContent = true
    substantiveLines.push(trimmed)
  }

  const core = substantiveLines.join(' ').trim()
  return core.length > 140 ? core.substring(0, 140) + '...' : core
})

// Templates Preset
const templates = {
  pengumuman: {
    judul: 'PENGUMUMAN RESMI',
    pesan: `Assalamualaikum Wr. Wb.
Yth. Bapak/Ibu *{nama}* ({jbtn} - {departemen})

Disampaikan pengumuman resmi dari Manajemen RSIA Aisyiyah Pekajangan.

Demikian pengumuman ini disampaikan untuk menjadi perhatian bersama. Terima kasih 🙏😊

*RSIA AISYIYAH PEKAJANGAN*`
  },
  rapat: {
    judul: 'UNDANGAN PERTEMUAN / RAPAT',
    pesan: `Yth. Bapak/Ibu *{nama}*
NIK: {nik} ({jbtn})

Mengundang kehadiran Bapak/Ibu pada acara Rapat Koordinasi Internal Unit *{departemen}*.

Mohon konfirmasi kehadiran. Terima kasih.`
  },
  inmut: {
    judul: 'PENGINGAT LAPORAN INDIKATOR MUTU',
    pesan: `PENGINGAT LAPORAN MUTU 📊
Kepada Yth. PIC Mutu Unit *{departemen}* (Bpk/Ibu *{nama}*)

Mengingatkan untuk segera menginputkan laporan pengisian Indikator Mutu periode bulan ini sebelum batas waktu penutupan.

Terima kasih atas dedikasinya. 🙏`
  },
  custom: {
    judul: '',
    pesan: ''
  }
}

// Computed Properties
const filteredPegawaiList = computed(() => {
  if (!searchKeyword.value) return pegawaiList.value
  const kw = searchKeyword.value.toLowerCase()
  return pegawaiList.value.filter(p => {
    return (p.nama || '').toLowerCase().includes(kw) ||
           (p.nik || '').toLowerCase().includes(kw) ||
           (p.jbtn || '').toLowerCase().includes(kw) ||
           (p.nama_departemen || '').toLowerCase().includes(kw)
  })
})

const targetCount = computed(() => {
  if (form.target_type === 'semua') return pegawaiList.value.length
  if (form.target_type === 'departemen') {
    if (!form.departemen) return pegawaiList.value.length
    return pegawaiList.value.filter(p => p.departemen === form.departemen).length
  }
  return form.selectedNiks.length
})

const currentTimeFormatted = computed(() => {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
})

const messagePreviewHtml = computed(() => {
  let text = form.pesan || ''
  
  if (form.judul) {
    text = `📢 *${form.judul}*\n\n` + text
  }

  // Replace placeholders with sample dummy employee data
  text = text.replace(/{nama}/g, 'Ahmad Fulan, S.Kep')
             .replace(/{nik}/g, '1.233.0726')
             .replace(/{jbtn}/g, 'Staf Pelaksana')
             .replace(/{departemen}/g, 'SDI & Hukormas')

  // Convert markdown-style WA formatting to HTML
  text = text.replace(/\*(.*?)\*/g, '<b>$1</b>')
             .replace(/_(.*?)_/g, '<i>$1</i>')
             .replace(/~(.*?)~/g, '<del>$1</del>')
             .replace(/\n/g, '<br>')

  return text
})

// Methods
const isValidPhone = (phone) => {
  if (!phone) return false
  return /^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))
}

const setTargetType = (type) => {
  form.target_type = type
  if (type === 'semua') {
    form.selectedNiks = pegawaiList.value.map(p => p.nik)
  } else if (type === 'terpilih') {
    if (form.selectedNiks.length === 0) {
      form.selectedNiks = pegawaiList.value.map(p => p.nik)
    }
  }
}

const togglePegawaiSelection = (nik) => {
  const idx = form.selectedNiks.indexOf(nik)
  if (idx > -1) {
    form.selectedNiks.splice(idx, 1)
  } else {
    form.selectedNiks.push(nik)
  }
}

const selectAllPegawai = () => {
  form.selectedNiks = filteredPegawaiList.value.map(p => p.nik)
}

const deselectAllPegawai = () => {
  form.selectedNiks = []
}

const insertTag = (tag) => {
  if (!messageTextarea.value) {
    form.pesan += tag
    return
  }
  const el = messageTextarea.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = form.pesan
  form.pesan = text.substring(0, start) + tag + text.substring(end)
  
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + tag.length, start + tag.length)
  }, 0)
}

const applyTemplate = () => {
  if (!selectedTemplate.value || !templates[selectedTemplate.value]) return
  const tpl = templates[selectedTemplate.value]
  form.judul = tpl.judul
  form.pesan = tpl.pesan
}

const fetchPegawai = async () => {
  loadingPegawai.value = true
  try {
    const params = {}
    if (form.target_type === 'departemen' && form.departemen) {
      params.departemen = form.departemen
    }
    const res = await cnsDokterOffService.getBroadcastPegawai(params)
    pegawaiList.value = res.data?.response || []
    
    if (form.target_type === 'semua') {
      form.selectedNiks = pegawaiList.value.map(p => p.nik)
    }
  } catch (err) {
    console.error(err)
    toast.error('Gagal memuat daftar pegawai')
  } finally {
    loadingPegawai.value = false
  }
}

const fetchDepartemen = async () => {
  try {
    const res = await cnsDokterOffService.getBroadcastDepartemen()
    departemenList.value = res.data?.response || []
  } catch (err) {
    console.error(err)
  }
}

const confirmSendBroadcast = async () => {
  let targetPegawai = []
  if (form.target_type === 'semua') {
    targetPegawai = pegawaiList.value
  } else if (form.target_type === 'departemen') {
    targetPegawai = form.departemen 
      ? pegawaiList.value.filter(p => p.departemen === form.departemen)
      : pegawaiList.value
  } else {
    targetPegawai = pegawaiList.value.filter(p => form.selectedNiks.includes(p.nik))
  }

  const validCount = targetPegawai.filter(p => isValidPhone(p.no_telp)).length
  const invalidCount = targetPegawai.length - validCount

  let htmlMsg = `Anda akan mengirim notifikasi WhatsApp broadcast ke <b>${validCount}</b> pegawai.`
  if (invalidCount > 0) {
    htmlMsg += `<br><br><span class="text-amber-600"><i class="fas fa-exclamation-triangle"></i> <b>${invalidCount}</b> pegawai tidak memiliki nomor WhatsApp valid dan akan dilewati.</span>`
  }

  const result = await Swal.fire({
    title: 'Kirim Broadcast WhatsApp?',
    html: htmlMsg,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-paper-plane"></i> Ya, Kirim Broadcast Sekarang',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b'
  })

  if (result.isConfirmed) {
    executeSendBroadcast()
  }
}

const executeSendBroadcast = async () => {
  sendingNotif.value = true
  try {
    const payload = {
      judul: form.judul || '',
      pesan: form.pesan,
      target_type: form.target_type,
      departemen: form.target_type === 'departemen' ? (form.departemen || '') : '',
      niks: form.target_type === 'terpilih' ? form.selectedNiks : [],
      channels: form.channels
    }

    const res = await cnsDokterOffService.kirimNotifikasiBroadcast(payload)
    toast.success(res.data?.metadata?.message || 'Broadcast berhasil dijadwalkan')
  } catch (err) {
    console.error(err)
    toast.error('Gagal mengirim broadcast WhatsApp')
  } finally {
    sendingNotif.value = false
  }
}

onMounted(() => {
  fetchDepartemen()
  fetchPegawai()
})
</script>

<style scoped>
.broadcast-wrapper {
  min-height: 100vh;
  padding: 16px 24px;
  background: #f8fafc;
  color: #1e293b;
}

.broadcast-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* Page Header */
.header-icon-bg {
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.35rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  font-size: 0.85rem;
  color: #64748b;
}

/* Main Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

/* Cards Base */
.card-custom {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
  overflow: hidden;
}

.card-header-custom {
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-body-custom {
  padding: 24px;
}

/* Target Selection Grid */
.target-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.target-type-card {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
}

.target-type-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
}

.target-type-card.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.target-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.bg-blue-subtle { background: #dbeafe; color: #1d4ed8; }
.bg-emerald-subtle { background: #d1fae5; color: #047857; }
.bg-purple-subtle { background: #f3e8ff; color: #6b21a8; }

.target-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
}

.target-desc {
  font-size: 0.75rem;
  color: #64748b;
}

/* Form inputs */
.form-label-custom {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-control-custom, .form-select-custom, .form-textarea-custom {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s ease;
  outline: none;
}

.form-control-custom:focus, .form-select-custom:focus, .form-textarea-custom:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-select-sm-custom {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  outline: none;
}

/* Tag buttons */
.btn-tag {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tag:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* Search Box */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
}

.search-input:focus {
  border-color: #2563eb;
}

/* Submit Button */
.btn-send-broadcast {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-send-broadcast:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-send-broadcast:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Right Section: WhatsApp Preview */
.preview-card-wrap {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
  position: sticky;
  top: 24px;
}

.preview-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-header i {
  font-size: 1.2rem;
}

/* Channel Selector */
.channel-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.channel-option-card {
  padding: 10px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.channel-option-card:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}
.channel-option-card.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.channel-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.bg-amber-subtle { background: #fef3c7; }
.text-amber-600 { color: #d97706; }

/* Preview Tabs */
.preview-tabs-bar {
  display: flex;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  padding: 4px;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* FCM Push Notification Mockup */
.fcm-preview-bg {
  padding: 24px 18px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
  background-size: 16px 16px;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fcm-notification-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.fcm-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.fcm-app-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fcm-app-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fcm-app-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

.fcm-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.fcm-title {
  font-size: 0.86rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.fcm-text {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
}

.preview-bubble-bg {
  padding: 20px;
  background: #efeae2;
  background-image: radial-gradient(#d1d7db 1px, transparent 1px);
  background-size: 12px 12px;
  min-height: 260px;
}

.preview-bubble {
  background: #ffffff;
  border-radius: 12px 12px 12px 0;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  position: relative;
}

.preview-header-bar {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 6px;
  margin-bottom: 8px;
}

.preview-text {
  font-size: 0.83rem;
  line-height: 1.6;
  color: #1e293b;
  word-break: break-word;
}

.preview-timestamp {
  text-align: right;
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 6px;
}

.preview-info-box {
  padding: 14px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.5;
}

/* Pegawai Selection Card & Table */
.pegawai-selection-card {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Action Buttons for Selection */
.btn-action-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-select-all {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.btn-select-all:hover {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transform: translateY(-1px);
}
.btn-select-all:hover .count-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.count-badge {
  background: #2563eb;
  color: #ffffff;
  font-size: 0.72rem;
  padding: 2px 7px;
  margin-left: 6px;
  border-radius: 9999px;
  transition: all 0.2s ease;
  display: inline-block;
}

.btn-deselect-all {
  background: #ffffff;
  color: #64748b;
  border-color: #cbd5e1;
}
.btn-deselect-all:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

/* Search input pill */
.search-box-custom {
  position: relative;
  display: flex;
  align-items: center;
}
.search-input-pill {
  width: 100%;
  padding: 7px 32px 7px 36px;
  border: 1.5px solid #cbd5e1;
  border-radius: 9999px;
  font-size: 0.82rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: all 0.2s ease;
}
.search-input-pill:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.btn-clear-search {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.78rem;
  padding: 2px;
}
.btn-clear-search:hover { color: #2563eb; }

/* Pegawai Scrollable Table Container */
.pegawai-table-scroll-container {
  max-height: 480px;
  overflow-y: auto !important;
  overflow-x: auto;
  position: relative;
}

.pegawai-table-scroll-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.pegawai-table-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.pegawai-table-scroll-container::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 9999px;
}
.pegawai-table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Table Header & Rows */
.table-header-slate th {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 10px 14px !important;
}

.pegawai-row {
  transition: all 0.15s ease;
}
.pegawai-row:hover {
  background-color: #f8fafc !important;
}
.pegawai-row.row-selected {
  background-color: #eff6ff !important;
  border-left: 3px solid #2563eb;
}

/* Custom Checkbox */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}
.custom-checkbox input {
  display: none;
}
.checkmark-box {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: #ffffff;
}
.custom-checkbox input:checked ~ .checkmark-box {
  background-color: #2563eb;
  border-color: #2563eb;
}
.custom-checkbox input:checked ~ .checkmark-box::after {
  content: '✓';
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}

/* Avatar Circle & Badges */
.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 6px;
}

.nik-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  display: inline-block;
  margin-top: 2px;
}

.phone-badge {
  display: inline-flex;
  align-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
}
.phone-badge-valid {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.phone-badge-invalid {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .preview-card-wrap {
    position: static;
  }
}

@media (max-width: 768px) {
  .broadcast-wrapper {
    padding: 16px;
  }
  .target-type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
