<template>
  <div v-if="visible" class="print-modal-overlay" @click.self="close">
    <div class="modal-card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__zoomIn animate__faster">
      <!-- Modal Header -->
      <div class="modal-header-gradient px-4 py-3 text-white d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <div class="icon-circle bg-white bg-opacity-20 text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="fas fa-print"></i>
          </div>
          <div>
            <h6 class="m-0 fw-bold fs-6">Cetak Surat Keterangan Pelayanan Dokter</h6>
            <small class="text-white text-opacity-80 text-xs">Untuk Kelengkapan Berkas Rekomendasi & Perpanjangan SIP Dokter</small>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white" @click="close"></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body p-4 bg-light overflow-auto" style="max-height: calc(85vh - 130px);">
        <!-- Quick Preview Card of Selected Doctor -->
        <div class="card border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-wrapper bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center fs-5" style="width: 44px; height: 44px;">
              {{ dokter?.nm_dokter?.charAt(0) || 'D' }}
            </div>
            <div class="flex-grow-1">
              <h6 class="fw-bold m-0 text-dark">{{ dokter?.nm_dokter }}</h6>
              <div class="text-muted small d-flex flex-wrap gap-2 mt-1">
                <span><strong>Spesialis:</strong> {{ dokter?.nm_sps }}</span>
                <span>•</span>
                <span><strong>No. STR:</strong> {{ dokter?.nomor_str || '-' }}</span>
                <span>•</span>
                <span><strong>No. SIP:</strong> {{ dokter?.nomor_sip || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Setting Form -->
        <div class="card border-0 shadow-sm rounded-3 p-3 bg-white">
          <h6 class="fw-bold text-dark border-bottom pb-2 mb-3 fs-6">
            <i class="fas fa-cog text-primary me-2"></i>Pengaturan Dokumen Surat
          </h6>

          <div class="row g-3">
            <!-- No Surat -->
            <div class="col-md-7">
              <label class="form-label text-xs fw-bold text-muted mb-1">Nomor Surat Keterangan</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-light text-muted"><i class="fas fa-hashtag"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.no_surat" 
                  placeholder="Contoh: 021/SK-PEL/RSIA/0926"
                />
              </div>
            </div>

            <!-- Tanggal Surat -->
            <div class="col-md-5">
              <label class="form-label text-xs fw-bold text-muted mb-1">Tanggal Surat</label>
              <input type="date" class="form-control form-control-sm" v-model="form.tanggal_surat" />
            </div>

            <!-- Format Cetak -->
            <div class="col-12">
              <label class="form-label text-xs fw-bold text-muted mb-1">Format Dokumen Cetak</label>
              <div class="d-flex flex-column gap-2">
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="formatBulanan" value="bulanan" v-model="form.mode_cetak">
                  <label class="form-check-label small" for="formatBulanan">
                    <strong>Format Rekapitulasi Bulanan (Standar SIP)</strong> — Tabel periode bulan dengan kolom rincian <strong>Jenis Pasien (Umum & BPJS)</strong> sesuai format berkas resmi SIP.
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="formatRingkas" value="ringkas" v-model="form.mode_cetak">
                  <label class="form-check-label small" for="formatRingkas">
                    <strong>Format Ringkasan per Kategori Layanan</strong> — 1 Halaman resmi dengan pembagian kategori pelayanan medis (Umum & BPJS).
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="formatLengkap" value="lengkap" v-model="form.mode_cetak">
                  <label class="form-check-label small" for="formatLengkap">
                    <strong>Surat Keterangan + Lampiran Tindakan</strong> — Termasuk lampiran tabel rincian seluruh tindakan klinis (Umum & BPJS).
                  </label>
                </div>
              </div>
            </div>

            <!-- Keperluan -->
            <div class="col-12">
              <label class="form-label text-xs fw-bold text-muted mb-1">Keperluan Surat</label>
              <textarea 
                class="form-control form-control-sm" 
                rows="2" 
                v-model="form.keperluan"
                placeholder="Keperluan pembuatan surat..."
              ></textarea>
            </div>

            <!-- Penandatangan -->
            <div class="col-md-6">
              <label class="form-label text-xs fw-bold text-muted mb-1">Nama Pejabat Penandatangan</label>
              <input 
                type="text" 
                class="form-control form-control-sm" 
                v-model="form.penandatangan_nama" 
                placeholder="Nama Pejabat / Direktur"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label text-xs fw-bold text-muted mb-1">Jabatan Penandatangan</label>
              <input 
                type="text" 
                class="form-control form-control-sm" 
                v-model="form.penandatangan_jabatan" 
                placeholder="Contoh: Direktur RSIA Aisyiyah Pekajangan"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer bg-white border-top px-4 py-3 d-flex justify-content-between">
        <button type="button" class="btn btn-sm btn-outline-secondary px-3" @click="close">
          Batal
        </button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-primary px-4 shadow-sm" @click="handlePrint">
            <i class="fas fa-print me-1"></i> Cetak Dokumen Resmi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrintSuratPelayananDokterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dokter: {
      type: Object,
      default: () => ({})
    },
    period: {
      type: Object,
      default: () => ({})
    },
    summary: {
      type: Object,
      default: () => ({})
    },
    operasiBreakdown: {
      type: Object,
      default: () => ({})
    },
    tindakanSummary: {
      type: Array,
      default: () => []
    },
    monthlyTrend: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close'],
  data() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const yy = String(yyyy).slice(-2)

    return {
      form: {
        no_surat: `..../SK-PEL/RSIA/${mm}${yy}`,
        tanggal_surat: `${yyyy}-${mm}-${dd}`,
        keperluan: 'Persyaratan Kelengkapan Administrasi Rekomendasi / Perpanjangan Surat Izin Praktik (SIP) Dokter',
        penandatangan_nama: 'dr. Widjdan Kadir',
        penandatangan_jabatan: 'Direktur RSIA Aisyiyah Pekajangan',
        mode_cetak: 'bulanan'
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    formatDateIndo(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    formatNumber(num) {
      return (Number(num) || 0).toLocaleString('id-ID')
    },
    handlePrint() {
      const d = this.dokter || {}
      const s = this.summary || {}
      const op = this.operasiBreakdown || {}
      const f = this.form
      const periodAwal = this.formatDateIndo(this.period.tgl_awal)
      const periodAkhir = this.formatDateIndo(this.period.tgl_akhir)
      const tglSuratIndo = this.formatDateIndo(f.tanggal_surat)

      let tableMainHtml = ''

      if (f.mode_cetak === 'bulanan') {
        const monthlyRows = (this.monthlyTrend || []).map((row, idx) => `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 10px;">${row.label}</td>
            <td style="text-align: center;">${this.formatNumber(row.umum)}</td>
            <td style="text-align: center;">${this.formatNumber(row.bpjs)}</td>
            <td style="text-align: right; font-weight: bold; padding-right: 10px;">${this.formatNumber(row.total)}</td>
          </tr>
        `).join('')

        tableMainHtml = `
          <table class="rekap-box">
            <thead>
              <tr>
                <th rowspan="2" style="width: 45px; text-align: center;">No</th>
                <th rowspan="2" style="text-align: left; padding-left: 10px;">Bulan</th>
                <th colspan="2" style="text-align: center;">Jenis Pasien</th>
                <th rowspan="2" style="width: 110px; text-align: right; padding-right: 10px;">Total</th>
              </tr>
              <tr>
                <th style="width: 90px; text-align: center;">Umum</th>
                <th style="width: 90px; text-align: center;">BPJS</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyRows || '<tr><td colspan="5" style="text-align: center; padding: 10px;">Tidak ada data pelayanan</td></tr>'}
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td colspan="2" style="text-align: right; padding-right: 10px;">TOTAL</td>
                <td style="text-align: center;">${this.formatNumber(s.total_umum)}</td>
                <td style="text-align: center;">${this.formatNumber(s.total_bpjs)}</td>
                <td style="text-align: right; padding-right: 10px; font-size: 11pt;">${this.formatNumber(s.total_pelayanan)}</td>
              </tr>
            </tbody>
          </table>
        `
      } else {
        tableMainHtml = `
          <table class="rekap-box">
            <thead>
              <tr>
                <th rowspan="2" style="width: 40px; text-align: center;">NO</th>
                <th rowspan="2" style="text-align: left; padding-left: 10px;">KATEGORI PELAYANAN KLINIS</th>
                <th colspan="2" style="text-align: center;">JENIS PASIEN</th>
                <th rowspan="2" style="width: 120px; text-align: right; padding-right: 10px;">TOTAL</th>
              </tr>
              <tr>
                <th style="width: 90px; text-align: center;">UMUM</th>
                <th style="width: 90px; text-align: center;">BPJS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">1</td>
                <td style="text-align: left; padding-left: 10px;">Pemeriksaan Pasien Rawat Jalan (Poliklinik / IGD)</td>
                <td style="text-align: center;">${this.formatNumber(s.ralan_umum)}</td>
                <td style="text-align: center;">${this.formatNumber(s.ralan_bpjs)}</td>
                <td style="text-align: right; font-weight: bold; padding-right: 10px;">${this.formatNumber(s.total_kunjungan_ralan)}</td>
              </tr>
              <tr>
                <td style="text-align: center;">2</td>
                <td style="text-align: left; padding-left: 10px;">Visite & Konsultasi Pasien Rawat Inap</td>
                <td style="text-align: center;">${this.formatNumber(s.visite_umum)}</td>
                <td style="text-align: center;">${this.formatNumber(s.visite_bpjs)}</td>
                <td style="text-align: right; font-weight: bold; padding-right: 10px;">${this.formatNumber(s.total_visite_ranap)}</td>
              </tr>
              <tr>
                <td style="text-align: center;">3</td>
                <td style="text-align: left; padding-left: 10px;">Tindakan Medis Non-Operatif (Rawat Jalan & Rawat Inap)</td>
                <td style="text-align: center;">${this.formatNumber((s.tindakan_ralan_umum || 0) + (s.tindakan_ranap_umum || 0))}</td>
                <td style="text-align: center;">${this.formatNumber((s.tindakan_ralan_bpjs || 0) + (s.tindakan_ranap_bpjs || 0))}</td>
                <td style="text-align: right; font-weight: bold; padding-right: 10px;">${this.formatNumber((s.total_tindakan_ralan || 0) + (s.total_tindakan_ranap || 0))}</td>
              </tr>
              <tr>
                <td style="text-align: center;">4</td>
                <td style="text-align: left; padding-left: 10px;">
                  Tindakan Operasi / Pembedahan
                  <div style="font-size: 8.5pt; color: #444; margin-top: 2px;">
                    • Operator Utama: ${this.formatNumber(op.operator_utama || 0)} kasus | Pendamping: ${this.formatNumber(op.operator_pendamping || 0)} kasus<br>
                    • Dokter Anestesi: ${this.formatNumber(op.dokter_anestesi || 0)} kasus
                  </div>
                </td>
                <td style="text-align: center;">${this.formatNumber(s.operasi_umum)}</td>
                <td style="text-align: center;">${this.formatNumber(s.operasi_bpjs)}</td>
                <td style="text-align: right; font-weight: bold; padding-right: 10px;">${this.formatNumber(s.total_operasi)}</td>
              </tr>
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td colspan="2" style="text-align: right; padding-right: 10px;">TOTAL PELAYANAN KLINIS</td>
                <td style="text-align: center;">${this.formatNumber(s.total_umum)}</td>
                <td style="text-align: center;">${this.formatNumber(s.total_bpjs)}</td>
                <td style="text-align: right; padding-right: 10px; font-size: 11pt;">${this.formatNumber(s.total_pelayanan)}</td>
              </tr>
            </tbody>
          </table>
        `
      }

      let tableTindakanHtml = ''
      if (f.mode_cetak === 'lengkap' && this.tindakanSummary.length > 0) {
        const rows = this.tindakanSummary.slice(0, 45).map((row, idx) => `
          <tr>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 6px;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 4px 6px;">${row.nama_tindakan}</td>
            <td style="border: 1px solid #000; padding: 4px 6px; text-align: center;">${row.kategori}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 6px;">${this.formatNumber(row.umum)}</td>
            <td style="text-align: center; border: 1px solid #000; padding: 4px 6px;">${this.formatNumber(row.bpjs)}</td>
            <td style="text-align: right; border: 1px solid #000; padding: 4px 8px; font-weight: bold;">${this.formatNumber(row.total)}</td>
          </tr>
        `).join('')

        tableTindakanHtml = `
          <div style="page-break-before: always; margin-top: 20px;">
            <div style="font-weight: bold; font-size: 11pt; margin-bottom: 8px; text-transform: uppercase;">
              LAMPIRAN: DAFTAR RINCIAN TINDAKAN / PROSEDUR MEDIS
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th rowspan="2" style="width: 35px; border: 1px solid #000; padding: 4px;">No</th>
                  <th rowspan="2" style="border: 1px solid #000; padding: 4px; text-align: left;">Nama Tindakan / Prosedur</th>
                  <th rowspan="2" style="width: 110px; border: 1px solid #000; padding: 4px;">Kategori</th>
                  <th colspan="2" style="border: 1px solid #000; padding: 4px; text-align: center;">Jenis Pasien</th>
                  <th rowspan="2" style="width: 75px; border: 1px solid #000; padding: 4px; text-align: right;">Total</th>
                </tr>
                <tr style="background: #f0f0f0;">
                  <th style="width: 65px; border: 1px solid #000; padding: 3px; text-align: center;">Umum</th>
                  <th style="width: 65px; border: 1px solid #000; padding: 3px; text-align: center;">BPJS</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `
      }

      const printHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat Keterangan Pelayanan Dokter - ${d.nm_dokter}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11.5pt;
      line-height: 1.45;
      color: #000;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 22mm 18mm 22mm;
      margin: 0 auto;
      background: #fff;
    }
    .kop {
      display: flex;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2.5px solid #000;
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
    .kop-logo {
      width: 70px;
      height: 70px;
      margin-right: 16px;
      object-fit: contain;
    }
    .kop-text { text-align: center; flex: 1; }
    .kop-text h1 { font-size: 15pt; font-weight: bold; letter-spacing: 0.8px; margin-bottom: 2px; }
    .kop-text p { font-size: 9pt; margin: 0; }

    .judul {
      text-align: center;
      margin: 22px 0 18px;
    }
    .judul h2 {
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .judul p { font-size: 10pt; margin-top: 3px; }

    .paragraph {
      margin-bottom: 12px;
      text-align: justify;
    }

    .data-table {
      width: 100%;
      margin: 10px 0 16px;
      border-collapse: collapse;
    }
    .data-table td {
      padding: 3px 0;
      vertical-align: top;
      font-size: 11pt;
    }
    .data-table td:first-child { width: 170px; }
    .data-table td:nth-child(2) { width: 15px; text-align: center; }

    .rekap-box {
      margin: 14px 0 18px;
      border: 1px solid #000;
      border-collapse: collapse;
      width: 100%;
      font-size: 10.5pt;
    }
    .rekap-box th, .rekap-box td {
      border: 1px solid #000;
      padding: 5px 8px;
    }
    .rekap-box th {
      background: #f5f5f5;
      text-align: center;
    }

    .signature-container {
      margin-top: 28px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-block {
      width: 250px;
      text-align: center;
      font-size: 11pt;
    }
    .signature-space {
      height: 70px;
    }
    .signature-name {
      font-weight: bold;
      text-decoration: underline;
    }

    @media print {
      body, .page { width: 100%; margin: 0; padding: 15mm 20mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Kop Surat -->
    <div class="kop">
      <div class="kop-text">
        <h1>RSIA AISYIYAH PEKAJANGAN</h1>
        <p>JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN JAWA TENGAH 51172</p>
        <p>Telp. (0285) 785909 | E-mail: rsiap_pkj@yahoo.co.id</p>
      </div>
    </div>

    <!-- Judul Surat -->
    <div class="judul">
      <h2>SURAT KETERANGAN KINERJA PELAYANAN DOKTER</h2>
      <p>Nomor: ${f.no_surat}</p>
    </div>

    <!-- Paragraf Pembuka -->
    <div class="paragraph">
      Yang bertanda tangan di bawah ini, Pimpinan Rumah Sakit Ibu dan Anak (RSIA) Aisyiyah Pekajangan Kabupaten Pekalongan, dengan ini menerangkan dengan sesungguhnya bahwa:
    </div>

    <!-- Tabel Identitas Dokter -->
    <table class="data-table">
      <tr><td>Nama Lengkap</td><td>:</td><td><strong>${d.nm_dokter}</strong></td></tr>
      <tr><td>Spesialisasi / Profesi</td><td>:</td><td><strong>${d.nm_sps}</strong></td></tr>
      <tr><td>Nomor STR</td><td>:</td><td>${d.nomor_str || '-'}</td></tr>
      <tr><td>Nomor SIP Aktif</td><td>:</td><td>${d.nomor_sip || '-'}</td></tr>
      <tr><td>Masa Berlaku SIP</td><td>:</td><td>${d.tanggal_akhir_sip ? this.formatDateIndo(d.tanggal_akhir_sip) : '-'}</td></tr>
      <tr><td>Unit Pelayanan</td><td>:</td><td>RSIA Aisyiyah Pekajangan</td></tr>
    </table>

    <!-- Keterangan Pelayanan -->
    <div class="paragraph">
      Adalah benar dokter yang aktif melaksanakan praktik profesi dan pelayanan klinis di RSIA Aisyiyah Pekajangan. Berdasarkan rekapitulasi data rekam medis dan sistem informasi rumah sakit (SIMRS) pada periode <strong>${periodAwal}</strong> s/d <strong>${periodAkhir}</strong>, yang bersangkutan telah melaksanakan aktivitas pelayanan medis dengan ringkasan sebagai berikut:
    </div>

    <!-- Tabel Rekap Pelayanan (Dinamis: Bulanan / Kategori) -->
    ${tableMainHtml}

    <!-- Paragraf Penutup -->
    <div class="paragraph" style="margin-top: 14px;">
      Demikian Surat Keterangan Kinerja Pelayanan Dokter ini diterbitkan dengan sebenarnya untuk dapat dipergunakan sebagai aspek penilaian kinerja serta persyaratan <strong>${f.keperluan}</strong> ke instansi / organisasi profesi terkait (IDI / Dinkes / DPM-PTSP).
    </div>

    <!-- Tanda Tangan -->
    <div class="signature-container">
      <div class="signature-block">
        <div>Pekalongan, ${tglSuratIndo}</div>
        <div style="margin-top: 2px;">${f.penandatangan_jabatan}</div>
        <div class="signature-space"></div>
        <div class="signature-name">${f.penandatangan_nama}</div>
        <div style="font-size: 9pt; color: #555;">NBM / NIK: ..............................</div>
      </div>
    </div>

    ${tableTindakanHtml}
  </div>
</body>
</html>
      `

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.open()
        printWindow.document.write(printHtml)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }
}
</script>

<style scoped>
.print-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 650px;
  background: #ffffff;
}

.modal-header-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
}

.text-xs {
  font-size: 0.75rem;
}
</style>
