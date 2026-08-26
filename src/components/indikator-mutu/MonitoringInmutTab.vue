<template>
  <div>
    <div class="row mb-4 g-2">
      <div class="col-md-4 text-start">
        <v-select 
            :options="masterUtamaList" 
            label="nama_inmut" 
            v-model="filters.keyword"
            :reduce="item => item.nama_inmut"
            placeholder="Pilih Indikator Mutu"
            class="style-chooser"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                Tidak ada indikator ditemukan
            </template>
        </v-select>
      </div>
      <div class="col-md-8 d-flex justify-content-end align-items-center gap-2 filter-container">
        <div class="input-group date-filter" style="max-width: 250px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="month" class="form-control border-start-0 ps-0" v-model="filters.bulan" @change="fetchData">
        </div>
        
        <v-select 
            :options="displayedUnitOptions" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang"
            class="style-chooser unit-select"
            style="min-width: 200px;"
            :disabled="effectiveIsUnitLocked"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>

        <button class="btn btn-primary refresh-btn" @click="fetchData" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>

        <!-- Direct Export PDF Button -->
        <button 
          class="btn btn-outline-danger fw-bold d-flex align-items-center gap-1 shadow-sm" 
          @click="exportPDF" 
          :disabled="loadingPdf || loadingExcel"
          title="Unduh Laporan PDF"
          style="font-size: 0.8rem; padding: 6px 14px; border-radius: 8px;"
        >
          <i v-if="loadingPdf" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-file-pdf"></i>
          <span>PDF</span>
        </button>

        <!-- Direct Export Excel Button -->
        <button 
          class="btn btn-outline-success fw-bold d-flex align-items-center gap-1 shadow-sm" 
          @click="exportExcel" 
          :disabled="loadingPdf || loadingExcel"
          title="Unduh Laporan Excel"
          style="font-size: 0.8rem; padding: 6px 14px; border-radius: 8px;"
        >
          <i v-if="loadingExcel" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-file-excel"></i>
          <span>Excel</span>
        </button>
      </div>
    </div>

    <MonitoringTable 
        :items="items" 
        :loading="loading"
        :total="total"
        :page="page"
        :limit="limit"
        :totalPages="totalPages"
        @change-page="changePage"
        @detail="showDetail"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'
import MonitoringTable from '@/components/indikator-mutu/MonitoringTable.vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'

const props = defineProps({
  isKomiteMutu: { type: Boolean, default: false },
  isUnitLocked: { type: Boolean, default: false },
  userDepId: { type: String, default: null },
  units: { type: Array, default: () => [] }
})

const authStore = useAuthStore()
const toast = useToast()
const items = ref([])
const units = ref([])
const masterUtamaList = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const userCommittees = ref([])
const showExportDropdown = ref(false)

const toggleExportDropdown = () => {
    showExportDropdown.value = !showExportDropdown.value
}

const closeExportDropdown = () => {
    showExportDropdown.value = false
}

const userDepId = computed(() => {
    return authStore.user?.data?.detail?.dep_id || 
           authStore.user?.detail?.dep_id || 
           authStore.user?.dep_id || 
           ''
})

const checkCommittee = async () => {
    const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
    if (userNik) {
        try {
            const commRes = await committeeService.getByNik(userNik)
            userCommittees.value = commRes.data.data || []
        } catch (error) {
            console.error('Error checking committee:', error)
        }
    }
}

const isKomiteMutu = computed(() => {
    if (props.isKomiteMutu) return true;
    const role = (authStore.userRole || '').toLowerCase();
    const userDep = String(userDepId.value).toLowerCase();

    const isPmkpDep = userDep.includes('pmkp') || 
                      userDep.includes('komite mutu') || 
                      userDep.includes('komite pmkp') ||
                      userDep === 'pmkp' ||
                      userDep === 'kkm';

    const isPmkpRole = role === 'pmkp' || 
                       role === 'komite_pmkp' || 
                       role === 'komite_mutu' || 
                       role.includes('komite_pmkp');

    const isPmkpCommittee = userCommittees.value && userCommittees.value.some(c => {
        const name = (c.komite?.nama || c.nama || '').toUpperCase();
        return name.includes('PMKP') || name.includes('KOMITE MUTU');
    });

    return isPmkpDep || isPmkpRole || isPmkpCommittee;
})

