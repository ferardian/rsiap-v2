<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1060;">
     <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow-lg">
           <div class="modal-header bg-primary text-white">
              <h5 class="modal-title"><i class="fas fa-file-medical me-2"></i>Laporan Operasi</h5>
              <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
           </div>
           <div class="modal-body p-4" style="max-height: 80vh; overflow-y: auto;">
              <form @submit.prevent="$emit('submit')">
                 
                 <!-- Identitas & Waktu -->
                 <h6 class="fw-bold text-primary mb-3 border-bottom pb-2">Data Operasi</h6>
                 <div class="row g-3 mb-4">
                    <div class="col-md-3">
                       <label class="form-label small fw-bold">No. Rawat</label>
                       <input type="text" class="form-control" v-model="form.no_rawat" readonly disabled>
                    </div>
                     <div class="col-md-3">
                       <label class="form-label small fw-bold">Tanggal Operasi</label>
                       <input type="text" class="form-control" :value="formatDate(form.tgl_operasi)" readonly disabled>
                    </div>
                    <div class="col-md-3">
                       <label class="form-label small fw-bold">Jam Selesai <span class="text-danger">*</span></label>
                       <input type="datetime-local" class="form-control" v-model="form.tgl_selesai" required :disabled="readonly">
                    </div>
                    <div class="col-md-3">
                       <label class="form-label small fw-bold">Kategori</label>
                       <select class="form-select" v-model="form.kategori" :disabled="readonly">
                          <option value="-">-</option>
                          <option value="Elektive">Elektive</option>
                          <option value="Emergency">Emergency</option>
                       </select>
                    </div>
                    <div class="col-md-4">
                       <label class="form-label small fw-bold">Jenis Anestesi <span class="text-danger">*</span></label>
                       <input type="text" class="form-control" v-model="form.jenis_anestesi" placeholder="Contoh: General Anestesi" required :disabled="readonly">
                    </div>
                 </div>

                 <!-- Tim Operasi -->
                 <h6 class="fw-bold text-primary mb-3 border-bottom pb-2">Tim Operasi</h6>
                 <div class="row g-3 mb-4">
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Operator Utama <span class="text-danger">*</span></label>
                         <v-select
                              v-model="form.operator1"
                              :options="dokterList"
                              :reduce="dokter => dokter.kd_dokter"
                              label="nm_dokter"
                              placeholder="Pilih Dokter Operator"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Dokter Anestesi</label>
                          <v-select
                              v-model="form.dokter_anestesi"
                              :options="dokterList"
                              :reduce="dokter => dokter.kd_dokter"
                              label="nm_dokter"
                              placeholder="Pilih Dokter Anestesi"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Asisten Operator 1</label>
                          <v-select
                              v-model="form.asisten_operator1"
                              :options="pegawaiList"
                              :reduce="pgw => pgw.nik"
                              label="nama"
                              placeholder="Pilih Asisten 1"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Asisten Anestesi</label>
                          <v-select
                              v-model="form.asisten_anestesi"
                              :options="pegawaiList"
                              :reduce="pgw => pgw.nik"
                              label="nama"
                              placeholder="Pilih Asisten Anestesi"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                      <div class="col-md-6">
                         <label class="form-label small fw-bold">Asisten Operator 2</label>
                          <v-select
                              v-model="form.asisten_operator2"
                              :options="pegawaiList"
                              :reduce="pgw => pgw.nik"
                              label="nama"
                              placeholder="Pilih Asisten 2"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                      <div class="col-md-6">
                         <label class="form-label small fw-bold">Dokter Anak</label>
                          <v-select
                              v-model="form.dokter_anak"
                              :options="dokterList"
                              :reduce="dokter => dokter.kd_dokter"
                              label="nm_dokter"
                              placeholder="Pilih Dokter Anak"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Onloop (Perawat Sirkuler)</label>
                          <v-select
                              v-model="form.onloop"
                              :options="pegawaiList"
                              :reduce="pgw => pgw.nik"
                              label="nama"
                              placeholder="Pilih Onloop"
                              :disabled="readonly"
                         ></v-select>
                     </div>
                 </div>

                 <!-- Data Klinis & Laporan -->
                 <h6 class="fw-bold text-primary mb-3 border-bottom pb-2">Laporan & Klinis</h6>
                 <div class="row g-3">
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Diagnosa Pre-Operasi</label>
                         <input type="text" class="form-control" v-model="form.diagnosa_preop" placeholder="Diagnosa Awal" :disabled="readonly">
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Diagnosa Post-Operasi</label>
                         <input type="text" class="form-control" v-model="form.diagnosa_postop" placeholder="Diagnosa Akhir" :disabled="readonly">
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Jaringan Insisi</label>
                         <input type="text" class="form-control" v-model="form.jaringan_insisi" :disabled="readonly">
                     </div>
                     <div class="col-md-6">
                         <label class="form-label small fw-bold">Komplikasi</label>
                         <input type="text" class="form-control" v-model="form.komplikasi" :disabled="readonly">
                     </div>
                     
                     <div class="col-md-3">
                        <label class="form-label small fw-bold">Darah Masuk</label>
                        <input type="text" class="form-control" v-model="form.darah_masuk" :disabled="readonly">
                     </div>
                     <div class="col-md-3">
                        <label class="form-label small fw-bold">Darah Hilang</label>
                        <input type="text" class="form-control" v-model="form.darah_hilang" :disabled="readonly">
                     </div>
                     <div class="col-md-2">
                         <label class="form-label small fw-bold">Periksa PA?</label>
                         <select class="form-select" v-model="form.pemeriksaan_pa" :disabled="readonly">
                             <option value="Ya">Ya</option>
                             <option value="Tidak">Tidak</option>
                         </select>
                     </div>
                     <div class="col-md-2">
                         <label class="form-label small fw-bold">Dr. Anestesi Hadir?</label>
                         <select class="form-select" v-model="form.dr_anestesi_hadir" :disabled="readonly">
                             <option value="Ya">Ya</option>
                             <option value="Tidak">Tidak</option>
                         </select>
                     </div>
                     <div class="col-md-2">
                         <label class="form-label small fw-bold">Dr. Anak Hadir?</label>
                         <select class="form-select" v-model="form.dr_anak_hadir" :disabled="readonly">
                             <option value="Ya">Ya</option>
                             <option value="Tidak">Tidak</option>
                         </select>
                     </div>

                     <div class="col-12 mt-3">
                         <label class="form-label small fw-bold">Laporan Operasi Lengkap</label>
                         <textarea class="form-control" v-model="form.laporan_operasi" rows="6" placeholder="Tuliskan jalannya operasi secara detail..." :disabled="readonly"></textarea>
                     </div>
                 </div>

              </form>
           </div>
           <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ readonly ? 'Tutup' : 'Batal' }}</button>
              <button v-if="!readonly" type="button" class="btn btn-primary" @click="$emit('submit')" :disabled="loading">
                 <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                 <i v-else class="fas fa-save me-2"></i>
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
  dokterList: Array,
  pegawaiList: Array,
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
