<template>
  <div>
    <!-- Filters & Header Actions -->
    <div class="filter-card shadow-sm mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Periode Bulan</label>
          <input type="month" class="form-control" v-model="filters.bulan" @change="fetchData">
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-hospital me-1"></i> Unit / Ruang</label>
          <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Semua Unit"
            class="style-chooser"
            @update:modelValue="fetchData"
          />
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="fas fa-search me-1"></i> Cari Responden / Unit</label>
          <input type="text" class="form-control" v-model="filters.keyword" placeholder="Ketik nama staff..." @input="debounceFetch">
        </div>
        <div class="col-md-3">
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center fw-bold shadow-sm" style="height: 38px; border-radius: 8px; font-size: 0.85rem;" @click="openCreateModal">
              <i class="fas fa-plus me-1"></i> Tambah
            </button>
            <button class="btn btn-outline-primary d-flex align-items-center justify-content-center fw-bold shadow-sm" style="height: 38px; border-radius: 8px; font-size: 0.85rem;" @click="openTemplateModal">
              <i class="fas fa-sliders-h me-1"></i> Template
            </button>
            <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 38px; border-radius: 8px;" @click="fetchData" title="Refresh">
              <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table List -->
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-primary text-white">
              <tr>
                <th width="5%" class="text-center py-3">#</th>
                <th width="15%" class="text-center">Tanggal</th>
                <th width="20%">Unit / Ruang</th>
                <th width="20%">Responden</th>
                <th width="20%" class="text-center">Kepatuhan Unsur</th>
                <th width="20%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 text-muted">Memuat data supervisi...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
                  <p>Tidak ada data supervisi implikasi pada periode ini.</p>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="item.id">
                <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td class="text-center fw-bold text-secondary">{{ formatDate(item.tgl_supervisi) }}</td>
                <td>
                  <span class="badge bg-info-subtle text-info border-info-subtle small fw-bold px-3">
                    <i class="fas fa-hospital-user me-1"></i> {{ item.departemen?.nama || item.dep_id }}
                  </span>
                </td>
                <td class="fw-bold text-dark">{{ item.nama_responden }}</td>
                <td class="text-center">
                  <div class="d-flex flex-column align-items-center">
                    <span class="badge rounded-pill px-3" :class="getScoreClass(calculateCompliance(item))" style="font-size: 0.8rem;">
                      {{ calculateCompliance(item) }} % Ya
                    </span>
                    <small class="text-muted mt-1" style="font-size: 0.7rem;">
                      Mutu: {{ countCategoryYa(item, 'MUTU') }}/7 • 
                      Pasien: {{ countCategoryYa(item, 'KESELAMATAN PASIEN') }}/2 • 
                      Risiko: {{ countCategoryYa(item, 'MANAJEMEN RISIKO') }}/2
                    </small>
                  </div>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button class="btn btn-sm btn-info text-white fw-bold" @click="exportToPDF(item)" title="Cetak PDF">
                      <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-sm btn-warning text-white fw-bold" @click="openEditModal(item)" title="Edit Supervisi">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger fw-bold" @click="confirmDelete(item)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="small text-muted">
            Menampilkan <strong>{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }}</strong> dari <strong>{{ total }}</strong> data
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination pagination-sm mb-0 custom-pagination">
              <li class="page-item" :class="{ disabled: page === 1 }">
                <button class="page-link" @click="changePage(page - 1)"><i class="fas fa-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="p in displayedPages" :key="p" :class="{ active: page === p, disabled: p === '...' }">
                <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{ disabled: page === totalPages }">
                <button class="page-link" @click="changePage(page + 1)"><i class="fas fa-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <Teleport to="body">
      <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content-large glass-card shadow-lg">
          <div class="modal-header-premium p-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="m-0 fw-bold text-white">
                <i class="fas fa-clipboard-check me-2"></i>{{ isEditMode ? 'Edit Lembar Supervisi' : 'Buat Supervisi Baru' }}
              </h5>
              <small class="text-white-50">Cek List Monitoring Implikasi Indikator Mutu, Keselamatan Pasien & Manajemen Risiko</small>
            </div>
            <button class="btn-close-premium text-white" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body p-4">
            <!-- Header Inputs -->
            <div class="row g-2 mb-3 p-2 bg-light rounded-3 align-items-end" style="font-size: 0.85rem;">
              <div class="col-md-6 text-start">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Unit Kerja / Ruang</label>
                <v-select 
                  :options="units" 
                  label="nama_ruang" 
                  v-model="form.dep_id"
                  :reduce="unit => unit.dep_id"
                  placeholder="Pilih Unit Kerja"
                  class="style-chooser style-chooser-sm"
                />
              </div>
              <div class="col-md-6 text-start">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Nama Responden</label>
                <v-select 
                  :options="staffList" 
                  label="nama" 
                  v-model="form.nama_responden"
                  :reduce="s => s.nama"
                  placeholder="Cari nama karyawan..."
                  class="style-chooser style-chooser-sm"
                />
              </div>
              <div class="col-md-6 text-start mt-2">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Supervisor (Komite Mutu)</label>
                <v-select 
                  :options="committeeMembers" 
                  label="nama" 
                  v-model="form.nik_supervisor"
                  :reduce="m => m.nik"
                  placeholder="Pilih Supervisor Komite Mutu..."
                  class="style-chooser style-chooser-sm"
                />
              </div>
              <div class="col-md-3 text-start mt-2">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Periode Bulan</label>
                <input type="month" class="form-control form-control-sm" v-model="form.bulan">
              </div>
              <div class="col-md-3 text-start mt-2">
                <label class="form-label fw-bold text-secondary mb-1" style="font-size: 0.8rem;">Tanggal Supervisi</label>
                <input type="date" class="form-control form-control-sm" v-model="form.tgl_supervisi">
              </div>
            </div>

            <!-- Question Checklist Table -->
            <div class="table-responsive">
              <table class="table table-bordered align-middle compact-table">
                <thead class="table-dark">
                  <tr>
                    <th width="5%" class="text-center">NO</th>
                    <th width="55%">UNSUR YANG DISUPERVISI</th>
                    <th width="15%" class="text-center">JAWABAN</th>
                    <th width="25%">TEMUAN MASALAH</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Category MUTU -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-chart-line me-2"></i>I. INDIKATOR MUTU</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'MUTU')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>

                  <!-- Category KESELAMATAN PASIEN -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-user-shield me-2"></i>II. KESELAMATAN PASIEN</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'KESELAMATAN PASIEN')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>

                  <!-- Category MANAJEMEN RISIKO -->
                  <tr class="table-secondary">
                    <td colspan="4" class="fw-bold text-start"><i class="fas fa-exclamation-triangle me-2"></i>III. MANAJEMEN RISIKO</td>
                  </tr>
                  <tr v-for="d in form.details.filter(x => x.kategori === 'MANAJEMEN RISIKO')" :key="d.no_unsur">
                    <td class="text-center fw-bold">{{ d.no_unsur }}</td>
                    <td class="text-start text-dark">
                      {{ d.unsur_disupervisi }}
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Ya' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Ya'"
                        >
                          Ya
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm fw-bold btn-toggle" 
                          :class="d.jawaban === 'Tidak' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'"
                          @click="d.jawaban = 'Tidak'"
                        >
                          Tidak
                        </button>
                      </div>
                    </td>
                    <td>
                      <input type="text" class="form-control form-control-sm input-premium" v-model="d.temuan_masalah" placeholder="Ketik temuan...">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Rekomendasi Section -->
            <div class="mt-3 p-3 bg-light rounded-3 text-start border border-light-subtle">
              <label class="form-label fw-bold text-dark mb-1" style="font-size: 0.85rem;">
                <i class="fas fa-comment-medical text-primary me-1"></i> Rekomendasi
              </label>
              <textarea 
                class="form-control input-premium" 
                v-model="form.rekomendasi" 
                rows="3" 
                placeholder="Ketik rekomendasi tindak lanjut hasil supervisi..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer bg-light p-3 border-0 d-flex justify-content-end gap-2">
            <button class="btn btn-secondary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="closeModal" :disabled="saving">
              Batal
            </button>
            <button class="btn btn-primary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="saveSupervisi" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Simpan Data
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Kelola Template Master -->
    <Teleport to="body">
      <div v-if="activeTemplateModal" class="modal-overlay" @click.self="closeTemplateModal">
        <div class="modal-content-large glass-card shadow-lg">
          <div class="modal-header-premium modal-header-warning p-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="m-0 fw-bold text-white">
                <i class="fas fa-sliders-h me-2"></i>Kelola Template Master Unsur
              </h5>
              <small class="text-white-50">Sesuaikan kalimat default penilaian untuk semua audit baru mendatang</small>
            </div>
            <button class="btn-close-premium text-white" @click="closeTemplateModal">&times;</button>
          </div>

          <div class="modal-body p-4 text-start">
            <!-- Toolbar for Template Management -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold text-secondary text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px;">Daftar Unsur Terdaftar</span>
              <button 
                class="btn btn-sm btn-primary px-3 fw-bold d-flex align-items-center gap-1" 
                style="border-radius: 8px; width: auto !important; height: 32px;"
                @click="showAddForm = !showAddForm"
              >
                <i class="fas" :class="showAddForm ? 'fa-times' : 'fa-plus'"></i> 
                {{ showAddForm ? 'Tutup Form' : 'Tambah Unsur' }}
              </button>
            </div>

            <!-- Collapsible Form for Adding New Unsur -->
            <div v-if="showAddForm" class="card mb-3 p-3 border shadow-sm animate__animated animate__fadeIn" style="border-radius: 8px; background: #faf5ff;">
              <div class="fw-bold mb-2 text-dark" style="font-size: 0.85rem;">
                <i class="fas fa-plus-circle me-1 text-primary"></i> Tambah Unsur Template Baru
              </div>
              <div class="row g-2 align-items-end">
                <div class="col-md-3">
                  <label class="form-label mb-1 text-secondary fw-bold" style="font-size: 0.75rem;">Kategori</label>
                  <select class="form-select form-select-sm" v-model="newUnsur.kategori">
                    <option value="MUTU">I. INDIKATOR MUTU</option>
                    <option value="KESELAMATAN PASIEN">II. KESELAMATAN PASIEN</option>
                    <option value="MANAJEMEN RISIKO">III. MANAJEMEN RISIKO</option>
                  </select>
                </div>
                <div class="col-md-7">
                  <label class="form-label mb-1 text-secondary fw-bold" style="font-size: 0.75rem;">Kalimat Unsur</label>
                  <input type="text" class="form-control form-control-sm" v-model="newUnsur.unsur_disupervisi" placeholder="Ketik kalimat template default...">
                </div>
                <div class="col-md-2 d-flex gap-1 justify-content-end">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="showAddForm = false" style="width: auto !important; height: 31px;">
                    Batal
                  </button>
                  <button type="button" class="btn btn-sm btn-primary" @click="addNewTemplateElement" :disabled="submittingNewUnsur" style="width: auto !important; height: 31px;">
                    <span v-if="submittingNewUnsur" class="spinner-border spinner-border-sm me-1"></span>
                    Simpan
                  </button>
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered align-middle compact-table">
                <thead class="bg-light text-secondary fw-bold" style="font-size: 0.85rem;">
                  <tr>
                    <th class="text-center" style="width: 60px;">No</th>
                    <th style="width: 180px;">Kategori</th>
                    <th>Kalimat Template Default (Database)</th>
                    <th class="text-center" style="width: 120px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(el, index) in templateElementsLocal" :key="el.no_unsur">
                    <td class="text-center fw-bold">{{ el.no_unsur }}</td>
                    <td>
                      <span class="badge" :class="getCategoryBadgeClass(el.kategori)">
                        {{ el.kategori }}
                      </span>
                    </td>
                    <td>
                      <!-- Display mode -->
                      <div v-if="!el.isEditing" class="p-2">
                        {{ el.unsur_disupervisi }}
                      </div>
                      <!-- Editing mode -->
                      <div v-else>
                        <textarea class="form-control form-control-sm" v-model="el.unsur_disupervisi_edit" rows="2"></textarea>
                      </div>
                    </td>
                    <td class="text-center">
                      <div v-if="!el.isEditing" class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-primary" @click="startEditTemplateRow(index)" title="Edit kalimat">
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteTemplateRow(el.no_unsur)" title="Hapus unsur">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      <div v-else class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-success" @click="saveTemplateRow(index)" title="Simpan perubahan">
                          <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click="cancelEditTemplateRow(index)" title="Batal">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer bg-light p-3 border-0 d-flex justify-content-end">
            <button class="btn btn-secondary px-4 fw-bold shadow-sm" style="border-radius: 8px;" @click="closeTemplateModal">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSquare from '@/assets/logo.png'
