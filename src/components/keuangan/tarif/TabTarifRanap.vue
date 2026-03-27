<template>
  <div class="tab-tarif-ranap">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- Toolbar -->
        <div class="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold d-flex align-items-center">
            <div class="icon-box bg-purple-subtle text-purple rounded-3 p-2 me-3">
              <i class="fas fa-bed"></i>
            </div>
            Tarif Rawat Inap
          </h5>
          <div class="d-flex flex-wrap gap-2 align-items-center">
             <select v-model="filters.kelas" class="form-select premium-select-pill">
                <option value="">Semua Kelas</option>
                <option value="Kelas 1">Kelas 1</option>
                <option value="Kelas 2">Kelas 2</option>
                <option value="Kelas 3">Kelas 3</option>
                <option value="Kelas VIP">Kelas VIP</option>
                <option value="Kelas VVIP">Kelas VVIP</option>
             </select>
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
                <th>Kategori Kelas</th>
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
                  <p class="mt-2 text-muted small">Memuat data tarif rawat inap...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="14" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif rawat inap.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kd_jenis_prw" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kd_jenis_prw }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.8rem; white-space: normal; min-width: 250px;">{{ item.nm_perawatan }}</td>
                <td>
                  <div class="small fw-bold" :class="getKelasColor(item.kelas)">{{ item.kelas }}</div>
                  <div class="small text-muted"><i class="fas fa-hospital-alt me-1"></i>{{ item.bangsal?.nm_bangsal || item.kd_bangsal }}</div>
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
                  <button class="btn btn-sm btn-light text-primary me-1" title="Edit" @click="openModal('edit', item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger" title="Nonaktifkan" @click="confirmDelete(item)">
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
    <div class="modal fade" id="modalTarifRanap" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          <div class="modal-header bg-purple-subtle border-0 py-3">
            <h5 class="modal-title fw-bold text-purple d-flex align-items-center">
              <i class="fas fa-stethoscope me-2"></i>
              {{ modalMode === 'add' ? 'Tambah Tarif Rawat Inap' : 'Edit Tarif Rawat Inap' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <form @submit.prevent="saveData">
              <div class="row g-3">
                <div class="col-md-6" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Kode Perawatan</label>
                  <input v-model="form.kd_jenis_prw" type="text" class="form-control" required>
                </div>
                <div class="col-md-6" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Kategori Perawatan</label>
                  <select v-model="form.kd_kategori" class="form-select" required>
                    <option value="" disabled>Pilih Kategori...</option>
                    <option v-for="kat in listKategori" :key="kat.kd_kategori" :value="kat.kd_kategori">
                      {{ kat.nm_kategori }} ({{ kat.kd_kategori }})
                    </option>
                  </select>
                </div>
                <div class="col-12" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Nama Perawatan</label>
                  <input v-model="form.nm_perawatan" type="text" class="form-control" required>
                </div>
                <div class="col-md-4" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Kelas Tarif</label>
                  <select v-model="form.kelas" class="form-select" required>
                    <option value="" disabled>Pilih Kelas...</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas VIP">Kelas VIP</option>
                    <option value="Kelas VVIP">Kelas VVIP</option>
                  </select>
                </div>
                <div class="col-md-4" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Bangsal</label>
                  <select v-model="form.kd_bangsal" class="form-select" required>
                    <option value="" disabled>Pilih Bangsal...</option>
                    <option v-for="bgs in listBangsal" :key="bgs.kd_bangsal" :value="bgs.kd_bangsal">
                      {{ bgs.nm_bangsal }} ({{ bgs.kd_bangsal }})
                    </option>
                  </select>
                </div>
                <div class="col-md-4" v-if="modalMode === 'add'">
                  <label class="form-label small fw-bold">Penjab</label>
                  <select v-model="form.kd_pj" class="form-select" required>
                    <option value="" disabled>Pilih Penjab...</option>
                    <option v-for="pj in listPenjab" :key="pj.kd_pj" :value="pj.kd_pj">
                      {{ pj.png_jawab }} ({{ pj.kd_pj }})
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
const listBangsal = ref([])
const listPenjab = ref([])
const modalMode = ref('add')
const saving = ref(false)
let modalInstance = null

const form = reactive({
  kd_jenis_prw: '',
  nm_perawatan: '',
  kd_kategori: '',
  kelas: '',
  kd_bangsal: '',
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

// Total fields are manually editable as per user request
// No longer using watch to auto-calculate to prevent overwriting database values during edit

const resetForm = () => {
  form.kd_jenis_prw = ''
  form.nm_perawatan = ''
  form.kd_kategori = ''
  form.kelas = ''
  form.kd_bangsal = ''
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
      const res = await keuanganTarifService.getNextKodeRanap()
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
      kelas: item.kelas || '',
      kd_bangsal: item.kd_bangsal || item.bangsal?.kd_bangsal || '',
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
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifRanap'))
  }
  modalInstance.show()
}

const saveData = async () => {
  saving.value = true
  try {
    let res;
    if (modalMode.value === 'add') {
      res = await keuanganTarifService.postTarifRanap(form)
    } else {
      res = await keuanganTarifService.putTarifRanap(form.kd_jenis_prw, form)
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
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTarifRanap(item.kd_jenis_prw)
        if (res.data.success) {
          toast.success(res.data.message || 'Data dinonaktifkan')
          fetchData()
        } else {
          toast.error(res.data.message || 'Gagal menonaktifkan')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
      }
    }
  })
}

const filters = reactive({
  keyword: '',
  kelas: '',
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

const getKelasColor = (kelas) => {
  if (kelas.includes('VIP')) return 'text-warning'
  if (kelas.includes('1')) return 'text-primary'
  if (kelas.includes('2')) return 'text-info'
  if (kelas.includes('3')) return 'text-secondary'
  return 'text-dark'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifRanap(filters)
    if (res.data.success) {
      const respData = res.data.data
      items.value = respData.data || []
      
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
    console.error('Error fetching tarif ranap', error)
    if (error.response?.status === 404) {
       // Mock data if API is not yet available for demonstration
       items.value = [
          { kd_jenis_prw: 'RI001', nm_perawatan: 'Visite Dokter Umum Kls 1', kd_bangsal: 'B01', kelas: 'Kelas 1', total_byrdr: 50000, total_byrpr: 0, total_byrdrpr: 50000, status: '1' },
          { kd_jenis_prw: 'RI002', nm_perawatan: 'Akomodasi Kamar VIP', kd_bangsal: 'BV', kelas: 'Kelas VIP', total_byrdr: 0, total_byrpr: 50000, total_byrdrpr: 500000, status: '1' },
          { kd_jenis_prw: 'RI003', nm_perawatan: 'Tindakan Keperawatan Sedang Kls 3', kd_bangsal: 'B03', kelas: 'Kelas 3', total_byrdr: 0, total_byrpr: 25000, total_byrdrpr: 25000, status: '1' }
       ]
    } else {
       toast.error('Gagal mengambil data tarif rawat inap')
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

const fetchBangsal = async () => {
  try {
    const res = await keuanganTarifService.getBangsal()
    if (res.data.success) {
      listBangsal.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching bangsal', error)
  }
}

onMounted(() => {
  fetchData()
  fetchKategori()
  fetchPenjab()
  fetchBangsal()
})
</script>

<style scoped>
/* Resembling TabTarifRalan styles but with color variations */
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
.bg-purple-subtle { background-color: #f3e8ff; }
.text-purple { color: #9333ea; }
.premium-search-wrapper {
  position: relative;
  width: 300px;
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
.premium-select-pill {
  border-radius: 50px;
  height: 42px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  min-width: 150px;
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
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }
</style>
