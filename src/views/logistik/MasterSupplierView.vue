<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <!-- Controls -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div class="d-flex gap-2">
            <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" @click="openModal('create')">
                <i class="fas fa-plus-circle"></i> 
                <span class="fw-medium">Tambah Supplier</span>
            </button>
        </div>
        <div class="w-100 w-md-50 w-lg-25">
             <div class="input-group shadow-sm">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0 ps-2" 
                  placeholder="Cari kode, nama..." 
                  v-model="search"
                  @input="handleSearch"
                >
             </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive rounded-3 border">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light text-secondary">
            <tr>
              <th width="15%" class="ps-4 fw-semibold text-uppercase small ls-wide">Kode</th>
              <th class="fw-semibold text-uppercase small ls-wide">Supplier</th>
              <th class="fw-semibold text-uppercase small ls-wide">Kontak</th>
              <th class="fw-semibold text-uppercase small ls-wide">Bank</th>
              <th width="10%" class="text-center fw-semibold text-uppercase small ls-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                    <div class="spinner-border text-primary sm" role="status"></div>
                    <div class="mt-2 text-muted small">Memuat data...</div>
                </td>
            </tr>
            <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-5">
                    <i class="fas fa-truck-loading fa-3x text-muted mb-3 opacity-50"></i>
                    <p class="text-muted mb-0">Belum ada data supplier.</p>
                </td>
            </tr>
            <tr v-for="item in items" :key="item.kode_suplier" class="transition-hover">
              <td class="ps-4">
                <span class="badge bg-light text-dark border px-3 py-2 font-monospace">
                    {{ item.kode_suplier }}
                </span>
              </td>
              <td>
                <div class="fw-medium text-dark">{{ item.nama_suplier }}</div>
                <div class="small text-muted text-truncate" style="max-width: 200px;">
                    {{ item.alamat }}, {{ item.kota }}
                </div>
              </td>
              <td>
                <div v-if="item.no_telp">
                    <i class="fas fa-phone-alt text-muted small me-1"></i> {{ item.no_telp }}
                </div>
                <div v-else class="text-muted small">-</div>
              </td>
              <td>
                <div v-if="item.nama_bank">
                    <div class="fw-medium small">{{ item.nama_bank }}</div>
                    <div class="text-muted small">{{ item.rekening }}</div>
                </div>
                <div v-else class="text-muted small">-</div>
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
    <div class="modal fade" id="supplierModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">{{ formMode === 'create' ? 'Tambah Supplier' : 'Edit Supplier' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="row g-3">
                <!-- Kolom Kiri -->
                <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Kode Supplier</label>
                      <input type="text" class="form-control" v-model="form.kode_suplier" :disabled="formMode === 'edit'" maxlength="5">
                      <small class="text-muted" v-if="formMode==='create'">Otomatis diisi atau manual (Max 5).</small>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Nama Supplier <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" v-model="form.nama_suplier">
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">No Telepon</label>
                      <input type="text" class="form-control" v-model="form.no_telp" maxlength="13">
                    </div>
                </div>
                <!-- Kolom Kanan -->
                <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Alamat</label>
                      <textarea class="form-control" v-model="form.alamat" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Kota</label>
                      <input type="text" class="form-control" v-model="form.kota">
                    </div>
                    <div class="row">
                        <div class="col-6 mb-3">
                            <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Nama Bank</label>
                            <input type="text" class="form-control" v-model="form.nama_bank">
                        </div>
                        <div class="col-6 mb-3">
                            <label class="form-label small fw-bold text-uppercase text-muted ls-wide">No Rekening</label>
                            <input type="text" class="form-control" v-model="form.rekening">
                        </div>
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
const modalRef = ref(null)
let modal = null

const formMode = ref('create')
const saving = ref(false)
const form = reactive({
  kode_suplier: '',
  nama_suplier: '',
  alamat: '',
  kota: '',
  no_telp: '',
  nama_bank: '',
  rekening: ''
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {}
        if (search.value) params.search = search.value
        
        const res = await logistikService.getSuppliers(params)
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
        Object.assign(form, item) // Copy all fields
        modal.show()
    } else {
        // Reset form
        Object.keys(form).forEach(key => form[key] = '')
        modal.show()
        
        // Auto fetch next code
        try {
            const res = await logistikService.getNextSupplierCode()
            if(res.data && res.data.data && res.data.data.next_code) {
                form.kode_suplier = res.data.data.next_code
            }
        } catch(e) {
            console.error('Failed to generate code', e)
        }
    }
}

const closeModal = () => {
    modal.hide()
}

const save = async () => {
    if (!form.nama_suplier) {
        toast.warning('Nama & Kode Supplier wajib diisi')
        return
    }

    saving.value = true
    try {
        if (formMode.value === 'create') {
            await logistikService.createSupplier(form)
            toast.success('Berhasil ditambahkan')
        } else {
            await logistikService.updateSupplier(form.kode_suplier, form)
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
    if (confirm(`Yakin hapus supplier ${item.nama_suplier}?`)) {
        try {
            await logistikService.deleteSupplier(item.kode_suplier)
            toast.success('Berhasil dihapus')
            fetchData()
        } catch (err) {
            toast.error('Gagal menghapus')
        }
    }
}

onMounted(() => {
    modal = new Modal(modalRef.value)
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
