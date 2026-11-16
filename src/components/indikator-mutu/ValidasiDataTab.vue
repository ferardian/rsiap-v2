<template>
  <div class="validasi-data-tab">
    <!-- Unit Submission & Audit Workflow Banner -->
    <div v-if="unitAudit" class="unit-status-banner mb-4" :class="'status-' + unitAudit.submission_status">
      <div class="banner-body d-flex align-items-center justify-content-between flex-wrap gap-3 p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="banner-icon-wrap" :class="'icon-' + unitAudit.submission_status">
            <i class="fas" :class="getBannerIcon(unitAudit.submission_status)"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h6 class="banner-title mb-0">{{ getBannerTitle(unitAudit) }}</h6>
              <span class="badge rounded-pill banner-badge" :class="'badge-' + unitAudit.submission_status">
                {{ getBannerBadgeText(unitAudit.submission_status) }}
              </span>
            </div>
            <p class="banner-desc mb-0 text-muted small">
              {{ getBannerDesc(unitAudit) }}
            </p>
          </div>
        </div>

        <div class="banner-actions d-flex align-items-center gap-2 flex-wrap">
          <!-- PIC Actions -->
          <template v-if="isPicUser">
            <!-- Ready to Request Validation -->
            <button 
              v-if="unitAudit.can_request" 
              class="btn btn-sm btn-primary fw-bold px-3 shadow-sm d-inline-flex align-items-center gap-2"
              @click="openRequestValidationModal"
              :disabled="actionLoading"
            >
              <i class="fas fa-paper-plane"></i> Minta Validasi
            </button>

            <!-- Recall / Cancel Validation -->
            <button 
              v-if="unitAudit.can_cancel" 
              class="btn btn-sm btn-outline-warning fw-bold px-3 d-inline-flex align-items-center gap-2"
              @click="handleCancelValidation"
              :disabled="actionLoading"
              title="Tarik pengajuan untuk memperbaiki entri data"
            >
              <i class="fas fa-undo"></i> Batal Kirim / Tarik Pengajuan
            </button>

            <!-- Resubmit Revision -->
            <button 
              v-if="unitAudit.submission_status === 'revision'" 
              class="btn btn-sm btn-danger fw-bold px-3 shadow-sm d-inline-flex align-items-center gap-2"
              @click="openRequestValidationModal"
              :disabled="actionLoading"
            >
              <i class="fas fa-redo"></i> Ajukan Ulang Validasi
            </button>
          </template>

          <!-- Validator Actions -->
          <template v-if="isValidatorUser">
            <!-- Return for Revision -->
            <button 
              v-if="unitAudit.submission_status === 'requested'" 
              class="btn btn-sm btn-outline-danger fw-bold px-3 d-inline-flex align-items-center gap-2"
              @click="openReturnRevisionModal"
              :disabled="actionLoading"
              title="Kembalikan data ke PIC untuk diperbaiki"
            >
              <i class="fas fa-reply"></i> Minta Revisi ke PIC
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Validation Summary Bar -->
    <div class="row g-3 mb-4">
      <div class="col-sm-4">
        <div class="stat-premium-card total">
          <div class="icon-wrap">
            <i class="fas fa-list-ol"></i>
          </div>
          <div class="details">
            <span class="num">{{ items.length }}</span>
            <span class="label">Total Indikator</span>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="stat-premium-card success">
          <div class="icon-wrap">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="details">
            <span class="num">{{ items.filter(i => i.status === 'verified').length }}</span>
            <span class="label">Telah Divalidasi</span>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="stat-premium-card warning">
          <div class="icon-wrap">
            <i class="fas fa-clock"></i>
          </div>
          <div class="details">
            <span class="num">{{ items.filter(i => i.status !== 'verified').length }}</span>
            <span class="label">Menunggu Validasi</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div v-if="items.some(i => i.status === 'verified')" class="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
        <span class="fw-bold text-dark small text-uppercase">
          <i class="fas fa-check-double text-success me-1"></i> Laporan Terverifikasi
        </span>
        <!-- Single Export Dropdown -->
        <div class="dropdown position-relative" @click.stop>
          <button class="btn btn-xs btn-danger dropdown-toggle fw-bold text-white shadow-sm" type="button" @click.stop="toggleTabExportDropdown" style="font-size: 0.72rem; padding: 6px 14px; border-radius: 8px; background-color: #dc2626; border-color: #dc2626; border: none;">
            <i class="fas fa-file-export me-1"></i> Unduh Laporan
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border border-light rounded-3 show" v-if="showTabExportDropdown" style="display: block; position: absolute; right: 0; top: 100%; z-index: 1050; min-width: 140px; font-size: 0.8rem; text-align: left;">
            <li><a class="dropdown-item py-2 cursor-pointer" @click.prevent.stop="triggerTabExport('pdf')" href="#"><i class="fas fa-file-pdf me-2 text-danger"></i> Unduh PDF</a></li>
            <li><a class="dropdown-item py-2 cursor-pointer" @click.prevent.stop="triggerTabExport('excel')" href="#"><i class="fas fa-file-excel me-2 text-success"></i> Unduh Excel</a></li>
          </ul>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle premium-validation-table mb-0">
          <thead>
            <tr>
              <th width="4%">#</th>
              <th width="28%">Indikator Mutu &amp; Target</th>
              <th width="18%" class="text-center">Capaian PIC (P1)</th>
              <th width="20%" class="text-center">Validasi (P2)</th>
              <th width="16%" class="text-center">Status Validasi</th>
              <th width="14%" class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2 mb-0 small">Memuat data validasi...</p>
              </td>
            </tr>

            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fas fa-clipboard-list fa-3x mb-3 opacity-30"></i>
                <p class="mb-0">Tidak ada data indikator mutu untuk unit ini pada periode tersebut.</p>
              </td>
            </tr>

            <tr v-else v-for="(item, idx) in items" :key="item.id_inmut" :class="{ 'row-verified': item.status === 'verified' }">
              <td class="text-center fw-bold text-secondary">{{ idx + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span :class="['badge rounded-pill px-2 py-0.5 extra-small', getCategoryBadge(item).badgeClass]" :title="getCategoryBadge(item).label">
                    {{ getCategoryBadge(item).code }}
                  </span>
                  <span class="indicator-name mb-0">{{ item.nama_inmut }}</span>
                </div>
                <div class="mt-1">
                  <span class="badge badge-target">
                    Target: {{ getTargetSymbol(item.rumus) }} {{ item.standar }}%
                  </span>
                </div>
              </td>
              <!-- Akumulasi Awal PIC (P1) -->
              <td class="text-center">
                <div class="original-scores">
                  <div class="fraction">
                    <span class="num">{{ item.sum_num }}</span>
                    <span class="divider">/</span>
                    <span class="denum">{{ item.sum_denum }}</span>
                  </div>
                  <div class="percentage text-muted small mt-1 font-monospace fw-bold">
                    P1: {{ calculateP1(item) }}{{ needsDenominator(item) ? '%' : '' }}
                  </div>
                </div>
              </td>
              <!-- Akumulasi Validasi (P2) -->
              <td class="text-center">
                <!-- If Verified: read only -->
                <div v-if="item.status === 'verified'" class="validated-scores">
                  <div class="fraction fw-bold text-success">
                    <span class="num">{{ item.num_validasi }}</span>
                    <template v-if="needsDenominator(item)">
                      <span class="divider">/</span>
                      <span class="denum">{{ item.denum_validasi }}</span>
                    </template>
                  </div>
                  <div class="percentage text-success small mt-1 fw-bold font-monospace">
                    P2: {{ calculateP2(item) }}{{ needsDenominator(item) ? '%' : '' }}
                  </div>
                  <div class="mt-2">
                    <span v-if="calculateAgreementRate(item) !== null" :class="calculateAgreementRate(item) >= 90 ? 'badge-ar-valid' : 'badge-ar-invalid'" :title="`Rasio P2/P1: (${calculateP2(item)} / ${calculateP1(item)}) * 100`">
                      <i class="fas me-1" :class="calculateAgreementRate(item) >= 90 ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
                      AR (P2/P1): {{ calculateAgreementRate(item) }}%
                    </span>
                    <span v-else class="badge bg-light text-muted border py-1 px-2" style="font-size: 0.72rem;">
                      AR: N/A (Nihil)
                    </span>
                  </div>
                </div>
                
                <!-- Editable if pending or rejected and user is coordinator -->
                <div v-else-if="canEdit" class="d-flex flex-column align-items-center gap-1">
                  <div class="d-flex align-items-center gap-1 justify-content-center">
                    <input 
                      type="number" 
                      class="form-control form-control-sm text-center px-1" 
                      v-model.number="item.num_validasi" 
                      min="0"
                      placeholder="0"
                      style="width: 50px; height: 28px; font-size: 0.85rem; border-radius: 6px; font-weight: 600;"
                    >
                    <template v-if="needsDenominator(item)">
                      <span class="text-muted fw-light" style="font-size: 1.1rem; margin: 0 2px;">/</span>
                      <input 
                        type="number" 
                        class="form-control form-control-sm text-center px-1" 
                        v-model.number="item.denum_validasi" 
                        min="0"
                        placeholder="0"
                        style="width: 50px; height: 28px; font-size: 0.85rem; border-radius: 6px; font-weight: 600;"
                      >
                    </template>
                  </div>
                  <div class="text-center mt-1">
                    <div class="text-muted small fw-semibold font-monospace" style="font-size: 0.75rem;">
                      P2: <span class="text-primary fw-bold">{{ calculateP2(item) }}{{ needsDenominator(item) ? '%' : '' }}</span>
                    </div>
                    <div class="mt-1">
                      <span v-if="calculateAgreementRate(item) !== null" :class="calculateAgreementRate(item) >= 90 ? 'badge-ar-valid' : 'badge-ar-invalid'" :title="`Rasio P2/P1: (${calculateP2(item)} / ${calculateP1(item)}) * 100`">
                        <i class="fas me-1" :class="calculateAgreementRate(item) >= 90 ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
                        AR: {{ calculateAgreementRate(item) }}%
                      </span>
                      <span v-else class="badge bg-light text-muted border py-1 px-2" style="font-size: 0.72rem;">
                        AR: -
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else class="validated-scores text-muted">
                  <div class="fraction">
                    <span class="num">-</span>
                  </div>
                  <div class="percentage small mt-1 font-monospace fw-bold text-muted">
                    P2: -
                  </div>
                  <div class="mt-2">
                    <span class="badge bg-light text-muted border py-1 px-2" style="font-size: 0.72rem;">
                      <i class="fas fa-clock me-1"></i> Belum Divalidasi
                    </span>
                  </div>
                </div>
              </td>
              <!-- Status Validasi -->
              <td class="text-center">
                <div class="d-flex flex-column align-items-center gap-1">
                  <span class="status-badge" :class="item.status">
                    <i class="fas me-1" :class="item.status === 'verified' ? 'fa-check-double' : (item.status === 'rejected' ? 'fa-times-circle' : 'fa-clock')"></i>
                    {{ formatStatus(item.status) }}
                  </span>
                  
                  <!-- Metadata of Validator -->
                  <div v-if="item.status !== 'pending' && item.validator_nama" class="validator-meta text-muted mt-1">
                    <div class="text-truncate max-w-150" :title="`Oleh: ${item.validator_nama}`">
                      <i class="fas fa-user-check me-1"></i> {{ item.validator_nama }}
                    </div>
                  </div>

                  <!-- Rejection note -->
                  <div v-if="item.status === 'rejected' && item.catatan" class="rejection-note-badge mt-1" :title="item.catatan">
                    <i class="fas fa-comment-dots text-danger me-1"></i> Catatan: {{ truncateNote(item.catatan) }}
                  </div>
                </div>
              </td>
              <!-- Actions -->
              <td class="text-end">
                <div class="d-flex justify-content-end gap-2 align-items-center">
                  <!-- Actions for pending/rejected status -->
                  <template v-if="item.status !== 'verified'">
                    <button 
                      v-if="canEdit"
                      class="btn btn-xs btn-success btn-action" 
                      @click="submitValidation(item, 'verified')"
                      :disabled="item.isSubmitting"
                      title="Setujui data akumulasi"
                    >
                      <i v-if="item.isSubmitting" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-check"></i>
                      Setuju
                    </button>
                    <button 
                      v-if="canEdit"
                      class="btn btn-xs btn-danger btn-action" 
                      @click="openRejectModal(item)"
                      :disabled="item.isSubmitting"
                      title="Tolak data"
                    >
                      <i class="fas fa-times"></i>
                      Tolak
                    </button>
                  </template>

                  <!-- Action for verified status -->
                  <template v-else>
                    <div class="d-flex align-items-center gap-2 justify-content-end">
                      <button 
                        v-if="canEdit"
                        class="btn btn-xs btn-outline-danger btn-action-unlock" 
                        @click="submitValidation(item, 'pending')"
                        :disabled="item.isSubmitting"
                        title="Buka kunci validasi"
                      >
                        <i v-if="item.isSubmitting" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-lock-open"></i>
                        Unlock
                      </button>
                      <span v-else class="badge bg-light text-muted border py-1.5 px-3 rounded-3" style="font-size: 0.72rem; font-weight: 500;">
                        <i class="fas fa-lock me-1"></i> Dikunci
                      </span>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Dialog Modal -->
    <div class="modal fade show" v-if="showRejectModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-danger text-white py-3">
            <h6 class="modal-title fw-bold mb-0">
              <i class="fas fa-exclamation-circle me-2"></i> Konfirmasi Penolakan Data
            </h6>
            <button type="button" class="btn-close btn-close-white" @click="closeRejectModal" style="font-size: 0.8rem;"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-secondary small mb-3">
              Silakan masukkan alasan penolakan data akumulasi untuk indikator <b>{{ activeRejectItem?.nama_inmut }}</b>.
            </p>
            <div class="form-group">
              <label class="form-label small fw-bold text-dark mb-1">Catatan Penolakan</label>
              <textarea 
                class="form-control rounded-3" 
                rows="4" 
                v-model="rejectNote" 
                placeholder="Contoh: Ada ketidaksesuaian input numerator pada tanggal 12 dan 15 Juni..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-4" @click="closeRejectModal">Batal</button>
            <button 
              type="button" 
              class="btn btn-sm btn-danger rounded-pill px-4" 
              @click="submitRejection"
              :disabled="!rejectNote.trim() || activeRejectItem?.isSubmitting"
            >
              <i v-if="activeRejectItem?.isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
              Kirim Penolakan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import inmutService from '@/services/indikatorMutuService'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'

const emit = defineEmits(['export'])

const props = defineProps({
  depId: {
    type: String,
    required: true
  },
  monthlyDate: {
    type: String,
    required: true
  },
  userNik: {
    type: String,
    default: ''
  },
  isCommitteeMember: {
    type: Boolean,
    default: false
  },
  activeUnitInfo: {
    type: Object,
    default: () => null
  }
})

// State
const items = ref([])
const loading = ref(false)
const unitAudit = ref(null)
const actionLoading = ref(false)

// Modal Reject State
const showRejectModal = ref(false)
const activeRejectItem = ref(null)
const rejectNote = ref('')

// Export Dropdown State
const showTabExportDropdown = ref(false)
const toggleTabExportDropdown = () => {
  showTabExportDropdown.value = !showTabExportDropdown.value
}
const triggerTabExport = (format) => {
  showTabExportDropdown.value = false
  if (format === 'pdf') {
    exportPDF()
  } else if (format === 'excel') {
    exportExcel()
  }
  emit('export', { format, indicatorId: null })
}

const loadImage = (src) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
    })
}

