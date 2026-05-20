<template>
  <div class="container-fluid py-4 page-bg">
    <!-- Header -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-12 col-md-8">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-book-medical me-2"></i>Instrumen Akreditasi RS (STARKES)
        </h3>
        <p class="text-muted mb-0">Penelusuran Bab, Pokja, Standar, dan Elemen Penilaian secara interaktif</p>
      </div>
      <div class="col-12 col-md-4 d-flex justify-content-end align-items-center">
        <!-- Search bar for global search -->
        <div class="position-relative w-100 search-wrapper">
          <input 
            type="text" 
            class="form-control shadow-sm search-input" 
            v-model="searchQuery"
            placeholder="Cari EP, Standar, atau Bukti..."
            @input="debouncedSearch"
          >
          <i class="fas fa-search position-absolute text-muted search-icon"></i>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4">
      
      <!-- Left Column: Bab & Pokja Navigation -->
      <div class="col-12 col-lg-3">
        <div class="card shadow-sm border-0 sticky-nav navigation-card">
          <div class="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-uppercase nav-header-title tracking-wider small">Daftar Pokja</span>
            <span class="badge bg-soft-primary text-primary px-2 py-1 rounded-pill small-badge">
              {{ totalPokja }} Pokja
            </span>
          </div>
          <div class="card-body p-0 custom-scrollbar" style="max-height: calc(100vh - 400px); overflow-y: auto;">
            <div v-if="loadingBab" class="text-center py-4 text-muted">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <div>Memuat data navigasi...</div>
            </div>
            
            <div v-else class="accordion accordion-flush" id="babAccordion">
              <div 
                v-for="(bab, bIdx) in babList" 
                :key="bab.id" 
                class="accordion-item border-0 border-bottom"
              >
                <h2 class="accordion-header" :id="'heading' + bab.id">
                  <button 
                    class="accordion-button collapsed px-3 py-3 fw-bold text-dark small" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="'#collapse' + bab.id" 
                    aria-expanded="false" 
                    :aria-controls="'collapse' + bab.id"
                  >
                    <div class="d-flex flex-column align-items-start">
                      <span class="badge bg-slate-label mb-1 px-2 py-1 text-white extra-small">{{ bab.kode }}</span>
                      <span class="text-wrap font-sans text-muted-dark">{{ bab.nama }}</span>
                    </div>
                  </button>
                </h2>
                <div 
                  :id="'collapse' + bab.id" 
                  class="accordion-collapse collapse" 
                  :class="{ show: bIdx === 0 }"
                  :aria-labelledby="'heading' + bab.id" 
                  data-bs-parent="#babAccordion"
                >
                  <div class="accordion-body p-0">
                    <div class="list-group list-group-flush">
                      <button 
                        v-for="pokja in bab.pokjas" 
                        :key="pokja.id"
                        type="button"
                        class="list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 px-3 py-2.5 pokja-item"
                        :class="{ 'active-pokja': selectedPokja && selectedPokja.id === pokja.id }"
                        @click="selectPokja(pokja)"
                      >
                        <div class="d-flex flex-column align-items-start w-75">
                          <span class="fw-bold font-sans tracking-wide text-dark-blue small">{{ pokja.kode }}</span>
                          <span class="text-muted extra-small text-truncate w-100 text-start">{{ pokja.nama_lengkap }}</span>
                        </div>
                        <i class="fas fa-chevron-right text-muted icon-arrow"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Legend Tipe Bukti / Metode Evaluasi -->
          <div class="card-footer bg-white border-0 border-top py-3 px-3">
            <span class="fw-bold text-uppercase text-secondary tracking-wider extra-small d-block mb-2.5">Metode Evaluasi (STARKES)</span>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-soft-danger text-danger font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">R</span>
                <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Regulasi <span class="text-muted extra-small d-inline-block">(Kebijakan, SPO, Pedoman)</span></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-soft-primary text-primary font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">D</span>
                <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Dokumen <span class="text-muted extra-small d-inline-block">(Catatan Bukti / Berkas)</span></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-soft-warning text-warning font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">O</span>
                <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Observasi <span class="text-muted extra-small d-inline-block">(Pantau Lapangan)</span></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-soft-info text-info font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">W</span>
                <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Wawancara <span class="text-muted extra-small d-inline-block">(Tanya Jawab Staf/Pasien)</span></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-soft-success text-success font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">S</span>
                <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Simulasi <span class="text-muted extra-small d-inline-block">(Peragaan Prosedur)</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Middle Column: Standards Quick Nav -->
      <div v-if="selectedPokja && !isSearching" class="col-auto d-none d-lg-block" style="width: 170px;">
        <div class="card shadow-sm border-0 sticky-nav navigation-card animate__animated animate__fadeIn">
          <div class="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-uppercase nav-header-title tracking-wider small">Daftar Standar</span>
          </div>
          <div class="card-body p-0 custom-scrollbar" style="max-height: calc(100vh - 180px); overflow-y: auto;">
            <div class="list-group list-group-flush">
              <button 
                v-for="std in standards" 
                :key="std.id"
                type="button"
                class="list-group-item list-group-item-action border-0 py-2.5 px-3 btn-quick-nav-item font-sans text-xs d-flex align-items-center justify-content-between"
                @click="scrollToStandard(std.kode)"
              >
                <span class="fw-bold">{{ std.kode }}</span>
                <i class="fas fa-chevron-right text-muted extra-small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Standards & EPs Display -->
      <div class="col-12 col-lg">
        
        <!-- Welcome / Idle state -->
        <div v-if="!selectedPokja && !isSearching" class="card shadow-sm border-0 py-5 text-center bg-white idle-card">
          <div class="card-body py-5">
            <div class="icon-circle mb-4 mx-auto animate__animated animate__pulse animate__infinite">
              <i class="fas fa-hand-holding-medical fa-3x text-primary"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Selamat Datang di Pustaka Akreditasi</h4>
            <p class="text-muted max-w-md mx-auto mb-0">
              Silakan pilih salah satu Pokja di sebelah kiri untuk menelusuri standar dan elemen penilaian secara terperinci.
            </p>
          </div>
        </div>

        <!-- Search Results State -->
        <div v-else-if="isSearching" class="d-flex flex-column gap-4">
          <div class="card shadow-sm border-0 bg-white">
            <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h5 class="fw-bold mb-1">Hasil Pencarian</h5>
                <p class="text-muted small mb-0">Menampilkan hasil pencarian untuk "{{ searchQuery }}"</p>
              </div>
              <button class="btn btn-sm btn-light border fw-bold" @click="clearSearch">
                <i class="fas fa-times me-2"></i>Kembali
              </button>
            </div>
          </div>

          <div v-if="loadingSearch" class="text-center py-5 text-muted">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <div>Mencari elemen penilaian...</div>
          </div>

          <div v-else-if="searchResults.length === 0" class="card shadow-sm border-0 py-5 text-center bg-white">
            <div class="card-body py-4">
              <i class="fas fa-search-minus fa-3x text-muted opacity-50 mb-3"></i>
              <h5 class="fw-bold text-muted">Tidak ditemukan hasil</h5>
              <p class="text-muted small">Coba masukkan kata kunci pencarian yang lain.</p>
            </div>
          </div>

          <!-- Search results list -->
          <div v-else class="d-flex flex-column gap-3">
            <div 
              v-for="ep in searchResults" 
              :key="ep.id" 
              class="card shadow-sm border-0 ep-row-card bg-white animate__animated animate__fadeInUp"
            >
              <div class="card-body p-4">
                <div class="d-flex align-items-start gap-3 flex-column flex-sm-row">
                  <span class="badge bg-soft-indigo text-indigo px-3 py-2 font-mono fw-bold fs-6 rounded-3">
                    {{ ep.kode_ep }}
                  </span>
                  <div class="flex-grow-1">
                    <p class="fw-bold text-dark mb-2 lead-statement">{{ ep.pernyataan_ep }}</p>
                    <div v-if="ep.kelengkapan_bukti" class="bg-light p-3 rounded-3 mb-2 small text-muted border-start border-primary border-3">
                      <strong class="text-secondary small text-uppercase d-block mb-1">Kelengkapan Bukti:</strong>
                      {{ ep.kelengkapan_bukti }}
                    </div>
                  </div>
                  <div class="d-flex gap-1.5 flex-wrap flex-sm-column align-items-end justify-content-start">
                    <span 
                      v-for="bukti in getBuktiList(ep.tipe_bukti)" 
                      :key="bukti"
                      class="badge bukti-badge"
                      :class="getBuktiColorClass(bukti)"
                    >
                      {{ bukti }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Pokja Standards view -->
        <div v-else class="d-flex flex-column gap-4">
          
          <!-- Pokja Header Card -->
          <div class="card shadow-sm border-0 bg-gradient-primary text-white header-card overflow-hidden position-relative">
            <div class="card-body p-4 position-relative" style="z-index: 2;">
              <div class="d-flex align-items-center gap-3">
                <div class="header-icon-box shadow">
                  <i class="fas fa-briefcase-medical fa-2x text-white"></i>
                </div>
                <div>
                  <h4 class="fw-bold font-sans mb-1">{{ selectedPokja.kode }}</h4>
                  <p class="mb-0 text-white-80 font-sans lead-text">{{ selectedPokja.nama_lengkap }}</p>
                </div>
              </div>
            </div>
            <!-- Decorative circle -->
            <div class="deco-circle"></div>
          </div>

          <!-- Loading state for standards -->
          <div v-if="loadingStandards" class="text-center py-5 text-muted bg-white card shadow-sm border-0">
            <div class="card-body py-5">
              <div class="spinner-border text-primary mb-3" role="status"></div>
              <div>Memuat data standar & elemen penilaian...</div>
            </div>
          </div>

          <!-- Empty state for standards -->
          <div v-else-if="standards.length === 0" class="card shadow-sm border-0 py-5 text-center bg-white">
            <div class="card-body py-4">
              <i class="fas fa-clipboard-list fa-3x text-muted opacity-50 mb-3"></i>
              <h5 class="fw-bold text-muted">Belum ada data standar</h5>
              <p class="text-muted small">Hubungi administrator untuk melakukan import data instrumen.</p>
            </div>
          </div>

          <!-- Standards list -->
          <div v-else class="d-flex flex-column gap-4">
            <div 
              v-for="std in standards" 
              :key="std.id" 
              :id="'standard-' + std.kode"
              class="card shadow-sm border-0 overflow-hidden standard-card bg-white animate__animated animate__fadeInUp"
            >
              <!-- Standard Header -->
              <div class="card-header bg-light border-0 py-3 px-4 d-flex align-items-center gap-3">
                <span class="badge bg-primary px-3 py-2 font-sans fw-bold rounded-3 text-white fs-6">
                  {{ std.kode }}
                </span>
                <div class="flex-grow-1">
                  <h6 class="fw-bold mb-0 text-dark font-sans leading-relaxed text-wrap text-start">{{ std.pernyataan }}</h6>
                </div>
              </div>

              <!-- Standard EPs -->
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div 
                    v-for="ep in std.elemen_penilaians" 
                    :key="ep.id" 
                    class="list-group-item p-4 border-0 border-bottom ep-item-row"
                  >
                    <div class="d-flex align-items-start gap-3 flex-column flex-md-row">
                      <!-- EP Badge (Letter) -->
                      <span class="badge bg-soft-primary text-primary px-3 py-2 font-mono fw-bold fs-6 rounded-3">
                        EP {{ ep.nomor }}
                      </span>
                      
                      <!-- EP content -->
                      <div class="flex-grow-1">
                        <p class="fw-bold text-dark mb-2 lead-statement">{{ ep.pernyataan_ep }}</p>
                        
                        <!-- Kelengkapan bukti box if exists -->
                        <div v-if="ep.kelengkapan_bukti" class="bg-light p-3 rounded-3 mb-0 small text-muted border-start border-primary border-3 mt-3">
                          <strong class="text-secondary small text-uppercase d-block mb-1">Kelengkapan Bukti:</strong>
                          {{ ep.kelengkapan_bukti }}
                        </div>
                      </div>

                      <!-- Bukti Type Badges -->
                      <div class="d-flex gap-1.5 flex-wrap flex-md-column align-items-end justify-content-start mt-2 mt-md-0">
                        <span 
                          v-for="bukti in getBuktiList(ep.tipe_bukti)" 
                          :key="bukti"
                          class="badge bukti-badge"
                          :class="getBuktiColorClass(bukti)"
                        >
                          {{ bukti }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- Floating Action Button for Mobile Quick Nav -->
    <div v-if="selectedPokja && !isSearching && standards.length > 0" class="d-lg-none position-fixed animate__animated animate__bounceIn" style="bottom: 24px; right: 24px; z-index: 1030;">
      <button 
        type="button" 
        class="btn btn-primary shadow-lg rounded-pill d-flex align-items-center gap-2 px-3 py-2.5 btn-fab"
        data-bs-toggle="offcanvas" 
        data-bs-target="#mobileStandardsOffcanvas"
        aria-controls="mobileStandardsOffcanvas"
      >
        <i class="fas fa-compass fa-lg"></i>
        <span class="fw-bold small font-sans text-white">Navigasi</span>
      </button>
    </div>

    <!-- Mobile Navigation Offcanvas (Standards & Pokja Tabs) -->
    <div 
      v-if="selectedPokja && !isSearching && standards.length > 0"
      class="offcanvas offcanvas-end border-0 rounded-start-4 shadow d-lg-none" 
      tabindex="-1" 
      id="mobileStandardsOffcanvas" 
      aria-labelledby="mobileStandardsOffcanvasLabel"
      style="width: 300px;"
    >
      <!-- Dual Tab Header -->
      <div class="offcanvas-header bg-white border-bottom py-2.5 px-3 d-flex align-items-center justify-content-between">
        <div class="nav nav-pills flex-grow-1 flex-nowrap me-2" role="tablist" style="background-color: #f1f5f9; padding: 4px; border-radius: 9999px;">
          <button 
            type="button"
            class="nav-link flex-fill py-1.5 px-2 text-center rounded-pill font-sans extra-small fw-bold border-0" 
            :class="{ active: activeOffcanvasTab === 'standards' }"
            style="font-size: 0.72rem; transition: all 0.2s;"
            @click="activeOffcanvasTab = 'standards'"
          >
            <i class="fas fa-list-ol me-1"></i> Standar
          </button>
          <button 
            type="button"
            class="nav-link flex-fill py-1.5 px-2 text-center rounded-pill font-sans extra-small fw-bold border-0" 
            :class="{ active: activeOffcanvasTab === 'pokja' }"
            style="font-size: 0.72rem; transition: all 0.2s;"
            @click="activeOffcanvasTab = 'pokja'"
          >
            <i class="fas fa-briefcase-medical me-1"></i> Pokja
          </button>
        </div>
        <button type="button" class="btn-close text-reset small" style="width: 0.8em; height: 0.8em;" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      <!-- Offcanvas Body -->
      <div class="offcanvas-body p-0 custom-scrollbar bg-light-gray" style="overflow-y: auto;">
        
        <!-- Tab Content 1: Standards List -->
        <div v-show="activeOffcanvasTab === 'standards'" class="animate__animated animate__fadeIn animate__faster">
          <div class="list-group list-group-flush bg-white">
            <button 
              v-for="std in standards" 
              :key="std.id"
              type="button"
              class="list-group-item list-group-item-action border-0 py-3 px-4 btn-quick-nav-item font-sans d-flex align-items-center justify-content-between"
              data-bs-dismiss="offcanvas"
              @click="scrollToStandard(std.kode)"
            >
              <span class="fw-bold text-dark-blue">{{ std.kode }}</span>
              <i class="fas fa-chevron-right text-muted extra-small"></i>
            </button>
          </div>
        </div>

        <!-- Tab Content 2: Pokja Accordion Navigation -->
        <div v-show="activeOffcanvasTab === 'pokja'" class="animate__animated animate__fadeIn animate__faster">
          <div class="accordion accordion-flush" id="mobileBabAccordion">
            <div 
              v-for="bab in babList" 
              :key="bab.id" 
              class="accordion-item border-0 border-bottom"
            >
              <h2 class="accordion-header" :id="'m-heading' + bab.id">
                <button 
                  class="accordion-button collapsed px-3 py-3 fw-bold text-dark small" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  :data-bs-target="'#m-collapse' + bab.id" 
                  aria-expanded="false" 
                  :aria-controls="'m-collapse' + bab.id"
                >
                  <div class="d-flex flex-column align-items-start">
                    <span class="badge bg-slate-label mb-1 px-2 py-1 text-white extra-small">{{ bab.kode }}</span>
                    <span class="text-wrap font-sans text-muted-dark" style="font-size: 0.8rem; line-height: 1.4;">{{ bab.nama }}</span>
                  </div>
                </button>
              </h2>
              <div 
                :id="'m-collapse' + bab.id" 
                class="accordion-collapse collapse" 
                :aria-labelledby="'m-heading' + bab.id" 
                data-bs-parent="#mobileBabAccordion"
              >
                <div class="accordion-body p-0 bg-white">
                  <div class="list-group list-group-flush">
                    <button 
                      v-for="pokja in bab.pokjas" 
                      :key="pokja.id"
                      type="button"
                      class="list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 px-3 py-2.5 pokja-item"
                      :class="{ 'active-pokja': selectedPokja && selectedPokja.id === pokja.id }"
                      data-bs-dismiss="offcanvas"
                      @click="selectPokja(pokja)"
                    >
                      <div class="d-flex flex-column align-items-start w-75">
                        <span class="fw-bold font-sans tracking-wide text-dark-blue small">{{ pokja.kode }}</span>
                        <span class="text-muted extra-small text-truncate w-100 text-start">{{ pokja.nama_lengkap }}</span>
                      </div>
                      <i class="fas fa-chevron-right text-muted icon-arrow"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import akreditasiService from '@/services/akreditasiService'

const toast = useToast()

// UI state
const loadingBab = ref(false)
const loadingStandards = ref(false)
const loadingSearch = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)

// Lists
const babList = ref([])
const standards = ref([])
const searchResults = ref([])
const selectedPokja = ref(null)
const activeOffcanvasTab = ref('standards')

// Total count
const totalPokja = computed(() => {
  return babList.value.reduce((acc, bab) => acc + (bab.pokjas ? bab.pokjas.length : 0), 0)
})

// Fetch all Bab with nested Pokja
const fetchBabAndPokja = async () => {
  loadingBab.value = true
  try {
    const response = await akreditasiService.getBab({
      include: 'pokjas',
      limit: 100
    })
    // Sort Bab list by urutan
    babList.value = response.data.data.sort((a, b) => a.urutan - b.urutan)
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat navigasi Bab/Pokja')
  } finally {
    loadingBab.value = false
  }
}

// Select a Pokja & fetch its standards
const selectPokja = async (pokja) => {
  selectedPokja.value = pokja
  isSearching.value = false
  searchQuery.value = ''
  activeOffcanvasTab.value = 'standards'
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  loadingStandards.value = true
  try {
    const response = await akreditasiService.searchStandar({
      filters: [
        { field: 'pokja_id', operator: '=', value: pokja.id }
      ],
      includes: [
        { relation: 'elemenPenilaians' }
      ],
      limit: 100
    })
    // Sort standards by urutan
    standards.value = response.data.data.sort((a, b) => a.urutan - b.urutan)
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat standar untuk Pokja ' + pokja.kode)
  } finally {
    loadingStandards.value = false
  }
}

// Debounced Search Function
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    isSearching.value = false
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  loadingSearch.value = true
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await akreditasiService.searchElemenPenilaian({
        search: { value: searchQuery.value },
        includes: [
          { relation: 'standar' },
          { relation: 'standar.pokja' }
        ],
        limit: 25
      })
      searchResults.value = response.data.data
    } catch (error) {
      console.error(error)
      toast.error('Gagal melakukan pencarian')
    } finally {
      loadingSearch.value = false
    }
  }, 600)
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  searchResults.value = []
}

