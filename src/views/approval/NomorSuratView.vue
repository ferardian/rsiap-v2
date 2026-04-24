<template>
  <div class="approval-container">
    <div class="boxed-layout">
      <!-- Premium Header Section -->
    <div class="hero-header">
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="title-area">
          <div class="icon-badge">
            <i class="fas fa-file-signature"></i>
          </div>
          <div class="text-group">
            <h1>Persetujuan Nomor Surat</h1>
            <p>Kelola dan verifikasi pengajuan penomoran dokumen resmi rumah sakit</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="loadData" :disabled="loading" class="btn-refresh-modern">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid (Glassmorphism Effect) -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon info"><i class="fas fa-list-ul"></i></div>
          <div class="stat-data">
            <span class="val">{{ currentStats.total || 0 }}</span>
            <span class="lab">Total Antrian</span>
          </div>
        </div>
        <div class="stat-item warning anim-pulse">
          <div class="stat-icon warn"><i class="fas fa-hourglass-half"></i></div>
          <div class="stat-data">
            <span class="val">{{ currentStats.pengajuan || 0 }}</span>
            <span class="lab">Menunggu Approval</span>
          </div>
        </div>
        <div class="stat-item success">
          <div class="stat-icon succ"><i class="fas fa-check-double"></i></div>
          <div class="stat-data">
            <span class="val">{{ currentStats.disetujui || 0 }}</span>
            <span class="lab">Telah Disetujui</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Navigation Tabs -->
      <nav class="tabs-nav">
        <div class="tabs-wrapper">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-pill', { active: activeTab === tab.id }]"
          >
            <i :class="['fas', tab.icon]"></i>
            <span>{{ tab.label }}</span>
            <!-- Notification Badge with Count -->
            <transition name="pop">
              <span v-if="getTabPendingCount(tab.id) > 0" class="notif-badge">
                {{ getTabPendingCount(tab.id) > 99 ? '99+' : getTabPendingCount(tab.id) }}
              </span>
            </transition>
          </button>
        </div>
      </nav>

      <!-- Data Section -->
      <div class="data-card">
        <div class="card-header">
          <h3><i class="fas fa-database mr-2 text-primary"></i> Daftar Pengajuan: {{ activeTabLabel }}</h3>
          <div class="badge-count">{{ suratList.length }} Data</div>
        </div>

        <div class="card-body">
          <!-- Loading Overlay -->
          <div v-if="loading" class="loading-wrapper">
            <div class="loader-circle"></div>
            <p>Sinkronisasi data...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="suratList.length === 0" class="empty-wrapper">
            <div class="empty-illustration">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h4>Semua Beres!</h4>
            <p>Tidak ada pengajuan {{ activeTabLabel.toLowerCase() }} yang perlu disetujui saat ini.</p>
          </div>

          <template v-else>
            <!-- Desktop View -->
            <div class="table-responsive hidden-mobile">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>Tgl Terbit</th>
                    <th>Detail Pengajuan</th>
                    <th v-if="activeTab === 'eksternal'">Tujuan / Alamat</th>
                    <th>Penanggung Jawab</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="surat in suratList" :key="surat.id" class="row-hover">
                    <td>
                      <div class="calendar-card">
                        <span class="month">{{ getMonth(surat.tgl_terbit) }}</span>
                        <span class="day">{{ getDay(surat.tgl_terbit) }}</span>
                        <span class="year">{{ getYear(surat.tgl_terbit) }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="surat-info">
                        <span class="perihal">{{ surat.perihal }}</span>
                        <div v-if="surat.no_surat" class="no-surat-pill">
                          <i class="fas fa-tag"></i> {{ surat.no_surat }}
                        </div>
                        <span v-else class="pending-pill">Menunggu Nomor</span>
                      </div>
                    </td>
                    <td v-if="activeTab === 'eksternal'">
                      <div class="alamat-text">{{ surat.alamat || '-' }}</div>
                    </td>
                    <td>
                      <div class="user-chip">
                        <div class="avatar">{{ getInitials(surat.penanggung_jawab?.nama || surat.pj) }}</div>
                        <div class="user-details">
                          <span class="name">{{ surat.penanggung_jawab?.nama || '-' }}</span>
                          <span class="nik">{{ surat.pj }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <div v-if="surat.status === 'pengajuan'" class="action-group">
                        <button 
                          @click="handleAction(surat, 'disetujui')" 
                          class="act-btn approve"
                          title="Setujui Pengajuan"
                          :disabled="processingId === surat.id"
                        >
                          <i v-if="processingId === surat.id" class="fas fa-spinner fa-spin"></i>
                          <i v-else class="fas fa-check"></i>
                        </button>
                        <button 
                          @click="handleAction(surat, 'ditolak')" 
                          class="act-btn reject"
                          title="Tolak Pengajuan"
                          :disabled="processingId === surat.id"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <div v-else class="status-done">
                        <i class="fas fa-check-circle"></i> Terproses
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile View -->
            <div class="mobile-grid visible-mobile">
              <div v-for="surat in suratList" :key="surat.id" class="m-card">
                <div class="m-card-header">
                  <div class="m-date">{{ formatDateShort(surat.tgl_terbit) }}</div>
                  <div :class="['m-status', surat.status]">{{ surat.status }}</div>
                </div>
                <div class="m-card-body">
                  <div class="m-perihal">{{ surat.perihal }}</div>
                  <div v-if="activeTab === 'eksternal'" class="m-alamat">{{ surat.alamat }}</div>
                  <div class="m-pj">
                    <i class="far fa-user-circle"></i> {{ surat.penanggung_jawab?.nama || surat.pj }}
                  </div>
                </div>
                <div v-if="surat.status === 'pengajuan'" class="m-card-footer">
                  <button @click="handleAction(surat, 'disetujui')" class="m-btn approve" :disabled="processingId === surat.id">
                    <i class="fas fa-check"></i> Setujui
                  </button>
                  <button @click="handleAction(surat, 'ditolak')" class="m-btn reject" :disabled="processingId === surat.id">
                    <i class="fas fa-times"></i> Tolak
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { suratInternalService } from '@/services/suratInternalService'
import { suratEksternalService } from '@/services/suratEksternalService'
import { skService } from '@/services/skService'
import { komiteKeperawatanService } from '@/services/komiteKeperawatanService'
import { komiteKesehatanService } from '@/services/komiteKesehatanService'
import { komiteMedisService } from '@/services/komiteMedisService'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const processingId = ref(null)
const suratList = ref([])
const activeTab = ref('internal')
const internalStats = ref({})
const eksternalStats = ref({})
const kredensialStats = ref({ total: 0, pengajuan: 0, disetujui: 0 })
const undanganStats = ref({ total: 0, pengajuan: 0, disetujui: 0 })
const kesehatanStats = ref({ total: 0, pengajuan: 0, disetujui: 0 })
const medisStats = ref({ total: 0, pengajuan: 0, disetujui: 0 })

const tabs = [
  { id: 'internal', label: 'Internal', icon: 'fa-building' },
  { id: 'eksternal', label: 'Eksternal', icon: 'fa-globe' },
  { id: 'kredensial', label: 'SK Kredensial', icon: 'fa-id-badge' },
  { id: 'undangan', label: 'Komite Keperawatan', icon: 'fa-envelope-open-text' },
  { id: 'kesehatan', label: 'Komite Kesehatan', icon: 'fa-briefcase-medical' },
  { id: 'medis', label: 'Komite Medis', icon: 'fa-file-medical' }
]

// Computed
const activeTabLabel = computed(() => {
  if (activeTab.value === 'internal') return 'Surat Internal'
  if (activeTab.value === 'eksternal') return 'Surat Eksternal'
  if (activeTab.value === 'undangan') return 'Komite Keperawatan'
  if (activeTab.value === 'kesehatan') return 'Komite Kesehatan'
  if (activeTab.value === 'medis') return 'Komite Medis'
  return 'SK Kredensial'
})

const currentStats = computed(() => {
  if (activeTab.value === 'internal') return internalStats.value
  if (activeTab.value === 'eksternal') return eksternalStats.value
  if (activeTab.value === 'undangan') return undanganStats.value
  if (activeTab.value === 'kesehatan') return kesehatanStats.value
  if (activeTab.value === 'medis') return medisStats.value
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
    } else if (activeTab.value === 'undangan') {
      const res = await komiteKeperawatanService.search('', 100, 1, [
        { field: 'status_approval', operator: '=', value: 'pengajuan' }
      ])
      
      const rawData = res.data?.data || []
      suratList.value = rawData.map(item => ({
        id: btoa(`${item.nomor}.${item.tgl_terbit.split(' ')[0]}`),
        perihal: item.perihal,
        tgl_terbit: item.tgl_terbit,
        penanggung_jawab: item.penanggung_jawab,
        pj: item.pj,
        status: item.status_approval,
        no_surat: null,
        _original: item
      }))

      undanganStats.value = {
        total: suratList.value.length,
        pengajuan: suratList.value.length,
        disetujui: 0
      }
    } else if (activeTab.value === 'kesehatan') {
      const res = await komiteKesehatanService.search('', 100, 1, [
        { field: 'status_approval', operator: '=', value: 'pengajuan' }
      ])
      
      const rawData = res.data?.data || []
      suratList.value = rawData.map(item => ({
        id: btoa(`${item.nomor}.${item.tgl_terbit.split(' ')[0]}`),
        perihal: item.perihal,
        tgl_terbit: item.tgl_terbit,
        penanggung_jawab: item.penanggung_jawab,
        pj: item.pj,
        status: item.status_approval,
        no_surat: null,
        _original: item
      }))

      kesehatanStats.value = {
        total: suratList.value.length,
        pengajuan: suratList.value.length,
        disetujui: 0
      }
    } else if (activeTab.value === 'medis') {
      const res = await komiteMedisService.search('', 100, 1, [
        { field: 'status_approval', operator: '=', value: 'pengajuan' }
      ])
      
      const rawData = res.data?.data || []
      suratList.value = rawData.map(item => ({
        id: btoa(`${item.nomor}.${item.tgl_terbit.split(' ')[0]}`),
        perihal: item.perihal,
        tgl_terbit: item.tgl_terbit,
        penanggung_jawab: item.penanggung_jawab,
        pj: item.pj,
        status: item.status_approval,
        no_surat: null,
        _original: item
      }))

      medisStats.value = {
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
    title: `<span class="text-xl font-bold">${status === 'disetujui' ? 'Setujui' : 'Tolak'} Pengajuan?</span>`,
    html: `<p class="text-gray-500">Apakah Anda yakin ingin ${actionLabel} perihal: <br><b>"${surat.perihal}"</b>?</p>`,
    icon: status === 'disetujui' ? 'success' : 'warning',
    showCancelButton: true,
    confirmButtonColor: status === 'disetujui' ? '#10b981' : '#ef4444',
    confirmButtonText: status === 'disetujui' ? 'Ya, Setujui!' : 'Ya, Tolak',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-3xl shadow-2xl',
      confirmButton: 'rounded-xl px-8 py-3 font-bold shadow-lg',
      cancelButton: 'rounded-xl px-8 py-3 font-bold'
    }
  })

  if (!result.isConfirmed) return

  processingId.value = surat.id
  try {
    if (activeTab.value === 'kredensial') {
      if (status === 'disetujui') {
        await skService.approveKredensial(surat.id)
      } else {
        await skService.updateSk(surat.id, { status_approval: 'ditolak' })
      }
    } else if (activeTab.value === 'undangan' || activeTab.value === 'kesehatan' || activeTab.value === 'medis') {
      let currentService = komiteKeperawatanService
      if (activeTab.value === 'kesehatan') currentService = komiteKesehatanService
      if (activeTab.value === 'medis') currentService = komiteMedisService
      
      await currentService.update(surat.id, {
        nomor: surat._original.nomor,
        tgl_terbit: surat._original.tgl_terbit.split(' ')[0],
        pj: surat._original.pj,
        perihal: surat._original.perihal,
        status_approval: status
      })
    } else {
      const updateFn = activeTab.value === 'internal' ? suratInternalService.updateSuratInternal : suratEksternalService.updateSuratEksternal
      await updateFn(surat.id, {
        ...surat,
        status: status
      })
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Surat telah ${status === 'disetujui' ? 'disetujui' : 'ditolak'}.`,
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: 'rounded-3xl' }
    })

    loadData()
  } catch (error) {
    console.error(`Error ${actionLabel} surat:`, error)
    Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error')
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

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

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
onMounted(async () => {
  await loadAllStats()
  loadData()
})

const loadAllStats = async () => {
  try {
    const [intStats, ekstStats, kredRes, undRes] = await Promise.all([
      suratInternalService.getStats(),
      suratEksternalService.getStats(),
      skService.searchSk('SPK RKK', 1, 1, [{ field: 'status_approval', operator: '=', value: 'pengajuan' }]),
      komiteKeperawatanService.search('', 1, 1, [{ field: 'status_approval', operator: '=', value: 'pengajuan' }])
    ])

    internalStats.value = intStats.data.data || intStats.data || {}
    eksternalStats.value = ekstStats.data.data || ekstStats.data || {}
    
    // Pastikan mengambil dari total atau count
    kredensialStats.value = { 
      pengajuan: kredRes.data?.total ?? kredRes.data?.meta?.total ?? kredRes.data?.data?.length ?? 0 
    }
    undanganStats.value = { 
      pengajuan: undRes.data?.total ?? undRes.data?.meta?.total ?? undRes.data?.data?.length ?? 0 
    }

    const kesRes = await komiteKesehatanService.search('', 1, 1, [{ field: 'status_approval', operator: '=', value: 'pengajuan' }])
    kesehatanStats.value = { 
      pengajuan: kesRes.data?.total ?? kesRes.data?.meta?.total ?? kesRes.data?.data?.length ?? 0 
    }

    const medRes = await komiteMedisService.search('', 1, 1, [{ field: 'status_approval', operator: '=', value: 'pengajuan' }])
    medisStats.value = { 
      pengajuan: medRes.data?.total ?? medRes.data?.meta?.total ?? medRes.data?.data?.length ?? 0 
    }
  } catch (error) {
    console.error('Error loading all stats:', error)
  }
}

const getTabPendingCount = (tabId) => {
  if (tabId === 'internal') return internalStats.value.pengajuan || 0
  if (tabId === 'eksternal') return eksternalStats.value.pengajuan || 0
  if (tabId === 'kredensial') return kredensialStats.value.pengajuan || 0
  if (tabId === 'undangan') return undanganStats.value.pengajuan || 0
  if (tabId === 'kesehatan') return kesehatanStats.value.pengajuan || 0
  if (tabId === 'medis') return medisStats.value.pengajuan || 0
  return 0
}
</script>

<style scoped>
.approval-container {
  padding: 1rem;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.boxed-layout {
  width: 100%;
  max-width: 100%;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

/* Header Section */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 2rem;
  padding: 2.5rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.2);
  margin-bottom: 2rem;
}

.header-overlay {
  position: absolute;
  top: 0; right: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.2), transparent);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-badge {
  width: 64px; height: 64px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.text-group h1 { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
.text-group p { color: rgba(255, 255, 255, 0.9); margin: 0.25rem 0 0 0; font-size: 0.95rem; }

.btn-refresh-modern {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh-modern:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  position: relative;
  z-index: 10;
}

.stat-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
}

.stat-icon {
  width: 48px; height: 48px;
  border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.info { background: rgba(255, 255, 255, 0.2); color: #fff; }
.stat-icon.warn { background: rgba(255, 255, 255, 0.2); color: #fff; }
.stat-icon.succ { background: rgba(255, 255, 255, 0.2); color: #fff; }

.stat-data { display: flex; flex-direction: column; }
.stat-data .val { font-size: 1.5rem; font-weight: 800; line-height: 1.2; color: #fff; }
.stat-data .lab { font-size: 0.75rem; color: rgba(255, 255, 255, 0.85); font-weight: 700; text-transform: uppercase; }

/* Tabs Navigation */
.tabs-nav {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 20;
}

.tabs-wrapper {
  background: #f1f5f9;
  padding: 0.4rem;
  border-radius: 1.25rem;
  display: flex;
  width: fit-content;
}

.tab-pill {
  border: none;
  background: transparent;
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notif-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f43f5e;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 4px 10px rgba(244, 63, 94, 0.4);
  z-index: 10;
}

/* Animations */
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.3s reverse;
}
@keyframes pop-in {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.tab-pill.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Data Card */
.data-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.badge-count {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-body { position: relative; min-height: 200px; }

/* Premium Table */
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.row-hover:hover { background-color: #f8fafc; }

/* Calendar Card */
.calendar-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  width: 50px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.calendar-card .month {
  background: #f43f5e;
  color: white;
  font-size: 0.6rem;
  font-weight: 800;
  width: 100%;
  text-align: center;
  padding: 2px 0;
}

.calendar-card .day { font-size: 1.25rem; font-weight: 800; color: #1e293b; padding: 2px 0; }
.calendar-card .year { font-size: 0.6rem; color: #94a3b8; padding-bottom: 4px; }

.surat-info { display: flex; flex-direction: column; gap: 0.4rem; }
.perihal { font-weight: 700; color: #1e293b; font-size: 0.95rem; }

.no-surat-pill {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  width: fit-content;
  border: 1px solid #dbeafe;
}

.pending-pill {
  background: #fff7ed;
  color: #f59e0b;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  width: fit-content;
}

.alamat-text { font-size: 0.85rem; color: #475569; max-width: 250px; line-height: 1.4; }

.user-chip { display: flex; align-items: center; gap: 0.75rem; }
.user-chip .avatar {
  width: 36px; height: 36px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 800;
}

.user-details { display: flex; flex-direction: column; }
.user-details .name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.user-details .nik { font-size: 0.7rem; color: #94a3b8; }

.action-group { display: flex; justify-content: center; gap: 0.75rem; }
.act-btn {
  width: 40px; height: 40px;
  border-radius: 0.75rem;
  border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.act-btn.approve { background: #dcfce7; color: #10b981; }
.act-btn.approve:hover { background: #10b981; color: white; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

.act-btn.reject { background: #fee2e2; color: #f43f5e; }
.act-btn.reject:hover { background: #f43f5e; color: white; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }

.status-done {
  color: #3b82f6; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
}

/* Loading & Empty State */
.loading-wrapper, .empty-wrapper {
  padding: 4rem 2rem;
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
}

.loader-circle {
  width: 48px; height: 48px;
  border: 4px solid #f1f5f9;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-illustration {
  font-size: 4rem; color: #e2e8f0; margin-bottom: 1rem;
}

.empty-wrapper h4 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0; }
.empty-wrapper p { color: #94a3b8; margin-top: 0.5rem; max-width: 300px; }

/* Responsive Utilities */
.hidden-mobile { display: block; }
.visible-mobile { display: none; }

@media (max-width: 768px) {
  .hidden-mobile { display: none; }
  .visible-mobile { display: block; }

  .hero-header { padding: 1.5rem; border-radius: 1.5rem; }
  .header-content { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .stats-grid { grid-template-columns: 1fr; gap: 0.75rem; }
  .stat-item { padding: 1rem; }
  
  .tabs-wrapper { width: 100%; overflow-x: auto; }
  .tab-pill { flex: 1; white-space: nowrap; justify-content: center; }

  .mobile-grid { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
  .m-card { background: #fff; border-radius: 1.25rem; border: 1px solid #e2e8f0; overflow: hidden; }
  .m-card-header { padding: 1rem; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
  .m-date { font-weight: 800; font-size: 0.8rem; color: #64748b; }
  .m-status { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.25rem 0.5rem; border-radius: 0.5rem; }
  .m-status.pengajuan { background: #fffbeb; color: #d97706; }
  
  .m-card-body { padding: 1rem; }
  .m-perihal { font-weight: 800; font-size: 1rem; color: #1e293b; line-height: 1.4; }
  .m-alamat { font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }
  .m-pj { margin-top: 1rem; font-size: 0.85rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
  
  .m-card-footer { display: flex; border-top: 1px solid #f1f5f9; }
  .m-btn { flex: 1; padding: 1rem; border: none; background: white; font-weight: 800; font-size: 0.85rem; cursor: pointer; }
  .m-btn.approve { color: #10b981; border-right: 1px solid #f1f5f9; }
  .m-btn.reject { color: #f43f5e; }
}

.anim-pulse { animation: soft-pulse 2s infinite; }
@keyframes soft-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style>
