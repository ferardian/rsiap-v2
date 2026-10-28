<template>
  <div class="tab-tarif-radiologi">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- 1. Clean Header Row: Title on Left, Action on Right -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="tab-header-icon bg-warning-subtle text-warning shadow-2xs">
              <i class="fas fa-x-ray text-warning-dark fa-lg"></i>
            </div>
            <div>
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                Tarif Radiologi
                <span class="badge bg-light text-secondary border px-2 py-0.5 fs-xs fw-semibold">
                  {{ pagination.total || 0 }} Tindakan
                </span>
              </h5>
              <p class="text-muted small m-0">Kelola master tarif pemeriksaan dan tindakan radiologi</p>
            </div>
          </div>
          <div>
            <button class="btn btn-primary premium-action-btn shadow-sm" @click="openModal('add')">
              <i class="fas fa-plus-circle me-1.5"></i> Tambah Data
            </button>
          </div>
        </div>

        <!-- 2. Clean Dedicated Filter Toolbar -->
        <div class="filter-toolbar mb-4 p-2.5 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <!-- Search Box -->
            <div class="filter-search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control filter-input" 
                placeholder="Cari nama pemeriksaan / kode..."
                @keyup.enter="fetchData"
              >
              <button 
                v-if="filters.keyword" 
                class="btn-clear-search" 
                @click="filters.keyword = ''; fetchData()"
                title="Hapus pencarian"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Filter Kelas -->
            <select v-model="filters.kelas" class="form-select filter-select" @change="fetchData">
              <option value="">Semua Kelas</option>
              <option value="-">-</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas Utama">Kelas Utama</option>
              <option value="Kelas VIP">Kelas VIP</option>
              <option value="Kelas VVIP">Kelas VVIP</option>
            </select>

            <!-- Filter Penjab -->
            <select v-model="filters.kd_pj" class="form-select filter-select" @change="fetchData" style="max-width: 200px;">
              <option value="">Semua Penjamin</option>
              <option v-for="pj in penjabList" :key="pj.kd_pj" :value="pj.kd_pj">
                {{ pj.png_jawab }}
              </option>
            </select>

            <!-- Reset Filter Button -->
            <button 
              v-if="filters.keyword || filters.kelas || filters.kd_pj" 
              class="btn btn-light btn-sm filter-reset-btn" 
              @click="resetFilters"
              title="Reset Filter"
            >
              <i class="fas fa-undo me-1"></i> Reset
            </button>
          </div>

          <!-- Right Action: Refresh -->
          <div class="d-flex align-items-center gap-2">
            <button 
              class="btn btn-outline-secondary btn-sm px-3 filter-refresh-btn" 
              @click="fetchData" 
              :disabled="loading" 
              title="Segarkan Data"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span class="d-none d-sm-inline ms-1.5">Refresh</span>
            </button>
          </div>
        </div>

        <!-- 3. Table Data -->
        <div class="table-responsive premium-table">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Pemeriksaan</th>
                <th>Penjamin & Kelas</th>
                <th class="text-end">J.S. RS</th>
                <th class="text-end">BHP</th>
                <th class="text-end">Tarif Dr</th>
                <th class="text-end">Tarif Pr</th>
                <th class="text-end">Total</th>
                <th class="text-center" style="width: 100px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="spinner-border text-warning spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif radiologi...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif radiologi.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kd_jenis_prw" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kd_jenis_prw }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.8rem; white-space: normal; min-width: 220px;">
                  {{ item.nm_perawatan }}
                </td>
                <td>
                  <div class="small fw-semibold text-primary text-truncate" style="max-width: 180px;">
                    {{ item.penjab?.png_jawab || item.kd_pj || '-' }}
                  </div>
                  <div class="small text-muted">{{ item.kelas || '-' }}</div>
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.bagian_rs) }}
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.bhp) }}
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
                    <button class="btn btn-sm btn-outline-primary" title="Edit Tarif" @click="openModal('edit', item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Nonaktifkan Tarif" @click="handleDelete(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. Pagination -->
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

    <!-- 5. Modal Tambah / Edit Tarif Radiologi -->
    <div class="modal fade" id="modalTarifRadiologi" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 720px;">
        <div class="modal-content border shadow-sm rounded-3">
          <!-- Modal Header -->
          <div class="modal-header bg-white border-bottom py-3 px-4">
            <div class="d-flex align-items-center gap-2.5">
              <div class="header-icon-clean rounded-2 bg-warning-subtle text-warning">
                <i class="fas fa-x-ray text-warning-dark"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark m-0">
                  {{ modalMode === 'add' ? 'Tambah Tarif Radiologi' : 'Edit Tarif Radiologi' }}
                </h6>
                <p class="text-muted fs-xs m-0 mt-0.5">Lengkapi data master pemeriksaan dan rincian biaya radiologi</p>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-3.5 bg-slate-50">
            <form @submit.prevent="saveTarif">
              <!-- Master Data Section -->
              <div class="card border rounded-3 p-3 mb-3 bg-white shadow-none position-relative" style="z-index: 15; overflow: visible !important;">
                <div class="fs-xs fw-bold text-secondary text-uppercase tracking-wider border-bottom pb-1.5 mb-2.5 d-flex align-items-center gap-1.5">
                  <i class="fas fa-layer-group text-muted"></i> Informasi Pemeriksaan
                </div>
                <div class="row g-2.5">
                  <div class="col-md-4">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kode Paket / Tindakan</label>
                    <input 
                      v-model="form.kd_jenis_prw" 
                      type="text" 
                      class="form-control form-control-sm font-monospace fw-bold text-uppercase" 
                      placeholder="J00001" 
                      required 
                      :disabled="modalMode === 'edit'"
                    >
                  </div>
                  <div class="col-md-8">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Penjab / Jenis Bayar</label>
                    <v-select
                      v-model="form.kd_pj"
                      :options="penjabList"
                      label="png_jawab"
                      :reduce="pj => pj.kd_pj"
                      :filter-by="filterPenjab"
                      :clearable="false"
                      placeholder="Pilih Penjab..."
                      class="v-select-custom"
                    >
                      <template #option="{ png_jawab, kd_pj }">
                        <div class="d-flex justify-content-between align-items-center py-0.5">
                          <span class="fs-xs fw-medium text-dark">{{ png_jawab }}</span>
                          <span class="badge bg-light text-secondary border font-monospace fs-xxs ms-2">{{ kd_pj }}</span>
                        </div>
                      </template>
                      <template #selected-option="{ png_jawab, kd_pj }">
                        <span class="fs-xs fw-medium text-dark">{{ png_jawab }} <small class="text-muted">({{ kd_pj }})</small></span>
                      </template>
                    </v-select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Nama Pemeriksaan</label>
                    <input 
                      v-model="form.nm_perawatan" 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="Contoh: Thorax AP/PA, USG Abdomen, Baby Gram..." 
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kelas Pelayanan</label>
                    <v-select
                      v-model="form.kelas"
                      :options="['-', 'Rawat Jalan', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas Utama', 'Kelas VIP', 'Kelas VVIP']"
                      :clearable="false"
                      placeholder="Pilih Kelas..."
                      class="v-select-custom"
                    />
                  </div>
                </div>
              </div>

              <!-- Rincian Biaya Section -->
              <div class="card border rounded-3 p-3 mb-2 bg-white shadow-none position-relative" style="z-index: 5;">
                <div class="fs-xs fw-bold text-secondary text-uppercase tracking-wider border-bottom pb-1.5 mb-2.5 d-flex align-items-center gap-1.5">
                  <i class="fas fa-receipt text-muted"></i> Rincian Komponen Biaya (Rp)
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">J.S. Rumah Sakit</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.bagian_rs" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">Paket BHP</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.bhp" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">J.M. Perujuk</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.tarif_perujuk" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">J.M. Dokter</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.tarif_tindakan_dokter" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">J.M. Petugas</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.tarif_tindakan_petugas" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">K.S.O.</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.kso" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">Menejemen</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.menejemen" type="number" class="form-control form-control-sm text-end" @input="calculateTotal">
                    </div>
                  </div>

                  <!-- Total Box -->
                  <div class="col-8">
                    <label class="form-label fs-xxs fw-semibold text-success mb-1">Total Biaya Pemeriksaan</label>
                    <div class="p-2 rounded bg-success-subtle border border-success-subtle text-end">
                      <span class="fs-6 fw-bold text-success">{{ formatRupiah(form.total_byr) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" class="btn btn-sm btn-light border px-3" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" class="btn btn-sm btn-primary px-3 shadow-xs" :disabled="saving">
                  <i v-if="saving" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-save me-1"></i>
                  {{ modalMode === 'add' ? 'Simpan Tarif' : 'Perbarui Tarif' }}
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
const saving = ref(false)
const items = ref([])
const penjabList = ref([])

const filters = reactive({
  keyword: '',
  kelas: '',
  kd_pj: '',
  page: 1
})

const resetFilters = () => {
  filters.keyword = ''
  filters.kelas = ''
  filters.kd_pj = ''
  filters.page = 1
  fetchData()
}

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
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0)
}

