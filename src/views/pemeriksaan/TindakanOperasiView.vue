<template>
  <div class="tindakan-operasi-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-medical-alt"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Data Tindakan Operasi</h3>
            <p class="page-subtitle mb-0 small">Laporan dan Pencatatan Tindakan Operasi Pasien</p>
          </div>
        </div>

        <div class="action-buttons d-flex gap-2 date-filters">
          <!-- Date Filters -->
          <input type="date" class="form-control form-control-sm filter-date" v-model="filters.start">
          <input type="date" class="form-control form-control-sm filter-date" v-model="filters.end">
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="card-body p-4">
        <!-- Search -->
        <div class="mb-3">
           <div class="input-group modern-input-group shadow-sm overflow-hidden rounded-pill">
              <span class="input-group-text bg-white border-0 ps-3"><i class="fas fa-search text-muted opacity-50"></i></span>
              <input type="text" class="form-control border-0 py-2 ps-2" placeholder="Cari No. Rawat / Pasien..." v-model="searchQuery" @input="onSearch">
           </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="bg-light text-secondary">
              <tr>
                <th class="fw-bold py-3" style="width: 180px;">No. Rawat/RM</th>
                <th class="fw-bold py-3">Pasien</th>
                <th class="fw-bold py-3">Tindakan Operasi</th>
                <th class="fw-bold py-3">Tanggal Op</th>
                <th class="fw-bold py-3">Selesai Op</th>
                <th class="fw-bold py-3">Durasi</th>
                <th class="fw-bold py-3">Pembiayaan</th>
                <th class="fw-bold py-3 text-center" style="width: 150px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">Belum ada data tindakan operasi</td>
              </tr>
              <tr v-else v-for="item in items" :key="item.no_rawat + '_' + item.tgl_operasi + '_' + item.kode_paket">
                <td>
                  <div class="fw-bold text-dark">{{ item.no_rawat }}</div>
                  <small class="text-muted">{{ item.reg_periksa?.no_rkm_medis || '-' }}</small>
                </td>
                <td>
                  <div class="fw-bold">{{ item.reg_periksa?.pasien?.nm_pasien || '-' }}</div>
                </td>
                <td>
                  <span class="badge bg-soft-primary text-primary px-3 py-2 rounded-pill">
                    {{ item.detail_paket?.nm_perawatan || item.kode_paket }}
                  </span>
                </td>
                <td>
                  <div class="small fw-bold">{{ formatDate(item.tgl_operasi) }}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">{{ formatTime(item.tgl_operasi) }}</div>
                </td>
                <td>
                  <div v-if="item.tgl_selesai && item.tgl_selesai !== '-'">
                    <div class="small fw-bold">{{ formatDate(item.tgl_selesai) }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">{{ formatTime(item.tgl_selesai) }}</div>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="badge bg-soft-success text-success">{{ item.durasi || '-' }}</span>
                </td>
                <td>
                  <div class="fw-bold small text-dark">{{ item.reg_periksa?.cara_bayar?.png_jawab || '-' }}</div>
                  <div v-if="item.reg_periksa?.sep?.klsrawat" class="mt-1">
                    <span class="badge bg-soft-info text-info px-2 py-1 rounded-pill" style="font-size: 0.725rem; font-weight: 600;">
                      <i class="fas fa-procedures me-1"></i> Kelas {{ item.reg_periksa.sep.klsrawat }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-info" @click="onDetail(item)" title="Detail Laporan">
                      <i class="fas fa-file-alt"></i> Detail
                    </button>
                    <button class="btn btn-sm btn-outline-warning" @click="onEdit(item)" title="Edit Laporan">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button v-if="canDelete" class="btn btn-sm btn-outline-danger" @click="onDelete(item)" title="Hapus Laporan">
                      <i class="fas fa-trash"></i> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top" v-if="pagination.total > 0">
           <small class="text-muted fw-medium">Menampilkan <span class="text-dark fw-bold">{{ pagination.from }}</span> - <span class="text-dark fw-bold">{{ pagination.to }}</span> dari <span class="text-dark fw-bold">{{ pagination.total }}</span> data</small>
           <nav aria-label="Page navigation">
              <ul class="pagination-premium mb-0 d-flex gap-2">
                 <li :class="{ disabled: !pagination.prev_page_url }">
                    <button class="pag-btn" @click="changePage(pagination.current_page - 1)" :disabled="!pagination.prev_page_url">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                 </li>
                 
                 <li class="curr-page-indicator">
                    <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
                 </li>

                 <li :class="{ disabled: !pagination.next_page_url }">
                    <button class="pag-btn" @click="changePage(pagination.current_page + 1)" :disabled="!pagination.next_page_url">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                 </li>
              </ul>
           </nav>
        </div>

      </div>
    </div>

    <!-- Modal Component -->
    <LaporanOperasiModal 
        :show="showModal"
        :form="laporanForm"
        :pasien="pasienInfo"
        :dokter-list="dokterList"
        :pegawai-list="pegawaiList"
        :paket-list="paketList"
        :jam-mulai="bookingJamMulai"
        :loading="isSaving"
        :readonly="isReadonly"
        @close="showModal = false"
        @submit="submitLaporan"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import operasiService from '@/services/operasiService'
import LaporanOperasiModal from '@/components/pemeriksaan/LaporanOperasiModal.vue'
import Swal from 'sweetalert2'

const toast = useToast()
const route = useRoute()
const authStore = useAuthStore()
const menuStore = useMenuStore()

// State
const items = ref([])
const loading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const isReadonly = ref(false)
const searchQuery = ref('')
const filters = reactive({
  start: '', // Default to? Maybe 1st of month
  end: ''
})
const pagination = ref({})
const pasienInfo = ref(null)

// Permissions
const currentMenu = computed(() => {
  const findMenuByRoute = (menus, path) => {
    for (const menu of menus) {
      if (menu.route === path) return menu
      if (menu.children) {
        const found = findMenuByRoute(menu.children, path)
        if (found) return found
      }
    }
    return null
  }
  return findMenuByRoute(menuStore.userMenus, route.path)
})

const canDelete = computed(() => {
  // Super admin check
  if (authStore.user?.data?.detail?.jbtn?.toLowerCase().includes('admin')) {
    return true
  }
  return currentMenu.value ? Boolean(currentMenu.value.can_delete) : false
})

const dokterList = ref([])
const pegawaiList = ref([])
const paketList = ref([])
const bookingJamMulai = ref('')

const laporanForm = reactive({
    no_rawat: '',
    kode_paket: '',
    original_kode_paket: '', // Tracks original kode_paket before edit to detect package change
    tgl_operasi: '',
    tgl_selesai: '',
    kategori: '-',
    jenis_anestesi: '',
    operator1: '',
    asisten_operator1: '',
    asisten_operator2: '',
    dokter_anak: '',
    dokter_anestesi: '',
    asisten_anestesi: '',
    onloop: '',
    diagnosa_preop: '',
    diagnosa_postop: '',
    laporan_operasi: '',
    jaringan_insisi: '',
    komplikasi: '',
    pemeriksaan_pa: 'Tidak',
    dr_anestesi_hadir: 'Tidak',
    dr_anak_hadir: 'Tidak',
    darah_masuk: '',
    darah_hilang: ''
})

const resetForm = () => {
    Object.keys(laporanForm).forEach(key => laporanForm[key] = '')
    laporanForm.kategori = '-'
    laporanForm.pemeriksaan_pa = 'Tidak'
    laporanForm.dr_anestesi_hadir = 'Tidak'
    laporanForm.dr_anak_hadir = 'Tidak'
}

// Helpers
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}
const formatTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}

