<template>
  <div class="tab-tarif-ranap">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- Toolbar -->
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold d-flex align-items-center">
            <div class="icon-box bg-purple-subtle text-purple rounded-3 p-2 me-3">
              <i class="fas fa-bed"></i>
            </div>
            Tarif Rawat Inap
          </h5>
          <div class="d-flex flex-wrap gap-2 align-items-center">
             <select v-model="filters.kelas" class="form-select premium-input-sm" style="min-width: 150px;">
                <option value="">Semua Kelas</option>
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
                placeholder="Cari nama perawatan / kode..."
                @keyup.enter="fetchData"
              >
            </div>
            <button class="btn btn-primary premium-btn-sm" @click="fetchData" :disabled="loading">
              <i class="fas fa-search me-1"></i> Cari
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
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="13" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif rawat inap...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="13" class="text-center py-5 text-muted">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const items = ref([])

const filters = reactive({
  keyword: '',
  kelas: '',
  page: 1
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Resembling TabTarifRalan styles but with color variations */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
.icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-purple-subtle { background-color: #f3e8ff; }
.text-purple { color: #9333ea; }
.premium-input-sm {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.premium-input-sm:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
.premium-btn-sm {
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.premium-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}
.premium-table table {
  margin-bottom: 0;
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
.table-responsive.premium-table {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }
</style>