const exportExcel = () => {
    showTabExportDropdown.value = false
    const verifiedItems = items.value.filter(i => i.status === 'verified')
    const listToExport = verifiedItems.length > 0 ? verifiedItems : items.value

    if (!listToExport || listToExport.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tidak ada data validasi untuk diunduh' })
        return
    }

    try {
        const dataForExcel = listToExport.map((item, index) => {
            const numPic = item.num_pic || 0
            const denumPic = item.denum_pic || 0
            const scorePic = denumPic > 0 ? ((numPic / denumPic) * 100).toFixed(2) + '%' : '0%'

            const numVal = item.num_validasi || 0
            const denumVal = item.denum_validasi || 0
            const scoreVal = denumVal > 0 ? ((numVal / denumVal) * 100).toFixed(2) + '%' : '0%'

            const ar = calculateAgreementRate(item)

            return {
                'No': index + 1,
                'Indikator Mutu': item.nama_inmut || '-',
                'Target': `${getTargetSymbol(item.rumus)} ${item.standar}%`,
                'Num PIC': numPic,
                'Denum PIC': denumPic,
                'Capaian PIC (%)': scorePic,
                'Num Validasi': numVal,
                'Denum Validasi': denumVal,
                'Validasi (%)': scoreVal,
                'Agreement Rate (%)': `${ar}%`,
                'Status': item.status === 'verified' ? 'Terverifikasi' : 'Pending'
            }
        })

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Validasi')

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 45 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
            { wch: 14 },
            { wch: 14 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 }
        ]

        const unitName = (props.activeUnitInfo?.nama_ruang || props.depId || 'Unit').replace(/[^a-zA-Z0-9]/g, '_')
        XLSX.writeFile(workbook, `Laporan_Validasi_Mutu_${props.monthlyDate}_${unitName}.xlsx`)
    } catch (err) {
        console.error('Error exporting Excel:', err)
        Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat mengunduh Excel.' })
    }
}

