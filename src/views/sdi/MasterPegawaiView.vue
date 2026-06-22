<template>
  <div class="container-fluid p-4">
    <div class="header-section mb-4">
      <h2 class="fw-bold text-dark mb-1">Master Data Kepegawaian</h2>
      <p class="text-muted">Kelola data departemen, jabatan, dan kualifikasi kepegawaian lainnya.</p>
    </div>

    <!-- Tabbed Navigation -->
    <div class="card border-0 shadow-sm mb-4" style="border-radius: 16px;">
      <div class="card-body p-2">
        <ul class="nav nav-pills nav-justified bg-light p-1" style="border-radius: 12px;">
          <li class="nav-item" v-for="tab in tabs" :key="tab.id">
            <button 
              class="nav-link border-0 text-dark fw-semibold py-2" 
              :class="{ 'active-tab shadow-sm': activeTab === tab.id }"
              @click="activeTab = tab.id"
              style="border-radius: 10px; transition: all 0.3s ease;"
            >
              <i :class="tab.icon" class="me-2"></i>
              {{ tab.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Active Content -->
    <div class="content-section">
      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'departemen'" key="departemen">
          <DepartemenModule />
        </div>
        <div v-else-if="activeTab === 'jabatan'" key="jabatan">
          <JabatanModule />
        </div>
        <div v-else-if="activeTab === 'mapping-jabatan'" key="mapping-jabatan">
          <MappingJabatanModule />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DepartemenModule from './components/DepartemenModule.vue';
import JabatanModule from './components/JabatanModule.vue';
import MappingJabatanModule from './components/MappingJabatanModule.vue';

const activeTab = ref('departemen');

const tabs = [
  { id: 'departemen', label: 'Departemen', icon: 'fas fa-building' },
  { id: 'jabatan', label: 'Jabatan', icon: 'fas fa-user-tie' },
  { id: 'mapping-jabatan', label: 'Mapping Jabatan', icon: 'fas fa-sitemap' },
];
</script>

<style scoped>
.active-tab {
  background-color: white !important;
  color: #3b82f6 !important;
}

.nav-link:not(.active-tab):hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
