<template>
  <div>
    <!-- Filters & Stats -->
    <div class="filter-card shadow-sm mb-4">
        <div class="row g-3 align-items-center">
            <div class="col-md-3">
                <label class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Periode Bulan</label>
                <input type="month" class="form-control" v-model="filters.bulan" @change="fetchData">
            </div>
            <div class="col-md-4">
                <label class="filter-label"><i class="fas fa-hospital me-1"></i> Unit / Ruang</label>
                <v-select 
                    :options="units" 
                    label="nama_ruang" 
                    v-model="filters.unit"
                    :reduce="unit => unit.dep_id"
                    placeholder="Semua Unit"
                    class="style-chooser"
                    @update:modelValue="fetchData"
                />
            </div>
            <div class="col-md-3">
                <label class="filter-label"><i class="fas fa-search me-1"></i> Cari Indikator</label>
                <input type="text" class="form-control" v-model="filters.keyword" placeholder="Ketik nama indikator..." @input="debounceFetch">
            </div>
            <div class="col-md-2">
                <label class="filter-label invisible">ACTION</label>
                <div class="d-flex gap-2">
                    <div class="dropdown w-100" v-click-outside="() => showExportMenu = false">
                        <button 
                            class="btn btn-outline-primary dropdown-toggle w-100 d-flex align-items-center justify-content-center" 
                            type="button" 
                            @click="showExportMenu = !showExportMenu"
                        >
                            <i class="fas fa-download me-2"></i> Export
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 show" v-if="showExportMenu" style="display: block; top: 100%; margin-top: 5px;">
                            <li>
                                <a class="dropdown-item py-2" href="#" @click.prevent="exportToExcel(); showExportMenu = false">
                                    <i class="fas fa-file-excel text-success me-2"></i> Export Excel (.xlsx)
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#" @click.prevent="exportToPDF(); showExportMenu = false">
                                    <i class="fas fa-file-pdf text-danger me-2"></i> Export PDF (.pdf)
                                </a>
                            </li>
                        </ul>
                    </div>
                    <button class="btn btn-primary d-flex align-items-center justify-content-center" style="width: 45px; height: 38px;" @click="fetchData" title="Refresh">
                        <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Summary -->
    <div class="row mb-4">
        <div class="col-md-12">
            <div class="stat-box bg-white shadow-sm border-start border-primary border-4 p-3 rounded-3 d-flex align-items-center justify-content-between">
                <div>
                    <div class="text-muted small fw-bold text-uppercase">Total Indikator Ter-Supervisi</div>
                    <div class="h3 mb-0 fw-800 text-primary">{{ total }}</div>
                </div>
                <div class="stat-icon bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                    <i class="fas fa-clipboard-check fa-lg"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-primary text-white">
                        <tr>
                            <th width="5%" class="text-center py-3">#</th>
                            <th width="20%">Indikator & Unit</th>
                            <th width="12%" class="text-center">Tgl Feedback</th>
                            <th width="30%">Supervisi Komite</th>
                            <th width="30%">Rekomendasi / Saran</th>
                            <th width="3%" class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <p class="mt-2 text-muted">Memuat rekap feedback...</p>
                            </td>
                        </tr>
                        <tr v-else-if="items.length === 0">
                            <td colspan="6" class="text-center py-5 text-muted">
                                <i class="fas fa-comments-slash fa-3x mb-3 opacity-25"></i>
                                <p>Tidak ada data supervisi pada periode ini.</p>
                            </td>
                        </tr>
                        <tr v-for="(item, index) in items" :key="item.id_analisa" :class="{'bg-light-subtle': !item.feedback}">
                            <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                            <td>
                                <div class="fw-bold text-dark mb-1">{{ item.nama_inmut }}</div>
                                <div class="badge bg-info-subtle text-info border-info-subtle small fw-bold">
                                    <i class="fas fa-hospital-user me-1"></i> {{ item.nama_ruang }}
                                </div>
                            </td>
                            <td class="text-center">
                                <div v-if="item.feedback && item.feedback.tgl_feedback" class="small fw-bold text-secondary">
                                    {{ formatDate(item.feedback.tgl_feedback) }}
                                </div>
                                <div v-else class="text-muted small italic">-</div>
                            </td>
                            <td>
                                <div v-if="item.feedback && item.feedback.supervisi" class="feedback-content" v-html="item.feedback.supervisi"></div>
                                <div v-else class="text-muted small italic">Belum ada supervisi</div>
                            </td>
                            <td>
                                <div v-if="item.feedback && item.feedback.rekomendasi" class="feedback-content" v-html="item.feedback.rekomendasi"></div>
                                <div v-else class="text-muted small italic">Belum ada rekomendasi</div>
                            </td>
                            <td class="text-center">
                                <span class="badge rounded-circle p-2" :class="item.feedback ? 'bg-success' : 'bg-light text-muted border'">
                                    <i class="fas" :class="item.feedback ? 'fa-check' : 'fa-minus'"></i>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-white border-top-0 py-3">
             <div class="d-flex justify-content-between align-items-center">
                <div class="small text-muted">
                    Menampilkan <strong>{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }}</strong> dari <strong>{{ total }}</strong> data
                </div>
                <nav v-if="totalPages > 1">
                    <ul class="pagination pagination-sm mb-0 custom-pagination">
                        <li class="page-item" :class="{ disabled: page === 1 }">
                            <button class="page-link" @click="changePage(page - 1)"><i class="fas fa-chevron-left"></i></button>
                        </li>
                        <li class="page-item" v-for="p in displayedPages" :key="p" :class="{ active: page === p, disabled: p === '...' }">
                            <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: page === totalPages }">
                            <button class="page-link" @click="changePage(page + 1)"><i class="fas fa-chevron-right"></i></button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/indikatorMutuService'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useToast } from 'vue-toastification'

