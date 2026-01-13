<template>
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-bold">
            <i class="fas fa-clipboard-check me-2"></i> Skrining Gizi
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>
        <div class="modal-body p-4">
          <!-- Patient Info -->
          <div class="alert alert-light border mb-4">
            <div class="d-flex align-items-center">
              <div class="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <i class="fas fa-user text-success fa-lg"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1">{{ formData.nm_pasien }}</h6>
                <p class="mb-0 text-muted small"><i class="fas fa-id-card me-1"></i> {{ formData.no_rawat }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="save">
            <div class="row g-4">
              <!-- Left Column: Kategori (2 cols) -->
              <div class="col-md-2">
                <h6 class="fw-bold text-success border-bottom pb-2 mb-3">Kategori</h6>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check custom-radio-card">
                    <input class="form-check-input" type="radio" name="kategori" id="kat_obgyn" value="OBGYN" v-model="formData.kategori" required>
                    <label class="form-check-label w-100 p-2 border rounded text-center cursor-pointer" for="kat_obgyn" :class="formData.kategori === 'OBGYN' ? 'bg-success text-white border-success' : ''">
                      <i class="fas fa-female mb-1 d-block"></i> OBGYN
                    </label>
                  </div>
                  <div class="form-check custom-radio-card">
                    <input class="form-check-input" type="radio" name="kategori" id="kat_anak" value="ANAK" v-model="formData.kategori">
                    <label class="form-check-label w-100 p-2 border rounded text-center cursor-pointer" for="kat_anak" :class="formData.kategori === 'ANAK' ? 'bg-success text-white border-success' : ''">
                      <i class="fas fa-child mb-1 d-block"></i> ANAK
                    </label>
                  </div>
                </div>
              </div>

               <!-- Right Column: Antropometri & Form (10 cols) -->
              <div class="col-md-10">
                 <!-- Antropometri Section -->
                <h6 class="fw-bold text-success border-bottom pb-2 mb-3">Data Antropometri</h6>
                <div class="row g-3 mb-4">
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Berat Badan (Kg) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="fas fa-weight"></i></span>
                      <input type="number" step="0.01" class="form-control" v-model="formData.bb" @input="calculateIMT" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Tinggi Badan (cm) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="fas fa-ruler-vertical"></i></span>
                      <input type="number" step="0.01" class="form-control" v-model="formData.tb" @input="calculateIMT" required>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">IMT</label>
                    <div class="input-group">
                       <span class="input-group-text bg-light"><i class="fas fa-calculator"></i></span>
                       <input type="text" class="form-control bg-light" v-model="formData.imt" readonly>
                    </div>
                  </div>
                  <div class="col-md-3" v-if="formData.kategori === 'OBGYN'">
                    <label class="form-label small text-muted">LILA (cm) <span class="text-danger">*</span></label>
                    <div class="input-group">
                       <span class="input-group-text bg-light"><i class="fas fa-ring"></i></span>
                       <input type="number" step="0.1" class="form-control" v-model="formData.lila" required>
                    </div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">Diagnosa Medis <span class="text-danger">*</span></label>
                  <textarea class="form-control" v-model="formData.diagnosa_medis" rows="2" placeholder="Masukkan diagnosa medis pasien..." required></textarea>
                </div>
                
                <!-- OBGYN Form -->
                <div v-if="formData.kategori === 'OBGYN'" class="animate__animated animate__fadeIn">
                   <div class="card bg-light border-0 mb-3">
                      <div class="card-body">
                         <!-- Q1 -->
                         <div class="mb-3">
                            <label class="d-block mb-2">1. Apakah asupan makan berkurang karena kurang nafsu makan?</label>
                            <div class="btn-group" role="group">
                               <input type="radio" class="btn-check" name="obgyn_q1" id="obgyn_q1_ya" value="YA" v-model="formData.obgyn_q1" required>
                               <label class="btn btn-outline-success btn-sm" for="obgyn_q1_ya">Ya</label>
                               <input type="radio" class="btn-check" name="obgyn_q1" id="obgyn_q1_tidak" value="TIDAK" v-model="formData.obgyn_q1">
                               <label class="btn btn-outline-secondary btn-sm" for="obgyn_q1_tidak">Tidak</label>
                            </div>
                         </div>
                         
                         <!-- Q2 -->
                         <div class="mb-3">
                            <label class="d-block mb-2">2. Apakah terdapat gangguan metabolisme?</label>
                            <div class="row g-2">
                               <div class="col-md-4" v-for="opt in obgynQ2Options" :key="opt">
                                  <div class="form-check">
                                     <input class="form-check-input" type="checkbox" :value="opt" v-model="formData.obgyn_q2" :id="'obgyn_q2_'+opt.replace(/\s+/g, '')">
                                     <label class="form-check-label small" :for="'obgyn_q2_'+opt.replace(/\s+/g, '')">{{ opt }}</label>
                                  </div>
                               </div>
                               <div class="col-md-12" v-if="formData.obgyn_q2.includes('Lainnya')">
                                 <input type="text" class="form-control form-control-sm mt-1" v-model="formData.obgyn_q2_lainnya" placeholder="Sebutkan lainnya...">
                               </div>
                            </div>
                         </div>

                         <!-- Q3 & Q4 -->
                         <div class="row">
                            <div class="col-md-6">
                               <label class="d-block mb-2 small">3. Ada kenaikan BB kurang/lebih saat hamil?</label>
                               <div class="btn-group" role="group">
                                  <input type="radio" class="btn-check" name="obgyn_q3" id="obgyn_q3_ya" value="YA" v-model="formData.obgyn_q3" required>
                                  <label class="btn btn-outline-success btn-sm" for="obgyn_q3_ya">Ya</label>
                                  <input type="radio" class="btn-check" name="obgyn_q3" id="obgyn_q3_tidak" value="TIDAK" v-model="formData.obgyn_q3">
                                  <label class="btn btn-outline-secondary btn-sm" for="obgyn_q3_tidak">Tidak</label>
                               </div>
                            </div>
                            <div class="col-md-6">
                               <label class="d-block mb-2 small">4. Nilai Hb &lt; 11 g/dL atau HCT &lt; 30%?</label>
                               <div class="btn-group" role="group">
                                  <input type="radio" class="btn-check" name="obgyn_q4" id="obgyn_q4_ya" value="YA" v-model="formData.obgyn_q4" required>
                                  <label class="btn btn-outline-success btn-sm" for="obgyn_q4_ya">Ya</label>
                                  <input type="radio" class="btn-check" name="obgyn_q4" id="obgyn_q4_tidak" value="TIDAK" v-model="formData.obgyn_q4">
                                  <label class="btn btn-outline-secondary btn-sm" for="obgyn_q4_tidak">Tidak</label>
                               </div>
                            </div>
                         </div>

                         <!-- OBGYN Diet -->
                          <div class="mt-3 border-top pt-3">
                            <label class="form-label fw-bold text-success">Permintaan Jenis Diet</label>
                            <div class="d-flex flex-wrap gap-2">
                              <template v-for="diet in dietOptionsObgyn" :key="diet">
                                <input type="radio" class="btn-check" name="jenis_diet_obgyn" :id="'diet_obgyn_'+diet.replace(/\s+/g, '')" :value="diet" v-model="formData.jenis_diet" required>
                                <label class="btn btn-outline-success btn-sm rounded-pill" :for="'diet_obgyn_'+diet.replace(/\s+/g, '')">{{ diet }}</label>
                              </template>
                            </div>
                          </div>
                      </div>
                   </div>
                </div>

                <!-- ANAK Form -->
                <div v-if="formData.kategori === 'ANAK'" class="animate__animated animate__fadeIn">
                   <div class="card bg-light border-0 mb-3">
                      <div class="card-body">
                         <div class="row mb-3">
                            <div class="col-md-6">
                               <label class="d-block mb-2 small">1. Apakah pasien tampak kurus?</label>
                               <div class="btn-group" role="group">
                                  <input type="radio" class="btn-check" name="anak_q1" id="anak_q1_ya" value="YA" v-model="formData.anak_q1" required>
                                  <label class="btn btn-outline-success btn-sm" for="anak_q1_ya">Ya</label>
                                  <input type="radio" class="btn-check" name="anak_q1" id="anak_q1_tidak" value="TIDAK" v-model="formData.anak_q1">
                                  <label class="btn btn-outline-secondary btn-sm" for="anak_q1_tidak">Tidak</label>
                               </div>
                            </div>
                            <div class="col-md-6">
                               <label class="d-block mb-2 small">2. Penurunan BB / Tidak ada peningkatan BB?</label>
                               <div class="btn-group" role="group">
                                  <input type="radio" class="btn-check" name="anak_q2" id="anak_q2_ya" value="YA" v-model="formData.anak_q2" required>
                                  <label class="btn btn-outline-success btn-sm" for="anak_q2_ya">Ya</label>
                                  <input type="radio" class="btn-check" name="anak_q2" id="anak_q2_tidak" value="TIDAK" v-model="formData.anak_q2">
                                  <label class="btn btn-outline-secondary btn-sm" for="anak_q2_tidak">Tidak</label>
                               </div>
                            </div>
                         </div>

                         <!-- Q3 -->
                         <div class="mb-3">
                            <label class="d-block mb-2">3. Kondisi (Diare / Muntah / Asupan Kurang)?</label>
                             <div class="row g-2">
                               <div class="col-md-6" v-for="opt in anakQ3Options" :key="opt">
                                  <div class="form-check">
                                     <input class="form-check-input" type="checkbox" :value="opt" v-model="formData.anak_q3" :id="'anak_q3_'+opt.replace(/\W/g, '')">
                                     <label class="form-check-label small" :for="'anak_q3_'+opt.replace(/\W/g, '')">{{ opt }}</label>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <!-- Q4 -->
                         <div class="mb-3">
                            <label class="d-block mb-2">4. Penyakit beresiko malnutrisi?</label>
                             <div class="row g-2">
                               <div class="col-md-6" v-for="opt in anakQ4Options" :key="opt">
                                  <div class="form-check">
                                     <input class="form-check-input" type="checkbox" :value="opt" v-model="formData.anak_q4" :id="'anak_q4_'+opt.replace(/\W/g, '')">
                                     <label class="form-check-label small" :for="'anak_q4_'+opt.replace(/\W/g, '')">{{ opt }}</label>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <!-- ANAK Diet -->
                          <div class="mt-3 border-top pt-3">
                            <label class="form-label fw-bold text-success">Permintaan Jenis Diet</label>
                            <div class="d-flex flex-wrap gap-2">
                              <template v-for="diet in dietOptionsAnak" :key="diet">
                                <input type="radio" class="btn-check" name="jenis_diet_anak" :id="'diet_anak_'+diet.replace(/\s+/g, '')" :value="diet" v-model="formData.jenis_diet" required>
                                <label class="btn btn-outline-success btn-sm rounded-pill" :for="'diet_anak_'+diet.replace(/\s+/g, '')">{{ diet }}</label>
                              </template>
                            </div>
                          </div>
                      </div>
                   </div>
                </div>

                <!-- Hasil Pemeriksaan Penunjang -->
                <h6 class="fw-bold text-success border-bottom pb-2 mb-3">Hasil Pemeriksaan Penunjang</h6>
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label small">HB</label>
                    <div class="input-group input-group-sm">
                      <input type="number" step="0.1" class="form-control" v-model="formData.hb" required>
                      <span class="input-group-text">g/dL</span>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small">HIV</label>
                    <select class="form-select form-select-sm" v-model="formData.hiv">
                      <option value="Tidak Periksa">Tidak Periksa</option>
                      <option value="Reaktif">Reaktif</option>
                      <option value="Non Reaktif">Non Reaktif</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small">HBsAg</label>
                     <select class="form-select form-select-sm" v-model="formData.hbsag">
                      <option value="Tidak Periksa">Tidak Periksa</option>
                      <option value="Reaktif">Reaktif</option>
                      <option value="Non Reaktif">Non Reaktif</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small">Syphilis</label>
                     <select class="form-select form-select-sm" v-model="formData.syphilis">
                      <option value="Tidak Periksa">Tidak Periksa</option>
                      <option value="Reaktif">Reaktif</option>
                      <option value="Non Reaktif">Non Reaktif</option>
                    </select>
                  </div>
                </div>

                <!-- Skor & Summary -->
                <div class="card border-success mt-4">
                  <div class="card-body bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1 text-success fw-bold">Skor Skrining</h6>
                      <h2 class="mb-0 fw-bold">{{ formData.skor || 0 }}</h2>
                    </div>
                    <div class="text-end">
                      <div class="mb-2">
                        <label class="form-label small fw-bold mb-1">Status Assesment Lanjut</label>
                        <select class="form-select form-select-sm border-success" v-model="formData.status_assesment_lanjut">
                          <option value="Belum">Belum</option>
                          <option value="Sudah">Sudah</option>
                          <option value="Tidak">Tidak</option>
                        </select>
                      </div>
                      <div class="mb-0">
                         <label class="form-label small fw-bold mb-1">Keterangan</label>
                         <input type="text" class="form-control form-control-sm" v-model="formData.keterangan" placeholder="Keterangan tambahan...">
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="modal-footer border-top-0 px-0 pb-0 mt-4">
               <button type="button" class="btn btn-light" @click="close">Batal</button>
               <button type="submit" class="btn btn-success px-4" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  Simpan
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialData: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const formData = reactive({
  no_rawat: '',
  nm_pasien: '',
  bb: null,
  tb: null,
  imt: null,
  lila: null,
  skor: null,
  keterangan: '',
  kategori: null,
  jenis_diet: null,
  diagnosa_medis: '',
  hb: null,
  hiv: 'Tidak Periksa',
  hbsag: 'Tidak Periksa',
  syphilis: 'Tidak Periksa',
  status_assesment_lanjut: 'Belum',
  
  // OBGYN Specific
  obgyn_q1: null,
  obgyn_q2: [],
  obgyn_q2_lainnya: '',
  obgyn_q3: null,
  obgyn_q4: null,

  // ANAK Specific
  anak_q1: null,
  anak_q2: null,
  anak_q3: [],
  anak_q4: []
})

// Options
const obgynQ2Options = ['DM', 'Gangguan fungsi kronis', 'Infeksi kronis', 'TB', 'HIV/AIDS', 'Lainnya', 'Tidak ada']
const dietOptionsObgyn = ['Diet Nasi', 'Diet Bubur', 'Diet Nasi Tim', 'Diet Cair']

const anakQ3Options = ['Diare > 5x/hari', 'Muntah >3x/hari', 'Asupan makanan berkurang', 'Tidak ada']
const anakQ4Options = ['Diare kronik', 'TB Paru', 'Retardasi mental', 'Kelainan anatomi mulut', 'Gangguan psikiatrik', 'Luka Bakar Luas', 'Trauma / Cidera berat', 'Penyakit metabolisme (DM)', 'Penyakit jantung kronis', 'Penyakit liver kronis', 'Penyakit ginjal kronis', 'Tidak ada']
const dietOptionsAnak = ['Diet Nasi', 'Diet Bubur', 'Diet Bubur Tim', 'Diet Bubur Tim Saring']


// Watchers
// Watchers
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    // Helper to safe parse JSON/Array/CSV
    const tryParse = (val) => {
       if (Array.isArray(val)) return val
       if (typeof val === 'string') {
           const str = val.trim()
           if (str.startsWith('[') || str.startsWith('{')) {
               try { return JSON.parse(str) } catch(e) { /* ignore */ }
           }
           // Fallback for CSV
           return str.split(',')
       }
       return []
    }
    
    // Helper to parse comma separated strings
    const strToArray = (str) => str ? str.split(',') : []

    // Parse Questions (stored as JSON string in DB)
    const raw_q_obgyn = tryParse(newVal.q_obgyn)
    const raw_q_anak = tryParse(newVal.q_anak)

    const getVal = (source, index) => {
        const val = source ? source[index] : null
        return val ? String(val).toUpperCase() : null
    }

    // Parse OBGYN Checkboxes & Extract "Lainnya" text
    const loadedObgynQ2 = strToArray(newVal.cb_obgyn)
    const normalizedObgynQ2 = []
    let obgynLainnyaText = ''
    
    loadedObgynQ2.forEach(item => {
        if (obgynQ2Options.includes(item)) {
            normalizedObgynQ2.push(item)
        } else {
            // Assume custom text
            obgynLainnyaText = item
            if (!normalizedObgynQ2.includes('Lainnya')) normalizedObgynQ2.push('Lainnya')
        }
    })

    Object.assign(formData, {
      ...newVal,
      kategori: newVal.kategori || null,
      
      // OBGYN Specific
      obgyn_q1: getVal(raw_q_obgyn, 0),
      obgyn_q2: normalizedObgynQ2,
      obgyn_q2_lainnya: obgynLainnyaText,
      obgyn_q3: getVal(raw_q_obgyn, 1),
      obgyn_q4: getVal(raw_q_obgyn, 2),

      // ANAK Specific
      anak_q1: getVal(raw_q_anak, 0),
      anak_q2: getVal(raw_q_anak, 1),
      anak_q3: strToArray(newVal.cb_anak1),
      anak_q4: strToArray(newVal.cb_anak2)
    })
  }
}, { immediate: true })

