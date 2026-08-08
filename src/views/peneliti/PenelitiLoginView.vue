<template>
  <div class="peneliti-login-view d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="card border-0 shadow-lg rounded-4 p-4 login-card">
      <div class="text-center mb-4">
        <div class="brand-icon mx-auto mb-3">
          <i class="fas fa-user-shield"></i>
        </div>
        <h4 class="fw-bold text-dark mb-1">Portal Peneliti & Riset</h4>
        <p class="text-xs text-muted">Akses Rekam Medis Elektronik Ter-masking (MRMIK 1 EP e)</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label text-xs font-semibold text-muted">Username Peneliti</label>
          <div class="input-group">
            <span class="input-group-text bg-white text-muted"><i class="fas fa-user"></i></span>
            <input type="text" class="form-control" v-model="form.username" required placeholder="Masukkan username">
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-xs font-semibold text-muted">Password</label>
          <div class="input-group">
            <span class="input-group-text bg-white text-muted"><i class="fas fa-lock"></i></span>
            <input type="password" class="form-control" v-model="form.password" required placeholder="Masukkan password">
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 rounded-3 py-2 fw-bold shadow-sm" :disabled="loading">
          <i :class="['fas me-2', loading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt']"></i>
          {{ loading ? 'Memverifikasi...' : 'Masuk Portal Peneliti' }}
        </button>
      </form>

      <div class="text-center mt-4 pt-3 border-top">
        <span class="text-xs text-muted">RSIA Aisyiyah Pekajangan &copy; {{ currentYear }}</span>
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
.peneliti-login-view {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.brand-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
</style>
