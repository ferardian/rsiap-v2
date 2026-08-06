<template>
  <div class="rs-online-wrapper">
    <div class="rs-online-container">
      <!-- Hero Header -->
      <div class="compact-hero-header mb-3">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-bed"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-soft-emerald text-emerald font-mono text-xs px-2 py-0.5 rounded-full border border-emerald-300">
                <i class="fas fa-plug text-xs me-1"></i> SIRS Kemenkes (RS Online Versi 3)
              </span>
              <span class="badge bg-white/20 text-white font-mono text-xs px-2 py-0.5 rounded-full border border-white/30">
                Faskes ID: 3326051
              </span>
            </div>
            <h1 class="hero-title">Bridging Ketersediaan Tempat Tidur RS Online</h1>
            <p class="hero-subtitle">Entry Data Ruangan dan Tempat Tidur Terintegrasi SIMRS — SIRS Kemenkes RI</p>
          </div>
        </div>

        <div class="hero-actions d-flex align-items-center gap-2">
          <button class="btn btn-emerald-glass btn-sm" @click="syncStructure" :disabled="loadingSync">
            <i class="fas fa-download me-1.5" :class="{ 'fa-spin': loadingSync }"></i> Tarik Struktur RS Online
          </button>
          <button class="btn btn-emerald-solid btn-sm" @click="sendBulkUpdate" :disabled="loadingUpdate">
            <i class="fas fa-paper-plane me-1.5" :class="{ 'fa-spin': loadingUpdate }"></i> Kirim Update Ke RS Online
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="nav-tabs-wrapper mb-3">
        <ul class="nav nav-tabs-modern">
          <li class="nav-item">
            <button 
              class="nav-link-modern" 
              :class="{ active: activeTab === 'mapping' }"
              @click="activeTab = 'mapping'"
            >
              <i class="fas fa-tasks me-2"></i> Mapping & Update Live RS Online
              <span class="badge bg-emerald-100 text-emerald-700 ms-2 font-mono text-xs px-2 py-0.5 rounded-full">
                {{ mappingList.length }} Entri
              </span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link-modern" 
              :class="{ active: activeTab === 'referensi' }"
              @click="activeTab = 'referensi'"
            >
              <i class="fas fa-book me-2"></i> Master Referensi TT Kemenkes
              <span class="badge bg-slate-100 text-slate-700 ms-2 font-mono text-xs px-2 py-0.5 rounded-full">
                {{ refList.length }} Jenis
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- TAB 1: MAPPING & UPDATE LIVE RS ONLINE -->
      <div v-if="activeTab === 'mapping'">
        <!-- 3 Stats Cards -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-4">
            <div class="stat-card">
              <div class="stat-icon bg-emerald-50 text-emerald-600">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Ter-Mapping & Aktif</span>
                <h3 class="stat-value text-slate-800">{{ activeMappedCount }} <span class="text-xs font-normal text-slate-500">Ruangan</span></h3>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="stat-card">
              <div class="stat-icon bg-blue-50 text-blue-600">
                <i class="fas fa-bed"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total TT Terpakai (SIMRS)</span>
                <h3 class="stat-value text-slate-800">{{ totalSimrsTerpakai }} <span class="text-xs font-normal text-slate-500">Dari {{ totalSimrsKapasitas }} TT</span></h3>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="stat-card">
              <div class="stat-icon bg-purple-50 text-purple-600">
                <i class="fas fa-server"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Metode Update Bridging</span>
                <h3 class="stat-value text-emerald-600 d-flex align-items-center gap-1.5 text-sm fw-bold">
                  <span class="status-indicator animate-pulse"></span> Explicit PUT via id_t_tt
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="content-area">
          <!-- Toolbar -->
          <div class="action-bar-compact d-flex justify-content-between align-items-center">
            <div class="search-box-compact">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="mappingSearch" 
                type="text" 
                placeholder="Cari ruangan RS Online, ID TT, atau Bangsal SIMRS..."
              >
              <button v-if="mappingSearch" @click="mappingSearch = ''" class="btn-clear-compact text-slate-400 hover:text-slate-600">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" @click="fetchMappings" :disabled="loadingMapping">
                <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loadingMapping }"></i> Refresh Table
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingMapping" class="loading-state-unified py-8">
            <div class="spinner-container">
              <i class="fas fa-circle-notch fa-spin text-emerald-600 text-2xl"></i>
            </div>
            <p class="mt-2 text-slate-600 fw-semibold text-sm">Memuat Data Mapping Tempat Tidur RS Online...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredMappingList.length === 0" class="empty-state-unified py-8">
            <div class="empty-icon-container mb-2">
              <i class="fas fa-inbox text-slate-300 text-4xl"></i>
            </div>
            <h4 class="fw-bold text-slate-700 fs-6 mb-1">Data Mapping Kosong</h4>
            <p class="text-slate-500 text-xs mb-3">Klik tombol "Tarik Struktur RS Online" untuk menyinkronkan data entri dari RS Online.</p>
            <button class="btn btn-sm btn-emerald-glass text-slate-800 border-slate-300" @click="syncStructure">
              <i class="fas fa-download me-1"></i> Tarik Struktur RS Online
            </button>
          </div>

          <!-- Table Mapping -->
          <div v-else class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th width="50" class="text-center">No</th>
                  <th width="110">ID_T_TT</th>
                  <th width="80" class="text-center">Kode TT</th>
                  <th>Ruangan RS Online</th>
                  <th>Mapping Bangsal & Kelas SIMRS</th>
                  <th width="90" class="text-center">Kapasitas</th>
                  <th width="90" class="text-center">Terpakai</th>
                  <th width="90" class="text-center">Tersedia</th>
                  <th width="80" class="text-center">Bridging</th>
                  <th width="130" class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredMappingList" :key="item.id">
                  <td class="text-center text-slate-400 font-mono fw-semibold text-xs">{{ index + 1 }}</td>
                  <td>
                    <span class="code-badge font-mono text-slate-700 bg-slate-100 border-slate-200">{{ item.id_t_tt || '-' }}</span>
                  </td>
                  <td class="text-center">
                    <span class="code-badge font-mono bg-emerald-50 text-emerald-700 border-emerald-200">{{ item.id_tt }}</span>
                  </td>
                  <td>
                    <div class="fw-bold text-slate-800 text-sm mb-0">{{ item.ruang }}</div>
                    <div class="text-xs text-slate-400" v-if="item.tgl_update_sirs">
                      SIRS Update: {{ item.tgl_update_sirs }}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <div v-if="item.kd_bangsal" class="d-flex flex-column">
                        <span class="fw-semibold text-slate-700 text-xs me-1">
                          <i class="fas fa-door-open me-1 text-slate-400"></i>{{ item.nm_bangsal || item.kd_bangsal }}
                        </span>
                        <span class="text-xs text-slate-500 font-mono">({{ item.kd_bangsal }} &bull; {{ item.kelas }})</span>
                      </div>
                      <span v-else class="badge bg-amber-50 text-amber-600 border border-amber-200 text-xs px-2 py-0.5 rounded">
                        <i class="fas fa-exclamation-circle me-1"></i> Belum Di-map
                      </span>

                      <button 
                        class="btn btn-edit-mapping btn-xs"
                        title="Edit Mapping Bangsal SIMRS"
                        @click="openMappingModal(item)"
                      >
                        <i class="fas fa-pencil-alt text-slate-500"></i>
                      </button>
                    </div>
                  </td>
                  <td class="text-center fw-bold text-slate-700">
                    {{ item.simrs_kapasitas }} <span class="text-xs font-normal text-slate-400">TT</span>
                  </td>
                  <td class="text-center fw-bold text-blue-600">
                    {{ item.simrs_terpakai }} <span class="text-xs font-normal text-slate-400">TT</span>
                  </td>
                  <td class="text-center fw-bold text-emerald-600">
                    {{ item.simrs_tersedia }} <span class="text-xs font-normal text-slate-400">TT</span>
                  </td>
                  <td class="text-center">
                    <div class="form-check form-switch d-inline-block">
                      <input 
                        class="form-check-input cursor-pointer" 
                        type="checkbox" 
                        :checked="item.is_active"
                        @change="toggleActive(item)"
                      >
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex align-items-center justify-content-center gap-1">
                      <button 
                        class="btn btn-action-send btn-xs" 
                        title="Kirim Update PUT ke RS Online"
                        :disabled="!item.kd_bangsal || sendingId === item.id"
                        @click="sendSingleUpdate(item)"
                      >
                        <i class="fas fa-paper-plane me-1" :class="{ 'fa-spin': sendingId === item.id }"></i> Update
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: MASTER REFERENSI TT KEMENKES -->
      <div v-else-if="activeTab === 'referensi'">
        <div class="content-area">
          <div class="action-bar-compact d-flex justify-content-between align-items-center">
            <div class="search-box-compact">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="refSearch" 
                type="text" 
                placeholder="Cari tempat tidur berdasarkan nama atau kode..."
              >
              <button v-if="refSearch" @click="refSearch = ''" class="btn-clear-compact text-slate-400 hover:text-slate-600">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="endpoint-badge d-none d-md-flex align-items-center gap-1.5 text-xs text-slate-500 fw-medium">
              <i class="fas fa-link text-slate-400"></i> Endpoint:
              <code class="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono fw-semibold">/Referensi/tempat_tidur</code>
            </div>
          </div>

          <div v-if="loadingRef" class="loading-state-unified py-8">
            <div class="spinner-container">
              <i class="fas fa-circle-notch fa-spin text-emerald-600 text-2xl"></i>
            </div>
            <p class="mt-2 text-slate-600 fw-semibold text-sm">Memuat Master Referensi Tempat Tidur...</p>
          </div>

          <div v-else class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th width="60" class="text-center">No</th>
                  <th width="140">Kode TT SIRS</th>
                  <th>Nama Referensi Tempat Tidur</th>
                  <th width="120" class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredRefList" :key="item.kode_tt">
                  <td class="text-center text-slate-400 font-mono fw-semibold text-xs">{{ index + 1 }}</td>
                  <td>
                    <span class="code-badge font-mono">{{ item.kode_tt }}</span>
                  </td>
                  <td>
                    <div class="fw-bold text-slate-800 text-sm mb-0">{{ item.nama_tt }}</div>
                    <div class="text-xs text-slate-400">Master Referensi SIRS Kemenkes RI</div>
                  </td>
                  <td class="text-center">
                    <button 
                      class="btn btn-action-copy btn-xs" 
                      title="Salin Kode TT"
                      @click="copyToClipboard(item.kode_tt, item.nama_tt)"
                    >
                      <i class="fas fa-copy me-1"></i> Salin Kode
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT MAPPING BANGSAL SIMRS -->
    <div v-if="showMappingModal" class="modal-overlay-custom" @click.self="closeMappingModal">
      <div class="modal-card-custom">
        <div class="modal-header-custom">
          <div>
            <h3 class="modal-title-custom">
              <i class="fas fa-link me-2 text-emerald-600"></i> Mapping Ruangan SIMRS
            </h3>
            <p class="modal-subtitle-custom">Hubungkan ruangan RS Online dengan Bangsal & Kelas SIMRS Khanza</p>
          </div>
          <button class="btn-close-modal" @click="closeMappingModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-custom" v-if="selectedItem">
          <!-- Info Box RS Online -->
          <div class="info-box-sirs mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-xs fw-bold text-slate-500 uppercase font-mono">Entri RS Online</span>
              <span class="badge bg-emerald-100 text-emerald-800 text-xs font-mono">Kode TT: {{ selectedItem.id_tt }}</span>
            </div>
            <div class="fw-bold text-slate-800 fs-6">{{ selectedItem.ruang }}</div>
            <div class="text-xs text-slate-500 font-mono mt-0.5">ID_T_TT: {{ selectedItem.id_t_tt || '-' }}</div>
          </div>

          <!-- Form Select Bangsal SIMRS -->
          <div class="mb-3">
            <label class="form-label-custom">Pilih Bangsal SIMRS <span class="text-rose-500">*</span></label>
            <select v-model="formMapping.kd_bangsal" class="form-select-custom">
              <option value="">-- Pilih Bangsal SIMRS --</option>
              <option v-for="b in bangsalOptions" :key="b.kd_bangsal" :value="b.kd_bangsal">
                {{ b.nm_bangsal }} ({{ b.kd_bangsal }})
              </option>
            </select>
          </div>

          <!-- Form Select Kelas SIMRS -->
          <div class="mb-3">
            <label class="form-label-custom">Pilih Kelas Kamar SIMRS <span class="text-rose-500">*</span></label>
            <select v-model="formMapping.kelas" class="form-select-custom">
              <option value="">-- Pilih Kelas SIMRS --</option>
              <option v-for="k in kelasOptions" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
          </div>

          <!-- Switch Is Active -->
          <div class="form-check form-switch mt-3 pt-2 border-top">
            <input 
              class="form-check-input cursor-pointer" 
              type="checkbox" 
              id="modalActiveSwitch" 
              v-model="formMapping.is_active"
            >
            <label class="form-check-label cursor-pointer text-sm fw-semibold text-slate-700 ms-2" for="modalActiveSwitch">
              Aktifkan Update Otomatis (Bridging Enabled)
            </label>
          </div>
        </div>

        <div class="modal-footer-custom">
          <button class="btn btn-secondary btn-sm rounded-lg px-3" @click="closeMappingModal" :disabled="savingMapping">
            Batal
          </button>
          <button class="btn btn-emerald-solid-sm btn-sm rounded-lg px-3" @click="saveMapping" :disabled="savingMapping">
            <i class="fas fa-save me-1.5" :class="{ 'fa-spin': savingMapping }"></i> Simpan Mapping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import rsOnlineService from '@/services/rsOnlineService'
