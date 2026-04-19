<template>
  <div class="login-page">
    <div class="login-container">
      <div class="card">
        <div class="card-header">
          <div class="logos-wrapper">
            <div class="logo rs-box">
              <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="logo-img">
            </div>
            <div class="logos-divider"></div>
            <div class="logo larsi-box">
              <img src="@/assets/logo-larsi.png" alt="LARSI Logo" class="logo-img">
            </div>
          </div>
          <h1>LUPA PASSWORD</h1>
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

          <!-- Forgot Password Form -->
          <form @submit.prevent="handleSendLink" v-if="!successMessage">
            <div class="form-group">
              <label for="username" class="form-label">Username:</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="Masukkan username anda"
                :disabled="isLoading"
                required
                @input="form.username = form.username.replace(/[^0-9.]/g, '')"
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email:</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Masukkan email anda"
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
              <span>{{ isLoading ? 'Mengirim...' : 'KIRIM LINK' }}</span>
            </button>
          </form>

          <!-- Back link -->
          <div class="info-section">
            <div class="help-links">
              <router-link to="/login" class="help-link">Login</router-link>
              <span class="separator">|</span>
              <router-link to="/change-password" class="help-link">Ubah Password</router-link>
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

const form = reactive({
  username: '',
  email: '',
  captcha_id: '',
  captcha_code: ''
})

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const captchaImg = ref('')

const isFormValid = computed(() => {
  const usernamePattern = /^[0-9.]+$/;
  return form.username.trim() !== '' && 
         usernamePattern.test(form.username.trim()) &&
         form.email.trim() !== '' && 
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

const handleSendLink = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const res = await authService.forgotPassword(form)
    if (res.success) {
      successMessage.value = res.message
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
/* Reusing styles from LoginView.vue or defining common ones */
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
  padding: 1.25rem 1.5rem 0.5rem;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.card-header h1 {
  margin-top: 0;
  margin-bottom: 0.2rem;
  font-size: 1.4rem;
  color: white;
}

.card-header p {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.logos-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.logos-divider {
  width: 1px;
  height: 45px;
  background: white;
  margin: 0;
  display: block;
  flex-shrink: 0;
}

.logo {
  flex: 0 0 120px;
  width: 120px;
  height: 65px;
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.rs-box {
  padding: 2px 4px;
}

.larsi-box {
  padding: 10px 14px;
}

.card-body {
  padding: 1.5rem 2rem 1.5rem;
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
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
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
  margin: 0.5rem 0;
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

.mt-3 { margin-top: 0.75rem; }
.mt-2 { margin-top: 0.5rem; }

.info-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.help-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.help-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.help-link:hover {
  text-decoration: underline;
  color: #1e40af;
}

.separator {
  color: #e2e8f0;
  font-size: 0.75rem;
}

.login-footer {
  text-align: center;
  margin-top: 1rem;
  color: white;
}

.login-footer p {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
  color: white;
}

.version {
  font-size: 0.75rem;
  opacity: 0.7;
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .card-header {
    padding: 1rem 1rem 0.25rem;
  }
  
  .card-header h1 {
    font-size: 1.25rem;
  }
  
  .logos-wrapper {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .logo {
    flex: 0 0 95px;
    width: 95px;
    height: 50px;
    padding: 2px 4px;
    border-radius: 8px;
  }
  
  .logos-divider {
    height: 35px;
  }
  
  .rs-box {
    padding: 1px 2px;
  }
  
  .larsi-box {
    padding: 8px 10px;
  }
  
  .form-group {
    margin-bottom: 0.75rem;
  }
  
  .info-section {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
  }
  
  .login-footer {
    margin-top: 0.5rem;
  }
}
</style>
