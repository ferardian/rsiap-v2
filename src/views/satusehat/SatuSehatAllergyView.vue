<template>
  <div class="satusehat-allergy-page">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
      <div>
        <h5 class="text-base font-bold text-slate-800 flex items-center gap-2 m-0">
          <span class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm shadow-sm">
            <i class="fas fa-allergies"></i>
          </span>
          Integrasi SatuSehat — Alergi Pasien (AllergyIntolerance)
        </h5>
        <p class="text-slate-400 text-xs mt-0.5 mb-0">
          Sinkronisasi riwayat alergi pasien dari SOAP Rawat Jalan, Rawat Inap, dan IGD ke FHIR R4 AllergyIntolerance
        </p>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button 
          type="button"
          class="btn-header-action btn-mapping"
          @click="openMappingModal"
        >
          <i class="fas fa-tags text-xs"></i>
          <span>Kelola Mapping</span>
        </button>
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
        <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-list-ul"></i>
        </div>
        <div>
          <div class="text-[11px] text-slate-400 font-medium leading-none">Total Catatan Alergi</div>
          <div class="text-lg font-bold text-slate-800 mt-1 leading-none">{{ stats.total }}</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-check-double"></i>
        </div>
        <div>
          <div class="text-[11px] text-slate-400 font-medium leading-none">Sudah Tersinkron (Synced)</div>
          <div class="text-lg font-bold text-emerald-600 mt-1 leading-none">{{ stats.synced }}</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-clock"></i>
        </div>
        <div>
          <div class="text-[11px] text-slate-400 font-medium leading-none">Belum Tersinkron (Pending)</div>
          <div class="text-lg font-bold text-amber-600 mt-1 leading-none">{{ stats.unsynced }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm mb-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input 
            type="text" 
            v-model="filters.search" 
            class="filter-search-input"
            placeholder="Cari No. Rawat, Pasien, RM, Alergen, Petugas..." 
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
              <option value="tgl_perawatan">Tgl Pemeriksaan</option>
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

          <!-- Status Sync -->
          <div class="filter-pill">
            <span class="filter-pill-label"><i class="fas fa-filter mr-1"></i>Status:</span>
            <select class="filter-pill-select" v-model="filters.status" @change="fetchData(true)">
              <option value="all">Semua</option>
              <option value="unsynced">Belum Sync</option>
              <option value="synced">Sudah Kirim</option>
            </select>
          </div>

          <!-- Status Mapping -->
          <div class="filter-pill">
            <span class="filter-pill-label"><i class="fas fa-tag mr-1"></i>Mapping:</span>
            <select class="filter-pill-select" v-model="filters.mappingStatus" @change="fetchData(true)">
              <option value="all">Semua</option>
              <option value="mapped">Ter-mapping</option>
              <option value="unmapped">Perlu Mapping</option>
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
              <th class="py-2.5 px-3" style="width: 190px;">Petugas & Waktu</th>
              <th class="py-2.5 px-3">Catatan Alergi & Mapping SatuSehat</th>
              <th class="py-2.5 px-3 text-center" style="width: 120px;">Status Sync</th>
              <th class="py-2.5 px-3 text-end" style="width: 95px;">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-rose-600 border-t-transparent"></div>
                <p class="text-slate-400 text-xs mt-2 mb-0">Memuat data alergi pasien...</p>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center py-10">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-base">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="font-medium text-slate-700 text-xs mb-0.5">Tidak ada catatan alergi ditemukan</div>
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
                  <span class="inline-block px-1.5 py-0.2 bg-slate-100 text-rose-700 font-semibold rounded text-[10px]">
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
                  <i class="fas fa-user-md text-slate-400 mr-1"></i>{{ item.nm_petugas }}
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  <i class="far fa-clock mr-1"></i>{{ item.tgl_perawatan }} {{ item.jam_rawat }}
                </div>
                <div class="mt-1 flex items-center gap-1">
                  <span class="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                    {{ item.sumber }}
                  </span>
                </div>
              </td>

              <!-- Catatan Alergi & Mapping -->
              <td class="py-2.5 px-3">
                <div class="bg-slate-50/80 border border-slate-200/80 rounded-lg p-2.5 w-full">
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-xs font-bold text-slate-800 break-words leading-snug">
                      {{ item.alergi_text }}
                    </div>
                    <!-- Badge Kategori -->
                    <span 
                      v-if="item.category" 
                      :class="['px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider', getCategoryBadgeClass(item.category)]"
                    >
                      {{ item.category }}
                    </span>
                  </div>

                  <!-- Info Mapping SNOMED / KFA -->
                  <div v-if="item.is_mapped" class="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <div class="text-slate-600 truncate mr-2" :title="item.mapping_display">
                      <i class="fas fa-check-circle text-emerald-600 text-[10px] mr-1"></i>
                      <span class="font-semibold">{{ item.mapping_display }}</span>
                    </div>
                    <span class="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 flex-shrink-0">
                      {{ item.mapping_code }}
                    </span>
                  </div>

                  <!-- Unmapped Warning -->
                  <div v-else class="mt-1.5 pt-1.5 border-t border-rose-200/60 flex items-center justify-between">
                    <span class="text-[11px] text-rose-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>Belum ter-mapping
                    </span>
                    <button 
                      type="button"
                      class="btn-quick-map"
                      @click="quickMap(item.alergi_text)"
                    >
                      <i class="fas fa-wand-magic-sparkles text-[10px]"></i>
                      <span>Petakan</span>
                      <i class="fas fa-chevron-right text-[8px] opacity-75"></i>
                    </button>
                  </div>
                </div>
              </td>

              <!-- Status Sync -->
              <td class="py-2.5 px-3 text-center">
                <div v-if="item.id_allergy" class="inline-flex flex-col items-center">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <i class="fas fa-check-circle text-emerald-600 text-[10px]"></i> Terkirim
                  </span>
                  <span class="text-[10px] font-mono text-slate-400 mt-0.5" :title="item.id_allergy">
                    {{ item.id_allergy.substring(0, 8) }}...
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
                  :class="item.id_allergy ? 'btn-update' : 'btn-send'"
                  @click="handleSendSingle(item)"
                  :disabled="singleLoadingKey === (item.no_rawat + item.tgl_perawatan + item.jam_rawat) || !item.id_encounter || !item.no_ktp || !item.ktppraktisi || !item.is_mapped"
                  :title="!item.is_mapped ? 'Harap petakan alergi terlebih dahulu' : (item.id_allergy ? 'Perbarui data di SatuSehat' : 'Kirim data ke SatuSehat')"
                >
                  <span v-if="singleLoadingKey === (item.no_rawat + item.tgl_perawatan + item.jam_rawat)" class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></span>
                  <i v-else :class="['fas text-[10px] mr-1', item.id_allergy ? 'fa-redo' : 'fa-paper-plane']"></i>
                  {{ item.id_allergy ? 'Update' : 'Kirim' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div class="text-xs text-slate-500">
          Menampilkan <span class="font-bold text-slate-700">{{ pagination.from || 0 }}</span> - <span class="font-bold text-slate-700">{{ pagination.to || 0 }}</span> dari <span class="font-bold text-slate-700">{{ pagination.total || 0 }}</span> data
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

    <!-- Modal Kelola Mapping Alergi -->
    <div class="modal fade" id="modalMappingAlergi" tabindex="-1" aria-hidden="true" ref="mappingModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-2xl overflow-hidden">
          <div class="modal-header bg-slate-50 border-b border-slate-200 px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
                <i class="fas fa-tags"></i>
              </div>
              <div>
                <h6 class="text-sm font-bold text-slate-800 m-0 leading-tight">Master Mapping Terminologi Alergi</h6>
                <span class="text-[11px] text-slate-400">Padankan kata kunci teks di SIMRS dengan kode SNOMED CT / KFA</span>
              </div>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <!-- Form Input Mapping Baru / Edit -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
              <div class="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                <i class="fas fa-plus-circle text-rose-600"></i>
                <span>Tambah / Perbarui Mapping Alergi</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <label class="modal-form-label">Kata Kunci SIMRS (Keyword)</label>
                  <input type="text" v-model="formMapping.keyword" class="modal-form-input" placeholder="contoh: udang">
                </div>
                <div>
                  <label class="modal-form-label">Kategori SatuSehat</label>
                  <select v-model="formMapping.category" class="modal-form-input">
                    <option value="food">food (Makanan)</option>
                    <option value="medication">medication (Obat)</option>
                    <option value="environment">environment (Lingkungan)</option>
                    <option value="biologic">biologic (Biologis)</option>
                  </select>
                </div>
                <div>
                  <label class="modal-form-label">Kode Terminologi</label>
                  <input type="text" v-model="formMapping.code" class="modal-form-input" placeholder="contoh: 735242007">
                </div>
                <div>
                  <label class="modal-form-label">Sistem Terminologi (URI)</label>
                  <select v-model="formMapping.system" class="modal-form-input">
                    <option value="http://snomed.info/sct">http://snomed.info/sct (SNOMED CT)</option>
                    <option value="http://sys-ids.kemkes.go.id/kfa">http://sys-ids.kemkes.go.id/kfa (KFA)</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="modal-form-label">Display Resmi (Kemenkes / SNOMED)</label>
                  <div class="flex items-center gap-2">
                    <input type="text" v-model="formMapping.display" class="modal-form-input flex-1" placeholder="contoh: Shrimp">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      @click="saveMapping"
                      :disabled="saveMappingLoading"
                    >
                      <i class="fas fa-save mr-1"></i>Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- List Existing Mappings -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-700">Daftar Kata Kunci Terdaftar ({{ mappingList.length }})</span>
              <input 
                type="text" 
                v-model="mappingSearch" 
                class="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                placeholder="Cari kata kunci..."
              >
            </div>
            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th class="py-2 px-3">Keyword</th>
                    <th class="py-2 px-3">Kategori</th>
                    <th class="py-2 px-3">Kode</th>
                    <th class="py-2 px-3">Display</th>
                    <th class="py-2 px-3 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="map in filteredMappingList" :key="map.id" class="hover:bg-slate-50">
                    <td class="py-2 px-3 font-semibold text-slate-800">{{ map.keyword }}</td>
                    <td class="py-2 px-3">
                      <span :class="['px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase', getCategoryBadgeClass(map.category)]">
                        {{ map.category }}
                      </span>
                    </td>
                    <td class="py-2 px-3 font-mono text-[11px] text-slate-500">{{ map.code }}</td>
                    <td class="py-2 px-3 text-slate-700">{{ map.display }}</td>
                    <td class="py-2 px-3 text-end">
                      <button 
                        type="button" 
                        class="btn-delete-mapping"
                        @click="deleteMapping(map.id)"
                        title="Hapus mapping"
                      >
                        <i class="fas fa-trash-alt text-xs"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredMappingList.length === 0">
                    <td colspan="5" class="py-4 text-center text-slate-400 text-xs">Tidak ada mapping yang cocok</td>
                  </tr>
                </tbody>
              </table>
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
  name: 'SatuSehatAllergyView',
  data() {
    return {
      items: [],
      loading: false,
      syncLoading: false,
      singleLoadingKey: null,
      mappingModalInstance: null,
      mappingList: [],
      mappingSearch: '',
      saveMappingLoading: false,
      formMapping: {
        keyword: '',
        category: 'food',
        code: '',
        system: 'http://snomed.info/sct',
        display: '',
      },
      filters: {
        tglAwal: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        tglAkhir: dayjs().format('YYYY-MM-DD'),
        filterBy: 'tgl_perawatan',
        status: 'all',
        mappingStatus: 'all',
        search: '',
        page: 1,
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
      },
      stats: {
        total: 0,
        synced: 0,
        unsynced: 0,
      },
    }
  },
  computed: {
    displayedPages() {
      const current = this.pagination.current_page
      const last = this.pagination.last_page
      const delta = 2
      const left = current - delta
      const right = current + delta + 1
      const range = []

      for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
          range.push(i)
        }
      }
      return range
    },
    filteredMappingList() {
      if (!this.mappingSearch) return this.mappingList
      const s = this.mappingSearch.toLowerCase()
      return this.mappingList.filter(m => 
        (m.keyword && m.keyword.toLowerCase().includes(s)) ||
        (m.display && m.display.toLowerCase().includes(s)) ||
        (m.code && m.code.toLowerCase().includes(s))
      )
    },
  },
  mounted() {
    this.fetchData(true)
    this.fetchMappings()
  },
  methods: {
    async fetchData(resetPage = false) {
      if (resetPage) {
        this.filters.page = 1
      }
      this.loading = true

      try {
        const params = {
          tglAwal: this.filters.tglAwal,
          tglAkhir: this.filters.tglAkhir,
          filterBy: this.filters.filterBy,
          status: this.filters.status,
          mapping_status: this.filters.mappingStatus,
          search: this.filters.search,
          page: this.filters.page,
          per_page: this.pagination.per_page,
        }

        const res = await satuSehatService.getAllergies(params)
        const paginatedData = res.data?.data || {}

        this.items = paginatedData.data || []
        this.pagination = {
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 15,
          total: paginatedData.total || 0,
          from: paginatedData.from || 0,
          to: paginatedData.to || 0,
        }

        if (res.data?.stats) {
          this.stats = res.data.stats
        }
      } catch (err) {
        console.error('Error fetch allergy data:', err)
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: err.response?.data?.message || 'Terjadi kesalahan saat memuat data alergi',
          confirmButtonColor: '#e11d48',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchMappings() {
      try {
        const res = await satuSehatService.getAllergyMappings()
        this.mappingList = res.data?.data || []
      } catch (err) {
        console.error('Error fetch mappings:', err)
      }
    },

    changePage(page) {
      if (page < 1 || page > this.pagination.last_page) return
      this.filters.page = page
      this.fetchData(false)
    },

    resetFilters() {
      this.filters = {
        tglAwal: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        tglAkhir: dayjs().format('YYYY-MM-DD'),
        filterBy: 'tgl_perawatan',
        status: 'all',
        mappingStatus: 'all',
        search: '',
        page: 1,
      }
      this.fetchData(true)
    },

    getCategoryBadgeClass(category) {
      switch (category) {
        case 'food':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        case 'medication':
          return 'bg-blue-50 text-blue-700 border border-blue-200'
        case 'environment':
          return 'bg-purple-50 text-purple-700 border border-purple-200'
        case 'biologic':
          return 'bg-amber-50 text-amber-700 border border-amber-200'
        default:
          return 'bg-slate-100 text-slate-600'
      }
    },

    openMappingModal() {
      if (!this.mappingModalInstance && this.$refs.mappingModal) {
        this.mappingModalInstance = new Modal(this.$refs.mappingModal)
      }
      this.fetchMappings()
      this.mappingModalInstance?.show()
    },

    quickMap(keyword) {
      this.formMapping.keyword = keyword.toLowerCase().trim()
      this.openMappingModal()
    },

    async saveMapping() {
      if (!this.formMapping.keyword || !this.formMapping.code || !this.formMapping.display) {
        Swal.fire({
          icon: 'warning',
          title: 'Input Belum Lengkap',
          text: 'Keyword, Kode, dan Display wajib diisi.',
        })
        return
      }

      this.saveMappingLoading = true
      try {
        await satuSehatService.saveAllergyMapping(this.formMapping)
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Mapping terminologi berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false,
        })
        this.formMapping = {
          keyword: '',
          category: 'food',
          code: '',
          system: 'http://snomed.info/sct',
          display: '',
        }
        await this.fetchMappings()
        this.fetchData(false)
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: err.response?.data?.message || 'Gagal menyimpan mapping.',
        })
      } finally {
        this.saveMappingLoading = false
      }
    },

    async deleteMapping(id) {
      const confirm = await Swal.fire({
        title: 'Hapus Mapping?',
        text: 'Data mapping ini akan dihapus dari kamus terminologi.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#e11d48',
      })

      if (confirm.isConfirmed) {
        try {
          await satuSehatService.deleteAllergyMapping(id)
          await this.fetchMappings()
          this.fetchData(false)
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: err.response?.data?.message || 'Gagal menghapus mapping.',
          })
        }
      }
    },

    async handleSendSingle(item) {
      const confirm = await Swal.fire({
        title: item.id_allergy ? 'Perbarui Alergi SatuSehat?' : 'Kirim Alergi ke SatuSehat?',
        html: `
          <div class="text-xs text-left">
            <div><b>Pasien:</b> ${item.nm_pasien} (${item.no_rkm_medis})</div>
            <div><b>No. Rawat:</b> ${item.no_rawat}</div>
            <div><b>Alergi:</b> ${item.alergi_text}</div>
            <div><b>Mapping:</b> ${item.mapping_display} (${item.mapping_code})</div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        confirmButtonText: item.id_allergy ? 'Ya, Update' : 'Ya, Kirim',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) return

      const key = item.no_rawat + item.tgl_perawatan + item.jam_rawat
      this.singleLoadingKey = key

      try {
        const payload = {
          no_rawat: item.no_rawat,
          tgl_perawatan: item.tgl_perawatan,
          jam_rawat: item.jam_rawat,
          alergi_text: item.alergi_text,
        }

        const res = await satuSehatService.sendSingleAllergy(payload)

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: res.data?.message || 'Data Alergi berhasil dikirim ke SatuSehat',
          timer: 2000,
          showConfirmButton: false,
        })

        this.fetchData(false)
      } catch (err) {
        console.error('Error send single allergy:', err)
        Swal.fire({
          icon: 'error',
          title: 'Pengiriman Gagal',
          text: err.response?.data?.message || 'Terjadi kesalahan saat mengirim ke SatuSehat',
          confirmButtonColor: '#e11d48',
        })
      } finally {
        this.singleLoadingKey = null
      }
    },

    async handleSyncBatch() {
      const confirm = await Swal.fire({
        title: 'Sinkronisasi Semua Alergi Pending?',
        html: `
          <p class="text-xs text-slate-500 mb-0">
            Sistem akan mengirimkan seluruh catatan alergi yang <b>ter-mapping</b> dan belum tersinkronisasi pada periode tanggal terpilih:
            <br><b>${this.filters.tglAwal} s/d ${this.filters.tglAkhir}</b>
          </p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'Mulai Sinkronisasi',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) return

      this.syncLoading = true

      try {
        const payload = {
          tglAwal: this.filters.tglAwal,
          tglAkhir: this.filters.tglAkhir,
        }

        const res = await satuSehatService.syncAllergy(payload)

        Swal.fire({
          icon: 'success',
          title: 'Sinkronisasi Selesai',
          text: res.data?.message || 'Proses sinkronisasi massal telah selesai',
          confirmButtonColor: '#e11d48',
        })

        this.fetchData(false)
      } catch (err) {
        console.error('Error sync batch allergy:', err)
        Swal.fire({
          icon: 'error',
          title: 'Sinkronisasi Gagal',
          text: err.response?.data?.message || 'Gagal memproses sinkronisasi batch',
          confirmButtonColor: '#e11d48',
        })
      } finally {
        this.syncLoading = false
      }
    },
  },
}
</script>

