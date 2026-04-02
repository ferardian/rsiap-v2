<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="page-header mb-6">
        <div class="header-content">
          <h2 class="page-title">Profil Saya</h2>
          <p class="page-subtitle">Kelola informasi pribadi dan pengaturan akun Anda.</p>
        </div>
      </div>

      <div class="profile-card animate-fade-in-up" :class="{ 'is-loading': loading }">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Memuat data...</span>
          </div>
        </div>
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="header-info">
            <h3>Informasi Pribadi</h3>
            <p>Pastikan data Anda selalu mutakhir untuk keperluan administratif.</p>
          </div>
        </div>

        <div class="card-body">
          <div class="profile-form">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="nip">NIP / NIK Karyawan</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-id-badge input-icon"></i>
                  <input type="text" id="nip" v-model="profileData.nik" disabled class="form-control">
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="nama">Nama Lengkap</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-user input-icon"></i>
                  <input type="text" id="nama" v-model="profileData.nama" disabled class="form-control">
                </div>
              </div>
            </div>

            <div class="form-row mt-4">
              <div class="form-group col-md-6">
                <label for="jk">Jenis Kelamin</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-venus-mars input-icon"></i>
                  <input type="text" id="jk" :value="formatGender(profileData.jk)" disabled class="form-control">
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="ktp">Nomor KTP</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-id-card input-icon"></i>
                  <input type="text" id="ktp" v-model="profileData.no_ktp" disabled class="form-control">
                </div>
              </div>
            </div>

            <div class="form-row mt-4">
              <div class="form-group col-md-6">
                <label for="tmp_lahir">Tempat Lahir</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-map-marker-alt input-icon"></i>
                  <input type="text" id="tmp_lahir" v-model="profileData.tmp_lahir" disabled class="form-control">
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="tgl_lahir">Tanggal Lahir</label>
                <div class="input-wrapper disabled">
                  <i class="fas fa-calendar-day input-icon"></i>
                  <input type="text" id="tgl_lahir" :value="formatDate(profileData.tgl_lahir)" disabled class="form-control">
                </div>
              </div>
            </div>

            <div class="divider my-6"></div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="telp" class="required">Nomor Telepon</label>
                <div class="input-wrapper" :class="{ 'has-error': telpError }">
                  <i class="fas fa-phone input-icon"></i>
                  <input 
                    type="text" 
                    id="telp" 
                    v-model="telpToUpdate" 
                    class="form-control" 
                    placeholder="Contoh: 08123456789"
                    @input="validateTelp"
                    :disabled="!isEditing"
                  >
                </div>
                <small v-if="telpError" class="error-text">{{ telpError }}</small>
                <small v-else class="text-muted">Gunakan nomor aktif yang bisa dihubungi.</small>
              </div>
              <div class="form-group col-md-6">
                <label for="email" class="required">Email Resmi</label>
                <div class="input-wrapper" :class="{ 'has-error': emailError }">
                  <i class="fas fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="emailToUpdate" 
                    class="form-control" 
                    placeholder="nama@rsiaaisyiyah.com"
                    @input="validateEmail"
                    :disabled="!isEditing"
                  >
                </div>
                <small v-if="emailError" class="error-text">{{ emailError }}</small>
                <small v-else class="text-muted">Gunakan email yang aktif untuk notifikasi sistem.</small>
              </div>
            </div>
            <div class="form-row mt-4">
              <div class="form-group col-md-6">
                <label for="stts_nikah" class="required">Status Menikah</label>
                <div class="input-wrapper" :class="{ 'has-error': sttsNikahError }">
                  <i class="fas fa-ring input-icon"></i>
                  <select 
                    id="stts_nikah" 
                    v-model="sttsNikahToUpdate" 
                    class="form-control" 
                    :disabled="!isEditing"
                  >
                    <option value="SINGLE">Single / Belum Menikah</option>
                    <option value="MENIKAH">Menikah</option>
                    <option value="JANDA">Janda</option>
                    <option value="DUDHA">Dudha</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-row mt-4">
              <div class="form-group col-md-12">
                <label for="alamat" class="required">Alamat Tempat Tinggal</label>
                <div class="input-wrapper" :class="{ 'has-error': alamatError }">
                  <i class="fas fa-home input-icon"></i>
                  <textarea 
                    id="alamat" 
                    v-model="alamatToUpdate" 
                    class="form-control" 
                    rows="3" 
                    placeholder="Masukkan alamat lengkap"
                    @input="validateAlamat"
                    style="padding-top: 0.75rem;"
                    :disabled="!isEditing"
                  ></textarea>
                </div>
                <small v-if="alamatError" class="error-text">{{ alamatError }}</small>
                <small v-else class="text-muted">Alamat domisili saat ini sesuai KTP atau tempat tinggal sekarang.</small>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <template v-if="!isEditing">
            <button 
              class="btn-edit" 
              @click="startEditing"
            >
              <i class="fas fa-edit mr-2"></i>
              Ubah Data
            </button>
          </template>
          <template v-else>
            <div class="button-group">
              <button 
                class="btn-cancel" 
                @click="cancelEditing"
                :disabled="submitting"
              >
                <i class="fas fa-times mr-2"></i>
                Batal
              </button>
              <button 
                class="btn-save" 
                @click="handleUpdateProfile" 
                :disabled="submitting || !isDataChanged"
              >
                <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-save mr-2"></i>
                {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </template>
        </div>
      </div> <!-- End of Main Profile Card -->

      <!-- Separate Section for Family -->
      <div v-if="profileData" class="profile-card family-card animate-fade-in-up mt-8" :class="{ 'is-loading': loading }">
          <div class="card-header">
            <div class="header-icon family">
              <i class="fas fa-users"></i>
            </div>
            <div class="header-info">
              <h3>Anggota Keluarga</h3>
              <p>Daftar anggota keluarga yang terdaftar dalam tanggungan Anda.</p>
            </div>
            <button class="btn-add-family" @click="showAddFamilyModal = true">
              <i class="fas fa-plus"></i>
              Tambah Anggota
            </button>
          </div>

          <div class="card-body p-0">
            <div v-if="familyMembers.length === 0" class="empty-family">
              <div class="empty-icon">
                <i class="fas fa-user-friends"></i>
              </div>
              <p>Belum ada anggota keluarga yang ditambahkan.</p>
            </div>
            <div v-else class="family-list">
              <div v-for="member in familyMembers" :key="member.id" class="family-item">
                <div class="member-icon" :class="member.jk === 'P' ? 'pink' : 'blue'">
                  <i class="fas" :class="member.jk === 'P' ? 'fa-female' : 'fa-male'"></i>
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.nama }}</div>
                  <div class="member-meta">
                    <span class="badge-hubungan">{{ member.hubungan }}</span>
                    <span class="meta-sep">•</span>
                    <span>{{ calculateAge(member.tgl_lahir) }}</span>
                  </div>
                  <div v-if="member.no_bpjs" class="member-bpjs">
                    <i class="fas fa-id-card-alt"></i>
                    {{ member.no_bpjs }}
                  </div>
                </div>
                <div class="member-actions">
                  <button class="btn-delete-member" @click="confirmDeleteMember(member)" title="Hapus">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

    <!-- Modal Tambah Keluarga -->
    <div v-if="showAddFamilyModal" class="modal-overlay" @click.self="closeFamilyModal">
      <div class="modal-container animate-scale-in">
        <div class="modal-header">
          <h3>Tambah Anggota Keluarga</h3>
          <button class="close-btn" @click="closeFamilyModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="bpjs-lookup-wrapper mb-10">
            <div class="bpjs-lookup-box">
              <div class="lookup-header">
                <div class="lookup-badge">
                  <i class="fas fa-shield-alt"></i>
                  <span>BPJS Kesehatan</span>
                </div>
                <p>Punya kartu BPJS? Masukkan NIK atau No. BPJS untuk pengisian otomatis:</p>
              </div>
              
              <div class="lookup-form">
                <div class="query-input-wrapper">
                  <i class="fas fa-search query-icon"></i>
                  <input 
                    type="text" 
                    v-model="vclaimQuery" 
                    placeholder="Masukkan NIK atau No. Kartu"
                    @keypress.enter="lookupVclaim"
                  >
                </div>
                <button 
                  class="btn-lookup-premium" 
                  @click="lookupVclaim" 
                  :disabled="isSearchingVclaim || !vclaimQuery"
                >
                  <i v-if="isSearchingVclaim" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else class="fas fa-bolt mr-2"></i>
                  {{ isSearchingVclaim ? 'Mencari...' : 'Cek BPJS Sekarang' }}
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAddFamily" class="row">
            <div class="form-group col-md-12">
              <label class="required">Nama Lengkap</label>
              <input type="text" v-model="familyForm.nama" class="form-control" required>
            </div>
            
            <div class="form-group col-md-6 mt-3">
              <label class="required">Hubungan</label>
              <select v-model="familyForm.hubungan" class="form-select" required>
                <option value="Suami">Suami</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Ayah">Ayah</option>
                <option value="Ibu">Ibu</option>
                <option value="Saudara">Saudara</option>
              </select>
            </div>

            <div class="form-group col-md-6 mt-3">
              <label class="required">Jenis Kelamin</label>
              <div class="jk-selector mt-1">
                <label class="jk-opt">
                  <input type="radio" v-model="familyForm.jk" value="L" name="jk" required>
                  <span class="jk-box">Laki-laki</span>
                </label>
                <label class="jk-opt">
                  <input type="radio" v-model="familyForm.jk" value="P" name="jk" required>
                  <span class="jk-box">Perempuan</span>
                </label>
              </div>
            </div>

            <div class="form-group col-md-6 mt-3">
              <label>No. KTP (NIK)</label>
              <input type="text" v-model="familyForm.no_ktp" class="form-control">
            </div>

            <div class="form-group col-md-6 mt-3">
              <label>No. BPJS</label>
              <input type="text" v-model="familyForm.no_bpjs" class="form-control">
            </div>

            <div class="form-group col-md-6 mt-3">
              <label>Tanggal Lahir</label>
              <input type="date" v-model="familyForm.tgl_lahir" class="form-control">
            </div>

            <div class="form-group col-md-6 mt-3">
              <label>Pekerjaan</label>
              <input type="text" v-model="familyForm.pekerjaan" class="form-control">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel-modal" @click="closeFamilyModal">Batal</button>
          <button 
            class="btn-save-modal" 
            @click="handleAddFamily" 
            :disabled="isSubmittingFamily || !familyForm.nama"
          >
            <i v-if="isSubmittingFamily" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isSubmittingFamily ? 'Menyimpan...' : 'Simpan Anggota' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { pegawaiService } from '../services/pegawaiService'
