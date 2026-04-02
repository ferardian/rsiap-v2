<template>
  <div class="satusehat-medication">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 text-dark fw-bold">Mapping Obat KFA (SatuSehat)</h4>
        <p class="text-muted mb-0">Pemetaan Master Barang (Obat) dengan Kamus Farmasi dan Alat Kesehatan</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="fetchData">
          <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label text-muted text-xs fw-bold tracking-wider text-uppercase">Status Mapping</label>
            <select class="form-select" v-model="filter.status_map" @change="fetchData">
              <option value="all">Semua Status</option>
              <option value="unmapped">Belum Di-map</option>
              <option value="mapped">Sudah Di-map</option>
              <option value="not_synced">Belum Sinkron Server</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label text-muted text-xs fw-bold tracking-wider text-uppercase">Pencarian</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input type="text" class="form-control border-start-0 ps-0" v-model="filter.keyword" placeholder="Cari Kode Barang / Nama Obat..." @keyup.enter="fetchData" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-4">Kode Barang</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang (SIMRS)</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Mapping KFA</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!data.length">
                <td colspan="4" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-pills fa-3x text-muted mb-3"></i>
                    <h6 class="text-dark">Tidak ada data obat ditemukan</h6>
                  </div>
                </td>
              </tr>
              <tr v-for="item in data" :key="item.kode_brng">
                <td class="ps-4">
                  <span class="text-sm fw-bold text-dark">{{ item.kode_brng }}</span>
                   <div class="text-xs text-muted">{{ item.nm_jns }}</div>
                </td>
                <td>
                  <span class="text-sm text-dark">{{ item.nama_brng }}</span>
                  <div v-if="item.nama_industri" class="text-xs text-muted mt-1"><i class="fas fa-industry me-1"></i> {{ item.nama_industri }}</div>
                </td>
                <td>
                  <div v-if="item.is_mapped" class="d-flex flex-column">
                    <span class="text-sm fw-bold text-success"><i class="fas fa-check-circle me-1"></i> {{ item.obat_display }}</span>
                    <span class="text-xs text-muted">KFA: {{ item.obat_code }}</span>
                    <span v-if="item.id_medication" class="text-xs text-info"><i class="fas fa-id-card me-1"></i> ID FHIR: {{ item.id_medication }}</span>
                  </div>
                  <div v-else>
                    <span class="badge bg-light text-danger border border-danger"><i class="fas fa-times-circle me-1"></i> Belum Di-map</span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-primary mb-0" @click="openKfaModal(item)" title="Cari Mapping KFA">
                      <i class="fas fa-search"></i> Cari KFA
                    </button>
                    <button v-if="item.is_mapped" class="btn btn-sm btn-info mb-0" @click="syncMedication(item)" :disabled="syncingId === item.kode_brng" title="Kirim ke SatuSehat">
                      <i class="fas fa-cloud-upload-alt" :class="{ 'fa-spin': syncingId === item.kode_brng }"></i> 
                      <span v-if="item.is_synced" class="ms-1"><i class="fas fa-check"></i></span>
                    </button>
                    <button v-if="item.is_mapped" class="btn btn-sm btn-outline-danger mb-0" @click="deleteMapping(item)" title="Hapus Mapping">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer border-0 bg-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-sm text-muted">
            Menampilkan {{ meta.from || 0 }} - {{ meta.to || 0 }} dari {{ meta.total || 0 }} data
          </span>
          <nav v-if="meta.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
                <button class="page-link" @click="changePage(meta.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: meta.current_page === page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
                <button class="page-link" @click="changePage(meta.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal KFA Search -->
    <div class="modal fade" id="kfaModal" tabindex="-1" aria-hidden="true" ref="kfaModal">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Pencarian Kamus Farmasi (KFA)</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info border-0 d-flex align-items-center">
              <i class="fas fa-info-circle fa-2x me-3"></i>
              <div>
                <h6 class="mb-0 fw-bold">Memetakan Obat: {{ selectedObat?.nama_brng }}</h6>
                <span class="text-xs">Kode: {{ selectedObat?.kode_brng }}</span>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-8">
                <div class="input-group">
                  <input type="text" class="form-control" v-model="kfaSearch.keyword" placeholder="Masukkan kata kunci pencarian (mis: panadol)..." @keyup.enter="searchKfa">
                  <button class="btn btn-primary" type="button" @click="searchKfa" :disabled="kfaLoading">
                    <i class="fas fa-search me-1" :class="{'fa-spin': kfaLoading}"></i> Cari KFA
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive" style="max-height: 400px;">
              <table class="table table-sm table-bordered table-hover align-middle">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>KFA Code</th>
                    <th>Nama Produk</th>
                    <th>Bentuk (Form)</th>
                    <th>Rute (Route)</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="kfaLoading">
                    <td colspan="5" class="text-center py-4">Mencari di SatuSehat Kemkes...</td>
                  </tr>
                  <tr v-else-if="!kfaProducts.length">
                    <td colspan="5" class="text-center py-4 text-muted">Gunakan form pencarian di atas untuk mencari daftar obat.</td>
                  </tr>
                  <tr v-for="kfa in kfaProducts" :key="kfa.kfa_code">
                    <td class="text-sm fw-bold">{{ kfa.kfa_code }}</td>
                    <td class="text-sm">{{ kfa.name }}</td>
                    <td class="text-xs">{{ kfa.dosage_form?.name || '-' }}</td>
                    <td class="text-xs">{{ kfa.route?.name || '-' }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-success mb-0" @click="pilihKfa(kfa)" :disabled="savingKfa">
                        <i class="fas fa-check"></i> Pilih
                      </button>
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
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import Swal from 'sweetalert2'
import * as bootstrap from 'bootstrap'

export default {
  name: 'SatuSehatMedicationView',
  data() {
    return {
      loading: false,
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      },
      filter: {
        status_map: 'all',
        keyword: ''
      },

      // KFA Modal
      modalInstance: null,
      selectedObat: null,
      kfaSearch: {
        keyword: ''
      },
      kfaProducts: [],
      kfaLoading: false,
      savingKfa: false,
      syncingId: null
    }
  },
  computed: {
    displayedPages() {
      const current = this.meta.current_page
      const last = this.meta.last_page
      let start = Math.max(1, current - 2)
      let end = Math.min(last, start + 4)
      
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    this.fetchData()
    this.modalInstance = new bootstrap.Modal(this.$refs.kfaModal)
    
    // Reset state modal when closed
    this.$refs.kfaModal.addEventListener('hidden.bs.modal', () => {
      this.selectedObat = null
      this.kfaProducts = []
    })
  },
  methods: {
    async fetchData() {
      if (this.loading) return
      
      this.loading = true
      try {
        const response = await satuSehatService.getKfaObatLokal({
          status_map: this.filter.status_map,
          keyword: this.filter.keyword,
          page: this.meta.current_page
        })
        
        if (response.data?.success) {
          const resPath = response.data.data
          this.data = resPath.data || []
          this.meta = {
            current_page: resPath.current_page,
            last_page: resPath.last_page,
            total: resPath.total,
            from: resPath.from,
            to: resPath.to
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: error.response?.data?.message || 'Terjadi kesalahan pada server'
        })
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.meta.last_page) {
        this.meta.current_page = page
        this.fetchData()
      }
    },

    // ======== KFA SEARCH & MAPPING ========
    openKfaModal(obat) {
      this.selectedObat = obat
      // Preset keyword dengan nama obat pertama kali dicoba (kata pertama)
      this.kfaSearch.keyword = obat.nama_brng.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')
      this.modalInstance.show()
    },
    async searchKfa() {
      if (!this.kfaSearch.keyword) return
      
      this.kfaLoading = true
      this.kfaProducts = []
      try {
        const response = await satuSehatService.searchKfa({
          keyword: this.kfaSearch.keyword,
          product_type: 'farmasi'
        })

        if (response.data?.success && response.data.data?.items?.data) {
           this.kfaProducts = response.data.data.items.data
        } else {
           Swal.fire('Tidak Ditemukan', 'Obat tidak ditemukan di KFA dengan kata kunci tersebut.', 'info')
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal mencari data KFA ke Kemkes.', 'error')
      } finally {
        this.kfaLoading = false
      }
    },
    async pilihKfa(kfa) {
      this.savingKfa = true
      try {
        const payload = {
          kode_brng: this.selectedObat.kode_brng,
          obat_code: kfa.kfa_code,
          obat_system: 'http://sys-ids.kemkes.go.id/kfa',
          obat_display: kfa.name,
          form_code: kfa.dosage_form?.code || null,
          form_system: kfa.dosage_form?.code ? 'http://terminology.kemkes.go.id/CodeSystem/medication-form' : null,
          form_display: kfa.dosage_form?.name || null,
          route_code: kfa.route?.code || null,
          route_system: kfa.route?.code ? 'http://terminology.kemkes.go.id/CodeSystem/route-codes' : null,
          route_display: kfa.route?.name || null,
          denominator_code: kfa.active_ingredients?.[0]?.denominator?.code || null,
          denominator_system: kfa.active_ingredients?.[0]?.denominator?.code ? 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm' : null,
          numerator_code: kfa.active_ingredients?.[0]?.numerator?.code || null,
          numerator_system: kfa.active_ingredients?.[0]?.numerator?.code ? 'http://unitsofmeasure.org' : null
        }

        const res = await satuSehatService.saveKfaMapping(payload)
        if (res.data?.success) {
          Swal.fire({
             icon: 'success', title: 'Berhasil', text: 'Obat berhasil di-mapping', timer: 1500, showConfirmButton: false
          })
          this.modalInstance.hide()
          this.fetchData()
        }
      } catch (error) {
         Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan mapping.', 'error')
      } finally {
         this.savingKfa = false
      }
    },
    async deleteMapping(obat) {
       const result = await Swal.fire({
          title: 'Hapus Mapping?',
          text: `Anda yakin ingin menghapus mapping KFA untuk obat ${obat.nama_brng}?`,
          icon: 'warning',
          showCancelButton: true
       })
       if (!result.isConfirmed) return

       try {
           await satuSehatService.deleteKfaMapping(obat.kode_brng)
           this.fetchData()
       } catch (error) {
           Swal.fire('Error', 'Gagal menghapus', 'error')
       }
    },

    // ======== SYNC TO MEDICATION ========
    async syncMedication(obat) {
      this.syncingId = obat.kode_brng
      try {
        const response = await satuSehatService.syncKfaMedication({
          kode_brng: obat.kode_brng
        })

        if (response.data?.success) {
           Swal.fire({ icon: 'success', title: 'Sukses', text: 'Medication terdaftar di SatuSehat', timer: 2000 })
           obat.is_synced = 1
           if (response.data.id_medication) {
             obat.id_medication = response.data.id_medication
           }
        } else {
            Swal.fire('Error', response.data?.message || 'Gagal', 'error')
        }
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan jaringan', 'error')
      } finally {
        this.syncingId = null
      }
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