import logoLarsi from '@/assets/logo-larsi.png'
import QRCode from 'qrcode'
import { useAuthStore } from '@/stores/auth'
import { pegawaiService } from '@/services/pegawaiService'
import committeeService from '@/services/committeeService'

const toast = useToast()
const authStore = useAuthStore()
const staffList = ref([])
const committeeMembers = ref([])

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, { width: 150, margin: 1 })
  } catch (err) {
    console.error('Error generating QR code:', err)
    return null
  }
}

const items = ref([])
const units = ref([])
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const activeModal = ref(false)
const isEditMode = ref(false)
const editId = ref(null)

const filters = reactive({
  bulan: new Date().toISOString().slice(0, 7),
  unit: null,
  keyword: ''
})

const defaultElements = [
  { no_unsur: 1, kategori: 'MUTU', unsur_disupervisi: 'Staff bisa melakukan entry data' },
  { no_unsur: 2, kategori: 'MUTU', unsur_disupervisi: 'Staff memahami profil indikator mutu di unit kerjanya' },
  { no_unsur: 3, kategori: 'MUTU', unsur_disupervisi: 'Staff memahami cara mengumpulkan data indikator mutu' },
  { no_unsur: 4, kategori: 'MUTU', unsur_disupervisi: 'Penanggung jawab data melakukan pengumpulan data indikator mutu ruang' },
  { no_unsur: 5, kategori: 'MUTU', unsur_disupervisi: 'Koordinator ruang melakukan supervise/verifikasi/validasi kebenaran data' },
  { no_unsur: 6, kategori: 'MUTU', unsur_disupervisi: 'Data indikator mutu diolah dan dianalisis di unit kerja' },
  { no_unsur: 7, kategori: 'MUTU', unsur_disupervisi: 'Hasil analisis dan rencana tindak lanjut dilaporkan kepada Komite Mutu melalui Bidang/Bagian terkait' },
  { no_unsur: 8, kategori: 'KESELAMATAN PASIEN', unsur_disupervisi: 'Staff melakukan pelaporan insiden' },
  { no_unsur: 9, kategori: 'KESELAMATAN PASIEN', unsur_disupervisi: 'Staff melakukan investigasi sederhana' },
  { no_unsur: 10, kategori: 'MANAJEMEN RISIKO', unsur_disupervisi: 'Staff mengetahui daftar risiko/unit risk register' },
  { no_unsur: 11, kategori: 'MANAJEMEN RISIKO', unsur_disupervisi: 'Staff mengetahui tindak lanjut mitigasi risiko dilakukan' }
]

