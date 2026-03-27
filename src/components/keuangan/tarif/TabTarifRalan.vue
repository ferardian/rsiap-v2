<template>
  <div class="tab-tarif-ralan">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- Toolbar -->
        <div class="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold d-flex align-items-center">
            <div class="icon-box bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3">
              <i class="fas fa-stethoscope"></i>
            </div>
            Tarif Rawat Jalan
          </h5>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <div class="premium-search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control premium-search-input" 
                placeholder="Cari nama perawatan / kode..."
                @keyup.enter="fetchData"
              >
            </div>
            <button class="btn btn-success premium-add-btn" @click="openModal('add')">
              <i class="fas fa-plus me-2"></i> Tambah
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive premium-table">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Perawatan</th>
                <th>Kategori</th>
                <th class="text-end">J.S.Rmh Sakit</th>
                <th class="text-end">BHP/Paket Obat</th>
                <th class="text-end">J.Medis Dr</th>
                <th class="text-end">J.Medis Pr</th>
                <th class="text-end">KSO</th>
                <th class="text-end">Menejemen</th>
                <th class="text-end text-nowrap">Ttl Biaya Dr</th>
                <th class="text-end text-nowrap">Ttl Biaya Pr</th>
                <th class="text-end text-nowrap">Ttl Biaya Dr & Pr</th>
                <th>Jenis Bayar</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="14" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif rawat jalan...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="14" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif rawat jalan.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kd_jenis_prw" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kd_jenis_prw }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.8rem; white-space: normal; min-width: 250px;">{{ item.nm_perawatan }}</td>
                <td>
                  <div class="small fw-bold text-primary">{{ item.kategori?.nm_kategori || item.kd_kategori }}</div>
                  <div class="small text-muted"><i class="fas fa-clinic-medical me-1"></i>{{ item.poliklinik?.nm_poli || item.kd_poli }}</div>
                </td>
                <td class="text-end numeric-text">{{ formatRupiah(item.material) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.bhp) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.tarif_tindakandr) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.tarif_tindakanpr) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.kso) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.menejemen) }}</td>
                <td class="text-end numeric-text fw-bold text-primary">{{ formatRupiah(item.total_byrdr) }}</td>
                <td class="text-end numeric-text fw-bold text-primary">{{ formatRupiah(item.total_byrpr) }}</td>
                <td class="text-end numeric-text fw-bold text-success">{{ formatRupiah(item.total_byrdrpr) }}</td>
                <td>
                  <div class="small fw-bold">{{ item.penjab?.png_jawab || item.kd_pj || '-' }}</div>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-light text-primary me-1" @toggle="tooltip" title="Edit" @click="openModal('edit', item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger" @toggle="tooltip" title="Nonaktifkan" @click="confirmDelete(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Page navigation" class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="small text-muted">
            Menampilkan data {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari {{ pagination.total || 0 }}
          </div>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item disabled">
              <span class="page-link text-dark fw-bold px-3">{{ pagination.current_page || 1 }} &nbsp;/&nbsp; {{ pagination.last_page || 1 }}</span>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" id="modalTarifRalan" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <div class="modal-header border-0 bg-primary-subtle text-primary" style="border-radius: 16px 16px 0 0;">
            <h5 class="modal-title fw-bold"><i class="fas fa-stethoscope me-2"></i>{{ modalMode === 'add' ? 'Tambah' : 'Edit' }} Tarif Rawat Jalan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveData">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Kode Perawatan</label>
                  <input v-model="form.kd_jenis_prw" type="text" class="form-control" :readonly="modalMode === 'edit'" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Penjab</label>
                  <select v-model="form.kd_pj" class="form-select" required>
                    <option value="" disabled>Pilih Penjab...</option>
                    <option v-for="pj in listPenjab" :key="pj.kd_pj" :value="pj.kd_pj">
                      {{ pj.png_jawab }} ({{ pj.kd_pj }})
                    </option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label small fw-bold">Nama Perawatan</label>
                  <input v-model="form.nm_perawatan" type="text" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Kategori Perawatan</label>
                  <select v-model="form.kd_kategori" class="form-select" required>
                    <option value="" disabled>Pilih Kategori...</option>
                    <option v-for="kat in listKategori" :key="kat.kd_kategori" :value="kat.kd_kategori">
                      {{ kat.nm_kategori }} ({{ kat.kd_kategori }})
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Poliklinik</label>
                  <select v-model="form.kd_poli" class="form-select" required>
                    <option value="" disabled>Pilih Poliklinik...</option>
                    <option v-for="poli in listPoli" :key="poli.kd_poli" :value="poli.kd_poli">
                      {{ poli.nm_poli }} ({{ poli.kd_poli }})
                    </option>
                  </select>
                </div>

                <div class="col-12 mt-4 mb-2"><hr class="m-0"><div class="small text-muted mt-2 fw-bold text-uppercase">Rincian Biaya</div></div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">J.S.Rmh Sakit</label>
                  <input v-model.number="form.material" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">BHP / Paket Obat</label>
                  <input v-model.number="form.bhp" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Jasa Medis Dr</label>
                  <input v-model.number="form.tarif_tindakandr" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Jasa Medis Pr</label>
                  <input v-model.number="form.tarif_tindakanpr" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">KSO</label>
                  <input v-model.number="form.kso" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Menejemen</label>
                  <input v-model.number="form.menejemen" type="number" class="form-control premium-input-sm" @input="calculateTotals">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Total Biaya Dr</label>
                  <input v-model.number="form.total_byrdr" type="number" class="form-control premium-input-sm">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Total Biaya Pr</label>
                  <input v-model.number="form.total_byrpr" type="number" class="form-control premium-input-sm">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label small fw-bold">Total Biaya Dr & Pr</label>
                  <input v-model.number="form.total_byrdrpr" type="number" class="form-control premium-input-sm">
                </div>
              </div>
              <div class="mt-4 text-end">
                <button type="button" class="btn btn-light me-2" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <i class="fas fa-save me-1" v-if="!saving"></i>
                  <span class="spinner-border spinner-border-sm me-1" v-if="saving"></span>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()
const loading = ref(false)
const items = ref([])
const listKategori = ref([])
const listPoli = ref([])
const listPenjab = ref([])
const modalMode = ref('add')
const saving = ref(false)
let modalInstance = null

const form = reactive({
  kd_jenis_prw: '',
  nm_perawatan: '',
  kd_kategori: '',
  kd_poli: '',
  kd_pj: '',
  material: 0,
  bhp: 0,
  tarif_tindakandr: 0,
  tarif_tindakanpr: 0,
  kso: 0,
  menejemen: 0,
  total_byrdr: 0,
  total_byrpr: 0,
  total_byrdrpr: 0
})

const calculateTotals = () => {
  form.total_byrdr = (form.material || 0) + (form.bhp || 0) + (form.tarif_tindakandr || 0) + (form.kso || 0) + (form.menejemen || 0)
  form.total_byrpr = (form.material || 0) + (form.bhp || 0) + (form.tarif_tindakanpr || 0) + (form.kso || 0) + (form.menejemen || 0)
  form.total_byrdrpr = (form.material || 0) + (form.bhp || 0) + (form.tarif_tindakandr || 0) + (form.tarif_tindakanpr || 0) + (form.kso || 0) + (form.menejemen || 0)
}

// Total fields are manually editable as per user request "jangan di kunci, itu bisa diubah"

const resetForm = () => {
  form.kd_jenis_prw = ''
  form.nm_perawatan = ''
  form.kd_kategori = ''
  form.kd_poli = ''
  form.kd_pj = ''
  form.material = 0
  form.bhp = 0
  form.tarif_tindakandr = 0
  form.tarif_tindakanpr = 0
  form.kso = 0
  form.menejemen = 0
  form.total_byrdr = 0
  form.total_byrpr = 0
  form.total_byrdrpr = 0
}

const openModal = async (mode, item = null) => {
  modalMode.value = mode
  resetForm()
  if (mode === 'add') {
    try {
      const res = await keuanganTarifService.getNextKodeRalan()
      if (res.data.success) {
        form.kd_jenis_prw = res.data.data
      }
    } catch (e) {
      console.error('Failed to get next kode', e)
    }
  } else if (mode === 'edit' && item) {
    Object.assign(form, {
      kd_jenis_prw: item.kd_jenis_prw,
      nm_perawatan: item.nm_perawatan,
      kd_kategori: item.kd_kategori || item.kategori?.kd_kategori || '',
      kd_poli: item.kd_poli || item.poliklinik?.kd_poli || '',
      kd_pj: item.kd_pj || item.penjab?.kd_pj || '',
      material: parseFloat(item.material) || 0,
      bhp: parseFloat(item.bhp) || 0,
      tarif_tindakandr: parseFloat(item.tarif_tindakandr) || 0,
      tarif_tindakanpr: parseFloat(item.tarif_tindakanpr) || 0,
      kso: parseFloat(item.kso) || 0,
      menejemen: parseFloat(item.menejemen) || 0,
      total_byrdr: parseFloat(item.total_byrdr) || 0,
      total_byrpr: parseFloat(item.total_byrpr) || 0,
      total_byrdrpr: parseFloat(item.total_byrdrpr) || 0
    })
  }
  if (!modalInstance) {
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifRalan'))
  }
  modalInstance.show()
}

const saveData = async () => {
  saving.value = true
  try {
    let res;
    if (modalMode.value === 'add') {
      res = await keuanganTarifService.postTarifRalan(form)
    } else {
      res = await keuanganTarifService.putTarifRalan(form.kd_jenis_prw, form)
    }
    
    if (res.data.success) {
      toast.success(res.data.message || 'Berhasil disimpan')
      modalInstance?.hide()
      fetchData()
    } else {
      toast.error(res.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
     toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Nonaktifkan Tarif?',
    text: `Yakin ingin menonaktifkan kode ${item.kd_jenis_prw}? Ini hanya akan mengubah status tarif menjadi tidak aktif.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, Nonaktifkan!',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      confirmButton: 'premium-btn-confirm',
      cancelButton: 'premium-btn-cancel'
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTarifRalan(item.kd_jenis_prw)
        if (res.data.success) {
          toast.success(res.data.message || 'Data dinonaktifkan')
          fetchData()
        }
      } catch (e) {
        toast.error('Gagal menonaktifkan data')
      }
    }
  })
}

const filters = reactive({
  keyword: '',
  page: 1
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0,
  prev_page_url: null,
  next_page_url: null
})

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifRalan(filters)
    if (res.data.success) {
      const respData = res.data.data
      items.value = respData.data || []
      
      // Update pagination
      pagination.current_page = respData.current_page
      pagination.last_page = respData.last_page
      pagination.from = respData.from
      pagination.to = respData.to
      pagination.total = respData.total
      pagination.prev_page_url = respData.prev_page_url
      pagination.next_page_url = respData.next_page_url
    } else if (res.data.metadata?.code === 200) {
      items.value = res.data.response.data || res.data.response
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Error fetching tarif ralan', error)
    if (error.response?.status === 404) {
       // Mock data if API is not yet available for demonstration
       items.value = [
          { kd_jenis_prw: 'RJ001', nm_perawatan: 'Pemeriksaan Dokter Umum', kd_kategori: 'UM', kd_poli: 'U001', total_byrdr: 30000, total_byrpr: 0, total_byrdrpr: 30000, status: '1' },
          { kd_jenis_prw: 'RJ002', nm_perawatan: 'Konsultasi Spesialis Anak', kd_kategori: 'SP', kd_poli: 'A001', total_byrdr: 80000, total_byrpr: 0, total_byrdrpr: 80000, status: '1' },
          { kd_jenis_prw: 'RJ003', nm_perawatan: 'Pemeriksaan Gigi Dasar', kd_kategori: 'GG', kd_poli: 'G001', total_byrdr: 50000, total_byrpr: 20000, total_byrdrpr: 70000, status: '1' }
       ]
    } else {
       toast.error('Gagal mengambil data tarif rawat jalan')
    }
  } finally {
    loading.value = false
  }
}

const fetchKategori = async () => {
  try {
    const res = await keuanganTarifService.getKategoriPerawatan()
    if (res.data.success) {
      listKategori.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching kategori perawatan', error)
  }
}

const fetchPoli = async () => {
  try {
    const res = await keuanganTarifService.getPoli()
    if (res.data.success) {
      listPoli.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching poliklinik', error)
  }
}

const fetchPenjab = async () => {
  try {
    const res = await keuanganTarifService.getPenjab()
    if (res.data.success) {
      listPenjab.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching penjab', error)
  }
}

onMounted(() => {
  fetchData()
  fetchKategori()
  fetchPoli()
  fetchPenjab()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
.icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.premium-search-wrapper {
  position: relative;
  width: 320px;
}
.premium-search-wrapper .search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
.premium-search-input {
  border-radius: 50px;
  padding-left: 3rem;
  padding-right: 1.25rem;
  border: 1px solid #e2e8f0;
  height: 42px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: #f8fafc;
}
.premium-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  background-color: white;
  outline: none;
}
.premium-add-btn {
  border-radius: 50px;
  padding: 0 1.5rem;
  height: 42px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
}
.premium-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -2px rgba(16, 185, 129, 0.2);
}
/* Table Styles */
.premium-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}
.premium-table table {
  margin-bottom: 0;
}
.premium-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.70rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}
.premium-table tbody td {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  white-space: nowrap;
}
.table-responsive.premium-table {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
.hover-row:hover {
  background-color: #f8fafc;
}
.numeric-text {
  font-family: inherit;
  font-weight: 500;
}
.badge {
  padding: 0.4em 0.8em;
  font-weight: 700;
}
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }
.bg-primary-subtle { background-color: #dbeafe; }
</style>
