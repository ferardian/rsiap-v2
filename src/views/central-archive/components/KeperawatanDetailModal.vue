<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-file-contract text-primary"></i>
          Detail Berkas Keperawatan
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="data">
        <!-- Badge Nomor in Hero style -->
        <div class="nomor-badge-container">
          <div class="badge-label">NOMOR BERKAS SURAT</div>
          <div class="badge-value">{{ formatNomorSurat(data) }}</div>
        </div>

        <div class="detail-grid">
          <div class="detail-group full-width">
            <div class="detail-label">Perihal</div>
            <div class="detail-value fw-bold text-dark text-lg">{{ data.perihal }}</div>
          </div>

          <div class="detail-group">
            <div class="detail-label">Tanggal Terbit</div>
            <div class="detail-value with-icon">
              <i class="fas fa-calendar-day text-primary"></i>
              {{ formatDate(data.tgl_terbit) }}
            </div>
          </div>



          <div class="detail-group full-width">
            <div class="detail-label">Penanggung Jawab</div>
            <div class="member-card mt-1">
              <div class="member-avatar">
                {{ getInitials(data.penanggung_jawab?.nama || data.pj) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ data.penanggung_jawab?.nama || data.pj }}</div>
                <div class="member-role" v-if="data.penanggung_jawab?.jbtn">
                  {{ data.penanggung_jawab.jbtn }}
                </div>
                <div class="member-nik" v-if="data.penanggung_jawab?.nik">
                  NIK: {{ data.penanggung_jawab.nik }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-group">
             <div class="detail-label">Dibuat Pada</div>
             <div class="detail-value small-text text-muted">
                <i class="far fa-clock mr-1"></i> {{ formatDateTime(data.created_at) }}
             </div>
          </div>

           <div class="detail-group">
             <div class="detail-label">Terakhir Diupdate</div>
             <div class="detail-value small-text text-muted">
                 <i class="far fa-edit mr-1"></i> {{ formatDateTime(data.updated_at) }}
             </div>
          </div>
        </div>
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

const formatNomorSurat = (data) => {
  if (!data || !data.nomor) return '-'
  try {
    const tglPattern = data.tgl_terbit ? format(new Date(data.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    return `${no}/${data.prefix || 'KPRT-RSIA'}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix || 'KPRT-RSIA'}`
  }
}

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
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}
</script>

<style scoped>
/* Modal Structure Styles (Same as KeperawatanFormModal for consistency) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 650px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px 16px 0 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close-icon {
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-icon:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
}

/* Hero Badge Style for Nomor */
.nomor-badge-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  text-align: center;
  border-bottom: 3px solid #3b82f6;
}

.badge-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.badge-value {
  color: white;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* Detail Grid Layout */
.detail-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.detail-value {
  font-size: 1rem;
  color: #334155;
  line-height: 1.5;
}

.detail-value.with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.fw-bold { font-weight: 700; }
.text-dark { color: #1e293b; }
.text-lg { font-size: 1.15rem; }
.text-primary { color: #3b82f6; }
.text-muted { color: #94a3b8; }
.small-text { font-size: 0.85rem; }

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-badge.inactive {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Member Card */
.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.member-role {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
  margin-top: 0.15rem;
}

.member-nik {
  font-size: 0.8rem;
  color: #94a3b8;
  font-family: monospace;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.5rem;
  }
  
  .modal-content {
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