const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// API
const fetchData = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            limit: 15,
            q: searchQuery.value,
            start: filters.start,
            end: filters.end
        }
        const response = await operasiService.getLaporanList(params)
        const { data } = response.data
        items.value = data.data
        pagination.value = {
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
            from: data.from,
            to: data.to,
            prev_page_url: data.prev_page_url,
            next_page_url: data.next_page_url
        }
    } catch (e) {
        console.error("Failed to fetch data", e)
        toast.error('Gagal memuat data tindakan operasi')
    } finally {
        loading.value = false
    }
}

const fetchMasterData = async () => {
    try {
        const [dokterRes, pegawaiRes, paketRes] = await Promise.all([
            operasiService.getDokter(),
            operasiService.getPegawai(),
            operasiService.getPaket()
        ])
        dokterList.value = dokterRes.data.data
        pegawaiList.value = pegawaiRes.data.data
        paketList.value = paketRes.data.data || []
    } catch (e) {
        console.error("Failed master data", e)
        toast.error('Gagal memuat data master')
    }
}

// Actions
const onSearch = debounce(() => {
    fetchData(1)
}, 500)

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        fetchData(page)
    }
}

const onEdit = async (item) => {
    isReadonly.value = false
    await openModal(item)
}

const onDetail = async (item) => {
    isReadonly.value = true
    await openModal(item)
}

