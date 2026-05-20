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
          <ul class="nav nav-tabs mb-3 flex-nowrap overflow-auto pb-1 custom-tabs">
            <li class="nav-item">
              <a class="nav-link text-nowrap" :class="{ active: activeTab === 'identitas' }" href="#" @click.prevent="activeTab = 'identitas'">Identitas</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-nowrap" :class="{ active: activeTab === 'teknis' }" href="#" @click.prevent="activeTab = 'teknis'">Teknis & Pengukuran</a>
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
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Kode Ruang (Dep ID)</label>
                        <v-select 
                            :options="departments" 
                            label="nama" 
                            v-model="selectedDepartment"
                            :reduce="dept => dept.dep_id"
                            placeholder="Pilih Departemen"
                            class="style-chooser"
                            @update:modelValue="handleDepartmentChange"
                        >
                            <template #option="{ nama, dep_id }">
                                <span class="fw-bold">{{ dep_id }}</span> - {{ nama }}
                            </template>
                            <template #selected-option="{ nama, dep_id }">
                                <span class="fw-bold">{{ dep_id }}</span> - {{ nama }}
                            </template>
                        </v-select>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label fw-bold">Nama Ruang / Unit <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="form.nama_ruang" required placeholder="Nama Ruang (Contoh: IGD)">
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
                        <v-select 
                            :options="jenisIndikatorOptions" 
                            label="label" 
                            v-model="selectedJenisIndikator"
                            :reduce="item => item.value"
                            placeholder="Pilih Jenis Indikator"
                            class="style-chooser"
                            @update:modelValue="handleJenisChange"
                        />
                    </div>
                     <div class="col-md-4">
                        <label class="form-label fw-bold">ID Jenis</label>
                        <input type="number" class="form-control" v-model="form.id_jenis" placeholder="Optional ID" readonly>
                    </div>
                </div>
                
                 <div class="mb-3">
                    <label class="form-label fw-bold">Link ke Master Utama</label>
                    <v-select 
                        :options="masterUtamaList" 
                        label="nama_inmut" 
                        v-model="form.id_master"
                        :reduce="item => item.id_master"
                        placeholder="Cari & Pilih Master Utama (Optional)"
                        class="style-chooser"
                        @update:modelValue="handleMasterUtamaChange"
                    >
                        <template #option="{ nama_inmut, kategori }">
                            <div>
                                <div class="fw-bold">{{ nama_inmut }}</div>
                                <small class="text-muted">{{ kategori }}</small>
                            </div>
                        </template>
                    </v-select>
                    <small class="text-muted">Hubungkan indikator ini dengan Master Utama jika tersedia</small>
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
import { ref, reactive, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import departemenService from '@/services/departemenService'
import indikatorMutuService from '@/services/indikatorMutuService'

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
const departments = ref([])
const masterUtamaList = ref([])
const selectedDepartment = ref(null)
const selectedJenisIndikator = ref(null)

const jenisIndikatorOptions = [
    { value: 'Indikator Mutu Nasional', label: 'Indikator Mutu Nasional', id: 2 },
    { value: 'Indikator Mutu Prioritas Rumah Sakit', label: 'Indikator Mutu Prioritas Rumah Sakit', id: 3 },
    { value: 'Indikator Mutu Prioritas Unit', label: 'Indikator Mutu Prioritas Unit', id: 4 },
    { value: 'Indikator Mutu Unit', label: 'Indikator Mutu Unit', id: 5 }
]

watch(() => props.initialData, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
        Object.assign(form, newVal)
        // Set selected department for edit mode
        if (newVal.dep_id) {
            selectedDepartment.value = newVal.dep_id
        }
        // Set selected jenis indikator for edit mode
        if (newVal.nama_jenis) {
            selectedJenisIndikator.value = newVal.nama_jenis
        }
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
        selectedDepartment.value = null
        selectedJenisIndikator.value = null
        isEdit.value = false
    }
    activeTab.value = 'identitas'
}, { immediate: true })

const fetchDepartments = async () => {
    try {
        const response = await departemenService.index({ limit: 1000 })
        departments.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching departments:', error)
    }
}

const fetchMasterUtama = async () => {
    try {
        const response = await indikatorMutuService.getUtama({ limit: 1000 })
        masterUtamaList.value = response.data.data.data || []
    } catch (error) {
        console.error('Error fetching Master Utama:', error)
    }
}

const handleDepartmentChange = (depId) => {
    form.dep_id = depId
    const dept = departments.value.find(d => d.dep_id === depId)
    if (dept) {
        form.nama_ruang = dept.nama
    }
}

const handleJenisChange = (value) => {
    form.nama_jenis = value
    const jenis = jenisIndikatorOptions.find(j => j.value === value)
    if (jenis) {
        form.id_jenis = jenis.id
    }
}

const handleMasterUtamaChange = async (idMaster) => {
    if (!idMaster) {
        form.id_master = null
        return
    }

    const master = masterUtamaList.value.find(m => m.id_master === idMaster)
    if (master) {
        // If the form has any typed / non-empty values, ask the user before overwriting
        const hasExistingData = form.nama_inmut || form.standar || form.ket_num || form.ket_denum || form.definisi_operasional || form.formula

        let shouldFill = true
        if (hasExistingData) {
            const result = await Swal.fire({
                title: 'Salin Detail Master Utama?',
                text: 'Apakah Anda ingin memperbarui detail teknis (nama, kategori, standar, rumus, definisi operasional, dll) sesuai dengan data Master Utama ini? Pilihan "Tidak" akan tetap menghubungkan indikator tanpa mengubah isian Anda saat ini.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#aaa',
                confirmButtonText: 'Ya, Update Semua',
                cancelButtonText: 'Tidak, Cukup Hubungkan Saja'
            })
            shouldFill = result.isConfirmed
        }

        if (shouldFill) {
            // Auto-fill form fields from Master Utama
            if (master.nama_inmut) form.nama_inmut = master.nama_inmut
            if (master.kategori) form.nama_jenis = master.kategori
            if (master.satuan) form.satuan = master.satuan
            if (master.standar !== null && master.standar !== undefined) form.standar = master.standar
            if (master.rumus !== null && master.rumus !== undefined) form.rumus = master.rumus
            if (master.ket_num) form.ket_num = master.ket_num
            if (master.ket_denum) form.ket_denum = master.ket_denum
            if (master.definisi) form.definisi_operasional = master.definisi
            if (master.formula) form.formula = master.formula

            // Also update the selected jenis indikator dropdown if matched
            if (master.kategori) {
                selectedJenisIndikator.value = master.kategori
                const jenis = jenisIndikatorOptions.find(j => j.value === master.kategori)
                if (jenis) {
                    form.id_jenis = jenis.id
                }
            }
        }
    }
}

const save = () => {
    emit('save', { ...form })
}

onMounted(() => {
    fetchDepartments()
    fetchMasterUtama()
})
</script>

<style scoped>
.custom-tabs::-webkit-scrollbar {
    height: 4px;
}
.custom-tabs::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 10px;
}

@media (max-width: 768px) {
    .modal-dialog {
        margin: 0.5rem;
        max-width: none;
    }
    
    .modal-body {
        padding: 0.75rem !important;
    }

    .bg-white.p-3 {
        padding: 1rem !important;
    }

    :deep(.ql-editor) {
        min-height: 120px !important;
    }
}
</style>
