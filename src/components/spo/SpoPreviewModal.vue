<template>
  <div 
    class="modal fade" 
    :class="{ show: modelValue }" 
    :style="{ display: modelValue ? 'block' : 'none' }"
    tabindex="-1"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-file-alt me-2"></i>
            Preview SPO
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        
        <div class="modal-body p-4">
          <div id="spo-document" class="spo-document">
            <table class="w-100 detail-spo">
              <thead>
                <!-- Header Row 1: Logo + Title -->
                <tr class="align-middle text-center">
                  <td rowspan="2" class="border p-3 text-center" style="width: 200px;">
                    <h6 class="fw-bold text-uppercase mb-3" style="font-size: 0.9rem; line-height: 1.3;">
                      RSU AISYIYAH<br>PEKAJANGAN
                    </h6>
                    <div class="logo-container mx-auto mb-3">
                      <img src="@/assets/logo.png" alt="Logo RSIA Aisyiyah Pekajangan" class="logo-img" />
                    </div>
                  </td>
                  <td colspan="2" class="border p-3">
                    <h5 class="fw-bold mb-0">{{ spoData?.judul }}</h5>
                  </td>
                </tr>
                
                <!-- Header Row 2: No. Dokumen + Halaman -->
                <tr class="align-middle">
                  <td class="border p-3" style="text-align: center;">
                    <p class="fw-bold mb-1 small">No. Dokumen</p>
                    <p class="mb-0">{{ spoData?.nomor || '-' }}</p>
                  </td>
                  <td class="border p-3" style="text-align: center;">
                    <p class="fw-bold mb-1 small">Halaman</p>
                    <p class="mb-0">1/1</p>
                  </td>
                </tr>
              </thead>
              
              <tbody>
                <!-- Row 3: SPO Title + Tanggal + Ditetapkan -->
                <tr class="align-middle">
                  <td class="border p-3 text-center">
                    <h6 class="fw-bold text-uppercase mb-0" style="font-size: 0.9rem; line-height: 1.3;">
                      STANDAR<br>PROSEDUR<br>OPERASIONAL
                    </h6>
                  </td>
                  <td class="border p-3" style="text-align: center;">
                    <p class="fw-bold mb-1 small">Tanggal Ditetapkan</p>
                    <p class="mb-0">{{ formatDate(spoData?.tgl_terbit) }}</p>
                  </td>
                  <td class="border p-3" style="text-align: center;">
                    <p class="fw-bold mb-1 small">Ditetapkan</p>
                    <p class="fw-bold mb-0 small">Direktur RSIA Aisyiyah Pekajangan</p>
                    <div class="mt-5 pt-4">
                      <p class="fw-bold mb-0 small">{{ spoData?.direktur?.nama || '............................................................' }}</p>
                    </div>
                  </td>
                </tr>

                <!-- Pengertian -->
                <tr class="align-middle">
                  <td class="border p-3 text-center fw-bold">Pengertian</td>
                  <td colspan="2" class="border p-3" v-html="unescapeHtml(spoData?.pengertian)"></td>
                </tr>

                <!-- Tujuan -->
                <tr class="align-middle">
                  <td class="border p-3 text-center fw-bold">Tujuan</td>
                  <td colspan="2" class="border p-3" v-html="unescapeHtml(spoData?.tujuan)"></td>
                </tr>

                <!-- Kebijakan -->
                <tr class="align-middle">
                  <td class="border p-3 text-center fw-bold">Kebijakan</td>
                  <td colspan="2" class="border p-3" v-html="unescapeHtml(spoData?.kebijakan)"></td>
                </tr>

                <!-- Prosedur -->
                <tr class="align-middle">
                  <td class="border p-3 text-center fw-bold">Prosedur</td>
                  <td colspan="2" class="border p-3" v-html="unescapeHtml(spoData?.prosedur)"></td>
                </tr>

                <!-- Unit Terkait -->
                <tr class="align-middle">
                  <td class="border p-3 text-center fw-bold">Unit Terkait</td>
                  <td colspan="2" class="border p-3">
                    <ol v-if="spoData?.units && spoData.units.length > 0" class="mb-0 ps-4">
                      <li v-for="(unit, idx) in spoData.units" :key="idx" class="mb-1">
                        {{ unit.unit?.nama || unit.unit_id }}
                      </li>
                    </ol>
                    <p v-else class="mb-0">{{ spoData?.unit?.nama || '-' }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-2"></i>Tutup
          </button>
          <button type="button" class="btn btn-primary" @click="printDocument">
            <i class="fas fa-print me-2"></i>Print
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop -->
  <div 
    v-if="modelValue" 
    class="modal-backdrop fade show"
    @click="closeModal"
  ></div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  spoData: Object
})

const emit = defineEmits(['update:modelValue'])

const getStatusBadge = (status) => {
  return status === 'disetujui' ? 'bg-success' : 'bg-warning'
}

const getJenisBadge = (jenis) => {
  const badges = {
    medis: 'bg-primary',
    penunjang: 'bg-info',
    umum: 'bg-secondary'
  }
  return badges[jenis] || 'bg-secondary'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const unescapeHtml = (html) => {
  if (!html) return '-'
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const printDocument = () => {
  const printContent = document.getElementById('spo-document').innerHTML
  const printWindow = window.open('', '_blank')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SPO - ${props.spoData?.judul || 'Document'}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            padding: 20px;
            font-size: 12pt;
          }
          .section-title {
            color: #0d6efd;
            margin-top: 20px;
          }
          .section-content {
            text-align: justify;
            line-height: 1.8;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal {
  z-index: 1050;
}

.spo-document {
  background: white;
  font-family: 'Times New Roman', serif;
  font-size: 11pt;
}

.detail-spo {
  border-collapse: collapse;
  width: 100%;
}

.detail-spo td {
  border: 1px solid #dee2e6;
  padding: 12px;
  vertical-align: top;
}

.detail-spo thead td {
  background-color: #f8f9fa;
}

.logo-container {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 96px;
  height: 96px;
  object-fit: contain;
}

/* Content styling */
.detail-spo >>> p {
  margin-bottom: 0.5rem;
}

.detail-spo >>> ol,
.detail-spo >>> ul {
  margin-left: 20px;
  margin-bottom: 0.5rem;
}

.detail-spo >>> li {
  margin-bottom: 0.25rem;
}

/* Print Styles */
@media print {
  .modal-header,
  .modal-footer {
    display: none !important;
  }
  
  .modal-body {
    padding: 0 !important;
  }
  
  .spo-document {
    font-size: 10pt;
  }
  
  .detail-spo td {
    page-break-inside: avoid;
  }
}
</style>