import Swal from 'sweetalert2'

const activeTab = ref('mapping')
const loadingRef = ref(false)
const loadingMapping = ref(false)
const loadingSync = ref(false)
const loadingUpdate = ref(false)
const savingMapping = ref(false)
const sendingId = ref(null)

const refList = ref([])
const mappingList = ref([])
const bangsalOptions = ref([])
const kelasOptions = ref(['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas Utama', 'Kelas VIP', 'Kelas VVIP'])

const refSearch = ref('')
const mappingSearch = ref('')

const showMappingModal = ref(false)
const selectedItem = ref(null)
const formMapping = ref({
  kd_bangsal: '',
  kelas: '',
  is_active: true
})

const filteredRefList = computed(() => {
  if (!refSearch.value.trim()) return refList.value
  const q = refSearch.value.toLowerCase().trim()
  return refList.value.filter(item => 
    String(item.kode_tt).toLowerCase().includes(q) ||
    String(item.nama_tt).toLowerCase().includes(q)
  )
})

const filteredMappingList = computed(() => {
  if (!mappingSearch.value.trim()) return mappingList.value
  const q = mappingSearch.value.toLowerCase().trim()
  return mappingList.value.filter(item => 
    String(item.ruang || '').toLowerCase().includes(q) ||
    String(item.id_t_tt || '').toLowerCase().includes(q) ||
    String(item.id_tt || '').toLowerCase().includes(q) ||
    String(item.kd_bangsal || '').toLowerCase().includes(q) ||
    String(item.nm_bangsal || '').toLowerCase().includes(q)
  )
})

