<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
         <input 
            v-model="search" 
            @input="fetchData"
            type="text" 
            placeholder="Cari No Hibah..." 
            class="form-input"
          >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> {{ isMobile ? 'Hibah' : 'Input Hibah' }}
      </button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>No Hibah</th>
            <th>Tanggal</th>
            <th>Pemberi</th>
            <th>Total Hibah</th>
            <th>Jml Item</th>
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
             <tr v-else v-for="item in items" :key="item.no_hibah">
              <td class="font-mono">{{ item.no_hibah }}</td>
              <td>{{ formatDate(item.tgl_hibah) }}</td>
              <td>
                <div class="font-medium">{{ item.kode_pemberi || '-' }}</div>
                <div class="text-xs text-slate-500">NIP: {{ item.nip }}</div>
              </td>
              <td class="font-bold">{{ formatCurrency(item.totalhibah) }}</td>
              <td>{{ item.detail?.length || 0 }} Item</td>
               <td>
                <div class="action-group">
                  <button @click="viewDetail(item)" class="btn-icon text-blue"><i class="fas fa-eye"></i></button>
                  <button @click="deleteItem(item.no_hibah)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>Input Hibah Barang</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <!-- Header Info -->
            <div class="form-row border-b pb-4 mb-4">
               <div class="form-group">
                 <label>No. Hibah <span class="text-red">*</span></label>
                 <input v-model="form.no_hibah" type="text" class="form-input" placeholder="Isi No. Hibah / Dokumen" required>
               </div>
               <div class="form-group">
                 <label>Tanggal Hibah</label>
                 <input v-model="form.tgl_hibah" type="date" class="form-input" required>
               </div>
               <div class="form-group">
                 <label>Pemberi Hibah</label>
                 <input v-model="form.kode_pemberi" type="text" class="form-input" placeholder="Nama Pemberi / Donatur">
               </div>
            </div>

            <!-- Details Table -->
            <div class="details-section">
               <div class="flex justify-between items-center mb-2">
                 <label class="font-bold">Item Hibah</label>
                 <button type="button" @click="addDetail" class="btn-sm bg-blue-500 text-white">
                    <i class="fas fa-plus"></i> Tambah Item
                 </button>
               </div>
               <table class="w-full text-sm border">
                 <thead class="bg-gray-50">
                    <tr>
                       <th class="p-2 border">Barang</th>
                       <th class="p-2 border w-20">Jumlah</th>
                       <th class="p-2 border w-32">Harga Satuan</th>
                       <th class="p-2 border w-32">Subtotal</th>
                       <th class="p-2 border w-10"></th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr v-for="(det, idx) in form.details" :key="idx">
                       <td class="p-2 border">
                          <SearchableSelect 
                             v-model="det.kode_barang" 
                             :options="optBarang" 
                             label-key="nama_barang" 
                             value-key="kode_barang" 
                             placeholder="Pilih Barang" 
                          />
                       </td>
                       <td class="p-2 border">
                          <input v-model.number="det.jumlah" type="number" min="1" class="form-input text-sm text-center" @input="calcSubtotal(det)">
                       </td>
                       <td class="p-2 border">
                          <input v-model.number="det.h_hibah" type="number" min="0" class="form-input text-sm text-right" @input="calcSubtotal(det)">
                       </td>
                       <td class="p-2 border text-right font-medium">
                          {{ formatCurrency(det.subtotalhibah) }}
                       </td>
                       <td class="p-2 border text-center">
                          <button type="button" @click="removeDetail(idx)" class="text-red-500 hover:text-red-700">
                             <i class="fas fa-times"></i>
                          </button>
                       </td>
                    </tr>
                    <tr v-if="form.details.length === 0">
                       <td colspan="5" class="p-4 text-center text-gray-500">Belum ada item ditambahkan</td>
                    </tr>
                 </tbody>
                 <tfoot class="bg-gray-100 font-bold">
                    <tr>
                       <td colspan="3" class="p-2 text-right border">Total Nilai Hibah:</td>
                       <td class="p-2 text-right border">{{ formatCurrency(form.totalhibah) }}</td>
                       <td></td>
                    </tr>
                 </tfoot>
               </table>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="processing || form.details.length === 0">
              {{ processing ? 'Menyimpan...' : 'Simpan Transaksi' }}
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
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const props = defineProps({
  isMobile: Boolean
})

const items = ref([])
const loading = ref(false)
const search = ref('')

