<template>
  <div class="spo-create-wrapper">
    <div class="create-container">
      <!-- Header -->
      <div class="create-header">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light rounded-circle btn-back shadow-sm" @click="$router.back()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 class="mb-0 fw-bold">Edit SPO</h2>
            <p class="text-muted small mb-0">Ubah informasi Standar Prosedur Operasional yang sudah ada.</p>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data SPO...</p>
      </div>

      <div v-else class="row mt-4">
        <!-- Left Column: Core Fields -->
        <div class="col-lg-4 mb-4">
          <div class="card glass-card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4 border-bottom pb-2">Informasi Dasar</h5>
              
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Judul SPO <span class="text-danger">*</span></label>
                <textarea 
                  v-model="state.judul" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Masukkan judul SPO lengkap..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Tanggal Terbit <span class="text-danger">*</span></label>
                <input 
                  v-model="state.tgl_terbit" 
                  type="date" 
                  class="form-control"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Jenis SPO <span class="text-danger">*</span></label>
                <select v-model="state.jenis" class="form-select">
                  <option value="umum">Umum</option>
                  <option value="medis">Medis</option>
                  <option value="penunjang">Penunjang</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Unit Utama <span class="text-danger">*</span></label>
                <v-select
                  v-model="state.unit"
                  :options="unitsDict"
                  :reduce="u => u"
                  label="nama"
                  placeholder="Pilih Unit Utama..."
                  class="v-select-custom"
                >
                  <template #option="option">
                    {{ option.nama || option.nama_ruang || option.dep_id || option.unit_id }}
                  </template>
                  <template #selected-option="option">
                    {{ option.nama || option.nama_ruang || option.dep_id || option.unit_id }}
                  </template>
                </v-select>
              </div>

              <hr>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted d-flex justify-content-between">
                  <span>Unit Terkait</span>
                  <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" role="switch" id="semuaUnitTerkait" v-model="state.semua_unit_terkait">
                    <label class="form-check-label text-xs fw-normal" for="semuaUnitTerkait">Pilih Semua Unit</label>
                  </div>
                </label>
                
                <div :class="{'opacity-50 pointer-events-none': state.semua_unit_terkait}">
                   <div class="mb-2">
                     <v-select
                       v-model="state.unit_terkait"
                       :options="unitsDict"
                       multiple
                       label="nama"
                       placeholder="Cari & Pilih Unit Terkait..."
                       class="v-select-custom"
                     >
                       <template #option="option">
                         {{ option.nama || option.nama_ruang || option.dep_id || option.unit_id }}
                       </template>
                       <template #selected-option="option">
                         {{ option.nama || option.nama_ruang || option.dep_id || option.unit_id }}
                       </template>
                     </v-select>
                   </div>
                   
                   <!-- Free Text Fallback remains for manual entry -->
                   <div class="d-flex gap-2 mb-2">
                      <input type="text" class="form-control" v-model="freeTextUnitTerkait" placeholder="Atau ketik manual..." @keyup.enter="addFreeTextUnit">
                      <button class="btn btn-primary" type="button" @click="addFreeTextUnit" style="width: 45px; height: 38px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus"></i>
                      </button>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Right Column: Rich Text Editors -->
        <div class="col-lg-8 mb-4">
          <div class="card glass-card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4 border-bottom pb-2">Konten Dokumen</h5>
              
              <div v-for="section in sections" :key="section.id" class="mb-4 relative">
                <label class="form-label fw-bold text-primary">{{ section.label }}</label>
                <!-- Editor Container -->
                <div :id="section.id" class="quill-editor-container"></div>
              </div>

            </div>
            <div class="card-footer bg-white border-top-0 p-4 text-end">
               <button class="btn btn-light px-4 me-2" @click="$router.back()">Batal</button>
               <button class="btn btn-primary px-4 fw-bold shadow-sm" @click="submitSpo" :disabled="isSubmitting">
                 <i class="fas fa-save me-2" :class="{'fa-spin fa-spinner': isSubmitting}"></i> Simpan Perubahan
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import spoService from '@/services/spoService'
import Swal from 'sweetalert2'

