<template>
  <div class="peneliti-login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3">
    <!-- Ambient Background Glows -->
    <div class="glow-bg-1"></div>
    <div class="glow-bg-2"></div>

    <div class="card login-card-premium border-0 shadow-lg rounded-4 overflow-hidden">
      <!-- Top Decorative Banner -->
      <div class="card-banner p-4 text-white text-center position-relative">
        <div class="banner-overlay"></div>
        <div class="position-relative z-1">
          <div class="brand-badge-box mx-auto mb-3">
            <i class="fas fa-user-shield"></i>
          </div>
          <h4 class="fw-extrabold mb-1">Portal Data Peneliti</h4>
          <p class="text-xs text-white-50 mb-0">RSIA Aisyiyah Pekajangan &bull; Rekam Medis Ter-masking</p>
        </div>
      </div>

      <div class="card-body p-4 p-md-5 bg-white">
        <div class="text-center mb-4">
          <span class="badge badge-akreditasi mb-2">
            <i class="fas fa-certificate me-1"></i> MRMIK 1 EP e Compliant
          </span>
          <h5 class="fw-bold text-dark mb-1">Silakan Log In</h5>
          <p class="text-xs text-muted mb-0">Gunakan akun peneliti yang diterbitkan oleh bagian Diklit RS</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label-custom">Username Peneliti</label>
            <div class="input-group-custom">
              <i class="fas fa-user input-icon"></i>
              <input 
                type="text" 
                class="form-control form-control-custom" 
                v-model="form.username" 
                required 
                placeholder="Masukkan username"
              >
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label-custom">Password</label>
            <div class="input-group-custom">
              <i class="fas fa-lock input-icon"></i>
              <input 
                type="password" 
                class="form-control form-control-custom" 
                v-model="form.password" 
                required 
                placeholder="Masukkan password"
              >
            </div>
          </div>

          <button type="submit" class="btn btn-login-primary w-100 shadow-sm" :disabled="loading">
            <i :class="['fas me-2', loading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt']"></i>
            <span>{{ loading ? 'Memverifikasi Akses...' : 'Masuk Portal Peneliti' }}</span>
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <div class="text-xs text-muted fw-semibold">
            <i class="fas fa-shield-alt text-success me-1"></i> Data Identitas Pasien Ter-masking Otomatis
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import penelitianService from '@/services/penelitianService'
import Swal from 'sweetalert2'

export default {
  name: 'PenelitiLoginView',
  data() {
    return {
      loading: false,
      form: { username: '', password: '' }
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      try {
        const res = await penelitianService.loginPortal(this.form)
        if (res.data.success) {
          const authData = res.data.data
          localStorage.setItem('peneliti_token', authData.token)
          localStorage.setItem('peneliti_access_id', authData.access_id)
          localStorage.setItem('peneliti_username', authData.username)
          localStorage.setItem('peneliti_permohonan', JSON.stringify(authData.permohonan))

          Swal.fire({
            icon: 'success',
            title: 'Login Berhasil',
            text: `Selamat datang, ${authData.permohonan.nama_peneliti}`,
            timer: 1500,
            showConfirmButton: false
          })

          this.$router.push('/portal-peneliti/rme')
        }
      } catch (err) {
        console.error('Login error:', err)
        Swal.fire('Login Gagal', err.response?.data?.message || 'Username atau password salah', 'error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.peneliti-login-wrapper {
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

/* Ambient Background Blobs */
.glow-bg-1 {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
}

.glow-bg-2 {
  position: absolute;
  bottom: 10%;
  right: 20%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(50px);
}

.login-card-premium {
  width: 100%;
  max-width: 420px;
  z-index: 10;
  border: 1px solid #e2e8f0 !important;
}

.card-banner {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.25), transparent 70%);
}

.brand-badge-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.badge-akreditasi {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
}

.form-label-custom {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.35rem;
}

.input-group-custom {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.form-control-custom {
  padding-left: 2.75rem;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  background: #f8fafc;
}

.form-control-custom:focus {
  background: white;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-login-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  height: 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-login-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}
</style>
