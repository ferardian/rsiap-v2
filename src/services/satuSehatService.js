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
  updatePacsAccessionRadiologi(data) {
    return api.post('/satusehat/servicerequest-radiology/update-pacs-accession', data)
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
  },

  // Mapping Radiologi
  getMappingRadiologi(params) {
    return api.get('/satusehat/mapping-radiologi', { params })
  },
  showMappingRadiologi(id) {
    return api.get(`/satusehat/mapping-radiologi/${id}`)
  },
  saveMappingRadiologi(data) {
    return api.post('/satusehat/mapping-radiologi', data)
  },
  deleteMappingRadiologi(id) {
    return api.delete(`/satusehat/mapping-radiologi/${id}`)
  },
  searchAiRadiologi(data) {
    return api.post('/satusehat/mapping-radiologi/ai-search', data)
  },

  // Mapping Lab
  getMappingLab(params) {
    return api.get('/satusehat/mapping-lab', { params })
  },
  saveMappingLab(data) {
    return api.post('/satusehat/mapping-lab', data)
  },
  deleteMappingLab(id) {
    return api.delete(`/satusehat/mapping-lab/${id}`)
  },
  searchAiLab(data) {
    return api.post('/satusehat/mapping-lab/ai-search', data)
  },

  // ServiceRequest Lab
  getServiceRequestLab(params) {
    return api.get('/satusehat/servicerequest-lab', { params })
  },
  sendServiceRequestLab(data) {
    return api.post('/satusehat/servicerequest-lab/send', data)
  },
  syncServiceRequestLab(data) {
    return api.post('/satusehat/servicerequest-lab/sync', data)
  },

  // Specimen Lab
  getSpecimenLab(params) {
    return api.get('/satusehat/specimen-lab', { params })
  },
  sendSpecimenLab(data) {
    return api.post('/satusehat/specimen-lab/send', data)
  },
  syncSpecimenLab(data) {
    return api.post('/satusehat/specimen-lab/sync', data)
  },

  // Observation Lab PK
  getObservationLab(params) {
    return api.get('/satusehat/observation-lab', { params })
  },
  sendObservationLab(data) {
    return api.post('/satusehat/observation-lab/send', data)
  },
  syncObservationLab(data) {
    return api.post('/satusehat/observation-lab/sync', data)
  },

  // DiagnosticReport Lab PK
  getDiagnosticReportLab(params) {
    return api.get('/satusehat/diagnosticreport-lab', { params })
  },
  sendDiagnosticReportLab(data) {
    return api.post('/satusehat/diagnosticreport-lab/send', data)
  },
  syncDiagnosticReportLab(data) {
    return api.post('/satusehat/diagnosticreport-lab/sync', data)
  }
}

export default satuSehatService
