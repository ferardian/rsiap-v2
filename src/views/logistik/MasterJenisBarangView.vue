<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <!-- Controls -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div class="d-flex gap-2">
            <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" @click="openModal('create')">
                <i class="fas fa-plus-circle"></i> 
                <span class="fw-medium">Tambah Jenis</span>
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
              <th width="20%" class="ps-4 fw-semibold text-uppercase small ls-wide">Kode Jenis</th>
              <th class="fw-semibold text-uppercase small ls-wide">Nama Jenis</th>
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
                    <i class="fas fa-boxes fa-3x text-muted mb-3 opacity-50"></i>
                    <p class="text-muted mb-0">Belum ada data jenis barang.</p>
                </td>
            </tr>
            <tr v-for="item in items" :key="item.kd_jenis" class="transition-hover">
              <td class="ps-4">
                <span class="badge bg-light text-dark border px-3 py-2 font-monospace">
                    {{ item.kd_jenis }}
                </span>
              </td>
              <td class="fw-medium text-dark">{{ item.nm_jenis }}</td>
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
    <div class="modal fade" id="jenisModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">{{ formMode === 'create' ? 'Tambah Jenis' : 'Edit Jenis' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="mb-3">
              <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Kode Jenis</label>
              <input type="text" class="form-control" v-model="form.kd_jenis" :disabled="formMode === 'edit'" maxlength="5">
              <small class="text-muted" v-if="formMode==='create'">Maksimal 5 karakter.</small>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold text-uppercase text-muted ls-wide">Nama Jenis</label>
              <input type="text" class="form-control" v-model="form.nm_jenis">
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
  kd_jenis: '',
  nm_jenis: ''
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {}
        if (search.value) params.search = search.value
        
        const res = await logistikService.getJenisBarang(params)
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

const openModal = async (mode, item = null) => {
    formMode.value = mode
    if (mode === 'edit' && item) {
        form.kd_jenis = item.kd_jenis
        form.nm_jenis = item.nm_jenis
        modal.show()
    } else {
        form.kd_jenis = ''
        form.nm_jenis = ''
        modal.show()
        
        // Auto fetch next code
        try {
            const res = await logistikService.getNextJenisCode()
            if(res.data && res.data.data && res.data.data.next_code) {
                form.kd_jenis = res.data.data.next_code
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
    if (!form.kd_jenis || !form.nm_jenis) {
        toast.warning('Mohon lengkapi data')
        return
    }

    saving.value = true
    try {
        if (formMode.value === 'create') {
            await logistikService.createJenisBarang(form)
            toast.success('Berhasil ditambahkan')
        } else {
            await logistikService.updateJenisBarang(form.kd_jenis, form)
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
    if (confirm(`Yakin hapus jenis ${item.nm_jenis}?`)) {
        try {
            await logistikService.deleteJenisBarang(item.kd_jenis)
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
