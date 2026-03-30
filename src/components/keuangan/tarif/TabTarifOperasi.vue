<template>
  <div class="tab-tarif-operasi">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- Toolbar -->
        <div class="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold d-flex align-items-center">
            <div class="icon-box bg-danger-subtle text-danger rounded-3 p-2 me-3">
              <i class="fas fa-procedures"></i>
            </div>
            Tarif Paket Operasi
          </h5>
          <div class="d-flex flex-wrap gap-2 align-items-center w-100-mobile">
             <select v-model="filters.kategori" class="form-select premium-select-pill" style="min-width: 150px;">
                <option value="">Semua Kategori</option>
                <option value="Kebidanan">Kebidanan</option>
                <option value="Operasi">Operasi</option>
             </select>
             <select v-model="filters.kelas" class="form-select premium-select-pill" style="min-width: 150px;">
                <option value="">Semua Kelas</option>
                <option value="Rawat Jalan">Rawat Jalan</option>
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
                <th>Kategori & Kelas</th>
                <th class="text-end">Operator 1</th>
                <th class="text-end">Sewa OK</th>
                <th class="text-end">Alat</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif operasi...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif operasi.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kode_paket" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kode_paket }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.85rem; min-width: 200px; white-space: normal;">{{ item.nm_perawatan }}</td>
                <td>
                  <div class="small fw-bold text-primary">{{ item.kategori }}</div>
                  <div class="small text-muted">{{ item.kelas }}</div>
                </td>
                <td class="text-end numeric-text">{{ formatRupiah(item.operator1) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.sewa_ok) }}</td>
                <td class="text-end numeric-text">{{ formatRupiah(item.alat) }}</td>
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
    <div class="modal fade" id="modalTarifOperasi" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <div class="modal-header bg-danger-subtle border-0 py-3">
            <h5 class="modal-title fw-bold text-danger d-flex align-items-center">
              <i class="fas fa-procedures me-2"></i>
              {{ modalMode === 'add' ? 'Tambah Tarif Operasi' : 'Edit Tarif Operasi' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <form @submit.prevent="saveData">
              <div class="row g-3">
                <!-- Data Master -->
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Kode Paket</label>
                  <input v-model="form.kode_paket" type="text" class="form-control" :readonly="modalMode === 'edit'" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Nama Perawatan</label>
                  <input v-model="form.nm_perawatan" type="text" class="form-control" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-bold">Kategori</label>
                  <select v-model="form.kategori" class="form-select" required>
                    <option value="" disabled>Pilih Kategori...</option>
                    <option value="Kebidanan">Kebidanan</option>
                    <option value="Operasi">Operasi</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Kelas Tarif</label>
                  <select v-model="form.kelas" class="form-select" required>
                    <option value="" disabled>Pilih Kelas...</option>
                    <option value="Rawat Jalan">Rawat Jalan</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas VIP">Kelas VIP</option>
                    <option value="Kelas VVIP">Kelas VVIP</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Penjab / Bayar</label>
                  <select v-model="form.kd_pj" class="form-select" required>
                    <option value="" disabled>Pilih Penjab...</option>
                    <option v-for="pj in listPenjab" :key="pj.kd_pj" :value="pj.kd_pj">
                      {{ pj.png_jawab }} ({{ pj.kd_pj }})
                    </option>
                  </select>
                </div>

                <!-- Kelompok Biaya Operator -->
                <div class="col-12 mt-4"><h6 class="fw-bold text-uppercase border-start border-primary border-4 ps-2 small text-primary">I. Jasa Operator & Asisten</h6></div>
                <div class="col-md-4"><label class="form-label small">Operator 1</label><input v-model.number="form.operator1" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Operator 2</label><input v-model.number="form.operator2" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Operator 3</label><input v-model.number="form.operator3" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Asisten Op 1</label><input v-model.number="form.asisten_operator1" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Asisten Op 2</label><input v-model.number="form.asisten_operator2" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Asisten Op 3</label><input v-model.number="form.asisten_operator3" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Instrumen</label><input v-model.number="form.instrumen" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Perawat Luar</label><input v-model.number="form.perawat_luar" type="number" class="form-control premium-input-sm"></div>

                <!-- Kelompok Biaya Anak & Anestesi -->
                <div class="col-12 mt-4"><h6 class="fw-bold text-uppercase border-start border-success border-4 ps-2 small text-success">II. Jasa Anak & Anestesi</h6></div>
                <div class="col-md-4"><label class="form-label small">Dokter Anak</label><input v-model.number="form.dokter_anak" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Perawat Resusitas</label><input v-model.number="form.perawaat_resusitas" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Dr. PJ Anak</label><input v-model.number="form.dokter_pjanak" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-3"><label class="form-label small">Dokter Anestesi</label><input v-model.number="form.dokter_anestesi" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-3"><label class="form-label small">Asisten Anestesi 1</label><input v-model.number="form.asisten_anestesi" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-3"><label class="form-label small">Asisten Anestesi 2</label><input v-model.number="form.asisten_anestesi2" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-3"><label class="form-label small">Dokter Umum</label><input v-model.number="form.dokter_umum" type="number" class="form-control premium-input-sm"></div>

                <!-- Kelompok Biaya Bidan & Omloop -->
                <div class="col-12 mt-4"><h6 class="fw-bold text-uppercase border-start border-info border-4 ps-2 small text-info">III. Jasa Bidan & Omloop</h6></div>
                <div class="col-md-4"><label class="form-label small">Bidan 1</label><input v-model.number="form.bidan" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Bidan 2</label><input v-model.number="form.bidan2" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Bidan 3</label><input v-model.number="form.bidan3" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-2"><label class="form-label small">Omloop 1</label><input v-model.number="form.omloop" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-2"><label class="form-label small">Omloop 2</label><input v-model.number="form.omloop2" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-2"><label class="form-label small">Omloop 3</label><input v-model.number="form.omloop3" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-2"><label class="form-label small">Omloop 4</label><input v-model.number="form.omloop4" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-2"><label class="form-label small">Omloop 5</label><input v-model.number="form.omloop5" type="number" class="form-control premium-input-sm"></div>

                <!-- Kelompok Rumah Sakit & Sarana -->
                <div class="col-12 mt-4"><h6 class="fw-bold text-uppercase border-start border-warning border-4 ps-2 small text-warning">IV. Fasilitas RS & Sarana</h6></div>
                <div class="col-md-4"><label class="form-label small">Sewa OK/VK</label><input v-model.number="form.sewa_ok" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Alat</label><input v-model.number="form.alat" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Sewa VK (Akomodasi)</label><input v-model.number="form.akomodasi" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Bagian RS</label><input v-model.number="form.bagian_rs" type="number" class="form-control premium-input-sm"></div>
                <div class="col-md-4"><label class="form-label small">Sarpras</label><input v-model.number="form.sarpras" type="number" class="form-control premium-input-sm"></div>
              </div>
              <div class="mt-5 text-end border-top pt-3">
                <button type="button" class="btn btn-light me-2 rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary rounded-pill px-5" :disabled="saving">
                  <i class="fas fa-save me-1" v-if="!saving"></i>
                  <span class="spinner-border spinner-border-sm me-1" v-if="saving"></span>
                  Simpan Perubahan
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
import { ref, reactive, onMounted } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()
const loading = ref(false)
const items = ref([])
const listPenjab = ref([])
const saving = ref(false)
const modalMode = ref('add')
let modalInstance = null

const form = reactive({
  kode_paket: '', nm_perawatan: '', kategori: '', kelas: '', kd_pj: '',
  operator1: 0, operator2: 0, operator3: 0,
  asisten_operator1: 0, asisten_operator2: 0, asisten_operator3: 0,
  instrumen: 0, dokter_anak: 0, perawaat_resusitas: 0,
  dokter_anestesi: 0, asisten_anestesi: 0, asisten_anestesi2: 0,
  bidan: 0, bidan2: 0, bidan3: 0,
  perawat_luar: 0, sewa_ok: 0, alat: 0, akomodasi: 0, bagian_rs: 0,
  omloop: 0, omloop2: 0, omloop3: 0, omloop4: 0, omloop5: 0,
  sarpras: 0, dokter_pjanak: 0, dokter_umum: 0,
  status: '1'
})

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'status') form[key] = '1'
    else if (['kode_paket', 'nm_perawatan', 'kategori', 'kelas', 'kd_pj'].includes(key)) form[key] = ''
    else form[key] = 0
  })
}

