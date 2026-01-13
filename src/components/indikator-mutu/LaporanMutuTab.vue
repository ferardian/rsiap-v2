<template>
  <div>
    <!-- Filters -->
    <div class="row mb-4 align-items-end g-3">
        <div class="col-md-2">
            <label class="form-label text-muted small fw-bold">Tahun</label>
            <select class="form-select" v-model="filters.tahun" @change="fetchData">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
        </div>
        
        <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Jenis Laporan</label>
            <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="tipe" id="triwulan" value="triwulan" v-model="filters.tipe">
                <label class="btn btn-outline-primary" for="triwulan">Triwulan</label>

                <input type="radio" class="btn-check" name="tipe" id="semester" value="semester" v-model="filters.tipe">
                <label class="btn btn-outline-primary" for="semester">Semester</label>
            </div>
        </div>

        <div class="col-md-3">
             <label class="form-label text-muted small fw-bold">Periode Ke-</label>
             <div class="btn-group w-100" role="group" v-if="filters.tipe === 'triwulan'">
                <input type="radio" class="btn-check" name="periode" id="p1" :value="1" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="p1">I</label>
                <input type="radio" class="btn-check" name="periode" id="p2" :value="2" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="p2">II</label>
                <input type="radio" class="btn-check" name="periode" id="p3" :value="3" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="p3">III</label>
                <input type="radio" class="btn-check" name="periode" id="p4" :value="4" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="p4">IV</label>
            </div>
            <div class="btn-group w-100" role="group" v-else>
                <input type="radio" class="btn-check" name="periode-s" id="s1" :value="1" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="s1">Semester 1</label>
                <input type="radio" class="btn-check" name="periode-s" id="s2" :value="2" v-model="filters.periode" @change="fetchData">
                <label class="btn btn-outline-secondary" for="s2">Semester 2</label>
            </div>
        </div>
        
        <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Jenis Tampilan</label>
            <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="jenis" id="semua" value="semua" v-model="filters.jenis" @change="fetchData">
                <label class="btn btn-outline-primary" for="semua">Semua</label>

                <input type="radio" class="btn-check" name="jenis" id="group" value="group" v-model="filters.jenis" @change="fetchData">
                <label class="btn btn-outline-primary" for="group">Group Indikator</label>
            </div>
        </div>

        <div class="col-md-3" v-if="filters.jenis !== 'group'">
            <label class="form-label text-muted small fw-bold">Unit</label>
             <v-select 
                :options="units" 
                label="nama_ruang" 
                v-model="filters.unit"
                :reduce="unit => unit.dep_id"
                placeholder="Semua Unit"
                class="style-chooser"
                @update:modelValue="fetchData"
            >
                 <template #no-options="{ search, searching, loading }">
                    No unit found
                </template>
            </v-select>
        </div>

        <div class="col-md-1">
             <button class="btn btn-primary w-100" @click="fetchData" title="Refresh">
              <i class="fas fa-sync-alt"></i>
            </button>
        </div>
    </div>

    <div class="alert alert-info d-flex align-items-center mb-4" v-if="periodeInfo">
        <i class="fas fa-info-circle me-2 fs-4"></i>
        <div>
            <div class="fw-bold text-uppercase">Laporan {{ filters.tipe }} {{ filters.periode }} Tahun {{ filters.tahun }}</div>
            <small>Periode Data: {{ formatDate(periodeInfo.start) }} s/d {{ formatDate(periodeInfo.end) }}</small>
        </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="bg-light text-center">
              <tr>
                <th width="5%">#</th>
                <th width="30%">Indikator & Unit</th>
                <th width="15%">Target</th>
                <th width="10%">Num</th>
                <th width="10%">Denum</th>
                <th width="15%">Capaian (%)</th>
                <th width="15%">Kesimpulan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                   <p class="mb-0">Tidak ada data laporan untuk periode ini.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.id_inmut">
                <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                   <div class="fw-bold">{{ item.nama_inmut }}</div>
                   <small class="text-muted">{{ item.nama_ruang }}</small>
                </td>
                <td class="text-center">
                    {{ getStandar(item) }}
                </td>
                <td class="text-center">{{ item.total_num }}</td>
                <td class="text-center">{{ item.total_denum }}</td>
                <td class="text-center fw-bold" :class="isTercapai(item) ? 'text-success' : 'text-danger'">
                    {{ item.score }}%
                </td>
                <td class="text-center">
                    <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai' }}</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import api from '@/services/indikatorMutuService'

const items = ref([])
const units = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const periodeInfo = ref(null)

const currentYear = new Date().getFullYear()
const years = Array.from({length: 5}, (_, i) => currentYear - i)

const filters = reactive({
    tahun: currentYear,
    tipe: 'triwulan',
    periode: 1, // Default Triwulan 1
    unit: null,
    jenis: 'semua'
})

// Watch filters.tipe to reset periode logic if needed
watch(() => filters.tipe, (newVal) => {
    // Reset to 1 when switching types to avoid invalid period 3/4 for semester
    filters.periode = 1
    fetchData()
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
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
        periodeInfo.value = response.data.periode_info
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const formatDate = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

// Logic reused from AnalisaTab roughly
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
    // item here might be from rekap query merged into indicator master
    const ind = item; 
    
    // In Laporan controller we use leftJoin, so fields like 'standar_utama' are available directly on item if joined
    // But our controller logic populates: nama_inmut_utama, standar_utama, etc.
    // However, if we look at `MonitoringIndikatorMutuController` update:
    /*
        $indicators = RsiaMasterInmut::select(...) ... leftJoin(...)
    */
    // So `item` has `standar_utama` etc directly.
    
    const std = (item.standar_utama) ? item.standar_utama : item.standar;
    const rumus = (item.rumus_utama) ? item.rumus_utama : item.rumus;
    const satuan = (item.satuan_utama) ? item.satuan_utama : item.satuan;
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`;
}

const isTercapai = (item) => {
    const std = parseFloat((item.standar_utama) ? item.standar_utama : item.standar);
    const rumus = String((item.rumus_utama) ? item.rumus_utama : item.rumus);
    
    const score = parseFloat(item.score);
    
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
