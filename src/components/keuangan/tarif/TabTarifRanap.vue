<template>
  <div class="tab-tarif-ranap">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- 1. Clean Header Row: Title on Left, Action on Right -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="tab-header-icon bg-purple-subtle text-purple shadow-2xs">
              <i class="fas fa-bed fa-lg"></i>
            </div>
            <div>
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                Tarif Rawat Inap
                <span class="badge bg-light text-secondary border px-2 py-0.5 fs-xs fw-semibold">
                  {{ pagination.total || 0 }} Tindakan
                </span>
              </h5>
              <p class="text-muted small m-0">Kelola master data tarif tindakan dan akomodasi rawat inap</p>
            </div>
          </div>
          <div>
            <button class="btn btn-primary premium-action-btn shadow-sm" @click="openModal('add')">
              <i class="fas fa-plus-circle me-1.5"></i> Tambah Tarif
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
                placeholder="Cari nama perawatan / kode..."
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
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas VIP">Kelas VIP</option>
              <option value="Kelas VVIP">Kelas VVIP</option>
            </select>

            <!-- Reset Filter Button -->
            <button 
              v-if="filters.keyword || filters.kelas" 
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
      <div class="modal-dialog modal-dialog-centered" style="max-width: 720px;">
        <div class="modal-content border shadow-sm rounded-3">
          <!-- Modal Header: Clean White Tone -->
          <div class="modal-header bg-white border-bottom py-3 px-4">
            <div class="d-flex align-items-center gap-2.5">
              <div class="header-icon-clean rounded-2">
                <i class="fas fa-bed text-secondary"></i>
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark m-0">
                  {{ modalMode === 'add' ? 'Tambah Tarif Rawat Inap' : 'Edit Tarif Rawat Inap' }}
                </h6>
                <p class="text-muted fs-xs m-0 mt-0.5">Lengkapi data tindakan, kelas, bangsal dan rincian tarif perawatan</p>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-3.5 bg-slate-50">
            <form @submit.prevent="saveData">
              <!-- Bagian 1: Data Identitas & Ruangan -->
              <div class="card border rounded-3 p-3 mb-3 bg-white shadow-none position-relative" style="z-index: 15; overflow: visible !important;">
                <div class="fs-xs fw-bold text-secondary text-uppercase tracking-wider border-bottom pb-1.5 mb-2.5 d-flex align-items-center gap-1.5">
                  <i class="fas fa-layer-group text-muted"></i> Informasi Tindakan & Ruangan
                </div>
                <div class="row g-2.5">
                  <div class="col-md-4">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kode Perawatan</label>
                    <input 
                      v-model="form.kd_jenis_prw" 
                      type="text" 
                      class="form-control form-control-sm font-monospace fw-bold" 
                      :readonly="modalMode === 'edit'" 
                      required
                    >
                  </div>
                  <div class="col-md-8">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Penjab / Asuransi</label>
                    <v-select
                      v-model="form.kd_pj"
                      :options="listPenjab"
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
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Nama Perawatan / Tindakan</label>
                    <input 
                      v-model="form.nm_perawatan" 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="Contoh: Visite Dokter Spesialis" 
                      required
                    >
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label fs-xs fw-semibold text-secondary m-0">Kategori</label>
                      <button 
                        type="button" 
                        class="btn btn-link p-0 text-primary text-decoration-none fs-xxs fw-semibold d-inline-flex align-items-center" 
                        @click="openManageKategori"
                      >
                        <i class="fas fa-cog me-1"></i>Kelola
                      </button>
                    </div>
                    <v-select
                      v-model="form.kd_kategori"
                      :options="listKategori"
                      label="nm_kategori"
                      :reduce="kat => kat.kd_kategori"
                      :filter-by="filterKategori"
                      :clearable="false"
                      placeholder="Pilih Kategori..."
                      class="v-select-custom"
                    >
                      <template #option="{ nm_kategori, kd_kategori }">
                        <div class="d-flex justify-content-between align-items-center py-0.5">
                          <span class="fs-xs fw-medium text-dark">{{ nm_kategori }}</span>
                          <span class="badge bg-light text-secondary border font-monospace fs-xxs ms-2">{{ kd_kategori }}</span>
                        </div>
                      </template>
                      <template #selected-option="{ nm_kategori, kd_kategori }">
                        <span class="fs-xs fw-medium text-dark">{{ nm_kategori }} <small class="text-muted">({{ kd_kategori }})</small></span>
                      </template>
                    </v-select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Kelas Tarif</label>
                    <v-select
                      v-model="form.kelas"
                      :options="['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas VIP', 'Kelas VVIP']"
                      :clearable="false"
                      placeholder="Pilih Kelas..."
                      class="v-select-custom"
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fs-xs fw-semibold text-secondary mb-1">Bangsal / Ruangan</label>
                    <v-select
                      v-model="form.kd_bangsal"
                      :options="listBangsal"
                      label="nm_bangsal"
                      :reduce="bgs => bgs.kd_bangsal"
                      :filter-by="filterBangsal"
                      :clearable="false"
                      placeholder="Pilih Bangsal..."
                      class="v-select-custom"
                    >
                      <template #option="{ nm_bangsal, kd_bangsal }">
                        <div class="d-flex justify-content-between align-items-center py-0.5">
                          <span class="fs-xs fw-medium text-dark">{{ nm_bangsal }}</span>
                          <span class="badge bg-light text-secondary border font-monospace fs-xxs ms-2">{{ kd_bangsal }}</span>
                        </div>
                      </template>
                      <template #selected-option="{ nm_bangsal, kd_bangsal }">
                        <span class="fs-xs fw-medium text-dark">{{ nm_bangsal }} <small class="text-muted">({{ kd_bangsal }})</small></span>
                      </template>
                    </v-select>
                  </div>
                </div>
              </div>

              <!-- Bagian 2: Rincian Biaya (Compact 3-columns) -->
              <div class="card border rounded-3 p-3 mb-3 bg-white shadow-none position-relative" style="z-index: 5;">
                <div class="fs-xs fw-bold text-secondary text-uppercase tracking-wider border-bottom pb-1.5 mb-2.5 d-flex align-items-center gap-1.5">
                  <i class="fas fa-receipt text-muted"></i> Rincian Komponen Biaya
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">J.S. Rumah Sakit</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.material" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">BHP / Paket Obat</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.bhp" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">Jasa Medis Dokter</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.tarif_tindakandr" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">Jasa Medis Perawat</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.tarif_tindakanpr" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">KSO</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.kso" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                  <div class="col-4">
                    <label class="form-label fs-xxs fw-semibold text-muted mb-1">Menejemen</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-light text-muted px-1.5 fs-xxs">Rp</span>
                      <input v-model.number="form.menejemen" type="number" class="form-control form-control-sm text-end" @input="calculateTotals">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bagian 3: Ringkasan Total Biaya -->
              <div class="card border rounded-3 p-3 mb-2 bg-white shadow-none position-relative" style="z-index: 1;">
                <div class="fs-xs fw-bold text-secondary text-uppercase tracking-wider border-bottom pb-1.5 mb-2.5 d-flex align-items-center gap-1.5">
                  <i class="fas fa-calculator text-muted"></i> Ringkasan Total Biaya
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <div class="p-2 rounded-2 bg-light border text-center">
                      <label class="form-label fs-xxs fw-bold text-secondary mb-1">Total Biaya Dr</label>
                      <input v-model.number="form.total_byrdr" type="number" class="form-control form-control-sm text-end fw-bold text-dark bg-white">
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded-2 bg-light border text-center">
                      <label class="form-label fs-xxs fw-bold text-secondary mb-1">Total Biaya Pr</label>
                      <input v-model.number="form.total_byrpr" type="number" class="form-control form-control-sm text-end fw-bold text-dark bg-white">
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded-2 bg-primary-subtle border border-primary-subtle text-center">
                      <label class="form-label fs-xxs fw-bold text-primary mb-1">Total Dr & Pr</label>
                      <input v-model.number="form.total_byrdrpr" type="number" class="form-control form-control-sm text-end fw-bold text-primary bg-white">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="mt-3 pt-2 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-sm btn-light px-3 border" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" class="btn btn-sm btn-primary px-4 fw-semibold shadow-none" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1.5"></span>
                  <i v-else class="fas fa-save me-1.5"></i>
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Kelola Kategori -->
    <ModalKelolaKategori 
      ref="modalKelolaKategoriRef" 
      @kategori-updated="fetchKategori" 
      @closed="onKategoriClosed"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import ModalKelolaKategori from './ModalKelolaKategori.vue'
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
const modalKelolaKategoriRef = ref(null)
let modalInstance = null
const parentModalWasOpen = ref(false)

