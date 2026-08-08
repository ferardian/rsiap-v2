<template>
  <div class="peneliti-login-page min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4">
    <!-- Mesh Background Gradients -->
    <div class="mesh-shape shape-1"></div>
    <div class="mesh-shape shape-2"></div>
    <div class="mesh-shape shape-3"></div>

    <!-- Main Container Card -->
    <div class="card main-login-card border-0 shadow-2xl rounded-5 overflow-hidden w-100">
      <div class="row g-0 align-items-stretch">
        <!-- Left Column: Visual Hero Section -->
        <div class="col-lg-6 hero-section p-4 p-md-5 d-flex flex-column justify-content-between text-white position-relative">
          <div class="hero-overlay"></div>
          
          <!-- Top Brand -->
          <div class="position-relative z-2 d-flex align-items-center gap-3">
            <div class="brand-logo-glass">
              <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="img-fluid logo-img">
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-white tracking-tight">RSIA Aisyiyah Pekajangan</h5>
              <span class="text-xs text-emerald-300 font-medium">Portal Akses Rekam Medis Riset</span>
            </div>
          </div>

          <!-- Hero Content & Illustration -->
          <div class="position-relative z-2 my-auto py-4">
            <div class="badge-hero mb-3">
              <i class="fas fa-shield-check text-emerald-400 me-2"></i> Standar Pelayanan Data RS
            </div>
            <h2 class="hero-title fw-extrabold mb-3">Sistem Akses Data RME Ter-masking</h2>
            <p class="hero-desc text-slate-300 mb-4">
              Fasilitas penelusuran data klinis pasien untuk keperluan skripsi, tesis, dan riset medis tanpa mengabaikan privasi dan identitas pasien.
            </p>

            <div class="d-flex flex-wrap gap-2">
              <div class="feature-pill">
                <i class="fas fa-user-ninja text-teal-300 me-1"></i> Anonimasi Pasien
              </div>
              <div class="feature-pill">
                <i class="fas fa-file-excel text-emerald-300 me-1"></i> Export Data CSV
              </div>
              <div class="feature-pill">
                <i class="fas fa-clock text-cyan-300 me-1"></i> SLA Penyiapan Data
              </div>
            </div>
          </div>

          <!-- Footer Copy -->
          <div class="position-relative z-2 text-xs text-slate-400">
            &copy; {{ currentYear }} RSIA Aisyiyah Pekajangan &bull; Diklit & Rekam Medis
          </div>
        </div>

        <!-- Right Column: Login Form -->
        <div class="col-lg-6 form-section bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
          <div class="form-container mx-auto w-100">
            <div class="mb-4">
              <h3 class="fw-extrabold text-slate-900 mb-1">Log In Peneliti</h3>
              <p class="text-sm text-slate-500">Masukkan akun portal yang telah diterbitkan oleh bagian Diklit RS.</p>
            </div>

            <form @submit.prevent="handleLogin" class="d-flex flex-column gap-3">
              <div>
                <label class="form-label-modern">Username</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input 
                    type="text" 
                    class="form-control input-modern" 
                    v-model="form.username" 
                    required 
                    placeholder="Masukkan username akun peneliti"
                  >
                </div>
              </div>

              <div>
                <label class="form-label-modern">Password</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    class="form-control input-modern" 
                    v-model="form.password" 
                    required 
                    placeholder="Masukkan password"
                  >
                </div>
              </div>

              <div class="pt-2">
                <button type="submit" class="btn btn-hero-submit w-100 shadow-lg" :disabled="loading">
                  <span>{{ loading ? 'Memverifikasi Akses...' : 'Masuk ke Portal RME' }}</span>
                  <i :class="['fas ms-2', loading ? 'fa-spinner fa-spin' : 'fa-arrow-right']"></i>
                </button>
              </div>
            </form>

            <div class="notice-box mt-4 p-3 rounded-4 d-flex align-items-center gap-3">
              <div class="notice-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="text-xs text-slate-600">
                Data identitas pasien (NIK, Nama, Alamat) di-masking secara otomatis oleh sistem sesuai regulasi privasi data RS.
              </div>
            </div>
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
      form: { username: '', password: '' },
      currentYear: new Date().getFullYear()
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
            title: 'Selamat Datang',
            text: `Akses berhasil dikonfirmasi untuk ${authData.permohonan.nama_peneliti}`,
            timer: 1500,
            showConfirmButton: false
          })

          this.$router.push('/portal-peneliti/rme')
        }
      } catch (err) {
        console.error('Login error:', err)
        Swal.fire('Akses Ditolak', err.response?.data?.message || 'Username atau password tidak cocok', 'error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.peneliti-login-page {
  background-color: #0f172a;
  position: relative;
  overflow: hidden;
}

/* Organic Ambient Gradients */
.mesh-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}

.shape-1 {
  top: -10%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, #1d4ed8 100%);
}

.shape-2 {
  bottom: -15%;
  right: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #10b981 0%, #047857 100%);
}

.shape-3 {
  top: 30%;
  left: 40%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #6366f1 0%, #4338ca 100%);
  opacity: 0.3;
}

/* Card */
.main-login-card {
  max-width: 1000px;
  z-index: 10;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 28px !important;
  border: none !important;
  outline: none !important;
  isolation: isolate;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
}

/* Hero Left Section */
.hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  min-height: 520px;
  border-top-left-radius: 28px;
  border-bottom-left-radius: 28px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 70%);
}

.brand-logo-glass {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.logo-img {
  max-height: 100%;
  object-fit: contain;
}

.badge-hero {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 1.85rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 0.9rem;
  line-height: 1.6;
}

.feature-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
}

/* Form Section */
.form-container {
  max-width: 380px;
}

.form-label-modern {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.1rem;
  color: #94a3b8;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.input-modern {
  height: 52px;
  padding-left: 3rem;
  padding-right: 1.25rem;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background-color: #f8fafc;
  font-size: 0.925rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.input-modern:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.input-modern:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #3b82f6;
}

.btn-hero-submit {
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25 ease;
}

.btn-hero-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(37, 99, 235, 0.4);
}

.notice-box {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.notice-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}
</style>
