<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas" :class="isEdit ? 'fa-edit text-primary' : 'fa-plus-circle text-primary'"></i>
          {{ isEdit ? 'Edit Berkas Komite PPI' : 'Buat Berkas Komite PPI' }}
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body pb-0">
        <form @submit.prevent="submitForm" id="ppiForm" class="modern-form">
          
          <div v-if="isEdit" class="info-alert mb-4">
            <i class="fas fa-info-circle mr-2"></i>
            Nomor Surat dan Tanggal Terbit tidak dapat diubah untuk menjaga konsistensi penomoran.
          </div>

          <div v-if="isEdit" class="form-row">
             <div class="form-group col-sm-6">
                <label>Nomor Surat</label>
                <div class="readonly-value">
                  <div class="badge-nomor">
                    {{ formatNomorSurat(formData) }}
                  </div>
                </div>
            </div>
            <div class="form-group col-sm-6">
                <label>Tanggal Terbit</label>
                <div class="readonly-value">
                   {{ formatDate(formData.tgl_terbit) }}
                </div>
            </div>
          </div>

          <div v-if="!isEdit" class="form-row">
            <div class="form-group col-sm-6">
              <label>Tanggal Terbit <span>*</span></label>
              <input type="date" v-model="formData.tgl_terbit" class="form-control" required :max="maxDate">
              <small class="text-muted mt-1 d-block">Penomoran akan otomatis digenerate.</small>
            </div>
          </div>

          <div class="form-group">
            <label>Perihal Surat <span>*</span></label>
            <input type="text" v-model="formData.perihal" class="form-control" placeholder="Contoh: Monitoring PPI Kunjungan Pasien" required>
          </div>

          <div class="form-group has-search">
            <label>Penanggung Jawab (PJ) <span>*</span></label>
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchPj" 
                class="form-control" 
                placeholder="Cari NIK atau Nama Pegawai..." 
                @input="handleSearchPegawai"
                @focus="showPegawaiList = true"
              >
              <button 
                v-if="searchPj && selectedPj" 
                type="button" 
                class="btn-clear" 
                @click="clearSelectedPj"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Dropdown Hasil Pencarian -->
            <div v-if="showPegawaiList && searchList.length > 0" class="search-results-dropdown">
              <div 
                v-for="pegawai in searchList" 
                :key="pegawai.nik" 
                class="search-result-item"
                @click="selectPegawai(pegawai)"
              >
                <div class="pegawai-info">
                  <div class="pegawai-name">{{ pegawai.nama }}</div>
                  <div class="pegawai-nik">NIK: {{ pegawai.nik }} &bull; {{ pegawai.jbtn || '-' }}</div>
                </div>
              </div>
            </div>
            <div v-else-if="showPegawaiList && searchPj && searchingPegawai" class="search-results-dropdown p-3 text-center text-muted">
              <i class="fas fa-spinner fa-spin mr-2"></i> Mencari pegawai...
            </div>
            <div v-else-if="showPegawaiList && searchPj && !searchingPegawai && searchList.length === 0" class="search-results-dropdown p-3 text-center text-muted">
              Tidak ada pegawai ditemukan.
            </div>

            <!-- Validation Info -->
            <small v-if="!selectedPj?.nik && isSubmitted" class="text-danger mt-1 d-block">
              <i class="fas fa-exclamation-circle"></i> Penanggung Jawab wajib dipilih dari daftar pencarian.
            </small>
            <div v-else-if="selectedPj?.nik" class="selected-pj-badge mt-2">
              <div class="pj-avatar">{{ getInitials(selectedPj.nama) }}</div>
              <div class="pj-details">
                <span class="pj-nama">{{ selectedPj.nama }}</span>
                <span class="pj-nik">{{ selectedPj.nik }}</span>
              </div>
              <i class="fas fa-check-circle text-success ml-auto"></i>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
        <button type="submit" form="ppiForm" class="btn-submit" :disabled="loading || (isSubmitted && !selectedPj?.nik)">
          <i class="fas fa-save" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
          {{ loading ? 'Menyimpan...' : (isEdit ? 'Update Berkas' : 'Buat Berkas') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

// Services
import { komitePpiService } from '@/services/komitePpiService'
import { pegawaiService } from '@/services/pegawaiService'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

// Form Data State
const loading = ref(false)
const isSubmitted = ref(false)
const formData = ref({
  pj: '',
  perihal: '',
  tgl_terbit: new Date().toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 30)
  return tomorrow.toISOString().split('T')[0]
})

// Pegawai Search State
const searchPj = ref('')
const searchingPegawai = ref(false)
const searchList = ref([])
const showPegawaiList = ref(false)
const selectedPj = ref(null)

// Initialize form when modal opens or edits change
watch(() => props.show, (newVal) => {
  if (newVal) {
    isSubmitted.value = false
    loading.value = false
    
    if (props.isEdit && props.data) {
      const tgl = props.data.tgl_terbit ? props.data.tgl_terbit.split(' ')[0] : ''
      formData.value = {
        nomor: props.data.nomor,
        prefix: props.data.prefix,
        pj: props.data.pj || '',
        perihal: props.data.perihal || '',
        tgl_terbit: tgl,
        status: props.data.status || '1'
      }
      
      if (props.data.penanggung_jawab) {
        selectedPj.value = {
          nik: props.data.penanggung_jawab.nik,
          nama: props.data.penanggung_jawab.nama,
          jbtn: props.data.penanggung_jawab.jbtn
        }
        searchPj.value = props.data.penanggung_jawab.nama
      } else if (props.data.pj) {
        selectedPj.value = { nik: props.data.pj, nama: props.data.pj }
        searchPj.value = props.data.pj
      }
    } else {
      formData.value = {
        pj: '',
        perihal: '',
        tgl_terbit: new Date().toISOString().split('T')[0]
      }
      searchPj.value = ''
      selectedPj.value = null
    }
    
    searchList.value = []
    showPegawaiList.value = false
  }
})

const handleClickOutside = (e) => {
  if (!e.target.closest('.search-wrapper') && !e.target.closest('.search-results-dropdown')) {
    showPegawaiList.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleSearchPegawai = debounce(async () => {
  if (!searchPj.value || searchPj.value.length < 3) {
    searchList.value = []
    if (!searchPj.value && selectedPj.value) {
       clearSelectedPj()
    }
    return
  }
  
  searchingPegawai.value = true
  showPegawaiList.value = true
  
  try {
    const res = await pegawaiService.searchPegawai(searchPj.value, 10)
    searchList.value = res.data?.data || []
  } catch (error) {
    console.error('Error searching pegawai:', error)
    searchList.value = []
  } finally {
    searchingPegawai.value = false
  }
}, 300)

const selectPegawai = (pegawai) => {
  selectedPj.value = {
    nik: pegawai.nik,
    nama: pegawai.nama,
    jbtn: pegawai.jbtn
  }
  formData.value.pj = pegawai.nik
  searchPj.value = pegawai.nama
  showPegawaiList.value = false
}

const clearSelectedPj = () => {
  selectedPj.value = null
  formData.value.pj = ''
  searchPj.value = ''
  searchList.value = []
  
  setTimeout(() => {
    const inputEL = document.querySelector('.search-wrapper input')
    if(inputEL) inputEL.focus()
  }, 50)
}

const formatNomorSurat = (data) => {
  if (!data || !data.nomor) return '-'
  try {
    const tglPattern = data.tgl_terbit ? format(new Date(data.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(data.nomor).padStart(3, '0')
    return `${no}/${data.prefix || 'KOM-PPI'}/${tglPattern}`
  } catch (e) {
    return `${data.nomor}/${data.prefix || 'KOM-PPI'}`
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString.replace(' ', 'T').split('.')[0])
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const submitForm = async () => {
  isSubmitted.value = true
  
  if (!selectedPj.value || !selectedPj.value.nik) {
    toast.warning('Penanggung Jawab harus dipilih dari daftar pegawai')
    return
  }
  
  formData.value.pj = selectedPj.value.nik
  loading.value = true
  
  try {
    if (props.isEdit) {
      const identifier = btoa(`${props.data.nomor}.${formData.value.tgl_terbit}`)
      const updateData = {
        nomor: props.data.nomor,
        tgl_terbit: formData.value.tgl_terbit,
        pj: formData.value.pj,
        perihal: formData.value.perihal,
        status: formData.value.status || '1'
      }
      await komitePpiService.update(identifier, updateData)
      toast.success('Berkas berhasil diperbarui')
    } else {
      await komitePpiService.store(formData.value)
      toast.success('Berkas berhasil dibuat')
    }
    
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error saving berkas:', error)
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.response?.data?.errors) {
       const errors = error.response.data.errors
       const firstKey = Object.keys(errors)[0]
       toast.error(errors[firstKey][0])
    } else {
      toast.error('Gagal menyimpan berkas')
    }
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
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px 16px 0 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close-icon {
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-icon:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.modern-form label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  margin-bottom: 0.5rem;
}

.modern-form label span { color: #ef4444; }

.form-group { margin-bottom: 1.5rem; }

.form-row { display: flex; gap: 1.5rem; margin-bottom: 0; }

.col-sm-6 { flex: 1; }

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
  color: #1e293b;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.info-alert {
  background: #e0f2fe;
  color: #0369a1;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #bae6fd;
}

.readonly-value { padding: 0.75rem 0; font-size: 0.95rem; color: #475569; font-weight: 500; }

.badge-nomor {
  display: inline-flex;
  font-family: monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
}

.has-search { position: relative; }

.search-wrapper { position: relative; display: flex; align-items: center; }

.search-icon { position: absolute; left: 1rem; color: #94a3b8; }

.search-wrapper .form-control { padding-left: 2.75rem; padding-right: 2.5rem; }

.btn-clear {
  position: absolute;
  right: 0.75rem;
  background: rgba(148, 163, 184, 0.2);
  border: none;
  color: #64748b;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover { background: #ef4444; color: white; }

.search-results-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
  z-index: 50;
}

.search-result-item { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }

.search-result-item:hover { background: #f8fafc; }

.pegawai-info { display: flex; flex-direction: column; }

.pegawai-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }

.selected-pj-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 8px;
}

.pj-avatar {
  width: 36px; height: 36px;
  background: #e0f2fe; color: #0369a1;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 0.85rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 1rem;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white; border: 1px solid #cbd5e1; border-radius: 8px;
  color: #475569; font-weight: 600; cursor: pointer;
}

.btn-submit {
  padding: 0.75rem 1.75rem;
  background: #3b82f6; border: none; border-radius: 8px;
  color: white; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }

@media (max-width: 640px) {
  .form-row { flex-direction: column; gap: 0; }
  .modal-content { height: 100vh; max-height: 100vh; border-radius: 0; }
}
</style>
