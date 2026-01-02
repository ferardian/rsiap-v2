<template>
  <div class="tab-container">
    <div class="header-action">
      <div class="search-box">
        <input 
          v-model="search" 
          @input="fetchData"
          type="text" 
          placeholder="Cari No Pemeliharaan / Uraian..." 
          class="form-input"
        >
      </div>
      <button @click="openModal" class="btn-add">
        <i class="fas fa-plus"></i> Tambah Pemeliharaan Gedung
      </button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>No Pemeliharaan</th>
            <th>Tanggal</th>
            <th>Uraian Kegiatan</th>
            <th>Jenis Pemeliharaan</th>
            <th>Pelaksana</th>
            <th>Biaya</th>
            <th>Tindak Lanjut</th>
            <th width="100">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center">Memuat...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="8" class="text-center">Data kosong</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.no_pemeliharaan">
            <td class="font-mono">{{ item.no_pemeliharaan }}</td>
            <td>{{ formatDate(item.tanggal) }}</td>
            <td>{{ item.uraian_kegiatan }}</td>
            <td><span class="badge-jenis">{{ item.jenis_pemeliharaan }}</span></td>
            <td>
              <div class="text-sm">{{ item.pelaksana }}</div>
              <div class="text-xs text-slate-500">{{ item.petugas?.nama || '-' }}</div>
            </td>
            <td>{{ formatCurrency(item.biaya) }}</td>
            <td class="max-w-xs">{{ item.tindak_lanjut }}</td>
            <td>
              <div class="action-group">
                <button @click="editItem(item)" class="btn-icon text-blue"><i class="fas fa-edit"></i></button>
                <button @click="deleteItem(item.no_pemeliharaan)" class="btn-icon text-red"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} Pemeliharaan Gedung</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>No Pemeliharaan <span class="text-red">*</span></label>
              <input v-model="form.no_pemeliharaan" type="text" class="form-input" :disabled="isEdit" required placeholder="Auto-generate jika kosong">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tanggal <span class="text-red">*</span></label>
                <input v-model="form.tanggal" type="date" class="form-input" required>
              </div>
              <div class="form-group">
                <label>Biaya</label>
                <input v-model.number="form.biaya" type="number" class="form-input" min="0">
              </div>
            </div>

            <div class="form-group">
              <label>Uraian Kegiatan <span class="text-red">*</span></label>
              <textarea v-model="form.uraian_kegiatan" class="form-textarea" rows="3" required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Jenis Pemeliharaan <span class="text-red">*</span></label>
                <select v-model="form.jenis_pemeliharaan" class="form-select" required>
                  <option value="Running Maintenance">Running Maintenance</option>
                  <option value="Shut Down Maintenance">Shut Down Maintenance</option>
                  <option value="Emergency Maintenance">Emergency Maintenance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Pelaksana <span class="text-red">*</span></label>
                <select v-model="form.pelaksana" class="form-select" required>
                  <option value="Teknisi Rumah Sakit">Teknisi Rumah Sakit</option>
                  <option value="Pihak ke III">Pihak ke III</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Petugas (NIP)</label>
              <SearchableSelect 
                v-model="form.nip" 
                :options="formattedOptPetugas" 
                label-key="label" 
                value-key="nip" 
                placeholder="Pilih Petugas" 
              />
            </div>

            <div class="form-group">
              <label>Tindak Lanjut <span class="text-red">*</span></label>
              <input v-model="form.tindak_lanjut" type="text" class="form-input" required>
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
import SearchableSelect from '@/components/ui/SearchableSelect.vue'

const items = ref([])
const loading = ref(false)
const search = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const processing = ref(false)

const form = reactive({
    no_pemeliharaan: '',
    tanggal: '',
    uraian_kegiatan: '',
    nip: '',
    pelaksana: 'Teknisi Rumah Sakit',
    biaya: 0,
    jenis_pemeliharaan: 'Running Maintenance',
    tindak_lanjut: ''
})

const optPetugas = ref([])

const formattedOptPetugas = computed(() => {
    return optPetugas.value.map(p => ({
        ...p,
        label: `${p.nip} - ${p.nama}`
    }))
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetPemeliharaanService.getPemeliharaanGedung({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const fetchOptions = async () => {
    try {
        const resPetugas = await import('@/services/pegawaiService').then(m => m.pegawaiService.getPegawai(1, 1000))
        if(resPetugas.data.data) {
            optPetugas.value = resPetugas.data.data || []
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
        no_pemeliharaan: item.no_pemeliharaan,
        tanggal: item.tanggal,
        uraian_kegiatan: item.uraian_kegiatan,
        nip: item.nip,
        pelaksana: item.pelaksana,
        biaya: item.biaya,
        jenis_pemeliharaan: item.jenis_pemeliharaan,
        tindak_lanjut: item.tindak_lanjut
    })
    fetchOptions()
    showModal.value = true
}

const resetForm = async () => {
    // Generate No Pemeliharaan: PG + YYYYMMDD + 001
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}${mm}${dd}`
    const prefix = `PG${dateStr}`
    
    let nextSeq = 1
    
    try {
        const res = await asetPemeliharaanService.getPemeliharaanGedung({ 
            limit: 1, 
            sort_by: 'no_pemeliharaan', 
            order: 'desc',
            search: prefix
        })
        
        if (res.data.data) {
             const list = res.data.data.data || res.data.data || []
             if (list.length > 0) {
                 const lastItem = list[0]
                 if (lastItem.no_pemeliharaan && lastItem.no_pemeliharaan.startsWith(prefix)) {
                     const seqPart = lastItem.no_pemeliharaan.substring(prefix.length)
                     nextSeq = parseInt(seqPart, 10) + 1
                 }
            }
        }
    } catch(e) {
        console.error('Gagal generate no pemeliharaan', e)
    }
    
    const nextNo = `${prefix}${String(nextSeq).padStart(3, '0')}`

    Object.assign(form, {
        no_pemeliharaan: nextNo,
        tanggal: today.toISOString().split('T')[0],
        uraian_kegiatan: '',
        nip: '',
        pelaksana: 'Teknisi Rumah Sakit',
        biaya: 0,
        jenis_pemeliharaan: 'Running Maintenance',
        tindak_lanjut: ''
    })
}

const saveData = async () => {
    processing.value = true
    try {
        if (isEdit.value) {
            await asetPemeliharaanService.updatePemeliharaanGedung(form.no_pemeliharaan, form)
        } else {
            await asetPemeliharaanService.createPemeliharaanGedung(form)
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
    if(!confirm('Hapus data pemeliharaan gedung ini?')) return
    try {
        await asetPemeliharaanService.deletePemeliharaanGedung(id)
        fetchData()
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

onMounted(() => fetchData())
</script>

<style scoped>
.header-action { display: flex; justify-content: space-between; margin-bottom: 1rem; }
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
.max-w-xs { max-width: 20rem; }

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
