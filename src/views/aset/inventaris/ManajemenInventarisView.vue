<template>
  <div class="inventaris-page">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-title">
        <h2 class="fw-bold text-primary mb-1">🗄️ Manajemen Inventaris</h2>
        <p class="subtitle mb-0">Kelola master barang, item inventaris, sirkulasi peminjaman, dan hibah aset.</p>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <component 
        :is="activeComponent" 
        :is-mobile="isMobile"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import KoleksiBarangTab from './tabs/KoleksiBarangTab.vue'
import ItemInventarisTab from './tabs/ItemInventarisTab.vue'
import SirkulasiTab from './tabs/SirkulasiTab.vue'
import HibahTab from './tabs/HibahTab.vue'

// Mobile Detection
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Define Tabs
const tabs = [
  { id: 'koleksi', label: 'Master Barang', icon: 'fas fa-boxes', component: KoleksiBarangTab },
  { id: 'item', label: 'Item Inventaris (Aset)', icon: 'fas fa-barcode', component: ItemInventarisTab },
  { id: 'sirkulasi', label: 'Sirkulasi / Peminjaman', icon: 'fas fa-exchange-alt', component: SirkulasiTab },
  { id: 'hibah', label: 'Hibah Aset', icon: 'fas fa-gift', component: HibahTab },
]

const currentTab = ref(tabs[0].id)

const activeComponent = computed(() => {
  return tabs.find(t => t.id === currentTab.value)?.component
})
</script>

<style scoped>
.inventaris-page {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin-top: 0.5rem;
}

.tabs-nav {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: thin;
  padding-bottom: 5px;
}

.tabs-nav::-webkit-scrollbar {
  height: 4px;
}

.tabs-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 400px;
}
</style>
