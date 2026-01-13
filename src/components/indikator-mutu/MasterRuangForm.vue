<template>
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1055;">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-edit me-2"></i>
            {{ isEdit ? 'Edit' : 'Tambah' }} Master Indikator Mutu Ruang
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body bg-light">
          
          <!-- Tabs -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'identitas' }" href="#" @click.prevent="activeTab = 'identitas'">Identitas</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'teknis' }" href="#" @click.prevent="activeTab = 'teknis'">Teknis & Pengukuran</a>
            </li>
          </ul>

          <form @submit.prevent="save">
            <!-- Tab: Identitas -->
            <div v-if="activeTab === 'identitas'" class="bg-white p-3 rounded shadow-sm">
                <div class="mb-3">
                    <label class="form-label fw-bold">Nama Indikator <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.nama_inmut" required placeholder="Nama Indikator Mutu">
                </div>
                
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Nama Ruang / Unit <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="form.nama_ruang" required placeholder="Nama Ruang (Contoh: IGD)">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Kode Ruang (Dep ID)</label>
                        <input type="text" class="form-control" v-model="form.dep_id" placeholder="Optional">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label fw-bold">Status</label>
                        <select class="form-select" v-model="form.status">
                            <option value="1">Aktif</option>
                            <option value="0">Tdk Aktif</option>
                        </select>
                    </div>
                </div>

                <div class="row g-3 mb-3">
                     <div class="col-md-8">
                        <label class="form-label fw-bold">Jenis Indikator</label>
                        <input type="text" class="form-control" v-model="form.nama_jenis" placeholder="Contoh: Kepatuhan, Waktu Tunggu">
                    </div>
                     <div class="col-md-4">
                        <label class="form-label fw-bold">ID Jenis</label>
                        <input type="number" class="form-control" v-model="form.id_jenis" placeholder="Optional ID">
                    </div>
                </div>
                
                 <div class="mb-3">
                    <label class="form-label fw-bold">Link ke Master Utama (ID)</label>
                    <input type="number" class="form-control" v-model="form.id_master" placeholder="ID Master Inmut Utama (Optional)">
                    <small class="text-muted">Isi jika indikator ini turunan dari Master Utama</small>
                </div>
            </div>

            <!-- Tab: Teknis -->
            <div v-if="activeTab === 'teknis'" class="bg-white p-3 rounded shadow-sm">
                <div class="mb-3">
                    <label class="form-label fw-bold">Definisi Operasional</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.definisi_operasional" style="height: 150px; padding-bottom: 40px;" />
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Satuan</label>
                        <input type="text" class="form-control" v-model="form.satuan" placeholder="Contoh: %">
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
                    <label class="form-label fw-bold">Numerator (Pembilang)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_num" style="height: 100px; padding-bottom: 40px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Denominator (Penyebut)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_denum" style="height: 100px; padding-bottom: 40px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label fw-bold">Formula</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.formula" style="height: 100px; padding-bottom: 40px;" />
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
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  initialData: Object,
  isSaving: Boolean
})

const emit = defineEmits(['close', 'save'])

const activeTab = ref('identitas')
const form = reactive({
    id_inmut: null,
    nama_inmut: '',
    id_jenis: null,
    dep_id: '',
    nama_ruang: '',
    standar: null,
    rumus: '',
    status: 1,
    nama_jenis: '',
    ket_num: '',
    ket_denum: '',
    definisi_operasional: '',
    satuan: '',
    formula: '',
    id_master: null
})

const isEdit = ref(false)

watch(() => props.initialData, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
        Object.assign(form, newVal)
        isEdit.value = true
    } else {
        // Reset form
        Object.assign(form, {
            id_inmut: null,
            nama_inmut: '',
            id_jenis: null,
            dep_id: '',
            nama_ruang: '',
            standar: null,
            rumus: '',
            status: 1,
            nama_jenis: '',
            ket_num: '',
            ket_denum: '',
            definisi_operasional: '',
            satuan: '',
            formula: '',
            id_master: null
        })
        isEdit.value = false
    }
    activeTab.value = 'identitas'
}, { immediate: true })

const save = () => {
    emit('save', { ...form })
}
</script>
