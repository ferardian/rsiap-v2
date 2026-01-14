<template>
  <div class="login-page">
    <div class="login-container">
      <div class="card">
        <div class="card-header">
          <div class="logo">
            <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="logo-img">
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
              />
              <div v-if="errors.username" class="error-text">
                {{ errors.username }}
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">
                Password
              </label>
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
              <div v-if="errors.password" class="error-text">
                {{ errors.password }}
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="showPassword"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="isLoading"
                />
                <span class="checkmark"></span>
                Tampilkan password
              </label>
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
            <p class="info-text">
              <strong>Info:</strong> Gunakan username dan password yang telah terdaftar
            </p>
            <div class="help-links">
              <a href="#" class="help-link" @click.prevent>
                Lupa password?
              </a>
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
  } else if (form.username.trim().length < 3) {
    errors.username = 'Username minimal 3 karakter'
    isValid = false
  }

  // Password validation
  if (!form.password.trim()) {
    errors.password = 'Password harus diisi'
    isValid = false
  } else if (form.password.trim().length < 4) {
    errors.password = 'Password minimal 4 karakter'
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
        successMessage.value = 'Login berhasil! Mohon pilih role...'
        setTimeout(() => {
          router.push('/select-role')
        }, 1000)
      } else {
        successMessage.value = 'Login berhasil! Mengalihkan ke dashboard...'
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } else {
      error.value = result.error
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
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.logo {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.error-text {
  color: #c33;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-input.is-invalid {
  border-color: #c33;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  gap: 0.5rem;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkmark:after {
  content: '✓';
  color: white;
  font-size: 0.7rem;
}

.info-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
}

.info-text {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
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
  margin-top: 2rem;
  color: white;
}

.login-footer p {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.version {
  font-size: 0.75rem;
  opacity: 0.7;
}
</style>