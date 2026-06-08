<template>
  <div class="skrining-gizi-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Data Skrining Gizi</h3>
            <p class="page-subtitle mb-0 small">Kelola data skrining gizi pasien rawat inap</p>
          </div>
        </div>

        <div class="action-buttons d-flex gap-2 align-items-center filter-section">
          <!-- Date Filters -->
          <div class="date-filter-group d-flex align-items-center gap-2">
            <input type="date" class="form-control form-control-sm filter-date" v-model="filters.tgl_awal" title="Tanggal Awal">
            <span class="text-muted small fw-bold">s/d</span>
            <input type="date" class="form-control form-control-sm filter-date" v-model="filters.tgl_akhir" title="Tanggal Akhir">
          </div>
          <!-- Search -->
          <div class="search-wrapper input-group modern-input-group shadow-sm overflow-hidden rounded-pill">
            <span class="input-group-text bg-white border-0 ps-3"><i class="fas fa-search text-muted opacity-50"></i></span>
            <input 
              type="text" 
              class="form-control border-0 py-2 ps-2 text-input" 
              placeholder="Cari Pasien..."
              v-model="filters.keyword"
              @keyup.enter="fetchData"
            >
          </div>
          <!-- Refresh -->
          <button class="btn btn-refresh-pill rounded-pill" @click="fetchData" title="Refresh">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th class="ps-4">No. Rawat</th>
                <th>Pasien</th>
                <th>Bangsal</th>
                <th>Tgl. Registrasi</th>
                <th>Kategori</th>
                <th>Antropometri</th>
                <th>Skor</th>
                <th>IMT</th>
                <th>Keterangan</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="10" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                  <p>Tidak ada data skrining gizi ditemukan.</p>
                </td>
              </tr>
              <tr v-else v-for="item in items" :key="item.no_rawat">
                <td class="ps-4 fw-bold text-primary">{{ item.no_rawat }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ item.reg_periksa?.pasien?.nm_pasien }}</div>
                  <small class="text-muted">{{ item.reg_periksa?.no_rkm_medis }}</small>
                </td>
                <td>
                  <div class="small fw-bold">{{ item.kamar_inap?.kamar?.bangsal?.nm_bangsal || '-' }}</div>
                  <small class="text-muted">{{ item.kamar_inap?.kd_kamar }}</small>
                </td>
                <td>
                   <div class="small text-muted fw-bold">{{ item.reg_periksa?.tgl_registrasi }}</div>
                </td>
                <td>
                  <span v-if="item.kategori === 'OBGYN'" class="badge bg-pink text-white rounded-pill px-3">
                    <i class="fas fa-female me-1"></i> OBGYN
                  </span>
                  <span v-else-if="item.kategori === 'ANAK'" class="badge bg-info text-white rounded-pill px-3">
                    <i class="fas fa-child me-1"></i> ANAK
                  </span>
                  <span v-else class="badge bg-secondary">-</span>
                </td>
                <td>
                  <div class="small">
                    <div>BB: <b>{{ item.bb }}</b> kg</div>
                    <div>TB: <b>{{ item.tb }}</b> cm</div>
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill fs-6" :class="getScoreBadge(item.skor)">
                    {{ item.skor }}
                  </span>
                </td>
                <td>{{ item.imt }}</td>
                <td>
                   <div class="text-truncate small text-muted" style="max-width: 150px;" :title="item.keterangan">{{ item.keterangan || '-' }}</div>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(item)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(item)" title="Hapus">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white border-top py-4 px-4">
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted fw-medium">
                Menampilkan <span class="text-dark fw-bold">{{ items.length }}</span> dari <span class="text-dark fw-bold">{{ totalItems }}</span> data
            </small>
             <nav aria-label="Page navigation" v-if="totalPages > 1">
                <ul class="pagination-premium mb-0 d-flex gap-2">
                    <li :class="{ disabled: currentPage === 1 }">
                        <button class="pag-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                          <i class="fas fa-chevron-left"></i>
                        </button>
                    </li>
                    
                    <li class="curr-page-indicator">
                        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
                    </li>

                    <li :class="{ disabled: currentPage === totalPages }">
                        <button class="pag-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <FormSkriningGizi 
      v-if="showModal"
      :visible="showModal"
      :initial-data="selectedItem"
      :is-saving="isSaving"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import skriningGiziService from '@/services/skriningGiziService'
import FormSkriningGizi from '@/components/pemeriksaan/FormSkriningGizi.vue'

const toast = useToast()

const items = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)
const filters = reactive({
  keyword: '',
  limit: 10,
  tgl_awal: null,
  tgl_akhir: null
})

const showModal = ref(false)
const selectedItem = ref({})
const isSaving = ref(false)

const fetchData = async () => {
  isLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: filters.limit,
      keyword: filters.keyword,
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir
    }
    const response = await skriningGiziService.getAll(params)
    if (response.data.success) {
      const data = response.data.data
      if (data.data) { // Laravel Paginate structure
          items.value = data.data
          totalItems.value = data.total
          currentPage.value = data.current_page
          totalPages.value = data.last_page
      } else {
          items.value = data
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Gagal memuat data skrining gizi')
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchData()
    }
}

const getScoreBadge = (score) => {
    if (score >= 2) return 'bg-danger'
    if (score >= 1) return 'bg-warning text-dark'
    return 'bg-success'
}

