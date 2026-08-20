<template>
  <div class="monitoring-validasi-container">
    <!-- Top Filter Bar -->
    <div class="row mb-4 g-2 align-items-center justify-content-between">
      <div class="col-md-5">
        <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i class="fas fa-check-circle text-primary"></i> Monitoring Validasi Data Unit
        </h5>
        <small class="text-muted">Pantau status verifikasi dan kesepakatan data (Agreement Rate)</small>
      </div>

      <div class="col-md-7 d-flex justify-content-end align-items-center gap-2 filter-container">
        <!-- Date filter -->
        <div class="input-group date-filter" style="max-width: 220px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="month" class="form-control border-start-0 ps-0" v-model="filters.bulan">
        </div>
        
        <!-- Unit Select -->
        <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang..."
            class="style-chooser unit-select"
            style="min-width: 220px;"
        >
             <template #no-options="{ search, searching, loading }">
                Unit tidak ditemukan
            </template>
        </v-select>

        <button class="btn btn-primary refresh-btn" @click="refreshTab" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- ValidasiDataTab Component -->
    <div v-if="!filters.unit" class="text-center py-5 text-muted card border-0 shadow-sm rounded-4">
      <i class="fas fa-hospital-user fa-3x mb-3 opacity-40"></i>
      <p class="mb-0">Silahkan pilih unit / ruangan terlebih dahulu untuk melihat data validasi.</p>
    </div>

    <ValidasiDataTab 
      v-else
      :key="`${filters.unit}-${filters.bulan}-${refreshKey}`"
      :dep-id="filters.unit"
      :monthly-date="filters.bulan"
      :user-nik="userNik"
      :is-committee-member="isCommitteeMember"
      :active-unit-info="activeUnitInfo"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import ValidasiDataTab from '@/components/indikator-mutu/ValidasiDataTab.vue'

const authStore = useAuthStore()
const units = ref([])
const isCommitteeMember = ref(false)
const userCommittees = ref([])
const refreshKey = ref(0)

const userNik = computed(() => authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik || '')
const userDepNameOrId = computed(() => authStore.user?.data?.detail?.departemen || authStore.user?.detail?.departemen || authStore.user?.dep_id || '')

const filters = reactive({
  bulan: new Date().toISOString().slice(0, 7),
  unit: null
})

const activeUnitInfo = computed(() => {
  if (!filters.unit || !units.value.length) return null
  return units.value.find(u => u.dep_id === filters.unit) || null
})

const fetchUnits = async () => {
  try {
    const res = await api.getUnits()
    units.value = res.data.data || []
    
    // Default unit selection
    if (userDepNameOrId.value) {
      const myUnit = units.value.find(u => u.dep_id === userDepNameOrId.value || u.nama_ruang === userDepNameOrId.value)
      if (myUnit) {
        filters.unit = myUnit.dep_id
      }
    }
    if (units.value.length > 0 && !filters.unit) {
      filters.unit = units.value[0].dep_id
    }
  } catch (error) {
    console.error('Error fetching units:', error)
  }
}

const checkCommittee = async () => {
  if (userNik.value) {
    try {
      const commRes = await committeeService.getByNik(userNik.value)
      if (commRes.data.success && commRes.data.data.length > 0) {
        userCommittees.value = commRes.data.data
        const hasPmkpCommittee = userCommittees.value.some(c => {
          const name = (c.komite?.nama || c.nama || '').toUpperCase()
          return name.includes('PMKP') || name.includes('MUTU') || name.includes('KOMITE')
        })
        if (hasPmkpCommittee || commRes.data.data.length > 0) {
          isCommitteeMember.value = true
        }
      }
    } catch (e) {
      console.error('Error check committee:', e)
    }
  }
}

const refreshTab = () => {
  refreshKey.value++
}

onMounted(() => {
  fetchUnits()
  checkCommittee()
})
</script>

<style scoped>
.filter-container {
  display: flex;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    margin-top: 1rem !important;
  }

  .date-filter, .unit-select, .refresh-btn {
    max-width: 100% !important;
    width: 100% !important;
  }
}
</style>
