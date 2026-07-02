<template>
  <div class="profile-page">
    <div class="profile-container animate-fade-in">
      <div class="profile-grid">
        
        <!-- Left Sidebar: Main Identity -->
        <aside class="profile-sidebar">
          <div class="sidebar-card">
            <div class="avatar-section">
              <div class="profile-avatar" :class="isFemale(profileData.jk) ? 'avatar-pink' : 'avatar-blue'">
                <img v-if="profileData.photo" :src="getPhotoUrl(profileData.photo)" :alt="profileData.nama" class="avatar-img">
                <i v-else class="fas" :class="isFemale(profileData.jk) ? 'fa-female' : 'fa-male'"></i>
              </div>
              <h2 class="user-name">{{ profileData.nama || 'User' }}</h2>
              <p class="user-role">{{ profileData.jbtn || '-' }}</p>
            </div>
            
            <div class="sidebar-divider"></div>
            
            <div class="quick-info">
              <div class="info-item">
                <span class="info-label">NIK / NIP</span>
                <span class="info-value">{{ profileData.nik || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Jenis Kelamin</span>
                <span class="info-value">{{ formatGender(profileData.jk) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status Akun</span>
                <span class="info-value status-active">
                  <i class="fas fa-check-circle"></i> Terverifikasi
                </span>
              </div>
            </div>

            <div v-if="!isEditing" class="sidebar-actions mt-6">
              <button class="btn-primary-edit w-100" @click="startEditing">
                <i class="fas fa-user-edit mr-2"></i> Edit Profil
              </button>
            </div>
            <div v-else class="sidebar-actions mt-6 flex-column gap-2">
              <button class="btn-save w-100" @click="handleUpdateProfile" :disabled="submitting || !isDataChanged">
                <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-save mr-2"></i>
                {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
              <button class="btn-outline-cancel w-100" @click="cancelEditing" :disabled="submitting">
                <i class="fas fa-times mr-2"></i> Batal
              </button>
            </div>
          </div>

          <!-- Quick Stats or Info -->
          <div class="sidebar-card mt-4 bg-gradient-info text-white">
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-id-card"></i></div>
              <div class="stat-content">
                <span class="stat-label text-white-50">Nomor KTP</span>
                <span class="stat-value">{{ profileData.no_ktp || '-' }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Main Content -->
        <main class="profile-main">
          
          <!-- Section 1: Personal Details -->
          <section class="content-section">
            <div class="section-header">
              <i class="fas fa-info-circle section-icon"></i>
              <h3>Informasi Pribadi</h3>
            </div>
            
            <div class="card-glass p-6">
              <div class="form-grid">
                <div class="form-group">
                  <label>Tempat Lahir</label>
                  <div class="display-box">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ profileData.tmp_lahir || '-' }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Tanggal Lahir</label>
                  <div class="display-box">
                    <i class="fas fa-calendar-day"></i>
                    <span>{{ formatDate(profileData.tgl_lahir) }}</span>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="required">Nomor Telepon</label>
                  <div class="input-wrapper" :class="{ 'has-error': telpError, 'is-editing': isEditing }">
                    <i class="fas fa-phone"></i>
                    <input 
                      type="text" 
                      v-model="telpToUpdate" 
                      class="form-control-minimal" 
                      :disabled="!isEditing"
                      @input="validateTelp"
                      placeholder="08123xxx"
                    >
                  </div>
                  <small v-if="telpError" class="error-text">{{ telpError }}</small>
                </div>
                
                <div class="form-group">
                  <label class="required">Email Resmi</label>
                  <div class="input-wrapper" :class="{ 'has-error': emailError, 'is-editing': isEditing }">
                    <i class="fas fa-envelope"></i>
                    <input 
                      type="email" 
                      v-model="emailToUpdate" 
                      class="form-control-minimal" 
                      :disabled="!isEditing"
                      @input="validateEmail"
                      placeholder="email@example.com"
                    >
                  </div>
                  <small v-if="emailError" class="error-text">{{ emailError }}</small>
                </div>

                <div class="form-group">
                  <label class="required">Status Menikah</label>
                  <div class="input-wrapper" :class="{ 'has-error': sttsNikahError, 'is-editing': isEditing }">
                    <i class="fas fa-ring"></i>
                    <select v-model="sttsNikahToUpdate" class="form-control-minimal" :disabled="!isEditing">
                      <option value="SINGLE">Single</option>
                      <option value="MENIKAH">Menikah</option>
                      <option value="JANDA">Janda</option>
                      <option value="DUDHA">Dudha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-group mt-6">
                <label class="required">Alamat Tempat Tinggal</label>
                <div class="input-wrapper" :class="{ 'has-error': alamatError, 'is-editing': isEditing }">
                  <i class="fas fa-home" style="align-self: flex-start; margin-top: 12px;"></i>
                  <textarea 
                    v-model="alamatToUpdate" 
                    class="form-control-minimal" 
                    rows="3" 
                    :disabled="!isEditing"
                    @input="validateAlamat"
                    placeholder="Alamat lengkap..."
                  ></textarea>
                </div>
                <small v-if="alamatError" class="error-text">{{ alamatError }}</small>
              </div>
            </div>
          </section>

          <!-- Section 2: Clinical Qualification (Conditional) -->
          <section v-if="profileData.kualifikasi_staf" class="content-section mt-6">
            <div class="section-header color-primary">
              <i class="fas fa-user-md section-icon"></i>
              <h3>Kualifikasi Klinis</h3>
            </div>
            
            <div class="card-glass p-6">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nomor STR</label>
                  <div class="input-wrapper" :class="{ 'is-editing': isEditing }">
                    <i class="fas fa-id-card-alt"></i>
                    <input type="text" v-model="nomorStrToUpdate" class="form-control-minimal" :disabled="!isEditing">
                  </div>
                </div>
                <div class="form-group">
                  <label>Tanggal Terbit STR</label>
                  <div class="input-wrapper" :class="{ 'is-editing': isEditing }">
                    <i class="fas fa-calendar-check"></i>
                    <input type="date" v-model="tanggalStrToUpdate" class="form-control-minimal" :disabled="!isEditing">
                  </div>
                </div>
                <div class="form-group">
                  <label>Nomor SIP</label>
                  <div class="input-wrapper" :class="{ 'is-editing': isEditing }">
                    <i class="fas fa-file-medical-alt"></i>
                    <input type="text" v-model="nomorSipToUpdate" class="form-control-minimal" :disabled="!isEditing">
                  </div>
                </div>
                <div class="form-group">
                  <label>Tanggal Mulai SIP</label>
                  <div class="input-wrapper" :class="{ 'is-editing': isEditing }">
                    <i class="fas fa-calendar-alt"></i>
                    <input type="date" v-model="tanggalIzinPraktekToUpdate" class="form-control-minimal" :disabled="!isEditing">
                  </div>
                </div>
                <div class="form-group">
                  <label>Tanggal Berakhir SIP</label>
                  <div class="input-wrapper" :class="{ 'is-editing': isEditing }">
                    <i class="fas fa-calendar-times"></i>
                    <input type="date" v-model="tanggalAkhirStrToUpdate" class="form-control-minimal" :disabled="!isEditing">
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Family Members -->
          <section class="content-section mt-6">
            <div class="section-header color-success">
              <i class="fas fa-users section-icon"></i>
              <h3>Anggota Keluarga</h3>
              <button class="btn-add-mini ml-auto" @click="showAddFamilyModal = true">
                <i class="fas fa-plus mr-1"></i> Tambah
              </button>
            </div>
            
            <div class="card-glass overflow-hidden">
              <div v-if="familyMembers.length === 0" class="p-10 text-center text-muted">
                <i class="fas fa-user-friends fa-3x mb-3 opacity-20"></i>
                <p>Belum ada data keluarga</p>
              </div>
              <div v-else class="family-table-container">
                <table class="family-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Hubungan</th>
                      <th>Umur</th>
                      <th>No. BPJS</th>
                      <th class="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in familyMembers" :key="member.id">
                      <td>
                        <div class="flex-align">
                          <div class="mini-avatar" :class="member.jk === 'P' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'">
                            <i class="fas" :class="member.jk === 'P' ? 'fa-female' : 'fa-male'"></i>
                          </div>
                          <span>{{ member.nama }}</span>
                        </div>
                      </td>
                      <td><span class="badge-soft">{{ member.hubungan }}</span></td>
                      <td>{{ calculateAge(member.tgl_lahir) }}</td>
                      <td><span class="text-success font-weight-bold">{{ member.no_bpjs || '-' }}</span></td>
                      <td class="text-right">
                        <button class="btn-icon-danger" @click="confirmDeleteMember(member)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>

    <!-- Modal Tambah Keluarga -->
    <div v-if="showAddFamilyModal" class="modal-overlay" @click.self="closeFamilyModal">
      <div class="modal-container animate-scale-in">
        <div class="modal-header">
          <div class="header-with-icon">
            <div class="mini-icon bg-success-soft text-success">
              <i class="fas fa-user-plus"></i>
            </div>
            <div>
              <h3 class="m-0">Tambah Keluarga</h3>
              <p class="m-0 text-muted" style="font-size: 0.8rem;">Lengkapi data anggota keluarga baru</p>
            </div>
          </div>
          <button class="close-btn" @click="closeFamilyModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body custom-scrollbar">
          <!-- BPJS Lookup Helper -->
          <div class="bpjs-lookup-wrapper mb-4">
            <div class="bpjs-lookup-box-premium" style="padding: 1rem;">
              <div class="lookup-badge" style="margin-bottom: 0.5rem;">
                <i class="fas fa-shield-alt"></i> BPJS Kesehatan
              </div>
              <p class="lookup-text" style="margin-bottom: 0.75rem; font-size: 0.8rem;">Masukkan NIK / No. Kartu untuk isi otomatis.</p>
              <div class="lookup-form-group">
                <div class="query-input-container">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    v-model="vclaimQuery" 
                    placeholder="NIK / No. BPJS"
                    style="padding: 0.6rem 1rem 0.6rem 2.5rem;"
                    @keypress.enter="lookupVclaim"
                  >
                </div>
                <button 
                  class="btn-lookup-action" 
                  style="padding: 0 1.25rem; font-size: 0.8rem;"
                  @click="lookupVclaim" 
                  :disabled="isSearchingVclaim || !vclaimQuery"
                >
                  <i v-if="isSearchingVclaim" class="fas fa-spinner fa-spin"></i>
                  <span v-else>Cek Data</span>
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAddFamily" class="modern-form">
            <div class="form-group full-width mb-4">
              <label class="required" style="margin-bottom: 0.25rem;">Nama Lengkap</label>
              <div class="input-minimal-wrapper">
                <i class="fas fa-user"></i>
                <input type="text" v-model="familyForm.nama" class="form-control-minimal-v2" style="padding: 0.6rem 1rem 0.6rem 2.5rem;" placeholder="Nama sesuai KTP" required>
              </div>
            </div>
            
            <div class="form-grid-2" style="gap: 0.75rem 1.25rem;">
              <div class="form-group">
                <label class="required" style="margin-bottom: 0.15rem;">Hubungan</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-users"></i>
                  <select v-model="familyForm.hubungan" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;" required>
                    <option value="Suami">Suami</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Saudara">Saudara</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="required" style="margin-bottom: 0.15rem;">Jenis Kelamin</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-venus-mars"></i>
                  <select v-model="familyForm.jk" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;" required>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label style="margin-bottom: 0.15rem;">No. KTP (NIK)</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-id-card"></i>
                  <input type="text" v-model="familyForm.no_ktp" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;" placeholder="16 digit NIK">
                </div>
              </div>

              <div class="form-group">
                <label style="margin-bottom: 0.15rem;">No. BPJS</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-id-card-alt"></i>
                  <input type="text" v-model="familyForm.no_bpjs" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;" placeholder="13 digit No. BPJS">
                </div>
              </div>

              <div class="form-group">
                <label style="margin-bottom: 0.15rem;">Tanggal Lahir</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-calendar-alt"></i>
                  <input type="date" v-model="familyForm.tgl_lahir" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;">
                </div>
              </div>

              <div class="form-group">
                <label style="margin-bottom: 0.15rem;">Pekerjaan</label>
                <div class="input-minimal-wrapper">
                  <i class="fas fa-briefcase"></i>
                  <input type="text" v-model="familyForm.pekerjaan" class="form-control-minimal-v2" style="padding: 0.5rem 1rem 0.5rem 2.5rem;" placeholder="PNS, Swasta, dll">
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer-modern">
          <button class="btn-cancel-flat" @click="closeFamilyModal">Batal</button>
          <button 
            class="btn-save-premium" 
            @click="handleAddFamily" 
            :disabled="isSubmittingFamily || !familyForm.nama"
          >
            <i v-if="isSubmittingFamily" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-check-circle mr-2"></i>
            {{ isSubmittingFamily ? 'Menyimpan...' : 'Simpan Anggota' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { pegawaiService } from '../services/pegawaiService'
import bpjsVclaimService from '../services/bpjsVclaimService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import config from '../config/api'

const authStore = useAuthStore()
const toast = useToast()

const profileData = computed(() => {
  return authStore.user?.data?.detail || authStore.user?.detail || {}
})

const emailToUpdate = ref('')
const telpToUpdate = ref('')
const alamatToUpdate = ref('')
const sttsNikahToUpdate = ref('')

const nomorStrToUpdate = ref('')
const tanggalStrToUpdate = ref('')
const tanggalAkhirStrToUpdate = ref('')
const nomorSipToUpdate = ref('')
const tanggalIzinPraktekToUpdate = ref('')

const emailError = ref('')
const telpError = ref('')
const alamatError = ref('')
const sttsNikahError = ref('')

const submitting = ref(false)
const loading = ref(true)
const isEditing = ref(false)

const isDataChanged = computed(() => {
  const currentEmail = profileData.value.email_resmi || ''
  const currentTelp = profileData.value.no_telp || ''
  const currentAlamat = profileData.value.alamat || ''
  const currentSttsNikah = profileData.value.stts_nikah || 'SINGLE'
  
  let changed = emailToUpdate.value !== currentEmail || 
         telpToUpdate.value !== currentTelp || 
         alamatToUpdate.value !== currentAlamat ||
         sttsNikahToUpdate.value !== currentSttsNikah

  if (profileData.value.kualifikasi_staf) {
    const k = profileData.value.kualifikasi_staf
    changed = changed || 
      nomorStrToUpdate.value !== (k.nomor_str || '') ||
      tanggalStrToUpdate.value !== (k.tanggal_str || '') ||
      tanggalAkhirStrToUpdate.value !== (k.tanggal_akhir_str || '') ||
      nomorSipToUpdate.value !== (k.nomor_sip || '') ||
      tanggalIzinPraktekToUpdate.value !== (k.tanggal_izin_praktek || '')
  }

  return changed
})

const familyMembers = computed(() => profileData.value.keluarga || [])
const showAddFamilyModal = ref(false)
const isSubmittingFamily = ref(false)
const isSearchingVclaim = ref(false)
const vclaimQuery = ref('')

const familyForm = reactive({
  nama: '', hubungan: 'Anak', no_ktp: '', no_bpjs: '', tgl_lahir: '', jk: 'L', pekerjaan: '', keterangan: ''
})

const calculateAge = (tglLahir) => {
  if (!tglLahir) return '-'
  const birth = new Date(tglLahir)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return `${age} Th`
}

const lookupVclaim = async () => {
    if (!vclaimQuery.value) return
    isSearchingVclaim.value = true
    try {
        const today = new Date().toISOString().split('T')[0]
        let res = vclaimQuery.value.length === 16 
          ? await bpjsVclaimService.getPesertaByNik(vclaimQuery.value, today)
          : await bpjsVclaimService.getPesertaByNoKartu(vclaimQuery.value, today)
        
        if (res.data?.response?.peserta) {
            const p = res.data.response.peserta
            familyForm.nama = p.nama
            familyForm.no_ktp = p.nik
            familyForm.no_bpjs = p.noKartu
            familyForm.tgl_lahir = p.tglLahir
            familyForm.jk = p.sex === 'L' ? 'L' : 'P'
            toast.success('Data ditemukan!')
        } else {
            toast.warning(res.data?.metaData?.message || 'Tidak ditemukan')
        }
    } catch (e) { toast.error('Gagal akses VClaim') } finally { isSearchingVclaim.value = false }
}

const closeFamilyModal = () => {
  showAddFamilyModal.value = false
  Object.assign(familyForm, { nama: '', hubungan: 'Anak', no_ktp: '', no_bpjs: '', tgl_lahir: '', jk: 'L', pekerjaan: '', keterangan: '' })
}

const handleAddFamily = async () => {
  if (!familyForm.nama) return
  isSubmittingFamily.value = true
  try {
    const res = await pegawaiService.addFamilyMember(profileData.value.nik, familyForm)
    if (res.data.success) {
      toast.success('Berhasil ditambahkan')
      await authStore.refreshUserData()
      closeFamilyModal()
    }
  } catch (e) { toast.error('Gagal tambah keluarga') } finally { isSubmittingFamily.value = false }
}

const confirmDeleteMember = (member) => {
  Swal.fire({
    title: 'Hapus Keluarga?',
    text: `Hapus ${member.nama}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await pegawaiService.deleteFamilyMember(profileData.value.nik, member.id)
        if (res.data.success) {
          toast.success('Berhasil dihapus')
          await authStore.refreshUserData()
        }
      } catch (e) { toast.error('Gagal hapus data') }
    }
  })
}

const getPhotoUrl = (photo) => {
  if (!photo) return ''
  return `${config.public.PHOTO_URL}${photo}`
}

const isFemale = (jk) => {
  if (!jk) return false
  return jk === 'P' || jk === 'Perempuan' || jk === 'Wanita'
}

const formatGender = (jk) => {
  if (!jk) return '-'
  return isFemale(jk) ? 'Perempuan' : 'Laki-laki'
}
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatToInputDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const validateEmail = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailToUpdate.value ? 'Email wajib diisi' : (!regex.test(emailToUpdate.value) ? 'Format tidak valid' : '')
  return !emailError.value
}

const validateTelp = () => {
  telpError.value = !telpToUpdate.value ? 'No Telp wajib diisi' : (!/^\d{11,13}$/.test(telpToUpdate.value) ? '11-13 digit' : '')
  return !telpError.value
}

const validateAlamat = () => {
  alamatError.value = !alamatToUpdate.value ? 'Alamat wajib diisi' : ''
  return !alamatError.value
}

const startEditing = () => isEditing.value = true
const cancelEditing = () => {
  emailToUpdate.value = profileData.value.email_resmi || ''
  telpToUpdate.value = profileData.value.no_telp || ''
  alamatToUpdate.value = profileData.value.alamat || ''
  sttsNikahToUpdate.value = profileData.value.stts_nikah || 'SINGLE'
  if (profileData.value.kualifikasi_staf) {
    const k = profileData.value.kualifikasi_staf
    nomorStrToUpdate.value = k.nomor_str || ''
    tanggalStrToUpdate.value = formatToInputDate(k.tanggal_str)
    tanggalAkhirStrToUpdate.value = formatToInputDate(k.tanggal_akhir_str)
    nomorSipToUpdate.value = k.nomor_sip || ''
    tanggalIzinPraktekToUpdate.value = formatToInputDate(k.tanggal_izin_praktek)
  }
  emailError.value = telpError.value = alamatError.value = sttsNikahError.value = ''
  isEditing.value = false
}

const handleUpdateProfile = async () => {
  if (!validateEmail() || !validateTelp() || !validateAlamat()) return
  submitting.value = true
  try {
    const data = { email: emailToUpdate.value, no_telp: telpToUpdate.value, alamat: alamatToUpdate.value, stts_nikah: sttsNikahToUpdate.value }
    if (profileData.value.kualifikasi_staf) {
      data.nomor_str = nomorStrToUpdate.value
      data.tanggal_str = tanggalStrToUpdate.value
      data.tanggal_akhir_str = tanggalAkhirStrToUpdate.value
      data.nomor_sip = nomorSipToUpdate.value
      data.tanggal_izin_praktek = tanggalIzinPraktekToUpdate.value
    }
    const res = await pegawaiService.updateProfile(data)
    if (res.data.success) {
      toast.success('Profil diperbarui')
      await authStore.refreshUserData()
      isEditing.value = false
    }
  } catch (e) { toast.error('Gagal update data') } finally { submitting.value = false }
}

onMounted(async () => {
  loading.value = true
  try {
    await authStore.refreshUserData()
    emailToUpdate.value = profileData.value.email_resmi || ''
    telpToUpdate.value = profileData.value.no_telp || ''
    alamatToUpdate.value = profileData.value.alamat || ''
    sttsNikahToUpdate.value = profileData.value.stts_nikah || 'SINGLE'
    if (profileData.value.kualifikasi_staf) {
      const k = profileData.value.kualifikasi_staf
      nomorStrToUpdate.value = k.nomor_str || ''
      tanggalStrToUpdate.value = formatToInputDate(k.tanggal_str)
      tanggalAkhirStrToUpdate.value = formatToInputDate(k.tanggal_akhir_str)
      nomorSipToUpdate.value = k.nomor_sip || ''
      tanggalIzinPraktekToUpdate.value = formatToInputDate(k.tanggal_izin_praktek)
    }
  } catch (e) {} finally { loading.value = false }
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 2rem 5rem;
  background: linear-gradient(145deg, #f8fafc 0%, #eff6ff 100%);
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-container {
  width: 100%;
  max-width: 1550px;
  margin: 0 auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

/* Sidebar Styles */
.sidebar-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.avatar-blue { background: #eff6ff; color: #3b82f6; }
.avatar-pink { background: #fff1f2; color: #f43f5e; }

.user-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.user-role {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem;
}

.dept-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.sidebar-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 2rem 0;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.status-active {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Main Content Styles */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
  color: #64748b;
}

.color-primary .section-icon { color: #3b82f6; }
.color-success .section-icon { color: #10b981; }

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card-glass {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.p-6 { padding: 2rem; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

label.required::after {
  content: " *";
  color: #ef4444;
}

.display-box {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-weight: 500;
  border: 1px solid #f1f5f9;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.form-control-minimal {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s;
}

.form-control-minimal.border {
  border-color: #e2e8f0;
  background: white;
  padding-left: 1rem;
}

.is-editing .form-control-minimal {
  background: white;
  border-color: #e2e8f0;
}

.is-editing .form-control-minimal:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.has-error .form-control-minimal { border-color: #f43f5e; }

.error-text { color: #f43f5e; font-size: 0.75rem; font-weight: 600; }

/* Family Table */
.family-table-container { width: 100%; overflow-x: auto; }
.family-table { width: 100%; border-collapse: collapse; }
.family-table th {
  text-align: left; padding: 1rem 2rem; background: #f8fafc;
  font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;
}
.family-table td { padding: 1rem 2rem; border-bottom: 1px solid #f1f5f9; }
.family-table tr:last-child td { border-bottom: none; }

.flex-align { display: flex; align-items: center; }

.mini-avatar {
  width: 32px; height: 32px; border-radius: 8px; display: flex;
  align-items: center; justify-content: center; margin-right: 1rem;
}

.badge-soft {
  background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem;
  border-radius: 6px; font-weight: 700; font-size: 0.7rem;
}

.btn-icon-danger {
  width: 32px; height: 32px; border: none; background: #fff1f2;
  color: #f43f5e; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.btn-icon-danger:hover { background: #f43f5e; color: white; }

/* Helper Classes */
.bg-gradient-info { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.w-100 { width: 100%; }
.text-white-50 { color: rgba(255,255,255,0.7); }
.font-weight-bold { font-weight: 700; }

.btn-primary-edit {
  background: #3b82f6; color: white; border: none; padding: 0.8rem;
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}
.btn-primary-edit:hover { background: #2563eb; transform: translateY(-1px); }

.btn-save {
  background: #0f172a; color: white; border: none; padding: 0.8rem;
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-save:hover:not(:disabled) { background: #1e293b; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline-cancel {
  background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 0.8rem;
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-outline-cancel:hover { background: #f8fafc; color: #1e293b; }

.btn-add-mini {
  background: #10b981; color: white; border: none; padding: 0.4rem 1rem;
  border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
}

.stat-item { display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 1.5rem; opacity: 0.8; }
.stat-content { display: flex; flex-direction: column; }
.stat-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
.stat-value { font-weight: 700; font-size: 1rem; }

.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Modal tweaks */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-container {
  background: white; border-radius: 2rem; width: 600px; max-width: 95vw;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}
.modal-header { padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
.modal-body { padding: 1rem 2rem; }
.modal-footer { padding: 1.5rem 2rem; background: #f8fafc; border-bottom-left-radius: 2rem; border-bottom-right-radius: 2rem; }

.bpjs-lookup-box { background: #eff6ff; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #dbeafe; }
.query-input-wrapper { position: relative; flex: 1; display: flex; align-items: center; }
.query-icon { position: absolute; left: 1rem; color: #3b82f6; }
.query-input-wrapper input {
  width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border: 1px solid #dbeafe;
  border-radius: 12px; font-size: 0.9rem;
}
.lookup-form { display: flex; gap: 1rem; margin-top: 1rem; }
.btn-lookup-premium {
  background: #3b82f6; color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 700;
}
.header-with-icon {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bg-success-soft { background-color: #ecfdf5; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.bpjs-lookup-box-premium {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #bfdbfe;
}

.lookup-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.lookup-text {
  font-size: 0.85rem;
  color: #1e40af;
  margin-bottom: 1rem;
  font-weight: 500;
}

.lookup-form-group {
  display: flex;
  gap: 0.75rem;
}

.query-input-container {
  position: relative;
  flex: 1;
}

.query-input-container i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
}

.query-input-container input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid white;
  border-radius: 12px;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.btn-lookup-action {
  background: #1e293b;
  color: white;
  border: none;
  padding: 0 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-lookup-action:hover:not(:disabled) { background: #0f172a; }

.modern-form .form-group label {
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.input-minimal-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-minimal-wrapper i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.form-control-minimal-v2 {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-control-minimal-v2:focus {
  background: white;
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.modal-footer-modern {
  padding: 0.75rem 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
}

.btn-cancel-flat {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

.btn-save-premium {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-save-premium:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .form-grid-2 { grid-template-columns: 1fr; }
}
</style>