const scrollToStandard = (kode) => {
  const element = document.getElementById('standard-' + kode)
  if (element) {
    const yOffset = -94 // 70px header + 24px padding
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// Utility to parse tipe_bukti (comma-separated string, e.g. "R,D,O")
const getBuktiList = (tipeBukti) => {
  if (!tipeBukti) return []
  return tipeBukti.split(',').map(b => b.trim()).filter(Boolean)
}

// Visual color styling for STARKES Tipe Bukti badges
const getBuktiColorClass = (bukti) => {
  const classes = {
    'R': 'bg-soft-danger text-danger border-soft-danger',
    'D': 'bg-soft-primary text-primary border-soft-primary',
    'O': 'bg-soft-warning text-warning border-soft-warning',
    'W': 'bg-soft-info text-info border-soft-info',
    'S': 'bg-soft-success text-success border-soft-success',
  }
  return classes[bukti.toUpperCase()] || 'bg-light text-dark'
}

onMounted(() => {
  fetchBabAndPokja()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.page-bg {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}

.font-sans {
  font-family: 'Outfit', sans-serif;
}

.tracking-wider {
  letter-spacing: 0.08em;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.85);
}

.extra-small {
  font-size: 0.65rem;
  font-weight: 700;
}

.sticky-nav {
  position: sticky;
  top: calc(70px + 1.5rem);
  z-index: 10;
}

.navigation-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.12);
  background: #ffffff !important;
}

.navigation-card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #334155 !important;
}

