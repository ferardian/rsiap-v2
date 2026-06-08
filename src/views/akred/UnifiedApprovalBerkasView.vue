<template>
  <div class="unified-approval-page p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-signature"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Approval Berkas</h3>
            <p class="page-subtitle mb-0 small">Verifikasi dan persetujuan berkas dokumen SPO, PERDIR, dan SK</p>
          </div>
        </div>
        
        <div class="header-tabs-premium">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            <i :class="[tab.icon, 'me-1']"></i> {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <keep-alive>
        <component 
          :is="activeComponent" 
          mode="approval" 
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SpoView from '@/views/akred/SpoView.vue'

const activeTab = ref('SPO')

const tabs = [
  { id: 'SPO', label: 'SPO', icon: 'fas fa-file-medical' },
  { id: 'PERDIR', label: 'PERDIR', icon: 'fas fa-file-contract' },
  { id: 'SK', label: 'SK', icon: 'fas fa-file-signature' }
]

// Placeholder Component for missing views
const PlaceholderComponent = {
  name: 'PlaceholderComponent',
  template: `
    <div class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-3">
          <i class="fas fa-tools fa-3x text-muted opacity-50"></i>
        </div>
        <h5 class="text-muted fw-bold">Fitur Belum Tersedia</h5>
        <p class="text-muted mb-0">Modul ini sedang dalam pengembangan.</p>
      </div>
    </div>
  `
}

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'SPO':
      return SpoView
    case 'PERDIR':
    case 'SK':
    default:
      return PlaceholderComponent
  }
})
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
  gap: 6px;
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
</style>