// Load Quill css
import 'quill/dist/quill.snow.css'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const spoId = route.params.id

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const unitsDict = ref([])

const state = reactive({
  judul: '',
  tgl_terbit: '',
  jenis: 'umum',
  unit: null,
  semua_unit_terkait: false,
  unit_terkait: []
})

// Editors Reference
const quillEditors = {}
let Quill = null
const quillContent = reactive({
  pengertian: '',
  tujuan: '',
  kebijakan: '',
  prosedur: ''
})

const sections = [
  { id: 'pengertian-editor', label: 'Pengertian', key: 'pengertian' },
  { id: 'tujuan-editor', label: 'Tujuan', key: 'tujuan' },
  { id: 'kebijakan-editor', label: 'Kebijakan', key: 'kebijakan' },
  { id: 'prosedur-editor', label: 'Prosedur', key: 'prosedur' }
]

// Unit Selectors
const freeTextUnitTerkait = ref('')

// Load Dependencies and Initialize View
onMounted(async () => {
    // Dynamically import quill
    const QuillModule = await import('quill')
    Quill = QuillModule.default

    // Fetch units first to have them ready for mapping
    await fetchUnits()
    
    // Fetch SPO detail
    await fetchSpoDetail()
})

const fetchUnits = async () => {
    try {
        const response = await spoService.getUnits()
        unitsDict.value = response.data?.data || response.data || []
    } catch(err) {
        console.error("Gagal load units", err)
    }
}

const fetchSpoDetail = async () => {
    isLoading.value = true
    try {
        const response = await spoService.getSpoById(spoId)
        const data = response.data?.data || response.data

        if(!data) throw new Error("Data tidak ditemukan")

        // Populate State
        state.judul = data.judul
        state.tgl_terbit = data.tgl_terbit
        state.jenis = data.jenis || 'umum'
        state.semua_unit_terkait = data.semua_unit_terkait === 1 || data.semua_unit_terkait === true

        // Map Unit Utama
        if(data.unit_id) {
            state.unit = unitsDict.value.find(u => String(u.dep_id || u.unit_id) === String(data.unit_id)) 
                         || (data.unit ? { dep_id: data.unit_id, nama: data.unit.nama } : { dep_id: data.unit_id, nama: data.unit_id })
        }

        // Fetch related units
        // Add include=unit to get names if possible
        const unitsRes = await spoService.getSpoUnits(spoId, { include: 'unit' })
        const related = unitsRes.data?.data || []
        
        state.unit_terkait = related.map(ru => {
            // Find in unitsDict or return object with id and nama fallback
            const found = unitsDict.value.find(u => String(u.dep_id || u.unit_id) === String(ru.unit_id))
            return found ? found : { dep_id: ru.unit_id, unit_id: ru.unit_id, nama: ru.unit?.nama || ru.unit_id }
        })

        // Populate Editor Content
        // Use unescapeHtml to handle legacy data that might have been escaped previously
        quillContent.pengertian = unescapeHtml(data.pengertian)
        quillContent.tujuan = unescapeHtml(data.tujuan)
        quillContent.kebijakan = unescapeHtml(data.kebijakan)
        quillContent.prosedur = unescapeHtml(data.prosedur)

        // Ensure DOM is rendered by turning off loading BEFORE init
        isLoading.value = false
        await nextTick()
        initEditors()

    } catch(err) {
        console.error(err)
        isLoading.value = false
        Swal.fire('Error', 'Gagal memuat data SPO.', 'error')
        router.push('/central-archive/spo')
    }
}

const initEditors = () => {
    sections.forEach(section => {
        const container = document.querySelector(`#${section.id}`)
        if (!container) {
            console.warn(`Container for ${section.id} not found, skipping...`)
            return
        }

        // Avoid double initialization
        if (quillEditors[section.key]) return

        const quill = new Quill(`#${section.id}`, {
            theme: 'snow',
            placeholder: `Ketik ${section.label.toLowerCase()} di sini...`,
            modules: {
                toolbar: [
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['bold', 'italic', 'underline'],
                    [{ 'header': [1, 2, 3, false] }],
                    ['clean']
                ]
            }
        })
        
        // Set initial content using dangerouslyPasteHTML for better parsing
        if (quillContent[section.key]) {
            quill.clipboard.dangerouslyPasteHTML(quillContent[section.key])
        }
        
        quill.on('text-change', () => {
             quillContent[section.key] = quill.root.innerHTML
        })
        
        quillEditors[section.key] = quill
    })
}



