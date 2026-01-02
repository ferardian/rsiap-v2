<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
         <input 
            v-model="search" 
            @input="fetchData"
            type="text" 
            placeholder="Cari Master Barang..." 
            class="form-input"
          >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> Tambah Master Barang
      </button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>Detail</th>
            <th>Merk/Prod</th>
            <th>Kat/Jenis</th>
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
            <tr v-else v-for="item in items" :key="item.kode_barang">
              <td>{{ item.kode_barang }}</td>
              <td class="font-semibold">{{ item.nama_barang }}</td>
              <td>
                <div class="text-xs text-slate-500">Jml: {{ item.jml_barang || 0 }}</div>
                <div class="text-xs text-slate-500">{{ item.thn_produksi ? 'Thn: '+item.thn_produksi : '' }}</div>
              </td>
              <td>
                <div class="text-xs text-slate-500">Merk: {{ item.merk?.nama_merk || '-' }}</div>
                <div class="text-xs text-slate-500">Prod: {{ item.produsen?.nama_produsen || '-' }}</div>
              </td>
              <td>
                <div class="badge blue">{{ item.kategori?.nama_kategori || '-' }}</div>
                <div class="text-xs text-slate-500">{{ item.jenis?.nama_jenis || '-' }}</div>
              </td>
               <td>
                <div class="action-group">
                  <button class="btn-icon text-blue" @click="editItem(item)"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon text-red" @click="deleteItem(item.kode_barang)"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} Master Barang</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>Kode Barang</label>
              <input v-model="form.kode_barang" type="text" class="form-input" placeholder="Otomatis jika kosong" :disabled="isEdit">
              <small class="text-hint" v-if="!isEdit">Biarkan kosong untuk generate otomatis (KB...)</small>
            </div>
            <div class="form-group">
              <label>Nama Barang <span class="text-red">*</span></label>
              <input v-model="form.nama_barang" type="text" class="form-input" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Merk</label>
                <SearchableSelect 
                  v-model="form.id_merk" 
                  :options="optMerk" 
                  label-key="nama_merk" 
                  value-key="id_merk" 
                  placeholder="Pilih Merk" 
                />
              </div>
              <div class="form-group">
                <label>Produsen</label>
                <SearchableSelect 
                  v-model="form.kode_produsen" 
                  :options="optProdusen" 
                  label-key="nama_produsen" 
                  value-key="kode_produsen" 
                  placeholder="Pilih Produsen" 
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Kategori</label>
                <SearchableSelect 
                  v-model="form.id_kategori" 
                  :options="optKategori" 
                  label-key="nama_kategori" 
                  value-key="id_kategori" 
                  placeholder="Pilih Kategori" 
                />
              </div>
              <div class="form-group">
                <label>Jenis</label>
                <SearchableSelect 
                  v-model="form.id_jenis" 
                  :options="optJenis" 
                  label-key="nama_jenis" 
                  value-key="id_jenis" 
                  placeholder="Pilih Jenis" 
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tahun Produksi</label>
                <input v-model="form.thn_produksi" type="number" class="form-input" placeholder="YYYY">
              </div>
              <div class="form-group">
                <label>ISBN</label>
                <input v-model="form.isbn" type="text" class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label>Jumlah Barang</label>
              <input v-model="form.jml_barang" type="number" class="form-input" readonly title="Jumlah dihitung dari item inventaris">
              <small class="text-hint">Jumlah otomatis update dari item inventaris</small>
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
import { ref, onMounted, reactive } from 'vue'
import { asetInventarisService } from '@/services/asetInventarisService'
import { asetMasterService } from '@/services/asetMasterService'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const items = ref([])
const loading = ref(false)
const search = ref('')

// Modal state
const showModal = ref(false)
const isEdit = ref(false)
const processing = ref(false)

const form = reactive({
    kode_barang: '',
    nama_barang: '',
    id_merk: '',
    kode_produsen: '',
    id_kategori: '',
    id_jenis: '',
    thn_produksi: '',
    isbn: '',
    jml_barang: 0
})

