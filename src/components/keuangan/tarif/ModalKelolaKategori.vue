<template>
  <div class="modal fade" id="modalKelolaKategori" ref="modalEl" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 680px;">
      <div class="modal-content border shadow-sm rounded-3">
        <!-- Modal Header: Clean White Tone -->
        <div class="modal-header bg-white border-bottom py-3 px-4">
          <div class="d-flex align-items-center gap-2.5">
            <div class="header-icon-clean rounded-2">
              <i class="fas fa-tags text-secondary"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h6 class="modal-title fw-bold text-dark m-0">Kelola Kategori Perawatan</h6>
                <span class="badge bg-slate-100 text-slate-700 border font-monospace fs-xxs">
                  {{ categories.length }} Data
                </span>
              </div>
              <p class="text-muted fs-xs m-0 mt-0.5">Tambah, ubah nama, atau hapus kategori tindakan perawatan</p>
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-3.5 bg-slate-50">
          <!-- Form Tambah / Edit Kategori -->
          <div class="card border rounded-3 p-3 mb-3 bg-white shadow-none">
            <div class="d-flex justify-content-between align-items-center mb-2.5">
              <span class="fs-xs fw-bold text-uppercase text-secondary tracking-wider d-flex align-items-center gap-1.5">
                <i :class="editMode ? 'fas fa-edit text-primary' : 'fas fa-plus-circle text-primary'"></i>
                {{ editMode ? 'Edit Kategori Perawatan' : 'Tambah Kategori Baru' }}
              </span>
              <button 
                v-if="editMode" 
                type="button"
                class="btn btn-link p-0 text-secondary text-decoration-none fs-xs"
                @click="cancelEdit"
              >
                <i class="fas fa-times me-1"></i>Batal Edit
              </button>
            </div>

            <form @submit.prevent="submitForm">
              <div class="row g-2 align-items-end">
                <div class="col-auto" style="width: 140px;">
                  <label class="form-label fs-xxs fw-semibold text-secondary mb-1">Kode</label>
                  <div class="input-group input-group-sm flex-nowrap" style="width: 100%;">
                    <input 
                      v-model="form.kd_kategori" 
                      type="text" 
                      class="form-control font-monospace fw-bold text-uppercase px-2 text-center" 
                      placeholder="KPxxx"
                      maxlength="5"
                      :readonly="editMode"
                      required
                      style="flex: 1 1 auto; width: 90px; min-width: 0;"
                    >
                    <button 
                      v-if="!editMode"
                      type="button" 
                      class="btn btn-light border border-start-0 text-secondary px-2" 
                      @click="fetchNextCode"
                      title="Generate Kode Otomatis"
                      :disabled="generatingCode"
                      style="flex: 0 0 36px; width: 36px; max-width: 36px;"
                    >
                      <i class="fas fa-sync-alt fs-xxs" :class="{ 'fa-spin': generatingCode }"></i>
                    </button>
                  </div>
                </div>
                <div class="col">
                  <label class="form-label fs-xxs fw-semibold text-secondary mb-1">Nama Kategori</label>
                  <input 
                    v-model="form.nm_kategori" 
                    type="text" 
                    class="form-control form-control-sm" 
                    placeholder="Contoh: Administrasi, Rawat Darurat..."
                    required
                  >
                </div>
                <div class="col-auto">
                  <button 
                    type="submit" 
                    class="btn btn-sm btn-primary px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
                    :disabled="submitting"
                    style="width: auto !important;"
                  >
                    <span v-if="submitting" class="spinner-border spinner-border-sm"></span>
                    <template v-else>
                      <i :class="editMode ? 'fas fa-check' : 'fas fa-save'"></i>
                      <span>{{ editMode ? 'Perbarui' : 'Simpan' }}</span>
                    </template>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- List Kategori & Search -->
          <div class="card border rounded-3 overflow-hidden bg-white shadow-none">
            <div class="p-2.5 border-bottom d-flex justify-content-between align-items-center gap-2 flex-wrap bg-white">
              <span class="fs-xs fw-bold text-secondary text-uppercase tracking-wider">
                Daftar Kategori
              </span>
              <div class="input-group input-group-sm flex-nowrap" style="max-width: 220px;">
                <span class="input-group-text bg-light border-end-0 text-muted px-2"><i class="fas fa-search fs-xxs"></i></span>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  class="form-control border-start-0 ps-1" 
                  placeholder="Cari kategori..."
                >
                <button 
                  v-if="searchQuery" 
                  class="btn btn-light border border-start-0 text-muted" 
                  type="button" 
                  @click="searchQuery = ''"
                >
                  <i class="fas fa-times fs-xxs"></i>
                </button>
              </div>
            </div>

            <!-- Table List -->
            <div class="table-responsive custom-scrollbar" style="max-height: 280px;">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.835rem;">
                <thead class="bg-light sticky-top">
                  <tr class="text-secondary fs-xxs text-uppercase fw-bold">
                    <th style="width: 90px;" class="ps-3">Kode</th>
                    <th>Nama Kategori</th>
                    <th style="width: 80px;" class="text-center pe-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingCategories">
                    <td colspan="3" class="text-center py-4 text-muted">
                      <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
                      Memuat daftar kategori...
                    </td>
                  </tr>
                  <tr v-else-if="filteredCategories.length === 0">
                    <td colspan="3" class="text-center py-4 text-muted">
                      <i class="fas fa-inbox fa-2x mb-2 text-secondary opacity-50 d-block"></i>
                      Tidak ada kategori ditemukan
                    </td>
                  </tr>
                  <tr 
                    v-for="cat in filteredCategories" 
                    :key="cat.kd_kategori"
                    :class="{ 'bg-primary-subtle': form.kd_kategori === cat.kd_kategori && editMode }"
                  >
                    <td class="ps-3">
                      <span class="badge bg-light text-slate-700 border font-monospace px-1.5 py-0.5 fs-xxs">
                        {{ cat.kd_kategori }}
                      </span>
                    </td>
                    <td class="fw-medium text-dark">{{ cat.nm_kategori }}</td>
                    <td class="text-center pe-3">
                      <div class="d-inline-flex gap-1">
                        <button 
                          class="btn btn-sm btn-icon btn-ghost-primary" 
                          @click="startEdit(cat)"
                          title="Edit Nama Kategori"
                        >
                          <i class="fas fa-edit fs-xs"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-icon btn-ghost-danger" 
                          @click="confirmDelete(cat)"
                          title="Hapus Kategori"
                        >
                          <i class="fas fa-trash-alt fs-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-light border px-4" data-bs-dismiss="modal">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const emit = defineEmits(['kategori-updated', 'closed'])
