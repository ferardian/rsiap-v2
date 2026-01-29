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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { pegawaiService } from '../services/pegawaiService'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const profileData = computed(() => {
  return authStore.user?.data?.detail || authStore.user?.detail || {}
})

const emailToUpdate = ref('')
const telpToUpdate = ref('')
const alamatToUpdate = ref('')

const emailError = ref('')
const telpError = ref('')
const alamatError = ref('')

const submitting = ref(false)
const loading = ref(true)
const isEditing = ref(false)

const isDataChanged = computed(() => {
  const currentEmail = profileData.value.email_resmi || ''
  const currentTelp = profileData.value.no_telp || ''
  const currentAlamat = profileData.value.alamat || ''
  
  return emailToUpdate.value !== currentEmail || 
         telpToUpdate.value !== currentTelp || 
         alamatToUpdate.value !== currentAlamat
})

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
  
  // Clear errors
  emailError.value = ''
  telpError.value = ''
  alamatError.value = ''
  
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
      alamat: alamatToUpdate.value
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
    await authStore.refreshUserData()
    // Set initial values from profile data after refresh
    emailToUpdate.value = profileData.value.email_resmi || ''
    telpToUpdate.value = profileData.value.no_telp || ''
    alamatToUpdate.value = profileData.value.alamat || ''
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

.profile-container {
  max-width: 900px;
  margin: 0 auto;
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
</style>