const form = reactive({
  dep_id: null,
  nama_responden: '',
  bulan: new Date().toISOString().slice(0, 7),
  tgl_supervisi: new Date().toISOString().split('T')[0],
  status: 'final',
  rekomendasi: '',
  nik_supervisor: null,
  details: []
})

const templateElements = ref([])

const fetchTemplateElements = async () => {
  try {
    const response = await api.getSupervisiImplikasiTemplate()
    if (response.data.success) {
      templateElements.value = response.data.data
    }
  } catch (error) {
    console.error('Gagal mengambil template unsur:', error)
  }
}

const activeTemplateModal = ref(false)
const templateElementsLocal = ref([])

const showAddForm = ref(false)
const submittingNewUnsur = ref(false)
const newUnsur = reactive({
  kategori: 'MUTU',
  unsur_disupervisi: ''
})

const addNewTemplateElement = async () => {
  if (!newUnsur.unsur_disupervisi.trim()) {
    toast.error('Kalimat template tidak boleh kosong!')
    return
  }

  submittingNewUnsur.value = true
  try {
    const response = await api.storeSupervisiImplikasiTemplate({
      kategori: newUnsur.kategori,
      unsur_disupervisi: newUnsur.unsur_disupervisi
    })

    if (response.data.success) {
      toast.success('Template unsur baru berhasil ditambahkan')
      newUnsur.unsur_disupervisi = ''
      showAddForm.value = false
      await fetchTemplateElements()
      const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
      templateElementsLocal.value = sourceElements.map(el => ({
        ...el,
        unsur_disupervisi_edit: el.unsur_disupervisi,
        isEditing: false
      }))
    } else {
      toast.error(response.data.message || 'Gagal menambahkan template baru')
    }
  } catch (error) {
    console.error('Error adding template element:', error)
    toast.error('Gagal menyimpan unsur baru')
  } finally {
    submittingNewUnsur.value = false
  }
}

