<template>
  <div v-if="show" class="modal-backdrop-custom" @click.self="$emit('close')">
     <div class="modal-dialog-custom modal-xl">
        <div class="modal-shell">

           <!-- Header -->
           <div class="modal-header-custom">
              <div class="modal-header-left">
                 <div class="modal-header-icon">
                    <i class="fas fa-file-medical-alt"></i>
                 </div>
                 <div>
                    <div class="modal-header-title">Laporan Operasi</div>
                    <div class="modal-header-sub" v-if="pasien">{{ pasien.nm_pasien }}</div>
                 </div>
              </div>
              <button class="modal-close-btn" @click="$emit('close')">
                 <i class="fas fa-times"></i>
              </button>
           </div>

           <!-- Body -->
           <div class="modal-body-custom">
              <form @submit.prevent="$emit('submit')">

                 <!-- Patient Identity Card -->
                 <div class="patient-card">
                    <div class="patient-avatar">
                       <i class="fas fa-user-injured"></i>
                    </div>
                    <div class="patient-info">
                       <div class="patient-name">{{ pasien?.nm_pasien || '-' }}</div>
                       <div class="patient-meta">
                          <span><i class="fas fa-id-card"></i> No. RM: <strong>{{ pasien?.no_rkm_medis || '-' }}</strong></span>
                          <span><i class="fas fa-birthday-cake"></i> {{ pasien?.tgl_lahir || '-' }}</span>
                          <span><i class="fas fa-venus-mars"></i> {{ pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                       </div>
                    </div>
                 </div>

                 <!-- Section: Waktu & Kategori -->
                 <div class="form-section">
                    <div class="section-header section-blue">
                       <i class="fas fa-clock"></i>
                       <span>Informasi Waktu &amp; Kategori</span>
                    </div>
                    <div class="section-body">
                       <div class="row g-3">
                          <div class="col-md-3">
                             <label class="field-label">No. Rawat</label>
                             <input type="text" class="field-input" v-model="form.no_rawat" readonly disabled>
                          </div>
                          <div class="col-md-3">
                             <label class="field-label">Tgl &amp; Jam Mulai</label>
                             <input type="datetime-local" class="field-input" v-model="form.tgl_operasi" readonly disabled>
                          </div>
                          <div class="col-md-3">
                             <label class="field-label">Tgl &amp; Jam Selesai <span class="required">*</span></label>
                             <input type="datetime-local" class="field-input" v-model="form.tgl_selesai" required :disabled="readonly">
                          </div>
                          <div class="col-md-3">
                             <label class="field-label">Kategori</label>
                             <select class="field-input" v-model="form.kategori" :disabled="readonly">
                                <option value="-">-</option>
                                <option value="Elektive">Elektive</option>
                                <option value="Emergency">Emergency</option>
                             </select>
                          </div>
                          <div class="col-md-8">
                             <label class="field-label">Tindakan Operasi <span class="required">*</span></label>
                             <v-select
                                v-if="!readonly"
                                v-model="form.kode_paket"
                                :options="paketList"
                                :reduce="p => p.kode_paket"
                                label="nm_perawatan"
                                placeholder="Pilih atau cari tindakan operasi..."
                                :filterable="true"
                                class="vselect-custom"
                             ></v-select>
                             <input v-else type="text" class="field-input" :value="form.kode_paket" disabled>
                          </div>
                          <div class="col-md-4">
                             <label class="field-label">Jenis Anestesi <span class="required">*</span></label>
                             <input type="text" class="field-input" v-model="form.jenis_anestesi" placeholder="Contoh: GA / Spinal" required :disabled="readonly">
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Section: Tim Operasi -->
                 <div class="form-section">
                    <div class="section-header section-indigo">
                       <i class="fas fa-user-md"></i>
                       <span>Tim Operasi</span>
                    </div>
                    <div class="section-body">
                       <div class="row g-3">
                          <div class="col-md-6">
                             <label class="field-label">Operator Utama <span class="required">*</span></label>
                             <v-select
                                v-model="form.operator1"
                                :options="dokterList"
                                :reduce="d => d.kd_dokter"
                                label="nm_dokter"
                                placeholder="Pilih Dokter Operator"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Dokter Anestesi</label>
                             <v-select
                                v-model="form.dokter_anestesi"
                                :options="dokterList"
                                :reduce="d => d.kd_dokter"
                                label="nm_dokter"
                                placeholder="Pilih Dokter Anestesi"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Asisten Operator 1</label>
                             <v-select
                                v-model="form.asisten_operator1"
                                :options="pegawaiList"
                                :reduce="p => p.nik"
                                label="nama"
                                placeholder="Pilih Asisten 1"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Asisten Anestesi</label>
                             <v-select
                                v-model="form.asisten_anestesi"
                                :options="pegawaiList"
                                :reduce="p => p.nik"
                                label="nama"
                                placeholder="Pilih Asisten Anestesi"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Asisten Operator 2</label>
                             <v-select
                                v-model="form.asisten_operator2"
                                :options="pegawaiList"
                                :reduce="p => p.nik"
                                label="nama"
                                placeholder="Pilih Asisten 2"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Dokter Anak</label>
                             <v-select
                                v-model="form.dokter_anak"
                                :options="dokterList"
                                :reduce="d => d.kd_dokter"
                                label="nm_dokter"
                                placeholder="Pilih Dokter Anak"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Onloop (Perawat Sirkuler)</label>
                             <v-select
                                v-model="form.onloop"
                                :options="pegawaiList"
                                :reduce="p => p.nik"
                                label="nama"
                                placeholder="Pilih Onloop"
                                :disabled="readonly"
                                class="vselect-custom"
                             ></v-select>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Section: Klinis + Laporan -->
                 <div class="form-section">
                    <div class="section-header section-teal">
                       <i class="fas fa-notes-medical"></i>
                       <span>Data Klinis &amp; Laporan</span>
                    </div>
                    <div class="section-body">
                       <div class="row g-3">
                          <div class="col-md-6">
                             <label class="field-label">Diagnosa Pre-Operasi</label>
                             <input type="text" class="field-input" v-model="form.diagnosa_preop" placeholder="Diagnosa awal sebelum operasi" :disabled="readonly">
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Diagnosa Post-Operasi</label>
                             <input type="text" class="field-input" v-model="form.diagnosa_postop" placeholder="Diagnosa setelah operasi" :disabled="readonly">
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Jaringan Insisi</label>
                             <input type="text" class="field-input" v-model="form.jaringan_insisi" placeholder="Jenis jaringan yang diinsisi" :disabled="readonly">
                          </div>
                          <div class="col-md-6">
                             <label class="field-label">Komplikasi</label>
                             <input type="text" class="field-input" v-model="form.komplikasi" placeholder="Jika ada komplikasi..." :disabled="readonly">
                          </div>

                          <!-- Info row: darah + kehadiran -->
                          <div class="col-12">
                             <div class="info-strip">
                                <div class="info-strip-item">
                                   <label class="field-label mb-1">Darah Masuk (cc)</label>
                                   <input type="text" class="field-input" v-model="form.darah_masuk" placeholder="e.g. 200" :disabled="readonly">
                                </div>
                                <div class="info-strip-item">
                                   <label class="field-label mb-1">Darah Hilang (cc)</label>
                                   <input type="text" class="field-input" v-model="form.darah_hilang" placeholder="e.g. 150" :disabled="readonly">
                                </div>
                                <div class="info-strip-item">
                                   <label class="field-label mb-1">Periksa PA?</label>
                                   <select class="field-input" v-model="form.pemeriksaan_pa" :disabled="readonly">
                                      <option value="Ya">Ya</option>
                                      <option value="Tidak">Tidak</option>
                                   </select>
                                </div>
                                <div class="info-strip-item">
                                   <label class="field-label mb-1">Dr. Anestesi Hadir?</label>
                                   <select class="field-input" v-model="form.dr_anestesi_hadir" :disabled="readonly">
                                      <option value="Ya">Ya</option>
                                      <option value="Tidak">Tidak</option>
                                   </select>
                                </div>
                                <div class="info-strip-item">
                                   <label class="field-label mb-1">Dr. Anak Hadir?</label>
                                   <select class="field-input" v-model="form.dr_anak_hadir" :disabled="readonly">
                                      <option value="Ya">Ya</option>
                                      <option value="Tidak">Tidak</option>
                                   </select>
                                </div>
                             </div>
                          </div>

                          <div class="col-12">
                             <label class="field-label">Laporan Operasi Lengkap</label>
                             <textarea class="field-input field-textarea" v-model="form.laporan_operasi" rows="6" placeholder="Tuliskan jalannya operasi secara detail..." :disabled="readonly"></textarea>
                          </div>
                       </div>
                    </div>
                 </div>

              </form>
           </div>

           <!-- Footer -->
           <div class="modal-footer-compact">
              <button type="button" class="btn-modal-cancel" @click="$emit('close')">
                <i class="fas fa-times me-1"></i>{{ readonly ? 'Tutup' : 'Batal' }}
              </button>
              <button v-if="!readonly" type="button" class="btn-modal-save" @click="$emit('submit')" :disabled="loading">
                 <span v-if="loading" class="spinner-border spinner-border-sm me-1" style="width:14px;height:14px;"></span>
                 <i v-else class="fas fa-save me-1"></i>
                 Simpan Laporan
              </button>
           </div>

        </div>
     </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  form: Object,
  pasien: Object,
  dokterList: Array,
  pegawaiList: Array,
  paketList: { type: Array, default: () => [] },
  jamMulai: { type: String, default: '' },
  loading: Boolean,
  readonly: {
      type: Boolean,
      default: false
  }
})

