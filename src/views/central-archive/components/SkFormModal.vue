<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas" :class="isEdit ? 'fa-edit text-primary' : 'fa-plus-circle text-success'"></i>
          {{ isEdit ? 'Update Berkas SK' : 'Tambah Berkas SK' }}
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body pb-0">
        <form @submit.prevent="submitForm" class="modern-form">
          <!-- Penanggung Jawab -->
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>Penanggung Jawab <span>*</span></label>
              <span class="helper-text">Pilih NIK/Nama PJ</span>
            </div>
            <div class="input-wrapper select-with-search">
              <!-- Using a simple select for demo, in real app might use vue-multiselect -->
              <input 
                type="text" 
                v-model="searchPj" 
                @input="searchPegawai"
                class="form-control" 
                placeholder="Ketik nama atau NIK PJ..."
                autocomplete="off"
                required
              >
              <!-- Dropdown Search Results -->
              <div v-if="pjResults.length > 0 && showPjResults" class="search-results">
                <div 
                  v-for="pj in pjResults" 
                  :key="pj.nik" 
                  class="search-item"
                  @click="selectPj(pj)"
                >
                  <div class="pj-avatar-small">{{ getInitials(pj.nama) }}</div>
                  <div>
                    <div class="fw-bold">{{ pj.nama }}</div>
                    <div class="small-text text-muted">{{ pj.nik }} - {{ pj.jbtn || pj.departemen }}</div>
                  </div>
                </div>
              </div>
              <div v-if="formData.pj" class="selected-badge mt-2">
                <i class="fas fa-user-check text-success mr-1"></i> 
                Terpilih: <strong>{{ selectedPjName || formData.pj }}</strong>
                <button type="button" class="btn-clear-badge" @click="clearPj">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Judul SK -->
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>Judul SK <span>*</span></label>
            </div>
            <div class="input-wrapper">
              <textarea 
                v-model="formData.judul" 
                class="form-control" 
                rows="3" 
                placeholder="Masukkan judul Surat Keputusan"
                required
              ></textarea>
            </div>
          </div>

          <!-- Tanggal Terbit -->
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>Tanggal Terbit <span>*</span></label>
            </div>
            <div class="input-wrapper">
              <input 
                v-model="formData.tgl_terbit" 
                type="date" 
                class="form-control" 
                required
                :disabled="isEdit"
              >
              <small v-if="isEdit" class="text-warning mt-1 d-block">
                <i class="fas fa-exclamation-triangle"></i> Tanggal terbit tidak bisa diubah setelah SK dibuat.
              </small>
            </div>
          </div>

          <!-- Jenis SK -->
          <div class="form-group row-group">
            <div class="label-wrapper">
              <label>Jenis SK <span>*</span></label>
            </div>
            <div class="input-wrapper">
              <select v-model="formData.jenis" class="form-control" required>
                <option value="" disabled>Pilih Jenis SK</option>
                <option value="A">SK Dokumen</option>
                <option value="B">SK Pengangkatan Jabatan</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
        <button type="button" class="btn-submit" @click="submitForm" :disabled="loading || !isValid">
          <i class="fas fa-save" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
          {{ loading ? 'Menyimpan...' : (isEdit ? 'Update SK' : 'Simpan SK') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { skService } from '@/services/skService'
import { format } from 'date-fns'
import debounce from 'lodash/debounce'
import { pegawaiService } from '@/services/pegawaiService'

const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  skData: Object
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const loading = ref(false)
const searchPj = ref('')
const pjResults = ref([])
const showPjResults = ref(false)
const selectedPjName = ref('')

const formData = reactive({
  judul: '',
  pj: '',
  tgl_terbit: format(new Date(), 'yyyy-MM-dd'),
  jenis: ''
})

// Validation
const isValid = computed(() => {
  return formData.judul && formData.judul.length >= 3 && 
         formData.pj && 
         formData.tgl_terbit && 
         formData.jenis
})

// Initialize form
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.skData) {
      formData.judul = props.skData.judul || ''
      formData.pj = props.skData.pj || ''
      selectedPjName.value = props.skData.penanggung_jawab?.nama || props.skData.pj || ''
      searchPj.value = selectedPjName.value
      
      try {
        formData.tgl_terbit = new Date(props.skData.tgl_terbit.replace(' ', 'T').split('.')[0]).toISOString().split('T')[0]
      } catch (e) {
        formData.tgl_terbit = format(new Date(), 'yyyy-MM-dd')
      }
      formData.jenis = props.skData.jenis || ''
    } else {
      formData.judul = ''
      formData.pj = ''
      formData.tgl_terbit = format(new Date(), 'yyyy-MM-dd')
      formData.jenis = ''
      searchPj.value = ''
      selectedPjName.value = ''
    }
  }
})

// Close dropdown if clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.select-with-search')) {
    showPjResults.value = false
  }
}

watch(() => props.show, (showing) => {
  if (showing) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Search Pegawai
const searchPegawai = debounce(async () => {
  if (!searchPj.value || searchPj.value.length < 3) {
    pjResults.value = []
    showPjResults.value = false
    return
  }

  try {
    const response = await pegawaiService.searchPegawai(searchPj.value, 10)
    if (response.data && response.data.data) {
      pjResults.value = response.data.data
      showPjResults.value = true
    }
  } catch (error) {
    console.error('Error searching pegawai:', error)
  }
}, 400)

const selectPj = (pj) => {
  formData.pj = pj.nik
  selectedPjName.value = pj.nama
  searchPj.value = pj.nama
  showPjResults.value = false
}

const clearPj = () => {
  formData.pj = ''
  selectedPjName.value = ''
  searchPj.value = ''
  pjResults.value = []
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

// Submit
const submitForm = async () => {
  if (!isValid.value) {
    toast.warning('Mohon lengkapi semua field yang diwajibkan')
    return
  }

  loading.value = true
  try {
    const payload = { ...formData }
    
    if (props.isEdit) {
      // Identifier = btoa(nomor.jenis.tgl_terbit)
      const d = props.skData
      const identifier = btoa(`${d.nomor}.${d.jenis}.${d.tgl_terbit}`)
      await skService.updateSk(identifier, payload)
      toast.success('SK berhasil diupdate')
    } else {
      await skService.createSk(payload)
      toast.success('SK berhasil ditambahkan')
    }
    
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error saving SK:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan SK')
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
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
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
}

/* Modern Form Styles */
.row-group {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}

.label-wrapper {
  flex: 0 0 35%;
}

.label-wrapper label {
  display: block;
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.label-wrapper label span {
  color: #ef4444;
}

.helper-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  transition: border-color 0.2s;
  background: #fff;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
}

/* Search Dropdown */
.select-with-search {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.search-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.search-item:hover {
  background: #f8fafc;
}

.pj-avatar-small {
  width: 32px; height: 32px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: #475569;
}

.selected-badge {
  display: inline-flex;
  align-items: center;
  background: #f0fdf4;
  color: #166534;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid #bbf7d0;
}

.btn-clear-badge {
  background: none;
  border: none;
  color: #166534;
  margin-left: 0.5rem;
  cursor: pointer;
  opacity: 0.6;
}

.btn-clear-badge:hover {
  opacity: 1;
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
  background: #3b82f6;
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
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .row-group {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
