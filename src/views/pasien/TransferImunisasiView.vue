<template>
  <div class="transfer-imunisasi-container">
    <div class="card bg-white shadow-sm border-0">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-primary">
          <i class="fas fa-exchange-alt me-2"></i> Transfer Data Imunisasi
        </h5>
        <div>
          <button class="btn btn-primary" @click="doTransfer" :disabled="loading || transferring">
            <span v-if="transferring" class="spinner-border spinner-border-sm me-2"></span>
            {{ transferring ? 'Memproses...' : 'Mulai Transfer Data' }}
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Fitur ini akan memindahkan data dari tabel <strong>riwayat_imunisasi</strong> (Lama) ke <strong>rsia_riwayat_imunisasi</strong> (Baru).
          Tanggal pemberian akan diset sesuai <strong>Tanggal Lahir Pasien</strong>.
        </div>

        <div class="row mb-3">
            <div class="col-md-4">
                <input type="text" class="form-control" v-model="search" placeholder="Cari Pasien...">
            </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="bg-light">
              <tr>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Tgl Lahir</th>
                <th>Imunisasi (Lama)</th>
                <th>Dosis Ke</th>
                <th>Estimasi Mapping</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">Memuat data...</td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-4">Tidak ada data lama ditemukan.</td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="index">
                <td>{{ item.no_rkm_medis }}</td>
                <td>{{ item.nm_pasien }}</td>
                <td>{{ item.tgl_lahir }}</td>
                <td>
                    <span class="badge bg-secondary">{{ item.kode_imunisasi }}</span> 
                    {{ item.nama_imunisasi }}
                </td>
                <td>{{ item.no_imunisasi }}</td>
                <td>
                    {{ getMappingPreview(item) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-end mt-3" v-if="pagination.total > 0">
             <nav aria-label="Page navigation">
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
                        <button class="page-link" @click="changePage(pagination.current_page - 1)">Previous</button>
                    </li>
                    <li class="page-item disabled">
                        <span class="page-link">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
                    </li>
                    <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
                        <button class="page-link" @click="changePage(pagination.current_page + 1)">Next</button>
                    </li>
                </ul>
            </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api' 
import Swal from 'sweetalert2'

const items = ref([])
const loading = ref(false)
const transferring = ref(false)
const search = ref('')
const pagination = ref({
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: 0
})

let debounceTimer = null

watch(search, (newVal) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        fetchData(1)
    }, 500)
})

const fetchData = async (page = 1) => {
    loading.value = true
    try {
        const response = await api.get('/pasien/transfer-imunisasi', {
            params: {
                page: page,
                q: search.value
            }
        })
        items.value = response.data.data
        pagination.value = response.data
    } catch (error) {
        console.error("Error fetching data:", error)
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        fetchData(page)
    }
}

const getMappingPreview = (item) => {
    const mappings = {
        '01': { name: 'Hepatitis B (HB0)', age: 0 },
        '02': { name: 'BCG', age: 1 },
        '05': { 
            1: { name: 'DPT-HB-Hib 1', age: 2 }, 
            2: { name: 'DPT-HB-Hib 2', age: 3 }, 
            3: { name: 'DPT-HB-Hib 3', age: 4 } 
        },
        '08': { name: 'Campak Rubella (MR)', age: 9 }, 
        '16': { name: 'Campak Rubella (MR)', age: 9 }, 
        '07': { name: 'Polio Suntik (IPV)', age: 4 }
    }
    
    if (mappings[item.kode_imunisasi]) {
        let map = mappings[item.kode_imunisasi]
        
        // Handle specific dose mapping (check if map has nested structure/dose keys)
        // Simple check: if map has 'name' property directly, it's generic. Else check dose.
        if (!map.name) {
             if (map[item.no_imunisasi]) {
                 map = map[item.no_imunisasi]
             } else {
                 return 'Dosis tidak dikenali'
             }
        }
        
        // Calculate estimated date
        let estDate = '?'
        if (item.tgl_lahir) {
            const date = new Date(item.tgl_lahir)
            date.setMonth(date.getMonth() + map.age)
            estDate = date.toISOString().split('T')[0]
        }

        return `${map.name} (Est. Tgl: ${estDate})`
    }
    return 'Belum dimapping / Unknown'
}

const doTransfer = async () => {
    const result = await Swal.fire({
        title: 'Mulai Transfer?',
        text: "Proses ini akan menyalin data lama ke tabel baru. Data yang sudah ada tidak akan diduplikasi.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Mulai!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        transferring.value = true
        try {
            const response = await api.post('/pasien/transfer-imunisasi', {
                q: search.value
            })
            Swal.fire('Berhasil!', response.data.message, 'success')
            fetchData() // Refresh
        } catch (error) {
            Swal.fire('Error!', 'Terjadi kesalahan saat transfer data.', 'error')
            console.error(error)
        } finally {
            transferring.value = false
        }
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.transfer-imunisasi-container {
    padding: 20px;
}
</style>
