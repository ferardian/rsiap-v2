<template>
  <div v-if="visible" class="surat-sakit-modal-overlay" @click.self="close">
    <div class="modal-content-custom border-0 shadow-2xl animate__animated animate__zoomIn animate__faster" 
         style="max-width: 620px; height: auto; max-height: 85vh; border-radius: 20px; overflow: hidden; background: #fafafa; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column;">
      
      <!-- Header: Gradient with medical bed icon -->
      <div class="d-flex align-items-center justify-content-between py-3 px-4 text-white position-relative" 
           style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); flex-shrink: 0; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.2); z-index: 10;">
        <div class="d-flex align-items-center">
          <div class="rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background-color: rgba(255, 255, 255, 0.2);">
            <i class="fas fa-procedures text-white fs-5"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-bold text-white" style="letter-spacing: 0.5px; font-size: 0.95rem;">Surat Keterangan Sakit</h6>
            <small class="text-white text-opacity-80" style="font-size: 0.75rem;">Penerbitan surat cuti / istirahat sakit pasien</small>
          </div>
        </div>
        <button type="button" class="btn-close-custom bg-white bg-opacity-10 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style="width: 26px; height: 26px; border: none; font-size: 1.25rem; line-height: 1; transition: all 0.2s; cursor: pointer;" @click="close">×</button>
      </div>

      <!-- Body: Scrollable Input Fields -->
      <div class="modal-body-custom p-3" style="overflow-y: auto; flex-grow: 1; max-height: calc(85vh - 120px);">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-teal" role="status" style="color: #0d9488;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted fw-medium small">Memuat data surat sakit...</p>
        </div>

        <div v-else>
          <!-- Patient Summary Card -->
          <div v-if="regData" 
               class="d-flex align-items-center p-2 mb-3 border border-light shadow-sm bg-white" 
               style="border-radius: 12px; background: linear-gradient(to right, #ffffff, #f0fdfa);">
            <div class="avatar-circle me-3 d-flex align-items-center justify-content-center shadow-sm" 
                 style="width: 36px; height: 36px; min-width: 36px; background: linear-gradient(135deg, #0d9488, #0f766e); border-radius: 50%;">
              <span class="text-white fw-bold fs-5">{{ regData.pasien?.nm_pasien?.charAt(0) }}</span>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">{{ regData.pasien?.nm_pasien }}</h6>
                <span class="badge rounded-pill bg-teal bg-opacity-10 text-teal px-2 py-0.5 fw-semibold" style="font-size: 0.7rem; color: #0d9488; background-color: #ccfbf1;">
                  {{ regData.pasien?.jk === 'L' ? 'Laki-Laki' : 'Perempuan' }}
                </span>
              </div>
              <p class="mb-0 text-muted small mt-0.5 d-flex flex-wrap gap-2" style="font-size: 0.75rem;">
                <span><strong>RM:</strong> {{ regData.no_rkm_medis }}</span>
                <span class="text-secondary">•</span>
                <span><strong>Rawat:</strong> {{ regData.no_rawat }}</span>
                <span v-if="regData.dokter?.nm_dokter" class="text-secondary">•</span>
                <span v-if="regData.dokter?.nm_dokter"><strong>DPJP:</strong> {{ regData.dokter.nm_dokter }}</span>
              </p>
              <p v-if="regData.pasien?.pekerjaan" class="mb-0 text-muted small mt-0.5" style="font-size: 0.72rem;">
                <span><strong>Pekerjaan:</strong> {{ regData.pasien.pekerjaan }}</span>
                <span v-if="regData.pasien?.alamat"> | <strong>Alamat:</strong> {{ regData.pasien.alamat }}</span>
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <form id="suratSakitModalForm" @submit.prevent="save(false)" class="row g-2">
            <!-- Administrasi -->
            <div class="col-12 mt-1">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-file-alt text-teal" style="color: #0d9488; font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Administrasi & Nomor Surat</span>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label-custom mb-1"><i class="fas fa-barcode me-1 text-teal" style="color: #0d9488;"></i> No. Surat Sakit</label>
              <div class="d-flex align-items-stretch gap-2">
                <div class="input-group flex-grow-1">
                  <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-hashtag text-muted"></i></span>
                  <input 
                    type="text" 
                    class="form-control form-control-custom border-start-0" 
                    style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                    v-model="form.no_surat" 
                    placeholder="Contoh: 001/SKD/A-RSIA/070926"
                    required
                  >
                </div>
                <button 
                  class="btn btn-outline-teal d-flex align-items-center justify-content-center" 
                  type="button" 
                  style="border-radius: 8px; border: 1.5px solid #0d9488; color: #0d9488; transition: all 0.2s; width: 34px; min-width: 34px; max-width: 34px; padding: 0;"
                  title="Generate Nomor Baru"
                  @click="fetchNextNumber"
                >
                  <i class="fas fa-sync-alt" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>

            <!-- Periode Istirahat Sakit -->
            <div class="col-12 mt-3">
              <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-light">
                <i class="fas fa-calendar-week text-teal" style="color: #0d9488; font-size: 0.85rem;"></i>
                <span class="fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">Periode Istirahat Sakit</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-calendar-check me-1 text-teal" style="color: #0d9488;"></i> Dari Tanggal (Mulai)</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                style="border: 1.5px solid #edf2f7; border-radius: 8px;"
                v-model="form.tanggalawal"
                @change="onDateChanged"
                required
              >
            </div>

            <div class="col-md-6">
              <label class="form-label-custom mb-1"><i class="fas fa-calendar-times me-1 text-teal" style="color: #0d9488;"></i> Sampai Tanggal (Selesai)</label>
              <input 
                type="date" 
                class="form-control form-control-custom" 
                style="border: 1.5px solid #edf2f7; border-radius: 8px;"
                v-model="form.tanggalakhir"
                @change="onDateChanged"
                required
              >
            </div>

            <div class="col-12 mt-2">
              <label class="form-label-custom mb-1"><i class="fas fa-clock me-1 text-teal" style="color: #0d9488;"></i> Lama Sakit (Durasi Istirahat)</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" style="border-radius: 8px 0 0 8px; border: 1.5px solid #edf2f7;"><i class="fas fa-user-clock text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control form-control-custom border-start-0" 
                  style="border-radius: 0 8px 8px 0; border: 1.5px solid #edf2f7; font-weight: 600;"
                  v-model="form.lamasakit"
                  placeholder="Contoh: 3 (TIGA) hari"
                  required
                >
              </div>
              <small class="text-muted" style="font-size: 0.72rem;">*Terisi otomatis berdasarkan selisih tanggal dan dapat disesuaikan.</small>
            </div>

            <!-- Diagnosa Info jika ada -->
            <div v-if="regData?.diagnosa" class="col-12 mt-2">
              <div class="p-2 rounded-3 bg-light border border-light d-flex align-items-center gap-2">
                <i class="fas fa-stethoscope text-secondary"></i>
                <small class="text-secondary"><strong>Diagnosa Utama:</strong> {{ regData.diagnosa }}</small>
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
            form="suratSakitModalForm"
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
  tanggalawal: '',
  tanggalakhir: '',
  lamasakit: '1 (SATU) hari'
})

