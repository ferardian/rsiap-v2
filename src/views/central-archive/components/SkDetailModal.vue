<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-file-contract text-primary"></i>
          Detail Berkas SK
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="skData">
        <div class="detail-card">
          <div class="detail-header">
            <div class="badge-type" :class="skData.jenis === 'A' ? 'bg-indigo' : 'bg-pink'">
              {{ skData.jenis === 'A' ? 'SK Dokumen' : skData.jenis === 'B' ? 'SK Pengangkatan Jabatan' : skData.jenis }}
            </div>
          </div>
          
          <h2 class="detail-title">{{ skData.judul }}</h2>
          
          <div class="detail-grid mt-4">
            <div class="info-group">
              <label>Nomor SK</label>
              <div class="nomor-badge">{{ formatNomorSk(skData) }}</div>
            </div>
            
            <div class="info-group">
              <label>Tanggal Terbit</label>
              <div class="info-value">
                <i class="fas fa-calendar-alt text-muted mr-2"></i>
                {{ formatDate(skData.tgl_terbit) }}
              </div>
            </div>
            
            <div class="info-group">
              <label>Penanggung Jawab</label>
              <div class="pj-info mt-1">
                <div class="pj-avatar">{{ getInitials(skData.penanggung_jawab?.nama || skData.pj) }}</div>
                <div class="pj-details">
                  <div class="fw-bold">{{ skData.penanggung_jawab?.nama || skData.pj || '-' }}</div>
                  <div class="small-text text-muted">{{ skData.pj }}</div> <!-- NIK -->
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- File section -->
        <div class="file-section mt-4">
          <h4 class="section-title">Dokumen Terlampir</h4>
          <div class="file-card" v-if="skData.berkas">
             <div class="file-icon">
               <i class="fas fa-file-pdf"></i>
             </div>
             <div class="file-info">
               <div class="file-name text-truncate" :title="skData.berkas">{{ skData.berkas }}</div>
               <div class="file-status text-success"><i class="fas fa-check-circle"></i> Berkas tersedia</div>
             </div>
             <button class="btn-download" @click="openFile(skData.berkas)">
               <i class="fas fa-external-link-alt"></i> Buka File
             </button>
          </div>
          <div class="empty-file-card" v-else>
            <div class="empty-icon"><i class="fas fa-file-excel"></i></div>
            <p>Belum ada berkas PDF yang diupload untuk SK ini.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
  show: Boolean,
  skData: Object
})

defineEmits(['close'])

const parseDate = (dateStr) => {
  if (!dateStr) return null
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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = parseDate(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSk = (sk) => {
  if (!sk) return '-'
  try {
    const tglPattern = sk.tgl_terbit ? format(parseDate(sk.tgl_terbit), 'ddMMyy') : ''
    const no = String(sk.nomor).padStart(3, '0')
    return `${no}/${sk.jenis}/${sk.prefix}/${tglPattern}`
  } catch (e) {
    return `${sk.nomor}/${sk.jenis}/${sk.prefix}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const openFile = (berkas) => {
  if (!berkas) return
  const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
  const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
  const url = `${baseUrl}/webapps/rsia_sk/${berkas}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close-icon {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-icon:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
}

.detail-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.badge-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.bg-indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.bg-pink {
  background: #fce7f3;
  color: #be185d;
}

.detail-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-group label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;
}

.nomor-badge {
  display: inline-block;
  background: white;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 600;
  color: #475569;
}

.pj-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pj-avatar {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: #475569;
}

.pj-details .small-text {
  font-size: 0.75rem;
}

/* File Section */
.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
}

.file-card {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.file-icon {
  width: 48px; height: 48px;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.file-status {
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-download {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.empty-file-card {
  padding: 2rem;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}
</style>