const filterPenjab = (option, label, search) => {
  const s = search.toLowerCase()
  return (option.png_jawab || '').toLowerCase().includes(s) ||
         (option.kd_pj || '').toLowerCase().includes(s)
}

// === FORM TARIF RADIOLOGI ===
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
  kelas: 'Rawat Jalan'
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
    kelas: 'Rawat Jalan'
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
      const res = await keuanganTarifService.getNextKodeRadiologi({ prefix: 'J' })
      if (res.data.success) {
        form.kd_jenis_prw = res.data.data
      }
    } catch (error) {
      console.error('Error fetching next code radiologi', error)
    }
  }

  if (!modalInstance) {
    modalInstance = new window.bootstrap.Modal(document.getElementById('modalTarifRadiologi'))
  }
  modalInstance.show()
}

const saveTarif = async () => {
  saving.value = true
  try {
    let res
    if (modalMode.value === 'add') {
      res = await keuanganTarifService.postTarifRadiologi(form)
    } else {
      res = await keuanganTarifService.putTarifRadiologi(form.kd_jenis_prw, form)
    }

    if (res.data.success) {
      toast.success(res.data.message)
      if (modalInstance) {
        modalInstance.hide()
      }
      fetchData()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan tarif radiologi')
  } finally {
    saving.value = false
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
        const res = await keuanganTarifService.deleteTarifRadiologi(item.kd_jenis_prw)
        if (res.data.success) {
          toast.success(res.data.message)
          fetchData()
        }
      } catch (error) {
        toast.error('Gagal menonaktifkan tarif radiologi')
      }
    }
  })
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
    const res = await keuanganTarifService.getTarifRadiologi(filters)
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
    console.error('Error fetching tarif radiologi', error)
    toast.error('Gagal mengambil data tarif radiologi')
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
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 16px; }

