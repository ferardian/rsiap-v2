import api from './api';

const publicWilayahService = {
  async getProvinces() {
    try {
      const resp = await api.get('/satusehat/wilayah/proxy', { 
        params: { endpoint: 'provinces.json' } 
      });
      return resp.data.data || [];
    } catch (error) {
      console.error('getProvinces Error:', error);
      return [];
    }
  },

  async getRegencies(provinceId) {
    if (!provinceId) return [];
    try {
      const resp = await api.get('/satusehat/wilayah/proxy', { 
        params: { endpoint: `regencies/${provinceId}.json` } 
      });
      return resp.data.data || [];
    } catch (error) {
      console.error('getRegencies Error:', error);
      return [];
    }
  },

  async getDistricts(regencyId) {
    if (!regencyId) return [];
    try {
      const resp = await api.get('/satusehat/wilayah/proxy', { 
        params: { endpoint: `districts/${regencyId}.json` } 
      });
      return resp.data.data || [];
    } catch (error) {
      console.error('getDistricts Error:', error);
      return [];
    }
  },

  async getVillages(districtId) {
    if (!districtId) return [];
    try {
      const resp = await api.get('/satusehat/wilayah/proxy', { 
        params: { endpoint: `villages/${districtId}.json` } 
      });
      return resp.data.data || [];
    } catch (error) {
      console.warn(`getVillages: Data not found for district ${districtId}`);
      return [];
    }
  }
};

export default publicWilayahService;