import bpjsVclaimService from '../services/bpjsVclaimService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const toast = useToast()

const profileData = computed(() => {
  return authStore.user?.data?.detail || authStore.user?.detail || {}
})

const emailToUpdate = ref('')
const telpToUpdate = ref('')
const alamatToUpdate = ref('')
const sttsNikahToUpdate = ref('')

const emailError = ref('')
const telpError = ref('')
const alamatError = ref('')
const sttsNikahError = ref('')

const submitting = ref(false)
const loading = ref(true)
const isEditing = ref(false)

const isDataChanged = computed(() => {
  const currentEmail = profileData.value.email_resmi || ''
  const currentTelp = profileData.value.no_telp || ''
  const currentAlamat = profileData.value.alamat || ''
  const currentSttsNikah = profileData.value.stts_nikah || 'SINGLE'
  
  return emailToUpdate.value !== currentEmail || 
         telpToUpdate.value !== currentTelp || 
         alamatToUpdate.value !== currentAlamat ||
         sttsNikahToUpdate.value !== currentSttsNikah
})

// Family Member Logic
const familyMembers = computed(() => {
  return profileData.value.keluarga || []
})

const showAddFamilyModal = ref(false)
const isSubmittingFamily = ref(false)
const isSearchingVclaim = ref(false)
const vclaimQuery = ref('')

