<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <!-- Controls -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div class="d-flex gap-2">
            <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" @click="openModal('create')">
                <i class="fas fa-plus-circle"></i> 
                <span class="fw-medium">Tambah Barang</span>
            </button>
            
            <select class="form-select w-auto shadow-sm" v-model="filterJenis" @change="fetchData">
                <option value="">Semua Jenis</option>
                <option v-for="j in jenisOptions" :key="j.kd_jenis" :value="j.kd_jenis">
                    {{ j.nm_jenis }}
                </option>
            </select>
        </div>
        <div class="w-100 w-md-50 w-lg-25">
             <div class="input-group shadow-sm">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0 ps-2" 
                  placeholder="Cari kode atau nama..." 
                  v-model="search"
                  @input="handleSearch"
                >
             </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive rounded-3 border" style="max-height: 75vh; overflow-y: auto;">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light text-secondary sticky-top" style="z-index: 1;">
            <tr>
              <th width="12%" class="ps-4 fw-semibold text-uppercase small ls-wide">Kode</th>
              <th class="fw-semibold text-uppercase small ls-wide">Nama Barang</th>
              <th width="15%" class="fw-semibold text-uppercase small ls-wide">Kategori</th>
              <th width="10%" class="fw-semibold text-uppercase small ls-wide text-end">Stok</th>
              <th width="15%" class="fw-semibold text-uppercase small ls-wide text-end">Harga</th>
              <th width="10%" class="text-center fw-semibold text-uppercase small ls-wide">Status</th>
              <th width="10%" class="text-center fw-semibold text-uppercase small ls-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary sm" role="status"></div>
                    <div class="mt-2 text-muted small">Memuat data...</div>
                </td>
            </tr>
            <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3 opacity-50"></i>
                    <p class="text-muted mb-0">Belum ada data barang.</p>
                </td>
            </tr>
            <tr v-for="item in items" :key="item.kode_brng" class="transition-hover">
              <td class="ps-4">
                <span class="badge bg-light text-dark border px-2 py-1 font-monospace">
                    {{ item.kode_brng }}
                </span>
              </td>
              <td>
                <div class="fw-medium text-dark">{{ item.nama_brng }}</div>
              </td>
              <td>
                <span class="badge bg-info bg-opacity-10 text-info px-2 py-1">
                    {{ item.jenis_barang?.nm_jenis || '-' }}
                </span>
              </td>
              <td class="text-end fw-medium">
                {{ item.stok }} <small class="text-muted">{{ item.satuan?.satuan }}</small>
              </td>
              <td class="text-end font-monospace">
                {{ formatCurrency(item.harga) }}
              </td>
              <td class="text-center">
                <span :class="['badge px-2 py-1', item.status === '1' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger']">
                    {{ item.status === '1' ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
              <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-light text-warning hover-scale" @click="openModal('edit', item)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger hover-scale" @click="confirmDelete(item)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
    <div class="modal fade" id="barangModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">{{ formMode === 'create' ? 'Tambah Barang' : 'Edit Barang' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Kode Barang <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.kode_brng" :disabled="formMode === 'edit'" maxlength="15">
                      <small class="text-muted" v-if="formMode==='create'">Maksimal 15 karakter.</small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Nama Barang <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.nama_brng">
                    </div>
                </div>

                <div class="col-md-6">
                     <div class="mb-3">
                        <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Jenis Barang <span class="text-danger">*</span></label>
                        <select class="form-select" v-model="form.jenis">
                            <option value="" disabled>Pilih Jenis</option>
                            <option v-for="j in jenisOptions" :key="j.kd_jenis" :value="j.kd_jenis">
                                {{ j.nm_jenis }}
                            </option>
                        </select>
                     </div>
                </div>
                <div class="col-md-6">
                     <div class="mb-3">
                        <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Satuan <span class="text-danger">*</span></label>
                        <select class="form-select" v-model="form.kode_sat">
                            <option value="" disabled>Pilih Satuan</option>
                            <option v-for="s in satuanOptions" :key="s.kode_sat" :value="s.kode_sat">
                                {{ s.satuan }}
                            </option>
                        </select>
                     </div>
                </div>

                <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Stok</label>
                      <input type="number" class="form-control" v-model="form.stok" min="0">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Harga</label>
                      <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input type="number" class="form-control" v-model="form.harga" min="0">
                      </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                         <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Status</label>
                         <select class="form-select" v-model="form.status">
                             <option value="1">Aktif</option>
                             <option value="0">Non-Aktif</option>
                         </select>
                    </div>
                </div>
            </div>
          </div>
          <div class="modal-footer border-top-0 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-light" @click="closeModal">Batal</button>
            <button type="button" class="btn btn-primary px-4" @click="save" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import logistikService from '@/services/logistikService'
import { Modal } from 'bootstrap'
import { useToast } from 'vue-toastification'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const search = ref('')
const filterJenis = ref('')

const jenisOptions = ref([])
const satuanOptions = ref([])

const modalRef = ref(null)
let modal = null

const formMode = ref('create')
const saving = ref(false)
const form = reactive({
  kode_brng: '',
  nama_brng: '',
  kode_sat: '',
  jenis: '',
  stok: 0,
  harga: 0,
  status: '1'
})

const fetchOptions = async () => {
    try {
        const [resJenis, resSatuan] = await Promise.all([
            logistikService.getJenisBarang({ limit: 1000 }), // Get all for dropdown
            logistikService.getSatuan({ limit: 1000 })
        ])
        
        // Handle paginated response structure if backend returns pagination
        jenisOptions.value = resJenis.data.data.data || resJenis.data.data || []
        satuanOptions.value = resSatuan.data.data.data || resSatuan.data.data || []
        
        // Check if data is inside an object with key 'data' (common in Laravel Resource) but above code handles Paginator 'data'
    } catch(e) {
        console.error('Failed to load options', e)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {}
        if (search.value) params.search = search.value
        if (filterJenis.value) params.jenis = filterJenis.value
        params.limit = 500 // Increase limit to show more items
        
        const res = await logistikService.getBarang(params)
        items.value = res.data.data.data || res.data.data
    } catch (err) {
        console.error(err)
        toast.error('Gagal memuat data')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
   setTimeout(fetchData, 500)
}

const openModal = async (mode, item = null) => {
    formMode.value = mode
    if (mode === 'edit' && item) {
        Object.assign(form, item)
        // Ensure status is string '1' or '0'
        form.status = String(item.status)
        modal.show()
    } else {
        Object.keys(form).forEach(key => form[key] = '')
        form.stok = 0
        form.harga = 0
        form.status = '1'
        modal.show()
        
        // Auto fetch next code
        try {
            const res = await logistikService.getNextBarangCode()
            // console.log('Auto Code Response:', res.data); // Debug
            if(res.data && res.data.data && res.data.data.next_code) {
                form.kode_brng = res.data.data.next_code
            } else {
                toast.warning('Gagal generate kode otomatis (Format data tidak sesuai)')
            }
        } catch(e) {
            console.error('Failed to generate code', e)
            toast.error('Gagal mengambil kode otomatis: ' + (e.response?.data?.message || e.message))
        }
    }
}

const closeModal = () => {
    modal.hide()
}

const save = async () => {
    if (!form.kode_brng || !form.nama_brng || !form.jenis || !form.kode_sat) {
        toast.warning('Mohon lengkapi data wajib (*)')
        return
    }

    saving.value = true
    try {
        if (formMode.value === 'create') {
            await logistikService.createBarang(form)
            toast.success('Berhasil ditambahkan')
        } else {
            await logistikService.updateBarang(form.kode_brng, form)
            toast.success('Berhasil diperbarui')
        }
        closeModal()
        fetchData()
    } catch (err) {
        console.error(err)
        toast.error('Gagal menyimpan: ' + (err.response?.data?.message || err.message))
    } finally {
        saving.value = false
    }
}

const confirmDelete = async (item) => {
    if (confirm(`Yakin hapus barang ${item.nama_brng}?`)) {
        try {
            await logistikService.deleteBarang(item.kode_brng)
            toast.success('Berhasil dihapus')
            fetchData()
        } catch (err) {
            toast.error('Gagal menghapus')
        }
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}

onMounted(() => {
    modal = new Modal(modalRef.value)
    fetchOptions()
    fetchData()
})
</script>

<style scoped>
.ls-wide {
    letter-spacing: 0.05em;
}
.hover-scale {
    transition: transform 0.2s ease;
}
.hover-scale:hover {
    transform: scale(1.1);
}
.transition-hover {
    transition: background-color 0.2s ease;
}
</style>
