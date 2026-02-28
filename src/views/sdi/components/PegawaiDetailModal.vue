<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Detail Pegawai</h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="pegawai">
        <div class="employee-header mb-4">
          <div class="avatar-large">
            <span class="initials">{{ getInitials(pegawai.nama) }}</span>
          </div>
          <div class="employee-title">
            <h2>{{ pegawai.nama }}</h2>
            <span class="badge-role">{{ pegawai.jbtn }}</span>
            <div class="status-badge" :class="pegawai.stts_aktif === 'AKTIF' ? 'active' : 'inactive'">
              {{ pegawai.stts_aktif }}
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Personal Info -->
          <div class="detail-section">
            <h4><i class="fas fa-user"></i> Data Pribadi</h4>
            <div class="info-group">
              <label>NIK / NIP</label>
              <span>{{ pegawai.nik || pegawai.nip }}</span>
            </div>
            <div class="info-group">
              <label>Jenis Kelamin</label>
              <span>{{ pegawai.jk }}</span>
            </div>
            <div class="info-group">
              <label>Tempat, Tgl Lahir</label>
              <span>{{ pegawai.tmp_lahir }}, {{ formatDate(pegawai.tgl_lahir) }}</span>
            </div>
            <div class="info-group">
              <label>Alamat</label>
              <span>{{ pegawai.alamat }}</span>
            </div>
            <div class="info-group">
              <label>No. KTP</label>
              <span>{{ pegawai.no_ktp }}</span>
            </div>
            <div class="info-group">
              <label>No. Telepon</label>
              <span>{{ pegawai.no_telp }}</span>
            </div>
             <div class="info-group">
              <label>Email</label>
              <span>{{ getEmailValue(pegawai.email) }}</span>
            </div>
          </div>

          <!-- Employment Info -->
          <div class="detail-section">
            <h4><i class="fas fa-briefcase"></i> Data Kepegawaian</h4>
            <div class="info-group">
              <label>Departemen</label>
              <span>{{ pegawai.dep?.nama || pegawai.departemen }}</span>
            </div>
            <div class="info-group">
              <label>Pendidikan</label>
              <span>{{ pegawai.pendidikan }}</span>
            </div>
            <div class="info-group">
              <label>Mulai Kerja</label>
              <span>{{ formatDate(pegawai.mulai_kerja) }}</span>
            </div>
            <div class="info-group">
              <label>Status Kerja</label>
              <span>{{ pegawai.status_kerja?.ktg || pegawai.stts_kerja }}</span>
            </div>
             <div class="info-group">
              <label>Status Wajib Pajak</label>
              <span>{{ pegawai.stts_wp || '-' }}</span>
            </div>
             <div class="info-group">
              <label>NPWP</label>
              <span>{{ pegawai.npwp || '-' }}</span>
            </div>
          </div>

          <!-- Insurance Info (New) -->
          <div class="detail-section full-width">
            <h4><i class="fas fa-id-card"></i> Data Jaminan Sosial</h4>
            <div class="insurance-grid">
              <div class="insurance-card bpjs">
                <div class="icon">
                  <i class="fas fa-heartbeat"></i>
                </div>
                <div class="details">
                  <label>BPJS Kesehatan</label>
                  <span class="number">{{ pegawai.nomor_kartu?.no_bpjs || pegawai.nomorKartu?.no_bpjs || pegawai.no_bpjs || 'Belum Terdaftar' }}</span>
                </div>
              </div>
              <div class="insurance-card bpjstk">
                <div class="icon">
                  <i class="fas fa-hard-hat"></i>
                </div>
                <div class="details">
                  <label>BPJS Ketenagakerjaan</label>
                  <span class="number">{{ pegawai.nomor_kartu?.no_bpjstk || pegawai.nomorKartu?.no_bpjstk || pegawai.no_bpjstk || 'Belum Terdaftar' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Family Info (New) -->
          <div class="detail-section full-width">
            <h4><i class="fas fa-users"></i> DATA KELUARGA</h4>
            <div v-if="pegawai.keluarga && pegawai.keluarga.length > 0" class="table-container-minimal mt-3">
              <table class="family-table">
                <thead>
                  <tr>
                    <th>Nama Lengkap</th>
                    <th>No. KTP / NIK</th>
                    <th>Tanggal Lahir</th>
                    <th>Pekerjaan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fam in pegawai.keluarga" :key="fam.id || fam.no_ktp">
                    <td>
                      <div class="fw-medium text-dark">{{ fam.nama }}</div>
                      <span class="badge-hubungan">{{ fam.hubungan || fam.hubungan_keluarga || '-' }}</span>
                    </td>
                    <td>
                      <span class="text-pink">{{ fam.no_ktp || '-' }}</span>
                      <div v-if="fam.no_bpjs" class="text-muted small-text mt-1">BPJS: {{ fam.no_bpjs }}</div>
                    </td>
                    <td>{{ formatDate(fam.tgl_lahir) }}</td>
                    <td>{{ fam.pekerjaan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state-mini mt-3">
              <i class="fas fa-user-slash"></i>
              <p>Tidak ada data keluarga</p>
            </div>
          </div>

          <!-- Data Kredensial (New) -->
          <div v-if="kredensialData" class="detail-section full-width">
            <h4><i class="fas fa-certificate text-primary"></i> Data Kredensial</h4>
            <div class="kredensial-card">
              <div class="kredensial-content">
                <div class="kredensial-main">
                  <div class="kredensial-level">
                    <span class="label">Tingkat Kredensial</span>
                    <div class="level-badge" :class="getLevelClass(kredensialData.kredensial)">
                      <i class="fas fa-award animate-bounce-slow"></i>
                      {{ kredensialData.kredensial }}
                    </div>
                  </div>
                  <div class="kredensial-info">
                    <div class="info-item">
                      <label><i class="fas fa-file-signature me-1"></i> Judul SK</label>
                      <span class="fw-bold text-dark">{{ kredensialData.judul_sk }}</span>
                    </div>
                    <div class="info-grid mt-3">
                      <div class="info-item">
                        <label><i class="fas fa-calendar-alt me-1"></i> Tanggal Terbit</label>
                        <span>{{ formatDate(kredensialData.tgl_terbit) }}</span>
                      </div>
                      <div class="info-item border-left ps-3">
                        <label>Masa Kerja (SK)</label>
                        <span>{{ kredensialData.masa_kerja_sk }} Tahun</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="kredensial-footer" v-if="kredensialData.berkas">
                  <button class="btn-preview-sk" @click="previewSK(kredensialData.berkas)">
                    <i class="fas fa-file-pdf text-danger"></i> 
                    <span>Pratinjau SK Kredensial</span>
                    <i class="fas fa-external-link-alt ms-auto small opacity-50"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Berkas Pegawai (New) -->
          <div class="detail-section full-width">
            <PegawaiBerkasSection :nik="pegawai.nik || pegawai.nip" :auto-open-upload="autoOpenUpload" />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-close-modal" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PegawaiBerkasSection from './PegawaiBerkasSection.vue'
import { pegawaiService } from '../../../services/pegawaiService'
import config from '../../../config/api'

const props = defineProps({
  show: Boolean,
  pegawai: Object,
  autoOpenUpload: Boolean
})

defineEmits(['close'])

const kredensialData = ref(null)
const loadingKredensial = ref(false)

const fetchKredensial = async () => {
  if (!props.pegawai?.nik && !props.pegawai?.nip) {
    kredensialData.value = null
    return
  }

  const nik = props.pegawai.nik || props.pegawai.nip
  loadingKredensial.value = true
  try {
    const response = await pegawaiService.getKredensial(nik)
    if (response.data.success) {
      kredensialData.value = response.data.data
    } else {
      kredensialData.value = null
    }
  } catch (error) {
    console.error('Error fetching kredensial:', error)
    kredensialData.value = null
  } finally {
    loadingKredensial.value = false
  }
}

const getLevelClass = (level) => {
  if (!level) return ''
  const upperLevel = level.toUpperCase()
  if (upperLevel.includes('PK V')) return 'pk-high'
  if (upperLevel.includes('PK IV')) return 'pk-high'
  if (upperLevel.includes('PK III')) return 'pk-mid'
  if (upperLevel.includes('PK II')) return 'pk-mid'
  if (upperLevel.includes('PK I')) return 'pk-low'
  if (upperLevel.includes('PRA PK')) return 'pk-low'
  if (upperLevel.includes('UTAMA')) return 'ner-high'
  if (upperLevel.includes('MADYA')) return 'ner-high'
  if (upperLevel.includes('MUDA')) return 'ner-low'
  if (upperLevel.includes('PRATAMA')) return 'ner-low'
  return ''
}

const previewSK = (berkas) => {
  if (!berkas) return
  const baseUrl = config.public.BASE_BERKAS_URL
  const url = `${baseUrl}/rsia_sk/${berkas}`
  window.open(url, '_blank')
}

watch(() => props.show, (newVal) => {
  if (newVal && props.pegawai) {
    fetchKredensial()
  }
})

watch(() => props.pegawai, (newVal) => {
  if (props.show && newVal) {
    fetchKredensial()
  }
}, { deep: true })

const getPhotoUrl = (photo) => {
  return `/storage/pegawai/${photo}`
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .match(/(^\S\S?|\s\S)?/g)
    .map(v => v.trim())
    .join('')
    .match(/(^\S|\S$)?/g)
    .join('')
    .toLocaleUpperCase()
    .substring(0, 2)
}

const getEmailValue = (email) => {
  if (!email) return '-'
  
  // Check if it's a string that looks like JSON
  if (typeof email === 'string' && (email.startsWith('{') || email.startsWith('['))) {
    try {
      const parsed = JSON.parse(email)
      return parsed.email || '-'
    } catch (e) {
      return email
    }
  }
  
  // Check if it's already an object
  if (typeof email === 'object') {
    return email.email || '-'
  }
  
  return email
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-close {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-large .initials {
  font-size: 2rem;
  font-weight: 700;
  color: #475569;
}

.employee-title h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.badge-role {
  background: #eff6ff;
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-section h4 {
  color: #64748b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-group {
  margin-bottom: 1rem;
}

.info-group label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.info-group span {
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

.detail-section.full-width {
  grid-column: span 2;
  margin-top: 1rem;
}

.insurance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.insurance-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.insurance-card.bpjs .icon {
  background: #dcfce7;
  color: #15803d;
}

.insurance-card.bpjstk .icon {
  background: #fff7ed;
  color: #c2410c;
}

.insurance-card .icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.insurance-card .details {
  display: flex;
  flex-direction: column;
}

.insurance-card .details label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.insurance-card .details .number {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 0.75rem 2rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Family Table Styles */
.family-table {
  width: 100%;
  border-collapse: collapse; /* Match screenshot which uses flat borders */
  font-size: 0.875rem;
}

.family-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  border-top: 1px solid #f1f5f9;
}

.family-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
  color: #334155;
}

.family-table tbody tr:hover {
  background: #fcfcfc;
}

.badge-hubungan {
  display: inline-block;
  padding: 2px 8px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 5px;
}

.text-dark {
  color: #475569;
}

.text-pink {
  color: #db2777; /* Match pink KTP number from screenshot */
  font-family: monospace;
  font-size: 0.9rem;
}

.small-text {
  font-size: 0.75rem;
}

.table-container-minimal {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.empty-state-mini {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.empty-state-mini i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
}

.empty-state-mini p {
  margin: 0;
  font-size: 0.875rem;
}

/* Kredensial Section Styles */
.kredensial-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.kredensial-main {
  padding: 1.5rem;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  background: linear-gradient(to right, #ffffff, #f8fafc);
}

.kredensial-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 160px;
}

.level-badge {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.level-badge.pk-high { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; border: 1px solid #f87171; }
.level-badge.pk-mid { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #fbbf24; }
.level-badge.pk-low { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); color: #166534; border: 1px solid #4ade80; }
.level-badge.ner-high { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; border: 1px solid #818cf8; }
.level-badge.ner-low { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); color: #0369a1; border: 1px solid #7dd3fc; }

.kredensial-info {
  flex: 1;
}

.info-grid {
  display: flex;
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-item span {
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

.border-left {
  border-left: 1px solid #e2e8f0;
}

.kredensial-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-preview-sk {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-preview-sk:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .detail-section.full-width {
    grid-column: span 1;
  }

  .kredensial-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .kredensial-level {
    width: 100%;
    margin-bottom: 1rem;
  }

  .info-grid {
    justify-content: center;
    gap: 1.5rem;
  }

  .border-left {
    border-left: none;
    padding-left: 0 !important;
  }
  
  .insurance-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .employee-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
