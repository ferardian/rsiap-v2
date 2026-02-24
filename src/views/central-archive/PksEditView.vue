<template>
  <div class="pks-create-wrapper">
    <div class="create-container">
      <!-- Header -->
      <div class="create-header">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light rounded-circle btn-back shadow-sm" @click="$router.back()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 class="mb-0 fw-bold">Ubah Dokumen PKS</h2>
            <p class="text-muted small mb-0">Perbarui informasi Perjanjian Kerja Sama.</p>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div v-if="loading" class="text-center py-5">
              <i class="fas fa-circle-notch fa-spin fa-3x text-primary mb-3"></i>
              <p class="text-muted">Memuat data...</p>
          </div>
          <div v-else class="card glass-card border-0 shadow-sm">
            <div class="card-body p-4 p-md-4">
              <div class="mb-4 pb-2 border-bottom d-flex align-items-center gap-3">
                  <div class="icon-box bg-soft-warning rounded-lg p-2 px-3">
                      <i class="fas fa-edit text-warning"></i>
                  </div>
                  <h5 class="fw-bold mb-0">Ubah Informasi Perjanjian</h5>
              </div>

              <div class="row g-4">
                <!-- Judul -->
                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">Judul PKS <span class="text-danger">*</span></label>
                  <textarea 
                    v-model="state.judul" 
                    class="form-control form-control-lg" 
                    rows="3" 
                    placeholder="Masukkan perihal atau judul kerja sama..."
                   :class="{'is-invalid': errors.judul}"
                  ></textarea>
                  <div class="invalid-feedback">{{ errors.judul }}</div>
                </div>

                <!-- Nomor PKS -->
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">No. PKS Internal <span class="text-danger">*</span></label>
                  <input 
                    v-model="state.no_pks_internal" 
                    type="text" 
                    class="form-control" 
                    placeholder="Contoh: 001/A/PKS/..."
                   :class="{'is-invalid': errors.no_pks_internal}"
                  />
                  <div class="invalid-feedback">{{ errors.no_pks_internal }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">No. PKS Eksternal</label>
                  <input 
                    v-model="state.no_pks_eksternal" 
                    type="text" 
                    class="form-control" 
                    placeholder="Masukkan nomor dari mitra (jika ada)..."
                  />
                </div>

                <!-- Dates -->
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Tanggal Terbit</label>
                  <input v-model="state.tgl_terbit" type="date" class="form-control" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Berlaku Mulai <span class="text-danger">*</span></label>
                  <input 
                    v-model="state.tanggal_awal" 
                    type="date" 
                    class="form-control"
                    :class="{'is-invalid': errors.tanggal_awal}"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Berlaku Hingga</label>
                  <input v-model="state.tanggal_akhir" type="date" class="form-control" />
                </div>

                <!-- Penanggung Jawab -->
                <div class="col-md-8">
                  <label class="form-label small fw-bold text-muted">Penanggung Jawab <span class="text-danger">*</span></label>
                  <v-select
                    v-model="state.pj_model"
                    :options="pegawaiDict"
                    label="nama"
                    placeholder="Pilih Penanggung Jawab..."
                    class="v-select-custom"
                    :class="{'is-invalid': errors.pj}"
                  >
                    <template #option="option">
                      <div class="d-flex align-items-center gap-2">
                        <span class="text-xs text-muted font-monospace">{{ option.nik }}</span>
                        <span>{{ option.nama }}</span>
                      </div>
                    </template>
                  </v-select>
                  <div v-if="errors.pj" class="text-danger x-small mt-1">{{ errors.pj }}</div>
                </div>

                <!-- Status -->
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">Status <span class="text-danger">*</span></label>
                  <select v-model="state.status" class="form-select">
                    <option value="1">Aktif</option>
                    <option value="0">Non-Aktif</option>
                  </select>
                </div>

                <!-- Berkas -->
                <div class="col-12 mt-4 pt-3 border-top">
                    <label class="form-label small fw-bold text-muted">Berkas PKS (PDF/JPG/PNG)</label>
                    <div class="file-upload-container" :class="{'has-file': state.file || state.berkas}">
                        <input 
                          type="file" 
                          id="pksFile" 
                          class="file-input" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          @change="handleFileChange"
                        />
                        <label for="pksFile" class="file-label">
                            <i class="fas fa-cloud-upload-alt mb-2"></i>
                            <span v-if="!state.file && !state.berkas">Pilih Berkas atau Tarik ke Sini</span>
                            <span v-else-if="state.file" class="fw-bold text-primary">{{ state.file.name }}</span>
                            <span v-else class="fw-bold text-info italic">Berkas Saat Ini: {{ state.berkas }}</span>
                            
                            <span class="text-muted x-small mt-1" v-if="state.file">
                                ({{ formatFileSize(state.file.size) }})
                            </span>
                        </label>
                        <button v-if="state.file" class="btn-remove-file" @click="removeFile">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-muted x-small mt-2 italic">
                        <i class="fas fa-info-circle me-1"></i> Kosongkan jika tidak ingin mengubah berkas yang sudah ada.
                    </p>
                </div>
              </div>

              <div class="mt-5 pt-4 d-flex justify-content-end gap-3 border-top">
                <button class="btn btn-light px-4" @click="$router.back()" :disabled="submitting">Batal</button>
                <button class="btn btn-primary px-5 fw-bold shadow-sm" @click="submitPks" :disabled="submitting">
                  <i class="fas fa-save me-2" v-if="!submitting"></i>
                  <i class="fas fa-spinner fa-spin me-2" v-else></i>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import pksService from '@/services/pksService'
import { pegawaiService } from '@/services/pegawaiService'
import api from '@/services/api'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const submitting = ref(false)
const pegawaiDict = ref([])

const state = reactive({
  no_pks_internal: '',
  no_pks_eksternal: '',
  judul: '',
  tgl_terbit: '',
  tanggal_awal: '',
  tanggal_akhir: '',
  file: null,
  berkas: '',
  pj: '',
  pj_model: null,
  status: '1'
})

const errors = reactive({
  judul: '',
  no_pks_internal: '',
  tanggal_awal: '',
  pj: ''
})

onMounted(async () => {
  await Promise.all([
    fetchEmployees(),
    fetchPksData()
  ])
})

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        state.file = file
    }
}

