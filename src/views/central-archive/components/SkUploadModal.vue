<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-upload text-warning"></i>
          Upload Berkas SK
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="skData">
        <div class="warning-box mb-4">
          <div class="warning-icon"><i class="fas fa-info-circle"></i></div>
          <div class="warning-text">
            Apabila berkas <strong>sudah pernah diupload</strong>, tindakan ini akan menimpa berkas lama dengan berkas yang baru.
          </div>
        </div>
        
        <div class="info-badge-box mb-4">
          <span class="text-muted small-text">Nomor SK:</span>
          <strong>{{ formatNomorSk(skData) }}</strong>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>File Berkas <span>*</span></label>
            </div>
            <div class="input-wrapper">
              <input 
                type="file" 
                ref="fileInput"
                class="form-control file-input" 
                accept="application/pdf"
                required
                @change="handleFileChange"
              >
              <small class="text-muted mt-1 d-block">Maksimal ukuran file: 5MB. Format: PDF.</small>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
        <button type="button" class="btn-submit" @click="submitForm" :disabled="loading || !fileSelected">
          <i class="fas fa-cloud-upload-alt" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
          {{ loading ? 'Mengupload...' : 'Upload Berkas' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { skService } from '@/services/skService'
import { format } from 'date-fns'

const props = defineProps({
  show: Boolean,
  skData: Object
})

const emit = defineEmits(['close', 'uploaded'])
const toast = useToast()

const loading = ref(false)
const fileInput = ref(null)
const fileSelected = ref(false)

// Reset state when modal opens
watch(() => props.show, (showing) => {
  if (showing) {
    fileSelected.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
})

const formatNomorSk = (data) => {
  if (!data) return '-'
  try {
    // Replace space with T for ISO compatibility
    const dateInput = data.tgl_terbit ? data.tgl_terbit.replace(' ', 'T') : null
    const tglPattern = dateInput ? format(new Date(dateInput), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    return `${no}/${data.jenis}/${data.prefix}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.jenis}/${data.prefix}`
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.')
      fileInput.value.value = ''
      fileSelected.value = false
      return
    }
    if (file.type !== 'application/pdf') {
      toast.error('Format file tidak didukung. Harap upload file PDF.')
      fileInput.value.value = ''
      fileSelected.value = false
      return
    }
    fileSelected.value = true
  } else {
    fileSelected.value = false
  }
}

const submitForm = async () => {
  if (!fileSelected.value || !fileInput.value.files[0]) {
    toast.warning('Silakan pilih file terlebih dahulu')
    return
  }
  
  const file = fileInput.value.files[0]
  
  loading.value = true
  try {
    const d = props.skData
    const identifier = btoa(`${d.nomor}.${d.jenis}.${d.tgl_terbit}`)
    
    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    // Append all original data just like filetrack did
    for (const key in d) {
      if (d[key] !== null) formData.append(key, d[key])
    }
    
    await skService.updateSk(identifier, formData, true)
    
    toast.success('Berkas berhasil diupload')
    emit('uploaded')
    emit('close')
  } catch (error) {
    console.error('Error uploading file:', error)
    toast.error(error?.response?.data?.message || 'Gagal mengupload berkas')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close-icon {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-icon:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
}

.warning-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.warning-icon {
  color: #d97706;
  font-size: 1.25rem;
}

.warning-text {
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.4;
}

.info-badge-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border-left: 3px solid #64748b;
}

.row-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-wrapper label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.label-wrapper span {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.file-input {
  padding: 0.5rem;
  background: #f8fafc;
}

.file-input::file-selector-button {
  background: #e2e8f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.2s;
}

.file-input::file-selector-button:hover {
  background: #cbd5e1;
  color: #1e293b;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  background: #eab308;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background: #ca8a04;
}

.btn-submit:disabled {
  background: #fde047;
  color: #854d0e;
  cursor: not-allowed;
}
</style>
