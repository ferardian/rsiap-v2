<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content modern-modal" @click.stop>
      <div class="modal-header modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i :class="isEdit ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru' }}</h3>
            <p class="header-subtitle">{{ isEdit ? 'Perbarui informasi detail karyawan' : 'Lengkapi data detail karyawan baru' }}</p>
          </div>
        </div>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body modern-body">
        <form @submit.prevent="handleSubmit">
          <!-- SECTION 1: Personal Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-user-circle"></i>
              <span>Informasi Pribadi</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>NIP / NIK Karyawan <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.nik" 
                  :disabled="isEdit"
                  placeholder="Contoh: 1.102.0715"
                  required
                />
              </div>
              <div class="form-group">
                <label>Nama Lengkap <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.nama" 
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div class="form-group">
                <label>Jenis Kelamin <span class="required">*</span></label>
                <select v-model="form.jk" required>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nomor KTP <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.no_ktp" 
                  placeholder="16 digit NIK KTP"
                  required
                />
              </div>
              <div class="form-group">
                <label>Tempat Lahir <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.tmp_lahir" 
                  placeholder="Kota kelahiran"
                  required
                />
              </div>
              <div class="form-group">
                <label>Tanggal Lahir <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="form.tgl_lahir" 
                  required
                />
              </div>
              <div class="form-group">
                <label>Nomor Telepon <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.no_telp" 
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
               <div class="form-group">
                <label>NPWP</label>
                <input 
                  type="text" 
                  v-model="form.npwp" 
                  placeholder="Masukkan NPWP"
                />
              </div>
              <div class="form-group full-width">
                <label>Alamat Domisili <span class="required">*</span></label>
                <textarea 
                  v-model="form.alamat" 
                  placeholder="Alamat lengkap tempat tinggal"
                  required
                  rows="2"
                ></textarea>
              </div>
              <div class="form-group">
                <label>Kota <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.kota" 
                  placeholder="Kota domisili"
                  required
                />
              </div>
               <div class="form-group">
                <label>Pendidikan <span class="required">*</span></label>
                <select v-model="form.pendidikan" required>
                  <option value="">Pilih Pendidikan</option>
                  <option v-for="item in master.pendidikan" :key="item.tingkat" :value="item.tingkat">
                    {{ item.tingkat }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Employment Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-briefcase"></i>
              <span>Informasi Kepegawaian</span>
            </div>
            <div class="form-grid">
               <div class="form-group">
                <label>Departemen / Unit Kerja <span class="required">*</span></label>
                <select v-model="form.departemen" required>
                  <option value="">Pilih Departemen</option>
                  <option v-for="item in master.departemen" :key="item.dep_id" :value="item.dep_id">
                    {{ item.nama }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Bidang <span class="required">*</span></label>
                <select v-model="form.bidang" required>
                  <option value="">Pilih Bidang</option>
                  <option v-for="item in master.bidang" :key="item.nama" :value="item.nama">
                    {{ item.nama }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Jabatan (Display) <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.jbtn" 
                  placeholder="Contoh: Perawat Pelaksana"
                  required
                />
              </div>
              <div class="form-group">
                <label>Pilih Kode Jabatan (Petugas) <span class="required">*</span></label>
                <select v-model="form.kd_jbtn" required>
                  <option value="">Pilih Jabatan</option>
                  <option v-for="item in master.jabatan" :key="item.kd_jbtn" :value="item.kd_jbtn">
                    {{ item.nm_jbtn }} ({{ item.kd_jbtn }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Jenjang Jabatan <span class="required">*</span></label>
                <select v-model="form.jnj_jabatan" required>
                  <option value="">Pilih Jenjang</option>
                  <option v-for="item in master.jnj_jabatan" :key="item.kode" :value="item.kode">
                    {{ item.nama }}
                  </option>
                </select>
              </div>
               <div class="form-group">
                <label>Status Kerja <span class="required">*</span></label>
                <select v-model="form.stts_kerja" required>
                  <option value="">Pilih Status</option>
                  <option v-for="item in master.stts_kerja" :key="item.stts" :value="item.stts">
                    {{ item.ktg }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Tanggal Mulai Kerja <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="form.mulai_kerja" 
                  required
                />
              </div>
              <div class="form-group">
                <label>Masa Kontrak <span class="required">*</span></label>
                <input 
                  type="date" 
                  v-model="form.mulai_kontrak" 
                  required
                />
              </div>
               <div class="form-group">
                <label>Status Aktif <span class="required">*</span></label>
                <select v-model="form.stts_aktif" required>
                  <option value="AKTIF">AKTIF</option>
                  <option value="CUTI">CUTI</option>
                  <option value="KELUAR">KELUAR</option>
                  <option value="TENAGA LUAR">TENAGA LUAR</option>
                </select>
              </div>
               <div class="form-group">
                <label>Ms Kerja <span class="required">*</span></label>
                <select v-model="form.ms_kerja" required>
                  <option value="<1">&lt; 1 Tahun</option>
                  <option value="PT">PT</option>
                  <option value="FT">FT</option>
                  <option value=">1">&gt; 1 Tahun</option>
                </select>
              </div>
            </div>
          </div>

           <!-- SECTION 3: Financial & Other -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-money-check-alt"></i>
              <span>Keuangan & Lainnya</span>
            </div>
            <div class="form-grid">
               <div class="form-group">
                <label>Gaji Pokok <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="form.gapok" 
                  placeholder="0"
                  required
                />
              </div>
              <div class="form-group">
                <label>Bank <span class="required">*</span></label>
                <select v-model="form.bpd" required>
                  <option value="">Pilih Bank</option>
                  <option v-for="item in master.bank" :key="item.namabank" :value="item.namabank">
                    {{ item.namabank }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Nomor Rekening <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.rekening" 
                  placeholder="Masukkan nomor rekening"
                  required
                />
              </div>
              <div class="form-group">
                <label>Status WP <span class="required">*</span></label>
                <select v-model="form.stts_wp" required>
                  <option value="">Pilih Status</option>
                  <option v-for="item in master.stts_wp" :key="item.stts" :value="item.stts">
                    {{ item.ktg }} ({{ item.stts }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Kelompok Jabatan <span class="required">*</span></label>
                <select v-model="form.kode_kelompok" required>
                  <option value="">Pilih Kelompok</option>
                  <option v-for="item in master.kelompok_jabatan" :key="item.kode_kelompok" :value="item.kode_kelompok">
                    {{ item.nama_kelompok }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Resiko Kerja <span class="required">*</span></label>
                <select v-model="form.kode_resiko" required>
                  <option value="">Pilih Resiko</option>
                  <option v-for="item in master.resiko_kerja" :key="item.kode_resiko" :value="item.kode_resiko">
                    {{ item.nama_resiko }}
                  </option>
                </select>
              </div>
               <div class="form-group">
                <label>Emergency Index <span class="required">*</span></label>
                <select v-model="form.kode_emergency" required>
                  <option value="">Pilih Klp Emergency</option>
                  <option v-for="item in master.emergency_index" :key="item.kode_emergency" :value="item.kode_emergency">
                    {{ item.nama_emergency }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Unit/Index Insentif <span class="required">*</span></label>
                <select v-model="form.indexins" required>
                   <option value="">Pilih Unit Insentif</option>
                  <option v-for="item in master.departemen" :key="item.dep_id" :value="item.dep_id">
                    {{ item.nama }}
                  </option>
                </select>
              </div>
               <div class="form-group">
                <label>Status Koordinator <span class="required">*</span></label>
                <select v-model="form.status_koor" required>
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>
               <div class="form-group">
                <label>Wajib Masuk (Hari) <span class="required">*</span></label>
                <input type="number" v-model="form.wajibmasuk" required />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer modern-footer">
        <button class="btn-cancel" @click="$emit('close')">
          <i class="fas fa-times"></i>
          Batal
        </button>
        <button 
          class="btn-save" 
          @click="handleSubmit" 
          :disabled="loading"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { pegawaiService } from '../../../services/pegawaiService'
import { useToast } from 'vue-toastification'

const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  pegawaiData: Object
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()
const loading = ref(false)

const form = ref({
  nik: '',
  nama: '',
  jk: 'Pria',
  jbtn: '',
  kd_jbtn: '',
  jnj_jabatan: '',
  kode_kelompok: '',
  kode_resiko: '',
  kode_emergency: '',
  status_koor: '0',
  departemen: '',
  bidang: '',
  stts_wp: '',
  stts_kerja: '',
  npwp: '',
  pendidikan: '',
  gapok: 0,
  tmp_lahir: '',
  tgl_lahir: '',
  alamat: '',
  kota: '',
  mulai_kerja: '',
  ms_kerja: '<1',
  indexins: '',
  bpd: '',
  rekening: '',
  stts_aktif: 'AKTIF',
  wajibmasuk: 26,
  pengurang: 0,
  indek: 0,
  mulai_kontrak: '',
  cuti_diambil: 0,
  dankes: 0,
  photo: '-',
  no_ktp: '',
  no_telp: '',
  gol_darah: '-',
  agama: 'ISLAM',
  stts_nikah: 'BELUM MENIKAH'
})

const master = ref({
  departemen: [],
  jabatan: [],
  jnj_jabatan: [],
  pendidikan: [],
  bidang: [],
  stts_kerja: [],
  stts_wp: [],
  kelompok_jabatan: [],
  resiko_kerja: [],
  emergency_index: [],
  bank: []
})

const resetForm = () => {
  form.value = {
    nik: '',
    nama: '',
    jk: 'Pria',
    jbtn: '',
    kd_jbtn: '',
    jnj_jabatan: '',
    kode_kelompok: '',
    kode_resiko: '',
    kode_emergency: '',
    status_koor: '0',
    departemen: '',
    bidang: '',
    stts_wp: '',
    stts_kerja: '',
    npwp: '-',
    pendidikan: '',
    gapok: 0,
    tmp_lahir: '',
    tgl_lahir: '',
    alamat: '',
    kota: '',
    mulai_kerja: '',
    ms_kerja: '<1',
    indexins: '',
    bpd: '',
    rekening: '',
    stts_aktif: 'AKTIF',
    wajibmasuk: 26,
    pengurang: 0,
    indek: 0,
    mulai_kontrak: '',
    cuti_diambil: 0,
    dankes: 0,
    photo: '-',
    no_ktp: '',
    no_telp: '',
    gol_darah: '-',
    agama: 'ISLAM',
    stts_nikah: 'BELUM MENIKAH'
  }
}

// Initialize form when editing
watch(() => props.pegawaiData, (newVal) => {
  if (newVal && props.isEdit) {
    // Fill form with employee data
    Object.keys(form.value).forEach(key => {
      if (newVal[key] !== undefined) {
        form.value[key] = newVal[key]
      }
    });

    // Handle Petugas specific fields if they were linked
    if (newVal.petugas) {
      form.value.no_telp = newVal.petugas.no_telp || '-'
      form.value.kd_jbtn = newVal.petugas.kd_jbtn || '-'
      form.value.gol_darah = newVal.petugas.gol_darah || '-'
      form.value.agama = newVal.petugas.agama || 'ISLAM'
      form.value.stts_nikah = newVal.petugas.stts_nikah || 'BELUM MENIKAH'
    } else if (newVal.no_telp) {
        // Fallback for no_telp from join
        form.value.no_telp = newVal.no_telp
    }
  } else if (!props.isEdit) {
    resetForm()
  }
}, { immediate: true })

const loadMasterData = async () => {
  try {
    const resources = [
      'departemen', 'jabatan', 'jnj-jabatan', 'pendidikan', 'bidang', 
      'stts-kerja', 'stts-wp', 'kelompok-jabatan', 'resiko-kerja', 
      'emergency-index', 'bank'
    ]
    
    const promises = resources.map(res => pegawaiService.getMaster(res, { limit: 1000 }))
    const results = await Promise.all(promises)
    
    resources.forEach((res, index) => {
      const key = res.replace(/-/g, '_')
      master.value[key] = results[index].data.data
    })
  } catch (error) {
    console.error('Error loading master data:', error)
    toast.error('Gagal memuat data master untuk form')
  }
}

const handleSubmit = async () => {
  // Simple validation
  if (!form.value.nik || !form.value.nama || !form.value.departemen) {
    toast.warning('Mohon lengkapi data wajib (*)')
    return
  }

  loading.value = true
  try {
    let response;
    if (props.isEdit) {
      response = await pegawaiService.updatePegawai(form.value.nik, form.value)
      toast.success('Data karyawan berhasil diperbarui')
    } else {
      response = await pegawaiService.createPegawai(form.value)
      toast.success('Karyawan baru berhasil ditambahkan')
    }
    
    if (response.data.success) {
      emit('saved')
      emit('close')
    }
  } catch (error) {
    console.error('Error saving employee:', error)
    toast.error('Gagal menyimpan data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMasterData()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modern-modal {
  background: white;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modern-header {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modern-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #3b82f6;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modern-header {
    padding: 1rem 1.5rem;
  }
  
  .modern-body {
    padding: 1.25rem;
  }
  
  .modern-footer {
    padding: 1rem;
    gap: 0.75rem;
    display: flex;
    align-items: stretch;
  }
  
  .btn-cancel, .btn-save {
    flex: 1;
    height: 52px;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    font-size: 0.8125rem;
    text-align: center;
    line-height: 1.2;
    box-sizing: border-box;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
  color: #1e293b;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.form-group textarea {
  white-space: normal;
  overflow: auto;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
}

.modern-footer {
  padding: 1.25rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
