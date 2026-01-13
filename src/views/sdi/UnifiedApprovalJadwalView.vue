<template>
  <div class="unified-approval-page">
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-white border-bottom-0 pt-3 px-3">
        <ul class="nav nav-tabs card-header-tabs approval-tabs">
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'jadwal-kerja' }"
              href="#"
              @click.prevent="activeTab = 'jadwal-kerja'"
            >
              <i class="fas fa-calendar-alt me-2"></i>Jadwal Kerja
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'jadwal-tambahan' }"
              href="#"
              @click.prevent="activeTab = 'jadwal-tambahan'"
            >
              <i class="fas fa-calendar-plus me-2"></i>Jadwal Tambahan
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <keep-alive>
        <component :is="activeComponent" :allow-all-departments="allowAllDepartments" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ApprovalJadwalView from './ApprovalJadwalView.vue'
import ApprovalJadwalTambahanView from './ApprovalJadwalTambahanView.vue'

const props = defineProps({
  allowAllDepartments: {
    type: Boolean,
    default: false
  }
})

const activeTab = ref('jadwal-kerja')

const activeComponent = computed(() => {
  return activeTab.value === 'jadwal-kerja' 
    ? ApprovalJadwalView 
    : ApprovalJadwalTambahanView
})
</script>

<style scoped>
.unified-approval-page .card {
  background-color: #ffffff !important;
  border-radius: 12px;
}

.unified-approval-page .card-header {
  background-color: #ffffff !important;
  border-bottom: 1px solid #f1f5f9;
}

/* Modern Segmented Control Style */
.approval-tabs {
  background-color: #f1f5f9;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: none !important;
  display: inline-flex;
}

.approval-tabs .nav-link {
  border: none !important;
  border-radius: 0.5rem;
  color: #64748b !important;
  font-weight: 500;
  padding: 0.6rem 1.25rem;
  margin: 0;
  background: transparent !important;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.approval-tabs .nav-link:hover:not(.active) {
  background-color: rgba(255,255,255,0.6) !important;
  color: #475569 !important;
}

.approval-tabs .nav-link.active {
  background-color: #ffffff !important;
  color: #2563eb !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Soft shadow */
  font-weight: 600;
  transform: translateY(0);
}
</style>
