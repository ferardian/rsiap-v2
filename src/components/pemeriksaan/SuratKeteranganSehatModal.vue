<template>
  <div v-if="visible" class="surat-sehat-modal-overlay" @click.self="close">
    <div class="modal-content-custom border-0 shadow-2xl animate__animated animate__zoomIn animate__faster" 
         style="width: 100%; max-width: 680px; height: auto; max-height: 88vh; border-radius: 20px; overflow: hidden; background: #fafafa; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;">
      
      <!-- Header: Emerald/Green Gradient with Heartbeat Icon -->
      <div class="d-flex align-items-center justify-content-between py-3 px-4 text-white position-relative" 
           style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); flex-shrink: 0; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); z-index: 10;">
        <div class="d-flex align-items-center">
          <div class="rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background-color: rgba(255, 255, 255, 0.2);">
            <i class="fas fa-heartbeat text-white fs-5"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h6 class="mb-0 fw-bold text-white" style="letter-spacing: 0.5px; font-size: 0.95rem;">Surat Keterangan Sehat</h6>
              <span class="badge bg-white text-success px-2 py-0.5 fw-bold" style="font-size: 0.65rem; border-radius: 6px;">Bilingual Ready 🇮🇩/🇬🇧</span>
            </div>
            <small class="text-white text-opacity-80" style="font-size: 0.75rem;">Medical Health Certificate (Indonesia & English Version)</small>
          </div>
        </div>
        <button type="button" class="btn-close-custom bg-white bg-opacity-10 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style="width: 26px; height: 26px; border: none; font-size: 1.25rem; line-height: 1; transition: all 0.2s; cursor: pointer;" @click="close">×</button>
      </div>

      <!-- Body: Scrollable Input Fields -->
      <div class="modal-body-custom p-3" style="overflow-y: auto; flex-grow: 1; max-height: calc(88vh - 130px);">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted fw-medium small">Memuat data surat sehat...</p>
        </div>

        <div v-else>
          <!-- Patient Summary Card -->
          <div v-if="regData" 
               class="d-flex align-items-center p-2 mb-3 border border-light shadow-sm bg-white" 
               style="border-radius: 12px; background: linear-gradient(to right, #ffffff, #f0fdf4);">
            <div class="avatar-circle me-3 d-flex align-items-center justify-content-center shadow-sm" 
                 style="width: 38px; height: 38px; min-width: 38px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%;">
              <span class="text-white fw-bold fs-5">{{ regData.pasien?.nm_pasien?.charAt(0) }}</span>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">{{ regData.pasien?.nm_pasien }}</h6>
                <span class="badge rounded-pill bg-success bg-opacity-10 text-success px-2 py-0.5 fw-semibold" style="font-size: 0.7rem;">
                  {{ regData.pasien?.jk === 'L' ? 'Laki-Laki (Male)' : 'Perempuan (Female)' }}
                </span>
              </div>
              <p class="mb-0 text-muted small mt-0.5 d-flex flex-wrap gap-2" style="font-size: 0.75rem;">
                <span><strong>RM:</strong> {{ regData.no_rkm_medis }}</span>
                <span class="text-secondary">•</span>
                <span><strong>NIK/KTP:</strong> {{ regData.pasien?.no_ktp || '-' }}</span>
                <span class="text-secondary">•</span>
                <span><strong>Rawat:</strong> {{ regData.no_rawat }}</span>
                <span v-if="regData.dokter?.nm_dokter" class="text-secondary">•</span>
                <span v-if="regData.dokter?.nm_dokter"><strong>DPJP:</strong> {{ regData.dokter.nm_dokter }}</span>
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <form id="suratSehatModalForm" @submit.prevent="save(false)" class="row g-2">
            <!-- Administrasi -->
            <div class="col-12 mt-1">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-file-alt text-success" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Detail Administrasi</span>
              </div>
            </div>

            <div class="col-md-7">
              <label class="form-label-custom mb-1"><i class="fas fa-barcode me-1 text-success"></i> No. Surat</label>
              <div class="d-flex align-items-stretch gap-2">
                <div class="input-group flex-grow-1">
                  <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-hashtag text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                    v-model="form.no_surat" 
                    placeholder="Contoh: 001/SKD/B-RSIA/070926"
                    required
                  >
                </div>
                <button 
                  class="btn btn-outline-success d-flex align-items-center justify-content-center" 
                  type="button" 
                  style="border-radius: 8px; border: 1.5px solid #10b981; transition: all 0.2s; width: 34px; min-width: 34px; max-width: 34px; padding: 0;"
                  title="Generate Nomor Baru"
                  @click="fetchNextNumber"
                >
                  <i class="fas fa-sync-alt" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>

            <div class="col-md-5">
              <label class="form-label-custom mb-1"><i class="fas fa-calendar-alt me-1 text-success"></i> Tanggal Surat</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                style="border: 1.5px solid #edf2f7; border-radius: 8px;"
                v-model="form.tanggalsurat"
                @change="onDateChanged"
                required
              >
            </div>

            <!-- Pemeriksaan Fisik & TTV -->
            <div class="col-12 mt-3">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-heartbeat text-success" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Pemeriksaan Fisik & TTV</span>
              </div>
            </div>

            <div class="col-md-4 col-6">
              <label class="form-label-custom mb-1"><i class="fas fa-tachometer-alt me-1 text-success"></i> Tekanan Darah</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-tint text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.tensi"
                  placeholder="120/80 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-4 col-6">
              <label class="form-label-custom mb-1"><i class="fas fa-weight me-1 text-success"></i> Berat Badan (kg)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-balance-scale text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.berat"
                  placeholder="60 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-4 col-6">
              <label class="form-label-custom mb-1"><i class="fas fa-ruler-vertical me-1 text-success"></i> Tinggi Badan (cm)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-child text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.tinggi"
                  placeholder="165 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-4 col-6">
              <label class="form-label-custom mb-1"><i class="fas fa-thermometer-half me-1 text-success"></i> Suhu (°C)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-temperature-low text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.suhu"
                  placeholder="36.5 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-8 col-12">
              <label class="form-label-custom mb-1"><i class="fas fa-eye me-1 text-success"></i> Buta Warna (Color Blindness)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-eye-slash text-muted"></i></span>
                <select 
                  class="form-select form-select-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.butawarna" 
                  required
                >
                  <option value="Tidak">Tidak Buta Warna (Normal)</option>
                  <option value="Ya">Ya Buta Warna (Color Blind)</option>
                  <option value="Parsial">Parsial (Partial Color Blind)</option>
                </select>
              </div>
            </div>

            <!-- Keperluan & Kesimpulan -->
            <div class="col-12 mt-3">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-clipboard-check text-success" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Keperluan & Kesimpulan</span>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label-custom mb-1"><i class="fas fa-bullseye me-1 text-success"></i> Keperluan (Purpose)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-tag text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.keperluan"
                  placeholder="Contoh: Persyaratan Visa / Bekerja / Melanjutkan Studi / dll"
                  required
                >
              </div>
            </div>

            <div class="col-12 mt-2">
              <label class="form-label-custom mb-1"><i class="fas fa-check-double me-1 text-success"></i> Kesimpulan Kesehatan (Verdict)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-certificate text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                  v-model="form.kesimpulan"
                  placeholder="Contoh: SEHAT / HEALTHY"
                  required
                >
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer: Dual Print Actions (Indonesian & English) -->
      <div v-if="!isLoading" class="modal-footer-custom py-2.5 px-4 d-flex justify-content-between align-items-center border-top" 
           style="background: #ffffff; flex-shrink: 0; z-index: 10;">
        <div>
          <button 
            v-if="form.no_surat && savedData" 
            type="button" 
            class="btn btn-premium-danger" 
            @click="deleteSurat"
            :disabled="isDeleting"
            title="Hapus Surat Keterangan Sehat"
          >
            <i v-if="isDeleting" class="spinner-border spinner-border-sm me-1.5"></i>
            <i v-else class="fas fa-trash-alt me-1.5"></i> Hapus
          </button>
        </div>
        
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-premium-secondary" @click="close">
            Batal
          </button>
          
          <button 
            v-if="savedData"
            type="button" 
            class="btn btn-premium-print-id" 
            @click="printSurat('id')"
            title="Cetak Surat Keterangan Sehat versi Bahasa Indonesia"
          >
            <i class="fas fa-print me-1.5"></i> Cetak (ID) 🇮🇩
          </button>

          <button 
            v-if="savedData"
            type="button" 
            class="btn btn-premium-print-en" 
            @click="printSurat('en')"
            title="Print Medical Certificate in English Version"
          >
            <i class="fas fa-globe-americas me-1.5"></i> Print (EN) 🇬🇧
          </button>
          
          <button 
            type="submit" 
            form="suratSehatModalForm"
            class="btn btn-premium-save" 
            :disabled="isSaving"
          >
            <i v-if="isSaving" class="spinner-border spinner-border-sm me-1.5"></i>
            <i v-else class="fas fa-save me-1.5"></i> Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import rawatJalanService from '@/services/rawatJalanService'