const regData = ref(null)
const savedData = ref(null)

const terbilangAngka = (n) => {
  const bilangan = [
    '', 'SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA',
    'ENAM', 'TUJUH', 'DELAPAN', 'SEMBILAN', 'SEPULUH', 'SEBELAS'
  ]
  if (n < 12) return bilangan[n]
  if (n < 20) return bilangan[n - 10] + ' BELAS'
  if (n < 100) return bilangan[Math.floor(n / 10)] + ' PULUH ' + (bilangan[n % 10] || '')
  return n.toString()
}

const calculateLamaSakit = () => {
  if (!form.value.tanggalawal || !form.value.tanggalakhir) return
  const start = new Date(form.value.tanggalawal)
  const end = new Date(form.value.tanggalakhir)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return

  const diffTime = end.getTime() - start.getTime()
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
  if (diffDays < 1) diffDays = 1

  const terbilang = terbilangAngka(diffDays).trim()
  form.value.lamasakit = `${diffDays} (${terbilang}) hari`
}

const onDateChanged = () => {
  calculateLamaSakit()
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
    tanggalawal: today,
    tanggalakhir: today,
    lamasakit: '1 (SATU) hari'
  }
  regData.value = null
  savedData.value = null

  try {
    const response = await rawatJalanService.getSuratSakit(noRawat)
    if (response.data && response.data.success) {
      const data = response.data.data
      regData.value = data.reg_periksa
      savedData.value = data.surat || null

      if (data.surat) {
        form.value = {
          no_surat: data.surat.no_surat,
          no_rawat: data.surat.no_rawat,
          tanggalawal: data.surat.tanggalawal,
          tanggalakhir: data.surat.tanggalakhir,
          lamasakit: data.surat.lamasakit
        }
      } else {
        await fetchNextNumber()
        calculateLamaSakit()
      }
    }
  } catch (error) {
    console.error('Error loading surat sakit:', error)
    toast.error('Gagal memuat data surat keterangan sakit')
  } finally {
    isLoading.value = false
  }
}

