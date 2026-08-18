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

      <div class="modal-body" v-if="sk">
        <div class="warning-box mb-4">
          <div class="warning-icon"><i class="fas fa-info-circle"></i></div>
          <div class="warning-text">
            Apabila berkas <strong>sudah pernah diupload</strong>, tindakan ini akan menimpa berkas lama dengan berkas yang baru.
          </div>
        </div>
        
        <div class="sk-detail-card mb-4" v-if="sk">
          <div class="detail-header">
            <span class="badge-nomor">
              <i class="fas fa-hashtag text-primary mr-1"></i> {{ formatNomorSk(sk) }}
            </span>
            <span class="status-badge" :class="sk.status === 'disetujui' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'">
              {{ sk.status_approval || sk.status || 'Draft' }}
            </span>
          </div>
          <div class="detail-body">
            <h4 class="sk-judul">{{ sk.judul || sk.perihal || 'Tanpa Judul' }}</h4>
            <div class="detail-grid mt-3">
              <div class="detail-item">
                <i class="fas fa-user-tie text-gray-400"></i>
                <div>
                  <div class="detail-label">Penanggung Jawab</div>
                  <div class="detail-value">{{ sk.penanggung_jawab?.nama || sk.pj }}</div>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar-alt text-gray-400"></i>
                <div>
                  <div class="detail-label">Tanggal Terbit</div>
                  <div class="detail-value">{{ formatDateLocal(sk.tgl_terbit) }}</div>
                </div>
              </div>
            </div>
          </div>
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
              <small class="text-muted mt-1 d-block">Maksimal ukuran file: 20MB. Format: PDF.</small>
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
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 20MB.')
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

const formatDateLocal = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return format(d, 'dd MMMM yyyy', { locale: id })
  } catch (e) {
    return dateString
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
  overflow-y: auto;
  flex: 1;
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

.sk-detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.detail-header {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-nomor {
  font-family: monospace;
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.bg-success-light { background: #dcfce7; }
.text-success { color: #166534; }
.bg-warning-light { background: #fef9c3; }
.text-warning { color: #854d0e; }

.detail-body {
  padding: 1.25rem;
}

.sk-judul {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-item i {
  margin-top: 0.25rem;
  font-size: 1.1rem;
}

.text-gray-400 { color: #94a3b8; }

.detail-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.15rem;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
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

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    width: 100%;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
    border-radius: 0;
  }

  .modal-title {
    font-size: 1.15rem;
  }

  .modal-body {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .warning-box {
    padding: 0.85rem;
    font-size: 0.8rem;
  }

  .sk-detail-card {
    border-radius: 8px;
  }

  .detail-header {
    padding: 0.85rem 1rem;
  }

  .sk-judul {
    font-size: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
    border-radius: 0;
    gap: 0.75rem;
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0));
  }

  .btn-cancel, .btn-submit {
    flex: 1;
    justify-content: center;
    padding: 0.85rem 1rem;
  }
}
</style>
