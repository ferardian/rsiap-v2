<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-file-signature text-purple"></i>
          Terbitkan SK Kredensial
        </h3>
        <button class="btn-close-icon" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="warning-box mb-4" v-if="!isLinking">
          <div class="warning-icon"><i class="fas fa-info-circle"></i></div>
          <div class="warning-text">
            Menerbitkan SK akan menyelesaikan proses kredensial dan menautkan SK ini ke dokumen undangan komite terkait.
          </div>
        </div>
        <div class="warning-box mb-4" style="background:#eff6ff; border-color:#bfdbfe;" v-else>
          <div class="warning-icon text-blue"><i class="fas fa-link"></i></div>
          <div class="warning-text text-blue">
            Menautkan SK akan menghubungkan dokumen undangan ini dengan SK SPK RKK yang sudah ada sebelumnya.
          </div>
        </div>

        <div class="tabs-container mb-4">
          <div class="d-flex border-bottom">
            <button 
              type="button"
              class="tab-btn" 
              :class="{ 'active': !isLinking }" 
              @click="isLinking = false"
            >
              Terbitkan Baru
            </button>
            <button 
              type="button"
              class="tab-btn" 
              :class="{ 'active': isLinking }" 
              @click="isLinking = true; showSkList = true; handleSearchSk()"
            >
              Tautkan SK Tersedia
            </button>
          </div>
        </div>

        <form @submit.prevent="submitForm" id="skKredensialForm" class="modern-form">
          <!-- Target Pegawai Info (Read Only) -->
          <div class="form-group">
            <label>Penerima SK/RKK</label>
            <div class="selected-pj-badge bg-gray-50 border-gray-200" v-if="targetPegawai">
              <div class="pj-avatar bg-purple-light text-purple">{{ getInitials(targetPegawai.nama) }}</div>
              <div class="pj-details">
                <span class="pj-nama">{{ targetPegawai.nama }}</span>
                <span class="pj-nik">NIK: {{ targetPegawai.nik }} &bull; {{ targetPegawai.jbtn || '-' }}</span>
              </div>
            </div>
            <div v-else class="text-danger small mt-1">Target Pegawai belum diset di dokumen ini.</div>
          </div>

          <!-- Jenjang Kredensial (Dipindahkan ke sini agar berlaku untuk kedua mode) -->
          <div class="form-row mt-4 pt-3 border-top">
            <div class="form-group col-sm-6">
              <label>Filter Pendidikan</label>
              <select v-model="tempJenjangPendidikan" class="form-control" @change="filterMasterKredensial">
                <option value="">Semua Pendidikan</option>
                <option v-for="edu in availableEducations" :key="edu" :value="edu">{{ edu }}</option>
              </select>
            </div>
            <div class="form-group col-sm-6">
              <label>Jenjang Kredensial <span>*</span></label>
              <select v-model="formData.id_kredensial" class="form-control" required>
                <option value="">Pilih Jenjang</option>
                <option v-for="mk in filteredMasterKredensial" :key="mk.id" :value="mk.id">
                  {{ mk.label }} ({{ mk.jenjang_pendidikan }})
                </option>
              </select>
              <small class="text-primary mt-1 d-block" v-if="suggestedKredensial" @click="applySuggestion" style="cursor: pointer;">
                <i class="fas fa-magic"></i> Rekomendasi: <strong>{{ suggestedKredensial.label }}</strong>
              </small>
            </div>
          </div>

          <!-- TAUTKAN SK MODE -->
          <div v-if="isLinking" class="mt-4 pt-3 border-top">
            <div class="form-group">
              <label>Cari SK yang Sudah Ada <span>*</span></label>
              <div class="search-wrapper position-relative" ref="searchWrapper">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="searchSkQuery" 
                  placeholder="Ketik Perihal/Judul SK (min. 3 huruf)..." 
                  @input="handleSearchSk"
                  @focus="showSkList = true; shouldShowList = true"
                  @blur="handleBlur"
                >
                <div v-if="searchingSk" class="search-spinner" style="position:absolute; right:12px; top:10px;">
                  <i class="fas fa-circle-notch fa-spin text-muted"></i>
                </div>
                
                <div v-if="showSkList && searchSkList.length > 0" class="search-results-dropdown" style="position:absolute; z-index:10; width:100%; background:white; border:1px solid #e2e8f0; border-radius:8px; max-height:200px; overflow-y:auto; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                  <div 
                    v-for="sk in searchSkList" 
                    :key="sk.nomor + sk.tgl_terbit" 
                    class="search-result-item p-2"
                    style="cursor:pointer; border-bottom:1px solid #f1f5f9;"
                    @click="selectSk(sk)"
                  >
                    <div class="fw-bold fs-sm">{{ sk.judul || sk.perihal }}</div>
                    <div class="text-muted small">No: {{ formatNomorSk(sk) }} &bull; {{ sk.tgl_terbit }}</div>
                  </div>
                </div>
                <div v-if="showSkList && searchSkList.length === 0 && searchSkQuery.length >= 3 && !searchingSk" class="search-results-dropdown p-3 text-center text-muted" style="position:absolute; z-index:10; width:100%; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                  SK tidak ditemukan
                </div>
              </div>
            </div>

            <!-- Selected SK Preview -->
            <div class="selected-pj-badge bg-blue-50 border-blue-200 mt-3" style="background:#eff6ff; border-color:#bfdbfe;" v-if="selectedSkToLink">
               <div class="pj-avatar bg-blue-light text-blue" style="background:#dbeafe; color:#2563eb;"><i class="fas fa-file-signature"></i></div>
               <div class="pj-details">
                 <span class="pj-nama">{{ selectedSkToLink.judul || selectedSkToLink.perihal }}</span>
                 <span class="pj-nik">No: {{ formatNomorSk(selectedSkToLink) }}</span>
               </div>
            </div>
          </div>

          <!-- TERBITKAN BARU MODE -->
          <template v-else>

          <!-- SK Basic Details -->
          <div class="form-row mt-3">
            <div class="form-group col-sm-6">
              <label>Jenis SK <span>*</span></label>
              <select v-model="formData.jenis" class="form-control" required>
                <option value="">Pilih Jenis SK</option>
                <option value="A">A (SK Dokumen/Kebijakan/Pedoman/SPO)</option>
                <option value="B">B (SK Pengangkatan Jabatan)</option>
              </select>
            </div>
            <div class="form-group col-sm-6">
              <label>Tanggal Terbit SK <span>*</span></label>
              <input type="date" v-model="formData.tgl_terbit" class="form-control" :max="maxDate" required>
            </div>
          </div>

          <div class="form-group mt-2">
            <label>Perihal / Judul SK <span>*</span></label>
            <input type="text" v-model="formData.judul" class="form-control" placeholder="Contoh: SK RKK Perawat Klinik II" required>
          </div>

          <!-- Upload Berkas -->
          <div class="form-row mt-4 pt-3 border-top">
            <div class="form-group col-sm-6">
              <label>Upload SK (PDF) <span>*</span></label>
              <input 
                type="file" 
                ref="skFileInput"
                class="form-control file-input" 
                accept="application/pdf"
                required
                @change="handleSkFileChange"
              >
            </div>
            <div class="form-group col-sm-6">
              <label>Upload Bukti Kredensial (Opsional)</label>
              <input 
                type="file" 
                ref="buktiFileInput"
                class="form-control file-input" 
                accept="application/pdf,image/jpeg,image/png"
                @change="handleBuktiFileChange"
              >
              <small class="text-muted mt-1 d-block">Lembar asesmen / logbook</small>
            </div>
          </div>
          </template>

        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">Batal</button>
        <button type="submit" form="skKredensialForm" class="btn-submit" :disabled="loading || !targetPegawai">
          <i class="fas fa-save" v-if="!loading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
          {{ loading ? 'Memproses...' : (isLinking ? 'Tautkan SK' : 'Terbitkan SK') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { pegawaiService } from '@/services/pegawaiService'
import { skService } from '@/services/skService'
import { komiteKeperawatanService } from '@/services/komiteKeperawatanService'
import { komiteMedisService } from '@/services/komiteMedisService'
import { komiteKesehatanService } from '@/services/komiteKesehatanService'

const props = defineProps({
  show: Boolean,
  data: Object, // Komite document data
  sumberKomite: String // 'keperawatan', 'medis', 'kesehatan'
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const loading = ref(false)
const targetPegawai = ref(null)

const formData = ref({
  jenis: 'A',
  tgl_terbit: new Date().toISOString().split('T')[0],
  judul: 'SPK RKK ',
  id_kredensial: ''
})

// Linking state
const isLinking = ref(false)
const searchSkQuery = ref('')
const searchingSk = ref(false)
const searchSkList = ref([])
const showSkList = ref(false)
const shouldShowList = ref(false)
const selectedSkToLink = ref(null)
const searchWrapper = ref(null)

const handleBlur = () => {
  // Give it a small delay so click on search-result-item can fire first
  setTimeout(() => {
    showSkList.value = false
    shouldShowList.value = false
  }, 200)
}

let searchTimeout = null
const handleSearchSk = (showDropdown = true) => {
  shouldShowList.value = !!showDropdown
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchSkQuery.value.length < 3) {
      searchSkList.value = []
      return
    }
    searchingSk.value = true
    try {
      const res = await skService.searchSk(searchSkQuery.value, 15)
      searchSkList.value = res.data?.data || []
      if (shouldShowList.value) {
        showSkList.value = true
      }
    } catch (error) {
      console.error('Failed to search SK', error)
    } finally {
      searchingSk.value = false
    }
  }, 500)
}

const selectSk = (sk) => {
  selectedSkToLink.value = sk
  showSkList.value = false
}

const masterKredensialList = ref([])
const filteredMasterKredensial = ref([])
const availableEducations = ref([])
const suggestedKredensial = ref(null)
const tempJenjangPendidikan = ref('')

const skFileInput = ref(null)
const buktiFileInput = ref(null)
const skFile = ref(null)
const buktiFile = ref(null)

const maxDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 30)
  return tomorrow.toISOString().split('T')[0]
})