const fetchNextNumber = async () => {
  try {
    const res = await rawatJalanService.getNextSuratSakitNumber(form.value.tanggalawal)
    if (res.data && res.data.success) {
      form.value.no_surat = res.data.no_surat
    }
  } catch (e) {
    console.error('Error fetching next surat sakit number:', e)
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
    const response = await rawatJalanService.saveSuratSakit(form.value)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat Keterangan Sakit berhasil disimpan')
      savedData.value = { ...form.value }
      emit('saved', form.value)
      
      if (andPrint) {
        printSurat()
      }
    } else {
      toast.error(response.data.message || 'Gagal menyimpan surat sakit')
    }
  } catch (error) {
    console.error('Error saving surat sakit:', error)
    toast.error('Gagal menyimpan surat keterangan sakit')
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
    const response = await rawatJalanService.deleteSuratSakit(form.value.no_surat)
    if (response.data && response.data.success) {
      toast.success(response.data.message || 'Surat berhasil dihapus')
      emit('deleted', form.value.no_surat)
      close()
    } else {
      toast.error(response.data.message || 'Gagal menghapus surat')
    }
  } catch (error) {
    console.error('Error deleting surat sakit:', error)
    toast.error('Gagal menghapus surat sakit')
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

  const umur = data.pasien?.age_formatted || '-'
  const nama = data.pasien?.nm_pasien || '-'
  const pekerjaan = data.pasien?.pekerjaan || '-'
  const alamat = data.pasien?.alamat || '-'
  const dokter = data.dokter?.nm_dokter || '-'
  const tglAwal = formatTglPanjang(f.tanggalawal)
  const tglAkhir = formatTglPanjang(f.tanggalakhir)
  const tglSekarang = formatTglPanjang(f.tanggalawal || new Date().toISOString().split('T')[0])

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat Keterangan Sakit - ${nama}</title>
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
      font-size: 13pt;
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
      padding: 4px 0;
      font-size: 11pt;
      vertical-align: top;
    }
    .data-table td:first-child { width: 140px; color: #222; }
    .data-table td:nth-child(2) { width: 15px; text-align: center; }
    .perlu-box {
      margin: 16px 0 12px;
      line-height: 1.6;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin: 4px 0 4px 20px;
      font-size: 11pt;
    }
    .box-square {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1.5px solid #000;
      margin-right: 8px;
      text-align: center;
      line-height: 12px;
      font-size: 10pt;
      font-weight: bold;
    }
    .periode-table {
      width: 100%;
      margin: 12px 0 16px;
      border-collapse: collapse;
    }
    .periode-table td {
      padding: 3px 0;
      font-size: 11pt;
      vertical-align: top;
    }
    .periode-table td:first-child { width: 180px; }
    .periode-table td:nth-child(2) { width: 15px; text-align: center; }
    .closing { margin: 20px 0 35px; line-height: 1.6; text-align: justify; }
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
      <h2>SURAT KETERANGAN SAKIT</h2>
      <p>Nomor: ${f.no_surat}</p>
    </div>

    <div class="intro">
      Yang bertanda tangan dibawah ini menerangkan bahwa:
    </div>

    <table class="data-table">
      <tr><td>Nama Pasien</td><td>:</td><td><strong>${nama}</strong></td></tr>
      <tr><td>Umur</td><td>:</td><td>${umur}</td></tr>
      <tr><td>Pekerjaan</td><td>:</td><td>${pekerjaan}</td></tr>
      <tr><td>Alamat</td><td>:</td><td>${alamat}</td></tr>
    </table>

    <div class="perlu-box">
      Perlu mendapatkan:
      <div class="checkbox-item">
        <span class="box-square">&#10003;</span> Istirahat
      </div>
      <div class="checkbox-item">
        <span class="box-square">&nbsp;</span> Kerja ringan
      </div>
    </div>

    <table class="periode-table">
      <tr>
        <td>Selama</td>
        <td>:</td>
        <td><strong>${f.lamasakit}</strong></td>
      </tr>
      <tr>
        <td>Terhitung mulai tanggal</td>
        <td>:</td>
        <td>${tglAwal}</td>
      </tr>
      <tr>
        <td>Sampai dengan tanggal</td>
        <td>:</td>
        <td>${tglAkhir}</td>
      </tr>
    </table>

    <div class="closing">
      Demikian surat keterangan ini diberikan kepada yang bersangkutan agar dapat dipergunakan sebagaimana mestinya.
    </div>

    <div class="signature">
      <div class="signature-block">
        <div>Pekalongan, ${tglSekarang}</div>
        <div style="margin-top: 2px;">RSIA Aisyiyah Pekajangan</div>
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
.surat-sakit-modal-overlay {
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
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.2);
  transition: all 0.2s ease;
}

.btn-premium-save:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.3);
  filter: brightness(1.05);
}

.btn-premium-print {
  padding: 0.45rem 1.25rem;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.2);
  transition: all 0.2s ease;
}

.btn-premium-print:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.3);
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
.modal-body-custom .input-group-text {
  height: 38px !important;
  padding: 0 0.6rem !important;
  border-radius: 8px !important;
  font-size: 0.875rem !important;
}

.modal-body-custom .form-control-custom:focus {
  border-color: #0d9488 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.15) !important;
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