const removeFile = () => {
    state.file = null
    const input = document.getElementById('pksFile')
    if (input) input.value = ''
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fetchEmployees = async () => {
  try {
    const response = await pegawaiService.getKaryawanList({ limit: 500 })
    pegawaiDict.value = response.data?.data || []
  } catch (err) {
    console.warn("Could not fetch employee list", err)
  }
}

const fetchPksData = async () => {
    loading.value = true
    try {
        const id = route.params.id
        const res = await pksService.getPksById(id, { include: ['penanggungJawab'] })
        const data = res.data?.data || res.data

        Object.keys(state).forEach(k => {
            if (data[k] !== undefined) {
                state[k] = data[k]
            }
        })

        // Format dates for input[type=date]
        const dateFields = ['tgl_terbit', 'tanggal_awal', 'tanggal_akhir']
        dateFields.forEach(f => {
            if (state[f] && state[f] !== '0000-00-00') {
               try {
                 state[f] = new Date(state[f]).toISOString().split('T')[0]
               } catch(e) {}
            } else {
                state[f] = ''
            }
        })

        // Ensure status is string for select
        state.status = String(data.status || '0')

        // Handle PJ model for v-select
        if (data.penanggung_jawab) {
            state.pj_model = data.penanggung_jawab
        } else if (data.pj) {
             state.pj_model = data.pj
        }

    } catch(err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat data PKS', 'error')
        router.back()
    } finally {
        loading.value = false
    }
}

const validate = () => {
    let valid = true
    Object.keys(errors).forEach(k => errors[k] = '')

    if (!state.judul) { errors.judul = 'Judul wajib diisi'; valid = false }
    if (!state.no_pks_internal) { errors.no_pks_internal = 'Nomor PKS wajib diisi'; valid = false }
    if (!state.tanggal_awal) { errors.tanggal_awal = 'Tanggal awal wajib diisi'; valid = false }
    if (!state.pj_model) { errors.pj = 'Pilih penanggung jawab'; valid = false }

    return valid
}

const submitPks = async () => {
  if (!validate()) return

  submitting.value = true
  try {
    const id = route.params.id
    const formData = new FormData()
    Object.keys(state).forEach(key => {
        if (key === 'pj_model' || key === 'pj') return // Skip explicitly handled keys
        if (key === 'file') {
             if (state.file) formData.append('file', state.file)
        } else if (state[key] !== null && state[key] !== undefined && state[key] !== '') {
             formData.append(key, state[key])
        }
    })
    
    // Fix PJ data: must be NIK string
    const pjValue = state.pj_model?.nik || state.pj_model?.nip || state.pj_model || ''
    formData.append('pj', pjValue)

    await pksService.updatePks(id, formData)
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data PKS telah diperbarui.',
      timer: 1500,
      showConfirmButton: false
    })
    
    router.push('/central-archive/pks')
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || err.message || 'Gagal memperbarui PKS'
    Swal.fire('Error', msg, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.pks-create-wrapper {
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
  margin-bottom: 2rem;
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
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.bg-soft-warning {
    background-color: #fffbeb;
}

.rounded-lg { border-radius: 12px; }
.rounded-xl { border-radius: 16px; }

.x-small { font-size: 0.75rem; }
.italic { font-style: italic; }

/* v-select custom styling */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 5px;
  background: white;
  min-height: 42px;
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

.file-upload-container {
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    position: relative;
    transition: all 0.2s;
    background: #f8fafc;
    cursor: pointer;
}

.file-upload-container:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.file-upload-container.has-file {
    border-color: #3b82f6;
    background: #eff6ff;
    border-style: solid;
}

.file-input {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0;
    cursor: pointer;
}

.file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.file-label i {
    font-size: 2rem;
    color: #94a3b8;
}

.file-upload-container.has-file .file-label i {
    color: #3b82f6;
}

.btn-remove-file {
    position: absolute;
    top: 10px; right: 10px;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    font-size: 0.8rem;
}
</style>