const exportPDF = async () => {
    showTabExportDropdown.value = false
    const verifiedItems = items.value.filter(i => i.status === 'verified')
    const listToExport = verifiedItems.length > 0 ? verifiedItems : items.value

    if (!listToExport || listToExport.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tidak ada data validasi untuk diunduh' })
        return
    }

    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

        const headerImg = await loadImage(pdfHeader)
        const footerImg = await loadImage(pdfFooter)

        const unitLabel = props.activeUnitInfo?.nama_ruang || props.depId || '-'
        const periodLabel = props.monthlyDate || '-'

        const getAsciiSymbol = (val) => {
            const map = { '1': '=', '2': '<=', '3': '<', '4': '>=', '5': '>' }
            return map[val] || val || '>='
        }

        const tableBody = listToExport.map((item, index) => {
            const numPic = item.num_pic || 0
            const denumPic = item.denum_pic || 0
            const scorePic = denumPic > 0 ? `${((numPic / denumPic) * 100).toFixed(2)}%` : '0%'

            const numVal = item.num_validasi || 0
            const denumVal = item.denum_validasi || 0
            const scoreVal = denumVal > 0 ? `${((numVal / denumVal) * 100).toFixed(2)}%` : '0%'

            const ar = calculateAgreementRate(item)

            return [
                index + 1,
                item.nama_inmut || '-',
                `${getAsciiSymbol(item.rumus)} ${item.standar}%`,
                `${numPic}/${denumPic} (${scorePic})`,
                `${numVal}/${denumVal} (${scoreVal})`,
                `${ar}%`,
                item.status === 'verified' ? 'TERVERIFIKASI' : 'PENDING'
            ]
        })

        autoTable(doc, {
            head: [['No', 'Indikator Mutu', 'Target', 'Capaian PIC (P1)', 'Hasil Validasi (P2)', 'Agreement Rate', 'Status']],
            body: tableBody,
            startY: 38,
            margin: { top: 36, bottom: 20, left: 14, right: 14 },
            styles: { fontSize: 7.5, cellPadding: 2.5 },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 8 },
                1: { cellWidth: 62 },
                2: { halign: 'center', cellWidth: 18 },
                3: { halign: 'center', cellWidth: 25 },
                4: { halign: 'center', cellWidth: 25 },
                5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
                6: { halign: 'center', cellWidth: 22, fontStyle: 'bold' }
            },
            didDrawPage: (data) => {
                if (headerImg) {
                    doc.addImage(headerImg, 'PNG', 0, 0, 210, 27.01)
                }

                doc.setFontSize(10)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(30, 41, 59)
                doc.text(`BERITA ACARA VALIDASI INDIKATOR MUTU UNIT`, 14, 31)

                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(100, 116, 139)
                doc.text(`Periode: ${periodLabel} | Unit: ${unitLabel}`, 14, 35)

                if (footerImg) {
                    doc.addImage(footerImg, 'PNG', 0, 285.82, 210, 11.18)
                }

                doc.setFontSize(8)
                doc.setTextColor(100, 116, 139)
                doc.text(`Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`, 196, 292, { align: 'right' })
            }
        })

        const unitName = (props.activeUnitInfo?.nama_ruang || props.depId || 'Unit').replace(/[^a-zA-Z0-9]/g, '_')
        doc.save(`Laporan_Validasi_Mutu_${props.monthlyDate}_${unitName}.pdf`)
    } catch (err) {
        console.error('Error exporting PDF:', err)
        Swal.fire({ icon: 'error', title: 'Gagal Export', text: 'Terjadi kesalahan saat mengunduh PDF.' })
    }
}

