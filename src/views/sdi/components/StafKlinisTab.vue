<template>
  <div class="staf-klinis-container">
    <!-- Header Actions -->
    <div class="header-actions">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearch"
          placeholder="Cari NIK, nama, jabatan, atau nomor STR/SIP..."
        />
      </div>
      <div class="header-buttons" style="display: flex; gap: 1rem; align-items: center;">
        <button class="btn-export-excel" @click="exportExcel">
          <i class="fas fa-file-excel"></i>
          <span>Export Excel</span>
        </button>
        <div class="info-card" @click="toggleEmployeeList" :class="{ active: showEmployeeList }">
        <div class="info-icon">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="info-content">
          <div class="info-label">Belum Ada Kualifikasi</div>
          <div class="info-value">{{ employeesWithoutKualifikasi }} Karyawan</div>
        </div>
        <i class="fas fa-chevron-down dropdown-icon" :class="{ rotated: showEmployeeList }"></i>
        </div>
      </div>
    </div>

    <!-- Employee List Modal -->
    <div v-if="showEmployeeList" class="modal-overlay-list" @click="showEmployeeList = false">
      <div class="employee-modal" @click.stop>
        <div class="dropdown-header">
          <span>Daftar Karyawan Belum Ada Kualifikasi</span>
          <button class="btn-close-dropdown" @click="showEmployeeList = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dropdown-body">
          <div v-if="employeesWithoutKualifikasiList.length === 0" class="empty-message">
            Semua karyawan sudah memiliki kualifikasi
          </div>
          <div v-else class="employee-item" v-for="emp in employeesWithoutKualifikasiList" :key="emp.nik">
            <div class="emp-info">
              <div class="emp-name">{{ emp.nama }}</div>
              <div class="emp-nik">{{ emp.nik }}</div>
            </div>
            <button class="btn-add-quick" @click="openAddModalForStaf(emp)" title="Tambah Kualifikasi">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="!loading && stafList.length > 0" class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sticky-col col-employee">NIK / Nama</th>
              <th>Jabatan</th>
              <th>Pendidikan</th>
              <th>Kredensial</th>
              <th>No. Telp</th>
              <th>Kategori Profesi</th>
              <th>Nomor STR</th>
              <th>Tanggal STR</th>
              <th>Tanggal Akhir SIP</th>
              <th>Nomor SIP</th>
              <th>Tanggal Izin Praktek</th>
              <th>Perguruan Tinggi</th>
              <th>Program Studi</th>
              <th>Tanggal Lulus</th>
              <th>Verifikasi Ijazah</th>
              <th>Tanggal Update</th>
              <th class="sticky-col-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staf in stafList" :key="staf.nik">
              <td class="sticky-col col-employee">
                <div class="employee-info-cell">
                  <div class="employee-name">{{ staf.nama }}</div>
                  <span class="nik-text">{{ staf.nik }}</span>
                </div>
              </td>
              <td>{{ staf.jbtn || '-' }}</td>
              <td>{{ staf.pendidikan || '-' }}</td>
              <td>
                <div v-if="staf.judul_sk" class="kredensial-cell-premium" :title="staf.judul_sk">
                  <div class="level-pill" :class="getLevelClass(staf.level_kredensial || calculateKredensial(staf))">
                    <i class="fas fa-award"></i>
                    <span>{{ staf.level_kredensial || calculateKredensial(staf) }}</span>
                  </div>
                  <div class="sk-date-wrapper">
                    <i class="far fa-calendar-alt"></i>
                    <span>{{ formatDate(staf.tgl_terbit_sk) }}</span>
                  </div>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ staf.no_telp || '-' }}</td>
              <td>
                <span v-if="staf.has_kualifikasi" class="badge bg-info bg-opacity-10 text-info px-2 py-1">
                  {{ staf.kategori_profesi || '-' }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ staf.nomor_str || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_str) || '-' }}</td>
              <td>
                <div v-if="staf.has_kualifikasi" class="expiry-cell">
                  {{ formatDate(staf.tanggal_akhir_str) }}
                  <span v-if="isExpiringSoon(staf.tanggal_akhir_str)" class="badge badge-warning">
                    <i class="fas fa-exclamation-triangle"></i> Segera Habis
                  </span>
                  <span v-else-if="isExpired(staf.tanggal_akhir_str)" class="badge badge-danger">
                    <i class="fas fa-times-circle"></i> Kadaluarsa
                  </span>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ staf.nomor_sip || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_izin_praktek) || '-' }}</td>
              <td>{{ staf.perguruan_tinggi || '-' }}</td>
              <td>{{ staf.prodi || '-' }}</td>
              <td>{{ formatDate(staf.tanggal_lulus) || '-' }}</td>
              <td>
                <a v-if="staf.bukti_kelulusan" :href="getBuktiKelulusanUrl(staf.bukti_kelulusan)" target="_blank" class="badge bg-success text-white text-decoration-none px-2 py-1">
                  <i class="fas fa-file-pdf me-1"></i> Lihat
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ formatDate(staf.tgl_update) || '-' }}</td>
              <td class="sticky-col-right">
                <div class="action-buttons">
                  <!-- Show Add button if no kualifikasi -->
                  <button v-if="!staf.has_kualifikasi" class="btn-add-small" @click="openAddModalForStaf(staf)" title="Tambah Kualifikasi">
                    <i class="fas fa-plus"></i> Tambah
                  </button>
                  <!-- Show Edit and Detail if has kualifikasi -->
                  <template v-else>
                    <button class="btn-edit" @click="openEditModal(staf)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-detail" @click="showDetail(staf)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-upload" @click="openUploadBuktiModal(staf)" title="Upload Verifikasi Ijazah">
                      <i class="fas fa-upload"></i>
                    </button>
                    <button class="btn-delete" @click="confirmDelete(staf)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-user-md"></i>
      <p>Belum ada data kualifikasi staf klinis</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content modern-modal" @click.stop>
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            </div>
            <div>
              <h3>{{ isEditMode ? 'Edit Kualifikasi Staf' : 'Tambah Kualifikasi Staf' }}</h3>
              <p class="header-subtitle">{{ isEditMode ? 'Perbarui data kualifikasi staf klinis' : 'Lengkapi data kualifikasi staf klinis' }}</p>
            </div>
          </div>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body modern-body">
          <!-- Employee Selection -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-user"></i>
              <span>Informasi Karyawan</span>
            </div>
            <div class="form-group full-width">
              <label>NIK / Nama Karyawan <span class="required">*</span></label>
              <select v-model="form.nik" :disabled="isEditMode" required>
                <option value="">Pilih Karyawan</option>
                <option v-for="karyawan in karyawanList" :key="karyawan.nik" :value="karyawan.nik">
                  {{ karyawan.nik }} - {{ karyawan.nama }}
                </option>
              </select>
            </div>
          </div>

          <!-- Professional Info -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-briefcase"></i>
              <span>Informasi Profesi</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Kategori Profesi <span class="required">*</span></label>
                <select v-model="form.kategori_profesi" @change="handleKategoriChange" required>
                  <option value="">Pilih Kategori</option>
                  <option value="Staf Medis">Staf Medis</option>
                  <option value="Staf Kebidanan">Staf Kebidanan</option>
                  <option value="Staf Keperawatan">Staf Keperawatan</option>
                  <option value="Staf Klinis Lainnya">Staf Klinis Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label>Jenjang Pendidikan (Untuk Filter)</label>
                <select v-model="form.temp_jenjang_pendidikan" @change="filterMasterKredensial">
                  <option value="">Semua Pendidikan</option>
                  <option v-for="edu in availableEducations" :key="edu" :value="edu">{{ edu }}</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Jenjang Kredensial <span class="required">*</span></label>
                <select v-model="form.id_kredensial" required>
                  <option value="">Pilih Jenjang Kredensial</option>
                  <option v-for="mk in filteredMasterKredensial" :key="mk.id" :value="mk.id">
                    {{ mk.label }} ({{ mk.jenjang_pendidikan }})
                  </option>
                </select>
                <small class="help-text text-primary" v-if="suggestedKredensial" @click="form.id_kredensial = suggestedKredensial.id" style="cursor: pointer;">
                  <i class="fas fa-magic"></i> Rekomendasi: <strong>{{ suggestedKredensial.label }}</strong> (Klik untuk pilih)
                </small>
              </div>
            </div>
          </div>

          <!-- STR Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-certificate"></i>
              <span>Surat Tanda Registrasi (STR)</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Nomor STR <span class="required">*</span></label>
                <input type="text" v-model="form.nomor_str" placeholder="Contoh: 123456789" required>
              </div>
              <div class="form-group">
                <label>Tanggal STR <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_str" @change="autoSuggestKredensial" required>
              </div>
              <div class="form-group full-width">
                <label>Tanggal Akhir SIP <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_akhir_str" required>
                <small class="help-text">Tanggal berakhirnya masa berlaku SIP</small>
              </div>
            </div>
          </div>

          <!-- SIP Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-id-card"></i>
              <span>Surat Izin Praktik (SIP)</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Nomor SIP <span class="required">*</span></label>
                <input type="text" v-model="form.nomor_sip" placeholder="Contoh: SIP/123/2024" required>
              </div>
              <div class="form-group">
                <label>Tanggal Izin Praktek <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_izin_praktek" required>
              </div>
            </div>
          </div>

          <!-- Education Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-graduation-cap"></i>
              <span>Informasi Pendidikan</span>
            </div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Perguruan Tinggi <span class="required">*</span></label>
                <input type="text" v-model="form.perguruan_tinggi" placeholder="Contoh: Universitas Indonesia" required>
              </div>
              <div class="form-group">
                <label>Program Studi <span class="required">*</span></label>
                <input type="text" v-model="form.prodi" placeholder="Contoh: Kedokteran" required>
              </div>
              <div class="form-group">
                <label>Tanggal Lulus <span class="required">*</span></label>
                <input type="date" v-model="form.tanggal_lulus" required>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modern-footer">
          <button class="btn-cancel" @click="closeModal">
            <i class="fas fa-times"></i>
            Batal
          </button>
          <button class="btn-save" @click="saveKualifikasi" :disabled="saving">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus</h3>
          <button class="btn-close" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus kualifikasi staf <strong>{{ selectedStaf?.nama }}</strong>?</p>
          <p class="warning-text">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-confirm-delete" @click="deleteKualifikasi">
            <i class="fas fa-trash"></i>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Verifikasi Ijazah Modal -->
    <div v-if="showUploadBuktiModal" class="modal-overlay" @click="closeUploadBuktiModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Upload Verifikasi Ijazah</h3>
          <button class="btn-close" @click="closeUploadBuktiModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Karyawan: <strong>{{ selectedStaf?.nama }}</strong></p>
          <div class="form-group">
            <label>Pilih File PDF/JPG/PNG (Max 10MB)</label>
            <div class="upload-area" :class="{ 'has-file': buktiFile }">
              <input type="file" ref="fileInput" @change="handleBuktiFileChange" accept=".pdf,.jpg,.jpeg,.png" class="file-input" />
              <div class="upload-placeholder" v-if="!buktiFile">
                <i class="fas fa-cloud-upload-alt fa-3x mb-3 text-muted"></i>
                <p>Klik atau seret file ke sini</p>
              </div>
              <div class="file-preview" v-else>
                <i :class="getFileIcon(buktiFile.name)"></i>
                <span>{{ buktiFile.name }}</span>
                <button type="button" class="btn-remove-file" @click.stop="buktiFile = null; $refs.fileInput.value = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeUploadBuktiModal" :disabled="uploadingBukti">Batal</button>
          <button class="btn-save" @click="submitUploadBukti" :disabled="!buktiFile || uploadingBukti">
            <i v-if="uploadingBukti" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-upload"></i>
            {{ uploadingBukti ? 'Mengupload...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header modern-header">
          <div class="header-content">
            <div class="header-icon">
              <i class="fas fa-id-card"></i>
            </div>
            <div>
              <h3>Detail Kualifikasi Staf</h3>
              <p class="header-subtitle">Informasi lengkap kualifikasi staf klinis</p>
            </div>
          </div>
          <button class="btn-close" @click="showDetailModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body detail-body" v-if="selectedStaf">
          <!-- Employee Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-user"></i>
              <span>Informasi Karyawan</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>NIK</label>
                <div class="detail-value">{{ selectedStaf.nik }}</div>
              </div>
              <div class="detail-item">
                <label>Nama</label>
                <div class="detail-value">{{ selectedStaf.nama }}</div>
              </div>
              <div class="detail-item full-width" v-if="selectedStaf.judul_sk">
                <label>Kredensial Terakhir</label>
                <div class="kredensial-card-mini">
                  <div class="k-card-header">
                    <div class="level-badge-premium" :class="getLevelClass(selectedStaf.level_kredensial || calculateKredensial(selectedStaf))">
                      <i class="fas fa-shield-alt"></i>
                      {{ selectedStaf.level_kredensial || calculateKredensial(selectedStaf) }}
                    </div>
                  </div>
                  <div class="k-card-body">
                    <div class="sk-title">{{ selectedStaf.judul_sk }}</div>
                    <div class="sk-meta">
                      <div class="meta-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>Terbit: {{ formatDate(selectedStaf.tgl_terbit_sk) }}</span>
                      </div>
                      <div class="meta-item border-left-mini">
                        <i class="fas fa-hourglass-half"></i>
                        <span>Masa Kerja: {{ (new Date(selectedStaf.tgl_terbit_sk).getFullYear() - 2017) }} Tahun</span>
                      </div>
                    </div>
                  </div>
                  <div class="k-card-footer" v-if="selectedStaf.berkas_sk">
                    <a :href="`http://192.168.100.33/webapps/rsia_sk/${selectedStaf.berkas_sk}`" target="_blank" class="btn-preview-sk-mini">
                      <i class="fas fa-file-pdf"></i>
                      <span>Lihat Lampiran SK</span>
                      <i class="fas fa-arrow-right arrow"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Professional Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-briefcase"></i>
              <span>Informasi Profesi</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Kategori Profesi</label>
                <div class="detail-value badge-value">
                  <span class="badge bg-info bg-opacity-10 text-info px-3 py-2">
                    {{ selectedStaf.kategori_profesi }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- STR Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-certificate"></i>
              <span>Surat Tanda Registrasi (STR)</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nomor STR</label>
                <div class="detail-value mono">{{ selectedStaf.nomor_str }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal STR</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_str) }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Akhir SIP</label>
                <div class="detail-value">
                  {{ formatDate(selectedStaf.tanggal_akhir_str) }}
                  <span v-if="isExpiringSoon(selectedStaf.tanggal_akhir_str)" class="badge badge-warning ms-2">
                    <i class="fas fa-exclamation-triangle"></i> Segera Habis
                  </span>
                  <span v-else-if="isExpired(selectedStaf.tanggal_akhir_str)" class="badge badge-danger ms-2">
                    <i class="fas fa-times-circle"></i> Kadaluarsa
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- SIP Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-id-card"></i>
              <span>Surat Izin Praktik (SIP)</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nomor SIP</label>
                <div class="detail-value mono">{{ selectedStaf.nomor_sip || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Izin Praktek</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_izin_praktek) }}</div>
              </div>
            </div>
          </div>

          <!-- Education Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-graduation-cap"></i>
              <span>Informasi Pendidikan</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Perguruan Tinggi</label>
                <div class="detail-value">{{ selectedStaf.perguruan_tinggi || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Program Studi</label>
                <div class="detail-value">{{ selectedStaf.prodi || '-' }}</div>
              </div>
              <div class="detail-item">
                <label>Tanggal Lulus</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tanggal_lulus) }}</div>
              </div>
              <div class="detail-item full-width">
                <label>Verifikasi Ijazah</label>
                <div class="detail-value">
                  <a v-if="selectedStaf.bukti_kelulusan" :href="getBuktiKelulusanUrl(selectedStaf.bukti_kelulusan)" target="_blank" class="badge bg-success text-white text-decoration-none px-3 py-2">
                    <i class="fas fa-file-pdf me-1"></i> Lihat Verifikasi Ijazah
                  </a>
                  <span v-else class="text-muted">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="detail-section">
            <div class="detail-section-header">
              <i class="fas fa-info-circle"></i>
              <span>Informasi Sistem</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Terakhir Diupdate</label>
                <div class="detail-value">{{ formatDate(selectedStaf.tgl_update) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modern-footer">
          <button class="btn-cancel" @click="showDetailModal = false">
            <i class="fas fa-times"></i>
            Tutup
          </button>
          <button class="btn-save" @click="openEditModal(selectedStaf); showDetailModal = false">
            <i class="fas fa-edit"></i>
            Edit Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { pegawaiService } from '../../../services/pegawaiService'
import * as XLSX from 'xlsx'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const loading = ref(false)
const stafList = ref([])
const karyawanList = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const selectedStaf = ref(null)
const masterKredensialList = ref([])
const filteredMasterKredensial = ref([])
const availableEducations = ref([])
const suggestedKredensial = ref(null)
const searchQuery = ref('')
const showEmployeeList = ref(false)
const showDetailModal = ref(false)
const showUploadBuktiModal = ref(false)
const uploadingBukti = ref(false)
const buktiFile = ref(null)
let searchTimeout = null

const form = ref({
  nik: '',
  kategori_profesi: '',
  nomor_str: '',
  tanggal_str: '',
  tanggal_akhir_str: '',
  nomor_sip: '',
  tanggal_izin_praktek: '',
  perguruan_tinggi: '',
  prodi: '',
  tanggal_lulus: '',
  id_kredensial: '',
  temp_jenjang_pendidikan: '',
  status: '1'
})

// Computed
const employeesWithoutKualifikasi = computed(() => {
  return stafList.value.filter(staf => !staf.has_kualifikasi).length
})

const employeesWithoutKualifikasiList = computed(() => {
  return stafList.value.filter(staf => !staf.has_kualifikasi)
})

const toggleEmployeeList = () => {
  showEmployeeList.value = !showEmployeeList.value
}

const exportExcel = () => {
  if (!stafList.value || stafList.value.length === 0) {
    toast.warning('Tidak ada data untuk diekspor')
    return
  }

  // Format data for Excel
  const exportData = stafList.value.map((staf, index) => {
    const kredensial = calculateKredensial(staf);
    return {
      'No': index + 1,
      'NIK': staf.nik,
      'Nama': staf.nama,
      'Jabatan': staf.jabatan || '-',
      'Pendidikan': staf.pendidikan || '-',
      'Tingkat Kredensial': kredensial || '-',
      'Tanggal Kredensial': staf.tgl_terbit_sk ? formatDate(staf.tgl_terbit_sk) : '-',
      'Status Anggota': staf.status_anggota || '-',
      'No. Telp': staf.no_telp || '-',
      'Kategori Profesi': staf.has_kualifikasi ? staf.kategori_profesi : 'Belum Ada',
      'Nomor STR': staf.has_kualifikasi ? staf.nomor_str : '-',
      'Tanggal Terbit STR': staf.has_kualifikasi ? formatDate(staf.tanggal_str) : '-',
      'Tanggal Akhir SIP': staf.has_kualifikasi ? formatDate(staf.tanggal_akhir_str) : '-',
      'Nomor SIP': staf.has_kualifikasi ? staf.nomor_sip : '-',
      'Tanggal Izin Praktek': staf.has_kualifikasi ? formatDate(staf.tanggal_izin_praktek) : '-',
      'Perguruan Tinggi': staf.has_kualifikasi ? staf.perguruan_tinggi : '-',
      'Prodi': staf.has_kualifikasi ? staf.prodi : '-',
      'Tanggal Lulus': staf.has_kualifikasi ? formatDate(staf.tanggal_lulus) : '-',
    }
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData)
  
  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 15 }, // NIK
    { wch: 30 }, // Nama
    { wch: 20 }, // Jabatan
    { wch: 20 }, // Pendidikan
    { wch: 20 }, // Tingkat Kredensial
    { wch: 15 }, // Tanggal Kredensial
    { wch: 15 }, // Status Anggota
    { wch: 15 }, // No. Telp
    { wch: 20 }, // Kategori Profesi
    { wch: 20 }, // Nomor STR
    { wch: 15 }, // Tanggal Terbit STR
    { wch: 15 }, // Tanggal Akhir SIP
    { wch: 20 }, // Nomor SIP
    { wch: 15 }, // Tanggal Izin Praktek
    { wch: 25 }, // Perguruan Tinggi
    { wch: 20 }, // Prodi
    { wch: 15 }, // Tanggal Lulus
  ]
  ws['!cols'] = colWidths

  // Create workbook and append worksheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Staf Klinis")

  // Generate filename with current date
  const date = new Date()
  const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const fileName = `Data_Staf_Klinis_${dateStr}.xlsx`

  // Save file
  XLSX.writeFile(wb, fileName)
  toast.success('File Excel berhasil diunduh')
}

// Methods
const loadStafKlinis = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const response = await pegawaiService.getKualifikasiStaf(params)
    if (response.data.success) {
      stafList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading staf klinis:', error)
    toast.error('Gagal memuat data kualifikasi staf')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Debounce search
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadStafKlinis()
  }, 500)
}