defineEmits(['close', 'submit'])

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* ===== Modal Backdrop + Shell ===== */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 900px;
}

.modal-shell {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* ===== Header ===== */
.modal-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  flex-shrink: 0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.modal-header-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.modal-header-sub {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-top: 1px;
}

.modal-close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.18s;
}
.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== Body ===== */
.modal-body-custom {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

/* ===== Patient Card ===== */
.patient-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.patient-avatar {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.patient-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.patient-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

.patient-meta i {
  margin-right: 4px;
  color: #94a3b8;
}

/* ===== Form Sections ===== */
.form-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 0.85rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.section-header i {
  font-size: 0.8rem;
  opacity: 0.85;
}

.section-blue {
  background: linear-gradient(90deg, #eff6ff, #dbeafe);
  color: #1e40af;
  border-bottom: 1px solid #bfdbfe;
}

.section-indigo {
  background: linear-gradient(90deg, #eef2ff, #e0e7ff);
  color: #3730a3;
  border-bottom: 1px solid #c7d2fe;
}

.section-teal {
  background: linear-gradient(90deg, #f0fdfa, #ccfbf1);
  color: #0f766e;
  border-bottom: 1px solid #99f6e4;
}

.section-body {
  padding: 0.9rem 1rem;
}

/* ===== Field Inputs ===== */
.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.required {
  color: #ef4444;
}

.field-input {
  display: block;
  width: 100%;
  font-size: 0.82rem;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.38rem 0.7rem;
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  height: 36px;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.field-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-textarea {
  height: auto !important;
  resize: vertical;
  line-height: 1.5;
}

/* Override v-select to match field-input style */
:deep(.vselect-custom .vs__dropdown-toggle) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.5rem;
  min-height: 36px;
  background: white;
  transition: border-color 0.18s, box-shadow 0.18s;
}
:deep(.vselect-custom .vs__dropdown-toggle:focus-within) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
:deep(.vselect-custom .vs__search) {
  font-size: 0.82rem;
  color: #1e293b;
}
:deep(.vselect-custom .vs__selected) {
  font-size: 0.82rem;
  color: #1e293b;
  margin: 2px 2px 0;
}
:deep(.vselect-custom .vs__clear),
:deep(.vselect-custom .vs__open-indicator) {
  fill: #94a3b8;
}

/* ===== Info Strip (compact row) ===== */
.info-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
}

.info-strip-item {
  flex: 1;
  min-width: 110px;
}

/* ===== Modal Footer ===== */
.modal-footer-compact {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.btn-modal-cancel {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.38rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;
}
.btn-modal-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #334155;
}

.btn-modal-save {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.4rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
.btn-modal-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}
.btn-modal-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
</style>