// Form State
const showModal = ref(false)
const processing = ref(false)
const form = reactive({
    no_hibah: '',
    tgl_hibah: '',
    kode_pemberi: '',
    nip: '', 
    kd_rek_aset: '',
    totalhibah: 0,
    details: []
})

// Options
const optBarang = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetInventarisService.getHibah({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
   try {
     const res = await asetInventarisService.getBarang({ limit: 1000 })
     if(res.data.data) optBarang.value = res.data.data.data
   } catch(e) { console.error('Gagal fetch barang', e)}
}

const openModal = () => {
    resetForm()
    fetchOptions()
    makeNewDetail() // Start with 1 row
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const makeNewDetail = () => {
    form.details.push({
        kode_barang: '',
        jumlah: 1,
        h_hibah: 0,
        subtotalhibah: 0
    })
}

const addDetail = () => makeNewDetail()

const removeDetail = (idx) => {
    form.details.splice(idx, 1)
    calcTotal()
}

const calcSubtotal = (det) => {
    det.subtotalhibah = (det.jumlah || 0) * (det.h_hibah || 0)
    calcTotal()
}

const calcTotal = () => {
    form.totalhibah = form.details.reduce((acc, curr) => acc + curr.subtotalhibah, 0)
}

const resetForm = async () => {
    // Generate No Hibah: HA + YYYYMMDD + 001
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}${mm}${dd}`
    const prefix = `HA${dateStr}`
    
    let nextSeq = 1
    
    try {
        // Fetch last hibah sorted by no_hibah desc
        const res = await asetInventarisService.getHibah({ 
            limit: 1, 
            sort_by: 'no_hibah', 
            order: 'desc',
            search: prefix // Filter to match current date prefix if possible
        })
        
        if (res.data.data) {
             const list = res.data.data.data || res.data.data || []
             if (list.length > 0) {
                 const lastItem = list[0]
                 // Check if it matches current prefix
                 if (lastItem.no_hibah && lastItem.no_hibah.startsWith(prefix)) {
                     const seqPart = lastItem.no_hibah.substring(prefix.length)
                     nextSeq = parseInt(seqPart, 10) + 1
                 }
            }
        }
    } catch(e) {
        console.error('Gagal generate no hibah', e)
    }
    
    const nextNoHibah = `${prefix}${String(nextSeq).padStart(3, '0')}`

    Object.assign(form, {
        no_hibah: nextNoHibah,
        tgl_hibah: today.toISOString().split('T')[0],
        kode_pemberi: '',
        nip: '',
        kd_rek_aset: '',
        totalhibah: 0,
        details: []
    })
}

const saveData = async () => {
    processing.value = true
    try {
        await asetInventarisService.createHibah(form)
        closeModal()
        fetchData()
    } catch(e) {
        alert('Gagal simpan: ' + (e.response?.data?.message || e.message))
    } finally {
        processing.value = false
    }
}

const viewDetail = (item) => {
    // Ideally open a modal just to view details
    // For now simple alert list
    const detailStr = item.detail.map(d => `- ${d.barang?.nama_barang || d.kode_barang} (${d.jumlah} x ${formatCurrency(d.h_hibah)})`).join('\n')
    alert(`Detail Hibah ${item.no_hibah}:\n\n${detailStr}\n\nTotal: ${formatCurrency(item.totalhibah)}`)
}

const deleteItem = async (id) => {
     if(!confirm('Hapus data hibah ini?')) return
    try {
        await asetInventarisService.deleteHibah(id)
        fetchData()
    } catch(e) { alert('Gagal hapus') }
}

const formatDate = (date) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('id-ID')
}
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)

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
.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.85rem; }
.text-slate-500 { color: #64748b; }
.action-group { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { background: white; border-radius: 10px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; max-height: 90vh; }
.modal-lg { max-width: 800px; }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; overflow-y: auto; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.border-b { border-bottom: 1px solid #e2e8f0; }
.pb-4 { padding-bottom: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }

/* Tailwind-ish manual classes */
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.w-full { width: 100%; }
.border { border: 1px solid #e2e8f0; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.w-20 { width: 5rem; }
.w-32 { width: 8rem; }
.w-10 { width: 2.5rem; }
.text-red-500 { color: #ef4444; }
.hover\:text-red-700:hover { color: #b91c1c; }
.text-gray-500 { color: #6b7280; }

.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-sm { padding: 0.25rem 0.5rem; border-radius: 4px; border: none; font-size: 0.75rem; cursor: pointer; }
.bg-blue-500 { background: #3b82f6; } .text-white { color: white; }
</style>