const deleteTemplateRow = async (no_unsur) => {
  Swal.fire({
    title: 'Hapus Unsur?',
    text: 'Unsur ini tidak akan muncul lagi pada lembar supervisi baru.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.deleteSupervisiImplikasiTemplate(no_unsur)
        if (response.data.success) {
          toast.success('Template unsur berhasil dihapus')
          await fetchTemplateElements()
          const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
          templateElementsLocal.value = sourceElements.map(el => ({
            ...el,
            unsur_disupervisi_edit: el.unsur_disupervisi,
            isEditing: false
          }))
        } else {
          toast.error(response.data.message || 'Gagal menghapus template')
        }
      } catch (error) {
        console.error('Error deleting template element:', error)
        toast.error('Gagal menghapus unsur template')
      }
    }
  })
}

const openTemplateModal = async () => {
  await fetchTemplateElements()
  const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
  templateElementsLocal.value = sourceElements.map(el => ({
    ...el,
    unsur_disupervisi_edit: el.unsur_disupervisi,
    isEditing: false
  }))
  activeTemplateModal.value = true
}

const closeTemplateModal = () => {
  activeTemplateModal.value = false
  showAddForm.value = false
  newUnsur.unsur_disupervisi = ''
}

const startEditTemplateRow = (index) => {
  templateElementsLocal.value[index].unsur_disupervisi_edit = templateElementsLocal.value[index].unsur_disupervisi
  templateElementsLocal.value[index].isEditing = true
}

