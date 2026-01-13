import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    redirect: '/dashboard/overview'
  },
  {
    path: '/dashboard/overview',
    name: 'DashboardOverview',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/bed',
    name: 'BedAvailability',
    component: () => import('../views/dashboard/BedAvailabilityView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/bed/display',
    name: 'BedAvailabilityDisplay',
    component: () => import('../views/dashboard/BedAvailabilityView.vue'),
    meta: { requiresAuth: true, layout: 'empty' }
  },
  {
    path: '/codeblue/schedule',
    name: 'CodeBlueSchedule',
    component: () => import('../views/CodeBlueScheduleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/informasi/jadwal-dokter',
    name: 'JadwalDokter',
    component: () => import('../views/informasi/JadwalDokterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/informasi/kamar',
    name: 'Kamar',
    component: () => import('../views/informasi/KamarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dokumen-surat',
    name: 'DokumenSurat',
    component: () => import('../views/dokumen-surat/DokumenSuratView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/menu',
    name: 'MenuManagement',
    component: () => import('../views/admin/MenuManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/role',
    name: 'RoleManagement',
    component: () => import('../views/admin/RoleManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/user',
    name: 'UserManagement',
    component: () => import('../views/admin/UserManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/role-menu',
    name: 'RoleMenuManagement',
    component: () => import('../views/admin/RoleMenuManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/select-role',
    name: 'SelectRole',
    component: () => import('../views/SelectRoleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/jadwal',
    name: 'JadwalPegawai',
    component: () => import('../views/sdi/JadwalPegawaiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/input-jadwal-admin',
    name: 'InputJadwalAdmin',
    component: () => import('../views/sdi/InputJadwalAdminView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/aproval-jadwal-kerja',
    name: 'ApprovalJadwal',
    component: () => import('../views/sdi/ApprovalJadwalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/jadwal-tambahan',
    name: 'JadwalTambahan',
    component: () => import('../views/sdi/JadwalTambahanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval/jadwal',
    name: 'UnifiedApprovalJadwal',
    component: () => import('../views/sdi/UnifiedApprovalJadwalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval/jadwal-all',
    name: 'UnifiedApprovalJadwalAll',
    component: () => import('../views/sdi/UnifiedApprovalJadwalView.vue'),
    props: { allowAllDepartments: true },
    meta: { requiresAuth: true }
  },
  {
    path: '/approval/cuti',
    name: 'UnifiedApprovalCuti',
    component: () => import('../views/sdi/ApprovalCutiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval/berkas',
    name: 'UnifiedApprovalBerkas',
    component: () => import('../views/akred/UnifiedApprovalBerkasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/aproval-jadwal-tambahan',
    name: 'ApprovalJadwalTambahan',
    component: () => import('../views/sdi/ApprovalJadwalTambahanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/karyawan',
    name: 'DataKaryawan',
    component: () => import('../views/sdi/KaryawanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/pengajuan-cuti',
    name: 'PengajuanCuti',
    component: () => import('../views/sdi/PengajuanCutiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/aproval-cuti',
    name: 'ApprovalCuti',
    component: () => import('../views/sdi/ApprovalCutiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aset-fasilitas/master-data',
    name: 'MasterDataAset',
    component: () => import('../views/aset/master/MasterDataView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aset-fasilitas/manajemen-inventaris',
    name: 'ManajemenInventaris',
    component: () => import('../views/aset/inventaris/ManajemenInventarisView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aset-fasilitas/pemeliharaan',
    name: 'PemeliharaanAset',
    component: () => import('../views/aset/pemeliharaan/PemeliharaanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/farmasi/databarang',
    name: 'DataBarang',
    component: () => import('../views/farmasi/DataBarangView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/farmasi/stok-opname',
    name: 'StokOpname',
    component: () => import('../views/farmasi/StokOpnameView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/farmasi/riwayat-obat',
    name: 'RiwayatObat',
    component: () => import('../views/farmasi/RiwayatObatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pemeriksaan/rawat-jalan',
    name: 'RawatJalan',
    component: () => import('../views/pemeriksaan/RawatJalanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pemeriksaan/rawat-inap',
    name: 'RawatInap',
    component: () => import('../views/pemeriksaan/RawatInapView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pemeriksaan/skrining-gizi',
    name: 'SkriningGizi',
    component: () => import('../views/pemeriksaan/SkriningGiziView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/indikator-mutu/master',
    name: 'MasterIndikatorMutu',
    component: () => import('../views/indikator-mutu/MasterIndikatorMutuView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/indikator-mutu/monitoring',
    name: 'MonitoringIndikatorMutu',
    component: () => import('../views/indikator-mutu/MonitoringIndikatorMutuView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/indikator-mutu/inputdata',
    name: 'InputDataIndikatorMutu',
    component: () => import('../views/indikator-mutu/InputDataIndikatorMutuView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/akred/spo',
    name: 'SpoManagement',
    component: () => import('../views/akred/SpoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pemeriksaan/jadwal-operasi',
    name: 'JadwalOperasi',
    component: () => import('../views/pemeriksaan/JadwalOperasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pemeriksaan/tindakan-operasi',
    name: 'TindakanOperasi',
    component: () => import('../views/pemeriksaan/TindakanOperasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/logistik/satuan-jenis',
    name: 'LogistikMaster',
    component: () => import('../views/logistik/UnifiedLogistikMasterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/logistik/supplier',
    name: 'LogistikSupplier',
    component: () => import('../views/logistik/MasterSupplierView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/logistik/barang',
    name: 'LogistikBarang',
    component: () => import('../views/logistik/MasterBarangView.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state
  if (!authStore.token && localStorage.getItem('access_token')) {
    authStore.initAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router