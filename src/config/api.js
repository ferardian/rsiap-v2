// API Configuration
export const config = {
  // Public API URLs
  public: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010',
    API_V2_URL: import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2',
    API_VERSION: import.meta.env.VITE_API_VERSION || 'v2',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'RSIA - Sistem Informasi Rumah Sakit',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0'
  },

  // API Endpoints
  endpoints: {
    // Authentication
    auth: {
      login: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/user/auth/login`,
      logout: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/user/auth/logout`,
      refresh: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/user/auth/refresh`,
      detail: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/user/auth/detail`
    },

    // Patient Management
    pasien: {
      list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pasien`,
      detail: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pasien/${id}`,
      create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pasien/create`,
      update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pasien/${id}/update`,
      delete: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pasien/${id}/delete`
    },

    // BPJS Integration
    bpjs: {
      // Rekam Medis
      rekammedis: {
        insert: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rekammedis/insert`,
        update: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rekammedis/update`,
        delete: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rekammedis/delete`,
        get: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rekammedis/${id}`
      },

      // SEP (Surat Eligibility Peserta)
      sep: {
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/sep/create`,
        update: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/sep/update`,
        delete: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/sep/delete`,
        approve: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/sep/approve`
      },

      // Rujukan
      rujukan: {
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rujukan`,
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rujukan/create`,
        update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/bpjs/rujukan/${id}/update`
      }
    },

    // Pharmacy
    farmasi: {
      obat: {
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/farmasi/obat`,
        stok: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/farmasi/stok`,
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/farmasi/obat/create`
      },
      resep: {
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/farmasi/resep/create`,
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/farmasi/resep`
      }
    },

    // Laboratory
    lab: {
      pemeriksaan: {
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/lab/pemeriksaan/create`,
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/lab/pemeriksaan`,
        result: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/lab/pemeriksaan/${id}/result`
      }
    },

    // Kepegawaian
    kepegawaian: {
      pegawai: {
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai`,
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/create`,
        update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/${id}/update`
      },
      jadwal: {
        list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/jadwal`,
        create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/jadwal/create`
      }
    },

    // Menu Management
    menu: {
      list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu`,
      create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/create`,
      update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/${id}/update`,
      delete: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/${id}/delete`,
      tree: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/tree`,
      user: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/user`,
      reorder: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/menu/reorder`,
      checkAccess: (menuId, permission) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/check-access/${menuId}/${permission}`
    },

    // Access Level & User Management
    accessLevel: {
      list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level`,
      create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level/create`,
      update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level/${id}/update`,
      delete: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level/${id}/delete`,
      withPegawai: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level/with-petugas`,
      permissions: (accessLevelId) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/access-level/${accessLevelId}/permissions`
    },

    userAccess: {
      list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/user-access`,
      assign: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/access/assign`,
      remove: (nip, accessLevelId) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/${nip}/access/${accessLevelId}`
    },

    // Pegawai Management
    pegawai: {
      list: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai`,
      detail: (nip) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/${nip}`,
      create: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/create`,
      update: (id) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/${id}/update`,
      search: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/search`,
      statistics: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/statistics`,
      roles: (nip) => `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/pegawai/${nip}/roles`
    },

    // Dashboard & Reports
    dashboard: {
      stats: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/dashboard/stats`,
      kunjungan: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/dashboard/kunjungan`,
      laporan: {
        keuangan: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/laporan/keuangan`,
        pasien: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/laporan/pasien`,
        operasi: `${import.meta.env.VITE_API_V2_URL || 'http://localhost:8010/api/v2'}/laporan/operasi`
      }
    }
  },

  // Default request configuration
  requestConfig: {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
}

export default config