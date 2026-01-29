<template>
  <div class="login-page">
    <div class="login-container">
      <div class="card">
        <div class="card-header">
          <div class="logo">
            <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="logo-img">
          </div>
          <h1>UBAH PASSWORD</h1>
          <p>RSIA Aisyiyah Pekajangan</p>
        </div>

        <div class="card-body">
          <!-- Alert Error -->
          <div v-if="error" class="alert alert-error">
            <span>⚠️</span>
            <span>{{ error }}</span>
          </div>

          <!-- Alert Success -->
          <div v-if="successMessage" class="alert alert-success">
            <span>✅</span>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Change Password Form -->
          <form @submit.prevent="handleChangePassword" v-if="!successMessage">
            <div class="form-group">
              <label for="username" class="form-label">Username:</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="masukkan username"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="old_password" class="form-label">Password Lama:</label>
              <input
                id="old_password"
                v-model="form.old_password"
                type="password"
                class="form-input"
                placeholder="********"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="new_password" class="form-label">Password Baru:</label>
              <input
                id="new_password"
                v-model="form.new_password"
                type="password"
                class="form-input"
                placeholder="masukkan password baru"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="new_password_confirmation" class="form-label">Konfirmasi Password Baru:</label>
              <input
                id="new_password_confirmation"
                v-model="form.new_password_confirmation"
                type="password"
                class="form-input"
                placeholder="konfirmasi password baru"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- Captcha Section -->
            <div class="captcha-container" v-if="captchaImg">
              <div class="captcha-box" @click="refreshCaptcha">
                <img :src="captchaImg" alt="Captcha" class="captcha-img">
              </div>
              <input
                v-model="form.captcha_code"
                type="text"
                class="form-input text-center mt-2"
                placeholder="masukkan captcha"
                :disabled="isLoading"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary mt-3"
              :disabled="isLoading || !isFormValid"
            >
              <div v-if="isLoading" class="spinner"></div>
              <span>{{ isLoading ? 'Memproses...' : 'UBAH PASSWORD' }}</span>
            </button>
          </form>

          <!-- Back link -->
          <div class="info-section">
            <div class="help-links">
              <router-link to="/login" class="help-link">Login</router-link>
              <span class="separator">|</span>
              <router-link to="/forgot-password" class="help-link">Lupa Password</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>&copy; 2024 RSIA - Sistem Informasi Rumah Sakit</p>
        <p class="version">Version 2.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { authService } from '@/services/authService'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  username: '',
  old_password: '',
  new_password: '',
  new_password_confirmation: '',
  captcha_id: '',
  captcha_code: ''
})

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const captchaImg = ref('')

const isFormValid = computed(() => {
  return form.username.trim() !== '' && 
         form.old_password.trim() !== '' && 
         form.new_password.trim() !== '' && 
         form.new_password === form.new_password_confirmation &&
         form.captcha_code.trim() !== ''
})

const refreshCaptcha = async () => {
  try {
    const res = await authService.getCaptcha()
    if (res.success) {
      captchaImg.value = res.data.captcha_img
      form.captcha_id = res.data.captcha_id
      form.captcha_code = ''
    }
  } catch (err) {
    console.error('Failed to load captcha', err)
  }
}

const handleChangePassword = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const res = await authService.changePassword(form)
    if (res.success) {
      successMessage.value = res.message
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      error.value = res.message
      refreshCaptcha()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Terjadi kesalahan pada server'
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
/* Same styles as ForgotPasswordView.vue */
.login-page {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-header {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.card-body {
  padding: 1.5rem 2rem 2rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.alert-error {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.captcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}

.captcha-box {
  background: #b9e0f2;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.captcha-img {
  max-width: 150px;
  height: auto;
}

.text-center {
  text-align: center;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
}

.mt-3 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }

.info-section {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

.help-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.help-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.813rem;
}

.help-link:hover {
  text-decoration: underline;
}

.separator {
  color: #e2e8f0;
  font-size: 0.75rem;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.login-footer p {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: white;
}

.version {
  opacity: 0.6;
}
</style>
