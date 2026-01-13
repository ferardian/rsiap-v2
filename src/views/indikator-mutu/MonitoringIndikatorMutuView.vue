<template>
  <div class="container-fluid p-0">
    <div class="row mb-4">
      <div class="col-md-6">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-chart-line me-2"></i>Monitoring Indikator Mutu
        </h3>
        <p class="text-muted mb-0">Pantau, analisa, dan pelaporan mutu rumah sakit</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-pills mb-3" role="tablist">
      <li class="nav-item">
        <button 
            class="nav-link" 
            :class="{ active: activeTab === 'monitoring' }" 
            @click="activeTab = 'monitoring'"
        >
          <i class="fas fa-desktop me-1"></i> Monitoring
        </button>
      </li>
      <li class="nav-item">
        <button 
            class="nav-link" 
            :class="{ active: activeTab === 'analisa' }" 
            @click="activeTab = 'analisa'"
        >
          <i class="fas fa-microscope me-1"></i> Analisa Data
        </button>
      </li>
      <li class="nav-item">
        <button 
            class="nav-link" 
            :class="{ active: activeTab === 'kamus' }" 
            @click="activeTab = 'kamus'"
        >
          <i class="fas fa-book me-1"></i> Kamus Indikator
        </button>
      </li>
      <li class="nav-item">
        <button 
            class="nav-link" 
            :class="{ active: activeTab === 'laporan' }" 
            @click="activeTab = 'laporan'"
        >
          <i class="fas fa-file-alt me-1"></i> Laporan
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
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
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import MonitoringInmutTab from '@/components/indikator-mutu/MonitoringInmutTab.vue'
import AnalisaMutuTab from '@/components/indikator-mutu/AnalisaMutuTab.vue'
import KamusInmutTab from '@/components/indikator-mutu/KamusInmutTab.vue'
import LaporanMutuTab from '@/components/indikator-mutu/LaporanMutuTab.vue'

const activeTab = ref('monitoring')
</script>

<style scoped>
.nav-pills .nav-link {
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    margin-right: 0.5rem;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
}

.nav-pills .nav-link:hover {
    background-color: #e9ecef;
    color: #495057;
}

.nav-pills .nav-link.active {
    color: #fff;
    background-color: #435ebe;
    font-weight: 600;
}
</style>
