<template>
  <div class="unified-approval-page p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Approval Jadwal Pegawai</h3>
            <p class="page-subtitle mb-0 small">Verifikasi dan persetujuan pengajuan jadwal kerja & jadwal tambahan pegawai</p>
          </div>
        </div>
        
        <div class="header-tabs-premium">
          <button 
            @click="activeTab = 'jadwal-kerja'" 
            :class="['tab-btn', { active: activeTab === 'jadwal-kerja' }]"
          >
            <i class="fas fa-calendar-alt"></i> Jadwal Kerja
          </button>
          <button 
            @click="activeTab = 'jadwal-tambahan'" 
            :class="['tab-btn', { active: activeTab === 'jadwal-tambahan' }]"
          >
            <i class="fas fa-calendar-plus"></i> Jadwal Tambahan
          </button>
        </div>
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