const effectiveIsUnitLocked = computed(() => {
    if (props.isKomiteMutu) return false;
    if (props.isUnitLocked) return true;
    return !isKomiteMutu.value && !!effectiveUserDepId.value;
})

const effectiveUserDepId = computed(() => {
    return props.userDepId || userDepId.value;
})

const displayedUnitOptions = computed(() => {
    if (props.units && props.units.length > 0) {
        return props.units;
    }
    if (effectiveIsUnitLocked.value && effectiveUserDepId.value) {
        return units.value.filter(u => u.dep_id === effectiveUserDepId.value);
    }
    return units.value;
})

const selectedUnitName = computed(() => {
    if (!filters.unit) return 'Semua Unit'
    const found = units.value.find(u => u.dep_id === filters.unit)
    return found ? found.nama_ruang : filters.unit
})

const formatBulanLabel = (bulanStr) => {
    if (!bulanStr) return ''
    const parts = bulanStr.split('-')
    if (parts.length < 2) return bulanStr
    const mIdx = parseInt(parts[1], 10) - 1
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${monthNames[mIdx] || parts[1]} ${parts[0]}`
}

watch(() => [props.userDepId, props.isUnitLocked], ([newDep, newLocked]) => {
    if (newLocked && newDep) {
        filters.unit = newDep
        fetchData()
    }
}, { immediate: true })

const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    unit: null,
    keyword: ''
})

const fetchMasterUtama = async () => {
    try {
        const response = await api.getUtama({ limit: 1000, status: '1' })
        masterUtamaList.value = response.data.data.data || []
    } catch (error) {
        console.error('Error fetching master utama:', error)
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            bulan: filters.bulan,
            dep_id: filters.unit,
            keyword: filters.keyword
        }
        const response = await api.getMonitoring(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data monitoring')
    } finally {
        loading.value = false
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const showDetail = (item) => {
    toast.info('Fitur Analisa / Detail akan segera hadir')
}

const loadingPdf = ref(false)
const loadingExcel = ref(false)

// Helper: load image for PDF
const loadImage = (src) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
    })
}

// Helper: format standar
const getRumusSymbol = (val) => {
    const map = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }
    return (val in map) ? map[val] : (val || '')
}

const getStandarText = (item) => {
    if (!item) return '-'
    const rumus = item.rumus || item.rumus_utama
    const std = item.standar || item.standar_utama
    let satuan = item.satuan || item.satuan_utama
    if (satuan === 'Persentase') satuan = '%'
    return `${getRumusSymbol(rumus)} ${std}${satuan ? ' ' + satuan : ''}`.trim()
}

// Export Excel
const exportExcel = async () => {
    loadingExcel.value = true
    try {
        toast.info('Menyiapkan file Excel...')
        // Fetch all data for export if available
        const params = {
            page: 1,
            limit: 1000,
            bulan: filters.bulan,
            dep_id: filters.unit,
            keyword: filters.keyword
        }
        const response = await api.getMonitoring(params)
        const exportItems = response.data?.data?.data || items.value

        if (!exportItems || exportItems.length === 0) {
            toast.warning('Tidak ada data monitoring untuk diunduh')
            return
        }

        const dataForExcel = exportItems.map((item, index) => ({
            'No': index + 1,
            'Nama Indikator': item.nama_inmut || '-',
            'Unit / Ruangan': item.nama_ruang || '-',
            'Standar': getStandarText(item),
            'Numerator (Num)': item.total_num || 0,
            'Denominator (Denum)': item.total_denum || 0,
            'Capaian (%)': parseFloat(item.score || 0).toFixed(2) + '%'
        }))

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Monitoring Inmut')

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 45 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 }
        ]

        const unitName = selectedUnitName.value ? selectedUnitName.value.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Unit'
        const fileName = `Monitoring_Indikator_Mutu_${filters.bulan}_${unitName}.xlsx`
        XLSX.writeFile(workbook, fileName)
        toast.success('Laporan Excel berhasil diunduh')
    } catch (error) {
        console.error('Error exporting excel:', error)
        toast.error('Gagal mengunduh laporan Excel')
    } finally {
        loadingExcel.value = false
    }
}

// Export PDF
const exportPDF = async () => {
    loadingPdf.value = true
    try {
        toast.info('Menyiapkan file PDF...')
        // Fetch all data for export if available
        const params = {
            page: 1,
            limit: 1000,
            bulan: filters.bulan,
            dep_id: filters.unit,
            keyword: filters.keyword
        }
        const response = await api.getMonitoring(params)
        const exportItems = response.data?.data?.data || items.value

        if (!exportItems || exportItems.length === 0) {
            toast.warning('Tidak ada data monitoring untuk diunduh')
            return
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

        const headerImg = await loadImage(pdfHeader)
        const footerImg = await loadImage(pdfFooter)

        const unitLabel = selectedUnitName.value || 'Semua Unit'
        const monthYearLabel = formatBulanLabel(filters.bulan)

        const tableBody = exportItems.map((item, index) => [
            index + 1,
            item.nama_inmut || '-',
            item.nama_ruang || '-',
            getStandarText(item),
            item.total_num || 0,
            item.total_denum || 0,
            `${parseFloat(item.score || 0).toFixed(2)}%`
        ])

        autoTable(doc, {
            head: [['No', 'Indikator Mutu', 'Unit / Ruangan', 'Standar', 'Num', 'Denum', 'Capaian']],
            body: tableBody,
            startY: 38,
            margin: { top: 36, bottom: 20, left: 14, right: 14 },
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 65 },
                2: { cellWidth: 35 },
                3: { halign: 'center', cellWidth: 22 },
                4: { halign: 'center', cellWidth: 15 },
                5: { halign: 'center', cellWidth: 15 },
                6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
            },
            didDrawPage: (data) => {
                if (headerImg) {
                    doc.addImage(headerImg, 'PNG', 0, 0, 210, 27.01)
                }

                doc.setFontSize(10)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(30, 41, 59)
                doc.text(`LAPORAN MONITORING INDIKATOR MUTU`, 14, 31)

                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(100, 116, 139)
                doc.text(`Periode: ${monthYearLabel} | Unit: ${unitLabel}`, 14, 35)

                if (footerImg) {
                    doc.addImage(footerImg, 'PNG', 0, 285.82, 210, 11.18)
                }

                doc.setFontSize(8)
                doc.setTextColor(100, 116, 139)
                doc.text(`Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`, 196, 292, { align: 'right' })
            }
        })

        const unitName = selectedUnitName.value ? selectedUnitName.value.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Unit'
        doc.save(`Monitoring_Indikator_Mutu_${filters.bulan}_${unitName}.pdf`)
        toast.success('Laporan PDF berhasil diunduh')
    } catch (error) {
        console.error('Error exporting PDF:', error)
        toast.error('Gagal mengunduh laporan PDF')
    } finally {
        loadingPdf.value = false
    }
}

onMounted(async () => {
    await checkCommittee()
    await fetchUnits()
    await fetchMasterUtama()
    
    if (effectiveIsUnitLocked.value && effectiveUserDepId.value) {
        filters.unit = effectiveUserDepId.value
    }
    
    fetchData()
})

onBeforeUnmount(() => {
    window.removeEventListener('click', closeExportDropdown)
})
</script>

<style>
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  padding: 2px 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    margin-top: 1rem !important;
  }

  .date-filter {
    max-width: 100% !important;
    width: 100% !important;
  }

  .unit-select {
    min-width: 100% !important;
    width: 100% !important;
  }

  .refresh-btn {
    width: 100% !important;
  }
}
</style>
