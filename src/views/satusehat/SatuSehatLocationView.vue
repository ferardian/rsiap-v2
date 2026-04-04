<template>
  <div class="satusehat-location-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Mapping Lokasi SatuSehat</h2>
        <p class="page-subtitle text-secondary mb-0">Kelola pemetaan unit dan ruangan rumah sakit ke SatuSehat Location ID</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary shadow-sm" @click="refreshAll" :disabled="loading">
          <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i> Refresh Data
        </button>
      </div>
    </div>

    <!-- Main Tabs -->
    <div class="card border-0 shadow-sm overflow-hidden rounded-4">
      <div class="card-header p-3 bg-white border-bottom-0">
        <div class="custom-tabs-container">
          <ul class="nav nav-pills custom-nav-pills nav-fill" id="locationTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link p-3 active custom-tab-btn w-100" 
                id="ralan-tab" data-bs-toggle="tab" data-bs-target="#ralan" 
                type="button" role="tab" aria-controls="ralan" aria-selected="true"
                @click="currentTab = 'ralan'"
              >
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <i class="fas fa-clinic-medical fs-5 tab-icon"></i> 
                  <span class="tab-text fw-bold tracking-wider">Poliklinik</span>
                </div>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link p-3 custom-tab-btn w-100" 
                id="ranap-tab" data-bs-toggle="tab" data-bs-target="#ranap" 
                type="button" role="tab" aria-controls="ranap" aria-selected="false"
                @click="currentTab = 'ranap'"
              >
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <i class="fas fa-bed fs-5 tab-icon"></i> 
                  <span class="tab-text fw-bold tracking-wider">Kamar (Ranap)</span>
                </div>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link p-3 custom-tab-btn w-100" 
                id="generic-tab" data-bs-toggle="tab" data-bs-target="#generic" 
                type="button" role="tab" aria-controls="generic" aria-selected="false"
                @click="currentTab = 'generic'"
              >
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <i class="fas fa-door-open fs-5 tab-icon"></i> 
                  <span class="tab-text fw-bold tracking-wider">Ruang Tambahan</span>
                </div>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link p-3 custom-tab-btn w-100" 
                id="farmasi-tab" data-bs-toggle="tab" data-bs-target="#farmasi" 
                type="button" role="tab" aria-controls="farmasi" aria-selected="false"
                @click="currentTab = 'farmasi'"
              >
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <i class="fas fa-pills fs-5 tab-icon"></i> 
                  <span class="tab-text fw-bold tracking-wider">Farmasi / Depo</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="tab-content" id="locationTabsContent">
          <!-- POLIKLINIK (RALAN) -->
          <div class="tab-pane fade show active" id="ralan" role="tabpanel" aria-labelledby="ralan-tab">
            <div class="p-4 border-bottom bg-light">
              <div class="input-group search-box shadow-sm">
                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" v-model="searchQuery" placeholder="Cari poliklinik atau ID lokasi...">
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light text-uppercase text-xs fw-bold text-muted">
                  <tr>
                    <th class="px-4 py-3">Poliklinik</th>
                    <th class="py-3">SatuSehat Org ID</th>
                    <th class="py-3">SatuSehat Location ID</th>
                    <th class="py-3">Koordinat</th>
                    <th class="px-4 py-3 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingRalan && ralanData.length === 0">
                    <td colspan="5" class="py-5 text-center">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <span>Memuat data...</span>
                    </td>
                  </tr>
                  <tr v-else-if="filteredRalan.length === 0">
                    <td colspan="5" class="py-5 text-center text-muted">Tidak ada data ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredRalan" :key="item.kd_poli">
                    <td class="px-4">
                      <div class="fw-bold">{{ item.nm_poli }}</div>
                      <div class="text-xs text-secondary">Kode: {{ item.kd_poli }}</div>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_organisasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_lokasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <div v-if="item.longitude" class="text-xs">
                        <span class="text-muted">Long:</span> {{ item.longitude }}<br>
                        <span class="text-muted">Lat:</span> {{ item.latitude }}
                      </div>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="px-4 text-end">
                      <button @click="openModal('ralan', item)" class="btn btn-sm btn-icon btn-soft-primary me-2" title="Edit Mapping">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button v-if="item.id_lokasi_satusehat" @click="deleteMapping('ralan', item.kd_poli)" class="btn btn-sm btn-icon btn-soft-danger" title="Hapus Mapping">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- KAMAR (RANAP) -->
          <div class="tab-pane fade" id="ranap" role="tabpanel" aria-labelledby="ranap-tab">
            <div class="p-4 border-bottom bg-light">
              <div class="input-group search-box shadow-sm">
                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" v-model="searchQuery" placeholder="Cari kamar atau ID lokasi...">
              </div>
            </div>
            <div class="table-responsive" style="max-height: 600px;">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light text-uppercase text-xs fw-bold text-muted sticky-top">
                  <tr>
                    <th class="px-4 py-3">Nama Kamar / Bangsal</th>
                    <th class="py-3">SatuSehat Org ID</th>
                    <th class="py-3">SatuSehat Location ID</th>
                    <th class="py-3">Koordinat</th>
                    <th class="px-4 py-3 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingRanap && ranapData.length === 0">
                    <td colspan="5" class="py-5 text-center">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <span>Memuat data...</span>
                    </td>
                  </tr>
                  <tr v-else-if="filteredRanap.length === 0">
                    <td colspan="5" class="py-5 text-center text-muted">Tidak ada data ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredRanap" :key="item.kd_kamar">
                    <td class="px-4">
                      <div class="fw-bold">{{ item.nm_bangsal }}</div>
                      <div class="text-xs text-secondary">No. Kamar: {{ item.kd_kamar }}</div>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_organisasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_lokasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <div v-if="item.longitude" class="text-xs">
                        <span class="text-muted">Long:</span> {{ item.longitude }}<br>
                        <span class="text-muted">Lat:</span> {{ item.latitude }}
                      </div>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="px-4 text-end">
                      <button @click="openModal('ranap', item)" class="btn btn-sm btn-icon btn-soft-primary me-2" title="Edit Mapping">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button v-if="item.id_lokasi_satusehat" @click="deleteMapping('ranap', item.kd_kamar)" class="btn btn-sm btn-icon btn-soft-danger" title="Hapus Mapping">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- RUANG TAMBAHAN (GENERIC) -->
          <div class="tab-pane fade" id="generic" role="tabpanel" aria-labelledby="generic-tab">
            <div class="p-4">
              <div class="row g-4">
                <div v-for="(v, k) in genericLabels" :key="k" class="col-md-6">
                  <div class="card border shadow-none rounded-3">
                    <div class="card-body p-4">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0 fw-bold">{{ v }}</h5>
                        <div class="d-flex gap-2">
                          <button @click="openModal(k, genericData[k])" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit me-1"></i> Edit
                          </button>
                          <button v-if="genericData[k]?.id_lokasi_satusehat" @click="deleteMapping(k)" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div class="row g-3">
                        <div class="col-sm-6">
                          <label class="text-xs text-muted text-uppercase fw-bold mb-1 d-block">SatuSehat Org ID</label>
                          <code class="text-dark bg-light px-2 py-1 rounded d-block text-truncate">{{ genericData[k]?.id_organisasi_satusehat || '-' }}</code>
                        </div>
                        <div class="col-sm-6">
                          <label class="text-xs text-muted text-uppercase fw-bold mb-1 d-block">SatuSehat Location ID</label>
                          <code class="text-dark bg-light px-2 py-1 rounded d-block text-truncate">{{ genericData[k]?.id_lokasi_satusehat || '-' }}</code>
                        </div>
                        <div class="col-12 mt-3">
                          <label class="text-xs text-muted text-uppercase fw-bold mb-1 d-block">Koordinat</label>
                          <div class="bg-light p-2 rounded text-xs">
                             <div v-if="genericData[k]?.longitude"><span class="text-muted">Lon:</span> {{ genericData[k].longitude }} | <span class="text-muted">Lat:</span> {{ genericData[k].latitude }}</div>
                             <div v-else class="text-muted italic">Belum diset</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FARMASI -->
          <div class="tab-pane fade" id="farmasi" role="tabpanel" aria-labelledby="farmasi-tab">
             <div class="p-4 border-bottom bg-light">
              <div class="input-group search-box shadow-sm">
                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" v-model="searchQuery" placeholder="Cari depo/farmasi...">
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light text-uppercase text-xs fw-bold text-muted">
                  <tr>
                    <th class="px-4 py-3">Nama Depo / Farmasi</th>
                    <th class="py-3">SatuSehat Org ID</th>
                    <th class="py-3">SatuSehat Location ID</th>
                    <th class="py-3">Koordinat</th>
                    <th class="px-4 py-3 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingFarmasi && farmasiData.length === 0">
                    <td colspan="5" class="py-5 text-center">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <span>Memuat data...</span>
                    </td>
                  </tr>
                  <tr v-else-if="filteredFarmasi.length === 0">
                    <td colspan="5" class="py-5 text-center text-muted">Tidak ada data ditemukan</td>
                  </tr>
                  <tr v-for="item in filteredFarmasi" :key="item.kd_bangsal">
                    <td class="px-4">
                      <div class="fw-bold">{{ item.nm_bangsal }}</div>
                      <div class="text-xs text-secondary">Kode: {{ item.kd_bangsal }}</div>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_organisasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <code class="text-xs">{{ item.id_lokasi_satusehat || '-' }}</code>
                    </td>
                    <td>
                      <div v-if="item.longitude" class="text-xs">
                        <span class="text-muted">Long:</span> {{ item.longitude }}<br>
                        <span class="text-muted">Lat:</span> {{ item.latitude }}
                      </div>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="px-4 text-end">
                      <button @click="openModal('farmasi', item)" class="btn btn-sm btn-icon btn-soft-primary me-2" title="Edit Mapping">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button v-if="item.id_lokasi_satusehat" @click="deleteMapping('farmasi', item.kd_bangsal)" class="btn btn-sm btn-icon btn-soft-danger" title="Hapus Mapping">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mapping Modal -->
    <div class="modal fade" id="mappingModal" tabindex="-1" aria-hidden="true" ref="mappingModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pt-4 px-4">
            <h5 class="modal-title fw-bold">Mapping Lokasi - {{ formTitle }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveMapping">
              <div class="mb-3">
                <label class="form-label text-xs fw-bold text-uppercase text-muted">Hospital Unit / Room</label>
                <div class="p-3 bg-light rounded fw-bold text-dark border">
                  {{ formData.label || '-' }}
                </div>
              </div>

              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-xs fw-bold text-uppercase text-muted">SatuSehat Org ID <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formData.id_organisasi" required>
                    <option value="" disabled>Pilih Departemen (Organisasi)</option>
                    <option v-for="dept in departments" :key="dept.dep_id" :value="dept.id_organisasi_satusehat">
                      {{ dept.nama }}
                    </option>
                  </select>
                  <div v-if="formData.id_organisasi" class="mt-1">
                    <code class="text-xs text-muted">{{ formData.id_organisasi }}</code>
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label text-xs fw-bold text-uppercase text-muted">SatuSehat Location ID</label>
                  <input type="text" class="form-control" v-model="formData.id_lokasi" placeholder="Location ID dari SatuSehat (Opsional)">
                </div>
                <div class="col-md-4">
                  <label class="form-label text-xs fw-bold text-uppercase text-muted">Longitude</label>
                  <input type="text" class="form-control" v-model="formData.longitude" placeholder="0.000000">
                </div>
                <div class="col-md-4">
                  <label class="form-label text-xs fw-bold text-uppercase text-muted">Latitude</label>
                  <input type="text" class="form-control" v-model="formData.latitude" placeholder="0.000000">
                </div>
                <div class="col-md-4">
                  <label class="form-label text-xs fw-bold text-uppercase text-muted">Altitude</label>
                  <input type="text" class="form-control" v-model="formData.altitude" placeholder="0.0">
                </div>
              </div>

              <div class="mt-4 pt-3 d-grid">
                <button type="submit" class="btn btn-primary btn-lg shadow-sm" :disabled="loadingSave">
                  <span v-if="loadingSave" class="spinner-border spinner-border-sm me-2"></span>
                  Simpan Pemetaan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

export default {
  name: 'SatuSehatLocationView',
  data() {
    return {
      currentTab: 'ralan',
      loading: false,
      loadingRalan: false,
      loadingRanap: false,
      loadingFarmasi: false,
      loadingSave: false,
      searchQuery: '',
      
      ralanData: [],
      ranapData: [],
      farmasiData: [],
      genericData: {
        ruangok: null,
        labpk: null,
        labpa: null,
        labmb: null,
        rad: null
      },
      departments: [],
      
      genericLabels: {
        ruangok: 'Ruang Operasi (OK)',
        labpk: 'Laborat Patologi Klinik',
        labpa: 'Laborat Patologi Anatomi',
        labmb: 'Laborat Mikrobiologi',
        rad: 'Radiologi'
      },

      formData: {
        type: '',
        label: '',
        id_organisasi: '',
        id_lokasi: '',
        longitude: '',
        latitude: '',
        altitude: '',
        kd_poli: '',
        kd_kamar: '',
        kd_bangsal: ''
      },
      modalInstance: null
    }
  },
  computed: {
    formTitle() {
      if (!this.formData.type) return ''
      if (this.genericLabels[this.formData.type]) return this.genericLabels[this.formData.type]
      const titles = { ralan: 'Poliklinik', ranap: 'Kamar Rawat Inap', farmasi: 'Farmasi / Depo' }
      return titles[this.formData.type] || ''
    },
    filteredRalan() {
      if (!this.searchQuery) return this.ralanData
      const query = this.searchQuery.toLowerCase()
      return this.ralanData.filter(i => 
        i.nm_poli.toLowerCase().includes(query) || 
        i.kd_poli.toLowerCase().includes(query) ||
        (i.id_lokasi_satusehat && i.id_lokasi_satusehat.toLowerCase().includes(query))
      )
    },
    filteredRanap() {
      if (!this.searchQuery) return this.ranapData
      const query = this.searchQuery.toLowerCase()
      return this.ranapData.filter(i => 
        i.nm_bangsal.toLowerCase().includes(query) || 
        i.kd_kamar.toLowerCase().includes(query) ||
        (i.id_lokasi_satusehat && i.id_lokasi_satusehat.toLowerCase().includes(query))
      )
    },
    filteredFarmasi() {
      if (!this.searchQuery) return this.farmasiData
      const query = this.searchQuery.toLowerCase()
      return this.farmasiData.filter(i => 
        i.nm_bangsal.toLowerCase().includes(query) || 
        i.kd_bangsal.toLowerCase().includes(query) ||
        (i.id_lokasi_satusehat && i.id_lokasi_satusehat.toLowerCase().includes(query))
      )
    }
  },
  mounted() {
    this.refreshAll()
    this.modalInstance = new Modal(this.$refs.mappingModal)
  },
  methods: {
    async refreshAll() {
      this.fetchRalan()
      this.fetchRanap()
      this.fetchGeneric()
      this.fetchFarmasi()
      this.fetchDepartments()
    },
    async fetchDepartments() {
      try {
        const res = await satuSehatService.getDepartmentsMapped()
        if (res.data.success) this.departments = res.data.data
      } catch (err) {
        console.error('Gagal mengambil data departemen:', err)
      }
    },
    async fetchRalan() {
      this.loadingRalan = true
      try {
        const res = await satuSehatService.getLocationRalan()
        if (res.data.success) this.ralanData = res.data.data
      } catch (err) {
        console.error(err)
      } finally {
        this.loadingRalan = false
      }
    },
    async fetchRanap() {
      this.loadingRanap = true
      try {
        const res = await satuSehatService.getLocationRanap()
        if (res.data.success) this.ranapData = res.data.data
      } catch (err) {
        console.error(err)
      } finally {
        this.loadingRanap = false
      }
    },
    async fetchGeneric() {
      try {
        const res = await satuSehatService.getLocationGeneric()
        if (res.data.success) this.genericData = res.data.data
      } catch (err) {
        console.error(err)
      }
    },
    async fetchFarmasi() {
      this.loadingFarmasi = true
      try {
        const res = await satuSehatService.getLocationFarmasi()
        if (res.data.success) this.farmasiData = res.data.data
      } catch (err) {
        console.error(err)
      } finally {
        this.loadingFarmasi = false
      }
    },
    openModal(type, item) {
      this.formData = {
        type: type,
        label: item?.nm_poli || item?.nm_bangsal || this.genericLabels[type] || '-',
        id_organisasi: item?.id_organisasi_satusehat || '',
        id_lokasi: item?.id_lokasi_satusehat || '',
        longitude: item?.longitude || '',
        latitude: item?.latitude || '',
        altitude: item?.altitude || '',
        kd_poli: item?.kd_poli || '',
        kd_kamar: item?.kd_kamar || '',
        kd_bangsal: item?.kd_bangsal || ''
      }
      this.modalInstance.show()
    },
    async saveMapping() {
      this.loadingSave = true
      try {
        const res = await satuSehatService.saveLocationMapping(this.formData)
        if (res.data.success) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: res.data.message, timer: 1500, showConfirmButton: false })
          this.modalInstance.hide()
          this.refreshAll()
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan sistem' })
      } finally {
        this.loadingSave = false
      }
    },
    async deleteMapping(type, id) {
      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Mapping lokasi akan dihapus secara permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        try {
          const res = await satuSehatService.deleteLocationMapping({ type, id })
          if (res.data.success) {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: res.data.message, timer: 1500, showConfirmButton: false })
            this.refreshAll()
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal menghapus mapping' })
        }
      }
    }
  }
}
</script>

