<template>
  <div class="penelitian-permohonan-view">
    <!-- Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="header-icon-box">
            <i class="fas fa-microscope"></i>
          </div>
          <h2 class="page-title mb-0">Permohonan Data Penelitian & Riset</h2>
        </div>
        <p class="page-subtitle text-muted mb-0">Manajemen permohonan data RME, upload disposisi & pengeluaran izin akun ter-masking (MRMIK 1 EP e)</p>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/diklit/penelitian/laporan-sla" class="btn btn-outline-primary rounded-3 shadow-sm px-3 d-flex align-items-center gap-2">
          <i class="fas fa-chart-line"></i>
          <span>Laporan SLA (Akreditasi)</span>
        </router-link>
        <button class="btn btn-primary rounded-3 shadow-sm px-3 d-flex align-items-center gap-2" @click="openCreateModal">
          <i class="fas fa-plus-circle"></i>
          <span>Tambah Permohonan</span>
        </button>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0 ps-0" 
                v-model="filters.search" 
                placeholder="Cari No. Surat, Judul, Peneliti, atau Institusi..."
                @keyup.enter="fetchData"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filters.status" @change="fetchData">
              <option value="">-- Semua Status --</option>
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-light rounded-3 shadow-sm me-2" @click="fetchData" :disabled="loading">
              <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i> Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th class="ps-4">No. Surat & Tanggal</th>
                <th>Judul Penelitian & Institusi</th>
                <th>Peneliti & Kontak</th>
                <th>Dokumen Berkas</th>
                <th>Status & SLA</th>
                <th class="pe-4 text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="n in 4" :key="n">
                <td colspan="6" class="p-4 text-center">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div> Memuat data...
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                  Belum ada data permohonan penelitian
                </td>
              </tr>
              <tr v-for="item in items" :key="item.id">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ item.no_surat }}</div>
                  <div class="text-xs text-muted">
                    <i class="fas fa-calendar-alt me-1"></i> {{ formatDate(item.tgl_pengajuan) }}
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-primary mb-1">{{ item.judul_penelitian }}</div>
                  <span class="badge bg-light text-secondary border text-xs">{{ item.institusi }}</span>
                  <div v-if="item.kriteria_diagnosa" class="text-xs text-muted mt-1">
                    <i class="fas fa-stethoscope me-1"></i> {{ item.kriteria_diagnosa }}
                  </div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nama_peneliti }}</div>
                  <div class="text-xs text-muted" v-if="item.no_hp || item.email">
                    <span v-if="item.no_hp" class="me-2"><i class="fas fa-phone me-1"></i> {{ item.no_hp }}</span>
                    <span v-if="item.email"><i class="fas fa-envelope me-1"></i> {{ item.email }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <a v-if="item.file_surat_permohonan" :href="getFileUrl(item.file_surat_permohonan)" target="_blank" class="btn btn-xs btn-outline-info rounded-pill text-nowrap">
                      <i class="fas fa-file-pdf me-1"></i> Surat Pengajuan
                    </a>
                    <span v-else class="text-xs text-muted italic">Surat: Belum ada</span>

                    <a v-if="item.file_disposisi" :href="getFileUrl(item.file_disposisi)" target="_blank" class="btn btn-xs btn-outline-success rounded-pill text-nowrap">
                      <i class="fas fa-file-signature me-1"></i> Disposisi Direktur
                    </a>
                    <button v-else class="btn btn-xs btn-outline-secondary rounded-pill text-nowrap" @click="openDisposisiModal(item)">
                      <i class="fas fa-upload me-1"></i> Upload Disposisi
                    </button>
                  </div>
                </td>
                <td>
                  <div class="mb-1">
                    <span :class="getStatusBadgeClass(item.status)">{{ item.status.toUpperCase() }}</span>
                  </div>
                  <div v-if="item.is_tepat_waktu" class="text-xs">
                    <span v-if="item.is_tepat_waktu === 'Y'" class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i> Tepat Waktu ({{ item.sla_hari }} hr)</span>
                    <span v-else class="text-danger fw-bold"><i class="fas fa-exclamation-triangle me-1"></i> Terlambat ({{ item.sla_hari }} hr)</span>
                  </div>
                </td>
                <td class="pe-4 text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="openGenerateModal(item)" title="Penerbitan Akun Peneliti">
                      <i class="fas fa-key"></i> Akun Portal
                    </button>
                    <button class="btn btn-sm btn-outline-warning" @click="openEditModal(item)" title="Edit Permohonan">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteItem(item)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="formModal" tabindex="-1" ref="formModalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-folder-plus me-2"></i> {{ isEdit ? 'Edit Permohonan Penelitian' : 'Tambah Permohonan Penelitian Baru' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="savePermohonan">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">No. Surat Permohonan <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.no_surat" required placeholder="Contoh: 012/UNIV/III/2026">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tanggal Surat Masuk <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="form.tgl_pengajuan" required>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold">Judul Penelitian / Riset <span class="text-danger">*</span></label>
                  <textarea class="form-control" v-model="form.judul_penelitian" rows="2" required placeholder="Judul skripsi / tesis / penelitian..."></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Nama Peneliti / Mahasiswa <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.nama_peneliti" required placeholder="Nama lengkap peneliti">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Institusi / Universitas <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.institusi" required placeholder="Nama universitas / kampus">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">No. HP / WhatsApp</label>
                  <input type="text" class="form-control" v-model="form.no_hp" placeholder="08xxxxxxxx">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email</label>
                  <input type="email" class="form-control" v-model="form.email" placeholder="peneliti@email.com">
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold">Kriteria Diagnosa / Kategori Data</label>
                  <input type="text" class="form-control" v-model="form.kriteria_diagnosa" placeholder="Misal: Pasien Preeklampsia (O14), Rawat Inap 2025">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Rentang Tanggal Rekam Medis (Awal)</label>
                  <input type="date" class="form-control" v-model="form.rentang_tgl_awal">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Rentang Tanggal Rekam Medis (Akhir)</label>
                  <input type="date" class="form-control" v-model="form.rentang_tgl_akhir">
                </div>

                <div class="col-md-6" v-if="isEdit">
                  <label class="form-label fw-semibold">Tanggal Data Selesai Disediakan</label>
                  <input type="date" class="form-control" v-model="form.tgl_data_selesai">
                  <small class="text-muted">Diisi jika data telah selesai diberikan ke peneliti</small>
                </div>
                <div class="col-md-6" v-if="isEdit">
                  <label class="form-label fw-semibold">Status Permohonan</label>
                  <select class="form-select" v-model="form.status">
                    <option value="diajukan">Diajukan</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>

                <div class="col-md-12">
                  <label class="form-label fw-semibold">Upload Softcopy Surat Permohonan (PDF/Gambar)</label>
                  <input type="file" class="form-control" @change="onFileSuratChange" accept=".pdf,.jpg,.jpeg,.png">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary rounded-3" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4" :disabled="saving">
                <i class="fas fa-save me-1"></i> {{ saving ? 'Menyimpan...' : 'Simpan Permohonan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Upload Disposisi Modal -->
    <div class="modal fade" id="disposisiModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-file-signature me-2"></i> Upload Disposisi Direktur</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveDisposisi">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Tanggal Disposisi / Disetujui</label>
                <input type="date" class="form-control" v-model="disposisiForm.tgl_disposisi" required>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">File Berkas Disposisi (PDF/Gambar) <span class="text-danger">*</span></label>
                <input type="file" class="form-control" @change="onFileDisposisiChange" accept=".pdf,.jpg,.jpeg,.png" required>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary rounded-3" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-success rounded-3 px-4" :disabled="saving">
                <i class="fas fa-upload me-1"></i> Upload Disposisi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Generate Account Modal -->
    <div class="modal fade" id="generateModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-key me-2"></i> Penerbitan Akun Portal Peneliti</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveGenerateAccess">
            <div class="modal-body">
              <p class="text-muted text-xs mb-3">Akun ini digunakan oleh peneliti untuk login ke portal RME ter-masking (tanpa identitas pribadi pasien).</p>
              
              <div class="mb-3">
                <label class="form-label fw-semibold">Username Login <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="accountForm.username" required placeholder="misal: peneliti_mhs123">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                <input type="password" class="form-control" v-model="accountForm.password" required minlength="6" placeholder="Minimal 6 karakter">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Masa Berlaku Akses s/d <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="accountForm.valid_until" required>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary rounded-3" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-dark rounded-3 px-4" :disabled="saving">
                <i class="fas fa-key me-1"></i> Terbitkan Akun
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import penelitianService from '@/services/penelitianService'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { Modal } from 'bootstrap'

export default {
  name: 'PenelitianPermohonanView',
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      isEdit: false,
      activeItem: null,
      filters: { search: '', status: '' },
      form: {
        id: null,
        no_surat: '',
        judul_penelitian: '',
        nama_peneliti: '',
        institusi: '',
        no_hp: '',
        email: '',
        tgl_pengajuan: dayjs().format('YYYY-MM-DD'),
        tgl_data_selesai: '',
        kriteria_diagnosa: '',
        rentang_tgl_awal: '',
        rentang_tgl_akhir: '',
        status: 'diajukan',
        file_surat_permohonan: null
      },
      disposisiForm: {
        id: null,
        tgl_disposisi: dayjs().format('YYYY-MM-DD'),
        file_disposisi: null
      },
      accountForm: {
        id: null,
        username: '',
        password: '',
        valid_until: dayjs().add(30, 'day').format('YYYY-MM-DD')
      },
      bsFormModal: null,
      bsDisposisiModal: null,
      bsGenerateModal: null
    }
  },
  mounted() {
    this.bsFormModal = new Modal(document.getElementById('formModal'))
    this.bsDisposisiModal = new Modal(document.getElementById('disposisiModal'))
    this.bsGenerateModal = new Modal(document.getElementById('generateModal'))
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await penelitianService.getPermohonan(this.filters)
        if (res.data.success) {
          this.items = res.data.data.data
        }
      } catch (err) {
        console.error('Fetch permohonan error:', err)
        Swal.fire('Error', 'Gagal mengambil data permohonan penelitian', 'error')
      } finally {
        this.loading = false
      }
    },

    formatDate(d) {
      if (!d) return '-'
      return dayjs(d).format('DD MMM YYYY')
    },

    getFileUrl(path) {
      if (!path) return '#'
      return `${process.env.VUE_APP_API_URL || ''}/${path}`
    },

    getStatusBadgeClass(status) {
      const map = {
        diajukan: 'badge bg-warning text-dark',
        disetujui: 'badge bg-info text-dark',
        diproses: 'badge bg-primary',
        selesai: 'badge bg-success',
        ditolak: 'badge bg-danger'
      }
      return map[status] || 'badge bg-secondary'
    },

    openCreateModal() {
      this.isEdit = false
      this.form = {
        id: null,
        no_surat: '',
        judul_penelitian: '',
        nama_peneliti: '',
        institusi: '',
        no_hp: '',
        email: '',
        tgl_pengajuan: dayjs().format('YYYY-MM-DD'),
        tgl_data_selesai: '',
        kriteria_diagnosa: '',
        rentang_tgl_awal: '',
        rentang_tgl_akhir: '',
        status: 'diajukan',
        file_surat_permohonan: null
      }
      this.bsFormModal.show()
    },

    openEditModal(item) {
      this.isEdit = true
      this.form = { ...item, file_surat_permohonan: null }
      this.bsFormModal.show()
    },

    onFileSuratChange(e) {
      this.form.file_surat_permohonan = e.target.files[0]
    },

    async savePermohonan() {
      this.saving = true
      try {
        const formData = new FormData()
        Object.keys(this.form).forEach(k => {
          if (this.form[k] !== null && this.form[k] !== undefined) {
            formData.append(k, this.form[k])
          }
        })

        let res
        if (this.isEdit) {
          res = await penelitianService.updatePermohonan(this.form.id, formData)
        } else {
          res = await penelitianService.createPermohonan(formData)
        }

        if (res.data.success) {
          Swal.fire('Berhasil', res.data.message, 'success')
          this.bsFormModal.hide()
          this.fetchData()
        }
      } catch (err) {
        console.error('Save error:', err)
        Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan permohonan', 'error')
      } finally {
        this.saving = false
      }
    },

    openDisposisiModal(item) {
      this.activeItem = item
      this.disposisiForm = {
        id: item.id,
        tgl_disposisi: dayjs().format('YYYY-MM-DD'),
        file_disposisi: null
      }
      this.bsDisposisiModal.show()
    },

    onFileDisposisiChange(e) {
      this.disposisiForm.file_disposisi = e.target.files[0]
    },

    async saveDisposisi() {
      if (!this.disposisiForm.file_disposisi) {
        return Swal.fire('Peringatan', 'Silakan pilih file berkas disposisi', 'warning')
      }

      this.saving = true
      try {
        const formData = new FormData()
        formData.append('file_disposisi', this.disposisiForm.file_disposisi)
        formData.append('tgl_disposisi', this.disposisiForm.tgl_disposisi)

        const res = await penelitianService.uploadDisposisi(this.disposisiForm.id, formData)
        if (res.data.success) {
          Swal.fire('Berhasil', 'File disposisi berhasil diunggah', 'success')
          this.bsDisposisiModal.hide()
          this.fetchData()
        }
      } catch (err) {
        console.error('Disposisi upload error:', err)
        Swal.fire('Error', err.response?.data?.message || 'Gagal mengunggah disposisi', 'error')
      } finally {
        this.saving = false
      }
    },

    openGenerateModal(item) {
      this.activeItem = item
      this.accountForm = {
        id: item.id,
        username: 'peneliti_' + item.id + '_' + dayjs().format('DDMM'),
        password: '',
        valid_until: dayjs().add(30, 'day').format('YYYY-MM-DD')
      }
      this.bsGenerateModal.show()
    },

    async saveGenerateAccess() {
      this.saving = true
      try {
        const res = await penelitianService.generateAccess(this.accountForm.id, this.accountForm)
        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Akun Peneliti Diterbitkan',
            html: `Username: <b>${res.data.data.username}</b><br>Berlaku s/d: <b>${dayjs(res.data.data.valid_until).format('DD-MM-YYYY')}</b>`
          })
          this.bsGenerateModal.hide()
          this.fetchData()
        }
      } catch (err) {
        console.error('Generate access error:', err)
        Swal.fire('Error', err.response?.data?.message || 'Gagal menerbitkan akun', 'error')
      } finally {
        this.saving = false
      }
    },

    async deleteItem(item) {
      const result = await Swal.fire({
        title: 'Hapus Permohonan?',
        text: `Hapus permohonan No. Surat ${item.no_surat}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus'
      })

      if (!result.isConfirmed) return

      try {
        const res = await penelitianService.deletePermohonan(item.id)
        if (res.data.success) {
          Swal.fire('Terhapus', res.data.message, 'success')
          this.fetchData()
        }
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data permohonan', 'error')
      }
    }
  }
}
</script>

<style scoped>
.header-icon-box {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.25rem;
}

.custom-table thead th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
}

.btn-xs {
  padding: 2px 8px;
  font-size: 0.7rem;
}
</style>
