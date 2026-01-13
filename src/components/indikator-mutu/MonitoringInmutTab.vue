<template>
  <div>
    <div class="row mb-4">
      <div class="col-md-6">
         <!-- Left side content if any -->
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
        <div class="input-group" style="max-width: 250px;">
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
            class="style-chooser"
            style="min-width: 200px;"
            @update:modelValue="fetchData"
        >
             <template #no-options="{ search, searching, loading }">
                No unit found
            </template>
        </v-select>

        <button class="btn btn-primary" @click="fetchData" title="Refresh">
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
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import MonitoringTable from '@/components/indikator-mutu/MonitoringTable.vue'

const toast = useToast()
const items = ref([])
const units = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const filters = reactive({
    bulan: new Date().toISOString().slice(0, 7), // YYYY-MM
    unit: null
})

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
            dep_id: filters.unit
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

onMounted(() => {
    fetchUnits()
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
</style>
