
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

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
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPasswordView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('../views/auth/ChangePasswordView.vue'),
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
    path: '/dashboard/kunjungan',
    name: 'VisitDashboard',
    component: () => import('../views/dashboard/KunjunganView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/statistik-ranap',
    name: 'StatistikRanap',
    component: () => import('../views/dashboard/StatistikRanapView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/tanya-ai',
    name: 'TanyaAi',
    component: () => import('../views/dashboard/TanyaAiView.vue'),
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
    path: '/informasi/hfis',
    name: 'HfisSchedule',
    component: () => import('../views/informasi/HfisScheduleView.vue'),
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
    path: '/admin/face-master',
    name: 'FaceMasterManagement',
    component: () => import('../views/admin/FaceMasterManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile-app/slider',
    name: 'SliderManagement',
    component: () => import('../views/admin/SliderManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile-app/artikel',
    name: 'ArticleManagement',
    component: () => import('../views/admin/ArticleManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile-app/fasilitas',
    name: 'FacilityManagement',
    component: () => import('../views/admin/FacilityManagementView.vue'),
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
    path: '/sdi/jadwal-pegawai',
    name: 'JadwalPegawaiRead',
    component: () => import('../views/sdi/JadwalPegawaiReadView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/jadwal-pegawai-all',
    name: 'JadwalPegawaiReadAll',
    component: () => import('../views/sdi/JadwalPegawaiReadView.vue'),
    props: { allowAllDepartments: true },
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
    path: '/approval/nomor-surat',
    name: 'ApprovalNomorSurat',
    component: () => import('../views/approval/NomorSuratView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval/lembur',
    name: 'ApprovalLembur',
    component: () => import('../views/approval/LemburView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/verif-lembur',
    name: 'VerifLembur',
    component: () => import('../views/dashboard/VerifLemburView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/aproval-jadwal-tambahan',
    name: 'ApprovalJadwalTambahan',
    component: () => import('../views/sdi/ApprovalJadwalTambahanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/struktur-organisasi-unit',
    name: 'StrukturOrganisasiUnit',
    component: () => import('../views/sdi/StrukturOrganisasiUnitView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/karyawan',
    name: 'DataKaryawan',
    component: () => import('../views/sdi/KaryawanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/karyawan-unit',
    name: 'DataKaryawanUnit',
    component: () => import('../views/sdi/KaryawanUnitView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diklat/dashboard',
    name: 'DiklatDashboard',
    component: () => import('../views/sdi/DiklatDashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diklat/karyawan',
    name: 'DiklatKaryawan',
    component: () => import('../views/sdi/DiklatKaryawanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/diklat/kegiatan',
    name: 'DiklatKegiatan',
    component: () => import('../views/sdi/DiklatKegiatanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/data-dokter',
    name: 'DataDokter',
    component: () => import('../views/sdi/DokterView.vue'),
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
    path: '/sdi/unit-shift-rules',
    name: 'UnitShiftRules',
    component: () => import('../views/sdi/UnitShiftRulesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/master-pegawai',
    name: 'MasterPegawai',
    component: () => import('../views/sdi/MasterPegawaiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/rekap-cuti',
    name: 'RekapCutiSDI',
    component: () => import('../views/sdi/RekapCutiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sdi/temporary-presensi',
    name: 'TemporaryPresensi',
    component: () => import('../views/sdi/TemporaryPresensiView.vue'),
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
    path: '/farmasi/penerimaan-obat',
    name: 'PenerimaanObat',
    component: () => import('../views/farmasi/PenerimaanObatView.vue'),
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
    path: '/indikator-mutu/dashboard',
    name: 'DashboardIndikatorMutu',
    component: () => import('../views/indikator-mutu/DashboardIndikatorMutuView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/indikator-mutu/validator-pic',
    name: 'ValidatorPicIndikatorMutu',
    component: () => import('../views/indikator-mutu/ValidatorPicView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/monitoring-klaim',
    name: 'MonitoringKlaim',
    component: () => import('../views/dashboard/MonitoringKlaimView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/monitoring-rm',
    name: 'MonitoringRM',
    component: () => import('../views/dashboard/MonitoringRMView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/pengisian-erm',
    name: 'MonitoringPengisianERM',
    component: () => import('../views/dashboard/PengisianErmView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/akred/spo',
    name: 'SpoManagement',
    component: () => import('../views/akred/SpoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/akred/instrumen-akreditasi',
    name: 'InstrumenAkreditasi',
    component: () => import('../views/akred/InstrumenAkreditasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/akre/tim-akred',
    name: 'TimAkreditasi',
    component: () => import('../views/akred/TimAkreditasiView.vue'),
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
  {
    path: '/keuangan/tarif',
    name: 'MasterTarif',
    component: () => import('../views/keuangan/MasterTarifView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/keuangan/hutang-vendor-farmasi',
    name: 'HutangVendorFarmasi',
    component: () => import('../views/keuangan/HutangVendorFarmasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/helpdesk/tiket-masuk',
    name: 'TiketMasukHelpdesk',
    component: () => import('../views/helpdesk/TiketMasukView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bpjs/antrol',
    name: 'BpjsAntrol',
    component: () => import('../views/bpjs/AntrolView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bpjs/mapping-dokter',
    name: 'BpjsMappingDokter',
    component: () => import('../views/bpjs/MappingDokterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bpjs/pasien',
    name: 'BpjsPasien',
    component: () => import('../views/bpjs/PasienVclaimView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/dashboard',
    name: 'SatuSehatDashboard',
    component: () => import('../views/satusehat/SatuSehatDashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/encounter',
    name: 'SatuSehatEncounter',
    component: () => import('../views/satusehat/SatuSehatEncounterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/observation',
    name: 'SatuSehatObservation',
    component: () => import('../views/satusehat/SatuSehatObservationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/condition',
    name: 'SatuSehatCondition',
    component: () => import('../views/satusehat/SatuSehatConditionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/procedure',
    name: 'SatuSehatProcedure',
    component: () => import('../views/satusehat/SatuSehatProcedureView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/medication-request',
    name: 'SatuSehatMedicationRequest',
    component: () => import('../views/satusehat/SatuSehatMedicationRequestView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/medication-dispense',
    name: 'SatuSehatMedicationDispense',
    component: () => import('../views/satusehat/SatuSehatMedicationDispenseView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/medication-statement',
    name: 'SatuSehatMedicationStatement',
    component: () => import('../views/satusehat/SatuSehatMedicationStatementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/questionresponse',
    name: 'SatuSehatQuestionResponseTelaahFarmasi',
    component: () => import('../views/satusehat/SatuSehatQuestionResponseTelaahFarmasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/medication',
    name: 'SatuSehatMedication',
    component: () => import('../views/satusehat/SatuSehatMedicationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/patient',
    name: 'SatuSehatPatient',
    component: () => import('../views/satusehat/SatuSehatPatientView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/servicerequest-radiology',
    name: 'SatuSehatServiceRequestRadiology',
    component: () => import('../views/satusehat/SatuSehatServiceRequestRadiologyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/careplan',
    name: 'SatuSehatCarePlan',
    component: () => import('../views/satusehat/SatuSehatCarePlanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/specimen-radiology',
    name: 'SatuSehatSpecimenRadiology',
    component: () => import('../views/satusehat/SatuSehatSpecimenRadiologyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/observation-radiology',
    name: 'SatuSehatObservationRadiology',
    component: () => import('../views/satusehat/SatuSehatObservationRadiologyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/diagnosticreport-radiology',
    name: 'SatuSehatDiagnosticReportRadiology',
    component: () => import('../views/satusehat/SatuSehatDiagnosticReportRadiologyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/location',
    name: 'SatuSehatLocation',
    component: () => import('../views/satusehat/SatuSehatLocationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/mapping-radiology',
    name: 'SatuSehatMappingRadiologi',
    component: () => import('../views/satusehat/SatuSehatMappingRadiologiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/mapping-lab',
    name: 'SatuSehatMappingLab',
    component: () => import('@/views/satusehat/SatuSehatMappingLabView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/servicerequest-lab',
    name: 'SatuSehatServiceRequestLab',
    component: () => import('@/views/satusehat/SatuSehatServiceRequestLabView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/episodeofcare',
    name: 'SatuSehatEpisodeOfCare',
    component: () => import('../views/satusehat/SatuSehatEpisodeOfCareView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/specimen-lab',
    name: 'SatuSehatSpecimenLab',
    component: () => import('@/views/satusehat/SatuSehatSpecimenLabView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/satusehat/observation-lab',
    name: 'SatuSehatObservationLab',
    component: () => import('@/views/satusehat/SatuSehatObservationLabView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/hais',
    name: 'LaporanHais',
    component: () => import('../views/laporan/HaisLaporanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/rekap-presensi',
    name: 'RekapPresensi',
    component: () => import('../views/laporan/RekapPresensiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/kunjungan-rl3-5',
    name: 'laporan-kunjungan-rl35',
    component: () => import('@/views/laporan/KunjunganRL35View.vue'),
  },
  {
    path: '/laporan/rujukan-rl3-10',
    name: 'laporan-rujukan-rl310',
    component: () => import('@/views/laporan/RujukanRL310View.vue'),
  },
  {
    path: '/laporan/carabayar-rl3-19',
    name: 'laporan-carabayar-rl319',
    component: () => import('@/views/laporan/CaraBayarRL319View.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/morbiditas-ralan',
    name: 'laporan-morbiditas-ralan',
    component: () => import('@/views/laporan/MorbiditasRalanView.vue'),
    meta: {
      title: 'Morbiditas Ralan',
      requiresAuth: true
    }
  },
  {
    path: '/laporan/morbiditas-ranap',
    name: 'MorbiditasRanap',
    component: () => import('../views/laporan/MorbiditasRanapView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratorium/indikator',
    name: 'LaboratoriumIndikator',
    component: () => import('../views/laboratorium/LabIndicatorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/penyakit',
    name: 'Top10Penyakit',
    component: () => import('../views/laporan/PenyakitReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/persalinan',
    name: 'LaporanPersalinan',
    component: () => import('../views/laporan/PersalinanReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/survey-kepuasan',
    name: 'SurveyKepuasan',
    component: () => import('../views/laporan/SurveyKepuasanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan/diagnosa-procedure',
    name: 'DiagnosaProcedure',
    component: () => import('../views/laporan/DiagnosaProcedureView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ppra/tim',
    name: 'TimPpra',
    component: () => import('../views/ppra/TimPpraView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ppra/mapping-obat',
    name: 'PpraMappingObat',
    component: () => import('../views/ppra/MappingObatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ppra/laporan',
    name: 'PpraLaporan',
    component: () => import('../views/ppra/PpraLaporanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profil',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pasien/data',
    name: 'DataPasien',
    component: () => import('../views/pasien/DataPasienView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pasien/registrasi',
    name: 'RegistrasiPasien',
    component: () => import('../views/pasien/RegistrasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pasien/transfer-imunisasi',
    name: 'TransferImunisasi',
    component: () => import('../views/pasien/TransferImunisasiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pasien/sep',
    name: 'PasienSep',
    component: () => import('../views/pasien/SepView.vue'),
    meta: { requiresAuth: true }
  },
  // === CNS ===
  {
    path: '/cns/dokter-off',
    name: 'CnsDokterOff',
    component: () => import('../views/cns/DokterOffView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cns/jam-poli',
    name: 'CnsJamPoli',
    component: () => import('../views/cns/JamPoliView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cns/konfirmasi-hadir',
    name: 'CnsKonfirmasiHadir',
    component: () => import('../views/cns/KonfirmasiHadirView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cns/kontrol',
    name: 'CnsKontrol',
    component: () => import('../views/cns/KontrolView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/internal',
    name: 'CentralArchiveInternal',
    component: () => import('../views/central-archive/InternalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/eksternal',
    name: 'CentralArchiveEksternal',
    component: () => import('../views/central-archive/EksternalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/masuk',
    name: 'CentralArchiveMasuk',
    component: () => import('../views/central-archive/MasukView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/spo',
    name: 'CentralArchiveSpo',
    component: () => import('../views/central-archive/SpoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/spo/create',
    name: 'CentralArchiveSpoCreate',
    component: () => import('../views/central-archive/SpoCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/spo/edit/:id',
    name: 'CentralArchiveSpoEdit',
    component: () => import('../views/central-archive/SpoEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/spo-generator',
    name: 'CentralArchiveSpoGenerator',
    component: () => import('../views/central-archive/SpoAiGeneratorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/pks',
    name: 'CentralArchivePks',
    component: () => import('../views/central-archive/PksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/pks/create',
    name: 'CentralArchivePksCreate',
    component: () => import('../views/central-archive/PksCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/pks/edit/:id',
    name: 'CentralArchivePksEdit',
    component: () => import('../views/central-archive/PksEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/sk',
    name: 'CentralArchiveSk',
    component: () => import('../views/central-archive/SkView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/keperawatan',
    name: 'CentralArchiveKeperawatan',
    component: () => import('../views/central-archive/KeperawatanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/kesehatan',
    name: 'CentralArchiveKesehatan',
    component: () => import('../views/central-archive/KesehatanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/medis',
    name: 'CentralArchiveMedis',
    component: () => import('../views/central-archive/MedisView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/ppi',
    name: 'CentralArchivePpi',
    component: () => import('../views/central-archive/PpiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/pmkp',
    name: 'CentralArchivePmkp',
    component: () => import('../views/central-archive/PmkpView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/iht',
    name: 'CentralArchiveIht',
    component: () => import('../views/central-archive/IhtView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/radiologi',
    name: 'CentralArchiveRadiologi',
    component: () => import('../views/central-archive/RadiologiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/central-archive/undangan',
    name: 'CentralArchiveUndangan',
    component: () => import('../views/central-archive/UndanganView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// NProgress configuration
NProgress.configure({ showSpinner: false })

// Navigation guards
router.beforeEach((to, from, next) => {
  NProgress.start()
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

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router