const loadKaryawanList = async () => {
  try {
    const response = await pegawaiService.getKaryawanList()
    if (response.data.success) {
      karyawanList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading karyawan list:', error)
  }
}

const openAddModal = () => {
  isEditMode.value = false
  resetForm()
  showModal.value = true
}

const openAddModalForStaf = (staf) => {
  isEditMode.value = false
  resetForm()
  // Pre-fill NIK from selected pegawai
  form.value.nik = staf.nik
  showModal.value = true
}

const openEditModal = (staf) => {
  isEditMode.value = true
  form.value = { ...staf }
  // Ensure status is integer
  form.value.status = staf.status || 1
  showModal.value = true
}

const showDetail = (staf) => {
  selectedStaf.value = staf
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    nik: '',
    kategori_profesi: '',
    nomor_str: '',
    tanggal_str: '',
    tanggal_akhir_str: '',
    nomor_sip: '',
    tanggal_izin_praktek: '',
    perguruan_tinggi: '',
    prodi: '',
    tanggal_lulus: '',
    status: '1'
  }
}

const openUploadBuktiModal = (staf) => {
  selectedStaf.value = staf
  buktiFile.value = null
  showUploadBuktiModal.value = true
}

const closeUploadBuktiModal = () => {
  showUploadBuktiModal.value = false
  buktiFile.value = null
}

const handleBuktiFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    toast.error('Ukuran file maksimal 10MB')
    event.target.value = ''
    return
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    toast.error('Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG')
    event.target.value = ''
    return
  }

  buktiFile.value = file
}

const submitUploadBukti = async () => {
  if (!buktiFile.value || !selectedStaf.value) return

  uploadingBukti.value = true
  const formData = new FormData()
  formData.append('file', buktiFile.value)

  try {
    await pegawaiService.uploadBuktiKelulusan(selectedStaf.value.nik, formData)
    toast.success('Verifikasi Ijazah berhasil diupload')
    closeUploadBuktiModal()
    loadStafKlinis()
  } catch (error) {
    console.error('Error uploading file:', error)
    toast.error('Gagal mengupload file: ' + (error.response?.data?.message || ''))
  } finally {
    uploadingBukti.value = false
  }
}

const calculateKredensial = (staf) => {
  if (staf.level_kredensial) return staf.level_kredensial
  if (!staf.tgl_terbit_sk) return '-'
  
  const pendidikan = (staf.pendidikan || '').toUpperCase()
  const tglTerbit = new Date(staf.tgl_terbit_sk)
  const tahunTerbit = tglTerbit.getFullYear()
  const tahunAwal = 2017
  const masaKerja = tahunTerbit - tahunAwal

  if (pendidikan.includes('D3') || pendidikan.includes('DIII')) {
    if (masaKerja >= 22) return 'PK V (>= 22 Tahun)'
    if (masaKerja >= 19) return 'PK IV (>= 19 Tahun)'
    if (masaKerja > 9) return 'PK III (> 9 - 12 Tahun)'
    if (masaKerja > 6) return 'PK II (> 6 - 9 Tahun)'
    if (masaKerja >= 3) return 'PK I (3 - 6 Tahun)'
    return 'PRA PK (0 - 3 Tahun)'
  } else if (pendidikan.includes('NERS')) {
    if (masaKerja > 12) return 'Utama (> 12 tahun)'
    if (masaKerja >= 6) return 'Madya (6 - 12 tahun)'
    if (masaKerja >= 2) return 'Muda (2 - 6 tahun)'
    return 'Pratama (0 - 2 tahun)'
  }
  
  return '-'
}

