<template>
  <div class="karyawan-unit-page">
    <div class="bento-container">
      <!-- Header Section -->
      <div class="bento-item header-item animate-in">
        <div class="header-content">
          <div class="title-group">
            <h2 class="section-title">Data Karyawan Unit</h2>
            <p class="section-subtitle">Monitoring berkas dan kualifikasi staf di departemen Anda</p>
          </div>
          <div class="action-group">
            <button class="btn-refresh" @click="fetchData" :disabled="isLoading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats Dashboard -->
      <div class="stats-grid animate-in">
        <div class="bento-item stat-card">
          <div class="stat-header">
            <i class="fas fa-venus-mars"></i>
            <span>Jenis Kelamin</span>
          </div>
          <div class="gender-split">
            <div class="gender-item">
              <span class="count">{{ statsByJK.wanita }}</span>
              <span class="label">Wanita</span>
            </div>
            <div class="gender-divider"></div>
            <div class="gender-item">
              <span class="count">{{ statsByJK.pria }}</span>
              <span class="label">Pria</span>
            </div>
          </div>
        </div>

        <div class="bento-item stat-card flex-grow">
          <div class="stat-header">
            <i class="fas fa-graduation-cap"></i>
            <span>Pendidikan</span>
          </div>
          <div class="edu-list">
            <div v-for="edu in statsByPendidikan" :key="edu.name" class="edu-pill">
              <span class="edu-name">{{ edu.name }}</span>
              <span class="edu-count">{{ edu.count }}</span>
            </div>
          </div>
        </div>
        
        <div class="bento-item stat-card">
          <div class="stat-header">
            <i class="fas fa-users"></i>
            <span>Total Staf</span>
          </div>
          <div class="total-big">
            {{ statsByJK.total }}
          </div>
        </div>
      </div>

      <!-- Main Content: Data Table -->
      <div class="bento-item table-item animate-in">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th width="60">Foto</th>
                <th>Nama &amp; NIK</th>
                <th>Jabatan &amp; Pendidikan</th>
                <th>Unit Kerja</th>
                <th class="text-center">Kategori</th>
                <template v-if="hasClinicalStaff">
                  <th class="text-center">STR</th>
                  <th class="text-center">SIP</th>
                  <th class="text-center">SPK/RKK</th>
                  <th class="text-center">VERIF IJAZAH</th>
                </template>
                <th class="text-center" width="110">Aksi / Berkas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td :colspan="dynamicColspan" class="text-center py-5">
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Memuat data karyawan...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="karyawan.length === 0">
                <td :colspan="dynamicColspan" class="text-center py-5">
                  <p class="empty-text">Tidak ada data karyawan ditemukan di unit ini.</p>
                </td>
              </tr>
              <tr v-for="item in karyawan" :key="item.nik">
                <td>
                  <div class="avatar-box clickable" @click="openDetailPegawai(item)" title="Klik untuk lihat detail & berkas">
                    <img v-if="item.photo" :src="getPhotoUrl(item.photo)" :alt="item.nama" class="avatar-img" />
                    <div v-else class="avatar-placeholder">
                      <i class="fas" :class="item.jk === 'Pria' ? 'fa-user' : 'fa-user-nurse'"></i>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="name-box clickable" @click="openDetailPegawai(item)" title="Klik untuk lihat detail & berkas">
                    <span class="staff-name">{{ item.nama }}</span>
                    <span class="staff-nik">{{ item.nik }}</span>
                  </div>
                </td>
                <td>
                  <div class="info-stack">
                    <span class="staff-jbtn">{{ item.jbtn }}</span>
                    <span class="staff-edu">{{ item.pendidikan }}</span>
                  </div>
                </td>
                <td>
                  <span class="staff-unit">{{ item.unit }}</span>
                </td>
                <td class="text-center">
                  <span :class="['badge-tag', item.is_clinical ? 'clinical' : 'non-clinical']">
                    {{ item.is_clinical ? 'Staf Klinis' : 'Non-Klinis' }}
                  </span>
                </td>
                
                <!-- Clinical Docs Columns (Conditional) -->
                <template v-if="hasClinicalStaff">
                  <template v-if="item.is_clinical">
                    <td class="text-center">
                      <span :class="['doc-label', item.documents.str.exists ? 'active' : 'inactive']">
                        {{ item.documents.str.exists ? item.documents.str.nomor : '-' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span :class="['doc-label', item.documents.sip.exists ? 'active' : 'inactive']">
                        {{ item.documents.sip.exists ? item.documents.sip.nomor : '-' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div 
                        v-if="item.documents.spk_rkk.exists"
                        class="status-container clickable" 
                        @click="openDocument(item.documents.spk_rkk.file, 'sk')"
                      >
                        <div class="doc-viewer-btn">
                          <i class="fas fa-file-contract"></i>
                          <span>View SPK/RKK</span>
                        </div>
                      </div>
                      <span v-else class="dash-text">-</span>
                    </td>
                    <!-- Ijazah (Clinical only) - Keep View functionality -->
                    <td class="text-center">
                      <div 
                        v-if="item.documents.ijazah.exists"
                        class="status-container clickable" 
                        @click="openDocument(item.documents.ijazah.file)"
                      >
                        <div class="doc-viewer-btn">
                          <i class="fas fa-file-pdf"></i>
                          <span>View Verif</span>
                        </div>
                      </div>
                      <div v-else class="status-container">
                        <div class="status-icon danger-vibrant">
                          <i class="fas fa-times-circle"></i>
                        </div>
                        <span class="doc-number danger">Belum Upload</span>
                      </div>
                    </td>
                  </template>
                  <td v-else colspan="4" class="text-center">
                    <span class="non-clinical-info">Tanpa Dokumen Klinis</span>
                  </td>
                </template>

                <!-- Berkas Pegawai Column -->
                <td class="text-center">
                  <button class="btn-view-berkas" @click="openDetailPegawai(item)" title="Lihat Detail & Berkas Pegawai">
                    <i class="fas fa-folder-open"></i>
                    <span>Berkas</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pegawai Detail & Berkas Modal -->
    <PegawaiDetailModal
      :show="showDetailModal"
      :pegawai="selectedPegawai"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { karyawanUnitService } from '@/services/sdi/karyawanUnitService';
import { pegawaiService } from '@/services/pegawaiService';
import PegawaiDetailModal from './components/PegawaiDetailModal.vue';

const authStore = useAuthStore();
const karyawan = ref([]);
const isLoading = ref(false);

const showDetailModal = ref(false);
const selectedPegawai = ref(null);
const isLoadingDetail = ref(false);

const departemen = computed(() => authStore.userDepartment);

// Smart check: any clinical staff in the current list?
const hasClinicalStaff = computed(() => {
  return karyawan.value.some(k => k.is_clinical);
});

// Calculate colspan for loading/empty states
const dynamicColspan = computed(() => {
  return hasClinicalStaff.value ? 11 : 7;
});

// Stats for Dashboard
const statsByPendidikan = computed(() => {
  const counts = {};
  karyawan.value.forEach(k => {
    const edu = k.pendidikan || 'N/A';
    counts[edu] = (counts[edu] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4); // Show top 4
});

const statsByJK = computed(() => {
  let pria = 0;
  let wanita = 0;
  karyawan.value.forEach(k => {
    if (k.jk === 'Pria') pria++;
    else wanita++;
  });
  return { pria, wanita, total: karyawan.value.length };
});

const fetchData = async () => {
  if (!departemen.value) return;
  
  isLoading.value = true;
  try {
    const res = await karyawanUnitService.getKaryawanByUnit(departemen.value);
    if (res.data && res.data.success) {
      karyawan.value = (res.data.data || []).sort((a, b) => a.nama.localeCompare(b.nama));
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    isLoading.value = false;
  }
};

const openDetailPegawai = async (item) => {
  isLoadingDetail.value = true;
  try {
    const res = await pegawaiService.getPegawaiById(item.nik);
    if (res.data && res.data.success) {
      selectedPegawai.value = res.data.data;
    } else {
      selectedPegawai.value = item;
    }
  } catch (err) {
    console.error('Error fetching pegawai detail:', err);
    selectedPegawai.value = item;
  } finally {
    isLoadingDetail.value = false;
    showDetailModal.value = true;
  }
};

const getPhotoUrl = (photoName) => {
  return `https://sim.rsiaaisyiyah.com/rsiap/file/pegawai/${photoName}`;
};

const openDocument = (fileName, type = 'ijazah') => {
  if (!fileName) return;
  
  let baseUrl = 'https://sim.rsiaaisyiyah.com/rsiap/file/pegawai/';
  if (type === 'ijazah') {
    baseUrl = 'https://sim.rsiaaisyiyah.com/webapps/rsia_kualifikasi/';
  } else if (type === 'sk') {
    baseUrl = 'https://sim.rsiaaisyiyah.com/webapps/rsia_sk/';
  }
  
  window.open(`${baseUrl}${fileName}`, '_blank');
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.karyawan-unit-page {
  padding: 0.5rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 70px);
}

.bento-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.bento-item {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

/* Header Section */
.header-item {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
}

/* Stats Dashboard */
.stats-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.25rem;
}

.stat-card.flex-grow {
  flex: 2;
  min-width: 300px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-header i {
  color: #3b82f6;
}

.gender-split {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.doc-viewer-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #166534;
}

.doc-viewer-btn i {
  font-size: 1.5rem;
  color: #22c55e;
}

.doc-viewer-btn span {
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}

.doc-viewer-btn:hover {
  background: #dcfce7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.gender-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gender-item .count {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

.gender-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.gender-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.edu-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.edu-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edu-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

.edu-count {
  font-size: 0.75rem;
  font-weight: 800;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.total-big {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  text-align: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Table Section */
.table-item {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.premium-table th {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
}

.premium-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.premium-table tr:hover td {
  background-color: #fcfdfe;
}

/* Staff Info */
.avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  image-rendering: -webkit-optimize-contrast;
}

.avatar-placeholder {
  font-size: 1.25rem;
  color: #cbd5e1;
}

.name-box {
  display: flex;
  flex-direction: column;
}

.staff-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.2;
}

.staff-nik {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.2rem;
}

.info-stack {
  display: flex;
  flex-direction: column;
}

.staff-jbtn {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.staff-edu {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-top: 0.15rem;
}

.staff-unit {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

/* Badge Tags */
.badge-tag {
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.badge-tag.clinical {
  background: #dcfce7;
  color: #166534;
}

.badge-tag.non-clinical {
  background: #f1f5f9;
  color: #475569;
}

/* Status Icons */
.status-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.status-icon.success {
  color: #22c55e;
}

.status-icon.danger {
  color: #ef4444;
  opacity: 0.3;
}

.status-icon.danger-vibrant {
  color: #ef4444;
  opacity: 0.8;
}

.doc-number.danger {
  color: #ef4444;
}

.doc-label {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.doc-label.active {
  color: #1e293b;
}

.doc-label.inactive {
  color: #cbd5e1;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.status-container.clickable {
  cursor: pointer;
}

.status-container.clickable:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.doc-number {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.non-clinical-info {
  color: #94a3b8;
  font-size: 0.75rem;
  font-style: italic;
  font-weight: 500;
}

.dash-text {
  color: #cbd5e1;
  font-weight: 700;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-in {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.doc-viewer-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 80px;
}

.doc-viewer-btn i {
  font-size: 1.5rem;
  color: #22c55e;
}

.doc-viewer-btn span {
  font-size: 0.65rem;
  font-weight: 700;
  color: #166534;
  white-space: nowrap;
}

.doc-viewer-btn:hover {
  background: #dcfce7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-view-berkas {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-view-berkas:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px -1px rgba(59, 130, 246, 0.3);
}

.clickable {
  cursor: pointer;
}

.name-box.clickable:hover .staff-name {
  color: #2563eb;
  text-decoration: underline;
}

.avatar-box.clickable:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
  transition: all 0.2s ease;
}
</style>