<style scoped>
/* Header Action Buttons */
.btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  border: none;
}

.btn-mapping {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-mapping:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-refresh {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-sync {
  background: #e11d48;
  color: #ffffff;
}

.btn-sync:hover:not(:disabled) {
  background: #be123c;
}

.btn-header-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filter Bar */
.filter-search-input {
  width: 100%;
  padding: 6px 32px 6px 28px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.15s ease;
}

.filter-search-input:focus {
  outline: none;
  background-color: #ffffff;
  border-color: #f43f5e;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.1);
}

.btn-search-trigger {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-search-trigger:hover {
  background: #f43f5e;
  color: #ffffff;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 11px;
}

.filter-pill-label {
  color: #64748b;
  font-weight: 600;
  margin-right: 6px;
}

.filter-pill-select,
.filter-pill-date {
  border: none;
  background: transparent;
  font-size: 11px;
  color: #1e293b;
  font-weight: 500;
  padding: 2px 4px;
  cursor: pointer;
}

.filter-pill-select:focus,
.filter-pill-date:focus {
  outline: none;
}

.btn-reset-filter {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-filter:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* Table Actions */
.btn-row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  white-space: nowrap;
}

.btn-send {
  background: #e11d48 !important;
  color: #ffffff !important;
}

.btn-send:hover:not(:disabled) {
  background: #be123c !important;
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
  background: #e11d48;
  border-color: #e11d48;
  color: white;
  font-weight: 700;
}

/* Modal Form Elements */
.modal-form-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  margin-bottom: 3px;
}

.modal-form-input {
  width: 100%;
  padding: 5px 8px;
  font-size: 11px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #1e293b;
}

.modal-form-input:focus {
  outline: none;
  border-color: #e11d48;
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

/* Quick Map Button (Modern, Gradient Pill, Micro-animation) */
.btn-quick-map {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid #fecdd3;
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  color: #e11d48;
  box-shadow: 0 1px 2px rgba(225, 29, 72, 0.08);
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-quick-map:hover {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  border-color: #be123c;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.28);
  transform: translateY(-1px);
}

.btn-quick-map:active {
  transform: translateY(0);
}

/* Delete Mapping Button */
.btn-delete-mapping {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #e11d48;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete-mapping:hover {
  background: #ffe4e6;
  border-color: #fecdd3;
  color: #be123c;
}
</style>
