<template>
  <div v-if="visible" class="modal fade show d-block modal-backdrop-custom" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <!-- Clean Light Modal Header -->
        <div class="modal-header border-bottom py-3 px-4 bg-white d-flex align-items-center justify-content-between">
          <div>
            <h6 class="modal-title fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-edit text-blue-600"></i>
              {{ isEdit ? 'Edit' : 'Tambah' }} Master Indikator Mutu Ruang
            </h6>
            <small class="text-slate-500">Lengkapi data master indikator mutu unit / ruangan</small>
          </div>
          <button type="button" class="btn-close-clean" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body p-4 bg-slate-50">
          <!-- Segmented Modal Tabs -->
          <div class="modal-tab-segment mb-3">
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'identitas' }" @click="activeTab = 'identitas'">
              <i class="fas fa-id-card me-1"></i> Identitas
            </button>
            <button type="button" class="modal-tab-btn" :class="{ active: activeTab === 'teknis' }" @click="activeTab = 'teknis'">
              <i class="fas fa-tools me-1"></i> Teknis & Pengukuran
            </button>
          </div>

          <form @submit.prevent="save">
            <!-- Tab: Identitas -->
            <div v-if="activeTab === 'identitas'" class="form-card">
                <div class="mb-3">
                    <label class="form-label-clean">Nama Indikator <span class="text-danger">*</span></label>
                    <input type="text" class="form-control compact-input-form" v-model="form.nama_inmut" required placeholder="Nama Indikator Mutu">
                </div>
                
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <label class="form-label-clean">Kode Ruang (Dep ID)</label>
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
                        <label class="form-label-clean">Nama Ruang / Unit <span class="text-danger">*</span></label>
                        <input type="text" class="form-control compact-input-form" v-model="form.nama_ruang" required placeholder="Nama Ruang (Contoh: IGD)">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label-clean">Status</label>
                        <select class="form-select compact-select-form" v-model="form.status">
                            <option value="1">Aktif</option>
                            <option value="0">Tdk Aktif</option>
                        </select>
                    </div>
                </div>

                <div class="row g-3 mb-3">
                     <div class="col-md-8">
                        <label class="form-label-clean">Jenis Indikator</label>
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
                        <label class="form-label-clean">ID Jenis</label>
                        <input type="number" class="form-control compact-input-form" v-model="form.id_jenis" placeholder="Optional ID" readonly>
                    </div>
                </div>
                
                 <div class="mb-3">
                    <label class="form-label-clean">Link ke Master Utama</label>
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
            <div v-if="activeTab === 'teknis'" class="form-card">
                <div class="mb-3">
                    <label class="form-label-clean">Definisi Operasional</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.definisi_operasional" style="height: 120px; padding-bottom: 35px;" />
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label-clean">Satuan</label>
                        <input type="text" class="form-control compact-input-form" v-model="form.satuan" placeholder="Contoh: %">
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
                    <label class="form-label-clean">Numerator (Pembilang)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_num" style="height: 90px; padding-bottom: 35px;" />
                </div>
                <div class="mb-3">
                    <label class="form-label-clean">Denominator (Penyebut)</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.ket_denum" style="height: 90px; padding-bottom: 35px;" />
                </div>
                 <div class="mb-3">
                    <label class="form-label-clean">Formula</label>
                    <QuillEditor theme="snow" toolbar="minimal" content-type="html" v-model:content="form.formula" style="height: 90px; padding-bottom: 35px;" />
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