.tab-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-warning-subtle { background-color: #fef3c7; }
.text-warning-dark { color: #d97706; }

/* Dedicated Filter Toolbar */
.filter-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
}
.filter-search-box {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  flex-grow: 1;
}
.filter-search-box .search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}
.filter-input {
  height: 38px;
  border-radius: 10px;
  padding-left: 2.35rem;
  padding-right: 2.2rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}
.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}
.btn-clear-search:hover { color: #64748b; }

.filter-select {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  width: auto;
  min-width: 140px;
}
.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.filter-reset-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0 0.85rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
}
.filter-reset-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.filter-refresh-btn {
  height: 38px;
  border-radius: 10px;
  border-color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  display: inline-flex;
  align-items: center;
}
.filter-refresh-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

.tab-tarif-radiologi {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.table-responsive.premium-table { 
  background: white; 
  border-radius: 12px; 
  border: 1px solid #f1f5f9; 
  overflow-x: auto !important; 
  overflow-y: hidden; 
  -webkit-overflow-scrolling: touch; 
  width: 100%;
  max-width: 100%;
  display: block;
}
.table-responsive.premium-table::-webkit-scrollbar {
  height: 8px;
}
.table-responsive.premium-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.premium-table table { 
  margin-bottom: 0; 
  width: 100%;
  min-width: 900px;
}
.premium-table thead th { background: #f8fafc; color: #64748b; font-size: 0.70rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.premium-table tbody td { padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; }
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }

/* Modal Custom Styles */
.header-icon-clean {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.fs-xs { font-size: 0.75rem !important; }
.fs-xxs { font-size: 0.68rem !important; }

/* Custom v-select styling */
:deep(.v-select-custom .vs__dropdown-toggle) {
  border-radius: 6px;
  border-color: #cbd5e1;
  min-height: 31px;
  padding: 0 4px 2px;
  font-size: 0.8rem;
  background-color: #ffffff;
}
:deep(.v-select-custom .vs__dropdown-menu) {
  font-size: 0.8rem;
  border-radius: 6px;
  border-color: #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-height: 220px;
}
:deep(.v-select-custom .vs__selected) {
  margin: 2px 2px 0;
  padding: 0 0.25rem;
  color: #1e293b;
}
:deep(.v-select-custom .vs__search) {
  margin: 2px 0 0;
  padding: 0 4px;
}
</style>