import { useToast } from 'vue-toastification'
import logoRsiaAsset from '@/assets/logo.png'

const toast = useToast()
const logoRsiaUrl = logoRsiaAsset

const emit = defineEmits(['close', 'saved', 'deleted'])

const visible = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const form = ref({
  no_surat: '',
  no_rawat: '',
  tanggalsurat: '',
  berat: '',
  tinggi: '',
  tensi: '',
  suhu: '',
  butawarna: 'Tidak',
  keperluan: '',
  kesimpulan: 'SEHAT'
})

const regData = ref(null)
const savedData = ref(null)

const onDateChanged = () => {
  if (!savedData.value) {
    fetchNextNumber()
  }
}

const open = async (param) => {
  const noRawat = typeof param === 'object' && param !== null ? (param.no_rawat || param.noRawat) : param
  if (!noRawat) return

  visible.value = true
  isLoading.value = true
  document.body.style.overflow = 'hidden'

  const today = new Date().toISOString().split('T')[0]
  form.value = {
    no_surat: '',
    no_rawat: noRawat,
    tanggalsurat: today,
    berat: '',
    tinggi: '',
    tensi: '',
    suhu: '',
    butawarna: 'Tidak',
    keperluan: 'Persyaratan Berkas',
    kesimpulan: 'SEHAT'
  }
  regData.value = null
  savedData.value = null

  try {
    const response = await rawatJalanService.getSuratSehat(noRawat)
    if (response.data && response.data.success) {
      const data = response.data.data
      regData.value = data.reg_periksa
      savedData.value = data.surat || null

      if (data.surat) {
        form.value = {
          no_surat: data.surat.no_surat,
          no_rawat: data.surat.no_rawat,
          tanggalsurat: data.surat.tanggalsurat,
          berat: data.surat.berat,
          tinggi: data.surat.tinggi,
          tensi: data.surat.tensi,
          suhu: data.surat.suhu,
          butawarna: data.surat.butawarna,
          keperluan: data.surat.keperluan,
          kesimpulan: data.surat.kesimpulan
        }
      } else {
        await fetchNextNumber()
        if (data.pemeriksaan_ralan) {
          if (data.pemeriksaan_ralan.berat && data.pemeriksaan_ralan.berat !== '-') {
            form.value.berat = data.pemeriksaan_ralan.berat
          }
          if (data.pemeriksaan_ralan.tinggi && data.pemeriksaan_ralan.tinggi !== '-') {
            form.value.tinggi = data.pemeriksaan_ralan.tinggi
          }
          if (data.pemeriksaan_ralan.tensi && data.pemeriksaan_ralan.tensi !== '-') {
            form.value.tensi = data.pemeriksaan_ralan.tensi
          }
          if (data.pemeriksaan_ralan.suhu && data.pemeriksaan_ralan.suhu !== '-') {
            form.value.suhu = data.pemeriksaan_ralan.suhu
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading surat sehat:', error)
    toast.error('Gagal memuat data surat keterangan sehat')
  } finally {
    isLoading.value = false
  }
}

const fetchNextNumber = async () => {
  try {
    const res = await rawatJalanService.getNextSuratSehatNumber(form.value.tanggalsurat)
    if (res.data && res.data.success) {
      form.value.no_surat = res.data.no_surat
    }
  } catch (e) {
    console.error('Error fetching next surat sehat number:', e)
  }
}

const close = () => {
  visible.value = false
  document.body.style.overflow = ''
  emit('close')
}

const save = async (andPrintLang = null) => {
  isSaving.value = true
  try {
    const response = await rawatJalanService.saveSuratSehat(form.value)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat Keterangan Sehat berhasil disimpan')
      savedData.value = { ...form.value }
      emit('saved', form.value)
      
      if (andPrintLang) {
        printSurat(andPrintLang)
      }
    } else {
      toast.error(response.data.message || 'Gagal menyimpan surat sehat')
    }
  } catch (error) {
    console.error('Error saving surat sehat:', error)
    toast.error('Gagal menyimpan surat keterangan sehat')
  } finally {
    isSaving.value = false
  }
}

const deleteSurat = async () => {
  if (!form.value.no_surat) return
  if (!confirm(`Apakah Anda yakin ingin menghapus surat nomor: ${form.value.no_surat}?`)) {
    return
  }

  isDeleting.value = true
  try {
    const response = await rawatJalanService.deleteSuratSehat(form.value.no_surat)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat berhasil dihapus')
      emit('deleted', form.value.no_surat)
      close()
    } else {
      toast.error(response.data.message || 'Gagal menghapus surat')
    }
  } catch (error) {
    console.error('Error deleting surat sehat:', error)
    toast.error('Gagal menghapus surat sehat')
  } finally {
    isDeleting.value = false
  }
}

const printSurat = (lang = 'id') => {
  const data = regData.value
  const f = form.value
  if (!data || !f.no_surat) return

  const formatTglIndo = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTglEnglish = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const nama = data.pasien?.nm_pasien || '-'
  const nik = data.pasien?.no_ktp || '-'
  const dokter = data.dokter?.nm_dokter || '-'
  const sipDokter = data.dokter?.no_ijn_praktek || '-'
  const umurIndo = data.pasien?.age_formatted || '-'
  const umurEng = data.pasien?.age_years ? `${data.pasien.age_years} years old` : umurIndo
  const tglLahirEng = data.pasien?.tgl_lahir ? formatTglEnglish(data.pasien.tgl_lahir) : '-'
  const alamat = data.pasien?.alamat || '-'
  const pekerjaan = data.pasien?.pekerjaan || '-'

  let html = ''

  if (lang === 'en') {
    // ENGLISH VERSION: Medical Certificate / Certificate of Health
    const tglSuratEng = formatTglEnglish(f.tanggalsurat)
    const genderEng = data.pasien?.jk === 'L' ? 'Male' : 'Female'
    let colorVisionEng = 'Normal'
    if (f.butawarna === 'Ya') colorVisionEng = 'Color Blind (Defective)'
    if (f.butawarna === 'Parsial') colorVisionEng = 'Partial Color Blind'

    html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medical Certificate - ${nama}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 25mm 20mm 25mm;
      margin: 0 auto;
      background: #fff;
    }
    .kop {
      display: flex;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #000;
      position: relative;
    }
    .kop::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      border-bottom: 1px solid #000;
    }
    .kop img {
      width: 70px;
      height: 70px;
      margin-right: 16px;
      object-fit: contain;
    }
    .kop-text { text-align: center; flex: 1; }
    .kop-text h1 { font-size: 15pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px; }
    .kop-text p { font-size: 9.5pt; margin: 0; }
    .judul {
      text-align: center;
      margin: 24px 0 20px;
    }
    .judul h2 {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .judul p { font-size: 10.5pt; margin-top: 4px; }
    .intro { margin-bottom: 14px; line-height: 1.6; text-align: justify; }
    .data-table {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
    }
    .data-table td {
      padding: 3px 0;
      font-size: 11pt;
      vertical-align: top;
    }
    .data-table td:first-child { width: 170px; color: #222; }
    .data-table td:nth-child(2) { width: 15px; text-align: center; }
    .ttv-container {
      margin: 16px 0;
      border: 1px solid #000;
      padding: 12px 16px;
      border-radius: 4px;
    }
    .ttv-title {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .ttv-table {
      width: 100%;
      border-collapse: collapse;
    }
    .ttv-table td {
      padding: 3px 0;
      font-size: 11pt;
      width: 50%;
    }
    .verdict-box {
      margin: 20px 0;
      padding: 14px;
      border: 2px solid #000;
      text-align: center;
      background: #fbfbfb;
    }
    .verdict-box h3 {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .closing { margin-bottom: 35px; line-height: 1.6; text-align: justify; }
    .signature {
      display: flex;
      justify-content: flex-end;
    }
    .signature-block {
      text-align: center;
      width: 270px;
    }
    .signature-block .ttd-space {
      height: 75px;
      border-bottom: 1px solid #000;
      margin-bottom: 4px;
    }
    .signature-block .nama-dokter {
      font-weight: bold;
      text-decoration: underline;
      font-size: 11pt;
    }
    .signature-block .sip-dokter {
      font-size: 9.5pt;
      color: #333;
    }
    @media print {
      html, body { margin: 0; padding: 0; }
      .page { padding: 15mm 20mm; margin: 0; width: 100%; min-height: auto; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="kop">
      <img src="${logoRsiaUrl}" alt="Logo RSIA" />
      <div class="kop-text">
        <h1>RSIA AISYIYAH PEKAJANGAN</h1>
        <p>JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN, CENTRAL JAVA, INDONESIA</p>
        <p>Phone: +62 285 785909 | E-mail: rsiap_pkj@yahoo.co.id</p>
      </div>
    </div>

    <div class="judul">
      <h2>MEDICAL CERTIFICATE</h2>
      <p>Reference No: ${f.no_surat}</p>
    </div>

    <div class="intro">
      To whom it may concern, the undersigned physician hereby certifies that:
    </div>

    <table class="data-table">
      <tr><td>Full Name</td><td>:</td><td><strong>${nama}</strong></td></tr>
      <tr><td>Date of Birth / Age</td><td>:</td><td>${tglLahirEng} (${umurEng})</td></tr>
      <tr><td>Gender</td><td>:</td><td>${genderEng}</td></tr>
      <tr><td>National ID / Passport No.</td><td>:</td><td>${nik !== '-' ? nik : 'On Record'}</td></tr>
      <tr><td>Occupation</td><td>:</td><td>${pekerjaan}</td></tr>
      <tr><td>Address</td><td>:</td><td>${alamat}</td></tr>
      <tr><td>Purpose of Certificate</td><td>:</td><td><strong>${f.keperluan}</strong></td></tr>
    </table>

    <div class="ttv-container">
      <div class="ttv-title">Physical Examination & Vital Signs:</div>
      <table class="ttv-table">
        <tr>
          <td>• Body Weight : <strong>${f.berat} kg</strong></td>
          <td>• Height : <strong>${f.tinggi} cm</strong></td>
        </tr>
        <tr>
          <td>• Blood Pressure : <strong>${f.tensi} mmHg</strong></td>
          <td>• Body Temperature : <strong>${f.suhu} &deg;C</strong></td>
        </tr>
        <tr>
          <td colspan="2">• Color Vision : <strong>${colorVisionEng}</strong></td>
        </tr>
      </table>
    </div>

    <div class="intro">
      Has undergone physical and clinical examination and was declared to be:
    </div>

    <div class="verdict-box">
      <h3>${f.kesimpulan.toUpperCase()} (PHYSICALLY FIT)</h3>
    </div>

    <div class="closing">
      This medical certificate is issued truthfully upon request for <strong>${f.keperluan}</strong> and to be used whenever appropriately needed.
    </div>

    <div class="signature">
      <div class="signature-block">
        <div>Pekalongan, ${tglSuratEng}</div>
        <div style="margin-top: 2px;">Examining / Attending Physician,</div>
        <div class="ttd-space"></div>
        <div class="nama-dokter">${dokter}</div>
        <div class="sip-dokter">License/SIP: ${sipDokter}</div>
      </div>
    </div>
  </div>
</body>
</html>`

  } else {
    // INDONESIAN VERSION: Surat Keterangan Sehat
    const tglSuratIndo = formatTglIndo(f.tanggalsurat)
    const jkIndo = data.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan'
    let butaWarnaIndo = 'Tidak Buta Warna (Normal)'
    if (f.butawarna === 'Ya') butaWarnaIndo = 'Ya (Buta Warna)'
    if (f.butawarna === 'Parsial') butaWarnaIndo = 'Parsial'

    html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat Keterangan Sehat - ${nama}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 25mm 20mm 25mm;
      margin: 0 auto;
      background: #fff;
    }
    .kop {
      display: flex;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #000;
      position: relative;
    }
    .kop::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      border-bottom: 1px solid #000;
    }
    .kop img {
      width: 70px;
      height: 70px;
      margin-right: 16px;
      object-fit: contain;
    }
    .kop-text { text-align: center; flex: 1; }
    .kop-text h1 { font-size: 15pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 2px; }
    .kop-text p { font-size: 9.5pt; margin: 0; }
    .judul {
      text-align: center;
      margin: 24px 0 20px;
    }
    .judul h2 {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .judul p { font-size: 11pt; margin-top: 4px; }
    .intro { margin-bottom: 14px; line-height: 1.6; text-align: justify; }
    .data-table {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
    }
    .data-table td {
      padding: 3px 0;
      font-size: 11pt;
      vertical-align: top;
    }
    .data-table td:first-child { width: 150px; color: #222; }
    .data-table td:nth-child(2) { width: 15px; text-align: center; }
    .ttv-container {
      margin: 16px 0;
      border: 1px solid #000;
      padding: 12px 16px;
      border-radius: 4px;
    }
    .ttv-title {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .ttv-table {
      width: 100%;
      border-collapse: collapse;
    }
    .ttv-table td {
      padding: 3px 0;
      font-size: 11pt;
      width: 50%;
    }
    .verdict-box {
      margin: 20px 0;
      padding: 14px;
      border: 2px solid #000;
      text-align: center;
      background: #fbfbfb;
    }
    .verdict-box h3 {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .closing { margin-bottom: 35px; line-height: 1.6; text-align: justify; }
    .signature {
      display: flex;
      justify-content: flex-end;
    }
    .signature-block {
      text-align: center;
      width: 260px;
    }
    .signature-block .ttd-space {
      height: 75px;
      border-bottom: 1px solid #000;
      margin-bottom: 4px;
    }
    .signature-block .nama-dokter {
      font-weight: bold;
      text-decoration: underline;
      font-size: 11pt;
    }
    .signature-block .sip-dokter {
      font-size: 9.5pt;
      color: #333;
    }
    @media print {
      html, body { margin: 0; padding: 0; }
      .page { padding: 15mm 20mm; margin: 0; width: 100%; min-height: auto; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="kop">
      <img src="${logoRsiaUrl}" alt="Logo RSIA" />
      <div class="kop-text">
        <h1>RSIA AISYIYAH PEKAJANGAN</h1>
        <p>JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN, JAWA TENGAH</p>
        <p>Telp. (0285) 785909 | E-mail: rsiap_pkj@yahoo.co.id</p>
      </div>
    </div>

    <div class="judul">
      <h2>SURAT KETERANGAN SEHAT</h2>
      <p>Nomor: ${f.no_surat}</p>
    </div>

    <div class="intro">
      Yang bertanda tangan di bawah ini menerangkan bahwa:
    </div>

    <table class="data-table">
      <tr><td>Nama Pasien</td><td>:</td><td><strong>${nama}</strong></td></tr>
      <tr><td>Umur</td><td>:</td><td>${umurIndo}</td></tr>
      <tr><td>Jenis Kelamin</td><td>:</td><td>${jkIndo}</td></tr>
      <tr><td>NIK / No. KTP</td><td>:</td><td>${nik}</td></tr>
      <tr><td>Pekerjaan</td><td>:</td><td>${pekerjaan}</td></tr>
      <tr><td>Alamat</td><td>:</td><td>${alamat}</td></tr>
      <tr><td>Keperluan</td><td>:</td><td><strong>${f.keperluan}</strong></td></tr>
    </table>

    <div class="ttv-container">
      <div class="ttv-title">Hasil Pemeriksaan Fisik:</div>
      <table class="ttv-table">
        <tr>
          <td>• Berat Badan : <strong>${f.berat} kg</strong></td>
          <td>• Tinggi Badan : <strong>${f.tinggi} cm</strong></td>
        </tr>
        <tr>
          <td>• Tekanan Darah : <strong>${f.tensi} mmHg</strong></td>
          <td>• Suhu Tubuh : <strong>${f.suhu} &deg;C</strong></td>
        </tr>
        <tr>
          <td colspan="2">• Buta Warna : <strong>${butaWarnaIndo}</strong></td>
        </tr>
      </table>
    </div>

    <div class="intro">
      Pada hari ini telah kami periksa keadaan kesehatannya dan berpendapat bahwa yang bersangkutan dinyatakan:
    </div>

    <div class="verdict-box">
      <h3>${f.kesimpulan.toUpperCase()}</h3>
    </div>

    <div class="closing">
      Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
    </div>

    <div class="signature">
      <div class="signature-block">
        <div>Pekalongan, ${tglSuratIndo}</div>
        <div style="margin-top: 2px;">Dokter Pemeriksa,</div>
        <div class="ttd-space"></div>
        <div class="nama-dokter">${dokter}</div>
        <div class="sip-dokter">SIP: ${sipDokter}</div>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes')
  if (!printWindow) {
    toast.error('Popup browser terblokir. Izinkan popup untuk mencetak surat.')
    return
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

defineExpose({
  open,
  close,
  save,
  printSurat
})
</script>

<style scoped>
.surat-sehat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.btn-premium-save {
  height: 36px;
  padding: 0 1.25rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  font-weight: 600;
  font-size: 0.82rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-premium-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  filter: brightness(1.06);
}

.btn-premium-print-id {
  height: 36px;
  padding: 0 1rem;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  font-weight: 600;
  font-size: 0.82rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-premium-print-id:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.3);
  filter: brightness(1.06);
}

.btn-premium-print-en {
  height: 36px;
  padding: 0 1rem;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
  font-weight: 600;
  font-size: 0.82rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-premium-print-en:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  filter: brightness(1.06);
}

.btn-premium-danger {
  height: 36px;
  padding: 0 0.9rem;
  background: #fef2f2;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.82rem;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-premium-danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
  transform: translateY(-1px);
}

.btn-premium-secondary {
  height: 36px;
  padding: 0 1rem;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.82rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-premium-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

@media (max-width: 576px) {
  .modal-footer-custom {
    flex-direction: column-reverse !important;
    gap: 0.5rem !important;
    padding: 0.75rem 1rem !important;
  }
  .modal-footer-custom > div {
    width: 100% !important;
  }
  .modal-footer-custom .d-flex {
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
  .modal-footer-custom button {
    width: 100% !important;
  }
}

.modal-body-custom .form-control-custom,
.modal-body-custom .form-select-custom,
.modal-body-custom .input-group-text {
  height: 38px !important;
  padding: 0 0.6rem !important;
  border-radius: 8px !important;
  font-size: 0.875rem !important;
}

.modal-body-custom .form-control-custom:focus,
.modal-body-custom .form-select-custom:focus {
  border-color: #10b981 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
  outline: none;
}

.modal-body-custom .form-label-custom {
  font-size: 0.8rem !important;
  margin-bottom: 4px !important;
  font-weight: 600;
  color: #475569;
  display: block;
}
</style>
