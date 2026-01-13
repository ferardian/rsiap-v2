<template>
  <div class="row">
    <div class="col-12">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-primary py-3 d-flex justify-content-between align-items-center">
          <h5 class="card-title fw-bold m-0 text-white">
            <i class="fas fa-file-medical-alt me-2"></i> Data Tindakan Operasi
          </h5>
          <div class="d-flex gap-2">
             <!-- Date Filters -->
             <input type="date" class="form-control form-control-sm" v-model="filters.start">
             <input type="date" class="form-control form-control-sm" v-model="filters.end">
          </div>
        </div>
        <div class="card-body">
          <!-- Search -->
          <div class="mb-3">
             <div class="input-group">
                <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari No. Rawat / Pasien..." v-model="searchQuery" @input="onSearch">
             </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="bg-light text-secondary">
                <tr>
                  <th class="fw-bold py-3">No. Rawat/RM</th>
                  <th class="fw-bold py-3">Pasien</th>
                  <th class="fw-bold py-3">Paket Operasi</th>
                  <th class="fw-bold py-3">Tgl Operasi</th>
                  <th class="fw-bold py-3 text-center" style="width: 150px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                   <td colspan="5" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status"></div>
                   </td>
                </tr>
                <tr v-else-if="items.length === 0">
                   <td colspan="5" class="text-center py-5 text-muted">Belum ada data tindakan operasi</td>
                </tr>
                <tr v-else v-for="item in items" :key="item.no_rawat + item.tgl_operasi + item.kode_paket">
                   <td>
                      <div class="fw-bold text-dark">{{ item.no_rawat }}</div>
                      <small class="text-muted">{{ item.reg_periksa?.no_rkm_medis }}</small>
                   </td>
                   <td>
                      <div class="fw-bold">{{ item.reg_periksa?.pasien?.nm_pasien }}</div>
                   </td>
                   <td>
                      <span class="badge bg-soft-primary text-primary px-3 py-2 rounded-pill">
                         {{ item.detail_paket?.nm_perawatan || item.kode_paket }}
                      </span>
                   </td>
                   <td>
                      <div>{{ formatDate(item.tgl_operasi) }}</div>
                      <small class="text-muted">{{ formatTime(item.tgl_operasi) }}</small>
                   </td>
                   <td>
                      <div class="d-flex justify-content-center gap-2">
                         <button class="btn btn-sm btn-outline-info" @click="onDetail(item)" title="Detail Laporan">
                            <i class="fas fa-file-alt"></i> Detail
                         </button>
                         <button class="btn btn-sm btn-outline-warning" @click="onEdit(item)" title="Edit Laporan">
                            <i class="fas fa-edit"></i> Edit
                         </button>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination.total > 0">
             <small class="text-muted">Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data</small>
             <nav>
                <ul class="pagination pagination-sm m-0">
                   <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
                      <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
                   </li>
                   <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
                      <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
                   </li>
                </ul>
             </nav>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Component -->
    <LaporanOperasiModal 
        :show="showModal"
        :form="laporanForm"
        :dokter-list="dokterList"
        :pegawai-list="pegawaiList"
        :loading="isSaving"
        :readonly="isReadonly"
        @close="showModal = false"
        @submit="submitLaporan"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import operasiService from '@/services/operasiService'
import LaporanOperasiModal from '@/components/pemeriksaan/LaporanOperasiModal.vue'

const toast = useToast()

// State
const items = ref([])
const loading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const isReadonly = ref(false)
const searchQuery = ref('')
const filters = reactive({
  start: '', // Default to? Maybe 1st of month
  end: ''
})
const pagination = ref({})

const dokterList = ref([])
const pegawaiList = ref([])

