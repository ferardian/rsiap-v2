<template>
  <div class="master-data-page">
    <div class="page-header">
      <h2>📦 Master Data Aset & Fasilitas</h2>
      <p class="subtitle">Kelola data master inventaris, lokasi, dan supplier.</p>
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
      <component :is="activeComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import JenisKategoriTab from './tabs/JenisKategoriTab.vue'
import KatalogProdukTab from './tabs/KatalogProdukTab.vue'
import RuangLokasiTab from './tabs/RuangLokasiTab.vue'
import SupplierTab from './tabs/SupplierTab.vue'

// Define Tabs
const tabs = [
  { id: 'jenis-kategori', label: 'Jenis & Kategori', icon: 'fas fa-tags', component: JenisKategoriTab },
  { id: 'katalog', label: 'Katalog Produk', icon: 'fas fa-box-open', component: KatalogProdukTab },
  { id: 'ruang', label: 'Ruang & Lokasi', icon: 'fas fa-map-marker-alt', component: RuangLokasiTab },
  { id: 'supplier', label: 'Relasi Supplier', icon: 'fas fa-handshake', component: SupplierTab },
]

const currentTab = ref(tabs[0].id)

const activeComponent = computed(() => {
  return tabs.find(t => t.id === currentTab.value)?.component
})
</script>

<style scoped>
.master-data-page {
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
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
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
