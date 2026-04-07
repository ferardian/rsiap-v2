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

  // Service Requests
  getServiceRequestRadiologi(params) {
    return api.get('/satusehat/servicerequest-radiology', { params })
  },
  syncServiceRequestRadiologi(data) {
    return api.post('/satusehat/servicerequest-radiology/sync', data)
  },
  pushOrthancRadiologi(data) {
    return api.post('/satusehat/servicerequest-radiology/push-orthanc', data)
  },

  // Medication Request
  getMedicationRequests(params) {
    return api.get('/satusehat/medication-request', { params })
  },
  syncMedicationRequest(data) {
    return api.post('/satusehat/medication-request/sync', data)
  },

  // Medication Dispense
  getMedicationDispenses(params) {
    return api.get('/satusehat/medication-dispense', { params })
  },
  syncMedicationDispense(data) {
    return api.post('/satusehat/medication-dispense/sync', data)
  },

  // Medication Statement
  getMedicationStatements(params) {
    return api.get('/satusehat/medication-statement', { params })
  },
  syncMedicationStatement(data) {
    return api.post('/satusehat/medication-statement/sync', data)
  },

  // Question Response Telaah Farmasi
  getQuestionResponseTelaahFarmasi(params) {
    return api.get('/satusehat/questionresponse-telaah-farmasi', { params })
  },
  syncQuestionResponseTelaahFarmasi(data) {
    return api.post('/satusehat/questionresponse-telaah-farmasi/sync', data)
  },

  // CarePlan
  getCarePlans(params) {
    return api.get('/satusehat/careplan', { params })
  },
  syncCarePlan(data) {
    return api.post('/satusehat/careplan/sync', data)
  },

  // Specimen Radiology
  getSpecimenRadiology(params) {
    return api.get('/satusehat/specimen-radiology', { params })
  },
  syncSpecimenRadiology(data) {
    return api.post('/satusehat/specimen-radiology/sync', data)
  },

  // Observation Radiology
  getObservationRadiology(params) {
    return api.get('/satusehat/observation-radiology', { params })
  },
  syncObservationRadiology(data) {
    return api.post('/satusehat/observation-radiology/sync', data)
  },

  // DiagnosticReport Radiology
  getDiagnosticReportRadiology(params) {
    return api.get('/satusehat/diagnosticreport-radiology', { params })
  },
  syncDiagnosticReportRadiology(data) {
    return api.post('/satusehat/diagnosticreport-radiology/sync', data)
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
  },

  // Location Mapping
  getDepartmentsMapped() {
    return api.get('/satusehat/location/departments')
  },
  getLocationRalan() {
    return api.get('/satusehat/location/ralan')
  },
  getLocationRanap() {
    return api.get('/satusehat/location/ranap')
  },
  getLocationGeneric() {
    return api.get('/satusehat/location/generic')
  },
  getLocationFarmasi() {
    return api.get('/satusehat/location/farmasi')
  },
  saveLocationMapping(data) {
    return api.post('/satusehat/location/mapping', data)
  },
  deleteLocationMapping(params) {
    return api.delete('/satusehat/location/mapping', { params })
  },

  // Episode of Care
  getEpisodeOfCare(params) {
    return api.get('/satusehat/episodeofcare', { params })
  },
  syncEpisodeOfCare(data) {
    return api.post('/satusehat/episodeofcare/sync', data)
  }
}

export default satuSehatService