const closeDropdown = () => {
  showTabExportDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})

// Check if user has permission to edit/validate
const canEdit = computed(() => {
  if (props.isCommitteeMember) return true;
  if (unitAudit.value && unitAudit.value.is_validator) return true;
  if (props.activeUnitInfo && props.activeUnitInfo.nik_validator) {
    return props.activeUnitInfo.nik_validator === props.userNik;
  }
  return false;
})

const isPicUser = computed(() => {
  if (unitAudit.value && unitAudit.value.is_pic) return true;
  if (props.activeUnitInfo && props.activeUnitInfo.nik_pic) {
    return props.activeUnitInfo.nik_pic === props.userNik;
  }
  return false;
})

const isValidatorUser = computed(() => {
  if (props.isCommitteeMember) return true;
  if (unitAudit.value && unitAudit.value.is_validator) return true;
  if (props.activeUnitInfo && props.activeUnitInfo.nik_validator) {
    return props.activeUnitInfo.nik_validator === props.userNik;
  }
  return false;
})

// Parse Month and Year from prop monthlyDate (format YYYY-MM)
const parsedPeriod = computed(() => {
  if (!props.monthlyDate) return { bulan: null, tahun: null }
  const parts = props.monthlyDate.split('-')
  return {
    bulan: parseInt(parts[1], 10),
    tahun: parseInt(parts[0], 10)
  }
})

