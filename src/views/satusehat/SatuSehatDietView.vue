<template>
  <div class="satusehat-diet-view">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <div class="flex items-center gap-2 mb-0.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm shadow-sm">
            <i class="fas fa-utensils"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-800 m-0 tracking-tight">
            Diet Pasien <span class="text-blue-600 font-medium">SatuSehat</span>
          </h2>
        </div>
        <p class="text-xs text-slate-500 m-0">
          Sinkronisasi instruksi diet ADIME Gizi (LOINC 42344-2 / Discharge Diet) ke platform SatuSehat FHIR R4
        </p>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button 
          type="button"
          class="btn-header-action btn-refresh"
          @click="fetchData(false)" 
          :disabled="loading"
        >
          <i :class="['fas fa-sync-alt text-xs', { 'fa-spin': loading }]"></i>
          <span>Refresh</span>
        </button>
        <button 
          type="button"
          class="btn-header-action btn-sync"
          @click="handleSyncBatch" 
          :disabled="syncLoading"
        >
          <i :class="['fas text-xs', syncLoading ? 'fa-circle-notch fa-spin' : 'fa-cloud-upload-alt']"></i>
          <span>{{ syncLoading ? 'Syncing...' : 'Sync All Pending' }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Catatan Diet</div>
          <div class="text-lg font-bold text-slate-800 leading-tight">{{ pagination.total || items.length }}</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data Terkirim</div>
          <div class="text-lg font-bold text-emerald-600 leading-tight">{{ items.filter(i => i.id_diet).length }}</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-clock"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Belum Terkirim</div>
          <div class="text-lg font-bold text-amber-600 leading-tight">{{ items.filter(i => !i.id_diet).length }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm mb-4">
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <!-- Search -->
        <div class="relative flex-1 min-w-[220px] max-w-sm">
          <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          <input 
            type="text" 
            class="filter-input-search"
            v-model="filters.keyword" 
            placeholder="Cari No. Rawat, Pasien, RM, Petugas..." 
            @keyup.enter="fetchData(true)"
          >
          <button 
            type="button"
            class="btn-search-trigger"
            @click="fetchData(true)"
            title="Cari"
          >
            <i class="fas fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Basis -->
          <div class="filter-pill">
            <span class="filter-pill-label"><i class="fas fa-sliders-h mr-1"></i>Basis:</span>
            <select class="filter-pill-select" v-model="filters.filterBy" @change="fetchData(true)">
              <option value="tanggal_catatan">Tgl Catatan</option>
              <option value="tgl_registrasi">Tgl Registrasi</option>
            </select>
          </div>

          <!-- Periode -->
          <div class="filter-pill">
            <span class="filter-pill-label"><i class="fas fa-calendar-alt mr-1"></i>Periode:</span>
            <input type="date" class="filter-pill-date" v-model="filters.tglAwal" @change="fetchData(true)">
            <span class="text-slate-300 mx-1 text-xs">-</span>
            <input type="date" class="filter-pill-date" v-model="filters.tglAkhir" :min="filters.tglAwal" @change="fetchData(true)">
          </div>

          <!-- Status -->
          <div class="filter-pill">
            <span class="filter-pill-label"><i class="fas fa-filter mr-1"></i>Status:</span>
            <select class="filter-pill-select" v-model="filters.status" @change="fetchData(true)">
              <option value="all">Semua</option>
              <option value="unsynced">Belum Sync</option>
              <option value="synced">Sudah Kirim</option>
            </select>
          </div>

          <!-- Reset Filter Button -->
          <button 
            type="button"
            class="btn-reset-filter"
            @click="resetFilters" 
            title="Reset filter"
          >
            <i class="fas fa-undo text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-2.5 px-3" style="width: 175px;">No. Rawat & Reg</th>
              <th class="py-2.5 px-3" style="width: 200px;">Pasien</th>
              <th class="py-2.5 px-3" style="width: 190px;">Petugas & Waktu Gizi</th>
              <th class="py-2.5 px-3">Diet / Intervensi Gizi</th>
              <th class="py-2.5 px-3 text-center" style="width: 120px;">Status Sync</th>
              <th class="py-2.5 px-3 text-end" style="width: 95px;">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <p class="text-slate-400 text-xs mt-2 mb-0">Memuat data diet pasien...</p>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center py-10">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-base">
                  <i class="fas fa-utensils"></i>
                </div>
                <div class="font-medium text-slate-700 text-xs mb-0.5">Tidak ada catatan diet ditemukan</div>
                <div class="text-[11px] text-slate-400">Coba sesuaikan periode tanggal atau kata kunci pencarian</div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="(item, index) in items" :key="index" class="hover:bg-slate-50/60 transition-colors" v-else>
              <!-- Rawat & Reg -->
              <td class="py-2.5 px-3">
                <div class="font-mono font-bold text-slate-800 text-xs">{{ item.no_rawat }}</div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span :class="['px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none', item.status_lanjut === 'Ranap' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700']">
                    {{ item.status_lanjut }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    <i class="far fa-calendar-alt mr-0.5"></i>{{ item.tgl_registrasi }}
                  </span>
                </div>
                <div class="mt-1">
                  <span v-if="item.id_encounter" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" :title="'Encounter ID: ' + item.id_encounter">
                    <i class="fas fa-link text-[9px]"></i> Encounter
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200" title="Encounter belum tersinkron">
                    <i class="fas fa-unlink text-[9px]"></i> No Encounter
                  </span>
                </div>
              </td>

              <!-- Pasien -->
              <td class="py-2.5 px-3">
                <div class="font-bold text-slate-800 text-xs">{{ item.nm_pasien }}</div>
                <div class="mt-0.5">
                  <span class="inline-block px-1.5 py-0.2 bg-slate-100 text-blue-700 font-semibold rounded text-[10px]">
                    RM: {{ item.no_rkm_medis }}
                  </span>
                </div>
                <div class="mt-1">
                  <span 
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                    :class="item.no_ktp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  >
                    <i class="fas text-[9px]" :class="item.no_ktp ? 'fa-id-card' : 'fa-exclamation-triangle'"></i>
                    {{ item.no_ktp || 'NIK Kosong' }}
                  </span>
                </div>
              </td>

              <!-- Petugas & Waktu -->
              <td class="py-2.5 px-3">
                <div class="font-semibold text-slate-700 text-xs">
                  <i class="fas fa-user-nurse text-slate-400 mr-1"></i>{{ item.nm_petugas }}
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  <i class="far fa-clock mr-1"></i>{{ item.tanggal }}
                </div>
                <div class="mt-1">
                  <span 
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                    :class="item.ktppraktisi ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  >
                    <i class="fas text-[9px]" :class="item.ktppraktisi ? 'fa-id-card' : 'fa-exclamation-triangle'"></i>
                    {{ item.ktppraktisi || 'NIK Petugas Kosong' }}
                  </span>
                </div>
              </td>

              <!-- Diet / Intervensi Gizi -->
              <td class="py-2.5 px-3">
                <div class="bg-slate-50/80 border border-slate-200/80 rounded-lg p-2.5 w-full">
                  <div class="text-xs text-slate-800 font-medium break-words leading-relaxed whitespace-pre-line">
                    {{ item.diet_teks || item.intervensi || item.instruksi }}
                  </div>
                  <div v-if="item.instruksi && item.instruksi !== '-' && item.instruksi !== (item.diet_teks || item.intervensi)" class="mt-1 text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    <span class="font-semibold text-slate-600">Instruksi:</span> {{ item.instruksi }}
                  </div>
                  <div class="mt-1 pt-1 border-t border-slate-200/60">
                    <button 
                      type="button"
                      class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline p-0 border-0 bg-transparent inline-flex items-center gap-1"
                      @click="openDetail(item)"
                    >
                      <i class="fas fa-notes-medical text-[10px]"></i>Detail ADIME
                    </button>
                  </div>
                </div>
              </td>

              <!-- Status Sync -->
              <td class="py-2.5 px-3 text-center">
                <div v-if="item.id_diet" class="inline-flex flex-col items-center">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <i class="fas fa-check-circle text-emerald-600 text-[10px]"></i> Terkirim
                  </span>
                  <span class="text-[10px] font-mono text-slate-400 mt-0.5" :title="item.id_diet">
                    {{ item.id_diet.substring(0, 8) }}...
                  </span>
                </div>
                <div v-else>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <i class="fas fa-hourglass-start text-amber-600 text-[10px]"></i> Belum Sync
                  </span>
                </div>
              </td>

              <!-- Aksi -->
              <td class="py-2.5 px-3 text-end">
                <button 
                  type="button"
                  class="btn-row-action"
                  :class="item.id_diet ? 'btn-update' : 'btn-send'"
                  @click="handleSendSingle(item)"
                  :disabled="singleLoadingKey === (item.no_rawat + item.tanggal) || !item.id_encounter || !item.no_ktp || !item.ktppraktisi"
                  :title="item.id_diet ? 'Perbarui data di SatuSehat' : 'Kirim data ke SatuSehat'"
                >
                  <span v-if="singleLoadingKey === (item.no_rawat + item.tanggal)" class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></span>
                  <i v-else :class="['fas text-[10px] mr-1', item.id_diet ? 'fa-redo' : 'fa-paper-plane']"></i>
                  {{ item.id_diet ? 'Update' : 'Kirim' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-3 py-2.5 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2" v-if="pagination.total > 0">
        <div class="text-[11px] text-slate-500">
          Menampilkan <span class="font-semibold text-slate-700">{{ pagination.from || 0 }}</span> - <span class="font-semibold text-slate-700">{{ pagination.to || 0 }}</span> dari <span class="font-semibold text-slate-700">{{ pagination.total }}</span> data
        </div>
        <div class="flex items-center gap-1" v-if="pagination.last_page > 1">
          <button 
            class="btn-page-nav" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left text-[10px]"></i>
          </button>
          <button 
            v-for="page in displayedPages" 
            :key="page" 
            class="btn-page-num"
            :class="{ 'active': page === pagination.current_page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="btn-page-nav" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detail ADIME -->
    <div class="modal fade" id="modalAdimeDetail" tabindex="-1" aria-hidden="true" ref="adimeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-2xl overflow-hidden">
          <div class="modal-header bg-slate-50 border-b border-slate-200 px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <i class="fas fa-notes-medical"></i>
              </div>
              <div>
                <h6 class="text-sm font-bold text-slate-800 m-0 leading-tight">Detail ADIME Gizi</h6>
                <span class="text-[11px] text-slate-400" v-if="selectedItem">{{ selectedItem.no_rawat }} - {{ selectedItem.nm_pasien }}</span>
              </div>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="selectedItem">
            <div class="flex flex-col gap-2.5">
              <div class="adime-card">
                <span class="adime-label">A - Asesmen</span>
                <div class="adime-value">{{ selectedItem.asesmen || '-' }}</div>
              </div>
              <div class="adime-card">
                <span class="adime-label">D - Diagnosis</span>
                <div class="adime-value">{{ selectedItem.diagnosis || '-' }}</div>
              </div>
              <div class="adime-card">
                <span class="adime-label">I - Intervensi</span>
                <div class="adime-value">{{ selectedItem.intervensi || '-' }}</div>
              </div>
              <div class="adime-card">
                <span class="adime-label">M - Monitoring</span>
                <div class="adime-value">{{ selectedItem.monitoring || '-' }}</div>
              </div>
              <div class="adime-card">
                <span class="adime-label">E - Evaluasi</span>
                <div class="adime-value">{{ selectedItem.evaluasi || '-' }}</div>
              </div>
              <div class="adime-card highlight">
                <span class="adime-label text-blue-700">Diet / Intervensi Gizi (Dikirim ke SatuSehat)</span>
                <div class="adime-value font-bold text-blue-700 whitespace-pre-line">{{ selectedItem.diet_teks || selectedItem.intervensi }}</div>
                <div v-if="selectedItem.instruksi && selectedItem.instruksi !== '-'" class="mt-2 pt-1.5 border-t border-blue-200/60 text-[11px] text-blue-800">
                  <span class="font-bold">Instruksi Tambahan:</span> {{ selectedItem.instruksi }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end">
            <button 
              type="button" 
              class="btn-modal-close" 
              data-bs-dismiss="modal"
            >
              <i class="fas fa-times text-xs"></i>
              <span>Tutup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

export default {
  name: 'SatuSehatDietView',
  data() {
    return {
      items: [],
      loading: false,
      syncLoading: false,
      singleLoadingKey: null,
      selectedItem: null,
      adimeModalInstance: null,
      filters: {
        filterBy: 'tanggal_catatan',
        tglAwal: dayjs().format('YYYY-MM-DD'),
        tglAkhir: dayjs().format('YYYY-MM-DD'),
        status: 'all',
        keyword: ''
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      }
    }
  },
  computed: {
    displayedPages() {
      let pages = []
      let start = Math.max(1, this.pagination.current_page - 2)
      let end = Math.min(this.pagination.last_page, start + 4)
      if (end - start < 4) start = Math.max(1, end - 4)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData(resetPage = false) {
      if (resetPage) this.pagination.current_page = 1
      this.loading = true
      try {
        const response = await satuSehatService.getDiets({
          tglAwal: this.filters.tglAwal,
          tglAkhir: this.filters.tglAkhir,
          filterBy: this.filters.filterBy,
          status: this.filters.status,
          keyword: this.filters.keyword,
          page: this.pagination.current_page
        })

        if (response.data && response.data.success) {
          this.items = response.data.data.data
          this.pagination = {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            total: response.data.data.total,
            from: response.data.data.from,
            to: response.data.data.to
          }
        }
      } catch (error) {
        console.error('Error fetching diets:', error)
        Swal.fire('Gagal', 'Gagal memuat data diet pasien', 'error')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters.filterBy = 'tanggal_catatan'
      this.filters.tglAwal = dayjs().format('YYYY-MM-DD')
      this.filters.tglAkhir = dayjs().format('YYYY-MM-DD')
      this.filters.status = 'all'
      this.filters.keyword = ''
      this.fetchData(true)
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page && page !== this.pagination.current_page) {
        this.pagination.current_page = page
        this.fetchData()
      }
    },
    openDetail(item) {
      this.selectedItem = item
      if (!this.adimeModalInstance && this.$refs.adimeModal) {
        this.adimeModalInstance = new Modal(this.$refs.adimeModal)
      }
      if (this.adimeModalInstance) {
        this.adimeModalInstance.show()
      }
    },
    async handleSendSingle(item) {
      const isUpdate = !!item.id_diet
      const confirmText = isUpdate
        ? `Perbarui data diet ${item.nm_pasien} di SatuSehat?`
        : `Kirim data diet ${item.nm_pasien} ke SatuSehat?`

      const result = await Swal.fire({
        title: isUpdate ? 'Perbarui Diet?' : 'Kirim Diet?',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: isUpdate ? 'Ya, Perbarui' : 'Ya, Kirim',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb'
      })

      if (result.isConfirmed) {
        const key = item.no_rawat + item.tanggal
        this.singleLoadingKey = key
        try {
          const response = await satuSehatService.sendSingleDiet({
            no_rawat: item.no_rawat,
            tanggal: item.tanggal
          })

          if (response.data && response.data.success) {
            Swal.fire({
              title: 'Berhasil',
              text: response.data.message,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            })
            if (response.data.id_diet) {
              item.id_diet = response.data.id_diet
            }
          } else {
            Swal.fire('Gagal', response.data.message || 'Gagal mengirim data', 'error')
          }
        } catch (error) {
          const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan'
          Swal.fire('Gagal', msg, 'error')
        } finally {
          this.singleLoadingKey = null
        }
      }
    },
    async handleSyncBatch() {
      const result = await Swal.fire({
        title: 'Sinkronisasi Massal',
        text: `Kirim semua data diet belum sync untuk periode ${this.filters.tglAwal} s/d ${this.filters.tglAkhir}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Jalankan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb'
      })

      if (result.isConfirmed) {
        this.syncLoading = true
        try {
          const response = await satuSehatService.syncDiet({
            tglAwal: this.filters.tglAwal,
            tglAkhir: this.filters.tglAkhir
          })

          if (response.data && response.data.success) {
            Swal.fire('Berjalan di Background', response.data.message, 'success')
          }
        } catch (error) {
          Swal.fire('Gagal', 'Gagal memulai background sinkronisasi', 'error')
        } finally {
          this.syncLoading = false
        }
      }
    }
  }
}
</script>

<style scoped>
/* Header buttons - explicit strict sizing & single-line */
.btn-header-action {
  height: 34px !important;
  line-height: 34px !important;
  padding: 0 12px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  white-space: nowrap !important;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: none;
}

.btn-refresh {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-refresh:hover:not(:disabled) {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

.btn-sync {
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn-sync:hover:not(:disabled) {
  background: #1d4ed8 !important;
}

.btn-header-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filter Search */
.filter-input-search {
  width: 100%;
  height: 32px !important;
  padding-left: 28px !important;
  padding-right: 30px !important;
  font-size: 12px !important;
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  background: #ffffff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease;
}

.filter-input-search:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 1px #2563eb;
}

.btn-search-trigger {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-search-trigger:hover {
  background: #1d4ed8;
}

/* Filter Pills */
.filter-pill {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
}

.filter-pill-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-right: 4px;
  white-space: nowrap;
}

.filter-pill-select {
  background: transparent;
  border: none !important;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  padding: 0 2px;
  height: 100%;
}

.filter-pill-date {
  background: transparent;
  border: none !important;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  padding: 0 2px;
  width: 105px;
  height: 100%;
}

/* Reset Filter Button - ABSOLUTELY CANNOT STRETCH */
.btn-reset-filter {
  width: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  height: 32px !important;
  flex: 0 0 32px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #64748b !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-filter:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}

/* Row Action Buttons */
.btn-row-action {
  height: 28px !important;
  line-height: 28px !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  border: none;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-send {
  background: #2563eb !important;
  color: #ffffff !important;
}

.btn-send:hover:not(:disabled) {
  background: #1d4ed8 !important;
}

.btn-update {
  background: #6366f1 !important;
  color: #ffffff !important;
}

.btn-update:hover:not(:disabled) {
  background: #4f46e5 !important;
}

.btn-row-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pagination Buttons */
.btn-page-nav {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page-num {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-page-num.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  font-weight: 700;
}

/* Modal ADIME */
.adime-card {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.adime-card.highlight {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.adime-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  display: block;
  margin-bottom: 2px;
}

.adime-value {
  font-size: 12px;
  color: #1e293b;
  white-space: pre-line;
}

/* Modal Close Button */
.btn-modal-close {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-modal-close:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}
</style>