const familyForm = reactive({
  nama: '',
  hubungan: 'Anak',
  no_ktp: '',
  no_bpjs: '',
  tgl_lahir: '',
  jk: 'L',
  pekerjaan: '',
  keterangan: ''
})

const calculateAge = (tglLahir) => {
  if (!tglLahir) return '-'
  const birth = new Date(tglLahir)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return `${age} Tahun`
}

const lookupVclaim = async () => {
    if (!vclaimQuery.value) return
    
    isSearchingVclaim.value = true
    try {
        const today = new Date().toISOString().split('T')[0]
        let response
        
        if (vclaimQuery.value.length === 16) {
            response = await bpjsVclaimService.getPesertaByNik(vclaimQuery.value, today)
        } else {
            response = await bpjsVclaimService.getPesertaByNoKartu(vclaimQuery.value, today)
        }
        
        if (response.data && response.data.response && response.data.response.peserta) {
            const p = response.data.response.peserta
            familyForm.nama = p.nama
            familyForm.no_ktp = p.nik
            familyForm.no_bpjs = p.noKartu
            familyForm.tgl_lahir = p.tglLahir
            familyForm.jk = p.sex === 'L' ? 'L' : 'P'
            toast.success('Data ditemukan dari BPJS!')
        } else {
            const msg = response.data?.metaData?.message || 'Data tidak ditemukan'
            toast.warning(msg)
        }
    } catch (error) {
        console.error('VClaim lookup error:', error)
        toast.error('Gagal terhubung ke layanan VClaim')
    } finally {
        isSearchingVclaim.value = false
    }
}

