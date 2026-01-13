<template>
  <div class="unified-logistik-page">
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-primary text-white border-bottom-0 pt-3 px-3 rounded-top-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h5 class="mb-0 fw-bold border-start border-4 border-white ps-2">Master Logistik</h5>
        </div>
        <ul class="nav nav-tabs card-header-tabs approval-tabs">
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'satuan' }"
              href="#"
              @click.prevent="activeTab = 'satuan'"
            >
              <i class="fas fa-balance-scale me-2"></i>Satuan
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === 'jenis' }"
              href="#"
              @click.prevent="activeTab = 'jenis'"
            >
              <i class="fas fa-boxes me-2"></i>Jenis Barang
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <keep-alive>
        <component :is="activeComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MasterSatuanView from './MasterSatuanView.vue'
import MasterJenisBarangView from './MasterJenisBarangView.vue'

const activeTab = ref('satuan')

const activeComponent = computed(() => {
  return activeTab.value === 'satuan' 
    ? MasterSatuanView 
    : MasterJenisBarangView
})
</script>

<style scoped>
.unified-logistik-page .card {
  border-radius: 12px;
}

.approval-tabs .nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500;
  border: none;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.approval-tabs .nav-link:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1);
}

.approval-tabs .nav-link.active {
  color: #0d6efd !important; /* Primary Blue Text for active tab on white bg */
  background: #fff !important;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
}
</style>