<script setup>
// If you're using script setup style for icons or other things
</script>

<style scoped>
.satusehat-location-view {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Tabs Implementation */
.custom-tabs-container {
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 1rem;
}

.custom-nav-pills {
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.custom-tab-btn {
  border-radius: 0.75rem !important;
  color: #64748b;
  border: border;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: transparent;
}

.custom-tab-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(13, 110, 253, 0.05);
  border-radius: 0.75rem;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.3s ease;
  z-index: 0;
}

.custom-tab-btn:hover:not(.active) {
  color: #0d6efd;
}

.custom-tab-btn:hover:not(.active)::before {
  opacity: 1;
  transform: scale(1);
}

.custom-tab-btn.active {
  background: #ffffff !important;
  color: #0d6efd !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.custom-tab-btn > div {
  position: relative;
  z-index: 1;
}

.tab-icon {
  transition: transform 0.3s ease;
}

.custom-tab-btn.active .tab-icon {
  transform: scale(1.15) translateY(-1px);
  color: #0d6efd;
}

.tab-text {
  font-size: 0.85rem;
  text-transform: uppercase;
}

.bg-primary-soft { background-color: rgba(13, 110, 253, 0.08); }
.btn-soft-primary { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; border: none; }
.btn-soft-primary:hover { background-color: #0d6efd; color: white; }
.btn-soft-danger { background-color: rgba(220, 53, 69, 0.1); color: #dc3545; border: none; }
.btn-soft-danger:hover { background-color: #dc3545; color: white; }

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 8px;
}

.text-xs { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.05em; }

.search-box {
  max-width: 400px;
}

.search-box .form-control:focus {
  box-shadow: none;
  border-color: #dee2e6;
}

.search-box .input-group-text {
  border-color: #dee2e6;
}

code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
}
</style>
