// API Configuration
const getApiV2Url = () => {
  const envUrl = import.meta.env.VITE_API_V2_URL;

  // Deteksi Hostname secara dinamis
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // Jika diakses via IP Lokal atau Domain Publik
    if (host === '192.168.100.33' || host === 'sim.rsiaaisyiyah.com') {
      return `${protocol}//${host}/rsiapi-v2/api/v2`;
    }
  }

  // Fallback ke ENV atau Default Localhost
  return envUrl || 'http://localhost:8010/api/v2';
};

const DYNAMIC_API_V2_URL = getApiV2Url();

export const config = {
  // Public API URLs
  public: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010',
    API_V2_URL: DYNAMIC_API_V2_URL,
    API_VERSION: import.meta.env.VITE_API_VERSION || 'v2',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'RSIA - Sistem Informasi Rumah Sakit',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0'
  },

  // API Endpoints
  endpoints: {
    // Authentication
    auth: {
      login: `${DYNAMIC_API_V2_URL}/user/auth/login`,
      logout: `${DYNAMIC_API_V2_URL}/user/auth/logout`,
      refresh: `${DYNAMIC_API_V2_URL}/user/auth/refresh`,
      detail: `${DYNAMIC_API_V2_URL}/user/auth/detail`
    },

    // Patient Management
    pasien: {
      list: `${DYNAMIC_API_V2_URL}/pasien`,
      detail: (id) => `${DYNAMIC_API_V2_URL}/pasien/${id}`,
      create: `${DYNAMIC_API_V2_URL}/pasien/create`,
      update: (id) => `${DYNAMIC_API_V2_URL}/pasien/${id}/update`,
      delete: (id) => `${DYNAMIC_API_V2_URL}/pasien/${id}/delete`
    },

    // BPJS Integration
    bpjs: {
      // Rekam Medis
      rekammedis: {
        insert: `${DYNAMIC_API_V2_URL}/bpjs/rekammedis/insert`,
        update: `${DYNAMIC_API_V2_URL}/bpjs/rekammedis/update`,
        delete: `${DYNAMIC_API_V2_URL}/bpjs/rekammedis/delete`,
        get: (id) => `${DYNAMIC_API_V2_URL}/bpjs/rekammedis/${id}`
      },

      // SEP (Surat Eligibility Peserta)
      sep: {
        create: `${DYNAMIC_API_V2_URL}/bpjs/sep/create`,
        update: `${DYNAMIC_API_V2_URL}/bpjs/sep/update`,
        delete: `${DYNAMIC_API_V2_URL}/bpjs/sep/delete`,
        approve: `${DYNAMIC_API_V2_URL}/bpjs/sep/approve`
      },

      // Rujukan
      rujukan: {
        list: `${DYNAMIC_API_V2_URL}/bpjs/rujukan`,
        create: `${DYNAMIC_API_V2_URL}/bpjs/rujukan/create`,
        update: (id) => `${DYNAMIC_API_V2_URL}/bpjs/rujukan/${id}/update`
      }
    },

    // Pharmacy
    farmasi: {
      obat: {
        list: `${DYNAMIC_API_V2_URL}/farmasi/obat`,
        stok: `${DYNAMIC_API_V2_URL}/farmasi/stok`,
        create: `${DYNAMIC_API_V2_URL}/farmasi/obat/create`
      },
      resep: {
        create: `${DYNAMIC_API_V2_URL}/farmasi/resep/create`,
        list: `${DYNAMIC_API_V2_URL}/farmasi/resep`
      }
    },

    // Laboratory
    lab: {
      pemeriksaan: {
        create: `${DYNAMIC_API_V2_URL}/lab/pemeriksaan/create`,
        list: `${DYNAMIC_API_V2_URL}/lab/pemeriksaan`,
        result: (id) => `${DYNAMIC_API_V2_URL}/lab/pemeriksaan/${id}/result`
      }
    },

    // Kepegawaian
    kepegawaian: {
      pegawai: {
        list: `${DYNAMIC_API_V2_URL}/pegawai`,
        create: `${DYNAMIC_API_V2_URL}/pegawai/create`,
        update: (id) => `${DYNAMIC_API_V2_URL}/pegawai/${id}/update`
      },
      jadwal: {
        list: `${DYNAMIC_API_V2_URL}/pegawai/jadwal`,
        create: `${DYNAMIC_API_V2_URL}/pegawai/jadwal/create`
      }
    },

    // Menu Management
    menu: {
      list: `${DYNAMIC_API_V2_URL}/menu`,
      create: `${DYNAMIC_API_V2_URL}/menu/create`,
      update: (id) => `${DYNAMIC_API_V2_URL}/menu/${id}/update`,
      delete: (id) => `${DYNAMIC_API_V2_URL}/menu/${id}/delete`,
      tree: `${DYNAMIC_API_V2_URL}/menu/tree`,
      user: `${DYNAMIC_API_V2_URL}/menu/user`,
      reorder: `${DYNAMIC_API_V2_URL}/menu/reorder`,
      checkAccess: (menuId, permission) => `${DYNAMIC_API_V2_URL}/check-access/${menuId}/${permission}`
    },

    // Access Level & User Management
    accessLevel: {
      list: `${DYNAMIC_API_V2_URL}/access-level`,
      create: `${DYNAMIC_API_V2_URL}/access-level/create`,
      update: (id) => `${DYNAMIC_API_V2_URL}/access-level/${id}/update`,
      delete: (id) => `${DYNAMIC_API_V2_URL}/access-level/${id}/delete`,
      withPegawai: `${DYNAMIC_API_V2_URL}/access-level/with-petugas`,
      permissions: (accessLevelId) => `${DYNAMIC_API_V2_URL}/access-level/${accessLevelId}/permissions`
    },

    userAccess: {
      list: `${DYNAMIC_API_V2_URL}/user-access`,
      assign: `${DYNAMIC_API_V2_URL}/pegawai/access/assign`,
      remove: (nip, accessLevelId) => `${DYNAMIC_API_V2_URL}/pegawai/${nip}/access/${accessLevelId}`
    },

    // Pegawai Management
    pegawai: {
      list: `${DYNAMIC_API_V2_URL}/pegawai`,
      detail: (nip) => `${DYNAMIC_API_V2_URL}/pegawai/${nip}`,
      create: `${DYNAMIC_API_V2_URL}/pegawai/create`,
      update: (id) => `${DYNAMIC_API_V2_URL}/pegawai/${id}/update`,
      search: `${DYNAMIC_API_V2_URL}/pegawai/search`,
      statistics: `${DYNAMIC_API_V2_URL}/pegawai/statistics`,
      roles: (nip) => `${DYNAMIC_API_V2_URL}/pegawai/${nip}/roles`
    },

    // Dashboard & Reports
    dashboard: {
      stats: `${DYNAMIC_API_V2_URL}/dashboard/stats`,
      kunjungan: `${DYNAMIC_API_V2_URL}/dashboard/kunjungan`,
      laporan: {
        keuangan: `${DYNAMIC_API_V2_URL}/laporan/keuangan`,
        pasien: `${DYNAMIC_API_V2_URL}/laporan/pasien`,
        operasi: `${DYNAMIC_API_V2_URL}/laporan/operasi`
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