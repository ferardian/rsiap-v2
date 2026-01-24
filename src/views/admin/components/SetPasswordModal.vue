<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content modern-modal" @click.stop>
      <div class="modal-header modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-key"></i>
          </div>
          <div>
            <h3>Set Password</h3>
            <p class="header-subtitle">Set password untuk user: <strong>{{ userId }}</strong></p>
          </div>
        </div>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body modern-body">
        <!-- View Current Password Section -->
        <div class="current-password-section">
          <button 
            type="button"
            @click="loadCurrentPassword" 
            class="view-password-btn"
            :disabled="loadingCurrentPassword"
          >
            <span v-if="!loadingCurrentPassword">👁️ Lihat Password Saat Ini</span>
            <span v-else>⏳ Loading...</span>
          </button>
          
          <div v-if="currentPassword" class="current-password-display">
            <label>Password Saat Ini:</label>
            <div class="password-field">
              <input 
                type="text" 
                :value="currentPassword" 
                readonly 
                class="readonly-input"
              />
            </div>
          </div>
          
          <div v-if="currentPasswordError" class="error-message">
            {{ currentPasswordError }}
          </div>
        </div>

        <div class="divider"></div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Password Baru <span class="required">*</span></label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Masukkan password baru"
                required
                minlength="6"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <small class="help-text">Minimal 6 karakter</small>
          </div>

          <div class="form-group">
            <label>Konfirmasi Password <span class="required">*</span></label>
            <div class="password-input">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                placeholder="Ulangi password baru"
                required
                minlength="6"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="password && confirmPassword && password !== confirmPassword" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            Password tidak cocok
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
          :disabled="loading || !password || !confirmPassword || password !== confirmPassword"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ loading ? 'Menyimpan...' : 'Set Password' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import legacyUserService from '../../../services/legacyUserService'
import { useToast } from 'vue-toastification'

const props = defineProps({
  show: Boolean,
  userId: String
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()

const loading = ref(false)
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Current password viewing
const currentPassword = ref('')
const loadingCurrentPassword = ref(false)
const currentPasswordError = ref('')

// Reset form when modal opens/closes
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const resetForm = () => {
  password.value = ''
  confirmPassword.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  currentPassword.value = ''
  currentPasswordError.value = ''
  loadingCurrentPassword.value = false
}

const loadCurrentPassword = async () => {
  if (!props.userId) return
  
  loadingCurrentPassword.value = true
  currentPasswordError.value = ''
  currentPassword.value = ''
  
  try {
    const response = await legacyUserService.getPassword(props.userId)
    
    if (response.data.success && response.data.data.password) {
      currentPassword.value = response.data.data.password
    } else {
      currentPasswordError.value = 'Password belum di-set untuk user ini'
    }
  } catch (error) {
    console.error('Error loading current password:', error)
    if (error.response?.status === 404) {
      currentPasswordError.value = 'User tidak ditemukan di sistem legacy'
    } else {
      currentPasswordError.value = 'Gagal memuat password: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    loadingCurrentPassword.value = false
  }
}

const handleSubmit = async () => {
  if (!password.value || !confirmPassword.value) {
    toast.warning('Semua field harus diisi')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('Password tidak cocok')
    return
  }

  if (password.value.length < 6) {
    toast.warning('Password minimal 6 karakter')
    return
  }

  loading.value = true
  try {
    const response = await legacyUserService.setPassword(props.userId, password.value)
    
    // Response sukses jika tidak ada error (status 200)
    const message = response.data.message || 'Password berhasil diubah'
    toast.success(message)
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error setting password:', error)
    const errorMsg = error.response?.data?.message || error.message
    toast.error('Gagal mengubah password: ' + errorMsg)
  } finally {
    loading.value = false
  }
}
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
  max-width: 500px;
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
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
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.password-input {
  position: relative;
}

.password-input input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
  color: #1e293b;
}

.password-input input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #3b82f6;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.current-password-section {
  margin-bottom: 20px;
}

.view-password-btn {
  width: 100%;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-password-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.view-password-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.current-password-display {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}

.current-password-display label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
}

.password-field {
  position: relative;
}

.readonly-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #e0f2fe !important;
  color: #1e40af;
  font-weight: 600;
  cursor: default;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 24px 0;
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
