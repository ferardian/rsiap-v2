<template>
  <div class="master-tarif-wrapper">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title">💳 Master Tarif</h1>
        <p class="page-subtitle">Kelola master data tarif perawatan rumah sakit</p>
      </div>
    </div>

    <!-- Modern Capsule Tabs -->
    <div class="capsule-tabs modern-capsule-tabs mb-4">
      <div class="tabs-container custom-scrollbar">
        <button v-for="tab in tabs" :key="tab.id" class="capsule-tab" :class="{ 'active': activeTab === tab.id }" @click="activeTab = tab.id">
          <i :class="tab.icon" class="me-2"></i> {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Contents -->
    <div class="tab-content transition-all">
      <transition name="fade" mode="out-in">
        <component :is="activeTabComponent"></component>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Import tab components (will be created next)
import TabTarifRalan from '@/components/keuangan/tarif/TabTarifRalan.vue'
import TabTarifRanap from '@/components/keuangan/tarif/TabTarifRanap.vue'
import TabTarifOperasi from '@/components/keuangan/tarif/TabTarifOperasi.vue'
import TabTarifLab from '@/components/keuangan/tarif/TabTarifLab.vue'
import TabTarifRadiologi from '@/components/keuangan/tarif/TabTarifRadiologi.vue'

const activeTab = ref('ralan')

const tabs = [
  { id: 'ralan', label: 'Rawat Jalan', icon: 'fas fa-stethoscope' },
  { id: 'ranap', label: 'Rawat Inap', icon: 'fas fa-bed' },
  { id: 'operasi', label: 'Operasi', icon: 'fas fa-procedures' },
  { id: 'lab', label: 'Laboratorium', icon: 'fas fa-flask' },
  { id: 'rad', label: 'Radiologi', icon: 'fas fa-x-ray' }
]

const componentsMap = {
  ralan: TabTarifRalan,
  ranap: TabTarifRanap,
  operasi: TabTarifOperasi,
  lab: TabTarifLab,
  rad: TabTarifRadiologi
}

const activeTabComponent = computed(() => componentsMap[activeTab.value])
</script>

<style scoped>
.master-tarif-wrapper {
  padding: 1.5rem;
  background-color: transparent;
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

/* Modern Capsule Tabs Styling */
.modern-capsule-tabs {
  background: white;
  padding: 0.5rem;
  border-radius: 100px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
}
.tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.capsule-tab {
  background: transparent;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
}

.capsule-tab:hover:not(.active) {
  background: #f1f5f9;
  color: #334155;
  transform: translateY(-1px);
}

.capsule-tab.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transform: scale(1.02);
}

.capsule-tab.active i {
  color: #e0f2fe;
}

/* Transitions for Tab Content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .master-tarif-wrapper {
    padding: 1rem;
  }
  
  .modern-capsule-tabs {
    border-radius: 16px;
    width: 100%;
    display: block;
  }
  
  .tabs-container {
    padding-bottom: 4px;
  }
  
  .capsule-tab {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
