<template>
  <div class="spo-ai-wrapper">
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-white shadow-sm rounded-circle btn-back" @click="$router.back()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 class="mb-0 fw-800 text-slate-800">SPO AI Generator</h2>
            <p class="text-slate-500 mb-0">Buat draf SPO cerdas dengan bantuan AI Agent.</p>
          </div>
        </div>
        <div class="ai-badge shadow-sm">
          <i class="fas fa-robot me-2"></i> Powered by AI Agent
        </div>
      </div>

      <div class="row">
        <!-- Input Form -->
        <div class="col-lg-5 mb-4">
          <div class="card border-0 shadow-sm rounded-24 h-100 overflow-hidden">
            <div class="card-header bg-white p-4 border-0">
              <h5 class="fw-bold mb-0">Identitas & Konteks</h5>
            </div>
            <div class="card-body p-4">
              <div class="mb-3">
                <label class="form-label-custom">Judul SPO</label>
                <textarea v-model="state.judul" class="form-control-custom" rows="2" placeholder="Contoh: Prosedur Pengambilan Sampel Darah..."></textarea>
              </div>

              <div class="row mb-3">
                <div class="col-6">
                  <label class="form-label-custom">Jenis SPO</label>
                  <select v-model="state.jenis" class="form-select-custom">
                    <option value="umum">Umum</option>
                    <option value="medis">Medis</option>
                    <option value="penunjang">Penunjang</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label-custom">Tanggal Terbit</label>
                  <input v-model="state.tgl_terbit" type="date" class="form-control-custom" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Unit Utama</label>
                <v-select
                  v-model="state.unit"
                  :options="unitsDict"
                  label="nama"
                  placeholder="Pilih Unit Utama..."
                  class="v-select-premium"
                >
                  <template #option="option">
                    {{ option.nama || option.nama_ruang || option.dep_id }}
                  </template>
                </v-select>
              </div>

              <div class="mb-4">
                <label class="form-label-custom">Regulasi Terkait (Opsional)</label>
                <textarea v-model="state.regulasi" class="form-control-custom" rows="2" placeholder="Sebutkan regulasi jika ada..."></textarea>
              </div>

              <div class="ai-prompt-box p-4 rounded-20">
                <label class="form-label-custom text-badge-ai d-flex align-items-center gap-2">
                  <i class="fas fa-wand-magic-sparkles"></i> Gambaran Prosedur (Untuk AI)
                </label>
                <textarea 
                  v-model="state.gambaran" 
                  class="form-control-ai mt-2" 
                  rows="6" 
                  placeholder="Jelaskan secara detail bagaimana prosedur ini berjalan. Semakin detail, hasil AI akan semakin akurat..."
                ></textarea>
                
                <button 
                  class="btn btn-ai-generate w-100 mt-3" 
                  @click="generateAiContent"
                  :disabled="isGenerating || !state.gambaran"
                >
                  <template v-if="isGenerating">
                    <span class="spinner-border spinner-border-sm me-2"></span> AI sedang berpikir...
                  </template>
                  <template v-else>
                    <i class="fas fa-bolt me-2"></i> Generate Konten SPO
                  </template>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Result / Editor -->
        <div class="col-lg-7 mb-4">
          <div class="card border-0 shadow-sm rounded-24">
            <div class="card-header bg-white p-4 border-0 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0">Draf Konten SPO</h5>
              <div v-if="hasResult" class="badge bg-white text-badge-ai rounded-pill px-3 py-2 shadow-sm animate__animated animate__bounceIn">
                <i class="fas fa-check-circle me-1"></i> Terisi Otomatis
              </div>
            </div>
            <div class="card-body p-4">
              <div v-for="section in sections" :key="section.key" class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label-custom m-0 text-primary">{{ section.label }}</label>
                  <button v-if="hasResult" class="btn btn-regenerate" @click="regenerateSection(section.key)">
                    <i class="fas fa-sync-alt me-1"></i> Perbaiki Bagian Ini
                  </button>
                </div>
                <RichTextEditor 
                  v-model="quillContent[section.key]" 
                  :placeholder="`Ketik ${section.label.toLowerCase()} di sini...`"
                />
              </div>
            </div>
            <div class="card-footer bg-white p-4 border-top-0 text-end">
              <button class="btn btn-light px-4 me-2 rounded-12" @click="$router.back()">Batal</button>
              <button class="btn btn-indigo px-4 py-2 rounded-12 fw-bold shadow-sm" @click="submitSpo" :disabled="isSubmitting || !hasResult">
                <i class="fas fa-save me-2"></i> Simpan SPO Ke Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import spoService from '@/services/spoService'
