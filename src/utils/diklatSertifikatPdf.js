/**
 * diklatSertifikatPdf.js
 * Generator PDF Sertifikat Diklat Internal — 2 Halaman
 *
 * Halaman 1 : Sertifikat (landscape, ornamen geometris)
 * Halaman 2 : Daftar Materi & JPL (portrait)
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/**
 * Ambil Base64 dari URL gambar via Canvas (handles CORS via proxy jika perlu)
 */
async function imgToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve({
        b64: canvas.toDataURL('image/png'),
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// Cache untuk menghindari download font berulang kali
const fontCache = {}

/**
 * Download font dari CDN dan registrasikan ke jsPDF
 */
async function loadAndRegisterFont(doc, fontName, url, fontStyle = 'normal') {
  let base64 = fontCache[url]
  if (!base64) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Gagal mengambil file font')
      const arrayBuffer = await response.arrayBuffer()
      let binary = ''
      const bytes = new Uint8Array(arrayBuffer)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      base64 = btoa(binary)
      fontCache[url] = base64
    } catch (e) {
      console.warn(`[diklatSertifikatPdf] Gagal memuat font ${fontName} (${fontStyle}) dari CDN. Menggunakan font bawaan.`, e)
      return false
    }
  }

  try {
    const filename = `${fontName}-${fontStyle}.ttf`
    doc.addFileToVFS(filename, base64)
    doc.addFont(filename, fontName, fontStyle)
    return true
  } catch (e) {
    console.error(`Gagal menambahkan font ${fontName} ke VFS:`, e)
    return false
  }
}

/**
 * Menggambar teks dengan spasi antar karakter (letter-spacing)
 */
function drawTextWithSpacing(doc, text, x, y, spacing, options = {}) {
  const align = options.align || 'left'
  const charList = text.split('')
  
  // Hitung total lebar teks termasuk spasi tambahan
  let totalWidth = 0
  charList.forEach((char, idx) => {
    totalWidth += doc.getTextWidth(char)
    if (idx < charList.length - 1) {
      totalWidth += spacing
    }
  })

  let startX = x
  if (align === 'center') {
    startX = x - totalWidth / 2
  } else if (align === 'right') {
    startX = x - totalWidth
  }

  let currentX = startX
  charList.forEach((char, idx) => {
    doc.text(char, currentX, y)
    currentX += doc.getTextWidth(char) + spacing
  })
}

/**
 * Format tanggal ke bahasa Indonesia
 */
function formatTanggalId(dateStr) {
  if (!dateStr) return '-'
  const bulan = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()} ${bulan[d.getMonth() + 1]} ${d.getFullYear()}`
}

/**
 * Format range tanggal
 */
function formatDateRange(start, end) {
  if (!start) return '-'
  if (!end || start === end) return formatTanggalId(start)
  const s = new Date(start)
  const e = new Date(end)
  const bulan = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()} - ${e.getDate()} ${bulan[e.getMonth() + 1]} ${e.getFullYear()}`
  }
  return `${s.getDate()} ${bulan[s.getMonth() + 1]} - ${e.getDate()} ${bulan[e.getMonth() + 1]} ${e.getFullYear()}`
}

/**
 * Parse kolom materi (text multiline / comma-separated / semicolon)
 * Returns: Array of { materi: string, jpl: number|null }
 */