// Banner Helpers
const getBannerIcon = (status) => {
  switch (status) {
    case 'verified': return 'fa-check-circle';
    case 'requested': return 'fa-hourglass-half';
    case 'revision': return 'fa-exclamation-triangle';
    default: return 'fa-edit';
  }
}

const getBannerTitle = (audit) => {
  if (!audit) return '';
  switch (audit.submission_status) {
    case 'verified':
      return 'Tervalidasi Penuh (100%)';
    case 'requested':
      return 'Menunggu Respon Validator';
    case 'revision':
      return 'Perlu Revisi / Perbaikan Data';
    default:
      if (!audit.is_all_filled) return 'Entri Belum Lengkap';
      if (audit.is_premature) return 'Pengajuan Buka Mulai Tanggal 25';
      return 'Data Siap Divalidasi';
  }
}

const getBannerBadgeText = (status) => {
  switch (status) {
    case 'verified': return 'Disahkan';
    case 'requested': return 'Menunggu Validator';
    case 'revision': return 'Perlu Revisi';
    default: return 'Draft Entri';
  }
}

const getBannerDesc = (audit) => {
  if (!audit) return '';
  switch (audit.submission_status) {
    case 'verified':
      return `Seluruh indikator telah disahkan oleh validator unit (${audit.nama_validator || 'Validator'}).`;
    case 'requested': {
      let desc = `Diajukan pada ${audit.requested_at || '-'} oleh ${audit.requester_name || audit.nama_pic || 'PIC'}.`;
      if (audit.request_note) desc += ` Catatan: "${audit.request_note}"`;
      return desc;
    }
    case 'revision':
      return `Validator meminta perbaikan data: "${audit.revision_note || 'Mohon cek kembali kelengkapan data'}".`;
    default:
      if (isPicUser.value) {
        if (!audit.is_all_filled) {
          return `${audit.filled_indicators || 0} dari ${audit.total_indicators || 0} indikator terisi. Harap lengkapi seluruh indikator sebelum meminta validasi.`;
        }
        if (audit.is_premature) {
          return `Pengajuan validasi untuk bulan berjalan baru dapat dilakukan mulai tanggal 25 (hari ini tanggal ${new Date().getDate()}). Selesaikan entri data harian terlebih dahulu.`;
        }
        return `Seluruh data indikator bulan ini sudah lengkap. Kirimkan permintaan validasi ke ${audit.nama_validator || 'Validator Unit'}.`;
      }
      return `PIC (${audit.nama_pic || 'PIC'}) masih dalam proses pengumpulan data harian bulan ini.`;
  }
}

// Fetch Unit Audit Status
const fetchUnitAudit = async () => {
  if (!props.depId || !parsedPeriod.value.bulan) return;
  try {
    const res = await inmutService.getMyUnits({
      dep_id: props.depId,
      bulan: parsedPeriod.value.bulan,
      tahun: parsedPeriod.value.tahun
    });
    if (res.data?.success && res.data.data?.length) {
      unitAudit.value = res.data.data.find(u => u.dep_id === props.depId) || res.data.data[0] || null;
    }
  } catch (err) {
    console.error('Error fetching unit audit status:', err);
  }
}

