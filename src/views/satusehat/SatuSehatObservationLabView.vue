<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import satuSehatService from '@/services/satuSehatService'
import LoadingBar from '@/components/LoadingBar.vue'
import { useDebounceFn } from '@vueuse/core'

const toast = useToast()
const loading = ref(false)
const items = ref([])
const meta = ref({})

const filters = reactive({
  tgl_awal: new Date().toISOString().substr(0, 10),
  tgl_akhir: new Date().toISOString().substr(0, 10),
  search: '',
  status: 'unsent',
  limit: 15,
  page: 1
})

const fetchData = async () => {
  loading.value = true
  try {
    const response = await satuSehatService.getObservationLab(filters)
    items.value = response.data.data
    meta.value = response.data
  } catch (error) {
    toast.error('Gagal mengambil data Observation Lab')
  } finally {
    loading.value = false
  }
}

const handleSearch = useDebounceFn(() => {
  filters.page = 1
  fetchData()
}, 500)

const handlePageChange = (page) => {
  filters.page = page
  fetchData()
}

const sendObservation = async (item) => {
  item.loading = true
  try {
    const response = await satuSehatService.sendObservationLab(item)
    if (response.success) {
      toast.success(response.message)
      item.id_observation = response.id_observation
    } else {
      toast.error(response.message || 'Gagal mengirim Observation')
    }
  } catch (error) {
    toast.error('Terjadi kesalahan sistem')
  } finally {
    item.loading = false
  }
}

const syncBatch = async () => {
  loading.value = true
  try {
    const response = await satuSehatService.syncObservationLab({
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir
    })
    toast.success('Sinkronisasi batch selesai')
    fetchData()
  } catch (error) {
    toast.error('Gagal sinkronisasi batch')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm border-0 bg-gradient-primary text-white p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-0 text-white font-weight-bold">SatuSehat Observation Lab (PK)</h4>
              <p class="mb-0 opacity-8 text-sm">Sinkronisasi hasil pemeriksaan laboratorium ke platform SatuSehat FHIR.</p>
            </div>
            <div class="icon-shape bg-white text-primary rounded-circle shadow-sm">
              <i class="fas fa-microscope"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small text-muted font-weight-bold uppercase">Periode Awal</label>
            <input type="date" class="form-control form-control-sm border-light shadow-none" v-model="filters.tgl_awal" @change="fetchData">
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted font-weight-bold uppercase">Periode Akhir</label>
            <input type="date" class="form-control form-control-sm border-light shadow-none" v-model="filters.tgl_akhir" @change="fetchData">
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted font-weight-bold uppercase">Status Sync</label>
            <select class="form-select form-select-sm border-light shadow-none" v-model="filters.status" @change="fetchData">
              <option value="all">Semua Status</option>
              <option value="sent">Sudah Terkirim</option>
              <option value="unsent">Belum Terkirim</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted font-weight-bold uppercase">Cari Pasien / No.Order</label>
            <div class="input-group input-group-sm border-light shadow-none">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="fas fa-search"></i></span>
              <input type="text" class="form-control border-start-0 ps-0 shadow-none" placeholder="Masukkan nama atau no order..." v-model="filters.search" @input="handleSearch">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
        <h6 class="mb-0 font-weight-bold text-dark">Data Hasil Pemeriksaan</h6>
        <button class="btn btn-primary btn-sm px-4 shadow-sm" :disabled="loading" @click="syncBatch">
          <i class="fas fa-sync-alt me-2" :class="{'fa-spin': loading}"></i> Sync Batch
        </button>
      </div>
      
      <LoadingBar :loading="loading" />

      <div class="table-responsive" style="min-height: 400px;">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4 text-xs font-weight-bold text-muted uppercase">Pasien & No.Order</th>
              <th class="text-xs font-weight-bold text-muted uppercase">Pemeriksaan</th>
              <th class="text-xs font-weight-bold text-muted uppercase">Hasil</th>
              <th class="text-xs font-weight-bold text-muted uppercase">Waktu Hasil</th>
              <th class="text-xs font-weight-bold text-muted uppercase">Sync Status</th>
              <th class="text-xs font-weight-bold text-muted uppercase text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="`${item.noorder}-${item.id_template}`">
              <td class="ps-4">
                <div class="d-flex flex-column">
                  <span class="text-sm font-weight-bold text-dark mb-0">{{ item.nm_pasien }}</span>
                  <span class="text-xs text-muted">{{ item.noorder }} | {{ item.no_rawat }}</span>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="text-sm font-weight-bold text-primary mb-0">{{ item.Pemeriksaan }}</span>
                  <span class="text-xs text-muted">LOINC: {{ item.code }}</span>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="text-sm font-weight-bold text-dark mb-0">{{ item.nilai }} {{ item.satuan }}</span>
                  <span class="text-xs text-muted">Ref: {{ item.nilai_rujukan }}</span>
                </div>
              </td>
              <td>
                <span class="text-xs text-dark">{{ item.tgl_hasil }} {{ item.jam_hasil }}</span>
              </td>
              <td>
                <span v-if="item.id_observation" class="badge badge-sm bg-success shadow-none font-weight-bold">
                  <i class="fas fa-check-circle me-1"></i> SENT
                </span>
                <span v-else class="badge badge-sm bg-secondary shadow-none font-weight-bold">
                  <i class="fas fa-clock me-1"></i> PENDING
                </span>
              </td>
              <td class="text-end pe-4">
                <button 
                  class="btn btn-sm shadow-none px-3" 
                  :class="item.id_observation ? 'btn-outline-success' : 'btn-outline-primary'"
                  :disabled="item.loading || !item.id_specimen"
                  @click="sendObservation(item)"
                >
                  <span v-if="item.loading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-paper-plane me-1"></i>
                  {{ item.id_observation ? 'Resend' : 'Send Observation' }}
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0 && !loading">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fas fa-clipboard-list fa-3x mb-3 opacity-2"></i>
                <p>Data tidak ditemukan untuk filter yang dipilih.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="meta.last_page > 1" class="card-footer bg-white border-top py-3">
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
              <a class="page-link shadow-none border-light" href="#" @click.prevent="handlePageChange(meta.current_page - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li v-for="page in meta.last_page" :key="page" class="page-item" :class="{ active: meta.current_page === page }">
              <a class="page-link shadow-none border-light" href="#" @click.prevent="handlePageChange(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
              <a class="page-link shadow-none border-light" href="#" @click.prevent="handlePageChange(meta.current_page + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%) !important;
}
.icon-shape {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-xs {
  font-size: 0.75rem;
}
.font-weight-bold {
  font-weight: 600;
}
.uppercase {
  text-transform: uppercase;
}
.badge-sm {
  padding: 0.45em 0.7em;
}
</style>