const loadMasterKredensial = async () => {
  try {
    const response = await pegawaiService.getMasterKredensial()
    if (response.data.success) {
      masterKredensialList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading master kredensial:', error)
  }
}

const handleKategoriChange = () => {
  // Update available educations based on category
  const educations = masterKredensialList.value
    .filter(mk => mk.kategori_profesi === form.value.kategori_profesi)
    .map(mk => mk.jenjang_pendidikan)
  availableEducations.value = [...new Set(educations)]
  
  // Reset education and filtered list
  form.value.temp_jenjang_pendidikan = ''
  filterMasterKredensial()
  autoSuggestKredensial()
}

const filterMasterKredensial = () => {
  let filtered = masterKredensialList.value.filter(mk => mk.kategori_profesi === form.value.kategori_profesi)
  
  if (form.value.temp_jenjang_pendidikan) {
    filtered = filtered.filter(mk => mk.jenjang_pendidikan === form.value.temp_jenjang_pendidikan)
  }
  
  filteredMasterKredensial.value = filtered
}

const autoSuggestKredensial = () => {
  if (!form.value.kategori_profesi || !form.value.tanggal_str) {
    suggestedKredensial.value = null
    return
  }

  // Logic to suggest based on experience (similar to old calculateKredensial)
  const tglAwal = new Date(form.value.tanggal_str) // Use STR date as entry point or reference
  const today = new Date()
  const masaKerja = today.getFullYear() - tglAwal.getFullYear()

  const candidates = masterKredensialList.value.filter(mk => 
    mk.kategori_profesi === form.value.kategori_profesi &&
    masaKerja >= mk.min_masa_kerja &&
    masaKerja <= mk.max_masa_kerja
  )

  if (candidates.length > 0) {
    // If there's an education filter, prefer that
    const bestMatch = form.value.temp_jenjang_pendidikan 
      ? candidates.find(c => c.jenjang_pendidikan === form.value.temp_jenjang_pendidikan) || candidates[0]
      : candidates[0]
    
    suggestedKredensial.value = bestMatch
  } else {
    suggestedKredensial.value = null
  }
}

const getLevelClass = (level) => {
  if (!level || level === '-') return ''
  const upperLevel = level.toUpperCase()
  if (upperLevel.includes('PK V')) return 'level-pk-v'
  if (upperLevel.includes('PK IV')) return 'level-pk-iv'
  if (upperLevel.includes('PK III')) return 'level-pk-iii'
  if (upperLevel.includes('PK II')) return 'level-pk-ii'
  if (upperLevel.includes('PK I')) return 'level-pk-i'
  if (upperLevel.includes('PRA PK')) return 'level-pra-pk'
  if (upperLevel.includes('UTAMA')) return 'level-ners-utama'
  if (upperLevel.includes('MADYA')) return 'level-ners-madya'
  if (upperLevel.includes('MUDA')) return 'level-ners-muda'
  if (upperLevel.includes('PRATAMA')) return 'level-ners-pratama'
  return 'level-default'
}

const getBuktiKelulusanUrl = (filename) => {
  return `http://192.168.100.33/webapps/rsia_kualifikasi/${filename}`
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'fas fa-file-pdf text-danger fa-2x'
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'fas fa-file-image text-primary fa-2x'
  return 'fas fa-file text-secondary fa-2x'
}

const saveKualifikasi = async () => {
  if (!form.value.nik || !form.value.kategori_profesi || !form.value.nomor_str || !form.value.tanggal_akhir_str) {
    toast.warning('Mohon lengkapi data wajib (*)')
    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await pegawaiService.updateKualifikasi(form.value.nik, form.value)
      toast.success('Kualifikasi staf berhasil diperbarui')
    } else {
      await pegawaiService.createKualifikasi(form.value)
      toast.success('Kualifikasi staf berhasil ditambahkan')
    }
    closeModal()
    loadStafKlinis()
  } catch (error) {
    console.error('Error saving kualifikasi:', error)
    toast.error('Gagal menyimpan kualifikasi staf: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const confirmDelete = (staf) => {
  selectedStaf.value = staf
  showDeleteModal.value = true
}

const deleteKualifikasi = async () => {
  try {
    await pegawaiService.deleteKualifikasi(selectedStaf.value.nik)
    toast.success('Kualifikasi staf berhasil dihapus')
    showDeleteModal.value = false
    loadStafKlinis()
  } catch (error) {
    console.error('Error deleting kualifikasi:', error)
    toast.error('Gagal menghapus kualifikasi staf')
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch (e) {
    return '-'
  }
}

const isExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

const isExpiringSoon = (date) => {
  if (!date) return false
  const expiryDate = new Date(date)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry > 0 && daysUntilExpiry <= 90 // 90 days warning
}

// Lifecycle
onMounted(() => {
  loadStafKlinis()
  loadKaryawanList()
  loadMasterKredensial()
})
</script>

<style scoped>
.staf-klinis-container {
  padding: 1rem 0;
}

/* Header Actions */
.header-actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px solid #fbbf24;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.info-card:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
}

.info-card.active {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
}

.dropdown-icon {
  font-size: 0.875rem;
  color: #92400e;
  transition: transform 0.3s;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.modal-overlay-list {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.employee-modal {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dropdown-header {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.btn-close-dropdown {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-close-dropdown:hover {
  color: #1f2937;
}

.dropdown-body {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
  gap: 1rem;
}

.employee-item:hover {
  background: #f9fafb;
}

.emp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.emp-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.emp-nik {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.75rem;
  display: inline-block;
  width: fit-content;
}

.btn-add-quick {
  padding: 0.5rem;
  background: #d1fae5;
  color: #065f46;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.btn-add-quick:hover {
  background: #a7f3d0;
  transform: scale(1.05);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  font-size: 1.25rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.info-label {
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1rem;
  color: #78350f;
  font-weight: 700;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Table */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
}

/* Sticky columns for horizontal scroll */
.sticky-col {
  position: sticky;
  background: white;
  z-index: 10;
}

.sticky-col.col-employee {
  left: 0;
  min-width: 250px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.sticky-col-right {
  position: sticky;
  right: 0;
  background: white;
  z-index: 10;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  min-width: 150px;
}

/* Sticky header cells */
thead .sticky-col,
thead .sticky-col-right {
  background: #f8fafc;
  z-index: 15;
}

tbody tr:hover .sticky-col,
tbody tr:hover .sticky-col-right {
  background: #f8fafc;
}

.employee-info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1200px;
}

.data-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 20;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  vertical-align: middle;
  color: #334155;
}

.nik-text {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.8rem;
}

.employee-name {
  font-weight: 600;
  color: #1e293b;
}

.expiry-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.education-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.education-cell small {
  color: #64748b;
  font-size: 0.75rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete,
.btn-detail,
.btn-add-small {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.btn-add-small {
  background: #d1fae5;
  color: #065f46;
  padding: 0.5rem 0.75rem;
  min-width: auto;
}

.btn-add-small:hover {
  background: #a7f3d0;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-detail {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-detail:hover {
  background: #c7d2fe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modern-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.modern-header {
  padding: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modern-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.modern-header h3 {
  color: white;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modern-body {
  background: #f9fafb;
  padding: 0;
}

.form-section {
  background: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
}

.form-section:first-child {
  margin-top: 1rem;
}

.form-section:last-child {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.section-header i {
  color: #3b82f6;
  font-size: 1.125rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.btn-export-excel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.btn-export-excel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(16, 185, 129, 0.3);
}

.btn-export-excel i {
  font-size: 1.125rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modern-footer {
  padding: 2rem;
  background: white;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-cancel {
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .staf-klinis-container {
    padding: 0.5rem 0;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .info-card {
    width: 100%;
    justify-content: space-between;
  }

  /* Disable sticky columns on mobile */
  .data-table .sticky-col,
  .data-table .sticky-col-right,
  .data-table th.sticky-col,
  .data-table td.sticky-col,
  .data-table th.sticky-col-right,
  .data-table td.sticky-col-right {
    position: static !important;
    left: auto !important;
    right: auto !important;
  }

  /* Enable table scroll */
  .table-container {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .data-table {
    min-width: 1200px !important;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* Detail Modal Styles */
.detail-modal {
  max-width: 800px;
}

.detail-body {
  padding: 0;
  background: #f9fafb;
}

.detail-section {
  background: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
}

.detail-section:first-child {
  margin-top: 1rem;
}

.detail-section:last-child {
  margin-bottom: 1rem;
}

.detail-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.detail-section-header i {
  color: #3b82f6;
  font-size: 1.125rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 500;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.detail-value.mono {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  color: #475569;
}

.detail-value.badge-value {
  background: transparent;
  border: none;
  padding: 0.5rem 0;
}

.ms-2 {
  margin-left: 0.5rem;
}

/* Upload Action Button */
.btn-upload {
  background: none;
  border: none;
  cursor: pointer;
  color: #3b82f6;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-upload:hover {
  background-color: #eff6ff;
  color: #2563eb;
  transform: translateY(-1px);
}

/* Upload Area Styling */
.upload-area {
  position: relative;
  width: 100%;
  min-height: 150px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  margin-top: 0.5rem;
}

.upload-area:hover, .upload-area.has-file {
  border-color: #3b82f6;
  background: #eff6ff;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
  pointer-events: none;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  z-index: 15;
  color: #334155;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
}

.btn-remove-file {
  margin-top: 10px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;
  position: relative;
}

.btn-remove-file:hover {
  background: #fca5a5;
  color: #b91c1c;
}

/* Kredensial Premium Styles */
.kredensial-cell-premium {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: fit-content;
}

.level-pill i {
  font-size: 0.875rem;
}

.sk-date-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #64748b;
  padding-left: 4px;
}

/* Level Variants */
.level-pk-v { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; border: 1px solid #f87171; }
.level-pk-iv { background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); color: #9a3412; border: 1px solid #fb923c; }
.level-pk-iii { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #fbbf24; }
.level-pk-ii { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #065f46; border: 1px solid #34d399; }
.level-pk-i { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); color: #166534; border: 1px solid #4ade80; }
.level-pra-pk { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); color: #475569; border: 1px solid #cbd5e1; }

.level-ners-utama { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; border: 1px solid #818cf8; }
.level-ners-madya { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); color: #075985; border: 1px solid #38bdf8; }
.level-ners-muda { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); color: #0369a1; border: 1px solid #7dd3fc; }
.level-ners-pratama { background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%); color: #44403c; border: 1px solid #d6d3d1; }
.level-default { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }

/* Kredensial Card Mini (Detail Modal) */
.kredensial-card-mini {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kredensial-card-mini:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.k-card-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.level-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.k-card-body {
  padding: 16px;
}

.sk-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  line-height: 1.4;
  margin-bottom: 12px;
}

.sk-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.meta-item i {
  color: #3b82f6;
}

.border-left-mini {
  padding-left: 12px;
  border-left: 1px solid #e2e8f0;
}

.k-card-footer {
  padding: 12px 16px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
}

.btn-preview-sk-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #1e293b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-preview-sk-mini:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateX(4px);
}

.btn-preview-sk-mini .arrow {
  margin-left: auto;
  opacity: 0;
  transition: all 0.2s;
}

.btn-preview-sk-mini:hover .arrow {
  opacity: 1;
  transform: translateX(4px);
}
</style>
