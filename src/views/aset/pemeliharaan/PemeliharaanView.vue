<template>
  <div class="pemeliharaan-container">
    <div class="page-header">
      <h2>Pemeliharaan Aset & Fasilitas</h2>
      <p class="subtitle">Manajemen perbaikan dan pemeliharaan inventaris serta gedung</p>
    </div>

    <div class="tabs-container">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <component :is="currentTabComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TiketPerbaikanTab from './tabs/TiketPerbaikanTab.vue'
import PerbaikanServisTab from './tabs/PerbaikanServisTab.vue'
import FasilitasGedungTab from './tabs/FasilitasGedungTab.vue'

const activeTab = ref('tiket')

const tabs = [
  { id: 'tiket', label: 'Tiket Perbaikan', icon: 'fas fa-ticket-alt', component: TiketPerbaikanTab },
  { id: 'servis', label: 'Perbaikan & Servis', icon: 'fas fa-tools', component: PerbaikanServisTab },
  { id: 'gedung', label: 'Fasilitas Gedung', icon: 'fas fa-building', component: FasilitasGedungTab }
]

const currentTabComponent = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.component
})
</script>

<style scoped>
.pemeliharaan-container {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #1e293b;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.tabs-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  padding: 0 1rem;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  color: #3b82f6;
  background: #f8fafc;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  padding: 1.5rem;
}
</style>