// Workflow Actions
const openRequestValidationModal = async () => {
  if (!unitAudit.value) return;
  const audit = unitAudit.value;
  const { value: formValues } = await Swal.fire({
    title: 'Konfirmasi Pengajuan Validasi',
    html: `
      <div style="text-align: left; font-size: 0.88rem; line-height: 1.5; color: #334155;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Unit / Ruang:</span>
            <strong>${audit.nama_ruang || props.depId}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Periode:</span>
            <strong>${props.monthlyDate}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Kelengkapan:</span>
            <strong style="color: #16a34a;">${audit.filled_indicators}/${audit.total_indicators} Indikator (100% Lengkap)</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Validator Tujuan:</span>
            <strong>${audit.nama_validator || 'Validator Unit'}</strong>
          </div>
        </div>

        <label style="font-weight: 600; display: block; margin-bottom: 6px;">Catatan untuk Validator (Opsional):</label>
        <textarea id="swal-req-note" class="swal2-textarea" placeholder="Tuliskan catatan tambahan jika ada..." style="width: 100%; margin: 0 0 14px 0; font-size: 0.85rem; height: 70px; border-radius: 8px;"></textarea>

        <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; user-select: none;">
          <input type="checkbox" id="swal-req-agree" style="margin-top: 3px; accent-color: #2563eb;">
          <span style="font-size: 0.82rem; color: #1e293b;">
            Saya menyatakan seluruh data mutu harian bulan ini sudah lengkap dan siap divalidasi oleh validator.
          </span>
        </label>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Kirim Validasi &rarr;',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const agree = document.getElementById('swal-req-agree')?.checked;
      if (!agree) {
        Swal.showValidationMessage('Harap centang konfirmasi pernyataan kelengkapan data terlebih dahulu.');
        return false;
      }
      return {
        note: document.getElementById('swal-req-note')?.value || ''
      };
    }
  });

  if (formValues) {
    actionLoading.value = true;
    const { bulan, tahun } = parsedPeriod.value;
    try {
      const res = await inmutService.requestValidation({
        dep_id: props.depId,
        bulan,
        tahun,
        catatan: formValues.note
      });
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Notifikasi Terkirim',
          text: res.data.message || 'Permintaan validasi berhasil diajukan ke validator unit.',
          timer: 2000,
          showConfirmButton: false
        });
        await fetchUnitAudit();
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengajukan Validasi',
        text: err.response?.data?.message || 'Terjadi kesalahan sistem.'
      });
    } finally {
      actionLoading.value = false;
    }
  }
}

const handleCancelValidation = async () => {
  const result = await Swal.fire({
    title: 'Tarik Pengajuan?',
    text: 'Status akan dikembalikan ke Draft sehingga Anda dapat mengoreksi data sebelum diajukan kembali ke Validator.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d97706',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Tarik Pengajuan',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    actionLoading.value = true;
    const { bulan, tahun } = parsedPeriod.value;
    try {
      const res = await inmutService.cancelValidation({
        dep_id: props.depId,
        bulan,
        tahun
      });
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pengajuan Dibatalkan',
          text: res.data.message || 'Status dikembalikan ke Draft.',
          timer: 1500,
          showConfirmButton: false
        });
        await fetchUnitAudit();
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membatalkan',
        text: err.response?.data?.message || 'Terjadi kesalahan.'
      });
    } finally {
      actionLoading.value = false;
    }
  }
}

const openReturnRevisionModal = async () => {
  const { value: revNote } = await Swal.fire({
    title: 'Kembalikan ke PIC untuk Revisi',
    html: `
      <div style="text-align: left; font-size: 0.88rem; color: #334155;">
        <p style="margin-bottom: 10px;">
          Kembalikan data mutu unit <strong>${unitAudit.value?.nama_ruang || props.depId}</strong> ke PIC (${unitAudit.value?.nama_pic || 'PIC'}) untuk perbaikan.
        </p>
        <label style="font-weight: 600; display: block; margin-bottom: 4px;">Alasan / Catatan Perbaikan (Wajib minimal 5 karakter):</label>
        <textarea id="swal-rev-note" class="swal2-textarea" placeholder="Contoh: Mohon periksa tanggal 14, denominator masih 0..." style="width: 100%; margin: 0; font-size: 0.85rem; height: 80px; border-radius: 8px;"></textarea>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Kembalikan Data',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const note = document.getElementById('swal-rev-note')?.value?.trim() || '';
      if (note.length < 5) {
        Swal.showValidationMessage('Harap masukkan alasan perbaikan minimal 5 karakter.');
        return false;
      }
      return note;
    }
  });

  if (revNote) {
    actionLoading.value = true;
    const { bulan, tahun } = parsedPeriod.value;
    try {
      const res = await inmutService.returnRevision({
        dep_id: props.depId,
        bulan,
        tahun,
        catatan: revNote
      });
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Data Dikembalikan',
          text: res.data.message || 'Catatan perbaikan telah dikirim ke PIC.',
          timer: 2000,
          showConfirmButton: false
        });
        await fetchUnitAudit();
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengembalikan',
        text: err.response?.data?.message || 'Terjadi kesalahan.'
      });
    } finally {
      actionLoading.value = false;
    }
  }
}

// Fetch data validation list
const fetchData = async () => {
  if (!props.depId || !props.monthlyDate) return
  loading.value = true
  
  const { bulan, tahun } = parsedPeriod.value
  try {
    const res = await inmutService.getValidasiBulanan({
      dep_id: props.depId,
      bulan,
      tahun
    })
    
    if (res.data && res.data.success) {
      items.value = res.data.data.map(item => ({
        ...item,
        isSubmitting: false
      }))
    }
  } catch (error) {
    console.error('Gagal mengambil data validasi:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Data',
      text: error.response?.data?.message || 'Terjadi kesalahan saat memuat data validasi bulanan.'
    })
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => [props.depId, props.monthlyDate], () => {
  fetchData()
  fetchUnitAudit()
})

onMounted(() => {
  fetchData()
  fetchUnitAudit()
})

// Calculations & Helpers
const calculatePercentage = (num, denum) => {
  if (!denum || denum === 0) return 0
  return Math.round((num / denum) * 100 * 100) / 100
}

