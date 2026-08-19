<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-info">
            <h3 class="modal-title">
              <i class="fas fa-folder-open text-primary me-2"></i> Berkas Pegawai
            </h3>
            <p class="modal-subtitle">Daftar dokumen dan berkas terlampir</p>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" v-if="pegawai">
          <!-- Employee Info Header Banner -->
          <div class="employee-banner">
            <div class="avatar-large">
              <img 
                v-if="pegawai.photo && pegawai.photo !== '-'" 
                :src="getPhotoUrl(pegawai.photo)" 
                :alt="pegawai.nama" 
                class="avatar-img" 
              />
              <div v-else class="avatar-placeholder">
                <i class="fas" :class="pegawai.jk === 'Pria' ? 'fa-user' : 'fa-user-nurse'"></i>
              </div>
            </div>
            <div class="employee-meta">
              <h4 class="emp-name">{{ pegawai.nama }}</h4>
              <div class="emp-pills">
                <span class="pill-nik"><i class="fas fa-id-badge me-1"></i> NIK: {{ pegawai.nik || pegawai.nip }}</span>
                <span class="pill-jbtn" v-if="pegawai.jbtn">{{ pegawai.jbtn }}</span>
                <span class="pill-unit" v-if="pegawai.unit">{{ pegawai.unit }}</span>
              </div>
            </div>
          </div>

          <!-- Document List Section (Read-Only) -->
          <div class="berkas-container">
            <PegawaiBerkasSection 
              :nik="pegawai.nik || pegawai.nip" 
              :read-only="true" 
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn-close-modal" @click="$emit('close')">
            <i class="fas fa-check-circle me-1"></i> Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import PegawaiBerkasSection from './PegawaiBerkasSection.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pegawai: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

const getPhotoUrl = (photoName) => {
  if (!photoName || photoName === '-') return ''
  return `https://sim.rsiaaisyiyah.com/rsiap/file/pegawai/${photoName}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.modal-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Employee Banner */
.employee-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.15rem 1.25rem;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  margin-bottom: 1.25rem;
}

.avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  background: white;
  border: 2px solid #3b82f6;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.avatar-placeholder {
  font-size: 1.5rem;
  color: #94a3b8;
}

.emp-name {
  margin: 0 0 0.35rem 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.emp-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.pill-nik {
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.725rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.pill-jbtn {
  background: #e2e8f0;
  color: #334155;
  font-size: 0.725rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.pill-unit {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.725rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.berkas-container {
  background: white;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 0.6rem 1.5rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-close-modal:hover {
  background: #334155;
  transform: translateY(-1px);
}
</style>
