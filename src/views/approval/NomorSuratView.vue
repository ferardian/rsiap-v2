<template>
  <div class="approval-nomor-surat-page">
    <!-- Header -->
    <div class="page-header border-none">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">📝 Persetujuan Nomor Surat</h1>
          <p class="page-subtitle">Verifikasi dan setujui pengajuan nomor surat resmi</p>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="hero-stats mb-6">
      <div class="stat-card">
        <span class="stat-label">Total Pengajuan</span>
        <span class="stat-value">{{ currentStats.total || 0 }}</span>
      </div>
      <div class="stat-card warning">
        <span class="stat-label">Menunggu</span>
        <span class="stat-value">{{ currentStats.pengajuan || 0 }}</span>
      </div>
      <div class="stat-card success">
        <span class="stat-label">Disetujui</span>
        <span class="stat-value">{{ currentStats.disetujui || 0 }}</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container mb-6">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-item', { active: activeTab === tab.id }]"
      >
        <i :class="['fas', tab.icon, 'mr-2']"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Card -->
    <div class="content-card">
      <div class="history-header bg-gray-50/50 border-b border-gray-100">
        <div class="header-row">
          <div class="flex flex-col">
            <h3>Daftar Pengajuan - {{ activeTabLabel }}</h3>
            <p class="text-sm text-gray-500 mt-1">Sistem verifikasi otomatis untuk penomoran surat</p>
          </div>
          <button class="btn-refresh" @click="loadData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span class="hidden sm:inline ml-1">Refresh</span>
          </button>
        </div>
      </div>
      
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state py-10 text-center">
          <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-blue-500"></i>
          <p class="text-gray-500">Memuat data {{ activeTabLabel }}...</p>
        </div>
        
        <!-- Unified Empty State -->
        <div v-else-if="suratList.length === 0" class="empty-state py-16 text-center">
          <i class="fas fa-folder-open text-5xl text-gray-200 mb-4 block"></i>
          <p class="text-gray-400 font-medium text-lg">Bagus! Tidak ada antrian pengajuan surat saat ini.</p>
          <p class="text-gray-300 text-sm mt-1">Semua surat {{ activeTabLabel.toLowerCase() }} sudah terproses.</p>
        </div>

        <template v-else>
          <!-- Desktop Table View -->
          <div class="table-container hidden md:block">
            <table class="modern-table w-full">
              <thead>
                <tr>
                  <th width="140">TANGGAL</th>
                  <th>PERIHAL</th>
                  <th v-if="activeTab === 'eksternal'">ALAMAT</th>
                  <th>PENANGGUNG JAWAB</th>
                  <th width="120">STATUS</th>
                  <th class="text-center" width="200">AKSI</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="surat in suratList" :key="surat.id">
                  <td>
                    <div class="date-cell">
                      <span class="day">{{ getDay(surat.tgl_terbit) }}</span>
                      <div class="month-year">
                        <span class="month">{{ getMonth(surat.tgl_terbit) }}</span>
                        <span class="year">{{ getYear(surat.tgl_terbit) }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-col">
                      <span class="perihal-text">{{ surat.perihal }}</span>
                      <span v-if="surat.no_surat" class="no-surat-badge mt-2">{{ surat.no_surat }}</span>
                    </div>
                  </td>
                  <td v-if="activeTab === 'eksternal'">
                    <p class="text-sm text-gray-600 line-clamp-2 max-w-xs">{{ surat.alamat || '-' }}</p>
                  </td>
                  <td>
                    <div class="pj-info">
                      <span class="pj-name">{{ surat.penanggung_jawab?.nama || '-' }}</span>
                      <span class="pj-nip">{{ surat.pj }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-pill', surat.status]">
                      {{ capitalize(surat.status) }}
                    </span>
                  </td>
                  <td>
                    <div v-if="surat.status === 'pengajuan'" class="flex justify-center gap-2">
                      <button 
                        @click="handleAction(surat, 'disetujui')" 
                        class="btn-act approve"
                        v-tooltip="'Setujui & Terbitkan Nomor'"
                        :disabled="processingId === surat.id"
                      >
                        <i class="fas" :class="processingId === surat.id ? 'fa-spinner fa-spin' : 'fa-check-circle'"></i>
                      </button>
                      <button 
                        @click="handleAction(surat, 'ditolak')" 
                        class="btn-act reject"
                        v-tooltip="'Tolak Pengajuan'"
                        :disabled="processingId === surat.id"
                      >
                        <i class="fas fa-times-circle"></i>
                      </button>
                    </div>
                    <div v-else class="text-center">
                      <span class="text-xs text-blue-500 font-bold">
                        <i class="fas fa-check-double mr-1"></i> TERPROSES
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Layout (Tabbed Cards) -->
          <div class="mobile-view md:hidden p-4">
            <div class="space-y-4">
              <div v-for="surat in suratList" :key="surat.id" class="mobile-card">
                <div class="card-header-mob">
                  <span class="mobile-date">{{ formatDateShort(surat.tgl_terbit) }}</span>
                  <span :class="['status-pill small', surat.status]">{{ capitalize(surat.status) }}</span>
                </div>
                
                <div class="card-body-mob">
                  <h4 class="perihal-mob">{{ surat.perihal }}</h4>
                  <p v-if="activeTab === 'eksternal'" class="text-xs text-gray-500 mt-1 italic">{{ surat.alamat }}</p>
                  <div class="pj-mob-row mt-3">
                    <i class="fas fa-user-circle text-gray-300"></i>
                    <span>{{ (surat.penanggung_jawab?.nama || surat.pj) }}</span>
                  </div>
                  <div v-if="surat.no_surat" class="no-surat-badge mt-2 w-fit">
                    {{ surat.no_surat }}
                  </div>
                </div>

                <div v-if="surat.status === 'pengajuan'" class="card-footer-mob">
                  <button 
                    @click="handleAction(surat, 'disetujui')" 
                    class="mob-btn approve"
                    :disabled="processingId === surat.id"
                  >
                    <i class="fas fa-check mr-1"></i> Setujui
                  </button>
                  <button 
                    @click="handleAction(surat, 'ditolak')" 
                    class="mob-btn reject"
                    :disabled="processingId === surat.id"
                  >
                    <i class="fas fa-times mr-1"></i> Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { suratInternalService } from '@/services/suratInternalService'
import { suratEksternalService } from '@/services/suratEksternalService'
import { skService } from '@/services/skService'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const processingId = ref(null)
const suratList = ref([])
const activeTab = ref('internal')
const internalStats = ref({})
const eksternalStats = ref({})
const kredensialStats = ref({ total: 0, pengajuan: 0, disetujui: 0 })

const tabs = [
  { id: 'internal', label: 'Internal', icon: 'fa-building' },
  { id: 'eksternal', label: 'Eksternal', icon: 'fa-globe' },
  { id: 'kredensial', label: 'SK Kredensial', icon: 'fa-id-badge' }
]

// Computed
const activeTabLabel = computed(() => {
  if (activeTab.value === 'internal') return 'Surat Internal'
  if (activeTab.value === 'eksternal') return 'Surat Eksternal'
  return 'SK Kredensial'
})

const currentStats = computed(() => {
  if (activeTab.value === 'internal') return internalStats.value
  if (activeTab.value === 'eksternal') return eksternalStats.value
  return kredensialStats.value
})

const service = computed(() => {
  return activeTab.value === 'internal' ? suratInternalService : suratEksternalService
})

// Watchers
watch(activeTab, () => {
  loadData()
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'kredensial') {
      const res = await skService.searchSk('SPK RKK', 100, 1, [
        { field: 'status_approval', operator: '=', value: 'pengajuan' }
      ])
      
      const rawData = res.data?.data || []
      suratList.value = rawData.map(item => ({
        id: btoa(`${item.nomor}.${item.jenis}.${item.tgl_terbit.split(' ')[0]}`),
        perihal: item.judul,
        tgl_terbit: item.tgl_terbit,
        penanggung_jawab: item.penanggung_jawab,
        pj: item.pj,
        status: item.status_approval,
        no_surat: null,
        _original: item
      }))

      kredensialStats.value = {
        total: suratList.value.length,
        pengajuan: suratList.value.length,
        disetujui: 0
      }
    } else {
      const payload = {
        sort: [{ field: 'created_at', direction: 'desc' }],
        filters: [
          { field: 'status', operator: '=', value: 'pengajuan' }
        ]
      }
      
      const [dataRes, statsRes] = await Promise.all([
        service.value.getSuratInternal ? service.value.getSuratInternal(payload) : service.value.getSuratEksternal(payload),
        service.value.getStats()
      ])

      suratList.value = dataRes.data.data || []
      if (activeTab.value === 'internal') {
        internalStats.value = statsRes.data.data
      } else {
        eksternalStats.value = statsRes.data.data
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleAction = async (surat, status) => {
  const actionLabel = status === 'disetujui' ? 'menyetujui' : 'menolak'
  
  const result = await Swal.fire({
    title: `<span class="text-xl font-bold">${capitalize(status)} Surat?</span>`,
    html: `<p class="text-gray-500">Apakah Anda yakin ingin ${actionLabel} perihal: <br><b>"${surat.perihal}"</b>?</p>`,
    icon: status === 'disetujui' ? 'success' : 'warning',
    showCancelButton: true,
    confirmButtonColor: status === 'disetujui' ? '#10b981' : '#ef4444',
    confirmButtonText: status === 'disetujui' ? 'Ya, Setujui!' : 'Ya, Tolak',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      confirmButton: 'rounded-xl px-6 py-2 font-bold shadow-lg',
      cancelButton: 'rounded-xl px-6 py-2 font-bold'
    }
  })

  if (!result.isConfirmed) return

  processingId.value = surat.id
  try {
    if (activeTab.value === 'kredensial') {
      if (status === 'disetujui') {
        await skService.approveKredensial(surat.id)
      } else {
        // Fallback for rejected credential drafts
        await skService.updateSk(surat.id, { status_approval: 'ditolak' })
      }
    } else {
      const updateFn = activeTab.value === 'internal' ? suratInternalService.updateSuratInternal : suratEksternalService.updateSuratEksternal
      await updateFn(surat.id, {
        ...surat,
        status: status
      })
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    Toast.fire({
      icon: 'success',
      title: `Surat Berhasil ${capitalize(status)}`,
      background: '#ffffff',
      color: '#1e293b'
    })

    loadData()
  } catch (error) {
    console.error(`Error ${actionLabel} surat:`, error)
    Swal.fire('Gagal', 'Terjadi kesalahan sistem. Mohon coba lagi.', 'error')
  } finally {
    processingId.value = null
  }
}

// Helpers
const getDay = (dateStr) => dateStr ? new Date(dateStr).getDate() : '-'
const getMonth = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
}
const getYear = (dateStr) => dateStr ? new Date(dateStr).getFullYear() : '-'

const formatDateShort = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Initialize
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.approval-nomor-surat-page {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #2563eb 100%);
  padding: 3rem 2rem;
  border-radius: 24px;
  margin-bottom: -2.5rem;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.2);
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  margin-top: 0.75rem;
  max-width: 600px;
}

/* Stats Bar */
.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  position: relative;
  z-index: 10;
  padding: 0 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  border: 1px solid white;
  transition: transform 0.3s ease;
}

.stat-card:hover { transform: translateY(-5px); }

.stat-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 2rem; font-weight: 900; color: #0f172a; display: block; margin-top: 0.5rem; }
.stat-card.warning .stat-value { color: #f59e0b; }
.stat-card.success .stat-value { color: #10b981; }

/* Tabs */
.tabs-container {
  display: flex;
  background: #f1f5f9;
  padding: 0.4rem;
  border-radius: 14px;
  width: fit-content;
  margin-top: 1.5rem;
  margin-left: 1rem;
}

.tab-item {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.tab-item.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.history-header { padding: 1.5rem 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; }
h3 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }

.btn-refresh {
  padding: 0.6rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) { background: white; border-color: #3b82f6; color: #3b82f6; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1); }

/* Table Elements */
.modern-table th { padding: 1.25rem 1.5rem; background: #f8fafc; color: #94a3b8; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
.modern-table td { padding: 1.5rem; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.modern-table tr:hover { background: #fafbfc; }

.date-cell { display: flex; align-items: center; gap: 0.75rem; }
.date-cell .day { font-size: 1.75rem; font-weight: 900; color: #cbd5e1; line-height: 1; }
.month-year { display: flex; flex-direction: column; }
.month-year .month { font-size: 0.7rem; font-weight: 800; color: #64748b; }
.month-year .year { font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-top: -2px; }

.perihal-text { font-weight: 700; color: #1e293b; font-size: 1rem; display: block; }
.no-surat-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid #dbeafe;
}

.pj-name { font-weight: 600; color: #475569; display: block; font-size: 0.9rem; }
.pj-nip { font-size: 0.75rem; color: #94a3b8; font-family: ui-monospace; }

.status-pill { padding: 0.4rem 0.85rem; border-radius: 10px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; }
.status-pill.pengajuan { background: #fffbeb; color: #92400e; border: 1px solid #fef3c7; }
.status-pill.disetujui { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
.status-pill.ditolak { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

/* Action Buttons Overlay */
.btn-act {
  width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;
  border: none; font-size: 1.1rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-act.approve { background: #dcfce7; color: #16a34a; }
.btn-act.approve:hover:not(:disabled) { transform: scale(1.1); background: #22c55e; color: white; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); }
.btn-act.reject { background: #fee2e2; color: #dc2626; }
.btn-act.reject:hover:not(:disabled) { transform: scale(1.1); background: #ef4444; color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }

/* Mobile Card View */
.mobile-card {
  background: white; border-radius: 18px; border: 1px solid #f1f5f9; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.card-header-mob { padding: 1rem; background: #fafbfc; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
.mobile-date { font-weight: 800; font-size: 0.8rem; color: #64748b; }
.card-body-mob { padding: 1.25rem; }
.perihal-mob { font-weight: 800; color: #1e293b; font-size: 1rem; line-height: 1.4; }
.pj-mob-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #64748b; }
.card-footer-mob { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #f1f5f9; border-top: 1px solid #f1f5f9; }
.mob-btn { padding: 1rem; border: none; font-weight: 800; font-size: 0.85rem; cursor: pointer; background: white; }
.mob-btn.approve { color: #16a34a; }
.mob-btn.reject { color: #dc2626; }
.mob-btn:active { background: #f8fafc; }

/* Responsive Adjustments */
@media (max-width: 768px) {
  .page-header { padding: 2.5rem 1.5rem; border-radius: 24px; margin-bottom: -1.5rem; margin-top: 1rem; }
  .page-title { font-size: 1.75rem; }
  .page-subtitle { font-size: 0.9rem; }
  .hero-stats { grid-template-columns: 1fr; }
  .tabs-container { margin: 0 1rem 1rem 1rem; width: calc(100% - 2rem); }
  .tab-item { flex: 1; text-align: center; }
  .content-card { border-radius: 20px 20px 0 0; }
  .history-header { padding: 1rem 1.25rem; }
  .history-header h3 { font-size: 1rem; }
  .history-header p { font-size: 0.75rem; }
  .btn-refresh { padding: 0.4rem 0.75rem; font-size: 0.75rem; border-radius: 8px; }
  .empty-state { padding: 2.5rem 1rem; }
  .empty-state i { font-size: 3rem; }
  .empty-state p.text-lg { font-size: 0.95rem; }
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.surat-list-item { animation: fadeIn 0.4s ease forwards; }
</style>
