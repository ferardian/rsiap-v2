import api from '../api'

const morbiditasRanapService = {
    getData(params) {
        return api.get('/laporan/statistik/ranap/morbiditas', { params })
    }
}

export { morbiditasRanapService }
