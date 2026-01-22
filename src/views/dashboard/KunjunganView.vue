<template>
  <div class="visit-dashboard">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">📈 Dashboard Kunjungan</h1>
          <p class="page-subtitle">Analisis data kunjungan pasien Rawat Jalan & Rawat Inap</p>
        </div>
        <div class="header-actions">
          <div class="filter-group">
            <div class="filter-item">
              <label>Periode</label>
              <div class="date-inputs">
                <input type="date" v-model="filters.tgl_awal" @change="fetchData" class="form-input">
                <span>sampai</span>
                <input type="date" v-model="filters.tgl_akhir" @change="fetchData" class="form-input">
              </div>
            </div>
            <div class="filter-item">
              <label>Jenis Layanan</label>
              <select v-model="filters.status_lanjut" @change="fetchData" class="form-select">
                <option value="all">Semua Layanan</option>
                <option value="Ralan">Rawat Jalan</option>
                <option value="Ranap">Rawat Inap</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
      <p>Memuat data statistik...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">🏥</div>
          <div class="stat-info">
            <span class="stat-label">Total Kunjungan</span>
            <h3 class="stat-value">{{ summary.total }}</h3>
          </div>
        </div>
        <div class="stat-card new">
          <div class="stat-icon">🆕</div>
          <div class="stat-info">
            <span class="stat-label">Pasien Baru</span>
            <h3 class="stat-value">{{ summary.baru }} <small>({{ getPercentage(summary.baru, summary.total) }}%)</small></h3>
          </div>
        </div>
        <div class="stat-card old">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <span class="stat-label">Pasien Lama</span>
            <h3 class="stat-value">{{ summary.lama }} <small>({{ getPercentage(summary.lama, summary.total) }}%)</small></h3>
          </div>
        </div>
        <div class="stat-card gender">
          <div class="stat-icon">👫</div>
          <div class="stat-info">
            <span class="stat-label">Gender (L : P)</span>
            <h3 class="stat-value">{{ summary.pria }} : {{ summary.wanita }}</h3>
          </div>
        </div>
        <div class="stat-card keluar">
          <div class="stat-icon">🏥</div>
          <div class="stat-info">
            <span class="stat-label">Keluar (Hidup + Mati)</span>
            <h3 class="stat-value">{{ summary.keluar_l + summary.keluar_p }} <small>(L:{{ summary.keluar_l }} P:{{ summary.keluar_p }})</small></h3>
          </div>
        </div>
        <div class="stat-card mati">
          <div class="stat-icon">🥀</div>
          <div class="stat-info">
            <span class="stat-label">Keluar Meninggal</span>
            <h3 class="stat-value">{{ summary.mati_l + summary.mati_p }} <small>(L:{{ summary.mati_l }} P:{{ summary.mati_p }})</small></h3>
          </div>
        </div>
        <div class="stat-card mati-long">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <span class="stat-label">Meninggal >= 48 Jam</span>
            <h3 class="stat-value">{{ summary.mati_48_l + summary.mati_48_p }} <small>(L:{{ summary.mati_48_l }} P:{{ summary.mati_48_p }})</small></h3>
          </div>
        </div>
      </div>

      <div class="visuals-grid">
        <!-- Gender & Status Breakdown -->
        <div class="visual-card">
          <h4 class="card-title">Baru vs Lama (Per Gender)</h4>
          <div class="gender-breakdown-container">
               <div class="breakdown-item">
                    <span class="label">Baru (L)</span>
                    <div class="bar-container">
                         <div class="bar blue" :style="{ width: getPercentage(getData('Baru', 'L'), summary.total) + '%' }"></div>
                         <span class="value">{{ getData('Baru', 'L') }}</span>
                    </div>
               </div>
               <div class="breakdown-item">
                    <span class="label">Baru (P)</span>
                    <div class="bar-container">
                         <div class="bar pink" :style="{ width: getPercentage(getData('Baru', 'P'), summary.total) + '%' }"></div>
                         <span class="value">{{ getData('Baru', 'P') }}</span>
                    </div>
               </div>
               <div class="breakdown-item mt-4">
                    <span class="label">Lama (L)</span>
                    <div class="bar-container">
                         <div class="bar cyan" :style="{ width: getPercentage(getData('Lama', 'L'), summary.total) + '%' }"></div>
                         <span class="value">{{ getData('Lama', 'L') }}</span>
                    </div>
               </div>
               <div class="breakdown-item">
                    <span class="label">Lama (P)</span>
                    <div class="bar-container">
                         <div class="bar purple" :style="{ width: getPercentage(getData('Lama', 'P'), summary.total) + '%' }"></div>
                         <span class="value">{{ getData('Lama', 'P') }}</span>
                    </div>
               </div>
          </div>
        </div>

        <!-- Cara Bayar -->
        <div class="visual-card">
          <h4 class="card-title">Berdasarkan Cara Bayar</h4>
          <div class="list-visual">
            <div v-for="item in visitData.cara_bayar" :key="item.label" class="list-item">
              <div class="item-header">
                <span class="item-label">{{ item.label }}</span>
                <span class="item-value">{{ item.total }} ({{ getPercentage(item.total, summary.total) }}%)</span>
              </div>
              <div class="bar-container-mini">
                <div class="bar-mini primary" :style="{ width: getPercentage(item.total, summary.total) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Poli / Unit -->
        <div class="visual-card full-width">
          <h4 class="card-title">Berdasarkan Unit / Poliklinik</h4>
          <div class="poli-grid">
            <div v-for="item in visitData.poli" :key="item.label" class="poli-item">
              <span class="poli-name">{{ item.label }}</span>
              <div class="poli-bar-wrapper">
                   <div class="poli-bar" :style="{ height: getPercentage(item.total, summary.total) + '%' }">
                        <span class="poli-val">{{ item.total }}</span>
                   </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Dokter -->
        <div class="visual-card full-width">
          <h4 class="card-title">10 Dokter Teratas (Jumlah Pasien)</h4>
          <div class="doctor-list">
               <div v-for="(item, index) in visitData.dokter" :key="item.label" class="doctor-row">
                    <span class="doc-rank">{{ index + 1 }}</span>
                    <div class="doc-info">
                         <span class="doc-name">{{ item.label }}</span>
                         <div class="doc-bar-container">
                              <div class="doc-bar" :style="{ width: (item.total / (visitData.dokter[0]?.total || 1) * 100) + '%' }"></div>
                         </div>
                    </div>
                    <span class="doc-count">{{ item.total }} Pasien</span>
               </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dashboardVisitService from '../../services/dashboardVisitService'

