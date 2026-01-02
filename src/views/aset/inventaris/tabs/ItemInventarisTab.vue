<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
         <input 
            v-model="search" 
            @input="fetchData"
            type="text" 
            placeholder="Cari Item Inventaris (No Inventaris / Nama)..." 
            class="form-input"
          >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> Tambah Item
      </button>
    </div>

    <!-- Summary Card -->
    <div class="summary-wrapper" v-if="items.length > 0">
      <div class="summary-card">
        <div class="summary-item">
          <span class="label">Total Nilai Aset:</span>
          <span class="value">{{ formatCurrency(totalHarga) }}</span>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>No Inventaris</th>
            <th>Nama Barang</th>
            <th>Ruang & Box</th>
            <th>Asal & Tgl</th>
            <th>Harga</th>
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
            <tr v-else v-for="item in items" :key="item.no_inventaris">
              <td class="font-mono text-sm">{{ item.no_inventaris }}</td>
              <td class="font-semibold">{{ item.barang?.nama_barang || '(Barang Hapus)' }}</td>
              <td>
                <div class="text-sm">{{ item.ruang?.nama_ruang || '-' }}</div>
                <div class="text-xs text-slate-500">Rak: {{ item.no_rak }} | Box: {{ item.no_box }}</div>
              </td>
              <td>
                <div class="text-sm font-medium">{{ item.asal_barang }}</div>
                <div class="text-xs text-slate-500">{{ formatDate(item.tgl_pengadaan) }}</div>
              </td>
              <td class="font-medium">
                {{ formatCurrency(item.harga) }}
              </td>
              <td>
                <span class="status-badge" :class="statusClass(item.status_barang)">
                  {{ item.status_barang }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button @click="openStickerPreview(item)" class="btn-icon text-dark" title="Cetak Stiker">
                    <i class="fas fa-print"></i>
                  </button>
                  <button @click="editItem(item)" class="btn-icon text-blue"><i class="fas fa-pen"></i></button>
                  <button @click="deleteItem(item.no_inventaris)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} Item Inventaris</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>No Inventaris</label>
              <input v-model="form.no_inventaris" type="text" class="form-input" placeholder="Otomatis jika kosong" :disabled="isEdit">
              <small class="text-hint" v-if="!isEdit">Biarkan kosong untuk generate otomatis (INV...)</small>
            </div>
            
            <div class="form-group">
              <label>Barang <span class="text-red">*</span></label>
              <SearchableSelect 
                v-model="form.kode_barang" 
                :options="optBarang" 
                label-key="nama_barang" 
                value-key="kode_barang" 
                placeholder="Pilih Barang" 
                :disabled="isEdit"
              />
              <small class="text-hint" v-if="isEdit">Barang tidak bisa diubah saat edit</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ruang <span class="text-red">*</span></label>
                <SearchableSelect 
                  v-model="form.id_ruang" 
                  :options="optRuang" 
                  label-key="nama_ruang" 
                  value-key="id_ruang" 
                  placeholder="Pilih Ruang" 
                />
              </div>
              <div class="form-group">
                <label>Status <span class="text-red">*</span></label>
                 <select v-model="form.status_barang" class="form-select" required>
                    <option value="Ada">Ada</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Hilang">Hilang</option>
                 </select>
              </div>
            </div>

            <div class="form-row">
               <div class="form-group">
                 <label>No Rak</label>
                 <input v-model="form.no_rak" type="text" class="form-input">
               </div>
               <div class="form-group">
                 <label>No Box</label>
                 <input v-model="form.no_box" type="text" class="form-input">
               </div>
            </div>

             <div class="form-row">
               <div class="form-group">
                 <label>Harga Perolehan</label>
                 <div class="input-group">
                    <span class="prefix">Rp</span>
                    <input v-model="form.harga" type="number" class="form-input" min="0">
                 </div>
               </div>
               <div class="form-group">
                 <label>Tgl Pengadaan</label>
                 <input v-model="form.tgl_pengadaan" type="date" class="form-input">
               </div>
            </div>

            <div class="form-group">
              <label>Asal Barang</label>
               <select v-model="form.asal_barang" class="form-select">
                  <option value="Beli">Beli</option>
                  <option value="Hibah">Hibah</option>
                  <option value="Produksi Sendiri">Produksi Sendiri</option>
               </select>
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
    <div v-if="showStickerModal" class="modal-overlay" @click.self="closeStickerModal">
      <div class="modal-content sticker-modal-content">
        <div class="modal-header">
           <h3>Cetak Stiker Aset</h3>
           <button @click="closeStickerModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body flex-center">
             <div class="sticker-preview-box">
                <div class="s-header">RSIA Aisyiyah Pekajangan</div>
                <div class="s-body">
                   <div class="s-qr">
                      <img v-if="qrCodeUrl" :src="qrCodeUrl" class="qr-code" />
                   </div>
                   <div class="s-info">
                      <div class="s-label">No. Inventaris</div>
                      <div class="s-kode">{{ selectedStickerItem.no_inventaris }}</div>
                      <div class="s-nama">{{ selectedStickerItem.barang?.nama_barang }}</div>
                   </div>
                </div>
                <div class="s-footer">
                   <span>{{ formatDate(selectedStickerItem.tgl_pengadaan) }}</span>
                   <span>{{ selectedStickerItem.ruang?.nama_ruang }}</span>
                </div>
             </div>
             <p class="mt-2 text-muted text-center">Preview Stiker (65mm x 40mm)</p>
        </div>
        <div class="modal-footer">
           <button @click="closeStickerModal" class="btn-cancel">Tutup</button>
           <button @click="confirmPrint" class="btn-save"><i class="fas fa-print"></i> Cetak Sekarang</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, nextTick } from 'vue'
