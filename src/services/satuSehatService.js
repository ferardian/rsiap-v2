import api from './api'

export const satuSehatService = {
  getEncounter(params) {
    return api.get('/satusehat/encounter', { params })
  },
  getUnsyncedPatients(params) {
    return api.get('/satusehat/patient/unsynced', { params })
  },
  registerPatient(data) {
    return api.post('/satusehat/patient/register', data)
  },
  syncEncounter(data) {
    return api.post('/satusehat/encounter/sync', data)
  },

  // Observation
  getObservations(params) {
    return api.get('/satusehat/observation', { params })
  },
  syncObservation(data) {
    return api.post('/satusehat/observation/sync', data)
  },

  // Condition (Diagnosis)
  getConditions(params) {
    return api.get('/satusehat/condition', { params })
  },
  syncCondition(data) {
    return api.post('/satusehat/condition/sync', data)
  },

  // Procedure
  getProcedures(params) {
    return api.get('/satusehat/procedure', { params })
  },
  syncProcedure(data) {
    return api.post('/satusehat/procedure/sync', data)
  },

  // Medication Request
  getMedicationRequests(params) {
    return api.get('/satusehat/medication-request', { params })
  },
  syncMedicationRequest(data) {
    return api.post('/satusehat/medication-request/sync', data)
  },

  // Dashboard
  getDashboard() {
    return api.get('/satusehat/dashboard')
  },

  // KFA Mapping
  getKfaObatLokal(params) {
    return api.get('/satusehat/kfa/obat-lokal', { params })
  },
  searchKfa(params) {
    return api.get('/satusehat/kfa/search', { params })
  },
  saveKfaMapping(data) {
    return api.post('/satusehat/kfa/mapping', data)
  },
  deleteKfaMapping(kodeBrng) {
    return api.delete(`/satusehat/kfa/mapping/${kodeBrng}`)
  },
  syncKfaMedication(data) {
    return api.post('/satusehat/kfa/medication/sync', data)
  }
}

export default satuSehatService
