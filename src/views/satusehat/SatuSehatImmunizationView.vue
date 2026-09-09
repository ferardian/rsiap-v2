<template>
  <div class="satusehat-immunization-page">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
      <div>
        <h5 class="text-base font-bold text-slate-800 flex items-center gap-2 m-0">
          <span class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm shadow-sm">
            <i class="fas fa-syringe"></i>
          </span>
          Integrasi SatuSehat — Imunisasi Pasien (Immunization)
        </h5>
        <p class="text-slate-400 text-xs mt-0.5 mb-0">
          Sinkronisasi catatan pemberian vaksin rawat jalan & rawat inap ke spesifikasi FHIR R4 Immunization
        </p>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button 
          type="button"
          class="btn-header-action btn-mapping"
          @click="openMappingModal"
        >
          <i class="fas fa-vial text-xs"></i>
          <span>Pemetaan Vaksin</span>
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
          <span>{{ syncLoading ? 'Syncing...' : 'Sync Pending' }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm flex-shrink-0">
          <i class="fas fa-shield-virus"></i>
        </div>
        <div>
          <div class="text-[11px] text-slate-400 font-medium leading-none">Total Pemberian Vaksin</div>
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
            placeholder="Cari No. Rawat, Pasien, RM, Nama Vaksin, Dokter..." 
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
              <option value="tgl_perawatan">Tgl Pemberian</option>
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
            <span class="filter-pill-label"><i class="fas fa-check-circle mr-1"></i>Status:</span>
            <select class="filter-pill-select" v-model="filters.status" @change="fetchData(true)">
              <option value="all">Semua Status</option>
              <option value="synced">Sudah Tersinkron</option>
              <option value="unsynced">Belum Tersinkron</option>
            </select>
          </div>

          <!-- Reset Filter -->
          <button 
            type="button" 
            class="btn-reset-filter"
            @click="resetFilters" 
            title="Reset Filter"
          >
            <i class="fas fa-undo text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider text-[11px] uppercase">
              <th class="py-3 px-3 w-12 text-center">No</th>
              <th class="py-3 px-3">Tanggal Pemberian</th>
              <th class="py-3 px-3">Data Pasien</th>
              <th class="py-3 px-3">Vaksin & Kode KFA</th>
              <th class="py-3 px-3">Batch & Dosis</th>
              <th class="py-3 px-3">Unit / Petugas</th>
              <th class="py-3 px-3 text-center">Status Sync</th>
              <th class="py-3 px-3 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="8" class="text-center py-12 text-slate-400">
                <i class="fas fa-circle-notch fa-spin text-2xl text-teal-500 mb-2"></i>
                <div class="text-xs font-medium">Memuat data imunisasi pasien...</div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="text-center py-12 text-slate-400">
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <i class="fas fa-syringe text-lg"></i>
                </div>
                <div class="text-xs font-bold text-slate-600">Tidak ada data imunisasi ditemukan</div>
                <div class="text-[11px] text-slate-400 mt-0.5">Coba ubah filter periode tanggal atau kata kunci pencarian.</div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr 
              v-else 
              v-for="(item, index) in items" 
              :key="itemRowKey(item)"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- No -->
              <td class="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
              </td>

              <!-- Tanggal Pemberian & Registrasi -->
              <td class="py-3 px-3">
                <div class="font-bold text-slate-800 text-xs">
                  {{ formatDate(item.tgl_perawatan) }}
                </div>
                <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <i class="far fa-clock"></i> {{ item.jam }} WIB
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  Reg: <span class="font-mono">{{ formatDate(item.tgl_registrasi) }}</span>
                </div>
              </td>

              <!-- Pasien -->
              <td class="py-3 px-3">
                <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>{{ item.nm_pasien }}</span>
                  <span 
                    :class="[
                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                      item.status_lanjut === 'Ranap' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    ]"
                  >
                    {{ item.status_lanjut }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                  RM: <span class="font-semibold text-slate-700">{{ item.no_rkm_medis }}</span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  No. Rawat: {{ item.no_rawat }}
                </div>
                <div class="text-[10px] font-mono mt-0.5" :class="item.no_ktp ? 'text-slate-500' : 'text-rose-500 font-bold'">
                  NIK: {{ item.no_ktp || 'Belum ada NIK' }}
                </div>
              </td>

              <!-- Vaksin & Kode KFA -->
              <td class="py-3 px-3">
                <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <i class="fas fa-capsules text-teal-500 text-[10px]"></i>
                  <span>{{ item.nama_brng }}</span>
                </div>
                
                <div class="mt-1.5 flex flex-wrap items-center gap-1">
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-mono font-bold">
                    <i class="fas fa-barcode text-[8px]"></i>
                    {{ item.vaksin_code }}
                  </span>
                  <span class="text-[10px] text-slate-600 font-medium">
                    {{ item.vaksin_display }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  {{ item.vaksin_system }}
                </div>
              </td>

              <!-- Batch & Dosis -->
              <td class="py-3 px-3">
                <div class="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                  <span class="text-slate-400 text-[10px]">Batch:</span>
                  <span class="font-mono font-bold" :class="item.no_batch ? 'text-slate-800' : 'text-amber-600'">
                    {{ item.no_batch || '(Tanpa Batch)' }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-500 mt-1">
                  Dosis: <span class="font-semibold text-slate-800">{{ item.jml }} {{ item.dose_quantity_unit || 'mL' }}</span>
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  Rute: <span class="font-medium text-slate-700">{{ item.route_display || 'Intramuskular' }}</span>
                </div>
                <div v-if="item.aturan" class="text-[10px] text-slate-400 italic mt-0.5">
                  "{{ item.aturan }}"
                </div>
              </td>

              <!-- Unit / Petugas -->
              <td class="py-3 px-3">
                <div class="text-xs font-semibold text-slate-700">
                  {{ item.nm_poli || '-' }}
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5">
                  {{ item.nm_dokter || '-' }}
                </div>
                <div class="text-[10px] font-mono mt-0.5" :class="item.ktppraktisi ? 'text-slate-400' : 'text-amber-500 font-bold'">
                  NIK Dr: {{ item.ktppraktisi || 'Belum ada NIK' }}
                </div>
              </td>

              <!-- Status Sinkronisasi -->
              <td class="py-3 px-3 text-center">
                <!-- Encounter check -->
                <div class="mb-1">
                  <span 
                    v-if="item.id_encounter" 
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    title="Encounter SatuSehat Aktif"
                  >
                    <i class="fas fa-check-circle text-[8px]"></i> Enc OK
                  </span>
                  <span 
                    v-else 
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                    title="Encounter Belum Tersinkron"
                  >
                    <i class="fas fa-exclamation-triangle text-[8px]"></i> No Enc
                  </span>
                </div>

                <!-- Immunization status -->
                <div v-if="item.id_immunization">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <i class="fas fa-check-double text-[9px]"></i> Tersinkron
                  </span>
                  <div class="text-[9px] text-slate-400 font-mono mt-1 max-w-[120px] truncate mx-auto" :title="item.id_immunization">
                    {{ item.id_immunization }}
                  </div>
                </div>
                <div v-else>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <i class="fas fa-clock text-[9px]"></i> Belum Sync
                  </span>
                </div>
              </td>

              <!-- Aksi -->
              <td class="py-3 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Tombol Kirim / Update -->
                  <button 
                    type="button" 
                    :class="[
                      'btn-row-action',
                      item.id_immunization ? 'btn-update' : 'btn-send'
                    ]"
                    :disabled="singleLoadingKey === itemRowKey(item) || !item.id_encounter || !item.no_ktp || !item.ktppraktisi"
                    @click="handleSendSingle(item)"
                    :title="getSendButtonTitle(item)"
                  >
                    <i :class="[
                      'text-[10px]',
                      singleLoadingKey === itemRowKey(item) 
                        ? 'fas fa-circle-notch fa-spin' 
                        : (item.id_immunization ? 'fas fa-redo-alt' : 'fas fa-paper-plane')
                    ]"></i>
                    <span>{{ item.id_immunization ? 'Perbarui' : 'Kirim' }}</span>
                  </button>

                  <!-- Tombol Preview JSON -->
                  <button 
                    type="button" 
                    class="btn-row-json"
                    @click="openJsonPreview(item)"
                    title="Lihat Preview Payload JSON"
                  >
                    <i class="fas fa-code text-[10px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-semibold text-slate-700">{{ pagination.from || 0 }}</span> - 
          <span class="font-semibold text-slate-700">{{ pagination.to || 0 }}</span> dari 
          <span class="font-semibold text-slate-700">{{ pagination.total || 0 }}</span> data imunisasi
        </div>

        <div class="flex items-center gap-1 self-end sm:self-auto">
          <button 
            type="button"
            class="btn-page-nav" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left text-[10px]"></i>
          </button>

          <button 
            v-for="p in displayedPages" 
            :key="p" 
            type="button"
            :class="['btn-page-num', { 'active': p === pagination.current_page }]"
            @click="changePage(p)"
          >
            {{ p }}
          </button>

          <button 
            type="button"
            class="btn-page-nav" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1: PREVIEW JSON PAYLOAD -->
    <div 
      class="modal fade" 
      id="jsonPreviewModal" 
      tabindex="-1" 
      aria-labelledby="jsonPreviewModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-2xl overflow-hidden">
          <div class="modal-header bg-slate-900 text-white px-4 py-3 border-0">
            <h6 class="modal-title text-sm font-bold flex items-center gap-2 m-0" id="jsonPreviewModalLabel">
              <i class="fas fa-file-code text-teal-400"></i>
              <span>Preview Payload FHIR R4 (Immunization)</span>
            </h6>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-slate-950">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-400">Target Endpoint: <code class="text-teal-400 font-mono">POST /fhir-r4/v1/Immunization</code></span>
              <button 
                type="button" 
                class="btn-copy-json"
                @click="copyJsonPayload"
              >
                <i class="fas fa-copy text-xs"></i>
                <span>Salin JSON</span>
              </button>
            </div>
            <pre class="json-code-box"><code>{{ formattedJsonPayload }}</code></pre>
          </div>
          <div class="modal-footer bg-slate-900 border-0 px-4 py-2.5 flex justify-end">
            <button type="button" class="btn btn-sm btn-secondary text-xs px-3 py-1.5 rounded-lg" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 2: KELOLA PEMETAAN VAKSIN (satu_sehat_mapping_vaksin) -->
    <div 
      class="modal fade" 
      id="mappingVaksinModal" 
      tabindex="-1" 
      aria-labelledby="mappingVaksinModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-xl rounded-2xl overflow-hidden">
          <div class="modal-header bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 border-0">
            <h6 class="modal-title text-sm font-bold flex items-center gap-2 m-0" id="mappingVaksinModalLabel">
              <i class="fas fa-vial"></i>
              <span>Pemetaan Master Vaksin SatuSehat (satu_sehat_mapping_vaksin)</span>
            </h6>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 bg-slate-50">
            <!-- Form Input / Edit Mapping -->
            <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
              <h6 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i class="fas fa-edit text-teal-600"></i>
                <span>{{ isEditMapping ? 'Edit Pemetaan Vaksin' : 'Tambah Pemetaan Vaksin Baru' }}</span>
              </h6>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <!-- Barang Farmasi -->
                <div class="sm:col-span-2 lg:col-span-1">
                  <label class="modal-form-label">Obat Farmasi SIMRS <span class="text-rose-500">*</span></label>
                  <div class="relative">
                    <input 
                      type="text" 
                      v-model="searchItemQuery" 
                      class="modal-form-input mb-1"
                      placeholder="Ketik nama obat untuk mencari..."
                      @input="searchAvailableItems"
                      :disabled="isEditMapping"
                    >
                    <!-- Dropdown suggest -->
                    <div v-if="itemSuggestions.length > 0 && !isEditMapping" class="item-suggestions-box">
                      <div 
                        v-for="sug in itemSuggestions" 
                        :key="sug.kode_brng"
                        class="suggestion-row"
                        @click="selectItem(sug)"
                      >
                        <div class="font-bold text-slate-800 text-xs">{{ sug.nama_brng }}</div>
                        <div class="text-[10px] text-slate-400 font-mono">Kode: {{ sug.kode_brng }} | Satuan: {{ sug.kode_sat }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-if="formMapping.kode_brng" class="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200 mt-1">
                    Terpilih: {{ formMapping.nama_brng || formMapping.kode_brng }} ({{ formMapping.kode_brng }})
                  </div>
                </div>

                <!-- Kode Vaksin KFA / CVX -->
                <div>
                  <label class="modal-form-label">Kode KFA / CVX <span class="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="formMapping.vaksin_code" 
                    class="modal-form-input" 
                    placeholder="e.g. 93001282, VG45, 198"
                  >
                  <div class="text-[10px] text-slate-400 mt-0.5">Kode KFA Produk / Grup Vaksin (VG*) atau CVX</div>
                </div>

                <!-- Display Vaksin -->
                <div>
                  <label class="modal-form-label">Nama Display Vaksin <span class="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="formMapping.vaksin_display" 
                    class="modal-form-input" 
                    placeholder="e.g. Vaksin DTP - HB - Hib 0,5 mL (PENTABIO)"
                  >
                </div>

                <!-- System URI -->
                <div>
                  <label class="modal-form-label">Sistem Terminologi Vaksin</label>
                  <select v-model="formMapping.vaksin_system" class="modal-form-input">
                    <option value="http://sys-ids.kemkes.go.id/kfa">http://sys-ids.kemkes.go.id/kfa (KFA Kemenkes)</option>
                    <option value="http://hl7.org/fhir/sid/cvx">http://hl7.org/fhir/sid/cvx (CVX International)</option>
                  </select>
                </div>

                <!-- Rute Pemberian -->
                <div>
                  <label class="modal-form-label">Rute Pemberian</label>
                  <select v-model="formMapping.route_code" class="modal-form-input" @change="handleRouteChange">
                    <option value="inj.intramuscular">Injeksi Intramuskular (inj.intramuscular)</option>
                    <option value="inj.subcutaneous">Injeksi Subkutan (inj.subcutaneous)</option>
                    <option value="O">Oral / Tetes Mulut (O)</option>
                    <option value="inj.intravenous">Injeksi Intravena (inj.intravenous)</option>
                  </select>
                </div>

                <!-- Dosis Satuan -->
                <div>
                  <label class="modal-form-label">Satuan Dosis</label>
                  <div class="flex items-center gap-2">
                    <input 
                      type="text" 
                      v-model="formMapping.dose_quantity_unit" 
                      class="modal-form-input w-24 text-center font-bold" 
                      placeholder="mL"
                    >
                    <button 
                      type="button" 
                      class="btn-save-mapping flex-1"
                      @click="saveMapping"
                      :disabled="saveMappingLoading || !formMapping.kode_brng || !formMapping.vaksin_code"
                    >
                      <i :class="saveMappingLoading ? 'fas fa-circle-notch fa-spin' : 'fas fa-save'"></i>
                      <span>{{ isEditMapping ? 'Simpan Perubahan' : 'Simpan Pemetaan' }}</span>
                    </button>
                    <button 
                      v-if="isEditMapping"
                      type="button"
                      class="btn-cancel-edit"
                      @click="resetFormMapping"
                      title="Batal Edit"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- List Existing Mappings -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i class="fas fa-list text-teal-600"></i>
                <span>Daftar Vaksin Terpetakan ({{ mappingList.length }})</span>
              </span>
              <div class="relative w-64">
                <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  v-model="mappingSearch" 
                  class="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                  placeholder="Cari nama obat / kode KFA..."
                >
              </div>
            </div>

            <div class="max-h-72 overflow-y-auto border border-slate-200 rounded-xl bg-white">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase sticky top-0">
                  <tr>
                    <th class="py-2.5 px-3">Kode Obat</th>
                    <th class="py-2.5 px-3">Nama Barang SIMRS</th>
                    <th class="py-2.5 px-3">Kode KFA / CVX</th>
                    <th class="py-2.5 px-3">Display Vaksin</th>
                    <th class="py-2.5 px-3">Rute</th>
                    <th class="py-2.5 px-3">Dosis</th>
                    <th class="py-2.5 px-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="filteredMappings.length === 0">
                    <td colspan="7" class="text-center py-6 text-slate-400 text-xs">
                      Belum ada data pemetaan vaksin yang cocok.
                    </td>
                  </tr>
                  <tr 
                    v-else 
                    v-for="map in filteredMappings" 
                    :key="map.kode_brng"
                    class="hover:bg-slate-50/80 transition-colors"
                  >
                    <td class="py-2 px-3 font-mono text-[11px] font-semibold text-slate-700">{{ map.kode_brng }}</td>
                    <td class="py-2 px-3 font-medium text-slate-800">{{ map.nama_brng || '-' }}</td>
                    <td class="py-2 px-3">
                      <span class="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-mono font-bold text-[10px] border border-teal-200">
                        {{ map.vaksin_code }}
                      </span>
                    </td>
                    <td class="py-2 px-3 text-slate-700">{{ map.vaksin_display }}</td>
                    <td class="py-2 px-3 text-slate-500">{{ map.route_display || map.route_code }}</td>
                    <td class="py-2 px-3 text-slate-600 font-mono">{{ map.dose_quantity_unit || 'mL' }}</td>
                    <td class="py-2 px-3 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button 
                          type="button" 
                          class="btn-edit-map"
                          @click="editMapping(map)"
                          title="Edit Pemetaan"
                        >
                          <i class="fas fa-edit text-[10px]"></i>
                        </button>
                        <button 
                          type="button" 
                          class="btn-delete-map"
                          @click="deleteMapping(map.kode_brng)"
                          title="Hapus Pemetaan"
                        >
                          <i class="fas fa-trash-alt text-[10px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-slate-100 border-0 px-4 py-2.5 flex justify-end">
            <button type="button" class="btn btn-sm btn-secondary text-xs px-3 py-1.5 rounded-lg" data-bs-dismiss="modal">Tutup</button>
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
  name: 'SatuSehatImmunizationView',
  data() {
    return {
      items: [],
      loading: false,
      syncLoading: false,
      singleLoadingKey: null,
      
      // Modals
      mappingModalInstance: null,
      jsonModalInstance: null,
      previewItem: null,
      
      // Mapping State
      mappingList: [],
      mappingSearch: '',
      saveMappingLoading: false,
      isEditMapping: false,
      searchItemQuery: '',
      itemSuggestions: [],
      searchItemTimeout: null,
      
      formMapping: {
        kode_brng: '',
        nama_brng: '',
        vaksin_code: '',
        vaksin_system: 'http://sys-ids.kemkes.go.id/kfa',
        vaksin_display: '',
        route_code: 'inj.intramuscular',
        route_system: 'http://www.whocc.no/atc',
        route_display: 'Injection Intramuscular',
        dose_quantity_code: 'ml',
        dose_quantity_system: 'http://unitsofmeasure.org',
        dose_quantity_unit: 'mL',
      },

      filters: {
        tglAwal: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        tglAkhir: dayjs().format('YYYY-MM-DD'),
        filterBy: 'tgl_perawatan',
        status: 'all',
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

    filteredMappings() {
      if (!this.mappingSearch.trim()) return this.mappingList
      const q = this.mappingSearch.toLowerCase()
      return this.mappingList.filter(m => 
        (m.kode_brng && m.kode_brng.toLowerCase().includes(q)) ||
        (m.nama_brng && m.nama_brng.toLowerCase().includes(q)) ||
        (m.vaksin_code && m.vaksin_code.toLowerCase().includes(q)) ||
        (m.vaksin_display && m.vaksin_display.toLowerCase().includes(q))
      )
    },

    formattedJsonPayload() {
      if (!this.previewItem) return ''
      const item = this.previewItem
      
      const payload = {
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: item.vaksin_system || 'http://sys-ids.kemkes.go.id/kfa',
              code: item.vaksin_code || 'VG45',
              display: item.vaksin_display || item.nama_brng
            }
          ]
        },
        patient: {
          reference: `Patient/${item.no_ktp ? 'Lookup-by-NIK-' + item.no_ktp : '100000030009'}`,
          display: item.nm_pasien
        },
        encounter: {
          reference: `Encounter/${item.id_encounter || 'belum-ada-encounter'}`
        },
        occurrenceDateTime: `${item.tgl_perawatan}T${item.jam || '09:00:00'}+07:00`,
        recorded: item.tgl_perawatan,
        primarySource: true,
        lotNumber: item.no_batch && item.no_batch.trim() !== '' ? item.no_batch.trim() : '-',
        route: {
          coding: [
            {
              system: item.route_system || 'http://www.whocc.no/atc',
              code: item.route_code || 'inj.intramuscular',
              display: item.route_display || 'Injection Intramuscular'
            }
          ]
        },
        doseQuantity: {
          value: parseFloat(item.jml || 1),
          unit: item.dose_quantity_unit || 'mL',
          system: item.dose_quantity_system || 'http://unitsofmeasure.org',
          code: item.dose_quantity_code || 'ml'
        },
        performer: [
          {
            function: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0443',
                  code: 'AP',
                  display: 'Administering Provider'
                }
              ]
            },
            actor: {
              reference: `Practitioner/${item.ktppraktisi ? 'Lookup-by-NIK-' + item.ktppraktisi : 'N10000001'}`
            }
          }
        ],
        reasonCode: [
          {
            coding: [
              {
                system: 'http://terminology.kemkes.go.id/CodeSystem/immunization-reason',
                code: 'IM-Dasar',
                display: 'Imunisasi Program Rutin Dasar'
              }
            ]
          }
        ],
        protocolApplied: [
          {
            doseNumberPositiveInt: 1
          }
        ]
      }

      if (item.id_lokasi_ralan) {
        payload.location = {
          reference: `Location/${item.id_lokasi_ralan}`,
          display: item.nm_poli || 'Ruang Poliklinik'
        }
      }

      if (item.id_immunization) {
        payload.id = item.id_immunization
      }

      return JSON.stringify(payload, null, 2)
    }
  },
  mounted() {
    this.fetchData(true)
    this.initModals()
  },
  methods: {
    initModals() {
      const mappingEl = document.getElementById('mappingVaksinModal')
      if (mappingEl) {
        this.mappingModalInstance = new Modal(mappingEl)
      }
      const jsonEl = document.getElementById('jsonPreviewModal')
      if (jsonEl) {
        this.jsonModalInstance = new Modal(jsonEl)
      }
    },

    itemRowKey(item) {
      return `${item.no_rawat}_${item.tgl_perawatan}_${item.jam}_${item.kode_brng}`
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      return dayjs(dateStr).format('DD/MM/YYYY')
    },

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
          search: this.filters.search,
          page: this.filters.page,
          per_page: this.pagination.per_page,
        }

        const res = await satuSehatService.getImmunizations(params)
        if (res.data && res.data.success) {
          const payload = res.data.data
          this.items = payload.data || []
          this.pagination.current_page = payload.current_page
          this.pagination.last_page = payload.last_page
          this.pagination.total = payload.total
          this.pagination.from = payload.from
          this.pagination.to = payload.to

          if (res.data.stats) {
            this.stats = res.data.stats
          }
        }
      } catch (err) {
        console.error('Error fetching immunization data:', err)
        Swal.fire('Error', 'Gagal memuat data imunisasi: ' + (err.response?.data?.message || err.message), 'error')
      } finally {
        this.loading = false
      }
    },

    changePage(p) {
      if (p < 1 || p > this.pagination.last_page || p === this.pagination.current_page) return
      this.filters.page = p
      this.fetchData(false)
    },

    resetFilters() {
      this.filters.search = ''
      this.filters.status = 'all'
      this.filters.filterBy = 'tgl_perawatan'
      this.filters.tglAwal = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      this.filters.tglAkhir = dayjs().format('YYYY-MM-DD')
      this.fetchData(true)
    },

    getSendButtonTitle(item) {
      if (!item.id_encounter) return 'Tidak bisa dikirim: Encounter belum tersinkron'
      if (!item.no_ktp) return 'Tidak bisa dikirim: NIK Pasien belum diisi'
      if (!item.ktppraktisi) return 'Tidak bisa dikirim: NIK Dokter pemeriksa belum diisi'
      return item.id_immunization ? 'Perbarui data ke SatuSehat' : 'Kirim data ke SatuSehat'
    },

    async handleSendSingle(item) {
      const key = this.itemRowKey(item)
      this.singleLoadingKey = key

      try {
        const payload = {
          no_rawat: item.no_rawat,
          tgl_perawatan: item.tgl_perawatan,
          jam: item.jam,
          kode_brng: item.kode_brng,
          no_batch: item.no_batch || '',
          no_faktur: item.no_faktur || '',
        }

        const res = await satuSehatService.sendSingleImmunization(payload)
        if (res.data && res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: res.data.message || 'Data Imunisasi berhasil disinkronkan ke SatuSehat.',
            timer: 2000,
            showConfirmButton: false,
          })
          item.id_immunization = res.data.id
          this.stats.synced++
          if (this.stats.unsynced > 0) this.stats.unsynced--
        } else {
          Swal.fire('Gagal', res.data?.message || 'Gagal mengirim data imunisasi', 'error')
        }
      } catch (err) {
        console.error('Send error:', err)
        const msg = err.response?.data?.message || err.message
        Swal.fire('Gagal Kirim', msg, 'error')
      } finally {
        this.singleLoadingKey = null
      }
    },

    async handleSyncBatch() {
      const confirm = await Swal.fire({
        title: 'Sinkronkan Data Imunisasi?',
        text: `Sistem akan mengirim seluruh catatan pemberian vaksin yang belum tersinkron pada periode ${dayjs(this.filters.tglAwal).format('DD/MM/YYYY')} s/d ${dayjs(this.filters.tglAkhir).format('DD/MM/YYYY')}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Sinkronkan Sekarang',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#0d9488',
      })

      if (!confirm.isConfirmed) return

      this.syncLoading = true
      try {
        const res = await satuSehatService.syncImmunization({
          tglAwal: this.filters.tglAwal,
          tglAkhir: this.filters.tglAkhir,
          filterBy: this.filters.filterBy,
        })

        if (res.data && res.data.success) {
          Swal.fire('Sinkronisasi Selesai', res.data.message, 'success')
          this.fetchData(false)
        } else {
          Swal.fire('Gagal', res.data?.message || 'Gagal sinkronisasi batch', 'error')
        }
      } catch (err) {
        console.error('Batch sync error:', err)
        Swal.fire('Error', 'Terjadi kesalahan: ' + (err.response?.data?.message || err.message), 'error')
      } finally {
        this.syncLoading = false
      }
    },

    openJsonPreview(item) {
      this.previewItem = item
      if (this.jsonModalInstance) {
        this.jsonModalInstance.show()
      }
    },

    copyJsonPayload() {
      if (!this.formattedJsonPayload) return
      navigator.clipboard.writeText(this.formattedJsonPayload).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Tersalin!',
          text: 'Payload JSON berhasil disalin ke clipboard.',
          timer: 1500,
          showConfirmButton: false,
        })
      })
    },

    // ==========================================
    // PEMETAAN VAKSIN (MAPPING)
    // ==========================================
    async openMappingModal() {
      if (this.mappingModalInstance) {
        this.mappingModalInstance.show()
      }
      this.resetFormMapping()
      await this.loadMappings()
    },

    async loadMappings() {
      try {
        const res = await satuSehatService.getImmunizationMappings({ per_page: 100 })
        if (res.data && res.data.success) {
          this.mappingList = res.data.data?.data || res.data.data || []
        }
      } catch (err) {
        console.error('Error load mappings:', err)
      }
    },

    searchAvailableItems() {
      clearTimeout(this.searchItemTimeout)
      if (!this.searchItemQuery || this.searchItemQuery.trim().length < 2) {
        this.itemSuggestions = []
        return
      }

      this.searchItemTimeout = setTimeout(async () => {
        try {
          const res = await satuSehatService.getAvailableVaccineItems({ search: this.searchItemQuery })
          if (res.data && res.data.success) {
            this.itemSuggestions = res.data.data || []
          }
        } catch (err) {
          console.error('Search item error:', err)
        }
      }, 300)
    },

    selectItem(item) {
      this.formMapping.kode_brng = item.kode_brng
      this.formMapping.nama_brng = item.nama_brng
      this.searchItemQuery = item.nama_brng
      this.itemSuggestions = []

      // Prefill display if empty
      if (!this.formMapping.vaksin_display) {
        this.formMapping.vaksin_display = item.nama_brng
      }
      if (item.vaksin_code) {
        this.formMapping.vaksin_code = item.vaksin_code
      }
    },

    handleRouteChange() {
      const code = this.formMapping.route_code
      if (code === 'inj.intramuscular') {
        this.formMapping.route_display = 'Injection Intramuscular'
        this.formMapping.route_system = 'http://www.whocc.no/atc'
      } else if (code === 'inj.subcutaneous') {
        this.formMapping.route_display = 'Subkutan Injeksi (di bawah kulit)'
        this.formMapping.route_system = 'http://www.whocc.no/atc'
      } else if (code === 'O') {
        this.formMapping.route_display = 'Oral'
        this.formMapping.route_system = 'http://www.whocc.no/atc'
      } else if (code === 'inj.intravenous') {
        this.formMapping.route_display = 'Injection Intravenous'
        this.formMapping.route_system = 'http://www.whocc.no/atc'
      }
    },

    editMapping(map) {
      this.isEditMapping = true
      this.formMapping.kode_brng = map.kode_brng
      this.formMapping.nama_brng = map.nama_brng || map.kode_brng
      this.searchItemQuery = map.nama_brng || map.kode_brng
      this.formMapping.vaksin_code = map.vaksin_code
      this.formMapping.vaksin_system = map.vaksin_system || 'http://sys-ids.kemkes.go.id/kfa'
      this.formMapping.vaksin_display = map.vaksin_display || map.nama_brng
      this.formMapping.route_code = map.route_code || 'inj.intramuscular'
      this.formMapping.route_system = map.route_system || 'http://www.whocc.no/atc'
      this.formMapping.route_display = map.route_display || 'Injection Intramuscular'
      this.formMapping.dose_quantity_code = map.dose_quantity_code || 'ml'
      this.formMapping.dose_quantity_system = map.dose_quantity_system || 'http://unitsofmeasure.org'
      this.formMapping.dose_quantity_unit = map.dose_quantity_unit || 'mL'
      this.itemSuggestions = []
    },

    resetFormMapping() {
      this.isEditMapping = false
      this.searchItemQuery = ''
      this.itemSuggestions = []
      this.formMapping = {
        kode_brng: '',
        nama_brng: '',
        vaksin_code: '',
        vaksin_system: 'http://sys-ids.kemkes.go.id/kfa',
        vaksin_display: '',
        route_code: 'inj.intramuscular',
        route_system: 'http://www.whocc.no/atc',
        route_display: 'Injection Intramuscular',
        dose_quantity_code: 'ml',
        dose_quantity_system: 'http://unitsofmeasure.org',
        dose_quantity_unit: 'mL',
      }
    },

    async saveMapping() {
      if (!this.formMapping.kode_brng || !this.formMapping.vaksin_code || !this.formMapping.vaksin_display) {
        Swal.fire('Perhatian', 'Mohon lengkapi data barang, kode KFA/CVX, dan display vaksin.', 'warning')
        return
      }

      this.saveMappingLoading = true
      try {
        const res = await satuSehatService.saveImmunizationMapping(this.formMapping)
        if (res.data && res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Tersimpan',
            text: res.data.message || 'Mapping vaksin berhasil disimpan.',
            timer: 1500,
            showConfirmButton: false,
          })
          this.resetFormMapping()
          await this.loadMappings()
          this.fetchData(false)
        } else {
          Swal.fire('Gagal', res.data?.message || 'Gagal menyimpan mapping vaksin', 'error')
        }
      } catch (err) {
        console.error('Save mapping error:', err)
        Swal.fire('Error', err.response?.data?.message || err.message, 'error')
      } finally {
        this.saveMappingLoading = false
      }
    },

    async deleteMapping(kodeBrng) {
      const confirm = await Swal.fire({
        title: 'Hapus Pemetaan?',
        text: `Apakah Anda yakin ingin menghapus pemetaan untuk kode barang ${kodeBrng}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#e11d48',
      })

      if (!confirm.isConfirmed) return

      try {
        const res = await satuSehatService.deleteImmunizationMapping(kodeBrng)
        if (res.data && res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Terhapus',
            text: res.data.message,
            timer: 1500,
            showConfirmButton: false,
          })
          await this.loadMappings()
          this.fetchData(false)
        }
      } catch (err) {
        console.error('Delete mapping error:', err)
        Swal.fire('Error', 'Gagal menghapus: ' + (err.response?.data?.message || err.message), 'error')
      }
    }
  }
}
</script>

