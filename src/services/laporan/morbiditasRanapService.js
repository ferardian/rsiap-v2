import axios from 'axios'

const morbiditasRanapService = {
    getData(params) {
        return axios.get('/laporan/statistik/ranap/morbiditas', { params })
    }
}

export { morbiditasRanapService }