function parseMateri(materiStr, totalJpl) {
  if (!materiStr || materiStr.trim() === '') return []

  // Check if string contains HTML tags
  if (/<[a-z][\s\S]*>/i.test(materiStr)) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(materiStr, 'text/html')
      
      // Filter out rows that contain another table to handle nested tables
      const trs = Array.from(doc.querySelectorAll('tr')).filter(tr => !tr.querySelector('table'))
      const result = []

      trs.forEach(tr => {
        const cells = tr.querySelectorAll('td, th')
        if (cells.length >= 1) {
          let materiText = ''
          let jplText = ''

          if (cells.length >= 3) {
            // Table has 3 or more columns: e.g., No, Materi, JPL
            materiText = cells[1].textContent.trim().replace(/\u00a0/g, ' ')
            jplText = cells[2].textContent.trim().replace(/\u00a0/g, ' ')
          } else {
            // Table has 1 or 2 columns: e.g., Materi, JPL
            materiText = cells[0].textContent.trim().replace(/\u00a0/g, ' ')
            jplText = cells.length >= 2 ? cells[1].textContent.trim().replace(/\u00a0/g, ' ') : ''
          }

          // Skip header rows or completely empty rows
          const lowerMateri = materiText.toLowerCase()
          const isHeader = lowerMateri === 'materi' || lowerMateri === 'materi pelatihan' || lowerMateri === 'no' || lowerMateri === 'no.' || lowerMateri === 'no'
          if (isHeader || (materiText === '' && jplText === '')) {
            return
          }

          // Parse JPL
          let jplVal = parseFloat(jplText)
          if (isNaN(jplVal)) {
            jplVal = null
          }

          result.push({
            materi: materiText,
            jpl: jplVal
          })
        }
      })
      if (result.length > 0) {
        return result
      }
    } catch (e) {
      console.error('Error parsing HTML materi:', e)
    }
  }

  // Fallback to plain text split if not HTML or parsing yields empty
  let rows = []
  if (materiStr.includes('\n')) {
    rows = materiStr.split('\n').map(s => s.trim()).filter(Boolean)
  } else if (materiStr.includes(';')) {
    rows = materiStr.split(';').map(s => s.trim()).filter(Boolean)
  } else if (materiStr.includes(',')) {
    rows = materiStr.split(',').map(s => s.trim()).filter(Boolean)
  } else {
    rows = [materiStr.trim()]
  }

  // Distribusikan JPL secara merata jika tidak ada rincian
  const jplPerRow = totalJpl && rows.length > 0 ? Math.round(totalJpl / rows.length) : null

  return rows.map((m, i) => ({
    materi: m,
    jpl: jplPerRow !== null ? (i === rows.length - 1 ? totalJpl - jplPerRow * (rows.length - 1) : jplPerRow) : null
  }))
}

// ─────────────────────────────────────────────
//  Gambar Ornamen Halaman 1 (Landscape)
//  Desain: "Gelombang Prisma" — berbeda dari contoh
// ─────────────────────────────────────────────

function drawCertificateBackground(doc, W, H) {
  // === BACKGROUND PUTIH ===
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // ─── ORNAMEN KIRI ATAS: Panel teal diagonal ───
  doc.setFillColor(0, 128, 128) // Teal
  doc.triangle(0, 0, 60, 0, 0, 50, 'F')
  doc.setFillColor(0, 100, 100)
  doc.triangle(0, 0, 45, 0, 0, 38, 'F')

  // Pita diagonal bawah kiri
  doc.setFillColor(0, 160, 140)
  doc.triangle(0, H, 55, H, 0, H - 45, 'F')
  doc.setFillColor(0, 128, 128)
  doc.triangle(0, H, 38, H, 0, H - 30, 'F')

  // ─── ORNAMEN KANAN ATAS: Gold/amber ───
  doc.setFillColor(212, 160, 23)
  doc.triangle(W, 0, W - 60, 0, W, 50, 'F')
  doc.setFillColor(180, 130, 10)
  doc.triangle(W, 0, W - 44, 0, W, 36, 'F')

  // Pita diagonal bawah kanan
  doc.setFillColor(212, 160, 23)
  doc.triangle(W, H, W - 55, H, W, H - 45, 'F')
  doc.setFillColor(180, 130, 10)
  doc.triangle(W, H, W - 38, H, W, H - 30, 'F')

  // ─── Garis dekorasi accent tengah atas ───
  doc.setDrawColor(0, 128, 128)
  doc.setLineWidth(0.6)
  doc.line(0, 18, W, 18)
  doc.setDrawColor(212, 160, 23)
  doc.setLineWidth(0.3)
  doc.line(0, 20.5, W, 20.5)

  // ─── Garis accent tengah bawah ───
  doc.setDrawColor(0, 128, 128)
  doc.setLineWidth(0.6)
  doc.line(0, H - 18, W, H - 18)
  doc.setDrawColor(212, 160, 23)
  doc.setLineWidth(0.3)
  doc.line(0, H - 20.5, W, H - 20.5)

  // ─── Border dalam (double border) ───
  doc.setDrawColor(0, 128, 128)
  doc.setLineWidth(1.2)
  doc.rect(8, 8, W - 16, H - 16)
  doc.setDrawColor(212, 160, 23)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, W - 20, H - 20)

  // ─── Rosette sudut: lingkaran kecil di 4 sudut ───
  const corners = [[8, 8], [W - 8, 8], [8, H - 8], [W - 8, H - 8]]
  corners.forEach(([cx, cy]) => {
    doc.setFillColor(212, 160, 23)
    doc.circle(cx, cy, 3, 'F')
    doc.setFillColor(255, 255, 255)
    doc.circle(cx, cy, 1.5, 'F')
  })
}

