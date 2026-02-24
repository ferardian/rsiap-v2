<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-calendar-check text-blue-600"></i>
          Detail Undangan & Pertemuan
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="data">
        <!-- Hero Section -->
        <div class="detail-hero">
          <div class="hero-date-card">
            <div class="card-header">{{ formatMonth(data.tanggal) }}</div>
            <div class="card-body">
              <span class="day">{{ formatDay(data.tanggal) }}</span>
              <span class="year">{{ formatYear(data.tanggal) }}</span>
            </div>
          </div>
          <div class="hero-main">
            <div class="perihal-title">{{ data.perihal }}</div>
            <div class="meta-row">
              <span class="tipe-badge" :class="getTypeClass(data.tipe)">{{ data.tipe || 'Umum' }}</span>
              <span class="time-stamp"><i class="far fa-clock mr-1"></i> {{ formatTime(data.tanggal) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-item full-width" v-if="data.lokasi">
              <div class="label"><i class="fas fa-map-marker-alt"></i> Lokasi Pertemuan</div>
              <div class="value fw-bold text-blue-800">{{ data.lokasi }}</div>
            </div>

            <div class="info-item" v-if="data.pj">
              <div class="label"><i class="fas fa-user-circle"></i> Penanggung Jawab</div>
              <div class="pj-card">
                 <div class="pj-name">{{ (data.penanggungJawab || data.penanggung_jawab)?.nama || data.pj }}</div>
                 <div class="pj-nik" v-if="(data.penanggungJawab || data.penanggung_jawab)?.nik">NIK. {{ (data.penanggungJawab || data.penanggung_jawab).nik }}</div>
              </div>
            </div>

            <div class="info-item" v-if="data.id">
              <div class="label"><i class="fas fa-qrcode"></i> Akses Kehadiran</div>
              <div class="qr-box">
                <div v-if="qrLoading" class="qr-loading">
                  <div class="mini-spinner"></div>
                </div>
                <img v-else-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code Kehadiran" class="qr-image" @click="openQrDetail" title="Ketuk untuk memperbesar">
                <div v-else class="qr-placeholder-failed" @click="fetchQrData">
                  <i class="fas fa-sync-alt"></i>
                  <span>Gagal memuat QR</span>
                </div>
              </div>
            </div>

            <div class="info-item full-width" v-if="data.deskripsi || data.catatan">
              <div class="label"><i class="fas fa-align-left"></i> Deskripsi / Agenda</div>
              <div class="value description-box">
                {{ data.deskripsi || data.catatan }}
              </div>
            </div>

            <!-- Recipients Section -->
            <div class="info-item full-width">
              <div class="label">
                <i class="fas fa-users"></i> Penerima Undangan / Peserta
                <button @click="toggleEditRecipients" class="btn-edit-recipients">
                   <i :class="isEditingRecipients ? 'fas fa-times' : 'fas fa-plus-circle'"></i>
                   {{ isEditingRecipients ? 'Batal' : 'Kelola' }}
                </button>
              </div>
              
              <div class="recipients-container">
                <div v-if="isEditingRecipients" class="recipient-search-box">
                  <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input 
                      type="text" 
                      v-model="empSearch" 
                      placeholder="Cari nama karyawan atau NIK..." 
                      @input="handleEmpSearch"
                    >
                  </div>
                  <div v-if="empResults.length > 0" class="search-results-dropdown">
                    <div 
                      v-for="emp in empResults" 
                      :key="emp.nik" 
                      class="search-result-item"
                      @click="addRecipient(emp)"
                    >
                      <div class="emp-info">
                        <span class="emp-name">{{ emp.nama }}</span>
                        <span class="emp-nik">NIK. {{ emp.nik }}</span>
                      </div>
                      <i class="fas fa-plus-circle"></i>
                    </div>
                  </div>
                </div>

                <div v-if="loadingRecipients" class="recipients-loading">
                  <div class="mini-spinner"></div>
                  <span>Memuat daftar penerima...</span>
                </div>
                
                <div v-else-if="recipients.length > 0" class="recipients-list" :class="{ 'editing': isEditingRecipients }">
                  <div v-for="res in recipients" :key="res.nik" class="recipient-tag">
                    <div class="recipient-info">
                      <span class="name">{{ res.nama }}</span>
                      <span class="nik">{{ res.nik }}</span>
                    </div>
                    <button v-if="isEditingRecipients" @click="removeRecipient(res.nik)" class="btn-remove">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div v-else class="recipients-empty">
                  <i class="fas fa-user-slash"></i>
                  <span>Belum ada daftar penerima</span>
                </div>

                <div v-if="isEditingRecipients && hasRecipientsChanges" class="mt-3">
                  <button @click="saveRecipients" class="btn-save-recipients" :disabled="savingRecipients">
                    <i class="fas fa-save mr-2" v-if="!savingRecipients"></i>
                    <div class="mini-spinner mr-2" v-else></div>
                    {{ savingRecipients ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Attachments / Quick Links -->
          <div class="quick-actions-section">
            <div class="label mb-3">Dokumen & Tautan</div>
            <div class="action-grid">
              <button @click="handleDownload('undangan')" class="action-card btn-link-action" :disabled="downloading === 'undangan'">
                <i class="fas fa-file-pdf text-danger"></i>
                <div class="action-info">
                  <span class="action-name">Download Undangan</span>
                  <span class="action-desc">{{ downloading === 'undangan' ? 'Mengunduh...' : 'Format PDF Resmi' }}</span>
                </div>
              </button>
              
              <button @click="showNotulenDetail" class="action-card btn-link-action" v-if="isPast(data.tanggal)">
                <i class="fas fa-clipboard-list text-primary"></i>
                <div class="action-info">
                  <span class="action-name">Lihat Notulen Rapat</span>
                  <span class="action-desc">Ringkasan & Hasil Pertemuan</span>
                </div>
              </button>

              <button @click="handleDownload('proof')" class="action-card btn-link-action" :disabled="downloading === 'proof'">
                <i class="fas fa-id-badge text-success"></i>
                <div class="action-info">
                  <span class="action-name">Bukti Kehadiran</span>
                  <span class="action-desc">{{ downloading === 'proof' ? 'Mengunduh...' : 'Presensi & Pengesahan' }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-text" @click="$emit('close')">Tutup</button>
      </div>

      <!-- Fullscreen QR Overlay -->
      <div v-if="showQrFull" class="qr-full-overlay" @click="showQrFull = false">
        <div class="qr-full-container" @click.stop>
          <div class="qr-full-header">
            <span>QR Kehadiran</span>
            <button @click="showQrFull = false"><i class="fas fa-times"></i></button>
          </div>
          <img :src="qrCodeUrl" alt="QR Full" class="qr-large-image">
          <p class="qr-full-hint">Arahkan kamera scanner ke kode di atas</p>
        </div>
      </div>

      <!-- Nested Notulen Modal -->
      <div v-if="showNotulen" class="notulen-overlay" @click="showNotulen = false">
        <div class="notulen-content" @click.stop>
          <div class="notulen-header">
            <h4>Notulen Rapat</h4>
            <button @click="showNotulen = false"><i class="fas fa-times"></i></button>
          </div>
          <div class="notulen-body" v-if="notulenData">
             <div class="mb-4">
               <label class="text-xs font-bold text-slate-400 uppercase">Pembahasan</label>
               <div class="text-slate-700 leading-relaxed mt-1" v-html="formatNewLines(notulenData.pembahasan)"></div>
             </div>
             <div>
               <label class="text-xs font-bold text-slate-400 uppercase">Kesimpulan</label>
               <div class="text-slate-700 leading-relaxed mt-1" v-html="formatNewLines(notulenData.kesimpulan)"></div>
             </div>
          </div>
          <div class="notulen-body text-center py-5" v-else-if="loadingNotulen">
            <div class="mini-spinner mx-auto mb-2"></div>
            <p class="text-sm text-slate-500">Memuat notulen...</p>
          </div>
          <div class="notulen-body text-center py-5" v-else>
            <i class="fas fa-info-circle text-slate-300 text-3xl mb-2"></i>
            <p class="text-sm text-slate-500">Belum ada data notulen untuk rapat ini.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { isPast as checkPast } from 'date-fns'
import { undanganService } from '@/services/undanganService'
import { useToast } from 'vue-toastification'

const props = defineProps({
  show: { type: Boolean, default: false },
  data: { type: Object, default: () => null }
})

const emit = defineEmits(['close'])
const toast = useToast()

// States
const qrCodeUrl = ref('')
const qrLoading = ref(false)
const downloading = ref(null)
const showNotulen = ref(false)
const notulenData = ref(null)
const loadingNotulen = ref(false)
const showQrFull = ref(false)

// Recipients States
const recipients = ref([])
const originalRecipients = ref([])
const loadingRecipients = ref(false)
const isEditingRecipients = ref(false)
const savingRecipients = ref(false)
const empSearch = ref('')
const empResults = ref([])
const hasRecipientsChanges = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal && props.data) {
    fetchQrData()
    fetchRecipients()
    notulenData.value = null
    showNotulen.value = false
    showQrFull.value = false
    isEditingRecipients.value = false
    empSearch.value = ''
    empResults.value = []
  }
})

const fetchRecipients = async () => {
  if (!props.data?.id) return
  loadingRecipients.value = true
  try {
    const response = await undanganService.getRecipients(props.data.id)
    if (response.data?.data) {
      // Flatten or map the response data to get raw name and nik
      const rawData = response.data.data.map(item => ({
        nik: item.detail?.nik || item.penerima,
        nama: item.detail?.nama || 'Unknown'
      }))
      recipients.value = rawData
      originalRecipients.value = JSON.parse(JSON.stringify(rawData))
    }
  } catch (e) {
    console.error('Failed to fetch recipients:', e)
  } finally {
    loadingRecipients.value = false
    hasRecipientsChanges.value = false
  }
}

const fetchQrData = async () => {
  if (!props.data?.id) return
  qrLoading.value = true
  qrCodeUrl.value = ''
  try {
    const response = await undanganService.getQr(props.data.id)
    if (response.data?.data?.qr?.content) {
      const content = response.data.data.qr.content
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`
    }
  } catch (e) {
    console.error('Failed to fetch QR:', e)
  } finally {
    qrLoading.value = false
  }
}

const handleDownload = async (type) => {
  if (!props.data?.id) return
  downloading.value = type
  try {
    let response
    let filename = ''
    
    if (type === 'undangan') {
      response = await undanganService.download(props.data.id)
      filename = `Undangan - ${props.data.perihal || props.data.id}.pdf`
    } else {
      response = await undanganService.getProof(props.data.id)
      filename = `Bukti Kehadiran - ${props.data.perihal || props.data.id}.pdf`
    }

    // Sanitize filename (remove characters that might cause issues)
    filename = filename.replace(/[/\\?%*:|"<>]/g, '-')

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Download berhasil dimulai')
  } catch (e) {
    console.error('Download failed:', e)
    toast.error('Gagal mengunduh dokumen. Pastikan data tersedia.')
  } finally {
    downloading.value = null
  }
}

const showNotulenDetail = async () => {
  showNotulen.value = true
  if (notulenData.value) return
  
  loadingNotulen.value = true
  try {
    // Backend expects base64 encoded ID
    const base64Id = btoa(props.data.id.toString())
    const response = await undanganService.getNotulen(base64Id)
    if (response.data?.data?.notulen) {
      notulenData.value = response.data.data.notulen
    }
  } catch (e) {
    console.error('Failed to fetch notulen:', e)
    toast.info('Data notulen belum tersedia')
  } finally {
    loadingNotulen.value = false
  }
}

const openQrDetail = () => {
  if (qrCodeUrl.value) showQrFull.value = true
}

// Recipient Management Logic
const toggleEditRecipients = () => {
  isEditingRecipients.value = !isEditingRecipients.value
  if (!isEditingRecipients.value) {
    // Reset to original if cancelled
    recipients.value = JSON.parse(JSON.stringify(originalRecipients.value))
    empSearch.value = ''
    empResults.value = []
    hasRecipientsChanges.value = false
  }
}

import { pegawaiService } from '@/services/pegawaiService'
import debounce from 'lodash/debounce'

const handleEmpSearch = debounce(async () => {
  if (empSearch.value.length < 3) {
    empResults.value = []
    return
  }
  try {
    const response = await pegawaiService.searchPegawai(empSearch.value)
    if (response.data?.data) {
      // Filter out those already in recipients
      empResults.value = response.data.data.filter(emp => 
        !recipients.value.some(r => r.nik === emp.nik)
      )
    }
  } catch (e) {
    console.error('Emp search failed:', e)
  }
}, 300)

const addRecipient = (emp) => {
  recipients.value.push({
    nik: emp.nik,
    nama: emp.nama
  })
  empSearch.value = ''
  empResults.value = []
  checkRecipientsChanges()
}

const removeRecipient = (nik) => {
  recipients.value = recipients.value.filter(r => r.nik !== nik)
  checkRecipientsChanges()
}

const checkRecipientsChanges = () => {
  const currentNiks = recipients.value.map(r => r.nik).sort().join(',')
  const originalNiks = originalRecipients.value.map(r => r.nik).sort().join(',')
  hasRecipientsChanges.value = currentNiks !== originalNiks
}

const saveRecipients = async () => {
  if (!props.data?.id) return
  savingRecipients.value = true
  try {
    const niks = recipients.value.map(r => r.nik)
    await undanganService.updateRecipients(props.data.id, niks)
    toast.success('Daftar penerima berhasil diperbarui')
    originalRecipients.value = JSON.parse(JSON.stringify(recipients.value))
    hasRecipientsChanges.value = false
    isEditingRecipients.value = false
  } catch (e) {
    toast.error('Gagal memperbarui daftar penerima')
    console.error('Save recipients failed:', e)
  } finally {
    savingRecipients.value = false
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  // Replace space with T for ISO compatibility, but don't strip the suffix
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDay = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonth = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYear = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.getFullYear() : '----'
}

const formatTime = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '--:--'
}

const getTypeClass = (type) => {
  if (!type) return 'type-general'
  const t = type.toLowerCase()
  if (t.includes('rapat')) return 'type-rapat'
  if (t.includes('sosialisasi')) return 'type-sosial'
  return 'type-general'
}

const isPast = (dateStr) => {
  const d = parseDate(dateStr)
  return d ? checkPast(d) : false
}

const formatNewLines = (text) => {
  if (!text) return '-'
  return text.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999; padding: 1.5rem;
}

.modal-content {
  background: white; width: 100%; max-width: 600px;
  border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column; max-height: 90vh;
  overflow: hidden; animation: modalReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

@keyframes modalReveal {
  from { opacity: 0; transform: scale(0.9) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-title {
  font-size: 1.25rem; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; gap: 1rem; margin: 0;
}

.btn-close-icon {
  background: #f1f5f9; border: none; width: 36px; height: 36px;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.btn-close-icon:hover { background: #fee2e2; color: #ef4444; }

.modal-body { padding: 0; overflow-y: auto; }

/* Hero Section */
.detail-hero {
  padding: 1.5rem 2rem; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid #bfdbfe;
}

/* Hero Date Card */
.hero-date-card {
  width: 90px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.hero-date-card .card-header {
  background: #3b82f6;
  color: white;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.4rem;
  text-align: center;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-date-card .card-body {
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-date-card .day {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.hero-date-card .year {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 0.2rem;
}

.hero-main { flex: 1; }
.perihal-title { font-size: 1.25rem; font-weight: 800; color: #1e3a8a; line-height: 1.3; margin-bottom: 0.5rem; }
.meta-row { display: flex; align-items: center; gap: 1rem; }

.tipe-badge {
  padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.type-rapat { background: #3b82f6; color: white; }
.type-sosial { background: #10b981; color: white; }
.type-general { background: #64748b; color: white; }

.time-stamp { font-size: 0.8rem; font-weight: 600; color: #475569; }

/* Content Section */
.detail-content { padding: 1.5rem 2rem; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.full-width { grid-column: span 2; }

.info-item .label {
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
  color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 0.5rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.info-item .value { font-size: 1rem; color: #1e293b; }

.pj-card { background: #f8fafc; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.pj-name { font-weight: 700; color: #1e3a8a; font-size: 0.95rem; }
.pj-nik { font-size: 0.75rem; color: #64748b; margin-top: 1px; }

/* QR Styles */
.qr-box {
  background: white; border: 2px dashed #e2e8f0; border-radius: 12px;
  padding: 0.75rem; display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100px; transition: all 0.2s;
}
.qr-image { width: 100px; height: 100px; cursor: pointer; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.qr-loading { height: 100px; display: flex; align-items: center; justify-content: center; }

.qr-placeholder-failed { 
  display: flex; flex-direction: column; align-items: center; 
  gap: 0.5rem; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 700;
}

.mini-spinner {
  width: 24px; height: 24px; border: 3px solid #f1f5f9;
  border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.description-box {
  background: #fdfefe; padding: 1rem; border-radius: 12px;
  border: 1px solid #f1f5f9; white-space: pre-line; line-height: 1.5; font-size: 0.9rem;
}

/* Quick Actions */
.btn-link-action { width: 100%; border: 1px solid #f1f5f9; background: white; cursor: pointer; text-align: left; }
.btn-link-action:disabled { opacity: 0.6; cursor: wait; }

.quick-actions-section .action-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }

.action-card {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 0.85rem 1.25rem; border-radius: 12px;
  text-decoration: none; transition: all 0.2s;
}
.action-card:not(:disabled):hover { transform: translateX(6px); background: #fbfcfe; border-color: #3b82f6; }
.action-card i { font-size: 1.25rem; width: 24px; text-align: center; }

.action-info { display: flex; flex-direction: column; }
.action-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.action-desc { font-size: 0.7rem; color: #94a3b8; margin-top: 1px; }

.modal-footer {
  padding: 1rem 2rem; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; background: #f8fafc;
}

.btn-close-text {
  padding: 0.6rem 2rem; background: #0f172a; color: white;
  border: none; border-radius: 10px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.btn-close-text:hover { background: #1e293b; }

/* Sub Modal Notulen */
.notulen-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.95); z-index: 10;
  display: flex; flex-direction: column; padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.notulen-content {
  background: white; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: flex; flex-direction: column; height: 100%;
}

.notulen-header {
  padding: 0.75rem 1.25rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.notulen-header h4 { margin: 0; font-weight: 800; color: #1e3a8a; font-size: 1rem; }
.notulen-header button { background: none; border: none; font-size: 1rem; color: #94a3b8; cursor: pointer; }

.notulen-body { padding: 1.25rem; overflow-y: auto; flex: 1; }

/* QR Full Overlay */
.qr-full-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.9); z-index: 100;
  display: flex; justify-content: center; align-items: center;
  padding: 1rem; animation: modalReveal 0.3s ease;
}

.qr-full-container {
  background: white; padding: 1.5rem; border-radius: 20px;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  max-width: 90%;
}

.qr-full-header {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  font-weight: 800; color: #1e3a8a; font-size: 1.1rem; margin-bottom: 0.5rem;
}

.qr-full-header button { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; color: #64748b; cursor: pointer; }

.qr-large-image { width: 380px; height: 380px; border-radius: 20px; }
.qr-full-hint { font-size: 0.9rem; color: #94a3b8; font-weight: 600; margin: 0; }

/* Recipients Styles */
.btn-edit-recipients {
  margin-left: auto; background: #eff6ff; border: 1px solid #bfdbfe;
  color: #2563eb; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.75rem;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
  transition: all 0.2s;
}
.btn-edit-recipients:hover { background: #dbeafe; color: #1e40af; }

.recipients-container {
  background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;
  padding: 1rem; margin-top: 0.5rem;
}

.recipients-loading { display: flex; align-items: center; gap: 0.75rem; color: #64748b; font-size: 0.85rem; padding: 1rem; }

.recipients-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.recipient-tag {
  background: white; border: 1px solid #e2e8f0; border-radius: 99px;
  padding: 0.35rem 0.85rem; display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.recipient-info { display: flex; flex-direction: column; line-height: 1.2; }
.recipient-info .name { font-size: 0.8rem; font-weight: 700; color: #334155; }
.recipient-info .nik { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }

.btn-remove { 
  background: #fee2e2; border: none; color: #ef4444; 
  width: 18px; height: 18px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; cursor: pointer; margin-right: -4px;
}
.btn-remove:hover { background: #fecaca; }

.recipient-search-box { margin-bottom: 1rem; position: relative; }
.search-input-wrapper {
  position: relative; display: flex; align-items: center;
}
.search-input-wrapper i { position: absolute; left: 1rem; color: #94a3b8; font-size: 0.8rem; }
.search-input-wrapper input {
  width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; border-radius: 12px;
  border: 1px solid #e2e8f0; font-size: 0.85rem; transition: all 0.2s;
}
.search-input-wrapper input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); background: white; }

.search-results-dropdown {
  position: absolute; top: calc(100% + 5px); left: 0; right: 0;
  background: white; border: 1px solid #e2e8f0; border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 20;
  max-height: 200px; overflow-y: auto; padding: 0.5rem;
}

.search-result-item {
  padding: 0.6rem 0.75rem; border-radius: 8px; display: flex;
  justify-content: space-between; align-items: center; cursor: pointer;
  transition: all 0.1s;
}
.search-result-item:hover { background: #f1f5f9; }
.search-result-item .emp-info { display: flex; flex-direction: column; }
.search-result-item .emp-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.search-result-item .emp-nik { font-size: 0.7rem; color: #64748b; }
.search-result-item i { color: #3b82f6; font-size: 1rem; }

.recipients-empty {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600;
}
.recipients-empty i { font-size: 1.5rem; color: #e2e8f0; }

.btn-save-recipients {
  width: 100%; padding: 0.75rem; background: #10b981; color: white;
  border: none; border-radius: 12px; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-save-recipients:hover { background: #059669; }
.btn-save-recipients:disabled { opacity: 0.6; cursor: wait; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 640px) {
  .detail-hero { flex-direction: column; text-align: center; gap: 1rem; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
