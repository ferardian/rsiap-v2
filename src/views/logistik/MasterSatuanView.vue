<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <!-- Controls -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div class="d-flex gap-2">
            <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" @click="openModal('create')">
                <i class="fas fa-plus-circle"></i> 
                <span class="fw-medium">Tambah Satuan</span>
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
                  placeholder="Cari kode atau nama..." 
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
              <th width="20%" class="ps-4 fw-semibold text-uppercase small ls-wide">Kode</th>
              <th class="fw-semibold text-uppercase small ls-wide">Nama Satuan</th>
              <th width="15%" class="text-center fw-semibold text-uppercase small ls-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
                <td colspan="3" class="text-center py-5">
                    <div class="spinner-border text-primary sm" role="status"></div>
                    <div class="mt-2 text-muted small">Memuat data...</div>
                </td>
            </tr>
            <tr v-else-if="items.length === 0">
                <td colspan="3" class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
                    <p class="text-muted mb-0">Belum ada data satuan.</p>
                </td>
            </tr>
            <tr v-for="item in items" :key="item.kode_sat" class="transition-hover">
              <td class="ps-4">
                <span class="badge bg-light text-dark border px-3 py-2 font-monospace">
                    {{ item.kode_sat }}
                </span>
              </td>
              <td class="fw-medium text-dark">{{ item.satuan }}</td>
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
    <div class="modal fade" id="satuanModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">{{ formMode === 'create' ? 'Tambah Satuan' : 'Edit Satuan' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="mb-3">
              <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Kode Satuan</label>
              <input type="text" class="form-control" v-model="form.kode_sat" :disabled="formMode === 'edit'" maxlength="4">
              <small class="text-muted" v-if="formMode==='create'">Maksimal 4 karakter.</small>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Nama Satuan</label>
              <input type="text" class="form-control" v-model="form.satuan">
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
  kode_sat: '',
  satuan: ''
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {}
        if (search.value) params.search = search.value
        
        const res = await logistikService.getSatuan(params)
        // Handle pagination response structure
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

const openModal = (mode, item = null) => {
    formMode.value = mode
    if (mode === 'edit' && item) {
        form.kode_sat = item.kode_sat
        form.satuan = item.satuan
    } else {
        form.kode_sat = ''
        form.satuan = ''
    }
    modal.show()
}

const closeModal = () => {
    modal.hide()
}

const save = async () => {
    if (!form.kode_sat || !form.satuan) {
        toast.warning('Mohon lengkapi data')
        return
    }

    saving.value = true
    try {
        if (formMode.value === 'create') {
            await logistikService.createSatuan(form)
            toast.success('Berhasil ditambahkan')
        } else {
            await logistikService.updateSatuan(form.kode_sat, form)
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
    if (confirm(`Yakin hapus satuan ${item.satuan}?`)) {
        try {
            await logistikService.deleteSatuan(item.kode_sat)
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
