<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
         <input 
            v-model="search" 
            @input="fetchData"
            type="text" 
            placeholder="Cari No Permintaan..." 
            class="form-input"
          >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> {{ isMobile ? 'Tiket' : 'Buat Tiket Perbaikan' }}
      </button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>No Permintaan</th>
            <th>Tanggal</th>
            <th>Inventaris</th>
            <th>Pelapor</th>
            <th>Deskripsi Kerusakan</th>
            <th>Status</th>
            <th width="100">Aksi</th>
          </tr>
        </thead>
        <tbody>
           <tr v-if="loading">
              <td colspan="7" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="item in items" :key="item.no_permintaan">
              <td class="font-mono">{{ item.no_permintaan }}</td>
              <td>{{ formatDate(item.tanggal) }}</td>
              <td>
                <div class="font-medium">{{ item.inventaris?.barang?.nama_barang || '-' }}</div>
                <div class="text-xs text-slate-500 font-mono">{{ item.no_inventaris }}</div>
              </td>
              <td>
                <div class="font-medium">{{ item.pegawai?.nama || '-' }}</div>
                <div class="text-xs text-slate-500">{{ item.nik }}</div>
              </td>
              <td class="max-w-xs">{{ item.deskripsi_kerusakan }}</td>
              <td>
                <span v-if="item.perbaikan_inventaris" class="status-badge bg-green-100 text-green-700">
                  Sudah Diperbaiki
                </span>
                <span v-else class="status-badge bg-orange-100 text-orange-700">
                  Menunggu Perbaikan
                </span>
              </td>
               <td>
                <div class="action-group">
                  <button @click="editItem(item)" class="btn-icon text-blue"><i class="fas fa-edit"></i></button>
                  <button @click="deleteItem(item.no_permintaan)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Buat' }} Tiket Perbaikan</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>No Permintaan <span class="text-red">*</span></label>
              <input v-model="form.no_permintaan" type="text" class="form-input" :disabled="isEdit" required placeholder="Auto-generate jika kosong">
            </div>
            
            <div class="form-group">
              <label>Item Inventaris</label>
              <SearchableSelect 
                v-model="form.no_inventaris" 
                :options="formattedOptInventaris" 
                label-key="label" 
                value-key="no_inventaris" 
                placeholder="Pilih Item Inventaris" 
              />
            </div>

            <div class="form-group">
              <label>Pelapor (NIK)</label>
              <SearchableSelect 
                v-model="form.nik" 
                :options="formattedOptPegawai" 
                label-key="label" 
                value-key="nik" 
                placeholder="Pilih Pegawai" 
              />
            </div>

            <div class="form-group">
              <label>Tanggal</label>
              <input v-model="form.tanggal" type="datetime-local" class="form-input">
            </div>

            <div class="form-group">
              <label>Deskripsi Kerusakan</label>
              <textarea v-model="form.deskripsi_kerusakan" class="form-textarea" rows="4" placeholder="Jelaskan kerusakan yang terjadi..."></textarea>
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
import { asetPemeliharaanService } from '@/services/asetPemeliharaanService'
import { asetInventarisService } from '@/services/asetInventarisService'
import { pegawaiService } from '@/services/pegawaiService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const props = defineProps({
  isMobile: Boolean
})

const items = ref([])
const loading = ref(false)
const search = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const processing = ref(false)

const form = reactive({
    no_permintaan: '',
    no_inventaris: '',
    nik: '',
    tanggal: '',
    deskripsi_kerusakan: ''
})

const optInventaris = ref([])
const optPegawai = ref([])

const formattedOptInventaris = computed(() => {
    return optInventaris.value.map(item => ({
        ...item,
        label: `${item.no_inventaris} - ${item.barang?.nama_barang || ''}`
    }))
})

const formattedOptPegawai = computed(() => {
    return optPegawai.value.map(p => ({
        ...p,
        nik: p.nik || p.id_user,
        label: `${p.nik || p.id_user || '-'} - ${p.nama}`
    }))
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetPemeliharaanService.getPermintaanPerbaikan({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
    try {
        const [resInv, resPeg] = await Promise.all([
            asetInventarisService.getInventaris({ limit: 1000 }),
            pegawaiService.getPegawai(1, 1000)
        ])
        if(resInv.data.data) {
            const list = resInv.data.data.data || resInv.data.data || []
            optInventaris.value = list
        }
        if(resPeg.data.data) {
            optPegawai.value = resPeg.data.data || []
        }
    } catch(e) { console.error('Gagal fetch options', e) }
}

const openModal = () => {
    isEdit.value = false
    resetForm()
    fetchOptions()
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const editItem = (item) => {
    isEdit.value = true
    Object.assign(form, {
        no_permintaan: item.no_permintaan,
        no_inventaris: item.no_inventaris,
        nik: item.nik,
        tanggal: item.tanggal ? item.tanggal.replace(' ', 'T').substring(0, 16) : '',
        deskripsi_kerusakan: item.deskripsi_kerusakan
    })
    fetchOptions()
    showModal.value = true
}

const resetForm = async () => {
    // Generate No Permintaan: PPI + YYYYMMDD + 001
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}${mm}${dd}`
    const prefix = `PPI${dateStr}`
    
    let nextSeq = 1
    
    try {
        const res = await asetPemeliharaanService.getPermintaanPerbaikan({ 
            limit: 1, 
            sort_by: 'no_permintaan', 
            order: 'desc',
            search: prefix
        })
        
        if (res.data.data) {
             const list = res.data.data.data || res.data.data || []
             if (list.length > 0) {
                 const lastItem = list[0]
                 if (lastItem.no_permintaan && lastItem.no_permintaan.startsWith(prefix)) {
                     const seqPart = lastItem.no_permintaan.substring(prefix.length)
                     nextSeq = parseInt(seqPart, 10) + 1
                 }
            }
        }
    } catch(e) {
        console.error('Gagal generate no permintaan', e)
    }
    
    const nextNo = `${prefix}${String(nextSeq).padStart(3, '0')}`

    Object.assign(form, {
        no_permintaan: nextNo,
        no_inventaris: '',
        nik: '',
        tanggal: today.toISOString().substring(0, 16),
        deskripsi_kerusakan: ''
    })
}

const saveData = async () => {
    processing.value = true
    try {
        if (isEdit.value) {
            await asetPemeliharaanService.updatePermintaanPerbaikan(form.no_permintaan, form)
        } else {
            await asetPemeliharaanService.createPermintaanPerbaikan(form)
        }
        closeModal()
        fetchData()
    } catch(e) {
        alert('Gagal simpan data: ' + (e.response?.data?.message || e.message))
    } finally {
        processing.value = false
    }
}

const deleteItem = async (id) => {
    if(!confirm('Hapus tiket perbaikan ini?')) return
    try {
        await asetPemeliharaanService.deletePermintaanPerbaikan(id)
        fetchData()
    } catch(e) { alert('Gagal hapus') }
}

const formatDate = (date) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('id-ID')
}

onMounted(() => fetchData())
</script>

<style scoped>
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
.form-textarea { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.table-responsive { overflow-x: auto; overflow-y: auto; max-height: 600px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; font-weight: 600; color: #475569; position: sticky; top: 0; z-index: 10; }

.font-mono { font-family: monospace; }
.font-medium { font-weight: 500; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.max-w-xs { max-width: 20rem; }

.status-badge { padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.bg-green-100 { background: #dcfce7; } .text-green-700 { color: #15803d; }
.bg-orange-100 { background: #ffedd5; } .text-orange-700 { color: #c2410c; }

.action-group { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-center { text-align: center; }

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
.text-red { color: #ef4444; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
