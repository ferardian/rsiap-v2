<template>
  <div v-if="visible" class="modal fade show d-block modal-backdrop-custom" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <!-- Clean Light Modal Header -->
        <div class="modal-header border-bottom py-3 px-4 bg-white d-flex align-items-center justify-content-between">
          <div>
            <h6 class="modal-title fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-file-signature text-blue-600"></i>
              {{ isEdit ? 'Edit' : 'Tambah' }} Master Indikator Mutu Utama
            </h6>
            <small class="text-slate-500">Isi kelengkapan data indikator mutu utama dengan benar</small>
          </div>
          <button type="button" class="btn-close-clean" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body p-4 bg-slate-50">
          <!-- Segmented Modal Tabs -->
          <div class="modal-tab-segment mb-3">
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'umum' }" @click="activeTab = 'umum'">
              <i class="fas fa-info-circle me-1"></i> Data Umum
            </button>
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'detail' }" @click="activeTab = 'detail'">
              <i class="fas fa-list-alt me-1"></i> Detail Indikator
            </button>
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'metode' }" @click="activeTab = 'metode'">
              <i class="fas fa-vial me-1"></i> Metodologi
            </button>
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'periode' }" @click="activeTab = 'periode'">
              <i class="fas fa-calendar-alt me-1"></i> Periode & PJ
            </button>
          </div>

          <form @submit.prevent="save">
            <!-- Tab: Umum -->
            <div v-if="activeTab === 'umum'" class="form-card">
                <div class="mb-3">
                    <label class="form-label-clean">Nama Indikator <span class="text-danger">*</span></label>
                    <input type="text" class="form-control compact-input-form" v-model="form.nama_inmut" required placeholder="Contoh: Kepatuhan Identifikasi Pasien">
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Kategori <span class="text-danger">*</span></label>
                    <select class="form-select compact-select-form" v-model="form.kategori" required>
                        <option value="" disabled>Pilih Kategori</option>
                        <option value="Indikator Mutu Nasional">Indikator Mutu Nasional</option>
                        <option value="Indikator Mutu Prioritas Rumah Sakit">Indikator Mutu Prioritas Rumah Sakit</option>
                        <option value="Indikator Mutu Prioritas Unit">Indikator Mutu Prioritas Unit</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Dasar Pemikiran</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.dasar_pemikiran" style="height: 90px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Dimensi Mutu</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.dimensi" style="height: 90px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Tujuan</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.tujuan" style="height: 90px; padding-bottom: 35px;" />
                </div>
            </div>

            <!-- Tab: Detail -->
            <div v-if="activeTab === 'detail'" class="form-card">
                <div class="mb-3">
                    <label class="form-label-clean">Definisi Operasional</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.definisi" style="height: 120px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Jenis Indikator</label>
                    <input type="text" class="form-control compact-input-form" v-model="form.jenis_indikator" placeholder="Contoh: Proses, Output, Outcome">
                </div>
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label-clean">Satuan</label>
                        <input type="text" class="form-control compact-input-form" v-model="form.satuan" placeholder="Contoh: %, menit, jam">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label-clean">Standar</label>
                        <input type="number" step="0.01" class="form-control compact-input-form" v-model="form.standar">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label-clean">Rumus (Simbol)</label>
                         <select class="form-select compact-select-form" v-model="form.rumus">
                            <option value="1">=</option>
                            <option value="2">≤</option>
                            <option value="3">&lt;</option>
                            <option value="4">≥</option>
                            <option value="5">&gt;</option>
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Kriteria (Inklusi & Eksklusi)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.kriteria" style="height: 120px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Numerator (Pembilang)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_num" style="height: 90px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Denominator (Penyebut)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_denum" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Formula Pengukuran</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.formula" style="height: 90px; padding-bottom: 35px;" />
                </div>
            </div>

            <!-- Tab: Metodologi -->
            <div v-if="activeTab === 'metode'" class="form-card">
                 <div class="mb-3">
                    <label class="form-label-clean">Metode Pengumpulan Data</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.metode_pengumpulan_data" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Sumber Data</label>
                     <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.sumber_data" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Instrumen Pengambilan Data</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.instrumen_pengambilan_data" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Besar Sampel</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.besar_sampel" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Cara Pengambilan Sampel</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.cara_pengambilan_sampel" style="height: 90px; padding-bottom: 35px;" />
                </div>
            </div>

            <!-- Tab: Periode -->
            <div v-if="activeTab === 'periode'" class="form-card">
                 <div class="mb-3">
                    <label class="form-label-clean">Periode Pengumpulan Data</label>
                    <input type="text" class="form-control compact-input-form" v-model="form.periode_pengumpulan_data" placeholder="Contoh: Bulanan, Harian">
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Penyajian Data</label>
                    <input type="text" class="form-control compact-input-form" v-model="form.penyajian_data" placeholder="Contoh: Tabel, Grafik Control Chart">
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Periode Analisis</label>
                    <input type="text" class="form-control compact-input-form" v-model="form.periode_analisis" placeholder="Contoh: Triwulan">
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Penanggung Jawab (PJ)</label>
                    <input type="text" class="form-control compact-input-form" v-model="form.pj" placeholder="Nama / Jabatan PJ">
                </div>
            </div>
          </form>

        </div>
        <div class="modal-footer bg-white border-top py-2.5 px-4 d-flex justify-content-end gap-2">
          <button type="button" class="btn-cancel-clean" @click="$emit('close')">Batal</button>
          <button type="button" class="btn-save-clean" @click="save" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="fas fa-check me-1.5"></i> Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  initialData: Object,
  isSaving: Boolean
})

