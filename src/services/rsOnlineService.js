import api from './api'

const rsOnlineService = {
  getRefTempatTidur: () => api.get('/rs-online/ref-tempat-tidur')
}

export default rsOnlineService
