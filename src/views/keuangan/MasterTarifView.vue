<template>
  <div class="master-tarif-wrapper">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <div class="d-flex align-items-center gap-2">
          <span class="header-badge-icon">
            <i class="fas fa-file-invoice-dollar text-primary"></i>
          </span>
          <h1 class="page-title m-0">Master Tarif Perawatan</h1>
        </div>
        <p class="page-subtitle mt-1">Konfigurasi dan kelola seluruh master data tarif rawat jalan, rawat inap, paket operasi, laboratorium, dan radiologi</p>
      </div>
      <div class="header-action">
        <button 
          class="btn btn-outline-primary rounded-pill px-3.5 py-2 shadow-2xs fw-semibold d-inline-flex align-items-center gap-2 bg-white"
          @click="openKelolaKategori"
          title="Kelola Master Kategori Perawatan"
        >
          <i class="fas fa-tags"></i>
          <span>Kelola Kategori</span>
        </button>
      </div>
    </div>

    <!-- Modern Capsule Tabs -->
    <div class="capsule-tabs modern-capsule-tabs mb-4">
      <div class="tabs-container custom-scrollbar">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="capsule-tab" 
          :class="[
            { 'active': activeTab === tab.id },
            `tab-${tab.id}`
          ]" 
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon" class="me-2"></i> {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Contents with Smooth Fade Transition -->
    <div class="tab-content transition-all">
      <transition name="fade" mode="out-in">
        <component :is="activeTabComponent"></component>
      </transition>
    </div>

    <!-- Modal Kelola Kategori Global -->
    <ModalKelolaKategori ref="modalKelolaKategoriRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Import tab components
import TabTarifRalan from '@/components/keuangan/tarif/TabTarifRalan.vue'
import TabTarifRanap from '@/components/keuangan/tarif/TabTarifRanap.vue'
import TabTarifOperasi from '@/components/keuangan/tarif/TabTarifOperasi.vue'
import TabTarifLab from '@/components/keuangan/tarif/TabTarifLab.vue'
import TabTarifRadiologi from '@/components/keuangan/tarif/TabTarifRadiologi.vue'
import ModalKelolaKategori from '@/components/keuangan/tarif/ModalKelolaKategori.vue'

const activeTab = ref('ralan')
const modalKelolaKategoriRef = ref(null)

const openKelolaKategori = () => {
  modalKelolaKategoriRef.value?.openModal()
}

const tabs = [
  { id: 'ralan', label: 'Rawat Jalan', icon: 'fas fa-stethoscope' },
  { id: 'ranap', label: 'Rawat Inap', icon: 'fas fa-bed' },
  { id: 'operasi', label: 'Paket Operasi', icon: 'fas fa-procedures' },
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.tab-content {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.header-badge-icon {
  width: 40px;
  height: 40px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.1);
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
  font-size: 1.75rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.925rem;
}

/* Modern Capsule Tabs Styling */
.modern-capsule-tabs {
  background: white;
  padding: 0.4rem;
  border-radius: 100px;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.tabs-container {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}
.tabs-container::-webkit-scrollbar {
  display: none;
}

.capsule-tab {
  background: transparent;
  border: none;
  padding: 0.6rem 1.35rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
}

.capsule-tab:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
  transform: translateY(-1px);
}

.capsule-tab.active {
  color: white;
  transform: scale(1.02);
}

.capsule-tab.active.tab-ralan {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.capsule-tab.active.tab-ranap {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.capsule-tab.active.tab-operasi {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.capsule-tab.active.tab-lab {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
}

.capsule-tab.active.tab-rad {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.capsule-tab.active i {
  color: #ffffff;
}

/* Transitions for Tab Content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
