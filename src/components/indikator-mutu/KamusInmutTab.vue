<template>
  <div>
    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-md-6 d-flex align-items-center">
        <!-- Optional: Type filter or other filters -->
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
         <div class="input-group" style="max-width: 300px;">
           <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-search text-muted"></i>
           </span>
           <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Indikator / Ruang..." v-model="filters.keyword" @input="debouncedSearch">
        </div>

        <button class="btn btn-primary" @click="fetchData" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th width="5%" class="text-center">#</th>
                <th width="35%">Indikator</th>
                <th width="20%">Unit / Ruang</th>
                <th width="25%">Standar & Tipe</th>
                <th width="15%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                    <i class="fas fa-book-open fa-3x mb-3 opacity-50"></i>
                  <p>Tidak ada data indikator ditemukan.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.id_inmut">
               <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nama_inmut }}</div>
                  <div class="small text-muted" v-if="item.master_utama">{{ item.master_utama.kategori }}</div>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">{{ item.nama_ruang }}</span>
                </td>
                <td>
                   <div class="mb-1">
                        <span class="badge bg-info-subtle text-info-emphasis">Target: {{ getStandar(item) }}</span>
                    </div>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary" @click="openModal(item)">
                    <i class="fas fa-info-circle me-1"></i> Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-white border-top py-3">
         <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
            Menampilkan {{ items.length }} dari {{ total }} indikator
            </small>
            <nav aria-label="Page navigation" v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: page === 1 }">
                <button class="page-link" @click="changePage(page - 1)">Previous</button>
                </li>
                <li class="page-item" :class="{ active: page === p }" v-for="p in totalPages" :key="p">
                <button class="page-link" @click="changePage(p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: page === totalPages }">
                <button class="page-link" @click="changePage(page + 1)">Next</button>
                </li>
            </ul>
            </nav>
        </div>
      </div>
    </div>

    <!-- Modal Detail -->
    <Teleport to="body">
        <div class="modal fade" id="modalKamus" tabindex="-1" ref="modalRef">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Kamus Indikator</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body" v-if="selectedItem">
                        <div class="mb-4 text-center">
                            <h4 class="fw-bold mb-1">{{ selectedItem.nama_inmut }}</h4>
                            <span class="badge bg-primary">{{ selectedItem.nama_ruang }}</span>
                        </div>

                        <div class="row g-4">
                             <div class="col-md-6">
                                <div class="p-3 bg-light rounded border h-100">
                                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Standar & Target</h6>
                                    
                                    <div class="mb-3">
                                        <label class="d-block text-muted small mb-1">Target Capaian</label>
                                        <div class="fw-bold fs-5">{{ getStandar(selectedItem) }}</div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="d-block text-muted small mb-1">Judul Indikator</label>
                                        <div>{{ getMasterValue(selectedItem, 'nama_inmut') }}</div>
                                    </div>
                                     <!-- Add more fields from master utama if needed like Kategori, Dimensions etc -->
                                </div>
                             </div>

                             <div class="col-md-6">
                                <div class="p-3 bg-light rounded border h-100">
                                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Definisi Operasional</h6>
                                     <div v-html="stripEmpty(getMasterValue(selectedItem, 'definisi_operasional'))"></div>
                                </div>
                             </div>

                             <div class="col-12">
                                <div class="p-3 bg-light rounded border">
                                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Formula & Rumus</h6>
                                    <div class="row">
                                        <div class="col-md-6">
                                             <label class="d-block text-muted small mb-1">Numerator (Pembilang)</label>
                                             <div class="fw-semibold">{{ getMasterValue(selectedItem, 'ket_num') }}</div>
                                        </div>
                                        <div class="col-md-6">
                                             <label class="d-block text-muted small mb-1">Denominator (Penyebut)</label>
                                             <div class="fw-semibold">{{ getMasterValue(selectedItem, 'ket_denum') }}</div>
                                        </div>
                                    </div>
                                    <div class="mt-3 pt-3 border-top" v-if="getMasterValue(selectedItem, 'formula')">
                                         <label class="d-block text-muted small mb-1">Formula Calculation</label>
                                         <code class="text-dark bg-white px-2 py-1 rounded border">{{ getMasterValue(selectedItem, 'formula') }}</code>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import api from '@/services/indikatorMutuService'
import { debounce } from 'lodash'

const items = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const modalRef = ref(null)
let modalInstance = null
const selectedItem = ref(null)

const filters = reactive({
    keyword: ''
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            keyword: filters.keyword,
            status: 1 // Only Active
        }
        const response = await api.getRuang(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const debouncedSearch = debounce(() => {
    page.value = 1
    fetchData()
}, 300)

const changePage = (p) => {
    page.value = p
    fetchData()
}

// Reuse logic from AnalisaTab/MonitoringTable ideally, but copying for isolation.
// Ideally should be in a composable or utility
const getRumusSymbol = (val) => {
    const map = {
        '1': '=',
        '2': '≤',
        '3': '<',
        '4': '≥',
        '5': '>'
    }
    return map[val] || val || ''
}

const getStandar = (ind) => {
    if (!ind) return '-';
    // Access relation (snake_case from PHP serialization usually, checking both just in case)
    const utama = ind.master_utama || ind.masterUtama; 
    
    const std = (utama && utama.standar) ? utama.standar : ind.standar;
    const rumus = (utama && utama.rumus) ? utama.rumus : ind.rumus;
    const satuan = (utama && utama.satuan) ? utama.satuan : ind.satuan;
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`;
}

const getMasterValue = (ind, key) => {
   if(!ind) return '-';
   const utama = ind.master_utama || ind.masterUtama;
   // Priority: Utama > Inmut ?? Or Inmut > Utama? usually Utama is the template, Inmut is the instance. 
   // However, definition usually comes from Utama.
   // Let's assume if Inmut (Ruang) has specific value use it, otherwise use Utama.
   // But standard practice usually fields like Formula, Definisi are in Utama.
   return (utama && utama[key]) ? utama[key] : (ind[key] || '-');
}

const stripEmpty = (val) => {
    // Basic stripping or just return value if it's '-'
    return val;
}

const openModal = (item) => {
    selectedItem.value = item
    if (!modalInstance) {
        modalInstance = new Modal(modalRef.value)
    }
    modalInstance.show()
}

const closeModal = () => {
    if (modalInstance) modalInstance.hide()
}

onMounted(() => {
    fetchData()
})

</script>

<style scoped>
.bg-info-subtle { background-color: #cff4fc !important; }
.text-info-emphasis { color: #055160 !important; }
</style>
