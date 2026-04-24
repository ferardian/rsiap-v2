<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas" :class="isStaf ? 'fa-user-md text-success' : (isKredensial ? 'fa-id-card-alt text-purple' : 'fa-file-contract text-blue-600')"></i>
          {{ isStaf ? 'Profil Dokter & Medis' : (isKredensial ? 'Detail Pengajuan Kredensial' : 'Detail Berkas Komite Medis') }}
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="data">
        <!-- Badge Nomor in Hero style (Not for Staf) -->
        <div v-if="!isStaf" class="nomor-badge-container" :class="{ 'bg-purple-gradient': isKredensial }">
          <div class="badge-label">NOMOR {{ isKredensial ? 'SURAT PENGAJUAN' : 'BERKAS SURAT' }}</div>
          <div class="badge-value">{{ isKredensial ? data.no_surat : formatNomorSurat(data) }}</div>
        </div>

        <!-- Staf Header (Only for Staf) -->
        <div v-if="isStaf" class="staf-hero-container">
          <div class="staf-avatar-large">
            {{ getInitials(data.nama) }}
          </div>
          <div class="staf-main-info">
            <h2 class="staf-name">{{ data.nama }}</h2>
            <div class="staf-nik-badge">NIK: {{ data.nik }}</div>
            <div class="staf-profesi">{{ data.jbtn }}</div>
          </div>
        </div>

        <div class="detail-grid" :class="{ 'p-4': isStaf }">
          <!-- Standar / Kredensial Common Fields -->
          <template v-if="!isStaf">
            <div class="detail-group full-width">
              <div class="detail-label">{{ isKredensial ? 'Judul Pengajuan' : 'Perihal' }}</div>
              <div class="detail-value fw-bold text-dark text-lg">{{ data.perihal || data.judul }}</div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Tanggal Terbit</div>
              <div class="detail-value with-icon">
                <i class="fas fa-calendar-day text-blue-600"></i>
                {{ formatDate(data.tgl_terbit) }}
              </div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Status Approval</div>
              <div class="detail-value">
                <span class="badge-status" :class="getStatusClass(data.status_approval)">
                  {{ data.status_approval || 'Pengajuan' }}
                </span>
              </div>
            </div>

            <div v-if="isKredensial" class="detail-group full-width">
              <div class="detail-label">Target Pegawai (Penerima)</div>
              <div class="member-card mt-1 border-purple-light">
                <div class="member-avatar bg-purple-light text-purple">
                  {{ getInitials(data.target_pegawai?.nama || data.nik) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ data.target_pegawai?.nama || data.nik }}</div>
                  <div class="member-role" v-if="data.target_pegawai?.jbtn">
                    {{ data.target_pegawai.jbtn }}
                  </div>
                  <div class="member-nik" v-if="data.target_pegawai?.nik || data.nik">
                    NIK: {{ data.target_pegawai?.nik || data.nik }}
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-group full-width">
              <div class="detail-label">Penanggung Jawab</div>
              <div class="member-card mt-1">
                <div class="member-avatar">
                  {{ getInitials(data.penanggung_jawab?.nama || data.pj_nama || data.pj) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ data.penanggung_jawab?.nama || data.pj_nama || data.pj }}</div>
                  <div class="member-role" v-if="data.penanggung_jawab?.jbtn">
                    {{ data.penanggung_jawab.jbtn }}
                  </div>
                  <div class="member-nik" v-if="data.penanggung_jawab?.nik || data.pj">
                    NIK: {{ data.penanggung_jawab?.nik || data.pj }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Staf Specific Fields -->
          <template v-else>
            <div class="detail-group">
              <div class="detail-label">Kategori Profesi</div>
              <div class="detail-value fw-medium">{{ data.kategori_profesi || '-' }}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Pendidikan Terakhir</div>
              <div class="detail-value fw-medium">{{ data.pendidikan || '-' }}</div>
            </div>
            <div class="detail-group full-width">
              <div class="detail-label">Program Studi</div>
              <div class="detail-value">{{ data.prodi || '-' }}</div>
            </div>

            <div class="detail-divider full-width"></div>

            <div class="detail-group">
              <div class="detail-label">Nomor STR</div>
              <div class="detail-value with-icon">
                <i class="fas fa-id-card text-blue-500"></i>
                <span class="font-mono">{{ data.nomor_str || 'Tidak ada data' }}</span>
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Nomor SIP</div>
              <div class="detail-value with-icon">
                <i class="fas fa-file-medical text-orange-500"></i>
                <span class="font-mono">{{ data.nomor_sip || 'Tidak ada data' }}</span>
              </div>
            </div>
            
            <div class="detail-group">
              <div class="detail-label">Masa Berlaku STR</div>
              <div class="detail-value text-muted small">{{ formatDate(data.tgl_str) || '-' }}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Masa Berlaku SIP</div>
              <div class="detail-value text-muted small">{{ formatDate(data.tgl_sip) || '-' }}</div>
            </div>
          </template>

          <div v-if="!isStaf" class="detail-group">
             <div class="detail-label">Dibuat Pada</div>
             <div class="detail-value small-text text-muted">
                <i class="far fa-clock mr-1"></i> {{ formatDateTime(data.created_at) }}
             </div>
          </div>

           <div v-if="!isStaf" class="detail-group">
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
  },
  isKredensial: {
    type: Boolean,
    default: false
  },
  isStaf: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const getStatusClass = (status) => {
  if (!status) return 'status-pending'
  switch (status.toLowerCase()) {
    case 'disetujui': return 'status-success'
    case 'ditolak': return 'status-danger'
    default: return 'status-pending'
  }
}

