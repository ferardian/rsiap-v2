<template>
  <div class="login-page">
    <!-- Decor -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <div class="bento-container">
      <div class="bento-stack">
        <!-- Row 1: Header -->
        <div class="bento-item header-grid animate-in-1">
          <div class="header-left">
            <div class="main-logo-box">
              <img src="@/assets/logo.png" alt="RSIA Logo" class="main-logo">
            </div>
            <div class="header-text">
              <h1>RSIAP <span class="v2-tag">V2</span></h1>
              <p>Ubah Password</p>
            </div>
          </div>
          <div class="header-right">
            <div class="secondary-logo-box">
              <img src="@/assets/logo-larsi.png" alt="LARSI Logo" class="secondary-logo">
            </div>
          </div>
        </div>

        <!-- Row 2: Form -->
        <div class="bento-item animate-in-2">
          <div class="login-header">
            <div class="welcome-msg">
              <h2>Pembaruan Keamanan</h2>
              <p>Perbarui kata sandi akun anda berkala</p>
            </div>
          </div>

          <!-- Alert -->
          <div v-if="error" class="alert alert-error animate-shake">
            {{ error }}
          </div>
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleChangePassword" v-if="!successMessage" class="login-form">
            <div class="form-group">
              <label for="username">NIK / Username</label>
              <input
                id="username"
                name="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="Masukkan NIK anda"
                autocomplete="username"
                :disabled="isLoading"
                required
                @input="form.username = form.username.replace(/[^0-9.]/g, '')"
              />
            </div>

            <div class="form-group">
              <label for="old_password">Password Lama</label>
              <div class="password-wrapper">
                <input
                  id="old_password"
                  name="old_password"
                  v-model="form.old_password"
                  :type="showOldPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Masukkan password saat ini"
                  autocomplete="current-password"
                  :disabled="isLoading"
                  required
                />
                <button type="button" class="toggle-btn" @click="showOldPassword = !showOldPassword">
                  <svg v-if="!showOldPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new_password">Password Baru</label>
              <div class="password-wrapper">
                <input
                  id="new_password"
                  name="new_password"
                  v-model="form.new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Masukkan password baru"
                  autocomplete="new-password"
                  :disabled="isLoading"
                  required
                />
                <button type="button" class="toggle-btn" @click="showNewPassword = !showNewPassword">
                  <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new_password_confirmation">Konfirmasi Password Baru</label>
              <div class="password-wrapper">
                <input
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  v-model="form.new_password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Konfirmasi password baru"
                  autocomplete="new-password"
                  :disabled="isLoading"
                  required
                />
                <button type="button" class="toggle-btn" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </button>
              </div>
            </div>

            <!-- Captcha -->
            <div class="form-group captcha-group" v-if="captchaImg">
              <label>Verifikasi Keamanan</label>
              <div class="captcha-wrapper">
                <div class="captcha-img-box" @click="refreshCaptcha" title="Klik untuk refresh">
                  <img :src="captchaImg" alt="Captcha">
                </div>
                <input
                  v-model="form.captcha_code"
                  type="text"
                  class="form-input captcha-input"
                  placeholder="Kode"
                  :disabled="isLoading"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || !isFormValid"
            >
              <div v-if="isLoading" class="spinner"></div>
              <span v-else>Update Password</span>
            </button>

            <div class="login-footer-links">
              <router-link to="/login" class="help-link">Kembali Login</router-link>
              <div class="divider"></div>
              <router-link to="/forgot-password" class="help-link">Lupa Password</router-link>
            </div>
          </form>

          <div v-else class="success-action text-center">
            <p class="text-success mb-3">Password berhasil diperbarui! Mengalihkan ke login...</p>
            <div class="spinner color-primary"></div>
          </div>
        </div>

        <!-- Row 3: Footer -->
        <div class="bento-item animate-in-3 footer-flex">
          <div class="copy-text">© 2024 RSIA Aisyiyah Pekajangan</div>
        </div>
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

// Password visibility state
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  const usernamePattern = /^[0-9.]+$/;
  return form.username.trim() !== '' && 
         usernamePattern.test(form.username.trim()) &&
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.login-page {
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  position: relative;
}

.bg-shape {
  position: absolute;
  filter: blur(120px);
  z-index: 0;
  border-radius: 50%;
  opacity: 0.5;
}

.shape-1 { width: 500px; height: 500px; background: #93c5fd; top: -150px; left: -150px; }
.shape-2 { width: 400px; height: 400px; background: #c7d2fe; bottom: -100px; right: -100px; }

.bento-container {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.bento-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bento-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.header-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-logo-box {
  background: white;
  padding: 4px;
  border-radius: 12px;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.main-logo { max-width: 95%; max-height: 95%; object-fit: contain; }

.header-text h1 {
  color: #0f172a;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.header-text p {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
  font-weight: 500;
}

.v2-tag {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  vertical-align: middle;
}

.secondary-logo-box {
  background: white;
  padding: 4px;
  border-radius: 10px;
  width: 80px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 1.5px solid #d4af37;
  position: relative;
  overflow: hidden;
}

.secondary-logo-box::after {
  content: "";
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 8px;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%);
  background-size: 200% 200%;
  animation: shine 4s infinite linear;
  pointer-events: none;
  z-index: 3;
}

.secondary-logo { max-width: 90%; max-height: 90%; object-fit: contain; position: relative; z-index: 2; }

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.welcome-msg h2 {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.welcome-msg p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 2px 0 0;
}

.login-form { display: flex; flex-direction: column; gap: 0.75rem; }

.form-group label {
  display: block;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #0f172a;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.password-wrapper { position: relative; }
.toggle-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

/* Captcha styling */
.captcha-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.captcha-img-box {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  cursor: pointer;
  height: 45px;
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
}

.captcha-img-box img { height: 100%; width: auto; border-radius: 8px; }
.captcha-input { text-align: center; font-weight: 800; letter-spacing: 0.1em; }

.btn-submit {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.9rem;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px -8px rgba(37, 99, 235, 0.4);
}

.login-footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.help-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: color 0.3s;
}

.help-link:hover { color: #3b82f6; }
.divider { width: 1px; height: 12px; background: #e2e8f0; }

.footer-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copy-text { color: #64748b; font-size: 0.75rem; font-weight: 600; }
.version-tag { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-family: monospace; font-weight: 600; }

.alert { padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600; }
.alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }

.text-success { color: #16a34a; font-weight: 600; }
.color-primary { border-top-color: #3b82f6; }

[class*="animate-in-"] { opacity: 0; transform: translateY(8px); animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-in-1 { animation-delay: 0.1s; }
.animate-in-2 { animation-delay: 0.2s; }
.animate-in-3 { animation-delay: 0.3s; }

@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
@keyframes shine {
  0% { background-position: -200% -200%; }
  100% { background-position: 200% 200%; }
}

.spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.text-center { text-align: center; }
.mb-3 { margin-bottom: 1rem; }
</style>