const calculateP1 = (item) => {
  if (!item) return 0
  const num = item.sum_num !== undefined ? item.sum_num : (item.num_awal || 0)
  const denum = item.sum_denum !== undefined ? item.sum_denum : (item.denum_awal || 0)
  if (!needsDenominator(item)) return num
  if (!denum || denum === 0) return 0
  return Math.round((num / denum) * 100 * 100) / 100
}

const calculateP2 = (item) => {
  if (!item) return 0
  const numAwal = item.sum_num !== undefined ? item.sum_num : (item.num_awal || 0)
  const denumAwal = item.sum_denum !== undefined ? item.sum_denum : (item.denum_awal || 0)
  const num = item.num_validasi !== undefined && item.num_validasi !== null ? item.num_validasi : numAwal
  const denum = item.denum_validasi !== undefined && item.denum_validasi !== null ? item.denum_validasi : denumAwal
  if (!needsDenominator(item)) return num
  if (!denum || denum === 0) return 0
  return Math.round((num / denum) * 100 * 100) / 100
}

const calculateAgreementRate = (item) => {
  if (!item) return null
  const denum1 = item.sum_denum !== undefined ? item.sum_denum : (item.denum_awal || 0)
  const denum2 = item.denum_validasi !== undefined ? item.denum_validasi : denum1

  // If no sample at all (0/0)
  if (denum1 === 0 && denum2 === 0) return null

  const p1 = calculateP1(item)
  const p2 = calculateP2(item)

  // If both P1 and P2 are 0% with actual sample (e.g. 0/100 and 0/10)
  if (p1 === 0 && p2 === 0) return 100

  const minP = Math.min(p1, p2)
  const maxP = Math.max(p1, p2)

  if (maxP === 0) return 100

  const ar = (minP / maxP) * 100
  return Math.round(ar * 100) / 100
}

const needsDenominator = (item) => {
  if (!item) return true
  if (item.ket_denum && item.ket_denum.trim() !== '') return true
  return item.satuan === '%' || item.satuan === 'Persen' || !!item.rumus
}

const getTargetSymbol = (val) => {
  const map = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }
  return map[val] || val || '≥'
}

const getCategoryBadge = (item) => {
  if (!item) return { code: '-', label: '-', badgeClass: 'badge-cat-default' }
  const kat = item.kategori_utama || item.nama_jenis || item.kategori || ''
  const katLower = kat.toLowerCase()
  if (katLower.includes('nasional') || katLower.includes('inm')) {
    return { code: 'INM', label: 'Indikator Mutu Nasional (INM)', badgeClass: 'badge-cat-inm' }
  } else if (katLower.includes('rumah sakit') || katLower.includes('imprs') || katLower.includes('rs')) {
    return { code: 'IMPRS', label: 'Indikator Mutu Prioritas Rumah Sakit (IMPRS)', badgeClass: 'badge-cat-imprs' }
  } else if (katLower.includes('unit') || katLower.includes('impu')) {
    return { code: 'IMPU', label: 'Indikator Mutu Prioritas Unit (IMPU)', badgeClass: 'badge-cat-impu' }
  }
  return { code: kat ? (kat.length > 6 ? kat.substring(0, 6) + '..' : kat) : '-', label: kat || '-', badgeClass: 'badge-cat-default' }
}

const formatStatus = (status) => {
  if (status === 'verified') return 'Disetujui'
  if (status === 'rejected') return 'Ditolak'
  return 'Pending'
}

