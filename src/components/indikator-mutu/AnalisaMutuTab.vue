<template>
  <div>
    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-md-6 d-flex align-items-center">
         <!-- <button class="btn btn-primary" @click="openModal(null)">
            <i class="fas fa-plus me-1"></i> Buat Analisa
         </button> -->
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
        <div class="input-group" style="max-width: 250px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="month" class="form-control border-start-0 ps-0" v-model="filters.bulan" @change="fetchData">
        </div>
        
        <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang"
            class="style-chooser"
            style="min-width: 200px;"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>

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
                <th width="25%">Indikator</th>
                <th width="30%">Capaian & Periode</th>
                <th width="30%">Analisa & Tindak Lanjut</th>
                <th width="10%" class="text-center">Aksi</th>
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
                  <i class="fas fa-clipboard-check fa-3x mb-3 opacity-50"></i>
                  <p>Tidak ada data analisa untuk periode ini.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.id_analisa">
               <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                  <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                  <small class="text-muted">{{ item.nama_ruang }}</small>
                </td>
                <td>
                    <div class="mb-2">
                        <small class="text-secondary d-block">PERIODE</small>
                        <span class="fw-bold">{{ formatDate(item.tanggal_awal) }} - {{ formatDate(item.tanggal_akhir) }}</span>
                    </div>
                    
                    <div class="row g-2" style="font-size: 0.85rem;">
                        <div class="col-12">
                            <div class="d-flex align-items-center justify-content-between border-bottom pb-1 mb-1">
                                <span class="text-secondary">Target</span>
                                <span class="fw-bold text-dark">{{ getStandar(item) }}</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="p-1 bg-light rounded text-center border">
                                <small class="d-block text-secondary" style="font-size: 0.7rem;">NUMERATOR</small>
                                <span class="fw-bold">{{ item.jml_num }}</span>
                            </div>
                        </div>
                         <div class="col-6">
                            <div class="p-1 bg-light rounded text-center border">
                                <small class="d-block text-secondary" style="font-size: 0.7rem;">DENOMINATOR</small>
                                <span class="fw-bold">{{ item.jml_denum }}</span>
                            </div>
                        </div>
                        <div class="col-12 mt-2">
                             <div class="d-flex align-items-center justify-content-between p-2 rounded" :class="isTercapai(item) ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'">
                                <span class="fw-bold">Score: {{ parseFloat(item.jumlah).toFixed(2) }}%</span>
                                <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ getKesimpulanText(item) }}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="mb-2">
                        <strong class="d-block text-secondary" style="font-size: 0.8rem;">ANALISA:</strong>
                        <span v-html="stripHtml(item.analisa).substring(0, 100) + (item.analisa.length > 100 ? '...' : '')"></span>
                    </div>
                    <div>
                        <strong class="d-block text-secondary" style="font-size: 0.8rem;">TINDAK LANJUT:</strong>
                        <span v-html="stripHtml(item.tindak_lanjut).substring(0, 100) + (item.tindak_lanjut.length > 100 ? '...' : '')"></span>
                    </div>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-info" @click="openModal(item, true)">
                    <i class="fas fa-eye"></i> Detail
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
            Menampilkan {{ items.length }} dari {{ total }} data
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

    <!-- Modal Form -->
    <Teleport to="body">
      <div class="modal fade" id="modalAnalisa" tabindex="-1" ref="modalRef">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ isDetail ? 'Detail Analisa Data' : (isEdit ? 'Edit Analisa' : 'Buat Analisa Baru') }}
                    </h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="submitForm">
                         <div class="mb-3" v-if="!isEdit && !isDetail">
                            <label class="form-label fw-bold">Pilih Indikator</label>
                            <v-select 
                                :options="indicators" 
                                label="nama_inmut" 
                                v-model="form.id_inmut"
                                :reduce="ind => ind.id_inmut"
                                placeholder="Cari Indikator..."
                            >
                                <template #option="{ nama_inmut, nama_ruang }">
                                    <div class="d-flex flex-column">
                                        <span>{{ nama_inmut }}</span>
                                        <small class="text-muted">{{ nama_ruang }}</small>
                                    </div>
                                </template>
                            </v-select>
                        </div>
                        <div class="mb-3" v-else>
                             <div class="row">
                                <div class="col-md-7">
                                     <label class="form-label fw-bold">Indikator</label>
                                     <input type="text" class="form-control" :value="form.nama_inmut" readonly>
                                </div>
                                <div class="col-md-5">
                                     <label class="form-label fw-bold">Unit / Ruang</label>
                                     <input type="text" class="form-control" :value="form.nama_ruang" readonly>
                                </div>
                             </div>
                        </div>

                         <div class="mb-3">
                            <label class="form-label fw-bold">Periode Bulan</label>
                             <input type="month" class="form-control" v-model="form.bulan" ref="formBulanInput" :readonly="isEdit || isDetail">
                        </div>

                        <div class="row g-3 mb-3">
                             <div class="col-md-6">
                                <label class="form-label fw-bold">Total Numerator</label>
                                <input type="number" class="form-control" v-model="form.jml_num" :readonly="isDetail">
                             </div>
                              <div class="col-md-6">
                                <label class="form-label fw-bold">Total Denominator</label>
                                <input type="number" class="form-control" v-model="form.jml_denum" :readonly="isDetail">
                             </div>
                        </div>

                        <div v-if="isDetail">
                            <div class="mb-3">
                                <label class="form-label fw-bold text-primary">HASIL ANALISA</label>
                                <div class="p-3 bg-light border rounded" v-html="form.analisa"></div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold text-primary">TINDAK LANJUT</label>
                                <div class="p-3 bg-light border rounded" v-html="form.tindak_lanjut"></div>
                            </div>
                        </div>
                        
                        <div v-else>
                             <div class="mb-3">
                                <label class="form-label fw-bold">Analisa</label>
                                <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.analisa" style="height: 150px; padding-bottom: 40px;" />
                            </div>

                             <div class="mb-3">
                                <label class="form-label fw-bold">Tindak Lanjut</label>
                                <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.tindak_lanjut" style="height: 150px; padding-bottom: 40px;" />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">Tutup</button>
                    <button v-if="!isDetail" type="button" class="btn btn-primary" @click="submitForm" :disabled="submitting">
                        <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                        Simpan
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { Modal } from 'bootstrap'
import api from '@/services/indikatorMutuService'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const toast = useToast()
const items = ref([])
const units = ref([])
const indicators = ref([]) // For select dropdown
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const modalRef = ref(null)
let modalInstance = null