const formatNomorSurat = (data) => {
  if (!data || !data.nomor) return '-'
  try {
    const tglPattern = data.tgl_terbit ? format(new Date(data.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    const prefix = data.prefix || (props.isKredensial ? 'KPRT-RSIA' : 'KOMED-RSIA')
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix || 'KOMED-RSIA'}`
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

.nomor-badge-container {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  padding: 2rem;
  text-align: center;
  border-bottom: 3px solid #3b82f6;
}

.nomor-badge-container.bg-purple-gradient {
  background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
  border-bottom-color: #a78bfa;
}

.badge-label {
  color: rgba(255, 255, 255, 0.7);
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

/* Staf Hero Style */
.staf-hero-container {
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  padding: 2.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.staf-avatar-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
}

.staf-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.staf-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.staf-nik-badge {
  display: inline-flex;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: monospace;
  width: fit-content;
}

.staf-profesi {
  font-size: 1rem;
  color: #475569;
  font-weight: 500;
}

.detail-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-group { display: flex; flex-direction: column; }

.full-width { grid-column: 1 / -1; }

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.detail-value { font-size: 1rem; color: #334155; line-height: 1.5; }

.detail-value.with-icon { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }

.text-blue-600 { color: #2563eb; }

.detail-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.5rem 0;
}

.font-mono { font-family: ui-monospace, monospace; font-weight: 600; }

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
}

.border-purple-light { border-color: #ddd6fe; background: #f5f3ff; }

.member-avatar {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
}

.bg-purple-light { background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); }
.text-purple { color: #6d28d9; }

.member-info { display: flex; flex-direction: column; }

.member-name { font-size: 1rem; font-weight: 600; color: #1e293b; }

.member-role { font-size: 0.85rem; color: #475569; font-weight: 500; margin-top: 0.15rem; }

.member-nik { font-size: 0.8rem; color: #94a3b8; font-family: monospace; margin-top: 0.25rem; }

/* Status Badge */
.badge-status {
  display: inline-flex;
  padding: 0.35rem 1rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-success { background: #dcfce7; color: #15803d; }
.status-danger { background: #fee2e2; color: #b91c1c; }
.status-pending { background: #fef9c3; color: #a16207; }

.text-orange-500 { color: #f97316; }
.text-blue-500 { color: #3b82f6; }

@media (max-width: 640px) {
  .detail-grid { grid-template-columns: 1fr; gap: 1.25rem; padding: 1.5rem; }
  .staf-hero-container { flex-direction: column; text-align: center; gap: 1.5rem; }
  .staf-main-info { align-items: center; }
  .modal-content { height: 100vh; max-height: 100vh; border-radius: 0; }
}
</style>
