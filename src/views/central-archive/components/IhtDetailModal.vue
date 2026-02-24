<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-graduation-cap text-blue-600"></i>
          Detail Berkas IHT
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="data">
        <!-- Nomor Berkas Hero Badge -->
        <div class="nomor-badge-container">
          <div class="badge-label">NOMOR BERKAS IHT</div>
          <div class="badge-value">{{ formatNomorSurat(data) }}</div>
        </div>

        <div class="detail-grid">
          <!-- Perihal Section -->
          <div class="detail-group full-width">
            <div class="detail-label">Perihal IHT</div>
            <div class="detail-value fw-bold text-dark text-lg">{{ data.perihal }}</div>
          </div>

          <!-- Meta Info -->
          <div class="detail-group">
            <div class="detail-label">Tanggal Terbit</div>
            <div class="detail-value with-icon">
              <i class="fas fa-calendar-day text-blue-600"></i>
              {{ formatDate(data.tgl_terbit) }}
            </div>
          </div>

          <div class="detail-group">
            <div class="detail-label">Kategori</div>
            <div class="detail-value">
              <span class="badge-category">{{ data.prefix || 'IHT' }}</span>
            </div>
          </div>

          <!-- Penanggung Jawab Section -->
          <div class="detail-group full-width section-mt">
            <div class="detail-label mb-3">Penanggung Jawab (PJ)</div>
            <div class="member-card">
              <div class="member-avatar">
                {{ getInitials(data.penanggung_jawab?.nama || data.pj) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ data.penanggung_jawab?.nama || data.pj }}</div>
                <div class="member-nik" v-if="data.penanggung_jawab?.nik">NIK. {{ data.penanggung_jawab.nik }}</div>
                <div class="member-dept" v-if="data.penanggung_jawab?.jbtn">{{ data.penanggung_jawab.jbtn }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">Tutup</button>
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSurat = (data) => {
  if (!data) return '-'
  try {
    const tglPattern = data.tgl_terbit ? format(parseDate(data.tgl_terbit), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    const prefix = data.prefix || 'IHT'
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix || 'IHT'}`
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
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  max-width: 550px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.btn-close-icon {
  background: #f8fafc;
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}

.btn-close-icon:hover { background: #fee2e2; color: #ef4444; }

.modal-body { padding: 0; overflow-y: auto; }

.nomor-badge-container {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  padding: 2rem;
  text-align: center;
  border-bottom: 3px solid #3b82f6;
}

.badge-label {
  color: #bfdbfe;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.badge-value {
  color: white;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detail-grid { padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.full-width { grid-column: span 2; }

.section-mt { margin-top: 0.5rem; }

.detail-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}

.detail-value { font-size: 1rem; color: #334155; line-height: 1.5; }

.text-lg { font-size: 1.25rem; }

.detail-value.with-icon { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }

.text-blue-600 { color: #2563eb; }

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.member-avatar {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.1rem;
}

.member-name { font-weight: 700; color: #1e293b; font-size: 1rem; }

.member-nik { font-size: 0.8rem; color: #64748b; font-weight: 500; }

.member-dept { font-size: 0.8rem; color: #94a3b8; margin-top: 0.1rem; }

.badge-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid #dbeafe;
}

.modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  background: #f8fafc;
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover { background: #f1f5f9; color: #1e293b; }
</style>
