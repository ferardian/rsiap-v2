<template>
  <div class="tab-container">
    <div class="section-tabs overflow-x-auto">
      <button 
        @click="activeSection = 'perbaikan'"
        :class="['section-tab', { active: activeSection === 'perbaikan' }]"
      >
        <span class="text-nowrap">Perbaikan Inventaris</span>
      </button>
      <button 
        @click="activeSection = 'pemeliharaan'"
        :class="['section-tab', { active: activeSection === 'pemeliharaan' }]"
      >
        <span class="text-nowrap">Pemeliharaan Inventaris</span>
      </button>
    </div>

    <!-- Perbaikan Inventaris Section -->
    <div v-if="activeSection === 'perbaikan'" class="section-content">
      <div class="header-action">
        <div class="search-box">
          <input 
            v-model="searchPerbaikan" 
            @input="fetchPerbaikan"
            type="text" 
            placeholder="Cari No Permintaan / Uraian..." 
            class="form-input"
          >
        </div>
        <button @click="openPerbaikanModal" class="btn-add">
          <i class="fas fa-plus"></i> {{ isMobile ? 'Perbaikan' : 'Tambah Perbaikan' }}
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>No Permintaan</th>
              <th>Tanggal</th>
              <th>Uraian Kegiatan</th>
              <th>Pelaksana</th>
              <th>Biaya</th>
              <th>Status</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingPerbaikan">
              <td colspan="7" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="perbaikanItems.length === 0">
              <td colspan="7" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="item in perbaikanItems" :key="item.no_permintaan">
              <td class="font-mono">{{ item.no_permintaan }}</td>
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ item.uraian_kegiatan }}</td>
              <td>
                <div class="text-sm">{{ item.pelaksana }}</div>
                <div class="text-xs text-slate-500">{{ item.petugas?.nama || '-' }}</div>
              </td>
              <td>{{ formatCurrency(item.biaya) }}</td>
              <td>
                <span :class="['status-badge', item.status === 'Bisa Diperbaiki' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button @click="editPerbaikan(item)" class="btn-icon text-blue"><i class="fas fa-edit"></i></button>
                  <button @click="deletePerbaikan(item.no_permintaan)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pemeliharaan Inventaris Section -->
    <div v-if="activeSection === 'pemeliharaan'" class="section-content">
      <div class="header-action">
        <div class="search-box">
          <input 
            v-model="searchPemeliharaan" 
            @input="fetchPemeliharaan"
            type="text" 
            placeholder="Cari No Inventaris / Uraian..." 
            class="form-input"
          >
        </div>
        <button @click="openPemeliharaanModal" class="btn-add">
          <i class="fas fa-plus"></i> {{ isMobile ? 'Pemeliharaan' : 'Tambah Pemeliharaan' }}
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>No Inventaris</th>
              <th>Tanggal</th>
              <th>Uraian Kegiatan</th>
              <th>Jenis Pemeliharaan</th>
              <th>Pelaksana</th>
              <th>Biaya</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingPemeliharaan">
              <td colspan="7" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="pemeliharaanItems.length === 0">
              <td colspan="7" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="item in pemeliharaanItems" :key="`${item.no_inventaris}-${item.tanggal}`">
              <td class="font-mono">{{ item.no_inventaris }}</td>
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>{{ item.uraian_kegiatan }}</td>
              <td><span class="badge-jenis">{{ item.jenis_pemeliharaan }}</span></td>
              <td>
                <div class="text-sm">{{ item.pelaksana }}</div>
                <div class="text-xs text-slate-500">{{ item.petugas?.nama || '-' }}</div>
              </td>
              <td>{{ formatCurrency(item.biaya) }}</td>
              <td>
                <div class="action-group">
                  <button @click="editPemeliharaan(item)" class="btn-icon text-blue"><i class="fas fa-edit"></i></button>
                  <button @click="deletePemeliharaan(item)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Perbaikan -->
    <div v-if="showPerbaikanModal" class="modal-overlay" @click.self="closePerbaikanModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditPerbaikan ? 'Edit' : 'Tambah' }} Perbaikan Inventaris</h3>
          <button @click="closePerbaikanModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="savePerbaikan">
          <div class="modal-body">
            <div class="form-group">
              <label>No Permintaan <span class="text-red">*</span></label>
              <SearchableSelect 
                v-model="formPerbaikan.no_permintaan" 
                :options="formattedOptPermintaan" 
                label-key="label" 
                value-key="no_permintaan" 
                placeholder="Pilih Permintaan Perbaikan" 
                :disabled="isEditPerbaikan"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal <span class="text-red">*</span></label>
                <input v-model="formPerbaikan.tanggal" type="date" class="form-input" required>
              </div>
              <div class="form-group">
                <label>Biaya</label>
                <input v-model.number="formPerbaikan.biaya" type="number" class="form-input" min="0">
              </div>
            </div>

            <div class="form-group">
              <label>Uraian Kegiatan <span class="text-red">*</span></label>
              <textarea v-model="formPerbaikan.uraian_kegiatan" class="form-textarea" rows="3" required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pelaksana <span class="text-red">*</span></label>
                <select v-model="formPerbaikan.pelaksana" class="form-select" required>
                  <option value="Teknisi Rumah Sakit">Teknisi Rumah Sakit</option>
                  <option value="Teknisi Rujukan">Teknisi Rujukan</option>
                  <option value="Pihak ke III">Pihak ke III</option>
                </select>
              </div>
              <div class="form-group">
                <label>Petugas (NIP)</label>
                <SearchableSelect 
                  v-model="formPerbaikan.nip" 
                  :options="formattedOptPetugas" 
                  label-key="label" 
                  value-key="nip" 
                  placeholder="Pilih Petugas" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Status <span class="text-red">*</span></label>
                <select v-model="formPerbaikan.status" class="form-select" required>
                  <option value="Bisa Diperbaiki">Bisa Diperbaiki</option>
                  <option value="Tidak Bisa Diperbaiki">Tidak Bisa Diperbaiki</option>
                </select>
              </div>
              <div class="form-group">
                <label>Keterangan</label>
                <input v-model="formPerbaikan.keterangan" type="text" class="form-input">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closePerbaikanModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="processingPerbaikan">
              {{ processingPerbaikan ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pemeliharaan -->
    <div v-if="showPemeliharaanModal" class="modal-overlay" @click.self="closePemeliharaanModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditPemeliharaan ? 'Edit' : 'Tambah' }} Pemeliharaan Inventaris</h3>
          <button @click="closePemeliharaanModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="savePemeliharaan">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>No Inventaris <span class="text-red">*</span></label>
                <SearchableSelect 
                  v-model="formPemeliharaan.no_inventaris" 
                  :options="formattedOptInventaris" 
                  label-key="label" 
                  value-key="no_inventaris" 
                  placeholder="Pilih Inventaris" 
                  :disabled="isEditPemeliharaan"
                />
              </div>
              <div class="form-group">
                <label>Tanggal <span class="text-red">*</span></label>
                <input v-model="formPemeliharaan.tanggal" type="date" class="form-input" required :disabled="isEditPemeliharaan">
              </div>
            </div>

            <div class="form-group">
              <label>Uraian Kegiatan <span class="text-red">*</span></label>
              <textarea v-model="formPemeliharaan.uraian_kegiatan" class="form-textarea" rows="3" required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Jenis Pemeliharaan <span class="text-red">*</span></label>
                <select v-model="formPemeliharaan.jenis_pemeliharaan" class="form-select" required>
                  <option value="Running Maintenance">Running Maintenance</option>
                  <option value="Shut Down Maintenance">Shut Down Maintenance</option>
                  <option value="Emergency Maintenance">Emergency Maintenance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Biaya</label>
                <input v-model.number="formPemeliharaan.biaya" type="number" class="form-input" min="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pelaksana <span class="text-red">*</span></label>
                <select v-model="formPemeliharaan.pelaksana" class="form-select" required>
                  <option value="Teknisi Rumah Sakit">Teknisi Rumah Sakit</option>
                  <option value="Teknisi Rujukan">Teknisi Rujukan</option>
                  <option value="Pihak ke III">Pihak ke III</option>
                </select>
              </div>
              <div class="form-group">
                <label>Petugas (NIP)</label>
                <SearchableSelect 
                  v-model="formPemeliharaan.nip" 
                  :options="formattedOptPetugas" 
                  label-key="label" 
                  value-key="nip" 
                  placeholder="Pilih Petugas" 
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closePemeliharaanModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="processingPemeliharaan">
              {{ processingPemeliharaan ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { asetPemeliharaanService } from '@/services/asetPemeliharaanService'
import { asetInventarisService } from '@/services/asetInventarisService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const props = defineProps({
  isMobile: Boolean
})

const activeSection = ref('perbaikan')

// Perbaikan state
const perbaikanItems = ref([])
const loadingPerbaikan = ref(false)
const searchPerbaikan = ref('')
const showPerbaikanModal = ref(false)
const isEditPerbaikan = ref(false)
const processingPerbaikan = ref(false)
const formPerbaikan = reactive({
    no_permintaan: '',
    tanggal: '',
    uraian_kegiatan: '',
    nip: '',
    pelaksana: 'Teknisi Rumah Sakit',
    biaya: 0,
    keterangan: '',
    status: 'Bisa Diperbaiki'
})

// Pemeliharaan state
const pemeliharaanItems = ref([])
const loadingPemeliharaan = ref(false)
const searchPemeliharaan = ref('')
const showPemeliharaanModal = ref(false)
const isEditPemeliharaan = ref(false)
const processingPemeliharaan = ref(false)
const formPemeliharaan = reactive({
    no_inventaris: '',
    tanggal: '',
    uraian_kegiatan: '',
    nip: '',
    pelaksana: 'Teknisi Rumah Sakit',
    biaya: 0,
    jenis_pemeliharaan: 'Running Maintenance'
})

// Options
const optPermintaan = ref([])
const optInventaris = ref([])
const optPetugas = ref([])

const formattedOptInventaris = computed(() => {
    return optInventaris.value.map(item => ({
        ...item,
        label: `${item.no_inventaris} - ${item.barang?.nama_barang || ''}`
    }))
})

const formattedOptPetugas = computed(() => {
    return optPetugas.value.map(p => ({
        ...p,
        label: `${p.nip} - ${p.nama}`
    }))
})

const formattedOptPermintaan = computed(() => {
    return optPermintaan.value.map(item => ({
        ...item,
        label: `${item.no_permintaan} - ${item.inventaris?.barang?.nama_barang || 'Barang tidak diketahui'}`
    }))
})

// Perbaikan methods
const fetchPerbaikan = async () => {
  loadingPerbaikan.value = true
  try {
    const res = await asetPemeliharaanService.getPerbaikanInventaris({ search: searchPerbaikan.value, limit: 100 })
    if (res.data.data) {
      perbaikanItems.value = res.data.data.data || res.data.data || []
    }
  } catch(e) { console.error(e) }
  finally { loadingPerbaikan.value = false }
}

const fetchOptions = async () => {
    try {
        const [resPermintaan, resInv, resPetugas] = await Promise.all([
            asetPemeliharaanService.getPermintaanPerbaikan({ limit: 1000 }),
            asetInventarisService.getInventaris({ limit: 1000 }),
            import('@/services/pegawaiService').then(m => m.pegawaiService.getPegawai(1, 1000))
        ])
        if(resPermintaan.data.data) optPermintaan.value = resPermintaan.data.data.data || []
        if(resInv.data.data) {
            const list = resInv.data.data.data || resInv.data.data || []
            optInventaris.value = list
        }
        if(resPetugas.data.data) {
            optPetugas.value = resPetugas.data.data || []
        }
    } catch(e) { console.error('Gagal fetch options', e) }
}

const openPerbaikanModal = () => {
    isEditPerbaikan.value = false
    resetFormPerbaikan()
    fetchOptions()
    showPerbaikanModal.value = true
}

const closePerbaikanModal = () => {
    showPerbaikanModal.value = false
}

const editPerbaikan = (item) => {
    isEditPerbaikan.value = true
    Object.assign(formPerbaikan, {
        no_permintaan: item.no_permintaan,
        tanggal: item.tanggal,
        uraian_kegiatan: item.uraian_kegiatan,
        nip: item.nip,
        pelaksana: item.pelaksana,
        biaya: item.biaya,
        keterangan: item.keterangan,
        status: item.status
    })
    fetchOptions()
    showPerbaikanModal.value = true
}

const resetFormPerbaikan = () => {
    Object.assign(formPerbaikan, {
        no_permintaan: '',
        tanggal: new Date().toISOString().split('T')[0],
        uraian_kegiatan: '',
        nip: '',
        pelaksana: 'Teknisi Rumah Sakit',
        biaya: 0,
        keterangan: '',
        status: 'Bisa Diperbaiki'
    })
}

const savePerbaikan = async () => {
    processingPerbaikan.value = true
    try {
        if (isEditPerbaikan.value) {
            await asetPemeliharaanService.updatePerbaikanInventaris(formPerbaikan.no_permintaan, formPerbaikan)
        } else {
            await asetPemeliharaanService.createPerbaikanInventaris(formPerbaikan)
        }
        closePerbaikanModal()
        fetchPerbaikan()
    } catch(e) {
        alert('Gagal simpan: ' + (e.response?.data?.message || e.message))
    } finally {
        processingPerbaikan.value = false
    }
}

const deletePerbaikan = async (id) => {
    if(!confirm('Hapus data perbaikan ini?')) return
    try {
        await asetPemeliharaanService.deletePerbaikanInventaris(id)
        fetchPerbaikan()
    } catch(e) { alert('Gagal hapus') }
}

// Pemeliharaan methods
const fetchPemeliharaan = async () => {
  loadingPemeliharaan.value = true
  try {
    const res = await asetPemeliharaanService.getPemeliharaanInventaris({ search: searchPemeliharaan.value, limit: 100 })
    if (res.data.data) pemeliharaanItems.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loadingPemeliharaan.value = false }
}

const openPemeliharaanModal = () => {
    isEditPemeliharaan.value = false
    resetFormPemeliharaan()
    fetchOptions()
    showPemeliharaanModal.value = true
}

const closePemeliharaanModal = () => {
    showPemeliharaanModal.value = false
}

const editPemeliharaan = (item) => {
    isEditPemeliharaan.value = true
    Object.assign(formPemeliharaan, {
        no_inventaris: item.no_inventaris,
        tanggal: item.tanggal,
        uraian_kegiatan: item.uraian_kegiatan,
        nip: item.nip,
        pelaksana: item.pelaksana,
        biaya: item.biaya,
        jenis_pemeliharaan: item.jenis_pemeliharaan
    })
    fetchOptions()
    showPemeliharaanModal.value = true
}

const resetFormPemeliharaan = () => {
    Object.assign(formPemeliharaan, {
        no_inventaris: '',
        tanggal: new Date().toISOString().split('T')[0],
        uraian_kegiatan: '',
        nip: '',
        pelaksana: 'Teknisi Rumah Sakit',
        biaya: 0,
        jenis_pemeliharaan: 'Running Maintenance'
    })
}

const savePemeliharaan = async () => {
    processingPemeliharaan.value = true
    try {
        if (isEditPemeliharaan.value) {
            await asetPemeliharaanService.updatePemeliharaanInventaris(formPemeliharaan)
        } else {
            await asetPemeliharaanService.createPemeliharaanInventaris(formPemeliharaan)
        }
        closePemeliharaanModal()
        fetchPemeliharaan()
    } catch(e) {
        alert('Gagal simpan: ' + (e.response?.data?.message || e.message))
    } finally {
        processingPemeliharaan.value = false
    }
}

const deletePemeliharaan = async (item) => {
    if(!confirm('Hapus data pemeliharaan ini?')) return
    try {
        await asetPemeliharaanService.deletePemeliharaanInventaris({
            no_inventaris: item.no_inventaris,
            tanggal: item.tanggal
        })
        fetchPemeliharaan()
    } catch(e) { alert('Gagal hapus') }
}

const formatDate = (date) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('id-ID')
}

const formatCurrency = (val) => {
    if (!val) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}

onMounted(() => {
    fetchPerbaikan()
    fetchPemeliharaan()
})
</script>

<style scoped>
.section-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: thin;
  padding-bottom: 5px;
}

.section-tabs::-webkit-scrollbar {
  height: 4px;
}

.section-tabs::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.section-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.section-tab:hover {
  color: #3b82f6;
}

.section-tab {
  white-space: nowrap;
  flex-shrink: 0;
}

.section-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.section-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.header-action { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 1rem; 
  gap: 1rem;
}

@media (max-width: 768px) {
  .header-action {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100% !important;
  }
}

.search-box { flex: 1; max-width: 300px; }
.form-input { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.form-select { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; }
.form-textarea { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.table-responsive { overflow-x: auto; overflow-y: auto; max-height: 600px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; font-weight: 600; color: #475569; position: sticky; top: 0; z-index: 10; }

.font-mono { font-family: monospace; }
.text-sm { font-size: 0.85rem; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }

.status-badge { padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.bg-green-100 { background: #dcfce7; } .text-green-700 { color: #15803d; }
.bg-red-100 { background: #fee2e2; } .text-red-700 { color: #b91c1c; }

.badge-jenis { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; background: #dbeafe; color: #1e40af; font-weight: 500; }

.action-group { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-center { text-align: center; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { background: white; border-radius: 10px; width: 100%; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; overflow-y: auto; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.text-red { color: #ef4444; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
