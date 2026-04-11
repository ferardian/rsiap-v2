<template>
  <div class="satusehat-mapping-radiologi">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1 text-primary-emphasis fw-bold">Mapping Radiologi SatuSehat</h2>
        <p class="page-subtitle text-secondary mb-0">Hubungkan pemeriksaan radiologi lokal dengan standar LOINC & SNOMED CT</p>
      </div>
      <div class="header-actions d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm rounded-3 shadow-sm" @click="fetchProcedures" :disabled="loading">
          <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 bg-gradient-primary text-white p-3 h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="stats-icon bg-white bg-opacity-25 rounded-3 p-2">
              <i class="fas fa-microscope fs-4"></i>
            </div>
            <div>
              <p class="mb-0 opacity-75 small">Total Pemeriksaan</p>
              <h3 class="mb-0 fw-bold">{{ totalProcedures }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 bg-gradient-success text-white p-3 h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="stats-icon bg-white bg-opacity-25 rounded-3 p-2">
              <i class="fas fa-check-circle fs-4"></i>
            </div>
            <div>
              <p class="mb-0 opacity-75 small">Sudah Dimapping</p>
              <h3 class="mb-0 fw-bold">{{ mappedCount }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 bg-gradient-amber text-white p-3 h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="stats-icon bg-white bg-opacity-25 rounded-3 p-2">
              <i class="fas fa-exclamation-triangle fs-4"></i>
            </div>
            <div>
              <p class="mb-0 opacity-75 small">Belum Dimapping</p>
              <h3 class="mb-0 fw-bold">{{ totalProcedures - mappedCount }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-white border-bottom-0 p-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group border rounded-3 overflow-hidden shadow-sm">
              <span class="input-group-text bg-white border-0"><i class="fas fa-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-0" 
                v-model="searchQuery" 
                placeholder="Cari nama pemeriksaan atau kode..."
                @keyup.enter="fetchProcedures"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select border rounded-3 shadow-sm" v-model="filterStatus" @change="fetchProcedures">
              <option value="">Semua Status</option>
              <option value="mapped">Sudah Mapping</option>
              <option value="unmapped">Belum Mapping</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-light text-secondary text-uppercase small fw-bold">
              <tr>
                <th class="px-4 py-3">Nama Pemeriksaan</th>
                <th class="py-3">LOINC Mapping (SatuSehat)</th>
                <th class="py-3">Sampel (SNOMED)</th>
                <th class="py-3 px-4 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="n in 5" :key="n">
                <td colspan="4" class="p-4">
                  <div class="loading-shimmer"></div>
                </td>
              </tr>
              <tr v-else-if="procedures.length === 0">
                <td colspan="4" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fs-2 mb-3 d-block opacity-25"></i>
                  Data tidak ditemukan
                </td>
              </tr>
              <tr v-for="proc in procedures" :key="proc.kd_jenis_prw">
                <td class="px-4">
                  <div class="fw-bold text-dark">{{ proc.nm_perawatan }}</div>
                  <div class="text-xs text-muted">Kode: {{ proc.kd_jenis_prw }}</div>
                </td>
                <td>
                  <div v-if="proc.satu_sehat_mapping_radiologi" class="mapping-badge loinc-badge">
                    <div class="badge-content">
                      <span class="badge-code font-mono">{{ proc.satu_sehat_mapping_radiologi.code }}</span>
                      <span class="badge-display">{{ proc.satu_sehat_mapping_radiologi.display }}</span>
                    </div>
                  </div>
                  <span v-else class="text-xs text-danger italic"><i class="fas fa-times-circle me-1"></i> Belum Mapping</span>
                </td>
                <td>
                  <div v-if="proc.satu_sehat_mapping_radiologi" class="mapping-badge snomed-badge">
                    <div class="badge-content">
                      <span class="badge-code font-mono">{{ proc.satu_sehat_mapping_radiologi.sampel_code }}</span>
                      <span class="badge-display">{{ proc.satu_sehat_mapping_radiologi.sampel_display }}</span>
                    </div>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="px-4 text-end">
                  <div class="btn-group shadow-sm">
                    <button class="btn btn-outline-primary btn-sm rounded-start-3 px-3" @click="openModal(proc)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="proc.satu_sehat_mapping_radiologi" 
                      class="btn btn-outline-danger btn-sm rounded-end-3 px-3" 
                      @click="deleteMapping(proc.kd_jenis_prw)"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer bg-white p-4 border-top-0">
        <div class="d-flex justify-content-between align-items-center">
          <p class="mb-0 text-muted small">Showing {{ procedures.length }} from {{ totalProcedures }} records</p>
          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
              </li>
              <li 
                class="page-item" 
                v-for="p in Math.min(5, totalPages)" 
                :key="p" 
                :class="{ active: currentPage === p }"
              >
                <button class="page-link" @click="changePage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Mapping Modal -->
    <div class="modal fade" id="mappingModal" tabindex="-1" ref="mappingModal" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white p-4 border-0">
            <div>
              <h5 class="modal-title fw-bold mb-0">Mapping Standar SatuSehat</h5>
              <p class="mb-0 text-white-50 text-xs">Pemeriksaan: {{ formData.nm_perawatan }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" @click="closeModal"></button>
          </div>

          <div class="modal-body p-4 bg-light">
            <div class="ai-suggestion-section mb-4">
              <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div class="card-body p-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="ai-icon rounded-circle bg-indigo p-2 text-white">
                        <i class="fas fa-robot"></i>
                      </div>
                      <h6 class="mb-0 fw-bold">AI Search Agent</h6>
                    </div>
                    <button 
                      class="btn btn-indigo btn-sm rounded-pill px-4 shadow-sm" 
                      @click="searchAI" 
                      :disabled="loadingAI"
                    >
                      <i v-if="loadingAI" class="fas fa-spinner fa-spin me-2"></i>
                      <i v-else class="fas fa-sparkles me-2"></i>
                      Cari via AI
                    </button>
                  </div>
                  <p class="text-muted small mb-0">Gunakan AI untuk mencari kode LOINC dan SNOMED CT yang paling relevan berdasarkan nama pemeriksaan.</p>

                  <!-- AI Results List -->
                  <div v-if="aiResults.length > 0" class="mt-4 animate-fadeIn">
                    <h6 class="text-xs fw-bold text-uppercase text-muted mb-3">Hasil Rekomendasi AI:</h6>
                    <div class="ai-results-container">
                      <div 
                        v-for="(res, idx) in aiResults" 
                        :key="idx" 
                        class="ai-result-item border rounded-3 p-3 mb-2 cursor-pointer transition-all hover-shadow"
                        @click="useAIResult(res)"
                      >
                        <div class="d-flex justify-content-between">
                          <div>
                            <div class="fw-bold text-indigo">{{ res.display }}</div>
                            <div class="text-xs font-mono text-muted">LOINC: {{ res.code }} | Sampel: {{ res.sampel_display }} ({{ res.sampel_code }})</div>
                          </div>
                          <i class="fas fa-chevron-right text-indigo opacity-25"></i>
                        </div>
                      </div>
                    </div>
                    <p class="text-[10px] text-center italic text-muted mt-2">Klik satu hasil untuk mengisi otomatis form di bawah.</p>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="saveMapping">
              <div class="row g-4 overflow-y-auto" style="max-height: 500px; padding: 5px;">
                <!-- LOINC SECTION -->
                <div class="col-md-6">
                  <div class="card border-0 shadow-sm rounded-3">
                    <div class="card-header bg-white py-3">
                      <h6 class="mb-0 fw-bold"><i class="fas fa-tag text-primary me-2"></i> LOINC (Radiology)</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <label class="form-label text-xs fw-bold text-uppercase">LOINC Code</label>
                        <input type="text" class="form-control" v-model="formData.code" placeholder="e.g. 24882-3" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-xs fw-bold text-uppercase">LOINC Display</label>
                        <textarea class="form-control" v-model="formData.display" rows="2" placeholder="Standard LOINC Name" required></textarea>
                      </div>
                      <div class="mb-0">
                        <label class="form-label text-xs fw-bold text-uppercase">LOINC System</label>
                        <input type="text" class="form-control" v-model="formData.system" readonly />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SAMPLE SECTION -->
                <div class="col-md-6">
                  <div class="card border-0 shadow-sm rounded-3">
                    <div class="card-header bg-white py-3">
                      <h6 class="mb-0 fw-bold"><i class="fas fa-vial text-success me-2"></i> Sample (SNOMED CT)</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <label class="form-label text-xs fw-bold text-uppercase">Sample Code</label>
                        <input type="text" class="form-control" v-model="formData.sampel_code" placeholder="e.g. 119361006" required />
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-xs fw-bold text-uppercase">Sample Display</label>
                        <textarea class="form-control" v-model="formData.sampel_display" rows="2" placeholder="Specimen Type Name" required></textarea>
                      </div>
                      <div class="mb-0">
                        <label class="form-label text-xs fw-bold text-uppercase">Sample System</label>
                        <input type="text" class="form-control" v-model="formData.sampel_system" readonly />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 flex-end gap-2">
                <button type="button" class="btn btn-light rounded-pill px-4" @click="closeModal" :disabled="loadingSave">Batal</button>
                <button type="submit" class="btn btn-primary rounded-pill px-5 shadow" :disabled="loadingSave">
                  <span v-if="loadingSave" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  Simpan Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

export default {
  name: 'SatuSehatMappingRadiologiView',
  data() {
    return {
      procedures: [],
      loading: false,
      loadingSave: false,
      loadingAI: false,
      searchQuery: '',
      filterStatus: '',
      currentPage: 1,
      totalPages: 1,
      totalProcedures: 0,
      mappedCount: 0,
      
      modalInstance: null,
      aiResults: [],
      
      formData: {
        kd_jenis_prw: '',
        nm_perawatan: '',
        code: '',
        system: 'http://loinc.org',
        display: '',
        sampel_code: '',
        sampel_system: 'http://snomed.info/sct',
        sampel_display: ''
      }
    }
  },
  mounted() {
    this.fetchProcedures()
    this.modalInstance = new Modal(this.$refs.mappingModal)
  },
  methods: {
    async fetchProcedures() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          search: this.searchQuery,
          status: this.filterStatus,
          limit: 15
        }
        const res = await satuSehatService.getMappingRadiologi(params)
        if (res.data.success) {
          const payload = res.data.data
          this.procedures = payload.data
          this.totalProcedures = payload.total
          this.totalPages = payload.last_page
          
          // Count mapped manually for simple summary (or could be from backend)
          this.mappedCount = this.procedures.filter(p => p.satu_sehat_mapping_radiologi).length
          if (this.filterStatus === 'mapped') this.mappedCount = this.totalProcedures
        }
      } catch (err) {
        console.error('Fetch error:', err)
        Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal mengambil data pemeriksaan radiologi' })
      } finally {
        this.loading = false
      }
    },
    
    changePage(p) {
      if (p < 1 || p > this.totalPages) return
      this.currentPage = p
      this.fetchProcedures()
    },
    
    openModal(proc) {
      this.formData = {
        kd_jenis_prw: proc.kd_jenis_prw,
        nm_perawatan: proc.nm_perawatan,
        code: proc.satu_sehat_mapping_radiologi?.code || '',
        system: 'http://loinc.org',
        display: proc.satu_sehat_mapping_radiologi?.display || '',
        sampel_code: proc.satu_sehat_mapping_radiologi?.sampel_code || '',
        sampel_system: 'http://snomed.info/sct',
        sampel_display: proc.satu_sehat_mapping_radiologi?.sampel_display || ''
      }
      this.aiResults = []
      this.modalInstance.show()
    },
    
    closeModal() {
      this.modalInstance.hide()
    },
    
    async saveMapping() {
      this.loadingSave = true
      try {
        const res = await satuSehatService.saveMappingRadiologi(this.formData)
        if (res.data.success) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: res.data.message, timer: 1500, showConfirmButton: false })
          this.closeModal()
          this.fetchProcedures()
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal menyimpan mapping' })
      } finally {
        this.loadingSave = false
      }
    },
    
    async deleteMapping(id) {
      const confirm = await Swal.fire({
        title: 'Hapus Mapping?',
        text: 'Data mapping radiologi akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus'
      })
      
      if (confirm.isConfirmed) {
        try {
          const res = await satuSehatService.deleteMappingRadiologi(id)
          if (res.data.success) {
            Swal.fire({ icon: 'success', title: 'Dihapus!', text: res.data.message, timer: 1500 })
            this.fetchProcedures()
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus mapping' })
        }
      }
    },
    
    // AI INTEGRATION
    async searchAI() {
      this.loadingAI = true
      this.aiResults = []
      
      try {
        const res = await satuSehatService.searchAiRadiologi({
          query: this.formData.nm_perawatan
        })
        
        const data = res.data
        this.aiResults = Array.isArray(data) ? data : (data || [])
        
        if (this.aiResults.length === 0) {
          Swal.fire({ icon: 'info', title: 'No Results', text: 'AI tidak menemukan rekomendasi yang cocok' })
        }
      } catch (err) {
        console.error('AI Error:', err)
        Swal.fire({ 
          icon: 'error', 
          title: 'AI Search Error', 
          text: err.response?.data?.message || 'Gagal menghubungi AI Agent.' 
        })
      } finally {
        this.loadingAI = false
      }
    },
    
    useAIResult(res) {
      this.formData.code = res.code
      this.formData.display = res.display
      this.formData.sampel_code = res.sampel_code || ''
      this.formData.sampel_display = res.sampel_display || ''
      
      // Auto-focus the save button or show feedback
      Swal.fire({ icon: 'success', title: 'Applied!', text: 'Saran AI telah diterapkan ke form', timer: 1000, showConfirmButton: false })
    }
  }
}
</script>

