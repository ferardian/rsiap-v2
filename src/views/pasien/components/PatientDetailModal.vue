<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-user-circle"></i> Detail Pasien
        </h3>
        <button class="btn-close" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="patient">
        <!-- Patient Header Info -->
        <div class="patient-header-section">
          <div class="avatar-placeholder">
            {{ getInitials(patient.nm_pasien) }}
          </div>
          <div class="patient-main-info">
            <h2>{{ patient.nm_pasien }}</h2>
            <div class="badges">
              <span class="badge-rm">{{ patient.no_rkm_medis }}</span>
              <span :class="['badge-gender', patient.jk === 'L' ? 'male' : 'female']">
                {{ patient.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
              </span>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <!-- Personal Info -->
          <div class="info-card">
            <h4><i class="fas fa-id-card"></i> Informasi Pribadi</h4>
            <div class="info-item">
              <label>No. KTP / NIK</label>
              <p>{{ patient.no_ktp || '-' }}</p>
            </div>
            <div class="info-item">
              <label>Tempat, Tanggal Lahir</label>
              <p>{{ patient.tmp_lahir }}, {{ formatDate(patient.tgl_lahir) }}</p>
            </div>
             <div class="info-item">
              <label>Umur</label>
              <p>{{ patient.umur || '-' }}</p>
            </div>
            <div class="info-item">
              <label>Golongan Darah</label>
              <p>{{ patient.gol_darah || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Agama</label>
              <p>{{ patient.agama || '-' }}</p>
            </div>
            <div class="info-item">
              <label>Status Nikah</label>
              <p>{{ patient.stts_nikah || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Pendidikan</label>
              <p>{{ patient.pnd || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Pekerjaan</label>
              <p>{{ patient.pekerjaan || '-' }}</p>
            </div>
          </div>

          <!-- Contact & Address -->
          <div class="info-card">
            <h4><i class="fas fa-address-book"></i> Kontak & Alamat</h4>
             <div class="info-item">
              <label>No. Telepon</label>
              <p>{{ patient.no_tlp || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Email</label>
              <p>{{ patient.email || '-' }}</p>
            </div>
            <div class="info-item full-width">
              <label>Alamat Lengkap</label>
              <p>{{ patient.alamat || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Kelurahan</label>
              <p>{{ patient.nm_kel || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Kecamatan</label>
              <p>{{ patient.nm_kec || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Kabupaten</label>
              <p>{{ patient.nm_kab || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Propinsi</label>
              <p>{{ patient.nm_prop || '-' }}</p>
            </div>
          </div>

          <!-- Family / Guarantor -->
           <div class="info-card">
            <h4><i class="fas fa-users"></i> Penanggung Jawab</h4>
            <div class="info-item">
              <label>Nama Penanggung Jawab</label>
              <p>{{ patient.namakeluarga || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Hubungan</label>
              <p>{{ patient.keluarga || '-' }}</p>
            </div>
             <div class="info-item">
              <label>Pekerjaan</label>
              <p>{{ patient.pekerjaanpj || '-' }}</p>
            </div>
             <div class="info-item full-width">
              <label>Alamat PJ</label>
              <p>{{ patient.alamatpj || '-' }}, {{ patient.kelurahanpj }}, {{ patient.kecamatanpj }}, {{ patient.kabupatenpj }}, {{ patient.propinsipj }}</p>
            </div>
          </div>
          
           <!-- Insurance -->
           <div class="info-card">
            <h4><i class="fas fa-file-medical"></i> Jaminan Kesehatan</h4>
            <div class="info-item">
              <label>Jaminan</label>
              <p>{{ patient.penjab?.png_jawab || '-' }}</p>
            </div>
             <div class="info-item">
              <label>No. Peserta</label>
              <p>{{ patient.no_peserta || '-' }}</p>
            </div>
            
            <div class="mt-3">
              <button 
                v-if="!bpjsData && !loadingBpjs" 
                class="btn-check-bpjs" 
                @click="checkBpjsStatus"
              >
                <i class="fas fa-search"></i> Cek Status BPJS
              </button>

              <div v-if="loadingBpjs" class="bpjs-loading">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span>Mengecek ke BPJS...</span>
              </div>

              <div v-if="errorBpjs" class="bpjs-error">
                <i class="fas fa-exclamation-circle"></i> {{ errorBpjs }}
              </div>

              <div v-if="bpjsData" class="bpjs-result">
                <div :class="['status-badge', bpjsData.statusPeserta.kode === '0' ? 'active' : 'inactive']">
                  {{ bpjsData.statusPeserta.keterangan }}
                </div>
                <div class="bpjs-details">
                  <div class="detail-row">
                    <span>Nama:</span>
                    <strong>{{ bpjsData.nama }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>No. Kartu:</span>
                    <strong>{{ bpjsData.noKartu }}</strong>
                  </div>
                   <div class="detail-row">
                    <span>Nik:</span>
                    <strong>{{ bpjsData.nik }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Kelas:</span>
                    <strong>{{ bpjsData.hakKelas.keterangan }}</strong>
                  </div>
                   <div class="detail-row">
                    <span>Faskes 1:</span>
                    <strong>{{ bpjsData.provUmum.nmProvider }}</strong>
                  </div>
                   <div class="detail-row">
                    <span>Tgl Lahir:</span>
                    <strong>{{ bpjsData.tglLahir }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
       <!-- Loading State Detail -->
      <div class="modal-body loading-body" v-else>
         <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-primary" @click="close">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import bpjsVclaimService from '../../../services/bpjsVclaimService';

const props = defineProps({
  show: Boolean,
  patient: Object
});

const emit = defineEmits(['close']);

const bpjsData = ref(null);
const loadingBpjs = ref(false);
const errorBpjs = ref(null);

// Reset BPJS data when patient changes or modal closes
watch(() => props.patient, () => {
  bpjsData.value = null;
  errorBpjs.value = null;
});

const close = () => {
  emit('close');
};

const checkBpjsStatus = async () => {
  if (!props.patient) return;

  loadingBpjs.value = true;
  errorBpjs.value = null;
  bpjsData.value = null;

  try {
    const today = new Date().toISOString().slice(0, 10);
    let response;

    // Prioritize No. Kartu (No. Peserta)
    if (props.patient.no_peserta && props.patient.no_peserta.length > 5) {
      // Remove any non-numeric characters just in case
      const noKartu = props.patient.no_peserta.replace(/\D/g, '');
      response = await bpjsVclaimService.getPesertaByNoKartu(noKartu, today);
    } 
    // Fallback to NIK (No. KTP)
    else if (props.patient.no_ktp && props.patient.no_ktp.length > 10) {
      response = await bpjsVclaimService.getPesertaByNik(props.patient.no_ktp, today);
    } else {
      throw new Error("Data No. Peserta atau NIK tidak valid untuk pengecekan.");
    }

    if (response.data && response.data.metaData && response.data.metaData.code === "200") {
      bpjsData.value = response.data.response.peserta;
    } else {
      throw new Error(response.data?.metaData?.message || "Gagal mengambil data peserta BPJS.");
    }

  } catch (error) {
    console.error("BPJS Check Error:", error);
    errorBpjs.value = error.message || "Terjadi kesalahan saat pengecekan.";
  } finally {
    loadingBpjs.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00') return '-';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .match(/(^\S\S?|\s\S)?/g)
    .map(v => v.trim())
    .join('')
    .match(/(^\S|\S$)?/g)
    .join('')
    .toLocaleUpperCase()
    .substring(0, 2);
};
</script>

<style scoped>
/* BPJS Styles */
.mt-3 { margin-top: 1rem; }

.btn-check-bpjs {
  width: 100%;
  padding: 0.6rem;
  background-color: #00a859; /* BPJS Green color */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-check-bpjs:hover {
  background-color: #008f4c;
}

.bpjs-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #636e72;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.bpjs-error {
  color: #e74c3c;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: #fce4ec;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bpjs-result {
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fcfcfc;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.bpjs-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  border-bottom: 1px solid #f1f2f6;
  padding-bottom: 0.25rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: #7f8c8d;
}

.detail-row strong {
  color: #2c3e50;
  text-align: right;
  max-width: 65%;
}

/* Original Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* Blur effect */
   backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title i { color: #3498db; }

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #95a5a6;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.btn-close:hover { color: #e74c3c; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.loading-body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

/* Patient Header */
.patient-header-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.avatar-placeholder {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.patient-main-info h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #2c3e50;
}

.badges {
    display: flex;
    gap: 0.75rem;
}

.badge-rm {
  background-color: #34495e;
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: 'Roboto Mono', monospace;
}

.badge-gender {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-gender.male { background-color: #e8f5e9; color: #2e7d32; }
.badge-gender.female { background-color: #fce4ec; color: #c2185b; }

/* Grid Layout */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .patient-header-section {
        flex-direction: column;
        text-align: center;
    }
}

.info-card {
    background: #ffffff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 1.25rem;
}

.info-card h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #2c3e50;
    border-bottom: 2px solid #f5f6fa;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-card h4 i { color: #f39c12; }

.info-item {
    margin-bottom: 0.75rem;
}

.info-item label {
    display: block;
    font-size: 0.8rem;
    color: #95a5a6;
    margin-bottom: 0.1rem;
}

.info-item p {
    margin: 0;
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.95rem;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  background: #f8f9fa;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2980b9;
}
</style>