const profesiCategories = computed(() => {
  if (props.sumberKomite === 'keperawatan') return ['Staf Keperawatan', 'Staf Kebidanan']
  if (props.sumberKomite === 'medis') return ['Staf Medis']
  if (props.sumberKomite === 'kesehatan') return ['Staf Klinis Lainnya']
  return []
})

watch(() => props.show, (showing) => {
  if (showing) {
    loading.value = false
    skFile.value = null
    buktiFile.value = null
    if (skFileInput.value) skFileInput.value.value = ''
    if (buktiFileInput.value) buktiFileInput.value.value = ''

    if (props.data) {
      targetPegawai.value = props.data.target_pegawai || { nik: props.data.nik, nama: props.data.nik }
      formData.value.judul = `SPK RKK ${targetPegawai.value.nama || ''}`
      
      // Check if already linked
      if (props.data.sk) {
        isLinking.value = true
        selectedSkToLink.value = props.data.sk
        searchSkQuery.value = targetPegawai.value.nama || ''
        formData.value.id_kredensial = props.data.id_kredensial || props.data.sk.id_kredensial || ''
        handleSearchSk(false) // Search in background but do not pop open the dropdown yet
      } else {
        // Reset linking state for new linkage
        isLinking.value = false
        searchSkQuery.value = ''
        searchSkList.value = []
        selectedSkToLink.value = null
        formData.value.id_kredensial = props.data.id_kredensial || ''
        
        // Auto search for matching SKs by NIK when opening tab
        if (targetPegawai.value.nik) {
          searchSkQuery.value = targetPegawai.value.nama || ''
          handleSearchSk()
        }
      }
    }

    loadMasterKredensial()
  }
})