const cancelEditTemplateRow = (index) => {
  templateElementsLocal.value[index].isEditing = false
}

const saveTemplateRow = async (index) => {
  const row = templateElementsLocal.value[index]
  if (!row.unsur_disupervisi_edit.trim()) {
    toast.error('Kalimat template tidak boleh kosong!')
    return
  }
  
  try {
    const response = await api.updateSupervisiImplikasiTemplate(row.no_unsur, {
      unsur_disupervisi: row.unsur_disupervisi_edit
    })
    
    if (response.data.success) {
      row.unsur_disupervisi = row.unsur_disupervisi_edit
      row.isEditing = false
      toast.success('Template unsur berhasil diperbarui')
      await fetchTemplateElements()
    } else {
      toast.error(response.data.message || 'Gagal memperbarui template')
    }
  } catch (error) {
    console.error('Error updating template row:', error)
    toast.error('Gagal memperbarui template unsur')
  }
}

const getCategoryBadgeClass = (kategori) => {
  if (kategori === 'MUTU') return 'bg-info text-dark'
  if (kategori === 'KESELAMATAN PASIEN') return 'bg-danger text-white'
  return 'bg-warning text-dark'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: limit.value,
      bulan: filters.bulan,
      dep_id: filters.unit,
      keyword: filters.keyword
    }
    const response = await api.getSupervisiImplikasi(params)
    if (response.data.success) {
      items.value = response.data.data.data
      total.value = response.data.data.total
      totalPages.value = response.data.data.last_page
    }
  } catch (error) {
    console.error('Error supervisi:', error)
    toast.error('Gagal mengambil data supervisi')
  } finally {
    loading.value = false
  }
}

const fetchUnits = async () => {
  try {
    const response = await api.getUnits()
    units.value = response.data.data
  } catch (error) {
    console.error('Error fetch units:', error)
  }
}

const fetchStaff = async () => {
  try {
    const response = await pegawaiService.getKaryawanList()
    if (response.data.success) {
      staffList.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetch staff:', error)
  }
}

const fetchCommitteeMembers = async () => {
  try {
    const response = await committeeService.getAllMembers()
    if (response.data.success) {
      committeeMembers.value = response.data.data
        .filter(member => {
          const komiteNama = member.komite?.nama?.toUpperCase() || ''
          return komiteNama.includes('MUTU') || komiteNama.includes('PMKP')
        })
        .map(member => ({
          nik: member.nik,
          nama: member.pegawai?.nama || member.nik
        }))
    }
  } catch (error) {
    console.error('Error fetch committee members:', error)
  }
}

let timeout = null
const debounceFetch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    page.value = 1
    fetchData()
  }, 500)
}

const changePage = (p) => {
  page.value = p
  fetchData()
}