const toast = useToast()

const showExportMenu = ref(false)

// Directive for clicking outside the dropdown
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    }
}

const items = ref([])
const units = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7),
    unit: null,
    keyword: ''
})

const stats = computed(() => {
    return {
        totalFeedback: items.value.filter(i => i.feedback).length
    }
})

const stripHtml = (html) => {
    if (!html) return '-'
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || "-"
}

const exportToExcel = () => {
    if (items.value.length === 0) {
        toast.warning('Tidak ada data untuk di-export')
        return
    }

    const data = items.value.map((item, index) => ({
        'No': index + 1,
        'Indikator Mutu': item.nama_inmut,
        'Unit / Ruang': item.nama_ruang,
        'Tanggal Feedback': item.feedback ? item.feedback.tgl_feedback : '-',
        'Supervisi': stripHtml(item.feedback ? item.feedback.supervisi : ''),
        'Rekomendasi / Saran': stripHtml(item.feedback ? item.feedback.rekomendasi : '')
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Supervisi")
    
    // Set column widths
    const wscols = [
        {wch: 5}, {wch: 40}, {wch: 25}, {wch: 15}, {wch: 50}, {wch: 50}
    ]
    ws['!cols'] = wscols

    XLSX.writeFile(wb, `Rekap_Supervisi_${filters.bulan}.xlsx`)
    toast.success('Excel berhasil di-download')
}

const exportToPDF = () => {
    if (items.value.length === 0) {
        toast.warning('Tidak ada data untuk di-export')
        return
    }

    const doc = new jsPDF('l', 'mm', 'a4')
    const title = `REKAP SUPERVISI & REKOMENDASI KOMITE MUTU`
    const period = `Periode: ${formatDateFull(filters.bulan)}`

    doc.setFontSize(16)
    doc.setTextColor(67, 94, 190) // Primary color
    doc.text(title, 14, 15)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(period, 14, 22)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 27)

    const tableData = items.value.map((item, index) => [
        index + 1,
        `${item.nama_inmut}\n(${item.nama_ruang})`,
        item.feedback ? formatDate(item.feedback.tgl_feedback) : '-',
        stripHtml(item.feedback ? item.feedback.supervisi : ''),
        stripHtml(item.feedback ? item.feedback.rekomendasi : '')
    ])

    doc.autoTable({
        startY: 32,
        head: [['#', 'Indikator & Unit', 'Tgl Feedback', 'Supervisi', 'Rekomendasi / Saran']],
        body: tableData,
        headStyles: { fillColor: [67, 94, 190], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 80 },
            4: { cellWidth: 80 }
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        alternateRowStyles: { fillColor: [245, 247, 255] }
    })

    doc.save(`Rekap_Supervisi_${filters.bulan}.pdf`)
    toast.success('PDF berhasil di-download')
}

const formatDateFull = (monthStr) => {
    if (!monthStr) return '-'
    const [year, month] = monthStr.split('-')
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${monthNames[parseInt(month) - 1]} ${year}`
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            bulan: filters.bulan,
            dep_id: filters.unit,
            keyword: filters.keyword,
            has_feedback: 1
        }
        const response = await api.getAnalisa(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error('Error rekap feedback:', error)
    } finally {
        loading.value = false
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetch units:', error)
    }
}

let timeout = null
const debounceFetch = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        page.value = 1
        fetchData()
    }, 500)
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const displayedPages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const delta = 1
    const range = []
    
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        } else if (range[range.length - 1] !== '...') {
            range.push('...')
        }
    }
    return range
})

onMounted(() => {
    fetchUnits()
    fetchData()
})
</script>

<style scoped>
.filter-card {
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
}

.filter-label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    display: block;
    letter-spacing: 0.5px;
}

.fw-800 { font-weight: 800; }

.feedback-content {
    font-size: 0.85rem;
    line-height: 1.5;
    max-height: 100px;
    overflow-y: auto;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

/* Custom scrollbar for feedback content */
.feedback-content::-webkit-scrollbar {
    width: 4px;
}
.feedback-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-pagination .page-link {
    border: none;
    background: #f1f5f9;
    color: #64748b;
    margin: 0 2px;
    border-radius: 6px !important;
    font-weight: 600;
}

.custom-pagination .page-item.active .page-link {
    background: #435ebe;
    color: #fff;
}

.bg-light-subtle {
    background-color: rgba(248, 250, 252, 0.5);
}

.style-chooser :deep(.vs__dropdown-toggle) {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    min-height: 38px;
}
</style>