import Swal from 'sweetalert2'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

const router = useRouter()
const isGenerating = ref(false)
const isSubmitting = ref(false)
const hasResult = ref(false)
const unitsDict = ref([])

const state = reactive({
  judul: '',
  tgl_terbit: new Date().toISOString().slice(0, 10),
  jenis: 'umum',
  unit: null,
  gambaran: '',
  regulasi: ''
})

const quillContent = reactive({
  pengertian: '',
  tujuan: '',
  kebijakan: '',
  prosedur: ''
})

const sections = [
  { label: 'Pengertian', key: 'pengertian' },
  { label: 'Tujuan', key: 'tujuan' },
  { label: 'Kebijakan', key: 'kebijakan' },
  { label: 'Prosedur', key: 'prosedur' }
]

onMounted(async () => {
    fetchUnits()
})

const fetchUnits = async () => {
    try {
        const response = await spoService.getUnits()
        unitsDict.value = response.data?.data || []
    } catch(err) {
        console.error("Gagal load units", err)
    }
}

const generateAiContent = async () => {
    if (!state.gambaran) return

    isGenerating.value = true
    try {
        const payload = {
            judul: state.judul,
            gambaran: state.gambaran,
            regulasi: state.regulasi,
            jenis: state.jenis
        }

        const response = await spoService.generateAi(payload)
        const data = response.data.data

        // Fill editors
        sections.forEach(section => {
            if (data[section.key]) {
                quillContent[section.key] = data[section.key]
            }
        })

        hasResult.value = true
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'AI telah membuat draf SPO untuk Anda.',
            timer: 1500,
            showConfirmButton: false
        })
    } catch(err) {
        console.error(err)
        Swal.fire('Gagal', 'Sistem AI sedang sibuk, silakan coba lagi.', 'error')
    } finally {
        isGenerating.value = false
    }
}

const submitSpo = async () => {
    if (!state.judul || !state.unit) {
        Swal.fire('Peringatan', 'Judul dan Unit Utama wajib diisi.', 'warning')
        return
    }

    isSubmitting.value = true
    try {
        const payload = {
            judul: state.judul,
            unit_id: state.unit.dep_id || state.unit.unit_id,
            tgl_terbit: state.tgl_terbit,
            jenis: state.jenis,
            semua_unit_terkait: true, 
            pengertian: quillContent.pengertian,
            tujuan: quillContent.tujuan,
            kebijakan: quillContent.kebijakan,
            prosedur: quillContent.prosedur
        }

        await spoService.createSpo(payload)
        Swal.fire('Berhasil', 'SPO telah disimpan ke database.', 'success')
        router.push('/central-archive/spo')
    } catch(err) {
        Swal.fire('Error', 'Gagal menyimpan SPO.', 'error')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
.spo-ai-wrapper {
  background-color: #f1f5f9;
  min-height: 100vh;
}

.fw-800 { font-weight: 800; }
.rounded-24 { border-radius: 24px; }
.rounded-20 { border-radius: 20px; }
.rounded-12 { border-radius: 12px; }

.btn-back {
  width: 44px;
  height: 44px;
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-back:hover { background: #3b82f6; color: white; }

.ai-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
}

.form-label-custom {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control-custom, .form-select-custom {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  width: 100%;
  outline: none;
  transition: all 0.2s;
}
.form-control-custom:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.ai-prompt-box {
  background-color: #f8fafc;
  border: 1px dashed #3b82f6;
}

.form-control-ai {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  resize: none;
}

.btn-ai-generate {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 800;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btn-ai-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
}
.btn-ai-generate:disabled { opacity: 0.6; cursor: not-allowed; }



.btn-indigo { background: #2563eb; color: white; }
.btn-indigo:hover { background: #1d4ed8; color: white; }

.btn-regenerate {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: none;
  padding: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
  width: auto;
}
.btn-regenerate:hover {
  background: #dbeafe;
  color: #1d4ed8;
  transform: translateY(-1px);
}

.text-badge-ai { color: #2563eb; }

.v-select-premium :deep(.vs__dropdown-toggle) { border-radius: 12px; border: 1px solid #e2e8f0; padding: 6px; }
</style>