const filters = reactive({ keyword: '', kategori: '', kelas: '', page: 1 })

const pagination = reactive({
  current_page: 1, last_page: 1, from: 0, to: 0, total: 0,
  prev_page_url: null, next_page_url: null
})

const openModal = async (mode, item = null) => {
  modalMode.value = mode
  resetForm()
  if (mode === 'edit' && item) {
    Object.keys(form).forEach(key => {
      if (item[key] !== undefined) {
        form[key] = (typeof form[key] === 'number') ? parseFloat(item[key]) || 0 : item[key]
      }
    })
    // Special mapping for akomodasi/sewa_vk if needed
    if (item.akomodasi !== undefined) form.akomodasi = parseFloat(item.akomodasi) || 0
  } else if (mode === 'add') {
    try {
      const res = await keuanganTarifService.getTarifOperasiNextKode({ prefix: 'PK0901' })
      if (res.data.success) {
        form.kode_paket = res.data.data
      }
    } catch (error) {
      console.error('Error fetching next code', error)
    }
  }
  if (!modalInstance) {
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifOperasi'))
  }
  modalInstance.show()
}

const saveData = async () => {
  saving.value = true
  try {
    let res = (modalMode.value === 'add') 
      ? await keuanganTarifService.postTarifOperasi(form)
      : await keuanganTarifService.putTarifOperasi(form.kode_paket, form)
    
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
    text: `Yakin ingin menonaktifkan kode ${item.kode_paket}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Nonaktifkan!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTarifOperasi(item.kode_paket)
        if (res.data.success) {
          toast.success(res.data.message || 'Data dinonaktifkan')
          fetchData()
        }
      } catch (error) { toast.error('Gagal menonaktifkan data') }
    }
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifOperasi(filters)
    if (res.data.success) {
      const respData = res.data.data
      items.value = respData.data || []
      Object.assign(pagination, {
        current_page: respData.current_page, last_page: respData.last_page,
        from: respData.from, to: respData.to, total: respData.total,
        prev_page_url: respData.prev_page_url, next_page_url: respData.next_page_url
      })
    }
  } catch (error) { console.error('Error fetching tarif operasi', error) }
  finally { loading.value = false }
}

const fetchPenjab = async () => {
  try {
    const res = await keuanganTarifService.getPenjab()
    if (res.data.success) listPenjab.value = res.data.data
  } catch (error) { console.error('Error fetching penjab', error) }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

onMounted(() => {
  fetchData()
  fetchPenjab()
})
</script>

<style scoped>
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 16px; }
.icon-box { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
.bg-danger-subtle { background-color: #fee2e2; }

.premium-search-wrapper { position: relative; width: 100%; max-width: 300px; }
.premium-search-wrapper .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.premium-search-input { border-radius: 50px; padding-left: 3rem; padding-right: 1.25rem; border: 1px solid #e2e8f0; height: 42px; font-size: 0.875rem; transition: all 0.2s; background-color: #f8fafc; }
.premium-search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); background-color: white; outline: none; }

.premium-select-pill { border-radius: 50px; height: 42px; padding: 0 1.25rem; font-size: 0.875rem; border: 1px solid #e2e8f0; background-color: #f8fafc; }

.premium-add-btn { border-radius: 50px; padding: 0 1.5rem; height: 42px; font-weight: 600; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; border: none; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1); }
.premium-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 12px -2px rgba(16, 185, 129, 0.2); }

.premium-table { background: white; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
.premium-table thead th { background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem; border-bottom: 2px solid #e2e8f0; }
.premium-table tbody td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; vertical-align: middle; }
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }

@media (max-width: 768px) {
  .w-100-mobile { width: 100% !important; }
  .premium-add-btn { width: 100%; }
}

.modal-xl { max-width: 1140px; }
.premium-input-sm { border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.85rem; height: 38px; }
</style>
