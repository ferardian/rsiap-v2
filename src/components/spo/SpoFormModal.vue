<template>
  <div 
    class="modal fade" 
    :class="{ show: modelValue }" 
    :style="{ display: modelValue ? 'block' : 'none' }"
    tabindex="-1"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-file-medical me-2"></i>
            {{ formData.id ? 'Edit SPO' : 'Tambah SPO Baru' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <!-- Basic Info Section -->
            <div class="card mb-4 border-0 shadow-sm">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="fas fa-info-circle me-2 text-primary"></i>Informasi Dasar</h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">Judul SPO <span class="text-danger">*</span></label>
                    <input 
                      v-model="formData.judul" 
                      type="text" 
                      class="form-control" 
                      placeholder="Masukkan judul SPO"
                      required
                    />
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Tanggal Terbit <span class="text-danger">*</span></label>
                    <input 
                      v-model="formData.tgl_terbit" 
                      type="date" 
                      class="form-control" 
                      required
                    />
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Jenis <span class="text-danger">*</span></label>
                    <select v-model="formData.jenis" class="form-select" required>
                      <option value="">Pilih Jenis</option>
                      <option value="medis">Medis</option>
                      <option value="penunjang">Penunjang</option>
                      <option value="umum">Umum</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Status</label>
                    <select v-model="formData.status" class="form-select" :disabled="!formData.id">
                      <option value="pengajuan">Pengajuan</option>
                      <option value="disetujui">Disetujui</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Unit Utama</label>
                    <v-select
                      v-model="formData.unit_id"
                      :options="departments"
                      :reduce="dept => dept.dep_id"
                      label="nama_ruang"
                      placeholder="Pilih unit utama"
                      class="v-select-custom"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Units Section -->
            <div class="card mb-4 border-0 shadow-sm">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="fas fa-building me-2 text-primary"></i>Unit Terkait</h6>
              </div>
              <div class="card-body">
                <div class="form-check mb-3">
                  <input 
                    v-model="formData.semua_unit_terkait" 
                    class="form-check-input" 
                    type="checkbox" 
                    id="semuaUnit"
                  />
                  <label class="form-check-label fw-semibold" for="semuaUnit">
                    <i class="fas fa-check-double me-2 text-success"></i>Semua Unit
                  </label>
                </div>
                
                <div v-if="!formData.semua_unit_terkait">
                  <label class="form-label fw-semibold">Pilih Unit <span class="text-danger">*</span></label>
                  <v-select
                    v-model="formData.units"
                    :options="departments"
                    :reduce="dept => dept.dep_id"
                    label="nama_ruang"
                    multiple
                    placeholder="Pilih unit terkait"
                    class="v-select-custom"
                  />
                  <small class="text-muted">Pilih satu atau lebih unit</small>
                </div>
              </div>
            </div>

            <!-- Content Section -->
            <div class="card mb-4 border-0 shadow-sm">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="fas fa-file-alt me-2 text-primary"></i>Konten SPO</h6>
              </div>
              <div class="card-body">
                <!-- Pengertian -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Pengertian</label>
                  <QuillEditor 
                    v-model:content="formData.pengertian"
                    contentType="html"
                    theme="snow"
                    :toolbar="toolbarOptions"
                    placeholder="Tulis pengertian di sini..."
                    class="quill-custom"
                  />
                </div>

                <!-- Tujuan -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Tujuan</label>
                  <QuillEditor 
                    v-model:content="formData.tujuan"
                    contentType="html"
                    theme="snow"
                    :toolbar="toolbarOptions"
                    placeholder="Tulis tujuan di sini..."
                    class="quill-custom"
                  />
                </div>

                <!-- Kebijakan -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Kebijakan</label>
                  <QuillEditor 
                    v-model:content="formData.kebijakan"
                    contentType="html"
                    theme="snow"
                    :toolbar="toolbarOptions"
                    placeholder="Tulis kebijakan di sini..."
                    class="quill-custom"
                  />
                </div>

                <!-- Prosedur -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Prosedur</label>
                  <QuillEditor 
                    v-model:content="formData.prosedur"
                    contentType="html"
                    theme="snow"
                    :toolbar="toolbarOptions"
                    placeholder="Tulis prosedur di sini..."
                    class="quill-custom"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="submitForm"
            :disabled="!isFormValid"
          >
            <i class="fas fa-save me-2"></i>{{ formData.id ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop -->
  <div 
    v-if="modelValue" 
    class="modal-backdrop fade show"
    @click="closeModal"
  ></div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: Boolean,
  spoData: Object,
  departments: Array
})

const emit = defineEmits(['update:modelValue', 'saved'])

const formData = reactive({
  id: null,
  judul: '',
  jenis: '',
  tgl_terbit: '',
  status: 'pengajuan',
  unit_id: null,
  units: [],
  semua_unit_terkait: false,
  pengertian: '',
  tujuan: '',
  kebijakan: '',
  prosedur: ''
})

const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['clean']
]

const isFormValid = computed(() => {
  return formData.judul && 
         formData.jenis && 
         formData.tgl_terbit &&
         (formData.semua_unit_terkait || formData.units.length > 0)
})

const resetForm = () => {
  formData.id = null
  formData.judul = ''
  formData.jenis = ''
  formData.tgl_terbit = ''
  formData.status = 'pengajuan'
  formData.unit_id = null
  formData.units = []
  formData.semua_unit_terkait = false
  formData.pengertian = ''
  formData.tujuan = ''
  formData.kebijakan = ''
  formData.prosedur = ''
}

const unescapeHtml = (html) => {
  if (!html) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

watch(() => props.spoData, (newData) => {
  if (newData) {
    formData.id = newData.id
    formData.judul = newData.judul || ''
    formData.jenis = newData.jenis || ''
    formData.tgl_terbit = newData.tgl_terbit || ''
    formData.status = newData.status || 'pengajuan'
    formData.unit_id = newData.unit_id || null
    formData.pengertian = unescapeHtml(newData.pengertian || '')
    formData.tujuan = unescapeHtml(newData.tujuan || '')
    formData.kebijakan = unescapeHtml(newData.kebijakan || '')
    formData.prosedur = unescapeHtml(newData.prosedur || '')
    
    // Load units
    if (newData.units && newData.units.length > 0) {
      formData.units = newData.units.map(u => u.unit_id)
    } else {
      formData.units = []
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

const submitForm = () => {
  if (!isFormValid.value) return
  
  const payload = {
    ...formData,
    units: formData.semua_unit_terkait ? [] : formData.units
  }
  
  emit('saved', payload)
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal {
  z-index: 1050;
}

.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.quill-custom {
  background: white;
}

.quill-custom >>> .ql-container {
  min-height: 150px;
  font-size: 14px;
}

.quill-custom >>> .ql-editor {
  min-height: 150px;
}

.v-select-custom >>> .vs__dropdown-toggle {
  border-color: #dee2e6;
}

.v-select-custom >>> .vs__dropdown-toggle:hover {
  border-color: #0d6efd;
}
</style>
