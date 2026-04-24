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
              <p>Lupa Password</p>
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
              <h2>Reset Akses</h2>
              <p>Masukkan data verifikasi akun anda</p>
            </div>
          </div>

          <!-- Alert -->
          <div v-if="error" class="alert alert-error animate-shake">
            {{ error }}
          </div>
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleSendLink" v-if="!successMessage" class="login-form">
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
              <label for="email">Alamat Email</label>
              <input
                id="email"
                name="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Masukkan email terdaftar"
                autocomplete="email"
                :disabled="isLoading"
                required
              />
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
              <span v-else>Kirim Link Reset</span>
            </button>

            <div class="login-footer-links">
              <router-link to="/login" class="help-link">Kembali Login</router-link>
              <div class="divider"></div>
              <router-link to="/change-password" class="help-link">Ubah Password</router-link>
            </div>
          </form>

          <div v-else class="success-action">
            <router-link to="/login" class="btn-submit text-center d-block">Kembali ke Login</router-link>
          </div>
        </div>

        <!-- Row 3: Footer -->
        <div class="bento-item animate-in-3 footer-flex">
          <div class="copy-text">© 2024 RSIA Aisyiyah Pekajangan</div>
          <div class="version-tag">v2.1.0-stable</div>
        </div>
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
  width: 65px;
  height: 65px;
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

.login-form { display: flex; flex-direction: column; gap: 1rem; }

.form-group label {
  display: block;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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
  justify-content: space-between;
  align-items: center;
}

.copy-text { color: #64748b; font-size: 0.75rem; font-weight: 600; }
.version-tag { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-family: monospace; font-weight: 600; }

.alert { padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600; }
.alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }

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
.d-block { display: block; }
</style>