const calculateCompliance = (item) => {
  if (!item.detail || item.detail.length === 0) return 0
  const yaCount = item.detail.filter(d => d.jawaban === 'Ya').length
  return Math.round((yaCount / item.detail.length) * 100)
}

const countCategoryYa = (item, cat) => {
  if (!item.detail) return 0
  return item.detail.filter(d => d.kategori === cat && d.jawaban === 'Ya').length
}

const getScoreClass = (score) => {
  if (score >= 90) return 'bg-success text-white'
  if (score >= 70) return 'bg-warning text-dark'
  return 'bg-danger text-white'
}

const openCreateModal = () => {
  isEditMode.value = false
  editId.value = null
  form.dep_id = null
  form.nama_responden = ''
  form.bulan = new Date().toISOString().slice(0, 7)
  form.tgl_supervisi = new Date().toISOString().split('T')[0]
  form.status = 'final'
  form.rekomendasi = ''
  form.nik_supervisor = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik || null
  
  const sourceElements = templateElements.value.length > 0 ? templateElements.value : defaultElements
  
  form.details = sourceElements.map(el => ({
    no_unsur: el.no_unsur,
    kategori: el.kategori,
    unsur_disupervisi: el.unsur_disupervisi,
    jawaban: 'Ya',
    temuan_masalah: '',
    isEditingText: false
  }))
  activeModal.value = true
}