const activeMappedCount = computed(() => {
  return mappingList.value.filter(i => i.is_active && i.kd_bangsal).length
})

const totalSimrsKapasitas = computed(() => {
  return mappingList.value.filter(i => i.is_active && i.kd_bangsal).reduce((sum, i) => sum + (i.simrs_kapasitas || 0), 0)
})

const totalSimrsTerpakai = computed(() => {
  return mappingList.value.filter(i => i.is_active && i.kd_bangsal).reduce((sum, i) => sum + (i.simrs_terpakai || 0), 0)
})

const fetchRefData = async () => {
  loadingRef.value = true
  try {
    const response = await rsOnlineService.getRefTempatTidur()
    const resData = response.data
    refList.value = resData.data || resData || []
  } catch (error) {
    console.error('Failed to fetch RS Online Ref Tempat Tidur:', error)
  } finally {
    loadingRef.value = false
  }
}

const fetchMappings = async () => {
  loadingMapping.value = true
  try {
    const response = await rsOnlineService.getBedMappings()
    mappingList.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch RS Online Bed Mappings:', error)
    Swal.fire('Error', 'Gagal mengambil data mapping kamar dari server.', 'error')
  } finally {
    loadingMapping.value = false
  }
}

const fetchBangsalOptions = async () => {
  try {
    const res = await rsOnlineService.getBangsalOptions()
    if (res.data?.data) {
      bangsalOptions.value = res.data.data.bangsal || []
      if (res.data.data.kelas && res.data.data.kelas.length > 0) {
        kelasOptions.value = res.data.data.kelas
      }
    }
  } catch (error) {
    console.error('Failed to fetch Bangsal Options:', error)
  }
}