<style scoped>
.satusehat-mapping-radiologi {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.bg-gradient-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
.bg-gradient-success { background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%); }
.bg-gradient-amber { background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%); }

.stats-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-table thead th {
  border-bottom-width: 1px;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.mapping-badge {
  display: inline-flex;
  background: #f8f9fc;
  border-radius: 8px;
  padding: 6px 10px;
  border: 1px solid #e3e6f0;
  max-width: 300px;
}

.mapping-badge .badge-code {
  display: block;
  font-weight: 700;
  color: #4e73df;
  font-size: 0.8rem;
}

.mapping-badge .badge-display {
  display: block;
  color: #6e707e;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loinc-badge { border-left: 3px solid #4e73df; }
.snomed-badge { border-left: 3px solid #1cc88a; }

.btn-indigo { background-color: #6610f2; color: white; }
.btn-indigo:hover { background-color: #520dc2; color: white; }
.bg-indigo { background-color: #6610f2; }
.text-indigo { color: #6610f2; }

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
  border-color: #6610f2 !important;
}

.cursor-pointer { cursor: pointer; }

.loading-shimmer {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.text-xs { font-size: 0.75rem; }
.font-mono { font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.ai-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(102, 16, 242, 0.3);
}

.ai-results-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 5px;
}

.ai-results-container::-webkit-scrollbar {
  width: 4px;
}

.ai-results-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.ai-results-container::-webkit-scrollbar-thumb {
  background: #6610f255;
  border-radius: 10px;
}
</style>