watch(() => [formData.bb, formData.tb], ([newBB, newTB]) => {
  if (newBB > 0 && newTB > 0) {
    const tbMeter = newTB / 100
    formData.imt = (newBB / (tbMeter * tbMeter)).toFixed(2)
  }
})

// Calculate Score
const calculateScore = () => {
  let score = 0;

  if (formData.kategori === 'OBGYN') {
    if (formData.obgyn_q1 === 'YA') score += 1;
    if (formData.obgyn_q2.length > 0 && !formData.obgyn_q2.includes('Tidak ada')) score += 1;
    if (formData.obgyn_q3 === 'YA') score += 1;
    if (formData.obgyn_q4 === 'YA') score += 1;
  } else if (formData.kategori === 'ANAK') {
    if (formData.anak_q1 === 'YA') score += 1;
    if (formData.anak_q2 === 'YA') score += 1;
    if (formData.anak_q3.length > 0 && !formData.anak_q3.includes('Tidak ada')) score += 1;
    if (formData.anak_q4.length > 0 && !formData.anak_q4.includes('Tidak ada')) score += 2;
  }
  formData.skor = score;
}

watch([
  () => formData.kategori,
  () => formData.obgyn_q1, () => formData.obgyn_q2, () => formData.obgyn_q3, () => formData.obgyn_q4,
  () => formData.anak_q1, () => formData.anak_q2, () => formData.anak_q3, () => formData.anak_q4
], () => calculateScore())

const close = () => emit('close')

const save = () => {
  // Validate checkboxes
  if (formData.kategori === 'OBGYN' && (!formData.obgyn_q2 || formData.obgyn_q2.length === 0)) {
    alert('Pertanyaan Gangguan Metabolisme harus diisi (Minimal pilih "Tidak ada")')
    return
  }
  if (formData.kategori === 'ANAK') {
      if (!formData.anak_q3 || formData.anak_q3.length === 0) {
         alert('Pertanyaan Kondisi harus diisi (Minimal pilih "Tidak ada")'); return
      }
      if (!formData.anak_q4 || formData.anak_q4.length === 0) {
         alert('Pertanyaan Resiko Malnutrisi harus diisi (Minimal pilih "Tidak ada")'); return
      }
  }

  emit('save', formData)
}
</script>

<style scoped>
.custom-radio-card input:checked + label {
  border-color: #198754 !important;
  background-color: #198754 !important;
  color: white !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