const syncStructure = async () => {
  loadingSync.value = true
  try {
    const res = await rsOnlineService.syncStructure()
    Swal.fire('Sukses', res.data.message || 'Berhasil menyinkronkan struktur dari RS Online.', 'success')
    fetchMappings()
  } catch (error) {
    console.error('Failed to sync structure:', error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal menyinkronkan struktur dari RS Online.', 'error')
  } finally {
    loadingSync.value = false
  }
}

const openMappingModal = (item) => {
  selectedItem.value = item
  formMapping.value = {
    kd_bangsal: item.kd_bangsal || '',
    kelas: item.kelas || 'Kelas 1',
    is_active: item.is_active ?? true
  }
  showMappingModal.value = true
}

const closeMappingModal = () => {
  showMappingModal.value = false
  selectedItem.value = null
}

const saveMapping = async () => {
  if (!selectedItem.value) return
  savingMapping.value = true
  try {
    await rsOnlineService.updateMapping(selectedItem.value.id, formMapping.value)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Mapping bangsal berhasil disimpan!',
      showConfirmButton: false,
      timer: 2000
    })
    closeMappingModal()
    fetchMappings()
  } catch (error) {
    console.error('Failed to save mapping:', error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan mapping bangsal.', 'error')
  } finally {
    savingMapping.value = false
  }
}