const toast = useToast()
const modalEl = ref(null)

const categories = ref([])
const loadingCategories = ref(false)
const searchQuery = ref('')
const editMode = ref(false)
const submitting = ref(false)
const generatingCode = ref(false)
let modalInstance = null

const form = reactive({
  kd_kategori: '',
  nm_kategori: ''
})

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const q = searchQuery.value.toLowerCase().trim()
  return categories.value.filter(cat => 
    (cat.kd_kategori || '').toLowerCase().includes(q) ||
    (cat.nm_kategori || '').toLowerCase().includes(q)
  )
})

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const res = await keuanganTarifService.getKategoriPerawatan()
    if (res.data.success) {
      categories.value = res.data.data || []
    }
  } catch (error) {
    console.error('Gagal mengambil kategori:', error)
  } finally {
    loadingCategories.value = false
  }
}

const fetchNextCode = async () => {
  generatingCode.value = true
  try {
    const res = await keuanganTarifService.getNextKodeKategori()
    if (res.data.success) {
      form.kd_kategori = res.data.data
    }
  } catch (error) {
    toast.error('Gagal generate kode kategori otomatis')
  } finally {
    generatingCode.value = false
  }
}

const startEdit = (cat) => {
  editMode.value = true
  form.kd_kategori = cat.kd_kategori
  form.nm_kategori = cat.nm_kategori
}

const cancelEdit = () => {
  editMode.value = false
  form.kd_kategori = ''
  form.nm_kategori = ''
  fetchNextCode()
}

const submitForm = async () => {
  if (!form.kd_kategori || !form.nm_kategori) {
    toast.warning('Mohon isi kode dan nama kategori')
    return
  }

  submitting.value = true
  try {
    let res
    if (editMode.value) {
      res = await keuanganTarifService.putKategoriPerawatan(form.kd_kategori, {
        nm_kategori: form.nm_kategori
      })
    } else {
      res = await keuanganTarifService.postKategoriPerawatan({
        kd_kategori: form.kd_kategori,
        nm_kategori: form.nm_kategori
      })
    }

    if (res.data.success) {
      toast.success(res.data.message || 'Kategori berhasil disimpan')
      editMode.value = false
      form.nm_kategori = ''
      await fetchCategories()
      await fetchNextCode()
      emit('kategori-updated')
    } else {
      toast.error(res.data.message || 'Gagal menyimpan kategori')
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (cat) => {
  const result = await Swal.fire({
    title: 'Hapus Kategori?',
    html: `Apakah Anda yakin ingin menghapus kategori <b>${cat.nm_kategori}</b> (${cat.kd_kategori})?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      const res = await keuanganTarifService.deleteKategoriPerawatan(cat.kd_kategori)
      if (res.data.success) {
        toast.success('Kategori berhasil dihapus')
        await fetchCategories()
        if (editMode.value && form.kd_kategori === cat.kd_kategori) {
          cancelEdit()
        }
        emit('kategori-updated')
      } else {
        toast.error(res.data.message || 'Gagal menghapus kategori')
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menghapus kategori'
      Swal.fire({
        title: 'Tidak Dapat Dihapus',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      })
    }
  }
}

const openModal = () => {
  editMode.value = false
  form.nm_kategori = ''
  fetchCategories()
  fetchNextCode()
  if (!modalInstance && modalEl.value) {
    modalInstance = new window.bootstrap.Modal(modalEl.value)
    modalEl.value.addEventListener('hidden.bs.modal', () => {
      emit('closed')
    })
  }
  modalInstance?.show()
}

const hideModal = () => {
  modalInstance?.hide()
}

defineExpose({
  openModal,
  hideModal
})

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.header-icon-clean {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.fs-xxs {
  font-size: 0.72rem;
}

.fs-xs {
  font-size: 0.8rem;
}

.tracking-wider {
  letter-spacing: 0.04em;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.text-slate-700 {
  color: #334155;
}

.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-ghost-primary {
  color: #2563eb;
  background: transparent;
}
.btn-ghost-primary:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.btn-ghost-danger {
  color: #dc2626;
  background: transparent;
}
.btn-ghost-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