const openManageKategori = () => {
  parentModalWasOpen.value = true
  modalInstance?.hide()
  setTimeout(() => {
    modalKelolaKategoriRef.value?.openModal()
  }, 150)
}

const onKategoriClosed = () => {
  fetchKategori()
  if (parentModalWasOpen.value) {
    parentModalWasOpen.value = false
    setTimeout(() => {
      modalInstance?.show()
    }, 150)
  }
}

const filterPenjab = (option, label, search) => {
  const s = (search || '').toLowerCase()
  return (option.png_jawab || '').toLowerCase().includes(s) ||
         (option.kd_pj || '').toLowerCase().includes(s)
}

const filterKategori = (option, label, search) => {
  const s = (search || '').toLowerCase()
  return (option.nm_kategori || '').toLowerCase().includes(s) ||
         (option.kd_kategori || '').toLowerCase().includes(s)
}

const filterBangsal = (option, label, search) => {
  const s = (search || '').toLowerCase()
  return (option.nm_bangsal || '').toLowerCase().includes(s) ||
         (option.kd_bangsal || '').toLowerCase().includes(s)
}

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
  if (listKategori.value.length === 0) fetchKategori()
  if (listBangsal.value.length === 0) fetchBangsal()
  if (listPenjab.value.length === 0) fetchPenjab()
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

const resetFilters = () => {
  filters.keyword = ''
  filters.kelas = ''
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
.tab-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-purple-subtle { background-color: #f3e8ff; }
.text-purple { color: #9333ea; }

.premium-action-btn {
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0 1.25rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}
.premium-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

/* Dedicated Filter Toolbar */
.filter-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
}
.filter-search-box {
  position: relative;
  min-width: 240px;
  max-width: 340px;
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
.tab-tarif-ranap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* Table Styles */
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
  min-width: 1350px;
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
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }
@media (max-width: 768px) {
  .w-100-mobile {
    width: 100% !important;
  }
  .premium-add-btn {
    width: 100%;
  }
}
</style>
