<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content glass-effect" @click.stop>
      <div class="modal-header">
        <div class="header-left">
            <h3 class="modal-title">
            <i class="fas fa-history text-primary"></i>
            Riwayat Pemeriksaan
            </h3>
            <p class="patient-subtitle" v-if="patientName">
                {{ patientName }} <span class="rm-badge">#{{ noMskMedis }}</span>
            </p>
        </div>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body custom-scroll">
        <!-- Loading State -->
        <div v-if="loading && visits.length === 0" class="loading-state">
            <div class="spinner-border text-primary" role="status"></div>
            <p>Memuat riwayat...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && visits.length === 0" class="empty-state">
            <img src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg" alt="No Data" class="empty-img">
            <h4>Belum Ada Riwayat</h4>
            <p>Pasien ini belum memiliki riwayat pemeriksaan tercatat.</p>
        </div>

        <!-- Timeline -->
        <div v-else class="timeline-container">
            <div v-for="(visit, index) in visits" :key="visit.no_rawat" class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content card-visit">
                    <div class="visit-header">
                        <div class="visit-meta">
                            <span class="visit-date bg-soft-primary text-primary">
                                <i class="far fa-calendar-alt"></i> {{ formatDate(visit.tgl_registrasi) }}
                            </span>
                             <span class="visit-time bg-soft-secondary text-secondary">
                                <i class="far fa-clock"></i> {{ visit.jam_reg }}
                            </span>
                            <span class="visit-type" :class="visit.status_lanjut === 'Ralan' ? 'type-ralan' : 'type-ranap'">
                                {{ visit.status_lanjut === 'Ralan' ? 'Rawat Jalan' : 'Rawat Inap' }}
                            </span>
                        </div>
                        <div class="visit-doctor">
                            <div class="doc-icon">
                                <i class="fas fa-user-md"></i>
                            </div>
                            <div>
                                <h4 class="doc-name">{{ visit.dokter?.nm_dokter || 'Dokter tidak diketahui' }}</h4>
                                <span class="poli-name">{{ visit.poliklinik?.nm_poli || '-' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="visit-body">
                        <div v-if="getExaminations(visit).length > 0">
                            <div v-for="(exam, i) in getExaminations(visit)" :key="i" class="exam-entry" :class="{ 'mt-4 pt-4 border-top': i > 0 }">
                                <div class="exam-meta mb-3">
                                    <span class="exam-date badge bg-light text-dark me-2">
                                        <i class="far fa-calendar"></i> {{ formatDate(exam.tgl_perawatan) }}
                                    </span>
                                    <span class="exam-time badge bg-light text-dark">
                                        <i class="far fa-clock"></i> {{ exam.jam_rawat }}
                                    </span>
                                    <span class="exam-pic text-muted ms-2" v-if="exam.petugas?.nama">
                                        <i class="fas fa-user-edit"></i> {{ exam.petugas.nama }}
                                    </span>
                                </div>

                                <!-- TTV Section -->
                                <div class="ttv-grid">
                                    <div class="ttv-item" title="Tensi">
                                        <i class="fas fa-heartbeat text-danger"></i>
                                        <span class="ttv-value">{{ exam.tensi || '-' }}</span>
                                        <span class="ttv-label">mmHg</span>
                                    </div>
                                    <div class="ttv-item" title="Nadi">
                                        <i class="fas fa-wave-square text-success"></i>
                                        <span class="ttv-value">{{ exam.nadi || '-' }}</span>
                                        <span class="ttv-label">x/mnt</span>
                                    </div>
                                    <div class="ttv-item" title="Suhu">
                                        <i class="fas fa-thermometer-half text-warning"></i>
                                        <span class="ttv-value">{{ exam.suhu_tubuh || '-' }}</span>
                                        <span class="ttv-label">°C</span>
                                    </div>
                                    <div class="ttv-item" title="Respirasi">
                                        <i class="fas fa-lungs text-info"></i>
                                        <span class="ttv-value">{{ exam.respirasi || '-' }}</span>
                                        <span class="ttv-label">x/mnt</span>
                                    </div>
                                    <div class="ttv-item" title="SpO2">
                                        <i class="fas fa-wind text-primary"></i>
                                        <span class="ttv-value">{{ exam.spo2 || '-' }}</span>
                                        <span class="ttv-label">%</span>
                                    </div>
                                </div>

                                <!-- SOAP Section -->
                                <div class="soap-container">
                                    <div class="soap-item subjective">
                                        <span class="soap-badge">S</span>
                                        <p>{{ exam.keluhan || '-' }}</p>
                                    </div>
                                    <div class="soap-item objective">
                                        <span class="soap-badge">O</span>
                                        <p>{{ exam.pemeriksaan || '-' }}</p>
                                    </div>
                                    <div class="soap-item assessment">
                                        <span class="soap-badge">A</span>
                                        <p>{{ exam.penilaian || '-' }}</p>
                                    </div>
                                    <div class="soap-item plan">
                                        <span class="soap-badge">P</span>
                                        <div class="plan-content">
                                            <p v-if="exam.rtl"><strong>RTL:</strong> {{ exam.rtl }}</p>
                                            <p v-if="exam.instruksi"><strong>Instruksi:</strong> {{ exam.instruksi }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-soap">
                            <i class="fas fa-clipboard-list"></i> Belum ada data pemeriksaan medis.
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Load More -->
             <div v-if="hasNextPage" class="load-more-container">
                 <button @click="loadMore" :disabled="loading" class="btn-load-more">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Memuat...' : 'Muat Lebih Banyak' }}
                 </button>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '../../../services/api' // Assuming a generic API service exists, usually imported in other files

const props = defineProps({
  show: Boolean,
  noMskMedis: String, 
  patientName: String
})

const emit = defineEmits(['close'])

const visits = ref([])
const loading = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)

// Watch for modal opening to fetch data
watch(() => props.show, (newVal) => {
  if (newVal && props.noMskMedis) {
    visits.value = []
    currentPage.value = 1
    fetchHistory()
  }
})

const hasNextPage = computed(() => currentPage.value < lastPage.value)

const fetchHistory = async () => {
    if (!props.noMskMedis) return
    
    loading.value = true
    try {
        // Fetch history with includes for examination details
        const response = await api.get(`/pasien/riwayat-pemeriksaan/${props.noMskMedis}`, {
            params: {
                page: currentPage.value,
                include: 'pemeriksaanRalan.petugas,pemeriksaanRanap.petugas,dokter,poliklinik'
            }
        })

        if (response.data) {
            const newData = response.data.data
            if (currentPage.value === 1) {
                visits.value = newData
            } else {
                visits.value = [...visits.value, ...newData]
            }
            
            // Handle pagination meta data (adjust based on your API response structure)
            const meta = response.data.meta || response.data
            lastPage.value = meta.last_page || 1
        }
    } catch (e) {
        console.error('Failed to fetch history', e)
    } finally {
        loading.value = false
    }
}

const loadMore = () => {
    if (!loading.value && hasNextPage.value) {
        currentPage.value++
        fetchHistory()
    }
}

// Helper to extract all examination data (Ralan or Ranap)
const getExaminations = (visit) => {
    let exams = []
    
    // Combine both Ralan and Ranap examinations
    const ralan = visit.pemeriksaan_ralan || []
    const ranap = visit.pemeriksaan_ranap || []
    
    exams = [...ralan, ...ranap]
    
    // Sort by time descending (newest first)
    return exams.sort((a, b) => {
        const timeA = a.tgl_perawatan + ' ' + a.jam_rawat
        const timeB = b.tgl_perawatan + ' ' + b.jam_rawat
        return new Date(timeB) - new Date(timeA)
    })
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  z-index: 10;
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

.patient-subtitle {
    margin: 0.25rem 0 0 2rem;
    color: #64748b;
    font-size: 0.9rem;
}

.rm-badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.8rem;
    margin-left: 0.5rem;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f8fafc;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* Timeline Styles */
.timeline-container {
    position: relative;
    padding-left: 2rem;
}

.timeline-container::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
    margin-left: 7px;
}

.timeline-item {
    position: relative;
    margin-bottom: 2rem;
}

.timeline-marker {
    position: absolute;
    left: -2rem;
    top: 1.5rem;
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border: 3px solid #dbeafe;
    border-radius: 50%;
    z-index: 2;
    box-shadow: 0 0 0 4px #fff;
}

.card-visit {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    transition: transform 0.2s;
    border: 1px solid #f1f5f9;
}

.card-visit:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.visit-header {
    padding: 1.25rem;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
}

.visit-meta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.visit-date, .visit-time, .visit-type {
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.bg-soft-primary { background: #eff6ff; color: #1d4ed8; }
.bg-soft-secondary { background: #f8fafc; color: #475569; }

.visit-type {
    color: white;
}
.type-ralan { background: #10b981; } /* Emerald */
.type-ranap { background: #f59e0b; } /* Amber */

.visit-doctor {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.doc-icon {
    width: 40px;
    height: 40px;
    background: #f0fdf4;
    color: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.doc-name {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
}

.poli-name {
    font-size: 0.8rem;
    color: #64748b;
}

.visit-body {
    padding: 1.5rem;
}

/* TTV Grid */
.ttv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed #e2e8f0;
}

.ttv-item {
    background: #f8fafc;
    padding: 0.75rem;
    border-radius: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.ttv-item i { font-size: 1.25rem; margin-bottom: 0.25rem; }
.ttv-value { font-weight: 700; font-size: 1.1rem; color: #334155; }
.ttv-label { font-size: 0.75rem; color: #94a3b8; }

/* SOAP Styles */
.soap-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.soap-item {
    display: flex;
    gap: 1rem;
}

.soap-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.soap-item.subjective .soap-badge { background: #ffe4e6; color: #be123c; }
.soap-item.objective .soap-badge { background: #dbeafe; color: #1d4ed8; }
.soap-item.assessment .soap-badge { background: #dcfce7; color: #15803d; }
.soap-item.plan .soap-badge { background: #fef9c3; color: #a16207; }

.soap-item p {
    margin: 0;
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.6;
    padding-top: 0.25rem;
}

.plan-content p {
    margin-bottom: 0.5rem;
}

.no-soap {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    background: #f8fafc;
    border-radius: 12px;
    font-style: italic;
}

/* Utilities */
.text-danger { color: #ef4444; }
.text-success { color: #22c55e; }
.text-warning { color: #f59e0b; }
.text-info { color: #06b6d4; }
.text-primary { color: #3b82f6; }

.loading-state, .empty-state {
    text-align: center;
    padding: 4rem;
    color: #64748b;
}

.empty-img {
    width: 200px;
    margin-bottom: 1.5rem;
    opacity: 0.8;
}

.btn-load-more {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e2e8f0;
    color: #64748b;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-load-more:hover {
    background: #f8fafc;
    color: #3b82f6;
    border-color: #3b82f6;
}

.btn-load-more:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .modal-content {
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
    
    .timeline-container {
        padding-left: 1.5rem;
    }
    
    .timeline-marker {
        width: 12px;
        height: 12px;
        left: -1.7rem;
    }
}
</style>