// Robust unescape for legacy HTML entities including numeric ones (like &#047;)
// This version preserves real HTML tags and only decodes individual entities
const unescapeHtml = (htmlStr) => {
    if (!htmlStr) return ''
    
    let result = htmlStr
    const span = document.createElement('span')
    
    // Decode until no more entities are left or max iterations reached
    for (let i = 0; i < 3; i++) {
        if (!result.includes('&')) break
        
        // Use regex to find and replace individual entities
        const next = result.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
            span.innerHTML = match
            return span.textContent || span.innerText || match
        })
        
        if (next === result) break
        result = next
    }
    
    return result
}

// Select Unit Logics
const addFreeTextUnit = () => {
    if(!freeTextUnitTerkait.value.trim()) return
    
    state.unit_terkait.push({
        unit_id: freeTextUnitTerkait.value.trim(),
        nama: freeTextUnitTerkait.value.trim()
    })
    
    freeTextUnitTerkait.value = ""
}



const submitSpo = async () => {
    if (!state.judul || !state.tgl_terbit || !state.jenis || !state.unit) {
        Swal.fire('Form Tidak Lengkap', 'Judul, Tanggal, Jenis, dan Unit Utama wajib diisi.', 'warning')
        return
    }

    if (!state.semua_unit_terkait && state.unit_terkait.length === 0) {
        Swal.fire('Pilih Unit Terkait', 'Silakan pilih setidaknya satu unit terkait atau centang "Pilih Semua Unit".', 'warning')
        return
    }

    isSubmitting.value = true
    try {
        const payload = {
            judul: state.judul,
            unit_id: state.unit.dep_id || state.unit.unit_id,
            tgl_terbit: state.tgl_terbit,
            jenis: state.jenis,
            semua_unit_terkait: state.semua_unit_terkait,
            units: state.unit_terkait.map(u => u.dep_id || u.unit_id),
            
            pengertian: quillContent.pengertian,
            tujuan: quillContent.tujuan,
            kebijakan: quillContent.kebijakan,
            prosedur: quillContent.prosedur
        }

        await spoService.updateSpo(spoId, payload)
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Perubahan SPO telah disimpan.',
            timer: 1500,
            showConfirmButton: false
        })

        router.push('/central-archive/spo')

    } catch(err) {
        console.error(err)
        const msg = err.response?.data?.message || err.message || 'Gagal menyimpan perubahan SPO.'
        Swal.fire('Error', msg, 'error')
    } finally {
        isSubmitting.value = false
    }
}

</script>

<style scoped>
.spo-create-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 1rem 1.5rem;
  color: #1e293b;
}

.create-container {
  max-width: 100%;
  margin: 0 auto;
}

.create-header {
  margin-bottom: 1.5rem;
}

.btn-back {
  width: 45px;
  height: 45px;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0 !important;
  font-size: 1.1rem;
}
.btn-back:hover {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.glass-card {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
}

.quill-editor-container {
    background-color: #fff;
    border-radius: 0 0 8px 8px;
    min-height: 180px;
}
:deep(.ql-toolbar) {
    border-radius: 8px 8px 0 0;
    border-color: #e2e8f0 !important;
    background-color: #f8fafc;
}
:deep(.ql-container) {
    border-color: #e2e8f0 !important;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    font-size: 0.95rem;
}

.bg-soft-primary {
    background-color: #e0e7ff;
}
.cursor-pointer {
    cursor: pointer;
}
.pointer-events-none {
    pointer-events: none;
}
.opacity-50 {
    opacity: 0.5;
}

/* v-select custom styling */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 5px;
  background: white;
  font-size: 0.9rem;
}

.v-select-custom :deep(.vs__selected) {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 500;
}

.v-select-custom :deep(.vs__dropdown-menu) {
  font-size: 0.85rem;
  z-index: 1060;
}
</style>