const onDelete = async (item) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Laporan operasi yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            const params = {
                no_rawat: item.no_rawat,
                kode_paket: item.kode_paket,
                tgl_operasi: item.tgl_operasi
            }
            const response = await operasiService.deleteLaporan(params)
            if (response.data.success) {
                toast.success('Laporan operasi berhasil dihapus')
                fetchData(pagination.value.current_page)
            } else {
                toast.error(response.data.message || 'Gagal menghapus laporan')
            }
        } catch (e) {
            console.error("Delete failed", e)
            toast.error(e.response?.data?.message || 'Gagal menghapus laporan operasi')
        }
    }
}

const openModal = async (item) => {
    resetForm()
    
    // 1. Pre-populate ALL available fields from list item (Operasi table data)
    // Supaya Tim Operasi dsb langsung terisi walaupun db safe_operasi masih kosong
    Object.keys(laporanForm).forEach(key => {
        if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
             laporanForm[key] = item[key]
        }
    })

    // Tangani mapping nama yang berbeda dari item
    if (item.jenis_anasthesi) {
        laporanForm.jenis_anestesi = item.jenis_anasthesi
    }

    // Hindari tgl_operasi terformat salah oleh assignment di atas
    if (item.tgl_operasi) {
        // datetime-local butuh YYYY-MM-DDTHH:mm
        laporanForm.tgl_operasi = item.tgl_operasi.replace(' ', 'T').substring(0, 16)
    }

    // Pastikan paket yang sedang dipilih ada di paketList agar v-select tampil nm_perawatan, bukan kode
    const p = item.detail_paket || item.detailPaket
    if (p && p.kode_paket) {
        const exists = paketList.value.some(item => item.kode_paket === p.kode_paket)
        if (!exists) {
            paketList.value.unshift({
                kode_paket: p.kode_paket,
                nm_perawatan: p.nm_perawatan
            })
        }
    }

    // 2. Fetch full clinical data from API (Fuzzy matching)
    try {
        const params = {
            no_rawat: item.no_rawat,
            tgl_operasi: item.tgl_operasi,
            kode_paket: item.kode_paket
        }
        const response = await operasiService.getLaporan(params)
        const detailedData = response.data.data

        if (detailedData) {
            // Populate all fields from the detailed clinical report
            Object.keys(laporanForm).forEach(key => {
                if (detailedData[key] !== undefined && detailedData[key] !== null && detailedData[key] !== '-') {
                     laporanForm[key] = detailedData[key]
                }
            })
            
            // Special handling for naming mismatches if any in detailed data too
            if (detailedData.jenis_anasthesi && !laporanForm.jenis_anestesi) {
                laporanForm.jenis_anestesi = detailedData.jenis_anasthesi
            }

            // Fill diagnosa awal dari data pendaftaran jika masih kosong (laporan baru)
            if (!laporanForm.diagnosa_preop && detailedData.reg_periksa?.diagnosa_pasien?.length > 0) {
                 laporanForm.diagnosa_preop = detailedData.reg_periksa.diagnosa_pasien
                     .map(d => `${d.kd_penyakit} - ${d.penyakit?.nm_penyakit || ''}`)
                     .join(', ')
            }

            // Pastikan format tanggal kembali ke datetime-local-friendly (diformat ulang karena ditimpa db raw text)
            if (laporanForm.tgl_operasi) {
                laporanForm.tgl_operasi = laporanForm.tgl_operasi.replace(' ', 'T').substring(0, 16)
            }

            // Tambahan: Pastikan paket dari data detail juga masuk ke paketList jika belum ada
            // (Kasus di mana tindakan diubah dari jadwal aslinya)
            const dp = detailedData.detail_paket || detailedData.detailPaket
            if (dp && dp.kode_paket) {
                const exists = paketList.value.some(item => item.kode_paket === dp.kode_paket)
                if (!exists) {
                    paketList.value.unshift({
                        kode_paket: dp.kode_paket,
                        nm_perawatan: dp.nm_perawatan
                    })
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch detailed laporan", e)
        // We still have the basic data from the list
    }
    
    // 3. Final formatting datetime-local
    if (laporanForm.tgl_selesai && laporanForm.tgl_selesai !== '-') {
        laporanForm.tgl_selesai = laporanForm.tgl_selesai.replace(' ', 'T').substring(0, 16)
    } else if (item.jam_selesai && item.tgl_operasi) {
        // Jika belum ada laporannya, prefill tgl_selesai dari tanggal operasi + jam selesai booking
        const tanggal = item.tgl_operasi.substring(0, 10)
        laporanForm.tgl_selesai = `${tanggal}T${item.jam_selesai.substring(0, 5)}`
    }

    // 4. Set Patient Info for display
    pasienInfo.value = item.reg_periksa?.pasien

    // 5. Track original kode_paket so backend can delete old record if it changes
    laporanForm.original_kode_paket = laporanForm.kode_paket
    
    showModal.value = true
}

const submitLaporan = async () => {
    isSaving.value = true
    try {
        const response = await operasiService.storeLaporan(laporanForm)
        if (response.data.success) {
            toast.success('Laporan operasi berhasil disimpan')
            showModal.value = false
            fetchData(pagination.value.current_page)
        } else {
            toast.error(response.data.message || 'Gagal menyimpan laporan')
        }
    } catch (e) {
        console.error("Save failed", e)
        const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan laporan operasi'
        toast.error(errorMsg)
    } finally {
        isSaving.value = false
    }
}

// Lifecycle
onMounted(() => {
    // Set default filter to current month? Or empty for all history?
    // Let's set start date to first day of month
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    // Format YYYY-MM-DD using local time to avoid timezone offset issues (e.g. 01 being converted to 28/29)
    const formatDateInput = (d) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    filters.start = formatDateInput(firstDay)
    filters.end = formatDateInput(date)

    fetchData()
    fetchMasterData()
})

watch(() => [filters.start, filters.end], () => {
    fetchData(1)
})
</script>

<style scoped>
.tindakan-operasi-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.card {
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02) !important;
}

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

.filter-date {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  color: #334155;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.filter-date:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.modern-input-group {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.modern-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

/* Badge Styling */
.bg-soft-primary {
  background-color: #eff6ff;
}

.bg-soft-success {
  background-color: #f0fdf4;
}

.bg-soft-info {
  background-color: #ecfeff;
}

/* Table Style */
.table thead th {
  background-color: #f8fafc;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #475569;
  font-weight: 800;
  padding: 1rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.table tbody td {
  padding: 1rem 0.75rem;
}

/* Modern Pagination Premium */
.pagination-premium {
  list-style: none;
  padding: 0;
  display: flex;
  align-items: center;
}

.pag-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.pag-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.pag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.curr-page-indicator {
  background: #f1f5f9;
  padding: 0 1.25rem;
  height: 36px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .tindakan-operasi-container {
    padding: 0.75rem !important;
  }

  .page-header {
    padding: 1.25rem 1rem !important;
    border-radius: 16px !important;
  }

  .page-title {
    font-size: 1.25rem !important;
  }

  .page-subtitle {
    font-size: 0.8rem !important;
  }

  .date-filters {
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  .date-filters input {
    width: 100% !important;
  }
}
</style>