// Options
const optMerk = ref([])
const optProdusen = ref([])
const optKategori = ref([])
const optJenis = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetInventarisService.getBarang({ search: search.value, limit: 100 })
    if (res.data.data) {
        items.value = res.data.data.data
        // Fetch options only once
        if (optMerk.value.length === 0) fetchOptions()
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
    try {
        const [resMerk, resProd, resKat, resJen] = await Promise.all([
            asetMasterService.getMerk({ limit: 1000 }),
            asetMasterService.getProdusen({ limit: 1000 }),
            asetMasterService.getKategori({ limit: 1000 }),
            asetMasterService.getJenis({ limit: 1000 }),
        ])
        if(resMerk.data.data) optMerk.value = resMerk.data.data.data
        if(resProd.data.data) optProdusen.value = resProd.data.data.data
        if(resKat.data.data) optKategori.value = resKat.data.data.data
        if(resJen.data.data) optJenis.value = resJen.data.data.data
    } catch (e) { console.error('Gagal ambil options', e)}
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
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        id_merk: item.id_merk,
        kode_produsen: item.kode_produsen,
        id_kategori: item.id_kategori,
        id_jenis: item.id_jenis,
        thn_produksi: item.thn_produksi,
        isbn: item.isbn,
        jml_barang: item.jml_barang
    })
    showModal.value = true
}

const resetForm = async () => {
    // Generate Suggestion ID: BI + 8 digits (BI00000001)
    let nextNum = 1
    
    // Fetch specifically the last item by kode_barang desc
    try {
        const res = await asetInventarisService.getBarang({ 
            limit: 1, 
            sort_by: 'kode_barang', 
            order: 'desc' 
        })
        
        if (res.data.data && res.data.data.data.length > 0) {
            const lastItem = res.data.data.data[0]
            if (lastItem.kode_barang && /^BI\d+$/.test(lastItem.kode_barang)) {
                nextNum = parseInt(lastItem.kode_barang.replace('BI', ''), 10) + 1
            }
        }
    } catch (e) {
        console.error('Failed to fetch max ID for suggestion', e)
    }

    // Pad with zeros to length 8
    const nextId = 'BI' + nextNum.toString().padStart(8, '0')
    
    Object.assign(form, {
        kode_barang: nextId,
        nama_barang: '',
        id_merk: '',
        kode_produsen: '',
        id_kategori: '',
        id_jenis: '',
        thn_produksi: '',
        isbn: '',
        jml_barang: 0
    })
}

const saveData = async () => {
    processing.value = true
    try {
        if (isEdit.value) {
            await asetInventarisService.updateBarang(form.kode_barang, form)
        } else {
            // Auto-gen ID logic simple usually backend handles or we allow empty
            if (!form.kode_barang) {
                 // Should generate? Let's check existing or assume backend handles.
                 // Backend usually needs it. Let's simple gen.
                 const nextId = 'KB' + Date.now().toString().slice(-6)
                 form.kode_barang = nextId
            }
            await asetInventarisService.createBarang(form)
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
    if(!confirm('Hapus master barang ini?')) return
    try {
        await asetInventarisService.deleteBarang(id)
        fetchData()
    } catch(e) { alert('Gagal hapus') }
}

onMounted(() => fetchData())
</script>

<style scoped>
.header-action { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.search-box { flex: 1; max-width: 300px; }
.form-input { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.form-select { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; }
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

.table-responsive { overflow-x: auto; overflow-y: auto; max-height: 600px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; font-weight: 600; color: #475569; position: sticky; top: 0; z-index: 10; }

.font-semibold { font-weight: 600; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.badge.blue { background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; display: inline-block; }
.action-group { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; }
.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-center { text-align: center; }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { background: white; border-radius: 10px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.text-hint { font-size: 0.75rem; color: #94a3b8; }
.text-red { color: #ef4444; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #334155; }
.btn-save { background: #3b82f6; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: white; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
