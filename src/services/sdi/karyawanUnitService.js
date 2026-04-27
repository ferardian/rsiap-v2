import api from '../api';

export const karyawanUnitService = {
  getKaryawanByUnit(departemen) {
    return api.get(`/pegawai/unit`, {
      params: { departemen }
    });
  }
};
