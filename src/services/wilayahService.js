import api from './api';

const wilayahService = {
  async searchPropinsi(query = '') {
    const { data } = await api.get('/wilayah/propinsi', { params: { q: query } });
    return data; // Assumes ApiResponse::success returns { data: [...] }
  },

  async searchKabupaten(query = '') {
    const { data } = await api.get('/wilayah/kabupaten', { params: { q: query } });
    return data;
  },

  async searchKecamatan(query = '') {
    const { data } = await api.get('/wilayah/kecamatan', { params: { q: query } });
    return data;
  },

  async searchKelurahan(query = '') {
    const { data } = await api.get('/wilayah/kelurahan', { params: { q: query } });
    return data;
  }
};

export default wilayahService;
