<template>
  <div>
    <div class="row mb-4 g-2">
      <div class="col-md-4 text-start">
        <v-select 
            :options="masterUtamaList" 
            label="nama_inmut" 
            v-model="filters.keyword"
            :reduce="item => item.nama_inmut"
            placeholder="Pilih Indikator Mutu"
            class="style-chooser"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                Tidak ada indikator ditemukan
            </template>
        </v-select>
      </div>
      <div class="col-md-8 d-flex justify-content-end align-items-center gap-2 filter-container">
        <div class="input-group date-filter" style="max-width: 250px;">
          <span class="input-group-text bg-white border-end-0">
             <i class="fas fa-calendar-alt text-muted"></i>
          </span>
          <input type="month" class="form-control border-start-0 ps-0" v-model="filters.bulan" @change="fetchData">
        </div>
        
        <v-select 
            :options="units" 
            label="nama_ruang" 
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit / Ruang"
            class="style-chooser unit-select"
            style="min-width: 200px;"
            :disabled="isUnitLocked"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>

        <button class="btn btn-primary refresh-btn" @click="fetchData" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <MonitoringTable 
        :items="items" 
        :loading="loading"
        :total="total"
        :page="page"
        :limit="limit"
        :totalPages="totalPages"
        @change-page="changePage"
        @detail="showDetail"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'
import MonitoringTable from '@/components/indikator-mutu/MonitoringTable.vue'

const authStore = useAuthStore()
const toast = useToast()
const items = ref([])
const units = ref([])
const masterUtamaList = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const userCommittees = ref([])

const userDepId = computed(() => {
    return authStore.user?.data?.detail?.dep_id || 
           authStore.user?.detail?.dep_id || 
           authStore.user?.dep_id || 
           ''
})

const checkCommittee = async () => {
    const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
    if (userNik) {
        try {
            const commRes = await committeeService.getByNik(userNik)
            userCommittees.value = commRes.data.data || []
        } catch (error) {
            console.error('Error checking committee:', error)
        }
    }
}

const isKomiteMutu = computed(() => {
    const role = (authStore.userRole || '').toLowerCase();
    const userDep = String(userDepId.value).toLowerCase();

    const isPmkpDep = userDep.includes('pmkp') || 
                      userDep.includes('komite mutu') || 
                      userDep.includes('komite pmkp') ||
                      userDep === 'pmkp' ||
                      userDep === 'kkm';

    const isPmkpRole = role === 'pmkp' || 
                       role === 'komite_pmkp' || 
                       role === 'komite_mutu' || 
                       role.includes('komite_pmkp');

    const isPmkpCommittee = userCommittees.value && userCommittees.value.some(c => {
        const name = (c.komite?.nama || c.nama || '').toUpperCase();
        return name.includes('PMKP') || name.includes('KOMITE MUTU');
    });

    return isPmkpDep || isPmkpRole || isPmkpCommittee;
})

const isUnitLocked = computed(() => {
    return !isKomiteMutu.value && !!userDepId.value;
})

const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    unit: null,
    keyword: ''
})

const fetchMasterUtama = async () => {
    try {
        const response = await api.getUtama({ limit: 1000, status: '1' })
        masterUtamaList.value = response.data.data.data || []
    } catch (error) {
        console.error('Error fetching master utama:', error)
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            bulan: filters.bulan,
            dep_id: filters.unit,
            keyword: filters.keyword
        }
        const response = await api.getMonitoring(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data monitoring')
    } finally {
        loading.value = false
    }
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const showDetail = (item) => {
    toast.info('Fitur Analisa / Detail akan segera hadir')
}

onMounted(async () => {
    await checkCommittee()
    await fetchUnits()
    await fetchMasterUtama()
    
    if (isUnitLocked.value) {
        filters.unit = userDepId.value
    }
    
    fetchData()
})
</script>

<style>
.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  padding: 2px 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    margin-top: 1rem !important;
  }

  .date-filter {
    max-width: 100% !important;
    width: 100% !important;
  }

  .unit-select {
    min-width: 100% !important;
    width: 100% !important;
  }

  .refresh-btn {
    width: 100% !important;
  }
}
</style>
