<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-upload text-primary"></i>
          Upload Bukti Kredensial
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body" v-if="sk">
        <div class="info-box mb-4">
          <div class="info-icon"><i class="fas fa-info-circle"></i></div>
          <div class="info-text">
            Upload dokumen pendukung proses kredensial (hasil asesmen, rekomendasi komite, dll).
          </div>
        </div>
        
        <div class="sk-detail-card mb-4">
          <div class="detail-header">
            <span class="badge-nomor">
              <i class="fas fa-user text-primary mr-1"></i> {{ sk.target_pegawai?.nama || sk.nik }}
            </span>
          </div>
          <div class="detail-body">
            <h4 class="sk-judul">{{ sk.judul || sk.perihal }}</h4>
            <p class="text-muted fs-xs mt-1">Nomor SK: {{ formatNomorSk(sk) }}</p>
          </div>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>File Bukti Kredensial <span>*</span></label>
            </div>
            <div class="input-wrapper">
              <input 
                type="file" 
                ref="fileInput"
                class="form-control file-input" 
                accept="application/pdf,image/*"
                required
                @change="handleFileChange"
              >
              <small class="text-muted mt-1 d-block">Maksimal ukuran file: 20MB. Format: PDF/JPG/PNG.</small>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
        <button type="button" class="btn-submit" @click="submitForm" :disabled="loading || !fileSelected">
          <i class="fas fa-cloud-upload-alt" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
          {{ loading ? 'Mengupload...' : 'Upload Bukti' }}
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
import id from 'date-fns/locale/id'

const props = defineProps({
  show: Boolean,
  sk: Object
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
    const dateInput = data.tgl_terbit ? data.tgl_terbit.replace(' ', 'T') : null
    const tglPattern = dateInput ? format(new Date(dateInput), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    return `${no}/${data.prefix}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix}`
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 20MB.')
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
    const d = props.sk
    const identifier = btoa(`${d.nomor}.${d.jenis}.${d.tgl_terbit}`)
    
    // Create form data
    const formData = new FormData()
    formData.append('bukti_kredensial_file', file)
    
    // Append all original data to maintain consistency (Backend update method requirement)
    for (const key in d) {
       if (d[key] !== null && typeof d[key] !== 'object') {
          formData.append(key, d[key])
       }
    }
    
    await skService.updateSk(identifier, formData, true)
    
    toast.success('Bukti Kredensial berhasil diupload')
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
  overflow-y: auto;
  flex: 1;
}

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.info-icon {
  color: #3b82f6;
  font-size: 1.25rem;
}

.info-text {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.4;
}

.sk-detail-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.detail-header {
  padding: 0.75rem 1.25rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.badge-nomor {
  font-weight: 600;
  color: #334155;
  font-size: 0.85rem;
}

.detail-body {
  padding: 1.25rem;
}

.sk-judul {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label-wrapper label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.label-wrapper span {
  color: #ef4444;
}

.file-input {
  width: 100%;
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
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
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.fs-xs { font-size: 0.75rem; }
</style>
