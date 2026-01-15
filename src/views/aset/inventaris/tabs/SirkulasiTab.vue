<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
         <input 
            v-model="search" 
            @input="fetchData"
            type="text" 
            placeholder="Cari Peminjam / Barang..." 
            class="form-input"
          >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> {{ isMobile ? 'Pinjam' : 'Pinjam Barang' }}
      </button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Peminjam</th>
            <th>Item Inventaris</th>
            <th>Tgl Pinjam</th>
            <th>Tgl Kembali</th>
            <th>Status</th>
            <th width="100">Aksi</th>
          </tr>
        </thead>
        <tbody>
           <tr v-if="loading">
              <td colspan="6" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="(item, idx) in items" :key="idx">
              <td>
                <div class="font-bold">{{ item.peminjam }}</div>
                <div class="text-xs text-slate-500">{{ item.nip }}</div>
              </td>
               <td>
                <div class="font-medium">{{ item.inventaris?.barang?.nama_barang }}</div>
                <div class="text-xs text-slate-500 font-mono">{{ item.no_inventaris }}</div>
              </td>
              <td>{{ formatDate(item.tgl_pinjam) }}</td>
              <td>{{ item.tgl_kembali ? formatDate(item.tgl_kembali) : '-' }}</td>
               <td>
                <span class="status-badge" :class="item.status_pinjam === 'Masih Dipinjam' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'">
                  {{ item.status_pinjam }}
                </span>
              </td>
              <td>
                <button v-if="item.status_pinjam === 'Masih Dipinjam'" @click="returnItem(item)" class="btn-sm bg-blue-500 text-white">
                  Kembalikan
                </button>
              </td>
            </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Peminjaman -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Pinjam Barang</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>Peminjam <span class="text-red">*</span></label>
              <input v-model="form.peminjam" type="text" class="form-input" required placeholder="Nama Peminjam">
            </div>
             <div class="form-group">
              <label>No. Telepon / HP</label>
              <input v-model="form.tlp" type="text" class="form-input" placeholder="08...">
            </div>
            
            <div class="form-group">
              <label>Item Inventaris <span class="text-red">*</span></label>
               <SearchableSelect 
                  v-model="form.no_inventaris" 
                  :options="formattedOptItems" 
                  label-key="label" 
                  value-key="no_inventaris" 
                  placeholder="Pilih Item (Cari No / Nama)" 
               />
            </div>

            <div class="form-group">
              <label>Tgl Pinjam <span class="text-red">*</span></label>
              <input v-model="form.tgl_pinjam" type="date" class="form-input" required>
            </div>
             <div class="form-group">
              <label>Rencana Kembali</label>
              <input v-model="form.tgl_kembali" type="date" class="form-input">
              <small class="text-hint">Isi jika sudah ada rencana tanggal kembali</small>
            </div>
            <div class="form-group">
                <label>Petugas (NIP)</label>
                <SearchableSelect 
                  v-model="form.nip" 
                  :options="formattedOptPegawai" 
                  label-key="label" 
                  value-key="nip" 
                  placeholder="Pilih Petugas (Cari Nama / NIK)" 
                />
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="processing">
              {{ processing ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { asetInventarisService } from '@/services/asetInventarisService'
import { pegawaiService } from '@/services/pegawaiService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const props = defineProps({
  isMobile: Boolean
})

const items = ref([])
const loading = ref(false)
const search = ref('')

// Modal & Form
const showModal = ref(false)
const processing = ref(false)
const form = reactive({
    peminjam: '',
    tlp: '',
    no_inventaris: '',
    tgl_pinjam: '',
    tgl_kembali: '',
    nip: '',
    status_pinjam: 'Masih Dipinjam'
})

// Options
const optItems = ref([])
const optPegawai = ref([]) 

const formattedOptItems = computed(() => {
    return optItems.value.map(item => ({
        ...item,
        label: `${item.no_inventaris} - ${item.barang?.nama_barang || ''} (${item.ruang?.nama_ruang || ''})`
    }))
})

const formattedOptPegawai = computed(() => {
    return optPegawai.value.map(p => ({
        ...p,
        label: `${p.nip} - ${p.nama}`
    }))
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetInventarisService.getPeminjaman({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
    try {
        const [resItems, resPegawai] = await Promise.all([
             asetInventarisService.getInventaris({ limit: 1000 }),
             pegawaiService.getPegawai(1, 1000)
        ])
        
        if(resItems.data.data) {
             // Inventaris response is mapped via standard ApiResponse -> Paginator
             // So it is likely res.data.data.data
             const list = resItems.data.data.data || resItems.data.data || []
             optItems.value = list.filter(i => i.status_barang === 'Ada')
        }
        if(resPegawai.data.data) {
             // Pegawai response is custom JSON: { success: true, data: [...] }
             // So it is res.data.data directly
             optPegawai.value = resPegawai.data.data || []
        }
    } catch(e) { console.error('Gagal fetch options', e) }
}

const openModal = () => {
    resetForm()
    fetchOptions()
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const resetForm = () => {
    Object.assign(form, {
        peminjam: '',
        tlp: '',
        no_inventaris: '',
        tgl_pinjam: new Date().toISOString().split('T')[0],
        tgl_kembali: '',
        nip: '',
        status_pinjam: 'Masih Dipinjam'
    })
}

const saveData = async () => {
    processing.value = true
    try {
        await asetInventarisService.createPeminjaman(form)
        closeModal()
        fetchData()
    } catch(e) {
         alert('Gagal simpan: ' + (e.response?.data?.message || e.message))
    } finally {
        processing.value = false
    }
}

const returnItem = async (item) => {
    if(!confirm('Proses pengembalian barang ini?')) return
    try {
        const payload = { 
            peminjam: item.peminjam,
            no_inventaris: item.no_inventaris,
            tgl_pinjam: item.tgl_pinjam,
            nip: item.nip,
            tlp: item.tlp || '',
            status_pinjam: 'Sudah Kembali', 
            tgl_kembali: new Date().toISOString().split('T')[0] 
        }
        await asetInventarisService.updatePeminjaman(payload)
        fetchData()
    } catch(e) { alert('Gagal update: ' + (e.response?.data?.message || e.message)) }
}

const formatDate = (date) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('id-ID')
}

onMounted(() => fetchData())
</script>

<style scoped>
/* Reusing style */
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
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.table-responsive { overflow-x: auto; overflow-y: auto; max-height: 600px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; fontWeight: 600; color: #475569; position: sticky; top: 0; z-index: 10; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.status-badge { padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.bg-green-100 { background: #dcfce7; } .text-green-700 { color: #15803d; }
.bg-orange-100 { background: #ffedd5; } .text-orange-700 { color: #c2410c; }
.btn-sm { padding: 0.25rem 0.5rem; border-radius: 4px; border: none; font-size: 0.8rem; cursor: pointer; }
.bg-blue-500 { background: #3b82f6; } .text-white { color: white; }
.text-center { text-align: center; }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { background: white; border-radius: 10px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.text-hint { font-size: 0.75rem; color: #94a3b8; }
.text-red { color: #ef4444; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