const laporanForm = reactive({
    no_rawat: '',
    kode_paket: '',
    tgl_operasi: '',
    tgl_selesai: '',
    kategori: '-',
    jenis_anestesi: '',
    operator1: '',
    asisten_operator1: '',
    asisten_operator2: '',
    dokter_anak: '',
    dokter_anestesi: '',
    asisten_anestesi: '',
    onloop: '',
    diagnosa_preop: '',
    diagnosa_postop: '',
    laporan_operasi: '',
    jaringan_insisi: '',
    komplikasi: '',
    pemeriksaan_pa: 'Tidak',
    dr_anestesi_hadir: 'Tidak',
    dr_anak_hadir: 'Tidak',
    darah_masuk: '',
    darah_hilang: ''
})

const resetForm = () => {
    Object.keys(laporanForm).forEach(key => laporanForm[key] = '')
    laporanForm.kategori = '-'
    laporanForm.pemeriksaan_pa = 'Tidak'
    laporanForm.dr_anestesi_hadir = 'Tidak'
    laporanForm.dr_anak_hadir = 'Tidak'
}

// Helpers
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}
const formatTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}

const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// API
const fetchData = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            limit: 15,
            q: searchQuery.value,
            start: filters.start,
            end: filters.end
        }
        const response = await operasiService.getLaporanList(params)
        const { data } = response.data
        items.value = data.data
        pagination.value = {
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
            from: data.from,
            to: data.to,
            prev_page_url: data.prev_page_url,
            next_page_url: data.next_page_url
        }
    } catch (e) {
        console.error("Failed to fetch data", e)
        toast.error('Gagal memuat data tindakan operasi')
    } finally {
        loading.value = false
    }
}

const fetchMasterData = async () => {
    try {
        const [dokterRes, pegawaiRes] = await Promise.all([
            operasiService.getDokter(),
            operasiService.getPegawai()
        ])
        dokterList.value = dokterRes.data.data
        pegawaiList.value = pegawaiRes.data.data
    } catch (e) {
        console.error("Failed master data", e)
        toast.error('Gagal memuat data master')
    }
}

// Actions
const onSearch = debounce(() => {
    fetchData(1)
}, 500)

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        fetchData(page)
    }
}

const onEdit = (item) => {
    isReadonly.value = false
    openModal(item)
}

const onDetail = (item) => {
    isReadonly.value = true
    openModal(item)
}

const openModal = (item) => {
    resetForm()
    // Populate form
    Object.keys(laporanForm).forEach(key => {
        if (item[key] !== undefined) {
             laporanForm[key] = item[key]
        }
    })
    // Ensure dates are formatted for input datetime-local if needed?
    // tgl_selesai is datetime-local. Need YYYY-MM-DDTHH:mm
    if (item.tgl_selesai) {
         // Assuming DB returns YYYY-MM-DD HH:mm:ss
         // Convert to T format
         laporanForm.tgl_selesai = item.tgl_selesai.replace(' ', 'T')
    }
    
    // Explicitly set Keys
    laporanForm.no_rawat = item.no_rawat
    laporanForm.tgl_operasi = item.tgl_operasi
    laporanForm.kode_paket = item.kode_paket

    showModal.value = true
}

const submitLaporan = async () => {
    isSaving.value = true
    try {
        const response = await operasiService.storeLaporan(laporanForm)
        if (response.data.success) {
            toast.success('Laporan operasi berhasil disimpan')
            showModal.value = false
            fetchData(pagination.value.current_page)
        } else {
            toast.error(response.data.message || 'Gagal menyimpan laporan')
        }
    } catch (e) {
        console.error("Save failed", e)
        const errorMsg = e.response?.data?.message || e.message || 'Gagal menyimpan laporan operasi'
        toast.error(errorMsg)
    } finally {
        isSaving.value = false
    }
}

// Lifecycle
onMounted(() => {
    // Set default filter to current month? Or empty for all history?
    // Let's set start date to first day of month
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    // Format YYYY-MM-DD
    const formatDateInput = (d) => d.toISOString().split('T')[0]
    filters.start = formatDateInput(firstDay)
    filters.end = formatDateInput(date)

    fetchData()
    fetchMasterData()
})

watch(() => [filters.start, filters.end], () => {
    fetchData(1)
})
</script>
