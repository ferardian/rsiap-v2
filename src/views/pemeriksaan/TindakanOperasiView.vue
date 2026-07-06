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
          <table class="table table-hover align-middle compact-table">
            <thead>
              <tr>
                <th style="width: 170px;">No. Rawat / RM</th>
                <th>Pasien</th>
                <th>Tindakan Operasi</th>
                <th style="width: 110px;">Tgl Mulai</th>
                <th style="width: 110px;">Tgl Selesai</th>
                <th style="width: 110px;">Durasi</th>
                <th>Pembiayaan</th>
                <th class="text-center" style="width: 110px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="text-muted mt-2 small">Memuat data...</div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="8" class="text-center py-5">
                  <i class="fas fa-file-medical fa-2x text-muted mb-2 d-block opacity-40"></i>
                  <span class="text-muted small">Belum ada data tindakan operasi</span>
                </td>
              </tr>
              <tr v-else v-for="item in items" :key="item.no_rawat + '_' + item.tgl_operasi + '_' + item.kode_paket">
                <td>
                  <div class="row-no-rawat">{{ item.no_rawat }}</div>
                  <div class="row-sub">{{ item.reg_periksa?.no_rkm_medis || '-' }}</div>
                </td>
                <td>
                  <div class="row-name">{{ item.reg_periksa?.pasien?.nm_pasien || '-' }}</div>
                </td>
                <td>
                  <span class="tindakan-badge">
                    {{ item.detail_paket?.nm_perawatan || item.kode_paket }}
                  </span>
                </td>
                <td>
                  <div class="row-date">{{ formatDate(item.tgl_operasi) }}</div>
                  <div class="row-time">{{ formatTime(item.tgl_operasi) }}</div>
                </td>
                <td>
                  <template v-if="item.tgl_selesai && item.tgl_selesai !== '-'">
                    <div class="row-date">{{ formatDate(item.tgl_selesai) }}</div>
                    <div class="row-time">{{ formatTime(item.tgl_selesai) }}</div>
                  </template>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="durasi-badge">{{ item.durasi || '-' }}</span>
                </td>
                <td>
                  <div class="row-penjamin">{{ item.reg_periksa?.cara_bayar?.png_jawab || '-' }}</div>
                  <span v-if="item.reg_periksa?.sep?.klsrawat" class="kelas-badge">
                    <i class="fas fa-bed me-1"></i>Kelas {{ item.reg_periksa.sep.klsrawat }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn detail" @click="onDetail(item)" title="Detail Laporan">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" @click="onEdit(item)" title="Edit Laporan">
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button v-if="canDelete" class="action-btn delete" @click="onDelete(item)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04) !important;
}

.header-icon-bg {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.2rem;
}

.filter-date {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  font-size: 0.8rem;
  color: #334155;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.filter-date:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.modern-input-group {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.modern-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
}

/* ---- Compact Table ---- */
.compact-table thead th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b;
  font-weight: 700;
  padding: 0.6rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.compact-table tbody tr {
  transition: background 0.15s ease;
  border-bottom: 1px solid #f1f5f9;
}

.compact-table tbody tr:hover {
  background-color: #f8fbff;
}

.compact-table tbody td {
  padding: 0.55rem 0.75rem;
  vertical-align: middle;
}

/* Row typography */
.row-no-rawat {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 0.2px;
}

.row-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}

.row-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}

.row-date {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.row-time {
  font-size: 0.72rem;
  color: #94a3b8;
}

.row-penjamin {
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
}

/* Badges */
.tindakan-badge {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.durasi-badge {
  display: inline-block;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid #bbf7d0;
}

.kelas-badge {
  display: inline-block;
  background: #ecfeff;
  color: #0891b2;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #a5f3fc;
  margin-top: 3px;
}

/* Action buttons */
.action-btns {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  border: 1px solid;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.18s ease;
  padding: 0;
  background: white;
}

.action-btn.detail {
  color: #0ea5e9;
  border-color: #bae6fd;
}
.action-btn.detail:hover {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3);
}

.action-btn.edit {
  color: #f59e0b;
  border-color: #fde68a;
}
.action-btn.edit:hover {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.3);
}

.action-btn.delete {
  color: #ef4444;
  border-color: #fecaca;
}
.action-btn.delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(239, 68, 68, 0.3);
}

/* Modern Pagination */
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.8rem;
}

.pag-btn:hover:not(:disabled) {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
  transform: translateY(-1px);
}

.pag-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.curr-page-indicator {
  background: #f1f5f9;
  padding: 0 1rem;
  height: 32px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .tindakan-operasi-container { padding: 0.75rem !important; }
  .page-title { font-size: 1.1rem !important; }
  .date-filters {
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
}
</style>
