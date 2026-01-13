<template>
  <div class="unified-approval-page">
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-primary text-white border-bottom-0 pt-3 px-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0 text-white">Approval Berkas</h5>
        <ul class="nav nav-tabs card-header-tabs approval-tabs ms-auto">
          <li class="nav-item" v-for="tab in tabs" :key="tab.id">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === tab.id }"
              href="#"
              @click.prevent="activeTab = tab.id"
            >
              <i :class="[tab.icon, 'me-2']"></i>
              {{ tab.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

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
.unified-approval-page .card {
  background-color: #ffffff !important;
  border-radius: 12px;
}

.unified-approval-page .card-header {
  border-bottom: 1px solid #f1f5f9;
}

/* Modern Segmented Control Style */
.approval-tabs {
  background-color: rgba(255, 255, 255, 0.2); /* Semi-transparent white on blue */
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: none !important;
  display: inline-flex;
}

.approval-tabs .nav-link {
  border: none !important;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8) !important; /* White text */
  font-weight: 500;
  padding: 0.6rem 1.25rem;
  margin: 0;
  background: transparent !important;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.approval-tabs .nav-link:hover:not(.active) {
  background-color: rgba(255,255,255,0.1) !important;
  color: #ffffff !important;
}

.approval-tabs .nav-link.active {
  background-color: #ffffff !important;
  color: #2563eb !important; /* Blue text */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 600;
  transform: translateY(0);
}
</style>
