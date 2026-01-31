import api from './api';

const ranapStatistikService = {
    getIndicators(params) {
        return api.get('/laporan/statistik/ranap/indicators', { params });
    },

    getYearlyIndicators(params) {
        return api.get('/laporan/statistik/ranap/indicators/yearly', { params });
    }
};

export default ranapStatistikService;