.nav-header-title {
  color: #475569 !important;
  font-weight: 700 !important;
}

.small-badge {
  font-size: 0.72rem;
  font-weight: 600;
}

.text-dark-blue {
  color: #1e293b;
}

.text-muted-dark {
  color: #475569;
}

.bg-slate-label {
  background-color: #64748b !important;
}

.pokja-item {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid transparent !important;
  background-color: #ffffff !important;
}

.pokja-item:hover {
  background-color: #f8fafc !important;
  border-left-color: #cbd5e1 !important;
  padding-left: 1.25rem !important;
}

.pokja-item:hover .icon-arrow {
  transform: translateX(4px);
  color: #0f172a !important;
}

.icon-arrow {
  font-size: 0.75rem;
  transition: all 0.2s;
}

.active-pokja {
  background-color: #f0f7ff !important;
  border-left: 4px solid #2563eb !important;
}

.active-pokja .text-dark-blue {
  color: #2563eb !important;
}

.active-pokja .icon-arrow {
  color: #2563eb !important;
  transform: translateX(4px);
}

.idle-card {
  border-radius: 20px;
  background: white;
  border: 1px dashed #e2e8f0;
}

.icon-circle {
  width: 90px;
  height: 90px;
  background-color: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-wrapper {
  max-width: 100%;
}

.search-input {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: white;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

.search-icon {
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.header-card {
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
}

.header-icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deco-circle {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.standard-card {
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
}

.standard-card .card-header {
  background: #f8fafc !important;
  background-image: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
  padding: 1rem 1.5rem !important;
}

.standard-card .card-header h6 {
  color: #0f172a !important;
  font-size: 0.95rem !important;
  line-height: 1.6 !important;
  text-align: left !important;
}

.ep-item-row {
  transition: all 0.2s;
}

.ep-item-row:hover {
  background-color: #fafbfd;
}

.lead-statement {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  font-weight: 500;
}

.bg-soft-danger { background-color: #fee2e2; }
.text-danger { color: #dc2626; }
.bg-soft-primary { background-color: #dbeafe; }
.text-primary { color: #2563eb; }
.bg-soft-warning { background-color: #fef3c7; }
.text-warning { color: #d97706; }
.bg-soft-info { background-color: #ecfeff; }
.text-info { color: #0891b2; }
.bg-soft-success { background-color: #dcfce7; }
.text-success { color: #16a34a; }
.bg-soft-indigo { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.ep-row-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
  transition: all 0.2s;
}

.ep-row-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px -4px rgba(148, 163, 184, 0.12);
}

.accordion-button:not(.collapsed) {
  background-color: #f8fafc;
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0, 0, 0, 0.125);
}

/* Animations */
.animate__animated {
  animation-duration: 0.4s;
}

.quick-nav-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
  border: 1px solid #f1f5f9 !important;
}

.btn-quick-nav-item {
  color: #475569 !important;
  background-color: transparent !important;
  border-bottom: 1px solid #f1f5f9 !important;
  border-radius: 0 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  text-align: left;
}

.btn-quick-nav-item:hover {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  padding-left: 1.25rem !important;
}

.bukti-badge {
  width: 24px;
  height: 24px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-fab {
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.35) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-fab:hover, .btn-fab:focus {
  transform: scale(1.05) translateY(-2px) !important;
  box-shadow: 0 12px 35px rgba(37, 99, 235, 0.45) !important;
}

.rounded-start-4 {
  border-top-left-radius: 1.25rem !important;
  border-bottom-left-radius: 1.25rem !important;
}
</style>
