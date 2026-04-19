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
          <h1>RSIAP V2</h1>
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

          <!-- Login Form -->
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username" class="form-label">
                Username / NIK
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                :class="{ 'is-invalid': errors.username }"
                placeholder="Masukkan username atau NIK"
                :disabled="isLoading"
                required
                autocomplete="username"
                @input="form.username = form.username.replace(/[^0-9.]/g, '')"
              />
              <div v-if="errors.username" class="error-text">
                {{ errors.username }}
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                Password
              </label>
              <div class="password-wrapper">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Masukkan password"
                  :disabled="isLoading"
                  required
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :class="{ 'is-dimmed': !showPassword }"
                >
                  💡
                </button>
              </div>
              <div v-if="errors.password" class="error-text">
                {{ errors.password }}
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading || !isFormValid"
            >
              <div v-if="isLoading" class="spinner"></div>
              <span v-else>🔐</span>
              <span>{{ isLoading ? 'Sedang masuk...' : 'Masuk' }}</span>
            </button>
          </form>

          <!-- Info Section -->
          <div class="info-section">
            <div class="info-badge">
              <span class="badge-icon">ℹ️</span>
              Gunakan kredensial terdaftar
            </div>
            <div class="help-links">
              <router-link to="/forgot-password" class="help-link">
                Lupa password?
              </router-link>
              <span class="separator">•</span>
              <a href="#" class="help-link" @click.prevent>
                Bantuan IT
              </a>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Router and store
const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Computed properties
const isFormValid = computed(() => {
  return form.username.trim() !== '' && form.password.trim() !== ''
})

// Form validation
const validateForm = () => {
  // Reset errors
  errors.username = ''
  errors.password = ''

  let isValid = true

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username harus diisi'
    isValid = false
  } else if (!/^[0-9.]+$/.test(form.username.trim())) {
    errors.username = 'Username hanya boleh berisi angka dan titik'
    isValid = false
  } else if (form.username.trim().length < 3) {
    errors.username = 'Username minimal 3 karakter'
    isValid = false
  }

  // Password validation
  if (!form.password.trim()) {
    errors.password = 'Password harus diisi'
    isValid = false
  }

  return isValid
}

// Login handler
const handleLogin = async () => {
  // Clear previous messages
  error.value = ''
  successMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.login({
      username: form.username.trim(),
      password: form.password.trim()
    })

    if (result.success) {
      if (result.requireRoleSelection) {
        successMessage.value = 'Berhasil! Pilih role anda...'
        setTimeout(() => {
          router.push('/select-role')
        }, 1000)
      } else {
        successMessage.value = 'Berhasil! Masuk ke sistem...'
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } else {
      error.value = (result.error && result.error.toLowerCase() === 'user not found') ? 'User Tidak Terdaftar' : result.error
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}

// Check if user is already logged in
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  padding: 4px;
  opacity: 0.7;
  transition: all 0.3s ease;
  z-index: 10;
}

.password-toggle:hover {
  opacity: 1;
  transform: scale(1.1);
}

.password-toggle.is-dimmed {
  opacity: 0.3;
  filter: grayscale(1);
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
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

.info-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
}

.badge-icon {
  font-size: 0.85rem;
}

.help-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.help-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

.separator {
  color: #ccc;
  font-size: 0.85rem;
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
    margin-bottom: 1.5rem; /* Increased from 0.5rem to add distance to title */
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
  
  .info-section {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
  }
  
  .login-footer {
    margin-top: 0.5rem;
  }
}
</style>