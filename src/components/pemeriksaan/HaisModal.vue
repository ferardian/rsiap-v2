<template>
  <div v-if="visible" class="hais-overlay" @click.self="$emit('close')">
    <div class="hais-content animate__animated animate__zoomIn animate__faster">
      <!-- Modal Header -->
      <div class="hais-header brand-gradient text-white">
        <h5 class="mb-0">
          <i class="fas fa-virus-slash me-2"></i> Data HAIS Pasien
        </h5>
        <button type="button" class="hais-btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="hais-body">
        <!-- History Section -->
        <div class="history-section mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wider" style="font-size: 0.75rem;">Riwayat HAIS</h6>
            <button class="btn btn-sm btn-blue-outline rounded-pill px-3" @click="resetForm">
              <i class="fas" :class="isFormVisible ? 'fa-times' : 'fa-plus'"></i>
              {{ isFormVisible ? 'Tutup Form' : 'Tambah Baru' }}
            </button>
          </div>

          <div v-if="loadingHistory" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-blue-600" role="status"></div>
          </div>
          <div v-else-if="history.length === 0 && !isFormVisible" class="text-center py-4 text-muted bg-light rounded border border-dashed">
            <i class="fas fa-history d-block fa-2x mb-2 opacity-25"></i>
            <small>Belum ada riwayat HAIS.</small>
          </div>
          <div v-else-if="history.length > 0" class="history-list">
            <div v-for="item in history" :key="item.id" class="history-item p-2 mb-2 rounded border bg-white shadow-sm d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="history-date-badge me-3">
                   <div class="text-xs text-muted">{{ formatDateLabel(item.tanggal).month }}</div>
                   <div class="fw-bold text-dark">{{ formatDateLabel(item.tanggal).day }}</div>
                </div>
                <div>
                   <div class="text-dark fw-bold small">{{ item.kategori || 'Tanpa Kategori' }}</div>
                   <div class="d-flex flex-wrap gap-1 mt-1">
                      <!-- Active Tools -->
                      <template v-for="tool in ['ett', 'cvl', 'ivl', 'uc', 'op']" :key="tool">
                        <span v-if="item[tool] == 1" class="badge bg-blue-100 text-blue-700 border border-blue-200 text-uppercase" style="font-size: 0.6rem;">
                          {{ tool }}
                        </span>
                      </template>
                      <!-- Active Infections -->
                      <template v-for="inf in ['vap', 'pleb', 'ido', 'scabies', 'iad', 'isk', 'hap', 'tinea']" :key="inf">
                        <span v-if="item[inf] == 1" class="badge bg-danger-subtle text-danger border border-danger-subtle text-uppercase" style="font-size: 0.6rem;">
                          {{ inf }}
                        </span>
                      </template>
                   </div>
                   <div v-if="item.antibiotik" class="text-muted text-xs mt-1">Antibiotik: {{ item.antibiotik }}</div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-light border p-1" @click="editRecord(item)" title="Edit">
                  <i class="fas fa-edit text-warning" style="font-size: 0.8rem;"></i>
                </button>
                <button class="btn btn-light border p-1" @click="deleteRecord(item.id)" title="Hapus">
                  <i class="fas fa-trash text-danger" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CRUD Form -->
        <div v-if="isFormVisible" class="hais-form-card animate__animated animate__fadeInUp animate__faster">
          <div class="card border-0 shadow-none">
            <div class="card-body p-0">
              <form @submit.prevent="submitForm">
                <div class="row g-3">
                  <!-- Kategori -->
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Kategori</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-white border-end-0"><i class="fas fa-edit text-muted"></i></span>
                      <v-select 
                        v-model="form.kategori" 
                        :options="['OBGYN', 'ANAK', 'PERI', 'HCU', 'ICU/PICU/NICU']" 
                        placeholder="Pilih..."
                        class="style-chooser-custom flex-grow-1"
                      ></v-select>
                    </div>
                  </div>

                  <!-- Tanggal Input -->
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Tanggal</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-white"><i class="fas fa-calendar-alt text-muted"></i></span>
                      <input type="date" class="form-control" v-model="form.tanggal" required>
                    </div>
                  </div>

                  <!-- Read-only Info -->
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">No. Rawat</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-white"><i class="fas fa-edit text-muted"></i></span>
                      <input type="text" class="form-control bg-light" :value="patient?.no_rawat" readonly>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Nama</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text bg-white"><i class="fas fa-edit text-muted"></i></span>
                      <input type="text" class="form-control bg-light text-truncate" :value="patient?.reg_periksa?.pasien?.nm_pasien || patient?.pasien?.nm_pasien" readonly title="Patient Name">
                    </div>
                  </div>

                  <!-- Indicators: Alat Terpasang -->
                  <div class="col-12 mt-3">
                    <h6 class="form-section-title">Alat Terpasang Hari Ini</h6>
                    <div class="row g-2">
                       <div class="col-md-6">
                          <div class="switch-item">
                            <span>ETT</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input class="form-check-input" type="checkbox" v-model="form.ett" :true-value="1" :false-value="0">
                            </div>
                          </div>
                          <div class="switch-item mt-2">
                            <span>CVL</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input class="form-check-input" type="checkbox" v-model="form.cvl" :true-value="1" :false-value="0">
                            </div>
                          </div>
                       </div>
                       <div class="col-md-6">
                          <div class="switch-item">
                            <span>IVL</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input class="form-check-input" type="checkbox" v-model="form.ivl" :true-value="1" :false-value="0">
                            </div>
                          </div>
                          <div class="switch-item mt-2">
                            <span>UC</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input class="form-check-input" type="checkbox" v-model="form.uc" :true-value="1" :false-value="0">
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <!-- Indicators: Tindakan -->
                  <div class="col-12 mt-2">
                    <h6 class="form-section-title">Tindakan Hari Ini</h6>
                    <div class="row g-2">
                       <div class="col-md-6">
                          <div class="switch-item">
                            <span>OP</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input class="form-check-input" type="checkbox" v-model="form.op" :true-value="1" :false-value="0">
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <!-- Indicators: Kejadian Infeksi -->
                  <div class="col-12 mt-2">
                    <h6 class="form-section-title">Kejadian Infeksi</h6>
                    <div class="row row-cols-2 row-cols-md-4 g-2">
                       <div v-for="inf in infectionIndicators" :key="inf.key" class="col">
                          <div class="switch-item vertical" :class="{ 'opacity-50 pointer-events-none': isInfDisabled(inf.key) }">
                            <span :title="isInfDisabled(inf.key) ? `Perlu mencentang alat terkait dahulu` : ''">{{ inf.label }}</span>
                            <div class="form-check form-switch p-0 m-0">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                v-model="form[inf.key]" 
                                :true-value="1" 
                                :false-value="0"
                                :disabled="isInfDisabled(inf.key)"
                              >
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                   <!-- Enum: Deku -->
                  <div class="col-md-12 mt-2">
                    <h6 class="form-section-title">Riwayat Laporan Infeksi</h6>
                    <label class="form-label small fw-bold text-muted">Dekubitus (DEKU)</label>
                    <div class="btn-group w-100 btn-group-sm mb-3" role="group">
                      <input type="radio" class="btn-check" name="deku" id="deku-ya" value="YA" v-model="form.deku">
                      <label class="btn btn-outline-success" for="deku-ya">YA</label>
                      <input type="radio" class="btn-check" name="deku" id="deku-tidak" value="TIDAK" v-model="form.deku">
                      <label class="btn btn-outline-secondary" for="deku-tidak">TIDAK</label>
                    </div>
                  </div>

                  <!-- Antibiotik -->
                  <div class="col-md-12">
                    <label class="form-label small fw-bold text-muted">Antibiotik</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white"><i class="fas fa-edit text-muted" style="font-size: 0.8rem;"></i></span>
                      <textarea class="form-control" v-model="form.antibiotik" rows="2" placeholder="Sebutkan antibiotik jika ada..."></textarea>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top">
                  <button type="submit" class="btn btn-success w-100 py-2 fw-bold text-uppercase" :disabled="submitting">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    {{ isEditing ? 'UPDATE DATA' : 'SIMPAN' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import haisService from '@/services/haisService'

const props = defineProps({
  visible: Boolean,
  patient: Object
})

const emit = defineEmits(['close', 'save'])

const toast = useToast()
const loadingHistory = ref(false)
const history = ref([])
const isFormVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

const indicatorFields = [
  'ett', 'cvl', 'ivl', 'uc', 'op', 'vap', 'iad', 'pleb', 
  'isk', 'ido', 'hap', 'tinea', 'scabies'
]

const infectionIndicators = [
  { key: 'vap', label: 'VAP', dependency: 'ett' },
  { key: 'pleb', label: 'Pleb', dependency: 'ivl' },
  { key: 'ido', label: 'IDO', dependency: 'op' },
  { key: 'scabies', label: 'Scabies' },
  { key: 'iad', label: 'IAD', dependency: 'cvl' },
  { key: 'isk', label: 'ISK', dependency: 'uc' },
  { key: 'hap', label: 'HAP' },
  { key: 'tinea', label: 'Tinea' }
]

const initialForm = {
  id: null,
  tanggal: new Date().toISOString().split('T')[0],
  no_rawat: '',
  ett: 0, cvl: 0, ivl: 0, uc: 0, op: 0, vap: 0, iad: 0, pleb: 0,
  isk: 0, ido: 0, hap: 0, tinea: 0, scabies: 0,
  deku: 'TIDAK',
  antibiotik: '',
  kategori: ''
}

const form = reactive({ ...initialForm })

const isInfDisabled = (infKey) => {
  const inf = infectionIndicators.find(i => i.key === infKey)
  if (inf && inf.dependency) {
    return form[inf.dependency] == 0
  }
  return false
}

// Auto-reset infection if dependency is unchecked
watch(() => form.ett, (val) => { if (val == 0) form.vap = 0 })
watch(() => form.ivl, (val) => { if (val == 0) form.pleb = 0 })
watch(() => form.op, (val) => { if (val == 0) form.ido = 0 })
watch(() => form.cvl, (val) => { if (val == 0) form.iad = 0 })
watch(() => form.uc, (val) => { if (val == 0) form.isk = 0 })

const fetchHistory = async () => {
  if (!props.patient?.no_rawat) return
  
  loadingHistory.value = true
  try {
    const response = await haisService.getHais({ no_rawat: props.patient.no_rawat })
    if (response.data.success) {
      history.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching HAIS history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const submitForm = async () => {
  // Validation: Check if infection is filled but corresponding tool is not
  const validationPairs = [
    { infection: 'isk', tool: 'uc', labelInf: 'ISK', labelTool: 'UC' },
    { infection: 'vap', tool: 'ett', labelInf: 'VAP', labelTool: 'ETT' },
    { infection: 'iad', tool: 'cvl', labelInf: 'IAD', labelTool: 'CVL' },
    { infection: 'pleb', tool: 'ivl', labelInf: 'PLEB', labelTool: 'IVL' },
    { infection: 'ido', tool: 'op', labelInf: 'IDO', labelTool: 'Tindakan OP' }
  ]

  for (const pair of validationPairs) {
    if (form[pair.infection] == 1 && form[pair.tool] == 0) {
      toast.warning(`Gagal simpan: Mengisi ${pair.labelInf} tapi belum mencentang ${pair.labelTool}`)
      return
    }
  }

  submitting.value = true
  try {
    form.no_rawat = props.patient.no_rawat
    let response;
    
    if (form.id) {
       response = await haisService.update(form.id, form)
    } else {
       response = await haisService.store(form)
    }

    if (response.data.success) {
      toast.success(response.data.message || 'Data HAIS berhasil disimpan')
      await fetchHistory()
      resetForm()
      emit('save')
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menyimpan data HAIS'
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}

const editRecord = (item) => {
  Object.keys(initialForm).forEach(key => {
    form[key] = item[key]
  })
  isEditing.value = true
  isFormVisible.value = true
}

const deleteRecord = async (id) => {
  if (!confirm('Yakin ingin menghapus data ini?')) return
  
  try {
    const res = await haisService.delete(id)
    if (res.data.success) {
      toast.success('Data HAIS berhasil dihapus')
      await fetchHistory()
    }
  } catch (error) {
    toast.error('Gagal menghapus data')
  }
}

const resetForm = () => {
  if (isFormVisible.value && isEditing.value) {
     Object.assign(form, initialForm)
     form.tanggal = new Date().toISOString().split('T')[0]
     isEditing.value = false
     return
  }
  
  if (!isFormVisible.value) {
      Object.assign(form, initialForm)
      form.tanggal = new Date().toISOString().split('T')[0]
      isEditing.value = false
      isFormVisible.value = true
  } else {
      isFormVisible.value = false
  }
}

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']
  return {
    day: d.getDate(),
    month: months[d.getMonth()]
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchHistory()
    isFormVisible.value = false
    isEditing.value = false
  }
})

</script>

<style scoped>
.hais-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.hais-content {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin: 1rem;
}

.hais-header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hais-btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.hais-btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.hais-body {
  padding: 1.25rem;
  overflow-y: auto;
  max-height: 80vh;
}

.bg-blue-600 { background-color: #3b82f6; }
.bg-blue-50 { background-color: #f0f7ff; }
.text-blue-600 { color: #3b82f6; }
.text-blue-700 { color: #1e40af; }
.border-blue { border-color: #dbeafe; }
.btn-blue { background-color: #3b82f6; border-color: #3b82f6; }
.btn-blue:hover { background-color: #2563eb; }
.btn-blue-outline { color: #3b82f6; border-color: #3b82f6; background: transparent; }
.btn-blue-outline:hover { background: #3b82f6; color: white; }
.brand-gradient { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); }

.patient-info-summary {
  background: #f8fafc;
}

.avatar-circle-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.history-item {
  transition: all 0.2s ease;
}

.history-date-badge {
  text-align: center;
  min-width: 40px;
  border-right: 1px solid #f1f5f9;
  padding-right: 10px;
}

.text-xs { font-size: 0.65rem; }
.tracking-wider { letter-spacing: 0.05em; }

.hais-form-card {
  margin-top: 1rem;
}

.form-section-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.switch-item.vertical {
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
}

.switch-item .form-switch .form-check-input {
  width: 2.8em;
  height: 1.4em;
  cursor: pointer;
}

.switch-item .form-switch .form-check-input:checked {
  background-color: #10b981;
  border-color: #10b981;
}

.border-dashed { border-style: dashed !important; }

@media (max-width: 768px) {
  .hais-content {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    margin: 0;
    border-radius: 0;
  }
}
</style>
