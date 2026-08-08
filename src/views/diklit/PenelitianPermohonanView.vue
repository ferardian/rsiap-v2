<template>
  <div class="penelitian-permohonan-view">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="header-text">
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="header-icon-box">
              <i class="fas fa-microscope"></i>
            </div>
            <h2 class="page-title mb-0">Permohonan Data Penelitian & Riset</h2>
          </div>
          <p class="page-subtitle text-muted mb-0">Manajemen permohonan data RME, upload disposisi & pengeluaran izin akun ter-masking (MRMIK 1 EP e)</p>
        </div>

        <div class="header-actions d-flex align-items-center gap-2">
          <router-link to="/diklit/penelitian/laporan-sla" class="btn btn-action-secondary shadow-sm">
            <i class="fas fa-chart-line text-primary me-1"></i>
            <span>Laporan SLA (Akreditasi)</span>
          </router-link>
          <button class="btn btn-action-primary shadow-sm" @click="openCreateModal">
            <i class="fas fa-plus-circle me-1"></i>
            <span>Tambah Permohonan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon primary">
              <i class="fas fa-folder-open"></i>
            </div>
            <div>
              <div class="stat-label">Total Permohonan</div>
              <div class="stat-value">{{ items.length }}</div>
            </div>
          </div>
          <div class="stat-bar primary"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon warning">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div>
              <div class="stat-label">Diajukan / Pending</div>
              <div class="stat-value">{{ items.filter(i => i.status === 'diajukan').length }}</div>
            </div>
          </div>
          <div class="stat-bar warning"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon info">
              <i class="fas fa-spinner"></i>
            </div>
            <div>
              <div class="stat-label">Diproses / Disetujui</div>
              <div class="stat-value">{{ items.filter(i => ['disetujui', 'diproses'].includes(i.status)).length }}</div>
            </div>
          </div>
          <div class="stat-bar info"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <div class="stat-label">Selesai (Tepat Waktu)</div>
              <div class="stat-value">{{ items.filter(i => i.is_tepat_waktu === 'Y').length }}</div>
            </div>
          </div>
          <div class="stat-bar success"></div>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="card toolbar-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <div class="search-input-wrapper flex-grow-1">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-control search-input" 
                v-model="filters.search" 
                placeholder="Cari No. Surat, Judul, Peneliti, atau Institusi..."
                @keyup.enter="fetchData"
              >
              <button v-if="filters.search" class="btn-clear-search" @click="filters.search = ''; fetchData()">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="filter-select-wrapper">
              <select class="form-select filter-select" v-model="filters.status" @change="fetchData">
                <option value="">Semua Status</option>
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div>
            <button class="btn btn-refresh-premium shadow-sm" @click="fetchData" :disabled="loading">
              <i :class="['fas fa-sync-alt me-1', { 'fa-spin': loading }]"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="card table-card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table-premium">
            <thead>
              <tr>
                <th class="ps-4">No. Surat & Tgl</th>
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
                  <div class="shimmer-line mb-2"></div>
                  <div class="shimmer-line w-75 mx-auto"></div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-5 text-center">
                  <div class="empty-icon-box mx-auto mb-2">
                    <i class="fas fa-folder-open"></i>
                  </div>
                  <p class="fw-semibold text-secondary mb-1">Belum Ada Permohonan Penelitian</p>
                  <p class="text-xs text-muted">Klik tombol "+ Tambah Permohonan" untuk memasukkan data baru</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.id" class="hover-row">
                <td class="ps-4">
                  <div class="fw-bold text-dark font-mono text-sm">{{ item.no_surat }}</div>
                  <div class="text-xs text-muted mt-1">
                    <i class="fas fa-calendar-alt text-primary me-1"></i> {{ formatDate(item.tgl_pengajuan) }}
                  </div>
                </td>
                <td class="max-w-title">
                  <div class="fw-bold text-primary title-text">{{ item.judul_penelitian }}</div>
                  <div class="d-flex align-items-center gap-1 mt-1">
                    <span class="badge badge-institusi">{{ item.institusi }}</span>
                  </div>
                  <div v-if="item.kriteria_diagnosa" class="text-xs text-muted mt-1">
                    <i class="fas fa-stethoscope text-info me-1"></i> {{ item.kriteria_diagnosa }}
                  </div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nama_peneliti }}</div>
                  <div class="text-xs text-muted mt-1">
                    <span v-if="item.no_hp" class="me-2"><i class="fas fa-phone text-success me-1"></i> {{ item.no_hp }}</span>
                    <span v-if="item.email"><i class="fas fa-envelope text-warning me-1"></i> {{ item.email }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <a v-if="item.file_surat_permohonan" :href="getFileUrl(item.file_surat_permohonan)" target="_blank" class="btn btn-doc success">
                      <i class="fas fa-file-pdf me-1"></i> Surat Pengajuan
                    </a>
                    <span v-else class="text-xs text-muted fst-italic">Surat: Belum ada</span>

                    <a v-if="item.file_disposisi" :href="getFileUrl(item.file_disposisi)" target="_blank" class="btn btn-doc primary">
                      <i class="fas fa-file-signature me-1"></i> Disposisi Direktur
                    </a>
                    <button v-else class="btn btn-doc warning" @click="openDisposisiModal(item)">
                      <i class="fas fa-upload me-1"></i> Upload Disposisi
                    </button>
                  </div>
                </td>
                <td>
                  <div class="mb-1">
                    <span :class="getStatusBadgeClass(item.status)">{{ item.status.toUpperCase() }}</span>
                  </div>
                  <div v-if="item.is_tepat_waktu" class="text-xs mt-1">
                    <span v-if="item.is_tepat_waktu === 'Y'" class="text-success fw-bold">
                      <i class="fas fa-check-circle me-1"></i> Tepat Waktu ({{ item.sla_hari }} hr)
                    </span>
                    <span v-else class="text-danger fw-bold">
                      <i class="fas fa-exclamation-triangle me-1"></i> Terlambat ({{ item.sla_hari }} hr)
                    </span>
                  </div>
                </td>
                <td class="pe-4 text-end">
                  <div class="d-inline-flex gap-1">
                    <button class="btn btn-icon btn-key" @click="openGenerateModal(item)" title="Penerbitan Akun Portal Peneliti">
                      <i class="fas fa-key me-1"></i> Akun Portal
                    </button>
                    <button class="btn btn-icon btn-edit" @click="openEditModal(item)" title="Edit Permohonan">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-icon btn-delete" @click="deleteItem(item)" title="Hapus">
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

    <!-- Create / Edit Modal -->
    <div class="modal fade" id="formModal" tabindex="-1" ref="formModalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header modal-header-gradient text-white">
            <div class="d-flex align-items-center gap-2">
              <div class="modal-header-icon">
                <i :class="isEdit ? 'fas fa-edit' : 'fas fa-folder-plus'"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold mb-0">{{ isEdit ? 'Edit Permohonan Penelitian' : 'Tambah Permohonan Penelitian Baru' }}</h5>
                <p class="text-xs text-white-50 mb-0">Isi kelengkapan informasi permohonan data dan berkas pengajuan</p>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="savePermohonan">
            <div class="modal-body p-4">
              <!-- Section 1: Informasi Surat -->
              <div class="form-section-label">
                <i class="fas fa-file-alt text-primary me-2"></i> Informasi Surat Pengajuan
              </div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label-custom">No. Surat Permohonan <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-custom" v-model="form.no_surat" required placeholder="Contoh: 012/UNIV/III/2026">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Tanggal Surat Masuk <span class="text-danger">*</span></label>
                  <input type="date" class="form-control form-control-custom" v-model="form.tgl_pengajuan" required>
                </div>
                <div class="col-md-12">
                  <label class="form-label-custom">Judul Penelitian / Riset <span class="text-danger">*</span></label>
                  <textarea class="form-control form-control-custom" v-model="form.judul_penelitian" rows="2" required placeholder="Judul skripsi / tesis / penelitian..."></textarea>
                </div>
              </div>

              <!-- Section 2: Peneliti & Kampus -->
              <div class="form-section-label">
                <i class="fas fa-user-graduate text-success me-2"></i> Data Peneliti & Institusi
              </div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label-custom">Nama Peneliti / Mahasiswa <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-custom" v-model="form.nama_peneliti" required placeholder="Nama lengkap peneliti">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Institusi / Universitas <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-custom" v-model="form.institusi" required placeholder="Nama universitas / kampus">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">No. HP / WhatsApp</label>
                  <input type="text" class="form-control form-control-custom" v-model="form.no_hp" placeholder="08xxxxxxxx">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Email</label>
                  <input type="email" class="form-control form-control-custom" v-model="form.email" placeholder="peneliti@email.com">
                </div>
              </div>

              <!-- Section 3: Parameter Rekam Medis -->
              <div class="form-section-label">
                <i class="fas fa-notes-medical text-info me-2"></i> Kriteria Data Rekam Medis
              </div>
              <div class="row g-3 mb-3">
                <div class="col-md-12">
                  <label class="form-label-custom">Kriteria Diagnosa / Kategori Data</label>
                  <input type="text" class="form-control form-control-custom" v-model="form.kriteria_diagnosa" placeholder="Misal: Pasien Preeklampsia (O14), Rawat Inap 2025">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Rentang Tanggal Rekam Medis (Awal)</label>
                  <input type="date" class="form-control form-control-custom" v-model="form.rentang_tgl_awal">
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Rentang Tanggal Rekam Medis (Akhir)</label>
                  <input type="date" class="form-control form-control-custom" v-model="form.rentang_tgl_akhir">
                </div>

                <div class="col-md-6" v-if="isEdit">
                  <label class="form-label-custom">Tanggal Data Selesai Disediakan</label>
                  <input type="date" class="form-control form-control-custom" v-model="form.tgl_data_selesai">
                  <span class="text-xs text-muted">Diisi saat data telah selesai diserahkan</span>
                </div>
                <div class="col-md-6" v-if="isEdit">
                  <label class="form-label-custom">Status Permohonan</label>
                  <select class="form-select form-control-custom" v-model="form.status">
                    <option value="diajukan">Diajukan</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>

                <div class="col-md-12">
                  <label class="form-label-custom">Upload Softcopy Surat Permohonan (PDF / Gambar)</label>
                  <input type="file" class="form-control form-control-custom" @change="onFileSuratChange" accept=".pdf,.jpg,.jpeg,.png">
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light p-3">
              <button type="button" class="btn btn-modal-cancel" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-modal-save" :disabled="saving">
                <i :class="['fas me-1', saving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
                <span>{{ saving ? 'Menyimpan...' : 'Simpan Permohonan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Disposisi Modal -->
    <div class="modal fade" id="disposisiModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-gradient-success text-white">
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-file-signature fa-lg"></i>
              <h5 class="modal-title fw-bold mb-0">Upload Disposisi Direktur</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveDisposisi">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label-custom">Tanggal Disposisi / Disetujui <span class="text-danger">*</span></label>
                <input type="date" class="form-control form-control-custom" v-model="disposisiForm.tgl_disposisi" required>
              </div>
              <div class="mb-3">
                <label class="form-label-custom">File Berkas Disposisi (PDF / Gambar) <span class="text-danger">*</span></label>
                <input type="file" class="form-control form-control-custom" @change="onFileDisposisiChange" accept=".pdf,.jpg,.jpeg,.png" required>
              </div>
            </div>
            <div class="modal-footer bg-light p-3">
              <button type="button" class="btn btn-modal-cancel" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-bold" :disabled="saving">
                <i :class="['fas me-1', saving ? 'fa-spinner fa-spin' : 'fa-upload']"></i> Upload Disposisi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Generate Account Modal -->
    <div class="modal fade" id="generateModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-gradient-dark text-white">
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-key fa-lg"></i>
              <h5 class="modal-title fw-bold mb-0">Penerbitan Akun Portal Peneliti</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveGenerateAccess">
            <div class="modal-body p-4">
              <div class="alert alert-info border-0 rounded-3 text-xs mb-3">
                <i class="fas fa-info-circle me-1"></i> Akun ini digunakan peneliti untuk login ke portal data RME ter-masking (tanpa identitas pribadi pasien).
              </div>
              
              <div class="mb-3">
                <label class="form-label-custom">Username Login <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-custom" v-model="accountForm.username" required placeholder="misal: peneliti_mhs123">
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Password <span class="text-danger">*</span></label>
                <input type="password" class="form-control form-control-custom" v-model="accountForm.password" required minlength="6" placeholder="Minimal 6 karakter">
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Masa Berlaku Akses s/d <span class="text-danger">*</span></label>
                <input type="date" class="form-control form-control-custom" v-model="accountForm.valid_until" required>
              </div>
            </div>
            <div class="modal-footer bg-light p-3">
              <button type="button" class="btn btn-modal-cancel" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-dark px-4 rounded-3 fw-bold" :disabled="saving">
                <i :class="['fas me-1', saving ? 'fa-spinner fa-spin' : 'fa-check-circle']"></i> Terbitkan Akun
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
        diajukan: 'badge badge-status bg-warning-subtle text-warning-emphasis border border-warning',
        disetujui: 'badge badge-status bg-info-subtle text-info-emphasis border border-info',
        diproses: 'badge badge-status bg-primary-subtle text-primary-emphasis border border-primary',
        selesai: 'badge badge-status bg-success-subtle text-success-emphasis border border-success',
        ditolak: 'badge badge-status bg-danger-subtle text-danger-emphasis border border-danger'
      }
      return map[status] || 'badge badge-status bg-secondary-subtle text-secondary-emphasis'
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
/* Page Layout */
.penelitian-permohonan-view {
  padding-bottom: 2rem;
}

/* Header & Icon */
.header-icon-box {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.35rem;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
}

/* Header Action Buttons */
.btn-action-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-action-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-action-secondary {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-action-secondary:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

/* Stat Cards */
.stat-card {
  position: relative;
  transition: transform 0.2s ease;
  background: white;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.stat-icon.primary { background: #eff6ff; color: #3b82f6; }
.stat-icon.warning { background: #fffbeb; color: #d97706; }
.stat-icon.info { background: #ecfeff; color: #0891b2; }
.stat-icon.success { background: #ecfdf5; color: #10b981; }

.stat-label {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.stat-bar.primary { background: #3b82f6; }
.stat-bar.warning { background: #d97706; }
.stat-bar.info { background: #0891b2; }
.stat-bar.success { background: #10b981; }

/* Toolbar */
.toolbar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0 !important;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.search-input {
  padding-left: 2.75rem;
  padding-right: 2.5rem;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  background: #f8fafc;
}

.search-input:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.filter-select-wrapper {
  min-width: 160px;
}

.filter-select {
  height: 44px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  background-color: #f8fafc;
  font-weight: 500;
}

.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-refresh-premium {
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 12px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-refresh-premium:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
}

/* Table */
.custom-table-premium thead th {
  background: #f8fafc;
  padding: 1.1rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.hover-row { transition: background 0.15s ease; }
.hover-row:hover { background-color: #f8fafc; }

.max-w-title { max-width: 320px; }

.title-text {
  font-size: 0.9rem;
  line-height: 1.35;
}

.badge-institusi {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-status {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 4px 10px;
  border-radius: 8px;
}

/* Document Buttons */
.btn-doc {
  padding: 4px 10px;
  font-size: 0.725rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  transition: all 0.2s ease;
}
.btn-doc.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.btn-doc.success:hover { background: #10b981; color: white; }
.btn-doc.primary { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.btn-doc.primary:hover { background: #3b82f6; color: white; }
.btn-doc.warning { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; cursor: pointer; }
.btn-doc.warning:hover { background: #f59e0b; color: white; }

/* Action Icon Buttons */
.btn-icon {
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  font-size: 0.775rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.btn-key { background: #f8fafc; color: #3b82f6; border-color: #cbd5e1; }
.btn-key:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

.btn-edit { background: #f8fafc; color: #d97706; border-color: #cbd5e1; }
.btn-edit:hover { background: #f59e0b; color: white; border-color: #f59e0b; }

.btn-delete { background: #f8fafc; color: #ef4444; border-color: #cbd5e1; }
.btn-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

/* Modals Modern Styling */
.modal-header-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 1.25rem 1.5rem;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.modal-header-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.form-section-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.form-label-custom {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
}

.form-control-custom {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  padding: 0.6rem 0.85rem;
}

.form-control-custom:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-modal-cancel {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
}
.btn-modal-cancel:hover { background: #e2e8f0; color: #1e293b; }

.btn-modal-save {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.btn-modal-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Shimmer Loading */
.shimmer-line {
  height: 18px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