const loadMasterKredensial = async () => {
  try {
    const response = await pegawaiService.getMasterKredensial()
    if (response.data.success) {
      masterKredensialList.value = response.data.data
      filterMasterKredensial()
      autoSuggestKredensial()
    }
  } catch (error) {
    console.error('Error loading master kredensial:', error)
  }
}

const filterMasterKredensial = () => {
  let filtered = masterKredensialList.value.filter(mk => profesiCategories.value.includes(mk.kategori_profesi))
  
  const edus = filtered.map(m => m.jenjang_pendidikan)
  availableEducations.value = [...new Set(edus)]

  if (tempJenjangPendidikan.value) {
    filtered = filtered.filter(mk => mk.jenjang_pendidikan === tempJenjangPendidikan.value)
  }

  filteredMasterKredensial.value = filtered
}

const autoSuggestKredensial = () => {
  if (!targetPegawai.value || !targetPegawai.value.jbtn) {
    suggestedKredensial.value = null
    return
  }

  const jbtn = (targetPegawai.value.jbtn || '').toUpperCase()
  const eduField = (targetPegawai.value.pendidikan || '').toUpperCase()
  const name = (targetPegawai.value.nama || '').toUpperCase()
  
  // Calculate Masa Kerja
  let yearsOfService = 0
  if (targetPegawai.value.mulai_kerja) {
    let start = new Date(targetPegawai.value.mulai_kerja)
    const limitDate = new Date('2017-01-01')
    
    // Jika mulai kerja sebelum 2017, maka dihitung dari 2017
    if (start < limitDate) {
      start = limitDate
    }

    const now = new Date()
    yearsOfService = now.getFullYear() - start.getFullYear()
    const monthDiff = now.getMonth() - start.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
      yearsOfService--
    }
  }
  
  let jenjang = ''

  let detectedCategory = ''

  if (props.sumberKomite === 'keperawatan') {
    if (jbtn.includes('BIDAN') || eduField.includes('BIDAN')) {
      detectedCategory = 'Staf Kebidanan'
      jenjang = eduField.includes('D4') || eduField.includes('S1') ? 'D4/S1+Profesi' : 'D3'
    } else {
      detectedCategory = 'Staf Keperawatan'
      jenjang = eduField.includes('NERS') || eduField.includes('S1') || eduField.includes('NS') || name.includes('.NS') ? 'NERS' : 'D3'
    }
  } else if (props.sumberKomite === 'medis') {
    detectedCategory = 'Staf Medis'
    if (eduField.includes('SPESIALIS')) {
      jenjang = 'Dokter Spesialis'
    } else {
      jenjang = 'Dokter Umum'
    }
  } else if (props.sumberKomite === 'kesehatan') {
    detectedCategory = 'Staf Klinis Lainnya'
    if (eduField.includes('APOTEKER') || name.includes('APT.')) jenjang = 'Apoteker'
    else if (eduField.includes('FARMASI') || jbtn.includes('TTK') || name.includes('AMD.FARM')) jenjang = 'TTK'
    else if (eduField.includes('LABORAT') || eduField.includes('ATLM') || eduField.includes('ANALIS') || name.includes('AMD.AK')) jenjang = 'ATLM'
    else if (eduField.includes('GIZI') || name.includes('AMD.GZ') || name.includes('S.GZ')) jenjang = 'Gizi'
    else if (eduField.includes('RADIOLOGI') || name.includes('AMD.RAD')) jenjang = 'Radiologi'
    else if (eduField.includes('REKAM MEDIS') || name.includes('AMD.RM')) jenjang = 'Rekam Medis'
    else if (eduField.includes('ANESTESI') || name.includes('AMD.AN')) jenjang = 'Penata Anestesi'
  }

  if (jenjang) {
    tempJenjangPendidikan.value = jenjang
    filterMasterKredensial()
  }

  const candidates = masterKredensialList.value.filter(mk => 
    (detectedCategory ? mk.kategori_profesi === detectedCategory : profesiCategories.value.includes(mk.kategori_profesi)) && 
    (jenjang ? mk.jenjang_pendidikan === jenjang : true)
  )

  if (candidates.length > 0) {
    // Find best match by years of service
    // Sort descending by min_masa_kerja to favor higher levels on boundaries
    const sortedCandidates = [...candidates].sort((a, b) => (b.min_masa_kerja || 0) - (a.min_masa_kerja || 0))
    
    const bestMatch = sortedCandidates.find(c => 
      yearsOfService >= (c.min_masa_kerja || 0) && 
      yearsOfService <= (c.max_masa_kerja || 99)
    )

    suggestedKredensial.value = bestMatch || candidates[0]
    
    if (!formData.value.id_kredensial) {
      applySuggestion()
    }
  } else {
    suggestedKredensial.value = null
  }
}