const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    unit: null
})

const isEdit = ref(false)
const form = reactive({
    id_analisa: null,
    id_inmut: null,
    nama_inmut: '',
    bulan: new Date().toISOString().slice(0, 7),
    jml_num: 0,
    jml_denum: 0,
    analisa: '',
    tindak_lanjut: ''
})

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            bulan: filters.bulan,
            dep_id: filters.unit
        }
        const response = await api.getAnalisa(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data analisa')
    } finally {
        loading.value = false
    }
}

const fetchIndicators = async () => {
     try {
         // Reusing getRuang from service (Master Ruang) for indicators, checking status active
         // Ideally should have a dedicated endpoint for searching ALL active indicators
         // Using getRuang for now as it lists indicators + master utama details
         const params = { limit: 1000, status: 1 } 
         const response = await api.getRuang(params)
         indicators.value = response.data.data.data // Accessing paginated data
    } catch (error) {
        console.error('Error indicators', error)
    }
}


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

const getStandar = (item) => {
    const ind = item.indikator;
    if (!ind) return '-';
    
    // Attempt to access relation. In JSON it usually becomes snake_case 'master_utama'
    const utama = ind.master_utama || ind.masterUtama; 
    
    const std = (utama && utama.standar) ? utama.standar : ind.standar;
    const rumus = (utama && utama.rumus) ? utama.rumus : ind.rumus;
    const satuan = (utama && utama.satuan) ? utama.satuan : ind.satuan;
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`;
}



const getKesimpulanText = (item) => {
    return isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai';
}

const getKesimpulanClass = (item) => {
    return isTercapai(item) ? 'bg-success' : 'bg-danger';
}

const isTercapai = (item) => {
    const ind = item.indikator;
    if (!ind) return false;
    
    // Logic similar to getStandar
    const utama = ind.master_utama || ind.masterUtama;
    const std = parseFloat((utama && utama.standar) ? utama.standar : ind.standar);
    const rumus = String((utama && utama.rumus) ? utama.rumus : ind.rumus);
    
    const score = parseFloat(item.jumlah);
    
    if (isNaN(std)) return false;

    switch (rumus) {
        case '1': return score == std; // =
        case '2': return score <= std; // <=
        case '3': return score < std; // <
        case '4': return score >= std; // >=
        case '5': return score > std; // >
        default: return false;
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const stripHtml = (html) => {
   if (!html) return ''
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

const formatDate = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const isDetail = ref(false)

const openModal = async (item, detail = false) => {
    if (!indicators.value.length) await fetchIndicators()
    
    isDetail.value = detail
    
    if (item) {
        isEdit.value = true
        form.id_analisa = item.id_analisa
        form.id_inmut = item.id_inmut
        form.nama_inmut = item.nama_inmut // For display
        form.nama_ruang = item.nama_ruang // For display
        form.bulan = item.tanggal_awal.slice(0, 7) // approximate
        form.jml_num = item.jml_num
        form.jml_denum = item.jml_denum
        form.analisa = item.analisa
        form.tindak_lanjut = item.tindak_lanjut
    } else {
        isEdit.value = false
        // ... (reset form items)
        form.id_analisa = null
        form.id_inmut = null
        form.nama_inmut = ''
        form.bulan = filters.bulan
        form.jml_num = 0
        form.jml_denum = 0
        form.analisa = ''
        form.tindak_lanjut = ''
    }

    if (!modalInstance) {
        modalInstance = new Modal(modalRef.value)
    }
    modalInstance.show()
}

const closeModal = () => {
    if (modalInstance) modalInstance.hide()
}

const submitForm = async () => {
    if (!form.analisa || !form.tindak_lanjut) {
        toast.warning('Analisa dan Tindak Lanjut wajib diisi')
        return
    }

    submitting.value = true
    try {
        if (isEdit.value) {
            await api.updateAnalisa(form.id_analisa, form)
            toast.success('Analisa berhasil diperbarui')
        } else {
            await api.createAnalisa(form)
            toast.success('Analisa berhasil dibuat')
        }
        closeModal()
        fetchData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan analisa')
    } finally {
        submitting.value = false
    }
}

const deleteItem = async (id) => {
    if(confirm('Apakah Anda yakin ingin menghapus analisa ini?')) {
        try {
            await api.deleteAnalisa(id)
            toast.success('Analisa berhasil dihapus')
            fetchData()
        } catch (error) {
            toast.error('Gagal menghapus data')
        }
    }
}

onMounted(() => {
    fetchUnits()
    fetchData()
})
</script>

<style scoped>
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  padding: 2px 0;
}
</style>

<style>
/* Fallback for Bootstrap versions < 5.3 */
.bg-success-subtle { background-color: #d1e7dd !important; }
.text-success-emphasis { color: #0a3622 !important; }
.bg-danger-subtle { background-color: #f8d7da !important; }
.text-danger-emphasis { color: #58151c !important; }
</style>
