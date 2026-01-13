<template>
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1055;">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-file-signature me-2"></i>
            {{ isEdit ? 'Edit' : 'Tambah' }} Master Indikator Mutu Utama
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body bg-light">
          
          <!-- Tabs -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'umum' }" href="#" @click.prevent="activeTab = 'umum'">Data Umum</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'detail' }" href="#" @click.prevent="activeTab = 'detail'">Detail Indikator</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'metode' }" href="#" @click.prevent="activeTab = 'metode'">Metodologi</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'periode' }" href="#" @click.prevent="activeTab = 'periode'">Periode & PJ</a>
            </li>
          </ul>

          <form @submit.prevent="save">
            <!-- Tab: Umum -->
            <div v-if="activeTab === 'umum'" class="bg-white p-3 rounded shadow-sm">
                <div class="mb-3">
                    <label class="form-label fw-bold">Nama Indikator <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.nama_inmut" required placeholder="Contoh: Kepatuhan Identifikasi Pasien">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Kategori <span class="text-danger">*</span></label>
                    <select class="form-select" v-model="form.kategori" required>
                        <option value="" disabled>Pilih Kategori</option>
                        <option value="Indikator Mutu Nasional">Indikator Mutu Nasional</option>
                        <option value="Indikator Mutu Prioritas Rumah Sakit/SKP">Indikator Mutu Prioritas Rumah Sakit/SKP</option>
                        <option value="Indikator Mutu Prioritas Unit">Indikator Mutu Prioritas Unit</option>
                        <option value="Indikator Mutu Unit">Indikator Mutu Unit</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Dasar Pemikiran</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.dasar_pemikiran" style="height: 100px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Dimensi Mutu</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.dimensi" style="height: 100px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Tujuan</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.tujuan" style="height: 100px; padding-bottom: 40px;" />
                </div>
            </div>

            <!-- Tab: Detail -->
            <div v-if="activeTab === 'detail'" class="bg-white p-3 rounded shadow-sm">
                <div class="mb-3">
                    <label class="form-label fw-bold">Definisi Operasional</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.definisi" style="height: 150px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Jenis Indikator</label>
                    <input type="text" class="form-control" v-model="form.jenis_indikator" placeholder="Contoh: Proses, Output, Outcome">
                </div>
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Satuan</label>
                        <input type="text" class="form-control" v-model="form.satuan" placeholder="Contoh: %, menit, jam">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Standar</label>
                        <input type="number" step="0.01" class="form-control" v-model="form.standar">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label fw-bold">Rumus (Simbol)</label>
                         <select class="form-select" v-model="form.rumus">
                            <option value="1">=</option>
                            <option value="2">≤</option>
                            <option value="3">&lt;</option>
                            <option value="4">≥</option>
                            <option value="5">&gt;</option>
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Kriteria (Inklusi & Eksklusi)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.kriteria" style="height: 150px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Numerator (Pembilang)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_num" style="height: 100px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Denominator (Penyebut)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_denum" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Formula Pengukuran</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.formula" style="height: 100px; padding-bottom: 40px;" />
                </div>
            </div>

            <!-- Tab: Metodologi -->
            <div v-if="activeTab === 'metode'" class="bg-white p-3 rounded shadow-sm">
                 <div class="mb-3">
                    <label class="form-label fw-bold">Metode Pengumpulan Data</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.metode_pengumpulan_data" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Sumber Data</label>
                     <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.sumber_data" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Instrumen Pengambilan Data</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.instrumen_pengambilan_data" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Besar Sampel</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.besar_sampel" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Cara Pengambilan Sampel</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.cara_pengambilan_sampel" style="height: 100px; padding-bottom: 40px;" />
                </div>
            </div>

            <!-- Tab: Periode -->
            <div v-if="activeTab === 'periode'" class="bg-white p-3 rounded shadow-sm">
                 <div class="mb-3">
                    <label class="form-label fw-bold">Periode Pengumpulan Data</label>
                    <input type="text" class="form-control" v-model="form.periode_pengumpulan_data" placeholder="Contoh: Bulanan, Harian">
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Penyajian Data</label>
                    <input type="text" class="form-control" v-model="form.penyajian_data" placeholder="Contoh: Tabel, Grafik Control Chart">
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Periode Analisis</label>
                    <input type="text" class="form-control" v-model="form.periode_analisis" placeholder="Contoh: Triwulan">
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Penanggung Jawab (PJ)</label>
                    <input type="text" class="form-control" v-model="form.pj" placeholder="Nama / Jabatan PJ">
                </div>
            </div>
          </form>

        </div>
        <div class="modal-footer bg-white border-top">
          <button type="button" class="btn btn-light" @click="$emit('close')">Batal</button>
          <button type="button" class="btn btn-primary" @click="save" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            Simpan
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