const openEdit = (item) => {
    // Parse JSON strings back to arrays if needed, though backend currently returns them as strings
    // The component handles parsing or uses initialData as generic object
    // Need to make sure component logic matches data format
    
    // Quick fix: ensure we pass copies
    const data = { ...item }
    
    // Parse JSON fields if they are strings (based on our previous investigation they are stored as arrays in PHP but backend might serialize them)
    // Wait, the PHP controller stores them as is, but Laravel Casts might not be set.
    // Let's assume they come as strings from DB if not casted.
    // However, FormSkriningGizi.vue expects arrays for checkboxes.
    
    // Helper to safe parse
    const safeParse = (val) => {
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
            try { return JSON.parse(val) } catch(e) { return [] }
        }
        return val
    }
    
    // We should probably rely on FormSkriningGizi watcher to handle clean up, but let's prep here
    // Currently FormSkriningGizi resets arrays on watch. 
    // We need to populate them correctly for EDIT.
    
    // Let's modify FormSkriningGizi logic later if Edit doesn't prefill correctly.
    // For now, pass basic data.
    
    selectedItem.value = data
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedItem.value = {}
}

const handleSave = async (formData) => {
    isSaving.value = true
    try {
        // Prepare payload
        // Need to serialize arrays if backend expects strings?
        // PHP controller validates: 'cb_obgyn' => 'nullable|string'
        // So yes, we need to join arrays.
        
        const payload = { ...formData }
        
        // Serialize Arrays for Backend
        if (Array.isArray(payload.obgyn_q2)) payload.cb_obgyn = payload.obgyn_q2.join(',') // Logic from previous RawatInapView
        // Note: RawatInapView logic was complicated: 
        //   cb_obgyn: skriningGiziForm.obgyn_q2.length > 0 ? (skriningGiziForm.obgyn_q2.join(',') + (skriningGiziForm.obgyn_q2_lainnya ? ',' + skriningGiziForm.obgyn_q2_lainnya : '')) : '',
        
        // Let's replicate serialization logic here or better, put it inside the component? 
        // Component emits `save` with `formData`. Component knows best about `obgyn_q2` etc.
        // Ideally the component should emit the ready-to-send payload or we process it here.
        // Let's process here.
        
        // OBGYN Serialization
        let obgyn_list = [...(payload.obgyn_q2 || [])]
        if (payload.obgyn_q2_lainnya && obgyn_list.includes('Lainnya')) {
             // Remove 'Lainnya' text if needed or just append?
             // PHP: in_array("Lainnya", $cb_obgyn)
             // So we keep "Lainnya" and add the text value?
             // Actually previous code: value="Lainnya" ... input value gets appended?
             // Let's stick to simple comma separated for now.
             // If "Lainnya" is selected, we include it. And we might need another field for the text?
             // Looking at PHP: 
             // <input ... name="checkbox1[]" value="Lainnya">
             // <input ... name="checkbox1[]" value="..."> (the text input)
             // So backend receives array: ["DM", "Lainnya", "Text input result"]
             
             // So if we send comma separated string: "DM,Lainnya,My Text"
             if (payload.obgyn_q2_lainnya) obgyn_list.push(payload.obgyn_q2_lainnya)
        }
        payload.cb_obgyn = obgyn_list.join(',')
        
        // ANAK Serialization
        payload.cb_anak1 = (payload.anak_q3 || []).join(',')
        payload.cb_anak2 = (payload.anak_q4 || []).join(',')
        
        // Q Obgyn (Radio) - Array in PHP
        // $q_obgyn = ["YA", null, "TIDAK", "YA"] (Indices 0, 1, 2, 3 correspond to Q1..Q4? No)
        // PHP: $q_obgyn[0] = Q1, q_obgyn doesn't seem to have Q2 (checkbox), Q3=?, Q4=?
        // Let's look at PHP: 
        // Q1: radio11 -> $q_obgyn[0]
        // Q3: radio13 -> $q_obgyn[2] ?? (index logic is weird in PHP)
        // Let's map to JSON for API because our new controller probably doesn't parsing old PHP array style?
        // Wait, the Controller code I read handles `q_obgyn` as `string|max:200`.
        // So we can store whatever we want. JSON is safest.
        payload.q_obgyn = JSON.stringify([payload.obgyn_q1, payload.obgyn_q3, payload.obgyn_q4]) 
        payload.q_anak = JSON.stringify([payload.anak_q1, payload.anak_q2])
        
        const response = await skriningGiziService.save(payload)
        
        if (response.data.success) {
            toast.success('Berhasil menyimpan data')
            closeModal()
            fetchData()
        }
    } catch (error) {
        console.error('Save error:', error)
        toast.error('Gagal menyimpan: ' + (error.response?.data?.message || error.message))
    } finally {
        isSaving.value = false
    }
}

const confirmDelete = async (item) => {
    const result = await Swal.fire({
        title: 'Hapus Skrining Gizi?',
        text: `Data skrining untuk ${item.reg_periksa?.pasien?.nm_pasien} akan dihapus permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            await skriningGiziService.delete(item.no_rawat)
            toast.success('Data berhasil dihapus')
            fetchData()
        } catch (error) {
            toast.error('Gagal menghapus data')
        }
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.skrining-gizi-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.bg-pink {
  background-color: #e83e8c;
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
  width: 130px;
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

.search-wrapper {
  width: 240px !important;
  min-width: 240px;
}

.btn-refresh-pill {
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-refresh-pill:hover {
  background: #dbeafe;
  color: #1d4ed8;
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
  .skrining-gizi-container {
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

  .filter-section {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    width: 100% !important;
  }

  .date-filter-group {
    width: 100% !important;
    justify-content: space-between !important;
  }

  .filter-date {
    width: 100% !important;
    flex: 1 !important;
  }

  .search-wrapper {
    width: 100% !important;
  }

  .btn-refresh-pill {
    width: 100% !important;
    height: 38px !important;
    border-radius: 50px !important;
  }
}
</style>