import { asetInventarisService } from '@/services/asetInventarisService'
import { asetMasterService } from '@/services/asetMasterService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import QRCode from 'qrcode'

const items = ref([])
const loading = ref(false)
const search = ref('')

// Sticker State
const showStickerModal = ref(false)
const selectedStickerItem = ref({})
const qrCodeUrl = ref('')

// CRUD Form State
const showModal = ref(false)
const isEdit = ref(false)
const processing = ref(false)
const form = reactive({
    no_inventaris: '',
    kode_barang: '',
    id_ruang: '',
    status_barang: 'Ada',
    no_rak: '',
    no_box: '',
    harga: 0,
    tgl_pengadaan: '',
    asal_barang: 'Beli'
})

// Options
const optBarang = ref([])
const optRuang = ref([])

const totalHarga = computed(() => {
  return items.value.reduce((sum, item) => sum + (Number(item.harga) || 0), 0)
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetInventarisService.getInventaris({ search: search.value, limit: 100 })
    if (res.data.data) {
        items.value = res.data.data.data
        if (optBarang.value.length === 0) fetchOptions()
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
    try {
        const [resBarang, resRuang] = await Promise.all([
            asetInventarisService.getBarang({ limit: 1000 }), // Get master barang
            asetMasterService.getRuang({ limit: 1000 })
        ])
         optBarang.value = resBarang.data.data.data || []
         optRuang.value = resRuang.data.data.data || []
    } catch(e) { console.error('Gagal fetch options', e) }
}

const openModal = () => {
    isEdit.value = false
    resetForm()
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const editItem = (item) => {
    isEdit.value = true
    Object.assign(form, {
        no_inventaris: item.no_inventaris,
        kode_barang: item.kode_barang,
        id_ruang: item.id_ruang,
        status_barang: item.status_barang,
        no_rak: item.no_rak,
        no_box: item.no_box,
        harga: item.harga,
        tgl_pengadaan: item.tgl_pengadaan,
        asal_barang: item.asal_barang
    })
    showModal.value = true
}

const resetForm = async () => {
    // Generate Suggestion ID: I + 9 digits (I000000001)
    let nextNum = 1
    
    // Fetch specifically the last item by no_inventaris desc
    try {
        const res = await asetInventarisService.getInventaris({ 
            limit: 1, 
            sort_by: 'no_inventaris', 
            order: 'desc' 
        })
        
        if (res.data.data) {
             // Handle if data wrapped in paginator
             const list = res.data.data.data || res.data.data || []
             if (list.length > 0) {
                 const lastItem = list[0]
                 // Match format I + 9 digits
                 if (lastItem.no_inventaris && /^I\d+$/.test(lastItem.no_inventaris)) {
                     // Extract number part
                     const numPart = lastItem.no_inventaris.replace('I', '')
                     nextNum = parseInt(numPart, 10) + 1
                 }
            }
        }
    } catch (e) {
        console.error('Failed to fetch max ID for suggestion', e)
    }

    const nextId = 'I' + nextNum.toString().padStart(9, '0')

    Object.assign(form, {
        no_inventaris: nextId,
        kode_barang: '',
        id_ruang: '',
        status_barang: 'Ada',
        no_rak: '',
        no_box: '',
        harga: 0,
        tgl_pengadaan: new Date().toISOString().split('T')[0],
        asal_barang: 'Beli'
    })
}

const saveData = async () => {
    processing.value = true
    try {
        if (isEdit.value) {
            await asetInventarisService.updateInventaris(form.no_inventaris, form)
        } else {
             if (!form.no_inventaris) {
                 const nextId = 'INV' + Date.now().toString().slice(-8)
                 form.no_inventaris = nextId
            }
            await asetInventarisService.createInventaris(form)
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
    if(!confirm('Hapus item inventaris ini?')) return
    try {
        await asetInventarisService.deleteInventaris(id)
        fetchData()
    } catch(e) { alert('Gagal hapus') }
}

const openStickerPreview = async (item) => {
  selectedStickerItem.value = item
  showStickerModal.value = true
  try {
    qrCodeUrl.value = await QRCode.toDataURL(item.no_inventaris, { width: 120, margin: 0 })
  } catch (err) {
    console.error(err)
  }
}

const closeStickerModal = () => {
  showStickerModal.value = false
  selectedStickerItem.value = {}
  qrCodeUrl.value = ''
}

const confirmPrint = () => {
    const item = selectedStickerItem.value
    const qr = qrCodeUrl.value
    const w = window.open('', '_blank', 'width=400,height=300')
    w.document.write(`
      <html>
        <head>
          <title>Stiker ${item.no_inventaris}</title>
          <style>
            @page { size: 65mm 40mm; margin: 0; }
            body { 
              width: 65mm; height: 40mm; margin: 0; padding: 0; 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              box-sizing: border-box; overflow: hidden;
              border: 1px dotted #ccc; /* Preview border */
            }
            .sticker-container {
              width: 100%; height: 100%;
              display: flex; flex-direction: column;
              border: 1px solid #000;
              box-sizing: border-box;
            }
            .header { 
              background: #000; color: #fff; 
              text-align: center; font-size: 7.5pt; font-weight: 800; 
              padding: 2px 0; text-transform: uppercase;
              -webkit-print-color-adjust: exact;
            }
            .body-wrap {
              flex: 1; display: flex; align-items: center; padding: 1mm 2mm; gap: 2mm;
            }
            .qr-box { 
              width: 22mm; height: 22mm; 
              display: flex; justify-content: center; align-items: center;
              border: 1px solid #000; border-radius: 4px; padding: 1mm;
            }
            .qr-img { width: 100%; height: 100%; object-fit: contain; }
            .info-box { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .kode-label { font-size: 6pt; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
            .kode { font-size: 11pt; font-weight: 900; margin-bottom: 2px; font-family: monospace; letter-spacing: -0.5px; }
            .nama { font-size: 8pt; line-height: 1.1; font-weight: 600; max-height: 24px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
            .footer { 
              border-top: 1px solid #000; padding: 2px 3mm; 
              font-size: 6.5pt; font-weight: 600;
              display: flex; justify-content: space-between;
              background: #f0f0f0;
              -webkit-print-color-adjust: exact;
            }
            @media print {
              body { border: none; }
              .header { background: #000 !important; color: #fff !important; }
              .footer { background: #eee !important; }
            }
          </style>
        </head>
        <body>
          <div class="sticker-container">
            <div class="header">RSIA Aisyiyah Pekajangan</div>
            <div class="body-wrap">
               <div class="qr-box">
                  <img src="${qr}" class="qr-img" />
               </div>
               <div class="info-box">
                  <div class="kode-label">No. Inventaris</div>
                  <div class="kode">${item.no_inventaris}</div>
                  <div class="nama">${item.barang?.nama_barang || ''}</div>
               </div>
            </div>
            <div class="footer">
              <span>${item.tgl_pengadaan || '-'}</span>
              <span>${item.ruang?.nama_ruang || 'Gudang'}</span>
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `)
    w.document.close()
}

const formatDate = (date) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('id-ID')
}

const formatCurrency = (val) => {
    if (!val) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
}

const statusClass = (status) => {
    switch(status) {
        case 'Ada': return 'bg-green-100 text-green-700'
        case 'Rusak': return 'bg-red-100 text-red-700'
        case 'Hilang': return 'bg-gray-100 text-gray-700'
        case 'Dipinjam': return 'bg-orange-100 text-orange-700'
        default: return 'bg-slate-100 text-slate-700'
    }
}

onMounted(() => fetchData())
</script>

<style scoped>
/* Reusing style */
.header-action { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.search-box { flex: 1; max-width: 300px; }
.form-input { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.form-select { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.table-responsive { overflow-x: auto; overflow-y: auto; max-height: 600px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; fontWeight: 600; color: #475569; position: sticky; top: 0; z-index: 10; }

.font-mono { font-family: monospace; }
.text-sm { font-size: 0.85rem; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }

.status-badge { padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.bg-green-100 { background: #dcfce7; } .text-green-700 { color: #15803d; }
.bg-red-100 { background: #fee2e2; } .text-red-700 { color: #b91c1c; }
.bg-gray-100 { background: #f3f4f6; } .text-gray-700 { color: #374151; }
.bg-orange-100 { background: #ffedd5; } .text-orange-700 { color: #c2410c; }
.bg-slate-100 { background: #f1f5f9; } .text-slate-700 { color: #334155; }

.action-group { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-dark { color: #334155; }
.text-center { text-align: center; }

.summary-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.summary-card {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: inline-flex;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.summary-item .label { font-size: 0.9rem; color: #64748b; font-weight: 500; }
.summary-item .value { font-size: 1.1rem; color: #1e293b; font-weight: 700; }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { background: white; border-radius: 10px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.sticker-modal-content { max-width: 400px; }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }

.flex-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.bg-gray-100 { background-color: #f3f4f6; }
.mt-2 { margin-top: 0.5rem; }
.text-muted { color: #94a3b8; font-size: 0.8rem; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.text-hint { font-size: 0.75rem; color: #94a3b8; }
.text-red { color: #ef4444; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

.input-group { display: flex; align-items: center; }
.input-group .prefix { padding: 0.6rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-right: none; border-top-left-radius: 6px; border-bottom-left-radius: 6px; color: #64748b; font-size: 0.85rem; }
.input-group input { border-top-left-radius: 0; border-bottom-left-radius: 0; flex: 1; }

/* Sticker Preview Box */
.sticker-preview-box {
  width: 65mm;
  height: 40mm;
  background: white;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
  overflow: hidden;
  position: relative;
}
.s-header { 
  background: #1e293b; color: white;
  text-align: center; font-size: 0.65rem; font-weight: 800; 
  padding: 2px 0; text-transform: uppercase;
}
.s-body {
  flex: 1; display: flex; align-items: center; padding: 2mm 3mm; gap: 3mm;
  background: white;
}
.s-qr { 
  width: 18mm; height: 18mm; 
  border: 1px solid #cbd5e1; border-radius: 4px; padding: 1mm;
  display: flex; justify-content: center; align-items: center;
}
.qr-code { width: 100%; height: 100%; object-fit: contain; }
.s-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.s-label { font-size: 0.5rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.s-kode { font-size: 0.9rem; font-weight: 900; color: #0f172a; margin-bottom: 1px; font-family: monospace; letter-spacing: -0.5px; }
.s-nama { font-size: 0.65rem; line-height: 1.1; font-weight: 600; color: #1e293b; max-height: 22px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.s-footer { 
  background: #f8fafc; border-top: 1px solid #e2e8f0;
  padding: 2px 3mm; font-size: 0.55rem; font-weight: 600; color: #475569;
  display: flex; justify-content: space-between;
}
</style>