const openEditModal = async (item) => {
  isEditMode.value = true
  editId.value = item.id
  loading.value = true
  try {
    const response = await api.getSupervisiImplikasiDetail(item.id)
    if (response.data.success) {
      const data = response.data.data
      form.dep_id = data.dep_id
      form.nama_responden = data.nama_responden
      form.bulan = data.bulan
      form.tgl_supervisi = data.tgl_supervisi
      form.status = data.status
      form.rekomendasi = data.rekomendasi || ''
      form.nik_supervisor = data.nik_supervisor || null
      form.details = data.detail.map(d => ({
        no_unsur: d.no_unsur,
        kategori: d.kategori,
        unsur_disupervisi: d.unsur_disupervisi,
        jawaban: d.jawaban,
        temuan_masalah: d.temuan_masalah || '',
        isEditingText: false
      }))
      activeModal.value = true
    }
  } catch (error) {
    console.error('Error load detail:', error)
    toast.error('Gagal memuat detail supervisi')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  activeModal.value = false
  isEditMode.value = false
  editId.value = null
}

const saveSupervisi = async () => {
  if (!form.dep_id) {
    toast.warning('Silakan pilih unit kerja')
    return
  }
  if (!form.nama_responden || !form.nama_responden.trim()) {
    toast.warning('Nama responden tidak boleh kosong')
    return
  }

  saving.value = true
  try {
    const payload = {
      dep_id: form.dep_id,
      nama_responden: form.nama_responden,
      bulan: form.bulan,
      tgl_supervisi: form.tgl_supervisi,
      status: form.status,
      rekomendasi: form.rekomendasi,
      nik_supervisor: form.nik_supervisor,
      details: form.details
    }

    let response
    if (isEditMode.value) {
      response = await api.updateSupervisiImplikasi(editId.value, payload)
    } else {
      response = await api.createSupervisiImplikasi(payload)
    }

    if (response.data.success) {
      toast.success(isEditMode.value ? 'Supervisi berhasil diperbarui' : 'Supervisi berhasil disimpan')
      closeModal()
      fetchData()
    }
  } catch (error) {
    console.error('Error save:', error)
    toast.error('Gagal menyimpan data supervisi')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Hapus Data Supervisi?',
    text: `Supervisi untuk ${item.nama_responden} di unit ${item.departemen?.nama || item.dep_id} akan dihapus secara permanen.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.deleteSupervisiImplikasi(item.id)
        if (response.data.success) {
          toast.success('Supervisi berhasil dihapus')
          fetchData()
        }
      } catch (error) {
        console.error('Error delete:', error)
        toast.error('Gagal menghapus supervisi')
      }
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateFull = (monthStr) => {
  if (!monthStr) return '-'
  const [year, month] = monthStr.split('-')
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = page.value
  const delta = 1
  const range = []
  
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

const exportToPDF = async (item) => {
  loading.value = true
  try {
    let detailItem = item
    if (!item.detail || item.detail.length === 0) {
      const response = await api.getSupervisiImplikasiDetail(item.id)
      if (response.data.success) {
        detailItem = response.data.data
      }
    }

    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Header Kop
    const logoImg = await loadImage(logoSquare)
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 15, 8, 15, 15)
    }

    const larsiImg = await loadImage(logoLarsi)
    if (larsiImg) {
      const larsiHeight = 12
      const larsiWidth = larsiHeight * (larsiImg.naturalWidth / larsiImg.naturalHeight)
      doc.addImage(larsiImg, 'PNG', 195 - larsiWidth, 9, larsiWidth, larsiHeight)
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('RSIA AISYIYAH PEKAJANGAN PEKALONGAN', 33, 12)
    
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Jl. Raya Pekajangan No. 612, Pekajangan, Kec. Kedungwuni, Pekalongan, Jawa Tengah 51151', 33, 17)
    doc.text('Telp: (0285) 785909 | Email: rsiapeka@yahoo.co.id', 33, 21)
    
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(15, 27, 195, 27) // Line separator

    // Title Section below KOP
    doc.setTextColor(0, 0, 0)
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('CEK LIST MONITORING IMPLIKASI INDIKATOR MUTU, KESELAMATAN', 105, 34, { align: 'center' })
    doc.text('PASIEN, DAN MANAJEMEN RISIKO OLEH KOMITE MUTU', 105, 39, { align: 'center' })

    // Info Section
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('Unit Kerja', 15, 47)
    doc.text(`: ${detailItem.departemen?.nama || detailItem.dep_id}`, 45, 47)
    
    doc.text('Nama Responden', 15, 52)
    doc.text(`: ${detailItem.nama_responden}`, 45, 52)
    
    doc.text('Periode Evaluasi', 15, 57)
    doc.text(`: ${formatDateFull(detailItem.bulan)}`, 45, 57)

    doc.text('Tanggal Penilaian', 120, 47)
    doc.text(`: ${formatDate(detailItem.tgl_supervisi)}`, 150, 47)

    // Table Data
    const tableData = []
    
    // Kategori MUTU
    tableData.push([{ content: 'MUTU', colSpan: 5, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }])
    detailItem.detail.filter(x => x.kategori === 'MUTU').forEach(d => {
      tableData.push([
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ])
    })

    // Kategori KESELAMATAN PASIEN
    tableData.push([{ content: 'KESELAMATAN PASIEN', colSpan: 5, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }])
    detailItem.detail.filter(x => x.kategori === 'KESELAMATAN PASIEN').forEach(d => {
      tableData.push([
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ])
    })

    // Kategori MANAJEMEN RISIKO
    tableData.push([{ content: 'MANAJEMEN RISIKO', colSpan: 5, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }])
    detailItem.detail.filter(x => x.kategori === 'MANAJEMEN RISIKO').forEach(d => {
      tableData.push([
        d.no_unsur,
        d.unsur_disupervisi,
        d.jawaban === 'Ya' ? 'V' : '',
        d.jawaban === 'Tidak' ? 'V' : '',
        d.temuan_masalah || '-'
      ])
    })

    autoTable(doc, {
      startY: 63,
      head: [['NO', 'UNSUR YANG DISUPERVISI', 'YA', 'TIDAK', 'TEMUAN MASALAH']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2.5, font: 'Helvetica' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 96 },
        2: { cellWidth: 14, halign: 'center' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 44 }
      }
    })

    // Generate QR codes
    const supervisorName = detailItem.supervisor?.nama || authStore.user?.data?.detail?.nama || authStore.userName || 'Komite Mutu'
    const koordinatorName = detailItem.koordinator?.nama || detailItem.nama_responden || '-'

    const respondentQRText = `Ditandatangani secara elektronik oleh:\nNama: ${koordinatorName}\nJabatan: Kepala Ruang / Responden\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`
    const supervisorQRText = `Ditandatangani secara elektronik oleh:\nNama: ${supervisorName}\nJabatan: Komite Mutu Supervisor\nTanggal: ${formatDate(detailItem.tgl_supervisi)}`

    const respondentQR = await generateQRCode(respondentQRText)
    const supervisorQR = await generateQRCode(supervisorQRText)

    // Recommendations
    let currentY = doc.lastAutoTable.finalY + 10
    if (detailItem.rekomendasi) {
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Rekomendasi:', 15, currentY)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      const splitRekomendasi = doc.splitTextToSize(detailItem.rekomendasi, 180)
      doc.text(splitRekomendasi, 15, currentY + 5)
      currentY += 5 + (splitRekomendasi.length * 4.5) + 10
    } else {
      currentY += 5
    }

    // Check page boundaries for signatures
    if (currentY + 35 > 280) {
      doc.addPage()
      currentY = 20
    }

    // Signatures
    const finalY = currentY
    doc.setFontSize(9)
    doc.setFont('Helvetica', 'bold')
    doc.text('Kepala Ruang / Responden', 40, finalY, { align: 'center' })
    doc.text('Komite Mutu Supervisor', 153, finalY, { align: 'center' })

    if (respondentQR) {
      doc.addImage(respondentQR, 'PNG', 31, finalY + 3, 18, 18)
    }
    if (supervisorQR) {
      doc.addImage(supervisorQR, 'PNG', 144, finalY + 3, 18, 18)
    }

    doc.setFontSize(9)
    doc.setFont('Helvetica', 'bold')
    doc.text(`( ${koordinatorName} )`, 40, finalY + 26, { align: 'center' })
    doc.text(`( ${supervisorName} )`, 153, finalY + 26, { align: 'center' })

    doc.save(`Supervisi_Implikasi_${detailItem.nama_responden}_${detailItem.bulan}.pdf`)
    toast.success('PDF berhasil di-download')
  } catch (error) {
    console.error('Error PDF:', error)
    toast.error('Gagal mengekspor PDF')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUnits()
  fetchData()
  fetchTemplateElements()
  fetchStaff()
  fetchCommitteeMembers()
})
</script>

<style scoped>
.filter-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  display: block;
  letter-spacing: 0.5px;
}

.custom-pagination .page-link {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  margin: 0 2px;
  border-radius: 6px !important;
  font-weight: 600;
}

.custom-pagination .page-item.active .page-link {
  background: #435ebe;
  color: #fff;
}

.style-chooser :deep(.vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  min-height: 38px;
}

/* Premium Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-content-large {
  background: #ffffff;
  width: 100%;
  max-width: 1250px;
  height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  border: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1rem;
}

.input-premium {
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem !important;
  transition: all 0.2s ease-in-out;
}

.input-premium:focus {
  border-color: #435ebe !important;
  box-shadow: 0 0 0 3px rgba(67, 94, 190, 0.15) !important;
}

.modal-header-premium {
  background: linear-gradient(135deg, #435ebe 0%, #2b3d8f 100%);
  color: #fff;
  flex-shrink: 0;
}

.modal-header-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
}

.modal-footer {
  flex-shrink: 0;
}

.modal-footer .btn {
  width: auto !important;
}

.btn-close-premium {
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

/* Compact Table */
.compact-table th,
.compact-table td {
  padding: 0.4rem 0.6rem !important;
  font-size: 0.85rem !important;
}

/* Small select chooser matching form-control-sm */
.style-chooser-sm :deep(.vs__dropdown-toggle) {
  min-height: 31px !important;
  border-radius: 6px !important;
  font-size: 0.85rem !important;
}
.style-chooser-sm :deep(.vs__selected) {
  margin: 0 !important;
  padding: 0 !important;
}
.style-chooser-sm :deep(.vs__search) {
  margin: 0 !important;
  padding: 0 4px !important;
}

.table-secondary {
  background-color: #f1f5f9 !important;
  color: #1e293b !important;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.btn-toggle {
  min-width: 48px !important;
  height: 25px !important;
  font-size: 0.75rem !important;
  padding: 0 4px !important;
  line-height: 23px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 4px !important;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.btn-outline-secondary {
  border: 1px solid #cbd5e1 !important;
  color: #64748b !important;
  background-color: #f8fafc !important;
}

.btn-outline-secondary:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
  border-color: #94a3b8 !important;
}

.edit-trigger {
  padding: 6px 10px;
  margin: -6px -10px;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.edit-trigger:hover {
  background-color: #f1f5f9;
}

.edit-icon-hover {
  opacity: 0;
  font-size: 0.85rem;
  transition: opacity 0.2s ease-in-out;
}

.edit-trigger:hover .edit-icon-hover {
  opacity: 0.65;
}

.edit-trigger:hover .edit-icon-hover:hover {
  opacity: 1;
}
</style>
