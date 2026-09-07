<template>
  <div v-if="visible" class="surat-terbang-modal-overlay" @click.self="close">
    <div class="modal-content-custom border-0 shadow-2xl animate__animated animate__zoomIn animate__faster" 
         style="max-width: 620px; height: auto; max-height: 85vh; border-radius: 20px; overflow: hidden; background: #fafafa; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;">
      
      <!-- Header: Vibrant Blue/Indigo Gradient with plane icon -->
      <div class="d-flex align-items-center justify-content-between py-3 px-4 text-white position-relative" 
           style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); flex-shrink: 0; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2); z-index: 10;">
        <div class="d-flex align-items-center">
          <div class="rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background-color: rgba(255, 255, 255, 0.2);">
            <i class="fas fa-plane-departure text-white fs-5"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-bold text-white" style="letter-spacing: 0.5px; font-size: 0.95rem;">Surat Layak Terbang</h6>
            <small class="text-white text-opacity-80" style="font-size: 0.75rem;">Penerbitan surat keterangan layak terbang</small>
          </div>
        </div>
        <button type="button" class="btn-close-custom bg-white bg-opacity-10 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style="width: 26px; height: 26px; border: none; font-size: 1.25rem; line-height: 1; transition: all 0.2s; cursor: pointer;" @click="close">×</button>
      </div>

      <!-- Body: Scrollable Input Fields -->
      <div class="modal-body-custom p-3" style="overflow-y: auto; flex-grow: 1; max-height: calc(85vh - 120px);">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted fw-medium small">Menyelaraskan data...</p>
        </div>

        <div v-else>
          <!-- Patient Summary Card -->
          <div v-if="regData" 
               class="d-flex align-items-center p-2 mb-3 border border-light shadow-sm bg-white" 
               style="border-radius: 12px; background: linear-gradient(to right, #ffffff, #f0f5ff);">
            <div class="avatar-circle me-3 d-flex align-items-center justify-content-center shadow-sm" 
                 style="width: 36px; height: 36px; min-width: 36px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%;">
              <span class="text-white fw-bold fs-5">{{ regData.pasien?.nm_pasien?.charAt(0) }}</span>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">{{ regData.pasien?.nm_pasien }}</h6>
                <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-2 py-0.5 fw-semibold" style="font-size: 0.7rem;">
                  {{ regData.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan' }}
                </span>
              </div>
              <p class="mb-0 text-muted small mt-0.5 d-flex gap-2" style="font-size: 0.75rem;">
                <span><strong>RM:</strong> {{ regData.no_rkm_medis }}</span>
                <span class="text-secondary">•</span>
                <span><strong>Rawat:</strong> {{ regData.no_rawat }}</span>
                <span v-if="regData.dokter?.nm_dokter" class="text-secondary">•</span>
                <span v-if="regData.dokter?.nm_dokter"><strong>DPJP:</strong> {{ regData.dokter.nm_dokter }}</span>
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <form id="suratTerbangModalForm" @submit.prevent="save(false)" class="row g-2">
            <!-- Administrasi -->
            <div class="col-12 mt-2">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-file-alt text-primary" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Detail Administrasi</span>
              </div>
            </div>

            <div class="col-md-7">
              <label class="form-label-custom mb-1"><i class="fas fa-barcode me-1 text-primary"></i> No. Surat</label>
              <div class="d-flex align-items-stretch gap-2">
                <div class="input-group flex-grow-1">
                  <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-hashtag text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                    v-model="form.no_surat" 
                    placeholder="Masukkan atau generate nomor"
                    required
                  >
                </div>
                <button 
                  class="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                  type="button" 
                  style="border-radius: 8px; border: 1.5px solid #3b82f6; transition: all 0.2s; width: 34px; min-width: 34px; max-width: 34px; padding: 0;"
                  title="Generate Nomor Baru"
                  @click="fetchNextNumber"
                >
                  <i class="fas fa-sync-alt" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>

            <div class="col-md-5">
              <label class="form-label-custom mb-1"><i class="fas fa-calendar-alt me-1 text-primary"></i> Tanggal Surat</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                style="border: 1.5px solid #edf2f7; border-radius: 8px;"
                v-model="form.tanggalsurat"
                required
              >
            </div>

            <!-- Pemeriksaan Fisik & TTV -->
            <div class="col-12 mt-3">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-heartbeat text-primary" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Pemeriksaan Fisik & TTV</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-tachometer-alt me-1 text-primary"></i> Tekanan Darah</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-tint text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.tensi"
                  placeholder="Contoh: 120/80 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-weight me-1 text-primary"></i> Berat Badan (kg)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-balance-scale text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.berat"
                  placeholder="Contoh: 5.6 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-ruler-vertical me-1 text-primary"></i> Tinggi Badan (cm)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-child text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.tinggi"
                  placeholder="Contoh: 110 atau -"
                  required
                >
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-eye me-1 text-primary"></i> Buta Warna</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-eye-slash text-muted"></i></span>
                <select 
                  class="form-select form-select-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7;"
                  v-model="form.butawarna" 
                  required
                >
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                  <option value="Parsial">Parsial</option>
                </select>
              </div>
            </div>

            <!-- Kesimpulan -->
            <div class="col-12 mt-3">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-diagnoses text-primary" style="font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Kesimpulan Medis</span>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label-custom mb-1"><i class="fas fa-check-double me-1 text-primary"></i> Status Kelayakan Terbang</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 border-custom-focus" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-certificate text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                  v-model="form.kesimpulan"
                  placeholder="Contoh: SEHAT DAN LAYAK TERBANG"
                  required
                >
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer: Fixed Action Buttons -->
      <div v-if="!isLoading" class="modal-footer-custom py-2 px-4 d-flex justify-content-between align-items-center border-top" 
           style="background: #f8fafc; flex-shrink: 0; z-index: 10;">
        <div>
          <button 
            v-if="form.no_surat && savedData" 
            type="button" 
            class="btn btn-premium-danger" 
            @click="deleteSurat"
            :disabled="isDeleting"
          >
            <i v-if="isDeleting" class="spinner-border spinner-border-sm me-1"></i>
            <i v-else class="fas fa-trash me-1"></i> Hapus
          </button>
        </div>
        
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-premium-secondary" @click="close">
            Batal
          </button>
          
          <button 
            v-if="savedData"
            type="button" 
            class="btn btn-premium-print" 
            @click="printSurat"
          >
            <i class="fas fa-print me-1"></i> Cetak Surat
          </button>
          
          <button 
            type="submit" 
            form="suratTerbangModalForm"
            class="btn btn-premium-save" 
            :disabled="isSaving"
          >
            <i v-if="isSaving" class="spinner-border spinner-border-sm me-1"></i>
            <i v-else class="fas fa-save me-1"></i> Simpan
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
  butawarna: 'Tidak',
  kesimpulan: 'SEHAT DAN LAYAK TERBANG'
})