// ─────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────

/**
 * Generate PDF Sertifikat Diklat Internal
 *
 * @param {Object} diklatItem  — row dari diklatList
 * @param {Object} pegawai     — selectedEmployee (nama, nik, jbtn, departemen)
 * @param {Object} opts        — { direkturNama, ketuaPanitia, logoRsiaUrl, logoLarsiUrl }
 */
export async function generateSertifikatDiklat(diklatItem, pegawai, opts = {}) {
  const {
    direkturNama = 'dr. Himawan Budityastomo, SpOG',
    ketuaPanitia = 'Ketua Panitia',
    logoRsiaUrl = null,
    logoLarsiUrl = null,
  } = opts

  const kegiatan = diklatItem.kegiatan || {}
  const namaKegiatan = (kegiatan.nama_kegiatan || 'Kegiatan Diklat').toUpperCase()
  const nomor = kegiatan.nomor || ''
  const penyelenggara = kegiatan.penyelenggara || 'Diklat RSIA Aisyiyah Pekajangan'
  const tglRange = formatDateRange(kegiatan.tgl_mulai, kegiatan.tgl_akhir)
  const totalJpl = kegiatan.jpl || null
  const peran = diklatItem.peserta || 'Peserta'
  const namaPegawai = pegawai?.nama || ''
  const materiRows = parseMateri(kegiatan.materi, totalJpl)

  // ── Preload gambar logo ──
  let logoRsiaB64 = null
  let logoLarsiB64 = null
  if (logoRsiaUrl) logoRsiaB64 = await imgToBase64(logoRsiaUrl)
  if (logoLarsiUrl) logoLarsiB64 = await imgToBase64(logoLarsiUrl)

  // ── Generate QR Code Barcodes ──
  let qrDirekturB64 = null
  let qrPanitiaB64 = null
  try {
    const qrDirekturText = `VERIFIKASI SERTIFIKAT DIKLAT INTERNAL RSIA AISYIYAH PEKAJANGAN
Ditandatangani secara elektronik oleh:
DIREKTUR RSIA AISYIYAH PEKAJANGAN
Nama: ${direkturNama}
NIK: -
Nomor Sertifikat: ${nomor || '-'}
Penerima: ${namaPegawai} (${pegawai?.nik || '-'})`

    const qrPanitiaText = `VERIFIKASI SERTIFIKAT DIKLAT INTERNAL RSIA AISYIYAH PEKAJANGAN
Ditandatangani secara elektronik oleh:
KETUA PANITIA DIKLAT
Nama: ${ketuaPanitia}
Nomor Sertifikat: ${nomor || '-'}
Penerima: ${namaPegawai} (${pegawai?.nik || '-'})`

    qrDirekturB64 = await QRCode.toDataURL(qrDirekturText, { width: 150, margin: 1 })
    qrPanitiaB64 = await QRCode.toDataURL(qrPanitiaText, { width: 150, margin: 1 })
  } catch (err) {
    console.error('Gagal generate QR Code:', err)
  }

  // ── Init jsPDF ──
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()   // 297
  const H = doc.internal.pageSize.getHeight()  // 210

  // ── Load Custom Fonts dari Google gstatic CDN ──
  const montserratRegUrl = 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX9-obK4.ttf'
  const montserratBoldUrl = 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX9-obK4.ttf'
  const playfairItalicUrl = 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtHA_H-oE0o.ttf'

  const hasMontserratReg = await loadAndRegisterFont(doc, 'Montserrat', montserratRegUrl, 'normal')
  const hasMontserratBold = await loadAndRegisterFont(doc, 'Montserrat', montserratBoldUrl, 'bold')
  const hasPlayfairItalic = await loadAndRegisterFont(doc, 'Playfair', playfairItalicUrl, 'italic')

  const fontSansNormal = hasMontserratReg ? 'Montserrat' : 'helvetica'
  const fontSansBold = hasMontserratBold ? 'Montserrat' : 'helvetica'
  const fontSerifItalic = hasPlayfairItalic ? 'Playfair' : 'times'

  // ════════════════════════════════════════════
  //  HALAMAN 1 — SERTIFIKAT
  // ════════════════════════════════════════════
  drawCertificateBackground(doc, W, H)

  // ── Logo RSIA (kiri) ──
  if (logoRsiaB64 && logoRsiaB64.b64) {
    const rsiaHeight = 15
    const rsiaWidth = rsiaHeight * (logoRsiaB64.width / logoRsiaB64.height)
    doc.addImage(logoRsiaB64.b64, 'PNG', 26, 25, rsiaWidth, rsiaHeight)
  } else {
    doc.setFontSize(9)
    doc.setTextColor(0, 128, 128)
    doc.setFont(fontSansBold, 'bold')
    doc.text('RSIA AISYIYAH\nPEKAJANGAN', 26, 28)
  }

  // ── Logo LARSI (kanan) ──
  if (logoLarsiB64 && logoLarsiB64.b64) {
    const larsiHeight = 11.5
    const larsiWidth = larsiHeight * (logoLarsiB64.width / logoLarsiB64.height)
    doc.addImage(logoLarsiB64.b64, 'PNG', W - 26 - larsiWidth, 26.8, larsiWidth, larsiHeight)
  }

  // ── Judul SERTIFIKAT ──
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30, 30, 60)
  drawTextWithSpacing(doc, 'SERTIFIKAT', W / 2, 35, 1.8, { align: 'center' })

  // ── Nomor Sertifikat ──
  if (nomor) {
    doc.setFont(fontSansNormal, 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(80, 80, 80)
    doc.text(nomor, W / 2, 43, { align: 'center' })
  }

  // ── Teks "Dengan ini menerangkan bahwa :" ──
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(80, 80, 80)
  doc.text('Dengan ini menerangkan bahwa :', W / 2, 60, { align: 'center' })

  // ── Nama Pegawai ──
  doc.setFont(fontSerifItalic, 'italic')
  doc.setFontSize(hasPlayfairItalic ? 24 : 22)
  doc.setTextColor(15, 15, 15)
  doc.text(namaPegawai, W / 2, 72, { align: 'center' })

  // Garis bawah nama
  doc.setDrawColor(0, 128, 128)
  doc.setLineWidth(0.7)
  const namaWidth = Math.min(doc.getTextWidth(namaPegawai) + 20, W - 80)
  doc.line(W / 2 - namaWidth / 2, 75, W / 2 + namaWidth / 2, 75)

  // ── Peran ──
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(0, 100, 100)
  doc.text(peran, W / 2, 83, { align: 'center' })

  // ── "Telah Mengikuti" ──
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(80, 80, 80)
  doc.text('Telah Mengikuti', W / 2, 92, { align: 'center' })

  // ── Nama Kegiatan ──
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20, 20, 60)
  const namaLines = doc.splitTextToSize(namaKegiatan, W - 100)
  doc.text(namaLines, W / 2, 103, { align: 'center' })
  const namaEndY = 103 + (namaLines.length - 1) * 8

  // ── Penyelenggara ──
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(100, 100, 100)
  doc.text(`Penyelenggara: ${penyelenggara}`, W / 2, namaEndY + 8, { align: 'center' })

  // ── "Yang dilaksanakan pada tanggal :" ──
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text('Yang dilaksanakan pada tanggal :', W / 2, namaEndY + 17, { align: 'center' })

  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(20, 20, 60)
  doc.text(tglRange, W / 2, namaEndY + 24, { align: 'center' })

  // JPL & SKP info kecil
  const infoArr = []
  if (totalJpl) infoArr.push(`${totalJpl} JPL`)
  if (kegiatan.skp) infoArr.push(`${kegiatan.skp} SKP`)
  if (infoArr.length) {
    doc.setFont(fontSansNormal, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(120, 120, 120)
    doc.text(infoArr.join('  •  '), W / 2, namaEndY + 30, { align: 'center' })
  }

  // ── Area Tanda Tangan ──
  const sigY = H - 50 // Dinaikkan agar tidak menabrak / samar dengan garis ornamen bawah
  const leftSigX = 55 // Digeser dari 40 ke 55 agar lebih ke tengah
  const rightSigX = W - 55 // Digeser dari W-40 ke W-55 agar lebih ke tengah

  // Kiri: Direktur
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(10, 10, 10)
  doc.text('DIREKTUR RSIA AISYIYAH PEKAJANGAN', leftSigX, sigY, { align: 'center' })
  if (qrDirekturB64) {
    doc.addImage(qrDirekturB64, 'PNG', leftSigX - 9, sigY + 2, 18, 18)
  }

  // Garis tanda tangan kiri
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(0.4)
  doc.line(leftSigX - 25, sigY + 21, leftSigX + 25, sigY + 21)

  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(10, 10, 10)
  doc.text(direkturNama, leftSigX, sigY + 26, { align: 'center' })

  // Kanan: Ketua Panitia
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(8.5)
  doc.text('KETUA PANITIA', rightSigX, sigY, { align: 'center' })
  if (qrPanitiaB64) {
    doc.addImage(qrPanitiaB64, 'PNG', rightSigX - 9, sigY + 2, 18, 18)
  }

  // Garis tanda tangan kanan
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(0.4)
  doc.line(rightSigX - 25, sigY + 21, rightSigX + 25, sigY + 21)

  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(9)
  doc.text(ketuaPanitia, rightSigX, sigY + 26, { align: 'center' })

  // ════════════════════════════════════════════
  //  HALAMAN 2 — MATERI & JPL (Landscape)
  // ════════════════════════════════════════════
  doc.addPage('a4', 'landscape')
  const W2 = doc.internal.pageSize.getWidth()   // 297
  const H2 = doc.internal.pageSize.getHeight()  // 210

  // Background putih bersih
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W2, H2, 'F')

  // Strip teal tipis di atas
  doc.setFillColor(0, 128, 128)
  doc.rect(0, 0, W2, 8, 'F')
  doc.setFillColor(212, 160, 23)
  doc.rect(0, 8, W2, 2.5, 'F')

  // Strip teal tipis di bawah
  doc.setFillColor(212, 160, 23)
  doc.rect(0, H2 - 10.5, W2, 2.5, 'F')
  doc.setFillColor(0, 128, 128)
  doc.rect(0, H2 - 8, W2, 8, 'F')

  // Sub-header kecil
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  doc.text('RSIA AISYIYAH PEKAJANGAN', W2 / 2, 5.5, { align: 'center' })

  // Judul Kegiatan
  doc.setFont(fontSansBold, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(20, 20, 60)
  const jdlLines = doc.splitTextToSize(namaKegiatan, W2 - 40)
  doc.text(jdlLines, W2 / 2, 24, { align: 'center' })
  const jdlEndY = 24 + (jdlLines.length - 1) * 6

  // Info tanggal & tempat
  doc.setFont(fontSansNormal, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(80, 80, 80)
  doc.text(`${tglRange} • ${kegiatan.tempat || ''}`, W2 / 2, jdlEndY + 5, { align: 'center' })

  // Garis bawah judul
  doc.setDrawColor(0, 128, 128)
  doc.setLineWidth(0.8)
  doc.line(20, jdlEndY + 8, W2 - 20, jdlEndY + 8)
  doc.setDrawColor(212, 160, 23)
  doc.setLineWidth(0.35)
  doc.line(20, jdlEndY + 10, W2 - 20, jdlEndY + 10)

  const tableStartY = jdlEndY + 14

  // Tabel Materi
  if (materiRows.length > 0) {
    const tableBody = materiRows.map((row, i) => [
      i + 1,
      row.materi,
      row.jpl !== null ? row.jpl : '-'
    ])

    // Baris Total
    if (totalJpl) {
      tableBody.push(['', { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'right' } }, { content: totalJpl, styles: { fontStyle: 'bold', halign: 'center' } }])
    }

    // Dynamic padding & fontSize agar tabel tidak pernah melimpah ke halaman 3
    const rowCount = materiRows.length
    let dynamicPadding = 3.5
    let dynamicFontSize = 9.5

    if (rowCount > 15) {
      dynamicPadding = 1.4
      dynamicFontSize = 8.0
    } else if (rowCount > 10) {
      dynamicPadding = 2.0
      dynamicFontSize = 8.5
    } else if (rowCount > 7) {
      dynamicPadding = 2.5
      dynamicFontSize = 9.0
    }

    autoTable(doc, {
      startY: tableStartY,
      margin: { top: 15, bottom: 12, left: 20, right: 20 },
      head: [['No', 'MATERI', 'JPL']],
      body: tableBody,
      styles: {
        font: fontSansNormal,
        fontSize: dynamicFontSize,
        cellPadding: dynamicPadding,
        lineColor: [180, 180, 180],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [0, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: dynamicFontSize,
        cellPadding: dynamicPadding + 0.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 22 },
      },
      alternateRowStyles: {
        fillColor: [240, 250, 250],
      },
      didDrawPage: (data) => {
        const W2 = doc.internal.pageSize.getWidth()
        const H2 = doc.internal.pageSize.getHeight()

        // Strip teal tipis di atas
        doc.setFillColor(0, 128, 128)
        doc.rect(0, 0, W2, 8, 'F')
        doc.setFillColor(212, 160, 23)
        doc.rect(0, 8, W2, 2.5, 'F')

        // Strip teal tipis di bawah
        doc.setFillColor(212, 160, 23)
        doc.rect(0, H2 - 10.5, W2, 2.5, 'F')
        doc.setFillColor(0, 128, 128)
        doc.rect(0, H2 - 8, W2, 8, 'F')

        // Sub-header kecil di atas
        doc.setFont(fontSansNormal, 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(255, 255, 255)
        doc.text('RSIA AISYIYAH PEKAJANGAN', W2 / 2, 5.5, { align: 'center' })
      }
    })

    const afterTableY = doc.lastAutoTable.finalY + 12

    // Catatan JPL jika tidak ada rincian materi
    if (materiRows.length === 1 && !kegiatan.materi) {
      doc.setFont(fontSansNormal, 'italic')
      doc.setFontSize(8)
      doc.setTextColor(130, 130, 130)
      doc.text('* Rincian materi tidak tersedia', 20, afterTableY)
    }
  } else {
    // Jika tidak ada materi — tampilkan pesan ringkas
    doc.setFont(fontSansNormal, 'italic')
    doc.setFontSize(11)
    doc.setTextColor(150, 150, 150)
    doc.text('Rincian materi pelatihan tidak tersedia.', W2 / 2, tableStartY + 20, { align: 'center' })

    doc.setFont(fontSansNormal, 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    if (totalJpl) doc.text(`Total JPL: ${totalJpl} Jam Pelajaran`, W2 / 2, tableStartY + 32, { align: 'center' })
  }



  // ── Return Blob URL (untuk preview di modal, BUKAN langsung save) ──
  const safeName = namaPegawai.replace(/[^a-zA-Z0-9]/g, '_')
  const safeKegiatan = namaKegiatan.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = `Sertifikat_${safeKegiatan}_${safeName}.pdf`

  const pdfBlob = doc.output('blob')
  const blobUrl = URL.createObjectURL(pdfBlob)

  return { blobUrl, fileName, doc }
}

/**
 * Trigger download file dari Blob URL
 */
export function downloadPdfFromBlob(blobUrl, fileName) {
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = fileName
  a.click()
}

/**
 * Trigger print dialog dari Blob URL via iframe tersembunyi
 */
export function printPdfFromBlob(blobUrl) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = blobUrl
  document.body.appendChild(iframe)
  iframe.onload = () => {
    iframe.contentWindow.print()
    // Bersihkan setelah beberapa detik
    setTimeout(() => document.body.removeChild(iframe), 5000)
  }
}