const applySuggestion = () => {
  if (suggestedKredensial.value) {
    formData.value.id_kredensial = suggestedKredensial.value.id
  }
}

const handleSkFileChange = (e) => {
  const file = e.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file SK maksimal 5MB')
    skFileInput.value.value = ''
    skFile.value = null
    return
  }
  skFile.value = file
}

const handleBuktiFileChange = (e) => {
  const file = e.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file Bukti maksimal 5MB')
    buktiFileInput.value.value = ''
    buktiFile.value = null
    return
  }
  buktiFile.value = file
}

const formatNomorSk = (sk) => {
  if (!sk) return '-'
  try {
    const tglPattern = sk.tgl_terbit ? format(new Date(sk.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(sk.nomor).padStart(3, '0')
    return `${no}/${sk.jenis || 'B'}/${sk.prefix || 'SK-RSIA'}/${tglPattern}`
  } catch (e) {
    return `${sk.nomor}/${sk.jenis || 'B'}/${sk.prefix || 'SK-RSIA'}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  const cleaned = name.replace(/^(dr\.|drg\.|dr\.\s|drg\.\s)/i, '')
  return cleaned.includes(' ') 
    ? cleaned.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : cleaned.substring(0, 2).toUpperCase()
}

const submitForm = async () => {
  if (isLinking.value) {
    if (!selectedSkToLink.value) {
      toast.warning('Pilih SK terlebih dahulu')
      return
    }
    
    loading.value = true
    try {
      const identifier = btoa(`${props.data.nomor}.${props.data.tgl_terbit.split(' ')[0]}`)
      
      let service = komiteKeperawatanService
      if (props.sumberKomite === 'medis') service = komiteMedisService
      else if (props.sumberKomite === 'kesehatan') service = komiteKesehatanService

        await service.update(identifier, {
          nomor: props.data.nomor,
          tgl_terbit: props.data.tgl_terbit.split(' ')[0],
          pj: props.data.pj || props.data.penanggung_jawab?.nik,
          perihal: props.data.perihal,
          status: String(props.data.status || '1'),
          id_sk: selectedSkToLink.value.nomor,
          id_kredensial: formData.value.id_kredensial
        })

      toast.success('Berhasil menautkan SK')
      emit('saved')
      emit('close')
    } catch (error) {
      console.error('Error linking SK:', error)
      toast.error('Gagal menautkan SK')
    } finally {
      loading.value = false
    }
    return
  }

  if (!skFile.value) {
    toast.warning('File SK wajib diupload')
    return
  }
  if (!formData.value.id_kredensial) {
    toast.warning('Jenjang Kredensial wajib dipilih')
    return
  }

  loading.value = true
  try {
    const payload = new FormData()
    payload.append('jenis', formData.value.jenis)
    payload.append('tgl_terbit', formData.value.tgl_terbit)
    payload.append('judul', formData.value.judul)
    payload.append('id_kredensial', formData.value.id_kredensial)
    
    // Tautkan kembali ke komite pemanggil
    payload.append('sumber_komite', props.sumberKomite)
    payload.append('nomor_komite', props.data.nomor)
    
    // Ambil penanggung jawab dari data komite
    payload.append('pj', props.data.pj || props.data.penanggung_jawab?.nik)
    
    // Ambil NIK dari target
    payload.append('nik', targetPegawai.value.nik)
    
    // Files
    payload.append('file', skFile.value)
    if (buktiFile.value) {
      payload.append('bukti_kredensial_file', buktiFile.value)
    }

    // Since we are creating via formData, we need a special config if the service doesn't handle it.
    // wait, skService.createSk() currently doesn't accept FormData config natively in the signature
    // Oh, createSk uses api.post('/berkas/sk', data). Axios handles FormData automatically and sets multipart/form-data.
    await skService.createSk(payload)
    
    toast.success('SK Kredensial berhasil diterbitkan')
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error creating SK:', error)
    toast.error(error?.response?.data?.message || 'Gagal menerbitkan SK')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #1e293b;
}

.tab-btn.active {
  color: #a855f7;
  border-bottom-color: #a855f7;
}

.search-result-item:hover {
  background-color: #f8fafc;
}

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
  max-width: 650px;
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
  background: #f8fafc;
  border-radius: 16px 16px 0 0;
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
  flex: 1;
}

.warning-box {
  background: #fdf4ff;
  border: 1px solid #f5d0fe;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.warning-icon {
  color: #c026d3;
  font-size: 1.25rem;
}

.warning-text {
  color: #86198f;
  font-size: 0.875rem;
  line-height: 1.4;
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

.form-control {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-control:focus {
  background: white;
  border-color: #a855f7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.file-input {
  padding: 0.45rem;
}

.file-input::file-selector-button {
  background: #e2e8f0;
  border: none;
  padding: 0.45rem 1rem;
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

.selected-pj-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid;
}

.pj-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.bg-purple-light { background: #f3e8ff; }
.text-purple { color: #9333ea; }

.pj-details {
  display: flex;
  flex-direction: column;
}

.pj-nama {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.pj-nik {
  font-size: 0.8rem;
  color: #64748b;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { background: #f1f5f9; }

.btn-submit {
  padding: 0.625rem 1.5rem;
  background: #a855f7;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) { background: #9333ea; }
.btn-submit:disabled {
  background: #e9d5ff;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .modal-overlay { padding: 0; }
  .modal-content {
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  .form-row { flex-direction: column; gap: 1rem; }
}
</style>
