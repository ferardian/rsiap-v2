<template>
  <div class="container-fluid p-3 p-md-4">
    <!-- Premium Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-chart-line"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Monitoring Indikator Mutu</h3>
            <p class="page-subtitle mb-0 small">Pantau, analisa, dan pelaporan mutu rumah sakit</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="tabs-nav mb-4">
      <div class="header-tabs-premium">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'rekap_tahunan' }" 
          @click="activeTab = 'rekap_tahunan'"
        >
          <i class="fas fa-calendar-alt"></i> Rekap Tahunan
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'monitoring' }" 
          @click="activeTab = 'monitoring'"
        >
          <i class="fas fa-desktop"></i> Monitoring
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'analisa' }" 
          @click="activeTab = 'analisa'"
        >
          <i class="fas fa-microscope"></i> Analisa Data
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'kamus' }" 
          @click="activeTab = 'kamus'"
        >
          <i class="fas fa-book"></i> Kamus Indikator
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'laporan' }" 
          @click="activeTab = 'laporan'"
        >
          <i class="fas fa-file-alt"></i> Laporan
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'rekap_feedback' }" 
          @click="activeTab = 'rekap_feedback'"
        >
          <i class="fas fa-comment-medical"></i> Rekap Supervisi
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'supervisi_implikasi' }" 
          @click="activeTab = 'supervisi_implikasi'"
        >
          <i class="fas fa-clipboard-check"></i> Ceklist Implikasi
        </button>
      </div>
    </nav>

    <!-- Tab Content -->
    <div class="content-card">
      <div class="card-body p-4">
        <KeepAlive>
            <RekapTahunanTab v-if="activeTab === 'rekap_tahunan'" />
        </KeepAlive>
        
        <KeepAlive>
            <MonitoringInmutTab v-if="activeTab === 'monitoring'" />
        </KeepAlive>
        
        <KeepAlive>
            <AnalisaMutuTab v-if="activeTab === 'analisa'" />
        </KeepAlive>
        
        <KeepAlive>
             <KamusInmutTab v-if="activeTab === 'kamus'" />
        </KeepAlive>
       
        <KeepAlive>
             <LaporanMutuTab v-if="activeTab === 'laporan'" />
        </KeepAlive>

        <KeepAlive>
             <RekapFeedbackTab v-if="activeTab === 'rekap_feedback'" />
        </KeepAlive>

        <KeepAlive>
             <SupervisiImplikasiTab v-if="activeTab === 'supervisi_implikasi'" />
        </KeepAlive>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import RekapTahunanTab from '@/components/indikator-mutu/RekapTahunanTab.vue'
import MonitoringInmutTab from '@/components/indikator-mutu/MonitoringInmutTab.vue'
import AnalisaMutuTab from '@/components/indikator-mutu/AnalisaMutuTab.vue'
import KamusInmutTab from '@/components/indikator-mutu/KamusInmutTab.vue'
import LaporanMutuTab from '@/components/indikator-mutu/LaporanMutuTab.vue'
import RekapFeedbackTab from '@/components/indikator-mutu/RekapFeedbackTab.vue'
import SupervisiImplikasiTab from '@/components/indikator-mutu/SupervisiImplikasiTab.vue'

const activeTab = ref('rekap_tahunan')
</script>

<style scoped>
.header-icon-bg {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.5rem;
}

.header-tabs-premium {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: fit-content;
  max-width: 100%;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover:not(.active) {
  color: #0f172a;
  background: #e2e8f0;
}

.tab-btn.active {
  background: white;
  color: #2563eb !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

@media (max-width: 768px) {
  .header-tabs-premium {
    width: 100%;
    overflow-x: auto;
  }
  .tab-btn {
    flex: 1;
    white-space: nowrap;
    justify-content: center;
  }
}
</style>
