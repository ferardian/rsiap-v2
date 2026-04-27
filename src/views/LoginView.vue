<template>
  <div class="login-page">
    <!-- Animated Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    
    <div class="bento-container">
      <div class="bento-stack">
        
        <!-- Row 1: Header (Prioritize RS Logo) -->
        <div class="bento-item item-header animate-in-1">
          <div class="header-grid">
            <div class="header-left">
              <div class="main-logo-box">
                <img src="@/assets/logo.png" alt="RSIA Logo" class="main-logo">
              </div>
              <div class="header-text">
                <h1>RSIAP <span class="v2-tag">V2</span></h1>
                <p>Integrated Healthcare System</p>
              </div>
            </div>
            <div class="header-right">
              <div class="secondary-logo-box">
                <img src="@/assets/logo-larsi.png" alt="LARSI Logo" class="secondary-logo">
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Login Form & Real-time Status -->
        <div class="bento-item item-login animate-in-2">
          <div class="login-header">
            <div class="welcome-msg">
              <h2>Masuk Sistem</h2>
              <p>RSIA Aisyiyah Pekajangan</p>
            </div>
            <div class="status-indicator" :class="{ 'is-offline': !isOnline }">
              <span class="dot"></span> 
              {{ isOnline ? 'Online' : 'Offline' }}
            </div>
          </div>

          <div v-if="error" class="alert alert-error animate-shake">
            <span>⚠️ {{ error }}</span>
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <span>✅ {{ successMessage }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">NIK / Username</label>
              <div class="input-field">
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
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-field password-field">
                <input
                  id="password"
                  name="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Masukkan password"
                  autocomplete="current-password"
                  :disabled="isLoading"
                  required
                />
                <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                  <!-- Lock Icon (Hidden) -->
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <!-- Unlock Icon (Visible) -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading || !isFormValid">
              <div v-if="isLoading" class="spinner"></div>
              <span v-else>Masuk Sekarang</span>
            </button>
          </form>

          <div class="login-footer-links">
            <router-link to="/forgot-password" class="forgot-link">Lupa password?</router-link>
            <div class="divider"></div>
            <a href="#" class="help-link" @click.prevent>Bantuan IT</a>
          </div>
        </div>

        <!-- Row 3: Year & Version -->
        <div class="bento-item item-footer animate-in-3">
          <div class="footer-flex">
            <div class="copy-text">&copy; 2024 RSIA Aisyiyah Pekajangan</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Connection Monitoring
const isOnline = ref(navigator.onLine)
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

const isFormValid = computed(() => {
  return form.username.trim() !== '' && form.password.trim() !== ''
})

const handleLogin = async () => {
  error.value = ''
  successMessage.value = ''
  isLoading.value = true
  try {
    const result = await authStore.login({
      username: form.username.trim(),
      password: form.password.trim()
    })

    if (result.success) {
      successMessage.value = 'Berhasil! Mengalihkan...'
      setTimeout(() => {
        router.push(result.requireRoleSelection ? '/select-role' : '/dashboard')
      }, 800)
    } else {
      error.value = result.error || 'Username atau password salah.'
    }
  } catch (err) {
    error.value = 'Gangguan koneksi ke server.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
  // Setup online/offline listeners
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
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

/* Decor */
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
  gap: 0.75rem; /* Reduced gap */
}

.bento-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px; /* Slightly smaller radius */
  padding: 1.25rem; /* Reduced padding */
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

/* Row 1: Header Grid */
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
  width: 55px; /* Smaller logo box */
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  flex-shrink: 0; /* Prevent squishing on mobile */
}

.main-logo { max-width: 95%; max-height: 95%; object-fit: contain; }

.header-text h1 {
  color: #0f172a;
  font-size: 1.4rem; /* Smaller text */
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
  width: 80px; /* Smaller secondary logo box */
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
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 8px;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%);
  background-size: 200% 200%;
  animation: shine 4s infinite linear;
  pointer-events: none;
  z-index: 3;
}

.secondary-logo { max-width: 90%; max-height: 90%; object-fit: contain; position: relative; z-index: 2; }

/* Row 2: Form */
.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem; /* Reduced margin */
}

.welcome-msg h2 {
  color: #0f172a;
  font-size: 1.25rem; /* Smaller text */
  font-weight: 700;
  margin: 0;
}

.welcome-msg p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 2px 0 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-indicator.is-offline {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

.status-indicator .dot { 
  width: 7px; 
  height: 7px; 
  background: currentColor; 
  border-radius: 50%; 
  box-shadow: 0 0 8px currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.login-form { display: flex; flex-direction: column; gap: 1rem; /* Reduced gap */ }

.form-group label {
  display: block;
  color: #475569;
  font-size: 0.75rem; /* Smaller text */
  font-weight: 700;
  margin-bottom: 0.5rem; /* Reduced margin */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem; /* Reduced padding */
  color: #0f172a;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.password-field { position: relative; }
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
}

.btn-submit {
  margin-top: 0.5rem; /* Reduced margin */
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.9rem; /* Reduced padding */
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px -8px rgba(37, 99, 235, 0.4);
}

.btn-submit:hover:not(:disabled) { 
  transform: translateY(-2px); 
  box-shadow: 0 10px 24px -8px rgba(37, 99, 235, 0.5);
}

.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.login-footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.25rem; /* Reduced margin */
}

.forgot-link, .help-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: color 0.3s;
}

.forgot-link:hover, .help-link:hover { color: #3b82f6; }
.divider { width: 1px; height: 12px; background: #e2e8f0; }

/* Item 3: Footer */
.footer-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copy-text { color: #64748b; font-size: 0.75rem; font-weight: 600; }
.version-tag { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-family: monospace; font-weight: 600; }

/* Alert */
.alert { padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.25rem; font-weight: 600; }
.alert-error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.alert-success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }

/* Animation */
[class*="animate-in-"] { opacity: 0; transform: translateY(8px); animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-in-1 { animation-delay: 0.1s; }
.animate-in-2 { animation-delay: 0.2s; }
.animate-in-3 { animation-delay: 0.3s; }

@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }

.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

@keyframes shine {
  0% { background-position: -200% -200%; }
  100% { background-position: 200% 200%; }
}
</style>