<style scoped>
.satusehat-immunization-page {
  padding: 16px 20px;
}

/* Header Buttons */
.btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-mapping {
  background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%) !important;
  color: #ffffff !important;
  border-radius: 9999px !important;
  padding: 6px 16px !important;
}

.btn-mapping:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25) !important;
}

.btn-refresh {
  background: #ffffff;
  color: #475569;
  border-color: #cbd5e1;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-sync {
  background: #0d9488 !important;
  color: #ffffff !important;
}

.btn-sync:hover:not(:disabled) {
  background: #0f766e !important;
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
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
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
  background: #0d9488;
  color: #ffffff;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.filter-pill-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
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
  gap: 4px;
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
  background: #0d9488 !important;
  color: #ffffff !important;
}

.btn-send:hover:not(:disabled) {
  background: #0f766e !important;
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

.btn-row-json {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-row-json:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Pagination Buttons */
.btn-page-nav {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-page-nav:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
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
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-page-num.active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}

/* Modal Styling */
.modal-form-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.modal-form-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.15s ease;
}

.modal-form-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
}

.btn-save-mapping {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  background: #0d9488 !important;
  color: #ffffff !important;
  font-size: 11px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-mapping:hover:not(:disabled) {
  background: #0f766e !important;
}

.btn-cancel-edit {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-edit-map {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #0284c7;
  border: 1px solid #e0f2fe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-edit-map:hover {
  background: #0284c7;
  color: white;
}

.btn-delete-map {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #ffe4e6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-delete-map:hover {
  background: #e11d48;
  color: white;
}

/* Suggestion dropdown */
.item-suggestions-box {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 180px;
  overflow-y: auto;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.suggestion-row {
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.1s ease;
}

.suggestion-row:hover {
  background: #f0fdfa;
}

/* JSON Code Box */
.json-code-box {
  background: #020617;
  color: #38bdf8;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 11px;
  max-height: 380px;
  overflow-y: auto;
  border: 1px solid #1e293b;
  margin: 0;
}

.btn-copy-json {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy-json:hover {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}
</style>