const emit = defineEmits(['close', 'save'])

const activeTab = ref('umum')
const form = reactive({
    id_master: null,
    nama_inmut: '',
    dasar_pemikiran: '',
    dimensi: '',
    tujuan: '',
    definisi: '',
    kategori: '',
    jenis_indikator: '',
    satuan: '',
    ket_num: '',
    ket_denum: '',
    standar: null,
    rumus: '',
    kriteria: '',
    formula: '',
    metode_pengumpulan_data: '',
    sumber_data: '',
    instrumen_pengambilan_data: '',
    besar_sampel: '',
    cara_pengambilan_sampel: '',
    periode_pengumpulan_data: '',
    penyajian_data: '',
    periode_analisis: '',
    pj: ''
})

const isEdit = ref(false)

watch(() => props.initialData, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
        Object.assign(form, newVal)
        isEdit.value = true
    } else {
        // Reset form
        Object.assign(form, {
            id_master: null,
            nama_inmut: '',
            dasar_pemikiran: '',
            dimensi: '',
            tujuan: '',
            definisi: '',
            kategori: '',
            jenis_indikator: '',
            satuan: '',
            ket_num: '',
            ket_denum: '',
            standar: null,
            rumus: '',
            kriteria: '',
            formula: '',
            metode_pengumpulan_data: '',
            sumber_data: '',
            instrumen_pengambilan_data: '',
            besar_sampel: '',
            cara_pengambilan_sampel: '',
            periode_pengumpulan_data: '',
            penyajian_data: '',
            periode_analisis: '',
            pj: ''
        })
        isEdit.value = false
    }
    activeTab.value = 'umum'
}, { immediate: true })

const save = () => {
    emit('save', { ...form })
}
</script>

<style scoped>
.modal-backdrop-custom {
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1055;
}

.text-slate-800 { color: #1e293b; }
.text-slate-500 { color: #64748b; }
.text-blue-600 { color: #2563eb; }

.btn-close-clean {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-clean:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.modal-tab-segment {
  display: flex;
  background: #e2e8f0;
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
  overflow-x: auto;
}

.modal-tab-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.modal-tab-btn:hover:not(.active) {
  color: #334155;
}

.modal-tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-label-clean {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
}

.compact-input-form {
  height: 36px;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.compact-input-form:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.compact-select-form {
  height: 36px;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  color: #334155;
}

.compact-select-form:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.btn-cancel-clean {
  padding: 0.45rem 1.15rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-clean:hover {
  background: #e2e8f0;
}

.btn-save-clean {
  padding: 0.45rem 1.25rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.btn-save-clean:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: none;
  }
}
</style>