const toggleActive = async (item) => {
  try {
    const newStatus = !item.is_active
    item.is_active = newStatus
    await rsOnlineService.updateMapping(item.id, { is_active: newStatus })
  } catch (error) {
    console.error('Failed to update mapping active status:', error)
    item.is_active = !item.is_active
    Swal.fire('Error', 'Gagal memperbarui status bridging.', 'error')
  }
}

const sendSingleUpdate = async (item) => {
  sendingId.value = item.id
  try {
    const res = await rsOnlineService.sendUpdate(item.id)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Kamar "${item.ruang}" berhasil diupdate di RS Online!`,
      showConfirmButton: false,
      timer: 2000
    })
    fetchMappings()
  } catch (error) {
    console.error('Failed to send single update:', error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal memperbarui kamar ke RS Online.', 'error')
  } finally {
    sendingId.value = null
  }
}

const sendBulkUpdate = async () => {
  const result = await Swal.fire({
    title: 'Kirim Update Ke RS Online?',
    text: `Update ketersediaan TT real-time akan dikirimkan untuk ${activeMappedCount.value} ruangan yang aktif.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Kirim Update',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  loadingUpdate.value = true
  try {
    const res = await rsOnlineService.sendUpdate(null, { force: true })
    Swal.fire('Berhasil', res.data.message || 'Ketersediaan tempat tidur berhasil dikirim ke RS Online.', 'success')
    fetchMappings()
  } catch (error) {
    console.error('Failed to send bulk update:', error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal mengirim update ke RS Online.', 'error')
  } finally {
    loadingUpdate.value = false
  }
}

const copyToClipboard = (code, name) => {
  navigator.clipboard.writeText(code).then(() => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Kode TT "${code}" (${name}) disalin!`,
      showConfirmButton: false,
      timer: 1800
    })
  }).catch(() => {
    Swal.fire('Salin Kode', `Kode TT: ${code}`, 'info')
  })
}

onMounted(() => {
  fetchRefData()
  fetchMappings()
  fetchBangsalOptions()
})
</script>

<style scoped>
.rs-online-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 1rem 1.25rem;
  color: #1e293b;
}

.rs-online-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Compact Hero Header */
.compact-hero-header {
  background: linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 1.15rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.25);
}

.compact-hero-header::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -5%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  margin: 0.15rem 0 0 0;
  opacity: 0.95;
  font-size: 0.8rem;
  line-height: 1.3;
}

.btn-emerald-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 700;
  padding: 0.45rem 1rem;
  font-size: 0.825rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-emerald-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  transform: translateY(-1px);
}

.btn-emerald-solid {
  background: #ffffff;
  color: #047857;
  border: none;
  font-weight: 800;
  padding: 0.45rem 1.15rem;
  font-size: 0.825rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.btn-emerald-solid-sm {
  background: #059669;
  color: #ffffff;
  border: none;
  font-weight: 700;
}

.btn-emerald-solid-sm:hover:not(:disabled) {
  background: #047857;
  color: #ffffff;
}

.btn-emerald-solid:hover:not(:disabled) {
  background: #ecfdf5;
  color: #065f46;
  transform: translateY(-1px);
}

/* Nav Tabs */
.nav-tabs-wrapper {
  border-bottom: 1px solid #e2e8f0;
}

.nav-tabs-modern {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link-modern {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.65rem 1.15rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-link-modern:hover {
  color: #059669;
}

.nav-link-modern.active {
  color: #059669;
  border-bottom-color: #059669;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 0.85rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
}

/* Content Area */
.content-area {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.action-bar-compact {
  padding: 0.85rem 1.15rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.search-box-compact {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.825rem;
}

.search-box-compact input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.45rem 2rem 0.45rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.825rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-box-compact input:focus {
  outline: none;
  background: white;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.btn-clear-compact {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Modern Table */
.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 0.75rem 1.15rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 0.75rem 1.15rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  vertical-align: middle;
}

.modern-table tr:hover {
  background-color: #f8fafc;
}

.code-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.775rem;
  display: inline-block;
  border: 1px solid transparent;
}

.btn-edit-mapping {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.15rem 0.45rem;
  transition: all 0.2s;
}

.btn-edit-mapping:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.btn-action-copy {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-action-copy:hover {
  background-color: #059669;
  color: white;
  border-color: #059669;
}

.btn-action-send {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  font-weight: 700;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-action-send:hover:not(:disabled) {
  background-color: #059669;
  color: white;
  border-color: #059669;
}

.btn-xs {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
}

.bg-soft-emerald {
  background-color: rgba(16, 185, 129, 0.15);
}

.text-emerald {
  color: #10b981;
}

.cursor-pointer {
  cursor: pointer;
}

/* Modal Custom Styles */
.modal-overlay-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card-custom {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header-custom {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8fafc;
}

.modal-title-custom {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

.modal-subtitle-custom {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.15rem 0 0 0;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.2s;
}

.btn-close-modal:hover {
  color: #334155;
}

.modal-body-custom {
  padding: 1.25rem 1.5rem;
}

.info-box-sirs {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 0.85rem 1rem;
}

.form-label-custom {
  font-size: 0.775rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
  display: block;
}

.form-select-custom {
  width: 100%;
  padding: 0.5rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.form-select-custom:focus {
  outline: none;
  background: white;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.modal-footer-custom {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