const regData = ref(null)
const savedData = ref(null)
const pemeriksaanRalan = ref(null)

const open = async (param) => {
  const noRawat = typeof param === 'object' && param !== null ? (param.no_rawat || param.noRawat) : param
  if (!noRawat) return

  visible.value = true
  isLoading.value = true
  document.body.style.overflow = 'hidden'

  form.value = {
    no_surat: '',
    no_rawat: noRawat,
    tanggalsurat: new Date().toISOString().split('T')[0],
    berat: '',
    tinggi: '',
    tensi: '',
    butawarna: 'Tidak',
    kesimpulan: 'SEHAT DAN LAYAK TERBANG'
  }
  regData.value = null
  savedData.value = null
  pemeriksaanRalan.value = null

  try {
    const response = await rawatJalanService.getSuratTerbang(noRawat)
    if (response.data && response.data.success) {
      const data = response.data.data
      regData.value = data.reg_periksa
      pemeriksaanRalan.value = data.pemeriksaan_ralan
      savedData.value = data.surat || null

      if (data.surat) {
        form.value = {
          no_surat: data.surat.no_surat,
          no_rawat: data.surat.no_rawat,
          tanggalsurat: data.surat.tanggalsurat,
          berat: data.surat.berat,
          tinggi: data.surat.tinggi,
          tensi: data.surat.tensi,
          butawarna: data.surat.butawarna,
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
        }
      }
    }
  } catch (error) {
    console.error('Error loading surat terbang:', error)
    toast.error('Gagal memuat data surat layak terbang')
  } finally {
    isLoading.value = false
  }
}

const fetchNextNumber = async () => {
  try {
    const res = await rawatJalanService.getNextSuratTerbangNumber()
    if (res.data && res.data.success) {
      form.value.no_surat = res.data.no_surat
    }
  } catch (e) {
    console.error('Error fetching next surat number:', e)
  }
}

const close = () => {
  visible.value = false
  document.body.style.overflow = ''
  emit('close')
}

const save = async (andPrint = false) => {
  isSaving.value = true
  try {
    const response = await rawatJalanService.saveSuratTerbang(form.value)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat Layak Terbang berhasil disimpan')
      savedData.value = { ...form.value }
      emit('saved', form.value)
      
      if (andPrint) {
        printSurat()
      }
    } else {
      toast.error(response.data.message || 'Gagal menyimpan surat')
    }
  } catch (error) {
    console.error('Error saving surat terbang:', error)
    toast.error('Gagal menyimpan surat layak terbang')
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
    const response = await rawatJalanService.deleteSuratTerbang(form.value.no_surat)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat berhasil dihapus')
      emit('deleted', form.value.no_surat)
      close()
    } else {
      toast.error(response.data.message || 'Gagal menghapus surat')
    }
  } catch (error) {
    console.error('Error deleting surat terbang:', error)
    toast.error('Gagal menghapus surat layak terbang')
  } finally {
    isDeleting.value = false
  }
}