const loading = ref(true)
const summary = ref({ 
  total: 0, baru: 0, lama: 0, pria: 0, wanita: 0, 
  keluar_l: 0, keluar_p: 0, mati_l: 0, mati_p: 0,
  mati_48_l: 0, mati_48_p: 0 
})
const visitData = ref({ registrasi: [], cara_bayar: [], poli: [], dokter: [] })

const filters = ref({
  tgl_awal: new Date().toISOString().substr(0, 10),
  tgl_akhir: new Date().toISOString().substr(0, 10),
  status_lanjut: 'all'
})

const fetchData = async () => {
  loading.value = true
  try {
    const response = await dashboardVisitService.getVisitStats(filters.value)
    const data = response.data.data
    visitData.value = data
    summary.value = data.summary
  } catch (error) {
    console.error('Failed to fetch visit stats:', error)
  } finally {
    loading.value = false
  }
}

const getPercentage = (value, total) => {
  if (!total) return 0
  return ((value / total) * 100).toFixed(1)
}

const getData = (stts, jk) => {
     if (!visitData.value.registrasi) return 0
     const item = visitData.value.registrasi.find(r => 
          r.stts_daftar?.toLowerCase() === stts.toLowerCase() && 
          r.jk?.toLowerCase() === jk.toLowerCase()
     )
     return item ? item.total : 0
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.visit-dashboard {
  padding: 0;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 2.5rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  opacity: 0.9;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.header-actions {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.25rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-item label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.form-input, .form-select {
  background: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
  outline: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card.keluar { border-bottom: 4px solid #10b981; }
.stat-card.mati { border-bottom: 4px solid #64748b; }
.stat-card.mati-long { border-bottom: 4px solid #475569; }


.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.stat-card:hover { rotate: 1deg; transform: scale(1.02); }

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f1f5f9;
  border-radius: 12px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.stat-value small {
     font-size: 0.85rem;
     color: #94a3b8;
}

/* Visuals Grid */
.visuals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.visual-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.full-width {
  grid-column: span 2;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3b82f6;
  padding-left: 0.75rem;
}

/* Bar Components */
.bar-container {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.bar {
  height: 100%;
  border-radius: 12px;
  transition: width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bar.blue { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.bar.pink { background: linear-gradient(90deg, #ec4899, #be185d); }
.bar.cyan { background: linear-gradient(90deg, #06b6d4, #0891b2); }
.bar.purple { background: linear-gradient(90deg, #a855f7, #7e22ce); }

.bar-container .value {
  position: absolute;
  right: 10px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 0 4px white;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  width: 100%;
}

.gender-breakdown-container {
     width: 100%;
}

.breakdown-item .label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

/* List Visuals */
.list-item {
  margin-bottom: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.bar-container-mini {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
}

.bar-mini {
  height: 100%;
  border-radius: 5px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-mini.primary { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

/* Poli Bar View */
.poli-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  height: 250px;
  align-items: flex-end;
}

.poli-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.poli-bar-wrapper {
  width: 100%;
  height: 180px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.poli-bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 6px;
  transition: height 1s ease;
  position: relative;
  display: flex;
  justify-content: center;
}

.poli-val {
  position: absolute;
  top: -20px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e293b;
}

.poli-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 0.75rem;
  text-align: center;
  word-break: break-all;
  height: 30px;
}

/* Doctor Rows */
.doctor-row {
     display: flex;
     align-items: center;
     gap: 1rem;
     padding: 0.75rem 0;
     border-bottom: 1px solid #f1f5f9;
}

.doc-rank {
     width: 24px;
     height: 24px;
     background: #eff6ff;
     color: #3b82f6;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 0.75rem;
     font-weight: 800;
}

.doc-info {
     flex: 1;
}

.doc-name {
     font-size: 0.9rem;
     font-weight: 700;
     color: #1e293b;
     display: block;
     margin-bottom: 0.25rem;
}

.doc-bar-container {
     height: 10px;
     background: #f1f5f9;
     border-radius: 5px;
     overflow: hidden;
}

.doc-bar {
     height: 100%;
     background: #10b981;
     border-radius: 5px;
     transition: width 1s ease;
}

.doc-count {
     font-size: 0.85rem;
     font-weight: 700;
     color: #059669;
}

/* Loader */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: #64748b;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .visuals-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: auto; }
  .header-content { flex-direction: column; align-items: flex-start; }
}

</style>
