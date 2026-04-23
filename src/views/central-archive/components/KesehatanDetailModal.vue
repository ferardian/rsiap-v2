<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header modern-header">
        <div class="header-content">
          <div class="header-icon bg-info-light">
            <i class="fas fa-file-contract text-info"></i>
          </div>
          <div>
            <h3>Detail Surat Komite Kesehatan</h3>
            <p class="header-subtitle">{{ formatNomorSurat(data) }}</p>
          </div>
        </div>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body p-0">
        <!-- Status Banner -->
        <div class="status-banner" :class="data?.status == '1' || data?.status === 1 ? 'status-active' : 'status-inactive'">
          <div class="status-info">
            <i class="fas" :class="data?.status == '1' || data?.status === 1 ? 'fa-check-circle' : 'fa-times-circle'"></i>
            <span>Status Berkas: <strong>{{ (data?.status == '1' || data?.status === 1) ? 'Aktif' : 'Tidak Aktif' }}</strong></span>
          </div>
          <div class="created-info" v-if="data?.created_at">
             Dibuat pada: {{ formatDateFull(data.created_at) }}
          </div>
        </div>

        <div class="detail-container p-4">
          <div class="detail-section">
            <label class="section-label">Informasi Utama</label>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Perihal / Judul</span>
                <span class="detail-value highlight">{{ data?.perihal || data?.judul || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tanggal Terbit</span>
                <span class="detail-value">{{ formatDate(data?.tgl_terbit) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nomor Urut</span>
                <span class="detail-value fw-bold">{{ String(data?.nomor).padStart(3, '0') }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Prefix Nomor</span>
                <span class="detail-value text-muted">{{ data?.prefix || 'KTKL-RSIA' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-divider"></div>

          <div class="detail-section">
            <label class="section-label">Penanggung Jawab</label>
            <div class="pj-card" v-if="data?.penanggung_jawab">
               <div class="pj-avatar-large">{{ getInitials(data.penanggung_jawab.nama) }}</div>
               <div class="pj-info-large">
                  <span class="pj-nama-large">{{ data.penanggung_jawab.nama }}</span>
                  <span class="pj-nik-large">NIK: {{ data.penanggung_jawab.nik }}</span>
                  <span class="pj-jabatan-large">{{ data.penanggung_jawab.jbtn || '-' }}</span>
               </div>
            </div>
            <div class="pj-card empty" v-else>
               <i class="fas fa-user-circle mr-2"></i>
               <span>Data penanggung jawab tidak ditemukan</span>
            </div>
          </div>

          <div class="detail-divider" v-if="data?.file"></div>

          <div class="detail-section" v-if="data?.file">
            <label class="section-label">Lampiran Berkas</label>
            <div class="file-attachment-card">
              <div class="file-icon-box">
                <i class="fas fa-file-pdf"></i>
              </div>
              <div class="file-details">
                <span class="file-name text-truncate">{{ data.file }}</span>
                <span class="file-meta">Dokumen PDF Digital</span>
              </div>
              <button class="btn-preview" @click="openFile(data.file)">
                <i class="fas fa-external-link-alt mr-2"></i> Lihat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary-modern" @click="$emit('close')">Tutup</button>
        <button class="btn-primary-modern" @click="openFile(data?.file)" :disabled="!data?.file">
          <i class="fas fa-download mr-2"></i> Download Berkas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => null
  }
})

defineEmits(['close'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatDateFull = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSurat = (data) => {
  if (!data || !data.nomor) return 'Detail Berkas'
  try {
    const tglPattern = data.tgl_terbit ? format(new Date(data.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    const prefix = data.prefix || 'KTKL-RSIA'
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix || 'KTKL-RSIA'}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const openFile = (filename) => {
  if (!filename) return
  const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/arsip/berkas/${filename}`
  window.open(fileUrl, '_blank')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  animation: modal-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header.modern-header {
  background: linear-gradient(to right, #ffffff, #f8fafc);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.bg-info-light { background: #ecfdf5; color: #10b981; }

.status-banner {
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.status-active { background: #f0fdf4; color: #15803d; border-bottom: 1px solid #dcfce7; }
.status-inactive { background: #fff1f2; color: #be123c; border-bottom: 1px solid #ffe4e6; }

.status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-section {
  margin-bottom: 0.5rem;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 1.25rem;
  letter-spacing: 0.05em;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #64748b;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 600;
}

.detail-value.highlight {
  color: #3b82f6;
  font-size: 1.1rem;
}

.pj-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.pj-avatar-large {
  width: 60px;
  height: 60px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.pj-info-large {
  display: flex;
  flex-direction: column;
}

.pj-nama-large {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.pj-nik-large {
  font-size: 0.85rem;
  color: #64748b;
}

.pj-jabatan-large {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 0.25rem;
}

.file-attachment-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.file-icon-box {
  width: 44px;
  height: 44px;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  max-width: 250px;
}

.file-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

.btn-preview {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  background: #dbeafe;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-secondary-modern {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-modern:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-primary-modern {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  border: none;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-primary-modern:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35);
}

.btn-primary-modern:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

.btn-close-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 8px;
}

.btn-close-icon:hover {
  background: #fee2e2;
  color: #ef4444;
}
</style>