const printSurat = () => {
  const data = regData.value
  const f = form.value
  if (!data || !f.no_surat) return

  const formatTglPanjang = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const jenisKelamin = data.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan'
  const umur = data.pasien?.age_formatted || '-'
  const nama = data.pasien?.nm_pasien || '-'
  const alamat = data.pasien?.alamat || '-'
  const dokter = data.dokter?.nm_dokter || '-'
  const tanggal = formatTglPanjang(f.tanggalsurat)

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat Keterangan Layak Terbang - ${nama}</title>
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
      padding-bottom: 10px;
      border-bottom: 3px solid #000;
      margin-bottom: 20px;
    }
    .kop img {
      width: 70px;
      height: 70px;
      margin-right: 16px;
      object-fit: contain;
    }
    .kop-text { text-align: center; flex: 1; }
    .kop-text h1 { font-size: 16pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px; }
    .kop-text p { font-size: 9pt; margin: 0; }
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
    .judul p { font-size: 10pt; margin-top: 4px; }
    .intro { margin-bottom: 16px; line-height: 1.7; text-align: justify; }
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
    .data-table td:first-child { width: 150px; color: #333; }
    .data-table td:nth-child(2) { width: 10px; }
    .ttv-table {
      width: 100%;
      border-top: 1px solid #ccc;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .ttv-table td {
      padding: 4px 0;
      font-size: 11pt;
      width: 50%;
      vertical-align: top;
    }
    .ttv-table td:nth-child(odd) { color: #333; width: 130px; }
    .statement { margin-bottom: 16px; line-height: 1.7; text-align: justify; }
    .kesimpulan {
      text-align: center;
      border: 2px solid #000;
      padding: 14px;
      margin: 20px 0;
      background: #f8f8f8;
    }
    .kesimpulan h3 {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .closing { margin-bottom: 40px; line-height: 1.7; text-align: justify; }
    .signature {
      display: flex;
      justify-content: flex-end;
    }
    .signature-block {
      text-align: center;
      width: 240px;
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
        <p>JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN, PEKALONGAN, JAWA</p>
        <p>(0285) 785909</p>
      </div>
    </div>

    <div class="judul">
      <h2>SURAT KETERANGAN LAYAK TERBANG</h2>
      <p>Nomor: ${f.no_surat}</p>
    </div>

    <div class="intro">
      Yang bertandatangan di bawah ini, <strong>${dokter}</strong> dengan mengingat sumpah waktu menerima jabatan bahwa:
    </div>

    <table class="data-table">
      <tr><td>Nama</td><td>:</td><td><strong>${nama}</strong></td></tr>
      <tr><td>Umur</td><td>:</td><td>${umur}</td></tr>
      <tr><td>Jenis Kelamin</td><td>:</td><td>${jenisKelamin}</td></tr>
      <tr><td>Alamat</td><td>:</td><td>${alamat}</td></tr>
    </table>

    <table class="ttv-table">
      <tr>
        <td>Berat badan</td><td>: ${f.berat} kg</td>
        <td>Tinggi badan</td><td>: ${f.tinggi} cm</td>
      </tr>
      <tr>
        <td>Tekanan darah</td><td>: ${f.tensi} mmHg</td>
        <td>Buta warna</td><td>: ${f.butawarna}</td>
      </tr>
    </table>

    <div class="statement">
      Pada hari ini telah kami periksa dengan teliti kesehatannya dan berpendapat bahwa kesehatan saudara tersebut pada waktu diperiksa:
    </div>

    <div class="kesimpulan">
      <h3>${f.kesimpulan}</h3>
    </div>

    <div class="closing">
      Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat digunakan sesuai keperluan.
    </div>

    <div class="signature">
      <div class="signature-block">
        <div>PEKALONGAN, ${tanggal}</div>
        <div class="ttd-space"></div>
        <div class="nama-dokter">${dokter}</div>
      </div>
    </div>
  </div>
</body>
</html>`

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
.surat-terbang-modal-overlay {
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
  padding: 0.45rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.2);
  transition: all 0.2s ease;
}

.btn-premium-save:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(29, 78, 216, 0.3);
  filter: brightness(1.05);
}

.btn-premium-print {
  padding: 0.45rem 1.25rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.2);
  transition: all 0.2s ease;
}

.btn-premium-print:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
  filter: brightness(1.05);
}

.btn-premium-danger {
  padding: 0.45rem 1rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.2);
  transition: all 0.2s ease;
}

.btn-premium-danger:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
  filter: brightness(1.05);
}

.btn-premium-secondary {
  padding: 0.45rem 1rem;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-premium-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
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
  border-color: #3b82f6 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
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
