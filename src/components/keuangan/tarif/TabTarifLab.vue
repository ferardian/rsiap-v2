<template>
  <div class="tab-tarif-lab">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold d-flex align-items-center">
            <div class="icon-box bg-info-subtle text-info rounded-3 p-2 me-3">
              <i class="fas fa-flask"></i>
            </div>
            Tarif Laboratorium
          </h5>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <button class="btn btn-success premium-btn-sm me-2" @click="openModal('add')">
              <i class="fas fa-plus me-1"></i> Tambah Data
            </button>
            <select v-model="filters.kategori" class="form-select premium-input-sm" style="min-width: 150px;">
              <option value="">Semua Kategori</option>
              <option value="PK">Patologi Klinik (PK)</option>
              <option value="PA">Patologi Anatomi (PA)</option>
              <option value="MB">Mikrobiologi (MB)</option>
            </select>
            <select v-model="filters.kelas" class="form-select premium-input-sm" style="min-width: 150px;">
              <option value="">Semua Kelas</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas VIP">Kelas VIP</option>
              <option value="Kelas VVIP">Kelas VVIP</option>
            </select>
            <div class="search-box">
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control premium-input-sm" 
                placeholder="Cari nama pemeriksaan / kode..."
                @keyup.enter="fetchData"
              >
            </div>
            <button class="btn btn-primary premium-btn-sm" @click="fetchData" :disabled="loading">
              <i class="fas fa-search me-1"></i> Cari
            </button>
          </div>
        </div>

        <div class="table-responsive premium-table">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Pemeriksaan</th>
                <th>Kategori & Kelas</th>
                <th class="text-end">Tarif Dr</th>
                <th class="text-end">Tarif Pr</th>
                <th class="text-end">Total</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-info spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif lab...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif laboratorium.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kd_jenis_prw" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kd_jenis_prw }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.8rem; white-space: normal; min-width: 250px;">{{ item.nm_perawatan }}</td>
                <td>
                  <div class="small fw-bold text-info">{{ getKategoriName(item.kategori) }}</div>
                  <div class="small text-muted">{{ item.kelas }}</div>
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.tarif_tindakan_dokter) }}
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.tarif_tindakan_petugas) }}
                </td>
                <td class="text-end">
                  <span class="fw-bold text-success">{{ formatRupiah(item.total_byr) }}</span>
                </td>
                <td class="text-center">
                  <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-sm btn-outline-info" title="Template Pemeriksaan" @click="openTemplateModal(item)">
                      <i class="fas fa-list-ul"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" title="Edit Tarif" @click="openModal('edit', item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Hapus Tarif" @click="handleDelete(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
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

    <!-- Modal Lab -->
    <div class="modal fade" id="modalTarifLab" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold">
              {{ modalMode === 'add' ? 'Tambah' : 'Edit' }} Tarif Laboratorium
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveTarif">
              <div class="row g-3">
                <!-- Master Data -->
                <div class="col-md-3">
                  <label class="form-label small fw-bold text-muted mb-1">Kode Paket</label>
                  <input v-model="form.kd_jenis_prw" type="text" class="form-control premium-input text-uppercase" required :disabled="modalMode === 'edit'">
                </div>
                <div class="col-md-9">
                  <label class="form-label small fw-bold text-muted mb-1">Nama Pemeriksaan</label>
                  <input v-model="form.nm_perawatan" type="text" class="form-control premium-input" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Kategori</label>
                  <select v-model="form.kategori" class="form-select premium-input" required>
                    <option value="PK">Patologi Klinik (PK)</option>
                    <option value="PA">Patologi Anatomi (PA)</option>
                    <option value="MB">Mikrobiologi (MB)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Kelas</label>
                  <select v-model="form.kelas" class="form-select premium-input" required>
                    <option value="-">-</option>
                    <option value="Rawat Jalan">Rawat Jalan</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas Utama">Kelas Utama</option>
                    <option value="Kelas VIP">Kelas VIP</option>
                    <option value="Kelas VVIP">Kelas VVIP</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Penjab / Bayar</label>
                  <select v-model="form.kd_pj" class="form-select premium-input" required>
                    <option v-for="pj in penjabList" :key="pj.kd_pj" :value="pj.kd_pj">{{ pj.png_jawab }}</option>
                  </select>
                </div>

                <!-- Fees Section -->
                <div class="col-12 mt-4 mb-2">
                  <h6 class="fw-bold text-info border-bottom pb-2 text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.05em;">Rincian Biaya Paket</h6>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Bagian RS</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.bagian_rs" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">BHP</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.bhp" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Tarif Perujuk</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.tarif_perujuk" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Tarif Dokter</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.tarif_tindakan_dokter" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Tarif Petugas</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.tarif_tindakan_petugas" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">KSO</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.kso" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted mb-1">Menejemen</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">Rp</span>
                    <input v-model.number="form.menejemen" type="number" class="form-control premium-input border-start-0" @input="calculateTotal">
                  </div>
                </div>
                <div class="col-md-8">
                  <label class="form-label small fw-bold text-info mb-1">Total Tarif</label>
                  <div class="input-group">
                    <span class="input-group-text bg-info-subtle text-info border-end-0 border-info-subtle">Rp</span>
                    <input v-model.number="form.total_byr" type="number" class="form-control premium-input border-start-0 border-info-subtle fw-bold text-info shadow-none bg-info-subtle">
                  </div>
                </div>
              </div>

              <div class="modal-footer border-0 px-0 mt-4">
                <button type="button" class="btn btn-light premium-btn" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary premium-btn" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                  {{ modalMode === 'add' ? 'Simpan Data' : 'Update Data' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Template Lab -->
    <div class="modal fade" id="modalTemplateLab" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 class="modal-title fw-bold">Template Pemeriksaan</h5>
              <p class="small text-muted mb-0">{{ activeTarif?.nm_perawatan || '-' }} ({{ activeTarif?.kd_jenis_prw }})</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-4">
              <!-- Form Template -->
              <div class="col-lg-4">
                <div class="card bg-light border-0" style="border-radius: 15px;">
                  <div class="card-body p-4">
                    <h6 class="fw-bold mb-3">{{ templateMode === 'add' ? 'Tambah' : 'Edit' }} Item Template</h6>
                    <form @submit.prevent="saveTemplate">
                      <div class="row g-2">
                        <div class="col-12">
                          <label class="form-label small fw-bold text-muted mb-1">Nama Pemeriksaan</label>
                          <input v-model="templateForm.Pemeriksaan" type="text" class="form-control premium-input" required>
                        </div>
                        <div class="col-8">
                          <label class="form-label small fw-bold text-muted mb-1">Satuan</label>
                          <input v-model="templateForm.satuan" type="text" class="form-control premium-input" required placeholder="misal: g/dL">
                        </div>
                        <div class="col-4">
                          <label class="form-label small fw-bold text-muted mb-1">Urutan</label>
                          <input v-model.number="templateForm.urut" type="number" class="form-control premium-input">
                        </div>
                        
                        <div class="col-12 mt-2">
                          <label class="form-label small fw-bold text-info mb-1">Nilai Rujukan</label>
                          <div class="row g-2">
                             <div class="col-6">
                               <label class="small text-muted mb-0" style="font-size: 0.65rem; display: block;">Laki Dewasa (LD)</label>
                               <input v-model="templateForm.nilai_rujukan_ld" type="text" class="form-control premium-input-sm" placeholder="-">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted mb-0" style="font-size: 0.65rem; display: block;">Laki Anak (LA)</label>
                               <input v-model="templateForm.nilai_rujukan_la" type="text" class="form-control premium-input-sm" placeholder="-">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted mb-0" style="font-size: 0.65rem; display: block;">Pr. Dewasa (PD)</label>
                               <input v-model="templateForm.nilai_rujukan_pd" type="text" class="form-control premium-input-sm" placeholder="-">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted mb-0" style="font-size: 0.65rem; display: block;">Pr. Anak (PA)</label>
                               <input v-model="templateForm.nilai_rujukan_pa" type="text" class="form-control premium-input-sm" placeholder="-">
                             </div>
                          </div>
                        </div>

                        <div class="col-12 mt-2">
                           <label class="form-label small fw-bold text-info mb-1">Rincian Biaya Item</label>
                           <div class="row g-2">
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">Bagian RS</label>
                               <input v-model.number="templateForm.bagian_rs" type="number" class="form-control premium-input-sm" @input="calcTemplateTotal">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">BHP</label>
                               <input v-model.number="templateForm.bhp" type="number" class="form-control premium-input-sm" @input="calcTemplateTotal">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">Perujuk</label>
                               <input v-model.number="templateForm.bagian_perujuk" type="number" class="form-control premium-input-sm" @input="calcTemplateTotal">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">Dokter</label>
                               <input v-model.number="templateForm.bagian_dokter" type="number" class="form-control premium-input-sm" @input="calcTemplateTotal">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">Laborat</label>
                               <input v-model.number="templateForm.bagian_laborat" type="number" class="form-control premium-input-sm" @input="calcTemplateTotal">
                             </div>
                             <div class="col-6">
                               <label class="small text-muted" style="font-size: 0.7rem;">Total</label>
                               <input v-model.number="templateForm.biaya_item" type="number" class="form-control premium-input-sm fw-bold bg-white" readonly>
                             </div>
                           </div>
                        </div>

                        <div class="col-12 mt-4 d-flex gap-2">
                          <button type="submit" class="btn btn-primary flex-fill premium-btn-sm" :disabled="loadingTemplate">
                            <i class="fas fa-save me-1"></i> {{ templateMode === 'add' ? 'Tambahkan' : 'Update' }}
                          </button>
                          <button v-if="templateMode === 'edit'" type="button" class="btn btn-outline-secondary flex-fill premium-btn-sm" @click="resetTemplateForm">
                            Batal Edit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <!-- List Template -->
              <div class="col-lg-8">
                <div class="table-responsive premium-table border shadow-none" style="max-height: 500px;">
                  <table class="table align-middle table-sm">
                    <thead>
                      <tr>
                        <th width="40">Urut</th>
                        <th>Pemeriksaan</th>
                        <th>Satuan</th>
                        <th>Rujukan (LD/LA/PD/PA)</th>
                        <th class="text-end">Biaya</th>
                        <th class="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loadingTemplateList">
                        <td colspan="6" class="text-center py-5"><div class="spinner-border text-info spinner-sm"></div></td>
                      </tr>
                      <tr v-else-if="templateList.length === 0">
                        <td colspan="6" class="text-center py-5 text-muted small">Belum ada template pemeriksaan.</td>
                      </tr>
                      <tr v-for="temp in templateList" :key="temp.id_template" class="hover-row">
                        <td class="text-center small">{{ temp.urut }}</td>
                        <td class="fw-bold small">{{ temp.Pemeriksaan }}</td>
                        <td class="small">{{ temp.satuan }}</td>
                        <td class="small" style="font-size: 0.7rem;">
                          {{ temp.nilai_rujukan_ld }} / {{ temp.nilai_rujukan_la }} / {{ temp.nilai_rujukan_pd }} / {{ temp.nilai_rujukan_pa }}
                        </td>
                        <td class="text-end small fw-bold">{{ formatRupiah(temp.biaya_item) }}</td>
                        <td class="text-center">
                          <div class="d-flex gap-1 justify-content-center">
                            <button class="btn btn-sm btn-outline-primary" title="Edit Item" @click="editTemplate(temp)"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger" title="Hapus Item" @click="handleDeleteTemplate(temp)"><i class="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
const penjabList = ref([])

const filters = reactive({
  keyword: '',
  kategori: '',
  page: 1,
  kelas: ''
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

// === FORM TARIF LAB ===
const form = reactive({
  kd_jenis_prw: '',
  nm_perawatan: '',
  bagian_rs: 0,
  bhp: 0,
  tarif_perujuk: 0,
  tarif_tindakan_dokter: 0,
  tarif_tindakan_petugas: 0,
  kso: 0,
  menejemen: 0,
  total_byr: 0,
  kd_pj: '',
  status: '1',
  kelas: 'Rawat Jalan',
  kategori: 'PK'
})

const modalMode = ref('add')
let modalInstance = null

const resetForm = () => {
  Object.assign(form, {
    kd_jenis_prw: '',
    nm_perawatan: '',
    bagian_rs: 0,
    bhp: 0,
    tarif_perujuk: 0,
    tarif_tindakan_dokter: 0,
    tarif_tindakan_petugas: 0,
    kso: 0,
    menejemen: 0,
    total_byr: 0,
    kd_pj: penjabList.value.length > 0 ? penjabList.value[0].kd_pj : '',
    status: '1',
    kelas: 'Rawat Jalan',
    kategori: 'PK'
  })
}

const calculateTotal = () => {
  form.total_byr = 
    (parseFloat(form.bagian_rs) || 0) + 
    (parseFloat(form.bhp) || 0) + 
    (parseFloat(form.tarif_perujuk) || 0) + 
    (parseFloat(form.tarif_tindakan_dokter) || 0) + 
    (parseFloat(form.tarif_tindakan_petugas) || 0) + 
    (parseFloat(form.kso) || 0) + 
    (parseFloat(form.menejemen) || 0)
}

const openModal = async (mode, item = null) => {
  modalMode.value = mode
  resetForm()
  if (mode === 'edit' && item) {
    Object.keys(form).forEach(key => {
      if (item[key] !== undefined) {
        form[key] = (typeof form[key] === 'number') ? parseFloat(item[key]) || 0 : item[key]
      }
    })
  } else if (mode === 'add') {
    try {
      const res = await keuanganTarifService.getTarifLabNextKode({ prefix: 'J' })
      if (res.data.success) {
        form.kd_jenis_prw = res.data.data
      }
    } catch (error) {
      console.error('Error fetching next code', error)
    }
  }
  if (!modalInstance) {
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifLab'))
  }
  modalInstance.show()
}

const saveTarif = async () => {
  loading.value = true
  try {
    let res
    if (modalMode.value === 'add') {
      res = await keuanganTarifService.postTarifLab(form)
    } else {
      res = await keuanganTarifService.putTarifLab(form.kd_jenis_prw, form)
    }

    if (res.data.success) {
      toast.success(res.data.message)
      modalInstance.hide()
      fetchData()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan tarif laboratory')
  } finally {
    loading.value = false
  }
}

const handleDelete = (item) => {
  Swal.fire({
    title: 'Nonaktifkan Tarif?',
    text: `Anda akan menonaktifkan tarif ${item.nm_perawatan}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Nonaktifkan!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTarifLab(item.kd_jenis_prw)
        if (res.data.success) {
          toast.success(res.data.message)
          fetchData()
        }
      } catch (error) {
        toast.error('Gagal menonaktifkan tarif lab')
      }
    }
  })
}

// === TEMPLATE MANAGEMENT ===
const activeTarif = ref(null)
const templateList = ref([])
const loadingTemplate = ref(false)
const loadingTemplateList = ref(false)
const templateMode = ref('add')
let templateModalInstance = null

const templateForm = reactive({
  id_template: null,
  kd_jenis_prw: '',
  Pemeriksaan: '',
  satuan: '',
  nilai_rujukan_ld: '',
  nilai_rujukan_la: '',
  nilai_rujukan_pd: '',
  nilai_rujukan_pa: '',
  bagian_rs: 0,
  bhp: 0,
  bagian_perujuk: 0,
  bagian_dokter: 0,
  bagian_laborat: 0,
  kso: 0,
  menejemen: 0,
  biaya_item: 0,
  urut: 1
})

const resetTemplateForm = () => {
  templateMode.value = 'add'
  Object.assign(templateForm, {
    id_template: null,
    kd_jenis_prw: activeTarif.value?.kd_jenis_prw || '',
    Pemeriksaan: '',
    satuan: '',
    nilai_rujukan_ld: '-',
    nilai_rujukan_la: '-',
    nilai_rujukan_pd: '-',
    nilai_rujukan_pa: '-',
    bagian_rs: 0,
    bhp: 0,
    bagian_perujuk: 0,
    bagian_dokter: 0,
    bagian_laborat: 0,
    kso: 0,
    menejemen: 0,
    biaya_item: 0,
    urut: templateList.value.length + 1
  })
}

const calcTemplateTotal = () => {
  templateForm.biaya_item = 
    (parseFloat(templateForm.bagian_rs) || 0) + 
    (parseFloat(templateForm.bhp) || 0) + 
    (parseFloat(templateForm.bagian_perujuk) || 0) + 
    (parseFloat(templateForm.bagian_dokter) || 0) + 
    (parseFloat(templateForm.bagian_laborat) || 0) + 
    (parseFloat(templateForm.kso) || 0) + 
    (parseFloat(templateForm.menejemen) || 0)
}

const openTemplateModal = (item) => {
  activeTarif.value = item
  templateMode.value = 'add'
  fetchTemplates(item.kd_jenis_prw)
  if (!templateModalInstance) {
    templateModalInstance = new window.bootstrap.Modal(document.getElementById('modalTemplateLab'))
  }
  templateModalInstance.show()
}

const fetchTemplates = async (kd) => {
  loadingTemplateList.value = true
  try {
    const res = await keuanganTarifService.getTemplateLab(kd)
    if (res.data.success) {
      templateList.value = res.data.data
      resetTemplateForm()
    }
  } catch (error) {
    toast.error('Gagal mengambil template lab')
  } finally {
    loadingTemplateList.value = false
  }
}

const editTemplate = (item) => {
  templateMode.value = 'edit'
  Object.keys(templateForm).forEach(key => {
    if (item[key] !== undefined) {
      templateForm[key] = (typeof templateForm[key] === 'number') ? parseFloat(item[key]) || 0 : item[key]
    }
  })
}

const saveTemplate = async () => {
  loadingTemplate.value = true
  try {
    let res
    if (templateMode.value === 'add') {
      res = await keuanganTarifService.postTemplateLab(templateForm)
    } else {
      res = await keuanganTarifService.putTemplateLab(templateForm.id_template, templateForm)
    }
    if (res.data.success) {
      toast.success(res.data.message)
      fetchTemplates(activeTarif.value.kd_jenis_prw)
    }
  } catch (error) {
    toast.error('Gagal menyimpan template')
  } finally {
    loadingTemplate.value = false
  }
}

const handleDeleteTemplate = (item) => {
  Swal.fire({
    title: 'Hapus Item Template?',
    text: `Item ${item.Pemeriksaan} akan dihapus permanen`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Hapus!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await keuanganTarifService.deleteTemplateLab(item.id_template)
        if (res.data.success) {
          toast.success(res.data.message)
          fetchTemplates(activeTarif.value.kd_jenis_prw)
        }
      } catch (error) {
        toast.error('Gagal menghapus template')
      }
    }
  })
}

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const getKategoriName = (kategori) => {
  const map = { 'PK': 'Patologi Klinik', 'PA': 'Patologi Anatomi', 'MB': 'Mikrobiologi' }
  return map[kategori] || kategori
}

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0)
}

const fetchPenjab = async () => {
  try {
    const res = await keuanganTarifService.getPenjab()
    if (res.data.success) {
      penjabList.value = res.data.data
    }
  } catch (error) {
    console.error('Error fetching penjab', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifLab(filters)
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
    } else {
      items.value = []
    }
  } catch (error) {
    toast.error('Gagal mengambil data tarif laboratorium')
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPenjab()
  fetchData()
})
</script>

<style scoped>
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 16px; min-height: 500px; }
.icon-box { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
.premium-input-sm { border-radius: 8px; border: 1px solid #e2e8f0; padding: 0.45rem 0.8rem; font-size: 0.85rem; }
.premium-btn-sm { border-radius: 8px; padding: 0.45rem 1.2rem; font-size: 0.85rem; font-weight: 600; }
.premium-table { background: white; border-radius: 12px; border: 1px solid #f1f5f9; overflow: visible; }
.premium-table thead th { background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem; border-bottom: 2px solid #e2e8f0; }
.premium-table tbody td { padding: 1rem; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; }
.hover-row:hover { background-color: #f8fafc; transition: all 0.2s; }
.premium-input { border-radius: 10px; border: 1.5px solid #e2e8f0; padding: 0.6rem 1rem; font-size: 0.9rem; transition: all 0.2s; }
.premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); outline: none; }
.premium-btn { border-radius: 10px; padding: 0.6rem 1.5rem; font-weight: 600; transition: all 0.2s; }
.btn-xs { padding: 0.15rem 0.35rem; font-size: 0.7rem; border-radius: 5px; }
</style>