const closeFamilyModal = () => {
  showAddFamilyModal.value = false
  // Reset form
  Object.assign(familyForm, {
    nama: '',
    hubungan: 'Anak',
    no_ktp: '',
    no_bpjs: '',
    tgl_lahir: '',
    jk: 'L',
    pekerjaan: '',
    keterangan: ''
  })
  vclaimQuery.value = ''
}

const handleAddFamily = async () => {
  if (!familyForm.nama) return

  isSubmittingFamily.value = true
  try {
    const nikPegawai = profileData.value.nik
    const response = await pegawaiService.addFamilyMember(nikPegawai, familyForm)
    
    if (response.data.success) {
      toast.success('Anggota keluarga berhasil ditambahkan')
      await authStore.refreshUserData()
      closeFamilyModal()
    }
  } catch (error) {
    console.error('Add family error:', error)
    toast.error(error.response?.data?.message || 'Gagal menambahkan anggota keluarga')
  } finally {
    isSubmittingFamily.value = false
  }
}

const confirmDeleteMember = (member) => {
  Swal.fire({
    title: 'Hapus Anggota Keluarga?',
    text: `Apakah Anda yakin ingin menghapus ${member.nama} dari daftar keluarga?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const nikPegawai = profileData.value.nik
        const response = await pegawaiService.deleteFamilyMember(nikPegawai, member.id)
        if (response.data.success) {
          toast.success('Berhasil dihapus')
          await authStore.refreshUserData()
        }
      } catch (error) {
        toast.error('Gagal menghapus data')
      }
    }
  })
}

const formatGender = (jk) => {
  if (!jk) return '-'
  return jk === 'P' ? 'Perempuan' : 'Laki-laki'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateStr).toLocaleDateString('id-ID', options)
  } catch (e) {
    return dateStr
  }
}

const validateEmail = () => {
  if (!emailToUpdate.value) {
    emailError.value = 'Email tidak boleh kosong'
    return false
  }
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!regex.test(emailToUpdate.value)) {
    emailError.value = 'Format email tidak valid'
    return false
  }
  emailError.value = ''
  return true
}

const validateTelp = () => {
  if (!telpToUpdate.value) {
    telpError.value = 'Nomor telepon tidak boleh kosong'
    return false
  }
  if (!/^\d+$/.test(telpToUpdate.value)) {
    telpError.value = 'Nomor telepon harus berupa angka'
    return false
  }
  if (telpToUpdate.value.length < 11 || telpToUpdate.value.length > 13) {
    telpError.value = 'Nomor telepon harus antara 11 - 13 digit'
    return false
  }
  telpError.value = ''
  return true
}

const validateAlamat = () => {
  if (!alamatToUpdate.value) {
    alamatError.value = 'Alamat tidak boleh kosong'
    return false
  }
  alamatError.value = ''
  return true
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  // Revert values
  emailToUpdate.value = profileData.value.email_resmi || ''
  telpToUpdate.value = profileData.value.no_telp || ''
  alamatToUpdate.value = profileData.value.alamat || ''
  sttsNikahToUpdate.value = profileData.value.stts_nikah || 'SINGLE'
  
  // Clear errors
  emailError.value = ''
  telpError.value = ''
  alamatError.value = ''
  sttsNikahError.value = ''
  
  isEditing.value = false
}

const handleUpdateProfile = async () => {
  const isEmailValid = validateEmail()
  const isTelpValid = validateTelp()
  const isAlamatValid = validateAlamat()

  if (!isEmailValid || !isTelpValid || !isAlamatValid) return

  submitting.value = true
  try {
    const data = {
      email: emailToUpdate.value,
      no_telp: telpToUpdate.value,
      alamat: alamatToUpdate.value,
      stts_nikah: sttsNikahToUpdate.value
    }

    const response = await pegawaiService.updateProfile(data)
    
    if (response.data.success) {
      toast.success('Profil berhasil diperbarui')
      // Refresh user data in store to update UI and clear alerts
      await authStore.refreshUserData()
      isEditing.value = false
    } else {
      toast.error(response.data.message || 'Gagal memperbarui profil')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error(error.response?.data?.message || 'Gagal terhubung ke server')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Force refresh to get latest detail data (KTP, etc)
    const res = await authStore.refreshUserData()
    console.log('Profile Data loaded:', profileData.value)
    console.log('Family members count:', profileData.value.keluarga?.length || 0)
    
    // Set initial values from profile data after refresh
    emailToUpdate.value = profileData.value.email_resmi || ''
    telpToUpdate.value = profileData.value.no_telp || ''
    alamatToUpdate.value = profileData.value.alamat || ''
    sttsNikahToUpdate.value = profileData.value.stts_nikah || 'SINGLE'
  } catch (error) {
    console.error('Failed to load profile data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0.75rem;
  }
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.mb-10 {
  margin-bottom: 2.5rem !important;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.profile-card {
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #3b82f6;
}

.loading-spinner i {
  font-size: 2.5rem;
}

.loading-spinner span {
  font-weight: 600;
  font-size: 1rem;
}

.card-header {
  padding: 2rem;
  background: linear-gradient(to right, #ffffff, #f8fafc);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
}

.header-icon {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.header-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.card-body {
  padding: 2.5rem;
}

@media (max-width: 640px) {
  .card-body {
    padding: 1.5rem;
  }
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.form-group {
  padding: 0 15px;
  margin-bottom: 1rem;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

label.required::after {
  content: " *";
  color: #ef4444;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-size: 0.95rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background-color: #fff;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-wrapper.disabled .form-control {
  background-color: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
  border-color: #f1f5f9;
}

.input-wrapper.has-error .form-control {
  border-color: #ef4444;
}

.error-text {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: #f1f5f9;
}

.card-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.btn-edit, .btn-save, .btn-cancel {
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.btn-edit:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-save {
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #94a3b8;
  box-shadow: none;
}

.btn-cancel {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover:not(:disabled) {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.family-card {
  margin-top: 3rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  position: relative;
}

.family-card::before {
  content: '';
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 10px;
}

/* Family Section Styles */
.header-icon.family {
  background: #f0fdf4;
  color: #22c55e;
}

.btn-add-family {
  padding: 0.6rem 1.25rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

@media (max-width: 640px) {
  .btn-add-family {
    margin: 0;
    width: 100%;
    justify-content: center;
  }
}

.btn-add-family:hover {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.empty-family {
  padding: 4rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.family-list {
  display: flex;
  flex-direction: column;
}

.family-item {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

@media (max-width: 640px) {
  .family-item {
    padding: 1.25rem 1rem;
    gap: 1rem;
  }
}

.family-item:last-child {
  border-bottom: none;
}

.family-item:hover {
  background: #f8fafc;
}

.member-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1.25rem;
}

.member-icon.blue { background: #eff6ff; color: #3b82f6; }
.member-icon.pink { background: #fdf2f8; color: #ec4899; }

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.member-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.badge-hubungan {
  background: #f1f5f9;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #475569;
}

.meta-sep {
  opacity: 0.5;
}

.member-bpjs {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #059669;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Larger gap for better readability */
}

.btn-delete-member {
  width: 36px;
  height: 36px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-member:hover {
  background: #ef4444;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-container {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .modal-body {
    padding: 1.25rem;
  }
}

.bpjs-lookup-box {
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #ccfbf1;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.lookup-header {
  margin-bottom: 1.25rem;
}

.lookup-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.lookup-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #065f46;
  font-weight: 500;
  line-height: 1.5;
}

.lookup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.query-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.query-icon {
  position: absolute;
  left: 1.25rem;
  color: #94a3b8;
  font-size: 1rem;
}

.query-input-wrapper input {
  width: 100%;
  padding: 0.875rem 1.25rem 0.875rem 3rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  color: #1e293b;
  transition: all 0.2s;
}

.query-input-wrapper input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-lookup-premium {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-lookup-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(37, 99, 235, 0.3);
  filter: brightness(1.1);
}

.btn-lookup-premium:active:not(:disabled) {
  transform: translateY(0);
}

.btn-lookup-premium:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

.jk-selector {
  display: flex;
  gap: 1rem;
}

.jk-opt {
  flex: 1;
  cursor: pointer;
}

.jk-opt input {
  display: none;
}

.jk-box {
  display: block;
  padding: 0.6rem;
  text-align: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s;
}

.jk-opt input:checked + .jk-box {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel-modal, .btn-save-modal {
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-cancel-modal {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-save-modal {
  background: #3b82f6;
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