const truncateNote = (note) => {
  if (!note) return ''
  return note.length > 30 ? note.slice(0, 30) + '...' : note
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Action Submit Validation
const submitValidation = async (item, status, note = '') => {
  if (status === 'verified') {
    const ar = calculateAgreementRate(item)
    if (ar < 90) {
      const confirmResult = await Swal.fire({
        title: 'Agreement Rate < 90%',
        text: `Tingkat kesepakatan (Agreement Rate) untuk indikator ini adalah ${ar}%, di bawah batas minimum 90%. Apakah Anda yakin tetap ingin menyetujui data ini?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Setujui',
        cancelButtonText: 'Batal'
      })
      if (!confirmResult.isConfirmed) {
        return
      }
    }
  }

  item.isSubmitting = true
  const { bulan, tahun } = parsedPeriod.value
  
  try {
    const res = await inmutService.storeValidasiBulanan({
      id_inmut: item.id_inmut,
      dep_id: props.depId,
      bulan,
      tahun,
      num_validasi: item.num_validasi,
      denum_validasi: item.denum_validasi,
      status,
      catatan: note
    })

    if (res.data && res.data.success) {
      Swal.fire({
        icon: 'success',
        title: status === 'verified' ? 'Data Disetujui' : (status === 'pending' ? 'Kunci Dibuka' : 'Data Ditolak'),
        text: res.data.message || 'Proses validasi berhasil disimpan.',
        timer: 1500,
        showConfirmButton: false
      })
      await fetchData()
    }
  } catch (error) {
    console.error('Gagal menyimpan validasi:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Validasi',
      text: error.response?.data?.message || 'Terjadi kesalahan saat memproses validasi.'
    })
  } finally {
    item.isSubmitting = false
  }
}

// Reject Modal Handlers
const openRejectModal = (item) => {
  activeRejectItem.value = item
  rejectNote.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  activeRejectItem.value = null
  rejectNote.value = ''
}

const submitRejection = async () => {
  if (!activeRejectItem.value || !rejectNote.value.trim()) return
  
  const item = activeRejectItem.value
  showRejectModal.value = false // Close modal immediately to avoid click duplication
  
  await submitValidation(item, 'rejected', rejectNote.value)
  
  closeRejectModal()
}
</script>

<style scoped>
/* Curated premium aesthetics */
.validasi-data-tab {
  padding: 10px 5px;
}

/* Stat Cards */
.stat-premium-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-premium-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}
.stat-premium-card .icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.stat-premium-card.total .icon-wrap {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}
.stat-premium-card.success .icon-wrap {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.stat-premium-card.warning .icon-wrap {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.stat-premium-card .details {
  display: flex;
  flex-direction: column;
}
.stat-premium-card .details .num {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}
.stat-premium-card .details .label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* Table Premium Styling */
.premium-validation-table {
  border-collapse: separate;
  border-spacing: 0;
}
.premium-validation-table thead th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 20px;
  border-bottom: 2px solid #e2e8f0;
}
.premium-validation-table tbody tr {
  transition: background-color 0.2s ease;
}
.premium-validation-table tbody tr:hover {
  background-color: #f8fafc;
}
.premium-validation-table tbody tr.row-verified {
  background-color: rgba(240, 253, 250, 0.4);
}
.premium-validation-table tbody tr.row-verified:hover {
  background-color: rgba(240, 253, 250, 0.75);
}
.premium-validation-table tbody td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

/* Indicator Styling */
.indicator-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  display: block;
}
.indicator-meta-row .badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}
.badge-target {
  background-color: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.15);
}
.badge-unit {
  background-color: rgba(100, 116, 139, 0.08);
  color: #475569;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

/* Fraction Score Styling */
.original-scores, .validated-scores {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.original-scores .fraction, .validated-scores .fraction {
  font-size: 1.15rem;
  color: #1e293b;
  font-weight: 600;
}
.original-scores .fraction .divider, .validated-scores .fraction .divider {
  color: #cbd5e1;
  margin: 0 3px;
  font-weight: 300;
}
.original-scores .percentage, .validated-scores .percentage {
  font-size: 0.72rem;
  font-weight: 600;
}

/* Input Validator Styling */
.input-validate-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 65px;
}
.input-validate-wrapper .input-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.input-validate-wrapper input {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02) inset;
}
.input-validate-wrapper input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 2px 4px rgba(0, 0, 0, 0.02) inset;
  outline: none;
}

/* Status Badges */
.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.08);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.status-badge.verified {
  background-color: rgba(16, 185, 129, 0.08);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.status-badge.rejected {
  background-color: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.validator-meta {
  font-size: 0.68rem;
  line-height: 1.3;
}
.validator-meta .max-w-150 {
  max-width: 150px;
  font-weight: 600;
}
.validator-meta .extra-small {
  font-size: 0.62rem;
  font-weight: 500;
}

.rejection-note-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.04);
  padding: 3px 8px;
  border-radius: 6px;
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border: 1px dashed rgba(239, 68, 68, 0.2);
}

/* Button Actions */
.btn-action {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
}
.btn-success.btn-action {
  background-color: #10b981;
}
.btn-success.btn-action:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.btn-danger.btn-action {
  background-color: #ef4444;
}
.btn-danger.btn-action:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-action-unlock {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}
.btn-action-unlock:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Forms */
.form-label {
  color: #334155;
}
.form-control:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.badge-ar-valid {
  background-color: rgba(16, 185, 129, 0.08);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.15);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.badge-ar-invalid {
  background-color: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.15);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Category Badge Styles */
.badge-cat-inm {
  background-color: #eff6ff !important;
  color: #1d4ed8 !important;
  border: 1px solid #bfdbfe !important;
  font-weight: 700 !important;
}

.badge-cat-imprs {
  background-color: #f5f3ff !important;
  color: #6d28d9 !important;
  border: 1px solid #ddd6fe !important;
  font-weight: 700 !important;
}

.badge-cat-impu {
  background-color: #ecfdf5 !important;
  color: #047857 !important;
  border: 1px solid #a7f3d0 !important;
  font-weight: 700 !important;
}

.badge-cat-default {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #e2e8f0 !important;
  font-weight: 700 !important;
}

/* Unit Status Banner */
.unit-status-banner {
  border-radius: 14px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.unit-status-banner.status-verified {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-color: #a7f3d0;
}
.unit-status-banner.status-requested {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}
.unit-status-banner.status-revision {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
}
.unit-status-banner.status-draft {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #e2e8f0;
}

.banner-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.icon-verified {
  background-color: #d1fae5;
  color: #059669;
}
.icon-requested {
  background-color: #fef3c7;
  color: #d97706;
}
.icon-revision {
  background-color: #fee2e2;
  color: #dc2626;
}
.icon-draft {
  background-color: #e2e8f0;
  color: #475569;
}

.banner-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}
.banner-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
}
.badge-verified {
  background-color: #059669;
  color: #fff;
}
.badge-requested {
  background-color: #d97706;
  color: #fff;
}
.badge-revision {
  background-color: #dc2626;
  color: #fff;
}
.badge-draft {
  background-color: #64748b;
  color: #fff;
}
</style>
